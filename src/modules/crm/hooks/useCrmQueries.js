import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from '../../../contexts/ToastContext';

// Services
import { getCrmCompanies, getCrmCompanyById, createCrmCompany, updateCrmCompany, softDeleteCrmCompany } from '../services/crmCompaniesService';
import { getCrmContacts, getCrmContactById, createCrmContact, updateCrmContact, softDeleteCrmContact, importContactsCSV } from '../services/crmContactsService';
import { getCrmPipelines, getCrmPipelineWithDeals, createCrmPipeline, deleteCrmPipeline, ensurePartnersPipeline, seedCommercialPipelines, seedEarlyStagePipelines } from '../services/crmPipelinesService';
import { getCrmDeals, getCrmDealById, createCrmDeal, updateCrmDeal, softDeleteCrmDeal, moveDealToStage, markDealAsWon, markDealAsLost, getDealActivities, getDealStageHistory } from '../services/crmDealsService';
import { getCrmActivities, createCrmActivity, updateCrmActivity, softDeleteCrmActivity, completeCrmActivity, createCadenceForDeal } from '../services/crmActivitiesService';
import { getCrmDashboardKPIs, getBonificacaoProgress, getSalesFunnel } from '../services/crmDashboardService';
import { getTrafficEntries, getTrafficKPIs, getTrafficByChannel, getTrafficOverTime, createTrafficEntry, updateTrafficEntry, softDeleteTrafficEntry } from '../services/crmTrafficService';
import { getCrmProspects, updateCrmProspect, softDeleteCrmProspect, sendToPipeline } from '../services/crmProspectsService';
import { getCrmGoals, createCrmGoal, updateCrmGoal, softDeleteCrmGoal, getGoalsProgress } from '../services/crmGoalsService';
import { getSalesReport, getFunnelReport, getForecastReport, getLearnedProbabilities } from '../services/crmReportsService';
import { getDailyScoreboard, getDailyBriefing } from '../services/crmDailyService';
import { getCrmCalendarActivities, getLeadTimeline } from '../services/crmAgendaService';
import { getLeadReport, saveLeadReport, getDailyReport, getWeeklyReport, getMonthlyReport, listReportOwners, getOwnerReportIndex } from '../services/crmLeadReportsService';
import { getAutomations, createAutomation, updateAutomation, deleteAutomation, toggleAutomation, getAutomationLogs, getAutomationLogStats } from '../services/crmAutomationsService';
import { getCrmCalls, getDialerQueue, getRecentCallsForContact, createCrmCall, softDeleteCrmCall, getDialerKPIs } from '../services/crmCallsService';
import { getConversationMessages, getInboxConversations, sendCrmMessage, markCrmMessagesAsRead } from '../services/crmMessagesService';
import { listCrmWhatsAppInstances, getCrmWhatsAppInstanceByName, getDefaultCrmWhatsAppInstance, createCrmWhatsAppInstance } from '../services/crmWhatsAppInstanceService';

// ==================== QUERY KEYS ====================

export const crmQueryKeys = {
  companies: ['crm', 'companies'],
  company: (id) => ['crm', 'company', id],
  contacts: ['crm', 'contacts'],
  contact: (id) => ['crm', 'contact', id],
  pipelines: ['crm', 'pipelines'],
  pipelineDeals: (id) => ['crm', 'pipelineDeals', id],
  deals: ['crm', 'deals'],
  deal: (id) => ['crm', 'deal', id],
  activities: ['crm', 'activities'],
  calendarActivities: (start, end) => ['crm', 'calendarActivities', start, end],
  leadTimeline: (key) => ['crm', 'leadTimeline', key],
  leadReport: (key) => ['crm', 'leadReport', key],
  dailyReport: (date, ownerId) => ['crm', 'dailyReport', date, ownerId || 'me'],
  weeklyReport: (weekStart, ownerId) => ['crm', 'weeklyReport', weekStart, ownerId || 'me'],
  monthlyReport: (monthStart, ownerId) => ['crm', 'monthlyReport', monthStart, ownerId || 'me'],
  reportOwners: ['crm', 'reportOwners'],
  ownerReportIndex: (ownerId) => ['crm', 'ownerReportIndex', ownerId],
  goals: ['crm', 'goals'],
  goalsProgress: ['crm', 'goalsProgress'],
  dashboard: ['crm', 'dashboard'],
  bonificacao: (start, end) => ['crm', 'bonificacao', start, end],
  salesReport: (start, end) => ['crm', 'salesReport', start, end],
  funnelReport: (id) => ['crm', 'funnelReport', id],
  forecastReport: ['crm', 'forecastReport'],
  learnedProbabilities: (pipelineId) => ['crm', 'learnedProbabilities', pipelineId || 'all'],
  dailyScoreboard: (start, end) => ['crm', 'dailyScoreboard', start, end],
  dailyBriefing: ['crm', 'dailyBriefing'],
  traffic: ['crm', 'traffic'],
  trafficKPIs: ['crm', 'trafficKPIs'],
  trafficByChannel: ['crm', 'trafficByChannel'],
  trafficOverTime: ['crm', 'trafficOverTime'],
  prospects: ['crm', 'prospects'],
  automations: ['crm', 'automations'],
  automationLogs: ['crm', 'automationLogs'],
  automationLogStats: (days) => ['crm', 'automationLogStats', days],
  calls: ['crm', 'calls'],
  dialerQueue: (filters) => ['crm', 'dialerQueue', filters],
  recentCallsForContact: (id) => ['crm', 'recentCalls', id],
  dialerKPIs: ['crm', 'dialerKPIs'],
  // Inbox WhatsApp
  conversation: (params) => ['crm', 'conversation', params],
  inbox: ['crm', 'inbox'],
  whatsappInstances: ['crm', 'whatsappInstances'],
  whatsappInstance: (name) => ['crm', 'whatsappInstance', name],
};

