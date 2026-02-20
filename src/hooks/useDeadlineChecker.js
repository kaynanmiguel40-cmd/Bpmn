/**
 * useDeadlineChecker - Verifica periodicamente OS com prazo proximo ou atrasado.
 * Roda a cada 5 minutos no MainLayout.
 * Usa localStorage para evitar notificacoes duplicadas no mesmo dia.
 */

import { useEffect, useRef } from 'react';
import { useOSOrders, useTeamMembers } from './queries';
import { checkAndNotifyDeadlines } from '../lib/notificationTriggers';

const CHECK_INTERVAL = 5 * 60 * 1000; // 5 minutos
const MIN_INTERVAL = 4 * 60 * 1000;   // debounce minimo

export function useDeadlineChecker() {
  const { data: orders } = useOSOrders();
  const { data: teamMembers } = useTeamMembers();
  const lastCheck = useRef(0);

  useEffect(() => {
    if (!orders?.length || !teamMembers?.length) return;

    const check = () => {
      const now = Date.now();
      if (now - lastCheck.current < MIN_INTERVAL) return;
      lastCheck.current = now;
      checkAndNotifyDeadlines(orders, teamMembers);
    };

    // Checar apos 10s (dar tempo pro app carregar)
    const initialTimer = setTimeout(check, 10_000);
    const interval = setInterval(check, CHECK_INTERVAL);

    return () => {
      clearTimeout(initialTimer);
      clearInterval(interval);
    };
  }, [orders, teamMembers]);
}
