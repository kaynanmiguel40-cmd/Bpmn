/**
 * crmLeadReportsService - relato diário por lead + consolidação do dia.
 *
 *  - saveLeadReport / getLeadReport: o vendedor escreve, no painel da Agenda,
 *    uma observação sobre um lead naquele dia (tabela crm_lead_daily_reports).
 *  - getDailyReport(date): monta o "relatório grande" do dia — os leads que o
 *    vendedor atendeu (ligação / mensagem / atividade concluída) com os
 *    contadores do que foi feito + o relato escrito de cada um.
 *
 * Tudo filtrado pelo autor logado (cada vendedor gera o relatório dele).
 */

import { supabase } from '../../../lib/supabase';
import { toast } from '../../../contexts/ToastContext';

/** Chave estável do lead (bate com o lead_key da tabela). */
export function leadKeyOf(dealId, contactId) {
  return `${dealId || ''}:${contactId || ''}`;
}

async function currentUserId() {
  const { data } = await supabase.auth.getSession();
  return data?.session?.user?.id || null;
}

/** Limites ISO [início, fim) do dia local de uma data 'YYYY-MM-DD'. */
function dayBounds(dateStr) {
  const start = new Date(`${dateStr}T00:00:00`);
  const end = new Date(start.getTime() + 24 * 60 * 60 * 1000);
  return { startISO: start.toISOString(), endISO: end.toISOString() };
}

// ==================== RELATO POR LEAD (escrita no painel) ====================

/** Relato do lead naquele dia, do autor logado (ou null). */
export async function getLeadReport({ dealId = null, contactId = null, date }) {
  if (!date || (!dealId && !contactId)) return null;
  const uid = await currentUserId();
  const { data, error } = await supabase
    .from('crm_lead_daily_reports')
    .select('*')
    .eq('lead_key', leadKeyOf(dealId, contactId))
    .eq('report_date', date)
    .eq('created_by', uid)
    .maybeSingle();
  if (error) return null; // tabela ausente / sem relato — silencioso (campo fica vazio)
  return data || null;
}

/** Cria ou atualiza o relato do lead no dia (upsert por lead/dia/autor). */
export async function saveLeadReport({ dealId = null, contactId = null, content, date }) {
  if (!date || (!dealId && !contactId)) return { ok: false, error: 'Lead ou data ausente' };
  const uid = await currentUserId();
  const lead_key = leadKeyOf(dealId, contactId);

  const { data: existing } = await supabase
    .from('crm_lead_daily_reports')
    .select('id')
    .eq('lead_key', lead_key)
    .eq('report_date', date)
    .eq('created_by', uid)
    .maybeSingle();

  if (existing?.id) {
    const { error } = await supabase
      .from('crm_lead_daily_reports')
      .update({ content })
      .eq('id', existing.id);
    if (error) { toast(`Erro ao salvar relato: ${error.message}`, 'error'); return { ok: false, error: error.message }; }
    return { ok: true, id: existing.id };
  }

  const { data, error } = await supabase
    .from('crm_lead_daily_reports')
    .insert({ lead_key, deal_id: dealId, contact_id: contactId, report_date: date, content, created_by: uid })
    .select('id')
    .single();
  if (error) { toast(`Erro ao salvar relato: ${error.message}`, 'error'); return { ok: false, error: error.message }; }
  return { ok: true, id: data.id };
}

// ==================== RELATÓRIO DO DIA (consolidação) ====================

const leadName = (deal, contact) => deal?.title || contact?.name || 'Sem vínculo';

/**
 * Monta o relatório do dia do autor logado: leads atendidos (atividade
 * concluída / ligação / mensagem enviada no dia) + contadores + relato.
 *
 * @param {string} date - 'YYYY-MM-DD'
 * @returns {Promise<{ date, summary, leads: object[] }>}
 */
