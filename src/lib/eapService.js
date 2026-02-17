import { createCRUDService } from './serviceFactory';
import { eapProjectSchema, eapTaskSchema } from './validation';
import { createOSOrder, updateOSOrder, getOSProjects, createOSProject } from './osService';

// ==================== TRANSFORMS ====================

function dbToProject(row) {
  return {
    id: row.id,
    name: row.name || '',
    description: row.description || '',
    startDate: row.start_date || '',
    endDate: row.end_date || '',
    status: row.status || 'planning',
    color: row.color || '#3b82f6',
    createdBy: row.created_by || '',
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function dbToTask(row) {
  return {
    id: row.id,
    projectId: row.project_id || '',
    name: row.name || '',
    wbsNumber: row.wbs_number || '',
    parentId: row.parent_id || null,
    sortOrder: row.sort_order ?? 0,
    level: row.level ?? 0,
    isMilestone: row.is_milestone ?? false,
    startDate: row.start_date || '',
    endDate: row.end_date || '',
    durationDays: row.duration_days ?? 1,
    estimatedHours: row.estimated_hours ?? null,
    progress: row.progress ?? 0,
    assignedTo: row.assigned_to || '',
    predecessors: Array.isArray(row.predecessors) ? row.predecessors : [],
    notes: row.notes || '',
    attachments: Array.isArray(row.attachments) ? row.attachments : [],
    color: row.color || '',
    osOrderId: row.os_order_id || null,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

// ==================== SERVICES ====================

const projectService = createCRUDService({
  table: 'eap_projects',
  localKey: 'eap_projects',
  idPrefix: 'eprj',
  transform: dbToProject,
  schema: eapProjectSchema,
  fieldMap: {
    name: 'name',
    description: 'description',
    startDate: 'start_date',
    endDate: 'end_date',
    status: 'status',
    color: 'color',
    createdBy: 'created_by',
  },
  orderBy: 'created_at',
  orderAsc: false,
});

const taskService = createCRUDService({
  table: 'eap_tasks',
  localKey: 'eap_tasks',
  idPrefix: 'etsk',
  transform: dbToTask,
  schema: eapTaskSchema,
  fieldMap: {
    projectId: 'project_id',
    name: 'name',
    wbsNumber: 'wbs_number',
    parentId: 'parent_id',
    sortOrder: 'sort_order',
    level: 'level',
    isMilestone: 'is_milestone',
    startDate: 'start_date',
    endDate: 'end_date',
    durationDays: 'duration_days',
    estimatedHours: 'estimated_hours',
    progress: 'progress',
    assignedTo: 'assigned_to',
    predecessors: 'predecessors',
    notes: 'notes',
    attachments: 'attachments',
    color: 'color',
    osOrderId: 'os_order_id',
  },
  orderBy: 'sort_order',
  orderAsc: true,
});

// ==================== HELPERS ====================

/** Converte strings vazias de campos DATE para null (PostgreSQL nao aceita '' em DATE) */
function sanitizeDates(obj) {
  const dateFields = ['startDate', 'endDate'];
  const sanitized = { ...obj };
  for (const f of dateFields) {
    if (f in sanitized && !sanitized[f]) {
      sanitized[f] = null;
    }
  }
  // parentId vazio tambem precisa ser null (FK)
  if ('parentId' in sanitized && !sanitized.parentId) {
    sanitized.parentId = null;
  }
  return sanitized;
}

// ==================== EXPORTS ====================

export const getEapProjects = projectService.getAll;
export const createEapProject = (item) => projectService.create(sanitizeDates(item));
export const updateEapProject = (id, updates) => projectService.update(id, sanitizeDates(updates));
export const deleteEapProject = (id) => projectService.remove(id);

export const getEapTasks = taskService.getAll;
export const createEapTask = (item) => taskService.create(sanitizeDates(item));
export const updateEapTask = (id, updates) => taskService.update(id, sanitizeDates(updates));
export const deleteEapTask = (id) => taskService.remove(id);

// ==================== PONTE EAP → OS ====================

/**
 * Encontra o pai raiz (level 0) de uma tarefa subindo a hierarquia.
 */
function findRootParent(task, allTasks) {
  let current = task;
  while (current.parentId) {
    const parent = allTasks.find(t => t.id === current.parentId);
    if (!parent) break;
    current = parent;
  }
  return current;
}

/**
 * Busca ou cria um OS Projeto com o nome do pai raiz da tarefa.
 * Retorna o id do OS Projeto.
 */
async function getOrCreateOSProject(rootTask) {
  // Buscar projetos OS existentes
  const osProjects = await getOSProjects();
  const existing = osProjects.find(p => p.name === rootTask.name);
  if (existing) return existing.id;

  // Criar novo OS Projeto com o nome da tarefa raiz
  const newProject = await createOSProject({
    name: rootTask.name,
    description: `Projeto gerado automaticamente pela EAP`,
    color: '#3b82f6',
  });

  return newProject?.id || null;
}

/**
 * Coleta filhos de uma tarefa e monta o checklist da OS.
 * - Filhos folha → itens sem grupo
 * - Filhos com netos → grupo (nome do filho), netos → itens do grupo
 */
function buildChecklistFromChildren(task, allTasks) {
  const children = allTasks
    .filter(t => t.parentId === task.id)
    .sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));

  if (children.length === 0) return [];

  const checklist = [];
  let counter = 0;

  for (const child of children) {
    const grandchildren = allTasks
      .filter(t => t.parentId === child.id)
      .sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));

    if (grandchildren.length > 0) {
      // Filho e grupo, netos sao os itens do checklist
      for (const gc of grandchildren) {
        checklist.push({
          id: Date.now() + (++counter),
          text: gc.name,
          group: child.name,
          done: false,
          startedAt: null,
          completedAt: null,
          durationMin: null,
        });
      }
    } else {
      // Filho folha → item direto do checklist
      checklist.push({
        id: Date.now() + (++counter),
        text: child.name,
        group: null,
        done: false,
        startedAt: null,
        completedAt: null,
        durationMin: null,
      });
    }
  }

  return checklist;
}

