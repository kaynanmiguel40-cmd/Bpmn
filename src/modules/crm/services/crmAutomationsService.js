/**
 * crmAutomationsService.js
 * CRUD de regras de automação + motor de disparo automático
 */

import { supabase } from '../../../lib/supabase';

// ─── Transformers ─────────────────────────────────────────────────────────────

function dbToAutomation(row) {
  if (!row) return null;
  return {
    id:             row.id,
    name:           row.name,
    pipelineId:     row.pipeline_id,
    stageId:        row.stage_id,
    channel:        row.channel,
    messageType:    row.message_type,
    subject:        row.subject || '',
    messageContent: row.message_content,
    mediaUrl:       row.media_url,
    segmentFilter:  row.segment_filter,
    delayMinutes:   row.delay_minutes ?? 0,
    active:         row.active ?? true,
    createdBy:      row.created_by,
    createdAt:      row.created_at,
    updatedAt:      row.updated_at,
    // relacionamentos (join)
    pipeline:       row.pipeline  ? { id: row.pipeline.id,  name: row.pipeline.name  } : null,
    stage:          row.stage     ? { id: row.stage.id,     name: row.stage.name, color: row.stage.color } : null,
  };
}

function dbToLog(row) {
  if (!row) return null;
  return {
    id:              row.id,
    automationId:    row.automation_id,
    dealId:          row.deal_id,
    dealTitle:       row.deal_title,
    stageName:       row.stage_name,
    channel:         row.channel,
    recipient:       row.recipient,
    messageSnapshot: row.message_snapshot,
    status:          row.status,
    errorMessage:    row.error_message,
    sentAt:          row.sent_at,
  };
}

// ─── CRUD: Automações ─────────────────────────────────────────────────────────

export async function getAutomations(filters = {}) {
  let query = supabase
    .from('crm_automations')
    .select(`
      *,
      pipeline:crm_pipelines(id, name),
      stage:crm_pipeline_stages(id, name, color)
    `, { count: 'exact' })
    .is('deleted_at', null)
    .order('created_at', { ascending: false });

  if (filters.pipelineId) query = query.eq('pipeline_id', filters.pipelineId);
  if (filters.stageId)    query = query.eq('stage_id', filters.stageId);
  if (filters.active !== undefined) query = query.eq('active', filters.active);

  const { data, error, count } = await query;
  if (error) { console.error('[getAutomations]', error); return { data: [], count: 0 }; }
  return { data: (data || []).map(dbToAutomation), count: count || 0 };
}

export async function createAutomation(payload) {
  const { data: session } = await supabase.auth.getSession();
  const userId = session?.session?.user?.id;

  const row = {
    name:            payload.name,
    pipeline_id:     payload.pipelineId || null,
    stage_id:        payload.stageId    || null,
    channel:         payload.channel,
    message_type:    payload.messageType,
    subject:         payload.subject        || null,
    message_content: payload.messageContent || null,
    media_url:       payload.mediaUrl       || null,
    segment_filter:  payload.segmentFilter  || null,
    delay_minutes:   payload.delayMinutes   ?? 0,
    active:          payload.active         ?? true,
    created_by:      userId,
    created_at:      new Date().toISOString(),
    updated_at:      new Date().toISOString(),
  };

  const { data, error } = await supabase
    .from('crm_automations')
    .insert(row)
    .select()
    .single();

  if (error) { console.error('[createAutomation]', error); throw error; }
  return dbToAutomation(data);
}

export async function updateAutomation(id, payload) {
  const updates = {
    updated_at: new Date().toISOString(),
  };
  if (payload.name           !== undefined) updates.name            = payload.name;
  if (payload.pipelineId     !== undefined) updates.pipeline_id     = payload.pipelineId;
  if (payload.stageId        !== undefined) updates.stage_id        = payload.stageId;
  if (payload.channel        !== undefined) updates.channel         = payload.channel;
  if (payload.messageType    !== undefined) updates.message_type    = payload.messageType;
  if (payload.subject        !== undefined) updates.subject         = payload.subject;
  if (payload.messageContent !== undefined) updates.message_content = payload.messageContent;
  if (payload.mediaUrl       !== undefined) updates.media_url       = payload.mediaUrl;
  if (payload.segmentFilter  !== undefined) updates.segment_filter  = payload.segmentFilter;
  if (payload.delayMinutes   !== undefined) updates.delay_minutes   = payload.delayMinutes;
  if (payload.active         !== undefined) updates.active          = payload.active;

  const { data, error } = await supabase
    .from('crm_automations')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) { console.error('[updateAutomation]', error); throw error; }
  return dbToAutomation(data);
}

export async function deleteAutomation(id) {
  const { error } = await supabase
    .from('crm_automations')
    .update({ deleted_at: new Date().toISOString() })
    .eq('id', id);

  if (error) { console.error('[deleteAutomation]', error); throw error; }
}

export async function toggleAutomation(id, active) {
  return updateAutomation(id, { active });
}

