/**
 * Caminho pro Inbox WhatsApp interno de um lead.
 *
 * A Lhorena pediu: clicar no botão de WhatsApp pra falar com um lead abre o Inbox
 * do CRM, não o wa.me (app/web). O Inbox é chaveado por contato/prospect — é o que
 * permite montar a thread E enviar (o composer/sendCrmMessage exige contactId ou
 * prospectId). Um lead só com telefone solto (negócio sem contato vinculado) não
 * tem como threadar nem enviar por aqui, então retornamos null e o chamador cai no
 * wa.me externo (que sempre funciona). O caso comum — lead com contato, mesmo no
 * PRIMEIRO contato sem conversa ainda — vem por `contactId` e abre o inbox normal.
 *
 * @returns {string|null} rota interna, ou null se não dá pra usar o inbox.
 */
export function inboxPathForLead({ contactId, prospectId } = {}) {
  if (contactId) return `/crm/inbox?contact=${encodeURIComponent(contactId)}`;
  if (prospectId) return `/crm/inbox?prospect=${encodeURIComponent(prospectId)}`;
  return null;
}
