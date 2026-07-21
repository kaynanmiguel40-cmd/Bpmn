/**
 * CrmDealDetailPage - Detalhe completo de um negocio (estilo RD Station).
 * Layout 2 colunas: sidebar info + main com 3 abas:
 *   Atividades — o que FAZER: processo da etapa (playbook) + tarefas avulsas
 *                pendentes.
 *   Historico  — o que FOI FEITO: passos do processo cumpridos + tarefas
 *                manuais concluidas + mudancas de etapa, numa linha do tempo so.
 *   Notas      — anotacoes livres.
 */

import { useState, useCallback, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft, Pencil, XCircle, Plus, CheckCircle2, CalendarDays,
  Mail, Phone, Smartphone, MessageCircle, Building2, CalendarCheck, Target,
  CheckSquare, Video, Coffee, MapPin, StickyNote, History, ListChecks, CornerDownRight,
  Clock, DollarSign, TrendingUp, GitBranch, User,
} from 'lucide-react';
import { CrmBadge, CrmAvatar } from '../components/ui';
import { DealProcessChecklist } from '../components/DealProcessChecklist';
import { LeadHistoryTimeline } from '../components/LeadHistoryTimeline';
import { useLeadNotes } from '../hooks/useWorkQueue';
import {
  useCrmDeal, useUpdateCrmDeal, useMarkDealLost,
  useDealActivities, useDealStageHistory, useCompleteCrmActivity, useDealProgress, useStagePlaybook,
} from '../hooks/useCrmQueries';
import { getDealLeadInfo } from '../services/crmDealsService';
import { DealFormModal } from '../components/DealFormModal';
import { ActivityFormModal } from '../components/ActivityFormModal';
import { CompleteActivityModal } from '../components/CompleteActivityModal';
import { LostReasonModal } from '../components/LostReasonModal';

const formatCurrency = (val) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val || 0);

function formatPhone(val) {
  if (!val) return '';
  const clean = val.replace(/\D/g, '');
  if (clean.length === 11) return clean.replace(/^(\d{2})(\d{5})(\d{4})$/, '($1) $2-$3');
  if (clean.length === 10) return clean.replace(/^(\d{2})(\d{4})(\d{4})$/, '($1) $2-$3');
  return val;
}

function detectPhoneType(val) {
  if (!val) return null;
  const clean = val.replace(/\D/g, '');
  const local = clean.length >= 12 && clean.startsWith('55') ? clean.slice(2) : clean;
  if (local.length === 11 && local[2] === '9') return 'mobile';
  if (local.length === 10) return 'landline';
  return null;
}

function whatsappUrl(val) {
  if (!val) return null;
  const clean = val.replace(/\D/g, '');
  if (clean.length < 10) return null;
  const withCountry = clean.startsWith('55') && clean.length >= 12 ? clean : `55${clean}`;
  return `https://wa.me/${withCountry}`;
}

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
  call: Phone, email: Mail, message: MessageCircle, meeting: Video,
  task: CheckSquare, follow_up: Coffee, visit: MapPin,
};

const ACTIVITY_LABELS = {
  call: 'Ligacao', email: 'Email', message: 'Mensagem', meeting: 'Reuniao',
  task: 'Tarefa', follow_up: 'Follow-up', visit: 'Visita',
};

const TABS = [
  // Atividades = o que FAZER: o processo da etapa (playbook) + tarefas pendentes.
  { id: 'activities', label: 'Atividades', icon: CalendarCheck },
  // Historico = o que FOI FEITO: passos do processo + tarefas manuais concluidas
  // + mudancas de etapa, numa linha do tempo so.
  { id: 'history', label: 'Histórico', icon: History },
  { id: 'notes', label: 'Notas', icon: StickyNote },
];

// ==================== PAGINA ====================

