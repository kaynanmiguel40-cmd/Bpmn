/**
 * CrmReportsPage - Relatorios do CRM com dados reais.
 * Tabs: Vendas | Vendedores | Funil | Atividades.
 * (Forecast tem pagina dedicada em /crm/forecast)
 * Filtro de periodo com atalhos rapidos.
 */

import { useState, useMemo } from 'react';
import {
  DollarSign, BarChart3, CalendarCheck, TrendingUp,
  Clock, Target, CheckCircle, XCircle, Phone, Mail, Video,
  MapPin, FileText, Coffee, ChevronRight, Trophy,
  User,
} from 'lucide-react';
import { CrmPageHeader, CrmBadge } from '../components/ui';
import {
  useSalesReport, useFunnelReport, useActivitiesReport, useCrmPipelines,
  useSellersReport,
} from '../hooks/useCrmQueries';

// ==================== HELPERS ====================

const formatCurrency = (val) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(val || 0);

const formatDate = (d) => d ? new Date(d).toLocaleDateString('pt-BR') : '—';

function getMonthRange(offset = 0) {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth() + offset, 1);
  const end = new Date(now.getFullYear(), now.getMonth() + offset + 1, 0);
  return {
    start: start.toISOString().split('T')[0],
    end: end.toISOString().split('T')[0],
  };
}

function getQuarterRange() {
  const now = new Date();
  const qStart = Math.floor(now.getMonth() / 3) * 3;
  const start = new Date(now.getFullYear(), qStart, 1);
  const end = new Date(now.getFullYear(), qStart + 3, 0);
  return {
    start: start.toISOString().split('T')[0],
    end: end.toISOString().split('T')[0],
  };
}

const PERIOD_PRESETS = [
  { label: 'Este mes', fn: () => getMonthRange(0) },
  { label: 'Mes passado', fn: () => getMonthRange(-1) },
  { label: 'Trimestre', fn: () => getQuarterRange() },
  { label: 'Ultimos 90d', fn: () => {
    const end = new Date();
    const start = new Date(end);
    start.setDate(start.getDate() - 90);
    return { start: start.toISOString().split('T')[0], end: end.toISOString().split('T')[0] };
  }},
];

const TABS = [
  { key: 'sales', label: 'Vendas', icon: DollarSign },
  { key: 'sellers', label: 'Vendedores', icon: User },
  { key: 'funnel', label: 'Funil', icon: BarChart3 },
  { key: 'activities', label: 'Atividades', icon: CalendarCheck },
];

const TYPE_ICONS = {
  call: Phone,
  email: Mail,
  meeting: Video,
  visit: MapPin,
  task: FileText,
  follow_up: Coffee,
};

const TYPE_LABELS = {
  call: 'Ligacao',
  email: 'Email',
  meeting: 'Reuniao',
  visit: 'Visita',
  task: 'Tarefa',
  follow_up: 'Follow-up',
};

const TYPE_COLORS = {
  call: 'bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400',
  email: 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400',
  meeting: 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400',
  visit: 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400',
  task: 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400',
  follow_up: 'bg-violet-50 dark:bg-violet-900/20 text-violet-600 dark:text-violet-400',
};

const DAY_LABELS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sab'];

// ==================== KPI CARD ====================

