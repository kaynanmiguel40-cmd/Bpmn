import { createCRUDService } from './serviceFactory';

// ==================== TRANSFORMADOR ====================

function dbToSchedule(row) {
  if (!row) return null;
  return {
    id: row.id,
    userId: row.user_id || '',
    frequency: row.frequency, // 'weekly' | 'monthly'
    dayOfWeek: row.day_of_week, // 0-6 (domingo-sabado), para weekly
    dayOfMonth: row.day_of_month, // 1-31, para monthly
    recipients: row.recipients || [], // array de emails
    filterMember: row.filter_member || 'all',
    isActive: row.is_active !== false,
    createdAt: row.created_at,
  };
}

// ==================== SERVICE (via factory) ====================

const scheduleService = createCRUDService({
  table: 'report_schedules',
  localKey: 'report_schedules',
  idPrefix: 'rs',
  transform: dbToSchedule,
  fieldMap: {
    userId: 'user_id',
    frequency: 'frequency',
    dayOfWeek: 'day_of_week',
    dayOfMonth: 'day_of_month',
    recipients: 'recipients',
    filterMember: 'filter_member',
    isActive: 'is_active',
  },
  orderBy: 'created_at',
  orderAsc: false,
});

// ==================== EXPORTS ====================

export const getSchedules = scheduleService.getAll;
export const createSchedule = scheduleService.create;
export const updateSchedule = scheduleService.update;
export const deleteSchedule = scheduleService.remove;

// Labels
export const FREQUENCY_LABELS = {
  weekly: 'Semanal',
  monthly: 'Mensal',
};

export const DAY_OF_WEEK_LABELS = [
  'Domingo', 'Segunda', 'Terca', 'Quarta', 'Quinta', 'Sexta', 'Sabado',
];
