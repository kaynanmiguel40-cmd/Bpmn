/**
 * CrmPipelinePage - Kanban funcional do CRM.
 * Drag & drop nativo HTML5, deals reais, DealFormModal integrado.
 */

import { useState, useRef, useCallback, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Kanban, Plus, Search, X, User } from 'lucide-react';
import { CrmPageHeader, CrmEmptyState } from '../components/ui';
import { useCrmPipelines, useCrmPipelineWithDeals, useMoveCrmDeal, useMarkDealLost, useLearnedProbabilities } from '../hooks/useCrmQueries';
import { useTeamMembers } from '../../../hooks/queries';
import { supabase } from '../../../lib/supabase';
import { DealFormModal } from '../components/DealFormModal';
import { LostReasonModal } from '../components/LostReasonModal';
import { ScheduleMeetingModal } from '../components/ScheduleMeetingModal';

const formatCurrency = (val) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val || 0);

// ==================== DEAL CARD ====================

function DealCard({ deal, onDragStart, onMarkLost }) {
  const navigate = useNavigate();
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
        if (!isDragging.current) navigate(`/crm/deals/${deal.id}`);
      }}
      className={`rounded-lg border px-3 py-2.5 cursor-grab active:cursor-grabbing hover:shadow-md transition-shadow group relative ${
        deal.status === 'won'
          ? 'bg-emerald-50/50 dark:bg-emerald-900/10 border-emerald-200 dark:border-emerald-800/50'
          : deal.status === 'lost'
            ? 'bg-rose-50/50 dark:bg-rose-900/10 border-rose-200 dark:border-rose-800/50'
            : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700'
      }`}
    >
      <div className="flex items-start justify-between gap-2 mb-1">
        <div className="flex items-center gap-1.5 min-w-0">
          <h4 className="text-sm font-medium text-slate-800 dark:text-slate-200 leading-snug line-clamp-2">{deal.title}</h4>
          {deal.status === 'lost' && (
            <span className="shrink-0 px-1.5 py-0.5 text-[9px] font-semibold uppercase rounded bg-rose-100 dark:bg-rose-900/40 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-800">
              Perdido
            </span>
          )}
          {deal.status === 'won' && (
            <span className="shrink-0 px-1.5 py-0.5 text-[9px] font-semibold uppercase rounded bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
              Ganho
            </span>
          )}
        </div>
        {deal.value > 0 && (
          <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5">
            {formatCurrency(deal.value)}
          </span>
        )}
      </div>

      {(deal.contact || deal.company) && (
        <div className="flex items-center gap-1.5 mb-1">
          {deal.contact && (
            <>
              <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: deal.contact.avatarColor || '#94a3b8' }} />
              <span className="text-xs text-slate-500 dark:text-slate-400 truncate">{deal.contact.name}</span>
            </>
          )}
          {deal.contact && deal.company && <span className="text-slate-300 dark:text-slate-600">·</span>}
          {deal.company && (
            <span className="text-xs text-slate-400 dark:text-slate-500 truncate">{deal.company.name}</span>
          )}
        </div>
      )}

      {deal.owner && (
        <div className="flex items-center gap-1.5 mb-1">
          <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: deal.owner.color || '#6366f1' }} />
          <span className="text-[10px] text-slate-400 dark:text-slate-500 truncate">{deal.owner.name}</span>
        </div>
      )}

      {deal.probability != null && (
        <div className="flex items-center gap-2">
          <div className="flex-1 h-1 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
            <div className="h-full bg-blue-500 rounded-full" style={{ width: `${deal.probability}%` }} />
          </div>
          <span className="text-[10px] text-slate-400">{deal.probability}%</span>
        </div>
      )}

      {/* Botao perdido no hover (so aparece se deal esta aberto) */}
      {deal.status === 'open' && (
        <button
          onClick={(e) => { e.stopPropagation(); onMarkLost(deal.id); }}
          className="absolute right-1.5 top-9 opacity-0 group-hover:opacity-100 transition-opacity z-10 px-1.5 py-0.5 text-[10px] font-medium rounded bg-rose-50 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400 hover:bg-rose-100 dark:hover:bg-rose-900/50 shadow-sm border border-rose-200 dark:border-rose-800"
          title="Marcar como perdido"
        >
          Perdido
        </button>
      )}
    </div>
  );
}

