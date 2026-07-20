import { useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from '../../../contexts/ToastContext';

// Services
import { getCrmCompanies, getCrmCompanyById, createCrmCompany, updateCrmCompany, softDeleteCrmCompany } from '../services/crmCompaniesService';
import { getCrmContacts, getCrmContactById, createCrmContact, updateCrmContact, softDeleteCrmContact, importContactsCSV } from '../services/crmContactsService';
import { getCrmPipelines, getCrmPipelineWithDeals, createCrmPipeline, updateCrmPipeline, deleteCrmPipeline, ensurePartnersPipeline, ensureGeneralPipeline, consolidateSalesPipelinesIntoGeneral, seedCommercialPipelines, seedEarlyStagePipelines } from '../services/crmPipelinesService';
import { getCrmDeals, getCrmDealById, createCrmDeal, updateCrmDeal, softDeleteCrmDeal, moveDealToStage, markDealAsWon, markDealAsLost, markDealAsChurned, reactivateChurnedDeal, getDealActivities, getDealStageHistory } from '../services/crmDealsService';
import { getCrmActivities, createCrmActivity, updateCrmActivity, softDeleteCrmActivity, completeCrmActivity, createCadenceForDeal, cancelCadenceForDeal } from '../services/crmActivitiesService';
import { getCrmDashboardKPIs, getBonificacaoProgress, getSalesFunnel, getFunnelStageDeals } from '../services/crmDashboardService';
import { getPlaybookByPipeline, getStepsByIds, saveStageSteps, saveStageGoal, getDealProgress, toggleDealStep } from '../services/crmPlaybookService';
import { getTrafficEntries, getTrafficKPIs, getTrafficByChannel, getTrafficOverTime, createTrafficEntry, updateTrafficEntry, softDeleteTrafficEntry } from '../services/crmTrafficService';
import { getCrmProspects, getCrmProspectById, updateCrmProspect, softDeleteCrmProspect, sendToPipeline } from '../services/crmProspectsService';
import { getCrmGoals, createCrmGoal, updateCrmGoal, softDeleteCrmGoal, getGoalsProgress } from '../services/crmGoalsService';
import { getSalesReport, getLearnedProbabilities } from '../services/crmReportsService';
import { getDailyScoreboard, getDailyBriefing } from '../services/crmDailyService';
import { getCrmCalendarActivities, getLeadTimeline } from '../services/crmAgendaService';
import { getDailyReport, getWeeklyReport, getMonthlyReport, listReportOwners, getOwnerReportIndex } from '../services/crmLeadReportsService';
import { getAutomations, createAutomation, updateAutomation, deleteAutomation, toggleAutomation, getAutomationLogs, getAutomationLogStats } from '../services/crmAutomationsService';
import { getCrmCalls, getDialerQueue, getRecentCallsForContact, createCrmCall, softDeleteCrmCall, getDialerKPIs } from '../services/crmCallsService';
import { getConversationMessages, getInboxConversations, sendCrmMessage, markCrmMessagesAsRead } from '../services/crmMessagesService';
import { listCrmWhatsAppInstances, getCrmWhatsAppInstanceByName, getDefaultCrmWhatsAppInstance, createCrmWhatsAppInstance } from '../services/crmWhatsAppInstanceService';
import { getCrmPartners, getLeadsByPartner, createCrmPartner, updateCrmPartner, softDeleteCrmPartner } from '../services/crmPartnersService';
import { getCrmLeadSources, createCrmLeadSource, deleteCrmLeadSource } from '../services/crmLeadSourcesService';
import { getCrmWorkspaceSettingsRemote, updateCrmWorkspaceSettingsRemote } from '../services/crmWorkspaceSettingsService';

// ==================== QUERY KEYS ====================

export const crmQueryKeys = {
  companies: ['crm', 'companies'],
  company: (id) => ['crm', 'company', id],
  contacts: ['crm', 'contacts'],
  contact: (id) => ['crm', 'contact', id],
  pipelines: ['crm', 'pipelines'],
  pipelineDeals: (id) => ['crm', 'pipelineDeals', id],
  playbook: (pipelineId) => ['crm', 'playbook', pipelineId],
  playbookSteps: (idsKey) => ['crm', 'playbookSteps', idsKey],
  dealProgress: (dealId) => ['crm', 'dealProgress', dealId],
  deals: ['crm', 'deals'],
  deal: (id) => ['crm', 'deal', id],
  activities: ['crm', 'activities'],
  calendarActivities: (start, end) => ['crm', 'calendarActivities', start, end],
  leadTimeline: (key) => ['crm', 'leadTimeline', key],
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
  learnedProbabilities: (pipelineId) => ['crm', 'learnedProbabilities', pipelineId || 'all'],
  dailyScoreboard: (start, end) => ['crm', 'dailyScoreboard', start, end],
  dailyBriefing: ['crm', 'dailyBriefing'],
  traffic: ['crm', 'traffic'],
  trafficKPIs: ['crm', 'trafficKPIs'],
  trafficByChannel: ['crm', 'trafficByChannel'],
  trafficOverTime: ['crm', 'trafficOverTime'],
  prospects: ['crm', 'prospects'],
  prospect: (id) => ['crm', 'prospect', id],
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
  partners: ['crm', 'partners'],
  leadsByPartner: (name) => ['crm', 'leadsByPartner', name],
  leadSources: ['crm', 'leadSources'],
  workspaceSettings: ['crm', 'workspaceSettings'],
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

// ==================== PARTNERS (parceiros indicadores) ====================

export function useCrmPartners() {
  return useQuery({
    queryKey: crmQueryKeys.partners,
    queryFn: getCrmPartners,
    staleTime: 30_000,
  });
}

export function useLeadsByPartner(name) {
  return useQuery({
    queryKey: crmQueryKeys.leadsByPartner(name),
    queryFn: () => getLeadsByPartner(name),
    enabled: !!name,
  });
}

export function useCreateCrmPartner() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: createCrmPartner,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: crmQueryKeys.partners });
      toast('Parceiro criado com sucesso', 'success');
    },
  });
}

