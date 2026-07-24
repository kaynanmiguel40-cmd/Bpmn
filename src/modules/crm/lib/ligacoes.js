/**
 * ligacoes — quantas LIGACOES uma tarefa concluida representa.
 *
 * Duas regras da casa, as duas contra-intuitivas se voce so olhar a tabela:
 *
 * 1. LIGACAO REALIZADA E TAREFA DE LIGACAO CONCLUIDA. Nao existe "so conta se o
 *    vendedor abriu o registro de ligacao": se ele marcou a tarefa de Ligacao como
 *    feita, ele discou. A tabela crm_calls e um registro OPCIONAL (pos-call com
 *    outcome/duracao) — usar ela como fonte do total fazia 80 das 88 ligacoes
 *    concluidas contarem ZERO, porque caiam no vao entre as duas fontes.
 *
 * 2. UM CARD PODE VALER VARIAS DISCADAS. O passo da cadencia diz no titulo quantas
 *    tentativas o toque pede — "Ligação (3 tentativas)" e UM card na agenda mas
 *    TRES ligacoes de verdade. Contar 1 subestimaria o esforco do time em 3x.
 *
 * Puro de proposito: e regra de negocio que muda o numero que o time cobra na
 * daily, entao tem que dar pra testar sem banco.
 */

// Teto de sanidade: titulo com numero absurdo ("Ligação 500x") nao vira 500
// ligacoes no placar. Nenhum passo real pede mais que um punhado de tentativas.
const MAX_TENTATIVAS = 20;

/**
 * Quantas discadas o titulo da tarefa declara.
 *
 * Casa o NUMERO SEGUIDO DA PALAVRA ("3 tentativas", "3 vezes", "3x") — nesta
 * ordem de proposito. "Cadência · Tentativa 2" e um ORDINAL (o 2o toque da
 * sequencia), nao duas ligacoes; como ali o numero vem DEPOIS da palavra, ele
 * nao casa e a tarefa vale 1, que e o certo. Pelo mesmo motivo o "12" de
 * "D12 manhã — Ligação (3 tentativas)" e ignorado: o que vem depois dele e
 * " manhã", nao "tentativas".
 *
 * @param {string} title
 * @returns {number} >= 1
 */
export function tentativasDaTarefa(title) {
  const m = /(\d+)\s*(?:tentativas?|vezes?|x)\b/i.exec(title || '');
  if (!m) return 1;
  const n = parseInt(m[1], 10);
  if (!Number.isFinite(n) || n < 1) return 1;
  return Math.min(n, MAX_TENTATIVAS);
}

/**
 * Soma as ligacoes de uma lista de tarefas (cada uma valendo suas tentativas).
 * @param {Array<{title?:string}>} rows
 */
export function contarLigacoes(rows) {
  return (rows || []).reduce((acc, r) => acc + tentativasDaTarefa(r?.title), 0);
}

/**
 * Quem fez a ligacao, na ordem em que a verdade e mais confiavel:
 * quem CONCLUIU > o responsavel > quem criou.
 *
 * Importa porque a tarefa de cadencia nasce de um insert do sistema (sem
 * created_by): agregar so por created_by jogava fora as ligacoes de cadencia —
 * justamente as que o time mais faz.
 */
export function autorDaLigacao(row) {
  return row?.completed_by || row?.assigned_to || row?.created_by || null;
}
