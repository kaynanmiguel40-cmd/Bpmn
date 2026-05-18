/**
 * crmCallsService - Servico do Discador (crm_calls).
 *
 * V1: register das ligacoes feitas pelo celular do vendedor (channel='device').
 * V2: click-to-call VoIP com gravacao (channel='voip', recording_url).
 * V3: analise por IA (transcript, ai_*).
 *
 * Cada ligacao concluida espelha uma atividade type='call' em crm_activities
 * pra preservar a timeline do contato/deal.
 */

import { createCRUDService } from '../../../lib/serviceFactory';
import { supabase } from '../../../lib/supabase';
import { toast } from '../../../contexts/ToastContext';
import { crmCallSchema } from '../schemas/crmValidation';
import { createCrmActivity } from './crmActivitiesService';

// ==================== TRANSFORMADOR ====================

export function dbToCrmCall(row) {
  if (!row) return null;
  return {
    id: row.id,
    contactId: row.contact_id || null,
    contact: row.crm_contacts ? {
      id: row.crm_contacts.id,
      name: row.crm_contacts.name,
      phone: row.crm_contacts.phone || null,
      avatarColor: row.crm_contacts.avatar_color || null,
    } : null,
    dealId: row.deal_id || null,
    deal: row.crm_deals ? {
      id: row.crm_deals.id,
      title: row.crm_deals.title,
      value: row.crm_deals.value,
    } : null,
    companyId: row.company_id || null,
    company: row.crm_companies ? {
      id: row.crm_companies.id,
      name: row.crm_companies.name,
    } : null,
    phoneDialed: row.phone_dialed,
    direction: row.direction || 'outbound',
    channel: row.channel || 'device',
    provider: row.provider || null,
    providerCallId: row.provider_call_id || null,
    startedAt: row.started_at,
    endedAt: row.ended_at || null,
    durationSeconds: row.duration_seconds ?? null,
    outcome: row.outcome || null,
    notes: row.notes || '',
    followUpAt: row.follow_up_at || null,
    followUpActivityId: row.follow_up_activity_id || null,
    recordingUrl: row.recording_url || null,
    recordingDurationSeconds: row.recording_duration_seconds ?? null,
    transcript: row.transcript || null,
    aiSummary: row.ai_summary || null,
    aiObjections: Array.isArray(row.ai_objections) ? row.ai_objections : null,
    aiSentiment: row.ai_sentiment || null,
    aiScore: row.ai_score ?? null,
    aiAnalyzedAt: row.ai_analyzed_at || null,
    activityId: row.activity_id || null,
    createdBy: row.created_by || null,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    deletedAt: row.deleted_at || null,
  };
}

// ==================== CRUD FACTORY ====================

const callService = createCRUDService({
  table: 'crm_calls',
  localKey: 'crm_calls',
  idPrefix: 'crm_call',
  transform: dbToCrmCall,
  schema: crmCallSchema,
  fieldMap: {
    contactId: 'contact_id',
    dealId: 'deal_id',
    companyId: 'company_id',
    phoneDialed: 'phone_dialed',
    direction: 'direction',
    channel: 'channel',
    provider: 'provider',
    providerCallId: 'provider_call_id',
    startedAt: 'started_at',
    endedAt: 'ended_at',
    durationSeconds: 'duration_seconds',
    outcome: 'outcome',
    notes: 'notes',
    followUpAt: 'follow_up_at',
    followUpActivityId: 'follow_up_activity_id',
    recordingUrl: 'recording_url',
    recordingDurationSeconds: 'recording_duration_seconds',
    transcript: 'transcript',
    aiSummary: 'ai_summary',
    aiObjections: 'ai_objections',
    aiSentiment: 'ai_sentiment',
    aiScore: 'ai_score',
    aiAnalyzedAt: 'ai_analyzed_at',
    activityId: 'activity_id',
  },
  orderBy: 'started_at',
  orderAsc: false,
});

// ==================== LABELS (export pra UI) ====================

