/**
 * Supabase Edge Function: gcal-team-events
 *
 * Retorna os eventos do Google Calendar de VÁRIOS membros da equipe — cada um
 * buscado com o token do próprio membro (renovado via refresh_token). É só
 * LEITURA: não grava nada no banco, só devolve os eventos marcados por user_id.
 *
 * Por que existe: o navegador de um usuário NÃO pode ler o token de outro (RLS).
 * Esta função roda com service_role e usa o refresh_token de cada membro pra
 * montar a "agenda da equipe" no Google. (Requer que o membro tenha conectado
 * pelo fluxo server — gcal-auth-url — pra ter refresh_token.)
 *
 * Body: { timeMin: ISO, timeMax: ISO, userIds?: string[] }
 *  - userIds ausente = todos os membros com sync habilitado.
 *
 * Deploy: supabase functions deploy gcal-team-events
 */

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { getValidAccessToken, corsHeaders, jsonResponse } from '../_shared/googleAuth.ts'

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
const SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
const ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY')!
const GCAL_API = 'https://www.googleapis.com/calendar/v3'

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // 1) Exige um usuário autenticado (qualquer membro logado pode ver a equipe).
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) return jsonResponse({ error: 'Missing authorization header' }, 401)

    const authClient = createClient(SUPABASE_URL, ANON_KEY, {
      global: { headers: { Authorization: authHeader } },
    })
    const { data: { user }, error: userError } = await authClient.auth.getUser()
    if (userError || !user) return jsonResponse({ error: 'Unauthorized' }, 401)

    // 2) Entrada
    let timeMin: string | null = null
    let timeMax: string | null = null
    let userIds: string[] | null = null
    try {
      const body = await req.json()
      timeMin = body.timeMin || null
      timeMax = body.timeMax || null
      userIds = Array.isArray(body.userIds) ? body.userIds : null
    } catch {
      // sem body
    }
    if (!timeMin || !timeMax) {
      return jsonResponse({ error: 'timeMin e timeMax (ISO) são obrigatórios' }, 400)
    }

    // 3) Tokens dos membros (service_role — bypassa RLS pra ler de todos)
    const supabase = createClient(SUPABASE_URL, SERVICE_KEY)
    let q = supabase.from('google_calendar_tokens').select('user_id').eq('sync_enabled', true)
    if (userIds && userIds.length) q = q.in('user_id', userIds)
    const { data: rows, error: rowsErr } = await q
    if (rowsErr) return jsonResponse({ error: rowsErr.message }, 500)
    if (!rows || rows.length === 0) return jsonResponse({ events: [] })

    // 4) Busca o calendário de cada membro (token renovado se preciso)
    const events: any[] = []
    for (const row of rows) {
      try {
        const accessToken = await getValidAccessToken(supabase, row.user_id)
        if (!accessToken) continue // sem refresh_token / revogado → pula

        const params = new URLSearchParams({
          timeMin, timeMax,
          singleEvents: 'true',
          orderBy: 'startTime',
          maxResults: '250',
        })
        const res = await fetch(`${GCAL_API}/calendars/primary/events?${params.toString()}`, {
          headers: { Authorization: `Bearer ${accessToken}` },
        })
        if (!res.ok) {
          console.error(`[team-events] user ${row.user_id}: HTTP ${res.status}`)
          continue
        }
        const data = await res.json()
        for (const e of (data.items || [])) {
          if (e.status === 'cancelled') continue
          const start = e.start?.dateTime || e.start?.date || null
          if (!start) continue
          events.push({
            userId: row.user_id,
            id: e.id,
            title: e.summary || '(Sem título)',
            startDate: start,
            endDate: e.end?.dateTime || e.end?.date || start,
            isAllDay: !!e.start?.date && !e.start?.dateTime,
            htmlLink: e.htmlLink || '',
            colorId: e.colorId || null,
          })
        }
      } catch (err) {
        console.error(`[team-events] user ${row.user_id}:`, (err as Error).message)
      }
    }

    return jsonResponse({ events })
  } catch (err) {
    return jsonResponse({ error: (err as Error).message }, 500)
  }
})
