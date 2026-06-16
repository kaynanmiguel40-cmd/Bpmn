#!/usr/bin/env node
/**
 * scripts/evolutionSetup.mjs
 *
 * Cria/atualiza as instancias WhatsApp na Evolution API v2 (EasyPanel) ja com o
 * webhook apontando pro Supabase, header de secret e os eventos certos. Idempotente:
 * se a instancia ja existe, so re-seta o webhook.
 *
 * Uso (PowerShell):
 *   $env:EVOLUTION_URL="https://sua-evo.easypanel.host"
 *   $env:EVOLUTION_API_KEY="<AUTHENTICATION_API_KEY da Evolution>"
 *   $env:WEBHOOK_URL="https://SEU_PROJETO.supabase.co/functions/v1/evolution-webhook"
 *   $env:WEBHOOK_SECRET="<mesma string do secret EVOLUTION_WEBHOOK_SECRET no Supabase>"
 *   node scripts/evolutionSetup.mjs
 *
 * Opcional: $env:EVOLUTION_INSTANCES="fyness-principal,lorena-consultora"
 *
 * Depois: abra /crm/whatsapp no sistema e escaneie o QR de cada numero.
 */

const EVOLUTION_URL  = (process.env.EVOLUTION_URL || '').replace(/\/+$/, '');
const API_KEY        = process.env.EVOLUTION_API_KEY || '';
const WEBHOOK_URL    = process.env.WEBHOOK_URL || '';
const WEBHOOK_SECRET = process.env.WEBHOOK_SECRET || '';

const INSTANCES = (process.env.EVOLUTION_INSTANCES || 'fyness-principal,lorena-consultora')
  .split(',').map((s) => s.trim()).filter(Boolean);

// Eventos minimos que o evolution-webhook trata.
const EVENTS = ['QRCODE_UPDATED', 'MESSAGES_UPSERT', 'MESSAGES_UPDATE', 'CONNECTION_UPDATE', 'SEND_MESSAGE'];

if (!EVOLUTION_URL || !API_KEY || !WEBHOOK_URL) {
  console.error('Faltam env vars obrigatorias: EVOLUTION_URL, EVOLUTION_API_KEY, WEBHOOK_URL.');
  console.error('(WEBHOOK_SECRET e recomendado pra validar o webhook.)');
  process.exit(1);
}
if (!WEBHOOK_SECRET) {
  console.warn('AVISO: WEBHOOK_SECRET vazio — o webhook ficara sem validacao de origem.\n');
}

const headers = { 'Content-Type': 'application/json', apikey: API_KEY };
const webhookHeaders = { 'Content-Type': 'application/json' };
if (WEBHOOK_SECRET) webhookHeaders['x-webhook-secret'] = WEBHOOK_SECRET;

const webhookConfig = {
  url: WEBHOOK_URL,
  byEvents: false,
  base64: false,
  headers: webhookHeaders,
  events: EVENTS,
};

async function api(path, method = 'GET', body) {
  const r = await fetch(`${EVOLUTION_URL}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });
  const text = await r.text();
  let data;
  try { data = JSON.parse(text); } catch { data = text; }
  return { ok: r.ok, status: r.status, data };
}

async function instanceExists(name) {
  const r = await api(`/instance/fetchInstances?instanceName=${encodeURIComponent(name)}`);
  if (!r.ok) return false;
  const arr = Array.isArray(r.data) ? r.data : (r.data ? [r.data] : []);
  return arr.length > 0;
}

async function createInstance(name) {
  return api('/instance/create', 'POST', {
    instanceName: name,
    integration: 'WHATSAPP-BAILEYS',
    qrcode: true,
    groupsIgnore: true,
    alwaysOnline: false,
    readMessages: false,
    readStatus: false,
    webhook: webhookConfig,
  });
}

async function setWebhook(name) {
  // v2 recente usa o shape aninhado { webhook: {...} }.
  return api(`/webhook/set/${encodeURIComponent(name)}`, 'POST', { webhook: webhookConfig });
}

async function main() {
  console.log(`Evolution: ${EVOLUTION_URL}`);
  console.log(`Webhook:   ${WEBHOOK_URL}${WEBHOOK_SECRET ? ' (com secret)' : ''}`);
  console.log(`Instancias: ${INSTANCES.join(', ')}`);

  for (const name of INSTANCES) {
    process.stdout.write(`\n> ${name}: `);
    const exists = await instanceExists(name);
    if (exists) {
      const w = await setWebhook(name);
      console.log(w.ok
        ? 'ja existia — webhook re-configurado.'
        : `ja existia — FALHA ao setar webhook (${w.status}): ${JSON.stringify(w.data)}`);
    } else {
      const c = await createInstance(name);
      console.log(c.ok
        ? 'criada com webhook. Escaneie o QR em /crm/whatsapp.'
        : `FALHA ao criar (${c.status}): ${JSON.stringify(c.data)}`);
    }
  }

  console.log('\nPronto. Proximo passo: abra /crm/whatsapp e escaneie o QR de cada numero.');
}

main().catch((e) => { console.error(e); process.exit(1); });
