/**
 * Supabase Edge Function: tiktok-oauth
 *
 * Processa OAuth do TikTok de forma segura (server-side).
 * Mantém CLIENT_SECRET seguro e evita problemas de CORS/latência.
 *
 * Endpoints:
 * - POST /exchange - Troca código por tokens
 * - POST /refresh - Renova access_token usando refresh_token
 *
 * Env vars necessárias (configurar no Supabase Dashboard):
 * - SUPABASE_URL (automático)
 * - SUPABASE_SERVICE_ROLE_KEY (automático)
 * - TIKTOK_CLIENT_KEY
 * - TIKTOK_CLIENT_SECRET
 * - TIKTOK_REDIRECT_URI
 *
 * Deploy: supabase functions deploy tiktok-oauth
 */

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

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
    const action = url.pathname.split('/').pop() // exchange ou refresh

    // Obter credenciais do TikTok das env vars
    const clientKey = Deno.env.get('TIKTOK_CLIENT_KEY')
    const clientSecret = Deno.env.get('TIKTOK_CLIENT_SECRET')
    const redirectUri = Deno.env.get('TIKTOK_REDIRECT_URI')

    if (!clientKey || !clientSecret || !redirectUri) {
      throw new Error('TikTok não configurado. Configure TIKTOK_* nas secrets do Supabase.')
    }

    // Criar cliente Supabase
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseKey)

    // Obter user do header Authorization
    // Supabase Edge Functions podem receber o header como 'authorization' (lowercase)
    const authHeader = req.headers.get('authorization') || req.headers.get('Authorization')

    if (!authHeader) {
      console.error('[TikTok OAuth] Headers recebidos:', Object.fromEntries(req.headers.entries()))
      throw new Error('Authorization header required')
    }

    const token = authHeader.replace('Bearer ', '').replace('bearer ', '')
    const { data: { user }, error: userError } = await supabase.auth.getUser(token)

    if (userError) {
      console.error('[TikTok OAuth] Erro ao validar usuário:', userError)
      throw new Error('Erro na autenticação: ' + userError.message)
    }

    if (!user) {
      throw new Error('Usuário não autenticado')
    }

    console.log('[TikTok OAuth] Usuário autenticado:', user.id)

    const body = await req.json()

    if (action === 'exchange') {
      // ==================== EXCHANGE CODE FOR TOKENS ====================
      const { code } = body

      if (!code) {
        throw new Error('Code é obrigatório')
      }

      console.log('[TikTok OAuth] Trocando código por tokens...')

      const tokenResponse = await fetch(TIKTOK_TOKEN_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          client_key: clientKey,
          client_secret: clientSecret,
          code,
          grant_type: 'authorization_code',
          redirect_uri: redirectUri,
        }),
      })

      const tokenData = await tokenResponse.json()

      if (tokenData.error) {
        console.error('[TikTok OAuth] Erro:', tokenData)
        throw new Error(tokenData.error_description || tokenData.error)
      }

      // Salvar tokens no Supabase
      const tokenRecord = {
        user_id: user.id,
        platform: 'tiktok',
        access_token: tokenData.access_token,
        refresh_token: tokenData.refresh_token,
        open_id: tokenData.open_id,
        expires_at: new Date(Date.now() + tokenData.expires_in * 1000).toISOString(),
        refresh_expires_at: new Date(Date.now() + tokenData.refresh_expires_in * 1000).toISOString(),
        scope: tokenData.scope,
        updated_at: new Date().toISOString(),
      }

      const { error: upsertError } = await supabase
        .from('social_tokens')
        .upsert(tokenRecord, { onConflict: 'user_id,platform' })

      if (upsertError) {
        console.error('[TikTok OAuth] Erro ao salvar tokens:', upsertError)
        throw new Error('Erro ao salvar tokens: ' + upsertError.message)
      }

      console.log('[TikTok OAuth] Tokens salvos com sucesso!')

      return new Response(
        JSON.stringify({
          success: true,
          open_id: tokenData.open_id,
          expires_in: tokenData.expires_in,
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
        .eq('platform', 'tiktok')
        .single()

      if (fetchError || !stored?.refresh_token) {
        throw new Error('Refresh token não encontrado. Reconecte o TikTok.')
      }

      // Verificar se refresh_token expirou
      if (new Date(stored.refresh_expires_at) < new Date()) {
        // Deletar tokens expirados
        await supabase
          .from('social_tokens')
          .delete()
          .eq('user_id', user.id)
          .eq('platform', 'tiktok')

        throw new Error('Refresh token expirado. Reconecte o TikTok.')
      }

      console.log('[TikTok OAuth] Renovando access_token...')

      const refreshResponse = await fetch(TIKTOK_TOKEN_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          client_key: clientKey,
          client_secret: clientSecret,
          refresh_token: stored.refresh_token,
          grant_type: 'refresh_token',
        }),
      })

      const refreshData = await refreshResponse.json()

      if (refreshData.error) {
        console.error('[TikTok OAuth] Erro ao renovar:', refreshData)
        throw new Error(refreshData.error_description || refreshData.error)
      }

      // Atualizar tokens
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
        .eq('user_id', user.id)
        .eq('platform', 'tiktok')

      if (updateError) {
        throw new Error('Erro ao atualizar tokens: ' + updateError.message)
      }

      console.log('[TikTok OAuth] Token renovado com sucesso!')

      return new Response(
        JSON.stringify({
          success: true,
          expires_in: refreshData.expires_in,
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )

    } else {
      throw new Error(`Ação desconhecida: ${action}. Use /exchange ou /refresh`)
    }

  } catch (err) {
    console.error('[TikTok OAuth] Error:', err)
    return new Response(
      JSON.stringify({ error: err instanceof Error ? err.message : 'Erro interno' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
