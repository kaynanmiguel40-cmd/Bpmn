/**
 * CrmTrafficPage - Dashboard de Trafego Pago.
 *
 * Visao completa do topo do funil: investimento -> leads -> deals -> receita.
 *
 * Secoes:
 * - Filtros (canal, pipeline, periodo)
 * - 8 KPI Cards
 * - BarChart: Gasto vs Receita por Canal
 * - PieChart: Distribuicao de Leads por Canal
 * - ComposedChart: Leads (bars) + CPL (line) ao longo do tempo
 * - CrmDataTable com CRUD
 */

import { useState, useMemo } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend,
  ComposedChart, Line,
  PieChart, Pie, Cell,
} from 'recharts';
import {
  Megaphone, Plus, Pencil, Trash2,
  DollarSign, MousePointerClick, Users, TrendingUp,
  Eye, Target, Receipt, BarChart3,
} from 'lucide-react';
import { CrmPageHeader, CrmDataTable, CrmKpiCard, CrmConfirmDialog } from '../components/ui';
import {
  useCrmTraffic, useCrmTrafficKPIs, useCrmTrafficByChannel, useCrmTrafficOverTime,
  useDeleteCrmTraffic, useCrmPipelines,
} from '../hooks/useCrmQueries';
import { TrafficFormModal } from '../components/TrafficFormModal';

// ==================== CONSTANTES ====================

const CHANNEL_CONFIG = {
  google_ads: { label: 'Google Ads', color: '#4285F4' },
  meta_ads: { label: 'Meta Ads', color: '#1877F2' },
  instagram: { label: 'Instagram', color: '#E4405F' },
  linkedin: { label: 'LinkedIn', color: '#0A66C2' },
  tiktok: { label: 'TikTok', color: '#010101' },
  youtube: { label: 'YouTube', color: '#FF0000' },
  organico: { label: 'Organico', color: '#10b981' },
  indicacao: { label: 'Indicacao', color: '#f59e0b' },
  outro: { label: 'Outro', color: '#6b7280' },
};

const CHANNEL_OPTIONS = [
  { value: '', label: 'Todos os canais' },
  ...Object.entries(CHANNEL_CONFIG).map(([value, cfg]) => ({ value, label: cfg.label })),
];

const PERIOD_OPTIONS = [
  { value: 'month', label: 'Mes Atual' },
  { value: 'last_month', label: 'Mes Anterior' },
  { value: 'quarter', label: 'Trimestre' },
  { value: 'year', label: 'Ano' },
  { value: 'all', label: 'Todo Periodo' },
];

const monthNames = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];

// ==================== HELPERS ====================

const formatCurrency = (val) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(val || 0);

const formatCurrencyFull = (val) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val || 0);

const formatNumber = (val) =>
  new Intl.NumberFormat('pt-BR').format(val || 0);

function getPeriodDates(period) {
  const now = new Date();
  let start, end;
  switch (period) {
    case 'last_month':
      start = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      end = new Date(now.getFullYear(), now.getMonth(), 0);
      break;
    case 'quarter': {
      const qMonth = Math.floor(now.getMonth() / 3) * 3;
      start = new Date(now.getFullYear(), qMonth, 1);
      end = now;
      break;
    }
    case 'year':
      start = new Date(now.getFullYear(), 0, 1);
      end = now;
      break;
    case 'all':
      return { startDate: null, endDate: null };
    default:
      start = new Date(now.getFullYear(), now.getMonth(), 1);
      end = now;
  }
  return {
    startDate: start.toISOString().split('T')[0],
    endDate: end.toISOString().split('T')[0],
  };
}

function getChannelLabel(ch) {
  return CHANNEL_CONFIG[ch]?.label || ch;
}

function getChannelColor(ch) {
  return CHANNEL_CONFIG[ch]?.color || '#6b7280';
}

function getMonthLabel(monthKey) {
  if (!monthKey) return '';
  const parts = monthKey.split('-');
  const idx = parseInt(parts[1], 10) - 1;
  return `${monthNames[idx] || parts[1]}/${parts[0]?.slice(2)}`;
}

// ==================== SKELETON ====================

function TrafficSkeleton() {
  return (
    <div className="animate-pulse space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700/50 p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="h-3 w-20 bg-slate-200 dark:bg-slate-700 rounded" />
              <div className="w-9 h-9 bg-slate-200 dark:bg-slate-700 rounded-lg" />
            </div>
            <div className="h-7 w-28 bg-slate-200 dark:bg-slate-700 rounded mb-1" />
            <div className="h-3 w-16 bg-slate-100 dark:bg-slate-800 rounded" />
          </div>
        ))}
      </div>
    </div>
  );
}

