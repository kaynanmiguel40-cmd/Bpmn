/**
 * WorkQueue — a Fila: a tela que responde "o que eu faco agora".
 *
 * Ordem dos blocos, de cima pra baixo, e ela e deliberada:
 *   COMECE POR AQUI  uma tarefa so, pra nao ter que escolher
 *   ATRASADAS        a divida, agrupada por lead (5 toques parados do mesmo
 *                    lead sao UMA conversa a retomar, nao 5 itens)
 *   HOJE             manha e tarde
 *   LEADS PARADOS    lead aberto sem NENHUMA tarefa — o furo silencioso: ele
 *                    nao aparece em lugar nenhum justamente porque nao tem
 *                    tarefa, entao para de ser tocado sem ninguem notar
 *   DEPOIS           so contagem por dia; detalhe e no calendario
 *   FEITAS HOJE      colapsado, e o placar
 *
 * O que NAO esta aqui: evento do Google (nao tem check, nao e divida) e tarefa
 * atrasada ha mais de 7 dias (vai pro rodape como "toque frio" — uma faixa
 * vermelha que nunca zera vira mobilia e para de ser lida).
 */

import { useState, useMemo } from 'react';
import {
  AlertTriangle, Sun, Sunset, CheckCircle2, ChevronDown, ChevronRight,
  Inbox, RefreshCw, UserX, PauseCircle, ArrowRight, ArrowUpDown,
} from 'lucide-react';
import { QueueTaskRow } from './QueueTaskRow';
import { NowCard } from './NowCard';
import { useWorkQueue, useStalledLeads, useBatchPostpone, useQueueRebalance } from '../../hooks/useWorkQueue';

function SectionTitle({ icon: Icon, children, count, tone = 'default', right }) {
  const toneCls = tone === 'danger'
    ? 'text-rose-600 dark:text-rose-400'
    : 'text-slate-500 dark:text-slate-400';
  return (
    <div className="flex items-center gap-2 mb-2 mt-5 first:mt-0">
      {Icon && <Icon size={14} className={toneCls} />}
      <span className={`text-[12px] font-bold uppercase tracking-wider ${toneCls}`}>{children}</span>
      {count != null && (
        <span className={`text-[12px] font-bold tnum ${toneCls}`}>· {count}</span>
      )}
      <div className="flex-1 h-px bg-slate-200 dark:bg-slate-700" />
      {right}
    </div>
  );
}

