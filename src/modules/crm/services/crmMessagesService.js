/**
 * crmMessagesService - Inbox WhatsApp do CRM (crm_messages).
 *
 * Mensagens enviadas/recebidas via Evolution API. Cada mensagem pertence
 * a uma instance e vincula a um contato OU prospect (constraint do banco).
 * deal_id eh opcional (contexto de negociacao).
 *
 * Envio: chama Edge Function `evolution-send` (NAO insere direto;
 * a function que faz insert + chamada externa + update de status).
 * Recebimento: vem via webhook -> Edge Function `evolution-webhook`.
 * UI observa via Supabase Realtime (useCrmRealtime).
 */

import { supabase } from '../../../lib/supabase';
import { toast } from '../../../contexts/ToastContext';
import { escapeOrIlike } from '../lib/searchFilters';

// ==================== TRANSFORMADOR ====================

export function dbToCrmMessage(row) {
  if (!row) return null;
  return {
    id: row.id,
    instanceId: row.instance_id,
    contactId: row.contact_id || null,
    prospectId: row.prospect_id || null,
    dealId: row.deal_id || null,
    direction: row.direction,
    fromPhone: row.from_phone || '',
    toPhone: row.to_phone || '',
    content: row.content || '',
    mediaUrl: row.media_url || null,
    mediaType: row.media_type || null,
    mediaMime: row.media_mime || null,
    mediaFilename: row.media_filename || null,
    mediaCaption: row.media_caption || null,
    evolutionMessageId: row.evolution_message_id || null,
    status: row.status,
    errorMessage: row.error_message || null,
    sentAt: row.sent_at,
    deliveredAt: row.delivered_at || null,
    readAt: row.read_at || null,
    isSpam: !!row.is_spam,
    isStarred: !!row.is_starred,
    source: row.source || 'manual',
    automationId: row.automation_id || null,
    createdBy: row.created_by || null,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

// ==================== LISTAGEM ====================

/**
 * Mensagens de uma conversa (contato ou prospect), pra UI do chat.
 * Ordem ASC (mais antigas primeiro, scroll natural do chat).
 */
export async function getConversationMessages({ contactId, prospectId, limit = 100 }) {
  if (!contactId && !prospectId) return [];

  // Pega as N mensagens MAIS RECENTES (desc + limit), depois reverte para ASC
  // (mais antigas primeiro) pro scroll natural do chat. Com asc + limit o banco
  // devolvia as N mais ANTIGAS e descartava as recentes — inclusive a ultima
  // mensagem que o vendedor ia responder.
  let query = supabase
    .from('crm_messages')
    .select('*')
    .is('deleted_at', null)
    .order('sent_at', { ascending: false })
    .limit(limit);

  if (contactId)  query = query.eq('contact_id', contactId);
  if (prospectId) query = query.eq('prospect_id', prospectId);

  const { data, error } = await query;
  if (error) {
    toast(`Erro ao carregar conversa: ${error.message}`, 'error');
    return [];
  }
  return (data || []).map(dbToCrmMessage).reverse();
}

// Select + joins compartilhados pelas duas rotas de busca abaixo (default e search).
const INBOX_MESSAGE_SELECT = `
  *,
  crm_contacts(id, name, phone, avatar_color, avatar_url, created_by),
  crm_prospects(id, contact_name, company_name, phone, avatar_url, assigned_to),
  crm_whatsapp_instances(phone_number, instance_name)
`;

/**
 * Agrupa mensagens (ordenadas DESC por sent_at) por conversa (contato/prospect),
 * mantendo a 1a ocorrencia de cada chave (= mensagem mais recente) e somando
 * unread nas ocorrencias seguintes. Compartilhado pelas 2 rotas de listagem.
 */
function groupMessagesIntoConversations(msgs, limit) {
  const seen = new Map();
  for (const m of (msgs || [])) {
    const key = m.contact_id ? `c:${m.contact_id}` : `p:${m.prospect_id}`;
    if (seen.has(key)) {
      // ja tem essa conversa; so incrementa unread se inbound nao lido
      if (m.direction === 'inbound' && m.status !== 'read') {
        const prev = seen.get(key);
        prev.unreadCount += 1;
      }
      continue;
    }
    const contact  = m.crm_contacts || null;
    const prospect = m.crm_prospects || null;
    const otherName =
      contact?.name ||
      prospect?.contact_name ||
      prospect?.company_name ||
      (m.direction === 'inbound' ? m.from_phone : m.to_phone);
    const otherPhone =
      contact?.phone || prospect?.phone ||
      (m.direction === 'inbound' ? m.from_phone : m.to_phone);

    seen.set(key, {
      key,
      contactId:     m.contact_id || null,
      prospectId:    m.prospect_id || null,
      instanceId:    m.instance_id || null,  // de qual numero veio a ultima msg (roteia a resposta)
      instancePhone: m.crm_whatsapp_instances?.phone_number || null,  // telefone do numero (filtro por numero)
      instanceName:  m.crm_whatsapp_instances?.instance_name || null,
      avatarColor:  contact?.avatar_color || null,
      avatarUrl:    contact?.avatar_url || prospect?.avatar_url || null,
      otherName,
      otherPhone,
      // Dono da conversa: contato usa quem criou (created_by = auth user id);
      // prospect usa o responsavel atribuido (assigned_to = team_member.id).
      // Sao 2 espacos de id diferentes — resolvidos na UI contra a lista de membros.
      ownerAuthUserId: contact?.created_by || null,
      ownerMemberId:   prospect?.assigned_to || null,
      lastMessage:  m.content || (m.media_type ? `[${m.media_type}]` : ''),
      lastDirection: m.direction,
      lastAt:       m.sent_at,
      lastStatus:   m.status,
      unreadCount:  (m.direction === 'inbound' && m.status !== 'read') ? 1 : 0,
    });
    if (limit && seen.size >= limit) break;
  }
  return Array.from(seen.values());
}

/**
 * Busca conversas cujo contato/prospect bate com `term` (nome ou telefone),
 * direto no crm_contacts/crm_prospects — nao depende da janela recente de
 * mensagens. Sem isso, um lead que mandou mensagem ha muito tempo (fora das
 * ultimas ~N mensagens do sistema) sumia da busca, indistinguivel de nunca
 * ter existido.
 */
async function searchInboxConversations(term, limit) {
  const q = escapeOrIlike(term);

  const [{ data: contacts, error: contactsErr }, { data: prospects, error: prospectsErr }] = await Promise.all([
    supabase
      .from('crm_contacts')
      .select('id')
      .is('deleted_at', null)
      .or(`name.ilike.%${q}%,phone.ilike.%${q}%`)
      .limit(200),
    supabase
      .from('crm_prospects')
      .select('id')
      .is('deleted_at', null)
      .or(`contact_name.ilike.%${q}%,company_name.ilike.%${q}%,phone.ilike.%${q}%`)
      .limit(200),
  ]);

  if (contactsErr || prospectsErr) {
    toast(`Erro ao buscar conversas: ${(contactsErr || prospectsErr).message}`, 'error');
    return [];
  }

  const contactIds  = (contacts || []).map((c) => c.id);
  const prospectIds = (prospects || []).map((p) => p.id);
  if (contactIds.length === 0 && prospectIds.length === 0) return [];

  const orParts = [];
  if (contactIds.length)  orParts.push(`contact_id.in.(${contactIds.join(',')})`);
  if (prospectIds.length) orParts.push(`prospect_id.in.(${prospectIds.join(',')})`);

  // Mensagens JA restritas aos contatos/prospects encontrados — sem precisar
  // do "limit * 5" do caminho default (aquele hack compensava agrupar sobre
  // TODAS as mensagens do sistema; aqui o escopo ja e so quem deu match).
  const { data: msgs, error } = await supabase
    .from('crm_messages')
    .select(INBOX_MESSAGE_SELECT)
    .is('deleted_at', null)
    .or(orParts.join(','))
    .order('sent_at', { ascending: false })
    .limit(2000);

  if (error) {
    toast(`Erro ao buscar conversas: ${error.message}`, 'error');
    return [];
  }

  return groupMessagesIntoConversations(msgs, limit);
}

/**
 * Lista de conversas pro Inbox (ultima mensagem agrupada por contato/prospect).
 * NOTA: implementacao client-side; pra escala, criar RPC `crm_inbox_conversations`.
 *
 * @param {object}  [opts]
 * @param {number}  [opts.limit=100]
 * @param {string}  [opts.search] - quando preenchido, busca direto no
 *   contato/prospect em vez de so olhar a janela recente de mensagens.
 *
 * Retorna: [{ contactId|prospectId, otherName, otherPhone, lastMessage, unreadCount, lastAt }]
 */
export async function getInboxConversations({ limit = 100, search = '' } = {}) {
  const term = (search || '').trim();
  if (term) return searchInboxConversations(term, limit);

  // Busca ultimas N mensagens com join basico em contact/prospect
  const { data: msgs, error } = await supabase
    .from('crm_messages')
    .select(INBOX_MESSAGE_SELECT)
    .is('deleted_at', null)
    .order('sent_at', { ascending: false })
    .limit(limit * 5); // pega mais pra agrupar

  if (error) {
    toast(`Erro ao carregar inbox: ${error.message}`, 'error');
    return [];
  }

  return groupMessagesIntoConversations(msgs, limit);
}

// ==================== ENVIO (Edge Function) ====================

/**
 * Normaliza telefone BR pro formato que a `evolution-send` espera: digitos com
 * DDI 55. La, numero sem '55' (ou com mais de 13 digitos) e tratado como LID e
 * endereçado pra `<numero>@lid` — que nao e o do lead. Contato gravado em
 * formato nacional ("(35) 99228-5099") cai nisso se enviado cru.
 */
export function toBrazilE164(raw) {
  const s = String(raw || '').trim();
  if (!s) return '';
  // jid/lid ja pronto (ex: '211398994968714@lid') vai intacto.
  if (s.includes('@')) return s;

  const digits = s.replace(/\D/g, '');
  // DDI 55 + DDD (2) + 8 ou 9 digitos: ja esta em E.164.
  if (digits.length >= 12 && digits.length <= 13 && digits.startsWith('55')) return digits;
  // Nacional: DDD (2) + 8 ou 9 digitos. O '55' inicial aqui e o DDD do RS,
  // nao o DDI — por isso o teste acima exige length >= 12.
  if (digits.length === 10 || digits.length === 11) return `55${digits}`;
  // Nao reconhecido (LID opaco, numero de outro pais): repassa os digitos e
  // deixa a edge function decidir o endereçamento.
  return digits;
}

/**
 * Envia mensagem via Evolution API (Edge Function).
 *
 * @param {object} payload
 * @param {string} payload.instanceName - nome da instancia (default: VITE_EVOLUTION_INSTANCE_DEFAULT)
 * @param {string} payload.phone        - destinatario; aceita formato nacional
 *   ("(35) 99228-5099") ou E.164 sem '+' — normalizado pra DDI 55 no envio.
 * @param {string} [payload.content]    - texto (obrigatorio se sem media)
 * @param {string} [payload.mediaUrl]   - url publica
 * @param {string} [payload.mediaType]  - 'image'|'audio'|'video'|'document'
 * @param {string} [payload.mediaCaption]
 * @param {string} [payload.contactId]
 * @param {string} [payload.prospectId]
 * @param {string} [payload.dealId]
 * @param {string} [payload.automationId]
 * @param {string} [payload.source='manual']
 */
export async function sendCrmMessage(payload) {
  const instanceName = payload.instanceName
    || import.meta.env.VITE_EVOLUTION_INSTANCE_DEFAULT
    || 'fyness-principal';

  const phone = toBrazilE164(payload.phone);
  if (!phone) {
    toast('Telefone destino e obrigatorio', 'error');
    return { ok: false, error: 'phone obrigatorio' };
  }
  if (!payload.content && !payload.mediaUrl) {
    toast('Conteudo ou midia obrigatorio', 'error');
    return { ok: false, error: 'content ou mediaUrl obrigatorio' };
  }
  if (!payload.contactId && !payload.prospectId) {
    toast('Vincular a contato ou prospect', 'error');
    return { ok: false, error: 'contactId ou prospectId obrigatorio' };
  }

  // Pega o user atual pra registrar createdBy
  const { data: { user } } = await supabase.auth.getUser();

  const { data, error } = await supabase.functions.invoke('evolution-send', {
    body: {
      instanceName,
      phone,
      content:      payload.content,
      mediaUrl:     payload.mediaUrl,
      mediaType:    payload.mediaType,
      mediaCaption: payload.mediaCaption,
      contactId:    payload.contactId,
      prospectId:   payload.prospectId,
      dealId:       payload.dealId,
      automationId: payload.automationId,
      source:       payload.source || 'manual',
      createdBy:    user?.id || null,
    },
  });

  if (error || data?.ok === false) {
    const msg = data?.error || error?.message || 'Falha desconhecida';
    toast(`Falha ao enviar: ${msg}`, 'error');
    return { ok: false, error: msg, messageId: data?.messageId };
  }

  return { ok: true, messageId: data?.messageId, evolutionMessageId: data?.evolutionMessageId };
}

// ==================== READ / STARRED / SPAM ====================

/**
 * Marca mensagens inbound como lidas (UI manual).
 */
export async function markCrmMessagesAsRead(messageIds = []) {
  if (!Array.isArray(messageIds) || messageIds.length === 0) return { ok: true };
  const { error } = await supabase
    .from('crm_messages')
    .update({ status: 'read', read_at: new Date().toISOString() })
    .in('id', messageIds)
    .eq('direction', 'inbound');
  if (error) {
    toast(`Erro ao marcar como lida: ${error.message}`, 'error');
    return { ok: false };
  }
  return { ok: true };
}

