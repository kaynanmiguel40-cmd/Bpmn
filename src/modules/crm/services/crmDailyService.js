import { supabase } from '../../../lib/supabase';
import { toast } from '../../../contexts/ToastContext';
import { autorDaLigacao } from '../lib/ligacoes';

// ==================== PLACAR DIARIO DO TIME ====================
// Conta volume de atividade por vendedor num dia (ligacoes, whatsapp
// enviados, reunioes e tarefas concluidas) + KPIs de contexto do mes.
// Pensado pra reuniao de manha (daily): abrir e apresentar.
//
// A UNIDADE E A TAREFA CONCLUIDA, nao o registro bruto do canal. Ligacao,
// mensagem e reuniao saem de crm_activities (type + completed_at); o autor sai de
// completed_by > assigned_to > created_by, porque a tarefa de cadencia nasce de um
// insert do sistema sem created_by. Uma tarefa pode valer mais de um toque quando
// o titulo declara ("Ligação (3 tentativas)" = 3) — ver lib/ligacoes.
//
// Por que NAO os registros brutos: crm_messages tem ~2100 outbound, mas isso e
// volume de conversa (cada balao de ida e volta), nao trabalho executado — uma
// conversa de 40 mensagens com um lead nao sao 40 toques de cadencia. crm_calls e
// o registro pos-call OPCIONAL: contava 8 ligacoes contra 88 tarefas feitas.
//
// crm_calls sobra so pras ATENDIDAS (outcome): a conclusao da tarefa nao grava
// desfecho. NAO contavel: e-mail manual e whatsapp inbound.

// Outcomes de ligacao considerados "conexao" (alguem atendeu/avancou)
const CONNECTED_OUTCOMES = ['answered', 'meeting_scheduled', 'deal_advanced', 'callback_scheduled'];

