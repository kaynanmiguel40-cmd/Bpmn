import { createCRUDService } from './serviceFactory';
import { supabase } from './supabase';
import { osOrderSchema, sectorSchema, osProjectSchema } from './validation';
import { SLA_HOURS, DEFAULT_SLA_HOURS } from '../constants/sla';
import { getOffline } from './offlineDB';

// ==================== TRANSFORMADORES ====================

// Coage qualquer formato vindo do Postgres (DATE "YYYY-MM-DD" ou TIMESTAMPTZ ISO)
// para o formato aceito por <input type="datetime-local">: "YYYY-MM-DDTHH:mm".
// Usa UTC para manter consistencia: o usuario digita "08:00", o banco guarda
// "08:00+00:00", ao ler mostra "08:00" de novo (sem deslocar por timezone).
// Sem isso, a cada save a hora "recua" N horas e a data acaba sumindo.
function toDatetimeLocalInput(value) {
  if (!value) return '';
  if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(value)) return value;
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) return `${value}T08:00`;
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return '';
  const pad = (n) => String(n).padStart(2, '0');
  return `${d.getUTCFullYear()}-${pad(d.getUTCMonth() + 1)}-${pad(d.getUTCDate())}T${pad(d.getUTCHours())}:${pad(d.getUTCMinutes())}`;
}

