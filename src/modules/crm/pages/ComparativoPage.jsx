/**
 * Comparativo — Previsto vs Real (plano comercial).
 *
 * Compara, mes a mes, o planejamento estrategico (previsto, cravado do PDF)
 * contra o real do CRM (deals ganhos + funil + trafego). Foco no mes atual, com
 * a curva de MRR rumo a R$100k, funil, conversoes e marketing.
 */

import { useState, useMemo } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import {
  Target, Check, Clock, Users, ArrowDown, Flame, X,
} from 'lucide-react';
import {
  PLAN_MONTHS, PREMISSAS, PLAN_GOAL_MRR, PLAN_POSITION, COMPARECIMENTO_RATE,
  planMonthLabel, planMonthLong,
  proratedPlanForPeriod, unitFunnelSteps,
} from '../../../lib/commercialPlan';
import { getCommercialPlanReal } from '../../../lib/commercialPlanReal';
import {
  PLAN_PHASES, actionId, TOTAL_ACTIONS, getPlanActionsState, setPlanActionDone,
} from '../../../lib/commercialPlanActions';
import { useProfile } from '../../../hooks/useProfile';
import { useTeamMembers } from '../../../hooks/queries';
import { FunnelPrevistoReal } from '../components/FunnelPrevistoReal';
import { TeamDailyBriefing } from '../components/agenda/TeamDailyBriefing';
import { TeamActivitiesTable } from '../components/agenda/TeamActivitiesTable';
import { useFunnelStageDeals, useSalesFunnel, useSalesCycle, useDailyScoreboard } from '../hooks/useCrmQueries';
import { toast } from '../../../contexts/ToastContext';

const fmtBRL = (v) => 'R$ ' + Math.round(v || 0).toLocaleString('pt-BR');
const fmtK = (v) => 'R$' + Math.round((v || 0) / 1000) + 'k';

function gapTone(real, prev) {
  if (real == null) return 'text-slate-500 dark:text-slate-400';
  if (real >= prev) return 'text-emerald-600 dark:text-emerald-400';
  if (real >= prev * 0.7) return 'text-amber-600 dark:text-amber-400';
  return 'text-rose-600 dark:text-rose-400';
}

// Cor da barra da taxa de conversao (bg, nao text): verde = bateu a meta,
// amarelo = quase la (>=70% da meta), vermelho = longe, cinza = sem dado.
function barTone(real, meta) {
  if (real == null) return 'bg-slate-300 dark:bg-slate-600';
  if (real >= meta) return 'bg-emerald-500';
  if (real >= meta * 0.7) return 'bg-amber-500';
  return 'bg-rose-500';
}

// ---------- Acompanhamento da meta do mes (diario / semanal) ----------

function MetaMiniCard({ label, hint, children }) {
  return (
    <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/60 p-4">
      <div className="text-[12px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">{label}</div>
      <div className="mt-1.5">{children}</div>
      {hint && <div className="text-[12px] text-slate-500 dark:text-slate-400 mt-1">{hint}</div>}
    </div>
  );
}

