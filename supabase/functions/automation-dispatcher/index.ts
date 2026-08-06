/**
 * Edge Function: automation-dispatcher
 *
 * Processa a fila `crm_scheduled_automations` (automações com delay_minutes).
 * Chamada por um cron pg_net a cada minuto. Pega os disparos VENCIDOS e pendentes,
 * envia por WhatsApp (evolution-send) ou e-mail (send-email), atualiza o status e
 * grava o log em crm_automation_logs (igual ao disparo imediato).
 *
 * Auth: ?secret=<EVOLUTION_WEBHOOK_SECRET> (reusa o secret já existente no env).
 * Deploy: base64 -> /opt/supabase/volumes/functions/automation-dispatcher/index.ts
 *         + docker restart supabase-edge-functions.
 */

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const SUPABASE_URL  = Deno.env.get('SUPABASE_URL')!
const SERVICE_KEY   = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
const SECRET        = Deno.env.get('EVOLUTION_WEBHOOK_SECRET') || ''

const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-webhook-secret',
}
const json = (b: unknown, s = 200) =>
  new Response(JSON.stringify(b), { status: s, headers: { ...cors, 'Content-Type': 'application/json' } })

function mediaTypeFromUrl(url: string): string {
  const ext = (String(url || '').split('?')[0].split('.').pop() || '').toLowerCase()
  if (['jpg', 'jpeg', 'png', 'webp', 'gif'].includes(ext)) return 'image'
  if (['mp4', 'mov', 'webm', 'avi', 'mkv'].includes(ext)) return 'video'
  if (['mp3', 'm4a', 'ogg', 'wav', 'opus', 'aac'].includes(ext)) return 'audio'
  return 'document'
}

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors })

  const url = new URL(req.url)
  const secret = url.searchParams.get('secret') || req.headers.get('x-webhook-secret') || ''
  if (SECRET && secret !== SECRET) return json({ ok: false, error: 'unauthorized' }, 401)

  const sb = createClient(SUPABASE_URL, SERVICE_KEY)

  // Vencidos e ainda pendentes.
  const { data: due, error: selErr } = await sb
    .from('crm_scheduled_automations')
    .select('*')
    .eq('status', 'pending')
    .lte('dispatch_at', new Date().toISOString())
    .order('dispatch_at', { ascending: true })
    .limit(50)
  if (selErr) return json({ ok: false, error: selErr.message }, 500)
  if (!due || due.length === 0) return json({ ok: true, processed: 0 })

  const headers = { 'Content-Type': 'application/json', Authorization: `Bearer ${SERVICE_KEY}`, apikey: SERVICE_KEY }
  let processed = 0

  for (const row of due) {
    let ok = false
    let errMsg: string | null = null
    try {
      if (row.channel === 'whatsapp') {
        const body: Record<string, unknown> = {
          phone:        row.recipient,
          content:      row.body,
          contactId:    row.contact_id,
          dealId:       row.deal_id,
          automationId: row.automation_id,
          source:       'automation',
        }
        if (row.media_url) {
          body.mediaUrl     = row.media_url
          body.mediaType    = mediaTypeFromUrl(row.media_url)
          body.mediaCaption = row.body || undefined
        }
        const r = await fetch(`${SUPABASE_URL}/functions/v1/evolution-send`, { method: 'POST', headers, body: JSON.stringify(body) })
        const d = await r.json().catch(() => ({}))
        ok = r.ok && d?.ok !== false
        if (!ok) errMsg = d?.error || `HTTP ${r.status}`
      } else if (row.channel === 'email') {
        const r = await fetch(`${SUPABASE_URL}/functions/v1/send-email`, { method: 'POST', headers, body: JSON.stringify({ to: row.recipient, subject: row.subject, body: row.body }) })
        const d = await r.json().catch(() => ({}))
        ok = r.ok && d?.ok !== false
        if (!ok) errMsg = d?.error || `HTTP ${r.status}`
      } else {
        errMsg = `Canal ${row.channel} não suportado`
      }
    } catch (e) {
      errMsg = e instanceof Error ? e.message : String(e)
    }

    await sb.from('crm_scheduled_automations').update({
      status:   ok ? 'sent' : 'failed',
      error:    errMsg,
      attempts: (row.attempts || 0) + 1,
      sent_at:  ok ? new Date().toISOString() : null,
    }).eq('id', row.id)

    await sb.from('crm_automation_logs').insert({
      automation_id:    row.automation_id,
      deal_id:          row.deal_id,
      deal_title:       row.deal_title,
      stage_name:       row.stage_name,
      channel:          row.channel,
      recipient:        row.recipient,
      message_snapshot: row.body || row.media_url || '',
      status:           ok ? 'sent' : 'error',
      error_message:    ok ? null : errMsg,
      sent_at:          new Date().toISOString(),
    })
    processed++
  }

  return json({ ok: true, processed })
})