// ==================== TOOLTIPS ====================

function ChannelBarTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-lg shadow-lg px-3 py-2">
      <p className="text-xs font-medium text-slate-700 dark:text-slate-200 mb-1">{label}</p>
      {payload.map((p) => (
        <div key={p.dataKey} className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full" style={{ backgroundColor: p.fill }} />
          <span className="text-xs text-slate-500 dark:text-slate-400">{p.name}:</span>
          <span className="text-xs font-bold text-slate-800 dark:text-slate-200">{formatCurrencyFull(p.value)}</span>
        </div>
      ))}
    </div>
  );
}

function LeadsOverTimeTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-lg shadow-lg px-3 py-2">
      <p className="text-xs font-medium text-slate-700 dark:text-slate-200 mb-1">{label}</p>
      {payload.map((p) => (
        <div key={p.dataKey} className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full" style={{ backgroundColor: p.stroke || p.fill || p.color }} />
          <span className="text-xs text-slate-500 dark:text-slate-400">{p.name}:</span>
          <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
            {p.dataKey === 'cpl' ? formatCurrencyFull(p.value) : formatNumber(p.value)}
          </span>
        </div>
      ))}
    </div>
  );
}

function PieTooltip({ active, payload }) {
  if (!active || !payload?.length) return null;
  const d = payload[0];
  return (
    <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-lg shadow-lg px-3 py-2">
      <p className="text-xs font-medium text-slate-700 dark:text-slate-200">{d.name}</p>
      <p className="text-sm font-bold text-slate-800 dark:text-slate-200">{formatNumber(d.value)} leads</p>
    </div>
  );
}

// ==================== MAIN PAGE ====================

