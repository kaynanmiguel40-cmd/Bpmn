import { supabase } from '../../../lib/supabase';
import { toast } from '../../../contexts/ToastContext';

/**
 * Retorna KPIs consolidados para o Dashboard do CRM.
 * @param {{ start?: string, end?: string }} [range] - Periodo (ISO). Default = mes atual.
 *   Afeta: receita, taxa de conversao e leads perdidos.
 *   NAO afeta: pipeline aberto, funil (sempre atuais) e revenue chart (12 meses trailing).
 */
export async function getCrmDashboardKPIs(range = {}, scope = 'sales') {
  try {
    const now = new Date();
    const periodStart = range.start || new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
    const periodEnd = range.end || now.toISOString();
    const in7Days = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString();

    // Periodo anterior equivalente — para calcular tendencias.
    // Janela do mesmo tamanho terminando 1ms antes do inicio do periodo atual.
    const periodStartMs = new Date(periodStart).getTime();
    const periodEndMs = new Date(periodEnd).getTime();
    const periodDuration = Math.max(0, periodEndMs - periodStartMs);
    const previousEnd = new Date(periodStartMs - 1).toISOString();
    const previousStart = new Date(periodStartMs - 1 - periodDuration).toISOString();

    // Limite a partir do qual um deal aberto vira "frio" (sem update).
    const STALE_DEAL_DAYS = 14;
    const staleThreshold = new Date(now.getTime() - STALE_DEAL_DAYS * 24 * 60 * 60 * 1000).toISOString();
    const todayIso = now.toISOString();

    // "Negociacao quente" = deal aberto fechando em <= 30 dias
    const hotDealThreshold = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString();

    // Reunioes agendadas: hoje (00:00->23:59) e proximos 7 dias
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
    const endOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999).toISOString();
    const endOfWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString();
    // Janela passada de 7 dias — pro RITMO de ligações do time (atividade ja feita).
    const last7dStart = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();

    // ===== Escopo de VENDAS =====================================================
    // O dashboard e de vendas. Pipelines de AQUISICAO DE PARCEIROS ("Parceiros")
    // e de NUTRICAO ("Nurturing") nao sao venda — entram como prospeccao/reativacao
    // e poluiriam receita, conversao e "negociacoes ativas" se misturadas. Entao
    // KPIs de venda contam SO as pipelines de venda (Outbound Manual, Leads de
    // Parceiros, etc.). "Leads de Parceiros" (clientes indicados) E venda.
    const { data: allPipelines = [] } = await supabase.from('crm_pipelines').select('id, name, is_default');
    const isNurturing  = p => /nurturing|nutri/i.test(p.name || '');
    const isPartnerAcq = p => /^\s*parceiros\s*$/i.test(p.name || ''); // exatamente "Parceiros", nao "Leads de Parceiros"
    const nurturingIds      = (allPipelines || []).filter(isNurturing).map(p => p.id);
    const partnerIds        = (allPipelines || []).filter(isPartnerAcq).map(p => p.id);
    const salesPipelineIds  = (allPipelines || []).filter(p => !isNurturing(p) && !isPartnerAcq(p)).map(p => p.id);

    // Escopo selecionado: 'sales' (default) | 'partners' | 'all'.
    let targetIds;
    if (scope === 'all') targetIds = (allPipelines || []).map(p => p.id);
    else if (scope === 'partners') targetIds = partnerIds;
    else targetIds = salesPipelineIds;
    // Guard: escopo vazio -> id impossivel (queries retornam vazio em vez de tudo)
    const scopedIds = targetIds.length ? targetIds : ['00000000-0000-0000-0000-000000000000'];

    // Pipeline que alimenta o FUNIL (1 so): no escopo parceiros = "Parceiros";
    // senao = pipeline default (Outbound Manual) ou a primeira de venda.
    const funnelPipelineId = scope === 'partners'
      ? (partnerIds[0] || null)
      : ((allPipelines || []).find(p => p.is_default)?.id
         || (allPipelines || []).find(p => salesPipelineIds.includes(p.id))?.id
         || (allPipelines || [])[0]?.id
         || null);

    // Executar todas as queries em paralelo
    const [
      contactsRes,
      companiesRes,
      openDealsRes,
      wonThisMonthRes,
      allClosedRes,
      pendingActivitiesRes,
      closingSoonRes,
      defaultPipelineRes,
      overdueActivitiesRes,
      overdueCloseRes,
      staleDealsRes,
      wonLast12Res,
      previousClosedRes,
      goalsForChartRes,
      totalLostRes,
      hotDealsRes,
      meetingsTodayRes,
      meetingsWeekRes,
      callsTodayRes,
      callsWeekRes,
    ] = await Promise.all([
      // Total contatos ativos
      supabase.from('crm_contacts').select('id', { count: 'exact', head: true }).is('deleted_at', null),

      // Total empresas
      supabase.from('crm_companies').select('id', { count: 'exact', head: true }).is('deleted_at', null),

      // Deals abertos (valor total + count + pipeline_id pra excluir nurturing) — pipeline atual, nao filtra periodo
      supabase.from('crm_deals').select('id, value, pipeline_id').eq('status', 'open').is('deleted_at', null),

      // Deals ganhos no periodo selecionado (so vendas) — value (contrato), mrr (mensalidade) e datas pra ticket/ciclo
      supabase.from('crm_deals').select('id, value, mrr, created_at, closed_at').eq('status', 'won').in('pipeline_id', scopedIds).gte('closed_at', periodStart).lte('closed_at', periodEnd).is('deleted_at', null),

      // Deals fechados (won + lost) no periodo — para taxa de conversao (so vendas)
      supabase.from('crm_deals').select('id, status').in('status', ['won', 'lost']).in('pipeline_id', scopedIds).gte('closed_at', periodStart).lte('closed_at', periodEnd).is('deleted_at', null),

      // Atividades pendentes
      supabase.from('crm_activities').select('id', { count: 'exact', head: true }).eq('completed', false).is('deleted_at', null),

      // Deals fechando em 7 dias (com detalhes para o card) — so vendas
      supabase.from('crm_deals')
        .select('id, title, value, expected_close_date, crm_contacts(id, name, avatar_color), crm_companies(name)')
        .eq('status', 'open').in('pipeline_id', scopedIds).lte('expected_close_date', in7Days).gte('expected_close_date', now.toISOString()).is('deleted_at', null)
        .order('expected_close_date'),

      // Pipeline do funil (segue o escopo: parceiros -> "Parceiros"; senao -> default)
      funnelPipelineId
        ? supabase.from('crm_pipelines')
            .select('id, name, is_default, crm_pipeline_stages(id, name, position, is_win_stage, crm_deals(id, value, status))')
            .eq('id', funnelPipelineId)
            .maybeSingle()
        : Promise.resolve({ data: null }),

      // Atividades vencidas: nao concluidas e com start_date no passado
      supabase.from('crm_activities')
        .select('id, title, type, start_date, deal_id, crm_contacts(id, name, avatar_color), crm_deals(id, title)')
        .eq('completed', false)
        .lt('start_date', todayIso)
        .is('deleted_at', null)
        .order('start_date', { ascending: true })
        .limit(20),

      // Deals com expected_close_date estourado mas ainda abertos — so vendas
      supabase.from('crm_deals')
        .select('id, title, value, expected_close_date, crm_contacts(id, name, avatar_color), crm_companies(name)')
        .eq('status', 'open')
        .in('pipeline_id', scopedIds)
        .lt('expected_close_date', todayIso)
        .is('deleted_at', null)
        .order('expected_close_date', { ascending: true })
        .limit(20),

      // Deals "frios": abertos mas sem update ha >= STALE_DEAL_DAYS dias — so vendas
      supabase.from('crm_deals')
        .select('id, title, value, updated_at, crm_contacts(id, name, avatar_color), crm_companies(name), crm_pipeline_stages(id, name)')
        .eq('status', 'open')
        .in('pipeline_id', scopedIds)
        .lt('updated_at', staleThreshold)
        .is('deleted_at', null)
        .order('updated_at', { ascending: true })
        .limit(20),

      // Revenue ultimos 12 meses (deals ganhos) — so vendas
      supabase.from('crm_deals')
        .select('value, closed_at')
        .eq('status', 'won')
        .in('pipeline_id', scopedIds)
        .gte('closed_at', new Date(now.getFullYear() - 1, now.getMonth(), 1).toISOString())
        .is('deleted_at', null),

      // Deals fechados (won+lost) no PERIODO ANTERIOR — para trends (so vendas).
      // 1 query so: value + status nos dois estados.
      supabase.from('crm_deals')
        .select('id, value, status')
        .in('status', ['won', 'lost'])
        .in('pipeline_id', scopedIds)
        .gte('closed_at', previousStart)
        .lte('closed_at', previousEnd)
        .is('deleted_at', null),

      // Metas (globais + individuais) que tocam os ultimos 13 meses — pra
      // popular o grafico Realizado/Previsto/Projetado. Filtro por owner_id
      // null (globais) OU qualquer (todas) — visualmente somamos tudo.
      supabase.from('crm_goals')
        .select('id, type, target_value, period_start, period_end, owner_id, team_members(id, name, color, auth_user_id)')
        .gte('period_end', new Date(now.getFullYear() - 1, now.getMonth(), 1).toISOString().slice(0, 10))
        .neq('status', 'cancelled')
        .is('deleted_at', null),

      // Total acumulado de leads perdidos (sem filtro de periodo) — KPI absoluto (so vendas).
      supabase.from('crm_deals').select('id', { count: 'exact', head: true }).eq('status', 'lost').in('pipeline_id', scopedIds).is('deleted_at', null),

      // Negociacoes quentes: deals abertos fechando em <= 30 dias (so vendas).
      supabase.from('crm_deals')
        .select('id, value')
        .eq('status', 'open')
        .in('pipeline_id', scopedIds)
        .not('expected_close_date', 'is', null)
        .lte('expected_close_date', hotDealThreshold)
        .is('deleted_at', null),

      // Reunioes agendadas pra hoje (type=meeting OR call, nao concluidas)
      supabase.from('crm_activities')
        .select('id', { count: 'exact', head: true })
        .in('type', ['meeting', 'call'])
        .eq('completed', false)
        .gte('start_date', startOfToday)
        .lte('start_date', endOfToday)
        .is('deleted_at', null),

      // Reunioes na semana (proximos 7 dias)
      supabase.from('crm_activities')
        .select('id', { count: 'exact', head: true })
        .in('type', ['meeting', 'call'])
        .eq('completed', false)
        .gte('start_date', startOfToday)
        .lte('start_date', endOfWeek)
        .is('deleted_at', null),

      // Ritmo do time: ligacoes feitas hoje (todas, nao so do usuario logado)
      supabase.from('crm_calls')
        .select('id', { count: 'exact', head: true })
        .is('deleted_at', null)
        .gte('started_at', startOfToday),

      // Ritmo do time: ligacoes feitas nos ultimos 7 dias
      supabase.from('crm_calls')
        .select('id', { count: 'exact', head: true })
        .is('deleted_at', null)
        .gte('started_at', last7dStart),
    ]);

    // Calcular KPIs
    const openDeals = openDealsRes.data || [];
    const wonInPeriod = wonThisMonthRes.data || [];
    const allClosed = allClosedRes.data || [];
    const wonLast12 = wonLast12Res.data || [];
    const hotDeals = hotDealsRes.data || [];
    const nurturingPipelineIds = new Set(nurturingIds);
    const scopedSet = new Set(targetIds);

    // Particiona open deals pelo ESCOPO selecionado (vendas / parceiros / geral).
    const activeOpenDeals = openDeals.filter(d => scopedSet.has(d.pipeline_id));
    const nurturingDeals = openDeals.filter(d => nurturingPipelineIds.has(d.pipeline_id));

    const activeDealsValue = activeOpenDeals.reduce((sum, d) => sum + (d.value || 0), 0);
    const pipelineValue = openDeals.reduce((sum, d) => sum + (d.value || 0), 0); // mantido pra retrocompat
    const periodRevenue = wonInPeriod.reduce((sum, d) => sum + (d.value || 0), 0);
    // MRR novo = soma da mensalidade (mrr) dos negocios ganhos no periodo. Metrica-chave SaaS.
    const periodNewMrr = wonInPeriod.reduce((sum, d) => sum + (d.mrr || 0), 0);
    const periodWonDeals = wonInPeriod.length;
    const avgTicket = periodWonDeals > 0 ? periodRevenue / periodWonDeals : 0;
    // Ciclo medio de venda: dias entre criacao e fechamento dos deals ganhos no periodo.
    const cycleDaysList = wonInPeriod
      .map(d => (d.created_at && d.closed_at) ? (new Date(d.closed_at) - new Date(d.created_at)) / 86400000 : null)
      .filter(v => v != null && v >= 0);
    const avgCycleDays = cycleDaysList.length
      ? Math.round(cycleDaysList.reduce((a, b) => a + b, 0) / cycleDaysList.length)
      : 0;
    const hotDealsValue = hotDeals.reduce((sum, d) => sum + (d.value || 0), 0);
    const nurturingValue = nurturingDeals.reduce((sum, d) => sum + (d.value || 0), 0);

    const wonCount = allClosed.filter(d => d.status === 'won').length;
    const lostCount = allClosed.filter(d => d.status === 'lost').length;
    const conversionRate = allClosed.length > 0 ? Math.round((wonCount / allClosed.length) * 100) : 0;

    // ============ Trends vs periodo anterior =================
    const prevClosed = previousClosedRes.data || [];
    const prevWon = prevClosed.filter(d => d.status === 'won');
    const prevLostCount = prevClosed.filter(d => d.status === 'lost').length;
    const prevRevenue = prevWon.reduce((sum, d) => sum + (d.value || 0), 0);
    const prevConversionRate = prevClosed.length > 0
      ? Math.round((prevWon.length / prevClosed.length) * 100)
      : 0;

    // Helper: monta { value: '+12%', up } com semantica de direcao boa.
    // - inverted=false: aumento e bom (receita, conversao)
    // - inverted=true: aumento e ruim (leads perdidos) — inverte cor
    function pctTrend(curr, prev, { inverted = false } = {}) {
      if (prev === 0 && curr === 0) return null;
      if (prev === 0) return { value: 'novo', up: !inverted };
      const pct = Math.round(((curr - prev) / prev) * 100);
      if (pct === 0) return { value: '0%', up: true };
      const up = inverted ? pct < 0 : pct > 0;
      return { value: `${pct > 0 ? '+' : ''}${pct}%`, up };
    }

    function ppTrend(currPct, prevPct) {
      if (prevPct === 0 && currPct === 0) return null;
      const diff = currPct - prevPct;
      if (diff === 0) return { value: '0pp', up: true };
      return { value: `${diff > 0 ? '+' : ''}${diff}pp`, up: diff > 0 };
    }

    const trends = {
      revenue: pctTrend(periodRevenue, prevRevenue),
      conversion: ppTrend(conversionRate, prevConversionRate),
      lostLeads: pctTrend(lostCount, prevLostCount, { inverted: true }),
    };

    // Revenue por mes — agora com 3 series: realizado / previsto / projetado.
    //   realizado: deals won que fecharam naquele mes
    //   projetado: soma das metas (pro-rata por dias do mes coberto pela meta)
    //   previsto:  projetado mas truncado ate "hoje" no mes atual; meses
    //              passados = projetado total; meses futuros = 0.
    const goalsForChart = goalsForChartRes.data || [];

    function daysInMonth(year, monthIdx) {
      return new Date(year, monthIdx + 1, 0).getDate();
    }

    function overlapInMonth(goal, year, monthIdx) {
      const monthStart = new Date(year, monthIdx, 1);
      const monthEnd = new Date(year, monthIdx + 1, 0, 23, 59, 59, 999);
      const gStart = new Date(goal.period_start);
      const gEnd = new Date(goal.period_end);
      if (gEnd < monthStart || gStart > monthEnd) return null;
      const start = gStart < monthStart ? monthStart : gStart;
      const end = gEnd > monthEnd ? monthEnd : gEnd;
      const days = Math.max(1, Math.round((end - start) / 86400000) + 1);
      const totalGoalDays = Math.max(1, Math.round((gEnd - gStart) / 86400000) + 1);
      return { days, totalGoalDays };
    }

    const revenueByMonth = [];
    for (let i = 11; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const year = d.getFullYear();
      const monthIdx = d.getMonth();
      const monthKey = `${year}-${String(monthIdx + 1).padStart(2, '0')}`;
      const realizado = wonLast12
        .filter(deal => deal.closed_at && deal.closed_at.startsWith(monthKey))
        .reduce((sum, deal) => sum + (deal.value || 0), 0);

      // Projetado = soma pro-rata das metas que tocam esse mes
      let projetado = 0;
      for (const g of goalsForChart) {
        const overlap = overlapInMonth(g, year, monthIdx);
        if (!overlap) continue;
        const portion = (g.target_value || 0) * (overlap.days / overlap.totalGoalDays);
        projetado += portion;
      }

      // Previsto = projetado pro-rateado pelo % do mes ja decorrido
      let previsto = 0;
      const monthStart = new Date(year, monthIdx, 1);
      const monthEnd = new Date(year, monthIdx + 1, 0, 23, 59, 59, 999);
      if (now > monthEnd) {
        previsto = projetado; // mes ja fechou
      } else if (now < monthStart) {
        previsto = 0; // mes futuro
      } else {
        const elapsed = (now - monthStart) / (monthEnd - monthStart);
        previsto = projetado * Math.max(0, Math.min(1, elapsed));
      }

      revenueByMonth.push({
        month: monthKey,
        value: realizado,        // mantido pra retrocompat (codigo antigo le `value`)
        realizado,
        previsto: Math.round(previsto),
        projetado: Math.round(projetado),
      });
    }

    // Funil do pipeline default (stages ordenados por position; conversao
    // calculada em relacao ao primeiro stage). `value` = soma R$ dos deals
    // open na etapa; `count` = quantidade.
    const defaultPipeline = defaultPipelineRes.data || null;
    const funnelPipelineName = defaultPipeline?.name || null;
    const stagesOrdered = (defaultPipeline?.crm_pipeline_stages || [])
      .slice()
      .sort((a, b) => (a.position ?? 0) - (b.position ?? 0));

    const funnel = stagesOrdered.map(stage => {
      const openDealsInStage = (stage.crm_deals || []).filter(d => d.status === 'open');
      return {
        stageId: stage.id,
        stageName: stage.name,
        count: openDealsInStage.length,
        value: openDealsInStage.reduce((sum, d) => sum + (d.value || 0), 0),
        isWinStage: !!stage.is_win_stage,
      };
    });

    // Conversao stage-a-stage (em relacao ao stage anterior).
    const firstCount = funnel[0]?.count || 0;
    funnel.forEach((stage, idx) => {
      const prev = idx > 0 ? funnel[idx - 1].count : firstCount;
      stage.conversion = prev > 0 ? Math.round((stage.count / prev) * 100) : 0;
      stage.conversionFromTop = firstCount > 0 ? Math.round((stage.count / firstCount) * 100) : 0;
    });

    // ============ Precisa de Atencao Hoje =================
    // Combina 3 fontes em uma unica lista priorizada por severidade/dias.
    const daysSince = (iso) => Math.max(0, Math.floor((now - new Date(iso)) / 86400000));

    const overdueActivityItems = (overdueActivitiesRes.data || []).map(r => ({
      id: `act_${r.id}`,
      kind: 'overdue_activity',
      title: r.title,
      reason: `Atividade vencida ha ${daysSince(r.start_date)}d`,
      daysAgo: daysSince(r.start_date),
      severity: 'high',
      activityType: r.type,
      dealId: r.deal_id || r.crm_deals?.id || null,
      dealTitle: r.crm_deals?.title || null,
      contactName: r.crm_contacts?.name || null,
    }));

    const overdueCloseItems = (overdueCloseRes.data || []).map(d => ({
      id: `clo_${d.id}`,
      kind: 'overdue_close',
      title: d.title,
      reason: `Prazo estourou ha ${daysSince(d.expected_close_date)}d`,
      daysAgo: daysSince(d.expected_close_date),
      severity: 'high',
      value: d.value || 0,
      dealId: d.id,
      contactName: d.crm_contacts?.name || null,
      companyName: d.crm_companies?.name || null,
    }));

    const staleDealItems = (staleDealsRes.data || []).map(d => ({
      id: `sta_${d.id}`,
      kind: 'stale_deal',
      title: d.title,
      reason: `Sem update ha ${daysSince(d.updated_at)}d${d.crm_pipeline_stages?.name ? ` em ${d.crm_pipeline_stages.name}` : ''}`,
      daysAgo: daysSince(d.updated_at),
      severity: 'medium',
      value: d.value || 0,
      dealId: d.id,
      stageName: d.crm_pipeline_stages?.name || null,
      contactName: d.crm_contacts?.name || null,
      companyName: d.crm_companies?.name || null,
    }));

    // Dedup: se um deal aparece em "estourado" e "frio", manter so o de severidade
    // maior (estourado).
    const seenDealIds = new Set(overdueCloseItems.map(i => i.dealId));
    const dedupedStale = staleDealItems.filter(i => !seenDealIds.has(i.dealId));

    // Ordena por severidade (high > medium) e depois daysAgo desc.
    const severityRank = { high: 2, medium: 1, low: 0 };
    const attentionItems = [...overdueActivityItems, ...overdueCloseItems, ...dedupedStale]
      .sort((a, b) => {
        const sev = (severityRank[b.severity] || 0) - (severityRank[a.severity] || 0);
        if (sev !== 0) return sev;
        return b.daysAgo - a.daysAgo;
      })
      .slice(0, 12);

    // Deals vencendo esta semana (lista completa)
    const closingSoonList = (closingSoonRes.data || []).map(d => ({
      id: d.id,
      title: d.title,
      value: d.value || 0,
      expectedCloseDate: d.expected_close_date,
      contact: d.crm_contacts ? { id: d.crm_contacts.id, name: d.crm_contacts.name, avatarColor: d.crm_contacts.avatar_color } : null,
      company: d.crm_companies?.name || null,
    }));

    return {
      totalContacts: contactsRes.count || 0,
      // "Leads" = negocios de venda em aberto (o funil real). Antes lia a tabela
      // crm_contacts (status=lead), que fica vazia quando se trabalha so em deals.
      totalLeads: activeOpenDeals.length,
      totalCompanies: companiesRes.count || 0,
      openDeals: openDeals.length,
      activeOpenDeals: activeOpenDeals.length,
      activeDealsValue,
      pipelineValue, // legado (inclui nurturing)
      periodRevenue,
      periodNewMrr,
      periodWonDeals,
      avgTicket,
      avgCycleDays,
      periodLostLeads: lostCount,
      totalLostLeads: totalLostRes.count || 0,
      hotDeals: hotDeals.length,
      hotDealsValue,
      nurturingLeads: nurturingDeals.length,
      nurturingValue,
      meetingsToday: meetingsTodayRes.count || 0,
      meetingsWeek: meetingsWeekRes.count || 0,
      callsToday: callsTodayRes.count || 0,
      callsWeek: callsWeekRes.count || 0,
      conversionRate,
      trends,
      pendingActivities: pendingActivitiesRes.count || 0,
      dealsClosingSoon: closingSoonList.length,
      dealsClosingSoonList: closingSoonList,
      revenueByMonth,
      funnel,
      funnelPipelineName,
      attentionItems,
    };
  } catch (err) {
    console.error('[CRM Dashboard] Erro ao calcular KPIs:', err);
    toast('Erro ao carregar dashboard CRM', 'error');
    return {
      totalContacts: 0,
      totalLeads: 0,
      totalCompanies: 0,
      openDeals: 0,
      activeOpenDeals: 0,
      activeDealsValue: 0,
      pipelineValue: 0,
      periodRevenue: 0,
      periodNewMrr: 0,
      periodWonDeals: 0,
      avgTicket: 0,
      avgCycleDays: 0,
      periodLostLeads: 0,
      totalLostLeads: 0,
      hotDeals: 0,
      hotDealsValue: 0,
      nurturingLeads: 0,
      nurturingValue: 0,
      meetingsToday: 0,
      meetingsWeek: 0,
      callsToday: 0,
      callsWeek: 0,
      conversionRate: 0,
      trends: { revenue: null, conversion: null, lostLeads: null },
      pendingActivities: 0,
      dealsClosingSoon: 0,
      dealsClosingSoonList: [],
      revenueByMonth: [],
      funnel: [],
      funnelPipelineName: null,
      attentionItems: [],
    };
  }
}

