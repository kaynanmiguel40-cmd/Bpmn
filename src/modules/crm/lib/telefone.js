/**
 * Chave de comparação de telefone brasileiro.
 *
 * O mesmo número aparece escrito de formas diferentes conforme quem gravou:
 * o WhatsApp entrega `553584153752` (DDI + DDD + 8 dígitos) e o cadastro do CRM
 * guarda `(35) 9768-5526` (DDD + 8). Comparar as strings nunca casa.
 *
 * A chave é DDD + os 8 últimos dígitos. As duas partes importam:
 *
 * - Só os 8 finais confundiria DDDs diferentes. `(35) 9903-2508` e
 *   `(21) 9903-2508` são duas pessoas em cidades distintas, e uni-las mandaria
 *   a conversa de uma pro histórico da outra.
 *
 * - O 9º dígito NÃO entra. Celular brasileiro ganhou um 9 na frente em 2016 e
 *   metade das bases guarda com e metade sem — o mesmo aparelho aparece como
 *   `9903-2508` e `99903-2508`. Cortar nos 8 finais faz os dois virarem a mesma
 *   chave, que é o comportamento certo: são o mesmo telefone.
 *
 * O preço dessa escolha: dois números que só diferem no 9º dígito colidem. Na
 * prática isso quer dizer um fixo e um celular com o mesmo final no mesmo DDD —
 * possível, raro, e o erro é juntar duas conversas, não perder uma.
 */

/** Só os dígitos. */
export function apenasDigitos(valor) {
  return String(valor || '').replace(/\D/g, '');
}

/**
 * @returns {string|null} `"35-84153752"`, ou null quando não dá pra afirmar nada.
 *   Null NUNCA casa com null — número incompleto não pode juntar dois leads
 *   só porque os dois estão incompletos.
 */
export function chaveTelefone(valor) {
  let d = apenasDigitos(valor);
  if (!d) return null;

  // DDI do Brasil: só tira quando sobra um número plausível. `5535...` com 12-13
  // dígitos é DDI+DDD+número; `5535-2508` com 8 é um telefone que por acaso
  // começa com 55, e cortar aí destruiria o número.
  if (d.length >= 12 && d.startsWith('55')) d = d.slice(2);

  // Sobrou DDD (2) + 8 ou 9 dígitos. Menos que isso não identifica ninguém:
  // sem DDD, o mesmo final existe em todo estado do país.
  if (d.length < 10) return null;
  if (d.length > 11) return null;

  const ddd = d.slice(0, 2);
  const finais = d.slice(-8);
  return `${ddd}-${finais}`;
}

/** Os dois números são a mesma linha? */
export function mesmoTelefone(a, b) {
  const ka = chaveTelefone(a);
  const kb = chaveTelefone(b);
  return !!ka && ka === kb;
}
