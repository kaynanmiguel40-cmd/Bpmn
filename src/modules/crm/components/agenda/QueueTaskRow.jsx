/**
 * QueueTaskRow — uma tarefa na fila.
 *
 * A linha responde, nesta ordem: de que canal e (icone), o que fazer com quem
 * (manchete), ha quanto tempo esta parada, e os dois botoes. Nada de hover:
 * tudo que se pode fazer esta visivel o tempo todo, inclusive no celular.
 */

import { Phone, MessageCircle, Mail, Users, MapPin, CheckSquare, ArrowRight } from 'lucide-react';
import { stepChannel } from '../../services/crmScheduling';
import { taskHeadline, taskDetail, relativeDayLabel, isOverdue } from '../../utils/stepLabel';
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

const hora = (iso) => new Date(iso).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

export function QueueTaskRow({ task, onExecute, onPostpone, showTime = false, busy }) {
  const canal = stepChannel(task.title);
  const Icon = ICON[canal] || CheckSquare;
  const tone = TONE[canal] || 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300';
  const atrasada = isOverdue(task);

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
        onClick={() => onExecute?.(task)}
        className="flex-1 min-w-0 text-left"
      >
        <div className="text-sm font-semibold text-slate-800 dark:text-slate-100 truncate">
          {showTime && <span className="tnum text-slate-500 dark:text-slate-400 mr-1.5">{hora(task.startDate)}</span>}
          {taskHeadline(task.title, task.leadName)}
        </div>
        <div className="text-[12px] text-slate-500 dark:text-slate-400 truncate">
          {taskDetail(task.title)}
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
      <PostponeMenu compact disabled={busy} onPick={(d) => onPostpone?.(task, d)} />
    </div>
  );
}

export default QueueTaskRow;
