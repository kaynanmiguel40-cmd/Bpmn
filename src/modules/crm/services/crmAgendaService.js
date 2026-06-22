/**
 * crmAgendaService - dados da Agenda do CRM (calendario + historico do lead).
 *
 * Duas responsabilidades:
 *  1. getCrmCalendarActivities(range)  -> atividades do CRM pra preencher o calendario.
 *  2. getLeadTimeline({ dealId, contactId }) -> timeline UNIFICADA de um lead:
 *     atividades + ligacoes + WhatsApp + mudancas de estagio + notas do deal.
 *
 * O calendario combina estas atividades com os eventos do Google Calendar
 * (puxados via useGCalEvents) no componente — aqui so cuidamos do lado CRM.
 */

import { supabase } from '../../../lib/supabase';
import { toast } from '../../../contexts/ToastContext';
import { dbToCrmActivity } from './crmActivitiesService';
import { dbToCrmCall, CALL_OUTCOMES } from './crmCallsService';
import { dbToCrmMessage } from './crmMessagesService';
import { getDealStageHistory } from './crmDealsService';

// Tipo de atividade -> rotulo + cor + acento visual. Fonte unica pro calendario
// e pra timeline (mantem consistencia de cor entre as duas visoes).
// Paleta com matizes BEM distintos entre si (antes havia 2 verdes e 2
// laranjas que se confundiam). Cada tipo tem um tom claramente separado.
//
// kind separa o que é TAREFA (to-do que o vendedor faz; tem "concluir";
// vira checkbox riscável na agenda) do que é EVENTO (compromisso com hora
// marcada; vira bloco). Ambos sincronizam com o Google Calendar.
export const ACTIVITY_META = {
  call:      { label: 'Ligação',   color: '#f59e0b', kind: 'task' },  // âmbar
  message:   { label: 'Mensagem',  color: '#22c55e', kind: 'task' },  // verde (WhatsApp)
  email:     { label: 'E-mail',    color: '#8b5cf6', kind: 'task' },  // violeta
  follow_up: { label: 'Follow-up', color: '#a855f7', kind: 'task' },  // roxo
  task:      { label: 'Tarefa',    color: '#64748b', kind: 'task' },  // cinza (neutro)
  meeting:   { label: 'Reunião',   color: '#3b82f6', kind: 'event' }, // azul
  visit:     { label: 'Visita',    color: '#06b6d4', kind: 'event' }, // ciano
  lunch:     { label: 'Almoço',    color: '#ec4899', kind: 'event' }, // rosa
};

export function activityMeta(type) {
  return ACTIVITY_META[type] || { label: type || 'Atividade', color: '#64748b', kind: 'task' };
}

/** 'task' (to-do, checkbox) ou 'event' (compromisso, bloco). Ambos → Google Calendar. */
export function activityKind(type) {
  return ACTIVITY_META[type]?.kind || 'task';
}

/**
 * Compara o horário PREVISTO (agendado) com o REALIZADO (concluído) de uma
 * atividade e descreve o desvio. Tolerância de 5min conta como "no horário".
 * @returns {{ state: 'on_time'|'late'|'early', label: string, diffMin: number } | null}
 */
export function scheduleTiming(plannedISO, doneISO) {
  if (!plannedISO || !doneISO) return null;
  const diffMin = Math.round((new Date(doneISO).getTime() - new Date(plannedISO).getTime()) / 60000);
  const abs = Math.abs(diffMin);
  if (abs < 5) return { state: 'on_time', label: 'no horário', diffMin };
  const h = Math.floor(abs / 60);
  const m = abs % 60;
  const dur = h > 0 ? `${h}h${m ? String(m).padStart(2, '0') : ''}` : `${m}min`;
  return { state: diffMin > 0 ? 'late' : 'early', label: `${diffMin > 0 ? '+' : '−'}${dur}`, diffMin };
}

/** Nome curto do lead a partir de uma atividade (deal tem prioridade sobre contato). */
function leadLabel({ deal, contact }) {
  return deal?.title || contact?.name || 'Sem vínculo';
}

// ==================== CALENDÁRIO ====================

/**
 * Atividades do CRM cujo intervalo cruza [start, end]. Cada item ja vem com o
 * lead resolvido (deal/contact) e a cor do tipo, pronto pro chip do calendario.
 *
 * @param {{ start: string, end: string }} range - ISO datetime do recorte visivel
 */
