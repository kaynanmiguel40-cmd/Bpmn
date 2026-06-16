/**
 * Supabase Edge Function: evolution-send
 *
 * Envia mensagem WhatsApp via Evolution API (v2) ou WAHA (devlikeapro/waha).
 * Detecta provider via env `EVOLUTION_PROVIDER` (default: 'evolution').
 *
 * Workflow:
 *   1. Resolve chatId real via check-exists (WhatsApp v2 migrou pra @lid).
 *   2. Insere mensagem 'pending' no Supabase.
 *   3. Dispara envio.
 *   4. Atualiza status sent/failed com providerMessageId.
 *
 * Body JSON:
 *   {
 *     instanceName: string,        // ex: 'default'
 *     phone: string,               // E.164 sem '+' (ex: '5535992285099')
 *     content?: string,
 *     mediaUrl?: string,
 *     mediaType?: 'image' | 'audio' | 'video' | 'document',
 *     mediaCaption?: string,
 *     contactId?: string,
 *     prospectId?: string,
 *     dealId?: string,
 *     automationId?: string,
 *     source?: 'manual' | 'automation' | 'reply' | 'broadcast',
 *     createdBy?: string,
 *   }
 *
 * Envs:
 *   EVOLUTION_URL=https://sua-evo.easypanel.host
 *   EVOLUTION_API_KEY=...
 *   EVOLUTION_PROVIDER=evolution (ou 'waha' p/ legado)
 *   EVOLUTION_INSTANCE_DEFAULT=fyness-principal (opcional; default p/ envios sem instancia)
 *
 * Deploy: supabase functions deploy evolution-send
 */

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const SUPABASE_URL          = Deno.env.get('SUPABASE_URL')!
const SUPABASE_SERVICE_KEY  = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
const EVOLUTION_URL         = Deno.env.get('EVOLUTION_URL')!
const EVOLUTION_API_KEY     = Deno.env.get('EVOLUTION_API_KEY')!
const PROVIDER              = (Deno.env.get('EVOLUTION_PROVIDER') || 'evolution').toLowerCase()
// Instancia default pra envios sem instanceName (ex: automacoes). Com 2 numeros,
// evita o "primeira conectada" nao-deterministico — manda pelo numero da empresa.
const DEFAULT_INSTANCE      = Deno.env.get('EVOLUTION_INSTANCE_DEFAULT') || ''

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  })
}

interface SendBody {
  instanceName?: string
  phone: string
  content?: string
  mediaUrl?: string
  mediaType?: 'image' | 'audio' | 'video' | 'document'
  mediaCaption?: string
  contactId?: string
  prospectId?: string
  dealId?: string
  automationId?: string
  source?: 'manual' | 'automation' | 'reply' | 'broadcast'
  createdBy?: string
}

// ============= WAHA: helpers =============

async function wahaResolveChatId(session: string, phone: string): Promise<string> {
  // Detecta se ja eh um lid: WhatsApp Linked ID (numero longo >= 13 digitos
  // ou sem prefixo de pais valido). Nesses casos usa @lid direto.
  // Phones BR validos: 12-13 digitos com prefixo 55.
  const isLikelyLid = phone.length > 13 || !phone.startsWith('55')

  if (isLikelyLid) {
    return `${phone}@lid`
  }

  // Phone normal: tenta resolver via check-exists (pode retornar @lid se WhatsApp migrou esse numero)
  try {
    const r = await fetch(
      `${EVOLUTION_URL}/api/contacts/check-exists?phone=${encodeURIComponent(phone)}&session=${encodeURIComponent(session)}`,
      { headers: { 'X-Api-Key': EVOLUTION_API_KEY } },
    )
    if (!r.ok) return `${phone}@c.us`
    const data = await r.json()
    if (data?.numberExists && data?.chatId) return data.chatId
    return `${phone}@c.us`
  } catch {
    return `${phone}@c.us`
  }
}

async function wahaSendText(session: string, chatId: string, text: string) {
  const r = await fetch(`${EVOLUTION_URL}/api/sendText`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'X-Api-Key': EVOLUTION_API_KEY },
    body: JSON.stringify({ session, chatId, text }),
  })
  const data = await r.json().catch(() => ({}))
  return { ok: r.ok, status: r.status, data }
}

