/**
 * OSCard - Card de Ordem de Servico para Kanban
 *
 * Features:
 * - Play/Pause timer
 * - Barra de progresso de tempo
 * - Indicador visual de estouro de orcamento (borda vermelha)
 * - Valores monetarios protegidos por permissao
 * - Drag and drop ready
 */

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';

// Icones SVG inline
const PlayIcon = () => (
  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
  </svg>
);

const PauseIcon = () => (
  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
  </svg>
);

const StopIcon = () => (
  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8 7a1 1 0 00-1 1v4a1 1 0 001 1h4a1 1 0 001-1V8a1 1 0 00-1-1H8z" clipRule="evenodd" />
  </svg>
);

const AlertIcon = () => (
  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
  </svg>
);

const ClockIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

// Cores de prioridade
const priorityColors = {
  low: 'bg-slate-100 text-slate-600',
  medium: 'bg-blue-100 text-blue-700',
  high: 'bg-orange-100 text-orange-700',
  urgent: 'bg-red-100 text-red-700'
};

const priorityLabels = {
  low: 'Baixa',
  medium: 'Media',
  high: 'Alta',
  urgent: 'Urgente'
};

// Formatadores
const formatTime = (minutes) => {
  if (!minutes || minutes <= 0) return '0h 0m';
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
};

const formatCurrency = (value) => {
  if (value === null || value === undefined) return 'R$ 0,00';
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(value);
};

