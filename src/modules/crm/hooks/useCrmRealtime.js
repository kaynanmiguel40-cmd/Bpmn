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

  // Calls — atualiza discador, historico e dashboard
  useRealtimeSubscription(
    'crm_calls',
    [crmQueryKeys.calls, ['crm', 'dialerQueue'], ['crm', 'recentCalls'], crmQueryKeys.dialerKPIs, crmQueryKeys.dashboard],
    { enabled }
  );

  // Messages — atualiza inbox WhatsApp e conversa aberta
  useRealtimeSubscription(
    'crm_messages',
    [['crm', 'conversation'], ['crm', 'inbox']],
    { enabled }
  );

  // WhatsApp instances — atualiza status/QR de conexão
  useRealtimeSubscription(
    'crm_whatsapp_instances',
    [crmQueryKeys.whatsappInstances, ['crm', 'whatsappInstance']],
    { enabled }
  );
}
