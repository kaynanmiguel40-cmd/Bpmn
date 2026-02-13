/**
 * FinancialPage -> Projetos + Kanban de Ordens de Servico (O.S.)
 * - Tela 1: Grid de Projetos (estilo Finder)
 * - Tela 2: Kanban por prioridade (filtrado por projeto)
 * - Tela 3: Documento O.S. oficial
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  getOSSectors, createOSSector, updateOSSector, deleteOSSector,
  getOSProjects, createOSProject, updateOSProject, deleteOSProject,
  getOSOrders, createOSOrder, updateOSOrder, deleteOSOrder, updateOSOrdersBatch,
  clearProjectFromOrders, clearSectorFromProjects,
  getNextOrderNumber, getNextEmergencyNumber,
} from '../../lib/osService';
import { getProfile } from '../../lib/profileService';
import { getTeamMembers, shortName } from '../../lib/teamService';
import { getAgendaEvents } from '../../lib/agendaService';
import { MANAGER_ROLES } from '../../lib/roleUtils';
import logoFyness from '../../assets/logo-fyness.png';

// ==================== CONSTANTES ====================

const PRIORITIES = [
  { id: 'low', label: 'Baixa', color: 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300', dot: 'bg-slate-400' },
  { id: 'medium', label: 'Media', color: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400', dot: 'bg-yellow-400' },
  { id: 'high', label: 'Alta', color: 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400', dot: 'bg-orange-500' },
  { id: 'urgent', label: 'Urgente', color: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400', dot: 'bg-red-500' },
];

const STATUS_LABELS = {
  available: 'Disponivel',
  in_progress: 'Em Andamento',
  done: 'Concluida',
};

const PRIORITY_COLUMNS = [
  { id: 'red', title: 'Urgente / Alta', color: 'from-red-500 to-red-600', priorities: ['urgent', 'high'], emptyText: 'Nenhuma O.S. urgente' },
  { id: 'yellow', title: 'Media', color: 'from-yellow-400 to-amber-500', priorities: ['medium'], emptyText: 'Nenhuma O.S. media' },
  { id: 'green', title: 'Baixa', color: 'from-green-500 to-emerald-600', priorities: ['low'], emptyText: 'Nenhuma O.S. de baixa prioridade' },
];

const SECTOR_COLORS = ['#2563eb', '#3b82f6', '#f97316', '#10b981', '#ec4899', '#eab308', '#ef4444', '#06b6d4', '#84cc16', '#f43f5e'];

const PROJECT_COLORS = ['#3b82f6', '#3b82f6', '#10b981', '#f97316', '#ec4899', '#eab308', '#ef4444', '#2563eb'];

const EMPTY_FORM = {
  title: '',
  description: '',
  priority: 'medium',
  client: '',
  location: '',
  notes: '',
  assignedTo: '',
  estimatedStart: '',
  estimatedEnd: '',
  attachments: [],
  projectId: null,
  parentOrderId: null,
};

const EMPTY_PROJECT_FORM = {
  name: '',
  sector: 'ti',
  color: '#3b82f6',
  description: '',
};

function formatDate(iso) {
  if (!iso) return '-';
  return new Date(iso).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

function formatDateShort(dateStr) {
  if (!dateStr) return '-';
  const hasTime = dateStr.includes('T') && dateStr.length > 10;
  const d = new Date(dateStr + (dateStr.length === 10 ? 'T12:00:00' : ''));
  const opts = { day: '2-digit', month: '2-digit', year: 'numeric' };
  if (hasTime) { opts.hour = '2-digit'; opts.minute = '2-digit'; }
  return d.toLocaleDateString('pt-BR', opts);
}

const MESES_PT = ['janeiro', 'fevereiro', 'marco', 'abril', 'maio', 'junho', 'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'];

function formatCpf(value) {
  const d = (value || '').replace(/\D/g, '');
  if (d.length !== 11) return value || '';
  return `${d.slice(0, 3)}.${d.slice(3, 6)}.${d.slice(6, 9)}-${d.slice(9)}`;
}

function formatSignatureDateTime(iso) {
  if (!iso) return '';
  const d = new Date(iso);
  const h = d.getHours();
  const m = d.getMinutes();
  const dia = d.getDate();
  const mes = MESES_PT[d.getMonth()];
  const ano = d.getFullYear();
  return `${h} horas e ${m} minutos do dia ${dia} do mes de ${mes} do ano de ${ano}`;
}

const EMPTY_SECTOR_FORM = {
  label: '',
  color: '#3b82f6',
};

function formatCurrency(value) {
  return (value || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function calcOSHours(order) {
  if (!order.actualStart || !order.actualEnd) return 0;
  const start = new Date(order.actualStart);
  const end = new Date(order.actualEnd);
  const diffMs = end - start;
  const diffDays = Math.max(1, Math.round(diffMs / (1000 * 60 * 60 * 24)) + 1);
  return diffDays * 8;
}

function getMemberHourlyRate(member) {
  const salary = parseFloat(member.salaryMonth || member.salary_month || 0);
  const hours = parseFloat(member.hoursMonth || member.hours_month || 176);
  if (salary <= 0 || hours <= 0) return 0;
  return salary / hours;
}

function calcOSCost(order, membersList) {
  const hours = calcOSHours(order);
  const assigneeName = (order.assignee || '').toLowerCase().trim();
  const member = membersList.find(m => m.name.toLowerCase().trim() === assigneeName);
  const laborCost = member ? hours * getMemberHourlyRate(member) : 0;
  const materialCost = (order.expenses || []).reduce((acc, e) => acc + (e.value || 0) * (e.quantity || 1), 0);
  return { laborCost, materialCost, totalCost: laborCost + materialCost, hours, hourlyRate: member ? getMemberHourlyRate(member) : 0 };
}

// ==================== ICONES SVG ====================

function FolderIcon({ color = 'currentColor', size = 40 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 19a2 2 0 01-2 2H4a2 2 0 01-2-2V5a2 2 0 012-2h5l2 3h9a2 2 0 012 2z" fill={color} fillOpacity={0.15} />
    </svg>
  );
}

function InboxIcon({ size = 40 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
      <polyline points="22 12 16 12 14 15 10 15 8 12 2 12" />
      <path d="M5.45 5.11L2 12v6a2 2 0 002 2h16a2 2 0 002-2v-6l-3.45-6.89A2 2 0 0016.76 4H7.24a2 2 0 00-1.79 1.11z" />
    </svg>
  );
}

// ==================== COMPONENTE PRINCIPAL ====================

export default function FinancialPage() {
  const [orders, setOrders] = useState([]);
  const [projects, setProjects] = useState([]);
  const [viewingOrder, setViewingOrder] = useState(null);
  const [selectedProject, setSelectedProject] = useState(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingOrder, setEditingOrder] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(null);
  const [filterMember, setFilterMember] = useState('all');
  const [currentUser] = useState('1');
  const [form, setForm] = useState({ ...EMPTY_FORM });
  const [showDone, setShowDone] = useState(false);
  const [donePage, setDonePage] = useState(0);
  const [draggingId, setDraggingId] = useState(null);
  const [dragOverCol, setDragOverCol] = useState(null);
  const [dropTarget, setDropTarget] = useState(null);
  const [loading, setLoading] = useState(true);
  // Project management
  const [showProjectForm, setShowProjectForm] = useState(false);
  const [editingProject, setEditingProject] = useState(null);
  const [projectForm, setProjectForm] = useState({ ...EMPTY_PROJECT_FORM });
  const [sectorFilter, setSectorFilter] = useState('all');
  const [projectSearch, setProjectSearch] = useState('');
  const [showDeleteProjectModal, setShowDeleteProjectModal] = useState(null);
  // Sector management
  const [sectors, setSectors] = useState([]);
  const [showSectorForm, setShowSectorForm] = useState(false);
  const [editingSector, setEditingSector] = useState(null);
  const [sectorForm, setSectorForm] = useState({ ...EMPTY_SECTOR_FORM });
  const [showDeleteSectorModal, setShowDeleteSectorModal] = useState(null);
  // Perfil do usuario (para permissoes e assinatura)
  const [profile, setProfile] = useState({});
  // Membros da equipe (dinamico do Supabase)
  const [teamMembers, setTeamMembers] = useState([]);
  // Preview de O.S. antes de confirmar (fluxo: form -> preview -> confirmar)
  const [pendingOrder, setPendingOrder] = useState(null);
  // Modo emergencial do formulario
  const [emergencyFormMode, setEmergencyFormMode] = useState(false);
  // Eventos da agenda (para custo de reunioes)
  const [agendaEvents, setAgendaEvents] = useState([]);

  const isManager = useMemo(() => {
    const r = (profile.role || '').toLowerCase().trim();
    if (!r) return false;
    return MANAGER_ROLES.some(m => r.includes(m));
  }, [profile]);

  // Lista completa: membros cadastrados + perfil logado (se nao estiver na lista)
  const allMembers = useMemo(() => {
    if (!profile.name) return teamMembers;
    const alreadyIn = teamMembers.some(m => m.name.toLowerCase().trim() === profile.name.toLowerCase().trim());
    if (alreadyIn) return teamMembers;
    return [{ id: 'profile_self', name: profile.name, role: profile.role || '', color: '#3b82f6' }, ...teamMembers];
  }, [teamMembers, profile]);

  // Carregar dados do Supabase
  const loadData = useCallback(async () => {
    try {
      const [ordersData, projectsData, sectorsData, profileData, membersData, eventsData] = await Promise.all([
        getOSOrders(),
        getOSProjects(),
        getOSSectors(),
        getProfile(),
        getTeamMembers(),
        getAgendaEvents(),
      ]);
      setOrders(ordersData);
      setProjects(projectsData);
      setSectors(sectorsData);
      setProfile(profileData || {});
      setTeamMembers(membersData);
      setAgendaEvents(eventsData);
    } catch (err) {
      console.error('Erro ao carregar dados:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Recarregar ao voltar ao foco
  useEffect(() => {
    const handleFocus = () => loadData();
    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [loadData]);

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
    return projectOrders.filter(o =>
      o.assignee === memberName || o.assignedTo === memberName || o.status === 'available'
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

  const ordersByColumn = useMemo(() => {
    const grouped = {};
    PRIORITY_COLUMNS.forEach(col => {
      grouped[col.id] = activeOrders
        .filter(o => col.priorities.includes(o.priority))
        .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));
    });
    return grouped;
  }, [activeOrders]);

  // Mapa de sequencia: ordem de execucao global (prioridade + sortOrder)
  const sequenceMap = useMemo(() => {
    const PRIORITY_WEIGHT = { urgent: 0, high: 1, medium: 2, low: 3 };
    const sorted = [...activeOrders].sort((a, b) => {
      const pa = PRIORITY_WEIGHT[a.priority] ?? 9;
      const pb = PRIORITY_WEIGHT[b.priority] ?? 9;
      if (pa !== pb) return pa - pb;
      return (a.sortOrder ?? 0) - (b.sortOrder ?? 0);
    });
    const map = {};
    sorted.forEach((o, i) => { map[o.id] = i + 1; });
    return map;
  }, [activeOrders]);

  // Projetos filtrados
  const filteredProjects = useMemo(() => {
    let list = projects;
    if (sectorFilter !== 'all') {
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

  const openEdit = (order) => {
    setEditingOrder(order);
    setForm({
      title: order.title,
      description: order.description || '',
      priority: order.priority || 'medium',
      client: order.client || '',
      location: order.location || '',
      notes: order.notes || '',
      assignedTo: order.assignedTo || '',
      estimatedStart: order.estimatedStart || '',
      estimatedEnd: order.estimatedEnd || '',
      attachments: order.attachments || [],
      projectId: order.projectId || null,
    });
    setShowCreateForm(true);
  };

  const handleSave = async () => {
    if (!form.title.trim()) return;

    if (editingOrder) {
      // Edicao: salva direto
      const updated = await updateOSOrder(editingOrder.id, form);
      if (updated) {
        setOrders(prev => prev.map(o => o.id === editingOrder.id ? updated : o));
        if (viewingOrder?.id === editingOrder.id) {
          setViewingOrder(updated);
        }
      }
      setShowCreateForm(false);
    } else {
      // Criacao: mostra preview antes de confirmar
      const previewData = {
        id: `preview_${Date.now()}`,
        number: emergencyFormMode ? null : nextNumber,
        ...form,
        type: emergencyFormMode ? 'emergency' : 'normal',
        emergencyNumber: emergencyFormMode ? nextEmergencyNumber : null,
        parentOrderId: form.parentOrderId || null,
        priority: emergencyFormMode ? 'urgent' : form.priority,
        status: 'available',
        assignee: null,
        sortOrder: orders.length,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      setPendingOrder(previewData);
      setShowCreateForm(false);
    }
  };

  const handleConfirmOrder = async () => {
    if (!pendingOrder) return;
    const { id: _previewId, ...orderData } = pendingOrder;
    const newOrder = await createOSOrder(orderData);
    if (newOrder) {
      setOrders(prev => [...prev, newOrder]);
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
      priority: pendingOrder.priority || 'medium',
      client: pendingOrder.client || '',
      location: pendingOrder.location || '',
      notes: pendingOrder.notes || '',
      assignedTo: pendingOrder.assignedTo || '',
      estimatedStart: pendingOrder.estimatedStart || '',
      estimatedEnd: pendingOrder.estimatedEnd || '',
      attachments: pendingOrder.attachments || [],
      projectId: pendingOrder.projectId || null,
      parentOrderId: pendingOrder.parentOrderId || null,
    });
    setPendingOrder(null);
    setShowCreateForm(true);
  };

  const handleDelete = async (id) => {
    await deleteOSOrder(id);
    setOrders(prev => prev.filter(o => o.id !== id));
    setShowDeleteModal(null);
    if (viewingOrder?.id === id) setViewingOrder(null);
  };

  const handleClaim = async (orderId) => {
    const now = new Date().toISOString();
    const updated = await updateOSOrder(orderId, {
      assignee: profile.name || currentUser,
      status: 'in_progress',
      actualStart: now,
    });
    if (updated) {
      setOrders(prev => prev.map(o => o.id === orderId ? updated : o));
      if (viewingOrder?.id === orderId) setViewingOrder(updated);
    }
  };

  const handleRelease = async (orderId) => {
    const updated = await updateOSOrder(orderId, {
      assignee: null,
      status: 'available',
    });
    if (updated) {
      setOrders(prev => prev.map(o => o.id === orderId ? updated : o));
      if (viewingOrder?.id === orderId) setViewingOrder(updated);
    }
  };

  const handleMoveForward = async (orderId) => {
    const now = new Date().toISOString();
    const order = orders.find(o => o.id === orderId);
    if (!order) return;
    let updates;
    if (order.status === 'available') updates = { assignee: currentUser, status: 'in_progress', actualStart: now };
    else if (order.status === 'in_progress') updates = { status: 'done', actualEnd: now };
    else return;
    const updated = await updateOSOrder(orderId, updates);
    if (updated) {
      setOrders(prev => prev.map(o => o.id === orderId ? updated : o));
      if (viewingOrder?.id === orderId) setViewingOrder(updated);
    }
  };

  const handleMoveBack = async (orderId) => {
    const order = orders.find(o => o.id === orderId);
    if (!order) return;
    let updates;
    if (order.status === 'done') updates = { status: 'in_progress', actualEnd: '' };
    else if (order.status === 'in_progress') updates = { assignee: null, status: 'available', actualStart: '' };
    else return;
    const updated = await updateOSOrder(orderId, updates);
    if (updated) {
      setOrders(prev => prev.map(o => o.id === orderId ? updated : o));
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
    setOrders(updatedLocal);
    if (viewingOrder?.id === draggedId) {
      setViewingOrder(updatedLocal.find(x => x.id === draggedId));
    }

    // Salvar no banco em batch
    const batchUpdates = [];
    batchUpdates.push({ id: draggedId, priority: newPriority, sortOrder: newSortMap[draggedId] ?? draggedOrder.sortOrder });
    for (const [id, sortOrder] of Object.entries(newSortMap)) {
      if (id !== draggedId) batchUpdates.push({ id, sortOrder });
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
    });
    setShowProjectForm(true);
  };

  const handleSaveProject = async () => {
    if (!projectForm.name.trim()) return;

    if (editingProject) {
      const updated = await updateOSProject(editingProject.id, projectForm);
      if (updated) {
        setProjects(prev => prev.map(p => p.id === editingProject.id ? updated : p));
        if (selectedProject?.id === editingProject.id) {
          setSelectedProject(updated);
        }
      }
    } else {
      const newProject = await createOSProject(projectForm);
      if (newProject) {
        setProjects(prev => [...prev, newProject]);
      }
    }
    setShowProjectForm(false);
  };

  const handleDeleteProject = async (id) => {
    await deleteOSProject(id);
    await clearProjectFromOrders(id);
    setProjects(prev => prev.filter(p => p.id !== id));
    setOrders(prev => prev.map(o => o.projectId === id ? { ...o, projectId: null } : o));
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
        setSectors(prev => prev.map(s => s.id === editingSector.id ? updated : s));
      }
    } else {
      const newSector = await createOSSector({
        label: sectorForm.label.trim(),
        color: sectorForm.color,
      });
      if (newSector) {
        setSectors(prev => [...prev, newSector]);
      }
    }
    setShowSectorForm(false);
  };

  const handleDeleteSector = async (id) => {
    await deleteOSSector(id);
    await clearSectorFromProjects(id);
    setSectors(prev => prev.filter(s => s.id !== id));
    setProjects(prev => prev.map(p => p.sector === id ? { ...p, sector: '' } : p));
    if (selectedProject?.sector === id) {
      setSelectedProject({ ...selectedProject, sector: '' });
    }
    setShowDeleteSectorModal(null);
    if (sectorFilter === id) setSectorFilter('all');
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
    const projectName = projects.find(p => p.id === viewingOrder.projectId)?.name || null;
    return (
      <>
        <OSDocument
          order={viewingOrder}
          currentUser={currentUser}
          projectName={projectName}
          isManager={isManager}
          profileName={profile.name || ''}
          profileCpf={profile.cpf || ''}
          teamMembers={allMembers}
          allOrders={orders}
          onBack={() => setViewingOrder(null)}
          onEdit={() => openEdit(viewingOrder)}
          onClaim={() => handleClaim(viewingOrder.id)}
          onRelease={() => handleRelease(viewingOrder.id)}
          onMoveForward={() => handleMoveForward(viewingOrder.id)}
          onMoveBack={() => handleMoveBack(viewingOrder.id)}
          onDelete={() => setShowDeleteModal(viewingOrder.id)}
          onViewOrder={(order) => setViewingOrder(order)}
        />
        {showCreateForm && (
          <OSFormModal
            form={form}
            setForm={setForm}
            editing={!!editingOrder}
            number={editingOrder?.number || nextNumber}
            projects={projects}
            teamMembers={allMembers}
            onSave={handleSave}
            onClose={() => { setShowCreateForm(false); setEditingOrder(null); setEmergencyFormMode(false); }}
            onDelete={isManager && editingOrder ? () => { setShowDeleteModal(editingOrder.id); setShowCreateForm(false); } : null}
            isEmergency={emergencyFormMode}
            emergencyNumber={nextEmergencyNumber}
            allOrders={orders}
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
            {isManager && (
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
            {isManager && selectedProject.id !== '__no_project__' && (
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
                  onClick={() => setViewingOrder(order)}
                  isDragging={false}
                  dropPosition={null}
                  onDragStart={() => {}}
                  onDragEnd={() => {}}
                  onCardDragOver={() => {}}
                  allOrders={orders}
                />
              ))}
            </div>
          </div>
        )}

        {/* Kanban por Prioridade */}
        <div className="flex-1 grid grid-cols-3 gap-4 min-h-0">
          {PRIORITY_COLUMNS.map((column) => {
            const colOrders = ordersByColumn[column.id] || [];
            const isOver = dragOverCol === column.id && !dropTarget;
            return (
              <div
                key={column.id}
                className={`flex flex-col rounded-xl border-2 overflow-hidden transition-all duration-200 ${
                  isOver
                    ? 'border-fyness-primary bg-fyness-primary/5 shadow-lg'
                    : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50'
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
                <div className={`flex-1 overflow-y-auto p-3 space-y-0 min-h-[100px] ${isOver ? 'bg-fyness-primary/5' : ''}`}>
                  {colOrders.length === 0 ? (
                    <div className={`text-center py-8 text-sm ${isOver ? 'text-fyness-primary font-medium' : 'text-slate-400 dark:text-slate-500'}`}>
                      {isOver ? 'Soltar aqui' : column.emptyText}
                    </div>
                  ) : (
                    colOrders.map(order => (
                      <OSCard
                        key={order.id}
                        order={order}
                        teamMembers={allMembers}
                        seqNumber={sequenceMap[order.id]}
                        onClick={() => setViewingOrder(order)}
                        isDragging={draggingId === order.id}
                        dropPosition={dropTarget?.cardId === order.id ? dropTarget.position : null}
                        onDragStart={() => setDraggingId(order.id)}
                        onDragEnd={() => { setDraggingId(null); setDragOverCol(null); setDropTarget(null); }}
                        onCardDragOver={(position) => setDropTarget({ cardId: order.id, position })}
                        allOrders={orders}
                      />
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Secao Concluidas */}
        {doneOrders.length > 0 && (
          <div className="mt-4">
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

            {showDone && (() => {
              const perPage = 15;
              const totalPages = Math.ceil(doneOrders.length / perPage);
              const page = Math.min(donePage, totalPages - 1);
              const pagedOrders = doneOrders.slice(page * perPage, (page + 1) * perPage);
              return (
                <div className="mt-3 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-700">
                        <th className="text-left px-4 py-2.5 text-[10px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">O.S.</th>
                        <th className="text-left px-4 py-2.5 text-[10px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Titulo</th>
                        <th className="text-left px-4 py-2.5 text-[10px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Cliente</th>
                        <th className="text-left px-4 py-2.5 text-[10px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Responsavel</th>
                        <th className="text-left px-4 py-2.5 text-[10px] font-semibold text-green-500 uppercase tracking-wider">Inicio Real</th>
                        <th className="text-left px-4 py-2.5 text-[10px] font-semibold text-green-500 uppercase tracking-wider">Fim Real</th>
                        {isManager && <th className="text-right px-4 py-2.5 text-[10px] font-semibold text-amber-500 uppercase tracking-wider">Custo</th>}
                      </tr>
                    </thead>
                    <tbody>
                      {pagedOrders.map(order => {
                        const _tm = allMembers.find(m => m.id === order.assignee || m.name === order.assignee);
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
                              <div className="flex flex-col gap-0.5">
                                {order.assignedTo && (
                                  <span className="text-[10px] text-blue-600 font-medium">Para: {shortName(order.assignedTo)}</span>
                                )}
                                {member ? (
                                  <div className="flex items-center gap-1.5">
                                    <div className="w-5 h-5 rounded-full flex items-center justify-center text-white text-[9px] font-bold" style={{ backgroundColor: member.color }}>{member.name.charAt(0)}</div>
                                    <span className="text-slate-600 dark:text-slate-300">{shortName(member.name)}</span>
                                  </div>
                                ) : !order.assignedTo ? (
                                  <span className="text-slate-400 dark:text-slate-500 italic">-</span>
                                ) : null}
                              </div>
                            </td>
                            <td className="px-4 py-2.5 text-slate-600 dark:text-slate-300">{formatDate(order.actualStart)}</td>
                            <td className="px-4 py-2.5 text-slate-600 dark:text-slate-300">{formatDate(order.actualEnd)}</td>
                            {isManager && (
                            <td className="px-4 py-2.5 text-right">
                              {(() => {
                                const cost = calcOSCost(order, allMembers);
                                return (
                                  <div>
                                    <span className="font-bold text-slate-800 dark:text-slate-100">{formatCurrency(cost.totalCost)}</span>
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
                    {isManager && (
                    <tfoot>
                      <tr className="bg-slate-50 dark:bg-slate-800/50 border-t-2 border-slate-300 dark:border-slate-600">
                        <td colSpan="6" className="px-4 py-2.5 text-right text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">Total</td>
                        <td className="px-4 py-2.5 text-right">
                          <span className="text-sm font-bold text-blue-600">
                            {formatCurrency(doneOrders.reduce((sum, o) => sum + calcOSCost(o, allMembers).totalCost, 0))}
                          </span>
                        </td>
                      </tr>
                    </tfoot>
                    )}
                  </table>
                  {totalPages > 1 && (
                    <div className="flex items-center justify-between px-4 py-3 border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
                      <span className="text-xs text-slate-500 dark:text-slate-400">
                        {page * perPage + 1}-{Math.min((page + 1) * perPage, doneOrders.length)} de {doneOrders.length}
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

        {/* Create/Edit Form Modal */}
        {showCreateForm && (
          <OSFormModal
            form={form}
            setForm={setForm}
            editing={!!editingOrder}
            number={editingOrder?.number || nextNumber}
            projects={projects}
            teamMembers={allMembers}
            onSave={handleSave}
            onClose={() => { setShowCreateForm(false); setEmergencyFormMode(false); }}
            onDelete={isManager && editingOrder ? () => { setShowDeleteModal(editingOrder.id); setShowCreateForm(false); } : null}
            isEmergency={emergencyFormMode}
            emergencyNumber={nextEmergencyNumber}
            allOrders={orders}
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
            onDelete={isManager && editingProject ? () => { setShowDeleteProjectModal(editingProject.id); setShowProjectForm(false); } : null}
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
  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Projetos</h1>
          <span className="text-sm text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-700 px-2.5 py-0.5 rounded-full font-medium">{projects.length}</span>
        </div>
        {isManager && (
          <button onClick={openCreateProject} className="flex items-center gap-2 px-4 py-2 bg-fyness-primary text-white rounded-lg hover:bg-fyness-secondary transition-colors text-sm font-medium shadow-sm">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Novo Projeto
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
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setSectorFilter('all')}
            className={`px-3 py-1.5 text-xs font-medium rounded-full transition-colors ${
              sectorFilter === 'all'
                ? 'bg-slate-800 dark:bg-slate-200 text-white dark:text-slate-800'
                : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
            }`}
          >
            Todos
          </button>
          {sectors.map(s => (
            <div key={s.id} className="relative group/sector">
              <button
                onClick={() => setSectorFilter(sectorFilter === s.id ? 'all' : s.id)}
                className={`px-3 py-1.5 text-xs font-medium rounded-full transition-colors ${
                  sectorFilter === s.id
                    ? 'text-white pr-7'
                    : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
                }`}
                style={sectorFilter === s.id ? { backgroundColor: s.color } : undefined}
              >
                {s.label}
              </button>
              {isManager && sectorFilter === s.id && (
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
          {isManager && (
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
      <div className="flex-1 overflow-y-auto">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredProjects.map(project => {
            const projOrders = orders.filter(o => o.projectId === project.id);
            const total = projOrders.length;
            const inProgress = projOrders.filter(o => o.status === 'in_progress').length;
            const done = projOrders.filter(o => o.status === 'done').length;
            const available = projOrders.filter(o => o.status === 'available').length;
            const percent = total > 0 ? Math.round((done / total) * 100) : 0;
            const sector = sectors.find(s => s.id === project.sector);

            return (
              <div
                key={project.id}
                onClick={() => setSelectedProject(project)}
                className="group bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-5 cursor-pointer hover:shadow-lg hover:border-slate-300 dark:hover:border-slate-600 transition-all duration-200 hover:-translate-y-0.5"
              >
                {/* Icone + Acoes */}
                <div className="flex items-start justify-between mb-3">
                  <FolderIcon color={project.color} size={40} />
                  {isManager && (
                    <button
                      onClick={(e) => { e.stopPropagation(); openEditProject(project); }}
                      className="p-1 text-slate-300 dark:text-slate-600 hover:text-slate-500 dark:hover:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 rounded transition-colors opacity-0 group-hover:opacity-100"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                      </svg>
                    </button>
                  )}
                </div>

                {/* Nome + Setor */}
                <h3 className="text-sm font-bold text-slate-800 mb-1 group-hover:text-fyness-primary transition-colors">{project.name}</h3>
                {sector && (
                  <span className="inline-block text-[10px] font-semibold px-2 py-0.5 rounded-full text-white mb-2" style={{ backgroundColor: sector.color }}>
                    {sector.label}
                  </span>
                )}

                {/* Descricao */}
                {project.description && (
                  <p className="text-xs text-slate-400 dark:text-slate-500 mb-3 line-clamp-1">{project.description}</p>
                )}

                {/* Stats */}
                <div className="flex items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400 mb-2">
                  <span className="font-medium">{total} O.S.</span>
                  <span className="text-slate-300 dark:text-slate-600">|</span>
                  {inProgress > 0 && <span className="text-blue-600">{inProgress} andamento</span>}
                  {inProgress > 0 && available > 0 && <span className="text-slate-300 dark:text-slate-600">|</span>}
                  {available > 0 && <span className="text-slate-500 dark:text-slate-400">{available} disponiv.</span>}
                </div>

                {/* Barra de progresso */}
                {total > 0 && (
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-1.5 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
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
          })}

          {/* Card "Sem Projeto" */}
          {orphanOrders.length > 0 && sectorFilter === 'all' && !projectSearch.trim() && (
            <div
              onClick={() => setSelectedProject({ id: '__no_project__', name: 'Sem Projeto', color: '#94a3b8', sector: null })}
              className="group bg-white dark:bg-slate-800 rounded-xl border-2 border-dashed border-slate-300 dark:border-slate-600 p-5 cursor-pointer hover:shadow-lg hover:border-slate-400 dark:hover:border-slate-500 transition-all duration-200 hover:-translate-y-0.5"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="text-slate-400 dark:text-slate-500">
                  <InboxIcon size={40} />
                </div>
              </div>
              <h3 className="text-sm font-bold text-slate-600 dark:text-slate-300 mb-1">Sem Projeto</h3>
              <p className="text-xs text-slate-400 dark:text-slate-500 mb-3">Ordens de servico nao atribuidas a nenhum projeto</p>
              <div className="flex items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400">
                <span className="font-medium">{orphanOrders.length} O.S.</span>
                <span className="text-slate-300 dark:text-slate-600">|</span>
                <span className="text-blue-600">{orphanOrders.filter(o => o.status === 'in_progress').length} andamento</span>
              </div>
            </div>
          )}
        </div>

        {/* Estado vazio */}
        {filteredProjects.length === 0 && orphanOrders.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="text-slate-300 dark:text-slate-600 mb-4">
              <FolderIcon color="#cbd5e1" size={64} />
            </div>
            <h3 className="text-lg font-semibold text-slate-600 dark:text-slate-300 mb-1">Nenhum projeto encontrado</h3>
            <p className="text-sm text-slate-400 dark:text-slate-500 mb-4">
              {projectSearch.trim() || sectorFilter !== 'all'
                ? 'Tente ajustar os filtros de busca'
                : 'Crie seu primeiro projeto para organizar as O.S.'
              }
            </p>
            {isManager && !projectSearch.trim() && sectorFilter === 'all' && (
              <button onClick={openCreateProject} className="px-4 py-2 bg-fyness-primary text-white rounded-lg hover:bg-fyness-secondary transition-colors text-sm font-medium">
                Criar Projeto
              </button>
            )}
          </div>
        )}
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
          onDelete={isManager && editingProject ? () => { setShowDeleteProjectModal(editingProject.id); setShowProjectForm(false); } : null}
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
          onDelete={isManager && editingSector ? () => { setShowDeleteSectorModal(editingSector.id); setShowSectorForm(false); } : null}
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

function OSCard({ order, onClick, isDragging, dropPosition, onDragStart, onDragEnd, onCardDragOver, teamMembers, seqNumber, allOrders = [] }) {
  const _tm = teamMembers.find(m => m.id === order.assignee);
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
        className={`rounded-lg p-3 transition-all group ${
          isEmergency
            ? `bg-white dark:bg-slate-800 border-l-4 border-red-500 border-t border-r border-b border-t-red-200 dark:border-t-red-800/50 border-r-red-200 dark:border-r-red-800/50 border-b-red-200 dark:border-b-red-800/50 cursor-pointer hover:shadow-md hover:shadow-red-100 dark:hover:shadow-red-900/20 w-72`
            : `bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 cursor-grab active:cursor-grabbing ${
              isDragging ? 'opacity-40 scale-95 shadow-none' : 'hover:shadow-md hover:border-fyness-primary/30'
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
          <span className={`inline-flex items-center gap-1 text-[10px] font-medium px-1.5 py-0.5 rounded-full ${statusStyle}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${statusDot}`} />
            {STATUS_LABELS[order.status]}
          </span>
        </div>
        <div className="flex items-center gap-1.5 mb-1">
          {isEmergency && (
            <svg className="w-3.5 h-3.5 text-red-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          )}
          <h4 className={`text-sm font-semibold mb-0 ${isEmergency ? 'text-red-700 dark:text-red-300' : 'text-slate-800 dark:text-slate-100 group-hover:text-fyness-primary'} transition-colors`}>{order.title}</h4>
        </div>
        {isEmergency && parentOrder && (
          <p className="text-[10px] text-red-400 dark:text-red-500 mb-1">
            Vinculada a O.S. #{parentOrder.number} — {parentOrder.title}
          </p>
        )}
        {order.client && <p className="text-[11px] text-slate-400 dark:text-slate-500 mb-1">{order.client}</p>}
        <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-100 dark:border-slate-700">
          <div className="flex flex-col gap-0.5">
            {order.assignedTo && (
              <div className="flex items-center gap-1">
                <span className="text-[9px] text-slate-400 dark:text-slate-500">Para:</span>
                <span className="text-[11px] font-medium text-blue-600">{shortName(order.assignedTo)}</span>
              </div>
            )}
            {member ? (
              <div className="flex items-center gap-1.5">
                <div className="w-5 h-5 rounded-full flex items-center justify-center text-white text-[9px] font-bold" style={{ backgroundColor: member.color }}>{member.name.charAt(0)}</div>
                <span className="text-xs text-slate-600 dark:text-slate-300">{shortName(member.name)}</span>
              </div>
            ) : !order.assignedTo ? (
              <span className="text-xs text-slate-400 dark:text-slate-500 italic">Sem responsavel</span>
            ) : null}
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
}

// ==================== DOCUMENTO O.S. ====================

function OSDocument({ order, currentUser, projectName, onBack, onEdit, onClaim, onRelease, onMoveForward, onMoveBack, onDelete, isManager, profileName, profileCpf, teamMembers, allOrders = [], onViewOrder }) {
  const teamMember = teamMembers.find(m => m.id === order.assignee);
  const member = teamMember || (order.assignee ? { id: order.assignee, name: order.assignee, color: '#3b82f6' } : null);
  const priority = PRIORITIES.find(p => p.id === order.priority) || PRIORITIES[1];
  const isOwner = order.assignee === currentUser || order.assignee === profileName;
  const docAttachments = order.attachments || [];
  const isEmergency = order.type === 'emergency';
  const parentOrder = isEmergency && order.parentOrderId ? allOrders.find(o => o.id === order.parentOrderId) : null;
  const childEmergencies = allOrders.filter(o => o.type === 'emergency' && o.parentOrderId === order.id);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="h-full flex flex-col print:block print:h-auto">
      {/* Toolbar */}
      <div className="flex items-center justify-between mb-4 print:hidden">
        <button onClick={onBack} className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300 hover:text-slate-800 dark:hover:text-slate-100 transition-colors">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Voltar ao Kanban
        </button>

        <div className="flex items-center gap-2">
          {order.status === 'available' && (
            <button onClick={onClaim} className="px-3 py-1.5 bg-fyness-primary text-white text-sm rounded-lg hover:bg-fyness-secondary transition-colors font-medium">
              Pegar O.S.
            </button>
          )}
          {order.status === 'in_progress' && (
            <>
              <button onClick={onMoveForward} className="px-3 py-1.5 bg-green-500 text-white text-sm rounded-lg hover:bg-green-600 transition-colors font-medium">Concluir</button>
              {isOwner && (
                <button onClick={onRelease} className="px-3 py-1.5 border border-orange-300 dark:border-orange-600/50 text-orange-600 dark:text-orange-400 text-sm rounded-lg hover:bg-orange-50 dark:hover:bg-orange-900/20 transition-colors">Devolver</button>
              )}
            </>
          )}
          {order.status === 'done' && (
            <button onClick={onMoveBack} className="px-3 py-1.5 border border-slate-300 dark:border-slate-600 text-slate-600 dark:text-slate-300 text-sm rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">Reabrir</button>
          )}

          {isManager && (
            <button onClick={onEdit} className="px-3 py-1.5 border border-slate-300 dark:border-slate-600 text-slate-600 dark:text-slate-300 text-sm rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">Editar</button>
          )}
          <button onClick={handlePrint} className="px-3 py-1.5 border border-slate-300 dark:border-slate-600 text-slate-600 dark:text-slate-300 text-sm rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors flex items-center gap-1.5">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
            </svg>
            Imprimir
          </button>
          {isManager && (
            <button onClick={onDelete} className="px-3 py-1.5 border border-red-200 dark:border-red-600/50 text-red-500 dark:text-red-400 text-sm rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">Excluir</button>
          )}
        </div>
      </div>

      {/* Documento */}
      <div className="flex-1 overflow-y-auto print:overflow-visible">
        <div className="max-w-3xl mx-auto bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm print:shadow-none print:border-none print:max-w-none print:rounded-none">
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

          {/* Info grid */}
          <div className="grid grid-cols-2 border-b border-slate-200 dark:border-slate-700">
            <div className="p-4 border-r border-slate-200 dark:border-slate-700">
              <label className="text-[10px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Status</label>
              <div className="mt-1">
                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${
                  order.status === 'available' ? 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300' :
                  order.status === 'in_progress' ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400' :
                  'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                }`}>
                  <span className={`w-2 h-2 rounded-full ${
                    order.status === 'available' ? 'bg-slate-400' :
                    order.status === 'in_progress' ? 'bg-blue-500' :
                    'bg-green-500'
                  }`} />
                  {STATUS_LABELS[order.status]}
                </span>
              </div>
            </div>
            <div className="p-4">
              <label className="text-[10px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Prioridade</label>
              <div className="mt-1">
                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${priority.color}`}>
                  <span className={`w-2 h-2 rounded-full ${priority.dot}`} />
                  {priority.label}
                </span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 border-b border-slate-200 dark:border-slate-700">
            <div className="p-4 border-r border-slate-200 dark:border-slate-700">
              <label className="text-[10px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Data de Abertura</label>
              <p className="text-sm text-slate-800 dark:text-slate-100 mt-1 font-medium">{formatDate(order.createdAt)}</p>
            </div>
            <div className="p-4">
              <label className="text-[10px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Ultima Atualizacao</label>
              <p className="text-sm text-slate-800 dark:text-slate-100 mt-1 font-medium">{formatDate(order.updatedAt)}</p>
            </div>
          </div>

          <div className="grid grid-cols-4 border-b border-slate-200 dark:border-slate-700">
            <div className="p-4 border-r border-slate-200 dark:border-slate-700">
              <label className="text-[10px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Previsao de Inicio</label>
              <p className="text-sm text-slate-800 dark:text-slate-100 mt-1 font-medium">{formatDateShort(order.estimatedStart)}</p>
            </div>
            <div className="p-4 border-r border-slate-200 dark:border-slate-700">
              <label className="text-[10px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Previsao de Entrega</label>
              <p className="text-sm text-slate-800 dark:text-slate-100 mt-1 font-medium">{formatDateShort(order.estimatedEnd)}</p>
            </div>
            <div className="p-4 border-r border-slate-200 dark:border-slate-700">
              <label className="text-[10px] font-semibold text-green-500 uppercase tracking-wider">Inicio Real</label>
              <p className="text-sm text-slate-800 dark:text-slate-100 mt-1 font-medium">{formatDate(order.actualStart)}</p>
            </div>
            <div className="p-4">
              <label className="text-[10px] font-semibold text-green-500 uppercase tracking-wider">Fim Real</label>
              <p className="text-sm text-slate-800 dark:text-slate-100 mt-1 font-medium">{formatDate(order.actualEnd)}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 border-b border-slate-200 dark:border-slate-700">
            <div className="p-4 border-r border-slate-200 dark:border-slate-700">
              <label className="text-[10px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Cliente / Solicitante</label>
              <p className="text-sm text-slate-800 dark:text-slate-100 mt-1 font-medium">{order.client || '-'}</p>
            </div>
            <div className="p-4">
              <label className="text-[10px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Local / Ambiente</label>
              <p className="text-sm text-slate-800 dark:text-slate-100 mt-1 font-medium">{order.location || '-'}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 border-b border-slate-200 dark:border-slate-700">
            <div className="p-4 border-r border-slate-200 dark:border-slate-700">
              <label className="text-[10px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Atribuido a</label>
              {order.assignedTo ? (
                <div className="flex items-center gap-2 mt-1">
                  <div className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold bg-blue-500">{order.assignedTo.charAt(0)}</div>
                  <span className="text-sm font-medium text-slate-800 dark:text-slate-100">{order.assignedTo}</span>
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

          {/* Titulo e Descricao */}
          <div className="p-6 border-b border-slate-200 dark:border-slate-700">
            <label className="text-[10px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Titulo do Servico</label>
            <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 mt-1">{order.title}</h3>
          </div>

          <div className="p-6 border-b border-slate-200 dark:border-slate-700">
            <label className="text-[10px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Descricao do Servico</label>
            <p className="text-sm text-slate-700 dark:text-slate-200 mt-2 leading-relaxed whitespace-pre-wrap">{order.description || 'Sem descricao.'}</p>
          </div>

          {order.notes && (
            <div className="p-6 border-b border-slate-200 dark:border-slate-700 bg-amber-50/50 dark:bg-amber-900/10">
              <label className="text-[10px] font-semibold text-amber-600 uppercase tracking-wider">Observacoes</label>
              <p className="text-sm text-slate-700 dark:text-slate-200 mt-2 leading-relaxed whitespace-pre-wrap">{order.notes}</p>
            </div>
          )}

          {/* Custos (so gestor) */}
          {isManager && order.status === 'done' && order.actualStart && order.actualEnd && (() => {
            const cost = calcOSCost(order, teamMembers);
            const expenses = order.expenses || [];
            if (cost.totalCost <= 0 && expenses.length === 0) return null;
            return (
              <div className="p-6 border-b border-slate-200 dark:border-slate-700 bg-amber-50/30 dark:bg-amber-900/10">
                <label className="text-[10px] font-semibold text-amber-600 uppercase tracking-wider">Custo da Ordem de Servico</label>
                <div className="mt-3 space-y-3">
                  {/* Mao de obra */}
                  {cost.laborCost > 0 && (
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-slate-700 dark:text-slate-200">Mao de Obra</p>
                        <p className="text-[10px] text-slate-400 dark:text-slate-500">
                          {cost.hours}h trabalhadas x {formatCurrency(cost.hourlyRate)}/h
                        </p>
                      </div>
                      <span className="text-sm font-bold text-slate-800 dark:text-slate-100">{formatCurrency(cost.laborCost)}</span>
                    </div>
                  )}

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

          {/* Assinaturas */}
          <div className="p-8 pt-12 grid grid-cols-2 gap-16">
            <div>
              <div className="text-center">
                <div className="border-b-2 border-slate-400 dark:border-slate-500 pb-1 mb-2 h-20 flex items-end justify-center">
                  {profileName && (
                    <span className="text-white" style={{ fontFamily: "'Milton One', cursive", fontSize: '1.75rem', lineHeight: '1.2' }}>
                      {profileName}
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold uppercase tracking-wider mt-1">Solicitante</p>
              </div>
              {profileName && (
                <p className="text-[9px] text-slate-400 dark:text-slate-500 leading-relaxed mt-3 text-justify">
                  Documento assinado por <strong className="text-slate-500">{profileName}</strong>
                  {profileCpf && <>, portador do CPF <strong className="text-slate-500">{formatCpf(profileCpf)}</strong></>}
                  . Assinou e esta de acordo com este documento as{' '}
                  <strong className="text-slate-500">{formatSignatureDateTime(order.createdAt)}</strong>.
                </p>
              )}
            </div>
            <div>
              <div className="text-center">
                <div className="border-b-2 border-slate-400 dark:border-slate-500 pb-1 mb-2 h-20 flex items-end justify-center">
                  {member && (
                    <span className="text-white" style={{ fontFamily: "'Milton One', cursive", fontSize: '1.75rem', lineHeight: '1.2' }}>
                      {member.name}
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold uppercase tracking-wider mt-1">Responsavel pela Execucao</p>
              </div>
              {member && order.actualStart && (
                <p className="text-[9px] text-slate-400 dark:text-slate-500 leading-relaxed mt-3 text-justify">
                  Documento assinado por <strong className="text-slate-500">{member.name}</strong>
                  {profileCpf && <>, portador do CPF <strong className="text-slate-500">{formatCpf(profileCpf)}</strong></>}
                  . Assinou e esta de acordo com este documento as{' '}
                  <strong className="text-slate-500">{formatSignatureDateTime(order.actualStart)}</strong>.
                </p>
              )}
            </div>
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

// ==================== PREVIEW DE O.S. (antes de confirmar) ====================

function OSPreviewDocument({ order, projectName, profileName, profileCpf, teamMembers, allOrders = [], onConfirm, onEdit, onCancel }) {
  const priority = PRIORITIES.find(p => p.id === order.priority) || PRIORITIES[1];
  const docAttachments = order.attachments || [];
  const isEmergency = order.type === 'emergency';
  const parentOrder = isEmergency && order.parentOrderId ? allOrders.find(o => o.id === order.parentOrderId) : null;

  return (
    <div className="h-full flex flex-col">
      {/* Toolbar */}
      <div className="flex items-center justify-between mb-4">
        <button onClick={onCancel} className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300 hover:text-slate-800 dark:hover:text-slate-100 transition-colors">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Cancelar
        </button>

        <div className="flex items-center gap-3">
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 text-xs font-semibold rounded-full">
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
            Pre-visualizacao
          </span>
          <button onClick={onEdit} className="px-3 py-1.5 border border-slate-300 dark:border-slate-600 text-slate-600 dark:text-slate-300 text-sm rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors font-medium">
            Editar
          </button>
          <button onClick={onConfirm} className={`px-4 py-1.5 ${isEmergency ? 'bg-red-600 hover:bg-red-700' : 'bg-green-500 hover:bg-green-600'} text-white text-sm rounded-lg transition-colors font-semibold shadow-sm flex items-center gap-2`}>
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            {isEmergency ? 'Confirmar Emergencial' : 'Confirmar Ordem'}
          </button>
        </div>
      </div>

      {/* Documento */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-3xl mx-auto bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
          {/* Faixa de preview */}
          <div className={`${isEmergency ? 'bg-gradient-to-r from-red-600 to-red-700' : 'bg-gradient-to-r from-amber-400 to-amber-500'} px-6 py-2 rounded-t-xl flex items-center gap-2`}>
            <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
            <span className="text-white text-xs font-bold">
              {isEmergency ? 'EMERGENCIAL — Revise os dados antes de confirmar' : 'RASCUNHO — Revise os dados antes de confirmar'}
            </span>
          </div>

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
                    <h2 className="text-2xl font-bold text-red-600 dark:text-red-400 uppercase">Emergencial</h2>
                    <p className="text-3xl font-black text-red-600 dark:text-red-400 mt-1">EMG-{String(order.emergencyNumber || 0).padStart(3, '0')}</p>
                  </>
                ) : (
                  <>
                    <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100 print:text-slate-800">ORDEM DE SERVICO</h2>
                    <p className="text-3xl font-black text-fyness-primary mt-1">#{String(order.number).padStart(3, '0')}</p>
                  </>
                )}
                {projectName && (
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Projeto: {projectName}</p>
                )}
              </div>
            </div>
          </div>

          {/* Vinculo emergencial no preview */}
          {isEmergency && parentOrder && (
            <div className="bg-red-50 dark:bg-red-950/30 border-b border-red-200 dark:border-red-800/50 px-6 py-3 flex items-center gap-2">
              <svg className="w-4 h-4 text-red-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
              </svg>
              <span className="text-sm text-red-600 dark:text-red-400">Originada da</span>
              <span className="text-sm font-bold text-red-700 dark:text-red-300">O.S. #{parentOrder.number} — {parentOrder.title}</span>
            </div>
          )}

          {/* Info grid */}
          <div className="grid grid-cols-2 border-b border-slate-200 dark:border-slate-700">
            <div className="p-4 border-r border-slate-200 dark:border-slate-700">
              <label className="text-[10px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Status</label>
              <div className="mt-1">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
                  <span className="w-2 h-2 rounded-full bg-slate-400" />
                  {STATUS_LABELS[order.status]}
                </span>
              </div>
            </div>
            <div className="p-4">
              <label className="text-[10px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Prioridade</label>
              <div className="mt-1">
                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${priority.color}`}>
                  <span className={`w-2 h-2 rounded-full ${priority.dot}`} />
                  {priority.label}
                </span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 border-b border-slate-200 dark:border-slate-700">
            <div className="p-4 border-r border-slate-200 dark:border-slate-700">
              <label className="text-[10px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Data de Abertura</label>
              <p className="text-sm text-slate-800 dark:text-slate-100 mt-1 font-medium">{formatDate(order.createdAt)}</p>
            </div>
            <div className="p-4">
              <label className="text-[10px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Ultima Atualizacao</label>
              <p className="text-sm text-slate-800 dark:text-slate-100 mt-1 font-medium">{formatDate(order.updatedAt)}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 border-b border-slate-200 dark:border-slate-700">
            <div className="p-4 border-r border-slate-200 dark:border-slate-700">
              <label className="text-[10px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Previsao de Inicio</label>
              <p className="text-sm text-slate-800 dark:text-slate-100 mt-1 font-medium">{formatDateShort(order.estimatedStart)}</p>
            </div>
            <div className="p-4">
              <label className="text-[10px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Previsao de Entrega</label>
              <p className="text-sm text-slate-800 dark:text-slate-100 mt-1 font-medium">{formatDateShort(order.estimatedEnd)}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 border-b border-slate-200 dark:border-slate-700">
            <div className="p-4 border-r border-slate-200 dark:border-slate-700">
              <label className="text-[10px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Cliente / Solicitante</label>
              <p className="text-sm text-slate-800 dark:text-slate-100 mt-1 font-medium">{order.client || '-'}</p>
            </div>
            <div className="p-4">
              <label className="text-[10px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Local / Ambiente</label>
              <p className="text-sm text-slate-800 dark:text-slate-100 mt-1 font-medium">{order.location || '-'}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 border-b border-slate-200 dark:border-slate-700">
            <div className="p-4 border-r border-slate-200 dark:border-slate-700">
              <label className="text-[10px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Atribuido a</label>
              {order.assignedTo ? (
                <div className="flex items-center gap-2 mt-1">
                  <div className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold bg-blue-500">{order.assignedTo.charAt(0)}</div>
                  <span className="text-sm font-medium text-slate-800 dark:text-slate-100">{order.assignedTo}</span>
                </div>
              ) : (
                <p className="text-sm text-slate-400 dark:text-slate-500 mt-1 italic">Ninguem</p>
              )}
            </div>
            <div className="p-4">
              <label className="text-[10px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Pego por</label>
              <p className="text-sm text-slate-400 dark:text-slate-500 mt-1 italic">Aguardando confirmacao</p>
            </div>
          </div>

          {/* Titulo e Descricao */}
          <div className="p-6 border-b border-slate-200 dark:border-slate-700">
            <label className="text-[10px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Titulo do Servico</label>
            <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 mt-1">{order.title}</h3>
          </div>

          <div className="p-6 border-b border-slate-200 dark:border-slate-700">
            <label className="text-[10px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Descricao do Servico</label>
            <p className="text-sm text-slate-700 dark:text-slate-200 mt-2 leading-relaxed whitespace-pre-wrap">{order.description || 'Sem descricao.'}</p>
          </div>

          {order.notes && (
            <div className="p-6 border-b border-slate-200 dark:border-slate-700 bg-amber-50/50 dark:bg-amber-900/10">
              <label className="text-[10px] font-semibold text-amber-600 uppercase tracking-wider">Observacoes</label>
              <p className="text-sm text-slate-700 dark:text-slate-200 mt-2 leading-relaxed whitespace-pre-wrap">{order.notes}</p>
            </div>
          )}

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
                      <div key={att.id} className="flex items-center gap-2 px-3 py-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                        <svg className="w-4 h-4 text-blue-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                        </svg>
                        <span className="text-sm text-blue-600 font-medium truncate">{att.label}</span>
                      </div>
                    ))}
                  </div>
                )}
                {docAttachments.filter(a => a.type === 'image').length > 0 && (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {docAttachments.filter(a => a.type === 'image').map(att => (
                      <div key={att.id}>
                        <img src={att.data} alt={att.label} className="w-full h-32 object-cover rounded-lg border border-slate-200 dark:border-slate-700" />
                        <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1 truncate">{att.label}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Assinaturas */}
          <div className="p-8 pt-12 grid grid-cols-2 gap-16">
            <div>
              <div className="text-center">
                <div className="border-b-2 border-slate-400 dark:border-slate-500 pb-1 mb-2 h-20 flex items-end justify-center">
                  {profileName && (
                    <span className="text-white" style={{ fontFamily: "'Milton One', cursive", fontSize: '1.75rem', lineHeight: '1.2' }}>
                      {profileName}
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold uppercase tracking-wider mt-1">Solicitante</p>
              </div>
              {profileName && (
                <p className="text-[9px] text-slate-400 dark:text-slate-500 leading-relaxed mt-3 text-justify">
                  Documento assinado por <strong className="text-slate-500">{profileName}</strong>
                  {profileCpf && <>, portador do CPF <strong className="text-slate-500">{formatCpf(profileCpf)}</strong></>}
                  . Assinou e esta de acordo com este documento as{' '}
                  <strong className="text-slate-500">{formatSignatureDateTime(order.createdAt)}</strong>.
                </p>
              )}
            </div>
            <div>
              <div className="text-center">
                <div className="border-b-2 border-dashed border-slate-300 dark:border-slate-600 pb-1 mb-2 h-20 flex items-end justify-center">
                  <span className="text-xs text-slate-400 dark:text-slate-500 italic">Aguardando execucao</span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold uppercase tracking-wider mt-1">Responsavel pela Execucao</p>
              </div>
            </div>
          </div>

          {/* Rodape */}
          <div className="bg-slate-50 dark:bg-slate-800/50 px-8 py-3 text-center border-t border-slate-200 dark:border-slate-700 rounded-b-xl">
            <p className="text-[10px] text-slate-400 dark:text-slate-500">Fyness - Gestao de Processos Empresariais | Rascunho gerado em {formatDate(new Date().toISOString())}</p>
          </div>
        </div>
      </div>

      {/* Botao fixo no rodape */}
      <div className="mt-4 flex items-center justify-center gap-3">
        <button onClick={onCancel} className="px-5 py-2.5 border border-slate-300 text-slate-600 rounded-lg hover:bg-slate-50 transition-colors text-sm font-medium">
          Cancelar
        </button>
        <button onClick={onEdit} className="px-5 py-2.5 border border-slate-300 text-slate-600 rounded-lg hover:bg-slate-50 transition-colors text-sm font-medium">
          Editar Dados
        </button>
        <button onClick={onConfirm} className={`px-6 py-2.5 ${isEmergency ? 'bg-red-600 hover:bg-red-700' : 'bg-green-500 hover:bg-green-600'} text-white rounded-lg transition-colors text-sm font-bold shadow-md flex items-center gap-2`}>
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          {isEmergency ? 'Confirmar Emergencial' : 'Confirmar Ordem'}
        </button>
      </div>
    </div>
  );
}

// ==================== MODAL FORMULARIO O.S. ====================

function OSFormModal({ form, setForm, editing, number, projects, onSave, onClose, onDelete, teamMembers, isEmergency = false, emergencyNumber = 1, allOrders = [] }) {
  const update = (field, value) => setForm(prev => ({ ...prev, [field]: value }));
  const inProgressOrders = allOrders.filter(o => o.type !== 'emergency' && (o.status === 'in_progress' || o.status === 'available'));
  const [linkUrl, setLinkUrl] = useState('');
  const [linkLabel, setLinkLabel] = useState('');

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
      alert('Imagem muito grande! Maximo: 2MB.');
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
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-xl max-w-lg w-full mx-4 overflow-hidden max-h-[90vh] flex flex-col">
        <div className={`p-6 border-b ${isEmergency ? 'border-red-200 dark:border-red-800/50 bg-red-50 dark:bg-red-950/20' : 'border-slate-200 dark:border-slate-700'} flex items-center justify-between shrink-0`}>
          <h3 className={`text-lg font-semibold ${isEmergency ? 'text-red-700 dark:text-red-300' : 'text-slate-800 dark:text-slate-100'}`}>
            {isEmergency
              ? `Nova Emergencial EMG-${String(emergencyNumber).padStart(3, '0')}`
              : editing ? `Editar O.S. #${number}` : `Nova O.S. #${number}`
            }
          </h3>
          <button onClick={onClose} className="p-1 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors">
            <svg className="w-5 h-5 text-slate-400 dark:text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-6 space-y-4 overflow-y-auto">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-1">Titulo do Servico *</label>
            <input type="text" value={form.title} onChange={(e) => update('title', e.target.value)} className="w-full px-4 py-2.5 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-fyness-primary focus:border-transparent text-sm" placeholder="Ex: Manutencao do servidor principal" autoFocus onKeyDown={(e) => { if (e.key === 'Escape') onClose(); }} />
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

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-1">Cliente / Solicitante</label>
              <input type="text" value={form.client} onChange={(e) => update('client', e.target.value)} className="w-full px-4 py-2.5 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-fyness-primary focus:border-transparent text-sm" placeholder="Ex: Acme Corp" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-1">Local / Ambiente</label>
              <input type="text" value={form.location} onChange={(e) => update('location', e.target.value)} className="w-full px-4 py-2.5 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-fyness-primary focus:border-transparent text-sm" placeholder="Ex: Servidor AWS" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-1">Atribuir a</label>
            <div className="relative">
              <select
                value={form.assignedTo || ''}
                onChange={(e) => update('assignedTo', e.target.value || null)}
                className="w-full appearance-none px-4 py-2.5 pr-8 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-fyness-primary focus:border-transparent text-sm"
              >
                <option value="">Ninguem (disponivel para todos)</option>
                {teamMembers.map(m => (
                  <option key={m.id} value={m.name}>{shortName(m.name)}</option>
                ))}
              </select>
              <svg className="w-4 h-4 text-slate-400 dark:text-slate-500 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
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

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-1">Previsao de Inicio</label>
              <input type="datetime-local" value={form.estimatedStart} onChange={(e) => update('estimatedStart', e.target.value)} className="w-full px-4 py-2.5 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-fyness-primary focus:border-transparent text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-1">Previsao de Entrega</label>
              <input type="datetime-local" value={form.estimatedEnd} onChange={(e) => update('estimatedEnd', e.target.value)} className="w-full px-4 py-2.5 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-fyness-primary focus:border-transparent text-sm" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-1">Descricao do Servico</label>
            <textarea value={form.description} onChange={(e) => update('description', e.target.value)} rows={4} className="w-full px-4 py-2.5 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-fyness-primary focus:border-transparent text-sm resize-none" placeholder="Descreva o servico a ser executado..." />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-1">Observacoes</label>
            <textarea value={form.notes} onChange={(e) => update('notes', e.target.value)} rows={2} className="w-full px-4 py-2.5 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-fyness-primary focus:border-transparent text-sm resize-none" placeholder="Observacoes adicionais..." />
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
                    <button onClick={() => removeAttachment(att.id)} className="p-1 text-slate-400 dark:text-slate-500 hover:text-red-500 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors opacity-0 group-hover:opacity-100">
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
          <div>
            {onDelete && (
              <button onClick={onDelete} className="px-3 py-2 text-red-500 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors text-sm font-medium">Excluir</button>
            )}
          </div>
          <div className="flex gap-3">
            <button onClick={onClose} className="px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors text-sm">Cancelar</button>
            <button onClick={onSave} disabled={!form.title.trim()} className={`px-4 py-2 ${isEmergency ? 'bg-red-600 hover:bg-red-700' : 'bg-fyness-primary hover:bg-fyness-secondary'} text-white rounded-lg transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed`}>
              {isEmergency ? 'Gerar Emergencial' : editing ? 'Salvar' : 'Gerar O.S.'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ==================== MODAL FORMULARIO PROJETO ====================

function ProjectFormModal({ form, setForm, editing, sectors, onSave, onClose, onDelete }) {
  const update = (field, value) => setForm(prev => ({ ...prev, [field]: value }));

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-xl max-w-md w-full mx-4 overflow-hidden">
        <div className="p-6 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100">
            {editing ? 'Editar Projeto' : 'Novo Projeto'}
          </h3>
          <button onClick={onClose} className="p-1 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors">
            <svg className="w-5 h-5 text-slate-400 dark:text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-1">Nome do Projeto *</label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => update('name', e.target.value)}
              className="w-full px-4 py-2.5 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-fyness-primary focus:border-transparent text-sm"
              placeholder="Ex: Landing Page Institucional"
              autoFocus
              onKeyDown={(e) => { if (e.key === 'Escape') onClose(); }}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-1">Setor</label>
            <div className="relative">
              <select
                value={form.sector}
                onChange={(e) => update('sector', e.target.value)}
                className="w-full appearance-none px-4 py-2.5 pr-8 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-fyness-primary focus:border-transparent text-sm"
              >
                <option value="">Sem setor</option>
                {sectors.map(s => (
                  <option key={s.id} value={s.id}>{s.label}</option>
                ))}
              </select>
              <svg className="w-4 h-4 text-slate-400 dark:text-slate-500 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-2">Cor</label>
            <div className="flex gap-2">
              {PROJECT_COLORS.map(c => (
                <button
                  key={c}
                  onClick={() => update('color', c)}
                  className={`w-8 h-8 rounded-lg transition-all ${form.color === c ? 'ring-2 ring-offset-2 ring-slate-400 scale-110' : 'hover:scale-105'}`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-1">Descricao</label>
            <textarea
              value={form.description}
              onChange={(e) => update('description', e.target.value)}
              rows={3}
              className="w-full px-4 py-2.5 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-fyness-primary focus:border-transparent text-sm resize-none"
              placeholder="Descricao breve do projeto..."
            />
          </div>
        </div>

        <div className="p-6 bg-slate-50 dark:bg-slate-900 flex items-center justify-between">
          <div>
            {onDelete && (
              <button onClick={onDelete} className="px-3 py-2 text-red-500 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors text-sm font-medium">Excluir</button>
            )}
          </div>
          <div className="flex gap-3">
            <button onClick={onClose} className="px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors text-sm">Cancelar</button>
            <button onClick={onSave} disabled={!form.name.trim()} className="px-4 py-2 bg-fyness-primary text-white rounded-lg hover:bg-fyness-secondary transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed">
              {editing ? 'Salvar' : 'Criar Projeto'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ==================== MODAL FORMULARIO SETOR ====================

function SectorFormModal({ form, setForm, editing, onSave, onClose, onDelete }) {
  const update = (field, value) => setForm(prev => ({ ...prev, [field]: value }));

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-xl max-w-sm w-full mx-4 overflow-hidden">
        <div className="p-6 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100">
            {editing ? 'Editar Setor' : 'Novo Setor'}
          </h3>
          <button onClick={onClose} className="p-1 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors">
            <svg className="w-5 h-5 text-slate-400 dark:text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-1">Nome do Setor *</label>
            <input
              type="text"
              value={form.label}
              onChange={(e) => update('label', e.target.value)}
              className="w-full px-4 py-2.5 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-fyness-primary focus:border-transparent text-sm"
              placeholder="Ex: Juridico"
              autoFocus
              onKeyDown={(e) => {
                if (e.key === 'Escape') onClose();
                if (e.key === 'Enter' && form.label.trim()) onSave();
              }}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-2">Cor</label>
            <div className="flex flex-wrap gap-2">
              {SECTOR_COLORS.map(c => (
                <button
                  key={c}
                  onClick={() => update('color', c)}
                  className={`w-8 h-8 rounded-full transition-all ${form.color === c ? 'ring-2 ring-offset-2 ring-slate-400 scale-110' : 'hover:scale-105'}`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </div>

          {/* Preview */}
          {form.label.trim() && (
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-1">Preview</label>
              <span className="inline-block text-xs font-semibold px-3 py-1 rounded-full text-white" style={{ backgroundColor: form.color }}>
                {form.label.trim()}
              </span>
            </div>
          )}
        </div>

        <div className="p-6 bg-slate-50 dark:bg-slate-900 flex items-center justify-between">
          <div>
            {onDelete && (
              <button onClick={onDelete} className="px-3 py-2 text-red-500 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors text-sm font-medium">Excluir</button>
            )}
          </div>
          <div className="flex gap-3">
            <button onClick={onClose} className="px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors text-sm">Cancelar</button>
            <button onClick={onSave} disabled={!form.label.trim()} className="px-4 py-2 bg-fyness-primary text-white rounded-lg hover:bg-fyness-secondary transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed">
              {editing ? 'Salvar' : 'Criar Setor'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ==================== MODAL DE CONFIRMACAO ====================

function DeleteModal({ title, message, onCancel, onConfirm }) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-xl max-w-sm w-full mx-4 overflow-hidden">
        <div className="p-6">
          <div className="w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-6 h-6 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100 text-center mb-2">{title}</h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 text-center">{message}</p>
        </div>
        <div className="p-6 bg-slate-50 dark:bg-slate-900 flex gap-3 justify-center">
          <button onClick={onCancel} className="px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">Cancelar</button>
          <button onClick={onConfirm} className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors">Excluir</button>
        </div>
      </div>
    </div>
  );
}
