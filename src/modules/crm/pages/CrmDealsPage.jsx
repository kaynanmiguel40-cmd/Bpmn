/**
 * CrmDealsPage - Lista de negocios (deals) com filtros, busca e CRUD completo.
 */

import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Target, Plus, Pencil, Trash2, Trophy, XCircle, Search, X } from 'lucide-react';
import { CrmPageHeader, CrmDataTable, CrmBadge, CrmConfirmDialog } from '../components/ui';
import { useCrmDeals, useDeleteCrmDeal, useMarkDealWon, useMarkDealLost } from '../hooks/useCrmQueries';
import { DealFormModal } from '../components/DealFormModal';
import { LostReasonModal } from '../components/LostReasonModal';

const statusMap = {
  open: { label: 'Aberto', variant: 'info' },
  won: { label: 'Ganho', variant: 'success' },
  lost: { label: 'Perdido', variant: 'danger' },
};

const formatCurrency = (val) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val || 0);

export function CrmDealsPage() {
  const navigate = useNavigate();

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
    sortBy: sortConfig.key === 'title' ? 'title' : sortConfig.key === 'value' ? 'value' : sortConfig.key,
    sortOrder: sortConfig.direction,
  };

  const { data, isLoading } = useCrmDeals(filters);

  const deleteMutation = useDeleteCrmDeal();
  const wonMutation = useMarkDealWon();
  const lostMutation = useMarkDealLost();

  const [formOpen, setFormOpen] = useState(false);
  const [editDeal, setEditDeal] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [lostDealId, setLostDealId] = useState(null);

  const handleNew = () => { setEditDeal(null); setFormOpen(true); };
  const handleEdit = (deal) => { setEditDeal(deal); setFormOpen(true); };
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
      key: 'title',
      label: 'Negocio',
      sortable: true,
      render: (val, row) => (
        <div>
          <div className="font-medium text-slate-800 dark:text-slate-200">{val}</div>
          <div className="text-xs text-slate-400">{row.company?.name || row.contact?.name || ''}</div>
        </div>
      ),
    },
    {
      key: 'segment',
      label: 'Segmento',
      render: (val) => val
        ? <CrmBadge variant="violet" size="sm">{val}</CrmBadge>
        : <span className="text-slate-300 dark:text-slate-600">—</span>,
    },
    {
      key: 'value',
      label: 'Valor',
      sortable: true,
      render: (val) => <span className="font-medium">{formatCurrency(val)}</span>,
    },
    {
      key: 'status',
      label: 'Status',
      render: (val) => {
        const s = statusMap[val] || statusMap.open;
        return <CrmBadge variant={s.variant} dot>{s.label}</CrmBadge>;
      },
    },
    {
      key: 'stage',
      label: 'Etapa',
      render: (_, row) => row.stage ? (
        <div className="flex items-center gap-1.5">
          <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: row.stage.color }} />
          <span className="text-xs text-slate-600 dark:text-slate-300">{row.stage.name}</span>
        </div>
      ) : <span className="text-slate-300 dark:text-slate-600">—</span>,
    },
    {
      key: 'probability',
      label: 'Prob.',
      render: (val) => (
        <div className="flex items-center gap-2">
          <div className="w-12 h-1.5 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full ${(val || 50) >= 70 ? 'bg-emerald-500' : (val || 50) >= 30 ? 'bg-amber-500' : 'bg-rose-500'}`}
              style={{ width: `${val || 50}%` }}
            />
          </div>
          <span className="text-xs text-slate-500">{val || 50}%</span>
        </div>
      ),
    },
    {
      key: 'owner',
      label: 'Vendedor',
      render: (_, row) => row.owner ? (
        <span className="text-xs text-slate-600 dark:text-slate-300 truncate max-w-[100px] block">{row.owner.name}</span>
      ) : <span className="text-slate-300 dark:text-slate-600">—</span>,
    },
    {
      key: 'actions',
      label: '',
      render: (_, row) => (
        <div className="flex items-center gap-0.5 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
          {row.status === 'open' && (
            <>
              <button onClick={(e) => { e.stopPropagation(); wonMutation.mutate(row.id); }}
                title="Marcar como ganho"
                className="p-1.5 rounded-md text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition-colors">
                <Trophy size={14} />
              </button>
              <button onClick={(e) => { e.stopPropagation(); setLostDealId(row.id); }}
                title="Marcar como perdido"
                className="p-1.5 rounded-md text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/20 transition-colors">
                <XCircle size={14} />
              </button>
            </>
          )}
          <button onClick={(e) => { e.stopPropagation(); handleEdit(row); }}
            title="Editar"
            className="p-1.5 rounded-md text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors">
            <Pencil size={14} />
          </button>
          <button onClick={(e) => { e.stopPropagation(); setDeleteTarget(row); }}
            title="Excluir"
            className="p-1.5 rounded-md text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/20 transition-colors">
            <Trash2 size={14} />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div>
      <CrmPageHeader
        title="Negocios"
        subtitle="Todos os deals do CRM"
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
              <option value="open">Aberto</option>
              <option value="won">Ganho</option>
              <option value="lost">Perdido</option>
            </select>

            <button onClick={handleNew}
              className="flex items-center gap-2 px-4 py-2 bg-fyness-primary hover:bg-fyness-secondary text-white text-sm font-medium rounded-lg transition-colors">
              <Plus size={16} /> Novo Negocio
            </button>
          </div>
        }
      />

      <CrmDataTable
        columns={columns}
        data={data?.data || []}
        loading={isLoading}
        emptyMessage="Nenhum negocio encontrado"
        emptyIcon={Target}
        onRowClick={(row) => navigate(`/crm/deals/${row.id}`)}
        sortConfig={sortConfig}
        onSort={handleSort}
        pagination={{ page, perPage: 25, total: data?.count || 0, onPageChange: setPage }}
      />

      <DealFormModal
        open={formOpen}
        onClose={() => { setFormOpen(false); setEditDeal(null); }}
        deal={editDeal}
      />

      <LostReasonModal
        open={!!lostDealId}
        onClose={() => setLostDealId(null)}
        isPending={lostMutation.isPending}
        onConfirm={(reason) => {
          lostMutation.mutate({ dealId: lostDealId, reason }, {
            onSuccess: () => setLostDealId(null),
          });
        }}
      />

      <CrmConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Excluir negocio"
        message={`Tem certeza que deseja excluir "${deleteTarget?.title}"? Esta acao nao pode ser desfeita.`}
        variant="danger"
        loading={deleteMutation.isPending}
      />
    </div>
  );
}

export default CrmDealsPage;