// ============================================================
// BONIFICACAO — Gamificacao Ouro / Prata / Bronze
// ============================================================
//
// Substitui o antigo "ranking de vendedor" por uma visualizacao de medalhas:
//   Bronze = 30% da meta ativa, Prata = 60%, Ouro = 100%.
// Cada vendedor recebe a maior medalha que ja conquistou + barra de progresso
// ate a proxima. Vendedor sem meta ativa entra como "Sem meta" (cinza).

export const BONIFICACAO_TIERS = [
  { key: 'bronze', label: 'Bronze', threshold: 0.30, color: '#cd7f32', bg: 'bg-amber-100 dark:bg-amber-900/30',  text: 'text-amber-700 dark:text-amber-400' },
  { key: 'prata',  label: 'Prata',  threshold: 0.60, color: '#94a3b8', bg: 'bg-slate-200 dark:bg-slate-700/50',   text: 'text-slate-700 dark:text-slate-200' },
  { key: 'ouro',   label: 'Ouro',   threshold: 1.00, color: '#facc15', bg: 'bg-yellow-100 dark:bg-yellow-900/30', text: 'text-yellow-700 dark:text-yellow-400' },
];

function getEarnedTier(percent) {
  // Maior medalha conquistada (percent = 0.0..1.0+)
  let earned = null;
  for (const t of BONIFICACAO_TIERS) {
    if (percent >= t.threshold) earned = t;
  }
  return earned;
}