export const CALL_OUTCOMES = {
  answered:            { label: 'Atendeu',              variant: 'success' },
  no_answer:           { label: 'Nao atendeu',          variant: 'warning' },
  voicemail:           { label: 'Caixa postal',         variant: 'neutral' },
  busy:                { label: 'Ocupado',              variant: 'warning' },
  wrong_number:        { label: 'Numero errado',        variant: 'danger'  },
  callback_scheduled:  { label: 'Retorno agendado',     variant: 'info'    },
  meeting_scheduled:   { label: 'Reuniao agendada',     variant: 'success' },
  not_interested:      { label: 'Nao tem interesse',    variant: 'danger'  },
  deal_advanced:       { label: 'Negocio avancou',      variant: 'success' },
};

// ==================== QUERIES ====================

// Outcomes considerados "conversou" pra calculo de taxa de atendimento.
const ANSWERED_OUTCOMES = new Set([
  'answered', 'callback_scheduled', 'meeting_scheduled', 'not_interested', 'deal_advanced',
]);

/**
 * Lista de chamadas com filtros (relatorio/historico).
 */
export async function getCrmCalls(filters = {}) {
  const {
    search, contactId, dealId, outcome, channel,
    createdBy, startDate, endDate,
    page, perPage = 25, sortBy, sortOrder,
  } = filters;

  let query = supabase
    .from('crm_calls')
    .select(
      '*, crm_contacts(id, name, phone, avatar_color), crm_deals(id, title, value), crm_companies(id, name)',
      { count: 'exact' }
    )
    .is('deleted_at', null);

  if (search) {
    query = query.or(`phone_dialed.ilike.%${search}%,notes.ilike.%${search}%`);
  }
  if (contactId)  query = query.eq('contact_id', contactId);
  if (dealId)     query = query.eq('deal_id', dealId);
  if (outcome)    query = query.eq('outcome', outcome);
  if (channel)    query = query.eq('channel', channel);
  if (createdBy)  query = query.eq('created_by', createdBy);
  if (startDate)  query = query.gte('started_at', startDate);
  if (endDate)    query = query.lte('started_at', endDate);

  query = query.order(sortBy || 'started_at', { ascending: sortOrder === 'asc' });

  if (page && perPage) {
    const from = (page - 1) * perPage;
    query = query.range(from, from + perPage - 1);
  }

  const { data, error, count } = await query;
  if (error) {
    toast(`Erro ao buscar chamadas: ${error.message}`, 'error');
    return { data: [], count: 0 };
  }
  return { data: (data || []).map(dbToCrmCall), count: count || 0 };
}

/**
 * KPIs do discador pro vendedor logado (created_by = current user).
 * Janelas: "hoje" (00:00 hoje -> agora) e "7d" (ultimos 7 dias).
 */
export async function getDialerKPIs() {
  const session = await supabase.auth.getSession();
  const userId = session.data?.session?.user?.id;
  if (!userId) {
    return {
      callsToday: 0, callsLast7d: 0, answerRate7d: 0,
      meetingsLast7d: 0, pendingFollowUps: 0,
    };
  }

  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
  const start7d = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();
  const nowIso = now.toISOString();

  // Roda em paralelo
  const [callsTodayRes, calls7dRes, pendingFollowUpRes] = await Promise.all([
    supabase
      .from('crm_calls')
      .select('outcome')
      .eq('created_by', userId)
      .is('deleted_at', null)
      .gte('started_at', startOfToday),
    supabase
      .from('crm_calls')
      .select('outcome', { count: 'exact' })
      .eq('created_by', userId)
      .is('deleted_at', null)
      .gte('started_at', start7d),
    supabase
      .from('crm_calls')
      .select('id', { count: 'exact', head: true })
      .eq('created_by', userId)
      .is('deleted_at', null)
      .gte('follow_up_at', nowIso),
  ]);

  const callsTodayList = callsTodayRes.data || [];
  const callsToday = callsTodayList.length;
  const meetingsToday = callsTodayList.filter(c => c.outcome === 'meeting_scheduled').length;

  const calls7d = (calls7dRes.data || []);
  const callsLast7d = calls7dRes.count || calls7d.length;
  const meetingsLast7d = calls7d.filter(c => c.outcome === 'meeting_scheduled').length;
  const answered7d = calls7d.filter(c => ANSWERED_OUTCOMES.has(c.outcome)).length;
  const answerRate7d = callsLast7d > 0 ? Math.round((answered7d / callsLast7d) * 100) : 0;
  const pendingFollowUps = pendingFollowUpRes.count || 0;

  return {
    callsToday, meetingsToday,
    callsLast7d, answerRate7d, meetingsLast7d,
    pendingFollowUps,
  };
}

