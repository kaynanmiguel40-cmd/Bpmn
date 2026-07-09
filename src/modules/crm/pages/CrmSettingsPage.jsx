/**
 * CrmSettingsPage — Configurações do CRM
 * Tabs: Equipe | Segmentos | Preferências
 */

import { useState, useEffect, useRef } from 'react';
import {
  Users, Tag, Plus, X, SlidersHorizontal, ShieldCheck,
} from 'lucide-react';
import { CrmPageHeader, CrmAvatar } from '../components/ui';
import { useTeamMembers } from '../../../hooks/queries';
import { updateTeamMember } from '../../../lib/teamService';
import { useCrmAccess } from '../hooks/useCrmAccess';
import { CRM_SECTIONS, normalizeBlocked, OWNER_EMAILS } from '../lib/crmAccess';
import { CrmAccessModal } from '../components/CrmAccessModal';

// ─── Constantes ───────────────────────────────────────────────────────────────

const CRM_ROLES = [
  { value: 'vendedor',    label: 'Vendedor',    color: 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 border-emerald-300 dark:border-emerald-700' },
  { value: 'pre_vendedor',label: 'Pré-vendedor',color: 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 border-amber-300 dark:border-amber-700' },
  { value: 'gestor',      label: 'Gestor',      color: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border-blue-300 dark:border-blue-700' },
];

const DEFAULT_SEGMENTS = [
  'Agro', 'Varejo', 'Industria', 'Tecnologia', 'Educacao',
  'Saude', 'Financeiro', 'Construcao', 'Servicos',
];

// ─── Helpers de estilo ────────────────────────────────────────────────────────

const inputCls = 'w-full px-3 py-2 text-sm bg-white/70 dark:bg-slate-800/60 backdrop-blur border border-white/60 dark:border-white/10 rounded-lg text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/40';
const labelCls = 'block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1';

function SectionCard({ icon: Icon, color, title, subtitle, children }) {
  return (
    <div className="crm-glass rounded-2xl">
      <div className="flex items-center gap-3 px-5 py-4 border-b border-slate-100 dark:border-slate-700/50">
        <div className={`w-9 h-9 rounded-lg ${color} flex items-center justify-center shrink-0`}>
          <Icon size={18} />
        </div>
        <div>
          <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-200">{title}</h3>
          {subtitle && <p className="text-xs text-slate-500 dark:text-slate-400">{subtitle}</p>}
        </div>
      </div>
      <div className="px-5 py-4">{children}</div>
    </div>
  );
}

// ─── Tab: Equipe ──────────────────────────────────────────────────────────────

const TOTAL_SECTIONS = CRM_SECTIONS.length;

function EquipeTab() {
  const { data: teamMembers = [], refetch } = useTeamMembers();
  const { isAdmin } = useCrmAccess();
  const [savingId, setSavingId] = useState(null);
  const [accessMember, setAccessMember] = useState(null);

  const handleSetRole = async (memberId, crmRole) => {
    setSavingId(memberId);
    try {
      await updateTeamMember(memberId, { crmRole });
      await refetch();
    } finally {
      setSavingId(null);
    }
  };

  const handleSaveAccess = async (member, nextBlocked) => {
    await updateTeamMember(member.id, { crmBlockedSections: nextBlocked });
    await refetch();
  };

  const membersWithRole    = teamMembers.filter(m => m.crmRole);
  const membersWithoutRole = teamMembers.filter(m => !m.crmRole);
  const ordered = [...membersWithRole, ...membersWithoutRole];

  return (
    <SectionCard
      icon={Users}
      color="bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400"
      title="Equipe Comercial"
      subtitle={isAdmin
        ? 'Defina o cargo e o que cada membro acessa no CRM. Admins veem tudo.'
        : 'Cargos e permissões da equipe (somente leitura — apenas admins editam).'}
    >
      {teamMembers.length === 0 ? (
        <p className="text-sm text-slate-500 dark:text-slate-400 py-8 text-center">
          Nenhum membro cadastrado. Adicione membros em Configurações gerais.
        </p>
      ) : (
        <div className="divide-y divide-slate-100 dark:divide-slate-800/70 -mx-1">
          {ordered.map(member => {
            const blocked = normalizeBlocked(member.crmBlockedSections).filter(k => CRM_SECTIONS.some(s => s.key === k));
            const isOwner = OWNER_EMAILS.includes((member.email || '').toLowerCase());
            const allowedCount = TOTAL_SECTIONS - blocked.length;
            const restricted = blocked.length > 0;

            return (
              <div
                key={member.id}
                className="flex items-center gap-3 px-1 py-2.5 rounded-lg hover:bg-slate-50/70 dark:hover:bg-slate-800/30 transition-colors"
              >
                <CrmAvatar name={member.name} size="sm" color={member.color} />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <span className="text-sm font-medium text-slate-800 dark:text-slate-200 truncate">{member.name}</span>
                    {isOwner && (
                      <span className="inline-flex items-center gap-0.5 text-[10px] font-medium px-1.5 py-0.5 rounded-full bg-fyness-primary/10 text-fyness-primary shrink-0">
                        <ShieldCheck size={10} /> Admin
                      </span>
                    )}
                  </div>
                  {member.role && <div className="text-xs text-slate-400 dark:text-slate-500 truncate">{member.role}</div>}
                </div>

                {/* Cargo CRM — segmented */}
                <div className="hidden sm:flex items-center rounded-lg bg-slate-100/70 dark:bg-slate-800/60 p-0.5 shrink-0">
                  {CRM_ROLES.map(r => {
                    const isActive = member.crmRole === r.value;
                    if (!isAdmin) {
                      return isActive ? (
                        <span key={r.value} className={`px-2.5 py-1 text-xs font-medium rounded-md ${r.color}`}>{r.label}</span>
                      ) : null;
                    }
                    return (
                      <button
                        key={r.value}
                        onClick={() => handleSetRole(member.id, isActive ? null : r.value)}
                        disabled={savingId === member.id}
                        className={`px-2.5 py-1 text-xs font-medium rounded-md transition-all disabled:opacity-50 ${
                          isActive
                            ? 'bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100 shadow-sm'
                            : 'text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300'
                        }`}
                      >
                        {r.label}
                      </button>
                    );
                  })}
                </div>

                {/* Botão de acesso — abre o modal */}
                {isAdmin && !isOwner ? (
                  <button
                    onClick={() => setAccessMember(member)}
                    className="inline-flex items-center gap-2 pl-2.5 pr-2 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:border-fyness-primary/50 hover:bg-fyness-primary/5 dark:hover:bg-fyness-primary/10 transition-colors shrink-0 group"
                    title="Gerenciar o que este membro acessa no CRM"
                  >
                    <span className={`w-1.5 h-1.5 rounded-full ${restricted ? 'bg-amber-500' : 'bg-emerald-500'}`} />
                    <span className="text-xs font-medium text-slate-600 dark:text-slate-300 whitespace-nowrap">
                      {restricted ? `${allowedCount}/${TOTAL_SECTIONS} seções` : 'Acesso total'}
                    </span>
                    <SlidersHorizontal size={13} className="text-slate-400 group-hover:text-fyness-primary transition-colors" />
                  </button>
                ) : isOwner ? (
                  <span className="text-[11px] text-slate-400 dark:text-slate-500 shrink-0 hidden sm:inline">vê tudo</span>
                ) : null}

                {savingId === member.id && (
                  <div className="w-4 h-4 border-2 border-blue-300 border-t-blue-600 rounded-full animate-spin shrink-0" />
                )}
              </div>
            );
          })}
        </div>
      )}

      <CrmAccessModal
        open={!!accessMember}
        member={accessMember}
        onClose={() => setAccessMember(null)}
        onSave={(nextBlocked) => handleSaveAccess(accessMember, nextBlocked)}
      />
    </SectionCard>
  );
}
// ─── Tab: Segmentos ───────────────────────────────────────────────────────────

function SegmentosTab() {
  const storageKey = 'crm-segments';
  const load = () => {
    try {
      const s = localStorage.getItem(storageKey);
      return s ? JSON.parse(s) : DEFAULT_SEGMENTS;
    } catch { return DEFAULT_SEGMENTS; }
  };

  const [segments, setSegments] = useState(load);
  const [newSeg, setNewSeg]     = useState('');

  const save = (list) => {
    setSegments(list);
    try { localStorage.setItem(storageKey, JSON.stringify(list)); } catch {}
  };

  const add = () => {
    const val = newSeg.trim();
    if (!val || segments.includes(val)) return;
    save([...segments, val]);
    setNewSeg('');
  };

  const remove = (seg) => save(segments.filter(s => s !== seg));

  const reset = () => save(DEFAULT_SEGMENTS);

  return (
    <SectionCard
      icon={Tag}
      color="bg-violet-50 dark:bg-violet-900/20 text-violet-600 dark:text-violet-400"
      title="Segmentos de Mercado"
      subtitle="Lista de segmentos disponíveis para classificar deals e disparar automações segmentadas."
    >
      <div className="space-y-4">
        {/* Chips dos segmentos */}
        <div className="flex flex-wrap gap-2">
          {segments.map(seg => (
            <span
              key={seg}
              className="inline-flex items-center gap-1.5 px-3 py-1 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 text-sm rounded-full"
            >
              {seg}
              <button
                onClick={() => remove(seg)}
                className="text-slate-400 hover:text-red-500 transition-colors ml-0.5"
              >
                <X size={12} />
              </button>
            </span>
          ))}
        </div>

        {/* Add */}
        <div className="flex gap-2">
          <input
            value={newSeg}
            onChange={e => setNewSeg(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') add(); }}
            placeholder="Novo segmento (ex: Agronegócio)"
            className={`${inputCls} flex-1`}
          />
          <button
            onClick={add}
            className="px-4 py-2 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
          >
            <Plus size={14} />
          </button>
        </div>

        <div className="flex justify-end">
          <button
            onClick={reset}
            className="text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
          >
            Restaurar padrões
          </button>
        </div>
      </div>
    </SectionCard>
  );
}

// ─── Página principal ─────────────────────────────────────────────────────────

// Automações saiu daqui — vive na sidebar do CRM (/crm/automations).
const TABS = [
  { id: 'equipe',       label: 'Equipe',       Icon: Users    },
  { id: 'segmentos',    label: 'Segmentos',    Icon: Tag      },
];

export function CrmSettingsPage() {
  const [activeTab, setActiveTab] = useState('equipe');

  return (
    <div className="space-y-5">
      <CrmPageHeader
        title="Configurações"
        subtitle="Personalize o CRM de acordo com seu processo comercial"
      />

      {/* Tabs */}
      <div className="flex gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl w-fit">
        {TABS.map(tab => {
          const Icon = tab.Icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? 'bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100 shadow-sm'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
              }`}
            >
              <Icon size={14} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Conteúdo */}
      {activeTab === 'equipe'       && <EquipeTab />}
      {activeTab === 'segmentos'    && <SegmentosTab />}
    </div>
  );
}

export default CrmSettingsPage;
