/**
 * FunnelPrevistoReal — funil comparativo LADO A LADO: Meta Prevista × Real.
 * A Prevista é a META do plano comercial — vem PRONTA (via prop `previsto`,
 * já nas 4 categorias fixas lead/qualified/meeting/closing) do plano cravado
 * do Comparativo (a mesma fonte que já alimenta o resto da página: tabela mês
 * a mês etc). Não é o funil livre de /crm/planejamento — aqui não tem etapa
 * customizável, é a meta FIXA (não reage ao real).
 *
 * Uma etapa = uma linha, com as duas fatias de funil lado a lado — sem
 * duplicar rótulo/ícone (aparecem uma vez por linha).
 *
 * Embaixo do funil, um selo DIAGNÓSTICO aponta o gargalo do mês — qual
 * conversão real caiu mais vs a prevista. É só leitura do real: NÃO mexe na
 * meta (a meta é linha de base fixa; antes esse selo reescalava o Previsto de
 * Leads, o que fazia a meta reagir ao real — removido).
 */

import { useMemo, useState } from 'react';
import {
  UserPlus, BadgeCheck, CalendarPlus, CalendarCheck, Crown, ArrowRight, TrendingUp, TrendingDown, Gauge, Eye, EyeOff,
} from 'lucide-react';
import { stageProgress } from '../lib/funnelGoals';

const fmtInt = (v) => new Intl.NumberFormat('pt-BR').format(Math.round(v) || 0);
const fmtPct = (v) => `${Math.round(v * 100)}%`;

const STEP_META = {
  lead:             { label: 'Leads',                icon: UserPlus,      from: '#60a5fa', to: '#3b82f6' },
  qualified:        { label: 'Qualificados',         icon: BadgeCheck,    from: '#818cf8', to: '#6366f1' },
  meetingScheduled: { label: 'Reuniões agendadas',   icon: CalendarPlus,  from: '#fbbf24', to: '#f59e0b' },
  meetingHeld:      { label: 'Reuniões acontecidas', icon: CalendarCheck, from: '#f59e0b', to: '#d97706' },
  closing:          { label: 'Fechamentos',          icon: Crown,         from: '#34d399', to: '#10b981' },
};
const ORDER = ['lead', 'qualified', 'meetingScheduled', 'meetingHeld', 'closing'];

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

