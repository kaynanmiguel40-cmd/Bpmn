/**
 * CrmAgendaPage - Agenda do CRM: controle do dia a dia, num lugar só.
 *
 * A Agenda é o nível de EXECUÇÃO do CRM: a Pipeline mostra ONDE o lead está,
 * e aqui é onde o trabalho acontece — é o único lugar que dá check numa tarefa.
 *
 * 3 visões:
 *   Fila (padrão) - a lista priorizada que responde "o que eu faço agora":
 *                   atrasadas (agrupadas por lead), hoje, leads parados. É a
 *                   tela de trabalho. Ver components/agenda/WorkQueue.
 *   Calendário    - mês/semana/dia/lista, pra planejar e arrastar. Integra com
 *                   o Google Calendar nos dois sentidos: as atividades do CRM
 *                   já são espelhadas pro Google (push, em crmActivitiesService)
 *                   e aqui também PUXAMOS os eventos do Google (pull,
 *                   useGCalEvents) pra mostrar junto.
 *   Time          - placar do time (ligações/reuniões/contratos, meta do mês,
 *                   agendado/atrasados do time inteiro) + tabela buscável de
 *                   todas as atividades (qualquer vendedor, qualquer período).
 */

import { useState, useMemo, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Plus, Link2, Eye, EyeOff } from 'lucide-react';
import { CrmPageHeader, CrmConfirmDialog } from '../components/ui';
import CrmCalendar from '../components/agenda/CrmCalendar';
import LeadHistoryPanel from '../components/agenda/LeadHistoryPanel';
import { WorkQueue } from '../components/agenda/WorkQueue';
import { useSnoozeActivity, useNextStage, useNextActivityForLead } from '../hooks/useWorkQueue';
import { toast } from '../../../contexts/ToastContext';
import { TeamDailyBriefing } from '../components/agenda/TeamDailyBriefing';
import { TeamActivitiesTable } from '../components/agenda/TeamActivitiesTable';
import { ActivityFormModal } from '../components/ActivityFormModal';
import { CompleteActivityModal } from '../components/CompleteActivityModal';
import { ExecuteTaskModal } from '../components/ExecuteTaskModal';
import { useCrmCalendarActivities, useCompleteCrmActivity, useDeleteCrmActivity, useUpdateCrmActivity, usePlaybookSteps, useMoveCrmDeal } from '../hooks/useCrmQueries';
import { useGCalEvents, useGCalStatus } from '../../../hooks/queries';
import { connectGCal } from '../../../lib/googleCalendarService';
import { useProfile } from '../../../hooks/useProfile';
import { namesMatch } from '../../../lib/kpiUtils';
import { useUrlState } from '../../../hooks/useUrlState';
import { useTeamMembers } from '../../../hooks/queries';
import { useCrmAccess } from '../hooks/useCrmAccess';

const startOfDay = (d) => { const x = new Date(d); x.setHours(0, 0, 0, 0); return x; };
const addDays = (d, n) => { const x = new Date(d); x.setDate(x.getDate() + n); return x; };
// Muda o mês com o dia fixado em 1 e depois recoloca o dia limitado ao último do
// mês alvo: setMonth direto no dia 29-31 transborda (31/05 + 1 = 31/06 = 01/07)
// e pula o mês inteiro.
const addMonths = (d, n) => {
  const day = d.getDate();
  const x = new Date(d);
  x.setDate(1);
  x.setMonth(x.getMonth() + n);
  x.setDate(Math.min(day, new Date(x.getFullYear(), x.getMonth() + 1, 0).getDate()));
  return x;
};

// Recorte de datas que o calendário precisa carregar, por visão.
function computeRange(view, date) {
  if (view === 'agenda') {
    const s = startOfDay(date);
    return [s, addDays(s, 31)]; // lista cobre ~30 dias à frente
  }
  if (view === 'day') {
    const s = startOfDay(date);
    return [s, addDays(s, 1)];
  }
  if (view === 'week') {
    const s = addDays(startOfDay(date), -date.getDay());
    return [s, addDays(s, 7)];
  }
  const first = new Date(date.getFullYear(), date.getMonth(), 1);
  const s = addDays(startOfDay(first), -first.getDay());
  return [s, addDays(s, 42)]; // matriz de 6 semanas
}

// Chave de dedupe CRM↔Google: título normalizado + minuto de início.
// As atividades do CRM viram eventos no Google com mesmo título/horário —
// sem isso, o pull traria cada atividade de volta como um evento duplicado.
function dedupeKey(title, startDate) {
  const t = (title || '').trim().toLowerCase();
  const ms = startDate ? Math.floor(new Date(startDate).getTime() / 60000) : 0;
  return `${t}|${ms}`;
}

