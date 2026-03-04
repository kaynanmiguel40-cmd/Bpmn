/**
 * ProspectsInsightsPanel - Painel analitico de pesquisa de mercado.
 * KPIs estrategicos + graficos de distribuicao + empresas semelhantes.
 */

import { useMemo } from 'react';
import {
  BarChart, Bar, PieChart, Pie, Cell, ResponsiveContainer,
  XAxis, YAxis, Tooltip, CartesianGrid,
} from 'recharts';
import {
  Building2, DollarSign, MapPin, TrendingUp, Layers, Sparkles,
  ExternalLink, Globe,
} from 'lucide-react';
import { CrmKpiCard } from './ui';
import { useProspectsAnalytics } from '../hooks/useCrmQueries';
import { MOCK_PROSPECTS } from '../data/mockProspects';

// ==================== CORES ====================

const SEGMENT_COLORS = [
  '#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6',
  '#06b6d4', '#ec4899', '#f97316', '#14b8a6', '#a855f7',
  '#64748b', '#84cc16',
];

const SIZE_COLORS = {
  mei: '#60a5fa',
  me: '#34d399',
  epp: '#fbbf24',
  media: '#f87171',
  grande: '#a855f7',
  'Nao informado': '#94a3b8',
};

const SIZE_LABELS = {
  mei: 'MEI',
  me: 'ME',
  epp: 'EPP',
  media: 'Media',
  grande: 'Grande',
  'Nao informado': 'N/I',
};

// Segmentos considerados "semelhantes" (SaaS de Financas)
const SIMILAR_SEGMENTS = ['Financeiro', 'Tecnologia'];

// ==================== TOOLTIP CUSTOMIZADO ====================

function ChartTooltip({ active, payload, label, suffix = '' }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-lg px-3 py-2 text-xs">
      <p className="font-semibold text-slate-700 dark:text-slate-200">{label || payload[0]?.name}</p>
      <p className="text-slate-500 dark:text-slate-400">
        {payload[0]?.value}{suffix}
      </p>
    </div>
  );
}

function RevenueTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  const val = payload[0]?.value;
  const formatted = val >= 1000000
    ? `R$ ${(val / 1000000).toFixed(1)}M`
    : `R$ ${(val / 1000).toFixed(0)}K`;
  return (
    <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-lg px-3 py-2 text-xs">
      <p className="font-semibold text-slate-700 dark:text-slate-200">{label || payload[0]?.name}</p>
      <p className="text-slate-500 dark:text-slate-400">{formatted}/ano</p>
    </div>
  );
}

function PieTooltip({ active, payload }) {
  if (!active || !payload?.length) return null;
  const item = payload[0];
  return (
    <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-lg px-3 py-2 text-xs">
      <p className="font-semibold text-slate-700 dark:text-slate-200">{item.name}</p>
      <p className="text-slate-500 dark:text-slate-400">
        {item.value} empresas ({((item.value / item.payload.total) * 100).toFixed(1)}%)
      </p>
    </div>
  );
}

// ==================== LABEL PIE ====================

function renderPieLabel({ name, percent, cx, cy, midAngle, outerRadius }) {
  if (percent < 0.05) return null;
  const RADIAN = Math.PI / 180;
  const radius = outerRadius + 20;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);

  return (
    <text
      x={x} y={y}
      fill="#64748b"
      textAnchor={x > cx ? 'start' : 'end'}
      dominantBaseline="central"
      fontSize={11}
    >
      {name} ({(percent * 100).toFixed(0)}%)
    </text>
  );
}

// ==================== FORMATADORES ====================

function formatCurrency(val) {
  if (val >= 1000000) return `R$ ${(val / 1000000).toFixed(1)}M`;
  if (val >= 1000) return `R$ ${(val / 1000).toFixed(0)}K`;
  return `R$ ${val}`;
}

function formatRevenueTick(val) {
  if (val >= 1000000) return `${(val / 1000000).toFixed(1)}M`;
  if (val >= 1000) return `${(val / 1000).toFixed(0)}K`;
  return String(val);
}

// ==================== COMPONENTE PRINCIPAL ====================

