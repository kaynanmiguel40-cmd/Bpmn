import { supabase } from './supabaseClient';
import { toast } from '../contexts/ToastContext';

export interface OrgSector {
  id: string;
  name: string;
  color: string;
  managerId: string | null;
  position: number;
  createdAt: string;
  updatedAt: string;
}

export interface OrgSectorRow {
  id: string;
  name: string;
  color: string | null;
  manager_id: string | null;
  position: number | null;
  created_at: string;
  updated_at: string;
}

export interface OrgMemberPatch {
  orgSectorId?: string | null;
  managerId?: string | null;
}

export interface MemberLike {
  id: string;
  managerId?: string | null;
}

function dbToOrgSector(row: OrgSectorRow): OrgSector {
  return {
    id: row.id,
    name: row.name,
    color: row.color || '#3b82f6',
    managerId: row.manager_id,
    position: row.position ?? 0,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export async function getOrgSectors(): Promise<OrgSector[]> {
  const { data, error } = await supabase
    .from('org_sectors')
    .select('*')
    .order('position', { ascending: true });

  if (error) {
    toast(`Erro ao carregar setores: ${error.message}`, 'error');
    return [];
  }
  return ((data as OrgSectorRow[]) || []).map(dbToOrgSector);
}

export async function createOrgSector(payload: { name: string; color?: string; managerId?: string | null }): Promise<OrgSector | null> {
  const id = `org_${crypto.randomUUID().slice(0, 8)}`;
  const { data: maxRow } = await supabase
    .from('org_sectors')
    .select('position')
    .order('position', { ascending: false })
    .limit(1)
    .maybeSingle();
  const nextPosition = ((maxRow as { position?: number } | null)?.position ?? 0) + 1;

  const { data, error } = await supabase
    .from('org_sectors')
    .insert([{
      id,
      name: payload.name,
      color: payload.color || '#3b82f6',
      manager_id: payload.managerId ?? null,
      position: nextPosition,
    }])
    .select()
    .single();

  if (error) {
    toast(`Erro ao criar setor: ${error.message}`, 'error');
    return null;
  }
  return dbToOrgSector(data as OrgSectorRow);
}

export async function updateOrgSector(
  id: string,
  updates: { name?: string; color?: string; managerId?: string | null; position?: number },
): Promise<OrgSector | null> {
  const payload: Record<string, unknown> = { updated_at: new Date().toISOString() };
  if (updates.name !== undefined) payload.name = updates.name;
  if (updates.color !== undefined) payload.color = updates.color;
  if (updates.managerId !== undefined) payload.manager_id = updates.managerId;
  if (updates.position !== undefined) payload.position = updates.position;

  const { data, error } = await supabase
    .from('org_sectors')
    .update(payload)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    toast(`Erro ao atualizar setor: ${error.message}`, 'error');
    return null;
  }
  return dbToOrgSector(data as OrgSectorRow);
}

export interface SectorMembership {
  sectorId: string;
  memberId: string;
}

export interface SectorManagement {
  sectorId: string;
  memberId: string;
  position: number;
}

/** Lista todos os vinculos de gestores (1 setor pode ter N gestores). */
export async function getSectorManagers(): Promise<SectorManagement[]> {
  const { data, error } = await supabase
    .from('org_sector_managers')
    .select('sector_id, member_id, position')
    .order('position', { ascending: true });
  if (error) {
    console.warn('[org_sector_managers] erro:', error.message);
    return [];
  }
  return ((data as Array<{ sector_id: string; member_id: string; position: number | null }>) || []).map(r => ({
    sectorId: r.sector_id,
    memberId: r.member_id,
    position: r.position ?? 0,
  }));
}

/**
 * Substitui os gestores de um setor pela lista informada (faz diff).
 * Atualiza tambem org_sectors.manager_id pro primeiro da lista, mantendo
 * backward compat com qualquer codigo que ainda le manager_id.
 */
export async function setSectorManagers(
  sectorId: string,
  memberIds: string[],
): Promise<boolean> {
  const { data: current, error: readErr } = await supabase
    .from('org_sector_managers')
    .select('member_id')
    .eq('sector_id', sectorId);
  if (readErr) {
    toast(`Erro ao ler gestores: ${readErr.message}`, 'error');
    return false;
  }

  const currentIds = new Set(((current as Array<{ member_id: string }>) || []).map(r => r.member_id));
  const targetIds = new Set(memberIds);
  const toAdd = memberIds.filter(id => !currentIds.has(id));
  const toRemove = [...currentIds].filter(id => !targetIds.has(id));

  if (toRemove.length > 0) {
    const { error } = await supabase
      .from('org_sector_managers')
      .delete()
      .eq('sector_id', sectorId)
      .in('member_id', toRemove);
    if (error) {
      toast(`Erro ao remover gestores: ${error.message}`, 'error');
      return false;
    }
  }

  if (toAdd.length > 0) {
    const { error } = await supabase
      .from('org_sector_managers')
      .insert(toAdd.map((id, idx) => ({ sector_id: sectorId, member_id: id, position: idx })));
    if (error) {
      toast(`Erro ao adicionar gestores: ${error.message}`, 'error');
      return false;
    }
  }

  // Atualiza positions de todos (caso a ordem da lista tenha mudado)
  for (let i = 0; i < memberIds.length; i++) {
    await supabase
      .from('org_sector_managers')
      .update({ position: i })
      .eq('sector_id', sectorId)
      .eq('member_id', memberIds[i]);
  }

  // Backward compat: sincroniza manager_id com o primeiro gestor (ou NULL se vazio)
  await supabase
    .from('org_sectors')
    .update({ manager_id: memberIds[0] || null, updated_at: new Date().toISOString() })
    .eq('id', sectorId);

  return true;
}

/** Lista todos os vinculos secundarios (member em setores adicionais). */
export async function getOrgSectorMemberships(): Promise<SectorMembership[]> {
  const { data, error } = await supabase
    .from('org_sector_members')
    .select('sector_id, member_id');
  if (error) {
    console.warn('[org_sector_members] erro:', error.message);
    return [];
  }
  return ((data as Array<{ sector_id: string; member_id: string }>) || []).map(r => ({
    sectorId: r.sector_id,
    memberId: r.member_id,
  }));
}

/**
 * Substitui os setores secundarios de um membro pela lista informada.
 * Faz diff: insere os novos, remove os ausentes.
 */
export async function setMemberSecondarySectors(
  memberId: string,
  sectorIds: string[],
): Promise<boolean> {
  // Le atuais
  const { data: current, error: readErr } = await supabase
    .from('org_sector_members')
    .select('sector_id')
    .eq('member_id', memberId);

  if (readErr) {
    toast(`Erro ao ler setores: ${readErr.message}`, 'error');
    return false;
  }

  const currentIds = new Set(((current as Array<{ sector_id: string }>) || []).map(r => r.sector_id));
  const targetIds = new Set(sectorIds);
  const toAdd = sectorIds.filter(id => !currentIds.has(id));
  const toRemove = [...currentIds].filter(id => !targetIds.has(id));

  if (toRemove.length > 0) {
    const { error } = await supabase
      .from('org_sector_members')
      .delete()
      .eq('member_id', memberId)
      .in('sector_id', toRemove);
    if (error) {
      toast(`Erro ao remover setores: ${error.message}`, 'error');
      return false;
    }
  }

  if (toAdd.length > 0) {
    const { error } = await supabase
      .from('org_sector_members')
      .insert(toAdd.map(sectorId => ({ sector_id: sectorId, member_id: memberId })));
    if (error) {
      toast(`Erro ao adicionar setores: ${error.message}`, 'error');
      return false;
    }
  }

  return true;
}

export async function deleteOrgSector(id: string): Promise<boolean> {
  const { error } = await supabase.from('org_sectors').delete().eq('id', id);
  if (error) {
    toast(`Erro ao remover setor: ${error.message}`, 'error');
    return false;
  }
  return true;
}

/**
 * Atualiza setor/chefe direto de um membro. Detecta ciclo antes de gravar:
 * se o novo managerId tiver `memberId` em algum ponto da cadeia ascendente,
 * a operacao e abortada.
 */
export async function updateMemberOrgAssignment(
  memberId: string,
  patch: OrgMemberPatch,
  allMembers: MemberLike[],
): Promise<boolean> {
  if (patch.managerId && patch.managerId === memberId) {
    toast('Um membro nao pode ser chefe de si mesmo.', 'error');
    return false;
  }

  if (patch.managerId && wouldCreateCycle(memberId, patch.managerId, allMembers)) {
    toast('Hierarquia invalida: isso criaria um ciclo.', 'error');
    return false;
  }

  const payload: Record<string, unknown> = { updated_at: new Date().toISOString() };
  if (patch.orgSectorId !== undefined) payload.org_sector_id = patch.orgSectorId;
  if (patch.managerId !== undefined) payload.manager_id = patch.managerId;

  const { error } = await supabase
    .from('team_members')
    .update(payload)
    .eq('id', memberId);

  if (error) {
    toast(`Erro ao atualizar membro: ${error.message}`, 'error');
    return false;
  }
  return true;
}

/**
 * Retorna true se setar managerId como chefe de memberId criaria ciclo
 * (managerId ja eh subordinado transitivo de memberId).
 */
export function wouldCreateCycle(
  memberId: string,
  newManagerId: string,
  allMembers: MemberLike[],
): boolean {
  const byId = new Map(allMembers.map(m => [m.id, m]));
  let cursor: string | null = newManagerId;
  const visited = new Set<string>();
  while (cursor) {
    if (cursor === memberId) return true;
    if (visited.has(cursor)) return true;
    visited.add(cursor);
    const node = byId.get(cursor);
    cursor = node?.managerId ?? null;
  }
  return false;
}