// ============================================================
// DIALER QUEUES — 4 fontes normalizadas
// ============================================================
//
// Cada fonte retorna o mesmo shape pra que a UI nao precise saber a origem:
//   {
//     id, contactId, companyId, name, phone, email, position, status,
//     avatarColor, company, tags,
//     sourceType, sourceId, sourceContext, dealId, prospectId, activityId,
//   }

export const DIALER_SOURCES = {
  contacts:         { label: 'Contatos',          description: 'Contatos do CRM com telefone' },
  stuck_deals:      { label: 'Leads parados',     description: 'Negocios abertos sem mexer ha 7+ dias' },
  scheduled_calls:  { label: 'Agendadas',         description: 'Atividades tipo ligacao pendentes/atrasadas' },
  prospects:        { label: 'Prospects',         description: 'Prospects coletados ainda nao convertidos' },
};

const DEFAULT_STUCK_DAYS = 7;

function pickAvatarColor(row) {
  return row?.avatar_color || row?.crm_contacts?.avatar_color || null;
}

async function getRecentlyCalledContactIds(contactIds, sinceIso) {
  if (!sinceIso || !contactIds.length) return new Set();
  const { data } = await supabase
    .from('crm_calls')
    .select('contact_id')
    .in('contact_id', contactIds)
    .gte('started_at', sinceIso)
    .is('deleted_at', null);
  return new Set((data || []).map(r => r.contact_id));
}

/**
 * Roteador da fila do discador por fonte.
 */
export async function getDialerQueue(filters = {}) {
  const source = filters.source || 'contacts';
  switch (source) {
    case 'contacts':        return getQueueFromContacts(filters);
    case 'stuck_deals':     return getQueueFromStuckDeals(filters);
    case 'scheduled_calls': return getQueueFromScheduledCalls(filters);
    case 'prospects':       return getQueueFromProspects(filters);
    default:                return getQueueFromContacts(filters);
  }
}

async function getQueueFromContacts(filters) {
  const { status, tag, search, excludeCalledSince, limit = 50 } = filters;

  let query = supabase
    .from('crm_contacts')
    .select('*, crm_companies(id, name)')
    .is('deleted_at', null)
    .not('phone', 'is', null)
    .neq('phone', '');

  if (status) query = query.eq('status', status);
  if (tag)    query = query.contains('tags', [tag]);
  if (search) query = query.or(`name.ilike.%${search}%,phone.ilike.%${search}%`);

  query = query.order('updated_at', { ascending: false }).limit(limit);

  const { data, error } = await query;
  if (error) {
    toast(`Erro ao montar fila de chamadas: ${error.message}`, 'error');
    return [];
  }

  let contacts = data || [];
  if (excludeCalledSince && contacts.length) {
    const recentSet = await getRecentlyCalledContactIds(contacts.map(c => c.id), excludeCalledSince);
    contacts = contacts.filter(c => !recentSet.has(c.id));
  }

  return contacts.map(row => ({
    id: `contact:${row.id}`,
    contactId: row.id,
    companyId: row.company_id || null,
    name: row.name,
    phone: row.phone,
    email: row.email || null,
    position: row.position || null,
    status: row.status || 'lead',
    avatarColor: row.avatar_color || null,
    company: row.crm_companies ? { id: row.crm_companies.id, name: row.crm_companies.name } : null,
    tags: Array.isArray(row.tags) ? row.tags : [],
    sourceType: 'contacts',
    sourceId: row.id,
    sourceContext: null,
  }));
}

