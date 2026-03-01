/**
 * EAP Scheduling - Auto-agendamento, predecessoras e validacao de dependencias.
 *
 * Extraido de eapService.js (linhas 777-1001).
 */

import { calcEndDate, toDate, formatLocalDateTime } from './calculations';

// ==================== HELPERS ====================

/** Formata Date para "YYYY-MM-DD" usando horario local */
function formatLocalDate(d) {
  const pad = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

/** Adiciona dias uteis a uma data (positivo = futuro, negativo = passado). */
function addWorkDaysToDate(dateStr, days) {
  if (!dateStr || days === 0) return dateStr;
  const date = toDate(dateStr);
  let remaining = Math.abs(days);
  const direction = days > 0 ? 1 : -1;

  while (remaining > 0) {
    date.setDate(date.getDate() + direction);
    const day = date.getDay();
    if (day !== 0 && day !== 6) {
      remaining--;
    }
  }

  if (dateStr.includes('T')) {
    return formatLocalDateTime(date);
  }
  return formatLocalDate(date);
}

// ==================== VALIDACAO DE DEPENDENCIAS ====================

/**
 * Detecta se adicionar as predecessoras criaria um ciclo.
 * Retorna true se detectar ciclo.
 */
export function detectCircularDependency(taskId, newPredecessors, allTasks) {
  if (!newPredecessors || newPredecessors.length === 0) return false;

  const taskMap = new Map(allTasks.map(t => [t.id, t]));

  function canReach(fromId, targetId, visited = new Set()) {
    if (fromId === targetId) return true;
    if (visited.has(fromId)) return false;
    visited.add(fromId);

    const task = taskMap.get(fromId);
    if (!task || !task.predecessors) return false;

    for (const pred of task.predecessors) {
      if (canReach(pred.taskId, targetId, visited)) return true;
    }
    return false;
  }

  for (const pred of newPredecessors) {
    if (pred.taskId === taskId) return true;
    if (canReach(pred.taskId, taskId, new Set())) return true;
  }

  return false;
}

// ==================== PREDECESSORAS ====================

// Mapa interno→PT e PT→interno para tipos de predecessora
const TYPE_TO_PT = { FS: 'FI', SS: 'II', FF: 'TT', SF: 'IF' };
const PT_TO_TYPE = { FI: 'FS', II: 'SS', TT: 'FF', IF: 'SF', FF: 'FF', FS: 'FS', SS: 'SS', SF: 'SF' };

/**
 * Formata predecessoras para exibicao na tabela (em portugues).
 */
export function formatPredecessors(predecessors, taskRowMap) {
  if (!predecessors || predecessors.length === 0) return '';
  return predecessors.map(p => {
    const row = taskRowMap.get(p.taskId);
    if (row === undefined) return '';
    const type = p.type || 'FS';
    const ptType = TYPE_TO_PT[type] || 'FI';
    const lag = p.lag || 0;
    let str = String(row);
    if (ptType !== 'FI') str += ptType;
    if (lag > 0) str += '+' + lag + 'd';
    else if (lag < 0) str += lag + 'd';
    return str;
  }).filter(Boolean).join(';');
}

/**
 * Parseia texto de predecessoras para o formato interno.
 */
export function parsePredecessors(text, rowTaskMap) {
  if (!text || !text.trim()) return [];
  const parts = text.split(/[;,]/);
  const result = [];
  for (const part of parts) {
    const m = part.trim().match(/^(\d+)\s*(FI|II|TT|IF|FF|FS|SS|SF)?\s*([+-]\d+)?\s*d?\s*$/i);
    if (!m) continue;
    const row = parseInt(m[1], 10);
    const rawType = (m[2] || 'FI').toUpperCase();
    const type = PT_TO_TYPE[rawType] || 'FS';
    const lag = m[3] ? parseInt(m[3], 10) : 0;
    const taskId = rowTaskMap.get(row);
    if (taskId) result.push({ taskId, type, lag });
  }
  return result;
}

// ==================== AUTO-SCHEDULING ====================

/**
 * Auto-agenda tarefas baseado em suas predecessoras (igual MS Project).
 * Usa ordenacao topologica (Kahn's) para garantir propagacao correta.
 * Retorna array de { id, startDate, endDate } para update.
 */
export function autoScheduleTasks(tasks) {
  const taskMap = new Map(tasks.map(t => [t.id, { ...t }]));

  // Topological Sort (Kahn's)
  const inDegree = new Map();
  const successors = new Map();
  for (const t of tasks) {
    inDegree.set(t.id, 0);
    successors.set(t.id, []);
  }
  for (const t of tasks) {
    if (!t.predecessors) continue;
    for (const pred of t.predecessors) {
      if (!taskMap.has(pred.taskId)) continue;
      inDegree.set(t.id, (inDegree.get(t.id) || 0) + 1);
      successors.get(pred.taskId)?.push(t.id);
    }
  }
  const queue = [];
  for (const [id, deg] of inDegree) {
    if (deg === 0) queue.push(id);
  }
  const topoOrder = [];
  while (queue.length > 0) {
    const id = queue.shift();
    topoOrder.push(id);
    for (const succId of (successors.get(id) || [])) {
      const newDeg = (inDegree.get(succId) || 1) - 1;
      inDegree.set(succId, newDeg);
      if (newDeg === 0) queue.push(succId);
    }
  }
  if (topoOrder.length < tasks.length) {
    console.warn('[EAP] Dependencia circular detectada no auto-scheduling. Tarefas ciclicas serao ignoradas no agendamento.');
    for (const t of tasks) {
      if (!topoOrder.includes(t.id)) topoOrder.push(t.id);
    }
  }

  // Propagar datas em ordem topologica
  const updates = [];

  for (const id of topoOrder) {
    const task = taskMap.get(id);
    if (!task || !task.predecessors || task.predecessors.length === 0) continue;

    let maxStartDate = null;
    let maxStartStr = null;

    for (const pred of task.predecessors) {
      const predTask = taskMap.get(pred.taskId);
      if (!predTask) continue;

      const type = pred.type || 'FS';
      const lag = pred.lag || 0;
      let newStartStr;

      if (type === 'FS') {
        if (!predTask.endDate) continue;
        newStartStr = addWorkDaysToDate(predTask.endDate, 1 + lag);
      } else if (type === 'SS') {
        if (!predTask.startDate) continue;
        newStartStr = lag === 0 ? predTask.startDate : addWorkDaysToDate(predTask.startDate, lag);
      } else if (type === 'FF') {
        if (!predTask.endDate) continue;
        const dur = task.durationDays || 1;
        const targetEnd = addWorkDaysToDate(predTask.endDate, lag);
        newStartStr = addWorkDaysToDate(targetEnd, -(dur - 1));
      } else if (type === 'SF') {
        if (!predTask.startDate) continue;
        const dur = task.durationDays || 1;
        const targetEnd = addWorkDaysToDate(predTask.startDate, lag);
        newStartStr = addWorkDaysToDate(targetEnd, -(dur - 1));
      }

      if (newStartStr) {
        const d = toDate(newStartStr);
        if (!maxStartDate || d > maxStartDate) {
          maxStartDate = d;
          maxStartStr = newStartStr;
        }
      }
    }

    if (maxStartStr) {
      const newStart = maxStartStr.includes('T')
        ? maxStartStr.split('T')[0] + 'T08:00'
        : maxStartStr;
      const newEnd = calcEndDate(newStart, task.durationDays || 1);

      const curDatePart = (task.startDate || '').split('T')[0];
      const newDatePart = newStart.split('T')[0];
      if (newDatePart !== curDatePart) {
        updates.push({ id: task.id, startDate: newStart, endDate: newEnd });
        task.startDate = newStart;
        task.endDate = newEnd;
      }
    }
  }

  return updates;
}
