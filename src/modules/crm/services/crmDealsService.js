import { createCRUDService } from '../../../lib/serviceFactory';
import { supabase } from '../../../lib/supabase';
import { toast } from '../../../contexts/ToastContext';
import { crmDealSchema } from '../schemas/crmValidation';

// ==================== TRANSFORMADOR ====================

export function dbToCrmDeal(row) {
  if (!row) return null;
  return {
    id: row.id,
    title: row.title,
    value: row.value || 0,
    probability: row.probability ?? 50,
    contactId: row.contact_id || null,
    contactName: row.contact_name || null,
    contactPhone: row.contact_phone || null,
    contactEmail: row.contact_email || null,
    contact: row.crm_contacts ? {
      id: row.crm_contacts.id,
      name: row.crm_contacts.name,
      avatarColor: row.crm_contacts.avatar_color,
      email: row.crm_contacts.email,
    } : null,
    companyId: row.company_id || null,
    company: row.crm_companies ? {
      id: row.crm_companies.id,
      name: row.crm_companies.name,
    } : null,
    pipelineId: row.pipeline_id || null,
    stageId: row.stage_id || null,
    stage: row.crm_pipeline_stages ? {
      id: row.crm_pipeline_stages.id,
      name: row.crm_pipeline_stages.name,
      color: row.crm_pipeline_stages.color,
    } : null,
    expectedCloseDate: row.expected_close_date || null,
    closedAt: row.closed_at || null,
    status: row.status || 'open',
    lostReason: row.lost_reason || null,
    segment: row.segment || null,
    notes: row.notes || '',
    meetingAgendaEventId: row.meeting_agenda_event_id || null,
    meetingDate: row.meeting_date || null,
    meetingCity: row.meeting_city || null,
    ownerId: row.owner_id || null,
    owner: row.team_members ? {
      id: row.team_members.id,
      name: row.team_members.name,
      color: row.team_members.color,
    } : null,
    createdBy: row.created_by || null,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    deletedAt: row.deleted_at || null,
  };
}

// ==================== CRUD VIA FACTORY ====================

const dealService = createCRUDService({
  table: 'crm_deals',
  localKey: 'crm_deals',
  idPrefix: 'crm_dl',
  transform: dbToCrmDeal,
  schema: crmDealSchema,
  fieldMap: {
    title: 'title',
    value: 'value',
    probability: 'probability',
    contactId: 'contact_id',
    contactName: 'contact_name',
    contactPhone: 'contact_phone',
    contactEmail: 'contact_email',
    companyId: 'company_id',
    pipelineId: 'pipeline_id',
    stageId: 'stage_id',
    expectedCloseDate: 'expected_close_date',
    segment: 'segment',
    status: 'status',
    lostReason: 'lost_reason',
    notes: 'notes',
    ownerId: 'owner_id',
    meetingAgendaEventId: 'meeting_agenda_event_id',
    meetingDate: 'meeting_date',
    meetingCity: 'meeting_city',
  },
  orderBy: 'created_at',
  orderAsc: false,
});

// ==================== FUNCOES EXPORTADAS ====================

export async function getCrmDeals(filters = {}) {
  const { search, status, pipelineId, stageId, contactId, companyId, page, perPage = 25, sortBy, sortOrder } = filters;

  let query = supabase
    .from('crm_deals')
    .select('*, crm_contacts(id, name, avatar_color), crm_companies(id, name), crm_pipeline_stages(id, name, color), team_members(id, name, color)', { count: 'exact' })
    .is('deleted_at', null);

  if (search) {
    query = query.ilike('title', `%${search}%`);
  }
  if (status) {
    query = query.eq('status', status);
  }
  if (pipelineId) {
    query = query.eq('pipeline_id', pipelineId);
  }
  if (stageId) {
    query = query.eq('stage_id', stageId);
  }
  if (contactId) {
    query = query.eq('contact_id', contactId);
  }
  if (companyId) {
    query = query.eq('company_id', companyId);
  }

  query = query.order(sortBy || 'created_at', { ascending: sortOrder === 'asc' });

  if (page && perPage) {
    const from = (page - 1) * perPage;
    query = query.range(from, from + perPage - 1);
  }

  const { data, error, count } = await query;
  if (error) {
    toast(`Erro ao buscar negocios: ${error.message}`, 'error');
    return { data: [], count: 0 };
  }
  return {
    data: (data || []).map(dbToCrmDeal),
    count: count || 0,
  };
}

