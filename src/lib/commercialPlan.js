/**
 * PLANO COMERCIAL — o PREVISTO (baseline).
 *
 * O previsto e o PISO: o minimo que a Fyness tem que entregar. Nao e previsao
 * nem teto — o real fica ACIMA dele (as estrategias da casa, principalmente o
 * canal de parceiro, convertem melhor que a media de mercado).
 *
 * Construcao: a barra de geracao de leads vem do planejamento estrategico (PDF
 * "Da rede do Robert a receita recorrente"); o resto da tabela e derivado dela
 * pelas taxas de BENCHMARK DE MERCADO (FUNIL_UNITARIO_RATES). Assim o piso
 * responde "quanto sai se a gente gerar os leads do plano performando como a
 * media do mercado" — qualquer coisa acima e merito da operacao.
 *
 * M1 = julho/2026 (o plano passa a valer em 20/07, com julho parcial). A
 * trajetoria vai ate M12 = junho/2027, fechando ~R$20,8k de MRR com 160
 * clientes. R$100k e meta de horizonte mais longo (~24 meses), nao dos 12
 * primeiros: a geracao de leads do plano nao sustenta isso ao benchmark.
 */

// M1 = julho/2026 (month 0-indexed: 6 = julho). O plano comeca a valer em
// 20/07/2026 — julho entra como mes PARCIAL (10 dos 23 dias uteis). A tabela
// abaixo e sempre de mes CHEIO; quem corta a fatia e proratedPlanForPeriod,
// pelos dias uteis do recorte.
export const PLAN_START = { year: 2026, month: 6 };

// Piso de MRR no fim dos 12 meses (M12). Bate com PLAN_MONTHS[11].mrr.
export const PLAN_GOAL_MRR = 20000;

// Posicao no inicio do plano (20/07/2026): clientes PAGANTES, medidos na
// pipeline Geral. Os 6 ganhos da pipeline Parceiros sao contadores recrutados
// (fonte de indicacao), nao clientes — ficam de fora da base.
export const PLAN_POSITION = { mrr: 1072, clientes: 16 };

/**
 * Tabela mes a mes do plano.
 * - preco:  ticket previsto naquele mes (escada 67 -> 130)
 * - novos:  novos clientes no mes (= fechamentos do funil)
 * - ativos: base ativa acumulada (ja considera o churn de 5% do plano)
 * - mrr:    MRR acumulado previsto (a curva rumo a PLAN_GOAL_MRR)
 * - leads/reat/qualif/reun/fech: funil do mes (topo -> fechamento)
 *
 * A COLUNA QUE MANDA E `leads` — e a barra de geracao, o unico numero cravado
 * (vem do planejamento original). Todo o resto e DERIVADO dela pelas taxas de
 * benchmark (FUNIL_UNITARIO_RATES), na ordem:
 *   qualif = leads x 0.25 | reun = qualif x 0.60 | realizadas = reun x 0.80
 *   fech = realizadas x 0.30 | ativos = base - churn 5% + fech + reat
 * Ou seja: o fechamento e CONSEQUENCIA do topo, nao uma meta independente.
 * Mexeu na barra de leads ou numa taxa? Recalcule a tabela inteira.
 */
export const PLAN_MONTHS = [
  { m: 1,  preco: 67,  novos: 3,   ativos: 19,  mrr: 1244,  leads: 89,  reat: 0, qualif: 22,  reun: 13,  fech: 3 },
  { m: 2,  preco: 67,  novos: 4,   ativos: 22,  mrr: 1497,  leads: 122, reat: 0, qualif: 30,  reun: 18,  fech: 4 },
  { m: 3,  preco: 87,  novos: 6,   ativos: 28,  mrr: 2398,  leads: 163, reat: 0, qualif: 41,  reun: 24,  fech: 6 },
  { m: 4,  preco: 87,  novos: 8,   ativos: 35,  mrr: 3006,  leads: 214, reat: 1, qualif: 54,  reun: 32,  fech: 8 },
  { m: 5,  preco: 97,  novos: 10,  ativos: 43,  mrr: 4200,  leads: 267, reat: 1, qualif: 67,  reun: 40,  fech: 10 },
  { m: 6,  preco: 97,  novos: 12,  ativos: 54,  mrr: 5224,  leads: 322, reat: 1, qualif: 80,  reun: 48,  fech: 12 },
  { m: 7,  preco: 110, novos: 14,  ativos: 66,  mrr: 7287,  leads: 379, reat: 1, qualif: 95,  reun: 57,  fech: 14 },
  { m: 8,  preco: 110, novos: 16,  ativos: 81,  mrr: 8861,  leads: 439, reat: 2, qualif: 110, reun: 66,  fech: 16 },
  { m: 9,  preco: 120, novos: 18,  ativos: 97,  mrr: 11619, leads: 501, reat: 2, qualif: 125, reun: 75,  fech: 18 },
  { m: 10, preco: 120, novos: 21,  ativos: 115, mrr: 13842, leads: 572, reat: 3, qualif: 143, reun: 86,  fech: 21 },
  { m: 11, preco: 130, novos: 23,  ativos: 136, mrr: 17731, leads: 651, reat: 3, qualif: 163, reun: 98,  fech: 23 },
  { m: 12, preco: 130, novos: 27,  ativos: 160, mrr: 20822, leads: 737, reat: 4, qualif: 184, reun: 111, fech: 27 },
];

