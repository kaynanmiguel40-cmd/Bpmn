import type { ZodObject, ZodRawShape, ZodTypeAny } from 'zod';
import { supabase } from './supabaseClient';
import { toast } from '../contexts/ToastContext';
import { validateAndSanitize, validatePartial } from './validation';
import {
  saveOffline,
  getOffline,
  putOffline,
  removeOffline,
  markPendingSync,
  getPendingSync,
  clearPendingSync,
  type OfflineRow,
} from './offlineDB';

// ==================== TIPOS ====================

export interface CRUDServiceConfig<TDomain, TRow extends OfflineRow = OfflineRow> {
  table: string;
  localKey?: string;
  idPrefix?: string;
  transform?: (row: TRow) => TDomain;
  fieldMap: Record<string, string>;
  schema?: ZodTypeAny;
  richFields?: string[];
  orderBy?: string;
  orderAsc?: boolean;
}

export interface PaginatedResult<T> {
  data: T[];
  count: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface CRUDService<TDomain> {
  getAll(): Promise<TDomain[]>;
  getPaginated(
    page?: number,
    pageSize?: number,
    filters?: Record<string, unknown>,
  ): Promise<PaginatedResult<TDomain>>;
  getById(id: string): Promise<TDomain | null>;
  create(item: Record<string, unknown>, extraRow?: Record<string, unknown>): Promise<TDomain | null>;
  update(id: string, updates: Record<string, unknown>): Promise<TDomain | null>;
  remove(id: string): Promise<boolean>;
  bulkUpdate(field: string, value: unknown, filterField: string, filterValue: unknown): Promise<void>;
  syncPending(): Promise<number>;
}

// ==================== HELPERS ====================

/** Converte um objeto camelCase para snake_case usando o mapeamento fornecido. */
function toSnakeCase(obj: Record<string, unknown>, fieldMap: Record<string, string>): Record<string, unknown> {
  const result: Record<string, unknown> = {};
  for (const [camel, snake] of Object.entries(fieldMap)) {
    if (obj[camel] !== undefined) {
      result[snake] = obj[camel];
    }
  }
  return result;
}

function generateLocalId(_prefix?: string): string {
  return crypto.randomUUID();
}

// ==================== SYNC ONLINE/OFFLINE ====================

const registeredServices: Array<{ syncPending: () => Promise<number> }> = [];

function registerForSync(service: { syncPending: () => Promise<number> }): void {
  registeredServices.push(service);
}

/** Tenta sync com retry e backoff exponencial */
async function syncWithRetry(maxRetries = 3): Promise<number> {
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      let synced = 0;
      for (const svc of registeredServices) {
        synced += await svc.syncPending();
      }
      if (synced > 0) {
        toast(`${synced} item(ns) sincronizado(s) com o servidor`, 'success');
      }
      return synced;
    } catch (err) {
      const delay = Math.min(1000 * 2 ** attempt, 30000);
      console.warn(`[Sync] Tentativa ${attempt + 1}/${maxRetries} falhou, retry em ${delay}ms:`, (err as Error)?.message || err);
      if (attempt < maxRetries - 1) {
        await new Promise(r => setTimeout(r, delay));
      }
    }
  }
  console.error('[Sync] Todas as tentativas falharam. Itens permanecem na fila offline.');
  toast('Falha ao sincronizar — tentaremos novamente mais tarde', 'warning');
  return 0;
}

if (typeof window !== 'undefined') {
  window.addEventListener('online', () => {
    console.log('[Sync] Conexao restaurada, sincronizando...');
    syncWithRetry();
  });
}

// ==================== FACTORY ====================

/**
 * Factory que cria operações CRUD com fallback automático para IndexedDB (via Dexie).
 * Inclui validação Zod, sanitização, e paginação.
 */
