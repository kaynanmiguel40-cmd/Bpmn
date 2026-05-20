/**
 * Supabase Edge Function: evolution-webhook
 *
 * Recebe eventos da Evolution API e processa:
 *
 *   - MESSAGES_UPSERT   -> mensagem nova (inbound; outbound eco)
 *   - MESSAGES_UPDATE   -> mudanca de status (delivered, read)
 *   - CONNECTION_UPDATE -> instancia conectou/desconectou
 *   - QRCODE_UPDATED    -> novo QR code pra UI exibir
 *
 * Inbound de numero desconhecido:
 *   1. Busca em crm_contacts.phone (com normalizacao basica)
 *   2. Se acha -> vincula contact_id
 *   3. Se nao acha -> cria crm_prospect com source='whatsapp_inbound' e vincula prospect_id
 *
 * Auth:
 *   header 'x-webhook-secret: <EVOLUTION_WEBHOOK_SECRET>' (configure
 *   o mesmo valor no docker-compose.evolution.yml via
 *   WEBHOOK_GLOBAL_HEADERS, OU no painel da Evolution).
 *
 * Envs:
 *   EVOLUTION_WEBHOOK_SECRET=...
 *   SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY (auto)
 *
 * Deploy: supabase functions deploy evolution-webhook
 */

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient, SupabaseClient } from 'https://esm.sh/@supabase/supabase-js@2'

const SUPABASE_URL              = Deno.env.get('SUPABASE_URL')!
const SUPABASE_SERVICE_KEY      = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
const WEBHOOK_SECRET            = Deno.env.get('EVOLUTION_WEBHOOK_SECRET') || ''

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-webhook-secret',
}

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  })
}

/**
 * Normaliza um numero pra dig-only (sem +, espaco, traco, parenteses).
 * Usado pra match em crm_contacts.phone (que tambem deveria estar dig-only).
 */
function normalizePhone(p: string | null | undefined): string {
  if (!p) return ''
  return String(p).replace(/\D/g, '')
}

/**
 * Extrai numero do "remoteJid" da Evolution (ex: '5511999999999@s.whatsapp.net').
 */
function jidToPhone(jid: string | null | undefined): string {
  if (!jid) return ''
  return normalizePhone(jid.split('@')[0])
}

interface EvolutionPayload {
  event?: string
  instance?: string
  data?: any
}

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  // Auth via shared secret (se configurado)
  if (WEBHOOK_SECRET) {
    const provided = req.headers.get('x-webhook-secret') || ''
    if (provided !== WEBHOOK_SECRET) {
      return json({ ok: false, error: 'invalid webhook secret' }, 401)
    }
  }

  let payload: EvolutionPayload
  try {
    payload = await req.json()
  } catch {
    return json({ ok: false, error: 'JSON invalido' }, 400)
  }

  const event = (payload.event || '').toLowerCase().replace(/[\.]/g, '_')
  const instanceName = payload.instance || ''
  if (!event || !instanceName) {
    return json({ ok: false, error: 'event e instance obrigatorios' }, 400)
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)

  // Resolve instance_id (cria registro vazio se vier evento de instance ainda nao registrada)
  const { data: instance } = await supabase
    .from('crm_whatsapp_instances')
    .select('id, status, phone_number')
    .eq('instance_name', instanceName)
    .is('deleted_at', null)
    .maybeSingle()

  if (!instance) {
    // Auto-registra instance ao primeiro evento. Vendedor pode editar depois.
    const { error: insErr } = await supabase
      .from('crm_whatsapp_instances')
      .insert({ instance_name: instanceName, status: 'connecting' })
    if (insErr) return json({ ok: false, error: `Auto-register instance: ${insErr.message}` }, 500)
    return json({ ok: true, message: 'instance auto-registered, ignored this event' })
  }

  try {
    switch (event) {
      case 'messages_upsert':
        await handleMessagesUpsert(supabase, instance.id, payload.data)
        break
      case 'messages_update':
        await handleMessagesUpdate(supabase, payload.data)
        break
      case 'connection_update':
        await handleConnectionUpdate(supabase, instance.id, payload.data)
        break
      case 'qrcode_updated':
        await handleQrcodeUpdated(supabase, instance.id, payload.data)
        break
      default:
        // Evento nao tratado, ignora silenciosamente (Evolution manda muitos eventos)
        break
    }
    return json({ ok: true })
  } catch (err) {
    console.error('[evolution-webhook]', event, err)
    return json({ ok: false, error: (err as Error).message }, 500)
  }
})