function TabButton({ active, onClick, children }) {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-1.5 text-sm font-semibold rounded-lg transition-colors ${
        active
          ? 'bg-fyness-primary text-white shadow-sm'
          : 'text-slate-600 dark:text-slate-300 hover:bg-white/70 dark:hover:bg-white/5'
      }`}
    >
      {children}
    </button>
  );
}

function MyDayCalendar() {
  const navigate = useNavigate();
  // Deep-link vindo de fora (ex.: botão "Ver na Agenda" no Negócio): abre já
  // com o lead em foco e, se veio uma data (de uma tarefa específica), pula
  // pro dia certo. Só lido na primeira renderização (seed do estado inicial).
  const [searchParams, setSearchParams] = useSearchParams();
  const linkedDealId = searchParams.get('dealId');
  const linkedContactId = searchParams.get('contactId');
  const linkedDate = searchParams.get('date');

  // view/data/dono-visto/toggle do Google via URL — sem isso, trocar pra aba
  // "Time" e voltar descartava tudo (MyDayCalendar desmonta ao trocar de aba).
  // "date" é o mesmo param usado pelo deep-link (linkedDate) acima: ele já
  // seed a URL, então o useUrlState só continua sincronizando dali pra frente.
  // Default de "view" é congelado no mount (useState) — se recalculasse a
  // cada render a partir de linkedDate, apertar "Hoje" (que limpa o param
  // "date") mudaria o default e resetaria a view sozinho.
  const [initialView] = useState(() => (linkedDate ? 'day' : 'agenda'));
  const [view, setView] = useUrlState('view', initialView);
  const [dateISO, setDateISO] = useUrlState('date', '');
  const currentDate = useMemo(() => (dateISO ? new Date(dateISO) : new Date()), [dateISO]);
  const [viewingMemberId, setViewingMemberId] = useUrlState('member', ''); // '' = eu | 'all' = todos | authUserId de alguém
  const [gcalParam, setGcalParam] = useUrlState('gcal', '1');
  const showGoogle = gcalParam !== '0'; // camada Google Agenda visível
  const setShowGoogle = useCallback((next) => {
    setGcalParam(prev => {
      const prevBool = prev !== '0';
      const nextBool = typeof next === 'function' ? next(prevBool) : next;
      return nextBool ? '1' : '0';
    });
  }, [setGcalParam]);

  const [selected, setSelected] = useState(() => // { dealId, contactId }
    (linkedDealId || linkedContactId) ? { dealId: linkedDealId || null, contactId: linkedContactId || null } : null
  );
  const [formOpen, setFormOpen] = useState(false);
  const [formInitial, setFormInitial] = useState(null);
  const [editActivity, setEditActivity] = useState(null); // tarefa clicada (abre o form em edição, mostra a descrição)
  const [completingTask, setCompletingTask] = useState(null); // { id, title } — abre o modal de conclusão (input/output)
  const [justDoneId, setJustDoneId] = useState(null); // tarefa recém-concluída: modal vira a confirmação com o próximo toque
  const [deleteActivityTarget, setDeleteActivityTarget] = useState(null); // atividade a excluir (confirmação)

  const [rangeStart, rangeEnd] = useMemo(() => computeRange(view, currentDate), [view, currentDate]);
  const startISO = rangeStart.toISOString();
  const endISO = rangeEnd.toISOString();

  // Atividades do CRM no recorte
  const { data: crmActivitiesRaw = [], isLoading: activitiesLoading, isError: activitiesError } = useCrmCalendarActivities(startISO, endISO);
  const completeMutation = useCompleteCrmActivity();
  const deleteActivityMutation = useDeleteCrmActivity();
  const updateActivityMutation = useUpdateCrmActivity();

  // Por padrão, cada um vê só a SUA agenda (privacidade — evita que
  // produto/operação, ex.: Elias, veja a cadência de lead alheia). Quem é
  // admin do CRM pode trocar pra ver a agenda de outro vendedor ou de todos.
  const { profile } = useProfile();
  const { isAdmin } = useCrmAccess();
  const { data: allMembers = [] } = useTeamMembers();
  // Tira EU da lista: a primeira opcao ("Minha fila" / "Meu calendário") ja e
  // eu, entao aparecer de novo pelo nome oferece duas portas pro mesmo lugar —
  // e quem escolhe pelo nome nao entende por que a tela nao mudou.
  const crmMembers = useMemo(
    () => allMembers.filter(m => m.crmRole && m.authUserId && m.authUserId !== profile?.id),
    [allMembers, profile?.id],
  );

  // Identidade de quem esta sendo visto (self quando nao-admin ou sem selecao).
  // Usada tanto pro filtro de atividades quanto pro responsavel padrao de
  // tarefa nova — sem isso, "Nova tarefa" na agenda de outra pessoa sempre
  // criava a tarefa pra quem clicou, nao pra pessoa cuja agenda estava aberta.
  const viewingMember = useMemo(() => (
    isAdmin && viewingMemberId && viewingMemberId !== 'all'
      ? crmMembers.find(m => m.authUserId === viewingMemberId)
      : null
  ), [isAdmin, viewingMemberId, crmMembers]);
  const viewingUid = viewingMember ? viewingMember.authUserId : (profile?.id || null);
  const viewingUname = viewingMember ? viewingMember.name : (profile?.name || null);

  const crmActivities = useMemo(() => {
    if (isAdmin && viewingMemberId === 'all') return crmActivitiesRaw;

    const uid = viewingUid;
    const uname = viewingUname;
    if (!uid && !uname) return [];
    return crmActivitiesRaw.filter((a) => {
      if (a.assignedTo) return a.assignedTo === uid;
      if (a.assignedToName && uname) return namesMatch(a.assignedToName, uname);
      return a.createdBy === uid;
    });
  }, [crmActivitiesRaw, profile, isAdmin, viewingMemberId, crmMembers]);

  // Lookup das atividades completas (com descrição/responsável/etc.) por id,
  // pra abrir o form de edição ao clicar — o objeto do evento é enxuto.
  const activitiesById = useMemo(() => {
    const m = new Map();
    for (const a of crmActivities) m.set(a.id, a);
    return m;
  }, [crmActivities]);

  // ===== EXECUÇÃO DA TAREFA =====
  // A Agenda é o nível de execução: o pipeline só acompanha, o check é aqui.
  // Pra isso a tarefa do processo precisa do script/cenários do passo que a
  // gerou — carregados em lote, só os passos que aparecem no recorte.
  const visibleStepIds = useMemo(
    () => crmActivities.map(a => a.stageStepId).filter(Boolean),
    [crmActivities],
  );
  const { data: stepsById = {} } = usePlaybookSteps(visibleStepIds);

  // Atividade completa que está sendo concluída (o objeto do calendário é
  // enxuto; aqui precisamos de telefone, etapa, passo…).
  const completingActivity = useMemo(() => {
    if (!completingTask) return null;
    const full = activitiesById.get(completingTask.id);
    return full ? { ...full, ...completingTask } : completingTask;
  }, [completingTask, activitiesById]);
  const completingStep = completingActivity?.stageStepId
    ? stepsById[completingActivity.stageStepId] || null
    : null;

  // Próximo toque do MESMO lead: a primeira tarefa pendente depois desta.
  // Sai da agenda já carregada — é o fio da cadência, o que evita o vendedor
  // concluir uma ligação e não saber quando é a próxima.
  const nextActivity = useMemo(() => {
    if (!completingActivity?.startDate) return null;
    const leadKey = `${completingActivity.dealId || ''}:${completingActivity.contactId || ''}`;
    if (leadKey === ':') return null;
    const after = new Date(completingActivity.startDate).getTime();
    return crmActivities
      .filter(a =>
        a.id !== completingActivity.id &&
        !a.completed &&
        `${a.dealId || ''}:${a.contactId || ''}` === leadKey &&
        a.startDate && new Date(a.startDate).getTime() > after)
      .sort((a, b) => new Date(a.startDate) - new Date(b.startDate))[0] || null;
  }, [completingActivity, crmActivities]);

  const closeExecute = useCallback(() => { setCompletingTask(null); setJustDoneId(null); }, []);

  // Google Calendar (pull). Só dispara se conectado.
  const { data: gcalStatus } = useGCalStatus();
  const gcalConnected = !!gcalStatus?.id && !gcalStatus?.expired;
  const { data: gcalEvents = [] } = useGCalEvents(rangeStart, rangeEnd, gcalConnected);

  // Nome+cor por membro (mesma cor usada no placar do time) — pra pintar o
  // avatar de dono no chip quando o admin está vendo "Todos os vendedores".
  const memberByUid = useMemo(() => {
    const m = new Map();
    for (const mem of crmMembers) m.set(mem.authUserId, { name: mem.name, color: mem.color });
    return m;
  }, [crmMembers]);
  const showOwner = isAdmin && viewingMemberId === 'all';

  // Mescla CRM + Google, deduplicando o que o CRM já espelhou pro Google.
  const events = useMemo(() => {
    const crm = crmActivities.map(a => ({
      id: `crm_${a.id}`,
      title: a.title,
      startDate: a.startDate,
      endDate: a.endDate,
      color: a.color,
      source: 'crm',
      typeKey: a.type,
      activityId: a.id,
      leadName: a.leadName,
      stageName: a.stageName,
      completed: a.completed,
      completedAt: a.completedAt,
      deliveryInput: a.deliveryInput,
      deliveryReport: a.deliveryReport,
      typeLabel: a.typeLabel,
      dealId: a.dealId,
      contactId: a.contactId,
      leadKey: `${a.dealId || ''}:${a.contactId || ''}`,
      assignedToName: a.assignedToName || memberByUid.get(a.assignedTo)?.name || null,
      assignedToColor: memberByUid.get(a.assignedTo)?.color || '#94a3b8',
    }));
    // Google Agenda é sempre a do usuário logado — só faz sentido misturar
    // quando ele está olhando o PRÓPRIO dia, não a agenda de outro vendedor.
    const viewingSelf = !viewingMemberId;
    if (!viewingSelf || !gcalConnected || !showGoogle || gcalEvents.length === 0) return crm;

    const seen = new Set(crm.map(e => dedupeKey(e.title, e.startDate)));
    const google = gcalEvents
      .filter(g => g.startDate && !seen.has(dedupeKey(g.title, g.startDate)))
      .map(g => ({
        id: `gcal_${g.id}`,
        title: g.title,
        startDate: g.startDate,
        endDate: g.endDate,
        color: g.color || '#64748b',
        source: 'google',
        isAllDay: g.isAllDay,
        typeLabel: 'Google',
        htmlLink: g.htmlLink,
        leadKey: null,
      }));
    return [...crm, ...google];
  }, [crmActivities, gcalEvents, gcalConnected, showGoogle, viewingMemberId, memberByUid]);

  // Navegação do calendário
  const handleNavigate = useCallback((dir) => {
    let d = new Date(currentDate);
    if (view === 'month') d = addMonths(d, dir);
    else if (view === 'week') d.setDate(d.getDate() + dir * 7);
    else if (view === 'agenda') d.setDate(d.getDate() + dir * 30);
    else d.setDate(d.getDate() + dir);
    setDateISO(d.toISOString());
  }, [view, currentDate, setDateISO]);

  // "+N mais" no Mês: pula direto pro Dia daquela data (em vez de só existir
  // como texto sem clique, que caía no onClick da célula e abria tarefa nova).
  // Os 2 params (date/view) precisam ir num único setSearchParams: chamar
  // setDateISO e setView em sequência perderia um dos dois — cada useUrlState
  // fecha sobre o searchParams do render atual, então a 2ª chamada sobrescreve
  // a 1ª em vez de empilhar (confirmado no código do react-router-dom).
  const handleShowDay = useCallback((day) => {
    setSearchParams(prev => {
      const sp = new URLSearchParams(prev);
      sp.set('date', new Date(day).toISOString());
      sp.set('view', 'day');
      return sp;
    }, { replace: true });
  }, [setSearchParams]);

  const handleSelectEvent = useCallback((ev) => {
    if (ev.source === 'google') {
      if (ev.htmlLink) window.open(ev.htmlLink, '_blank', 'noopener');
      return;
    }
    // Tarefa do PROCESSO ainda pendente: clicar abre a EXECUÇÃO (script,
    // telefone, cenários). Antes o gesto óbvio — clicar no nome da tarefa —
    // levava a um painel de leitura, e o roteiro do que falar só aparecia
    // depois de apertar um botão que prometia "concluir". Ninguém aperta
    // "concluir" ANTES de fazer a ligação, então o playbook ficava invisível.
    if (ev.activityId && !ev.completed) {
      const full = activitiesById.get(ev.activityId);
      if (full?.stageStepId) {
        setCompletingTask({ id: ev.activityId, title: ev.title, type: ev.typeKey });
        return;
      }
    }
    // Sem processo (tarefa avulsa vinculada a lead) ou já concluída: o
    // histórico do lead continua sendo a resposta certa.
    if (ev.dealId || ev.contactId) {
      setSelected({ dealId: ev.dealId || null, contactId: ev.contactId || null });
      return;
    }
    // Tarefa SEM lead vinculado: não há histórico de lead — abre a própria
    // tarefa pra ver/editar a descrição.
    if (ev.activityId) {
      const full = activitiesById.get(ev.activityId);
      if (full) setEditActivity(full);
    }
  }, [activitiesById]);

  // Clicar num dia vazio: abre o form de nova tarefa já naquela data.
  // hasTime=true vem da grade de horário (Semana/Dia) — já traz a hora
  // exata clicada; sem isso (célula do Mês, só a data), cai em 9h por padrão.
  const handleSelectSlot = useCallback((day, hasTime = false) => {
    const d = new Date(day);
    if (!hasTime) d.setHours(9, 0, 0, 0);
    setFormInitial({ startDate: d.toISOString() });
    setFormOpen(true);
  }, []);

  const openNewTask = () => { setFormInitial(null); setFormOpen(true); };

  const selectedLeadKey = selected ? `${selected.dealId || ''}:${selected.contactId || ''}` : null;

  const calendarActions = (
    <>
      {isAdmin && crmMembers.length > 0 && (
        <select
          value={viewingMemberId}
          onChange={(e) => setViewingMemberId(e.target.value)}
          title="Ver a agenda de"
          className="text-xs bg-white dark:bg-slate-800 border border-slate-200/70 dark:border-white/10 rounded-lg px-2 py-1.5 text-slate-600 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-fyness-primary"
        >
          <option value="">Meu calendário</option>
          <option value="all">Todos os vendedores</option>
          {crmMembers.map(m => (
            <option key={m.authUserId} value={m.authUserId}>{m.name}</option>
          ))}
        </select>
      )}
      {!gcalConnected ? (
        <button onClick={() => connectGCal()} title="Conectar Google Agenda"
          className="flex items-center gap-1 px-2 py-1.5 text-xs font-medium text-slate-500 dark:text-slate-400 rounded-lg border border-slate-200/70 dark:border-white/10 hover:bg-slate-100 dark:hover:bg-white/5">
          <Link2 size={13} /> Google
        </button>
      ) : (
        <button
          onClick={() => setShowGoogle(v => !v)}
          title={showGoogle ? 'Ocultar eventos do Google Agenda' : 'Mostrar eventos do Google Agenda'}
          className={`p-1.5 rounded-lg border transition-colors ${
            showGoogle
              ? 'text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800/40'
              : 'text-slate-500 dark:text-slate-400 border-slate-200/70 dark:border-white/10 hover:text-slate-600 dark:hover:text-slate-300'
          }`}
        >
          {showGoogle ? <Eye size={14} /> : <EyeOff size={14} />}
        </button>
      )}
      <button onClick={openNewTask}
        className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-fyness-primary hover:bg-fyness-secondary text-white rounded-lg shadow-sm">
        <Plus size={14} /> Nova tarefa
      </button>
    </>
  );

  return (
    <div className="h-full flex flex-col">
      <div className="flex-1 flex min-h-0">
        <div className="flex-1 min-w-0">
          <CrmCalendar
            events={events}
            view={view}
            onViewChange={setView}
            currentDate={currentDate}
            onNavigate={handleNavigate}
            onToday={() => setDateISO('')}
            onSelectEvent={handleSelectEvent}
            onSelectSlot={handleSelectSlot}
            onShowDay={handleShowDay}
            onCompleteTask={(ev) => {
              if (!ev.activityId) return;
              setCompletingTask({ id: ev.activityId, title: ev.title, type: ev.typeKey });
            }}
            onEditDelivery={(ev) => {
              if (!ev.activityId) return;
              setCompletingTask({ id: ev.activityId, title: ev.title, type: ev.typeKey, completed: true, deliveryInput: ev.deliveryInput, deliveryReport: ev.deliveryReport });
            }}
            onEventDrop={(ev, { start, end }) => {
              // Arrastar reagenda a tarefa (start/end). Só atividade do CRM tem
              // activityId; o updateCrmActivity já propaga pro Google Calendar.
              if (!ev.activityId) return;
              updateActivityMutation.mutate({ id: ev.activityId, updates: { startDate: start, endDate: end } });
            }}
            selectedLeadKey={selectedLeadKey}
            extraActions={calendarActions}
            showOwner={showOwner}
            isLoading={activitiesLoading}
            isError={activitiesError}
          />
        </div>
      </div>

      {/* Histórico do lead — slide-over (modal) visível em QUALQUER tela.
          Antes era um <aside hidden lg:block>, que sumia em telas < 1024px. */}
      {selected && (
        <div className="fixed inset-0 z-50 flex justify-end" role="dialog" aria-modal="true">
          <div className="absolute inset-0 bg-slate-900/40 dark:bg-black/60 backdrop-blur-sm"
            onClick={() => setSelected(null)} />
          <aside className="relative w-full sm:max-w-[400px] h-full bg-white/95 dark:bg-slate-900/90 backdrop-blur-2xl border-l border-white/60 dark:border-white/10 shadow-glass-lg overflow-hidden animate-scale-in">
            <LeadHistoryPanel
              selected={selected}
              onClose={() => setSelected(null)}
              onOpenLead={(lead) => lead.dealId && navigate(`/crm/deals/${lead.dealId}`)}
              onCompleteTask={(item) => setCompletingTask({ id: item.activityId, title: item.title, type: item.activityType })}
              onEditDelivery={(item) => setCompletingTask({ id: item.activityId, title: item.title, type: item.activityType, completed: true, deliveryInput: item.deliveryInput, deliveryReport: item.deliveryReport })}
              onDeleteTask={(item) => setDeleteActivityTarget(item)}
            />
          </aside>
        </div>
      )}

      <ActivityFormModal
        open={formOpen || !!editActivity}
        onClose={() => { setFormOpen(false); setFormInitial(null); setEditActivity(null); }}
        activity={editActivity || formInitial}
        defaultAssignedTo={viewingUid}
        defaultAssignedToName={viewingUname}
        onOpenLeadHistory={(act) => {
          setEditActivity(null);
          if (act?.dealId || act?.contactId) {
            setSelected({ dealId: act.dealId || null, contactId: act.contactId || null });
          }
        }}
      />

      {/* Tarefa do PROCESSO (veio de um passo do playbook) executa no modal
          completo: script, cenários de 1 clique, contato e próximo toque.
          Tarefa avulsa não tem script nem cenário — segue no modal genérico. */}
      {completingActivity?.stageStepId ? (
        <ExecuteTaskModal
          open={!!completingTask}
          onClose={closeExecute}
          activity={completingActivity}
          step={completingStep}
          nextActivity={nextActivity}
          justDone={justDoneId === completingActivity.id}
          isPending={completeMutation.isPending || updateActivityMutation.isPending}
          onOpenLead={(id) => { closeExecute(); navigate(`/crm/deals/${id}`); }}
          onSubmit={({ input, output, contacted }) => {
            if (completingActivity.completed) {
              updateActivityMutation.mutate(
                { id: completingActivity.id, updates: { deliveryInput: input, deliveryReport: output } },
                { onSuccess: closeExecute },
              );
            } else {
              // `contacted` PRECISA ser repassado: sem ele o serviço assume que
              // houve conversa e marca o passo do playbook como cumprido —
              // exatamente o que "Não atendeu" existe pra evitar.
              completeMutation.mutate({ id: completingActivity.id, input, output, contacted }, {
                // Não fecha: vira a confirmação com o próximo toque da cadência.
                onSuccess: () => setJustDoneId(completingActivity.id),
              });
            }
          }}
        />
      ) : (
        <CompleteActivityModal
          open={!!completingTask}
          onClose={() => setCompletingTask(null)}
          activity={completingTask}
          isPending={completeMutation.isPending || updateActivityMutation.isPending}
          onSubmit={({ input, output }) => {
            if (completingTask.completed) {
              // Editando entrega de tarefa já concluída — só atualiza os campos.
              updateActivityMutation.mutate(
                { id: completingTask.id, updates: { deliveryInput: input, deliveryReport: output } },
                { onSuccess: () => setCompletingTask(null) }
              );
            } else {
              completeMutation.mutate({ id: completingTask.id, input, output }, {
                onSuccess: () => setCompletingTask(null),
              });
            }
          }}
        />
      )}

      <CrmConfirmDialog
        open={!!deleteActivityTarget}
        onClose={() => setDeleteActivityTarget(null)}
        onConfirm={() => {
          deleteActivityMutation.mutate(deleteActivityTarget.activityId, {
            onSuccess: () => setDeleteActivityTarget(null),
          });
        }}
        title="Excluir tarefa"
        message={`Tem certeza que quer excluir "${deleteActivityTarget?.title || 'esta tarefa'}"? Esta ação não pode ser desfeita.`}
        confirmLabel="Excluir"
        variant="danger"
        loading={deleteActivityMutation.isPending}
      />
    </div>
  );
}

/**
 * QueueTab — a Fila + o modal de execucao.
 *
 * Separada do calendario de proposito: a fila nao depende de recorte de datas,
 * nao puxa o Google e nao compartilha estado de navegacao. Trocar de aba nao
 * refaz o trabalho da outra.
 */
function QueueTab() {
  const navigate = useNavigate();
  const [executing, setExecuting] = useState(null);   // tarefa da fila em execucao
  const [justDoneId, setJustDoneId] = useState(null);
  const [formOpen, setFormOpen] = useState(false);
  const [advanceOff, setAdvanceOff] = useState(false); // ela disse "continua aqui"
  const [historyLead, setHistoryLead] = useState(null);
  const [lastContacted, setLastContacted] = useState(true);

  // De quem e a fila. Mora na URL ('member', a mesma chave do Calendario) pra
  // sobreviver a troca de aba e a um F5.
  const [viewingMemberId, setViewingMemberId] = useUrlState('member', '');
  const { isAdmin } = useCrmAccess();
  const { profile } = useProfile();
  const { data: allMembers = [] } = useTeamMembers();
  // Tira EU da lista: a primeira opcao ("Minha fila" / "Meu calendário") ja e
  // eu, entao aparecer de novo pelo nome oferece duas portas pro mesmo lugar —
  // e quem escolhe pelo nome nao entende por que a tela nao mudou.
  const crmMembers = useMemo(
    () => allMembers.filter(m => m.crmRole && m.authUserId && m.authUserId !== profile?.id),
    [allMembers, profile?.id],
  );

  // Nao-admin nunca sai da propria fila, mesmo com ?member= na URL — a barra de
  // endereco nao pode ser um contorno do controle de acesso.
  const alvo = isAdmin ? viewingMemberId : '';
  const membroVisto = alvo && alvo !== 'all' ? crmMembers.find(m => m.authUserId === alvo) : null;
  const visao = alvo === 'all'
    ? { all: true }
    : membroVisto ? { uid: membroVisto.authUserId, uname: membroVisto.name, memberId: membroVisto.id } : null;
  const escopoLabel = alvo === 'all'
    ? 'Fila do time inteiro — confira de quem é a tarefa antes de concluir.'
    : membroVisto ? `Mostrando a fila de ${membroVisto.name}.` : 'Estas são só as suas tarefas.';

  const completeMutation = useCompleteCrmActivity();
  const updateMutation = useUpdateCrmActivity();
  const moveMutation = useMoveCrmDeal();
  const snooze = useSnoozeActivity();

  // Proxima etapa do lead — so consultada quando a tarefa esta aberta.
  const { data: advance } = useNextStage(executing?.dealId || null);

  // Proximo toque do MESMO lead — consultado no BANCO, nao na fila carregada:
  // a fila so tem atrasadas e hoje, e o proximo da cadencia quase sempre e
  // amanha ou depois. Procurando na fila, a confirmacao dizia "nao ha mais
  // contato agendado" com a cadencia inteira pela frente.
  // Quando "nao atendeu", ESTE e o "quando tentar de novo": a cadencia ja
  // agendou a proxima tentativa, entao nao ha nada pra ela decidir.
  const { data: nextActivity } = useNextActivityForLead({
    dealId: executing?.dealId || null,
    contactId: executing?.contactId || null,
    after: executing?.startDate || null,
  });

  // Script/cenarios do passo que gerou a tarefa aberta. So um id — a fila
  // inteira nao precisa dos scripts, so a que esta sendo executada.
  const { data: stepsById = {} } = usePlaybookSteps(executing?.stageStepId ? [executing.stageStepId] : []);
  const step = executing?.stageStepId ? stepsById[executing.stageStepId] || null : null;

  const close = useCallback(() => {
    setExecuting(null); setJustDoneId(null); setAdvanceOff(false);
  }, []);

  const handlePostpone = useCallback((task, date) => {
    snooze.mutate({ id: task.id, start: date.toISOString() }, {
      onSuccess: () => toast(`Adiada pra ${date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })} às ${date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`, 'success'),
    });
  }, [snooze]);

  return (
    <div className="flex-1 min-h-0 overflow-y-auto">
      <div className="flex items-center justify-end gap-2 mb-3 flex-wrap">
        {/* Ver a fila de outra pessoa e privilegio de admin, igual ao
            Calendario: a cadencia de um lead e trabalho de quem o atende, e
            expor a fila alheia por padrao seria vigilancia, nao gestao. */}
        {isAdmin && crmMembers.length > 0 && (
          <select
            value={viewingMemberId}
            onChange={(e) => setViewingMemberId(e.target.value)}
            title="Ver a fila de"
            className="text-xs bg-white dark:bg-slate-800 border border-slate-200/70 dark:border-white/10 rounded-lg px-2 py-2 text-slate-600 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-fyness-primary"
          >
            <option value="">Minha fila</option>
            <option value="all">Todos os vendedores</option>
            {crmMembers.map(m => (
              <option key={m.authUserId} value={m.authUserId}>{m.name}</option>
            ))}
          </select>
        )}
        <button onClick={() => setFormOpen(true)}
          className="flex items-center gap-1.5 px-3 py-2 text-sm font-semibold bg-fyness-primary hover:bg-fyness-secondary text-white rounded-lg shadow-sm">
          <Plus size={15} /> Nova tarefa
        </button>
      </div>

      <WorkQueue
        visao={visao}
        escopoLabel={escopoLabel}
        membros={crmMembers}
        onExecute={(t) => { setJustDoneId(null); setExecuting(t); }}
        onPostpone={handlePostpone}
        onOpenLead={(id) => navigate(`/crm/deals/${id}`)}
        onGoToCalendar={() => navigate('/crm/agenda?visao=cal')}
        busy={snooze.isPending}
      />

      {executing && (
        <ExecuteTaskModal
          open
          onClose={close}
          activity={{ ...executing, contactPhone: executing.phone }}
          step={step}
          nextActivity={nextActivity}
          justDone={justDoneId === executing.id}
          isPending={completeMutation.isPending || updateMutation.isPending}
          onOpenLead={(id) => { close(); navigate(`/crm/deals/${id}`); }}
          onOpenHistory={(act) => setHistoryLead({ dealId: act.dealId || null, contactId: act.contactId || null })}
          onCorrect={() => setJustDoneId(null)}
          // O convite de avancar so faz sentido quando ela FALOU com o lead:
          // depois de "não atendeu" não houve conversa que justifique mover.
          advance={!advanceOff && lastContacted ? advance : null}
          advancing={moveMutation.isPending}
          onDismissAdvance={() => setAdvanceOff(true)}
          onAdvance={(stage) => {
            moveMutation.mutate(
              { dealId: executing.dealId, stageId: stage.id },
              { onSuccess: () => { setAdvanceOff(true); close(); } },
            );
          }}
          onSubmit={({ input, output, contacted }) => {
            if (executing.completed) {
              updateMutation.mutate(
                { id: executing.id, updates: { deliveryInput: input, deliveryReport: output } },
                { onSuccess: close },
              );
            } else {
              setLastContacted(contacted !== false);
              completeMutation.mutate({ id: executing.id, input, output, contacted }, {
                // Não fecha: a confirmação é onde ela decide se o lead avançou
                // de etapa — e, quando não atendeu, quando vai tentar de novo.
                onSuccess: () => setJustDoneId(executing.id),
              });
            }
          }}
        />
      )}

      {/* Historico do lead sem sair da Agenda: a execucao continua sendo aqui,
          o painel e so consulta. */}
      {historyLead && (
        <div className="fixed inset-0 z-[55] flex justify-end" role="dialog" aria-modal="true">
          <div className="absolute inset-0 bg-slate-900/40 dark:bg-black/60 backdrop-blur-sm"
            onClick={() => setHistoryLead(null)} />
          <aside className="relative w-full sm:max-w-[400px] h-full bg-white/95 dark:bg-slate-900/90 backdrop-blur-2xl border-l border-white/60 dark:border-white/10 shadow-glass-lg overflow-hidden animate-scale-in">
            <LeadHistoryPanel
              selected={historyLead}
              onClose={() => setHistoryLead(null)}
              onOpenLead={(lead) => lead.dealId && navigate(`/crm/deals/${lead.dealId}`)}
            />
          </aside>
        </div>
      )}

      {/* Tarefa nova nasce pra quem esta sendo VISTO, nao pra quem clicou: numa
          fila alheia, criar sempre pra si mesmo era criar no lugar errado. */}
      <ActivityFormModal
        open={formOpen}
        onClose={() => setFormOpen(false)}
        activity={null}
        defaultAssignedTo={membroVisto?.authUserId || undefined}
        defaultAssignedToName={membroVisto?.name || undefined}
      />
    </div>
  );
}

export default function CrmAgendaPage() {
  // Default = 'fila'. A Agenda e o nivel de EXECUCAO, entao a tela tem que
  // abrir respondendo "o que eu faco agora" — nao com um mes pra interpretar.
  // 'mine' (o antigo "Meu Dia") continua valendo e cai no Calendario, pra nao
  // quebrar link salvo.
  //
  // EXCECAO: link que traz lead ou data (?dealId, ?contactId, ?date, ?view)
  // esta pedindo o CALENDARIO — so ele sabe ler esses params. Sem esta guarda,
  // "Ver na Agenda" e "Executar na Agenda" caiam na Fila, que ignora tudo e
  // abre a lista generica: o lead que a pessoa clicou simplesmente nao aparecia.
  const [sp] = useSearchParams();
  const temAlvo = ['dealId', 'contactId', 'date', 'view'].some(k => sp.get(k));
  const [rawTab, setTab] = useUrlState('visao', temAlvo ? 'cal' : 'fila');
  const tab = rawTab === 'mine' ? 'cal' : rawTab;

  return (
    <div className={tab !== 'time' && tab !== 'team' ? 'h-full flex flex-col' : ''}>
      <CrmPageHeader
        title="Agenda"
        subtitle="O que fazer agora"
        actions={
          <div className="flex items-center gap-1 p-1 rounded-xl bg-slate-100/80 dark:bg-slate-800/60">
            <TabButton active={tab === 'fila'} onClick={() => setTab('fila')}>Fila</TabButton>
            <TabButton active={tab === 'cal'} onClick={() => setTab('cal')}>Calendário</TabButton>
            <TabButton active={tab === 'time' || tab === 'team'} onClick={() => setTab('time')}>Time</TabButton>
          </div>
        }
      />

      {tab === 'fila' ? (
        <QueueTab />
      ) : tab === 'cal' ? (
        <MyDayCalendar />
      ) : (
        <div className="max-w-6xl mx-auto space-y-6">
          <div className="crm-glass rounded-2xl p-5">
            <TeamDailyBriefing />
          </div>
          <div className="crm-glass rounded-2xl p-5">
            <TeamActivitiesTable />
          </div>
        </div>
      )}
    </div>
  );
}
