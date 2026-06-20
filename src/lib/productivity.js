/**
 * productivity - o "cérebro" da produtividade (camadas 2 e 3), independente da
 * fonte de dados. Recebe fatores/registros já normalizados e devolve:
 *   • productivityScore  → nota 0–10 ponderada (camada 3)
 *   • timePatterns       → tempo típico (mediana) por chave (camada 2)
 *   • consistencyScore   → quão distribuída foi a carga (fator da nota)
 *
 * Pesos da nota (anti-gaming: o que a pessoa NÃO controla sozinha pesa mais):
 *   Qualidade 40% · Entrega 30% · Prazo 20% · Consistência 10%.
 * Fatores nulos (sem dado) saem da conta e os pesos se renormalizam.
 */

const clamp = (n, a, b) => Math.max(a, Math.min(b, n));

export function median(nums) {
  const arr = nums.filter((n) => n != null).sort((a, b) => a - b);
  if (!arr.length) return 0;
  const m = Math.floor(arr.length / 2);
  return arr.length % 2 ? arr[m] : Math.round((arr[m - 1] + arr[m]) / 2);
}

// Distribuição da carga: 100 = perfeitamente espalhada; 0 = tudo num balde só.
export function consistencyScore(buckets) {
  const counts = (buckets || []).map((b) => b.planned || 0);
  const total = counts.reduce((a, b) => a + b, 0);
  const n = counts.length;
  if (total <= 0 || n <= 1) return total > 0 ? 100 : null;
  const share = Math.max(...counts) / total; // 0..1 (concentração no maior balde)
  const even = 1 / n;
  return clamp(Math.round(100 * (1 - (share - even) / (1 - even))), 0, 100);
}

const WEIGHTS = { qualidade: 0.4, entrega: 0.3, prazo: 0.2, consistencia: 0.1 };
const LABELS = { qualidade: 'Qualidade', entrega: 'Entrega', prazo: 'Prazo', consistencia: 'Consistência' };

/**
 * @param {{qualidade,entrega,prazo,consistencia}} f  cada um 0–100 ou null
 * @returns {{ nota:number|null, factors:{key,label,score,weight}[] }}
 */
export function productivityScore(f) {
  const factors = Object.keys(WEIGHTS).map((k) => ({ key: k, label: LABELS[k], score: f?.[k] ?? null, weight: WEIGHTS[k] }));
  const avail = factors.filter((x) => x.score != null);
  if (!avail.length) return { nota: null, factors };
  const wsum = avail.reduce((a, x) => a + x.weight, 0);
  const score100 = avail.reduce((a, x) => a + x.score * x.weight, 0) / wsum;
  return { nota: Math.round(score100) / 10, factors }; // 0–10, 1 casa
}

export const notaColor = (nota) => (nota == null ? '#94a3b8' : nota >= 8 ? '#10b981' : nota >= 6 ? '#f59e0b' : '#ef4444');

/**
 * Tempo típico (mediana) por chave — base do "aprendizado" de prazos.
 * @param records lista qualquer
 * @param keyFn   record → chave de agrupamento
 * @param labelFn record → rótulo
 * @param colorFn record → cor (opcional)
 * @param minFn   record → minutos reais (default: r.realMinutes ?? r.timeMin)
 */
export function timePatterns(records, keyFn, labelFn, colorFn, minFn) {
  const getMin = minFn || ((r) => r.realMinutes ?? r.timeMin ?? null);
  const groups = new Map();
  for (const r of records || []) {
    const k = keyFn(r);
    if (k == null) continue;
    if (!groups.has(k)) groups.set(k, { key: k, label: labelFn(r), color: colorFn ? colorFn(r) : null, times: [] });
    const t = getMin(r);
    if (t != null) groups.get(k).times.push(t);
  }
  return [...groups.values()]
    .map((g) => ({ key: g.key, label: g.label, color: g.color, count: g.times.length, medianMin: median(g.times), totalMin: g.times.reduce((a, b) => a + b, 0) }))
    .filter((g) => g.count > 0)
    .sort((a, b) => b.totalMin - a.totalMin);
}
