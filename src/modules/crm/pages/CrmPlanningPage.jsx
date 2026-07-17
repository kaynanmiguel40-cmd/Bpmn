/**
 * CrmPlanningPage — "Planejamento": calculadora de funil, tudo numa página só,
 * sem modal. As ETAPAS são 100% customizáveis — o usuário nomeia e adiciona
 * como quiser. Em CADA etapa dá pra digitar a contagem que já se sabe (ex:
 * 200 leads, 100 qualificados) e/ou, entre etapas, a taxa de conversão — o
 * que não for digitado a gente descobre por propagação (contagem manda mais
 * que taxa: se as 2 contagens vizinhas são conhecidas, a taxa é calculada).
 */

import { useState, useMemo } from 'react';
import { Plus, X, ArrowDown } from 'lucide-react';
import { CrmPageHeader, CrmConfirmDialog } from '../components/ui';
import { resolveFunnelPlan, reconcileFunnel } from '../lib/funnelGoals';
import { getCrmWorkspaceSettings, saveCrmWorkspaceSettings } from '../lib/workspaceSettings';

const DEFAULT_STAGES = ['Leads', 'Qualificados', 'Reunião agendada', 'Reunião realizada', 'Vendas'];

const fmtInt = (v) => new Intl.NumberFormat('pt-BR').format(Math.round(v) || 0);

// Mesmo desenho de funil (trapézio por clip-path) e mesma paleta de marca do
// Funil de Conversão (SalesFunnel/FunnelPrevistoReal) — azul no topo até verde
// no fechamento. Só que aqui o nº de etapas é variável, então em vez de uma
// cor fixa por nome (que não dá, o nome é livre) escolhemos por posição numa
// paleta curada com as MESMAS cores já usadas no resto do app.
const COLOR_STOPS = [
  ['#60a5fa', '#3b82f6'], // azul
  ['#818cf8', '#6366f1'], // indigo
  ['#c084fc', '#a855f7'], // violeta
  ['#fbbf24', '#f59e0b'], // amber
  ['#fb923c', '#ea580c'], // laranja
  ['#34d399', '#10b981'], // verde
];
function stageColor(i, total) {
  if (total <= 1) return COLOR_STOPS[0];
  const pos = Math.round((i / (total - 1)) * (COLOR_STOPS.length - 1));
  return COLOR_STOPS[pos];
}

