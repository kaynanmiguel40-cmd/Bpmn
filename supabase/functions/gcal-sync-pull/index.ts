/**
 * Supabase Edge Function: gcal-sync-pull
 *
 * Puxa mudancas do Google Calendar para o Fyness.
 * Usa sync incremental (syncToken) para eficiencia.
 *
 * Pode ser chamada:
 * - Via pg_cron (a cada 5 min) para todos os usuarios
 * - Manualmente pelo usuario (com userId no body)
 *
 * Deploy: supabase functions deploy gcal-sync-pull
 */

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { getValidAccessToken, corsHeaders, jsonResponse, logSync } from '../_shared/googleAuth.ts'
import { googleToFyness } from '../_shared/eventMapper.ts'

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
const SUPABASE_SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
const GCAL_API = 'https://www.googleapis.com/calendar/v3'

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)
    let targetUserId: string | null = null

    // Se body tem userId, sincronizar apenas esse usuario
    try {
      const body = await req.json()
      targetUserId = body.userId || null
    } catch {
      // Sem body = sync de todos os usuarios (cron)
    }

    // Buscar usuarios com sync habilitado
    let query = supabase
      .from('google_calendar_tokens')
      .select('*')
      .eq('sync_enabled', true)

    if (targetUserId) {
      query = query.eq('user_id', targetUserId)
    }

    const { data: tokenRows, error: tokensError } = await query
    if (tokensError || !tokenRows || tokenRows.length === 0) {
      return jsonResponse({ message: 'No users to sync', synced: 0 })
    }

    let totalCreated = 0
    let totalUpdated = 0
    let totalDeleted = 0
    let totalErrors = 0

    for (const tokenRow of tokenRows) {
      try {
        const result = await syncUserCalendar(supabase, tokenRow)
        totalCreated += result.created
        totalUpdated += result.updated
        totalDeleted += result.deleted
      } catch (err) {
        totalErrors++
        console.error(`[GCal Pull] Error for user ${tokenRow.user_id}:`, err)
      }
    }

    return jsonResponse({
      message: 'Pull sync completed',
      users: tokenRows.length,
      created: totalCreated,
      updated: totalUpdated,
      deleted: totalDeleted,
      errors: totalErrors,
    })
  } catch (err) {
    return jsonResponse({ error: (err as Error).message }, 500)
  }
})

/**
 * Sincroniza o calendario de um usuario especifico
 */
async function syncUserCalendar(supabase: any, tokenRow: any) {
  const userId = tokenRow.user_id
  const calendarId = tokenRow.calendar_id || 'primary'
  const stats = { created: 0, updated: 0, deleted: 0 }

  // Obter access token valido
  const accessToken = await getValidAccessToken(supabase, userId)
  if (!accessToken) {
    console.warn(`[GCal Pull] No valid token for user ${userId}`)
    return stats
  }

  // Montar URL da API
  const params = new URLSearchParams()

  if (tokenRow.sync_token) {
    // Sync incremental — apenas mudancas desde o ultimo sync
    params.set('syncToken', tokenRow.sync_token)
  } else {
    // Primeiro sync — puxar eventos dos ultimos 3 meses e proximos 6 meses
    const timeMin = new Date()
    timeMin.setMonth(timeMin.getMonth() - 3)
    params.set('timeMin', timeMin.toISOString())

    const timeMax = new Date()
    timeMax.setMonth(timeMax.getMonth() + 6)
    params.set('timeMax', timeMax.toISOString())

    params.set('singleEvents', 'false') // Manter eventos recorrentes como master
  }

  params.set('maxResults', '250')

  let nextPageToken: string | null = null
  let newSyncToken: string | null = null

  do {
    if (nextPageToken) params.set('pageToken', nextPageToken)

    const res = await fetch(`${GCAL_API}/calendars/${calendarId}/events?${params.toString()}`, {
      headers: { 'Authorization': `Bearer ${accessToken}` },
    })

    if (!res.ok) {
      const errData = await res.json()

      // syncToken invalido (expirado ou resetado) — fazer full sync
      if (res.status === 410) {
        console.log(`[GCal Pull] syncToken expired for user ${userId}, doing full sync`)
        await supabase
          .from('google_calendar_tokens')
          .update({ sync_token: null, updated_at: new Date().toISOString() })
          .eq('user_id', userId)

        // Recursao: tentar novamente sem syncToken
        return syncUserCalendar(supabase, { ...tokenRow, sync_token: null })
      }

      console.error(`[GCal Pull] API error for user ${userId}:`, errData)
      return stats
    }

    const data = await res.json()
    const events = data.items || []
    nextPageToken = data.nextPageToken || null
    newSyncToken = data.nextSyncToken || null

    // Processar cada evento
    for (const gcalEvent of events) {
      try {
        await processGoogleEvent(supabase, userId, gcalEvent, calendarId, stats)
      } catch (err) {
        console.error(`[GCal Pull] Error processing event ${gcalEvent.id}:`, err)
      }
    }
  } while (nextPageToken)

  // Salvar novo syncToken e timestamp
  const updateData: any = {
    last_sync_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }
  if (newSyncToken) {
    updateData.sync_token = newSyncToken
  }

  await supabase
    .from('google_calendar_tokens')
    .update(updateData)
    .eq('user_id', userId)

  return stats
}

