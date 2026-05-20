/**
 * CrmInboxPage - Pagina do Inbox WhatsApp.
 *
 * Layout: split view (ConversationList | MessageThread + Composer).
 * Estado da conversa ativa fica em URL (?contact= | ?prospect=) pra deep-link.
 */

import { useCallback, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { ConversationList } from '../components/inbox/ConversationList';
import { MessageThread } from '../components/inbox/MessageThread';
import { MessageComposer } from '../components/inbox/MessageComposer';
import { WhatsAppStatusBanner } from '../components/inbox/WhatsAppStatusBanner';
import { useCrmInboxConversations, useCrmWhatsAppInstance } from '../hooks/useCrmQueries';

export function CrmInboxPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const contactParam  = searchParams.get('contact');
  const prospectParam = searchParams.get('prospect');

  const { data: conversations = [] } = useCrmInboxConversations();
  const { data: instance } = useCrmWhatsAppInstance();

  // Conversa ativa: busca na lista pelo param da URL
  const activeConversation = useMemo(() => {
    if (contactParam) {
      const c = conversations.find((c) => c.contactId === contactParam);
      // Se nao tem conversa ainda mas tem contactId, monta stub minimo
      // (acontece quando vem do detalhe do contato pra abrir conversa pela primeira vez)
      return c || (contactParam ? { contactId: contactParam, otherName: '', otherPhone: '' } : null);
    }
    if (prospectParam) {
      const p = conversations.find((c) => c.prospectId === prospectParam);
      return p || (prospectParam ? { prospectId: prospectParam, otherName: '', otherPhone: '' } : null);
    }
    return null;
  }, [conversations, contactParam, prospectParam]);

  const activeKey = activeConversation
    ? activeConversation.contactId
      ? `c:${activeConversation.contactId}`
      : `p:${activeConversation.prospectId}`
    : null;

  const handleSelect = useCallback(
    (conv) => {
      const next = new URLSearchParams();
      if (conv.contactId)  next.set('contact', conv.contactId);
      else if (conv.prospectId) next.set('prospect', conv.prospectId);
      setSearchParams(next, { replace: true });
    },
    [setSearchParams]
  );

  const composerDisabled = !instance || instance.status !== 'connected';

  return (
    <div className="-m-4 md:-m-6 flex flex-col h-[calc(100vh-3.5rem)]">
      <WhatsAppStatusBanner instanceName={instance?.instanceName} />
      <div className="flex-1 flex min-h-0">
        <ConversationList activeKey={activeKey} onSelect={handleSelect} />
        <MessageThread conversation={activeConversation}>
          {activeConversation && (
            <MessageComposer
              conversation={activeConversation}
              disabled={composerDisabled}
            />
          )}
        </MessageThread>
      </div>
    </div>
  );
}

export default CrmInboxPage;