export function useUpdateCrmPartner() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, updates }) => updateCrmPartner(id, updates),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: crmQueryKeys.partners });
      toast('Parceiro atualizado', 'success');
    },
  });
}

export function useDeleteCrmPartner() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: softDeleteCrmPartner,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: crmQueryKeys.partners });
      toast('Parceiro excluido', 'success');
    },
  });
}

// ==================== LEAD SOURCES (origem do lead) ====================

export function useCrmLeadSources() {
  return useQuery({
    queryKey: crmQueryKeys.leadSources,
    queryFn: getCrmLeadSources,
    staleTime: 30_000,
  });
}

export function useCreateCrmLeadSource() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: createCrmLeadSource,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: crmQueryKeys.leadSources });
    },
  });
}

export function useDeleteCrmLeadSource() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: deleteCrmLeadSource,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: crmQueryKeys.leadSources });
      toast('Origem removida', 'success');
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

export function useUpdateCrmPipeline() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }) => updateCrmPipeline(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: crmQueryKeys.pipelines });
      qc.invalidateQueries({ queryKey: ['crm', 'pipelineDeals'] });
      qc.invalidateQueries({ queryKey: crmQueryKeys.dashboard });
    },
  });
}

// ==================== PLAYBOOK DA ETAPA ====================

/** Passos de todas as etapas da pipeline, agrupados por stageId. */
export function useStagePlaybook(pipelineId) {
  return useQuery({
    queryKey: crmQueryKeys.playbook(pipelineId),
    queryFn: () => getPlaybookByPipeline(pipelineId),
    enabled: !!pipelineId,
  });
}

/**
 * Passos do playbook por id — o que a Agenda usa pra mostrar script/cenarios
 * na hora de executar a tarefa. Recebe a lista de ids visiveis no recorte.
 *
 * A chave e ordenada e serializada: a MESMA lista de ids em ordem diferente
 * tem que bater no mesmo cache, senao rolar o calendario refaz a query a toa.
 */
export function usePlaybookSteps(ids = []) {
  const key = useMemo(
    () => [...new Set((ids || []).filter(Boolean))].sort().join(','),
    [ids],
  );
  return useQuery({
    queryKey: crmQueryKeys.playbookSteps(key),
    queryFn: () => getStepsByIds(key ? key.split(',') : []),
    enabled: !!key,
    staleTime: 5 * 60_000, // playbook muda raramente
  });
}

