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

// ==================== PROBABILIDADE APRENDIDA ====================
// Usa crm_deal_stage_history para dados reais de transicao.
// Fallback: inferencia por posicao caso nao haja historico.

export async function getLearnedProbabilities(pipelineId = null) {
  try {
    // 1. Buscar stages
    let stagesQuery = supabase
      .from('crm_pipeline_stages')
      .select('id, name, position, color, pipeline_id')
      .order('position');

    if (pipelineId) {
      stagesQuery = stagesQuery.eq('pipeline_id', pipelineId);
    }

    const { data: stages } = await stagesQuery;

    // 2. Buscar deals fechados (won + lost)
    let closedQuery = supabase
      .from('crm_deals')
      .select('id, status, stage_id, probability, pipeline_id')
      .in('status', ['won', 'lost'])
      .is('deleted_at', null);

    if (pipelineId) {
      closedQuery = closedQuery.eq('pipeline_id', pipelineId);
    }

    const { data: closedDeals } = await closedQuery;

    // 3. Buscar deals abertos (media de probabilidade dos vendedores)
    let openQuery = supabase
      .from('crm_deals')
      .select('id, probability, stage_id, pipeline_id')
      .eq('status', 'open')
      .is('deleted_at', null);

    if (pipelineId) {
      openQuery = openQuery.eq('pipeline_id', pipelineId);
    }

    const { data: openDeals } = await openQuery;

    // 4. Buscar historico de transicoes
    let historyQuery = supabase
      .from('crm_deal_stage_history')
      .select('deal_id, to_stage_id, pipeline_id');

    if (pipelineId) {
      historyQuery = historyQuery.eq('pipeline_id', pipelineId);
    }

    const { data: history } = await historyQuery;

    const allStages = stages || [];
    const closed = closedDeals || [];
    const open = openDeals || [];
    const transitions = history || [];

    if (allStages.length === 0) {
      return { pipelineId: pipelineId || 'all', stages: [], totalWon: 0, totalLost: 0, overallConversion: 0, avgProbabilityVendor: 0 };
    }

    const hasHistory = transitions.length > 0;

    // Mapas auxiliares
    const stageInfoMap = {};
    allStages.forEach(s => { stageInfoMap[s.id] = s; });

    const closedStatusMap = {};
    closed.forEach(d => { closedStatusMap[d.id] = d.status; });

    const totalWon = closed.filter(d => d.status === 'won').length;
    const totalLost = closed.filter(d => d.status === 'lost').length;

    let learnedStages;

    if (hasHistory) {
      // ── MODO HISTORICO REAL ──
      // Para cada stage: quais deals closed passaram por ele (tem registro no historico)?
      // "Todas Pipelines" agrupa por NOME do estagio.

      // Montar set de deal_ids que passaram por cada stage_id
      const dealsByStageId = {};
      transitions.forEach(t => {
        if (!dealsByStageId[t.to_stage_id]) dealsByStageId[t.to_stage_id] = new Set();
        dealsByStageId[t.to_stage_id].add(t.deal_id);
      });

      if (pipelineId) {
        // Pipeline especifico: agrupar por stage_id (posicao unica)
        const stagesOrdered = allStages
          .filter(s => s.pipeline_id === pipelineId)
          .sort((a, b) => a.position - b.position);

        learnedStages = stagesOrdered.map(stage => {
          const dealIds = dealsByStageId[stage.id] || new Set();
          const closedThatPassed = [...dealIds].filter(id => closedStatusMap[id]);
          const wonFromHere = closedThatPassed.filter(id => closedStatusMap[id] === 'won').length;
          const totalFromHere = closedThatPassed.length;
          const learnedProbability = totalFromHere > 0 ? Math.round((wonFromHere / totalFromHere) * 100) : 0;

          const openInStage = open.filter(d => d.stage_id === stage.id);
          const avgVendorProb = openInStage.length > 0
            ? Math.round(openInStage.reduce((sum, d) => sum + (d.probability || 50), 0) / openInStage.length)
            : null;

          return {
            position: stage.position,
            name: stage.name,
            color: stage.color || '#6366f1',
            learnedProbability,
            sampleSize: totalFromHere,
            wonCount: wonFromHere,
            totalCount: totalFromHere,
            avgVendorProbability: avgVendorProb,
            openDealsCount: openInStage.length,
          };
        });
      } else {
        // Todas Pipelines: agrupar por NOME do estagio
        const stagesByName = {};
        allStages.forEach(s => {
          if (!stagesByName[s.name]) {
            stagesByName[s.name] = { name: s.name, color: s.color, position: s.position, stageIds: [] };
          }
          stagesByName[s.name].stageIds.push(s.id);
          // Manter a menor posicao para ordenacao
          if (s.position < stagesByName[s.name].position) {
            stagesByName[s.name].position = s.position;
          }
        });

        const groupedStages = Object.values(stagesByName).sort((a, b) => a.position - b.position);

        learnedStages = groupedStages.map(group => {
          // Unir todos os deal_ids que passaram por qualquer stage_id com este nome
          const allDealIds = new Set();
          group.stageIds.forEach(sid => {
            const ids = dealsByStageId[sid] || new Set();
            ids.forEach(id => allDealIds.add(id));
          });

          const closedThatPassed = [...allDealIds].filter(id => closedStatusMap[id]);
          const wonFromHere = closedThatPassed.filter(id => closedStatusMap[id] === 'won').length;
          const totalFromHere = closedThatPassed.length;
          const learnedProbability = totalFromHere > 0 ? Math.round((wonFromHere / totalFromHere) * 100) : 0;

          const openInStage = open.filter(d => group.stageIds.includes(d.stage_id));
          const avgVendorProb = openInStage.length > 0
            ? Math.round(openInStage.reduce((sum, d) => sum + (d.probability || 50), 0) / openInStage.length)
            : null;

          return {
            position: group.position,
            name: group.name,
            color: group.color || '#6366f1',
            learnedProbability,
            sampleSize: totalFromHere,
            wonCount: wonFromHere,
            totalCount: totalFromHere,
            avgVendorProbability: avgVendorProb,
            openDealsCount: openInStage.length,
          };
        });
      }
    } else {
      // ── FALLBACK: INFERENCIA POR POSICAO ──
      // Usado quando nao ha historico ainda (deals antigos sem transicoes gravadas)
      const stagePositionMap = {};
      allStages.forEach(s => { stagePositionMap[s.id] = s.position; });

      const positions = [...new Set(allStages.map(s => s.position))].sort((a, b) => a - b);

      const positionInfo = {};
      allStages.forEach(s => {
        if (!positionInfo[s.position]) {
          positionInfo[s.position] = { name: s.name, color: s.color };
        }
      });

      const closedWithPosition = closed
        .filter(d => stagePositionMap[d.stage_id] != null)
        .map(d => ({ ...d, stagePosition: stagePositionMap[d.stage_id] }));

      learnedStages = positions.map(pos => {
        const dealsThatPassed = closedWithPosition.filter(d => d.stagePosition >= pos);
        const wonFromHere = dealsThatPassed.filter(d => d.status === 'won').length;
        const totalFromHere = dealsThatPassed.length;
        const learnedProbability = totalFromHere > 0 ? Math.round((wonFromHere / totalFromHere) * 100) : 0;

        const openInStage = open.filter(d => stagePositionMap[d.stage_id] === pos);
        const avgVendorProb = openInStage.length > 0
          ? Math.round(openInStage.reduce((sum, d) => sum + (d.probability || 50), 0) / openInStage.length)
          : null;

        return {
          position: pos,
          name: positionInfo[pos]?.name || `Estagio ${pos}`,
          color: positionInfo[pos]?.color || '#6366f1',
          learnedProbability,
          sampleSize: totalFromHere,
          wonCount: wonFromHere,
          totalCount: totalFromHere,
          avgVendorProbability: avgVendorProb,
          openDealsCount: openInStage.length,
        };
      });
    }

    // Media geral de probabilidade dos vendedores
    const avgProbabilityVendor = open.length > 0
      ? Math.round(open.reduce((sum, d) => sum + (d.probability || 50), 0) / open.length)
      : 0;

    const overallConversion = (totalWon + totalLost) > 0
      ? Math.round((totalWon / (totalWon + totalLost)) * 100)
      : 0;

    return {
      pipelineId: pipelineId || 'all',
      stages: learnedStages,
      totalWon,
      totalLost,
      overallConversion,
      avgProbabilityVendor,
      source: hasHistory ? 'history' : 'inference',
    };
  } catch (err) {
    toast('Erro ao calcular probabilidades aprendidas', 'error');
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