// Comparecimento: das reunioes AGENDADAS, quantas ACONTECEM (o resto e no-show).
// O plano so traz 1 numero de reuniao (reun = agendadas); acontecidas =
// agendadas × esta taxa.
export const COMPARECIMENTO_RATE = 0.8;

/**
 * TAXAS DE CONVERSAO — fonte unica do funil.
 *
 * Alimentam as tres visoes ao mesmo tempo: os volumes de PLAN_MONTHS (derivados
 * por cascata reversa), as PREMISSAS exibidas no Comparativo e o funil unitario
 * ("o que custa 1 venda"). Mexeu aqui, RECALCULE PLAN_MONTHS — senao a tela
 * mostra taxa que nao bate com o volume ao lado.
 *
 * Custo dessas taxas: ~28 leads por venda (3,6% lead->venda), 27 mil leads nos
 * 12 meses do plano.
 */
export const FUNIL_UNITARIO_RATES = {
  qualif:         0.25, // lead -> qualificado
  agendamento:    0.60, // qualificado -> reuniao agendada
  comparecimento: COMPARECIMENTO_RATE, // agendada -> realizada (o resto e no-show)
  fechamento:     0.30, // realizada -> cliente
};

/**
 * Premissas de conversao do plano (a validar nos 90 dias).
 * Churn (5%) fica FORA por decisao — nao entra no Previsto vs Real.
 */
export const PREMISSAS = [
  { key: 'qualif',        label: 'Qualificacao',   sub: 'lead → qualificado',       pct: Math.round(FUNIL_UNITARIO_RATES.qualif * 100) },
  { key: 'agendamento',   label: 'Agendamento',    sub: 'qualificado → agendada',   pct: Math.round(FUNIL_UNITARIO_RATES.agendamento * 100) },
  { key: 'comparecimento', label: 'Comparecimento', sub: 'agendada → acontecida',   pct: Math.round(COMPARECIMENTO_RATE * 100) },
  { key: 'fechamento',    label: 'Fechamento',     sub: 'acontecida → cliente',     pct: Math.round(FUNIL_UNITARIO_RATES.fechamento * 100) },
  { key: 'reativacao',    label: 'Reativacao',     sub: 'sobre o pool',             pct: 20 },
];

/**
 * Cascata reversa do funil unitario: quantos leads/SQL/reunioes pra `vendas`.
 * PURA — recebe as taxas pra ser testavel sem depender da constante.
 *
 * @param {number} vendas  quantas vendas no alvo (default 1)
 * @param {object} rates   { qualif, agendamento, comparecimento, fechamento }
 * @returns {Array<{key:string,label:string,sub:string,qtd:number,pct:number|null}>}
 *          do topo (leads) ate a venda. `pct` = taxa que leva pra proxima etapa.
 */
export function unitFunnelSteps(vendas = 1, rates = FUNIL_UNITARIO_RATES) {
  const realizadas   = vendas / rates.fechamento;
  const agendadas    = realizadas / rates.comparecimento;
  const qualificados = agendadas / rates.agendamento;
  const leads        = qualificados / rates.qualif;
  return [
    { key: 'lead',      label: 'Leads',              sub: 'topo do funil',      qtd: leads,        pct: rates.qualif },
    { key: 'qualif',    label: 'Qualificados',       sub: 'SQL',                qtd: qualificados, pct: rates.agendamento },
    { key: 'agendada',  label: 'Reunioes marcadas',  sub: 'agendadas',          qtd: agendadas,    pct: rates.comparecimento },
    { key: 'realizada', label: 'Reunioes realizadas', sub: 'o lead compareceu', qtd: realizadas,   pct: rates.fechamento },
    { key: 'venda',     label: 'Venda',              sub: 'cliente ativo',      qtd: vendas,       pct: null },
  ];
}

const MONTH_ABBR = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'];

/** Indice de calendario (0-based desde jan/0000) do mes M do plano. */
function planMonthAbsolute(m) {
  return PLAN_START.year * 12 + PLAN_START.month + (m - 1);
}

/** "YYYY-MM" do mes M do plano (1..12). */
export function planMonthKey(m) {
  const abs = planMonthAbsolute(m);
  const year = Math.floor(abs / 12);
  const month = abs % 12;
  return `${year}-${String(month + 1).padStart(2, '0')}`;
}

/** Rotulo curto "jun/26" do mes M do plano. */
export function planMonthLabel(m) {
  const abs = planMonthAbsolute(m);
  const year = Math.floor(abs / 12);
  const month = abs % 12;
  return `${MONTH_ABBR[month]}/${String(year).slice(2)}`;
}

