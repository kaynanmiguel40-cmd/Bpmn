/**
 * RoutinePage - Minha Rotina (O.S. pessoais)
 *
 * Mostra as O.S. ligadas ao usuario logado:
 * - Por fazer: atribuida a mim, ainda nao peguei
 * - Em andamento: peguei e estou executando
 * - Concluido: finalizei
 */

import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { useOSOrders, useOSProjects, useTeamMembers } from '../../hooks/queries';
import { updateOSOrder } from '../../lib/osService';
import { namesMatch } from '../../lib/kpiUtils';
import { useProfile } from '../../hooks/useProfile';
import { notifyOSCompleted } from '../../lib/notificationTriggers';
import { PRIORITIES, ROUTINE_COLUMNS as COLUMNS } from '../../constants/colors';
import { formatDateShortMonth as formatDate, formatCurrency } from '../../lib/formatters';
import { sortByPriorityAndOrder } from '../../lib/orderSorting';

export function RoutinePage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { data: orders = [], isLoading: loadingOrders } = useOSOrders();
  const { data: projects = [], isLoading: loadingProjects } = useOSProjects();
  const { data: teamMembers = [] } = useTeamMembers();
  const { profile, isLoading: loadingProfile } = useProfile();

  // Expenses form
  const [expenseOpen, setExpenseOpen] = useState(null); // orderId com form aberto
  const [expName, setExpName] = useState('');
  const [expValue, setExpValue] = useState('');
  const [expQty, setExpQty] = useState('1');

  const loading = loadingOrders || loadingProjects || loadingProfile;

  const userName = profile.name || '';

  // Filtrar O.S. relevantes para o usuario
  const myOrders = useMemo(() => {
    if (!userName) return { todo: [], doing: [], done: [] };

    const todo = orders.filter(o =>
      namesMatch(o.assignedTo, userName) && o.status === 'available'
    );

    const doing = orders.filter(o =>
      namesMatch(o.assignee, userName) && o.status === 'in_progress'
    );

    const done = orders.filter(o =>
      namesMatch(o.assignee, userName) && o.status === 'done'
    );

    return { todo, doing, done };
  }, [orders, userName]);

  // Mapa de sequencia: ordem de execucao (prioridade + sortOrder)
  const sequenceMap = useMemo(() => {
    const active = [...myOrders.todo, ...myOrders.doing].sort(sortByPriorityAndOrder);
    const map = {};
    active.forEach((o, i) => { map[o.id] = i + 1; });
    return map;
  }, [myOrders]);

  const handleClaim = async (orderId) => {
    const now = new Date().toISOString();
    const order = orders.find(o => o.id === orderId);
    // Inicializar startedAt da primeira tarefa nao-feita
    let checklistUpdate = {};
    if (order?.checklist?.length > 0) {
      const firstUndone = order.checklist.findIndex(i => !i.done);
      if (firstUndone >= 0) {
        checklistUpdate = {
          checklist: order.checklist.map((i, idx) =>
            idx === firstUndone ? { ...i, startedAt: now } : i
          ),
        };
      }
    }
    const updated = await updateOSOrder(orderId, {
      assignee: userName,
      status: 'in_progress',
      actualStart: now,
      ...checklistUpdate,
    });
    if (updated) {
      queryClient.invalidateQueries({ queryKey: ['osOrders'] });
    }
  };

  const handleFinish = async (orderId) => {
    const now = new Date().toISOString();
    const updated = await updateOSOrder(orderId, {
      status: 'done',
      actualEnd: now,
    });
    if (updated) {
      queryClient.invalidateQueries({ queryKey: ['osOrders'] });
      notifyOSCompleted(updated, teamMembers, userName, profile.id);
    }
  };

  const handleReopen = async (orderId) => {
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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const columnData = {
    todo: [...myOrders.todo].sort(sortByPriorityAndOrder),
    doing: [...myOrders.doing].sort(sortByPriorityAndOrder),
    done: myOrders.done,
  };

  const totalCount = myOrders.todo.length + myOrders.doing.length + myOrders.done.length;

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">Minha Rotina</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            {userName ? (
              <>O.S. atribuidas a <strong className="text-slate-700 dark:text-slate-200">{userName}</strong> — {totalCount} no total</>
            ) : (
              'Configure seu nome nas Configuracoes para ver suas O.S.'
            )}
          </p>
        </div>
      </div>

      {!userName ? (
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
        <div className="flex-1 grid grid-cols-3 gap-4 min-h-0">
          {COLUMNS.map((column) => {
            const items = columnData[column.id];
            return (
              <div key={column.id} className="flex flex-col min-h-0">
                {/* Column Header */}
                <div className={`bg-gradient-to-r ${column.color} rounded-t-xl px-4 py-2.5 flex items-center justify-between`}>
                  <h3 className="text-sm font-bold text-white">{column.title}</h3>
                  <span className="bg-white/20 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                    {items.length}
                  </span>
                </div>

                {/* Cards */}
                <div className="flex-1 bg-slate-50 dark:bg-slate-900 rounded-b-xl p-3 space-y-2.5 overflow-y-auto border border-t-0 border-slate-200 dark:border-slate-700">
                  {items.length === 0 && (
                    <div className="flex items-center justify-center h-32 text-slate-400 dark:text-slate-500 text-sm italic">
                      {column.emptyText}
                    </div>
                  )}

                  {items.map(order => {
                    const priority = PRIORITIES[order.priority] || PRIORITIES.medium;
                    const projectName = getProjectName(order.projectId);

                    return (
                      <div
                        key={order.id}
                        className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-3 hover:shadow-md hover:border-fyness-primary/30 transition-all group"
                      >
                        {/* Top row */}
                        <div className="flex items-center justify-between mb-1.5">
                          <div className="flex items-center gap-1.5">
                            {sequenceMap[order.id] && (
                              <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-fyness-primary text-white text-[10px] font-bold shrink-0">{sequenceMap[order.id]}</span>
                            )}
                            <span className="text-xs font-bold text-slate-400 dark:text-slate-500">O.S. #{order.number}</span>
                          </div>
                          <span className={`inline-flex items-center gap-1 text-[10px] font-medium px-1.5 py-0.5 rounded-full ${priority.color}`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${priority.dot}`} />
                            {priority.label}
                          </span>
                        </div>

                        {/* Title */}
                        <h4 className="text-sm font-semibold text-slate-800 dark:text-slate-100 mb-1">{order.title}</h4>

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

                        {/* Expenses Section (doing + done) */}
                        {(column.id === 'doing' || column.id === 'done') && (
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
                                        {column.id === 'doing' && (
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
                          {column.id === 'todo' && (
                            <button
                              onClick={() => handleClaim(order.id)}
                              className="flex-1 py-1.5 bg-fyness-primary text-white text-xs rounded-lg hover:bg-fyness-secondary transition-colors font-medium"
                            >
                              Pegar O.S.
                            </button>
                          )}
                          {column.id === 'doing' && (
                            <button
                              onClick={() => handleFinish(order.id)}
                              className="flex-1 py-1.5 bg-green-500 text-white text-xs rounded-lg hover:bg-green-600 transition-colors font-medium"
                            >
                              Concluir
                            </button>
                          )}
                          {column.id === 'done' && (
                            <button
                              onClick={() => handleReopen(order.id)}
                              className="flex-1 py-1.5 border border-slate-300 dark:border-slate-600 text-slate-600 dark:text-slate-300 text-xs rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors font-medium"
                            >
                              Reabrir
                            </button>
                          )}
                          <button
                            onClick={() => navigate('/financial', { state: { openOsId: order.id } })}
                            className="px-2 py-1.5 border border-slate-200 dark:border-slate-700 text-slate-400 dark:text-slate-500 text-xs rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700/50 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
                            title="Abrir O.S."
                          >
                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                            </svg>
                          </button>
                        </div>
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
