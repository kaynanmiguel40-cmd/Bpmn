/**
 * CrmCompanyDetailPage - Detalhe de uma empresa CRM.
 * Header, info, secao Contatos, secao Deals.
 */

import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft, Pencil, Phone, Mail, Globe, MapPin, Building2,
  Users, Target, Plus,
} from 'lucide-react';
import { CrmAvatar, CrmBadge } from '../components/ui';
import { useCrmCompany } from '../hooks/useCrmQueries';
import { CompanyFormModal } from '../components/CompanyFormModal';
import { ContactFormModal } from '../components/ContactFormModal';

const DEAL_STATUS = {
  open: { label: 'Aberto', variant: 'info' },
  won: { label: 'Ganho', variant: 'success' },
  lost: { label: 'Perdido', variant: 'danger' },
};

const CONTACT_STATUS = {
  lead: { label: 'Lead', variant: 'info' },
  active: { label: 'Ativo', variant: 'success' },
  inactive: { label: 'Inativo', variant: 'neutral' },
  customer: { label: 'Cliente', variant: 'blue' },
};

const SIZE_MAP = { micro: 'Microempresa', small: 'Pequena', medium: 'Media', large: 'Grande' };

const formatCurrency = (val) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val || 0);

function formatCnpj(val) {
  if (!val) return '';
  const clean = val.replace(/\D/g, '');
  if (clean.length !== 14) return val;
  return clean.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/, '$1.$2.$3/$4-$5');
}