export async function getDealsByPipeline(pipelineId) {
  const { data, error } = await supabase
    .from('crm_deals')
    .select('*, crm_contacts(id, name, avatar_color), crm_companies(id, name), team_members(id, name, color)')
    .eq('pipeline_id', pipelineId)
    .eq('status', 'open')
    .is('deleted_at', null)
    .order('created_at');

  if (error) {
    toast(`Erro ao buscar deals do pipeline: ${error.message}`, 'error');
    return [];
  }
  return (data || []).map(dbToCrmDeal);
}

export async function getCrmDealById(id) {
  const { data, error } = await supabase
    .from('crm_deals')
    .select('*, crm_contacts(id, name, avatar_color, email, phone, position), crm_companies(id, name, segment), crm_pipeline_stages(id, name, color), team_members(id, name, color)')
    .eq('id', id)
    .is('deleted_at', null)
    .single();

  if (error) return null;
  return dbToCrmDeal(data);
}

export async function createCrmDeal(data) {
  const session = await supabase.auth.getSession();
  const userId = session.data?.session?.user?.id;
  const result = await dealService.create(data, { created_by: userId });

  // Gravar entrada inicial no historico de estagios
  if (result?.id && data.stageId && data.pipelineId) {
    await recordStageTransition(result.id, null, data.stageId, data.pipelineId);
  }

  return result;
}

export async function updateCrmDeal(id, updates) {
  return dealService.update(id, updates);
}

export async function softDeleteCrmDeal(id) {
  const { error } = await supabase
    .from('crm_deals')
    .update({ deleted_at: new Date().toISOString() })
    .eq('id', id);

  if (error) {
    toast(`Erro ao excluir negocio: ${error.message}`, 'error');
    return false;
  }
  return true;
}

// Helper: gravar transicao de estagio no historico
async function recordStageTransition(dealId, fromStageId, toStageId, pipelineId) {
  await supabase.from('crm_deal_stage_history').insert({
    deal_id: dealId,
    from_stage_id: fromStageId || null,
    to_stage_id: toStageId,
    pipeline_id: pipelineId,
  });
}

export async function moveDealToStage(dealId, stageId) {
  // Buscar deal atual e info do stage destino
  const { data: current } = await supabase
    .from('crm_deals')
    .select('stage_id, pipeline_id, status')
    .eq('id', dealId)
    .single();

  // Checar se stage destino e estagio de vitoria ou trigger de reuniao
  const { data: targetStage } = await supabase
    .from('crm_pipeline_stages')
    .select('is_win_stage, triggers_meeting, name')
    .eq('id', stageId)
    .single();

  const shouldAutoWin = targetStage?.is_win_stage === true && current?.status === 'open';

  const updatePayload = { stage_id: stageId, updated_at: new Date().toISOString() };
  if (shouldAutoWin) {
    updatePayload.status = 'won';
    updatePayload.probability = 100;
    updatePayload.closed_at = new Date().toISOString();
  }

  const { data, error } = await supabase
    .from('crm_deals')
    .update(updatePayload)
    .eq('id', dealId)
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  // Gravar transicao no historico
  if (current && current.stage_id !== stageId) {
    await recordStageTransition(dealId, current.stage_id, stageId, current.pipeline_id);
  }

  const result = dbToCrmDeal(data);
  // Metadata para UI: sinaliza se stage dispara modal de reuniao
  result._triggersMeeting = targetStage?.triggers_meeting === true;
  return result;
}

