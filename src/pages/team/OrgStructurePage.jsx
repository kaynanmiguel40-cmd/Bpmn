import { useEffect, useMemo, useState } from 'react';
import { useTeamMembers } from '../../hooks/queries';
import { supabase } from '../../lib/supabase';
import {
  useOrgSectors,
  useCreateOrgSector,
  useUpdateOrgSector,
  useDeleteOrgSector,
  useUpdateMemberOrgAssignment,
  useOrgSectorMemberships,
  useSetMemberSecondarySectors,
  useSectorManagers,
  useSetSectorManagers,
} from '../../hooks/useOrgStructure';
import { toast } from '../../contexts/ToastContext';
import logoFyness from '../../assets/logo-fyness.png';

const SECTOR_COLORS = [
  '#3b82f6', '#22c55e', '#f97316', '#ec4899',
  '#8b5cf6', '#eab308', '#ef4444', '#06b6d4',
];

// ==================== CSS DO ORG CHART ====================
// Tecnica classica de pseudo-elementos pra desenhar linhas conectoras
// curtinhas entre o pai e os filhos numa arvore top-down.
const ORG_TREE_CSS = `
.org-tree, .org-tree ul {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  justify-content: center;
}
.org-tree ul {
  padding-top: 36px;
  position: relative;
}
.org-tree li {
  position: relative;
  padding: 36px 20px 0;
  display: flex;
  flex-direction: column;
  align-items: center;
}
.org-tree li::before,
.org-tree li::after {
  content: '';
  position: absolute;
  top: 0;
  width: 50%;
  height: 36px;
  border-top: 1.5px solid rgb(203 213 225);
}
:is(.dark) .org-tree li::before,
:is(.dark) .org-tree li::after {
  border-color: rgb(51 65 85);
}
.org-tree li::before { left: 0; }
.org-tree li::after {
  left: 50%;
  border-left: 1.5px solid rgb(203 213 225);
}
:is(.dark) .org-tree li::after { border-left-color: rgb(51 65 85); }
.org-tree li:first-child::before,
.org-tree li:last-child::after { border: 0 none; }
.org-tree li:last-child::before {
  border-right: 1.5px solid rgb(203 213 225);
}
:is(.dark) .org-tree li:last-child::before {
  border-right-color: rgb(51 65 85);
}
.org-tree li:only-child::before,
.org-tree li:only-child::after { display: none; }
.org-tree li:only-child {
  padding-top: 36px;
}
.org-tree li:only-child::before {
  content: '';
  display: block;
  position: absolute;
  top: 0;
  left: 50%;
  width: 0;
  height: 36px;
  border-left: 1.5px solid rgb(203 213 225);
  border-top: 0;
}
:is(.dark) .org-tree li:only-child::before {
  border-left-color: rgb(51 65 85);
}
.org-tree ul ul::before {
  content: '';
  position: absolute;
  top: 0;
  left: 50%;
  height: 36px;
  border-left: 1.5px solid rgb(203 213 225);
}
:is(.dark) .org-tree ul ul::before {
  border-left-color: rgb(51 65 85);
}
.org-tree > li {
  padding-top: 0;
}
.org-tree > li::before,
.org-tree > li::after { display: none; }

/* Largura FIXA pra cada coluna de setor — garante equidistancia entre setores. */
.org-tree > li > ul > li {
  width: 220px;
  min-width: 220px;
  vertical-align: top;
  align-self: flex-start;
}
`;

// ==================== AVATARES E CARDS ====================

function Avatar({ name, color, imageUrl, size = 'md' }) {
  const sizes = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-14 h-14 text-base',
  };
  if (imageUrl) {
    return (
      <img
        src={imageUrl}
        alt={name || ''}
        className={`${sizes[size]} rounded-full object-cover shrink-0 shadow-sm ring-2 ring-white dark:ring-slate-900`}
      />
    );
  }
  const initial = (name || '?').trim().charAt(0).toUpperCase();
  return (
    <div
      className={`${sizes[size]} rounded-full flex items-center justify-center text-white font-semibold shrink-0 shadow-sm ring-2 ring-white dark:ring-slate-900`}
      style={{ backgroundColor: color || '#94a3b8' }}
    >
      {initial}
    </div>
  );
}

