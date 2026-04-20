import { createCRUDService } from '../../../lib/serviceFactory';
import { supabase } from '../../../lib/supabase';
import { toast } from '../../../contexts/ToastContext';
import { crmActivitySchema } from '../schemas/crmValidation';

// ==================== TRANSFORMADOR ====================

export function dbToCrmActivity(row) {
  if (!row) return null;
  return {
    id: row.id,
    title: row.title,
    description: row.description || '',
    type: row.type,
    contactId: row.contact_id || null,
    contact: row.crm_contacts ? {
      id: row.crm_contacts.id,
      name: row.crm_contacts.name,
      avatarColor: row.crm_contacts.avatar_color,
    } : null,
    dealId: row.deal_id || null,
    deal: row.crm_deals ? {
      id: row.crm_deals.id,
      title: row.crm_deals.title,
      value: row.crm_deals.value,
    } : null,
    startDate: row.start_date,
    endDate: row.end_date || null,
    completed: row.completed || false,
    completedAt: row.completed_at || null,
    agendaEventId: row.agenda_event_id || null,
    createdBy: row.created_by || null,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    deletedAt: row.deleted_at || null,
  };
}

// ==================== CRUD VIA FACTORY ====================

const activityService = createCRUDService({
  table: 'crm_activities',
  localKey: 'crm_activities',
  idPrefix: 'crm_act',
  transform: dbToCrmActivity,
  schema: crmActivitySchema,
  fieldMap: {
    title: 'title',
    description: 'description',
    type: 'type',
    contactId: 'contact_id',
    dealId: 'deal_id',
    startDate: 'start_date',
    endDate: 'end_date',
    completed: 'completed',
    completedAt: 'completed_at',
    agendaEventId: 'agenda_event_id',
  },
  orderBy: 'start_date',
  orderAsc: false,
});

// ==================== FUNCOES EXPORTADAS ====================

export async function getCrmActivities(filters = {}) {
  const { search, type, contactId, dealId, completed, page, perPage = 25, sortBy, sortOrder } = filters;

  let query = supabase
    .from('crm_activities')
    .select('*, crm_contacts(id, name, avatar_color), crm_deals(id, title, value)', { count: 'exact' })
    .is('deleted_at', null);

  if (search) {
    query = query.ilike('title', `%${search}%`);
  }
  if (type) {
    query = query.eq('type', type);
  }
  if (contactId) {
    query = query.eq('contact_id', contactId);
  }
  if (dealId) {
    query = query.eq('deal_id', dealId);
  }
  if (completed !== undefined && completed !== null) {
    query = query.eq('completed', completed);
  }

  query = query.order(sortBy || 'start_date', { ascending: sortOrder === 'asc' });

  if (page && perPage) {
    const from = (page - 1) * perPage;
    query = query.range(from, from + perPage - 1);
  }

  const { data, error, count } = await query;
  if (error) {
    toast(`Erro ao buscar atividades: ${error.message}`, 'error');
    return { data: [], count: 0 };
  }
  return {
    data: (data || []).map(dbToCrmActivity),
    count: count || 0,
  };
}

export async function getActivitiesForCalendar(startDate, endDate) {
  // Intersecao de [start_date, end_date] com [startDate, endDate].
  // Evento ponta (sem end_date) entra se start_date estiver no intervalo.
  let query = supabase
    .from('crm_activities')
    .select('*, crm_contacts(id, name, avatar_color), crm_deals(id, title)')
    .is('deleted_at', null)
    .order('start_date');

  if (endDate) {
    query = query.lte('start_date', endDate);
  }
  if (startDate) {
    // end_date >= startDate OU (end_date null E start_date >= startDate)
    query = query.or(
      `end_date.gte.${startDate},and(end_date.is.null,start_date.gte.${startDate})`
    );
  }

  const { data, error } = await query;
  if (error) {
    toast(`Erro ao buscar atividades do calendario: ${error.message}`, 'error');
    return [];
  }
  return (data || []).map(dbToCrmActivity);
}

// Mapeamento tipo atividade CRM → tipo evento agenda
const ACTIVITY_TO_AGENDA_TYPE = {
  call: 'task',
  email: 'task',
  meeting: 'meeting',
  visit: 'meeting',
  task: 'task',
  lunch: 'meeting',
  follow_up: 'reminder',
};

const ACTIVITY_TO_AGENDA_COLOR = {
  call: '#f59e0b',
  email: '#6366f1',
  meeting: '#3b82f6',
  visit: '#22c55e',
  task: '#64748b',
  lunch: '#f97316',
  follow_up: '#8b5cf6',
};