async function getQueueFromStuckDeals(filters) {
  const { search, limit = 50, stuckDays = DEFAULT_STUCK_DAYS, excludeCalledSince } = filters;
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - stuckDays);

  let query = supabase
    .from('crm_deals')
    .select('id, title, value, status, contact_id, contact_name, contact_phone, company_id, stage_id, updated_at, crm_contacts(id, name, phone, avatar_color), crm_companies(id, name), crm_pipeline_stages(id, name)')
    .is('deleted_at', null)
    .eq('status', 'open')
    .lte('updated_at', cutoff.toISOString());

  if (search) query = query.or(`title.ilike.%${search}%,contact_name.ilike.%${search}%,contact_phone.ilike.%${search}%`);

  query = query.order('updated_at', { ascending: true }).limit(limit);

  const { data, error } = await query;
  if (error) {
    toast(`Erro ao buscar leads parados: ${error.message}`, 'error');
    return [];
  }

  let deals = (data || []).filter(d => {
    const phone = d.contact_phone || d.crm_contacts?.phone;
    return !!phone;
  });

  if (excludeCalledSince && deals.length) {
    const contactIds = deals.map(d => d.contact_id).filter(Boolean);
    const recentSet = await getRecentlyCalledContactIds(contactIds, excludeCalledSince);
    deals = deals.filter(d => !d.contact_id || !recentSet.has(d.contact_id));
  }

  const now = Date.now();
  return deals.map(d => {
    const daysStuck = Math.floor((now - new Date(d.updated_at).getTime()) / (1000 * 60 * 60 * 24));
    const phone = d.contact_phone || d.crm_contacts?.phone || '';
    const name = d.crm_contacts?.name || d.contact_name || 'Sem nome';
    const stageName = d.crm_pipeline_stages?.name || '';
    return {
      id: `deal:${d.id}`,
      contactId: d.contact_id || null,
      companyId: d.company_id || null,
      name,
      phone,
      email: null,
      position: null,
      status: null,
      avatarColor: pickAvatarColor(d),
      company: d.crm_companies ? { id: d.crm_companies.id, name: d.crm_companies.name } : null,
      tags: [],
      sourceType: 'stuck_deals',
      sourceId: d.id,
      sourceContext: stageName
        ? `${stageName} · parado ha ${daysStuck} dias`
        : `Parado ha ${daysStuck} dias`,
      dealId: d.id,
      dealTitle: d.title,
      dealValue: d.value,
    };
  });
}

async function getQueueFromScheduledCalls(filters) {
  const { search, limit = 50, windowDays = 1 } = filters;
  const start = new Date();
  start.setDate(start.getDate() - 30);
  const end = new Date();
  end.setDate(end.getDate() + windowDays);

  let query = supabase
    .from('crm_activities')
    .select('*, crm_contacts(id, name, phone, avatar_color, company_id, position, crm_companies(id, name)), crm_deals(id, title)')
    .is('deleted_at', null)
    .eq('type', 'call')
    .eq('completed', false)
    .gte('start_date', start.toISOString())
    .lte('start_date', end.toISOString());

  if (search) query = query.ilike('title', `%${search}%`);

  query = query.order('start_date', { ascending: true }).limit(limit);

  const { data, error } = await query;
  if (error) {
    toast(`Erro ao buscar ligacoes agendadas: ${error.message}`, 'error');
    return [];
  }

  return (data || [])
    .filter(a => a.crm_contacts?.phone)
    .map(a => {
      const c = a.crm_contacts;
      const when = new Date(a.start_date);
      const now = Date.now();
      const diffMin = Math.round((when.getTime() - now) / 60000);
      let context;
      if (diffMin < -60) context = `Atrasada ha ${Math.abs(Math.round(diffMin / 60))}h`;
      else if (diffMin < 0) context = `Atrasada ha ${Math.abs(diffMin)}min`;
      else if (diffMin < 60) context = `Em ${diffMin}min`;
      else context = when.toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' });

      return {
        id: `activity:${a.id}`,
        contactId: c.id,
        companyId: c.company_id || null,
        name: c.name,
        phone: c.phone,
        email: null,
        position: c.position || null,
        status: null,
        avatarColor: c.avatar_color || null,
        company: c.crm_companies ? { id: c.crm_companies.id, name: c.crm_companies.name } : null,
        tags: [],
        sourceType: 'scheduled_calls',
        sourceId: a.id,
        sourceContext: a.title ? `${a.title} · ${context}` : context,
        dealId: a.deal_id || null,
        activityId: a.id,
      };
    });
}