/** Card do nó raiz "Empresa". Altura fixa pra alinhar nivel a nivel. */
function RootNode({ totalPeople, sectorsCount }) {
  return (
    <div className="relative w-[200px] h-[72px] rounded-xl bg-gradient-to-br from-slate-800 to-slate-950 text-white px-4 shadow-md flex flex-col justify-center">
      <div className="flex items-center gap-2.5">
        <img src={logoFyness} alt="Fyness" className="w-8 h-8 object-contain rounded-lg bg-white/10 p-1 shrink-0" />
        <div className="flex-1 min-w-0">
          <div className="text-[9px] uppercase tracking-wider opacity-60 leading-none">Empresa</div>
          <div className="text-sm font-bold truncate leading-tight mt-0.5">Fyness</div>
          <div className="text-[10px] opacity-70 leading-none mt-0.5">
            {totalPeople} pess · {sectorsCount} set
          </div>
        </div>
      </div>
    </div>
  );
}

/** Card do setor — altura fixa identica aos cards de pessoa. */
function SectorNode({ sector, count, onClick }) {
  return (
    <button
      onClick={onClick}
      className="relative w-[180px] h-[68px] rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-left group"
    >
      <div className="h-1.5 w-full" style={{ backgroundColor: sector.color }} />
      <div
        className="flex-1 px-3 flex items-center gap-2 h-[calc(100%-6px)]"
        style={{ background: `linear-gradient(180deg, ${sector.color}12, transparent)` }}
      >
        <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: sector.color }} />
        <div className="text-[13px] font-semibold text-slate-800 dark:text-slate-100 flex-1 truncate">
          {sector.name}
        </div>
        <span className="text-[10px] text-slate-400 tabular-nums px-1.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800">
          {count}
        </span>
      </div>
    </button>
  );
}

/** Card de pessoa. Badge no canto (Gestor) + sub-rotulo opcional ("vem de X"). */
function PersonNode({ member, badge, onClick, accent, fromSector, imageUrl }) {
  const isCross = Boolean(fromSector);
  return (
    <button
      onClick={onClick}
      className={`relative w-[180px] h-[72px] rounded-xl bg-white dark:bg-slate-900 hover:shadow-sm transition-all px-3 text-left flex items-center gap-2.5 border ${
        isCross
          ? 'border-dashed border-slate-300 dark:border-slate-700 hover:border-slate-400 dark:hover:border-slate-600'
          : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
      }`}
    >
      <Avatar name={member.name} color={member.color} imageUrl={imageUrl} size="md" />
      <div className="flex-1 min-w-0">
        <div className="text-[13px] font-medium text-slate-800 dark:text-slate-100 truncate leading-tight">
          {member.name}
        </div>
        <div className="text-[11px] text-slate-500 dark:text-slate-400 truncate leading-tight mt-0.5">
          {member.role || 'Colaborador'}
        </div>
        {isCross && (
          <div className="text-[10px] text-slate-400 dark:text-slate-500 truncate leading-tight mt-0.5 italic">
            vem de {fromSector}
          </div>
        )}
      </div>
      {badge && (
        <span
          className="absolute -top-1.5 right-2 px-1.5 py-[1px] rounded-full text-[9px] uppercase tracking-wider font-bold shadow-sm bg-white dark:bg-slate-900 border"
          style={{
            color: accent || '#64748b',
            borderColor: accent ? `${accent}66` : 'rgb(203 213 225)',
          }}
        >
          {badge}
        </span>
      )}
    </button>
  );
}

/** Card "Adicionar setor" — aparece como ultimo irmao na linha de setores. */
function AddSectorPlaceholder({ onClick }) {
  return (
    <button
      onClick={onClick}
      className="w-[180px] h-[68px] rounded-xl border border-dashed border-slate-300 dark:border-slate-700 hover:border-fyness-primary dark:hover:border-blue-400 hover:bg-slate-50 dark:hover:bg-slate-900/40 text-slate-400 hover:text-fyness-primary dark:hover:text-blue-400 text-[12px] font-medium flex items-center justify-center gap-1.5 transition-colors"
    >
      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
      </svg>
      Novo setor
    </button>
  );
}

// ==================== ARVORE ====================

