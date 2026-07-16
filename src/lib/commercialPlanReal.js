/**
 * PLANO COMERCIAL — o REAL.
 *
 * Le os dados reais do CRM (somente leitura) e os organiza no mesmo formato do
 * plano (mes a mes), pra comparar com o Previsto.
 *
 * MRR real = soma do campo `mrr` dos deals GANHOS no CRM, acumulado (sem churn,
 * por decisao). Clientes = deals ganhos. Funil = reusa o motor do CRM
 * (getSalesFunnel: Lead -> Qualificado -> Reuniao -> Fechamento).
 *
 * NAO modifica nada do modulo CRM — so consome dado/funcao exportada.
 */

import { supabase } from './supabase';
import { getSalesFunnel } from '../modules/crm/services/crmDashboardService';
import { PLAN_START, PLAN_MONTHS } from './commercialPlan';

function planMonthRange(m) {
  const abs = PLAN_START.year * 12 + PLAN_START.month + (m - 1);
  const year = Math.floor(abs / 12);
  const month = abs % 12;
  return {
    start: new Date(year, month, 1),
    end: new Date(year, month + 1, 0, 23, 59, 59, 999),
  };
}

function pct(a, b) {
  return b > 0 ? Math.round((a / b) * 100) : 0;
}

/**
 * Retorna { byMonth, currentM, monthElapsedPct, hasData }.
 * byMonth[m] = { elapsed, partial, mrrAccum, novos, clientesAccum, funnel }.
 * Meses futuros nao entram no mapa (sem real ainda).
 */
export async function getCommercialPlanReal() {
  const now = new Date();

  // 1) Deals ganhos + pipelines (em paralelo). value = contrato, mrr = mensalidade.
  const [{ data: wonRaw, error }, { data: pipelinesRaw }] = await Promise.all([
    supabase.from('crm_deals').select('value, mrr, closed_at, pipeline_id').eq('status', 'won').is('deleted_at', null),
    supabase.from('crm_pipelines').select('id, name'),
  ]);

  if (error) {
    console.error('[Plano Comercial] erro ao ler deals ganhos:', error.message);
  }

  // ESCOPO DE VENDA: um "parceiro fechado" (ganho na pipeline de AQUISICAO de
  // parceiros) NAO e cliente/MRR — nao pode contar no Previsto vs Real. Exclui
  // tambem nutricao. Mesma regra do funil (getSalesFunnel scope='sales'):
  // "Parceiros" (exato) = aquisicao; "Leads de Parceiros" SEGUE contando (sao
  // clientes indicados que fecharam de fato).
  const isNurturing  = p => /nurturing|nutri/i.test(p.name || '');
  const isPartnerAcq = p => /^\s*parceiros\s*$/i.test(p.name || '');
  const nonSalesPipelineIds = new Set(
    (pipelinesRaw || []).filter(p => isNurturing(p) || isPartnerAcq(p)).map(p => p.id)
  );

  // Todo deal ganho DE VENDA conta como cliente ativo. Sem closed_at = base ja
  // existente (clientes que ja estavam no CRM antes do plano) — ativo desde o
  // M1. Com closed_at = entra a partir do mes em que fechou.
  const won = (wonRaw || [])
    .filter(d => !nonSalesPipelineIds.has(d.pipeline_id))
    .map(d => ({ mrr: d.mrr || 0, value: d.value || 0, closed: d.closed_at ? new Date(d.closed_at) : null }));

  // 2) Quais meses do plano ja comecaram (start <= hoje).
  const elapsedMonths = PLAN_MONTHS
    .map(p => p.m)
    .filter(m => planMonthRange(m).start <= now);

  // 3) Funil real por mes decorrido (reusa o motor do CRM). Paraleliza.
  const funnelEntries = await Promise.all(
    elapsedMonths.map(async (m) => {
      const { start, end } = planMonthRange(m);
      try {
        const f = await getSalesFunnel(
          { start: start.toISOString(), end: end.toISOString() },
          'sales'
        );
        return [m, f];
      } catch {
        return [m, null];
      }
    })
  );
  const funnelByMonth = Object.fromEntries(funnelEntries);

  // 4) Monta o mapa do real.
  const byMonth = {};
  for (const m of elapsedMonths) {
    const { start, end } = planMonthRange(m);
    const endClamped = end < now ? end : now; // mes atual = ate agora

    // Acumulado: base (sem data) sempre conta; com data conta se ja fechou.
    const inAccum = (d) => d.closed == null || d.closed <= endClamped;
    const mrrAccum = won.filter(inAccum).reduce((s, d) => s + d.mrr, 0);
    const clientesAccum = won.filter(inAccum).length;
    // Novos DO MES = so os que fecharam dentro do mes (a base nao e "nova").
    const novos = won.filter(d => d.closed && d.closed >= start && d.closed <= endClamped).length;

    const f = funnelByMonth[m];
    const funnel = f
      ? {
          lead: f.lead || 0,
          qualif: f.qualified || 0,
          agendadas: f.meeting || 0,        // reunião AGENDADA (estágio do pipeline)
          acontecidas: f.meetingHeld || 0,  // reunião REALIZADA (estágio do pipeline)
          fech: f.closing || 0,
          qualRate: pct(f.qualified || 0, f.lead || 0),       // lead -> qualif
          agendRate: pct(f.meeting || 0, f.qualified || 0),   // qualif -> agendada
          compRate: pct(f.meetingHeld || 0, f.meeting || 0),  // agendada -> acontecida
          fechRate: pct(f.closing || 0, f.meetingHeld || 0),  // acontecida -> fechamento
        }
      : null;

    const partial = end >= now; // mes ainda nao fechou
    byMonth[m] = { elapsed: true, partial, mrrAccum, novos, clientesAccum, funnel };
  }

  // 5) Mes atual do plano + % decorrido.
  let currentM = null;
  let monthElapsedPct = 0;
  for (const m of elapsedMonths) {
    const { start, end } = planMonthRange(m);
    if (start <= now && now <= end) {
      currentM = m;
      monthElapsedPct = Math.round(((now - start) / (end - start)) * 100);
      break;
    }
  }
  // Se o plano ja passou de M12, "atual" = ultimo decorrido.
  if (currentM == null && elapsedMonths.length) currentM = elapsedMonths[elapsedMonths.length - 1];

  // Deals ganhos DENTRO do mes atual (com data) — alimenta a cadencia diaria/
  // semanal do acompanhamento de meta. A base sem closed_at nao entra (nao e
  // "nova" venda do mes).
  let currentMonthWon = [];
  let currentMonthRange = null;
  if (currentM) {
    const { start, end } = planMonthRange(currentM);
    currentMonthRange = { start: start.toISOString(), end: end.toISOString() };
    currentMonthWon = won
      .filter(d => d.closed && d.closed >= start && d.closed <= end)
      .map(d => ({ closedAt: d.closed.toISOString(), mrr: d.mrr, value: d.value }));
  }

  return {
    byMonth,
    currentM,
    monthElapsedPct,
    hasData: won.length > 0,
    currentMonthWon,
    currentMonthRange,
  };
}
