/**
 * DealProcessChecklist — o processo da etapa ATUAL do negocio, com checklist.
 *
 * Mostra o objetivo da etapa, os passos (com script) pra marcar conforme o
 * vendedor executa, e quando mover o lead. Os passos vem da etapa (nao sao
 * copiados pro deal), entao editar o playbook vale na hora pra todo mundo.
 *
 * Ao mudar de etapa o checklist troca junto: o progresso da etapa anterior fica
 * gravado (referencia o passo dela), so sai de vista.
 */

import { useState, useMemo } from 'react';
import { Target, Flag, ChevronDown, ChevronRight, Check, BookOpen, Filter, CornerDownRight, History, CheckCircle2 } from 'lucide-react';
import { useStagePlaybook, useDealProgress, useToggleDealStep, useDealActivities } from '../hooks/useCrmQueries';
import { filterStepsForDeal } from '../services/crmPlaybookService';

const fmtWhen = (iso) => {
  if (!iso) return '';
  const d = new Date(iso);
  return d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })
    + ' ' + d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
};

function StepRow({ step, done, onToggle, disabled }) {
  const [open, setOpen] = useState(false);
  return (
    <div className={`rounded-xl border transition-colors ${
      done
        ? 'border-emerald-200 dark:border-emerald-800/60 bg-emerald-50/50 dark:bg-emerald-900/10'
        : 'border-slate-200 dark:border-slate-700 bg-white/60 dark:bg-slate-800/40'
    }`}>
      <div className="flex items-center gap-2.5 p-3">
        <button
          onClick={() => onToggle(!done)}
          disabled={disabled}
          aria-pressed={done}
          aria-label={done ? `Desmarcar: ${step.title}` : `Marcar como feito: ${step.title}`}
          className={`w-5 h-5 rounded-md border-2 shrink-0 flex items-center justify-center transition-colors disabled:opacity-50 ${
            done
              ? 'bg-emerald-500 border-emerald-500 text-white'
              : 'border-slate-300 dark:border-slate-600 hover:border-fyness-primary'
          }`}
        >
          {done && <Check size={13} strokeWidth={3} />}
        </button>

        <span className={`flex-1 text-sm font-medium ${
          done
            ? 'text-slate-400 dark:text-slate-500 line-through'
            : 'text-slate-800 dark:text-slate-100'
        }`}>
          {step.title}
        </span>

        {(step.script || step.scenarios?.length > 0) && (
          <button
            onClick={() => setOpen(o => !o)}
            className="shrink-0 inline-flex items-center gap-1 text-[11px] font-medium text-fyness-primary hover:bg-fyness-primary/10 px-2 py-1 rounded-md"
          >
            {open ? <ChevronDown size={13} /> : <ChevronRight size={13} />} Ver
          </button>
        )}
      </div>

      {open && (
        <div className="px-3 pb-3 ml-7 space-y-2">
          {step.script && (
            <p className="text-sm text-slate-600 dark:text-slate-300 whitespace-pre-wrap border-l-2 border-slate-200 dark:border-slate-600 pl-3">
              {step.script}
            </p>
          )}
          {step.scenarios?.length > 0 && (
            <div className="space-y-1.5">
              {step.scenarios.map((sc, i) => (
                <div key={i} className="rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-700 px-2.5 py-2">
                  <div className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                    Se: {sc.when}
                  </div>
                  <div className="text-[13px] text-slate-700 dark:text-slate-200 mt-0.5 flex gap-1.5">
                    <CornerDownRight size={13} className="shrink-0 mt-0.5 text-fyness-primary" />
                    <span>{sc.then}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export function DealProcessChecklist({ deal, memberId = null }) {
  const { data: playbook, isLoading: loadingPlaybook } = useStagePlaybook(deal?.pipelineId);
  const { data: progress = [], isLoading: loadingProgress } = useDealProgress(deal?.id);
  const { data: activities = [] } = useDealActivities(deal?.id);
  const toggle = useToggleDealStep();

  // Titulo de QUALQUER passo do playbook (todas as etapas) — o historico mostra
  // tambem o que o lead cumpriu em etapas anteriores.
  const stepById = useMemo(() => {
    const map = {};
    Object.values(playbook || {}).forEach(list => (list || []).forEach(s => { map[s.id] = s; }));
    return map;
  }, [playbook]);

  // HISTORICO: tudo que ja foi feito com esse lead — passos do processo E
  // tarefas criadas a mao — numa linha do tempo unica, mais recente primeiro.
  const history = useMemo(() => {
    const items = [];
    for (const p of progress) {
      items.push({
        id: `step-${p.id}`,
        kind: 'processo',
        title: stepById[p.stepId]?.title || 'Tarefa do processo',
        at: p.doneAt,
      });
    }
    for (const a of activities) {
      if (!a.completed) continue;
      items.push({
        id: `act-${a.id}`,
        kind: 'manual',
        title: a.title,
        at: a.completedAt || a.createdAt,
      });
    }
    return items.sort((x, y) => new Date(y.at || 0) - new Date(x.at || 0));
  }, [progress, activities, stepById]);

  // Filtra os passos pela ORIGEM do lead: um lead veio de UM lugar, entao so o
  // script daquela origem aparece (ex: veio de anuncio → so o toque de anuncio).
  // Passos sem tag sao universais e sempre aparecem.
  const allSteps = playbook?.[deal?.stageId] || [];
  const steps = filterStepsForDeal(allSteps, deal?.source);
  const doneIds = new Set(progress.map(p => p.stepId));
  const doneCount = steps.filter(s => doneIds.has(s.id)).length;
  // So avisa sobre origem quando ela REALMENTE muda o que aparece (etapa tem
  // passos por origem) e o lead nao tem origem definida.
  const hasSourceSteps = allSteps.some(s => s.sourceTag);
  const showSourceHint = hasSourceSteps && !deal?.source;

  // A etapa vem do deal carregado; o objetivo/criterio moram nela.
  const objetivo = deal?.stage?.objetivo || '';
  const exitCriteria = deal?.stage?.exitCriteria || '';

  if (loadingPlaybook || loadingProgress) {
    return (
      <div className="space-y-2">
        {[0, 1, 2].map(i => <div key={i} className="h-14 bg-slate-100 dark:bg-slate-800/60 rounded-xl animate-pulse" />)}
      </div>
    );
  }

  // So mostra o vazio se nao ha NEM processo NEM historico — um lead numa etapa
  // sem playbook ainda pode ter tarefas feitas pra mostrar.
  if (steps.length === 0 && !objetivo && !exitCriteria && history.length === 0) {
    return (
      <div className="py-10 text-center">
        <BookOpen size={28} className="mx-auto text-slate-300 dark:text-slate-600 mb-2" />
        <p className="text-sm text-slate-500 dark:text-slate-400">
          A etapa <strong>{deal?.stage?.name || 'atual'}</strong> ainda não tem processo.
        </p>
        <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
          Defina em Pipeline → botão "O que fazer" na coluna.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {objetivo && (
        <div className="flex gap-2.5">
          <Target size={16} className="text-indigo-500 shrink-0 mt-0.5" />
          <div>
            <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
              Objetivo desta etapa
            </div>
            <p className="text-sm text-slate-700 dark:text-slate-200">{objetivo}</p>
          </div>
        </div>
      )}

      {showSourceHint && (
        <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800/50 text-[12px] text-amber-700 dark:text-amber-300">
          <Filter size={14} className="shrink-0" />
          Defina a <strong>origem</strong> do lead pra ver so o script certo (mostrando todos por enquanto).
        </div>
      )}

      {steps.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
              O que fazer
            </span>
            <span className="text-[11px] font-semibold text-slate-400 dark:text-slate-500 tnum">
              {doneCount}/{steps.length}
            </span>
          </div>
          <div className="space-y-2">
            {steps.map(step => (
              <StepRow
                key={step.id}
                step={step}
                done={doneIds.has(step.id)}
                disabled={toggle.isPending}
                onToggle={(done) => toggle.mutate({ dealId: deal.id, stepId: step.id, done, memberId })}
              />
            ))}
          </div>
        </div>
      )}

      {exitCriteria && (
        <div className="flex gap-2.5">
          <Flag size={16} className="text-emerald-500 shrink-0 mt-0.5" />
          <div>
            <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
              Quando mover
            </div>
            <p className="text-sm text-slate-700 dark:text-slate-200">{exitCriteria}</p>
          </div>
        </div>
      )}

      {/* HISTORICO: tudo que ja foi feito com esse lead — tarefas do processo e
          as criadas a mao — na mesma linha do tempo. */}
      {history.length > 0 && (
        <div className="pt-1 border-t border-slate-200/70 dark:border-slate-700">
          <div className="flex items-center gap-1.5 mt-3 mb-2">
            <History size={13} className="text-slate-400" />
            <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
              Histórico
            </span>
            <span className="text-[11px] text-slate-400 dark:text-slate-500 tnum">({history.length})</span>
          </div>
          <div className="space-y-1.5 max-h-72 overflow-y-auto">
            {history.map(h => (
              <div key={h.id} className="flex items-start gap-2">
                <CheckCircle2 size={13} className="text-emerald-500 shrink-0 mt-0.5" />
                <div className="min-w-0 flex-1">
                  <span className="text-[13px] text-slate-700 dark:text-slate-200">{h.title}</span>
                  {h.kind === 'manual' && (
                    <span className="ml-1.5 text-[9px] font-semibold uppercase px-1 py-0.5 rounded bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400">
                      manual
                    </span>
                  )}
                </div>
                <span className="text-[11px] text-slate-400 dark:text-slate-500 shrink-0 tnum">{fmtWhen(h.at)}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default DealProcessChecklist;