// ─── CRUD: Logs ───────────────────────────────────────────────────────────────

export async function getAutomationLogs(filters = {}) {
  const page    = filters.page    ?? 1;
  const perPage = filters.perPage ?? 25;
  const from    = (page - 1) * perPage;
  const to      = from + perPage - 1;

  let query = supabase
    .from('crm_automation_logs')
    .select('*', { count: 'exact' })
    .order('sent_at', { ascending: false })
    .range(from, to);

  if (filters.status)       query = query.eq('status', filters.status);
  if (filters.channel)      query = query.eq('channel', filters.channel);
  if (filters.stageName)    query = query.eq('stage_name', filters.stageName);
  if (filters.automationId) query = query.eq('automation_id', filters.automationId);
  if (filters.dealId)       query = query.eq('deal_id', filters.dealId);

  // Filtro de data
  if (filters.startDate) query = query.gte('sent_at', filters.startDate);
  if (filters.endDate)   query = query.lte('sent_at', filters.endDate);

  const { data, error, count } = await query;
  if (error) { console.error('[getAutomationLogs]', error); return { data: [], count: 0 }; }
  return { data: (data || []).map(dbToLog), count: count || 0 };
}

export async function getAutomationLogStats(days = 7) {
  const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();

  const { data, error } = await supabase
    .from('crm_automation_logs')
    .select('status, channel')
    .gte('sent_at', since);

  if (error || !data) return { total: 0, sent: 0, delivered: 0, error: 0, byChannel: {} };

  const stats = { total: data.length, sent: 0, delivered: 0, error: 0, byChannel: {} };
  for (const row of data) {
    if (row.status === 'sent')      stats.sent++;
    if (row.status === 'delivered') stats.delivered++;
    if (row.status === 'error')     stats.error++;
    stats.byChannel[row.channel] = (stats.byChannel[row.channel] || 0) + 1;
  }
  return stats;
}

// ─── Templating ───────────────────────────────────────────────────────────────

/**
 * Substitui variáveis no formato {chave} pelo valor correspondente.
 * Variáveis suportadas: {nome}, {empresa}, {valor}, {etapa}, {vendedor}.
 * Aceita acentos e maiúsculas indistintamente: {Nome}, {NOME}, {nome} → ok.
 * Variáveis não conhecidas são preservadas (devolvidas como vieram).
 */
export function renderTemplate(text, deal) {
  if (!text) return '';
  const ctx = {
    nome:     deal?.contact?.name || deal?.contactName || '',
    empresa:  deal?.company?.name || '',
    valor:    typeof deal?.value === 'number'
                ? deal.value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
                : '',
    etapa:    deal?.stage?.name   || '',
    vendedor: deal?.owner?.name   || '',
  };
  return text.replace(/\{([^{}]+)\}/g, (match, key) => {
    const norm = String(key).trim().toLowerCase();
    return Object.prototype.hasOwnProperty.call(ctx, norm) ? ctx[norm] : match;
  });
}

// Texto plano → HTML simples (preserva quebras de linha).
function textToHtml(text) {
  if (!text) return '';
  const escaped = text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
  return `<div style="font-family:system-ui,-apple-system,Segoe UI,Roboto,sans-serif;font-size:14px;line-height:1.5;color:#1f2937;white-space:pre-wrap;">${escaped}</div>`;
}

// ─── Dispatchers por canal ────────────────────────────────────────────────────

/**
 * Envia e-mail via Edge Function `send-email` (Resend).
 * Retorna { ok, error } — nunca lança.
 */
async function dispatchEmail({ to, subject, body }) {
  if (!to) return { ok: false, error: 'Destinatário sem e-mail cadastrado' };
  try {
    const { data, error } = await supabase.functions.invoke('send-email', {
      body: { to, subject, body, html: textToHtml(body) },
    });
    if (error) return { ok: false, error: error.message || String(error) };
    if (!data?.success) return { ok: false, error: data?.error || 'Falha no provedor' };
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err?.message || 'Erro inesperado no envio' };
  }
}

/**
 * Normaliza telefone para o formato esperado pela Evolution API:
 * apenas dígitos (sem '+', espaços, parênteses).
 */
function normalizePhone(raw) {
  if (!raw) return '';
  return String(raw).replace(/\D/g, '');
}

/**
 * Envia WhatsApp via Edge Function `evolution-send`.
 * Retorna { ok, error } — nunca lança.
 *
 * Requer: phone, content, contactId (ou prospectId — automation sempre
 * disparada por deal, então usa contactId).
 */
