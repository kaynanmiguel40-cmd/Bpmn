/**
 * salesCadence.js — Cadencia da meta mensal de vendas (previsto vs realizado).
 *
 * Modulo PURO (sem I/O). Desdobra a meta do mes em dia e semana, calcula o
 * ritmo esperado ate hoje (pro-rata por DIAS UTEIS), classifica o status
 * (acima / dentro / abaixo do esperado) e estima o esforco necessario pra
 * recuperar um atraso.
 *
 * Usado no Comparativo do CRM. Dias uteis = seg-sex: sabado e domingo nao
 * contam porque venda fecha em dia util e e o que importa pro ritmo da reuniao.
 */

/** Conta dias uteis (seg-sex) entre dois Date, inclusive. 0 se range invalido. */
export function countBusinessDays(start, end) {
  if (!start || !end || end < start) return 0;
  let count = 0;
  const cur = new Date(start.getFullYear(), start.getMonth(), start.getDate());
  const last = new Date(end.getFullYear(), end.getMonth(), end.getDate());
  while (cur <= last) {
    const dow = cur.getDay();
    if (dow !== 0 && dow !== 6) count++;
    cur.setDate(cur.getDate() + 1);
  }
  return count;
}

/** Classifica o ritmo (realizado / previsto-ate-hoje) em 4 faixas. */
export function classifyStatus(ratio) {
  if (ratio >= 1.05) return { key: 'acima', label: 'Acima do esperado', tone: 'emerald' };
  if (ratio >= 0.9) return { key: 'dentro', label: 'Dentro do esperado', tone: 'blue' };
  if (ratio >= 0.7) return { key: 'abaixo_leve', label: 'Levemente abaixo', tone: 'amber' };
  return { key: 'abaixo', label: 'Abaixo do esperado', tone: 'rose' };
}

function round2(n) {
  return Math.round((n + Number.EPSILON) * 100) / 100;
}

/**
 * Monta a cadencia da meta do mes.
 *
 * @param {Object} p
 * @param {Date}   p.monthStart      primeiro dia do mes (00:00)
 * @param {Date}   p.monthEnd        ultimo dia do mes (23:59:59)
 * @param {Date}   p.now             agora
 * @param {number} p.target          meta do mes (nº de vendas ou R$ de MRR)
 * @param {Array}  p.deals           deals ganhos no mes: [{ closedAt: ISO, mrr, value }]
 * @param {(d:Object)=>number} [p.weigh]  quanto cada deal soma (1 p/ contar vendas, d.mrr p/ MRR)
 * @returns {Object} cadencia completa (cards, series diaria/semanal, recuperacao)
 */