export function useSaveStageSteps(pipelineId) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ stageId, steps }) => saveStageSteps(stageId, steps),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: crmQueryKeys.playbook(pipelineId) });
      // O progresso dos leads muda junto: passo removido leva o progresso pelo
      // CASCADE, entao o checklist em tela ficaria marcando passo que sumiu.
      qc.invalidateQueries({ queryKey: ['crm', 'dealProgress'] });
    },
  });
}

export function useSaveStageGoal(pipelineId) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ stageId, objetivo, exitCriteria }) => saveStageGoal(stageId, { objetivo, exitCriteria }),
    onSuccess: () => {
      // O objetivo mora na etapa, entao quem invalida e a pipeline (nao o playbook).
      qc.invalidateQueries({ queryKey: crmQueryKeys.pipelines });
      qc.invalidateQueries({ queryKey: ['crm', 'pipelineDeals'] });
    },
  });
}

/** Checklist de um negocio: quais passos ele ja cumpriu. */
export function useDealProgress(dealId) {
  return useQuery({
    queryKey: crmQueryKeys.dealProgress(dealId),
    queryFn: () => getDealProgress(dealId),
    enabled: !!dealId,
  });
}

/** Agenda o processo dos leads que ja estavam parados nas etapas (backfill). */
export function useScheduleProcessForPipeline() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (pipelineId) => scheduleProcessForPipeline(pipelineId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['crm', 'pipelineDeals'] });
      qc.invalidateQueries({ queryKey: ['crm', 'dealActivities'] });
      qc.invalidateQueries({ queryKey: ['crm', 'calendarActivities'] });
      qc.invalidateQueries({ queryKey: ['agendaCrmActivities'] });
    },
  });
}

// Nao ha mais useToggleDealStep: marcar passo direto pelo checklist do lead
// era o SEGUNDO lugar de check. Agora so a Agenda conclui, e a ponte em
// completeCrmActivity grava o progresso do passo (com o que o lead respondeu).
// O servico toggleDealStep segue existindo pra uso programatico (backfill).

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
      // Os 5 toques também aparecem na agenda (comercial e de rotina), no
      // histórico do lead e na aba Atividades do negócio — sem invalidar essas
      // chaves específicas eles só surgiam depois do staleTime (simétrico com
      // useCancelCadence, que já invalida tudo isso).
      qc.invalidateQueries({ queryKey: ['crm', 'calendarActivities'] });
      qc.invalidateQueries({ queryKey: ['crm', 'leadTimeline'] });
      qc.invalidateQueries({ queryKey: ['crm', 'dealActivities'] });
      qc.invalidateQueries({ queryKey: ['agendaCrmActivities'] });
    },
  });
}

