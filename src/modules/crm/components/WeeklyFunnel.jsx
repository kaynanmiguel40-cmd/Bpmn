/**
 * WeeklyFunnel — funil de jornada do lead pro Relatório Semanal.
 *
 *   Total de Leads → Qualificados → Reunião agendada → Fechamento
 *
 * Mesmo visual de funil do dashboard (trapézios com clip-path), mas focado na
 * jornada do lead (não no esforço de ligação). Reaproveita o useSalesFunnel:
 * os números (leads, qualified, meetings, clients) já vêm calculados de lá;
 * aqui só remapeamos pras 4 etapas que o gestor acompanha.
 */

import { useMemo } from 'react';
import { Users, BadgeCheck, CalendarCheck, Crown, Filter } from 'lucide-react';
import { useSalesFunnel } from '../hooks/useCrmQueries';

const fmtInt = (v) => new Intl.NumberFormat('pt-BR').format(v || 0);
const fmtCurrency = (v) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(v || 0);

// Etapas da jornada (topo → base). `toNext` = verbo da transição pro próximo.
const STEPS = [
  { key: 'leads',     label: 'Total de Leads',   from: '#818cf8', to: '#6366f1', icon: Users,         toNext: 'qualificaram' },
  { key: 'qualified', label: 'Qualificados',     from: '#38bdf8', to: '#0ea5e9', icon: BadgeCheck,    toNext: 'agendaram reunião' },
  { key: 'meetings',  label: 'Reunião agendada', from: '#fbbf24', to: '#f59e0b', icon: CalendarCheck, toNext: 'fecharam' },
  { key: 'clients',   label: 'Fechamento',       from: '#34d399', to: '#10b981', icon: Crown,         toNext: null },
];

// Larguras (% da coluna central). SEMPRE afunila: cada fatia é no mínimo
// TAPER_STEP% mais estreita que a de cima, e mais ainda se o dado cair além disso.
const TAPER_STEP = 16;
const FLOOR_W = 16;
function computeWidths(counts) {
  const top = counts[0] || 0;
  const out = [];
  let prev = 100;
  counts.forEach((c, i) => {
    if (i === 0) { out.push(100); prev = 100; return; }
    const cap = prev - TAPER_STEP;
    const prop = top > 0 ? (c / top) * 100 : cap;
    const w = Math.max(Math.min(prop, cap), FLOOR_W);
    out.push(w);
    prev = w;
  });
  return out;
}

function FunnelRow({ meta, count, value, prevCount, prevWord, topW, botW, index }) {
  const Icon = meta.icon;
  const clip = `polygon(${(50 - topW / 2).toFixed(2)}% 0%, ${(50 + topW / 2).toFixed(2)}% 0%, ${(50 + botW / 2).toFixed(2)}% 100%, ${(50 - botW / 2).toFixed(2)}% 100%)`;
  const conv = prevCount != null ? (prevCount > 0 ? Math.round((count / prevCount) * 100) : 0) : null;

  return (
    <div className="relative flex items-stretch h-[60px] animate-fade-up" style={{ animationDelay: `${0.06 * index}s` }}>
      {/* Rótulo */}
      <div className="w-[112px] sm:w-44 flex items-center justify-end gap-2 pr-3 text-right shrink-0">
        <div className="min-w-0">
          <div className="text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-200 truncate">{meta.label}</div>
          {meta.key === 'clients' && value > 0 && (
            <div className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium tnum truncate">{fmtCurrency(value)}</div>
          )}
        </div>
        <span className="w-7 h-7 rounded-lg hidden sm:flex items-center justify-center shrink-0 text-white shadow-sm"
          style={{ background: `linear-gradient(135deg, ${meta.from}, ${meta.to})` }}>
          <Icon size={14} />
        </span>
      </div>

      {/* Trapézio */}
      <div className="relative flex-1 min-w-0">
        <div className="absolute inset-0 transition-all duration-700" style={{ clipPath: clip, background: `linear-gradient(135deg, ${meta.from}, ${meta.to})` }} />
        <div className="absolute inset-0 transition-all duration-700" style={{ clipPath: clip, background: 'linear-gradient(to bottom, rgba(255,255,255,0.30), rgba(255,255,255,0) 55%)' }} />
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-base sm:text-lg font-bold text-white tnum drop-shadow-[0_1px_2px_rgba(15,23,42,0.4)]">{fmtInt(count)}</span>
        </div>
      </div>

      {/* Conversão pro degrau seguinte */}
      <div className="w-[64px] sm:w-28 flex flex-col items-start justify-center pl-3 shrink-0">
        {conv != null ? (
          <>
            <span className="text-sm font-bold text-slate-700 dark:text-slate-200 tnum leading-none">{conv}%</span>
            {prevWord && <span className="text-[10px] text-slate-400 dark:text-slate-500 leading-tight mt-0.5 hidden sm:block">{prevWord}</span>}
          </>
        ) : (
          <span className="text-[10px] uppercase tracking-wider text-slate-300 dark:text-slate-600 font-semibold">topo</span>
        )}
      </div>
    </div>
  );
}