async function dispatchWhatsApp({ phone, content, contactId, dealId, automationId }) {
  if (!phone) return { ok: false, error: 'Destinatário sem telefone cadastrado' };
  if (!contactId) return { ok: false, error: 'Deal sem contato vinculado (necessário pra logar a mensagem)' };
  const normalized = normalizePhone(phone);
  if (normalized.length < 10) return { ok: false, error: `Telefone inválido: ${phone}` };

  try {
    const { data, error } = await supabase.functions.invoke('evolution-send', {
      body: {
        phone:        normalized,
        content,
        contactId,
        dealId,
        automationId,
        source:       'automation',
      },
    });
    if (error) return { ok: false, error: error.message || String(error) };
    if (data?.ok === false) return { ok: false, error: data?.error || 'Falha no envio WhatsApp' };
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err?.message || 'Erro inesperado no envio WhatsApp' };
  }
}

// ─── Motor de disparo ─────────────────────────────────────────────────────────

/**
 * Carrega joins necessários para o templating quando o deal recebido
 * não trouxe (ex.: vindo de update().select() plano em moveDealToStage).
 * Mescla sem sobrescrever campos já presentes.
 */
async function enrichDealIfNeeded(deal) {
  const needs = !deal.company || !deal.stage || !deal.owner || !deal.contact;
  if (!needs || !deal.id) return deal;

  const { data: row } = await supabase
    .from('crm_deals')
    .select(`
      id, contact_name, contact_email, contact_phone, value, title, segment,
      crm_contacts(id, name, email, phone),
      crm_companies(id, name, segment),
      crm_pipeline_stages(id, name, color),
      team_members(id, name, color)
    `)
    .eq('id', deal.id)
    .single();

  if (!row) return deal;

  return {
    ...deal,
    contactName:  deal.contactName  ?? row.contact_name,
    contactEmail: deal.contactEmail ?? row.contact_email,
    contactPhone: deal.contactPhone ?? row.contact_phone,
    contact: deal.contact || (row.crm_contacts ? {
      id: row.crm_contacts.id, name: row.crm_contacts.name, email: row.crm_contacts.email, phone: row.crm_contacts.phone,
    } : null),
    company: deal.company || (row.crm_companies ? {
      id: row.crm_companies.id, name: row.crm_companies.name, segment: row.crm_companies.segment,
    } : null),
    stage: deal.stage || (row.crm_pipeline_stages ? {
      id: row.crm_pipeline_stages.id, name: row.crm_pipeline_stages.name, color: row.crm_pipeline_stages.color,
    } : null),
    owner: deal.owner || (row.team_members ? {
      id: row.team_members.id, name: row.team_members.name, color: row.team_members.color,
    } : null),
  };
}

/**
 * Chamado após moveDealToStage(). Fire-and-forget.
 * deal → objeto já transformado por dbToCrmDeal()
 */
export async function triggerAutomationsForDeal(deal, stageId) {
  if (!deal || !stageId) return;

  // 1. Buscar automações ativas para esta etapa
  const { data: automations } = await supabase
    .from('crm_automations')
    .select('*')
    .eq('stage_id', stageId)
    .eq('active', true)
    .is('deleted_at', null);

  if (!automations || automations.length === 0) return;

  // 2. Filtrar por segmento do deal
  const matched = automations.filter(a => {
    if (!a.segment_filter) return true; // sem filtro → dispara para todos
    return a.segment_filter === deal.segment;
  });

  if (matched.length === 0) return;

  // Enriquecer com joins (company/stage/owner) se vierem ausentes
  deal = await enrichDealIfNeeded(deal);

  const stageName = deal.stage?.name || '';

  // 3. Para cada automação: renderizar, despachar e gravar log com status real
  const logs = await Promise.all(matched.map(async (a) => {
    const renderedSubject = a.subject ? renderTemplate(a.subject, deal) : a.name;
    const renderedBody    = renderTemplate(a.message_content || '', deal);

    let recipient = '';
    let result = { ok: false, error: 'Canal não implementado' };

    if (a.channel === 'email') {
      recipient = deal.contactEmail || deal.contact?.email || '';
      result = await dispatchEmail({
        to:      recipient,
        subject: renderedSubject,
        body:    renderedBody,
      });
    } else if (a.channel === 'whatsapp') {
      recipient = deal.contactPhone || deal.contact?.phone || '';
      result = await dispatchWhatsApp({
        phone:        recipient,
        content:      renderedBody,
        contactId:    deal.contactId || deal.contact?.id || null,
        dealId:       deal.id,
        automationId: a.id,
      });
    } else {
      recipient = deal.contactPhone || deal.contactName || '';
      result = { ok: false, error: `Canal ${a.channel} não suportado` };
    }

    return {
      automation_id:    a.id,
      deal_id:          deal.id,
      deal_title:       deal.title,
      stage_name:       stageName,
      channel:          a.channel,
      recipient,
      message_snapshot: renderedBody || a.media_url || '',
      status:           result.ok ? 'sent' : 'error',
      error_message:    result.ok ? null : result.error,
      sent_at:          new Date().toISOString(),
    };
  }));

  const { error } = await supabase.from('crm_automation_logs').insert(logs);
  if (error) console.warn('[triggerAutomationsForDeal] erro ao gravar logs:', error);
}
