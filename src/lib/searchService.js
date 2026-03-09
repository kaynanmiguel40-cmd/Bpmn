/**
 * searchService - Busca global categorizada
 *
 * Busca em O.S., eventos, projetos e membros usando localStorage e Supabase.
 */

import { supabase } from './supabase';

export async function searchAll(query) {
  if (!query || query.length < 2) return [];

  const q = query.toLowerCase();
  const results = [];

  // ==================== BUSCA LOCAL ====================

  // O.S.
  try {
    const orders = JSON.parse(localStorage.getItem('os_orders') || '[]');
    orders.forEach(o => {
      if (
        (o.title && o.title.toLowerCase().includes(q)) ||
        (o.client && o.client.toLowerCase().includes(q)) ||
        (o.description && o.description.toLowerCase().includes(q)) ||
        (o.number && String(o.number).includes(q))
      ) {
        results.push({
          type: 'os',
          id: o.id,
          label: `O.S. #${o.number} - ${o.title}`,
          sub: o.client || o.description || '',
          route: '/financial',
          icon: 'OS',
          color: 'bg-fyness-primary',
        });
      }
    });
  } catch {}

  // Eventos
  try {
    const events = JSON.parse(localStorage.getItem('agenda_events') || '[]');
    events.forEach(e => {
      if (
        (e.title && e.title.toLowerCase().includes(q)) ||
        (e.description && e.description.toLowerCase().includes(q))
      ) {
        results.push({
          type: 'event',
          id: e.id,
          label: e.title,
          sub: e.description || '',
          route: '/agenda',
          icon: 'AG',
          color: 'bg-amber-500',
        });
      }
    });
  } catch {}

  // Projetos
  try {
    const projects = JSON.parse(localStorage.getItem('os_projects') || '[]');
    projects.forEach(p => {
      if (p.name && p.name.toLowerCase().includes(q)) {
        results.push({
          type: 'project',
          id: p.id,
          label: p.name,
          sub: p.description || 'Projeto',
          route: '/financial',
          icon: 'PJ',
          color: 'bg-blue-500',
        });
      }
    });
  } catch {}

  // Membros
  try {
    const members = JSON.parse(localStorage.getItem('team_members') || '[]');
    members.forEach(m => {
      if (
        (m.name && m.name.toLowerCase().includes(q)) ||
        (m.role && m.role.toLowerCase().includes(q))
      ) {
        results.push({
          type: 'member',
          id: m.id,
          label: m.name,
          sub: m.role || 'Membro',
          route: '/settings',
          icon: m.name ? m.name[0].toUpperCase() : 'M',
          color: 'bg-purple-500',
        });
      }
    });
  } catch {}

  // ==================== PAGINAS ====================

  const pages = [
    { label: 'Dashboard', route: '/dashboard', keywords: ['dashboard', 'inicio', 'home', 'painel'] },
    { label: 'Ordens de Servico', route: '/financial', keywords: ['ordens', 'servico', 'os', 'kanban'] },
    { label: 'Agenda', route: '/agenda', keywords: ['agenda', 'calendario', 'eventos'] },
    { label: 'Minha Rotina', route: '/routine', keywords: ['rotina', 'tarefas', 'routine'] },
    { label: 'Processos (BPMN)', route: '/sales', keywords: ['processos', 'bpmn', 'fluxo'] },
    { label: 'Relatorios', route: '/reports', keywords: ['relatorios', 'reports', 'pdf'] },
    { label: 'Configuracoes', route: '/settings', keywords: ['configuracoes', 'settings', 'perfil', 'equipe'] },
  ];

  pages.forEach(p => {
    if (p.label.toLowerCase().includes(q) || p.keywords.some(k => k.includes(q))) {
      results.push({
        type: 'page',
        id: p.route,
        label: p.label,
        sub: 'Pagina',
        route: p.route,
        icon: '→',
        color: 'bg-slate-500',
      });
    }
  });

  return results.slice(0, 12);
}
