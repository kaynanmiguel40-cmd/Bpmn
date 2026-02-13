import { createCRUDService } from './serviceFactory';
import { supabase } from './supabase';

// ==================== TRANSFORMADOR ====================

function dbToComment(row) {
  if (!row) return null;
  return {
    id: row.id,
    orderId: row.order_id,
    userName: row.user_name || 'Anonimo',
    content: row.content || '',
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
    content: 'content',
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

export async function addComment({ orderId, userName, content }) {
  return commentService.create({ orderId, userName, content });
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
