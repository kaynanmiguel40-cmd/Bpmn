import { createCRUDService } from '../../../lib/serviceFactory';
import { supabase } from '../../../lib/supabase';
import { toast } from '../../../contexts/ToastContext';
import { crmTrafficSchema } from '../schemas/crmValidation';

// ==================== TRANSFORMADOR ====================

export function dbToTrafficEntry(row) {
  if (!row) return null;
  return {
    id: row.id,
    channel: row.channel,
    pipelineId: row.pipeline_id || null,
    pipeline: row.crm_pipelines ? {
      id: row.crm_pipelines.id,
      name: row.crm_pipelines.name,
    } : null,
    periodStart: row.period_start,
    periodEnd: row.period_end,
    amountSpent: Number(row.amount_spent) || 0,
    impressions: row.impressions || 0,
    clicks: row.clicks || 0,
    leadsGenerated: row.leads_generated || 0,
    conversions: row.conversions || 0,
    revenueGenerated: Number(row.revenue_generated) || 0,
    notes: row.notes || '',
    createdBy: row.created_by || null,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    deletedAt: row.deleted_at || null,
  };
}

// ==================== CRUD VIA FACTORY ====================

const trafficService = createCRUDService({
  table: 'crm_paid_traffic',
  localKey: 'crm_paid_traffic',
  idPrefix: 'crm_tf',
  transform: dbToTrafficEntry,
  schema: crmTrafficSchema,
  fieldMap: {
    channel: 'channel',
    pipelineId: 'pipeline_id',
    periodStart: 'period_start',
    periodEnd: 'period_end',
    amountSpent: 'amount_spent',
    impressions: 'impressions',
    clicks: 'clicks',
    leadsGenerated: 'leads_generated',
    conversions: 'conversions',
    revenueGenerated: 'revenue_generated',
    notes: 'notes',
  },
  orderBy: 'period_start',
  orderAsc: false,
});

// ==================== FUNCOES EXPORTADAS ====================

export async function getTrafficEntries(filters = {}) {
  const { search, channel, pipelineId, startDate, endDate, page, perPage = 25 } = filters;

  let query = supabase
    .from('crm_paid_traffic')
    .select('*, crm_pipelines(id, name)', { count: 'exact' })
    .is('deleted_at', null);

  if (search) query = query.ilike('channel', `%${search}%`);
  if (channel) query = query.eq('channel', channel);
  if (pipelineId) query = query.eq('pipeline_id', pipelineId);
  if (startDate) query = query.gte('period_start', startDate);
  if (endDate) query = query.lte('period_end', endDate);

  query = query.order('period_start', { ascending: false });

  if (page && perPage) {
    const from = (page - 1) * perPage;
    query = query.range(from, from + perPage - 1);
  }

  const { data, error, count } = await query;
  if (error) {
    toast(`Erro ao buscar registros de trafego: ${error.message}`, 'error');
    return { data: [], count: 0 };
  }
  return { data: (data || []).map(dbToTrafficEntry), count: count || 0 };
}

export async function getTrafficKPIs(filters = {}) {
  const { startDate, endDate, channel, pipelineId } = filters;

  let query = supabase
    .from('crm_paid_traffic')
    .select('amount_spent, impressions, clicks, leads_generated, conversions, revenue_generated')
    .is('deleted_at', null);

  if (channel) query = query.eq('channel', channel);
  if (pipelineId) query = query.eq('pipeline_id', pipelineId);
  if (startDate) query = query.gte('period_start', startDate);
  if (endDate) query = query.lte('period_end', endDate);

  const { data, error } = await query;
  if (error) {
    console.error('[CRM Traffic] Erro KPIs:', error);
    return null;
  }

  const rows = data || [];
  const totalSpent = rows.reduce((s, r) => s + (Number(r.amount_spent) || 0), 0);
  const totalImpressions = rows.reduce((s, r) => s + (r.impressions || 0), 0);
  const totalClicks = rows.reduce((s, r) => s + (r.clicks || 0), 0);
  const totalLeads = rows.reduce((s, r) => s + (r.leads_generated || 0), 0);
  const totalConversions = rows.reduce((s, r) => s + (r.conversions || 0), 0);
  const totalRevenue = rows.reduce((s, r) => s + (Number(r.revenue_generated) || 0), 0);

  return {
    totalSpent,
    totalImpressions,
    totalClicks,
    totalLeads,
    totalConversions,
    totalRevenue,
    cpl: totalLeads > 0 ? totalSpent / totalLeads : 0,
    cpc: totalClicks > 0 ? totalSpent / totalClicks : 0,
    ctr: totalImpressions > 0 ? (totalClicks / totalImpressions) * 100 : 0,
    roas: totalSpent > 0 ? totalRevenue / totalSpent : 0,
  };
}

