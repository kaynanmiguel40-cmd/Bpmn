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

  return (
    <div
      className={`w-full h-full flex items-center px-1 cursor-text truncate ${className}`}
      onDoubleClick={() => onStartEdit({ taskId, field })}
    >
      {displayValue ?? value ?? ''}
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

function TaskDetailCell({ notes, attachments = [], taskId, onFinish }) {
  const [open, setOpen] = useState(false);
  const [localNotes, setLocalNotes] = useState(notes || '');
  const [localAtts, setLocalAtts] = useState(attachments);
  const [linkUrl, setLinkUrl] = useState('');
  const [linkLabel, setLinkLabel] = useState('');
  const btnRef = useRef(null);
  const panelRef = useRef(null);
  const [pos, setPos] = useState({ top: 0, left: 0 });

  useEffect(() => { setLocalNotes(notes || ''); }, [notes]);
  useEffect(() => { setLocalAtts(attachments); }, [attachments]);

  useEffect(() => {
    if (!open || !btnRef.current) return;
    const rect = btnRef.current.getBoundingClientRect();
    const left = Math.min(rect.left, window.innerWidth - 310);
    const top = rect.bottom + 4;
    const maxTop = window.innerHeight - 400;
    setPos({ top: Math.min(top, maxTop), left: Math.max(8, left - 100) });
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const handleClick = (e) => {
      if (btnRef.current?.contains(e.target)) return;
      if (panelRef.current?.contains(e.target)) return;
      handleSave();
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
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

  const hasContent = !!(notes && notes.trim()) || attachments.length > 0;
  const count = attachments.length;

  return (
    <>
      <div
        ref={btnRef}
        className="flex items-center justify-center w-full h-full cursor-pointer relative"
        onDoubleClick={() => setOpen(true)}
        title={hasContent ? `${notes || ''}\n${count} anexo(s)` : 'Duplo clique para detalhes'}
      >
        {hasContent ? (
          <svg className="w-3.5 h-3.5 text-blue-500" fill="currentColor" viewBox="0 0 24 24">
            <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6zm-1 2l5 5h-5V4zM6 20V4h5v7h7v9H6z"/>
            <path d="M8 13h8v1H8zm0 3h5v1H8z"/>
          </svg>
        ) : (
          <svg className="w-3.5 h-3.5 text-slate-300 dark:text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
        )}
        {count > 0 && (
          <span className="absolute -top-1 -right-0.5 w-3.5 h-3.5 bg-blue-500 text-white text-[8px] font-bold rounded-full flex items-center justify-center">{count}</span>
        )}
      </div>
      {open && (
        <div
          ref={panelRef}
          className="fixed bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-xl p-3 z-[9999] max-h-[380px] overflow-y-auto"
          style={{ top: pos.top, left: pos.left, width: 300 }}
        >
          {/* Notas */}
          <div className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 mb-1 uppercase">Notas</div>
          <textarea
            value={localNotes}
            onChange={e => setLocalNotes(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Escape') { setOpen(false); }
              if (e.key === 'Enter' && e.ctrlKey) handleSave();
            }}
            rows={3}
            placeholder="Descricao da tarefa..."
            className="w-full text-xs border border-slate-200 dark:border-slate-600 rounded bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-200 p-2 resize-none focus:outline-none focus:ring-1 focus:ring-blue-500"
          />

          {/* Anexos existentes */}
          {localAtts.length > 0 && (
            <div className="mt-2">
              <div className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 mb-1 uppercase">Anexos ({localAtts.length})</div>
              <div className="space-y-1">
                {localAtts.map(att => (
                  <div key={att.id} className="flex items-center gap-2 p-1.5 rounded border border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-750 group">
                    {att.type === 'link' ? (
                      <svg className="w-3.5 h-3.5 text-blue-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                      </svg>
                    ) : (
                      att.data && att.data.startsWith('data:image') ? (
                        <img src={att.data} alt={att.label} className="w-7 h-7 rounded object-cover shrink-0" />
                      ) : (
                        <svg className="w-3.5 h-3.5 text-slate-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                      )
                    )}
                    <span className="text-[11px] text-slate-600 dark:text-slate-300 truncate flex-1">
                      {att.type === 'link' ? (
                        <a href={att.url} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline" onClick={e => e.stopPropagation()}>
                          {att.label}
                        </a>
                      ) : att.label}
                    </span>
                    <button
                      onClick={() => removeAtt(att.id)}
                      className="opacity-0 group-hover:opacity-100 p-0.5 text-slate-400 hover:text-red-500 transition-opacity"
                    >
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Adicionar Link */}
          <div className="mt-2">
            <div className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 mb-1 uppercase">Adicionar Link</div>
            <div className="flex gap-1">
              <input
                type="url"
                value={linkUrl}
                onChange={e => setLinkUrl(e.target.value)}
                placeholder="https://..."
                className="flex-1 text-[11px] border border-slate-200 dark:border-slate-600 rounded bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-200 px-2 py-1 focus:outline-none focus:ring-1 focus:ring-blue-500"
                onKeyDown={e => { if (e.key === 'Enter') addLink(); }}
              />
              <button onClick={addLink} className="text-[10px] px-2 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 shrink-0">+</button>
            </div>
            {linkUrl && (
              <input
                type="text"
                value={linkLabel}
                onChange={e => setLinkLabel(e.target.value)}
                placeholder="Nome do link (opcional)"
                className="w-full mt-1 text-[11px] border border-slate-200 dark:border-slate-600 rounded bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-200 px-2 py-1 focus:outline-none focus:ring-1 focus:ring-blue-500"
                onKeyDown={e => { if (e.key === 'Enter') addLink(); }}
              />
            )}
          </div>

          {/* Upload Arquivo */}
          <div className="mt-2">
            <div className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 mb-1 uppercase">Upload Arquivo</div>
            <label className="flex items-center gap-2 p-2 rounded border border-dashed border-slate-300 dark:border-slate-600 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
              <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span className="text-[11px] text-slate-500 dark:text-slate-400">Imagem ou arquivo (max 2MB)</span>
              <input type="file" accept="image/*,.pdf,.doc,.docx" onChange={handleFileUpload} className="hidden" />
            </label>
          </div>

          {/* Acoes */}
          <div className="flex items-center justify-between mt-3 pt-2 border-t border-slate-100 dark:border-slate-700">
            <span className="text-[10px] text-slate-400">Ctrl+Enter para salvar</span>
            <div className="flex gap-1">
              <button onClick={() => setOpen(false)} className="text-[10px] px-2 py-0.5 text-slate-500 hover:text-slate-700 dark:hover:text-slate-300">Cancelar</button>
              <button onClick={handleSave} className="text-[10px] px-3 py-0.5 bg-blue-500 text-white rounded hover:bg-blue-600">Salvar</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

// ==================== COLUMNS CONFIG ====================

const HOURS_PER_DAY = 8;

const COLUMNS = [
  { key: 'rowNumber', label: '#', width: 28 },
  { key: 'wbsNumber', label: 'WBS', width: 42 },
  { key: 'name', label: 'Nome da Tarefa', width: 160, flex: true },
  { key: 'durationDays', label: 'Dur.', width: 45, type: 'number' },
  { key: 'estimatedHours', label: 'Horas', width: 50, type: 'number' },
  { key: 'startDate', label: 'Inicio', width: 110, type: 'datetime-local' },
  { key: 'endDate', label: 'Termino', width: 110, type: 'datetime-local' },
  { key: 'predecessors', label: 'Pred.', width: 58 },
  { key: 'assignedTo', label: 'Resp.', width: 80 },
  { key: 'notes', label: 'Notas', width: 60 },
  { key: 'progress', label: '%', width: 50 },
];

// ==================== COMPONENTE PRINCIPAL ====================

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
  onScroll,
}, ref) {

  // Drag-select state (arrastar pra selecionar estilo Windows)
  const dragRef = useRef(null); // { startIdx }

  const handleRowMouseDown = (e, idx) => {
    if (e.button !== 0) return; // so botao esquerdo
    if (e.target.closest('input, select, button')) return; // nao interceptar inputs
    dragRef.current = { startIdx: idx };
  };

  const handleRowMouseEnter = (idx) => {
    if (!dragRef.current) return;
    const from = Math.min(dragRef.current.startIdx, idx);
    const to = Math.max(dragRef.current.startIdx, idx);
    // So ativar drag-select se moveu pelo menos 1 row
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

  // Filtrar colunas visiveis
  const visibleColumns = COLUMNS.filter(col => !hiddenColumns.has(col.key));

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
            className={`flex items-center justify-center px-1 text-[11px] font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wide border-r border-slate-200 dark:border-slate-700 h-full overflow-hidden ${col.flex ? 'flex-1 min-w-0' : 'shrink-0'}`}
            style={col.flex ? { minWidth: col.width } : { width: col.width }}
          >
            <span className="truncate">{col.label}</span>
          </div>
        ))}
      </div>

      {/* Body */}
      <div
        ref={ref}
        className="flex-1 overflow-y-auto overflow-x-hidden"
        onScroll={onScroll}
      >
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
                        className="flex items-center justify-center text-[11px] text-slate-400 dark:text-slate-500 border-r border-slate-100 dark:border-slate-800 h-full font-mono shrink-0"
                        style={{ width: col.width }}
                      >
                        {taskRowMap?.get(task.id) || '-'}
                      </div>
                    );
                  }

                  // WBS
                  if (col.key === 'wbsNumber') {
                    return (
                      <div
                        key={col.key}
                        className="flex items-center justify-center text-[11px] text-slate-400 dark:text-slate-500 border-r border-slate-100 dark:border-slate-800 h-full font-mono shrink-0"
                        style={{ width: col.width }}
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
                        style={{ minWidth: col.width, paddingLeft: indent + 4 }}
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

                        {/* Badge OS vinculada */}
                        {task.osOrderId && osMap && (() => {
                          const os = osMap.get(task.osOrderId);
                          const statusColor = os
                            ? os.status === 'done' ? 'bg-emerald-500'
                            : os.status === 'in_progress' ? 'bg-blue-500'
                            : os.status === 'blocked' ? 'bg-red-500'
                            : 'bg-slate-400'
                            : 'bg-slate-400';
                          return (
                            <span
                              title={os ? `OS: ${os.title} (${os.status})` : 'OS vinculada'}
                              className={`ml-1 px-1 py-0 text-[9px] font-bold text-white rounded ${statusColor} flex-shrink-0`}
                            >
                              OS
                            </span>
                          );
                        })()}
                      </div>
                    );
                  }

                  // Duracao
                  if (col.key === 'durationDays') {
                    const isEstimated = !task.estimatedHours;
                    const durLabel = task.isMilestone ? '0' : `${task.durationDays || 1}${isEstimated ? '?' : 'd'}`;
                    return (
                      <div
                        key={col.key}
                        className="flex items-center justify-center text-xs text-slate-600 dark:text-slate-400 border-r border-slate-100 dark:border-slate-800 h-full shrink-0"
                        style={{ width: col.width }}
                      >
                        {!isSummary && !task.isMilestone ? (
                          <EditableCell
                            value={task.durationDays}
                            displayValue={durLabel}
                            field="durationDays"
                            taskId={task.id}
                            isEditing={isEditingThis}
                            onStartEdit={onEditCell}
                            onFinish={(id, f, v) => id ? onCellChange(id, f, parseInt(v, 10) || 1) : onEditCell(null)}
                            type="number"
                            className="text-center"
                          />
                        ) : (
                          <span className="text-[11px]">{task.isMilestone ? '0' : `${task.durationDays || 0}d`}</span>
                        )}
                      </div>
                    );
                  }

                  // Horas (estimatedHours - campo real armazenado no banco)
                  if (col.key === 'estimatedHours') {
                    const hours = task.estimatedHours ?? (task.durationDays || 0) * HOURS_PER_DAY;
                    return (
                      <div
                        key={col.key}
                        className="flex items-center justify-center text-xs text-slate-600 dark:text-slate-400 border-r border-slate-100 dark:border-slate-800 h-full shrink-0"
                        style={{ width: col.width }}
                      >
                        {!isSummary ? (
                          <EditableCell
                            value={parseFloat(hours.toFixed(2))}
                            displayValue={formatHours(hours)}
                            field="estimatedHours"
                            taskId={task.id}
                            isEditing={isEditingThis}
                            onStartEdit={onEditCell}
                            onFinish={(id, f, v) => id ? onCellChange(id, f, parseFloat(v) || 0) : onEditCell(null)}
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
                        style={{ width: col.width }}
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
                        style={{ width: col.width }}
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
                        style={{ width: col.width }}
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
                        style={{ width: col.width }}
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

                  // Notas / Descricao
                  if (col.key === 'notes') {
                    return (
                      <div
                        key={col.key}
                        className="flex items-center justify-center text-xs text-slate-600 dark:text-slate-400 border-r border-slate-100 dark:border-slate-800 h-full shrink-0"
                        style={{ width: col.width }}
                      >
                        <TaskDetailCell
                          notes={task.notes}
                          attachments={task.attachments}
                          taskId={task.id}
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
