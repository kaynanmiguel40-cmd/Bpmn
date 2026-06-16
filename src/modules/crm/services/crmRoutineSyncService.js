/**
 * crmRoutineSyncService - leva as tarefas comerciais da semana pro gerenciador
 * de rotina (sistema de O.S.).
 *
 * Modelo da casa: cada pessoa tem 1 O.S. por semana, com o trabalho em GRUPOS
 * (checklist_groups). O comercial entra como o grupo "Tarefas Comerciais" dentro
 * da O.S. semanal do vendedor — cada tarefa do CRM vira um item do checklist
 * (com prazo e concluído).
 *
 * Idempotente: ao rodar de novo, só reescreve o grupo "Tarefas Comerciais";
 * não toca nos outros grupos/itens da O.S. Se a O.S. da semana não existir, cria.
 *
 * V1 = do próprio usuário logado, sob demanda (botão). Próximos passos:
 * automatizar pra todos os vendedores + grupos de Briefing e Relatório.
 */

import { supabase } from '../../../lib/supabase';
import { getOSOrders, createOSOrder, updateOSOrder } from '../../../lib/osService';
import { toast } from '../../../contexts/ToastContext';

export const COMMERCIAL_GROUP = 'Tarefas Comerciais';
// Título-marca da O.S. comercial DEDICADA do vendedor: 1 por semana, separada
// das demais O.S. (projeto, geral, emergência). Identifica a O.S. sem ambiguidade.
const COMMERCIAL_PREFIX = 'Comercial · ';
// Supervisor fixo da O.S. comercial (por enquanto).
const SUPERVISOR = 'Kaynan';
// Tudo do comercial vira tarefa na O.S. — inclusive reunião/visita/almoço.
const TASK_TYPES = ['call', 'message', 'email', 'follow_up', 'task', 'meeting', 'visit', 'lunch'];

const pad = (n) => String(n).padStart(2, '0');
const ymd = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

// Semana comercial: segunda → domingo (coleta), mas a O.S. FECHA sexta 18h.
function thisWeek() {
  const now = new Date();
  const day = now.getDay(); // 0=Dom
  const monday = new Date(now); monday.setHours(0, 0, 0, 0);
  monday.setDate(now.getDate() + (day === 0 ? -6 : 1 - day));
  const sunday = new Date(monday); sunday.setDate(monday.getDate() + 6); sunday.setHours(23, 59, 59, 999);
  const fridayClose = new Date(monday); fridayClose.setDate(monday.getDate() + 4); fridayClose.setHours(18, 0, 0, 0);
  return { monday, sunday, fridayClose, weekStart: ymd(monday), weekEnd: ymd(sunday) };
}

async function currentUser() {
  const { data } = await supabase.auth.getSession();
  const uid = data?.session?.user?.id || null;
  if (!uid) return null;
  const { data: m } = await supabase.from('team_members').select('id, name').eq('auth_user_id', uid).maybeSingle();
  return { uid, name: m?.name || data.session?.user?.email || 'Você' };
}

// Vendedores = responsáveis pela O.S. comercial (vendedor + pré-vendedor).
async function listSalespeople() {
  const { data } = await supabase.from('team_members')
    .select('id, name, auth_user_id, crm_role')
    .in('crm_role', ['vendedor', 'pre_vendedor']);
  return (data || []).map(m => ({ id: m.auth_user_id || m.id, name: m.name || 'Vendedor' }));
}

// Mapa id (auth_user_id e team_member id) → nome, pro fallback de responsável.
async function nameByUid() {
  const { data } = await supabase.from('team_members').select('id, auth_user_id, name');
  const map = {};
  for (const m of (data || [])) {
    if (m.auth_user_id) map[m.auth_user_id] = m.name;
    if (m.id) map[m.id] = m.name;
  }
  return map;
}

/**
 * Sincroniza as MINHAS tarefas comerciais da semana com a O.S. comercial
 * COMPARTILHADA da semana (responsáveis = vendedores, supervisor = Kaynan).
 * Cada tarefa leva o responsável (o dono dela no CRM). Idempotente: reescreve
 * só as minhas tarefas, preservando as dos outros vendedores.
 * @returns {Promise<{ok:boolean, osId?, count?, created?}>}
 */