// ==================== COMPANIES ====================

export function useCrmCompanies(filters = {}) {
  return useQuery({
    queryKey: [...crmQueryKeys.companies, filters],
    queryFn: () => getCrmCompanies(filters),
    staleTime: 30_000,
  });
}

export function useCrmCompany(id) {
  return useQuery({
    queryKey: crmQueryKeys.company(id),
    queryFn: () => getCrmCompanyById(id),
    enabled: !!id,
    staleTime: 30_000,
  });
}

export function useCreateCrmCompany() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: createCrmCompany,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: crmQueryKeys.companies });
      qc.invalidateQueries({ queryKey: crmQueryKeys.dashboard });
      toast('Empresa criada com sucesso', 'success');
    },
  });
}

export function useUpdateCrmCompany() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, updates }) => updateCrmCompany(id, updates),
    onSuccess: (_, { id }) => {
      qc.invalidateQueries({ queryKey: crmQueryKeys.companies });
      qc.invalidateQueries({ queryKey: crmQueryKeys.company(id) });
      toast('Empresa atualizada', 'success');
    },
  });
}

export function useDeleteCrmCompany() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: softDeleteCrmCompany,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: crmQueryKeys.companies });
      qc.invalidateQueries({ queryKey: crmQueryKeys.dashboard });
      toast('Empresa excluida', 'success');
    },
  });
}

// ==================== CONTACTS ====================

export function useCrmContacts(filters = {}) {
  return useQuery({
    queryKey: [...crmQueryKeys.contacts, filters],
    queryFn: () => getCrmContacts(filters),
    staleTime: 30_000,
  });
}

export function useCrmContact(id) {
  return useQuery({
    queryKey: crmQueryKeys.contact(id),
    queryFn: () => getCrmContactById(id),
    enabled: !!id,
    staleTime: 30_000,
  });
}

export function useCreateCrmContact() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: createCrmContact,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: crmQueryKeys.contacts });
      qc.invalidateQueries({ queryKey: crmQueryKeys.dashboard });
      toast('Contato criado com sucesso', 'success');
    },
  });
}

export function useUpdateCrmContact() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, updates }) => updateCrmContact(id, updates),
    onSuccess: (_, { id }) => {
      qc.invalidateQueries({ queryKey: crmQueryKeys.contacts });
      qc.invalidateQueries({ queryKey: crmQueryKeys.contact(id) });
      toast('Contato atualizado', 'success');
    },
  });
}

export function useDeleteCrmContact() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: softDeleteCrmContact,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: crmQueryKeys.contacts });
      qc.invalidateQueries({ queryKey: crmQueryKeys.dashboard });
      toast('Contato excluido', 'success');
    },
  });
}

export function useImportCrmContacts() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: importContactsCSV,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: crmQueryKeys.contacts });
      qc.invalidateQueries({ queryKey: crmQueryKeys.dashboard });
    },
  });
}

// ==================== PIPELINES ====================

export function useCrmPipelines() {
  return useQuery({
    queryKey: crmQueryKeys.pipelines,
    queryFn: getCrmPipelines,
    staleTime: 60_000,
  });
}

export function useCrmPipelineWithDeals(pipelineId) {
  return useQuery({
    queryKey: crmQueryKeys.pipelineDeals(pipelineId),
    queryFn: () => getCrmPipelineWithDeals(pipelineId),
    enabled: !!pipelineId,
    staleTime: 15_000,
  });
}

export function useCreateCrmPipeline() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: createCrmPipeline,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: crmQueryKeys.pipelines });
      qc.invalidateQueries({ queryKey: ['crm', 'pipelineDeals'] });
      toast('Pipeline criado com sucesso', 'success');
    },
  });
}

export function useSeedCommercialPipelines() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: seedCommercialPipelines,
    onSuccess: () => {
      // Invalida TODAS as queries do CRM pois limpamos tudo antes
      qc.invalidateQueries({ queryKey: ['crm'] });
    },
  });
}

export function useSeedEarlyStagePipelines() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: seedEarlyStagePipelines,
    onSuccess: () => {
      // Limpou tudo antes de criar — invalida o CRM inteiro
      qc.invalidateQueries({ queryKey: ['crm'] });
    },
  });
}