export async function getCrmCalendarActivities({ start, end } = {}) {
  let query = supabase
    .from('crm_activities')
    .select('*, crm_contacts(id, name, avatar_color), crm_deals(id, title, value, crm_pipeline_stages(name, color))')
    .is('deleted_at', null)
    .order('start_date', { ascending: true });

  if (end) query = query.lte('start_date', end);
  if (start) {
    // Intersecao: termina depois do inicio do recorte OU (sem fim e comeca dentro)
    query = query.or(`end_date.gte.${start},and(end_date.is.null,start_date.gte.${start})`);
  }

  const { data, error } = await query;
  if (error) {
    toast(`Erro ao carregar agenda: ${error.message}`, 'error');
    return [];
  }

  return (data || []).map(row => {
    const a = dbToCrmActivity(row);
    const meta = activityMeta(a.type);
    const stage = row.crm_deals?.crm_pipeline_stages;
    return {
      ...a,
      source: 'crm',
      color: meta.color,
      typeLabel: meta.label,
      leadName: leadLabel(a),
      stageName: stage?.name || null,
    };
  });
}

// ==================== TIMELINE DO LEAD ====================

/**
 * Timeline unificada de um lead. Junta, ordenada no tempo:
 *  - atividades (feitas e agendadas)   kind: 'activity'
 *  - ligacoes (com resultado/notas)    kind: 'call'
 *  - WhatsApp (enviado/recebido)       kind: 'message'
 *  - mudancas de estagio do deal       kind: 'stage'
 * Mais o cabecalho do lead (estagio atual, valor, status, notas).
 *
 * Aceita dealId e/ou contactId. Quando ha deal, ele e a ancora principal e o
 * contactId e inferido a partir dele se nao vier.
 *
 * @returns {Promise<{ lead: object|null, items: object[] }>}
 */