/** Lista vertical recursiva de subordinados PRIMARIOS do setor.
 *  Hierarquia interna mostrada por indent + linha guia vertical à esquerda. */
function PersonList({ parentId, sectorMembers, onEditMember, getAvatar, depth = 0 }) {
  const children = sectorMembers.filter(m => (m.managerId || null) === parentId);
  if (children.length === 0) return null;
  return (
    <div
      className={depth === 0
        ? 'flex flex-col gap-3'
        : 'flex flex-col gap-3 ml-4 pl-3.5 border-l-2 border-slate-200 dark:border-slate-800 mt-3'}
    >
      {children.map(child => (
        <div key={child.id}>
          <PersonNode member={child} imageUrl={getAvatar?.(child)} onClick={() => onEditMember(child)} />
          <PersonList
            parentId={child.id}
            sectorMembers={sectorMembers}
            onEditMember={onEditMember}
            getAvatar={getAvatar}
            depth={depth + 1}
          />
        </div>
      ))}
    </div>
  );
}

/**
 * Corpo do setor: 1+ gestores no topo + membros primarios em arvore.
 *
 * Pessoa = 1 card no setor primario dela. Co-gestores ficam empilhados no topo.
 * Gestor cross-setor mostra sub-rotulo "vem de [setor primario]".
 *
 * managerIdsForThisSector: lista de IDs (ordem = order desejada de exibicao)
 */
function SectorBody({ sector, sectors, members, managerIdsForThisSector, getAvatar, onEditMember }) {
  const sectorMembers = members.filter(m => m.orgSectorId === sector.id);
  const managers = managerIdsForThisSector
    .map(id => members.find(m => m.id === id))
    .filter(Boolean);

  if (sectorMembers.length === 0 && managers.length === 0) return null;

  const managerIdSet = new Set(managers.map(m => m.id));

  const crossFromName = (mgr) => {
    if (!mgr.orgSectorId || mgr.orgSectorId === sector.id) return null;
    return sectors.find(s => s.id === mgr.orgSectorId)?.name || null;
  };

  // Direct reports por gestor (subordinados primarios do setor cujo chefe e esse gestor).
  const directReportsOf = (mgrId) =>
    sectorMembers.filter(m => m.id !== mgrId && m.managerId === mgrId);

  // Orfaos: membros do setor sem chefe ou com chefe fora do setor e que nao reportam a nenhum dos gestores
  const orphans = sectorMembers.filter(m => {
    if (managerIdSet.has(m.id)) return false;
    if (!m.managerId) return true;
    if (managerIdSet.has(m.managerId)) return false;
    return !sectorMembers.some(s => s.id === m.managerId);
  });

  // Sem gestores: lista raiz
  const rootsWhenNoManagers = sectorMembers.filter(m => {
    if (!m.managerId) return true;
    return !sectorMembers.some(s => s.id === m.managerId);
  });

  return (
    <div className="mt-4 w-full flex flex-col gap-3">
      {managers.length > 0 ? (
        <>
          {/* Gestores empilhados no topo */}
          {managers.map((mgr, idx) => {
            const reports = directReportsOf(mgr.id);
            return (
              <div key={mgr.id}>
                <PersonNode
                  member={mgr}
                  badge={managers.length > 1 ? 'Co-Gestor' : 'Gestor'}
                  accent={sector.color}
                  fromSector={crossFromName(mgr)}
                  imageUrl={getAvatar?.(mgr)}
                  onClick={() => onEditMember(mgr)}
                />
                {reports.length > 0 && (
                  <div className="ml-4 pl-3.5 border-l-2 border-slate-200 dark:border-slate-800 flex flex-col gap-3 mt-3">
                    {reports.map(child => (
                      <div key={child.id}>
                        <PersonNode member={child} imageUrl={getAvatar?.(child)} onClick={() => onEditMember(child)} />
                        <PersonList
                          parentId={child.id}
                          sectorMembers={sectorMembers}
                          onEditMember={onEditMember}
                          getAvatar={getAvatar}
                          depth={1}
                        />
                      </div>
                    ))}
                  </div>
                )}
                {/* Separador visual entre co-gestores (exceto apos o ultimo) */}
                {managers.length > 1 && idx < managers.length - 1 && (
                  <div className="my-2 border-t border-dashed border-slate-200 dark:border-slate-800" />
                )}
              </div>
            );
          })}
          {/* Orfaos: subordinados que nao reportam a nenhum gestor */}
          {orphans.length > 0 && (
            <div className="ml-4 pl-3.5 border-l-2 border-slate-200 dark:border-slate-800 flex flex-col gap-3">
              {orphans.map(m => (
                <div key={m.id}>
                  <PersonNode member={m} imageUrl={getAvatar?.(m)} onClick={() => onEditMember(m)} />
                  <PersonList
                    parentId={m.id}
                    sectorMembers={sectorMembers}
                    onEditMember={onEditMember}
                    getAvatar={getAvatar}
                    depth={1}
                  />
                </div>
              ))}
            </div>
          )}
        </>
      ) : (
        rootsWhenNoManagers.map(m => (
          <div key={m.id}>
            <PersonNode member={m} imageUrl={getAvatar?.(m)} onClick={() => onEditMember(m)} />
            <PersonList
              parentId={m.id}
              sectorMembers={sectorMembers}
              onEditMember={onEditMember}
              getAvatar={getAvatar}
              depth={1}
            />
          </div>
        ))
      )}
    </div>
  );
}

