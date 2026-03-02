import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from '../../../contexts/ToastContext';

// Services
import { getCrmCompanies, getCrmCompanyById, createCrmCompany, updateCrmCompany, softDeleteCrmCompany } from '../services/crmCompaniesService';
import { getCrmContacts, getCrmContactById, createCrmContact, updateCrmContact, softDeleteCrmContact, importContactsCSV } from '../services/crmContactsService';
import { getCrmPipelines, getCrmPipelineWithDeals, createCrmPipeline, updateCrmPipeline, deleteCrmPipeline, reorderCrmStages, addCrmStage, deleteCrmStage } from '../services/crmPipelinesService';
import { getCrmDeals, getDealsByPipeline, getCrmDealById, createCrmDeal, updateCrmDeal, softDeleteCrmDeal, moveDealToStage, markDealAsWon, markDealAsLost } from '../services/crmDealsService';
import { getCrmActivities, getActivitiesForCalendar, createCrmActivity, updateCrmActivity, softDeleteCrmActivity, completeCrmActivity } from '../services/crmActivitiesService';
import { getCrmProposals, getCrmProposalById, createCrmProposal, updateCrmProposal, softDeleteCrmProposal, updateCrmProposalStatus } from '../services/crmProposalsService';
import { getCrmDashboardKPIs, getSalesRanking } from '../services/crmDashboardService';
import { getTrafficEntries, getTrafficKPIs, getTrafficByChannel, getTrafficOverTime, createTrafficEntry, updateTrafficEntry, softDeleteTrafficEntry } from '../services/crmTrafficService';
import { getCrmGoals, getCrmGoalById, createCrmGoal, updateCrmGoal, softDeleteCrmGoal, getGoalsProgress } from '../services/crmGoalsService';
import { getSalesReport, getFunnelReport, getForecastReport, getActivitiesReport, getLearnedProbabilities } from '../services/crmReportsService';

// ==================== QUERY KEYS ====================

export const crmQueryKeys = {
  companies: ['crm', 'companies'],
  company: (id) => ['crm', 'company', id],
  contacts: ['crm', 'contacts'],
  contact: (id) => ['crm', 'contact', id],
  pipelines: ['crm', 'pipelines'],
  pipelineDeals: (id) => ['crm', 'pipelineDeals', id],
  deals: ['crm', 'deals'],
  dealsByPipeline: (id) => ['crm', 'dealsByPipeline', id],
  deal: (id) => ['crm', 'deal', id],
  activities: ['crm', 'activities'],
  calendarActivities: (start, end) => ['crm', 'calendarActivities', start, end],
  proposals: ['crm', 'proposals'],
  proposal: (id) => ['crm', 'proposal', id],
  goals: ['crm', 'goals'],
  goal: (id) => ['crm', 'goal', id],
  goalsProgress: ['crm', 'goalsProgress'],
  dashboard: ['crm', 'dashboard'],
  salesRanking: (start, end) => ['crm', 'salesRanking', start, end],
  salesReport: (start, end) => ['crm', 'salesReport', start, end],
  funnelReport: (id) => ['crm', 'funnelReport', id],
  forecastReport: ['crm', 'forecastReport'],
  learnedProbabilities: (pipelineId) => ['crm', 'learnedProbabilities', pipelineId || 'all'],
  activitiesReport: (start, end) => ['crm', 'activitiesReport', start, end],
  traffic: ['crm', 'traffic'],
  trafficKPIs: ['crm', 'trafficKPIs'],
  trafficByChannel: ['crm', 'trafficByChannel'],
  trafficOverTime: ['crm', 'trafficOverTime'],
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
      toast('Pipeline criado com sucesso', 'success');
    },
  });
}

export function useUpdateCrmPipeline() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, updates }) => updateCrmPipeline(id, updates),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: crmQueryKeys.pipelines });
    },
  });
}

export function useDeleteCrmPipeline() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: deleteCrmPipeline,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: crmQueryKeys.pipelines });
      toast('Pipeline excluido', 'success');
    },
  });
}

export function useReorderCrmStages() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: reorderCrmStages,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: crmQueryKeys.pipelines });
    },
  });
}

export function useAddCrmStage() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ pipelineId, stageData }) => addCrmStage(pipelineId, stageData),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: crmQueryKeys.pipelines });
      toast('Etapa adicionada', 'success');
    },
  });
}

export function useDeleteCrmStage() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: deleteCrmStage,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: crmQueryKeys.pipelines });
      toast('Etapa removida', 'success');
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

export function useCrmDealsByPipeline(pipelineId) {
  return useQuery({
    queryKey: crmQueryKeys.dealsByPipeline(pipelineId),
    queryFn: () => getDealsByPipeline(pipelineId),
    enabled: !!pipelineId,
    staleTime: 15_000,
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
      qc.invalidateQueries({ queryKey: ['crm', 'dealsByPipeline'] });
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
  });
}

