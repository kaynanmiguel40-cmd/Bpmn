/**
 * CrmPartnersPage - Cadastro de parceiros indicadores (pessoas físicas que
 * indicam leads, ex.: Edson, João, Robert — diferente da pipeline
 * "Parceiros", que é prospecção de EMPRESAS pra virarem parceiros
 * institucionais).
 *
 * Lista simples (sem paginação — poucos registros) com contagem de leads
 * indicados por cada parceiro. Clicar num parceiro abre os leads dele.
 */

import { useState } from 'react';
import { Handshake, Plus, Pencil, Trash2, Phone, Users, X } from 'lucide-react';
import { CrmPageHeader, CrmDataTable, CrmBadge, CrmConfirmDialog } from '../components/ui';
import { CrmModal } from '../components/ui/CrmModal';
import { useCrmPartners, useDeleteCrmPartner, useLeadsByPartner } from '../hooks/useCrmQueries';
import { PartnerFormModal } from '../components/PartnerFormModal';

const DEAL_STATUS = {
  open: { label: 'Aberto', variant: 'info' },
  won: { label: 'Ganho', variant: 'success' },
  lost: { label: 'Perdido', variant: 'danger' },
};

const fmtMoney = (v) => (v || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

function PartnerLeadsModal({ partner, onClose }) {
  const { data: leads = [], isLoading } = useLeadsByPartner(partner?.name);
  return (
    <CrmModal open={!!partner} onClose={onClose} title={`Leads indicados por ${partner?.name || ''}`} size="lg">
      {isLoading ? (
        <div className="flex items-center justify-center py-10">
          <div className="w-6 h-6 border-2 border-fyness-primary border-t-transparent rounded-full animate-spin" />
        </div>
      ) : leads.length === 0 ? (
        <p className="text-sm text-slate-500 dark:text-slate-400 py-6 text-center">Nenhum lead encontrado pra esse parceiro.</p>
      ) : (
        <div className="space-y-2 max-h-[60vh] overflow-y-auto">
          {leads.map((l) => {
            const status = DEAL_STATUS[l.status];
            return (
              <div key={l.id} className="flex items-center justify-between gap-3 p-3 rounded-xl border border-slate-200/70 dark:border-white/10">
                <div className="min-w-0">
                  <div className="text-sm font-medium text-slate-800 dark:text-slate-200 truncate">{l.title}</div>
                  <div className="flex items-center gap-2 mt-1 flex-wrap">
                    {l.stageName && (
                      <span className="text-[12px] px-1.5 py-0.5 rounded-full" style={{ backgroundColor: `${l.stageColor || '#6366f1'}22`, color: l.stageColor || '#6366f1' }}>
                        {l.stageName}
                      </span>
                    )}
                    {status && <CrmBadge variant={status.variant} size="sm">{status.label}</CrmBadge>}
                  </div>
                </div>
                {l.value > 0 && <span className="text-sm font-semibold text-slate-600 dark:text-slate-300 shrink-0">{fmtMoney(l.value)}</span>}
              </div>
            );
          })}
        </div>
      )}
    </CrmModal>
  );
}

export function CrmPartnersPage({ embedded = false } = {}) {
  const { data: partners = [], isLoading } = useCrmPartners();
  const deleteMutation = useDeleteCrmPartner();

  const [formOpen, setFormOpen] = useState(false);
  const [editPartner, setEditPartner] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [viewLeadsOf, setViewLeadsOf] = useState(null);

  const handleNew = () => { setEditPartner(null); setFormOpen(true); };
  const handleEdit = (p) => { setEditPartner(p); setFormOpen(true); };
  const handleDelete = async () => {
    if (!deleteTarget) return;
    await deleteMutation.mutateAsync(deleteTarget.id);
    setDeleteTarget(null);
  };

  const columns = [
    {
      key: 'name',
      label: 'Parceiro',
      render: (val, row) => (
        <div className="flex items-center gap-2 min-w-0">
          <span className="font-medium text-slate-800 dark:text-slate-200 truncate">{val}</span>
          {!row.active && <CrmBadge variant="neutral" size="sm">Inativo</CrmBadge>}
        </div>
      ),
    },
    {
      key: 'phone',
      label: 'Telefone',
      render: (val) => val ? (
        <a href={`tel:${val}`} onClick={(e) => e.stopPropagation()} className="text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 inline-flex items-center gap-1">
          <Phone size={12} /> {val}
        </a>
      ) : <span className="text-slate-300 dark:text-slate-600">—</span>,
    },
    {
      key: 'leadCount',
      label: 'Leads indicados',
      render: (val) => (
        <span className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-700 dark:text-slate-200">
          <Users size={13} className="text-fyness-primary" /> {val}
        </span>
      ),
    },
    {
      key: '_actions',
      label: '',
      className: 'w-24',
      render: (_, row) => (
        <div className="flex items-center gap-1">
          <button
            onClick={(e) => { e.stopPropagation(); handleEdit(row); }}
            className="p-1.5 rounded-md text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
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

  const actions = (
    <button
      onClick={handleNew}
      className="flex items-center gap-2 px-4 py-2 bg-fyness-primary hover:bg-fyness-secondary text-white text-sm font-medium rounded-lg transition-colors"
    >
      <Plus size={16} /> Novo Parceiro
    </button>
  );

  return (
    <div className="space-y-4">
      {!embedded ? (
        <CrmPageHeader
          title="Parceiros"
          subtitle={`${partners.length} parceiro${partners.length !== 1 ? 's' : ''} indicador${partners.length !== 1 ? 'es' : ''}`}
          actions={actions}
        />
      ) : (
        <div className="flex items-center justify-between flex-wrap gap-3">
          <p className="text-xs text-slate-500 dark:text-slate-400">{partners.length} parceiro{partners.length !== 1 ? 's' : ''}</p>
          {actions}
        </div>
      )}

      <CrmDataTable
        columns={columns}
        data={partners}
        loading={isLoading}
        emptyMessage="Nenhum parceiro cadastrado"
        emptyIcon={Handshake}
        onRowClick={(row) => setViewLeadsOf(row)}
      />

      <PartnerFormModal
        open={formOpen}
        onClose={() => { setFormOpen(false); setEditPartner(null); }}
        partner={editPartner}
      />

      <PartnerLeadsModal partner={viewLeadsOf} onClose={() => setViewLeadsOf(null)} />

      <CrmConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Excluir parceiro"
        message={`Tem certeza que deseja excluir "${deleteTarget?.name}"? Os leads já indicados por ele não são afetados.`}
        variant="danger"
        loading={deleteMutation.isPending}
      />
    </div>
  );
}

export default CrmPartnersPage;
