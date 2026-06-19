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
const PROVIDER                  = (Deno.env.get('EVOLUTION_PROVIDER') || 'evolution').toLowerCase()

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
 * Espelha midia inbound do WAHA no Supabase Storage.
 *
 * WAHA serve midia via /api/files/{session}/{msgId}.ext, protegida por X-Api-Key.
 * Como <img> nao pode passar header, e a URL eh relativa ao WAHA, baixamos a
 * midia aqui (com a key) e re-hostamos no bucket 'crm-whatsapp-media'.
 *
 * Retorna URL publica do Storage ou null em erro.
 */
async function mirrorWahaMediaToStorage(
  supabase: SupabaseClient,
  rawUrl: string,
  mediaType: string | null,
  mime: string | null,
): Promise<string | null> {
  if (!rawUrl || !EVOLUTION_URL || !EVOLUTION_API_KEY) return null
  // Constroi URL absoluta se for relativa (WAHA retorna paths tipo /api/files/...)
  let absUrl = rawUrl
  if (rawUrl.startsWith('/')) {
    absUrl = `${EVOLUTION_URL}${rawUrl}`
  } else if (rawUrl.includes('localhost') || rawUrl.includes('127.0.0.1')) {
    // Substitui localhost pelo dominio do WAHA
    try {
      const u = new URL(rawUrl)
      absUrl = `${EVOLUTION_URL}${u.pathname}${u.search}`
    } catch { /* mantem rawUrl */ }
  }

  try {
    const r = await fetch(absUrl, { headers: { 'X-Api-Key': EVOLUTION_API_KEY } })
    if (!r.ok) return null
    const blob = await r.blob()
    const contentType = blob.type || mime || 'application/octet-stream'

    // Determina extensao a partir do MIME
    const extMap: Record<string, string> = {
      'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp', 'image/gif': 'gif',
      'video/mp4': 'mp4', 'video/quicktime': 'mov', 'video/webm': 'webm',
      'audio/mpeg': 'mp3', 'audio/mp4': 'm4a', 'audio/ogg': 'ogg', 'audio/wav': 'wav', 'audio/webm': 'webm',
      'application/pdf': 'pdf',
    }
    const ext = extMap[contentType] || 'bin'
    const path = `inbound/${crypto.randomUUID()}.${ext}`

    const { error: upErr } = await supabase.storage
      .from('crm-whatsapp-media')
      .upload(path, blob, { contentType, upsert: false })
    if (upErr) return null

    const { data: pub } = supabase.storage.from('crm-whatsapp-media').getPublicUrl(path)
    return pub.publicUrl
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

// ============= Evolution: helpers de midia/contato =============

/**
 * Baixa a midia inbound da Evolution em base64.
 * A Evolution serve midia recebida como URL criptografada (.enc) que nao
 * renderiza no browser; o jeito robusto e pedir o base64 pela message key.
 */
async function evolutionGetMediaBase64(
  instance: string,
  messageId: string,
): Promise<{ base64: string; mimetype: string | null } | null> {
  if (!EVOLUTION_URL || !EVOLUTION_API_KEY || !messageId) return null
  try {
    const r = await fetch(
      `${EVOLUTION_URL}/chat/getBase64FromMediaMessage/${encodeURIComponent(instance)}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', apikey: EVOLUTION_API_KEY },
        body: JSON.stringify({ message: { key: { id: messageId } }, convertToMp4: false }),
      },
    )
    if (!r.ok) return null
    const data = await r.json().catch(() => null)
    const base64 = data?.base64 || data?.media || null
    if (!base64) return null
    return { base64, mimetype: data?.mimetype || null }
  } catch {
    return null
  }
}

/**
 * Re-hospeda midia (base64) no bucket crm-whatsapp-media e devolve URL publica.
 */
async function uploadBase64ToStorage(
  supabase: SupabaseClient,
  base64: string,
  mime: string | null,
): Promise<string | null> {
  try {
    const contentType = mime || 'application/octet-stream'
    const extMap: Record<string, string> = {
      'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp', 'image/gif': 'gif',
      'video/mp4': 'mp4', 'video/quicktime': 'mov', 'video/webm': 'webm',
      'audio/mpeg': 'mp3', 'audio/ogg': 'ogg', 'audio/mp4': 'm4a', 'audio/wav': 'wav',
      'application/pdf': 'pdf',
    }
    const ext = extMap[contentType] || 'bin'
    const clean = base64.includes(',') ? base64.split(',').pop()! : base64
    const bytes = Uint8Array.from(atob(clean), (c) => c.charCodeAt(0))
    const path = `inbound/${crypto.randomUUID()}.${ext}`
    const { error: upErr } = await supabase.storage
      .from('crm-whatsapp-media')
      .upload(path, bytes, { contentType, upsert: false })
    if (upErr) return null
    const { data: pub } = supabase.storage.from('crm-whatsapp-media').getPublicUrl(path)
    return pub.publicUrl
  } catch {
    return null
  }
}

/**
 * Busca a foto de perfil via API da Evolution (URL do CDN do WhatsApp, expira).
 */
async function evolutionFetchProfilePicture(instance: string, number: string): Promise<string | null> {
  if (!EVOLUTION_URL || !EVOLUTION_API_KEY || !number) return null
  // Contatos no formato novo do WhatsApp sao @lid (numeros longos / sem DDI 55).
  // Sem o sufixo @lid a Evolution resolve pra @s.whatsapp.net e retorna null.
  let target = number
  if (!number.includes('@')) {
    const n = number.replace(/\D/g, '')
    target = (n.length > 13 || !n.startsWith('55')) ? `${n}@lid` : n
  }
  async function tryFetch(num: string): Promise<string | null> {
    try {
      const r = await fetch(
        `${EVOLUTION_URL}/chat/fetchProfilePictureUrl/${encodeURIComponent(instance)}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', apikey: EVOLUTION_API_KEY },
          body: JSON.stringify({ number: num }),
        },
      )
      if (!r.ok) return null
      const data = await r.json().catch(() => null)
      return data?.profilePictureUrl || data?.profilePicUrl || data?.url || null
    } catch {
      return null
    }
  }
  // tenta o alvo resolvido; se nada e nao era @lid, tenta @lid como fallback
  let url = await tryFetch(target)
  if (!url && !target.includes('@')) {
    url = await tryFetch(`${target.replace(/\D/g, '')}@lid`)
  }
  return url
}

