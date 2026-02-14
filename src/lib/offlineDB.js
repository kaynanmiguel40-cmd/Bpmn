import Dexie from 'dexie';

/**
 * Banco de dados IndexedDB via Dexie.
 * Substitui localStorage para offline com capacidade muito maior.
 */
const db = new Dexie('FynessOS');

db.version(1).stores({
  os_orders: 'id, status, priority, assignee, project_id, type, created_at, updated_at',
  os_sectors: 'id, label',
  os_projects: 'id, name, sector_id',
  os_comments: 'id, order_id, created_at',
  os_time_entries: 'id, order_id, user_name, created_at',
  os_templates: 'id, name',
  team_members: 'id, name, email, auth_user_id',
  agenda_events: 'id, start_date, type, assignee',
  notifications: 'id, user_id, is_read, created_at',
  activity_logs: 'id, entity_type, entity_id, created_at',
  kpi_snapshots: 'id, period, user_name',
  report_schedules: 'id, user_id, is_active',
  companies: 'id, name',
  projects: 'id, name, company_id',
  pending_sync: 'id, table_name, operation, created_at',
});

db.version(2).stores({
  clients: 'id, name, email, company',
});

// ==================== OPERACOES ====================

/**
 * Salva um array de items no IndexedDB (substitui todos).
 */
export async function saveOffline(tableName, items) {
  try {
    const table = db.table(tableName);
    await table.clear();
    if (items && items.length > 0) {
      await table.bulkPut(items);
    }
  } catch (err) {
    console.warn(`[OfflineDB] Erro ao salvar ${tableName}:`, err);
    // Fallback para localStorage
    try {
      localStorage.setItem(tableName, JSON.stringify(items));
    } catch {
      // localStorage tambem falhou
    }
  }
}

/**
 * Recupera todos os items de uma tabela.
 */
export async function getOffline(tableName) {
  try {
    const table = db.table(tableName);
    return await table.toArray();
  } catch (err) {
    console.warn(`[OfflineDB] Erro ao ler ${tableName}:`, err);
    // Fallback para localStorage
    try {
      return JSON.parse(localStorage.getItem(tableName) || '[]');
    } catch {
      return [];
    }
  }
}

/**
 * Salva ou atualiza um unico item.
 */
export async function putOffline(tableName, item) {
  try {
    const table = db.table(tableName);
    await table.put(item);
  } catch (err) {
    console.warn(`[OfflineDB] Erro ao salvar item em ${tableName}:`, err);
  }
}

/**
 * Remove um item por ID.
 */
export async function removeOffline(tableName, id) {
  try {
    const table = db.table(tableName);
    await table.delete(id);
  } catch (err) {
    console.warn(`[OfflineDB] Erro ao remover de ${tableName}:`, err);
  }
}

/**
 * Marca um item como pendente de sincronizacao.
 */
export async function markPendingSync(tableName, id, operation = 'upsert') {
  try {
    await db.table('pending_sync').put({
      id: `${tableName}_${id}`,
      table_name: tableName,
      item_id: id,
      operation,
      created_at: new Date().toISOString(),
    });
  } catch (err) {
    console.warn('[OfflineDB] Erro ao marcar pendingSync:', err);
  }
}

/**
 * Retorna todos os items pendentes de sincronizacao.
 */
export async function getPendingSync() {
  try {
    return await db.table('pending_sync').toArray();
  } catch {
    return [];
  }
}

/**
 * Remove item da fila de sincronizacao.
 */
export async function clearPendingSync(tableName, id) {
  try {
    await db.table('pending_sync').delete(`${tableName}_${id}`);
  } catch (err) {
    console.warn('[OfflineDB] Erro ao limpar pendingSync:', err);
  }
}

/**
 * Resolve conflito: last-write-wins baseado em updated_at.
 */
export function resolveConflict(local, remote) {
  if (!local || !remote) return remote || local;

  const localTime = new Date(local.updated_at || 0).getTime();
  const remoteTime = new Date(remote.updated_at || 0).getTime();

  return remoteTime >= localTime ? remote : local;
}

export default db;
