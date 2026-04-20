/**
 * Constantes de SLA, tempo e metricas.
 *
 * Centraliza magic numbers que antes estavam em osService.js,
 * kpiUtils.js, AgendaPage.jsx e reportGenerator.js.
 */

// ─── SLA por Prioridade ─────────────────────────────────────────

/** Horas de SLA para cada nivel de prioridade */
export const SLA_HOURS = {
  urgent: 4,     // 4 horas
  high: 24,      // 1 dia
  medium: 72,    // 3 dias
  low: 168,      // 7 dias (1 semana)
};

/** SLA padrao quando prioridade nao e reconhecida */
export const DEFAULT_SLA_HOURS = 72;

// ─── Constantes de Tempo ────────────────────────────────────────

export const MS_PER_HOUR = 3_600_000;
export const MS_PER_MINUTE = 60_000;
export const MS_PER_DAY = 86_400_000;
export const HOURS_PER_WORKDAY = 8;
export const WORK_DAYS_PER_WEEK = 5;
export const DAYS_PER_WEEK = 7;

// ─── Horario Comercial ──────────────────────────────────────────

export const WORK_START_HOUR = 9;
export const WORK_END_HOUR = 18;
export const WORK_HOURS_PER_DAY = WORK_END_HOUR - WORK_START_HOUR - 1; // 8h uteis (9h-18h com 1h intervalo)

// ─── Metas Mensais ──────────────────────────────────────────────

/** Horas mensais padrao (22 dias x 8h) */
export const STANDARD_MONTHLY_HOURS = 176;

// ─── Metricas / Thresholds ──────────────────────────────────────

/** Se horas reais > horas estimadas * REWORK_THRESHOLD, conta como retrabalho */
export const REWORK_THRESHOLD = 1.3;

// ─── Peso de Prioridade (para sorting) ──────────────────────────

/** Peso numerico para ordenacao: menor = mais urgente */
export const PRIORITY_WEIGHT = { urgent: 0, high: 1, medium: 2, low: 3 };

/** Peso fallback para prioridades desconhecidas */
export const UNKNOWN_PRIORITY_WEIGHT = 9;
