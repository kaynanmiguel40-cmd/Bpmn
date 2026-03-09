import { useState, useRef, useEffect } from 'react';

// ==================== ICONS ====================

const PlusIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
  </svg>
);

const SubTaskIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
  </svg>
);

const MilestoneIcon = () => (
  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2l4 10-4 10-4-10z" />
  </svg>
);

const TrashIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
  </svg>
);

const IndentIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4v16" />
  </svg>
);

const OutdentIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5l-7 7 7 7" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 4v16" />
  </svg>
);

const CriticalPathIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
  </svg>
);

const OSIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
  </svg>
);

const SyncIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
  </svg>
);

const ZoomInIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v6m3-3H7" />
  </svg>
);

const ZoomOutIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM13 10H7" />
  </svg>
);

const ColumnsIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 4h6M9 8h6M9 12h6M9 16h6M9 20h6" />
  </svg>
);

const FullscreenIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
  </svg>
);

const ExitFullscreenIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 9V4H4m0 0l5 5m6-5h5v5m0-5l-5 5M9 15v5H4m0 0l5-5m6 5h5v-5m0 5l-5-5" />
  </svg>
);

// ==================== COLUMN CONFIG (labels para o dropdown) ====================

const COLUMN_OPTIONS = [
  { key: 'rowNumber', label: '#' },
  { key: 'wbsNumber', label: 'WBS' },
  { key: 'durationDays', label: 'Duracao' },
  { key: 'estimatedHours', label: 'Horas' },
  { key: 'startDate', label: 'Inicio' },
  { key: 'endDate', label: 'Termino' },
  { key: 'predecessors', label: 'Predecessoras' },
  { key: 'assignedTo', label: 'Responsavel' },
  { key: 'notes', label: 'Notas' },
  { key: 'progress', label: '% Progresso' },
];

// ==================== TOOLBAR BUTTON ====================

function ToolbarBtn({ onClick, icon, label, disabled, active, danger }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      title={label}
      className={`
        flex items-center gap-1.5 px-2 py-1.5 rounded text-xs font-medium transition-colors
        ${active
          ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400'
          : danger
            ? 'text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20'
            : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700'
        }
        ${disabled ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'}
      `}
    >
      {icon}
      <span className="hidden xl:inline">{label}</span>
    </button>
  );
}

function ToolbarSep() {
  return <div className="w-px h-6 bg-slate-200 dark:bg-slate-700 mx-0.5" />;
}

// ==================== COLUMNS DROPDOWN ====================

