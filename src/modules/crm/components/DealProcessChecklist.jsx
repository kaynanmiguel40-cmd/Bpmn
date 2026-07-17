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

import { useState } from 'react';
import { Target, Flag, ChevronDown, ChevronRight, Check, BookOpen } from 'lucide-react';
import { useStagePlaybook, useDealProgress, useToggleDealStep } from '../hooks/useCrmQueries';

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

        {step.script && (
          <button
            onClick={() => setOpen(o => !o)}
            className="shrink-0 inline-flex items-center gap-1 text-[11px] font-medium text-fyness-primary hover:bg-fyness-primary/10 px-2 py-1 rounded-md"
          >
            {open ? <ChevronDown size={13} /> : <ChevronRight size={13} />} Script
          </button>
        )}
      </div>

      {open && step.script && (
        <p className="px-3 pb-3 ml-7 text-sm text-slate-600 dark:text-slate-300 whitespace-pre-wrap border-l-2 border-slate-200 dark:border-slate-600 pl-3">
          {step.script}
        </p>
      )}
    </div>
  );
}

export function DealProcessChecklist({ deal, memberId = null }) {
  const { data: playbook, isLoading: loadingPlaybook } = useStagePlaybook(deal?.pipelineId);
  const { data: progress = [], isLoading: loadingProgress } = useDealProgress(deal?.id);
  const toggle = useToggleDealStep();

  const steps = playbook?.[deal?.stageId] || [];
  const doneIds = new Set(progress.map(p => p.stepId));
  const doneCount = steps.filter(s => doneIds.has(s.id)).length;

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

  if (steps.length === 0 && !objetivo && !exitCriteria) {
    return (
      <div className="py-10 text-center">
        <BookOpen size={28} className="mx-auto text-slate-300 dark:text-slate-600 mb-2" />
        <p className="text-sm text-slate-500 dark:text-slate-400">
          A etapa <strong>{deal?.stage?.name || 'atual'}</strong> ainda não tem processo.
        </p>
        <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
          Defina em Pipeline → ícone de livro na coluna.
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
    </div>
  );
}

export default DealProcessChecklist;
