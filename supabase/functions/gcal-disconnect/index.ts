/**
 * Supabase Edge Function: gcal-disconnect
 *
 * Revoga tokens do Google e remove a conexao do banco.
 *
 * Deploy: supabase functions deploy gcal-disconnect
 */

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders, jsonResponse } from '../_shared/googleAuth.ts'

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
const SUPABASE_SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

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

    const userClient = createClient(
      SUPABASE_URL,
      Deno.env.get('SUPABASE_ANON_KEY')!,
      { global: { headers: { Authorization: authHeader } } }
    )

    const { data: { user }, error: userError } = await userClient.auth.getUser()
    if (userError || !user) {
      return jsonResponse({ error: 'Unauthorized' }, 401)
    }

    // Buscar token para revogar (service_role para ler token real)
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)

    const { data: tokenRow } = await supabase
      .from('google_calendar_tokens')
      .select('access_token, refresh_token')
      .eq('user_id', user.id)
      .single()

    if (tokenRow) {
      // Revogar token no Google (best effort)
      try {
        await fetch(`https://oauth2.googleapis.com/revoke?token=${tokenRow.access_token}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        })
      } catch {
        // Se falhar, nao bloqueia — o token vai expirar naturalmente
        console.warn('[GCal] Token revocation failed (non-blocking)')
      }

      // Remover do banco
      await supabase
        .from('google_calendar_tokens')
        .delete()
        .eq('user_id', user.id)
    }

    return jsonResponse({ success: true, message: 'Google Calendar desconectado' })
  } catch (err) {
    return jsonResponse({ error: (err as Error).message }, 500)
  }
})
