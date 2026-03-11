/**
 * Supabase Edge Function: tiktok-publish
 *
 * Processa publicação de vídeos no TikTok de forma segura (server-side).
 * Evita problemas de CORS fazendo chamadas à API do TikTok server-side.
 *
 * Endpoints:
 * - POST /user-info - Obtém informações do usuário TikTok
 * - POST /publish - Publica vídeo no TikTok
 *
 * Env vars necessárias (configurar no Supabase Dashboard):
 * - SUPABASE_URL (automático)
 * - SUPABASE_SERVICE_ROLE_KEY (automático)
 * - TIKTOK_CLIENT_KEY
 * - TIKTOK_CLIENT_SECRET
 *
 * Deploy: supabase functions deploy tiktok-publish
 */

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const TIKTOK_API_URL = 'https://open.tiktokapis.com/v2'
const TIKTOK_TOKEN_URL = 'https://open.tiktokapis.com/v2/oauth/token/'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

serve(async (req) => {
  // CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  if (req.method !== 'POST') {
    return new Response(
      JSON.stringify({ error: 'Method not allowed' }),
      { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }

  try {
    const url = new URL(req.url)
    const action = url.pathname.split('/').pop() // user-info ou publish

    // Criar cliente Supabase
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseKey)

    // Obter user do header Authorization
    const authHeader = req.headers.get('authorization') || req.headers.get('Authorization')

    if (!authHeader) {
      throw new Error('Authorization header required')
    }

    const token = authHeader.replace('Bearer ', '').replace('bearer ', '')
    const { data: { user }, error: userError } = await supabase.auth.getUser(token)

    if (userError || !user) {
      throw new Error('Usuário não autenticado')
    }

    // Buscar access_token do TikTok do banco
    const { data: stored, error: fetchError } = await supabase
      .from('social_tokens')
      .select('*')
      .eq('user_id', user.id)
      .eq('platform', 'tiktok')
      .single()

    if (fetchError || !stored?.access_token) {
      throw new Error('TikTok não conectado. Autorize o app primeiro.')
    }

    // Verificar se access_token expirou e renovar se necessário
    let tiktokAccessToken = stored.access_token
    const openId = stored.open_id
    const expiresAt = new Date(stored.expires_at)
    const now = new Date()
    const marginMs = 5 * 60 * 1000 // 5 minutos de margem

    if (expiresAt.getTime() - marginMs < now.getTime()) {
      console.log('[TikTok Publish] Token expirado ou próximo de expirar, renovando...')
      tiktokAccessToken = await refreshTikTokToken(supabase, user.id, stored.refresh_token)
    }

    if (action === 'user-info') {
      // ==================== GET USER INFO ====================
      console.log('[TikTok Publish] Buscando informações do usuário...')

      const userInfoResponse = await fetch(
        `${TIKTOK_API_URL}/user/info/?fields=open_id,union_id,avatar_url,display_name`,
        {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${tiktokAccessToken}`,
          },
        }
      )

      const userInfoData = await userInfoResponse.json()

      if (userInfoData.error?.code) {
        console.error('[TikTok Publish] Erro ao buscar usuário:', userInfoData.error)
        throw new Error(userInfoData.error.message || 'Erro ao buscar usuário')
      }

      console.log('[TikTok Publish] Usuário encontrado:', userInfoData.data?.user?.display_name)

      return new Response(
        JSON.stringify({
          success: true,
          user: userInfoData.data?.user || { open_id: openId },
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )

    } else if (action === 'publish') {
      // ==================== PUBLISH VIDEO (FILE_UPLOAD method) ====================
      const body = await req.json()
      const {
        videoUrl,
        title = '',
        privacyLevel = 'public_to_everyone',
        disableComment = false,
        disableDuet = false,
        disableStitch = false,
      } = body

      if (!videoUrl) {
        throw new Error('videoUrl é obrigatório')
      }

      console.log('[TikTok Publish] Iniciando publicação (FILE_UPLOAD):', { videoUrl, title, privacyLevel })

      // Mapear privacy level para formato TikTok
      const privacyMap: Record<string, string> = {
        'public': 'PUBLIC_TO_EVERYONE',
        'public_to_everyone': 'PUBLIC_TO_EVERYONE',
        'friends': 'MUTUAL_FOLLOW_FRIENDS',
        'mutual_follow_friends': 'MUTUAL_FOLLOW_FRIENDS',
        'private': 'SELF_ONLY',
        'self_only': 'SELF_ONLY',
      }

      const tiktokPrivacy = privacyMap[privacyLevel.toLowerCase()] || 'PUBLIC_TO_EVERYONE'

      // 1. Baixar o vídeo da URL (Supabase Storage ou qualquer URL pública)
      console.log('[TikTok Publish] Baixando vídeo de:', videoUrl)

      const videoResponse = await fetch(videoUrl)
      if (!videoResponse.ok) {
        throw new Error(`Erro ao baixar vídeo: ${videoResponse.status} ${videoResponse.statusText}`)
      }

      const videoBuffer = await videoResponse.arrayBuffer()
      const videoBytes = new Uint8Array(videoBuffer)
      const videoSize = videoBytes.length

      console.log('[TikTok Publish] Vídeo baixado, tamanho:', videoSize, 'bytes')

      // Validar tamanho mínimo (TikTok requer pelo menos alguns KB)
      if (videoSize < 1024) {
        throw new Error('Vídeo muito pequeno. Certifique-se de enviar um arquivo de vídeo válido.')
      }

      // 2. Definir chunk size (TikTok recomenda 5-10MB por chunk, máximo 64MB)
      const CHUNK_SIZE = 10 * 1024 * 1024 // 10MB
      const totalChunkCount = Math.ceil(videoSize / CHUNK_SIZE)

      console.log('[TikTok Publish] Chunks:', totalChunkCount, 'de', CHUNK_SIZE, 'bytes cada')

      // 3. Inicializar publicação com FILE_UPLOAD
      const initResponse = await fetch(
        `${TIKTOK_API_URL}/post/publish/video/init/`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${tiktokAccessToken}`,
            'Content-Type': 'application/json; charset=UTF-8',
          },
          body: JSON.stringify({
            post_info: {
              title: title.substring(0, 150), // TikTok limita a 150 chars
              privacy_level: tiktokPrivacy,
              disable_comment: disableComment,
              disable_duet: disableDuet,
              disable_stitch: disableStitch,
            },
            source_info: {
              source: 'FILE_UPLOAD',
              video_size: videoSize,
              chunk_size: CHUNK_SIZE,
              total_chunk_count: totalChunkCount,
            },
          }),
        }
      )

      const initData = await initResponse.json()

      if (initData.error?.code) {
        console.error('[TikTok Publish] Erro ao inicializar:', initData.error)
        throw new Error(initData.error.message || 'Erro ao inicializar publicação')
      }

      const publishId = initData.data?.publish_id
      const uploadUrl = initData.data?.upload_url

      if (!publishId || !uploadUrl) {
        console.error('[TikTok Publish] Resposta init:', initData)
        throw new Error('Falha ao obter publish_id ou upload_url')
      }

      console.log('[TikTok Publish] Publicação iniciada, publish_id:', publishId)
      console.log('[TikTok Publish] Upload URL obtida')

      // 4. Fazer upload em chunks
      for (let chunkIndex = 0; chunkIndex < totalChunkCount; chunkIndex++) {
        const start = chunkIndex * CHUNK_SIZE
        const end = Math.min(start + CHUNK_SIZE, videoSize)
        const chunk = videoBytes.slice(start, end)

        console.log(`[TikTok Publish] Enviando chunk ${chunkIndex + 1}/${totalChunkCount} (bytes ${start}-${end - 1})`)

        const uploadResponse = await fetch(uploadUrl, {
          method: 'PUT',
          headers: {
            'Content-Type': 'video/mp4',
            'Content-Length': chunk.length.toString(),
            'Content-Range': `bytes ${start}-${end - 1}/${videoSize}`,
          },
          body: chunk,
        })

        if (!uploadResponse.ok) {
          const errorText = await uploadResponse.text()
          console.error('[TikTok Publish] Erro no upload do chunk:', uploadResponse.status, errorText)
          throw new Error(`Erro no upload do chunk ${chunkIndex + 1}: ${uploadResponse.status}`)
        }

        console.log(`[TikTok Publish] Chunk ${chunkIndex + 1} enviado com sucesso`)
      }

      console.log('[TikTok Publish] Upload completo, aguardando processamento...')

      // 5. Aguardar processamento (polling)
      let status = 'PROCESSING'
      let attempts = 0
      const maxAttempts = 30 // 5 minutos (10s * 30)

      while (status === 'PROCESSING' && attempts < maxAttempts) {
        await new Promise(r => setTimeout(r, 10000)) // Aguardar 10 segundos

        const statusResponse = await fetch(
          `${TIKTOK_API_URL}/post/publish/status/fetch/`,
          {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${tiktokAccessToken}`,
              'Content-Type': 'application/json; charset=UTF-8',
            },
            body: JSON.stringify({ publish_id: publishId }),
          }
        )

        const statusData = await statusResponse.json()

        if (statusData.error?.code) {
          console.error('[TikTok Publish] Erro ao verificar status:', statusData.error)
          throw new Error(statusData.error.message || 'Erro ao verificar status')
        }

        status = statusData.data?.status || 'PROCESSING'
        console.log('[TikTok Publish] Status:', status, 'Attempt:', attempts + 1)

        if (status === 'PUBLISH_COMPLETE') {
          return new Response(
            JSON.stringify({
              success: true,
              publish_id: publishId,
              status: 'success',
            }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }

        if (status === 'FAILED') {
          const reason = statusData.data?.fail_reason || 'Falha desconhecida'
          throw new Error(`Publicação falhou: ${reason}`)
        }

        attempts++
      }

      // Se chegou aqui, timeout
      return new Response(
        JSON.stringify({
          success: true,
          publish_id: publishId,
          status: 'processing',
          message: 'Publicação em processamento. Verifique o TikTok em alguns minutos.',
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )

    } else {
      throw new Error(`Ação desconhecida: ${action}. Use /user-info ou /publish`)
    }

  } catch (err) {
    console.error('[TikTok Publish] Error:', err)
    return new Response(
      JSON.stringify({ error: err instanceof Error ? err.message : 'Erro interno' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})

/**
 * Renova access_token usando refresh_token
 */
async function refreshTikTokToken(supabase: any, userId: string, refreshToken: string): Promise<string> {
  const clientKey = Deno.env.get('TIKTOK_CLIENT_KEY')
  const clientSecret = Deno.env.get('TIKTOK_CLIENT_SECRET')

  if (!clientKey || !clientSecret) {
    throw new Error('TikTok não configurado no servidor')
  }

  console.log('[TikTok Publish] Renovando token...')

  const refreshResponse = await fetch(TIKTOK_TOKEN_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      client_key: clientKey,
      client_secret: clientSecret,
      refresh_token: refreshToken,
      grant_type: 'refresh_token',
    }),
  })

  const refreshData = await refreshResponse.json()

  if (refreshData.error) {
    console.error('[TikTok Publish] Erro ao renovar token:', refreshData)
    throw new Error(refreshData.error_description || refreshData.error)
  }

  // Atualizar tokens no banco
  const { error: updateError } = await supabase
    .from('social_tokens')
    .update({
      access_token: refreshData.access_token,
      refresh_token: refreshData.refresh_token,
      expires_at: new Date(Date.now() + refreshData.expires_in * 1000).toISOString(),
      refresh_expires_at: new Date(Date.now() + refreshData.refresh_expires_in * 1000).toISOString(),
      scope: refreshData.scope,
      updated_at: new Date().toISOString(),
    })
    .eq('user_id', userId)
    .eq('platform', 'tiktok')

  if (updateError) {
    console.error('[TikTok Publish] Erro ao salvar token renovado:', updateError)
    throw new Error('Erro ao salvar token renovado')
  }

  console.log('[TikTok Publish] Token renovado com sucesso!')
  return refreshData.access_token
}