export async function markDealAsWon(dealId) {
  // Buscar stage atual para gravar no historico
  const { data: current } = await supabase
    .from('crm_deals')
    .select('stage_id, pipeline_id')
    .eq('id', dealId)
    .single();

  const { data, error } = await supabase
    .from('crm_deals')
    .update({
      status: 'won',
      probability: 100,
      closed_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq('id', dealId)
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  // Gravar transicao final (won) no historico
  if (current?.stage_id && current?.pipeline_id) {
    await recordStageTransition(dealId, current.stage_id, current.stage_id, current.pipeline_id);
  }

  return dbToCrmDeal(data);
}

export async function markDealAsLost(dealId, reason = '') {
  // Buscar stage atual para gravar no historico
  const { data: current } = await supabase
    .from('crm_deals')
    .select('stage_id, pipeline_id')
    .eq('id', dealId)
    .single();

  const { data, error } = await supabase
    .from('crm_deals')
    .update({
      status: 'lost',
      probability: 0,
      lost_reason: reason,
      closed_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq('id', dealId)
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  // Gravar transicao final (lost) no historico
  if (current?.stage_id && current?.pipeline_id) {
    await recordStageTransition(dealId, current.stage_id, current.stage_id, current.pipeline_id);
  }

  return dbToCrmDeal(data);
}

// ==================== DEAL ACTIVITIES & HISTORY ====================

export async function getDealActivities(dealId) {
  const { data, error } = await supabase
    .from('crm_activities')
    .select('*, crm_contacts(id, name, avatar_color)')
    .eq('deal_id', dealId)
    .is('deleted_at', null)
    .order('start_date', { ascending: false });

  if (error) {
    toast(`Erro ao buscar atividades: ${error.message}`, 'error');
    return [];
  }

  return (data || []).map(row => ({
    id: row.id,
    title: row.title,
    description: row.description,
    type: row.type,
    startDate: row.start_date,
    endDate: row.end_date,
    completed: row.completed,
    completedAt: row.completed_at,
    contact: row.crm_contacts ? { id: row.crm_contacts.id, name: row.crm_contacts.name, avatarColor: row.crm_contacts.avatar_color } : null,
    createdAt: row.created_at,
  }));
}

export async function getDealStageHistory(dealId) {
  const { data, error } = await supabase
    .from('crm_deal_stage_history')
    .select('*, crm_pipeline_stages!crm_deal_stage_history_to_stage_id_fkey(id, name, color)')
    .eq('deal_id', dealId)
    .order('created_at', { ascending: false });

  if (error) {
    const { data: fallback } = await supabase
      .from('crm_deal_stage_history')
      .select('*')
      .eq('deal_id', dealId)
      .order('created_at', { ascending: false });

    return (fallback || []).map(row => ({
      id: row.id,
      fromStageId: row.from_stage_id,
      toStageId: row.to_stage_id,
      stage: null,
      createdAt: row.created_at,
    }));
  }

  return (data || []).map(row => ({
    id: row.id,
    fromStageId: row.from_stage_id,
    toStageId: row.to_stage_id,
    stage: row.crm_pipeline_stages ? { id: row.crm_pipeline_stages.id, name: row.crm_pipeline_stages.name, color: row.crm_pipeline_stages.color } : null,
    createdAt: row.created_at,
  }));
}

// ==================== MEETING SCHEDULING ====================

export async function updateDealMeeting(dealId, { agendaEventId, meetingDate, meetingCity }) {
  const { data, error } = await supabase
    .from('crm_deals')
    .update({
      meeting_agenda_event_id: agendaEventId || null,
      meeting_date: meetingDate,
      meeting_city: meetingCity || null,
      updated_at: new Date().toISOString(),
    })
    .eq('id', dealId)
    .select()
    .single();

  if (error) throw new Error(error.message);
  return dbToCrmDeal(data);
}

export async function getDealsWithMeetings() {
  const { data, error } = await supabase
    .from('crm_deals')
    .select('*, crm_companies(id, name, city, state), crm_contacts(id, name)')
    .not('meeting_date', 'is', null)
    .is('deleted_at', null)
    .order('meeting_date');

  if (error) return [];
  return (data || []).map(dbToCrmDeal);
}

export async function schedulePartnerMeeting(dealId, { date, time, notes, city }) {
  // 1. Buscar dados do deal
  const deal = await getCrmDealById(dealId);
  if (!deal) throw new Error('Deal nao encontrado');

  const partnerName = deal.company?.name || deal.title;
  const meetingCity = city || deal.meetingCity || '';
  const meetingTitle = `Reuniao - ${partnerName}${meetingCity ? ` - ${meetingCity}` : ''}`;

  // 2. Montar datetime (usar ISO com timezone offset para consistencia)
  const localStart = new Date(`${date}T${time}:00`);
  const startDate = localStart.toISOString();
  const endDate = new Date(localStart.getTime() + 60 * 60 * 1000).toISOString();

  // 3. Buscar gestores (socios) do time
  const { data: gestores } = await supabase
    .from('team_members')
    .select('id, name, auth_user_id')
    .eq('crm_role', 'gestor');

  const attendeeIds = (gestores || []).map(g => g.id);

  // 4. Criar evento na agenda
  const { createAgendaEvent } = await import('../../../lib/agendaService');
  const agendaEvent = await createAgendaEvent({
    title: meetingTitle,
    description: `Parceiro: ${partnerName}\nCidade: ${meetingCity}\n${notes || ''}`.trim(),
    startDate,
    endDate,
    type: 'meeting',
    color: '#3b82f6',
    assignee: attendeeIds[0] || null,
    attendees: attendeeIds,
  });

  // 5. Criar atividade CRM vinculada ao deal
  const { createCrmActivity } = await import('./crmActivitiesService');
  await createCrmActivity({
    title: meetingTitle,
    description: notes || '',
    type: 'meeting',
    dealId,
    contactId: deal.contactId || null,
    startDate,
    endDate,
  });

  // 6. Atualizar deal com info da reuniao
  await updateDealMeeting(dealId, {
    agendaEventId: agendaEvent?.id || null,
    meetingDate: startDate,
    meetingCity,
  });

  return agendaEvent;
}
