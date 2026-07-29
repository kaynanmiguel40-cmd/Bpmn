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

/**
 * Abre a conversa do lead no Inbox do CRM. Com contato/prospect, navega direto
 * (instantâneo). Só com telefone (negócio sem contato vinculado), acha ou cria um
 * contato pelo número e vincula ao negócio — aí a conversa tem onde threadar e o
 * botão passa a abrir no CRM em vez do wa.me. Só cai no wa.me externo se não der
 * pra resolver um contato (sem telefone, ou erro na criação).
 *
 * Fire-and-forget: a navegação acontece por dentro; o await é só pra criar o
 * contato antes de navegar no caminho só-telefone.
 */
export async function openLeadInbox(navigate, lead = {}, waFallback = null) {
  const direto = inboxPathForLead(lead);
  if (direto) { navigate(direto); return; }

  const temTelefone = String(lead.phone || '').replace(/\D/g, '');
  if (temTelefone) {
    try {
      const { ensureContactForDeal } = await import('../services/crmContactsService');
      const contactId = await ensureContactForDeal({ dealId: lead.dealId, phone: lead.phone, name: lead.name });
      if (contactId) { navigate(`/crm/inbox?contact=${encodeURIComponent(contactId)}`); return; }
    } catch {
      // cai no fallback externo
    }
  }
  if (waFallback) window.open(waFallback, '_blank', 'noopener,noreferrer');
}
