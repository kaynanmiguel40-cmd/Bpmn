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

import { useState, useEffect } from 'react';
import { Target, Flag, ChevronDown, ChevronRight, Check, BookOpen, Filter, CornerDownRight, Clock } from 'lucide-react';
import { useStagePlaybook, useDealProgress, useToggleDealStep, useDealActivities } from '../hooks/useCrmQueries';
import { filterStepsForDeal } from '../services/crmPlaybookService';
import { ChannelBadge } from './ui/ChannelBadge';
import { CrmModal } from './ui/CrmModal';

// Data agendada da tarefa. Marca atraso pra tarefa vencida e nao feita — e o
// que faz o vendedor priorizar sem abrir a Agenda.
function DueLabel({ iso, done }) {
  if (!iso) return null;
  const d = new Date(iso);
  const atrasada = !done && d < new Date();
  const quando = d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })
    + ' ' + d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  return (
    <span className={`shrink-0 inline-flex items-center gap-1 text-[12px] font-semibold px-1.5 py-0.5 rounded ${
      done
        ? 'text-slate-500 dark:text-slate-400'
        : atrasada
          ? 'bg-rose-100 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400'
          : 'bg-slate-100 dark:bg-slate-700/60 text-slate-500 dark:text-slate-400'
    }`}>
      <Clock size={10} /> {quando}
    </span>
  );
}

function StepRow({ step, done, onToggle, disabled, outcome, onEditOutcome, dueAt }) {
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

        <ChannelBadge title={step.title} />

        <span className={`flex-1 text-sm font-medium ${
          done
            ? 'text-slate-500 dark:text-slate-400 line-through'
            : 'text-slate-800 dark:text-slate-100'
        }`}>
          {step.title}
        </span>

        <DueLabel iso={dueAt} done={done} />

        {(step.script || step.scenarios?.length > 0) && (
          <button
            onClick={() => setOpen(o => !o)}
            className="shrink-0 inline-flex items-center gap-1 text-[12px] font-medium text-fyness-primary hover:bg-fyness-primary/10 px-2 py-1 rounded-md"
          >
            {open ? <ChevronDown size={13} /> : <ChevronRight size={13} />} Ver
          </button>
        )}
      </div>

      {/* O que o lead respondeu — fica atribuido na propria tarefa, nao so no
          Historico. Clicar reabre pra corrigir. */}
      {done && (
        <button
          type="button"
          onClick={onEditOutcome}
          className="w-full text-left px-3 pb-2.5 -mt-1 ml-7 pr-6 group/outcome"
        >
          <span className="flex gap-1.5 text-[13px]">
            <CornerDownRight size={13} className="shrink-0 mt-0.5 text-emerald-500" />
            {outcome ? (
              <span className="text-slate-600 dark:text-slate-300">
                <span className="text-slate-500 dark:text-slate-400">Lead:</span> {outcome}
              </span>
            ) : (
              <span className="text-slate-500 dark:text-slate-400 italic group-hover/outcome:text-fyness-primary">
                Sem resposta registrada — clique pra anotar
              </span>
            )}
          </span>
        </button>
      )}

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
                  <div className="text-[12px] font-semibold text-slate-500 dark:text-slate-400">
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

/**
 * Ao concluir uma tarefa, pergunta O QUE O LEAD RESPONDEU. Os cenarios do passo
 * ja sao as respostas provaveis — viram botao de 1 clique; o campo livre cobre
 * o resto. Sem isso o historico so diria "feito", sem contar a conversa.
 */
function StepOutcomeModal({ open, step, onClose, onConfirm, saving, initial = '' }) {
  const [text, setText] = useState('');

  // Pre-preenche com o que ja foi registrado (edicao); vazio ao concluir agora.
  useEffect(() => { if (open) setText(initial || ''); }, [open, step?.id, initial]);

  if (!step) return null;
  return (
    <CrmModal
      open={open}
      onClose={onClose}
      title={`Concluir: ${step.title}`}
      size="md"
      footer={
        <div className="flex justify-end gap-2">
          <button onClick={onClose} disabled={saving}
            className="px-4 py-2 rounded-lg text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800">
            Cancelar
          </button>
          <button onClick={() => onConfirm(text)} disabled={saving}
            className="px-4 py-2 rounded-lg text-sm font-semibold bg-emerald-500 text-white hover:bg-emerald-600 disabled:opacity-60">
            {saving ? 'Salvando…' : 'Concluir'}
          </button>
        </div>
      }
    >
      <div className="space-y-3">
        <div className="text-[12px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
          O que o lead respondeu / como reagiu?
        </div>

        {step.scenarios?.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {step.scenarios.map((sc, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setText(sc.when)}
                className={`px-2.5 py-1.5 rounded-lg text-[12px] border transition-colors ${
                  text === sc.when
                    ? 'bg-fyness-primary text-white border-fyness-primary'
                    : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-fyness-primary'
                }`}
              >
                {sc.when}
              </button>
            ))}
          </div>
        )}

        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={3}
          placeholder="Escreva o que ele respondeu (ou escolha acima)"
          className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm text-slate-700 dark:text-slate-200 resize-y"
        />
        <p className="text-[12px] text-slate-500 dark:text-slate-400">
          Pode deixar em branco se não houve resposta.
        </p>
      </div>
    </CrmModal>
  );
}