// ==================== CONFETTI ====================

function ConfettiCelebration({ show, onDone }) {
  const particles = useMemo(() =>
    Array.from({ length: 50 }, (_, i) => ({
      id: i,
      left: Math.random() * 100,
      delay: Math.random() * 0.8,
      duration: 2 + Math.random() * 2,
      color: ['#10b981', '#f59e0b', '#6366f1', '#ef4444', '#06b6d4', '#f97316', '#8b5cf6', '#ec4899'][i % 8],
      size: 6 + Math.random() * 8,
      isCircle: Math.random() > 0.5,
      swayAmount: -50 + Math.random() * 100,
    }))
  , [show]);

  useEffect(() => {
    if (!show) return;
    const timer = setTimeout(() => onDone(), 3500);
    return () => clearTimeout(timer);
  }, [show, onDone]);

  if (!show) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-[9999] overflow-hidden">
      <style>{`
        @keyframes confetti-fall {
          0% { transform: translateY(-10vh) translateX(0px) rotate(0deg); opacity: 1; }
          100% { transform: translateY(110vh) translateX(var(--sway)) rotate(720deg); opacity: 0; }
        }
      `}</style>
      {particles.map(p => (
        <div
          key={p.id}
          style={{
            position: 'absolute',
            top: 0,
            left: `${p.left}%`,
            width: p.size,
            height: p.size,
            backgroundColor: p.color,
            borderRadius: p.isCircle ? '50%' : '2px',
            animation: `confetti-fall ${p.duration}s ease-in ${p.delay}s forwards`,
            '--sway': `${p.swayAmount}px`,
          }}
        />
      ))}
    </div>
  );
}

// ==================== STAGE COLUMN ====================

