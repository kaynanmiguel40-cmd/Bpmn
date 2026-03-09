/**
 * CrmProposalsPage - Lista de propostas com CRUD completo.
 */

import { useState } from 'react';
import { FileText, Plus, Pencil, Trash2 } from 'lucide-react';
import { CrmPageHeader, CrmDataTable, CrmBadge, CrmConfirmDialog } from '../components/ui';
import { useCrmProposals, useDeleteCrmProposal } from '../hooks/useCrmQueries';
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

export function CrmProposalsPage() {
  const [page, setPage] = useState(1);
  const { data, isLoading } = useCrmProposals({ page, perPage: 25 });

  const deleteMutation = useDeleteCrmProposal();

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

  const columns = [
    {
      key: 'proposalNumber',
      label: '#',
      render: (val) => <span className="font-mono text-xs text-slate-500 dark:text-slate-400">{val || '—'}</span>,
    },
    {
      key: 'deal',
      label: 'Negocio',
      render: (val, row) => (
        <button type="button" onClick={() => handleEdit(row)} className="text-left hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
          <span className="font-medium text-slate-800 dark:text-slate-200">{row.deal?.title || '—'}</span>
        </button>
      ),
    },
    {
      key: 'totalValue',
      label: 'Valor',
      sortable: true,
      render: (val) => <span className="font-medium">{formatCurrency(val)}</span>,
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
      render: (val) => val ? new Date(val).toLocaleDateString('pt-BR') : '—',
    },
    {
      key: 'actions',
      label: '',
      render: (_, row) => (
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
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
        title="Propostas"
        subtitle="Propostas comerciais do CRM"
        actions={
          <button onClick={handleNew}
            className="flex items-center gap-2 px-4 py-2 bg-fyness-primary hover:bg-fyness-secondary text-white text-sm font-medium rounded-lg transition-colors">
            <Plus size={16} /> Nova Proposta
          </button>
        }
      />

      <CrmDataTable
        columns={columns}
        data={data?.data || []}
        loading={isLoading}
        emptyMessage="Nenhuma proposta encontrada"
        emptyIcon={FileText}
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