// ==================== PAINEIS DE EDICAO ====================

function EditMemberPanel({ member, sectors, allMembers, memberships, imageUrl, onClose, onSave }) {
  const [orgSectorId, setOrgSectorId] = useState(member.orgSectorId || '');
  const [managerId, setManagerId] = useState(member.managerId || '');
  const [secondaryIds, setSecondaryIds] = useState(
    () => memberships.filter(ms => ms.memberId === member.id).map(ms => ms.sectorId),
  );

  // Candidatos a chefe: do setor primario OU dos setores secundarios escolhidos
  const managerCandidates = useMemo(() => {
    const activeSectors = new Set([orgSectorId, ...secondaryIds].filter(Boolean));
    if (activeSectors.size === 0) return [];
    return allMembers.filter(m => {
      if (m.id === member.id) return false;
      if (activeSectors.has(m.orgSectorId)) return true;
      // tambem aceita chefe via setor secundario do candidato
      return memberships.some(ms => ms.memberId === m.id && activeSectors.has(ms.sectorId));
    });
  }, [orgSectorId, secondaryIds, allMembers, member.id, memberships]);

  const toggleSecondary = (sectorId) => {
    setSecondaryIds(prev =>
      prev.includes(sectorId) ? prev.filter(id => id !== sectorId) : [...prev, sectorId],
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/40" onClick={onClose}>
      <div
        className="w-full max-w-sm h-full bg-white dark:bg-slate-900 shadow-2xl overflow-y-auto border-l border-slate-200 dark:border-slate-800"
        onClick={e => e.stopPropagation()}
      >
        <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center gap-3">
          <Avatar name={member.name} color={member.color} imageUrl={imageUrl} size="lg" />
          <div className="flex-1 min-w-0">
            <h2 className="text-base font-semibold text-slate-800 dark:text-slate-100 truncate">{member.name}</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{member.role || 'Sem cargo'}</p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 p-1" aria-label="Fechar">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-5 space-y-4">
          <div>
            <label className="block text-[11px] font-medium text-slate-500 dark:text-slate-400 mb-1.5">Setor</label>
            <select
              value={orgSectorId}
              onChange={e => { setOrgSectorId(e.target.value); setManagerId(''); }}
              className="w-full px-2.5 py-1.5 rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-[13px] text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-fyness-primary/40 focus:border-fyness-primary"
            >
              <option value="">Liderança (sem setor)</option>
              {sectors.map(s => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-medium text-slate-500 dark:text-slate-400 mb-1.5">Chefe direto</label>
            <select
              value={managerId}
              onChange={e => setManagerId(e.target.value)}
              disabled={!orgSectorId}
              className="w-full px-2.5 py-1.5 rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-[13px] text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-fyness-primary/40 focus:border-fyness-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <option value="">Sem chefe direto</option>
              {managerCandidates.map(m => (
                <option key={m.id} value={m.id}>{m.name}{m.role ? ` — ${m.role}` : ''}</option>
              ))}
            </select>
            {!orgSectorId && (
              <p className="mt-1 text-[11px] text-slate-400">Defina um setor primeiro.</p>
            )}
          </div>

          <div>
            <label className="block text-[11px] font-medium text-slate-500 dark:text-slate-400 mb-1.5">Também atua em</label>
            <div className="space-y-1">
              {sectors.filter(s => s.id !== orgSectorId).map(s => {
                const checked = secondaryIds.includes(s.id);
                return (
                  <label
                    key={s.id}
                    className="flex items-center gap-2 px-2 py-1.5 rounded-md hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => toggleSecondary(s.id)}
                      className="rounded border-slate-300 text-fyness-primary focus:ring-1 focus:ring-fyness-primary/40"
                    />
                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: s.color }} />
                    <span className="text-[13px] text-slate-700 dark:text-slate-200">{s.name}</span>
                  </label>
                );
              })}
            </div>
            <p className="mt-1.5 text-[11px] text-slate-400">
              Apareceria nesses setores com borda tracejada ("Comp.").
            </p>
          </div>
        </div>

        <div className="px-5 py-3 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-2">
          <button onClick={onClose} className="px-3 py-1.5 text-[13px] text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md">Cancelar</button>
          <button
            onClick={() => onSave({
              orgSectorId: orgSectorId || null,
              managerId: managerId || null,
              secondaryIds,
            })}
            className="px-3.5 py-1.5 text-[13px] bg-fyness-primary text-white rounded-md hover:bg-fyness-secondary font-medium"
          >
            Salvar
          </button>
        </div>
      </div>
    </div>
  );
}

function EditSectorPanel({ sector, members, currentManagerIds, onClose, onSave, onDelete }) {
  const [name, setName] = useState(sector.name);
  const [color, setColor] = useState(sector.color);
  const [managerIds, setManagerIds] = useState(currentManagerIds);
  const sectorMembers = members.filter(m => m.orgSectorId === sector.id);

  const toggleManager = (id) => {
    setManagerIds(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id],
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/40" onClick={onClose}>
      <div
        className="w-full max-w-sm h-full bg-white dark:bg-slate-900 shadow-2xl overflow-y-auto border-l border-slate-200 dark:border-slate-800"
        onClick={e => e.stopPropagation()}
      >
        <div
          className="p-5 border-b border-slate-100 dark:border-slate-800"
          style={{ background: `linear-gradient(135deg, ${color}1a, transparent)` }}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: color }} />
              <h2 className="text-base font-semibold text-slate-800 dark:text-slate-100">Editar setor</h2>
            </div>
            <button onClick={onClose} className="text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 p-1" aria-label="Fechar">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <div className="p-5 space-y-4">
          <div>
            <label className="block text-[11px] font-medium text-slate-500 dark:text-slate-400 mb-1.5">Nome</label>
            <input
              value={name}
              onChange={e => setName(e.target.value)}
              className="w-full px-2.5 py-1.5 rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-[13px] text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-fyness-primary/40 focus:border-fyness-primary"
            />
          </div>

          <div>
            <label className="block text-[11px] font-medium text-slate-500 dark:text-slate-400 mb-1.5">Cor</label>
            <div className="flex gap-1.5 flex-wrap">
              {SECTOR_COLORS.map(c => (
                <button
                  key={c}
                  onClick={() => setColor(c)}
                  className={`w-7 h-7 rounded-full transition-transform hover:scale-110 ${c === color ? 'ring-2 ring-offset-1 ring-slate-400 dark:ring-offset-slate-900' : ''}`}
                  style={{ backgroundColor: c }}
                  aria-label={`Cor ${c}`}
                />
              ))}
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-medium text-slate-500 dark:text-slate-400 mb-1.5">
              Gestor(es) do setor
            </label>
            <div className="space-y-1 max-h-64 overflow-y-auto rounded-md border border-slate-200 dark:border-slate-700 p-1">
              {/* Membros do setor primeiro, depois os de outros setores */}
              {sectorMembers.length > 0 && (
                <>
                  <div className="px-2 pt-1 pb-0.5 text-[10px] uppercase tracking-wider text-slate-400">Deste setor</div>
                  {sectorMembers.map(m => {
                    const checked = managerIds.includes(m.id);
                    return (
                      <label key={m.id} className="flex items-center gap-2 px-2 py-1 rounded hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => toggleManager(m.id)}
                          className="rounded border-slate-300 text-fyness-primary focus:ring-1 focus:ring-fyness-primary/40"
                        />
                        <span className="text-[13px] text-slate-700 dark:text-slate-200">{m.name}{m.role ? ` — ${m.role}` : ''}</span>
                      </label>
                    );
                  })}
                </>
              )}
              {members.filter(m => m.orgSectorId !== sector.id).length > 0 && (
                <>
                  <div className="px-2 pt-1 pb-0.5 text-[10px] uppercase tracking-wider text-slate-400">Outros setores</div>
                  {members.filter(m => m.orgSectorId !== sector.id).map(m => {
                    const checked = managerIds.includes(m.id);
                    return (
                      <label key={m.id} className="flex items-center gap-2 px-2 py-1 rounded hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => toggleManager(m.id)}
                          className="rounded border-slate-300 text-fyness-primary focus:ring-1 focus:ring-fyness-primary/40"
                        />
                        <span className="text-[13px] text-slate-700 dark:text-slate-200">{m.name}{m.role ? ` — ${m.role}` : ''}</span>
                      </label>
                    );
                  })}
                </>
              )}
            </div>
            {managerIds.length > 1 && (
              <p className="mt-1 text-[11px] text-slate-400">
                {managerIds.length} co-gestores selecionados.
              </p>
            )}
          </div>
        </div>

        <div className="px-5 py-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <button
            onClick={onDelete}
            className="px-2.5 py-1.5 text-[13px] text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-md"
          >
            Excluir
          </button>
          <div className="flex gap-2">
            <button onClick={onClose} className="px-3 py-1.5 text-[13px] text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md">Cancelar</button>
            <button
              onClick={() => onSave({ name: name.trim(), color, managerIds })}
              disabled={!name.trim()}
              className="px-3.5 py-1.5 text-[13px] bg-fyness-primary text-white rounded-md hover:bg-fyness-secondary font-medium disabled:opacity-50"
            >
              Salvar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function NewSectorModal({ onClose, onCreate }) {
  const [name, setName] = useState('');
  const [color, setColor] = useState(SECTOR_COLORS[0]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4" onClick={onClose}>
      <div className="w-full max-w-xs bg-white dark:bg-slate-900 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden" onClick={e => e.stopPropagation()}>
        <div className="px-5 pt-4 pb-3 border-b border-slate-100 dark:border-slate-800 flex items-center gap-2" style={{ background: `linear-gradient(135deg, ${color}1a, transparent)` }}>
          <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: color }} />
          <h2 className="text-sm font-semibold text-slate-800 dark:text-slate-100">Novo setor</h2>
        </div>
        <div className="p-5 space-y-4">
          <div>
            <label className="block text-[11px] font-medium text-slate-500 mb-1.5">Nome</label>
            <input
              value={name}
              onChange={e => setName(e.target.value)}
              autoFocus
              placeholder="Ex: Operacoes"
              className="w-full px-2.5 py-1.5 rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-[13px] text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-fyness-primary/40 focus:border-fyness-primary"
            />
          </div>
          <div>
            <label className="block text-[11px] font-medium text-slate-500 mb-1.5">Cor</label>
            <div className="flex gap-1.5 flex-wrap">
              {SECTOR_COLORS.map(c => (
                <button
                  key={c}
                  onClick={() => setColor(c)}
                  className={`w-7 h-7 rounded-full transition-transform hover:scale-110 ${c === color ? 'ring-2 ring-offset-1 ring-slate-400 dark:ring-offset-slate-900' : ''}`}
                  style={{ backgroundColor: c }}
                  aria-label={`Cor ${c}`}
                />
              ))}
            </div>
          </div>
        </div>
        <div className="px-5 py-3 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-2">
          <button onClick={onClose} className="px-3 py-1.5 text-[13px] text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md">Cancelar</button>
          <button
            onClick={() => onCreate({ name: name.trim(), color })}
            disabled={!name.trim()}
            className="px-3.5 py-1.5 text-[13px] bg-fyness-primary text-white rounded-md hover:bg-fyness-secondary font-medium disabled:opacity-50"
          >
            Criar
          </button>
        </div>
      </div>
    </div>
  );
}