export function useCancelCadence() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: cancelCadenceForDeal,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['crm', 'pipelineDeals'] });
      qc.invalidateQueries({ queryKey: crmQueryKeys.activities });
      qc.invalidateQueries({ queryKey: crmQueryKeys.dashboard });
      qc.invalidateQueries({ queryKey: ['crm', 'calendarActivities'] });
      qc.invalidateQueries({ queryKey: ['agendaCrmActivities'] });
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
      // Trocar de etapa CANCELA a cadencia da anterior e AGENDA a da nova
      // (moveDealToStage) — a fila e a agenda mudam junto, entao precisam
      // recarregar. Sem isso a tela continua mostrando os toques cancelados.
      qc.invalidateQueries({ queryKey: ['crm', 'workQueue'] });
      qc.invalidateQueries({ queryKey: ['crm', 'calendarActivities'] });
      qc.invalidateQueries({ queryKey: ['crm', 'dealActivities'] });
      qc.invalidateQueries({ queryKey: ['crm', 'dealProgress'] });
      // A etapa mudou, entao "qual e a proxima" mudou junto. Sem isto o convite
      // de avancar continuava servindo a resposta velha por ate 1 minuto — e
      // convidava a mover o lead pra etapa em que ele acabou de entrar.
      qc.invalidateQueries({ queryKey: ['crm', 'nextStage'] });

      // Atualizar status do deal no cache do kanban. lastStageChangedAt tambem
      // precisa ser resetado aqui — sem isso, o selo de dias parado na etapa
      // (getStageHealth) continua mostrando a contagem antiga ate a proxima
      // vez que a pagina buscar os dados do zero.
      const allQueries = qc.getQueriesData({ queryKey: ['crm', 'pipelineDeals'] });
      const movedAt = new Date().toISOString();
      allQueries.forEach(([queryKey, oldData]) => {
        if (!oldData?.stages) return;
        const updatedStages = oldData.stages.map(stage => ({
          ...stage,
          deals: stage.deals?.map(d => d.id === data.id ? { ...d, status: data.status, probability: data.probability, lastStageChangedAt: movedAt } : d),
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

export function useMarkDealChurned() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: markDealAsChurned,
    onSuccess: () => toast('Cliente marcado como cancelado', 'warning'),
    onError: () => toast('Erro ao marcar cliente como cancelado', 'error'),
    onSettled: () => {
      qc.invalidateQueries({ queryKey: crmQueryKeys.deals });
      qc.invalidateQueries({ queryKey: crmQueryKeys.companies });
      qc.invalidateQueries({ queryKey: ['crm', 'company'] });
      qc.invalidateQueries({ queryKey: crmQueryKeys.dashboard });
    },
  });
}

export function useReactivateChurnedDeal() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: reactivateChurnedDeal,
    onSuccess: () => toast('Cliente reativado', 'success'),
    onError: () => toast('Erro ao reativar cliente', 'error'),
    onSettled: () => {
      qc.invalidateQueries({ queryKey: crmQueryKeys.deals });
      qc.invalidateQueries({ queryKey: crmQueryKeys.companies });
      qc.invalidateQueries({ queryKey: ['crm', 'company'] });
      qc.invalidateQueries({ queryKey: crmQueryKeys.dashboard });
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
      // A /agenda de rotina puxa a camada comercial por query própria — só o
      // create esquecia de invalidar; update/delete/complete já invalidam.
      qc.invalidateQueries({ queryKey: ['agendaCrmActivities'] });
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
      // A Agenda (/agenda) puxa as atividades do CRM por uma query propria
      // (['agendaCrmActivities', ...]) — sem isso o chip fica desatualizado.
      qc.invalidateQueries({ queryKey: ['agendaCrmActivities'] });
      // O dashboard conta reuniões/ligações agendadas por data — mover a data de
      // uma atividade tem que refletir nos contadores (simétrico com create/delete).
      qc.invalidateQueries({ queryKey: crmQueryKeys.dashboard });
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
      qc.invalidateQueries({ queryKey: ['agendaCrmActivities'] });
      toast('Atividade excluida', 'success');
    },
  });
}

export function useCompleteCrmActivity() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input, output, contacted } = {}) => completeCrmActivity(id, { input, output, contacted }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: crmQueryKeys.activities });
      qc.invalidateQueries({ queryKey: ['crm', 'dealActivities'] });
      qc.invalidateQueries({ queryKey: ['crm', 'calendarActivities'] });
      qc.invalidateQueries({ queryKey: ['crm', 'leadTimeline'] });
      qc.invalidateQueries({ queryKey: crmQueryKeys.dashboard });
      qc.invalidateQueries({ queryKey: ['agendaCrmActivities'] });
      // A atividade pode vir de um passo do processo: o checklist e o selo do
      // card mudam junto (ver a ponte em completeCrmActivity).
      qc.invalidateQueries({ queryKey: ['crm', 'dealProgress'] });
      qc.invalidateQueries({ queryKey: ['crm', 'pipelineDeals'] });
      qc.invalidateQueries({ queryKey: ['crm', 'workQueue'] });
      toast('Tarefa concluída', 'success');
    },
    onError: (err) => {
      toast(`Erro ao concluir atividade: ${err.message}`, 'error');
    },
  });
}

// ==================== CALLS / DISCADOR ====================