export function dbToOrder(row) {
  if (!row) return null;
  return {
    id: row.id,
    number: row.number,
    title: row.title,
    description: row.description || '',
    checklist: Array.isArray(row.checklist) ? row.checklist : [],
    priority: row.priority || 'medium',
    status: row.status || 'available',
    category: row.category || 'internal',
    blockReason: row.block_reason || null,
    client: row.client || '',
    clientId: row.client_id || null,
    location: row.location || '',
    notes: row.notes || '',
    assignee: row.assignee || null,
    assignedTo: row.assigned_to || null,
    supervisor: row.supervisor || null,
    sortOrder: row.sort_order ?? 0,
    estimatedStart: toDatetimeLocalInput(row.estimated_start),
    estimatedEnd: toDatetimeLocalInput(row.estimated_end),
    actualStart: toDatetimeLocalInput(row.actual_start),
    actualEnd: toDatetimeLocalInput(row.actual_end),
    pausedAt: row.paused_at || null,
    resumedAt: row.resumed_at || null,
    accumulatedMs: row.accumulated_ms || 0,
    slaDeadline: row.sla_deadline || null,
    leadTimeHours: row.lead_time_hours || null,
    attachments: Array.isArray(row.attachments) ? row.attachments : [],
    expenses: Array.isArray(row.expenses) ? row.expenses : [],
    projectId: row.project_id || null,
    type: row.type || 'normal',
    parentOrderId: row.parent_order_id || null,
    emergencyNumber: row.emergency_number || null,
    eapTaskId: row.eap_task_id || null,
    wbsPath: row.wbs_path || null,
    scheduledPauses: Array.isArray(row.scheduled_pauses) ? row.scheduled_pauses : [],
    dependsOn: Array.isArray(row.depends_on) ? row.depends_on : [],
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function dbToOSProject(row) {
  if (!row) return null;
  return {
    id: row.id,
    name: row.name,
    sector: row.sector_id || '',
    color: row.color || '#3b82f6',
    description: row.description || '',
    status: row.status || 'active',
    projectType: row.project_type || 'execution',
    eapProjectId: row.eap_project_id || null,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function dbToSector(row) {
  if (!row) return null;
  return {
    id: row.id,
    label: row.label,
    color: row.color || '#3b82f6',
  };
}

// ==================== SETORES (via factory) ====================

const sectorService = createCRUDService({
  table: 'os_sectors',
  localKey: 'os_sectors',
  idPrefix: 'sector',
  transform: dbToSector,
  schema: sectorSchema,
  fieldMap: {
    label: 'label',
    color: 'color',
  },
});

export const getOSSectors = sectorService.getAll;
export const createOSSector = (sector) => {
  // ID especial para setores: baseado no label
  const customId = sector.id || sector.label.trim().toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '') + '_' + Date.now();
  return sectorService.create(sector, { id: customId });
};
export const updateOSSector = (id, updates) => sectorService.update(id, updates);
export const deleteOSSector = (id) => sectorService.remove(id);

// ==================== PROJETOS (via factory) ====================

const projectService = createCRUDService({
  table: 'os_projects',
  localKey: 'os_projects',
  idPrefix: 'proj',
  transform: dbToOSProject,
  schema: osProjectSchema,
  fieldMap: {
    name: 'name',
    sector: 'sector_id',
    color: 'color',
    description: 'description',
    status: 'status',
    projectType: 'project_type',
    eapProjectId: 'eap_project_id',
  },
});

export const getOSProjects = projectService.getAll;
export const createOSProject = (project) => projectService.create(project);
export const updateOSProject = (id, updates) => projectService.update(id, updates);
export const deleteOSProject = (id) => projectService.remove(id);

// ==================== ORDENS DE SERVICO (via factory) ====================

// Campos timestamp que nao podem ser string vazia (Postgres timestamptz rejeita '')
const TIMESTAMP_FIELDS = [
  'estimatedStart', 'estimatedEnd', 'actualStart', 'actualEnd',
  'pausedAt', 'resumedAt', 'slaDeadline',
];

/** Converte string vazia em null nos campos timestamp (Postgres nao aceita '')
 *  e adiciona sufixo Z (UTC) em valores "YYYY-MM-DDTHH:mm" para garantir que
 *  o Postgres interprete como UTC e nao como timezone local. */
function normalizeTimestamps(order) {
  if (!order || typeof order !== 'object') return order;
  const result = { ...order };
  for (const field of TIMESTAMP_FIELDS) {
    const v = result[field];
    if (v === '' || v === undefined) {
      result[field] = null;
    } else if (typeof v === 'string' && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(v)) {
      // "2026-04-20T08:00" -> "2026-04-20T08:00:00Z" (UTC explicito)
      result[field] = `${v}:00Z`;
    }
  }
  return result;
}

const orderService = createCRUDService({
  table: 'os_orders',
  localKey: 'os_orders',
  idPrefix: 'os',
  transform: dbToOrder,
  schema: osOrderSchema,
  richFields: ['description', 'notes'],
  fieldMap: {
    number: 'number',
    title: 'title',
    description: 'description',
    checklist: 'checklist',
    priority: 'priority',
    status: 'status',
    category: 'category',
    blockReason: 'block_reason',
    client: 'client',
    clientId: 'client_id',
    location: 'location',
    notes: 'notes',
    assignee: 'assignee',
    assignedTo: 'assigned_to',
    sortOrder: 'sort_order',
    estimatedStart: 'estimated_start',
    estimatedEnd: 'estimated_end',
    actualStart: 'actual_start',
    actualEnd: 'actual_end',
    pausedAt: 'paused_at',
    resumedAt: 'resumed_at',
    accumulatedMs: 'accumulated_ms',
    slaDeadline: 'sla_deadline',
    leadTimeHours: 'lead_time_hours',
    attachments: 'attachments',
    expenses: 'expenses',
    projectId: 'project_id',
    type: 'type',
    parentOrderId: 'parent_order_id',
    emergencyNumber: 'emergency_number',
    supervisor: 'supervisor',
    eapTaskId: 'eap_task_id',
    wbsPath: 'wbs_path',
    scheduledPauses: 'scheduled_pauses',
    dependsOn: 'depends_on',
  },
});

export const getOSOrders = orderService.getAll;
export const updateOSOrder = (id, updates) => orderService.update(id, normalizeTimestamps(updates));
export const deleteOSOrder = (id) => orderService.remove(id);

// ==================== FUNÇÕES ESPECIAIS (não cabem na factory) ====================

/** Busca o proximo numero sequencial de uma coluna na tabela os_orders */
async function getNextSequentialNumber(column, filter = null) {
  let query = supabase.from('os_orders').select(column).order(column, { ascending: false }).limit(1);
  if (filter) query = query.eq(filter.column, filter.value);

  const { data, error } = await query;

  if (error || !data || data.length === 0) {
    let local = await getOffline('os_orders');
    if (filter) local = local.filter(o => o[filter.column] === filter.value);
    const maxNum = local.reduce((acc, o) => Math.max(acc, o[column] || 0), 0);
    return maxNum + 1;
  }
  return (data[0][column] || 0) + 1;
}

export function getNextOrderNumber() {
  return getNextSequentialNumber('number');
}

export function getNextEmergencyNumber() {
  return getNextSequentialNumber('emergency_number', { column: 'type', value: 'emergency' });
}

/** Calcula SLA deadline baseado na prioridade (horas a partir de agora) */
export function calcSLADeadline(priority) {
  const hours = SLA_HOURS[priority] || DEFAULT_SLA_HOURS;
  const deadline = new Date();
  deadline.setHours(deadline.getHours() + hours);
  return deadline.toISOString();
}

export async function createOSOrder(order) {
  // Auto-calcular SLA se nao fornecido
  const slaDeadline = order.slaDeadline || calcSLADeadline(order.priority || 'medium');
  const normalized = normalizeTimestamps(order);

  if (normalized.type === 'emergency') {
    const nextEmg = await getNextEmergencyNumber();
    return orderService.create({
      ...normalized,
      slaDeadline,
      emergencyNumber: normalized.emergencyNumber || nextEmg,
      priority: 'urgent',
    });
  }
  const nextNum = await getNextOrderNumber();
  return orderService.create({ ...normalized, slaDeadline, number: normalized.number || nextNum });
}

export async function updateOSOrdersBatch(orderUpdates) {
  const results = await Promise.all(
    orderUpdates.map(upd => updateOSOrder(upd.id, upd))
  );
  return results.filter(Boolean);
}

export async function clearProjectFromOrders(projectId) {
  await orderService.bulkUpdate('project_id', null, 'project_id', projectId);
}

export async function clearSectorFromProjects(sectorId) {
  await projectService.bulkUpdate('sector_id', null, 'sector_id', sectorId);
}
