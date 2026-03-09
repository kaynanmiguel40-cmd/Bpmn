/**
 * CrmDealsPage - Lista de negocios (deals) com CRUD completo.
 */

import { useState } from 'react';
import { Target, Plus, Pencil, Trash2, Trophy, XCircle } from 'lucide-react';
import { CrmPageHeader, CrmDataTable, CrmBadge, CrmConfirmDialog } from '../components/ui';
import { useCrmDeals, useDeleteCrmDeal, useMarkDealWon, useMarkDealLost } from '../hooks/useCrmQueries';
import { DealFormModal } from '../components/DealFormModal';

const statusMap = {
  open: { label: 'Aberto', variant: 'info' },
  won: { label: 'Ganho', variant: 'success' },
  lost: { label: 'Perdido', variant: 'danger' },
};

const formatCurrency = (val) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val || 0);

export function CrmDealsPage() {
  const [page, setPage] = useState(1);
  const { data, isLoading } = useCrmDeals({ page, perPage: 25 });

  const deleteMutation = useDeleteCrmDeal();
  const wonMutation = useMarkDealWon();
  const lostMutation = useMarkDealLost();

  const [formOpen, setFormOpen] = useState(false);
  const [editDeal, setEditDeal] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const handleNew = () => { setEditDeal(null); setFormOpen(true); };
  const handleEdit = (deal) => { setEditDeal(deal); setFormOpen(true); };
  const handleDelete = async () => {
    if (!deleteTarget) return;
    await deleteMutation.mutateAsync(deleteTarget.id);
    setDeleteTarget(null);
  };

  const columns = [
    {
      key: 'title',
      label: 'Negocio',
      sortable: true,
      render: (val, row) => (
        <button type="button" onClick={() => handleEdit(row)} className="text-left hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
          <div className="font-medium text-slate-800 dark:text-slate-200">{val}</div>
          <div className="text-xs text-slate-400">{row.company?.name || row.contact?.name || ''}</div>
        </button>
      ),
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
      render: (val, row) => (
        <span className="text-xs text-slate-500 dark:text-slate-400">{row.stageName || '—'}</span>
      ),
    },
    {
      key: 'probability',
      label: 'Prob.',
      render: (val) => <span className="text-xs">{val || 50}%</span>,
    },
    {
      key: 'actions',
      label: '',
      render: (_, row) => (
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          {row.status === 'open' && (
            <>
              <button onClick={(e) => { e.stopPropagation(); wonMutation.mutate(row.id); }}
                title="Marcar como ganho"
                className="p-1 rounded text-slate-400 hover:text-emerald-600 transition-colors">
                <Trophy size={14} />
              </button>
              <button onClick={(e) => { e.stopPropagation(); lostMutation.mutate({ dealId: row.id, reason: '' }); }}
                title="Marcar como perdido"
                className="p-1 rounded text-slate-400 hover:text-rose-600 transition-colors">
                <XCircle size={14} />
              </button>
            </>
          )}
          <button onClick={(e) => { e.stopPropagation(); handleEdit(row); }}
            className="p-1 rounded text-slate-400 hover:text-blue-600 transition-colors">
            <Pencil size={14} />
          </button>
          <button onClick={(e) => { e.stopPropagation(); setDeleteTarget(row); }}
            className="p-1 rounded text-slate-400 hover:text-rose-600 transition-colors">
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
          <button onClick={handleNew}
            className="flex items-center gap-2 px-4 py-2 bg-fyness-primary hover:bg-fyness-secondary text-white text-sm font-medium rounded-lg transition-colors">
            <Plus size={16} /> Novo Negocio
          </button>
        }
      />

      <CrmDataTable
        columns={columns}
        data={data?.data || []}
        loading={isLoading}
        emptyMessage="Nenhum negocio encontrado"
        emptyIcon={Target}
        pagination={{ page, perPage: 25, total: data?.count || 0, onPageChange: setPage }}
      />

      <DealFormModal
        open={formOpen}
        onClose={() => { setFormOpen(false); setEditDeal(null); }}
        deal={editDeal}
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
