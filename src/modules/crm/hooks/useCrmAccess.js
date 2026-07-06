/**
 * useCrmAccess — acesso do USUÁRIO ATUAL ao CRM.
 *
 * Retorna se ele é admin e o que ele pode ver. Admin vê tudo; não-admin vê tudo
 * menos as seções bloqueadas no próprio team_member (crmBlockedSections).
 */

import { useMemo } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import { useTeamMembers } from '../../../hooks/queries';
import { isCrmAdmin, normalizeBlocked, GATED_KEYS } from '../lib/crmAccess';

export function useCrmAccess() {
  const { user, profile } = useAuth();
  const { data: members = [] } = useTeamMembers();

  return useMemo(() => {
    const admin = isCrmAdmin(user, profile);
    const myMember = user?.id ? members.find(m => m.authUserId && m.authUserId === user.id) : null;
    const blocked = admin ? [] : normalizeBlocked(myMember?.crmBlockedSections);
    const blockedSet = new Set(blocked);

    const canAccess = (key) => admin || !GATED_KEYS.has(key) || !blockedSet.has(key);

    return { isAdmin: admin, myMember, blocked, canAccess };
  }, [user, profile, members]);
}

export default useCrmAccess;
