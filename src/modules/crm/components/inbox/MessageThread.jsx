import { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Phone, ExternalLink, MessageSquare, Lock } from 'lucide-react';
import { useCrmConversation, useMarkCrmMessagesAsRead } from '../../hooks/useCrmQueries';
import { MessageBubble } from './MessageBubble';

/**
 * MessageThread - Painel direito do Inbox (estilo WhatsApp).
 * Props: conversation, instanceName?, children (composer)
 */

function dayLabel(iso) {
  if (!iso) return '';
  const d = new Date(iso);
  const today = new Date();
  const yest = new Date(); yest.setDate(today.getDate() - 1);
  const sameDay = (a, b) => a.toDateString() === b.toDateString();
  if (sameDay(d, today)) return 'Hoje';
  if (sameDay(d, yest)) return 'Ontem';
  return d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

function Avatar({ url, name, color, size = 40 }) {
  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      {url ? (
        <img
          src={url}
          alt={name}
          referrerPolicy="no-referrer"
          onError={(e) => { e.currentTarget.style.display = 'none'; e.currentTarget.nextElementSibling.style.display = 'flex'; }}
          className="w-full h-full rounded-full object-cover bg-slate-200 dark:bg-slate-700"
        />
      ) : null}
      <div
        className={`absolute inset-0 rounded-full items-center justify-center text-white font-semibold ${url ? 'hidden' : 'flex'}`}
        style={{ backgroundColor: color || '#6366f1', fontSize: size * 0.4 }}
      >
        {name?.[0]?.toUpperCase() || '?'}
      </div>
    </div>
  );
}

function ThreadHeader({ conversation }) {
  const detailLink = conversation.contactId ? `/crm/contacts/${conversation.contactId}` : null;
  const telHref = conversation.otherPhone ? `tel:+${String(conversation.otherPhone).replace(/\D/g, '')}` : null;

  return (
    <div className="h-16 bg-[#f0f2f5] dark:bg-[#202c33] px-4 flex items-center justify-between shrink-0 border-b border-black/5 dark:border-white/5">
      <div className="flex items-center gap-3 min-w-0">
        <Avatar url={conversation.avatarUrl} name={conversation.otherName || conversation.otherPhone} color={conversation.avatarColor} size={40} />
        <div className="min-w-0">
          <h3 className="text-[15px] font-semibold text-slate-800 dark:text-slate-100 truncate leading-tight">
            {conversation.otherName || conversation.otherPhone}
          </h3>
          {conversation.otherPhone && (
            <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{conversation.otherPhone}</p>
          )}
        </div>
      </div>
      <div className="flex items-center gap-1 shrink-0">
        {telHref && (
          <a href={telHref} title="Ligar"
            className="p-2 rounded-full text-slate-500 dark:text-slate-300 hover:bg-black/5 dark:hover:bg-white/10">
            <Phone size={18} />
          </a>
        )}
        {detailLink && (
          <Link to={detailLink} title="Ver detalhes do contato"
            className="p-2 rounded-full text-slate-500 dark:text-slate-300 hover:bg-black/5 dark:hover:bg-white/10">
            <ExternalLink size={18} />
          </Link>
        )}
      </div>
    </div>
  );
}

function DateChip({ label }) {
  return (
    <div className="flex justify-center my-3">
      <span className="text-[11px] font-medium text-slate-600 dark:text-slate-300 bg-white/90 dark:bg-[#182229] px-3 py-1 rounded-md shadow-sm uppercase tracking-wide">
        {label}
      </span>
    </div>
  );
}

function ThreadEmpty() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center text-center p-8 bg-[#f0f2f5] dark:bg-[#161e23]">
      <div className="w-20 h-20 rounded-full bg-[#00a884]/10 flex items-center justify-center mb-4">
        <MessageSquare size={36} className="text-[#00a884]" />
      </div>
      <h3 className="text-lg font-medium text-slate-600 dark:text-slate-200 mb-1">WhatsApp do CRM</h3>
      <p className="text-sm text-slate-400 dark:text-slate-500 max-w-xs">
        Escolha uma conversa à esquerda pra acompanhar e responder seus leads.
      </p>
      <p className="flex items-center gap-1 text-[11px] text-slate-400 mt-6">
        <Lock size={11} /> Conversas sincronizadas via Evolution API
      </p>
    </div>
  );
}

export function MessageThread({ conversation, children }) {
  const scrollRef = useRef(null);
  const markReadMutation = useMarkCrmMessagesAsRead();

  const { data: messages = [], isLoading } = useCrmConversation({
    contactId:  conversation?.contactId,
    prospectId: conversation?.prospectId,
    limit:      200,
  });

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages.length]);

  useEffect(() => {
    if (!conversation || messages.length === 0) return;
    const unreadIds = messages.filter((m) => m.direction === 'inbound' && m.status !== 'read').map((m) => m.id);
    if (unreadIds.length > 0) markReadMutation.mutate(unreadIds);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [conversation?.contactId, conversation?.prospectId, messages.length]);

  if (!conversation) {
    return <main className="flex-1 flex flex-col min-w-0"><ThreadEmpty /></main>;
  }

  let lastDay = null;

  return (
    <main className="flex-1 flex flex-col min-w-0">
      <ThreadHeader conversation={conversation} />

      <div ref={scrollRef} className="flex-1 overflow-y-auto relative bg-[#efeae2] dark:bg-[#0b141a]">
        {/* papel de parede sutil */}
        <div className="absolute inset-0 pointer-events-none block dark:hidden"
          style={{ backgroundImage: 'radial-gradient(rgba(0,0,0,0.045) 1px, transparent 1px)', backgroundSize: '20px 20px' }} />
        <div className="absolute inset-0 pointer-events-none hidden dark:block"
          style={{ backgroundImage: 'radial-gradient(rgba(255,255,255,0.04) 1px, transparent 1px)', backgroundSize: '20px 20px' }} />

        <div className="relative px-3 md:px-10 lg:px-16 py-4 min-h-full flex flex-col justify-end">
          {isLoading ? (
            <div className="text-center text-sm text-slate-500 py-8">Carregando mensagens…</div>
          ) : messages.length === 0 ? (
            <div className="text-center text-sm text-slate-500 dark:text-slate-400 py-8">
              Nenhuma mensagem ainda. Envie a primeira. 👋
            </div>
          ) : (
            messages.map((m) => {
              const d = dayLabel(m.sentAt);
              const showDay = d !== lastDay;
              lastDay = d;
              return (
                <div key={m.id}>
                  {showDay && <DateChip label={d} />}
                  <MessageBubble message={m} />
                </div>
              );
            })
          )}
        </div>
      </div>

      {children}
    </main>
  );
}

export default MessageThread;