export function useCreateCadence() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: createCadenceForDeal,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['crm', 'pipelineDeals'] });
      qc.invalidateQueries({ queryKey: crmQueryKeys.activities });
      qc.invalidateQueries({ queryKey: crmQueryKeys.dashboard });
    },
  });
}

export function useDeleteCrmPipeline() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: deleteCrmPipeline,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: crmQueryKeys.pipelines });
      qc.invalidateQueries({ queryKey: ['crm', 'pipelineDeals'] });
      toast('Pipeline excluido', 'success');
    },
  });
}

// ==================== DEALS ====================

export function useCrmDeals(filters = {}) {
  return useQuery({
    queryKey: [...crmQueryKeys.deals, filters],
    queryFn: () => getCrmDeals(filters),
    staleTime: 30_000,
  });
}

export function useCrmDeal(id) {
  return useQuery({
    queryKey: crmQueryKeys.deal(id),
    queryFn: () => getCrmDealById(id),
    enabled: !!id,
    staleTime: 30_000,
  });
}

export function useCreateCrmDeal() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: createCrmDeal,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: crmQueryKeys.deals });
      qc.invalidateQueries({ queryKey: crmQueryKeys.dashboard });
      // Invalidar pipeline-specific queries
      qc.invalidateQueries({ queryKey: ['crm', 'pipelineDeals'] });
      toast('Negocio criado com sucesso', 'success');
    },
  });
}

export function useUpdateCrmDeal() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, updates }) => updateCrmDeal(id, updates),
    onSuccess: (_, { id }) => {
      qc.invalidateQueries({ queryKey: crmQueryKeys.deals });
      qc.invalidateQueries({ queryKey: crmQueryKeys.deal(id) });
      qc.invalidateQueries({ queryKey: ['crm', 'pipelineDeals'] });
      toast('Negocio atualizado', 'success');
    },
  });
}

export function useDeleteCrmDeal() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: softDeleteCrmDeal,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: crmQueryKeys.deals });
      qc.invalidateQueries({ queryKey: crmQueryKeys.dashboard });
      qc.invalidateQueries({ queryKey: ['crm', 'pipelineDeals'] });
      toast('Negocio excluido', 'success');
    },
    onError: (err) => {
      toast(`Erro ao excluir negocio: ${err.message}`, 'error');
    },
  });
}

export function useMoveCrmDeal() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ dealId, stageId }) => moveDealToStage(dealId, stageId),
    onMutate: async ({ dealId, stageId, targetIndex }) => {
      // Cancelar refetches em andamento para nao sobrescrever o optimistic update
      await qc.cancelQueries({ queryKey: ['crm', 'pipelineDeals'] });

      // Snapshot do cache atual (copia profunda para rollback seguro)
      const allQueries = qc.getQueriesData({ queryKey: ['crm', 'pipelineDeals'] });
      const snapshot = allQueries
        .filter(([, d]) => d != null)
        .map(([key, d]) => [key, JSON.parse(JSON.stringify(d))]);

      // Optimistic update: mover deal de um stage para outro no cache
      allQueries.forEach(([queryKey, oldData]) => {
        if (!oldData?.stages) return;
        let movedDeal = null;
        const updatedStages = oldData.stages.map(stage => {
          const deal = stage.deals?.find(d => d.id === dealId);
          if (deal) {
            movedDeal = { ...deal };
            return {
              ...stage,
              deals: stage.deals.filter(d => d.id !== dealId),
              totalValue: stage.totalValue - (deal.value || 0),
            };
          }
          return stage;
        });

        if (movedDeal) {
          const finalStages = updatedStages.map(stage => {
            if (stage.id === stageId) {
              const deals = [...(stage.deals || [])];
              if (targetIndex != null && targetIndex <= deals.length) {
                deals.splice(targetIndex, 0, movedDeal);
              } else {
                deals.push(movedDeal);
              }
              return {
                ...stage,
                deals,
                totalValue: (stage.totalValue || 0) + (movedDeal.value || 0),
              };
            }
            return stage;
          });
          qc.setQueryData(queryKey, { ...oldData, stages: finalStages });
        }
      });

      return { snapshot };
    },
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: crmQueryKeys.deals });

      // Atualizar status do deal no cache do kanban
      const allQueries = qc.getQueriesData({ queryKey: ['crm', 'pipelineDeals'] });
      allQueries.forEach(([queryKey, oldData]) => {
        if (!oldData?.stages) return;
        const updatedStages = oldData.stages.map(stage => ({
          ...stage,
          deals: stage.deals?.map(d => d.id === data.id ? { ...d, status: data.status, probability: data.probability } : d),
        }));
        qc.setQueryData(queryKey, { ...oldData, stages: updatedStages });
      });

      if (data?.status === 'won') {
        qc.invalidateQueries({ queryKey: crmQueryKeys.dashboard });
        qc.invalidateQueries({ queryKey: ['crm', 'learnedProbabilities'] });
        toast('Negocio ganho! Parabens!', 'success');
      }
    },
    onError: (err, _vars, context) => {
      // Rollback: restaurar snapshot original
      if (context?.snapshot) {
        context.snapshot.forEach(([queryKey, oldData]) => {
          qc.setQueryData(queryKey, oldData);
        });
      }
      // Refetch para garantir estado correto
      qc.invalidateQueries({ queryKey: ['crm', 'pipelineDeals'] });
      toast(`Erro ao mover negocio: ${err.message}`, 'error');
    },
  });
}

