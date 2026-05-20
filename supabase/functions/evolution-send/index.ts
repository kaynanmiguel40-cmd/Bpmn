/**
 * Supabase Edge Function: evolution-send
 *
 * Envia mensagem WhatsApp via Evolution API e grava em crm_messages.
 *
 * Body JSON:
 *   {
 *     instanceName: string,        // ex: 'fyness-principal'
 *     phone: string,               // E.164 sem '+' (ex: '5511999999999')
 *     content?: string,            // texto (obrigatorio se nao houver mediaUrl)
 *     mediaUrl?: string,           // url publica da midia (obrigatorio se nao houver content)
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
 * Envs (Supabase Secrets):
 *   EVOLUTION_URL=https://evo.seudominio.com
 *   EVOLUTION_API_KEY=...
 *   SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY (auto-injetadas pelo Supabase)
 *
 * Deploy: supabase functions deploy evolution-send
 */

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const SUPABASE_URL          = Deno.env.get('SUPABASE_URL')!
const SUPABASE_SERVICE_KEY  = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
const EVOLUTION_URL         = Deno.env.get('EVOLUTION_URL')!
const EVOLUTION_API_KEY     = Deno.env.get('EVOLUTION_API_KEY')!

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
  if (!instanceName || !phone) {
    return json({ ok: false, error: 'instanceName e phone obrigatorios' }, 400)
  }
  if (!content && !mediaUrl) {
    return json({ ok: false, error: 'content ou mediaUrl obrigatorios' }, 400)
  }
  if (!body.contactId && !body.prospectId) {
    return json({ ok: false, error: 'contactId ou prospectId obrigatorio' }, 400)
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)

  // 1) Resolve instance
  const { data: instance, error: instErr } = await supabase
    .from('crm_whatsapp_instances')
    .select('id, status, phone_number')
    .eq('instance_name', instanceName)
    .is('deleted_at', null)
    .maybeSingle()

  if (instErr) return json({ ok: false, error: `Erro ao buscar instance: ${instErr.message}` }, 500)
  if (!instance) return json({ ok: false, error: `Instance '${instanceName}' nao registrada` }, 404)
  if (instance.status !== 'connected') {
    return json({ ok: false, error: `Instance esta '${instance.status}', precisa estar 'connected'` }, 409)
  }

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

  // 3) Chama Evolution API
  const isMedia = !!mediaUrl
  const endpoint = isMedia
    ? `${EVOLUTION_URL}/message/sendMedia/${encodeURIComponent(instanceName)}`
    : `${EVOLUTION_URL}/message/sendText/${encodeURIComponent(instanceName)}`

  const payload = isMedia
    ? {
        number:    phone,
        mediatype: mediaType || 'image',
        mimetype:  undefined,
        caption:   mediaCaption || content || '',
        media:     mediaUrl,
        fileName:  undefined,
      }
    : { number: phone, text: content }

  let evolutionMessageId: string | null = null
  let success = false
  let errorMessage: string | null = null

  try {
    const evoRes = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        apikey:         EVOLUTION_API_KEY,
      },
      body: JSON.stringify(payload),
    })
    const evoData = await evoRes.json()

    if (!evoRes.ok) {
      errorMessage = evoData?.message || `HTTP ${evoRes.status}`
    } else {
      evolutionMessageId = evoData?.key?.id || evoData?.messageId || null
      success = true
    }
  } catch (err) {
    errorMessage = (err as Error).message
  }

  // 4) Atualiza status final
  await supabase
    .from('crm_messages')
    .update({
      status:               success ? 'sent' : 'failed',
      evolution_message_id: evolutionMessageId,
      error_message:        errorMessage,
    })
    .eq('id', msgRow.id)

  if (!success) {
    return json({ ok: false, error: errorMessage, messageId: msgRow.id }, 502)
  }

  return json({
    ok: true,
    messageId: msgRow.id,
    evolutionMessageId,
  })
})
