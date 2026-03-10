/**
 * searchService - Busca global categorizada
 *
 * Busca em O.S., eventos, projetos e membros via Supabase.
 */

import { supabase } from './supabase';

export async function searchAll(query) {
  if (!query || query.length < 2) return [];

  const q = query.toLowerCase();
  const results = [];

  // ==================== BUSCA VIA SUPABASE ====================

  // O.S.
  try {
    const { data: orders } = await supabase
      .from('os_orders')
      .select('id, number, title, client, description')
      .or(`title.ilike.%${q}%,client.ilike.%${q}%,description.ilike.%${q}%,number.ilike.%${q}%`)
      .limit(10);

    (orders || []).forEach(o => {
      results.push({
        type: 'os',
        id: o.id,
        label: `O.S. #${o.number} - ${o.title}`,
        sub: o.client || o.description || '',
        route: '/financial',
        icon: 'OS',
        color: 'bg-fyness-primary',
      });
    });
  } catch {}

  // Eventos
  try {
    const { data: events } = await supabase
      .from('agenda_events')
      .select('id, title, description')
      .or(`title.ilike.%${q}%,description.ilike.%${q}%`)
      .limit(10);

    (events || []).forEach(e => {
      results.push({
        type: 'event',
        id: e.id,
        label: e.title,
        sub: e.description || '',
        route: '/agenda',
        icon: 'AG',
        color: 'bg-amber-500',
      });
    });
  } catch {}

  // Projetos
  try {
    const { data: projects } = await supabase
      .from('os_projects')
      .select('id, name, description')
      .ilike('name', `%${q}%`)
      .limit(10);

    (projects || []).forEach(p => {
      results.push({
        type: 'project',
        id: p.id,
        label: p.name,
        sub: p.description || 'Projeto',
        route: '/financial',
        icon: 'PJ',
        color: 'bg-blue-500',
      });
    });
  } catch {}

  // Membros
  try {
    const { data: members } = await supabase
      .from('team_members')
      .select('id, name, role')
      .or(`name.ilike.%${q}%,role.ilike.%${q}%`)
      .limit(10);

    (members || []).forEach(m => {
      results.push({
        type: 'member',
        id: m.id,
        label: m.name,
        sub: m.role || 'Membro',
        route: '/settings',
        icon: m.name ? m.name[0].toUpperCase() : 'M',
        color: 'bg-purple-500',
      });
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
