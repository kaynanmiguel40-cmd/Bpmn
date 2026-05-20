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
import { escapeIlike } from '../lib/searchFilters';

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
 * Lista mensagens (filtros: contactId, prospectId, dealId, search, page).
 * Ordem: sent_at DESC (mais recente primeiro).
 */
export async function getCrmMessages(filters = {}) {
  const {
    contactId, prospectId, dealId, instanceId, search, direction,
    page, perPage = 50, sortOrder = 'desc',
  } = filters;

  let query = supabase
    .from('crm_messages')
    .select('*', { count: 'exact' })
    .is('deleted_at', null);

  if (contactId)  query = query.eq('contact_id', contactId);
  if (prospectId) query = query.eq('prospect_id', prospectId);
  if (dealId)     query = query.eq('deal_id', dealId);
  if (instanceId) query = query.eq('instance_id', instanceId);
  if (direction)  query = query.eq('direction', direction);
  if (search)     query = query.ilike('content', `%${escapeIlike(search)}%`);

  query = query.order('sent_at', { ascending: sortOrder === 'asc' });

  if (page && perPage) {
    const from = (page - 1) * perPage;
    query = query.range(from, from + perPage - 1);
  }

  const { data, error, count } = await query;
  if (error) {
    toast(`Erro ao buscar mensagens: ${error.message}`, 'error');
    return { data: [], count: 0 };
  }
  return { data: (data || []).map(dbToCrmMessage), count: count || 0 };
}

/**
 * Mensagens de uma conversa (contato ou prospect), pra UI do chat.
 * Ordem ASC (mais antigas primeiro, scroll natural do chat).
 */
export async function getConversationMessages({ contactId, prospectId, limit = 100 }) {
  if (!contactId && !prospectId) return [];

  let query = supabase
    .from('crm_messages')
    .select('*')
    .is('deleted_at', null)
    .order('sent_at', { ascending: true })
    .limit(limit);

  if (contactId)  query = query.eq('contact_id', contactId);
  if (prospectId) query = query.eq('prospect_id', prospectId);

  const { data, error } = await query;
  if (error) {
    toast(`Erro ao carregar conversa: ${error.message}`, 'error');
    return [];
  }
  return (data || []).map(dbToCrmMessage);
}

/**
 * Lista de conversas pro Inbox (ultima mensagem agrupada por contato/prospect).
 * NOTA: implementacao client-side; pra escala, criar RPC `crm_inbox_conversations`.
 *
 * Retorna: [{ contactId|prospectId, otherName, otherPhone, lastMessage, unreadCount, lastAt }]
 */
export async function getInboxConversations({ limit = 100 } = {}) {
  // Busca ultimas N mensagens com join basico em contact/prospect
  const { data: msgs, error } = await supabase
    .from('crm_messages')
    .select(`
      *,
      crm_contacts(id, name, phone, avatar_color),
      crm_prospects(id, contact_name, company_name, phone)
    `)
    .is('deleted_at', null)
    .order('sent_at', { ascending: false })
    .limit(limit * 5); // pega mais pra agrupar

  if (error) {
    toast(`Erro ao carregar inbox: ${error.message}`, 'error');
    return [];
  }

  // Agrupa por (contactId || prospectId) e pega a primeira ocorrencia (mais recente)
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
      contactId:    m.contact_id || null,
      prospectId:   m.prospect_id || null,
      avatarColor:  contact?.avatar_color || null,
      otherName,
      otherPhone,
      lastMessage:  m.content || (m.media_type ? `[${m.media_type}]` : ''),
      lastDirection: m.direction,
      lastAt:       m.sent_at,
      lastStatus:   m.status,
      unreadCount:  (m.direction === 'inbound' && m.status !== 'read') ? 1 : 0,
    });
    if (seen.size >= limit) break;
  }
  return Array.from(seen.values());
}

// ==================== ENVIO (Edge Function) ====================

/**
 * Envia mensagem via Evolution API (Edge Function).
 *
 * @param {object} payload
 * @param {string} payload.instanceName - nome da instancia (default: VITE_EVOLUTION_INSTANCE_DEFAULT)
 * @param {string} payload.phone        - destinatario (E.164 sem '+')
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

  if (!payload.phone) {
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
      phone:        payload.phone,
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

export async function toggleCrmMessageStarred(messageId, starred) {
  const { error } = await supabase
    .from('crm_messages')
    .update({ is_starred: !!starred })
    .eq('id', messageId);
  if (error) {
    toast(`Erro: ${error.message}`, 'error');
    return { ok: false };
  }
  return { ok: true };
}

export async function markCrmMessageAsSpam(messageId) {
  const { error } = await supabase
    .from('crm_messages')
    .update({ is_spam: true })
    .eq('id', messageId);
  if (error) {
    toast(`Erro: ${error.message}`, 'error');
    return { ok: false };
  }
  toast('Mensagem marcada como spam', 'success');
  return { ok: true };
}

export async function softDeleteCrmMessage(messageId) {
  const { error } = await supabase
    .from('crm_messages')
    .update({ deleted_at: new Date().toISOString() })
    .eq('id', messageId);
  if (error) {
    toast(`Erro ao excluir: ${error.message}`, 'error');
    return { ok: false };
  }
  return { ok: true };
}
