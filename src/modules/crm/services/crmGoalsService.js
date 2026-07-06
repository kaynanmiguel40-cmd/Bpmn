import { createCRUDService } from '../../../lib/serviceFactory';
import { supabase } from '../../../lib/supabase';
import { toast } from '../../../contexts/ToastContext';
import { crmGoalSchema } from '../schemas/crmValidation';
import { getTrafficKPIs } from './crmTrafficService';
import { getSalesReport, getLearnedProbabilities } from './crmReportsService';
import { escapeIlike } from '../lib/searchFilters';

// ==================== TRANSFORMADOR ====================

export function dbToCrmGoal(row) {
  if (!row) return null;
  return {
    id: row.id,
    title: row.title,
    description: row.description || '',
    type: row.type || 'individual',
    ownerId: row.owner_id || null,
    owner: row.team_members ? {
      id: row.team_members.id,
      name: row.team_members.name,
      color: row.team_members.color,
      authUserId: row.team_members.auth_user_id || null,
    } : null,
    targetValue: row.target_value || 0,
    currentValue: row.current_value || 0,
    periodStart: row.period_start,
    periodEnd: row.period_end,
    status: row.status || 'active',
    // Meta de funil (planejador reverso)
    kind: row.kind || 'revenue',
    funnelBase: row.funnel_base || null,
    conversionRate: row.conversion_rate != null ? Number(row.conversion_rate) : null,
    createdBy: row.created_by || null,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    deletedAt: row.deleted_at || null,
  };
}

// ==================== CRUD VIA FACTORY ====================

const goalService = createCRUDService({
  table: 'crm_goals',
  localKey: 'crm_goals',
  idPrefix: 'crm_gl',
  transform: dbToCrmGoal,
  schema: crmGoalSchema,
  fieldMap: {
    title: 'title',
    description: 'description',
    type: 'type',
    ownerId: 'owner_id',
    targetValue: 'target_value',
    currentValue: 'current_value',
    periodStart: 'period_start',
    periodEnd: 'period_end',
    status: 'status',
    kind: 'kind',
    funnelBase: 'funnel_base',
    conversionRate: 'conversion_rate',
  },
  orderBy: 'period_end',
  orderAsc: true,
});

// ==================== FUNCOES EXPORTADAS ====================

export async function getCrmGoals(filters = {}) {
  const { search, type, status, page, perPage = 50 } = filters;

  let query = supabase
    .from('crm_goals')
    .select('*, team_members(id, name, color, auth_user_id)', { count: 'exact' })
    .is('deleted_at', null);

  if (search) query = query.ilike('title', `%${escapeIlike(search)}%`);
  if (type) query = query.eq('type', type);
  if (status) query = query.eq('status', status);

  query = query.order('type', { ascending: true }).order('period_end', { ascending: true });

  if (page && perPage) {
    const from = (page - 1) * perPage;
    query = query.range(from, from + perPage - 1);
  }

  const { data, error, count } = await query;
  if (error) {
    toast(`Erro ao buscar metas: ${error.message}`, 'error');
    return { data: [], count: 0 };
  }
  return { data: (data || []).map(dbToCrmGoal), count: count || 0 };
}

export async function createCrmGoal(data) {
  const session = await supabase.auth.getSession();
  const userId = session.data?.session?.user?.id;
  return goalService.create(data, { created_by: userId });
}

export async function updateCrmGoal(id, updates) {
  return goalService.update(id, updates);
}

export async function softDeleteCrmGoal(id) {
  const { error } = await supabase
    .from('crm_goals')
    .update({ deleted_at: new Date().toISOString() })
    .eq('id', id);

  if (error) {
    toast(`Erro ao excluir meta: ${error.message}`, 'error');
    return false;
  }
  return true;
}

/**
 * Busca progresso automatico de todas as goals ativas.
 * Retorna map de goalId -> { autoValue }.
 *
 * - Meta de VALOR (kind=revenue): autoValue = SOMA (R$) dos deals won no periodo.
 * - Meta de FUNIL base=sales: autoValue = QUANTIDADE de deals won no periodo.
 * - Meta de FUNIL base=calls: autoValue = QUANTIDADE de ligacoes no periodo.
 *
 * Meta global soma/conta o time todo; individual filtra pelo owner.
 */