export function DealProcessChecklist({ deal, memberId = null }) {
  const { data: playbook, isLoading: loadingPlaybook } = useStagePlaybook(deal?.pipelineId);
  const { data: progress = [], isLoading: loadingProgress } = useDealProgress(deal?.id);
  const { data: activities = [] } = useDealActivities(deal?.id);
  const toggle = useToggleDealStep();
  const [outcomeStep, setOutcomeStep] = useState(null);

  // Filtra os passos pela ORIGEM do lead: um lead veio de UM lugar, entao so o
  // script daquela origem aparece (ex: veio de anuncio → so o toque de anuncio).
  // Passos sem tag sao universais e sempre aparecem.
  const allSteps = playbook?.[deal?.stageId] || [];
  const steps = filterStepsForDeal(allSteps, deal?.source);
  const doneIds = new Set(progress.map(p => p.stepId));
  // Resultado registrado por passo (o que o lead respondeu).
  const outcomeByStep = {};
  progress.forEach(p => { outcomeByStep[p.stepId] = p.outcome || ''; });
  // Data/hora agendada de cada passo — vem da atividade gerada na Agenda.
  const dueByStep = {};
  activities.forEach(a => { if (a.stageStepId) dueByStep[a.stageStepId] = a.startDate; });
  const doneCount = steps.filter(s => doneIds.has(s.id)).length;
  // So avisa sobre origem quando ela REALMENTE muda o que aparece (etapa tem
  // passos por origem) e o lead nao tem origem definida.
  const hasSourceSteps = allSteps.some(s => s.sourceTag);
  const showSourceHint = hasSourceSteps && !deal?.source;

  // A etapa vem do deal carregado; o objetivo/criterio moram nela.
  const objetivo = deal?.stage?.objetivo || '';
  const exitCriteria = deal?.stage?.exitCriteria || '';

  // Concluir SEMPRE passa pelo modal do resultado (o que o lead respondeu).
  // Desmarcar e direto — nao ha resultado a registrar.
  const handleToggle = (step, done) => {
    if (done) { setOutcomeStep(step); return; }
    toggle.mutate({ dealId: deal.id, stepId: step.id, done: false, memberId });
  };

  const confirmOutcome = (text) => {
    if (!outcomeStep) return;
    toggle.mutate(
      { dealId: deal.id, stepId: outcomeStep.id, done: true, memberId, outcome: text },
      { onSuccess: () => setOutcomeStep(null) },
    );
  };

  if (loadingPlaybook || loadingProgress) {
    return (
      <div className="space-y-2">
        {[0, 1, 2].map(i => <div key={i} className="h-14 bg-slate-100 dark:bg-slate-800/60 rounded-xl animate-pulse" />)}
      </div>
    );
  }

  // So mostra o vazio se nao ha NEM processo NEM historico — um lead numa etapa
  // sem playbook ainda pode ter tarefas feitas pra mostrar.
  if (steps.length === 0 && !objetivo && !exitCriteria) {
    return (
      <div className="py-10 text-center">
        <BookOpen size={28} className="mx-auto text-slate-300 dark:text-slate-600 mb-2" />
        <p className="text-sm text-slate-500 dark:text-slate-400">
          A etapa <strong>{deal?.stage?.name || 'atual'}</strong> ainda não tem o que fazer definido.
        </p>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Defina na Pipeline, no botão "O que fazer" da coluna.
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
            <div className="text-[12px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
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
            <span className="text-[12px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              O que fazer
            </span>
            <span className="text-[12px] font-semibold text-slate-500 dark:text-slate-400 tnum">
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
                onToggle={(done) => handleToggle(step, done)}
                outcome={outcomeByStep[step.id]}
                dueAt={dueByStep[step.id]}
                onEditOutcome={() => setOutcomeStep(step)}
              />
            ))}
          </div>
        </div>
      )}

      {exitCriteria && (
        <div className="flex gap-2.5">
          <Flag size={16} className="text-emerald-500 shrink-0 mt-0.5" />
          <div>
            <div className="text-[12px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Quando mover
            </div>
            <p className="text-sm text-slate-700 dark:text-slate-200">{exitCriteria}</p>
          </div>
        </div>
      )}

      <StepOutcomeModal
        open={!!outcomeStep}
        step={outcomeStep}
        initial={outcomeStep ? (outcomeByStep[outcomeStep.id] || '') : ''}
        onClose={() => setOutcomeStep(null)}
        onConfirm={confirmOutcome}
        saving={toggle.isPending}
      />
    </div>
  );
}

export default DealProcessChecklist;