// ==================== PAGINA ====================

export default function OrgStructurePage() {
  const { data: members = [], isLoading: loadingMembers } = useTeamMembers();
  const { data: sectors = [], isLoading: loadingSectors } = useOrgSectors();
  const { data: memberships = [], isLoading: loadingMemberships } = useOrgSectorMemberships();
  const { data: sectorManagers = [], isLoading: loadingManagers } = useSectorManagers();

  const createSector = useCreateOrgSector();
  const updateSector = useUpdateOrgSector();
  const deleteSector = useDeleteOrgSector();
  const updateMemberOrg = useUpdateMemberOrgAssignment();
  const setSecondarySectors = useSetMemberSecondarySectors();
  const setSectorManagersMut = useSetSectorManagers();

  /** managerIds (ordenados por position) por setor */
  const managersBySector = useMemo(() => {
    const map = new Map();
    [...sectorManagers]
      .sort((a, b) => (a.position ?? 0) - (b.position ?? 0))
      .forEach(sm => {
        if (!map.has(sm.sectorId)) map.set(sm.sectorId, []);
        map.get(sm.sectorId).push(sm.memberId);
      });
    return map;
  }, [sectorManagers]);

  const [editingMember, setEditingMember] = useState(null);
  const [editingSector, setEditingSector] = useState(null);
  const [showNewSector, setShowNewSector] = useState(false);
  const [memberAvatars, setMemberAvatars] = useState({});

  // Carrega avatares de quem tem conta vinculada (mesmo padrao do SettingsPage)
  useEffect(() => {
    if (members.length === 0) return;
    const authIds = members.filter(m => m.authUserId).map(m => m.authUserId);
    if (authIds.length === 0) return;
    let cancelled = false;
    (async () => {
      const { data } = await supabase
        .from('user_profiles')
        .select('id, avatar')
        .in('id', authIds);
      if (cancelled || !data) return;
      const map = {};
      data.forEach(p => { if (p.avatar) map[p.id] = p.avatar; });
      setMemberAvatars(map);
    })();
    return () => { cancelled = true; };
  }, [members]);

  /** Resolve a URL do avatar de um membro (ou null se nao tiver). */
  const avatarOf = (member) => {
    if (!member?.authUserId) return null;
    return memberAvatars[member.authUserId] || null;
  };

  const leadership = useMemo(() => members.filter(m => !m.orgSectorId), [members]);

  const handleSaveMember = async ({ orgSectorId, managerId, secondaryIds }) => {
    if (!editingMember) return;
    const ok = await updateMemberOrg.mutateAsync({
      memberId: editingMember.id,
      patch: { orgSectorId, managerId },
      allMembers: members,
    });
    if (!ok) return;
    // Salva tambem os setores secundarios (independente do patch principal)
    if (Array.isArray(secondaryIds)) {
      // Garante que o setor primario nao apareca na lista secundaria
      const cleaned = secondaryIds.filter(id => id && id !== orgSectorId);
      await setSecondarySectors.mutateAsync({ memberId: editingMember.id, sectorIds: cleaned });
    }
    toast('Atribuicao atualizada.', 'success');
    setEditingMember(null);
  };

  const handleSaveSector = async ({ name, color, managerIds }) => {
    if (!editingSector) return;
    const result = await updateSector.mutateAsync({
      id: editingSector.id,
      updates: { name, color },
    });
    if (!result) return;
    if (Array.isArray(managerIds)) {
      await setSectorManagersMut.mutateAsync({
        sectorId: editingSector.id,
        memberIds: managerIds.filter(Boolean),
      });
    }
    toast('Setor atualizado.', 'success');
    setEditingSector(null);
  };

  const handleDeleteSector = async () => {
    if (!editingSector) return;
    const sectorMembers = members.filter(m => m.orgSectorId === editingSector.id);
    if (sectorMembers.length > 0) {
      if (!window.confirm(`Este setor tem ${sectorMembers.length} pessoa(s). Continuar?`)) return;
    }
    const ok = await deleteSector.mutateAsync(editingSector.id);
    if (ok) {
      toast('Setor removido.', 'success');
      setEditingSector(null);
    }
  };

  const handleCreateSector = async ({ name, color }) => {
    const result = await createSector.mutateAsync({ name, color });
    if (result) {
      toast('Setor criado.', 'success');
      setShowNewSector(false);
    }
  };

  if (loadingMembers || loadingSectors || loadingMemberships || loadingManagers) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="w-6 h-6 border-2 border-slate-300 border-t-fyness-primary rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-full bg-slate-50/60 dark:bg-slate-950">
      <style>{ORG_TREE_CSS}</style>

      <div className="max-w-[1600px] mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex items-end justify-between mb-6">
          <div>
            <h1 className="text-xl font-semibold tracking-tight text-slate-900 dark:text-slate-50">
              Estrutura Organizacional
            </h1>
            <p className="text-[13px] text-slate-500 dark:text-slate-400 mt-0.5">
              {members.length} pessoa{members.length === 1 ? '' : 's'} · {sectors.length} setor{sectors.length === 1 ? '' : 'es'}
            </p>
          </div>
          <button
            onClick={() => setShowNewSector(true)}
            className="px-3 py-1.5 bg-fyness-primary text-white rounded-md hover:bg-fyness-secondary text-[13px] font-medium flex items-center gap-1.5 shadow-sm"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
            </svg>
            Novo setor
          </button>
        </div>

        {/* Liderança em chips (fora da arvore — fica acima como "stakeholders") */}
        {leadership.length > 0 && (
          <div className="mb-4 flex items-center gap-2 flex-wrap justify-center">
            <span className="text-[10px] uppercase tracking-wider font-medium text-slate-400">Liderança</span>
            {leadership.map(m => (
              <button
                key={m.id}
                onClick={() => setEditingMember(m)}
                className="flex items-center gap-1.5 pl-1 pr-2.5 py-0.5 rounded-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-slate-300 transition-colors shadow-sm"
              >
                <Avatar name={m.name} color={m.color} imageUrl={avatarOf(m)} size="sm" />
                <span className="text-[12px] font-medium text-slate-700 dark:text-slate-200">{m.name}</span>
              </button>
            ))}
          </div>
        )}

        {/* Org chart — scroll horizontal se necessario */}
        <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-10 overflow-x-auto">
          <div className="min-w-max flex justify-center">
            {sectors.length === 0 ? (
              <div className="text-center py-12 text-[13px] text-slate-400">
                Nenhum setor cadastrado. Clique em "Novo setor" pra comecar.
              </div>
            ) : (
              <ul className="org-tree">
                <li>
                  <RootNode totalPeople={members.length} sectorsCount={sectors.length} />
                  <ul>
                    {sectors.map(sector => {
                      const primaryCount = members.filter(m => m.orgSectorId === sector.id).length;
                      const mgrIds = managersBySector.get(sector.id) || [];
                      return (
                        <li key={sector.id}>
                          <SectorNode
                            sector={sector}
                            count={primaryCount}
                            onClick={() => setEditingSector(sector)}
                          />
                          <SectorBody
                            sector={sector}
                            sectors={sectors}
                            members={members}
                            managerIdsForThisSector={mgrIds}
                            getAvatar={avatarOf}
                            onEditMember={setEditingMember}
                          />
                        </li>
                      );
                    })}
                    <li>
                      <AddSectorPlaceholder onClick={() => setShowNewSector(true)} />
                    </li>
                  </ul>
                </li>
              </ul>
            )}
          </div>
        </div>

        <p className="mt-4 text-center text-[11px] text-slate-400">
          Clique em qualquer card pra editar setor ou pessoa.
        </p>
      </div>

      {editingMember && (
        <EditMemberPanel
          member={editingMember}
          sectors={sectors}
          allMembers={members}
          memberships={memberships}
          imageUrl={avatarOf(editingMember)}
          onClose={() => setEditingMember(null)}
          onSave={handleSaveMember}
        />
      )}

      {editingSector && (
        <EditSectorPanel
          sector={editingSector}
          members={members}
          currentManagerIds={managersBySector.get(editingSector.id) || []}
          onClose={() => setEditingSector(null)}
          onSave={handleSaveSector}
          onDelete={handleDeleteSector}
        />
      )}

      {showNewSector && (
        <NewSectorModal
          onClose={() => setShowNewSector(false)}
          onCreate={handleCreateSector}
        />
      )}
    </div>
  );
}
