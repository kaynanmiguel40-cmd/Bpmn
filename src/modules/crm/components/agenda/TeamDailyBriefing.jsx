/**
 * TeamDailyBriefing - Placar de atividade do time no PERIODO selecionado.
 *
 * Vive no Comparativo, dentro da secao "Time". Mostra quantas ligacoes,
 * mensagens, reunioes e contratos o time fez no periodo escolhido no filtro de
 * data do topo da pagina — nao tem mais toggle ontem/hoje, segue o periodo.
 *
 * Fonte dos numeros: crmDailyService.getDailyScoreboard (agrega qualquer range).
 * Obs: email manual nao entra (nao e registrado hoje).
 */

import {
  Phone, MessageCircle, Calendar, CheckCircle2, RefreshCw,
} from 'lucide-react';
import { CrmKpiCard } from '../ui';
import { useDailyScoreboard } from '../../hooks/useCrmQueries';

export function TeamDailyBriefing({ range, periodLabel, ownerId = null, ownerName = null }) {
  const startISO = range?.start || null;
  const endISO = range?.end || null;

  const { data, isLoading, isFetching, refetch } = useDailyScoreboard(startISO, endISO, ownerId);

  const totals = data?.totals || { calls: 0, atendidas: 0, naoAtendidas: 0, semDesfecho: 0, messages: 0, meetings: 0, tasks: 0, total: 0 };
  const scheduled = data?.scheduled || { calls: 0, messages: 0 };

  // Taxa de atendimento sobre o que TEM desfecho — incluir as "sem desfecho" no
  // denominador puniria o time por tarefa antiga que ninguem respondeu.
  const comDesfecho = (totals.atendidas || 0) + (totals.naoAtendidas || 0);
  const taxaAtendimento = comDesfecho ? Math.round((totals.atendidas / comDesfecho) * 100) : null;

  // Previsto vs real: o PREVISTO vem da AGENDA (atividades tipo call/message
  // agendadas no periodo); o REAL e o que o time fez. Badge verde quando o
  // real bate ou passa o previsto — mesma leitura Meta×Real do resto da pagina.
  const goalProps = (real, meta) => {
    if (!meta) return { subtitle: 'nada previsto na agenda' };
    const pct = Math.round((real / meta) * 100);
    return { subtitle: `${meta} previstas`, trend: { value: `${pct}%`, up: real >= meta } };
  };

  const cards = {
    calls: totals.calls,
    messages: totals.messages,
    meetings: totals.meetings,
    contracts: data?.day?.wonCount || 0,
  };

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
        <div>
          <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100">Placar do time</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Atividade no período{periodLabel ? ` · ${periodLabel}` : ''}{ownerName ? ` · ${ownerName}` : ' · time todo'}
          </p>
        </div>
        <button
          onClick={() => refetch()}
          title="Atualizar"
          className="p-2 rounded-xl text-slate-500 dark:text-slate-400 hover:bg-white/70 dark:hover:bg-white/5 transition-colors"
        >
          <RefreshCw size={18} className={isFetching ? 'animate-spin' : ''} />
        </button>
      </div>

      {/* Totais do periodo */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <CrmKpiCard title="Ligações" rawValue={cards.calls} icon={Phone} color="amber" loading={isLoading} {...goalProps(cards.calls, scheduled.calls)} />
        <CrmKpiCard title="Mensagens enviadas" rawValue={cards.messages} icon={MessageCircle} color="emerald" loading={isLoading} {...goalProps(cards.messages, scheduled.messages)} />
        <CrmKpiCard title="Reuniões agendadas" rawValue={cards.meetings} icon={Calendar} color="blue" loading={isLoading} />
        <CrmKpiCard title="Contratos fechados" rawValue={cards.contracts} icon={CheckCircle2} color="green" loading={isLoading} />
      </div>

      {/* Desfecho das ligações. Quebra o total do card acima: atendidas +
          não atendidas + sem desfecho = ligações. "Sem desfecho" fica visível de
          propósito — é tarefa antiga (ou tela que não perguntou) e some sozinho
          conforme o time conclui pelo modal, que exige a resposta. */}
      {!isLoading && cards.calls > 0 && (
        <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1.5 rounded-xl border border-slate-200/70 dark:border-slate-700/50 bg-white/50 dark:bg-white/5 px-3.5 py-2.5">
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
            Das {cards.calls} ligações:
          </span>
          <span className="inline-flex items-center gap-1.5 text-xs font-medium text-emerald-700 dark:text-emerald-400">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" aria-hidden="true" />
            {totals.atendidas} atendidas{taxaAtendimento !== null ? ` · ${taxaAtendimento}%` : ''}
          </span>
          <span className="inline-flex items-center gap-1.5 text-xs font-medium text-rose-700 dark:text-rose-400">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-500" aria-hidden="true" />
            {totals.naoAtendidas} não atendidas
          </span>
          {totals.semDesfecho > 0 && (
            <span className="inline-flex items-center gap-1.5 text-xs text-slate-400 dark:text-slate-500"
              title="Tarefas concluídas sem informar se falou com o lead — não entram na taxa.">
              <span className="w-1.5 h-1.5 rounded-full bg-slate-300 dark:bg-slate-600" aria-hidden="true" />
              {totals.semDesfecho} sem desfecho
            </span>
          )}
        </div>
      )}
    </div>
  );
}

export default TeamDailyBriefing;
