import { createCRUDService } from './serviceFactory';
import { supabase } from './supabase';

// ==================== TRANSFORMADOR ====================

function dbToTimeEntry(row) {
  if (!row) return null;
  return {
    id: row.id,
    orderId: row.order_id,
    userName: row.user_name || '',
    startTime: row.start_time,
    endTime: row.end_time || null,
    durationMinutes: row.duration_minutes || 0,
    notes: row.notes || '',
    createdAt: row.created_at,
  };
}

// ==================== SERVICE (via factory) ====================

const entryService = createCRUDService({
  table: 'os_time_entries',
  localKey: 'os_time_entries',
  idPrefix: 'te',
  transform: dbToTimeEntry,
  fieldMap: {
    orderId: 'order_id',
    userName: 'user_name',
    startTime: 'start_time',
    endTime: 'end_time',
    durationMinutes: 'duration_minutes',
    notes: 'notes',
  },
  orderBy: 'created_at',
  orderAsc: false,
});

// ==================== EXPORTS ====================

export const deleteTimeEntry = entryService.remove;

export async function getEntriesForOrder(orderId) {
  const { data, error } = await supabase
    .from('os_time_entries')
    .select('*')
    .eq('order_id', orderId)
    .order('created_at', { ascending: false });

  if (error) {
    const local = JSON.parse(localStorage.getItem('os_time_entries') || '[]');
    return local.filter(e => e.order_id === orderId).map(dbToTimeEntry);
  }
  return (data || []).map(dbToTimeEntry);
}

export async function getEntriesForUser(userName, startDate, endDate) {
  let query = supabase
    .from('os_time_entries')
    .select('*')
    .eq('user_name', userName)
    .order('start_time', { ascending: false });

  if (startDate) query = query.gte('start_time', startDate);
  if (endDate) query = query.lte('start_time', endDate);

  const { data, error } = await query;

  if (error) {
    const local = JSON.parse(localStorage.getItem('os_time_entries') || '[]');
    return local
      .filter(e => e.user_name === userName)
      .map(dbToTimeEntry);
  }
  return (data || []).map(dbToTimeEntry);
}

export async function startTimer(orderId, userName) {
  return entryService.create({
    orderId,
    userName,
    startTime: new Date().toISOString(),
    endTime: null,
    durationMinutes: 0,
    notes: '',
  });
}

export async function stopTimer(entryId) {
  const now = new Date();

  // Buscar entry para calcular duracao
  const entry = await entryService.getById(entryId);
  if (!entry) return null;

  const start = new Date(entry.startTime);
  const durationMinutes = Math.round((now - start) / 60000);

  return entryService.update(entryId, {
    endTime: now.toISOString(),
    durationMinutes,
  });
}

export async function addManualEntry({ orderId, userName, startTime, endTime, notes = '' }) {
  const start = new Date(startTime);
  const end = new Date(endTime);
  const durationMinutes = Math.round((end - start) / 60000);

  return entryService.create({
    orderId,
    userName,
    startTime: start.toISOString(),
    endTime: end.toISOString(),
    durationMinutes,
    notes,
  });
}

export async function getTotalHoursForOrder(orderId) {
  const entries = await getEntriesForOrder(orderId);
  return entries.reduce((sum, e) => sum + (e.durationMinutes || 0), 0);
}
