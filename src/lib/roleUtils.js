export const MANAGER_ROLES = ['gestor', 'admin', 'gerente', 'manager', 'diretor', 'supervisor', 'coordenador'];

export function detectRole(profile) {
  if (!profile || !profile.role) return 'collaborator';
  // Match por PALAVRA INTEIRA (nao substring): "Gerente de Vendas" -> manager,
  // mas "administrativo"/"assistente administrativo" NAO casa 'admin'.
  // O `includes` antigo causava escalonamento de privilegio: qualquer cargo
  // contendo admin/supervisor/coordenador/diretor como substring virava admin.
  const words = profile.role.toLowerCase().trim().split(/[^a-zà-ú]+/i).filter(Boolean);
  return words.some(w => MANAGER_ROLES.includes(w)) ? 'manager' : 'collaborator';
}

export function isManagerRole(profile) {
  return detectRole(profile) === 'manager';
}