/** Rotulo longo "Junho/2026" do mes M do plano. */
export function planMonthLong(m) {
  const abs = planMonthAbsolute(m);
  const year = Math.floor(abs / 12);
  const month = abs % 12;
  const full = ['Janeiro', 'Fevereiro', 'Marco', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
  return `${full[month]}/${year}`;
}

/** Qual mes do plano (1..12) corresponde a uma data; null se fora da janela. */
export function planMonthForDate(date) {
  const abs = date.getFullYear() * 12 + date.getMonth();
  const m = abs - planMonthAbsolute(1) + 1;
  return m >= 1 && m <= 12 ? m : null;
}

// ==================== RITMO DIARIO (dias uteis) ====================

/**
 * Dia util = segunda a sexta. Feriado NAO e tratado (nao temos calendario de
 * feriados) — feriado conta como dia util.
 */
export function isBusinessDay(date) {
  const d = date.getDay();
  return d !== 0 && d !== 6;
}

/** Quantos dias uteis tem o mes (month 0-indexed). */
export function businessDaysInMonth(year, month) {
  const last = new Date(year, month + 1, 0).getDate();
  let n = 0;
  for (let day = 1; day <= last; day++) {
    if (isBusinessDay(new Date(year, month, day))) n++;
  }
  return n;
}

/**
 * Meta de leads NOVOS pra um dia: a meta de leads do mes do plano diluida nos
 * DIAS UTEIS daquele mes. Fim de semana = 0 (a meta se concentra nos uteis).
 *
 * @param {Date} date
 * @returns {number} leads/dia (0 se nao for dia util ou estiver fora do plano)
 */
export function dailyLeadTarget(date) {
  if (!isBusinessDay(date)) return 0;
  const m = planMonthForDate(date);
  if (!m) return 0;
  const row = PLAN_MONTHS.find(p => p.m === m);
  if (!row) return 0;
  const bd = businessDaysInMonth(date.getFullYear(), date.getMonth());
  return bd > 0 ? (row.leads || 0) / bd : 0;
}

/**
 * Meta do FUNIL prorrateada pra um periodo qualquer: soma, mes a mes, a meta do
 * mes x a fracao de DIAS UTEIS daquele mes que cai dentro do periodo. Assim um
 * recorte de 7 dias uteis num mes de 23 vale ~30% da meta do mes, e um periodo
 * que cruza meses soma a fatia de cada um. Fim de semana nao conta (a meta se
 * concentra nos dias uteis).
 *
 * @param {Date} start
 * @param {Date} end
 * @returns {{leads:number, qualif:number, reun:number, fech:number, novos:number, businessDays:number}}
 */
export function proratedPlanForPeriod(start, end) {
  const acc = { leads: 0, qualif: 0, reun: 0, fech: 0, novos: 0, businessDays: 0 };
  if (!start || !end || end < start) return acc;

  // Dias uteis do periodo, contados por mes do plano.
  const daysByPlanMonth = new Map();
  const cur = new Date(start.getFullYear(), start.getMonth(), start.getDate());
  let guard = 0;
  while (cur <= end && guard < 800) {
    if (isBusinessDay(cur)) {
      acc.businessDays++;
      const m = planMonthForDate(cur);
      if (m) daysByPlanMonth.set(m, (daysByPlanMonth.get(m) || 0) + 1);
    }
    cur.setDate(cur.getDate() + 1);
    guard++;
  }

  for (const [m, days] of daysByPlanMonth) {
    const row = PLAN_MONTHS.find(p => p.m === m);
    if (!row) continue;
    const abs = planMonthAbsolute(m);
    const totalBd = businessDaysInMonth(Math.floor(abs / 12), abs % 12);
    if (!totalBd) continue;
    const frac = days / totalBd;
    acc.leads  += (row.leads  || 0) * frac;
    acc.qualif += (row.qualif || 0) * frac;
    acc.reun   += (row.reun   || 0) * frac;
    acc.fech   += (row.fech   || 0) * frac;
    acc.novos  += (row.novos  || 0) * frac;
  }
  return acc;
}

/**
 * Reajusta a trajetoria de MRR PREVISTA a partir de agora — como se o plano
 * reiniciasse do zero na posicao REAL atual, preservando o "formato" (ritmo
 * relativo mes a mes) da trajetoria original ate a MESMA meta final. Meses
 * ja decorridos mantem o previsto original intocado (e historia, nao muda).
 *
 * @param {Array<{m:number, mrr:number}>} planMonths - PLAN_MONTHS.
 * @param {number} currentM - mes atual do plano (1..12).
 * @param {number} realMrrNow - MRR real acumulado agora.
 * @param {number} goalMrr - meta final de MRR.
 * @returns {number[]} previsto reajustado, um valor por mes de planMonths (mesma ordem).
 */
export function reajustarTrajetoriaMrr(planMonths, currentM, realMrrNow, goalMrr) {
  const currentRow = planMonths.find(p => p.m === currentM);
  if (!currentRow) return planMonths.map(p => p.mrr);
  const originalStart = currentRow.mrr;
  const span = goalMrr - originalStart;
  return planMonths.map(p => {
    if (p.m < currentM) return p.mrr;
    if (span === 0) return goalMrr;
    const progress = (p.mrr - originalStart) / span; // 0 no mes atual, ~1 no ultimo mes do plano
    return realMrrNow + progress * (goalMrr - realMrrNow);
  });
}