export function CrmCompanyDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: company, isLoading } = useCrmCompany(id);

  const [editOpen, setEditOpen] = useState(false);
  const [newContactOpen, setNewContactOpen] = useState(false);

  if (isLoading) {
    return (
      <div className="animate-pulse space-y-6">
        <div className="h-8 w-32 bg-slate-200 dark:bg-slate-700 rounded" />
        <div className="flex gap-4">
          <div className="w-16 h-16 bg-slate-200 dark:bg-slate-700 rounded-full" />
          <div className="space-y-2 flex-1">
            <div className="h-6 w-48 bg-slate-200 dark:bg-slate-700 rounded" />
            <div className="h-4 w-32 bg-slate-100 dark:bg-slate-800 rounded" />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          {[1, 2, 3, 4].map(i => <div key={i} className="h-16 bg-slate-200 dark:bg-slate-700 rounded-xl" />)}
        </div>
      </div>
    );
  }

  if (!company) {
    return (
      <div className="text-center py-16">
        <p className="text-slate-500 dark:text-slate-400 mb-4">Empresa nao encontrada</p>
        <button onClick={() => navigate('/crm/companies')} className="text-sm text-blue-600 hover:underline">Voltar para empresas</button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top bar */}
      <div className="flex items-center justify-between">
        <button onClick={() => navigate('/crm/companies')} className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700 dark:hover:text-slate-300">
          <ArrowLeft size={16} /> Empresas
        </button>
        <button onClick={() => setEditOpen(true)} className="flex items-center gap-2 px-4 py-2 bg-fyness-primary hover:bg-fyness-secondary text-white text-sm font-medium rounded-lg">
          <Pencil size={14} /> Editar
        </button>
      </div>

      {/* Header */}
      <div className="flex items-start gap-4">
        <CrmAvatar name={company.name} size="lg" />
        <div className="flex-1 min-w-0">
          <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 truncate">{company.name}</h2>
          <div className="flex items-center gap-3 mt-1 text-sm text-slate-500 dark:text-slate-400 flex-wrap">
            {company.segment && <CrmBadge variant="violet" size="sm">{company.segment}</CrmBadge>}
            {company.size && <span>{SIZE_MAP[company.size] || company.size}</span>}
            {company.cnpj && <span className="font-mono text-xs">{formatCnpj(company.cnpj)}</span>}
          </div>
        </div>
      </div>

      {/* Info cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {company.phone && (
          <a href={`tel:${company.phone}`} className="flex items-center gap-3 px-4 py-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700/50 hover:border-blue-300 transition-colors group">
            <Phone size={16} className="text-slate-400 group-hover:text-blue-500" />
            <div>
              <div className="text-[10px] text-slate-400 uppercase tracking-wider">Telefone</div>
              <div className="text-sm text-slate-700 dark:text-slate-300">{company.phone}</div>
            </div>
          </a>
        )}
        {company.email && (
          <a href={`mailto:${company.email}`} className="flex items-center gap-3 px-4 py-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700/50 hover:border-blue-300 transition-colors group">
            <Mail size={16} className="text-slate-400 group-hover:text-blue-500" />
            <div className="min-w-0">
              <div className="text-[10px] text-slate-400 uppercase tracking-wider">Email</div>
              <div className="text-sm text-slate-700 dark:text-slate-300 truncate">{company.email}</div>
            </div>
          </a>
        )}
        {company.website && (
          <a href={company.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 px-4 py-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700/50 hover:border-blue-300 transition-colors group">
            <Globe size={16} className="text-slate-400 group-hover:text-blue-500" />
            <div className="min-w-0">
              <div className="text-[10px] text-slate-400 uppercase tracking-wider">Website</div>
              <div className="text-sm text-blue-600 dark:text-blue-400 truncate">{company.website}</div>
            </div>
          </a>
        )}
        {(company.city || company.state) && (
          <div className="flex items-center gap-3 px-4 py-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700/50">
            <MapPin size={16} className="text-slate-400" />
            <div className="min-w-0">
              <div className="text-[10px] text-slate-400 uppercase tracking-wider">Localizacao</div>
              <div className="text-sm text-slate-700 dark:text-slate-300 truncate">
                {[company.address, company.city, company.state].filter(Boolean).join(', ')}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Contatos da empresa */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700/50 p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Users size={16} className="text-slate-400" />
            <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300">
              Contatos ({(company.contacts || []).length})
            </h3>
          </div>
          <button onClick={() => setNewContactOpen(true)} className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-fyness-primary hover:bg-fyness-secondary text-white rounded-lg">
            <Plus size={12} /> Novo Contato
          </button>
        </div>

        {(company.contacts || []).length === 0 ? (
          <p className="text-sm text-slate-400 dark:text-slate-500 py-4 text-center">Nenhum contato vinculado</p>
        ) : (
          <div className="space-y-1">
            {company.contacts.map(ct => {
              const cs = CONTACT_STATUS[ct.status] || CONTACT_STATUS.lead;
              return (
                <div key={ct.id} className="flex items-center gap-3 py-2.5 px-3 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer transition-colors" onClick={() => navigate(`/crm/contacts/${ct.id}`)}>
                  <CrmAvatar name={ct.name} size="sm" />
                  <div className="flex-1 min-w-0">
                    <span className="text-sm font-medium text-slate-800 dark:text-slate-200 block truncate">{ct.name}</span>
                    <span className="text-xs text-slate-400">{ct.position || ct.email || ''}</span>
                  </div>
                  <CrmBadge variant={cs.variant} size="sm">{cs.label}</CrmBadge>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Deals da empresa */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700/50 p-5">
        <div className="flex items-center gap-2 mb-4">
          <Target size={16} className="text-slate-400" />
          <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300">
            Negocios ({(company.deals || []).length})
          </h3>
        </div>

        {(company.deals || []).length === 0 ? (
          <p className="text-sm text-slate-400 dark:text-slate-500 py-4 text-center">Nenhum negocio vinculado</p>
        ) : (
          <div className="space-y-1">
            {company.deals.map(deal => {
              const ds = DEAL_STATUS[deal.status] || DEAL_STATUS.open;
              return (
                <div key={deal.id} className="flex items-center gap-3 py-2.5 px-3 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                  <div className="flex-1 min-w-0">
                    <span className="text-sm font-medium text-slate-800 dark:text-slate-200 block truncate">{deal.title}</span>
                  </div>
                  <span className="text-sm font-semibold text-slate-700 dark:text-slate-300 shrink-0">{formatCurrency(deal.value)}</span>
                  <CrmBadge variant={ds.variant} dot size="sm">{ds.label}</CrmBadge>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Modals */}
      <CompanyFormModal open={editOpen} onClose={() => setEditOpen(false)} company={company} />
      <ContactFormModal
        open={newContactOpen}
        onClose={() => setNewContactOpen(false)}
        contact={{ companyId: company.id }}
      />
    </div>
  );
}

export default CrmCompanyDetailPage;
