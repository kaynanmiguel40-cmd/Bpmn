import { supabase } from '../../../lib/supabase';
import { toast } from '../../../contexts/ToastContext';

/**
 * Retorna KPIs consolidados para o Dashboard do CRM.
 * @returns {Promise<import('../types/crmTypes').CrmDashboardKPIs>}
 */
export async function getCrmDashboardKPIs() {
  try {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
    const in7Days = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString();

    // Executar todas as queries em paralelo
    const [
      contactsRes,
      companiesRes,
      openDealsRes,
      wonThisMonthRes,
      allClosedRes,
      pendingActivitiesRes,
      closingSoonRes,
      stagesRes,
      recentActivitiesRes,
      wonLast12Res,
    ] = await Promise.all([
      // Total contatos ativos
      supabase.from('crm_contacts').select('id', { count: 'exact', head: true }).is('deleted_at', null),

      // Total empresas
      supabase.from('crm_companies').select('id', { count: 'exact', head: true }).is('deleted_at', null),

      // Deals abertos (valor total + count)
      supabase.from('crm_deals').select('id, value').eq('status', 'open').is('deleted_at', null),

      // Deals ganhos neste mes
      supabase.from('crm_deals').select('id, value').eq('status', 'won').gte('closed_at', startOfMonth).is('deleted_at', null),

      // Todos os deals fechados (won + lost) para taxa de conversao
      supabase.from('crm_deals').select('id, status').in('status', ['won', 'lost']).is('deleted_at', null),

      // Atividades pendentes
      supabase.from('crm_activities').select('id', { count: 'exact', head: true }).eq('completed', false).is('deleted_at', null),

      // Deals fechando em 7 dias (com detalhes para o card)
      supabase.from('crm_deals')
        .select('id, title, value, expected_close_date, crm_contacts(id, name, avatar_color), crm_companies(name)')
        .eq('status', 'open').lte('expected_close_date', in7Days).gte('expected_close_date', now.toISOString()).is('deleted_at', null)
        .order('expected_close_date'),

      // Deals por stage (para grafico de funil)
      supabase.from('crm_pipeline_stages')
        .select('id, name, pipeline_id, crm_deals(id, value, status)')
        .order('position'),

      // Ultimas 10 atividades
      supabase.from('crm_activities')
        .select('*, crm_contacts(id, name, avatar_color), crm_deals(id, title)')
        .is('deleted_at', null)
        .order('start_date', { ascending: false })
        .limit(10),

      // Revenue ultimos 12 meses (deals ganhos)
      supabase.from('crm_deals')
        .select('value, closed_at')
        .eq('status', 'won')
        .gte('closed_at', new Date(now.getFullYear() - 1, now.getMonth(), 1).toISOString())
        .is('deleted_at', null),
    ]);

    // Calcular KPIs
    const openDeals = openDealsRes.data || [];
    const wonThisMonth = wonThisMonthRes.data || [];
    const allClosed = allClosedRes.data || [];
    const wonLast12 = wonLast12Res.data || [];

    const pipelineValue = openDeals.reduce((sum, d) => sum + (d.value || 0), 0);
    const monthRevenue = wonThisMonth.reduce((sum, d) => sum + (d.value || 0), 0);

    const wonCount = allClosed.filter(d => d.status === 'won').length;
    const conversionRate = allClosed.length > 0 ? Math.round((wonCount / allClosed.length) * 100) : 0;

    // Revenue por mes
    const revenueByMonth = [];
    for (let i = 11; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      const monthValue = wonLast12
        .filter(deal => deal.closed_at && deal.closed_at.startsWith(monthKey))
        .reduce((sum, deal) => sum + (deal.value || 0), 0);
      revenueByMonth.push({ month: monthKey, value: monthValue });
    }

    // Deals por stage
    const dealsByStage = (stagesRes.data || []).map(stage => {
      const stageDeals = (stage.crm_deals || []).filter(d => d.status === 'open');
      return {
        stageId: stage.id,
        stageName: stage.name,
        count: stageDeals.length,
        value: stageDeals.reduce((sum, d) => sum + (d.value || 0), 0),
      };
    });

    // Recent activities transform
    const recentActivities = (recentActivitiesRes.data || []).map(r => ({
      id: r.id,
      title: r.title,
      type: r.type,
      startDate: r.start_date,
      completed: r.completed,
      contact: r.crm_contacts ? { id: r.crm_contacts.id, name: r.crm_contacts.name, avatarColor: r.crm_contacts.avatar_color } : null,
      deal: r.crm_deals ? { id: r.crm_deals.id, title: r.crm_deals.title } : null,
    }));

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
      totalCompanies: companiesRes.count || 0,
      openDeals: openDeals.length,
      pipelineValue,
      monthRevenue,
      conversionRate,
      pendingActivities: pendingActivitiesRes.count || 0,
      dealsClosingSoon: closingSoonList.length,
      dealsClosingSoonList: closingSoonList,
      revenueByMonth,
      dealsByStage,
      recentActivities,
    };
  } catch (err) {
    console.error('[CRM Dashboard] Erro ao calcular KPIs:', err);
    toast('Erro ao carregar dashboard CRM', 'error');
    return {
      totalContacts: 0,
      totalCompanies: 0,
      openDeals: 0,
      pipelineValue: 0,
      monthRevenue: 0,
      conversionRate: 0,
      pendingActivities: 0,
      dealsClosingSoon: 0,
      dealsClosingSoonList: [],
      revenueByMonth: [],
      dealsByStage: [],
      recentActivities: [],
    };
  }
}
