/**
 * Supabase Edge Function: youtube-publish
 *
 * Processa publicação de vídeos no YouTube de forma segura (server-side).
 * Suporta YouTube Shorts (vídeos verticais < 60 segundos com #Shorts).
 *
 * Endpoints:
 * - POST /user-info - Obtém informações do canal YouTube
 * - POST /publish - Publica vídeo no YouTube
 *
 * Env vars necessárias (configurar no Supabase Dashboard):
 * - SUPABASE_URL (automático)
 * - SUPABASE_SERVICE_ROLE_KEY (automático)
 * - YOUTUBE_CLIENT_ID
 * - YOUTUBE_CLIENT_SECRET
 *
 * Deploy: supabase functions deploy youtube-publish
 */

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const YOUTUBE_API_URL = 'https://www.googleapis.com/youtube/v3'
const YOUTUBE_UPLOAD_URL = 'https://www.googleapis.com/upload/youtube/v3/videos'
const GOOGLE_TOKEN_URL = 'https://oauth2.googleapis.com/token'

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

    // Buscar access_token do YouTube do banco
    const { data: stored, error: fetchError } = await supabase
      .from('social_tokens')
      .select('*')
      .eq('user_id', user.id)
      .eq('platform', 'youtube')
      .single()

    if (fetchError || !stored?.access_token) {
      throw new Error('YouTube não conectado. Autorize o app primeiro.')
    }

    // Verificar se access_token expirou e renovar se necessário
    let youtubeAccessToken = stored.access_token
    const expiresAt = new Date(stored.expires_at)
    const now = new Date()
    const marginMs = 5 * 60 * 1000 // 5 minutos de margem

    if (expiresAt.getTime() - marginMs < now.getTime()) {
      console.log('[YouTube Publish] Token expirado ou próximo de expirar, renovando...')
      youtubeAccessToken = await refreshYouTubeToken(supabase, user.id, stored.refresh_token)
    }

    if (action === 'user-info') {
      // ==================== GET USER/CHANNEL INFO ====================
      console.log('[YouTube Publish] Buscando informações do canal...')

      const channelResponse = await fetch(
        `${YOUTUBE_API_URL}/channels?part=snippet,statistics&mine=true`,
        {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${youtubeAccessToken}`,
          },
        }
      )

      const channelData = await channelResponse.json()

      if (channelData.error) {
        console.error('[YouTube Publish] Erro ao buscar canal:', channelData.error)
        throw new Error(channelData.error.message || 'Erro ao buscar canal')
      }

      const channel = channelData.items?.[0]

      if (!channel) {
        throw new Error('Nenhum canal YouTube encontrado para esta conta')
      }

      console.log('[YouTube Publish] Canal encontrado:', channel.snippet?.title)

      // Também buscar extra_data salvo (email, etc)
      let extraData = {}
      try {
        extraData = stored.extra_data ? JSON.parse(stored.extra_data) : {}
      } catch {
        extraData = {}
      }

      return new Response(
        JSON.stringify({
          success: true,
          channel: {
            id: channel.id,
            title: channel.snippet?.title,
            description: channel.snippet?.description,
            thumbnail: channel.snippet?.thumbnails?.default?.url,
            subscriberCount: channel.statistics?.subscriberCount,
            videoCount: channel.statistics?.videoCount,
          },
          email: extraData.email,
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )

    } else if (action === 'publish') {
      // ==================== PUBLISH VIDEO ====================
      const body = await req.json()
      const {
        videoUrl,
        title = '',
        description = '',
        tags = [],
        categoryId = '22', // People & Blogs (padrão)
        privacyStatus = 'private', // public, unlisted, private
        isShort = false, // Se true, adiciona #Shorts ao título
        notifySubscribers = true,
      } = body

      if (!videoUrl) {
        throw new Error('videoUrl é obrigatório')
      }

      // Para Shorts, garantir que #Shorts está no título
      let finalTitle = title
      if (isShort && !title.toLowerCase().includes('#shorts')) {
        finalTitle = `${title} #Shorts`
      }

      // Limitar título a 100 caracteres (limite do YouTube)
      finalTitle = finalTitle.substring(0, 100)

      // Limitar descrição a 5000 caracteres
      const finalDescription = description.substring(0, 5000)

      console.log('[YouTube Publish] Iniciando publicação:', {
        videoUrl,
        title: finalTitle,
        privacyStatus,
        isShort,
      })

      // 1. Baixar o vídeo da URL
      console.log('[YouTube Publish] Baixando vídeo de:', videoUrl)

      const videoResponse = await fetch(videoUrl)
      if (!videoResponse.ok) {
        throw new Error(`Erro ao baixar vídeo: ${videoResponse.status} ${videoResponse.statusText}`)
      }

      const videoBuffer = await videoResponse.arrayBuffer()
      const videoBytes = new Uint8Array(videoBuffer)
      const videoSize = videoBytes.length

      console.log('[YouTube Publish] Vídeo baixado, tamanho:', videoSize, 'bytes')

      // Validar tamanho mínimo
      if (videoSize < 1024) {
        throw new Error('Vídeo muito pequeno. Certifique-se de enviar um arquivo de vídeo válido.')
      }

      // 2. Iniciar upload resumable
      console.log('[YouTube Publish] Iniciando upload resumable...')

      const metadata = {
        snippet: {
          title: finalTitle,
          description: finalDescription,
          tags: tags,
          categoryId: categoryId,
        },
        status: {
          privacyStatus: privacyStatus,
          selfDeclaredMadeForKids: false,
        },
      }

      // Iniciar sessão de upload
      const initResponse = await fetch(
        `${YOUTUBE_UPLOAD_URL}?uploadType=resumable&part=snippet,status`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${youtubeAccessToken}`,
            'Content-Type': 'application/json; charset=UTF-8',
            'X-Upload-Content-Length': videoSize.toString(),
            'X-Upload-Content-Type': 'video/mp4',
          },
          body: JSON.stringify(metadata),
        }
      )

      if (!initResponse.ok) {
        const errorText = await initResponse.text()
        console.error('[YouTube Publish] Erro ao iniciar upload:', initResponse.status, errorText)

        // Tentar parsear erro JSON
        try {
          const errorJson = JSON.parse(errorText)
          throw new Error(errorJson.error?.message || 'Erro ao iniciar upload')
        } catch {
          throw new Error(`Erro ao iniciar upload: ${initResponse.status}`)
        }
      }

      // Obter URL de upload da resposta
      const uploadUrl = initResponse.headers.get('Location')
      if (!uploadUrl) {
        throw new Error('Falha ao obter URL de upload')
      }

      console.log('[YouTube Publish] Upload URL obtida')

      // 3. Fazer upload do vídeo em uma única requisição (para vídeos pequenos)
      // Para vídeos maiores, seria necessário fazer em chunks
      console.log('[YouTube Publish] Enviando vídeo...')

      const uploadResponse = await fetch(uploadUrl, {
        method: 'PUT',
        headers: {
          'Content-Type': 'video/mp4',
          'Content-Length': videoSize.toString(),
        },
        body: videoBytes,
      })

      if (!uploadResponse.ok) {
        const errorText = await uploadResponse.text()
        console.error('[YouTube Publish] Erro no upload:', uploadResponse.status, errorText)
        throw new Error(`Erro no upload: ${uploadResponse.status}`)
      }

      const videoData = await uploadResponse.json()

      console.log('[YouTube Publish] Vídeo publicado com sucesso!')
      console.log('[YouTube Publish] Video ID:', videoData.id)

      return new Response(
        JSON.stringify({
          success: true,
          video_id: videoData.id,
          title: videoData.snippet?.title,
          status: videoData.status?.privacyStatus,
          url: `https://www.youtube.com/watch?v=${videoData.id}`,
          shorts_url: isShort ? `https://www.youtube.com/shorts/${videoData.id}` : null,
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )

    } else {
      throw new Error(`Ação desconhecida: ${action}. Use /user-info ou /publish`)
    }

  } catch (err) {
    console.error('[YouTube Publish] Error:', err)
    return new Response(
      JSON.stringify({ error: err instanceof Error ? err.message : 'Erro interno' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})

/**
 * Renova access_token usando refresh_token
 */
async function refreshYouTubeToken(supabase: any, userId: string, refreshToken: string): Promise<string> {
  const clientId = Deno.env.get('YOUTUBE_CLIENT_ID')
  const clientSecret = Deno.env.get('YOUTUBE_CLIENT_SECRET')

  if (!clientId || !clientSecret) {
    throw new Error('YouTube não configurado no servidor')
  }

  console.log('[YouTube Publish] Renovando token...')

  const refreshResponse = await fetch(GOOGLE_TOKEN_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      refresh_token: refreshToken,
      grant_type: 'refresh_token',
    }),
  })

  const refreshData = await refreshResponse.json()

  if (refreshData.error) {
    console.error('[YouTube Publish] Erro ao renovar token:', refreshData)
    throw new Error(refreshData.error_description || refreshData.error)
  }

  const expiresIn = refreshData.expires_in || 3600

  // Atualizar tokens no banco
  const updateData: Record<string, any> = {
    access_token: refreshData.access_token,
    expires_at: new Date(Date.now() + expiresIn * 1000).toISOString(),
    updated_at: new Date().toISOString(),
  }

  // Se veio novo refresh_token, atualizar também
  if (refreshData.refresh_token) {
    updateData.refresh_token = refreshData.refresh_token
  }

  const { error: updateError } = await supabase
    .from('social_tokens')
    .update(updateData)
    .eq('user_id', userId)
    .eq('platform', 'youtube')

  if (updateError) {
    console.error('[YouTube Publish] Erro ao salvar token renovado:', updateError)
    throw new Error('Erro ao salvar token renovado')
  }

  console.log('[YouTube Publish] Token renovado com sucesso!')
  return refreshData.access_token
}
