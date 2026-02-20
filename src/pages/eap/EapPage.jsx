import { useState, useEffect, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useEapProjects, useCreateEapProject, useDeleteEapProject, useEapTasks } from '../../hooks/queries';
import { useToast } from '../../contexts/ToastContext';
import { getProfile } from '../../lib/profileService';

// Mapa de status para exibicao
const STATUS_LABELS = {
  planning: { label: 'Planejamento', color: 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300' },
  active: { label: 'Ativo', color: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' },
  completed: { label: 'Concluido', color: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400' },
  on_hold: { label: 'Pausado', color: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400' },
};

const EMPTY_FORM = { name: '', description: '', startDate: '', endDate: '', status: 'planning', color: '#3b82f6' };

const PROJECT_COLORS = ['#3b82f6', '#10b981', '#f97316', '#ec4899', '#eab308', '#ef4444', '#8b5cf6', '#06b6d4'];

export default function EapPage() {
  const navigate = useNavigate();
  const { addToast } = useToast();
  // Data
  const { data: projects = [], isLoading: loadingProjects } = useEapProjects();
  const { data: allTasks = [] } = useEapTasks();

  // Mutations
  const createProjectMut = useCreateEapProject();
  const deleteProjectMut = useDeleteEapProject();

  // State
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [profile, setProfile] = useState({});

  useEffect(() => {
    getProfile().then(p => p && setProfile(p));
  }, []);

  // Contagem de tarefas por projeto
  const taskCountMap = useMemo(() => {
    const map = {};
    for (const task of allTasks) {
      map[task.projectId] = (map[task.projectId] || 0) + 1;
    }
    return map;
  }, [allTasks]);

  // Progresso medio por projeto
  const progressMap = useMemo(() => {
    const sums = {};
    const counts = {};
    for (const task of allTasks) {
      if (!sums[task.projectId]) { sums[task.projectId] = 0; counts[task.projectId] = 0; }
      sums[task.projectId] += (task.progress || 0);
      counts[task.projectId]++;
    }
    const result = {};
    for (const pid of Object.keys(sums)) {
      result[pid] = counts[pid] > 0 ? Math.round(sums[pid] / counts[pid]) : 0;
    }
    return result;
  }, [allTasks]);

  // Handlers
  const creatingRef = useRef(false);
  const [isCreating, setIsCreating] = useState(false);

  const handleCreateProject = async () => {
    if (creatingRef.current) return;
    if (!form.name.trim()) {
      addToast('Nome do projeto e obrigatorio', 'error');
      return;
    }
    creatingRef.current = true;
    setIsCreating(true);
    try {
      const newProject = await createProjectMut.mutateAsync({
        ...form,
        startDate: form.startDate || null,
        endDate: form.endDate || null,
        createdBy: profile.name || profile.email || '',
      });
      setShowCreateModal(false);
      setForm(EMPTY_FORM);
      addToast('Projeto criado com sucesso!', 'success');
    } catch {
      addToast('Erro ao criar projeto', 'error');
    } finally {
      creatingRef.current = false;
      setIsCreating(false);
    }
  };

  const [deleteTarget, setDeleteTarget] = useState(null); // { id, name }

  const handleRequestDelete = (e, projectId, projectName) => {
    e.stopPropagation();
    setDeleteTarget({ id: projectId, name: projectName });
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteProjectMut.mutateAsync(deleteTarget.id);
      addToast('Projeto excluido', 'success');
    } catch {
      addToast('Erro ao excluir projeto', 'error');
    } finally {
      setDeleteTarget(null);
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  // Loading
  if (loadingProjects) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-100">Projetos EAP</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            {projects.length} {projects.length === 1 ? 'projeto' : 'projetos'}
          </p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Novo Projeto
        </button>
      </div>

      {/* Grid de Projetos */}
      {projects.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <svg className="w-16 h-16 text-slate-300 dark:text-slate-600 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
          </svg>
          <h3 className="text-lg font-medium text-slate-700 dark:text-slate-300 mb-1">Nenhum projeto ainda</h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">Crie seu primeiro projeto para comecar a gerenciar suas tarefas no Gantt.</p>
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
          >
            Criar Primeiro Projeto
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {projects.map(project => {
            const status = STATUS_LABELS[project.status] || STATUS_LABELS.planning;
            const taskCount = taskCountMap[project.id] || 0;
            const avgProgress = progressMap[project.id] || 0;

            return (
              <div
                key={project.id}
                onClick={() => navigate(`/eap/${project.id}`)}
                className="group relative bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-5 cursor-pointer hover:shadow-lg hover:border-blue-300 dark:hover:border-blue-600 transition-all duration-200"
              >
                {/* Barra de cor no topo */}
                <div
                  className="absolute top-0 left-4 right-4 h-1 rounded-b-full"
                  style={{ backgroundColor: project.color || '#3b82f6' }}
                />

                {/* Botao excluir (hover) */}
                <button
                  onClick={(e) => handleRequestDelete(e, project.id, project.name)}
                  className="absolute top-3 right-3 p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 opacity-0 group-hover:opacity-100 pointer-events-none group-hover:pointer-events-auto transition-all"
                  title="Excluir projeto"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>

                {/* Nome do projeto */}
                <h3 className="text-base font-semibold text-slate-800 dark:text-slate-100 mt-2 mb-2 pr-8 truncate">
                  {project.name}
                </h3>

                {/* Badge de status */}
                <span className={`inline-block px-2 py-0.5 text-xs font-medium rounded-full ${status.color}`}>
                  {status.label}
                </span>

                {/* Descricao */}
                {project.description && (
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 line-clamp-2">
                    {project.description}
                  </p>
                )}

                {/* Metadados */}
                <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-700 space-y-1.5">
                  {/* Datas */}
                  <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <span>{formatDate(project.startDate)} — {formatDate(project.endDate)}</span>
                  </div>

                  {/* Contagem de tarefas */}
                  <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                    <span>{taskCount} {taskCount === 1 ? 'tarefa' : 'tarefas'}</span>
                  </div>

                  {/* Barra de progresso */}
                  {taskCount > 0 && (
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-1.5 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all"
                          style={{ width: `${avgProgress}%`, backgroundColor: project.color || '#3b82f6' }}
                        />
                      </div>
                      <span className="text-xs font-medium text-slate-500 dark:text-slate-400">{avgProgress}%</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal de Criacao */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={() => setShowCreateModal(false)}>
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-xl w-full max-w-md p-6" onClick={e => e.stopPropagation()}>
            <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100 mb-4">Novo Projeto EAP</h3>

            <div className="space-y-4">
              {/* Nome */}
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Nome *</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={e => setForm(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Nome do projeto"
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  autoFocus
                  onKeyDown={e => e.key === 'Enter' && handleCreateProject()}
                />
              </div>

              {/* Descricao */}
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Descricao</label>
                <textarea
                  value={form.description}
                  onChange={e => setForm(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Descricao opcional"
                  rows={2}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm resize-none"
                />
              </div>

              {/* Datas */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Inicio</label>
                  <input
                    type="date"
                    value={form.startDate}
                    onChange={e => setForm(prev => ({ ...prev, startDate: e.target.value }))}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Fim</label>
                  <input
                    type="date"
                    value={form.endDate}
                    onChange={e => setForm(prev => ({ ...prev, endDate: e.target.value }))}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  />
                </div>
              </div>

              {/* Status */}
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Status</label>
                <select
                  value={form.status}
                  onChange={e => setForm(prev => ({ ...prev, status: e.target.value }))}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                >
                  <option value="planning">Planejamento</option>
                  <option value="active">Ativo</option>
                  <option value="on_hold">Pausado</option>
                  <option value="completed">Concluido</option>
                </select>
              </div>

              {/* Cor */}
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Cor</label>
                <div className="flex gap-2 flex-wrap">
                  {PROJECT_COLORS.map(c => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setForm(prev => ({ ...prev, color: c }))}
                      className={`w-7 h-7 rounded-full transition-all ${form.color === c ? 'ring-2 ring-offset-2 ring-blue-500 dark:ring-offset-slate-800' : 'hover:scale-110'}`}
                      style={{ backgroundColor: c }}
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* Botoes */}
            <div className="flex justify-end gap-2 mt-6">
              <button
                onClick={() => { setShowCreateModal(false); setForm(EMPTY_FORM); }}
                className="px-4 py-2 text-sm text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleCreateProject}
                disabled={isCreating}
                className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                {isCreating ? 'Criando...' : 'Criar Projeto'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Confirmacao de Exclusao */}
      {deleteTarget && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={() => setDeleteTarget(null)}>
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-xl w-full max-w-sm p-6" onClick={e => e.stopPropagation()}>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center shrink-0">
                <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </div>
              <div>
                <h3 className="text-base font-semibold text-slate-800 dark:text-slate-100">Excluir projeto</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                  Tem certeza que deseja excluir <strong>"{deleteTarget.name}"</strong> e todas as suas tarefas? Esta acao nao pode ser desfeita.
                </p>
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-5">
              <button
                onClick={() => setDeleteTarget(null)}
                className="px-4 py-2 text-sm text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleConfirmDelete}
                disabled={deleteProjectMut.isPending}
                className="px-4 py-2 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
              >
                {deleteProjectMut.isPending ? 'Excluindo...' : 'Excluir'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
