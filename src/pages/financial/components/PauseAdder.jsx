import { useState } from 'react';

export default function PauseAdder({ onAdd, assignees }) {
  const [open, setOpen] = useState(false);
  const [start, setStart] = useState('');
  const [end, setEnd] = useState('');
  const [reason, setReason] = useState('');
  const [person, setPerson] = useState('');
  const people = (assignees || '').split(',').map(s => s.trim()).filter(Boolean);

  if (!open) {
    return (
      <button type="button" onClick={() => setOpen(true)} className="text-xs text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium flex items-center gap-1">
        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
        Adicionar pausa
      </button>
    );
  }

  return (
    <div className="p-3 bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800/50 rounded-lg space-y-2">
      {people.length > 1 && (
        <div>
          <label className="text-[10px] text-slate-500 dark:text-slate-400">Para quem?</label>
          <select value={person} onChange={(e) => setPerson(e.target.value)} className="w-full px-2 py-1.5 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 dark:text-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-fyness-primary">
            <option value="">Todos</option>
            {people.map(p => <option key={p} value={p}>{p}</option>)}
          </select>
        </div>
      )}
      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="text-[10px] text-slate-500 dark:text-slate-400">Inicio da pausa</label>
          <input type="datetime-local" value={start} onChange={(e) => setStart(e.target.value)} className="w-full px-2 py-1.5 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 dark:text-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-fyness-primary" />
        </div>
        <div>
          <label className="text-[10px] text-slate-500 dark:text-slate-400">Fim da pausa</label>
          <input type="datetime-local" value={end} onChange={(e) => setEnd(e.target.value)} min={start || undefined} className="w-full px-2 py-1.5 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 dark:text-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-fyness-primary" />
        </div>
      </div>
      <input type="text" value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Motivo (opcional)" className="w-full px-2 py-1.5 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 dark:text-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-fyness-primary" />
      <div className="flex gap-2">
        <button type="button" onClick={() => { if (start && end) { onAdd({ start, end, reason, assignee: person || null }); setStart(''); setEnd(''); setReason(''); setPerson(''); setOpen(false); } }} disabled={!start || !end} className="px-3 py-1 bg-fyness-primary text-white text-xs rounded-lg hover:bg-fyness-secondary disabled:opacity-50 disabled:cursor-not-allowed">Adicionar</button>
        <button type="button" onClick={() => setOpen(false)} className="px-3 py-1 text-slate-500 text-xs hover:text-slate-700">Cancelar</button>
      </div>
    </div>
  );
}
