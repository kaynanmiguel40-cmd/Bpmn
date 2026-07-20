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
    assignedTo: row.assigned_to || null,
    assignedToName: row.assigned_to_name || null,
    completedBy: row.completed_by || null,
    deliveryInput: row.delivery_input || '',
    deliveryReport: row.delivery_report || '',
    // Passo do playbook que gerou esta tarefa (null = tarefa avulsa). E o que
    // permite a Agenda mostrar o script/cenarios na hora de executar, e o que
    // liga a conclusao de volta ao progresso do lead.
    stageStepId: row.stage_step_id || null,
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
    assignedTo: 'assigned_to',
    assignedToName: 'assigned_to_name',
    deliveryInput: 'delivery_input',
    deliveryReport: 'delivery_report',
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

/**
 * Convidados de uma atividade. Vivem em agenda_events.attendees ([{email,name}]),
 * nao em crm_activities — nenhum dos SELECTs de atividade traz o campo, entao a
 * leitura precisa desta ida separada. Devolve so os e-mails, que eh a forma que
 * o form usa.
 */
export async function getActivityAttendees(agendaEventId) {
  if (!agendaEventId) return [];
  const { data, error } = await supabase
    .from('agenda_events')
    .select('attendees')
    .eq('id', agendaEventId)
    .maybeSingle();

  if (error) {
    console.warn('[getActivityAttendees]', error?.message || error);
    return [];
  }
  return (data?.attendees || [])
    .map(a => (typeof a === 'string' ? a : a?.email))
    .filter(Boolean);
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

  // Os follow-ups são do DONO do negócio, não de quem clicou "iniciar cadência".
  // Sem isto o assigned_to ficava null e os toques só apareciam na agenda de
  // quem iniciou (via created_by) — um gestor iniciando a cadência de um lead
  // do vendedor deixava o vendedor sem ver nenhum dos toques que deve trabalhar.
  const { data: deal } = await supabase
    .from('crm_deals')
    .select('owner_id')
    .eq('id', dealId)
    .maybeSingle();
  const ownerId = deal?.owner_id || null;

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
      // Sem dono no deal cai no fallback antigo (created_by de quem iniciou).
      assignedTo: ownerId,
    });
    if (activity?.id) created++;
  }

  if (created > 0) {
    toast(`Cadência iniciada — ${created} follow-ups agendados`, 'success');
  }
  return created;
}

/**
 * Cancela a cadência de um deal: soft-delete dos toques ainda PENDENTES
 * criados por createCadenceForDeal (identificados pelo prefixo do título).
 * Toques já concluídos não são tocados — ficam como histórico real do que
 * já aconteceu. Não existia nenhuma forma de parar uma cadência iniciada.
 */
export async function cancelCadenceForDeal(dealId) {
  if (!dealId) return 0;
  const now = new Date().toISOString();
  const { data, error } = await supabase
    .from('crm_activities')
    .update({ deleted_at: now })
    .eq('deal_id', dealId)
    .eq('completed', false)
    .is('deleted_at', null)
    .ilike('title', 'Cadência ·%')
    .select('id');

  if (error) {
    toast(`Erro ao cancelar cadência: ${error.message}`, 'error');
    return 0;
  }

  const count = data?.length || 0;
  if (count > 0) {
    toast(`Cadência cancelada — ${count} follow-up${count > 1 ? 's' : ''} pendente${count > 1 ? 's' : ''} removido${count > 1 ? 's' : ''}`, 'success');
  }
  return count;
}

