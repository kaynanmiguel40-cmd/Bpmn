import { useState, useEffect } from 'react';
import { getOSOrders } from '../../lib/osService';
import { getDeadlineStatus, getAlertOrders } from '../../lib/deadlineUtils';
import { getRecentActivities } from '../../lib/activityLogService';
import { getNotifications, getUnreadCount } from '../../lib/notificationService';

function formatDate(d) {
  return d.toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' });
}

function KpiMini({ label, value, color }) {
  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl p-4 border border-slate-200 dark:border-slate-700">
      <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">{label}</p>
      <p className={`text-2xl font-bold ${color}`}>{value}</p>
    </div>
  );
}

export default function MyDayPage() {
  const [orders, setOrders] = useState([]);
  const [activities, setActivities] = useState([]);
  const [unreadNotifs, setUnreadNotifs] = useState(0);
  const [loading, setLoading] = useState(true);

  const profileName = (() => {
    try { return JSON.parse(localStorage.getItem('settings_profile') || '{}').name || 'Voce'; } catch { return 'Voce'; }
  })();

  useEffect(() => {
    (async () => {
      const [ordersData, activitiesData, notifCount] = await Promise.all([
        getOSOrders(),
        getRecentActivities(10),
        getUnreadCount(),
      ]);
      setOrders(ordersData);
      setActivities(activitiesData);
      setUnreadNotifs(notifCount);
      setLoading(false);
    })();
  }, []);

  const today = new Date();
  const myOrders = orders.filter(o => o.status !== 'done');
  const inProgress = orders.filter(o => o.status === 'in_progress');
  const alerts = getAlertOrders(orders);
  const completedToday = orders.filter(o => {
    if (o.status !== 'done' || !o.actualEnd) return false;
    const d = new Date(o.actualEnd);
    return d.toDateString() === today.toDateString();
  });

  // Prazos proximos (proximos 7 dias)
  const upcoming = orders
    .filter(o => o.status !== 'done' && o.estimatedEnd)
    .map(o => ({ ...o, deadline: getDeadlineStatus(o) }))
    .filter(o => o.deadline.status !== 'none' && o.deadline.daysLeft !== null && o.deadline.daysLeft <= 7)
    .sort((a, b) => (a.deadline.daysLeft || 0) - (b.deadline.daysLeft || 0))
    .slice(0, 5);

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-8 bg-slate-200 dark:bg-slate-700 rounded w-1/3" />
        <div className="grid grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => <div key={i} className="h-24 bg-slate-200 dark:bg-slate-700 rounded-xl" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Greeting */}
      <div>
        <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">
          Bom dia, {profileName}
        </h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 capitalize">{formatDate(today)}</p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <KpiMini label="Em andamento" value={inProgress.length} color="text-blue-600 dark:text-blue-400" />
        <KpiMini label="Pendentes" value={myOrders.length} color="text-slate-800 dark:text-slate-100" />
        <KpiMini label="Concluidas hoje" value={completedToday.length} color="text-emerald-600 dark:text-emerald-400" />
        <KpiMini label="Notificacoes" value={unreadNotifs} color={unreadNotifs > 0 ? 'text-red-500' : 'text-slate-800 dark:text-slate-100'} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Alertas */}
        {alerts.length > 0 && (
          <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-5">
            <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-100 mb-3 flex items-center gap-2">
              <svg className="w-4 h-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
              Alertas de Prazo ({alerts.length})
            </h3>
            <div className="space-y-2">
              {alerts.slice(0, 5).map(o => {
                const dl = getDeadlineStatus(o);
                const isOverdue = dl.status === 'overdue';
                return (
                  <div key={o.id} className={`flex items-center justify-between px-3 py-2 rounded-lg ${isOverdue ? 'bg-red-50 dark:bg-red-900/10' : 'bg-amber-50 dark:bg-amber-900/10'}`}>
                    <div className="min-w-0">
                      <span className={`text-sm font-medium ${isOverdue ? 'text-red-700 dark:text-red-400' : 'text-amber-700 dark:text-amber-400'}`}>
                        #{o.number} {o.title}
                      </span>
                    </div>
                    <span className={`text-xs font-medium shrink-0 ml-2 ${isOverdue ? 'text-red-500' : 'text-amber-500'}`}>
                      {dl.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Proximos Prazos */}
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-5">
          <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-100 mb-3 flex items-center gap-2">
            <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            Proximos Prazos
          </h3>
          {upcoming.length === 0 ? (
            <p className="text-sm text-slate-400 dark:text-slate-500">Nenhum prazo nos proximos 7 dias</p>
          ) : (
            <div className="space-y-2">
              {upcoming.map(o => (
                <div key={o.id} className="flex items-center justify-between px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-700/50">
                  <span className="text-sm text-slate-700 dark:text-slate-200">#{o.number} {o.title}</span>
                  <span className="text-xs text-slate-500 dark:text-slate-400">{o.deadline.label}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Atividade Recente */}
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-5 md:col-span-2">
          <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-100 mb-3 flex items-center gap-2">
            <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Atividade Recente
          </h3>
          {activities.length === 0 ? (
            <p className="text-sm text-slate-400 dark:text-slate-500">Nenhuma atividade recente</p>
          ) : (
            <div className="space-y-1">
              {activities.map(a => (
                <div key={a.id} className="flex items-center gap-2 px-2 py-1.5 text-sm">
                  <div className="w-1.5 h-1.5 bg-blue-500 rounded-full shrink-0" />
                  <span className="font-medium text-slate-700 dark:text-slate-200">{a.userName}</span>
                  <span className="text-slate-500 dark:text-slate-400">{a.action}</span>
                  {a.entityTitle && <span className="text-slate-600 dark:text-slate-300">{a.entityTitle}</span>}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
