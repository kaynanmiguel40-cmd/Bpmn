/**
 * Supabase Edge Function: gcal-sync-push
 *
 * Envia um evento do Fyness para o Google Calendar.
 * Chamada apos create/update/delete de agenda_events.
 *
 * Deploy: supabase functions deploy gcal-sync-push
 */

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { getValidAccessToken, corsHeaders, jsonResponse, logSync } from '../_shared/googleAuth.ts'
import { fynessToGoogle } from '../_shared/eventMapper.ts'

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
const SUPABASE_SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
const GCAL_API = 'https://www.googleapis.com/calendar/v3'

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { eventId, action, userId } = await req.json()

    if (!eventId || !action || !userId) {
      return jsonResponse({ error: 'Missing required fields: eventId, action, userId' }, 400)
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)

    // Verificar se o usuario tem sync habilitado
    const { data: tokenRow } = await supabase
      .from('google_calendar_tokens')
      .select('sync_enabled, calendar_id')
      .eq('user_id', userId)
      .single()

    if (!tokenRow || !tokenRow.sync_enabled) {
      return jsonResponse({ skipped: true, reason: 'sync_disabled' })
    }

    // Obter access token valido
    const accessToken = await getValidAccessToken(supabase, userId)
    if (!accessToken) {
      await logSync(supabase, userId, 'push', action, eventId, null, 'error', 'Failed to get access token')
      return jsonResponse({ error: 'Failed to get access token' }, 401)
    }

    const calendarId = tokenRow.calendar_id || 'primary'
    const headers = {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    }

    // ==================== CREATE ====================
    if (action === 'create') {
      const { data: event } = await supabase
        .from('agenda_events')
        .select('*')
        .eq('id', eventId)
        .single()

      if (!event) {
        return jsonResponse({ error: 'Event not found' }, 404)
      }

      // Nao sincronizar eventos que vieram do Google (evita loop)
      if (event.sync_source === 'google') {
        return jsonResponse({ skipped: true, reason: 'sync_source_is_google' })
      }

      const gcalEvent = fynessToGoogle(event)

      const res = await fetch(`${GCAL_API}/calendars/${calendarId}/events`, {
        method: 'POST',
        headers,
        body: JSON.stringify(gcalEvent),
      })

      if (!res.ok) {
        const errData = await res.json()
        await logSync(supabase, userId, 'push', 'create', eventId, null, 'error', JSON.stringify(errData))
        return jsonResponse({ error: 'Google API error', details: errData }, res.status)
      }

      const created = await res.json()

      // Salvar google_event_id no evento Fyness
      await supabase
        .from('agenda_events')
        .update({ google_event_id: created.id, google_calendar_id: calendarId })
        .eq('id', eventId)

      await logSync(supabase, userId, 'push', 'create', eventId, created.id)
      return jsonResponse({ success: true, googleEventId: created.id })
    }

    // ==================== UPDATE ====================
    if (action === 'update') {
      const { data: event } = await supabase
        .from('agenda_events')
        .select('*')
        .eq('id', eventId)
        .single()

      if (!event) {
        return jsonResponse({ error: 'Event not found' }, 404)
      }

      // Se nao tem google_event_id, criar ao inves de atualizar
      if (!event.google_event_id) {
        if (event.sync_source === 'google') {
          return jsonResponse({ skipped: true, reason: 'sync_source_is_google_no_id' })
        }

        const gcalEvent = fynessToGoogle(event)
        const res = await fetch(`${GCAL_API}/calendars/${calendarId}/events`, {
          method: 'POST',
          headers,
          body: JSON.stringify(gcalEvent),
        })

        if (res.ok) {
          const created = await res.json()
          await supabase
            .from('agenda_events')
            .update({ google_event_id: created.id, google_calendar_id: calendarId })
            .eq('id', eventId)
          await logSync(supabase, userId, 'push', 'create', eventId, created.id)
        }

        return jsonResponse({ success: res.ok })
      }

      const gcalEvent = fynessToGoogle(event)
      const googleEventId = event.google_event_id

      const res = await fetch(`${GCAL_API}/calendars/${calendarId}/events/${googleEventId}`, {
        method: 'PATCH',
        headers,
        body: JSON.stringify(gcalEvent),
      })

      if (!res.ok) {
        const errData = await res.json()
        // Se o evento nao existe mais no Google (404), criar um novo
        if (res.status === 404) {
          const createRes = await fetch(`${GCAL_API}/calendars/${calendarId}/events`, {
            method: 'POST',
            headers,
            body: JSON.stringify(gcalEvent),
          })
          if (createRes.ok) {
            const created = await createRes.json()
            await supabase
              .from('agenda_events')
              .update({ google_event_id: created.id })
              .eq('id', eventId)
            await logSync(supabase, userId, 'push', 'create', eventId, created.id)
            return jsonResponse({ success: true, googleEventId: created.id, recreated: true })
          }
        }
        await logSync(supabase, userId, 'push', 'update', eventId, googleEventId, 'error', JSON.stringify(errData))
        return jsonResponse({ error: 'Google API error', details: errData }, res.status)
      }

      await logSync(supabase, userId, 'push', 'update', eventId, googleEventId)
      return jsonResponse({ success: true, googleEventId })
    }

    // ==================== DELETE ====================
    if (action === 'delete') {
      // Buscar google_event_id antes de deletar (o evento pode ja ter sido removido do DB)
      // Tentar buscar pelo ID primeiro
      const { data: event } = await supabase
        .from('agenda_events')
        .select('google_event_id, google_calendar_id, sync_source')
        .eq('id', eventId)
        .single()

      if (!event?.google_event_id) {
        return jsonResponse({ skipped: true, reason: 'no_google_event_id' })
      }

      if (event.sync_source === 'google') {
        // Nao deletar no Google eventos que vieram de la
        return jsonResponse({ skipped: true, reason: 'sync_source_is_google' })
      }

      const res = await fetch(
        `${GCAL_API}/calendars/${calendarId}/events/${event.google_event_id}`,
        { method: 'DELETE', headers }
      )

      // 410 Gone ou 404 = ja deletado, tudo OK
      if (!res.ok && res.status !== 404 && res.status !== 410) {
        const errData = await res.text()
        await logSync(supabase, userId, 'push', 'delete', eventId, event.google_event_id, 'error', errData)
        return jsonResponse({ error: 'Google API error' }, res.status)
      }

      await logSync(supabase, userId, 'push', 'delete', eventId, event.google_event_id)
      return jsonResponse({ success: true })
    }

    return jsonResponse({ error: `Unknown action: ${action}` }, 400)
  } catch (err) {
    return jsonResponse({ error: (err as Error).message }, 500)
  }
})