/**
 * Baixa uma imagem (ex: foto de perfil pps.whatsapp.net, que expira) e re-hospeda
 * no bucket crm-whatsapp-media/avatars. Retorna URL publica permanente, ou null.
 */
async function mirrorImageToStorage(
  supabase: SupabaseClient,
  url: string | null,
): Promise<string | null> {
  if (!url) return null
  try {
    const r = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' } })
    if (!r.ok) return null
    const blob = await r.blob()
    const ct = blob.type || 'image/jpeg'
    const ext = ct.includes('png') ? 'png' : ct.includes('webp') ? 'webp' : 'jpg'
    const path = `avatars/${crypto.randomUUID()}.${ext}`
    const { error } = await supabase.storage
      .from('crm-whatsapp-media')
      .upload(path, blob, { contentType: ct, upsert: false })
    if (error) return null
    const { data: pub } = supabase.storage.from('crm-whatsapp-media').getPublicUrl(path)
    return pub.publicUrl
  } catch {
    return null
  }
}

/**
 * Busca a foto de perfil na Evolution E ja re-hospeda no Storage (URL permanente).
 * Cai pra URL crua se o mirror falhar.
 */
async function evolutionFetchAvatarMirrored(
  instance: string,
  number: string,
  supabase: SupabaseClient,
): Promise<string | null> {
  const raw = await evolutionFetchProfilePicture(instance, number)
  if (!raw) return null
  return (await mirrorImageToStorage(supabase, raw)) || raw
}

/**
 * Backfill: re-hospeda as fotos de perfil de prospects/contatos que ainda nao
 * tem avatar no Storage (null ou URL pps.whatsapp.net que expira).
 * Disparado via ?action=backfill_avatars. Usa service role.
 */