// Helper: remover deal do cache do kanban (optimistic)
function removeDealFromPipelineCache(qc, dealId) {
  const allQueries = qc.getQueriesData({ queryKey: ['crm', 'pipelineDeals'] });
  allQueries.forEach(([queryKey, oldData]) => {
    if (!oldData?.stages) return;
    const updatedStages = oldData.stages.map(stage => {
      const deal = stage.deals?.find(d => d.id === dealId);
      if (deal) {
        return {
          ...stage,
          deals: stage.deals.filter(d => d.id !== dealId),
          totalValue: stage.totalValue - (deal.value || 0),
        };
      }
      return stage;
    });
    qc.setQueryData(queryKey, { ...oldData, stages: updatedStages });
  });
}

// Helper: snapshot profundo das queries de pipelineDeals para rollback
function snapshotPipelineDeals(qc) {
  return qc.getQueriesData({ queryKey: ['crm', 'pipelineDeals'] })
    .filter(([, d]) => d != null)
    .map(([key, d]) => [key, JSON.parse(JSON.stringify(d))]);
}

function restorePipelineDealsSnapshot(qc, snapshot) {
  if (!snapshot) return;
  snapshot.forEach(([queryKey, oldData]) => {
    qc.setQueryData(queryKey, oldData);
  });
}

export function useMarkDealWon() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: markDealAsWon,
    onMutate: async (dealId) => {
      await qc.cancelQueries({ queryKey: ['crm', 'pipelineDeals'] });
      const snapshot = snapshotPipelineDeals(qc);
      removeDealFromPipelineCache(qc, dealId);
      return { snapshot };
    },
    onError: (_err, _vars, context) => {
      restorePipelineDealsSnapshot(qc, context?.snapshot);
      toast('Erro ao marcar negocio como ganho', 'error');
    },
    onSuccess: () => {
      toast('Negocio marcado como ganho!', 'success');
    },
    onSettled: () => {
      qc.invalidateQueries({ queryKey: crmQueryKeys.deals });
      qc.invalidateQueries({ queryKey: crmQueryKeys.dashboard });
      qc.invalidateQueries({ queryKey: ['crm', 'pipelineDeals'] });
      qc.invalidateQueries({ queryKey: ['crm', 'learnedProbabilities'] });
    },
  });
}

export function useMarkDealLost() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ dealId, reason }) => markDealAsLost(dealId, reason),
    onMutate: async ({ dealId }) => {
      await qc.cancelQueries({ queryKey: ['crm', 'pipelineDeals'] });
      const snapshot = snapshotPipelineDeals(qc);
      // Otimismo: REMOVE o card do pipeline atual — markDealAsLost agora move
      // o deal pra Nurturing automaticamente, entao ele nao deve aparecer mais
      // na pipeline em que estava. O refetch traz a versao real depois.
      const allQueries = qc.getQueriesData({ queryKey: ['crm', 'pipelineDeals'] });
      allQueries.forEach(([queryKey, oldData]) => {
        if (!oldData?.stages) return;
        const updatedStages = oldData.stages.map(stage => ({
          ...stage,
          deals: stage.deals?.filter(d => d.id !== dealId),
        }));
        qc.setQueryData(queryKey, { ...oldData, stages: updatedStages });
      });
      return { snapshot };
    },
    onError: (_err, _vars, context) => {
      restorePipelineDealsSnapshot(qc, context?.snapshot);
      toast('Erro ao marcar negocio como perdido', 'error');
    },
    onSuccess: (data) => {
      if (data?._movedTo === 'nurturing') {
        toast('Perdido — lead movido pra Nurturing pra reativacao futura', 'info');
      } else if (data?._movedTo === 'descarte') {
        toast('Lead descartado de vez', 'warning');
      } else {
        toast('Negocio marcado como perdido', 'warning');
      }
    },
    onSettled: () => {
      qc.invalidateQueries({ queryKey: crmQueryKeys.deals });
      qc.invalidateQueries({ queryKey: crmQueryKeys.dashboard });
      qc.invalidateQueries({ queryKey: ['crm', 'pipelineDeals'] });
      qc.invalidateQueries({ queryKey: ['crm', 'learnedProbabilities'] });
    },
  });
}

// ==================== DEAL DETAIL ====================

export function useDealActivities(dealId) {
  return useQuery({
    queryKey: ['crm', 'dealActivities', dealId],
    queryFn: () => getDealActivities(dealId),
    enabled: !!dealId,
    staleTime: 30_000,
  });
}

export function useDealStageHistory(dealId) {
  return useQuery({
    queryKey: ['crm', 'dealStageHistory', dealId],
    queryFn: () => getDealStageHistory(dealId),
    enabled: !!dealId,
    staleTime: 60_000,
  });
}

// ==================== ACTIVITIES ====================

