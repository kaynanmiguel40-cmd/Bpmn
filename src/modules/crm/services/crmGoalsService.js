import { createCRUDService } from '../../../lib/serviceFactory';
import { supabase } from '../../../lib/supabase';
import { toast } from '../../../contexts/ToastContext';
import { crmGoalSchema } from '../schemas/crmValidation';
import { getTrafficKPIs } from './crmTrafficService';
import { getSalesReport, getLearnedProbabilities } from './crmReportsService';

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

  if (search) query = query.ilike('title', `%${search}%`);
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

export async function getCrmGoalById(id) {
  const { data, error } = await supabase
    .from('crm_goals')
    .select('*, team_members(id, name, color, auth_user_id)')
    .eq('id', id)
    .is('deleted_at', null)
    .single();

  if (error) {
    toast(`Erro ao buscar meta: ${error.message}`, 'error');
    return null;
  }
  return dbToCrmGoal(data);
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
 * Retorna map de goalId -> { autoValue } calculado dos deals won no periodo.
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

  // Buscar todos os deals won no periodo global
  const { data: deals, error } = await supabase
    .from('crm_deals')
    .select('created_by, value, closed_at')
    .eq('status', 'won')
    .gte('closed_at', minStart)
    .lte('closed_at', maxEnd)
    .is('deleted_at', null);

  if (error) {
    console.error('[CRM Goals] Erro ao buscar progresso:', error);
    return {};
  }

  const progressMap = {};

  for (const goal of goals) {
    // Filtrar deals do periodo desta goal
    const periodDeals = (deals || []).filter(d => {
      if (!d.closed_at) return false;
      const closed = d.closed_at.split('T')[0];
      return closed >= goal.periodStart && closed <= goal.periodEnd;
    });

    let autoValue = 0;

    if (goal.type === 'global') {
      // Meta global: soma todos os deals won no periodo
      autoValue = periodDeals.reduce((sum, d) => sum + (d.value || 0), 0);
    } else if (goal.owner?.authUserId) {
      // Meta individual: soma deals do owner
      autoValue = periodDeals
        .filter(d => d.created_by === goal.owner.authUserId)
        .reduce((sum, d) => sum + (d.value || 0), 0);
    }

    progressMap[goal.id] = { autoValue };
  }

  return progressMap;
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