export function createCRUDService<TDomain = unknown, TRow extends OfflineRow = OfflineRow>(
  config: CRUDServiceConfig<TDomain, TRow>,
): CRUDService<TDomain> {
  const {
    table,
    idPrefix,
    transform,
    fieldMap,
    schema,
    richFields,
    orderBy = 'created_at',
    orderAsc = true,
  } = config;

  const apply = (row: TRow): TDomain => (transform ? transform(row) : (row as unknown as TDomain));

  async function getAll(): Promise<TDomain[]> {
    const { data, error } = await supabase
      .from(table)
      .select('*')
      .order(orderBy, { ascending: orderAsc });

    if (error) {
      console.error(`[${table}] GET ALL erro:`, error.message, error.code, error.details, error.hint);
      toast(`Offline [${table}]: ${error.message}`, 'warning');
      const local = await getOffline<TRow>(table);
      return local.map(apply);
    }

    // saveOffline faz clear()+bulkPut, entao precisamos preservar linhas criadas
    // ou editadas offline e ainda nao sincronizadas — senao um getAll() (refetch)
    // apaga o registro local pendente e o syncPending nao acha mais o payload
    // (perda de dado silenciosa + fila orfa).
    let rows = (data as TRow[]) || [];
    try {
      const pending = await getPendingSync();
      const pendingIds = new Set(
        pending
          .filter(p => p.table_name === table && p.operation === 'upsert')
          .map(p => p.item_id),
      );
      if (pendingIds.size > 0) {
        const localBefore = await getOffline<TRow>(table);
        const preserved = localBefore.filter(r => pendingIds.has(r.id));
        const serverIds = new Set(rows.map(r => r.id));
        // versao local pendente vence a do servidor; mantem os que o servidor ainda nao tem
        rows = rows.map(r => preserved.find(p => p.id === r.id) || r);
        for (const p of preserved) if (!serverIds.has(p.id)) rows.push(p);
      }
    } catch (err) {
      console.warn(`[${table}] merge pendingSync falhou:`, (err as Error)?.message || err);
    }

    saveOffline(table, rows).catch(err =>
      console.warn(`[${table}] saveOffline falhou:`, (err as Error)?.message || err),
    );

    return rows.map(apply);
  }

  async function getPaginated(
    page = 1,
    pageSize = 20,
    filters: Record<string, unknown> = {},
  ): Promise<PaginatedResult<TDomain>> {
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    let query = supabase
      .from(table)
      .select('*', { count: 'exact' })
      .order(orderBy, { ascending: orderAsc })
      .range(from, to);

    for (const [field, value] of Object.entries(filters)) {
      if (value !== undefined && value !== null && value !== '') {
        query = query.eq(field, value);
      }
    }

    const { data, error, count } = await query;

    if (error) {
      toast('Modo offline — usando dados locais', 'warning');
      const all = await getOffline<TRow>(table);
      // Aplica os mesmos filtros do online; antes o fallback ignorava `filters`
      // e devolvia linhas de outras entidades (ex.: projetos de outra empresa).
      const filtered = all.filter(r =>
        Object.entries(filters).every(([field, value]) =>
          value === undefined || value === null || value === ''
            ? true
            : (r as Record<string, unknown>)[field] === value,
        ),
      );
      const sliced = filtered.slice(from, to + 1);
      return {
        data: sliced.map(apply),
        count: filtered.length,
        page,
        pageSize,
        totalPages: Math.ceil(filtered.length / pageSize),
      };
    }

    return {
      data: ((data as TRow[]) || []).map(apply),
      count: count || 0,
      page,
      pageSize,
      totalPages: Math.ceil((count || 0) / pageSize),
    };
  }

  async function getById(id: string): Promise<TDomain | null> {
    const { data, error } = await supabase
      .from(table)
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      const local = await getOffline<TRow>(table);
      const item = local.find(r => r.id === id);
      return item ? apply(item) : null;
    }
    return apply(data as TRow);
  }

  async function create(
    item: Record<string, unknown>,
    extraRow: Record<string, unknown> = {},
  ): Promise<TDomain | null> {
    let payload = item;

    if (schema) {
      const validation = validateAndSanitize(schema, payload, { richFields });
      if (!validation.success || !validation.data) {
        toast(validation.error || 'Dados invalidos', 'error');
        return null;
      }
      payload = validation.data as Record<string, unknown>;
    }

    const now = new Date().toISOString();
    const generatedId = (extraRow.id as string | undefined) || generateLocalId(idPrefix);
    const snakeData: Record<string, unknown> = {
      id: generatedId,
      ...toSnakeCase(payload, fieldMap),
      ...extraRow,
    };

    const { data, error } = await supabase
      .from(table)
      .insert([snakeData])
      .select()
      .single();

    if (error) {
      console.error(`[${table}] CREATE erro:`, error.message, error.code, error.details, error.hint);
      const localId = generateLocalId(idPrefix);
      const newItem = { id: localId, ...snakeData, created_at: now, updated_at: now } as unknown as TRow;
      await putOffline(table, newItem);
      await markPendingSync(table, newItem.id, 'upsert');
      toast(`Salvo localmente: ${error.message || 'sem conexao'}`, 'warning');
      return apply(newItem);
    }

    if (data) await putOffline(table, data as TRow);
    return apply(data as TRow);
  }

  async function update(id: string, updates: Record<string, unknown>): Promise<TDomain | null> {
    let payload = updates;

    if (schema && (schema as ZodObject<ZodRawShape>).partial) {
      const validation = validatePartial(schema as ZodObject<ZodRawShape>, payload, { richFields });
      if (!validation.success || !validation.data) {
        toast(validation.error || 'Dados invalidos', 'error');
        return null;
      }
      payload = validation.data as Record<string, unknown>;
    }

    const updateData: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
      ...toSnakeCase(payload, fieldMap),
    };

    const { data, error } = await supabase
      .from(table)
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error(`[${table}] UPDATE erro:`, error.message, error.code, error.details, error.hint);
      const local = await getOffline<TRow>(table);
      const item = local.find(r => r.id === id);
      if (item) {
        const updated = { ...item, ...updateData } as TRow;
        await putOffline(table, updated);
        await markPendingSync(table, id, 'upsert');
        return apply(updated);
      }
      return null;
    }

    if (data) await putOffline(table, data as TRow);
    return apply(data as TRow);
  }

  async function remove(id: string): Promise<boolean> {
    const { error } = await supabase
      .from(table)
      .delete()
      .eq('id', id);

    if (error) {
      await removeOffline(table, id);
      await markPendingSync(table, id, 'delete');
    } else {
      await removeOffline(table, id);
    }
    return !error;
  }

  async function bulkUpdate(
    field: string,
    value: unknown,
    filterField: string,
    filterValue: unknown,
  ): Promise<void> {
    const updateData: Record<string, unknown> = { [field]: value, updated_at: new Date().toISOString() };

    const { error } = await supabase
      .from(table)
      .update(updateData)
      .eq(filterField, filterValue as never);

    if (error) {
      const local = await getOffline<TRow>(table);
      const affected: string[] = [];
      const updated = local.map(r => {
        if ((r as Record<string, unknown>)[filterField] === filterValue) {
          affected.push((r as TRow).id);
          return { ...r, ...updateData } as TRow;
        }
        return r;
      }) as TRow[];
      await saveOffline(table, updated);
      // Enfileira p/ sincronizar: antes a alteracao offline ficava so no cache
      // local e era perdida no proximo getAll (sobrescrito pelo servidor).
      for (const id of affected) await markPendingSync(table, id, 'upsert');
    }
  }

  async function syncPending(): Promise<number> {
    const pending = await getPendingSync();
    const tablePending = pending.filter(p => p.table_name === table);
    let synced = 0;

    for (const entry of tablePending) {
      let success = false;

      if (entry.operation === 'delete') {
        const { error } = await supabase.from(table).delete().eq('id', entry.item_id);
        success = !error;
        if (error) console.warn(`[${table}] Sync delete falhou para ${entry.item_id}:`, error.message);
      } else {
        const local = await getOffline<TRow>(table);
        const item = local.find(r => r.id === entry.item_id);
        if (item) {
          const { error } = await supabase.from(table).upsert([item], { onConflict: 'id' });
          success = !error;
          if (error) console.warn(`[${table}] Sync upsert falhou para ${entry.item_id}:`, error.message);
        }
      }

      if (success) {
        synced++;
        await clearPendingSync(table, entry.item_id);
      }
    }
    return synced;
  }

  const service: CRUDService<TDomain> = {
    getAll,
    getPaginated,
    getById,
    create,
    update,
    remove,
    bulkUpdate,
    syncPending,
  };

  registerForSync(service);

  return service;
}