// Larguras do funil (topo 100%, afunila proporcional à contagem, com piso mínimo).
// Etapas sem contagem resolvida carregam a largura da anterior (só visual).
const TAPER = 13;
const FLOOR = 14;
function computeWidths(counts) {
  const display = [];
  let carry = 0;
  for (const c of counts) {
    if (c != null) carry = c;
    display.push(carry);
  }
  const top = display[0] || 0;
  const out = [];
  let prev = 100;
  display.forEach((c, i) => {
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

function FunnelRow({ name, count, index, total, isFirst, topW, botW, convPct }) {
  const [c1, c2] = stageColor(index, total);
  const clip = clipOf(topW, botW);
  const known = count != null;

  return (
    <div className="relative flex items-stretch h-[60px]">
      {/* Rótulo */}
      <div className="w-[100px] sm:w-36 flex items-center justify-end pr-3 text-right shrink-0">
        <span className="text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-200 truncate" title={name}>
          {name}
        </span>
      </div>

      {/* Fatia do funil (trapézio) */}
      <div className="relative flex-1 min-w-0">
        <div className="absolute inset-0" style={{
          clipPath: clip,
          background: known
            ? `linear-gradient(135deg, ${c1}, ${c2})`
            : 'repeating-linear-gradient(135deg, #cbd5e1 0 6px, #e2e8f0 6px 12px)',
        }} />
        {known && (
          <div className="absolute inset-0" style={{ clipPath: clip, background: 'linear-gradient(to bottom, rgba(255,255,255,0.30), rgba(255,255,255,0) 55%)' }} />
        )}
        <div className="absolute inset-0 flex items-center justify-center">
          <span className={`text-base sm:text-lg font-bold tabular-nums ${known ? 'text-white drop-shadow-[0_1px_2px_rgba(15,23,42,0.4)]' : 'text-slate-400 dark:text-slate-500'}`}>
            {known ? fmtInt(count) : '—'}
          </span>
        </div>
      </div>

      {/* Conversão vinda da etapa de cima */}
      <div className="w-[64px] sm:w-24 flex flex-col justify-center pl-3 shrink-0">
        {isFirst ? (
          <span className="text-[10px] uppercase tracking-wider text-slate-300 dark:text-slate-600 font-semibold">topo do funil</span>
        ) : convPct != null ? (
          <>
            <span className="flex items-center gap-1 text-sm font-bold text-slate-600 dark:text-slate-300 tabular-nums leading-none">
              <ArrowDown size={11} className="text-slate-400 shrink-0" />
              {Math.round(convPct)}%
            </span>
            <span className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5 leading-tight hidden sm:block">converteu da etapa de cima</span>
          </>
        ) : (
          <span className="text-xs text-slate-300 dark:text-slate-600">— sem taxa</span>
        )}
      </div>
    </div>
  );
}

function loadInitialForm() {
  const s = getCrmWorkspaceSettings();
  const stages = Array.isArray(s.funnelPlanStages) && s.funnelPlanStages.length >= 2 ? s.funnelPlanStages : DEFAULT_STAGES;
  const savedCounts = Array.isArray(s.funnelPlanCounts) ? s.funnelPlanCounts : [];
  const savedRates = Array.isArray(s.funnelPlanRates) ? s.funnelPlanRates : [];
  return {
    stages: [...stages],
    counts: stages.map((_, i) => (savedCounts[i] != null ? String(savedCounts[i]) : '')),
    rates: stages.slice(1).map((_, i) => (savedRates[i] != null ? String(savedRates[i]) : '')),
  };
}

function persist(form) {
  const toNullableNumber = (v) => {
    const n = parseFloat(v);
    return Number.isFinite(n) ? n : null;
  };
  saveCrmWorkspaceSettings({
    funnelPlanStages: form.stages,
    funnelPlanCounts: form.counts.map(toNullableNumber),
    funnelPlanRates: form.rates.map(toNullableNumber),
  });
}

export function CrmPlanningPage() {
  const [form, setForm] = useState(loadInitialForm);
  const [removeIndex, setRemoveIndex] = useState(null); // etapa aguardando confirmacao de remocao

  const update = (next) => {
    setForm(next);
    persist(next);
  };

  const renameStage = (i, name) => {
    const stages = [...form.stages];
    stages[i] = name;
    update({ ...form, stages });
  };

  // Enquanto digita, so guarda o valor cru: um prefixo ("1" de "100") nao pode
  // passar pelo reconcile, senao o cap de 100% apaga o campo no meio da digitacao.
  const updateCount = (i, value) => {
    const counts = [...form.counts];
    counts[i] = value;
    update({ ...form, counts });
  };

  // So no blur o valor e final — ai sim reconcilia (contagem de baixo manda).
  const commitCounts = () => {
    const reconciled = reconcileFunnel(form.stages, form.counts, form.rates);
    if (reconciled.counts === form.counts && reconciled.rates === form.rates) return;
    update({ ...form, counts: reconciled.counts, rates: reconciled.rates });
  };

  const updateRate = (i, value) => {
    const rates = [...form.rates];
    rates[i] = value;
    update({ ...form, rates });
  };

  const addStage = () => {
    update({
      ...form,
      stages: [...form.stages, 'Nova etapa'],
      counts: [...form.counts, ''],
      rates: [...form.rates, ''],
    });
  };

  const requestRemoveStage = (i) => {
    if (form.stages.length <= 2) return;
    setRemoveIndex(i);
  };

  // Remove de fato so depois da confirmacao — reajusta contagens/taxas
  // downstream e persiste no localStorage, igual toda exclusao no app.
  const confirmRemoveStage = () => {
    const i = removeIndex;
    if (i == null) return;
    const stages = form.stages.filter((_, idx) => idx !== i);
    const counts = form.counts.filter((_, idx) => idx !== i);
    const rates = [...form.rates];
    rates.splice(i === 0 ? 0 : i - 1, 1);
    const reconciled = reconcileFunnel(stages, counts, rates);
    update({ ...form, stages, counts: reconciled.counts, rates: reconciled.rates });
    setRemoveIndex(null);
  };

  const plan = useMemo(() => resolveFunnelPlan({
    stages: form.stages,
    counts: form.counts,
    rates: form.rates,
  }), [form.stages, form.counts, form.rates]);

  const hasAnyData = plan?.counts.some((c) => c != null);
  const widths = plan ? computeWidths(plan.counts) : null;

  return (
    <div className="space-y-6">
      <CrmPageHeader
        title="Planejamento"
        subtitle="Preencha a contagem que você já sabe em qualquer etapa — a gente calcula o resto"
      />

      {/* Sandbox isolado de propósito: essa calculadora não escreve na meta
          oficial (Comparativo) — só no localStorage deste navegador. */}
      <p className="text-xs text-slate-400 dark:text-slate-500 -mt-2">
        Esta calculadora é só sua — não altera a meta oficial do Comparativo.
      </p>

      <div className="grid lg:grid-cols-2 gap-5">
        {/* Controles — tudo inline, sem modal */}
        <div className="crm-glass rounded-2xl p-5 space-y-1">
          {form.stages.map((name, i) => {
            const rawCount = form.counts[i] ?? '';
            const computedCount = plan?.counts[i];
            const countPlaceholder = rawCount === '' && computedCount != null ? String(computedCount) : 'nº';
            const isDerivedRate = plan && plan.rates[i] != null && !plan.rateIsInput[i];
            const isCapped = plan && plan.rateCapped[i];

            return (
              <div key={i}>
                <div className="group flex items-center gap-2">
                  <input
                    value={name}
                    onChange={(e) => renameStage(i, e.target.value)}
                    placeholder={`Etapa ${i + 1}`}
                    className="flex-1 min-w-0 px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-fyness-primary"
                  />
                  <input
                    type="number" min="0" step="1"
                    value={rawCount}
                    onChange={(e) => updateCount(i, e.target.value)}
                    onBlur={commitCounts}
                    placeholder={countPlaceholder}
                    title={`Nº de "${name || `etapa ${i + 1}`}"`}
                    className="w-20 shrink-0 px-2.5 py-2 text-sm rounded-lg border border-fyness-primary/40 bg-fyness-primary/5 dark:bg-fyness-primary/10 text-slate-800 dark:text-slate-200 placeholder-slate-400 text-center focus:outline-none focus:ring-2 focus:ring-fyness-primary"
                  />
                  <button type="button" onClick={() => requestRemoveStage(i)}
                    disabled={form.stages.length <= 2}
                    title="Remover etapa"
                    className="p-2 rounded-lg text-slate-300 dark:text-slate-600 opacity-0 group-hover:opacity-100 hover:!text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20 transition-opacity shrink-0 disabled:hidden">
                    <X size={15} />
                  </button>
                </div>

                {i < form.stages.length - 1 && (
                  <div className="flex items-center gap-2 pl-4 py-1.5">
                    <ArrowDown size={12} className="text-slate-400 shrink-0" />
                    {isDerivedRate ? (
                      <span
                        title={isCapped
                          ? `Essas 2 contagens implicariam mais de 100% de conversão — limitado a 100%`
                          : 'Calculado a partir das contagens das 2 etapas'}
                        className={`w-16 px-2 py-1 text-xs rounded-md border text-center ${
                          isCapped
                            ? 'border-amber-300 dark:border-amber-700 bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400'
                            : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 text-slate-500 dark:text-slate-400'
                        }`}
                      >
                        {plan.rates[i]}%
                      </span>
                    ) : (
                      <input type="number" min="0" max="100" step="0.1" value={form.rates[i] || ''}
                        onChange={(e) => updateRate(i, e.target.value)}
                        placeholder="%"
                        className="w-16 px-2 py-1 text-xs rounded-md border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-fyness-primary" />
                    )}
                    <span className={`text-[11px] ${isCapped ? 'text-amber-600 dark:text-amber-400 font-medium' : 'text-slate-400'}`}>
                      {isCapped ? 'contagens incompatíveis — máx. 100%' : isDerivedRate ? 'calculado das contagens' : 'de conversão'}
                    </span>
                  </div>
                )}
              </div>
            );
          })}

          <button type="button" onClick={addStage}
            className="mt-2 flex items-center gap-1.5 text-xs font-medium text-fyness-primary hover:underline">
            <Plus size={13} /> Adicionar etapa
          </button>
        </div>

        {/* Funil desenhado */}
        <div className="crm-glass rounded-2xl p-5">
          <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 mb-2">Seu funil calculado</h3>
          {!hasAnyData ? (
            <p className="text-sm text-slate-400 dark:text-slate-500 py-8 text-center">
              Preencha a contagem de pelo menos uma etapa (ou uma taxa entre elas) pra ver o funil.
            </p>
          ) : (
            <div>
              {plan.stages.map((name, i) => {
                const isLastStage = i === plan.stages.length - 1;
                const topW = widths[i];
                const botW = isLastStage ? widths[i] * 0.55 : widths[i + 1];
                const convPct = i > 0 ? plan.rates[i - 1] : null;

                return (
                  <FunnelRow
                    key={i}
                    name={name || `Etapa ${i + 1}`}
                    count={plan.counts[i]}
                    index={i}
                    total={plan.stages.length}
                    isFirst={i === 0}
                    topW={topW}
                    botW={botW}
                    convPct={convPct}
                  />
                );
              })}
            </div>
          )}
        </div>
      </div>

      <CrmConfirmDialog
        open={removeIndex != null}
        onClose={() => setRemoveIndex(null)}
        onConfirm={confirmRemoveStage}
        title="Remover etapa"
        message={`Tem certeza que deseja remover "${removeIndex != null ? (form.stages[removeIndex] || `Etapa ${removeIndex + 1}`) : ''}"? Esta ação não pode ser desfeita.`}
        variant="danger"
      />
    </div>
  );
}

export default CrmPlanningPage;
