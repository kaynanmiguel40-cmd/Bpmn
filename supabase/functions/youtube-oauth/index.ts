/**
 * Supabase Edge Function: youtube-oauth
 *
 * Processa OAuth do YouTube/Google de forma segura (server-side).
 * Mantém CLIENT_SECRET seguro e evita problemas de CORS.
 *
 * Endpoints:
 * - POST /exchange - Troca código por tokens
 * - POST /refresh - Renova access_token usando refresh_token
 *
 * Env vars necessárias (configurar no Supabase Dashboard):
 * - SUPABASE_URL (automático)
 * - SUPABASE_SERVICE_ROLE_KEY (automático)
 * - YOUTUBE_CLIENT_ID
 * - YOUTUBE_CLIENT_SECRET
 * - YOUTUBE_REDIRECT_URI
 *
 * Deploy: supabase functions deploy youtube-oauth
 */

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const GOOGLE_TOKEN_URL = 'https://oauth2.googleapis.com/token'
const GOOGLE_USERINFO_URL = 'https://www.googleapis.com/oauth2/v2/userinfo'

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
    const action = url.pathname.split('/').pop() // exchange ou refresh

    // Obter credenciais do YouTube das env vars
    const clientId = Deno.env.get('YOUTUBE_CLIENT_ID')
    const clientSecret = Deno.env.get('YOUTUBE_CLIENT_SECRET')
    const redirectUri = Deno.env.get('YOUTUBE_REDIRECT_URI')

    if (!clientId || !clientSecret || !redirectUri) {
      throw new Error('YouTube não configurado. Configure YOUTUBE_* nas secrets do Supabase.')
    }

    // Criar cliente Supabase
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseKey)

    // Obter user do header Authorization
    const authHeader = req.headers.get('authorization') || req.headers.get('Authorization')

    if (!authHeader) {
      console.error('[YouTube OAuth] Headers recebidos:', Object.fromEntries(req.headers.entries()))
      throw new Error('Authorization header required')
    }

    const token = authHeader.replace('Bearer ', '').replace('bearer ', '')
    const { data: { user }, error: userError } = await supabase.auth.getUser(token)

    if (userError) {
      console.error('[YouTube OAuth] Erro ao validar usuário:', userError)
      throw new Error('Erro na autenticação: ' + userError.message)
    }

    if (!user) {
      throw new Error('Usuário não autenticado')
    }

    console.log('[YouTube OAuth] Usuário autenticado:', user.id)

    const body = await req.json()

    if (action === 'exchange') {
      // ==================== EXCHANGE CODE FOR TOKENS ====================
      const { code } = body

      if (!code) {
        throw new Error('Code é obrigatório')
      }

      console.log('[YouTube OAuth] Trocando código por tokens...')

      const tokenResponse = await fetch(GOOGLE_TOKEN_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          client_id: clientId,
          client_secret: clientSecret,
          code,
          grant_type: 'authorization_code',
          redirect_uri: redirectUri,
        }),
      })

      const tokenData = await tokenResponse.json()

      if (tokenData.error) {
        console.error('[YouTube OAuth] Erro:', tokenData)
        throw new Error(tokenData.error_description || tokenData.error)
      }

      // Buscar informações do usuário Google/YouTube
      const userInfoResponse = await fetch(GOOGLE_USERINFO_URL, {
        headers: {
          'Authorization': `Bearer ${tokenData.access_token}`,
        },
      })

      const userInfo = await userInfoResponse.json()
      console.log('[YouTube OAuth] Usuário YouTube:', userInfo.email || userInfo.id)

      // Google OAuth: access_token expira em 1 hora (3600s)
      // refresh_token não expira, mas pode ser revogado
      const expiresIn = tokenData.expires_in || 3600

      // Salvar tokens no Supabase
      const tokenRecord = {
        user_id: user.id,
        platform: 'youtube',
        access_token: tokenData.access_token,
        refresh_token: tokenData.refresh_token,
        open_id: userInfo.id, // Google user ID
        expires_at: new Date(Date.now() + expiresIn * 1000).toISOString(),
        // Google refresh_token não expira, mas definimos 1 ano para consistência
        refresh_expires_at: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
        scope: tokenData.scope,
        extra_data: JSON.stringify({
          email: userInfo.email,
          name: userInfo.name,
          picture: userInfo.picture,
        }),
        updated_at: new Date().toISOString(),
      }

      const { error: upsertError } = await supabase
        .from('social_tokens')
        .upsert(tokenRecord, { onConflict: 'user_id,platform' })

      if (upsertError) {
        console.error('[YouTube OAuth] Erro ao salvar tokens:', upsertError)
        throw new Error('Erro ao salvar tokens: ' + upsertError.message)
      }

      console.log('[YouTube OAuth] Tokens salvos com sucesso!')

      return new Response(
        JSON.stringify({
          success: true,
          channel_id: userInfo.id,
          email: userInfo.email,
          name: userInfo.name,
          expires_in: expiresIn,
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )

    } else if (action === 'refresh') {
      // ==================== REFRESH ACCESS TOKEN ====================

      // Buscar refresh_token do banco
      const { data: stored, error: fetchError } = await supabase
        .from('social_tokens')
        .select('*')
        .eq('user_id', user.id)
        .eq('platform', 'youtube')
        .single()

      if (fetchError || !stored?.refresh_token) {
        throw new Error('Refresh token não encontrado. Reconecte o YouTube.')
      }

      console.log('[YouTube OAuth] Renovando access_token...')

      const refreshResponse = await fetch(GOOGLE_TOKEN_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          client_id: clientId,
          client_secret: clientSecret,
          refresh_token: stored.refresh_token,
          grant_type: 'refresh_token',
        }),
      })

      const refreshData = await refreshResponse.json()

      if (refreshData.error) {
        console.error('[YouTube OAuth] Erro ao renovar:', refreshData)

        // Se o refresh_token foi revogado, deletar tokens
        if (refreshData.error === 'invalid_grant') {
          await supabase
            .from('social_tokens')
            .delete()
            .eq('user_id', user.id)
            .eq('platform', 'youtube')

          throw new Error('Token revogado. Reconecte o YouTube.')
        }

        throw new Error(refreshData.error_description || refreshData.error)
      }

      const expiresIn = refreshData.expires_in || 3600

      // Atualizar tokens (Google pode ou não retornar novo refresh_token)
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
        .eq('user_id', user.id)
        .eq('platform', 'youtube')

      if (updateError) {
        throw new Error('Erro ao atualizar tokens: ' + updateError.message)
      }

      console.log('[YouTube OAuth] Token renovado com sucesso!')

      return new Response(
        JSON.stringify({
          success: true,
          expires_in: expiresIn,
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )

    } else {
      throw new Error(`Ação desconhecida: ${action}. Use /exchange ou /refresh`)
    }

  } catch (err) {
    console.error('[YouTube OAuth] Error:', err)
    return new Response(
      JSON.stringify({ error: err instanceof Error ? err.message : 'Erro interno' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
