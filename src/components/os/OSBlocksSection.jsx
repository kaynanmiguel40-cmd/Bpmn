import { useMemo, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useOSBlocks, useTeamMembers } from '../../hooks/queries';
import {
  createBlock,
  updateBlock,
  deleteBlock,
  setBlockStatus,
  ensureBlocksForOrder,
} from '../../lib/osBlocksService';
import {
  signOrder,
  unsignOrder,
  getSignaturesByOrder,
} from '../../lib/osSignaturesService';
import { useEffect } from 'react';
import { notifyOSCompleted } from '../../lib/notificationTriggers';

const STATUS_LABEL = { todo: 'A fazer', doing: 'Fazendo', done: 'Feito' };
const STATUS_NEXT = { todo: 'doing', doing: 'done', done: 'todo' };
const STATUS_STYLE = {
  todo:  'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-600',
  doing: 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-700',
  done:  'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-700',
};

function formatMinutes(min) {
  if (!min || min <= 0) return '';
  const h = Math.floor(min / 60);
  const m = min % 60;
  if (h > 0 && m > 0) return `${h}h${String(m).padStart(2, '0')}`;
  if (h > 0) return `${h}h`;
  return `${m}min`;
}

export default function OSBlocksSection({ order, currentUserId, currentUserName, canEdit }) {
  const qc = useQueryClient();
  const { data: allBlocks = [] } = useOSBlocks();
  const { data: teamMembers = [] } = useTeamMembers();
  const [signatures, setSignatures] = useState([]);
  const [loadingSig, setLoadingSig] = useState(false);

  // DEPRECATED: a partir da migration 039, o "bloco" passou a ser o GRUPO
  // do checklist (com seu proprio assignee). A tabela os_blocks e esta secao
  // ficam desabilitadas — visiveis apenas se o operador setar uma flag de
  // diagnostico. Mantemos o componente pro caso de precisar inspecionar dados
  // legados, mas a UI normal nao renderiza.
  const isTeam = order?.mode === 'team';
  const SHOW_LEGACY_BLOCKS = false;

  const blocks = useMemo(
    () => allBlocks
      .filter(b => b.orderId === order.id)
      .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0)),
    [allBlocks, order.id]
  );

  // Migracao silenciosa: garante 1 bloco minimo para O.S. legadas
  useEffect(() => {
    let alive = true;
    (async () => {
      const local = allBlocks.filter(b => b.orderId === order.id);
      if (local.length === 0) {
        await ensureBlocksForOrder(order);
        if (alive) qc.invalidateQueries({ queryKey: ['osBlocks'] });
      }
    })();
    return () => { alive = false; };
  }, [order.id]); // eslint-disable-line react-hooks/exhaustive-deps

  // Carregar assinaturas
  useEffect(() => {
    let alive = true;
    (async () => {
      setLoadingSig(true);
      const list = await getSignaturesByOrder(order.id);
      if (alive) {
        setSignatures(list);
        setLoadingSig(false);
      }
    })();
    return () => { alive = false; };
  }, [order.id]);

  // Form de novo bloco
  const [adding, setAdding] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newAssigneeId, setNewAssigneeId] = useState('');
  const [newHours, setNewHours] = useState('');
  const [newMinutes, setNewMinutes] = useState('');
  const [newDueAt, setNewDueAt] = useState('');

  const allDone = blocks.length > 0 && blocks.every(b => b.status === 'done');
  const userSigned = !!signatures.find(s => s.userId === currentUserId);

  // Lista de participantes unicos (assignee_id) com bloco atribuido
  const participants = useMemo(() => {
    const seen = new Set();
    const out = [];
    for (const b of blocks) {
      const key = b.assigneeId || `name:${b.assigneeName}`;
      if (seen.has(key)) continue;
      seen.add(key);
      out.push({ id: b.assigneeId, name: b.assigneeName });
    }
    return out;
  }, [blocks]);

  const allParticipantsSigned =
    participants.length > 0 &&
    participants.every(p => signatures.some(s => (p.id ? s.userId === p.id : s.userName === p.name)));

  const reload = () => qc.invalidateQueries({ queryKey: ['osBlocks'] });

  const handleAdd = async () => {
    if (!newTitle.trim()) return;
    const member = teamMembers.find(m => m.id === newAssigneeId);
    const minutes = (parseInt(newHours, 10) || 0) * 60 + (parseInt(newMinutes, 10) || 0);
    // datetime-local "YYYY-MM-DDTHH:mm" -> ISO UTC explicito (igual osService.normalizeTimestamps)
    const dueAt = newDueAt && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(newDueAt)
      ? `${newDueAt}:00Z`
      : null;
    await createBlock({
      orderId: order.id,
      title: newTitle.trim(),
      // assignee_id e UUID de auth.users — usar authUserId, nunca o id local "member_<ts>"
      assigneeId: member?.authUserId || null,
      assigneeName: member?.name || '',
      estimatedMinutes: minutes,
      dueAt,
      status: 'todo',
      sortOrder: blocks.length,
    });
    setNewTitle('');
    setNewAssigneeId('');
    setNewHours('');
    setNewMinutes('');
    setNewDueAt('');
    setAdding(false);
    reload();
  };

  const handleChangeAssignee = async (block, newId) => {
    const member = teamMembers.find(m => m.id === newId);
    await updateBlock(block.id, {
      assigneeId: member?.authUserId || null,
      assigneeName: member?.name || '',
    });
    reload();
  };

  const handleEditDueAt = async (block) => {
    // datetime-local quer "YYYY-MM-DDTHH:mm" — converte ISO atual pra esse formato
    const cur = block.dueAt ? new Date(block.dueAt) : null;
    const pad = (n) => String(n).padStart(2, '0');
    const curStr = cur && !isNaN(cur)
      ? `${cur.getUTCFullYear()}-${pad(cur.getUTCMonth() + 1)}-${pad(cur.getUTCDate())}T${pad(cur.getUTCHours())}:${pad(cur.getUTCMinutes())}`
      : '';
    const input = prompt(
      'Prazo de entrega (formato: YYYY-MM-DDTHH:mm). Vazio = sem prazo proprio.',
      curStr
    );
    if (input == null) return;
    const trimmed = input.trim();
    const next = trimmed === ''
      ? null
      : (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(trimmed) ? `${trimmed}:00Z` : null);
    if (trimmed !== '' && next === null) {
      alert('Formato invalido. Use AAAA-MM-DDThh:mm (ex: 2026-05-10T18:00).');
      return;
    }
    await updateBlock(block.id, { dueAt: next });
    reload();
  };

  const handleToggleStatus = async (block) => {
    const next = STATUS_NEXT[block.status] || 'todo';
    await setBlockStatus(block.id, next);
    reload();
  };

  const handleDelete = async (id) => {
    if (!confirm('Remover este bloco?')) return;
    await deleteBlock(id);
    reload();
  };

  const handleEditMinutes = async (block) => {
    const cur = block.estimatedMinutes || 0;
    const input = prompt(
      'Tempo previsto (formato: 1h30 ou 90)',
      formatMinutes(cur) || '0'
    );
    if (input == null) return;
    const m = String(input).trim().match(/^(?:(\d+)h)?\s*(\d+)?(?:min)?$/i);
    if (!m) {
      alert('Formato invalido. Use "1h30", "2h", "45min" ou apenas "90"');
      return;
    }
    const minutes = (parseInt(m[1], 10) || 0) * 60 + (parseInt(m[2], 10) || 0);
    await updateBlock(block.id, { estimatedMinutes: minutes });
    reload();
  };

  const handleSign = async () => {
    if (userSigned) {
      await unsignOrder({ orderId: order.id, userId: currentUserId });
    } else {
      await signOrder({ orderId: order.id, userId: currentUserId, userName: currentUserName });
    }
    const list = await getSignaturesByOrder(order.id);
    setSignatures(list);

    // Se esta assinatura fechou a O.S. team (todos done + todos assinaram),
    // dispara notifyOSCompleted uma unica vez.
    const justClosed =
      allDone &&
      participants.length > 0 &&
      participants.every(p =>
        list.some(s => (p.id ? s.userId === p.id : s.userName === p.name))
      );
    if (justClosed) {
      try { await notifyOSCompleted(order, teamMembers, currentUserName, currentUserId); }
      catch (e) { console.warn('[notifyOSCompleted] team close:', e?.message); }
    }
  };

  const totalMinutes = blocks.reduce((s, b) => s + (b.estimatedMinutes || 0), 0);

  if (!isTeam || !SHOW_LEGACY_BLOCKS) return null;

  return (
    <div className="p-6 border-b border-slate-200 dark:border-slate-700">
      <div className="flex items-center justify-between mb-3">
        <label className="text-[10px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
          Tarefas e Responsaveis
        </label>
        <div className="flex items-center gap-3 text-[11px] text-slate-500 dark:text-slate-400">
          <span>{blocks.length} {blocks.length === 1 ? 'bloco' : 'blocos'}</span>
          {totalMinutes > 0 && <span>· Total previsto: {formatMinutes(totalMinutes)}</span>}
        </div>
      </div>

      {/* Lista de blocos */}
      <div className="space-y-2">
        {blocks.map((b) => (
          <div
            key={b.id}
            className="flex items-center gap-3 p-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
          >
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-sm font-semibold text-slate-800 dark:text-slate-100">{b.title}</span>
                {canEdit ? (
                  <select
                    value={b.assigneeId || ''}
                    onChange={(e) => handleChangeAssignee(b, e.target.value)}
                    className="text-xs text-purple-500 font-medium bg-transparent border-0 focus:outline-none focus:ring-1 focus:ring-purple-300 rounded px-1"
                    title="Trocar responsavel"
                  >
                    <option value="">— sem responsavel —</option>
                    {teamMembers.map(m => (
                      <option key={m.id} value={m.id}>{m.name}</option>
                    ))}
                  </select>
                ) : (
                  b.assigneeName && (
                    <span className="text-xs text-purple-500 font-medium">{b.assigneeName}</span>
                  )
                )}
              </div>
              <div className="flex items-center gap-3 mt-0.5 flex-wrap">
                {canEdit ? (
                  <button
                    onClick={() => handleEditMinutes(b)}
                    className="text-xs text-slate-400 dark:text-slate-500 hover:text-fyness-primary"
                  >
                    Tempo previsto: {formatMinutes(b.estimatedMinutes) || '—'}
                  </button>
                ) : (
                  <span className="text-xs text-slate-400 dark:text-slate-500">
                    Tempo previsto: {formatMinutes(b.estimatedMinutes) || '—'}
                  </span>
                )}
                {(() => {
                  const due = b.dueAt ? new Date(b.dueAt) : null;
                  const overdue = due && b.status !== 'done' && due.getTime() < Date.now();
                  const label = due
                    ? due.toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })
                    : '—';
                  const cls = overdue
                    ? 'text-xs text-red-600 dark:text-red-400 font-medium'
                    : 'text-xs text-slate-400 dark:text-slate-500';
                  return canEdit ? (
                    <button onClick={() => handleEditDueAt(b)} className={`${cls} hover:text-fyness-primary`}>
                      Prazo: {label}{overdue ? ' (atrasado)' : ''}
                    </button>
                  ) : (
                    <span className={cls}>Prazo: {label}{overdue ? ' (atrasado)' : ''}</span>
                  );
                })()}
              </div>
            </div>
            <button
              onClick={() => canEdit && handleToggleStatus(b)}
              disabled={!canEdit}
              className={`text-[10px] font-bold uppercase tracking-wide px-2 py-1 rounded-full border ${STATUS_STYLE[b.status]} ${canEdit ? 'hover:opacity-80 cursor-pointer' : 'cursor-default'}`}
            >
              {STATUS_LABEL[b.status]}
            </button>
            {canEdit && (
              <button
                onClick={() => handleDelete(b.id)}
                className="text-slate-300 dark:text-slate-600 hover:text-red-500 transition-colors"
                title="Remover bloco"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
        ))}

        {blocks.length === 0 && (
          <div className="text-sm text-slate-400 dark:text-slate-500 italic text-center py-4">
            Nenhum bloco ainda. Adicione tarefas e responsaveis abaixo.
          </div>
        )}
      </div>

      {/* Form adicionar bloco */}
      {canEdit && !adding && (
        <button
          onClick={() => setAdding(true)}
          className="mt-3 px-3 py-1.5 text-xs border border-dashed border-slate-300 dark:border-slate-600 text-slate-500 dark:text-slate-400 rounded-lg hover:border-fyness-primary hover:text-fyness-primary transition-colors"
        >
          + Adicionar bloco
        </button>
      )}

      {canEdit && adding && (
        <div className="mt-3 p-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 space-y-2">
          <input
            type="text"
            placeholder="Titulo do bloco (ex: Marketing)"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            className="w-full px-3 py-1.5 text-sm border border-slate-200 dark:border-slate-600 rounded bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200"
            autoFocus
          />
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            <select
              value={newAssigneeId}
              onChange={(e) => setNewAssigneeId(e.target.value)}
              className="px-3 py-1.5 text-sm border border-slate-200 dark:border-slate-600 rounded bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200"
            >
              <option value="">Responsavel...</option>
              {teamMembers.map(m => (
                <option key={m.id} value={m.id}>{m.name}</option>
              ))}
            </select>
            <input
              type="number"
              min="0"
              placeholder="Horas"
              value={newHours}
              onChange={(e) => setNewHours(e.target.value)}
              className="px-3 py-1.5 text-sm border border-slate-200 dark:border-slate-600 rounded bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200"
            />
            <input
              type="number"
              min="0"
              max="59"
              placeholder="Minutos"
              value={newMinutes}
              onChange={(e) => setNewMinutes(e.target.value)}
              className="px-3 py-1.5 text-sm border border-slate-200 dark:border-slate-600 rounded bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200"
            />
          </div>
          <div>
            <label className="text-[11px] text-slate-500 dark:text-slate-400 block mb-1">
              Prazo de entrega (opcional)
            </label>
            <input
              type="datetime-local"
              value={newDueAt}
              onChange={(e) => setNewDueAt(e.target.value)}
              className="w-full px-3 py-1.5 text-sm border border-slate-200 dark:border-slate-600 rounded bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200"
            />
          </div>
          <div className="flex items-center gap-2 justify-end">
            <button
              onClick={() => { setAdding(false); setNewTitle(''); setNewDueAt(''); }}
              className="px-3 py-1.5 text-xs text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
            >
              Cancelar
            </button>
            <button
              onClick={handleAdd}
              disabled={!newTitle.trim()}
              className="px-3 py-1.5 text-xs bg-fyness-primary text-white rounded-lg hover:bg-fyness-secondary disabled:opacity-50"
            >
              Adicionar
            </button>
          </div>
        </div>
      )}

      {/* Assinaturas */}
      {blocks.length > 0 && (
        <div className="mt-5 pt-4 border-t border-slate-200 dark:border-slate-700">
          <div className="flex items-center justify-between mb-2">
            <label className="text-[10px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
              Assinaturas
            </label>
            <span className="text-[11px] text-slate-500 dark:text-slate-400">
              {signatures.length} de {participants.length} {participants.length === 1 ? 'participante' : 'participantes'}
            </span>
          </div>

          {!loadingSig && signatures.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-3">
              {signatures.map(s => (
                <span
                  key={s.id}
                  className="inline-flex items-center gap-1 px-2 py-1 text-xs rounded-full bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300"
                >
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  {s.userName}
                </span>
              ))}
            </div>
          )}

          <div className="flex items-center gap-2">
            <button
              onClick={handleSign}
              disabled={!allDone || !currentUserName}
              title={!allDone ? 'Disponivel quando todos os blocos forem concluidos' : ''}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                userSigned
                  ? 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
                  : 'bg-fyness-primary text-white hover:bg-fyness-secondary disabled:bg-slate-300 dark:disabled:bg-slate-600 disabled:cursor-not-allowed'
              }`}
            >
              {userSigned ? 'Desfazer assinatura' : 'Assinar O.S.'}
            </button>
            {allDone && allParticipantsSigned && (
              <span className="text-sm text-emerald-600 dark:text-emerald-400 font-medium">
                ✓ Todos assinaram
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