function ComparativoRow({ stepKey, previstoCount, realCount, goal, pTopW, pBotW, rTopW, rBotW, showPrevisto = true, onStepClick }) {
  const meta = STEP_META[stepKey];
  const Icon = meta.icon;
  const pClip = clipOf(pTopW, pBotW);
  const rClip = clipOf(rTopW, rBotW);
  const tone = goal ? goalTone(goal.percent, goal.hit) : null;
  const StatusIcon = tone?.Icon;

  return (
    <div
      className={`flex items-stretch h-[54px] rounded-lg transition-colors ${onStepClick ? 'cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700/30' : ''}`}
      onClick={onStepClick ? () => onStepClick(stepKey, meta.label) : undefined}
      role={onStepClick ? 'button' : undefined}
      title={onStepClick ? `Ver os leads em ${meta.label}` : undefined}
    >
      {/* Rótulo — uma vez só por linha */}
      <div className="w-[84px] sm:w-28 flex items-center justify-end gap-1.5 pr-2.5 text-right shrink-0">
        <span className="text-[12px] sm:text-xs font-semibold text-slate-600 dark:text-slate-300 truncate">{meta.label}</span>
        <span className="w-6 h-6 rounded-md hidden sm:flex items-center justify-center shrink-0 text-white"
          style={{ background: `linear-gradient(135deg, ${meta.from}, ${meta.to})` }}>
          <Icon size={12} />
        </span>
      </div>

      {/* Meta Prevista — fatia à esquerda (some quando o previsto está oculto) */}
      {showPrevisto && (
        <div className="relative flex-1 min-w-0">
          <div className="absolute inset-0 transition-all duration-500"
            style={{ clipPath: pClip, background: `linear-gradient(135deg, ${meta.from}, ${meta.to})`, opacity: 0.45 }} />
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-xs sm:text-sm font-bold text-white tabular-nums drop-shadow-[0_1px_2px_rgba(15,23,42,0.4)]">{fmtInt(previstoCount)}</span>
          </div>
        </div>
      )}

      {/* % do previsto alcançado nessa etapa — só faz sentido com o previsto à vista */}
      {showPrevisto && (
        <div className="w-[46px] sm:w-[54px] shrink-0 flex flex-col items-center justify-center gap-0.5">
          {goal ? (
            <span className={`text-[12px] font-bold tabular-nums inline-flex items-center gap-0.5 ${tone.text}`}>
              {StatusIcon && <StatusIcon size={10} />}
              {goal.percent}%
            </span>
          ) : (
            <ArrowRight size={11} className="text-slate-300 dark:text-slate-600" />
          )}
        </div>
      )}

      {/* Real — dados medidos de verdade no CRM. Sem o previsto ao lado, o Real
          ganha largura máxima e centraliza pra não colar na borda (afunila bonito). */}
      <div className={`relative min-w-0 ${showPrevisto ? 'flex-1' : 'flex-1 max-w-[280px] mx-auto'}`}>
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

export function FunnelPrevistoReal({ previsto, real, monthLabel, subtitle, onStepClick }) {
  const previstoCounts = ORDER.map(k => Number(previsto?.[k]) || 0);
  const realCounts = ORDER.map(k => Number(real?.[k]) || 0);

  const previstoWidths = useMemo(() => computeWidths(previstoCounts), [previstoCounts]);
  const realWidths = useMemo(() => computeWidths(realCounts), [realCounts]);

  // Gargalo: qual conversão real caiu mais vs a prevista. Só diagnóstico —
  // aponta onde travou. NÃO mexe na meta (a meta prevista é fixa).
  const bottleneck = useMemo(() => worstLeg(previstoCounts, realCounts), [previstoCounts, realCounts]);

  const bottleneckBadge = useMemo(() => {
    if (!bottleneck || bottleneck.ratio >= 0.97) return null;
    const fromLabel = STEP_META[ORDER[bottleneck.i]].label;
    const toLabel = STEP_META[ORDER[bottleneck.i + 1]].label;
    return {
      text: `Gargalo do mês: conversão ${fromLabel} → ${toLabel} real está em ${fmtPct(bottleneck.realRate)} (previsto: ${fmtPct(bottleneck.plannedRate)}).`,
    };
  }, [bottleneck]);

  const [showPrevisto, setShowPrevisto] = useState(true);

  return (
    <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/60 p-5">
      <div className="flex items-start justify-between gap-2 mb-3">
        <div>
          <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100">
            Funil · {monthLabel || 'este mês'} {showPrevisto ? '· Previsto × Real' : '· Real'}
          </h3>
          <p className="text-[12px] text-slate-500 dark:text-slate-400">
            {subtitle || 'plano comercial (fixo)'}
          </p>
        </div>
        {/* Ocultar/mostrar a coluna do Previsto — deixa só o Real quando desligado */}
        <button
          type="button"
          onClick={() => setShowPrevisto(v => !v)}
          title={showPrevisto ? 'Ocultar o previsto (ver só o real)' : 'Mostrar o previsto'}
          className="shrink-0 flex items-center gap-1.5 px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700 text-[12px] font-medium text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors"
        >
          {showPrevisto ? <EyeOff size={13} /> : <Eye size={13} />}
          Previsto
        </button>
      </div>

      {/* Cabeçalho das colunas — aparece uma vez, não por linha */}
      <div className="flex items-stretch mb-1.5">
        <div className="w-[84px] sm:w-28 shrink-0" />
        {showPrevisto && <div className="flex-1 text-center text-[12px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Previsto</div>}
        {showPrevisto && <div className="w-[46px] sm:w-[54px] shrink-0" />}
        <div className={`text-center text-[12px] font-semibold uppercase tracking-wider text-fyness-primary ${showPrevisto ? 'flex-1' : 'flex-1 max-w-[280px] mx-auto'}`}>Real</div>
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
              showPrevisto={showPrevisto}
              onStepClick={onStepClick}
            />
          );
        })}
      </div>

      {/* Selo diagnóstico — só aparece quando o real medido já mostra um
          gargalo relevante (ratio < 97%). Aponta a etapa, não mexe na meta. */}
      {bottleneckBadge && (
        <div className="mt-3 flex items-start gap-2 rounded-xl px-3 py-2.5 text-xs leading-snug bg-amber-50 dark:bg-amber-900/15 text-amber-700 dark:text-amber-300">
          <TrendingDown size={14} className="shrink-0 mt-0.5" />
          <span>{bottleneckBadge.text}</span>
        </div>
      )}
    </div>
  );
}

export default FunnelPrevistoReal;
