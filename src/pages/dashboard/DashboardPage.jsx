/**
 * DashboardPage - KPIs de RH e Performance
 *
 * Duas visoes baseadas no role do perfil:
 * - Colaborador: KPIs individuais (tempo medio, taxa de conclusao, produtividade)
 * - Gestor: KPIs da empresa + filtro por colaborador + comparativos
 */

import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { getProfile } from '../../lib/profileService';
import { shortName } from '../../lib/teamService';
import { MANAGER_ROLES, detectRole } from '../../lib/roleUtils';
import { useOSOrders, useTeamMembers, useAgendaEvents } from '../../hooks/queries';
import {
  calcOSHours, calcEstimatedHours, calcOSCost, calcKPIs, getMemberHourlyRate,
  formatCurrency, formatLateTime, timeAgo,
  isCurrentMonth, isLastMonth,
  loadProfileSync, findCurrentUser, namesMatch,
  calcCapacity, calcAvgLeadTime, calcSLACompliance, calcCategoryBreakdown,
} from '../../lib/kpiUtils';
import { getHistory, calculateTrends, saveMonthlySnapshot } from '../../lib/kpiSnapshotService';
import { TrendCard } from '../../components/trends/TrendCard';
import { ProjectionWidget } from '../../components/trends/ProjectionWidget';
import { useRealtimeOSOrders } from '../../hooks/useRealtimeSubscription';

// ─── Icones SVG ───────────────────────────────────────────────────

const SpeedIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
  </svg>
);

const TargetIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <circle cx="12" cy="12" r="10" strokeWidth={2} />
    <circle cx="12" cy="12" r="6" strokeWidth={2} />
    <circle cx="12" cy="12" r="2" strokeWidth={2} />
  </svg>
);

const ClockIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const CheckCircleIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const TrendUpIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
  </svg>
);

const TrendDownIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" />
  </svg>
);

const UsersIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
  </svg>
);

const AlertIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
  </svg>
);

const ChartIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
  </svg>
);

const MoneyIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const TrophyIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
  </svg>
);

const MeetingIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);

const PunctualIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4" />
  </svg>
);

// ─── Sub-componentes compartilhados ───────────────────────────────

function KPICard({ title, value, subtitle, icon: Icon, color = 'blue', trend, trendLabel }) {
  const colors = {
    blue: 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400',
    green: 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400',
    orange: 'bg-orange-50 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400',
    purple: 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400',
    red: 'bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400',
    amber: 'bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400',
  };

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl p-5 shadow-sm border border-slate-200 dark:border-slate-700 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">{title}</p>
          <p className="text-2xl font-bold text-slate-800 dark:text-slate-100 dark:text-slate-100 mt-1">{value}</p>
          {subtitle && <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">{subtitle}</p>}
          {trend !== undefined && trend !== 0 && (
            <div className={`flex items-center gap-1 mt-2 text-xs font-medium ${trend > 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-500 dark:text-red-400'}`}>
              {trend > 0 ? <span>▲</span> : <span>▼</span>}
              <span>{Math.abs(trend)}% {trendLabel || 'vs mes anterior'}</span>
            </div>
          )}
        </div>
        {Icon && (
          <div className={`p-2.5 rounded-lg shrink-0 ${colors[color]}`}>
            <Icon />
          </div>
        )}
      </div>
    </div>
  );
}

function SectionCard({ title, action, children }) {
  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
      <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-100">{title}</h3>
        {action && (
          <Link to={action.href} className="text-xs text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium">
            {action.label}
          </Link>
        )}
      </div>
      {children}
    </div>
  );
}

function EmptyState({ message }) {
  return (
    <div className="px-5 py-10 text-center">
      <svg className="w-10 h-10 text-slate-200 dark:text-slate-600 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
      </svg>
      <p className="text-sm text-slate-400 dark:text-slate-500">{message}</p>
    </div>
  );
}

/** Gauge visual simples (semicirculo) */
function GaugeChart({ value, max = 100, label, color = '#3b82f6', size = 120 }) {
  const pct = Math.min(Math.max(value / max, 0), 1);
  const angle = pct * 180;
  const r = (size - 16) / 2;
  const cx = size / 2;
  const cy = size / 2 + 4;

  const startX = cx - r;
  const startY = cy;
  const endAngle = (Math.PI * angle) / 180;
  const endX = cx - r * Math.cos(endAngle);
  const endY = cy - r * Math.sin(endAngle);
  const largeArc = angle > 180 ? 1 : 0;

  return (
    <div className="flex flex-col items-center">
      <svg width={size} height={size / 2 + 16} viewBox={`0 0 ${size} ${size / 2 + 16}`}>
        {/* Background arc */}
        <path
          d={`M ${cx - r} ${cy} A ${r} ${r} 0 0 1 ${cx + r} ${cy}`}
          fill="none" stroke="#e2e8f0" strokeWidth="8" strokeLinecap="round"
        />
        {/* Value arc */}
        {pct > 0 && (
          <path
            d={`M ${startX} ${startY} A ${r} ${r} 0 ${largeArc} 1 ${endX} ${endY}`}
            fill="none" stroke={color} strokeWidth="8" strokeLinecap="round"
          />
        )}
        <text x={cx} y={cy - 8} textAnchor="middle" className="text-lg font-bold" fill="#1e293b" fontSize="18">
          {value}{typeof max === 'number' && max <= 100 ? '%' : ''}
        </text>
      </svg>
      {label && <p className="text-xs text-slate-500 mt-1 text-center">{label}</p>}
    </div>
  );
}

/** Barra horizontal com label */
function HorizontalBar({ label, value, maxValue, color, suffix = '' }) {
  const pct = maxValue > 0 ? Math.min((value / maxValue) * 100, 100) : 0;
  return (
    <div>
      <div className="flex items-center justify-between text-xs mb-1">
        <span className="font-medium text-slate-700 dark:text-slate-200">{label}</span>
        <span className="text-slate-500 dark:text-slate-400 font-medium">{value}{suffix}</span>
      </div>
      <div className="w-full h-2 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
        <div className="h-full rounded-full transition-all duration-500" style={{ width: `${pct}%`, backgroundColor: color }} />
      </div>
    </div>
  );
}