export function useMoveCrmDeal() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ dealId, stageId }) => moveDealToStage(dealId, stageId),
    onMutate: async ({ dealId, stageId }) => {
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
              return {
                ...stage,
                deals: [...(stage.deals || []), movedDeal],
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
    onSuccess: () => {
      // Sucesso: so invalida queries secundarias (nao o kanban — optimistic ja esta certo)
      qc.invalidateQueries({ queryKey: crmQueryKeys.deals });
      qc.invalidateQueries({ queryKey: ['crm', 'dealsByPipeline'] });
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

export function useMarkDealWon() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: markDealAsWon,
    onMutate: async (dealId) => {
      await qc.cancelQueries({ queryKey: ['crm', 'pipelineDeals'] });
      removeDealFromPipelineCache(qc, dealId);
    },
    onSettled: () => {
      qc.invalidateQueries({ queryKey: crmQueryKeys.deals });
      qc.invalidateQueries({ queryKey: crmQueryKeys.dashboard });
      qc.invalidateQueries({ queryKey: ['crm', 'pipelineDeals'] });
      qc.invalidateQueries({ queryKey: ['crm', 'learnedProbabilities'] });
      toast('Negocio marcado como ganho!', 'success');
    },
  });
}

export function useMarkDealLost() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ dealId, reason }) => markDealAsLost(dealId, reason),
    onMutate: async ({ dealId }) => {
      await qc.cancelQueries({ queryKey: ['crm', 'pipelineDeals'] });
      removeDealFromPipelineCache(qc, dealId);
    },
    onSettled: () => {
      qc.invalidateQueries({ queryKey: crmQueryKeys.deals });
      qc.invalidateQueries({ queryKey: crmQueryKeys.dashboard });
      qc.invalidateQueries({ queryKey: ['crm', 'pipelineDeals'] });
      qc.invalidateQueries({ queryKey: ['crm', 'learnedProbabilities'] });
      toast('Negocio marcado como perdido', 'warning');
    },
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

export function useCrmCalendarActivities(startDate, endDate) {
  return useQuery({
    queryKey: crmQueryKeys.calendarActivities(startDate, endDate),
    queryFn: () => getActivitiesForCalendar(startDate, endDate),
    enabled: !!startDate && !!endDate,
    staleTime: 30_000,
  });
}

export function useCreateCrmActivity() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: createCrmActivity,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: crmQueryKeys.activities });
      qc.invalidateQueries({ queryKey: crmQueryKeys.dashboard });
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
    },
  });
}

export function useDeleteCrmActivity() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: softDeleteCrmActivity,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: crmQueryKeys.activities });
      qc.invalidateQueries({ queryKey: crmQueryKeys.dashboard });
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
      qc.invalidateQueries({ queryKey: crmQueryKeys.dashboard });
      toast('Atividade concluida', 'success');
    },
  });
}

// ==================== PROPOSALS ====================

export function useCrmProposals(filters = {}) {
  return useQuery({
    queryKey: [...crmQueryKeys.proposals, filters],
    queryFn: () => getCrmProposals(filters),
    staleTime: 30_000,
  });
}

export function useCrmProposal(id) {
  return useQuery({
    queryKey: crmQueryKeys.proposal(id),
    queryFn: () => getCrmProposalById(id),
    enabled: !!id,
    staleTime: 30_000,
  });
}

export function useCreateCrmProposal() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: createCrmProposal,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: crmQueryKeys.proposals });
      toast('Proposta criada com sucesso', 'success');
    },
  });
}

export function useUpdateCrmProposal() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, updates }) => updateCrmProposal(id, updates),
    onSuccess: (_, { id }) => {
      qc.invalidateQueries({ queryKey: crmQueryKeys.proposals });
      qc.invalidateQueries({ queryKey: crmQueryKeys.proposal(id) });
      toast('Proposta atualizada', 'success');
    },
  });
}

export function useDeleteCrmProposal() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: softDeleteCrmProposal,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: crmQueryKeys.proposals });
      toast('Proposta excluida', 'success');
    },
  });
}

export function useUpdateCrmProposalStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }) => updateCrmProposalStatus(id, status),
    onSuccess: (_, { id }) => {
      qc.invalidateQueries({ queryKey: crmQueryKeys.proposals });
      qc.invalidateQueries({ queryKey: crmQueryKeys.proposal(id) });
      toast('Status da proposta atualizado', 'success');
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

export function useCrmGoal(id) {
  return useQuery({
    queryKey: crmQueryKeys.goal(id),
    queryFn: () => getCrmGoalById(id),
    enabled: !!id,
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
    onSuccess: (_, { id }) => {
      qc.invalidateQueries({ queryKey: crmQueryKeys.goals });
      qc.invalidateQueries({ queryKey: crmQueryKeys.goal(id) });
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

export function useCrmDashboardKPIs() {
  return useQuery({
    queryKey: crmQueryKeys.dashboard,
    queryFn: getCrmDashboardKPIs,
    staleTime: 60_000,
  });
}

export function useSalesRanking(startDate, endDate) {
  return useQuery({
    queryKey: crmQueryKeys.salesRanking(startDate, endDate),
    queryFn: () => getSalesRanking(startDate, endDate),
    enabled: !!startDate && !!endDate,
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

export function useActivitiesReport(startDate, endDate) {
  return useQuery({
    queryKey: crmQueryKeys.activitiesReport(startDate, endDate),
    queryFn: () => getActivitiesReport(startDate, endDate),
    enabled: !!startDate && !!endDate,
    staleTime: 120_000,
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
