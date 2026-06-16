/**
 * Comparativo — Previsto vs Real (plano comercial).
 *
 * Compara, mes a mes, o planejamento estrategico (previsto, cravado do PDF)
 * contra o real do CRM (deals ganhos + funil + trafego). Foco no mes atual, com
 * a curva de MRR rumo a R$100k, funil, conversoes e marketing.
 */

import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import {
  ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ReferenceLine,
} from 'recharts';
import { Target } from 'lucide-react';
import {
  PLAN_MONTHS, PREMISSAS, PLAN_GOAL_MRR, PLAN_POSITION,
  planMonthLabel, planMonthLong,
} from '../../../lib/commercialPlan';
import { getCommercialPlanReal } from '../../../lib/commercialPlanReal';
import {
  PLAN_PHASES, actionId, TOTAL_ACTIONS, getPlanActionsState, setPlanActionDone,
} from '../../../lib/commercialPlanActions';
import { useProfile } from '../../../hooks/useProfile';

const fmtBRL = (v) => 'R$ ' + Math.round(v || 0).toLocaleString('pt-BR');
const fmtK = (v) => 'R$' + Math.round((v || 0) / 1000) + 'k';

function gapTone(real, prev) {
  if (real == null) return 'text-slate-400 dark:text-slate-500';
  if (real >= prev) return 'text-emerald-600 dark:text-emerald-400';
  if (real >= prev * 0.7) return 'text-amber-600 dark:text-amber-400';
  return 'text-rose-600 dark:text-rose-400';
}

// ---------- Hero do mes atual ----------
function CurrentMonthHero({ planRow, real, monthElapsedPct }) {
  const prevMrr = planRow.mrr;
  const realMrr = real?.mrrAccum ?? 0;
  const reachedPct = prevMrr > 0 ? Math.round((realMrr / prevMrr) * 100) : 0;
  // "Ritmo": real vs previsto pro-rateado pelo % do mes ja decorrido.
  const expectedSoFar = prevMrr * (monthElapsedPct / 100);
  const onPace = realMrr >= expectedSoFar;

  const Stat = ({ label, prev, realVal, fmt = (x) => x }) => (
    <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/60 p-4">
      <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">{label}</div>
      <div className="mt-1.5 flex items-baseline gap-2">
        <span className={`text-2xl font-bold ${gapTone(realVal, prev)}`}>{realVal == null ? '—' : fmt(realVal)}</span>
        <span className="text-xs text-slate-400 dark:text-slate-500">/ {fmt(prev)} prev.</span>
      </div>
    </div>
  );

  return (
    <div className="rounded-2xl border border-fyness-primary/20 bg-gradient-to-br from-fyness-primary/[0.07] to-transparent dark:from-fyness-primary/[0.12] p-5 md:p-6">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div>
          <div className="text-[11px] font-semibold uppercase tracking-wider text-fyness-primary">Mes atual · M{planRow.m}</div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">{planMonthLong(planRow.m)}</h2>
        </div>
        <div className="text-right">
          <div className="text-[11px] text-slate-400 dark:text-slate-500">{monthElapsedPct}% do mes decorrido</div>
          <span className={`inline-flex items-center gap-1 mt-1 px-2.5 py-1 rounded-full text-[11px] font-semibold ${onPace ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' : 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'}`}>
            {onPace ? 'No ritmo' : 'Abaixo do ritmo'}
          </span>
        </div>
      </div>

      {/* MRR — barra de progresso previsto vs real */}
      <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/60 p-4 mb-3">
        <div className="flex items-baseline justify-between">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">MRR acumulado</span>
          <span className="text-[11px] text-slate-400 dark:text-slate-500">{reachedPct}% do previsto do mes</span>
        </div>
        <div className="mt-1.5 flex items-baseline gap-2">
          <span className="text-3xl font-extrabold text-slate-900 dark:text-white">{fmtBRL(realMrr)}</span>
          <span className="text-sm text-slate-400 dark:text-slate-500">/ {fmtBRL(prevMrr)} previsto</span>
        </div>
        <div className="mt-3 h-2.5 rounded-full bg-slate-100 dark:bg-slate-700 overflow-hidden relative">
          <div className="h-full bg-fyness-primary rounded-full transition-all" style={{ width: `${Math.min(100, reachedPct)}%` }} />
          {/* marcador do ritmo esperado ate agora */}
          <div className="absolute top-0 h-full w-0.5 bg-slate-400 dark:bg-slate-300" style={{ left: `${Math.min(100, monthElapsedPct)}%` }} title="Ritmo esperado ate agora" />
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <Stat label="Clientes ativos" prev={planRow.ativos} realVal={real?.clientesAccum ?? 0} />
        <Stat label="Novos no mes" prev={planRow.novos} realVal={real?.novos ?? 0} />
        <Stat label="Reunioes" prev={planRow.reun} realVal={real?.funnel?.reun ?? 0} />
        <Stat label="Leads" prev={planRow.leads} realVal={real?.funnel?.lead ?? 0} />
      </div>
    </div>
  );
}