export function useCrmCalls(filters = {}, options = {}) {
  return useQuery({
    queryKey: [...crmQueryKeys.calls, filters],
    queryFn: () => getCrmCalls(filters),
    staleTime: 30_000,
    ...options,
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
      // Excluir a ligação também remove o espelho dela — precisa sumir da
      // timeline do lead, da aba Atividades do negócio e da agenda.
      qc.invalidateQueries({ queryKey: ['crm', 'leadTimeline'] });
      qc.invalidateQueries({ queryKey: ['crm', 'dealActivities'] });
      qc.invalidateQueries({ queryKey: ['crm', 'calendarActivities'] });
      qc.invalidateQueries({ queryKey: ['agendaCrmActivities'] });
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

// Config de workspace compartilhada (hoje so a Meta de MRR — ver
// crmWorkspaceSettingsService.js). Antes vivia so no localStorage do
// navegador; quem definisse a meta numa maquina, via mrrGoal=0 em qualquer
// outro device/usuario.
export function useCrmWorkspaceSettings() {
  return useQuery({
    queryKey: crmQueryKeys.workspaceSettings,
    queryFn: getCrmWorkspaceSettingsRemote,
    staleTime: 60_000,
  });
}

export function useUpdateCrmWorkspaceSettings() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: updateCrmWorkspaceSettingsRemote,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: crmQueryKeys.workspaceSettings });
      toast('Configuracao salva', 'success');
    },
  });
}

export function useBonificacaoProgress(startDate, endDate) {
  return useQuery({
    queryKey: crmQueryKeys.bonificacao(startDate, endDate),
    queryFn: () => getBonificacaoProgress(startDate, endDate),
    staleTime: 60_000,
  });
}

// Drill-down do funil: os deals da coorte que alcançaram uma etapa (clicar na
// etapa do funil do Comparativo pra ver os leads). Só dispara com `step` setado.
export function useFunnelStageDeals(range, scope, step) {
  return useQuery({
    queryKey: ['crm', 'funnelStageDeals', range?.start || null, range?.end || null, scope || 'sales', step || null],
    queryFn: () => getFunnelStageDeals(range, scope, step),
    enabled: !!step && !!(range?.start),
    staleTime: 30_000,
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

/**
 * Busca 1 prospect por id — ex: cabecalho do Inbox pra resolver nome/telefone
 * de uma conversa nova que ainda nao tem historico de mensagem.
 */
export function useCrmProspect(id) {
  return useQuery({
    queryKey: crmQueryKeys.prospect(id),
    queryFn: () => getCrmProspectById(id),
    enabled: !!id,
    staleTime: 30_000,
  });
}

export function useUpdateCrmProspect() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, updates }) => updateCrmProspect(id, updates),
    onSuccess: (updated) => {
      // update() resolve null quando a validacao reprova (o service ja avisou);
      // nada foi gravado, entao nao pode dizer que atualizou.
      if (!updated) return;
      qc.invalidateQueries({ queryKey: crmQueryKeys.prospects });
      toast('Prospect atualizado', 'success');
    },
    onError: (err) => toast(`Erro ao atualizar prospect: ${err?.message || err}`, 'error'),
  });
}

export function useDeleteCrmProspect() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: softDeleteCrmProspect,
    onSuccess: (ok) => {
      // softDeleteCrmProspect devolve false (e ja mostrou o toast de erro) em vez
      // de lancar — sem esse guard sairia um "excluido" verde junto com o erro.
      if (!ok) return;
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

export function useEnsureGeneralPipeline() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ensureGeneralPipeline,
    onSuccess: (result) => {
      qc.invalidateQueries({ queryKey: crmQueryKeys.pipelines });
      toast(result?.created ? 'Pipeline "Geral" criada' : 'Pipeline "Geral" ja existe', result?.created ? 'success' : 'info');
    },
  });
}

export function useConsolidateIntoGeneral() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: consolidateSalesPipelinesIntoGeneral,
    onSuccess: (res) => {
      // Mexeu em deals + pipelines — invalida o CRM inteiro.
      qc.invalidateQueries({ queryKey: ['crm'] });
      const parts = [];
      if (res?.moved > 0) parts.push(`${res.moved} lead${res.moved !== 1 ? 's' : ''} na Geral`);
      if (res?.deleted?.length) parts.push(`${res.deleted.length} pipeline${res.deleted.length !== 1 ? 's' : ''} antiga${res.deleted.length !== 1 ? 's' : ''} removida${res.deleted.length !== 1 ? 's' : ''}`);
      if (parts.length) toast(parts.join(' · '), 'success');
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
    // EGRESS: refetchOnWindowFocus:true aqui re-baixava crm_messages inteiro + joins
    // a cada foco de aba (anulava o fix global). Realtime + staleTime mantêm fresco.
    staleTime: 30_000,
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
