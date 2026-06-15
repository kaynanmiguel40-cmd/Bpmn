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

  // Deals — atualiza Kanban, Dashboard e a timeline do lead na Agenda
  useRealtimeSubscription(
    'crm_deals',
    [
      crmQueryKeys.deals,
      crmQueryKeys.dashboard,
      ['crm', 'pipelineDeals'],
      ['crm', 'leadTimeline'],
    ],
    {
      enabled,
      onInsert: onDealChange,
      onUpdate: onDealChange,
      onDelete: onDealChange,
    }
  );

  // Activities — atualiza lista, Dashboard, calendario da Agenda e timeline
  useRealtimeSubscription(
    'crm_activities',
    [
      crmQueryKeys.activities,
      crmQueryKeys.dashboard,
      ['crm', 'calendarActivities'],
      ['crm', 'leadTimeline'],
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

  // Calls — atualiza discador, historico, dashboard e timeline do lead
  useRealtimeSubscription(
    'crm_calls',
    [crmQueryKeys.calls, ['crm', 'dialerQueue'], ['crm', 'recentCalls'], crmQueryKeys.dialerKPIs, crmQueryKeys.dashboard, ['crm', 'leadTimeline']],
    { enabled }
  );

  // Messages — atualiza inbox WhatsApp, conversa aberta e timeline do lead
  useRealtimeSubscription(
    'crm_messages',
    [['crm', 'conversation'], ['crm', 'inbox'], ['crm', 'leadTimeline']],
    { enabled }
  );

  // WhatsApp instances — atualiza status/QR de conexão
  useRealtimeSubscription(
    'crm_whatsapp_instances',
    [crmQueryKeys.whatsappInstances, ['crm', 'whatsappInstance']],
    { enabled }
  );
}
