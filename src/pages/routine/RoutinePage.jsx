/**
 * RoutinePage - Kanban de Tarefas (O.S.)
 */

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../../lib/supabase';
// Auth desabilitado temporariamente
// import { useAuth } from '../../contexts/AuthContext';
import { OSCard } from '../../components/kanban/OSCard';

// Status do Kanban
const COLUMNS = [
  { id: 'todo', title: 'A Fazer', color: 'bg-slate-500' },
  { id: 'doing', title: 'Em Andamento', color: 'bg-blue-500' },
  { id: 'done', title: 'Concluido', color: 'bg-green-500' }
];

// Icone de adicionar
const PlusIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
  </svg>
);

export function RoutinePage() {
  // Auth desabilitado temporariamente
  // const { profile } = useAuth();
  const profile = { id: 'temp-user' };
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showNewTaskModal, setShowNewTaskModal] = useState(false);
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    priority: 'medium',
    estimated_time: 60
  });

  // Carregar tarefas
  const loadTasks = useCallback(async () => {
    if (!profile?.id) return;

    try {
      const { data, error } = await supabase
        .from('tasks')
        .select(`
          *,
          assigned_profile:profiles!tasks_assigned_to_fkey (
            id,
            full_name,
            avatar_url
          )
        `)
        .or(`assigned_to.eq.${profile.id},created_by.eq.${profile.id}`)
        .order('order_index', { ascending: true });

      if (error) throw error;
      setTasks(data || []);
    } catch (err) {
      console.error('Erro ao carregar tarefas:', err);
    } finally {
      setLoading(false);
    }
  }, [profile?.id]);

  useEffect(() => {
    loadTasks();
  }, [loadTasks]);

  // Criar nova tarefa
  const handleCreateTask = async (e) => {
    e.preventDefault();

    try {
      const { error } = await supabase.from('tasks').insert({
        title: newTask.title,
        description: newTask.description,
        priority: newTask.priority,
        estimated_time: newTask.estimated_time,
        status: 'todo',
        assigned_to: profile.id,
        created_by: profile.id
      });

      if (error) throw error;

      setShowNewTaskModal(false);
      setNewTask({ title: '', description: '', priority: 'medium', estimated_time: 60 });
      loadTasks();
    } catch (err) {
      console.error('Erro ao criar tarefa:', err);
      alert('Erro ao criar tarefa: ' + err.message);
    }
  };

  // Mover tarefa para outra coluna
  const handleMoveTask = async (taskId, newStatus) => {
    try {
      const { error } = await supabase
        .from('tasks')
        .update({ status: newStatus })
        .eq('id', taskId);

      if (error) throw error;
      loadTasks();
    } catch (err) {
      console.error('Erro ao mover tarefa:', err);
    }
  };

  // Filtrar tarefas por status
  const getTasksByStatus = (status) => {
    return tasks.filter(task => task.status === status);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Minha Rotina</h2>
          <p className="text-slate-500">Gerencie suas tarefas e controle seu tempo</p>
        </div>
        <button
          onClick={() => setShowNewTaskModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <PlusIcon />
          Nova Tarefa
        </button>
      </div>

      {/* Kanban Board */}
      <div className="flex-1 flex gap-4 overflow-x-auto pb-4">
        {COLUMNS.map(column => (
          <div
            key={column.id}
            className="flex-1 min-w-[300px] max-w-[400px] bg-slate-100 rounded-xl p-4"
          >
            {/* Column Header */}
            <div className="flex items-center gap-2 mb-4">
              <div className={`w-3 h-3 rounded-full ${column.color}`}></div>
              <h3 className="font-semibold text-slate-700">{column.title}</h3>
              <span className="ml-auto px-2 py-0.5 bg-white rounded-full text-xs font-medium text-slate-600">
                {getTasksByStatus(column.id).length}
              </span>
            </div>

            {/* Tasks */}
            <div className="space-y-3">
              {getTasksByStatus(column.id).map(task => (
                <OSCard
                  key={task.id}
                  task={task}
                  onUpdate={loadTasks}
                />
              ))}

              {getTasksByStatus(column.id).length === 0 && (
                <div className="text-center py-8 text-slate-400 text-sm">
                  Nenhuma tarefa
                </div>
              )}

              {/* Quick Move Buttons */}
              {column.id !== 'done' && getTasksByStatus(column.id).length > 0 && (
                <div className="pt-2 border-t border-slate-200 mt-4">
                  <p className="text-xs text-slate-400 mb-2">Mover para:</p>
                  <div className="flex gap-2">
                    {COLUMNS.filter(c => c.id !== column.id).map(c => (
                      <button
                        key={c.id}
                        onClick={() => {
                          const firstTask = getTasksByStatus(column.id)[0];
                          if (firstTask) handleMoveTask(firstTask.id, c.id);
                        }}
                        className="flex-1 py-1 text-xs text-slate-600 bg-white rounded hover:bg-slate-50 transition-colors"
                      >
                        {c.title}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* New Task Modal */}
      {showNewTaskModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md mx-4">
            <div className="p-4 border-b border-slate-200">
              <h3 className="text-lg font-semibold text-slate-800">Nova Tarefa</h3>
            </div>

            <form onSubmit={handleCreateTask} className="p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Titulo
                </label>
                <input
                  type="text"
                  value={newTask.title}
                  onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                  required
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Ex: Revisar relatorio mensal"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Descricao
                </label>
                <textarea
                  value={newTask.description}
                  onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={3}
                  placeholder="Detalhes da tarefa..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Prioridade
                  </label>
                  <select
                    value={newTask.priority}
                    onChange={(e) => setNewTask({ ...newTask, priority: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="low">Baixa</option>
                    <option value="medium">Media</option>
                    <option value="high">Alta</option>
                    <option value="urgent">Urgente</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Tempo Estimado (min)
                  </label>
                  <input
                    type="number"
                    value={newTask.estimated_time}
                    onChange={(e) => setNewTask({ ...newTask, estimated_time: parseInt(e.target.value) || 0 })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    min="1"
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowNewTaskModal(false)}
                  className="flex-1 py-2 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Criar Tarefa
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default RoutinePage;