export function buildMonthlyCadence({ monthStart, monthEnd, now, target = 0, deals = [], weigh = () => 1 }) {
  const daysInMonth = monthEnd.getDate();
  const businessDaysTotal = countBusinessDays(monthStart, monthEnd);

  // "Hoje" travado dentro do mes: mes futuro -> inicio; mes passado -> fim.
  const clampedNow = now > monthEnd ? monthEnd : now < monthStart ? monthStart : now;
  const monthOngoing = now >= monthStart && now <= monthEnd;
  const businessDaysElapsed = countBusinessDays(monthStart, clampedNow);
  const businessDaysRemaining = Math.max(0, businessDaysTotal - businessDaysElapsed);

  // Deals validos do mes, ordenados por data de fechamento.
  const dealsInMonth = deals
    .map(d => ({ ...d, _date: new Date(d.closedAt) }))
    .filter(d => !isNaN(d._date) && d._date >= monthStart && d._date <= monthEnd)
    .sort((a, b) => a._date - b._date);

  const realizedToDate = dealsInMonth
    .filter(d => d._date <= clampedNow)
    .reduce((s, d) => s + weigh(d), 0);
  const dealsToDate = dealsInMonth.filter(d => d._date <= clampedNow).length;

  // Previsto ate hoje = pro-rata por dias uteis decorridos.
  const expectedToDate = businessDaysTotal > 0 ? target * (businessDaysElapsed / businessDaysTotal) : 0;

  const statusRatio = expectedToDate > 0 ? realizedToDate / expectedToDate : realizedToDate > 0 ? 2 : 1;
  const status = classifyStatus(statusRatio);

  // Esforco pra recuperar o atraso.
  const remaining = Math.max(0, target - realizedToDate);
  const plannedDailyPace = businessDaysTotal > 0 ? target / businessDaysTotal : 0;
  const requiredDailyPace = businessDaysRemaining > 0 ? remaining / businessDaysRemaining : remaining > 0 ? Infinity : 0;
  const extraEffortPct =
    plannedDailyPace > 0 && isFinite(requiredDailyPace) ? Math.round((requiredDailyPace / plannedDailyPace - 1) * 100) : null;
  const behindBy = Math.max(0, expectedToDate - realizedToDate);

  const recovery = {
    remaining: round2(remaining),
    behindBy: round2(behindBy),
    businessDaysRemaining,
    plannedDailyPace: round2(plannedDailyPace),
    requiredDailyPace: isFinite(requiredDailyPace) ? round2(requiredDailyPace) : Infinity,
    extraEffortPct,
    achieved: realizedToDate >= target && target > 0,
    onTrack: realizedToDate >= expectedToDate,
    impossible: businessDaysRemaining === 0 && remaining > 0,
  };

  // Serie diaria acumulada (previsto vs realizado) por dia do mes.
  const dailySeries = [];
  let acc = 0;
  let di = 0;
  for (let day = 1; day <= daysInMonth; day++) {
    const dayEnd = new Date(monthStart.getFullYear(), monthStart.getMonth(), day, 23, 59, 59, 999);
    const bizUpTo = countBusinessDays(monthStart, dayEnd);
    const expectedAcc = businessDaysTotal > 0 ? target * (bizUpTo / businessDaysTotal) : 0;
    while (di < dealsInMonth.length && dealsInMonth[di]._date <= dayEnd) {
      acc += weigh(dealsInMonth[di]);
      di++;
    }
    const isFutureDay = monthOngoing && dayEnd > clampedNow;
    dailySeries.push({ day, expected: round2(expectedAcc), realized: isFutureDay ? null : round2(acc) });
  }

  // Serie semanal: semana = blocos de 7 dias do mes. Meta semanal pro-rata dias uteis.
  const weeksCount = Math.ceil(daysInMonth / 7);
  const weeklySeries = [];
  for (let w = 1; w <= weeksCount; w++) {
    const firstDay = (w - 1) * 7 + 1;
    const lastDay = Math.min(w * 7, daysInMonth);
    const wStart = new Date(monthStart.getFullYear(), monthStart.getMonth(), firstDay, 0, 0, 0, 0);
    const wEnd = new Date(monthStart.getFullYear(), monthStart.getMonth(), lastDay, 23, 59, 59, 999);
    const bizInWeek = countBusinessDays(wStart, wEnd);
    const weekTarget = businessDaysTotal > 0 ? target * (bizInWeek / businessDaysTotal) : 0;
    const realizedWeek = dealsInMonth
      .filter(d => d._date >= wStart && d._date <= wEnd && d._date <= clampedNow)
      .reduce((s, d) => s + weigh(d), 0);
    const isCurrent = monthOngoing && clampedNow >= wStart && clampedNow <= wEnd;
    const isFuture = monthOngoing && wStart > clampedNow;
    weeklySeries.push({
      week: w,
      label: `S${w}`,
      rangeLabel: `${firstDay}–${lastDay}`,
      target: round2(weekTarget),
      realized: round2(realizedWeek),
      isCurrent,
      isFuture,
    });
  }

  return {
    daysInMonth,
    businessDaysTotal,
    businessDaysElapsed,
    businessDaysRemaining,
    monthTarget: target,
    realizedToDate: round2(realizedToDate),
    expectedToDate: round2(expectedToDate),
    dealsToDate,
    statusRatio,
    status,
    recovery,
    dailySeries,
    weeklySeries,
  };
}
