import { createCRUDService } from './serviceFactory';
import { eapProjectSchema, eapTaskSchema } from './validation';
import { createOSOrder, getOSProjects, createOSProject } from './osService';

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

// Normaliza timestamp do Supabase para "YYYY-MM-DDTHH:MM" (datetime-local)
function normalizeDateTime(val) {
  if (!val) return '';
  // Se ja esta no formato correto (sem timezone), retornar direto
  if (typeof val === 'string' && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(val)) return val;
  // Se e string com timezone (vem do Supabase TIMESTAMPTZ), usar UTC pra nao mudar o horario
  const d = new Date(val);
  if (isNaN(d)) return '';
  const pad = (n) => String(n).padStart(2, '0');
  // Supabase armazena em UTC, entao ler como UTC pra manter o horario que o usuario digitou
  return `${d.getUTCFullYear()}-${pad(d.getUTCMonth() + 1)}-${pad(d.getUTCDate())}T${pad(d.getUTCHours())}:${pad(d.getUTCMinutes())}`;
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
    startDate: normalizeDateTime(row.start_date),
    endDate: normalizeDateTime(row.end_date),
    durationDays: row.duration_days ?? 1,
    estimatedHours: row.estimated_hours ?? null,
    progress: row.progress ?? 0,
    assignedTo: row.assigned_to || '',
    supervisor: row.supervisor || '',
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
    supervisor: 'supervisor',
    predecessors: 'predecessors',
    notes: 'notes',
    attachments: 'attachments',
    color: 'color',
    osOrderId: 'os_order_id',
  },
  orderBy: 'sort_order',
  orderAsc: true,
});

// ==================== UNDO PERSISTENCE ====================

import { putOffline, getOffline } from './offlineDB';

/**
 * Salva os stacks de undo/redo no IndexedDB para sobreviver a F5/crash.
 * Cada projeto tem seu proprio par de stacks.
 */
export async function saveUndoStacks(projectId, undoStack, redoStack) {
  try {
    await putOffline('eap_undo_history', {
      id: `${projectId}_undo`,
      stack: undoStack,
    });
    await putOffline('eap_undo_history', {
      id: `${projectId}_redo`,
      stack: redoStack,
    });
  } catch (err) {
    console.warn('[EAP] Erro ao persistir undo/redo:', err);
  }
}

/**
 * Carrega os stacks de undo/redo do IndexedDB.
 * Retorna { undoStack: [], redoStack: [] }.
 */
export async function loadUndoStacks(projectId) {
  try {
    const all = await getOffline('eap_undo_history');
    const undoEntry = all.find(e => e.id === `${projectId}_undo`);
    const redoEntry = all.find(e => e.id === `${projectId}_redo`);
    return {
      undoStack: Array.isArray(undoEntry?.stack) ? undoEntry.stack : [],
      redoStack: Array.isArray(redoEntry?.stack) ? redoEntry.stack : [],
    };
  } catch (err) {
    console.warn('[EAP] Erro ao carregar undo/redo:', err);
    return { undoStack: [], redoStack: [] };
  }
}

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
    supervisor: task.supervisor || null,
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
 *
 * Regra bidirecional:
 * - OS done (100%) → sempre sobrescreve (tarefa concluida pela OS)
 * - OS in_progress → so atualiza se progresso EAP era 0 (nao sobrescrever ajuste manual)
 * - OS available → so atualiza se progresso EAP > 0 E nao tem ajuste manual
 *
 * Retorna { eapUpdates, osUpdates } para permitir sync nos dois sentidos.
 */
export function syncProgressFromOS(eapTasks, osOrders) {
  const osMap = new Map(osOrders.map(o => [o.id, o]));
  const eapUpdates = [];
  const osUpdates = [];

  for (const task of eapTasks) {
    if (!task.osOrderId) continue;
    const os = osMap.get(task.osOrderId);
    if (!os) continue;

    // OS concluida → EAP deve ser 100% (fonte de verdade: OS)
    if (os.status === 'done' && task.progress !== 100) {
      eapUpdates.push({ id: task.id, progress: 100 });
    }
    // EAP concluida manualmente → OS deveria ser 'done' (sync reverso)
    else if (task.progress === 100 && os.status !== 'done') {
      osUpdates.push({ id: os.id, status: 'done' });
    }
    // EAP tem progresso > 0 e OS ainda esta available → iniciar OS
    else if (task.progress > 0 && task.progress < 100 && os.status === 'available') {
      osUpdates.push({ id: os.id, status: 'in_progress' });
    }
    // OS in_progress e EAP esta 0 → sincronizar para 50
    else if (os.status === 'in_progress' && task.progress === 0) {
      eapUpdates.push({ id: task.id, progress: 50 });
    }
  }

  return { eapUpdates, osUpdates };
}

