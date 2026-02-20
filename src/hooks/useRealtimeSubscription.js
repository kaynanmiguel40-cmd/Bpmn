import { useEffect, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import { showLocalNotification, playChatSound } from '../lib/pushNotifications';

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
 * Hook para Realtime em content_posts (Calendario de Postagens).
 */
export function useRealtimeContentPosts(enabled = true) {
  useRealtimeSubscription('content_posts', ['contentPosts'], { enabled });
}

/**
 * Hook para Realtime em notifications.
 * Filtra por user_id para so receber notificacoes do usuario logado.
 */
export function useRealtimeNotifications(enabled = true) {
  const queryClient = useQueryClient();
  const [userId, setUserId] = useState(null);

  // Pegar user_id da sessao atual
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUserId(session?.user?.id || null);
    });
  }, []);

  useEffect(() => {
    if (!enabled || !userId) return;

    const channel = supabase
      .channel(`realtime-notifications-${userId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          queryClient.invalidateQueries({ queryKey: ['notifications'] });
          queryClient.invalidateQueries({ queryKey: ['unreadCount'] });

          if (payload.eventType === 'INSERT' && payload.new?.title) {
            showLocalNotification({
              title: payload.new.title,
              body: payload.new.message || '',
              type: payload.new.type || 'info',
              entityType: payload.new.entity_type,
              entityId: payload.new.entity_id,
              tag: `fyness-rt-${payload.new.id}`,
            });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [enabled, userId, queryClient]);
}

/**
 * Hook para Realtime em team_members.
 */
export function useRealtimeTeamMembers(enabled = true) {
  useRealtimeSubscription('team_members', ['teamMembers'], { enabled });
}

/**
 * Hook global que toca som de "pop" quando chega mensagem de chat de outro usuario.
 * Roda no MainLayout para funcionar em qualquer pagina.
 */
export function useRealtimeChatSound(enabled = true) {
  const [userId, setUserId] = useState(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUserId(session?.user?.id || null);
    });
  }, []);

  useEffect(() => {
    if (!enabled || !userId) return;

    const channel = supabase
      .channel('realtime-chat-sound')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'os_comments' },
        (payload) => {
          // So tocar som se a mensagem e de outro usuario
          if (payload.new?.user_id && payload.new.user_id !== userId) {
            playChatSound();
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [enabled, userId]);
}

/**
 * Hook para Realtime nos comentarios/chat de uma OS especifica.
 * Filtra por order_id para so receber eventos da OS sendo visualizada.
 */
export function useRealtimeComments(orderId, enabled = true) {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!enabled || !orderId) return;

    const channel = supabase
      .channel(`realtime-os_comments-${orderId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'os_comments',
          filter: `order_id=eq.${orderId}`,
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ['osComments', orderId] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [orderId, enabled, queryClient]);
}
