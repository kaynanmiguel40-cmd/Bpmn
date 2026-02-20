import { useState, useMemo, useRef, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { buildTaskTree, flattenTree, recalculateWBS, calculateSummaryDates, calcEndDate, calcDuration, calcWorkHours, calculateCriticalPath, generateOSFromTask, syncProgressFromOS, parsePredecessors, autoScheduleTasks, detectCircularDependency, saveUndoStacks, loadUndoStacks } from '../../../lib/eapService';
import { deleteOSOrder, updateOSOrder } from '../../../lib/osService';
import { queryKeys } from '../../../hooks/queries';
import { useToast } from '../../../contexts/ToastContext';
import GanttToolbar from './GanttToolbar';
import TaskTable from './TaskTable';
import GanttTimeline from './GanttTimeline';

// ==================== CONSTANTES ====================

const ROW_HEIGHT = 36;
const MIN_TABLE_WIDTH = 460;
const DEFAULT_TABLE_WIDTH = 600;

const ZOOM_CONFIGS = {
  day: { label: 'Dia', colWidth: 36, format: 'day' },
  week: { label: 'Semana', colWidth: 22, format: 'week' },
  month: { label: 'Mes', colWidth: 180, format: 'month' },
};

// ==================== COMPONENTE PRINCIPAL ====================

export default function GanttChart({ project, tasks, teamMembers, osOrders = [], onCreateTask, onUpdateTask, onDeleteTask, invalidateEapTasks }) {
  const { addToast } = useToast();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const containerRef = useRef(null);
  const tableRef = useRef(null);
  const timelineRef = useRef(null);
  const isProcessingRef = useRef(false); // Guard contra operacoes concorrentes

  // State
  const [zoom, setZoom] = useState('week');
  const [collapsedIds, setCollapsedIds] = useState(new Set());
  const [selectedTaskIds, setSelectedTaskIds] = useState(new Set());
  const lastSelectedRef = useRef(null); // Para Shift+Click range
  const [editingCell, setEditingCell] = useState(null); // { taskId, field }
  const [tableWidth, setTableWidth] = useState(DEFAULT_TABLE_WIDTH);
  const [isResizingTable, setIsResizingTable] = useState(false);
  const [showCriticalPath, setShowCriticalPath] = useState(true);
  const [showAssigneeOnBar, setShowAssigneeOnBar] = useState(false);
  const [filterAssignee, setFilterAssignee] = useState('all');
  const [hiddenColumns, setHiddenColumns] = useState(new Set());
  const [isFullscreen, setIsFullscreen] = useState(false);

  // ==================== UNDO / REDO ====================
  const undoStackRef = useRef([]);  // Array de UndoEntry: [{ taskId, before, after }]
  const redoStackRef = useRef([]);
  const MAX_UNDO = 50;
  const undoLoadedRef = useRef(false);

  // Persistir stacks no IndexedDB (fire-and-forget, nao bloqueia a UI)
  const persistUndoStacks = useCallback(() => {
    saveUndoStacks(project.id, undoStackRef.current, redoStackRef.current);
  }, [project.id]);

  // Helper: propagar datas resumo recursivamente para cima na hierarquia
  const propagateSummaryUp = useCallback(async (startParentId, tasksCopy) => {
    const changes = [];
    const completedOps = [];
    let parentId = startParentId;
    const workingTasks = tasksCopy.map(t => ({ ...t }));

    while (parentId) {
      const parent = workingTasks.find(t => t.id === parentId);
      if (!parent) break;

      const summary = calculateSummaryDates(parentId, workingTasks);
      if (!summary) break;

      if (parent.startDate !== summary.startDate || parent.endDate !== summary.endDate ||
          parent.durationDays !== summary.durationDays || parent.progress !== summary.progress ||
          parent.estimatedHours !== summary.estimatedHours) {
        const before = {};
        for (const key of Object.keys(summary)) before[key] = parent[key];
        changes.push({ taskId: parentId, before, after: { ...summary } });
        await onUpdateTask(parentId, summary, true);
        completedOps.push({ taskId: parentId, before });
        const idx = workingTasks.findIndex(t => t.id === parentId);
        if (idx !== -1) Object.assign(workingTasks[idx], summary);
      }

      parentId = parent.parentId;
    }

    return { changes, completedOps };
  }, [onUpdateTask]);

  // Recalcula WBS de todas as tarefas e persiste no banco
  const applyWBS = useCallback(async (currentTasks) => {
    const wbsUpdates = recalculateWBS(currentTasks);
    for (const u of wbsUpdates) {
      const task = currentTasks.find(t => t.id === u.id);
      if (task && task.wbsNumber !== u.wbsNumber) {
        await onUpdateTask(u.id, { wbsNumber: u.wbsNumber }, true);
      }
    }
  }, [onUpdateTask]);

  // Carregar stacks do IndexedDB ao montar
  useEffect(() => {
    if (undoLoadedRef.current) return;
    undoLoadedRef.current = true;
    loadUndoStacks(project.id).then(({ undoStack, redoStack }) => {
      if (undoStack.length > 0 || redoStack.length > 0) {
        undoStackRef.current = undoStack;
        redoStackRef.current = redoStack;
      }
    });
  }, [project.id]);

  // Recalcular WBS ao carregar tarefas (corrige dados existentes com WBS errado)
  const wbsInitRef = useRef(false);
  useEffect(() => {
    if (tasks.length === 0 || wbsInitRef.current) return;
    wbsInitRef.current = true;
    applyWBS(tasks).then(() => invalidateEapTasks());
  }, [tasks, applyWBS, invalidateEapTasks]);

  const recordUndo = useCallback((changes) => {
    if (changes.length === 0) return;
    undoStackRef.current.push(changes);
    if (undoStackRef.current.length > MAX_UNDO) undoStackRef.current.shift();
    redoStackRef.current = []; // Nova ação limpa redo
    persistUndoStacks();
  }, [persistUndoStacks]);

  const handleUndo = useCallback(async () => {
    if (isProcessingRef.current) return; // Guard: evitar undo concorrente
    const entry = undoStackRef.current.pop();
    if (!entry) { addToast('Nada para desfazer', 'info'); return; }

    isProcessingRef.current = true;
    try {
      // Filtrar entries de tarefas que ainda existem
      const validEntries = entry.filter(e => tasks.some(t => t.id === e.taskId));
      for (let i = validEntries.length - 1; i >= 0; i--) {
        const { taskId, before } = validEntries[i];
        await onUpdateTask(taskId, before, true); // skipInvalidation
      }
      redoStackRef.current.push(entry);
      addToast('Desfeito (Ctrl+Z)', 'success');
    } catch (err) {
      addToast('Erro ao desfazer: ' + (err.message || 'erro'), 'error');
      // Re-push entry que falhou para nao perder do stack
      undoStackRef.current.push(entry);
    } finally {
      isProcessingRef.current = false;
      invalidateEapTasks();
      persistUndoStacks();
    }
  }, [onUpdateTask, addToast, tasks, invalidateEapTasks, persistUndoStacks]);

  const handleRedo = useCallback(async () => {
    if (isProcessingRef.current) return;
    const entry = redoStackRef.current.pop();
    if (!entry) { addToast('Nada para refazer', 'info'); return; }

    isProcessingRef.current = true;
    try {
      const validEntries = entry.filter(e => tasks.some(t => t.id === e.taskId));
      for (const { taskId, after } of validEntries) {
        await onUpdateTask(taskId, after, true); // skipInvalidation
      }
      undoStackRef.current.push(entry);
      addToast('Refeito (Ctrl+Y)', 'success');
    } catch (err) {
      addToast('Erro ao refazer: ' + (err.message || 'erro'), 'error');
      redoStackRef.current.push(entry);
    } finally {
      isProcessingRef.current = false;
      invalidateEapTasks();
      persistUndoStacks();
    }
  }, [onUpdateTask, addToast, tasks, invalidateEapTasks, persistUndoStacks]);

  // Fullscreen toggle
  const toggleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  }, []);

  useEffect(() => {
    const onFsChange = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', onFsChange);
    return () => document.removeEventListener('fullscreenchange', onFsChange);
  }, []);

  const handleToggleColumn = useCallback((key) => {
    setHiddenColumns(prev => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }, []);

  // ==================== DADOS PROCESSADOS ====================

  const tree = useMemo(() => buildTaskTree(tasks), [tasks]);
  const flatTasks = useMemo(() => flattenTree(tree, collapsedIds), [tree, collapsedIds]);

  // ==================== MULTI-SELECAO ====================
  // Click = seleciona so aquela | Ctrl+Click = toggle | Shift+Click = range

  const handleSelectTask = useCallback((taskId, event) => {
    const ctrlKey = event?.ctrlKey || event?.metaKey;
    const shiftKey = event?.shiftKey;

    if (shiftKey && lastSelectedRef.current) {
      const startIdx = flatTasks.findIndex(t => t.id === lastSelectedRef.current);
      const endIdx = flatTasks.findIndex(t => t.id === taskId);
      if (startIdx !== -1 && endIdx !== -1) {
        const from = Math.min(startIdx, endIdx);
        const to = Math.max(startIdx, endIdx);
        const rangeIds = new Set(flatTasks.slice(from, to + 1).map(t => t.id));
        if (ctrlKey) {
          setSelectedTaskIds(prev => new Set([...prev, ...rangeIds]));
        } else {
          setSelectedTaskIds(rangeIds);
        }
      }
    } else if (ctrlKey) {
      setSelectedTaskIds(prev => {
        const next = new Set(prev);
        if (next.has(taskId)) next.delete(taskId);
        else next.add(taskId);
        return next;
      });
      lastSelectedRef.current = taskId;
    } else {
      setSelectedTaskIds(new Set([taskId]));
      lastSelectedRef.current = taskId;
    }
  }, [flatTasks]);

  // Helper: primeiro ID selecionado (para operacoes que precisam de um)
  const firstSelectedId = useMemo(() => {
    if (selectedTaskIds.size === 0) return null;
    for (const t of flatTasks) {
      if (selectedTaskIds.has(t.id)) return t.id;
    }
    return [...selectedTaskIds][0];
  }, [selectedTaskIds, flatTasks]);

  // Drag-select: arrastar pra selecionar varias (estilo Windows)
  const handleDragSelect = useCallback((taskIds) => {
    setSelectedTaskIds(new Set(taskIds));
    if (taskIds.length > 0) lastSelectedRef.current = taskIds[taskIds.length - 1];
  }, []);

  // Mapas de row number ↔ taskId (para predecessoras)
  const taskRowMap = useMemo(() => {
    const map = new Map();
    flatTasks.forEach((t, i) => map.set(t.id, i + 1));
    return map;
  }, [flatTasks]);

  const rowTaskMap = useMemo(() => {
    const map = new Map();
    flatTasks.forEach((t, i) => map.set(i + 1, t.id));
    return map;
  }, [flatTasks]);

  // Filtrar por responsavel
  const visibleTasks = useMemo(() => {
    if (filterAssignee === 'all') return flatTasks;
    return flatTasks.filter(t => t.assignedTo === filterAssignee);
  }, [flatTasks, filterAssignee]);

  // IDs de tarefas que tem filhos (summary tasks)
  const summaryIds = useMemo(() => {
    const ids = new Set();
    for (const t of tasks) {
      if (t.parentId) ids.add(t.parentId);
    }
    return ids;
  }, [tasks]);

  // Recalcular datas dos pais (summary) ao carregar dados — bottom-up
  useEffect(() => {
    if (tasks.length === 0) return;
    (async () => {
      // Ordenar pais por nivel descendente (mais profundo primeiro)
      const sortedParentIds = [...summaryIds].sort((a, b) => {
        const tA = tasks.find(t => t.id === a);
        const tB = tasks.find(t => t.id === b);
        return (tB?.level || 0) - (tA?.level || 0);
      });
      const workingTasks = tasks.map(t => ({ ...t }));
      let anyChanged = false;
      for (const parentId of sortedParentIds) {
        const parent = workingTasks.find(t => t.id === parentId);
        if (!parent) continue;
        const summary = calculateSummaryDates(parentId, workingTasks);
        if (!summary) continue;
        if (parent.startDate !== summary.startDate || parent.endDate !== summary.endDate || parent.durationDays !== summary.durationDays) {
          await onUpdateTask(parentId, summary, true); // skipInvalidation
          const idx = workingTasks.findIndex(t => t.id === parentId);
          if (idx !== -1) Object.assign(workingTasks[idx], summary);
          anyChanged = true;
        }
      }
      // Invalidar uma unica vez no final
      if (anyChanged) invalidateEapTasks();
    })();
  // Rodar apenas 1x ao montar (tasks iniciais)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [summaryIds.size]);

  // Caminho critico
  const criticalIds = useMemo(() => {
    if (!showCriticalPath) return new Set();
    return calculateCriticalPath(tasks);
  }, [tasks, showCriticalPath]);

  // Range de datas do projeto (ajustado por zoom)
  const dateRange = useMemo(() => {
    const today = new Date();
    const allDates = tasks
      .flatMap(t => [t.startDate, t.endDate])
      .filter(Boolean)
      .map(d => new Date(d.includes('T') ? d : d + 'T00:00:00'))
      .filter(d => !isNaN(d.getTime()));

    if (zoom === 'month') {
      // Zoom mes: mostrar o ano inteiro (jan-dez) do ano atual
      const year = today.getFullYear();
      return {
        start: new Date(year, 0, 1),
        end: new Date(year, 11, 31),
      };
    }

    // Zoom dia/semana: limitado aos meses das tarefas
    if (allDates.length === 0) {
      const start = new Date(today.getFullYear(), today.getMonth(), 1);
      const end = new Date(today.getFullYear(), today.getMonth() + 1, 0);
      return { start, end };
    }

    const min = new Date(Math.min(...allDates));
    const max = new Date(Math.max(...allDates));

    const start = new Date(min.getFullYear(), min.getMonth(), 1);
    const end = new Date(max.getFullYear(), max.getMonth() + 1, 0);

    return { start, end };
  }, [tasks, zoom]);

  // ==================== SCROLL SINCRONIZADO ====================

  const handleTableScroll = useCallback((e) => {
    if (timelineRef.current) {
      timelineRef.current.scrollTop = e.target.scrollTop;
    }
  }, []);

  const handleTimelineScroll = useCallback((e) => {
    if (tableRef.current) {
      tableRef.current.scrollTop = e.target.scrollTop;
    }
  }, []);

  // ==================== RESIZE DO SPLIT ====================

  const handleResizeStart = useCallback((e) => {
    e.preventDefault();
    setIsResizingTable(true);
    const startX = e.clientX;
    const startWidth = tableWidth;

    const onMouseMove = (e2) => {
      const diff = e2.clientX - startX;
      const newWidth = Math.max(MIN_TABLE_WIDTH, startWidth + diff);
      setTableWidth(newWidth);
    };

    const onMouseUp = () => {
      setIsResizingTable(false);
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
    };

    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
  }, [tableWidth]);

  // ==================== HANDLERS TAREFAS ====================

  const handleToggleCollapse = useCallback((taskId) => {
    setCollapsedIds(prev => {
      const next = new Set(prev);
      if (next.has(taskId)) next.delete(taskId);
      else next.add(taskId);
      return next;
    });
  }, []);

  const handleAddTask = useCallback(async (parentId = null) => {
    const siblings = tasks.filter(t => t.parentId === parentId);
    const maxSort = siblings.reduce((m, t) => Math.max(m, t.sortOrder || 0), 0);
    const parentTask = parentId ? tasks.find(t => t.id === parentId) : null;
    const level = parentTask ? parentTask.level + 1 : 0;

    const today = new Date().toISOString().split('T')[0] + 'T08:00';
    const endDate = calcEndDate(today, 1);

    const newTask = {
      projectId: project.id,
      name: 'Nova Tarefa',
      parentId,
      sortOrder: maxSort + 1,
      level,
      startDate: today,
      endDate,
      durationDays: 1,
      estimatedHours: 10,
      progress: 0,
      assignedTo: '',
      predecessors: [],
    };

    const result = await onCreateTask(newTask);
    if (result) {
      // Recalcular WBS com a nova tarefa incluida
      const updatedTasks = [...tasks, { ...newTask, id: result.id, wbsNumber: '' }];
      await applyWBS(updatedTasks);
      invalidateEapTasks();

      // Subtarefa: manter selecao no pai (facilita criar varias sub seguidas)
      const isSubtask = parentId && selectedTaskIds.has(parentId);
      if (!isSubtask) {
        setSelectedTaskIds(new Set([result.id]));
        lastSelectedRef.current = result.id;
      }
      setEditingCell({ taskId: result.id, field: 'name' });
      if (parentId) {
        setCollapsedIds(prev => {
          const next = new Set(prev);
          next.delete(parentId);
          return next;
        });
      }
    }
  }, [tasks, project.id, onCreateTask, selectedTaskIds, applyWBS, invalidateEapTasks]);

  const handleAddMilestone = useCallback(async () => {
    const maxSort = tasks.reduce((m, t) => Math.max(m, t.sortOrder || 0), 0);
    const today = new Date().toISOString().split('T')[0] + 'T08:00';

    const newTask = {
      projectId: project.id,
      name: 'Marco',
      parentId: null,
      sortOrder: maxSort + 1,
      level: 0,
      isMilestone: true,
      startDate: today,
      endDate: today,
      durationDays: 0,
      progress: 0,
      assignedTo: '',
      predecessors: [],
    };

    const result = await onCreateTask(newTask);
    if (result) {
      const updatedTasks = [...tasks, { ...newTask, id: result.id, wbsNumber: '' }];
      await applyWBS(updatedTasks);
      invalidateEapTasks();

      setSelectedTaskIds(new Set([result.id]));
      lastSelectedRef.current = result.id;
      setEditingCell({ taskId: result.id, field: 'name' });
    }
  }, [tasks, project.id, onCreateTask, applyWBS, invalidateEapTasks]);

  // Mapa de OS vinculadas (precisa estar antes de handleDeleteSelectedTask)
  const osMap = useMemo(() => {
    const map = new Map();
    for (const os of osOrders) {
      map.set(os.id, os);
    }
    return map;
  }, [osOrders]);

  // Navegar para a OS vinculada no FinancialPage
  const handleOpenOS = useCallback((osId) => {
    if (!osId) return;
    navigate('/financial', { state: { openOsId: osId } });
  }, [navigate]);

  const handleDeleteSelectedTask = useCallback(async () => {
    if (selectedTaskIds.size === 0) return;

    // Coletar todas as tarefas a deletar (selecionadas + filhos recursivos)
    const idsToDelete = new Set();
    const collectChildren = (parentId) => {
      for (const t of tasks) {
        if (t.parentId === parentId) {
          idsToDelete.add(t.id);
          collectChildren(t.id);
        }
      }
    };
    for (const id of selectedTaskIds) {
      idsToDelete.add(id);
      collectChildren(id);
    }

    // Limpar OS vinculadas — rastrear falhas
    let osDeleted = 0;
    const osFailedIds = [];
    for (const id of idsToDelete) {
      const task = tasks.find(t => t.id === id);
      if (!task?.osOrderId) continue;
      const os = osMap.get(task.osOrderId);
      if (os && (os.status === 'available' || os.status === 'pending')) {
        try {
          await deleteOSOrder(os.id);
          osDeleted++;
        } catch (err) {
          osFailedIds.push(id);
          addToast(`Falha ao remover OS "${os.title}": ${err.message || 'erro'}. A tarefa sera mantida.`, 'error');
        }
      }
    }

    // Remover tarefas com OS que falharam (nao deletar para evitar orfas)
    for (const failedId of osFailedIds) {
      idsToDelete.delete(failedId);
    }

    if (idsToDelete.size === 0) {
      addToast('Nenhuma tarefa deletada (falha ao remover OS vinculadas)', 'warning');
      return;
    }

    // Deletar filhos primeiro: ordenar por level descendente
    const sortedIds = [...idsToDelete].sort((a, b) => {
      const tA = tasks.find(t => t.id === a);
      const tB = tasks.find(t => t.id === b);
      return (tB?.level || 0) - (tA?.level || 0);
    });
    for (const id of sortedIds) {
      await onDeleteTask(id);
    }

    if (osDeleted > 0) {
      queryClient.invalidateQueries({ queryKey: queryKeys.osOrders });
    }

    // Limpar entries do undo/redo que referenciam tarefas deletadas
    undoStackRef.current = undoStackRef.current
      .map(entry => entry.filter(e => !idsToDelete.has(e.taskId)))
      .filter(entry => entry.length > 0);
    redoStackRef.current = redoStackRef.current
      .map(entry => entry.filter(e => !idsToDelete.has(e.taskId)))
      .filter(entry => entry.length > 0);
    persistUndoStacks();

    setSelectedTaskIds(new Set());
    lastSelectedRef.current = null;
    const count = idsToDelete.size;
    const msg = count > 1
      ? `${count} tarefas excluidas${osDeleted > 0 ? ` (${osDeleted} OS removida${osDeleted > 1 ? 's' : ''})` : ''}${osFailedIds.length > 0 ? ` (${osFailedIds.length} mantida${osFailedIds.length > 1 ? 's' : ''} por erro na OS)` : ''}`
      : `Tarefa excluida${osDeleted > 0 ? ` (${osDeleted} OS removida${osDeleted > 1 ? 's' : ''})` : ''}`;
    addToast(msg, 'success');

    // Recalcular WBS apos exclusao
    const remainingTasks = tasks.filter(t => !idsToDelete.has(t.id));
    await applyWBS(remainingTasks);
    invalidateEapTasks();
  }, [selectedTaskIds, tasks, osMap, onDeleteTask, addToast, queryClient, applyWBS, invalidateEapTasks]);

  const handleIndent = useCallback(async () => {
    if (selectedTaskIds.size === 0 || isProcessingRef.current) return;
    isProcessingRef.current = true;
    const undoChanges = [];

    try {
      for (const t of flatTasks) {
        if (!selectedTaskIds.has(t.id)) continue;
        const task = tasks.find(tk => tk.id === t.id);
        if (!task) continue;

        const siblings = tasks
          .filter(s => s.parentId === task.parentId)
          .sort((a, b) => a.sortOrder - b.sortOrder);
        const idx = siblings.findIndex(s => s.id === task.id);
        if (idx <= 0) continue;

        const newParent = siblings[idx - 1];
        const before = { parentId: task.parentId, level: task.level };
        const after = { parentId: newParent.id, level: (newParent.level || 0) + 1 };

        undoChanges.push({ taskId: task.id, before, after });
        await onUpdateTask(task.id, after, true); // skipInvalidation

        setCollapsedIds(prev => {
          const next = new Set(prev);
          next.delete(newParent.id);
          return next;
        });
      }

      if (undoChanges.length > 0) {
        recordUndo(undoChanges);
        // Recalcular WBS com a hierarquia atualizada
        const updatedTasks = tasks.map(t => {
          const change = undoChanges.find(c => c.taskId === t.id);
          return change ? { ...t, ...change.after } : t;
        });
        await applyWBS(updatedTasks);
      }
    } catch (err) {
      addToast('Erro ao indentar: ' + (err.message || 'erro'), 'error');
    } finally {
      isProcessingRef.current = false;
      invalidateEapTasks();
    }
  }, [selectedTaskIds, flatTasks, tasks, onUpdateTask, recordUndo, addToast, invalidateEapTasks, applyWBS]);

  const handleOutdent = useCallback(async () => {
    if (selectedTaskIds.size === 0 || isProcessingRef.current) return;
    isProcessingRef.current = true;
    const undoChanges = [];

    try {
      for (const t of flatTasks) {
        if (!selectedTaskIds.has(t.id)) continue;
        const task = tasks.find(tk => tk.id === t.id);
        if (!task || !task.parentId) continue;

        const parent = tasks.find(p => p.id === task.parentId);
        if (!parent) continue;

        const before = { parentId: task.parentId, level: task.level };
        const after = { parentId: parent.parentId || null, level: Math.max(0, (parent.level || 0)) };

        undoChanges.push({ taskId: task.id, before, after });
        await onUpdateTask(task.id, after, true); // skipInvalidation
      }

      if (undoChanges.length > 0) {
        recordUndo(undoChanges);
        // Recalcular WBS com a hierarquia atualizada
        const updatedTasks = tasks.map(t => {
          const change = undoChanges.find(c => c.taskId === t.id);
          return change ? { ...t, ...change.after } : t;
        });
        await applyWBS(updatedTasks);
      }
    } catch (err) {
      addToast('Erro ao desindentar: ' + (err.message || 'erro'), 'error');
    } finally {
      isProcessingRef.current = false;
      invalidateEapTasks();
    }
  }, [selectedTaskIds, flatTasks, tasks, onUpdateTask, recordUndo, addToast, invalidateEapTasks, applyWBS]);

  // Reordenar tarefas via drag & drop
  const handleReorderTask = useCallback(async (reorderUpdates) => {
    if (reorderUpdates.length === 0 || isProcessingRef.current) return;
    isProcessingRef.current = true;

    try {
      for (const { taskId, after } of reorderUpdates) {
        await onUpdateTask(taskId, after, true);
      }

      recordUndo(reorderUpdates);

      const updatedTasks = tasks.map(t => {
        const change = reorderUpdates.find(c => c.taskId === t.id);
        return change ? { ...t, ...change.after } : t;
      });
      await applyWBS(updatedTasks);
    } catch (err) {
      addToast('Erro ao reordenar: ' + (err.message || 'erro'), 'error');
    } finally {
      isProcessingRef.current = false;
      invalidateEapTasks();
    }
  }, [tasks, onUpdateTask, recordUndo, applyWBS, addToast, invalidateEapTasks]);

  const handleCellEdit = useCallback(async (taskId, field, value) => {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;

    const undoChanges = [];
    const completedUpdates = []; // Track updates que deram certo (para rollback)
    const updates = {};

    // Predecessoras: parsear texto para array
    if (field === 'predecessors') {
      const parsed = parsePredecessors(value, rowTaskMap);
      // Validar dependencias circulares antes de salvar
      if (parsed.length > 0 && detectCircularDependency(taskId, parsed, tasks)) {
        addToast('Dependencia circular detectada! Esta predecessora criaria um ciclo.', 'error');
        setEditingCell(null);
        return;
      }
      updates.predecessors = parsed;
    } else {
      updates[field] = value;
    }

    // Auto-calculo de datas/duracao
    if (field === 'estimatedHours') {
      updates.estimatedHours = value;
      const days = Math.max(1, Math.ceil(value / 10));
      updates.durationDays = days;
      if (task.startDate) {
        updates.endDate = calcEndDate(task.startDate, days);
      }
    } else if (field === 'startDate') {
      if (task.endDate) {
        const days = calcDuration(value, task.endDate);
        updates.durationDays = days;
        updates.estimatedHours = days * 10;
      } else if (task.durationDays > 0) {
        updates.endDate = calcEndDate(value, task.durationDays);
      }
    } else if (field === 'endDate' && task.startDate) {
      const days = calcDuration(task.startDate, value);
      updates.durationDays = days;
      updates.estimatedHours = days * 10;
    } else if (field === 'durationDays' && task.startDate) {
      updates.endDate = calcEndDate(task.startDate, value);
      updates.estimatedHours = value * 10;
    }

    // Undo: capturar estado anterior da tarefa principal
    const beforeMain = {};
    for (const key of Object.keys(updates)) beforeMain[key] = task[key];
    undoChanges.push({ taskId, before: beforeMain, after: { ...updates } });

    try {
      // Primeira atualizacao: a edicao principal (esta dispara invalidation normal)
      await onUpdateTask(taskId, updates);
      completedUpdates.push({ taskId, before: beforeMain });

      // Recalcular pais recursivamente na hierarquia (bottom-up)
      if (task.parentId && ['startDate', 'endDate', 'durationDays', 'estimatedHours', 'progress'].includes(field)) {
        const updatedTasks = tasks.map(t => t.id === taskId ? { ...t, ...updates } : t);
        const { changes: parentChanges, completedOps } = await propagateSummaryUp(task.parentId, updatedTasks);
        undoChanges.push(...parentChanges);
        completedUpdates.push(...completedOps);
      }

      // Auto-scheduling: propagar datas quando predecessoras ou datas mudam
      if (['predecessors', 'startDate', 'endDate', 'durationDays', 'estimatedHours'].includes(field)) {
        let updatedTasks2 = tasks.map(t => t.id === taskId ? { ...t, ...updates } : t);
        const scheduleUpdates = autoScheduleTasks(updatedTasks2);
        for (const su of scheduleUpdates) {
          if (su.id === taskId && field !== 'predecessors') continue;

          const suTask = tasks.find(t => t.id === su.id);
          if (suTask) {
            undoChanges.push({
              taskId: su.id,
              before: { startDate: suTask.startDate, endDate: suTask.endDate },
              after: { startDate: su.startDate, endDate: su.endDate },
            });
          }
          await onUpdateTask(su.id, { startDate: su.startDate, endDate: su.endDate }, true);
          if (suTask) completedUpdates.push({ taskId: su.id, before: { startDate: suTask.startDate, endDate: suTask.endDate } });
          updatedTasks2 = updatedTasks2.map(t => t.id === su.id ? { ...t, startDate: su.startDate, endDate: su.endDate } : t);
        }

        // Propagar datas dos pais recursivamente (todas as tarefas afetadas)
        const affectedParentIds = new Set();
        if (task.parentId) affectedParentIds.add(task.parentId);
        for (const su of scheduleUpdates) {
          const suTask = updatedTasks2.find(t => t.id === su.id);
          if (suTask?.parentId) affectedParentIds.add(suTask.parentId);
        }
        const sortedParents = [...affectedParentIds].sort((a, b) => {
          const tA = updatedTasks2.find(t => t.id === a);
          const tB = updatedTasks2.find(t => t.id === b);
          return (tB?.level || 0) - (tA?.level || 0);
        });
        const propagated = new Set();
        for (const pid of sortedParents) {
          if (propagated.has(pid)) continue;
          const { changes: pCh, completedOps: pOps } = await propagateSummaryUp(pid, updatedTasks2);
          for (const ch of pCh) {
            propagated.add(ch.taskId);
            updatedTasks2 = updatedTasks2.map(t => t.id === ch.taskId ? { ...t, ...ch.after } : t);
          }
          undoChanges.push(...pCh);
          completedUpdates.push(...pOps);
        }

        invalidateEapTasks();
      }

      recordUndo(undoChanges);
    } catch (err) {
      // Rollback: reverter updates que ja foram pro servidor
      if (completedUpdates.length > 0) {
        addToast('Erro parcial — revertendo alteracoes...', 'warning');
        for (let i = completedUpdates.length - 1; i >= 0; i--) {
          try {
            await onUpdateTask(completedUpdates[i].taskId, completedUpdates[i].before, true);
          } catch { /* rollback best-effort */ }
        }
        invalidateEapTasks();
      }
      addToast('Erro ao salvar: ' + (err.message || 'erro'), 'error');
    }
    setEditingCell(null);
  }, [tasks, onUpdateTask, rowTaskMap, recordUndo, addToast, invalidateEapTasks, propagateSummaryUp]);

  // Drag na barra do gantt
  const handleBarDrag = useCallback(async (taskId, newStartDate, newEndDate) => {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;

    const undoChanges = [];
    const completedUpdates = [];
    const duration = calcDuration(newStartDate, newEndDate);
    const dragUpdates = { startDate: newStartDate, endDate: newEndDate, durationDays: duration };

    undoChanges.push({
      taskId,
      before: { startDate: task.startDate, endDate: task.endDate, durationDays: task.durationDays },
      after: { ...dragUpdates },
    });

    try {
      // Primeira atualizacao: dispara invalidation normal
      await onUpdateTask(taskId, dragUpdates);
      completedUpdates.push({ taskId, before: { startDate: task.startDate, endDate: task.endDate, durationDays: task.durationDays } });

      // Propagar datas dos pais recursivamente na hierarquia
      if (task.parentId) {
        const updated = tasks.map(t => t.id === taskId ? { ...t, ...dragUpdates } : t);
        const { changes: parentChanges, completedOps } = await propagateSummaryUp(task.parentId, updated);
        undoChanges.push(...parentChanges);
        completedUpdates.push(...completedOps);
      }

      const updatedTasks = tasks.map(t => t.id === taskId ? { ...t, ...dragUpdates } : t);
      const scheduleUpdates = autoScheduleTasks(updatedTasks);
      for (const su of scheduleUpdates) {
        if (su.id !== taskId) {
          const suTask = tasks.find(t => t.id === su.id);
          if (suTask) {
            undoChanges.push({
              taskId: su.id,
              before: { startDate: suTask.startDate, endDate: suTask.endDate },
              after: { startDate: su.startDate, endDate: su.endDate },
            });
          }
          await onUpdateTask(su.id, { startDate: su.startDate, endDate: su.endDate }, true);
          if (suTask) completedUpdates.push({ taskId: su.id, before: { startDate: suTask.startDate, endDate: suTask.endDate } });
        }
      }

      // Invalidar uma vez no final do batch
      if (scheduleUpdates.length > 0 || task.parentId) {
        invalidateEapTasks();
      }

      recordUndo(undoChanges);
    } catch (err) {
      // Rollback: reverter updates que ja foram pro servidor
      if (completedUpdates.length > 0) {
        addToast('Erro parcial ao mover — revertendo...', 'warning');
        for (let i = completedUpdates.length - 1; i >= 0; i--) {
          try {
            await onUpdateTask(completedUpdates[i].taskId, completedUpdates[i].before, true);
          } catch { /* rollback best-effort */ }
        }
        invalidateEapTasks();
      }
      addToast('Erro ao mover tarefa: ' + (err.message || 'erro'), 'error');
    }
  }, [tasks, onUpdateTask, recordUndo, addToast, invalidateEapTasks, propagateSummaryUp]);

  // ==================== LINK DRAG (arrastar barra → criar predecessora FS) ====================

  const handleLinkTasks = useCallback(async (fromTaskId, toTaskId) => {
    if (isProcessingRef.current) return;
    const toTask = tasks.find(t => t.id === toTaskId);
    if (!toTask) return;

    // Verificar se ja existe essa predecessora
    const existing = toTask.predecessors || [];
    if (existing.some(p => p.taskId === fromTaskId)) {
      addToast('Essa predecessora ja existe', 'warning');
      return;
    }

    // Verificar dependencia circular
    if (detectCircularDependency(toTaskId, [...existing, { taskId: fromTaskId, type: 'FS', lag: 0 }], tasks)) {
      addToast('Dependencia circular detectada', 'error');
      return;
    }

    isProcessingRef.current = true;
    const undoChanges = [];
    try {
      const newPreds = [...existing, { taskId: fromTaskId, type: 'FS', lag: 0 }];
      undoChanges.push({
        taskId: toTaskId,
        before: { predecessors: existing },
        after: { predecessors: newPreds },
      });
      await onUpdateTask(toTaskId, { predecessors: newPreds });

      // Auto-scheduling
      const updatedTasks = tasks.map(t => t.id === toTaskId ? { ...t, predecessors: newPreds } : t);
      const scheduleUpdates = autoScheduleTasks(updatedTasks);
      for (const su of scheduleUpdates) {
        const suTask = tasks.find(t => t.id === su.id);
        if (suTask) {
          undoChanges.push({
            taskId: su.id,
            before: { startDate: suTask.startDate, endDate: suTask.endDate },
            after: { startDate: su.startDate, endDate: su.endDate },
          });
        }
        await onUpdateTask(su.id, { startDate: su.startDate, endDate: su.endDate }, true);
      }

      recordUndo(undoChanges);
      addToast('Predecessora FS criada', 'success');
    } catch (err) {
      addToast('Erro ao criar predecessora: ' + (err.message || 'erro'), 'error');
    } finally {
      isProcessingRef.current = false;
      invalidateEapTasks();
    }
  }, [tasks, onUpdateTask, recordUndo, addToast, invalidateEapTasks]);

  // ==================== PONTE EAP → OS ====================

  // Gerar OS a partir da tarefa selecionada (usa a primeira da selecao)
  const handleGenerateOS = useCallback(async () => {
    if (!firstSelectedId) return;
    const task = tasks.find(t => t.id === firstSelectedId);
    if (!task) return;

    if (task.osOrderId) {
      addToast('Esta tarefa ja possui uma OS vinculada', 'warning');
      return;
    }

    if (task.level === 0 && summaryIds.has(task.id)) {
      addToast('Tarefas raiz viram Projetos de OS. Selecione uma atividade (nivel 1+) para gerar OS.', 'warning');
      return;
    }

    try {
      const os = await generateOSFromTask(task, project.name, tasks);
      if (os) {
        queryClient.invalidateQueries({ queryKey: queryKeys.osOrders });
        queryClient.invalidateQueries({ queryKey: queryKeys.osProjects });
        queryClient.invalidateQueries({ queryKey: queryKeys.eapTasks });
        const childCount = tasks.filter(t => t.parentId === task.id).length;
        const msg = childCount > 0
          ? `OS "${os.title}" gerada com ${childCount} item(ns) no checklist`
          : `OS "${os.title}" gerada com sucesso`;
        addToast(msg, 'success');
      } else {
        addToast('Erro ao gerar Ordem de Servico', 'error');
      }
    } catch (err) {
      addToast('Erro ao gerar OS: ' + (err.message || 'erro desconhecido'), 'error');
    }
  }, [firstSelectedId, tasks, summaryIds, project.name, addToast, queryClient]);

  // Sincronizar progresso bidirecional: EAP ↔ OS
  const handleSyncProgress = useCallback(async () => {
    const { eapUpdates, osUpdates } = syncProgressFromOS(tasks, osOrders);
    if (eapUpdates.length === 0 && osUpdates.length === 0) {
      addToast('Tudo sincronizado - nenhuma alteracao necessaria', 'info');
      return;
    }

    try {
      let eapCount = 0;
      let osCount = 0;

      // Sync OS → EAP (atualizar progresso das tarefas)
      for (const { id, progress } of eapUpdates) {
        await onUpdateTask(id, { progress }, true);
        eapCount++;
      }

      // Sync EAP → OS (atualizar status das OS)
      for (const { id, status } of osUpdates) {
        try {
          await updateOSOrder(id, { status });
          osCount++;
        } catch (err) {
          addToast(`Falha ao atualizar OS: ${err.message || 'erro'}`, 'error');
        }
      }

      if (eapCount > 0) invalidateEapTasks();
      if (osCount > 0) queryClient.invalidateQueries({ queryKey: queryKeys.osOrders });

      const msgs = [];
      if (eapCount > 0) msgs.push(`${eapCount} tarefa${eapCount > 1 ? 's' : ''} atualizada${eapCount > 1 ? 's' : ''}`);
      if (osCount > 0) msgs.push(`${osCount} OS atualizada${osCount > 1 ? 's' : ''}`);
      addToast(`Sincronizado: ${msgs.join(', ')}`, 'success');
    } catch (err) {
      addToast('Erro ao sincronizar: ' + (err.message || 'erro'), 'error');
      invalidateEapTasks();
    }
  }, [tasks, osOrders, onUpdateTask, addToast, invalidateEapTasks, queryClient]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Ctrl+Z / Ctrl+Y funcionam sempre (mesmo editando)
      if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
        e.preventDefault();
        handleUndo();
        return;
      }
      if ((e.ctrlKey || e.metaKey) && (e.key === 'y' || (e.key === 'z' && e.shiftKey))) {
        e.preventDefault();
        handleRedo();
        return;
      }

      if (editingCell) return; // Nao interceptar quando editando

      // Ctrl+A: selecionar todas
      if ((e.ctrlKey || e.metaKey) && e.key === 'a') {
        e.preventDefault();
        setSelectedTaskIds(new Set(flatTasks.map(t => t.id)));
        return;
      }

      // Escape: limpar selecao
      if (e.key === 'Escape') {
        setSelectedTaskIds(new Set());
        lastSelectedRef.current = null;
        return;
      }

      if (e.key === 'Delete' && selectedTaskIds.size > 0) {
        e.preventDefault();
        handleDeleteSelectedTask();
      } else if (e.key === 'Insert') {
        e.preventDefault();
        // Insert cria IRMA da selecionada (mesmo pai), igual MS Project
        const sel = firstSelectedId ? tasks.find(t => t.id === firstSelectedId) : null;
        handleAddTask(sel ? sel.parentId : null);
      } else if (e.key === 'Tab' && selectedTaskIds.size > 0) {
        e.preventDefault();
        if (e.shiftKey) handleOutdent();
        else handleIndent();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [editingCell, selectedTaskIds, flatTasks, firstSelectedId, tasks, handleDeleteSelectedTask, handleAddTask, handleOutdent, handleIndent, handleUndo, handleRedo]);

  // ==================== RENDER ====================

  return (
    <div className="h-full flex flex-col bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-700 overflow-hidden" ref={containerRef}>
      {/* Toolbar */}
      <GanttToolbar
        zoom={zoom}
        onZoomChange={setZoom}
        onAddTask={() => {
          // Botao "Tarefa": cria irma da selecionada (mesmo pai)
          const sel = firstSelectedId ? tasks.find(t => t.id === firstSelectedId) : null;
          handleAddTask(sel ? sel.parentId : null);
        }}
        onAddSubTask={() => handleAddTask(firstSelectedId)}
        onAddMilestone={handleAddMilestone}
        onDeleteTask={handleDeleteSelectedTask}
        onIndent={handleIndent}
        onOutdent={handleOutdent}
        showCriticalPath={showCriticalPath}
        onToggleCriticalPath={() => setShowCriticalPath(p => !p)}
        showAssigneeOnBar={showAssigneeOnBar}
        onToggleAssigneeOnBar={() => setShowAssigneeOnBar(p => !p)}
        hasSelection={selectedTaskIds.size > 0}
        selectionCount={selectedTaskIds.size}
        teamMembers={teamMembers}
        filterAssignee={filterAssignee}
        onFilterAssignee={setFilterAssignee}
        onGenerateOS={handleGenerateOS}
        onSyncProgress={handleSyncProgress}
        selectedTask={firstSelectedId ? tasks.find(t => t.id === firstSelectedId) : null}
        summaryIds={summaryIds}
        hiddenColumns={hiddenColumns}
        onToggleColumn={handleToggleColumn}
        isFullscreen={isFullscreen}
        onToggleFullscreen={toggleFullscreen}
      />

      {/* Split Panel */}
      <div className="flex-1 flex min-h-0 overflow-hidden">
        {/* Tabela de Tarefas (esquerda) */}
        <div
          className="flex-shrink-0 border-r border-slate-200 dark:border-slate-700 flex flex-col overflow-hidden"
          style={{ width: tableWidth }}
        >
          <TaskTable
            ref={tableRef}
            tasks={visibleTasks}
            allTasks={tasks}
            summaryIds={summaryIds}
            collapsedIds={collapsedIds}
            selectedTaskIds={selectedTaskIds}
            editingCell={editingCell}
            criticalIds={criticalIds}
            showCriticalPath={showCriticalPath}
            teamMembers={teamMembers}
            osMap={osMap}
            taskRowMap={taskRowMap}
            hiddenColumns={hiddenColumns}
            rowHeight={ROW_HEIGHT}
            onSelectTask={handleSelectTask}
            onDragSelect={handleDragSelect}
            onToggleCollapse={handleToggleCollapse}
            onEditCell={setEditingCell}
            onCellChange={handleCellEdit}
            onReorderTask={handleReorderTask}
            onOpenOS={handleOpenOS}
            onScroll={handleTableScroll}
          />
        </div>

        {/* Resize Handle */}
        <div
          className={`w-1 cursor-col-resize hover:bg-blue-500 transition-colors flex-shrink-0 ${isResizingTable ? 'bg-blue-500' : 'bg-transparent'}`}
          onMouseDown={handleResizeStart}
        />

        {/* Timeline do Gantt (direita) */}
        <div className="flex-1 min-w-0 flex flex-col">
          <GanttTimeline
            ref={timelineRef}
            tasks={visibleTasks}
            allTasks={tasks}
            summaryIds={summaryIds}
            criticalIds={criticalIds}
            showCriticalPath={showCriticalPath}
            showAssigneeOnBar={showAssigneeOnBar}
            selectedTaskIds={selectedTaskIds}
            dateRange={dateRange}
            zoom={zoom}
            zoomConfig={ZOOM_CONFIGS[zoom]}
            rowHeight={ROW_HEIGHT}
            onSelectTask={handleSelectTask}
            onBarDrag={handleBarDrag}
            onLinkTasks={handleLinkTasks}
            onScroll={handleTimelineScroll}
          />
        </div>
      </div>

      {/* Status Bar */}
      <div className="h-7 border-t border-slate-200 dark:border-slate-700 px-3 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/50 flex-shrink-0">
        <div className="flex items-center gap-4">
          <span>{tasks.length} tarefa{tasks.length !== 1 ? 's' : ''}</span>
          {tasks.length > 0 && (
            <span>
              {Math.round(tasks.filter(t => !summaryIds.has(t.id)).reduce((s, t) => s + (t.progress || 0), 0) / Math.max(1, tasks.filter(t => !summaryIds.has(t.id)).length))}% concluido
            </span>
          )}
          {(() => {
            const linked = tasks.filter(t => t.osOrderId).length;
            return linked > 0 ? <span className="text-emerald-500">{linked} OS vinculada{linked > 1 ? 's' : ''}</span> : null;
          })()}
          {selectedTaskIds.size > 1 && <span className="text-blue-500 font-medium">{selectedTaskIds.size} selecionadas</span>}
          {showCriticalPath && <span className="text-red-500">Caminho Critico ativo</span>}
        </div>
        <div className="flex items-center gap-3">
          <span>Ctrl+Z: Desfazer | Ctrl+A: Selecionar Tudo | Ctrl+Click: Multi | Shift+Click: Range</span>
        </div>
      </div>
    </div>
  );
}
