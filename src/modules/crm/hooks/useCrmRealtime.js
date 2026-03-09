import { useRealtimeSubscription } from '../../../hooks/useRealtimeSubscription';
import { crmQueryKeys } from './useCrmQueries';

/**
 * Hook que cria subscriptions Supabase Realtime para tabelas CRM.
 * Invalida React Query automaticamente ao receber mudancas.
 *
 * Segue o padrao de useRealtimeOSOrders, useRealtimeAgendaEvents, etc.
 *
 * @param {object} options
 * @param {boolean} options.enabled - Se deve ativar (default: true)
 * @param {function} options.onDealChange - Callback quando deal muda
 * @param {function} options.onActivityChange - Callback quando atividade muda
 */
export function useCrmRealtime(options = {}) {
  const { enabled = true, onDealChange, onActivityChange } = options;

  // Deals — atualiza Kanban e Dashboard
  useRealtimeSubscription(
    'crm_deals',
    [
      crmQueryKeys.deals,
      crmQueryKeys.dashboard,
      ['crm', 'pipelineDeals'],
      ['crm', 'dealsByPipeline'],
    ],
    {
      enabled,
      onInsert: onDealChange,
      onUpdate: onDealChange,
      onDelete: onDealChange,
    }
  );

  // Activities — atualiza lista e Dashboard
  useRealtimeSubscription(
    'crm_activities',
    [
      crmQueryKeys.activities,
      crmQueryKeys.dashboard,
    ],
    {
      enabled,
      onInsert: onActivityChange,
      onUpdate: onActivityChange,
    }
  );

  // Contacts — atualiza lista
  useRealtimeSubscription(
    'crm_contacts',
    [crmQueryKeys.contacts, crmQueryKeys.dashboard],
    { enabled }
  );

  // Companies — atualiza lista
  useRealtimeSubscription(
    'crm_companies',
    [crmQueryKeys.companies, crmQueryKeys.dashboard],
    { enabled }
  );

  // Proposals — atualiza lista
  useRealtimeSubscription(
    'crm_proposals',
    [crmQueryKeys.proposals],
    { enabled }
  );
}

/**
 * Hook para Realtime especifico de um pipeline (Kanban view).
 * Refina invalidacao para o pipeline sendo visualizado.
 */
export function useCrmRealtimePipeline(pipelineId, enabled = true) {
  useRealtimeSubscription(
    'crm_deals',
    [
      crmQueryKeys.deals,
      crmQueryKeys.pipelineDeals(pipelineId),
      crmQueryKeys.dealsByPipeline(pipelineId),
      crmQueryKeys.dashboard,
    ],
    { enabled: enabled && !!pipelineId }
  );
}
