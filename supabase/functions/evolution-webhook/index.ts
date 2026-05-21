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
const EVOLUTION_URL             = Deno.env.get('EVOLUTION_URL') || ''
const EVOLUTION_API_KEY         = Deno.env.get('EVOLUTION_API_KEY') || ''

/**
 * Busca pushname (nome do contato) via API do WAHA.
 * Retorna null em qualquer erro / contato sem nome.
 */
async function wahaGetContactName(session: string, chatId: string): Promise<string | null> {
  if (!EVOLUTION_URL || !EVOLUTION_API_KEY) return null
  try {
    const r = await fetch(
      `${EVOLUTION_URL}/api/contacts?contactId=${encodeURIComponent(chatId)}&session=${encodeURIComponent(session)}`,
      { headers: { 'X-Api-Key': EVOLUTION_API_KEY } },
    )
    if (!r.ok) return null
    const data = await r.json()
    const c = Array.isArray(data) ? data[0] : data
    return c?.pushname || c?.name || c?.shortName || null
  } catch {
    return null
  }
}

/**
 * Busca URL da foto de perfil via API do WAHA.
 * URL retornada eh do CDN do WhatsApp (pps.whatsapp.net) e expira em ~7 dias.
 */
async function wahaGetProfilePicture(session: string, chatId: string): Promise<string | null> {
  if (!EVOLUTION_URL || !EVOLUTION_API_KEY) return null
  try {
    const r = await fetch(
      `${EVOLUTION_URL}/api/contacts/profile-picture?contactId=${encodeURIComponent(chatId)}&session=${encodeURIComponent(session)}`,
      { headers: { 'X-Api-Key': EVOLUTION_API_KEY } },
    )
    if (!r.ok) return null
    const data = await r.json()
    return data?.profilePictureURL || data?.url || null
  } catch {
    return null
  }
}

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

  let rawPayload: any
  try {
    rawPayload = await req.json()
  } catch {
    return json({ ok: false, error: 'JSON invalido' }, 400)
  }

  // Normaliza payload: aceita formato Evolution {event, instance, data} OU WAHA {event, session, payload}
  const payload: EvolutionPayload = normalizePayload(rawPayload)

  const event = (payload.event || '').toLowerCase().replace(/[\.]/g, '_')
  const instanceName = payload.instance || ''
  if (!event || !instanceName) {
    // Ignora silenciosamente eventos sem instance (WAHA manda alguns sem)
    return json({ ok: true, ignored: true, reason: 'sem event ou instance' })
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

  const debug: Record<string, unknown> = { event, instanceName, instanceId: instance.id }
  try {
    switch (event) {
      case 'messages_upsert':
        debug.handlerResult = await handleMessagesUpsert(supabase, instance.id, payload.data, instanceName)
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
        debug.handlerResult = `event "${event}" not handled`
        break
    }
    return json({ ok: true, debug })
  } catch (err) {
    console.error('[evolution-webhook]', event, err)
    return json({ ok: false, error: (err as Error).message, debug }, 500)
  }
})

// ============= Handlers =============