async function runBackfillAvatars(supabase: SupabaseClient) {
  const { data: inst } = await supabase
    .from('crm_whatsapp_instances')
    .select('instance_name')
    .eq('status', 'connected')
    .is('deleted_at', null)
    .order('created_at', { ascending: true })
    .limit(1)
    .maybeSingle()
  const instance = inst?.instance_name
  if (!instance) return { error: 'nenhuma instancia conectada' }

  // Probe diagnostico: chamada crua pra ver URL/key/status reais do ambiente edge.
  let probe: Record<string, unknown> = {}
  try {
    const pr = await fetch(
      `${EVOLUTION_URL}/chat/fetchProfilePictureUrl/${encodeURIComponent(instance)}`,
      { method: 'POST', headers: { 'Content-Type': 'application/json', apikey: EVOLUTION_API_KEY }, body: JSON.stringify({ number: '211398994968714@lid' }) },
    )
    probe = { status: pr.status, body: (await pr.text()).slice(0, 200) }
  } catch (e) {
    probe = { error: String(e) }
  }

  let checked = 0, fetched = 0, mirrored = 0, updated = 0
  const tables = ['crm_prospects', 'crm_contacts'] as const
  for (const table of tables) {
    const { data: rows } = await supabase
      .from(table)
      .select('id, phone, avatar_url')
      .not('phone', 'is', null)
      .is('deleted_at', null)
    for (const r of rows || []) {
      checked++
      // ja re-hospedado no Storage? pula.
      if (r.avatar_url && String(r.avatar_url).includes('/storage/v1/')) continue
      const phone = String(r.phone).replace(/\D/g, '')
      if (phone.length < 8) continue
      const raw = await evolutionFetchProfilePicture(instance, phone)
      if (!raw) continue
      fetched++
      const stored = await mirrorImageToStorage(supabase, raw)
      if (!stored) continue
      mirrored++
      const { error: upErr } = await supabase.from(table).update({ avatar_url: stored }).eq('id', r.id)
      if (upErr) continue
      updated++
    }
  }
  return {
    instance,
    evolutionUrl: EVOLUTION_URL,
    keyLen: EVOLUTION_API_KEY.length,
    probe,
    checked, fetched, mirrored, updated,
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

/**
 * Detecta se um JID/numero e um "@lid" (ID opaco de privacidade do WhatsApp v2):
 * sufixo @lid OU numero longo (>13 digitos) / sem DDI 55. @lid != numero real,
 * entao gravar @lid na coluna phone DUPLICA o prospect (nunca casa no .eq('phone')).
 */
function isLid(jidOrPhone: string | null | undefined): boolean {
  if (!jidOrPhone) return false
  if (jidOrPhone.includes('@lid')) return true
  const n = normalizePhone(jidOrPhone)
  return n.length > 13 || (n.length >= 10 && !n.startsWith('55'))
}

/**
 * Um numero "real" plausivel (dig-only, 10-13 digitos) — usado pra decidir se um
 * candidato de campo paralelo serve pra resolver um @lid pro telefone verdadeiro.
 */
function looksLikeRealPhone(p: string): boolean {
  return !!p && p.length >= 10 && p.length <= 13
}

/**
 * Quando o remoteJid vem como @lid, o payload do Baileys/Evolution v2 costuma
 * trazer o numero REAL em campos paralelos (key.senderPn / participantPn /
 * remoteJidAlt / previousRemoteJid). Tenta extrair o numero real pra NAO criar
 * um prospect duplicado. Retorna o telefone real (dig-only) ou '' se nao achar.
 */
function extractRealPhoneFromLid(m: any): string {
  const candidates = [
    m?.key?.senderPn,
    m?.key?.participantPn,
    m?.key?.remoteJidAlt,
    m?.key?.previousRemoteJid,
    m?.senderPn,
    m?.participantPn,
    m?.participantAlt,
  ]
  for (const c of candidates) {
    if (!c || typeof c !== 'string' || c.includes('@lid')) continue
    const p = jidToPhone(c)
    if (looksLikeRealPhone(p) && !isLid(p)) return p
  }
  return ''
}

interface EvolutionPayload {
  event?: string
  instance?: string
  data?: any
}

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  // Auth via shared secret (se configurado). Aceita no header x-webhook-secret
  // OU na query (?secret=...) — o webhook GLOBAL da Evolution v2 nao manda
  // header custom, entao usamos a query (igual ao padrao da propria Evolution).
  if (WEBHOOK_SECRET) {
    const url = new URL(req.url)
    const provided = req.headers.get('x-webhook-secret') || url.searchParams.get('secret') || ''
    if (provided !== WEBHOOK_SECRET) {
      return json({ ok: false, error: 'invalid webhook secret' }, 401)
    }
  }

  // Acao administrativa: backfill de avatares (re-hospeda fotos no Storage).
  if (new URL(req.url).searchParams.get('action') === 'backfill_avatars') {
    const sb = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)
    const result = await runBackfillAvatars(sb)
    return json({ ok: true, action: 'backfill_avatars', ...result })
  }

  // Acao administrativa: mescla prospect duplicado (ex: @lid -> numero real).
  // Repointa crm_messages do 'from' pro 'to' e soft-deleta o 'from'.
  // Uso: POST/GET ...?action=merge_prospects&from=<dup_id>&to=<canonical_id>&secret=...
  // (crm_messages eh a UNICA tabela com FK pra crm_prospects — sem outros orfaos.)
  if (new URL(req.url).searchParams.get('action') === 'merge_prospects') {
    const u = new URL(req.url)
    const from = u.searchParams.get('from') || ''
    const to = u.searchParams.get('to') || ''
    if (!from || !to || from === to) {
      return json({ ok: false, error: 'use ?from=<dup_id>&to=<canonical_id> (ids distintos)' }, 400)
    }
    const sb = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)
    // valida que ambos existem
    const { data: prospects } = await sb
      .from('crm_prospects')
      .select('id, contact_name, phone, deleted_at')
      .in('id', [from, to])
    const fromP = prospects?.find((p) => p.id === from)
    const toP = prospects?.find((p) => p.id === to)
    if (!fromP || !toP) {
      return json({ ok: false, error: 'from e/ou to nao encontrados', from, to, found: prospects }, 404)
    }
    const { count: beforeFrom } = await sb
      .from('crm_messages').select('id', { count: 'exact', head: true }).eq('prospect_id', from)
    // repointa mensagens
    const { error: upErr, count: moved } = await sb
      .from('crm_messages').update({ prospect_id: to }, { count: 'exact' }).eq('prospect_id', from)
    if (upErr) return json({ ok: false, error: `repoint messages: ${upErr.message}` }, 500)
    // soft-delete do duplicado (preserva estrutura/auditoria)
    const { error: delErr } = await sb
      .from('crm_prospects').update({ deleted_at: new Date().toISOString() }).eq('id', from)
    if (delErr) return json({ ok: false, error: `soft-delete: ${delErr.message}` }, 500)
    const { count: afterTo } = await sb
      .from('crm_messages').select('id', { count: 'exact', head: true }).eq('prospect_id', to)
    return json({
      ok: true, action: 'merge_prospects',
      from: { id: from, name: fromP.contact_name, phone: fromP.phone },
      to: { id: to, name: toP.contact_name, phone: toP.phone },
      movedMessages: moved, beforeFromMsgs: beforeFrom, afterToMsgs: afterTo,
    })
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

// Rank pra nao rebaixar status (read > delivered > sent > pending).
const STATUS_RANK: Record<string, number> = { pending: 0, sent: 1, delivered: 2, read: 3 }

// Normaliza o ack da Evolution/Baileys (string ou number) pro nosso status.
function mapAckStatus(raw: unknown): string {
  if (raw == null) return ''
  if (typeof raw === 'number') {
    return ({ 0: 'failed', 1: 'pending', 2: 'sent', 3: 'delivered', 4: 'read', 5: 'read' } as Record<number, string>)[raw] || ''
  }
  const u = String(raw).toUpperCase()
  if (u === 'SERVER_ACK' || u === 'SENT') return 'sent'
  if (u === 'DELIVERY_ACK' || u === 'DELIVERED') return 'delivered'
  if (u === 'READ' || u === 'PLAYED') return 'read'
  if (u === 'ERROR' || u === 'FAILED') return 'failed'
  if (u === 'PENDING') return 'pending'
  return ''
}

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
    let otherPhone = jidToPhone(remoteJid)
    // @lid (privacidade WhatsApp v2): o ID opaco != numero real e DUPLICA o
    // prospect. Se o payload trouxer o numero real num campo paralelo, usa ele
    // pra casar com o prospect existente em vez de criar um novo.
    let lidResolved = false
    if (isLid(remoteJid)) {
      const real = extractRealPhoneFromLid(m)
      if (real) { otherPhone = real; lidResolved = true }
    }
    if (!otherPhone) { debug.push({ skip: 'no_otherPhone', remoteJid }); continue }

    // Dedup: ja existe? A Evolution re-emite upsert com o status atualizado
    // (SERVER_ACK -> DELIVERY_ACK -> READ). Em vez de so ignorar, avancamos os
    // ticks da mensagem outbound (sem rebaixar).
    const { data: existing } = await supabase
      .from('crm_messages')
      .select('id, status, direction')
      .eq('evolution_message_id', evolutionMessageId)
      .maybeSingle()
    if (existing) {
      if (existing.direction === 'outbound') {
        const ns = mapAckStatus(m.status)
        if (ns && (STATUS_RANK[ns] ?? -1) > (STATUS_RANK[existing.status as string] ?? -1)) {
          const patch: Record<string, unknown> = { status: ns }
          if (ns === 'delivered') patch.delivered_at = new Date().toISOString()
          if (ns === 'read') patch.read_at = new Date().toISOString()
          await supabase.from('crm_messages').update(patch).eq('id', existing.id)
        }
      }
      continue
    }

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
    // Vincula a contato existente; senao cria prospect. Vale pros 2 sentidos:
    // assim conversas que o vendedor INICIA do celular (outbound p/ numero novo)
    // tambem entram no sistema — nao so as que o lead manda primeiro.
    contactId = await findContactByPhone(supabase, otherPhone)
    if (!contactId) {
      const chatId = remoteJid.replace('@s.whatsapp.net', '@lid')
      // Evolution ja manda pushName no proprio evento; WAHA precisa buscar.
      // (Em outbound o pushName costuma vir vazio — cai no fallback "WhatsApp ....")
      let pushName: string | null = (m.pushName as string) || null
      if (!pushName && PROVIDER === 'waha') {
        pushName = await wahaGetContactName(instanceName, chatId)
      }
      // Avatar: pode vir null por timing; findOrCreate tenta atualizar depois.
      // Evolution: ja re-hospeda no Storage (pps.whatsapp.net expira).
      const avatarUrl = PROVIDER === 'waha'
        ? await wahaGetProfilePicture(instanceName, chatId)
        : await evolutionFetchAvatarMirrored(instanceName, otherPhone, supabase)
      const r = await findOrCreateProspectByPhoneWithError(supabase, otherPhone, pushName, avatarUrl)
      prospectId = r.id
      prospectError = r.error

      // Refresh: se criou/existia sem avatar e agora temos um, atualiza.
      if (prospectId && !avatarUrl) {
        const retryAvatar = PROVIDER === 'waha'
          ? await wahaGetProfilePicture(instanceName, chatId)
          : await evolutionFetchAvatarMirrored(instanceName, otherPhone, supabase)
        if (retryAvatar) {
          await supabase
            .from('crm_prospects')
            .update({ avatar_url: retryAvatar })
            .eq('id', prospectId)
            .is('avatar_url', null)
        }
      }
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

    // Espelha midia inbound no Supabase Storage pra renderizar no browser.
    //  - WAHA: serve via /api/files/* protegido por X-Api-Key; baixa e re-hospeda.
    //  - Evolution: URL vem criptografada (.enc); baixa o base64 via
    //    getBase64FromMediaMessage e re-hospeda.
    if (direction === 'inbound' && mediaType && mediaUrl) {
      let localized: string | null = mediaUrl
      if (PROVIDER === 'waha') {
        if (mediaUrl.startsWith('/') || mediaUrl.includes('localhost') || mediaUrl.includes('127.0.0.1')) {
          localized = await mirrorWahaMediaToStorage(supabase, mediaUrl, mediaType, mediaMime)
        }
      } else {
        const media = await evolutionGetMediaBase64(instanceName, evolutionMessageId)
        localized = media
          ? await uploadBase64ToStorage(supabase, media.base64, media.mimetype || mediaMime)
          : null
      }
      if (!localized) {
        debug.push({ skip: 'media_mirror_failed', direction, evolutionMessageId, provider: PROVIDER })
        continue
      }
      mediaUrl = localized
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
      lidResolved,
      remoteJid,
      content: content?.slice(0, 50),
    })
  }
  return debug
}

