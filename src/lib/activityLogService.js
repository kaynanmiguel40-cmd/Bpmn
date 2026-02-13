import { createCRUDService } from './serviceFactory';
import { supabase } from './supabase';

// ==================== TRANSFORMADOR ====================

function dbToActivity(row) {
  if (!row) return null;
  return {
    id: row.id,
    userId: row.user_id,
    userName: row.user_name || 'Sistema',
    action: row.action || '',
    entityType: row.entity_type || '',
    entityId: row.entity_id || '',
    entityTitle: row.entity_title || '',
    oldValues: row.old_values || null,
    newValues: row.new_values || null,
    createdAt: row.created_at,
  };
}

// ==================== SERVICE (via factory) ====================

const activityService = createCRUDService({
  table: 'activity_logs',
  localKey: 'activity_logs',
  idPrefix: 'act',
  transform: dbToActivity,
  fieldMap: {
    userId: 'user_id',
    userName: 'user_name',
    action: 'action',
    entityType: 'entity_type',
    entityId: 'entity_id',
    entityTitle: 'entity_title',
    oldValues: 'old_values',
    newValues: 'new_values',
  },
  orderBy: 'created_at',
  orderAsc: false,
});

// ==================== EXPORTS ====================

export const getAllActivities = activityService.getAll;

export async function getRecentActivities(limit = 20) {
  const { data, error } = await supabase
    .from('activity_logs')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) {
    const local = JSON.parse(localStorage.getItem('activity_logs') || '[]');
    return local.slice(0, limit).map(dbToActivity);
  }
  return (data || []).map(dbToActivity);
}

export async function getActivitiesForEntity(entityType, entityId, limit = 50) {
  const { data, error } = await supabase
    .from('activity_logs')
    .select('*')
    .eq('entity_type', entityType)
    .eq('entity_id', entityId)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) {
    const local = JSON.parse(localStorage.getItem('activity_logs') || '[]');
    return local
      .filter(r => r.entity_type === entityType && r.entity_id === entityId)
      .slice(0, limit)
      .map(dbToActivity);
  }
  return (data || []).map(dbToActivity);
}

export async function logActivity({ userId, userName, action, entityType, entityId, entityTitle, oldValues = null, newValues = null }) {
  return activityService.create({
    userId,
    userName,
    action,
    entityType,
    entityId,
    entityTitle,
    oldValues,
    newValues,
  });
}

// ==================== ACTION LABELS ====================

export const ACTION_LABELS = {
  created: 'criou',
  updated: 'atualizou',
  deleted: 'excluiu',
  status_changed: 'alterou status de',
  assigned: 'atribuiu',
  commented: 'comentou em',
  completed: 'concluiu',
  started: 'iniciou',
  attachment_added: 'anexou arquivo em',
};

export const ENTITY_LABELS = {
  os_order: 'O.S.',
  os_project: 'Projeto',
  agenda_event: 'Evento',
  sector: 'Setor',
};