export function WorkQueue({ onExecute, onPostpone, onOpenLead, onGoToCalendar, busy, visao, escopoLabel, membros = [] }) {
  const q = useWorkQueue(visao);
  // Vendo a fila de outra pessoa (ou a de todos), cada linha precisa dizer de
  // QUEM e a tarefa — senao da pra concluir a de outro sem perceber.
  const showOwner = !!(visao?.all || visao?.uid);
  const { data: stalled = [] } = useStalledLeads(visao?.memberId || null);
  const [showAllOverdue, setShowAllOverdue] = useState(false);
  const [showDone, setShowDone] = useState(false);
  const [plano, setPlano] = useState(null); // preview do adiar em lote
  const [rebal, setRebal] = useState(null);  // preview da reorganizacao
  const batch = useBatchPostpone();
  const rebalance = useQueueRebalance();
  // A cor mora em team_members, nao na atividade — a linha so guarda o nome.
  // A lista vem do PAI, que ja a carregou pro seletor: buscar de novo aqui
  // duplicaria a consulta e amarraria esta tela a mais uma fonte de dados.
  const corPorNome = useMemo(() => {
    const m = {};
    membros.forEach(x => { if (x.name) m[x.name.trim().toLowerCase()] = x.color; });
    return m;
  }, [membros]);
  const comCor = (t) => ({ ...t, assignedToColor: corPorNome[(t.assignedToName || '').trim().toLowerCase()] || null });

  if (q.isLoading) {
    return (
      <div className="space-y-2 p-1">
        {[0, 1, 2, 3].map(i => <div key={i} className="h-16 rounded-xl bg-slate-100 dark:bg-slate-800/60 animate-pulse" />)}
      </div>
    );
  }

  // Erro NUNCA pode parecer "nada pendente": a pessoa fecharia o dia achando
  // que zerou. Estado proprio, com saida.
  if (q.isError) {
    return (
      <div className="py-12 text-center">
        <AlertTriangle size={28} className="mx-auto text-rose-500 mb-2" />
        <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">
          Não consegui carregar suas tarefas.
        </p>
        <p className="text-[12px] text-slate-500 dark:text-slate-400 mb-3">
          Isso não quer dizer que você não tem nada pra fazer.
        </p>
        <button onClick={q.refetch}
          className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-semibold text-white bg-fyness-primary hover:bg-fyness-secondary">
          <RefreshCw size={14} /> Tentar de novo
        </button>
      </div>
    );
  }

  const gruposVisiveis = showAllOverdue ? q.overdueByLead : q.overdueByLead.slice(0, 5);
  const escondidos = q.overdueByLead.length - gruposVisiveis.length;
  // O "Comece por aqui" sai da lista pra nao aparecer duas vezes.
  const nowId = q.now?.id;

  return (
    <div className="max-w-3xl mx-auto pb-8">
      {/* Progresso do dia. Contador de divida ("3 de 12"), nao barra que enche:
          o que motiva e ver o que FALTA. */}
      <div className="flex items-center gap-3 mb-4 flex-wrap">
        <div className="flex-1 min-w-[120px]">
          <div className="h-2 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
            <div className="h-full bg-emerald-500 transition-all"
              style={{ width: `${q.doneCount + q.total > 0 ? (q.doneCount / (q.doneCount + q.total)) * 100 : 0}%` }} />
          </div>
        </div>
        <span className="text-sm font-bold text-slate-700 dark:text-slate-200 tnum">
          {q.doneCount} de {q.doneCount + q.total}
        </span>
        <span className="text-[12px] text-slate-500 dark:text-slate-400">{escopoLabel || 'Estas são só as suas tarefas.'}</span>
        {/* Reorganizar por prioridade: quem tem mais estrelas passa pra frente.
            Fica aqui em cima, junto do placar do dia, porque e uma decisao
            sobre o dia inteiro — nao sobre uma tarefa. */}
        <button
          onClick={() => rebalance.planejar.mutate(undefined, { onSuccess: (r) => setRebal(r) })}
          disabled={rebalance.planejar.isPending}
          title="Coloca as tarefas dos leads com mais estrelas nos horários mais cedo"
          className="shrink-0 inline-flex items-center gap-1 text-[12px] font-semibold text-slate-500 dark:text-slate-400 hover:text-fyness-primary disabled:opacity-50"
        >
          <ArrowUpDown size={12} /> {rebalance.planejar.isPending ? 'Calculando…' : 'Reorganizar por prioridade'}
        </button>
      </div>

      {rebal && (
        <div className="mb-4 rounded-xl border border-fyness-primary/30 bg-fyness-primary/5 p-3">
          {rebal.movidas.length === 0 ? (
            <>
              <div className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                A fila já está na ordem certa.
              </div>
              <p className="text-[12px] text-slate-500 dark:text-slate-400 mt-0.5">
                Nenhuma das {rebal.total} tarefas mudaria de horário.
              </p>
              <button onClick={() => setRebal(null)}
                className="mt-2 min-h-[44px] px-4 rounded-lg text-sm font-medium border border-slate-300 dark:border-slate-600 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700">
                Fechar
              </button>
            </>
          ) : (
            <>
              <div className="text-sm font-semibold text-slate-700 dark:text-slate-200 mb-1.5">
                {rebal.movidas.length} de {rebal.total} {rebal.movidas.length === 1 ? 'tarefa muda' : 'tarefas mudam'} de horário:
              </div>
              <div className="space-y-1 mb-2 max-h-48 overflow-y-auto">
                {rebal.movidas.slice(0, 12).map(m => (
                  <div key={m.id} className="flex items-center gap-2 text-[12px]">
                    <span className="tnum text-amber-600 dark:text-amber-400 shrink-0">
                      {new Date(m.de).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })}
                    </span>
                    <span className="text-slate-400">→</span>
                    <span className="tnum font-semibold text-emerald-600 dark:text-emerald-400 shrink-0">
                      {m.start.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })} {m.start.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                    <span className="text-slate-600 dark:text-slate-300 truncate">
                      {m.lead || m.titulo}
                    </span>
                    {m.priority > 0 && (
                      <span className="shrink-0 text-amber-500">{'★'.repeat(m.priority)}</span>
                    )}
                  </div>
                ))}
                {rebal.movidas.length > 12 && (
                  <div className="text-[12px] text-slate-500 dark:text-slate-400">
                    …e mais {rebal.movidas.length - 12}.
                  </div>
                )}
              </div>
              {rebal.fixas > 0 && (
                <p className="text-[12px] text-slate-500 dark:text-slate-400 mb-2">
                  {rebal.fixas} {rebal.fixas === 1 ? 'compromisso fica' : 'compromissos ficam'} no lugar —
                  reunião e visita têm hora combinada com o lead.
                </p>
              )}
              <div className="flex gap-2">
                <button
                  onClick={() => rebalance.aplicar.mutate({ movidas: rebal.movidas }, { onSuccess: () => setRebal(null) })}
                  disabled={rebalance.aplicar.isPending}
                  className="min-h-[44px] px-4 rounded-lg text-sm font-bold text-white bg-fyness-primary hover:bg-fyness-secondary disabled:opacity-50"
                >
                  {rebalance.aplicar.isPending ? 'Reorganizando…' : 'Confirmar'}
                </button>
                <button onClick={() => setRebal(null)}
                  className="min-h-[44px] px-4 rounded-lg text-sm font-medium border border-slate-300 dark:border-slate-600 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700">
                  Cancelar
                </button>
              </div>
            </>
          )}
        </div>
      )}

      {q.orphanCount > 0 && (
        <div className="flex items-center gap-2 mb-4 px-3 py-2 rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800/50 text-[12px] text-amber-800 dark:text-amber-300">
          <UserX size={14} className="shrink-0" />
          <span>{q.orphanCount} {q.orphanCount === 1 ? 'tarefa está' : 'tarefas estão'} sem responsável definido — {q.orphanCount === 1 ? 'ela não aparece' : 'elas não aparecem'} na fila de ninguém.</span>
        </div>
      )}

      {q.isEmpty ? (
        <div className="py-12 text-center">
          <CheckCircle2 size={36} className="mx-auto text-emerald-500 mb-3" />
          <p className="text-base font-bold text-slate-800 dark:text-slate-100">Fila limpa. Nada pendente.</p>
          {q.doneCount > 0 && (
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              Você fechou {q.doneCount} {q.doneCount === 1 ? 'tarefa' : 'tarefas'} hoje.
            </p>
          )}
        </div>
      ) : (
        <>
          {q.now && (
            <div className="mb-5">
              <NowCard task={q.now} onExecute={onExecute} onPostpone={onPostpone} onOpenLead={onOpenLead} busy={busy} />
            </div>
          )}

          {q.overdueCount > 0 && (
            <>
              <SectionTitle icon={AlertTriangle} count={q.overdueCount} tone="danger"
                right={
                  <button
                    onClick={() => {
                      const tasks = q.overdueByLead.flatMap(g => g.tasks);
                      batch.planejar.mutate({ tasks }, { onSuccess: (p) => setPlano(p) });
                    }}
                    disabled={batch.planejar.isPending}
                    className="shrink-0 text-[12px] font-semibold text-slate-500 dark:text-slate-400 hover:text-fyness-primary disabled:opacity-50"
                  >
                    {batch.planejar.isPending ? 'Calculando…' : 'Adiar todas'}
                  </button>
                }
              >Atrasadas</SectionTitle>

              {/* Preview OBRIGATORIO antes de gravar: 18 atrasadas nao cabem
                  "amanha" (o dia tem 16 slots e parte ja esta ocupada). Sem ver
                  isso, ela adia esperando limpar a fila e so descobre depois
                  que empurrou trabalho pra semana que vem. */}
              {plano && (
                <div className="mb-3 rounded-xl border border-fyness-primary/30 bg-fyness-primary/5 p-3">
                  <div className="text-sm font-semibold text-slate-700 dark:text-slate-200 mb-1.5">
                    Onde essas {plano.plano.length} tarefas vão caber:
                  </div>
                  <div className="text-[13px] text-slate-600 dark:text-slate-300 mb-2">
                    {plano.porDia.map((d, i) => (
                      <span key={i}>
                        {i > 0 && ', '}
                        <strong className="tnum">{d.count}</strong>{' '}
                        {d.date.toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: '2-digit' })}
                      </span>
                    ))}
                    .
                  </div>
                  {plano.naoCoube > 0 && (
                    <div className="text-[12px] text-amber-700 dark:text-amber-300 mb-2">
                      {plano.naoCoube} não couberam nos próximos dias e vão continuar atrasadas.
                    </div>
                  )}
                  <div className="flex gap-2">
                    <button
                      onClick={() => batch.aplicar.mutate({ plano: plano.plano }, { onSuccess: () => setPlano(null) })}
                      disabled={batch.aplicar.isPending}
                      className="min-h-[44px] px-4 rounded-lg text-sm font-bold text-white bg-fyness-primary hover:bg-fyness-secondary disabled:opacity-50"
                    >
                      {batch.aplicar.isPending ? 'Adiando…' : 'Confirmar'}
                    </button>
                    <button
                      onClick={() => setPlano(null)}
                      className="min-h-[44px] px-4 rounded-lg text-sm font-medium border border-slate-300 dark:border-slate-600 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700"
                    >
                      Cancelar
                    </button>
                  </div>
                </div>
              )}
              <div className="space-y-3">
                {gruposVisiveis.map(g => {
                  const tarefas = g.tasks.filter(t => t.id !== nowId);
                  if (tarefas.length === 0) return null;
                  return (
                    <div key={g.key}>
                      <div className="flex items-center gap-2 mb-1 px-0.5">
                        <span className="text-[13px] font-bold text-slate-700 dark:text-slate-200 truncate">
                          {g.semLead ? 'Sem lead vinculado' : (g.leadName || 'Sem lead vinculado')}
                        </span>
                        {/* "toque parado" e vocabulario de cadencia — nao cabe
                            pra tarefa avulsa, que nao e toque em lead nenhum. */}
                        <span className="text-[12px] text-slate-500 dark:text-slate-400 shrink-0">
                          · {g.tasks.length} {g.semLead
                            ? (g.tasks.length === 1 ? 'tarefa' : 'tarefas')
                            : (g.tasks.length === 1 ? 'toque parado' : 'toques parados')}
                        </span>
                        {g.dealId && (
                          <button onClick={() => onOpenLead?.(g.dealId)}
                            className="ml-auto shrink-0 text-[12px] font-semibold text-fyness-primary hover:underline">
                            Abrir lead →
                          </button>
                        )}
                      </div>
                      <div className="space-y-1.5">
                        {tarefas.map(t => (
                          <QueueTaskRow key={t.id} task={comCor(t)} onExecute={onExecute} onPostpone={onPostpone} showOwner={showOwner} busy={busy} />
                        ))}
                      </div>
                    </div>
                  );
                })}
                {escondidos > 0 && (
                  <button onClick={() => setShowAllOverdue(true)}
                    className="w-full py-2 text-[12px] font-semibold text-slate-500 dark:text-slate-400 hover:text-fyness-primary">
                    ▾ ver os outros {escondidos} leads atrasados
                  </button>
                )}
              </div>
            </>
          )}

          {q.todayCount > 0 && (
            <>
              <SectionTitle count={q.todayCount}>Hoje</SectionTitle>
              {q.manha.filter(t => t.id !== nowId).length > 0 && (
                <>
                  <div className="flex items-center gap-1.5 mb-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    <Sun size={12} /> Manhã
                  </div>
                  <div className="space-y-1.5 mb-3">
                    {q.manha.filter(t => t.id !== nowId).map(t => (
                      <QueueTaskRow key={t.id} task={comCor(t)} onExecute={onExecute} onPostpone={onPostpone} showTime showOwner={showOwner} busy={busy} />
                    ))}
                  </div>
                </>
              )}
              {q.tarde.filter(t => t.id !== nowId).length > 0 && (
                <>
                  <div className="flex items-center gap-1.5 mb-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    <Sunset size={12} /> Tarde
                  </div>
                  <div className="space-y-1.5">
                    {q.tarde.filter(t => t.id !== nowId).map(t => (
                      <QueueTaskRow key={t.id} task={comCor(t)} onExecute={onExecute} onPostpone={onPostpone} showTime showOwner={showOwner} busy={busy} />
                    ))}
                  </div>
                </>
              )}
            </>
          )}
        </>
      )}

      {stalled.length > 0 && (
        <>
          <SectionTitle icon={PauseCircle} count={stalled.length}>Leads parados</SectionTitle>
          <p className="text-[12px] text-slate-500 dark:text-slate-400 -mt-1 mb-2">
            Sem nenhum contato marcado. Eles param de ser tocados.
          </p>
          <div className="space-y-1.5">
            {stalled.slice(0, 8).map(l => (
              <div key={l.dealId}
                className="flex items-center gap-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white/70 dark:bg-slate-800/40 px-3 py-2">
                <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: l.stageColor || '#94a3b8' }} />
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold text-slate-800 dark:text-slate-100 truncate">{l.leadName}</div>
                  <div className="text-[12px] text-slate-500 dark:text-slate-400 truncate">
                    {l.stageName} · sem contato há {l.dias} {l.dias === 1 ? 'dia' : 'dias'}
                  </div>
                </div>
                <button onClick={() => onOpenLead?.(l.dealId)}
                  className="shrink-0 px-3 py-2 min-h-[44px] rounded-lg text-[12px] font-semibold border border-slate-300 dark:border-slate-600 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700">
                  Abrir lead
                </button>
              </div>
            ))}
          </div>
        </>
      )}

      {Object.keys(q.upcomingByDay).length > 0 && (
        <>
          <SectionTitle icon={ArrowRight}
            right={
              <button onClick={onGoToCalendar}
                className="shrink-0 text-[12px] font-semibold text-fyness-primary hover:underline">
                Ver no calendário →
              </button>
            }>
            Depois
          </SectionTitle>
          <div className="flex flex-wrap gap-x-3 gap-y-1 text-[13px] text-slate-500 dark:text-slate-400">
            {Object.entries(q.upcomingByDay).map(([k, n]) => {
              const [y, m, d] = k.split('-').map(Number);
              const date = new Date(y, m - 1, d);
              return (
                <span key={k}>
                  {date.toLocaleDateString('pt-BR', { weekday: 'short', day: '2-digit' })}{' '}
                  <strong className="text-slate-700 dark:text-slate-200 tnum">{n}</strong>
                </span>
              );
            })}
          </div>
        </>
      )}

      {q.doneToday.length > 0 && (
        <>
          <button onClick={() => setShowDone(v => !v)} className="w-full">
            <SectionTitle icon={showDone ? ChevronDown : ChevronRight} count={q.doneToday.length}>
              Feitas hoje
            </SectionTitle>
          </button>
          {showDone && (
            <div className="space-y-1">
              {q.doneToday.map(t => (
                <div key={t.id} className="flex items-center gap-2 px-2.5 py-1.5 text-[13px] text-slate-500 dark:text-slate-400">
                  <CheckCircle2 size={13} className="text-emerald-500 shrink-0" />
                  <span className="truncate line-through">{t.leadName || t.title}</span>
                  {t.deliveryReport && <span className="truncate text-[12px]">— {t.deliveryReport}</span>}
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {q.coldCount > 0 && (
        <div className="mt-6 pt-3 border-t border-slate-200 dark:border-slate-700 flex items-center gap-2 text-[12px] text-slate-400">
          <Inbox size={13} className="shrink-0" />
          <span>
            <strong className="tnum">{q.coldCount}</strong> {q.coldCount === 1 ? 'toque frio' : 'toques frios'} —
            atrasados há mais de {q.coldAfterDays} dias. Costumam estar mortos.
          </span>
        </div>
      )}
    </div>
  );
}

export default WorkQueue;
