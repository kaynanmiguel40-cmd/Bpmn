/**
 * EAP Calculations - Algoritmos, datas, arvore e CPM.
 *
 * Extraido de eapService.js (linhas 353-775).
 * Inclui: CPM, WBS, summary dates, tree, calcEndDate, calcDuration, calcWorkHours.
 */

// ==================== HELPERS DE DATA ====================

/** Formata Date para "YYYY-MM-DD" usando horario local */
function formatLocalDate(d) {
  const pad = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

/** Formata Date para "YYYY-MM-DDTHH:MM" usando horario local */
export function formatLocalDateTime(d) {
  const pad = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

/** Normaliza string de data para Date (suporta "YYYY-MM-DD" e "YYYY-MM-DDTHH:MM") */
export function toDate(str) {
  if (!str) return null;
  if (str.includes('T')) return new Date(str);
  return new Date(str + 'T00:00:00');
}

// ==================== UTILIDADES EAP ====================

/**
 * Recalcula a numeracao WBS para todas as tarefas de um projeto.
 * Retorna array de { id, wbsNumber } para update em batch.
 */
export function recalculateWBS(tasks) {
  const sorted = [...tasks].sort((a, b) => {
    if ((a.level || 0) !== (b.level || 0)) return (a.level || 0) - (b.level || 0);
    return (a.sortOrder || 0) - (b.sortOrder || 0);
  });
  const counters = {};
  const wbsMap = new Map();
  const updates = [];

  for (const task of sorted) {
    const parentKey = task.parentId || 'root';
    if (!counters[parentKey]) counters[parentKey] = 0;
    counters[parentKey]++;

    let wbs;
    if (!task.parentId) {
      wbs = String(counters[parentKey]);
    } else {
      const parentWbs = wbsMap.get(task.parentId) || '';
      wbs = parentWbs ? `${parentWbs}.${counters[parentKey]}` : String(counters[parentKey]);
    }

    wbsMap.set(task.id, wbs);
    updates.push({ id: task.id, wbsNumber: wbs });
  }
  return updates;
}

/**
 * Calcula datas resumo de uma tarefa pai baseado nos filhos.
 */
export function calculateSummaryDates(parentId, tasks) {
  const children = tasks.filter(t => t.parentId === parentId);
  if (children.length === 0) return null;

  const allDates = [];
  for (const child of children) {
    const start = child.startDate ? new Date(child.startDate) : null;
    const end = child.endDate ? new Date(child.endDate) : null;
    if (start && !isNaN(start)) allDates.push({ start, end: end && !isNaN(end) ? end : start });
    else if (end && !isNaN(end)) allDates.push({ start: end, end });
  }

  if (allDates.length === 0) return null;

  const minStart = new Date(Math.min(...allDates.map(d => d.start)));
  const maxEnd = new Date(Math.max(...allDates.map(d => d.end)));
  const durationMs = maxEnd - minStart;
  const durationDays = Math.max(1, Math.ceil(durationMs / (1000 * 60 * 60 * 24)));

  let totalWeight = 0;
  let weightedProgress = 0;
  for (const child of children) {
    const w = child.durationDays || 1;
    totalWeight += w;
    weightedProgress += (child.progress || 0) * w;
  }
  const progress = totalWeight > 0 ? Math.round(weightedProgress / totalWeight) : 0;

  const totalHours = children.reduce((sum, c) => sum + (c.estimatedHours ?? (c.durationDays || 1) * 8), 0);

  return {
    startDate: formatLocalDateTime(minStart),
    endDate: formatLocalDateTime(maxEnd),
    durationDays,
    estimatedHours: parseFloat(totalHours.toFixed(2)),
    progress,
  };
}

/**
 * CPM - Critical Path Method (igual MS Project).
 * Forward Pass → Backward Pass → Float → Critical = float 0.
 */
export function calculateCriticalPath(tasks) {
  const critical = new Set();
  if (tasks.length === 0) return critical;

  const parentIds = new Set(tasks.filter(t => t.parentId).map(t => t.parentId));
  const workTasks = tasks.filter(t => !parentIds.has(t.id));
  if (workTasks.length === 0) return critical;

  const taskMap = new Map(workTasks.map(t => [t.id, t]));

  // Construir grafo de sucessores
  const successors = new Map();
  for (const t of workTasks) {
    successors.set(t.id, []);
  }
  for (const t of workTasks) {
    if (!t.predecessors) continue;
    for (const pred of t.predecessors) {
      if (!taskMap.has(pred.taskId)) continue;
      const arr = successors.get(pred.taskId);
      if (arr) arr.push({ taskId: t.id, type: pred.type || 'FS', lag: pred.lag || 0 });
    }
  }

  // Topological Sort (Kahn's)
  const inDegree = new Map();
  for (const t of workTasks) {
    inDegree.set(t.id, 0);
  }
  for (const t of workTasks) {
    if (!t.predecessors) continue;
    for (const pred of t.predecessors) {
      if (taskMap.has(pred.taskId)) {
        inDegree.set(t.id, (inDegree.get(t.id) || 0) + 1);
      }
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
    for (const succ of (successors.get(id) || [])) {
      const newDeg = (inDegree.get(succ.taskId) || 1) - 1;
      inDegree.set(succ.taskId, newDeg);
      if (newDeg === 0) queue.push(succ.taskId);
    }
  }

  if (topoOrder.length < workTasks.length) {
    console.warn('[EAP] Dependencia circular detectada no calculo do caminho critico.');
    for (const t of workTasks) {
      if (!topoOrder.includes(t.id)) topoOrder.push(t.id);
    }
  }

  // Forward Pass (ES, EF)
  const baseDate = new Date('2020-01-01T00:00:00');
  const toDay = (dateStr) => {
    if (!dateStr) return 0;
    return Math.round((new Date(dateStr.includes('T') ? dateStr : dateStr + 'T00:00:00') - baseDate) / 86400000);
  };

  const ES = new Map();
  const EF = new Map();

  for (const id of topoOrder) {
    const t = taskMap.get(id);
    const dur = t.durationDays || 1;
    let es = toDay(t.startDate);

    if (t.predecessors && t.predecessors.length > 0) {
      for (const pred of t.predecessors) {
        const pt = taskMap.get(pred.taskId);
        if (!pt) continue;
        const pES = ES.get(pred.taskId) ?? toDay(pt.startDate);
        const pEF = EF.get(pred.taskId) ?? (pES + (pt.durationDays || 1));
        const type = pred.type || 'FS';
        const lag = pred.lag || 0;

        let candidate;
        if (type === 'FS')      candidate = pEF + lag;
        else if (type === 'SS') candidate = pES + lag;
        else if (type === 'FF') candidate = pEF + lag - dur;
        else if (type === 'SF') candidate = pES + lag - dur;
        else                    candidate = pEF + lag;

        if (candidate > es) es = candidate;
      }
    }

    ES.set(id, es);
    EF.set(id, es + dur);
  }

  // Backward Pass (LS, LF)
  let projectEnd = 0;
  for (const ef of EF.values()) {
    if (ef > projectEnd) projectEnd = ef;
  }

  const LS = new Map();
  const LF = new Map();

  for (const t of workTasks) {
    const dur = t.durationDays || 1;
    LF.set(t.id, projectEnd);
    LS.set(t.id, projectEnd - dur);
  }

  for (let i = topoOrder.length - 1; i >= 0; i--) {
    const id = topoOrder[i];
    const t = taskMap.get(id);
    const dur = t.durationDays || 1;
    let lf = projectEnd;

    const succs = successors.get(id) || [];
    if (succs.length > 0) {
      for (const succ of succs) {
        const sLS = LS.get(succ.taskId);
        const sLF = LF.get(succ.taskId);
        if (sLS === undefined) continue;
        const type = succ.type || 'FS';
        const lag = succ.lag || 0;

        let candidate;
        if (type === 'FS')      candidate = sLS - lag;
        else if (type === 'SS') candidate = sLS - lag + dur;
        else if (type === 'FF') candidate = sLF - lag;
        else if (type === 'SF') candidate = sLF - lag + dur;
        else                    candidate = sLS - lag;

        if (candidate < lf) lf = candidate;
      }
    }

    LF.set(id, lf);
    LS.set(id, lf - dur);
  }

  // Float & Critical
  for (const id of topoOrder) {
    const es = ES.get(id) ?? 0;
    const ls = LS.get(id) ?? 0;
    const totalFloat = ls - es;

    if (totalFloat <= 0) {
      critical.add(id);
      const t = taskMap.get(id);
      if (t && t.parentId) {
        critical.add(t.parentId);
        let pid = t.parentId;
        while (pid) {
          critical.add(pid);
          const parent = tasks.find(pt => pt.id === pid);
          pid = parent ? parent.parentId : null;
        }
      }
    }
  }

  return critical;
}

/**
 * Gera a arvore hierarquica de tarefas (flat list → nested).
 */
export function buildTaskTree(tasks) {
  const sorted = [...tasks].sort((a, b) => a.sortOrder - b.sortOrder);
  const map = new Map();
  const roots = [];

  for (const task of sorted) {
    map.set(task.id, { ...task, children: [] });
  }

  for (const task of sorted) {
    const node = map.get(task.id);
    if (task.parentId && map.has(task.parentId)) {
      map.get(task.parentId).children.push(node);
    } else {
      roots.push(node);
    }
  }

  return roots;
}

/**
 * Flatten da arvore para lista ordenada visualmente.
 */
export function flattenTree(tree, collapsedIds = new Set()) {
  const result = [];

  function walk(nodes) {
    for (const node of nodes) {
      result.push(node);
      if (node.children.length > 0 && !collapsedIds.has(node.id)) {
        walk(node.children);
      }
    }
  }

  walk(tree);
  return result;
}

/**
 * Calcula a data de fim baseada na data de inicio e duracao (dias uteis).
 */
export function calcEndDate(startDate, durationDays) {
  if (!startDate || !durationDays) return '';
  const start = toDate(startDate);
  let remaining = durationDays - 1;
  const result = new Date(start);

  while (remaining > 0) {
    result.setDate(result.getDate() + 1);
    const day = result.getDay();
    if (day !== 0 && day !== 6) {
      remaining--;
    }
  }

  if (startDate.includes('T')) {
    return `${formatLocalDate(result)}T18:00`;
  }
  return formatLocalDate(result);
}

/**
 * Calcula a duracao em dias uteis entre duas datas.
 */
export function calcDuration(startDate, endDate) {
  if (!startDate || !endDate) return 1;
  const startStr = String(startDate).split('T')[0];
  const endStr = String(endDate).split('T')[0];
  const s = new Date(startStr + 'T12:00:00');
  const e = new Date(endStr + 'T12:00:00');
  if (isNaN(s) || isNaN(e) || e < s) return 1;

  let days = 0;
  const current = new Date(s);

  while (current <= e) {
    const day = current.getDay();
    if (day !== 0 && day !== 6) {
      days++;
    }
    current.setDate(current.getDate() + 1);
  }

  return Math.max(1, days);
}

/**
 * Calcula horas uteis entre dois datetimes (seg-sex, 08:00-18:00).
 */
export function calcWorkHours(startStr, endStr) {
  if (!startStr || !endStr) return 0;
  const WORK_START = 8;
  const WORK_END = 18;
  const start = toDate(startStr);
  const end = toDate(endStr);
  if (!start || !end || end <= start) return 0;

  if (start.toDateString() === end.toDateString()) {
    if (start.getDay() === 0 || start.getDay() === 6) return 0;
    const s = Math.max(start.getHours() + start.getMinutes() / 60, WORK_START);
    const e = Math.min(end.getHours() + end.getMinutes() / 60, WORK_END);
    return Math.max(0, parseFloat((e - s).toFixed(2)));
  }

  let total = 0;
  const cur = new Date(start);

  if (cur.getDay() !== 0 && cur.getDay() !== 6) {
    const s = Math.max(cur.getHours() + cur.getMinutes() / 60, WORK_START);
    total += Math.max(0, WORK_END - s);
  }

  cur.setDate(cur.getDate() + 1); cur.setHours(0, 0, 0, 0);
  const endDay = new Date(end); endDay.setHours(0, 0, 0, 0);
  while (cur < endDay) {
    if (cur.getDay() !== 0 && cur.getDay() !== 6) total += (WORK_END - WORK_START);
    cur.setDate(cur.getDate() + 1);
  }

  if (end.getDay() !== 0 && end.getDay() !== 6) {
    const e = Math.min(end.getHours() + end.getMinutes() / 60, WORK_END);
    total += Math.max(0, e - WORK_START);
  }

  return parseFloat(total.toFixed(2));
}
