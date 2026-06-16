import { useState, useEffect } from 'react';
import { getTemplates } from '../../lib/templateService';
import { BUILTIN_OS_TEMPLATES } from '../../lib/osTemplatesSeed';

export function TemplatePicker({ onSelect, className = '' }) {
  const [saved, setSaved] = useState([]);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    getTemplates().then(setSaved).catch(() => setSaved([]));
  }, [isOpen]);

  // Modelos prontos (builtin) primeiro, depois os salvos pelo usuario.
  const templates = [...BUILTIN_OS_TEMPLATES, ...saved];

  return (
    <div className={`relative ${className}`}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 rounded-lg transition-colors"
      >
        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
        </svg>
        Usar template
      </button>

      {isOpen && (
        <>
          {/* Clique fora fecha */}
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          <div className="absolute top-full mt-1 left-0 w-72 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-lg z-50 max-h-72 overflow-y-auto">
            {templates.length === 0 ? (
              <div className="px-4 py-3 text-sm text-slate-400 dark:text-slate-500 text-center">
                Nenhum template
              </div>
            ) : (
              templates.map(tpl => (
                <button
                  key={tpl.id}
                  type="button"
                  onClick={() => { onSelect(tpl); setIsOpen(false); }}
                  className="w-full px-4 py-2.5 text-left hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors border-b border-slate-100 dark:border-slate-700 last:border-b-0"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-slate-700 dark:text-slate-200">{tpl.name}</span>
                    {tpl.builtin && (
                      <span className="text-[9px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded-full bg-fyness-primary/10 text-fyness-primary shrink-0">pronto</span>
                    )}
                  </div>
                  <div className="text-xs text-slate-400 dark:text-slate-500">
                    {(tpl.checklist?.length || 0) > 0 ? `${tpl.checklist.length} tarefas` : 'Sem tarefas'}
                  </div>
                </button>
              ))
            )}
          </div>
        </>
      )}
    </div>
  );
}

export default TemplatePicker;
