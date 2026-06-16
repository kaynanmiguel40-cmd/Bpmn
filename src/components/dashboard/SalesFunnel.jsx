/**
 * SalesFunnel — Funil de conversão atividade → venda (dashboard comercial).
 *
 *   Ligações → Atendidas → Reuniões → Leads → Qualificados → Clientes
 *
 * Desenho de funil DE VERDADE: cada estágio é um trapézio (clip-path) que
 * afunila pro próximo, com gradiente de marca descendo da ligação (azul) até
 * o cliente (verde = sucesso). Coluna esquerda = rótulo, coluna direita = taxa
 * de conversão pro degrau seguinte. Ribbon no topo com as razões-chave.
 *
 * Controlado OU autônomo: se receber `range`/`scope` por prop, segue o filtro
 * da página (ex: CrmDashboardPage); senão gerencia o próprio seletor de período.
 */

import { useMemo, useState } from 'react';
import {
  Phone, PhoneCall, CalendarCheck, UserPlus, BadgeCheck, Crown, Filter,
} from 'lucide-react';
import { useSalesFunnel } from '../../modules/crm/hooks/useCrmQueries';

// ─── Helpers ──────────────────────────────────────────────────────

const fmtInt = (v) => new Intl.NumberFormat('pt-BR').format(v || 0);
const fmtCurrency = (v) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(v || 0);

const PERIOD_OPTIONS = [
  { value: 'month', label: 'Mês atual' },
  { value: 'last_month', label: 'Mês anterior' },
  { value: 'last_30', label: 'Últimos 30 dias' },
];

function getPeriodRange(period) {
  const now = new Date();
  let start, end;
  switch (period) {
    case 'last_month':
      start = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      end = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999);
      break;
    case 'last_30':
      start = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      end = now;
      break;
    default: // month
      start = new Date(now.getFullYear(), now.getMonth(), 1);
      end = now;
  }
  return { start: start.toISOString(), end: end.toISOString() };
}

// Larguras (% da coluna central) por estágio. SEMPRE afunila: cada fatia é no
// mínimo TAPER_STEP% mais estreita que a de cima (silhueta de funil garantida),
// e fica AINDA mais estreita se o dado cair mais que isso. Topo = 100%.
const TAPER_STEP = 13;
const FLOOR_W = 14;
function computeWidths(steps) {
  const top = steps[0]?.count || 0;
  const out = [];
  let prev = 100;
  steps.forEach((s, i) => {
    if (i === 0) { out.push(100); prev = 100; return; }
    const cap = prev - TAPER_STEP;                       // nunca mais largo que isso
    const prop = top > 0 ? (s.count / top) * 100 : cap;  // proporcional ao volume real
    const w = Math.max(Math.min(prop, cap), FLOOR_W);
    out.push(w);
    prev = w;
  });
  return out;
}

// Metadados por degrau: ícone, gradiente (marca) e o verbo da transição.
const STEP_META = {
  calls:     { icon: Phone,         from: '#93c5fd', to: '#60a5fa', toNext: 'atenderam' },
  answered:  { icon: PhoneCall,     from: '#60a5fa', to: '#3b82f6', toNext: 'viraram reunião' },
  meetings:  { icon: CalendarCheck, from: '#38bdf8', to: '#0ea5e9', toNext: 'viraram lead' },
  leads:     { icon: UserPlus,      from: '#818cf8', to: '#6366f1', toNext: 'qualificaram' },
  qualified: { icon: BadgeCheck,    from: '#fbbf24', to: '#f59e0b', toNext: 'fecharam' },
  clients:   { icon: Crown,         from: '#34d399', to: '#10b981', toNext: null },
};

// ─── Sub-componentes ──────────────────────────────────────────────

function RatioStat({ value, label, suffix }) {
  return (
    <div className="flex-1 min-w-0 text-center px-2">
      <div className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tnum leading-none">
        {value}
        {suffix && <span className="text-sm font-semibold text-slate-400 dark:text-slate-500 ml-0.5">{suffix}</span>}
      </div>
      <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 leading-tight">{label}</div>
    </div>
  );
}

