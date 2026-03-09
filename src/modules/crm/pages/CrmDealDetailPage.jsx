/**
 * CrmDealDetailPage - Detalhe completo de um negocio (estilo RD Station).
 * Layout 2 colunas: sidebar info + main com tabs (atividades, historico, notas).
 */

import { useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft, Pencil, XCircle, Plus,
  Mail, Phone, Building2, CalendarCheck, Target,
  CheckSquare, Video, Coffee, MapPin, StickyNote,
  Clock, DollarSign, TrendingUp, GitBranch, User,
} from 'lucide-react';
import { CrmBadge, CrmAvatar } from '../components/ui';
import {
  useCrmDeal, useUpdateCrmDeal, useMarkDealLost,
  useDealActivities, useDealStageHistory,
} from '../hooks/useCrmQueries';
import { DealFormModal } from '../components/DealFormModal';
import { ActivityFormModal } from '../components/ActivityFormModal';
import { LostReasonModal } from '../components/LostReasonModal';

const formatCurrency = (val) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val || 0);

const formatDate = (dateStr) => {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('pt-BR');
};

const formatDateTime = (dateStr) => {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
};

const STATUS_MAP = {
  open: { label: 'Aberto', variant: 'info' },
  won: { label: 'Ganho', variant: 'success' },
  lost: { label: 'Perdido', variant: 'danger' },
};

const ACTIVITY_ICONS = {
  call: Phone, email: Mail, meeting: Video,
  task: CheckSquare, follow_up: Coffee, visit: MapPin,
};

const ACTIVITY_LABELS = {
  call: 'Ligacao', email: 'Email', meeting: 'Reuniao',
  task: 'Tarefa', follow_up: 'Follow-up', visit: 'Visita',
};

const TABS = [
  { id: 'activities', label: 'Atividades', icon: CalendarCheck },
  { id: 'history', label: 'Historico', icon: GitBranch },
  { id: 'notes', label: 'Notas', icon: StickyNote },
];

// ==================== PAGINA ====================

