/**
 * FinancialPage -> Kanban de Ordens de Servico (O.S.)
 * - Colunas: Disponiveis | Em Andamento | Concluidas
 * - O.S. como documento oficial ao clicar/criar
 */

import { useState, useEffect, useCallback, useMemo } from 'react';

// ==================== CONSTANTES ====================

const STORAGE_KEY = 'os_orders';

const TEAM_MEMBERS = [
  { id: '1', name: 'Admin', color: '#6366f1' },
  { id: '2', name: 'Operador 1', color: '#22c55e' },
  { id: '3', name: 'Operador 2', color: '#f97316' },
  { id: '4', name: 'Operador 3', color: '#ec4899' },
];

const PRIORITIES = [
  { id: 'low', label: 'Baixa', color: 'bg-slate-100 text-slate-600', dot: 'bg-slate-400' },
  { id: 'medium', label: 'Media', color: 'bg-yellow-100 text-yellow-700', dot: 'bg-yellow-400' },
  { id: 'high', label: 'Alta', color: 'bg-orange-100 text-orange-700', dot: 'bg-orange-500' },
  { id: 'urgent', label: 'Urgente', color: 'bg-red-100 text-red-700', dot: 'bg-red-500' },
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

const EMPTY_FORM = {
  title: '',
  description: '',
  priority: 'medium',
  client: '',
  location: '',
  notes: '',
  estimatedStart: '',
  estimatedEnd: '',
};

function formatDate(iso) {
  if (!iso) return '-';
  return new Date(iso).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

function formatDateShort(dateStr) {
  if (!dateStr) return '-';
  const d = new Date(dateStr + (dateStr.length === 10 ? 'T12:00:00' : ''));
  return d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

// ==================== SEED DATA ====================

function getSeedOrders() {
  const now = new Date().toISOString();
  const day = (offset) => {
    const d = new Date();
    d.setDate(d.getDate() + offset);
    return d.toISOString().split('T')[0];
  };
  return [
    { id: 'os_1', number: 142, title: 'Manutencao Servidor', description: 'Atualizar pacotes e reiniciar servicos do servidor principal. Verificar logs de erro e garantir estabilidade apos reinicio.', client: 'Acme Corp', location: 'Servidor AWS - us-east-1', notes: 'Agendar janela de manutencao fora do horario comercial', priority: 'high', status: 'in_progress', assignee: '2', sortOrder: 0, estimatedStart: day(-1), estimatedEnd: day(1), actualStart: day(0), actualEnd: '', createdAt: now, updatedAt: now },
    { id: 'os_2', number: 143, title: 'Deploy Frontend v2.1', description: 'Deploy da versao 2.1 em producao com novas features de dashboard e correcoes de UI.', client: 'Interno', location: 'Vercel - producao', notes: 'Rodar testes e2e antes do deploy', priority: 'medium', status: 'in_progress', assignee: '3', sortOrder: 0, estimatedStart: day(0), estimatedEnd: day(2), actualStart: day(0), actualEnd: '', createdAt: now, updatedAt: now },
    { id: 'os_3', number: 144, title: 'Corrigir bug login', description: 'Tela branca apos login reportada pelo cliente. Erro no redirect apos autenticacao OAuth.', client: 'Acme Corp', location: 'App Web - Producao', notes: 'Prioridade maxima - cliente impactado', priority: 'urgent', status: 'available', assignee: null, sortOrder: 1, estimatedStart: day(0), estimatedEnd: day(0), actualStart: '', actualEnd: '', createdAt: now, updatedAt: now },
    { id: 'os_4', number: 145, title: 'Configurar backup automatico', description: 'Configurar backup diario do banco PostgreSQL com retencao de 30 dias.', client: 'Interno', location: 'Supabase - PostgreSQL', notes: '', priority: 'medium', status: 'available', assignee: null, sortOrder: 1, estimatedStart: day(1), estimatedEnd: day(3), actualStart: '', actualEnd: '', createdAt: now, updatedAt: now },
    { id: 'os_5', number: 146, title: 'Migrar banco de dados', description: 'Migrar tabelas para novo schema RBAC conforme documentacao.', client: 'Interno', location: 'Supabase', notes: 'Fazer backup antes da migracao', priority: 'high', status: 'available', assignee: null, sortOrder: 2, estimatedStart: day(2), estimatedEnd: day(5), actualStart: '', actualEnd: '', createdAt: now, updatedAt: now },
    { id: 'os_6', number: 147, title: 'Instalar certificado SSL', description: 'Renovar e instalar certificado SSL no dominio principal e subdominio API.', client: 'Fyness', location: 'DNS Cloudflare', notes: 'Certificado vence em 5 dias', priority: 'low', status: 'available', assignee: null, sortOrder: 0, estimatedStart: day(3), estimatedEnd: day(5), actualStart: '', actualEnd: '', createdAt: now, updatedAt: now },
    { id: 'os_7', number: 140, title: 'Setup ambiente dev', description: 'Configurar ambiente de desenvolvimento para novo colaborador incluindo acessos, IDE e repositorios.', client: 'Interno', location: 'Workstation local', notes: 'Novo dev comeca segunda-feira', priority: 'medium', status: 'done', assignee: '3', sortOrder: 2, estimatedStart: day(-5), estimatedEnd: day(-3), actualStart: day(-5), actualEnd: day(-3), createdAt: now, updatedAt: now },
    { id: 'os_8', number: 141, title: 'Atualizar documentacao API', description: 'Documentar novos endpoints da API v3 no Swagger e atualizar README.', client: 'Interno', location: 'Repositorio GitHub', notes: '', priority: 'low', status: 'done', assignee: '1', sortOrder: 1, estimatedStart: day(-4), estimatedEnd: day(-2), actualStart: day(-4), actualEnd: day(-1), createdAt: now, updatedAt: now },
  ];
}

// ==================== PERSISTENCIA ====================

function loadOrders() {
  try {
    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null');
    // Reseed se nao existe ou se dados antigos (sem sortOrder)
    if (stored === null || (stored.length > 0 && stored[0].sortOrder === undefined)) {
      const seed = getSeedOrders();
      saveOrders(seed);
      return seed;
    }
    return stored;
  } catch {
    return [];
  }
}

function saveOrders(orders) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(orders));
}

// ==================== COMPONENTE PRINCIPAL ====================

export default function FinancialPage() {
  const [orders, setOrders] = useState([]);
  const [viewingOrder, setViewingOrder] = useState(null);
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
  const [dropTarget, setDropTarget] = useState(null); // { cardId, position: 'before'|'after' }

  useEffect(() => {
    setOrders(loadOrders());
  }, []);

  const updateOrders = useCallback((newOrders) => {
    setOrders(newOrders);
    saveOrders(newOrders);
  }, []);

  const nextNumber = useMemo(() => {
    return orders.reduce((acc, o) => Math.max(acc, o.number || 0), 0) + 1;
  }, [orders]);

  const filteredOrders = useMemo(() => {
    if (filterMember === 'all') return orders;
    return orders.filter(o => o.assignee === filterMember || o.status === 'available');
  }, [orders, filterMember]);

  const activeOrders = useMemo(() => {
    return filteredOrders.filter(o => o.status !== 'done');
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

  // ==================== HANDLERS ====================

  const openCreate = () => {
    setEditingOrder(null);
    setForm({ ...EMPTY_FORM });
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
      estimatedStart: order.estimatedStart || '',
      estimatedEnd: order.estimatedEnd || '',
    });
    setShowCreateForm(true);
  };

  const handleSave = () => {
    if (!form.title.trim()) return;
    const now = new Date().toISOString();

    if (editingOrder) {
      const updated = orders.map(o =>
        o.id === editingOrder.id
          ? { ...o, ...form, updatedAt: now }
          : o
      );
      updateOrders(updated);
      // Atualizar documento aberto se estiver vendo
      if (viewingOrder?.id === editingOrder.id) {
        setViewingOrder({ ...viewingOrder, ...form, updatedAt: now });
      }
    } else {
      const newOrder = {
        id: `os_${Date.now()}`,
        number: nextNumber,
        ...form,
        status: 'available',
        assignee: null,
        sortOrder: orders.length,
        createdAt: now,
        updatedAt: now,
      };
      updateOrders([...orders, newOrder]);
      setViewingOrder(newOrder); // Abre o documento recem criado
    }
    setShowCreateForm(false);
  };

  const handleDelete = (id) => {
    updateOrders(orders.filter(o => o.id !== id));
    setShowDeleteModal(null);
    if (viewingOrder?.id === id) setViewingOrder(null);
  };

  const handleClaim = (orderId, memberId) => {
    const now = new Date().toISOString();
    const updated = orders.map(o =>
      o.id === orderId
        ? { ...o, assignee: memberId || currentUser, status: 'in_progress', actualStart: now, updatedAt: now }
        : o
    );
    updateOrders(updated);
    if (viewingOrder?.id === orderId) {
      const o = updated.find(x => x.id === orderId);
      setViewingOrder(o);
    }
  };

  const handleRelease = (orderId) => {
    const now = new Date().toISOString();
    const updated = orders.map(o =>
      o.id === orderId ? { ...o, assignee: null, status: 'available', updatedAt: now } : o
    );
    updateOrders(updated);
    if (viewingOrder?.id === orderId) {
      setViewingOrder(updated.find(x => x.id === orderId));
    }
  };

  const handleMoveForward = (orderId) => {
    const now = new Date().toISOString();
    const updated = orders.map(o => {
      if (o.id !== orderId) return o;
      if (o.status === 'available') return { ...o, assignee: currentUser, status: 'in_progress', actualStart: now, updatedAt: now };
      if (o.status === 'in_progress') return { ...o, status: 'done', actualEnd: now, updatedAt: now };
      return o;
    });
    updateOrders(updated);
    if (viewingOrder?.id === orderId) {
      setViewingOrder(updated.find(x => x.id === orderId));
    }
  };

  const handleMoveBack = (orderId) => {
    const now = new Date().toISOString();
    const updated = orders.map(o => {
      if (o.id !== orderId) return o;
      if (o.status === 'done') return { ...o, status: 'in_progress', actualEnd: '', updatedAt: now };
      if (o.status === 'in_progress') return { ...o, assignee: null, status: 'available', actualStart: '', updatedAt: now };
      return o;
    });
    updateOrders(updated);
    if (viewingOrder?.id === orderId) {
      setViewingOrder(updated.find(x => x.id === orderId));
    }
  };

  const handleDrop = (draggedId, targetColumn, targetCardId, position) => {
    const now = new Date().toISOString();
    const draggedOrder = orders.find(o => o.id === draggedId);
    if (!draggedOrder) return;

    const newPriority = targetColumn.priorities.includes(draggedOrder.priority)
      ? draggedOrder.priority
      : targetColumn.priorities[targetColumn.priorities.length - 1];

    // Pegar cards da coluna destino (ja ordenados)
    const colCards = orders
      .filter(o => o.id !== draggedId && targetColumn.priorities.includes(
        o.id === draggedId ? newPriority : o.priority
      ))
      .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));

    // Determinar posicao de insercao
    let insertIndex = colCards.length; // default: fim
    if (targetCardId) {
      const targetIdx = colCards.findIndex(o => o.id === targetCardId);
      if (targetIdx !== -1) {
        insertIndex = position === 'before' ? targetIdx : targetIdx + 1;
      }
    }

    // Inserir na posicao e recalcular sortOrder
    colCards.splice(insertIndex, 0, { ...draggedOrder, priority: newPriority });
    const newSortMap = {};
    colCards.forEach((o, i) => { newSortMap[o.id] = i; });

    const updated = orders.map(o => {
      if (o.id === draggedId) {
        return { ...o, priority: newPriority, sortOrder: newSortMap[o.id] ?? o.sortOrder, updatedAt: now };
      }
      if (newSortMap[o.id] !== undefined) {
        return { ...o, sortOrder: newSortMap[o.id] };
      }
      return o;
    });

    updateOrders(updated);
    if (viewingOrder?.id === draggedId) {
      setViewingOrder(updated.find(x => x.id === draggedId));
    }
  };

  // ==================== RENDER ====================

  // Se um documento esta aberto, mostra o documento
  if (viewingOrder) {
    return (
      <OSDocument
        order={viewingOrder}
        currentUser={currentUser}
        onBack={() => setViewingOrder(null)}
        onEdit={() => openEdit(viewingOrder)}
        onClaim={(memberId) => handleClaim(viewingOrder.id, memberId)}
        onRelease={() => handleRelease(viewingOrder.id)}
        onMoveForward={() => handleMoveForward(viewingOrder.id)}
        onMoveBack={() => handleMoveBack(viewingOrder.id)}
        onDelete={() => setShowDeleteModal(viewingOrder.id)}
      />
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <button onClick={openCreate} className="flex items-center gap-2 px-4 py-2 bg-fyness-primary text-white rounded-lg hover:bg-fyness-secondary transition-colors text-sm font-medium shadow-sm">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Nova O.S.
          </button>
          <span className="text-sm text-slate-500">{orders.length} ordem{orders.length !== 1 ? 's' : ''}</span>
        </div>

        <div className="flex items-center gap-2">
          <label htmlFor="filter-member" className="text-xs font-medium text-slate-500">Filtrar:</label>
          <div className="relative">
            <select
              id="filter-member"
              value={filterMember}
              onChange={(e) => setFilterMember(e.target.value)}
              className="appearance-none pl-3 pr-8 py-1.5 text-sm border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-fyness-primary focus:border-transparent cursor-pointer"
            >
              <option value="all">Todos os funcionarios</option>
              {TEAM_MEMBERS.map(m => (
                <option key={m.id} value={m.id}>{m.name}</option>
              ))}
            </select>
            <svg className="w-4 h-4 text-slate-400 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
          {filterMember !== 'all' && (
            <div className="flex items-center gap-1.5 px-2.5 py-1 text-xs rounded-full font-medium text-white shadow-sm" style={{ backgroundColor: TEAM_MEMBERS.find(m => m.id === filterMember)?.color || '#6366f1' }}>
              <div className="w-2 h-2 rounded-full bg-white/70" />
              {TEAM_MEMBERS.find(m => m.id === filterMember)?.name}
              <button onClick={() => setFilterMember('all')} className="ml-1 hover:bg-white/20 rounded-full p-0.5 transition-colors">
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Kanban por Prioridade (drag-and-drop) */}
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
                  : 'border-slate-200 bg-slate-50'
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
                  <div className={`text-center py-8 text-sm ${isOver ? 'text-fyness-primary font-medium' : 'text-slate-400'}`}>
                    {isOver ? 'Soltar aqui' : column.emptyText}
                  </div>
                ) : (
                  colOrders.map(order => (
                    <OSCard
                      key={order.id}
                      order={order}
                      onClick={() => setViewingOrder(order)}
                      isDragging={draggingId === order.id}
                      dropPosition={dropTarget?.cardId === order.id ? dropTarget.position : null}
                      onDragStart={() => setDraggingId(order.id)}
                      onDragEnd={() => { setDraggingId(null); setDragOverCol(null); setDropTarget(null); }}
                      onCardDragOver={(position) => setDropTarget({ cardId: order.id, position })}
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
            className="flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-slate-800 transition-colors"
          >
            <svg className={`w-4 h-4 transition-transform ${showDone ? 'rotate-90' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
            <span className="flex items-center gap-2">
              Concluidas
              <span className="bg-green-100 text-green-700 text-xs px-2 py-0.5 rounded-full font-medium">{doneOrders.length}</span>
            </span>
          </button>

          {showDone && (() => {
            const perPage = 15;
            const totalPages = Math.ceil(doneOrders.length / perPage);
            const page = Math.min(donePage, totalPages - 1);
            const pagedOrders = doneOrders.slice(page * perPage, (page + 1) * perPage);
            return (
              <div className="mt-3 bg-white rounded-xl border border-slate-200 overflow-hidden">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200">
                      <th className="text-left px-4 py-2.5 text-[10px] font-semibold text-slate-400 uppercase tracking-wider">O.S.</th>
                      <th className="text-left px-4 py-2.5 text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Titulo</th>
                      <th className="text-left px-4 py-2.5 text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Cliente</th>
                      <th className="text-left px-4 py-2.5 text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Responsavel</th>
                      <th className="text-left px-4 py-2.5 text-[10px] font-semibold text-green-500 uppercase tracking-wider">Inicio Real</th>
                      <th className="text-left px-4 py-2.5 text-[10px] font-semibold text-green-500 uppercase tracking-wider">Fim Real</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pagedOrders.map(order => {
                      const member = TEAM_MEMBERS.find(m => m.id === order.assignee);
                      return (
                        <tr
                          key={order.id}
                          onClick={() => setViewingOrder(order)}
                          className="border-b border-slate-100 last:border-b-0 hover:bg-slate-50 cursor-pointer transition-colors"
                        >
                          <td className="px-4 py-2.5 font-bold text-slate-400">#{order.number}</td>
                          <td className="px-4 py-2.5 font-medium text-slate-800">{order.title}</td>
                          <td className="px-4 py-2.5 text-slate-500">{order.client || '-'}</td>
                          <td className="px-4 py-2.5">
                            {member ? (
                              <div className="flex items-center gap-1.5">
                                <div className="w-5 h-5 rounded-full flex items-center justify-center text-white text-[9px] font-bold" style={{ backgroundColor: member.color }}>{member.name.charAt(0)}</div>
                                <span className="text-slate-600">{member.name}</span>
                              </div>
                            ) : (
                              <span className="text-slate-400 italic">-</span>
                            )}
                          </td>
                          <td className="px-4 py-2.5 text-slate-600">{formatDate(order.actualStart)}</td>
                          <td className="px-4 py-2.5 text-slate-600">{formatDate(order.actualEnd)}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
                {totalPages > 1 && (
                  <div className="flex items-center justify-between px-4 py-3 border-t border-slate-200 bg-slate-50">
                    <span className="text-xs text-slate-500">
                      {page * perPage + 1}-{Math.min((page + 1) * perPage, doneOrders.length)} de {doneOrders.length}
                    </span>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => setDonePage(Math.max(0, page - 1))}
                        disabled={page === 0}
                        className="px-2.5 py-1 text-xs rounded-lg border border-slate-300 text-slate-600 hover:bg-white transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                      >
                        Anterior
                      </button>
                      {Array.from({ length: totalPages }, (_, i) => (
                        <button
                          key={i}
                          onClick={() => setDonePage(i)}
                          className={`w-7 h-7 text-xs rounded-lg transition-colors ${i === page ? 'bg-fyness-primary text-white' : 'border border-slate-300 text-slate-600 hover:bg-white'}`}
                        >
                          {i + 1}
                        </button>
                      ))}
                      <button
                        onClick={() => setDonePage(Math.min(totalPages - 1, page + 1))}
                        disabled={page === totalPages - 1}
                        className="px-2.5 py-1 text-xs rounded-lg border border-slate-300 text-slate-600 hover:bg-white transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
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

      {/* Create/Edit Form Modal */}
      {showCreateForm && (
        <OSFormModal
          form={form}
          setForm={setForm}
          editing={!!editingOrder}
          number={editingOrder?.number || nextNumber}
          onSave={handleSave}
          onClose={() => setShowCreateForm(false)}
          onDelete={editingOrder ? () => { setShowDeleteModal(editingOrder.id); setShowCreateForm(false); } : null}
        />
      )}

      {/* Delete Confirmation */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-sm w-full mx-4 overflow-hidden">
            <div className="p-6">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-slate-800 text-center mb-2">Excluir O.S.?</h3>
              <p className="text-sm text-slate-500 text-center">Esta acao nao pode ser desfeita.</p>
            </div>
            <div className="p-6 bg-slate-50 flex gap-3 justify-center">
              <button onClick={() => setShowDeleteModal(null)} className="px-4 py-2 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-100 transition-colors">Cancelar</button>
              <button onClick={() => handleDelete(showDeleteModal)} className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors">Excluir</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ==================== CARD KANBAN (simplificado - clique abre documento) ====================

function OSCard({ order, onClick, isDragging, dropPosition, onDragStart, onDragEnd, onCardDragOver }) {
  const member = TEAM_MEMBERS.find(m => m.id === order.assignee);

  const statusStyle = order.status === 'available'
    ? 'bg-slate-100 text-slate-600'
    : order.status === 'in_progress'
      ? 'bg-blue-100 text-blue-700'
      : 'bg-green-100 text-green-700';

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
        draggable
        onDragStart={(e) => {
          e.dataTransfer.setData('text/plain', order.id);
          e.dataTransfer.effectAllowed = 'move';
          onDragStart();
        }}
        onDragEnd={onDragEnd}
        onDragOver={handleDragOver}
        onClick={onClick}
        className={`bg-white rounded-lg border border-slate-200 p-3 transition-all cursor-grab active:cursor-grabbing group ${
          isDragging ? 'opacity-40 scale-95 shadow-none' : 'hover:shadow-md hover:border-fyness-primary/30'
        }`}
      >
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-xs font-bold text-slate-400">O.S. #{order.number}</span>
          <span className={`inline-flex items-center gap-1 text-[10px] font-medium px-1.5 py-0.5 rounded-full ${statusStyle}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${statusDot}`} />
            {STATUS_LABELS[order.status]}
          </span>
        </div>
        <h4 className="text-sm font-semibold text-slate-800 mb-1 group-hover:text-fyness-primary transition-colors">{order.title}</h4>
        {order.client && <p className="text-[11px] text-slate-400 mb-1">{order.client}</p>}
        <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-100">
          {member ? (
            <div className="flex items-center gap-1.5">
              <div className="w-5 h-5 rounded-full flex items-center justify-center text-white text-[9px] font-bold" style={{ backgroundColor: member.color }}>{member.name.charAt(0)}</div>
              <span className="text-xs text-slate-600">{member.name}</span>
            </div>
          ) : (
            <span className="text-xs text-slate-400 italic">Sem responsavel</span>
          )}
          <svg className="w-4 h-4 text-slate-300 group-hover:text-fyness-primary transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </div>
      </div>
      {dropPosition === 'after' && (
        <div className="h-1 bg-fyness-primary rounded-full mx-1 mt-1 animate-pulse" />
      )}
    </div>
  );
}

// ==================== DOCUMENTO O.S. ====================

function OSDocument({ order, currentUser, onBack, onEdit, onClaim, onRelease, onMoveForward, onMoveBack, onDelete }) {
  const member = TEAM_MEMBERS.find(m => m.id === order.assignee);
  const priority = PRIORITIES.find(p => p.id === order.priority) || PRIORITIES[1];
  const isOwner = order.assignee === currentUser;
  const [showAssignMenu, setShowAssignMenu] = useState(false);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="h-full flex flex-col">
      {/* Toolbar */}
      <div className="flex items-center justify-between mb-4 print:hidden">
        <button onClick={onBack} className="flex items-center gap-2 text-sm text-slate-600 hover:text-slate-800 transition-colors">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Voltar ao Kanban
        </button>

        <div className="flex items-center gap-2">
          {/* Acoes de status */}
          {order.status === 'available' && (
            <div className="relative">
              <button onClick={() => setShowAssignMenu(!showAssignMenu)} className="px-3 py-1.5 bg-fyness-primary text-white text-sm rounded-lg hover:bg-fyness-secondary transition-colors font-medium">
                Pegar O.S.
              </button>
              {showAssignMenu && (
                <>
                  <div className="fixed inset-0 z-30" onClick={() => setShowAssignMenu(false)} />
                  <div className="absolute right-0 top-full mt-1 bg-white border border-slate-200 rounded-lg shadow-lg py-1 z-40 min-w-[160px]">
                    <div className="px-3 py-1.5 text-[10px] font-semibold text-slate-400 uppercase">Atribuir a:</div>
                    {TEAM_MEMBERS.map(m => (
                      <button key={m.id} onClick={() => { onClaim(m.id); setShowAssignMenu(false); }} className="w-full px-3 py-1.5 text-left text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-2">
                        <div className="w-4 h-4 rounded-full flex items-center justify-center text-white text-[8px] font-bold" style={{ backgroundColor: m.color }}>{m.name.charAt(0)}</div>
                        {m.name} {m.id === currentUser && <span className="text-slate-400 ml-auto">(eu)</span>}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>
          )}
          {order.status === 'in_progress' && (
            <>
              <button onClick={onMoveForward} className="px-3 py-1.5 bg-green-500 text-white text-sm rounded-lg hover:bg-green-600 transition-colors font-medium">Concluir</button>
              {isOwner && (
                <button onClick={onRelease} className="px-3 py-1.5 border border-orange-300 text-orange-600 text-sm rounded-lg hover:bg-orange-50 transition-colors">Devolver</button>
              )}
            </>
          )}
          {order.status === 'done' && (
            <button onClick={onMoveBack} className="px-3 py-1.5 border border-slate-300 text-slate-600 text-sm rounded-lg hover:bg-slate-50 transition-colors">Reabrir</button>
          )}

          <button onClick={onEdit} className="px-3 py-1.5 border border-slate-300 text-slate-600 text-sm rounded-lg hover:bg-slate-50 transition-colors">Editar</button>
          <button onClick={handlePrint} className="px-3 py-1.5 border border-slate-300 text-slate-600 text-sm rounded-lg hover:bg-slate-50 transition-colors flex items-center gap-1.5">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
            </svg>
            Imprimir
          </button>
          <button onClick={onDelete} className="px-3 py-1.5 border border-red-200 text-red-500 text-sm rounded-lg hover:bg-red-50 transition-colors">Excluir</button>
        </div>
      </div>

      {/* Documento */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-3xl mx-auto bg-white rounded-xl border border-slate-200 shadow-sm print:shadow-none print:border-none print:max-w-none">
          {/* Cabecalho do documento */}
          <div className="border-b-2 border-slate-800 p-8 pb-6">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-fyness-primary to-fyness-secondary rounded-xl flex items-center justify-center print:bg-slate-800">
                  <span className="text-white font-bold text-lg">F</span>
                </div>
                <div>
                  <h1 className="text-xl font-bold text-slate-800">FYNESS</h1>
                  <p className="text-xs text-slate-500">Gestao de Processos</p>
                </div>
              </div>
              <div className="text-right">
                <h2 className="text-2xl font-bold text-slate-800">ORDEM DE SERVICO</h2>
                <p className="text-3xl font-black text-fyness-primary mt-1 print:text-slate-800">#{String(order.number).padStart(3, '0')}</p>
              </div>
            </div>
          </div>

          {/* Info grid */}
          <div className="grid grid-cols-2 border-b border-slate-200">
            <div className="p-4 border-r border-slate-200">
              <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Status</label>
              <div className="mt-1">
                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${
                  order.status === 'available' ? 'bg-slate-100 text-slate-700' :
                  order.status === 'in_progress' ? 'bg-blue-100 text-blue-700' :
                  'bg-green-100 text-green-700'
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
              <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Prioridade</label>
              <div className="mt-1">
                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${priority.color}`}>
                  <span className={`w-2 h-2 rounded-full ${priority.dot}`} />
                  {priority.label}
                </span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 border-b border-slate-200">
            <div className="p-4 border-r border-slate-200">
              <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Data de Abertura</label>
              <p className="text-sm text-slate-800 mt-1 font-medium">{formatDate(order.createdAt)}</p>
            </div>
            <div className="p-4">
              <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Ultima Atualizacao</label>
              <p className="text-sm text-slate-800 mt-1 font-medium">{formatDate(order.updatedAt)}</p>
            </div>
          </div>

          <div className="grid grid-cols-4 border-b border-slate-200">
            <div className="p-4 border-r border-slate-200">
              <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Previsao de Inicio</label>
              <p className="text-sm text-slate-800 mt-1 font-medium">{formatDateShort(order.estimatedStart)}</p>
            </div>
            <div className="p-4 border-r border-slate-200">
              <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Previsao de Entrega</label>
              <p className="text-sm text-slate-800 mt-1 font-medium">{formatDateShort(order.estimatedEnd)}</p>
            </div>
            <div className="p-4 border-r border-slate-200">
              <label className="text-[10px] font-semibold text-green-500 uppercase tracking-wider">Inicio Real</label>
              <p className="text-sm text-slate-800 mt-1 font-medium">{formatDate(order.actualStart)}</p>
            </div>
            <div className="p-4">
              <label className="text-[10px] font-semibold text-green-500 uppercase tracking-wider">Fim Real</label>
              <p className="text-sm text-slate-800 mt-1 font-medium">{formatDate(order.actualEnd)}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 border-b border-slate-200">
            <div className="p-4 border-r border-slate-200">
              <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Cliente / Solicitante</label>
              <p className="text-sm text-slate-800 mt-1 font-medium">{order.client || '-'}</p>
            </div>
            <div className="p-4">
              <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Local / Ambiente</label>
              <p className="text-sm text-slate-800 mt-1 font-medium">{order.location || '-'}</p>
            </div>
          </div>

          <div className="p-4 border-b border-slate-200">
            <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Responsavel</label>
            {member ? (
              <div className="flex items-center gap-2 mt-1">
                <div className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold" style={{ backgroundColor: member.color }}>{member.name.charAt(0)}</div>
                <span className="text-sm font-medium text-slate-800">{member.name}</span>
              </div>
            ) : (
              <p className="text-sm text-slate-400 mt-1 italic">Nao atribuido</p>
            )}
          </div>

          {/* Titulo e Descricao */}
          <div className="p-6 border-b border-slate-200">
            <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Titulo do Servico</label>
            <h3 className="text-lg font-bold text-slate-800 mt-1">{order.title}</h3>
          </div>

          <div className="p-6 border-b border-slate-200">
            <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Descricao do Servico</label>
            <p className="text-sm text-slate-700 mt-2 leading-relaxed whitespace-pre-wrap">{order.description || 'Sem descricao.'}</p>
          </div>

          {order.notes && (
            <div className="p-6 border-b border-slate-200 bg-amber-50/50">
              <label className="text-[10px] font-semibold text-amber-600 uppercase tracking-wider">Observacoes</label>
              <p className="text-sm text-slate-700 mt-2 leading-relaxed whitespace-pre-wrap">{order.notes}</p>
            </div>
          )}

          {/* Assinaturas */}
          <div className="p-8 grid grid-cols-2 gap-12">
            <div className="text-center">
              <div className="border-b border-slate-300 mb-2 h-16" />
              <p className="text-xs text-slate-500 font-medium">Solicitante</p>
            </div>
            <div className="text-center">
              <div className="border-b border-slate-300 mb-2 h-16" />
              <p className="text-xs text-slate-500 font-medium">Responsavel pela Execucao</p>
            </div>
          </div>

          {/* Rodape */}
          <div className="bg-slate-50 px-8 py-3 text-center border-t border-slate-200 rounded-b-xl">
            <p className="text-[10px] text-slate-400">Fyness - Gestao de Processos Empresariais | Documento gerado em {formatDate(new Date().toISOString())}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

// ==================== MODAL FORMULARIO ====================

function OSFormModal({ form, setForm, editing, number, onSave, onClose, onDelete }) {
  const update = (field, value) => setForm(prev => ({ ...prev, [field]: value }));

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-xl max-w-lg w-full mx-4 overflow-hidden max-h-[90vh] flex flex-col">
        <div className="p-6 border-b border-slate-200 flex items-center justify-between shrink-0">
          <h3 className="text-lg font-semibold text-slate-800">
            {editing ? `Editar O.S. #${number}` : `Nova O.S. #${number}`}
          </h3>
          <button onClick={onClose} className="p-1 hover:bg-slate-100 rounded-lg transition-colors">
            <svg className="w-5 h-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-6 space-y-4 overflow-y-auto">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Titulo do Servico *</label>
            <input type="text" value={form.title} onChange={(e) => update('title', e.target.value)} className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-fyness-primary focus:border-transparent text-sm" placeholder="Ex: Manutencao do servidor principal" autoFocus onKeyDown={(e) => { if (e.key === 'Escape') onClose(); }} />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Cliente / Solicitante</label>
              <input type="text" value={form.client} onChange={(e) => update('client', e.target.value)} className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-fyness-primary focus:border-transparent text-sm" placeholder="Ex: Acme Corp" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Local / Ambiente</label>
              <input type="text" value={form.location} onChange={(e) => update('location', e.target.value)} className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-fyness-primary focus:border-transparent text-sm" placeholder="Ex: Servidor AWS" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Prioridade</label>
            <div className="flex gap-2">
              {PRIORITIES.map(p => (
                <button key={p.id} onClick={() => update('priority', p.id)} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-sm transition-all ${form.priority === p.id ? `${p.color} border-transparent font-medium` : 'border-slate-200 text-slate-500 hover:bg-slate-50'}`}>
                  <div className={`w-2 h-2 rounded-full ${p.dot}`} />
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Previsao de Inicio</label>
              <input type="date" value={form.estimatedStart} onChange={(e) => update('estimatedStart', e.target.value)} className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-fyness-primary focus:border-transparent text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Previsao de Entrega</label>
              <input type="date" value={form.estimatedEnd} onChange={(e) => update('estimatedEnd', e.target.value)} className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-fyness-primary focus:border-transparent text-sm" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Descricao do Servico</label>
            <textarea value={form.description} onChange={(e) => update('description', e.target.value)} rows={4} className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-fyness-primary focus:border-transparent text-sm resize-none" placeholder="Descreva o servico a ser executado..." />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Observacoes</label>
            <textarea value={form.notes} onChange={(e) => update('notes', e.target.value)} rows={2} className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-fyness-primary focus:border-transparent text-sm resize-none" placeholder="Observacoes adicionais..." />
          </div>
        </div>

        <div className="p-6 bg-slate-50 flex items-center justify-between shrink-0">
          <div>
            {onDelete && (
              <button onClick={onDelete} className="px-3 py-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors text-sm font-medium">Excluir</button>
            )}
          </div>
          <div className="flex gap-3">
            <button onClick={onClose} className="px-4 py-2 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-100 transition-colors text-sm">Cancelar</button>
            <button onClick={onSave} disabled={!form.title.trim()} className="px-4 py-2 bg-fyness-primary text-white rounded-lg hover:bg-fyness-secondary transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed">
              {editing ? 'Salvar' : 'Gerar O.S.'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
