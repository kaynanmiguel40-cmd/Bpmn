import { useEffect, useRef } from 'react';
import { Phone, ExternalLink, MessageSquare } from 'lucide-react';
import { useCrmConversation, useMarkCrmMessagesAsRead } from '../../hooks/useCrmQueries';
import { MessageBubble } from './MessageBubble';

/**
 * MessageThread - Painel direito do Inbox: header + lista de mensagens.
 *
 * Props:
 *   - conversation: { contactId?, prospectId?, otherName, otherPhone, dealId?, avatarColor? }
 *   - children: composer (renderizado no fundo)
 */

function ThreadEmpty() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
      <MessageSquare size={48} className="text-slate-300 dark:text-slate-600 mb-3" />
      <h3 className="text-base font-medium text-slate-600 dark:text-slate-300 mb-1">
        Selecione uma conversa
      </h3>
      <p className="text-sm text-slate-400 dark:text-slate-500 max-w-xs">
        Escolha uma conversa à esquerda pra começar a interagir com seus clientes via WhatsApp.
      </p>
    </div>
  );
}

function ThreadHeader({ conversation }) {
  if (!conversation) return null;
  const detailLink = conversation.contactId
    ? `/crm/contacts/${conversation.contactId}`
    : null;

  return (
    <div className="h-14 border-b border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-4 flex items-center justify-between shrink-0">
      <div className="flex items-center gap-3 min-w-0">
        <div
          className="w-9 h-9 rounded-full flex items-center justify-center text-white text-sm font-semibold shrink-0"
          style={{ backgroundColor: conversation.avatarColor || '#6366f1' }}
        >
          {conversation.otherName?.[0]?.toUpperCase() || '?'}
        </div>
        <div className="min-w-0">
          <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-100 truncate">
            {conversation.otherName || conversation.otherPhone}
          </h3>
          {conversation.otherPhone && (
            <div className="flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400">
              <Phone size={11} />
              <span>{conversation.otherPhone}</span>
            </div>
          )}
        </div>
      </div>
      {detailLink && (
        <a
          href={detailLink}
          className="text-xs text-fyness-primary hover:underline flex items-center gap-1"
        >
          Ver detalhes <ExternalLink size={12} />
        </a>
      )}
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

  // Scroll pro fim quando novas mensagens chegam
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages.length]);

  // Marca inbound como lidas ao abrir
  useEffect(() => {
    if (!conversation || messages.length === 0) return;
    const unreadIds = messages
      .filter((m) => m.direction === 'inbound' && m.status !== 'read')
      .map((m) => m.id);
    if (unreadIds.length > 0) {
      markReadMutation.mutate(unreadIds);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [conversation?.contactId, conversation?.prospectId, messages.length]);

  if (!conversation) {
    return (
      <main className="flex-1 flex flex-col bg-slate-50 dark:bg-slate-950">
        <ThreadEmpty />
      </main>
    );
  }

  return (
    <main className="flex-1 flex flex-col bg-slate-50 dark:bg-slate-950 min-w-0">
      <ThreadHeader conversation={conversation} />

      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-4"
        style={{
          backgroundImage:
            'radial-gradient(circle at 20% 30%, rgba(99,102,241,0.05) 0%, transparent 40%)',
        }}
      >
        {isLoading ? (
          <div className="text-center text-sm text-slate-400 py-8">Carregando mensagens...</div>
        ) : messages.length === 0 ? (
          <div className="text-center text-sm text-slate-400 py-8">
            Nenhuma mensagem ainda. Envie a primeira.
          </div>
        ) : (
          messages.map((m) => <MessageBubble key={m.id} message={m} />)
        )}
      </div>

      {children}
    </main>
  );
}

export default MessageThread;
