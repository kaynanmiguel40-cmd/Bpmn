/**
 * CrmPipelinePage - Kanban funcional do CRM.
 * Drag & drop nativo HTML5, deals reais, DealFormModal integrado.
 */

import { useState, useRef, useCallback } from 'react';
import { Kanban, Plus, GripVertical, Trophy, XCircle, Pencil } from 'lucide-react';
import { CrmPageHeader, CrmEmptyState } from '../components/ui';
import { useCrmPipelines, useCrmPipelineWithDeals, useMoveCrmDeal, useMarkDealWon, useMarkDealLost, useLearnedProbabilities } from '../hooks/useCrmQueries';
import { DealFormModal } from '../components/DealFormModal';

const formatCurrency = (val) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val || 0);

// ==================== DEAL CARD ====================

function DealCard({ deal, onEdit, onDragStart }) {
  const wonMutation = useMarkDealWon();
  const lostMutation = useMarkDealLost();
  const isDragging = useRef(false);

  return (
    <div
      draggable
      onDragStart={(e) => {
        isDragging.current = true;
        e.dataTransfer.setData('text/plain', deal.id);
        e.dataTransfer.effectAllowed = 'move';
        onDragStart(deal.id);
      }}
      onDragEnd={() => {
        setTimeout(() => { isDragging.current = false; }, 100);
      }}
      onClick={() => {
        if (!isDragging.current) onEdit(deal);
      }}
      className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-3 cursor-grab active:cursor-grabbing hover:shadow-md transition-shadow group"
    >
      <div className="flex items-start justify-between gap-2 mb-1.5">
        <h4 className="text-sm font-medium text-slate-800 dark:text-slate-200 leading-snug line-clamp-2">
          {deal.title}
        </h4>
        <GripVertical size={14} className="text-slate-300 dark:text-slate-600 shrink-0 mt-0.5" />
      </div>

      {deal.value > 0 && (
        <div className="text-sm font-semibold text-emerald-600 dark:text-emerald-400 mb-1.5">
          {formatCurrency(deal.value)}
        </div>
      )}

      <div className="space-y-1">
        {deal.contact && (
          <div className="text-xs text-slate-500 dark:text-slate-400 truncate">
            {deal.contact.name}
          </div>
        )}
        {deal.company && (
          <div className="text-xs text-slate-400 dark:text-slate-500 truncate">
            {deal.company.name}
          </div>
        )}
      </div>

      {deal.probability != null && (
        <div className="mt-2 flex items-center gap-2">
          <div className="flex-1 h-1 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-blue-500 rounded-full transition-all"
              style={{ width: `${deal.probability}%` }}
            />
          </div>
          <span className="text-[10px] text-slate-400">{deal.probability}%</span>
        </div>
      )}

      {/* Acoes rapidas no hover */}
      <div className="flex items-center gap-1 mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          onClick={(e) => { e.stopPropagation(); wonMutation.mutate(deal.id); }}
          title="Marcar como ganho"
          className="p-1 rounded text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition-colors"
        >
          <Trophy size={12} />
        </button>
        <button
          onClick={(e) => { e.stopPropagation(); lostMutation.mutate({ dealId: deal.id, reason: '' }); }}
          title="Marcar como perdido"
          className="p-1 rounded text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/20 transition-colors"
        >
          <XCircle size={12} />
        </button>
        <button
          onClick={(e) => { e.stopPropagation(); onEdit(deal); }}
          title="Editar"
          className="p-1 rounded text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
        >
          <Pencil size={12} />
        </button>
      </div>
    </div>
  );
}

// ==================== STAGE COLUMN ====================

