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
 * Escapa termo para uso dentro de uma expressao `.or()` do PostgREST.
 * Alem dos wildcards ILIKE, escapa caracteres que quebram a sintaxe do `.or()`:
 * virgula (separador de filtros), parenteses, asterisco e aspas.
 *
 * Uso: query.or(`name.ilike.%${escapeOrIlike(term)}%,email.ilike.%${escapeOrIlike(term)}%`)
 *
 * @param {string | null | undefined} term
 * @returns {string}
 */
export function escapeOrIlike(term) {
  const escaped = escapeIlike(term);
  return escaped
    .replace(/,/g, '\\,')
    .replace(/\(/g, '\\(')
    .replace(/\)/g, '\\)')
    .replace(/\*/g, '\\*')
    .replace(/"/g, '\\"');
}
