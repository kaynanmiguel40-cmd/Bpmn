import { createCRUDService } from './serviceFactory';
import { supabase } from './supabase';
import { getOffline } from './offlineDB';

// ==================== TRANSFORMADOR ====================

export function dbToBlock(row) {
  if (!row) return null;
  return {
    id: row.id,
    orderId: row.order_id,
    title: row.title,
    description: row.description || '',
    assigneeId: row.assignee_id || null,
    assigneeName: row.assignee_name || '',
    estimatedMinutes: row.estimated_minutes || 0,
    dueAt: row.due_at || null,
    status: row.status || 'todo',
    sortOrder: row.sort_order ?? 0,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

// ==================== FACTORY ====================

const blockService = createCRUDService({
  table: 'os_blocks',
  localKey: 'os_blocks',
  idPrefix: 'block',
  transform: dbToBlock,
  fieldMap: {
    orderId: 'order_id',
    title: 'title',
    description: 'description',
    assigneeId: 'assignee_id',
    assigneeName: 'assignee_name',
    estimatedMinutes: 'estimated_minutes',
    dueAt: 'due_at',
    status: 'status',
    sortOrder: 'sort_order',
  },
});

export const getAllBlocks = blockService.getAll;
export const createBlock = (block) => blockService.create(block);
export const updateBlock = (id, updates) => blockService.update(id, updates);
export const deleteBlock = (id) => blockService.remove(id);

// ==================== FUNÇÕES ESPECIAIS ====================

/** Busca blocos de uma O.S. especifica, ordenados por sort_order */
export async function getBlocksByOrder(orderId) {
  const { data, error } = await supabase
    .from('os_blocks')
    .select('*')
    .eq('order_id', orderId)
    .order('sort_order', { ascending: true });

  if (error) {
    console.error('[os_blocks] getBlocksByOrder:', error.message);
    const local = await getOffline('os_blocks');
    return local
      .filter(r => r.order_id === orderId)
      .sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0))
      .map(dbToBlock);
  }
  return (data || []).map(dbToBlock);
}

/** Busca blocos atribuidos a um usuario (todos status). */
export async function getBlocksByAssignee(assigneeId) {
  const { data, error } = await supabase
    .from('os_blocks')
    .select('*')
    .eq('assignee_id', assigneeId)
    .order('updated_at', { ascending: false });

  if (error) {
    console.error('[os_blocks] getBlocksByAssignee:', error.message);
    return [];
  }
  return (data || []).map(dbToBlock);
}

/** Atalho para mudar status (drag-and-drop entre colunas). */
export const setBlockStatus = (id, status) => updateBlock(id, { status });

/** Verifica se todos os blocos de uma O.S. estao concluidos. */
export async function areAllBlocksDone(orderId) {
  const blocks = await getBlocksByOrder(orderId);
  if (blocks.length === 0) return false;
  return blocks.every(b => b.status === 'done');
}

// ==================== MIGRACAO SILENCIOSA ====================

/** Mapeia status da O.S. legada para status de bloco. */
function legacyStatusToBlockStatus(orderStatus) {
  if (orderStatus === 'doing' || orderStatus === 'in_progress') return 'doing';
  if (orderStatus === 'done' || orderStatus === 'completed') return 'done';
  return 'todo';
}

/** Calcula minutos entre duas datas (string ou Date). Retorna 0 se invalido. */
function diffMinutes(start, end) {
  if (!start || !end) return 0;
  const s = new Date(start);
  const e = new Date(end);
  if (Number.isNaN(s.getTime()) || Number.isNaN(e.getTime())) return 0;
  const diff = Math.round((e - s) / 60000);
  return diff > 0 ? diff : 0;
}

/**
 * Garante que uma O.S. team tem ao menos 1 bloco por participante. Roda apenas
 * para O.S. com mode='team' — em pool/solo nao cria bloco fantasma.
 *
 * Idempotente: nao duplica se ja existem blocos.
 * Retorna a lista de blocos da O.S. (apos eventual migracao).
 */
export async function ensureBlocksForOrder(order) {
  if (!order || !order.id) return [];
  if (order.mode !== 'team') return getBlocksByOrder(order.id);

  const existing = await getBlocksByOrder(order.id);
  if (existing.length > 0) return existing;

  const created = await createBlock({
    orderId: order.id,
    title: order.title || 'Bloco principal',
    description: '',
    assigneeId: order.assignedTo || null,
    assigneeName: order.assignee || '',
    estimatedMinutes: diffMinutes(order.estimatedStart, order.estimatedEnd),
    status: legacyStatusToBlockStatus(order.status),
    sortOrder: 0,
  });
  return created ? [created] : [];
}
