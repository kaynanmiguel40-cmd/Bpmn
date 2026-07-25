import { describe, it, expect } from 'vitest';
import { autorDaLigacao } from '../ligacoes';

// Contagem no placar: 1 tarefa de ligacao = 1 ligacao (o "(3 tentativas)" do
// titulo NAO multiplica — e teto, nao realizado). Isso vive no service; aqui so
// resta a regra de ATRIBUICAO.
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
    expect(autorDaLigacao(null)).toBeNull();
  });
});

// Modelo de desfecho do placar (crmDailyService), agora sem multiplicador: cada
// tarefa cai INTEIRA num balde, entao a invariante sai de graca.
describe('desfecho — 1 tarefa cai inteira num balde', () => {
  const desfecho = (rows) => rows.reduce((acc, r) => {
    acc.calls += 1;
    if (r.contacted === true) acc.atendidas += 1;
    else if (r.contacted === false) acc.naoAtendidas += 1;
    else acc.semDesfecho += 1;
    return acc;
  }, { calls: 0, atendidas: 0, naoAtendidas: 0, semDesfecho: 0 });

  it('uma tarefa "(3 tentativas)" atendida conta 1 atendida, nao 3', () => {
    const r = desfecho([{ title: 'D0 manhã — Ligação (3 tentativas)', contacted: true }]);
    expect(r).toMatchObject({ calls: 1, atendidas: 1, naoAtendidas: 0, semDesfecho: 0 });
  });

  it('a invariante atendidas + naoAtendidas + semDesfecho = calls fecha', () => {
    const r = desfecho([
      { title: 'D0 manhã — Ligação (3 tentativas)', contacted: true },
      { title: 'D2 tarde — Ligação (3 tentativas)', contacted: false },
      { title: 'Ligação', contacted: null },
      { title: 'Ligar 2 vezes', contacted: true },
    ]);
    expect(r.calls).toBe(4);
    expect(r.atendidas + r.naoAtendidas + r.semDesfecho).toBe(r.calls);
    expect(r).toMatchObject({ atendidas: 2, naoAtendidas: 1, semDesfecho: 1 });
  });
});