export async function getTrafficByChannel(filters = {}) {
  const { startDate, endDate, pipelineId } = filters;

  let query = supabase
    .from('crm_paid_traffic')
    .select('channel, amount_spent, impressions, clicks, leads_generated, conversions, revenue_generated')
    .is('deleted_at', null);

  if (pipelineId) query = query.eq('pipeline_id', pipelineId);
  if (startDate) query = query.gte('period_start', startDate);
  if (endDate) query = query.lte('period_end', endDate);

  const { data, error } = await query;
  if (error) {
    console.error('[CRM Traffic] Erro by channel:', error);
    return [];
  }

  const map = {};
  for (const row of data || []) {
    if (!map[row.channel]) {
      map[row.channel] = { channel: row.channel, spent: 0, impressions: 0, clicks: 0, leads: 0, conversions: 0, revenue: 0 };
    }
    map[row.channel].spent += Number(row.amount_spent) || 0;
    map[row.channel].impressions += row.impressions || 0;
    map[row.channel].clicks += row.clicks || 0;
    map[row.channel].leads += row.leads_generated || 0;
    map[row.channel].conversions += row.conversions || 0;
    map[row.channel].revenue += Number(row.revenue_generated) || 0;
  }

  return Object.values(map).sort((a, b) => b.spent - a.spent);
}

export async function getTrafficOverTime(filters = {}) {
  const { startDate, endDate, channel, pipelineId } = filters;

  let query = supabase
    .from('crm_paid_traffic')
    .select('period_start, amount_spent, leads_generated, clicks, revenue_generated')
    .is('deleted_at', null);

  if (channel) query = query.eq('channel', channel);
  if (pipelineId) query = query.eq('pipeline_id', pipelineId);
  if (startDate) query = query.gte('period_start', startDate);
  if (endDate) query = query.lte('period_end', endDate);

  query = query.order('period_start', { ascending: true });

  const { data, error } = await query;
  if (error) {
    console.error('[CRM Traffic] Erro over time:', error);
    return [];
  }

  const map = {};
  for (const row of data || []) {
    const month = row.period_start?.slice(0, 7);
    if (!month) continue;
    if (!map[month]) {
      map[month] = { month, spent: 0, leads: 0, clicks: 0, revenue: 0 };
    }
    map[month].spent += Number(row.amount_spent) || 0;
    map[month].leads += row.leads_generated || 0;
    map[month].clicks += row.clicks || 0;
    map[month].revenue += Number(row.revenue_generated) || 0;
  }

  return Object.values(map).map(m => ({
    ...m,
    cpl: m.leads > 0 ? m.spent / m.leads : 0,
  }));
}

export async function createTrafficEntry(data) {
  const session = await supabase.auth.getSession();
  const userId = session.data?.session?.user?.id;
  return trafficService.create(data, { created_by: userId });
}

export async function updateTrafficEntry(id, updates) {
  return trafficService.update(id, updates);
}

export async function softDeleteTrafficEntry(id) {
  const { error } = await supabase
    .from('crm_paid_traffic')
    .update({ deleted_at: new Date().toISOString() })
    .eq('id', id);

  if (error) {
    toast(`Erro ao excluir registro: ${error.message}`, 'error');
    return false;
  }
  return true;
}
