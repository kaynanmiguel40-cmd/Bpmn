/**
 * taskPatternsService - CAMADA 2 (inteligência) sobre a base real.
 *
 * Lê `task_completions` (o banco que enche a cada conclusão de O.S.) e aprende
 * o tempo TÍPICO por pessoa × tipo de tarefa: a MÉDIA do tempo REAL gasto, nº de
 * amostras, e o desvio entre o que foi ESTIMADO e o REAL — ou seja, o quanto a
 * pessoa costuma inflar (ou furar) o próprio prazo.
 *
 * Começa vazio e fica melhor conforme a base enche. É daqui que a camada 3
 * (nota) vai tirar um "prazo realista" em vez de confiar no chute.
 *
 * Fica em src/lib (fora do CRM).
 */

import { supabase } from './supabase';

const mean = (arr) => (arr.length ? Math.round(arr.reduce((a, b) => a + b, 0) / arr.length) : 0);

/**
 * Baselines de tempo por tipo de tarefa.
 * @param {{ assigneeId?, sectorId?, sinceDays? }} opts
 * @returns {Promise<{key,label,count,typicalMin,avgEst,deviationPct}[]>}
 *   typicalMin = MÉDIA do tempo real (o "tempo típico").
 *   deviationPct > 0 → estimou MAIS do que levou (prazo inflado).
 */
export async function getTimeBaselines({ assigneeId = null, sectorId = null, sinceDays = 120 } = {}) {
  try {
    let q = supabase
      .from('task_completions')
      .select('group_name, sector_label, real_minutes, estimated_minutes, assignee_id, assignee_name')
      .not('real_minutes', 'is', null);
    if (assigneeId) q = q.eq('assignee_id', assigneeId);
    if (sectorId) q = q.eq('sector_id', sectorId);
    if (sinceDays) q = q.gte('completed_at', new Date(Date.now() - sinceDays * 86400000).toISOString());

    const { data, error } = await q;
    if (error || !data?.length) return [];

    const groups = new Map();
    for (const r of data) {
      const key = r.group_name || r.sector_label || 'Geral';
      if (!groups.has(key)) groups.set(key, { key, label: key, real: [], est: [] });
      const g = groups.get(key);
      if (r.real_minutes != null) g.real.push(r.real_minutes);
      if (r.estimated_minutes != null && r.estimated_minutes > 0) g.est.push(r.estimated_minutes);
    }

    return [...groups.values()]
      .map((g) => {
        const typicalMin = mean(g.real);        // tempo típico = MÉDIA do tempo real
        const avgEst = g.est.length ? mean(g.est) : null;
        const deviationPct = avgEst ? Math.round(((avgEst - typicalMin) / avgEst) * 100) : null;
        return { key: g.key, label: g.label, count: g.real.length, typicalMin, avgEst, deviationPct };
      })
      .filter((g) => g.count > 0)
      .sort((a, b) => b.count - a.count);
  } catch {
    return [];
  }
}

/**
 * Tempo típico (MÉDIA do tempo real) de UM tipo, pra uma pessoa — usado pela nota
 * como régua "real" em vez do prazo chutado. Retorna null se não há histórico.
 */
export async function getTypicalMinutes({ assigneeId, typeKey }) {
  if (!assigneeId || !typeKey) return null;
  const baselines = await getTimeBaselines({ assigneeId });
  const hit = baselines.find((b) => b.key === typeKey);
  return hit ? hit.typicalMin : null;
}