function StageColumn({ stage, learned, filteredDeals, onDrop, onDragStart, dragOverStageId, onNewDeal, onMarkLost }) {
  const isDragOver = dragOverStageId === stage.id;
  const learnedStage = learned?.stages?.find(s => s.position === stage.position);
  const showConv = learnedStage && learnedStage.sampleSize >= 5;
  const convColor = learnedStage?.learnedProbability >= 50
    ? 'text-emerald-600 dark:text-emerald-400'
    : learnedStage?.learnedProbability >= 20
      ? 'text-amber-600 dark:text-amber-400'
      : 'text-rose-600 dark:text-rose-400';

  const allCount = stage.deals?.length || 0;
  const isFiltered = filteredDeals.length !== allCount;

  return (
    <div className="w-72 shrink-0 flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2">
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: stage.color }} />
          <span className="text-sm font-semibold text-slate-700 dark:text-slate-300 truncate">{stage.name}</span>
          {showConv && (
            <span className={`text-[10px] font-medium shrink-0 ${convColor}`} title={`Conversao: ${learnedStage.learnedProbability}%`}>
              {learnedStage.learnedProbability}%
            </span>
          )}
        </div>
        <span className="text-xs text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full shrink-0">
          {isFiltered ? `${filteredDeals.length} de ${allCount}` : allCount}
        </span>
      </div>

      {/* Total do estagio */}
      {stage.totalValue > 0 && (
        <div className="px-3 pb-1.5 text-xs font-medium text-slate-500 dark:text-slate-400">
          {formatCurrency(stage.totalValue)}
        </div>
      )}

      {/* Drop zone com scroll vertical */}
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
        className={`flex-1 overflow-y-auto rounded-xl p-2 space-y-2 transition-colors ${
          isDragOver
            ? 'bg-blue-50 dark:bg-blue-900/20 ring-1 ring-inset ring-blue-200 dark:ring-blue-800'
            : 'bg-slate-100 dark:bg-slate-800/50'
        }`}
      >
        {filteredDeals.map(deal => (
          <DealCard
            key={deal.id}
            deal={deal}
            onDragStart={onDragStart}
            onMarkLost={onMarkLost}
          />
        ))}

        {allCount === 0 && !isDragOver && (
          <button
            onClick={() => onNewDeal(stage.id)}
            className="w-full h-20 border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-lg flex items-center justify-center hover:border-blue-400 hover:bg-blue-50/50 dark:hover:bg-blue-900/10 transition-colors group/add"
          >
            <span className="text-xs text-slate-400 dark:text-slate-500 group-hover/add:text-blue-500 transition-colors flex items-center gap-1">
              <Plus size={12} /> Novo negocio
            </span>
          </button>
        )}

        {allCount > 0 && filteredDeals.length === 0 && (
          <div className="py-8 text-center text-xs text-slate-400">Nenhum resultado</div>
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
  const lostMutation = useMarkDealLost();
  const { data: allMembers = [] } = useTeamMembers();
  const crmMembers = allMembers.filter(m => m.crmRole);

  // Descobrir o team_member do usuario logado
  const [myMemberId, setMyMemberId] = useState(null);
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      const uid = data?.session?.user?.id;
      if (uid && allMembers.length > 0) {
        const me = allMembers.find(m => m.authUserId === uid);
        if (me) setMyMemberId(me.id);
      }
    });
  }, [allMembers]);

  const [formOpen, setFormOpen] = useState(false);
  const [defaultStageId, setDefaultStageId] = useState(null);
  const [dragOverStageId, setDragOverStageId] = useState(null);
  const [lostModalDealId, setLostModalDealId] = useState(null);
  const [showConfetti, setShowConfetti] = useState(false);
  const [meetingModalData, setMeetingModalData] = useState(null); // { dealId, dealTitle, dealCity }
  const draggingDealId = useRef(null);

  // Filtros
  const [searchQuery, setSearchQuery] = useState('');
  const [valueFilter, setValueFilter] = useState('all');
  const [probFilter, setProbFilter] = useState('all');
  const [ownerFilter, setOwnerFilter] = useState('all');

  const hasFilters = searchQuery || valueFilter !== 'all' || probFilter !== 'all' || ownerFilter !== 'all';

  const filterDeals = useCallback((deals) => {
    if (!deals) return [];
    return deals.filter(d => {
      if (searchQuery && !d.title.toLowerCase().includes(searchQuery.toLowerCase())) return false;
      if (valueFilter === 'low' && (d.value || 0) > 5000) return false;
      if (valueFilter === 'mid' && ((d.value || 0) < 5000 || (d.value || 0) > 50000)) return false;
      if (valueFilter === 'high' && (d.value || 0) < 50000) return false;
      if (probFilter === 'high' && (d.probability ?? 50) < 70) return false;
      if (probFilter === 'mid' && ((d.probability ?? 50) < 30 || (d.probability ?? 50) >= 70)) return false;
      if (probFilter === 'low' && (d.probability ?? 50) >= 30) return false;
      if (ownerFilter === '_mine' && d.ownerId !== myMemberId) return false;
      if (ownerFilter === '_none' && d.ownerId) return false;
      if (ownerFilter !== 'all' && ownerFilter !== '_mine' && ownerFilter !== '_none' && d.ownerId !== ownerFilter) return false;
      return true;
    });
  }, [searchQuery, valueFilter, probFilter, ownerFilter, myMemberId]);

  const handleNewDeal = (stageId = null) => {
    setDefaultStageId(stageId);
    setFormOpen(true);
  };

  const handleDrop = (dealId, newStageId) => {
    if (draggingDealId.current === dealId) {
      // Find the deal info for meeting modal
      const allDeals = (pipelineData?.stages || []).flatMap(s => s.deals || []);
      const deal = allDeals.find(d => d.id === dealId);

      moveMutation.mutate({ dealId, stageId: newStageId }, {
        onSuccess: (data) => {
          if (data?.status === 'won') {
            setShowConfetti(true);
          }
          // Se a stage alvo tem triggers_meeting, abrir modal de agendamento
          if (data?._triggersMeeting && deal) {
            setMeetingModalData({
              dealId: deal.id,
              dealTitle: deal.title,
              dealCity: deal.company?.city || deal.contact?.city || '',
            });
          }
        },
      });
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
          <div className="flex items-center gap-2">
            {/* Busca */}
            <div className="relative">
              <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar..."
                className="pl-8 pr-7 py-1.5 text-sm bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg w-36 focus:outline-none focus:ring-2 focus:ring-fyness-primary text-slate-700 dark:text-slate-300 placeholder:text-slate-400"
              />
              {searchQuery && (
                <button onClick={() => setSearchQuery('')} className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                  <X size={13} />
                </button>
              )}
            </div>

            {/* Filtro valor */}
            <select
              value={valueFilter}
              onChange={(e) => setValueFilter(e.target.value)}
              className="text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2 py-1.5 text-slate-600 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-fyness-primary"
            >
              <option value="all">Valor: Todos</option>
              <option value="low">Ate R$5k</option>
              <option value="mid">R$5k - R$50k</option>
              <option value="high">Acima R$50k</option>
            </select>

            {/* Filtro probabilidade */}
            <select
              value={probFilter}
              onChange={(e) => setProbFilter(e.target.value)}
              className="text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2 py-1.5 text-slate-600 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-fyness-primary"
            >
              <option value="all">Prob: Todas</option>
              <option value="high">Alta (70%+)</option>
              <option value="mid">Media (30-69%)</option>
              <option value="low">Baixa (&lt;30%)</option>
            </select>

            {/* Filtro vendedor */}
            <select
              value={ownerFilter}
              onChange={(e) => setOwnerFilter(e.target.value)}
              className="text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2 py-1.5 text-slate-600 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-fyness-primary"
            >
              <option value="all">Vendedor: Todos</option>
              {myMemberId && <option value="_mine">Meus Leads</option>}
              <option value="_none">Sem vendedor</option>
              {crmMembers.map(m => (
                <option key={m.id} value={m.id}>{m.name}</option>
              ))}
            </select>

            {/* Limpar filtros */}
            {hasFilters && (
              <button
                onClick={() => { setSearchQuery(''); setValueFilter('all'); setProbFilter('all'); setOwnerFilter('all'); }}
                className="text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 px-1.5 py-1.5"
                title="Limpar filtros"
              >
                <X size={14} />
              </button>
            )}

            {/* Seletor de Pipeline */}
            {pipelines && pipelines.length > 1 && (
              <select
                value={activePipelineId || ''}
                onChange={(e) => setSelectedPipelineId(e.target.value || null)}
                className="text-sm bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-1.5 text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-fyness-primary"
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
        <div className="flex gap-3 overflow-x-auto pb-2 h-[calc(100vh-180px)]">
          {(pipelineData?.stages || []).map(stage => (
            <StageColumn
              key={stage.id}
              stage={stage}
              learned={learned}
              filteredDeals={filterDeals(stage.deals)}
              dragOverStageId={dragOverStageId}
              onNewDeal={handleNewDeal}
              onMarkLost={(dealId) => setLostModalDealId(dealId)}
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
        onClose={() => { setFormOpen(false); setDefaultStageId(null); }}
        deal={null}
        defaultPipelineId={activePipelineId}
        defaultStageId={defaultStageId}
      />

      <LostReasonModal
        open={!!lostModalDealId}
        onClose={() => setLostModalDealId(null)}
        isPending={lostMutation.isPending}
        onConfirm={(reason) => {
          lostMutation.mutate({ dealId: lostModalDealId, reason }, {
            onSuccess: () => setLostModalDealId(null),
          });
        }}
      />

      <ScheduleMeetingModal
        open={!!meetingModalData}
        onClose={() => setMeetingModalData(null)}
        dealId={meetingModalData?.dealId}
        dealTitle={meetingModalData?.dealTitle}
        dealCity={meetingModalData?.dealCity}
      />

      <ConfettiCelebration show={showConfetti} onDone={() => setShowConfetti(false)} />
    </div>
  );
}

export default CrmPipelinePage;
