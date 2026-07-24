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