// ---------- Curva de MRR ----------
function MrrChart({ real }) {
  const data = [
    { label: 'hoje', prev: PLAN_POSITION.mrr, real: PLAN_POSITION.mrr },
    ...PLAN_MONTHS.map(p => ({
      label: planMonthLabel(p.m),
      prev: p.mrr,
      real: real.byMonth[p.m] ? real.byMonth[p.m].mrrAccum : null,
    })),
  ];
  return (
    <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/60 p-5">
      <div className="flex items-center justify-between mb-1">
        <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100">Trajetoria de MRR</h3>
        <span className="text-[11px] text-slate-400 dark:text-slate-500">{fmtBRL(PLAN_POSITION.mrr)} → {fmtK(PLAN_GOAL_MRR)} (meta)</span>
      </div>
      <ResponsiveContainer width="100%" height={280}>
        <LineChart data={data} margin={{ top: 10, right: 8, left: -8, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" className="stroke-slate-200 dark:stroke-slate-700" />
          <XAxis dataKey="label" tick={{ fontSize: 10 }} stroke="#94a3b8" />
          <YAxis tickFormatter={(v) => `${Math.round(v / 1000)}k`} tick={{ fontSize: 10 }} stroke="#94a3b8" />
          <Tooltip
            formatter={(v) => (v == null ? '—' : fmtBRL(v))}
            contentStyle={{ borderRadius: 12, border: '1px solid #e2e8f0', fontSize: 12 }}
          />
          <ReferenceLine y={PLAN_GOAL_MRR} stroke="#f43f5e" strokeDasharray="4 4" label={{ value: 'Meta R$100k', position: 'insideTopRight', fontSize: 10, fill: '#f43f5e' }} />
          <Line type="monotone" dataKey="prev" name="Previsto" stroke="#3b82f6" strokeWidth={2} strokeDasharray="5 4" dot={false} />
          <Line type="monotone" dataKey="real" name="Real" stroke="#10b981" strokeWidth={2.5} dot={{ r: 3 }} connectNulls={false} />
        </LineChart>
      </ResponsiveContainer>
      <div className="flex items-center gap-4 mt-1 text-[11px]">
        <span className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400"><span className="w-3 border-t-2 border-dashed border-blue-500" /> Previsto</span>
        <span className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400"><span className="w-3 border-t-2 border-emerald-500" /> Real</span>
      </div>
    </div>
  );
}

// ---------- Tabela mes a mes ----------
function MonthlyTable({ real }) {
  const Cell = ({ children, className = '' }) => <td className={`px-3 py-2 text-right tabular-nums ${className}`}>{children}</td>;
  return (
    <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/60 overflow-hidden">
      <div className="px-5 py-3 border-b border-slate-200 dark:border-slate-700">
        <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100">Mes a mes · previsto vs real</h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="text-[10px] uppercase tracking-wider text-slate-400 dark:text-slate-500 border-b border-slate-100 dark:border-slate-700/60">
              <th className="px-3 py-2 text-left">Mes</th>
              <th className="px-3 py-2 text-right">MRR prev.</th>
              <th className="px-3 py-2 text-right">MRR real</th>
              <th className="px-3 py-2 text-right">Novos prev/real</th>
              <th className="px-3 py-2 text-right">Ativos prev/real</th>
            </tr>
          </thead>
          <tbody>
            {PLAN_MONTHS.map(p => {
              const r = real.byMonth[p.m];
              const isCurrent = real.currentM === p.m;
              return (
                <tr key={p.m} className={`border-b border-slate-50 dark:border-slate-700/40 ${isCurrent ? 'bg-fyness-primary/[0.06] dark:bg-fyness-primary/[0.1]' : ''}`}>
                  <td className="px-3 py-2 text-left">
                    <span className={`font-semibold ${isCurrent ? 'text-fyness-primary' : 'text-slate-700 dark:text-slate-200'}`}>{planMonthLabel(p.m)}</span>
                    <span className="text-slate-400 dark:text-slate-500"> · M{p.m}</span>
                    {r?.partial && <span className="ml-1 text-[9px] text-amber-500">em curso</span>}
                  </td>
                  <Cell className="text-slate-500 dark:text-slate-400">{fmtBRL(p.mrr)}</Cell>
                  <Cell className={`font-semibold ${gapTone(r?.mrrAccum, p.mrr)}`}>{r ? fmtBRL(r.mrrAccum) : '—'}</Cell>
                  <Cell className="text-slate-600 dark:text-slate-300">
                    {p.novos} <span className="text-slate-300 dark:text-slate-600">/</span> <span className={r ? 'font-semibold ' + gapTone(r.novos, p.novos) : ''}>{r ? r.novos : '—'}</span>
                  </Cell>
                  <Cell className="text-slate-600 dark:text-slate-300">
                    {p.ativos} <span className="text-slate-300 dark:text-slate-600">/</span> <span className={r ? 'font-semibold ' + gapTone(r.clientesAccum, p.ativos) : ''}>{r ? r.clientesAccum : '—'}</span>
                  </Cell>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ---------- Funil + premissas do mes atual ----------
function FunnelCompare({ planRow, real }) {
  const f = real?.funnel;
  const rows = [
    { label: 'Leads', prev: planRow.leads, real: f?.lead },
    { label: 'Qualificados', prev: planRow.qualif, real: f?.qualif },
    { label: 'Reunioes', prev: planRow.reun, real: f?.reun },
    { label: 'Fechamentos', prev: planRow.fech, real: f?.fech },
  ];
  const premReal = {
    qualif: f?.qualRate,
    agendamento: f?.agendRate,
    fechamento: f?.fechRate,
    reativacao: null, // nao rastreado direto
  };
  return (
    <div className="grid md:grid-cols-2 gap-4">
      <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/60 p-5">
        <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 mb-3">Funil do mes · previsto vs real</h3>
        <div className="space-y-3">
          {rows.map(row => {
            const w = row.prev > 0 ? Math.min(100, Math.round(((row.real ?? 0) / row.prev) * 100)) : 0;
            return (
              <div key={row.label}>
                <div className="flex items-baseline justify-between text-xs mb-1">
                  <span className="text-slate-600 dark:text-slate-300">{row.label}</span>
                  <span className="tabular-nums">
                    <span className={`font-semibold ${gapTone(row.real, row.prev)}`}>{row.real == null ? '—' : row.real}</span>
                    <span className="text-slate-400 dark:text-slate-500"> / {row.prev}</span>
                  </span>
                </div>
                <div className="h-1.5 rounded-full bg-slate-100 dark:bg-slate-700 overflow-hidden">
                  <div className="h-full bg-fyness-primary/80 rounded-full" style={{ width: `${w}%` }} />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/60 p-5">
        <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 mb-3">Conversoes · previsto vs real</h3>
        <div className="space-y-2.5">
          {PREMISSAS.map(prem => {
            const realPct = premReal[prem.key];
            return (
              <div key={prem.key} className="flex items-center justify-between border-b border-slate-50 dark:border-slate-700/40 pb-2 last:border-0">
                <div>
                  <div className="text-xs font-medium text-slate-700 dark:text-slate-200">{prem.label}</div>
                  <div className="text-[10px] text-slate-400 dark:text-slate-500">{prem.sub}</div>
                </div>
                <div className="text-right tabular-nums">
                  <span className={`text-sm font-bold ${realPct == null ? 'text-slate-300 dark:text-slate-600' : gapTone(realPct, prem.pct)}`}>{realPct == null ? '—' : `${realPct}%`}</span>
                  <span className="text-[11px] text-slate-400 dark:text-slate-500"> / {prem.pct}%</span>
                </div>
              </div>
            );
          })}
        </div>
        <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-3">Reativacao nao e rastreada direto no funil. Churn fora do escopo.</p>
      </div>
    </div>
  );
}

// ---------- Marketing (trafego pago) ----------
function MktTile({ label, value, sub }) {
  return (
    <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/60 p-4">
      <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">{label}</div>
      <div className="mt-1 text-xl font-bold text-slate-900 dark:text-white tabular-nums">{value}</div>
      {sub && <div className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5">{sub}</div>}
    </div>
  );
}

function MarketingPanel({ marketing }) {
  const has = marketing && marketing.hasData;
  return (
    <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/60 p-5">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100">Marketing · trafego pago (mes atual)</h3>
        <span className="text-[11px] text-slate-400 dark:text-slate-500">Fase 4 · inbound</span>
      </div>
      {!has ? (
        <div className="text-center py-6">
          <p className="text-sm text-slate-400 dark:text-slate-500">Sem registros de trafego pago neste mes.</p>
          <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1">Lance o investimento em <strong>CRM › Trafego</strong> pra ver CPL, CAC e ROAS aqui.</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            <MktTile label="Investimento" value={fmtBRL(marketing.spent)} />
            <MktTile label="Leads gerados" value={marketing.leads} />
            <MktTile label="CPL" value={fmtBRL(marketing.cpl)} sub="custo por lead" />
            <MktTile label="CAC" value={marketing.cac > 0 ? fmtBRL(marketing.cac) : '—'} sub="invest. / novo cliente" />
            <MktTile label="Conversoes" value={marketing.conversions} />
            <MktTile label="ROAS" value={marketing.roas > 0 ? marketing.roas.toFixed(1) + 'x' : '—'} sub="retorno s/ investimento" />
          </div>
          <div className="flex flex-wrap gap-x-5 gap-y-1 mt-3 text-[11px] text-slate-400 dark:text-slate-500">
            <span>Impressoes: <span className="tabular-nums">{(marketing.impressions || 0).toLocaleString('pt-BR')}</span></span>
            <span>Cliques: <span className="tabular-nums">{(marketing.clicks || 0).toLocaleString('pt-BR')}</span></span>
            <span>CTR: <span className="tabular-nums">{(marketing.ctr || 0).toFixed(1)}%</span></span>
            <span>CPC: <span className="tabular-nums">{fmtBRL(marketing.cpc)}</span></span>
          </div>
        </>
      )}
    </div>
  );
}

// ---------- Plano de acao · checklist (5W1H) ----------
function CheckIcon() {
  return (
    <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3.5} d="M5 13l4 4L19 7" /></svg>
  );
}

function PhaseChecklistCard({ phase, state, onToggle }) {
  const [showW, setShowW] = useState(false);
  const total = phase.como.length;
  const done = phase.como.reduce((c, _, i) => c + (state[actionId(phase.key, i)]?.done ? 1 : 0), 0);
  const allDone = done === total;
  const ws = [
    ['O QUE', phase.oque],
    ['POR QUE', phase.porque],
    ['QUEM', phase.quem],
    ['ONDE', phase.onde],
    ['QUANDO', phase.quando],
  ].filter(([, v]) => v);

  return (
    <div className={`rounded-2xl border bg-white dark:bg-slate-800/60 p-4 flex flex-col ${allDone ? 'border-emerald-300 dark:border-emerald-800/60' : 'border-slate-200 dark:border-slate-700'}`}>
      <div className="flex items-start gap-2.5 mb-2">
        <div className={`shrink-0 w-8 h-8 rounded-lg flex items-center justify-center text-sm font-extrabold ${allDone ? 'bg-emerald-500 text-white' : 'bg-fyness-primary/10 text-fyness-primary'}`}>{phase.n}</div>
        <div className="min-w-0 flex-1">
          <h4 className="text-sm font-bold text-slate-800 dark:text-slate-100 leading-tight">{phase.title}</h4>
          <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">{phase.tag}</p>
        </div>
        <span className={`shrink-0 text-[11px] font-bold px-2 py-0.5 rounded-full ${allDone ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' : 'bg-slate-100 text-slate-500 dark:bg-slate-700 dark:text-slate-400'}`}>{done}/{total}</span>
      </div>

      <div className="h-1 rounded-full bg-slate-100 dark:bg-slate-700 overflow-hidden mb-2">
        <div className={`h-full rounded-full transition-all ${allDone ? 'bg-emerald-500' : 'bg-fyness-primary'}`} style={{ width: `${total ? (done / total) * 100 : 0}%` }} />
      </div>

      <div className="space-y-0.5 flex-1">
        {phase.como.map((text, i) => {
          const id = actionId(phase.key, i);
          const st = state[id];
          const isDone = !!st?.done;
          return (
            <button
              key={id}
              type="button"
              onClick={() => onToggle(id, isDone)}
              title={isDone && st?.doneBy ? `Feito por ${st.doneBy}${st.doneAt ? ' · ' + new Date(st.doneAt).toLocaleDateString('pt-BR') : ''}` : 'Marcar como feito'}
              className="w-full flex items-start gap-2 text-left py-1 group"
            >
              <span className={`mt-0.5 w-4 h-4 rounded border-2 flex items-center justify-center shrink-0 transition-colors ${isDone ? 'bg-emerald-500 border-emerald-500' : 'border-slate-300 dark:border-slate-600 group-hover:border-fyness-primary'}`}>
                {isDone && <CheckIcon />}
              </span>
              <span className={`text-xs leading-snug ${isDone ? 'line-through text-slate-400 dark:text-slate-500' : 'text-slate-700 dark:text-slate-200'}`}>{text}</span>
            </button>
          );
        })}
      </div>

      <div className={`mt-2.5 rounded-lg px-3 py-2 text-[11px] ${allDone ? 'bg-emerald-50 dark:bg-emerald-900/15' : 'bg-slate-50 dark:bg-slate-900/40'}`}>
        <span className="font-semibold uppercase tracking-wider text-[9px] text-slate-400 dark:text-slate-500">{phase.saidaLabel}</span>
        <p className="text-slate-600 dark:text-slate-300 mt-0.5 leading-snug">{phase.saida}</p>
      </div>

      {ws.length > 0 && (
        <div className="mt-2">
          <button type="button" onClick={() => setShowW(v => !v)} className="text-[10px] font-semibold text-fyness-primary hover:underline">
            {showW ? 'Ocultar 5W1H' : 'Ver 5W1H'}
          </button>
          {showW && (
            <dl className="mt-1.5 space-y-1.5">
              {ws.map(([k, v]) => (
                <div key={k}>
                  <dt className="text-[9px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">{k}</dt>
                  <dd className="text-[11px] text-slate-600 dark:text-slate-300 leading-snug">{v}</dd>
                </div>
              ))}
            </dl>
          )}
        </div>
      )}
    </div>
  );
}

function PlanChecklist() {
  const queryClient = useQueryClient();
  const { profile } = useProfile();
  const { data: state = {} } = useQuery({
    queryKey: ['planActions'],
    queryFn: getPlanActionsState,
    staleTime: 30_000,
  });

  const doneCount = PLAN_PHASES.reduce(
    (s, p) => s + p.como.reduce((c, _, i) => c + (state[actionId(p.key, i)]?.done ? 1 : 0), 0),
    0
  );
  const overallPct = TOTAL_ACTIONS ? Math.round((doneCount / TOTAL_ACTIONS) * 100) : 0;

  const toggle = async (id, current) => {
    const next = !current;
    queryClient.setQueryData(['planActions'], (old = {}) => ({
      ...old,
      [id]: { done: next, doneBy: next ? (profile?.name || null) : null, doneAt: next ? new Date().toISOString() : null },
    }));
    try {
      await setPlanActionDone(id, next, profile?.name);
    } catch {
      queryClient.invalidateQueries({ queryKey: ['planActions'] });
    }
  };

  return (
    <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50/60 dark:bg-slate-900/30 p-5">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div>
          <h3 className="text-base font-bold text-slate-800 dark:text-slate-100">Plano de acao · checklist</h3>
          <p className="text-[11px] text-slate-400 dark:text-slate-500">5 fases (5W1H) · marque o que ja foi feito</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="w-32 h-2 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
            <div className="h-full bg-fyness-primary rounded-full transition-all" style={{ width: `${overallPct}%` }} />
          </div>
          <span className="text-sm font-bold text-slate-700 dark:text-slate-200 tabular-nums">{doneCount}/{TOTAL_ACTIONS} · {overallPct}%</span>
        </div>
      </div>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {PLAN_PHASES.map(phase => (
          <PhaseChecklistCard key={phase.key} phase={phase} state={state} onToggle={toggle} />
        ))}
      </div>
    </div>
  );
}

export default function ComparativoPage() {
  const { data: real, isLoading } = useQuery({
    queryKey: ['commercialPlanReal'],
    queryFn: getCommercialPlanReal,
    staleTime: 60_000,
  });

  if (isLoading || !real) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-fyness-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const currentM = real.currentM || 1;
  const planRow = PLAN_MONTHS.find(p => p.m === currentM) || PLAN_MONTHS[0];
  const currentReal = real.byMonth[currentM] || null;

  return (
    <div className="max-w-7xl mx-auto space-y-5">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 text-fyness-primary mb-1">
            <Target className="w-5 h-5" />
            <span className="text-[11px] font-semibold uppercase tracking-wider">Plano comercial</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Comparativo</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">Previsto vs Real · meta de {fmtK(PLAN_GOAL_MRR)} de MRR em 12 meses · M1 = junho/2026</p>
        </div>
        <div className="flex gap-2">
          <div className="rounded-xl border border-slate-200 dark:border-slate-700 px-4 py-2 bg-white dark:bg-slate-800/60">
            <div className="text-[10px] uppercase tracking-wider text-slate-400 dark:text-slate-500">Partida</div>
            <div className="text-sm font-bold text-slate-800 dark:text-slate-100">{fmtBRL(PLAN_POSITION.mrr)} · {PLAN_POSITION.clientes} clientes</div>
          </div>
          <div className="rounded-xl border border-fyness-primary/30 px-4 py-2 bg-fyness-primary/[0.06]">
            <div className="text-[10px] uppercase tracking-wider text-fyness-primary">Meta 12m</div>
            <div className="text-sm font-bold text-fyness-primary">{fmtK(PLAN_GOAL_MRR)} MRR</div>
          </div>
        </div>
      </div>

      <CurrentMonthHero planRow={planRow} real={currentReal} monthElapsedPct={real.monthElapsedPct} />
      <MrrChart real={real} />
      <FunnelCompare planRow={planRow} real={currentReal} />
      <MarketingPanel marketing={real.marketing} />
      <MonthlyTable real={real} />
      <PlanChecklist />

      <p className="text-[11px] text-slate-400 dark:text-slate-500 text-center pb-2">
        Real lido dos negocios <strong>ganhos</strong> no CRM (MRR = campo de mensalidade do deal) e do funil de vendas. Clientes fora do CRM nao entram. Premissas a validar nos primeiros 90 dias.
      </p>
    </div>
  );
}
