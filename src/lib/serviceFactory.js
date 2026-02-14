import { supabase } from './supabase';
import { toast } from '../contexts/ToastContext';
import { validateAndSanitize, validatePartial } from './validation';
import { saveOffline, getOffline, putOffline, removeOffline, markPendingSync, getPendingSync, clearPendingSync } from './offlineDB';

/**
 * Converte um objeto camelCase para snake_case usando o mapeamento fornecido.
 */
function toSnakeCase(obj, fieldMap) {
  const result = {};
  for (const [camel, snake] of Object.entries(fieldMap)) {
    if (obj[camel] !== undefined) {
      result[snake] = obj[camel];
    }
  }
  return result;
}

function generateLocalId(prefix) {
  return `${prefix}_${Date.now()}`;
}

// ==================== SYNC ONLINE/OFFLINE ====================

const registeredServices = [];

function registerForSync(service) {
  registeredServices.push(service);
}

async function syncPendingItems() {
  let synced = 0;
  for (const svc of registeredServices) {
    synced += await svc.syncPending();
  }
  if (synced > 0) {
    toast(`${synced} item(ns) sincronizado(s) com o servidor`, 'success');
  }
}

// Detectar reconexão
if (typeof window !== 'undefined') {
  window.addEventListener('online', () => {
    console.log('[Sync] Conexao restaurada, sincronizando...');
    syncPendingItems();
  });
}

// ==================== FACTORY ====================

/**
 * Factory que cria operações CRUD com fallback automático para IndexedDB (via Dexie).
 * Inclui validação Zod, sanitização, e paginação.
 */
export function createCRUDService(config) {
  const {
    table,
    localKey,
    idPrefix,
    transform,
    fieldMap,
    schema,
    orderBy = 'created_at',
    orderAsc = true,
  } = config;

  // ==================== GET ALL ====================
  async function getAll() {
    const { data, error } = await supabase
      .from(table)
      .select('*')
      .order(orderBy, { ascending: orderAsc });

    if (error) {
      console.error(`[${table}] GET ALL erro:`, error.message, error.code, error.details, error.hint);
      toast(`Offline [${table}]: ${error.message}`, 'warning');
      const local = await getOffline(table);
      return transform ? local.map(r => transform(r) || r) : local;
    }

    // Salvar no IndexedDB para acesso offline futuro
    saveOffline(table, data || []);

    return transform ? (data || []).map(transform) : (data || []);
  }

  // ==================== GET PAGINATED ====================
  async function getPaginated(page = 1, pageSize = 20, filters = {}) {
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    let query = supabase
      .from(table)
      .select('*', { count: 'exact' })
      .order(orderBy, { ascending: orderAsc })
      .range(from, to);

    // Aplicar filtros dinamicos
    for (const [field, value] of Object.entries(filters)) {
      if (value !== undefined && value !== null && value !== '') {
        query = query.eq(field, value);
      }
    }

    const { data, error, count } = await query;

    if (error) {
      toast(`Modo offline — usando dados locais`, 'warning');
      const local = await getOffline(table);
      const sliced = local.slice(from, to + 1);
      return {
        data: transform ? sliced.map(r => transform(r) || r) : sliced,
        count: local.length,
        page,
        pageSize,
        totalPages: Math.ceil(local.length / pageSize),
      };
    }

    return {
      data: transform ? (data || []).map(transform) : (data || []),
      count: count || 0,
      page,
      pageSize,
      totalPages: Math.ceil((count || 0) / pageSize),
    };
  }

  // ==================== GET BY ID ====================
  async function getById(id) {
    const { data, error } = await supabase
      .from(table)
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      const local = await getOffline(table);
      const item = local.find(r => r.id === id);
      return item ? (transform ? transform(item) : item) : null;
    }
    return transform ? transform(data) : data;
  }

  // ==================== CREATE ====================
  async function create(item, extraRow = {}) {
    // Validar com schema Zod se disponivel
    if (schema) {
      const validation = validateAndSanitize(schema, item);
      if (!validation.success) {
        toast(validation.error, 'error');
        return null;
      }
      item = validation.data;
    }

    const now = new Date().toISOString();
    const row = {
      id: generateLocalId(idPrefix),
      ...toSnakeCase(item, fieldMap),
      ...extraRow,
    };

    const { data, error } = await supabase
      .from(table)
      .insert([row])
      .select()
      .single();

    if (error) {
      console.error(`[${table}] CREATE erro:`, error.message, error.code, error.details, error.hint);
      const newItem = { ...row, created_at: now, updated_at: now };
      await putOffline(table, newItem);
      await markPendingSync(table, newItem.id, 'upsert');
      toast(`Salvo localmente: ${error.message || 'sem conexao'}`, 'warning');
      return transform ? transform(newItem) : newItem;
    }
    return transform ? transform(data) : data;
  }

  // ==================== UPDATE ====================
  async function update(id, updates) {
    // Validar parcialmente com schema Zod se disponivel
    if (schema) {
      const validation = validatePartial(schema, updates);
      if (!validation.success) {
        toast(validation.error, 'error');
        return null;
      }
      updates = validation.data;
    }

    const updateData = {
      updated_at: new Date().toISOString(),
      ...toSnakeCase(updates, fieldMap),
    };

    const { data, error } = await supabase
      .from(table)
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error(`[${table}] UPDATE erro:`, error.message, error.code, error.details, error.hint);
      const local = await getOffline(table);
      const item = local.find(r => r.id === id);
      if (item) {
        const updated = { ...item, ...updateData };
        await putOffline(table, updated);
        await markPendingSync(table, id, 'upsert');
        return transform ? transform(updated) : updated;
      }
      return null;
    }
    return transform ? transform(data) : data;
  }

  // ==================== DELETE ====================
  async function remove(id) {
    const { error } = await supabase
      .from(table)
      .delete()
      .eq('id', id);

    if (error) {
      await removeOffline(table, id);
      await markPendingSync(table, id, 'delete');
    }
    return !error;
  }

  // ==================== BULK UPDATE ====================
  async function bulkUpdate(field, value, filterField, filterValue) {
    const updateData = { [field]: value, updated_at: new Date().toISOString() };

    const { error } = await supabase
      .from(table)
      .update(updateData)
      .eq(filterField, filterValue);

    if (error) {
      const local = await getOffline(table);
      const updated = local.map(r =>
        r[filterField] === filterValue ? { ...r, ...updateData } : r
      );
      await saveOffline(table, updated);
    }
  }

  // ==================== SYNC PENDING ====================
  async function syncPending() {
    const pending = await getPendingSync();
    const tablePending = pending.filter(p => p.table_name === table);
    let synced = 0;

    for (const entry of tablePending) {
      if (entry.operation === 'delete') {
        const { error } = await supabase.from(table).delete().eq('id', entry.item_id);
        if (!error) {
          synced++;
          await clearPendingSync(table, entry.item_id);
        }
      } else {
        // upsert
        const local = await getOffline(table);
        const item = local.find(r => r.id === entry.item_id);
        if (item) {
          const { error } = await supabase.from(table).upsert([item], { onConflict: 'id' });
          if (!error) {
            synced++;
            await clearPendingSync(table, entry.item_id);
          }
        }
      }
    }
    return synced;
  }

  const service = { getAll, getPaginated, getById, create, update, remove, bulkUpdate, syncPending };

  // Registrar para sync automático
  registerForSync(service);

  return service;
}
