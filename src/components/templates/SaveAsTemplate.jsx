import { useState } from 'react';
import { createFromOrder } from '../../lib/templateService';
import { useToast } from '../../contexts/ToastContext';

export function SaveAsTemplate({ order, className = '' }) {
  const [showModal, setShowModal] = useState(false);
  const [name, setName] = useState('');
  const [saving, setSaving] = useState(false);
  const { addToast } = useToast();

  const handleSave = async () => {
    if (!name.trim() || saving) return;
    setSaving(true);
    try {
      await createFromOrder(name.trim(), order);
      addToast('Template salvo com sucesso', 'success');
      setShowModal(false);
      setName('');
    } catch (err) {
      addToast('Erro ao salvar template', 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setShowModal(true)}
        className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors ${className}`}
      >
        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
        </svg>
        Salvar como template
      </button>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-xl max-w-sm w-full mx-4 overflow-hidden">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100 mb-4">Salvar como Template</h3>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Nome do template..."
                autoFocus
                onKeyDown={(e) => e.key === 'Enter' && handleSave()}
                className="w-full px-4 py-2.5 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              />
            </div>
            <div className="p-4 bg-slate-50 dark:bg-slate-900 flex gap-3 justify-end border-t border-slate-100 dark:border-slate-700">
              <button onClick={() => setShowModal(false)} className="px-4 py-2 text-sm border border-slate-300 dark:border-slate-600 rounded-lg text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">
                Cancelar
              </button>
              <button
                onClick={handleSave}
                disabled={!name.trim() || saving}
                className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50"
              >
                Salvar
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default SaveAsTemplate;