export function CrmDealDetailPage() {
  const { dealId } = useParams();
  const navigate = useNavigate();

  const { data: deal, isLoading } = useCrmDeal(dealId);
  const { data: activities = [] } = useDealActivities(dealId);
  const { data: stageHistory = [] } = useDealStageHistory(dealId);

  const updateMutation = useUpdateCrmDeal();
  const lostMutation = useMarkDealLost();

  const [activeTab, setActiveTab] = useState('activities');
  const [editOpen, setEditOpen] = useState(false);
  const [activityFormOpen, setActivityFormOpen] = useState(false);
  const [lostModalOpen, setLostModalOpen] = useState(false);
  const [notes, setNotes] = useState(null);
  const [notesSaving, setNotesSaving] = useState(false);

  const saveNotes = useCallback(async (value) => {
    if (!dealId) return;
    setNotesSaving(true);
    await updateMutation.mutateAsync({ id: dealId, updates: { notes: value } });
    setNotesSaving(false);
  }, [dealId, updateMutation]);

  // Loading
  if (isLoading) {
    return (
      <div className="animate-pulse space-y-6">
        <div className="h-8 w-40 bg-slate-200 dark:bg-slate-700 rounded" />
        <div className="flex gap-6">
          <div className="w-80 shrink-0 space-y-4">
            {[1, 2, 3, 4].map(i => <div key={i} className="h-16 bg-slate-200 dark:bg-slate-700 rounded-xl" />)}
          </div>
          <div className="flex-1 space-y-4">
            <div className="h-10 bg-slate-200 dark:bg-slate-700 rounded" />
            <div className="h-64 bg-slate-200 dark:bg-slate-700 rounded-xl" />
          </div>
        </div>
      </div>
    );
  }

  // Not found
  if (!deal) {
    return (
      <div className="text-center py-16">
        <p className="text-slate-500 dark:text-slate-400 mb-4">Negocio nao encontrado</p>
        <button onClick={() => navigate('/crm/pipeline')} className="text-sm text-blue-600 hover:underline">Voltar para o Pipeline</button>
      </div>
    );
  }

  const st = STATUS_MAP[deal.status] || STATUS_MAP.open;
  const currentNotes = notes !== null ? notes : (deal.notes || '');
  const probColor = deal.probability >= 70 ? 'bg-emerald-500' : deal.probability >= 30 ? 'bg-amber-500' : 'bg-rose-500';

  return (
    <div className="space-y-5">
      {/* ===== HEADER ===== */}
      <div className="flex items-center justify-between">
        <button onClick={() => navigate('/crm/pipeline')} className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 transition-colors">
          <ArrowLeft size={16} /> Pipeline
        </button>
        <div className="flex items-center gap-2">
          {deal.status === 'open' && (
            <button
              onClick={() => setLostModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-rose-50 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400 hover:bg-rose-100 dark:hover:bg-rose-900/50 border border-rose-200 dark:border-rose-800 transition-colors"
            >
              <XCircle size={13} /> Perdido
            </button>
          )}
          <button
            onClick={() => setEditOpen(true)}
            className="flex items-center gap-1.5 px-4 py-1.5 bg-fyness-primary hover:bg-fyness-secondary text-white text-xs font-medium rounded-lg transition-colors"
          >
            <Pencil size={13} /> Editar
          </button>
        </div>
      </div>

      {/* Titulo + Status */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center shrink-0">
          <Target size={20} className="text-blue-600 dark:text-blue-400" />
        </div>
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl font-bold text-slate-800 dark:text-slate-100">{deal.title}</h1>
            <CrmBadge variant={st.variant} dot>{st.label}</CrmBadge>
          </div>
          {deal.lostReason && deal.status === 'lost' && (
            <p className="text-xs text-rose-500 mt-0.5">Motivo: {deal.lostReason}</p>
          )}
        </div>
      </div>

      {/* ===== LAYOUT 2 COLUNAS ===== */}
      <div className="flex gap-6">
        {/* SIDEBAR */}
        <div className="w-80 shrink-0 space-y-3">
          {/* Valor */}
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700/50 p-4">
            <div className="flex items-center gap-2 mb-1">
              <DollarSign size={14} className="text-slate-400" />
              <span className="text-[10px] text-slate-400 uppercase tracking-wider">Valor</span>
            </div>
            <span className="text-2xl font-bold text-slate-800 dark:text-slate-100">{formatCurrency(deal.value)}</span>
          </div>

          {/* Estagio */}
          {deal.stage && (
            <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700/50 p-4">
              <div className="flex items-center gap-2 mb-1.5">
                <Target size={14} className="text-slate-400" />
                <span className="text-[10px] text-slate-400 uppercase tracking-wider">Estagio</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: deal.stage.color }} />
                <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">{deal.stage.name}</span>
              </div>
            </div>
          )}

          {/* Probabilidade */}
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700/50 p-4">
            <div className="flex items-center gap-2 mb-1.5">
              <TrendingUp size={14} className="text-slate-400" />
              <span className="text-[10px] text-slate-400 uppercase tracking-wider">Probabilidade</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex-1 h-2 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                <div className={`h-full rounded-full ${probColor}`} style={{ width: `${deal.probability}%` }} />
              </div>
              <span className="text-sm font-bold text-slate-700 dark:text-slate-300">{deal.probability}%</span>
            </div>
          </div>

          {/* Previsao */}
          {deal.expectedCloseDate && (
            <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700/50 p-4">
              <div className="flex items-center gap-2 mb-1">
                <CalendarCheck size={14} className="text-slate-400" />
                <span className="text-[10px] text-slate-400 uppercase tracking-wider">Previsao de fechamento</span>
              </div>
              <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">{formatDate(deal.expectedCloseDate)}</span>
            </div>
          )}

          {/* Vendedor Responsavel */}
          {deal.owner && (
            <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700/50 p-4">
              <div className="text-[10px] text-slate-400 uppercase tracking-wider mb-2">Vendedor Responsavel</div>
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0" style={{ backgroundColor: deal.owner.color || '#6366f1' }}>
                  {deal.owner.name?.charAt(0)?.toUpperCase()}
                </div>
                <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{deal.owner.name}</span>
              </div>
            </div>
          )}

          {/* Separador */}
          <div className="border-t border-slate-200 dark:border-slate-700/50" />

          {/* Contato */}
          {deal.contact && (
            <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700/50 p-4">
              <div className="text-[10px] text-slate-400 uppercase tracking-wider mb-2">Contato</div>
              <div className="flex items-center gap-2.5 mb-2">
                <CrmAvatar name={deal.contact.name} size="sm" color={deal.contact.avatarColor} />
                <button onClick={() => navigate(`/crm/contacts/${deal.contact.id}`)} className="text-sm font-medium text-blue-600 dark:text-blue-400 hover:underline">
                  {deal.contact.name}
                </button>
              </div>
              {deal.contact.email && (
                <a href={`mailto:${deal.contact.email}`} className="flex items-center gap-2 text-xs text-slate-500 hover:text-blue-600 dark:hover:text-blue-400 mb-1 transition-colors">
                  <Mail size={12} /> {deal.contact.email}
                </a>
              )}
              {deal.contact.phone && (
                <a href={`tel:${deal.contact.phone}`} className="flex items-center gap-2 text-xs text-slate-500 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                  <Phone size={12} /> {deal.contact.phone}
                </a>
              )}
            </div>
          )}

          {/* Empresa */}
          {deal.company && (
            <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700/50 p-4">
              <div className="text-[10px] text-slate-400 uppercase tracking-wider mb-2">Empresa</div>
              <div className="flex items-center gap-2">
                <Building2 size={14} className="text-slate-400" />
                <button onClick={() => navigate(`/crm/companies/${deal.company.id}`)} className="text-sm font-medium text-blue-600 dark:text-blue-400 hover:underline">
                  {deal.company.name}
                </button>
              </div>
            </div>
          )}

          {/* Separador */}
          <div className="border-t border-slate-200 dark:border-slate-700/50" />

          {/* Datas */}
          <div className="space-y-1 px-1">
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <Clock size={11} /> Criado: {formatDate(deal.createdAt)}
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <Clock size={11} /> Atualizado: {formatDate(deal.updatedAt)}
            </div>
            {deal.closedAt && (
              <div className="flex items-center gap-2 text-xs text-slate-400">
                <Clock size={11} /> Fechado: {formatDate(deal.closedAt)}
              </div>
            )}
          </div>
        </div>

        {/* ===== MAIN CONTENT ===== */}
        <div className="flex-1 min-w-0">
          {/* Tabs */}
          <div className="border-b border-slate-200 dark:border-slate-700/50 mb-4">
            <div className="flex gap-0">
              {TABS.map(tab => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                      isActive
                        ? 'border-blue-600 text-blue-600 dark:text-blue-400 dark:border-blue-400'
                        : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                    }`}
                  >
                    <Icon size={15} /> {tab.label}
                    {tab.id === 'activities' && activities.filter(a => !a.completed).length > 0 && (
                      <span className="text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-500 px-1.5 py-0.5 rounded-full">{activities.filter(a => !a.completed).length}</span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Tab: Atividades (somente pendentes) */}
          {activeTab === 'activities' && (() => {
            const pending = activities.filter(a => !a.completed);
            return (
              <div>
                <button
                  onClick={() => setActivityFormOpen(true)}
                  className="mb-4 flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg bg-fyness-primary hover:bg-fyness-secondary text-white transition-colors"
                >
                  <Plus size={15} /> Nova Atividade
                </button>

                {pending.length === 0 ? (
                  <div className="py-12 text-center text-sm text-slate-400 dark:text-slate-500">
                    Nenhuma atividade pendente
                  </div>
                ) : (
                  <div className="relative pl-6">
                    <div className="absolute left-[11px] top-2 bottom-2 w-px bg-slate-200 dark:bg-slate-700/50" />
                    <div className="space-y-1">
                      {pending.map(act => {
                        const Icon = ACTIVITY_ICONS[act.type] || CalendarCheck;
                        const label = ACTIVITY_LABELS[act.type] || act.type;
                        return (
                          <div key={act.id} className="flex items-start gap-3 py-2.5 relative">
                            <div className="w-[26px] h-[26px] rounded-full flex items-center justify-center shrink-0 z-10 ring-2 ring-white dark:ring-slate-950 -ml-[19px] bg-blue-100 dark:bg-blue-900/30">
                              <Icon size={12} className="text-blue-600 dark:text-blue-400" />
                            </div>
                            <div className="flex-1 min-w-0 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-700/50 px-4 py-3">
                              <div className="flex items-center justify-between gap-2 mb-0.5">
                                <span className="text-sm font-medium text-slate-800 dark:text-slate-200">{act.title}</span>
                                <CrmBadge variant="neutral" size="sm">{label}</CrmBadge>
                              </div>
                              {act.description && (
                                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">{act.description}</p>
                              )}
                              <div className="flex items-center gap-3 mt-2 text-[10px] text-slate-400">
                                <span>{formatDate(act.startDate)}</span>
                                {act.contact && (
                                  <>
                                    <span>·</span>
                                    <span>{act.contact.name}</span>
                                  </>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            );
          })()}

          {/* Tab: Historico (movimentacoes + atividades concluidas) */}
          {activeTab === 'history' && (() => {
            const completedActs = activities.filter(a => a.completed).map(a => ({
              _type: 'activity', _date: a.completedAt || a.startDate, ...a,
            }));
            const stageEntries = stageHistory.map(e => ({
              _type: 'stage', _date: e.createdAt, ...e,
            }));
            const timeline = [...completedActs, ...stageEntries].sort((a, b) =>
              new Date(b._date) - new Date(a._date)
            );

            return (
              <div>
                {timeline.length === 0 ? (
                  <div className="py-12 text-center text-sm text-slate-400 dark:text-slate-500">
                    Nenhum historico registrado
                  </div>
                ) : (
                  <div className="relative pl-6">
                    <div className="absolute left-[11px] top-2 bottom-2 w-px bg-slate-200 dark:bg-slate-700/50" />
                    <div className="space-y-1">
                      {timeline.map((item, idx) => {
                        if (item._type === 'activity') {
                          const Icon = ACTIVITY_ICONS[item.type] || CalendarCheck;
                          const label = ACTIVITY_LABELS[item.type] || item.type;
                          return (
                            <div key={`act-${item.id}`} className="flex items-start gap-3 py-2.5 relative">
                              <div className="w-[26px] h-[26px] rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center shrink-0 z-10 ring-2 ring-white dark:ring-slate-950 -ml-[19px]">
                                <Icon size={12} className="text-emerald-600 dark:text-emerald-400" />
                              </div>
                              <div className="flex-1 min-w-0 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-700/50 px-4 py-3">
                                <div className="flex items-center justify-between gap-2 mb-0.5">
                                  <span className="text-sm font-medium text-slate-800 dark:text-slate-200">{item.title}</span>
                                  <div className="flex items-center gap-2 shrink-0">
                                    <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium">Concluida</span>
                                    <CrmBadge variant="neutral" size="sm">{label}</CrmBadge>
                                  </div>
                                </div>
                                {item.description && (
                                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">{item.description}</p>
                                )}
                                <div className="flex items-center gap-3 mt-2 text-[10px] text-slate-400">
                                  <span>{formatDateTime(item.completedAt || item.startDate)}</span>
                                  {item.contact && (
                                    <>
                                      <span>·</span>
                                      <span>{item.contact.name}</span>
                                    </>
                                  )}
                                </div>
                              </div>
                            </div>
                          );
                        }
                        // stage transition
                        return (
                          <div key={`stg-${item.id || idx}`} className="flex items-start gap-3 py-2 relative">
                            <div className="w-[22px] h-[22px] rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center shrink-0 z-10 ring-2 ring-white dark:ring-slate-950 -ml-[17px]">
                              <GitBranch size={10} className="text-slate-500 dark:text-slate-400" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                {item.stage ? (
                                  <div className="flex items-center gap-1.5">
                                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: item.stage.color }} />
                                    <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{item.stage.name}</span>
                                  </div>
                                ) : (
                                  <span className="text-sm text-slate-500">Estagio movido</span>
                                )}
                              </div>
                              <span className="text-[10px] text-slate-400">{formatDateTime(item.createdAt)}</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            );
          })()}

          {/* Tab: Notas */}
          {activeTab === 'notes' && (
            <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700/50 p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-slate-600 dark:text-slate-400">Anotacoes</span>
                {notesSaving && <span className="text-xs text-slate-400 animate-pulse">Salvando...</span>}
              </div>
              <textarea
                value={currentNotes}
                onChange={(e) => setNotes(e.target.value)}
                onBlur={() => { if (notes !== null && notes !== (deal.notes || '')) saveNotes(notes); }}
                rows={12}
                placeholder="Escreva suas anotacoes sobre este negocio..."
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-fyness-primary resize-none"
              />
            </div>
          )}
        </div>
      </div>

      {/* Edit Modal */}
      <DealFormModal
        open={editOpen}
        onClose={() => setEditOpen(false)}
        deal={deal}
        defaultPipelineId={deal.pipelineId}
        defaultStageId={deal.stageId}
      />

      {/* Activity Form Modal */}
      <ActivityFormModal
        open={activityFormOpen}
        onClose={() => setActivityFormOpen(false)}
        defaultDealId={dealId}
        defaultContactId={deal.contactId}
      />

      {/* Lost Reason Modal */}
      <LostReasonModal
        open={lostModalOpen}
        onClose={() => setLostModalOpen(false)}
        isPending={lostMutation.isPending}
        onConfirm={(reason) => {
          lostMutation.mutate({ dealId: deal.id, reason }, {
            onSuccess: () => setLostModalOpen(false),
          });
        }}
      />
    </div>
  );
}

export default CrmDealDetailPage;
