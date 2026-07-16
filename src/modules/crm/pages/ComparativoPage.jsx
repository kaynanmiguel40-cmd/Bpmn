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
import { useNavigate } from 'react-router-dom';
import {
  Target, TrendingUp, TrendingDown, Gauge, CalendarDays, Flame, X,
} from 'lucide-react';
import {
  PLAN_MONTHS, PREMISSAS, PLAN_GOAL_MRR, PLAN_POSITION, COMPARECIMENTO_RATE,
  planMonthLabel, planMonthLong, reajustarTrajetoriaMrr,
} from '../../../lib/commercialPlan';
import { getCommercialPlanReal } from '../../../lib/commercialPlanReal';
import {
  PLAN_PHASES, actionId, TOTAL_ACTIONS, getPlanActionsState, setPlanActionDone,
} from '../../../lib/commercialPlanActions';
import { useProfile } from '../../../hooks/useProfile';
import { FunnelPrevistoReal } from '../components/FunnelPrevistoReal';
import { useFunnelStageDeals } from '../hooks/useCrmQueries';
import { toast } from '../../../contexts/ToastContext';

const fmtBRL = (v) => 'R$ ' + Math.round(v || 0).toLocaleString('pt-BR');
const fmtK = (v) => 'R$' + Math.round((v || 0) / 1000) + 'k';

function gapTone(real, prev) {
  if (real == null) return 'text-slate-400 dark:text-slate-500';
  if (real >= prev) return 'text-emerald-600 dark:text-emerald-400';
  if (real >= prev * 0.7) return 'text-amber-600 dark:text-amber-400';
  return 'text-rose-600 dark:text-rose-400';
}

// Status nunca só na cor — sempre acompanhado de um ícone (mesma linguagem do
// selo acima/dentro/abaixo do Acompanhamento da meta).
function gapIcon(real, prev) {
  if (real == null) return null;
  if (real >= prev) return TrendingUp;
  if (real >= prev * 0.7) return Gauge;
  return TrendingDown;
}

// ---------- Acompanhamento da meta do mes (diario / semanal) ----------

function MetaMiniCard({ label, hint, children }) {
  return (
    <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/60 p-4">
      <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">{label}</div>
      <div className="mt-1.5">{children}</div>
      {hint && <div className="text-[10px] text-slate-400 dark:text-slate-500 mt-1">{hint}</div>}
    </div>
  );
}

function MetaMensalPanel({ planRow, currentReal }) {
  const [metric, setMetric] = useState('clientes'); // 'clientes' (ativos) | 'mrr' (R$)
  const isMrr = metric === 'mrr';

  // Meta = ALVO ACUMULADO do plano (clientes ativos ou MRR total do mes), FIXO.
  // O alvo NAO muda — quem anda e o Real (quantos ja sao) e, por consequencia,
  // o "faltam". Antes o card mostrava so o "faltam" (43 ativos − ganhos), que
  // encolhia a cada venda e parecia a meta mudando. Agora a meta e o alvo fixo
  // e o "faltam" e claramente progresso, nao meta.
  // Alvo ACUMULADO do mês (fixo) e onde o Real está hoje.
  const metaAlvo = isMrr ? (planRow.mrr || 0) : (planRow.ativos || 0);
  const realHoje = isMrr ? (currentReal?.mrrAccum ?? 0) : (currentReal?.clientesAccum ?? 0);
  // NÚMERO ACIONÁVEL: quanto falta fechar ESTE mês pra bater o alvo — a "meta do
  // mês" prática (some a cada venda). O alvo cumulativo (ex.: 43) fica de contexto.
  const necessario = Math.max(0, metaAlvo - realHoje);
  const fmt = (v) => (isMrr ? fmtBRL(v) : `${Math.round(v || 0)}`);
  const unitNec = isMrr ? 'de MRR este mês' : (Math.round(necessario) === 1 ? 'venda este mês' : 'vendas este mês');
  const alvoUnit = isMrr ? 'de MRR' : 'clientes ativos';
  const pct = metaAlvo > 0 ? Math.min(100, Math.round((realHoje / metaAlvo) * 100)) : 0;

  return (
    <section className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/60 p-5">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-2">
          <Flame className="w-4 h-4 text-fyness-primary" />
          <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100">Meta do mes · {planMonthLong(planRow.m)}</h3>
        </div>
        <div className="flex rounded-lg border border-slate-200 dark:border-slate-700 overflow-hidden text-[11px] font-semibold">
          {[['clientes', 'Clientes'], ['mrr', 'MRR']].map(([m, lbl]) => (
            <button
              key={m}
              onClick={() => setMetric(m)}
              className={`px-3 py-1.5 transition-colors ${metric === m ? 'bg-fyness-primary text-white' : 'bg-white dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'}`}
            >
              {lbl}
            </button>
          ))}
        </div>
      </div>

      <MetaMiniCard
        label={isMrr ? 'MRR a fechar este mês' : 'Vendas necessárias este mês'}
        hint={`alvo: ${fmt(metaAlvo)} ${alvoUnit} · ${fmt(realHoje)} hoje`}>
        <span className="text-2xl font-bold text-slate-900 dark:text-white">{fmt(necessario)}</span>
        <span className="text-xs text-slate-400 dark:text-slate-500 ml-1">{unitNec}</span>
        {/* Barra de progresso real rumo ao alvo fixo */}
        <div className="mt-2.5 h-1.5 rounded-full bg-slate-100 dark:bg-slate-700 overflow-hidden">
          <div className="h-full rounded-full bg-fyness-primary transition-all" style={{ width: `${pct}%` }} />
        </div>
      </MetaMiniCard>
    </section>
  );
}

