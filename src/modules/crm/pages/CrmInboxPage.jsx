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
import { useCrmInboxConversations, useCrmWhatsAppInstances } from '../hooks/useCrmQueries';

export function CrmInboxPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const contactParam  = searchParams.get('contact');
  const prospectParam = searchParams.get('prospect');

  const { data: conversations = [] } = useCrmInboxConversations();
  const { data: instances = [] } = useCrmWhatsAppInstances();

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

  // Instancia da conversa ativa = de qual numero ela veio (pra resposta sair
  // pelo numero certo). Sem conversa/sem historico, cai na 1a conectada.
  const activeInstance = useMemo(() => {
    const byId = activeConversation?.instanceId
      ? instances.find((i) => i.id === activeConversation.instanceId)
      : null;
    return byId || instances.find((i) => i.status === 'connected') || instances[0] || null;
  }, [activeConversation, instances]);

  const composerDisabled = !activeInstance || activeInstance.status !== 'connected';

  return (
    <div className="-m-4 md:-m-6 flex flex-col h-[calc(100vh-3.5rem)]">
      <WhatsAppStatusBanner instanceName={activeInstance?.instanceName} />
      <div className="flex-1 flex min-h-0">
        <ConversationList activeKey={activeKey} onSelect={handleSelect} />
        <MessageThread conversation={activeConversation}>
          {activeConversation && (
            <MessageComposer
              conversation={activeConversation}
              instanceName={activeInstance?.instanceName}
              disabled={composerDisabled}
            />
          )}
        </MessageThread>
      </div>
    </div>
  );
}

export default CrmInboxPage;
