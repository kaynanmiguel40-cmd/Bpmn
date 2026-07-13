/**
 * crmAgendaService - dados da Agenda do CRM (calendario + historico do lead).
 *
 * Tres responsabilidades:
 *  1. getCrmCalendarActivities(range)  -> atividades do CRM pra preencher o calendario.
 *  2. getLeadTimeline({ dealId, contactId }) -> timeline UNIFICADA de um lead:
 *     atividades + ligacoes + WhatsApp + mudancas de estagio + notas do deal.
 *  3. getLeadActivityHistory({ dealId, contactId }) -> historico de INTERACOES:
 *     mesmas fontes da timeline, mas pareando input do vendedor x output do
 *     lead por toque, em ordem cronologica de execucao (mais antigo primeiro).
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

/**
 * Nome curto do lead a partir de uma atividade (deal tem prioridade sobre
 * contato). null quando a atividade e avulsa (sem deal/contato) — antes
 * caia num fallback 'Sem vínculo' que, sendo string nao-vazia, enganava o
 * chip do calendario (que troca o titulo pelo leadName sempre que ele existe)
 * e mostrava "Sem vínculo" no lugar do titulo real da tarefa.
 */
function leadLabel({ deal, contact }) {
  return deal?.title || contact?.name || null;
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
 * Resolve o "lead" (deal ou, na falta dele, o contato) e monta o filtro OR
 * pra casar deal_id/contact_id nas tabelas transacionais. Compartilhado por
 * getLeadTimeline e getLeadActivityHistory pra manter a mesma âncora.
 */
async function resolveLeadAndFilter({ dealId = null, contactId = null } = {}) {
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

  const orParts = [];
  if (dealId) orParts.push(`deal_id.eq.${dealId}`);
  if (resolvedContactId) orParts.push(`contact_id.eq.${resolvedContactId}`);
  return { lead, resolvedContactId, orFilter: orParts.join(',') };
}

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

  const { lead, resolvedContactId, orFilter } = await resolveLeadAndFilter({ dealId, contactId });

  // Buscar as 4 fontes em paralelo. crm_messages NAO tem deleted_at,
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
      // Input/output capturados ao concluir (CompleteActivityModal) — mesmo
      // par "Você"/"Lead" mostrado no Histórico da página do Negócio.
      deliveryInput: a.deliveryInput || '',
      deliveryReport: a.deliveryReport || '',
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

// ==================== HISTÓRICO DE INTERAÇÕES (input vendedor / output lead) ====================
//
// Diferença pra getLeadTimeline: aquela é uma lista plana de eventos (1 por
// linha, mais recente primeiro, pensada pra feed). Aqui cada entrada PAREIA
// o que o VENDEDOR fez/disse (input) com o que o LEAD respondeu/reagiu
// (output) no mesmo toque, ordenada da mais antiga pra mais recente — ordem
// de execução, pensada pra ler como uma história. Só entra o que já
// aconteceu (sem pendências).

/** Agrupa mensagens consecutivas da mesma direção em "turnos" de conversa. */
function groupMessageTurns(messages) {
  const sorted = [...messages].sort((a, b) => new Date(a.sentAt || a.createdAt) - new Date(b.sentAt || b.createdAt));
  const turns = [];
  for (const m of sorted) {
    const last = turns[turns.length - 1];
    if (last && last.direction === m.direction) last.messages.push(m);
    else turns.push({ direction: m.direction, messages: [m] });
  }
  return turns;
}

function turnText(turn) {
  return turn.messages
    .map(m => m.content || (m.mediaType ? `[${m.mediaType}]` : '(sem conteúdo)'))
    .join('\n');
}

function turnStart(turn) {
  return turn.messages[0].sentAt || turn.messages[0].createdAt;
}

/** Pareia turno enviado (vendedor) com o turno seguinte recebido (lead), se houver. */
function pairMessageTurns(turns) {
  const entries = [];
  let i = 0;
  while (i < turns.length) {
    const turn = turns[i];
    const next = turns[i + 1];
    if (turn.direction === 'outbound') {
      const answered = !!next && next.direction === 'inbound';
      entries.push({
        occurredAt: turnStart(turn),
        input: { text: turnText(turn), by: 'vendedor' },
        output: answered ? { text: turnText(next), by: 'lead' } : null,
      });
      i += answered ? 2 : 1;
    } else {
      // Lead escreveu primeiro, sem toque anterior do vendedor nesse turno.
      entries.push({ occurredAt: turnStart(turn), input: null, output: { text: turnText(turn), by: 'lead' } });
      i += 1;
    }
  }
  return entries;
}

/**
 * @typedef {Object} ActivityHistoryEntry
 * @property {string} id
 * @property {'call'|'whatsapp'|'activity'|'stage'} kind
 * @property {string} occurredAt - ISO, quando o toque começou
 * @property {{ text: string, by: 'vendedor' }|null} input - o que o vendedor fez/disse
 * @property {{ text: string, by: 'lead' }|null} output - o que o lead respondeu/reagiu
 * @property {Object} meta - campos extras por kind (outcome, activityType, stageName, duração...)
 */

/**
 * Histórico cronológico de INTERAÇÕES de um lead: junta ligações, WhatsApp
 * (agrupado em turnos vendedor↔lead), atividades concluídas (com relato) e
 * mudanças de etapa numa única linha do tempo com input/output pareados.
 *
 * @returns {Promise<{ lead: object|null, entries: ActivityHistoryEntry[] }>}
 */
export async function getLeadActivityHistory({ dealId = null, contactId = null } = {}) {
  if (!dealId && !contactId) return { lead: null, entries: [] };

  const { lead, resolvedContactId, orFilter } = await resolveLeadAndFilter({ dealId, contactId });
  if (!orFilter) return { lead, entries: [] };

  const [actsRes, callsRes, msgsRes, stageHistory] = await Promise.all([
    supabase.from('crm_activities')
      .select('*, crm_contacts(id, name, avatar_color), crm_deals(id, title, value)')
      .or(orFilter).eq('completed', true).is('deleted_at', null),
    supabase.from('crm_calls')
      .select('*, crm_contacts(id, name, phone, avatar_color), crm_deals(id, title, value)')
      .or(orFilter).is('deleted_at', null),
    supabase.from('crm_messages').select('*').or(orFilter).order('sent_at', { ascending: true }).limit(200),
    dealId ? getDealStageHistory(dealId) : Promise.resolve([]),
  ]);

  const entries = [];

  // Ligações registradas criam uma atividade-espelho — não duplicar aqui tb.
  const mirroredActivityIds = new Set((callsRes.data || []).map(r => r.activity_id).filter(Boolean));

  (actsRes.data || []).forEach(row => {
    if (mirroredActivityIds.has(row.id)) return;
    const a = dbToCrmActivity(row);
    const meta = activityMeta(a.type);
    // input = o que o vendedor relatou ao concluir (delivery_input); sem isso
    // (tarefa concluída antes dessa coluna existir), cai pro plano original.
    entries.push({
      id: `act_${a.id}`,
      kind: 'activity',
      occurredAt: a.completedAt || a.startDate,
      input: { text: a.deliveryInput || a.description || a.title || meta.label, by: 'vendedor' },
      output: a.deliveryReport ? { text: a.deliveryReport, by: 'lead' } : null,
      meta: { activityType: a.type, typeLabel: meta.label },
    });
  });

  (callsRes.data || []).forEach(row => {
    const c = dbToCrmCall(row);
    const outcomeLabel = c.outcome ? (CALL_OUTCOMES[c.outcome]?.label || c.outcome) : null;
    const vendorInitiated = c.direction !== 'inbound';
    entries.push({
      id: `call_${c.id}`,
      kind: 'call',
      occurredAt: c.startedAt,
      input: vendorInitiated ? { text: c.notes || 'Ligação realizada', by: 'vendedor' } : null,
      output: vendorInitiated
        ? (outcomeLabel ? { text: outcomeLabel, by: 'lead' } : null)
        : { text: [outcomeLabel, c.notes].filter(Boolean).join(' — ') || 'Lead retornou a ligação', by: 'lead' },
      meta: { outcome: c.outcome, durationSeconds: c.durationSeconds, direction: c.direction },
    });
  });

  const messages = (msgsRes.data || []).map(dbToCrmMessage);
  pairMessageTurns(groupMessageTurns(messages)).forEach((pair, idx) => {
    entries.push({ id: `wa_${resolvedContactId || dealId}_${idx}`, kind: 'whatsapp', meta: {}, ...pair });
  });

  (stageHistory || []).forEach(h => {
    entries.push({
      id: `stage_${h.id}`,
      kind: 'stage',
      occurredAt: h.createdAt,
      input: null,
      output: { text: h.stage?.name ? `Avançou para ${h.stage.name}` : 'Mudou de etapa', by: 'lead' },
      meta: { stageId: h.stage?.id, stageName: h.stage?.name, stageColor: h.stage?.color },
    });
  });

  entries.sort((a, b) => new Date(a.occurredAt || 0) - new Date(b.occurredAt || 0));

  return { lead, entries };
}