export async function getDailyScoreboard(dayStartISO, dayEndISO, ownerId = null) {
  try {
    // Filtro opcional por vendedor (created_by): quando setado, so as atividades
    // dele contam.
    const byOwner = (q) => (ownerId ? q.eq('created_by', ownerId) : q);

    const [callActsRes, callsRes, msgsRes, emailActsRes, meetingsRes, tasksRes, membersRes, dayWonRes, schedRes] = await Promise.all([
      // LIGACAO REALIZADA = tarefa de Ligacao CONCLUIDA (1 por tarefa). Sem filtro
      // de dono na query de proposito: a tarefa de cadencia nasce sem created_by,
      // entao o autor sai de completed_by/assigned_to (autorDaLigacao) e o recorte
      // por vendedor acontece na agregacao abaixo.
      supabase.from('crm_activities')
        .select('title, contacted, completed_by, assigned_to, created_by')
        .eq('type', 'call').eq('completed', true)
        .gte('completed_at', dayStartISO).lt('completed_at', dayEndISO)
        .is('deleted_at', null),
      // crm_calls agora serve so pras ATENDIDAS (outcome). O total vem da tarefa:
      // toda ligacao registrada tambem cria a atividade-espelho, entao somar as
      // duas fontes contaria em dobro.
      byOwner(supabase.from('crm_calls')
        .select('created_by, outcome')
        .gte('started_at', dayStartISO).lt('started_at', dayEndISO)
        .is('deleted_at', null)),
      // MENSAGEM ENVIADA = tarefa de Mensagem CONCLUIDA — a mesma regra da
      // ligacao: a unidade e o TRABALHO EXECUTADO, nao o trafego do WhatsApp.
      // crm_messages tem 2106 outbound, mas isso e volume de conversa (cada balao
      // de ida e volta): uma conversa de 40 mensagens com um lead nao sao 40
      // toques de cadencia. Mesmo recorte de dono na agregacao (a tarefa de
      // cadencia nasce sem created_by).
      supabase.from('crm_activities')
        .select('title, completed_by, assigned_to, created_by')
        .eq('type', 'message').eq('completed', true)
        .gte('completed_at', dayStartISO).lt('completed_at', dayEndISO)
        .is('deleted_at', null),
      // E-MAIL ENVIADO = tarefa de E-mail CONCLUIDA (1 por tarefa), mesma regra.
      supabase.from('crm_activities')
        .select('completed_by, assigned_to, created_by')
        .eq('type', 'email').eq('completed', true)
        .gte('completed_at', dayStartISO).lt('completed_at', dayEndISO)
        .is('deleted_at', null),
      supabase.from('crm_activities')
        .select('completed_by, assigned_to, created_by')
        .eq('type', 'meeting')
        .gte('start_date', dayStartISO).lt('start_date', dayEndISO)
        .is('deleted_at', null),
      supabase.from('crm_activities')
        .select('completed_by, assigned_to, created_by')
        .eq('completed', true)
        // Buckets disjuntos: reuniao->meetings, ligacao->calls, mensagem->messages,
        // e-mail->emails — todos saem da propria tarefa concluida. Sem este filtro
        // o mesmo card entraria duas vezes no total.
        .not('type', 'in', '("meeting","call","message","email")')
        .gte('completed_at', dayStartISO).lt('completed_at', dayEndISO)
        .is('deleted_at', null),
      supabase.from('team_members').select('id, name, color, auth_user_id'),
      // Contratos fechados no periodo — owner_id (o closer) + created_by, pra
      // atribuir o fechamento por pessoa no "peso por etapa".
      byOwner(supabase.from('crm_deals')
        .select('owner_id, created_by')
        .eq('status', 'won')
        .gte('closed_at', dayStartISO).lt('closed_at', dayEndISO)
        .is('deleted_at', null)),
      // PREVISTO de ligacoes/mensagens = o que esta AGENDADO na agenda no periodo
      // (atividades tipo call/message por start_date, feitas ou nao). Mesmo peso
      // por tentativas do realizado — senao previsto e realizado nao sao
      // comparaveis (o previsto sairia 3x menor).
      supabase.from('crm_activities')
        .select('type, title, completed_by, assigned_to, created_by')
        .in('type', ['call', 'message', 'email'])
        .gte('start_date', dayStartISO).lt('start_date', dayEndISO)
        .is('deleted_at', null),
    ]);

    const memberMap = {};       // auth_user_id -> { name, color }
    const authByMemberId = {};  // team_members.id -> auth_user_id (deal.owner_id usa o id)
    (membersRes.data || []).forEach(m => {
      if (m.auth_user_id) memberMap[m.auth_user_id] = { name: m.name, color: m.color };
      if (m.id && m.auth_user_id) authByMemberId[m.id] = m.auth_user_id;
    });

    // Agregar por vendedor (completed_by > assigned_to > created_by)
    const board = {};
    const ensure = (uid) => {
      if (!board[uid]) board[uid] = { uid, calls: 0, connectedCalls: 0, atendidas: 0, naoAtendidas: 0, semDesfecho: 0, messages: 0, emails: 0, meetings: 0, tasks: 0, contracts: 0 };
      return board[uid];
    };

    // Trabalho SEM autor nenhum nao pode sumir do placar: 240 das 308 tarefas de
    // mensagem concluidas nao tem completed_by/assigned_to/created_by (foram
    // fechadas pelo checklist do playbook, que nao carimbava quem concluiu).
    // Descartar zeraria o total do time; entao vao pro balde "Sem dono" — que
    // aparece no board e denuncia o buraco de atribuicao em vez de escondê-lo.
    const SEM_DONO = '__sem_dono__';
    // `ownerId` recorta por vendedor aqui (nao na query): a tarefa de cadencia
    // nasce sem created_by, entao filtrar no banco por ele jogaria fora justamente
    // as tarefas de cadencia. Sem dono nunca casa um vendedor especifico.
    const doVendedor = (uid) => !ownerId || uid === ownerId;

    // UMA TAREFA = UM TOQUE. Nao multiplica pelo "(3 tentativas)" do titulo: o "3"
    // e um TETO ("tente ate 3 vezes"), nao um realizado — o vendedor para quando
    // o lead atende. Contar 3 inflaria justamente as atendidas (a que deu certo na
    // 1a discada viraria 3), e a contagem real de discadas nao e registrada. O
    // toque trabalhado e a unidade honesta.
    const somar = (rows, campo) => {
      (rows || []).forEach(r => {
        const uid = autorDaLigacao(r) || SEM_DONO;
        if (!doVendedor(uid)) return;
        ensure(uid)[campo] += 1;
      });
    };

    somar(callActsRes.data, 'calls');
    somar(msgsRes.data, 'messages');
    somar(emailActsRes.data, 'emails');

    // DESFECHO das ligacoes. Cada tarefa cai INTEIRA num balde — a invariante
    // atendidas + naoAtendidas + semDesfecho = calls sai de graca.
    (callActsRes.data || []).forEach(r => {
      const uid = autorDaLigacao(r) || SEM_DONO;
      if (!doVendedor(uid)) return;
      const b = ensure(uid);
      if (r.contacted === true) b.atendidas += 1;
      else if (r.contacted === false) b.naoAtendidas += 1;
      else b.semDesfecho += 1;
    });
    somar(meetingsRes.data, 'meetings');
    somar(tasksRes.data, 'tasks');

    // Atendidas: so o registro pos-call sabe se alguem atendeu (a conclusao da
    // tarefa nao grava desfecho).
    (callsRes.data || []).forEach(r => {
      if (!r.created_by) return;
      if (CONNECTED_OUTCOMES.includes(r.outcome)) ensure(r.created_by).connectedCalls++;
    });
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
        total: b.calls + b.messages + b.emails + b.meetings + b.tasks,
      }))
      .sort((a, b) => b.total - a.total);

    const totals = sellers.reduce((acc, s) => ({
      calls: acc.calls + s.calls,
      atendidas: acc.atendidas + s.atendidas,
      naoAtendidas: acc.naoAtendidas + s.naoAtendidas,
      semDesfecho: acc.semDesfecho + s.semDesfecho,
      messages: acc.messages + s.messages,
      emails: acc.emails + s.emails,
      meetings: acc.meetings + s.meetings,
      tasks: acc.tasks + s.tasks,
      total: acc.total + s.total,
    }), { calls: 0, atendidas: 0, naoAtendidas: 0, semDesfecho: 0, messages: 0, emails: 0, meetings: 0, tasks: 0, total: 0 });

    // PREVISTO (agendado na agenda) de ligacoes/mensagens/e-mails no periodo.
    const scheduled = { calls: 0, messages: 0, emails: 0 };
    (schedRes.data || []).forEach(r => {
      const uid = autorDaLigacao(r) || SEM_DONO;
      if (!doVendedor(uid)) return;
      // 1 por tarefa, igual ao realizado — senao previsto e real nao comparam.
      if (r.type === 'call') scheduled.calls += 1;
      else if (r.type === 'message') scheduled.messages += 1;
      else if (r.type === 'email') scheduled.emails += 1;
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