function getNextTier(percent) {
  for (const t of BONIFICACAO_TIERS) {
    if (percent < t.threshold) return t;
  }
  return null; // ja eh ouro
}

/**
 * Progresso de bonificacao por vendedor.
 *
 * Une team_members (CRM roles ativos) com metas individuais ativas e deals
 * ganhos no periodo. Para cada vendedor retorna:
 *   - vendedor: { id, name, color }
 *   - goal: meta ativa relevante (a com maior targetValue se houver varias)
 *   - currentValue: valor total ganho no periodo
 *   - targetValue: meta
 *   - percent: 0..1+ (currentValue / targetValue)
 *   - earnedTier: medalha conquistada ('bronze'/'prata'/'ouro') ou null
 *   - nextTier:   proxima medalha ou null se ja eh ouro
 *   - progressToNext: 0..1 (distancia ate proxima medalha como % do gap)
 *
 * Vendedores sem meta ativa entram com goal=null e mostram so o currentValue.
 *
 * @param {string} startDate - ISO inicio do periodo (default: mes atual)
 * @param {string} endDate - ISO fim
 */
export async function getBonificacaoProgress(startDate, endDate) {
  try {
    const now = new Date();
    const periodStart = startDate || new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
    const periodEnd = endDate || now.toISOString();

    const [dealsRes, membersRes, goalsRes] = await Promise.all([
      supabase.from('crm_deals')
        .select('created_by, value')
        .eq('status', 'won')
        .gte('closed_at', periodStart)
        .lte('closed_at', periodEnd)
        .is('deleted_at', null),
      supabase.from('team_members')
        .select('id, name, color, auth_user_id, crm_role')
        .not('crm_role', 'is', null),
      supabase.from('crm_goals')
        .select('id, title, target_value, current_value, owner_id, period_start, period_end, status, team_members(id, name, color, auth_user_id)')
        .eq('status', 'active')
        .eq('type', 'individual')
        .is('deleted_at', null),
    ]);

    const deals = dealsRes.data || [];
    const members = membersRes.data || [];
    const goals = goalsRes.data || [];

    // Agrupar valor ganho por auth_user_id
    const valueByUid = {};
    for (const d of deals) {
      if (!d.created_by) continue;
      valueByUid[d.created_by] = (valueByUid[d.created_by] || 0) + (d.value || 0);
    }

    // Maior meta por member.id (se houver duplicadas)
    const goalByMemberId = {};
    for (const g of goals) {
      const memberId = g.owner_id;
      if (!memberId) continue;
      const existing = goalByMemberId[memberId];
      if (!existing || (g.target_value || 0) > (existing.target_value || 0)) {
        goalByMemberId[memberId] = g;
      }
    }

    const rows = members.map(m => {
      const goal = goalByMemberId[m.id] || null;
      const wonValue = valueByUid[m.auth_user_id] || 0;
      const manualValue = goal?.current_value || 0;
      const currentValue = wonValue + manualValue;
      const targetValue = goal?.target_value || 0;
      const percent = targetValue > 0 ? currentValue / targetValue : 0;
      const earnedTier = targetValue > 0 ? getEarnedTier(percent) : null;
      const nextTier = targetValue > 0 ? getNextTier(percent) : BONIFICACAO_TIERS[0];

      // Progresso entre tier conquistada e proxima
      let progressToNext = 0;
      if (nextTier && targetValue > 0) {
        const floor = earnedTier ? earnedTier.threshold : 0;
        const ceil = nextTier.threshold;
        progressToNext = Math.max(0, Math.min(1, (percent - floor) / (ceil - floor)));
      } else if (!nextTier) {
        progressToNext = 1; // ouro batido
      }

      return {
        vendedor: { id: m.id, name: m.name, color: m.color, role: m.crm_role },
        goal: goal ? { id: goal.id, title: goal.title } : null,
        currentValue,
        targetValue,
        percent,
        percentInt: Math.round(percent * 100),
        earnedTier,
        nextTier,
        progressToNext,
      };
    });

    // Ordenar: quem tem medalha primeiro (Ouro > Prata > Bronze), depois quem
    // esta mais perto da proxima, e por ultimo quem nao tem meta.
    const tierRank = { ouro: 3, prata: 2, bronze: 1 };
    rows.sort((a, b) => {
      const ra = tierRank[a.earnedTier?.key] || 0;
      const rb = tierRank[b.earnedTier?.key] || 0;
      if (ra !== rb) return rb - ra;
      return b.percent - a.percent;
    });

    return rows;
  } catch (err) {
    console.error('[CRM Bonificacao] Erro:', err);
    return [];
  }
}

