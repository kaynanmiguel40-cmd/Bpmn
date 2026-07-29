import { useRealtimeSubscription } from '../../../hooks/useRealtimeSubscription';
import { showLocalNotification, playChatSound } from '../../../lib/pushNotifications';
import { crmQueryKeys } from './useCrmQueries';

// Notifica (som + push nativo) quando chega mensagem INBOUND no inbox WhatsApp.
// Mensagens outbound (enviadas por nós) são ignoradas.
function notifyInboundWhatsApp(msg) {
  if (!msg || msg.direction !== 'inbound') return;
  let body = (msg.content || '').trim();
  if (!body && msg.media_type) body = `[${msg.media_type}]`;
  if (!body) body = 'Nova mensagem recebida';
  if (body.length > 120) body = body.slice(0, 120) + '…';
  playChatSound();
  showLocalNotification({
    title: '💬 Nova mensagem no WhatsApp',
    body,
    type: 'info',
    entityType: 'crm_message',
    entityId: msg.id,
    tag: 'crm-inbox-message',
  });
}

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

  // Janela de coalescência maior (10s) para as tabelas que invalidam o `dashboard`
  // (agregado caro). Mudança de OUTRO usuário aparece em até 10s — imperceptível
  // pra Kanban/lista colaborativa; a SUA própria ação já invalida na hora via o
  // onSuccess da mutation, não depende do realtime. Sem isso, 5 subscriptions
  // refetchavam o dashboard cada uma no seu timer de 4s (pior caso: 5 refetches
  // pesados por janela sob rajada de deals/tarefas).
  const DASHBOARD_COALESCE = 10_000;

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
      coalesceMs: DASHBOARD_COALESCE,
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
      coalesceMs: DASHBOARD_COALESCE,
      onInsert: onActivityChange,
      onUpdate: onActivityChange,
    }
  );

  // Contacts — atualiza lista
  useRealtimeSubscription(
    'crm_contacts',
    [crmQueryKeys.contacts, crmQueryKeys.dashboard],
    { enabled, coalesceMs: DASHBOARD_COALESCE }
  );

  // Companies — atualiza lista
  useRealtimeSubscription(
    'crm_companies',
    [crmQueryKeys.companies, crmQueryKeys.dashboard],
    { enabled, coalesceMs: DASHBOARD_COALESCE }
  );

  // Calls — atualiza discador, historico, dashboard e timeline do lead
  useRealtimeSubscription(
    'crm_calls',
    [crmQueryKeys.calls, ['crm', 'dialerQueue'], ['crm', 'recentCalls'], crmQueryKeys.dialerKPIs, crmQueryKeys.dashboard, ['crm', 'leadTimeline']],
    { enabled, coalesceMs: DASHBOARD_COALESCE }
  );

  // Messages — atualiza inbox WhatsApp, conversa aberta e timeline do lead.
  // onInsert dispara notificação (som + push nativo) em mensagem inbound.
  useRealtimeSubscription(
    'crm_messages',
    [['crm', 'conversation'], ['crm', 'inbox'], ['crm', 'leadTimeline']],
    { enabled, onInsert: notifyInboundWhatsApp }
  );

  // WhatsApp instances — atualiza status/QR de conexão
  useRealtimeSubscription(
    'crm_whatsapp_instances',
    [crmQueryKeys.whatsappInstances, ['crm', 'whatsappInstance']],
    { enabled }
  );
}
