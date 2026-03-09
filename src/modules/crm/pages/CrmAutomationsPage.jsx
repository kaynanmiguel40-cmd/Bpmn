/**
 * CrmAutomationsPage
 * Aba Automações do CRM — 3 seções: Regras | Monitor | Logs
 */

import { useState, useMemo, Fragment } from 'react';
import {
  Zap, Plus, Pencil, Trash2, Power, PowerOff,
  Mail, MessageSquare, Smartphone,
  Type, Image, Video, Mic,
  CheckCircle2, AlertCircle, Clock,
  ChevronDown, ChevronRight,
  BarChart3, List, Settings2,
  Filter,
} from 'lucide-react';
import { CrmPageHeader } from '../components/ui/CrmPageHeader';
import { CrmConfirmDialog } from '../components/ui/CrmConfirmDialog';
import { AutomationFormModal } from '../components/AutomationFormModal';
import {
  useAutomations,
  useAutomationLogs,
  useAutomationLogStats,
  useDeleteAutomation,
  useToggleAutomation,
  useCrmPipelines,
} from '../hooks/useCrmQueries';

// ─── helpers de ícone ────────────────────────────────────────────────────────

const CHANNEL_META = {
  email:    { label: 'E-mail',   Icon: Mail,           color: 'text-blue-500'  },
  whatsapp: { label: 'WhatsApp', Icon: MessageSquare,   color: 'text-green-500' },
  sms:      { label: 'SMS',      Icon: Smartphone,      color: 'text-purple-500'},
};

const MSG_TYPE_META = {
  text:  { label: 'Texto',  Icon: Type  },
  image: { label: 'Imagem', Icon: Image },
  video: { label: 'Vídeo',  Icon: Video },
  audio: { label: 'Áudio',  Icon: Mic   },
};