async function handleMessagesUpsert(
  supabase: SupabaseClient,
  instanceId: string,
  data: any,
  instanceName: string = '',
) {
  const debug: any[] = []
  // Evolution manda data.key, data.message, data.messageTimestamp, data.pushName, data.message etc.
  // Pode vir tambem como array em data.messages
  const messages = Array.isArray(data?.messages) ? data.messages : [data]

  for (const m of messages) {
    if (!m?.key) { debug.push({ skip: 'no_key', m }); continue }

    const evolutionMessageId = m.key.id
    const fromMe = !!m.key.fromMe
    const remoteJid = m.key.remoteJid as string
    const otherPhone = jidToPhone(remoteJid)
    if (!otherPhone) { debug.push({ skip: 'no_otherPhone', remoteJid }); continue }

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

    let prospectError: string | null = null
    if (direction === 'inbound') {
      contactId = await findContactByPhone(supabase, otherPhone)
      if (!contactId) {
        const chatId = remoteJid.replace('@s.whatsapp.net', '@lid')
        let pushName: string | null = (m.pushName as string) || null
        if (!pushName) {
          pushName = await wahaGetContactName(instanceName, chatId)
        }
        // Tenta buscar avatar. Se WAHA ainda nao sincronizou (timing), retorna null
        // e o findOrCreate vai tentar atualizar na proxima mensagem.
        const avatarUrl = await wahaGetProfilePicture(instanceName, chatId)
        const r = await findOrCreateProspectByPhoneWithError(supabase, otherPhone, pushName, avatarUrl)
        prospectId = r.id
        prospectError = r.error

        // Refresh: se o prospect ja existia mas sem avatar, e agora temos um, atualiza.
        // (Trata caso onde primeira msg chegou mas WAHA nao tinha sincronizado a foto)
        if (prospectId && !avatarUrl) {
          // Re-tenta pegar foto (pode ter sincronizado entre o create e agora)
          const retryAvatar = await wahaGetProfilePicture(instanceName, chatId)
          if (retryAvatar) {
            await supabase
              .from('crm_prospects')
              .update({ avatar_url: retryAvatar })
              .eq('id', prospectId)
              .is('avatar_url', null)
          }
        }
      }
    } else {
      contactId = await findContactByPhone(supabase, otherPhone)
    }

    if (!contactId && !prospectId) {
      debug.push({ skip: 'no_link', direction, otherPhone, remoteJid, prospectError })
      continue
    }

    // Pula mensagens sem conteudo nem midia (eventos meta como reaction, edit, ack que escapam)
    if (!content && !mediaUrl) {
      debug.push({ skip: 'empty_content', direction, evolutionMessageId })
      continue
    }

    const timestamp = m.messageTimestamp
      ? new Date(Number(m.messageTimestamp) * 1000).toISOString()
      : new Date().toISOString()

    const { error: insErr, data: insData } = await supabase.from('crm_messages').insert({
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
    }).select('id').single()

    debug.push({
      inserted: !insErr,
      error:    insErr?.message,
      msgId:    insData?.id,
      direction,
      contactId,
      prospectId,
      otherPhone,
      content: content?.slice(0, 50),
    })
  }
  return debug
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

// ============= Normalizacao de payload (Evolution vs WAHA) =============

/**
 * Normaliza payload de diferentes providers pro formato interno
 * (`{ event, instance, data }`).
 *
 * - Evolution API (atendai/evolution-api): { event, instance, data }
 * - WAHA (devlikeapro/waha): { event, session, payload }
 *
 * WAHA tambem usa nomes de eventos diferentes:
 *   - 'message' / 'message.any' (single)  -> 'messages.upsert'
 *   - 'session.status' { status: ... }    -> 'connection.update'
 *   - 'state.change'                      -> 'connection.update'
 *   - 'message.ack' / 'message.reaction'  -> ignora por ora
 */
function normalizePayload(raw: any): EvolutionPayload {
  if (!raw || typeof raw !== 'object') return { event: '', instance: '', data: null }

  // Ja Evolution-shaped
  if (raw.instance && raw.data !== undefined) return raw

  // WAHA: usa `session` em vez de `instance` e `payload` em vez de `data`
  if (raw.session) {
    const wahaEvent: string = String(raw.event || '').toLowerCase()
    const session = raw.session
    const payload = raw.payload || raw.data || {}

    // session.status / state.change -> connection.update
    if (wahaEvent === 'session.status' || wahaEvent === 'state.change') {
      const wahaStatus = String(payload.status || payload.state || '').toUpperCase()
      let evoState = 'close'
      if (wahaStatus === 'WORKING')        evoState = 'open'
      else if (wahaStatus === 'STARTING')  evoState = 'connecting'
      else if (wahaStatus === 'SCAN_QR_CODE') evoState = 'connecting'
      else if (wahaStatus === 'FAILED')    evoState = 'close'
      else if (wahaStatus === 'STOPPED')   evoState = 'close'

      return {
        event: 'connection.update',
        instance: session,
        data: { state: evoState, wuid: payload.me?.id || payload.id || null },
      }
    }

    // message.any eh duplicado de 'message' no WAHA (mesmo conteudo, ID ligeiramente
    // diferente). Ignora pra evitar duplicacao no banco.
    if (wahaEvent === 'message.any') {
      return { event: 'ignored', instance: session, data: { reason: 'message.any duplicate' } }
    }

    // message -> messages.upsert (mapeia payload WAHA -> shape Baileys)
    if (wahaEvent === 'message') {
      const fromMe = !!payload.fromMe
      // Determina o JID do "outro lado" (inbound: from; outbound: to)
      const wahaJid: string = fromMe ? (payload.to || payload.from || '') : (payload.from || payload.to || '')
      // WhatsApp pode usar @lid (formato novo, privacidade) ou @c.us (legado).
      // Normalizamos pra @s.whatsapp.net pra reusar o handler Baileys-style.
      const remoteJid = wahaJid
        .replace('@c.us', '@s.whatsapp.net')
        .replace('@lid', '@s.whatsapp.net')

      // Reconstrucao do shape Baileys que nosso handler entende
      let message: any = {}
      if (payload.body && (!payload.hasMedia || payload.type === 'chat')) {
        message.conversation = payload.body
      } else if (payload.hasMedia || payload._data?.mediaUrl || payload.media) {
        const mediaUrl = payload.media?.url || payload._data?.mediaUrl || payload.mediaUrl || null
        const mime = payload._data?.mimetype || payload.mimetype || ''
        if (mime.startsWith('image/')) {
          message.imageMessage = { url: mediaUrl, mimetype: mime, caption: payload.body || null }
        } else if (mime.startsWith('video/')) {
          message.videoMessage = { url: mediaUrl, mimetype: mime, caption: payload.body || null }
        } else if (mime.startsWith('audio/')) {
          message.audioMessage = { url: mediaUrl, mimetype: mime }
        } else {
          message.documentMessage = {
            url: mediaUrl,
            mimetype: mime,
            fileName: payload._data?.filename || payload.filename || null,
            caption: payload.body || null,
          }
        }
      } else if (payload.body) {
        message.conversation = payload.body
      }

      return {
        event: 'messages.upsert',
        instance: session,
        data: {
          key: { id: payload.id, fromMe, remoteJid },
          message,
          messageTimestamp: payload.timestamp,
          pushName: payload._data?.notifyName || payload.notifyName || null,
        },
      }
    }

    // message.ack -> messages.update (status delivered/read)
    if (wahaEvent === 'message.ack') {
      const ack = payload.ack
      let status = ''
      if (ack === 2 || ack === 'DEVICE')   status = 'DELIVERED'
      else if (ack === 3 || ack === 'READ') status = 'READ'
      else if (ack === 4 || ack === 'PLAYED') status = 'PLAYED'
      return {
        event: 'messages.update',
        instance: session,
        data: { key: { id: payload.id }, status },
      }
    }

    // Outros eventos WAHA: ignora (qr, group, etc — nao usamos)
    return { event: wahaEvent.replace(/\./g, '_'), instance: session, data: payload }
  }

  // Fallback Evolution shape mesmo sem .data
  return {
    event: raw.event || '',
    instance: raw.instance || '',
    data: raw.data || raw,
  }
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

async function findOrCreateProspectByPhoneWithError(
  supabase: SupabaseClient,
  phone: string,
  pushName: string | null,
  avatarUrl: string | null = null,
): Promise<{ id: string | null; error: string | null }> {
  const r = await findOrCreateProspectByPhoneInternal(supabase, phone, pushName, avatarUrl)
  return r
}

async function findOrCreateProspectByPhoneInternal(
  supabase: SupabaseClient,
  phone: string,
  pushName: string | null,
  avatarUrl: string | null = null,
): Promise<{ id: string | null; error: string | null }> {
  const { data: existing, error: findErr } = await supabase
    .from('crm_prospects')
    .select('id, avatar_url')
    .eq('phone', phone)
    .is('deleted_at', null)
    .limit(1)
    .maybeSingle()
  if (findErr) return { id: null, error: `find: ${findErr.message}` }
  if (existing?.id) {
    // Atualiza avatar se chegou novo e o existente nao tinha (refresh URL expirada)
    if (avatarUrl && !existing.avatar_url) {
      await supabase
        .from('crm_prospects')
        .update({ avatar_url: avatarUrl })
        .eq('id', existing.id)
    }
    return { id: existing.id, error: null }
  }

  const name = pushName || `WhatsApp ${phone.slice(-4)}`
  const { data: created, error: insErr } = await supabase
    .from('crm_prospects')
    .insert({
      contact_name: name,
      company_name: name,
      phone,
      avatar_url:   avatarUrl,
      source:       'whatsapp_inbound',
      status:       'new',
    })
    .select('id')
    .single()

  if (insErr) {
    // Race condition: outro webhook simultaneo ja criou. Re-consulta.
    // Codigo 23505 = unique_violation (partial index uq_crm_prospects_whatsapp_phone).
    if ((insErr as any).code === '23505') {
      const { data: retry } = await supabase
        .from('crm_prospects')
        .select('id')
        .eq('phone', phone)
        .eq('source', 'whatsapp_inbound')
        .is('deleted_at', null)
        .limit(1)
        .maybeSingle()
      if (retry?.id) return { id: retry.id, error: null }
    }
    return { id: null, error: `insert: ${insErr.message}` }
  }
  return { id: created?.id || null, error: null }
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
