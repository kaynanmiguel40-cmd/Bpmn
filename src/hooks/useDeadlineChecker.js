/**
 * useDeadlineChecker - Verifica periodicamente OS com prazo proximo ou atrasado.
 * Roda a cada 5 minutos no MainLayout.
 * Usa localStorage para evitar notificacoes duplicadas no mesmo dia.
 */

import { useEffect, useRef, useState } from 'react';
import { useOSOrders, useTeamMembers } from './queries';
import { checkAndNotifyDeadlines } from '../lib/notificationTriggers';
import { supabase } from '../lib/supabase';

const CHECK_INTERVAL = 5 * 60 * 1000; // 5 minutos
const MIN_INTERVAL = 4 * 60 * 1000;   // debounce minimo

export function useDeadlineChecker() {
  const { data: orders } = useOSOrders();
  const { data: teamMembers } = useTeamMembers();
  const lastCheck = useRef(0);
  const [currentUserId, setCurrentUserId] = useState(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setCurrentUserId(session?.user?.id || null);
    });
  }, []);

  useEffect(() => {
    if (!orders?.length || !teamMembers?.length || !currentUserId) return;

    const check = () => {
      const now = Date.now();
      if (now - lastCheck.current < MIN_INTERVAL) return;
      lastCheck.current = now;
      // Passa currentUserId para que cada browser so notifique o proprio usuario
      checkAndNotifyDeadlines(orders, teamMembers, currentUserId);
    };

    // Checar apos 10s (dar tempo pro app carregar)
    const initialTimer = setTimeout(check, 10_000);
    const interval = setInterval(check, CHECK_INTERVAL);

    return () => {
      clearTimeout(initialTimer);
      clearInterval(interval);
    };
  }, [orders, teamMembers, currentUserId]);
}
