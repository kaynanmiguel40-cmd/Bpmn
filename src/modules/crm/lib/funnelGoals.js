/**
 * funnelGoals.js — resolvedor de funil por PROPAGAÇÃO (PURO e testável).
 *
 * A ideia: o usuário monta a lista de etapas do funil dele (quantas quiser,
 * com o nome que quiser) e pode digitar, pra CADA etapa, a contagem real que
 * ele já sabe (ex: 200 leads, 100 qualificados) e/ou, pra cada transição, a
 * taxa de conversão que ele já sabe. A gente propaga o que dá pra descobrir:
 *
 *   - Se as 2 contagens vizinhas de uma transição são conhecidas, a TAXA é
 *     derivada delas (contagem manda mais que taxa digitada).
 *   - Se uma contagem + a taxa da transição são conhecidas, a OUTRA contagem
 *     é derivada.
 *   - O que não dá pra descobrir fica null (etapa/taxa desconhecida) — sem
 *     inventar número.
 */

/** Contagem válida = número >= 0. null/undefined/'' são "desconhecido", não zero
 * (cuidado: Number(null) === 0, então precisa checar antes de converter). */
const parseCount = (v) => {
  if (v == null || v === '') return null;
  const n = Number(v);
  return Number.isFinite(n) && n >= 0 ? Math.round(n) : null;
};

/** Taxa válida = número > 0. Acima de 100% não faz sentido (vira 100%). */
const parseRate = (v) => {
  if (v == null || v === '') return null;
  const n = Number(v);
  return Number.isFinite(n) && n > 0 ? Math.min(100, n) : null;
};

/**
 * Resolve o funil a partir do que o usuário souber: contagens soltas em
 * qualquer etapa e/ou taxas soltas em qualquer transição.
 *
 * @param {object} p
 * @param {string[]} p.stages - nomes das etapas, do topo pra base (mín. 2).
 * @param {Array<number|string|null>} p.counts - contagem conhecida por etapa (stages.length), ou null/vazio.
 * @param {Array<number|string|null>} p.rates  - taxa % conhecida por transição (stages.length - 1), ou null/vazio.
 * @returns {null | {
 *   stages, counts:(number|null)[], rates:(number|null)[], rateIsInput:boolean[], rateCapped:boolean[],
 * }} null se `stages`/`counts`/`rates` tiverem tamanho inválido.
 */
export function resolveFunnelPlan({ stages, counts, rates } = {}) {
  if (!Array.isArray(stages) || stages.length < 2) return null;
  if (!Array.isArray(counts) || counts.length !== stages.length) return null;
  if (!Array.isArray(rates) || rates.length !== stages.length - 1) return null;

  const N = stages.length;
  const resolvedCounts = counts.map(parseCount);
  const resolvedRates = new Array(N - 1).fill(null);
  const rateIsInput = new Array(N - 1).fill(false);
  const rateCapped = new Array(N - 1).fill(false);
  const derivedEdge = new Array(N - 1).fill(false);

  // Tenta derivar a taxa de uma transição a partir das 2 contagens vizinhas.
  // Retorna true só quando DESCOBRE algo novo (pra controlar o loop abaixo).
  // Um funil só afunila: se as 2 contagens digitadas implicarem "crescimento"
  // (mais saindo do que entrando), a taxa é limitada a 100% (rateCapped=true)
  // em vez de mostrar um número sem sentido tipo 2000%.
  const tryDerive = (i) => {
    if (derivedEdge[i]) return false;
    if (resolvedCounts[i] != null && resolvedCounts[i + 1] != null && resolvedCounts[i] > 0) {
      const raw = (resolvedCounts[i + 1] / resolvedCounts[i]) * 100;
      resolvedRates[i] = Math.round(Math.min(100, raw) * 10) / 10;
      rateCapped[i] = raw > 100;
      rateIsInput[i] = false;
      derivedEdge[i] = true;
      return true;
    }
    return false;
  };

  // 1ª passada: prioriza taxa derivada das contagens; senão usa a taxa digitada.
  for (let i = 0; i < N - 1; i++) {
    if (!tryDerive(i)) {
      const r = parseRate(rates[i]);
      resolvedRates[i] = r;
      rateIsInput[i] = r != null;
    }
  }

  // Propaga: contagem + taxa conhecidas descobrem a contagem vizinha; e uma
  // contagem nova pode tornar uma taxa vizinha derivável. Repete até estabilizar.
  let changed = true;
  while (changed) {
    changed = false;
    for (let i = 0; i < N - 1; i++) {
      if (resolvedCounts[i] != null && resolvedRates[i] != null && resolvedCounts[i + 1] == null) {
        resolvedCounts[i + 1] = Math.round(resolvedCounts[i] * (resolvedRates[i] / 100));
        changed = true;
      }
      if (resolvedCounts[i + 1] != null && resolvedRates[i] != null && resolvedCounts[i] == null) {
        resolvedCounts[i] = Math.max(resolvedCounts[i + 1], Math.round(resolvedCounts[i + 1] / (resolvedRates[i] / 100)));
        changed = true;
      }
    }
    for (let i = 0; i < N - 1; i++) {
      if (tryDerive(i)) changed = true;
    }
  }

  return { stages, counts: resolvedCounts, rates: resolvedRates, rateIsInput, rateCapped };
}

/**
 * Progresso rumo à meta em uma etapa (por índice): real vs alvo, % limitada a 999.
 * @returns {{ target:number, current:number, percent:number, hit:boolean } | null}
 */
