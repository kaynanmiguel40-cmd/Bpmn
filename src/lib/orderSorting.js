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

/**
 * Ordena O.S. por data de conclusao prevista (estimatedEnd).
 * Quem vence antes aparece primeiro. Sem data vai pro final.
 * Desempate por prioridade e depois sortOrder.
 */
export function sortByDeadline(a, b) {
  const deadA = a.estimatedEnd || '';
  const deadB = b.estimatedEnd || '';

  // Ambos sem data: desempate por prioridade
  if (!deadA && !deadB) return sortByPriorityAndOrder(a, b);
  // Sem data vai pro final
  if (!deadA) return 1;
  if (!deadB) return -1;
  // Compara datas (strings ISO sao comparaveis lexicograficamente)
  if (deadA < deadB) return -1;
  if (deadA > deadB) return 1;
  // Mesma data: desempate por prioridade
  return sortByPriorityAndOrder(a, b);
}

/**
 * Ordena O.S. concluidas pela data real de conclusao (actualEnd).
 * Mais recentes primeiro.
 */
export function sortByActualEnd(a, b) {
  const endA = a.actualEnd || '';
  const endB = b.actualEnd || '';
  if (!endA && !endB) return 0;
  if (!endA) return 1;
  if (!endB) return -1;
  // Mais recente primeiro
  if (endA > endB) return -1;
  if (endA < endB) return 1;
  return 0;
}
