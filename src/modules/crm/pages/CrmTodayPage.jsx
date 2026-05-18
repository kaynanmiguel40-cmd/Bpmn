/**
 * CrmTodayPage — visao pessoal do dia do vendedor.
 *
 * Consolida em uma tela:
 *   - Atividades pendentes do vendedor logado (hoje + atrasadas)
 *   - Deals do vendedor vencendo nos proximos 7 dias
 */

import { useMemo, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  CheckSquare, Clock, Phone, Mail, Video, Coffee, MapPin,
  AlertTriangle, Handshake, ChevronRight, MessageCircle,
} from 'lucide-react';
import { CrmAvatar, CrmBadge } from '../components/ui';
import { useCrmActivities, useCrmDeals, useCompleteCrmActivity } from '../hooks/useCrmQueries';
import { useProfile } from '../../../hooks/useProfile';
import { supabase } from '../../../lib/supabase';

const formatCurrency = (val) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(val || 0);

const activityTypeIcons = {
  call: Phone, email: Mail, meeting: Video,
  task: CheckSquare, follow_up: Coffee, visit: MapPin,
};
const activityTypeColors = {
  call: 'bg-sky-100 dark:bg-sky-900/30 text-sky-600 dark:text-sky-400',
  email: 'bg-violet-100 dark:bg-violet-900/30 text-violet-600 dark:text-violet-400',
  meeting: 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400',
  task: 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400',
  follow_up: 'bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400',
  visit: 'bg-rose-100 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400',
};

function isSameDay(a, b) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

function dayDelta(date) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const target = new Date(date);
  target.setHours(0, 0, 0, 0);
  return Math.round((target - today) / 86400000);
}

function getWhatsappLink(phone) {
  if (!phone) return null;
  const digits = phone.replace(/\D/g, '');
  if (digits.length < 10) return null;
  return `https://wa.me/${digits.startsWith('55') ? digits : `55${digits}`}`;
}

// ==================== PAGE ====================

