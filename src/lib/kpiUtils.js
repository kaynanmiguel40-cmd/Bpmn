/**
 * kpiUtils - Funções utilitárias de cálculo de KPIs
 *
 * Extraídas do DashboardPage para reutilização e testabilidade.
 */

import {
  MS_PER_HOUR,
  HOURS_PER_WORKDAY,
  WORK_DAYS_PER_WEEK,
  DAYS_PER_WEEK,
  REWORK_THRESHOLD,
  WORK_START_HOUR,
  WORK_END_HOUR,
  WORK_HOURS_PER_DAY,
} from '../constants/sla';

// Re-exportar formatters para manter compatibilidade com imports existentes
export { formatCurrency, formatLateTime, timeAgo } from './formatters';

// ─── Helpers de Data ─────────────────────────────────────────────

export function isCurrentMonth(dateStr) {
  if (!dateStr) return false;
  const d = new Date(dateStr);
  const now = new Date();
  return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
}

export function isLastMonth(dateStr) {
  if (!dateStr) return false;
  const d = new Date(dateStr);
  const now = new Date();
  const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  return d.getMonth() === lastMonth.getMonth() && d.getFullYear() === lastMonth.getFullYear();
}

// ─── Helpers de Horas Uteis ──────────────────────────────────────

/** Calcula horas uteis entre duas datas (seg-sex, 09h-18h) */
export function calcWorkingHoursBetween(startStr, endStr) {
  const start = new Date(startStr);
  const end = new Date(endStr);
  if (end <= start) return 0;

  // Mesmo dia
  if (start.toDateString() === end.toDateString()) {
    const day = start.getDay();
    if (day === 0 || day === 6) return 0;
    const s = Math.max(start.getHours() + start.getMinutes() / 60, WORK_START_HOUR);
    const e = Math.min(end.getHours() + end.getMinutes() / 60, WORK_END_HOUR);
    return Math.max(0, e - s);
  }

  // Multiplos dias
  let totalHours = 0;
  const current = new Date(start);

  // Primeiro dia: do inicio ate fim do expediente
  if (current.getDay() !== 0 && current.getDay() !== 6) {
    const s = Math.max(current.getHours() + current.getMinutes() / 60, WORK_START_HOUR);
    totalHours += Math.max(0, WORK_END_HOUR - s);
  }

  // Dias intermediarios: horas uteis por dia
  current.setDate(current.getDate() + 1);
  current.setHours(0, 0, 0, 0);
  const endDay = new Date(end);
  endDay.setHours(0, 0, 0, 0);

  while (current < endDay) {
    const day = current.getDay();
    if (day !== 0 && day !== 6) {
      totalHours += WORK_HOURS_PER_DAY;
    }
    current.setDate(current.getDate() + 1);
  }

  // Ultimo dia: do inicio do expediente ate o fim
  if (end.getDay() !== 0 && end.getDay() !== 6) {
    const e = Math.min(end.getHours() + end.getMinutes() / 60, WORK_END_HOUR);
    totalHours += Math.max(0, e - WORK_START_HOUR);
  }

  return totalHours;
}

// ─── Helpers de O.S. ─────────────────────────────────────────────

/** Calcula minutos trabalhados de um item do checklist (com suporte a pause/resume) */
export function calcChecklistItemMinutes(item) {
  const base = item.accumulatedMin || 0;
  // Concluido: usar accumulatedMin ou fallback para horas uteis (dados antigos)
  if (item.done) {
    if (base > 0) return base;
    if (item.startedAt && item.completedAt) {
      return Math.round(calcWorkingHoursBetween(item.startedAt, item.completedAt) * 60);
    }
    return 0;
  }
  // Pausado: accumulatedMin ja esta atualizado
  if (item.pausedAt) return base;
  // Rodando agora: somar segmento ao vivo
  if (item.startedAt) {
    const liveHours = calcWorkingHoursBetween(item.startedAt, new Date().toISOString());
    return base + Math.round(liveHours * 60);
  }
  return base;
}

