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
export async function getDailyReport(date) {
  const empty = { date, summary: { leads: 0, withReport: 0, calls: 0, messages: 0, activities: 0 }, leads: [] };
  if (!date) return empty;
  const uid = await currentUserId();
  if (!uid) return empty;
  const { startISO, endISO } = dayBounds(date);

  const [actsRes, callsRes, msgsRes, reportsRes] = await Promise.all([
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
      .select('lead_key, deal_id, contact_id, content')
      .eq('report_date', date).eq('created_by', uid),
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

  // Anexa os relatos (e garante que um lead só relatado, sem atendimento
  // registrado, ainda apareça no relatório)
  (reportsRes.data || []).forEach(r => {
    const key = r.lead_key || leadKeyOf(r.deal_id, r.contact_id);
    if (!map.has(key)) {
      map.set(key, {
        leadKey: key, dealId: r.deal_id || null, contactId: r.contact_id || null,
        name: 'Lead', stage: null, stageColor: null,
        counts: { calls: 0, messages: 0, activities: 0 }, events: [], report: '',
      });
    }
    map.get(key).report = r.content || '';
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

  const summary = leads.reduce((acc, l) => ({
    leads: acc.leads + 1,
    withReport: acc.withReport + (l.report ? 1 : 0),
    calls: acc.calls + l.counts.calls,
    messages: acc.messages + l.counts.messages,
    activities: acc.activities + l.counts.activities,
  }), { leads: 0, withReport: 0, calls: 0, messages: 0, activities: 0 });

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
 * Monta o relatório semanal do autor logado: junta os relatos diários da semana
 * (por lead, dia a dia) + contadores de atividade + métricas da semana:
 * reuniões marcadas, vendas feitas (deals ganhos), receita e taxa de conversão
 * (ganhos / fechados na semana). Tudo do vendedor logado, igual ao diário.
 *
 * @param {string} weekStart - 'YYYY-MM-DD' (1º dia da semana, ex.: segunda)
 * @returns {Promise<{ weekStart, weekEnd, metrics, summary, leads: object[] }>}
 */
export async function getWeeklyReport(weekStart) {
  if (!weekStart) return emptyWeek(weekStart);
  const uid = await currentUserId();
  if (!uid) return emptyWeek(weekStart);
  const { startISO, endISO } = weekBounds(weekStart);
  const reportStart = weekStart;            // 'YYYY-MM-DD'
  const reportEnd = shiftDay(weekStart, 6); // inclusivo

  const [actsRes, callsRes, msgsRes, reportsRes, meetingsRes, wonRes, closedRes] = await Promise.all([
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
      .select('lead_key, deal_id, contact_id, content, report_date')
      .eq('created_by', uid)
      .gte('report_date', reportStart).lte('report_date', reportEnd),
    // Reuniões MARCADAS na semana (por start_date, concluídas ou não)
    supabase.from('crm_activities')
      .select('id', { count: 'exact', head: true })
      .eq('type', 'meeting').eq('created_by', uid)
      .gte('start_date', startISO).lt('start_date', endISO).is('deleted_at', null),
    // Vendas FEITAS na semana (deals ganhos)
    supabase.from('crm_deals')
      .select('value').eq('status', 'won').eq('created_by', uid)
      .gte('closed_at', startISO).lt('closed_at', endISO).is('deleted_at', null),
    // Deals FECHADOS na semana (won + lost) → denominador da conversão
    supabase.from('crm_deals')
      .select('status').in('status', ['won', 'lost']).eq('created_by', uid)
      .gte('closed_at', startISO).lt('closed_at', endISO).is('deleted_at', null),
  ]);

  // ----- Consolidação por lead (atividade + relatos dia a dia) -----
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
    const key = r.lead_key || leadKeyOf(r.deal_id, r.contact_id);
    if (!map.has(key)) {
      map.set(key, {
        leadKey: key, dealId: r.deal_id || null, contactId: r.contact_id || null,
        name: 'Lead', stage: null, stageColor: null,
        counts: { calls: 0, messages: 0, activities: 0 }, reports: [],
      });
    }
    map.get(key).reports.push({ date: r.report_date, content: r.content });
    reportCount++;
  });

  for (const l of map.values()) l.reports.sort((a, b) => String(a.date).localeCompare(String(b.date)));

  const leads = [...map.values()].sort((a, b) => {
    const ar = a.reports.length > 0, br = b.reports.length > 0;
    if (ar !== br) return br ? 1 : -1; // quem tem relato primeiro
    const va = a.counts.calls + a.counts.messages + a.counts.activities;
    const vb = b.counts.calls + b.counts.messages + b.counts.activities;
    return vb - va;
  });

  // ----- Métricas da semana -----
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

  return { weekStart, weekEnd: reportEnd, metrics, summary, leads };
}