// ============= Handlers =============

async function handleMessagesUpsert(
  supabase: SupabaseClient,
  instanceId: string,
  data: any,
) {
  // Evolution manda data.key, data.message, data.messageTimestamp, data.pushName, data.message etc.
  // Pode vir tambem como array em data.messages
  const messages = Array.isArray(data?.messages) ? data.messages : [data]

  for (const m of messages) {
    if (!m?.key) continue

    const evolutionMessageId = m.key.id
    const fromMe = !!m.key.fromMe
    const remoteJid = m.key.remoteJid as string
    const otherPhone = jidToPhone(remoteJid)
    if (!otherPhone) continue

    // Dedup: ja existe?
    const { data: existing } = await supabase
      .from('crm_messages')
      .select('id')
      .eq('evolution_message_id', evolutionMessageId)
      .maybeSingle()
    if (existing) continue

    const direction: 'inbound' | 'outbound' = fromMe ? 'outbound' : 'inbound'

    // Extrai conteudo
    const msg = m.message || {}
    let content: string | null = null
    let mediaUrl: string | null = null
    let mediaType: string | null = null
    let mediaCaption: string | null = null
    let mediaMime: string | null = null

    if (msg.conversation) {
      content = msg.conversation
    } else if (msg.extendedTextMessage?.text) {
      content = msg.extendedTextMessage.text
    } else if (msg.imageMessage) {
      mediaType = 'image'
      mediaUrl = msg.imageMessage.url || null
      mediaCaption = msg.imageMessage.caption || null
      mediaMime = msg.imageMessage.mimetype || null
      content = mediaCaption
    } else if (msg.videoMessage) {
      mediaType = 'video'
      mediaUrl = msg.videoMessage.url || null
      mediaCaption = msg.videoMessage.caption || null
      mediaMime = msg.videoMessage.mimetype || null
      content = mediaCaption
    } else if (msg.audioMessage) {
      mediaType = 'audio'
      mediaUrl = msg.audioMessage.url || null
      mediaMime = msg.audioMessage.mimetype || null
    } else if (msg.documentMessage) {
      mediaType = 'document'
      mediaUrl = msg.documentMessage.url || null
      mediaCaption = msg.documentMessage.caption || msg.documentMessage.fileName || null
      mediaMime = msg.documentMessage.mimetype || null
      content = mediaCaption
    } else if (msg.stickerMessage) {
      mediaType = 'sticker'
      mediaUrl = msg.stickerMessage.url || null
      mediaMime = msg.stickerMessage.mimetype || null
    }

    // Vinculacao: contato existente ou prospect novo
    let contactId: string | null = null
    let prospectId: string | null = null

    if (direction === 'inbound') {
      contactId = await findContactByPhone(supabase, otherPhone)
      if (!contactId) {
        prospectId = await findOrCreateProspectByPhone(
          supabase,
          otherPhone,
          (m.pushName as string) || null,
        )
      }
    } else {
      // Outbound eco: vincula a contato existente (deve existir, ja enviamos pra ele)
      contactId = await findContactByPhone(supabase, otherPhone)
    }

    if (!contactId && !prospectId) {
      // Nao conseguiu vincular nem criar; pula
      console.warn('[evolution-webhook] sem vinculo possivel para', otherPhone)
      continue
    }

    const timestamp = m.messageTimestamp
      ? new Date(Number(m.messageTimestamp) * 1000).toISOString()
      : new Date().toISOString()

    await supabase.from('crm_messages').insert({
      instance_id:          instanceId,
      contact_id:           contactId,
      prospect_id:          prospectId,
      direction,
      from_phone:           fromMe ? '' : otherPhone,
      to_phone:             fromMe ? otherPhone : '',
      content,
      media_url:            mediaUrl,
      media_type:           mediaType,
      media_mime:           mediaMime,
      media_caption:        mediaCaption,
      evolution_message_id: evolutionMessageId,
      status:               direction === 'inbound' ? 'received' : 'sent',
      sent_at:              timestamp,
      source:               direction === 'inbound' ? 'reply' : 'manual',
    })
  }
}

