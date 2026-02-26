/**
 * CrmReportsPage - Relatorios do CRM.
 * Placeholder com cards para cada tipo de relatorio.
 */

import { BarChart3, TrendingUp, Funnel, CalendarCheck, DollarSign } from 'lucide-react';
import { CrmPageHeader } from '../components/ui';

const reports = [
  {
    title: 'Relatorio de Vendas',
    description: 'Deals ganhos, perdidos, ticket medio e tempo de fechamento.',
    icon: DollarSign,
    color: 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400',
  },
  {
    title: 'Relatorio de Funil',
    description: 'Analise de conversao entre etapas do pipeline.',
    icon: BarChart3,
    color: 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400',
  },
  {
    title: 'Forecast',
    description: 'Previsao de receita ponderada por probabilidade.',
    icon: TrendingUp,
    color: 'bg-violet-50 dark:bg-violet-900/20 text-violet-600 dark:text-violet-400',
  },
  {
    title: 'Relatorio de Atividades',
    description: 'Volume de ligacoes, reunioes e tarefas por periodo.',
    icon: CalendarCheck,
    color: 'bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400',
  },
];

export function CrmReportsPage() {
  return (
    <div>
      <CrmPageHeader
        title="Relatorios"
        subtitle="Analises e metricas do CRM"
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {reports.map((report) => {
          const Icon = report.icon;
          return (
            <button
              key={report.title}
              className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700/50 p-5 text-left hover:shadow-md hover:border-indigo-300 dark:hover:border-indigo-700 transition-all group"
            >
              <div className="flex items-start gap-4">
                <div className={`w-11 h-11 rounded-xl ${report.color} flex items-center justify-center shrink-0`}>
                  <Icon size={20} />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-200 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                    {report.title}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{report.description}</p>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default CrmReportsPage;