export function CrmTrafficPage() {
  const [period, setPeriod] = useState('month');
  const [channelFilter, setChannelFilter] = useState('');
  const [pipelineFilter, setPipelineFilter] = useState('');
  const [page, setPage] = useState(1);

  const [formOpen, setFormOpen] = useState(false);
  const [editEntry, setEditEntry] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const deleteMutation = useDeleteCrmTraffic();
  const { data: pipelines = [] } = useCrmPipelines();

  const { startDate, endDate } = useMemo(() => getPeriodDates(period), [period]);

  const kpiFilters = useMemo(() => ({
    startDate, endDate,
    channel: channelFilter || undefined,
    pipelineId: pipelineFilter || undefined,
  }), [startDate, endDate, channelFilter, pipelineFilter]);

  const tableFilters = useMemo(() => ({
    page, perPage: 25,
    channel: channelFilter || undefined,
    pipelineId: pipelineFilter || undefined,
    startDate, endDate,
  }), [page, channelFilter, pipelineFilter, startDate, endDate]);

  const { data: kpis, isLoading: kpisLoading } = useCrmTrafficKPIs(kpiFilters);
  const { data: byChannel = [], isLoading: channelLoading } = useCrmTrafficByChannel(kpiFilters);
  const { data: overTime = [], isLoading: timeLoading } = useCrmTrafficOverTime(kpiFilters);
  const { data: tableData, isLoading: tableLoading } = useCrmTraffic(tableFilters);

  const handleNew = () => { setEditEntry(null); setFormOpen(true); };
  const handleEdit = (entry) => { setEditEntry(entry); setFormOpen(true); };
  const handleDelete = async () => {
    if (!deleteTarget) return;
    await deleteMutation.mutateAsync(deleteTarget.id);
    setDeleteTarget(null);
  };

  // Chart data
  const channelChartData = useMemo(() =>
    byChannel.map(c => ({
      name: getChannelLabel(c.channel),
      gasto: c.spent,
      receita: c.revenue,
      color: getChannelColor(c.channel),
    })),
    [byChannel]
  );

  const pieData = useMemo(() =>
    byChannel.filter(c => c.leads > 0).map(c => ({
      name: getChannelLabel(c.channel),
      value: c.leads,
      color: getChannelColor(c.channel),
    })),
    [byChannel]
  );

  const timeChartData = useMemo(() =>
    overTime.map(m => ({
      name: getMonthLabel(m.month),
      leads: m.leads,
      cpl: m.cpl,
      gasto: m.spent,
    })),
    [overTime]
  );

  const isChartsLoading = channelLoading || timeLoading;

  // Table columns
  const columns = [
    {
      key: 'channel',
      label: 'Canal',
      sortable: true,
      render: (val) => (
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: getChannelColor(val) }} />
          <span className="font-medium text-slate-800 dark:text-slate-200">{getChannelLabel(val)}</span>
        </div>
      ),
    },
    {
      key: 'pipeline',
      label: 'Pipeline',
      render: (val, row) => (
        <span className="text-sm text-slate-500 dark:text-slate-400">{row.pipeline?.name || 'Geral'}</span>
      ),
    },
    {
      key: 'periodStart',
      label: 'Periodo',
      render: (val, row) => (
        <span className="text-xs text-slate-500 dark:text-slate-400">
          {val ? new Date(val + 'T00:00:00').toLocaleDateString('pt-BR') : ''} — {row.periodEnd ? new Date(row.periodEnd + 'T00:00:00').toLocaleDateString('pt-BR') : ''}
        </span>
      ),
    },
    {
      key: 'amountSpent',
      label: 'Gasto',
      sortable: true,
      render: (val) => <span className="font-medium text-rose-600 dark:text-rose-400">{formatCurrency(val)}</span>,
    },
    {
      key: 'leadsGenerated',
      label: 'Leads',
      sortable: true,
      render: (val) => <span className="font-medium">{formatNumber(val)}</span>,
    },
    {
      key: 'cpl',
      label: 'CPL',
      render: (_, row) => {
        const cpl = row.leadsGenerated > 0 ? row.amountSpent / row.leadsGenerated : 0;
        return <span className="text-sm">{formatCurrencyFull(cpl)}</span>;
      },
    },
    {
      key: 'clicks',
      label: 'Cliques',
      render: (val) => <span className="text-sm">{formatNumber(val)}</span>,
    },
    {
      key: 'ctr',
      label: 'CTR',
      render: (_, row) => {
        const ctr = row.impressions > 0 ? (row.clicks / row.impressions) * 100 : 0;
        return <span className="text-sm">{ctr.toFixed(2)}%</span>;
      },
    },
    {
      key: 'roas',
      label: 'ROAS',
      render: (_, row) => {
        const roas = row.amountSpent > 0 ? row.revenueGenerated / row.amountSpent : 0;
        return (
          <span className={`text-sm font-medium ${roas >= 1 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
            {roas.toFixed(2)}x
          </span>
        );
      },
    },
    {
      key: 'actions',
      label: '',
      render: (_, row) => (
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button onClick={(e) => { e.stopPropagation(); handleEdit(row); }}
            className="p-1 rounded text-slate-400 hover:text-blue-600 transition-colors">
            <Pencil size={14} />
          </button>
          <button onClick={(e) => { e.stopPropagation(); setDeleteTarget(row); }}
            className="p-1 rounded text-slate-400 hover:text-rose-600 transition-colors">
            <Trash2 size={14} />
          </button>
        </div>
      ),
    },
  ];

  const selectClass = 'px-3 py-1.5 text-sm rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-fyness-primary';

  return (
    <div className="space-y-6">
      {/* Header */}
      <CrmPageHeader
        title="Trafego Pago"
        subtitle="Investimentos em marketing e metricas de aquisicao"
        actions={
          <button onClick={handleNew}
            className="flex items-center gap-2 px-4 py-2 bg-fyness-primary hover:bg-fyness-secondary text-white text-sm font-medium rounded-lg transition-colors">
            <Plus size={16} /> Novo Registro
          </button>
        }
      />

      {/* Filtros */}
      <div className="flex flex-wrap items-center gap-3">
        <select value={period} onChange={(e) => setPeriod(e.target.value)} className={selectClass}>
          {PERIOD_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
        <select value={channelFilter} onChange={(e) => { setChannelFilter(e.target.value); setPage(1); }} className={selectClass}>
          {CHANNEL_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
        {pipelines.length > 0 && (
          <select value={pipelineFilter} onChange={(e) => { setPipelineFilter(e.target.value); setPage(1); }} className={selectClass}>
            <option value="">Todos os pipelines</option>
            {pipelines.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
        )}
      </div>

      {/* KPI Cards */}
      {kpisLoading ? (
        <TrafficSkeleton />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <CrmKpiCard title="Gasto Total" value={formatCurrency(kpis?.totalSpent)} icon={DollarSign} color="rose" />
          <CrmKpiCard title="CPL Medio" value={formatCurrencyFull(kpis?.cpl)} icon={Target} color="amber" subtitle="Custo por Lead" />
          <CrmKpiCard title="Leads Gerados" value={formatNumber(kpis?.totalLeads)} icon={Users} color="blue" />
          <CrmKpiCard title="ROAS" value={`${(kpis?.roas || 0).toFixed(2)}x`} icon={TrendingUp} color={kpis?.roas >= 1 ? 'emerald' : 'rose'} subtitle="Retorno sobre gasto" />
          <CrmKpiCard title="CPC Medio" value={formatCurrencyFull(kpis?.cpc)} icon={MousePointerClick} color="violet" subtitle="Custo por Clique" />
          <CrmKpiCard title="CTR" value={`${(kpis?.ctr || 0).toFixed(2)}%`} icon={Eye} color="sky" subtitle="Taxa de Clique" />
          <CrmKpiCard title="Conversoes" value={formatNumber(kpis?.totalConversions)} icon={Receipt} color="emerald" />
          <CrmKpiCard title="Receita Gerada" value={formatCurrency(kpis?.totalRevenue)} icon={BarChart3} color="green" />
        </div>
      )}

      {/* Charts Row: Bar + Pie */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* BarChart: Gasto vs Receita por Canal */}
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700/50 p-5">
          <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-4">Gasto vs Receita por Canal</h3>
          {isChartsLoading ? (
            <div className="h-72 bg-slate-100 dark:bg-slate-800 rounded-lg animate-pulse" />
          ) : channelChartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={288}>
              <BarChart data={channelChartData} barGap={4}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#94a3b8' }} />
                <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
                <Tooltip content={<ChannelBarTooltip />} />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Bar dataKey="gasto" name="Gasto" fill="#f43f5e" radius={[4, 4, 0, 0]} />
                <Bar dataKey="receita" name="Receita" fill="#10b981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-72 flex items-center justify-center text-sm text-slate-400">Sem dados para o periodo</div>
          )}
        </div>

        {/* PieChart: Distribuicao de Leads */}
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700/50 p-5">
          <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-4">Distribuicao de Leads por Canal</h3>
          {isChartsLoading ? (
            <div className="h-72 bg-slate-100 dark:bg-slate-800 rounded-lg animate-pulse" />
          ) : pieData.length > 0 ? (
            <ResponsiveContainer width="100%" height={288}>
              <PieChart>
                <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} innerRadius={50} paddingAngle={3}>
                  {pieData.map((entry, idx) => (
                    <Cell key={idx} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip content={<PieTooltip />} />
                <Legend wrapperStyle={{ fontSize: 12 }} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-72 flex items-center justify-center text-sm text-slate-400">Sem dados para o periodo</div>
          )}
        </div>
      </div>

      {/* ComposedChart: Leads + CPL ao longo do tempo */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700/50 p-5">
        <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-4">Leads e CPL ao Longo do Tempo</h3>
        {isChartsLoading ? (
          <div className="h-72 bg-slate-100 dark:bg-slate-800 rounded-lg animate-pulse" />
        ) : timeChartData.length > 0 ? (
          <ResponsiveContainer width="100%" height={288}>
            <ComposedChart data={timeChartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#94a3b8' }} />
              <YAxis yAxisId="left" tick={{ fontSize: 11, fill: '#94a3b8' }} />
              <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 11, fill: '#94a3b8' }}
                tickFormatter={(v) => `R$${(v).toFixed(0)}`} />
              <Tooltip content={<LeadsOverTimeTooltip />} />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Bar yAxisId="left" dataKey="leads" name="Leads" fill="#6366f1" radius={[4, 4, 0, 0]} />
              <Line yAxisId="right" dataKey="cpl" name="CPL" stroke="#f59e0b" strokeWidth={2} dot={{ fill: '#f59e0b', r: 4 }} />
            </ComposedChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-72 flex items-center justify-center text-sm text-slate-400">Sem dados para o periodo</div>
        )}
      </div>

      {/* Tabela de Registros */}
      <CrmDataTable
        columns={columns}
        data={tableData?.data || []}
        loading={tableLoading}
        emptyMessage="Nenhum registro de trafego encontrado"
        emptyIcon={Megaphone}
        pagination={{ page, perPage: 25, total: tableData?.count || 0, onPageChange: setPage }}
      />

      {/* Modal */}
      <TrafficFormModal
        open={formOpen}
        onClose={() => { setFormOpen(false); setEditEntry(null); }}
        entry={editEntry}
      />

      {/* Confirm Delete */}
      <CrmConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Excluir registro"
        message="Tem certeza que deseja excluir este registro de trafego? Esta acao nao pode ser desfeita."
        variant="danger"
        loading={deleteMutation.isPending}
      />
    </div>
  );
}

export default CrmTrafficPage;
