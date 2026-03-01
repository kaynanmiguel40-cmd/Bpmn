import { useState, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import {
  useEapFolders, useCreateEapFolder, useUpdateEapFolder, useDeleteEapFolder,
  useEapProjects, useCreateEapProject, useUpdateEapProject, useDeleteEapProject,
  useEapTasks, queryKeys,
} from '../../hooks/queries';
import { useToast } from '../../contexts/ToastContext';
import AutoTextarea from '../../components/ui/AutoTextarea';
import { useProfile } from '../../hooks/useProfile';
import { createLinkedOSProject } from '../../lib/eapService';
import { EAP_STATUS_LABELS as STATUS_LABELS, PROJECT_COLORS } from '../../constants/colors';

const EMPTY_FOLDER_FORM = { name: '', description: '', color: '#3b82f6', status: 'planning' };
const EMPTY_EAP_FORM = { name: '', description: '', startDate: '', endDate: '', status: 'planning', color: '#3b82f6' };

// ==================== ICONS ====================

const FolderIcon = ({ className = 'w-5 h-5' }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
  </svg>
);

const PlusIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
  </svg>
);

const EditIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
  </svg>
);

const TrashIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
  </svg>
);

const BackIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
  </svg>
);

const CalendarIcon = () => (
  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
  </svg>
);

const TaskIcon = () => (
  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
  </svg>
);

// ==================== HELPER ====================

function formatDate(dateStr) {
  if (!dateStr) return '-';
  return new Date(dateStr).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' });
}

// ==================== MODAL GENERICO ====================

