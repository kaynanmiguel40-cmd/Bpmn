/**
 * CrmCompaniesPage - Lista completa de empresas CRM.
 * Busca debounce 300ms, filtro por segmento, sort, paginacao,
 * acoes por linha (editar, excluir), modal de empresa.
 */

import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Building2, Plus, Search, Pencil, Trash2, Filter, X,
} from 'lucide-react';
import { CrmPageHeader, CrmDataTable, CrmAvatar, CrmBadge, CrmConfirmDialog } from '../components/ui';
import { useCrmCompanies, useDeleteCrmCompany } from '../hooks/useCrmQueries';
import { CompanyFormModal } from '../components/CompanyFormModal';

const SEGMENT_OPTIONS = [
  '', 'Tecnologia', 'Educacao', 'Saude', 'Varejo', 'Industria', 'Servicos',
  'Financeiro', 'Construcao', 'Alimenticio', 'Logistica', 'Outro',
];

const SIZE_MAP = { micro: 'Micro', small: 'Pequena', medium: 'Media', large: 'Grande' };

function useDebounce(value, delay = 300) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
}

function formatCnpj(val) {
  if (!val) return '';
  const clean = val.replace(/\D/g, '');
  if (clean.length !== 14) return val;
  return clean.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/, '$1.$2.$3/$4-$5');
}

