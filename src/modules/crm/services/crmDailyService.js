import { supabase } from '../../../lib/supabase';
import { toast } from '../../../contexts/ToastContext';

// ==================== PLACAR DIARIO DO TIME ====================
// Conta volume de atividade por vendedor num dia (ligacoes, whatsapp
// enviados, reunioes e tarefas concluidas) + KPIs de contexto do mes.
// Pensado pra reuniao de manha (daily): abrir e apresentar.
//
// Fontes contaveis por vendedor + timestamp:
//   crm_calls       (created_by, started_at, outcome)
//   crm_messages    (created_by, sent_at, direction='outbound')
//   crm_activities  (created_by, start_date / completed_at, type)
//
// NAO contavel hoje: email manual (nao registrado) e whatsapp inbound
// (nao vincula ao vendedor que atendeu).

// Outcomes de ligacao considerados "conexao" (alguem atendeu/avancou)
const CONNECTED_OUTCOMES = ['answered', 'meeting_scheduled', 'deal_advanced', 'callback_scheduled'];

export async function getDailyScoreboard(dayStartISO, dayEndISO, ownerId = null) {
  try {
    // Filtro opcional por vendedor (created_by): quando setado, so as atividades
    // dele contam.
    const byOwner = (q) => (ownerId ? q.eq('created_by', ownerId) : q);

    const [callsRes, msgsRes, meetingsRes, tasksRes, membersRes, dayWonRes, schedRes] = await Promise.all([
      byOwner(supabase.from('crm_calls')
        .select('created_by, outcome')
        .gte('started_at', dayStartISO).lt('started_at', dayEndISO)
        .is('deleted_at', null)),
      byOwner(supabase.from('crm_messages')
        .select('created_by')
        .eq('direction', 'outbound')
        .gte('sent_at', dayStartISO).lt('sent_at', dayEndISO)
        .is('deleted_at', null)),
      byOwner(supabase.from('crm_activities')
        .select('created_by')
        .eq('type', 'meeting')
        .gte('start_date', dayStartISO).lt('start_date', dayEndISO)
        .is('deleted_at', null)),
      byOwner(supabase.from('crm_activities')
        .select('created_by')
        .eq('completed', true)
        // Buckets disjuntos: reunioes ja contam em 'meetings' e ligacoes em
        // crm_calls (espelhadas como activity type='call'). Sem este filtro o
        // total contava em dobro quem registra ligacao/reuniao.
        .not('type', 'in', '("meeting","call")')
        .gte('completed_at', dayStartISO).lt('completed_at', dayEndISO)
        .is('deleted_at', null)),
      supabase.from('team_members').select('id, name, color, auth_user_id'),
      // Contratos fechados no periodo — owner_id (o closer) + created_by, pra
      // atribuir o fechamento por pessoa no "peso por etapa".
      byOwner(supabase.from('crm_deals')
        .select('owner_id, created_by')
        .eq('status', 'won')
        .gte('closed_at', dayStartISO).lt('closed_at', dayEndISO)
        .is('deleted_at', null)),
      // PREVISTO de ligacoes/mensagens = o que esta AGENDADO na agenda no periodo
      // (atividades tipo call/message por start_date, feitas ou nao).
      byOwner(supabase.from('crm_activities')
        .select('type')
        .in('type', ['call', 'message'])
        .gte('start_date', dayStartISO).lt('start_date', dayEndISO)
        .is('deleted_at', null)),
    ]);

    const memberMap = {};       // auth_user_id -> { name, color }
    const authByMemberId = {};  // team_members.id -> auth_user_id (deal.owner_id usa o id)
    (membersRes.data || []).forEach(m => {
      if (m.auth_user_id) memberMap[m.auth_user_id] = { name: m.name, color: m.color };
      if (m.id && m.auth_user_id) authByMemberId[m.id] = m.auth_user_id;
    });

    // Agregar por vendedor (created_by)
    const board = {};
    const ensure = (uid) => {
      if (!board[uid]) board[uid] = { uid, calls: 0, connectedCalls: 0, messages: 0, meetings: 0, tasks: 0, contracts: 0 };
      return board[uid];
    };

    (callsRes.data || []).forEach(r => {
      if (!r.created_by) return;
      const b = ensure(r.created_by);
      b.calls++;
      if (CONNECTED_OUTCOMES.includes(r.outcome)) b.connectedCalls++;
    });
    (msgsRes.data || []).forEach(r => { if (r.created_by) ensure(r.created_by).messages++; });
    (meetingsRes.data || []).forEach(r => { if (r.created_by) ensure(r.created_by).meetings++; });
    (tasksRes.data || []).forEach(r => { if (r.created_by) ensure(r.created_by).tasks++; });
    // Fechamentos atribuidos ao DONO do negocio (owner_id -> auth_user_id;
    // fallback pro criador se nao houver dono). E o "quem fechou".
    (dayWonRes.data || []).forEach(r => {
      const uid = (r.owner_id && authByMemberId[r.owner_id]) || r.created_by;
      if (uid) ensure(uid).contracts++;
    });

    const sellers = Object.values(board)
      .map(b => ({
        ...b,
        name: memberMap[b.uid]?.name || 'Sem dono',
        color: memberMap[b.uid]?.color || '#94a3b8',
        total: b.calls + b.messages + b.meetings + b.tasks,
      }))
      .sort((a, b) => b.total - a.total);

    const totals = sellers.reduce((acc, s) => ({
      calls: acc.calls + s.calls,
      messages: acc.messages + s.messages,
      meetings: acc.meetings + s.meetings,
      tasks: acc.tasks + s.tasks,
      total: acc.total + s.total,
    }), { calls: 0, messages: 0, meetings: 0, tasks: 0, total: 0 });

    // PREVISTO (agendado na agenda) de ligacoes/mensagens no periodo.
    const scheduled = { calls: 0, messages: 0 };
    (schedRes.data || []).forEach(r => {
      if (r.type === 'call') scheduled.calls++;
      else if (r.type === 'message') scheduled.messages++;
    });

    return {
      sellers,
      totals,
      scheduled,
      day: {
        wonCount: (dayWonRes.data || []).length,
      },
    };
  } catch (err) {
    toast('Erro ao carregar placar do dia', 'error');
    return null;
  }
}

