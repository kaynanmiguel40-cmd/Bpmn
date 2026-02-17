import { useState, useMemo, useRef, useCallback, useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { buildTaskTree, flattenTree, recalculateWBS, calculateSummaryDates, calcEndDate, calcDuration, calculateCriticalPath, generateOSFromTask, syncProgressFromOS, parsePredecessors, autoScheduleTasks } from '../../../lib/eapService';
import { deleteOSOrder } from '../../../lib/osService';
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

export default function GanttChart({ project, tasks, teamMembers, osOrders = [], onCreateTask, onUpdateTask, onDeleteTask }) {
  const { addToast } = useToast();
  const queryClient = useQueryClient();
  const containerRef = useRef(null);
  const tableRef = useRef(null);
  const timelineRef = useRef(null);

  // State
  const [zoom, setZoom] = useState('week');
  const [collapsedIds, setCollapsedIds] = useState(new Set());
  const [selectedTaskId, setSelectedTaskId] = useState(null);
  const [editingCell, setEditingCell] = useState(null); // { taskId, field }
  const [tableWidth, setTableWidth] = useState(DEFAULT_TABLE_WIDTH);
  const [isResizingTable, setIsResizingTable] = useState(false);
  const [showCriticalPath, setShowCriticalPath] = useState(true);
  const [filterAssignee, setFilterAssignee] = useState('all');
  const [hiddenColumns, setHiddenColumns] = useState(new Set(['wbsNumber']));
  const [isFullscreen, setIsFullscreen] = useState(false);

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

  // Recalcular datas dos pais (summary) ao carregar dados
  useEffect(() => {
    if (tasks.length === 0) return;
    (async () => {
      for (const parentId of summaryIds) {
        const parent = tasks.find(t => t.id === parentId);
        if (!parent) continue;
        const summary = calculateSummaryDates(parentId, tasks);
        if (!summary) continue;
        // Só atualizar se as datas estão diferentes
        if (parent.startDate !== summary.startDate || parent.endDate !== summary.endDate || parent.durationDays !== summary.durationDays) {
          await onUpdateTask(parentId, summary);
        }
      }
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
      .map(d => new Date(d + 'T00:00:00'));

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

    const today = new Date().toISOString().split('T')[0];
    const endDate = calcEndDate(today, 5);

    const newTask = {
      projectId: project.id,
      name: 'Nova Tarefa',
      parentId,
      sortOrder: maxSort + 1,
      level,
      startDate: today,
      endDate,
      durationDays: 5,
      progress: 0,
      assignedTo: '',
      predecessors: [],
    };

    const result = await onCreateTask(newTask);
    if (result) {
      setSelectedTaskId(result.id);
      setEditingCell({ taskId: result.id, field: 'name' });
      // Se adicionou subtarefa, expandir pai
      if (parentId) {
        setCollapsedIds(prev => {
          const next = new Set(prev);
          next.delete(parentId);
          return next;
        });
      }
    }
  }, [tasks, project.id, onCreateTask]);

  const handleAddMilestone = useCallback(async () => {
    const maxSort = tasks.reduce((m, t) => Math.max(m, t.sortOrder || 0), 0);
    const today = new Date().toISOString().split('T')[0];

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
      setSelectedTaskId(result.id);
      setEditingCell({ taskId: result.id, field: 'name' });
    }
  }, [tasks, project.id, onCreateTask]);

  // Mapa de OS vinculadas (precisa estar antes de handleDeleteSelectedTask)
  const osMap = useMemo(() => {
    const map = new Map();
    for (const os of osOrders) {
      map.set(os.id, os);
    }
    return map;
  }, [osOrders]);

  const handleDeleteSelectedTask = useCallback(async () => {
    if (!selectedTaskId) return;

    // Coletar todas as tarefas a deletar (selecionada + filhos recursivos)
    const idsToDelete = [selectedTaskId];
    const collectChildren = (parentId) => {
      for (const t of tasks) {
        if (t.parentId === parentId) {
          idsToDelete.push(t.id);
          collectChildren(t.id);
        }
      }
    };
    collectChildren(selectedTaskId);

    // Limpar OS vinculadas: deletar se "available", manter se em andamento/concluida
    let osDeleted = 0;
    for (const id of idsToDelete) {
      const task = tasks.find(t => t.id === id);
      if (!task?.osOrderId) continue;
      const os = osMap.get(task.osOrderId);
      if (os && (os.status === 'available' || os.status === 'pending')) {
        try {
          await deleteOSOrder(os.id);
          osDeleted++;
        } catch { /* OS pode ja ter sido deletada */ }
      }
    }

    // Deletar tarefas (filhos primeiro, depois pai)
    for (const id of idsToDelete.reverse()) {
      await onDeleteTask(id);
    }

    if (osDeleted > 0) {
      queryClient.invalidateQueries({ queryKey: queryKeys.osOrders });
    }

    setSelectedTaskId(null);
    const msg = osDeleted > 0
      ? `Tarefa excluida (${osDeleted} OS removida${osDeleted > 1 ? 's' : ''})`
      : 'Tarefa excluida';
    addToast(msg, 'success');
  }, [selectedTaskId, tasks, osMap, onDeleteTask, addToast, queryClient]);

  const handleIndent = useCallback(async () => {
    if (!selectedTaskId) return;
    const task = tasks.find(t => t.id === selectedTaskId);
    if (!task) return;

    // Encontrar a tarefa anterior no mesmo nivel
    const siblings = tasks
      .filter(t => t.parentId === task.parentId)
      .sort((a, b) => a.sortOrder - b.sortOrder);
    const idx = siblings.findIndex(t => t.id === task.id);
    if (idx <= 0) return; // Nao pode indentar a primeira

    const newParent = siblings[idx - 1];
    await onUpdateTask(task.id, {
      parentId: newParent.id,
      level: (newParent.level || 0) + 1,
    });
    // Expandir novo pai
    setCollapsedIds(prev => {
      const next = new Set(prev);
      next.delete(newParent.id);
      return next;
    });
  }, [selectedTaskId, tasks, onUpdateTask]);

  const handleOutdent = useCallback(async () => {
    if (!selectedTaskId) return;
    const task = tasks.find(t => t.id === selectedTaskId);
    if (!task || !task.parentId) return;

    const parent = tasks.find(t => t.id === task.parentId);
    if (!parent) return;

    await onUpdateTask(task.id, {
      parentId: parent.parentId || null,
      level: Math.max(0, (parent.level || 0)),
    });
  }, [selectedTaskId, tasks, onUpdateTask]);

  const handleCellEdit = useCallback(async (taskId, field, value) => {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;

    const updates = {};

    // Predecessoras: parsear texto para array
    if (field === 'predecessors') {
      updates.predecessors = parsePredecessors(value, rowTaskMap);
    } else {
      updates[field] = value;
    }

    // Auto-calculo de datas/duracao
    if (field === 'estimatedHours') {
      // Salvar horas reais + recalcular dias
      updates.estimatedHours = value;
      const days = Math.max(1, Math.ceil(value / 8));
      updates.durationDays = days;
      if (task.startDate) {
        updates.endDate = calcEndDate(task.startDate, days);
      }
    } else if (field === 'startDate' && task.durationDays > 0) {
      updates.endDate = calcEndDate(value, task.durationDays);
    } else if (field === 'endDate' && task.startDate) {
      updates.durationDays = calcDuration(task.startDate, value);
      updates.estimatedHours = calcDuration(task.startDate, value) * 8;
    } else if (field === 'durationDays' && task.startDate) {
      updates.endDate = calcEndDate(task.startDate, value);
      updates.estimatedHours = value * 8;
    }

    await onUpdateTask(taskId, updates);

    // Recalcular pai se necessario
    if (task.parentId && ['startDate', 'endDate', 'durationDays', 'estimatedHours', 'progress'].includes(field)) {
      const summary = calculateSummaryDates(task.parentId, tasks.map(t => t.id === taskId ? { ...t, ...updates } : t));
      if (summary) {
        await onUpdateTask(task.parentId, summary);
      }
    }

    // Auto-scheduling: propagar datas quando predecessoras ou datas mudam
    if (['predecessors', 'startDate', 'endDate', 'durationDays', 'estimatedHours'].includes(field)) {
      const updatedTasks = tasks.map(t => t.id === taskId ? { ...t, ...updates } : t);
      const scheduleUpdates = autoScheduleTasks(updatedTasks);
      for (const su of scheduleUpdates) {
        if (su.id !== taskId) {
          await onUpdateTask(su.id, { startDate: su.startDate, endDate: su.endDate });
        }
      }
    }

    setEditingCell(null);
  }, [tasks, onUpdateTask, rowTaskMap]);

  // Drag na barra do gantt
  const handleBarDrag = useCallback(async (taskId, newStartDate, newEndDate) => {
    const duration = calcDuration(newStartDate, newEndDate);
    await onUpdateTask(taskId, {
      startDate: newStartDate,
      endDate: newEndDate,
      durationDays: duration,
    });

    const task = tasks.find(t => t.id === taskId);
    if (task?.parentId) {
      const updated = tasks.map(t => t.id === taskId ? { ...t, startDate: newStartDate, endDate: newEndDate, durationDays: duration } : t);
      const summary = calculateSummaryDates(task.parentId, updated);
      if (summary) {
        await onUpdateTask(task.parentId, summary);
      }
    }

    // Auto-scheduling: propagar para tarefas successoras
    const updatedTasks = tasks.map(t => t.id === taskId ? { ...t, startDate: newStartDate, endDate: newEndDate, durationDays: duration } : t);
    const scheduleUpdates = autoScheduleTasks(updatedTasks);
    for (const su of scheduleUpdates) {
      if (su.id !== taskId) {
        await onUpdateTask(su.id, { startDate: su.startDate, endDate: su.endDate });
      }
    }
  }, [tasks, onUpdateTask]);

  // ==================== PONTE EAP → OS ====================

  // Gerar OS a partir da tarefa selecionada
  const handleGenerateOS = useCallback(async () => {
    if (!selectedTaskId) return;
    const task = tasks.find(t => t.id === selectedTaskId);
    if (!task) return;

    if (task.osOrderId) {
      addToast('Esta tarefa ja possui uma OS vinculada', 'warning');
      return;
    }

    // Nao gerar OS para tarefas raiz (level 0) - elas sao Projetos
    if (task.level === 0 && summaryIds.has(task.id)) {
      addToast('Tarefas raiz viram Projetos de OS. Selecione uma atividade (nivel 1+) para gerar OS.', 'warning');
      return;
    }

    try {
      const os = await generateOSFromTask(task, project.name, tasks);
      if (os) {
        // Invalidar caches para refletir a nova OS, o projeto e o vinculo na tarefa
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
  }, [selectedTaskId, tasks, summaryIds, project.name, addToast, queryClient]);

  // Sincronizar progresso das tarefas com status das OS
  const handleSyncProgress = useCallback(async () => {
    const updates = syncProgressFromOS(tasks, osOrders);
    if (updates.length === 0) {
      addToast('Tudo sincronizado - nenhuma alteracao necessaria', 'info');
      return;
    }

    let count = 0;
    for (const { id, progress } of updates) {
      await onUpdateTask(id, { progress });
      count++;
    }
    addToast(`${count} tarefa${count > 1 ? 's' : ''} sincronizada${count > 1 ? 's' : ''} com as OS`, 'success');
  }, [tasks, osOrders, onUpdateTask, addToast]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (editingCell) return; // Nao interceptar quando editando

      if (e.key === 'Delete' && selectedTaskId) {
        e.preventDefault();
        handleDeleteSelectedTask();
      } else if (e.key === 'Insert') {
        e.preventDefault();
        handleAddTask(null);
      } else if (e.key === 'Tab' && selectedTaskId) {
        e.preventDefault();
        if (e.shiftKey) handleOutdent();
        else handleIndent();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [editingCell, selectedTaskId, handleDeleteSelectedTask, handleAddTask, handleOutdent, handleIndent]);

  // ==================== RENDER ====================

  return (
    <div className="h-full flex flex-col bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-700 overflow-hidden" ref={containerRef}>
      {/* Toolbar */}
      <GanttToolbar
        zoom={zoom}
        onZoomChange={setZoom}
        onAddTask={() => handleAddTask(null)}
        onAddSubTask={() => handleAddTask(selectedTaskId)}
        onAddMilestone={handleAddMilestone}
        onDeleteTask={handleDeleteSelectedTask}
        onIndent={handleIndent}
        onOutdent={handleOutdent}
        showCriticalPath={showCriticalPath}
        onToggleCriticalPath={() => setShowCriticalPath(p => !p)}
        hasSelection={!!selectedTaskId}
        teamMembers={teamMembers}
        filterAssignee={filterAssignee}
        onFilterAssignee={setFilterAssignee}
        onGenerateOS={handleGenerateOS}
        onSyncProgress={handleSyncProgress}
        selectedTask={selectedTaskId ? tasks.find(t => t.id === selectedTaskId) : null}
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
          className="flex-shrink-0 border-r border-slate-200 dark:border-slate-700 flex flex-col"
          style={{ width: tableWidth }}
        >
          <TaskTable
            ref={tableRef}
            tasks={visibleTasks}
            allTasks={tasks}
            summaryIds={summaryIds}
            collapsedIds={collapsedIds}
            selectedTaskId={selectedTaskId}
            editingCell={editingCell}
            criticalIds={criticalIds}
            showCriticalPath={showCriticalPath}
            teamMembers={teamMembers}
            osMap={osMap}
            taskRowMap={taskRowMap}
            hiddenColumns={hiddenColumns}
            rowHeight={ROW_HEIGHT}
            onSelectTask={setSelectedTaskId}
            onToggleCollapse={handleToggleCollapse}
            onEditCell={setEditingCell}
            onCellChange={handleCellEdit}
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
            selectedTaskId={selectedTaskId}
            dateRange={dateRange}
            zoom={zoom}
            zoomConfig={ZOOM_CONFIGS[zoom]}
            rowHeight={ROW_HEIGHT}
            onSelectTask={setSelectedTaskId}
            onBarDrag={handleBarDrag}
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
          {showCriticalPath && <span className="text-red-500">Caminho Critico ativo</span>}
        </div>
        <div className="flex items-center gap-3">
          <span>Tab: Indentar | Shift+Tab: Recuar | Insert: Nova Tarefa | Delete: Excluir</span>
        </div>
      </div>
    </div>
  );
}
