/**
 * FinancialPage -> Projetos + Kanban de Ordens de Servico (O.S.)
 * - Tela 1: Grid de Projetos (estilo Finder)
 * - Tela 2: Kanban por prioridade (filtrado por projeto)
 * - Tela 3: Documento O.S. oficial
 */

import { useState, useEffect, useMemo, useRef, memo, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import {
  useOSOrders, useOSSectors, useOSProjects, useTeamMembers, useAgendaEvents, useClients, queryKeys,
} from '../../hooks/queries';
import {
  createOSSector, updateOSSector, deleteOSSector,
  createOSProject, updateOSProject, deleteOSProject,
  createOSOrder, updateOSOrder, deleteOSOrder, updateOSOrdersBatch,
  clearProjectFromOrders, clearSectorFromProjects,
  setItemDueAt, setItemAssignee,
} from '../../lib/osService';
import { toast } from '../../contexts/ToastContext';
import { useProfile } from '../../hooks/useProfile';
import { shortName } from '../../lib/teamService';
import { namesMatch, calcWorkingHoursBetween, calcChecklistItemMinutes } from '../../lib/kpiUtils';
import { MANAGER_ROLES } from '../../lib/roleUtils';
import { notifyOSAssigned, notifyOSCompleted, notifyOSBlocked, notifyOSUpdated, notifyOSCreated, notifyTaskReady } from '../../lib/notificationTriggers';
import { usePermissions } from '../../contexts/PermissionContext';
import logoFyness from '../../assets/logo-fyness.png';
import { useRealtimeOSOrders, useRealtimeTeamMembers } from '../../hooks/useRealtimeSubscription';
import AutoTextarea from '../../components/ui/AutoTextarea';
import NotionEditor, { stripHtml } from '../../components/ui/NotionEditor';
import SaveAsTemplate from '../../components/templates/SaveAsTemplate';
import TemplatePicker from '../../components/templates/TemplatePicker';
import DeleteModal from './components/DeleteModal';
import ProjectFormModal from './components/ProjectFormModal';
import SectorFormModal from './components/SectorFormModal';
import OSPreviewDocument from './components/OSPreviewDocument';
import RichTextDisplay from './components/RichTextDisplay';
import BriefingDrawer from './components/BriefingDrawer';
import { formatHM, getOrderAssigneeNames, calcOSCost, calcOSHours, getMemberHourlyRate } from './components/helpers';
import { sanitizeRichText, validateStatusTransition } from '../../lib/validation';
import {
  PRIORITIES_LIST as PRIORITIES, OS_STATUS_LABELS as STATUS_LABELS,
  PRIORITY_COLUMNS, CATEGORIES, BLOCK_REASONS,
  SECTOR_COLORS, PROJECT_COLORS,
} from '../../constants/colors';
import { sortByDeadline } from '../../lib/orderSorting';

const EMPTY_FORM = {
  title: '',
  description: '',
  checklist: [],
  priority: 'medium',
  category: 'internal',
  client: '',
  clientId: '',
  location: '',
  notes: '',
  assignedTo: '',
  supervisor: '',
  judge: '',
  estimatedStart: '',
  estimatedEnd: '',
  attachments: [],
  projectId: null,
  parentOrderId: null,
  blockReason: null,
  dependsOn: [],
};

const EMPTY_PROJECT_FORM = {
  name: '',
  sector: '',
  color: '#3b82f6',
  description: '',
  status: 'active',
  projectType: 'execution',
};

import { formatDateTime as formatDate, formatDateSmart as formatDateShort, formatCurrency, toDatetimeLocal } from '../../lib/formatters';
import { STANDARD_MONTHLY_HOURS } from '../../constants/sla';
import { FolderIcon, InboxIcon } from '../../components/icons/FinancialIcons';
import GroupAssigneeButton from '../../components/os/GroupAssigneeButton';
import DueDateButton from '../../components/os/DueDateButton';
import { recordTaskCompletion, recordTaskReview, removeTaskCompletion } from '../../lib/taskMetricsService';
import { scoreQualityChecklist } from '../../lib/qualityChecklist';
import { setBriefing as setBriefingItem, setDelivery as setDeliveryItem, applyReview, applyQualityDraft, fileDispute as fileDisputeItem, resolveDispute as resolveDisputeItem } from '../../lib/osReview';
import { startTask, pauseTask, resumeTask, finishTask, reopenTask, workedMinutes, workedSeconds, timerState } from '../../lib/osTimer';

// Cronômetro AO VIVO (tica a cada 1s, isolado pra não re-renderizar a O.S. inteira).
const fmtClock = (s) => {
  s = Math.max(0, Math.floor(s));
  const h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60), ss = s % 60;
  const p = (n) => String(n).padStart(2, '0');
  return h ? `${h}:${p(m)}:${p(ss)}` : `${m}:${p(ss)}`;
};
function LiveWorkedTime({ item, className }) {
  const [, force] = useState(0);
  useEffect(() => {
    const id = setInterval(() => force((n) => n + 1), 1000);
    return () => clearInterval(id);
  }, []);
  return <span className={className} title="Cronômetro rodando">{fmtClock(workedSeconds(item))}</span>;
}

const EMPTY_SECTOR_FORM = {
  label: '',
  color: '#3b82f6',
};


// ==================== COMPONENTE PRINCIPAL ====================

