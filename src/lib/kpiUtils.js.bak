/**
 * kpiUtils - Funções utilitárias de cálculo de KPIs
 *
 * Extraídas do DashboardPage para reutilização e testabilidade.
 */

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

// ─── Helpers de O.S. ─────────────────────────────────────────────

/** Horas realizadas: usa actualStart->actualEnd (tempo real total), checklist como fallback */
export function calcOSHours(order) {
  // Prioridade 1: diferenca real entre actualStart e actualEnd (mais confiavel)
  if (order.actualStart && order.actualEnd) {
    const diffMs = new Date(order.actualEnd) - new Date(order.actualStart);
    if (diffMs > 0) return diffMs / (1000 * 60 * 60);
  }
  // Prioridade 2: soma do checklist (quando nao tem datas reais)
  const cl = order.checklist || [];
  const totalChecklistMin = cl.reduce((sum, i) => sum + (i.durationMin || 0), 0);
  if (totalChecklistMin > 0) return totalChecklistMin / 60;
  return 0;
}

/** Horas previstas (estimatedStart -> estimatedEnd) em horas reais */
export function calcEstimatedHours(order) {
  if (!order.estimatedStart || !order.estimatedEnd) return 0;
  const start = new Date(order.estimatedStart);
  const end = new Date(order.estimatedEnd);
  const diffMs = end - start;
  if (diffMs <= 0) return 0;
  return diffMs / (1000 * 60 * 60);
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

/** Calcula valor/hora de um membro da equipe */
export function getMemberHourlyRate(member) {
  const salary = parseFloat(member.salaryMonth || member.salary_month || 0);
  const hours = parseFloat(member.hoursMonth || member.hours_month || 176);
  if (salary <= 0 || hours <= 0) return 0;
  return salary / hours;
}

/** Calcula custo total de uma O.S. (mão de obra + gastos materiais) */
export function calcOSCost(order, membersList) {
  const hours = calcOSHours(order);
  const member = membersList.find(m =>
    namesMatch(m.name, order.assignee) || namesMatch(m.name, order.assignedTo)
  );
  const hourlyRate = member ? getMemberHourlyRate(member) : 0;
  const laborCost = hours * hourlyRate;
  const materialCost = (order.expenses || []).reduce((acc, e) => acc + (e.value || 0) * (e.quantity || 1), 0);
  return { hours, hourlyRate, laborCost, materialCost, totalCost: laborCost + materialCost, memberFound: !!member };
}

// ─── Formatação ──────────────────────────────────────────────────

export function formatCurrency(value) {
  const num = parseFloat(value);
  if (isNaN(num)) return 'R$ 0,00';
  return num.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

export function formatLateTime(totalMinutes) {
  if (totalMinutes <= 0) return '0min';
  const hours = Math.floor(totalMinutes / 60);
  const mins = totalMinutes % 60;
  if (hours === 0) return `${mins}min`;
  if (mins === 0) return `${hours}h`;
  return `${hours}h ${mins}min`;
}

export function timeAgo(dateStr) {
  if (!dateStr) return '';
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'agora';
  if (mins < 60) return `ha ${mins}min`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `ha ${hrs}h`;
  const days = Math.floor(hrs / 24);
  if (days === 1) return 'ontem';
  if (days < 7) return `ha ${days} dias`;
  return new Date(dateStr).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' });
}

/** Remove acentos e normaliza texto para comparacao de nomes */
export function normName(str) {
  return (str || '').toLowerCase().trim().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

/** Verifica se dois nomes "batem" (parcial, sem acento) */
export function namesMatch(nameA, nameB) {
  const a = normName(nameA);
  const b = normName(nameB);
  if (!a || !b) return false;
  return a === b || a.includes(b) || b.includes(a);
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

/** Calcula todos os KPIs a partir de uma lista de O.S. e eventos */
export function calcKPIs(ordersList, eventsList, targetHours) {
  const now = new Date();
  const done = ordersList.filter(o => o.status === 'done');
  const doneMonth = done.filter(o => isCurrentMonth(o.actualEnd));
  const doneLastMonth = done.filter(o => isLastMonth(o.actualEnd));
  const inProgress = ordersList.filter(o => o.status === 'in_progress');
  const available = ordersList.filter(o => o.status === 'available');

  // Tempo medio de entrega (dias)
  const deliveryDays = done.map(o => calcDeliveryDays(o)).filter(d => d !== null);
  const avgDelivery = deliveryDays.length > 0 ? deliveryDays.reduce((s, d) => s + d, 0) / deliveryDays.length : 0;
  const deliveryThisMonth = doneMonth.map(o => calcDeliveryDays(o)).filter(d => d !== null);
  const avgDeliveryMonth = deliveryThisMonth.length > 0 ? deliveryThisMonth.reduce((s, d) => s + d, 0) / deliveryThisMonth.length : 0;

  // Taxa de conclusao (mes)
  const totalMes = doneMonth.length + inProgress.length;
  const completionRate = totalMes > 0 ? (doneMonth.length / totalMes) * 100 : 0;

  // Entrega no prazo
  const withEstimate = done.filter(o => o.estimatedEnd && o.actualEnd);
  const onTime = withEstimate.filter(o => calcDelayDays(o) <= 0);
  const onTimeRate = withEstimate.length > 0 ? (onTime.length / withEstimate.length) * 100 : 100;

  // Atraso medio (somente dos atrasados)
  const delays = withEstimate.map(o => calcDelayDays(o)).filter(d => d > 0);
  const avgDelay = delays.length > 0 ? delays.reduce((s, d) => s + d, 0) / delays.length : 0;

  // Horas de reuniao do mes (contam como trabalho)
  const calcMeetingHours = (evts, periodFn) => {
    return evts
      .filter(e => e.type === 'meeting' && e.startDate && e.endDate && periodFn(e.startDate))
      .reduce((sum, e) => {
        const diffMs = new Date(e.endDate) - new Date(e.startDate);
        return sum + Math.max(0, diffMs / 3600000);
      }, 0);
  };
  const meetingHoursMonth = calcMeetingHours(eventsList, isCurrentMonth);
  const meetingHoursLastMonth = calcMeetingHours(eventsList, isLastMonth);

  // Horas do mes (O.S. + reunioes)
  const osHoursMonth = doneMonth.reduce((sum, o) => sum + calcOSHours(o), 0);
  const osHoursLastMonth = doneLastMonth.reduce((sum, o) => sum + calcOSHours(o), 0);
  const hoursMonth = osHoursMonth + meetingHoursMonth;
  const hoursLastMonth = osHoursLastMonth + meetingHoursLastMonth;
  const hoursPercent = targetHours > 0 ? Math.min((hoursMonth / targetHours) * 100, 100) : 0;

  // Produtividade = Horas Previstas / Horas Realizadas * 100
  const dayOfMonth = now.getDate();
  const realizedHours = done.reduce((sum, o) => sum + calcOSHours(o), 0);
  const estimatedHours = done.reduce((sum, o) => sum + calcEstimatedHours(o), 0);
  const productivity = realizedHours > 0 ? (estimatedHours / realizedHours) * 100 : 0;

  // Variacao mes anterior
  const realizedHoursMonth = doneMonth.reduce((sum, o) => sum + calcOSHours(o), 0);
  const estimatedHoursMonth = doneMonth.reduce((sum, o) => sum + calcEstimatedHours(o), 0);
  const productivityMonth = realizedHoursMonth > 0 ? (estimatedHoursMonth / realizedHoursMonth) * 100 : 0;
  const realizedHoursLast = doneLastMonth.reduce((sum, o) => sum + calcOSHours(o), 0);
  const estimatedHoursLast = doneLastMonth.reduce((sum, o) => sum + calcEstimatedHours(o), 0);
  const productivityLast = realizedHoursLast > 0 ? (estimatedHoursLast / realizedHoursLast) * 100 : 0;
  const productivityChange = productivityLast > 0 ? productivityMonth - productivityLast : 0;

  // Carga de trabalho
  const workload = inProgress.length;

  // Utilizacao
  const workDaysSoFar = Math.max(1, Math.floor(dayOfMonth * 5 / 7));
  const availableHoursSoFar = workDaysSoFar * 8;
  const utilization = availableHoursSoFar > 0 ? Math.min((hoursMonth / availableHoursSoFar) * 100, 100) : 0;

  // Taxa de retrabalho
  const doneWithEstimate = done.filter(o => calcEstimatedHours(o) > 0 && calcOSHours(o) > 0);
  const reworkOrders = doneWithEstimate.filter(o => calcOSHours(o) > calcEstimatedHours(o) * 1.3);
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
    hoursMonth,
    hoursLastMonth,
    hoursPercent,
    osHoursMonth,
    meetingHoursMonth,
    productivity: productivity.toFixed(0),
    productivityMonth: productivityMonth.toFixed(0),
    productivityChange: productivityChange.toFixed(0),
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
