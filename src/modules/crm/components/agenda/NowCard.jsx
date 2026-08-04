/**
 * NowCard — "COMECE POR AQUI": a UMA tarefa que responde "o que eu faco agora".
 *
 * A fila inteira e util pra saber o tamanho do dia, mas quem esta comecando a
 * manha nao quer escolher — quer executar. Por isso a primeira tarefa sai da
 * lista e vira cartao, com o telefone e os botoes grandes: da pra ligar sem
 * abrir mais nada.
 */

import { Phone, MessageCircle, Mail, AlertTriangle, ExternalLink, CheckSquare } from 'lucide-react';
import { stepChannel } from '../../services/crmScheduling';
import { taskHeadline, taskDetail, relativeDayLabel, isOverdue, formatWhen } from '../../utils/stepLabel';
import { useOpenLeadInbox } from '../../hooks/useOpenLeadInbox';
import { PostponeMenu } from './PostponeMenu';

const ICON = { call: Phone, message: MessageCircle, email: Mail };
const VERB_BIG = { call: 'LIGAR', message: 'MANDAR WHATSAPP', email: 'MANDAR E-MAIL' };

function formatPhone(val) {
  if (!val) return '';
  const c = val.replace(/\D/g, '');
  if (c.length === 11) return c.replace(/^(\d{2})(\d{5})(\d{4})$/, '($1) $2-$3');
  if (c.length === 10) return c.replace(/^(\d{2})(\d{4})(\d{4})$/, '($1) $2-$3');
  return val;
}
function whatsappUrl(val) {
  if (!val) return null;
  const c = val.replace(/\D/g, '');
  if (c.length < 10) return null;
  return `https://wa.me/${c.startsWith('55') && c.length >= 12 ? c : `55${c}`}`;
}

export function NowCard({ task, onExecute, onPostpone, onOpenLead, busy }) {
  const { abrir, abrindo } = useOpenLeadInbox();
  if (!task) return null;
  const canal = stepChannel(task.title);
  const Icon = ICON[canal] || CheckSquare;
  const atrasada = isOverdue(task);
  const wa = whatsappUrl(task.phone);
  // Abre o Inbox se houver contato (mesmo sem número de WhatsApp válido) OU um wa.me
  // pra criar contato pelo número.
  const podeInbox = !!(wa || task.contactId);
  // Lead com contato -> Inbox do CRM; só com telefone -> cria/vincula contato pelo
  // número e abre no CRM; se não der, wa.me externo.
  const abrirInbox = () => abrir(
    { contactId: task.contactId, phone: task.phone, name: task.leadName, dealId: task.dealId },
    wa,
  );

  return (
    <div className="rounded-2xl border-2 border-fyness-primary/30 bg-white dark:bg-slate-800/60 overflow-hidden">
      <div className="px-3 py-1.5 bg-fyness-primary/10 text-[11px] font-bold uppercase tracking-wider text-fyness-primary">
        Comece por aqui
      </div>

      <div className="p-4 space-y-3">
        {atrasada ? (
          <div className="flex items-center gap-1.5 text-[12px] font-bold text-rose-600 dark:text-rose-400">
            <AlertTriangle size={13} /> ATRASADA · {relativeDayLabel(task.startDate)} · {formatWhen(task.startDate, task.endDate)}
          </div>
        ) : (
          <div className="text-[12px] font-semibold text-slate-500 dark:text-slate-400">
            Hoje · {formatWhen(task.startDate, task.endDate, { comDia: false })}
          </div>
        )}

        <div className="flex items-center gap-2">
          <Icon size={20} className="text-fyness-primary shrink-0" />
          <span className="text-base font-bold tracking-wide text-slate-800 dark:text-slate-100">
            {VERB_BIG[canal] || 'FAZER'}
          </span>
        </div>

        <div>
          <button
            type="button"
            onClick={() => task.dealId && onOpenLead?.(task.dealId)}
            disabled={!task.dealId}
            className="text-lg font-bold text-slate-900 dark:text-white hover:text-fyness-primary disabled:hover:text-slate-900 disabled:cursor-default inline-flex items-center gap-1.5 text-left"
          >
            {task.leadName || taskHeadline(task.title, null)}
            {task.dealId && <ExternalLink size={13} className="opacity-50 shrink-0" />}
          </button>
          <div className="text-[13px] text-slate-500 dark:text-slate-400">
            {/* Sem lead, a manchete acima JA e o titulo — repetir o detalhe
                escreveria a mesma frase duas vezes seguidas. */}
            {[task.stageName, task.leadName ? taskDetail(task.title) : null].filter(Boolean).join(' · ')}
          </div>
        </div>

        {task.phone ? (
          <div className="space-y-2">
            <div className="text-sm tnum text-slate-600 dark:text-slate-300">{formatPhone(task.phone)}</div>
            <div className="grid grid-cols-2 gap-2">
              <a href={`tel:${task.phone.replace(/\D/g, '')}`}
                className="flex items-center justify-center gap-1.5 min-h-[48px] rounded-xl text-sm font-bold bg-sky-100 text-sky-700 hover:bg-sky-200 dark:bg-sky-900/40 dark:text-sky-300">
                <Phone size={16} /> Ligar
              </a>
              <button type="button" onClick={abrirInbox} disabled={!podeInbox || abrindo}
                title="Abrir a conversa no Inbox do CRM"
                className={`flex items-center justify-center gap-1.5 min-h-[48px] rounded-xl text-sm font-bold ${
                  podeInbox ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200 dark:bg-emerald-900/40 dark:text-emerald-300'
                     : 'bg-slate-100 text-slate-400 pointer-events-none dark:bg-slate-700'
                } ${abrindo ? 'opacity-60' : ''}`}>
                <MessageCircle size={16} /> {abrindo ? 'Abrindo…' : 'WhatsApp'}
              </button>
            </div>
          </div>
        ) : (
          <div className="text-[12px] text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-900/20 rounded-lg px-2.5 py-2">
            Sem telefone cadastrado.{' '}
            {task.dealId && (
              <button type="button" onClick={() => onOpenLead?.(task.dealId)} className="underline font-semibold">
                Abrir o lead pra cadastrar
              </button>
            )}
          </div>
        )}

        <div className="flex items-center gap-2 pt-1">
          <button
            type="button"
            onClick={() => onExecute?.(task)}
            disabled={busy}
            className="flex-1 min-h-[48px] rounded-xl text-sm font-bold text-white bg-fyness-primary hover:bg-fyness-secondary disabled:opacity-50"
          >
            Executar tarefa
          </button>
          <PostponeMenu disabled={busy} onPick={(d) => onPostpone?.(task, d)} />
        </div>
      </div>
    </div>
  );
}

export default NowCard;