// ============================================================
// FUNIL DE CONVERSÃO — pipeline (Lead → Qualificado → Reunião → Fechamento)
// ============================================================
//
// Funil de jornada do LEAD: pega os negócios CRIADOS no período (cohort) e
// mede quantos avançaram em cada etapa do pipeline. Conversões coerentes
// ("desses leads, quantos qualificaram / tiveram reunião / fecharam").
//
// As etapas reais variam por pipeline, então detectamos por nome:
//   Qualificado = primeiro estágio de engajamento (Respondeu / Qualificação...)
//   Reunião     = estágio de reunião / demo / apresentação
//   Fechamento  = estágio de vitória (is_win_stage) ou status 'won'

const QUAL_STAGE_RE    = /respond|qualifica|engaj|conect|icp/i;
const MEETING_STAGE_RE = /reuni|demo|apresenta/i;

/**
 * Monta o funil de pipeline a partir de dados já carregados. PURA e testável.
 *
 * Mede pela JORNADA REAL: `reachedPosByDeal` é a maior posição de estágio que
 * cada negócio já alcançou (do histórico + estágio atual). Assim um lead conta
 * em "Qualificado"/"Reunião" se passou DE FATO por lá, mesmo que tenha voltado.
 *
 * @param {object} p
 * @param {Array}  p.leadDeals            - deals criados no período ({ id, status, value, pipeline_id }).
 * @param {object} p.reachedPosByDeal     - { [deal_id]: maior posição já alcançada }.
 * @param {object} p.qualPosByPipeline    - { [pipeline_id]: posição mínima de "qualificado" }.
 * @param {object} p.meetingPosByPipeline - { [pipeline_id]: posição mínima de "reunião" }.
 */