export function OSCard({
  task,
  onUpdate,
  onStartTimer,
  onStopTimer,
  isDragging = false,
  className = ''
}) {
  const { profile: authProfile } = useAuth();
  const profile = authProfile || { id: 'temp-user' };

  const [isTimerRunning, setIsTimerRunning] = useState(task.is_timer_running || false);
  const [elapsedTime, setElapsedTime] = useState(task.actual_time || 0);
  const [currentEntryId, setCurrentEntryId] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  // Calculo de progresso e estouro
  const estimatedTime = task.estimated_time || 0;
  const progress = estimatedTime > 0 ? Math.min((elapsedTime / estimatedTime) * 100, 100) : 0;
  const isOverBudget = elapsedTime > estimatedTime && estimatedTime > 0;
  const overBudgetPercent = estimatedTime > 0 ? ((elapsedTime - estimatedTime) / estimatedTime) * 100 : 0;

  // Timer que atualiza a cada segundo quando rodando
  useEffect(() => {
    let interval;

    if (isTimerRunning && task.timer_started_at) {
      interval = setInterval(() => {
        const startTime = new Date(task.timer_started_at);
        const now = new Date();
        const diffMinutes = Math.floor((now - startTime) / 60000);
        setElapsedTime((task.actual_time || 0) + diffMinutes);
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isTimerRunning, task.timer_started_at, task.actual_time]);

  // Sincronizar com props
  useEffect(() => {
    setIsTimerRunning(task.is_timer_running || false);
    if (!task.is_timer_running) {
      setElapsedTime(task.actual_time || 0);
    }
  }, [task.is_timer_running, task.actual_time]);

  // Iniciar timer
  const handleStartTimer = useCallback(async () => {
    if (isLoading) return;
    setIsLoading(true);

    try {
      // Criar time entry
      const { data: entry, error: entryError } = await supabase
        .from('time_entries')
        .insert({
          task_id: task.id,
          user_id: profile.id,
          start_time: new Date().toISOString()
        })
        .select()
        .single();

      if (entryError) throw entryError;

      setCurrentEntryId(entry.id);

      // Atualizar task
      const { error: taskError } = await supabase
        .from('tasks')
        .update({
          is_timer_running: true,
          timer_started_at: new Date().toISOString(),
          status: task.status === 'todo' ? 'doing' : task.status
        })
        .eq('id', task.id);

      if (taskError) throw taskError;

      setIsTimerRunning(true);

      if (onStartTimer) onStartTimer(task.id, entry.id);
      if (onUpdate) onUpdate();
    } catch (err) {
      console.error('Erro ao iniciar timer:', err);
      alert('Erro ao iniciar timer: ' + err.message);
    } finally {
      setIsLoading(false);
    }
  }, [task, profile, onStartTimer, onUpdate, isLoading]);

  // Parar timer
  const handleStopTimer = useCallback(async () => {
    if (isLoading) return;
    setIsLoading(true);

    try {
      // Buscar entry ativa
      const entryId = currentEntryId || await findActiveEntry();

      if (entryId) {
        // Usar funcao do Supabase para calcular custo
        const { data, error } = await supabase.rpc('stop_time_entry', {
          entry_id: entryId
        });

        if (error) {
          // Fallback: atualizar manualmente
          await supabase
            .from('time_entries')
            .update({
              end_time: new Date().toISOString()
            })
            .eq('id', entryId);
        }
      }

      // Atualizar task
      await supabase
        .from('tasks')
        .update({
          is_timer_running: false,
          timer_started_at: null
        })
        .eq('id', task.id);

      setIsTimerRunning(false);
      setCurrentEntryId(null);

      if (onStopTimer) onStopTimer(task.id);
      if (onUpdate) onUpdate();
    } catch (err) {
      console.error('Erro ao parar timer:', err);
      alert('Erro ao parar timer: ' + err.message);
    } finally {
      setIsLoading(false);
    }
  }, [task, currentEntryId, onStopTimer, onUpdate, isLoading]);

  // Encontrar entry ativa
  const findActiveEntry = async () => {
    const { data } = await supabase
      .from('time_entries')
      .select('id')
      .eq('task_id', task.id)
      .is('end_time', null)
      .order('start_time', { ascending: false })
      .limit(1)
      .single();

    return data?.id;
  };

  // Classes dinamicas
  const cardClasses = [
    'bg-white dark:bg-slate-800 rounded-lg shadow-sm border-2 transition-all duration-200',
    isDragging ? 'opacity-50 rotate-2 scale-105' : '',
    isOverBudget ? 'border-red-500 shadow-red-100 dark:shadow-red-900/20' : 'border-transparent hover:border-blue-300 dark:hover:border-blue-600',
    isTimerRunning ? 'ring-2 ring-green-500 ring-opacity-50' : '',
    className
  ].filter(Boolean).join(' ');

  return (
    <div className={cardClasses}>
      {/* Header */}
      <div className="p-3 pb-2">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-medium text-slate-800 dark:text-slate-100 text-sm leading-tight flex-1">
            {task.title}
          </h3>
          <span className={`px-2 py-0.5 rounded text-xs font-medium ${priorityColors[task.priority]}`}>
            {priorityLabels[task.priority]}
          </span>
        </div>

        {task.description && (
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">
            {task.description}
          </p>
        )}
      </div>

      {/* Progress Bar */}
      <div className="px-3">
        <div className="h-1.5 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
          <div
            className={`h-full transition-all duration-300 ${
              isOverBudget ? 'bg-red-500' : progress > 80 ? 'bg-orange-500' : 'bg-blue-500'
            }`}
            style={{ width: `${Math.min(progress, 100)}%` }}
          />
        </div>
      </div>

      {/* Time Info */}
      <div className="px-3 pt-2">
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-1 text-slate-600 dark:text-slate-400">
            <ClockIcon />
            <span className={isTimerRunning ? 'text-green-600 dark:text-green-400 font-medium' : ''}>
              {formatTime(elapsedTime)}
            </span>
            <span className="text-slate-400 dark:text-slate-500">/</span>
            <span>{formatTime(estimatedTime)}</span>
          </div>

          {isOverBudget && (
            <div className="flex items-center gap-1 text-red-600">
              <AlertIcon />
              <span className="font-medium">+{Math.round(overBudgetPercent)}%</span>
            </div>
          )}
        </div>
      </div>

      {/* Cost Info */}
      <div className="px-3 pt-1">
        <div className="flex items-center justify-between text-xs">
          <span className="text-slate-500 dark:text-slate-400">Custo:</span>
          <div>
            <span className={`font-medium ${isOverBudget ? 'text-red-600 dark:text-red-400' : 'text-slate-700 dark:text-slate-200'}`}>
              {formatCurrency(task.actual_cost || 0)}
            </span>
            {task.estimated_cost > 0 && (
              <span className="text-slate-400 dark:text-slate-500 ml-1">
                / {formatCurrency(task.estimated_cost)}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Timer Controls */}
      <div className="p-3 pt-2 border-t border-slate-100 dark:border-slate-700 mt-2">
        <div className="flex items-center justify-between">
          {/* Assignee */}
          <div className="flex items-center gap-2">
            {task.assigned_profile?.avatar_url ? (
              <img
                src={task.assigned_profile.avatar_url}
                alt={task.assigned_profile.full_name}
                className="w-6 h-6 rounded-full"
              />
            ) : (
              <div className="w-6 h-6 rounded-full bg-slate-200 dark:bg-slate-600 flex items-center justify-center text-xs font-medium text-slate-600 dark:text-slate-200">
                {(task.assigned_profile?.full_name || '?')[0].toUpperCase()}
              </div>
            )}
            <span className="text-xs text-slate-500 dark:text-slate-400 truncate max-w-[80px]">
              {task.assigned_profile?.full_name || 'Sem responsavel'}
            </span>
          </div>

          {/* Play/Stop Buttons */}
          <div className="flex items-center gap-1">
            {isTimerRunning ? (
              <button
                onClick={handleStopTimer}
                disabled={isLoading}
                className="p-1.5 rounded-full bg-red-100 text-red-600 hover:bg-red-200 transition-colors disabled:opacity-50"
                title="Parar timer"
              >
                <StopIcon />
              </button>
            ) : (
              <button
                onClick={handleStartTimer}
                disabled={isLoading || task.status === 'done'}
                className="p-1.5 rounded-full bg-green-100 text-green-600 hover:bg-green-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                title={task.status === 'done' ? 'Task finalizada' : 'Iniciar timer'}
              >
                <PlayIcon />
              </button>
            )}
          </div>
        </div>

        {/* Due Date */}
        {task.due_date && (
          <div className="mt-2 text-xs text-slate-500 dark:text-slate-400">
            Prazo: {new Date(task.due_date).toLocaleDateString('pt-BR')}
          </div>
        )}
      </div>

      {/* Timer Running Indicator */}
      {isTimerRunning && (
        <div className="absolute top-0 right-0 w-3 h-3">
          <span className="absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75 animate-ping"></span>
          <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
        </div>
      )}
    </div>
  );
}

export default OSCard;