export function useCrmActivities(filters = {}) {
  return useQuery({
    queryKey: [...crmQueryKeys.activities, filters],
    queryFn: () => getCrmActivities(filters),
    staleTime: 30_000,
  });
}

// Atividades do CRM que cruzam o recorte visivel do calendario (Agenda).
export function useCrmCalendarActivities(start, end) {
  return useQuery({
    queryKey: crmQueryKeys.calendarActivities(start, end),
    queryFn: () => getCrmCalendarActivities({ start, end }),
    enabled: !!start && !!end,
    staleTime: 30_000,
  });
}

// Timeline unificada de um lead (atividades + ligacoes + WhatsApp + estagio).
export function useLeadTimeline({ dealId = null, contactId = null } = {}) {
  return useQuery({
    queryKey: crmQueryKeys.leadTimeline(`${dealId || ''}:${contactId || ''}`),
    queryFn: () => getLeadTimeline({ dealId, contactId }),
    enabled: !!(dealId || contactId),
    staleTime: 15_000,
  });
}

// Relato diario que o vendedor escreve sobre um lead (painel da Agenda).
export function useLeadDailyReport({ dealId = null, contactId = null, date } = {}) {
  return useQuery({
    queryKey: crmQueryKeys.leadReport(`${dealId || ''}:${contactId || ''}:${date || ''}`),
    queryFn: () => getLeadReport({ dealId, contactId, date }),
    enabled: !!(dealId || contactId) && !!date,
    staleTime: 10_000,
  });
}

export function useSaveLeadReport() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: saveLeadReport,
    onSuccess: (_res, vars) => {
      qc.invalidateQueries({ queryKey: crmQueryKeys.leadReport(`${vars.dealId || ''}:${vars.contactId || ''}:${vars.date || ''}`) });
      qc.invalidateQueries({ queryKey: ['crm', 'dailyReport'] });
      qc.invalidateQueries({ queryKey: ['crm', 'weeklyReport'] });
      qc.invalidateQueries({ queryKey: ['crm', 'monthlyReport'] });
      qc.invalidateQueries({ queryKey: ['crm', 'ownerReportIndex'] });
    },
    onError: (err) => toast(`Erro ao salvar relato: ${err.message}`, 'error'),
  });
}

// Relatorio consolidado do dia (leads atendidos + contadores + relatos).
// ownerId opcional: relatorio de outro vendedor (arquivo). Default = logado.
export function useDailyReport(date, ownerId = null) {
  return useQuery({
    queryKey: crmQueryKeys.dailyReport(date, ownerId),
    queryFn: () => getDailyReport(date, ownerId),
    enabled: !!date,
    staleTime: 15_000,
  });
}

// Relatorio semanal: junta os relatos diarios da semana + metricas (reunioes,
// vendas, conversao). ownerId opcional (arquivo).
export function useWeeklyReport(weekStart, ownerId = null) {
  return useQuery({
    queryKey: crmQueryKeys.weeklyReport(weekStart, ownerId),
    queryFn: () => getWeeklyReport(weekStart, ownerId),
    enabled: !!weekStart,
    staleTime: 15_000,
  });
}

// Relatorio mensal (mesma estrutura do semanal). ownerId opcional (arquivo).
export function useMonthlyReport(monthStart, ownerId = null) {
  return useQuery({
    queryKey: crmQueryKeys.monthlyReport(monthStart, ownerId),
    queryFn: () => getMonthlyReport(monthStart, ownerId),
    enabled: !!monthStart,
    staleTime: 15_000,
  });
}

// Arquivo de relatorios: pessoas (pastas) + indice de datas por pessoa.
export function useReportOwners() {
  return useQuery({
    queryKey: crmQueryKeys.reportOwners,
    queryFn: listReportOwners,
    staleTime: 60_000,
  });
}

export function useOwnerReportIndex(ownerId) {
  return useQuery({
    queryKey: crmQueryKeys.ownerReportIndex(ownerId),
    queryFn: () => getOwnerReportIndex(ownerId),
    enabled: !!ownerId,
    staleTime: 30_000,
  });
}


export function useCreateCrmActivity() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: createCrmActivity,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: crmQueryKeys.activities });
      qc.invalidateQueries({ queryKey: ['crm', 'dealActivities'] });
      qc.invalidateQueries({ queryKey: ['crm', 'calendarActivities'] });
      qc.invalidateQueries({ queryKey: ['crm', 'leadTimeline'] });
      qc.invalidateQueries({ queryKey: crmQueryKeys.dashboard });
      qc.invalidateQueries({ queryKey: ['agendaEvents'] });
      toast('Atividade criada com sucesso', 'success');
    },
  });
}

export function useUpdateCrmActivity() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, updates }) => updateCrmActivity(id, updates),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: crmQueryKeys.activities });
      qc.invalidateQueries({ queryKey: ['crm', 'dealActivities'] });
      qc.invalidateQueries({ queryKey: ['crm', 'calendarActivities'] });
      qc.invalidateQueries({ queryKey: ['crm', 'leadTimeline'] });
      qc.invalidateQueries({ queryKey: ['agendaEvents'] });
    },
  });
}

