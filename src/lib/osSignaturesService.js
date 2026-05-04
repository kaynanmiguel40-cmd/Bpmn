import { supabase } from './supabase';

function dbToSignature(row) {
  if (!row) return null;
  return {
    id: row.id,
    orderId: row.order_id,
    userId: row.user_id || null,
    userName: row.user_name,
    signedAt: row.signed_at,
    deliveredAt: row.delivered_at || null,
  };
}

/** Lista assinaturas de uma O.S. */
export async function getSignaturesByOrder(orderId) {
  const { data, error } = await supabase
    .from('os_signatures')
    .select('*')
    .eq('order_id', orderId)
    .order('signed_at', { ascending: true });

  if (error) {
    console.error('[os_signatures] getSignaturesByOrder:', error.message);
    return [];
  }
  return (data || []).map(dbToSignature);
}

/** Registra assinatura de um participante (1 por usuario por O.S.). */
export async function signOrder({ orderId, userId, userName }) {
  const id = crypto.randomUUID();
  const { data, error } = await supabase
    .from('os_signatures')
    .insert([{
      id,
      order_id: orderId,
      user_id: userId || null,
      user_name: userName,
    }])
    .select()
    .single();

  if (error) {
    // 23505 = unique violation: usuario ja assinou
    if (error.code === '23505') {
      console.warn('[os_signatures] usuario ja assinou esta O.S.');
      return null;
    }
    console.error('[os_signatures] signOrder:', error.message);
    return null;
  }
  return dbToSignature(data);
}

/** Remove assinatura (caso o usuario queira desfazer). */
export async function unsignOrder({ orderId, userId }) {
  const { error } = await supabase
    .from('os_signatures')
    .delete()
    .eq('order_id', orderId)
    .eq('user_id', userId);

  if (error) {
    console.error('[os_signatures] unsignOrder:', error.message);
    return false;
  }
  return true;
}

/**
 * Garante que cada participante tem 1 signature na O.S.
 * Idempotente: a UNIQUE(order_id, user_id) impede duplicatas; participantes
 * que ja assinaram sao ignorados.
 *
 * Regra: "pegar a O.S. = assinar". Chamado quando alguem entra em participants[].
 *
 * @param {string} orderId
 * @param {Array<{id: string|null, name: string}>} participants
 */
export async function ensureSignaturesForParticipants(orderId, participants) {
  if (!orderId || !Array.isArray(participants) || participants.length === 0) return;
  const rows = participants
    .filter(p => p && (p.id || p.name))
    .map(p => ({
      id: crypto.randomUUID(),
      order_id: orderId,
      user_id: p.id || null,
      user_name: p.name || '',
    }));
  if (rows.length === 0) return;
  // upsert pra ignorar duplicatas via UNIQUE(order_id, user_id)
  const { error } = await supabase
    .from('os_signatures')
    .upsert(rows, { onConflict: 'order_id,user_id', ignoreDuplicates: true });
  if (error) {
    console.warn('[os_signatures] ensureSignaturesForParticipants:', error.message);
  }
}

/**
 * Marca o registro do usuario como ENTREGUE (delivered_at = now).
 * Cria a row com signed_at + delivered_at de uma vez se ainda nao existir.
 * Idempotente.
 */
export async function markDelivered({ orderId, userId, userName }) {
  if (!orderId) throw new Error('orderId obrigatorio');
  const now = new Date().toISOString();

  // Tenta atualizar primeiro (caso ja tenha pegado)
  if (userId) {
    const { data: updated } = await supabase
      .from('os_signatures')
      .update({ delivered_at: now })
      .eq('order_id', orderId)
      .eq('user_id', userId)
      .select()
      .maybeSingle();
    if (updated) return dbToSignature(updated);
  }

  // Nao existe row ainda — cria com signed + delivered de uma vez
  const id = crypto.randomUUID();
  const { data, error } = await supabase
    .from('os_signatures')
    .insert([{
      id,
      order_id: orderId,
      user_id: userId || null,
      user_name: userName || '',
      signed_at: now,
      delivered_at: now,
    }])
    .select()
    .single();
  if (error) {
    // 23505 = unique violation (user_id ja existe). Tenta upsert.
    if (error.code === '23505' && userId) {
      const { data: re } = await supabase
        .from('os_signatures')
        .update({ delivered_at: now })
        .eq('order_id', orderId)
        .eq('user_id', userId)
        .select()
        .maybeSingle();
      return re ? dbToSignature(re) : null;
    }
    console.error('[os_signatures] markDelivered:', error.message);
    return null;
  }
  return dbToSignature(data);
}

/**
 * Reverte a entrega do usuario (delivered_at = null), mantendo a assinatura.
 */
export async function unmarkDelivered({ orderId, userId }) {
  if (!orderId || !userId) return false;
  const { error } = await supabase
    .from('os_signatures')
    .update({ delivered_at: null })
    .eq('order_id', orderId)
    .eq('user_id', userId);
  if (error) {
    console.error('[os_signatures] unmarkDelivered:', error.message);
    return false;
  }
  return true;
}

/** Verifica se um usuario especifico ja assinou. */
export async function hasUserSigned({ orderId, userId }) {
  if (!userId) return false;
  const { data, error } = await supabase
    .from('os_signatures')
    .select('id')
    .eq('order_id', orderId)
    .eq('user_id', userId)
    .maybeSingle();

  if (error) return false;
  return !!data;
}