async function handleMessagesUpdate(supabase: SupabaseClient, data: any) {
  const updates = Array.isArray(data)
    ? data
    : (Array.isArray(data?.messages) ? data.messages : [data])
  for (const u of updates) {
    if (!u) continue
    // chave da msg: Evolution v2 varia entre key.id / keyId / messageId
    const msgId = u.key?.id || u.keyId || u.messageId || u.id
    if (!msgId) continue

    const ns = mapAckStatus(u.status ?? u.update?.status ?? u.ack)
    if (!ns) continue

    const patch: Record<string, unknown> = { status: ns }
    if (ns === 'delivered') patch.delivered_at = new Date().toISOString()
    if (ns === 'read')      patch.read_at = new Date().toISOString()
    if (ns === 'failed')    patch.error_message = u.error || 'erro reportado pelo Evolution'

    // Ticks sao da mensagem OUTBOUND. Nao rebaixa (READ nao volta pra delivered;
    // SERVER_ACK so promove de pending; failed so se ainda nao entregou).
    let q = supabase.from('crm_messages').update(patch)
      .eq('evolution_message_id', msgId)
      .eq('direction', 'outbound')
    if (ns === 'delivered') q = q.neq('status', 'read')
    if (ns === 'sent')      q = q.eq('status', 'pending')
    if (ns === 'failed')    q = q.in('status', ['pending', 'sent'])
    await q
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
