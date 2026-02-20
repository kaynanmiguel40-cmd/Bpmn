import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { useEapProjects, useEapTasks, useCreateEapTask, useUpdateEapTask, useDeleteEapTask, useTeamMembers, useOSOrders, queryKeys } from '../../hooks/queries';
import { useToast } from '../../contexts/ToastContext';
import GanttChart from './components/GanttChart';

export default function EapGanttPage() {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const { addToast } = useToast();
  const queryClient = useQueryClient();
  const redirectedRef = useRef(false);

  // Data — refetchOnMount garante dados atualizados ao navegar
  const { data: projects = [], isLoading: loadingProjects, isFetching: fetchingProjects } = useEapProjects();
  const { data: allTasks = [], isLoading: loadingTasks } = useEapTasks();
  const { data: teamMembers = [] } = useTeamMembers();
  const { data: osOrders = [] } = useOSOrders();

  // Mutations
  const createTaskMut = useCreateEapTask();
  const updateTaskMut = useUpdateEapTask();
  const deleteTaskMut = useDeleteEapTask();

  // Encontrar o projeto pelo ID da URL
  const activeProject = useMemo(() => {
    return projects.find(p => p.id === projectId) || null;
  }, [projects, projectId]);

  // Filtrar tarefas do projeto ativo
  const projectTasks = useMemo(() => {
    if (!activeProject) return [];
    return allTasks.filter(t => t.projectId === activeProject.id);
  }, [activeProject, allTasks]);

  // Redirecionar se projeto nao encontrado (so apos terminar de buscar)
  useEffect(() => {
    if (redirectedRef.current) return;
    // Esperar terminar de buscar (loading E fetching) antes de redirecionar
    if (loadingProjects || fetchingProjects) return;
    if (projects.length > 0 && !activeProject) {
      redirectedRef.current = true;
      addToast('Projeto nao encontrado', 'error');
      navigate('/eap', { replace: true });
    }
  }, [loadingProjects, fetchingProjects, projects, activeProject, navigate, addToast]);

  // ==================== HANDLERS TAREFAS ====================

  const handleCreateTask = useCallback(async (taskData) => {
    const result = await createTaskMut.mutateAsync(taskData);
    return result;
  }, [createTaskMut]);

  const handleUpdateTask = useCallback(async (id, updates, skipInvalidation = false) => {
    const result = await updateTaskMut.mutateAsync({ id, updates, skipInvalidation });
    return result;
  }, [updateTaskMut]);

  const handleDeleteTask = useCallback(async (id) => {
    await deleteTaskMut.mutateAsync(id);
  }, [deleteTaskMut]);

  // ==================== RENDER ====================

  // Mostrar loading enquanto busca dados ou projeto ainda nao foi encontrado
  if (loadingProjects || loadingTasks || (!activeProject && fetchingProjects)) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!activeProject) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-3">
        <p className="text-slate-500 dark:text-slate-400 text-sm">Projeto nao encontrado.</p>
        <button
          onClick={() => navigate('/eap')}
          className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Voltar para Projetos
        </button>
      </div>
    );
  }

  // Full-bleed: margem negativa para comer o p-6 do layout
  return (
    <div className="-m-6 flex flex-col" style={{ width: 'calc(100% + 48px)', height: 'calc(100% + 48px)' }}>
      {/* Header com botao voltar e nome do projeto */}
      <div className="flex items-center gap-3 px-4 py-2 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700 shrink-0">
        <button
          onClick={() => navigate('/eap')}
          className="flex items-center gap-1 text-sm text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Projetos
        </button>
        <span className="text-slate-300 dark:text-slate-600">/</span>
        <span className="text-sm font-medium text-slate-800 dark:text-slate-100">{activeProject.name}</span>
      </div>

      <div className="flex-1 min-h-0">
        <GanttChart
          project={activeProject}
          tasks={projectTasks}
          teamMembers={teamMembers}
          osOrders={osOrders}
          onCreateTask={handleCreateTask}
          onUpdateTask={handleUpdateTask}
          onDeleteTask={handleDeleteTask}
          invalidateEapTasks={() => queryClient.invalidateQueries({ queryKey: queryKeys.eapTasks })}
        />
      </div>
    </div>
  );
}
