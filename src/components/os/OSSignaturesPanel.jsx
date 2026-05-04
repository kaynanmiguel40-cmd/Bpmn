/**
 * OSSignaturesPanel — Painel de assinaturas + entregas em team.
 *
 * 3 estados por participante:
 *   1. Nao pegou               -> "Aguardando assinatura" + botao "Pegar O.S." (so o proprio user)
 *   2. Pegou mas nao entregou  -> nome em cursiva + frase cartorial + botao "Entregar O.S." (so o proprio user)
 *   3. Entregou                -> nome em cursiva + frase + selo "Entregue em DD/MM HH:mm"
 *
 * Quando TODOS entregam, dispara onAllDelivered() — pra marcar a O.S. como done.
 */

import { useEffect, useState, useMemo } from 'react';
import { getSignaturesByOrder } from '../../lib/osSignaturesService';
import { namesMatch } from '../../lib/kpiUtils';
import { formatSignatureDateTime } from '../../lib/formatters';

export default function OSSignaturesPanel({
  order,
  currentUserId = null,
  currentUserName = '',
  onPick,           // (participant) => Promise<void>
  onDeliver,        // (participant) => Promise<void>
  onAllDelivered,   // () => Promise<void>  — dispara quando todos entregaram
}) {
  const [signatures, setSignatures] = useState([]);
  const [busy, setBusy] = useState(null);

  const isTeam = order?.mode === 'team';
  const participants = useMemo(
    () => Array.isArray(order?.participants) ? order.participants : [],
    [order?.participants]
  );

  const reloadSignatures = async () => {
    if (!order?.id) return [];
    const list = await getSignaturesByOrder(order.id);
    setSignatures(list);
    return list;
  };

  useEffect(() => {
    if (!order?.id || !isTeam) return;
    let alive = true;
    (async () => {
      const list = await getSignaturesByOrder(order.id);
      if (alive) setSignatures(list);
    })();
    return () => { alive = false; };
  }, [order?.id, isTeam, order?.updatedAt]);

  if (!isTeam || participants.length === 0) return null;

  const findSignature = (p) =>
    signatures.find(s => (p.id ? s.userId === p.id : namesMatch(s.userName, p.name)));

  const isMe = (p) =>
    (currentUserId && p.id === currentUserId) ||
    (currentUserName && namesMatch(p.name, currentUserName));

  const keyOf = (p) => (p.id || '') + '|' + p.name;

  const handlePick = async (p) => {
    setBusy(keyOf(p));
    try {
      await onPick?.(p);
      await reloadSignatures();
    } finally {
      setBusy(null);
    }
  };

  const handleDeliver = async (p) => {
    setBusy(keyOf(p));
    try {
      await onDeliver?.(p);
      const list = await reloadSignatures();
      // Verifica se todos entregaram
      const allDelivered =
        participants.length > 0 &&
        participants.every(pp => {
          const s = list.find(s => (pp.id ? s.userId === pp.id : namesMatch(s.userName, pp.name)));
          return s?.deliveredAt;
        });
      if (allDelivered) await onAllDelivered?.();
    } finally {
      setBusy(null);
    }
  };

  return (
    <div className="px-12 py-10 border-b border-slate-200 dark:border-slate-700">
      <p className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-8">
        Assinaturas
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-10">
        {participants.map((p) => {
          const sig = findSignature(p);
          const me = isMe(p);
          const k = keyOf(p);
          const isBusy = busy === k;

          const hasSigned = !!sig;
          const hasDelivered = !!sig?.deliveredAt;

          return (
            <div key={k}>
              <div className="text-center">
                <div className="border-b-2 border-slate-400 dark:border-slate-500 pb-1 mb-2 h-20 flex items-end justify-center">
                  {hasSigned ? (
                    <span
                      className="text-slate-700 dark:text-white"
                      style={{ fontFamily: "'Milton One', cursive", fontSize: '1.75rem', lineHeight: '1.2' }}
                    >
                      {p.name}
                    </span>
                  ) : (
                    <span className="text-xs text-slate-400 dark:text-slate-500 italic">
                      Aguardando assinatura
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold uppercase tracking-wider mt-1">
                  Participante
                </p>
              </div>

              {hasSigned ? (
                <>
                  <p className="text-[9px] text-slate-400 dark:text-slate-500 leading-relaxed mt-3 text-justify">
                    Documento assinado por <strong className="text-slate-500">{p.name}</strong>.
                    {' '}Assinou e esta de acordo com este documento as{' '}
                    <strong className="text-slate-500">{formatSignatureDateTime(sig.signedAt)}</strong>.
                  </p>
                  {hasDelivered ? (
                    <p className="text-[9px] text-emerald-600 dark:text-emerald-400 leading-relaxed mt-2 text-justify">
                      <strong>Entregou</strong> em{' '}
                      <strong>{formatSignatureDateTime(sig.deliveredAt)}</strong>.
                    </p>
                  ) : me ? (
                    <div className="mt-3 flex justify-center">
                      <button
                        type="button"
                        onClick={() => handleDeliver(p)}
                        disabled={isBusy}
                        className="px-4 py-1.5 text-xs font-medium rounded-md bg-emerald-600 text-white hover:bg-emerald-700 transition-colors disabled:opacity-60"
                      >
                        {isBusy ? 'Entregando...' : 'Entregar O.S.'}
                      </button>
                    </div>
                  ) : (
                    <p className="text-[10px] text-slate-400 dark:text-slate-500 italic mt-2 text-center">
                      Aguardando entrega
                    </p>
                  )}
                </>
              ) : me ? (
                <div className="mt-3 flex justify-center">
                  <button
                    type="button"
                    onClick={() => handlePick(p)}
                    disabled={isBusy}
                    className="px-4 py-1.5 text-xs font-medium rounded-md bg-fyness-primary text-white hover:bg-fyness-secondary transition-colors disabled:opacity-60"
                  >
                    {isBusy ? 'Pegando...' : 'Pegar O.S.'}
                  </button>
                </div>
              ) : (
                <p className="text-[10px] text-slate-400 dark:text-slate-500 italic mt-3 text-center">
                  Aguardando {p.name} pegar a O.S.
                </p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
