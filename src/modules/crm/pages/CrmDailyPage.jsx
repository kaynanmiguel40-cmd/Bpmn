/**
 * CrmDailyPage - Placar de atividade do time pra reuniao de manha (daily).
 *
 * Uma tela so: abra e apresente. Mostra por vendedor quantas ligacoes,
 * mensagens (WhatsApp), reunioes e tarefas foram feitas no dia, com
 * toggle Ontem/Hoje. Embaixo, contexto do mes (fechado / no pipe).
 *
 * Fonte dos numeros: crmDailyService.getDailyScoreboard.
 * Obs: email manual nao entra (nao e registrado hoje).
 */

import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  Phone, MessageCircle, Calendar, CheckCircle2,
  RefreshCw, DollarSign, Layers,
  Target, AlertTriangle, ArrowRight, Sun,
} from 'lucide-react';
import { CrmPageHeader, CrmKpiCard } from '../components/ui';
import { useDailyScoreboard, useDailyBriefing } from '../hooks/useCrmQueries';

const formatCurrency = (val) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(val || 0);

const formatLongDate = (d) =>
  d.toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: 'long' });

const TYPE_DOT = {
  call: 'bg-amber-500', email: 'bg-indigo-500', meeting: 'bg-blue-500',
  visit: 'bg-emerald-500', task: 'bg-slate-400', follow_up: 'bg-violet-500', lunch: 'bg-rose-500',
};

// Item de atividade (linha da agenda "Hoje o time precisa")
function AgendaItem({ item, overdue }) {
  return (
    <div className="flex items-center gap-3 px-4 py-2.5 hover:bg-white/40 dark:hover:bg-white/5 transition-colors">
      <span className={`w-2 h-2 rounded-full shrink-0 ${TYPE_DOT[item.type] || 'bg-slate-400'}`} />
      <div className="min-w-0 flex-1">
        <div className="text-sm font-medium text-slate-800 dark:text-slate-100 truncate">
          <span className="text-slate-400 dark:text-slate-500 font-normal">{item.typeLabel} · </span>
          {item.title}
        </div>
        <div className="text-[11px] text-slate-400 dark:text-slate-500 truncate">
          {item.contactName || item.dealTitle || 'Sem vínculo'}
        </div>
      </div>
      <span
        className="shrink-0 inline-flex items-center gap-1.5 text-[11px] font-medium text-slate-500 dark:text-slate-400"
        title={item.ownerName}
      >
        <span
          className="w-5 h-5 rounded-full flex items-center justify-center text-white text-[10px] font-bold"
          style={{ backgroundColor: item.ownerColor }}
        >
          {item.ownerName.charAt(0).toUpperCase()}
        </span>
        <span className="hidden sm:inline max-w-[80px] truncate">{item.ownerName.split(' ')[0]}</span>
      </span>
      {overdue && (
        <span className="shrink-0 text-[10px] font-semibold text-rose-600 dark:text-rose-400 uppercase">
          {Math.max(1, Math.round((Date.now() - new Date(item.startDate)) / 86400000))}d
        </span>
      )}
    </div>
  );
}

function dayBounds(offset) {
  const start = new Date();
  start.setDate(start.getDate() + offset);
  start.setHours(0, 0, 0, 0);
  const end = new Date(start);
  end.setDate(end.getDate() + 1);
  return { startISO: start.toISOString(), endISO: end.toISOString(), refDate: start };
}

