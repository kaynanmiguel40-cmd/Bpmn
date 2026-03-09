/**
 * Utilidades de ordenacao de O.S. por prioridade.
 *
 * Extraido de RoutinePage.jsx onde a mesma logica
 * aparecia duplicada nas linhas 88 e 197.
 */

import { PRIORITY_WEIGHT, UNKNOWN_PRIORITY_WEIGHT } from '../constants/sla';

/** Compara duas O.S. por prioridade (mais urgente primeiro) e depois por sortOrder */
export function sortByPriorityAndOrder(a, b) {
  const pa = PRIORITY_WEIGHT[a.priority] ?? UNKNOWN_PRIORITY_WEIGHT;
  const pb = PRIORITY_WEIGHT[b.priority] ?? UNKNOWN_PRIORITY_WEIGHT;
  if (pa !== pb) return pa - pb;
  return (a.sortOrder ?? 0) - (b.sortOrder ?? 0);
}

/** Compara duas O.S. por data de conclusao prevista (estimatedEnd) */
export function sortByDeadline(a, b) {
  const dateA = a.estimatedEnd ? new Date(a.estimatedEnd) : null;
  const dateB = b.estimatedEnd ? new Date(b.estimatedEnd) : null;
  if (!dateA && !dateB) return 0;
  if (!dateA) return 1;
  if (!dateB) return -1;
  return dateA - dateB;
}
