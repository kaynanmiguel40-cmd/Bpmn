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

  const totals = data?.totals || { calls: 0, messages: 0, meetings: 0, tasks: 0, total: 0 };
  const scheduled = data?.scheduled || { calls: 0, messages: 0 };

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
    </div>
  );
}

export default TeamDailyBriefing;
