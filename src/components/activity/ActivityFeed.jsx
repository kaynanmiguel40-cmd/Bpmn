import { useState, useEffect } from 'react';
import { getRecentActivities, ACTION_LABELS, ENTITY_LABELS } from '../../lib/activityLogService';

const ACTION_ICONS = {
  created: { path: 'M12 4v16m8-8H4', color: 'text-emerald-500', bg: 'bg-emerald-50 dark:bg-emerald-900/20' },
  updated: { path: 'M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z', color: 'text-blue-500', bg: 'bg-blue-50 dark:bg-blue-900/20' },
  deleted: { path: 'M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16', color: 'text-red-500', bg: 'bg-red-50 dark:bg-red-900/20' },
  status_changed: { path: 'M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15', color: 'text-amber-500', bg: 'bg-amber-50 dark:bg-amber-900/20' },
  assigned: { path: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z', color: 'text-blue-500', bg: 'bg-blue-50 dark:bg-blue-900/20' },
  completed: { path: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z', color: 'text-emerald-500', bg: 'bg-emerald-50 dark:bg-emerald-900/20' },
  commented: { path: 'M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z', color: 'text-purple-500', bg: 'bg-purple-50 dark:bg-purple-900/20' },
  default: { path: 'M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z', color: 'text-slate-500', bg: 'bg-slate-50 dark:bg-slate-700' },
};

function formatTimeAgo(dateStr) {
  if (!dateStr) return '';
  const now = new Date();
  const date = new Date(dateStr);
  const diffMs = now - date;
  const diffMin = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMin < 1) return 'Agora';
  if (diffMin < 60) return `${diffMin}m`;
  if (diffHours < 24) return `${diffHours}h`;
  if (diffDays < 7) return `${diffDays}d`;
  return date.toLocaleDateString('pt-BR');
}

export function ActivityFeed({ limit = 15, entityType, entityId }) {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      setLoading(true);
      const data = await getRecentActivities(limit);
      const filtered = entityType
        ? data.filter(a => a.entityType === entityType && (!entityId || a.entityId === entityId))
        : data;
      setActivities(filtered);
      setLoading(false);
    })();
  }, [limit, entityType, entityId]);

  if (loading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map(i => (
          <div key={i} className="flex gap-3 animate-pulse">
            <div className="w-8 h-8 bg-slate-200 dark:bg-slate-700 rounded-full" />
            <div className="flex-1 space-y-2">
              <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-3/4" />
              <div className="h-2.5 bg-slate-100 dark:bg-slate-800 rounded w-1/2" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (activities.length === 0) {
    return (
      <div className="text-center py-6">
        <svg className="w-8 h-8 text-slate-300 dark:text-slate-600 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <p className="text-sm text-slate-400 dark:text-slate-500">Nenhuma atividade recente</p>
      </div>
    );
  }

  return (
    <div className="space-y-1">
      {activities.map(activity => {
        const icon = ACTION_ICONS[activity.action] || ACTION_ICONS.default;
        const actionLabel = ACTION_LABELS[activity.action] || activity.action;
        const entityLabel = ENTITY_LABELS[activity.entityType] || activity.entityType;

        return (
          <div key={activity.id} className="flex items-start gap-3 px-2 py-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
            <div className={`w-7 h-7 rounded-full ${icon.bg} flex items-center justify-center shrink-0`}>
              <svg className={`w-3.5 h-3.5 ${icon.color}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={icon.path} />
              </svg>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm text-slate-700 dark:text-slate-200 leading-tight">
                <span className="font-medium">{activity.userName}</span>{' '}
                <span className="text-slate-500 dark:text-slate-400">{actionLabel}</span>{' '}
                <span className="font-medium">{entityLabel}</span>{' '}
                {activity.entityTitle && (
                  <span className="text-slate-600 dark:text-slate-300">{activity.entityTitle}</span>
                )}
              </p>
              <span className="text-[11px] text-slate-400 dark:text-slate-500">{formatTimeAgo(activity.createdAt)}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default ActivityFeed;
