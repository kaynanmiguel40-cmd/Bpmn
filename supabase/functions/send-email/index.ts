/**
 * Supabase Edge Function: send-email
 *
 * Envia e-mails 100% via SMTP DA VPS (sem Resend/SendGrid). Configure os secrets
 * na edge function: SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, e opcionalmente
 * SMTP_SECURE ('true' = TLS implícito/porta 465; senão STARTTLS na 587/25),
 * FROM_EMAIL, FROM_NAME, REPLY_TO_EMAIL, UNSUBSCRIBE_EMAIL.
 *
 * Contrato (inalterado): POST { to, subject, body, html?, reply_to? }
 *   -> { success: true } | { success: false, error }
 *
 * Deploy: copiar pra /opt/supabase/volumes/functions/send-email e
 *   docker restart supabase-edge-functions
 */

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { SMTPClient } from 'https://deno.land/x/denomailer@1.6.0/mod.ts'

const SMTP_HOST = Deno.env.get('SMTP_HOST') || ''
const SMTP_PORT = parseInt(Deno.env.get('SMTP_PORT') || '587', 10)
const SMTP_USER = Deno.env.get('SMTP_USER') || ''
const SMTP_PASS = Deno.env.get('SMTP_PASS') || ''
// TLS implícito só faz sentido na 465. Na 587/25 o denomailer negocia STARTTLS.
const SMTP_SECURE = (Deno.env.get('SMTP_SECURE') ?? (SMTP_PORT === 465 ? 'true' : 'false')) === 'true'
const FROM_EMAIL = Deno.env.get('FROM_EMAIL') || 'noreply@fyness.com.br'
const FROM_NAME = Deno.env.get('FROM_NAME') || 'Fyness CRM'
const REPLY_TO_EMAIL = Deno.env.get('REPLY_TO_EMAIL') || undefined
const UNSUBSCRIBE_EMAIL = Deno.env.get('UNSUBSCRIBE_EMAIL') || REPLY_TO_EMAIL || FROM_EMAIL

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

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  try {
    const { to, subject, body, html, reply_to } = await req.json()

    if (!to || !subject) {
      return json({ error: 'Campos obrigatórios: to, subject', success: false }, 400)
    }
    if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS) {
      return json({ error: 'SMTP não configurado (SMTP_HOST/SMTP_USER/SMTP_PASS)', success: false }, 500)
    }

    const recipients = Array.isArray(to) ? to : [to]
    // denomailer exige um corpo: manda o texto; se só veio HTML, um fallback mínimo.
    const text = body || (html ? ' ' : ' ')

    const client = new SMTPClient({
      connection: {
        hostname: SMTP_HOST,
        port: SMTP_PORT,
        tls: SMTP_SECURE,
        auth: { username: SMTP_USER, password: SMTP_PASS },
      },
    })

    try {
      await client.send({
        from: `${FROM_NAME} <${FROM_EMAIL}>`,
        to: recipients,
        subject,
        content: text,
        html: html || undefined,
        replyTo: reply_to || REPLY_TO_EMAIL || undefined,
        // RFC 2369 / 8058: exigidos por Gmail/Yahoo desde 2024. Sem isso vai pra
        // spam mesmo com SPF/DKIM/DMARC ok.
        headers: {
          'List-Unsubscribe': `<mailto:${UNSUBSCRIBE_EMAIL}?subject=unsubscribe>`,
          'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click',
        },
      })
    } finally {
      await client.close()
    }

    return json({ success: true })
  } catch (err) {
    return json({ error: err instanceof Error ? err.message : String(err), success: false }, 500)
  }
})
