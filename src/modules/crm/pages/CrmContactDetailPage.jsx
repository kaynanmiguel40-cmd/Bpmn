/**
 * CrmContactDetailPage - Detalhe de um contato CRM.
 * Header com avatar, info cards, tabs (Atividades, Deals, Notas).
 */

import { useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft, Pencil, Mail, Phone, MapPin, Building2, Tag,
  CalendarCheck, Target, FileText, StickyNote,
  CheckSquare, Video, Coffee,
} from 'lucide-react';
import { CrmAvatar, CrmBadge } from '../components/ui';
import { useCrmContact, useUpdateCrmContact } from '../hooks/useCrmQueries';
import { ContactFormModal } from '../components/ContactFormModal';

const STATUS_MAP = {
  lead: { label: 'Lead', variant: 'info' },
  active: { label: 'Ativo', variant: 'success' },
  inactive: { label: 'Inativo', variant: 'neutral' },
  customer: { label: 'Cliente', variant: 'blue' },
};

const DEAL_STATUS = {
  open: { label: 'Aberto', variant: 'info' },
  won: { label: 'Ganho', variant: 'success' },
  lost: { label: 'Perdido', variant: 'danger' },
};

const activityIcons = {
  call: Phone, email: Mail, meeting: Video,
  task: CheckSquare, follow_up: Coffee, visit: MapPin,
};

const formatCurrency = (val) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val || 0);

const TABS = [
  { id: 'activities', label: 'Atividades', icon: CalendarCheck },
  { id: 'deals', label: 'Negocios', icon: Target },
  { id: 'notes', label: 'Notas', icon: StickyNote },
];

