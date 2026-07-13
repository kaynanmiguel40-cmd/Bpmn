/**
 * FunnelPrevistoReal — funil comparativo LADO A LADO: Meta Prevista × Real.
 * A Prevista é a META do plano comercial — vem PRONTA (via prop `previsto`,
 * já nas 4 categorias fixas lead/qualified/meeting/closing) do plano cravado
 * do Comparativo (a mesma fonte que já alimenta o resto da página: hero,
 * tabela mês a mês etc). Não é o funil livre de /crm/planejamento — aqui não
 * tem etapa customizável, é a meta.
 *
 * Uma etapa = uma linha, com as duas fatias de funil lado a lado — sem
 * duplicar rótulo/ícone (aparecem uma vez por linha).
 *
 * Embaixo do funil, um selo tipo "no ritmo / abaixo do ritmo" (igual o do
 * hero do mês, lá em cima do Comparativo) EXPLICA o motivo do desvio — qual
 * conversão caiu — e reajusta o previsto: mantendo a MESMA meta final de
 * vendas, recalcula quanto é preciso lá em cima (Leads) dado como a taxa
 * real de conversão está se comportando.
 */

import { useMemo } from 'react';
import {
  UserPlus, BadgeCheck, CalendarCheck, Crown, ArrowRight, TrendingUp, TrendingDown, Gauge,
} from 'lucide-react';
import { stageProgress, reajustarFunnelComReal } from '../lib/funnelGoals';

const fmtInt = (v) => new Intl.NumberFormat('pt-BR').format(Math.round(v) || 0);
const fmtPct = (v) => `${Math.round(v * 100)}%`;

const STEP_META = {
  lead:      { label: 'Leads',        icon: UserPlus,      from: '#60a5fa', to: '#3b82f6' },
  qualified: { label: 'Qualificados', icon: BadgeCheck,    from: '#818cf8', to: '#6366f1' },
  meeting:   { label: 'Reuniões',     icon: CalendarCheck, from: '#fbbf24', to: '#f59e0b' },
  closing:   { label: 'Fechamentos',  icon: Crown,         from: '#34d399', to: '#10b981' },
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
  if (hit) return { text: 'text-emerald-600 dark:text-emerald-400', Icon: TrendingUp };
  if (percent >= 70) return { text: 'text-blue-600 dark:text-blue-400', Icon: Gauge };
  if (percent >= 40) return { text: 'text-amber-600 dark:text-amber-400', Icon: TrendingDown };
  return { text: 'text-rose-600 dark:text-rose-400', Icon: TrendingDown };
}

// Abaixo disso, 1 ou 2 leads reais (ou nenhum) não são amostra suficiente
// pra acusar um "gargalo" de conversão — vira ruído (ex: 1 lead real, 0
// qualificados = "0% de conversão", que nem é uma taxa, é sorte de amostra).
const MIN_SAMPLE_FOR_BOTTLENECK = 5;

/**
 * Acha a transição (etapa -> próxima) onde a conversão REAL mais se desviou
 * da PREVISTA — é o gargalo que explica por que o funil precisa reajustar.
 * Só considera transições com amostra real mínima (contagem real da etapa
 * de cima >= MIN_SAMPLE_FOR_BOTTLENECK). ratio < 1 = convertendo pior que o
 * previsto.
 */
function worstLeg(previstoCounts, realCounts) {
  let worst = null;
  for (let i = 0; i < previstoCounts.length - 1; i++) {
    if (!(realCounts[i] >= MIN_SAMPLE_FOR_BOTTLENECK)) continue;
    const plannedRate = previstoCounts[i] > 0 ? previstoCounts[i + 1] / previstoCounts[i] : null;
    if (!(plannedRate > 0)) continue;
    const realRate = realCounts[i + 1] / realCounts[i];
    const ratio = realRate / plannedRate;
    if (!worst || ratio < worst.ratio) worst = { i, realRate, plannedRate, ratio };
  }
  return worst;
}

function ComparativoRow({ stepKey, previstoCount, realCount, goal, pTopW, pBotW, rTopW, rBotW }) {
  const meta = STEP_META[stepKey];
  const Icon = meta.icon;
  const pClip = clipOf(pTopW, pBotW);
  const rClip = clipOf(rTopW, rBotW);
  const tone = goal ? goalTone(goal.percent, goal.hit) : null;
  const StatusIcon = tone?.Icon;

  return (
    <div className="flex items-stretch h-[54px]">
      {/* Rótulo — uma vez só por linha */}
      <div className="w-[84px] sm:w-28 flex items-center justify-end gap-1.5 pr-2.5 text-right shrink-0">
        <span className="text-[11px] sm:text-xs font-semibold text-slate-600 dark:text-slate-300 truncate">{meta.label}</span>
        <span className="w-6 h-6 rounded-md hidden sm:flex items-center justify-center shrink-0 text-white"
          style={{ background: `linear-gradient(135deg, ${meta.from}, ${meta.to})` }}>
          <Icon size={12} />
        </span>
      </div>

      {/* Meta Prevista — fatia à esquerda */}
      <div className="relative flex-1 min-w-0">
        <div className="absolute inset-0 transition-all duration-500"
          style={{ clipPath: pClip, background: `linear-gradient(135deg, ${meta.from}, ${meta.to})`, opacity: 0.45 }} />
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-xs sm:text-sm font-bold text-white tabular-nums drop-shadow-[0_1px_2px_rgba(15,23,42,0.4)]">{fmtInt(previstoCount)}</span>
        </div>
      </div>

      {/* % do previsto alcançado nessa etapa — status, não delta calculado */}
      <div className="w-[46px] sm:w-[54px] shrink-0 flex flex-col items-center justify-center gap-0.5">
        {goal ? (
          <span className={`text-[10px] font-bold tabular-nums inline-flex items-center gap-0.5 ${tone.text}`}>
            {StatusIcon && <StatusIcon size={10} />}
            {goal.percent}%
          </span>
        ) : (
          <ArrowRight size={11} className="text-slate-300 dark:text-slate-600" />
        )}
      </div>

      {/* Real — dados medidos de verdade no CRM */}
      <div className="relative flex-1 min-w-0">
        <div className="absolute inset-0 transition-all duration-500"
          style={{ clipPath: rClip, background: `linear-gradient(135deg, ${meta.from}, ${meta.to})` }} />
        <div className="absolute inset-0 transition-all duration-500"
          style={{ clipPath: rClip, background: 'linear-gradient(to bottom, rgba(255,255,255,0.30), rgba(255,255,255,0) 55%)' }} />
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-sm sm:text-base font-bold text-white tabular-nums drop-shadow-[0_1px_2px_rgba(15,23,42,0.4)]">{fmtInt(realCount)}</span>
        </div>
      </div>
    </div>
  );
}

