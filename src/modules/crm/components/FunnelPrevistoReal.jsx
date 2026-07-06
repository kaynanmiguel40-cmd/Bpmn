/**
 * FunnelPrevistoReal — funil de conversão em DUAS CAMADAS: o PREVISTO (silhueta
 * fantasma, vinda do planejador reverso) e o REAL sólido por cima. Vive no
 * Comparativo: pega a meta (ou um previsto definido inline aqui), monta o funil
 * previsto e o real entra em cima.
 *
 * Previsto vem de 2 formas (nesta ordem):
 *   1) Meta de funil salva (crm_goals kind='funnel') que toca o período.
 *   2) Previsto inline (workspaceSettings.funnelPlan*), editável aqui mesmo.
 *
 * Real é passado por prop (`real` = { lead, qualified, meeting, closing }).
 */

import { useMemo, useState } from 'react';
import { UserPlus, BadgeCheck, CalendarCheck, Crown, Target, Trophy, Pencil, X } from 'lucide-react';
import { useActiveFunnelGoals } from '../hooks/useCrmQueries';
import { buildFunnelPlan, stageProgress, funnelPlanHeadline, FUNNEL_BASES } from '../lib/funnelGoals';
import { getCrmWorkspaceSettings, saveCrmWorkspaceSettings } from '../lib/workspaceSettings';

const fmtInt = (v) => new Intl.NumberFormat('pt-BR').format(Math.round(v) || 0);

const STEP_META = {
  lead:      { label: 'Leads',        icon: UserPlus,      from: '#60a5fa', to: '#3b82f6', toNext: 'qualificaram' },
  qualified: { label: 'Qualificados', icon: BadgeCheck,    from: '#818cf8', to: '#6366f1', toNext: 'foram à reunião' },
  meeting:   { label: 'Reuniões',     icon: CalendarCheck, from: '#fbbf24', to: '#f59e0b', toNext: 'fecharam' },
  closing:   { label: 'Fechamentos',  icon: Crown,         from: '#34d399', to: '#10b981', toNext: null },
};
const ORDER = ['lead', 'qualified', 'meeting', 'closing'];

const TAPER = 13;
const FLOOR = 14;
function computeWidths(counts) {
  const top = counts[0] || 0;
  const out = [];
  let prev = 100;
  counts.forEach((c, i) => {
    if (i === 0) { out.push(100); prev = 100; return; }
    const cap = prev - TAPER;
    const prop = top > 0 ? (c / top) * 100 : cap;
    const w = Math.max(Math.min(prop, cap), FLOOR);
    out.push(w);
    prev = w;
  });
  return out;
}
const clipOf = (topW, botW) =>
  `polygon(${(50 - topW / 2).toFixed(2)}% 0%, ${(50 + topW / 2).toFixed(2)}% 0%, ${(50 + botW / 2).toFixed(2)}% 100%, ${(50 - botW / 2).toFixed(2)}% 100%)`;

function goalTone(percent, hit) {
  if (hit) return { bar: 'bg-emerald-500', text: 'text-emerald-600 dark:text-emerald-400' };
  if (percent >= 70) return { bar: 'bg-blue-500', text: 'text-blue-600 dark:text-blue-400' };
  if (percent >= 40) return { bar: 'bg-amber-500', text: 'text-amber-600 dark:text-amber-400' };
  return { bar: 'bg-rose-500', text: 'text-rose-500 dark:text-rose-400' };
}

