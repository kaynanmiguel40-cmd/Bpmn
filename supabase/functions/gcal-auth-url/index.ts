/**
 * Supabase Edge Function: gcal-auth-url
 *
 * Gera a URL de consentimento OAuth do Google Calendar.
 * O usuario e redirecionado para esta URL para autorizar acesso ao calendario.
 *
 * Deploy: supabase functions deploy gcal-auth-url
 */

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders, jsonResponse } from '../_shared/googleAuth.ts'

const GOOGLE_CLIENT_ID = Deno.env.get('GOOGLE_CLIENT_ID')!
const GOOGLE_REDIRECT_URI = Deno.env.get('GOOGLE_REDIRECT_URI')!

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Extrair user do JWT
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return jsonResponse({ error: 'Missing authorization header' }, 401)
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!,
      { global: { headers: { Authorization: authHeader } } }
    )

    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
      return jsonResponse({ error: 'Unauthorized' }, 401)
    }

    // Verificar se ja esta conectado
    const serviceClient = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    )

    const { data: existing } = await serviceClient
      .from('google_calendar_tokens')
      .select('id')
      .eq('user_id', user.id)
      .single()

    if (existing) {
      return jsonResponse({ error: 'Ja conectado ao Google Calendar. Desconecte primeiro.', alreadyConnected: true }, 400)
    }

    // Gerar URL de consentimento
    // state = user_id codificado em base64 (simples, seguro o suficiente para este fluxo)
    const state = btoa(JSON.stringify({ userId: user.id, ts: Date.now() }))

    const params = new URLSearchParams({
      client_id: GOOGLE_CLIENT_ID,
      redirect_uri: GOOGLE_REDIRECT_URI,
      response_type: 'code',
      scope: 'https://www.googleapis.com/auth/calendar.events',
      access_type: 'offline',
      prompt: 'consent',
      state,
    })

    const url = `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`

    return jsonResponse({ url })
  } catch (err) {
    return jsonResponse({ error: (err as Error).message }, 500)
  }
})
