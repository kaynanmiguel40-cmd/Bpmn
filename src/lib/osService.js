import { createCRUDService } from './serviceFactory';
import { supabase } from './supabase';

// ==================== TRANSFORMADORES ====================

export function dbToOrder(row) {
  if (!row) return null;
  return {
    id: row.id,
    number: row.number,
    title: row.title,
    description: row.description || '',
    priority: row.priority || 'medium',
    status: row.status || 'available',
    client: row.client || '',
    location: row.location || '',
    notes: row.notes || '',
    assignee: row.assignee || null,
    assignedTo: row.assigned_to || null,
    sortOrder: row.sort_order ?? 0,
    estimatedStart: row.estimated_start || '',
    estimatedEnd: row.estimated_end || '',
    actualStart: row.actual_start || '',
    actualEnd: row.actual_end || '',
    attachments: Array.isArray(row.attachments) ? row.attachments : [],
    expenses: Array.isArray(row.expenses) ? row.expenses : [],
    projectId: row.project_id || null,
    type: row.type || 'normal',
    parentOrderId: row.parent_order_id || null,
    emergencyNumber: row.emergency_number || null,
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
  fieldMap: {
    name: 'name',
    sector: 'sector_id',
    color: 'color',
    description: 'description',
  },
});

export const getOSProjects = projectService.getAll;
export const createOSProject = (project) => projectService.create(project);
export const updateOSProject = (id, updates) => projectService.update(id, updates);
export const deleteOSProject = (id) => projectService.remove(id);

// ==================== ORDENS DE SERVICO (via factory) ====================

const orderService = createCRUDService({
  table: 'os_orders',
  localKey: 'os_orders',
  idPrefix: 'os',
  transform: dbToOrder,
  fieldMap: {
    number: 'number',
    title: 'title',
    description: 'description',
    priority: 'priority',
    status: 'status',
    client: 'client',
    location: 'location',
    notes: 'notes',
    assignee: 'assignee',
    assignedTo: 'assigned_to',
    sortOrder: 'sort_order',
    estimatedStart: 'estimated_start',
    estimatedEnd: 'estimated_end',
    actualStart: 'actual_start',
    actualEnd: 'actual_end',
    attachments: 'attachments',
    expenses: 'expenses',
    projectId: 'project_id',
    type: 'type',
    parentOrderId: 'parent_order_id',
    emergencyNumber: 'emergency_number',
  },
});

export const getOSOrders = orderService.getAll;
export const updateOSOrder = (id, updates) => orderService.update(id, updates);
export const deleteOSOrder = (id) => orderService.remove(id);

// ==================== FUNÇÕES ESPECIAIS (não cabem na factory) ====================

export async function getNextOrderNumber() {
  const { data, error } = await supabase
    .from('os_orders')
    .select('number')
    .order('number', { ascending: false })
    .limit(1);

  if (error || !data || data.length === 0) {
    const local = JSON.parse(localStorage.getItem('os_orders') || '[]');
    const maxNum = local.reduce((acc, o) => Math.max(acc, o.number || 0), 0);
    return maxNum + 1;
  }
  return (data[0].number || 0) + 1;
}

export async function getNextEmergencyNumber() {
  const { data, error } = await supabase
    .from('os_orders')
    .select('emergency_number')
    .eq('type', 'emergency')
    .order('emergency_number', { ascending: false })
    .limit(1);

  if (error || !data || data.length === 0) {
    const local = JSON.parse(localStorage.getItem('os_orders') || '[]');
    const maxNum = local
      .filter(o => o.type === 'emergency')
      .reduce((acc, o) => Math.max(acc, o.emergency_number || 0), 0);
    return maxNum + 1;
  }
  return (data[0].emergency_number || 0) + 1;
}

export async function createOSOrder(order) {
  if (order.type === 'emergency') {
    const nextEmg = await getNextEmergencyNumber();
    return orderService.create({
      ...order,
      emergencyNumber: order.emergencyNumber || nextEmg,
      priority: 'urgent',
    });
  }
  const nextNum = await getNextOrderNumber();
  return orderService.create({ ...order, number: order.number || nextNum });
}

export async function updateOSOrdersBatch(orderUpdates) {
  const results = [];
  for (const upd of orderUpdates) {
    const result = await updateOSOrder(upd.id, upd);
    if (result) results.push(result);
  }
  return results;
}

export async function clearProjectFromOrders(projectId) {
  await orderService.bulkUpdate('project_id', null, 'project_id', projectId);
}

export async function clearSectorFromProjects(sectorId) {
  await projectService.bulkUpdate('sector_id', null, 'sector_id', sectorId);
}