export function stageProgress(plan, index, currentCount) {
  const target = plan?.counts?.[index];
  if (!target || target <= 0) return null;
  const current = Number(currentCount) || 0;
  const percent = Math.min(999, Math.round((current / target) * 100));
  return { target, current, percent, hit: current >= target };
}

/**
 * Resumo textual curto pro cabeçalho ("200 Leads → 10 Vendas"). Vazio se as
 * duas pontas não estiverem resolvidas.
 */
export function funnelPlanHeadline(plan) {
  if (!plan) return '';
  const last = plan.stages.length - 1;
  if (plan.counts[0] == null || plan.counts[last] == null) return '';
  const nf = new Intl.NumberFormat('pt-BR');
  return `${nf.format(plan.counts[0])} ${plan.stages[0]} → ${nf.format(plan.counts[last])} ${plan.stages[last]}`;
}

/**
 * Quando 2 contagens vizinhas digitadas implicam funil "crescendo" (mais de
 * 100% de conversão — impossível), a contagem de BAIXO (mais perto do
 * resultado, ex: Vendas) é o dado que manda. Esta função sobe a cadeia a
 * partir da transição quebrada recalculando cada etapa de CIMA — usando a
 * taxa que JÁ estava certa em cada uma (preserva o que já era consistente;
 * só assume 100% na transição quebrada em si) — em vez de rederivar tudo do
 * zero, o que contaminaria etapas que já batiam com um valor errado.
 *
 * @param {string[]} stages
 * @param {Array<number|string|null>} counts - contagens digitadas (cru, como vem do form).
 * @param {Array<number|string|null>} rates  - taxas digitadas (cru, como vem do form).
 * @returns {{ counts, rates }} os mesmos arrays, com as etapas acima do
 *   ponto de quebra limpas (viram calculadas) e suas taxas preservadas.
 *   Sem alteração se não houver nenhuma transição incompatível.
 */
export function reconcileFunnel(stages, counts, rates) {
  const before = resolveFunnelPlan({ stages, counts, rates });
  const cappedIdx = before?.rateCapped.findIndex(Boolean) ?? -1;
  if (cappedIdx === -1) return { counts, rates };

  const nextCounts = [...counts];
  const nextRates = [...rates];
  let downstream = before.counts[cappedIdx + 1];

  for (let edge = cappedIdx; edge >= 0; edge--) {
    const rate = edge === cappedIdx ? 100 : before.rates[edge];
    if (rate == null) break; // sem taxa conhecida acima — para de subir
    downstream = Math.round(downstream / (rate / 100));
    nextCounts[edge] = '';
    nextRates[edge] = String(rate);
  }

  return { counts: nextCounts, rates: nextRates };
}

/**
 * Reajusta o funil PREVISTO usando as taxas REAIS observadas até agora,
 * mantendo a META FINAL (última etapa) fixa — "quanto eu preciso agora lá em
 * cima pra ainda bater a mesma meta, dado como o funil tá convertendo de
 * verdade". Pra cada transição, usa a taxa REAL (contagem real da etapa de
 * cima > 0, dá pra medir) e só cai pra taxa PREVISTA quando ainda não há
 * dado real suficiente pra medir aquele trecho.
 *
 * @param {number[]} previstoCounts - contagem planejada por etapa (topo -> base).
 * @param {number[]} realCounts - contagem real por etapa, mesma ordem/tamanho.
 * @returns {number[]} contagem reajustada por etapa; última posição = meta final prevista (não muda).
 */
export function reajustarFunnelComReal(previstoCounts, realCounts) {
  const n = previstoCounts.length;
  if (n === 0 || realCounts.length !== n) return [...previstoCounts];
  const out = new Array(n);
  out[n - 1] = previstoCounts[n - 1];
  for (let i = n - 2; i >= 0; i--) {
    const plannedRate = previstoCounts[i] > 0 ? previstoCounts[i + 1] / previstoCounts[i] : null;
    const realRate = realCounts[i] > 0 ? realCounts[i + 1] / realCounts[i] : null;
    const rate = realRate != null && realRate > 0 ? realRate : plannedRate;
    out[i] = rate != null && rate > 0 ? out[i + 1] / rate : previstoCounts[i];
  }
  return out;
}

/**
 * Reescala o funil PREVISTO inteiro pra bater uma NOVA meta final, usando as
 * MESMAS taxas de conversão do plano original (não olha pro real — é só
 * "se a meta final mudou, quanto precisa em cada etapa de cima pra manter as
 * mesmas taxas planejadas"). Usado quando a meta final do mês não é fixa: ex.
 * o previsto de Fechamentos precisa subir pra recuperar um atraso acumulado
 * na base de Clientes Ativos (meta cumulativa, diferente do fechamento do
 * mês isolado).
 *
 * @param {number[]} previstoCounts - contagem planejada por etapa (topo -> base) — só fornece as TAXAS.
 * @param {number} novaMetaFinal - a nova contagem alvo da última etapa.
 * @returns {number[]} contagem por etapa com a mesma forma de previstoCounts, última posição = novaMetaFinal.
 */
export function reescalarFunnelParaMeta(previstoCounts, novaMetaFinal) {
  const n = previstoCounts.length;
  if (n === 0) return [];
  const out = new Array(n);
  out[n - 1] = novaMetaFinal;
  for (let i = n - 2; i >= 0; i--) {
    const rate = previstoCounts[i] > 0 ? previstoCounts[i + 1] / previstoCounts[i] : null;
    out[i] = rate != null && rate > 0 ? out[i + 1] / rate : previstoCounts[i];
  }
  return out;
}
