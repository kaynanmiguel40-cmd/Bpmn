/**
 * CrmProposalsPage - Lista de propostas com filtros, busca e CRUD completo.
 */

import { useState, useCallback } from 'react';
import { FileText, Plus, Pencil, Trash2, Search, X, Send, Eye, Check, XCircle } from 'lucide-react';
import { CrmPageHeader, CrmDataTable, CrmBadge, CrmConfirmDialog } from '../components/ui';
import { useCrmProposals, useDeleteCrmProposal, useUpdateCrmProposalStatus } from '../hooks/useCrmQueries';
import { ProposalFormModal } from '../components/ProposalFormModal';

const statusMap = {
  draft: { label: 'Rascunho', variant: 'neutral' },
  sent: { label: 'Enviada', variant: 'info' },
  viewed: { label: 'Visualizada', variant: 'warning' },
  accepted: { label: 'Aceita', variant: 'success' },
  rejected: { label: 'Rejeitada', variant: 'danger' },
  expired: { label: 'Expirada', variant: 'warning' },
};

const formatCurrency = (val) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val || 0);

const formatDate = (dateStr) => {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('pt-BR');
};

export function CrmProposalsPage() {
  // Filtros
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [appliedSearch, setAppliedSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: 'created_at', direction: 'desc' });

  const filters = {
    page,
    perPage: 25,
    search: appliedSearch || undefined,
    status: statusFilter || undefined,
  };

  const { data, isLoading } = useCrmProposals(filters);
  const deleteMutation = useDeleteCrmProposal();
  const statusMutation = useUpdateCrmProposalStatus();

  const [formOpen, setFormOpen] = useState(false);
  const [editProposal, setEditProposal] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const handleNew = () => { setEditProposal(null); setFormOpen(true); };
  const handleEdit = (proposal) => { setEditProposal(proposal); setFormOpen(true); };
  const handleDelete = async () => {
    if (!deleteTarget) return;
    await deleteMutation.mutateAsync(deleteTarget.id);
    setDeleteTarget(null);
  };

  const handleSearch = () => {
    setAppliedSearch(search);
    setPage(1);
  };

  const handleClearSearch = () => {
    setSearch('');
    setAppliedSearch('');
    setPage(1);
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
      key: 'proposalNumber',
      label: '#',
      render: (val) => <span className="font-mono text-xs text-slate-500 dark:text-slate-400">{val || '—'}</span>,
    },
    {
      key: 'deal',
      label: 'Negocio',
      render: (_, row) => (
        <div>
          <div className="font-medium text-slate-800 dark:text-slate-200">{row.deal?.title || '—'}</div>
          {(row.deal?.company || row.deal?.contact) && (
            <div className="text-xs text-slate-400 truncate max-w-[200px]">
              {[row.deal?.company?.name, row.deal?.contact?.name].filter(Boolean).join(' · ')}
            </div>
          )}
        </div>
      ),
    },
    {
      key: 'totalValue',
      label: 'Valor',
      sortable: true,
      render: (val) => <span className="font-semibold text-emerald-600 dark:text-emerald-400">{formatCurrency(val)}</span>,
    },
    {
      key: 'items',
      label: 'Itens',
      render: (val) => (
        <span className="text-xs text-slate-500 dark:text-slate-400">
          {Array.isArray(val) ? val.length : 0} {Array.isArray(val) && val.length === 1 ? 'item' : 'itens'}
        </span>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      render: (val) => {
        const s = statusMap[val] || statusMap.draft;
        return <CrmBadge variant={s.variant} dot>{s.label}</CrmBadge>;
      },
    },
    {
      key: 'createdAt',
      label: 'Criada em',
      render: (val) => <span className="text-xs text-slate-500 dark:text-slate-400">{formatDate(val)}</span>,
    },
    {
      key: 'actions',
      label: '',
      render: (_, row) => (
        <div className="flex items-center gap-0.5 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
          {/* Acoes rapidas de status */}
          {row.status === 'draft' && (
            <button onClick={(e) => { e.stopPropagation(); statusMutation.mutate({ id: row.id, status: 'sent' }); }}
              title="Marcar como Enviada"
              className="p-1.5 rounded-md text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors">
              <Send size={13} />
            </button>
          )}
          {row.status === 'sent' && (
            <button onClick={(e) => { e.stopPropagation(); statusMutation.mutate({ id: row.id, status: 'viewed' }); }}
              title="Marcar como Visualizada"
              className="p-1.5 rounded-md text-slate-400 hover:text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-900/20 transition-colors">
              <Eye size={13} />
            </button>
          )}
          {(row.status === 'sent' || row.status === 'viewed') && (
            <>
              <button onClick={(e) => { e.stopPropagation(); statusMutation.mutate({ id: row.id, status: 'accepted' }); }}
                title="Aceitar"
                className="p-1.5 rounded-md text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition-colors">
                <Check size={13} />
              </button>
              <button onClick={(e) => { e.stopPropagation(); statusMutation.mutate({ id: row.id, status: 'rejected' }); }}
                title="Rejeitar"
                className="p-1.5 rounded-md text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/20 transition-colors">
                <XCircle size={13} />
              </button>
            </>
          )}
          <button onClick={(e) => { e.stopPropagation(); handleEdit(row); }}
            title="Editar"
            className="p-1.5 rounded-md text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors">
            <Pencil size={13} />
          </button>
          <button onClick={(e) => { e.stopPropagation(); setDeleteTarget(row); }}
            title="Excluir"
            className="p-1.5 rounded-md text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/20 transition-colors">
            <Trash2 size={13} />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div>
      <CrmPageHeader
        title="Propostas"
        subtitle="Propostas comerciais do CRM"
        actions={
          <div className="flex items-center gap-2">
            {/* Busca */}
            <div className="relative">
              <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') handleSearch(); }}
                placeholder="Buscar negocio..."
                className="pl-8 pr-7 py-1.5 text-sm bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg w-44 focus:outline-none focus:ring-2 focus:ring-fyness-primary text-slate-700 dark:text-slate-300 placeholder:text-slate-400"
              />
              {search && (
                <button onClick={handleClearSearch} className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                  <X size={13} />
                </button>
              )}
            </div>

            {/* Filtro status */}
            <select
              value={statusFilter}
              onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
              className="text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-1.5 text-slate-600 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-fyness-primary"
            >
              <option value="">Todos os status</option>
              {Object.entries(statusMap).map(([k, v]) => (
                <option key={k} value={k}>{v.label}</option>
              ))}
            </select>

            <button onClick={handleNew}
              className="flex items-center gap-2 px-4 py-2 bg-fyness-primary hover:bg-fyness-secondary text-white text-sm font-medium rounded-lg transition-colors">
              <Plus size={16} /> Nova Proposta
            </button>
          </div>
        }
      />

      <CrmDataTable
        columns={columns}
        data={data?.data || []}
        loading={isLoading}
        emptyMessage="Nenhuma proposta encontrada"
        emptyIcon={FileText}
        onRowClick={(row) => handleEdit(row)}
        sortConfig={sortConfig}
        onSort={handleSort}
        pagination={{ page, perPage: 25, total: data?.count || 0, onPageChange: setPage }}
      />

      <ProposalFormModal
        open={formOpen}
        onClose={() => { setFormOpen(false); setEditProposal(null); }}
        proposal={editProposal}
      />

      <CrmConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Excluir proposta"
        message={`Tem certeza que deseja excluir esta proposta? Esta acao nao pode ser desfeita.`}
        variant="danger"
        loading={deleteMutation.isPending}
      />
    </div>
  );
}

export default CrmProposalsPage;
