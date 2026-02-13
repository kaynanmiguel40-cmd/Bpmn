import { useState, useEffect } from 'react';
import { getActivitiesForEntity, ACTION_LABELS, ENTITY_LABELS } from '../../lib/activityLogService';

const ACTION_COLORS = {
  created: 'bg-emerald-500',
  updated: 'bg-blue-500',
  deleted: 'bg-red-500',
  status_changed: 'bg-amber-500',
  assigned: 'bg-blue-500',
  completed: 'bg-emerald-500',
  commented: 'bg-purple-500',
  started: 'bg-blue-500',
  attachment_added: 'bg-cyan-500',
};

function formatDate(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  return d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' });
}

function formatTime(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  return d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
}

export function ActivityTimeline({ entityType, entityId, limit = 30 }) {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!entityType || !entityId) return;
    (async () => {
      setLoading(true);
      const data = await getActivitiesForEntity(entityType, entityId, limit);
      setActivities(data);
      setLoading(false);
    })();
  }, [entityType, entityId, limit]);

  if (loading) {
    return (
      <div className="space-y-4 pl-4">
        {[1, 2, 3].map(i => (
          <div key={i} className="flex gap-3 animate-pulse">
            <div className="w-3 h-3 bg-slate-200 dark:bg-slate-700 rounded-full mt-1" />
            <div className="flex-1 space-y-1.5">
              <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-3/4" />
              <div className="h-2.5 bg-slate-100 dark:bg-slate-800 rounded w-1/3" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (activities.length === 0) {
    return (
      <div className="text-center py-4">
        <p className="text-sm text-slate-400 dark:text-slate-500">Nenhuma atividade registrada</p>
      </div>
    );
  }

  // Agrupar por dia
  const grouped = {};
  activities.forEach(a => {
    const day = formatDate(a.createdAt);
    if (!grouped[day]) grouped[day] = [];
    grouped[day].push(a);
  });

  return (
    <div className="space-y-4">
      {Object.entries(grouped).map(([day, items]) => (
        <div key={day}>
          <div className="text-xs font-medium text-slate-400 dark:text-slate-500 mb-2 uppercase tracking-wider">{day}</div>
          <div className="relative pl-6">
            {/* Vertical line */}
            <div className="absolute left-[7px] top-2 bottom-2 w-px bg-slate-200 dark:bg-slate-700" />

            {items.map((activity, idx) => {
              const dotColor = ACTION_COLORS[activity.action] || 'bg-slate-400';
              const actionLabel = ACTION_LABELS[activity.action] || activity.action;

              return (
                <div key={activity.id} className="relative flex gap-3 pb-3 last:pb-0">
                  {/* Dot */}
                  <div className={`absolute -left-6 top-1.5 w-3.5 h-3.5 rounded-full ${dotColor} ring-2 ring-white dark:ring-slate-800`} />

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-slate-700 dark:text-slate-200">
                      <span className="font-medium">{activity.userName}</span>{' '}
                      <span className="text-slate-500 dark:text-slate-400">{actionLabel}</span>
                      {activity.entityTitle && (
                        <span className="text-slate-600 dark:text-slate-300"> {activity.entityTitle}</span>
                      )}
                    </p>
                    {/* Show changed values if available */}
                    {activity.newValues && activity.action === 'status_changed' && (
                      <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">
                        {activity.oldValues?.status || '?'} → {activity.newValues?.status || '?'}
                      </p>
                    )}
                    <span className="text-[11px] text-slate-400 dark:text-slate-500">{formatTime(activity.createdAt)}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}

export default ActivityTimeline;
