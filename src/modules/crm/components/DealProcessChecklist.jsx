/**
 * DealProcessChecklist — o processo da etapa ATUAL do negocio, em LEITURA.
 *
 * Mostra o objetivo da etapa, os passos (com script), o que ja foi feito e o
 * que o lead respondeu, e quando mover o lead. Os passos vem da etapa (nao sao
 * copiados pro deal), entao editar o playbook vale na hora pra todo mundo.
 *
 * NAO tem check: o pipeline (e o lead dentro dele) e o nivel de ACOMPANHAMENTO
 * — quem executa e a Agenda, onde a tarefa tem horario, script, cenarios e o
 * contato do lead. Dois lugares de check faziam a mesma tarefa parecer duas.
 * O botao "Executar na Agenda" leva pro proximo toque agendado.
 *
 * Ao mudar de etapa o checklist troca junto: o progresso da etapa anterior fica
 * gravado (referencia o passo dela), so sai de vista.
 */

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Target, Flag, ChevronDown, ChevronRight, Check, BookOpen, Filter, CornerDownRight, Clock, CalendarCheck } from 'lucide-react';
import { useStagePlaybook, useDealProgress, useDealActivities } from '../hooks/useCrmQueries';
import { preencherScript } from '../utils/preencherScript';
import { useProfile } from '../../../hooks/useProfile';
import { filterStepsForDeal } from '../services/crmPlaybookService';
import { isOverdue } from '../utils/stepLabel';
import { ChannelBadge } from './ui/ChannelBadge';

