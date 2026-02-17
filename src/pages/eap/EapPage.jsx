import { useState, useEffect, useCallback, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useEapProjects, useCreateEapProject, useEapTasks, useCreateEapTask, useUpdateEapTask, useDeleteEapTask, useTeamMembers, useOSOrders, queryKeys } from '../../hooks/queries';
import { useToast } from '../../contexts/ToastContext';
import { getProfile } from '../../lib/profileService';
import GanttChart from './components/GanttChart';

// Nome do projeto padrao (criado automaticamente)
const DEFAULT_PROJECT_NAME = 'Fyness EAP';

export default function EapPage() {
  const { addToast } = useToast();
  const queryClient = useQueryClient();

  // Data
  const { data: projects = [], isLoading: loadingProjects } = useEapProjects();
  const { data: allTasks = [], isLoading: loadingTasks } = useEapTasks();
  const { data: teamMembers = [] } = useTeamMembers();
  const { data: osOrders = [] } = useOSOrders();

  // Mutations
  const createProjectMut = useCreateEapProject();
  const createTaskMut = useCreateEapTask();
  const updateTaskMut = useUpdateEapTask();
  const deleteTaskMut = useDeleteEapTask();

  const [profile, setProfile] = useState({});
  const creatingRef = useRef(false);

  useEffect(() => {
    getProfile().then(p => p && setProfile(p));
  }, []);

  // Auto-criar projeto padrao se nenhum existe
  useEffect(() => {
    if (loadingProjects || creatingRef.current) return;
    if (projects.length === 0) {
      creatingRef.current = true;
      createProjectMut.mutateAsync({
        name: DEFAULT_PROJECT_NAME,
        description: '',
        startDate: new Date().toISOString().split('T')[0],
        endDate: '',
        status: 'active',
        color: '#3b82f6',
        createdBy: profile.name || profile.email || '',
      }).finally(() => { creatingRef.current = false; });
    }
  }, [loadingProjects, projects.length]);

  // Usar o primeiro projeto disponivel
  const activeProject = projects[0] || null;

  // Todas as tarefas do projeto ativo
  const projectTasks = activeProject
    ? allTasks.filter(t => t.projectId === activeProject.id)
    : [];

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

  if (loadingProjects || loadingTasks || !activeProject) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // Full-bleed: margem negativa para comer o p-6 do layout
  return (
    <div className="-m-6 flex flex-col" style={{ width: 'calc(100% + 48px)', height: 'calc(100% + 48px)' }}>
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