export async function getDailyReport(date, ownerId = null) {
  const empty = { date, summary: { leads: 0, withReport: 0, calls: 0, messages: 0, activities: 0 }, leads: [] };
  if (!date) return empty;
  const uid = ownerId || await currentUserId();
  if (!uid) return empty;
  const { startISO, endISO } = dayBounds(date);

  const [actsRes, callsRes, msgsRes, reportsRes, meetingsRes, dealsRes] = await Promise.all([
    supabase.from('crm_activities')
      .select('id, title, type, start_date, completed_at, deal_id, contact_id, crm_deals(id, title, crm_pipeline_stages(name, color)), crm_contacts(id, name)')
      .eq('completed', true).eq('created_by', uid)
      .gte('completed_at', startISO).lt('completed_at', endISO).is('deleted_at', null),
    supabase.from('crm_calls')
      .select('id, outcome, started_at, notes, duration_seconds, deal_id, contact_id, crm_deals(id, title, crm_pipeline_stages(name, color)), crm_contacts(id, name)')
      .eq('created_by', uid)
      .gte('started_at', startISO).lt('started_at', endISO).is('deleted_at', null),
    supabase.from('crm_messages')
      .select('id, direction, content, media_type, sent_at, deal_id, contact_id, crm_deals(id, title, crm_pipeline_stages(name, color)), crm_contacts(id, name)')
      .eq('created_by', uid)
      .gte('sent_at', startISO).lt('sent_at', endISO),
    supabase.from('crm_lead_daily_reports')
      .select('lead_key, deal_id, contact_id, content, crm_deals(id, title, crm_pipeline_stages(name, color)), crm_contacts(id, name)')
      .eq('report_date', date).eq('created_by', uid),
    // Reuniões MARCADAS no dia (por quando foram agendadas = created_at)
    supabase.from('crm_activities')
      .select('id, title, start_date, completed, deal_id, contact_id, crm_deals(id, title, crm_pipeline_stages(name, color)), crm_contacts(id, name)')
      .eq('type', 'meeting').eq('created_by', uid)
      .gte('created_at', startISO).lt('created_at', endISO).is('deleted_at', null),
    // Negócios FECHADOS no dia (ganho/perdido)
    supabase.from('crm_deals')
      .select('id, title, value, status, closed_at, contact_id, crm_pipeline_stages(name, color)')
      .in('status', ['won', 'lost']).eq('created_by', uid)
      .gte('closed_at', startISO).lt('closed_at', endISO).is('deleted_at', null),
  ]);

  // Agrupa por leadKey: contadores + nome/estágio + eventos detalhados do dia.
  const map = new Map();
  const touch = (dealId, contactId, deal, contact) => {
    const key = leadKeyOf(dealId, contactId);
    if (!map.has(key)) {
      map.set(key, {
        leadKey: key, dealId: dealId || null, contactId: contactId || null,
        name: leadName(deal, contact),
        stage: deal?.crm_pipeline_stages?.name || null,
        stageColor: deal?.crm_pipeline_stages?.color || null,
        counts: { calls: 0, messages: 0, activities: 0 },
        events: [],
        report: '',
      });
    }
    return map.get(key);
  };

  (actsRes.data || []).forEach(r => {
    const l = touch(r.deal_id, r.contact_id, r.crm_deals, r.crm_contacts);
    l.counts.activities++;
    l.events.push({ id: `a_${r.id}`, kind: 'activity', activityType: r.type, time: r.completed_at || r.start_date, title: r.title || '', detail: '' });
  });
  (callsRes.data || []).forEach(r => {
    const l = touch(r.deal_id, r.contact_id, r.crm_deals, r.crm_contacts);
    l.counts.calls++;
    l.events.push({ id: `c_${r.id}`, kind: 'call', time: r.started_at, outcome: r.outcome || null, detail: r.notes || '', duration: r.duration_seconds ?? null });
  });
  (msgsRes.data || []).forEach(r => {
    const l = touch(r.deal_id, r.contact_id, r.crm_deals, r.crm_contacts);
    l.counts.messages++;
    l.events.push({ id: `m_${r.id}`, kind: 'message', time: r.sent_at, direction: r.direction || 'outbound', detail: r.content || (r.media_type ? `[${r.media_type}]` : '') });
  });

  // Reuniões marcadas no dia (pula as já contadas como atividade concluída)
  const completedActIds = new Set((actsRes.data || []).map(r => r.id));
  (meetingsRes.data || []).forEach(r => {
    if (completedActIds.has(r.id)) return;
    const l = touch(r.deal_id, r.contact_id, r.crm_deals, r.crm_contacts);
    l.events.push({
      id: `mt_${r.id}`, kind: 'meeting', time: r.start_date,
      detail: r.start_date ? new Date(r.start_date).toLocaleDateString('pt-BR', { weekday: 'short', day: '2-digit', month: 'short' }) : '',
    });
  });

  // Negócios fechados no dia (ganho/perdido) — o marco "fechou algo"
  (dealsRes.data || []).forEach(r => {
    const l = touch(r.id, r.contact_id, { id: r.id, title: r.title, crm_pipeline_stages: r.crm_pipeline_stages }, null);
    l.events.push({ id: `d_${r.id}`, kind: 'deal', time: r.closed_at, status: r.status, value: r.value || 0 });
  });

  // Anexa os relatos (e garante que um lead só relatado, sem atendimento
  // registrado, ainda apareça no relatório — com nome/estágio corretos)
  (reportsRes.data || []).forEach(r => {
    if (!r.content) return;
    const l = touch(r.deal_id, r.contact_id, r.crm_deals, r.crm_contacts);
    l.report = r.content;
  });

  // Ordena os eventos de cada lead por hora (cronológico)
  for (const l of map.values()) l.events.sort((a, b) => new Date(a.time) - new Date(b.time));

  const leads = [...map.values()].sort((a, b) => {
    // Quem tem relato primeiro, depois por volume de atendimento
    if (!!b.report !== !!a.report) return b.report ? 1 : -1;
    const va = a.counts.calls + a.counts.messages + a.counts.activities;
    const vb = b.counts.calls + b.counts.messages + b.counts.activities;
    return vb - va;
  });

  const base = leads.reduce((acc, l) => ({
    leads: acc.leads + 1,
    withReport: acc.withReport + (l.report ? 1 : 0),
    calls: acc.calls + l.counts.calls,
    messages: acc.messages + l.counts.messages,
    activities: acc.activities + l.counts.activities,
  }), { leads: 0, withReport: 0, calls: 0, messages: 0, activities: 0 });

  const wonDeals = (dealsRes.data || []).filter(d => d.status === 'won');
  const summary = {
    ...base,
    meetings: (meetingsRes.data || []).length,
    sales: wonDeals.length,
    lost: (dealsRes.data || []).filter(d => d.status === 'lost').length,
    revenue: wonDeals.reduce((s, d) => s + (d.value || 0), 0),
  };

  return { date, summary, leads };
}

