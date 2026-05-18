/**
 * DailyGoalProgress - Barra de progresso de metas diarias do vendedor.
 *
 * Se nenhuma meta esta definida, mostra um CTA "Definir meta diaria".
 * Quando ha meta, mostra 1-2 barras (ligacoes e/ou reunioes) com:
 *   - cor que muda conforme a porcentagem (slate -> amber -> emerald)
 *   - badge "🎯 Meta batida!" ao atingir 100%
 *
 * Metas sao persistidas em localStorage via dialerGoals.js.
 */

import { useEffect, useState } from 'react';
import { Target, Settings, Sparkles, X, PhoneCall, Users2 } from 'lucide-react';
import { getDialerGoals, saveDialerGoals, hasAnyGoal } from '../lib/dialerGoals';

function clampPct(value, target) {
  if (!target || target <= 0) return 0;
  return Math.max(0, Math.min(100, Math.round((value / target) * 100)));
}

function pctColor(pct) {
  if (pct >= 100) return { bar: 'bg-emerald-500', track: 'bg-emerald-100 dark:bg-emerald-900/30', text: 'text-emerald-700 dark:text-emerald-400' };
  if (pct >= 60)  return { bar: 'bg-amber-500',   track: 'bg-amber-100 dark:bg-amber-900/30',   text: 'text-amber-700 dark:text-amber-400' };
  return            { bar: 'bg-fyness-primary',  track: 'bg-slate-100 dark:bg-slate-800',       text: 'text-slate-600 dark:text-slate-300' };
}

export function DailyGoalProgress({ callsToday = 0, meetingsToday = 0 }) {
  const [goals, setGoals] = useState(getDialerGoals);
  const [editing, setEditing] = useState(false);

  // Escuta mudancas de meta (vindas do modal de edicao ou de outras abas)
  useEffect(() => {
    const onChange = () => setGoals(getDialerGoals());
    window.addEventListener('crm-dialer-goals-changed', onChange);
    window.addEventListener('storage', onChange);
    return () => {
      window.removeEventListener('crm-dialer-goals-changed', onChange);
      window.removeEventListener('storage', onChange);
    };
  }, []);

  const showAny = hasAnyGoal(goals);

  if (!showAny) {
    return (
      <>
        <button
          onClick={() => setEditing(true)}
          className="w-full mb-4 mt-1 flex items-center justify-center gap-2 px-4 py-3 text-sm text-slate-500 dark:text-slate-400 bg-white dark:bg-slate-900 border border-dashed border-slate-300 dark:border-slate-700 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
        >
          <Target size={16} />
          Definir meta diaria de ligacoes/reunioes
        </button>
        {editing && <GoalsEditorModal initial={goals} onClose={() => setEditing(false)} />}
      </>
    );
  }

  return (
    <>
      <div className="mb-4 mt-1 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700/50 p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Target size={16} className="text-fyness-primary" />
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Metas de hoje
            </span>
          </div>
          <button
            onClick={() => setEditing(true)}
            title="Editar metas"
            className="p-1 rounded text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <Settings size={14} />
          </button>
        </div>

        <div className={`grid gap-3 ${goals.dailyCalls > 0 && goals.dailyMeetings > 0 ? 'sm:grid-cols-2' : ''}`}>
          {goals.dailyCalls > 0 && (
            <ProgressRow
              icon={PhoneCall}
              label="Ligacoes"
              value={callsToday}
              target={goals.dailyCalls}
            />
          )}
          {goals.dailyMeetings > 0 && (
            <ProgressRow
              icon={Users2}
              label="Reunioes agendadas"
              value={meetingsToday}
              target={goals.dailyMeetings}
            />
          )}
        </div>
      </div>
      {editing && <GoalsEditorModal initial={goals} onClose={() => setEditing(false)} />}
    </>
  );
}

function ProgressRow({ icon: Icon, label, value, target }) {
  const pct = clampPct(value, target);
  const c = pctColor(pct);
  const hit = pct >= 100;

  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <div className="flex items-center gap-2">
          <Icon size={14} className={c.text} />
          <span className="text-sm font-medium text-slate-700 dark:text-slate-200">{label}</span>
          {hit && (
            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 text-[10px] font-semibold rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400">
              <Sparkles size={10} /> Meta batida
            </span>
          )}
        </div>
        <span className={`text-xs font-semibold ${c.text}`}>
          <span className="font-mono">{value}</span>
          <span className="text-slate-400 dark:text-slate-500"> / {target}</span>
          <span className="ml-1">({pct}%)</span>
        </span>
      </div>
      <div className={`h-2 w-full rounded-full overflow-hidden ${c.track}`}>
        <div
          className={`h-full ${c.bar} transition-all duration-500 ease-out`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

function GoalsEditorModal({ initial, onClose }) {
  const [dailyCalls, setDailyCalls] = useState(initial.dailyCalls || '');
  const [dailyMeetings, setDailyMeetings] = useState(initial.dailyMeetings || '');

  const handleSave = () => {
    saveDialerGoals({
      dailyCalls:    Number(dailyCalls)    || 0,
      dailyMeetings: Number(dailyMeetings) || 0,
    });
    onClose();
  };

  const handleClear = () => {
    saveDialerGoals({ dailyCalls: 0, dailyMeetings: 0 });
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-700/50"
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200 dark:border-slate-700/50">
          <div className="flex items-center gap-2">
            <Target size={16} className="text-fyness-primary" />
            <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-100">Metas diarias</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800"
            aria-label="Fechar"
          >
            <X size={16} />
          </button>
        </div>

        <div className="px-5 py-4 space-y-4">
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Deixe 0 para desativar. Metas sao por dispositivo (localStorage) — cada vendedor define a sua.
          </p>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
              Ligacoes por dia
            </label>
            <input
              type="number"
              min={0}
              value={dailyCalls}
              onChange={(e) => setDailyCalls(e.target.value)}
              placeholder="0 (desativada)"
              className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-fyness-primary"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
              Reunioes agendadas por dia
            </label>
            <input
              type="number"
              min={0}
              value={dailyMeetings}
              onChange={(e) => setDailyMeetings(e.target.value)}
              placeholder="0 (desativada)"
              className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-fyness-primary"
            />
          </div>
        </div>

        <div className="flex items-center justify-between px-5 py-3 border-t border-slate-200 dark:border-slate-700/50 bg-slate-50 dark:bg-slate-800/30 rounded-b-xl">
          <button
            onClick={handleClear}
            className="text-xs text-slate-500 dark:text-slate-400 hover:text-rose-600"
          >
            Limpar metas
          </button>
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700"
            >
              Cancelar
            </button>
            <button
              onClick={handleSave}
              className="px-4 py-2 text-sm font-medium bg-fyness-primary hover:bg-fyness-secondary text-white rounded-lg"
            >
              Salvar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DailyGoalProgress;
