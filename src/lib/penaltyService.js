import { createCRUDService } from './serviceFactory';
import { supabase } from './supabaseClient';

const PENALTY_EXPIRY_DAYS = 30;

function dbToPenalty(row) {
  if (!row) return null;
  return {
    id: row.id,
    memberId: row.member_id,
    appliedByName: row.applied_by_name || '',
    appliedByUserId: row.applied_by_user_id || null,
    reason: row.reason || '',
    createdAt: row.created_at,
  };
}

const penaltyService = createCRUDService({
  table: 'team_penalties',
  localKey: 'team_penalties',
  idPrefix: 'penalty',
  transform: dbToPenalty,
  fieldMap: {
    memberId: 'member_id',
    appliedByName: 'applied_by_name',
    appliedByUserId: 'applied_by_user_id',
    reason: 'reason',
  },
});

const _getRaw = penaltyService.getAll;
export const deletePenalty = penaltyService.remove;

/**
 * Busca todas as punicoes e calcula expiracao com base no ultimo cartao por membro.
 * Regra: todos os cartoes de um membro expiram 30 dias apos o ULTIMO cartao recebido.
 * Se o membro toma um novo cartao, o timer reseta pra todos.
 */
export async function getPenalties() {
  const raw = await _getRaw();

  // Agrupar por membro para achar a data do ultimo cartao
  const latestByMember = {};
  for (const p of raw) {
    const prev = latestByMember[p.memberId];
    if (!prev || new Date(p.createdAt) > new Date(prev)) {
      latestByMember[p.memberId] = p.createdAt;
    }
  }

  const now = new Date();
  return raw.map(p => {
    const latestDate = latestByMember[p.memberId];
    const expiresAt = new Date(new Date(latestDate).getTime() + PENALTY_EXPIRY_DAYS * 86400000);
    return {
      ...p,
      expiresAt: expiresAt.toISOString(),
      expired: now >= expiresAt,
    };
  });
}

export async function createPenalty({ memberId, appliedByName, appliedByUserId, reason }) {
  return penaltyService.create({
    memberId,
    appliedByName,
    appliedByUserId: appliedByUserId || null,
    reason,
  });
}

export { PENALTY_EXPIRY_DAYS };
