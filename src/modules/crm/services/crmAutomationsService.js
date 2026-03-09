/**
 * crmAutomationsService.js
 * CRUD de regras de automação + motor de disparo automático
 */

import { supabase } from '../../../lib/supabase';

// ─── ID helpers ──────────────────────────────────────────────────────────────

function genId(prefix) {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
}

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
    id:              genId('crm_auto'),
    name:            payload.name,
    pipeline_id:     payload.pipelineId || null,
    stage_id:        payload.stageId    || null,
    channel:         payload.channel,
    message_type:    payload.messageType,
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

// ─── Motor de disparo ─────────────────────────────────────────────────────────

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

  // 3. Determinar destinatário
  const recipient = deal.contactEmail || deal.contactPhone || deal.contactName || '';

  // 4. Para cada automação matching: gravar log
  const stageName = deal.stage?.name || '';
  const logs = matched.map(a => ({
    id:               genId('crm_alog'),
    automation_id:    a.id,
    deal_id:          deal.id,
    deal_title:       deal.title,
    stage_name:       stageName,
    channel:          a.channel,
    recipient,
    message_snapshot: a.message_content || a.media_url || '',
    status:           'sent',
    // TODO: integrar API real por canal:
    //   email     → Resend / SendGrid via Supabase Edge Function
    //   whatsapp  → Meta Business API / Z-API
    //   sms       → Twilio
    sent_at: new Date().toISOString(),
  }));

  const { error } = await supabase.from('crm_automation_logs').insert(logs);
  if (error) console.warn('[triggerAutomationsForDeal] erro ao gravar logs:', error);
}