// ─── Dashboard Colaborador ────────────────────────────────────────

function CollaboratorDashboard({ profile, currentUser, orders, events }) {
  const now = new Date();
  const targetHours = profile.hoursMonth || 176;
  const [kpiHistory, setKpiHistory] = useState([]);

  const myOrders = useMemo(() => {
    const userName = (currentUser.name || '').toLowerCase().trim();
    return orders.filter(o => {
      return o.assignee === currentUser.id || namesMatch(o.assignee, currentUser.name) || namesMatch(o.assignedTo, currentUser.name);
    });
  }, [orders, currentUser]);
  const myEvents = useMemo(() => events.filter(e => e.assignee === currentUser.id), [events, currentUser]);
  const kpi = useMemo(() => calcKPIs(myOrders, myEvents, targetHours), [myOrders, myEvents, targetHours]);

  // Carregar historico de KPIs e salvar snapshot atual
  useEffect(() => {
    (async () => {
      const userName = currentUser.name || profile.name || '';
      if (!userName) return;
      await saveMonthlySnapshot(myOrders, myEvents, targetHours, userName);
      const history = await getHistory(userName);
      setKpiHistory(history);
    })();
  }, [currentUser, myOrders, myEvents, targetHours, profile]);

  const trends = useMemo(() => calculateTrends(kpiHistory), [kpiHistory]);

  // O.S. em andamento ha mais tempo (potenciais atrasadas)
  const staleOrders = useMemo(() => {
    return myOrders
      .filter(o => o.status === 'in_progress' && o.actualStart)
      .map(o => {
        const daysRunning = Math.floor((Date.now() - new Date(o.actualStart).getTime()) / (1000 * 60 * 60 * 24));
        return { ...o, daysRunning };
      })
      .sort((a, b) => b.daysRunning - a.daysRunning)
      .slice(0, 5);
  }, [myOrders]);

  // Evolucao de produtividade (ultimos 6 meses)
  const monthlyEvolution = useMemo(() => {
    const months = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthDone = myOrders.filter(o => {
        if (o.status !== 'done' || !o.actualEnd) return false;
        const od = new Date(o.actualEnd);
        return od.getMonth() === d.getMonth() && od.getFullYear() === d.getFullYear();
      });
      const realized = monthDone.reduce((sum, o) => sum + calcOSHours(o), 0);
      const estimated = monthDone.reduce((sum, o) => sum + calcEstimatedHours(o), 0);
      const productivity = realized > 0 ? Math.round((estimated / realized) * 100) : 0;
      months.push({
        label: d.toLocaleDateString('pt-BR', { month: 'short' }).replace('.', ''),
        productivity,
        done: monthDone.length,
      });
    }
    return months;
  }, [myOrders]);

  return (
    <div className="space-y-6">
      {/* Welcome */}
      <div>
        <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">
          Ola, {profile?.name?.split(' ')[0] || currentUser.name}!
        </h2>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          {now.toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })} — Meus KPIs
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <KPICard
          title="Tempo Medio de Entrega"
          value={`${kpi.avgDeliveryMonth} dias`}
          subtitle={`Geral: ${kpi.avgDelivery} dias`}
          icon={ClockIcon}
          color="blue"
        />
        <KPICard
          title="Taxa de Conclusao"
          value={`${kpi.completionRate}%`}
          subtitle={`${kpi.doneMonth} de ${kpi.doneMonth + kpi.inProgress} no mes`}
          icon={CheckCircleIcon}
          color="green"
        />
        <KPICard
          title="Entrega no Prazo"
          value={`${kpi.onTimeRate}%`}
          subtitle={kpi.avgDelay > 0 ? `Atraso medio: ${kpi.avgDelay} dias` : 'Sem atrasos'}
          icon={TargetIcon}
          color={parseInt(kpi.onTimeRate) >= 80 ? 'green' : 'orange'}
        />
        <KPICard
          title="Produtividade"
          value={`${kpi.productivityMonth}%`}
          subtitle={`${kpi.estimatedHours.toFixed(0)}h prev. / ${kpi.realizedHours.toFixed(0)}h realiz.`}
          icon={SpeedIcon}
          color={parseInt(kpi.productivityMonth) >= 90 ? 'green' : parseInt(kpi.productivityMonth) >= 60 ? 'purple' : 'orange'}
          trend={parseInt(kpi.productivityChange)}
        />
        <KPICard
          title="Reunioes"
          value={`${kpi.meetingAttendance}% presenca`}
          subtitle={`${kpi.meetingPunctuality}% no horario · ${kpi.attendedMeetings} de ${kpi.pastMeetings}`}
          icon={MeetingIcon}
          color={parseInt(kpi.meetingAttendance) >= 80 ? 'green' : parseInt(kpi.meetingAttendance) >= 60 ? 'amber' : 'red'}
        />
        <KPICard
          title="Atrasos"
          value={formatLateTime(kpi.totalLateMinutes)}
          subtitle={kpi.lateArrivals === 0 ? 'Nenhum atraso registrado' : `${kpi.lateArrivals} ocorrencia${kpi.lateArrivals > 1 ? 's' : ''} em ${kpi.attendedMeetings} reunioes`}
          icon={AlertIcon}
          color={kpi.lateArrivals === 0 ? 'green' : kpi.lateArrivals <= 2 ? 'amber' : 'red'}
        />
      </div>

      {/* Gauges + Hours Progress */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Gauge cards */}
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-5">
          <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-100 mb-4">Indicadores</h3>
          <div className="flex items-center justify-around">
            <GaugeChart
              value={parseInt(kpi.reworkRate)}
              label="Retrabalho"
              color={parseInt(kpi.reworkRate) <= 15 ? '#22c55e' : parseInt(kpi.reworkRate) <= 30 ? '#f97316' : '#ef4444'}
            />
            <GaugeChart
              value={parseInt(kpi.utilization)}
              label="Aproveitamento"
              color={parseInt(kpi.utilization) >= 70 ? '#3b82f6' : '#ef4444'}
            />
          </div>
        </div>

        {/* Curva S - Produtividade */}
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-5 lg:col-span-2">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-100">Evolucao de Produtividade</h3>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 rounded-full bg-blue-500" />
                  <span className="text-[10px] text-slate-400">Produtividade</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-4 h-[1px] bg-emerald-400" style={{ borderTop: '1px dashed #34d399' }} />
                  <span className="text-[10px] text-slate-400">Meta 100%</span>
                </div>
              </div>
            </div>
            {(() => {
              const W = 500, H = 180, padL = 36, padR = 16, padT = 24, padB = 32;
              const chartW = W - padL - padR;
              const chartH = H - padT - padB;
              const data = monthlyEvolution;
              const maxVal = Math.max(...data.map(d => d.productivity), 120);
              const minVal = 0;
              const points = data.map((d, i) => ({
                x: padL + (i / (data.length - 1)) * chartW,
                y: padT + chartH - ((d.productivity - minVal) / (maxVal - minVal)) * chartH,
                val: d.productivity,
                label: d.label,
                done: d.done,
              }));
              // Curva suave com cubic bezier
              const pathD = points.reduce((acc, p, i) => {
                if (i === 0) return `M ${p.x} ${p.y}`;
                const prev = points[i - 1];
                const cpx = (prev.x + p.x) / 2;
                return `${acc} C ${cpx} ${prev.y}, ${cpx} ${p.y}, ${p.x} ${p.y}`;
              }, '');
              // Area fill path
              const areaD = `${pathD} L ${points[points.length - 1].x} ${padT + chartH} L ${points[0].x} ${padT + chartH} Z`;
              // Meta line Y
              const metaY = padT + chartH - ((100 - minVal) / (maxVal - minVal)) * chartH;
              // Grid lines
              const gridValues = [0, 50, 100];
              const lastPoint = points[points.length - 1];

              return (
                <svg viewBox={`0 0 ${W} ${H}`} className="w-full" preserveAspectRatio="xMidYMid meet">
                  <defs>
                    <linearGradient id="prodGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.3" />
                      <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.02" />
                    </linearGradient>
                    <filter id="glow">
                      <feGaussianBlur stdDeviation="2" result="blur" />
                      <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
                    </filter>
                  </defs>
                  {/* Grid lines */}
                  {gridValues.map(v => {
                    const gy = padT + chartH - ((v - minVal) / (maxVal - minVal)) * chartH;
                    return (
                      <g key={v}>
                        <line x1={padL} y1={gy} x2={W - padR} y2={gy} stroke="#e2e8f0" strokeWidth="0.5" />
                        <text x={padL - 6} y={gy + 4} textAnchor="end" fill="#94a3b8" fontSize="10">{v}%</text>
                      </g>
                    );
                  })}
                  {/* Meta line 100% */}
                  <line x1={padL} y1={metaY} x2={W - padR} y2={metaY} stroke="#34d399" strokeWidth="1.2" strokeDasharray="6 4" opacity="0.7" />
                  {/* Area fill */}
                  <path d={areaD} fill="url(#prodGradient)" />
                  {/* Curve line */}
                  <path d={pathD} fill="none" stroke="#3b82f6" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" filter="url(#glow)" />
                  {/* Month labels */}
                  {points.map((p, i) => (
                    <text key={i} x={p.x} y={H - 8} textAnchor="middle" fill="#94a3b8" fontSize="10" className="capitalize">{p.label}</text>
                  ))}
                  {/* Data points */}
                  {points.map((p, i) => (
                    <g key={i}>
                      <circle cx={p.x} cy={p.y} r="5" fill="white" stroke="#3b82f6" strokeWidth="2.5" />
                      {/* Value label on point */}
                      <text x={p.x} y={p.y - 10} textAnchor="middle" fill={p.val >= 90 ? '#059669' : p.val >= 60 ? '#2563eb' : '#ea580c'} fontSize="10" fontWeight="bold">
                        {p.val}%
                      </text>
                    </g>
                  ))}
                  {/* Current value highlight */}
                  <circle cx={lastPoint.x} cy={lastPoint.y} r="6" fill="#3b82f6" stroke="white" strokeWidth="2.5" filter="url(#glow)" />
                </svg>
              );
            })()}
          </div>
        </div>
      </div>

      {/* Stale O.S. + Workload */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* O.S. em andamento (potenciais atrasos) */}
        <SectionCard title="O.S. Em Andamento (Monitoramento)" action={{ label: 'Ver O.S.', href: '/financial' }}>
          {staleOrders.length === 0 ? (
            <EmptyState message="Nenhuma O.S. em andamento" />
          ) : (
            <div className="divide-y divide-slate-100 dark:divide-slate-700">
              {staleOrders.map(order => {
                const isLate = order.estimatedEnd && new Date(order.estimatedEnd) < now;
                return (
                  <div key={order.id} className="px-5 py-3 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-mono text-slate-400 dark:text-slate-500">#{order.number}</span>
                          <span className="text-sm font-medium text-slate-800 dark:text-slate-100 truncate">{order.title}</span>
                          {isLate && (
                            <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-red-100 text-red-600 font-medium shrink-0">
                              Atrasada
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-400 mt-0.5">{order.client || 'Sem cliente'}</p>
                      </div>
                      <div className="text-right shrink-0 ml-3">
                        <span className={`text-xs font-bold ${order.daysRunning > 7 ? 'text-red-600' : order.daysRunning > 3 ? 'text-amber-600' : 'text-slate-700'}`}>
                          {order.daysRunning} dias
                        </span>
                        <p className="text-[10px] text-slate-400">em andamento</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </SectionCard>

        {/* Resumo do status */}
        <SectionCard title="Resumo de Carga">
          <div className="p-5 space-y-4">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-700/50">
                <p className="text-2xl font-bold text-slate-400 dark:text-slate-300">{kpi.available}</p>
                <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-1">Disponiveis</p>
              </div>
              <div className="p-3 rounded-lg bg-blue-50 dark:bg-blue-900/20">
                <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{kpi.inProgress}</p>
                <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-1">Em Andamento</p>
              </div>
              <div className="p-3 rounded-lg bg-emerald-50 dark:bg-emerald-900/20">
                <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">{kpi.doneMonth}</p>
                <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-1">Concluidas</p>
              </div>
            </div>

            <div className="pt-2 space-y-3">
              <HorizontalBar label="Utilizacao" value={parseInt(kpi.utilization)} maxValue={100} color="#3b82f6" suffix="%" />
              <HorizontalBar label="Meta de Horas" value={kpi.hoursMonth.toFixed(0)} maxValue={targetHours} color="#22c55e" suffix={`h / ${targetHours}h`} />
            </div>

            {/* Insight rapido */}
            {parseInt(kpi.onTimeRate) < 70 && (
              <div className="mt-3 p-3 bg-amber-50 rounded-lg border border-amber-100">
                <p className="text-xs text-amber-700 flex items-start gap-2">
                  <span className="shrink-0 mt-0.5">⚠</span>
                  Sua taxa de pontualidade esta em {kpi.onTimeRate}%. Tente priorizar as O.S. com prazo mais proximo.
                </p>
              </div>
            )}
            {parseInt(kpi.utilization) < 50 && (
              <div className="mt-3 p-3 bg-blue-50 rounded-lg border border-blue-100">
                <p className="text-xs text-blue-700 flex items-start gap-2">
                  <span className="shrink-0 mt-0.5">ℹ</span>
                  Sua utilizacao esta em {kpi.utilization}%. Verifique se ha O.S. disponiveis para pegar.
                </p>
              </div>
            )}
          </div>
        </SectionCard>
      </div>

      {/* Tendencias */}
      {kpiHistory.length >= 2 && (
        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <TrendUpIcon /> Tendencias
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <TrendCard
              label="Taxa de Conclusao"
              value={parseFloat(kpi.completionRate)}
              suffix="%"
              trend={trends.completionRate}
              sparklineData={kpiHistory.map(s => s.metrics?.completionRate || 0)}
              color="#22c55e"
            />
            <TrendCard
              label="Entrega no Prazo"
              value={parseFloat(kpi.onTimeRate)}
              suffix="%"
              trend={trends.onTimeRate}
              sparklineData={kpiHistory.map(s => s.metrics?.onTimeRate || 0)}
              color="#3b82f6"
            />
            <TrendCard
              label="Produtividade"
              value={parseFloat(kpi.productivityMonth)}
              suffix="%"
              trend={trends.productivity}
              sparklineData={kpiHistory.map(s => s.metrics?.productivity || 0)}
              color="#3b82f6"
            />
            <TrendCard
              label="Horas/Mes"
              value={kpi.hoursMonth}
              suffix="h"
              trend={trends.hoursMonth}
              sparklineData={kpiHistory.map(s => s.metrics?.hoursMonth || 0)}
              color="#f59e0b"
            />
          </div>
          <ProjectionWidget history={kpiHistory} />
        </div>
      )}
    </div>
  );
}

// ─── Dashboard Gestor ─────────────────────────────────────────────

function ManagerDashboard({ profile, orders, events, selectedMember, onMemberChange, allMembers }) {
  const now = new Date();
  const targetHours = profile.hoursMonth || 176;

  // Filtrar dados pelo membro selecionado
  const filteredOrders = useMemo(() => {
    if (selectedMember === 'all') return orders;
    const member = allMembers.find(m => m.id === selectedMember);
    if (!member) return orders;
    return orders.filter(o =>
      o.assignee === selectedMember || namesMatch(member.name, o.assignee) || namesMatch(member.name, o.assignedTo)
    );
  }, [orders, selectedMember, allMembers]);

  const filteredEvents = useMemo(() => {
    if (selectedMember === 'all') return events;
    return events.filter(e => e.assignee === selectedMember);
  }, [events, selectedMember]);

  const kpi = useMemo(() => calcKPIs(filteredOrders, filteredEvents, targetHours), [filteredOrders, filteredEvents, targetHours]);

  // KPIs por membro
  const memberKPIs = useMemo(() => {
    return allMembers.map(member => {
      const mOrders = orders.filter(o =>
        o.assignee === member.id || namesMatch(member.name, o.assignee) || namesMatch(member.name, o.assignedTo)
      );
      const mEvents = events.filter(e => e.assignee === member.id);
      const mk = calcKPIs(mOrders, mEvents, targetHours);
      return { member, kpi: mk };
    });
  }, [orders, events, targetHours, allMembers]);

  // Ranking por produtividade
  const ranking = useMemo(() => {
    return [...memberKPIs].sort((a, b) => b.kpi.doneMonth - a.kpi.doneMonth || b.kpi.hoursMonth - a.kpi.hoursMonth);
  }, [memberKPIs]);

  // Custos por O.S. (usando hourlyRate individual de cada membro)
  const costData = useMemo(() => {
    const doneMonth = orders.filter(o => o.status === 'done' && isCurrentMonth(o.actualEnd));
    const doneLastMonth = orders.filter(o => o.status === 'done' && isLastMonth(o.actualEnd));

    const costsMonth = doneMonth.map(o => calcOSCost(o, allMembers));
    const costsLastMonth = doneLastMonth.map(o => calcOSCost(o, allMembers));

    const totalCostMonth = costsMonth.reduce((s, c) => s + c.totalCost, 0);
    const totalLaborMonth = costsMonth.reduce((s, c) => s + c.laborCost, 0);
    const totalMaterialMonth = costsMonth.reduce((s, c) => s + c.materialCost, 0);
    const avgCostMonth = costsMonth.length > 0 ? totalCostMonth / costsMonth.length : 0;

    const totalCostLastMonth = costsLastMonth.reduce((s, c) => s + c.totalCost, 0);
    const avgCostLastMonth = costsLastMonth.length > 0 ? totalCostLastMonth / costsLastMonth.length : 0;

    const costChange = avgCostLastMonth > 0 ? ((avgCostMonth - avgCostLastMonth) / avgCostLastMonth) * 100 : 0;

    return { totalCostMonth, totalLaborMonth, totalMaterialMonth, avgCostMonth, costChange, countMonth: costsMonth.length };
  }, [orders, allMembers]);

  // Custo de reunioes do mes
  const meetingCostData = useMemo(() => {
    const monthMeetings = events.filter(e =>
      e.type === 'meeting' && isCurrentMonth(e.startDate)
    );
    const costs = monthMeetings.map(meeting => {
      const start = new Date(meeting.startDate);
      const end = new Date(meeting.endDate);
      const hours = Math.max((end - start) / 3600000, 0);
      const attendees = meeting.attendees && meeting.attendees.length > 0
        ? meeting.attendees
        : meeting.assignee ? [meeting.assignee] : [];
      const totalRate = attendees.reduce((sum, idOrName) => {
        const member = allMembers.find(m => m.id === idOrName || namesMatch(m.name, idOrName));
        return sum + (member ? getMemberHourlyRate(member) : 0);
      }, 0);
      return hours * totalRate;
    });
    const total = costs.reduce((s, c) => s + c, 0);
    const avg = costs.length > 0 ? total / costs.length : 0;
    return { total, avg, count: monthMeetings.length };
  }, [events, allMembers]);

  // Atividade recente
  const recentActivity = useMemo(() => {
    const items = [];
    orders.filter(o => o.status === 'done' && o.actualEnd).forEach(o => {
      const member = allMembers.find(m => m.id === o.assignee || namesMatch(m.name, o.assignee));
      const displayMember = member || (o.assignee ? { id: o.assignee, name: o.assignee, color: '#3b82f6' } : null);
      if (displayMember) items.push({ date: o.actualEnd, desc: `${shortName(displayMember.name)} concluiu O.S. #${o.number}`, member: displayMember });
    });
    return items.sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 6);
  }, [orders, allMembers]);

  const medals = ['text-amber-500', 'text-slate-400', 'text-orange-600'];

  return (
    <div className="space-y-6">
      {/* Welcome + Filter */}
      <div className="flex items-start sm:items-center justify-between flex-col sm:flex-row gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">
            Ola, {profile?.name?.split(' ')[0] || 'Gestor'}!
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            {now.toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })} — KPIs da Equipe
          </p>
        </div>
        <div className="flex items-center gap-2">
          <label className="text-xs font-medium text-slate-500 dark:text-slate-400">Filtrar:</label>
          <select
            value={selectedMember}
            onChange={e => onMemberChange(e.target.value)}
            className="px-3 py-2 border border-slate-200 dark:border-slate-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-slate-800 dark:text-slate-200"
          >
            <option value="all">Toda a equipe</option>
            {allMembers.map(m => <option key={m.id} value={m.id}>{shortName(m.name)}</option>)}
          </select>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard
          title="Tempo Medio Entrega"
          value={`${kpi.avgDeliveryMonth} dias`}
          subtitle={`Geral: ${kpi.avgDelivery} dias`}
          icon={ClockIcon}
          color="blue"
        />
        <KPICard
          title="Taxa de Conclusao"
          value={`${kpi.completionRate}%`}
          subtitle={`${kpi.doneMonth} no mes`}
          icon={CheckCircleIcon}
          color="green"
        />
        <KPICard
          title="Entrega no Prazo"
          value={`${kpi.onTimeRate}%`}
          subtitle={kpi.avgDelay > 0 ? `Atraso medio: ${kpi.avgDelay}d` : 'Sem atrasos'}
          icon={TargetIcon}
          color={parseInt(kpi.onTimeRate) >= 80 ? 'green' : 'red'}
        />
        <KPICard
          title="Produtividade"
          value={`${kpi.productivityMonth}%`}
          subtitle={`${kpi.estimatedHours.toFixed(0)}h prev. / ${kpi.realizedHours.toFixed(0)}h realiz.`}
          icon={SpeedIcon}
          color={parseInt(kpi.productivityMonth) >= 90 ? 'green' : parseInt(kpi.productivityMonth) >= 60 ? 'purple' : 'orange'}
          trend={parseInt(kpi.productivityChange)}
        />
        <KPICard
          title="Aproveitamento de Horas"
          value={`${kpi.utilization}%`}
          subtitle={`${kpi.hoursMonth.toFixed(0)}h de ${targetHours}h`}
          icon={ChartIcon}
          color={parseInt(kpi.utilization) >= 70 ? 'green' : 'orange'}
        />
        <KPICard
          title="Reunioes"
          value={`${kpi.meetingAttendance}% presenca`}
          subtitle={`${kpi.meetingPunctuality}% no horario · ${kpi.attendedMeetings} de ${kpi.pastMeetings}`}
          icon={MeetingIcon}
          color={parseInt(kpi.meetingAttendance) >= 80 ? 'green' : parseInt(kpi.meetingAttendance) >= 60 ? 'amber' : 'red'}
        />
        <KPICard
          title="Atrasos"
          value={formatLateTime(kpi.totalLateMinutes)}
          subtitle={kpi.lateArrivals === 0 ? 'Nenhum atraso registrado' : `${kpi.lateArrivals} ocorrencia${kpi.lateArrivals > 1 ? 's' : ''} em ${kpi.attendedMeetings} reunioes`}
          icon={AlertIcon}
          color={kpi.lateArrivals === 0 ? 'green' : kpi.lateArrivals <= 2 ? 'amber' : 'red'}
        />
        <KPICard
          title="Custo Medio / O.S."
          value={formatCurrency(costData.avgCostMonth)}
          subtitle={`Total: ${formatCurrency(costData.totalCostMonth)} (${costData.countMonth} O.S.)`}
          icon={MoneyIcon}
          color="orange"
          trend={costData.costChange !== 0 ? Math.round(-costData.costChange) : undefined}
          trendLabel="vs mes anterior"
        />
        <KPICard
          title="Custo Medio / Reuniao"
          value={formatCurrency(meetingCostData.avg)}
          subtitle={`Total: ${formatCurrency(meetingCostData.total)} (${meetingCostData.count} reunioes)`}
          icon={MeetingIcon}
          color="purple"
        />
      </div>

      {/* Team Performance Cards */}
      <div>
        <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-100 mb-3 flex items-center gap-2">
          <UsersIcon /> Performance da Equipe
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {memberKPIs.map(({ member, kpi: mk }) => {
            const onTimePct = parseInt(mk.onTimeRate);
            const utilPct = parseInt(mk.utilization);
            return (
              <div key={member.id} className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4 hover:shadow-md transition-shadow">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm" style={{ backgroundColor: member.color }}>
                    {member.name.charAt(0)}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">{shortName(member.name)}</p>
                    <p className="text-[10px] text-slate-400">{mk.productivityMonth}% produtividade</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2 text-center mb-3">
                  <div>
                    <p className="text-lg font-bold text-emerald-600">{mk.doneMonth}</p>
                    <p className="text-[10px] text-slate-400">Concl. (mes)</p>
                  </div>
                  <div>
                    <p className={`text-lg font-bold ${onTimePct >= 80 ? 'text-emerald-600' : onTimePct >= 50 ? 'text-amber-600' : 'text-red-600'}`}>
                      {mk.onTimeRate}%
                    </p>
                    <p className="text-[10px] text-slate-400">No prazo</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2 text-center mb-3">
                  <div>
                    <p className={`text-sm font-bold ${parseInt(mk.meetingAttendance) >= 80 ? 'text-blue-600' : 'text-amber-600'}`}>
                      {mk.meetingAttendance}%
                    </p>
                    <p className="text-[10px] text-slate-400">Reunioes</p>
                  </div>
                  <div>
                    <p className={`text-sm font-bold ${mk.lateArrivals === 0 ? 'text-emerald-600' : mk.lateArrivals <= 2 ? 'text-amber-600' : 'text-red-600'}`}>
                      {formatLateTime(mk.totalLateMinutes)}
                    </p>
                    <p className="text-[10px] text-slate-400">Atrasos</p>
                  </div>
                </div>
                <div className="space-y-2">
                  <div>
                    <div className="flex justify-between text-[10px] text-slate-400 mb-0.5">
                      <span>Tempo medio: {mk.avgDeliveryMonth}d</span>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-[10px] text-slate-400 mb-0.5">
                      <span>Aproveitamento</span>
                      <span>{mk.utilization}%</span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                      <div className="h-full rounded-full transition-all" style={{ backgroundColor: member.color, width: `${utilPct}%` }} />
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Ranking + Delivery Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Ranking */}
        <SectionCard title="Ranking do Mes">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-700/50">
                  <th className="text-left px-5 py-2.5 text-[10px] font-semibold text-slate-400 dark:text-slate-500 uppercase w-10">#</th>
                  <th className="text-left px-3 py-2.5 text-[10px] font-semibold text-slate-400 dark:text-slate-500 uppercase">Colaborador</th>
                  <th className="text-center px-3 py-2.5 text-[10px] font-semibold text-slate-400 dark:text-slate-500 uppercase">O.S.</th>
                  <th className="text-center px-3 py-2.5 text-[10px] font-semibold text-slate-400 dark:text-slate-500 uppercase">Prazo</th>
                  <th className="text-center px-5 py-2.5 text-[10px] font-semibold text-slate-400 dark:text-slate-500 uppercase">T.Medio</th>
                </tr>
              </thead>
              <tbody>
                {ranking.map((entry, i) => (
                  <tr key={entry.member.id} className="border-t border-slate-100 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                    <td className="px-5 py-3">
                      {i < 3 ? (
                        <span className={`font-bold ${medals[i]}`}>{i + 1}</span>
                      ) : (
                        <span className="text-slate-400">{i + 1}</span>
                      )}
                    </td>
                    <td className="px-3 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold" style={{ backgroundColor: entry.member.color }}>
                          {entry.member.name.charAt(0)}
                        </div>
                        <span className="font-medium text-slate-700 dark:text-slate-200">{shortName(entry.member.name)}</span>
                      </div>
                    </td>
                    <td className="px-3 py-3 text-center font-bold text-slate-800 dark:text-slate-100">{entry.kpi.doneMonth}</td>
                    <td className="px-3 py-3 text-center">
                      <span className={`text-xs font-bold ${parseInt(entry.kpi.onTimeRate) >= 80 ? 'text-emerald-600' : 'text-red-500'}`}>
                        {entry.kpi.onTimeRate}%
                      </span>
                    </td>
                    <td className="px-5 py-3 text-center font-bold text-blue-600">{entry.kpi.avgDeliveryMonth}d</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </SectionCard>

        {/* Analise de Entregas */}
        <SectionCard title="Analise de Entregas">
          <div className="p-5 space-y-5">
            {/* Comparativo por membro: tempo medio */}
            <div>
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-3">Tempo Medio de Entrega (dias)</p>
              <div className="space-y-3">
                {memberKPIs.map(({ member, kpi: mk }) => (
                  <HorizontalBar
                    key={member.id}
                    label={shortName(member.name)}
                    value={parseFloat(mk.avgDeliveryMonth)}
                    maxValue={Math.max(...memberKPIs.map(x => parseFloat(x.kpi.avgDeliveryMonth)), 1)}
                    color={member.color}
                    suffix=" dias"
                  />
                ))}
              </div>
            </div>

            {/* Comparativo pontualidade */}
            <div className="pt-3 border-t border-slate-100 dark:border-slate-700">
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-3">Taxa de Pontualidade (%)</p>
              <div className="space-y-3">
                {memberKPIs.map(({ member, kpi: mk }) => (
                  <HorizontalBar
                    key={member.id}
                    label={shortName(member.name)}
                    value={parseInt(mk.onTimeRate)}
                    maxValue={100}
                    color={parseInt(mk.onTimeRate) >= 80 ? '#22c55e' : parseInt(mk.onTimeRate) >= 50 ? '#f97316' : '#ef4444'}
                    suffix="%"
                  />
                ))}
              </div>
            </div>
          </div>
        </SectionCard>
      </div>

      {/* Capacidade da Equipe + Lead Time */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <SectionCard title="Capacidade da Equipe">
          <div className="p-5 space-y-3">
            {(() => {
              const capacity = calcCapacity(orders, allMembers);
              return capacity.map(cap => (
                <div key={cap.id} className="space-y-1">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full flex items-center justify-center text-white text-[10px] font-bold" style={{ backgroundColor: cap.color }}>
                        {cap.name.charAt(0)}
                      </div>
                      <span className="text-sm text-slate-700 dark:text-slate-200">{shortName(cap.name)}</span>
                    </div>
                    <span className={`text-xs font-bold ${cap.utilization > 100 ? 'text-red-500' : cap.utilization > 80 ? 'text-amber-500' : 'text-emerald-500'}`}>
                      {cap.utilization}%
                    </span>
                  </div>
                  <div className="h-2 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${cap.utilization > 100 ? 'bg-red-500' : cap.utilization > 80 ? 'bg-amber-400' : 'bg-emerald-400'}`}
                      style={{ width: `${Math.min(cap.utilization, 100)}%` }}
                    />
                  </div>
                  <p className="text-[10px] text-slate-400">{cap.allocatedHours}h alocadas / {cap.availableHours}h disponivel · {cap.activeOrders} O.S. ativas</p>
                </div>
              ));
            })()}
          </div>
        </SectionCard>

        <SectionCard title="Indicadores SaaS">
          <div className="p-5 space-y-4">
            {(() => {
              const avgLT = calcAvgLeadTime(orders);
              const sla = calcSLACompliance(orders);
              const catBreakdown = calcCategoryBreakdown(orders);
              const activeCats = Object.entries(catBreakdown).filter(([, v]) => v.total > 0);
              const catLabels = { bug: 'Bug', feature: 'Feature', support: 'Suporte', compliance: 'Compliance', campaign: 'Campanha', internal: 'Interno' };
              const catColors = { bug: '#ef4444', feature: '#3b82f6', support: '#22c55e', compliance: '#a855f7', campaign: '#f59e0b', internal: '#64748b' };
              return (
                <>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-700/50 text-center">
                      <p className="text-2xl font-bold text-slate-800 dark:text-slate-100">{avgLT < 24 ? `${Math.round(avgLT)}h` : `${Math.round(avgLT / 24)}d`}</p>
                      <p className="text-[10px] text-slate-400 mt-1">Lead Time Medio</p>
                    </div>
                    <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-700/50 text-center">
                      <p className={`text-2xl font-bold ${sla.rate >= 80 ? 'text-emerald-600' : sla.rate >= 50 ? 'text-amber-500' : 'text-red-500'}`}>{sla.rate}%</p>
                      <p className="text-[10px] text-slate-400 mt-1">SLA Cumprido ({sla.met}/{sla.total})</p>
                    </div>
                  </div>
                  {activeCats.length > 0 && (
                    <div className="space-y-2">
                      <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">Por Categoria</p>
                      {activeCats.map(([cat, data]) => (
                        <div key={cat} className="flex items-center justify-between text-sm">
                          <div className="flex items-center gap-2">
                            <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: catColors[cat] }} />
                            <span className="text-slate-600 dark:text-slate-300">{catLabels[cat]}</span>
                          </div>
                          <div className="flex items-center gap-3 text-xs text-slate-400">
                            <span>{data.done}/{data.total}</span>
                            <span>{data.inProgress} ativas</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </>
              );
            })()}
          </div>
        </SectionCard>
      </div>

      {/* Financial + Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Custo por Colaborador */}
        <SectionCard title="Custo por Colaborador (Mes)">
          {allMembers.some(m => getMemberHourlyRate(m) > 0) ? (
            <div className="p-5 space-y-3">
              {memberKPIs.map(({ member, kpi: mk }) => {
                const rate = getMemberHourlyRate(member);
                const laborCost = mk.hoursMonth * rate;
                // Gastos materiais do membro neste mes
                const memberOrders = orders.filter(o => o.status === 'done' && isCurrentMonth(o.actualEnd) && (o.assignee || '').toLowerCase().trim() === member.name.toLowerCase().trim());
                const materialCost = memberOrders.reduce((s, o) => s + (o.expenses || []).reduce((a, e) => a + (e.value || 0) * (e.quantity || 1), 0), 0);
                const totalCost = laborCost + materialCost;
                const costPerOS = mk.doneMonth > 0 ? totalCost / mk.doneMonth : 0;
                return (
                  <div key={member.id} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold" style={{ backgroundColor: member.color }}>
                        {member.name.charAt(0)}
                      </div>
                      <div>
                        <span className="text-sm text-slate-700 dark:text-slate-200">{shortName(member.name)}</span>
                        <p className="text-[10px] text-slate-400">
                          {rate > 0 ? `${formatCurrency(rate)}/h` : 'Sem salario'} · {mk.hoursMonth.toFixed(0)}h · {mk.doneMonth} O.S.
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-slate-800 dark:text-slate-100">{formatCurrency(totalCost)}</p>
                      <p className="text-[10px] text-slate-400">
                        {costPerOS > 0 ? `${formatCurrency(costPerOS)}/O.S.` : '-'}
                        {materialCost > 0 ? ` · Mat: ${formatCurrency(materialCost)}` : ''}
                      </p>
                    </div>
                  </div>
                );
              })}
              <div className="border-t border-slate-200 dark:border-slate-700 pt-3">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-semibold text-slate-800 dark:text-slate-100">Total do Mes</span>
                  <span className="text-lg font-bold text-blue-600">
                    {formatCurrency(costData.totalCostMonth)}
                  </span>
                </div>
                <div className="flex items-center justify-between text-[10px] text-slate-400 dark:text-slate-500">
                  <span>Mao de obra: {formatCurrency(costData.totalLaborMonth)}</span>
                  <span>Materiais: {formatCurrency(costData.totalMaterialMonth)}</span>
                </div>
              </div>
            </div>
          ) : (
            <EmptyState message="Configure salario dos funcionarios em Configuracoes > Equipe" />
          )}
        </SectionCard>

        {/* Atividade Recente */}
        <SectionCard title="Atividade Recente">
          {recentActivity.length === 0 ? (
            <EmptyState message="Nenhuma atividade recente" />
          ) : (
            <div className="divide-y divide-slate-100 dark:divide-slate-700 max-h-80 overflow-y-auto">
              {recentActivity.map((item, i) => (
                <div key={i} className="px-5 py-3 flex items-start gap-3 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0 mt-0.5" style={{ backgroundColor: item.member.color }}>
                    {item.member.name.charAt(0)}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm text-slate-700 dark:text-slate-200 leading-tight">{item.desc}</p>
                    <p className="text-[10px] text-slate-400 mt-0.5">{timeAgo(item.date)}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </SectionCard>
      </div>

      {/* Alertas */}
      {(function() {
        const alerts = [];
        memberKPIs.forEach(({ member, kpi: mk }) => {
          if (parseInt(mk.onTimeRate) < 50 && mk.totalDone > 0) {
            alerts.push({ type: 'warning', msg: `${shortName(member.name)} esta com ${mk.onTimeRate}% de pontualidade. Considere revisar a carga.` });
          }
          if (mk.inProgress > 5) {
            alerts.push({ type: 'info', msg: `${shortName(member.name)} tem ${mk.inProgress} O.S. em andamento simultaneamente.` });
          }
        });
        if (alerts.length === 0) return null;
        return (
          <div className="space-y-2">
            {alerts.map((alert, i) => (
              <div key={i} className={`p-3 rounded-lg border flex items-start gap-2 text-xs ${alert.type === 'warning' ? 'bg-amber-50 border-amber-100 text-amber-700' : 'bg-blue-50 border-blue-100 text-blue-700'}`}>
                <span className="shrink-0 mt-0.5">{alert.type === 'warning' ? '⚠' : 'ℹ'}</span>
                {alert.msg}
              </div>
            ))}
          </div>
        );
      })()}
    </div>
  );
}

// ─── Componente Principal ─────────────────────────────────────────

export function DashboardPage() {
  const [profile, setProfile] = useState({});
  const [selectedMember, setSelectedMember] = useState('all');

  const { data: orders = [], isLoading: loadingOrders } = useOSOrders();
  const { data: events = [], isLoading: loadingEvents } = useAgendaEvents();
  const { data: teamMembers = [], isLoading: loadingMembers } = useTeamMembers();
  const loading = loadingOrders || loadingEvents || loadingMembers;

  // Realtime: atualiza automaticamente quando dados mudam no Supabase
  useRealtimeOSOrders();

  // Carregar profile inicial + escutar atualizacoes
  useEffect(() => {
    getProfile().then(setProfile);

    const handleUpdate = () => setProfile(loadProfileSync());
    window.addEventListener('storage', handleUpdate);
    window.addEventListener('profile-updated', handleUpdate);
    return () => {
      window.removeEventListener('storage', handleUpdate);
      window.removeEventListener('profile-updated', handleUpdate);
    };
  }, []);

  // Lista completa: membros cadastrados + perfil logado
  const allMembers = useMemo(() => {
    if (!profile.name) return teamMembers;
    const alreadyIn = teamMembers.some(m => m.name.toLowerCase().trim() === profile.name.toLowerCase().trim());
    if (alreadyIn) return teamMembers;
    return [{ id: 'profile_self', name: profile.name, role: profile.role || '', color: '#3b82f6' }, ...teamMembers];
  }, [teamMembers, profile]);

  const detectedRole = useMemo(() => detectRole(profile), [profile]);
  const [viewOverride, setViewOverride] = useState(null);
  const role = viewOverride || detectedRole;
  const currentUser = useMemo(() => findCurrentUser(profile, allMembers), [profile, allMembers]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const toggleView = () => {
    const next = role === 'manager' ? 'collaborator' : 'manager';
    setViewOverride(next);
  };

  const viewToggle = (
    <div className="flex items-center justify-end mb-4">
      <button
        onClick={toggleView}
        className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-colors shadow-sm"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={role === 'manager'
            ? 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z'
            : 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z'
          } />
        </svg>
        {role === 'manager' ? 'Ver como Colaborador' : 'Ver como Gestor'}
      </button>
    </div>
  );

  // Quando gestor seleciona um membro especifico, mostra o dash desse colaborador
  const isManagerViewingMember = role === 'manager' && selectedMember !== 'all';
  const viewedMember = isManagerViewingMember
    ? allMembers.find(m => m.id === selectedMember) || allMembers[0]
    : currentUser;

  // Header de filtro do gestor (sempre visivel quando role=manager)
  const managerFilter = role === 'manager' ? (
    <div className="flex items-start sm:items-center justify-between flex-col sm:flex-row gap-4 mb-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">
          Ola, {profile?.name?.split(' ')[0] || 'Gestor'}!
        </h2>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          {new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
          {isManagerViewingMember
            ? ` — Visualizando: ${shortName(viewedMember.name)}`
            : ' — KPIs da Equipe'
          }
        </p>
      </div>
      <div className="flex items-center gap-2">
        <label className="text-xs font-medium text-slate-500 dark:text-slate-400">Filtrar:</label>
        <select
          value={selectedMember}
          onChange={e => setSelectedMember(e.target.value)}
          className="px-3 py-2 border border-slate-200 dark:border-slate-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-slate-800 dark:text-slate-200"
        >
          <option value="all">Toda a equipe</option>
          {allMembers.map(m => <option key={m.id} value={m.id}>{shortName(m.name)}</option>)}
        </select>
      </div>
    </div>
  ) : null;

  if (role === 'manager' && !isManagerViewingMember) {
    return (
      <>
        {viewToggle}
        <ManagerDashboard
          profile={profile}
          orders={orders}
          events={events}
          selectedMember={selectedMember}
          onMemberChange={setSelectedMember}
          allMembers={allMembers}
        />
      </>
    );
  }

  if (isManagerViewingMember) {
    return (
      <>
        {viewToggle}
        {managerFilter}
        <CollaboratorDashboard
          profile={profile}
          currentUser={viewedMember}
          orders={orders}
          events={events}
        />
      </>
    );
  }

  return (
    <>
      {viewToggle}
      <CollaboratorDashboard
        profile={profile}
        currentUser={currentUser}
        orders={orders}
        events={events}
      />
    </>
  );
}

export default DashboardPage;
