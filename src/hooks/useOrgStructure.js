import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getOrgSectors,
  createOrgSector,
  updateOrgSector,
  deleteOrgSector,
  updateMemberOrgAssignment,
  getOrgSectorMemberships,
  setMemberSecondarySectors,
  getSectorManagers,
  setSectorManagers,
} from '../lib/orgStructureService';
import { queryKeys } from './queries';

export const orgQueryKeys = {
  sectors: ['orgSectors'],
  sectorMemberships: ['orgSectorMemberships'],
  sectorManagers: ['orgSectorManagers'],
};

export function useOrgSectors() {
  return useQuery({
    queryKey: orgQueryKeys.sectors,
    queryFn: getOrgSectors,
    staleTime: 60_000,
  });
}

export function useCreateOrgSector() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: createOrgSector,
    onSuccess: () => qc.invalidateQueries({ queryKey: orgQueryKeys.sectors }),
  });
}

export function useUpdateOrgSector() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, updates }) => updateOrgSector(id, updates),
    onSuccess: () => qc.invalidateQueries({ queryKey: orgQueryKeys.sectors }),
  });
}

export function useDeleteOrgSector() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: deleteOrgSector,
    onSuccess: () => qc.invalidateQueries({ queryKey: orgQueryKeys.sectors }),
  });
}

/**
 * patch: { orgSectorId?, managerId? }. allMembers vem do hook useTeamMembers
 * pra detectar ciclo no client antes de enviar.
 */
export function useUpdateMemberOrgAssignment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ memberId, patch, allMembers }) =>
      updateMemberOrgAssignment(memberId, patch, allMembers),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.teamMembers }),
  });
}

export function useOrgSectorMemberships() {
  return useQuery({
    queryKey: orgQueryKeys.sectorMemberships,
    queryFn: getOrgSectorMemberships,
    staleTime: 60_000,
  });
}

export function useSetMemberSecondarySectors() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ memberId, sectorIds }) => setMemberSecondarySectors(memberId, sectorIds),
    onSuccess: () => qc.invalidateQueries({ queryKey: orgQueryKeys.sectorMemberships }),
  });
}

export function useSectorManagers() {
  return useQuery({
    queryKey: orgQueryKeys.sectorManagers,
    queryFn: getSectorManagers,
    staleTime: 60_000,
  });
}

export function useSetSectorManagers() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ sectorId, memberIds }) => setSectorManagers(sectorId, memberIds),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: orgQueryKeys.sectorManagers });
      qc.invalidateQueries({ queryKey: orgQueryKeys.sectors }); // manager_id backward compat
    },
  });
}