export async function getGoalsProgress(goals) {
  if (!goals || goals.length === 0) return {};

  // Encontrar periodo min/max global para fazer uma unica query
  let minStart = null;
  let maxEnd = null;
  for (const g of goals) {
    if (!minStart || g.periodStart < minStart) minStart = g.periodStart;
    if (!maxEnd || g.periodEnd > maxEnd) maxEnd = g.periodEnd;
  }

  if (!minStart || !maxEnd) return {};

  // closed_at e timestamptz; maxEnd geralmente vem como data-only 'YYYY-MM-DD',
  // que o PostgREST resolve para 00:00:00 e descartava todos os deals fechados
  // no ultimo dia da meta. Estende o limite superior para o fim do dia.
  const maxEndBound = maxEnd.length <= 10 ? `${maxEnd}T23:59:59.999` : maxEnd;

  // So busca ligacoes se existir meta de funil baseada em ligacoes (evita egress a toa).
  const needsCalls = goals.some(g => g.kind === 'funnel' && g.funnelBase === 'calls');

  const [dealsRes, callsRes] = await Promise.all([
    supabase
      .from('crm_deals')
      .select('created_by, value, closed_at')
      .eq('status', 'won')
      .gte('closed_at', minStart)
      .lte('closed_at', maxEndBound)
      .is('deleted_at', null),
    needsCalls
      ? supabase
          .from('crm_calls')
          .select('created_by, started_at')
          .gte('started_at', minStart)
          .lte('started_at', maxEndBound)
          .is('deleted_at', null)
      : Promise.resolve({ data: [], error: null }),
  ]);

  if (dealsRes.error) {
    console.error('[CRM Goals] Erro ao buscar progresso:', dealsRes.error);
    return {};
  }
  const deals = dealsRes.data || [];
  const calls = callsRes.data || [];

  const inPeriod = (dateStr, goal) => {
    if (!dateStr) return false;
    const d = dateStr.split('T')[0];
    return d >= goal.periodStart && d <= goal.periodEnd;
  };
  const ownerMatch = (row, goal) =>
    goal.type === 'global' || row.created_by === goal.owner?.authUserId;

  const progressMap = {};

  for (const goal of goals) {
    let autoValue = 0;

    if (goal.kind === 'funnel' && goal.funnelBase === 'calls') {
      // Meta de funil por ligacoes: conta ligacoes no periodo
      autoValue = calls.filter(c => inPeriod(c.started_at, goal) && ownerMatch(c, goal)).length;
    } else if (goal.kind === 'funnel') {
      // Meta de funil por vendas: conta deals won no periodo
      autoValue = deals.filter(d => inPeriod(d.closed_at, goal) && ownerMatch(d, goal)).length;
    } else {
      // Meta de valor: soma R$ dos deals won no periodo
      autoValue = deals
        .filter(d => inPeriod(d.closed_at, goal) && ownerMatch(d, goal))
        .reduce((sum, d) => sum + (d.value || 0), 0);
    }

    progressMap[goal.id] = { autoValue };
  }

  return progressMap;
}

/**
 * Busca as metas de FUNIL ativas que se sobrepoem ao periodo dado — usadas pra
 * desenhar o overlay de metas no Funil de Conversao. Filtra por dono quando
 * `ownerId` (auth user id) e informado; senao considera globais + individuais.
 *
 * @param {{ start?: string, end?: string }} [range]
 * @param {string|null} [ownerAuthUserId] - auth user id do dono (opcional).
 * @returns {Promise<Array>} metas de funil (dbToCrmGoal).
 */
export async function getActiveFunnelGoals(range = {}, ownerAuthUserId = null) {
  const startDay = (range.start || '').split('T')[0] || null;
  const endDay = (range.end || '').split('T')[0] || null;

  let query = supabase
    .from('crm_goals')
    .select('*, team_members(id, name, color, auth_user_id)')
    .eq('kind', 'funnel')
    .eq('status', 'active')
    .is('deleted_at', null);

  // Sobreposicao de periodos: goal.start <= range.end AND goal.end >= range.start
  if (endDay) query = query.lte('period_start', endDay);
  if (startDay) query = query.gte('period_end', startDay);

  const { data, error } = await query;
  if (error) {
    console.warn('[CRM Goals] Erro ao buscar metas de funil ativas:', error.message);
    return [];
  }

  let goals = (data || []).map(dbToCrmGoal);
  if (ownerAuthUserId) {
    goals = goals.filter(g => g.type === 'global' || g.owner?.authUserId === ownerAuthUserId);
  }
  return goals;
}

/**
 * Gera sugestao de meta SMART baseada em dados reais do CRM.
 * Calculo: investimento → CPL → leads → conversao → ticket medio → meta.
 */
export async function getSmartSuggestion(periodStart, periodEnd, pipelineId = null) {
  try {
    const [traffic, sales, learned] = await Promise.all([
      getTrafficKPIs({ startDate: periodStart, endDate: periodEnd, pipelineId }),
      getSalesReport(periodStart, periodEnd),
      getLearnedProbabilities(pipelineId),
    ]);

    const cpl = traffic?.cpl || 0;
    const avgDealValue = sales?.avgDealValue || 0;
    const totalSpent = traffic?.totalSpent || 0;
    const totalLeads = traffic?.totalLeads || 0;

    // Usar conversao aprendida (mais precisa) ou conversao geral
    const conversionRate = learned?.overallConversion > 0
      ? learned.overallConversion / 100
      : (sales?.conversionRate || 0) / 100;

    const hasTrafficData = cpl > 0 && totalSpent > 0;
    const hasSalesData = avgDealValue > 0 && conversionRate > 0;
    const hasData = hasTrafficData && hasSalesData;

    // Investimento medio mensal (base pra projecao)
    const investmentAvg = totalSpent > 0 ? totalSpent : 0;
    const expectedLeads = cpl > 0 ? Math.round(investmentAvg / cpl) : totalLeads;
    const expectedDeals = Math.round(expectedLeads * conversionRate);
    const suggestedTarget = Math.round(expectedDeals * avgDealValue);

    return {
      hasData,
      investmentAvg,
      cpl,
      expectedLeads,
      conversionRate: conversionRate * 100,
      conversionSource: learned?.source || 'inference',
      avgDealValue,
      expectedDeals,
      suggestedTarget,
      totalLeads,
      totalSpent,
    };
  } catch (err) {
    console.error('[SMART Goals] Erro ao gerar sugestao:', err);
    return { hasData: false, suggestedTarget: 0 };
  }
}