function ColumnsDropdown({ hiddenColumns, onToggleColumn }) {
  const [open, setOpen] = useState(false);
  const btnRef = useRef(null);
  const menuRef = useRef(null);
  const [pos, setPos] = useState({ top: 0, left: 0 });

  // Posicionar o menu fixo abaixo do botao
  useEffect(() => {
    if (!open || !btnRef.current) return;
    const rect = btnRef.current.getBoundingClientRect();
    setPos({ top: rect.bottom + 4, left: rect.left });
  }, [open]);

  // Fechar ao clicar fora
  useEffect(() => {
    if (!open) return;
    const handleClick = (e) => {
      if (btnRef.current?.contains(e.target)) return;
      if (menuRef.current?.contains(e.target)) return;
      setOpen(false);
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [open]);

  return (
    <>
      <div ref={btnRef}>
        <ToolbarBtn
          onClick={() => setOpen(o => !o)}
          icon={<ColumnsIcon />}
          label="Colunas"
          active={open}
        />
      </div>
      {open && (
        <div
          ref={menuRef}
          className="fixed bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-xl py-1 min-w-[160px]"
          style={{ top: pos.top, left: pos.left, zIndex: 9999 }}
        >
          {COLUMN_OPTIONS.map(col => (
            <label
              key={col.key}
              className="flex items-center gap-2 px-3 py-1.5 hover:bg-slate-50 dark:hover:bg-slate-700 cursor-pointer text-xs text-slate-700 dark:text-slate-300"
            >
              <input
                type="checkbox"
                checked={!hiddenColumns.has(col.key)}
                onChange={() => onToggleColumn(col.key)}
                className="rounded border-slate-300 dark:border-slate-600 text-blue-600 focus:ring-blue-500"
              />
              {col.label}
            </label>
          ))}
        </div>
      )}
    </>
  );
}

// ==================== COMPONENTE PRINCIPAL ====================

export default function GanttToolbar({
  zoom,
  onZoomChange,
  onAddTask,
  onAddSubTask,
  onAddMilestone,
  onDeleteTask,
  onIndent,
  onOutdent,
  showCriticalPath,
  onToggleCriticalPath,
  showAssigneeOnBar,
  onToggleAssigneeOnBar,
  hasSelection,
  teamMembers,
  filterAssignee,
  onFilterAssignee,
  onGenerateOS,
  onSyncProgress,
  selectedTask,
  summaryIds,
  hiddenColumns,
  onToggleColumn,
  isFullscreen,
  onToggleFullscreen,
}) {
  const zoomLevels = ['day', 'week', 'month'];
  const zoomLabels = { day: 'Dia', week: 'Semana', month: 'Mes' };
  const currentIdx = zoomLevels.indexOf(zoom);

  const handleZoomIn = () => {
    if (currentIdx > 0) onZoomChange(zoomLevels[currentIdx - 1]);
  };

  const handleZoomOut = () => {
    if (currentIdx < zoomLevels.length - 1) onZoomChange(zoomLevels[currentIdx + 1]);
  };

  return (
    <div className="h-10 border-b border-slate-200 dark:border-slate-700 px-2 flex items-center gap-0.5 bg-slate-50 dark:bg-slate-800/50 flex-shrink-0 overflow-x-auto">
      {/* Adicionar */}
      <ToolbarBtn onClick={onAddTask} icon={<PlusIcon />} label="Tarefa" />
      <ToolbarBtn onClick={onAddSubTask} icon={<SubTaskIcon />} label="Subtarefa" disabled={!hasSelection} />
      <ToolbarBtn onClick={onAddMilestone} icon={<MilestoneIcon />} label="Marco" />

      <ToolbarSep />

      {/* Hierarquia */}
      <ToolbarBtn onClick={onIndent} icon={<IndentIcon />} label="Indentar" disabled={!hasSelection} />
      <ToolbarBtn onClick={onOutdent} icon={<OutdentIcon />} label="Recuar" disabled={!hasSelection} />

      <ToolbarSep />

      {/* Excluir */}
      <ToolbarBtn onClick={onDeleteTask} icon={<TrashIcon />} label="Excluir" disabled={!hasSelection} danger />

      <ToolbarSep />

      {/* Zoom */}
      <ToolbarBtn onClick={handleZoomIn} icon={<ZoomInIcon />} label="" disabled={currentIdx === 0} />
      <span className="px-1.5 text-xs font-medium text-slate-600 dark:text-slate-400 min-w-[50px] text-center">
        {zoomLabels[zoom]}
      </span>
      <ToolbarBtn onClick={handleZoomOut} icon={<ZoomOutIcon />} label="" disabled={currentIdx === zoomLevels.length - 1} />

      <ToolbarSep />

      {/* Caminho Critico */}
      <ToolbarBtn
        onClick={onToggleCriticalPath}
        icon={<CriticalPathIcon />}
        label="Critico"
        active={showCriticalPath}
      />

      {/* Mostrar responsavel na barra */}
      <ToolbarBtn
        onClick={onToggleAssigneeOnBar}
        icon={<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>}
        label="Resp."
        active={showAssigneeOnBar}
      />

      <ToolbarSep />

      {/* Ponte EAP → OS */}
      <ToolbarBtn
        onClick={onGenerateOS}
        icon={<OSIcon />}
        label="Gerar OS"
        disabled={!hasSelection || (selectedTask && selectedTask.osOrderId) || (selectedTask && selectedTask.level === 0 && summaryIds?.has(selectedTask.id))}
      />
      <ToolbarBtn
        onClick={onSyncProgress}
        icon={<SyncIcon />}
        label="Sync"
      />

      <ToolbarSep />

      {/* Colunas visiveis */}
      <ColumnsDropdown hiddenColumns={hiddenColumns} onToggleColumn={onToggleColumn} />

      {/* Fullscreen */}
      <ToolbarBtn
        onClick={onToggleFullscreen}
        icon={isFullscreen ? <ExitFullscreenIcon /> : <FullscreenIcon />}
        label={isFullscreen ? 'Sair' : 'Tela Cheia'}
      />

      {/* Spacer */}
      <div className="flex-1" />

      {/* Filtro Responsavel */}
      <select
        value={filterAssignee}
        onChange={e => onFilterAssignee(e.target.value)}
        className="text-xs px-2 py-1 border border-slate-200 dark:border-slate-600 rounded bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-300 focus:ring-1 focus:ring-blue-500"
      >
        <option value="all">Todos</option>
        {teamMembers.map(m => (
          <option key={m.id} value={m.name}>{m.name}</option>
        ))}
      </select>
    </div>
  );
}
