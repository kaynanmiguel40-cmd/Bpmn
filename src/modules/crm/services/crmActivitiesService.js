import { createCRUDService } from '../../../lib/serviceFactory';
import { supabase } from '../../../lib/supabase';
import { toast } from '../../../contexts/ToastContext';
import { crmActivitySchema } from '../schemas/crmValidation';
import { escapeIlike } from '../lib/searchFilters';

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
    query = query.ilike('title', `%${escapeIlike(search)}%`);
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

  // Whitelist camelCase (UI) -> coluna real; chave desconhecida cai no default
  const SORT_COLUMNS = { title: 'title', startDate: 'start_date', start_date: 'start_date', type: 'type', completed: 'completed' };
  query = query.order(SORT_COLUMNS[sortBy] || 'start_date', { ascending: sortOrder === 'asc' });

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

// Mapeamento tipo atividade CRM → tipo evento agenda. Toda atividade vira um
// evento no Google Calendar; só 'meeting' (reunião) ganha Google Meet no sync.
const ACTIVITY_TO_AGENDA_TYPE = {
  call: 'task',
  email: 'task',
  message: 'task',
  meeting: 'meeting',
  visit: 'other',
  task: 'task',
  lunch: 'other',
  follow_up: 'reminder',
};

const ACTIVITY_TO_AGENDA_COLOR = {
  call: '#f59e0b',
  email: '#6366f1',
  message: '#10b981',
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

  // Toda atividade (tarefa ou evento) vira um evento no Google Calendar.
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
        // Convidados (e-mails) → attendees do evento; Google envia o convite
        attendees: (data.attendees || []).map(email => ({ email, name: '' })),
      });

      if (agendaEvent?.id) {
        await supabase.from('crm_activities')
          .update({ agenda_event_id: agendaEvent.id })
          .eq('id', activity.id);
        activity.agendaEventId = agendaEvent.id;
        pushEventToGCal(agendaEvent.id, 'create').catch(err => console.warn('[GCal Sync] Falha ao sincronizar evento:', err?.message || err));
      }
    } catch {
      // Nao bloqueia a criacao se o sync do Calendar falhar
    }
  }

  return activity;
}

// ==================== CADENCIA DE OUTBOUND ====================

/**
 * Cadencia padrao de follow-up pra lead frio. Cada toque eh uma atividade
 * com data — eh isso que alimenta o selo "Tentativa X/Y · proximo toque" no card.
 * dayOffset = dias a partir de hoje.
 */
export const CADENCE_TEMPLATE = [
  { dayOffset: 0,  type: 'call',  title: 'Cadência · Tentativa 1 — Ligação' },
  { dayOffset: 2,  type: 'call',  title: 'Cadência · Tentativa 2 — WhatsApp / Ligação' },
  { dayOffset: 5,  type: 'call',  title: 'Cadência · Tentativa 3 — Ligação' },
  { dayOffset: 7,  type: 'call',  title: 'Cadência · Tentativa 4 — Áudio / Mensagem' },
  { dayOffset: 10, type: 'call',  title: 'Cadência · Tentativa 5 — Break-up ("vou encerrar por aqui")' },
];

/**
 * Cria as atividades da cadencia pra um deal. Os toques ficam agendados as 09:00
 * de hoje, +2, +5, +7 e +10 dias. Retorna quantas foram criadas.
 */
export async function createCadenceForDeal({ dealId, contactId = null }) {
  if (!dealId) return 0;

  let created = 0;
  for (const step of CADENCE_TEMPLATE) {
    const d = new Date();
    d.setDate(d.getDate() + step.dayOffset);
    d.setHours(9, 0, 0, 0);

    const activity = await createCrmActivity({
      title: step.title,
      type: step.type,
      dealId,
      contactId,
      startDate: d.toISOString(),
      completed: false,
    });
    if (activity?.id) created++;
  }

  if (created > 0) {
    toast(`Cadência iniciada — ${created} follow-ups agendados`, 'success');
  }
  return created;
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
      if ('attendees' in updates) {
        agendaUpdates.attendees = (updates.attendees || []).map(email => ({ email, name: '' }));
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
  // Buscar id do evento da agenda antes de apagar pra propagar a exclusao
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

  const result = dbToCrmActivity(data);
  return result;
}
