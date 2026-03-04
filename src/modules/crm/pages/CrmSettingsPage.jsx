/**
 * CrmSettingsPage - Configuracoes do CRM.
 * Secao funcional: Equipe Comercial (atribuir cargos CRM aos membros).
 * Secoes placeholder: Pipelines, Tags, Campos, Geral.
 */

import { useState, useEffect } from 'react';
import { Settings, Kanban, Tag, Columns, Users, Check, AlertTriangle, Brain, ChevronDown, ChevronRight, Trophy } from 'lucide-react';
import { CrmPageHeader, CrmAvatar } from '../components/ui';
import { useTeamMembers } from '../../../hooks/queries';
import { updateTeamMember } from '../../../lib/teamService';
import { useCrmPipelines, useLearnedProbabilities, useSetWinStage } from '../hooks/useCrmQueries';

// ==================== CONSTANTES ====================

const CRM_ROLES = [
  { value: 'vendedor', label: 'Vendedor', color: 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 border-emerald-300 dark:border-emerald-700' },
  { value: 'pre_vendedor', label: 'Pre-vendedor', color: 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 border-amber-300 dark:border-amber-700' },
  { value: 'gestor', label: 'Gestor', color: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border-blue-300 dark:border-blue-700' },
];

const settingSections = [
  {
    title: 'Pipelines e Etapas',
    description: 'Gerenciar pipelines, renomear etapas, alterar cores e ordem.',
    icon: Kanban,
    color: 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400',
  },
  {
    title: 'Tags e Segmentos',
    description: 'Criar e gerenciar tags para classificar contatos e negocios.',
    icon: Tag,
    color: 'bg-violet-50 dark:bg-violet-900/20 text-violet-600 dark:text-violet-400',
  },
  {
    title: 'Campos Personalizados',
    description: 'Adicionar campos extras em contatos, empresas e negocios.',
    icon: Columns,
    color: 'bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400',
  },
  {
    title: 'Geral',
    description: 'Moeda padrao, formato de data, notificacoes CRM.',
    icon: Settings,
    color: 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400',
  },
];

// ==================== COMPONENTE PRINCIPAL ====================

export function CrmSettingsPage() {
  const { data: teamMembers = [], refetch } = useTeamMembers();
  const [savingId, setSavingId] = useState(null);
  const [showPipelineStages, setShowPipelineStages] = useState(false);
  const [settingsPipelineId, setSettingsPipelineId] = useState(null);
  const { data: pipelines } = useCrmPipelines();
  const { data: learned } = useLearnedProbabilities(settingsPipelineId);
  const setWinStageMutation = useSetWinStage();
  const selectedPipeline = pipelines?.find(p => p.id === settingsPipelineId);
  const pipelineStages = selectedPipeline?.stages || [];

  useEffect(() => {
    if (pipelines?.length && !settingsPipelineId) {
      setSettingsPipelineId(pipelines[0].id);
    }
  }, [pipelines, settingsPipelineId]);

  const handleSetRole = async (memberId, crmRole) => {
    setSavingId(memberId);
    try {
      await updateTeamMember(memberId, { crmRole });
      await refetch();
    } catch {
      // erro ja tratado pelo service
    } finally {
      setSavingId(null);
    }
  };

  const membersWithRole = teamMembers.filter(m => m.crmRole);
  const membersWithoutRole = teamMembers.filter(m => !m.crmRole);

  return (
    <div className="space-y-6">
      <CrmPageHeader
        title="Configuracoes"
        subtitle="Personalize o CRM de acordo com seu processo"
      />

      {/* ── Equipe Comercial ── */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700/50">
        <div className="flex items-center gap-3 px-5 py-4 border-b border-slate-200 dark:border-slate-700/50">
          <div className="w-9 h-9 rounded-lg bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center">
            <Users size={18} className="text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-200">Equipe Comercial</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Defina o cargo CRM de cada membro. Apenas membros com cargo aparecem nas metas individuais.
            </p>
          </div>
          {membersWithRole.length > 0 && (
            <span className="ml-auto text-xs text-slate-400 dark:text-slate-500">
              {membersWithRole.length} membro{membersWithRole.length !== 1 ? 's' : ''} ativo{membersWithRole.length !== 1 ? 's' : ''}
            </span>
          )}
        </div>

        <div className="divide-y divide-slate-100 dark:divide-slate-800">
          {teamMembers.length === 0 ? (
            <div className="px-5 py-8 text-center">
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Nenhum membro cadastrado. Adicione membros em Configuracoes gerais.
              </p>
            </div>
          ) : (
            [...membersWithRole, ...membersWithoutRole].map((member) => (
              <div key={member.id} className="flex items-center gap-4 px-5 py-3 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                {/* Avatar + Info */}
                <CrmAvatar name={member.name} size="sm" color={member.color} />
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-medium text-slate-800 dark:text-slate-200 truncate">
                    {member.name}
                  </div>
                  {member.role && (
                    <div className="text-xs text-slate-400 dark:text-slate-500 truncate">{member.role}</div>
                  )}
                </div>

                {/* Seletor de cargo CRM */}
                <div className="flex items-center gap-1.5 shrink-0">
                  {CRM_ROLES.map((r) => {
                    const isActive = member.crmRole === r.value;
                    return (
                      <button
                        key={r.value}
                        onClick={() => handleSetRole(member.id, isActive ? null : r.value)}
                        disabled={savingId === member.id}
                        className={`px-2.5 py-1 text-xs font-medium rounded-md border transition-all ${
                          isActive
                            ? `${r.color} ring-1 ring-offset-1 dark:ring-offset-slate-900`
                            : 'border-slate-200 dark:border-slate-700 text-slate-400 dark:text-slate-500 hover:border-slate-300 dark:hover:border-slate-600 hover:text-slate-600 dark:hover:text-slate-300'
                        } disabled:opacity-50`}
                      >
                        {isActive && <Check size={10} className="inline mr-1 -mt-0.5" />}
                        {r.label}
                      </button>
                    );
                  })}
                </div>

                {/* Loading indicator */}
                {savingId === member.id && (
                  <div className="w-4 h-4 border-2 border-blue-300 border-t-blue-600 rounded-full animate-spin shrink-0" />
                )}
              </div>
            ))
          )}
        </div>
      </div>

      {/* ── Pipelines e Etapas (funcional) ── */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700/50">
        <button
          onClick={() => setShowPipelineStages(!showPipelineStages)}
          className="w-full flex items-center gap-4 px-5 py-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
        >
          <div className="w-11 h-11 rounded-xl bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
            <Kanban size={20} />
          </div>
          <div className="text-left flex-1">
            <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-200">Pipelines e Etapas</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Taxas de conversao aprendidas por estagio do pipeline.</p>
          </div>
          <div className="text-slate-400 dark:text-slate-500">
            {showPipelineStages ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
          </div>
        </button>

        {showPipelineStages && (
          <div className="border-t border-slate-200 dark:border-slate-700/50 px-5 py-4 space-y-4">
            {/* Seletor de pipeline */}
            <div className="flex items-center gap-3">
              <label className="text-xs font-medium text-slate-500 dark:text-slate-400">Pipeline:</label>
              <select
                value={settingsPipelineId || ''}
                onChange={(e) => setSettingsPipelineId(e.target.value || null)}
                className="text-xs bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-1.5 text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-1 focus:ring-fyness-primary"
              >
                <option value="">Todas as Pipelines</option>
                {(pipelines || []).map(p => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
              {learned && (
                <div className="ml-auto flex items-center gap-2">
                  <Brain size={14} className="text-violet-500" />
                  <span className="text-xs text-slate-500 dark:text-slate-400">
                    Conversao geral: <span className="font-bold text-emerald-600 dark:text-emerald-400">{learned.overallConversion}%</span>
                  </span>
                </div>
              )}
            </div>

            {/* Tabela de estagios */}
            {pipelineStages.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-[10px] uppercase tracking-wider text-slate-400 dark:text-slate-500 border-b border-slate-200 dark:border-slate-700/50">
                      <th className="text-left py-2 font-medium">Pos.</th>
                      <th className="text-left py-2 font-medium">Estagio</th>
                      <th className="text-center py-2 font-medium">Vitoria</th>
                      <th className="text-center py-2 font-medium">% Aprendido</th>
                      <th className="text-center py-2 font-medium">Deals Analisados</th>
                      <th className="text-center py-2 font-medium">Ganhos</th>
                      <th className="text-center py-2 font-medium">Confianca</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {pipelineStages.map((stage) => {
                      const learnedStage = learned?.stages?.find(s => s.position === stage.position);
                      const lowData = learnedStage ? learnedStage.sampleSize < 10 : true;
                      const prob = learnedStage?.learnedProbability;
                      const probColor = prob != null
                        ? prob >= 60
                          ? 'text-emerald-600 dark:text-emerald-400'
                          : prob >= 30
                            ? 'text-amber-600 dark:text-amber-400'
                            : 'text-rose-600 dark:text-rose-400'
                        : 'text-slate-300 dark:text-slate-600';
                      return (
                        <tr key={stage.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30">
                          <td className="py-2.5 text-slate-400 dark:text-slate-500">{stage.position}</td>
                          <td className="py-2.5">
                            <div className="flex items-center gap-2">
                              <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: stage.color }} />
                              <span className="font-medium text-slate-700 dark:text-slate-300">{stage.name}</span>
                            </div>
                          </td>
                          <td className="py-2.5 text-center">
                            <button
                              onClick={() => setWinStageMutation.mutate({
                                stageId: stage.isWinStage ? null : stage.id,
                                pipelineId: settingsPipelineId,
                              })}
                              disabled={setWinStageMutation.isPending}
                              className={`p-1 rounded-md transition-colors ${
                                stage.isWinStage
                                  ? 'text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-900/20'
                                  : 'text-slate-300 dark:text-slate-600 hover:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                              }`}
                              title={stage.isWinStage ? 'Remover estagio de vitoria' : 'Definir como estagio de vitoria'}
                            >
                              <Trophy size={16} fill={stage.isWinStage ? 'currentColor' : 'none'} />
                            </button>
                          </td>
                          <td className="py-2.5 text-center">
                            {prob != null ? (
                              <span className={`font-bold ${probColor}`}>{prob}%</span>
                            ) : (
                              <span className="text-slate-300 dark:text-slate-600">—</span>
                            )}
                          </td>
                          <td className="py-2.5 text-center text-slate-600 dark:text-slate-400">{learnedStage?.sampleSize ?? '—'}</td>
                          <td className="py-2.5 text-center text-slate-600 dark:text-slate-400">{learnedStage?.wonCount ?? '—'}</td>
                          <td className="py-2.5 text-center">
                            {!learnedStage ? (
                              <span className="text-xs text-slate-300 dark:text-slate-600">—</span>
                            ) : lowData ? (
                              <span className="inline-flex items-center gap-1 text-amber-500 text-xs">
                                <AlertTriangle size={10} /> Insuficiente
                              </span>
                            ) : (
                              <span className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">Confiavel</span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="py-6 text-center">
                <p className="text-sm text-slate-400 dark:text-slate-500">Nenhuma etapa configurada neste pipeline.</p>
              </div>
            )}

            <p className="text-[10px] text-slate-400 dark:text-slate-500">
              Taxas calculadas automaticamente com base no historico. Com mais de 10 deals analisados a confianca e considerada suficiente.
            </p>
          </div>
        )}
      </div>

      {/* ── Outras configuracoes (placeholder) ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {settingSections.filter(s => s.title !== 'Pipelines e Etapas').map((section) => {
          const Icon = section.icon;
          return (
            <div
              key={section.title}
              className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700/50 p-5 hover:shadow-md transition-shadow cursor-pointer group"
            >
              <div className="flex items-start gap-4">
                <div className={`w-11 h-11 rounded-xl ${section.color} flex items-center justify-center shrink-0`}>
                  <Icon size={20} />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-200 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                    {section.title}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{section.description}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default CrmSettingsPage;
