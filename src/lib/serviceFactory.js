import { supabase } from './supabase';
import { toast } from '../contexts/ToastContext';

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

const PENDING_SYNC_KEY = '_pendingSync';
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
    console.log('🌐 Conexão restaurada, sincronizando...');
    syncPendingItems();
  });
}

// ==================== FACTORY ====================

/**
 * Factory que cria operações CRUD com fallback automático para localStorage.
 */
export function createCRUDService(config) {
  const {
    table,
    localKey,
    idPrefix,
    transform,
    fieldMap,
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
      toast(`Modo offline — usando dados locais`, 'warning');
      const local = JSON.parse(localStorage.getItem(localKey) || '[]');
      return transform ? local.map(r => transform(r) || r) : local;
    }
    return transform ? (data || []).map(transform) : (data || []);
  }

  // ==================== GET BY ID ====================
  async function getById(id) {
    const { data, error } = await supabase
      .from(table)
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      const local = JSON.parse(localStorage.getItem(localKey) || '[]');
      const item = local.find(r => r.id === id);
      return item ? (transform ? transform(item) : item) : null;
    }
    return transform ? transform(data) : data;
  }

  // ==================== CREATE ====================
  async function create(item, extraRow = {}) {
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
      const local = JSON.parse(localStorage.getItem(localKey) || '[]');
      const newItem = { ...row, created_at: now, updated_at: now, _pendingSync: true };
      local.push(newItem);
      localStorage.setItem(localKey, JSON.stringify(local));
      toast('Salvo localmente (sem conexão)', 'warning');
      return transform ? transform(newItem) : newItem;
    }
    return transform ? transform(data) : data;
  }

  // ==================== UPDATE ====================
  async function update(id, updates) {
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
      const local = JSON.parse(localStorage.getItem(localKey) || '[]');
      const idx = local.findIndex(r => r.id === id);
      if (idx >= 0) {
        local[idx] = { ...local[idx], ...updateData, _pendingSync: true };
        localStorage.setItem(localKey, JSON.stringify(local));
        return transform ? transform(local[idx]) : local[idx];
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
      const local = JSON.parse(localStorage.getItem(localKey) || '[]');
      localStorage.setItem(localKey, JSON.stringify(local.filter(r => r.id !== id)));
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
      const local = JSON.parse(localStorage.getItem(localKey) || '[]');
      const updated = local.map(r =>
        r[filterField] === filterValue ? { ...r, ...updateData } : r
      );
      localStorage.setItem(localKey, JSON.stringify(updated));
    }
  }

  // ==================== SYNC PENDING ====================
  async function syncPending() {
    const local = JSON.parse(localStorage.getItem(localKey) || '[]');
    const pending = local.filter(r => r._pendingSync);
    let synced = 0;

    for (const item of pending) {
      const row = { ...item };
      delete row._pendingSync;

      const { error } = await supabase
        .from(table)
        .upsert([row], { onConflict: 'id' });

      if (!error) {
        synced++;
        // Remover flag _pendingSync
        const current = JSON.parse(localStorage.getItem(localKey) || '[]');
        const idx = current.findIndex(r => r.id === item.id);
        if (idx >= 0) {
          delete current[idx]._pendingSync;
          localStorage.setItem(localKey, JSON.stringify(current));
        }
      }
    }
    return synced;
  }

  const service = { getAll, getById, create, update, remove, bulkUpdate, syncPending };

  // Registrar para sync automático
  registerForSync(service);

  return service;
}
