/**
 * Supabase Edge Function: evolution-send
 *
 * Envia mensagem WhatsApp via WAHA (devlikeapro/waha) ou Evolution API.
 * Detecta provider via env `EVOLUTION_PROVIDER` (default: 'waha').
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
 *   EVOLUTION_URL=https://evo.fyness.com.br
 *   EVOLUTION_API_KEY=...
 *   EVOLUTION_PROVIDER=waha (ou 'evolution')
 *
 * Deploy: supabase functions deploy evolution-send
 */

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const SUPABASE_URL          = Deno.env.get('SUPABASE_URL')!
const SUPABASE_SERVICE_KEY  = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
const EVOLUTION_URL         = Deno.env.get('EVOLUTION_URL')!
const EVOLUTION_API_KEY     = Deno.env.get('EVOLUTION_API_KEY')!
const PROVIDER              = (Deno.env.get('EVOLUTION_PROVIDER') || 'waha').toLowerCase()

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
  instanceName: string
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

// ============= Evolution: helpers (legado) =============

async function evolutionSend(
  instanceName: string,
  phone: string,
  content: string | undefined,
  mediaUrl: string | undefined,
  mediaType: string | undefined,
  mediaCaption: string | undefined,
) {
  const isMedia = !!mediaUrl
  const endpoint = isMedia
    ? `${EVOLUTION_URL}/message/sendMedia/${encodeURIComponent(instanceName)}`
    : `${EVOLUTION_URL}/message/sendText/${encodeURIComponent(instanceName)}`

  // Evolution v1.x usa payload aninhado em textMessage/mediaMessage.
  const payload = isMedia
    ? {
        number: phone,
        options: { delay: 0, presence: 'composing' },
        mediaMessage: {
          mediatype: mediaType || 'image',
          media:     mediaUrl,
          caption:   mediaCaption || content || undefined,
        },
      }
    : {
        number: phone,
        options: { delay: 0, presence: 'composing' },
        textMessage: { text: content || '' },
      }

  const r = await fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', apikey: EVOLUTION_API_KEY },
    body: JSON.stringify(payload),
  })
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
  if (!instanceName || !phone) return json({ ok: false, error: 'instanceName e phone obrigatorios' }, 400)
  if (!content && !mediaUrl) return json({ ok: false, error: 'content ou mediaUrl obrigatorios' }, 400)
  if (!body.contactId && !body.prospectId) return json({ ok: false, error: 'contactId ou prospectId obrigatorio' }, 400)

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)

  // 1) Resolve instance. Se a passada nao existe, fallback pra primeira
  // 'connected' (resolve problema de cliente com .env stale)
  let { data: instance } = await supabase
    .from('crm_whatsapp_instances')
    .select('id, status, phone_number, instance_name')
    .eq('instance_name', instanceName)
    .is('deleted_at', null)
    .maybeSingle()

  if (!instance) {
    const fallback = await supabase
      .from('crm_whatsapp_instances')
      .select('id, status, phone_number, instance_name')
      .eq('status', 'connected')
      .is('deleted_at', null)
      .limit(1)
      .maybeSingle()
    if (fallback.data) {
      instance = fallback.data
      // Atualiza o instanceName usado nas chamadas pro provider
      ;(body as SendBody).instanceName = instance.instance_name
    }
  }

  if (!instance) return json({ ok: false, error: `Nenhuma instance conectada encontrada (tentou '${instanceName}')` }, 404)
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
      // Evolution API (legado)
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
