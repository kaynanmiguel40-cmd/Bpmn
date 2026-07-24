import { describe, it, expect } from 'vitest';
import { tentativasDaTarefa, contarLigacoes, autorDaLigacao } from '../ligacoes';

describe('tentativasDaTarefa — um card pode valer varias discadas', () => {
  it('conta as tentativas declaradas no titulo do passo', () => {
    expect(tentativasDaTarefa('D0 manhã — Ligação (3 tentativas)')).toBe(3);
    expect(tentativasDaTarefa('D12 tarde — Ligação (3 tentativas, direta)')).toBe(3);
  });

  it('ignora o numero do DIA no prefixo (D12 nao vira 12 ligacoes)', () => {
    // O que vem depois do 12 e " manhã", nao "tentativas" — so o 3 casa.
    expect(tentativasDaTarefa('D12 manhã — Ligação (3 tentativas)')).toBe(3);
    expect(tentativasDaTarefa('D14 tarde — Ligação + despedida')).toBe(1);
  });

  it('"Tentativa 2" e ORDINAL, nao duas ligacoes', () => {
    // Numero DEPOIS da palavra = ordem do toque na sequencia.
    expect(tentativasDaTarefa('Cadência · Tentativa 2 — WhatsApp / Ligação')).toBe(1);
    expect(tentativasDaTarefa('Cadência · Tentativa 5 — Break-up')).toBe(1);
  });

  it('aceita as outras formas de dizer a mesma coisa', () => {
    expect(tentativasDaTarefa('Ligar 3 vezes')).toBe(3);
    expect(tentativasDaTarefa('Ligação 2x')).toBe(2);
    expect(tentativasDaTarefa('Ligar 1 vez')).toBe(1);
  });

  it('sem numero declarado, vale 1', () => {
    expect(tentativasDaTarefa('Ligação')).toBe(1);
    expect(tentativasDaTarefa('')).toBe(1);
    expect(tentativasDaTarefa(null)).toBe(1);
    expect(tentativasDaTarefa(undefined)).toBe(1);
  });

  it('teto de sanidade: titulo absurdo nao explode o placar', () => {
    expect(tentativasDaTarefa('Ligação 500x')).toBe(20);
    expect(tentativasDaTarefa('Ligação (0 tentativas)')).toBe(1);
  });
});

describe('contarLigacoes', () => {
  it('soma cada tarefa pelo proprio peso', () => {
    const rows = [
      { title: 'D0 manhã — Ligação (3 tentativas)' },  // 3
      { title: 'Ligação' },                             // 1
      { title: 'Ligar 2 vezes' },                       // 2
    ];
    expect(contarLigacoes(rows)).toBe(6);
  });

  it('lista vazia/nula = 0', () => {
    expect(contarLigacoes([])).toBe(0);
    expect(contarLigacoes(null)).toBe(0);
  });
});

// Modelo de desfecho do placar (crmDailyService): num toque de N tentativas o
// vendedor responde UMA vez se falou. A invariante que sustenta o numero:
//   atendidas + naoAtendidas + semDesfecho === total de ligacoes
describe('desfecho x tentativas — a conta tem que fechar', () => {
  const desfecho = (rows) => rows.reduce((acc, r) => {
    const n = tentativasDaTarefa(r.title);
    if (r.contacted === true) { acc.atendidas += 1; acc.naoAtendidas += n - 1; }
    else if (r.contacted === false) { acc.naoAtendidas += n; }
    else { acc.semDesfecho += n; }
    acc.calls += n;
    return acc;
  }, { calls: 0, atendidas: 0, naoAtendidas: 0, semDesfecho: 0 });

  it('falou num toque de 3 tentativas: 1 atendida, 2 nao (nao se fala 3x com a mesma pessoa)', () => {
    const r = desfecho([{ title: 'D0 manhã — Ligação (3 tentativas)', contacted: true }]);
    expect(r).toMatchObject({ calls: 3, atendidas: 1, naoAtendidas: 2, semDesfecho: 0 });
  });

  it('nao falou: as 3 tentativas queimaram', () => {
    const r = desfecho([{ title: 'D0 manhã — Ligação (3 tentativas)', contacted: false }]);
    expect(r).toMatchObject({ calls: 3, atendidas: 0, naoAtendidas: 3, semDesfecho: 0 });
  });

  it('sem informar: fica fora da conta, nem sucesso nem fracasso', () => {
    const r = desfecho([{ title: 'D0 manhã — Ligação (3 tentativas)', contacted: null }]);
    expect(r).toMatchObject({ calls: 3, atendidas: 0, naoAtendidas: 0, semDesfecho: 3 });
  });

  it('ligacao simples que atendeu nao gera "nao atendida" negativa', () => {
    const r = desfecho([{ title: 'Ligação', contacted: true }]);
    expect(r).toMatchObject({ calls: 1, atendidas: 1, naoAtendidas: 0 });
  });

  it('a invariante fecha numa mistura real', () => {
    const r = desfecho([
      { title: 'D0 manhã — Ligação (3 tentativas)', contacted: true },
      { title: 'D2 tarde — Ligação (3 tentativas)', contacted: false },
      { title: 'Ligação', contacted: null },
      { title: 'Ligar 2 vezes', contacted: true },
    ]);
    expect(r.atendidas + r.naoAtendidas + r.semDesfecho).toBe(r.calls);
    expect(r.calls).toBe(9); // 3 + 3 + 1 + 2
  });
});

describe('autorDaLigacao — quem concluiu vem primeiro', () => {
  it('prefere completed_by', () => {
    expect(autorDaLigacao({ completed_by: 'a', assigned_to: 'b', created_by: 'c' })).toBe('a');
  });
  it('cai pro responsavel quando ninguem registrou quem concluiu', () => {
    expect(autorDaLigacao({ completed_by: null, assigned_to: 'b', created_by: 'c' })).toBe('b');
  });
  it('cai pro criador em ultimo caso (tarefa de cadencia nasce sem created_by)', () => {
    expect(autorDaLigacao({ created_by: 'c' })).toBe('c');
    expect(autorDaLigacao({})).toBeNull();
  });
});