async function getQueueFromProspects(filters) {
  const { search, limit = 50 } = filters;

  let query = supabase
    .from('crm_prospects')
    .select('*')
    .is('deleted_at', null)
    .not('phone', 'is', null)
    .neq('phone', '')
    .not('status', 'in', '(sent_to_pipeline,converted)');

  if (search) {
    query = query.or(`company_name.ilike.%${search}%,contact_name.ilike.%${search}%,phone.ilike.%${search}%`);
  }

  query = query.order('created_at', { ascending: false }).limit(limit);

  const { data, error } = await query;
  if (error) {
    toast(`Erro ao buscar prospects: ${error.message}`, 'error');
    return [];
  }

  return (data || []).map(p => {
    const name = p.contact_name || p.company_name || 'Sem nome';
    const cityState = [p.city, p.state].filter(Boolean).join('/');
    const sourceTag = p.source ? `${p.source}` : 'prospect';
    return {
      id: `prospect:${p.id}`,
      contactId: null,
      companyId: null,
      name,
      phone: p.phone,
      email: p.email || null,
      position: p.position || null,
      status: null,
      avatarColor: null,
      company: p.company_name ? { id: null, name: p.company_name } : null,
      tags: [],
      sourceType: 'prospects',
      sourceId: p.id,
      sourceContext: cityState ? `${sourceTag} · ${cityState}` : sourceTag,
      prospectId: p.id,
      prospectData: p,
    };
  });
}

/**
 * Ultimas N chamadas de um contato (timeline no painel lateral do discador).
 */
export async function getRecentCallsForContact(contactId, limit = 5) {
  if (!contactId) return [];
  const { data, error } = await supabase
    .from('crm_calls')
    .select('*')
    .eq('contact_id', contactId)
    .is('deleted_at', null)
    .order('started_at', { ascending: false })
    .limit(limit);

  if (error) return [];
  return (data || []).map(dbToCrmCall);
}

// ==================== PROMOTE PROSPECT ====================

/**
 * Promove um crm_prospect a crm_contact. Cria o contato, opcionalmente cria
 * a empresa, e marca o prospect como convertido (status='converted').
 *
 * Retorna o contato criado (ou null se falhou).
 */
async function promoteProspectToContact(prospectId, userId) {
  const { data: prospect, error } = await supabase
    .from('crm_prospects')
    .select('*')
    .eq('id', prospectId)
    .is('deleted_at', null)
    .single();
  if (error || !prospect) return null;

  // Cria empresa se houver nome (e ainda nao existir com mesmo nome)
  let companyId = null;
  if (prospect.company_name) {
    const { data: existing } = await supabase
      .from('crm_companies')
      .select('id')
      .ilike('name', prospect.company_name)
      .is('deleted_at', null)
      .maybeSingle();
    if (existing?.id) {
      companyId = existing.id;
    } else {
      const { data: newCompany } = await supabase
        .from('crm_companies')
        .insert({
          name: prospect.company_name,
          cnpj: prospect.cnpj || null,
          segment: prospect.segment || null,
          size: prospect.size || null,
          phone: prospect.phone || null,
          email: prospect.email || null,
          website: prospect.website || null,
          city: prospect.city || null,
          state: prospect.state || null,
          created_by: userId,
        })
        .select()
        .single();
      companyId = newCompany?.id || null;
    }
  }

  const contactName = prospect.contact_name || prospect.company_name || 'Contato sem nome';
  const { data: contact, error: contactErr } = await supabase
    .from('crm_contacts')
    .insert({
      name: contactName,
      phone: prospect.phone || null,
      email: prospect.email || null,
      position: prospect.position || null,
      status: 'lead',
      company_id: companyId,
      city: prospect.city || null,
      state: prospect.state || null,
      notes: prospect.notes || '',
      created_by: userId,
    })
    .select()
    .single();

  if (contactErr) {
    console.warn('[crmCallsService] Erro ao criar contato a partir de prospect:', contactErr.message);
    return null;
  }

  // Marca prospect como convertido (preserva pra historico)
  await supabase
    .from('crm_prospects')
    .update({ status: 'converted', updated_at: new Date().toISOString() })
    .eq('id', prospectId);

  return contact;
}

