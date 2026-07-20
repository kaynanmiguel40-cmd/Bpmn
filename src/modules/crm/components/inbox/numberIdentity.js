/**
 * Identidade visual dos numeros de WhatsApp da empresa (cor + rotulo).
 *
 * Fonte unica pra lista e thread: se cada tela escolhesse a propria cor, a
 * faixa da conversa na lista e a barra do cabecalho poderiam discordar — e a
 * cor so ensina o codigo (violeta = Fyness) enquanto for a MESMA em todo lugar.
 *
 * Por que a conversa precisa disso: as threads sao separadas por numero, entao
 * o mesmo lead aparece duas vezes na lista, com o mesmo nome e a mesma foto.
 * E responder na thread errada manda a mensagem pelo chip errado.
 */

/**
 * Cores de identidade. Ficam FORA do vocabulario cromatico que o inbox ja usa —
 * #00a884 (marca/ativo), #25d366 (nao-lida), #53bdeb (tick lido), rose (sem
 * resposta), #6366f1 (avatar sem foto).
 *
 * Se um numero usasse o teal da marca, "Fyness" leria como "sem cor" e so a
 * Lorena pareceria marcada: codificacao assimetrica, pior que nenhuma.
 */
export const INSTANCE_COLORS = ['#8b5cf6', '#f59e0b', '#0ea5e9', '#a16207'];

/** Numero que o app nao conseguiu identificar. */
export const UNKNOWN_COLOR = '#94a3b8';

/**
 * 'fyness-principal' -> 'Fyness'. 'lorena-consultora' -> 'Lorena'.
 *
 * Sempre usado com "via" e nunca com artigo: o rotulo sai de um nome de
 * instancia arbitrario e nao da pra inferir genero — "pelo Lorena" iria pra
 * producao no primeiro numero com nome feminino.
 */
export function numberLabel(instanceName) {
  if (!instanceName) return 'Número ?';
  const base = String(instanceName).split('-')[0];
  return base.charAt(0).toUpperCase() + base.slice(1);
}

/**
 * Mapa telefone -> { label, color }, deduplicado por telefone na ordem em que
 * as instancias vem (mesma regra das abas, pra aba e faixa combinarem).
 */
export function numberIdentity(instances) {
  const byPhone = new Map();
  const order = [];
  for (const i of instances || []) {
    if (!i.phoneNumber || byPhone.has(i.phoneNumber)) continue;
    const entry = {
      phone: i.phoneNumber,
      label: numberLabel(i.instanceName),
      color: INSTANCE_COLORS[order.length % INSTANCE_COLORS.length],
    };
    byPhone.set(i.phoneNumber, entry);
    order.push(entry);
  }
  return { order, byPhone };
}
