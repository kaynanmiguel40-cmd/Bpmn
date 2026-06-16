/**
 * PLANO COMERCIAL — o PREVISTO (baseline).
 *
 * Numeros extraidos do planejamento estrategico (PDF "Da rede do Robert a
 * receita recorrente"). Sao a meta cravada — o "previsto" que comparamos contra
 * o real do CRM mes a mes.
 *
 * M1 = junho/2026. A trajetoria vai ate M12 = maio/2027, fechando ~R$96k de MRR
 * (a porta da meta de R$100k).
 */

// M1 = junho/2026 (month 0-indexed: 5 = junho).
export const PLAN_START = { year: 2026, month: 5 };

export const PLAN_GOAL_MRR = 100000;

// Posicao atual (ponto de partida do plano).
export const PLAN_POSITION = { mrr: 536, clientes: 8 };

/**
 * Tabela mes a mes do plano.
 * - preco:  ticket previsto naquele mes (escada 67 -> 130)
 * - novos:  novos clientes no mes (= fechamentos do funil)
 * - ativos: base ativa acumulada (ja considera o churn de 5% do plano)
 * - mrr:    MRR acumulado previsto (a curva rumo a R$100k)
 * - leads/reat/qualif/reun/fech: funil do mes (topo -> fechamento)
 */
export const PLAN_MONTHS = [
  { m: 1,  preco: 67,  novos: 15,  ativos: 23,  mrr: 1514,  leads: 89,  reat: 0,   qualif: 31,  reun: 25,  fech: 15 },
  { m: 2,  preco: 67,  novos: 22,  ativos: 43,  mrr: 2912,  leads: 122, reat: 3,   qualif: 46,  reun: 37,  fech: 22 },
  { m: 3,  preco: 87,  novos: 31,  ativos: 72,  mrr: 5464,  leads: 163, reat: 7,   qualif: 65,  reun: 52,  fech: 31 },
  { m: 4,  preco: 87,  novos: 42,  ativos: 111, mrr: 8845,  leads: 214, reat: 13,  qualif: 88,  reun: 70,  fech: 42 },
  { m: 5,  preco: 97,  novos: 54,  ativos: 159, mrr: 13640, leads: 267, reat: 19,  qualif: 112, reun: 90,  fech: 54 },
  { m: 6,  preco: 97,  novos: 67,  ativos: 218, mrr: 19457, leads: 322, reat: 27,  qualif: 140, reun: 112, fech: 67 },
  { m: 7,  preco: 110, novos: 81,  ativos: 288, mrr: 27395, leads: 379, reat: 36,  qualif: 169, reun: 135, fech: 81 },
  { m: 8,  preco: 110, novos: 96,  ativos: 370, mrr: 36585, leads: 439, reat: 46,  qualif: 200, reun: 160, fech: 96 },
  { m: 9,  preco: 120, novos: 112, ativos: 463, mrr: 48196, leads: 501, reat: 58,  qualif: 233, reun: 187, fech: 112 },
  { m: 10, preco: 120, novos: 130, ativos: 570, mrr: 61386, leads: 572, reat: 71,  qualif: 271, reun: 217, fech: 130 },
  { m: 11, preco: 130, novos: 150, ativos: 692, mrr: 77817, leads: 651, reat: 85,  qualif: 312, reun: 250, fech: 150 },
  { m: 12, preco: 130, novos: 172, ativos: 829, mrr: 96286, leads: 737, reat: 100, qualif: 358, reun: 287, fech: 172 },
];

/**
 * Premissas de conversao do plano (a validar nos 90 dias).
 * Churn (5%) fica FORA por decisao — nao entra no Previsto vs Real.
 */
export const PREMISSAS = [
  { key: 'qualif',      label: 'Qualificacao',  sub: 'lead → qualificado',     pct: 35 },
  { key: 'agendamento', label: 'Agendamento',   sub: 'qualificado → reuniao',  pct: 80 },
  { key: 'fechamento',  label: 'Fechamento',    sub: 'reuniao → cliente',      pct: 60 },
  { key: 'reativacao',  label: 'Reativacao',    sub: 'sobre o pool',           pct: 20 },
];

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
