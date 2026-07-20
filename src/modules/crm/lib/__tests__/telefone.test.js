import { describe, it, expect } from 'vitest';
import { chaveTelefone, mesmoTelefone, apenasDigitos } from '../telefone';

/**
 * O caso real que motivou isto: o WhatsApp entrega `553584153752` e o cadastro
 * guarda `(35) 9768-5526`. Sem normalizar, a conversa nunca encontra o lead —
 * e o inbox virou um universo paralelo ao pipeline.
 */
describe('chaveTelefone', () => {
  it('formatos diferentes do MESMO número dão a mesma chave', () => {
    expect(chaveTelefone('553599032508')).toBe('35-99032508');
    expect(chaveTelefone('(35) 9903-2508')).toBe('35-99032508');
    expect(chaveTelefone('+55 35 99903-2508')).toBe('35-99032508');
    expect(chaveTelefone('35999032508')).toBe('35-99032508');
  });

  // Celular brasileiro ganhou um 9 na frente em 2016; metade das bases guarda
  // com, metade sem. É o mesmo aparelho.
  it('o 9º dígito não separa o número dele mesmo', () => {
    expect(mesmoTelefone('(35) 9903-2508', '(35) 99903-2508')).toBe(true);
  });

  /**
   * O limite oposto: o DDD precisa entrar. Dois finais iguais em estados
   * diferentes são duas pessoas, e uni-las mandaria a conversa de uma pro
   * histórico da outra.
   */
  it('mesmo final em DDD diferente NÃO é a mesma pessoa', () => {
    expect(mesmoTelefone('(35) 9903-2508', '(21) 9903-2508')).toBe(false);
    expect(chaveTelefone('(21) 99903-2508')).toBe('21-99032508');
  });

  it('tira o DDI só quando sobra número plausível', () => {
    expect(chaveTelefone('553584153752')).toBe('35-84153752');
    // 8 dígitos que por acaso começam com 55: cortar destruiria o número.
    // Sem DDD não dá pra afirmar de quem é.
    expect(chaveTelefone('5535-2508')).toBeNull();
  });

  it('número curto demais não vira chave', () => {
    expect(chaveTelefone('9903-2508')).toBeNull();   // sem DDD
    expect(chaveTelefone('12345')).toBeNull();
    expect(chaveTelefone('')).toBeNull();
    expect(chaveTelefone(null)).toBeNull();
  });

  it('número longo demais também não — não é telefone brasileiro', () => {
    expect(chaveTelefone('551199999999999')).toBeNull();
  });

  /**
   * Null não casa com null. Se dois cadastros estão sem telefone, eles NÃO são
   * a mesma pessoa — e juntar leads por ausência de dado seria o pior erro
   * possível aqui: silencioso e irreversível.
   */
  it('incompleto nunca casa com incompleto', () => {
    expect(mesmoTelefone('', '')).toBe(false);
    expect(mesmoTelefone(null, null)).toBe(false);
    expect(mesmoTelefone('123', '456')).toBe(false);
  });

  it('fixo de 10 dígitos funciona igual', () => {
    expect(chaveTelefone('(35) 3521-4400')).toBe('35-35214400');
    expect(mesmoTelefone('3535214400', '+55 35 3521-4400')).toBe(true);
  });

  it('apenasDigitos limpa a formatação', () => {
    expect(apenasDigitos('+55 (35) 9903-2508')).toBe('553599032508');
    expect(apenasDigitos(null)).toBe('');
  });
});