/** Horas realizadas: usa time entries (log imutavel) > actualStart/End > checklist */
export function calcOSHours(order) {
  // Prioridade 0: log imutavel de time entries (anti-manipulacao)
  if (Array.isArray(order.timeEntries) && order.timeEntries.length > 0) {
    const totalMin = order.timeEntries
      .filter(e => (e.durationMinutes || e.duration_minutes || 0) > 0)
      .reduce((sum, e) => sum + (e.durationMinutes || e.duration_minutes || 0), 0);
    if (totalMin > 0) return totalMin / 60;
  }
  // Prioridade 1: actualStart/actualEnd (horas uteis, 09-18h seg-sex)
  if (order.actualStart && order.actualEnd) {
    const hours = calcWorkingHoursBetween(order.actualStart, order.actualEnd);
    if (hours > 0) return hours;
  }
  // Prioridade 2: soma real do checklist (accumulatedMin com fallback para horas uteis)
  const cl = order.checklist || [];
  let totalHours = 0;
  for (const item of cl) {
    if (item.accumulatedMin > 0) {
      totalHours += item.accumulatedMin / 60;
    } else if (item.startedAt && item.completedAt) {
      const h = calcWorkingHoursBetween(item.startedAt, item.completedAt);
      if (h > 0) totalHours += h;
    }
  }
  if (totalHours > 0) return totalHours;
  // Prioridade 3: soma de durationMin estimado
  const estimatedMin = cl.reduce((sum, i) => sum + (i.durationMin || 0), 0);
  if (estimatedMin > 0) return estimatedMin / 60;
  return 0;
}

/** Horas previstas (estimatedStart -> estimatedEnd) em horas uteis */
export function calcEstimatedHours(order) {
  if (!order.estimatedStart || !order.estimatedEnd) return 0;
  return calcWorkingHoursBetween(order.estimatedStart, order.estimatedEnd);
}

/** Dias corridos entre duas datas (min 0) */
export function calcDeliveryDays(order) {
  if (!order.actualStart || !order.actualEnd) return null;
  const start = new Date(order.actualStart);
  const end = new Date(order.actualEnd);
  return Math.max(0, Math.round((end - start) / (1000 * 60 * 60 * 24)));
}

/** Dias de atraso (positivo = atrasou, negativo = adiantou) */
export function calcDelayDays(order) {
  if (!order.estimatedEnd || !order.actualEnd) return null;
  const estimated = new Date(order.estimatedEnd);
  const actual = new Date(order.actualEnd);
  return Math.round((actual - estimated) / (1000 * 60 * 60 * 24));
}

// ─── Helpers de Custo ────────────────────────────────────────────

/** Calcula valor/hora de um membro da equipe. Retorna null se salario nao cadastrado. */
export function getMemberHourlyRate(member) {
  if (!member) return null;
  const salary = parseFloat(member.salaryMonth || member.salary_month || 0);
  const hours = parseFloat(member.hoursMonth || member.hours_month || 176);
  if (salary <= 0 || hours <= 0) return null;
  return salary / hours;
}

/** Calcula custo total de uma O.S. (mão de obra + gastos materiais).
 *  salaryMissing = true quando membro existe mas nao tem salario cadastrado. */
export function calcOSCost(order, membersList) {
  const hours = calcOSHours(order);
  const member = membersList.find(m =>
    namesMatch(m.name, order.assignee) || namesMatch(m.name, order.assignedTo)
  );
  const hourlyRate = getMemberHourlyRate(member);
  const salaryMissing = !!member && hourlyRate === null;
  const effectiveRate = hourlyRate || 0;
  const laborCost = hours * effectiveRate;
  const materialCost = (order.expenses || []).reduce((acc, e) => acc + (e.value || 0) * (e.quantity || 1), 0);
  return {
    hours,
    hourlyRate: effectiveRate,
    laborCost,
    materialCost,
    totalCost: laborCost + materialCost,
    memberFound: !!member,
    salaryMissing,
  };
}

/** Conta membros ativos sem salario cadastrado. */
export function countMembersWithoutSalary(membersList) {
  return (membersList || []).filter(m => {
    const salary = parseFloat(m.salaryMonth || m.salary_month || 0);
    return salary <= 0;
  }).length;
}

// ─── Formatação ──────────────────────────────────────────────────
// formatCurrency, formatLateTime e timeAgo foram movidos para src/lib/formatters.js
// e sao re-exportados no topo deste arquivo para manter compatibilidade.