// ==================== BRIEFING DO DIA (olhar pra frente) ====================
// "Hoje o time precisa": atividades pendentes agendadas pra HOJE + as ATRASADAS
// (venceram e ninguem tocou). Mais a meta do mes x realizado.
// Sempre referente ao dia de HOJE (independe do toggle ontem/hoje da tela).

const ACTIVITY_TYPE_LABELS = {
  call: 'Ligação', email: 'E-mail', message: 'Mensagem', meeting: 'Reunião',
  visit: 'Visita', task: 'Tarefa', follow_up: 'Follow-up', lunch: 'Almoço',
};

export async function getDailyBriefing() {
  try {
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const endOfToday = new Date(startOfToday);
    endOfToday.setDate(endOfToday.getDate() + 1);
    const startISO = startOfToday.toISOString();
    const endISO = endOfToday.toISOString();
    const monthStartISO = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
    const monthEndISO = new Date(now.getFullYear(), now.getMonth() + 1, 1).toISOString();

    const [pendingRes, membersRes, goalsRes, wonRes] = await Promise.all([
      supabase.from('crm_activities')
        .select('id, title, type, start_date, created_by, crm_contacts(name), crm_deals(id, title)')
        .eq('completed', false)
        .lt('start_date', endISO)
        .is('deleted_at', null)
        .order('start_date', { ascending: true }),
      supabase.from('team_members').select('name, color, auth_user_id'),
      supabase.from('crm_goals')
        .select('title, target_value, period_start, period_end')
        .eq('type', 'global').eq('status', 'active').eq('kind', 'revenue').is('deleted_at', null),
      supabase.from('crm_deals')
        .select('value').eq('status', 'won')
        .gte('closed_at', monthStartISO).lt('closed_at', monthEndISO)
        .is('deleted_at', null),
    ]);

    const memberMap = {};
    (membersRes.data || []).forEach(m => {
      if (m.auth_user_id) memberMap[m.auth_user_id] = { name: m.name, color: m.color };
    });

    const mapItem = (a) => ({
      id: a.id,
      title: a.title,
      type: a.type,
      typeLabel: ACTIVITY_TYPE_LABELS[a.type] || a.type,
      startDate: a.start_date,
      ownerName: memberMap[a.created_by]?.name || 'Sem dono',
      ownerColor: memberMap[a.created_by]?.color || '#94a3b8',
      contactName: a.crm_contacts?.name || null,
      dealTitle: a.crm_deals?.title || null,
    });

    const today = [];
    const overdue = [];
    (pendingRes.data || []).forEach(a => {
      (a.start_date >= startISO ? today : overdue).push(mapItem(a));
    });

    // Meta global ativa que cobre hoje (ou a primeira disponivel)
    const todayStr = startISO.split('T')[0];
    const goals = goalsRes.data || [];
    const goal = goals.find(g => g.period_start <= todayStr && g.period_end >= todayStr) || goals[0] || null;
    const current = (wonRes.data || []).reduce((s, d) => s + (d.value || 0), 0);

    return {
      agenda: { today, overdue },
      goal: {
        hasGoal: !!goal,
        title: goal?.title || null,
        target: goal?.target_value || 0,
        current,
        pct: goal?.target_value > 0 ? Math.min(100, Math.round((current / goal.target_value) * 100)) : 0,
      },
    };
  } catch (err) {
    toast('Erro ao carregar briefing do dia', 'error');
    return null;
  }
}
