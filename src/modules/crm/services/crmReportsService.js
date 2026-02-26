import { supabase } from '../../../lib/supabase';
import { toast } from '../../../contexts/ToastContext';

// ==================== RELATORIO DE VENDAS ====================

export async function getSalesReport(startDate, endDate) {
  try {
    const [wonRes, lostRes, openRes] = await Promise.all([
      supabase.from('crm_deals').select('*').eq('status', 'won').gte('closed_at', startDate).lte('closed_at', endDate).is('deleted_at', null),
      supabase.from('crm_deals').select('*').eq('status', 'lost').gte('closed_at', startDate).lte('closed_at', endDate).is('deleted_at', null),
      supabase.from('crm_deals').select('*').eq('status', 'open').is('deleted_at', null),
    ]);

    const won = wonRes.data || [];
    const lost = lostRes.data || [];

    const totalWonValue = won.reduce((sum, d) => sum + (d.value || 0), 0);
    const totalLostValue = lost.reduce((sum, d) => sum + (d.value || 0), 0);
    const avgDealValue = won.length > 0 ? totalWonValue / won.length : 0;

    // Tempo medio de fechamento (dias)
    const closeTimes = won
      .filter(d => d.created_at && d.closed_at)
      .map(d => (new Date(d.closed_at) - new Date(d.created_at)) / (1000 * 60 * 60 * 24));
    const avgCloseTime = closeTimes.length > 0 ? Math.round(closeTimes.reduce((a, b) => a + b, 0) / closeTimes.length) : 0;

    return {
      period: { startDate, endDate },
      won: { count: won.length, totalValue: totalWonValue },
      lost: { count: lost.length, totalValue: totalLostValue },
      open: { count: (openRes.data || []).length },
      avgDealValue: Math.round(avgDealValue),
      avgCloseTimeDays: avgCloseTime,
      conversionRate: (won.length + lost.length) > 0
        ? Math.round((won.length / (won.length + lost.length)) * 100)
        : 0,
      wonDeals: won.map(d => ({ id: d.id, title: d.title, value: d.value, closedAt: d.closed_at })),
    };
  } catch (err) {
    toast('Erro ao gerar relatorio de vendas', 'error');
    return null;
  }
}

// ==================== RELATORIO DE FUNIL ====================

export async function getFunnelReport(pipelineId) {
  try {
    const { data: stages } = await supabase
      .from('crm_pipeline_stages')
      .select('id, name, position, color')
      .eq('pipeline_id', pipelineId)
      .order('position');

    const { data: deals } = await supabase
      .from('crm_deals')
      .select('id, title, value, stage_id, status, created_at')
      .eq('pipeline_id', pipelineId)
      .eq('status', 'open')
      .is('deleted_at', null);

    const stageMap = {};
    (stages || []).forEach(s => {
      stageMap[s.id] = {
        ...s,
        deals: [],
        totalValue: 0,
        count: 0,
      };
    });

    (deals || []).forEach(d => {
      if (stageMap[d.stage_id]) {
        stageMap[d.stage_id].deals.push(d);
        stageMap[d.stage_id].totalValue += d.value || 0;
        stageMap[d.stage_id].count++;
      }
    });

    const funnelStages = (stages || []).map(s => stageMap[s.id]);
    const totalDeals = funnelStages.reduce((sum, s) => sum + s.count, 0);

    // Taxa de conversao entre etapas
    const conversionRates = funnelStages.map((stage, idx) => ({
      from: idx > 0 ? funnelStages[idx - 1].name : 'Entrada',
      to: stage.name,
      rate: idx > 0 && funnelStages[idx - 1].count > 0
        ? Math.round((stage.count / funnelStages[idx - 1].count) * 100)
        : 100,
    }));

    return {
      pipelineId,
      totalDeals,
      totalValue: funnelStages.reduce((sum, s) => sum + s.totalValue, 0),
      stages: funnelStages,
      conversionRates,
    };
  } catch (err) {
    toast('Erro ao gerar relatorio de funil', 'error');
    return null;
  }
}

// ==================== RELATORIO DE FORECAST ====================

export async function getForecastReport() {
  try {
    const { data: deals } = await supabase
      .from('crm_deals')
      .select('id, title, value, probability, expected_close_date, stage_id, crm_pipeline_stages(name), crm_contacts(name), crm_companies(name)')
      .eq('status', 'open')
      .is('deleted_at', null)
      .order('expected_close_date');

    const now = new Date();
    const months = {};

    // Agrupar por mes de fechamento esperado
    (deals || []).forEach(d => {
      const closeDate = d.expected_close_date ? new Date(d.expected_close_date) : null;
      const monthKey = closeDate
        ? `${closeDate.getFullYear()}-${String(closeDate.getMonth() + 1).padStart(2, '0')}`
        : 'sem_data';

      if (!months[monthKey]) {
        months[monthKey] = { month: monthKey, deals: [], totalValue: 0, weightedValue: 0 };
      }

      const weighted = (d.value || 0) * ((d.probability || 50) / 100);
      months[monthKey].deals.push({
        id: d.id,
        title: d.title,
        value: d.value || 0,
        probability: d.probability || 50,
        weightedValue: Math.round(weighted),
        expectedCloseDate: d.expected_close_date,
        stage: d.crm_pipeline_stages?.name || '',
        contact: d.crm_contacts?.name || '',
        company: d.crm_companies?.name || '',
      });
      months[monthKey].totalValue += d.value || 0;
      months[monthKey].weightedValue += Math.round(weighted);
    });

    const forecast = Object.values(months).sort((a, b) => a.month.localeCompare(b.month));
    const totalWeighted = forecast.reduce((sum, m) => sum + m.weightedValue, 0);
    const totalPipeline = forecast.reduce((sum, m) => sum + m.totalValue, 0);

    return {
      totalPipeline,
      totalWeighted,
      months: forecast,
    };
  } catch (err) {
    toast('Erro ao gerar forecast', 'error');
    return null;
  }
}

// ==================== RELATORIO DE ATIVIDADES ====================

export async function getActivitiesReport(startDate, endDate) {
  try {
    const { data } = await supabase
      .from('crm_activities')
      .select('id, title, type, completed, start_date, completed_at, created_by')
      .gte('start_date', startDate)
      .lte('start_date', endDate)
      .is('deleted_at', null)
      .order('start_date');

    const activities = data || [];
    const total = activities.length;
    const completed = activities.filter(a => a.completed).length;
    const pending = total - completed;

    // Por tipo
    const byType = {};
    activities.forEach(a => {
      if (!byType[a.type]) byType[a.type] = { total: 0, completed: 0 };
      byType[a.type].total++;
      if (a.completed) byType[a.type].completed++;
    });

    // Por dia da semana
    const byDayOfWeek = [0, 0, 0, 0, 0, 0, 0];
    activities.forEach(a => {
      const day = new Date(a.start_date).getDay();
      byDayOfWeek[day]++;
    });

    return {
      period: { startDate, endDate },
      total,
      completed,
      pending,
      completionRate: total > 0 ? Math.round((completed / total) * 100) : 0,
      byType,
      byDayOfWeek,
    };
  } catch (err) {
    toast('Erro ao gerar relatorio de atividades', 'error');
    return null;
  }
}