// Data agendada da tarefa. Marca atraso pra tarefa vencida e nao feita — e o
// que faz o vendedor priorizar sem abrir a Agenda.
function DueLabel({ iso, done }) {
  if (!iso) return null;
  const d = new Date(iso);
  // Atraso pela MESMA regra do resto do sistema (isOverdue): por DIA, nao por
  // instante. Comparando com `new Date()` direto, a tarefa das 9h ficava
  // vermelha as 9h01 — com o vendedor ainda no telefone — enquanto a fila e o
  // calendario continuavam mostrando ela como do dia. Duas telas discordando
  // sobre a mesma tarefa.
  const atrasada = isOverdue({ startDate: iso, completed: done });
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

function StepRow({ step, done, outcome, dueAt, attempts = 0, dadosScript = {} }) {
  const [open, setOpen] = useState(false);
  // Tentou e nao falou: a tarefa foi executada, mas o passo continua pendente.
  // Sem este estado o passo pareceria intocado — e ninguem saberia que ja se
  // ligou 3 vezes pra esse lead sem sucesso.
  const tentado = !done && attempts > 0;
  return (
    <div className={`rounded-xl border transition-colors ${
      done
        ? 'border-emerald-200 dark:border-emerald-800/60 bg-emerald-50/50 dark:bg-emerald-900/10'
        : tentado
          ? 'border-amber-200 dark:border-amber-800/60 bg-amber-50/40 dark:bg-amber-900/10'
          : 'border-slate-200 dark:border-slate-700 bg-white/60 dark:bg-slate-800/40'
    }`}>
      <div className="flex items-center gap-2.5 p-3">
        {/* Marcador de STATUS, nao checkbox: aqui so se acompanha. Executar (e
            concluir) e na Agenda — um caminho so, sem dois lugares de check. */}
        <span
          aria-label={done ? 'Feito' : tentado ? 'Tentado, sem contato' : 'Pendente'}
          className={`w-5 h-5 rounded-full shrink-0 flex items-center justify-center ${
            done
              ? 'bg-emerald-500 text-white'
              : tentado
                ? 'border-2 border-amber-400 text-amber-500 text-[10px] font-bold'
                : 'border-2 border-dashed border-slate-300 dark:border-slate-600'
          }`}
        >
          {done ? <Check size={13} strokeWidth={3} /> : tentado ? attempts : null}
        </span>

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

      {tentado && (
        <div className="px-3 pb-2.5 -mt-1 ml-7 text-[13px] text-amber-700 dark:text-amber-300">
          {attempts} {attempts === 1 ? 'tentativa' : 'tentativas'}, sem contato — ainda precisa falar com ele
        </div>
      )}

      {/* O que o lead respondeu, registrado ao concluir a tarefa na Agenda. */}
      {done && outcome && (
        <div className="px-3 pb-2.5 -mt-1 ml-7 pr-6">
          <span className="flex gap-1.5 text-[13px]">
            <CornerDownRight size={13} className="shrink-0 mt-0.5 text-emerald-500" />
            <span className="text-slate-600 dark:text-slate-300">
              <span className="text-slate-500 dark:text-slate-400">Lead:</span> {outcome}
            </span>
          </span>
        </div>
      )}

      {open && (
        <div className="px-3 pb-3 ml-7 space-y-2">
          {step.script && (
            <p className="text-sm text-slate-600 dark:text-slate-300 whitespace-pre-wrap border-l-2 border-slate-200 dark:border-slate-600 pl-3">
              {preencherScript(step.script, dadosScript).texto}
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
                    <span>{preencherScript(sc.then, dadosScript).texto}</span>
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

export function DealProcessChecklist({ deal }) {
  const navigate = useNavigate();
  const { data: playbook, isLoading: loadingPlaybook } = useStagePlaybook(deal?.pipelineId);
  const { data: progress = [], isLoading: loadingProgress } = useDealProgress(deal?.id);
  const { data: activities = [] } = useDealActivities(deal?.id);

  // Filtra os passos pela ORIGEM do lead: um lead veio de UM lugar, entao so o
  // script daquela origem aparece (ex: veio de anuncio → so o toque de anuncio).
  // Passos sem tag sao universais e sempre aparecem.
  // O roteiro e escrito com marcadores porque o mesmo texto serve pra todo
  // lead. Aqui o negocio JA tem contato e empresa carregados, entao a
  // substituicao e direta — e o que falta continua visivel como marcador.
  const { profile } = useProfile();
  const dadosScript = {
    nome: deal?.contact?.name || deal?.contactName || '',
    empresa: deal?.company?.name || '',
    segmento: deal?.company?.segment || '',
    consultora: profile?.name || '',
  };

  const allSteps = playbook?.[deal?.stageId] || [];
  const steps = filterStepsForDeal(allSteps, deal?.source);
  const doneIds = new Set(progress.map(p => p.stepId));
  // Resultado registrado por passo (o que o lead respondeu).
  const outcomeByStep = {};
  progress.forEach(p => { outcomeByStep[p.stepId] = p.outcome || ''; });
  // Data/hora agendada de cada passo — vem da atividade gerada na Agenda.
  // Da PENDENTE: uma vez concluida a tarefa, a data dela e passado.
  const dueByStep = {};
  activities.forEach(a => { if (a.stageStepId && !a.completed) dueByStep[a.stageStepId] = a.startDate; });
  // Quantas vezes ja se tentou este passo sem conseguir falar: tarefa concluida
  // cujo passo NAO foi marcado (concluir com "não atendeu" nao marca o passo).
  const attemptsByStep = {};
  activities.forEach(a => {
    if (a.stageStepId && a.completed) {
      attemptsByStep[a.stageStepId] = (attemptsByStep[a.stageStepId] || 0) + 1;
    }
  });
  const doneCount = steps.filter(s => doneIds.has(s.id)).length;
  // So avisa sobre origem quando ela REALMENTE muda o que aparece (etapa tem
  // passos por origem) e o lead nao tem origem definida.
  const hasSourceSteps = allSteps.some(s => s.sourceTag);
  const showSourceHint = hasSourceSteps && !deal?.source;

  // A etapa vem do deal carregado; o objetivo/criterio moram nela.
  const objetivo = deal?.stage?.objetivo || '';
  const exitCriteria = deal?.stage?.exitCriteria || '';

  // Proxima tarefa pendente: e pra ela que o botao "Executar na Agenda" leva
  // (abre a Agenda no dia certo, com o lead em foco). Sem data, cai no hoje.
  const nextDue = steps
    .filter(s => !doneIds.has(s.id) && dueByStep[s.id])
    .map(s => dueByStep[s.id])
    .sort((a, b) => new Date(a) - new Date(b))[0] || null;

  const goToAgenda = () => {
    const params = new URLSearchParams({ dealId: deal.id, view: 'day' });
    if (nextDue) params.set('date', new Date(nextDue).toISOString());
    navigate(`/crm/agenda?${params.toString()}`);
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
                outcome={outcomeByStep[step.id]}
                dueAt={dueByStep[step.id]}
                attempts={attemptsByStep[step.id] || 0}
                dadosScript={dadosScript}
              />
            ))}
          </div>

          {/* O check nao mora aqui: esta tela acompanha, a Agenda executa. */}
          {doneCount < steps.length && (
            <button
              type="button"
              onClick={goToAgenda}
              className="mt-3 w-full flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-sm font-semibold text-white bg-fyness-primary hover:bg-fyness-secondary"
            >
              <CalendarCheck size={15} /> Executar na Agenda
            </button>
          )}
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

    </div>
  );
}

export default DealProcessChecklist;
