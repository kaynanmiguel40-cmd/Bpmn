/**
 * RoutinePage - Minha Rotina (O.S. pessoais)
 *
 * Mostra as O.S. ligadas ao usuario logado em 2 colunas:
 * - Disponiveis: tudo que ainda nao terminei (a fazer + em andamento)
 * - Concluidas: finalizadas
 */

import { useState, useMemo, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { useOSOrders, useOSProjects, useTeamMembers, useOSBlocks } from '../../hooks/queries';
import { updateOSOrder, joinOSOrder } from '../../lib/osService';
import { setBlockStatus } from '../../lib/osBlocksService';
import { namesMatch, isAssignedTo } from '../../lib/kpiUtils';
import { useProfile } from '../../hooks/useProfile';
import { useAuth } from '../../contexts/AuthContext';
import { notifyOSCompleted } from '../../lib/notificationTriggers';
import { PRIORITIES, ROUTINE_COLUMNS as COLUMNS } from '../../constants/colors';
import { formatDateShortMonth as formatDate, formatCurrency } from '../../lib/formatters';
import { sortByDeadline, sortByActualEnd } from '../../lib/orderSorting';
import { toast } from '../../contexts/ToastContext';

function formatMinutesPrev(min) {
  if (!min || min <= 0) return null;
  const h = Math.floor(min / 60);
  const m = min % 60;
  if (h > 0 && m > 0) return `${h}h${String(m).padStart(2, '0')}`;
  if (h > 0) return `${h}h`;
  return `${m}min`;
}

const BLOCK_STATUS_LABEL = { todo: 'A fazer', doing: 'Fazendo', done: 'Feito' };
const BLOCK_STATUS_NEXT = { todo: 'doing', doing: 'done', done: 'todo' };
const BLOCK_STATUS_STYLE = {
  todo:  'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-600',
  doing: 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-700',
  done:  'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-700',
};

export function RoutinePage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { data: orders = [], isLoading: loadingOrders } = useOSOrders();
  const { data: projects = [], isLoading: loadingProjects } = useOSProjects();
  const { data: teamMembers = [] } = useTeamMembers();
  const { data: allBlocks = [] } = useOSBlocks();
  const { profile, isLoading: loadingProfile } = useProfile();

  const { isManager } = useAuth();

  // Expenses form
  const [expenseOpen, setExpenseOpen] = useState(null); // orderId com form aberto
  const [expName, setExpName] = useState('');
  const [expValue, setExpValue] = useState('');
  const [expQty, setExpQty] = useState('1');

  // Seletor de membro (só disponível para managers/admins) — persistido na URL
  const [searchParams, setSearchParams] = useSearchParams();
  const selectedMember = searchParams.get('member') || 'me';
  const setSelectedMember = useCallback((value) => {
    setSearchParams(value === 'me' ? {} : { member: value }, { replace: true });
  }, [setSearchParams]);

  // Drag-and-drop state
  const [draggingId, setDraggingId] = useState(null);
  const [dragOverCol, setDragOverCol] = useState(null);
  const [dropTarget, setDropTarget] = useState(null); // { cardId, position: 'before'|'after' }

  // Semanas colapsadas no Concluido (Set de weekKeys colapsados)
  const [collapsedWeeks, setCollapsedWeeks] = useState(new Set());

  const loading = loadingOrders || loadingProjects || loadingProfile;

  const userName = profile.name || '';

  // Filtrar O.S. pelo membro selecionado.
  // Visibilidade por modo:
  //   pool  -> aparece pra todos (qualquer um pode pegar)
  //   solo  -> aparece pro atribuido
  //   team  -> aparece pra cada participante (lista em order.participants[]);
  //            status do card = % feita dos GRUPOS atribuidos a ele
  const myOrders = useMemo(() => {
    let filterName = null;
    let filterId = null;
    if (selectedMember === 'me') {
      if (!userName) return { todo: [], doing: [], done: [], effById: {} };
      filterName = userName;
      filterId = profile.id || null;
    } else if (selectedMember !== 'all') {
      const m = teamMembers.find(m => m.id === selectedMember);
      filterName = m?.name || null;
      filterId = m?.authUserId || null;
    }

    // Grupos atribuidos a ESTE usuario nesta O.S. (multi-responsavel + legado).
    const myGroups = (o) => {
      const groups = Array.isArray(o.checklistGroups) ? o.checklistGroups : [];
      return groups.filter(g => {
        // Modelo novo: array de assignees
        const assignees = Array.isArray(g.assignees) ? g.assignees : [];
        if (assignees.some(a =>
          (filterId && a.id === filterId) ||
          (filterName && namesMatch(a.name, filterName))
        )) return true;
        // Legado: assigneeId/assigneeName diretos
        return (filterId && g.assigneeId === filterId) ||
               (filterName && namesMatch(g.assigneeName, filterName));
      });
    };

    // Status efetivo da O.S. pra ESTE usuario
    const effectiveStatus = (o) => {
      if (o.mode === 'team') {
        const mine = myGroups(o);
        if (mine.length === 0) return null; // nao tem grupo -> nao aparece
        const checklist = Array.isArray(o.checklist) ? o.checklist : [];
        const myItems = checklist.filter(i =>
          mine.some(g => (g.name || '') === (i.group || ''))
        );
        if (myItems.length === 0) return 'available';
        const done = myItems.filter(i => i.done).length;
        if (done === myItems.length) return 'done';
        if (done > 0) return 'in_progress';
        return 'available';
      }
      return o.status || 'available';
    };

    const visibleToUser = (o) => {
      if (!filterName) return true; // 'all'
      if (o.mode === 'pool') return true;
      if (o.mode === 'team') {
        // Vejo a O.S. se: tenho grupo atribuido OU estou em participants[]
        if (myGroups(o).length > 0) return true;
        const participants = Array.isArray(o.participants) ? o.participants : [];
        return participants.some(p =>
          (filterId && p.id === filterId) ||
          (filterName && namesMatch(p.name, filterName))
        );
      }
      // solo
      return isAssignedTo(o.assignedTo, filterName) || namesMatch(o.assignee, filterName);
    };

    // Duas colunas: Disponiveis (available + in_progress) e Concluidas (done).
    // `doing` fica vazio so pra nao quebrar referencias antigas (sequenceMap/totalCount).
    // effById guarda o status efetivo de cada O.S. pra decidir os botoes do card
    // (Pegar p/ available, Concluir + Despesas p/ in_progress) ja que nao ha mais
    // uma coluna 'doing' pra distinguir.
    const buckets = { todo: [], doing: [], done: [], effById: {} };
    for (const o of orders) {
      if (!visibleToUser(o)) continue;
      const eff = effectiveStatus(o);
      if (!eff) continue;
      buckets.effById[o.id] = eff;
      if (eff === 'done') buckets.done.push(o);
      else buckets.todo.push(o); // available + in_progress -> Disponiveis
    }
    return buckets;
  }, [orders, userName, selectedMember, teamMembers, profile.id]);

  // Modo somente-leitura: manager vendo outro colaborador
  const isReadOnly = selectedMember !== 'me';

  // Agrupar blocos por O.S. (sort_order asc dentro de cada grupo)
  const blocksByOrder = useMemo(() => {
    const map = {};
    for (const b of allBlocks) {
      if (!map[b.orderId]) map[b.orderId] = [];
      map[b.orderId].push(b);
    }
    for (const arr of Object.values(map)) {
      arr.sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));
    }
    return map;
  }, [allBlocks]);

  const handleToggleBlock = useCallback(async (block) => {
    const next = BLOCK_STATUS_NEXT[block.status] || 'todo';
    await setBlockStatus(block.id, next);
    queryClient.invalidateQueries({ queryKey: ['osBlocks'] });
  }, [queryClient]);

  // Mapa de sequencia: ordenado por data de conclusao prevista
  const sequenceMap = useMemo(() => {
    const active = [...myOrders.todo, ...myOrders.doing].sort(sortByDeadline);
    const map = {};
    active.forEach((o, i) => { map[o.id] = i + 1; });
    return map;
  }, [myOrders]);

  const handleClaim = async (orderId) => {
    if (!profile.id) {
      toast.error('Perfil nao carregado.');
      return;
    }

    // Uma O.S. EM ANDAMENTO por pessoa: se você já tem uma rodando (in_progress
    // e não pausada), bloqueia pegar outra — pause ou finalize a atual primeiro.
    const mine = (o) =>
      o.assignedTo === profile.id ||
      namesMatch(o.assignee, userName) ||
      (Array.isArray(o.participants) && o.participants.some(p => p.id === profile.id || namesMatch(p.name, userName)));
    const running = orders.find(o => o.id !== orderId && o.status === 'in_progress' && !o.pausedAt && mine(o));
    if (running) {
      toast.warning(`Você já está com a O.S. "${running.title}" em andamento. Pause ou finalize ela antes de pegar outra.`);
      return;
    }

    // joinOSOrder cobre os 4 cenarios: pool->solo, solo-self, solo-other->team, team
    const updated = await joinOSOrder(orderId, { id: profile.id, name: userName });

    // Inicializar startedAt da primeira tarefa nao-feita (so faz sentido em solo da gente)
    if (updated && (updated.mode === 'solo' || !updated.mode)) {
      const order = orders.find(o => o.id === orderId);
      if (order?.checklist?.length > 0) {
        const now = new Date().toISOString();
        const firstUndone = order.checklist.findIndex(i => !i.done);
        if (firstUndone >= 0) {
          await updateOSOrder(orderId, {
            checklist: order.checklist.map((i, idx) =>
              idx === firstUndone ? { ...i, startedAt: now } : i
            ),
          });
        }
      }
    }

    queryClient.invalidateQueries({ queryKey: ['osOrders'] });
    queryClient.invalidateQueries({ queryKey: ['osBlocks'] });
  };

  const handleFinish = async (orderId) => {
    const order = orders.find(o => o.id === orderId);
    // Em team: marca todos os itens dos MEUS grupos como done.
    // A O.S. so vai pra done quando todos os itens (de todos os grupos) estiverem
    // done E todos os participantes assinarem (gating no documento).
    if (order?.mode === 'team') {
      const groups = Array.isArray(order.checklistGroups) ? order.checklistGroups : [];
      const myGroupNames = groups
        .filter(g =>
          (profile.id && g.assigneeId === profile.id) ||
          namesMatch(g.assigneeName, userName)
        )
        .map(g => g.name || '');
      if (myGroupNames.length === 0) return;
      const checklist = Array.isArray(order.checklist) ? order.checklist : [];
      const now = new Date().toISOString();
      const newChecklist = checklist.map(i =>
        myGroupNames.includes(i.group || '') && !i.done
          ? { ...i, done: true, completedAt: now }
          : i
      );
      await updateOSOrder(orderId, { checklist: newChecklist });
      queryClient.invalidateQueries({ queryKey: ['osOrders'] });
      return;
    }
    const updated = await updateOSOrder(orderId, {
      status: 'done',
      actualEnd: new Date().toISOString(),
    });
    if (updated) {
      queryClient.invalidateQueries({ queryKey: ['osOrders'] });
      notifyOSCompleted(updated, teamMembers, userName, profile.id);
    }
  };

  const handleReopen = async (orderId) => {
    const order = orders.find(o => o.id === orderId);
    if (order?.mode === 'team') {
      const groups = Array.isArray(order.checklistGroups) ? order.checklistGroups : [];
      const myGroupNames = groups
        .filter(g =>
          (profile.id && g.assigneeId === profile.id) ||
          namesMatch(g.assigneeName, userName)
        )
        .map(g => g.name || '');
      if (myGroupNames.length === 0) return;
      const checklist = Array.isArray(order.checklist) ? order.checklist : [];
      const newChecklist = checklist.map(i =>
        myGroupNames.includes(i.group || '') && i.done
          ? { ...i, done: false, completedAt: null }
          : i
      );
      await updateOSOrder(orderId, { checklist: newChecklist });
      queryClient.invalidateQueries({ queryKey: ['osOrders'] });
      return;
    }
    const updated = await updateOSOrder(orderId, {
      status: 'in_progress',
      actualEnd: '',
    });
    if (updated) {
      queryClient.invalidateQueries({ queryKey: ['osOrders'] });
    }
  };

  // ---- Expenses ----
  const handleAddExpense = async (orderId) => {
    const name = expName.trim();
    const value = parseFloat(expValue) || 0;
    const qty = parseInt(expQty) || 1;
    if (!name || value <= 0) return;

    const order = orders.find(o => o.id === orderId);
    if (!order) return;

    const newExpenses = [...(order.expenses || []), { name, value, quantity: qty }];
    const updated = await updateOSOrder(orderId, { expenses: newExpenses });
    if (updated) {
      queryClient.invalidateQueries({ queryKey: ['osOrders'] });
    }
    setExpName('');
    setExpValue('');
    setExpQty('1');
  };

  const handleRemoveExpense = async (orderId, index) => {
    const order = orders.find(o => o.id === orderId);
    if (!order) return;

    const newExpenses = (order.expenses || []).filter((_, i) => i !== index);
    const updated = await updateOSOrder(orderId, { expenses: newExpenses });
    if (updated) {
      queryClient.invalidateQueries({ queryKey: ['osOrders'] });
    }
  };

  const calcExpensesTotal = (expenses) => {
    if (!expenses || expenses.length === 0) return 0;
    return expenses.reduce((acc, e) => acc + (e.value || 0) * (e.quantity || 1), 0);
  };

  const getProjectName = (projectId) => {
    return projects.find(p => p.id === projectId)?.name || null;
  };

  // ---- Agrupar Concluidos por semana (Sab-Sex) ----
  const groupByWeek = useCallback((doneItems) => {
    // Achar o sabado mais recente (inicio da semana atual)
    const today = new Date();
    const dayOfWeek = today.getDay(); // 0=dom, 6=sab
    const daysSinceSat = dayOfWeek >= 6 ? dayOfWeek - 6 : dayOfWeek + 1;
    const currentWeekStart = new Date(today);
    currentWeekStart.setHours(0, 0, 0, 0);
    currentWeekStart.setDate(today.getDate() - daysSinceSat);

    const groups = new Map(); // weekKey -> { label, start, end, items }

    for (const item of doneItems) {
      const endDate = item.actualEnd ? new Date(item.actualEnd) : null;
      if (!endDate || isNaN(endDate.getTime())) {
        // Sem data -> joga na semana atual
        const key = 'current';
        if (!groups.has(key)) {
          groups.set(key, { key, label: 'Esta Semana', items: [], isCurrent: true, sortTs: Infinity });
        }
        groups.get(key).items.push(item);
        continue;
      }

      // Calcular qual sabado inicia a semana deste item
      const d = new Date(endDate);
      d.setHours(0, 0, 0, 0);
      const dDay = d.getDay();
      const dSinceSat = dDay >= 6 ? dDay - 6 : dDay + 1;
      const weekStart = new Date(d);
      weekStart.setDate(d.getDate() - dSinceSat);

      const isCurrent = weekStart.getTime() === currentWeekStart.getTime();
      const key = isCurrent ? 'current' : weekStart.toISOString().slice(0, 10);

      if (!groups.has(key)) {
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekStart.getDate() + 6);
        const fmt = (dt) => `${String(dt.getDate()).padStart(2, '0')}/${String(dt.getMonth() + 1).padStart(2, '0')}`;
        const label = isCurrent ? 'Esta Semana' : `${fmt(weekStart)} – ${fmt(weekEnd)}`;
        groups.set(key, { key, label, items: [], isCurrent, sortTs: weekStart.getTime() });
      }
      groups.get(key).items.push(item);
    }

    // Ordenar items dentro de cada semana por actualEnd (mais recente primeiro)
    for (const group of groups.values()) {
      group.items.sort(sortByActualEnd);
    }

    // Ordenar: semana atual primeiro, depois mais recentes
    return [...groups.values()].sort((a, b) => {
      if (a.isCurrent) return -1;
      if (b.isCurrent) return 1;
      return b.sortTs - a.sortTs;
    });
  }, []);

  const toggleWeek = useCallback((weekKey) => {
    setCollapsedWeeks(prev => {
      const next = new Set(prev);
      if (next.has(weekKey)) next.delete(weekKey);
      else next.add(weekKey);
      return next;
    });
  }, []);

  // ---- Drag-and-drop handlers ----
  const handleDragStart = useCallback((id) => setDraggingId(id), []);
  const handleDragEnd = useCallback(() => {
    setDraggingId(null);
    setDragOverCol(null);
    setDropTarget(null);
  }, []);
  const handleCardDragOver = useCallback((cardId, position) => {
    setDropTarget({ cardId, position });
  }, []);

  const handleDrop = async (draggedId, columnId, targetCardId, position) => {
    // Manager visualizando outro colaborador: somente leitura, nao pode editar a O.S. dele
    if (isReadOnly) return;
    const draggedOrder = orders.find(o => o.id === draggedId);
    if (!draggedOrder) return;

    // Determinar status alvo da coluna (so 2 colunas: Disponiveis e Concluidas).
    // - O.S. de TIME: coluna vem do checklist (effectiveStatus), nunca reescreve
    //   o status global que Financeiro/KPIs leem — drop e so reordenacao.
    // - Concluidas: marca 'done'.
    // - Disponiveis: reabre (done -> in_progress, igual ao botao Reabrir) OU mantem
    //   o status atual ao so reordenar (nao rebaixa um 'in_progress' pra available).
    const newStatus = draggedOrder.mode === 'team'
      ? draggedOrder.status
      : columnId === 'done'
        ? 'done'
        : (draggedOrder.status === 'done' ? 'in_progress' : draggedOrder.status);
    const statusChanged = draggedOrder.status !== newStatus;
    // Concluir via drag deve registrar actualEnd como o botao "Concluir"; sair de
    // concluido limpa ('' -> null no normalize). So mexe quando o status muda.
    const completingNow = (statusChanged && newStatus === 'done') ? new Date().toISOString() : '';

    // Pegar cards da coluna destino (sem o card arrastado)
    const colCards = columnData[columnId].filter(o => o.id !== draggedId);

    // Determinar posicao de insercao
    let insertIndex = colCards.length;
    if (targetCardId) {
      const targetIdx = colCards.findIndex(o => o.id === targetCardId);
      if (targetIdx !== -1) {
        insertIndex = position === 'before' ? targetIdx : targetIdx + 1;
      }
    }

    // Inserir na posicao
    colCards.splice(insertIndex, 0, draggedOrder);

    // Calcular novos sortOrders
    const newSortMap = {};
    colCards.forEach((o, i) => { newSortMap[o.id] = i; });

    // Atualizar UI otimisticamente
    const updatedOrders = orders.map(o => {
      if (o.id === draggedId) {
        return {
          ...o,
          status: newStatus,
          sortOrder: newSortMap[o.id] ?? o.sortOrder,
          ...(statusChanged ? { actualEnd: completingNow } : {}),
        };
      }
      if (newSortMap[o.id] !== undefined) {
        return { ...o, sortOrder: newSortMap[o.id] };
      }
      return o;
    });
    queryClient.setQueryData(['osOrders'], updatedOrders);

    // Persistir no banco - apenas cards que mudaram
    const batchUpdates = [];
    batchUpdates.push({
      id: draggedId,
      ...(statusChanged ? { status: newStatus, actualEnd: completingNow } : {}),
      sortOrder: newSortMap[draggedId] ?? draggedOrder.sortOrder,
    });
    for (const [id, sortOrder] of Object.entries(newSortMap)) {
      if (id === draggedId) continue;
      const original = orders.find(o => o.id === id);
      if (original && (original.sortOrder ?? 0) !== sortOrder) {
        batchUpdates.push({ id, sortOrder });
      }
    }
    await Promise.all(batchUpdates.map(u => updateOSOrder(u.id, u)));

    // Undo toast quando arrastar para concluido
    if (statusChanged && newStatus === 'done') {
      const previousStatus = draggedOrder.status;
      toast.undo(`O.S. #${draggedOrder.number} marcada como concluida`, async () => {
        await updateOSOrder(draggedId, { status: previousStatus, actualEnd: null });
        queryClient.invalidateQueries({ queryKey: ['osOrders'] });
      });
    }
  };

  const doneWeeks = useMemo(() => groupByWeek(myOrders.done), [myOrders.done, groupByWeek]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const columnData = {
    todo: [...myOrders.todo].sort(sortByDeadline),
    doing: [...myOrders.doing].sort(sortByDeadline),
    done: [...myOrders.done].sort(sortByActualEnd),
  };

  const totalCount = myOrders.todo.length + myOrders.doing.length + myOrders.done.length;

  const viewLabel =
    selectedMember === 'me'  ? userName :
    selectedMember === 'all' ? 'Todos os colaboradores' :
    (teamMembers.find(m => m.id === selectedMember)?.name || '');

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">
            {selectedMember === 'me' ? 'Minha Rotina' : 'Rotina da Equipe'}
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            {selectedMember === 'me' && !userName ? (
              'Configure seu nome nas Configuracoes para ver suas O.S.'
            ) : selectedMember === 'me' ? (
              <>{totalCount} O.S. no total</>
            ) : (
              <>O.S. de <strong className="text-slate-700 dark:text-slate-200">{viewLabel}</strong> — {totalCount} no total</>
            )}
          </p>
        </div>

        {/* Seletor de membro (apenas managers/admins) */}
        {isManager && (
          <div className="flex items-center gap-2">
            <label className="text-sm text-slate-500 dark:text-slate-400 whitespace-nowrap">Visualizando:</label>
            <select
              value={selectedMember}
              onChange={e => setSelectedMember(e.target.value)}
              className="text-sm border border-slate-200 dark:border-slate-600 rounded-lg px-3 py-1.5 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-fyness-primary/30"
            >
              <option value="me">Minha Rotina</option>
              <option value="all">Todos os Colaboradores</option>
              {teamMembers
                .filter(m => !namesMatch(m.name, userName))
                .map(m => (
                  <option key={m.id} value={m.id}>{m.name}</option>
                ))
              }
            </select>
          </div>
        )}
      </div>

      {!userName && selectedMember === 'me' ? (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 bg-slate-100 dark:bg-slate-700 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-slate-400 dark:text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-slate-700 dark:text-slate-200 mb-2">Perfil nao configurado</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">Preencha seu nome nas Configuracoes para ver suas O.S.</p>
            <button
              onClick={() => navigate('/settings')}
              className="px-4 py-2 bg-fyness-primary text-white rounded-lg hover:bg-fyness-secondary transition-colors text-sm font-medium"
            >
              Ir para Configuracoes
            </button>
          </div>
        </div>
      ) : (
        /* Kanban Board */
        <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4 min-h-0">
          {COLUMNS.map((column) => {
            const items = columnData[column.id];
            const isColOver = dragOverCol === column.id && !dropTarget;
            const canDrag = !isReadOnly;
            return (
              <div
                key={column.id}
                className={`flex flex-col min-h-0 rounded-2xl overflow-hidden border-2 transition-all duration-200 ${
                  isColOver
                    ? 'border-fyness-primary bg-fyness-primary/5 shadow-glass-lg'
                    : 'border-transparent shadow-glass'
                }`}
                onDragOver={(e) => { e.preventDefault(); setDragOverCol(column.id); }}
                onDragEnter={(e) => { e.preventDefault(); setDragOverCol(column.id); }}
                onDragLeave={(e) => {
                  if (!e.currentTarget.contains(e.relatedTarget)) {
                    setDragOverCol(null);
                    setDropTarget(null);
                  }
                }}
                onDrop={(e) => {
                  e.preventDefault();
                  const draggedId = e.dataTransfer.getData('text/plain');
                  if (draggedId) {
                    handleDrop(draggedId, column.id, dropTarget?.cardId, dropTarget?.position);
                  }
                  setDragOverCol(null);
                  setDropTarget(null);
                  setDraggingId(null);
                }}
              >
                {/* Column Header */}
                <div className={`bg-gradient-to-r ${column.color} px-4 py-2.5 flex items-center justify-between`}>
                  <h3 className="text-sm font-bold text-white">{column.title}</h3>
                  <span className="bg-white/20 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                    {items.length}
                  </span>
                </div>

                {/* Cards */}
                <div className={`flex-1 bg-white/40 dark:bg-slate-900/40 backdrop-blur-md p-3 space-y-0 overflow-y-auto border border-t-0 border-slate-200/60 dark:border-white/10 min-h-[100px] ${isColOver ? 'bg-fyness-primary/5' : ''}`}>
                  {items.length === 0 && (
                    <div className={`flex items-center justify-center h-32 text-sm ${isColOver ? 'text-fyness-primary font-medium' : 'text-slate-400 dark:text-slate-500 italic'}`}>
                      {isColOver ? 'Soltar aqui' : column.emptyText}
                    </div>
                  )}

                  {/* Agrupamento semanal para coluna Concluido */}
                  {column.id === 'done' && items.length > 0 && doneWeeks.map((week) => {
                    const isCollapsed = !week.isCurrent && collapsedWeeks.has(week.key);
                    // Semanas passadas iniciam colapsadas por padrao (lazy: se nunca clicou, colapsar)
                    const effectiveCollapsed = !week.isCurrent && !collapsedWeeks.has(`_opened_${week.key}`) ? true : isCollapsed;
                    return (
                      <div key={week.key} className="mb-2">
                        <button
                          onClick={() => {
                            if (!week.isCurrent) {
                              // Toggle: se estava "nunca aberto", marca como aberto
                              setCollapsedWeeks(prev => {
                                const next = new Set(prev);
                                const openedKey = `_opened_${week.key}`;
                                if (!prev.has(openedKey)) {
                                  // Primeiro clique: abrir
                                  next.add(openedKey);
                                  next.delete(week.key);
                                } else if (prev.has(week.key)) {
                                  next.delete(week.key);
                                } else {
                                  next.add(week.key);
                                }
                                return next;
                              });
                            }
                          }}
                          className={`w-full flex items-center gap-2 px-2 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                            week.isCurrent
                              ? 'text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 cursor-default'
                              : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer'
                          }`}
                        >
                          {!week.isCurrent && (
                            <svg className={`w-3 h-3 transition-transform ${effectiveCollapsed ? '' : 'rotate-90'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                          )}
                          <span>{week.label}</span>
                          <span className={`ml-auto text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                            week.isCurrent
                              ? 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400'
                              : 'bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400'
                          }`}>{week.items.length}</span>
                        </button>
                        {!effectiveCollapsed && week.items.map((order) => {
                          const priority = PRIORITIES[order.priority] || PRIORITIES.medium;
                          const projectName = getProjectName(order.projectId);
                          const isDragging = draggingId === order.id;
                          const cardDropPos = dropTarget?.cardId === order.id ? dropTarget.position : null;
                          return (
                            <div key={order.id} className="py-1">
                              {cardDropPos === 'before' && (
                                <div className="h-1 bg-fyness-primary rounded-full mx-1 mb-1 animate-pulse" />
                              )}
                              <div
                                draggable={canDrag}
                                onDragStart={canDrag ? (e) => {
                                  e.dataTransfer.setData('text/plain', order.id);
                                  e.dataTransfer.effectAllowed = 'move';
                                  handleDragStart(order.id);
                                } : undefined}
                                onDragEnd={canDrag ? handleDragEnd : undefined}
                                onDragOver={canDrag ? (e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  const rect = e.currentTarget.getBoundingClientRect();
                                  const y = e.clientY - rect.top;
                                  const position = y < rect.height / 2 ? 'before' : 'after';
                                  handleCardDragOver(order.id, position);
                                } : undefined}
                                onClick={() => {
                                  if (!draggingId) navigate('/financial', { state: { openOsId: order.id } });
                                }}
                                className={`bg-white/90 dark:bg-slate-800/80 backdrop-blur-sm rounded-xl border border-slate-200/80 dark:border-slate-700/70 shadow-glass hover:shadow-glass-lg p-3 transition-all duration-200 group cursor-pointer ${
                                  isDragging ? 'opacity-40 scale-95 shadow-none' : 'hover:shadow-md hover:border-fyness-primary/30'
                                }`}
                              >
                                <div className="flex items-center justify-between mb-1.5">
                                  <div className="flex items-center gap-1.5">
                                    <span className="text-xs font-bold text-slate-400 dark:text-slate-500">O.S. #{order.number}</span>
                                  </div>
                                  <span className={`inline-flex items-center gap-1 text-[10px] font-medium px-1.5 py-0.5 rounded-full ${priority.color}`}>
                                    <span className={`w-1.5 h-1.5 rounded-full ${priority.dot}`} />
                                    {priority.label}
                                  </span>
                                </div>
                                <h4 className="text-sm font-semibold text-slate-800 dark:text-slate-100 mb-1">{order.title}</h4>
                                {isReadOnly && (order.assignee || order.assignedTo) && (
                                  <p className="text-[11px] text-purple-500 font-medium mb-0.5">{order.assignee || order.assignedTo}</p>
                                )}
                                {projectName && <p className="text-[11px] text-blue-500 font-medium mb-0.5">{projectName}</p>}
                                {order.client && <p className="text-[11px] text-slate-400 dark:text-slate-500">{order.client}</p>}
                                <div className="flex items-center gap-3 mt-2 text-[10px] text-slate-400 dark:text-slate-500">
                                  {order.estimatedStart && <span>Prev: {formatDate(order.estimatedStart)}</span>}
                                  {order.actualStart && <span className="text-green-500">Inicio: {formatDate(order.actualStart)}</span>}
                                  {order.actualEnd && <span className="text-emerald-600">Fim: {formatDate(order.actualEnd)}</span>}
                                </div>
                                {order.expenses && order.expenses.length > 0 && (
                                  <div className="mt-2">
                                    <div className="mb-1.5">
                                      <div className="flex items-center justify-between mb-1">
                                        <span className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Gastos</span>
                                        <span className="text-[10px] font-bold text-amber-600">{formatCurrency(calcExpensesTotal(order.expenses))}</span>
                                      </div>
                                      <div className="space-y-0.5">
                                        {order.expenses.map((exp, idx) => (
                                          <div key={idx} className="flex items-center justify-between text-[10px] bg-amber-50 dark:bg-amber-900/20 rounded px-1.5 py-0.5">
                                            <span className="text-slate-600 dark:text-slate-300 truncate mr-1">
                                              {exp.quantity > 1 && <span className="font-medium text-slate-500 dark:text-slate-400">{exp.quantity}x </span>}
                                              {exp.name}
                                            </span>
                                            <span className="font-medium text-amber-700">{formatCurrency(exp.value * (exp.quantity || 1))}</span>
                                          </div>
                                        ))}
                                      </div>
                                    </div>
                                  </div>
                                )}
                                <div className="mt-3 pt-2 border-t border-slate-100 dark:border-slate-700 flex items-center gap-2">
                                  {!isReadOnly && (
                                    <button
                                      onMouseDown={(e) => e.stopPropagation()}
                                      onClick={() => handleReopen(order.id)}
                                      className="flex-1 py-1.5 border border-slate-300 dark:border-slate-600 text-slate-600 dark:text-slate-300 text-xs rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors font-medium"
                                    >
                                      Reabrir
                                    </button>
                                  )}
                                </div>
                              </div>
                              {cardDropPos === 'after' && (
                                <div className="h-1 bg-fyness-primary rounded-full mx-1 mt-1 animate-pulse" />
                              )}
                            </div>
                          );
                        })}
                      </div>
                    );
                  })}

                  {column.id !== 'done' && items.map((order, idx) => {
                    const priority = PRIORITIES[order.priority] || PRIORITIES.medium;
                    const projectName = getProjectName(order.projectId);
                    const isDragging = draggingId === order.id;
                    const cardDropPos = dropTarget?.cardId === order.id ? dropTarget.position : null;
                    // Status efetivo: decide os botoes (sem coluna 'doing' pra separar).
                    const isStarted = myOrders.effById?.[order.id] === 'in_progress';

                    return (
                      <div key={order.id} className="py-1">
                        {cardDropPos === 'before' && (
                          <div className="h-1 bg-fyness-primary rounded-full mx-1 mb-1 animate-pulse" />
                        )}
                        <div
                          draggable={canDrag}
                          onDragStart={canDrag ? (e) => {
                            e.dataTransfer.setData('text/plain', order.id);
                            e.dataTransfer.effectAllowed = 'move';
                            handleDragStart(order.id);
                          } : undefined}
                          onDragEnd={canDrag ? handleDragEnd : undefined}
                          onDragOver={canDrag ? (e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            const rect = e.currentTarget.getBoundingClientRect();
                            const y = e.clientY - rect.top;
                            const position = y < rect.height / 2 ? 'before' : 'after';
                            handleCardDragOver(order.id, position);
                          } : undefined}
                          onClick={() => {
                            if (!draggingId) navigate('/financial', { state: { openOsId: order.id } });
                          }}
                          className={`bg-white/90 dark:bg-slate-800/80 backdrop-blur-sm rounded-xl border border-slate-200/80 dark:border-slate-700/70 shadow-glass hover:shadow-glass-lg p-3 transition-all duration-200 group cursor-pointer ${
                            isDragging ? 'opacity-40 scale-95 shadow-none' : 'hover:shadow-md hover:border-fyness-primary/30'
                          }`}
                        >
                        {/* Top row */}
                        <div className="flex items-center justify-between mb-1.5">
                          <div className="flex items-center gap-1.5">
                            {sequenceMap[order.id] && (
                              <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-fyness-primary text-white text-[10px] font-bold shrink-0">{sequenceMap[order.id]}</span>
                            )}
                            <span className="text-xs font-bold text-slate-400 dark:text-slate-500">O.S. #{order.number}</span>
                            {order.pausedAt && order.status === 'in_progress' && (
                              <span className="inline-flex items-center gap-0.5 text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400">
                                <svg className="w-2.5 h-2.5" fill="currentColor" viewBox="0 0 24 24"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" /></svg>
                                Pausado
                              </span>
                            )}
                          </div>
                          <span className={`inline-flex items-center gap-1 text-[10px] font-medium px-1.5 py-0.5 rounded-full ${priority.color}`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${priority.dot}`} />
                            {priority.label}
                          </span>
                        </div>

                        {/* Title */}
                        <h4 className="text-sm font-semibold text-slate-800 dark:text-slate-100 mb-1">{order.title}</h4>

                        {/* Responsavel (visivel apenas para manager vendo outra pessoa/todos) */}
                        {isReadOnly && (order.assignee || order.assignedTo) && (
                          <p className="text-[11px] text-purple-500 font-medium mb-0.5">
                            {order.assignee || order.assignedTo}
                          </p>
                        )}

                        {/* Project & Client */}
                        {projectName && (
                          <p className="text-[11px] text-blue-500 font-medium mb-0.5">{projectName}</p>
                        )}
                        {order.client && (
                          <p className="text-[11px] text-slate-400 dark:text-slate-500">{order.client}</p>
                        )}

                        {/* Dates */}
                        <div className="flex items-center gap-3 mt-2 text-[10px] text-slate-400 dark:text-slate-500">
                          {order.estimatedStart && (
                            <span>Prev: {formatDate(order.estimatedStart)}</span>
                          )}
                          {order.actualStart && (
                            <span className="text-green-500">Inicio: {formatDate(order.actualStart)}</span>
                          )}
                          {order.actualEnd && (
                            <span className="text-emerald-600">Fim: {formatDate(order.actualEnd)}</span>
                          )}
                        </div>

                        {/* Blocos da O.S. */}
                        {(blocksByOrder[order.id]?.length ?? 0) > 0 && (
                          <div className="mt-2 space-y-1">
                            {blocksByOrder[order.id].map((blk) => {
                              const prev = formatMinutesPrev(blk.estimatedMinutes);
                              return (
                                <div
                                  key={blk.id}
                                  className="flex items-center justify-between gap-2 px-2 py-1 rounded-md bg-slate-50 dark:bg-slate-900/40 border border-slate-100 dark:border-slate-700"
                                >
                                  <div className="min-w-0 flex-1">
                                    <div className="flex items-center gap-1.5">
                                      <span className="text-[11px] font-semibold text-slate-700 dark:text-slate-200 truncate">{blk.title}</span>
                                      {prev && <span className="text-[10px] text-slate-400 dark:text-slate-500">· {prev}</span>}
                                    </div>
                                    {blk.assigneeName && (
                                      <span className="text-[10px] text-purple-500">{blk.assigneeName}</span>
                                    )}
                                  </div>
                                  <button
                                    onMouseDown={(e) => e.stopPropagation()}
                                    onClick={(e) => { e.stopPropagation(); if (!isReadOnly) handleToggleBlock(blk); }}
                                    disabled={isReadOnly}
                                    title={isReadOnly ? '' : 'Clique para mudar status'}
                                    className={`text-[9px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full border ${BLOCK_STATUS_STYLE[blk.status] || BLOCK_STATUS_STYLE.todo} ${isReadOnly ? 'cursor-default' : 'hover:opacity-80 cursor-pointer'}`}
                                  >
                                    {BLOCK_STATUS_LABEL[blk.status] || 'A fazer'}
                                  </button>
                                </div>
                              );
                            })}
                          </div>
                        )}

                        {/* Despesas: so pra O.S. em andamento (a concluida tem seu proprio render) */}
                        {isStarted && (
                          <div className="mt-2">
                            {/* Existing expenses */}
                            {order.expenses && order.expenses.length > 0 && (
                              <div className="mb-1.5">
                                <div className="flex items-center justify-between mb-1">
                                  <span className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Gastos</span>
                                  <span className="text-[10px] font-bold text-amber-600">{formatCurrency(calcExpensesTotal(order.expenses))}</span>
                                </div>
                                <div className="space-y-0.5">
                                  {order.expenses.map((exp, idx) => (
                                    <div key={idx} className="flex items-center justify-between text-[10px] bg-amber-50 dark:bg-amber-900/20 rounded px-1.5 py-0.5 group/exp">
                                      <span className="text-slate-600 dark:text-slate-300 truncate mr-1">
                                        {exp.quantity > 1 && <span className="font-medium text-slate-500 dark:text-slate-400">{exp.quantity}x </span>}
                                        {exp.name}
                                      </span>
                                      <div className="flex items-center gap-1">
                                        <span className="font-medium text-amber-700">{formatCurrency(exp.value * (exp.quantity || 1))}</span>
                                        {isStarted && !isReadOnly && (
                                          <button
                                            onClick={() => handleRemoveExpense(order.id, idx)}
                                            className="opacity-0 group-hover/exp:opacity-100 text-red-400 hover:text-red-600 transition-opacity ml-0.5"
                                            title="Remover gasto"
                                          >
                                            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                            </svg>
                                          </button>
                                        )}
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}

                          </div>
                        )}

                        {/* Actions */}
                        <div className="mt-3 pt-2 border-t border-slate-100 dark:border-slate-700 flex items-center gap-2">
                          {!isReadOnly && !isStarted && (
                            <button
                              onMouseDown={(e) => e.stopPropagation()}
                              onClick={() => handleClaim(order.id)}
                              className="flex-1 py-1.5 bg-fyness-primary text-white text-xs rounded-lg hover:bg-fyness-secondary transition-colors font-medium"
                            >
                              Pegar O.S.
                            </button>
                          )}
                          {!isReadOnly && isStarted && (
                            <button
                              onMouseDown={(e) => e.stopPropagation()}
                              onClick={() => handleFinish(order.id)}
                              className="flex-1 py-1.5 bg-green-500 text-white text-xs rounded-lg hover:bg-green-600 transition-colors font-medium"
                            >
                              Concluir
                            </button>
                          )}
                        </div>
                        </div>
                        {cardDropPos === 'after' && (
                          <div className="h-1 bg-fyness-primary rounded-full mx-1 mt-1 animate-pulse" />
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default RoutinePage;
