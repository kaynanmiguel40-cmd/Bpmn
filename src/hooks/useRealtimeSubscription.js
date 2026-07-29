import { useEffect, useState, useRef } from 'react';
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
  // coalesceMs: janela de silêncio da invalidação. 4s serve pro chat (precisa ser
  // responsivo); tabelas que invalidam agregados pesados (dashboard) passam um
  // valor maior pra não refetchar o agregado a cada rajada de evento.
  const { enabled = true, onInsert, onUpdate, onDelete, coalesceMs = 4000 } = options;

  // Refs para manter callbacks e queryKeys sempre atualizados sem recriar o canal
  const queryKeysRef = useRef(queryKeys);
  const onInsertRef = useRef(onInsert);
  const onUpdateRef = useRef(onUpdate);
  const onDeleteRef = useRef(onDelete);

  useEffect(() => {
    queryKeysRef.current = queryKeys;
    onInsertRef.current = onInsert;
    onUpdateRef.current = onUpdate;
    onDeleteRef.current = onDelete;
  });

  useEffect(() => {
    if (!enabled) return;

    const invalidateNow = () => {
      (queryKeysRef.current || []).forEach((key) => {
        queryClient.invalidateQueries({ queryKey: Array.isArray(key) ? key : [key] });
      });
    };

    // EGRESS: cada escrita disparava um refetch da query inteira em TODOS os
    // clientes. Numa rajada (cronômetro, edições seguidas) isso re-baixava a
    // tabela dezenas de vezes. Throttle: no máximo 1 invalidação a cada `coalesceMs`.
    //
    // A janela tem BORDA DE SUBIDA: o primeiro evento invalida na hora e só então
    // abre o período de silêncio. Antes todo evento esperava a janela, o que
    // atrasava CADA mensagem que chegava no inbox — e a rajada continua custando
    // uma invalidação só, então a economia de egress fica igual.
    let cooldown = null;
    let pendente = false;

    const scheduleInvalidate = () => {
      if (cooldown) { pendente = true; return; }  // dentro da janela: agrega
      invalidateNow();
      cooldown = setTimeout(function fim() {
        // Houve evento durante o silêncio? Pega o estado final e reabre a janela.
        if (pendente) {
          pendente = false;
          invalidateNow();
          cooldown = setTimeout(fim, coalesceMs);
        } else {
          cooldown = null;
        }
      }, coalesceMs);
    };

    // Reconciliação na reconexão. `postgres_changes` NÃO faz replay do que
    // aconteceu enquanto o socket esteve fora do ar: sem isto, toda mensagem que
    // chegasse durante uma queda de wifi / suspensão do notebook / deploy ficava
    // invisível até um reload manual — o inbox parecia ter "perdido" a mensagem
    // que estava no banco o tempo todo.
    let esteveFora = false;

    const channel = supabase
      .channel(`realtime-${table}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table },
        (payload) => {
          scheduleInvalidate();

          // Callbacks opcionais por tipo de evento (imediatos — ex.: notificações)
          if (payload.eventType === 'INSERT' && onInsertRef.current) {
            onInsertRef.current(payload.new);
          } else if (payload.eventType === 'UPDATE' && onUpdateRef.current) {
            onUpdateRef.current(payload.new, payload.old);
          } else if (payload.eventType === 'DELETE' && onDeleteRef.current) {
            onDeleteRef.current(payload.old);
          }
        }
      )
      .subscribe((status) => {
        if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT' || status === 'CLOSED') {
          esteveFora = true;
          return;
        }
        if (status === 'SUBSCRIBED' && esteveFora) {
          esteveFora = false;
          invalidateNow();  // busca o que chegou durante a queda
        }
      });

    return () => {
      // Descarregar a invalidação pendente em vez de descartá-la: sair da tela
      // dentro dos 4s da janela jogava fora o único efeito do evento (o payload
      // nunca é escrito no cache, só invalida), e a mensagem só reaparecia no
      // próximo refetch por outro motivo.
      if (cooldown) clearTimeout(cooldown);
      if (pendente) invalidateNow();
      supabase.removeChannel(channel);
    };
  }, [table, enabled, queryClient, coalesceMs]);
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

    // EGRESS: cada notificação invalidava ['notifications'] + ['unreadCount'] na hora.
    // Numa rajada (várias notif. seguidas) isso re-baixava as listas N vezes.
    // Throttle: no máximo 1 invalidação a cada 4s. O push (showLocalNotification)
    // continua imediato — só o refetch das listas é coalescido.
    let throttle = null;
    const scheduleInvalidate = () => {
      if (throttle) return;
      throttle = setTimeout(() => {
        throttle = null;
        queryClient.invalidateQueries({ queryKey: ['notifications'] });
        queryClient.invalidateQueries({ queryKey: ['unreadCount'] });
      }, 4000);
    };

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
          scheduleInvalidate();

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
      if (throttle) clearTimeout(throttle);
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
  const queryClient = useQueryClient();
  // Acumula mensagens recentes para consolidar push
  const pendingRef = useRef({ count: 0, lastSender: '', timer: null });
  const lastChatSoundRef = useRef(0);

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
          // So notificar se a mensagem e de outro usuario
          if (payload.new?.user_id && payload.new.user_id !== userId) {
            // Acumular e consolidar push (debounce de 2s)
            const p = pendingRef.current;
            p.count++;
            p.lastSender = payload.new.user_name || 'Alguem';
            p.lastContent = payload.new.content || '';

            if (p.timer) clearTimeout(p.timer);
            p.timer = setTimeout(() => {
              const { count, lastSender, lastContent } = p;
              const preview = lastContent.length > 80 ? lastContent.slice(0, 80) + '...' : lastContent;

              if (count === 1) {
                showLocalNotification({
                  title: `${lastSender} enviou uma mensagem`,
                  body: preview || 'Nova mensagem no chat',
                  type: 'info',
                  tag: 'chat-unread',
                });
              } else {
                showLocalNotification({
                  title: `${count} novas mensagens`,
                  body: `Ultima de ${lastSender}: ${preview || 'Nova mensagem'}`,
                  type: 'info',
                  tag: 'chat-unread',
                });
              }

              p.count = 0;
              p.lastSender = '';
              p.lastContent = '';
              p.timer = null;
            }, 2000);

            // Atualizar badge do FloatingChatButton
            queryClient.invalidateQueries({ queryKey: ['chatSummaries'] });
          }
        }
      )
      .subscribe();

    return () => {
      if (pendingRef.current.timer) clearTimeout(pendingRef.current.timer);
      supabase.removeChannel(channel);
    };
  }, [enabled, userId, queryClient]);
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