/**
 * Gera uma Ordem de Servico a partir de uma tarefa EAP.
 * - Encontra o pai raiz (level 0) → cria/vincula OS Projeto
 * - Se a tarefa tem filhos → filhos viram checklist da OS
 */
export async function generateOSFromTask(task, projectName, allTasks = []) {
  // Encontrar pai raiz (level 0) para determinar o OS Projeto
  const rootParent = allTasks.length > 0 ? findRootParent(task, allTasks) : null;
  let osProjectId = null;

  if (rootParent && rootParent.id !== task.id) {
    // Tarefa tem pai raiz → buscar/criar OS Projeto
    osProjectId = await getOrCreateOSProject(rootParent);
  }

  // Montar checklist a partir dos filhos (sub-atividades)
  const checklist = buildChecklistFromChildren(task, allTasks);

  const osData = {
    title: task.name,
    description: task.notes || '',
    priority: 'medium',
    category: 'internal',
    assignedTo: task.assignedTo || '',
    estimatedStart: task.startDate || '',
    estimatedEnd: task.endDate || '',
    projectId: osProjectId,
    checklist,
  };

  const os = await createOSOrder(osData);
  if (!os) return null;

  // Vincular OS na tarefa EAP
  await taskService.update(task.id, { osOrderId: os.id });

  return os;
}

/**
 * Sincroniza o progresso das tarefas EAP baseado no status das OS vinculadas.
 * available = 0%, in_progress = 50%, done = 100%
 */
export function syncProgressFromOS(eapTasks, osOrders) {
  const osMap = new Map(osOrders.map(o => [o.id, o]));
  const updates = [];

  for (const task of eapTasks) {
    if (!task.osOrderId) continue;
    const os = osMap.get(task.osOrderId);
    if (!os) continue;

    let newProgress;
    if (os.status === 'done') newProgress = 100;
    else if (os.status === 'in_progress') newProgress = 50;
    else newProgress = 0;

    if (newProgress !== task.progress) {
      updates.push({ id: task.id, progress: newProgress });
    }
  }

  return updates;
}

// ==================== UTILIDADES EAP ====================

/**
 * Recalcula a numeracao WBS para todas as tarefas de um projeto.
 * Retorna array de { id, wbsNumber } para update em batch.
 */
