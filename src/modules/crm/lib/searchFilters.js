/**
 * Helpers para sanitizar inputs de busca usados em filtros do Supabase/PostgREST.
 *
 * Motivacao: queries `.ilike('col', '%' + termo + '%')` e `.or('a.ilike.%x%,b.ilike.%x%')`
 * sao vulneraveis a wildcards do usuario (`%`, `_`) e, no caso do `.or()`, a quebra
 * de sintaxe via `,` e `)`. Sem escape, um usuario com termo `100%` casa qualquer coisa
 * e um termo com virgula corrompe o filtro inteiro.
 */

/**
 * Escapa caracteres especiais do padrao ILIKE do Postgres.
 * - `%` e `_` viram literais (`\%`, `\_`)
 * - `\` precisa ser duplicado antes
 *
 * @param {string | null | undefined} term
 * @returns {string}
 */
export function escapeIlike(term) {
  if (term == null) return '';
  return String(term)
    .replace(/\\/g, '\\\\')
    .replace(/%/g, '\\%')
    .replace(/_/g, '\\_');
}

/**
 * Padrao ILIKE pronto pra embutir num filtro do PostgREST, JA ENTRE ASPAS.
 *
 * Por que aspas e nao barra invertida: o PostgREST NAO reconhece `\)` ou `\,`
 * como escape fora de aspas. Ele le a barra como parte do valor e o `)` como
 * fim do grupo — o padrao que chega no Postgres vira `%\`, terminando em
 * caractere de escape, e o banco recusa com "LIKE pattern must not end with
 * escape character". Buscar por ")" quebrava a tela inteira.
 *
 * A ordem dos dois escapes importa e nao e intercambiavel:
 *   1. LIKE   — `%` e `_` viram literais (o usuario nao pode usar curinga);
 *   2. ASPAS  — barra e aspa sao dobradas pro PostgREST devolver ao Postgres
 *               exatamente o que o passo 1 produziu.
 * Inverter isso faria o passo 2 desfazer o passo 1.
 */
export function ilikeQuoted(term) {
  const paraLike = escapeIlike(term);
  const dentroDasAspas = paraLike.replace(/\\/g, '\\\\').replace(/"/g, '\\"');
  return `"%${dentroDasAspas}%"`;
}

/**
 * Monta a expressao `.or()` de busca em varias colunas.
 *
 * Existe pra que ninguem monte a string na mao: era assim que a citacao ficava
 * de fora e a busca por ")" ou "," derrubava a tela.
 *
 * @example query.or(orIlike(['name', 'email', 'phone'], termo))
 */
export function orIlike(colunas, term) {
  const p = ilikeQuoted(term);
  return colunas.map(c => `${c}.ilike.${p}`).join(',');
}