export async function updateCrmActivity(id, updates) {
  // Sem id valido, nao ha o que atualizar. Sem esta guarda, um `undefined`
  // vindo de uma prop faltando virava a string "undefined" na query e o
  // Postgres devolvia "invalid input syntax for type uuid" — erro que fala do
  // banco quando o problema esta na tela, e nao diz QUAL tela.
  if (!id || typeof id !== 'string') {
    console.error('[updateCrmActivity] id invalido:', id);
    toast('Não consegui identificar a tarefa. Recarregue a página e tente de novo.', 'error');
    return null;
  }
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

      // O push de delete lê o google_event_id DA LINHA do agenda_events — então
      // precisa TERMINAR antes de apagarmos a linha. Antes rodava sem await e
      // perdia a corrida pro deleteAgendaEvent: a linha sumia, o push lia null e
      // o evento (com Meet/convites) ficava órfão pra sempre no Google.
      await pushEventToGCal(current.agenda_event_id, 'delete').catch(err =>
        console.warn('[GCal Sync] Falha ao excluir atividade CRM do Google Calendar:', err?.message || err));
      await deleteAgendaEvent(current.agenda_event_id);
    } catch {
      // Nao bloqueia o delete da atividade se falhar sync com a agenda
    }
  }

  return true;
}

/**
 * Conclui a tarefa registrando o par input (o que o vendedor fez/disse) /
 * output (o que o lead respondeu) — cada tarefa guarda o seu.
 *
 * `contacted` separa os dois desfechos que antes eram um so:
 *   true  — falou com o lead. O passo do playbook e marcado como CUMPRIDO.
 *   false — tentou e nao falou (caiu na caixa postal, nao atendeu). A tarefa e
 *           concluida (ela foi executada!), mas o passo NAO conta como
 *           cumprido, porque o objetivo dele — falar com a pessoa — nao
 *           aconteceu.
 *
 * Sem essa distincao, "nao atendeu" pintava o passo de verde igual a "topou a
 * reuniao", e a Pipeline — cujo unico trabalho e mostrar a verdade — passava a
 * mentir sobre o quanto o lead avancou.
 */
export async function completeCrmActivity(id, { input = '', output = '', contacted } = {}) {
  // Mesma guarda do updateCrmActivity: id ausente vira "undefined" na query.
  if (!id || typeof id !== 'string') {
    console.error('[completeCrmActivity] id invalido:', id);
    throw new Error('Não consegui identificar a tarefa. Recarregue a página e tente de novo.');
  }
  const now = new Date().toISOString();
  const session = await supabase.auth.getSession();
  const completedBy = session.data?.session?.user?.id || null;
  const { data, error } = await supabase
    .from('crm_activities')
    .update({
      completed: true,
      completed_at: now,
      completed_by: completedBy,
      delivery_input: input.trim() || null,
      delivery_report: output.trim() || null,
      updated_at: now,
    })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    // Precisa propagar (nao so tostar e devolver null): a mutation que
    // chama isso trata sucesso vs erro pelo resultado da Promise. Se
    // resolvesse com null aqui, o onSuccess do useMutation disparava do
    // mesmo jeito — usuario via o toast de erro seguido, contraditoriamente,
    // de "Atividade concluida", e o modal fechava como se tivesse dado certo.
    console.error('[completeCrmActivity]', error);
    throw error;
  }

  // PONTE COM O PLAYBOOK: se essa atividade veio de um passo do processo,
  // concluir na Agenda ja marca o passo no checklist, levando junto o que o
  // lead respondeu (o "output" e exatamente isso). Sem essa ponte o vendedor
  // marcaria duas vezes e as duas telas nunca bateriam.
  // `contacted !== false` e nao `contacted`: quem chama sem a flag (tarefa
  // avulsa, telas antigas) mantem o comportamento de sempre — marca o passo.
  // So o "Nao atendeu" EXPLICITO impede. Um `contacted = true` como default de
  // parametro parece equivalente, mas nao e: ele apaga a diferenca entre
  // "ninguem informou" e "informou true", e foi assim que uma tela esqueceu de
  // repassar a flag e voltou a marcar passo de ligacao nao atendida.
  if (data?.stage_step_id && data?.deal_id && contacted !== false) {
    const { error: progErr } = await supabase
      .from('crm_deal_step_progress')
      .upsert(
        { deal_id: data.deal_id, step_id: data.stage_step_id, outcome: output.trim() || null },
        { onConflict: 'deal_id,step_id' },
      );
    // Nao derruba a conclusao: a atividade ja foi concluida com sucesso.
    if (progErr) console.warn('[completeCrmActivity] sync com o processo', progErr.message);
  }

  const result = dbToCrmActivity(data);
  return result;
}