export async function createCrmActivity(data) {
  const session = await supabase.auth.getSession();
  const userId = session.data?.session?.user?.id;
  const activity = await activityService.create(data, { created_by: userId });

  // Criar evento na agenda (sincroniza automaticamente com Google Calendar)
  if (activity?.id && data.startDate) {
    try {
      const { createAgendaEvent } = await import('../../../lib/agendaService');
      const { pushEventToGCal } = await import('../../../lib/googleCalendarService');

      const endDate = data.endDate || new Date(new Date(data.startDate).getTime() + 60 * 60 * 1000).toISOString();

      const agendaEvent = await createAgendaEvent({
        title: data.title,
        description: data.description || '',
        startDate: data.startDate,
        endDate,
        type: ACTIVITY_TO_AGENDA_TYPE[data.type] || 'task',
        color: ACTIVITY_TO_AGENDA_COLOR[data.type] || '#3b82f6',
      });

      // Guardar agenda_event_id na atividade CRM para sync futuro (update/delete)
      if (agendaEvent?.id) {
        await supabase.from('crm_activities')
          .update({ agenda_event_id: agendaEvent.id })
          .eq('id', activity.id);
        activity.agendaEventId = agendaEvent.id;

        // Push para Google Calendar
        pushEventToGCal(agendaEvent.id, 'create').catch(err => console.warn('[GCal Sync] Falha ao sincronizar atividade CRM:', err?.message || err));
      }
    } catch {
      // Nao bloqueia a criacao da atividade se falhar a criacao do evento
    }
  }

  return activity;
}

export async function updateCrmActivity(id, updates) {
  const result = await activityService.update(id, updates);

  // Propagar mudancas de data/hora/titulo/descricao/tipo para o evento da agenda
  // correspondente (e Google Calendar).
  if (result?.agendaEventId) {
    try {
      const { updateAgendaEvent } = await import('../../../lib/agendaService');
      const { pushEventToGCal } = await import('../../../lib/googleCalendarService');

      const agendaUpdates = {};
      if ('title' in updates) agendaUpdates.title = updates.title;
      if ('description' in updates) agendaUpdates.description = updates.description || '';
      if ('startDate' in updates) agendaUpdates.startDate = updates.startDate;
      if ('endDate' in updates) {
        agendaUpdates.endDate = updates.endDate
          || (updates.startDate
              ? new Date(new Date(updates.startDate).getTime() + 60 * 60 * 1000).toISOString()
              : null);
      }
      if ('type' in updates) {
        agendaUpdates.type = ACTIVITY_TO_AGENDA_TYPE[updates.type] || 'task';
        agendaUpdates.color = ACTIVITY_TO_AGENDA_COLOR[updates.type] || '#3b82f6';
      }

      if (Object.keys(agendaUpdates).length > 0) {
        await updateAgendaEvent(result.agendaEventId, agendaUpdates);
        pushEventToGCal(result.agendaEventId, 'update').catch(err =>
          console.warn('[GCal Sync] Falha ao atualizar atividade CRM na agenda:', err?.message || err));
      }
    } catch {
      // Nao bloqueia o update da atividade se falhar sync com a agenda
    }
  }

  return result;
}

export async function softDeleteCrmActivity(id) {
  // Buscar agenda_event_id antes de apagar pra propagar exclusao na agenda
  const { data: current } = await supabase
    .from('crm_activities')
    .select('agenda_event_id')
    .eq('id', id)
    .maybeSingle();

  const { error } = await supabase
    .from('crm_activities')
    .update({ deleted_at: new Date().toISOString() })
    .eq('id', id);

  if (error) {
    toast(`Erro ao excluir atividade: ${error.message}`, 'error');
    return false;
  }

  // Remover evento correspondente da agenda + Google Calendar
  if (current?.agenda_event_id) {
    try {
      const { deleteAgendaEvent } = await import('../../../lib/agendaService');
      const { pushEventToGCal } = await import('../../../lib/googleCalendarService');

      // GCal precisa ser informado ANTES de deletar na agenda (senao perde o eventId remoto)
      pushEventToGCal(current.agenda_event_id, 'delete').catch(err =>
        console.warn('[GCal Sync] Falha ao excluir atividade CRM do Google Calendar:', err?.message || err));
      await deleteAgendaEvent(current.agenda_event_id);
    } catch {
      // Nao bloqueia o delete da atividade se falhar sync com a agenda
    }
  }

  return true;
}

export async function completeCrmActivity(id) {
  const now = new Date().toISOString();
  const { data, error } = await supabase
    .from('crm_activities')
    .update({ completed: true, completed_at: now, updated_at: now })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    toast(`Erro ao concluir atividade: ${error.message}`, 'error');
    return null;
  }
  return dbToCrmActivity(data);
}
