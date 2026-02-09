/**
 * DashboardPage - Visao geral do Company OS
 */

import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
// Auth desabilitado temporariamente
// import { useAuth } from '../../contexts/AuthContext';
// import { usePermissions } from '../../contexts/PermissionContext';
// Auth desabilitado - ProtectCost removido
// import { ProtectCost } from '../../components/auth/Protect';

// Formatadores
const formatCurrency = (value) => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(value || 0);
};

const formatTime = (minutes) => {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hours}h ${mins}m`;
};

// Card de estatistica
function StatCard({ title, value, subtitle, icon: Icon, color = 'blue', href }) {
  const colorClasses = {
    blue: 'bg-blue-50 text-blue-600',
    green: 'bg-green-50 text-green-600',
    orange: 'bg-orange-50 text-orange-600',
    purple: 'bg-purple-50 text-purple-600',
    red: 'bg-red-50 text-red-600'
  };

  const content = (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-slate-500 font-medium">{title}</p>
          <p className="text-2xl font-bold text-slate-800 mt-1">{value}</p>
          {subtitle && (
            <p className="text-sm text-slate-500 mt-1">{subtitle}</p>
          )}
        </div>
        {Icon && (
          <div className={`p-3 rounded-lg ${colorClasses[color]}`}>
            <Icon />
          </div>
        )}
      </div>
    </div>
  );

  if (href) {
    return <Link to={href}>{content}</Link>;
  }

  return content;
}

// Icones
const TaskIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
  </svg>
);

const ClockIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const MoneyIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const CalendarIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
  </svg>
);

export function DashboardPage() {
  // Auth desabilitado temporariamente
  // const { profile } = useAuth();
  // const { canViewCosts } = usePermissions();
  const profile = { id: null, full_name: 'Admin' };
  const canViewCosts = () => true;

  const [stats, setStats] = useState({
    tasksInProgress: 0,
    tasksDone: 0,
    hoursWorked: 0,
    totalCost: 0,
    eventsToday: 0,
    meetingCostToday: 0
  });

  const [recentTasks, setRecentTasks] = useState([]);
  const [todayEvents, setTodayEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  // Carregar dados
  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        // Buscar tasks do usuario
        const { data: tasks } = await supabase
          .from('tasks')
          .select('*')
          .or(`assigned_to.eq.${profile?.id},created_by.eq.${profile?.id}`)
          .order('updated_at', { ascending: false })
          .limit(5);

        // Buscar eventos de hoje
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        const { data: events } = await supabase
          .from('events')
          .select(`
            *,
            event_participants (
              user_id,
              cost_contribution
            )
          `)
          .gte('start_datetime', today.toISOString())
          .lt('start_datetime', tomorrow.toISOString())
          .order('start_datetime', { ascending: true });

        // Calcular estatisticas
        const tasksInProgress = tasks?.filter(t => t.status === 'doing').length || 0;
        const tasksDone = tasks?.filter(t => t.status === 'done').length || 0;
        const hoursWorked = tasks?.reduce((acc, t) => acc + (t.actual_time || 0), 0) || 0;
        const totalCost = tasks?.reduce((acc, t) => acc + parseFloat(t.actual_cost || 0), 0) || 0;
        const meetingCostToday = events?.reduce((acc, e) => acc + parseFloat(e.total_cost || 0), 0) || 0;

        setStats({
          tasksInProgress,
          tasksDone,
          hoursWorked,
          totalCost,
          eventsToday: events?.length || 0,
          meetingCostToday
        });

        setRecentTasks(tasks || []);
        setTodayEvents(events || []);
      } catch (err) {
        console.error('Erro ao carregar dashboard:', err);
      } finally {
        setLoading(false);
      }
    };

    if (profile?.id) {
      loadDashboardData();
    }
  }, [profile?.id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome */}
      <div>
        <h2 className="text-2xl font-bold text-slate-800">
          Ola, {profile?.full_name?.split(' ')[0] || 'Usuario'}!
        </h2>
        <p className="text-slate-500">
          Aqui esta um resumo do seu dia
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Tarefas em Andamento"
          value={stats.tasksInProgress}
          subtitle={`${stats.tasksDone} concluidas`}
          icon={TaskIcon}
          color="blue"
          href="/routine"
        />

        <StatCard
          title="Tempo Trabalhado"
          value={formatTime(stats.hoursWorked)}
          subtitle="Esta semana"
          icon={ClockIcon}
          color="green"
        />

        <StatCard
          title="Custo Total"
          value={formatCurrency(stats.totalCost)}
          subtitle="Esta semana"
          icon={MoneyIcon}
          color="purple"
        />

        <StatCard
          title="Reunioes Hoje"
          value={stats.eventsToday}
          subtitle={canViewCosts() ? formatCurrency(stats.meetingCostToday) : ''}
          icon={CalendarIcon}
          color="orange"
          href="/agenda"
        />
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Tasks */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200">
          <div className="p-4 border-b border-slate-200 flex items-center justify-between">
            <h3 className="font-semibold text-slate-800">Tarefas Recentes</h3>
            <Link to="/routine" className="text-sm text-blue-600 hover:text-blue-700">
              Ver todas
            </Link>
          </div>
          <div className="divide-y divide-slate-100">
            {recentTasks.length === 0 ? (
              <div className="p-8 text-center text-slate-500">
                Nenhuma tarefa encontrada
              </div>
            ) : (
              recentTasks.map(task => (
                <div key={task.id} className="p-4 hover:bg-slate-50 transition-colors">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <h4 className="font-medium text-slate-800">{task.title}</h4>
                      <p className="text-sm text-slate-500 truncate">{task.description}</p>
                    </div>
                    <span className={`
                      px-2 py-1 text-xs font-medium rounded
                      ${task.status === 'done' ? 'bg-green-100 text-green-700' :
                        task.status === 'doing' ? 'bg-blue-100 text-blue-700' :
                        'bg-slate-100 text-slate-600'}
                    `}>
                      {task.status === 'done' ? 'Concluido' :
                       task.status === 'doing' ? 'Em andamento' :
                       task.status === 'blocked' ? 'Bloqueado' : 'A fazer'}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Today's Events */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200">
          <div className="p-4 border-b border-slate-200 flex items-center justify-between">
            <h3 className="font-semibold text-slate-800">Agenda de Hoje</h3>
            <Link to="/agenda" className="text-sm text-blue-600 hover:text-blue-700">
              Ver agenda
            </Link>
          </div>
          <div className="divide-y divide-slate-100">
            {todayEvents.length === 0 ? (
              <div className="p-8 text-center text-slate-500">
                Nenhum evento hoje
              </div>
            ) : (
              todayEvents.map(event => (
                <div key={event.id} className="p-4 hover:bg-slate-50 transition-colors">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-slate-800">
                          {new Date(event.start_datetime).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                        </span>
                        <span className="text-slate-300">-</span>
                        <span className="text-sm text-slate-500">
                          {new Date(event.end_datetime).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <h4 className="font-medium text-slate-800">{event.title}</h4>
                      {event.event_participants && (
                        <p className="text-sm text-slate-500">
                          {event.event_participants.length} participante(s)
                        </p>
                      )}
                    </div>
                    <span className="text-sm font-medium text-purple-600">
                      {formatCurrency(event.total_cost)}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl p-6 text-white">
        <h3 className="text-lg font-semibold mb-4">Acoes Rapidas</h3>
        <div className="flex flex-wrap gap-3">
          <Link
            to="/routine"
            className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors text-sm font-medium"
          >
            + Nova Tarefa
          </Link>
          <Link
            to="/agenda"
            className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors text-sm font-medium"
          >
            + Novo Evento
          </Link>
          <Link
            to="/sales"
            className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors text-sm font-medium"
          >
            Ver Fluxos BPMN
          </Link>
        </div>
      </div>
    </div>
  );
}

export default DashboardPage;