export function CrmDealDetailPage() {
  const { dealId } = useParams();
  const navigate = useNavigate();

  const { data: deal, isLoading } = useCrmDeal(dealId);
  const { data: activities = [] } = useDealActivities(dealId);
  const { data: stageHistory = [] } = useDealStageHistory(dealId);
  // Passos do playbook cumpridos por este lead — entram no Historico junto com
  // as tarefas manuais. O titulo vem do playbook da pipeline (qualquer etapa,
  // pra mostrar tambem o que ele cumpriu antes de chegar na atual).
  const { data: dealProgress = [] } = useDealProgress(dealId);
  const { data: leadNotes = [] } = useLeadNotes(dealId);
  const { data: pipelinePlaybook } = useStagePlaybook(deal?.pipelineId);
  const stepTitleById = useMemo(() => {
    const map = {};
    Object.values(pipelinePlaybook || {}).forEach(list =>
      (list || []).forEach(s => { map[s.id] = s.title; }));
    return map;
  }, [pipelinePlaybook]);
  const progress = dealProgress;

  const updateMutation = useUpdateCrmDeal();
  const lostMutation = useMarkDealLost();
  const completeMutation = useCompleteCrmActivity();

  const [activeTab, setActiveTab] = useState('activities');
  const [editOpen, setEditOpen] = useState(false);
  const [activityFormOpen, setActivityFormOpen] = useState(false);
  const [editActivity, setEditActivity] = useState(null);
  const [completingTask, setCompletingTask] = useState(null);
  const [lostModalOpen, setLostModalOpen] = useState(false);
  const [notes, setNotes] = useState(null);
  const [notesSaving, setNotesSaving] = useState(false);

  const saveNotes = useCallback(async (value) => {
    if (!dealId) return;
    setNotesSaving(true);
    try {
      await updateMutation.mutateAsync({ id: dealId, updates: { notes: value } });
    } finally {
      setNotesSaving(false);
    }
  }, [dealId, updateMutation]);

  // Loading
  if (isLoading) {
    return (
      <div className="animate-pulse space-y-6">
        <div className="h-8 w-40 bg-slate-200 dark:bg-slate-700 rounded" />
        <div className="flex flex-col lg:flex-row gap-6">
          <div className="w-full lg:w-80 shrink-0 space-y-4">
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

  // Contador da aba Atividades = tudo que esta PENDENTE, do processo e avulso.
  // O que a aba lista separado (processo em cima, avulsas embaixo) aqui soma:
  // o selo responde "quanto falta fazer com esse lead".
  const pendingCount = activities.filter(a => !a.completed).length;

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
          <button
            onClick={() => navigate(`/crm/agenda?dealId=${dealId}`)}
            title="Ver as tarefas deste negócio na Agenda"
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
          >
            <CalendarDays size={13} /> Ver na Agenda
          </button>
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
      <div className="flex flex-col lg:flex-row gap-6">
        {/* SIDEBAR */}
        <div className="w-full lg:w-80 shrink-0 space-y-3">
          {/* Valor */}
          <div className="crm-glass rounded-2xl p-4">
            <div className="flex items-center gap-2 mb-1">
              <DollarSign size={14} className="text-slate-400" />
              <span className="text-[12px] text-slate-400 uppercase tracking-wider">Valor</span>
            </div>
            <span className="text-2xl font-bold text-slate-800 dark:text-slate-100">{formatCurrency(deal.value)}</span>
          </div>

          {/* Estagio */}
          {deal.stage && (
            <div className="crm-glass rounded-2xl p-4">
              <div className="flex items-center gap-2 mb-1.5">
                <Target size={14} className="text-slate-400" />
                <span className="text-[12px] text-slate-400 uppercase tracking-wider">Estagio</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: deal.stage.color }} />
                <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">{deal.stage.name}</span>
              </div>
            </div>
          )}

          {/* Probabilidade */}
          <div className="crm-glass rounded-2xl p-4">
            <div className="flex items-center gap-2 mb-1.5">
              <TrendingUp size={14} className="text-slate-400" />
              <span className="text-[12px] text-slate-400 uppercase tracking-wider">Probabilidade</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex-1 h-2 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                <div className={`h-full rounded-full ${probColor}`} style={{ width: `${deal.probability}%` }} />
              </div>
              <span className="text-sm font-bold text-slate-700 dark:text-slate-300">{deal.probability}%</span>
            </div>
          </div>

          {/* Segmento */}
          {deal.segment && (
            <div className="crm-glass rounded-2xl p-4">
              <div className="flex items-center gap-2 mb-1.5">
                <Building2 size={14} className="text-slate-400" />
                <span className="text-[12px] text-slate-400 uppercase tracking-wider">Segmento</span>
              </div>
              <CrmBadge variant="violet">{deal.segment}</CrmBadge>
            </div>
          )}

          {/* Origem do Lead */}
          {deal.source && (
            <div className="crm-glass rounded-2xl p-4">
              <div className="flex items-center gap-2 mb-1.5">
                <GitBranch size={14} className="text-slate-400" />
                <span className="text-[12px] text-slate-400 uppercase tracking-wider">Origem do lead</span>
              </div>
              <CrmBadge variant="blue">{deal.source}</CrmBadge>
            </div>
          )}

          {/* Previsao */}
          {deal.expectedCloseDate && (
            <div className="crm-glass rounded-2xl p-4">
              <div className="flex items-center gap-2 mb-1">
                <CalendarCheck size={14} className="text-slate-400" />
                <span className="text-[12px] text-slate-400 uppercase tracking-wider">Previsao de fechamento</span>
              </div>
              <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">{formatDate(deal.expectedCloseDate)}</span>
            </div>
          )}

          {/* Vendedor Responsavel */}
          {deal.owner && (
            <div className="crm-glass rounded-2xl p-4">
              <div className="text-[12px] text-slate-400 uppercase tracking-wider mb-2">Vendedor Responsavel</div>
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

          {/* Contato — vinculado sempre vence; digitado no deal e so fallback (getDealLeadInfo) */}
          {(() => {
            const { name: ctName, phone: ctPhone, email: ctEmail } = getDealLeadInfo(deal);
            if (!ctName && !ctEmail && !ctPhone) return null;

            const phoneType = detectPhoneType(ctPhone);
            const PhoneIcon = phoneType === 'mobile' ? Smartphone : Phone;
            const phoneTitle = phoneType === 'mobile'
              ? 'Celular — pode ter WhatsApp'
              : phoneType === 'landline'
                ? 'Fixo — sem WhatsApp'
                : '';

            return (
              <div className="crm-glass rounded-2xl p-4">
                <div className="text-[12px] text-slate-400 uppercase tracking-wider mb-2">Contato</div>
                {ctName && (
                  <div className="flex items-center gap-2.5 mb-3">
                    <CrmAvatar name={ctName} size="sm" color={deal.contact?.avatarColor} />
                    {deal.contact?.id ? (
                      <button onClick={() => navigate(`/crm/contacts/${deal.contact.id}`)} className="text-sm font-medium text-blue-600 dark:text-blue-400 hover:underline">
                        {ctName}
                      </button>
                    ) : (
                      <span className="text-sm font-medium text-slate-700 dark:text-slate-200">{ctName}</span>
                    )}
                  </div>
                )}

                {/* Atalhos de contato */}
                {(ctPhone || ctEmail) && (
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {ctPhone && (
                      <a
                        href={`tel:${ctPhone}`}
                        title={`Ligar ${phoneTitle ? `· ${phoneTitle}` : ''}`}
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-medium transition-colors ${
                          phoneType === 'mobile'
                            ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 dark:hover:bg-emerald-900/40'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700'
                        }`}
                      >
                        <PhoneIcon size={12} />
                        {formatPhone(ctPhone)}
                      </a>
                    )}
                    {ctPhone && phoneType === 'mobile' && whatsappUrl(ctPhone) && (
                      <a
                        href={whatsappUrl(ctPhone)}
                        target="_blank"
                        rel="noopener noreferrer"
                        title="Abrir conversa no WhatsApp"
                        className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-medium bg-[#25D366]/10 text-[#1faf52] hover:bg-[#25D366]/20 transition-colors"
                      >
                        <MessageCircle size={12} />
                        WhatsApp
                      </a>
                    )}
                    {ctEmail && (
                      <a
                        href={`mailto:${ctEmail}`}
                        title={`Enviar e-mail · ${ctEmail}`}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-medium bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-colors"
                      >
                        <Mail size={12} />
                        E-mail
                      </a>
                    )}
                  </div>
                )}

                {/* Linhas auxiliares (texto puro, ja vai ter os botoes em cima) */}
                {ctEmail && (
                  <div className="text-[12px] text-slate-500 dark:text-slate-400 mt-2 truncate" title={ctEmail}>
                    {ctEmail}
                  </div>
                )}
              </div>
            );
          })()}

          {/* Empresa */}
          {deal.company && (
            <div className="crm-glass rounded-2xl p-4">
              <div className="text-[12px] text-slate-400 uppercase tracking-wider mb-2">Empresa</div>
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
                    {tab.id === 'activities' && pendingCount > 0 && (
                      <span className="text-[12px] bg-slate-100 dark:bg-slate-800 text-slate-500 px-1.5 py-0.5 rounded-full">{pendingCount}</span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Tab: Atividades — o que FAZER: processo da etapa + tarefas pendentes */}
          {activeTab === 'activities' && (() => {
            // AVULSA = criada a mao. A tarefa que veio do playbook (stageStepId)
            // ja esta logo acima, no bloco do processo — listar de novo aqui
            // fazia a MESMA tarefa aparecer duas vezes na mesma tela.
            const pending = activities.filter(a => !a.completed && !a.stageStepId);
            return (
              <div className="space-y-5">
                {/* Processo da etapa: as tarefas do playbook */}
                <div className="crm-glass rounded-2xl p-4">
                  <DealProcessChecklist deal={deal} />
                </div>

                {/* Tarefas avulsas (criadas a mao) ainda pendentes */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-[12px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                      Tarefas avulsas
                    </h4>
                    <button
                      onClick={() => { setEditActivity(null); setActivityFormOpen(true); }}
                      className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-fyness-primary hover:bg-fyness-secondary text-white transition-colors"
                    >
                      <Plus size={13} /> Nova
                    </button>
                  </div>
                  {pending.length === 0 ? (
                    <div className="py-6 text-center text-xs text-slate-500 dark:text-slate-400">
                      Nenhuma tarefa avulsa pendente.
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
                              {/* Clicar na tarefa abre a EXECUCAO dela na Agenda —
                                  a Agenda e o nivel de execucao, e clicar aqui
                                  significa "vou fazer isso agora". Editar (a
                                  antiga acao do clique) virou o lapis ao lado. */}
                              <button
                                type="button"
                                onClick={() => navigate(`/crm/agenda?dealId=${dealId}&date=${encodeURIComponent(act.startDate)}&activityId=${act.id}`)}
                                title="Abrir esta tarefa na Agenda"
                                className="flex-1 min-w-0 text-left crm-glass rounded-2xl px-4 py-3 hover:ring-1 hover:ring-fyness-primary/30 transition-shadow"
                              >
                                <div className="flex items-center justify-between gap-2 mb-0.5">
                                  <span className="text-sm font-medium text-slate-800 dark:text-slate-200">{act.title}</span>
                                  <CrmBadge variant="neutral" size="sm">{label}</CrmBadge>
                                </div>
                                {act.description && (
                                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">{act.description}</p>
                                )}
                                <div className="flex items-center gap-3 mt-2 text-[12px] text-slate-400">
                                  <span>{formatDateTime(act.startDate)}</span>
                                  {act.contact && (<><span>·</span><span>{act.contact.name}</span></>)}
                                </div>
                              </button>
                              <button
                                type="button"
                                onClick={(e) => { e.stopPropagation(); setEditActivity(act); setActivityFormOpen(true); }}
                                title="Editar tarefa"
                                className="shrink-0 self-center text-slate-500 dark:text-slate-400 hover:text-fyness-primary transition-colors"
                              >
                                <Pencil size={16} />
                              </button>
                              <button
                                type="button"
                                onClick={(e) => { e.stopPropagation(); setCompletingTask({ id: act.id, title: act.title, type: act.type }); }}
                                title="Marcar como concluída"
                                className="shrink-0 self-center text-slate-500 dark:text-slate-400 hover:text-emerald-500 transition-colors"
                              >
                                <CheckCircle2 size={20} />
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })()}

          {/* Tab: Histórico — o que FOI FEITO (processo + manuais + etapas).
              O LAYOUT mora em LeadHistoryTimeline, compartilhado com o painel
              da Agenda: mesma pergunta, mesma resposta, venha de onde vier. */}
          {activeTab === 'history' && (() => {
            const completedActs = activities.filter(a => a.completed).map(a => ({
              _type: 'activity', _date: a.completedAt || a.startDate,
              id: a.id, title: a.title, type: a.type, description: a.description,
              deliveryInput: a.deliveryInput, deliveryReport: a.deliveryReport,
              contactName: a.contact?.name || null,
              // PREVISTO x REALIZADO: o fim da janela agendada (ou o inicio,
              // quando a tarefa nao tem fim) contra a hora em que foi concluida.
              plannedAt: a.endDate || a.startDate,
              completedAt: a.completedAt,
            }));
            // Concluir uma tarefa do processo na Agenda grava DUAS coisas: a
            // atividade concluida e o progresso do passo. Se as duas entrassem
            // na linha do tempo, cada toque da cadencia apareceria duas vezes.
            // A ATIVIDADE ganha, porque carrega mais: horario real, canal e o
            // par do que foi feito / do que o lead respondeu.
            const passosJaNaAtividade = new Set(
              activities.filter(a => a.completed && a.stageStepId).map(a => a.stageStepId),
            );
            // Sobra o passo marcado SEM atividade correspondente (backfill,
            // dado legado) — esse ainda precisa aparecer, senao some do
            // historico.
            const stepEntries = (progress || [])
              .filter(p => !passosJaNaAtividade.has(p.stepId))
              .map(p => ({
                _type: 'step', _date: p.doneAt, id: p.id,
                title: stepTitleById[p.stepId] || 'Tarefa do processo',
                outcome: p.outcome || '',
              }));
            const timeline = [...completedActs, ...stepEntries].sort((a, b) =>
              new Date(b._date) - new Date(a._date)
            );

            // O diario do lead virou TABELA (crm_lead_notes) na migration 104:
            // o texto do campo `notes` foi quebrado em registros datados, que
            // caem cada um na etapa em que o lead estava naquele dia.
            leadNotes.forEach(n => timeline.push({
              _type: 'note', _date: n.date, id: n.id, text: n.content, title: n.title,
            }));
            // O que sobrou no campo e nota de verdade — sem data, vai pro fim.
            if (deal.notes?.trim()) {
              timeline.push({ _type: 'note', _date: null, id: 'nota-atual', text: deal.notes.trim() });
            }
            // Reordena DEPOIS: as notas entram fora de ordem, e o agrupamento
            // por etapa percorre o array em ordem — fora dela, a mesma etapa
            // apareceria como varios grupos repetidos.
            timeline.sort((a, b) => new Date(b._date || 0) - new Date(a._date || 0));

            return <LeadHistoryTimeline items={timeline} stageHistory={stageHistory} />;
          })()}

          {/* Tab: Processo — o que fazer na etapa atual deste lead */}
          {activeTab === 'process' && (
            <div className="crm-glass rounded-2xl p-4">
              <DealProcessChecklist deal={deal} />
            </div>
          )}

          {/* Tab: Notas */}
          {activeTab === 'notes' && (
            <div className="crm-glass rounded-2xl p-4">
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
        onClose={() => { setActivityFormOpen(false); setEditActivity(null); }}
        activity={editActivity}
        defaultDealId={dealId}
        defaultContactId={deal.contactId}
      />

      {/* Complete Activity Modal — input/output da tarefa concluída */}
      <CompleteActivityModal
        open={!!completingTask}
        onClose={() => setCompletingTask(null)}
        activity={completingTask}
        isPending={completeMutation.isPending}
        onSubmit={({ input, output }) => {
          completeMutation.mutate({ id: completingTask.id, input, output }, {
            onSuccess: () => setCompletingTask(null),
          });
        }}
      />

      {/* Lost Reason Modal */}
      <LostReasonModal
        open={lostModalOpen}
        onClose={() => setLostModalOpen(false)}
        isPending={lostMutation.isPending}
        onConfirm={(reason, resgatavel) => {
          lostMutation.mutate({ dealId: deal.id, reason, resgatavel }, {
            onSuccess: () => setLostModalOpen(false),
          });
        }}
      />
    </div>
  );
}

export default CrmDealDetailPage;