// ==================== MUTATIONS ====================

/**
 * Registra uma chamada finalizada (V1 = manual; vendedor preenche pos-call).
 *
 * Pos-criacao:
 *   - se a chamada veio de um prospect (input.prospectId), promove o prospect
 *     pra crm_contacts e usa o id criado pra ligar a chamada ao novo contato;
 *   - se veio de uma activity agendada (input.activityId), marca ela como completa;
 *   - espelha activity type='call' em crm_activities (timeline);
 *   - se outcome='callback_scheduled' + followUpAt, cria activity de retorno.
 */
export async function createCrmCall(input) {
  const session = await supabase.auth.getSession();
  const userId = session.data?.session?.user?.id;

  // Promover prospect -> contato (se for o caso e ainda nao houver contactId)
  let resolvedContactId = input.contactId || null;
  if (!resolvedContactId && input.prospectId) {
    try {
      const promoted = await promoteProspectToContact(input.prospectId, userId);
      if (promoted?.id) resolvedContactId = promoted.id;
    } catch (err) {
      console.warn('[crmCallsService] Falha ao promover prospect:', err?.message || err);
    }
  }

  const startedAt = input.startedAt || new Date().toISOString();
  const call = await callService.create(
    { ...input, contactId: resolvedContactId, startedAt },
    { created_by: userId }
  );
  if (!call?.id) return null;

  // Marca activity agendada como concluida (a chamada substitui ela)
  if (input.activityId) {
    try {
      await supabase
        .from('crm_activities')
        .update({ completed: true, completed_at: call.endedAt || startedAt })
        .eq('id', input.activityId);
    } catch (err) {
      console.warn('[crmCallsService] Falha ao concluir activity origem:', err?.message || err);
    }
  }

  // 1) Espelho na timeline: crm_activities type='call' (ja concluida).
  try {
    const outcomeLabel = CALL_OUTCOMES[call.outcome]?.label || 'Ligacao';
    const phoneFragment = call.phoneDialed ? ` para ${call.phoneDialed}` : '';
    const titleBase = call.contact?.name
      ? `Ligacao para ${call.contact.name}`
      : `Ligacao${phoneFragment}`;

    const activity = await createCrmActivity({
      title: `${titleBase} — ${outcomeLabel}`,
      description: call.notes || '',
      type: 'call',
      contactId: call.contactId,
      dealId: call.dealId,
      startDate: call.startedAt,
      endDate: call.endedAt || call.startedAt,
      completed: true,
      completedAt: call.endedAt || call.startedAt,
    });
    if (activity?.id) {
      await supabase.from('crm_calls').update({ activity_id: activity.id }).eq('id', call.id);
      call.activityId = activity.id;
    }
  } catch (err) {
    console.warn('[crmCallsService] Falha ao espelhar atividade da chamada:', err?.message || err);
  }

  // 2) Retorno agendado: cria activity dedicada (aparece na agenda do vendedor).
  if (call.outcome === 'callback_scheduled' && call.followUpAt) {
    try {
      const followUp = await createCrmActivity({
        title: call.contact?.name
          ? `Retornar ligacao — ${call.contact.name}`
          : `Retornar ligacao — ${call.phoneDialed || ''}`.trim(),
        description: call.notes || '',
        type: 'call',
        contactId: call.contactId,
        dealId: call.dealId,
        startDate: call.followUpAt,
        completed: false,
      });
      if (followUp?.id) {
        await supabase.from('crm_calls').update({ follow_up_activity_id: followUp.id }).eq('id', call.id);
        call.followUpActivityId = followUp.id;
      }
    } catch (err) {
      console.warn('[crmCallsService] Falha ao agendar retorno:', err?.message || err);
    }
  }

  return call;
}

export async function updateCrmCall(id, updates) {
  return callService.update(id, updates);
}

export async function softDeleteCrmCall(id) {
  const { error } = await supabase
    .from('crm_calls')
    .update({ deleted_at: new Date().toISOString() })
    .eq('id', id);
  if (error) {
    toast(`Erro ao excluir chamada: ${error.message}`, 'error');
    return false;
  }
  return true;
}