export async function getLeadTimeline({ dealId = null, contactId = null } = {}) {
  if (!dealId && !contactId) return { lead: null, items: [] };

  // 1) Ancora: o deal (se houver) traz estagio/valor/status/notas + contactId
  let lead = null;
  let resolvedContactId = contactId;
  if (dealId) {
    const { data: deal } = await supabase
      .from('crm_deals')
      .select('id, title, value, status, notes, stage_id, contact_id, company_id, ' +
              'crm_pipeline_stages(id, name, color), crm_companies(id, name), crm_contacts(id, name, phone)')
      .eq('id', dealId)
      .is('deleted_at', null)
      .maybeSingle();
    if (deal) {
      resolvedContactId = resolvedContactId || deal.contact_id || null;
      lead = {
        dealId: deal.id,
        title: deal.title,
        value: deal.value || 0,
        status: deal.status,
        notes: deal.notes || '',
        stage: deal.crm_pipeline_stages
          ? { id: deal.crm_pipeline_stages.id, name: deal.crm_pipeline_stages.name, color: deal.crm_pipeline_stages.color }
          : null,
        company: deal.crm_companies ? { id: deal.crm_companies.id, name: deal.crm_companies.name } : null,
        contact: deal.crm_contacts ? { id: deal.crm_contacts.id, name: deal.crm_contacts.name, phone: deal.crm_contacts.phone } : null,
        contactId: deal.contact_id || null,
        companyId: deal.company_id || null,
      };
    }
  }
  if (!lead && resolvedContactId) {
    const { data: contact } = await supabase
      .from('crm_contacts')
      .select('id, name, phone, company_id, crm_companies(id, name)')
      .eq('id', resolvedContactId)
      .is('deleted_at', null)
      .maybeSingle();
    if (contact) {
      lead = {
        dealId: null,
        title: contact.name,
        value: 0,
        status: null,
        notes: '',
        stage: null,
        company: contact.crm_companies ? { id: contact.crm_companies.id, name: contact.crm_companies.name } : null,
        contact: { id: contact.id, name: contact.name, phone: contact.phone },
        contactId: contact.id,
        companyId: contact.company_id || null,
      };
    }
  }

  // Filtro OR pra casar deal_id OU contact_id (o que estiver disponivel)
  const orParts = [];
  if (dealId) orParts.push(`deal_id.eq.${dealId}`);
  if (resolvedContactId) orParts.push(`contact_id.eq.${resolvedContactId}`);
  const orFilter = orParts.join(',');

  // 2) Buscar as 4 fontes em paralelo. crm_messages NAO tem deleted_at,
  // entao nao filtramos por isso ali.
  const [actsRes, callsRes, msgsRes, stageHistory] = await Promise.all([
    orFilter
      ? supabase.from('crm_activities')
          .select('*, crm_contacts(id, name, avatar_color), crm_deals(id, title, value)')
          .or(orFilter).is('deleted_at', null).order('start_date', { ascending: false })
      : Promise.resolve({ data: [] }),
    orFilter
      ? supabase.from('crm_calls')
          .select('*, crm_contacts(id, name, phone, avatar_color), crm_deals(id, title, value)')
          .or(orFilter).is('deleted_at', null).order('started_at', { ascending: false })
      : Promise.resolve({ data: [] }),
    orFilter
      ? supabase.from('crm_messages')
          .select('*')
          .or(orFilter).order('sent_at', { ascending: false }).limit(60)
      : Promise.resolve({ data: [] }),
    // getDealStageHistory ja resolve o nome do estagio com fallback embutido
    dealId ? getDealStageHistory(dealId) : Promise.resolve([]),
  ]);

  const nowMs = Date.now();
  const items = [];

  // Cada ligacao registrada cria uma atividade-espelho (type='call') pra
  // alimentar o calendario. Na timeline NAO queremos as duas: o item 'call'
  // ja traz resultado/notas/duracao, entao pulamos a atividade-espelho dela.
  const mirroredActivityIds = new Set(
    (callsRes.data || []).map(r => r.activity_id).filter(Boolean)
  );

  // Atividades — passadas (feitas) e futuras (agendadas)
  (actsRes.data || []).forEach(row => {
    if (mirroredActivityIds.has(row.id)) return; // espelho de ligacao — a call ja entra
    const a = dbToCrmActivity(row);
    const meta = activityMeta(a.type);
    const when = a.startDate;
    const isFuture = !a.completed && when && new Date(when).getTime() > nowMs;
    items.push({
      id: `act_${a.id}`,
      kind: 'activity',
      activityType: a.type,
      title: a.title,
      detail: a.description || '',
      date: when,
      endDate: a.endDate || null,
      completedAt: a.completedAt || null,
      color: meta.color,
      typeLabel: meta.label,
      done: a.completed,
      future: isFuture,
      activityId: a.id,
    });
  });

  // Ligações — sempre passado; outcome + notas
  (callsRes.data || []).forEach(row => {
    const c = dbToCrmCall(row);
    const outcome = c.outcome ? (CALL_OUTCOMES[c.outcome]?.label || c.outcome) : null;
    const dur = c.durationSeconds != null
      ? ` · ${Math.floor(c.durationSeconds / 60)}m${String(c.durationSeconds % 60).padStart(2, '0')}s`
      : '';
    items.push({
      id: `call_${c.id}`,
      kind: 'call',
      title: c.direction === 'inbound' ? 'Ligação recebida' : 'Ligação',
      detail: [outcome, c.notes].filter(Boolean).join(' — ') + dur,
      date: c.startedAt,
      color: '#f59e0b',
      typeLabel: 'Ligação',
      outcome: c.outcome,
      done: true,
      future: false,
    });
  });

  // WhatsApp — direção define o lado da conversa
  (msgsRes.data || []).forEach(row => {
    const m = dbToCrmMessage(row);
    const preview = m.content
      ? (m.content.length > 140 ? m.content.slice(0, 140) + '…' : m.content)
      : (m.mediaType ? `[${m.mediaType}]` : '(sem conteúdo)');
    const inbound = m.direction === 'inbound';
    items.push({
      id: `msg_${m.id}`,
      kind: 'message',
      title: inbound ? 'WhatsApp recebido' : 'WhatsApp enviado',
      detail: preview,
      date: m.sentAt || m.createdAt,
      color: '#10b981',
      typeLabel: 'WhatsApp',
      inbound,
      done: true,
      future: false,
    });
  });

  // Mudanças de estágio (getDealStageHistory: camelCase + stage resolvido)
  (stageHistory || []).forEach(h => {
    items.push({
      id: `stage_${h.id}`,
      kind: 'stage',
      title: 'Mudou de estágio',
      detail: h.stage?.name ? `→ ${h.stage.name}` : '',
      date: h.createdAt,
      color: h.stage?.color || '#a855f7',
      typeLabel: 'Estágio',
      done: true,
      future: false,
    });
  });

  // Ordena: tudo por data desc; o componente separa futuro x passado.
  items.sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0));

  return { lead, items };
}