function MetaMensalPanel({ planRow, currentReal }) {
  // So clientes ativos — sem alternancia com MRR. O ALVO acumulado do mes e
  // FIXO (nao muda); quem anda e o Real (quantos ja sao) e, por consequencia,
  // o "faltam". O "faltam" e progresso rumo ao alvo, nao o alvo.
  const alvo = planRow.ativos || 0;                  // alvo cumulativo de clientes ativos
  const realHoje = currentReal?.clientesAccum ?? 0;  // quantos ja sao
  const necessario = Math.max(0, alvo - realHoje);
  const unitNec = Math.round(necessario) === 1 ? 'cliente este mês' : 'clientes este mês';
  const pct = alvo > 0 ? Math.min(100, Math.round((realHoje / alvo) * 100)) : 0;

  return (
    <section className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/60 p-5">
      <div className="flex items-center gap-2 mb-4">
        <Flame className="w-4 h-4 text-fyness-primary" />
        <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100">Alvo do mês · {planMonthLong(planRow.m)}</h3>
      </div>

      <MetaMiniCard
        label="Faltam pro alvo do mês"
        hint={`alvo: ${Math.round(alvo)} clientes ativos · ${Math.round(realHoje)} hoje`}>
        <span className="text-2xl font-bold text-slate-900 dark:text-white">{Math.round(necessario)}</span>
        <span className="text-xs text-slate-500 dark:text-slate-400 ml-1">{unitNec}</span>
        {/* Barra de progresso real rumo ao alvo fixo */}
        <div className="mt-2.5 h-1.5 rounded-full bg-slate-100 dark:bg-slate-700 overflow-hidden">
          <div className="h-full rounded-full bg-fyness-primary transition-all" style={{ width: `${pct}%` }} />
        </div>
      </MetaMiniCard>
    </section>
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
            <tr className="text-[12px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 border-b border-slate-100 dark:border-slate-700/60">
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
                    <span className="text-slate-500 dark:text-slate-400"> · M{p.m}</span>
                    {r?.partial && <span className="ml-1 text-[11px] text-amber-500">em curso</span>}
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
 * Painel lateral com uma lista de negócios. Usado tanto pelo drill-down do funil
 * quanto pelo ritmo diário (leads de um dia). Só apresentação — quem busca os
 * dados é quem chama.
 */
function DealsDrawer({ title, subtitle, deals = [], isLoading, onClose }) {
  const navigate = useNavigate();
  return (
    <div className="fixed inset-0 z-50 flex justify-end" role="dialog" aria-modal="true">
      <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={onClose} />
      <aside className="relative w-full sm:max-w-[420px] h-full bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-700 shadow-2xl flex flex-col">
        <div className="flex items-start justify-between gap-2 p-4 border-b border-slate-200 dark:border-slate-700">
          <div className="min-w-0">
            <h3 className="text-base font-bold text-slate-800 dark:text-white truncate">{title}</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">{subtitle}</p>
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
            <p className="text-sm text-slate-500 dark:text-slate-400 text-center py-10">Nenhum lead aqui.</p>
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
                  <div className="flex items-center gap-2 mt-1 text-[12px] text-slate-500 dark:text-slate-400">
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

/**
 * Drill-down do funil: os leads por trás do número de uma etapa. Mostra a MESMA
 * coorte que o funil conta (negócios criados no mês que ALCANÇARAM a etapa) —
 * por isso a lista sempre casa com o número exibido.
 */
function FunnelDrillDrawer({ step, range, ownerId, onClose }) {
  const { data: deals = [], isLoading } = useFunnelStageDeals(range, 'sales', step?.key, ownerId);
  if (!step) return null;
  const total = deals.reduce((s, d) => s + (d.value || 0), 0);
  return (
    <DealsDrawer
      title={step.label}
      subtitle={`${deals.length} ${deals.length === 1 ? 'lead' : 'leads'}${total > 0 ? ` · ${fmtBRL(total)}` : ''}`}
      deals={deals}
      isLoading={isLoading}
      onClose={onClose}
    />
  );
}

// ---------- Funil unitario (o que custa 1 venda) ----------
/**
 * Cascata reversa: quantos leads o topo precisa entregar pra sair 1 venda.
 *
 * Mesmas taxas do plano (FUNIL_UNITARIO_RATES alimenta PREMISSAS e os volumes de
 * PLAN_MONTHS), entao este card e a leitura unitaria do card ao lado — nao uma
 * segunda visao concorrente.
 */
function FunilUnitario() {
  const steps = unitFunnelSteps(1);
  // Tudo inteiro e pra CIMA: nao existe 3,3 reuniao nem 27,8 lead. Cada etapa e
  // um MINIMO — arredondar pra baixo em qualquer uma nao entrega a venda.
  const fmtQtd = n => Math.ceil(n);

  return (
    <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/60 p-5">
      <div className="flex items-start justify-between gap-3 mb-1">
        <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100">O que custa 1 venda</h3>
      </div>
      <p className="text-[12px] text-slate-500 dark:text-slate-400 mb-3">
        Minimo por etapa, de tras pra frente, a partir de 1 cliente fechado.
      </p>

      <div className="space-y-1">
        {steps.map((s, i) => (
          <div key={s.key}>
            <div className={`flex items-center justify-between rounded-lg px-2.5 py-2 ${
              s.key === 'venda'
                ? 'bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-100 dark:border-emerald-500/20'
                : 'bg-slate-50 dark:bg-slate-800/60'
            }`}>
              <div className="min-w-0">
                <div className={`text-xs font-medium ${s.key === 'venda' ? 'text-emerald-700 dark:text-emerald-400' : 'text-slate-700 dark:text-slate-200'}`}>
                  {s.label}
                </div>
                <div className="text-[12px] text-slate-500 dark:text-slate-400">{s.sub}</div>
              </div>
              <span className={`text-sm font-bold tabular-nums shrink-0 ${s.key === 'venda' ? 'text-emerald-700 dark:text-emerald-400' : 'text-slate-800 dark:text-slate-100'}`}>
                {fmtQtd(s.qtd)}
              </span>
            </div>
            {/* Taxa que leva pra proxima etapa (a ultima nao tem proxima). */}
            {i < steps.length - 1 && (
              <div className="flex items-center gap-1.5 pl-2.5 py-0.5 text-[12px] text-slate-500 dark:text-slate-400">
                <ArrowDown className="w-3 h-3 shrink-0" />
                <span className="tabular-nums font-medium">{Math.round(s.pct * 100)}%</span>
              </div>
            )}
          </div>
        ))}
      </div>

      <p className="text-[12px] text-slate-500 dark:text-slate-400 mt-3">
        Taxas proprias — o plano do card ao lado segue com as premissas originais.
      </p>
    </div>
  );
}

function FunnelCompare({ period, ownerId, setOwnerId, vendedores = [] }) {
  const [drillStep, setDrillStep] = useState(null); // { key, label } — etapa clicada
  // O filtro de vendedor (ownerId) sobe pra pagina e vale pro lado REAL do funil,
  // pras Taxas de conversao aqui, e pro placar do Time. So o PREVISTO/meta fica
  // do time — a meta de volume nao se divide por pessoa.

  // REAL do periodo, filtrado pelo vendedor (ownerId; "Todos" = time todo).
  // Alimenta o lado REAL do funil E as taxas. O previsto vem do plano (prev).
  const { data: f } = useSalesFunnel(period?.range, 'sales', ownerId);
  // PREVISTO prorrateado pelos dias uteis do periodo (soma a fatia de cada mes).
  const prev = useMemo(
    () => proratedPlanForPeriod(period?.start, period?.end),
    [period?.start, period?.end],
  );

  const pctOf = (a, b) => (b > 0 ? Math.round((a / b) * 100) : 0);
  // Sem estagio de "reuniao realizada" na pipeline, acontecidas cai pros ganhos:
  // as duas taxas que dependem dela virariam tautologia (fechamento = 100% fixo).
  // Nesse caso ficam indisponiveis (null -> "—") em vez de mostrar numero falso.
  // Real filtrado pelo vendedor (f); o previsto/meta vem do plano.
  const heldTracked = !!f?.meetingHeldTracked;
  const premReal = {
    qualif: pctOf(f?.qualified || 0, f?.lead || 0),
    agendamento: pctOf(f?.meeting || 0, f?.qualified || 0),      // qualificado -> agendada
    comparecimento: heldTracked ? pctOf(f?.meetingHeld || 0, f?.meeting || 0) : null,  // agendada -> acontecida
    fechamento: heldTracked ? pctOf(f?.closing || 0, f?.meetingHeld || 0) : null,      // acontecida -> cliente
    reativacao: null, // nao rastreado direto
  };

  return (
    <>
    <div className="grid md:grid-cols-2 gap-4">
      {/* Funil Previsto × Real do PERIODO. O Previsto vem do plano comercial
          prorrateado pelos dias uteis do recorte (nao reescala com o real: meta
          e linha de base, so o lado Real anda). Reunião vira 2 etapas: AGENDADAS
          (plano = reun) e ACONTECIDAS (previsto = reun × comparecimento). */}
      <FunnelPrevistoReal
        previsto={{
          lead: Math.round(prev.leads),
          qualified: Math.round(prev.qualif),
          meetingScheduled: Math.round(prev.reun),
          meetingHeld: Math.round(prev.reun * COMPARECIMENTO_RATE),
          closing: Math.round(prev.fech),
        }}
        real={{
          lead: f?.lead,
          qualified: f?.qualified,
          meetingScheduled: f?.meeting,
          meetingHeld: f?.meetingHeld,
          closing: f?.closing,
        }}
        monthLabel={period?.label}
        subtitle={period ? `${prev.businessDays} ${prev.businessDays === 1 ? 'dia util' : 'dias uteis'} · meta do plano prorrateada` : null}
        onStepClick={period ? (key, label) => setDrillStep({ key, label }) : undefined}
      />

      {/* Taxas de conversao — grafico idiota-proof: barra = real, risco preto =
          meta do plano. Barra passou do risco = bateu (verde). Substituiu a
          antiga lista de texto "Conversoes". */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/60 p-5">
        <div className="flex items-start justify-between gap-2">
          <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100">Taxas de conversão</h3>
          {/* Filtro de vendedor — so afeta as taxas (o funil de volume fica do time). */}
          <select
            value={ownerId || ''}
            onChange={e => setOwnerId(e.target.value || null)}
            title="Ver as taxas de um vendedor ou do time todo"
            className="shrink-0 text-[12px] font-medium rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 px-2 py-1 focus:outline-none focus:ring-2 focus:ring-fyness-primary"
          >
            <option value="">Todos</option>
            {vendedores.map(m => (
              <option key={m.id} value={m.authUserId}>{m.name}</option>
            ))}
          </select>
        </div>
        <p className="text-[12px] text-slate-500 dark:text-slate-400 mb-4">
          Quanto de cada etapa passou pra próxima. O <strong>risco preto</strong> é a meta — a barra passou dele = você bateu.
        </p>
        <div className="space-y-4">
          {PREMISSAS.filter(prem => prem.key !== 'reativacao').map(prem => {
            const real = premReal[prem.key]; // 0-100, ou null quando ainda nao da pra medir
            const meta = prem.pct;           // 0-100 (plano)
            const bateu = real != null && real >= meta;
            return (
              <div key={prem.key}>
                <div className="flex items-baseline justify-between gap-2 mb-1.5">
                  <div className="min-w-0">
                    <span className="text-xs font-semibold text-slate-700 dark:text-slate-200">{prem.label}</span>
                    <span className="text-[12px] text-slate-500 dark:text-slate-400 ml-1.5">{prem.sub}</span>
                  </div>
                  <div className="text-right shrink-0 tabular-nums leading-tight">
                    {real == null ? (
                      <span className="text-[12px] text-slate-400 dark:text-slate-500 italic">sem dados ainda</span>
                    ) : (
                      <span className={`text-sm font-bold inline-flex items-center gap-1 justify-end ${gapTone(real, meta)}`}>
                        {bateu && <Check className="w-3.5 h-3.5" />}
                        {real}%
                      </span>
                    )}
                    <span className="block text-[11px] text-slate-400 dark:text-slate-500">meta {meta}%</span>
                  </div>
                </div>
                {/* Trilho: preenchimento = real; risco vertical = meta do plano */}
                <div className="relative h-3.5 rounded-full bg-slate-100 dark:bg-slate-700/60 overflow-hidden">
                  {real != null && (
                    <div className={`absolute inset-y-0 left-0 rounded-full transition-all duration-500 ${barTone(real, meta)}`}
                      style={{ width: `${Math.min(100, real)}%` }} />
                  )}
                  <div className="absolute inset-y-0 w-[3px] rounded bg-slate-900/70 dark:bg-white/80"
                    style={{ left: `calc(${Math.min(100, meta)}% - 1.5px)` }} title={`meta ${meta}%`} />
                </div>
              </div>
            );
          })}
        </div>
        <p className="text-[12px] text-slate-500 dark:text-slate-400 mt-4">
          Comparecimento e fechamento só entram quando o funil marca que a reunião aconteceu. Reativação e churn ficam fora.
        </p>
      </div>

      {/* Funil unitario: nao depende do periodo nem do real — e o custo teorico
          de 1 venda com as taxas conservadoras. */}
      <FunilUnitario />
    </div>

    {/* Leads por tras do numero da etapa clicada (mesmo recorte do funil) */}
    <FunnelDrillDrawer step={drillStep} range={period?.range} ownerId={ownerId} onClose={() => setDrillStep(null)} />
    </>
  );
}

// ---------- Helpers de data (periodo de analise) ----------

const pad2 = (n) => String(n).padStart(2, '0');
const toDateKey = (d) => `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
const parseDateKey = (s) => {
  if (!s) return null;
  const [y, m, d] = s.split('-').map(Number);
  if (!y || !m || !d) return null;
  return new Date(y, m - 1, d);
};

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
          <p className="text-[12px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">{phase.tag}</p>
        </div>
        <span className={`shrink-0 text-[12px] font-bold px-2 py-0.5 rounded-full ${allDone ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' : 'bg-slate-100 text-slate-500 dark:bg-slate-700 dark:text-slate-400'}`}>{done}/{total}</span>
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
              <span className={`text-xs leading-snug ${isDone ? 'line-through text-slate-500 dark:text-slate-400' : 'text-slate-700 dark:text-slate-200'}`}>{text}</span>
            </button>
          );
        })}
      </div>

      <div className={`mt-2.5 rounded-lg px-3 py-2 text-[12px] ${allDone ? 'bg-emerald-50 dark:bg-emerald-900/15' : 'bg-slate-50 dark:bg-slate-900/40'}`}>
        <span className="font-semibold uppercase tracking-wider text-[11px] text-slate-500 dark:text-slate-400">{phase.saidaLabel}</span>
        <p className="text-slate-600 dark:text-slate-300 mt-0.5 leading-snug">{phase.saida}</p>
      </div>

      {ws.length > 0 && (
        <div className="mt-2">
          <button type="button" onClick={() => setShowW(v => !v)} className="text-[12px] font-semibold text-fyness-primary hover:underline">
            {showW ? 'Ocultar 5W1H' : 'Ver 5W1H'}
          </button>
          {showW && (
            <dl className="mt-1.5 space-y-1.5">
              {ws.map(([k, v]) => (
                <div key={k}>
                  <dt className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">{k}</dt>
                  <dd className="text-[12px] text-slate-600 dark:text-slate-300 leading-snug">{v}</dd>
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
          <p className="text-[12px] text-slate-500 dark:text-slate-400">5 fases (5W1H) · marque o que ja foi feito</p>
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

// ---------- Ciclo de vendas · tempo medio por etapa ----------
function SalesCycleChart() {
  const { data, isLoading } = useSalesCycle('sales');
  const stages = data?.stages || [];
  const maxDays = stages.reduce((m, s) => Math.max(m, s.avgDays), 0);
  // Etapa mais lenta = gargalo de tempo (so destaca se houver mais de uma).
  const slowest = stages.length > 1
    ? stages.reduce((mx, s) => (!mx || s.avgDays > mx.avgDays ? s : mx), null)
    : null;

  const fmtDays = (d) => {
    if (d == null) return '—';
    if (d < 1) return '< 1 dia';
    const n = Math.round(d);
    return `${n} ${n === 1 ? 'dia' : 'dias'}`;
  };

  return (
    <section className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/60 p-5">
      <div className="flex items-center gap-2 mb-1">
        <Clock className="w-4 h-4 text-fyness-primary" />
        <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100">Ciclo de vendas · tempo por etapa</h3>
      </div>
      <p className="text-[12px] text-slate-500 dark:text-slate-400 mb-4">
        Quanto tempo um negócio fica parado em cada etapa antes de avançar. Barra maior = trava mais.
      </p>

      {isLoading ? (
        <div className="flex items-center justify-center py-8">
          <div className="w-5 h-5 border-2 border-fyness-primary border-t-transparent rounded-full animate-spin" />
        </div>
      ) : stages.length === 0 ? (
        <p className="text-xs text-slate-500 dark:text-slate-400 text-center py-6">
          Ainda não há histórico suficiente pra medir o ciclo. Conforme os negócios avançam de etapa, o tempo aparece aqui.
        </p>
      ) : (
        <div className="space-y-3.5">
          {stages.map(s => {
            const isSlow = slowest && s.stageId === slowest.stageId;
            const w = maxDays > 0 ? Math.max(4, Math.round((s.avgDays / maxDays) * 100)) : 0;
            return (
              <div key={s.stageId}>
                <div className="flex items-baseline justify-between gap-2 mb-1">
                  <span className="text-xs font-semibold text-slate-700 dark:text-slate-200 truncate">{s.name}</span>
                  <span className="shrink-0 tabular-nums">
                    <span className={`text-sm font-bold ${isSlow ? 'text-rose-600 dark:text-rose-400' : 'text-slate-800 dark:text-slate-100'}`}>{fmtDays(s.avgDays)}</span>
                    <span className="text-[11px] text-slate-400 dark:text-slate-500 ml-1" title={`baseado em ${s.sample} ${s.sample === 1 ? 'negócio' : 'negócios'}`}>({s.sample})</span>
                  </span>
                </div>
                <div className="h-3.5 rounded-full bg-slate-100 dark:bg-slate-700/60 overflow-hidden">
                  <div className={`h-full rounded-full transition-all duration-500 ${isSlow ? 'bg-rose-500' : 'bg-fyness-primary'}`} style={{ width: `${w}%` }} />
                </div>
                {isSlow && <div className="mt-1 text-[11px] font-medium text-rose-500">é aqui que mais trava</div>}
              </div>
            );
          })}
        </div>
      )}

      {data?.overallDays != null && (
        <p className="text-[12px] text-slate-500 dark:text-slate-400 mt-4">
          Do primeiro contato ao fechado: <strong className="text-slate-700 dark:text-slate-200">{fmtDays(data.overallDays)}</strong> em média.
        </p>
      )}
    </section>
  );
}

// ---------- Peso do time por etapa (quem carrega o que) ----------
const PESO_ETAPAS = [
  { key: 'calls', label: 'Ligações' },
  { key: 'messages', label: 'Mensagens' },
  { key: 'meetings', label: 'Reuniões' },
  { key: 'contracts', label: 'Fechamentos' },
];

/**
 * Peso por etapa: a divisao de trabalho do time. Pra cada etapa (ligacoes,
 * mensagens, reunioes, fechamentos), uma barra empilhada = 100% do time,
 * segmentada por pessoa (cor do membro). Mostra quem CARREGA cada degrau —
 * "Kaynan gerou 90% das reunioes, Lorena fechou 100%".
 *
 * Sempre do TIME TODO (ownerId null) — o peso e sobre a divisao entre todos,
 * independente do filtro de vendedor la de cima. Fechamento e atribuido ao dono
 * do negocio (closer); reuniao/ligacao/mensagem a quem fez.
 */
function PesoPorEtapa({ range }) {
  const { data, isLoading } = useDailyScoreboard(range?.start || null, range?.end || null, null);
  const sellers = (data?.sellers || []).filter(s => s.name && s.name !== 'Sem dono');

  return (
    <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/60 p-5">
      <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100">Peso por etapa · quem carrega o quê</h3>
      <p className="text-[12px] text-slate-500 dark:text-slate-400 mb-4">
        Quanto cada pessoa fez de cada etapa no período. A barra cheia = 100% do time.
      </p>

      {isLoading ? (
        <div className="flex items-center justify-center py-8">
          <div className="w-5 h-5 border-2 border-fyness-primary border-t-transparent rounded-full animate-spin" />
        </div>
      ) : sellers.length === 0 ? (
        <p className="text-xs text-slate-500 dark:text-slate-400 text-center py-6">Sem atividade no período pra dividir.</p>
      ) : (
        <>
          {/* Legenda de pessoas */}
          <div className="flex flex-wrap gap-x-4 gap-y-1.5 mb-4">
            {sellers.map(s => (
              <span key={s.uid} className="inline-flex items-center gap-1.5 text-[12px] text-slate-600 dark:text-slate-300">
                <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: s.color }} />
                {s.name.split(' ')[0]}
              </span>
            ))}
          </div>

          <div className="space-y-3.5">
            {PESO_ETAPAS.map(etapa => {
              const total = sellers.reduce((sum, s) => sum + (s[etapa.key] || 0), 0);
              return (
                <div key={etapa.key}>
                  <div className="flex items-baseline justify-between mb-1">
                    <span className="text-xs font-semibold text-slate-700 dark:text-slate-200">{etapa.label}</span>
                    <span className="text-[11px] text-slate-400 dark:text-slate-500 tabular-nums">{total} no total</span>
                  </div>
                  <div className="flex h-4 rounded-full overflow-hidden bg-slate-100 dark:bg-slate-700/60">
                    {total === 0 ? (
                      <div className="flex-1 flex items-center justify-center text-[10px] text-slate-400 dark:text-slate-500">sem dados</div>
                    ) : (
                      sellers.filter(s => (s[etapa.key] || 0) > 0).map(s => {
                        const pct = (s[etapa.key] / total) * 100;
                        return (
                          <div
                            key={s.uid}
                            className="h-full flex items-center justify-center text-[10px] font-bold text-white overflow-hidden transition-all duration-500"
                            style={{ width: `${pct}%`, background: s.color }}
                            title={`${s.name}: ${s[etapa.key]} (${Math.round(pct)}%)`}
                          >
                            {pct >= 14 ? `${Math.round(pct)}%` : ''}
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}

export default function ComparativoPage() {
  const { data: real, isLoading } = useQuery({
    queryKey: ['commercialPlanReal'],
    queryFn: getCommercialPlanReal,
    staleTime: 60_000,
  });

  // Periodo de analise — controla o FUNIL e o RITMO DIARIO. Default: 1o do mes
  // corrente ate hoje. (Meta/MRR/tabela seguem o mes do plano: sao a curva.)
  const [periodStart, setPeriodStart] = useState(() => {
    const t = new Date();
    return toDateKey(new Date(t.getFullYear(), t.getMonth(), 1));
  });
  const [periodEnd, setPeriodEnd] = useState(() => toDateKey(new Date()));

  // Filtro de vendedor (null = time todo), COMPARTILHADO entre as Taxas de
  // conversao e o placar do Time — por isso vive aqui na pagina. Hooks antes do
  // early return de loading (regras dos hooks).
  const [ownerId, setOwnerId] = useState(null);
  const { data: members = [] } = useTeamMembers();

  const period = useMemo(() => {
    const s = parseDateKey(periodStart);
    const e = parseDateKey(periodEnd);
    if (!s || !e || e < s) return null;
    return {
      start: s,
      end: e,
      range: {
        start: new Date(s.getFullYear(), s.getMonth(), s.getDate(), 0, 0, 0, 0).toISOString(),
        end: new Date(e.getFullYear(), e.getMonth(), e.getDate(), 23, 59, 59, 999).toISOString(),
      },
      label: `${pad2(s.getDate())}/${pad2(s.getMonth() + 1)} – ${pad2(e.getDate())}/${pad2(e.getMonth() + 1)}`,
    };
  }, [periodStart, periodEnd]);

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
  const vendedores = members.filter(m => m.authUserId);
  const ownerName = ownerId ? (vendedores.find(m => m.authUserId === ownerId)?.name || null) : null;

  return (
    <div className="max-w-7xl mx-auto space-y-5">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 text-fyness-primary mb-1">
            <Target className="w-5 h-5" />
            <span className="text-[12px] font-semibold uppercase tracking-wider">Plano comercial</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Comparativo</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">Previsto vs Real · meta de {fmtK(PLAN_GOAL_MRR)} de MRR em 12 meses · M1 = junho/2026</p>
        </div>
        <div className="flex gap-2">
          <div className="rounded-xl border border-slate-200 dark:border-slate-700 px-4 py-2 bg-white dark:bg-slate-800/60">
            <div className="text-[12px] uppercase tracking-wider text-slate-500 dark:text-slate-400">Partida</div>
            <div className="text-sm font-bold text-slate-800 dark:text-slate-100">{fmtBRL(PLAN_POSITION.mrr)} · {PLAN_POSITION.clientes} clientes</div>
          </div>
          <div className="rounded-xl border border-fyness-primary/30 px-4 py-2 bg-fyness-primary/[0.06]">
            <div className="text-[12px] uppercase tracking-wider text-fyness-primary">Meta 12m</div>
            <div className="text-sm font-bold text-fyness-primary">{fmtK(PLAN_GOAL_MRR)} MRR</div>
          </div>
        </div>
      </div>

      {/* Funil do mês — vira o topo da página (substitui o hero de mês atual):
          já mostra previsto x real por etapa, reescalado pra bater a meta de
          Clientes Ativos, com o motivo do desvio explicado. */}
      {/* Periodo de analise — vale pro funil e pro ritmo diario */}
      <div className="flex flex-wrap items-end justify-between gap-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/60 px-4 py-3">
        <div>
          <div className="text-[12px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Periodo de analise</div>
          <div className="text-sm font-semibold text-slate-700 dark:text-slate-200">
            {period ? period.label : 'periodo invalido — o fim precisa ser depois do inicio'}
          </div>
          <div className="text-[12px] text-slate-500 dark:text-slate-400">vale pro funil e pro ritmo diario</div>
        </div>
        <div className="flex items-end gap-2">
          <label className="flex flex-col gap-0.5">
            <span className="text-[12px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Inicio</span>
            <input type="date" value={periodStart} onChange={e => setPeriodStart(e.target.value)}
              className="px-2 py-1 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-fyness-primary" />
          </label>
          <label className="flex flex-col gap-0.5">
            <span className="text-[12px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Fim</span>
            <input type="date" value={periodEnd} onChange={e => setPeriodEnd(e.target.value)}
              className="px-2 py-1 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-fyness-primary" />
          </label>
        </div>
      </div>

      <FunnelCompare period={period} ownerId={ownerId} setOwnerId={setOwnerId} vendedores={vendedores} />

      {/* Time · performance — SUBIU pra logo abaixo do funil/taxas: o filtro de
          vendedor (no card de Taxas) vale tambem pro placar aqui — ligacoes,
          mensagens, reunioes, contratos. O Ciclo de vendas DESCEU pra baixo. */}
      <div className="flex items-center gap-2 pt-1">
        <Users className="w-5 h-5 text-fyness-primary" />
        <h2 className="text-lg font-bold text-slate-900 dark:text-white">Time · performance</h2>
      </div>
      <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/60 p-5">
        <TeamDailyBriefing range={period?.range} periodLabel={period?.label} ownerId={ownerId} ownerName={ownerName} />
      </div>
      <PesoPorEtapa range={period?.range} />
      <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/60 p-5">
        <TeamActivitiesTable range={period?.range} />
      </div>

      <SalesCycleChart />

      <MetaMensalPanel planRow={planRow} currentReal={currentReal} />
      <MonthlyTable real={real} />
      <PlanChecklist />

      <p className="text-[12px] text-slate-500 dark:text-slate-400 text-center pb-2">
        Real lido dos negocios <strong>ganhos</strong> no CRM (MRR = campo de mensalidade do deal) e do funil de vendas. Clientes fora do CRM nao entram. Premissas a validar nos primeiros 90 dias.
      </p>
    </div>
  );
}
