/**
 * CrmAccessModal — editor de acesso de um membro às seções do CRM.
 *
 * UX: modal focado, seções agrupadas como a sidebar, com toggles de verdade.
 * Edita um rascunho local (toggle é instantâneo) e persiste tudo no "Salvar".
 * Verde = pode acessar. Dashboard aparece travado (sempre disponível).
 */

import { useState, useEffect, useMemo } from 'react';
import {
  Kanban, MessageCircle, CalendarDays, Crosshair, Zap, Users,
  Target, Trophy, UserCog, Settings, Lock, ShieldCheck, Filter,
  AlertTriangle,
} from 'lucide-react';
import { CrmModal } from './ui/CrmModal';
import { CrmAvatar } from './ui/CrmAvatar';
import { CRM_SECTIONS, CRM_SECTION_GROUPS, normalizeBlocked } from '../lib/crmAccess';

// Ícone + tom de cor por seção (espelha a sidebar).
const SECTION_UI = {
  pipeline:    { icon: Kanban,        tint: 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/25' },
  inbox:       { icon: MessageCircle, tint: 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/25' },
  agenda:      { icon: CalendarDays,  tint: 'text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/25' },
  prospects:   { icon: Crosshair,     tint: 'text-violet-600 dark:text-violet-400 bg-violet-50 dark:bg-violet-900/25' },
  automations: { icon: Zap,           tint: 'text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/25' },
  cadastros:   { icon: Users,         tint: 'text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800' },
  comparativo: { icon: Target,        tint: 'text-fuchsia-600 dark:text-fuchsia-400 bg-fuchsia-50 dark:bg-fuchsia-900/25' },
  goals:       { icon: Trophy,        tint: 'text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/25' },
  planejamento:{ icon: Filter,        tint: 'text-cyan-600 dark:text-cyan-400 bg-cyan-50 dark:bg-cyan-900/25' },
  equipe:      { icon: UserCog,       tint: 'text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800' },
  settings:    { icon: Settings,      tint: 'text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800' },
};

// Visual puro do switch — a interação fica na linha (evita button dentro de button).
function ToggleVisual({ checked }) {
  return (
    <span
      className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors duration-200 ${
        checked ? 'bg-emerald-500' : 'bg-slate-300 dark:bg-slate-600'
      }`}
    >
      <span
        className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform duration-200 ${
          checked ? 'translate-x-6' : 'translate-x-1'
        }`}
      />
    </span>
  );
}

const ROLE_LABEL = { vendedor: 'Vendedor', pre_vendedor: 'Pré-vendedor', gestor: 'Gestor' };

// Seções que são o trabalho principal de vendedor/pré-vendedor (não-gestor).
// Bloquear qualquer uma delas corta o dia a dia da pessoa — merece aviso.
const CORE_WORK_KEYS = ['agenda', 'pipeline', 'inbox'];

export function CrmAccessModal({ open, member, onClose, onSave }) {
  const [blocked, setBlocked] = useState([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open && member) setBlocked(normalizeBlocked(member.crmBlockedSections));
  }, [open, member]);

  const blockedSet = useMemo(() => new Set(blocked), [blocked]);
  const total = CRM_SECTIONS.length;
  const allowedCount = total - CRM_SECTIONS.filter(s => blockedSet.has(s.key)).length;
  const pct = Math.round((allowedCount / total) * 100);
  const dirty = member ? normalizeBlocked(member.crmBlockedSections).sort().join(',') !== [...blocked].sort().join(',') : false;
  const blocksCoreWork = member?.crmRole !== 'gestor' && CORE_WORK_KEYS.some(k => blockedSet.has(k));

  const toggle = (key) => {
    setBlocked(prev => (prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]));
  };
  const allowAll = () => setBlocked([]);
  const blockAll = () => setBlocked(CRM_SECTIONS.map(s => s.key));

  const handleSave = async () => {
    setSaving(true);
    try {
      await onSave(blocked);
      onClose();
    } finally {
      setSaving(false);
    }
  };

  if (!member) return null;

  return (
    <CrmModal
      open={open}
      onClose={onClose}
      title="Acesso ao CRM"
      size="lg"
      footer={
        <>
          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            className="min-h-[44px] px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2 w-full sm:w-auto"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={saving || !dirty}
            className="min-h-[44px] px-4 py-2 text-sm font-medium bg-fyness-primary hover:bg-fyness-secondary text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 w-full sm:w-auto"
          >
            {saving && <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
            {/* "Sem alterações" no lugar do rótulo é decisão de produto: o botão
                desabilitado explica por que não dá pra salvar. */}
            {saving ? 'Salvando…' : dirty ? 'Salvar acesso' : 'Sem alterações'}
          </button>
        </>
      }
    >
      {/* Cabeçalho do membro */}
      <div className="flex items-center gap-3.5 pb-4 mb-4 border-b border-slate-100 dark:border-slate-800">
        <CrmAvatar name={member.name} size="lg" color={member.color} />
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h4 className="text-base font-semibold text-slate-800 dark:text-slate-100 truncate">{member.name}</h4>
            {member.crmRole && (
              <span className="text-[12px] font-medium px-1.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 shrink-0">
                {ROLE_LABEL[member.crmRole] || member.crmRole}
              </span>
            )}
          </div>
          {member.email && <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{member.email}</p>}
        </div>
        {/* Selo de resumo */}
        <div className="text-right shrink-0">
          <div className="flex items-baseline gap-1 justify-end">
            <span className={`text-2xl font-bold tabular-nums ${allowedCount === total ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-800 dark:text-slate-100'}`}>{allowedCount}</span>
            <span className="text-sm text-slate-500 dark:text-slate-400">/ {total}</span>
          </div>
          <div className="text-[12px] uppercase tracking-wider text-slate-500 dark:text-slate-400">seções liberadas</div>
        </div>
      </div>

      {/* Barra de resumo + ações rápidas */}
      <div className="flex items-center gap-3 mb-4">
        <div className="flex-1 h-1.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-300 ${allowedCount === total ? 'bg-emerald-500' : allowedCount === 0 ? 'bg-rose-400' : 'bg-fyness-primary'}`}
            style={{ width: `${pct}%` }}
          />
        </div>
        <div className="flex items-center gap-1 shrink-0">
          <button
            type="button"
            onClick={allowAll}
            disabled={allowedCount === total}
            className="text-[12px] font-medium px-2 py-1 rounded-md text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition-colors disabled:opacity-40 disabled:hover:bg-transparent"
          >
            Liberar tudo
          </button>
          <span className="text-slate-200 dark:text-slate-700">·</span>
          <button
            type="button"
            onClick={blockAll}
            disabled={allowedCount === 0}
            className="text-[12px] font-medium px-2 py-1 rounded-md text-rose-500 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-900/20 transition-colors disabled:opacity-40 disabled:hover:bg-transparent"
          >
            Bloquear tudo
          </button>
        </div>
      </div>

      {/* Aviso: bloquear o trabalho principal do time comercial não tem o
          mesmo peso de bloquear Metas/Comparativo — precisa de atrito extra. */}
      {blocksCoreWork && (
        <div className="flex items-start gap-2 px-3 py-2.5 mb-3 rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800">
          <AlertTriangle size={14} className="text-amber-500 dark:text-amber-400 shrink-0 mt-0.5" />
          <p className="text-xs text-amber-700 dark:text-amber-300">
            Atenção: esse membro vai perder acesso a negócios, mensagens e/ou agenda — o trabalho principal dele.
          </p>
        </div>
      )}

      {/* Dashboard — sempre disponível (não editável). Sem card/hover: é só uma
          nota informativa, não um toggle, então não pode parecer um. */}
      <div className="flex items-center gap-2 px-1 mb-3 text-[12px] text-slate-500 dark:text-slate-400">
        <Lock size={11} className="shrink-0" />
        <span>
          <span className="font-medium text-slate-500 dark:text-slate-400">Dashboard</span> — página inicial, sempre disponível para todos
        </span>
      </div>

      {/* Seções agrupadas */}
      <div className="space-y-4">
        {CRM_SECTION_GROUPS.map(group => {
          const items = CRM_SECTIONS.filter(s => s.group === group);
          if (!items.length) return null;
          return (
            <div key={group}>
              <div className="text-[12px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5 px-1">
                {group}
              </div>
              <div className="rounded-xl border border-slate-100 dark:border-slate-800 divide-y divide-slate-100 dark:divide-slate-800 overflow-hidden">
                {items.map(sec => {
                  const ui = SECTION_UI[sec.key] || SECTION_UI.settings;
                  const Icon = ui.icon;
                  const allowed = !blockedSet.has(sec.key);
                  return (
                    <button
                      key={sec.key}
                      type="button"
                      role="switch"
                      aria-checked={allowed}
                      onClick={() => toggle(sec.key)}
                      className="w-full flex items-center gap-3 px-3 py-2.5 text-left hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors focus:outline-none focus-visible:bg-slate-50 dark:focus-visible:bg-slate-800/40"
                    >
                      <span className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${ui.tint}`}>
                        <Icon size={16} />
                      </span>
                      <span className="flex-1 min-w-0">
                        <span className="block text-sm font-medium text-slate-700 dark:text-slate-200 truncate">{sec.label}</span>
                        <span className={`block text-[12px] font-medium ${allowed ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-500 dark:text-slate-400'}`}>
                          {allowed ? 'Pode acessar' : 'Bloqueado'}
                        </span>
                      </span>
                      <ToggleVisual checked={allowed} />
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Rodapé informativo */}
      <div className="flex items-start gap-2 mt-4 text-[12px] text-slate-500 dark:text-slate-400">
        <ShieldCheck size={13} className="shrink-0 mt-0.5" />
        <span>
          Admins veem tudo, independente destes ajustes. As mudanças valem no menu e por link direto.
        </span>
      </div>
    </CrmModal>
  );
}

export default CrmAccessModal;
