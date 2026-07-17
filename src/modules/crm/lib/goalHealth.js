/**
 * goalHealth.js — Saude da meta (ritmo: progresso real vs tempo decorrido).
 *
 * Compartilhado entre CrmDashboardPage e CrmGoalsPage — o mesmo selo
 * ("Apertada"/"Atencao"/"No Ritmo"/"Meta Leve") nao pode ter cor ou tooltip
 * diferente dependendo da tela; senao a mesma meta parece mais/menos urgente
 * conforme onde o usuario olha.
 */

import { AlertTriangle, TrendingDown, TrendingUp, Zap } from 'lucide-react';

const formatCurrency = (val) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(val || 0);

// Uma entrada por estado: label, icone, cor de texto, fundo do badge (solido,
// nao opacity) e cor da barra de progresso.
export const GOAL_HEALTH_STYLES = {
  apertada: {
    label: 'Apertada',
    icon: AlertTriangle,
    color: 'text-rose-600 dark:text-rose-400',
    bgColor: 'bg-rose-50 dark:bg-rose-900/20',
    barColor: 'bg-rose-500',
  },
  atencao: {
    label: 'Atencao',
    icon: TrendingDown,
    color: 'text-amber-600 dark:text-amber-400',
    bgColor: 'bg-amber-50 dark:bg-amber-900/20',
    barColor: 'bg-amber-500',
  },
  noRitmo: {
    label: 'No Ritmo',
    icon: TrendingUp,
    color: 'text-emerald-600 dark:text-emerald-400',
    bgColor: 'bg-emerald-50 dark:bg-emerald-900/20',
    barColor: 'bg-emerald-500',
  },
  metaLeve: {
    label: 'Meta Leve',
    icon: Zap,
    color: 'text-blue-600 dark:text-blue-400',
    bgColor: 'bg-blue-50 dark:bg-blue-900/20',
    barColor: 'bg-blue-500',
  },
};

/**
 * Calcula a saude da meta baseado no ritmo (progresso vs tempo decorrido).
 * Retorna null se a meta nao estiver ativa/no periodo (nada pra mostrar).
 */
export function getGoalHealth(goal, currentProgress) {
  if (goal.status !== 'active' || !goal.periodStart || !goal.periodEnd || goal.targetValue <= 0) {
    return null;
  }

  const now = new Date();
  const start = new Date(goal.periodStart + 'T00:00:00');
  const end = new Date(goal.periodEnd + 'T00:00:00');
  if (now < start) return null;

  // periodEnd e inclusivo (01/07 a 31/07 = 31 dias), por isso o +1: sem ele o
  // tempo satura em 100% um dia antes do prazo e contradiz o "Xd restante".
  const totalDays = Math.max(1, (end - start) / (1000 * 60 * 60 * 24) + 1);
  const elapsedDays = Math.min(totalDays, (now - start) / (1000 * 60 * 60 * 24));
  const timePercent = elapsedDays / totalDays;
  const expectedProgress = goal.targetValue * timePercent;
  const ritmo = expectedProgress > 0 ? currentProgress / expectedProgress : 0;

  const expectedPercent = Math.round(timePercent * 100);
  const actualPercent = Math.round((currentProgress / goal.targetValue) * 100);
  const tooltip = `Tempo: ${expectedPercent}% | Progresso: ${actualPercent}% — Deveria estar em ${formatCurrency(expectedProgress)}`;

  let key;
  if (ritmo < 0.6) key = 'apertada';
  else if (ritmo < 0.85) key = 'atencao';
  else if (ritmo <= 1.3) key = 'noRitmo';
  else key = 'metaLeve';

  return { ...GOAL_HEALTH_STYLES[key], tooltip, ritmo };
}
