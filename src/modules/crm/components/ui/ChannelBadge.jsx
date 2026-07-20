/**
 * ChannelBadge — mostra de que CANAL e o toque, batendo o olho:
 * telefone = ligacao, balao = WhatsApp, envelope = e-mail.
 *
 * O canal sai do MESMO stepChannel que define o `type` da atividade criada na
 * Agenda — assim o icone do checklist e o do calendario nunca discordam sobre
 * o mesmo toque.
 */

import { Phone, MessageCircle, Mail } from 'lucide-react';
import { stepChannel } from '../../services/crmScheduling';

const CHANNEL = {
  call:    { Icon: Phone,         label: 'Ligação',  cls: 'bg-sky-100 text-sky-700 dark:bg-sky-900/40 dark:text-sky-300' },
  message: { Icon: MessageCircle, label: 'WhatsApp', cls: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300' },
  email:   { Icon: Mail,          label: 'E-mail',   cls: 'bg-violet-100 text-violet-700 dark:bg-violet-900/40 dark:text-violet-300' },
};

export function ChannelBadge({ title, showLabel = true }) {
  const ch = CHANNEL[stepChannel(title)];
  if (!ch) return null;
  const { Icon, label, cls } = ch;
  return (
    <span
      className={`shrink-0 inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[11px] font-semibold ${cls}`}
      title={label}
    >
      <Icon size={12} />
      {showLabel && label}
    </span>
  );
}

export default ChannelBadge;