// ==================== RELATÓRIO SEMANAL (consolidação) ====================

/** 'YYYY-MM-DD' deslocado em N dias. */
function shiftDay(dateStr, days) {
  const d = new Date(`${dateStr}T00:00:00`);
  d.setDate(d.getDate() + days);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

/** Limites ISO [início, fim) de uma semana de 7 dias a partir de 'YYYY-MM-DD'. */
function weekBounds(weekStartStr) {
  const start = new Date(`${weekStartStr}T00:00:00`);
  const end = new Date(start.getTime() + 7 * 24 * 60 * 60 * 1000);
  return { startISO: start.toISOString(), endISO: end.toISOString() };
}

const emptyWeek = (weekStart) => ({
  weekStart,
  weekEnd: weekStart ? shiftDay(weekStart, 6) : null,
  metrics: { meetings: 0, sales: 0, revenue: 0, conversionRate: 0, closedDeals: 0, leads: 0, calls: 0, messages: 0, activities: 0 },
  summary: { leads: 0, withReport: 0, reports: 0 },
  leads: [],
});

/**
 * Núcleo comum dos relatórios de período (semana/mês): consolida relatos diários
 * por lead + contadores + métricas (reuniões marcadas, vendas, receita,
 * conversão). reportStart/reportEnd são 'YYYY-MM-DD' (inclusivos) pros relatos.
 */
async function periodReport(uid, startISO, endISO, reportStart, reportEnd) {
  const [actsRes, callsRes, msgsRes, reportsRes, meetingsRes, wonRes, closedRes, openTasksRes] = await Promise.all([
    supabase.from('crm_activities')
      .select('deal_id, contact_id, crm_deals(id, title, crm_pipeline_stages(name, color)), crm_contacts(id, name)')
      .eq('completed', true).eq('created_by', uid)
      .gte('completed_at', startISO).lt('completed_at', endISO).is('deleted_at', null),
    supabase.from('crm_calls')
      .select('deal_id, contact_id, crm_deals(id, title, crm_pipeline_stages(name, color)), crm_contacts(id, name)')
      .eq('created_by', uid)
      .gte('started_at', startISO).lt('started_at', endISO).is('deleted_at', null),
    supabase.from('crm_messages')
      .select('deal_id, contact_id, crm_deals(id, title, crm_pipeline_stages(name, color)), crm_contacts(id, name)')
      .eq('direction', 'outbound').eq('created_by', uid)
      .gte('sent_at', startISO).lt('sent_at', endISO),
    supabase.from('crm_lead_daily_reports')
      .select('lead_key, deal_id, contact_id, content, report_date, crm_deals(id, title, crm_pipeline_stages(name, color)), crm_contacts(id, name)')
      .eq('created_by', uid)
      .gte('report_date', reportStart).lte('report_date', reportEnd),
    supabase.from('crm_activities')
      .select('id', { count: 'exact', head: true })
      .eq('type', 'meeting').eq('created_by', uid)
      .gte('start_date', startISO).lt('start_date', endISO).is('deleted_at', null),
    supabase.from('crm_deals')
      .select('value').eq('status', 'won').eq('created_by', uid)
      .gte('closed_at', startISO).lt('closed_at', endISO).is('deleted_at', null),
    supabase.from('crm_deals')
      .select('status').in('status', ['won', 'lost']).eq('created_by', uid)
      .gte('closed_at', startISO).lt('closed_at', endISO).is('deleted_at', null),
    // Tarefas EM ABERTO do período (não concluídas), por start_date
    supabase.from('crm_activities')
      .select('id, title, type, start_date, deal_id, contact_id, crm_deals(id, title), crm_contacts(id, name)')
      .eq('completed', false).eq('created_by', uid)
      .gte('start_date', startISO).lt('start_date', endISO).is('deleted_at', null)
      .order('start_date', { ascending: true }),
  ]);

  const map = new Map();
  const touch = (dealId, contactId, deal, contact) => {
    const key = leadKeyOf(dealId, contactId);
    if (!map.has(key)) {
      map.set(key, {
        leadKey: key, dealId: dealId || null, contactId: contactId || null,
        name: leadName(deal, contact),
        stage: deal?.crm_pipeline_stages?.name || null,
        stageColor: deal?.crm_pipeline_stages?.color || null,
        counts: { calls: 0, messages: 0, activities: 0 },
        reports: [],
      });
    }
    return map.get(key);
  };

  (actsRes.data || []).forEach(r => { touch(r.deal_id, r.contact_id, r.crm_deals, r.crm_contacts).counts.activities++; });
  (callsRes.data || []).forEach(r => { touch(r.deal_id, r.contact_id, r.crm_deals, r.crm_contacts).counts.calls++; });
  (msgsRes.data || []).forEach(r => { touch(r.deal_id, r.contact_id, r.crm_deals, r.crm_contacts).counts.messages++; });

  let reportCount = 0;
  (reportsRes.data || []).forEach(r => {
    if (!r.content) return;
    const l = touch(r.deal_id, r.contact_id, r.crm_deals, r.crm_contacts);
    l.reports.push({ date: r.report_date, content: r.content });
    reportCount++;
  });

  for (const l of map.values()) l.reports.sort((a, b) => String(a.date).localeCompare(String(b.date)));

  const leads = [...map.values()].sort((a, b) => {
    const ar = a.reports.length > 0, br = b.reports.length > 0;
    if (ar !== br) return br ? 1 : -1;
    const va = a.counts.calls + a.counts.messages + a.counts.activities;
    const vb = b.counts.calls + b.counts.messages + b.counts.activities;
    return vb - va;
  });

  const wonDeals = wonRes.data || [];
  const closed = closedRes.data || [];
  const closedWon = closed.filter(d => d.status === 'won').length;
  const conversionRate = closed.length > 0 ? Math.round((closedWon / closed.length) * 100) : 0;

  const volume = leads.reduce((acc, l) => ({
    calls: acc.calls + l.counts.calls,
    messages: acc.messages + l.counts.messages,
    activities: acc.activities + l.counts.activities,
  }), { calls: 0, messages: 0, activities: 0 });

  const metrics = {
    meetings: meetingsRes.count || 0,
    sales: wonDeals.length,
    revenue: wonDeals.reduce((s, d) => s + (d.value || 0), 0),
    conversionRate,
    closedDeals: closed.length,
    leads: leads.length,
    calls: volume.calls,
    messages: volume.messages,
    activities: volume.activities,
  };

  const summary = {
    leads: leads.length,
    withReport: leads.filter(l => l.reports.length > 0).length,
    reports: reportCount,
  };

  // Tarefas em aberto (o que não fechou no período) + total concluídas.
  const openTasks = (openTasksRes.data || []).map(r => ({
    id: r.id,
    title: r.title || 'Tarefa',
    type: r.type,
    dueAt: r.start_date,
    leadName: r.crm_deals?.title || r.crm_contacts?.name || null,
  }));
  const tasks = { open: openTasks, openCount: openTasks.length, doneCount: (actsRes.data || []).length };

  return { metrics, summary, leads, tasks };
}

/**
 * Relatório semanal (segunda→domingo) de um vendedor (logado ou `ownerId`).
 * @param {string} weekStart - 'YYYY-MM-DD' (1º dia da semana)
 */
export async function getWeeklyReport(weekStart, ownerId = null) {
  if (!weekStart) return emptyWeek(weekStart);
  const uid = ownerId || await currentUserId();
  if (!uid) return emptyWeek(weekStart);
  const { startISO, endISO } = weekBounds(weekStart);
  const reportEnd = shiftDay(weekStart, 6);
  const core = await periodReport(uid, startISO, endISO, weekStart, reportEnd);
  return { weekStart, weekEnd: reportEnd, ...core };
}

// ==================== RELATÓRIO MENSAL ====================

/** Limites de um mês a partir de 'YYYY-MM' (ou 'YYYY-MM-DD'). */
function monthBounds(monthStr) {
  const [y, m] = monthStr.split('-').map(Number);
  const start = new Date(y, m - 1, 1, 0, 0, 0, 0);
  const end = new Date(y, m, 1, 0, 0, 0, 0); // 1º dia do mês seguinte
  const last = new Date(y, m, 0);            // último dia do mês
  const pad = (n) => String(n).padStart(2, '0');
  return {
    startISO: start.toISOString(), endISO: end.toISOString(),
    reportStart: `${y}-${pad(m)}-01`,
    reportEnd: `${last.getFullYear()}-${pad(last.getMonth() + 1)}-${pad(last.getDate())}`,
  };
}

const emptyMonth = (monthStart) => ({
  monthStart,
  metrics: { meetings: 0, sales: 0, revenue: 0, conversionRate: 0, closedDeals: 0, leads: 0, calls: 0, messages: 0, activities: 0 },
  summary: { leads: 0, withReport: 0, reports: 0 },
  leads: [],
});

/**
 * Relatório mensal de um vendedor (logado ou `ownerId`).
 * @param {string} monthStart - 'YYYY-MM'
 */
export async function getMonthlyReport(monthStart, ownerId = null) {
  if (!monthStart) return emptyMonth(monthStart);
  const uid = ownerId || await currentUserId();
  if (!uid) return emptyMonth(monthStart);
  const { startISO, endISO, reportStart, reportEnd } = monthBounds(monthStart);
  const core = await periodReport(uid, startISO, endISO, reportStart, reportEnd);
  return { monthStart, ...core };
}

// ============== ARQUIVO DE RELATÓRIOS (pessoas + índice de datas) ==============

/** Segunda-feira ('YYYY-MM-DD') da semana que contém a data. */
function mondayOfDate(dateStr) {
  const d = new Date(`${dateStr}T00:00:00`);
  const day = d.getDay();
  d.setDate(d.getDate() + (day === 0 ? -6 : 1 - day));
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

/** Pessoas (vendedores) que têm pasta no arquivo de relatórios. */
export async function listReportOwners() {
  const me = await currentUserId();
  const { data: members } = await supabase
    .from('team_members')
    .select('id, name, color, auth_user_id, crm_role')
    .not('crm_role', 'is', null)
    .not('auth_user_id', 'is', null);

  const rows = (members || [])
    .filter(m => m.auth_user_id)
    .map(m => ({ authUserId: m.auth_user_id, name: m.name || 'Vendedor', color: m.color || '#6366f1', role: m.crm_role || null, isMe: m.auth_user_id === me }));

  if (me && !rows.some(r => r.authUserId === me)) {
    rows.unshift({ authUserId: me, name: 'Você', color: '#6366f1', role: null, isMe: true });
  }
  rows.sort((a, b) => (Number(b.isMe) - Number(a.isMe)) || a.name.localeCompare(b.name));
  return rows;
}

/** Índice de relatórios de uma pessoa: dias/semanas/meses com relato escrito. */
export async function getOwnerReportIndex(ownerId) {
  const empty = { days: [], weeks: [], months: [] };
  if (!ownerId) return empty;
  const { data } = await supabase
    .from('crm_lead_daily_reports')
    .select('report_date')
    .eq('created_by', ownerId);

  const days = [...new Set((data || []).map(r => r.report_date).filter(Boolean))].sort().reverse();
  const weeks = [...new Set(days.map(mondayOfDate))].sort().reverse();
  const months = [...new Set(days.map(d => d.slice(0, 7)))].sort().reverse();
  return { days, weeks, months };
}
