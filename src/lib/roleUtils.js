export const MANAGER_ROLES = ['gestor', 'admin', 'gerente', 'manager', 'diretor', 'supervisor', 'coordenador'];

export function detectRole(profile) {
  if (!profile || !profile.role) return 'collaborator';
  const r = profile.role.toLowerCase().trim();
  return MANAGER_ROLES.some(m => r.includes(m)) ? 'manager' : 'collaborator';
}

export function isManagerRole(profile) {
  return detectRole(profile) === 'manager';
}
