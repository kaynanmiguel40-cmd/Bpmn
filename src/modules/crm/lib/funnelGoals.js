/**
 * funnelGoals.js — planejador reverso de metas de funil (PURO e testável).
 *
 * A ideia: o usuário digita o alvo de UMA ponta do funil e a taxa de conversão.
 * A gente calcula a meta de CADA etapa e desenha por cima do Funil de Conversão.
 *
 *   base='sales' → "quero N vendas".      Leads necessários = N / taxa.
 *   base='calls' → "vou fazer N ligações". Vendas projetadas = N × taxa.
 *
 * As 4 etapas do funil (Lead → Qualificado → Reunião → Fechamento) recebem uma
 * meta por INTERPOLAÇÃO GEOMÉTRICA entre o topo (leadTarget) e a base
 * (closingTarget) — assim o degrau de conversão é constante e a silhueta sempre
 * afunila, sem precisar de dados históricos nem de queries extras.
 */

export const FUNNEL_BASES = [
  { value: 'sales', label: 'Vendas', unit: 'vendas', anchor: 'closing' },
  { value: 'calls', label: 'Ligações', unit: 'ligações', anchor: 'lead' },
];

// Chaves das 4 etapas do funil, do topo pra base. Batem com STEP_META no SalesFunnel.
export const FUNNEL_STAGE_KEYS = ['lead', 'qualified', 'meeting', 'closing'];

// Taxa válida = número > 0. Acima de 100% não faz sentido (vira 100%).
const normalizeRate = (p) => {
  const r = Number(p);
  if (!(r > 0)) return null;
  return Math.min(100, r);
};

/**
 * Monta o plano de metas do funil a partir do alvo de uma ponta + taxa.
 *
 * @param {object}  p
 * @param {'sales'|'calls'} p.base            - qual ponta o usuário digitou.
 * @param {number}  p.targetCount             - nº alvo (vendas ou ligações).
 * @param {number}  p.conversionRate          - taxa de conversão % (lead/ligação → venda).
 * @returns {null | {
 *   base, conversionRate, winRate,
 *   leadTarget, closingTarget, callsTarget, salesTarget,
 *   stageTargets: { lead, qualified, meeting, closing },
 * }}  null se os dados forem inválidos.
 */
export function buildFunnelPlan({ base = 'sales', targetCount, conversionRate } = {}) {
  const count = Math.round(Number(targetCount) || 0);
  const rate = normalizeRate(conversionRate);
  if (count <= 0 || rate == null) return null;
  const winRate = rate / 100; // fração 0..1

  let leadTarget;
  let closingTarget;
  if (base === 'calls') {
    // Ligações são o topo do funil; vendas caem pela taxa.
    leadTarget = count;
    closingTarget = Math.max(1, Math.round(count * winRate));
  } else {
    // Vendas são a base; sobe pra achar quantos leads precisa.
    closingTarget = count;
    leadTarget = Math.max(count, Math.round(count / winRate));
  }

  // Interpolação geométrica das etapas intermediárias entre topo e base.
  const ratio = leadTarget > 0 ? closingTarget / leadTarget : 0;
  const at = (frac) => Math.round(leadTarget * Math.pow(ratio, frac));

  let stageTargets = {
    lead: leadTarget,
    qualified: at(1 / 3),
    meeting: at(2 / 3),
    closing: closingTarget,
  };

  // Garante monotonicidade (nunca uma etapa mais funda maior que a de cima).
  let prev = Infinity;
  for (const key of FUNNEL_STAGE_KEYS) {
    stageTargets[key] = Math.min(stageTargets[key], prev);
    prev = stageTargets[key];
  }
  stageTargets.closing = closingTarget; // a base é exata, sempre
  stageTargets.lead = leadTarget;       // o topo é exato, sempre

  return {
    base,
    conversionRate: rate,
    winRate,
    leadTarget,
    closingTarget,
    // Rótulos de contexto pro cabeçalho: ligações e vendas nas pontas.
    callsTarget: base === 'calls' ? count : leadTarget,
    salesTarget: closingTarget,
    stageTargets,
  };
}

/**
 * Progresso rumo à meta em uma etapa: real vs alvo, com % limitada a 999.
 * @returns {{ target:number, current:number, percent:number, hit:boolean } | null}
 */
export function stageProgress(plan, stageKey, currentCount) {
  const target = plan?.stageTargets?.[stageKey];
  if (!target || target <= 0) return null;
  const current = Number(currentCount) || 0;
  const percent = Math.min(999, Math.round((current / target) * 100));
  return { target, current, percent, hit: current >= target };
}

/**
 * Resumo textual curto pro cabeçalho ("200 ligações → 10 vendas · 5%").
 */
export function funnelPlanHeadline(plan) {
  if (!plan) return '';
  const nf = new Intl.NumberFormat('pt-BR');
  if (plan.base === 'calls') {
    return `${nf.format(plan.callsTarget)} ligações → ${nf.format(plan.salesTarget)} vendas · ${plan.conversionRate}%`;
  }
  return `${nf.format(plan.leadTarget)} leads → ${nf.format(plan.salesTarget)} vendas · ${plan.conversionRate}%`;
}
