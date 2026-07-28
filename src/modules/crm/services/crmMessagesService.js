/**
 * crmMessagesService - Inbox WhatsApp do CRM (crm_messages).
 *
 * Mensagens enviadas/recebidas via Evolution API. Cada mensagem pertence
 * a uma instance e vincula a um contato OU prospect (constraint do banco).
 * deal_id eh opcional (contexto de negociacao).
 *
 * Envio: chama Edge Function `evolution-send` (NAO insere direto;
 * a function que faz insert + chamada externa + update de status).
 * Recebimento: vem via webhook -> Edge Function `evolution-webhook`.
 * UI observa via Supabase Realtime (useCrmRealtime).
 */

import { supabase } from '../../../lib/supabase';
import { toast } from '../../../contexts/ToastContext';
import { orIlike } from '../lib/searchFilters';

// ==================== TRANSFORMADOR ====================

/** Resumo curto de uma mensagem, pro balao de citacao (responder). */
export function messagePreview(msg) {
  if (!msg) return '';
  const t = (msg.content || msg.mediaCaption || '').trim();
  if (t) return t.slice(0, 140);
  switch (msg.mediaType) {
    case 'image':    return '📷 Foto';
    case 'video':    return '🎥 Vídeo';
    case 'audio':    return '🎤 Áudio';
    case 'document': return `📄 ${msg.mediaFilename || 'Documento'}`;
    case 'sticker':  return 'Figurinha';
    case 'location': return '📍 Localização';
    default:         return 'Mensagem';
  }
}

