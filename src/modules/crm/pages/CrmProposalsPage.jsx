/**
 * CrmProposalsPage - Lista de propostas comerciais.
 */

import { useState } from 'react';
import { FileText, Plus } from 'lucide-react';
import { CrmPageHeader, CrmDataTable, CrmBadge } from '../components/ui';
import { useCrmProposals } from '../hooks/useCrmQueries';

const statusMap = {
  draft: { label: 'Rascunho', variant: 'neutral' },
  sent: { label: 'Enviada', variant: 'info' },
  accepted: { label: 'Aceita', variant: 'success' },
  rejected: { label: 'Rejeitada', variant: 'danger' },
  expired: { label: 'Expirada', variant: 'warning' },
};

const formatCurrency = (val) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val || 0);

const columns = [
  {
    key: 'proposalNumber',
    label: '#',
    render: (val) => <span className="font-mono text-xs text-slate-500 dark:text-slate-400">{val || '—'}</span>,
  },
  {
    key: 'deal',
    label: 'Negocio',
    render: (val, row) => row.deal?.title || '—',
  },
  {
    key: 'totalValue',
    label: 'Valor',
    sortable: true,
    render: (val) => <span className="font-medium">{formatCurrency(val)}</span>,
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
];

export function CrmProposalsPage() {
  const [page, setPage] = useState(1);
  const { data, isLoading } = useCrmProposals({ page, perPage: 25 });

  return (
    <div>
      <CrmPageHeader
        title="Propostas"
        subtitle="Propostas comerciais do CRM"
        actions={
          <button className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg transition-colors">
            <Plus size={16} />
            Nova Proposta
          </button>
        }
      />

      <CrmDataTable
        columns={columns}
        data={data?.data || []}
        loading={isLoading}
        emptyMessage="Nenhuma proposta encontrada"
        emptyIcon={FileText}
        pagination={{
          page,
          perPage: 25,
          total: data?.count || 0,
          onPageChange: setPage,
        }}
      />
    </div>
  );
}

export default CrmProposalsPage;
