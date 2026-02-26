/**
 * CrmContactsPage - Lista completa de contatos CRM.
 * Busca debounce 300ms, filtros (status, empresa, tag), sort, paginacao,
 * CSV import/export, acoes por linha (editar, excluir), modal de contato.
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Users, Plus, Search, Upload, Download, Pencil, Trash2,
  Filter, X,
} from 'lucide-react';
import { CrmPageHeader, CrmDataTable, CrmAvatar, CrmBadge, CrmConfirmDialog } from '../components/ui';
import {
  useCrmContacts, useDeleteCrmContact, useImportCrmContacts,
  useCrmCompanies,
} from '../hooks/useCrmQueries';
import { exportContactsCSV } from '../services/crmContactsService';
import { ContactFormModal } from '../components/ContactFormModal';

const STATUS_OPTIONS = [
  { value: '', label: 'Todos' },
  { value: 'lead', label: 'Lead' },
  { value: 'active', label: 'Ativo' },
  { value: 'inactive', label: 'Inativo' },
  { value: 'customer', label: 'Cliente' },
];

const STATUS_MAP = {
  lead: { label: 'Lead', variant: 'info' },
  active: { label: 'Ativo', variant: 'success' },
  inactive: { label: 'Inativo', variant: 'neutral' },
  customer: { label: 'Cliente', variant: 'indigo' },
};

function useDebounce(value, delay = 300) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
}

export function CrmContactsPage() {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  // Filters
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [companyFilter, setCompanyFilter] = useState('');
  const [tagFilter, setTagFilter] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  // Pagination & sort
  const [page, setPage] = useState(1);
  const [sortConfig, setSortConfig] = useState({ key: 'name', direction: 'asc' });

  // Modals
  const [formOpen, setFormOpen] = useState(false);
  const [editContact, setEditContact] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const debouncedSearch = useDebounce(search);

  const filters = {
    page,
    perPage: 25,
    search: debouncedSearch,
    status: statusFilter || undefined,
    companyId: companyFilter || undefined,
    tag: tagFilter || undefined,
    sortBy: sortConfig.key,
    sortDir: sortConfig.direction,
  };

  const { data, isLoading } = useCrmContacts(filters);
  const { data: companiesData } = useCrmCompanies({ perPage: 200 });
  const deleteMutation = useDeleteCrmContact();
  const importMutation = useImportCrmContacts();

  const companies = companiesData?.data || [];
  const contacts = data?.data || [];
  const total = data?.count || 0;

  // Reset page on filter change
  useEffect(() => { setPage(1); }, [debouncedSearch, statusFilter, companyFilter, tagFilter]);

  const handleSort = useCallback((key) => {
    setSortConfig(prev =>
      prev.key === key
        ? { key, direction: prev.direction === 'asc' ? 'desc' : 'asc' }
        : { key, direction: 'asc' }
    );
  }, []);

  const handleEdit = (contact) => {
    setEditContact(contact);
    setFormOpen(true);
  };

  const handleNew = () => {
    setEditContact(null);
    setFormOpen(true);
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    await deleteMutation.mutateAsync(deleteTarget.id);
    setDeleteTarget(null);
  };

  const handleExport = () => {
    const csv = exportContactsCSV(contacts);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `contatos_crm_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const text = await file.text();
      await importMutation.mutateAsync(text);
    } catch {
      // toast is handled in the hook
    }
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const hasActiveFilters = statusFilter || companyFilter || tagFilter;

  const columns = [
    {
      key: 'name',
      label: 'Contato',
      sortable: true,
      render: (val, row) => (
        <div className="flex items-center gap-2.5">
          <CrmAvatar name={val} size="sm" color={row.avatarColor} />
          <div className="min-w-0">
            <div className="font-medium text-slate-800 dark:text-slate-200 truncate">{val}</div>
            <div className="text-xs text-slate-400 truncate">{row.email || ''}</div>
          </div>
        </div>
      ),
    },
    {
      key: 'phone',
      label: 'Telefone',
      render: (val) => val ? (
        <a href={`tel:${val}`} className="text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400">{val}</a>
      ) : <span className="text-slate-300 dark:text-slate-600">—</span>,
    },
    {
      key: 'company',
      label: 'Empresa',
      render: (val, row) => row.company?.name ? (
        <button
          onClick={(e) => { e.stopPropagation(); navigate(`/crm/companies/${row.company.id}`); }}
          className="text-indigo-600 dark:text-indigo-400 hover:underline text-sm"
        >
          {row.company.name}
        </button>
      ) : <span className="text-slate-300 dark:text-slate-600">—</span>,
    },
    {
      key: 'status',
      label: 'Status',
      render: (val) => {
        const s = STATUS_MAP[val] || STATUS_MAP.lead;
        return <CrmBadge variant={s.variant} dot size="sm">{s.label}</CrmBadge>;
      },
    },
    {
      key: 'tags',
      label: 'Tags',
      render: (val) => {
        const tags = val || [];
        if (tags.length === 0) return <span className="text-slate-300 dark:text-slate-600">—</span>;
        const visible = tags.slice(0, 2);
        const remaining = tags.length - 2;
        return (
          <div className="flex flex-wrap gap-1">
            {visible.map(t => <CrmBadge key={t} variant="violet" size="sm">{t}</CrmBadge>)}
            {remaining > 0 && <CrmBadge variant="neutral" size="sm">+{remaining}</CrmBadge>}
          </div>
        );
      },
    },
    {
      key: 'createdAt',
      label: 'Criado em',
      sortable: true,
      render: (val) => val ? new Date(val).toLocaleDateString('pt-BR') : '—',
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
        title="Contatos"
        subtitle={`${total} contato${total !== 1 ? 's' : ''}`}
        actions={
          <div className="flex items-center gap-2 flex-wrap">
            {/* Search */}
            <div className="relative hidden sm:block">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Buscar contato..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 pr-4 py-2 w-56 text-sm rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent focus:outline-none"
              />
            </div>

            {/* Filter toggle */}
            <button
              onClick={() => setShowFilters(v => !v)}
              className={`flex items-center gap-1.5 px-3 py-2 text-sm rounded-lg border transition-colors ${
                hasActiveFilters
                  ? 'border-indigo-300 bg-indigo-50 text-indigo-700 dark:border-indigo-700 dark:bg-indigo-900/20 dark:text-indigo-400'
                  : 'border-slate-300 dark:border-slate-600 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
              }`}
            >
              <Filter size={14} />
              Filtros
              {hasActiveFilters && (
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-600 dark:bg-indigo-400" />
              )}
            </button>

            {/* Import */}
            <input ref={fileInputRef} type="file" accept=".csv" onChange={handleImport} className="hidden" />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-1.5 px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-600 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
              title="Importar CSV"
            >
              <Upload size={14} />
              <span className="hidden lg:inline">Importar</span>
            </button>

            {/* Export */}
            <button
              onClick={handleExport}
              disabled={contacts.length === 0}
              className="flex items-center gap-1.5 px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-600 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors disabled:opacity-40"
              title="Exportar CSV"
            >
              <Download size={14} />
              <span className="hidden lg:inline">Exportar</span>
            </button>

            {/* New contact */}
            <button
              onClick={handleNew}
              className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg transition-colors"
            >
              <Plus size={16} />
              Novo Contato
            </button>
          </div>
        }
      />

      {/* Filter bar */}
      {showFilters && (
        <div className="flex items-center gap-3 flex-wrap p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700/50">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-1.5 text-sm rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
          >
            {STATUS_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>

          <select
            value={companyFilter}
            onChange={(e) => setCompanyFilter(e.target.value)}
            className="px-3 py-1.5 text-sm rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
          >
            <option value="">Todas empresas</option>
            {companies.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>

          <input
            type="text"
            placeholder="Filtrar por tag..."
            value={tagFilter}
            onChange={(e) => setTagFilter(e.target.value)}
            className="px-3 py-1.5 text-sm rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
          />

          {hasActiveFilters && (
            <button
              onClick={() => { setStatusFilter(''); setCompanyFilter(''); setTagFilter(''); }}
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
        data={contacts}
        loading={isLoading}
        emptyMessage="Nenhum contato encontrado"
        emptyIcon={Users}
        onRowClick={(row) => navigate(`/crm/contacts/${row.id}`)}
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
      <ContactFormModal
        open={formOpen}
        onClose={() => { setFormOpen(false); setEditContact(null); }}
        contact={editContact}
      />

      <CrmConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Excluir contato"
        message={`Tem certeza que deseja excluir "${deleteTarget?.name}"? Esta acao nao pode ser desfeita.`}
        variant="danger"
        loading={deleteMutation.isPending}
      />
    </div>
  );
}

export default CrmContactsPage;
