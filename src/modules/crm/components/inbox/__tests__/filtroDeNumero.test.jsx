import { describe, it, expect } from 'vitest';
import { numberIdentity, numberLabel } from '../numberIdentity';

/**
 * A barra de números do inbox mostrava 4-5 pastilhas para 2 chips de verdade.
 * A base tem o MESMO número cadastrado duas vezes (como 'default' e como
 * 'fyness-principal') e um 'crmfyness' desconectado desde maio — então o filtro
 * que deveria organizar virou o motivo da confusão.
 *
 * O critério de corte é ESTAR CONECTADO, não ter poucas mensagens: número novo
 * começa com zero e precisa aparecer no primeiro dia.
 */
const vivas = (instances) => {
  const v = (instances || []).filter((i) => i.status === 'connected' && i.phoneNumber);
  return v.length > 0 ? v : (instances || []);
};

const BASE = [
  { instanceName: 'lorena-consultora', phoneNumber: '553584282346', status: 'connected' },
  { instanceName: 'default',           phoneNumber: '553584222295', status: 'connected' },
  { instanceName: 'fyness-principal',  phoneNumber: '553584222295', status: 'connected' },
  { instanceName: 'crmfyness',         phoneNumber: '553592285099', status: 'disconnected' },
];

describe('pastilhas de número', () => {
  it('número desconectado não vira pastilha', () => {
    const { order } = numberIdentity(vivas(BASE));
    expect(order.map((o) => o.phone)).not.toContain('553592285099');
  });

  // O mesmo chip cadastrado duas vezes é UM número. Duas pastilhas pro mesmo
  // telefone é escolha sem diferença — clicar numa ou noutra dá a mesma lista.
  it('o mesmo telefone em duas instâncias vira uma pastilha só', () => {
    const { order } = numberIdentity(vivas(BASE));
    const desseNumero = order.filter((o) => o.phone === '553584222295');
    expect(desseNumero).toHaveLength(1);
  });

  it('sobram exatamente os 2 chips reais', () => {
    const { order } = numberIdentity(vivas(BASE));
    expect(order).toHaveLength(2);
    expect(order.map((o) => o.phone).sort()).toEqual(['553584222295', '553584282346']);
  });

  /**
   * Se NADA está conectado, mostra tudo. Uma barra imperfeita é melhor que uma
   * tela sem jeito nenhum de trocar de número — nesse estado a pessoa ficaria
   * presa no filtro sem saber por quê.
   */
  it('com tudo desconectado, ainda dá pra escolher', () => {
    const mortas = BASE.map((i) => ({ ...i, status: 'disconnected' }));
    expect(numberIdentity(vivas(mortas)).order.length).toBeGreaterThan(0);
  });

  it('instância sem telefone sincronizado não vira pastilha vazia', () => {
    const semFone = [{ instanceName: 'nova', phoneNumber: null, status: 'connected' }, ...BASE];
    const { order } = numberIdentity(vivas(semFone));
    expect(order.every((o) => !!o.phone)).toBe(true);
  });

  it('cada número tem cor própria', () => {
    const { order } = numberIdentity(vivas(BASE));
    expect(new Set(order.map((o) => o.color)).size).toBe(order.length);
  });
});

/**
 * O rótulo sai do nome da instância. 'default' produziria uma pastilha chamada
 * "Default", que não diz nada — mas ele divide o telefone com
 * 'fyness-principal', e o dedup fica com a PRIMEIRA da lista. A ordem em que as
 * instâncias chegam decide o nome que aparece na tela.
 */
describe('rótulo do número', () => {
  it('usa a primeira parte do nome da instância', () => {
    expect(numberLabel('lorena-consultora')).toBe('Lorena');
    expect(numberLabel('fyness-principal')).toBe('Fyness');
  });

  /**
   * O caso real: '553584222295' está cadastrado como 'default' (criado antes) e
   * como 'fyness-principal'. A lista chega por created_at, então o dedup ficava
   * com o mais antigo e a pastilha saía escrita "Default" — um nome que não diz
   * nada pra quem está olhando a tela.
   *
   * Vence a instância usada por ÚLTIMO: é a que a Evolution mantém viva, e por
   * isso a que carrega o nome atual.
   */
  it('entre instâncias do mesmo chip, o rótulo vem da usada por último', () => {
    const comoVemDoBanco = numberIdentity([
      { instanceName: 'default',          phoneNumber: '553584222295', status: 'connected', updatedAt: '2026-06-18' },
      { instanceName: 'fyness-principal', phoneNumber: '553584222295', status: 'connected', updatedAt: '2026-07-20' },
    ]);
    expect(comoVemDoBanco.order[0].label).toBe('Fyness');
  });

  it('sem data de uso, mantém a ordem que chegou', () => {
    const { order } = numberIdentity([
      { instanceName: 'fyness-principal', phoneNumber: '553584222295', status: 'connected' },
      { instanceName: 'default',          phoneNumber: '553584222295', status: 'connected' },
    ]);
    expect(order[0].label).toBe('Fyness');
  });

  it('instância sem nome não quebra a pastilha', () => {
    expect(numberLabel(null)).toBe('Número ?');
    expect(numberLabel('')).toBe('Número ?');
  });
});
