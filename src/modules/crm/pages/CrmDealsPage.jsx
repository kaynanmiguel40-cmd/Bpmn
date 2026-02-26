/**
 * CrmDealsPage - Lista de negocios (deals) com filtros e paginacao.
 */

import { useState } from 'react';
import { Target, Plus } from 'lucide-react';
import { CrmPageHeader, CrmDataTable, CrmBadge, CrmAvatar } from '../components/ui';
import { useCrmDeals } from '../hooks/useCrmQueries';

const statusMap = {
  open: { label: 'Aberto', variant: 'info' },
  won: { label: 'Ganho', variant: 'success' },
  lost: { label: 'Perdido', variant: 'danger' },
};

const formatCurrency = (val) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val || 0);

const columns = [
  {
    key: 'title',
    label: 'Negocio',
    sortable: true,
    render: (val, row) => (
      <div className="flex items-center gap-2">
        <CrmAvatar name={row.title} size="sm" />
        <div>
          <div className="font-medium text-slate-800 dark:text-slate-200">{val}</div>
          <div className="text-xs text-slate-400">{row.company?.name || row.contact?.name || ''}</div>
        </div>
      </div>
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
];

export function CrmDealsPage() {
  const [page, setPage] = useState(1);
  const { data, isLoading } = useCrmDeals({ page, perPage: 25 });

  return (
    <div>
      <CrmPageHeader
        title="Negocios"
        subtitle="Todos os deals do CRM"
        actions={
          <button className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg transition-colors">
            <Plus size={16} />
            Novo Negocio
          </button>
        }
      />

      <CrmDataTable
        columns={columns}
        data={data?.data || []}
        loading={isLoading}
        emptyMessage="Nenhum negocio encontrado"
        emptyIcon={Target}
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

export default CrmDealsPage;
