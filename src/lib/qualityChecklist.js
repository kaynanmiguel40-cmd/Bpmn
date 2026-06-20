/**
 * qualityChecklist - critérios MANUAIS de qualidade por tarefa (OPERAÇÃO).
 *
 * O supervisor dá em CADA critério uma nota de 1 a 5. Cada critério tem um PESO
 * (o quanto ele influencia). A qualidade da tarefa é a MÉDIA PONDERADA dessas
 * notas: Σ(nota × peso) / Σ(peso) → resultado de 1 a 5.
 *
 * Critério pode ser N/A (não se aplica / em progresso) → sai da média.
 * Nota abaixo de 5 exige justificativa (na UI).
 *
 * `pct` = média normalizada pra 0–100 (média/5 × 100) — usado pelos selos/cor e
 * pela nota. O comercial terá seu próprio conjunto depois.
 */

// weight = peso (influência na média). A nota dada vai de 1 a 5 (ou 'na').
export const OPERACAO_QUALITY = [
  { id: 'funcional', label: 'Entregue funcional (sem erro/bug)', weight: 4 },
  { id: 'escopo', label: 'Escopo completo (entregou tudo que foi pedido)', weight: 3 },
  { id: 'sem_retrabalho', label: 'Sem retrabalho (não precisou refazer)', weight: 3 },
  { id: 'documentado', label: 'Entrega bem documentada (print/relato)', weight: 2 },
  { id: 'proatividade', label: 'Proatividade (antecipou problema / foi além)', weight: 1 },
];

export const RATING_MIN = 1;
export const RATING_MAX = 5;

/**
 * Média ponderada das notas (1–5). answers = { [id]: 1..5 | 'na' }.
 * @returns {{ avg:number|null, pct:number|null }}  avg = 1..5 · pct = 0..100
 */
export function scoreQualityChecklist(answers, criteria = OPERACAO_QUALITY) {
  let wsum = 0, weighted = 0;
  for (const c of criteria) {
    const a = answers?.[c.id];
    if (a == null || a === 'na') continue;
    const v = Math.max(RATING_MIN, Math.min(RATING_MAX, Number(a) || 0));
    weighted += v * c.weight;
    wsum += c.weight;
  }
  const avg = wsum > 0 ? Math.round((weighted / wsum) * 10) / 10 : null; // 1.0–5.0
  const pct = avg == null ? null : Math.round((avg / RATING_MAX) * 100); // 0–100
  return { avg, pct };
}
