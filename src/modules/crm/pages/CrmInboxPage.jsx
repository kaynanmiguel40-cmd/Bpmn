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
import { useCrmInboxConversations, useCrmWhatsAppInstances, useCrmContact, useCrmProspect } from '../hooks/useCrmQueries';

export function CrmInboxPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const contactParam  = searchParams.get('contact');
  const prospectParam = searchParams.get('prospect');

  const { data: conversations = [] } = useCrmInboxConversations();
  const { data: instances = [] } = useCrmWhatsAppInstances();

  // Contato/prospect sem historico de mensagem ainda nao tem conversa na lista —
  // busca direto em crm_contacts/crm_prospects pra nao renderizar cabecalho em
  // branco na primeira conversa (so habilitado quando realmente vira stub, logo abaixo).
  const stubContactId  = contactParam && !conversations.some((c) => c.contactId === contactParam) ? contactParam : null;
  const stubProspectId = prospectParam && !conversations.some((c) => c.prospectId === prospectParam) ? prospectParam : null;
  const { data: stubContact }  = useCrmContact(stubContactId);
  const { data: stubProspect } = useCrmProspect(stubProspectId);

  // Conversa ativa: busca na lista pelo param da URL
  const activeConversation = useMemo(() => {
    if (contactParam) {
      const c = conversations.find((c) => c.contactId === contactParam);
      if (c) return c;
      // Se nao tem conversa ainda mas tem contactId, monta stub minimo
      // (acontece quando vem do detalhe do contato pra abrir conversa pela primeira vez)
      return {
        contactId: contactParam,
        otherName: stubContact?.name || '',
        otherPhone: stubContact?.phone || '',
        avatarColor: stubContact?.avatarColor || null,
        avatarUrl: stubContact?.avatarUrl || null,
      };
    }
    if (prospectParam) {
      const p = conversations.find((c) => c.prospectId === prospectParam);
      if (p) return p;
      return {
        prospectId: prospectParam,
        otherName: stubProspect?.contactName || stubProspect?.companyName || '',
        otherPhone: stubProspect?.phone || '',
        avatarUrl: stubProspect?.avatarUrl || null,
      };
    }
    return null;
  }, [conversations, contactParam, prospectParam, stubContact, stubProspect]);

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
      <WhatsAppStatusBanner />
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
