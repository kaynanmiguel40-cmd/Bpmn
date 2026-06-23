/**
 * operationalReportService - Relatório Operacional Diário por SETOR.
 *
 * Espelha o relatório diário do comercial, mas pra OPERAÇÃO: a unidade é a
 * TAREFA da O.S. (não o lead) e a agregação é por SETOR DO TRABALHO
 * (O.S. → projeto → setor), não pela pessoa que executou.
 *
 * On-the-fly (sem snapshot): varre as O.S. e soma as métricas do dia. Como o
 * histórico (completedAt/reviewStatus) não muda, o relatório de um dia passado
 * fica estável.
 *
 * NÃO depende do módulo CRM — lê só o sistema de O.S. (osService).
 */

import { getOSOrders, getOSProjects, getOSSectors } from './osService';
import { calcChecklistItemMinutes } from './kpiUtils';

const SEM_SETOR = '__sem_setor__';

const dayKeyOf = (iso) => {
  if (!iso) return null;
  const d = new Date(iso);
  if (isNaN(d.getTime())) return null;
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

// "Relógio de parede": dueAt é rotulado UTC (a hora escolhida, ex.: 18:00) →
// componentes UTC; completedAt é UTC REAL → componentes LOCAIS. Sem isso o
// offset do fuso falsearia o "no prazo".
const wallMs = (iso, asUtc) => {
  const d = new Date(iso); if (isNaN(d.getTime())) return NaN;
  return asUtc
    ? Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate(), d.getUTCHours(), d.getUTCMinutes())
    : Date.UTC(d.getFullYear(), d.getMonth(), d.getDate(), d.getHours(), d.getMinutes());
};

/**
 * @param {string} date - 'YYYY-MM-DD'
 * @returns {Promise<{ date, sectors: object[], totals: object }>}
 */
export async function getOperationalDailyReport(date) {
  const empty = { date, sectors: [], totals: { tasksDone: 0, deliveries: 0, timeMin: 0, osDone: 0, qualityAvg: null, disputes: 0, disputesOpen: 0, disputesKept: 0, disputesChanged: 0 } };
  if (!date) return empty;

  const [orders, projects, sectors] = await Promise.all([getOSOrders(), getOSProjects(), getOSSectors()]);
  const projById = {}; for (const p of (projects || [])) projById[p.id] = p;
  const secById = {}; for (const s of (sectors || [])) secById[s.id] = s;

  // Setor do TRABALHO: O.S. → projeto → setor (dbToOSProject: project.sector = sector_id).
  const sectorOf = (order) => {
    const proj = order.projectId ? projById[order.projectId] : null;
    const secId = proj?.sector || null;
    const sec = secId ? secById[secId] : null;
    return { id: secId || SEM_SETOR, label: sec?.label || 'Sem setor', color: sec?.color || '#94a3b8' };
  };

  const agg = new Map();
  const bump = (sec) => {
    if (!agg.has(sec.id)) {
      agg.set(sec.id, {
        sectorId: sec.id, label: sec.label, color: sec.color,
        tasksDone: 0, deliveries: 0, timeMin: 0,
        onTime: 0, late: 0, reviewed: 0, approved: 0, changes: 0,
        osDone: 0,
        // Qualidade (nota) + contestações arbitradas pelo Juiz
        qualitySum: 0, qualityCount: 0,
        disputes: 0, disputesOpen: 0, disputesKept: 0, disputesChanged: 0,
        judges: new Set(),
      });
    }
    return agg.get(sec.id);
  };

  for (const order of (orders || [])) {
    const sec = sectorOf(order);
    const cl = Array.isArray(order.checklist) ? order.checklist : [];

    for (const item of cl) {
      if (!item.done || !item.completedAt) continue;
      if (dayKeyOf(item.completedAt) !== date) continue;
      const m = bump(sec);
      m.tasksDone++;
      if (item.delivery) m.deliveries++;
      m.timeMin += calcChecklistItemMinutes(item) || 0;
      if (item.dueAt) {
        if (wallMs(item.completedAt, false) <= wallMs(item.dueAt, true)) m.onTime++; else m.late++;
      }
      if (item.reviewStatus === 'approved') { m.reviewed++; m.approved++; }
      else if (item.reviewStatus === 'changes') { m.reviewed++; m.changes++; }

      // Nota de qualidade (0–100) — média ponderada do checklist do supervisor.
      if (typeof item.qualityPct === 'number') { m.qualitySum += item.qualityPct; m.qualityCount++; }

      // Contestação da nota → arbitrada pelo Juiz (mantida / ajustada / em aberto).
      const disp = item.qualityDispute;
      if (disp) {
        m.disputes++;
        if (disp.status === 'open') m.disputesOpen++;
        else if (disp.outcome === 'changed') m.disputesChanged++;
        else if (disp.outcome === 'kept') m.disputesKept++;
        if (disp.resolvedBy) m.judges.add(disp.resolvedBy);
      }
    }

    // O.S. concluída no dia (status done + data de conclusão real no dia).
    if (order.status === 'done' && dayKeyOf(order.actualEnd) === date) bump(sec).osDone++;
  }

  const sectorsOut = [...agg.values()]
    .map(m => ({
      ...m,
      onTimePct: (m.onTime + m.late) > 0 ? Math.round((m.onTime / (m.onTime + m.late)) * 100) : null,
      approvedPct: m.reviewed > 0 ? Math.round((m.approved / m.reviewed) * 100) : null,
      qualityAvg: m.qualityCount > 0 ? Math.round(m.qualitySum / m.qualityCount) : null,
      judges: [...m.judges],
    }))
    .sort((a, b) => b.tasksDone - a.tasksDone);

  const totals = sectorsOut.reduce((acc, s) => ({
    tasksDone: acc.tasksDone + s.tasksDone,
    deliveries: acc.deliveries + s.deliveries,
    timeMin: acc.timeMin + s.timeMin,
    osDone: acc.osDone + s.osDone,
    qualitySum: acc.qualitySum + s.qualitySum,
    qualityCount: acc.qualityCount + s.qualityCount,
    disputes: acc.disputes + s.disputes,
    disputesOpen: acc.disputesOpen + s.disputesOpen,
    disputesKept: acc.disputesKept + s.disputesKept,
    disputesChanged: acc.disputesChanged + s.disputesChanged,
  }), { tasksDone: 0, deliveries: 0, timeMin: 0, osDone: 0, qualitySum: 0, qualityCount: 0, disputes: 0, disputesOpen: 0, disputesKept: 0, disputesChanged: 0 });
  totals.qualityAvg = totals.qualityCount > 0 ? Math.round(totals.qualitySum / totals.qualityCount) : null;

  return { date, sectors: sectorsOut, totals };
}
