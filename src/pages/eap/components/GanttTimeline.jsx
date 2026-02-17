import { forwardRef, useMemo, useState, useRef, useCallback, useEffect } from 'react';

// ==================== UTILIDADES ====================

function daysBetween(d1, d2) {
  const t1 = new Date(d1).getTime();
  const t2 = new Date(d2).getTime();
  return Math.round((t2 - t1) / (1000 * 60 * 60 * 24));
}

function addDays(date, days) {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

function getMonthLabel(d) {
  return d.toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' });
}

function getMonthShortLabel(d) {
  return d.toLocaleDateString('pt-BR', { month: 'short' }).replace('.', '');
}

function isWeekend(d) {
  const day = d.getDay();
  return day === 0 || day === 6;
}

function isSameDay(d1, d2) {
  return d1.getFullYear() === d2.getFullYear() && d1.getMonth() === d2.getMonth() && d1.getDate() === d2.getDate();
}

// ==================== GENERATE TIMELINE COLUMNS ====================

function generateColumns(dateRange, zoom) {
  const cols = [];
  const { start, end } = dateRange;
  const current = new Date(start);

  if (zoom === 'day' || zoom === 'week') {
    // Ambos usam colunas por dia
    // Para week, alinhar ao inicio da semana (domingo)
    if (zoom === 'week') {
      current.setDate(current.getDate() - current.getDay());
    }
    while (current <= end) {
      cols.push({
        date: new Date(current),
        label: current.getDate().toString(),
        isWeekend: isWeekend(current),
      });
      current.setDate(current.getDate() + 1);
    }
  } else {
    // Meses
    current.setDate(1);
    while (current <= end) {
      const daysInMonth = new Date(current.getFullYear(), current.getMonth() + 1, 0).getDate();
      cols.push({
        date: new Date(current),
        label: getMonthLabel(current),
        daysInCol: daysInMonth,
      });
      current.setMonth(current.getMonth() + 1);
    }
  }

  return cols;
}

// ==================== GENERATE HEADER TIERS ====================

/** Tier: anos */
function generateYearGroups(columns) {
  const groups = [];
  let current = null;
  for (let i = 0; i < columns.length; i++) {
    const year = columns[i].date.getFullYear();
    if (!current || current.key !== year) {
      current = { key: year, label: year.toString(), startIdx: i, count: 1 };
      groups.push(current);
    } else {
      current.count++;
    }
  }
  return groups;
}

/** Tier: meses */
function generateMonthGroups(columns) {
  const groups = [];
  let current = null;
  for (let i = 0; i < columns.length; i++) {
    const monthKey = `${columns[i].date.getFullYear()}-${columns[i].date.getMonth()}`;
    if (!current || current.key !== monthKey) {
      current = {
        key: monthKey,
        label: getMonthShortLabel(columns[i].date),
        startIdx: i,
        count: 1,
      };
      groups.push(current);
    } else {
      current.count++;
    }
  }
  return groups;
}

/** Tier: semanas (agrupa dias em semanas para zoom week) - formato "Fev 16, '26" */
function generateWeekGroups(columns) {
  const groups = [];
  let current = null;
  for (let i = 0; i < columns.length; i++) {
    const d = columns[i].date;
    // Calcular inicio da semana (domingo)
    const weekStart = new Date(d);
    weekStart.setDate(weekStart.getDate() - weekStart.getDay());
    const weekKey = `${weekStart.getFullYear()}-${weekStart.getMonth()}-${weekStart.getDate()}`;

    if (!current || current.key !== weekKey) {
      const m = weekStart.toLocaleDateString('pt-BR', { month: 'short' }).replace('.', '');
      const label = `${m.charAt(0).toUpperCase() + m.slice(1)} ${weekStart.getDate()}, '${weekStart.getFullYear().toString().slice(2)}`;
      current = {
        key: weekKey,
        label,
        startIdx: i,
        count: 1,
      };
      groups.push(current);
    } else {
      current.count++;
    }
  }
  return groups;
}

// ==================== COMPONENTE BARRA ====================

function GanttBar({ task, x, y, width, height, isSummary, isMilestone, isCritical, isSelected, onMouseDown }) {
  const barHeight = isSummary ? 6 : 18;
  const barY = y + (height - barHeight) / 2;
  const progressWidth = Math.max(0, (task.progress / 100) * width);

  if (isMilestone) {
    const size = 7;
    const cx = x;
    const cy = y + height / 2;
    return (
      <g>
        <polygon
          points={`${cx},${cy - size} ${cx + size},${cy} ${cx},${cy + size} ${cx - size},${cy}`}
          fill={isCritical ? '#ef4444' : '#f59e0b'}
          stroke={isSelected ? '#3b82f6' : '#0f172a'}
          strokeWidth={isSelected ? 2 : 1}
          className="cursor-pointer"
        />
        <text
          x={cx + size + 4}
          y={cy + 3}
          className="text-[10px] fill-slate-600 dark:fill-slate-400"
          style={{ fontSize: '9px' }}
        >
          {task.name}
        </text>
      </g>
    );
  }

  if (isSummary) {
    const color = isCritical ? '#ef4444' : '#475569';
    const lineY = y + height / 2;
    const clawH = 5;
    const w = Math.max(2, width);
    return (
      <g className="cursor-pointer">
        {/* Linha fina horizontal */}
        <line x1={x} y1={lineY} x2={x + w} y2={lineY} stroke={color} strokeWidth={2} />
        {/* Garra esquerda (▼) */}
        <polyline points={`${x},${lineY - clawH} ${x},${lineY + clawH} ${x + 5},${lineY}`} fill="none" stroke={color} strokeWidth={2} strokeLinejoin="round" />
        {/* Garra direita (▼) */}
        <polyline points={`${x + w},${lineY - clawH} ${x + w},${lineY + clawH} ${x + w - 5},${lineY}`} fill="none" stroke={color} strokeWidth={2} strokeLinejoin="round" />
        {/* Progresso */}
        {progressWidth > 0 && (
          <line x1={x} y1={lineY + 3} x2={x + progressWidth} y2={lineY + 3} stroke={isCritical ? '#fca5a5' : '#3b82f6'} strokeWidth={2} strokeLinecap="round" />
        )}
      </g>
    );
  }

  return (
    <g className="cursor-pointer" onMouseDown={onMouseDown}>
      <rect x={x + 1} y={barY + 1} width={Math.max(4, width)} height={barHeight} fill="rgba(0,0,0,0.06)" rx={2} />
      <rect
        x={x} y={barY} width={Math.max(4, width)} height={barHeight}
        fill={isCritical ? '#fecaca' : (task.color || '#93c5fd')}
        stroke={isSelected ? '#2563eb' : (isCritical ? '#ef4444' : '#60a5fa')}
        strokeWidth={isSelected ? 1.5 : 0.5} rx={2}
      />
      {progressWidth > 0 && (
        <rect x={x} y={barY} width={Math.min(progressWidth, Math.max(4, width))} height={barHeight} fill={isCritical ? '#ef4444' : '#3b82f6'} rx={2} />
      )}
      {task.progress === 100 && width > 20 && (
        <text x={x + Math.max(4, width) / 2} y={barY + barHeight / 2 + 3.5} textAnchor="middle" className="fill-white" style={{ fontSize: '9px' }}>
          ✓
        </text>
      )}
      {task.progress > 0 && task.progress < 100 && width > 50 && (
        <text x={x + Math.max(4, width) / 2} y={barY + barHeight / 2 + 3} textAnchor="middle" className="fill-white" style={{ fontSize: '8px', fontWeight: 600 }}>
          {task.progress}%
        </text>
      )}
      <rect x={x + Math.max(4, width) - 4} y={barY} width={8} height={barHeight} fill="transparent" className="cursor-ew-resize" data-resize="end" />
      <rect x={x - 4} y={barY} width={8} height={barHeight} fill="transparent" className="cursor-ew-resize" data-resize="start" />
    </g>
  );
}

// ==================== DEPENDENCY ARROWS ====================

function DependencyArrows({ tasks, visibleTasks, getTaskPosition, criticalIds, showCriticalPath }) {
  const arrows = [];

  for (const task of visibleTasks) {
    if (!task.predecessors || task.predecessors.length === 0) continue;

    for (const pred of task.predecessors) {
      const predTask = tasks.find(t => t.id === pred.taskId);
      if (!predTask) continue;

      const predPos = getTaskPosition(predTask.id);
      const taskPos = getTaskPosition(task.id);
      if (!predPos || !taskPos) continue;

      const type = pred.type || 'FS';
      let startX, startY, endX, endY;

      if (type === 'FS') {
        startX = predPos.x + predPos.width; startY = predPos.y + predPos.height / 2;
        endX = taskPos.x; endY = taskPos.y + taskPos.height / 2;
      } else if (type === 'SS') {
        startX = predPos.x; startY = predPos.y + predPos.height / 2;
        endX = taskPos.x; endY = taskPos.y + taskPos.height / 2;
      } else if (type === 'FF') {
        startX = predPos.x + predPos.width; startY = predPos.y + predPos.height / 2;
        endX = taskPos.x + taskPos.width; endY = taskPos.y + taskPos.height / 2;
      } else {
        startX = predPos.x; startY = predPos.y + predPos.height / 2;
        endX = taskPos.x + taskPos.width; endY = taskPos.y + taskPos.height / 2;
      }

      const isCriticalArrow = showCriticalPath && criticalIds.has(task.id) && criticalIds.has(predTask.id);
      const color = isCriticalArrow ? '#ef4444' : '#94a3b8';
      const marker = isCriticalArrow ? 'url(#arrowhead-critical)' : 'url(#arrowhead)';

      const midX = startX + 10;
      const path = endX > startX + 20
        ? `M${startX},${startY} H${midX} V${endY} H${endX}`
        : `M${startX},${startY} H${midX} V${endY > startY ? startY + 20 : startY - 20} H${endX - 10} V${endY} H${endX}`;

      arrows.push(
        <g key={`${predTask.id}-${task.id}`}>
          <path d={path} fill="none" stroke={color} strokeWidth={isCriticalArrow ? 2 : 1.5} markerEnd={marker} />
        </g>
      );
    }
  }

  return <>{arrows}</>;
}

// ==================== COMPONENTE PRINCIPAL ====================

const GanttTimeline = forwardRef(function GanttTimeline({
  tasks,
  allTasks,
  summaryIds,
  criticalIds,
  showCriticalPath,
  selectedTaskId,
  dateRange,
  zoom,
  zoomConfig,
  rowHeight,
  onSelectTask,
  onBarDrag,
  onScroll,
}, ref) {

  const svgRef = useRef(null);
  const scrollContainerRef = useRef(null);
  const [dragState, setDragState] = useState(null);
  const hasScrolled = useRef(false);

  const colWidth = zoomConfig.colWidth;
  const columns = useMemo(() => generateColumns(dateRange, zoom), [dateRange, zoom]);

  // Header tiers
  const yearGroups = useMemo(() => (zoom !== 'month') ? generateYearGroups(columns) : null, [columns, zoom]);
  const monthGroups = useMemo(() => (zoom !== 'month') ? generateMonthGroups(columns) : null, [columns, zoom]);
  const weekGroups = useMemo(() => (zoom === 'week') ? generateWeekGroups(columns) : null, [columns, zoom]);

  // Para month zoom, agrupar por ano (tier superior)
  const monthZoomYearGroups = useMemo(() => {
    if (zoom !== 'month') return null;
    const groups = [];
    let current = null;
    for (let i = 0; i < columns.length; i++) {
      const yearKey = columns[i].date.getFullYear();
      if (!current || current.key !== yearKey) {
        current = { key: yearKey, label: yearKey.toString(), startIdx: i, count: 1 };
        groups.push(current);
      } else {
        current.count++;
      }
    }
    return groups;
  }, [columns, zoom]);

  const totalWidth = columns.length * colWidth;
  const totalHeight = tasks.length * rowHeight;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // ==================== POSICIONAMENTO ====================

  // day e week usam colunas por dia; month usa proporcional
  const dateToX = useCallback((dateStr) => {
    if (!dateStr) return 0;
    const date = new Date(dateStr + 'T00:00:00');
    const days = daysBetween(dateRange.start, date);

    if (zoom === 'day' || zoom === 'week') {
      return days * colWidth;
    } else {
      const totalDays = daysBetween(dateRange.start, dateRange.end);
      return totalDays > 0 ? (days / totalDays) * totalWidth : 0;
    }
  }, [dateRange, zoom, colWidth, totalWidth]);

  const xToDate = useCallback((x) => {
    let days;
    if (zoom === 'day' || zoom === 'week') {
      days = Math.round(x / colWidth);
    } else {
      const totalDays = daysBetween(dateRange.start, dateRange.end);
      days = Math.round((x / totalWidth) * totalDays);
    }
    const date = addDays(dateRange.start, days);
    return date.toISOString().split('T')[0];
  }, [dateRange, zoom, colWidth, totalWidth]);

  // Auto-scroll para a primeira tarefa ou hoje ao montar
  useEffect(() => {
    if (hasScrolled.current || tasks.length === 0) return;
    const container = scrollContainerRef.current;
    if (!container) return;

    // Encontrar a primeira data do projeto
    const firstDate = tasks
      .map(t => t.startDate)
      .filter(Boolean)
      .sort()[0];

    if (firstDate) {
      const x = dateToX(firstDate);
      // Scroll para um pouco antes da primeira tarefa (margem de 50px)
      container.scrollLeft = Math.max(0, x - 50);
      hasScrolled.current = true;
    }
  }, [tasks, dateToX]);

  const getTaskPosition = useCallback((taskId) => {
    const idx = tasks.findIndex(t => t.id === taskId);
    if (idx === -1) return null;
    const task = tasks[idx];
    if (!task.startDate) return null;

    const x = dateToX(task.startDate);
    const endX = task.endDate ? dateToX(task.endDate) : x;
    const barWidth = Math.max(4, endX - x + colWidth);

    return { x, y: idx * rowHeight, width: barWidth, height: rowHeight };
  }, [tasks, dateToX, colWidth, rowHeight]);

  const todayX = useMemo(() => {
    const days = daysBetween(dateRange.start, today);
    if (zoom === 'day' || zoom === 'week') return days * colWidth;
    const totalDays = daysBetween(dateRange.start, dateRange.end);
    return totalDays > 0 ? (days / totalDays) * totalWidth : 0;
  }, [dateRange, today, zoom, colWidth, totalWidth]);

  // ==================== DRAG HANDLER ====================

  const handleBarMouseDown = useCallback((e, task) => {
    if (summaryIds.has(task.id) || task.isMilestone) return;
    e.preventDefault();
    e.stopPropagation();

    const isResize = e.target.dataset?.resize;
    const startMouseX = e.clientX;
    const startX = dateToX(task.startDate);
    const endX = task.endDate ? dateToX(task.endDate) : startX;

    const onMouseMove = (e2) => {
      const diffX = e2.clientX - startMouseX;
      if (isResize === 'end') {
        const newEndX = Math.max(startX + colWidth / 2, endX + diffX);
        setDragState({ taskId: task.id, startDate: task.startDate, endDate: xToDate(newEndX) });
      } else if (isResize === 'start') {
        const newStartX = Math.min(endX - colWidth / 2, startX + diffX);
        setDragState({ taskId: task.id, startDate: xToDate(newStartX), endDate: task.endDate });
      } else {
        const newStartX = startX + diffX;
        const barW = endX - startX;
        setDragState({ taskId: task.id, startDate: xToDate(newStartX), endDate: xToDate(newStartX + barW) });
      }
    };

    const onMouseUp = () => {
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
      setDragState(prev => {
        if (prev && (prev.startDate !== task.startDate || prev.endDate !== task.endDate)) {
          onBarDrag(prev.taskId, prev.startDate, prev.endDate);
        }
        return null;
      });
    };

    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
  }, [dateToX, xToDate, colWidth, summaryIds, onBarDrag]);

  // ==================== RENDER HEADER ====================

  const renderHeader = () => {
    if (zoom === 'month') {
      // 2 tiers: Ano > Mes
      return (
        <>
          <div className="flex" style={{ height: rowHeight }}>
            {monthZoomYearGroups.map(g => (
              <div key={g.key} className="flex items-center justify-center border-r border-slate-200 dark:border-slate-700 text-[11px] font-semibold text-slate-600 dark:text-slate-400 uppercase" style={{ width: g.count * colWidth }}>
                {g.label}
              </div>
            ))}
          </div>
          <div className="flex" style={{ height: rowHeight }}>
            {columns.map((col, i) => (
              <div key={i} className="flex items-center justify-center border-r border-slate-200 dark:border-slate-700 text-[10px] text-slate-500 dark:text-slate-400" style={{ width: colWidth }}>
                {col.label}
              </div>
            ))}
          </div>
        </>
      );
    }

    if (zoom === 'week') {
      // 2 tiers estilo MS Project: Data da semana > Letra do dia
      const dayLetters = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S'];
      return (
        <>
          {/* Tier 1: Semanas (data inicio ex: "Fev 16, '26") */}
          <div className="flex" style={{ height: 36 }}>
            {weekGroups.map(g => (
              <div key={g.key} className="flex items-center border-r border-b border-slate-300 dark:border-slate-600 text-[10px] font-semibold text-slate-600 dark:text-slate-400 pl-1.5 bg-slate-50 dark:bg-slate-800" style={{ width: g.count * colWidth }}>
                {g.label}
              </div>
            ))}
          </div>
          {/* Tier 2: Letra do dia da semana (D, S, T, Q, Q, S, S) */}
          <div className="flex" style={{ height: 36 }}>
            {columns.map((col, i) => (
              <div
                key={i}
                className={`flex items-center justify-center border-r text-[10px] font-medium ${
                  col.isWeekend
                    ? 'bg-amber-50 dark:bg-amber-900/15 text-slate-400 dark:text-slate-500 border-slate-200 dark:border-slate-700'
                    : 'text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700'
                } ${isSameDay(col.date, today) ? 'bg-blue-100 dark:bg-blue-900/30 font-bold text-blue-600 dark:text-blue-400' : ''}`}
                style={{ width: colWidth }}
              >
                {dayLetters[col.date.getDay()]}
              </div>
            ))}
          </div>
        </>
      );
    }

    // zoom === 'day': 3 tiers: Ano > Mes > Dia
    return (
      <>
        <div className="flex" style={{ height: 18 }}>
          {yearGroups.map(g => (
            <div key={g.key} className="flex items-center justify-center border-r border-b border-slate-200 dark:border-slate-700 text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider bg-slate-50 dark:bg-slate-800" style={{ width: g.count * colWidth }}>
              {g.label}
            </div>
          ))}
        </div>
        <div className="flex" style={{ height: 26 }}>
          {monthGroups.map(g => (
            <div key={g.key} className="flex items-center justify-center border-r border-slate-200 dark:border-slate-700 text-[10px] font-semibold text-slate-600 dark:text-slate-400 uppercase" style={{ width: g.count * colWidth }}>
              {g.label}
            </div>
          ))}
        </div>
        <div className="flex" style={{ height: 28 }}>
          {columns.map((col, i) => (
            <div
              key={i}
              className={`flex items-center justify-center border-r border-slate-200 dark:border-slate-700 text-[10px] ${
                col.isWeekend
                  ? 'bg-slate-200/50 dark:bg-slate-700/50 text-slate-400 dark:text-slate-500'
                  : 'text-slate-500 dark:text-slate-400'
              } ${isSameDay(col.date, today) ? 'bg-blue-100 dark:bg-blue-900/30 font-bold text-blue-600 dark:text-blue-400' : ''}`}
              style={{ width: colWidth }}
            >
              {col.label}
            </div>
          ))}
        </div>
      </>
    );
  };

  // ==================== RENDER ====================

  return (
    <div className="flex flex-col h-full">
      {/* Timeline Header */}
      <div className="flex-shrink-0 border-b border-slate-300 dark:border-slate-600 bg-slate-100 dark:bg-slate-800 overflow-hidden" style={{ height: rowHeight * 2 }}>
        <div style={{ width: totalWidth, minWidth: '100%' }}>
          {renderHeader()}
        </div>
      </div>

      {/* Timeline Body */}
      <div ref={(el) => { scrollContainerRef.current = el; if (typeof ref === 'function') ref(el); else if (ref) ref.current = el; }} className="flex-1 overflow-auto" onScroll={onScroll}>
        <svg ref={svgRef} width={totalWidth} height={Math.max(totalHeight, 200)} className="select-none">
          <defs>
            <marker id="arrowhead" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto">
              <polygon points="0 0, 8 3, 0 6" fill="#94a3b8" />
            </marker>
            <marker id="arrowhead-critical" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto">
              <polygon points="0 0, 8 3, 0 6" fill="#ef4444" />
            </marker>
          </defs>

          {/* Grid verticais */}
          {columns.map((col, i) => (
            <g key={i}>
              <line
                x1={i * colWidth} y1={0} x2={i * colWidth} y2={totalHeight}
                stroke={col.isWeekend ? '#e2e8f0' : '#f1f5f9'} strokeWidth={0.5}
                className="dark:stroke-slate-800"
              />
              {col.isWeekend && (zoom === 'day' || zoom === 'week') && (
                <rect x={i * colWidth} y={0} width={colWidth} height={totalHeight} fill="#fef3c7" className="dark:fill-amber-900/10" opacity={0.4} />
              )}
            </g>
          ))}

          {/* Grid horizontais */}
          {tasks.map((_, i) => (
            <line key={i} x1={0} y1={(i + 1) * rowHeight} x2={totalWidth} y2={(i + 1) * rowHeight} stroke="#f1f5f9" strokeWidth={0.5} className="dark:stroke-slate-800" />
          ))}

          {/* Selected row */}
          {selectedTaskId && (() => {
            const idx = tasks.findIndex(t => t.id === selectedTaskId);
            if (idx === -1) return null;
            return <rect x={0} y={idx * rowHeight} width={totalWidth} height={rowHeight} fill="#eff6ff" className="dark:fill-blue-900/10" />;
          })()}

          {/* Today line */}
          {todayX > 0 && todayX < totalWidth && (
            <g>
              <line x1={todayX} y1={0} x2={todayX} y2={Math.max(totalHeight, 200)} stroke="#ef4444" strokeWidth={2} strokeDasharray="4,4" />
              <rect x={todayX - 16} y={0} width={32} height={14} rx={3} fill="#ef4444" />
              <text x={todayX} y={10} textAnchor="middle" fill="white" style={{ fontSize: '8px', fontWeight: 700 }}>HOJE</text>
            </g>
          )}

          {/* Dependency Arrows */}
          <DependencyArrows tasks={allTasks} visibleTasks={tasks} getTaskPosition={getTaskPosition} criticalIds={criticalIds} showCriticalPath={showCriticalPath} />

          {/* Task Bars */}
          {tasks.map((task, idx) => {
            if (!task.startDate) return null;

            const isSummary = summaryIds.has(task.id);
            const isCritical = showCriticalPath && criticalIds.has(task.id);
            const isSelected = task.id === selectedTaskId;

            const displayTask = dragState?.taskId === task.id
              ? { ...task, startDate: dragState.startDate, endDate: dragState.endDate }
              : task;

            const x = dateToX(displayTask.startDate);
            const endX = displayTask.endDate ? dateToX(displayTask.endDate) : x;
            const barWidth = task.isMilestone ? 0 : Math.max(4, endX - x + colWidth);

            return (
              <g key={task.id} onClick={() => onSelectTask(task.id)}>
                <GanttBar
                  task={displayTask}
                  x={x}
                  y={idx * rowHeight}
                  width={barWidth}
                  height={rowHeight}
                  isSummary={isSummary}
                  isMilestone={task.isMilestone}
                  isCritical={isCritical}
                  isSelected={isSelected}
                  onMouseDown={(e) => handleBarMouseDown(e, task)}
                />
              </g>
            );
          })}
        </svg>
      </div>
    </div>
  );
});

export default GanttTimeline;
