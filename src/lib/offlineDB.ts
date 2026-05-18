import Dexie, { type Table } from 'dexie';

/**
 * Banco de dados IndexedDB via Dexie.
 * Substitui localStorage para offline com capacidade muito maior.
 */
export interface PendingSyncRow {
  id: string;
  table_name: string;
  item_id: string;
  operation: 'upsert' | 'delete';
  created_at: string;
}

export interface OfflineRow {
  id: string;
  updated_at?: string | null;
  [key: string]: unknown;
}

class FynessOSDB extends Dexie {
  // `declare` evita que useDefineForClassFields:true emita um
  // `this.pending_sync = undefined` que sobrescreveria a tabela criada
  // por Dexie em version().stores().
  declare pending_sync: Table<PendingSyncRow, string>;

  constructor() {
    super('FynessOS');

    this.version(1).stores({
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

    this.version(2).stores({
      clients: 'id, name, email, company',
    });

    this.version(3).stores({
      eap_undo_history: 'id',
    });

    this.version(4).stores({
      os_comments: 'id, order_id, user_id, created_at',
    });

    this.version(5).stores({
      process_orders: 'id, project_id, element_id, status, created_at',
    });

    this.version(6).stores({
      crm_companies: 'id, name, segment, created_by, deleted_at',
      crm_contacts: 'id, name, email, company_id, status, created_by, deleted_at',
      crm_pipelines: 'id, name, is_default, created_by',
      crm_pipeline_stages: 'id, pipeline_id, position',
      crm_deals: 'id, pipeline_id, stage_id, contact_id, company_id, status, created_by, deleted_at',
      crm_activities: 'id, contact_id, deal_id, type, completed, start_date, created_by, deleted_at',
      crm_settings: 'id, user_id',
    });
  }
}

const db = new FynessOSDB();

// ==================== OPERACOES ====================

/** Salva um array de items no IndexedDB (substitui todos). */
export async function saveOffline<T extends OfflineRow>(tableName: string, items: T[]): Promise<void> {
  try {
    const table = db.table<T>(tableName);
    await table.clear();
    if (items && items.length > 0) {
      await table.bulkPut(items);
    }
  } catch (err) {
    console.warn(`[OfflineDB] Erro ao salvar ${tableName}:`, err);
  }
}

/** Recupera todos os items de uma tabela. */
export async function getOffline<T extends OfflineRow = OfflineRow>(tableName: string): Promise<T[]> {
  try {
    const table = db.table<T>(tableName);
    return await table.toArray();
  } catch (err) {
    console.warn(`[OfflineDB] Erro ao ler ${tableName}:`, err);
    return [];
  }
}

/** Salva ou atualiza um unico item. */
export async function putOffline<T extends OfflineRow>(tableName: string, item: T): Promise<void> {
  try {
    const table = db.table<T>(tableName);
    await table.put(item);
  } catch (err) {
    console.warn(`[OfflineDB] Erro ao salvar item em ${tableName}:`, err);
  }
}

/** Remove um item por ID. */
export async function removeOffline(tableName: string, id: string): Promise<void> {
  try {
    const table = db.table(tableName);
    await table.delete(id);
  } catch (err) {
    console.warn(`[OfflineDB] Erro ao remover de ${tableName}:`, err);
  }
}

/** Marca um item como pendente de sincronizacao. */
export async function markPendingSync(
  tableName: string,
  id: string,
  operation: 'upsert' | 'delete' = 'upsert'
): Promise<void> {
  try {
    await db.pending_sync.put({
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

/** Retorna todos os items pendentes de sincronizacao. */
export async function getPendingSync(): Promise<PendingSyncRow[]> {
  try {
    return await db.pending_sync.toArray();
  } catch {
    return [];
  }
}

/** Remove item da fila de sincronizacao. */
export async function clearPendingSync(tableName: string, id: string): Promise<void> {
  try {
    await db.pending_sync.delete(`${tableName}_${id}`);
  } catch (err) {
    console.warn('[OfflineDB] Erro ao limpar pendingSync:', err);
  }
}

/** Resolve conflito: last-write-wins baseado em updated_at. */
export function resolveConflict<T extends OfflineRow>(local: T | null, remote: T | null): T | null {
  if (!local || !remote) return remote || local;

  const localTime = new Date(local.updated_at || 0).getTime();
  const remoteTime = new Date(remote.updated_at || 0).getTime();

  return remoteTime >= localTime ? remote : local;
}

export default db;
