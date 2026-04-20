import { createCRUDService } from './serviceFactory';
import { supabase } from './supabaseClient';
import { processOrderSchema } from './validation';
import { handleError } from './errorHandler';

// ==================== TRANSFORMADOR ====================

export function dbToProcessOrder(row) {
  if (!row) return null;
  return {
    id: row.id,
    projectId: row.project_id || '',
    elementId: row.element_id || '',
    elementType: row.element_type || '',
    title: row.title || '',
    description: row.description || '',
    objective: row.objective || '',
    steps: Array.isArray(row.steps) ? row.steps : [],
    inputs: row.inputs || '',
    outputs: row.outputs || '',
    toolsResources: row.tools_resources || '',
    responsible: row.responsible || '',
    participants: row.participants || '',
    acceptanceCriteria: row.acceptance_criteria || '',
    risks: Array.isArray(row.risks) ? row.risks : [],
    improvements: Array.isArray(row.improvements) ? row.improvements : [],
    lessonsLearned: row.lessons_learned || '',
    status: row.status || 'draft',
    version: row.version ?? 1,
    notes: row.notes || '',
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

// ==================== CRUD (via factory) ====================

const processOrderCRUD = createCRUDService({
  table: 'process_orders',
  localKey: 'process_orders',
  idPrefix: 'po',
  transform: dbToProcessOrder,
  schema: processOrderSchema,
  orderBy: 'created_at',
  orderAsc: true,
  fieldMap: {
    projectId: 'project_id',
    elementId: 'element_id',
    elementType: 'element_type',
    title: 'title',
    description: 'description',
    objective: 'objective',
    steps: 'steps',
    inputs: 'inputs',
    outputs: 'outputs',
    toolsResources: 'tools_resources',
    responsible: 'responsible',
    participants: 'participants',
    acceptanceCriteria: 'acceptance_criteria',
    risks: 'risks',
    improvements: 'improvements',
    lessonsLearned: 'lessons_learned',
    status: 'status',
    version: 'version',
    notes: 'notes',
  },
});

export const getAllProcessOrders = processOrderCRUD.getAll;
export const createProcessOrder = (order) => processOrderCRUD.create(order);
export const updateProcessOrder = (id, updates) => processOrderCRUD.update(id, updates);
export const deleteProcessOrder = (id) => processOrderCRUD.remove(id);

// ==================== QUERIES CUSTOM ====================

/**
 * Busca todas as ordens de processo de um projeto BPMN.
 */
export async function getProcessOrdersByProject(projectId) {
  const { data, error } = await supabase
    .from('process_orders')
    .select('*')
    .eq('project_id', projectId)
    .order('created_at', { ascending: true });

  if (error) {
    handleError(error, 'getProcessOrdersByProject', { showToast: false });
    return [];
  }
  return (data || []).map(dbToProcessOrder);
}

/**
 * Busca a ordem de processo de um elemento especifico.
 * Retorna null se nao existe (normal para elementos novos).
 */
export async function getProcessOrderByElement(projectId, elementId) {
  const { data, error } = await supabase
    .from('process_orders')
    .select('*')
    .eq('project_id', projectId)
    .eq('element_id', elementId)
    .single();

  if (error) {
    // PGRST116 = row not found — normal para elementos sem ordem
    if (error.code !== 'PGRST116') {
      handleError(error, 'getProcessOrderByElement', { showToast: false });
    }
    return null;
  }
  return dbToProcessOrder(data);
}
