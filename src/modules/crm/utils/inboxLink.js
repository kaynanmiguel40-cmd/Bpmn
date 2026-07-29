/**
 * Caminho pro Inbox WhatsApp interno de um lead.
 *
 * A Lhorena pediu: clicar no botão de WhatsApp pra falar com um lead abre o Inbox
 * do CRM, não o wa.me (app/web). O Inbox é chaveado por contato/prospect; quando
 * a tela só tem o telefone (negócio sem contato vinculado), cai no `?phone=`, que
 * o CrmInboxPage resolve casando com a conversa existente ou abrindo uma nova.
 *
 * Ordem de preferência: contato > prospect > telefone. Retorna null se não há
 * nenhum identificador (aí o chamador mantém o fallback externo).
 */
export function inboxPathForLead({ contactId, prospectId, phone } = {}) {
  if (contactId) return `/crm/inbox?contact=${encodeURIComponent(contactId)}`;
  if (prospectId) return `/crm/inbox?prospect=${encodeURIComponent(prospectId)}`;
  const digits = String(phone || '').replace(/\D/g, '');
  if (digits) return `/crm/inbox?phone=${encodeURIComponent(digits)}`;
  return null;
}
