/**
 * CrmSettingsPage — Configurações do CRM
 * Tabs: Equipe | Pipelines | Segmentos | Preferências
 */

import { useState, useRef, useEffect } from 'react';
import {
  Users, Kanban, Tag, Settings,
  Check, Trophy, CalendarCheck,
  Plus, Trash2, Pencil, ChevronUp, ChevronDown,
  Save, X, AlertTriangle, Brain,
  DollarSign, Globe, Palette,
} from 'lucide-react';
import { CrmPageHeader, CrmAvatar, CrmConfirmDialog } from '../components/ui';
import { useTeamMembers } from '../../../hooks/queries';
import { updateTeamMember } from '../../../lib/teamService';
import {
  useCrmPipelines,
  useCreateCrmPipeline,
  useUpdateCrmPipeline,
  useDeleteCrmPipeline,
  useAddCrmStage,
  useDeleteCrmStage,
  useReorderCrmStages,
  useSetWinStage,
  useLearnedProbabilities,
} from '../hooks/useCrmQueries';

// ─── Constantes ───────────────────────────────────────────────────────────────

const CRM_ROLES = [
  { value: 'vendedor',    label: 'Vendedor',    color: 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 border-emerald-300 dark:border-emerald-700' },
  { value: 'pre_vendedor',label: 'Pré-vendedor',color: 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 border-amber-300 dark:border-amber-700' },
  { value: 'gestor',      label: 'Gestor',      color: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border-blue-300 dark:border-blue-700' },
];

const STAGE_COLORS = [
  '#94a3b8', '#6366f1', '#8b5cf6', '#3b82f6', '#06b6d4',
  '#10b981', '#84cc16', '#f59e0b', '#f97316', '#ef4444',
  '#ec4899', '#64748b',
];

const DEFAULT_SEGMENTS = [
  'Agro', 'Varejo', 'Industria', 'Tecnologia', 'Educacao',
  'Saude', 'Financeiro', 'Construcao', 'Servicos',
];

const CURRENCIES = [
  { value: 'BRL', label: 'Real (R$)' },
  { value: 'USD', label: 'Dólar (US$)' },
  { value: 'EUR', label: 'Euro (€)' },
];

// ─── Helpers de estilo ────────────────────────────────────────────────────────

const inputCls = 'w-full px-3 py-2 text-sm bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-lg text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/40';
const labelCls = 'block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1';

function SectionCard({ icon: Icon, color, title, subtitle, children }) {
  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700/50">
      <div className="flex items-center gap-3 px-5 py-4 border-b border-slate-100 dark:border-slate-700/50">
        <div className={`w-9 h-9 rounded-lg ${color} flex items-center justify-center shrink-0`}>
          <Icon size={18} />
        </div>
        <div>
          <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-200">{title}</h3>
          {subtitle && <p className="text-xs text-slate-500 dark:text-slate-400">{subtitle}</p>}
        </div>
      </div>
      <div className="px-5 py-4">{children}</div>
    </div>
  );
}

// ─── Tab: Equipe ──────────────────────────────────────────────────────────────

function EquipeTab() {
  const { data: teamMembers = [], refetch } = useTeamMembers();
  const [savingId, setSavingId] = useState(null);

  const handleSetRole = async (memberId, crmRole) => {
    setSavingId(memberId);
    try {
      await updateTeamMember(memberId, { crmRole });
      await refetch();
    } finally {
      setSavingId(null);
    }
  };

  const membersWithRole    = teamMembers.filter(m => m.crmRole);
  const membersWithoutRole = teamMembers.filter(m => !m.crmRole);

  return (
    <SectionCard
      icon={Users}
      color="bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400"
      title="Equipe Comercial"
      subtitle="Defina o cargo CRM de cada membro. Apenas membros com cargo aparecem nas metas individuais."
    >
      {teamMembers.length === 0 ? (
        <p className="text-sm text-slate-500 dark:text-slate-400 py-4 text-center">
          Nenhum membro cadastrado. Adicione membros em Configurações gerais.
        </p>
      ) : (
        <div className="space-y-1">
          {membersWithRole.length > 0 && (
            <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-3">
              {membersWithRole.length} membro{membersWithRole.length !== 1 ? 's' : ''} com cargo
            </p>
          )}
          {[...membersWithRole, ...membersWithoutRole].map(member => (
            <div key={member.id} className="flex items-center gap-4 py-2.5 border-b border-slate-50 dark:border-slate-800 last:border-0">
              <CrmAvatar name={member.name} size="sm" color={member.color} />
              <div className="min-w-0 flex-1">
                <div className="text-sm font-medium text-slate-800 dark:text-slate-200 truncate">{member.name}</div>
                {member.role && <div className="text-xs text-slate-400 truncate">{member.role}</div>}
              </div>
              <div className="flex items-center gap-1.5 shrink-0">
                {CRM_ROLES.map(r => {
                  const isActive = member.crmRole === r.value;
                  return (
                    <button
                      key={r.value}
                      onClick={() => handleSetRole(member.id, isActive ? null : r.value)}
                      disabled={savingId === member.id}
                      className={`px-2.5 py-1 text-xs font-medium rounded-md border transition-all disabled:opacity-50 ${
                        isActive
                          ? `${r.color} ring-1 ring-offset-1 dark:ring-offset-slate-900`
                          : 'border-slate-200 dark:border-slate-700 text-slate-400 dark:text-slate-500 hover:border-slate-300 hover:text-slate-600 dark:hover:text-slate-300'
                      }`}
                    >
                      {isActive && <Check size={10} className="inline mr-1 -mt-0.5" />}
                      {r.label}
                    </button>
                  );
                })}
              </div>
              {savingId === member.id && (
                <div className="w-4 h-4 border-2 border-blue-300 border-t-blue-600 rounded-full animate-spin shrink-0" />
              )}
            </div>
          ))}
        </div>
      )}
    </SectionCard>
  );
}

// ─── Inline stage editor ──────────────────────────────────────────────────────

function StageRow({ stage, index, total, onMoveUp, onMoveDown, onUpdate, onDelete, onSetWin }) {
  const [editing, setEditing] = useState(false);
  const [name, setName]       = useState(stage.name);
  const [color, setColor]     = useState(stage.color);
  const inputRef              = useRef(null);

  useEffect(() => {
    if (editing) inputRef.current?.focus();
  }, [editing]);

  const saveEdit = () => {
    if (name.trim() && (name !== stage.name || color !== stage.color)) {
      onUpdate({ id: stage.id, name: name.trim(), color });
    }
    setEditing(false);
  };

  const cancelEdit = () => {
    setName(stage.name);
    setColor(stage.color);
    setEditing(false);
  };

  return (
    <div className="flex items-center gap-2 py-2 border-b border-slate-50 dark:border-slate-800 last:border-0 group">
      {/* Reorder */}
      <div className="flex flex-col gap-0.5 shrink-0">
        <button
          onClick={onMoveUp}
          disabled={index === 0}
          className="p-0.5 rounded text-slate-300 dark:text-slate-600 hover:text-slate-500 dark:hover:text-slate-400 disabled:opacity-0 transition-colors"
        >
          <ChevronUp size={12} />
        </button>
        <button
          onClick={onMoveDown}
          disabled={index === total - 1}
          className="p-0.5 rounded text-slate-300 dark:text-slate-600 hover:text-slate-500 dark:hover:text-slate-400 disabled:opacity-0 transition-colors"
        >
          <ChevronDown size={12} />
        </button>
      </div>

      {/* Color */}
      {editing ? (
        <div className="relative shrink-0">
          <input
            type="color"
            value={color}
            onChange={e => setColor(e.target.value)}
            className="w-6 h-6 rounded-full border-0 cursor-pointer p-0 bg-transparent"
            title="Alterar cor"
          />
        </div>
      ) : (
        <div
          className="w-3 h-3 rounded-full shrink-0"
          style={{ backgroundColor: stage.color }}
        />
      )}

      {/* Name */}
      {editing ? (
        <input
          ref={inputRef}
          value={name}
          onChange={e => setName(e.target.value)}
          onKeyDown={e => {
            if (e.key === 'Enter')  saveEdit();
            if (e.key === 'Escape') cancelEdit();
          }}
          className="flex-1 px-2 py-1 text-sm bg-white dark:bg-slate-700 border border-blue-400 rounded-md text-slate-800 dark:text-slate-100 focus:outline-none"
        />
      ) : (
        <span className="flex-1 text-sm text-slate-700 dark:text-slate-300 font-medium truncate">
          {stage.name}
        </span>
      )}

      {/* Posição */}
      <span className="text-[11px] text-slate-300 dark:text-slate-600 w-5 text-center shrink-0">{index + 1}</span>

      {/* Win stage */}
      <button
        onClick={() => onSetWin(stage)}
        title={stage.isWinStage ? 'Remover como etapa de vitória' : 'Marcar como etapa de vitória'}
        className={`shrink-0 p-1 rounded-md transition-colors ${
          stage.isWinStage
            ? 'text-amber-500 bg-amber-50 dark:bg-amber-900/20'
            : 'text-slate-300 dark:text-slate-600 hover:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-900/20 opacity-0 group-hover:opacity-100'
        }`}
      >
        <Trophy size={13} fill={stage.isWinStage ? 'currentColor' : 'none'} />
      </button>

      {/* Triggers meeting */}
      <button
        onClick={() => onUpdate({ id: stage.id, triggersMeeting: !stage.triggersMeeting })}
        title={stage.triggersMeeting ? 'Remover disparo de reunião' : 'Disparar modal de reunião ao entrar nesta etapa'}
        className={`shrink-0 p-1 rounded-md transition-colors ${
          stage.triggersMeeting
            ? 'text-blue-500 bg-blue-50 dark:bg-blue-900/20'
            : 'text-slate-300 dark:text-slate-600 hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 opacity-0 group-hover:opacity-100'
        }`}
      >
        <CalendarCheck size={13} />
      </button>

      {/* Actions */}
      {editing ? (
        <>
          <button onClick={saveEdit}   className="p-1 rounded-md text-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition-colors shrink-0"><Save size={13} /></button>
          <button onClick={cancelEdit} className="p-1 rounded-md text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors shrink-0"><X size={13} /></button>
        </>
      ) : (
        <>
          <button onClick={() => setEditing(true)} className="p-1 rounded-md text-slate-300 dark:text-slate-600 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors opacity-0 group-hover:opacity-100 shrink-0"><Pencil size={13} /></button>
          <button onClick={() => onDelete(stage)}  className="p-1 rounded-md text-slate-300 dark:text-slate-600 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors opacity-0 group-hover:opacity-100 shrink-0"><Trash2 size={13} /></button>
        </>
      )}
    </div>
  );
}

// ─── Tab: Pipelines ───────────────────────────────────────────────────────────

function PipelinesTab() {
  const { data: pipelines = [], isLoading } = useCrmPipelines();
  const [activePipelineId, setActivePipelineId] = useState(null);

  const createPipeline  = useCreateCrmPipeline();
  const updatePipeline  = useUpdateCrmPipeline();
  const deletePipeline  = useDeleteCrmPipeline();
  const addStage        = useAddCrmStage();
  const deleteStage     = useDeleteCrmStage();
  const reorderStages   = useReorderCrmStages();
  const setWinStage     = useSetWinStage();

  const [newPipelineName, setNewPipelineName] = useState('');
  const [showNewPipeline, setShowNewPipeline] = useState(false);
  const [editingPipelineName, setEditingPipelineName] = useState(null);
  const [deletePipelineTarget, setDeletePipelineTarget] = useState(null);
  const [deleteStageTarget, setDeleteStageTarget]       = useState(null);
  const [newStageName, setNewStageName] = useState('');
  const [newStageColor, setNewStageColor] = useState('#6366f1');
  const [showAddStage, setShowAddStage] = useState(false);
  const { data: learned } = useLearnedProbabilities(activePipelineId);

  // Selecionar primeiro pipeline por default
  useEffect(() => {
    if (pipelines.length && !activePipelineId) {
      setActivePipelineId(pipelines[0].id);
    }
  }, [pipelines, activePipelineId]);

  const activePipeline = pipelines.find(p => p.id === activePipelineId);
  const stages = activePipeline?.stages || [];

  const handleCreatePipeline = async () => {
    if (!newPipelineName.trim()) return;
    await createPipeline.mutateAsync({ name: newPipelineName.trim() });
    setNewPipelineName('');
    setShowNewPipeline(false);
  };

  const handleRenamePipeline = async (id, name) => {
    if (!name.trim()) return;
    await updatePipeline.mutateAsync({ id, updates: { name: name.trim() } });
    setEditingPipelineName(null);
  };

  const handleMoveStage = async (index, direction) => {
    const newStages = [...stages];
    const swapIndex = direction === 'up' ? index - 1 : index + 1;
    [newStages[index], newStages[swapIndex]] = [newStages[swapIndex], newStages[index]];
    const updates = newStages.map((s, i) => ({ id: s.id, position: i + 1 }));
    await reorderStages.mutateAsync(updates);
  };

  const handleUpdateStage = async (update) => {
    const current = stages.find(s => s.id === update.id);
    await reorderStages.mutateAsync([{
      id:              update.id,
      position:        current?.position ?? 0,
      name:            update.name           ?? current?.name,
      color:           update.color          ?? current?.color,
      isWinStage:      update.isWinStage     ?? current?.isWinStage,
      triggersMeeting: update.triggersMeeting ?? current?.triggersMeeting,
    }]);
  };

  const handleSetWin = async (stage) => {
    await setWinStage.mutateAsync({
      stageId:    stage.isWinStage ? null : stage.id,
      pipelineId: activePipelineId,
    });
  };

  const handleAddStage = async () => {
    if (!newStageName.trim() || !activePipelineId) return;
    await addStage.mutateAsync({
      pipelineId: activePipelineId,
      stageData: {
        name:     newStageName.trim(),
        position: stages.length + 1,
        color:    newStageColor,
      },
    });
    setNewStageName('');
    setNewStageColor('#6366f1');
    setShowAddStage(false);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-12 text-slate-400">
        <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Lista de pipelines */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700/50">
        <div className="flex items-center gap-3 px-5 py-4 border-b border-slate-100 dark:border-slate-700/50">
          <div className="w-9 h-9 rounded-lg bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
            <Kanban size={18} />
          </div>
          <div className="flex-1">
            <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-200">Pipelines</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">{pipelines.length} pipeline{pipelines.length !== 1 ? 's' : ''} configurado{pipelines.length !== 1 ? 's' : ''}</p>
          </div>
          <button
            onClick={() => setShowNewPipeline(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
          >
            <Plus size={12} /> Novo Pipeline
          </button>
        </div>

        <div className="divide-y divide-slate-50 dark:divide-slate-800 px-5 py-2">
          {pipelines.map(p => (
            <div
              key={p.id}
              className={`flex items-center gap-3 py-2.5 cursor-pointer group rounded-lg px-2 -mx-2 transition-colors ${
                activePipelineId === p.id
                  ? 'bg-blue-50 dark:bg-blue-900/20'
                  : 'hover:bg-slate-50 dark:hover:bg-slate-800/50'
              }`}
              onClick={() => setActivePipelineId(p.id)}
            >
              <div
                className={`w-2 h-2 rounded-full shrink-0 ${
                  activePipelineId === p.id ? 'bg-blue-500' : 'bg-slate-300 dark:bg-slate-600'
                }`}
              />
              {editingPipelineName === p.id ? (
                <input
                  autoFocus
                  defaultValue={p.name}
                  onClick={e => e.stopPropagation()}
                  onKeyDown={e => {
                    if (e.key === 'Enter')  handleRenamePipeline(p.id, e.target.value);
                    if (e.key === 'Escape') setEditingPipelineName(null);
                  }}
                  onBlur={e => handleRenamePipeline(p.id, e.target.value)}
                  className="flex-1 px-2 py-0.5 text-sm bg-white dark:bg-slate-700 border border-blue-400 rounded text-slate-800 dark:text-slate-100 focus:outline-none"
                />
              ) : (
                <span className={`flex-1 text-sm font-medium ${
                  activePipelineId === p.id
                    ? 'text-blue-700 dark:text-blue-300'
                    : 'text-slate-700 dark:text-slate-300'
                }`}>
                  {p.name}
                </span>
              )}
              <span className="text-xs text-slate-400">{p.stages?.length ?? 0} etapas</span>
              <button
                onClick={e => { e.stopPropagation(); setEditingPipelineName(p.id); }}
                className="p-1 rounded text-slate-300 dark:text-slate-600 hover:text-blue-500 opacity-0 group-hover:opacity-100 transition-colors"
              >
                <Pencil size={12} />
              </button>
              <button
                onClick={e => { e.stopPropagation(); setDeletePipelineTarget(p); }}
                className="p-1 rounded text-slate-300 dark:text-slate-600 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-colors"
              >
                <Trash2 size={12} />
              </button>
            </div>
          ))}
        </div>

        {/* Nova pipeline inline */}
        {showNewPipeline && (
          <div className="px-5 py-3 border-t border-slate-100 dark:border-slate-700/50">
            <div className="flex gap-2">
              <input
                autoFocus
                value={newPipelineName}
                onChange={e => setNewPipelineName(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') handleCreatePipeline(); if (e.key === 'Escape') setShowNewPipeline(false); }}
                placeholder="Nome do pipeline"
                className={`${inputCls} flex-1`}
              />
              <button
                onClick={handleCreatePipeline}
                disabled={createPipeline.isPending}
                className="px-3 py-1.5 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50"
              >
                Criar
              </button>
              <button
                onClick={() => setShowNewPipeline(false)}
                className="px-3 py-1.5 text-sm text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
              >
                Cancelar
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Etapas do pipeline selecionado */}
      {activePipeline && (
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700/50">
          <div className="flex items-center gap-3 px-5 py-4 border-b border-slate-100 dark:border-slate-700/50">
            <div className="flex-1">
              <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                Etapas — <span className="text-blue-600 dark:text-blue-400">{activePipeline.name}</span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Passe o mouse sobre uma etapa para editar. <span className="inline-flex items-center gap-1"><Trophy size={10} className="text-amber-400" /> = vitória</span> · <span className="inline-flex items-center gap-1"><CalendarCheck size={10} className="text-blue-400" /> = dispara reunião</span>
              </p>
            </div>
            {learned && (
              <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
                <Brain size={13} className="text-violet-500" />
                Conversão: <span className="font-bold text-emerald-600 dark:text-emerald-400">{learned.overallConversion}%</span>
              </div>
            )}
          </div>

          <div className="px-5 py-2">
            {stages.length === 0 ? (
              <p className="text-sm text-slate-400 py-4 text-center">Nenhuma etapa neste pipeline.</p>
            ) : (
              stages.map((stage, idx) => (
                <StageRow
                  key={stage.id}
                  stage={stage}
                  index={idx}
                  total={stages.length}
                  onMoveUp={() => handleMoveStage(idx, 'up')}
                  onMoveDown={() => handleMoveStage(idx, 'down')}
                  onUpdate={handleUpdateStage}
                  onDelete={s => setDeleteStageTarget(s)}
                  onSetWin={handleSetWin}
                />
              ))
            )}
          </div>

          {/* Add stage */}
          <div className="px-5 pb-4">
            {showAddStage ? (
              <div className="flex gap-2 mt-2">
                <input
                  type="color"
                  value={newStageColor}
                  onChange={e => setNewStageColor(e.target.value)}
                  className="w-8 h-9 rounded border border-slate-200 dark:border-slate-600 cursor-pointer p-0.5"
                />
                <input
                  autoFocus
                  value={newStageName}
                  onChange={e => setNewStageName(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') handleAddStage(); if (e.key === 'Escape') setShowAddStage(false); }}
                  placeholder="Nome da etapa"
                  className={`${inputCls} flex-1`}
                />
                <button
                  onClick={handleAddStage}
                  disabled={addStage.isPending}
                  className="px-3 py-1.5 text-sm bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50"
                >
                  Adicionar
                </button>
                <button
                  onClick={() => setShowAddStage(false)}
                  className="px-3 py-1.5 text-sm text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
                >
                  <X size={14} />
                </button>
              </div>
            ) : (
              <button
                onClick={() => setShowAddStage(true)}
                className="mt-2 flex items-center gap-2 text-sm text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
              >
                <Plus size={14} /> Adicionar etapa
              </button>
            )}
          </div>
        </div>
      )}

      {/* Dialogs de confirmação */}
      <CrmConfirmDialog
        open={!!deletePipelineTarget}
        onClose={() => setDeletePipelineTarget(null)}
        onConfirm={async () => {
          await deletePipeline.mutateAsync(deletePipelineTarget.id);
          if (activePipelineId === deletePipelineTarget.id) setActivePipelineId(null);
          setDeletePipelineTarget(null);
        }}
        title="Excluir pipeline"
        description={`Deseja excluir o pipeline "${deletePipelineTarget?.name}" e todas as suas etapas? Os deals não serão apagados.`}
        loading={deletePipeline.isPending}
      />
      <CrmConfirmDialog
        open={!!deleteStageTarget}
        onClose={() => setDeleteStageTarget(null)}
        onConfirm={async () => {
          await deleteStage.mutateAsync(deleteStageTarget.id);
          setDeleteStageTarget(null);
        }}
        title="Excluir etapa"
        description={`Deseja excluir a etapa "${deleteStageTarget?.name}"? Deals nesta etapa não serão afetados.`}
        loading={deleteStage.isPending}
      />
    </div>
  );
}

// ─── Tab: Segmentos ───────────────────────────────────────────────────────────

function SegmentosTab() {
  const storageKey = 'crm-segments';
  const load = () => {
    try {
      const s = localStorage.getItem(storageKey);
      return s ? JSON.parse(s) : DEFAULT_SEGMENTS;
    } catch { return DEFAULT_SEGMENTS; }
  };

  const [segments, setSegments] = useState(load);
  const [newSeg, setNewSeg]     = useState('');

  const save = (list) => {
    setSegments(list);
    try { localStorage.setItem(storageKey, JSON.stringify(list)); } catch {}
  };

  const add = () => {
    const val = newSeg.trim();
    if (!val || segments.includes(val)) return;
    save([...segments, val]);
    setNewSeg('');
  };

  const remove = (seg) => save(segments.filter(s => s !== seg));

  const reset = () => save(DEFAULT_SEGMENTS);

  return (
    <SectionCard
      icon={Tag}
      color="bg-violet-50 dark:bg-violet-900/20 text-violet-600 dark:text-violet-400"
      title="Segmentos de Mercado"
      subtitle="Lista de segmentos disponíveis para classificar deals e disparar automações segmentadas."
    >
      <div className="space-y-4">
        {/* Chips dos segmentos */}
        <div className="flex flex-wrap gap-2">
          {segments.map(seg => (
            <span
              key={seg}
              className="inline-flex items-center gap-1.5 px-3 py-1 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 text-sm rounded-full"
            >
              {seg}
              <button
                onClick={() => remove(seg)}
                className="text-slate-400 hover:text-red-500 transition-colors ml-0.5"
              >
                <X size={12} />
              </button>
            </span>
          ))}
        </div>

        {/* Add */}
        <div className="flex gap-2">
          <input
            value={newSeg}
            onChange={e => setNewSeg(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') add(); }}
            placeholder="Novo segmento (ex: Agronegócio)"
            className={`${inputCls} flex-1`}
          />
          <button
            onClick={add}
            className="px-4 py-2 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
          >
            <Plus size={14} />
          </button>
        </div>

        <div className="flex justify-end">
          <button
            onClick={reset}
            className="text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
          >
            Restaurar padrões
          </button>
        </div>
      </div>
    </SectionCard>
  );
}

// ─── Tab: Preferências ────────────────────────────────────────────────────────

function PreferenciasTab() {
  const loadPref = (key, def) => {
    try { return localStorage.getItem(key) ?? def; } catch { return def; }
  };
  const savePref = (key, val) => { try { localStorage.setItem(key, val); } catch {} };

  const [currency, setCurrency] = useState(() => loadPref('crm-currency', 'BRL'));
  const [saved, setSaved]       = useState(false);

  const handleSave = () => {
    savePref('crm-currency', currency);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="space-y-5">
      <SectionCard
        icon={Globe}
        color="bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400"
        title="Localização e Moeda"
        subtitle="Formato de exibição de valores monetários no CRM."
      >
        <div className="space-y-4">
          <div>
            <label className={labelCls}>Moeda padrão</label>
            <select
              value={currency}
              onChange={e => setCurrency(e.target.value)}
              className={`${inputCls} max-w-xs`}
            >
              {CURRENCIES.map(c => (
                <option key={c.value} value={c.value}>{c.label}</option>
              ))}
            </select>
          </div>
          <button
            onClick={handleSave}
            className={`flex items-center gap-2 px-4 py-2 text-sm rounded-lg font-medium transition-all ${
              saved
                ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
                : 'bg-blue-600 hover:bg-blue-700 text-white'
            }`}
          >
            {saved ? <><Check size={14} /> Salvo!</> : <><Save size={14} /> Salvar preferências</>}
          </button>
        </div>
      </SectionCard>

      <SectionCard
        icon={AlertTriangle}
        color="bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400"
        title="Integrações de Envio"
        subtitle="Configure APIs externas para disparo real de mensagens nas Automações."
      >
        <div className="space-y-3">
          {[
            { name: 'WhatsApp', desc: 'Meta Business API ou Z-API', status: 'Não configurado' },
            { name: 'E-mail', desc: 'Resend / SendGrid via Supabase Edge Function', status: 'Não configurado' },
            { name: 'SMS', desc: 'Twilio API', status: 'Não configurado' },
          ].map(integration => (
            <div
              key={integration.name}
              className="flex items-center justify-between py-2.5 border-b border-slate-50 dark:border-slate-800 last:border-0"
            >
              <div>
                <p className="text-sm font-medium text-slate-700 dark:text-slate-300">{integration.name}</p>
                <p className="text-xs text-slate-400">{integration.desc}</p>
              </div>
              <span className="text-xs px-2.5 py-1 bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400 rounded-full">
                {integration.status}
              </span>
            </div>
          ))}
          <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-2">
            As integrações reais são configuradas via Supabase Edge Functions. Os logs de disparo ficam disponíveis na aba Automações → Logs.
          </p>
        </div>
      </SectionCard>
    </div>
  );
}

// ─── Página principal ─────────────────────────────────────────────────────────

const TABS = [
  { id: 'equipe',       label: 'Equipe',       Icon: Users    },
  { id: 'pipelines',    label: 'Pipelines',    Icon: Kanban   },
  { id: 'segmentos',    label: 'Segmentos',    Icon: Tag      },
  { id: 'preferencias', label: 'Preferências', Icon: Settings },
];

export function CrmSettingsPage() {
  const [activeTab, setActiveTab] = useState('equipe');

  return (
    <div className="space-y-5">
      <CrmPageHeader
        title="Configurações"
        subtitle="Personalize o CRM de acordo com seu processo comercial"
      />

      {/* Tabs */}
      <div className="flex gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl w-fit">
        {TABS.map(tab => {
          const Icon = tab.Icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? 'bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100 shadow-sm'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
              }`}
            >
              <Icon size={14} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Conteúdo */}
      {activeTab === 'equipe'       && <EquipeTab />}
      {activeTab === 'pipelines'    && <PipelinesTab />}
      {activeTab === 'segmentos'    && <SegmentosTab />}
      {activeTab === 'preferencias' && <PreferenciasTab />}
    </div>
  );
}

export default CrmSettingsPage;