function FunnelSkeleton() {
  return (
    <div className="space-y-0 animate-pulse">
      {[100, 70, 50, 32].map((w, i) => (
        <div key={i} className="h-[60px] flex items-center justify-center">
          <div className="h-full bg-slate-200/70 dark:bg-slate-700/50" style={{ width: `${w}%`, clipPath: 'polygon(6% 0,94% 0,100% 100%,0 100%)' }} />
        </div>
      ))}
    </div>
  );
}

export default function WeeklyFunnel({ range, scope = 'sales' }) {
  const { data, isLoading } = useSalesFunnel(range, scope);

  const counts = useMemo(
    () => [data?.leads || 0, data?.qualified || 0, data?.meetings || 0, data?.clients || 0],
    [data],
  );
  const widths = useMemo(() => computeWidths(counts), [counts]);
  const revenue = data?.revenue || 0;
  const winRate = data?.ratios?.winRate ?? 0;
  const isEmpty = !isLoading && counts.every((c) => c === 0);

  return (
    <section className="glass rounded-2xl overflow-hidden">
      <div className="flex items-center justify-between gap-3 px-5 pt-5">
        <div className="flex items-center gap-2.5 min-w-0">
          <span className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 bg-fyness-primary/10 text-fyness-primary ring-1 ring-fyness-primary/20">
            <Filter size={16} />
          </span>
          <div className="min-w-0">
            <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-200">Funil da Semana</h3>
            <p className="text-[11px] text-slate-400 dark:text-slate-500">Do lead ao fechamento</p>
          </div>
        </div>
        {!isEmpty && !isLoading && (
          <div className="text-right">
            <div className="text-sm font-bold text-slate-800 dark:text-slate-100 tnum leading-none">{winRate}%</div>
            <div className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5">lead → cliente</div>
          </div>
        )}
      </div>

      <div className="p-5 pt-4">
        {isLoading ? (
          <FunnelSkeleton />
        ) : isEmpty ? (
          <div className="py-10 text-center">
            <Filter size={30} className="mx-auto text-slate-300 dark:text-slate-600 mb-2" />
            <p className="text-sm text-slate-400 dark:text-slate-500">Sem leads nesta semana ainda.</p>
          </div>
        ) : (
          <div>
            {STEPS.map((meta, i) => {
              const isLast = i === STEPS.length - 1;
              return (
                <FunnelRow
                  key={meta.key}
                  meta={meta}
                  count={counts[i]}
                  value={meta.key === 'clients' ? revenue : undefined}
                  prevCount={i > 0 ? counts[i - 1] : null}
                  prevWord={i > 0 ? STEPS[i - 1].toNext : null}
                  topW={widths[i]}
                  botW={isLast ? widths[i] * 0.5 : widths[i + 1]}
                  index={i}
                />
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