function StageColumn({ stage, learned, onDrop, onEditDeal, onDragStart, dragOverStageId, onNewDeal }) {
  const isDragOver = dragOverStageId === stage.id;
  const learnedStage = learned?.stages?.find(s => s.position === stage.position);
  const showConv = learnedStage && learnedStage.sampleSize >= 5;
  const convColor = learnedStage?.learnedProbability >= 50
    ? 'text-emerald-600 dark:text-emerald-400'
    : learnedStage?.learnedProbability >= 20
      ? 'text-amber-600 dark:text-amber-400'
      : 'text-rose-600 dark:text-rose-400';

  return (
    <div className="w-72 shrink-0 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2 mb-2">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: stage.color }} />
          <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">{stage.name}</span>
          {showConv && (
            <span className={`text-[10px] font-medium ${convColor}`} title={`Conversao: ${learnedStage.learnedProbability}%`}>
              {learnedStage.learnedProbability}%
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full">
            {stage.deals?.length || 0}
          </span>
        </div>
      </div>

      {/* Total do estagio */}
      {stage.totalValue > 0 && (
        <div className="px-3 mb-2 text-xs font-medium text-slate-500 dark:text-slate-400">
          {formatCurrency(stage.totalValue)}
        </div>
      )}

      {/* Drop zone */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          e.dataTransfer.dropEffect = 'move';
          onDrop.setDragOver(stage.id);
        }}
        onDragLeave={() => onDrop.setDragOver(null)}
        onDrop={(e) => {
          e.preventDefault();
          const dealId = e.dataTransfer.getData('text/plain');
          if (dealId) onDrop.execute(dealId, stage.id);
          onDrop.setDragOver(null);
        }}
        className={`flex-1 rounded-xl p-2 space-y-2 transition-colors min-h-[50vh] ${
          isDragOver
            ? 'bg-blue-50 dark:bg-blue-900/20 border-2 border-dashed border-blue-300 dark:border-blue-700'
            : 'bg-slate-100 dark:bg-slate-800/50'
        }`}
      >
        {(stage.deals || []).map(deal => (
          <DealCard
            key={deal.id}
            deal={deal}
            onEdit={onEditDeal}
            onDragStart={onDragStart}
          />
        ))}

        {(!stage.deals || stage.deals.length === 0) && !isDragOver && (
          <button
            onClick={() => onNewDeal(stage.id)}
            className="w-full h-20 border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-lg flex items-center justify-center hover:border-blue-400 hover:bg-blue-50/50 dark:hover:bg-blue-900/10 transition-colors group/add"
          >
            <span className="text-xs text-slate-400 dark:text-slate-500 group-hover/add:text-blue-500 transition-colors flex items-center gap-1">
              <Plus size={12} /> Novo negocio
            </span>
          </button>
        )}
      </div>
    </div>
  );
}

// ==================== PAGINA ====================

export function CrmPipelinePage() {
  const { data: pipelines, isLoading: loadingPipelines } = useCrmPipelines();
  const [selectedPipelineId, setSelectedPipelineId] = useState(null);
  const activePipelineId = selectedPipelineId || pipelines?.[0]?.id || null;

  const { data: pipelineData, isLoading: loadingDeals } = useCrmPipelineWithDeals(activePipelineId);
  const { data: learned } = useLearnedProbabilities(activePipelineId);
  const moveMutation = useMoveCrmDeal();

  const [formOpen, setFormOpen] = useState(false);
  const [editDeal, setEditDeal] = useState(null);
  const [defaultStageId, setDefaultStageId] = useState(null);
  const [dragOverStageId, setDragOverStageId] = useState(null);
  const draggingDealId = useRef(null);

  const handleNewDeal = (stageId = null) => {
    setEditDeal(null);
    setDefaultStageId(stageId);
    setFormOpen(true);
  };

  const handleEditDeal = (deal) => {
    setEditDeal(deal);
    setDefaultStageId(null);
    setFormOpen(true);
  };

  const handleDrop = (dealId, newStageId) => {
    if (draggingDealId.current === dealId) {
      moveMutation.mutate({ dealId, stageId: newStageId });
    }
    draggingDealId.current = null;
  };

  const isLoading = loadingPipelines || loadingDeals;

  return (
    <div>
      <CrmPageHeader
        title="Pipeline"
        subtitle="Kanban visual dos seus negocios"
        actions={
          <div className="flex items-center gap-3">
            {/* Seletor de Pipeline */}
            {pipelines && pipelines.length > 1 && (
              <select
                value={activePipelineId || ''}
                onChange={(e) => setSelectedPipelineId(e.target.value || null)}
                className="text-sm bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-fyness-primary"
              >
                {pipelines.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
            )}
            <button
              onClick={() => handleNewDeal()}
              className="flex items-center gap-2 px-4 py-2 bg-fyness-primary hover:bg-fyness-secondary text-white text-sm font-medium rounded-lg transition-colors"
            >
              <Plus size={16} /> Novo Negocio
            </button>
          </div>
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
        />
      ) : (
        <div className="flex gap-4 overflow-x-auto pb-4 min-h-[60vh]">
          {(pipelineData?.stages || []).map(stage => (
            <StageColumn
              key={stage.id}
              stage={stage}
              learned={learned}
              dragOverStageId={dragOverStageId}
              onEditDeal={handleEditDeal}
              onNewDeal={handleNewDeal}
              onDragStart={(id) => { draggingDealId.current = id; }}
              onDrop={{
                execute: handleDrop,
                setDragOver: setDragOverStageId,
              }}
            />
          ))}
        </div>
      )}

      <DealFormModal
        open={formOpen}
        onClose={() => { setFormOpen(false); setEditDeal(null); setDefaultStageId(null); }}
        deal={editDeal}
        defaultPipelineId={activePipelineId}
        defaultStageId={defaultStageId}
      />
    </div>
  );
}

export default CrmPipelinePage;