/**
 * Processa um evento individual do Google Calendar
 */
async function processGoogleEvent(
  supabase: any,
  userId: string,
  gcalEvent: any,
  calendarId: string,
  stats: { created: number; updated: number; deleted: number }
) {
  const googleEventId = gcalEvent.id

  // Buscar evento existente no Fyness com esse google_event_id
  const { data: existing } = await supabase
    .from('agenda_events')
    .select('id, updated_at, sync_source')
    .eq('google_event_id', googleEventId)
    .single()

  // ==================== EVENTO CANCELADO/DELETADO ====================
  if (gcalEvent.status === 'cancelled') {
    if (existing) {
      await supabase.from('agenda_events').delete().eq('id', existing.id)
      await logSync(supabase, userId, 'pull', 'delete', existing.id, googleEventId)
      stats.deleted++
    }
    return
  }

  // ==================== EVENTO EXISTENTE (UPDATE) ====================
  if (existing) {
    // Conflict resolution: last-write-wins
    const googleUpdated = new Date(gcalEvent.updated || gcalEvent.created)
    const fynessUpdated = new Date(existing.updated_at)

    // Se o Fyness foi atualizado mais recentemente, nao sobrescrever
    if (fynessUpdated > googleUpdated && existing.sync_source === 'fyness') {
      return
    }

    const fynessEvent = googleToFyness(gcalEvent)
    delete fynessEvent.google_event_id // Nao alterar o ID de referencia
    delete fynessEvent.google_calendar_id
    fynessEvent.updated_at = new Date().toISOString()

    await supabase
      .from('agenda_events')
      .update(fynessEvent)
      .eq('id', existing.id)

    await logSync(supabase, userId, 'pull', 'update', existing.id, googleEventId)
    stats.updated++
    return
  }

  // ==================== EVENTO NOVO (CREATE) ====================
  // Verificar se nao e um evento que o Fyness criou (evita duplicatas)
  // Eventos criados pelo Fyness tem o google_event_id ja salvo
  const { data: byTitle } = await supabase
    .from('agenda_events')
    .select('id')
    .eq('title', gcalEvent.summary || '')
    .gte('start_date', gcalEvent.start?.dateTime || gcalEvent.start?.date || '')
    .lte('start_date', gcalEvent.start?.dateTime || gcalEvent.start?.date || '')
    .limit(1)

  if (byTitle && byTitle.length > 0) {
    // Provavelmente ja existe — atualizar o google_event_id
    await supabase
      .from('agenda_events')
      .update({ google_event_id: googleEventId, google_calendar_id: calendarId })
      .eq('id', byTitle[0].id)
    return
  }

  const fynessEvent = googleToFyness(gcalEvent)
  const id = `evt_g_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`

  await supabase
    .from('agenda_events')
    .insert([{
      id,
      ...fynessEvent,
      google_calendar_id: calendarId,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }])

  await logSync(supabase, userId, 'pull', 'create', id, googleEventId)
  stats.created++
}
