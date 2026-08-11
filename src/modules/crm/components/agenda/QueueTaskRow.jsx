/**
 * QueueTaskRow — uma tarefa na fila.
 *
 * A linha responde, nesta ordem: de que canal e (icone), o que fazer com quem
 * (manchete), ha quanto tempo esta parada, e os dois botoes. Nada de hover:
 * tudo que se pode fazer esta visivel o tempo todo, inclusive no celular.
 */

import { Phone, MessageCircle, Mail, Users, MapPin, CheckSquare, ArrowRight, UserCheck } from 'lucide-react';
import { stepChannel } from '../../services/crmScheduling';
import { taskHeadline, taskDetail, relativeDayLabel, isOverdue, formatWhen } from '../../utils/stepLabel';
import { PostponeMenu } from './PostponeMenu';

const ICON = {
  call: Phone, message: MessageCircle, email: Mail,
  meeting: Users, visit: MapPin, task: CheckSquare, follow_up: ArrowRight,
};
const TONE = {
  call: 'bg-sky-100 text-sky-700 dark:bg-sky-900/40 dark:text-sky-300',
  message: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300',
  email: 'bg-violet-100 text-violet-700 dark:bg-violet-900/40 dark:text-violet-300',
};

export function QueueTaskRow({ task, onExecute, onPostpone, onReassign, showTime = false, showOwner = false, busy }) {
  const canal = stepChannel(task.title);
  const Icon = ICON[canal] || CheckSquare;
  const tone = TONE[canal] || 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300';
  const atrasada = isOverdue(task);
  // Sem lead, a manchete JA e o titulo — repetir o detalhe escreveria a mesma
  // frase duas vezes. A comparacao normaliza os dois lados: titulo do banco vem
  // com espaco sobrando, e um espaco invisivel ja bastou pra "sao diferentes".
  const norm = (s) => (s || '').replace(/\s+/g, ' ').trim().toLowerCase();
  const bruto = taskDetail(task.title);
  const detalhe = bruto && norm(bruto) !== norm(taskHeadline(task.title, task.leadName)) ? bruto : '';
  const dono = showOwner ? (task.assignedToName || null) : null;

  // Clique normal na manchete EXECUTA a tarefa. Ctrl/⌘+clique ou clique do meio
  // (scroll) abrem o lead numa aba nova — pra espiar o histórico sem sair da
  // fila. Só quando há lead/contato pra onde ir.
  const leadHref = task.dealId ? `/crm/deals/${task.dealId}` : task.contactId ? `/crm/contacts/${task.contactId}` : null;
  const abrirLeadEmAba = () => window.open(leadHref, '_blank', 'noopener');

  return (
    <div
      className={`flex items-center gap-2.5 rounded-xl border px-2.5 py-2 transition-colors ${
        atrasada
          ? 'border-rose-200 dark:border-rose-900/50 bg-rose-50/50 dark:bg-rose-950/20'
          : 'border-slate-200 dark:border-slate-700 bg-white/70 dark:bg-slate-800/40'
      }`}
    >
      <span className={`shrink-0 w-8 h-8 rounded-lg flex items-center justify-center ${tone}`}>
        <Icon size={15} />
      </span>

      <button
        type="button"
        title={leadHref ? 'Clique pra fazer · Ctrl/scroll-clique abre o lead em nova aba' : undefined}
        onClick={(e) => {
          if (leadHref && (e.ctrlKey || e.metaKey)) { e.preventDefault(); abrirLeadEmAba(); return; }
          onExecute?.(task);
        }}
        onAuxClick={leadHref ? (e) => { if (e.button === 1) { e.preventDefault(); abrirLeadEmAba(); } } : undefined}
        onMouseDown={leadHref ? (e) => { if (e.button === 1) e.preventDefault(); } : undefined}
        className="flex-1 min-w-0 text-left"
      >
        <div className="flex items-center gap-1.5 min-w-0">
          {/* Dono so aparece quando a fila NAO e a sua: numa fila propria o dono
              e obvio e viraria ruido. Vendo a de outra pessoa (ou a de todos),
              sem isso da pra concluir a tarefa alheia sem perceber. */}
          {dono && (
            <span
              title={dono}
              className="shrink-0 w-[18px] h-[18px] rounded-full flex items-center justify-center text-white text-[10px] font-bold leading-none"
              style={{ backgroundColor: task.assignedToColor || '#94a3b8' }}
            >
              {dono.charAt(0).toUpperCase()}
            </span>
          )}
          <span className="text-sm font-semibold text-slate-800 dark:text-slate-100 truncate">
            {taskHeadline(task.title, task.leadName)}
          </span>
        </div>
        <div className="text-[12px] text-slate-500 dark:text-slate-400 truncate">
          {/* Quando: dia + faixa inicio–fim. Dentro do bloco HOJE o dia e
              redundante (showTime), entao mostra so o horario. */}
          <span className="tnum">{formatWhen(task.startDate, task.endDate, { comDia: !showTime })}</span>
          {/* O detalhe do passo so entra quando ACRESCENTA algo: numa tarefa
              avulsa a manchete JA e o titulo, entao repetir escrevia a mesma
              frase duas vezes, uma embaixo da outra. */}
          {detalhe && <span> · {detalhe}</span>}
          {atrasada && <span className="ml-1.5 font-semibold text-rose-600 dark:text-rose-400">· {relativeDayLabel(task.startDate)}</span>}
        </div>
      </button>

      <button
        type="button"
        onClick={() => onExecute?.(task)}
        disabled={busy}
        className="shrink-0 px-3 py-2 min-h-[44px] rounded-lg text-sm font-semibold text-white bg-fyness-primary hover:bg-fyness-secondary disabled:opacity-50"
      >
        Fazer
      </button>
      {onReassign && (
        <button
          type="button"
          onClick={() => onReassign(task)}
          disabled={busy}
          title="Passar pra outro vendedor"
          className="shrink-0 px-2 min-h-[44px] flex items-center justify-center rounded-lg text-slate-400 hover:text-fyness-primary hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-50"
        >
          <UserCheck size={16} />
        </button>
      )}
      <PostponeMenu compact disabled={busy} onPick={(d) => onPostpone?.(task, d)} />
    </div>
  );
}

export default QueueTaskRow;