export function CrmTodayPage() {
  const navigate = useNavigate();
  const { profile } = useProfile();
  const [authUid, setAuthUid] = useState(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setAuthUid(data?.session?.user?.id || null);
    });
  }, []);

  // Atividades pendentes (todas) — filtra cliente-side por created_by
  const { data: activitiesData } = useCrmActivities({ completed: false, perPage: 100 });
  // Deals abertos
  const { data: dealsData } = useCrmDeals({ status: 'open', perPage: 200 });

  const completeMutation = useCompleteCrmActivity();

  const todayStr = new Date().toLocaleDateString('pt-BR', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  });

  // Filtra atividades MINHAS (createdBy === authUid) que estao atrasadas ou sao hoje
  const myActivities = useMemo(() => {
    if (!authUid) return { overdue: [], today: [], upcoming: [] };
    const all = (activitiesData?.data || []).filter(a => a.createdBy === authUid);
    const now = new Date();
    const overdue = [], today = [], upcoming = [];
    for (const a of all) {
      if (!a.startDate) continue;
      const start = new Date(a.startDate);
      const delta = dayDelta(a.startDate);
      if (start < now && !isSameDay(start, now)) overdue.push(a);
      else if (isSameDay(start, now)) today.push(a);
      else if (delta > 0 && delta <= 7) upcoming.push(a);
    }
    // Ordem: mais antiga primeiro nas atrasadas, hora natural no resto
    overdue.sort((a, b) => new Date(a.startDate) - new Date(b.startDate));
    today.sort((a, b) => new Date(a.startDate) - new Date(b.startDate));
    upcoming.sort((a, b) => new Date(a.startDate) - new Date(b.startDate));
    return { overdue, today, upcoming };
  }, [activitiesData, authUid]);

  // Meus deals vencendo nos proximos 7 dias
  const myDealsClosing = useMemo(() => {
    if (!authUid) return [];
    const all = (dealsData?.data || []).filter(d => d.createdBy === authUid);
    return all
      .filter(d => d.expectedCloseDate)
      .filter(d => {
        const delta = dayDelta(d.expectedCloseDate);
        return delta >= 0 && delta <= 7;
      })
      .sort((a, b) => new Date(a.expectedCloseDate) - new Date(b.expectedCloseDate));
  }, [dealsData, authUid]);

  const totalPendentes = myActivities.overdue.length + myActivities.today.length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">
          Bom dia, {profile.name?.split(' ')[0] || 'Voce'} ☀️
        </h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5 capitalize">{todayStr}</p>
      </div>

      {/* KPIs do dia */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <SummaryCard
          label="Atividades pendentes"
          value={totalPendentes}
          subtitle={myActivities.overdue.length > 0 ? `${myActivities.overdue.length} atrasada${myActivities.overdue.length === 1 ? '' : 's'}` : 'sem atrasadas'}
          icon={Clock}
          color={myActivities.overdue.length > 0 ? 'rose' : 'amber'}
        />
        <SummaryCard
          label="Deals vencendo (7d)"
          value={myDealsClosing.length}
          subtitle={myDealsClosing.length > 0 ? `${formatCurrency(myDealsClosing.reduce((s, d) => s + (d.value || 0), 0))} em pipeline` : 'nada agora'}
          icon={Handshake}
          color="emerald"
        />
      </div>

      {/* Coluna unica de listas (mobile-first) */}
      <div className="space-y-6">

        {/* Atividades atrasadas */}
        {myActivities.overdue.length > 0 && (
          <Section
            title="Atrasadas"
            icon={AlertTriangle}
            iconColor="text-rose-500"
            count={myActivities.overdue.length}
          >
            <div className="space-y-1.5">
              {myActivities.overdue.map(a => (
                <ActivityRow
                  key={a.id}
                  activity={a}
                  daysAgo={Math.abs(dayDelta(a.startDate))}
                  onComplete={() => completeMutation.mutate(a.id)}
                  onClick={() => a.dealId && navigate(`/crm/deals/${a.dealId}`)}
                />
              ))}
            </div>
          </Section>
        )}

        {/* Atividades de hoje */}
        <Section
          title="Hoje"
          icon={CheckSquare}
          iconColor="text-blue-500"
          count={myActivities.today.length}
          emptyMessage="Sem atividades pra hoje"
        >
          {myActivities.today.length > 0 && (
            <div className="space-y-1.5">
              {myActivities.today.map(a => (
                <ActivityRow
                  key={a.id}
                  activity={a}
                  onComplete={() => completeMutation.mutate(a.id)}
                  onClick={() => a.dealId && navigate(`/crm/deals/${a.dealId}`)}
                />
              ))}
            </div>
          )}
        </Section>

        {/* Deals vencendo */}
        <Section
          title="Meus deals vencendo (7d)"
          icon={Handshake}
          iconColor="text-emerald-500"
          count={myDealsClosing.length}
          emptyMessage="Nenhum deal seu vence essa semana"
        >
          {myDealsClosing.length > 0 && (
            <div className="space-y-1.5">
              {myDealsClosing.map(d => {
                const delta = dayDelta(d.expectedCloseDate);
                const phone = d.contactPhone || d.contact?.phone || '';
                const wpp = getWhatsappLink(phone);
                return (
                  <div
                    key={d.id}
                    onClick={() => navigate(`/crm/deals/${d.id}`)}
                    className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer group"
                  >
                    <CrmAvatar name={d.contact?.name || d.title} size="sm" color={d.contact?.avatarColor} />
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-slate-800 dark:text-slate-200 truncate">{d.title}</div>
                      <div className="text-xs text-slate-400 truncate">
                        {d.company?.name || d.contact?.name || ''} · {d.stage?.name || '—'}
                      </div>
                    </div>
                    <div className="text-right shrink-0 flex items-center gap-2">
                      <div>
                        <div className="text-sm font-semibold text-emerald-600 dark:text-emerald-400">{formatCurrency(d.value)}</div>
                        <CrmBadge variant={delta < 3 ? 'danger' : 'warning'} size="sm">
                          {delta === 0 ? 'Hoje' : delta === 1 ? 'Amanha' : `${delta}d`}
                        </CrmBadge>
                      </div>
                      {wpp && (
                        <a
                          href={wpp}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          title="WhatsApp"
                          className="p-1.5 rounded text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/20"
                        >
                          <MessageCircle size={14} />
                        </a>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </Section>

      </div>
    </div>
  );
}

// ==================== SUBCOMPONENTS ====================

function SummaryCard({ label, value, subtitle, icon: Icon, color }) {
  const colorClasses = {
    rose: 'bg-rose-100 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400',
    amber: 'bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400',
    emerald: 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400',
    violet: 'bg-violet-100 dark:bg-violet-900/30 text-violet-600 dark:text-violet-400',
  };
  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700/50 p-4">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-medium text-slate-500 dark:text-slate-400">{label}</span>
        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${colorClasses[color]}`}>
          <Icon size={16} />
        </div>
      </div>
      <div className="text-2xl font-bold text-slate-800 dark:text-slate-100">{value}</div>
      <div className="text-[11px] text-slate-400 mt-0.5">{subtitle}</div>
    </div>
  );
}

function Section({ title, icon: Icon, iconColor, count, children, emptyMessage }) {
  const isEmpty = !children || count === 0;
  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700/50 p-4">
      <div className="flex items-center gap-2 mb-3">
        <Icon size={16} className={iconColor} />
        <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300">{title}</h3>
        {count > 0 && (
          <span className="text-xs text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full">
            {count}
          </span>
        )}
      </div>
      {isEmpty ? (
        <div className="py-6 text-center text-sm text-slate-400">{emptyMessage}</div>
      ) : (
        children
      )}
    </div>
  );
}

function ActivityRow({ activity, onComplete, onClick, daysAgo }) {
  const Icon = activityTypeIcons[activity.type] || CheckSquare;
  const colorClass = activityTypeColors[activity.type] || activityTypeColors.task;
  const time = activity.startDate ? new Date(activity.startDate).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }) : '';
  return (
    <div
      onClick={onClick}
      className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer group"
    >
      <button
        onClick={(e) => { e.stopPropagation(); onComplete(); }}
        title="Marcar como concluida"
        className="w-5 h-5 rounded border-2 border-slate-300 dark:border-slate-600 hover:border-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition-colors shrink-0"
      />
      <div className={`w-7 h-7 rounded-lg ${colorClass} flex items-center justify-center shrink-0`}>
        <Icon size={13} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-sm font-medium text-slate-800 dark:text-slate-200 truncate">{activity.title}</div>
        <div className="text-xs text-slate-400 truncate">
          {activity.contact?.name || activity.deal?.title || 'Sem vinculo'}
        </div>
      </div>
      <div className="text-right shrink-0">
        {daysAgo != null ? (
          <CrmBadge variant="danger" size="sm">
            {daysAgo === 1 ? 'ontem' : `${daysAgo}d atras`}
          </CrmBadge>
        ) : (
          <span className="text-xs text-slate-400">{time}</span>
        )}
      </div>
    </div>
  );
}

export default CrmTodayPage;