// ---------- Curva de MRR ----------
function MrrChart({ real }) {
  const currentM = real.currentM;
  const realMrrNow = currentM ? real.byMonth[currentM]?.mrrAccum ?? null : null;
  // Reajusta a trajetoria futura a partir da posicao REAL de agora — "como
  // se o plano reiniciasse do zero" hoje — preservando o formato original
  // ate a MESMA meta final. Meses ja decorridos ficam intocados.
  const previstoPorMes = currentM != null && realMrrNow != null
    ? reajustarTrajetoriaMrr(PLAN_MONTHS, currentM, realMrrNow, PLAN_GOAL_MRR)
    : PLAN_MONTHS.map(p => p.mrr);
  const reajustou = currentM != null && realMrrNow != null && Math.round(realMrrNow) !== Math.round(PLAN_MONTHS.find(p => p.m === currentM)?.mrr ?? 0);

  const data = [
    { label: 'hoje', prev: PLAN_POSITION.mrr, real: PLAN_POSITION.mrr },
    ...PLAN_MONTHS.map((p, i) => ({
      label: planMonthLabel(p.m),
      prev: previstoPorMes[i],
      real: real.byMonth[p.m] ? real.byMonth[p.m].mrrAccum : null,
    })),
  ];
  return (
    <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/60 p-5">
      <div className="flex items-center justify-between mb-1">
        <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100">Trajetoria de MRR</h3>
        <span className="text-[11px] text-slate-400 dark:text-slate-500">{fmtBRL(PLAN_POSITION.mrr)} → {fmtK(PLAN_GOAL_MRR)} (meta)</span>
      </div>
      {reajustou && (
        <p className="text-[11px] text-fyness-primary font-medium mb-2">
          Previsto reajustado a partir de agora ({fmtBRL(realMrrNow)}) — mesma meta final, novo ritmo daqui pra frente.
        </p>
      )}
      <ResponsiveContainer width="100%" height={280}>
        <LineChart data={data} margin={{ top: 10, right: 8, left: -8, bottom: 0 }}>
          <CartesianGrid className="stroke-slate-200 dark:stroke-slate-700" vertical={false} />
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
            <tr className="text-[10px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 border-b border-slate-100 dark:border-slate-700/60">
              <th className="px-3 py-2.5 text-left">Mes</th>
              <th className="px-3 py-2.5 text-right">MRR prev.</th>
              <th className="px-3 py-2.5 text-right">MRR real</th>
              <th className="px-3 py-2.5 text-right">Novos prev/real</th>
              <th className="px-3 py-2.5 text-right">Ativos prev/real</th>
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
/**
 * Drill-down: os leads por trás do número de uma etapa do funil. Mostra a MESMA
 * coorte que o funil conta (negócios criados no mês que ALCANÇARAM a etapa) —
 * por isso a lista sempre casa com o número exibido.
 */
function FunnelDrillDrawer({ step, range, onClose }) {
  const navigate = useNavigate();
  const { data: deals = [], isLoading } = useFunnelStageDeals(range, 'sales', step?.key);
  if (!step) return null;
  const total = deals.reduce((s, d) => s + (d.value || 0), 0);

  return (
    <div className="fixed inset-0 z-50 flex justify-end" role="dialog" aria-modal="true">
      <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={onClose} />
      <aside className="relative w-full sm:max-w-[420px] h-full bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-700 shadow-2xl flex flex-col">
        <div className="flex items-start justify-between gap-2 p-4 border-b border-slate-200 dark:border-slate-700">
          <div className="min-w-0">
            <h3 className="text-base font-bold text-slate-800 dark:text-white truncate">{step.label}</h3>
            <p className="text-xs text-slate-400 dark:text-slate-500">
              {deals.length} {deals.length === 1 ? 'lead' : 'leads'}{total > 0 ? ` · ${fmtBRL(total)}` : ''}
            </p>
          </div>
          <button onClick={onClose} className="shrink-0 p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800">
            <X size={18} />
          </button>
        </div>

        <div className="flex-1 min-h-0 overflow-y-auto p-3">
          {isLoading ? (
            <div className="flex items-center justify-center py-10">
              <div className="w-6 h-6 border-2 border-fyness-primary border-t-transparent rounded-full animate-spin" />
            </div>
          ) : deals.length === 0 ? (
            <p className="text-sm text-slate-400 dark:text-slate-500 text-center py-10">Nenhum lead nesta etapa neste mes.</p>
          ) : (
            <div className="space-y-1.5">
              {deals.map(d => (
                <button
                  key={d.id}
                  onClick={() => navigate(`/crm/deals/${d.id}`)}
                  className="w-full text-left rounded-xl border border-slate-200 dark:border-slate-700 hover:border-fyness-primary/40 hover:bg-slate-50 dark:hover:bg-slate-800/60 p-3 transition-colors"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-sm font-medium text-slate-800 dark:text-slate-100 truncate">{d.title}</span>
                    {d.value > 0 && (
                      <span className="shrink-0 text-xs font-semibold text-slate-600 dark:text-slate-300 tabular-nums">{fmtBRL(d.value)}</span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 mt-1 text-[11px] text-slate-400 dark:text-slate-500">
                    {d.companyName && <span className="truncate">{d.companyName}</span>}
                    {d.stageName && (
                      <span className="ml-auto shrink-0 px-1.5 py-0.5 rounded-full font-medium"
                        style={{ backgroundColor: `${d.stageColor || '#94a3b8'}22`, color: d.stageColor || '#64748b' }}>
                        {d.stageName}
                      </span>
                    )}
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </aside>
    </div>
  );
}

function FunnelCompare({ real, planRow, range }) {
  const [drillStep, setDrillStep] = useState(null); // { key, label } — etapa clicada
  const f = real?.funnel;
  const premReal = {
    qualif: f?.qualRate,
    agendamento: f?.agendRate,     // qualificado -> reunião agendada
    comparecimento: f?.compRate,   // agendada -> acontecida
    fechamento: f?.fechRate,       // acontecida -> cliente
    reativacao: null, // nao rastreado direto
  };

  return (
    <>
    <div className="grid md:grid-cols-2 gap-4">
      {/* Funil Previsto × Real — o Previsto vem CRAVADO do plano comercial
          (planRow), fixo. Nao reescala com o real: meta e linha de base, so
          o lado Real anda. Reunião vira 2 etapas: AGENDADAS (plano = reun) e
          ACONTECIDAS (previsto = reun × comparecimento; real = concluídas). */}
      <FunnelPrevistoReal
        previsto={{
          lead: planRow.leads,
          qualified: planRow.qualif,
          meetingScheduled: planRow.reun,
          meetingHeld: Math.round(planRow.reun * COMPARECIMENTO_RATE),
          closing: planRow.fech,
        }}
        real={{
          lead: f?.lead,
          qualified: f?.qualif,
          meetingScheduled: f?.agendadas,
          meetingHeld: f?.acontecidas,
          closing: f?.fech,
        }}
        monthLabel={planMonthLong(planRow.m)}
        onStepClick={range ? (key, label) => setDrillStep({ key, label }) : undefined}
      />

      <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/60 p-5">
        <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 mb-3">Conversoes · previsto vs real</h3>
        <div className="space-y-2.5">
          {PREMISSAS.map(prem => {
            // Reativacao nunca sai de null — nao e uma metrica ao vivo como as
            // outras 3, entao ganha um tratamento visivelmente diferente (nao
            // pode competir em peso visual com numero real).
            if (prem.key === 'reativacao') {
              return (
                <div key={prem.key} className="flex items-center justify-between border border-dashed border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-2 opacity-60">
                  <div>
                    <div className="text-xs font-medium text-slate-500 dark:text-slate-400">{prem.label}</div>
                    <div className="text-[10px] text-slate-400 dark:text-slate-500">{prem.sub}</div>
                  </div>
                  <span className="text-[11px] font-medium text-slate-400 dark:text-slate-500 italic">em breve</span>
                </div>
              );
            }
            const realPct = premReal[prem.key];
            const Icon = realPct == null ? null : gapIcon(realPct, prem.pct);
            return (
              <div key={prem.key} className="flex items-center justify-between border-b border-slate-50 dark:border-slate-700/40 pb-2 last:border-0">
                <div>
                  <div className="text-xs font-medium text-slate-700 dark:text-slate-200">{prem.label}</div>
                  <div className="text-[10px] text-slate-400 dark:text-slate-500">{prem.sub}</div>
                </div>
                <div className="text-right tabular-nums">
                  <span className={`text-sm font-bold inline-flex items-center gap-1 justify-end ${realPct == null ? 'text-slate-300 dark:text-slate-600' : gapTone(realPct, prem.pct)}`}>
                    {Icon && <Icon className="w-3.5 h-3.5" />}
                    {realPct == null ? '—' : `${realPct}%`}
                  </span>
                  <span className="text-[11px] text-slate-400 dark:text-slate-500"> / {prem.pct}%</span>
                </div>
              </div>
            );
          })}
        </div>
        <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-3">Reativacao nao e rastreada direto no funil. Churn fora do escopo.</p>
      </div>
    </div>

    {/* Leads por tras do numero da etapa clicada */}
    <FunnelDrillDrawer step={drillStep} range={range} onClose={() => setDrillStep(null)} />
    </>
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
      // Sem toast aqui o checkbox so "voltava sozinho" na revalidacao — parecia
      // um misclick, nao uma falha real de conexao.
      toast.error('Nao foi possivel salvar — tente novamente.');
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

      {/* Funil do mês — vira o topo da página (substitui o hero de mês atual):
          já mostra previsto x real por etapa, reescalado pra bater a meta de
          Clientes Ativos, com o motivo do desvio explicado. */}
      <FunnelCompare real={currentReal} planRow={planRow} range={real.currentMonthRange} />
      <MetaMensalPanel planRow={planRow} currentReal={currentReal} />
      <MrrChart real={real} />
      <MonthlyTable real={real} />
      <PlanChecklist />

      <p className="text-[11px] text-slate-400 dark:text-slate-500 text-center pb-2">
        Real lido dos negocios <strong>ganhos</strong> no CRM (MRR = campo de mensalidade do deal) e do funil de vendas. Clientes fora do CRM nao entram. Premissas a validar nos primeiros 90 dias.
      </p>
    </div>
  );
}
