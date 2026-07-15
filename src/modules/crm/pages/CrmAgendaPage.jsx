/**
 * CrmAgendaPage - Agenda do CRM: controle do dia a dia, num lugar só.
 *
 * 2 visões (toggle "Meu Dia" / "Time"), pra não espalhar o dia a dia em 3
 * telas diferentes (Agenda, Atividades e Daily viravam 3 destinos separados
 * pro mesmo tipo de coisa — controle de atividade):
 *
 *   Meu Dia - calendário (mês/semana/dia/lista) + histórico do lead.
 *             Integra com o Google Calendar de forma bidirecional: as
 *             atividades do CRM já são espelhadas pro Google (push, em
 *             crmActivitiesService) e aqui também PUXAMOS os eventos do
 *             Google (pull, useGCalEvents) pra mostrar junto.
 *   Time     - placar do time (ligações/reuniões/contratos, meta do mês,
 *             agendado/atrasados do time inteiro) + tabela buscável de
 *             todas as atividades (qualquer vendedor, qualquer período).
 */

import { useState, useMemo, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Plus, Link2, Eye, EyeOff } from 'lucide-react';
import { CrmPageHeader, CrmConfirmDialog } from '../components/ui';
import CrmCalendar from '../components/agenda/CrmCalendar';
import LeadHistoryPanel from '../components/agenda/LeadHistoryPanel';
import { TeamDailyBriefing } from '../components/agenda/TeamDailyBriefing';
import { TeamActivitiesTable } from '../components/agenda/TeamActivitiesTable';
import { ActivityFormModal } from '../components/ActivityFormModal';
import { CompleteActivityModal } from '../components/CompleteActivityModal';
import { useCrmCalendarActivities, useCompleteCrmActivity, useDeleteCrmActivity, useUpdateCrmActivity } from '../hooks/useCrmQueries';
import { useGCalEvents, useGCalStatus } from '../../../hooks/queries';
import { connectGCal } from '../../../lib/googleCalendarService';
import { useProfile } from '../../../hooks/useProfile';
import { namesMatch } from '../../../lib/kpiUtils';
import { useUrlState } from '../../../hooks/useUrlState';
import { useTeamMembers } from '../../../hooks/queries';
import { useCrmAccess } from '../hooks/useCrmAccess';

const startOfDay = (d) => { const x = new Date(d); x.setHours(0, 0, 0, 0); return x; };
const addDays = (d, n) => { const x = new Date(d); x.setDate(x.getDate() + n); return x; };

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
  const crmMembers = useMemo(() => allMembers.filter(m => m.crmRole && m.authUserId), [allMembers]);

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
    const d = new Date(currentDate);
    if (view === 'month') d.setMonth(d.getMonth() + dir);
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
    // Clicar abre o HISTÓRICO COMPLETO do lead (timeline + "a fazer" + relato de
    // hoje) como modal. Esse é o comportamento esperado.
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
              : 'text-slate-400 dark:text-slate-500 border-slate-200/70 dark:border-white/10 hover:text-slate-600 dark:hover:text-slate-300'
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

      <CrmConfirmDialog
        open={!!deleteActivityTarget}
        onClose={() => setDeleteActivityTarget(null)}
        onConfirm={() => {
          deleteActivityMutation.mutate(deleteActivityTarget.activityId, {
            onSuccess: () => setDeleteActivityTarget(null),
          });
        }}
        title="Excluir atividade"
        message={`Tem certeza que deseja excluir "${deleteActivityTarget?.title || 'esta atividade'}"? Esta ação não pode ser desfeita.`}
        confirmLabel="Excluir"
        variant="danger"
        loading={deleteActivityMutation.isPending}
      />
    </div>
  );
}

export default function CrmAgendaPage() {
  const [tab, setTab] = useUrlState('visao', 'mine');
  const isMine = tab !== 'team';

  return (
    <div className={isMine ? 'h-full flex flex-col' : ''}>
      <CrmPageHeader
        title="Agenda"
        subtitle="Controle do seu dia e do time"
        actions={
          <div className="flex items-center gap-1 p-1 rounded-xl bg-slate-100/80 dark:bg-slate-800/60">
            <TabButton active={isMine} onClick={() => setTab('mine')}>Meu Dia</TabButton>
            <TabButton active={!isMine} onClick={() => setTab('team')}>Time</TabButton>
          </div>
        }
      />

      {isMine ? (
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
