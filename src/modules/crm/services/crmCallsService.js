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
import { escapeIlike, orIlike } from '../lib/searchFilters';
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
    query = query.or(orIlike(['phone_dialed', 'notes'], search));
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

// O MOTOR DA FILA DO DISCADOR SAIU DAQUI.
//
// Eram 4 fontes (contatos, leads parados, agendadas, prospects), cada uma com
// sua propria ordenacao — e nenhuma usava a prioridade do resto do sistema.
// Com o discador removido, ligar virou acao DENTRO da tarefa da Agenda, que ja
// tem uma fila priorizada. Manter 330 linhas de fila paralela sem chamador era
// deixar armadilha pro proximo que fosse mexer em ligacao.
//
// O que ficou: o registro da chamada (crm_calls continua sendo a fonte
// primaria), o historico por contato e as tentativas contadas pelo toque.

/**
 * Ultimas N chamadas de um contato.
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
      .ilike('name', escapeIlike(prospect.company_name))
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

export async function softDeleteCrmCall(id) {
  const now = new Date().toISOString();

  // createCrmCall gera uma atividade-espelho (crm_activities type='call') e, se
  // houver retorno agendado, uma atividade de follow-up. Precisamos soft-deletar
  // as duas junto: sem isto o espelho fica órfão e vivo, e como a dedup da
  // timeline (mirroredActivityIds) só olha as ligações VIVAS, ele volta a
  // aparecer no histórico do lead como atividade concluída — parece que a
  // exclusão da ligação falhou.
  const { data: call } = await supabase
    .from('crm_calls')
    .select('activity_id, follow_up_activity_id')
    .eq('id', id)
    .maybeSingle();

  const { error } = await supabase
    .from('crm_calls')
    .update({ deleted_at: now })
    .eq('id', id);
  if (error) {
    toast(`Erro ao excluir chamada: ${error.message}`, 'error');
    return false;
  }

  const mirrorIds = [call?.activity_id, call?.follow_up_activity_id].filter(Boolean);
  if (mirrorIds.length) {
    const { error: mirrorErr } = await supabase
      .from('crm_activities')
      .update({ deleted_at: now })
      .in('id', mirrorIds)
      .is('deleted_at', null);
    if (mirrorErr) console.warn('[crmCallsService] Falha ao remover espelho da chamada:', mirrorErr.message);
  }

  return true;
}

/**
 * Registra o TOQUE no botao Ligar — uma tentativa, nao uma ligacao concluida.
 *
 * Por que nao usar createCrmCall: ele conclui a atividade de origem quando
 * recebe `activityId`. Aqui isso seria errado por dois motivos. O passo da
 * cadencia manda "3 TENTATIVAS SEGUIDAS" — fechar a tarefa no primeiro toque
 * apagaria os outros dois antes de acontecerem. E a tarefa so termina quando a
 * pessoa registra o que houve; o toque e o comeco, nao o fim.
 *
 * O que isto resolve: ate agora a contagem de tentativas era auto-declarada —
 * saia do que a vendedora lembrava de marcar. O toque no botao e o unico
 * momento em que o sistema tem certeza de que uma ligacao foi iniciada.
 *
 * Fica DELIBERADAMENTE sem outcome: quem preenche e o registro da tarefa. Uma
 * tentativa sem desfecho e informacao honesta (discou e nao se sabe o resto),
 * enquanto chutar 'no_answer' contaminaria a taxa de atendimento com ligacoes
 * que podem ter sido atendidas.
 *
 * `canal`: 'device' = chip do aparelho (tel:), 'whatsapp' = chamada de voz pelo
 * WhatsApp. Separar os dois e o que deixa responder "por onde atendem mais?" —
 * a pergunta que decide a ordem dos toques na proxima cadencia. Juntos, viram
 * uma media que nao descreve nenhum dos dois.
 */
export async function registrarTentativaDeLigacao({ contactId = null, dealId = null, phone = null, activityId = null, canal = 'device' } = {}) {
  if (!phone) return null;
  const session = await supabase.auth.getSession();
  const userId = session.data?.session?.user?.id;

  const { data, error } = await supabase
    .from('crm_calls')
    .insert({
      contact_id: contactId,
      deal_id: dealId,
      // Guarda de qual tarefa o toque saiu SEM concluir ela: e o vinculo que
      // deixa contar quantas tentativas aquele passo ja levou.
      activity_id: activityId,
      phone_dialed: phone,
      direction: 'outbound',
      channel: canal,
      started_at: new Date().toISOString(),
      created_by: userId,
    })
    .select('id, started_at')
    .single();

  // Falha aqui NAO pode atrapalhar a ligacao: o discar ja aconteceu no celular.
  // Perder a contagem e ruim; travar a tela de quem esta ligando e pior.
  if (error) { console.warn('[registrarTentativaDeLigacao]', error.message); return null; }
  return data;
}

/** Quantas tentativas de ligacao ja saíram desta tarefa. */
export async function contarTentativas(activityId) {
  if (!activityId) return 0;
  const { count, error } = await supabase
    .from('crm_calls')
    .select('id', { count: 'exact', head: true })
    .eq('activity_id', activityId)
    .is('deleted_at', null);
  if (error) { console.warn('[contarTentativas]', error.message); return 0; }
  return count || 0;
}