export function CrmContactDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: contact, isLoading } = useCrmContact(id);
  const updateMutation = useUpdateCrmContact();

  const [activeTab, setActiveTab] = useState('activities');
  const [editOpen, setEditOpen] = useState(false);
  const [notes, setNotes] = useState(null);
  const [notesSaving, setNotesSaving] = useState(false);

  // Auto-save notes
  const saveNotes = useCallback(async (value) => {
    setNotesSaving(true);
    await updateMutation.mutateAsync({ id, updates: { notes: value } });
    setNotesSaving(false);
  }, [id, updateMutation]);

  if (isLoading) {
    return (
      <div className="animate-pulse space-y-6">
        <div className="h-8 w-32 bg-slate-200 dark:bg-slate-700 rounded" />
        <div className="flex gap-4">
          <div className="w-20 h-20 bg-slate-200 dark:bg-slate-700 rounded-full" />
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

  if (!contact) {
    return (
      <div className="text-center py-16">
        <p className="text-slate-500 dark:text-slate-400 mb-4">Contato nao encontrado</p>
        <button onClick={() => navigate('/crm/contacts')} className="text-sm text-blue-600 hover:underline">Voltar para contatos</button>
      </div>
    );
  }

  const st = STATUS_MAP[contact.status] || STATUS_MAP.lead;
  const currentNotes = notes !== null ? notes : (contact.notes || '');

  return (
    <div className="space-y-6">
      {/* Top bar */}
      <div className="flex items-center justify-between">
        <button onClick={() => navigate('/crm/contacts')} className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700 dark:hover:text-slate-300">
          <ArrowLeft size={16} /> Contatos
        </button>
        <button
          onClick={() => setEditOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-fyness-primary hover:bg-fyness-secondary text-white text-sm font-medium rounded-lg"
        >
          <Pencil size={14} /> Editar
        </button>
      </div>

      {/* Header */}
      <div className="flex items-start gap-4">
        <CrmAvatar name={contact.name} size="lg" color={contact.avatarColor} />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3">
            <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 truncate">{contact.name}</h2>
            <CrmBadge variant={st.variant} dot>{st.label}</CrmBadge>
          </div>
          <div className="flex items-center gap-3 mt-1 text-sm text-slate-500 dark:text-slate-400">
            {contact.position && <span>{contact.position}</span>}
            {contact.company && (
              <>
                {contact.position && <span>·</span>}
                <button onClick={() => navigate(`/crm/companies/${contact.company.id}`)} className="text-blue-600 dark:text-blue-400 hover:underline">
                  {contact.company.name}
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Info cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {contact.email && (
          <a href={`mailto:${contact.email}`} className="flex items-center gap-3 px-4 py-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700/50 hover:border-blue-300 dark:hover:border-blue-700 transition-colors group">
            <Mail size={16} className="text-slate-400 group-hover:text-blue-500" />
            <div className="min-w-0">
              <div className="text-[10px] text-slate-400 uppercase tracking-wider">Email</div>
              <div className="text-sm text-slate-700 dark:text-slate-300 truncate">{contact.email}</div>
            </div>
          </a>
        )}
        {contact.phone && (
          <a href={`tel:${contact.phone}`} className="flex items-center gap-3 px-4 py-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700/50 hover:border-blue-300 dark:hover:border-blue-700 transition-colors group">
            <Phone size={16} className="text-slate-400 group-hover:text-blue-500" />
            <div className="min-w-0">
              <div className="text-[10px] text-slate-400 uppercase tracking-wider">Telefone</div>
              <div className="text-sm text-slate-700 dark:text-slate-300">{contact.phone}</div>
            </div>
          </a>
        )}
        {(contact.city || contact.state) && (
          <div className="flex items-center gap-3 px-4 py-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700/50">
            <MapPin size={16} className="text-slate-400" />
            <div className="min-w-0">
              <div className="text-[10px] text-slate-400 uppercase tracking-wider">Localizacao</div>
              <div className="text-sm text-slate-700 dark:text-slate-300 truncate">
                {[contact.address, contact.city, contact.state].filter(Boolean).join(', ')}
              </div>
            </div>
          </div>
        )}
        {contact.tags?.length > 0 && (
          <div className="flex items-center gap-3 px-4 py-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700/50">
            <Tag size={16} className="text-slate-400" />
            <div className="min-w-0">
              <div className="text-[10px] text-slate-400 uppercase tracking-wider mb-1">Tags</div>
              <div className="flex flex-wrap gap-1">
                {contact.tags.map(t => <CrmBadge key={t} variant="violet" size="sm">{t}</CrmBadge>)}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="border-b border-slate-200 dark:border-slate-700/50">
        <div className="flex gap-0">
          {TABS.map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                  isActive
                    ? 'border-blue-600 text-blue-600 dark:text-blue-400 dark:border-blue-400'
                    : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                }`}
              >
                <Icon size={15} /> {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Tab Content */}
      <div>
        {/* ACTIVITIES */}
        {activeTab === 'activities' && (
          <div>
            {(contact.activities || []).length === 0 ? (
              <div className="py-8 text-center text-sm text-slate-400 dark:text-slate-500">Nenhuma atividade vinculada</div>
            ) : (
              <div className="relative pl-6">
                <div className="absolute left-[11px] top-2 bottom-2 w-px bg-slate-200 dark:bg-slate-700/50" />
                <div className="space-y-1">
                  {contact.activities.map(act => {
                    const Icon = activityIcons[act.type] || CalendarCheck;
                    return (
                      <div key={act.id} className="flex items-start gap-3 py-2 relative">
                        <div className="w-[22px] h-[22px] rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center shrink-0 z-10 ring-2 ring-white dark:ring-slate-950 -ml-[17px]">
                          <Icon size={11} className="text-blue-600 dark:text-blue-400" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-slate-800 dark:text-slate-200 font-medium">{act.title}</span>
                            {act.completed && <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />}
                          </div>
                          <span className="text-xs text-slate-400">
                            {act.startDate ? new Date(act.startDate).toLocaleDateString('pt-BR') : ''}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}

        {/* DEALS */}
        {activeTab === 'deals' && (
          <div>
            {(contact.deals || []).length === 0 ? (
              <div className="py-8 text-center text-sm text-slate-400 dark:text-slate-500">Nenhum negocio vinculado</div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {contact.deals.map(deal => {
                  const ds = DEAL_STATUS[deal.status] || DEAL_STATUS.open;
                  return (
                    <div key={deal.id} className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700/50 p-4 hover:border-blue-300 dark:hover:border-blue-700 transition-colors cursor-pointer" onClick={() => navigate(`/crm/deals`)}>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-semibold text-slate-800 dark:text-slate-200 truncate">{deal.title}</span>
                        <CrmBadge variant={ds.variant} dot>{ds.label}</CrmBadge>
                      </div>
                      <div className="text-lg font-bold text-slate-700 dark:text-slate-300">{formatCurrency(deal.value)}</div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* NOTES */}
        {activeTab === 'notes' && (
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700/50 p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-slate-600 dark:text-slate-400">Anotacoes</span>
              {notesSaving && <span className="text-xs text-slate-400 animate-pulse">Salvando...</span>}
            </div>
            <textarea
              value={currentNotes}
              onChange={(e) => setNotes(e.target.value)}
              onBlur={() => { if (notes !== null && notes !== (contact.notes || '')) saveNotes(notes); }}
              rows={8}
              placeholder="Escreva suas anotacoes sobre este contato..."
              className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-fyness-primary resize-none"
            />
          </div>
        )}
      </div>

      {/* Edit Modal */}
      <ContactFormModal open={editOpen} onClose={() => setEditOpen(false)} contact={contact} />
    </div>
  );
}

export default CrmContactDetailPage;