const STATUS_META = {
  sent:      { label: 'Enviado',    color: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300',    Icon: Clock         },
  delivered: { label: 'Entregue',   color: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300', Icon: CheckCircle2  },
  error:     { label: 'Erro',       color: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300',         Icon: AlertCircle   },
};

// ─── Componentes auxiliares ──────────────────────────────────────────────────

function StatusBadge({ status }) {
  const meta = STATUS_META[status] || STATUS_META.sent;
  const { label, color, Icon } = meta;
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${color}`}>
      <Icon size={11} />
      {label}
    </span>
  );
}

function ChannelBadge({ channel }) {
  const meta = CHANNEL_META[channel] || CHANNEL_META.email;
  const { label, Icon, color } = meta;
  return (
    <span className={`inline-flex items-center gap-1 text-xs font-medium ${color}`}>
      <Icon size={12} />
      {label}
    </span>
  );
}

function KpiCard({ label, value, sub, color = 'text-slate-800 dark:text-slate-100' }) {
  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4">
      <div className="text-xs text-slate-500 dark:text-slate-400 mb-1">{label}</div>
      <div className={`text-3xl font-bold ${color}`}>{value ?? 0}</div>
      {sub && <div className="text-[11px] text-slate-400 mt-0.5">{sub}</div>}
    </div>
  );
}

// ─── Aba Regras ──────────────────────────────────────────────────────────────

function RulesTab({ onNew, onEdit }) {
  const { data: pipelinesData } = useCrmPipelines();
  const pipelines = pipelinesData || [];
  const [filterPipelineId, setFilterPipelineId] = useState('');
  const [collapsedStages, setCollapsedStages] = useState({});
  const [deleteTarget, setDeleteTarget] = useState(null);

  const { data: autoData, isLoading } = useAutomations(
    filterPipelineId ? { pipelineId: filterPipelineId } : {}
  );
  const automations = autoData?.data || [];

  const deleteMutation  = useDeleteAutomation();
  const toggleMutation  = useToggleAutomation();

  // Agrupar por etapa
  const byStage = useMemo(() => {
    const map = {};
    for (const a of automations) {
      const key   = a.stageId  || 'sem-etapa';
      const label = a.stage?.name || 'Sem etapa';
      const color = a.stage?.color || '#6366f1';
      if (!map[key]) map[key] = { key, label, color, items: [] };
      map[key].items.push(a);
    }
    return Object.values(map);
  }, [automations]);

  const toggleStage = (key) =>
    setCollapsedStages(prev => ({ ...prev, [key]: !prev[key] }));

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16 text-slate-400">
        <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mr-2" />
        Carregando...
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Filtro de pipeline */}
      <div className="flex items-center gap-3">
        <Filter size={14} className="text-slate-400" />
        <select
          value={filterPipelineId}
          onChange={e => setFilterPipelineId(e.target.value)}
          className="text-sm px-3 py-1.5 border border-slate-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200"
        >
          <option value="">Todos os pipelines</option>
          {pipelines.map(p => (
            <option key={p.id} value={p.id}>{p.name}</option>
          ))}
        </select>
        <span className="text-sm text-slate-400">{automations.length} regra(s)</span>
      </div>

      {/* Estado vazio */}
      {byStage.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 text-slate-400">
          <Zap size={40} className="mb-3 opacity-30" />
          <p className="text-sm font-medium">Nenhuma automação configurada</p>
          <p className="text-xs mt-1">Crie sua primeira regra clicando em &ldquo;+ Nova Automação&rdquo;</p>
          <button
            onClick={onNew}
            className="mt-4 flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-lg font-medium transition-colors"
          >
            <Plus size={14} /> Nova Automação
          </button>
        </div>
      )}

      {/* Grupos por etapa */}
      {byStage.map(group => (
        <div key={group.key} className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
          {/* Header do grupo */}
          <button
            onClick={() => toggleStage(group.key)}
            className="w-full flex items-center gap-3 px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors"
          >
            <span
              className="w-2.5 h-2.5 rounded-full shrink-0"
              style={{ backgroundColor: group.color }}
            />
            <span className="font-medium text-slate-800 dark:text-slate-100 text-sm flex-1 text-left">
              {group.label}
            </span>
            <span className="text-xs text-slate-400 mr-2">{group.items.length} regra(s)</span>
            {collapsedStages[group.key]
              ? <ChevronRight size={14} className="text-slate-400" />
              : <ChevronDown  size={14} className="text-slate-400" />
            }
          </button>

          {/* Itens */}
          {!collapsedStages[group.key] && (
            <div className="divide-y divide-slate-100 dark:divide-slate-700/50">
              {group.items.map(auto => {
                const ch   = CHANNEL_META[auto.channel]    || CHANNEL_META.email;
                const mt   = MSG_TYPE_META[auto.messageType] || MSG_TYPE_META.text;
                const ChIcon = ch.Icon;
                const MtIcon = mt.Icon;

                return (
                  <div
                    key={auto.id}
                    className={`flex items-center gap-4 px-4 py-3 ${
                      !auto.active ? 'opacity-50' : ''
                    }`}
                  >
                    {/* Canal */}
                    <div className={`shrink-0 p-2 rounded-lg bg-slate-100 dark:bg-slate-700 ${ch.color}`}>
                      <ChIcon size={16} />
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-slate-800 dark:text-slate-100 truncate">
                          {auto.name}
                        </span>
                        {!auto.active && (
                          <span className="text-[10px] px-1.5 py-0.5 bg-slate-100 dark:bg-slate-700 text-slate-500 rounded-full">
                            Inativa
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-3 mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                        <span className="flex items-center gap-1">
                          <MtIcon size={11} /> {mt.label}
                        </span>
                        {auto.segmentFilter && (
                          <span className="px-1.5 py-0.5 bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300 rounded-full text-[10px] font-medium">
                            {auto.segmentFilter}
                          </span>
                        )}
                        {auto.delayMinutes > 0 && (
                          <span className="flex items-center gap-1 text-slate-400">
                            <Clock size={11} /> {auto.delayMinutes}min
                          </span>
                        )}
                      </div>
                      {(auto.messageContent || auto.mediaUrl) && (
                        <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5 truncate max-w-xs">
                          {auto.messageContent || auto.mediaUrl}
                        </p>
                      )}
                    </div>

                    {/* Ações */}
                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        onClick={() => toggleMutation.mutate({ id: auto.id, active: !auto.active })}
                        title={auto.active ? 'Pausar' : 'Ativar'}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                      >
                        {auto.active ? <PowerOff size={14} /> : <Power size={14} />}
                      </button>
                      <button
                        onClick={() => onEdit(auto)}
                        title="Editar"
                        className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
                      >
                        <Pencil size={14} />
                      </button>
                      <button
                        onClick={() => setDeleteTarget(auto)}
                        title="Excluir"
                        className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      ))}

      <CrmConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={async () => {
          await deleteMutation.mutateAsync(deleteTarget.id);
          setDeleteTarget(null);
        }}
        title="Excluir automação"
        description={`Deseja remover a automação "${deleteTarget?.name}"? Esta ação não pode ser desfeita.`}
        loading={deleteMutation.isPending}
      />
    </div>
  );
}

// ─── Aba Monitor ─────────────────────────────────────────────────────────────

function MonitorTab() {
  const { data: stats, isLoading: statsLoading } = useAutomationLogStats(7);
  const { data: logsData, isLoading: logsLoading } = useAutomationLogs({ page: 1, perPage: 15 });
  const logs = logsData?.data || [];

  return (
    <div className="space-y-6">
      {/* KPI cards */}
      <div className="grid grid-cols-3 gap-4">
        <KpiCard
          label="Disparos (7 dias)"
          value={statsLoading ? '…' : stats?.total}
          sub="total de automações acionadas"
        />
        <KpiCard
          label="Enviados"
          value={statsLoading ? '…' : (stats?.sent ?? 0) + (stats?.delivered ?? 0)}
          sub="confirmados"
          color="text-blue-600 dark:text-blue-400"
        />
        <KpiCard
          label="Erros"
          value={statsLoading ? '…' : stats?.error}
          sub="falhas no disparo"
          color={stats?.error > 0 ? 'text-red-600 dark:text-red-400' : 'text-slate-800 dark:text-slate-100'}
        />
      </div>

      {/* Por canal */}
      {!statsLoading && stats?.byChannel && Object.keys(stats.byChannel).length > 0 && (
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3">Por canal</p>
          <div className="flex gap-6">
            {Object.entries(stats.byChannel).map(([ch, count]) => {
              const meta = CHANNEL_META[ch] || CHANNEL_META.email;
              const Icon = meta.Icon;
              return (
                <div key={ch} className="flex items-center gap-2">
                  <Icon size={14} className={meta.color} />
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-200">{meta.label}</span>
                  <span className="text-sm text-slate-400">{count}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Últimos disparos */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
        <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-700">
          <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">Últimos disparos</p>
        </div>
        {logsLoading ? (
          <div className="py-10 flex justify-center text-slate-400 text-sm">Carregando...</div>
        ) : logs.length === 0 ? (
          <div className="py-10 flex flex-col items-center text-slate-400">
            <BarChart3 size={32} className="mb-2 opacity-30" />
            <p className="text-sm">Nenhum disparo registrado ainda</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-[11px] uppercase tracking-wider text-slate-400 border-b border-slate-100 dark:border-slate-700">
                  <th className="text-left px-4 py-2">Deal</th>
                  <th className="text-left px-4 py-2">Etapa</th>
                  <th className="text-left px-4 py-2">Canal</th>
                  <th className="text-left px-4 py-2">Destinatário</th>
                  <th className="text-left px-4 py-2">Status</th>
                  <th className="text-left px-4 py-2">Horário</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 dark:divide-slate-700/50">
                {logs.map(log => (
                  <tr key={log.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/30">
                    <td className="px-4 py-2.5 text-slate-800 dark:text-slate-200 font-medium truncate max-w-[160px]">
                      {log.dealTitle || '—'}
                    </td>
                    <td className="px-4 py-2.5 text-slate-600 dark:text-slate-400 truncate max-w-[120px]">
                      {log.stageName || '—'}
                    </td>
                    <td className="px-4 py-2.5">
                      <ChannelBadge channel={log.channel} />
                    </td>
                    <td className="px-4 py-2.5 text-slate-600 dark:text-slate-400 truncate max-w-[140px]">
                      {log.recipient || '—'}
                    </td>
                    <td className="px-4 py-2.5">
                      <StatusBadge status={log.status} />
                    </td>
                    <td className="px-4 py-2.5 text-slate-400 text-xs whitespace-nowrap">
                      {log.sentAt ? new Date(log.sentAt).toLocaleString('pt-BR') : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Aba Logs ─────────────────────────────────────────────────────────────────

function LogsTab() {
  const [page, setPage]           = useState(1);
  const [filterStatus, setStatus] = useState('');
  const [filterChannel, setChannel] = useState('');
  const [expandedId, setExpandedId] = useState(null);

  const { data: logsData, isLoading } = useAutomationLogs({
    page,
    perPage: 20,
    status:  filterStatus  || undefined,
    channel: filterChannel || undefined,
  });

  const logs  = logsData?.data  || [];
  const total = logsData?.count || 0;
  const pages = Math.ceil(total / 20);

  return (
    <div className="space-y-4">
      {/* Filtros */}
      <div className="flex items-center gap-3 flex-wrap">
        <Filter size={14} className="text-slate-400" />
        <select
          value={filterStatus}
          onChange={e => { setStatus(e.target.value); setPage(1); }}
          className="text-sm px-3 py-1.5 border border-slate-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200"
        >
          <option value="">Todos os status</option>
          <option value="sent">Enviado</option>
          <option value="delivered">Entregue</option>
          <option value="error">Erro</option>
        </select>
        <select
          value={filterChannel}
          onChange={e => { setChannel(e.target.value); setPage(1); }}
          className="text-sm px-3 py-1.5 border border-slate-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200"
        >
          <option value="">Todos os canais</option>
          <option value="email">E-mail</option>
          <option value="whatsapp">WhatsApp</option>
          <option value="sms">SMS</option>
        </select>
        <span className="text-xs text-slate-400 ml-auto">{total} registro(s)</span>
      </div>

      {/* Tabela */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
        {isLoading ? (
          <div className="py-12 flex justify-center text-slate-400 text-sm">Carregando...</div>
        ) : logs.length === 0 ? (
          <div className="py-12 flex flex-col items-center text-slate-400">
            <List size={32} className="mb-2 opacity-30" />
            <p className="text-sm">Nenhum log encontrado</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-[11px] uppercase tracking-wider text-slate-400 border-b border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60">
                  <th className="text-left px-4 py-2">Deal</th>
                  <th className="text-left px-4 py-2">Etapa</th>
                  <th className="text-left px-4 py-2">Canal</th>
                  <th className="text-left px-4 py-2">Destinatário</th>
                  <th className="text-left px-4 py-2">Mensagem</th>
                  <th className="text-left px-4 py-2">Status</th>
                  <th className="text-left px-4 py-2">Horário</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 dark:divide-slate-700/50">
                {logs.map(log => (
                  <Fragment key={log.id}>
                    <tr
                      className="hover:bg-slate-50 dark:hover:bg-slate-700/30 cursor-pointer"
                      onClick={() => setExpandedId(expandedId === log.id ? null : log.id)}
                    >
                      <td className="px-4 py-2.5 text-slate-800 dark:text-slate-200 font-medium truncate max-w-[140px]">
                        {log.dealTitle || '—'}
                      </td>
                      <td className="px-4 py-2.5 text-slate-500 dark:text-slate-400 truncate max-w-[100px]">
                        {log.stageName || '—'}
                      </td>
                      <td className="px-4 py-2.5">
                        <ChannelBadge channel={log.channel} />
                      </td>
                      <td className="px-4 py-2.5 text-slate-500 dark:text-slate-400 truncate max-w-[130px]">
                        {log.recipient || '—'}
                      </td>
                      <td className="px-4 py-2.5 text-slate-400 text-xs truncate max-w-[180px]">
                        {log.messageSnapshot
                          ? (log.messageSnapshot.length > 50
                              ? log.messageSnapshot.slice(0, 50) + '…'
                              : log.messageSnapshot)
                          : '—'}
                      </td>
                      <td className="px-4 py-2.5">
                        <StatusBadge status={log.status} />
                      </td>
                      <td className="px-4 py-2.5 text-slate-400 text-xs whitespace-nowrap">
                        {log.sentAt ? new Date(log.sentAt).toLocaleString('pt-BR') : '—'}
                      </td>
                    </tr>
                    {/* Linha expandida com mensagem completa */}
                    {expandedId === log.id && (
                      <tr key={`${log.id}-expanded`} className="bg-slate-50 dark:bg-slate-700/20">
                        <td colSpan={7} className="px-6 py-3 text-xs text-slate-600 dark:text-slate-300">
                          <span className="font-medium text-slate-500 dark:text-slate-400">Mensagem: </span>
                          {log.messageSnapshot || '(sem conteúdo)'}
                          {log.errorMessage && (
                            <span className="ml-4 text-red-500">Erro: {log.errorMessage}</span>
                          )}
                        </td>
                      </tr>
                    )}
                  </Fragment>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Paginação */}
      {pages > 1 && (
        <div className="flex items-center justify-between">
          <span className="text-xs text-slate-400">Página {page} de {pages}</span>
          <div className="flex gap-1">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-3 py-1 text-xs rounded-lg border border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 disabled:opacity-40 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
            >
              Anterior
            </button>
            <button
              onClick={() => setPage(p => Math.min(pages, p + 1))}
              disabled={page === pages}
              className="px-3 py-1 text-xs rounded-lg border border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 disabled:opacity-40 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
            >
              Próxima
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Página principal ────────────────────────────────────────────────────────

const TABS = [
  { id: 'rules',   label: 'Regras',   Icon: Settings2  },
  { id: 'monitor', label: 'Monitor',  Icon: BarChart3  },
  { id: 'logs',    label: 'Logs',     Icon: List       },
];

export function CrmAutomationsPage() {
  const [activeTab, setActiveTab]   = useState('rules');
  const [formOpen, setFormOpen]     = useState(false);
  const [editTarget, setEditTarget] = useState(null);

  const handleNew = () => { setEditTarget(null); setFormOpen(true); };
  const handleEdit = (auto) => { setEditTarget(auto); setFormOpen(true); };

  return (
    <div className="space-y-5">
      <CrmPageHeader
        title="Automações"
        subtitle="Configure disparos automáticos de mensagens quando um deal avança de etapa"
        actions={
          <button
            onClick={handleNew}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-lg font-medium transition-colors shadow-sm"
          >
            <Plus size={15} />
            Nova Automação
          </button>
        }
      />

      {/* Tabs internas */}
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
      {activeTab === 'rules'   && <RulesTab onNew={handleNew} onEdit={handleEdit} />}
      {activeTab === 'monitor' && <MonitorTab />}
      {activeTab === 'logs'    && <LogsTab />}

      {/* Modal de formulário */}
      <AutomationFormModal
        open={formOpen}
        onClose={() => { setFormOpen(false); setEditTarget(null); }}
        automation={editTarget}
      />
    </div>
  );
}

export default CrmAutomationsPage;
