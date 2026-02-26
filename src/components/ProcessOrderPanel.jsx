import { useState, useEffect, useCallback, useRef } from 'react';
import { useProcessOrderByElement, useCreateProcessOrder, useUpdateProcessOrder, useDeleteProcessOrder } from '../hooks/queries';

// ==================== AUTO-RESIZE TEXTAREA ====================

function AutoTextarea({ value, onChange, className = '', minRows = 1, ...props }) {
  const ref = useRef(null);

  const resize = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = el.scrollHeight + 'px';
  }, []);

  useEffect(() => { resize(); }, [value, resize]);

  return (
    <textarea
      ref={ref}
      value={value}
      onChange={onChange}
      rows={minRows}
      className={className.replace('resize-none', '') + ' overflow-hidden'}
      onInput={resize}
      {...props}
    />
  );
}

// ==================== HELPERS ====================

const STATUS_CONFIG = {
  draft: { label: 'Rascunho', color: 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300', dot: 'bg-slate-400' },
  active: { label: 'Ativo', color: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400', dot: 'bg-green-500' },
  review: { label: 'Revisao', color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400', dot: 'bg-amber-500' },
  archived: { label: 'Arquivado', color: 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400', dot: 'bg-red-400' },
};

const SEVERITY_CONFIG = {
  low: { label: 'Baixo', color: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' },
  medium: { label: 'Medio', color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' },
  high: { label: 'Alto', color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' },
};

let _idCounter = 0;
const genId = () => `${Date.now()}_${++_idCounter}`;

// ==================== SECTION ACCORDION ====================

function Section({ title, icon, children, defaultOpen = false }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border-b border-slate-200 dark:border-slate-700">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center gap-2 px-4 py-2.5 text-left hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors"
      >
        <span className="text-slate-400 dark:text-slate-500">{icon}</span>
        <span className="flex-1 text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wide">{title}</span>
        <svg className={`w-3.5 h-3.5 text-slate-400 transition-transform ${open ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {open && <div className="px-4 pb-3">{children}</div>}
    </div>
  );
}

// ==================== MAIN COMPONENT ====================

export default function ProcessOrderPanel({ element, projectId, onClose }) {
  const elementId = element?.id || '';
  const elementType = element?.type || element?.businessObject?.$type || '';
  const elementName = element?.businessObject?.name || '';

  const { data: order, isLoading } = useProcessOrderByElement(projectId, elementId);
  const createMutation = useCreateProcessOrder();
  const updateMutation = useUpdateProcessOrder();
  const deleteMutation = useDeleteProcessOrder();

  // ==================== LOCAL FORM STATE ====================
  const [form, setForm] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const debounceRef = useRef(null);

  // Sync form with fetched order
  useEffect(() => {
    if (order) {
      setForm({ ...order });
    } else {
      setForm(null);
    }
  }, [order]);

  // ==================== AUTO-SAVE ====================

  const saveField = useCallback((field, value) => {
    if (!form?.id) return;
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      updateMutation.mutate({ id: form.id, updates: { [field]: value } });
    }, 800);
  }, [form?.id, updateMutation]);

  const saveImmediate = useCallback((updates) => {
    if (!form?.id) return;
    if (debounceRef.current) clearTimeout(debounceRef.current);
    updateMutation.mutate({ id: form.id, updates });
  }, [form?.id, updateMutation]);

  const updateField = useCallback((field, value) => {
    setForm(prev => prev ? { ...prev, [field]: value } : prev);
    saveField(field, value);
  }, [saveField]);

  // Cleanup debounce on unmount
  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

  // ==================== CREATE ====================

  const [createError, setCreateError] = useState('');

  const handleCreate = async () => {
    setCreateError('');
    try {
      const newOrder = {
        projectId,
        elementId,
        elementType,
        title: elementName || 'Ordem de Processo',
        status: 'draft',
      };
      await createMutation.mutateAsync(newOrder);
    } catch (err) {
      console.error('[ProcessOrder] Erro ao criar:', err);
      setCreateError('Erro ao criar ordem. Verifique se a migration 023 foi executada no Supabase.');
    }
  };

  // ==================== DELETE ====================

  const handleDelete = async () => {
    if (!form?.id) return;
    await deleteMutation.mutateAsync(form.id);
    setShowDeleteConfirm(false);
    onClose();
  };

  // ==================== STEPS CRUD ====================

  const addStep = () => {
    const steps = [...(form?.steps || []), { id: genId(), order: (form?.steps || []).length, text: '', details: '', required: true }];
    setForm(prev => prev ? { ...prev, steps } : prev);
    saveImmediate({ steps });
  };

  const updateStep = (idx, field, value) => {
    const steps = [...(form?.steps || [])];
    steps[idx] = { ...steps[idx], [field]: value };
    setForm(prev => prev ? { ...prev, steps } : prev);
    saveField('steps', steps);
  };

  const removeStep = (idx) => {
    const steps = (form?.steps || []).filter((_, i) => i !== idx).map((s, i) => ({ ...s, order: i }));
    setForm(prev => prev ? { ...prev, steps } : prev);
    saveImmediate({ steps });
  };

  const moveStep = (idx, dir) => {
    const steps = [...(form?.steps || [])];
    const newIdx = idx + dir;
    if (newIdx < 0 || newIdx >= steps.length) return;
    [steps[idx], steps[newIdx]] = [steps[newIdx], steps[idx]];
    const reordered = steps.map((s, i) => ({ ...s, order: i }));
    setForm(prev => prev ? { ...prev, steps: reordered } : prev);
    saveImmediate({ steps: reordered });
  };

  // ==================== RISKS CRUD ====================

  const addRisk = () => {
    const risks = [...(form?.risks || []), { id: genId(), description: '', mitigation: '', severity: 'medium' }];
    setForm(prev => prev ? { ...prev, risks } : prev);
    saveImmediate({ risks });
  };

  const updateRisk = (idx, field, value) => {
    const risks = [...(form?.risks || [])];
    risks[idx] = { ...risks[idx], [field]: value };
    setForm(prev => prev ? { ...prev, risks } : prev);
    saveField('risks', risks);
  };

  const removeRisk = (idx) => {
    const risks = (form?.risks || []).filter((_, i) => i !== idx);
    setForm(prev => prev ? { ...prev, risks } : prev);
    saveImmediate({ risks });
  };

  // ==================== IMPROVEMENTS CRUD ====================

  const addImprovement = () => {
    const improvements = [...(form?.improvements || []), { id: genId(), date: new Date().toISOString().split('T')[0], description: '', result: '', author: '' }];
    setForm(prev => prev ? { ...prev, improvements } : prev);
    saveImmediate({ improvements });
  };

  const updateImprovement = (idx, field, value) => {
    const improvements = [...(form?.improvements || [])];
    improvements[idx] = { ...improvements[idx], [field]: value };
    setForm(prev => prev ? { ...prev, improvements } : prev);
    saveField('improvements', improvements);
  };

  const removeImprovement = (idx) => {
    const improvements = (form?.improvements || []).filter((_, i) => i !== idx);
    setForm(prev => prev ? { ...prev, improvements } : prev);
    saveImmediate({ improvements });
  };

  // ==================== RENDER: LOADING ====================

  if (isLoading) {
    return (
      <div className="w-96 bg-white dark:bg-slate-800 border-l border-slate-200 dark:border-slate-700 flex flex-col items-center justify-center">
        <div className="w-8 h-8 border-3 border-indigo-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-sm text-slate-400 mt-3">Carregando...</p>
      </div>
    );
  }

  // ==================== RENDER: CREATE (no order yet) ====================

  if (!form) {
    return (
      <div className="w-96 bg-white dark:bg-slate-800 border-l border-slate-200 dark:border-slate-700 flex flex-col">
        {/* Header */}
        <div className="p-3 border-b border-slate-200 dark:border-slate-700 bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 flex items-center gap-2">
          <button onClick={onClose} className="p-1 hover:bg-white/50 dark:hover:bg-slate-700/50 rounded transition-colors">
            <svg className="w-4 h-4 text-slate-600 dark:text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <h2 className="font-semibold text-sm text-indigo-800 dark:text-indigo-300">Ordem de Processo</h2>
        </div>

        {/* Empty State */}
        <div className="flex-1 flex items-center justify-center p-6">
          <div className="text-center">
            <div className="w-16 h-16 bg-indigo-100 dark:bg-indigo-900/30 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 className="font-semibold text-slate-700 dark:text-slate-200 mb-1">Nenhuma ordem criada</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-4 max-w-48 mx-auto">
              Crie uma Ordem de Processo para documentar como esta etapa deve ser executada.
            </p>
            {elementName && (
              <p className="text-xs text-indigo-600 dark:text-indigo-400 mb-4 font-medium">
                "{elementName}"
              </p>
            )}
            <button
              onClick={handleCreate}
              disabled={createMutation.isPending}
              className="px-4 py-2.5 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-lg hover:from-indigo-600 hover:to-purple-600 transition-all text-sm font-medium disabled:opacity-50 shadow-sm"
            >
              {createMutation.isPending ? 'Criando...' : 'Criar Ordem de Processo'}
            </button>
            {createError && (
              <p className="text-xs text-red-500 dark:text-red-400 mt-3 text-center max-w-52 mx-auto">{createError}</p>
            )}
          </div>
        </div>
      </div>
    );
  }

  // ==================== RENDER: EDIT FORM ====================

  const statusCfg = STATUS_CONFIG[form.status] || STATUS_CONFIG.draft;

  return (
    <div className="w-96 bg-white dark:bg-slate-800 border-l border-slate-200 dark:border-slate-700 flex flex-col overflow-hidden">
      {/* Header */}
      <div className="p-3 border-b border-slate-200 dark:border-slate-700 bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20">
        <div className="flex items-center gap-2 mb-2">
          <button onClick={onClose} className="p-1 hover:bg-white/50 dark:hover:bg-slate-700/50 rounded transition-colors">
            <svg className="w-4 h-4 text-slate-600 dark:text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <h2 className="flex-1 font-semibold text-sm text-indigo-800 dark:text-indigo-300">Ordem de Processo</h2>
          <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${statusCfg.color}`}>
            {statusCfg.label}
          </span>
          <span className="text-[10px] text-slate-400 dark:text-slate-500 font-mono">v{form.version}</span>
        </div>
        {/* Title */}
        <input
          type="text"
          value={form.title}
          onChange={(e) => updateField('title', e.target.value)}
          className="w-full px-2 py-1.5 text-sm font-semibold bg-white/60 dark:bg-slate-700/60 border border-indigo-200 dark:border-indigo-700 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-400 text-slate-800 dark:text-slate-100"
          placeholder="Titulo da Ordem"
        />
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto">

        {/* Objetivo */}
        <Section title="Objetivo" defaultOpen={true} icon={
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
        }>
          <AutoTextarea
            value={form.objective}
            onChange={(e) => updateField('objective', e.target.value)}
            placeholder="Por que esta etapa existe? Qual o objetivo?"
            minRows={2}
            className="w-full px-2.5 py-2 text-sm border border-slate-200 dark:border-slate-600 rounded-md bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-400"
          />
        </Section>

        {/* Descricao */}
        <Section title="Descricao" icon={
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" /></svg>
        }>
          <AutoTextarea
            value={form.description}
            onChange={(e) => updateField('description', e.target.value)}
            placeholder="Descricao geral do processo/etapa..."
            minRows={2}
            className="w-full px-2.5 py-2 text-sm border border-slate-200 dark:border-slate-600 rounded-md bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-400"
          />
        </Section>

        {/* Procedimentos (Steps) */}
        <Section title="Procedimentos" defaultOpen={true} icon={
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" /></svg>
        }>
          <div className="space-y-2">
            {(form.steps || []).map((step, idx) => (
              <div key={step.id || idx} className="bg-slate-50 dark:bg-slate-700/50 rounded-lg p-2 border border-slate-200 dark:border-slate-600">
                <div className="flex items-start gap-1.5">
                  <span className="text-xs font-bold text-indigo-500 mt-1.5 w-5 text-center flex-shrink-0">{idx + 1}</span>
                  <div className="flex-1">
                    <AutoTextarea
                      value={step.text}
                      onChange={(e) => updateStep(idx, 'text', e.target.value)}
                      placeholder="Descreva o passo..."
                      minRows={1}
                      className="w-full px-2 py-1 text-xs bg-white dark:bg-slate-600 border border-slate-200 dark:border-slate-500 rounded focus:outline-none focus:ring-1 focus:ring-indigo-400 text-slate-700 dark:text-slate-200"
                    />
                    <AutoTextarea
                      value={step.details || ''}
                      onChange={(e) => updateStep(idx, 'details', e.target.value)}
                      placeholder="Detalhes adicionais (opcional)..."
                      minRows={1}
                      className="w-full px-2 py-1 mt-1 text-[11px] bg-white dark:bg-slate-600 border border-slate-100 dark:border-slate-500 rounded focus:outline-none focus:ring-1 focus:ring-indigo-400 text-slate-500 dark:text-slate-300"
                    />
                  </div>
                  <div className="flex flex-col gap-0.5 flex-shrink-0">
                    <button onClick={() => moveStep(idx, -1)} disabled={idx === 0} className="p-0.5 text-slate-400 hover:text-indigo-500 disabled:opacity-30 transition-colors">
                      <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" /></svg>
                    </button>
                    <button onClick={() => moveStep(idx, 1)} disabled={idx === (form.steps || []).length - 1} className="p-0.5 text-slate-400 hover:text-indigo-500 disabled:opacity-30 transition-colors">
                      <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                    </button>
                    <button onClick={() => removeStep(idx)} className="p-0.5 text-slate-400 hover:text-red-500 transition-colors">
                      <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                  </div>
                </div>
              </div>
            ))}
            <button onClick={addStep} className="w-full py-1.5 border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-lg text-xs text-slate-500 dark:text-slate-400 hover:border-indigo-400 hover:text-indigo-500 transition-colors">
              + Adicionar Passo
            </button>
          </div>
        </Section>

        {/* Entradas / Saidas */}
        <Section title="Entradas e Saidas" icon={
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" /></svg>
        }>
          <div className="space-y-2">
            <div>
              <label className="text-[10px] font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide">Entradas</label>
              <AutoTextarea
                value={form.inputs}
                onChange={(e) => updateField('inputs', e.target.value)}
                placeholder="O que precisa estar pronto antes?"
                minRows={1}
                className="w-full px-2.5 py-1.5 text-xs border border-slate-200 dark:border-slate-600 rounded-md bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-400"
              />
            </div>
            <div>
              <label className="text-[10px] font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide">Saidas</label>
              <AutoTextarea
                value={form.outputs}
                onChange={(e) => updateField('outputs', e.target.value)}
                placeholder="O que esta etapa entrega?"
                minRows={1}
                className="w-full px-2.5 py-1.5 text-xs border border-slate-200 dark:border-slate-600 rounded-md bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-400"
              />
            </div>
          </div>
        </Section>

        {/* Ferramentas e Recursos */}
        <Section title="Ferramentas e Recursos" icon={
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
        }>
          <AutoTextarea
            value={form.toolsResources}
            onChange={(e) => updateField('toolsResources', e.target.value)}
            placeholder="Sistemas, ferramentas, materiais necessarios..."
            minRows={1}
            className="w-full px-2.5 py-2 text-sm border border-slate-200 dark:border-slate-600 rounded-md bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-400"
          />
        </Section>

        {/* Responsavel / Participantes */}
        <Section title="Responsabilidades" icon={
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
        }>
          <div className="space-y-2">
            <div>
              <label className="text-[10px] font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide">Responsavel</label>
              <input
                type="text"
                value={form.responsible}
                onChange={(e) => updateField('responsible', e.target.value)}
                placeholder="Quem executa esta etapa?"
                className="w-full px-2.5 py-1.5 text-xs border border-slate-200 dark:border-slate-600 rounded-md bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-400"
              />
            </div>
            <div>
              <label className="text-[10px] font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide">Participantes</label>
              <input
                type="text"
                value={form.participants}
                onChange={(e) => updateField('participants', e.target.value)}
                placeholder="Outros envolvidos..."
                className="w-full px-2.5 py-1.5 text-xs border border-slate-200 dark:border-slate-600 rounded-md bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-400"
              />
            </div>
          </div>
        </Section>

        {/* Criterios de Aceitacao */}
        <Section title="Criterios de Aceitacao" icon={
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
        }>
          <AutoTextarea
            value={form.acceptanceCriteria}
            onChange={(e) => updateField('acceptanceCriteria', e.target.value)}
            placeholder="Como sabemos que esta etapa foi bem executada?"
            minRows={2}
            className="w-full px-2.5 py-2 text-sm border border-slate-200 dark:border-slate-600 rounded-md bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-400"
          />
        </Section>

        {/* Riscos */}
        <Section title="Riscos" icon={
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
        }>
          <div className="space-y-2">
            {(form.risks || []).map((risk, idx) => (
              <div key={risk.id || idx} className="bg-slate-50 dark:bg-slate-700/50 rounded-lg p-2 border border-slate-200 dark:border-slate-600">
                <div className="flex items-start gap-1.5">
                  <div className="flex-1 space-y-1">
                    <input
                      type="text"
                      value={risk.description}
                      onChange={(e) => updateRisk(idx, 'description', e.target.value)}
                      placeholder="Descreva o risco..."
                      className="w-full px-2 py-1 text-xs bg-white dark:bg-slate-600 border border-slate-200 dark:border-slate-500 rounded focus:outline-none focus:ring-1 focus:ring-indigo-400 text-slate-700 dark:text-slate-200"
                    />
                    <input
                      type="text"
                      value={risk.mitigation || ''}
                      onChange={(e) => updateRisk(idx, 'mitigation', e.target.value)}
                      placeholder="Mitigacao..."
                      className="w-full px-2 py-1 text-[11px] bg-white dark:bg-slate-600 border border-slate-100 dark:border-slate-500 rounded focus:outline-none focus:ring-1 focus:ring-indigo-400 text-slate-500 dark:text-slate-300"
                    />
                    <div className="flex gap-1">
                      {['low', 'medium', 'high'].map(sev => (
                        <button
                          key={sev}
                          onClick={() => updateRisk(idx, 'severity', sev)}
                          className={`px-2 py-0.5 text-[10px] rounded-full font-medium transition-all ${
                            risk.severity === sev
                              ? SEVERITY_CONFIG[sev].color
                              : 'bg-slate-100 dark:bg-slate-600 text-slate-400 dark:text-slate-500'
                          }`}
                        >
                          {SEVERITY_CONFIG[sev].label}
                        </button>
                      ))}
                    </div>
                  </div>
                  <button onClick={() => removeRisk(idx)} className="p-0.5 text-slate-400 hover:text-red-500 transition-colors mt-1">
                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                  </button>
                </div>
              </div>
            ))}
            <button onClick={addRisk} className="w-full py-1.5 border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-lg text-xs text-slate-500 dark:text-slate-400 hover:border-red-400 hover:text-red-500 transition-colors">
              + Adicionar Risco
            </button>
          </div>
        </Section>

        {/* Melhorias */}
        <Section title="Melhorias e Aprendizados" icon={
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>
        }>
          <div className="space-y-2">
            {(form.improvements || []).map((imp, idx) => (
              <div key={imp.id || idx} className="bg-green-50 dark:bg-green-900/10 rounded-lg p-2 border border-green-200 dark:border-green-800">
                <div className="flex items-start gap-1.5">
                  <div className="flex-1 space-y-1">
                    <div className="flex gap-1">
                      <input
                        type="date"
                        value={imp.date || ''}
                        onChange={(e) => updateImprovement(idx, 'date', e.target.value)}
                        className="px-1.5 py-0.5 text-[11px] bg-white dark:bg-slate-600 border border-green-200 dark:border-green-700 rounded focus:outline-none focus:ring-1 focus:ring-green-400 text-slate-600 dark:text-slate-300"
                      />
                      <input
                        type="text"
                        value={imp.author || ''}
                        onChange={(e) => updateImprovement(idx, 'author', e.target.value)}
                        placeholder="Autor"
                        className="flex-1 px-1.5 py-0.5 text-[11px] bg-white dark:bg-slate-600 border border-green-200 dark:border-green-700 rounded focus:outline-none focus:ring-1 focus:ring-green-400 text-slate-600 dark:text-slate-300"
                      />
                    </div>
                    <input
                      type="text"
                      value={imp.description}
                      onChange={(e) => updateImprovement(idx, 'description', e.target.value)}
                      placeholder="O que foi melhorado?"
                      className="w-full px-2 py-1 text-xs bg-white dark:bg-slate-600 border border-green-200 dark:border-green-700 rounded focus:outline-none focus:ring-1 focus:ring-green-400 text-slate-700 dark:text-slate-200"
                    />
                    <input
                      type="text"
                      value={imp.result || ''}
                      onChange={(e) => updateImprovement(idx, 'result', e.target.value)}
                      placeholder="Resultado obtido..."
                      className="w-full px-2 py-1 text-[11px] bg-white dark:bg-slate-600 border border-green-100 dark:border-green-700 rounded focus:outline-none focus:ring-1 focus:ring-green-400 text-slate-500 dark:text-slate-300"
                    />
                  </div>
                  <button onClick={() => removeImprovement(idx)} className="p-0.5 text-slate-400 hover:text-red-500 transition-colors mt-1">
                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                  </button>
                </div>
              </div>
            ))}
            <button onClick={addImprovement} className="w-full py-1.5 border-2 border-dashed border-green-300 dark:border-green-700 rounded-lg text-xs text-green-600 dark:text-green-400 hover:border-green-500 hover:text-green-600 transition-colors">
              + Registrar Melhoria
            </button>
          </div>

          {/* Licoes Aprendidas */}
          <div className="mt-3">
            <label className="text-[10px] font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide">Licoes Aprendidas</label>
            <AutoTextarea
              value={form.lessonsLearned}
              onChange={(e) => updateField('lessonsLearned', e.target.value)}
              placeholder="Consolidacao dos aprendizados..."
              minRows={1}
              className="w-full px-2.5 py-1.5 text-xs border border-slate-200 dark:border-slate-600 rounded-md bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-400"
            />
          </div>
        </Section>

        {/* Observacoes */}
        <Section title="Observacoes" icon={
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" /></svg>
        }>
          <AutoTextarea
            value={form.notes}
            onChange={(e) => updateField('notes', e.target.value)}
            placeholder="Notas gerais, observacoes, referencias..."
            minRows={2}
            className="w-full px-2.5 py-2 text-sm border border-slate-200 dark:border-slate-600 rounded-md bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-400"
          />
        </Section>
      </div>

      {/* Footer */}
      <div className="p-3 border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 space-y-2">
        {/* Status selector */}
        <div className="flex items-center gap-1">
          <span className="text-[10px] text-slate-500 dark:text-slate-400 mr-1">Status:</span>
          {Object.entries(STATUS_CONFIG).map(([key, cfg]) => (
            <button
              key={key}
              onClick={() => {
                setForm(prev => prev ? { ...prev, status: key } : prev);
                saveImmediate({ status: key });
              }}
              className={`px-2 py-0.5 text-[10px] rounded-full font-medium transition-all ${
                form.status === key ? cfg.color : 'bg-slate-100 dark:bg-slate-700 text-slate-400 dark:text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-600'
              }`}
            >
              {cfg.label}
            </button>
          ))}
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => {
              const newVersion = (form.version || 1) + 1;
              setForm(prev => prev ? { ...prev, version: newVersion, status: 'active' } : prev);
              saveImmediate({ version: newVersion, status: 'active' });
            }}
            className="text-[11px] text-indigo-600 dark:text-indigo-400 hover:underline font-medium"
          >
            Publicar v{(form.version || 1) + 1}
          </button>

          {showDeleteConfirm ? (
            <div className="flex items-center gap-1">
              <span className="text-[10px] text-red-500">Confirmar?</span>
              <button onClick={handleDelete} className="text-[10px] text-red-600 font-bold hover:underline">Sim</button>
              <button onClick={() => setShowDeleteConfirm(false)} className="text-[10px] text-slate-500 hover:underline">Nao</button>
            </div>
          ) : (
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="text-[10px] text-red-400 hover:text-red-600 transition-colors"
            >
              Excluir
            </button>
          )}
        </div>

        {/* Save indicator */}
        {updateMutation.isPending && (
          <p className="text-[10px] text-indigo-500 dark:text-indigo-400 text-center animate-pulse">Salvando...</p>
        )}
      </div>
    </div>
  );
}