export function CrmCompaniesPage() {
  const navigate = useNavigate();

  // Filters
  const [search, setSearch] = useState('');
  const [segmentFilter, setSegmentFilter] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  // Pagination & sort
  const [page, setPage] = useState(1);
  const [sortConfig, setSortConfig] = useState({ key: 'name', direction: 'asc' });

  // Modals
  const [formOpen, setFormOpen] = useState(false);
  const [editCompany, setEditCompany] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const debouncedSearch = useDebounce(search);

  const filters = {
    page,
    perPage: 25,
    search: debouncedSearch,
    segment: segmentFilter || undefined,
    sortBy: sortConfig.key,
    sortDir: sortConfig.direction,
  };

  const { data, isLoading } = useCrmCompanies(filters);
  const deleteMutation = useDeleteCrmCompany();

  const companies = data?.data || [];
  const total = data?.count || 0;

  useEffect(() => { setPage(1); }, [debouncedSearch, segmentFilter]);

  const handleSort = useCallback((key) => {
    setSortConfig(prev =>
      prev.key === key
        ? { key, direction: prev.direction === 'asc' ? 'desc' : 'asc' }
        : { key, direction: 'asc' }
    );
  }, []);

  const handleEdit = (company) => {
    setEditCompany(company);
    setFormOpen(true);
  };

  const handleNew = () => {
    setEditCompany(null);
    setFormOpen(true);
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    await deleteMutation.mutateAsync(deleteTarget.id);
    setDeleteTarget(null);
  };

  const columns = [
    {
      key: 'name',
      label: 'Empresa',
      sortable: true,
      render: (val, row) => (
        <div className="flex items-center gap-2.5">
          <CrmAvatar name={val} size="sm" />
          <div className="min-w-0">
            <div className="font-medium text-slate-800 dark:text-slate-200 truncate">{val}</div>
            {row.segment && <div className="text-xs text-slate-400">{row.segment}</div>}
          </div>
        </div>
      ),
    },
    {
      key: 'cnpj',
      label: 'CNPJ',
      render: (val) => val ? (
        <span className="font-mono text-xs text-slate-600 dark:text-slate-400">{formatCnpj(val)}</span>
      ) : <span className="text-slate-300 dark:text-slate-600">—</span>,
    },
    {
      key: 'segment',
      label: 'Segmento',
      render: (val) => val ? (
        <CrmBadge variant="violet" size="sm">{val}</CrmBadge>
      ) : <span className="text-slate-300 dark:text-slate-600">—</span>,
    },
    {
      key: 'size',
      label: 'Porte',
      render: (val) => SIZE_MAP[val] || <span className="text-slate-300 dark:text-slate-600">—</span>,
    },
    {
      key: 'phone',
      label: 'Telefone',
      render: (val) => val ? (
        <a href={`tel:${val}`} className="text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400">{val}</a>
      ) : <span className="text-slate-300 dark:text-slate-600">—</span>,
    },
    {
      key: 'city',
      label: 'Cidade/UF',
      render: (val, row) => {
        const parts = [val, row.state].filter(Boolean);
        return parts.length > 0
          ? <span className="text-sm">{parts.join('/')}</span>
          : <span className="text-slate-300 dark:text-slate-600">—</span>;
      },
    },
    {
      key: '_actions',
      label: '',
      className: 'w-20',
      render: (_, row) => (
        <div className="flex items-center gap-1">
          <button
            onClick={(e) => { e.stopPropagation(); handleEdit(row); }}
            className="p-1.5 rounded-md text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-colors"
            title="Editar"
          >
            <Pencil size={14} />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); setDeleteTarget(row); }}
            className="p-1.5 rounded-md text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/20 transition-colors"
            title="Excluir"
          >
            <Trash2 size={14} />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <CrmPageHeader
        title="Empresas"
        subtitle={`${total} empresa${total !== 1 ? 's' : ''}`}
        actions={
          <div className="flex items-center gap-2 flex-wrap">
            {/* Search */}
            <div className="relative hidden sm:block">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Buscar empresa..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 pr-4 py-2 w-56 text-sm rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent focus:outline-none"
              />
            </div>

            {/* Filter toggle */}
            <button
              onClick={() => setShowFilters(v => !v)}
              className={`flex items-center gap-1.5 px-3 py-2 text-sm rounded-lg border transition-colors ${
                segmentFilter
                  ? 'border-indigo-300 bg-indigo-50 text-indigo-700 dark:border-indigo-700 dark:bg-indigo-900/20 dark:text-indigo-400'
                  : 'border-slate-300 dark:border-slate-600 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
              }`}
            >
              <Filter size={14} />
              Filtros
              {segmentFilter && <span className="w-1.5 h-1.5 rounded-full bg-indigo-600 dark:bg-indigo-400" />}
            </button>

            {/* New company */}
            <button
              onClick={handleNew}
              className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg transition-colors"
            >
              <Plus size={16} />
              Nova Empresa
            </button>
          </div>
        }
      />

      {/* Filter bar */}
      {showFilters && (
        <div className="flex items-center gap-3 flex-wrap p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700/50">
          <select
            value={segmentFilter}
            onChange={(e) => setSegmentFilter(e.target.value)}
            className="px-3 py-1.5 text-sm rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
          >
            <option value="">Todos segmentos</option>
            {SEGMENT_OPTIONS.filter(Boolean).map(s => <option key={s} value={s}>{s}</option>)}
          </select>

          {segmentFilter && (
            <button
              onClick={() => setSegmentFilter('')}
              className="flex items-center gap-1 px-2 py-1.5 text-xs text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
            >
              <X size={12} /> Limpar
            </button>
          )}
        </div>
      )}

      {/* Table */}
      <CrmDataTable
        columns={columns}
        data={companies}
        loading={isLoading}
        emptyMessage="Nenhuma empresa encontrada"
        emptyIcon={Building2}
        onRowClick={(row) => navigate(`/crm/companies/${row.id}`)}
        sortConfig={sortConfig}
        onSort={handleSort}
        pagination={{
          page,
          perPage: 25,
          total,
          onPageChange: setPage,
        }}
      />

      {/* Modals */}
      <CompanyFormModal
        open={formOpen}
        onClose={() => { setFormOpen(false); setEditCompany(null); }}
        company={editCompany}
      />

      <CrmConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Excluir empresa"
        message={`Tem certeza que deseja excluir "${deleteTarget?.name}"? Todos os contatos vinculados perderao a associacao.`}
        variant="danger"
        loading={deleteMutation.isPending}
      />
    </div>
  );
}

export default CrmCompaniesPage;
