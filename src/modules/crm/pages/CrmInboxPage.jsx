/**
 * CrmInboxPage - Pagina do Inbox WhatsApp.
 *
 * Layout: split view (ConversationList | MessageThread + Composer).
 * Estado da conversa ativa fica em URL (?contact= | ?prospect=) pra deep-link.
 */

import { useCallback, useMemo, useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { ConversationList } from '../components/inbox/ConversationList';
import { MessageThread } from '../components/inbox/MessageThread';
import { MessageComposer } from '../components/inbox/MessageComposer';
import { WhatsAppStatusBanner } from '../components/inbox/WhatsAppStatusBanner';
import { useCrmInboxConversations, useCrmWhatsAppInstances, useCrmContact, useCrmProspect, useCrmConversation, useDeleteCrmMessage } from '../hooks/useCrmQueries';
import { CrmConfirmDialog } from '../components/ui/CrmConfirmDialog';

export function CrmInboxPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const contactParam  = searchParams.get('contact');
  const prospectParam = searchParams.get('prospect');
  // Qual NUMERO da empresa. A conversa e (com quem + por qual numero): sem isto
  // na URL, recarregar a pagina cairia na thread do outro numero, e o deep-link
  // apontaria pra conversa errada. Ausente = link antigo, mostra tudo junto.
  const instanceParam = searchParams.get('instance');

  const { data: conversations = [] } = useCrmInboxConversations();
  const { data: instances = [] } = useCrmWhatsAppInstances();

  // Contato/prospect sem historico de mensagem ainda nao tem conversa na lista —
  // busca direto em crm_contacts/crm_prospects pra nao renderizar cabecalho em
  // branco na primeira conversa (so habilitado quando realmente vira stub, logo abaixo).
  // "Ja existe conversa na lista?" agora considera o numero: o mesmo lead pode
  // ter thread num numero e nenhuma no outro.
  const naLista = (c) => (
    (contactParam  && c.contactId  === contactParam) ||
    (prospectParam && c.prospectId === prospectParam)
  ) && (!instanceParam || c.instanceId === instanceParam);

  const stubContactId  = contactParam  && !conversations.some(naLista) ? contactParam  : null;
  const stubProspectId = prospectParam && !conversations.some(naLista) ? prospectParam : null;
  const { data: stubContact }  = useCrmContact(stubContactId);
  const { data: stubProspect } = useCrmProspect(stubProspectId);

  // A lista so agrupa a janela recente de mensagens, entao conversa antiga (achada
  // pela busca ou aberta por deep-link) vira stub. Sem o instanceId da ultima
  // mensagem dela, a resposta sairia pelo fallback (1a instancia conectada) = numero
  // errado. Mesma queryKey/limit do MessageThread, entao compartilha cache.
  const { data: stubMessages = [] } = useCrmConversation({
    contactId:  stubContactId,
    prospectId: stubProspectId,
    instanceId: instanceParam || undefined,
    limit:      200,
  });
  // Mensagens vem em ordem ASC — a ultima e a mais recente.
  const stubInstanceId = stubMessages.length ? stubMessages[stubMessages.length - 1].instanceId : null;

  // Conversa ativa: busca na lista pelo param da URL
  const activeConversation = useMemo(() => {
    // Casa tambem pela instancia quando a URL traz — senao, com o lead falando
    // nos dois numeros, o `find` pegava a primeira thread e ignorava qual delas
    // o vendedor clicou.
    const casa = (c) => !instanceParam || c.instanceId === instanceParam;
    if (contactParam) {
      const c = conversations.find((c) => c.contactId === contactParam && casa(c));
      if (c) return c;
      // Se nao tem conversa ainda mas tem contactId, monta stub minimo
      // (acontece quando vem do detalhe do contato pra abrir conversa pela primeira vez)
      return {
        contactId: contactParam,
        instanceId: instanceParam || stubInstanceId,
        otherName: stubContact?.name || '',
        otherPhone: stubContact?.phone || '',
        avatarColor: stubContact?.avatarColor || null,
        avatarUrl: stubContact?.avatarUrl || null,
      };
    }
    if (prospectParam) {
      const p = conversations.find((c) => c.prospectId === prospectParam && casa(c));
      if (p) return p;
      return {
        prospectId: prospectParam,
        instanceId: instanceParam || stubInstanceId,
        otherName: stubProspect?.contactName || stubProspect?.companyName || '',
        otherPhone: stubProspect?.phone || '',
        avatarUrl: stubProspect?.avatarUrl || null,
      };
    }
    return null;
  }, [conversations, contactParam, prospectParam, instanceParam, stubContact, stubProspect, stubInstanceId]);

  // Mesmo formato da chave que a RPC devolve ('c:<id>:<instance>'), pra casar
  // com o `key` das linhas da lista e destacar a conversa certa.
  const activeKey = activeConversation
    ? (activeConversation.contactId
        ? `c:${activeConversation.contactId}`
        : `p:${activeConversation.prospectId}`)
      + `:${activeConversation.instanceId || '-'}`
    : null;

  // Mensagem sendo respondida (citacao). Vive aqui porque os baloes (no
  // MessageThread) a escolhem e o composer a exibe/envia. Troca de conversa limpa.
  const [replyTo, setReplyTo] = useState(null);
  useEffect(() => { setReplyTo(null); }, [activeKey]);

  // Apagar mensagem: guarda a mensagem-alvo pra confirmar antes (delete e
  // irreversivel do lado da tela). Some ao trocar de conversa.
  const [deletingMessage, setDeletingMessage] = useState(null);
  useEffect(() => { setDeletingMessage(null); }, [activeKey]);
  const deleteMsg = useDeleteCrmMessage();

  const handleSelect = useCallback(
    (conv) => {
      const next = new URLSearchParams();
      if (conv.contactId)  next.set('contact', conv.contactId);
      else if (conv.prospectId) next.set('prospect', conv.prospectId);
      // Sem o numero na URL a thread aberta seria decidida pelo acaso da ordem
      // da lista, e o F5 poderia trocar de conversa.
      if (conv.instanceId) next.set('instance', conv.instanceId);
      setSearchParams(next, { replace: true });
    },
    [setSearchParams]
  );

  // Voltar pra lista (só faz sentido no celular, onde a thread ocupa a tela toda):
  // limpa a seleção da URL, o que reesconde a thread e mostra a lista.
  const handleBack = useCallback(
    () => setSearchParams(new URLSearchParams(), { replace: true }),
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
    <div className="-m-4 md:-m-6 flex flex-col h-[calc(100dvh-3.5rem)]">
      <WhatsAppStatusBanner />
      <div className="flex-1 flex min-h-0">
        <ConversationList activeKey={activeKey} onSelect={handleSelect} />
        <MessageThread conversation={activeConversation} onReply={setReplyTo} onDelete={setDeletingMessage} onBack={handleBack}>
          {activeConversation && (
            <MessageComposer
              conversation={activeConversation}
              instanceName={activeInstance?.instanceName}
              disabled={composerDisabled}
              replyTo={replyTo}
              onCancelReply={() => setReplyTo(null)}
            />
          )}
        </MessageThread>
      </div>

      <CrmConfirmDialog
        open={!!deletingMessage}
        onClose={() => setDeletingMessage(null)}
        onConfirm={() => {
          if (deletingMessage) deleteMsg.mutate(deletingMessage.id);
          setDeletingMessage(null);
        }}
        title="Apagar mensagem"
        message={
          deletingMessage?.direction === 'outbound'
            ? 'Apaga aqui e revoga no WhatsApp — o lead passa a ver "Esta mensagem foi apagada". Vale só pras mensagens que você enviou.'
            : 'Some daqui do CRM. A mensagem que o LEAD enviou não dá pra apagar do WhatsApp dele — continua no telefone dele.'
        }
        confirmLabel="Apagar"
        variant="danger"
        loading={deleteMsg.isPending}
      />
    </div>
  );
}

export default CrmInboxPage;