export function FunnelPrevistoReal({ previsto, real, monthLabel, metaAtivosNota }) {
  const previstoCounts = ORDER.map(k => Number(previsto?.[k]) || 0);
  const realCounts = ORDER.map(k => Number(real?.[k]) || 0);

  const previstoWidths = useMemo(() => computeWidths(previstoCounts), [previstoCounts]);
  const realWidths = useMemo(() => computeWidths(realCounts), [realCounts]);

  // Gargalo (qual conversão real caiu mais vs prevista) + reajuste: mantendo
  // a MESMA meta final, quanto precisa lá em cima dado o ritmo real.
  const bottleneck = useMemo(() => worstLeg(previstoCounts, realCounts), [previstoCounts, realCounts]);
  const reajustadoCounts = useMemo(() => reajustarFunnelComReal(previstoCounts, realCounts), [previstoCounts, realCounts]);

  // Selo de ritmo (mesma linguagem do hero do mês, lá em cima): explica o
  // desvio pelo gargalo encontrado e o que precisa mudar lá no topo pra
  // ainda bater a mesma meta final.
  const readjustBadge = useMemo(() => {
    if (!bottleneck || bottleneck.ratio >= 0.97) return null;
    // Nunca mostrar "sobe de X pra X" — se o reajuste nao mudou o topo do
    // funil de verdade (ex: taxa real caiu pro fallback do previsto), o
    // selo so confundiria alegando um problema sem nenhum numero diferente.
    if (Math.round(reajustadoCounts[0]) === Math.round(previstoCounts[0])) return null;
    const fromLabel = STEP_META[ORDER[bottleneck.i]].label;
    const toLabel = STEP_META[ORDER[bottleneck.i + 1]].label;
    const lastLabel = STEP_META[ORDER[ORDER.length - 1]].label.toLowerCase();
    const topLabel = STEP_META[ORDER[0]].label.toLowerCase();
    return {
      text: `Conversão ${fromLabel} → ${toLabel} real está em ${fmtPct(bottleneck.realRate)} (previsto: ${fmtPct(bottleneck.plannedRate)}). `
        + `Nesse ritmo, pra ainda bater a meta de ${fmtInt(previstoCounts[previstoCounts.length - 1])} ${lastLabel}, `
        + `o previsto de ${topLabel} sobe de ${fmtInt(previstoCounts[0])} pra ${fmtInt(reajustadoCounts[0])}.`,
    };
  }, [bottleneck, previstoCounts, reajustadoCounts]);

  return (
    <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/60 p-5">
      <div className="mb-3">
        <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100">Funil do mês · Previsto × Real</h3>
        <p className="text-[11px] text-slate-400 dark:text-slate-500">
          Meta de {monthLabel || 'este mês'} · plano comercial
          {metaAtivosNota && <> · <span className="text-fyness-primary font-medium">{metaAtivosNota}</span></>}
        </p>
      </div>

      {/* Cabeçalho das 2 colunas — aparece uma vez, não por linha */}
      <div className="flex items-stretch mb-1.5">
        <div className="w-[84px] sm:w-28 shrink-0" />
        <div className="flex-1 text-center text-[10px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">Previsto</div>
        <div className="w-[46px] sm:w-[54px] shrink-0" />
        <div className="flex-1 text-center text-[10px] font-semibold uppercase tracking-wider text-fyness-primary">Real</div>
      </div>

      <div>
        {ORDER.map((k, i) => {
          const isLast = i === ORDER.length - 1;
          return (
            <ComparativoRow
              key={k}
              stepKey={k}
              previstoCount={previstoCounts[i]}
              realCount={realCounts[i]}
              goal={stageProgress({ counts: previstoCounts }, i, realCounts[i])}
              pTopW={previstoWidths[i]}
              pBotW={isLast ? previstoWidths[i] * 0.5 : previstoWidths[i + 1]}
              rTopW={realWidths[i]}
              rBotW={isLast ? realWidths[i] * 0.5 : realWidths[i + 1]}
            />
          );
        })}
      </div>

      {/* Selo de reajuste — só aparece quando o real medido já mostra um
          gargalo relevante (ratio < 97%), com a razão do desvio. */}
      {readjustBadge && (
        <div className="mt-3 flex items-start gap-2 rounded-xl px-3 py-2.5 text-xs leading-snug bg-amber-50 dark:bg-amber-900/15 text-amber-700 dark:text-amber-300">
          <TrendingDown size={14} className="shrink-0 mt-0.5" />
          <span>{readjustBadge.text}</span>
        </div>
      )}
    </div>
  );
}

export default FunnelPrevistoReal;