function FunnelRow({ step, prevStep, topW, botW, index }) {
  const meta = STEP_META[step.key] || STEP_META.calls;
  const Icon = meta.icon;

  const clip = `polygon(${(50 - topW / 2).toFixed(2)}% 0%, ${(50 + topW / 2).toFixed(2)}% 0%, ${(50 + botW / 2).toFixed(2)}% 100%, ${(50 - botW / 2).toFixed(2)}% 100%)`;

  const conv = prevStep ? step.fromPrev : null;
  const convWord = prevStep ? STEP_META[prevStep.key]?.toNext : null;

  return (
    <div
      className="relative flex items-stretch h-[60px] animate-fade-up"
      style={{ animationDelay: `${0.06 * index}s` }}
    >
      {/* Coluna rótulo */}
      <div className="w-[88px] sm:w-36 flex items-center justify-end gap-2 pr-3 text-right shrink-0">
        <div className="min-w-0">
          <div className="text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-200 truncate">{step.label}</div>
          {step.key === 'clients' && step.value > 0 && (
            <div className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium tnum truncate">{fmtCurrency(step.value)}</div>
          )}
        </div>
        <span
          className="w-7 h-7 rounded-lg hidden sm:flex items-center justify-center shrink-0 text-white shadow-sm"
          style={{ background: `linear-gradient(135deg, ${meta.from}, ${meta.to})` }}
        >
          <Icon size={14} />
        </span>
      </div>

      {/* Fatia do funil (trapézio) */}
      <div className="relative flex-1 min-w-0">
        <div
          className="absolute inset-0 transition-all duration-700"
          style={{ clipPath: clip, background: `linear-gradient(135deg, ${meta.from}, ${meta.to})` }}
        />
        {/* brilho de vidro no topo da fatia */}
        <div
          className="absolute inset-0 transition-all duration-700"
          style={{ clipPath: clip, background: 'linear-gradient(to bottom, rgba(255,255,255,0.30), rgba(255,255,255,0) 55%)' }}
        />
        {/* contagem centralizada (fora do clip pra nunca cortar) */}
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-base sm:text-lg font-bold text-white tnum drop-shadow-[0_1px_2px_rgba(15,23,42,0.4)]">
            {fmtInt(step.count)}
          </span>
        </div>
      </div>

      {/* Coluna conversão */}
      <div className="w-[60px] sm:w-24 flex flex-col items-start justify-center pl-3 shrink-0">
        {conv != null ? (
          <>
            <span className="text-sm font-bold text-slate-700 dark:text-slate-200 tnum leading-none">{conv}%</span>
            {convWord && <span className="text-[10px] text-slate-400 dark:text-slate-500 leading-tight mt-0.5 hidden sm:block">{convWord}</span>}
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
      {[100, 80, 62, 48, 36, 26].map((w, i) => (
        <div key={i} className="h-[60px] flex items-center justify-center">
          <div className="h-full bg-slate-200/70 dark:bg-slate-700/50" style={{ width: `${w}%`, clipPath: 'polygon(6% 0,94% 0,100% 100%,0 100%)' }} />
        </div>
      ))}
    </div>
  );
}

// ─── Componente principal ─────────────────────────────────────────

export function SalesFunnel({ range: controlledRange, scope = 'sales' }) {
  const [period, setPeriod] = useState('month');
  const internalRange = useMemo(() => getPeriodRange(period), [period]);
  const controlled = !!controlledRange;
  const range = controlledRange || internalRange;

  const { data, isLoading } = useSalesFunnel(range, scope);

  const steps = data?.steps || [];
  const ratios = data?.ratios || {};
  const widths = useMemo(() => computeWidths(steps), [steps]);
  const isEmpty = !isLoading && (data?.callsTotal || 0) === 0 && (data?.leads || 0) === 0;

  return (
    <section className="glass rounded-2xl overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between gap-3 px-5 pt-5">
        <div className="flex items-center gap-2.5 min-w-0">
          <span className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 bg-fyness-primary/10 text-fyness-primary ring-1 ring-fyness-primary/20">
            <Filter size={16} />
          </span>
          <div className="min-w-0">
            <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-200">Funil de Conversão</h3>
            <p className="text-[11px] text-slate-400 dark:text-slate-500">Da ligação ao cliente</p>
          </div>
        </div>
        {!controlled && (
          <select
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
            className="text-xs font-medium bg-white/70 dark:bg-slate-900/60 backdrop-blur-xl border border-white/60 dark:border-white/10 shadow-glass rounded-xl px-3 py-2 text-slate-700 dark:text-slate-200 cursor-pointer focus:outline-none focus:ring-2 focus:ring-fyness-primary/40"
          >
            {PERIOD_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        )}
      </div>

      <div className="p-5 pt-4 space-y-5">
        {/* Ribbon de razões */}
        <div className="flex items-stretch divide-x divide-slate-200/70 dark:divide-slate-700/70 rounded-xl bg-slate-50/60 dark:bg-slate-800/40 py-3">
          <RatioStat
            value={ratios.callsPerMeeting != null ? String(ratios.callsPerMeeting).replace('.', ',') : '—'}
            label="ligações por reunião"
          />
          <RatioStat value={ratios.answerRate ?? 0} suffix="%" label="taxa de atendimento" />
          <RatioStat value={ratios.winRate ?? 0} suffix="%" label="win rate (lead → cliente)" />
        </div>

        {/* Funil */}
        {isLoading ? (
          <FunnelSkeleton />
        ) : isEmpty ? (
          <div className="py-12 text-center">
            <Filter size={32} className="mx-auto text-slate-300 dark:text-slate-600 mb-2" />
            <p className="text-sm text-slate-400 dark:text-slate-500">
              Sem ligações ou leads no período. Registre ligações no Discador pra ver o funil ganhar vida.
            </p>
          </div>
        ) : (
          <div>
            {steps.map((step, i) => {
              const isLast = i === steps.length - 1;
              return (
                <FunnelRow
                  key={step.key}
                  step={step}
                  prevStep={i > 0 ? steps[i - 1] : null}
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

export default SalesFunnel;