function KpiCard({ icon: Icon, iconClass, label, value, sub }) {
  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700/50 p-4">
      <div className="flex items-center gap-2 mb-2">
        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${iconClass}`}>
          <Icon size={16} />
        </div>
        <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">{label}</span>
      </div>
      <div className="text-xl font-bold text-slate-800 dark:text-slate-100">{value}</div>
      {sub && <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{sub}</div>}
    </div>
  );
}

// ==================== SKELETON ====================

function ReportSkeleton() {
  return (
    <div className="animate-pulse space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700/50 p-4">
            <div className="h-4 w-20 bg-slate-200 dark:bg-slate-700 rounded mb-3" />
            <div className="h-6 w-28 bg-slate-200 dark:bg-slate-700 rounded" />
          </div>
        ))}
      </div>
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700/50 p-6">
        <div className="h-5 w-40 bg-slate-200 dark:bg-slate-700 rounded mb-4" />
        <div className="space-y-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-10 bg-slate-100 dark:bg-slate-800 rounded" />
          ))}
        </div>
      </div>
    </div>
  );
}

// ==================== SALES TAB ====================

function SalesTab({ startDate, endDate }) {
  const { data: report, isLoading } = useSalesReport(startDate, endDate);

  if (isLoading) return <ReportSkeleton />;
  if (!report) return <EmptyReport message="Nao foi possivel gerar o relatorio de vendas." />;

  return (
    <div className="space-y-4">
      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        <KpiCard icon={Trophy} iconClass="bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400"
          label="Ganhos" value={report.won.count}
          sub={formatCurrency(report.won.totalValue)} />
        <KpiCard icon={XCircle} iconClass="bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400"
          label="Perdidos" value={report.lost.count}
          sub={formatCurrency(report.lost.totalValue)} />
        <KpiCard icon={Target} iconClass="bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400"
          label="Em Aberto" value={report.open.count} />
        <KpiCard icon={DollarSign} iconClass="bg-violet-50 dark:bg-violet-900/20 text-violet-600 dark:text-violet-400"
          label="Ticket Medio" value={formatCurrency(report.avgDealValue)} />
        <KpiCard icon={Clock} iconClass="bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400"
          label="Tempo Medio" value={`${report.avgCloseTimeDays}d`}
          sub="para fechar" />
        <KpiCard icon={TrendingUp} iconClass="bg-cyan-50 dark:bg-cyan-900/20 text-cyan-600 dark:text-cyan-400"
          label="Conversao" value={`${report.conversionRate}%`}
          sub={`${report.won.count + report.lost.count} fechados`} />
      </div>

      {/* Barra visual ganhos vs perdidos */}
      {(report.won.count + report.lost.count) > 0 && (
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700/50 p-5">
          <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">Ganhos vs Perdidos</h4>
          <div className="flex h-6 rounded-full overflow-hidden bg-slate-200 dark:bg-slate-700">
            {report.won.count > 0 && (
              <div
                className="bg-emerald-500 flex items-center justify-center text-[10px] font-bold text-white transition-all"
                style={{ width: `${report.conversionRate}%` }}
              >
                {report.conversionRate >= 15 && `${report.won.count} ganhos`}
              </div>
            )}
            {report.lost.count > 0 && (
              <div
                className="bg-rose-500 flex items-center justify-center text-[10px] font-bold text-white transition-all"
                style={{ width: `${100 - report.conversionRate}%` }}
              >
                {(100 - report.conversionRate) >= 15 && `${report.lost.count} perdidos`}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Deals ganhos */}
      {report.wonDeals && report.wonDeals.length > 0 && (
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700/50 p-5">
          <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">
            Negocios Ganhos ({report.wonDeals.length})
          </h4>
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {report.wonDeals.map(deal => (
              <div key={deal.id} className="flex items-center justify-between py-2.5">
                <div className="min-w-0">
                  <div className="text-sm font-medium text-slate-800 dark:text-slate-200 truncate">{deal.title}</div>
                  <div className="text-xs text-slate-400">{formatDate(deal.closedAt)}</div>
                </div>
                <span className="text-sm font-semibold text-emerald-600 dark:text-emerald-400 shrink-0 ml-3">
                  {formatCurrency(deal.value)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Perdidos por Motivo */}
      {report.lostReasons && report.lostReasons.length > 0 && (
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700/50 p-5">
          <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">
            Perdidos por Motivo ({report.lost.count})
          </h4>
          <div className="space-y-2.5">
            {report.lostReasons.map(({ reason, count, totalValue }) => {
              const pct = report.lost.count > 0 ? Math.round((count / report.lost.count) * 100) : 0;
              return (
                <div key={reason} className="flex items-center gap-3">
                  <div className="w-32 shrink-0 text-right">
                    <span className="text-xs font-medium text-slate-700 dark:text-slate-300 truncate">{reason}</span>
                  </div>
                  <div className="flex-1 h-5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-rose-500 rounded-full flex items-center px-2 transition-all"
                      style={{ width: `${Math.max(pct, 5)}%`, minWidth: '30px' }}
                    >
                      <span className="text-[10px] font-bold text-white">{count}</span>
                    </div>
                  </div>
                  <div className="w-20 shrink-0 text-right">
                    <span className="text-xs font-medium text-rose-500">{pct}%</span>
                  </div>
                  <div className="w-24 shrink-0 text-right">
                    <span className="text-xs text-slate-500 dark:text-slate-400">{formatCurrency(totalValue)}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {report.won.count === 0 && report.lost.count === 0 && (
        <EmptyReport message="Nenhum deal fechado neste periodo." />
      )}
    </div>
  );
}

// ==================== SELLERS TAB ====================

function SellersTab({ startDate, endDate }) {
  const { data: report, isLoading } = useSellersReport(startDate, endDate);

  if (isLoading) return <ReportSkeleton />;
  if (!report || !report.sellers?.length) return <EmptyReport message="Nenhum vendedor com deals neste periodo." />;

  const maxValue = Math.max(...report.sellers.map(s => s.totalWonValue), 1);

  return (
    <div className="space-y-4">
      {/* Tabela comparativa */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700/50 overflow-hidden">
        <div className="px-5 py-3 border-b border-slate-200 dark:border-slate-700/50">
          <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-300">Desempenho por Vendedor</h4>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/30 text-[10px] uppercase tracking-wider text-slate-400 font-medium">
                <th className="text-left px-4 py-2.5">Vendedor</th>
                <th className="text-center px-3 py-2.5">Abertos</th>
                <th className="text-center px-3 py-2.5">Ganhos</th>
                <th className="text-center px-3 py-2.5">Perdidos</th>
                <th className="text-right px-3 py-2.5">Valor Ganho</th>
                <th className="text-right px-3 py-2.5">Ticket Medio</th>
                <th className="text-center px-3 py-2.5">Conversao</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {report.sellers.map((seller) => (
                <tr key={seller.uid} className="hover:bg-slate-50 dark:hover:bg-slate-800/30">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: seller.color }} />
                      <span className="font-medium text-slate-800 dark:text-slate-200">{seller.name}</span>
                    </div>
                  </td>
                  <td className="text-center px-3 py-3 text-slate-600 dark:text-slate-400">{seller.open}</td>
                  <td className="text-center px-3 py-3">
                    <span className="text-emerald-600 dark:text-emerald-400 font-medium">{seller.won}</span>
                  </td>
                  <td className="text-center px-3 py-3">
                    <span className="text-rose-600 dark:text-rose-400 font-medium">{seller.lost}</span>
                  </td>
                  <td className="text-right px-3 py-3 font-semibold text-slate-800 dark:text-slate-200">
                    {formatCurrency(seller.totalWonValue)}
                  </td>
                  <td className="text-right px-3 py-3 text-slate-600 dark:text-slate-400">
                    {formatCurrency(seller.avgTicket)}
                  </td>
                  <td className="text-center px-3 py-3">
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                      seller.conversionRate >= 60 ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400'
                      : seller.conversionRate >= 30 ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400'
                      : 'bg-rose-100 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400'
                    }`}>
                      {seller.conversionRate}%
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Grafico de barras: receita por vendedor */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700/50 p-5">
        <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-4">Receita por Vendedor</h4>
        <div className="space-y-3">
          {report.sellers.map((seller) => {
            const pct = maxValue > 0 ? Math.max(3, Math.round((seller.totalWonValue / maxValue) * 100)) : 3;
            return (
              <div key={seller.uid} className="flex items-center gap-3">
                <div className="w-28 shrink-0 flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: seller.color }} />
                  <span className="text-xs font-medium text-slate-700 dark:text-slate-300 truncate">{seller.name}</span>
                </div>
                <div className="flex-1 h-7 bg-slate-100 dark:bg-slate-800 rounded-lg overflow-hidden">
                  <div
                    className="h-full rounded-lg flex items-center px-2 transition-all"
                    style={{ width: `${pct}%`, backgroundColor: seller.color || '#6366f1' }}
                  >
                    {pct > 20 && (
                      <span className="text-[10px] font-bold text-white whitespace-nowrap">{formatCurrency(seller.totalWonValue)}</span>
                    )}
                  </div>
                </div>
                {pct <= 20 && (
                  <span className="text-xs font-medium text-slate-600 dark:text-slate-400 w-24 text-right shrink-0">
                    {formatCurrency(seller.totalWonValue)}
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ==================== FUNNEL TAB ====================

function FunnelTab({ pipelineId }) {
  const { data: report, isLoading } = useFunnelReport(pipelineId);

  if (!pipelineId) {
    return <EmptyReport message="Selecione um pipeline acima para ver o funil." />;
  }
  if (isLoading) return <ReportSkeleton />;
  if (!report) return <EmptyReport message="Nao foi possivel gerar o relatorio de funil." />;

  const maxCount = Math.max(...(report.stages || []).map(s => s.count), 1);

  return (
    <div className="space-y-4">
      {/* KPIs do funil */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        <KpiCard icon={Target} iconClass="bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400"
          label="Deals no Funil" value={report.totalDeals} />
        <KpiCard icon={DollarSign} iconClass="bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400"
          label="Valor Total" value={formatCurrency(report.totalValue)} />
        <KpiCard icon={BarChart3} iconClass="bg-violet-50 dark:bg-violet-900/20 text-violet-600 dark:text-violet-400"
          label="Etapas" value={report.stages?.length || 0} />
      </div>

      {/* Funil visual */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700/50 p-5">
        <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-4">Funil de Conversao</h4>
        <div className="space-y-2">
          {(report.stages || []).map((stage, idx) => {
            const widthPercent = maxCount > 0 ? Math.max(8, (stage.count / maxCount) * 100) : 8;
            const convRate = report.conversionRates?.[idx];

            return (
              <div key={stage.name}>
                {/* Barra da etapa */}
                <div className="flex items-center gap-3">
                  <div className="w-28 shrink-0 text-right">
                    <span className="text-xs font-medium text-slate-700 dark:text-slate-300">{stage.name}</span>
                  </div>
                  <div className="flex-1">
                    <div
                      className="h-9 rounded-lg flex items-center px-3 transition-all"
                      style={{
                        width: `${widthPercent}%`,
                        backgroundColor: stage.color || '#6366f1',
                        minWidth: '60px',
                      }}
                    >
                      <span className="text-xs font-bold text-white whitespace-nowrap">
                        {stage.count} deal{stage.count !== 1 ? 's' : ''}
                      </span>
                    </div>
                  </div>
                  <div className="w-24 shrink-0 text-right">
                    <span className="text-xs font-medium text-slate-600 dark:text-slate-400">
                      {formatCurrency(stage.totalValue)}
                    </span>
                  </div>
                </div>

                {/* Taxa de conversao entre etapas */}
                {convRate && idx > 0 && (
                  <div className="flex items-center gap-3 ml-28 pl-3 py-0.5">
                    <div className="flex items-center gap-1 text-[10px] text-slate-400">
                      <ChevronRight size={10} />
                      <span className={convRate.rate >= 50 ? 'text-emerald-500 font-medium' : convRate.rate >= 25 ? 'text-amber-500 font-medium' : 'text-rose-500 font-medium'}>
                        {convRate.rate}%
                      </span>
                      <span>de conversao</span>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {report.totalDeals === 0 && (
        <EmptyReport message="Nenhum deal aberto neste pipeline." />
      )}
    </div>
  );
}

// ==================== ACTIVITIES TAB ====================

function ActivitiesTab({ startDate, endDate }) {
  const { data: report, isLoading } = useActivitiesReport(startDate, endDate);

  if (isLoading) return <ReportSkeleton />;
  if (!report) return <EmptyReport message="Nao foi possivel gerar o relatorio de atividades." />;

  const typeEntries = Object.entries(report.byType || {});
  const maxTypeCount = Math.max(...typeEntries.map(([, v]) => v.total), 1);
  const maxDayCount = Math.max(...(report.byDayOfWeek || []), 1);

  return (
    <div className="space-y-4">
      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <KpiCard icon={CalendarCheck} iconClass="bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400"
          label="Total" value={report.total} />
        <KpiCard icon={CheckCircle} iconClass="bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400"
          label="Concluidas" value={report.completed} />
        <KpiCard icon={Clock} iconClass="bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400"
          label="Pendentes" value={report.pending} />
        <KpiCard icon={TrendingUp} iconClass="bg-violet-50 dark:bg-violet-900/20 text-violet-600 dark:text-violet-400"
          label="Taxa de Conclusao" value={`${report.completionRate}%`} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Por tipo */}
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700/50 p-5">
          <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-4">Por Tipo</h4>
          {typeEntries.length === 0 ? (
            <p className="text-xs text-slate-400">Nenhuma atividade registrada.</p>
          ) : (
            <div className="space-y-3">
              {typeEntries.map(([type, data]) => {
                const Icon = TYPE_ICONS[type] || CalendarCheck;
                const widthPercent = Math.max(8, (data.total / maxTypeCount) * 100);
                const completionRate = data.total > 0 ? Math.round((data.completed / data.total) * 100) : 0;

                return (
                  <div key={type} className="flex items-center gap-3">
                    <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${TYPE_COLORS[type] || TYPE_COLORS.task}`}>
                      <Icon size={14} />
                    </div>
                    <div className="w-20 shrink-0">
                      <span className="text-xs font-medium text-slate-700 dark:text-slate-300">
                        {TYPE_LABELS[type] || type}
                      </span>
                    </div>
                    <div className="flex-1">
                      <div className="h-5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-blue-500 rounded-full flex items-center px-2 transition-all"
                          style={{ width: `${widthPercent}%`, minWidth: '30px' }}
                        >
                          <span className="text-[10px] font-bold text-white">{data.total}</span>
                        </div>
                      </div>
                    </div>
                    <div className="w-16 shrink-0 text-right">
                      <span className={`text-[11px] font-medium ${completionRate >= 80 ? 'text-emerald-500' : completionRate >= 50 ? 'text-amber-500' : 'text-slate-400'}`}>
                        {completionRate}% feito
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Por dia da semana */}
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700/50 p-5">
          <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-4">Por Dia da Semana</h4>
          <div className="flex items-end gap-2 h-32">
            {(report.byDayOfWeek || []).map((count, idx) => {
              const heightPercent = maxDayCount > 0 ? Math.max(4, (count / maxDayCount) * 100) : 4;
              const isWeekend = idx === 0 || idx === 6;

              return (
                <div key={idx} className="flex-1 flex flex-col items-center gap-1">
                  <span className="text-[10px] font-medium text-slate-500 dark:text-slate-400">{count}</span>
                  <div
                    className={`w-full rounded-t-md transition-all ${isWeekend ? 'bg-slate-300 dark:bg-slate-600' : 'bg-blue-500 dark:bg-blue-400'}`}
                    style={{ height: `${heightPercent}%`, minHeight: '4px' }}
                  />
                  <span className={`text-[10px] ${isWeekend ? 'text-slate-400' : 'text-slate-600 dark:text-slate-300'}`}>
                    {DAY_LABELS[idx]}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Por vendedor */}
      {report.byOwner && report.byOwner.length > 0 && (
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700/50 overflow-hidden">
          <div className="px-5 py-3 border-b border-slate-200 dark:border-slate-700/50">
            <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-300">Atividades por Vendedor</h4>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-800/30 text-[10px] uppercase tracking-wider text-slate-400 font-medium">
                  <th className="text-left px-4 py-2.5">Vendedor</th>
                  <th className="text-center px-3 py-2.5">Total</th>
                  <th className="text-center px-3 py-2.5">Concluidas</th>
                  <th className="text-center px-3 py-2.5">Pendentes</th>
                  <th className="text-center px-3 py-2.5">Conclusao</th>
                  <th className="text-left px-3 py-2.5">Tipos</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {report.byOwner.map((owner) => (
                  <tr key={owner.uid} className="hover:bg-slate-50 dark:hover:bg-slate-800/30">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: owner.color }} />
                        <span className="font-medium text-slate-800 dark:text-slate-200">{owner.name}</span>
                      </div>
                    </td>
                    <td className="text-center px-3 py-3 font-medium text-slate-700 dark:text-slate-300">{owner.total}</td>
                    <td className="text-center px-3 py-3">
                      <span className="text-emerald-600 dark:text-emerald-400 font-medium">{owner.completed}</span>
                    </td>
                    <td className="text-center px-3 py-3">
                      <span className="text-amber-600 dark:text-amber-400 font-medium">{owner.pending}</span>
                    </td>
                    <td className="text-center px-3 py-3">
                      <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                        owner.completionRate >= 80 ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400'
                        : owner.completionRate >= 50 ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400'
                        : 'bg-rose-100 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400'
                      }`}>
                        {owner.completionRate}%
                      </span>
                    </td>
                    <td className="px-3 py-3">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {Object.entries(owner.byType).map(([type, count]) => {
                          const Icon = TYPE_ICONS[type] || CalendarCheck;
                          return (
                            <span key={type} className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium ${TYPE_COLORS[type] || TYPE_COLORS.task}`}>
                              <Icon size={10} />
                              {count}
                            </span>
                          );
                        })}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {report.total === 0 && (
        <EmptyReport message="Nenhuma atividade registrada neste periodo." />
      )}
    </div>
  );
}

// ==================== FORECAST TAB ====================

// ==================== EMPTY STATE ====================

function EmptyReport({ message }) {
  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl border border-dashed border-slate-300 dark:border-slate-700 p-8 text-center">
      <BarChart3 size={32} className="mx-auto text-slate-300 dark:text-slate-600 mb-2" />
      <p className="text-sm text-slate-500 dark:text-slate-400">{message}</p>
    </div>
  );
}

// ==================== MAIN COMPONENT ====================

export function CrmReportsPage() {
  const [activeTab, setActiveTab] = useState('sales');

  // Periodo
  const defaultPeriod = getMonthRange(0);
  const [startDate, setStartDate] = useState(defaultPeriod.start);
  const [endDate, setEndDate] = useState(defaultPeriod.end);
  const [activePreset, setActivePreset] = useState(0);

  // Pipeline (para funil)
  const { data: pipelines = [] } = useCrmPipelines();
  const [selectedPipeline, setSelectedPipeline] = useState('');

  // Auto-selecionar primeiro pipeline
  const pipelineId = selectedPipeline || (pipelines.length > 0 ? pipelines[0]?.id : '');

  const handlePreset = (idx) => {
    const range = PERIOD_PRESETS[idx].fn();
    setStartDate(range.start);
    setEndDate(range.end);
    setActivePreset(idx);
  };

  const handleDateChange = (field, value) => {
    if (field === 'start') setStartDate(value);
    else setEndDate(value);
    setActivePreset(-1);
  };

  return (
    <div className="space-y-5">
      <CrmPageHeader
        title="Relatorios"
        subtitle="Analises e metricas do CRM"
      />

      {/* Tabs */}
      <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800/50 rounded-lg w-fit">
        {TABS.map(tab => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-1.5 px-4 py-1.5 text-sm font-medium rounded-md transition-all ${
                activeTab === tab.key
                  ? 'bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-200 shadow-sm'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'
              }`}
            >
              <Icon size={14} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Filtros */}
      <div className="flex items-center gap-3 flex-wrap p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700/50">
        {/* Presets (vendas, atividades e forecast) */}
        {activeTab !== 'funnel' && (
          <>
            <div className="flex items-center gap-1">
              {PERIOD_PRESETS.map((preset, idx) => (
                <button
                  key={idx}
                  onClick={() => handlePreset(idx)}
                  className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors ${
                    activePreset === idx
                      ? 'bg-fyness-primary text-white'
                      : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700'
                  }`}
                >
                  {preset.label}
                </button>
              ))}
            </div>

            <div className="w-px h-6 bg-slate-200 dark:bg-slate-700" />

            <div className="flex items-center gap-2">
              <input
                type="date"
                value={startDate}
                onChange={(e) => handleDateChange('start', e.target.value)}
                className="px-2.5 py-1 text-xs rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 focus:ring-2 focus:ring-fyness-primary focus:outline-none"
              />
              <span className="text-xs text-slate-400">ate</span>
              <input
                type="date"
                value={endDate}
                onChange={(e) => handleDateChange('end', e.target.value)}
                className="px-2.5 py-1 text-xs rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 focus:ring-2 focus:ring-fyness-primary focus:outline-none"
              />
            </div>
          </>
        )}

        {/* Pipeline selector (funil) */}
        {activeTab === 'funnel' && (
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500 dark:text-slate-400">Pipeline:</span>
            <select
              value={pipelineId}
              onChange={(e) => setSelectedPipeline(e.target.value)}
              className="px-3 py-1.5 text-xs rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 focus:ring-2 focus:ring-fyness-primary focus:outline-none"
            >
              {pipelines.map(p => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Content */}
      {activeTab === 'sales' && <SalesTab startDate={startDate} endDate={endDate} />}
      {activeTab === 'sellers' && <SellersTab startDate={startDate} endDate={endDate} />}
      {activeTab === 'funnel' && <FunnelTab pipelineId={pipelineId} />}
      {activeTab === 'activities' && <ActivitiesTab startDate={startDate} endDate={endDate} />}
    </div>
  );
}

export default CrmReportsPage;
