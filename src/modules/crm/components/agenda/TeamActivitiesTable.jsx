/**
 * TeamActivitiesTable - Busca e CRUD completo das atividades do TIME
 * (todas, nao so as do usuario logado). Vive dentro da Agenda (aba "Time"),
 * complementando o placar/briefing com uma tabela filtravel/pesquisavel —
 * util pra achar uma atividade especifica ou auditar o que ja foi feito.
 */

import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  CalendarCheck, Plus, Phone, Mail, Video, FileText, MapPin, Coffee, MessageCircle,
  Pencil, Trash2, CheckCircle, Search, X,
} from 'lucide-react';
import { CrmDataTable, CrmBadge, CrmConfirmDialog } from '../ui';
import { useCrmActivities, useDeleteCrmActivity, useCompleteCrmActivity } from '../../hooks/useCrmQueries';
import { useUrlState, useUrlInt } from '../../../../hooks/useUrlState';
import { ActivityFormModal } from '../ActivityFormModal';
import { CompleteActivityModal } from '../CompleteActivityModal';

const typeIcons = {
  call: Phone,
  email: Mail,
  message: MessageCircle,
  meeting: Video,
  visit: MapPin,
  task: FileText,
  lunch: Coffee,
};

const typeLabels = {
  call: 'Ligacao',
  email: 'Email',
  message: 'Mensagem',
  meeting: 'Reuniao',
  visit: 'Visita',
  task: 'Tarefa',
  lunch: 'Almoco',
};

const formatDate = (dateStr) => {
  if (!dateStr) return '—';
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return '—';
  return d.toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', year: '2-digit', hour: '2-digit', minute: '2-digit' });
};

function useDebounce(value, delay = 300) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
}

export function TeamActivitiesTable() {
  const navigate = useNavigate();
  // Filtros (persistidos em URL, prefixo "at" pra nao colidir com outros
  // params da Agenda, ex: "visao").
  const [page, setPage] = useUrlInt('atPage', 1);
  const [search, setSearch] = useUrlState('atQ', '');
  const [typeFilter, setTypeFilter] = useUrlState('atType', '');
  const [statusFilter, setStatusFilter] = useUrlState('atStatus', '');
  const [sortKey, setSortKey] = useUrlState('atSort', 'start_date');
  const [sortDir, setSortDir] = useUrlState('atDir', 'desc');
  const sortConfig = { key: sortKey, direction: sortDir };

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
  const [completingTask, setCompletingTask] = useState(null);

  useEffect(() => { setPage(1); }, [debouncedSearch, typeFilter, statusFilter]);

  const handleNew = () => { setEditActivity(null); setFormOpen(true); };
  const handleEdit = (activity) => { setEditActivity(activity); setFormOpen(true); };
  const handleDelete = async () => {
    if (!deleteTarget) return;
    await deleteMutation.mutateAsync(deleteTarget.id);
    setDeleteTarget(null);
  };

  const handleSort = useCallback((key) => {
    if (key === sortKey) {
      setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortDir('asc');
    }
  }, [sortKey, sortDir, setSortKey, setSortDir]);

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
            <button onClick={(e) => { e.stopPropagation(); setCompletingTask({ id: row.id, title: row.title, type: row.type }); }}
              title="Marcar como concluida"
              className="p-1.5 rounded-md text-emerald-500 hover:text-emerald-700 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition-colors">
              <CheckCircle size={16} />
            </button>
          )}
          <button onClick={(e) => { e.stopPropagation(); handleEdit(row); }}
            title="Editar"
            className="p-1.5 rounded-md text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors md:opacity-0 md:group-hover:opacity-100">
            <Pencil size={14} />
          </button>
          <button onClick={(e) => { e.stopPropagation(); setDeleteTarget(row); }}
            title="Excluir"
            className="p-1.5 rounded-md text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/20 transition-colors md:opacity-0 md:group-hover:opacity-100">
            <Trash2 size={14} />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div>
          <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100">Todas as atividades</h3>
          <p className="text-xs text-slate-400 dark:text-slate-500">Ligações, reuniões, tarefas e follow-ups do time inteiro</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar atividade..."
              className="pl-8 pr-7 py-1.5 text-sm bg-white/70 dark:bg-slate-800/60 backdrop-blur border border-white/60 dark:border-white/10 rounded-lg w-44 focus:outline-none focus:ring-2 focus:ring-fyness-primary text-slate-700 dark:text-slate-300 placeholder:text-slate-400"
            />
            {search && (
              <button onClick={() => setSearch('')} className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                <X size={13} />
              </button>
            )}
          </div>

          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="text-xs bg-white/70 dark:bg-slate-800/60 backdrop-blur border border-white/60 dark:border-white/10 rounded-lg px-2.5 py-1.5 text-slate-600 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-fyness-primary"
          >
            <option value="">Todos os tipos</option>
            {Object.entries(typeLabels).map(([k, v]) => (
              <option key={k} value={k}>{v}</option>
            ))}
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="text-xs bg-white/70 dark:bg-slate-800/60 backdrop-blur border border-white/60 dark:border-white/10 rounded-lg px-2.5 py-1.5 text-slate-600 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-fyness-primary"
          >
            <option value="">Todas</option>
            <option value="pending">Pendentes</option>
            <option value="done">Concluidas</option>
          </select>

          <button onClick={handleNew}
            className="flex items-center gap-2 px-3 py-1.5 bg-fyness-primary hover:bg-fyness-secondary text-white text-sm font-medium rounded-lg transition-colors">
            <Plus size={15} /> Nova
          </button>
        </div>
      </div>

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
        onOpenLeadHistory={(act) => (act?.dealId || act?.contactId) && navigate(`/crm/agenda?dealId=${act.dealId || ''}&contactId=${act.contactId || ''}`)}
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

      <CompleteActivityModal
        open={!!completingTask}
        onClose={() => setCompletingTask(null)}
        activity={completingTask}
        isPending={completeMutation.isPending}
        onSubmit={({ input, output }) => {
          completeMutation.mutate({ id: completingTask.id, input, output }, {
            onSuccess: () => setCompletingTask(null),
          });
        }}
      />
    </div>
  );
}

export default TeamActivitiesTable;
