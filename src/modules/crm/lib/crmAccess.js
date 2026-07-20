/**
 * crmAccess.js — quem é ADMIN e quais SEÇÕES do CRM dá pra restringir por membro.
 *
 * Admin: dono (e-mail fixo) OU cargo de gestão (detectRole). Admin vê tudo e é
 * quem edita o acesso dos outros. Não-admin vê tudo por padrão; o admin bloqueia
 * seções específicas (lista `crmBlockedSections` no team_member).
 */

import { detectRole, OWNER_EMAILS, isOwnerEmail } from '../../../lib/roleUtils';

// Re-export pra quem já importa OWNER_EMAILS daqui (ex: CrmSettingsPage).
export { OWNER_EMAILS };

export function isCrmAdmin(user, profile) {
  if (isOwnerEmail(user?.email)) return true;
  return detectRole(profile) === 'manager' || profile?.role === 'admin';
}

/**
 * Seções do CRM que o admin pode liberar/bloquear por membro.
 * `key` bate com o 1º segmento da rota (/crm/<key>) — usado no guard e na sidebar.
 * Dashboard (/crm) fica de fora de propósito: é a landing, todo mundo entra nela.
 */
export const CRM_SECTIONS = [
  { key: 'pipeline',    label: 'Pipeline',         group: 'Vendas' },
  { key: 'inbox',       label: 'Inbox WhatsApp',   group: 'Vendas' },
  { key: 'agenda',      label: 'Agenda',           group: 'Vendas' },
  { key: 'prospects',   label: 'Gerador de Lista', group: 'Prospecção' },
  { key: 'automations', label: 'Automações',       group: 'Prospecção' },
  // Traffic nao tem item na sidebar (oculto por enquanto), mas a rota segue
  // ativa — sem essa chave o controle de acesso nao conseguia bloquear/liberar
  // essa secao pra ninguem, ficando implicitamente aberta pra quem soubesse a URL.
  { key: 'traffic',     label: 'Tráfego Pago',     group: 'Prospecção' },
  { key: 'cadastros',   label: 'Cadastros',        group: 'Cadastros' },
  // O Comparativo (previsto x real) e o "Dashboard" do CRM. Como o CRM abre na
  // Pipeline, ele NAO e a landing — segue numa rota propria e bloqueavel.
  { key: 'comparativo', label: 'Dashboard',        group: 'Gestão' },
  // 'goals' (Metas) e 'planejamento' saíram: as seções foram removidas do CRM.
  { key: 'equipe',      label: 'Equipe',           group: 'Gestão' },
  { key: 'settings',    label: 'Configurações',    group: 'Gestão' },
];

// Ordem dos grupos no editor de acesso (espelha a sidebar).
export const CRM_SECTION_GROUPS = ['Vendas', 'Prospecção', 'Cadastros', 'Gestão'];

export const GATED_KEYS = new Set(CRM_SECTIONS.map(s => s.key));

/** Deriva a key da seção a partir do pathname (ex: /crm/comparativo -> 'comparativo'). */
export function sectionKeyFromPath(pathname) {
  const m = /^\/crm\/([^/]+)/.exec(pathname || '');
  return m ? m[1] : null;
}

/** Normaliza a lista de bloqueio (aceita array ou JSON string). */
export function normalizeBlocked(value) {
  if (Array.isArray(value)) return value;
  if (typeof value === 'string') {
    try { const p = JSON.parse(value); return Array.isArray(p) ? p : []; } catch { return []; }
  }
  return [];
}