async function wahaSendMedia(
  session: string,
  chatId: string,
  mediaType: string,
  mediaUrl: string,
  caption?: string,
) {
  // WAHA endpoints separados: /api/sendImage, /api/sendVideo, /api/sendVoice, /api/sendFile
  const endpointMap: Record<string, string> = {
    image:    '/api/sendImage',
    video:    '/api/sendVideo',
    audio:    '/api/sendVoice',
    document: '/api/sendFile',
  }
  const path = endpointMap[mediaType] || '/api/sendFile'
  const r = await fetch(`${EVOLUTION_URL}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'X-Api-Key': EVOLUTION_API_KEY },
    body: JSON.stringify({
      session,
      chatId,
      file: { url: mediaUrl },
      caption: caption || undefined,
    }),
  })
  const data = await r.json().catch(() => ({}))
  return { ok: r.ok, status: r.status, data }
}

// ============= Evolution: helpers (v2) =============

// Infere mimetype + fileName a partir da URL/tipo (sendMedia v2 exige ambos).
function guessMimeAndName(url: string, mediaType: string): { mime: string; fileName: string } {
  let path = url
  try { path = new URL(url).pathname } catch { /* mantem url */ }
  const base = (path.split('/').pop() || 'arquivo').split('?')[0]
  const ext = (base.includes('.') ? base.split('.').pop() : '')?.toLowerCase() || ''
  const mimeByExt: Record<string, string> = {
    jpg: 'image/jpeg', jpeg: 'image/jpeg', png: 'image/png', webp: 'image/webp', gif: 'image/gif',
    mp4: 'video/mp4', mov: 'video/quicktime', webm: 'video/webm',
    mp3: 'audio/mpeg', m4a: 'audio/mp4', ogg: 'audio/ogg', wav: 'audio/wav',
    pdf: 'application/pdf', doc: 'application/msword',
    docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    xls: 'application/vnd.ms-excel',
    xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    txt: 'text/plain', csv: 'text/csv',
  }
  const fallbackByType: Record<string, string> = {
    image: 'image/jpeg', video: 'video/mp4', audio: 'audio/mpeg', document: 'application/octet-stream',
  }
  const mime = mimeByExt[ext] || fallbackByType[mediaType] || 'application/octet-stream'
  const fileName = base.includes('.') ? base : `${base}.${ext || 'bin'}`
  return { mime, fileName }
}

// Resolve o campo `number` da v2. Numeros lid (privacidade do WhatsApp v2) levam
// sufixo @lid; numeros BR normais vao so com digitos.
function evolutionResolveNumber(phone: string): string {
  if (phone.includes('@')) return phone
  const numericPhone = phone.replace(/\D/g, '')
  const isLikelyLid = numericPhone.length > 13 || !numericPhone.startsWith('55')
  return isLikelyLid ? `${numericPhone}@lid` : numericPhone
}

async function evolutionSend(
  instanceName: string,
  phone: string,
  content: string | undefined,
  mediaUrl: string | undefined,
  mediaType: string | undefined,
  mediaCaption: string | undefined,
) {
  const number = evolutionResolveNumber(phone)
  const headers = { 'Content-Type': 'application/json', apikey: EVOLUTION_API_KEY }

  let endpoint: string
  let payload: Record<string, unknown>

  if (mediaUrl && mediaType === 'audio') {
    // Audio (voz) tem endpoint proprio na v2.
    endpoint = `${EVOLUTION_URL}/message/sendWhatsAppAudio/${encodeURIComponent(instanceName)}`
    payload = { number, audio: mediaUrl, delay: 0 }
  } else if (mediaUrl) {
    // Imagem / video / documento. v2 = payload plano com mimetype + fileName.
    const { mime, fileName } = guessMimeAndName(mediaUrl, mediaType || 'document')
    endpoint = `${EVOLUTION_URL}/message/sendMedia/${encodeURIComponent(instanceName)}`
    payload = {
      number,
      mediatype: mediaType || 'document',
      mimetype:  mime,
      media:     mediaUrl,
      caption:   mediaCaption || content || '',
      fileName,
      delay:     0,
    }
  } else {
    // Texto. v2 = { number, text } plano (v1 usava textMessage.text aninhado).
    endpoint = `${EVOLUTION_URL}/message/sendText/${encodeURIComponent(instanceName)}`
    payload = { number, text: content || '', delay: 0 }
  }

  const r = await fetch(endpoint, { method: 'POST', headers, body: JSON.stringify(payload) })
  const data = await r.json().catch(() => ({}))
  return { ok: r.ok, status: r.status, data }
}

// ============= Handler principal =============

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  if (!EVOLUTION_URL || !EVOLUTION_API_KEY) {
    return json({ ok: false, error: 'EVOLUTION_URL ou EVOLUTION_API_KEY nao configurada' }, 500)
  }

  let body: SendBody
  try {
    body = await req.json()
  } catch {
    return json({ ok: false, error: 'JSON invalido' }, 400)
  }

  const { instanceName, phone, content, mediaUrl, mediaType, mediaCaption } = body
  // instanceName e OPCIONAL: quando ausente (ex: automacoes), caimos no
  // fallback abaixo que resolve a primeira instance 'connected'. So `phone`
  // e realmente obrigatorio aqui.
  if (!phone) return json({ ok: false, error: 'phone obrigatorio' }, 400)
  if (!content && !mediaUrl) return json({ ok: false, error: 'content ou mediaUrl obrigatorios' }, 400)
  if (!body.contactId && !body.prospectId) return json({ ok: false, error: 'contactId ou prospectId obrigatorio' }, 400)

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)

  // 1) Resolve instance. Se um instanceName foi passado, tenta ele primeiro;
  // se nao veio (automacoes) ou nao existe, fallback pra primeira 'connected'
  // (resolve problema de cliente com .env stale e envio sem instance fixa).
  let instance = null
  if (instanceName) {
    const lookup = await supabase
      .from('crm_whatsapp_instances')
      .select('id, status, phone_number, instance_name')
      .eq('instance_name', instanceName)
      .is('deleted_at', null)
      .maybeSingle()
    instance = lookup.data
  }

  if (!instance) {
    // 1) Prefere a instance default (numero da empresa), se configurada e conectada.
    if (DEFAULT_INSTANCE) {
      const def = await supabase
        .from('crm_whatsapp_instances')
        .select('id, status, phone_number, instance_name')
        .eq('instance_name', DEFAULT_INSTANCE)
        .eq('status', 'connected')
        .is('deleted_at', null)
        .maybeSingle()
      if (def.data) instance = def.data
    }
    // 2) Senao, pega a conectada mais antiga (deterministico — evita alternar
    //    entre os 2 numeros a cada envio).
    if (!instance) {
      const fallback = await supabase
        .from('crm_whatsapp_instances')
        .select('id, status, phone_number, instance_name')
        .eq('status', 'connected')
        .is('deleted_at', null)
        .order('created_at', { ascending: true })
        .limit(1)
        .maybeSingle()
      if (fallback.data) instance = fallback.data
    }
    if (instance) {
      // Atualiza o instanceName usado nas chamadas pro provider
      ;(body as SendBody).instanceName = instance.instance_name
    }
  }

  if (!instance) return json({ ok: false, error: `Nenhuma instance conectada encontrada${instanceName ? ` (tentou '${instanceName}')` : ''}` }, 404)
  if (instance.status !== 'connected') {
    return json({ ok: false, error: `Instance esta '${instance.status}', precisa estar 'connected'` }, 409)
  }
  // Re-atribui variavel local de instanceName caso fallback tenha mudado
  const effectiveInstanceName = instance.instance_name || instanceName

  // 2) Insere mensagem em 'pending' antes do envio (rastreabilidade)
  const fromPhone = instance.phone_number || ''
  const { data: msgRow, error: msgErr } = await supabase
    .from('crm_messages')
    .insert({
      instance_id:    instance.id,
      contact_id:     body.contactId    || null,
      prospect_id:    body.prospectId   || null,
      deal_id:        body.dealId       || null,
      direction:      'outbound',
      from_phone:     fromPhone,
      to_phone:       phone,
      content:        content || null,
      media_url:      mediaUrl || null,
      media_type:     mediaType || null,
      media_caption:  mediaCaption || null,
      status:         'pending',
      source:         body.source       || 'manual',
      automation_id:  body.automationId || null,
      created_by:     body.createdBy    || null,
    })
    .select('id')
    .single()

  if (msgErr || !msgRow) {
    return json({ ok: false, error: `Erro ao gravar mensagem: ${msgErr?.message}` }, 500)
  }

  // 3) Dispara envio
  let providerMessageId: string | null = null
  let success = false
  let errorMessage: string | null = null
  let chatId: string | null = null

  try {
    if (PROVIDER === 'waha') {
      // WAHA: precisa resolver chatId (pode ser @lid)
      chatId = await wahaResolveChatId(effectiveInstanceName, phone)
      const result = mediaUrl
        ? await wahaSendMedia(effectiveInstanceName, chatId, mediaType || 'image', mediaUrl, mediaCaption || content)
        : await wahaSendText(effectiveInstanceName, chatId, content || '')

      if (!result.ok) {
        errorMessage = result.data?.message || `HTTP ${result.status}`
      } else {
        // WAHA retorna o id no campo .id._serialized ou .id.id
        providerMessageId = result.data?.id?._serialized || result.data?.id?.id || result.data?.messageId || null
        success = true
      }
    } else {
      // Evolution API (v2) — resposta { key: { id }, ... }
      const result = await evolutionSend(effectiveInstanceName, phone, content, mediaUrl, mediaType, mediaCaption)
      if (!result.ok) {
        errorMessage = result.data?.message || `HTTP ${result.status}`
      } else {
        providerMessageId = result.data?.key?.id || result.data?.messageId || null
        success = true
      }
    }
  } catch (err) {
    errorMessage = (err as Error).message
  }

  // 4) Atualiza status final
  await supabase
    .from('crm_messages')
    .update({
      status:               success ? 'sent' : 'failed',
      evolution_message_id: providerMessageId,
      error_message:        errorMessage,
    })
    .eq('id', msgRow.id)

  if (!success) {
    return json({ ok: false, error: errorMessage, messageId: msgRow.id, chatId }, 502)
  }

  return json({
    ok: true,
    messageId:          msgRow.id,
    evolutionMessageId: providerMessageId,
    chatId,
    provider:           PROVIDER,
  })
})
