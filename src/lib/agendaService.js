import { createCRUDService } from './serviceFactory';
import { agendaEventSchema } from './validation';

// ==================== TRANSFORMADOR ====================

export function dbToEvent(row) {
  if (!row) return null;
  return {
    id: row.id,
    title: row.title,
    description: row.description || '',
    startDate: row.start_date,
    endDate: row.end_date,
    assignee: row.assignee || null,
    type: row.type || 'task',
    color: row.color || '#3b82f6',
    attended: row.attended || false,
    wasLate: row.was_late || false,
    lateMinutes: row.late_minutes || 0,
    recurrenceType: row.recurrence_type || null,
    recurrenceConfig: row.recurrence_config || {},
    recurrenceEndType: row.recurrence_end_type || 'never',
    recurrenceEndValue: row.recurrence_end_value || null,
    recurrenceExceptions: row.recurrence_exceptions || [],
    attendees: Array.isArray(row.attendees) ? row.attendees : [],
    createdAt: row.created_at,
  };
}

// ==================== CRUD (via factory) ====================

const eventService = createCRUDService({
  table: 'agenda_events',
  localKey: 'agenda_events',
  idPrefix: 'evt',
  transform: dbToEvent,
  schema: agendaEventSchema,
  orderBy: 'start_date',
  fieldMap: {
    title: 'title',
    description: 'description',
    startDate: 'start_date',
    endDate: 'end_date',
    assignee: 'assignee',
    type: 'type',
    color: 'color',
    attended: 'attended',
    wasLate: 'was_late',
    lateMinutes: 'late_minutes',
    recurrenceType: 'recurrence_type',
    recurrenceConfig: 'recurrence_config',
    recurrenceEndType: 'recurrence_end_type',
    recurrenceEndValue: 'recurrence_end_value',
    recurrenceExceptions: 'recurrence_exceptions',
    attendees: 'attendees',
  },
});

export const getAgendaEvents = eventService.getAll;
export const createAgendaEvent = (event) => eventService.create(event);
export const updateAgendaEvent = (id, updates) => eventService.update(id, updates);
export const deleteAgendaEvent = (id) => eventService.remove(id);