function ToggleButton({ active, onClick, children }) {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-1.5 text-sm font-semibold rounded-lg transition-colors ${
        active
          ? 'bg-fyness-primary text-white shadow-sm'
          : 'text-slate-600 dark:text-slate-300 hover:bg-white/70 dark:hover:bg-white/5'
      }`}
    >
      {children}
    </button>
  );
}

export default function CrmDailyPage() {
  // -1 = ontem (default, dia fechado pra cobrar de manha) | 0 = hoje
  const [offset, setOffset] = useState(-1);
  const { startISO, endISO, refDate } = useMemo(() => dayBounds(offset), [offset]);

  const { data, isLoading, isFetching, refetch } = useDailyScoreboard(startISO, endISO);
  const { data: briefing, isLoading: briefingLoading, refetch: refetchBriefing } = useDailyBriefing();

  const totals = data?.totals || { calls: 0, messages: 0, meetings: 0, tasks: 0, total: 0 };
  const month = data?.month || { wonValue: 0, wonCount: 0, openValue: 0, openCount: 0 };

  const agendaToday = briefing?.agenda?.today || [];
  const agendaOverdue = briefing?.agenda?.overdue || [];
  const goal = briefing?.goal || { hasGoal: false, target: 0, current: 0, pct: 0 };

  // Briefing ("hoje o time precisa") so faz sentido olhando pro dia atual
  const isYesterday = offset === -1;
  const cards = {
    calls: totals.calls,
    messages: totals.messages,
    meetings: totals.meetings,
    contracts: data?.day?.wonCount || 0,
  };
  const pipe = { value: month.openValue, subtitle: `${month.openCount} ${month.openCount === 1 ? 'negócio aberto' : 'negócios abertos'}` };
  const closed = { value: month.wonValue, subtitle: `${month.wonCount} ${month.wonCount === 1 ? 'negócio ganho' : 'negócios ganhos'}` };
  const goalView = goal;

  return (
    <div className="max-w-6xl mx-auto">
      <CrmPageHeader
        title="Daily do Time"
        subtitle={`Atividade de ${offset === -1 ? 'ontem' : 'hoje'} — ${formatLongDate(refDate)}`}
        actions={
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1 p-1 rounded-xl bg-slate-100/80 dark:bg-slate-800/60">
              <ToggleButton active={offset === -1} onClick={() => setOffset(-1)}>Ontem</ToggleButton>
              <ToggleButton active={offset === 0} onClick={() => setOffset(0)}>Hoje</ToggleButton>
            </div>
            <button
              onClick={() => { refetch(); refetchBriefing(); }}
              title="Atualizar"
              className="p-2 rounded-xl text-slate-500 dark:text-slate-400 hover:bg-white/70 dark:hover:bg-white/5 transition-colors"
            >
              <RefreshCw size={18} className={isFetching ? 'animate-spin' : ''} />
            </button>
          </div>
        }
      />

      {/* Totais do dia */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        <CrmKpiCard title="Ligações" rawValue={cards.calls} icon={Phone} color="amber" loading={isLoading} />
        <CrmKpiCard title="Mensagens enviadas" rawValue={cards.messages} icon={MessageCircle} color="emerald" loading={isLoading} />
        <CrmKpiCard title="Reuniões agendadas" rawValue={cards.meetings} icon={Calendar} color="blue" loading={isLoading} />
        <CrmKpiCard title="Contratos fechados" rawValue={cards.contracts} icon={CheckCircle2} color="green" loading={isLoading} />
      </div>

      {/* Meta x realizado do mes */}
      <div className="crm-glass rounded-2xl p-5 mb-6">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Target size={18} className="text-fyness-primary" />
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100">
              Meta do mês {goalView.hasGoal && goalView.title ? <span className="font-normal text-slate-400">· {goalView.title}</span> : null}
            </h3>
          </div>
          {goalView.hasGoal && (
            <span className="text-sm font-bold tnum text-slate-900 dark:text-white">{goalView.pct}%</span>
          )}
        </div>

        {briefingLoading && !isYesterday ? (
          <div className="h-9 bg-slate-100 dark:bg-slate-800/60 rounded-lg animate-pulse" />
        ) : goalView.hasGoal ? (
          <>
            <div className="h-3 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
              <div
                className={`h-full rounded-full transition-all ${goalView.pct >= 100 ? 'bg-emerald-500' : 'bg-fyness-primary'}`}
                style={{ width: `${goalView.pct}%` }}
              />
            </div>
            <div className="flex items-center justify-between mt-2 text-sm">
              <span className="font-semibold text-slate-700 dark:text-slate-200">{formatCurrency(goalView.current)}</span>
              <span className="text-slate-400 dark:text-slate-500">
                {goalView.current >= goalView.target
                  ? 'meta batida 🎉'
                  : `faltam ${formatCurrency(goalView.target - goalView.current)}`}
                {' · meta '}{formatCurrency(goalView.target)}
              </span>
            </div>
          </>
        ) : (
          <div className="flex items-center justify-between gap-3 text-sm">
            <span className="text-slate-500 dark:text-slate-400">
              Nenhuma meta global definida — já fechou <strong className="text-slate-700 dark:text-slate-200">{formatCurrency(goalView.current)}</strong> no mês.
            </span>
            <Link to="/crm/goals" className="shrink-0 inline-flex items-center gap-1 text-fyness-primary font-semibold hover:underline">
              Definir meta <ArrowRight size={14} />
            </Link>
          </div>
        )}
      </div>

      {/* Hoje o time precisa: agenda + atrasados (oculto na visao Ontem/apresentacao) */}
      {!isYesterday && (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
        {/* Pra hoje */}
        <div className="crm-glass rounded-2xl overflow-hidden">
          <div className="flex items-center gap-2 px-5 py-4 border-b border-white/60 dark:border-white/10">
            <Sun size={18} className="text-amber-500" />
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100">Agendado pra hoje</h3>
            <span className="ml-auto text-xs font-semibold text-slate-400 dark:text-slate-500 tnum">{agendaToday.length}</span>
          </div>
          {briefingLoading ? (
            <div className="p-5 space-y-2">{[0, 1].map(i => <div key={i} className="h-9 bg-slate-100 dark:bg-slate-800/60 rounded-lg animate-pulse" />)}</div>
          ) : agendaToday.length === 0 ? (
            <div className="px-5 py-8 text-center text-sm text-slate-400 dark:text-slate-500">Nada agendado pra hoje.</div>
          ) : (
            <div className="divide-y divide-white/40 dark:divide-white/5 max-h-80 overflow-y-auto">
              {agendaToday.map(item => <AgendaItem key={item.id} item={item} />)}
            </div>
          )}
        </div>

        {/* Atrasados */}
        <div className={`crm-glass rounded-2xl overflow-hidden ${agendaOverdue.length > 0 ? 'ring-1 ring-rose-400/40' : ''}`}>
          <div className="flex items-center gap-2 px-5 py-4 border-b border-white/60 dark:border-white/10">
            <AlertTriangle size={18} className={agendaOverdue.length > 0 ? 'text-rose-500' : 'text-slate-400'} />
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100">Atrasados</h3>
            <span className={`ml-auto text-xs font-bold tnum ${agendaOverdue.length > 0 ? 'text-rose-600 dark:text-rose-400' : 'text-slate-400'}`}>{agendaOverdue.length}</span>
          </div>
          {briefingLoading ? (
            <div className="p-5 space-y-2">{[0, 1].map(i => <div key={i} className="h-9 bg-slate-100 dark:bg-slate-800/60 rounded-lg animate-pulse" />)}</div>
          ) : agendaOverdue.length === 0 ? (
            <div className="px-5 py-8 text-center text-sm text-slate-400 dark:text-slate-500">Nada atrasado. Time em dia 👏</div>
          ) : (
            <div className="divide-y divide-white/40 dark:divide-white/5 max-h-80 overflow-y-auto">
              {agendaOverdue.map(item => <AgendaItem key={item.id} item={item} overdue />)}
            </div>
          )}
        </div>
      </div>
      )}

      {/* Contexto do mes */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <CrmKpiCard
          title="Fechado no mês"
          rawValue={closed.value}
          format={formatCurrency}
          subtitle={closed.subtitle}
          icon={DollarSign}
          color="green"
          loading={isLoading}
        />
        <CrmKpiCard
          title="No pipe (em aberto)"
          rawValue={pipe.value}
          format={formatCurrency}
          subtitle={pipe.subtitle}
          icon={Layers}
          color="sky"
          loading={isLoading}
        />
      </div>
    </div>
  );
}