export function buildSalesFunnel({
  leadDeals = [],
  reachedPosByDeal = {},
  qualPosByPipeline = {},
  meetingPosByPipeline = {},
} = {}) {
  let lead = 0, qualified = 0, meeting = 0, closing = 0, revenue = 0;
  for (const d of leadDeals) {
    lead++;
    const won = d.status === 'won';
    const pos = reachedPosByDeal[d.id];
    const qp = qualPosByPipeline[d.pipeline_id];
    const mp = meetingPosByPipeline[d.pipeline_id];
    const reachedQual    = typeof pos === 'number' && typeof qp === 'number' && pos >= qp;
    const reachedMeeting = typeof pos === 'number' && typeof mp === 'number' && pos >= mp;
    if (won || reachedQual)    qualified++;
    if (won || reachedMeeting) meeting++;
    if (won) { closing++; revenue += d.value || 0; }
  }

  const rawSteps = [
    { key: 'lead',      label: 'Lead',        count: lead },
    { key: 'qualified', label: 'Qualificado', count: qualified },
    { key: 'meeting',   label: 'Reunião',     count: meeting },
    { key: 'closing',   label: 'Fechamento',  count: closing, value: revenue },
  ];

  const top = rawSteps[0].count || 0;
  const steps = rawSteps.map((s, i) => {
    const prevCount = i > 0 ? rawSteps[i - 1].count : null;
    const fromPrev = i === 0 ? null : (prevCount > 0 ? Math.round((s.count / prevCount) * 100) : null);
    const fromTop = top > 0 ? Math.round((s.count / top) * 100) : 0;
    return { ...s, fromPrev, fromTop };
  });

  const pct = (a, b) => (b > 0 ? Math.round((a / b) * 100) : 0);
  const ratios = {
    qualRate: pct(qualified, lead),        // % dos leads que qualificaram
    meetingToClose: pct(closing, meeting), // % das reuniões que fecharam
    winRate: pct(closing, lead),           // win rate geral (lead → cliente)
  };

  return { steps, ratios, revenue, lead, qualified, meeting, closing };
}