function FormModal({ title, children, onClose, onSubmit, submitLabel, isSubmitting }) {
  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-xl w-full max-w-md p-6" onClick={e => e.stopPropagation()}>
        <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100 mb-4">{title}</h3>
        <div className="space-y-4">{children}</div>
        <div className="flex justify-end gap-2 mt-6">
          <button onClick={onClose} className="px-4 py-2 text-sm text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors">
            Cancelar
          </button>
          <button onClick={onSubmit} disabled={isSubmitting} className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50">
            {isSubmitting ? 'Salvando...' : submitLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

function DeleteModal({ targetName, targetType, onClose, onConfirm, isPending }) {
  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-xl w-full max-w-sm p-6" onClick={e => e.stopPropagation()}>
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center shrink-0">
            <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </div>
          <div>
            <h3 className="text-base font-semibold text-slate-800 dark:text-slate-100">Excluir {targetType}</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
              Tem certeza que deseja excluir <strong>"{targetName}"</strong>? Esta acao nao pode ser desfeita.
            </p>
          </div>
        </div>
        <div className="flex justify-end gap-2 mt-5">
          <button onClick={onClose} className="px-4 py-2 text-sm text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors">
            Cancelar
          </button>
          <button onClick={onConfirm} disabled={isPending} className="px-4 py-2 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50">
            {isPending ? 'Excluindo...' : 'Excluir'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ==================== FORM FIELDS ====================

const inputClass = 'w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm';

function NameField({ value, onChange, onEnter, placeholder }) {
  return (
    <div>
      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Nome *</label>
      <input type="text" value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} className={inputClass} autoFocus onKeyDown={e => e.key === 'Enter' && onEnter?.()} />
    </div>
  );
}

function DescriptionField({ value, onChange }) {
  return (
    <div>
      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Descricao</label>
      <AutoTextarea value={value} onChange={e => onChange(e.target.value)} placeholder="Descricao opcional" minRows={2} className={inputClass} />
    </div>
  );
}

function StatusField({ value, onChange }) {
  return (
    <div>
      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Status</label>
      <select value={value} onChange={e => onChange(e.target.value)} className={inputClass}>
        <option value="planning">Planejamento</option>
        <option value="active">Ativo</option>
        <option value="on_hold">Pausado</option>
        <option value="completed">Concluido</option>
      </select>
    </div>
  );
}

function ColorField({ value, onChange }) {
  return (
    <div>
      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Cor</label>
      <div className="flex gap-2 flex-wrap">
        {PROJECT_COLORS.map(c => (
          <button key={c} type="button" onClick={() => onChange(c)}
            className={`w-7 h-7 rounded-full transition-all ${value === c ? 'ring-2 ring-offset-2 ring-blue-500 dark:ring-offset-slate-800' : 'hover:scale-110'}`}
            style={{ backgroundColor: c }} />
        ))}
      </div>
    </div>
  );
}

function DateFields({ startDate, endDate, onChangeStart, onChangeEnd }) {
  return (
    <div className="grid grid-cols-2 gap-3">
      <div>
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Inicio</label>
        <input type="date" value={startDate} onChange={e => onChangeStart(e.target.value)} className={inputClass} />
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Fim</label>
        <input type="date" value={endDate} onChange={e => onChangeEnd(e.target.value)} className={inputClass} />
      </div>
    </div>
  );
}

// ==================== MAIN COMPONENT ====================

export default function EapPage() {
  const navigate = useNavigate();
  const { addToast } = useToast();
  const queryClient = useQueryClient();
  const { profile } = useProfile();

  // Data
  const { data: folders = [], isLoading: loadingFolders } = useEapFolders();
  const { data: projects = [], isLoading: loadingProjects } = useEapProjects();
  const { data: allTasks = [] } = useEapTasks();

  // Folder mutations
  const createFolderMut = useCreateEapFolder();
  const updateFolderMut = useUpdateEapFolder();
  const deleteFolderMut = useDeleteEapFolder();

  // Project mutations
  const createProjectMut = useCreateEapProject();
  const updateProjectMut = useUpdateEapProject();
  const deleteProjectMut = useDeleteEapProject();

  // Navigation state: null = folder view, folder object = inside folder
  const [activeFolder, setActiveFolder] = useState(null);

  // Modal states
  const [showCreateFolder, setShowCreateFolder] = useState(false);
  const [folderForm, setFolderForm] = useState(EMPTY_FOLDER_FORM);
  const [editFolder, setEditFolder] = useState(null);
  const [editFolderForm, setEditFolderForm] = useState(EMPTY_FOLDER_FORM);

  const [showCreateEap, setShowCreateEap] = useState(false);
  const [eapForm, setEapForm] = useState(EMPTY_EAP_FORM);
  const [editProject, setEditProject] = useState(null);
  const [editForm, setEditForm] = useState(EMPTY_EAP_FORM);

  const [deleteTarget, setDeleteTarget] = useState(null); // { id, name, type: 'folder'|'eap' }
  const [dragOverFolderId, setDragOverFolderId] = useState(null); // folder id being hovered during drag
  const [isCreating, setIsCreating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const creatingRef = useRef(false);

  // ==================== COMPUTED ====================

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

  // Contagem de EAPs por pasta
  const eapCountMap = useMemo(() => {
    const map = {};
    for (const p of projects) {
      const fid = p.folderId || '__none__';
      map[fid] = (map[fid] || 0) + 1;
    }
    return map;
  }, [projects]);

  // Progresso medio por pasta (media dos progressos dos projetos dentro)
  const folderProgressMap = useMemo(() => {
    const sums = {};
    const counts = {};
    for (const p of projects) {
      const fid = p.folderId;
      if (!fid) continue;
      const pProgress = progressMap[p.id] || 0;
      if (!sums[fid]) { sums[fid] = 0; counts[fid] = 0; }
      sums[fid] += pProgress;
      counts[fid]++;
    }
    const result = {};
    for (const fid of Object.keys(sums)) {
      result[fid] = counts[fid] > 0 ? Math.round(sums[fid] / counts[fid]) : 0;
    }
    return result;
  }, [projects, progressMap]);

  // Projetos sem pasta (orfaos)
  const orphanProjects = useMemo(() => projects.filter(p => !p.folderId), [projects]);

  // Projetos dentro da pasta ativa
  const folderProjects = useMemo(() => {
    if (!activeFolder) return [];
    return projects.filter(p => p.folderId === activeFolder.id);
  }, [projects, activeFolder]);

  // ==================== FOLDER HANDLERS ====================

  const handleCreateFolder = async () => {
    if (creatingRef.current) return;
    if (!folderForm.name.trim()) {
      addToast('Nome do projeto e obrigatorio', 'error');
      return;
    }
    creatingRef.current = true;
    setIsCreating(true);
    try {
      await createFolderMut.mutateAsync({
        ...folderForm,
        createdBy: profile.name || profile.email || '',
      });
      setShowCreateFolder(false);
      setFolderForm(EMPTY_FOLDER_FORM);
      addToast('Projeto criado com sucesso!', 'success');
    } catch {
      addToast('Erro ao criar projeto', 'error');
    } finally {
      creatingRef.current = false;
      setIsCreating(false);
    }
  };

  const handleEditFolder = (e, folder) => {
    e.stopPropagation();
    setEditFolder(folder);
    setEditFolderForm({
      name: folder.name || '',
      description: folder.description || '',
      color: folder.color || '#3b82f6',
      status: folder.status || 'planning',
    });
  };

  const handleUpdateFolder = async () => {
    if (!editFolder) return;
    if (!editFolderForm.name.trim()) {
      addToast('Nome do projeto e obrigatorio', 'error');
      return;
    }
    setIsSaving(true);
    try {
      await updateFolderMut.mutateAsync({ id: editFolder.id, updates: editFolderForm });
      // Atualizar activeFolder se estiver editando a pasta ativa
      if (activeFolder?.id === editFolder.id) {
        setActiveFolder(prev => ({ ...prev, ...editFolderForm }));
      }
      setEditFolder(null);
      addToast('Projeto atualizado!', 'success');
    } catch {
      addToast('Erro ao atualizar projeto', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  // ==================== EAP HANDLERS ====================

  const handleCreateEap = async () => {
    if (creatingRef.current) return;
    if (!eapForm.name.trim()) {
      addToast('Nome da EAP e obrigatorio', 'error');
      return;
    }
    creatingRef.current = true;
    setIsCreating(true);
    try {
      const newProject = await createProjectMut.mutateAsync({
        ...eapForm,
        startDate: eapForm.startDate || null,
        endDate: eapForm.endDate || null,
        folderId: activeFolder?.id || null,
        createdBy: profile.name || profile.email || '',
      });

      // Auto-criar OS Project vinculado
      if (newProject?.id) {
        try {
          await createLinkedOSProject(newProject);
          queryClient.invalidateQueries({ queryKey: queryKeys.osProjects });
        } catch (err) {
          console.warn('[EAP] Erro ao criar projeto OS vinculado:', err);
        }
      }

      setShowCreateEap(false);
      setEapForm(EMPTY_EAP_FORM);
      addToast('EAP criada com sucesso!', 'success');
    } catch {
      addToast('Erro ao criar EAP', 'error');
    } finally {
      creatingRef.current = false;
      setIsCreating(false);
    }
  };

  const handleEditEap = (e, project) => {
    e.stopPropagation();
    setEditProject(project);
    setEditForm({
      name: project.name || '',
      description: project.description || '',
      startDate: project.startDate || '',
      endDate: project.endDate || '',
      status: project.status || 'planning',
      color: project.color || '#3b82f6',
    });
  };

  const handleUpdateEap = async () => {
    if (!editProject) return;
    if (!editForm.name.trim()) {
      addToast('Nome da EAP e obrigatorio', 'error');
      return;
    }
    setIsSaving(true);
    try {
      await updateProjectMut.mutateAsync({
        id: editProject.id,
        updates: { ...editForm, startDate: editForm.startDate || null, endDate: editForm.endDate || null },
      });
      setEditProject(null);
      addToast('EAP atualizada!', 'success');
    } catch {
      addToast('Erro ao atualizar EAP', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  // ==================== DRAG & DROP ====================

  const handleDragStart = (e, project) => {
    e.dataTransfer.setData('text/plain', project.id);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleFolderDragOver = (e, folderId) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOverFolderId(folderId);
  };

  const handleFolderDragLeave = () => {
    setDragOverFolderId(null);
  };

  const handleFolderDrop = async (e, folderId) => {
    e.preventDefault();
    setDragOverFolderId(null);
    const eapId = e.dataTransfer.getData('text/plain');
    if (!eapId) return;
    const project = projects.find(p => p.id === eapId);
    if (!project || project.folderId === folderId) return;
    try {
      await updateProjectMut.mutateAsync({
        id: eapId,
        updates: { folderId: folderId || null },
      });
      addToast(folderId ? 'EAP movida para o projeto!' : 'EAP removida do projeto!', 'success');
    } catch {
      addToast('Erro ao mover EAP', 'error');
    }
  };

  // ==================== DELETE HANDLER ====================

  const handleRequestDelete = (e, id, name, type) => {
    e.stopPropagation();
    setDeleteTarget({ id, name, type });
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      if (deleteTarget.type === 'folder') {
        await deleteFolderMut.mutateAsync(deleteTarget.id);
        if (activeFolder?.id === deleteTarget.id) setActiveFolder(null);
        addToast('Projeto excluido', 'success');
      } else {
        await deleteProjectMut.mutateAsync(deleteTarget.id);
        addToast('EAP excluida', 'success');
      }
    } catch {
      addToast('Erro ao excluir', 'error');
    } finally {
      setDeleteTarget(null);
    }
  };

  // ==================== RENDER ====================

  if (loadingFolders || loadingProjects) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // ---------- INSIDE FOLDER VIEW ----------
  if (activeFolder) {
    return (
      <div>
        {/* Breadcrumb + Back */}
        <div className="flex items-center gap-3 mb-6">
          <button
            onClick={() => setActiveFolder(null)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
          >
            <BackIcon />
            Voltar
          </button>
          <div className="flex items-center gap-2 text-sm text-slate-400 dark:text-slate-500">
            <span>Projetos</span>
            <span>/</span>
            <span className="text-slate-800 dark:text-slate-100 font-medium">{activeFolder.name}</span>
          </div>
        </div>

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: activeFolder.color + '20' }}>
              <FolderIcon className="w-5 h-5" style={{ color: activeFolder.color }} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-100">{activeFolder.name}</h2>
                <button onClick={(e) => handleEditFolder(e, activeFolder)} className="p-1 rounded text-slate-400 hover:text-blue-500 transition-colors" title="Editar projeto">
                  <EditIcon />
                </button>
              </div>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                {folderProjects.length} {folderProjects.length === 1 ? 'EAP' : 'EAPs'}
              </p>
            </div>
          </div>
          <button onClick={() => setShowCreateEap(true)} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium">
            <PlusIcon />
            Nova EAP
          </button>
        </div>

        {/* EAP Grid */}
        {folderProjects.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <FolderIcon className="w-16 h-16 text-slate-300 dark:text-slate-600 mb-4" />
            <h3 className="text-lg font-medium text-slate-700 dark:text-slate-300 mb-1">Nenhuma EAP neste projeto</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">Crie sua primeira EAP para comecar a gerenciar tarefas no Gantt.</p>
            <button onClick={() => setShowCreateEap(true)} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium">
              Criar Primeira EAP
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {folderProjects.map(project => renderEapCard(project))}
          </div>
        )}

        {/* Modals */}
        {renderEapModals()}
        {renderFolderEditModal()}
        {renderDeleteModal()}
      </div>
    );
  }

  // ---------- FOLDER VIEW (default) ----------
  const hasContent = folders.length > 0 || orphanProjects.length > 0;

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-100">Projetos</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            {folders.length} {folders.length === 1 ? 'projeto' : 'projetos'}
            {orphanProjects.length > 0 && ` · ${orphanProjects.length} EAP${orphanProjects.length > 1 ? 's' : ''} avulsa${orphanProjects.length > 1 ? 's' : ''}`}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setShowCreateEap(true)} className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
            <PlusIcon />
            Nova EAP Avulsa
          </button>
          <button onClick={() => setShowCreateFolder(true)} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium">
            <PlusIcon />
            Novo Projeto
          </button>
        </div>
      </div>

      {!hasContent ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <FolderIcon className="w-16 h-16 text-slate-300 dark:text-slate-600 mb-4" />
          <h3 className="text-lg font-medium text-slate-700 dark:text-slate-300 mb-1">Nenhum projeto ainda</h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">Crie seu primeiro projeto para organizar suas EAPs.</p>
          <button onClick={() => setShowCreateFolder(true)} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium">
            Criar Primeiro Projeto
          </button>
        </div>
      ) : (
        <>
          {/* Folders Grid */}
          {folders.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-6">
              {folders.map(folder => {
                const status = STATUS_LABELS[folder.status] || STATUS_LABELS.planning;
                const eapCount = eapCountMap[folder.id] || 0;
                const avgProgress = folderProgressMap[folder.id] || 0;

                return (
                  <div
                    key={folder.id}
                    onClick={() => setActiveFolder(folder)}
                    onDragOver={(e) => handleFolderDragOver(e, folder.id)}
                    onDragLeave={handleFolderDragLeave}
                    onDrop={(e) => handleFolderDrop(e, folder.id)}
                    className={`group relative bg-white dark:bg-slate-800 border-2 rounded-xl p-5 cursor-pointer hover:shadow-lg transition-all duration-200 ${
                      dragOverFolderId === folder.id
                        ? 'border-blue-500 dark:border-blue-400 bg-blue-50/50 dark:bg-blue-900/20 shadow-lg scale-[1.02]'
                        : 'border-slate-200 dark:border-slate-700 hover:border-blue-300 dark:hover:border-blue-600'
                    }`}
                  >
                    {/* Barra de cor */}
                    <div className="absolute top-0 left-4 right-4 h-1 rounded-b-full" style={{ backgroundColor: folder.color || '#3b82f6' }} />

                    {/* Botoes hover */}
                    <div className="absolute top-3 right-3 flex items-center gap-0.5 opacity-0 group-hover:opacity-100 pointer-events-none group-hover:pointer-events-auto transition-all">
                      <button onClick={(e) => handleEditFolder(e, folder)} className="p-1.5 rounded-lg text-slate-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors" title="Editar projeto">
                        <EditIcon />
                      </button>
                      <button onClick={(e) => handleRequestDelete(e, folder.id, folder.name, 'folder')} className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors" title="Excluir projeto">
                        <TrashIcon />
                      </button>
                    </div>

                    {/* Icone de pasta + Nome */}
                    <div className="flex items-center gap-2.5 mt-2 mb-2 pr-8">
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: folder.color + '20' }}>
                        <FolderIcon className="w-4.5 h-4.5" style={{ color: folder.color }} />
                      </div>
                      <h3 className="text-base font-semibold text-slate-800 dark:text-slate-100 truncate">{folder.name}</h3>
                    </div>

                    {/* Badge de status */}
                    <span className={`inline-block px-2 py-0.5 text-xs font-medium rounded-full ${status.color}`}>
                      {status.label}
                    </span>

                    {/* Descricao */}
                    {folder.description && (
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 line-clamp-2">{folder.description}</p>
                    )}

                    {/* Metadados */}
                    <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-700 space-y-1.5">
                      <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
                        <TaskIcon />
                        <span>{eapCount} {eapCount === 1 ? 'EAP' : 'EAPs'}</span>
                      </div>

                      {eapCount > 0 && (
                        <div className="flex items-center gap-2">
                          <div className="flex-1 h-1.5 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                            <div className="h-full rounded-full transition-all" style={{ width: `${avgProgress}%`, backgroundColor: folder.color || '#3b82f6' }} />
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

          {/* Orphan EAPs (sem pasta) */}
          {orphanProjects.length > 0 && (
            <>
              {folders.length > 0 && (
                <div className="flex items-center gap-2 mb-3 mt-2">
                  <div className="h-px flex-1 bg-slate-200 dark:bg-slate-700" />
                  <span className="text-xs font-medium text-slate-400 dark:text-slate-500 uppercase tracking-wider">EAPs Avulsas</span>
                  <div className="h-px flex-1 bg-slate-200 dark:bg-slate-700" />
                </div>
              )}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {orphanProjects.map(project => renderEapCard(project))}
              </div>
            </>
          )}
        </>
      )}

      {/* Modals */}
      {renderFolderCreateModal()}
      {renderFolderEditModal()}
      {renderEapModals()}
      {renderDeleteModal()}
    </div>
  );

  // ==================== RENDER HELPERS ====================

  function renderEapCard(project) {
    const status = STATUS_LABELS[project.status] || STATUS_LABELS.planning;
    const taskCount = taskCountMap[project.id] || 0;
    const avgProgress = progressMap[project.id] || 0;

    return (
      <div
        key={project.id}
        draggable
        onDragStart={(e) => handleDragStart(e, project)}
        onClick={() => navigate(`/eap/${project.id}`)}
        className="group relative bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-5 cursor-pointer hover:shadow-lg hover:border-blue-300 dark:hover:border-blue-600 transition-all duration-200"
      >
        <div className="absolute top-0 left-4 right-4 h-1 rounded-b-full" style={{ backgroundColor: project.color || '#3b82f6' }} />

        <div className="absolute top-3 right-3 flex items-center gap-0.5 opacity-0 group-hover:opacity-100 pointer-events-none group-hover:pointer-events-auto transition-all">
          <button onClick={(e) => handleEditEap(e, project)} className="p-1.5 rounded-lg text-slate-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors" title="Editar EAP">
            <EditIcon />
          </button>
          <button onClick={(e) => handleRequestDelete(e, project.id, project.name, 'eap')} className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors" title="Excluir EAP">
            <TrashIcon />
          </button>
        </div>

        <h3 className="text-base font-semibold text-slate-800 dark:text-slate-100 mt-2 mb-2 pr-8 truncate">{project.name}</h3>

        <span className={`inline-block px-2 py-0.5 text-xs font-medium rounded-full ${status.color}`}>
          {status.label}
        </span>

        {project.description && (
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 line-clamp-2">{project.description}</p>
        )}

        <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-700 space-y-1.5">
          <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
            <CalendarIcon />
            <span>{formatDate(project.startDate)} — {formatDate(project.endDate)}</span>
          </div>

          <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
            <TaskIcon />
            <span>{taskCount} {taskCount === 1 ? 'tarefa' : 'tarefas'}</span>
          </div>

          {taskCount > 0 && (
            <div className="flex items-center gap-2">
              <div className="flex-1 h-1.5 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                <div className="h-full rounded-full transition-all" style={{ width: `${avgProgress}%`, backgroundColor: project.color || '#3b82f6' }} />
              </div>
              <span className="text-xs font-medium text-slate-500 dark:text-slate-400">{avgProgress}%</span>
            </div>
          )}
        </div>
      </div>
    );
  }

  function renderFolderCreateModal() {
    if (!showCreateFolder) return null;
    return (
      <FormModal title="Novo Projeto" onClose={() => { setShowCreateFolder(false); setFolderForm(EMPTY_FOLDER_FORM); }} onSubmit={handleCreateFolder} submitLabel="Criar Projeto" isSubmitting={isCreating}>
        <NameField value={folderForm.name} onChange={v => setFolderForm(prev => ({ ...prev, name: v }))} onEnter={handleCreateFolder} placeholder="Nome do projeto" />
        <DescriptionField value={folderForm.description} onChange={v => setFolderForm(prev => ({ ...prev, description: v }))} />
        <StatusField value={folderForm.status} onChange={v => setFolderForm(prev => ({ ...prev, status: v }))} />
        <ColorField value={folderForm.color} onChange={v => setFolderForm(prev => ({ ...prev, color: v }))} />
      </FormModal>
    );
  }

  function renderFolderEditModal() {
    if (!editFolder) return null;
    return (
      <FormModal title="Editar Projeto" onClose={() => setEditFolder(null)} onSubmit={handleUpdateFolder} submitLabel="Salvar" isSubmitting={isSaving}>
        <NameField value={editFolderForm.name} onChange={v => setEditFolderForm(prev => ({ ...prev, name: v }))} onEnter={handleUpdateFolder} placeholder="Nome do projeto" />
        <DescriptionField value={editFolderForm.description} onChange={v => setEditFolderForm(prev => ({ ...prev, description: v }))} />
        <StatusField value={editFolderForm.status} onChange={v => setEditFolderForm(prev => ({ ...prev, status: v }))} />
        <ColorField value={editFolderForm.color} onChange={v => setEditFolderForm(prev => ({ ...prev, color: v }))} />
      </FormModal>
    );
  }

  function renderEapModals() {
    return (
      <>
        {/* Create EAP */}
        {showCreateEap && (
          <FormModal title={activeFolder ? 'Nova EAP' : 'Nova EAP Avulsa'} onClose={() => { setShowCreateEap(false); setEapForm(EMPTY_EAP_FORM); }} onSubmit={handleCreateEap} submitLabel="Criar EAP" isSubmitting={isCreating}>
            <NameField value={eapForm.name} onChange={v => setEapForm(prev => ({ ...prev, name: v }))} onEnter={handleCreateEap} placeholder="Nome da EAP" />
            <DescriptionField value={eapForm.description} onChange={v => setEapForm(prev => ({ ...prev, description: v }))} />
            <DateFields
              startDate={eapForm.startDate} endDate={eapForm.endDate}
              onChangeStart={v => setEapForm(prev => ({ ...prev, startDate: v }))}
              onChangeEnd={v => setEapForm(prev => ({ ...prev, endDate: v }))}
            />
            <StatusField value={eapForm.status} onChange={v => setEapForm(prev => ({ ...prev, status: v }))} />
            <ColorField value={eapForm.color} onChange={v => setEapForm(prev => ({ ...prev, color: v }))} />
          </FormModal>
        )}

        {/* Edit EAP */}
        {editProject && (
          <FormModal title="Editar EAP" onClose={() => setEditProject(null)} onSubmit={handleUpdateEap} submitLabel="Salvar" isSubmitting={isSaving}>
            <NameField value={editForm.name} onChange={v => setEditForm(prev => ({ ...prev, name: v }))} onEnter={handleUpdateEap} placeholder="Nome da EAP" />
            <DescriptionField value={editForm.description} onChange={v => setEditForm(prev => ({ ...prev, description: v }))} />
            <DateFields
              startDate={editForm.startDate} endDate={editForm.endDate}
              onChangeStart={v => setEditForm(prev => ({ ...prev, startDate: v }))}
              onChangeEnd={v => setEditForm(prev => ({ ...prev, endDate: v }))}
            />
            <StatusField value={editForm.status} onChange={v => setEditForm(prev => ({ ...prev, status: v }))} />
            <ColorField value={editForm.color} onChange={v => setEditForm(prev => ({ ...prev, color: v }))} />
          </FormModal>
        )}
      </>
    );
  }

  function renderDeleteModal() {
    if (!deleteTarget) return null;
    return (
      <DeleteModal
        targetName={deleteTarget.name}
        targetType={deleteTarget.type === 'folder' ? 'projeto' : 'EAP'}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleConfirmDelete}
        isPending={deleteTarget.type === 'folder' ? deleteFolderMut.isPending : deleteProjectMut.isPending}
      />
    );
  }

}
