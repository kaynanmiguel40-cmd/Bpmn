/**
 * dialerGoals.js — metas diarias por vendedor (localStorage).
 *
 * Por enquanto local (1 vendedor por browser logado). Se um dia virar gestao
 * de equipe ou precisar persistir entre dispositivos, migra pra uma tabela
 * crm_user_settings preservando este shape.
 */

const STORAGE_KEY = 'crm-dialer-goals';

const EMPTY_GOALS = {
  dailyCalls:    0,  // 0 = meta desativada
  dailyMeetings: 0,
};

export function getDialerGoals() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { ...EMPTY_GOALS };
    const parsed = JSON.parse(raw);
    return {
      dailyCalls:    Number(parsed.dailyCalls)    || 0,
      dailyMeetings: Number(parsed.dailyMeetings) || 0,
    };
  } catch {
    return { ...EMPTY_GOALS };
  }
}

export function saveDialerGoals(updates) {
  try {
    const current = getDialerGoals();
    const next = {
      dailyCalls:    Number(updates.dailyCalls    ?? current.dailyCalls)    || 0,
      dailyMeetings: Number(updates.dailyMeetings ?? current.dailyMeetings) || 0,
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    // Dispara evento custom pra outras abas/components reagirem sem precisar
    // de prop drilling (a UI escuta via useEffect).
    window.dispatchEvent(new CustomEvent('crm-dialer-goals-changed', { detail: next }));
    return next;
  } catch {
    return null;
  }
}

export function hasAnyGoal(goals) {
  return (goals?.dailyCalls > 0) || (goals?.dailyMeetings > 0);
}