export function dbToCrmMessage(row) {
  if (!row) return null;
  return {
    id: row.id,
    instanceId: row.instance_id,
    contactId: row.contact_id || null,
    prospectId: row.prospect_id || null,
    dealId: row.deal_id || null,
    direction: row.direction,
    fromPhone: row.from_phone || '',
    toPhone: row.to_phone || '',
    content: row.content || '',
    mediaUrl: row.media_url || null,
    mediaType: row.media_type || null,
    mediaMime: row.media_mime || null,
    mediaFilename: row.media_filename || null,
    mediaCaption: row.media_caption || null,
    mediaDurationSeconds: row.media_duration_seconds || null,
    // Resposta (citacao): a mensagem que esta responde.
    replyToId: row.reply_to_id || null,
    replyToPreview: row.reply_to_preview || null,
    replyToFromMe: typeof row.reply_to_from_me === 'boolean' ? row.reply_to_from_me : null,
    evolutionMessageId: row.evolution_message_id || null,
    status: row.status,
    errorMessage: row.error_message || null,
    sentAt: row.sent_at,
    deliveredAt: row.delivered_at || null,
    readAt: row.read_at || null,
    isSpam: !!row.is_spam,
    isStarred: !!row.is_starred,
    source: row.source || 'manual',
    automationId: row.automation_id || null,
    createdBy: row.created_by || null,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

// ==================== LISTAGEM ====================

/**
 * Transforma erro do PostgREST em excecao de verdade.
 *
 * Antes cada leitura fazia `toast(...); return []`. A promise RESOLVIA, entao o
 * React Query marcava sucesso: sem isError, sem retry, e a tela renderizava o
 * estado vazio normal. Falha de RLS, coluna faltando por migration nao aplicada,
 * timeout ou 5xx do PostgREST viravam "Nenhuma conversa ainda" — indistinguivel
 * de caixa de entrada vazia. E como o inbox nao refaz a busca ao focar a janela,
 * a tela vazia ficava ate o reload manual.
 *
 * O toast continua (feedback imediato), mas o erro sobe: quem chama decide se
 * mostra estado de erro, tenta de novo, ou deixa passar.
 */
function erroDeLeitura(oQue, error) {
  toast(`Erro ao ${oQue}: ${error.message}`, 'error');
  const e = new Error(`${oQue}: ${error.message}`);
  e.cause = error;
  return e;
}

/**
 * ORDEM DAS MENSAGENS — por que sempre (sent_at, created_at, id).
 *
 * `sent_at` vem do `messageTimestamp` do WhatsApp, que tem precisao de SEGUNDO.
 * Toda rajada de mensagens (o lead mandando 3 linhas seguidas) empata nesse
 * campo, e ORDER BY com empate no Postgres nao garante ordem nenhuma: a mesma
 * consulta pode devolver ordens diferentes, e a ordem muda de verdade sempre que
 * um UPDATE reescreve a tupla — `markCrmMessagesAsRead` faz isso em massa toda
 * vez que a conversa e aberta. Era isso que fazia a conversa "se reorganizar
 * sozinha".
 *
 * `created_at` e o NOW() do servidor no insert: monotonico, microssegundo, imune
 * ao relogio do celular do lead. Ele desempata. `id` desempata o desempate, pro
 * caso de dois inserts no mesmo microssegundo.
 *
 * Os indices que sustentam essa ordenacao estao na migration 106.
 */
const ORDEM_DESC = (q) => q
  .order('sent_at',    { ascending: false })
  .order('created_at', { ascending: false })
  .order('id',         { ascending: false });

/**
 * Mensagens de uma conversa (contato ou prospect), pra UI do chat.
 * Ordem ASC (mais antigas primeiro, scroll natural do chat).
 */
export async function getConversationMessages({ contactId, prospectId, instanceId, limit = 100 }) {
  if (!contactId && !prospectId) return [];

  // Pega as N mensagens MAIS RECENTES (desc + limit), depois reverte para ASC
  // (mais antigas primeiro) pro scroll natural do chat. Com asc + limit o banco
  // devolvia as N mais ANTIGAS e descartava as recentes — inclusive a ultima
  // mensagem que o vendedor ia responder.
  let query = ORDEM_DESC(
    supabase
      .from('crm_messages')
      .select('*')
      .is('deleted_at', null)
  ).limit(limit);

  if (contactId)  query = query.eq('contact_id', contactId);
  if (prospectId) query = query.eq('prospect_id', prospectId);
  // A conversa e (com quem + por qual numero). Sem este filtro, abrir a thread
  // do fyness-principal mostrava junto o que chegou pela lorena-consultora — e
  // a resposta saia pela instancia da ultima mensagem, que podia ser a outra.
  //
  // Opcional de proposito: deep-link antigo (?contact= sem instancia) continua
  // valendo e mostra a conversa inteira, em vez de abrir vazia.
  if (instanceId) query = query.eq('instance_id', instanceId);

  const { data, error } = await query;
  if (error) throw erroDeLeitura('carregar a conversa', error);
  return (data || []).map(dbToCrmMessage).reverse();
}

// Select + joins compartilhados pelas duas rotas de busca abaixo (default e search).
const INBOX_MESSAGE_SELECT = `
  *,
  crm_contacts(id, name, phone, avatar_color, avatar_url, created_by),
  crm_prospects(id, contact_name, company_name, phone, avatar_url, assigned_to),
  crm_whatsapp_instances(phone_number, instance_name)
`;

/**
 * A RPC nao existe neste banco ainda (migration 107 nao aplicada)?
 *
 * PostgREST devolve PGRST202 quando nao acha a funcao no schema cache, e o
 * Postgres devolve 42883 (undefined_function). Qualquer outro erro e problema
 * real e deve subir — engolir tudo aqui recriaria o bug que acabamos de matar,
 * o de falha silenciosa virando tela vazia.
 */
function ehFuncaoInexistente(error) {
  const code = error?.code || '';
  if (code === 'PGRST202' || code === '42883') return true;
  const msg = `${error?.message || ''} ${error?.details || ''}`.toLowerCase();
  return msg.includes('could not find the function')
      || msg.includes('does not exist');
}

/** Linha da RPC crm_inbox_conversations -> shape que a UI ja consome. */
function rpcToConversation(r) {
  return {
    // Ja vem no formato 'c:<id>:<instance_id>' — carrega a instancia porque duas
    // threads do mesmo lead (uma por numero) nao podem colidir na lista.
    key:             r.conversa_key,
    contactId:       r.contact_id || null,
    prospectId:      r.prospect_id || null,
    instanceId:      r.instance_id || null,
    instancePhone:   r.instance_phone || null,
    instanceName:    r.instance_name || null,
    avatarColor:     r.avatar_color || null,
    avatarUrl:       r.avatar_url || null,
    otherName:       r.other_name || '',
    otherPhone:      r.other_phone || '',
    ownerAuthUserId: r.owner_auth_user_id || null,
    ownerMemberId:   r.owner_member_id || null,
    lastMessage:     r.last_message || '',
    lastDirection:   r.last_direction,
    lastAt:          r.last_at,
    lastStatus:      r.last_status,
    unreadCount:     Number(r.unread_count) || 0,
  };
}

/**
 * Agrupa mensagens (ordenadas DESC por sent_at) por conversa (contato/prospect),
 * mantendo a 1a ocorrencia de cada chave (= mensagem mais recente) e somando
 * unread nas ocorrencias seguintes. Compartilhado pelas 2 rotas de listagem.
 */
function groupMessagesIntoConversations(msgs, limit) {
  const seen = new Map();
  for (const m of (msgs || [])) {
    // Mesma chave da RPC (migration 108): interlocutor + instancia. O mesmo lead
    // falando com dois numeros da empresa da duas conversas, nao uma misturada.
    const quem = m.contact_id ? `c:${m.contact_id}` : `p:${m.prospect_id}`;
    const key = `${quem}:${m.instance_id || '-'}`;
    if (seen.has(key)) {
      // ja tem essa conversa; so incrementa unread se inbound nao lido
      if (m.direction === 'inbound' && m.status !== 'read') {
        const prev = seen.get(key);
        prev.unreadCount += 1;
      }
      continue;
    }
    const contact  = m.crm_contacts || null;
    const prospect = m.crm_prospects || null;
    const otherName =
      contact?.name ||
      prospect?.contact_name ||
      prospect?.company_name ||
      (m.direction === 'inbound' ? m.from_phone : m.to_phone);
    const otherPhone =
      contact?.phone || prospect?.phone ||
      (m.direction === 'inbound' ? m.from_phone : m.to_phone);

    seen.set(key, {
      key,
      contactId:     m.contact_id || null,
      prospectId:    m.prospect_id || null,
      instanceId:    m.instance_id || null,  // de qual numero veio a ultima msg (roteia a resposta)
      instancePhone: m.crm_whatsapp_instances?.phone_number || null,  // telefone do numero (filtro por numero)
      instanceName:  m.crm_whatsapp_instances?.instance_name || null,
      avatarColor:  contact?.avatar_color || null,
      avatarUrl:    contact?.avatar_url || prospect?.avatar_url || null,
      otherName,
      otherPhone,
      // Dono da conversa: contato usa quem criou (created_by = auth user id);
      // prospect usa o responsavel atribuido (assigned_to = team_member.id).
      // Sao 2 espacos de id diferentes — resolvidos na UI contra a lista de membros.
      ownerAuthUserId: contact?.created_by || null,
      ownerMemberId:   prospect?.assigned_to || null,
      lastMessage:  m.content || (m.media_type ? `[${m.media_type}]` : ''),
      lastDirection: m.direction,
      lastAt:       m.sent_at,
      lastStatus:   m.status,
      unreadCount:  (m.direction === 'inbound' && m.status !== 'read') ? 1 : 0,
    });
    if (limit && seen.size >= limit) break;
  }
  return Array.from(seen.values());
}

/**
 * Busca conversas cujo contato/prospect bate com `term` (nome ou telefone),
 * direto no crm_contacts/crm_prospects — nao depende da janela recente de
 * mensagens. Sem isso, um lead que mandou mensagem ha muito tempo (fora das
 * ultimas ~N mensagens do sistema) sumia da busca, indistinguivel de nunca
 * ter existido.
 */
async function searchInboxConversations(term, limit) {

  const [{ data: contacts, error: contactsErr }, { data: prospects, error: prospectsErr }] = await Promise.all([
    supabase
      .from('crm_contacts')
      .select('id')
      .is('deleted_at', null)
      .or(orIlike(['name', 'phone'], term))
      .limit(200),
    supabase
      .from('crm_prospects')
      .select('id')
      .is('deleted_at', null)
      .or(orIlike(['contact_name', 'company_name', 'phone'], term))
      .limit(200),
  ]);

  if (contactsErr || prospectsErr) {
    throw erroDeLeitura('buscar conversas', contactsErr || prospectsErr);
  }

  const contactIds  = (contacts || []).map((c) => c.id);
  const prospectIds = (prospects || []).map((p) => p.id);
  if (contactIds.length === 0 && prospectIds.length === 0) return [];

  // Em LOTES, e nao numa lista so.
  //
  // O PostgREST recebe o filtro na URL de um GET. Com 200 contatos + 200
  // prospects sao 400 UUIDs de 36 caracteres num unico `or=(...in.(...))`:
  // passa de 15 KB de URL, e o Kong/nginx corta bem antes disso. O browser nao
  // recebe status nenhum — a conexao morre e vira `TypeError: Failed to fetch`,
  // que nao se parece em nada com "a busca era grande demais".
  //
  // Pior: isso disparava justamente na busca curta ("a", "jo"), a que casa com
  // muita gente — ou seja, quanto mais util a busca, mais garantido o erro.
  const LOTE = 40;                      // 40 * 37 chars ~ 1.5 KB de URL, folgado
  const lotes = [];
  for (let i = 0; i < contactIds.length; i += LOTE) {
    lotes.push(`contact_id.in.(${contactIds.slice(i, i + LOTE).join(',')})`);
  }
  for (let i = 0; i < prospectIds.length; i += LOTE) {
    lotes.push(`prospect_id.in.(${prospectIds.slice(i, i + LOTE).join(',')})`);
  }

  const respostas = await Promise.all(lotes.map((filtro) =>
    ORDEM_DESC(
      supabase
        .from('crm_messages')
        .select(INBOX_MESSAGE_SELECT)
        .is('deleted_at', null)
        .or(filtro)
    ).limit(2000)
  ));

  const falha = respostas.find((r) => r.error);
  if (falha) throw erroDeLeitura('buscar conversas', falha.error);

  // Reordena o conjunto: cada lote veio ordenado por si, mas o agrupamento
  // depende de a mensagem mais recente de cada conversa vir primeiro.
  const msgs = respostas
    .flatMap((r) => r.data || [])
    .sort((a, b) => (
      (b.sent_at    || '').localeCompare(a.sent_at    || '')
      || (b.created_at || '').localeCompare(a.created_at || '')
      || (b.id         || '').localeCompare(a.id         || '')
    ));

  return groupMessagesIntoConversations(msgs, limit);
}

/**
 * Lista de conversas pro Inbox (ultima mensagem agrupada por contato/prospect).
 * NOTA: implementacao client-side; pra escala, criar RPC `crm_inbox_conversations`.
 *
 * @param {object}  [opts]
 * @param {number}  [opts.limit=100]
 * @param {string}  [opts.search] - quando preenchido, busca direto no
 *   contato/prospect em vez de so olhar a janela recente de mensagens.
 *
 * Retorna: [{ contactId|prospectId, otherName, otherPhone, lastMessage, unreadCount, lastAt }]
 */
export async function getInboxConversations({
  limit = 100,
  search = '',
  offset = 0,
  instancePhone = null,
  ownerAuthId = null,
  ownerMemberId = null,
} = {}) {
  const term = (search || '').trim();
  if (term) return searchInboxConversations(term, limit);

  const { data, error } = await supabase.rpc('crm_inbox_conversations', {
    p_limit:           limit,
    p_offset:          offset,
    p_instance_phone:  instancePhone,
    p_owner_auth_id:   ownerAuthId,
    p_owner_member_id: ownerMemberId,
  });

  if (!error) return (data || []).map(rpcToConversation);

  // A RPC vive na migration 107. Enquanto ela nao estiver aplicada no banco,
  // cai no caminho antigo em vez de deixar o inbox na tela de erro — o codigo
  // roda antes e depois do deploy da migration. Assim que 107 estiver aplicada
  // em todos os ambientes, este fallback (e groupMessagesIntoConversations,
  // usado tambem pela busca) pode sair.
  if (!ehFuncaoInexistente(error)) throw erroDeLeitura('carregar o inbox', error);

  const { data: msgs, error: erroLegado } = await ORDEM_DESC(
    supabase
      .from('crm_messages')
      .select(INBOX_MESSAGE_SELECT)
      .is('deleted_at', null)
  ).limit(limit * 5); // pega mais pra agrupar

  if (erroLegado) throw erroDeLeitura('carregar o inbox', erroLegado);

  return groupMessagesIntoConversations(msgs, limit);
}

// ==================== ENVIO (Edge Function) ====================

/**
 * Normaliza telefone BR pro formato que a `evolution-send` espera: digitos com
 * DDI 55. La, numero sem '55' (ou com mais de 13 digitos) e tratado como LID e
 * endereçado pra `<numero>@lid` — que nao e o do lead. Contato gravado em
 * formato nacional ("(35) 99228-5099") cai nisso se enviado cru.
 */
export function toBrazilE164(raw) {
  const s = String(raw || '').trim();
  if (!s) return '';
  // jid/lid ja pronto (ex: '211398994968714@lid') vai intacto.
  if (s.includes('@')) return s;

  const digits = s.replace(/\D/g, '');
  // DDI 55 + DDD (2) + 8 ou 9 digitos: ja esta em E.164.
  if (digits.length >= 12 && digits.length <= 13 && digits.startsWith('55')) return digits;
  // Nacional: DDD (2) + 8 ou 9 digitos. O '55' inicial aqui e o DDD do RS,
  // nao o DDI — por isso o teste acima exige length >= 12.
  if (digits.length === 10 || digits.length === 11) return `55${digits}`;
  // Nao reconhecido (LID opaco, numero de outro pais): repassa os digitos e
  // deixa a edge function decidir o endereçamento.
  return digits;
}

/**
 * Envia mensagem via Evolution API (Edge Function).
 *
 * @param {object} payload
 * @param {string} payload.instanceName - nome da instancia (default: VITE_EVOLUTION_INSTANCE_DEFAULT)
 * @param {string} payload.phone        - destinatario; aceita formato nacional
 *   ("(35) 99228-5099") ou E.164 sem '+' — normalizado pra DDI 55 no envio.
 * @param {string} [payload.content]    - texto (obrigatorio se sem media)
 * @param {string} [payload.mediaUrl]   - url publica
 * @param {string} [payload.mediaType]  - 'image'|'audio'|'video'|'document'
 * @param {string} [payload.mediaCaption]
 * @param {string} [payload.contactId]
 * @param {string} [payload.prospectId]
 * @param {string} [payload.dealId]
 * @param {string} [payload.automationId]
 * @param {string} [payload.source='manual']
 */
export async function sendCrmMessage(payload) {
  const instanceName = payload.instanceName
    || import.meta.env.VITE_EVOLUTION_INSTANCE_DEFAULT
    || 'fyness-principal';

  const phone = toBrazilE164(payload.phone);
  if (!phone) {
    toast('Telefone destino e obrigatorio', 'error');
    return { ok: false, error: 'phone obrigatorio' };
  }
  if (!payload.content && !payload.mediaUrl) {
    toast('Conteudo ou midia obrigatorio', 'error');
    return { ok: false, error: 'content ou mediaUrl obrigatorio' };
  }
  if (!payload.contactId && !payload.prospectId) {
    toast('Vincular a contato ou prospect', 'error');
    return { ok: false, error: 'contactId ou prospectId obrigatorio' };
  }

  // Pega o user atual pra registrar createdBy
  const { data: { user } } = await supabase.auth.getUser();

  const { data, error } = await supabase.functions.invoke('evolution-send', {
    body: {
      instanceName,
      phone,
      content:      payload.content,
      mediaUrl:     payload.mediaUrl,
      mediaType:    payload.mediaType,
      mediaCaption: payload.mediaCaption,
      contactId:    payload.contactId,
      prospectId:   payload.prospectId,
      dealId:       payload.dealId,
      automationId: payload.automationId,
      source:       payload.source || 'manual',
      createdBy:    user?.id || null,
      // Resposta (citacao): quotedId amarra no WhatsApp; os replyTo* sao
      // desnormalizados pra tela mostrar a citada sem join.
      quotedId:       payload.replyTo?.evolutionMessageId || null,
      quotedText:     payload.replyTo?.preview || null,
      replyToId:      payload.replyTo?.id || null,
      replyToPreview: payload.replyTo?.preview || null,
      replyToFromMe:  payload.replyTo ? !!payload.replyTo.fromMe : null,
    },
  });

  if (error || data?.ok === false) {
    const msg = data?.error || error?.message || 'Falha desconhecida';
    toast(`Falha ao enviar: ${msg}`, 'error');
    return { ok: false, error: msg, messageId: data?.messageId };
  }

  return { ok: true, messageId: data?.messageId, evolutionMessageId: data?.evolutionMessageId };
}

// ==================== READ / STARRED / SPAM ====================

/**
 * Marca como lidas TODAS as mensagens inbound de uma conversa.
 *
 * Por conversa, e nao pela lista de ids que a tela carregou: a thread mostra as
 * 200 mais recentes, entao marcar "o que esta na tela" deixava para tras toda
 * mensagem mais antiga que a 200a — permanentemente, porque nenhuma tela jamais
 * volta a carregar aquelas linhas.
 *
 * Isso nao aparecia enquanto o contador de nao-lidas tambem so enxergava uma
 * janela recente: os dois lados erravam junto e se cancelavam. Com o COUNT da
 * RPC (migration 107) somando a conversa inteira, o residuo ficaria visivel e
 * imortal — o badge travado num numero que nunca zera, por mais que o vendedor
 * abrisse a conversa.
 *
 * Escopo do write agora casa com o escopo do COUNT. E o UPDATE filtra por
 * `status <> 'read'` pra nao reescrever linha ja lida: alem de barato, evita
 * mexer na ordem fisica das tuplas sem necessidade.
 */
export async function markConversationAsRead({ contactId, prospectId, instanceId } = {}) {
  if (!contactId && !prospectId) return { ok: true };

  let q = supabase
    .from('crm_messages')
    .update({ status: 'read', read_at: new Date().toISOString() })
    .eq('direction', 'inbound')
    .neq('status', 'read')
    .is('deleted_at', null);

  if (contactId)  q = q.eq('contact_id', contactId);
  if (prospectId) q = q.eq('prospect_id', prospectId);
  // Mesmo escopo da thread e do COUNT da RPC: abrir a conversa de um numero nao
  // pode zerar o badge do outro, que ninguem leu.
  if (instanceId) q = q.eq('instance_id', instanceId);

  const { error } = await q;
  if (error) {
    toast(`Erro ao marcar como lida: ${error.message}`, 'error');
    return { ok: false };
  }
  return { ok: true };
}

/**
 * Marca mensagens inbound especificas como lidas (por id).
 * Mantida para acoes pontuais na UI; o fluxo de abrir conversa usa
 * `markConversationAsRead`.
 */
export async function markCrmMessagesAsRead(messageIds = []) {
  if (!Array.isArray(messageIds) || messageIds.length === 0) return { ok: true };
  const { error } = await supabase
    .from('crm_messages')
    .update({ status: 'read', read_at: new Date().toISOString() })
    .in('id', messageIds)
    .eq('direction', 'inbound');
  if (error) {
    toast(`Erro ao marcar como lida: ${error.message}`, 'error');
    return { ok: false };
  }
  return { ok: true };
}

