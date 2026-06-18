/**
 * OpReport - corpo de um relatório operacional (marketing ou operação).
 *
 * Layout: tiles de KPI → destaques → visão por dia/semana (breakdown) →
 * entregas (tarefas com relato de entrega). Genérico: o objeto `report` já vem
 * pronto do operationalModel. Só visual — sem fetch, sem banco.
 */

import { Sparkles, Send, UserPlus, DollarSign, ClipboardCheck, Timer, Clock, BadgeCheck, CheckCircle2, AlertTriangle } from 'lucide-react';

const ICONS = {
  creative: Sparkles, publish: Send, leads: UserPlus, money: DollarSign,
  tasks: ClipboardCheck, time: Timer, ontime: Clock, quality: BadgeCheck,
};

function Tile({ m }) {
  const Icon = ICONS[m.icon] || ClipboardCheck;
  return (
    <div className="rounded-xl border border-slate-200/70 dark:border-white/10 bg-white/70 dark:bg-slate-800/50 px-3.5 py-3">
      <div className="flex items-center gap-1.5 mb-1.5">
        <Icon size={15} style={{ color: m.accent }} className="shrink-0" />
        <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 truncate">{m.label}</span>
      </div>
      <div className="text-xl font-bold text-slate-800 dark:text-slate-100 tabular-nums leading-none">{m.value}</div>
      {m.sub && <div className="text-[11px] text-slate-400 dark:text-slate-500 mt-1 truncate">{m.sub}</div>}
    </div>
  );
}

export default function OpReport({ report }) {
  if (!report) return null;
  const { metrics = [], highlights = [], breakdown, tasks = [], note } = report;

  return (
    <div className="space-y-5">
      {/* KPIs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        {metrics.map((m, i) => <Tile key={i} m={m} />)}
      </div>

      {/* Resumo */}
      {note && (
        <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed border-l-2 border-fyness-primary/40 pl-3">{note}</p>
      )}

      {/* Destaques */}
      {highlights.length > 0 && (
        <div>
          <h4 className="text-xs font-semibold uppercase tracking-wide text-slate-400 dark:text-slate-500 mb-2">Destaques</h4>
          <ul className="space-y-1.5">
            {highlights.map((h, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-slate-700 dark:text-slate-200">
                <CheckCircle2 size={15} className="text-emerald-500 mt-0.5 shrink-0" />
                <span>{h}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Visão por dia / semana */}
      {breakdown && breakdown.length > 0 && (
        <div>
          <h4 className="text-xs font-semibold uppercase tracking-wide text-slate-400 dark:text-slate-500 mb-2">
            {report.period === 'monthly' ? 'Por semana' : 'Por dia'}
          </h4>
          <div className="rounded-xl border border-slate-200/70 dark:border-white/10 divide-y divide-slate-100 dark:divide-white/5 overflow-hidden">
            {breakdown.map((b, i) => (
              <div key={i} className="flex items-center justify-between gap-3 px-3.5 py-2.5">
                <span className="text-sm font-medium text-slate-700 dark:text-slate-200 capitalize shrink-0 w-32 truncate">{b.label}</span>
                <span className="text-sm text-slate-500 dark:text-slate-400 flex-1 truncate">{b.value}</span>
                {b.sub && <span className="text-xs text-slate-400 dark:text-slate-500 tabular-nums shrink-0">{b.sub}</span>}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Entregas */}
      {tasks.length > 0 && (
        <div>
          <h4 className="text-xs font-semibold uppercase tracking-wide text-slate-400 dark:text-slate-500 mb-2">
            {report.period === 'daily' ? 'Entregas do dia' : 'Principais entregas'}
          </h4>
          <div className="space-y-2">
            {tasks.map((t, i) => (
              <div key={i} className="rounded-xl border border-slate-200/70 dark:border-white/10 bg-white/60 dark:bg-slate-800/40 px-3.5 py-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      {t.day && <span className="text-[10px] font-semibold uppercase tracking-wide text-slate-400 dark:text-slate-500 capitalize">{t.day}</span>}
                      {t.chip && (
                        <span className="text-[10px] font-medium px-1.5 py-0.5 rounded capitalize"
                          style={{ backgroundColor: `${t.chip.color}22`, color: t.chip.color }}>
                          {t.chip.label}
                        </span>
                      )}
                    </div>
                    <div className="text-sm font-medium text-slate-800 dark:text-slate-100">{t.title}</div>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    {t.onTime
                      ? <span className="inline-flex items-center gap-1 text-[10px] font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 px-1.5 py-0.5 rounded">no prazo</span>
                      : <span className="inline-flex items-center gap-1 text-[10px] font-medium text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 px-1.5 py-0.5 rounded"><AlertTriangle size={10} /> atrasada</span>}
                    {t.approved
                      ? <span className="inline-flex items-center gap-1 text-[10px] font-medium text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/20 px-1.5 py-0.5 rounded"><BadgeCheck size={10} /> aprovada</span>
                      : <span className="inline-flex items-center gap-1 text-[10px] font-medium text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-700/40 px-1.5 py-0.5 rounded">em revisão</span>}
                  </div>
                </div>
                {t.delivery && <p className="text-[13px] text-slate-600 dark:text-slate-300 mt-1.5 leading-snug">{t.delivery}</p>}
                <div className="flex items-center gap-3 mt-2 text-[11px] text-slate-400 dark:text-slate-500">
                  {t.time && <span className="inline-flex items-center gap-1"><Clock size={11} /> {t.time}</span>}
                  {t.duration && <span className="inline-flex items-center gap-1"><Timer size={11} /> {t.duration}</span>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
