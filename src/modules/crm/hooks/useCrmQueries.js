import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from '../../../contexts/ToastContext';

// Services
import { getCrmCompanies, getCrmCompanyById, createCrmCompany, updateCrmCompany, softDeleteCrmCompany } from '../services/crmCompaniesService';
import { getCrmContacts, getCrmContactById, createCrmContact, updateCrmContact, softDeleteCrmContact, importContactsCSV } from '../services/crmContactsService';
import { getCrmPipelines, getCrmPipelineWithDeals, createCrmPipeline, updateCrmPipeline, deleteCrmPipeline, reorderCrmStages, addCrmStage, deleteCrmStage } from '../services/crmPipelinesService';
import { getCrmDeals, getDealsByPipeline, getCrmDealById, createCrmDeal, updateCrmDeal, softDeleteCrmDeal, moveDealToStage, markDealAsWon, markDealAsLost } from '../services/crmDealsService';
import { getCrmActivities, getActivitiesForCalendar, createCrmActivity, updateCrmActivity, softDeleteCrmActivity, completeCrmActivity } from '../services/crmActivitiesService';
import { getCrmProposals, getCrmProposalById, createCrmProposal, updateCrmProposal, softDeleteCrmProposal, updateCrmProposalStatus } from '../services/crmProposalsService';
import { getCrmDashboardKPIs } from '../services/crmDashboardService';
import { getSalesReport, getFunnelReport, getForecastReport, getActivitiesReport } from '../services/crmReportsService';

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
  dashboard: ['crm', 'dashboard'],
  salesReport: (start, end) => ['crm', 'salesReport', start, end],
  funnelReport: (id) => ['crm', 'funnelReport', id],
  forecastReport: ['crm', 'forecastReport'],
  activitiesReport: (start, end) => ['crm', 'activitiesReport', start, end],
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
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: crmQueryKeys.deals });
      qc.invalidateQueries({ queryKey: ['crm', 'pipelineDeals'] });
      qc.invalidateQueries({ queryKey: ['crm', 'dealsByPipeline'] });
    },
  });
}

export function useMarkDealWon() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: markDealAsWon,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: crmQueryKeys.deals });
      qc.invalidateQueries({ queryKey: crmQueryKeys.dashboard });
      qc.invalidateQueries({ queryKey: ['crm', 'pipelineDeals'] });
      toast('Negocio marcado como ganho!', 'success');
    },
  });
}

export function useMarkDealLost() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ dealId, reason }) => markDealAsLost(dealId, reason),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: crmQueryKeys.deals });
      qc.invalidateQueries({ queryKey: crmQueryKeys.dashboard });
      qc.invalidateQueries({ queryKey: ['crm', 'pipelineDeals'] });
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

// ==================== DASHBOARD ====================

export function useCrmDashboardKPIs() {
  return useQuery({
    queryKey: crmQueryKeys.dashboard,
    queryFn: getCrmDashboardKPIs,
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

export function useActivitiesReport(startDate, endDate) {
  return useQuery({
    queryKey: crmQueryKeys.activitiesReport(startDate, endDate),
    queryFn: () => getActivitiesReport(startDate, endDate),
    enabled: !!startDate && !!endDate,
    staleTime: 120_000,
  });
}