function Row({ stepKey, realCount, convPct, index, goal, ghost, sTopW, sBotW, rTopW, rBotW }) {
  const meta = STEP_META[stepKey];
  const Icon = meta.icon;
  const sClip = clipOf(sTopW, sBotW);
  const rClip = clipOf(rTopW, rBotW);
  const tone = goal ? goalTone(goal.percent, goal.hit) : null;
  const hasReal = rTopW > 0.4;

  return (
    <div className="relative flex items-stretch h-[54px]">
      {/* Rótulo */}
      <div className="w-[92px] sm:w-32 flex items-center justify-end gap-2 pr-3 text-right shrink-0">
        <span className="text-[11px] sm:text-xs font-semibold text-slate-600 dark:text-slate-300 truncate">{meta.label}</span>
        <span className="w-6 h-6 rounded-md hidden sm:flex items-center justify-center shrink-0 text-white"
          style={{ background: `linear-gradient(135deg, ${meta.from}, ${meta.to})` }}>
          <Icon size={12} />
        </span>
      </div>

      {/* Fatia */}
      <div className="relative flex-1 min-w-0">
        {ghost && (
          <>
            <div className="absolute inset-0 transition-all duration-500"
              style={{ clipPath: sClip, background: `linear-gradient(135deg, ${meta.from}, ${meta.to})`, opacity: 0.15 }} />
            <div className="absolute inset-0 transition-all duration-500"
              style={{ clipPath: sClip, boxShadow: 'inset 0 0 0 1.5px rgba(100,116,139,0.35)' }} />
          </>
        )}
        {(!ghost || hasReal) && (
          <>
            <div className="absolute inset-0 transition-all duration-500"
              style={{ clipPath: ghost ? rClip : sClip, background: `linear-gradient(135deg, ${meta.from}, ${meta.to})` }} />
            <div className="absolute inset-0 transition-all duration-500"
              style={{ clipPath: ghost ? rClip : sClip, background: 'linear-gradient(to bottom, rgba(255,255,255,0.30), rgba(255,255,255,0) 55%)' }} />
          </>
        )}
        <div className="absolute inset-0 flex items-center justify-center">
          {ghost ? (
            <span className="flex items-baseline gap-1 px-2 py-0.5 rounded-full bg-slate-900/45 backdrop-blur-sm">
              <span className="text-sm font-bold text-white tnum tabular-nums">{fmtInt(realCount)}</span>
              {goal && <span className="text-[11px] font-semibold text-white/70 tnum tabular-nums">/ {fmtInt(goal.target)}</span>}
            </span>
          ) : (
            <span className="text-sm sm:text-base font-bold text-white tabular-nums drop-shadow-[0_1px_2px_rgba(15,23,42,0.4)]">{fmtInt(realCount)}</span>
          )}
        </div>
      </div>

      {/* Progresso do previsto / conversão */}
      <div className="w-[64px] sm:w-24 flex flex-col justify-center pl-3 shrink-0">
        {goal ? (
          <>
            <div className="flex items-center gap-1 leading-none">
              {goal.hit ? <Trophy size={11} className="text-emerald-500 shrink-0" /> : <Target size={11} className="text-slate-400 shrink-0" />}
              <span className={`text-xs font-bold tabular-nums ${tone.text}`}>{goal.percent}%</span>
            </div>
            <div className="mt-1 h-1.5 w-full max-w-[72px] bg-slate-200/70 dark:bg-slate-700/60 rounded-full overflow-hidden">
              <div className={`h-full rounded-full transition-all duration-500 ${tone.bar}`} style={{ width: `${Math.min(100, goal.percent)}%` }} />
            </div>
          </>
        ) : convPct != null ? (
          <span className="text-xs font-bold text-slate-600 dark:text-slate-300 tabular-nums">{convPct}%</span>
        ) : (
          <span className="text-[10px] uppercase tracking-wider text-slate-300 dark:text-slate-600 font-semibold">topo</span>
        )}
      </div>
    </div>
  );
}

