/**
 * CrmGanhosPage - Negocios VENDIDOS (status = won), de TODAS as pipelines.
 *
 * "Vendido num lugar so, independente da pipeline": junta todo deal ganho num
 * unico painel, com totais (contratos + MRR) e a origem do lead — pra ver qual
 * canal mais fecha. Nao depende de qual pipeline o deal estava.
 */

import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Trophy, DollarSign, TrendingUp } from 'lucide-react';
import { CrmPageHeader, CrmDataTable, CrmKpiCard, CrmBadge } from '../components/ui';
import { useCrmDeals } from '../hooks/useCrmQueries';

const formatCurrency = (val) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val || 0);

const formatDate = (dateStr) => {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('pt-BR');
};

export function CrmGanhosPage() {
  const navigate = useNavigate();

  // Todos os ganhos, de qualquer pipeline. perPage alto: estagio inicial, poucos
  // deals — totais batem com a lista. (Se um dia escalar, paginar + somar no back.)
  const { data, isLoading } = useCrmDeals({
    status: 'won',
    perPage: 200,
    sortBy: 'closed_at',
    sortOrder: 'desc',
  });

  const deals = data?.data || [];

  const totals = useMemo(() => deals.reduce(
    (acc, d) => ({
      value: acc.value + (d.value || 0),
      mrr: acc.mrr + (d.mrr || 0),
    }),
    { value: 0, mrr: 0 },
  ), [deals]);

  const columns = [
    {
      key: 'title',
      label: 'Negocio',
      render: (val, row) => (
        <div>
          <div className="font-medium text-slate-800 dark:text-slate-200">{val}</div>
          <div className="text-xs text-slate-400">{row.company?.name || row.contactName || row.contact?.name || ''}</div>
        </div>
      ),
    },
    {
      key: 'source',
      label: 'Origem',
      render: (val) => val
        ? <CrmBadge variant="blue" size="sm">{val}</CrmBadge>
        : <span className="text-slate-300 dark:text-slate-600">—</span>,
    },
    {
      key: 'value',
      label: 'Contrato',
      render: (val) => <span className="font-medium text-slate-700 dark:text-slate-200">{formatCurrency(val)}</span>,
    },
    {
      key: 'mrr',
      label: 'MRR',
      render: (val) => val
        ? <span className="font-medium text-violet-600 dark:text-violet-400">{formatCurrency(val)}</span>
        : <span className="text-slate-300 dark:text-slate-600">—</span>,
    },
    {
      key: 'owner',
      label: 'Vendedor',
      render: (_, row) => row.owner
        ? <span className="text-xs text-slate-600 dark:text-slate-300 truncate max-w-[120px] block">{row.owner.name}</span>
        : <span className="text-slate-300 dark:text-slate-600">—</span>,
    },
    {
      key: 'closedAt',
      label: 'Fechado em',
      render: (val) => <span className="text-xs text-slate-500 dark:text-slate-400">{formatDate(val)}</span>,
    },
  ];

  return (
    <div>
      <CrmPageHeader
        title="Ganhos"
        subtitle="Negocios vendidos — de todas as pipelines"
      />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-5">
        <CrmKpiCard
          title="Negocios ganhos"
          rawValue={deals.length}
          icon={Trophy}
          color="emerald"
          loading={isLoading}
        />
        <CrmKpiCard
          title="Valor em contratos"
          value={formatCurrency(totals.value)}
          icon={DollarSign}
          color="blue"
          loading={isLoading}
        />
        <CrmKpiCard
          title="MRR somado"
          value={formatCurrency(totals.mrr)}
          subtitle="receita recorrente mensal"
          icon={TrendingUp}
          color="violet"
          loading={isLoading}
        />
      </div>

      <CrmDataTable
        columns={columns}
        data={deals}
        loading={isLoading}
        emptyMessage="Nenhum negocio ganho ainda"
        emptyIcon={Trophy}
        onRowClick={(row) => navigate(`/crm/deals/${row.id}`)}
      />
    </div>
  );
}

export default CrmGanhosPage;
