import { createCRUDService } from './serviceFactory';
import { supabase } from './supabase';

// ==================== TRANSFORMADOR ====================

function dbToComment(row) {
  if (!row) return null;
  return {
    id: row.id,
    orderId: row.order_id,
    userName: row.user_name || 'Anonimo',
    userId: row.user_id || null,
    content: row.content || '',
    attachments: row.attachments || [],
    mentions: row.mentions || [],
    createdAt: row.created_at,
  };
}

// ==================== SERVICE (via factory) ====================

const commentService = createCRUDService({
  table: 'os_comments',
  localKey: 'os_comments',
  idPrefix: 'cmt',
  transform: dbToComment,
  fieldMap: {
    orderId: 'order_id',
    userName: 'user_name',
    userId: 'user_id',
    content: 'content',
    attachments: 'attachments',
    mentions: 'mentions',
  },
  orderBy: 'created_at',
  orderAsc: true,
});

// ==================== EXPORTS ====================

export const deleteComment = commentService.remove;

export async function getCommentsByOrder(orderId) {
  const { data, error } = await supabase
    .from('os_comments')
    .select('*')
    .eq('order_id', orderId)
    .order('created_at', { ascending: true });

  if (error) {
    const local = JSON.parse(localStorage.getItem('os_comments') || '[]');
    return local.filter(c => c.order_id === orderId).map(dbToComment);
  }
  return (data || []).map(dbToComment);
}

export async function addComment({ orderId, userName, userId, content, attachments, mentions }) {
  return commentService.create({
    orderId,
    userName,
    userId: userId || null,
    content: content || '',
    attachments: attachments || [],
    mentions: mentions || [],
  });
}

/** Busca resumo dos chats: contagem + ultima mensagem por OS */
export async function getChatSummaries() {
  const { data, error } = await supabase
    .from('os_comments')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    const local = JSON.parse(localStorage.getItem('os_comments') || '[]');
    return buildSummaries(local.map(dbToComment));
  }
  return buildSummaries((data || []).map(dbToComment));
}

function buildSummaries(comments) {
  const map = {};
  for (const c of comments) {
    if (!map[c.orderId]) {
      map[c.orderId] = { orderId: c.orderId, count: 0, lastMessage: c, participants: [] };
    }
    map[c.orderId].count++;
    // Track unique participants (last 2 unique senders)
    const existing = map[c.orderId].participants;
    if (!existing.find(p => p.userName === c.userName)) {
      existing.push({ userName: c.userName, userId: c.userId });
    }
  }
  // Keep only last 3 unique participants per OS
  for (const key of Object.keys(map)) {
    map[key].participants = map[key].participants.slice(-3);
  }
  return map;
}

export async function getCommentCounts(orderIds) {
  if (!orderIds || orderIds.length === 0) return {};

  const { data, error } = await supabase
    .from('os_comments')
    .select('order_id')
    .in('order_id', orderIds);

  if (error) {
    const local = JSON.parse(localStorage.getItem('os_comments') || '[]');
    const counts = {};
    local.forEach(c => {
      if (orderIds.includes(c.order_id)) {
        counts[c.order_id] = (counts[c.order_id] || 0) + 1;
      }
    });
    return counts;
  }

  const counts = {};
  (data || []).forEach(c => {
    counts[c.order_id] = (counts[c.order_id] || 0) + 1;
  });
  return counts;
}

// ==================== READ TRACKING (localStorage) ====================

function getReadMapKey(userId) {
  return `chat_read_${userId || 'anon'}`;
}

export function getReadMap(userId) {
  try {
    return JSON.parse(localStorage.getItem(getReadMapKey(userId)) || '{}');
  } catch { return {}; }
}

export function markChatAsRead(orderId, userId, totalCount) {
  const map = getReadMap(userId);
  map[orderId] = totalCount;
  localStorage.setItem(getReadMapKey(userId), JSON.stringify(map));
}

export function getUnreadCount(orderId, userId, totalCount) {
  const map = getReadMap(userId);
  // Never visited → no unread (only track after first visit)
  if (!(orderId in map)) return 0;
  return Math.max(0, totalCount - map[orderId]);
}

// ==================== READ RECEIPTS (Supabase - WhatsApp style) ====================

/** Marca a conversa como lida pelo usuario (upsert no banco) */
export async function markConversationRead(orderId, userId, userName) {
  if (!orderId || !userId) return;
  const { error } = await supabase
    .from('os_comment_reads')
    .upsert(
      { order_id: orderId, user_id: userId, user_name: userName || '', last_read_at: new Date().toISOString() },
      { onConflict: 'order_id,user_id' }
    );
  if (error) console.warn('markConversationRead error:', error.message);
}

/** Busca todos os read receipts de uma conversa */
export async function getConversationReads(orderId) {
  if (!orderId) return [];
  const { data, error } = await supabase
    .from('os_comment_reads')
    .select('user_id, user_name, last_read_at')
    .eq('order_id', orderId);

  if (error) {
    console.warn('getConversationReads error:', error.message);
    return [];
  }
  return (data || []).map(r => ({
    userId: r.user_id,
    userName: r.user_name,
    lastReadAt: r.last_read_at,
  }));
}
