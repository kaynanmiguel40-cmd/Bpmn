/**
 * Supabase Edge Function: gcal-oauth-callback
 *
 * Recebe o callback do Google OAuth, troca o code por tokens,
 * salva na tabela google_calendar_tokens e redireciona para o app.
 *
 * Deploy: supabase functions deploy gcal-oauth-callback
 */

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/googleAuth.ts'

const GOOGLE_CLIENT_ID = Deno.env.get('GOOGLE_CLIENT_ID')!
const GOOGLE_CLIENT_SECRET = Deno.env.get('GOOGLE_CLIENT_SECRET')!
const GOOGLE_REDIRECT_URI = Deno.env.get('GOOGLE_REDIRECT_URI')!
const APP_URL = Deno.env.get('APP_URL') || 'http://localhost:5173'
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
const SUPABASE_SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const url = new URL(req.url)
    const code = url.searchParams.get('code')
    const stateParam = url.searchParams.get('state')
    const error = url.searchParams.get('error')

    // Usuario negou acesso
    if (error) {
      return Response.redirect(`${APP_URL}/settings?tab=integrations&gcal=denied`, 302)
    }

    if (!code || !stateParam) {
      return Response.redirect(`${APP_URL}/settings?tab=integrations&gcal=error&msg=missing_params`, 302)
    }

    // Decodificar state para obter userId
    let userId: string
    try {
      const state = JSON.parse(atob(stateParam))
      userId = state.userId

      // Verificar se o state nao e muito antigo (10 minutos max)
      if (Date.now() - state.ts > 10 * 60 * 1000) {
        return Response.redirect(`${APP_URL}/settings?tab=integrations&gcal=error&msg=expired`, 302)
      }
    } catch {
      return Response.redirect(`${APP_URL}/settings?tab=integrations&gcal=error&msg=invalid_state`, 302)
    }

    // Trocar code por tokens
    const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code,
        client_id: GOOGLE_CLIENT_ID,
        client_secret: GOOGLE_CLIENT_SECRET,
        redirect_uri: GOOGLE_REDIRECT_URI,
        grant_type: 'authorization_code',
      }),
    })

    const tokenData = await tokenRes.json()

    if (!tokenRes.ok) {
      console.error('[GCal OAuth] Token exchange failed:', tokenData)
      return Response.redirect(`${APP_URL}/settings?tab=integrations&gcal=error&msg=token_exchange_failed`, 302)
    }

    const expiresAt = new Date(Date.now() + tokenData.expires_in * 1000)

    // Salvar tokens no banco (service_role para bypass RLS)
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)

    const { error: dbError } = await supabase
      .from('google_calendar_tokens')
      .upsert([{
        user_id: userId,
        access_token: tokenData.access_token,
        refresh_token: tokenData.refresh_token,
        expires_at: expiresAt.toISOString(),
        calendar_id: 'primary',
        sync_enabled: true,
        updated_at: new Date().toISOString(),
      }], { onConflict: 'user_id' })

    if (dbError) {
      console.error('[GCal OAuth] DB save failed:', dbError)
      return Response.redirect(`${APP_URL}/settings?tab=integrations&gcal=error&msg=db_error`, 302)
    }

    // Sucesso — redirecionar para o app
    return Response.redirect(`${APP_URL}/settings?tab=integrations&gcal=connected`, 302)
  } catch (err) {
    console.error('[GCal OAuth] Error:', err)
    return Response.redirect(`${APP_URL}/settings?tab=integrations&gcal=error&msg=unknown`, 302)
  }
})