export default function FinancialPage() {
  const queryClient = useQueryClient();
  const location = useLocation();
  const navigate = useNavigate();

  // React Query: data fetching
  const { data: orders = [], isLoading: loadingOrders } = useOSOrders();
  const { data: projects = [], isLoading: loadingProjects } = useOSProjects();
  const { data: sectors = [], isLoading: loadingSectors } = useOSSectors();
  const { data: teamMembers = [], isLoading: loadingMembers } = useTeamMembers();
  const { data: agendaEvents = [], isLoading: loadingEvents } = useAgendaEvents();
  const { data: clients = [] } = useClients();

  // Perfil do usuario
  const { profile } = useProfile();

  // Realtime: atualiza automaticamente quando dados mudam no Supabase
  useRealtimeOSOrders();
  useRealtimeTeamMembers();

  // Loading combinado
  const loading = loadingOrders || loadingProjects || loadingSectors || loadingMembers || loadingEvents;

  const [viewingOrder, setViewingOrder] = useState(null);
  const openedFromExternalRef = useRef(false);
  // Tarefa a abrir o briefing direto (quando navegado da Agenda clicando num prazo).
  const [pendingBriefingTaskId, setPendingBriefingTaskId] = useState(null);

  // Auto-abrir OS quando navegado da Agenda com state.openOsId (+ briefing da tarefa)
  useEffect(() => {
    const osId = location.state?.openOsId;
    if (!osId || loading) return;
    const os = orders.find(o => o.id === osId);
    if (os) {
      setViewingOrder(os);
      setPendingBriefingTaskId(location.state?.openTaskId || null);
      openedFromExternalRef.current = true;
      // Limpar o state para nao reabrir ao voltar
      window.history.replaceState({}, '');
    }
  }, [location.state?.openOsId, location.state?.openTaskId, orders, loading]);

  const [selectedProject, setSelectedProject] = useState(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingOrder, setEditingOrder] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(null);
  const [saving, setSaving] = useState(false);
  const [filterMember, setFilterMember] = useState('all');
  // Nome do usuario atual para assignee: prioriza nome do team_member (match por profile.name)
  const currentUser = useMemo(() => {
    if (!profile.name) return '';
    const match = teamMembers.find(m => namesMatch(m.name, profile.name));
    return match ? match.name : profile.name;
  }, [profile.name, teamMembers]);
  const [form, setForm] = useState({ ...EMPTY_FORM });
  const [showDone, setShowDone] = useState(false);
  const [donePage, setDonePage] = useState(0);
  const [doneSearch, setDoneSearch] = useState('');
  const CARDS_PER_COL = 20;
  const [expandedCols, setExpandedCols] = useState({});
  const [draggingId, setDraggingId] = useState(null);
  const [dragOverCol, setDragOverCol] = useState(null);
  const [dropTarget, setDropTarget] = useState(null);
  // Project management
  const [showProjectForm, setShowProjectForm] = useState(false);
  const [editingProject, setEditingProject] = useState(null);
  const [projectForm, setProjectForm] = useState({ ...EMPTY_PROJECT_FORM });
  const [sectorFilter, setSectorFilter] = useState(null);
  const [sectorInitialized, setSectorInitialized] = useState(false);
  const [projectSearch, setProjectSearch] = useState('');
  const [showDeleteProjectModal, setShowDeleteProjectModal] = useState(null);
  // Sector management
  const [showSectorForm, setShowSectorForm] = useState(false);
  const [editingSector, setEditingSector] = useState(null);
  const [sectorForm, setSectorForm] = useState({ ...EMPTY_SECTOR_FORM });
  const [showDeleteSectorModal, setShowDeleteSectorModal] = useState(null);

  // Selecionar primeiro setor automaticamente
  useEffect(() => {
    if (!sectorInitialized && sectors.length > 0) {
      setSectorFilter(sectors[0].id);
      setSectorInitialized(true);
    }
  }, [sectors, sectorInitialized]);

  // Preview de O.S. antes de confirmar (fluxo: form -> preview -> confirmar)
  const [pendingOrder, setPendingOrder] = useState(null);
  // Modo emergencial do formulario
  const [emergencyFormMode, setEmergencyFormMode] = useState(false);
  // Collapse state para grupos WBS

  // Callbacks memoizados para OSCard (evita re-renders desnecessarios com memo)
  const handleCardClick = useCallback((order) => setViewingOrder(order), []);
  const handleDragStartCard = useCallback((id) => setDraggingId(id), []);
  const handleDragEndCard = useCallback(() => { setDraggingId(null); setDragOverCol(null); setDropTarget(null); }, []);
  const handleCardDragOver = useCallback((cardId, position) => setDropTarget({ cardId, position }), []);
  const noop = useCallback(() => {}, []);

  const isManager = useMemo(() => {
    const r = (profile.role || '').toLowerCase().trim();
    if (!r) return false;
    return MANAGER_ROLES.some(m => r.includes(m));
  }, [profile]);

  // Permissoes granulares (substituem isManager para acoes especificas)
  const { hasPermission } = usePermissions();
  const canCreateOS = hasPermission('os.create');
  const canEditOS = hasPermission('os.edit');
  const canDeleteOS = hasPermission('os.delete');
  const canManageProjects = hasPermission('os.manage_projects');
  const canViewCosts = hasPermission('financial.view_costs');

  // Lista completa: membros cadastrados + perfil logado (se nao estiver na lista)
  const allMembers = useMemo(() => {
    if (!profile.name) return teamMembers;
    const alreadyIn = teamMembers.some(m => namesMatch(m.name, profile.name));
    if (alreadyIn) return teamMembers;
    return [{ id: 'profile_self', name: profile.name, role: profile.role || '', color: '#3b82f6' }, ...teamMembers];
  }, [teamMembers, profile]);

  const nextNumber = useMemo(() => {
    return orders.reduce((acc, o) => Math.max(acc, o.number || 0), 0) + 1;
  }, [orders]);

  const nextEmergencyNumber = useMemo(() => {
    return orders
      .filter(o => o.type === 'emergency')
      .reduce((acc, o) => Math.max(acc, o.emergencyNumber || 0), 0) + 1;
  }, [orders]);

  // Ordens filtradas pelo projeto selecionado
  const projectOrders = useMemo(() => {
    if (!selectedProject) return orders;
    if (selectedProject.id === '__no_project__') {
      return orders.filter(o => !o.projectId);
    }
    return orders.filter(o => o.projectId === selectedProject.id);
  }, [orders, selectedProject]);

  const filteredOrders = useMemo(() => {
    if (filterMember === 'all') return projectOrders;
    const memberName = allMembers.find(m => m.id === filterMember)?.name;
    if (!memberName) return projectOrders;
    // Resolve por NOME como o resto da pagina (getOrderAssigneeNames cobre time
    // via participants[] e solo via assignee). O antigo `o.assignedTo === memberName`
    // era morto (assignedTo guarda UUID) e escondia toda O.S. de time/pool.
    return projectOrders.filter(o =>
      getOrderAssigneeNames(o).some(n => namesMatch(n, memberName)) ||
      namesMatch(o.assignee, memberName)
    );
  }, [projectOrders, filterMember, allMembers]);

  const activeOrders = useMemo(() => {
    return filteredOrders.filter(o => o.status !== 'done' && o.type !== 'emergency');
  }, [filteredOrders]);

  const emergencyOrders = useMemo(() => {
    return filteredOrders.filter(o => o.type === 'emergency' && o.status !== 'done');
  }, [filteredOrders]);

  const doneOrders = useMemo(() => {
    return filteredOrders.filter(o => o.status === 'done');
  }, [filteredOrders]);

  const filteredDoneOrders = useMemo(() => {
    if (!doneSearch) return doneOrders;
    const q = doneSearch.toLowerCase();
    return doneOrders.filter(o =>
      o.title?.toLowerCase().includes(q) ||
      o.client?.toLowerCase().includes(q) ||
      String(o.number).includes(doneSearch)
    );
  }, [doneOrders, doneSearch]);

  const ordersByColumn = useMemo(() => {
    const grouped = {};
    PRIORITY_COLUMNS.forEach(col => {
      grouped[col.id] = activeOrders
        .filter(o => col.priorities.includes(o.priority))
        // Ordenar por data de conclusao prevista (estimatedEnd)
        .sort((a, b) => sortByDeadline(a, b));
    });
    return grouped;
  }, [activeOrders]);

  // Contagem continua: urgente/alta -> media -> baixa
  const sequenceMap = useMemo(() => {
    const map = {};
    let seq = 1;
    PRIORITY_COLUMNS.forEach(col => {
      (ordersByColumn[col.id] || []).forEach(o => {
        map[o.id] = seq++;
      });
    });
    return map;
  }, [ordersByColumn]);

  // Projetos filtrados
  const filteredProjects = useMemo(() => {
    let list = projects;
    if (sectorFilter) {
      list = list.filter(p => p.sector === sectorFilter);
    }
    if (projectSearch.trim()) {
      const q = projectSearch.trim().toLowerCase();
      list = list.filter(p => p.name.toLowerCase().includes(q) || (p.description || '').toLowerCase().includes(q));
    }
    return list;
  }, [projects, sectorFilter, projectSearch]);

  // O.S. sem projeto
  const orphanOrders = useMemo(() => {
    return orders.filter(o => !o.projectId);
  }, [orders]);

  // ==================== HANDLERS O.S. ====================

  const openCreate = () => {
    setEditingOrder(null);
    setEmergencyFormMode(false);
    setForm({ ...EMPTY_FORM, projectId: selectedProject?.id === '__no_project__' ? null : (selectedProject?.id || null) });
    setShowCreateForm(true);
  };

  const openCreateEmergency = () => {
    setEditingOrder(null);
    setEmergencyFormMode(true);
    setForm({ ...EMPTY_FORM, priority: 'urgent', projectId: selectedProject?.id === '__no_project__' ? null : (selectedProject?.id || null) });
    setShowCreateForm(true);
  };

  // Reconstroi o CSV de NOMES que o seletor "Atribuir a" usa, a partir do estado real
  // da O.S. (a coluna assigned_to guarda UUID; o form trabalha com nomes).
  const assignedNamesFromOrder = (order) => {
    if (order?.participants?.length) return order.participants.map(p => p.name).filter(Boolean).join(', ');
    if (order?.assignee) return order.assignee;
    if (order?.assignedTo) {
      const m = teamMembers.find(tm => tm.authUserId === order.assignedTo);
      if (m) return m.name;
    }
    return '';
  };

  // Converte o CSV de nomes do form em mode/participants/assignee/assignedTo pra persistir.
  // assigned_to e UUID de auth.users; em team participants[] e a fonte de verdade.
  const deriveAssignment = (assignedToCsv) => {
    const memberNames = (assignedToCsv || '').split(',').map(s => s.trim()).filter(Boolean);
    const members = memberNames
      .map(n => teamMembers.find(m => namesMatch(m.name, n)))
      .filter(Boolean)
      .map(m => ({ id: m.authUserId || null, name: m.name }));
    let mode = 'pool';
    if (members.length === 1) mode = 'solo';
    else if (members.length >= 2) mode = 'team';
    const assignment = mode === 'team'
      ? { assignedTo: null, assignee: null }
      : mode === 'solo'
        ? { assignedTo: members[0].id, assignee: members[0].name }
        : { assignedTo: null, assignee: null };
    return { mode, participants: members, ...assignment };
  };

  const openEdit = (order) => {
    setEditingOrder(order);
    setForm({
      title: order.title,
      description: order.description || '',
      checklist: order.checklist || [],
      priority: order.priority || 'medium',
      category: order.category || 'internal',
      client: order.client || '',
      clientId: order.clientId || '',
      location: order.location || '',
      notes: order.notes || '',
      assignedTo: assignedNamesFromOrder(order),
      supervisor: order.supervisor || '',
      judge: order.judge || '',
      estimatedStart: toDatetimeLocal(order.estimatedStart),
      estimatedEnd: toDatetimeLocal(order.estimatedEnd),
      attachments: order.attachments || [],
      projectId: order.projectId || null,
      parentOrderId: order.parentOrderId || null,
      blockReason: order.blockReason || null,
      dependsOn: order.dependsOn || [],
    });
    setShowCreateForm(true);
  };

  const handleDuplicate = (order) => {
    setEditingOrder(null); // create mode, not edit
    setEmergencyFormMode(false);
    setForm({
      title: `${order.title} (copia)`,
      description: order.description || '',
      checklist: (order.checklist || []).map((item, i) => ({
        ...item,
        id: Date.now() + i,
        done: false,
        startedAt: null,
        completedAt: null,
        durationMin: null,
        pausedAt: null,
        accumulatedMin: 0,
      })),
      priority: order.priority || 'medium',
      category: order.category || 'internal',
      client: order.client || '',
      clientId: order.clientId || '',
      location: order.location || '',
      notes: order.notes || '',
      assignedTo: assignedNamesFromOrder(order),
      supervisor: order.supervisor || '',
      judge: order.judge || '',
      estimatedStart: order.estimatedStart || '',
      estimatedEnd: order.estimatedEnd || '',
      attachments: order.attachments || [],
      projectId: order.projectId || null,
      parentOrderId: null,
      blockReason: null,
      dependsOn: [],
    });
    setViewingOrder(null);
    setShowCreateForm(true);
  };

  const handleSave = async (formOverride) => {
    const currentForm = formOverride || form;
    if (!currentForm.title.trim() || saving) return;
    // Responsavel e prazo de entrega sao opcionais: a O.S. nasce em andamento e o
    // prazo da O.S. deriva do maior prazo das tarefas.
    setSaving(true);
    try {

    if (editingOrder) {
      // Edicao: converte o CSV de nomes do form em mode/participants/assignee/assignedTo.
      const editPayload = { ...currentForm, ...deriveAssignment(currentForm.assignedTo) };
      const updated = await updateOSOrder(editingOrder.id, editPayload);
      if (updated) {
        queryClient.setQueryData(queryKeys.osOrders, prev => (prev || []).map(o => o.id === editingOrder.id ? updated : o));
        if (viewingOrder?.id === editingOrder.id) {
          setViewingOrder(updated);
        }
        notifyOSUpdated(updated, currentForm, allMembers, profile.id);
      }
      setShowCreateForm(false);
    } else {
      // Criacao: mostra preview antes de confirmar. A O.S. nasce "em andamento".
      // Previsao de Inicio/Entrega sao opcionais (definem o periodo previsto).
      const previewData = {
        id: `preview_${Date.now()}`,
        number: emergencyFormMode ? null : nextNumber,
        ...currentForm,
        type: emergencyFormMode ? 'emergency' : 'normal',
        emergencyNumber: emergencyFormMode ? nextEmergencyNumber : null,
        parentOrderId: currentForm.parentOrderId || null,
        priority: emergencyFormMode ? 'urgent' : currentForm.priority,
        status: 'in_progress',
        assignee: null,
        sortOrder: orders.length,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      setPendingOrder(previewData);
      setShowCreateForm(false);
    }
    } finally { setSaving(false); }
  };

  const handleConfirmOrder = async () => {
    if (!pendingOrder) return;
    const { id: _previewId, ...orderData } = pendingOrder;

    // Converte o CSV de nomes do form em mode/participants/assignee/assignedTo.
    const payload = { ...orderData, ...deriveAssignment(orderData.assignedTo) };

    const newOrder = await createOSOrder(payload);
    if (newOrder) {
      // Assinatura NAO acontece na criacao — cada participante precisa
      // clicar "Pegar O.S." manualmente pra confirmar/assinar.
      queryClient.setQueryData(queryKeys.osOrders, prev => [...(prev || []), newOrder]);
      notifyOSCreated(newOrder, allMembers, profile.id);
    }
    setPendingOrder(null);
  };

  const handleCancelPreview = () => {
    setPendingOrder(null);
  };

  const handleEditPreview = () => {
    // Volta pro form com os dados preenchidos
    setEmergencyFormMode(pendingOrder.type === 'emergency');
    setForm({
      title: pendingOrder.title || '',
      description: pendingOrder.description || '',
      checklist: pendingOrder.checklist || [],
      priority: pendingOrder.priority || 'medium',
      category: pendingOrder.category || 'internal',
      client: pendingOrder.client || '',
      clientId: pendingOrder.clientId || '',
      location: pendingOrder.location || '',
      notes: pendingOrder.notes || '',
      assignedTo: pendingOrder.assignedTo || '',
      supervisor: pendingOrder.supervisor || '',
      judge: pendingOrder.judge || '',
      estimatedStart: pendingOrder.estimatedStart || '',
      estimatedEnd: pendingOrder.estimatedEnd || '',
      attachments: pendingOrder.attachments || [],
      projectId: pendingOrder.projectId || null,
      parentOrderId: pendingOrder.parentOrderId || null,
      blockReason: pendingOrder.blockReason || null,
      dependsOn: pendingOrder.dependsOn || [],
    });
    setPendingOrder(null);
    setShowCreateForm(true);
  };

  const handleDelete = async (id) => {
    await deleteOSOrder(id);
    queryClient.setQueryData(queryKeys.osOrders, prev => (prev || []).filter(o => o.id !== id));
    setShowDeleteModal(null);
    if (viewingOrder?.id === id) setViewingOrder(null);
  };

  // Concluir O.S.: qualquer status ativo (in_progress ou legado available) -> done.
  // O tempo real vem das tarefas (checklist); aqui so marcamos a conclusao (actualEnd),
  // que os relatorios/KPIs usam para situar a O.S. no mes.
  const handleMoveForward = async (orderId) => {
    const now = new Date().toISOString();
    const order = orders.find(o => o.id === orderId);
    if (!order) return;
    if (order.status === 'done') return;
    const check = validateStatusTransition(order, 'done');
    if (!check.ok) { toast.error(check.error); return; }
    const updated = await updateOSOrder(orderId, { status: 'done', actualEnd: now });
    if (updated) {
      queryClient.setQueryData(queryKeys.osOrders, prev => (prev || []).map(o => o.id === orderId ? updated : o));
      if (viewingOrder?.id === orderId) setViewingOrder(updated);
      // Notificar managers quando OS e concluida
      notifyOSCompleted(updated, allMembers, currentUser, profile.id);
    }
  };

  // Reabrir O.S. concluida -> volta para em andamento (limpa a data de conclusao).
  const handleMoveBack = async (orderId) => {
    const order = orders.find(o => o.id === orderId);
    if (!order || order.status !== 'done') return;
    const updated = await updateOSOrder(orderId, { status: 'in_progress', actualEnd: '' });
    if (updated) {
      queryClient.setQueryData(queryKeys.osOrders, prev => (prev || []).map(o => o.id === orderId ? updated : o));
      if (viewingOrder?.id === orderId) setViewingOrder(updated);
    }
  };

  const handleDrop = async (draggedId, targetColumn, targetCardId, position) => {
    const draggedOrder = orders.find(o => o.id === draggedId);
    if (!draggedOrder) return;

    const newPriority = targetColumn.priorities.includes(draggedOrder.priority)
      ? draggedOrder.priority
      : targetColumn.priorities[targetColumn.priorities.length - 1];

    const colCards = orders
      .filter(o => o.id !== draggedId && targetColumn.priorities.includes(
        o.id === draggedId ? newPriority : o.priority
      ))
      .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));

    let insertIndex = colCards.length;
    if (targetCardId) {
      const targetIdx = colCards.findIndex(o => o.id === targetCardId);
      if (targetIdx !== -1) {
        insertIndex = position === 'before' ? targetIdx : targetIdx + 1;
      }
    }

    colCards.splice(insertIndex, 0, { ...draggedOrder, priority: newPriority });
    const newSortMap = {};
    colCards.forEach((o, i) => { newSortMap[o.id] = i; });

    // Atualizar localmente primeiro (UI responsiva)
    const updatedLocal = orders.map(o => {
      if (o.id === draggedId) {
        return { ...o, priority: newPriority, sortOrder: newSortMap[o.id] ?? o.sortOrder };
      }
      if (newSortMap[o.id] !== undefined) {
        return { ...o, sortOrder: newSortMap[o.id] };
      }
      return o;
    });
    queryClient.setQueryData(queryKeys.osOrders, updatedLocal);
    if (viewingOrder?.id === draggedId) {
      setViewingOrder(updatedLocal.find(x => x.id === draggedId));
    }

    // Salvar no banco apenas cards que mudaram
    const batchUpdates = [];
    batchUpdates.push({ id: draggedId, priority: newPriority, sortOrder: newSortMap[draggedId] ?? draggedOrder.sortOrder });
    for (const [id, sortOrder] of Object.entries(newSortMap)) {
      if (id === draggedId) continue;
      const original = orders.find(o => o.id === id);
      if (original && (original.sortOrder ?? 0) !== sortOrder) {
        batchUpdates.push({ id, sortOrder });
      }
    }
    await updateOSOrdersBatch(batchUpdates);
  };

  // ==================== HANDLERS PROJETOS ====================

  const openCreateProject = () => {
    setEditingProject(null);
    setProjectForm({ ...EMPTY_PROJECT_FORM });
    setShowProjectForm(true);
  };

  const openEditProject = (project) => {
    setEditingProject(project);
    setProjectForm({
      name: project.name,
      sector: project.sector,
      color: project.color,
      description: project.description || '',
      status: project.status || 'active',
      projectType: project.projectType || 'execution',
    });
    setShowProjectForm(true);
  };

  const handleSaveProject = async () => {
    if (!projectForm.name.trim() || !projectForm.sector) return;
    const payload = { ...projectForm };

    if (editingProject) {
      const updated = await updateOSProject(editingProject.id, payload);
      if (updated) {
        queryClient.setQueryData(queryKeys.osProjects, prev => (prev || []).map(p => p.id === editingProject.id ? updated : p));
        if (selectedProject?.id === editingProject.id) {
          setSelectedProject(updated);
        }
      }
    } else {
      const newProject = await createOSProject(payload);
      if (newProject) {
        queryClient.setQueryData(queryKeys.osProjects, prev => [...(prev || []), newProject]);
      }
    }
    setShowProjectForm(false);
  };

  const handleDeleteProject = async (id) => {
    await deleteOSProject(id);
    await clearProjectFromOrders(id);
    queryClient.setQueryData(queryKeys.osProjects, prev => (prev || []).filter(p => p.id !== id));
    queryClient.setQueryData(queryKeys.osOrders, prev => (prev || []).map(o => o.projectId === id ? { ...o, projectId: null } : o));
    setShowDeleteProjectModal(null);
    if (selectedProject?.id === id) setSelectedProject(null);
  };

  // ==================== HANDLERS SETORES ====================

  const openCreateSector = () => {
    setEditingSector(null);
    setSectorForm({ ...EMPTY_SECTOR_FORM });
    setShowSectorForm(true);
  };

  const openEditSector = (sector) => {
    setEditingSector(sector);
    setSectorForm({ label: sector.label, color: sector.color });
    setShowSectorForm(true);
  };

  const handleSaveSector = async () => {
    if (!sectorForm.label.trim()) return;

    if (editingSector) {
      const updated = await updateOSSector(editingSector.id, {
        label: sectorForm.label.trim(),
        color: sectorForm.color,
      });
      if (updated) {
        queryClient.setQueryData(queryKeys.osSectors, prev => (prev || []).map(s => s.id === editingSector.id ? updated : s));
      }
    } else {
      const newSector = await createOSSector({
        label: sectorForm.label.trim(),
        color: sectorForm.color,
      });
      if (newSector) {
        queryClient.setQueryData(queryKeys.osSectors, prev => [...(prev || []), newSector]);
      }
    }
    setShowSectorForm(false);
  };

  const handleDeleteSector = async (id) => {
    await deleteOSSector(id);
    await clearSectorFromProjects(id);
    queryClient.setQueryData(queryKeys.osSectors, prev => (prev || []).filter(s => s.id !== id));
    queryClient.setQueryData(queryKeys.osProjects, prev => (prev || []).map(p => p.sector === id ? { ...p, sector: '' } : p));
    if (selectedProject?.sector === id) {
      setSelectedProject({ ...selectedProject, sector: '' });
    }
    setShowDeleteSectorModal(null);
    if (sectorFilter === id) {
      const remaining = sectors.filter(s => s.id !== id);
      setSectorFilter(remaining.length > 0 ? remaining[0].id : null);
    }
  };

  // ==================== RENDER ====================

  // Loading
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-10 h-10 border-4 border-fyness-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // Tela Preview: pre-visualizacao antes de confirmar criacao
  if (pendingOrder) {
    const projectName = projects.find(p => p.id === pendingOrder.projectId)?.name || null;
    return (
      <OSPreviewDocument
        order={pendingOrder}
        projectName={projectName}
        profileName={profile.name || ''}
        profileCpf={profile.cpf || ''}
        teamMembers={allMembers}
        allOrders={orders}
        onConfirm={handleConfirmOrder}
        onEdit={handleEditPreview}
        onCancel={handleCancelPreview}
      />
    );
  }

  // Tela 3: Documento O.S.
  if (viewingOrder) {
    // Pega versao FRESCA da lista (react-query) — assim invalidate atualiza a tela
    const freshOrder = orders.find(o => o.id === viewingOrder.id) || viewingOrder;
    const projectName = projects.find(p => p.id === freshOrder.projectId)?.name || null;
    return (
      <>
        <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400 mb-4">
          <button onClick={() => { setViewingOrder(null); if (!selectedProject) setSelectedProject(null); }} className="hover:text-fyness-primary transition-colors">Projetos</button>
          <span>/</span>
          <button onClick={() => setViewingOrder(null)} className="hover:text-fyness-primary transition-colors">{selectedProject?.name || 'Kanban'}</button>
          <span>/</span>
          <span className="text-slate-800 dark:text-slate-100 font-medium">O.S. #{freshOrder.number}</span>
        </div>
        <OSDocument
          order={freshOrder}
          currentUser={currentUser}
          projectName={projectName}
          isManager={isManager}
          canEditOS={canEditOS}
          canDeleteOS={canDeleteOS}
          canViewCosts={canViewCosts}
          profileName={profile.name || ''}
          profileCpf={profile.cpf || ''}
          profileId={profile.id || null}
          teamMembers={allMembers}
          allOrders={orders}
          initialBriefingItemId={pendingBriefingTaskId}
          onConsumeInitialBriefing={() => setPendingBriefingTaskId(null)}
          onBack={() => {
            if (openedFromExternalRef.current) {
              openedFromExternalRef.current = false;
              navigate(-1);
            } else {
              setViewingOrder(null);
            }
          }}
          onDuplicate={() => handleDuplicate(viewingOrder)}
          onEdit={canEditOS ? () => openEdit(viewingOrder) : null}
          onMoveForward={canEditOS ? () => handleMoveForward(viewingOrder.id) : null}
          onMoveBack={canEditOS ? () => handleMoveBack(viewingOrder.id) : null}
          onDelete={canDeleteOS ? () => setShowDeleteModal(viewingOrder.id) : null}
          onViewOrder={(order) => setViewingOrder(order)}
          onUpdateOrder={async (id, updates) => {
            const oldOrder = orders.find(o => o.id === id);
            // Update otimista: atualiza UI imediatamente
            setViewingOrder(prev => prev ? { ...prev, ...updates, updatedAt: new Date().toISOString() } : prev);
            queryClient.setQueryData(queryKeys.osOrders, prev => (prev || []).map(o => o.id === id ? { ...o, ...updates, updatedAt: new Date().toISOString() } : o));
            // Salvar no servidor
            const saved = await updateOSOrder(id, updates);
            if (saved) {
              // Sincronizar com dados reais do servidor
              queryClient.setQueryData(queryKeys.osOrders, prev => (prev || []).map(o => o.id === id ? saved : o));
              setViewingOrder(prev => (prev && prev.id === id) ? saved : prev);
              // Gatilhos de notificacao
              if (updates.assignedTo && updates.assignedTo !== oldOrder?.assignedTo) {
                notifyOSAssigned(saved, updates.assignedTo, allMembers, profile.id);
              }
              if (updates.status === 'blocked' && oldOrder?.status !== 'blocked') {
                notifyOSBlocked(saved, updates.blockReason, allMembers, profile.id);
              }
              if (updates.status === 'done' && oldOrder?.status !== 'done') {
                notifyOSCompleted(saved, allMembers, currentUser, profile.id);
              }
              notifyOSUpdated(saved, updates, allMembers, profile.id);
            } else {
              // Falhou: refetch para restaurar estado correto
              toast('Erro ao salvar alteracao', 'error');
              queryClient.invalidateQueries({ queryKey: queryKeys.osOrders });
            }
          }}
        />
        {showCreateForm && (
          <OSFormModal
            form={form}
            setForm={setForm}
            editing={!!editingOrder}
            number={editingOrder?.number || nextNumber}
            projects={projects}
            teamMembers={allMembers}
            clients={clients}
            onSave={handleSave}
            profileName={profile.name || ''}
            onClose={() => { setShowCreateForm(false); setEditingOrder(null); setEmergencyFormMode(false); }}
            onDelete={canDeleteOS && editingOrder ? () => { setShowDeleteModal(editingOrder.id); setShowCreateForm(false); } : null}
            isEmergency={emergencyFormMode}
            emergencyNumber={nextEmergencyNumber}
            allOrders={orders}
            saving={saving}
          />
        )}
        {showDeleteModal && (
          <DeleteModal
            title="Excluir O.S.?"
            message="Esta acao nao pode ser desfeita."
            onCancel={() => setShowDeleteModal(null)}
            onConfirm={() => handleDelete(showDeleteModal)}
          />
        )}
      </>
    );
  }

  // Tela 2: Kanban do projeto selecionado
  if (selectedProject) {
    const sector = sectors.find(s => s.id === selectedProject.sector);
    return (
      <div className="h-full flex flex-col">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400 mb-4">
          <button onClick={() => setSelectedProject(null)} className="hover:text-fyness-primary transition-colors">Projetos</button>
          <span>/</span>
          <span className="text-slate-800 dark:text-slate-100 font-medium">{selectedProject.name}</span>
        </div>
        {/* Header do Kanban */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => { setSelectedProject(null); setFilterMember('all'); setShowDone(false); }}
              className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300 hover:text-slate-800 dark:hover:text-slate-100 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Projetos
            </button>
            <div className="w-px h-6 bg-slate-200 dark:bg-slate-700" />
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: selectedProject.color }} />
              <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100">{selectedProject.name}</h2>
              {sector && (
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full text-white" style={{ backgroundColor: sector.color }}>
                  {sector.label}
                </span>
              )}
            </div>
            {canCreateOS && (
              <>
              <button onClick={openCreate} className="flex items-center gap-2 px-4 py-2 bg-fyness-primary text-white rounded-lg hover:bg-fyness-secondary transition-colors text-sm font-medium shadow-sm">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Nova O.S.
              </button>
              <button onClick={openCreateEmergency} className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-medium shadow-sm animate-pulse hover:animate-none">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
                Emergencial
              </button>
              </>
            )}
            <span className="text-sm text-slate-500 dark:text-slate-400">{projectOrders.length} ordem{projectOrders.length !== 1 ? 's' : ''}</span>
          </div>

          <div className="flex items-center gap-2">
            {canManageProjects && selectedProject.id !== '__no_project__' && (
              <button
                onClick={() => openEditProject(selectedProject)}
                className="p-1.5 text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
                title="Editar projeto"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </button>
            )}
            <label htmlFor="filter-member" className="text-xs font-medium text-slate-500 dark:text-slate-400">Filtrar:</label>
            <div className="relative">
              <select
                id="filter-member"
                value={filterMember}
                onChange={(e) => setFilterMember(e.target.value)}
                className="appearance-none pl-3 pr-8 py-1.5 text-sm border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-fyness-primary focus:border-transparent cursor-pointer"
              >
                <option value="all">Todos</option>
                {allMembers.map(m => (
                  <option key={m.id} value={m.id}>{shortName(m.name)}</option>
                ))}
              </select>
              <svg className="w-4 h-4 text-slate-400 dark:text-slate-500 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
            {filterMember !== 'all' && (
              <div className="flex items-center gap-1.5 px-2.5 py-1 text-xs rounded-full font-medium text-white shadow-sm" style={{ backgroundColor: allMembers.find(m => m.id === filterMember)?.color || '#3b82f6' }}>
                <div className="w-2 h-2 rounded-full bg-white/70" />
                {shortName(allMembers.find(m => m.id === filterMember)?.name)}
                <button onClick={() => setFilterMember('all')} className="ml-1 hover:bg-white/20 rounded-full p-0.5 transition-colors">
                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Area scrollavel com todo o conteudo */}
        <div className="flex-1 overflow-y-auto overscroll-contain min-h-0">

        {/* Secao Emergencial */}
        {emergencyOrders.length > 0 && (
          <div className="mb-4 rounded-xl border-2 border-red-500 dark:border-red-600 bg-red-50 dark:bg-red-950/30 overflow-hidden animate-pulse-subtle">
            <div className="bg-gradient-to-r from-red-600 to-red-700 px-4 py-3 flex items-center gap-2">
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">Emergenciais</h3>
              <span className="bg-white/20 text-white text-xs px-2 py-0.5 rounded-full font-medium">{emergencyOrders.length}</span>
            </div>
            <div className="p-3 flex flex-wrap gap-3">
              {emergencyOrders.map(order => (
                <OSCard
                  key={order.id}
                  order={order}
                  teamMembers={allMembers}
                  seqNumber={null}
                  onClick={() => handleCardClick(order)}
                  isDragging={false}
                  dropPosition={null}
                  onDragStart={noop}
                  onDragEnd={noop}
                  onCardDragOver={noop}
                  allOrders={orders}
                      />
              ))}
            </div>
          </div>
        )}

        {/* Kanban por Prioridade */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 min-h-[400px]">
          {PRIORITY_COLUMNS.map((column) => {
            const colOrders = ordersByColumn[column.id] || [];
            const isOver = dragOverCol === column.id && !dropTarget;
            return (
              <div
                key={column.id}
                className={`flex flex-col rounded-2xl border overflow-hidden transition-all duration-200 ${
                  isOver
                    ? 'border-fyness-primary bg-fyness-primary/10 shadow-lg ring-1 ring-fyness-primary/30'
                    : 'border-slate-200 dark:border-slate-700 bg-slate-100/70 dark:bg-slate-900/40 shadow-sm'
                }`}
                onDragOver={(e) => { e.preventDefault(); setDragOverCol(column.id); }}
                onDragEnter={(e) => { e.preventDefault(); setDragOverCol(column.id); }}
                onDragLeave={(e) => {
                  if (!e.currentTarget.contains(e.relatedTarget)) {
                    setDragOverCol(null);
                    setDropTarget(null);
                  }
                }}
                onDrop={(e) => {
                  e.preventDefault();
                  const draggedId = e.dataTransfer.getData('text/plain');
                  if (draggedId) {
                    handleDrop(draggedId, column, dropTarget?.cardId, dropTarget?.position);
                  }
                  setDragOverCol(null);
                  setDropTarget(null);
                  setDraggingId(null);
                }}
              >
                <div className={`bg-gradient-to-r ${column.color} px-4 py-3 flex items-center gap-2`}>
                  <h3 className="text-sm font-semibold text-white">{column.title}</h3>
                  <span className="bg-white/20 text-white text-xs px-2 py-0.5 rounded-full font-medium">{colOrders.length}</span>
                </div>
                <div className={`flex-1 p-3 space-y-0 min-h-[100px] ${isOver ? 'bg-fyness-primary/5' : ''}`}>
                  {colOrders.length === 0 ? (
                    <div className={`text-center py-8 text-sm ${isOver ? 'text-fyness-primary font-medium' : 'text-slate-400 dark:text-slate-500'}`}>
                      {isOver ? 'Soltar aqui' : column.emptyText}
                    </div>
                  ) : (
                    <>
                      {(expandedCols[column.id] ? colOrders : colOrders.slice(0, CARDS_PER_COL)).map(order => (
                        <OSCard
                          key={order.id}
                          order={order}
                          teamMembers={allMembers}
                          seqNumber={sequenceMap[order.id]}
                          onClick={() => handleCardClick(order)}
                          isDragging={draggingId === order.id}
                          dropPosition={dropTarget?.cardId === order.id ? dropTarget.position : null}
                          onDragStart={() => handleDragStartCard(order.id)}
                          onDragEnd={handleDragEndCard}
                          onCardDragOver={(position) => handleCardDragOver(order.id, position)}
                          allOrders={orders}
                        />
                      ))}
                      {colOrders.length > CARDS_PER_COL && !expandedCols[column.id] && (
                        <button
                          onClick={() => setExpandedCols(prev => ({ ...prev, [column.id]: true }))}
                          className="w-full mt-2 py-2 text-xs font-medium text-fyness-primary hover:bg-fyness-primary/5 rounded-lg transition-colors"
                        >
                          Ver mais {colOrders.length - CARDS_PER_COL} O.S.
                        </button>
                      )}
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Secao Concluidas */}
        {doneOrders.length > 0 && (
          <div className="mt-4">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowDone(!showDone)}
                className="flex items-center gap-2 text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-slate-800 dark:hover:text-slate-100 transition-colors"
              >
                <svg className={`w-4 h-4 transition-transform ${showDone ? 'rotate-90' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
                <span className="flex items-center gap-2">
                  Concluidas
                  <span className="bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-xs px-2 py-0.5 rounded-full font-medium">{doneOrders.length}</span>
                </span>
              </button>
              {showDone && (
                <input
                  type="text"
                  placeholder="Buscar concluidas..."
                  value={doneSearch}
                  onChange={e => { setDoneSearch(e.target.value); setDonePage(0); }}
                  className="px-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-400 w-56"
                />
              )}
            </div>

            {showDone && (() => {
              const perPage = 15;
              const totalPages = Math.ceil(filteredDoneOrders.length / perPage);
              const page = Math.min(donePage, totalPages - 1);
              const pagedOrders = filteredDoneOrders.slice(page * perPage, (page + 1) * perPage);
              return (
                <div className="mt-3 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-700">
                        <th className="text-left px-4 py-2.5 text-[10px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">O.S.</th>
                        <th className="text-left px-4 py-2.5 text-[10px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Titulo</th>
                        <th className="text-left px-4 py-2.5 text-[10px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Cliente</th>
                        <th className="text-left px-4 py-2.5 text-[10px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Responsavel</th>
                        <th className="text-left px-4 py-2.5 text-[10px] font-semibold text-green-500 uppercase tracking-wider">Concluida em</th>
                        <th className="text-center px-4 py-2.5 text-[10px] font-semibold text-blue-400 uppercase tracking-wider">Previsto vs Real</th>
                        {canViewCosts && <th className="text-right px-4 py-2.5 text-[10px] font-semibold text-amber-500 uppercase tracking-wider">Custo</th>}
                      </tr>
                    </thead>
                    <tbody>
                      {pagedOrders.map(order => {
                        const _tm = allMembers.find(m => m.id === order.assignee || namesMatch(m.name, order.assignee));
                        const member = _tm || (order.assignee ? { id: order.assignee, name: order.assignee, color: '#3b82f6' } : null);
                        return (
                          <tr
                            key={order.id}
                            onClick={() => setViewingOrder(order)}
                            className="border-b border-slate-100 dark:border-slate-700 last:border-b-0 hover:bg-slate-50 dark:hover:bg-slate-700/50 cursor-pointer transition-colors"
                          >
                            <td className={`px-4 py-2.5 font-bold ${order.type === 'emergency' ? 'text-red-500 dark:text-red-400' : 'text-slate-400 dark:text-slate-500'}`}>
                              {order.type === 'emergency' ? `EMG-${String(order.emergencyNumber || 0).padStart(3, '0')}` : `#${order.number}`}
                            </td>
                            <td className="px-4 py-2.5 font-medium text-slate-800 dark:text-slate-100">{order.title}</td>
                            <td className="px-4 py-2.5 text-slate-500 dark:text-slate-400">{order.client || '-'}</td>
                            <td className="px-4 py-2.5">
                              <div className="flex flex-wrap gap-1">
                                {getOrderAssigneeNames(order).length > 0 ? (
                                  getOrderAssigneeNames(order).map((name, i) => {
                                    const m2 = allMembers.find(tm => namesMatch(tm.name, name));
                                    return (
                                      <span key={i} className="inline-flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400">
                                        {m2 && <span className="w-4 h-4 rounded-full text-white text-[8px] font-bold flex items-center justify-center" style={{ backgroundColor: m2.color || '#94a3b8' }}>{(m2.name || '?')[0]}</span>}
                                        {shortName(name)}
                                      </span>
                                    );
                                  })
                                ) : member ? (
                                  <div className="flex items-center gap-1.5">
                                    <div className="w-5 h-5 rounded-full flex items-center justify-center text-white text-[9px] font-bold" style={{ backgroundColor: member.color }}>{member.name.charAt(0)}</div>
                                    <span className="text-slate-600 dark:text-slate-300">{shortName(member.name)}</span>
                                  </div>
                                ) : (
                                  <span className="text-slate-400 dark:text-slate-500 italic">-</span>
                                )}
                              </div>
                            </td>
                            <td className="px-4 py-2.5 text-slate-600 dark:text-slate-300">{formatDate(order.actualEnd)}</td>
                            <td className="px-4 py-2.5 text-center">
                              {(() => {
                                const fmtDur = (h) => {
                                  if (!h || h <= 0) return '-';
                                  if (h < 1) return `${Math.round(h * 60)}min`;
                                  const hrs = Math.floor(h);
                                  const mins = Math.round((h - hrs) * 60);
                                  return mins > 0 ? `${hrs}h${mins}m` : `${hrs}h`;
                                };
                                const realHours = calcOSHours(order);
                                // Previsto: estimatedStart/End (horas uteis) ou leadTimeHours
                                let estHours = 0;
                                if (order.estimatedStart && order.estimatedEnd) {
                                  estHours = calcWorkingHoursBetween(order.estimatedStart, order.estimatedEnd);
                                }
                                if (!estHours && order.leadTimeHours) estHours = order.leadTimeHours;

                                if (!estHours && !realHours) return <span className="text-slate-400">-</span>;
                                if (!estHours) return <span className="text-slate-400 text-[10px]">Real: {fmtDur(realHours)}</span>;

                                const diff = realHours - estHours;
                                const isEarly = diff < 0;
                                const isLate = diff > 0;
                                return (
                                  <div className="flex flex-col items-center gap-0.5">
                                    <div className="flex items-center gap-2 text-[10px]">
                                      <span className="text-slate-400">{fmtDur(estHours)}</span>
                                      <span className="text-slate-500">→</span>
                                      <span className="text-slate-300 font-medium">{fmtDur(realHours)}</span>
                                    </div>
                                    {diff !== 0 && (
                                      <span className={`text-[9px] font-bold ${isEarly ? 'text-emerald-500' : 'text-red-400'}`}>
                                        {isEarly ? '▼' : '▲'} {fmtDur(Math.abs(diff))} {isEarly ? 'antes' : 'a mais'}
                                      </span>
                                    )}
                                    {diff === 0 && (
                                      <span className="text-[9px] font-bold text-blue-400">= no prazo</span>
                                    )}
                                  </div>
                                );
                              })()}
                            </td>
                            {canViewCosts && (
                            <td className="px-4 py-2.5 text-right">
                              {(() => {
                                const cost = calcOSCost(order, allMembers);
                                const fmtHrs = (h) => {
                                  if (!h || h <= 0) return '';
                                  if (h < 1) return `${Math.round(h * 60)}min`;
                                  const hrs = Math.floor(h);
                                  const mins = Math.round((h - hrs) * 60);
                                  return mins > 0 ? `${hrs}h${mins}m` : `${hrs}h`;
                                };
                                return (
                                  <div>
                                    <span className="font-bold text-slate-800 dark:text-slate-100">{formatCurrency(cost.totalCost)}</span>
                                    {cost.hours > 0 && (
                                      <p className="text-[9px] text-slate-400">{fmtHrs(cost.hours)}</p>
                                    )}
                                    {cost.materialCost > 0 && (
                                      <p className="text-[9px] text-amber-600">Mat: {formatCurrency(cost.materialCost)}</p>
                                    )}
                                  </div>
                                );
                              })()}
                            </td>
                            )}
                          </tr>
                        );
                      })}
                    </tbody>
                    {canViewCosts && (
                    <tfoot>
                      <tr className="bg-slate-50 dark:bg-slate-800/50 border-t-2 border-slate-300 dark:border-slate-600">
                        <td colSpan="6" className="px-4 py-2.5 text-right text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">Total</td>
                        <td className="px-4 py-2.5 text-right">
                          <span className="text-sm font-bold text-blue-600">
                            {formatCurrency(filteredDoneOrders.reduce((sum, o) => sum + calcOSCost(o, allMembers).totalCost, 0))}
                          </span>
                        </td>
                      </tr>
                    </tfoot>
                    )}
                  </table>
                  {totalPages > 1 && (
                    <div className="flex items-center justify-between px-4 py-3 border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
                      <span className="text-xs text-slate-500 dark:text-slate-400">
                        {page * perPage + 1}-{Math.min((page + 1) * perPage, filteredDoneOrders.length)} de {filteredDoneOrders.length}
                      </span>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => setDonePage(Math.max(0, page - 1))}
                          disabled={page === 0}
                          className="px-2.5 py-1 text-xs rounded-lg border border-slate-300 dark:border-slate-600 text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                          Anterior
                        </button>
                        {Array.from({ length: totalPages }, (_, i) => (
                          <button
                            key={i}
                            onClick={() => setDonePage(i)}
                            className={`w-7 h-7 text-xs rounded-lg transition-colors ${i === page ? 'bg-fyness-primary text-white' : 'border border-slate-300 dark:border-slate-600 text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-700'}`}
                          >
                            {i + 1}
                          </button>
                        ))}
                        <button
                          onClick={() => setDonePage(Math.min(totalPages - 1, page + 1))}
                          disabled={page === totalPages - 1}
                          className="px-2.5 py-1 text-xs rounded-lg border border-slate-300 dark:border-slate-600 text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                          Proximo
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })()}
          </div>
        )}

        {/* Reunioes do Mes (so gestor) */}
        {isManager && (() => {
          const now = new Date();
          const monthMeetings = agendaEvents.filter(e => {
            if (e.type !== 'meeting') return false;
            const d = new Date(e.startDate);
            return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
          });
          if (monthMeetings.length === 0) return null;
          return (
            <div className="mt-6 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between">
                <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                  <svg className="w-4 h-4 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  Reunioes do Mes ({monthMeetings.length})
                </h3>
              </div>
              <table className="w-full">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-700">
                    <th className="text-left px-4 py-2.5 text-[10px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Data</th>
                    <th className="text-left px-4 py-2.5 text-[10px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Titulo</th>
                    <th className="text-left px-4 py-2.5 text-[10px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Participantes</th>
                    <th className="text-right px-4 py-2.5 text-[10px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Duracao</th>
                    <th className="text-right px-4 py-2.5 text-[10px] font-semibold text-purple-500 uppercase tracking-wider">Custo</th>
                  </tr>
                </thead>
                <tbody>
                  {monthMeetings.map(meeting => {
                    const start = new Date(meeting.startDate);
                    const end = new Date(meeting.endDate);
                    const hours = Math.max((end - start) / 3600000, 0);
                    const attendees = meeting.attendees && meeting.attendees.length > 0
                      ? meeting.attendees
                      : meeting.assignee ? [meeting.assignee] : [];
                    const totalRate = attendees.reduce((sum, id) => {
                      const member = allMembers.find(m => m.id === id);
                      return sum + (member ? getMemberHourlyRate(member) : 0);
                    }, 0);
                    const cost = hours * totalRate;
                    return (
                      <tr key={meeting.id} className="border-b border-slate-100 dark:border-slate-700 last:border-b-0 hover:bg-slate-50 dark:hover:bg-slate-700/50">
                        <td className="px-4 py-2.5 text-sm text-slate-600 dark:text-slate-300">
                          {start.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })}
                        </td>
                        <td className="px-4 py-2.5 text-sm font-medium text-slate-800 dark:text-slate-100">{meeting.title}</td>
                        <td className="px-4 py-2.5">
                          <div className="flex items-center gap-1 flex-wrap">
                            {attendees.map(id => {
                              const member = allMembers.find(m => m.id === id);
                              if (!member) return null;
                              return (
                                <span key={id} className="text-[10px] px-1.5 py-0.5 rounded-full text-white font-medium" style={{ backgroundColor: member.color }}>
                                  {shortName(member.name)}
                                </span>
                              );
                            })}
                            {attendees.length === 0 && <span className="text-xs text-slate-400 dark:text-slate-500 italic">-</span>}
                          </div>
                        </td>
                        <td className="px-4 py-2.5 text-right text-sm text-slate-600 dark:text-slate-300">{hours.toFixed(1)}h</td>
                        <td className="px-4 py-2.5 text-right">
                          <span className="font-bold text-slate-800 dark:text-slate-100">{formatCurrency(cost)}</span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
                <tfoot>
                  <tr className="bg-slate-50 dark:bg-slate-800/50 border-t-2 border-slate-300 dark:border-slate-600">
                    <td colSpan="4" className="px-4 py-2.5 text-right text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">Total</td>
                    <td className="px-4 py-2.5 text-right">
                      <span className="text-sm font-bold text-purple-600">
                        {formatCurrency(monthMeetings.reduce((sum, m) => {
                          const start = new Date(m.startDate);
                          const end = new Date(m.endDate);
                          const hours = Math.max((end - start) / 3600000, 0);
                          const att = m.attendees && m.attendees.length > 0 ? m.attendees : m.assignee ? [m.assignee] : [];
                          const rate = att.reduce((s, id) => { const mb = allMembers.find(x => x.id === id); return s + (mb ? getMemberHourlyRate(mb) : 0); }, 0);
                          return sum + hours * rate;
                        }, 0))}
                      </span>
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          );
        })()}

        </div>{/* Fim area scrollavel */}

        {/* Create/Edit Form Modal */}
        {showCreateForm && (
          <OSFormModal
            form={form}
            setForm={setForm}
            editing={!!editingOrder}
            number={editingOrder?.number || nextNumber}
            projects={projects}
            teamMembers={allMembers}
            clients={clients}
            onSave={handleSave}
            profileName={profile.name || ''}
            onClose={() => { setShowCreateForm(false); setEmergencyFormMode(false); }}
            onDelete={canDeleteOS && editingOrder ? () => { setShowDeleteModal(editingOrder.id); setShowCreateForm(false); } : null}
            isEmergency={emergencyFormMode}
            emergencyNumber={nextEmergencyNumber}
            allOrders={orders}
            saving={saving}
          />
        )}

        {/* Delete Confirmation */}
        {showDeleteModal && (
          <DeleteModal
            title="Excluir O.S.?"
            message="Esta acao nao pode ser desfeita."
            onCancel={() => setShowDeleteModal(null)}
            onConfirm={() => handleDelete(showDeleteModal)}
          />
        )}

        {/* Project Form Modal */}
        {showProjectForm && (
          <ProjectFormModal
            form={projectForm}
            setForm={setProjectForm}
            editing={!!editingProject}
            sectors={sectors}
            onSave={handleSaveProject}
            onClose={() => setShowProjectForm(false)}
            onDelete={canManageProjects && editingProject ? () => { setShowDeleteProjectModal(editingProject.id); setShowProjectForm(false); } : null}
          />
        )}

        {showDeleteProjectModal && (
          <DeleteModal
            title="Excluir projeto?"
            message="As O.S. deste projeto ficaram sem projeto atribuido."
            onCancel={() => setShowDeleteProjectModal(null)}
            onConfirm={() => handleDeleteProject(showDeleteProjectModal)}
          />
        )}
      </div>
    );
  }

  // ==================== TELA 1: GRID DE PROJETOS ====================

  const renderProjectCard = (project) => {
    const projOrders = orders.filter(o => o.projectId === project.id);
    const total = projOrders.length;
    const inProgress = projOrders.filter(o => o.status === 'in_progress').length;
    const done = projOrders.filter(o => o.status === 'done').length;
    const percent = total > 0 ? Math.round((done / total) * 100) : 0;
    const sector = sectors.find(s => s.id === project.sector);
    const isFinished = project.status === 'finished';

    return (
      <div
        key={project.id}
        onClick={() => setSelectedProject(project)}
        className={`group bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-5 cursor-pointer hover:shadow-lg hover:border-slate-300 dark:hover:border-slate-600 transition-all duration-200 hover:-translate-y-0.5 ${isFinished ? 'opacity-60' : ''}`}
      >
        <div className="flex items-start justify-between mb-3">
          <div className="relative">
            <FolderIcon color={project.color} size={40} />
            {isFinished && (
              <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
                <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>
            )}
          </div>
          <div className="flex items-center gap-0.5">
            {canManageProjects && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  const newStatus = isFinished ? 'active' : 'finished';
                  updateOSProject(project.id, { status: newStatus }).then(() => {
                    queryClient.invalidateQueries({ queryKey: queryKeys.osProjects });
                    toast(isFinished ? 'Projeto reaberto' : 'Projeto finalizado', 'success');
                  });
                }}
                className={`p-1 rounded transition-colors md:opacity-0 md:group-hover:opacity-100 ${
                  isFinished
                    ? 'text-amber-400 hover:text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-900/20'
                    : 'text-green-400 hover:text-green-500 hover:bg-green-50 dark:hover:bg-green-900/20'
                }`}
                title={isFinished ? 'Reabrir projeto' : 'Finalizar projeto'}
              >
                {isFinished ? (
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                ) : (
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </button>
            )}
            {canManageProjects && (
              <button
                onClick={(e) => { e.stopPropagation(); openEditProject(project); }}
                className="p-1 text-slate-300 dark:text-slate-600 hover:text-slate-500 dark:hover:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 rounded transition-colors md:opacity-0 md:group-hover:opacity-100"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                </svg>
              </button>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 mb-1">
          <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 group-hover:text-fyness-primary transition-colors">{project.name}</h3>
          {isFinished && (
            <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 shrink-0">Finalizado</span>
          )}
        </div>
        {sector && (
          <span className="inline-block text-[10px] font-semibold px-2 py-0.5 rounded-full text-white mb-2" style={{ backgroundColor: sector.color }}>
            {sector.label}
          </span>
        )}
        <div className="flex items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400 mb-2">
          <span className="font-medium">{total} O.S.</span>
          <span className="text-slate-300 dark:text-slate-600">|</span>
          {inProgress > 0 && <span className="text-blue-600">{inProgress} andamento</span>}
        </div>

        {total > 0 && (
          <div className="flex items-center gap-2">
            <div className="flex-1 h-1.5 bg-slate-100 dark:bg-slate-600 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{ width: `${percent}%`, backgroundColor: project.color }}
              />
            </div>
            <span className="text-[10px] font-medium text-slate-400 dark:text-slate-500">{percent}%</span>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Projetos</h1>
          <span className="text-sm text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-700 px-2.5 py-0.5 rounded-full font-medium">{projects.length}</span>
        </div>
        {canManageProjects && (
          <button onClick={openCreateProject} className="flex items-center gap-2 px-4 py-2 bg-fyness-primary text-white rounded-lg hover:bg-fyness-secondary transition-colors text-sm font-medium shadow-sm">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Nova Pasta de OS
          </button>
        )}
      </div>

      {/* Filtros */}
      <div className="flex items-center gap-3 mb-4">
        {/* Busca */}
        <div className="relative flex-1 max-w-xs">
          <svg className="w-4 h-4 text-slate-400 dark:text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            value={projectSearch}
            onChange={(e) => setProjectSearch(e.target.value)}
            placeholder="Buscar projeto..."
            className="w-full pl-9 pr-3 py-2 text-sm border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-fyness-primary focus:border-transparent"
          />
        </div>

        {/* Filtro por setor (chips) */}
        <div className="flex items-center gap-1.5 flex-wrap">
          {sectors.map(s => (
            <div key={s.id} className="relative group/sector">
              <button
                onClick={() => setSectorFilter(s.id)}
                className={`px-3 py-1.5 text-xs font-medium rounded-full transition-colors ${
                  sectorFilter === s.id
                    ? 'text-white pr-7'
                    : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
                }`}
                style={sectorFilter === s.id ? { backgroundColor: s.color } : undefined}
              >
                {s.label}
              </button>
              {canManageProjects && sectorFilter === s.id && (
                <button
                  onClick={(e) => { e.stopPropagation(); openEditSector(s); }}
                  className="absolute right-1 top-1/2 -translate-y-1/2 w-4 h-4 flex items-center justify-center text-white/70 hover:text-white transition-colors"
                  title="Editar setor"
                >
                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                  </svg>
                </button>
              )}
            </div>
          ))}
          {canManageProjects && (
            <button
              onClick={openCreateSector}
              className="px-2 py-1.5 text-xs font-medium rounded-full bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-600 hover:text-slate-700 dark:hover:text-slate-200 transition-colors"
              title="Novo setor"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
              </svg>
            </button>
          )}
        </div>

      </div>

      {/* Grid de Projetos */}
      <div className="flex-1 overflow-y-auto overscroll-contain">
        {(() => {
          const projectsWithSector = filteredProjects.filter(p => p.sector);
          const activeProjects = projectsWithSector.filter(p => p.status !== 'finished');
          const finishedProjects = projectsWithSector.filter(p => p.status === 'finished');

          return (
            <>
              {activeProjects.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-6">
                  {activeProjects.map(project => renderProjectCard(project))}
                </div>
              )}

              {/* ---- CONCLUIDOS ---- */}
              {finishedProjects.length > 0 && (
                <div className="mb-6 opacity-70">
                  <div className="flex items-center gap-2 mb-3">
                    <svg className="w-4 h-4 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    <h2 className="text-sm font-bold text-slate-700 dark:text-slate-200 uppercase tracking-wider">Concluidos</h2>
                    <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400">{finishedProjects.length}</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {finishedProjects.map(project => renderProjectCard(project))}
                  </div>
                </div>
              )}

              {/* Estado vazio */}
              {activeProjects.length === 0 && finishedProjects.length === 0 && orphanOrders.length === 0 && (
                <div className="flex flex-col items-center justify-center py-20 text-center">
                  <div className="text-slate-300 dark:text-slate-600 mb-4">
                    <FolderIcon color="#cbd5e1" size={64} />
                  </div>
                  <h3 className="text-lg font-semibold text-slate-600 dark:text-slate-300 mb-1">Nenhum projeto encontrado</h3>
                  <p className="text-sm text-slate-400 dark:text-slate-500 mb-4">
                    {projectSearch.trim() || sectorFilter
                      ? 'Tente ajustar os filtros de busca'
                      : 'Crie seu primeiro projeto para organizar as O.S.'
                    }
                  </p>
                  {canManageProjects && !projectSearch.trim() && !sectorFilter && (
                    <button onClick={openCreateProject} className="px-4 py-2 bg-fyness-primary text-white rounded-lg hover:bg-fyness-secondary transition-colors text-sm font-medium">
                      Criar Projeto
                    </button>
                  )}
                </div>
              )}
            </>
          );
        })()}
      </div>

      {/* Project Form Modal */}
      {showProjectForm && (
        <ProjectFormModal
          form={projectForm}
          setForm={setProjectForm}
          editing={!!editingProject}
          sectors={sectors}
          onSave={handleSaveProject}
          onClose={() => setShowProjectForm(false)}
          onDelete={canManageProjects && editingProject ? () => { setShowDeleteProjectModal(editingProject.id); setShowProjectForm(false); } : null}
        />
      )}

      {showDeleteProjectModal && (
        <DeleteModal
          title="Excluir projeto?"
          message="As O.S. deste projeto ficaram sem projeto atribuido."
          onCancel={() => setShowDeleteProjectModal(null)}
          onConfirm={() => handleDeleteProject(showDeleteProjectModal)}
        />
      )}

      {/* Sector Form Modal */}
      {showSectorForm && (
        <SectorFormModal
          form={sectorForm}
          setForm={setSectorForm}
          editing={!!editingSector}
          onSave={handleSaveSector}
          onClose={() => setShowSectorForm(false)}
          onDelete={canManageProjects && editingSector ? () => { setShowDeleteSectorModal(editingSector.id); setShowSectorForm(false); } : null}
        />
      )}

      {showDeleteSectorModal && (
        <DeleteModal
          title="Excluir setor?"
          message="Projetos deste setor ficaram sem setor atribuido."
          onCancel={() => setShowDeleteSectorModal(null)}
          onConfirm={() => handleDeleteSector(showDeleteSectorModal)}
        />
      )}
    </div>
  );
}

// ==================== CARD KANBAN ====================

const OSCard = memo(function OSCard({ order, onClick, isDragging, dropPosition, onDragStart, onDragEnd, onCardDragOver, teamMembers, seqNumber, allOrders = [] }) {
  const _tm = teamMembers.find(m => m.id === order.assignee || namesMatch(m.name, order.assignee));
  const member = _tm || (order.assignee ? { id: order.assignee, name: order.assignee, color: '#3b82f6' } : null);
  const isEmergency = order.type === 'emergency';
  const parentOrder = isEmergency && order.parentOrderId ? allOrders.find(o => o.id === order.parentOrderId) : null;

  const statusStyle = order.status === 'available'
    ? 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
    : order.status === 'in_progress'
      ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400'
      : 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400';

  const statusDot = order.status === 'available'
    ? 'bg-slate-400'
    : order.status === 'in_progress'
      ? 'bg-blue-500'
      : 'bg-green-500';

  // Listra de status na lateral do card — leitura instantanea de "em que pe esta"
  const statusAccent = order.status === 'available'
    ? 'border-l-slate-300 dark:border-l-slate-600'
    : order.status === 'in_progress'
      ? 'border-l-blue-500'
      : 'border-l-emerald-500';

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const rect = e.currentTarget.getBoundingClientRect();
    const y = e.clientY - rect.top;
    const position = y < rect.height / 2 ? 'before' : 'after';
    onCardDragOver(position);
  };

  return (
    <div className="py-1">
      {dropPosition === 'before' && (
        <div className="h-1 bg-fyness-primary rounded-full mx-1 mb-1 animate-pulse" />
      )}
      <div
        draggable={!isEmergency}
        onDragStart={!isEmergency ? (e) => {
          e.dataTransfer.setData('text/plain', order.id);
          e.dataTransfer.effectAllowed = 'move';
          onDragStart();
        } : undefined}
        onDragEnd={!isEmergency ? onDragEnd : undefined}
        onDragOver={!isEmergency ? handleDragOver : undefined}
        onClick={onClick}
        className={`rounded-xl p-3.5 transition-all duration-200 group ${
          isEmergency
            ? `bg-white dark:bg-slate-800 border border-red-200 dark:border-red-900/40 border-l-4 border-l-red-500 shadow-sm cursor-pointer hover:-translate-y-0.5 hover:shadow-lg w-72`
            : `bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 border-l-4 ${statusAccent} shadow-sm cursor-grab active:cursor-grabbing ${
              isDragging ? 'opacity-40 scale-95 shadow-none' : 'hover:-translate-y-0.5 hover:shadow-lg'
            }`
        }`}
      >
        <div className="flex items-center justify-between mb-1.5">
          <div className="flex items-center gap-1.5">
            {isEmergency ? (
              <span className="inline-flex items-center justify-center px-1.5 py-0.5 rounded bg-red-600 text-white text-[9px] font-bold shrink-0 uppercase tracking-wider">EMG</span>
            ) : seqNumber ? (
              <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-fyness-primary text-white text-[10px] font-bold shrink-0">{seqNumber}</span>
            ) : null}
            <span className={`text-xs font-bold ${isEmergency ? 'text-red-500 dark:text-red-400' : 'text-slate-400 dark:text-slate-500'}`}>
              {isEmergency ? `EMG-${String(order.emergencyNumber || 0).padStart(3, '0')}` : `O.S. #${order.number}`}
            </span>
          </div>
          <div className="flex items-center gap-1">
            <span className={`inline-flex items-center gap-1 text-[10px] font-medium px-1.5 py-0.5 rounded-full ${statusStyle}`}>
              <span className={`w-1.5 h-1.5 rounded-full ${statusDot}`} />
              {STATUS_LABELS[order.status]}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-1.5 mb-1">
          {isEmergency && (
            <svg className="w-3.5 h-3.5 text-red-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          )}
          <h4 className={`text-[15px] font-bold leading-snug line-clamp-2 ${isEmergency ? 'text-red-700 dark:text-red-300' : 'text-slate-900 dark:text-white group-hover:text-fyness-primary'} transition-colors`}>{order.title}</h4>
        </div>
        {isEmergency && parentOrder && (
          <p className="text-[10px] text-red-400 dark:text-red-500 mb-1">
            Vinculada a O.S. #{parentOrder.number} — {parentOrder.title}
          </p>
        )}
        {order.client && <p className="text-[11px] text-slate-400 dark:text-slate-500 mb-1">{order.client}</p>}
        <div className="flex items-center gap-1.5 mb-1 flex-wrap">
          {order.category && order.category !== 'internal' && (
            <span className={`text-[9px] font-medium px-1.5 py-0.5 rounded ${(CATEGORIES.find(c => c.id === order.category) || {}).color || 'bg-slate-100 text-slate-500'}`}>
              {(CATEGORIES.find(c => c.id === order.category) || {}).label || order.category}
            </span>
          )}
          {order.status === 'blocked' && order.blockReason && (
            <span className="text-[9px] font-medium px-1.5 py-0.5 rounded bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400">
              {(BLOCK_REASONS.find(b => b.id === order.blockReason) || {}).label || order.blockReason}
            </span>
          )}
        </div>
        {order.estimatedEnd && (
          <div className="flex items-center gap-2 mb-1 text-[10px] text-slate-400 dark:text-slate-500">
            <span title="Entrega prevista" className="font-medium text-slate-500 dark:text-slate-400">
              <svg className="w-3 h-3 inline mr-0.5 -mt-px" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
              {formatDateShort(order.estimatedEnd)}
            </span>
          </div>
        )}
        {(order.checklist || []).length > 0 && (() => {
          const done = (order.checklist || []).filter(i => i.done).length;
          const total = (order.checklist || []).length;
          const pct = total > 0 ? (done / total) * 100 : 0;
          return (
            <div className="flex items-center gap-2 mb-1">
              <div className="flex-1 h-1.5 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                <div className={`h-full rounded-full transition-all ${pct === 100 ? 'bg-emerald-500' : 'bg-blue-500'}`} style={{ width: `${pct}%` }} />
              </div>
              <span className={`text-[10px] font-medium ${pct === 100 ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400 dark:text-slate-500'}`}>
                {done}/{total}
              </span>
            </div>
          );
        })()}
        <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-100 dark:border-slate-700">
          <div className="flex flex-wrap gap-1">
            {getOrderAssigneeNames(order).length > 0 ? (
              getOrderAssigneeNames(order).map((name, i) => {
                const m = teamMembers.find(tm => namesMatch(tm.name, name));
                return (
                  <span key={i} className="inline-flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400">
                    {m && <span className="w-4 h-4 rounded-full text-white text-[8px] font-bold flex items-center justify-center" style={{ backgroundColor: m.color || '#94a3b8' }}>{(m.name || '?')[0]}</span>}
                    {shortName(name)}
                  </span>
                );
              })
            ) : member ? (
              <div className="flex items-center gap-1.5">
                <div className="w-5 h-5 rounded-full flex items-center justify-center text-white text-[9px] font-bold" style={{ backgroundColor: member.color }}>{member.name.charAt(0)}</div>
                <span className="text-xs text-slate-600 dark:text-slate-300">{shortName(member.name)}</span>
              </div>
            ) : (
              <span className="text-xs text-slate-400 dark:text-slate-500 italic">Sem responsavel</span>
            )}
          </div>
          <div className="flex items-center gap-1.5">
            {order.attachments && order.attachments.length > 0 && (
              <span className="flex items-center gap-0.5 text-[10px] text-slate-400 dark:text-slate-500">
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                </svg>
                {order.attachments.length}
              </span>
            )}
            <svg className="w-4 h-4 text-slate-300 dark:text-slate-600 group-hover:text-fyness-primary transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
        </div>
      </div>
      {dropPosition === 'after' && (
        <div className="h-1 bg-fyness-primary rounded-full mx-1 mt-1 animate-pulse" />
      )}
    </div>
  );
});

// ==================== DOCUMENTO O.S. ====================

function OSDocument({ order, currentUser, projectName, onBack, onEdit, onDuplicate, onMoveForward, onMoveBack, onDelete, isManager, canEditOS, canDeleteOS, canViewCosts, profileName, profileCpf, profileId, teamMembers, allOrders = [], onViewOrder, onUpdateOrder, initialBriefingItemId = null, onConsumeInitialBriefing }) {
  const queryClient = useQueryClient();
  // Ref para manter checklist mais recente e evitar closures obsoletas
  const checklistRef = useRef(order.checklist || []);
  checklistRef.current = order.checklist || [];

  // Limpeza unica: remover pausedAt de itens do checklist (agora o pause e na O.S.)
  useEffect(() => {
    if (!onUpdateOrder) return;
    const latestCl = checklistRef.current;
    let needsFix = false;
    const cleaned = latestCl.map(i => {
      if (i.pausedAt) { needsFix = true; return { ...i, pausedAt: null }; }
      return i;
    });
    if (needsFix) onUpdateOrder(order.id, { checklist: cleaned });
  }, [order.id]);

  // Estado de colapso dos blocos de tarefas
  const [collapsedGroups, setCollapsedGroups] = useState(new Set());
  const toggleGroupCollapse = (key) => setCollapsedGroups(prev => {
    const next = new Set(prev);
    if (next.has(key)) next.delete(key); else next.add(key);
    return next;
  });

  // Estado de edicao de grupos (pastas)
  const [editingGroupKey, setEditingGroupKey] = useState(null);

  const renameGroupInOrder = (oldKey, newName) => {
    if (!newName.trim() || newName.trim() === oldKey || !onUpdateOrder) return;
    const latestCl = checklistRef.current;
    const updated = latestCl.map(i =>
      (i.group || '__ungrouped__') === oldKey ? { ...i, group: newName.trim() } : i
    );
    onUpdateOrder(order.id, { checklist: updated });
    setEditingGroupKey(null);
  };

  const removeGroupFromOrder = (groupKey) => {
    if (!onUpdateOrder) return;
    const latestCl = checklistRef.current;
    const updated = latestCl.filter(i => (i.group || '__ungrouped__') !== groupKey);
    onUpdateOrder(order.id, { checklist: updated });
  };

  const addGroupToOrder = (groupName) => {
    if (!groupName.trim() || !onUpdateOrder) return;
    const taskName = prompt(`Primeira tarefa da pasta "${groupName.trim()}":`);
    if (!taskName || !taskName.trim()) return;
    const latestCl = checklistRef.current;
    const newItem = {
      id: Date.now() + Math.random(),
      text: taskName.trim(),
      group: groupName.trim(),
      done: false, startedAt: null, completedAt: null, durationMin: null, pausedAt: null, accumulatedMin: 0,
    };
    onUpdateOrder(order.id, { checklist: [...latestCl, newItem] });
  };

  // Tick pra atualizar o cronômetro ao vivo enquanto alguma tarefa está rodando.
  const [, setTimerTick] = useState(0);
  useEffect(() => {
    const running = (order.checklist || []).some(i => !i.done && i.startedAt && !i.pausedAt);
    if (!running) return;
    const t = setInterval(() => setTimerTick(n => n + 1), 30000);
    return () => clearInterval(t);
  }, [order.checklist]);

  // Briefing por tarefa — painel lateral estilo Notion.
  // Rascunho local; salva ao FECHAR (evita escrever na rede a cada tecla).
  const [briefingItemId, setBriefingItemId] = useState(null);
  const [briefingDraft, setBriefingDraft] = useState('');
  const [deliveryDraft, setDeliveryDraft] = useState('');
  const [briefingTab, setBriefingTab] = useState('briefing');
  const briefingItem = briefingItemId != null ? (checklistRef.current.find(i => i.id === briefingItemId) || null) : null;
  const openBriefing = (item, tab = 'briefing') => {
    setBriefingDraft(item.briefing || '');
    setDeliveryDraft(item.delivery || '');
    setBriefingTab(tab);
    setBriefingItemId(item.id);
  };

  // Abre o briefing direto quando veio da Agenda clicando num prazo de tarefa.
  useEffect(() => {
    if (!initialBriefingItemId) return;
    const item = checklistRef.current.find(i => i.id === initialBriefingItemId);
    if (item) openBriefing(item, 'briefing');
    onConsumeInitialBriefing?.();
  }, [initialBriefingItemId]); // eslint-disable-line react-hooks/exhaustive-deps
  const closeBriefing = () => {
    if (briefingItem && onUpdateOrder) {
      const briefingChanged = briefingDraft !== (briefingItem.briefing || '');
      const deliveryChanged = deliveryDraft !== (briefingItem.delivery || '');
      if (briefingChanged || deliveryChanged) {
        const now = new Date().toISOString();
        const stamp = { by: profileName || 'Voce', at: now };
        let updated = checklistRef.current;
        if (briefingChanged) updated = setBriefingItem(updated, briefingItem.id, briefingDraft, stamp);
        if (deliveryChanged) updated = setDeliveryItem(updated, briefingItem.id, deliveryDraft, stamp);
        onUpdateOrder(order.id, { checklist: updated });
        toast.success(deliveryChanged && !briefingChanged ? 'Entrega salva' : 'Briefing salvo');
      }
    }
    setBriefingItemId(null);
  };

  // Só o SUPERVISOR da O.S. avalia a qualidade. Se nenhum supervisor estiver
  // definido, cai pra quem pode editar a O.S. (pra não travar).
  const canReviewTask = useMemo(() => {
    const sup = (order.supervisor || '').split(',').map(s => s.trim()).filter(Boolean);
    if (sup.length === 0) return canEditOS;
    return sup.some(name => namesMatch(name, profileName));
  }, [order.supervisor, profileName, canEditOS]);

  // O JUIZ arbitra a contestação (terceiro neutro), designado por O.S. no campo
  // `judge`. Gestor também pode arbitrar (override admin).
  const hasJudge = !!(order.judge || '').trim();
  const canJudge = useMemo(() => {
    const judges = (order.judge || '').split(',').map(s => s.trim()).filter(Boolean);
    if (judges.length === 0) return false;
    return judges.some(name => namesMatch(name, profileName)) || isManager;
  }, [order.judge, profileName, isManager]);

  // Status de revisao da tarefa (Rascunho -> Pronto pra revisar -> Aprovado/Ajuste).
  // quality = { answers, pct, points, max } vindo do checklist de qualidade.
  const setTaskReview = (itemId, status, quality = null) => {
    if (!onUpdateOrder) return;
    const now = new Date().toISOString();
    const updated = applyReview(checklistRef.current, itemId, status, quality, { by: profileName || 'Voce', at: now });
    onUpdateOrder(order.id, { checklist: updated });
    // Base de produtividade: atualiza a qualidade da tarefa concluída.
    recordTaskReview({ orderId: order.id, taskId: itemId, reviewStatus: status, reviewedBy: profileName, qualityPct: quality?.pct ?? null, qualityAnswers: quality?.answers ?? null });
    if (status === 'review') {
      const it = updated.find(i => i.id === itemId);
      notifyTaskReady(order, it?.text || '', order.supervisor, teamMembers, profileName, profileId);
    }
  };

  // Autosave do checklist de qualidade (rascunho): grava as respostas na tarefa a
  // cada marcação, sem finalizar. Assim, fechar o briefing no meio NÃO perde nada.
  const saveTaskQualityDraft = (itemId, answers, notes) => {
    if (!onUpdateOrder) return;
    onUpdateOrder(order.id, { checklist: applyQualityDraft(checklistRef.current, itemId, answers, notes) });
  };

  // O executor DISCORDA da nota de qualidade: registra uma contestação escrita
  // (opcionalmente sobre um critério). O supervisor/3º decide depois.
  const fileTaskDispute = (itemId, { reason, criterion }) => {
    if (!onUpdateOrder) return;
    const now = new Date().toISOString();
    const updated = fileDisputeItem(checklistRef.current, itemId, { reason, criterion }, { by: profileName || 'Voce', byId: profileId || null, at: now });
    onUpdateOrder(order.id, { checklist: updated });
    toast.success('Contestação enviada');
  };

  // Supervisor (ou 3º) decide a contestação: muda a nota (reavaliar) ou mantém.
  const resolveTaskDispute = (itemId, { outcome, note, quality }) => {
    if (!onUpdateOrder) return;
    const now = new Date().toISOString();
    const updated = resolveDisputeItem(checklistRef.current, itemId, { outcome, note, quality }, { by: profileName || 'Voce', at: now });
    onUpdateOrder(order.id, { checklist: updated });
    if (outcome === 'changed' && quality) {
      recordTaskReview({ orderId: order.id, taskId: itemId, reviewStatus: 'approved', reviewedBy: profileName, qualityPct: quality.pct, qualityAnswers: quality.answers });
    }
    toast.success(outcome === 'changed' ? 'Nota ajustada' : 'Nota mantida');
  };
  // Se há Juiz designado, SÓ ele (ou gestor) resolve a contestação — o supervisor
  // não julga a própria nota. Sem Juiz: comportamento antigo (supervisor/gestor).
  const canResolveDispute = hasJudge ? canJudge : (canReviewTask || isManager);

  const teamMember = teamMembers.find(m => m.id === order.assignee || namesMatch(m.name, order.assignee));
  const member = teamMember || (order.assignee ? { id: order.assignee, name: order.assignee, color: '#3b82f6' } : null);
  const priority = PRIORITIES.find(p => p.id === order.priority) || PRIORITIES[1];
  const docAttachments = order.attachments || [];
  const isEmergency = order.type === 'emergency';
  const parentOrder = isEmergency && order.parentOrderId ? allOrders.find(o => o.id === order.parentOrderId) : null;
  const childEmergencies = allOrders.filter(o => o.type === 'emergency' && o.parentOrderId === order.id);

  // Chat sempre visivel (removido toggle showComments)

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="h-full flex flex-col print:block print:h-auto">
      {briefingItem && (
        <BriefingDrawer
          key={briefingItem.id}
          title={briefingItem.text}
          editable={canEditOS}
          content={canEditOS ? briefingDraft : briefingItem.briefing}
          author={briefingItem.briefingBy}
          authorAt={briefingItem.briefingAt}
          reviewStatus={briefingItem.reviewStatus}
          reviewBy={briefingItem.reviewBy}
          reviewAt={briefingItem.reviewAt}
          qualityPct={briefingItem.qualityPct}
          qualityAnswers={briefingItem.qualityAnswers}
          qualityNotes={briefingItem.qualityNotes}
          qualityDispute={briefingItem.qualityDispute}
          onReview={canEditOS ? (status, quality) => setTaskReview(briefingItem.id, status, quality) : undefined}
          onQualityDraft={canEditOS ? (answers, notes) => saveTaskQualityDraft(briefingItem.id, answers, notes) : undefined}
          onFileDispute={onUpdateOrder ? (d) => fileTaskDispute(briefingItem.id, d) : undefined}
          onResolveDispute={canResolveDispute && onUpdateOrder ? (d) => resolveTaskDispute(briefingItem.id, d) : undefined}
          canReview={canReviewTask}
          onChange={setBriefingDraft}
          onClose={closeBriefing}
          showDelivery={!!briefingItem.done}
          initialTab={briefingTab}
          deliveryContent={canEditOS ? deliveryDraft : briefingItem.delivery}
          onDeliveryChange={setDeliveryDraft}
          deliveryAuthor={briefingItem.deliveryBy}
          deliveryAt={briefingItem.deliveryAt}
        />
      )}

      {/* Toolbar */}
      <div className="flex items-center justify-between mb-4 print:hidden">
        <button onClick={onBack} className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300 hover:text-slate-800 dark:hover:text-slate-100 transition-colors">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Voltar ao Kanban
        </button>

        <div className="flex items-center gap-2">
          {order.status !== 'done' && onMoveForward && (
            <button onClick={onMoveForward} className="px-3 py-1.5 bg-green-500 text-white text-sm rounded-lg hover:bg-green-600 transition-colors font-medium">Concluir</button>
          )}
          {order.status === 'done' && onMoveBack && (
            <button onClick={onMoveBack} className="px-3 py-1.5 border border-slate-300 dark:border-slate-600 text-slate-600 dark:text-slate-300 text-sm rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">Reabrir</button>
          )}

          {onEdit && (
            <button onClick={onEdit} title="Editar a O.S. (titulo, descricao, prioridade, cliente, projeto, previsao)"
              className="px-3 py-1.5 border border-fyness-primary/60 text-fyness-primary text-sm font-medium rounded-lg hover:bg-fyness-primary/10 transition-colors flex items-center gap-1.5">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
              Editar
            </button>
          )}
          {onDuplicate && (
            <button onClick={onDuplicate} className="px-3 py-1.5 border border-blue-300 dark:border-blue-600 text-blue-600 dark:text-blue-400 text-sm rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors flex items-center gap-1.5">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
              Duplicar
            </button>
          )}
          <button onClick={handlePrint} className="px-3 py-1.5 border border-slate-300 dark:border-slate-600 text-slate-600 dark:text-slate-300 text-sm rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors flex items-center gap-1.5">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
            </svg>
            Imprimir
          </button>
          {onDelete && (
            <button onClick={onDelete} className="px-3 py-1.5 border border-red-200 dark:border-red-600/50 text-red-500 dark:text-red-400 text-sm rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">Excluir</button>
          )}
        </div>
      </div>

      {/* Documento */}
      <div className="flex-1 overflow-y-auto print:overflow-visible">
        <div className="max-w-6xl mx-auto bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm print:shadow-none print:border-none print:max-w-none print:rounded-none">
          {/* Cabecalho do documento */}
          <div className="border-b-2 border-slate-800 dark:border-slate-400 p-8 pb-6">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <img src={logoFyness} alt="Fyness" className="w-12 h-12 object-contain" />
                <div>
                  <h1 className="text-xl font-bold text-slate-800 dark:text-slate-100">FYNESS</h1>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Gestao de Processos</p>
                </div>
              </div>
              <div className="text-right">
                {isEmergency ? (
                  <>
                    <h2 className="text-2xl font-bold text-red-600 dark:text-red-400 print:text-red-600 uppercase">Emergencial</h2>
                    <p className="text-3xl font-black text-red-600 dark:text-red-400 mt-1 print:text-red-600">EMG-{String(order.emergencyNumber || 0).padStart(3, '0')}</p>
                  </>
                ) : (
                  <>
                    <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100 print:text-slate-800">ORDEM DE SERVICO</h2>
                    <p className="text-3xl font-black text-fyness-primary mt-1 print:text-slate-800">#{String(order.number).padStart(3, '0')}</p>
                  </>
                )}
                {projectName && (
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Projeto: {projectName}</p>
                )}
              </div>
            </div>
          </div>

          {/* Resumo no topo — titulo + status (o que importa primeiro) */}
          <div className="px-8 py-5 border-b border-slate-200 dark:border-slate-700 print:px-8">
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white leading-tight print:text-slate-900">{order.title}</h1>
            <div className="flex flex-wrap items-center gap-2 mt-3">
              <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${
                order.status === 'available' ? 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300' :
                order.status === 'in_progress' ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400' :
                'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
              }`}>
                <span className={`w-2 h-2 rounded-full ${
                  order.status === 'available' ? 'bg-slate-400' :
                  order.status === 'in_progress' ? 'bg-blue-500' : 'bg-green-500'
                }`} />
                {STATUS_LABELS[order.status]}
              </span>
              <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${priority.color}`}>
                <span className={`w-2 h-2 rounded-full ${priority.dot}`} />
                {priority.label}
              </span>
            </div>
          </div>

          {/* Vinculo emergencial */}
          {isEmergency && parentOrder && (
            <div className="bg-red-50 dark:bg-red-950/30 border-b border-red-200 dark:border-red-800/50 px-6 py-3 flex items-center gap-2">
              <svg className="w-4 h-4 text-red-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
              </svg>
              <span className="text-sm text-red-600 dark:text-red-400">Originada da</span>
              <button onClick={() => onViewOrder && onViewOrder(parentOrder)} className="text-sm font-bold text-red-700 dark:text-red-300 hover:underline">
                O.S. #{parentOrder.number} — {parentOrder.title}
              </button>
            </div>
          )}

          {/* Emergencias vinculadas (na O.S. pai) */}
          {childEmergencies.length > 0 && (
            <div className="bg-red-50 dark:bg-red-950/30 border-b border-red-200 dark:border-red-800/50 px-6 py-3">
              <div className="flex items-center gap-2 mb-2">
                <svg className="w-4 h-4 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
                <span className="text-sm font-semibold text-red-600 dark:text-red-400">{childEmergencies.length} emergencia{childEmergencies.length > 1 ? 's' : ''} vinculada{childEmergencies.length > 1 ? 's' : ''}</span>
              </div>
              <div className="space-y-1">
                {childEmergencies.map(emg => (
                  <button key={emg.id} onClick={() => onViewOrder && onViewOrder(emg)} className="flex items-center gap-2 text-sm text-red-700 dark:text-red-300 hover:underline">
                    <span className="font-bold">EMG-{String(emg.emergencyNumber || 0).padStart(3, '0')}</span>
                    <span>— {emg.title}</span>
                    <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${emg.status === 'done' ? 'bg-green-100 dark:bg-green-900/30 text-green-600' : 'bg-red-100 dark:bg-red-900/30 text-red-600'}`}>
                      {STATUS_LABELS[emg.status]}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {((order.checklist || []).length > 0 || order.estimatedEnd || calcOSHours(order) > 0) && (() => {
            // Controle de horarios: INICIO previsto (editavel aqui) -> ENTREGA prevista
            // (maior prazo das tarefas) -> PERIODO (horas comerciais) -> TEMPO trabalhado.
            const worked = calcOSHours(order);
            const planned = (order.estimatedStart && order.estimatedEnd) ? calcWorkingHoursBetween(order.estimatedStart, order.estimatedEnd) : 0;
            const fmtH = (h) => { const m = Math.round((h || 0) * 60); if (m <= 0) return '—'; const hh = Math.floor(m / 60), mm = m % 60; return hh ? (mm ? `${hh}h ${mm}min` : `${hh}h`) : `${mm}min`; };
            return (
              <div className="border-b border-slate-200 dark:border-slate-700">
                <div className="p-4 grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {/* Inicio previsto — SO LEITURA (edita no modal Editar) */}
                  <div>
                    <label className="text-[10px] font-semibold text-blue-500 uppercase tracking-wider">Inicio previsto</label>
                    <p className="text-sm text-slate-800 dark:text-slate-100 mt-1 font-medium">{order.estimatedStart ? formatDate(order.estimatedStart) : '—'}</p>
                    <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5">edite no botao Editar</p>
                  </div>
                  {/* Previsao de entrega — automatica (maior prazo das tarefas) */}
                  <div>
                    <label className="text-[10px] font-semibold text-blue-500 uppercase tracking-wider">Previsao de entrega</label>
                    <p className="text-sm text-slate-800 dark:text-slate-100 mt-1 font-medium">{order.estimatedEnd ? formatDate(order.estimatedEnd) : '—'}</p>
                    <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5">{(order.checklist || []).some(i => i.dueAt) ? 'maior prazo das tarefas' : 'defina o prazo de cada tarefa'}</p>
                  </div>
                  {/* Periodo previsto — calculado (inicio -> entrega, horas comerciais) */}
                  <div>
                    <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Periodo previsto</label>
                    <p className="text-sm text-slate-800 dark:text-slate-100 mt-1 font-medium">{fmtH(planned)}</p>
                    <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5">{planned > 0 ? 'horas comerciais (inicio → entrega)' : (!order.estimatedStart ? 'defina o inicio acima' : 'defina o prazo das tarefas')}</p>
                  </div>
                  {/* Tempo trabalhado — real (soma dos cronometros) */}
                  <div>
                    <label className="text-[10px] font-semibold text-emerald-500 uppercase tracking-wider">Tempo trabalhado</label>
                    <p className="text-sm text-emerald-600 dark:text-emerald-400 mt-1 font-medium">{fmtH(worked)}</p>
                    <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5">soma dos cronometros</p>
                  </div>
                </div>
              </div>
            );
          })()}

          {(order.status === 'blocked' && order.blockReason) && (
          <div className="border-b border-slate-200 dark:border-slate-700">
            <div className="p-4">
              <label className="text-[10px] font-semibold text-orange-500 uppercase tracking-wider">Motivo do Bloqueio</label>
              <p className="text-sm text-orange-600 dark:text-orange-400 mt-1 font-medium">{(BLOCK_REASONS.find(b => b.id === order.blockReason) || {}).label || order.blockReason}</p>
            </div>
          </div>
          )}

          {order.actualEnd && (
          <div className="border-b border-slate-200 dark:border-slate-700">
            <div className="p-4">
              <label className="text-[10px] font-semibold text-green-500 uppercase tracking-wider">Concluida em</label>
              <p className="text-sm text-slate-800 dark:text-slate-100 mt-1 font-medium">{formatDate(order.actualEnd)}</p>
            </div>
          </div>
          )}

          <div className="grid grid-cols-2 border-b border-slate-200 dark:border-slate-700">
            <div className="p-4 border-r border-slate-200 dark:border-slate-700">
              <label className="text-[10px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Atribuido a</label>
              {getOrderAssigneeNames(order).length > 0 ? (
                <div className="flex flex-wrap gap-1.5 mt-1">
                  {getOrderAssigneeNames(order).map((name, i) => {
                    const m3 = teamMembers.find(tm => namesMatch(tm.name, name));
                    return (
                      <div key={i} className="flex items-center gap-1.5">
                        <div className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold" style={{ backgroundColor: m3?.color || '#3b82f6' }}>{(name || '?')[0]}</div>
                        <span className="text-sm font-medium text-slate-800 dark:text-slate-100">{name}</span>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-sm text-slate-400 dark:text-slate-500 mt-1 italic">Ninguem</p>
              )}
            </div>
            <div className="p-4">
              <label className="text-[10px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Pego por</label>
              {member ? (
                <div className="flex items-center gap-2 mt-1">
                  <div className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold" style={{ backgroundColor: member.color }}>{member.name.charAt(0)}</div>
                  <span className="text-sm font-medium text-slate-800 dark:text-slate-100">{shortName(member.name)}</span>
                </div>
              ) : (
                <p className="text-sm text-slate-400 dark:text-slate-500 mt-1 italic">Ninguem</p>
              )}
            </div>
          </div>

          {/* Supervisor */}
          <div className="px-6 py-3 border-b border-slate-200 dark:border-slate-700 flex items-center gap-2.5 bg-amber-50/30 dark:bg-amber-900/10">
            <svg className="w-4 h-4 text-amber-500 dark:text-amber-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
            <label className="text-[10px] font-semibold text-amber-600 dark:text-amber-400 uppercase tracking-wider">Supervisor</label>
            {order.supervisor ? (
              <div className="flex flex-wrap items-center gap-2 ml-1">
                {(order.supervisor || '').split(',').map(s => s.trim()).filter(Boolean).map((name, i) => {
                  const sv = teamMembers.find(tm => namesMatch(tm.name, name));
                  return (
                    <div key={i} className="flex items-center gap-1.5">
                      <div className="w-6 h-6 rounded-full flex items-center justify-center text-white text-[10px] font-bold" style={{ backgroundColor: sv?.color || '#f59e0b' }}>{(name || '?')[0]}</div>
                      <span className="text-sm font-medium text-slate-800 dark:text-slate-100">{name}</span>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-sm text-slate-400 dark:text-slate-500 ml-1 italic">Nenhum</p>
            )}
          </div>

          {/* Juiz — arbitra a contestação da nota (terceiro neutro) */}
          <div className="px-6 py-3 border-b border-slate-200 dark:border-slate-700 flex items-center gap-2.5 bg-indigo-50/30 dark:bg-indigo-900/10">
            <svg className="w-4 h-4 text-indigo-500 dark:text-indigo-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
            </svg>
            <label className="text-[10px] font-semibold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">Juiz</label>
            {order.judge ? (
              <div className="flex flex-wrap items-center gap-2 ml-1">
                {(order.judge || '').split(',').map(s => s.trim()).filter(Boolean).map((name, i) => {
                  const jd = teamMembers.find(tm => namesMatch(tm.name, name));
                  return (
                    <div key={i} className="flex items-center gap-1.5">
                      <div className="w-6 h-6 rounded-full flex items-center justify-center text-white text-[10px] font-bold" style={{ backgroundColor: jd?.color || '#6366f1' }}>{(name || '?')[0]}</div>
                      <span className="text-sm font-medium text-slate-800 dark:text-slate-100">{name}</span>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-sm text-slate-400 dark:text-slate-500 ml-1 italic">Nenhum</p>
            )}
          </div>

          {/* Descricao */}
          {order.description && (
            <div className="p-6 border-b border-slate-200 dark:border-slate-700">
              <label className="text-[10px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Descricao do Servico</label>
              <RichTextDisplay content={order.description} className="text-sm text-slate-700 dark:text-slate-200 mt-2 leading-relaxed" />
            </div>
          )}

          {/* Bloco de Tarefas com cronometro e entregaveis por bloco */}
          {(order.checklist || []).length > 0 && (() => {
            const cl = order.checklist || [];
            const doneCount = cl.filter(i => i.done).length;
            // Calcular duracao real em HORAS UTEIS (seg-sex, 9h-18h)
            const realDuration = (item) => workedMinutes(item);
            const totalTime = cl.reduce((sum, i) => sum + realDuration(i), 0);
            const fmtTime = (min) => {
              if (!min || min <= 0) return '';
              if (min < 60) return `${Math.round(min)}min`;
              const h = Math.floor(min / 60);
              const m = Math.round(min % 60);
              return m > 0 ? `${h}h ${m}min` : `${h}h`;
            };
            const fmtHour = (iso) => {
              if (!iso) return '';
              const d = new Date(iso);
              return d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
            };

            // --- Helpers de output por BLOCO ---
            const getGroupOutput = (groupKey) => {
              const latestCl = checklistRef.current;
              const firstItem = latestCl.find(i => (i.group || '__ungrouped__') === groupKey);
              // Migrar: agregar outputs antigos de itens individuais + groupOutput
              const grpItems = latestCl.filter(i => (i.group || '__ungrouped__') === groupKey);
              const base = firstItem?.groupOutput || { text: '', links: [], files: [] };
              // Coletar outputs legados de itens individuais
              const legacyLinks = grpItems.flatMap(i => i.output?.links || []);
              const legacyFiles = grpItems.flatMap(i => i.output?.files || []);
              const legacyText = grpItems.map(i => i.output?.text || '').filter(Boolean).join('\n');
              return {
                text: base.text || legacyText,
                links: [...(base.links || []), ...legacyLinks],
                files: [...(base.files || []), ...legacyFiles],
              };
            };

            const setGroupOutput = (groupKey, output) => {
              if (!onUpdateOrder) return;
              const latestCl = checklistRef.current;
              let found = false;
              // Limpar outputs antigos de itens individuais e setar groupOutput no primeiro item
              const updated = latestCl.map(i => {
                const itemKey = i.group || '__ungrouped__';
                if (itemKey !== groupKey) return i;
                const cleaned = { ...i };
                delete cleaned.output; // remover output legado individual
                if (!found) {
                  found = true;
                  return { ...cleaned, groupOutput: output };
                }
                delete cleaned.groupOutput;
                return cleaned;
              });
              onUpdateOrder(order.id, { checklist: updated });
            };

            const handleGroupOutputUpdate = (groupKey, outputData) => {
              const current = getGroupOutput(groupKey);
              setGroupOutput(groupKey, { ...current, ...outputData });
            };

            const handleAddGroupLink = (groupKey, url, label) => {
              if (!url.trim()) return;
              const current = getGroupOutput(groupKey);
              const fullUrl = url.trim().startsWith('http') ? url.trim() : `https://${url.trim()}`;
              const newLinks = [...(current.links || []), { id: Date.now(), url: fullUrl, label: label.trim() || fullUrl }];
              setGroupOutput(groupKey, { ...current, links: newLinks });
            };

            const handleRemoveGroupLink = (groupKey, linkId) => {
              const current = getGroupOutput(groupKey);
              setGroupOutput(groupKey, { ...current, links: (current.links || []).filter(l => l.id !== linkId) });
            };

            const handleAddGroupFile = (groupKey, file) => {
              if (!file) return;
              if (file.size > 3 * 1024 * 1024) { toast.warning('Arquivo muito grande! Maximo: 3MB.'); return; }
              const reader = new FileReader();
              reader.onload = (ev) => {
                const current = getGroupOutput(groupKey);
                const isImage = file.type.startsWith('image/');
                const newFile = { id: Date.now(), type: isImage ? 'image' : 'document', data: ev.target.result, label: file.name, mimeType: file.type };
                setGroupOutput(groupKey, { ...current, files: [...(current.files || []), newFile] });
              };
              reader.readAsDataURL(file);
            };

            const handleRemoveGroupFile = (groupKey, fileId) => {
              const current = getGroupOutput(groupKey);
              setGroupOutput(groupKey, { ...current, files: (current.files || []).filter(f => f.id !== fileId) });
            };

            // "Finalizar" (entregar) / reabrir. Lógica de cronômetro em osTimer.js.
            const handleToggle = (item) => {
              if (!onUpdateOrder) return;
              const now = new Date().toISOString();
              let updated;
              if (!item.done) {
                updated = finishTask(checklistRef.current, item.id, { at: now });
              } else {
                updated = reopenTask(checklistRef.current, item.id);
              }
              onUpdateOrder(order.id, { checklist: updated });
              // Base de produtividade: registra a conclusão (ou apaga ao desmarcar).
              const updatedItem = updated.find(i => i.id === item.id);
              if (updatedItem?.done) recordTaskCompletion(order, updatedItem, profileName);
              else removeTaskCompletion(order.id, item.id);
            };

            // Cronômetro explícito: Pegar / Pausar / Retomar (Entregar = handleToggle).
            const runTimer = (fn) => (item) => {
              if (!onUpdateOrder) return;
              onUpdateOrder(order.id, { checklist: fn(checklistRef.current, item.id, { at: new Date().toISOString() }) });
            };
            // Regra "uma tarefa por vez": não dá pra pegar/retomar uma tarefa se a
            // pessoa já tem outra EM ANDAMENTO (rodando, sem pausa) — tem que pausar
            // ou finalizar a atual antes. Em time, vale por responsável (cada um roda
            // a sua); em solo/pool, só uma no total.
            const myRunningTask = (excludeId) => (checklistRef.current || []).find(i =>
              i.id !== excludeId && !i.done && i.startedAt && !i.pausedAt &&
              (order.mode === 'team' ? namesMatch(i.assigneeName, profileName) : true)
            );
            const guardSingleRunning = (item) => {
              const r = myRunningTask(item.id);
              if (r) {
                toast.warning(`Você já está com "${r.text}" em andamento. Pause ou finalize antes de pegar outra tarefa.`);
                return false;
              }
              return true;
            };
            const handleStart = (item) => { if (guardSingleRunning(item)) runTimer(startTask)(item); };
            const handlePause = runTimer(pauseTask);
            const handleResume = (item) => { if (guardSingleRunning(item)) runTimer(resumeTask)(item); };


            // Agrupar tarefas
            const groupOrder = [];
            const groupMap = new Map();
            cl.forEach(item => {
              const key = item.group || '__ungrouped__';
              if (!groupMap.has(key)) { groupMap.set(key, []); groupOrder.push(key); }
              groupMap.get(key).push(item);
            });

            return (
              <div className="p-6 border-b border-slate-200 dark:border-slate-700">
                <div className="flex items-center justify-between mb-3">
                  <label className="text-[10px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Bloco de Tarefas</label>
                  <div className="flex items-center gap-3">
                    {totalTime > 0 && (
                      <span className="text-[10px] text-emerald-500 dark:text-emerald-400">Trabalhado: {fmtTime(totalTime)}</span>
                    )}
                    <span className="text-xs font-medium text-slate-500 dark:text-slate-400">{doneCount}/{cl.length}</span>
                  </div>
                </div>
                <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-700 rounded-full mb-3 overflow-hidden">
                  <div className="h-full bg-emerald-500 rounded-full transition-all duration-300" style={{ width: `${(doneCount / cl.length) * 100}%` }} />
                </div>
                <div className="space-y-2">
                  {(() => {
                    return groupOrder.map(groupKey => {
                      const groupItems = groupMap.get(groupKey);
                      const isGrouped = groupKey !== '__ungrouped__';
                      const groupDone = groupItems.filter(i => i.done).length;
                      const allGroupDone = groupDone === groupItems.length;
                      const isCollapsed = collapsedGroups.has(groupKey);
                      const grpOutput = getGroupOutput(groupKey);
                      const hasAttachments = (grpOutput.links?.length > 0) || (grpOutput.files?.length > 0) || grpOutput.text;

                      return (
                        <div key={groupKey} className={`rounded-xl overflow-hidden border transition-all ${
                          allGroupDone ? 'border-emerald-200 dark:border-emerald-800/50 bg-emerald-50/30 dark:bg-emerald-900/10' :
                          isGrouped ? 'border-slate-200 dark:border-slate-700/60 bg-slate-50/50 dark:bg-slate-800/30' :
                          'border-slate-100 dark:border-slate-700/40'
                        }`}>
                          {/* Header do bloco — clicavel para colapsar/expandir + edicao */}
                          <div className="flex items-center gap-2.5 px-3 py-2.5 hover:bg-slate-100/50 dark:hover:bg-slate-700/30 transition-colors group/grphdr">
                            <button onClick={() => toggleGroupCollapse(groupKey)} className="flex items-center gap-2.5 flex-1 min-w-0 text-left">
                              <svg className={`w-4 h-4 shrink-0 transition-transform duration-200 ${isCollapsed ? '' : 'rotate-90'} ${
                                allGroupDone ? 'text-emerald-500 dark:text-emerald-400' : 'text-indigo-500 dark:text-indigo-400'
                              }`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                              </svg>
                              {isGrouped ? (
                                <svg className={`w-4 h-4 shrink-0 ${allGroupDone ? 'text-emerald-500 dark:text-emerald-400' : 'text-indigo-500 dark:text-indigo-400'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                                </svg>
                              ) : (
                                <svg className="w-4 h-4 text-slate-400 dark:text-slate-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                </svg>
                              )}
                              {editingGroupKey === groupKey && isGrouped ? null : (
                                <span className={`text-xs font-semibold flex-1 truncate ${
                                  allGroupDone ? 'text-emerald-700 dark:text-emerald-300' : 'text-indigo-700 dark:text-indigo-300'
                                }`}>
                                  {isGrouped ? groupKey : 'Tarefas'}
                                </span>
                              )}
                            </button>
                            {/* Responsavel agora e por TAREFA (na planilha), nao por pasta. */}
                            {/* Input de renomear grupo (inline) */}
                            {editingGroupKey === groupKey && isGrouped && (
                              <input
                                type="text"
                                autoFocus
                                defaultValue={groupKey}
                                onBlur={(e) => renameGroupInOrder(groupKey, e.target.value)}
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') e.target.blur();
                                  if (e.key === 'Escape') setEditingGroupKey(null);
                                }}
                                onClick={(e) => e.stopPropagation()}
                                className="text-xs font-semibold text-indigo-700 dark:text-indigo-300 bg-white dark:bg-slate-800 border border-indigo-300 dark:border-indigo-600 rounded px-2 py-0.5 flex-1 min-w-0 outline-none focus:ring-2 focus:ring-indigo-400 dark:focus:ring-indigo-500"
                              />
                            )}
                            {/* Botoes de acao do grupo */}
                            {canEditOS && isGrouped && editingGroupKey !== groupKey && (
                              <div className="flex items-center gap-1 md:opacity-0 md:group-hover/grphdr:opacity-100 transition-opacity">
                                <button
                                  onClick={(e) => { e.stopPropagation(); setEditingGroupKey(groupKey); }}
                                  className="p-1 text-slate-400 dark:text-slate-500 hover:text-indigo-500 dark:hover:text-indigo-400 transition-colors rounded"
                                  title="Renomear pasta"
                                >
                                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                                </button>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    if (confirm(`Remover pasta "${groupKey}" e todas as suas ${groupItems.length} tarefas?`)) {
                                      removeGroupFromOrder(groupKey);
                                    }
                                  }}
                                  className="p-1 text-slate-400 dark:text-slate-500 hover:text-red-500 dark:hover:text-red-400 transition-colors rounded"
                                  title="Remover pasta"
                                >
                                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                </button>
                              </div>
                            )}
                            {hasAttachments && (
                              <span className="flex items-center gap-0.5 text-[10px] text-violet-500 dark:text-violet-400 shrink-0">
                                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                                </svg>
                                {(grpOutput.links?.length || 0) + (grpOutput.files?.length || 0)}
                              </span>
                            )}
                            <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded shrink-0 ${
                              allGroupDone ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400' :
                              'bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400'
                            }`}>
                              {groupDone}/{groupItems.length}
                            </span>
                            {allGroupDone && (
                              <svg className="w-4 h-4 text-emerald-500 dark:text-emerald-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                              </svg>
                            )}
                          </div>

                          {/* Conteudo colapsavel: tarefas + entregaveis */}
                          {!isCollapsed && (
                            <div className="border-t border-slate-200/60 dark:border-slate-700/40">
                              {/* Planilha de tarefas — grade com linhas e colunas */}
                              <div className="px-2 py-1.5">
                                <div className="rounded-lg border border-slate-300 dark:border-slate-600 overflow-x-auto">
                                  {/* Cabecalho */}
                                  <div className="grid grid-cols-[2.25rem_minmax(0,1fr)_8.5rem_8.5rem_13rem_7rem_4.5rem] min-w-[820px] items-stretch divide-x divide-slate-200 dark:divide-slate-700 border-b border-slate-300 dark:border-slate-600 bg-slate-100 dark:bg-slate-800/60 text-[10px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                                    <div aria-hidden />
                                    <div className="px-3 py-2 flex items-center">Tarefa</div>
                                    <div className="px-3 py-2 flex items-center">Responsavel</div>
                                    <div className="px-3 py-2 flex items-center text-blue-500 dark:text-blue-400">Previsao de entrega</div>
                                    <div className="px-3 py-2 flex items-center text-emerald-600 dark:text-emerald-400">Tempo trabalhado</div>
                                    <div className="px-3 py-2 flex items-center text-emerald-600 dark:text-emerald-400">Entrega real</div>
                                    <div className="px-3 py-2 flex items-center">Briefing</div>
                                  </div>
                                  {/* Linhas */}
                                  <div className="divide-y divide-slate-200 dark:divide-slate-700">
                                    {groupItems.map((item) => {
                                      const arrIdx = cl.findIndex(i => i.id === item.id);
                                      const soloResp = item.assigneeName || (order.mode !== 'team' ? (order.assignee || '') : '');
                                      // "Real" (completedAt = instante genuino) x "Previsto" (dueAt = wall
                                      // clock rotulado UTC): compara os dois como wall clock pra nao falsear
                                      // o atraso pelo fuso.
                                      let realLate = false;
                                      let realLabel = '';
                                      if (item.done && item.completedAt) {
                                        const c = new Date(item.completedAt);
                                        const pad = (n) => String(n).padStart(2, '0');
                                        const H = c.getHours(), M = c.getMinutes();
                                        realLabel = `${pad(c.getDate())}/${pad(c.getMonth() + 1)} ${M === 0 ? pad(H) + 'h' : pad(H) + ':' + pad(M)}`;
                                        if (item.dueAt) {
                                          const completedWall = Date.UTC(c.getFullYear(), c.getMonth(), c.getDate(), H, M);
                                          realLate = completedWall > new Date(item.dueAt).getTime();
                                        }
                                      }
                                      return (
                                        <div
                                          key={item.id}
                                          className={`grid grid-cols-[2.25rem_minmax(0,1fr)_8.5rem_8.5rem_13rem_7rem_4.5rem] min-w-[820px] items-stretch divide-x divide-slate-200 dark:divide-slate-700/60 transition-colors ${item.done ? 'bg-slate-50/60 dark:bg-slate-800/20' : 'hover:bg-blue-50/40 dark:hover:bg-blue-900/10'}`}
                                        >
                                          {/* # (verde quando concluída) */}
                                          <div className="flex items-center justify-center py-2">
                                            <span className={`text-[11px] font-mono ${item.done ? 'text-emerald-500' : 'text-slate-400 dark:text-slate-500'}`}>{arrIdx + 1}</span>
                                          </div>
                                          {/* tarefa (titulo completo, quebra linha; status/tempo inline) */}
                                          <div className="min-w-0 px-3 py-2 flex items-center">
                                            <div className="min-w-0 text-sm leading-snug">
                                              <span className={item.done ? 'line-through text-slate-400 dark:text-slate-500' : 'text-slate-700 dark:text-slate-200 font-medium'}>{item.text}</span>
                                              {item.reviewStatus && item.reviewStatus !== 'draft' && (
                                                <span className={`ml-1.5 align-middle inline-block text-[9px] font-semibold uppercase tracking-wide px-1.5 py-0.5 rounded ${item.reviewStatus === 'approved' ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400' : item.reviewStatus === 'changes' ? 'bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400' : 'bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400'}`}>
                                                  {item.reviewStatus === 'approved' ? 'Aprovado' : item.reviewStatus === 'changes' ? 'Ajustar' : 'Em revisao'}
                                                </span>
                                              )}
                                            </div>
                                          </div>
                                          {/* responsavel */}
                                          <div className="min-w-0 px-3 py-2 flex items-center">
                                            {order.mode === 'team' && (order.participants || []).length > 1 ? (
                                              <GroupAssigneeButton
                                                participants={order.participants || []}
                                                currentAssignees={item.assigneeName ? [{ id: item.assigneeId || null, name: item.assigneeName }] : []}
                                                disabled={!canEditOS}
                                                onToggle={async (member) => {
                                                  try {
                                                    const same = (item.assigneeId && member.id && item.assigneeId === member.id) || item.assigneeName === member.name;
                                                    await setItemAssignee(order.id, item.id, same ? null : member);
                                                    queryClient.invalidateQueries({ queryKey: ['osOrders'] });
                                                  } catch (err) {
                                                    toast.error(`Erro ao atribuir tarefa: ${err?.message || err}`);
                                                  }
                                                }}
                                              />
                                            ) : (
                                              <span className="text-xs text-slate-500 dark:text-slate-400 truncate block" title={soloResp || undefined}>{soloResp || '—'}</span>
                                            )}
                                          </div>
                                          {/* prazo previsto */}
                                          <div className="px-3 py-2 flex items-center">
                                            <DueDateButton
                                              dueAt={item.dueAt || null}
                                              done={item.done}
                                              disabled={!canEditOS}
                                              size="xs"
                                              onChange={async (iso) => {
                                                try {
                                                  await setItemDueAt(order.id, item.id, iso);
                                                  queryClient.invalidateQueries({ queryKey: ['osOrders'] });
                                                } catch (err) {
                                                  toast.error(`Erro ao salvar prazo: ${err?.message || err}`);
                                                }
                                              }}
                                            />
                                          </div>
                                          {/* Tempo trabalhado: CRONOMETRO (Pegar → Pausar/Retomar → Finalizar) */}
                                          <div className="px-3 py-2 flex items-center">
                                            {(() => {
                                              const st = timerState(item); // idle | running | paused | done
                                              const mins = realDuration(item);
                                              const finishBtn = (
                                                <button type="button" disabled={!canEditOS} onClick={() => handleToggle(item)} title="Finalizar (entregar + parar o cronômetro)" aria-label="Finalizar tarefa"
                                                  className="inline-flex items-center gap-1 text-[11px] font-semibold px-3 py-1.5 rounded-md border border-emerald-500 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 disabled:opacity-40">
                                                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg> Finalizar
                                                </button>
                                              );
                                              const iconBtn = 'inline-flex items-center justify-center w-9 h-9 rounded-md disabled:opacity-40 transition-colors';
                                              if (st === 'done') {
                                                return (
                                                  <span className="flex items-center gap-2">
                                                    <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400 tabular-nums">{fmtTime(mins) || '0min'}</span>
                                                    {canEditOS && (
                                                      <button type="button" onClick={() => handleToggle(item)} title="Reabrir" aria-label="Reabrir tarefa"
                                                        className={`${iconBtn} text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-700/50`}>
                                                        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h5M4.6 9a7.5 7.5 0 1 1-.3 4" /></svg>
                                                      </button>
                                                    )}
                                                  </span>
                                                );
                                              }
                                              if (st === 'running') {
                                                return (
                                                  <span className="flex items-center gap-1.5">
                                                    <LiveWorkedTime item={item} className="text-sm font-bold text-emerald-600 dark:text-emerald-400 tabular-nums" />
                                                    <button type="button" disabled={!canEditOS} onClick={() => handlePause(item)} title="Pausar" aria-label="Pausar cronômetro"
                                                      className={`${iconBtn} text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-900/20`}>
                                                      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M6 4h4v16H6zM14 4h4v16h-4z" /></svg>
                                                    </button>
                                                    {finishBtn}
                                                  </span>
                                                );
                                              }
                                              if (st === 'paused') {
                                                return (
                                                  <span className="flex items-center gap-1.5">
                                                    <span className="text-sm font-bold text-amber-600 dark:text-amber-400 tabular-nums" title="Pausado">{fmtClock(workedSeconds(item))}</span>
                                                    <button type="button" disabled={!canEditOS} onClick={() => handleResume(item)} title="Retomar" aria-label="Retomar cronômetro"
                                                      className={`${iconBtn} text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/20`}>
                                                      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z" /></svg>
                                                    </button>
                                                    {finishBtn}
                                                  </span>
                                                );
                                              }
                                              // idle — só o botão Pegar (começa o cronômetro do zero)
                                              return (
                                                <button type="button" disabled={!canEditOS} onClick={() => handleStart(item)} title="Pegar a tarefa (iniciar o cronômetro)" aria-label="Pegar tarefa e iniciar cronômetro"
                                                  className="inline-flex items-center gap-1 text-[11px] font-semibold px-3 py-1.5 rounded-md border border-emerald-400 text-emerald-600 dark:border-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 disabled:opacity-40">
                                                  <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z" /></svg> Pegar
                                                </button>
                                              );
                                            })()}
                                          </div>
                                          {/* Entrega real (instante em que foi finalizada) */}
                                          <div className="px-3 py-2 flex items-center">
                                            {item.done && item.completedAt ? (
                                              <span className={`text-xs whitespace-nowrap ${realLate ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-600 dark:text-emerald-400'}`}
                                                title={realLate ? 'Entregue com atraso' : 'Entregue no prazo'}>{realLabel}</span>
                                            ) : (
                                              <span className="text-xs text-slate-300 dark:text-slate-600">—</span>
                                            )}
                                          </div>
                                          {/* briefing + entrega */}
                                          <div className="px-3 py-2 flex items-center gap-1">
                                            <button
                                              type="button"
                                              onClick={() => openBriefing(item, 'briefing')}
                                              title={item.briefing ? 'Ver/editar briefing' : 'Adicionar briefing'}
                                              className={`shrink-0 inline-flex items-center justify-center w-7 h-7 rounded-md border transition-colors ${item.briefing ? 'text-fyness-primary border-fyness-primary/30 bg-fyness-primary/10 hover:bg-fyness-primary/20' : 'text-slate-400 dark:text-slate-500 border-slate-200 dark:border-slate-600 hover:border-fyness-primary hover:text-fyness-primary'}`}
                                            >
                                              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                                            </button>
                                            {item.done && (
                                              <button
                                                type="button"
                                                onClick={() => openBriefing(item, 'entrega')}
                                                title={item.delivery ? 'Ver/editar entrega' : 'Anexar entrega (o que foi feito + print)'}
                                                className={`shrink-0 inline-flex items-center justify-center w-7 h-7 rounded-md border transition-colors ${item.delivery ? 'text-emerald-600 dark:text-emerald-400 border-emerald-500/30 bg-emerald-500/10 hover:bg-emerald-500/20' : 'text-slate-400 dark:text-slate-500 border-slate-200 dark:border-slate-600 hover:border-emerald-500 hover:text-emerald-600 dark:hover:text-emerald-400'}`}
                                              >
                                                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                                              </button>
                                            )}
                                          </div>
                                        </div>
                                      );
                                    })}
                                  </div>
                                </div>
                              </div>

                              {/* Entregaveis do BLOCO — aparece quando todas as tarefas do bloco estao concluidas */}
                              {allGroupDone && (
                                <div className="px-3 pb-3 pt-1 border-t border-emerald-200/50 dark:border-emerald-800/30">
                                  <div className="flex items-center gap-1.5 mb-2">
                                    <svg className="w-3.5 h-3.5 text-violet-500 dark:text-violet-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                                    </svg>
                                    <span className="text-[10px] font-semibold text-violet-600 dark:text-violet-400 uppercase tracking-wider">Entregaveis do Bloco</span>
                                  </div>
                                  <div className="space-y-2">
                                    {/* Texto/descricao existente */}
                                    {grpOutput.text && (
                                      <p className="text-xs text-slate-600 dark:text-slate-300 whitespace-pre-wrap leading-relaxed bg-violet-50/50 dark:bg-violet-900/10 rounded-lg px-3 py-2">{grpOutput.text}</p>
                                    )}
                                    {/* Links existentes */}
                                    {(grpOutput.links || []).length > 0 && (
                                      <div className="flex flex-wrap gap-1.5">
                                        {grpOutput.links.map(link => (
                                          <div key={link.id} className="flex items-center gap-1 px-2 py-1 bg-violet-50 dark:bg-violet-900/20 rounded-lg group/link">
                                            <svg className="w-3 h-3 text-violet-500 dark:text-violet-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101" />
                                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.172 13.828a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.102 1.101" />
                                            </svg>
                                            <a href={link.url} target="_blank" rel="noopener noreferrer" className="text-[11px] text-violet-600 dark:text-violet-400 hover:underline font-medium max-w-[200px] truncate">{link.label}</a>
                                            <button onClick={() => handleRemoveGroupLink(groupKey, link.id)} className="p-0.5 text-violet-300 dark:text-violet-600 hover:text-red-500 dark:hover:text-red-400 md:opacity-0 md:group-hover/link:opacity-100 transition-all">
                                              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                                            </button>
                                          </div>
                                        ))}
                                      </div>
                                    )}
                                    {/* Arquivos existentes */}
                                    {(grpOutput.files || []).length > 0 && (
                                      <div className="space-y-1.5">
                                        {grpOutput.files.filter(f => f.type === 'image').length > 0 && (
                                          <div className="grid grid-cols-3 gap-1.5">
                                            {grpOutput.files.filter(f => f.type === 'image').map(f => (
                                              <div key={f.id} className="relative group/file">
                                                <img src={f.data} alt={f.label} className="w-full h-20 object-cover rounded-lg border border-violet-200 dark:border-violet-800/50" />
                                                <button onClick={() => handleRemoveGroupFile(groupKey, f.id)} className="absolute top-1 right-1 p-0.5 bg-red-500 text-white rounded-full md:opacity-0 md:group-hover/file:opacity-100 transition-all shadow">
                                                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                                                </button>
                                                <p className="text-[9px] text-slate-400 dark:text-slate-500 mt-0.5 truncate">{f.label}</p>
                                              </div>
                                            ))}
                                          </div>
                                        )}
                                        {grpOutput.files.filter(f => f.type === 'document').map(f => (
                                          <div key={f.id} className="flex items-center gap-2 px-2 py-1.5 bg-violet-50 dark:bg-violet-900/20 rounded-lg group/file">
                                            <svg className="w-3.5 h-3.5 text-violet-500 dark:text-violet-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                                            </svg>
                                            <a href={f.data} download={f.label} className="text-[11px] text-violet-600 dark:text-violet-400 hover:underline font-medium flex-1 truncate">{f.label}</a>
                                            <button onClick={() => handleRemoveGroupFile(groupKey, f.id)} className="p-0.5 text-violet-300 dark:text-violet-600 hover:text-red-500 dark:hover:text-red-400 md:opacity-0 md:group-hover/file:opacity-100 transition-all">
                                              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                                            </button>
                                          </div>
                                        ))}
                                      </div>
                                    )}
                                    {/* Inputs para adicionar entregavel ao bloco */}
                                    <div className="space-y-1.5 mt-1">
                                      <AutoTextarea
                                        placeholder="Descreva o que foi entregue neste bloco..."
                                        minRows={1}
                                        defaultValue={grpOutput.text || ''}
                                        key={`grp_text_${groupKey}_${grpOutput.text?.length || 0}`}
                                        onBlur={(e) => handleGroupOutputUpdate(groupKey, { text: e.target.value })}
                                        className="w-full px-2.5 py-1.5 text-xs border border-slate-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-violet-400 focus:border-transparent placeholder:text-slate-300 dark:placeholder:text-slate-600"
                                      />
                                      <div className="flex gap-1.5">
                                        <input
                                          type="text"
                                          placeholder="Link de entrega..."
                                          className="flex-1 px-2.5 py-1.5 text-xs border border-slate-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-violet-400 focus:border-transparent placeholder:text-slate-300 dark:placeholder:text-slate-600"
                                          onKeyDown={(e) => {
                                            if (e.key === 'Enter' && e.target.value.trim()) {
                                              e.preventDefault();
                                              handleAddGroupLink(groupKey, e.target.value, '');
                                              e.target.value = '';
                                            }
                                          }}
                                        />
                                        <button
                                          onClick={(e) => {
                                            const input = e.target.closest('div').querySelector('input[type="text"]');
                                            if (input && input.value.trim()) { handleAddGroupLink(groupKey, input.value, ''); input.value = ''; }
                                          }}
                                          className="px-2 py-1.5 bg-violet-500 text-white rounded-lg hover:bg-violet-600 transition-colors text-xs font-medium shrink-0"
                                          title="Adicionar link"
                                        >
                                          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                                          </svg>
                                        </button>
                                      </div>
                                      {/* Drop zone para arquivos */}
                                      <label
                                        className="flex flex-col items-center justify-center gap-1 px-3 py-3 border-2 border-dashed border-violet-300 dark:border-violet-700 rounded-xl text-violet-400 dark:text-violet-500 hover:border-violet-400 hover:bg-violet-50/50 dark:hover:bg-violet-900/10 cursor-pointer transition-all data-[dragging=true]:border-violet-500 data-[dragging=true]:bg-violet-50 dark:data-[dragging=true]:bg-violet-900/20 data-[dragging=true]:scale-[1.02]"
                                        onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); e.currentTarget.dataset.dragging = 'true'; }}
                                        onDragLeave={(e) => { e.preventDefault(); e.stopPropagation(); e.currentTarget.dataset.dragging = 'false'; }}
                                        onDrop={(e) => {
                                          e.preventDefault(); e.stopPropagation(); e.currentTarget.dataset.dragging = 'false';
                                          Array.from(e.dataTransfer.files).forEach(f => handleAddGroupFile(groupKey, f));
                                        }}
                                      >
                                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                                        </svg>
                                        <span className="text-[11px] font-medium">Arraste arquivos ou clique aqui</span>
                                        <span className="text-[9px] text-violet-300 dark:text-violet-600">Fotos e documentos (max 3MB)</span>
                                        <input type="file" multiple accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.csv,.txt,.ppt,.pptx,.zip,.rar" className="hidden" onChange={(e) => { Array.from(e.target.files || []).forEach(f => handleAddGroupFile(groupKey, f)); e.target.value = ''; }} />
                                      </label>
                                    </div>
                                  </div>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    });
                  })()}
                  {/* Botao para adicionar nova pasta */}
                  {canEditOS && (
                    <button
                      type="button"
                      onClick={() => {
                        const name = prompt('Nome da nova pasta:');
                        if (name) addGroupToOrder(name);
                      }}
                      className="flex items-center gap-1.5 px-3 py-2 border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-xl text-xs font-medium text-slate-500 dark:text-slate-400 hover:border-indigo-400 hover:text-indigo-500 dark:hover:border-indigo-500 dark:hover:text-indigo-400 transition-colors"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" /></svg>
                      Nova Pasta
                    </button>
                  )}
                </div>
              </div>
            );
          })()}

          {order.notes && (
            <div className="p-6 border-b border-slate-200 dark:border-slate-700 bg-amber-50/50 dark:bg-amber-900/10">
              <label className="text-[10px] font-semibold text-amber-600 uppercase tracking-wider">Observacoes</label>
              <RichTextDisplay content={order.notes} className="text-sm text-slate-700 dark:text-slate-200 mt-2 leading-relaxed" />
            </div>
          )}

          {/* Custos (so gestor) */}
          {canViewCosts && order.status === 'done' && (() => {
            const cost = calcOSCost(order, teamMembers);
            const expenses = order.expenses || [];
            const fmtHrs = (h) => {
              if (!h || h <= 0) return '0min';
              if (h < 1) return `${Math.round(h * 60)}min`;
              const hrs = Math.floor(h);
              const mins = Math.round((h - hrs) * 60);
              return mins > 0 ? `${hrs}h ${mins}min` : `${hrs}h`;
            };
            return (
              <div className="p-6 border-b border-slate-200 dark:border-slate-700 bg-amber-50/30 dark:bg-amber-900/10">
                <label className="text-[10px] font-semibold text-amber-600 uppercase tracking-wider">Custo da Ordem de Servico</label>
                <div className="mt-3 space-y-3">
                  {/* Mao de obra */}
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-slate-700 dark:text-slate-200">Mao de Obra</p>
                      <p className="text-[10px] text-slate-400 dark:text-slate-500">
                        {cost.hours > 0 ? `${fmtHrs(cost.hours)} trabalhadas` : 'Sem tempo registrado'}
                        {cost.hourlyRate > 0 && ` x ${formatCurrency(cost.hourlyRate)}/h`}
                      </p>
                      {!cost.memberFound && order.assignee && (
                        <p className="text-[10px] text-red-400">Membro "{order.assignee}" nao encontrado na equipe</p>
                      )}
                      {cost.memberFound && cost.hourlyRate <= 0 && (
                        <p className="text-[10px] text-red-400">Salario nao configurado para este membro</p>
                      )}
                    </div>
                    <span className="text-sm font-bold text-slate-800 dark:text-slate-100">{formatCurrency(cost.laborCost)}</span>
                  </div>

                  {/* Materiais */}
                  {expenses.length > 0 && (
                    <div>
                      <p className="text-sm font-medium text-slate-700 dark:text-slate-200 mb-1.5">Materiais e Ferramentas</p>
                      <div className="space-y-1">
                        {expenses.map((exp, idx) => (
                          <div key={idx} className="flex items-center justify-between text-xs bg-white dark:bg-slate-800 rounded px-3 py-1.5 border border-amber-100 dark:border-amber-800/30">
                            <span className="text-slate-600 dark:text-slate-300">
                              {exp.quantity > 1 && <span className="font-medium">{exp.quantity}x </span>}
                              {exp.name}
                            </span>
                            <span className="font-medium text-slate-800 dark:text-slate-100">{formatCurrency((exp.value || 0) * (exp.quantity || 1))}</span>
                          </div>
                        ))}
                      </div>
                      <div className="flex justify-end mt-1">
                        <span className="text-xs text-amber-600 font-medium">Subtotal materiais: {formatCurrency(cost.materialCost)}</span>
                      </div>
                    </div>
                  )}

                  {/* Total */}
                  <div className="border-t border-amber-200 dark:border-amber-700/30 pt-2 flex items-center justify-between">
                    <span className="text-sm font-bold text-slate-800 dark:text-slate-100">Custo Total</span>
                    <span className="text-lg font-bold text-amber-600">{formatCurrency(cost.totalCost)}</span>
                  </div>
                </div>
              </div>
            );
          })()}

          {/* Anexos */}
          <div className="p-6 border-b border-slate-200 dark:border-slate-700">
            <label className="text-[10px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Anexos</label>

            {docAttachments.length === 0 ? (
              <p className="text-sm text-slate-400 dark:text-slate-500 italic mt-2">Sem anexos.</p>
            ) : (
              <div className="mt-3 space-y-3">
                {docAttachments.filter(a => a.type === 'link').length > 0 && (
                  <div className="space-y-1.5">
                    {docAttachments.filter(a => a.type === 'link').map(att => (
                      <a
                        key={att.id}
                        href={att.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 px-3 py-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors group"
                      >
                        <svg className="w-4 h-4 text-blue-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                        </svg>
                        <span className="text-sm text-blue-600 font-medium group-hover:underline truncate print:text-slate-800">{att.label}</span>
                        <span className="hidden print:inline text-xs text-slate-500 ml-1 truncate">({att.url})</span>
                        <svg className="w-3.5 h-3.5 text-blue-400 shrink-0 ml-auto print:hidden" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        </svg>
                      </a>
                    ))}
                  </div>
                )}

                {docAttachments.filter(a => a.type === 'image').length > 0 && (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 print:grid-cols-2 print:gap-4">
                    {docAttachments.filter(a => a.type === 'image').map(att => (
                      <div key={att.id} className="print:break-inside-avoid">
                        <a href={att.data} target="_blank" rel="noopener noreferrer">
                          <img src={att.data} alt={att.label} className="w-full h-32 object-cover rounded-lg border border-slate-200 dark:border-slate-700 hover:border-fyness-primary transition-colors cursor-pointer print:h-auto print:max-h-48 print:object-contain print:rounded-none" />
                        </a>
                        <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1 truncate">{att.label}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Rodape */}
          <div className="bg-slate-50 dark:bg-slate-800/50 px-8 py-3 text-center border-t border-slate-200 dark:border-slate-700 rounded-b-xl">
            <p className="text-[10px] text-slate-400 dark:text-slate-500">Fyness - Gestao de Processos Empresariais | Documento gerado em {formatDate(new Date().toISOString())}</p>
          </div>
        </div>
      </div>

    </div>
  );
}

// ==================== MODAL FORMULARIO O.S. ====================

function OSFormModal({ form, setForm, editing, number, projects, onSave, onClose, onDelete, teamMembers, isEmergency = false, emergencyNumber = 1, allOrders = [], clients = [], saving = false, profileName = '' }) {
  const update = (field, value) => setForm(prev => ({ ...prev, [field]: value }));

  // Briefing por tarefa JA NA CRIACAO — painel lateral estilo Notion.
  // Rascunho local; grava no checklist do form ao fechar (vai junto ao salvar a O.S.).
  const [briefingItemId, setBriefingItemId] = useState(null);
  const [briefingDraft, setBriefingDraft] = useState('');
  const briefingItem = briefingItemId != null ? ((form.checklist || []).find(i => i.id === briefingItemId) || null) : null;
  const openBriefing = (item) => { setBriefingDraft(item.briefing || ''); setBriefingItemId(item.id); };
  const closeBriefing = () => {
    if (briefingItem && briefingDraft !== (briefingItem.briefing || '')) {
      const hasContent = !!stripHtml(briefingDraft);
      update('checklist', (form.checklist || []).map(i => {
        if (i.id !== briefingItem.id) return i;
        const next = { ...i, briefing: briefingDraft };
        if (!hasContent) { next.briefingBy = null; next.briefingAt = null; }
        else if (!i.briefingBy) { next.briefingBy = profileName || 'Voce'; next.briefingAt = new Date().toISOString(); }
        return next;
      }));
    }
    setBriefingItemId(null);
  };

  // Aplica um MODELO no form: titulo/descricao/prioridade/notas + checklist
  // (tarefas e briefings prontos, com ids novos e estado de execucao zerado).
  const applyTemplate = (tpl) => {
    if (!tpl) return;
    setForm(prev => ({
      ...prev,
      title: tpl.title || prev.title || '',
      description: tpl.description || prev.description || '',
      priority: tpl.priority || prev.priority || 'medium',
      notes: tpl.notes || prev.notes || '',
      checklist: (tpl.checklist || []).map((it, i) => ({
        id: Date.now() + i + Math.random(),
        text: it.text || '',
        group: it.group || null,
        briefing: it.briefing || '',
        done: false, startedAt: null, completedAt: null, durationMin: null, pausedAt: null, accumulatedMin: 0,
      })),
    }));
    toast.success(`Modelo "${tpl.name}" aplicado`);
  };

  const inProgressOrders = allOrders.filter(o => o.type !== 'emergency' && (o.status === 'in_progress' || o.status === 'available'));
  const [linkUrl, setLinkUrl] = useState('');
  const [linkLabel, setLinkLabel] = useState('');
  const [newGroupName, setNewGroupName] = useState('');
  const [showNewGroupInput, setShowNewGroupInput] = useState(false);
  const [dragTaskId, setDragTaskId] = useState(null);
  const [dragOverTaskId, setDragOverTaskId] = useState(null);
  const [pendingNewGroup, setPendingNewGroup] = useState(null);
  const checklistTextareaRef = useRef(null);
  const initialFormRef = useRef(JSON.stringify(form));
  // Resetar referencia inicial quando o modal abre com dados diferentes (editar outro OS)
  useEffect(() => { initialFormRef.current = JSON.stringify(form); }, [editing, number]);

  // Fechar com Escape (global) e proteger contra fechar com dados alterados
  const isDirty = JSON.stringify(form) !== initialFormRef.current;
  const [showDiscardConfirm, setShowDiscardConfirm] = useState(false);
  const safeClose = useCallback(() => {
    if (isDirty) {
      setShowDiscardConfirm(true);
    } else {
      onClose();
    }
  }, [isDirty, onClose]);

  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape') {
        if (showDiscardConfirm) { setShowDiscardConfirm(false); return; }
        safeClose();
      }
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [safeClose, showDiscardConfirm]);

  // Focus trap: keep Tab within modal
  useEffect(() => {
    const modal = document.querySelector('[role="dialog"]');
    if (!modal) return;
    const focusable = modal.querySelectorAll('input, button, select, textarea, [tabindex]:not([tabindex="-1"])');
    if (!focusable.length) return;
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    const handleTab = (e) => {
      if (e.key !== 'Tab') return;
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    };
    window.addEventListener('keydown', handleTab);
    return () => window.removeEventListener('keydown', handleTab);
  }, []);

  // Helper: parseia linhas de texto em itens de checklist
  const parseChecklistLines = (text) => {
    const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
    if (lines.length === 0) return [];
    const hasGroups = lines.some(l => l.startsWith('-') || l.startsWith('*'));
    let currentGroup = null;
    const items = [];
    lines.forEach((line, i) => {
      if (hasGroups && !line.startsWith('-') && !line.startsWith('*')) {
        currentGroup = line;
      } else {
        const t = line.replace(/^[-*]\s*/, '');
        if (t) {
          items.push({ id: Date.now() + i, text: t, group: currentGroup || null, done: false, startedAt: null, completedAt: null, durationMin: null, pausedAt: null, accumulatedMin: 0 });
        }
      }
    });
    return items;
  };

  // Auto-parseia textarea antes de salvar
  const handleSaveClick = () => {
    let finalChecklist = [...(form.checklist || [])];
    if (checklistTextareaRef.current && checklistTextareaRef.current.value.trim()) {
      const newItems = parseChecklistLines(checklistTextareaRef.current.value);
      if (newItems.length > 0) {
        finalChecklist = [...finalChecklist, ...newItems];
        checklistTextareaRef.current.value = '';
      }
    }
    const finalForm = { ...form, checklist: finalChecklist };
    setForm(finalForm);
    onSave(finalForm);
  };

  const attachments = form.attachments || [];

  const addLink = () => {
    if (!linkUrl.trim()) return;
    const url = linkUrl.trim().startsWith('http') ? linkUrl.trim() : `https://${linkUrl.trim()}`;
    const newAtt = { id: `att_${Date.now()}`, type: 'link', url, label: linkLabel.trim() || url, createdAt: new Date().toISOString() };
    update('attachments', [...attachments, newAtt]);
    setLinkUrl('');
    setLinkLabel('');
  };

  const addImage = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      toast.warning('Imagem muito grande! Maximo: 2MB.');
      return;
    }
    const reader = new FileReader();
    reader.onload = (ev) => {
      const newAtt = { id: `att_${Date.now()}`, type: 'image', data: ev.target.result, label: file.name, createdAt: new Date().toISOString() };
      update('attachments', [...attachments, newAtt]);
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const removeAttachment = (id) => {
    update('attachments', attachments.filter(a => a.id !== id));
  };

  return (
    <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center z-50" role="dialog" aria-modal="true" aria-label="Formulario de Ordem de Servico" onClick={safeClose}>
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-white/60 dark:border-white/10 shadow-glass-lg max-w-lg w-full mx-4 overflow-hidden max-h-[90vh] flex flex-col animate-scale-in" onClick={(e) => e.stopPropagation()}>
        <div className={`p-6 border-b ${isEmergency ? 'border-red-200 dark:border-red-800/50 bg-red-50 dark:bg-red-950/20' : 'border-slate-200 dark:border-slate-700'} flex items-center justify-between shrink-0`}>
          <h3 className={`text-lg font-semibold ${isEmergency ? 'text-red-700 dark:text-red-300' : 'text-slate-800 dark:text-slate-100'}`}>
            {isEmergency
              ? `Nova Emergencial EMG-${String(emergencyNumber).padStart(3, '0')}`
              : editing ? `Editar O.S. #${number}` : `Nova O.S. #${number}`
            }
          </h3>
          <button onClick={safeClose} className="p-1 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors">
            <svg className="w-5 h-5 text-slate-400 dark:text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-6 space-y-4 overflow-y-auto">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-1">Titulo do Servico *</label>
            <input type="text" value={form.title} onChange={(e) => update('title', e.target.value)} className="w-full px-4 py-2.5 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-fyness-primary focus:border-transparent text-sm" placeholder="Ex: Manutencao do servidor principal" autoFocus />
          </div>

          {/* Projeto */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-1">Projeto</label>
            <div className="relative">
              <select
                value={form.projectId || ''}
                onChange={(e) => update('projectId', e.target.value || null)}
                className="w-full appearance-none px-4 py-2.5 pr-8 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-fyness-primary focus:border-transparent text-sm"
              >
                <option value="">Sem projeto</option>
                {projects.map(p => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
              <svg className="w-4 h-4 text-slate-400 dark:text-slate-500 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>

          {/* Vincular a O.S. (apenas emergencial) */}
          {isEmergency && (
            <div>
              <label className="block text-sm font-medium text-red-600 dark:text-red-400 mb-1">Vincular a O.S. (origem da emergencia)</label>
              <div className="relative">
                <select
                  value={form.parentOrderId || ''}
                  onChange={(e) => update('parentOrderId', e.target.value || null)}
                  className="w-full appearance-none px-4 py-2.5 pr-8 border border-red-300 dark:border-red-700/50 rounded-lg bg-white dark:bg-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent text-sm"
                >
                  <option value="">Sem vinculo (emergencia avulsa)</option>
                  {inProgressOrders.map(o => (
                    <option key={o.id} value={o.id}>O.S. #{o.number} — {o.title}</option>
                  ))}
                </select>
                <svg className="w-4 h-4 text-red-400 dark:text-red-500 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-1">Local / Ambiente</label>
            <input type="text" value={form.location} onChange={(e) => update('location', e.target.value)} className="w-full px-4 py-2.5 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-fyness-primary focus:border-transparent text-sm" placeholder="Ex: Servidor AWS, Producao, etc." />
          </div>

          <div className="grid grid-cols-2 gap-3">
            {/* Atribuir a (multiplos) */}
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-1">Atribuir a <span className="text-slate-400 dark:text-slate-500 font-normal">(opcional — vazio vai pro pool)</span></label>
              <div className="flex flex-wrap gap-1.5 mb-2">
                {(form.assignedTo || '').split(',').map(s => s.trim()).filter(Boolean).map(name => (
                  <span key={name} className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-xs rounded-full">
                    {name}
                    <button type="button" onClick={() => {
                      const updated = (form.assignedTo || '').split(',').map(s => s.trim()).filter(s => s && s !== name).join(', ');
                      update('assignedTo', updated || null);
                    }} className="hover:text-red-500 transition-colors">
                      <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                  </span>
                ))}
              </div>
              <select
                value=""
                onChange={(e) => {
                  if (!e.target.value) return;
                  const current = (form.assignedTo || '').split(',').map(s => s.trim()).filter(Boolean);
                  if (!current.some(s => namesMatch(s, e.target.value))) {
                    update('assignedTo', [...current, e.target.value].join(', '));
                  }
                }}
                className="w-full appearance-none px-4 py-2.5 pr-8 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-fyness-primary focus:border-transparent text-sm"
              >
                <option value="">Adicionar pessoa...</option>
                {teamMembers.filter(m => !(form.assignedTo || '').split(',').some(s => namesMatch(s.trim(), m.name))).map(m => (
                  <option key={m.id} value={m.name}>{m.name}</option>
                ))}
              </select>
            </div>
            {/* Supervisor (multiplos) */}
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-1">Supervisor</label>
              <div className="flex flex-wrap gap-1.5 mb-2">
                {(form.supervisor || '').split(',').map(s => s.trim()).filter(Boolean).map(name => (
                  <span key={name} className="inline-flex items-center gap-1 px-2 py-1 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 text-xs rounded-full">
                    {name}
                    <button type="button" onClick={() => {
                      const updated = (form.supervisor || '').split(',').map(s => s.trim()).filter(s => s && s !== name).join(', ');
                      update('supervisor', updated || null);
                    }} className="hover:text-red-500 transition-colors">
                      <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                  </span>
                ))}
              </div>
              <select
                value=""
                onChange={(e) => {
                  if (!e.target.value) return;
                  const current = (form.supervisor || '').split(',').map(s => s.trim()).filter(Boolean);
                  if (!current.some(s => namesMatch(s, e.target.value))) {
                    update('supervisor', [...current, e.target.value].join(', '));
                  }
                }}
                className="w-full appearance-none px-4 py-2.5 pr-8 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-fyness-primary focus:border-transparent text-sm"
              >
                <option value="">Adicionar supervisor...</option>
                {teamMembers.filter(m => !(form.supervisor || '').split(',').some(s => namesMatch(s.trim(), m.name))).map(m => (
                  <option key={m.id} value={m.name}>{m.name}</option>
                ))}
              </select>
            </div>

            {/* Juiz (multiplos) — terceiro neutro que arbitra a contestação da nota */}
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-1">Juiz <span className="font-normal text-slate-400">(arbitra contestações)</span></label>
              <div className="flex flex-wrap gap-1.5 mb-2">
                {(form.judge || '').split(',').map(s => s.trim()).filter(Boolean).map(name => (
                  <span key={name} className="inline-flex items-center gap-1 px-2 py-1 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 text-xs rounded-full">
                    {name}
                    <button type="button" onClick={() => {
                      const updated = (form.judge || '').split(',').map(s => s.trim()).filter(s => s && s !== name).join(', ');
                      update('judge', updated || null);
                    }} className="hover:text-red-500 transition-colors">
                      <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                  </span>
                ))}
              </div>
              <select
                value=""
                onChange={(e) => {
                  if (!e.target.value) return;
                  const current = (form.judge || '').split(',').map(s => s.trim()).filter(Boolean);
                  if (!current.some(s => namesMatch(s, e.target.value))) {
                    update('judge', [...current, e.target.value].join(', '));
                  }
                }}
                className="w-full appearance-none px-4 py-2.5 pr-8 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-fyness-primary focus:border-transparent text-sm"
              >
                <option value="">Adicionar juiz...</option>
                {teamMembers.filter(m => !(form.judge || '').split(',').some(s => namesMatch(s.trim(), m.name))).map(m => (
                  <option key={m.id} value={m.name}>{m.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-1">Prioridade</label>
            {isEmergency ? (
              <div className="flex items-center gap-2 px-3 py-2 bg-red-100 dark:bg-red-900/30 rounded-lg border border-red-200 dark:border-red-700/50">
                <div className="w-2 h-2 rounded-full bg-red-500" />
                <span className="text-sm font-medium text-red-700 dark:text-red-400">Urgente (fixa para emergenciais)</span>
              </div>
            ) : (
              <div className="flex gap-2">
                {PRIORITIES.map(p => (
                  <button key={p.id} onClick={() => update('priority', p.id)} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-sm transition-all ${form.priority === p.id ? `${p.color} border-transparent font-medium` : 'border-slate-200 dark:border-slate-600 text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700/50'}`}>
                    <div className={`w-2 h-2 rounded-full ${p.dot}`} />
                    {p.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Categoria */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-1">Categoria</label>
            <div className="flex flex-wrap gap-2">
              {CATEGORIES.map(c => (
                <button key={c.id} onClick={() => update('category', c.id)} className={`px-3 py-1.5 rounded-lg border text-sm transition-all ${form.category === c.id ? `${c.color} border-transparent font-medium` : 'border-slate-200 dark:border-slate-600 text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700/50'}`}>
                  {c.label}
                </button>
              ))}
            </div>
          </div>

          {/* Cliente (select da tabela clients) */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-1">Cliente</label>
            <div className="relative">
              <select
                value={form.clientId || ''}
                onChange={(e) => {
                  const selectedClient = clients.find(c => c.id === e.target.value);
                  update('clientId', e.target.value || '');
                  if (selectedClient) update('client', selectedClient.name);
                }}
                className="w-full appearance-none px-4 py-2.5 pr-8 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-fyness-primary focus:border-transparent text-sm"
              >
                <option value="">Sem cliente vinculado</option>
                {clients.map(c => (
                  <option key={c.id} value={c.id}>{c.name}{c.company ? ` (${c.company})` : ''}</option>
                ))}
              </select>
              <svg className="w-4 h-4 text-slate-400 dark:text-slate-500 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
            {!form.clientId && (
              <input type="text" value={form.client} onChange={(e) => update('client', e.target.value)} className="w-full mt-2 px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-fyness-primary focus:border-transparent text-sm" placeholder="Ou digite o nome do cliente..." />
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-1">Previsao de Inicio</label>
            <input type="datetime-local" value={form.estimatedStart} onChange={(e) => update('estimatedStart', e.target.value)} className="w-full px-4 py-2.5 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-fyness-primary focus:border-transparent text-sm" />
            <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1">Quando a O.S. comeca — define o periodo previsto (junto com a entrega).</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-1">Previsao de Entrega</label>
            <input type="datetime-local" value={form.estimatedEnd} onChange={(e) => update('estimatedEnd', e.target.value)} className="w-full px-4 py-2.5 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-fyness-primary focus:border-transparent text-sm" />
            <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1">Opcional \u2014 se as tarefas tiverem prazo, segue o maior deles.</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-1">Descricao do Servico</label>
            <NotionEditor content={form.description} onChange={(html) => update('description', html)} placeholder="Descreva o servico a ser executado..." minHeight="100px" />
          </div>

          {/* Bloco de Tarefas - Visual Builder */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">Bloco de Tarefas</label>
              {!editing && <TemplatePicker onSelect={applyTemplate} />}
            </div>

            {/* Builder visual */}
            {(() => {
              const cl = form.checklist || [];
              // Agrupar itens por grupo
              const groupsMap = new Map();
              cl.forEach(item => {
                const key = item.group || '__sem_grupo__';
                if (!groupsMap.has(key)) groupsMap.set(key, []);
                groupsMap.get(key).push(item);
              });
              const groupNames = [...groupsMap.keys()];

              // Adicionar tarefa a um grupo
              const addTaskToGroup = (groupName, taskText) => {
                if (!taskText.trim()) return;
                const newItem = {
                  id: Date.now() + Math.random(),
                  text: taskText.trim(),
                  group: groupName === '__sem_grupo__' ? null : groupName,
                  done: false, startedAt: null, completedAt: null, durationMin: null, pausedAt: null, accumulatedMin: 0,
                };
                update('checklist', [...cl, newItem]);
              };

              // Remover tarefa
              const removeTask = (taskId) => {
                const removedItem = cl.find(i => i.id === taskId);
                const removedIndex = cl.findIndex(i => i.id === taskId);
                const newChecklist = cl.filter(i => i.id !== taskId);
                update('checklist', newChecklist);
                if (removedItem) {
                  toast.undo(`Tarefa "${removedItem.text}" removida`, () => {
                    setForm(prev => {
                      const restored = [...(prev.checklist || [])];
                      restored.splice(removedIndex, 0, removedItem);
                      return { ...prev, checklist: restored };
                    });
                  });
                }
              };

              // Alternar done de uma tarefa
              const toggleTaskDone = (taskId) => {
                update('checklist', cl.map(i => i.id === taskId ? { ...i, done: !i.done } : i));
              };

              // Editar texto de uma tarefa existente
              const updateTaskText = (taskId, newText) => {
                if (!newText.trim()) return;
                update('checklist', cl.map(i => i.id === taskId ? { ...i, text: newText.trim() } : i));
              };

              // Definir/limpar o horário (prazo) de uma tarefa já na criação.
              // Vai pro item.dueAt — preenche o "pacote de tarefas" e, ao salvar a
              // O.S., a Agenda já mostra o evento "Prazo" automaticamente (sem
              // relançamento manual). Ver buildOSDeadlineEvents.
              const updateTaskDueAt = (taskId, iso) => {
                update('checklist', cl.map(i => i.id === taskId ? { ...i, dueAt: iso || null } : i));
              };

              // Mover tarefa via drag-and-drop (reordenar no array)
              const handleTaskDrop = (draggedId, targetId) => {
                if (!draggedId || !targetId || draggedId === targetId) return;
                const fromIdx = cl.findIndex(i => i.id === draggedId);
                const toIdx = cl.findIndex(i => i.id === targetId);
                if (fromIdx === -1 || toIdx === -1) return;
                const newList = [...cl];
                const [moved] = newList.splice(fromIdx, 1);
                // Atribuir o grupo do destino para permitir mover entre grupos
                moved.group = newList[toIdx > fromIdx ? toIdx - 1 : toIdx]?.group ?? moved.group;
                newList.splice(toIdx, 0, moved);
                update('checklist', newList);
                setDragTaskId(null);
                setDragOverTaskId(null);
              };

              // Remover grupo inteiro
              const removeGroup = (groupName) => {
                update('checklist', cl.filter(i => (i.group || '__sem_grupo__') !== groupName));
              };

              // Renomear grupo
              const renameGroup = (oldName, newName) => {
                if (!newName.trim() || newName.trim() === oldName) return;
                update('checklist', cl.map(i =>
                  (i.group || '__sem_grupo__') === oldName
                    ? { ...i, group: newName.trim() }
                    : i
                ));
              };

              return (
                <div className="space-y-3">
                  {/* Grupos existentes */}
                  {groupNames.map((groupName) => {
                    const items = groupsMap.get(groupName);
                    const isDefault = groupName === '__sem_grupo__';
                    return (
                      <div key={groupName} className="rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
                        {/* Header do grupo */}
                        <div className="flex items-center gap-2 px-3 py-2.5 bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-700">
                          <svg className="w-4 h-4 text-fyness-primary shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                          </svg>
                          {isDefault ? (
                            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Tarefas gerais</span>
                          ) : (
                            <input
                              type="text"
                              defaultValue={groupName}
                              onBlur={(e) => renameGroup(groupName, e.target.value)}
                              onKeyDown={(e) => { if (e.key === 'Enter') { e.target.blur(); } }}
                              className="text-xs font-semibold text-fyness-primary dark:text-blue-400 bg-transparent border-none outline-none focus:ring-0 p-0 flex-1 min-w-0"
                            />
                          )}
                          <span className="text-[10px] text-slate-400 dark:text-slate-500 ml-auto mr-1">{items.length} {items.length === 1 ? 'tarefa' : 'tarefas'}</span>
                          <button
                            type="button"
                            onClick={() => removeGroup(groupName)}
                            className="p-1 text-slate-300 dark:text-slate-600 hover:text-red-500 dark:hover:text-red-400 transition-colors"
                            title="Remover grupo"
                          >
                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                          </button>
                        </div>

                        {/* Tarefas do grupo */}
                        <div className="divide-y divide-slate-100 dark:divide-slate-700/50">
                          {items.map((item, idx) => (
                            <div
                              key={item.id}
                              draggable
                              onDragStart={(e) => { e.dataTransfer.effectAllowed = 'move'; setDragTaskId(item.id); }}
                              onDragEnd={() => { setDragTaskId(null); setDragOverTaskId(null); }}
                              onDragOver={(e) => { e.preventDefault(); e.dataTransfer.dropEffect = 'move'; setDragOverTaskId(item.id); }}
                              onDrop={(e) => { e.preventDefault(); handleTaskDrop(dragTaskId, item.id); }}
                              className={`flex items-center gap-2.5 px-4 py-2 group transition-colors ${
                                dragTaskId === item.id ? 'opacity-40' :
                                dragOverTaskId === item.id && dragTaskId ? 'bg-fyness-primary/10 dark:bg-blue-500/10 border-t-2 border-fyness-primary dark:border-blue-400' :
                                'hover:bg-slate-50 dark:hover:bg-slate-800/30'
                              }`}
                            >
                              {/* Grip handle */}
                              <svg className="w-4 h-4 text-slate-300 dark:text-slate-600 cursor-grab active:cursor-grabbing shrink-0 hover:text-slate-500 dark:hover:text-slate-400 transition-colors" fill="currentColor" viewBox="0 0 24 24">
                                <circle cx="9" cy="6" r="1.5"/><circle cx="15" cy="6" r="1.5"/>
                                <circle cx="9" cy="12" r="1.5"/><circle cx="15" cy="12" r="1.5"/>
                                <circle cx="9" cy="18" r="1.5"/><circle cx="15" cy="18" r="1.5"/>
                              </svg>
                              <span className="w-5 h-5 rounded-md bg-fyness-primary/10 dark:bg-fyness-primary/20 text-fyness-primary text-[10px] font-bold flex items-center justify-center shrink-0">{idx + 1}</span>
                              <input
                                type="checkbox"
                                checked={!!item.done}
                                onChange={() => toggleTaskDone(item.id)}
                                className="w-4 h-4 rounded border-green-400 dark:border-green-500 text-green-500 focus:ring-green-400 accent-green-500 shrink-0 cursor-pointer"
                              />
                              <textarea
                                defaultValue={item.text}
                                onBlur={(e) => updateTaskText(item.id, e.target.value)}
                                onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) e.target.blur(); }}
                                rows={1}
                                onInput={(e) => { e.target.style.height = 'auto'; e.target.style.height = e.target.scrollHeight + 'px'; }}
                                onFocus={(e) => { e.target.style.height = 'auto'; e.target.style.height = e.target.scrollHeight + 'px'; }}
                                className={`text-sm flex-1 bg-transparent border-none outline-none focus:ring-0 p-0 hover:bg-slate-100 dark:hover:bg-slate-700/40 focus:bg-slate-100 dark:focus:bg-slate-700/40 rounded px-1 -mx-1 transition-colors resize-none overflow-hidden ${item.done ? 'line-through text-slate-400 dark:text-slate-500' : 'text-slate-700 dark:text-slate-200'}`}
                              />
                              {/* Horário da tarefa — definido já na criação; vira o
                                  prazo do item e o evento "Prazo" na Agenda. */}
                              <div className="shrink-0" onClick={(e) => e.stopPropagation()}>
                                <DueDateButton
                                  dueAt={item.dueAt || null}
                                  done={item.done}
                                  size="xs"
                                  onChange={(iso) => updateTaskDueAt(item.id, iso)}
                                />
                              </div>
                              <button
                                type="button"
                                onClick={() => openBriefing(item)}
                                title={item.briefing ? 'Ver/editar briefing' : 'Adicionar briefing'}
                                className={`shrink-0 inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold border transition-colors ${item.briefing ? 'text-fyness-primary border-fyness-primary/30 bg-fyness-primary/10 hover:bg-fyness-primary/20' : 'text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-600 hover:border-fyness-primary hover:text-fyness-primary'}`}
                              >
                                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                                Briefing
                              </button>
                              <button type="button" onClick={() => removeTask(item.id)} className="p-0.5 text-slate-300 dark:text-slate-600 hover:text-red-500 dark:hover:text-red-400 md:opacity-0 md:group-hover:opacity-100 transition-all">
                                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                              </button>
                            </div>
                          ))}
                        </div>

                        {/* Input para adicionar tarefa ao grupo */}
                        <div className="px-3 py-2 bg-slate-50/50 dark:bg-slate-800/40 border-t border-slate-100 dark:border-slate-700/50">
                          <div className="flex items-center gap-2">
                            <input
                              type="text"
                              placeholder="Adicionar tarefa..."
                              className="flex-1 px-3 py-1.5 border border-slate-200 dark:border-slate-600 rounded-lg text-sm bg-white dark:bg-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-fyness-primary focus:border-transparent"
                              onKeyDown={(e) => {
                                if (e.key === 'Enter' && e.target.value.trim()) {
                                  e.preventDefault();
                                  addTaskToGroup(groupName, e.target.value);
                                  e.target.value = '';
                                }
                              }}
                            />
                            <button
                              type="button"
                              onClick={(e) => {
                                const input = e.currentTarget.previousElementSibling;
                                if (input.value.trim()) {
                                  addTaskToGroup(groupName, input.value);
                                  input.value = '';
                                  input.focus();
                                }
                              }}
                              className="p-1.5 bg-fyness-primary text-white rounded-lg hover:bg-fyness-primary/90 transition-colors"
                              title="Adicionar tarefa"
                            >
                              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}

                  {/* Pasta recem-criada aguardando primeira tarefa */}
                  {pendingNewGroup && !groupNames.includes(pendingNewGroup) && (
                    <div className="rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
                      <div className="flex items-center gap-2 px-3 py-2.5 bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-700">
                        <svg className="w-4 h-4 text-fyness-primary shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                        </svg>
                        <span className="text-xs font-semibold text-fyness-primary dark:text-blue-400 flex-1">{pendingNewGroup}</span>
                        <span className="text-[10px] text-slate-400 dark:text-slate-500">0 tarefas</span>
                        <button type="button" onClick={() => setPendingNewGroup(null)} className="p-1 text-slate-300 dark:text-slate-600 hover:text-red-500 dark:hover:text-red-400 transition-colors" title="Cancelar pasta">
                          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                        </button>
                      </div>
                      <div className="px-3 py-2 bg-slate-50/50 dark:bg-slate-800/40">
                        <div className="flex items-center gap-2">
                          <input
                            type="text"
                            autoFocus
                            placeholder="Digitar nome da tarefa e pressionar Enter..."
                            className="flex-1 px-3 py-1.5 border border-slate-200 dark:border-slate-600 rounded-lg text-sm bg-white dark:bg-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-fyness-primary focus:border-transparent"
                            onKeyDown={(e) => {
                              if (e.key === 'Enter' && e.target.value.trim()) {
                                e.preventDefault();
                                addTaskToGroup(pendingNewGroup, e.target.value);
                                e.target.value = '';
                                setPendingNewGroup(null);
                              }
                              if (e.key === 'Escape') setPendingNewGroup(null);
                            }}
                          />
                          <button
                            type="button"
                            onClick={(e) => {
                              const input = e.currentTarget.previousElementSibling;
                              if (input.value.trim()) {
                                addTaskToGroup(pendingNewGroup, input.value);
                                input.value = '';
                                setPendingNewGroup(null);
                              }
                            }}
                            className="p-1.5 bg-fyness-primary text-white rounded-lg hover:bg-fyness-primary/90 transition-colors"
                            title="Adicionar tarefa"
                          >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Input inline para novo grupo */}
                  {showNewGroupInput && (
                    <div className="flex items-center gap-2 p-3 rounded-xl border-2 border-fyness-primary/30 dark:border-blue-500/30 bg-fyness-primary/5 dark:bg-blue-900/10">
                      <svg className="w-4 h-4 text-fyness-primary dark:text-blue-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" /></svg>
                      <input
                        type="text"
                        autoFocus
                        value={newGroupName}
                        onChange={(e) => setNewGroupName(e.target.value)}
                        placeholder="Nome do grupo..."
                        className="flex-1 px-3 py-1.5 border border-slate-200 dark:border-slate-600 rounded-lg text-sm bg-white dark:bg-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-fyness-primary focus:border-transparent"
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && newGroupName.trim()) {
                            e.preventDefault();
                            setPendingNewGroup(newGroupName.trim());
                            setNewGroupName('');
                            setShowNewGroupInput(false);
                          }
                          if (e.key === 'Escape') {
                            setNewGroupName('');
                            setShowNewGroupInput(false);
                          }
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => {
                          if (newGroupName.trim()) {
                            setPendingNewGroup(newGroupName.trim());
                          }
                          setNewGroupName('');
                          setShowNewGroupInput(false);
                        }}
                        className="px-3 py-1.5 bg-fyness-primary text-white rounded-lg hover:bg-fyness-primary/90 transition-colors text-xs font-medium"
                      >
                        Criar
                      </button>
                      <button
                        type="button"
                        onClick={() => { setNewGroupName(''); setShowNewGroupInput(false); }}
                        className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                      </button>
                    </div>
                  )}

                  {/* Botoes de acao */}
                  <div className="flex items-center gap-2">
                    {/* Botao rapido Nova Tarefa */}
                    <button
                      type="button"
                      onClick={() => addTaskToGroup('__sem_grupo__', 'Nova tarefa')}
                      className="flex items-center gap-1.5 px-3 py-2 border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-xl text-xs font-medium text-slate-500 dark:text-slate-400 hover:border-fyness-primary hover:text-fyness-primary dark:hover:border-blue-400 dark:hover:text-blue-400 transition-colors"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                      Nova Tarefa
                    </button>

                    {/* Adicionar novo grupo */}
                    {!showNewGroupInput && (
                      <button
                        type="button"
                        onClick={() => setShowNewGroupInput(true)}
                        className="flex items-center gap-1.5 px-3 py-2 border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-xl text-xs font-medium text-slate-500 dark:text-slate-400 hover:border-fyness-primary hover:text-fyness-primary dark:hover:border-blue-400 dark:hover:text-blue-400 transition-colors"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" /></svg>
                        Novo Grupo
                      </button>
                    )}

                    {/* Limpar tudo */}
                    {cl.length > 0 && (
                      <button
                        type="button"
                        onClick={() => { if (confirm(`Remover todas as ${cl.length} tarefas?`)) update('checklist', []); }}
                        className="flex items-center gap-1 px-3 py-2 text-[11px] text-red-400 hover:text-red-500 dark:text-red-500 dark:hover:text-red-400 font-medium transition-colors ml-auto"
                      >
                        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                        Limpar tudo
                      </button>
                    )}
                  </div>

                  {/* Modo avancado (textarea colapsavel) */}
                  <details className="group">
                    <summary className="flex items-center gap-1.5 text-[11px] text-slate-400 dark:text-slate-500 cursor-pointer hover:text-slate-600 dark:hover:text-slate-300 transition-colors select-none">
                      <svg className="w-3 h-3 transition-transform group-open:rotate-90" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                      Colar varias tarefas de uma vez
                    </summary>
                    <div className="mt-2">
                      <textarea
                        ref={checklistTextareaRef}
                        placeholder={"Preparacao\n- Separar materiais\n- Verificar estoque\n\nExecucao\n- Instalar equipamento\n- Testar funcionamento"}
                        rows={5}
                        className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-fyness-primary focus:border-transparent text-sm overflow-hidden leading-relaxed font-mono"
                        onInput={(e) => { e.target.style.height = 'auto'; e.target.style.height = e.target.scrollHeight + 'px'; }}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
                            e.preventDefault();
                            const newItems = parseChecklistLines(e.target.value);
                            if (newItems.length > 0) {
                              update('checklist', [...cl, ...newItems]);
                            }
                            e.target.value = '';
                          }
                        }}
                      />
                      <div className="flex items-center justify-between mt-2">
                        <p className="text-[11px] text-slate-400 dark:text-slate-500">Linha sem <code className="bg-slate-100 dark:bg-slate-700 px-1 rounded">-</code> = nome do grupo &middot; com <code className="bg-slate-100 dark:bg-slate-700 px-1 rounded">-</code> = tarefa</p>
                        <button
                          type="button"
                          onClick={() => {
                            if (!checklistTextareaRef.current) return;
                            const newItems = parseChecklistLines(checklistTextareaRef.current.value);
                            if (newItems.length > 0) {
                              update('checklist', [...cl, ...newItems]);
                            }
                            checklistTextareaRef.current.value = '';
                            checklistTextareaRef.current.focus();
                          }}
                          className="flex items-center gap-1.5 px-3 py-1.5 bg-fyness-primary text-white rounded-lg hover:bg-fyness-primary/90 transition-colors text-xs font-medium"
                        >
                          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                          Adicionar
                        </button>
                      </div>
                    </div>
                  </details>
                </div>
              );
            })()}
          </div>

          {/* Anexos */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-2">Anexos</label>

            {attachments.length > 0 && (
              <div className="space-y-2 mb-3">
                {attachments.map(att => (
                  <div key={att.id} className="flex items-center gap-2 p-2 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-700 group">
                    {att.type === 'link' ? (
                      <>
                        <svg className="w-4 h-4 text-blue-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                        </svg>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-blue-600 truncate">{att.label}</p>
                          <p className="text-[10px] text-slate-400 dark:text-slate-500 truncate">{att.url}</p>
                        </div>
                      </>
                    ) : (
                      <>
                        <img src={att.data} alt={att.label} className="w-10 h-10 rounded object-cover shrink-0 border border-slate-200 dark:border-slate-700" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-slate-700 dark:text-slate-200 truncate">{att.label}</p>
                          <p className="text-[10px] text-slate-400 dark:text-slate-500">Imagem</p>
                        </div>
                      </>
                    )}
                    <button onClick={() => removeAttachment(att.id)} className="p-1 text-slate-400 dark:text-slate-500 hover:text-red-500 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors md:opacity-0 md:group-hover:opacity-100">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            )}

            <div className="flex gap-2 mb-2">
              <input
                type="text"
                value={linkLabel}
                onChange={(e) => setLinkLabel(e.target.value)}
                placeholder="Nome do link"
                className="flex-1 px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 dark:text-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-fyness-primary focus:border-transparent"
              />
              <input
                type="text"
                value={linkUrl}
                onChange={(e) => setLinkUrl(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addLink(); } }}
                placeholder="https://..."
                className="flex-1 px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 dark:text-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-fyness-primary focus:border-transparent"
              />
              <button
                onClick={addLink}
                disabled={!linkUrl.trim()}
                className="px-3 py-2 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors text-sm font-medium disabled:opacity-40 disabled:cursor-not-allowed shrink-0"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                </svg>
              </button>
            </div>

            <label className="flex items-center gap-2 px-3 py-2 border border-dashed border-slate-300 dark:border-slate-600 rounded-lg text-sm text-slate-500 dark:text-slate-400 hover:border-fyness-primary hover:text-fyness-primary cursor-pointer transition-colors">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              Adicionar imagem (PNG, JPG ate 2MB)
              <input type="file" accept="image/*" onChange={addImage} className="hidden" />
            </label>
          </div>
        </div>

        <div className="p-6 bg-slate-50 dark:bg-slate-900 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-1">
            {onDelete && (
              <button onClick={onDelete} className="px-3 py-2 text-red-500 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors text-sm font-medium">Excluir</button>
            )}
            {(form.title?.trim() || (form.checklist || []).length > 0) && (
              <SaveAsTemplate order={form} />
            )}
          </div>
          <div className="flex gap-3">
            <button onClick={safeClose} className="px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors text-sm">Cancelar</button>
            <button onClick={handleSaveClick} disabled={!form.title.trim() || saving} className={`px-4 py-2 ${isEmergency ? 'bg-red-600 hover:bg-red-700' : 'bg-fyness-primary hover:bg-fyness-secondary'} text-white rounded-lg transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2`}>
              {saving && <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>}
              {saving ? 'Salvando...' : isEmergency ? 'Gerar Emergencial' : editing ? 'Salvar' : 'Gerar O.S.'}
            </button>
          </div>
        </div>
      </div>

      {/* Popup de confirmacao de descarte */}
      {showDiscardConfirm && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-[60]" onClick={() => setShowDiscardConfirm(false)}>
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl max-w-sm w-full mx-4 overflow-hidden animate-in fade-in zoom-in-95 duration-150" onClick={(e) => e.stopPropagation()}>
            <div className="p-6">
              <div className="w-12 h-12 bg-amber-100 dark:bg-amber-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100 text-center mb-2">Descartar alteracoes?</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 text-center">Voce tem alteracoes nao salvas. Deseja descarta-las?</p>
            </div>
            <div className="p-4 bg-slate-50 dark:bg-slate-900 flex gap-3 justify-end">
              <button onClick={() => setShowDiscardConfirm(false)} className="px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors text-sm font-medium">Continuar editando</button>
              <button onClick={onClose} className="px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors text-sm font-medium">Descartar</button>
            </div>
          </div>
        </div>
      )}

      {briefingItem && (
        <BriefingDrawer
          key={briefingItem.id}
          title={briefingItem.text}
          editable
          content={briefingDraft}
          author={briefingItem.briefingBy}
          authorAt={briefingItem.briefingAt}
          onChange={setBriefingDraft}
          onClose={closeBriefing}
        />
      )}
    </div>
  );
}