export function ProspectsInsightsPanel({ filters }) {
  const { data: analytics, isLoading } = useProspectsAnalytics(filters);

  // Preparar dados dos graficos
  const sizeData = useMemo(() => {
    if (!analytics?.bySize) return [];
    return analytics.bySize.map(item => ({
      ...item,
      label: SIZE_LABELS[item.name] || item.name,
      fill: SIZE_COLORS[item.name] || '#94a3b8',
    }));
  }, [analytics?.bySize]);

  const segmentData = useMemo(() => {
    if (!analytics?.bySegment) return [];
    return analytics.bySegment.map((item, i) => ({
      ...item,
      total: analytics.total,
      fill: SEGMENT_COLORS[i % SEGMENT_COLORS.length],
    }));
  }, [analytics?.bySegment, analytics?.total]);

  const cityData = useMemo(() => {
    if (!analytics?.byCity) return [];
    return analytics.byCity;
  }, [analytics?.byCity]);

  const revenueSegmentData = useMemo(() => {
    if (!analytics?.revenueBySegment) return [];
    return analytics.revenueBySegment;
  }, [analytics?.revenueBySegment]);

  // Empresas semelhantes locais (mesmo segmento SaaS/Financeiro, mesma regiao)
  const similarCompanies = useMemo(() => {
    if (!filters) return [];
    return MOCK_PROSPECTS
      .filter(p => {
        if (!SIMILAR_SEGMENTS.includes(p.segment)) return false;
        if (filters.state && p.state !== filters.state) return false;
        if (filters.city && p.city !== filters.city) return false;
        return true;
      })
      .slice(0, 15);
  }, [filters]);

  // Ticket medio contextual: se filtrou segmento, mostra daquele; senao, do maior segmento por faturamento
  const ticketInfo = useMemo(() => {
    if (!analytics?.revenueBySegment?.length) return { value: 0, segment: null };
    if (filters?.segment) {
      const match = analytics.revenueBySegment.find(r => r.name === filters.segment);
      return match ? { value: match.value, segment: match.name } : { value: analytics.avgRevenue, segment: filters.segment };
    }
    const top = analytics.topRevenueSegment;
    return top ? { value: top.value, segment: top.name } : { value: analytics.avgRevenue, segment: null };
  }, [analytics, filters?.segment]);

  const pct = (val) => {
    if (!analytics?.total) return '0%';
    return `${((val / analytics.total) * 100).toFixed(0)}%`;
  };

  if (!filters) return null;

  return (
    <div className="space-y-5">
      {/* KPI Cards — metricas de mercado */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <CrmKpiCard
          title="Total de Empresas"
          value={isLoading ? '—' : analytics?.total?.toLocaleString('pt-BR') || '0'}
          icon={Building2}
          color="blue"
          loading={isLoading}
        />
        <CrmKpiCard
          title="Ticket Medio"
          value={isLoading ? '—' : ticketInfo.value ? formatCurrency(ticketInfo.value) : 'R$ 0'}
          subtitle={!isLoading && ticketInfo.segment ? `media ${ticketInfo.segment}` : 'faturamento medio'}
          icon={DollarSign}
          color="emerald"
          loading={isLoading}
        />
        <CrmKpiCard
          title="Empresas Novas"
          value={isLoading ? '—' : analytics?.newCompanies?.toLocaleString('pt-BR') || '0'}
          subtitle={!isLoading && analytics ? `ultimos 2 anos (${pct(analytics.newCompanies)})` : ''}
          icon={Sparkles}
          color="rose"
          loading={isLoading}
        />
        <CrmKpiCard
          title="Maior Segmento"
          value={isLoading ? '—' : analytics?.topSegment?.name || '—'}
          subtitle={!isLoading && analytics?.topSegment ? `${analytics.topSegment.value} empresas (${pct(analytics.topSegment.value)})` : ''}
          icon={TrendingUp}
          color="violet"
          loading={isLoading}
        />
        <CrmKpiCard
          title="Maior Cidade"
          value={isLoading ? '—' : analytics?.topCity?.name || '—'}
          subtitle={!isLoading && analytics?.topCity ? `${analytics.topCity.value} empresas (${pct(analytics.topCity.value)})` : ''}
          icon={MapPin}
          color="amber"
          loading={isLoading}
        />
        <CrmKpiCard
          title="Diversidade"
          value={isLoading ? '—' : `${analytics?.uniqueSegments || 0} seg.`}
          subtitle={!isLoading && analytics ? `${analytics.uniqueCities || 0} cidades` : ''}
          icon={Layers}
          color="sky"
          loading={isLoading}
        />
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-64 bg-slate-50 dark:bg-slate-800/50 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : analytics && analytics.total > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

          {/* Grafico 1: Distribuicao por Segmento (Donut) */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700/50 rounded-xl p-4">
            <h4 className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3">
              Distribuicao por Segmento
            </h4>
            <ResponsiveContainer width="100%" height={240}>
              <PieChart>
                <Pie
                  data={segmentData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={85}
                  paddingAngle={2}
                  label={renderPieLabel}
                >
                  {segmentData.map((entry, i) => (
                    <Cell key={i} fill={entry.fill} stroke="none" />
                  ))}
                </Pie>
                <Tooltip content={<PieTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Grafico 2: Top 10 Cidades (BarChart horizontal) */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700/50 rounded-xl p-4">
            <h4 className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3">
              Top 10 Cidades
            </h4>
            <ResponsiveContainer width="100%" height={Math.max(cityData.length * 28, 100)}>
              <BarChart data={cityData} layout="vertical" margin={{ top: 0, right: 20, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.15)" horizontal={false} />
                <XAxis type="number" tick={{ fontSize: 11, fill: '#94a3b8' }} />
                <YAxis
                  dataKey="name"
                  type="category"
                  width={120}
                  tick={{ fontSize: 11, fill: '#94a3b8' }}
                />
                <Tooltip content={<ChartTooltip suffix=" empresas" />} />
                <Bar dataKey="value" fill="#6366f1" radius={[0, 4, 4, 0]} barSize={18} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Grafico 3: Distribuicao por Porte (BarChart vertical) */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700/50 rounded-xl p-4">
            <h4 className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3">
              Distribuicao por Porte
            </h4>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={sizeData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.15)" />
                <XAxis dataKey="label" tick={{ fontSize: 11, fill: '#94a3b8' }} />
                <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} />
                <Tooltip content={<ChartTooltip suffix=" empresas" />} />
                <Bar dataKey="value" radius={[4, 4, 0, 0]} barSize={40}>
                  {sizeData.map((entry, i) => (
                    <Cell key={i} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Grafico 4: Faturamento Medio por Segmento (BarChart horizontal) */}
          {revenueSegmentData.length > 0 && (
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700/50 rounded-xl p-4">
              <h4 className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3">
                Faturamento Medio por Segmento
              </h4>
              <ResponsiveContainer width="100%" height={Math.max(revenueSegmentData.length * 32, 100)}>
                <BarChart data={revenueSegmentData} layout="vertical" margin={{ top: 0, right: 20, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.15)" horizontal={false} />
                  <XAxis type="number" tick={{ fontSize: 11, fill: '#94a3b8' }} tickFormatter={formatRevenueTick} />
                  <YAxis
                    dataKey="name"
                    type="category"
                    width={100}
                    tick={{ fontSize: 11, fill: '#94a3b8' }}
                  />
                  <Tooltip content={<RevenueTooltip />} />
                  <Bar dataKey="value" fill="#10b981" radius={[0, 4, 4, 0]} barSize={20} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Empresas Semelhantes Locais — linha inteira */}
          <div className="lg:col-span-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700/50 rounded-xl p-4">
            <h4 className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3">
              <div className="flex items-center gap-1.5">
                <Globe size={12} />
                Empresas Semelhantes Locais
              </div>
            </h4>
            {similarCompanies.length === 0 ? (
              <div className="flex items-center justify-center h-28 text-sm text-slate-400 dark:text-slate-500">
                Nenhuma empresa semelhante nesta regiao
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-1.5 max-h-[300px] overflow-y-auto">
                {similarCompanies.map(c => (
                  <a
                    key={c.id}
                    href={c.website ? `https://${c.website}` : `https://www.google.com/search?q=${encodeURIComponent(c.companyName + ' ' + (c.city || '') + ' ' + (c.state || ''))}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between gap-2 px-3 py-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-slate-700 dark:text-slate-200 truncate">{c.companyName}</span>
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 shrink-0">{c.segment}</span>
                      </div>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-[11px] text-slate-400">{[c.city, c.state].filter(Boolean).join('/')}</span>
                        {c.website && <span className="text-[11px] text-slate-300 dark:text-slate-600">{c.website}</span>}
                      </div>
                    </div>
                    <ExternalLink size={13} className="text-slate-300 dark:text-slate-600 group-hover:text-blue-500 shrink-0 transition-colors" />
                  </a>
                ))}
              </div>
            )}
          </div>

        </div>
      ) : null}
    </div>
  );
}

export default ProspectsInsightsPanel;
