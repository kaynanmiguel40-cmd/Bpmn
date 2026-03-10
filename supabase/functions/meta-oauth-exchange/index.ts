/**
 * Supabase Edge Function: meta-oauth-exchange
 *
 * Troca authorization code por access token (Instagram Login API).
 * O App Secret nao pode ficar no client, entao usamos Edge Function.
 *
 * Env vars necessarias (configurar no Supabase Dashboard):
 * - META_APP_ID (Instagram App ID)
 * - META_APP_SECRET (Instagram App Secret)
 *
 * Deploy: supabase functions deploy meta-oauth-exchange
 */

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const META_APP_ID = Deno.env.get('META_APP_ID')
const META_APP_SECRET = Deno.env.get('META_APP_SECRET')

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { code, redirect_uri } = await req.json()

    if (!code || !redirect_uri) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: code, redirect_uri' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (!META_APP_ID || !META_APP_SECRET) {
      return new Response(
        JSON.stringify({ error: 'META_APP_ID or META_APP_SECRET not configured in Supabase' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Instagram Login API - trocar code por access token
    // Docs: https://developers.facebook.com/docs/instagram-platform/instagram-api-with-instagram-login/
    const formData = new URLSearchParams()
    formData.append('client_id', META_APP_ID)
    formData.append('client_secret', META_APP_SECRET)
    formData.append('grant_type', 'authorization_code')
    formData.append('redirect_uri', redirect_uri)
    formData.append('code', code)

    const res = await fetch('https://api.instagram.com/oauth/access_token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: formData.toString(),
    })
    const data = await res.json()

    if (data.error_type || data.error_message) {
      return new Response(
        JSON.stringify({ error: data.error_message || data.error_type || 'Token exchange failed' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    return new Response(
      JSON.stringify({
        access_token: data.access_token,
        user_id: data.user_id,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (err) {
    return new Response(
      JSON.stringify({ error: err.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