export function useDeleteCrmActivity() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: softDeleteCrmActivity,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: crmQueryKeys.activities });
      qc.invalidateQueries({ queryKey: ['crm', 'dealActivities'] });
      qc.invalidateQueries({ queryKey: ['crm', 'calendarActivities'] });
      qc.invalidateQueries({ queryKey: ['crm', 'leadTimeline'] });
      qc.invalidateQueries({ queryKey: crmQueryKeys.dashboard });
      qc.invalidateQueries({ queryKey: ['agendaEvents'] });
      toast('Atividade excluida', 'success');
    },
  });
}

export function useCompleteCrmActivity() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: completeCrmActivity,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: crmQueryKeys.activities });
      qc.invalidateQueries({ queryKey: ['crm', 'dealActivities'] });
      qc.invalidateQueries({ queryKey: ['crm', 'calendarActivities'] });
      qc.invalidateQueries({ queryKey: ['crm', 'leadTimeline'] });
      qc.invalidateQueries({ queryKey: crmQueryKeys.dashboard });
      toast('Atividade concluida', 'success');
    },
  });
}

// ==================== CALLS / DISCADOR ====================

export function useCrmCalls(filters = {}) {
  return useQuery({
    queryKey: [...crmQueryKeys.calls, filters],
    queryFn: () => getCrmCalls(filters),
    staleTime: 30_000,
  });
}

export function useDialerQueue(filters = {}) {
  return useQuery({
    queryKey: crmQueryKeys.dialerQueue(filters),
    queryFn: () => getDialerQueue(filters),
    staleTime: 15_000,
  });
}

export function useRecentCallsForContact(contactId, limit = 5) {
  return useQuery({
    queryKey: [...crmQueryKeys.recentCallsForContact(contactId), limit],
    queryFn: () => getRecentCallsForContact(contactId, limit),
    enabled: !!contactId,
    staleTime: 15_000,
  });
}

export function useDialerKPIs() {
  return useQuery({
    queryKey: crmQueryKeys.dialerKPIs,
    queryFn: getDialerKPIs,
    staleTime: 30_000,
  });
}

export function useCreateCrmCall() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: createCrmCall,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: crmQueryKeys.calls });
      qc.invalidateQueries({ queryKey: ['crm', 'dialerQueue'] });
      qc.invalidateQueries({ queryKey: ['crm', 'recentCalls'] });
      qc.invalidateQueries({ queryKey: crmQueryKeys.dialerKPIs });
      qc.invalidateQueries({ queryKey: crmQueryKeys.activities });
      qc.invalidateQueries({ queryKey: crmQueryKeys.dashboard });
      toast('Ligacao registrada', 'success');
    },
  });
}

export function useDeleteCrmCall() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: softDeleteCrmCall,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: crmQueryKeys.calls });
      qc.invalidateQueries({ queryKey: ['crm', 'recentCalls'] });
      toast('Ligacao excluida', 'success');
    },
  });
}

// ==================== GOALS ====================

export function useCrmGoals(filters = {}) {
  return useQuery({
    queryKey: [...crmQueryKeys.goals, filters],
    queryFn: () => getCrmGoals(filters),
    staleTime: 30_000,
  });
}

export function useGoalsProgress(goals) {
  return useQuery({
    queryKey: [...crmQueryKeys.goalsProgress, goals?.map(g => g.id).join(',')],
    queryFn: () => getGoalsProgress(goals),
    enabled: !!goals && goals.length > 0,
    staleTime: 60_000,
  });
}

export function useCreateCrmGoal() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: createCrmGoal,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: crmQueryKeys.goals });
      qc.invalidateQueries({ queryKey: crmQueryKeys.goalsProgress });
      toast('Meta criada com sucesso', 'success');
    },
  });
}

export function useUpdateCrmGoal() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, updates }) => updateCrmGoal(id, updates),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: crmQueryKeys.goals });
      qc.invalidateQueries({ queryKey: crmQueryKeys.goalsProgress });
      toast('Meta atualizada', 'success');
    },
  });
}

export function useDeleteCrmGoal() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: softDeleteCrmGoal,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: crmQueryKeys.goals });
      qc.invalidateQueries({ queryKey: crmQueryKeys.goalsProgress });
      toast('Meta excluida', 'success');
    },
  });
}

// ==================== DASHBOARD ====================

export function useCrmDashboardKPIs(range, scope = 'sales') {
  return useQuery({
    queryKey: [...crmQueryKeys.dashboard, range || null, scope],
    queryFn: () => getCrmDashboardKPIs(range, scope),
    staleTime: 60_000,
  });
}

export function useBonificacaoProgress(startDate, endDate) {
  return useQuery({
    queryKey: crmQueryKeys.bonificacao(startDate, endDate),
    queryFn: () => getBonificacaoProgress(startDate, endDate),
    staleTime: 60_000,
  });
}

// Funil de conversão atividade -> venda (ligações -> reuniões -> leads -> clientes).
export function useSalesFunnel(range, scope = 'sales', ownerId = null) {
  return useQuery({
    queryKey: [...crmQueryKeys.dashboard, 'funnel', range || null, scope, ownerId || 'all'],
    queryFn: () => getSalesFunnel(range, scope, ownerId),
    staleTime: 60_000,
  });
}

