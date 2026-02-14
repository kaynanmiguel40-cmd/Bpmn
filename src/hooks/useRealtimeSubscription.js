import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import { showLocalNotification } from '../lib/pushNotifications';

/**
 * Hook generico para Supabase Realtime.
 * Assina mudancas em uma tabela e invalida React Query automaticamente.
 *
 * @param {string} table - Nome da tabela no Supabase
 * @param {string[]} queryKeys - Array de query keys para invalidar
 * @param {object} options - Opcoes adicionais
 * @param {boolean} options.enabled - Se deve ativar a subscription (default: true)
 * @param {function} options.onInsert - Callback opcional para INSERT
 * @param {function} options.onUpdate - Callback opcional para UPDATE
 * @param {function} options.onDelete - Callback opcional para DELETE
 */
export function useRealtimeSubscription(table, queryKeys, options = {}) {
  const queryClient = useQueryClient();
  const { enabled = true, onInsert, onUpdate, onDelete } = options;

  useEffect(() => {
    if (!enabled) return;

    const channel = supabase
      .channel(`realtime-${table}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table },
        (payload) => {
          // Invalidar queries relevantes para forcar refetch
          queryKeys.forEach((key) => {
            queryClient.invalidateQueries({ queryKey: Array.isArray(key) ? key : [key] });
          });

          // Callbacks opcionais por tipo de evento
          if (payload.eventType === 'INSERT' && onInsert) {
            onInsert(payload.new);
          } else if (payload.eventType === 'UPDATE' && onUpdate) {
            onUpdate(payload.new, payload.old);
          } else if (payload.eventType === 'DELETE' && onDelete) {
            onDelete(payload.old);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [table, enabled, queryClient]);
}

/**
 * Hook para Realtime em os_orders (Kanban).
 */
export function useRealtimeOSOrders(enabled = true) {
  useRealtimeSubscription('os_orders', ['osOrders'], { enabled });
}

/**
 * Hook para Realtime em agenda_events.
 */
export function useRealtimeAgendaEvents(enabled = true) {
  useRealtimeSubscription('agenda_events', ['agendaEvents'], { enabled });
}

/**
 * Hook para Realtime em notifications.
 */
export function useRealtimeNotifications(enabled = true) {
  useRealtimeSubscription('notifications', ['notifications', 'unreadCount'], {
    enabled,
    onInsert: (row) => {
      // Push nativa quando chega notificacao via Realtime (outro usuario enviou)
      if (row && row.title) {
        showLocalNotification({
          title: row.title,
          body: row.message || '',
          type: row.type || 'info',
          entityType: row.entity_type,
          entityId: row.entity_id,
          tag: `fyness-rt-${row.id}`,
        });
      }
    },
  });
}

/**
 * Hook para Realtime em team_members.
 */
export function useRealtimeTeamMembers(enabled = true) {
  useRealtimeSubscription('team_members', ['teamMembers'], { enabled });
}