// ==================== HELPERS DE DATA ====================

/** Formata Date para "YYYY-MM-DD" usando horario local (evita shift de dia por UTC) */
function formatLocalDate(d) {
  const pad = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

/** Formata Date para "YYYY-MM-DDTHH:MM" usando horario local */
function formatLocalDateTime(d) {
  const pad = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

// ==================== UTILIDADES EAP ====================

/**
 * Recalcula a numeracao WBS para todas as tarefas de um projeto.
 * Retorna array de { id, wbsNumber } para update em batch.
 */
export function recalculateWBS(tasks) {
  // Ordenar por level primeiro (pais antes de filhos), depois por sortOrder
  const sorted = [...tasks].sort((a, b) => {
    if ((a.level || 0) !== (b.level || 0)) return (a.level || 0) - (b.level || 0);
    return (a.sortOrder || 0) - (b.sortOrder || 0);
  });
  const counters = {};
  const wbsMap = new Map(); // id → wbs calculado nesta iteracao
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
 * Inclui filhos que tenham apenas startDate (usa startDate como endDate fallback).
 */
export function calculateSummaryDates(parentId, tasks) {
  const children = tasks.filter(t => t.parentId === parentId);
  if (children.length === 0) return null;

  // Coletar todas as datas, usando startDate como fallback para endDate e vice-versa
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

  // Se tem ciclo, incluir tarefas faltantes no final (com aviso)
  if (topoOrder.length < workTasks.length) {
    console.warn('[EAP] Dependencia circular detectada no calculo do caminho critico.');
    for (const t of workTasks) {
      if (!topoOrder.includes(t.id)) topoOrder.push(t.id);
    }
  }

  // ==================== FORWARD PASS (ES, EF) ====================
  // Usar dia-index numerico (dias a partir de uma data base)
  const baseDate = new Date('2020-01-01T00:00:00');
  const toDay = (dateStr) => {
    if (!dateStr) return 0;
    return Math.round((new Date(dateStr.includes('T') ? dateStr : dateStr + 'T00:00:00') - baseDate) / 86400000);
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
// Normaliza string de data para Date (suporta "YYYY-MM-DD" e "YYYY-MM-DDTHH:MM")
function toDate(str) {
  if (!str) return null;
  if (str.includes('T')) return new Date(str);
  return new Date(str + 'T00:00:00');
}

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

  // Se a data de inicio tinha hora, retornar o fim com hora 18:00 (fim do expediente)
  if (startDate.includes('T')) {
    return `${formatLocalDate(result)}T18:00`;
  }
  return formatLocalDate(result);
}

/**
 * Calcula a duracao em dias uteis entre duas datas.
 * Inicio e termino no mesmo dia = 1 dia.
 */
export function calcDuration(startDate, endDate) {
  if (!startDate || !endDate) return 1;
  // Extrair apenas a parte da data (YYYY-MM-DD), ignorando horas completamente
  const startStr = String(startDate).split('T')[0];
  const endStr = String(endDate).split('T')[0];
  const s = new Date(startStr + 'T12:00:00'); // meio-dia para evitar problemas de DST
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

  // Mesmo dia
  if (start.toDateString() === end.toDateString()) {
    if (start.getDay() === 0 || start.getDay() === 6) return 0;
    const s = Math.max(start.getHours() + start.getMinutes() / 60, WORK_START);
    const e = Math.min(end.getHours() + end.getMinutes() / 60, WORK_END);
    return Math.max(0, parseFloat((e - s).toFixed(2)));
  }

  let total = 0;
  const cur = new Date(start);

  // Primeiro dia
  if (cur.getDay() !== 0 && cur.getDay() !== 6) {
    const s = Math.max(cur.getHours() + cur.getMinutes() / 60, WORK_START);
    total += Math.max(0, WORK_END - s);
  }

  // Dias intermediarios
  cur.setDate(cur.getDate() + 1); cur.setHours(0, 0, 0, 0);
  const endDay = new Date(end); endDay.setHours(0, 0, 0, 0);
  while (cur < endDay) {
    if (cur.getDay() !== 0 && cur.getDay() !== 6) total += (WORK_END - WORK_START);
    cur.setDate(cur.getDate() + 1);
  }

  // Ultimo dia
  if (end.getDay() !== 0 && end.getDay() !== 6) {
    const e = Math.min(end.getHours() + end.getMinutes() / 60, WORK_END);
    total += Math.max(0, e - WORK_START);
  }

  return parseFloat(total.toFixed(2));
}

// ==================== VALIDACAO DE DEPENDENCIAS ====================

/**
 * Detecta se adicionar as predecessoras criaria um ciclo (dependencia circular).
 * Usa DFS para verificar se o taskId e alcancavel a partir de algum predecessor.
 * Retorna true se detectar ciclo.
 */
export function detectCircularDependency(taskId, newPredecessors, allTasks) {
  if (!newPredecessors || newPredecessors.length === 0) return false;

  const taskMap = new Map(allTasks.map(t => [t.id, t]));

  // Verificar: a partir do predecessor, seguindo a cadeia de predecessoras dele,
  // consigo chegar de volta ao taskId? Se sim, criar essa dependencia formaria um ciclo.
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

  // Se o predecessor ja depende (direta ou indiretamente) do taskId → ciclo
  // Direcao correta: partir do predecessor e ver se chega ao taskId
  for (const pred of newPredecessors) {
    if (pred.taskId === taskId) return true; // Auto-referencia
    if (canReach(pred.taskId, taskId, new Set())) return true;
  }

  return false;
}

// ==================== PREDECESSORAS ====================

/**
 * Adiciona dias uteis a uma data (positivo = futuro, negativo = passado).
 */
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

// Mapa interno→PT e PT→interno para tipos de predecessora
const TYPE_TO_PT = { FS: 'FI', SS: 'II', FF: 'TT', SF: 'IF' };
const PT_TO_TYPE = { FI: 'FS', II: 'SS', TT: 'FF', IF: 'SF', FF: 'FF', FS: 'FS', SS: 'SS', SF: 'SF' };

/**
 * Formata predecessoras para exibicao na tabela (em portugues).
 * Ex: [{taskId: 'etsk_xxx', type: 'FS', lag: 2}] → "3FI+2d"
 * FI = Fim-Inicio, II = Inicio-Inicio, TT = Termino-Termino, IF = Inicio-Fim
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
    // FI e o padrao, so mostra se for diferente
    if (ptType !== 'FI') str += ptType;
    if (lag > 0) str += '+' + lag + 'd';
    else if (lag < 0) str += lag + 'd';
    return str;
  }).filter(Boolean).join(';');
}

/**
 * Parseia texto de predecessoras para o formato interno.
 * Aceita tanto PT (FI, II, FF, IF) quanto EN (FS, SS, FF, SF).
 * Ex: "3FI+2d;5" → [{taskId: 'etsk_xxx', type: 'FS', lag: 2}, ...]
 * Ex: "3II;5IF-1d" → [{..., type: 'SS', ...}, {..., type: 'SF', lag: -1}]
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

/**
 * Auto-agenda tarefas baseado em suas predecessoras (igual MS Project).
 * Usa ordenação topológica (Kahn's) para garantir que predecessores
 * sejam processados ANTES dos sucessores, independente da ordem de linha.
 * Propaga datas em cascata (FS, SS, FF, SF com lag).
 * Retorna array de { id, startDate, endDate } para update.
 */
export function autoScheduleTasks(tasks) {
  const taskMap = new Map(tasks.map(t => [t.id, { ...t }]));

  // --- Topological Sort (Kahn's) ---
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
  // Ciclo detectado? incluir faltantes mas logar aviso
  if (topoOrder.length < tasks.length) {
    console.warn('[EAP] Dependencia circular detectada no auto-scheduling. Tarefas ciclicas serao ignoradas no agendamento.');
    for (const t of tasks) {
      if (!topoOrder.includes(t.id)) topoOrder.push(t.id);
    }
  }

  // --- Propagar datas em ordem topológica ---
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
      // Normalizar horario de inicio para 08:00 (inicio do expediente)
      const newStart = maxStartStr.includes('T')
        ? maxStartStr.split('T')[0] + 'T08:00'
        : maxStartStr;
      const newEnd = calcEndDate(newStart, task.durationDays || 1);

      // Comparar apenas a parte da data (ignorar diferenca de formato com/sem hora)
      const curDatePart = (task.startDate || '').split('T')[0];
      const newDatePart = newStart.split('T')[0];
      if (newDatePart !== curDatePart) {
        updates.push({ id: task.id, startDate: newStart, endDate: newEnd });
        // Atualizar cópia local para propagação em cascata
        task.startDate = newStart;
        task.endDate = newEnd;
      }
    }
  }

  return updates;
}
