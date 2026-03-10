/**
 * Supabase Edge Function: meta-long-lived-token
 *
 * Converte short-lived token (1h) para long-lived token (60 dias).
 * Usa Instagram Graph API endpoint.
 *
 * Env vars necessarias (configurar no Supabase Dashboard):
 * - META_APP_SECRET (Instagram App Secret)
 *
 * Deploy: supabase functions deploy meta-long-lived-token
 */

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

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
    const { access_token } = await req.json()

    if (!access_token) {
      return new Response(
        JSON.stringify({ error: 'Missing required field: access_token' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (!META_APP_SECRET) {
      return new Response(
        JSON.stringify({ error: 'META_APP_SECRET not configured in Supabase' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Instagram Graph API - converter para long-lived token
    // Docs: https://developers.facebook.com/docs/instagram-platform/instagram-api-with-instagram-login/
    const tokenUrl = new URL('https://graph.instagram.com/access_token')
    tokenUrl.searchParams.set('grant_type', 'ig_exchange_token')
    tokenUrl.searchParams.set('client_secret', META_APP_SECRET)
    tokenUrl.searchParams.set('access_token', access_token)

    const res = await fetch(tokenUrl.toString())
    const data = await res.json()

    if (data.error) {
      return new Response(
        JSON.stringify({ error: data.error.message || data.error }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    return new Response(
      JSON.stringify({
        access_token: data.access_token,
        token_type: data.token_type || 'Bearer',
        expires_in: data.expires_in || 5184000, // 60 dias em segundos
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