export async function syncMyCommercialWeekToOS() {
  const u = await currentUser();
  if (!u) { toast('Faça login pra sincronizar', 'error'); return { ok: false }; }
  const { monday, sunday, fridayClose, weekStart, weekEnd } = thisWeek();

  // TODAS as tarefas comerciais da semana (de todos os vendedores), por start_date.
  const { data: acts, error } = await supabase.from('crm_activities')
    .select('id, title, type, start_date, end_date, completed, completed_at, created_by, assigned_to, assigned_to_name')
    .in('type', TASK_TYPES)
    .gte('start_date', monday.toISOString())
    .lte('start_date', sunday.toISOString())
    .is('deleted_at', null)
    .order('start_date', { ascending: true });
  if (error) { toast(`Erro ao buscar tarefas: ${error.message}`, 'error'); return { ok: false }; }

  const nameMap = await nameByUid();
  // Cada tarefa → item do checklist: responsável + início + ENTREGA (dueAt = end_date).
  const items = (acts || []).map(a => ({
    id: `crm_${a.id}`,
    text: a.title || 'Tarefa',
    done: !!a.completed,
    completedAt: a.completed_at || null,
    startAt: a.start_date || null,          // início previsto
    dueAt: a.end_date || a.start_date || null, // data de ENTREGA (prazo)
    group: COMMERCIAL_GROUP,
    assigneeId: a.assigned_to || a.created_by || null,
    assigneeName: a.assigned_to_name || nameMap[a.assigned_to] || nameMap[a.created_by] || 'Sem responsável',
  }));

  const salespeople = await listSalespeople();

  // O.S. comercial COMPARTILHADA da semana (uma só pra todos), pelo título-marca.
  const all = await getOSOrders();
  const weekly = (all || []).find(o =>
    o.weekStart === weekStart && (o.title || '').startsWith(COMMERCIAL_PREFIX)
  );

  if (weekly) {
    // Reescreve o grupo comercial inteiro (juntou tudo de todos de uma vez).
    const otherItems = (weekly.checklist || []).filter(i => (i.group || '') !== COMMERCIAL_GROUP);
    const otherGroups = (weekly.checklistGroups || []).filter(g => (g.name || '') !== COMMERCIAL_GROUP);
    await updateOSOrder(weekly.id, {
      checklist: [...otherItems, ...items],
      checklistGroups: [...otherGroups, { name: COMMERCIAL_GROUP, assignees: salespeople }],
      participants: salespeople,
      supervisor: SUPERVISOR,
    });
    toast(`${items.length} tarefa(s) na O.S. comercial da semana`, 'success');
    return { ok: true, osId: weekly.id, count: items.length, created: false };
  }

  // Não existe → cria a O.S. comercial compartilhada da semana
  const created = await createOSOrder({
    title: `${COMMERCIAL_PREFIX}Semana ${pad(monday.getDate())}/${pad(monday.getMonth() + 1)} – ${pad(sunday.getDate())}/${pad(sunday.getMonth() + 1)}`,
    mode: 'solo', status: 'in_progress', type: 'normal', category: 'internal', priority: 'medium',
    assignee: 'Comercial', assignedTo: null, supervisor: SUPERVISOR,
    // FKs explicitamente null — o schema defaulta '' (string vazia), que viola as
    // foreign keys (project_id/client_id/parent_order_id) e cai no fallback offline.
    projectId: null, clientId: null, parentOrderId: null,
    weekStart, weekEnd,
    estimatedStart: monday.toISOString(), estimatedEnd: fridayClose.toISOString(), // fecha sexta 18h
    participants: salespeople,
    checklist: items,
    checklistGroups: [{ name: COMMERCIAL_GROUP, assignees: salespeople }],
  });
  toast(`O.S. comercial da semana criada com ${items.length} tarefa(s)`, 'success');
  return { ok: true, osId: created?.id, count: items.length, created: true };
}