/**
 * Carrega e monta o funil de pipeline do período/escopo.
 * @param {{ start?: string, end?: string }} [range] - Período ISO. Default = mês atual.
 * @param {'sales'|'partners'|'all'} [scope]
 */
export async function getSalesFunnel(range = {}, scope = 'sales', ownerId = null) {
  try {
    const now = new Date();
    const periodStart = range.start || new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
    const periodEnd = range.end || now.toISOString();

    // Escopo de pipelines (mesma lógica do getCrmDashboardKPIs).
    const { data: allPipelines = [] } = await supabase.from('crm_pipelines').select('id, name, is_default');
    const isNurturing  = p => /nurturing|nutri/i.test(p.name || '');
    const isPartnerAcq = p => /^\s*parceiros\s*$/i.test(p.name || ''); // exatamente "Parceiros"
    const partnerIds       = (allPipelines || []).filter(isPartnerAcq).map(p => p.id);
    const salesPipelineIds = (allPipelines || []).filter(p => !isNurturing(p) && !isPartnerAcq(p)).map(p => p.id);

    let targetIds;
    if (scope === 'all') targetIds = (allPipelines || []).map(p => p.id);
    else if (scope === 'partners') targetIds = partnerIds;
    else targetIds = salesPipelineIds;
    const scopedIds = targetIds.length ? targetIds : ['00000000-0000-0000-0000-000000000000'];

    // Leads = deals criados no período (escopo de venda). Opcionalmente de 1 dono.
    let leadDealsQuery = supabase.from('crm_deals')
      .select('id, status, value, stage_id, pipeline_id')
      .in('pipeline_id', scopedIds)
      .is('deleted_at', null)
      .gte('created_at', periodStart)
      .lte('created_at', periodEnd);
    if (ownerId) leadDealsQuery = leadDealsQuery.eq('created_by', ownerId);

    const [stagesRes, leadDealsRes] = await Promise.all([
      // Estágios das pipelines do escopo (pra detectar posições de qualificado/reunião)
      supabase.from('crm_pipeline_stages')
        .select('id, pipeline_id, name, position, is_win_stage')
        .in('pipeline_id', scopedIds),
      leadDealsQuery,
    ]);

    const stages = stagesRes.data || [];
    const leadDeals = leadDealsRes.data || [];

    // Mapa stage_id -> position + posições de qualificado/reunião por pipeline.
    const stagePosById = {};
    const stagesByPipeline = {};
    for (const s of stages) {
      stagePosById[s.id] = s.position ?? 0;
      (stagesByPipeline[s.pipeline_id] = stagesByPipeline[s.pipeline_id] || []).push(s);
    }
    const qualPosByPipeline = {};
    const meetingPosByPipeline = {};
    for (const [pid, list] of Object.entries(stagesByPipeline)) {
      const ordered = list.slice().sort((a, b) => (a.position ?? 0) - (b.position ?? 0));
      const n = ordered.length;
      const qualMatch = ordered.find(s => QUAL_STAGE_RE.test(s.name || ''));
      const meetMatch = ordered.find(s => MEETING_STAGE_RE.test(s.name || ''));
      const winIdx = ordered.findIndex(s => s.is_win_stage);

      const qualPos = qualMatch
        ? (qualMatch.position ?? 0)
        : (ordered[Math.max(0, Math.floor(n * 0.33))]?.position ?? 0);
      const meetPosRaw = meetMatch
        ? (meetMatch.position ?? 0)
        : (winIdx > 0 ? (ordered[Math.max(0, winIdx - 1)]?.position ?? 0)
                      : (ordered[Math.max(0, Math.floor(n * 0.66))]?.position ?? 0));

      qualPosByPipeline[pid] = qualPos;
      // Reunião nunca antes de qualificado (garante funil monotônico).
      meetingPosByPipeline[pid] = Math.max(meetPosRaw, qualPos);
    }

    // Jornada real: maior posição que cada negócio JÁ alcançou. Começa pelo
    // estágio atual e sobe com o histórico de transições — assim um lead que
    // avançou e depois voltou ainda conta na etapa mais funda que tocou.
    const reachedPosByDeal = {};
    for (const d of leadDeals) {
      reachedPosByDeal[d.id] = stagePosById[d.stage_id] ?? 0;
    }
    const dealIds = leadDeals.map(d => d.id);
    if (dealIds.length) {
      const { data: history } = await supabase
        .from('crm_deal_stage_history')
        .select('deal_id, to_stage_id')
        .in('deal_id', dealIds);
      for (const h of (history || [])) {
        const pos = stagePosById[h.to_stage_id];
        if (typeof pos === 'number' && pos > (reachedPosByDeal[h.deal_id] ?? -1)) {
          reachedPosByDeal[h.deal_id] = pos;
        }
      }
    }

    return buildSalesFunnel({ leadDeals, reachedPosByDeal, qualPosByPipeline, meetingPosByPipeline });
  } catch (err) {
    console.error('[CRM Funil] Erro ao calcular funil:', err);
    toast('Erro ao carregar funil de conversão', 'error');
    return buildSalesFunnel({});
  }
}

