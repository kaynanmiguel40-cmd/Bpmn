import { forwardRef, useState, useRef, useEffect } from 'react';
import { formatPredecessors } from '../../../lib/eapService';

// ==================== ICONS ====================

const ChevronIcon = ({ expanded }) => (
  <svg
    className={`w-3.5 h-3.5 transition-transform ${expanded ? 'rotate-90' : ''}`}
    fill="none" stroke="currentColor" viewBox="0 0 24 24"
  >
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
  </svg>
);

const MilestoneIcon = () => (
  <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2l4 10-4 10-4-10z" />
  </svg>
);

const SummaryIcon = () => (
  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7h18M3 12h18M3 17h18" />
  </svg>
);

// ==================== EDITABLE CELL ====================

function EditableCell({ value, field, taskId, isEditing, onStartEdit, onFinish, type = 'text', options, className = '', displayValue }) {
  const inputRef = useRef(null);
  const [localValue, setLocalValue] = useState(value);

  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      if (type === 'text') inputRef.current.select();
    }
  }, [isEditing, type]);

  const handleFinish = () => {
    if (localValue !== value) {
      const finalVal = type === 'number' ? (parseInt(localValue, 10) || 0) : localValue;
      onFinish(taskId, field, finalVal);
    } else {
      onFinish(null);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleFinish();
    } else if (e.key === 'Escape') {
      setLocalValue(value);
      onFinish(null);
    }
  };

  if (isEditing) {
    if (type === 'select' && options) {
      return (
        <select
          ref={inputRef}
          value={localValue}
          onChange={e => { setLocalValue(e.target.value); onFinish(taskId, field, e.target.value); }}
          onBlur={handleFinish}
          className="w-full h-full px-1 py-0 text-xs border border-blue-500 rounded bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none"
        >
          {options.map(o => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
      );
    }

    return (
      <input
        ref={inputRef}
        type={type === 'number' ? 'number' : type === 'datetime-local' ? 'datetime-local' : type === 'date' ? 'date' : 'text'}
        value={localValue}
        onChange={e => setLocalValue(e.target.value)}
        onBlur={handleFinish}
        onKeyDown={handleKeyDown}
        min={type === 'number' ? 0 : undefined}
        max={type === 'number' && field === 'progress' ? 100 : undefined}
        className="w-full h-full px-1 py-0 text-xs border border-blue-500 rounded bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none"
      />
    );
  }

  const displayText = displayValue ?? value ?? '';
  return (
    <div
      className={`w-full h-full flex items-center px-1 cursor-text truncate ${className}`}
      onDoubleClick={() => onStartEdit({ taskId, field })}
      title={field === 'name' && displayText.length > 20 ? displayText : undefined}
    >
      {displayText}
    </div>
  );
}

// Formatar horas para exibição
function formatHours(h) {
  if (h == null || h === 0 || h === '') return '';
  if (h < 1) return `${Math.round(h * 60)}m`;
  return `${parseFloat(h.toFixed(1))}h`;
}

// ==================== PROGRESS BAR INLINE ====================

function ProgressCell({ value, taskId, onFinish }) {
  const [editing, setEditing] = useState(false);
  const [localVal, setLocalVal] = useState(value);
  const inputRef = useRef(null);

  useEffect(() => { setLocalVal(value); }, [value]);

  useEffect(() => {
    if (editing && inputRef.current) inputRef.current.focus();
  }, [editing]);

  if (editing) {
    return (
      <input
        ref={inputRef}
        type="number"
        min={0}
        max={100}
        value={localVal}
        onChange={e => setLocalVal(e.target.value)}
        onBlur={() => {
          const v = Math.min(100, Math.max(0, parseInt(localVal, 10) || 0));
          if (v !== value) onFinish(taskId, 'progress', v);
          setEditing(false);
        }}
        onKeyDown={e => {
          if (e.key === 'Enter') e.target.blur();
          if (e.key === 'Escape') { setLocalVal(value); setEditing(false); }
        }}
        className="w-full h-full px-1 py-0 text-xs border border-blue-500 rounded bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none"
      />
    );
  }

  return (
    <div className="flex items-center gap-1 w-full px-1 cursor-pointer" onDoubleClick={() => setEditing(true)}>
      <div className="flex-1 bg-slate-200 dark:bg-slate-600 rounded-full h-2.5 overflow-hidden">
        <div
          className="h-full rounded-full bg-blue-500 transition-all"
          style={{ width: `${value}%` }}
        />
      </div>
      <span className="text-[11px] w-8 text-right">{value}%</span>
    </div>
  );
}

// ==================== TASK DETAIL CELL (notas + anexos) ====================

const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2MB

function TaskDetailCell({ notes, attachments = [], taskId, taskName, wbsNumber, onFinish }) {
  const [open, setOpen] = useState(false);
  const [localNotes, setLocalNotes] = useState(notes || '');
  const [localAtts, setLocalAtts] = useState(attachments);
  const [linkUrl, setLinkUrl] = useState('');
  const [linkLabel, setLinkLabel] = useState('');
  const panelRef = useRef(null);

  useEffect(() => { setLocalNotes(notes || ''); }, [notes]);
  useEffect(() => { setLocalAtts(attachments); }, [attachments]);

  // Fechar ao clicar fora
  useEffect(() => {
    if (!open) return;
    const handleClick = (e) => {
      if (panelRef.current?.contains(e.target)) return;
      handleSave();
    };
    // Delay para nao fechar imediatamente ao abrir
    const timer = setTimeout(() => {
      document.addEventListener('mousedown', handleClick);
    }, 100);
    return () => {
      clearTimeout(timer);
      document.removeEventListener('mousedown', handleClick);
    };
  }, [open, localNotes, localAtts]);

  const handleSave = () => {
    const notesChanged = localNotes !== (notes || '');
    const attsChanged = JSON.stringify(localAtts) !== JSON.stringify(attachments);
    if (notesChanged) onFinish(taskId, 'notes', localNotes);
    if (attsChanged) onFinish(taskId, 'attachments', localAtts);
    setOpen(false);
  };

  const addLink = () => {
    if (!linkUrl.trim()) return;
    const newAtt = {
      id: `att_${Date.now()}`,
      type: 'link',
      url: linkUrl.trim(),
      label: linkLabel.trim() || linkUrl.trim(),
      createdAt: new Date().toISOString(),
    };
    setLocalAtts(prev => [...prev, newAtt]);
    setLinkUrl('');
    setLinkLabel('');
  };

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > MAX_FILE_SIZE) {
      alert('Arquivo muito grande (max 2MB)');
      return;
    }
    const reader = new FileReader();
    reader.onload = (ev) => {
      const newAtt = {
        id: `att_${Date.now()}`,
        type: 'image',
        data: ev.target.result,
        label: file.name,
        createdAt: new Date().toISOString(),
      };
      setLocalAtts(prev => [...prev, newAtt]);
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const removeAtt = (id) => {
    setLocalAtts(prev => prev.filter(a => a.id !== id));
  };

  const hasNotes = !!(notes && notes.trim());
  const count = attachments.length;
  const preview = hasNotes ? notes.trim().slice(0, 30) : '';

  return (
    <>
      <div
        className="flex items-center gap-1 w-full h-full cursor-pointer px-1 group"
        onClick={() => setOpen(true)}
        title={hasNotes ? notes : 'Clique para adicionar anotacoes'}
      >
        {hasNotes ? (
          <span className="text-[10px] text-slate-600 dark:text-slate-300 truncate leading-tight">
            {preview}{notes.trim().length > 30 ? '...' : ''}
          </span>
        ) : (
          <svg className="w-3.5 h-3.5 text-slate-300 dark:text-slate-600 group-hover:text-blue-400 transition-colors mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
        )}
        {count > 0 && (
          <span className="w-3.5 h-3.5 bg-blue-500 text-white text-[8px] font-bold rounded-full flex items-center justify-center shrink-0">{count}</span>
        )}
      </div>

      {/* Painel lateral de anotacoes */}
      {open && (
        <>
          <div className="fixed inset-0 bg-black/20 z-[9998]" onClick={handleSave} />
          <div
            ref={panelRef}
            className="fixed top-0 right-0 h-full w-[360px] bg-white dark:bg-slate-800 border-l border-slate-200 dark:border-slate-700 shadow-2xl z-[9999] flex flex-col animate-slide-in-right"
          >
            {/* Header */}
            <div className="px-4 py-3 border-b border-slate-200 dark:border-slate-700">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-100">Anotacoes</h3>
                </div>
                <button onClick={handleSave} className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors">
                  <svg className="w-4 h-4 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              {/* Nome da tarefa */}
              <div className="mt-2 flex items-center gap-2">
                {wbsNumber && (
                  <span className="text-[10px] font-mono font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 px-1.5 py-0.5 rounded">{wbsNumber}</span>
                )}
                <span className="text-sm text-slate-700 dark:text-slate-200 font-medium truncate">{taskName || 'Tarefa'}</span>
              </div>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {/* Notas */}
              <div>
                <label className="block text-[10px] font-semibold text-slate-500 dark:text-slate-400 mb-1.5 uppercase tracking-wide">Observacoes</label>
                <textarea
                  value={localNotes}
                  onChange={e => setLocalNotes(e.target.value)}
                  onKeyDown={e => {
                    if (e.key === 'Escape') handleSave();
                    if (e.key === 'Enter' && e.ctrlKey) handleSave();
                  }}
                  rows={6}
                  placeholder="Registre observacoes internas, acompanhamentos, decisoes..."
                  className="w-full text-sm border border-slate-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-200 p-3 resize-y focus:outline-none focus:ring-2 focus:ring-blue-500 dark:placeholder-slate-500"
                  autoFocus
                />
              </div>

              {/* Anexos existentes */}
              {localAtts.length > 0 && (
                <div>
                  <label className="block text-[10px] font-semibold text-slate-500 dark:text-slate-400 mb-1.5 uppercase tracking-wide">Anexos ({localAtts.length})</label>
                  <div className="space-y-1.5">
                    {localAtts.map(att => (
                      <div key={att.id} className="flex items-center gap-2 p-2 rounded-lg border border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-750 group">
                        {att.type === 'link' ? (
                          <svg className="w-4 h-4 text-blue-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                          </svg>
                        ) : (
                          att.data && att.data.startsWith('data:image') ? (
                            <img src={att.data} alt={att.label} className="w-8 h-8 rounded object-cover shrink-0" />
                          ) : (
                            <svg className="w-4 h-4 text-slate-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                          )
                        )}
                        <span className="text-xs text-slate-600 dark:text-slate-300 truncate flex-1">
                          {att.type === 'link' ? (
                            <a href={att.url} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline" onClick={e => e.stopPropagation()}>
                              {att.label}
                            </a>
                          ) : att.label}
                        </span>
                        <button
                          onClick={() => removeAtt(att.id)}
                          className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-red-500 transition-opacity"
                        >
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Adicionar Link */}
              <div>
                <label className="block text-[10px] font-semibold text-slate-500 dark:text-slate-400 mb-1.5 uppercase tracking-wide">Adicionar Link</label>
                <div className="flex gap-1.5">
                  <input
                    type="url"
                    value={linkUrl}
                    onChange={e => setLinkUrl(e.target.value)}
                    placeholder="https://..."
                    className="flex-1 text-xs border border-slate-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-200 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    onKeyDown={e => { if (e.key === 'Enter') addLink(); }}
                  />
                  <button onClick={addLink} className="text-xs px-3 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 shrink-0 font-medium">+</button>
                </div>
                {linkUrl && (
                  <input
                    type="text"
                    value={linkLabel}
                    onChange={e => setLinkLabel(e.target.value)}
                    placeholder="Nome do link (opcional)"
                    className="w-full mt-1.5 text-xs border border-slate-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-200 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    onKeyDown={e => { if (e.key === 'Enter') addLink(); }}
                  />
                )}
              </div>

              {/* Upload Arquivo */}
              <div>
                <label className="block text-[10px] font-semibold text-slate-500 dark:text-slate-400 mb-1.5 uppercase tracking-wide">Upload Arquivo</label>
                <label className="flex items-center gap-2 p-3 rounded-lg border-2 border-dashed border-slate-300 dark:border-slate-600 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700 hover:border-blue-400 transition-colors">
                  <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <span className="text-xs text-slate-500 dark:text-slate-400">Imagem ou arquivo (max 2MB)</span>
                  <input type="file" accept="image/*,.pdf,.doc,.docx" onChange={handleFileUpload} className="hidden" />
                </label>
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between px-4 py-3 border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
              <span className="text-[10px] text-slate-400">Ctrl+Enter para salvar</span>
              <div className="flex gap-2">
                <button onClick={() => { setLocalNotes(notes || ''); setLocalAtts(attachments); setOpen(false); }} className="text-xs px-3 py-1.5 text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 border border-slate-300 dark:border-slate-600 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">
                  Cancelar
                </button>
                <button onClick={handleSave} className="text-xs px-4 py-1.5 bg-blue-500 text-white rounded-lg hover:bg-blue-600 font-medium transition-colors">
                  Salvar
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
}

// ==================== COLUMNS CONFIG ====================

const HOURS_PER_DAY = 10; // 08:00-18:00

const COLUMNS = [
  { key: 'rowNumber', label: '#', width: 28 },
  { key: 'wbsNumber', label: 'WBS', width: 42 },
  { key: 'name', label: 'Nome da Tarefa', width: 160, flex: true },
  { key: 'durationDays', label: 'Horas', width: 50, type: 'number' },
  { key: 'startDate', label: 'Inicio', width: 110, type: 'datetime-local' },
  { key: 'endDate', label: 'Termino', width: 110, type: 'datetime-local' },
  { key: 'predecessors', label: 'Pred.', width: 58 },
  { key: 'assignedTo', label: 'Resp.', width: 80 },
  { key: 'supervisor', label: 'Superv.', width: 80 },
  { key: 'notes', label: 'Notas', width: 120 },
  { key: 'progress', label: '%', width: 50 },
];

// ==================== COMPONENTE PRINCIPAL ====================

const GripIcon = () => (
  <svg className="w-3 h-3" viewBox="0 0 6 10" fill="currentColor">
    <circle cx="1" cy="1" r="0.9"/><circle cx="5" cy="1" r="0.9"/>
    <circle cx="1" cy="5" r="0.9"/><circle cx="5" cy="5" r="0.9"/>
    <circle cx="1" cy="9" r="0.9"/><circle cx="5" cy="9" r="0.9"/>
  </svg>
);

const TaskTable = forwardRef(function TaskTable({
  tasks,
  allTasks,
  summaryIds,
  collapsedIds,
  selectedTaskIds,
  editingCell,
  criticalIds,
  showCriticalPath,
  teamMembers,
  osMap,
  taskRowMap,
  hiddenColumns = new Set(),
  rowHeight,
  onSelectTask,
  onDragSelect,
  onToggleCollapse,
  onEditCell,
  onCellChange,
  onReorderTask,
  onOpenOS,
  onScroll,
}, ref) {

  // Drag-select state (arrastar pra selecionar estilo Windows)
  const dragRef = useRef(null); // { startIdx }

  const handleRowMouseDown = (e, idx) => {
    if (e.button !== 0) return;
    if (e.target.closest('input, select, button, [data-drag-handle]')) return;
    dragRef.current = { startIdx: idx };
  };

  const handleRowMouseEnter = (idx) => {
    if (!dragRef.current) return;
    const from = Math.min(dragRef.current.startIdx, idx);
    const to = Math.max(dragRef.current.startIdx, idx);
    if (from !== to) {
      const ids = tasks.slice(from, to + 1).map(t => t.id);
      onDragSelect(ids);
    }
  };

  useEffect(() => {
    const handleMouseUp = () => { dragRef.current = null; };
    window.addEventListener('mouseup', handleMouseUp);
    return () => window.removeEventListener('mouseup', handleMouseUp);
  }, []);

  // ==================== DRAG REORDER ====================
  const reorderRef = useRef(null); // { task, startIdx }
  const dropIndicatorRef = useRef(null); // ref espelho do state (para closure do mouseup)
  const bodyRef = useRef(null);
  const [dropIndicator, setDropIndicator] = useState(null); // { y } posicao absoluta
  const [draggingId, setDraggingId] = useState(null);

  const handleDragReorderStart = (e, task, rowIdx) => {
    e.stopPropagation();
    e.preventDefault();
    reorderRef.current = { task, startIdx: rowIdx, startY: e.clientY };
    setDraggingId(task.id);

    const handleMove = (ev) => {
      const body = bodyRef.current;
      if (!body || !reorderRef.current) return;
      const rect = body.getBoundingClientRect();
      const scrollTop = body.scrollTop;
      const relY = ev.clientY - rect.top + scrollTop;
      const targetIdx = Math.max(0, Math.min(tasks.length - 1, Math.floor(relY / rowHeight)));
      const targetTask = tasks[targetIdx];
      const draggedTask = reorderRef.current.task;

      // So permitir drop entre irmaos (mesmo parentId)
      if (!targetTask || targetTask.parentId !== draggedTask.parentId) {
        dropIndicatorRef.current = null;
        setDropIndicator(null);
        return;
      }
      if (targetTask.id === draggedTask.id) {
        dropIndicatorRef.current = null;
        setDropIndicator(null);
        return;
      }

      // Determinar se acima ou abaixo do meio da row
      const rowMiddle = (targetIdx + 0.5) * rowHeight;
      const position = relY < rowMiddle ? 'above' : 'below';
      const indicatorY = position === 'above' ? targetIdx * rowHeight : (targetIdx + 1) * rowHeight;

      const indicator = { targetIdx, position, y: indicatorY };
      dropIndicatorRef.current = indicator;
      setDropIndicator(indicator);
    };

    const handleUp = () => {
      document.removeEventListener('mousemove', handleMove);
      document.removeEventListener('mouseup', handleUp);
      document.body.style.cursor = '';

      const indicator = dropIndicatorRef.current;
      if (indicator && reorderRef.current && onReorderTask) {
        const draggedTask = reorderRef.current.task;
        const targetTask = tasks[indicator.targetIdx];

        if (targetTask && targetTask.id !== draggedTask.id) {
          // Pegar irmaos ordenados por sortOrder
          const siblings = allTasks
            .filter(t => t.parentId === draggedTask.parentId)
            .sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));

          // Remover o arrastado e inserir na nova posicao
          const withoutDragged = siblings.filter(s => s.id !== draggedTask.id);
          const targetSiblingIdx = withoutDragged.findIndex(s => s.id === targetTask.id);

          if (targetSiblingIdx !== -1) {
            const insertAt = indicator.position === 'above' ? targetSiblingIdx : targetSiblingIdx + 1;
            withoutDragged.splice(insertAt, 0, draggedTask);

            // Calcular updates de sortOrder
            const updates = [];
            withoutDragged.forEach((t, i) => {
              if (t.sortOrder !== i) {
                updates.push({
                  taskId: t.id,
                  before: { sortOrder: t.sortOrder },
                  after: { sortOrder: i },
                });
              }
            });

            if (updates.length > 0) {
              onReorderTask(updates);
            }
          }
        }
      }

      reorderRef.current = null;
      dropIndicatorRef.current = null;
      setDraggingId(null);
      setDropIndicator(null);
    };

    document.body.style.cursor = 'grabbing';
    document.addEventListener('mousemove', handleMove);
    document.addEventListener('mouseup', handleUp);
  };

  // Filtrar colunas visiveis
  const visibleColumns = COLUMNS.filter(col => !hiddenColumns.has(col.key));

  // ==================== COLUMN RESIZE ====================
  const [columnWidths, setColumnWidths] = useState(() => {
    const initial = {};
    COLUMNS.forEach(col => { initial[col.key] = col.width; });
    return initial;
  });
  const resizeRef = useRef(null); // { colKey, startX, startWidth }

  const handleColumnResizeStart = (e, colKey) => {
    e.preventDefault();
    e.stopPropagation();
    const startWidth = columnWidths[colKey] || COLUMNS.find(c => c.key === colKey)?.width || 60;
    resizeRef.current = { colKey, startX: e.clientX, startWidth };

    const handleMove = (ev) => {
      if (!resizeRef.current) return;
      const diff = ev.clientX - resizeRef.current.startX;
      const newWidth = Math.max(28, resizeRef.current.startWidth + diff);
      setColumnWidths(prev => ({ ...prev, [resizeRef.current.colKey]: newWidth }));
    };

    const handleUp = () => {
      resizeRef.current = null;
      document.removeEventListener('mousemove', handleMove);
      document.removeEventListener('mouseup', handleUp);
      document.body.style.cursor = '';
    };

    document.body.style.cursor = 'col-resize';
    document.addEventListener('mousemove', handleMove);
    document.addEventListener('mouseup', handleUp);
  };

  // Funcao para obter largura efetiva de uma coluna
  const getColWidth = (col) => columnWidths[col.key] || col.width;

  // Auto-fit: duplo clique na borda do header ajusta largura ao conteudo
  const handleColumnAutoFit = (colKey) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    ctx.font = '11px ui-monospace, monospace';

    let maxWidth = 40; // minimo

    for (const task of tasks) {
      let text = '';
      if (colKey === 'name') {
        text = task.name || '';
        const indent = (task.level || 0) * 20 + 30; // indent + icone + padding
        const measured = ctx.measureText(text).width + indent;
        if (measured > maxWidth) maxWidth = measured;
        continue;
      } else if (colKey === 'wbsNumber') {
        text = task.wbsNumber || '';
      } else if (colKey === 'durationDays') {
        const hrs = (task.durationDays || 1) * HOURS_PER_DAY;
        text = hrs > 0 ? formatHours(hrs) : '';
      } else if (colKey === 'startDate' || colKey === 'endDate') {
        const d = colKey === 'startDate' ? task.startDate : task.endDate;
        if (d) {
          const date = new Date(d.includes?.('T') ? d : d + 'T00:00:00');
          if (!isNaN(date)) {
            text = `${String(date.getDate()).padStart(2,'0')}/${String(date.getMonth()+1).padStart(2,'0')}/${String(date.getFullYear()).slice(-2)} ${String(date.getHours()).padStart(2,'0')}:${String(date.getMinutes()).padStart(2,'0')}`;
          }
        }
      } else if (colKey === 'predecessors') {
        text = taskRowMap ? formatPredecessors(task.predecessors, taskRowMap) : '';
      } else if (colKey === 'assignedTo') {
        text = task.assignedTo || '';
      } else if (colKey === 'supervisor') {
        text = task.supervisor || '';
      } else if (colKey === 'progress') {
        text = task.progress != null ? task.progress + '%' : '';
      }

      const measured = ctx.measureText(text).width + 16;
      if (measured > maxWidth) maxWidth = measured;
    }

    setColumnWidths(prev => ({ ...prev, [colKey]: Math.ceil(maxWidth) }));
  };

  const formatDate = (d) => {
    if (!d) return '';
    const date = new Date(d.includes('T') ? d : d + 'T00:00:00');
    if (isNaN(date)) return '';
    const dd = String(date.getDate()).padStart(2, '0');
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const yy = String(date.getFullYear()).slice(-2);
    const hh = String(date.getHours()).padStart(2, '0');
    const mi = String(date.getMinutes()).padStart(2, '0');
    return `${dd}/${mm}/${yy} ${hh}:${mi}`;
  };

  const assigneeOptions = [
    { value: '', label: '(nenhum)' },
    ...teamMembers.map(m => ({ value: m.name, label: m.name })),
  ];

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center border-b border-slate-300 dark:border-slate-600 bg-slate-100 dark:bg-slate-800 flex-shrink-0" style={{ height: rowHeight * 2 }}>
        {visibleColumns.map(col => (
          <div
            key={col.key}
            className={`relative flex items-center justify-center px-1 text-[11px] font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wide border-r border-slate-200 dark:border-slate-700 h-full overflow-hidden ${col.flex ? 'flex-1 min-w-0' : 'shrink-0'}`}
            style={col.flex ? { minWidth: getColWidth(col) } : { width: getColWidth(col) }}
          >
            <span className="truncate">{col.label}</span>
            {/* Resize handle */}
            {col.key !== 'rowNumber' && (
              <div
                className="absolute right-0 top-0 w-1.5 h-full cursor-col-resize hover:bg-blue-400/40 z-10"
                onMouseDown={(e) => handleColumnResizeStart(e, col.key)}
                onDoubleClick={(e) => { e.stopPropagation(); handleColumnAutoFit(col.key); }}
              />
            )}
          </div>
        ))}
      </div>

      {/* Body */}
      <div
        ref={(el) => {
          bodyRef.current = el;
          if (typeof ref === 'function') ref(el);
          else if (ref) ref.current = el;
        }}
        className="flex-1 overflow-y-auto overflow-x-hidden relative"
        onScroll={onScroll}
      >
        {/* Drop indicator line */}
        {dropIndicator && (
          <div
            className="absolute left-0 right-0 h-0.5 bg-blue-500 pointer-events-none z-10"
            style={{ top: dropIndicator.y }}
          />
        )}
        {tasks.length === 0 ? (
          <div className="flex items-center justify-center h-32 text-sm text-slate-400 dark:text-slate-500">
            Nenhuma tarefa. Clique em + Tarefa para comecar.
          </div>
        ) : (
          tasks.map((task, rowIdx) => {
            const isSummary = summaryIds.has(task.id);
            const isCollapsed = collapsedIds.has(task.id);
            const isSelected = selectedTaskIds.has(task.id);
            const isCritical = showCriticalPath && criticalIds.has(task.id);

            return (
              <div
                key={task.id}
                className={`flex items-center border-b border-slate-100 dark:border-slate-800 transition-colors select-none ${
                  draggingId === task.id ? 'opacity-40' : ''
                } ${
                  isSelected
                    ? 'bg-blue-50 dark:bg-blue-900/20'
                    : isCritical
                      ? 'bg-red-50/50 dark:bg-red-900/10'
                      : 'hover:bg-slate-50 dark:hover:bg-slate-800/50'
                }`}
                style={{ height: rowHeight }}
                onClick={(e) => onSelectTask(task.id, e)}
                onMouseDown={(e) => handleRowMouseDown(e, rowIdx)}
                onMouseEnter={() => handleRowMouseEnter(rowIdx)}
              >
                {visibleColumns.map(col => {
                  const isEditingThis = editingCell?.taskId === task.id && editingCell?.field === col.key;

                  // Row Number (#)
                  if (col.key === 'rowNumber') {
                    return (
                      <div
                        key={col.key}
                        className="group/grip flex items-center justify-center text-[11px] text-slate-400 dark:text-slate-500 border-r border-slate-100 dark:border-slate-800 h-full font-mono shrink-0"
                        style={{ width: getColWidth(col) }}
                      >
                        <span
                          data-drag-handle
                          className="cursor-grab opacity-0 group-hover/grip:opacity-60 hover:!opacity-100 select-none"
                          onMouseDown={(e) => handleDragReorderStart(e, task, rowIdx)}
                        >
                          <GripIcon />
                        </span>
                        <span className="group-hover/grip:hidden">{taskRowMap?.get(task.id) || '-'}</span>
                      </div>
                    );
                  }

                  // WBS
                  if (col.key === 'wbsNumber') {
                    return (
                      <div
                        key={col.key}
                        className="flex items-center justify-center text-[11px] text-slate-400 dark:text-slate-500 border-r border-slate-100 dark:border-slate-800 h-full font-mono shrink-0"
                        style={{ width: getColWidth(col) }}
                      >
                        {task.wbsNumber || '-'}
                      </div>
                    );
                  }

                  // Nome (com indent e icones)
                  if (col.key === 'name') {
                    const indent = (task.level || 0) * 20;
                    return (
                      <div
                        key={col.key}
                        className={`flex items-center h-full border-r border-slate-100 dark:border-slate-800 min-w-0 flex-1 ${isSummary ? 'font-semibold' : ''} ${isCritical ? 'text-red-700 dark:text-red-400' : 'text-slate-800 dark:text-slate-200'}`}
                        style={{ minWidth: getColWidth(col), paddingLeft: indent + 4 }}
                      >
                        {/* Toggle / Icon */}
                        <div className="w-5 flex-shrink-0 flex items-center justify-center">
                          {isSummary ? (
                            <button
                              onClick={(e) => { e.stopPropagation(); onToggleCollapse(task.id); }}
                              className="p-0.5 hover:bg-slate-200 dark:hover:bg-slate-600 rounded"
                            >
                              <ChevronIcon expanded={!isCollapsed} />
                            </button>
                          ) : task.isMilestone ? (
                            <span className="text-amber-500"><MilestoneIcon /></span>
                          ) : null}
                        </div>

                        {/* Nome editavel */}
                        <EditableCell
                          value={task.name}
                          field="name"
                          taskId={task.id}
                          isEditing={isEditingThis}
                          onStartEdit={onEditCell}
                          onFinish={(id, f, v) => id ? onCellChange(id, f, v) : onEditCell(null)}
                          className={`text-xs ${isSummary ? 'font-semibold' : ''}`}
                        />

                        {/* Badge OS vinculada — clicavel para abrir OS */}
                        {task.osOrderId && osMap && (() => {
                          const os = osMap.get(task.osOrderId);
                          const statusColor = os
                            ? os.status === 'done' ? 'bg-emerald-500'
                            : os.status === 'in_progress' ? 'bg-blue-500'
                            : os.status === 'blocked' ? 'bg-red-500'
                            : 'bg-slate-400'
                            : 'bg-slate-400';
                          return (
                            <button
                              type="button"
                              onClick={(e) => { e.stopPropagation(); onOpenOS?.(task.osOrderId); }}
                              title={os ? `Abrir OS: ${os.title} (${os.status})` : 'Abrir OS vinculada'}
                              className={`ml-1 px-1 py-0 text-[9px] font-bold text-white rounded ${statusColor} flex-shrink-0 hover:opacity-80 cursor-pointer transition-opacity`}
                            >
                              OS
                            </button>
                          );
                        })()}
                      </div>
                    );
                  }

                  // Duracao em horas uteis (10h/dia)
                  if (col.key === 'durationDays') {
                    // Horas sempre derivadas de durationDays (que vem de calcDuration entre datas)
                    const hours = (task.durationDays || (task.isMilestone ? 0 : 1)) * HOURS_PER_DAY;
                    const durLabel = task.isMilestone ? '0h' : formatHours(hours);
                    return (
                      <div
                        key={col.key}
                        className="flex items-center justify-center text-xs text-slate-600 dark:text-slate-400 border-r border-slate-100 dark:border-slate-800 h-full shrink-0"
                        style={{ width: getColWidth(col) }}
                      >
                        {!isSummary && !task.isMilestone ? (
                          <EditableCell
                            value={parseFloat(hours.toFixed(1))}
                            displayValue={durLabel}
                            field="estimatedHours"
                            taskId={task.id}
                            isEditing={isEditingThis}
                            onStartEdit={onEditCell}
                            onFinish={(id, f, v) => id ? onCellChange(id, f, parseFloat(v) || HOURS_PER_DAY) : onEditCell(null)}
                            type="number"
                            className="text-center"
                          />
                        ) : (
                          <span className="text-[11px]">{formatHours(hours)}</span>
                        )}
                      </div>
                    );
                  }

                  // Datas (datetime-local)
                  if (col.key === 'startDate' || col.key === 'endDate') {
                    return (
                      <div
                        key={col.key}
                        className="flex items-center text-[10px] text-slate-600 dark:text-slate-400 border-r border-slate-100 dark:border-slate-800 h-full shrink-0"
                        style={{ width: getColWidth(col) }}
                      >
                        {!isSummary ? (
                          <EditableCell
                            value={task[col.key]}
                            displayValue={formatDate(task[col.key])}
                            field={col.key}
                            taskId={task.id}
                            isEditing={isEditingThis}
                            onStartEdit={onEditCell}
                            onFinish={(id, f, v) => id ? onCellChange(id, f, v) : onEditCell(null)}
                            type="datetime-local"
                          />
                        ) : (
                          <span className="px-1">{formatDate(task[col.key])}</span>
                        )}
                      </div>
                    );
                  }

                  // Progresso
                  if (col.key === 'progress') {
                    return (
                      <div
                        key={col.key}
                        className="flex items-center text-xs text-slate-600 dark:text-slate-400 border-r border-slate-100 dark:border-slate-800 h-full shrink-0"
                        style={{ width: getColWidth(col) }}
                      >
                        <ProgressCell
                          value={task.progress}
                          taskId={task.id}
                          onFinish={onCellChange}
                        />
                      </div>
                    );
                  }

                  // Predecessoras
                  if (col.key === 'predecessors') {
                    const display = formatPredecessors(task.predecessors, taskRowMap || new Map());
                    return (
                      <div
                        key={col.key}
                        className="flex items-center text-[11px] text-slate-600 dark:text-slate-400 border-r border-slate-100 dark:border-slate-800 h-full shrink-0"
                        style={{ width: getColWidth(col) }}
                      >
                        {!isSummary ? (
                          <EditableCell
                            value={display}
                            field="predecessors"
                            taskId={task.id}
                            isEditing={isEditingThis}
                            onStartEdit={onEditCell}
                            onFinish={(id, f, v) => id ? onCellChange(id, f, v) : onEditCell(null)}
                            className="text-[11px]"
                          />
                        ) : (
                          <span className="px-1 truncate">{display}</span>
                        )}
                      </div>
                    );
                  }

                  // Responsavel
                  if (col.key === 'assignedTo') {
                    return (
                      <div
                        key={col.key}
                        className="flex items-center text-xs text-slate-600 dark:text-slate-400 h-full shrink-0 border-r border-slate-100 dark:border-slate-800"
                        style={{ width: getColWidth(col) }}
                      >
                        <EditableCell
                          value={task.assignedTo}
                          field="assignedTo"
                          taskId={task.id}
                          isEditing={isEditingThis}
                          onStartEdit={onEditCell}
                          onFinish={(id, f, v) => id ? onCellChange(id, f, v) : onEditCell(null)}
                          type="select"
                          options={assigneeOptions}
                        />
                      </div>
                    );
                  }

                  // Supervisor
                  if (col.key === 'supervisor') {
                    return (
                      <div
                        key={col.key}
                        className="flex items-center text-xs text-slate-600 dark:text-slate-400 h-full shrink-0 border-r border-slate-100 dark:border-slate-800"
                        style={{ width: getColWidth(col) }}
                      >
                        <EditableCell
                          value={task.supervisor}
                          field="supervisor"
                          taskId={task.id}
                          isEditing={isEditingThis}
                          onStartEdit={onEditCell}
                          onFinish={(id, f, v) => id ? onCellChange(id, f, v) : onEditCell(null)}
                          type="select"
                          options={assigneeOptions}
                        />
                      </div>
                    );
                  }

                  // Notas / Descricao
                  if (col.key === 'notes') {
                    return (
                      <div
                        key={col.key}
                        className="flex items-center justify-center text-xs text-slate-600 dark:text-slate-400 border-r border-slate-100 dark:border-slate-800 h-full shrink-0"
                        style={{ width: getColWidth(col) }}
                      >
                        <TaskDetailCell
                          notes={task.notes}
                          attachments={task.attachments}
                          taskId={task.id}
                          taskName={task.name}
                          wbsNumber={task.wbsNumber}
                          onFinish={onCellChange}
                        />
                      </div>
                    );
                  }

                  return null;
                })}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
});

export default TaskTable;
