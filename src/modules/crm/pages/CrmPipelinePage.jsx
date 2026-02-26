/**
 * CrmPipelinePage - Kanban de Pipeline do CRM.
 * Placeholder — sera implementado com drag & drop.
 */

import { Kanban, Plus } from 'lucide-react';
import { CrmPageHeader, CrmEmptyState } from '../components/ui';
import { useCrmPipelines } from '../hooks/useCrmQueries';

export function CrmPipelinePage() {
  const { data: pipelines, isLoading } = useCrmPipelines();

  return (
    <div>
      <CrmPageHeader
        title="Pipeline"
        subtitle="Kanban visual dos seus negocios"
        actions={
          <button className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg transition-colors">
            <Plus size={16} />
            Novo Negocio
          </button>
        }
      />

      {isLoading ? (
        <div className="flex gap-4 overflow-x-auto pb-4">
          {[1, 2, 3, 4, 5].map(i => (
            <div key={i} className="w-72 shrink-0 bg-slate-100 dark:bg-slate-800 rounded-xl h-96 animate-pulse" />
          ))}
        </div>
      ) : !pipelines || pipelines.length === 0 ? (
        <CrmEmptyState
          icon={Kanban}
          title="Nenhum pipeline criado"
          description="Crie seu primeiro pipeline para comecar a gerenciar negocios no Kanban."
          action={{ label: 'Criar Pipeline', onClick: () => {} }}
        />
      ) : (
        <div className="flex gap-4 overflow-x-auto pb-4 min-h-[60vh]">
          {/* Placeholder columns */}
          {['Prospeccao', 'Qualificacao', 'Proposta', 'Negociacao', 'Fechamento', 'Ganho'].map((stage, idx) => (
            <div key={idx} className="w-72 shrink-0">
              <div className="flex items-center justify-between px-3 py-2 mb-2">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: ['#818cf8', '#a78bfa', '#f59e0b', '#f97316', '#10b981', '#6366f1'][idx] }} />
                  <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">{stage}</span>
                </div>
                <span className="text-xs text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full">0</span>
              </div>
              <div className="bg-slate-100 dark:bg-slate-800/50 rounded-xl p-2 min-h-[50vh] space-y-2">
                <div className="h-24 border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-lg flex items-center justify-center">
                  <span className="text-xs text-slate-400 dark:text-slate-500">Arraste negocios aqui</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default CrmPipelinePage;
