/**
 * CrmActivitiesPage - Lista de atividades com filtros, busca e CRUD completo.
 */

import { useState, useEffect, useCallback } from 'react';
import {
  CalendarCheck, Plus, Phone, Mail, Video, FileText, MapPin, Coffee,
  Pencil, Trash2, CheckCircle, Search, X,
} from 'lucide-react';
import { CrmPageHeader, CrmDataTable, CrmBadge, CrmConfirmDialog } from '../components/ui';
import { useCrmActivities, useDeleteCrmActivity, useCompleteCrmActivity } from '../hooks/useCrmQueries';
import { ActivityFormModal } from '../components/ActivityFormModal';

const typeIcons = {
  call: Phone,
  email: Mail,
  meeting: Video,
  visit: MapPin,
  task: FileText,
  follow_up: Coffee,
};

const typeLabels = {
  call: 'Ligacao',
  email: 'Email',
  meeting: 'Reuniao',
  visit: 'Visita',
  task: 'Tarefa',
  follow_up: 'Follow-up',
};

const formatDate = (dateStr) => {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('pt-BR');
};

function useDebounce(value, delay = 300) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
}

export function CrmActivitiesPage() {
  // Filtros
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: 'start_date', direction: 'desc' });

  const debouncedSearch = useDebounce(search);

  const filters = {
    page,
    perPage: 25,
    search: debouncedSearch || undefined,
    type: typeFilter || undefined,
    completed: statusFilter === 'done' ? true : statusFilter === 'pending' ? false : undefined,
    sortBy: sortConfig.key,
    sortOrder: sortConfig.direction,
  };

  const { data, isLoading } = useCrmActivities(filters);
  const deleteMutation = useDeleteCrmActivity();
  const completeMutation = useCompleteCrmActivity();

  const [formOpen, setFormOpen] = useState(false);
  const [editActivity, setEditActivity] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  useEffect(() => { setPage(1); }, [debouncedSearch, typeFilter, statusFilter]);

  const handleNew = () => { setEditActivity(null); setFormOpen(true); };
  const handleEdit = (activity) => { setEditActivity(activity); setFormOpen(true); };
  const handleDelete = async () => {
    if (!deleteTarget) return;
    await deleteMutation.mutateAsync(deleteTarget.id);
    setDeleteTarget(null);
  };

  const handleSort = useCallback((key) => {
    setSortConfig(prev =>
      prev.key === key
        ? { key, direction: prev.direction === 'asc' ? 'desc' : 'asc' }
        : { key, direction: 'asc' }
    );
  }, []);

  const columns = [
    {
      key: 'title',
      label: 'Atividade',
      sortable: true,
      render: (val, row) => {
        const Icon = typeIcons[row.type] || CalendarCheck;
        return (
          <div className="flex items-center gap-2.5">
            <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
              row.completed
                ? 'bg-emerald-50 dark:bg-emerald-900/20'
                : 'bg-blue-50 dark:bg-blue-900/20'
            }`}>
              <Icon size={14} className={row.completed ? 'text-emerald-600 dark:text-emerald-400' : 'text-blue-600 dark:text-blue-400'} />
            </div>
            <div className="min-w-0">
              <div className={`font-medium truncate ${row.completed ? 'text-slate-400 line-through' : 'text-slate-800 dark:text-slate-200'}`}>{val}</div>
              <div className="text-xs text-slate-400">{typeLabels[row.type] || row.type}</div>
            </div>
          </div>
        );
      },
    },
    {
      key: 'startDate',
      label: 'Data',
      sortable: true,
      render: (val) => <span className="text-xs text-slate-500 dark:text-slate-400">{formatDate(val)}</span>,
    },
    {
      key: 'completed',
      label: 'Status',
      render: (val) => (
        <CrmBadge variant={val ? 'success' : 'warning'} dot size="sm">
          {val ? 'Concluida' : 'Pendente'}
        </CrmBadge>
      ),
    },
    {
      key: 'contact',
      label: 'Contato',
      render: (_, row) => row.contact ? (
        <span className="text-xs text-slate-600 dark:text-slate-300 truncate max-w-[120px] block">{row.contact.name}</span>
      ) : <span className="text-slate-300 dark:text-slate-600">—</span>,
    },
    {
      key: 'deal',
      label: 'Negocio',
      render: (_, row) => row.deal ? (
        <span className="text-xs text-slate-600 dark:text-slate-300 truncate max-w-[150px] block">{row.deal.title}</span>
      ) : <span className="text-slate-300 dark:text-slate-600">—</span>,
    },
    {
      key: 'actions',
      label: '',
      render: (_, row) => (
        <div className="flex items-center gap-0.5">
          {!row.completed && (
            <button onClick={(e) => { e.stopPropagation(); completeMutation.mutate(row.id); }}
              title="Marcar como concluida"
              className="p-1.5 rounded-md text-emerald-500 hover:text-emerald-700 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition-colors">
              <CheckCircle size={16} />
            </button>
          )}
          <button onClick={(e) => { e.stopPropagation(); handleEdit(row); }}
            title="Editar"
            className="p-1.5 rounded-md text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors opacity-0 group-hover:opacity-100">
            <Pencil size={14} />
          </button>
          <button onClick={(e) => { e.stopPropagation(); setDeleteTarget(row); }}
            title="Excluir"
            className="p-1.5 rounded-md text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/20 transition-colors opacity-0 group-hover:opacity-100">
            <Trash2 size={14} />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div>
      <CrmPageHeader
        title="Atividades"
        subtitle="Ligacoes, reunioes, tarefas e follow-ups"
        actions={
          <div className="flex items-center gap-2">
            {/* Busca */}
            <div className="relative">
              <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Buscar atividade..."
                className="pl-8 pr-7 py-1.5 text-sm bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg w-44 focus:outline-none focus:ring-2 focus:ring-fyness-primary text-slate-700 dark:text-slate-300 placeholder:text-slate-400"
              />
              {search && (
                <button onClick={() => setSearch('')} className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                  <X size={13} />
                </button>
              )}
            </div>

            {/* Filtro tipo */}
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-1.5 text-slate-600 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-fyness-primary"
            >
              <option value="">Todos os tipos</option>
              {Object.entries(typeLabels).map(([k, v]) => (
                <option key={k} value={k}>{v}</option>
              ))}
            </select>

            {/* Filtro status */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-1.5 text-slate-600 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-fyness-primary"
            >
              <option value="">Todas</option>
              <option value="pending">Pendentes</option>
              <option value="done">Concluidas</option>
            </select>

            <button onClick={handleNew}
              className="flex items-center gap-2 px-4 py-2 bg-fyness-primary hover:bg-fyness-secondary text-white text-sm font-medium rounded-lg transition-colors">
              <Plus size={16} /> Nova Atividade
            </button>
          </div>
        }
      />

      <CrmDataTable
        columns={columns}
        data={data?.data || []}
        loading={isLoading}
        emptyMessage="Nenhuma atividade encontrada"
        emptyIcon={CalendarCheck}
        onRowClick={(row) => handleEdit(row)}
        sortConfig={sortConfig}
        onSort={handleSort}
        pagination={{ page, perPage: 25, total: data?.count || 0, onPageChange: setPage }}
      />

      <ActivityFormModal
        open={formOpen}
        onClose={() => { setFormOpen(false); setEditActivity(null); }}
        activity={editActivity}
      />

      <CrmConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Excluir atividade"
        message={`Tem certeza que deseja excluir "${deleteTarget?.title}"? Esta acao nao pode ser desfeita.`}
        variant="danger"
        loading={deleteMutation.isPending}
      />
    </div>
  );
}

export default CrmActivitiesPage;