export function recalculateWBS(tasks) {
  const sorted = [...tasks].sort((a, b) => a.sortOrder - b.sortOrder);
  const counters = {};
  const updates = [];

  for (const task of sorted) {
    const parentKey = task.parentId || 'root';
    if (!counters[parentKey]) counters[parentKey] = 0;
    counters[parentKey]++;

    let wbs;
    if (!task.parentId) {
      wbs = String(counters[parentKey]);
    } else {
      const parent = sorted.find(t => t.id === task.parentId);
      const parentWbs = parent ? parent.wbsNumber : '';
      wbs = parentWbs ? `${parentWbs}.${counters[parentKey]}` : String(counters[parentKey]);
    }

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

  const starts = children.filter(t => t.startDate).map(t => new Date(t.startDate));
  const ends = children.filter(t => t.endDate).map(t => new Date(t.endDate));

  if (starts.length === 0 || ends.length === 0) return null;

  const minStart = new Date(Math.min(...starts));
  const maxEnd = new Date(Math.max(...ends));
  const durationMs = maxEnd - minStart;
  const durationDays = Math.max(1, Math.ceil(durationMs / (1000 * 60 * 60 * 24)));

  // Progresso ponderado pela duracao dos filhos
  let totalWeight = 0;
  let weightedProgress = 0;
  for (const child of children) {
    const w = child.durationDays || 1;
    totalWeight += w;
    weightedProgress += (child.progress || 0) * w;
  }
  const progress = totalWeight > 0 ? Math.round(weightedProgress / totalWeight) : 0;

  // Somar horas estimadas dos filhos
  const totalHours = children.reduce((sum, c) => sum + (c.estimatedHours ?? (c.durationDays || 1) * 8), 0);

  return {
    startDate: minStart.toISOString().split('T')[0],
    endDate: maxEnd.toISOString().split('T')[0],
    durationDays,
    estimatedHours: parseFloat(totalHours.toFixed(2)),
    progress,
  };
}

/**
 * CPM - Critical Path Method (igual MS Project).
 * Forward Pass → Backward Pass → Float → Critical = float 0.
 * Retorna Set de IDs das tarefas no caminho critico.
 */
export function calculateCriticalPath(tasks) {
  const critical = new Set();
  if (tasks.length === 0) return critical;

  // Filtrar summary tasks (pais) — CPM calcula folhas + milestones
  const parentIds = new Set(tasks.filter(t => t.parentId).map(t => t.parentId));
  const workTasks = tasks.filter(t => !parentIds.has(t.id));

  if (workTasks.length === 0) return critical;

  const taskMap = new Map(workTasks.map(t => [t.id, t]));

  // Construir grafo de sucessores
  const successors = new Map(); // taskId → [{ taskId, type, lag }]
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

  // ==================== TOPOLOGICAL SORT (Kahn's) ====================
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

  // Se tem ciclo, incluir tarefas faltantes no final
  if (topoOrder.length < workTasks.length) {
    for (const t of workTasks) {
      if (!topoOrder.includes(t.id)) topoOrder.push(t.id);
    }
  }

  // ==================== FORWARD PASS (ES, EF) ====================
  // Usar dia-index numerico (dias a partir de uma data base)
  const baseDate = new Date('2020-01-01T00:00:00');
  const toDay = (dateStr) => {
    if (!dateStr) return 0;
    return Math.round((new Date(dateStr + 'T00:00:00') - baseDate) / 86400000);
  };

  const ES = new Map(); // Early Start
  const EF = new Map(); // Early Finish

  for (const id of topoOrder) {
    const t = taskMap.get(id);
    const dur = t.durationDays || 1;
    let es = toDay(t.startDate); // default: data propria

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

  // ==================== BACKWARD PASS (LS, LF) ====================
  let projectEnd = 0;
  for (const ef of EF.values()) {
    if (ef > projectEnd) projectEnd = ef;
  }

  const LS = new Map(); // Late Start
  const LF = new Map(); // Late Finish

  // Inicializar todos com projectEnd
  for (const t of workTasks) {
    const dur = t.durationDays || 1;
    LF.set(t.id, projectEnd);
    LS.set(t.id, projectEnd - dur);
  }

  // Backward pass em ordem reversa
  for (let i = topoOrder.length - 1; i >= 0; i--) {
    const id = topoOrder[i];
    const t = taskMap.get(id);
    const dur = t.durationDays || 1;
    let lf = projectEnd; // default se nao tem sucessores

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

  // ==================== FLOAT & CRITICAL ====================
  for (const id of topoOrder) {
    const es = ES.get(id) ?? 0;
    const ls = LS.get(id) ?? 0;
    const totalFloat = ls - es;

    if (totalFloat <= 0) {
      critical.add(id);
      // Marcar pai como critico tambem
      const t = taskMap.get(id);
      if (t && t.parentId) {
        critical.add(t.parentId);
        // Subir ate a raiz
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
 * Respeita collapsed state.
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
  const start = new Date(startDate + 'T00:00:00');
  let remaining = durationDays - 1;
  const result = new Date(start);

  while (remaining > 0) {
    result.setDate(result.getDate() + 1);
    const day = result.getDay();
    if (day !== 0 && day !== 6) {
      remaining--;
    }
  }

  return result.toISOString().split('T')[0];
}

/**
 * Calcula a duracao em dias uteis entre duas datas.
 */
export function calcDuration(startDate, endDate) {
  if (!startDate || !endDate) return 1;
  const start = new Date(startDate + 'T00:00:00');
  const end = new Date(endDate + 'T00:00:00');
  let days = 0;
  const current = new Date(start);

  while (current <= end) {
    const day = current.getDay();
    if (day !== 0 && day !== 6) {
      days++;
    }
    current.setDate(current.getDate() + 1);
  }

  return Math.max(1, days);
}

// ==================== PREDECESSORAS ====================

/**
 * Adiciona dias uteis a uma data (positivo = futuro, negativo = passado).
 */
function addWorkDaysToDate(dateStr, days) {
  if (!dateStr || days === 0) return dateStr;
  const date = new Date(dateStr + 'T00:00:00');
  let remaining = Math.abs(days);
  const direction = days > 0 ? 1 : -1;

  while (remaining > 0) {
    date.setDate(date.getDate() + direction);
    const day = date.getDay();
    if (day !== 0 && day !== 6) {
      remaining--;
    }
  }

  return date.toISOString().split('T')[0];
}

/**
 * Formata predecessoras para exibicao na tabela.
 * Ex: [{taskId: 'etsk_xxx', type: 'FS', lag: 2}] → "3FS+2d"
 */
export function formatPredecessors(predecessors, taskRowMap) {
  if (!predecessors || predecessors.length === 0) return '';
  return predecessors.map(p => {
    const row = taskRowMap.get(p.taskId);
    if (row === undefined) return '';
    const type = p.type || 'FS';
    const lag = p.lag || 0;
    let str = String(row);
    if (type !== 'FS') str += type;
    if (lag > 0) str += '+' + lag + 'd';
    else if (lag < 0) str += lag + 'd';
    return str;
  }).filter(Boolean).join(';');
}

/**
 * Parseia texto de predecessoras para o formato interno.
 * Ex: "3FS+2d;5" → [{taskId: 'etsk_xxx', type: 'FS', lag: 2}, ...]
 */
export function parsePredecessors(text, rowTaskMap) {
  if (!text || !text.trim()) return [];
  const parts = text.split(/[;,]/);
  const result = [];
  for (const part of parts) {
    const m = part.trim().match(/^(\d+)\s*(FS|SS|FF|SF)?\s*([+-]\d+)?\s*d?\s*$/i);
    if (!m) continue;
    const row = parseInt(m[1], 10);
    const type = (m[2] || 'FS').toUpperCase();
    const lag = m[3] ? parseInt(m[3], 10) : 0;
    const taskId = rowTaskMap.get(row);
    if (taskId) result.push({ taskId, type, lag });
  }
  return result;
}

/**
 * Auto-agenda tarefas baseado em suas predecessoras.
 * Propaga datas em cascata (FS, SS, FF, SF com lag).
 * Retorna array de { id, startDate, endDate } para update.
 */
export function autoScheduleTasks(tasks) {
  const sorted = [...tasks].sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));
  const taskMap = new Map(sorted.map(t => [t.id, { ...t }]));
  const updates = [];

  for (const task of sorted) {
    if (!task.predecessors || task.predecessors.length === 0) continue;

    let maxStartDate = null;

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
        const d = new Date(newStartStr + 'T00:00:00');
        if (!maxStartDate || d > maxStartDate) {
          maxStartDate = d;
        }
      }
    }

    if (maxStartDate) {
      const newStart = maxStartDate.toISOString().split('T')[0];
      const newEnd = calcEndDate(newStart, task.durationDays || 1);

      if (newStart !== task.startDate) {
        updates.push({ id: task.id, startDate: newStart, endDate: newEnd });
        // Atualizar copia local para propagacao em cascata
        const t = taskMap.get(task.id);
        if (t) { t.startDate = newStart; t.endDate = newEnd; }
      }
    }
  }

  return updates;
}
