/**
 * searchService - Busca global categorizada
 *
 * Busca em O.S., eventos, projetos e membros via Supabase.
 */

import { supabase } from './supabase';
import { escapeOrIlike } from '../modules/crm/lib/searchFilters';

export async function searchAll(query) {
  if (!query || query.length < 2) return [];

  const q = query.toLowerCase();
  // Escapa virgula/parenteses/wildcards: input cru no `.or()` quebrava a
  // sintaxe do PostgREST (ex.: "Silva, Ltda") -> erro 400 engolido pelo
  // catch{} -> busca retornava zero resultados.
  const esc = escapeOrIlike(q);
  const results = [];

  // ==================== BUSCA VIA SUPABASE ====================

  // O.S.
  try {
    // `number` e coluna inteira: ilike sempre erra. Busca por numero exato so
    // quando o termo tiver digitos.
    const orParts = [`title.ilike.%${esc}%`, `client.ilike.%${esc}%`, `description.ilike.%${esc}%`];
    const digits = q.replace(/\D/g, '');
    if (digits) orParts.push(`number.eq.${digits}`);
    const { data: orders } = await supabase
      .from('os_orders')
      .select('id, number, title, client, description')
      .or(orParts.join(','))
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
      .or(`title.ilike.%${esc}%,description.ilike.%${esc}%`)
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
      .or(`name.ilike.%${esc}%,role.ilike.%${esc}%`)
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
    // Dashboard de O.S./RH (/dashboard) fica oculto — nao listar na busca.
    { label: 'Ordens de Servico', route: '/financial', keywords: ['ordens', 'servico', 'os', 'kanban', 'inicio', 'home', 'painel'] },
    { label: 'Agenda', route: '/agenda', keywords: ['agenda', 'calendario', 'eventos', 'tarefas', 'rotina'] },
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