/** Remove acentos e normaliza texto para comparacao de nomes */
export function normName(str) {
  return (str || '').toLowerCase().trim().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

/** Verifica se dois nomes "batem" (parcial, sem acento, ou primeiro+ultimo nome) */
export function namesMatch(nameA, nameB) {
  const a = normName(nameA);
  const b = normName(nameB);
  if (!a || !b) return false;
  if (a === b || a.includes(b) || b.includes(a)) return true;
  // Comparar primeiro+ultimo nome: "kaynan silva" vs "kaynan miguel luper silva"
  const partsA = a.split(/\s+/);
  const partsB = b.split(/\s+/);
  if (partsA.length >= 2 && partsB.length >= 2) {
    const firstLastA = `${partsA[0]} ${partsA[partsA.length - 1]}`;
    const firstLastB = `${partsB[0]} ${partsB[partsB.length - 1]}`;
    if (firstLastA === firstLastB) return true;
  }
  // Comparar só primeiro nome se um dos lados tem apenas 1 parte
  if (partsA[0] === partsB[0] && (partsA.length === 1 || partsB.length === 1)) return true;
  return false;
}

/** Verifica se um nome esta na lista comma-separated de assignees */
export function isAssignedTo(assignedToField, name) {
  if (!assignedToField || !name) return false;
  return assignedToField.split(',').some(s => namesMatch(s.trim(), name));
}

/** Parseia campo comma-separated em array de nomes */
export function parseAssignees(field) {
  if (!field) return [];
  return field.split(',').map(s => s.trim()).filter(Boolean);
}

// ─── Helpers Diversos ────────────────────────────────────────────

export function loadProfileSync() {
  try { return JSON.parse(localStorage.getItem('settings_profile') || '{}'); }
  catch { return {}; }
}

export function findCurrentUser(profile, teamMembers) {
  const fallback = teamMembers[0] || { id: 'default', name: profile?.name || 'Usuario', color: '#3b82f6' };
  if (!profile || !profile.name) return fallback;
  const match = teamMembers.find(m => namesMatch(m.name, profile.name));
  return match || { id: 'self', name: profile.name, color: '#3b82f6' };
}

// ─── Filtro por Período ──────────────────────────────────────────

/** Verifica se uma data string esta dentro de um range [start, end] */
export function isInRange(dateStr, startDate, endDate) {
  if (!dateStr) return false;
  const d = new Date(dateStr);
  const s = new Date(startDate);
  const e = new Date(endDate);
  s.setHours(0, 0, 0, 0);
  e.setHours(23, 59, 59, 999);
  return d >= s && d <= e;
}

/** Filtra ordens e eventos dentro de um range de datas */
export function filterByPeriod(ordersList, eventsList, startDate, endDate) {
  const start = new Date(startDate);
  const end = new Date(endDate);
  start.setHours(0, 0, 0, 0);
  end.setHours(23, 59, 59, 999);

  const filteredOrders = ordersList.filter(o => {
    // Concluídas: actualEnd dentro do range
    if (o.status === 'done' && o.actualEnd) {
      const d = new Date(o.actualEnd);
      return d >= start && d <= end;
    }
    // Em andamento: incluir se actualStart <= endDate
    if (o.status === 'in_progress' && o.actualStart) {
      return new Date(o.actualStart) <= end;
    }
    // Disponíveis: incluir se criada dentro do range
    if (o.status === 'available' && o.createdAt) {
      const d = new Date(o.createdAt);
      return d >= start && d <= end;
    }
    return false;
  });

  const filteredEvents = eventsList.filter(e => {
    if (!e.startDate) return false;
    const d = new Date(e.startDate);
    return d >= start && d <= end;
  });

  return { filteredOrders, filteredEvents };
}

// ─── Cálculo Central de KPIs ─────────────────────────────────────

/**
 * Calcula todos os KPIs a partir de uma lista de O.S. e eventos.
 * @param {Array} ordersList
 * @param {Array} eventsList
 * @param {number} targetHours
 * @param {{ start: string, end: string }|null} dateRange - range customizado (null = mes atual)
 */
export function calcKPIs(ordersList, eventsList, targetHours, dateRange = null) {
  const now = new Date();

  // Funcoes de periodo: usa range customizado ou mes atual/anterior
  const inPeriod = dateRange
    ? (dateStr) => isInRange(dateStr, dateRange.start, dateRange.end)
    : isCurrentMonth;

  // Periodo anterior equivalente (mesma duracao, recuado)
  let prevPeriodFn = isLastMonth;
  if (dateRange) {
    const s = new Date(dateRange.start);
    const e = new Date(dateRange.end);
    const durationMs = e - s;
    const prevEnd = new Date(s.getTime() - 1);
    const prevStart = new Date(prevEnd.getTime() - durationMs);
    prevPeriodFn = (dateStr) => isInRange(dateStr, prevStart.toISOString(), prevEnd.toISOString());
  }

  const done = ordersList.filter(o => o.status === 'done');
  const doneMonth = done.filter(o => inPeriod(o.actualEnd));
  const doneLastMonth = done.filter(o => prevPeriodFn(o.actualEnd));
  const inProgress = ordersList.filter(o => o.status === 'in_progress');
  const available = ordersList.filter(o => o.status === 'available');

  // Tempo medio de entrega (dias)
  const deliveryDays = done.map(o => calcDeliveryDays(o)).filter(d => d !== null);
  const avgDelivery = deliveryDays.length > 0 ? deliveryDays.reduce((s, d) => s + d, 0) / deliveryDays.length : 0;
  const deliveryThisMonth = doneMonth.map(o => calcDeliveryDays(o)).filter(d => d !== null);
  const avgDeliveryMonth = deliveryThisMonth.length > 0 ? deliveryThisMonth.reduce((s, d) => s + d, 0) / deliveryThisMonth.length : 0;

  // Taxa de conclusao (periodo)
  const totalMes = doneMonth.length + inProgress.length;
  const completionRate = totalMes > 0 ? (doneMonth.length / totalMes) * 100 : 0;

  // Entrega no prazo (0% quando sem dados, nao 100%)
  const withEstimate = doneMonth.filter(o => o.estimatedEnd && o.actualEnd);
  const onTime = withEstimate.filter(o => calcDelayDays(o) <= 0);
  const onTimeRate = withEstimate.length > 0 ? (onTime.length / withEstimate.length) * 100 : 0;

  // Atraso medio (somente dos atrasados - dias positivos)
  const delays = withEstimate.map(o => calcDelayDays(o)).filter(d => d > 0);
  const avgDelay = delays.length > 0 ? delays.reduce((s, d) => s + d, 0) / delays.length : 0;

  // Desvio medio de estimativa (considera adiantamentos e atrasos - precisao de estimativa)
  const allDelays = withEstimate.map(o => calcDelayDays(o)).filter(d => d !== null);
  const avgDeviation = allDelays.length > 0 ? allDelays.reduce((s, d) => s + d, 0) / allDelays.length : 0;
  const avgDeviationAbs = allDelays.length > 0 ? allDelays.reduce((s, d) => s + Math.abs(d), 0) / allDelays.length : 0;

  // Horas de reuniao do periodo (horas uteis, consistente com OS)
  const calcMeetingHours = (evts, periodFn) => {
    return evts
      .filter(e => e.type === 'meeting' && e.startDate && e.endDate && periodFn(e.startDate))
      .reduce((sum, e) => {
        return sum + Math.max(0, calcWorkingHoursBetween(e.startDate, e.endDate));
      }, 0);
  };
  const meetingHoursMonth = calcMeetingHours(eventsList, inPeriod);
  const meetingHoursLastMonth = calcMeetingHours(eventsList, prevPeriodFn);

  // Horas do periodo (O.S. + reunioes)
  const osHoursMonth = doneMonth.reduce((sum, o) => sum + calcOSHours(o), 0);
  const osHoursLastMonth = doneLastMonth.reduce((sum, o) => sum + calcOSHours(o), 0);
  const hoursMonth = osHoursMonth + meetingHoursMonth;
  const hoursLastMonth = osHoursLastMonth + meetingHoursLastMonth;
  const hoursPercent = targetHours > 0 ? Math.min((hoursMonth / targetHours) * 100, 100) : 0;

  // Produtividade = Horas Previstas / Horas Realizadas * 100
  // IMPORTANTE: exclui O.S. sem estimativa (evita distorcao por dados faltantes)
  const hasEstimate = (o) => o.estimatedStart && o.estimatedEnd;
  const doneWithEst = done.filter(hasEstimate);
  const realizedHours = doneWithEst.reduce((sum, o) => sum + calcOSHours(o), 0);
  const estimatedHours = doneWithEst.reduce((sum, o) => sum + calcEstimatedHours(o), 0);
  const productivity = realizedHours > 0 ? (estimatedHours / realizedHours) * 100 : 0;
  const productivityMissing = done.length - doneWithEst.length;

  // Variacao periodo anterior (mesma regra: so com estimativa)
  const doneMonthWithEst = doneMonth.filter(hasEstimate);
  const doneLastWithEst = doneLastMonth.filter(hasEstimate);
  const realizedHoursMonth = doneMonthWithEst.reduce((sum, o) => sum + calcOSHours(o), 0);
  const estimatedHoursMonth = doneMonthWithEst.reduce((sum, o) => sum + calcEstimatedHours(o), 0);
  const productivityMonth = realizedHoursMonth > 0 ? (estimatedHoursMonth / realizedHoursMonth) * 100 : 0;
  const realizedHoursLast = doneLastWithEst.reduce((sum, o) => sum + calcOSHours(o), 0);
  const estimatedHoursLast = doneLastWithEst.reduce((sum, o) => sum + calcEstimatedHours(o), 0);
  const productivityLast = realizedHoursLast > 0 ? (estimatedHoursLast / realizedHoursLast) * 100 : 0;
  const productivityChange = productivityLast > 0 ? productivityMonth - productivityLast : 0;
  const productivityMissingMonth = doneMonth.length - doneMonthWithEst.length;

  // Carga de trabalho
  const workload = inProgress.length;

  // Utilizacao: horas uteis reais no range (seg-sex 09-18h com intervalo)
  const rangeStart = dateRange ? new Date(dateRange.start) : new Date(now.getFullYear(), now.getMonth(), 1);
  const rangeEnd = dateRange ? new Date(dateRange.end) : now;
  const rangeStartWork = new Date(rangeStart);
  rangeStartWork.setHours(WORK_START_HOUR, 0, 0, 0);
  const rangeEndWork = new Date(rangeEnd);
  rangeEndWork.setHours(WORK_END_HOUR, 0, 0, 0);
  const rawAvailableHours = calcWorkingHoursBetween(rangeStartWork.toISOString(), rangeEndWork.toISOString());
  // Descontar 1h de intervalo por dia util no range
  const rangeDays = Math.max(1, Math.round((rangeEnd - rangeStart) / (1000 * 60 * 60 * 24)) + 1);
  const workDaysInRange = Math.max(1, Math.floor(rangeDays * WORK_DAYS_PER_WEEK / DAYS_PER_WEEK));
  const availableHoursSoFar = Math.max(1, rawAvailableHours - workDaysInRange);
  const utilization = availableHoursSoFar > 0 ? Math.min((hoursMonth / availableHoursSoFar) * 100, 100) : 0;

  // Taxa de retrabalho (filtrado por periodo, nao global)
  const doneWithEstimate = doneMonth.filter(o => calcEstimatedHours(o) > 0 && calcOSHours(o) > 0);
  const reworkOrders = doneWithEstimate.filter(o => calcOSHours(o) > calcEstimatedHours(o) * REWORK_THRESHOLD);
  const reworkRate = doneWithEstimate.length > 0 ? (reworkOrders.length / doneWithEstimate.length) * 100 : 0;

  // Presenca e pontualidade em reunioes
  const pastMeetings = eventsList.filter(e => e.type === 'meeting' && new Date(e.endDate) < now);
  const attendedMeetings = pastMeetings.filter(e => e.attended === true);
  const punctualMeetings = attendedMeetings.filter(e => !e.wasLate);
  const lateMeetings = attendedMeetings.filter(e => e.wasLate);
  const meetingAttendance = pastMeetings.length > 0 ? (attendedMeetings.length / pastMeetings.length) * 100 : 0;
  const meetingPunctuality = attendedMeetings.length > 0 ? (punctualMeetings.length / attendedMeetings.length) * 100 : 0;
  const totalLateMinutes = lateMeetings.reduce((sum, e) => sum + (parseInt(e.lateMinutes) || 0), 0);

  return {
    avgDelivery: avgDelivery.toFixed(1),
    avgDeliveryMonth: avgDeliveryMonth.toFixed(1),
    completionRate: completionRate.toFixed(0),
    onTimeRate: onTimeRate.toFixed(0),
    avgDelay: avgDelay.toFixed(1),
    avgDeviation: avgDeviation.toFixed(1),
    avgDeviationAbs: avgDeviationAbs.toFixed(1),
    hoursMonth,
    hoursLastMonth,
    hoursPercent,
    osHoursMonth,
    meetingHoursMonth,
    productivity: productivity.toFixed(0),
    productivityMonth: productivityMonth.toFixed(0),
    productivityChange: productivityChange.toFixed(0),
    productivityMissing,
    productivityMissingMonth,
    realizedHours: realizedHoursMonth,
    estimatedHours: estimatedHoursMonth,
    doneMonth: doneMonth.length,
    doneLastMonth: doneLastMonth.length,
    inProgress: inProgress.length,
    available: available.length,
    total: ordersList.length,
    workload,
    utilization: utilization.toFixed(0),
    targetHours,
    totalDone: done.length,
    lateArrivals: lateMeetings.length,
    totalLateMinutes,
    meetingAttendance: meetingAttendance.toFixed(0),
    meetingPunctuality: meetingPunctuality.toFixed(0),
    pastMeetings: pastMeetings.length,
    attendedMeetings: attendedMeetings.length,
    punctualMeetings: punctualMeetings.length,
    reworkRate: reworkRate.toFixed(0),
    reworkCount: reworkOrders.length,
    reworkTotal: doneWithEstimate.length,
  };
}

// ─── Lead Time ────────────────────────────────────────────────────

/** Calcula lead time em horas (criacao ate conclusao) */
export function calcLeadTimeHours(order) {
  if (order.leadTimeHours) return order.leadTimeHours;
  if (order.status !== 'done' || !order.createdAt || !order.actualEnd) return null;
  return (new Date(order.actualEnd) - new Date(order.createdAt)) / (1000 * 60 * 60);
}

/** Calcula lead time medio das ordens concluidas */
export function calcAvgLeadTime(ordersList) {
  const leadTimes = ordersList
    .filter(o => o.status === 'done')
    .map(o => calcLeadTimeHours(o))
    .filter(lt => lt !== null);
  if (leadTimes.length === 0) return 0;
  return leadTimes.reduce((sum, lt) => sum + lt, 0) / leadTimes.length;
}

// ─── SLA ──────────────────────────────────────────────────────────

/** Calcula taxa de cumprimento de SLA */
export function calcSLACompliance(ordersList) {
  const withSLA = ordersList.filter(o => o.status === 'done' && o.slaDeadline && o.actualEnd);
  if (withSLA.length === 0) return { rate: 100, met: 0, total: 0 };
  const met = withSLA.filter(o => new Date(o.actualEnd) <= new Date(o.slaDeadline));
  return {
    rate: Math.round((met.length / withSLA.length) * 100),
    met: met.length,
    total: withSLA.length,
  };
}

// ─── Metricas por Categoria ──────────────────────────────────────

/** Agrupa ordens por categoria e calcula contagens */
export function calcCategoryBreakdown(ordersList) {
  const categories = ['bug', 'feature', 'support', 'compliance', 'campaign', 'internal'];
  const result = {};
  for (const cat of categories) {
    const catOrders = ordersList.filter(o => (o.category || 'internal') === cat);
    const done = catOrders.filter(o => o.status === 'done');
    result[cat] = {
      total: catOrders.length,
      done: done.length,
      inProgress: catOrders.filter(o => o.status === 'in_progress').length,
      avgLeadTime: calcAvgLeadTime(catOrders),
    };
  }
  return result;
}

// ─── Capacidade por Membro ───────────────────────────────────────

/** Calcula horas alocadas vs disponiveis por membro */
export function calcCapacity(ordersList, membersList) {
  return membersList.map(member => {
    const assigned = ordersList.filter(o =>
      o.status === 'in_progress' &&
      (namesMatch(member.name, o.assignee) || namesMatch(member.name, o.assignedTo))
    );
    const allocatedHours = assigned.reduce((sum, o) => sum + calcEstimatedHours(o), 0);
    const availableHours = member.hoursMonth || member.hours_month || 176;
    return {
      id: member.id,
      name: member.name,
      color: member.color || '#3b82f6',
      allocatedHours,
      availableHours,
      utilization: availableHours > 0 ? Math.round((allocatedHours / availableHours) * 100) : 0,
      activeOrders: assigned.length,
    };
  });
}