// ==================== REPORTS ====================

export function useSalesReport(startDate, endDate) {
  return useQuery({
    queryKey: crmQueryKeys.salesReport(startDate, endDate),
    queryFn: () => getSalesReport(startDate, endDate),
    enabled: !!startDate && !!endDate,
    staleTime: 120_000,
  });
}

export function useFunnelReport(pipelineId) {
  return useQuery({
    queryKey: crmQueryKeys.funnelReport(pipelineId),
    queryFn: () => getFunnelReport(pipelineId),
    enabled: !!pipelineId,
    staleTime: 60_000,
  });
}

export function useForecastReport() {
  return useQuery({
    queryKey: crmQueryKeys.forecastReport,
    queryFn: getForecastReport,
    staleTime: 60_000,
  });
}

export function useLearnedProbabilities(pipelineId = null) {
  return useQuery({
    queryKey: crmQueryKeys.learnedProbabilities(pipelineId),
    queryFn: () => getLearnedProbabilities(pipelineId),
    staleTime: 120_000,
  });
}

export function useDailyScoreboard(dayStartISO, dayEndISO) {
  return useQuery({
    queryKey: crmQueryKeys.dailyScoreboard(dayStartISO, dayEndISO),
    queryFn: () => getDailyScoreboard(dayStartISO, dayEndISO),
    enabled: !!dayStartISO && !!dayEndISO,
    staleTime: 60_000,
  });
}

export function useDailyBriefing() {
  return useQuery({
    queryKey: crmQueryKeys.dailyBriefing,
    queryFn: () => getDailyBriefing(),
    staleTime: 60_000,
  });
}

// ==================== PAID TRAFFIC ====================

export function useCrmTraffic(filters = {}) {
  return useQuery({
    queryKey: [...crmQueryKeys.traffic, filters],
    queryFn: () => getTrafficEntries(filters),
    staleTime: 30_000,
  });
}

export function useCrmTrafficKPIs(filters = {}) {
  return useQuery({
    queryKey: [...crmQueryKeys.trafficKPIs, filters],
    queryFn: () => getTrafficKPIs(filters),
    staleTime: 60_000,
  });
}

export function useCrmTrafficByChannel(filters = {}) {
  return useQuery({
    queryKey: [...crmQueryKeys.trafficByChannel, filters],
    queryFn: () => getTrafficByChannel(filters),
    staleTime: 60_000,
  });
}

export function useCrmTrafficOverTime(filters = {}) {
  return useQuery({
    queryKey: [...crmQueryKeys.trafficOverTime, filters],
    queryFn: () => getTrafficOverTime(filters),
    staleTime: 60_000,
  });
}

export function useCreateCrmTraffic() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: createTrafficEntry,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: crmQueryKeys.traffic });
      qc.invalidateQueries({ queryKey: crmQueryKeys.trafficKPIs });
      qc.invalidateQueries({ queryKey: crmQueryKeys.trafficByChannel });
      qc.invalidateQueries({ queryKey: crmQueryKeys.trafficOverTime });
      toast('Registro de trafego criado', 'success');
    },
  });
}

export function useUpdateCrmTraffic() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, updates }) => updateTrafficEntry(id, updates),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: crmQueryKeys.traffic });
      qc.invalidateQueries({ queryKey: crmQueryKeys.trafficKPIs });
      qc.invalidateQueries({ queryKey: crmQueryKeys.trafficByChannel });
      qc.invalidateQueries({ queryKey: crmQueryKeys.trafficOverTime });
      toast('Registro atualizado', 'success');
    },
  });
}

export function useDeleteCrmTraffic() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: softDeleteTrafficEntry,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: crmQueryKeys.traffic });
      qc.invalidateQueries({ queryKey: crmQueryKeys.trafficKPIs });
      qc.invalidateQueries({ queryKey: crmQueryKeys.trafficByChannel });
      qc.invalidateQueries({ queryKey: crmQueryKeys.trafficOverTime });
      toast('Registro excluido', 'success');
    },
  });
}

// ==================== PROSPECTS ====================

export function useCrmProspects(filters) {
  return useQuery({
    queryKey: [...crmQueryKeys.prospects, filters],
    queryFn: () => getCrmProspects(filters),
    staleTime: 10 * 60_000, // 10 min — economizar creditos da API Casa dos Dados
    enabled: !!filters,     // so dispara quando ha filtros reais (apos clicar "Gerar Lista")
  });
}

export function useUpdateCrmProspect() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, updates }) => updateCrmProspect(id, updates),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: crmQueryKeys.prospects });
      toast('Prospect atualizado', 'success');
    },
  });
}

export function useDeleteCrmProspect() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: softDeleteCrmProspect,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: crmQueryKeys.prospects });
      toast('Prospect excluido', 'success');
    },
  });
}

