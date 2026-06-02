/**
 * WhatsAppMessagesTab - Mini-thread reutilizável pra embutir em
 * CrmContactDetailPage / CrmDealDetailPage.
 *
 * Mostra ultimas N mensagens + composer inline pra continuar conversa.
 * Botao "Ver no Inbox" leva pra CrmInboxPage com o contato/prospect aberto.
 */

import { ExternalLink, MessageSquare } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useCrmConversation, useCrmWhatsAppInstance } from '../../hooks/useCrmQueries';
import { MessageBubble } from './MessageBubble';
import { MessageComposer } from './MessageComposer';

/**
 * Props:
 *   - contactId? OR prospectId?
 *   - otherName, otherPhone, avatarColor (snapshot do contato/prospect)
 *   - dealId (opcional, contexto)
 *   - limit = 20 (mais recentes)
 */
export function WhatsAppMessagesTab({
  contactId,
  prospectId,
  otherName,
  otherPhone,
  avatarColor,
  dealId,
  limit = 20,
}) {
  const { data: messages = [], isLoading } = useCrmConversation({
    contactId, prospectId, limit,
  });
  const { data: instance } = useCrmWhatsAppInstance();
  const composerDisabled = !instance || instance.status !== 'connected';

  const inboxLink = contactId
    ? `/crm/inbox?contact=${contactId}`
    : prospectId
    ? `/crm/inbox?prospect=${prospectId}`
    : '/crm/inbox';

  if (!contactId && !prospectId) {
    return (
      <div className="p-4 text-center text-sm text-slate-400">
        Vincule a um contato ou prospect pra habilitar o chat.
      </div>
    );
  }

  if (!otherPhone) {
    return (
      <div className="p-4 text-center text-sm text-slate-400">
        Sem telefone cadastrado.
      </div>
    );
  }

  const conversation = { contactId, prospectId, otherName, otherPhone, dealId, avatarColor };

  return (
    <div className="flex flex-col crm-glass rounded-2xl overflow-hidden" style={{ minHeight: 400, maxHeight: 600 }}>
      <header className="px-3 py-2 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-200">
          WhatsApp · {otherPhone}
        </h3>
        <Link
          to={inboxLink}
          className="text-xs text-fyness-primary hover:underline flex items-center gap-1"
        >
          Abrir Inbox <ExternalLink size={11} />
        </Link>
      </header>

      <div className="flex-1 overflow-y-auto p-3 bg-slate-50 dark:bg-slate-950">
        {isLoading ? (
          <div className="text-sm text-slate-400 text-center py-4">Carregando...</div>
        ) : messages.length === 0 ? (
          <div className="text-center py-6">
            <MessageSquare size={28} className="mx-auto text-slate-300 dark:text-slate-600 mb-2" />
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Sem mensagens ainda. Envie a primeira abaixo.
            </p>
          </div>
        ) : (
          messages.map((m) => <MessageBubble key={m.id} message={m} />)
        )}
      </div>

      <MessageComposer conversation={conversation} disabled={composerDisabled} />
    </div>
  );
}

export default WhatsAppMessagesTab;
