import { createCRUDService } from './serviceFactory';

// ==================== TRANSFORMADOR ====================

function dbToTemplate(row) {
  if (!row) return null;
  return {
    id: row.id,
    name: row.name || '',
    title: row.title || '',
    description: row.description || '',
    priority: row.priority || 'medium',
    notes: row.notes || '',
    expenses: Array.isArray(row.expenses) ? row.expenses : [],
    checklist: Array.isArray(row.checklist) ? row.checklist : [],
    createdAt: row.created_at,
  };
}

// ==================== SERVICE (via factory) ====================

const templateService = createCRUDService({
  table: 'os_templates',
  localKey: 'os_templates',
  idPrefix: 'tpl',
  transform: dbToTemplate,
  fieldMap: {
    name: 'name',
    title: 'title',
    description: 'description',
    priority: 'priority',
    notes: 'notes',
    expenses: 'expenses',
    checklist: 'checklist',
  },
  orderBy: 'created_at',
  orderAsc: false,
});

// ==================== EXPORTS ====================

export const getTemplates = templateService.getAll;
export const createTemplate = templateService.create;
export const updateTemplate = (id, updates) => templateService.update(id, updates);
export const deleteTemplate = templateService.remove;

export async function createFromOrder(name, order) {
  // Guarda so a ESTRUTURA da tarefa (texto, grupo, briefing) — sem estado de execucao.
  const checklist = (order.checklist || []).map((it) => ({
    text: it.text || '',
    group: it.group || null,
    briefing: it.briefing || '',
  }));
  return templateService.create({
    name,
    title: order.title || '',
    description: order.description || '',
    priority: order.priority || 'medium',
    notes: order.notes || '',
    expenses: order.expenses || [],
    checklist,
  });
}