export function useSendToPipeline() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ prospects, pipelineId, stageId, defaultValue }) => sendToPipeline(prospects, pipelineId, stageId, { defaultValue }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: crmQueryKeys.prospects });
      qc.invalidateQueries({ queryKey: crmQueryKeys.deals });
      qc.invalidateQueries({ queryKey: crmQueryKeys.companies });
      qc.invalidateQueries({ queryKey: crmQueryKeys.contacts });
      qc.invalidateQueries({ queryKey: crmQueryKeys.dashboard });
      qc.invalidateQueries({ queryKey: ['crm', 'pipelineDeals'] });
    },
  });
}

// ==================== PARTNERS PIPELINE ====================

export function useEnsurePartnersPipeline() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ensurePartnersPipeline,
    onSuccess: (result) => {
      qc.invalidateQueries({ queryKey: crmQueryKeys.pipelines });
      if (result?.created) toast('Pipeline Parceiros criado com sucesso', 'success');
    },
  });
}

// ==================== AUTOMAÇÕES ====================

export function useAutomations(filters = {}) {
  return useQuery({
    queryKey: [...crmQueryKeys.automations, filters],
    queryFn: () => getAutomations(filters),
    staleTime: 30_000,
  });
}

export function useAutomationLogs(filters = {}) {
  return useQuery({
    queryKey: [...crmQueryKeys.automationLogs, filters],
    queryFn: () => getAutomationLogs(filters),
    staleTime: 15_000,
  });
}

export function useAutomationLogStats(days = 7) {
  return useQuery({
    queryKey: crmQueryKeys.automationLogStats(days),
    queryFn: () => getAutomationLogStats(days),
    staleTime: 60_000,
  });
}

export function useCreateAutomation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: createAutomation,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: crmQueryKeys.automations });
      toast('Automacao criada com sucesso!', 'success');
    },
    onError: (err) => {
      toast(`Erro ao criar automacao: ${err.message}`, 'error');
    },
  });
}

export function useUpdateAutomation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }) => updateAutomation(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: crmQueryKeys.automations });
      toast('Automacao atualizada!', 'success');
    },
    onError: (err) => {
      toast(`Erro ao atualizar automacao: ${err.message}`, 'error');
    },
  });
}

export function useDeleteAutomation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: deleteAutomation,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: crmQueryKeys.automations });
      toast('Automacao removida', 'success');
    },
    onError: (err) => {
      toast(`Erro ao remover automacao: ${err.message}`, 'error');
    },
  });
}

export function useToggleAutomation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, active }) => toggleAutomation(id, active),
    onSuccess: (_, { active }) => {
      qc.invalidateQueries({ queryKey: crmQueryKeys.automations });
      toast(active ? 'Automacao ativada' : 'Automacao pausada', 'success');
    },
  });
}

// ==================== INBOX WHATSAPP ====================

/**
 * Lista de conversas do Inbox (ultima mensagem agrupada por contato/prospect).
 */
export function useCrmInboxConversations(opts = {}) {
  return useQuery({
    queryKey: [...crmQueryKeys.inbox, opts],
    queryFn: () => getInboxConversations(opts),
    staleTime: 15_000,
    refetchOnWindowFocus: true,
  });
}

/**
 * Mensagens de uma conversa especifica (contato OU prospect).
 * Ordem ASC pra scroll natural do chat.
 */
export function useCrmConversation({ contactId, prospectId, limit = 100 } = {}) {
  return useQuery({
    queryKey: crmQueryKeys.conversation({ contactId, prospectId, limit }),
    queryFn: () => getConversationMessages({ contactId, prospectId, limit }),
    enabled: !!(contactId || prospectId),
    staleTime: 10_000,
  });
}

/**
 * Envia mensagem via Edge Function evolution-send.
 * onSuccess invalida conversation+inbox.
 */
export function useSendCrmMessage() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: sendCrmMessage,
    onSuccess: (res) => {
      if (!res?.ok) return;
      qc.invalidateQueries({ queryKey: crmQueryKeys.inbox });
      // Prefixo: invalida a conversa independente do limit usado pela tela
      qc.invalidateQueries({ queryKey: ['crm', 'conversation'] });
    },
  });
}

export function useMarkCrmMessagesAsRead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: markCrmMessagesAsRead,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: crmQueryKeys.inbox });
    },
  });
}

// ==================== WHATSAPP INSTANCES ====================

export function useCrmWhatsAppInstances() {
  return useQuery({
    queryKey: crmQueryKeys.whatsappInstances,
    queryFn: listCrmWhatsAppInstances,
    staleTime: 10_000,
  });
}

export function useCrmWhatsAppInstance(name) {
  return useQuery({
    queryKey: crmQueryKeys.whatsappInstance(name || 'default'),
    queryFn: () => (name ? getCrmWhatsAppInstanceByName(name) : getDefaultCrmWhatsAppInstance()),
    staleTime: 5_000,
    refetchInterval: (q) => {
      // Polling rapido quando esperando QR ou conectando
      const status = q.state.data?.status;
      if (status === 'qr_pending' || status === 'connecting') return 3_000;
      return false;
    },
  });
}

export function useCreateCrmWhatsAppInstance() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: createCrmWhatsAppInstance,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: crmQueryKeys.whatsappInstances });
    },
  });
}
