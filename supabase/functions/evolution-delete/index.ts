/**
 * Supabase Edge Function: evolution-delete
 *
 * Revoga (apaga PARA TODOS) uma mensagem no WhatsApp via Evolution API.
 *
 * Limite do WhatsApp/Baileys: só dá pra revogar mensagem NOSSA (outbound). A
 * mensagem que o LEAD enviou não pode ser apagada do telefone dele — nesse caso
 * a função devolve revoked:false e o CRM só faz o soft-delete do lado dele.
 *
 * Entrada: POST { messageId }  (id da linha em crm_messages)
 * Saída:   { revoked: boolean, reason?: string }
 *
 * Reusa os secrets já configurados: EVOLUTION_URL, EVOLUTION_API_KEY.
 * Deploy: copiar pra /opt/supabase/volumes/functions/evolution-delete e
 *   docker restart supabase-edge-functions
 */

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const SUPABASE_URL         = Deno.env.get('SUPABASE_URL')!
const SUPABASE_SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
const EVOLUTION_URL        = Deno.env.get('EVOLUTION_URL')!
const EVOLUTION_API_KEY    = Deno.env.get('EVOLUTION_API_KEY')!

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

function json(payload: unknown, status = 200) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  })
}

// Telefone -> jid do WhatsApp. Mesma heurística do envio (evolution-send):
// número BR normal (12-13 dígitos com 55) vai como @s.whatsapp.net; o resto
// (lid, outro país) vai como @lid. Se já vier com '@', respeita.
function toJid(phone: string | null): string | null {
  const p = String(phone || '').trim()
  if (!p) return null
  if (p.includes('@')) return p
  const d = p.replace(/\D/g, '')
  if (!d) return null
  const isLid = d.length > 13 || !d.startsWith('55')
  return isLid ? `${d}@lid` : `${d}@s.whatsapp.net`
}

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  try {
    const { messageId } = await req.json()
    if (!messageId) return json({ revoked: false, reason: 'messageId obrigatório' }, 400)

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)

    const { data: msg, error } = await supabase
      .from('crm_messages')
      .select('evolution_message_id, direction, instance_id, to_phone, from_phone')
      .eq('id', messageId)
      .maybeSingle()

    if (error) return json({ revoked: false, reason: error.message }, 500)
    if (!msg) return json({ revoked: false, reason: 'mensagem não encontrada' }, 404)
    if (!msg.evolution_message_id) return json({ revoked: false, reason: 'sem id da Evolution (nunca foi pro WhatsApp)' })

    // Só dá pra revogar pra todos a mensagem NOSSA (outbound).
    if (msg.direction !== 'outbound') {
      return json({ revoked: false, reason: 'inbound — o WhatsApp não deixa apagar a mensagem do lead pra todos' })
    }

    // O "chat" (remoteJid) é sempre o lead: na outbound é pra quem enviamos (to_phone).
    const remoteJid = toJid(msg.to_phone || msg.from_phone)
    if (!remoteJid) return json({ revoked: false, reason: 'sem número do lead pra montar o remoteJid' })

    // Nome da instância Evolution.
    const { data: inst } = await supabase
      .from('crm_whatsapp_instances')
      .select('instance_name')
      .eq('id', msg.instance_id)
      .maybeSingle()
    const instanceName = inst?.instance_name
    if (!instanceName) return json({ revoked: false, reason: 'instância não resolvida' })

    // Evolution API v2: DELETE /chat/deleteMessageForEveryone/{instance}
    const res = await fetch(`${EVOLUTION_URL}/chat/deleteMessageForEveryone/${encodeURIComponent(instanceName)}`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json', apikey: EVOLUTION_API_KEY },
      body: JSON.stringify({
        id: msg.evolution_message_id,
        remoteJid,
        fromMe: true,
      }),
    })

    const detail = await res.text().catch(() => '')
    if (!res.ok) {
      return json({ revoked: false, reason: `Evolution ${res.status}`, detail: detail.slice(0, 400) })
    }
    return json({ revoked: true })
  } catch (err) {
    return json({ revoked: false, reason: err instanceof Error ? err.message : String(err) }, 500)
  }
})