export function FunnelPrevistoReal({ real, range = null, ownerId = null }) {
  // ── Previsto: 1) Meta salva tem prioridade; 2) senão, previsto inline local.
  const { data: funnelGoals = [] } = useActiveFunnelGoals(range, ownerId);
  const activeGoal = useMemo(() => {
    if (!funnelGoals.length) return null;
    return funnelGoals.find(g => g.type === 'global') || funnelGoals[0];
  }, [funnelGoals]);

  const [localPrevisto, setLocalPrevisto] = useState(() => {
    const s = getCrmWorkspaceSettings();
    return { base: s.funnelPlanBase, target: s.funnelPlanTarget, rate: s.funnelPlanRate };
  });
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState({ base: 'sales', target: '', rate: '' });

  const metaPlan = useMemo(() => (
    activeGoal
      ? buildFunnelPlan({ base: activeGoal.funnelBase, targetCount: activeGoal.targetValue, conversionRate: activeGoal.conversionRate })
      : null
  ), [activeGoal]);
  const inlinePlan = useMemo(() => (
    !metaPlan && localPrevisto.base
      ? buildFunnelPlan({ base: localPrevisto.base, targetCount: localPrevisto.target, conversionRate: localPrevisto.rate })
      : null
  ), [metaPlan, localPrevisto]);
  const plan = metaPlan || inlinePlan;
  const fromMeta = !!metaPlan;

  const openEditor = () => {
    setDraft({
      base: localPrevisto.base || 'sales',
      target: localPrevisto.target ? String(localPrevisto.target) : '',
      rate: localPrevisto.rate ? String(localPrevisto.rate) : '',
    });
    setEditing(true);
  };
  const savePrevisto = () => {
    const next = {
      funnelPlanBase: draft.base,
      funnelPlanTarget: Math.max(0, parseFloat(draft.target) || 0),
      funnelPlanRate: Math.max(0, Math.min(100, parseFloat(draft.rate) || 0)),
    };
    saveCrmWorkspaceSettings(next);
    setLocalPrevisto({ base: next.funnelPlanBase, target: next.funnelPlanTarget, rate: next.funnelPlanRate });
    setEditing(false);
  };
  const clearPrevisto = () => {
    saveCrmWorkspaceSettings({ funnelPlanBase: null, funnelPlanTarget: 0, funnelPlanRate: 0 });
    setLocalPrevisto({ base: null, target: 0, rate: 0 });
    setEditing(false);
  };

  // Real por etapa + conversão degrau a degrau.
  const realCounts = ORDER.map(k => Number(real?.[k]) || 0);
  const convByStep = realCounts.map((c, i) => (i === 0 ? null : (realCounts[i - 1] > 0 ? Math.round((c / realCounts[i - 1]) * 100) : null)));

  // Larguras: silhueta = previsto (se houver plano) senão real; real na escala do previsto.
  const previstoCounts = plan ? ORDER.map(k => plan.stageTargets[k] ?? 0) : null;
  const silhouetteWidths = computeWidths(previstoCounts || realCounts);
  const previstoTop = (previstoCounts || realCounts)[0] || 0;
  const realWidths = realCounts.map((c, i) => (previstoTop > 0 ? Math.min(silhouetteWidths[i], (c / previstoTop) * 100) : silhouetteWidths[i]));

  return (
    <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/60 p-5">
      <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
        <div>
          <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100">Funil do mês · Previsto × Real</h3>
          <p className="text-[11px] text-slate-400 dark:text-slate-500">
            {plan ? `Previsto ${funnelPlanHeadline(plan)}` : 'Defina o previsto (planejador) pra comparar com o real'}
          </p>
        </div>

        {/* Fonte do previsto: meta (só leitura) OU editor inline */}
        {fromMeta ? (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-fyness-primary/10 text-fyness-primary text-[11px] font-medium">
            <Target size={12} /> {activeGoal?.title || 'Meta do funil'}
          </span>
        ) : !editing && inlinePlan ? (
          <div className="flex items-center gap-2">
            <button type="button" onClick={openEditor} className="inline-flex items-center gap-1 text-[11px] text-slate-500 dark:text-slate-400 hover:text-fyness-primary">
              <Pencil size={11} /> editar previsto
            </button>
            <button type="button" onClick={clearPrevisto} className="inline-flex items-center gap-1 text-[11px] text-slate-400 hover:text-rose-500">
              <X size={11} /> remover
            </button>
          </div>
        ) : !editing ? (
          <button type="button" onClick={openEditor} className="inline-flex items-center gap-1.5 text-xs font-medium text-fyness-primary hover:underline">
            <Target size={13} /> Definir previsto
          </button>
        ) : null}
      </div>

      {/* Editor inline do previsto */}
      {editing && (
        <div className="rounded-xl border border-fyness-primary/20 bg-fyness-primary/5 dark:bg-fyness-primary/10 p-3 mb-4 space-y-2.5">
          <div className="flex gap-2">
            {FUNNEL_BASES.map(b => (
              <button key={b.value} type="button" onClick={() => setDraft(d => ({ ...d, base: b.value }))}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                  draft.base === b.value ? 'border-fyness-primary bg-fyness-primary/10 text-fyness-primary'
                    : 'border-slate-300 dark:border-slate-600 text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'}`}>
                {b.label}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <input type="number" min="0" step="1" autoFocus value={draft.target}
              onChange={(e) => setDraft(d => ({ ...d, target: e.target.value }))}
              onKeyDown={(e) => { if (e.key === 'Enter') savePrevisto(); if (e.key === 'Escape') setEditing(false); }}
              placeholder={draft.base === 'calls' ? 'ligações (ex: 200)' : 'vendas (ex: 10)'}
              className="w-40 px-2.5 py-1.5 text-sm rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-fyness-primary/40" />
            <div className="flex items-center gap-1">
              <input type="number" min="0" max="100" step="0.1" value={draft.rate}
                onChange={(e) => setDraft(d => ({ ...d, rate: e.target.value }))}
                onKeyDown={(e) => { if (e.key === 'Enter') savePrevisto(); if (e.key === 'Escape') setEditing(false); }}
                placeholder="5"
                className="w-16 px-2.5 py-1.5 text-sm rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-fyness-primary/40" />
              <span className="text-xs text-slate-400">% conv.</span>
            </div>
            <button type="button" onClick={savePrevisto} className="px-3 py-1.5 text-xs font-medium bg-fyness-primary hover:bg-fyness-secondary text-white rounded-lg">Salvar</button>
            <button type="button" onClick={() => setEditing(false)} className="px-2 py-1.5 text-xs text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200">Cancelar</button>
          </div>
        </div>
      )}

      {/* Legenda Previsto × Real */}
      {plan && (
        <div className="flex items-center gap-4 mb-2 text-[10px] text-slate-400 dark:text-slate-500">
          <span className="inline-flex items-center gap-1.5"><span className="w-4 h-2.5 rounded-sm bg-slate-400/20 ring-1 ring-slate-400/40" /> previsto</span>
          <span className="inline-flex items-center gap-1.5"><span className="w-4 h-2.5 rounded-sm" style={{ background: 'linear-gradient(135deg,#60a5fa,#10b981)' }} /> real</span>
        </div>
      )}

      {/* Funil */}
      <div>
        {ORDER.map((k, i) => {
          const isLast = i === ORDER.length - 1;
          return (
            <Row
              key={k}
              stepKey={k}
              realCount={realCounts[i]}
              convPct={convByStep[i]}
              index={i}
              ghost={!!plan}
              sTopW={silhouetteWidths[i]}
              sBotW={isLast ? silhouetteWidths[i] * 0.5 : silhouetteWidths[i + 1]}
              rTopW={realWidths[i]}
              rBotW={isLast ? realWidths[i] * 0.5 : realWidths[i + 1]}
              goal={plan ? stageProgress(plan, k, realCounts[i]) : null}
            />
          );
        })}
      </div>
    </div>
  );
}

export default FunnelPrevistoReal;
