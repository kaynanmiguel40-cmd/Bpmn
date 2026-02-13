import { createCRUDService } from './serviceFactory';
import { supabase } from './supabase';

// ==================== TRANSFORMADOR ====================

function dbToNotification(row) {
  if (!row) return null;
  return {
    id: row.id,
    userId: row.user_id,
    type: row.type || 'info',
    title: row.title || '',
    message: row.message || '',
    entityType: row.entity_type || null,
    entityId: row.entity_id || null,
    isRead: row.is_read || false,
    createdAt: row.created_at,
  };
}

// ==================== SERVICE (via factory) ====================

const notifService = createCRUDService({
  table: 'notifications',
  localKey: 'notifications',
  idPrefix: 'notif',
  transform: dbToNotification,
  fieldMap: {
    userId: 'user_id',
    type: 'type',
    title: 'title',
    message: 'message',
    entityType: 'entity_type',
    entityId: 'entity_id',
    isRead: 'is_read',
  },
  orderBy: 'created_at',
  orderAsc: false,
});

// ==================== EXPORTS BASICOS ====================

export const getNotifications = notifService.getAll;
export const deleteNotification = notifService.remove;

// ==================== FUNCOES ESPECIAIS ====================

export async function getUnreadCount() {
  const { count, error } = await supabase
    .from('notifications')
    .select('*', { count: 'exact', head: true })
    .eq('is_read', false);

  if (error) {
    const local = JSON.parse(localStorage.getItem('notifications') || '[]');
    return local.filter(n => !n.is_read).length;
  }
  return count || 0;
}

export async function markAsRead(id) {
  return notifService.update(id, { isRead: true });
}

export async function markAllAsRead() {
  const { error } = await supabase
    .from('notifications')
    .update({ is_read: true, updated_at: new Date().toISOString() })
    .eq('is_read', false);

  if (error) {
    const local = JSON.parse(localStorage.getItem('notifications') || '[]');
    const updated = local.map(n => ({ ...n, is_read: true }));
    localStorage.setItem('notifications', JSON.stringify(updated));
  }
}

export async function notify({ userId, type = 'info', title, message, entityType = null, entityId = null }) {
  const result = await notifService.create({
    userId,
    type,
    title,
    message,
    entityType,
    entityId,
    isRead: false,
  });
  // Disparar evento custom para atualizar o bell em tempo real
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('notification-created'));
  }
  return result;
}

export async function clearAllNotifications() {
  const all = await getNotifications();
  for (const n of all) {
    await deleteNotification(n.id);
  }
}
