/**
 * EAP CRUD - Transforms, services, exports e undo persistence.
 *
 * Extraido de eapService.js (linhas 1-184).
 */

import { createCRUDService } from '../serviceFactory';
import { eapFolderSchema, eapProjectSchema, eapTaskSchema } from '../validation';
import { putOffline, getOffline } from '../offlineDB';

// ==================== TRANSFORMS ====================

function dbToFolder(row) {
  return {
    id: row.id,
    name: row.name || '',
    description: row.description || '',
    color: row.color || '#3b82f6',
    status: row.status || 'planning',
    createdBy: row.created_by || '',
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

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
    folderId: row.folder_id || null,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

/** Normaliza timestamp do Supabase para "YYYY-MM-DDTHH:MM" (datetime-local) */
function normalizeDateTime(val) {
  if (!val) return '';
  if (typeof val === 'string' && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(val)) return val;
  const d = new Date(val);
  if (isNaN(d)) return '';
  const pad = (n) => String(n).padStart(2, '0');
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

const folderService = createCRUDService({
  table: 'eap_folders',
  localKey: 'eap_folders',
  idPrefix: 'efld',
  transform: dbToFolder,
  schema: eapFolderSchema,
  fieldMap: {
    name: 'name',
    description: 'description',
    color: 'color',
    status: 'status',
    createdBy: 'created_by',
  },
  orderBy: 'created_at',
  orderAsc: false,
});

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
    folderId: 'folder_id',
  },
  orderBy: 'created_at',
  orderAsc: false,
});

export const taskService = createCRUDService({
  table: 'eap_tasks',
  localKey: 'eap_tasks',
  idPrefix: 'etsk',
  transform: dbToTask,
  schema: eapTaskSchema,
  richFields: ['notes'],
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
  if ('parentId' in sanitized && !sanitized.parentId) {
    sanitized.parentId = null;
  }
  if ('folderId' in sanitized && !sanitized.folderId) {
    sanitized.folderId = null;
  }
  return sanitized;
}

// ==================== CRUD EXPORTS ====================

export const getEapFolders = folderService.getAll;
export const createEapFolder = (item) => folderService.create(item);
export const updateEapFolder = (id, updates) => folderService.update(id, updates);
export const deleteEapFolder = (id) => folderService.remove(id);

export const getEapProjects = projectService.getAll;
export const createEapProject = (item) => projectService.create(sanitizeDates(item));
export const updateEapProject = (id, updates) => projectService.update(id, sanitizeDates(updates));
export const deleteEapProject = (id) => projectService.remove(id);

export const getEapTasks = taskService.getAll;
export const createEapTask = (item) => taskService.create(sanitizeDates(item));
export const updateEapTask = (id, updates) => taskService.update(id, sanitizeDates(updates));
export const deleteEapTask = (id) => taskService.remove(id);

// ==================== UNDO PERSISTENCE ====================

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
