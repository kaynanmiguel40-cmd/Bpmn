import { describe, it, expect } from 'vitest';
import { escapeIlike, ilikeQuoted, orIlike } from '../searchFilters';

describe('escapeIlike', () => {
  it('devolve string vazia para null/undefined', () => {
    expect(escapeIlike(null)).toBe('');
    expect(escapeIlike(undefined)).toBe('');
  });

  it('coage valores nao-string para string', () => {
    expect(escapeIlike(42)).toBe('42');
  });

  it('passa texto normal sem mexer', () => {
    expect(escapeIlike('joao silva')).toBe('joao silva');
    expect(escapeIlike('cliente@email.com')).toBe('cliente@email.com');
  });

  it('escapa wildcards % e _', () => {
    expect(escapeIlike('100%')).toBe('100\\%');
    expect(escapeIlike('nome_completo')).toBe('nome\\_completo');
    expect(escapeIlike('a_b%c')).toBe('a\\_b\\%c');
  });

  it('escapa backslash antes de wildcards', () => {
    expect(escapeIlike('a\\b')).toBe('a\\\\b');
    expect(escapeIlike('a\\%b')).toBe('a\\\\\\%b');
  });
});

/**
 * O bug que isto trava: buscar por ")" derrubava a tela com "LIKE pattern must
 * not end with escape character".
 *
 * A correção anterior escapava com barra invertida (`\)`), mas o PostgREST NÃO
 * reconhece isso fora de aspas — ele lia a barra como parte do valor e o `)`
 * como fim do grupo. O padrão que chegava no Postgres era `%\`, terminado em
 * caractere de escape, e o banco recusava. A forma que funciona é aspear.
 */
describe('ilikeQuoted', () => {
  it('devolve o padrão entre aspas, com os curingas dentro', () => {
    expect(ilikeQuoted('joao')).toBe('"%joao%"');
  });

  it('caractere que quebra a sintaxe do PostgREST fica seguro dentro das aspas', () => {
    // Nenhum destes precisa (nem pode) de barra invertida: as aspas resolvem.
    expect(ilikeQuoted(')')).toBe('"%)%"');
    expect(ilikeQuoted('a,b')).toBe('"%a,b%"');
    expect(ilikeQuoted('maria (silva)')).toBe('"%maria (silva)%"');
  });

  // O usuário não pode usar curinga: buscar "100%" tem que achar "100%", não
  // qualquer coisa que comece com 100.
  it('curinga do LIKE continua escapado', () => {
    // O `\` do LIKE chega DOBRADO no filtro, pra que o PostgREST devolva ao
    // Postgres exatamente um `\%` — o percent literal.
    expect(ilikeQuoted('100%')).toBe('"%100\\\\%%"');
    expect(ilikeQuoted('a_b')).toBe('"%a\\\\_b%"');
  });

  // A ordem dos dois escapes importa: o de aspas precisa preservar o do LIKE,
  // não desfazê-lo.
  it('aspa e barra do usuário são escapadas pro PostgREST', () => {
    expect(ilikeQuoted('a"b')).toBe('"%a\\"b%"');
    expect(ilikeQuoted('a\\b')).toBe('"%a\\\\\\\\b%"');
  });

  it('vazio e nulo não quebram', () => {
    expect(ilikeQuoted('')).toBe('"%%"');
    expect(ilikeQuoted(null)).toBe('"%%"');
  });
});

describe('orIlike', () => {
  it('monta o filtro pra várias colunas com o mesmo padrão', () => {
    expect(orIlike(['name', 'email'], 'joao'))
      .toBe('name.ilike."%joao%",email.ilike."%joao%"');
  });

  // Existe pra que ninguém monte a string à mão — era assim que a citação
  // ficava de fora e a busca por ")" derrubava a tela.
  it('o termo com parêntese não vaza pra sintaxe do filtro', () => {
    expect(orIlike(['name'], ')')).toBe('name.ilike."%)%"');
  });
});