async function handleMessagesUpdate(supabase: SupabaseClient, data: any) {
  const updates = Array.isArray(data) ? data : [data]
  for (const u of updates) {
    if (!u?.key?.id) continue
    const evolutionMessageId = u.key.id
    const updateData: Record<string, unknown> = {}

    // Evolution manda u.status como string ou u.update.status
    const status = (u.status || u.update?.status || '').toString().toUpperCase()

    if (status === 'DELIVERY_ACK' || status === 'DELIVERED') {
      updateData.status = 'delivered'
      updateData.delivered_at = new Date().toISOString()
    } else if (status === 'READ' || status === 'PLAYED') {
      updateData.status = 'read'
      updateData.read_at = new Date().toISOString()
    } else if (status === 'ERROR' || status === 'FAILED') {
      updateData.status = 'failed'
      updateData.error_message = u.error || 'erro reportado pelo Evolution'
    }

    if (Object.keys(updateData).length === 0) continue

    await supabase
      .from('crm_messages')
      .update(updateData)
      .eq('evolution_message_id', evolutionMessageId)
  }
}

async function handleConnectionUpdate(
  supabase: SupabaseClient,
  instanceId: string,
  data: any,
) {
  // data.state: 'open' | 'close' | 'connecting'
  const state = (data?.state || '').toLowerCase()
  let status: string = 'disconnected'
  if (state === 'open') status = 'connected'
  else if (state === 'connecting') status = 'connecting'
  else if (state === 'close') status = 'disconnected'

  const update: Record<string, unknown> = {
    status,
    last_seen_at: new Date().toISOString(),
  }

  // Quando conecta, limpa QR e grava telefone
  if (status === 'connected') {
    update.qr_code = null
    update.qr_expires_at = null
    if (data?.phoneNumber || data?.wuid) {
      update.phone_number = jidToPhone(data.wuid || data.phoneNumber)
    }
  }

  await supabase
    .from('crm_whatsapp_instances')
    .update(update)
    .eq('id', instanceId)
}

async function handleQrcodeUpdated(
  supabase: SupabaseClient,
  instanceId: string,
  data: any,
) {
  // QR pode vir como base64 puro (data.qrcode.base64) ou string (data.qrcode)
  const qr = data?.qrcode?.base64 || data?.qrcode || data?.base64 || null
  if (!qr) return

  await supabase
    .from('crm_whatsapp_instances')
    .update({
      status:         'qr_pending',
      qr_code:        qr,
      qr_expires_at:  new Date(Date.now() + 60_000).toISOString(),
    })
    .eq('id', instanceId)
}

// ============= Helpers de vinculacao =============

async function findContactByPhone(
  supabase: SupabaseClient,
  phone: string,
): Promise<string | null> {
  if (!phone) return null
  // Phone no banco pode ter mascara ou nao. Tenta variantes basicas.
  // Estrategia: filtra dig-only via regexp_replace; SE crm_contacts.phone for limpo, basta eq.
  // Por simplicidade, busca por terminacao (sufixo) pra tolerar +55 / DDI.
  const last9 = phone.slice(-9)
  const { data } = await supabase
    .from('crm_contacts')
    .select('id, phone')
    .ilike('phone', `%${last9}%`)
    .is('deleted_at', null)
    .limit(1)
    .maybeSingle()
  return data?.id || null
}

async function findOrCreateProspectByPhone(
  supabase: SupabaseClient,
  phone: string,
  pushName: string | null,
): Promise<string | null> {
  // 1) ja existe prospect com esse phone?
  const { data: existing } = await supabase
    .from('crm_prospects')
    .select('id')
    .eq('phone', phone)
    .is('deleted_at', null)
    .limit(1)
    .maybeSingle()
  if (existing?.id) return existing.id

  // 2) Cria prospect inbound
  const { data: created, error } = await supabase
    .from('crm_prospects')
    .insert({
      contact_name: pushName || `WhatsApp ${phone.slice(-4)}`,
      phone,
      source:       'whatsapp_inbound',
      status:       'new',
    })
    .select('id')
    .single()

  if (error) {
    console.error('[evolution-webhook] erro criando prospect:', error)
    return null
  }
  return created?.id || null
}
