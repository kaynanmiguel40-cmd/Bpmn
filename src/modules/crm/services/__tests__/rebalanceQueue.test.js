import { describe, it, expect } from 'vitest';
import { rebalanceQueue, dayKey } from '../crmScheduling';

// Segunda-feira, 9h da manhã. Fixo para o teste não depender do relógio.
const SEG = new Date(2026, 6, 20, 9, 0);
const dia = (n) => new Date(2026, 6, 20 + n);
const hhmm = (d) => `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;

/**
 * Tarefa mínima. `rank` = posição na coluna do Kanban (menor = mais em cima =
 * atende antes). `priority` = estrelas (qualidade), só desempata.
 */
const tarefa = (id, dealId, rank, nb = 0, seq = 0, extra = {}) =>
  ({ id, dealId, rank, priority: 0, notBefore: dia(nb), seq, ...extra });

const porId = (plano) => Object.fromEntries(plano.map(p => [p.id, p.start]));

describe('rebalanceQueue — a ordem do Kanban manda', () => {
  // O caso do Pablo: ele liga dizendo "quero fechar agora", você arrasta o card
  // dele pro topo, e as tarefas dele passam na frente das do João.
  it('quem está mais em cima na coluna pega os slots mais cedo', () => {
    const plano = rebalanceQueue([
      tarefa('joao-1', 'joao', 200),
      tarefa('pablo-1', 'pablo', 100),
    ], { from: SEG });

    const p = porId(plano);
    expect(p['pablo-1'].getTime()).toBeLessThan(p['joao-1'].getTime());
  });

  // O ponto do modelo escolhido: a decisão explícita de ordem VENCE a
  // qualidade. Arrastar pro topo tem que funcionar mesmo pra lead de 2
  // estrelas — senão o gesto não significa nada.
  it('a ordem vence a estrela: card no topo passa na frente do lead 5 estrelas', () => {
    const plano = rebalanceQueue([
      { id: 'joao', dealId: 'joao', rank: 200, priority: 5, notBefore: dia(0), seq: 0 },
      { id: 'pablo', dealId: 'pablo', rank: 100, priority: 2, notBefore: dia(0), seq: 0 },
    ], { from: SEG });

    const p = porId(plano);
    expect(p['pablo'].getTime()).toBeLessThan(p['joao'].getTime());
  });

  // A estrela não é decoração: ela decide entre leads na MESMA altura.
  it('empatados na coluna, mais estrelas vai antes', () => {
    const plano = rebalanceQueue([
      { id: 'fraco', dealId: 'a', rank: 100, priority: 1, notBefore: dia(0), seq: 0 },
      { id: 'bom', dealId: 'b', rank: 100, priority: 5, notBefore: dia(0), seq: 0 },
    ], { from: SEG });

    const p = porId(plano);
    expect(p['bom'].getTime()).toBeLessThan(p['fraco'].getTime());
  });

  it('sem ordem nem estrela, quem amadureceu antes vai antes', () => {
    const plano = rebalanceQueue([
      { id: 'b', dealId: 'lead-b', notBefore: dia(2), seq: 1 },
      { id: 'a', dealId: 'lead-a', notBefore: dia(0), seq: 0 },
    ], { from: SEG });

    const p = porId(plano);
    expect(p['a'].getTime()).toBeLessThan(p['b'].getTime());
  });
});

describe('rebalanceQueue — ninguém viaja no tempo', () => {
  // A regra que impede o algoritmo de virar "faz tudo hoje": o espaçamento da
  // cadência existe pra dar respiro ao lead. Comprimir por ansiedade é o
  // oposto de cadência.
  it('prioridade máxima NÃO puxa o follow-up de D7 pra hoje', () => {
    const plano = rebalanceQueue([tarefa('d7', 'vip', 100, 7)], { from: SEG });
    const start = porId(plano)['d7'];
    expect(dayKey(start)).toBe(dayKey(dia(7)));
  });

  it('tarefa cujo dia já passou é puxada pra hoje, não pro passado', () => {
    const atrasada = { id: 'velha', dealId: 'x', rank: 100, notBefore: dia(-5), seq: 0 };
    const start = porId(rebalanceQueue([atrasada], { from: SEG }))['velha'];
    expect(dayKey(start)).toBe(dayKey(SEG));
    // E depois do "agora" — não às 9h em ponto, que já passou.
    expect(start.getTime()).toBeGreaterThan(SEG.getTime());
  });
});

describe('rebalanceQueue — a ordem dentro do lead é sagrada', () => {
  it('o 2º toque nunca cai antes do 1º, mesmo com prioridade alta', () => {
    const plano = rebalanceQueue([
      tarefa('t2', 'vip', 100, 0, 2),
      tarefa('t1', 'vip', 100, 0, 1),
    ], { from: SEG });

    const p = porId(plano);
    expect(p['t1'].getTime()).toBeLessThan(p['t2'].getTime());
  });

  it('dois toques do mesmo lead no mesmo dia não invertem', () => {
    const plano = rebalanceQueue([
      tarefa('manha', 'vip', 100, 0, 1, { period: 'manha' }),
      tarefa('tarde', 'vip', 100, 0, 2, { period: 'tarde' }),
    ], { from: SEG });

    const p = porId(plano);
    expect(p['manha'].getHours()).toBeLessThan(12);
    expect(p['tarde'].getHours()).toBeGreaterThanOrEqual(12);
  });
});

describe('rebalanceQueue — o buraco se fecha sozinho', () => {
  // O caso do "para de me ligar": as tarefas do lead morto somem da lista, e
  // as que sobraram sobem pra ocupar os horários que vagaram. Não há lacuna a
  // varrer — ela simplesmente não é escolhida por ninguém.
  it('remover um lead faz os seguintes subirem', () => {
    const todos = [
      tarefa('morto-1', 'morto', 100, 0, 1),
      tarefa('morto-2', 'morto', 100, 0, 2),
      tarefa('vivo-1', 'vivo', 200, 0, 1),
    ];
    const antes = porId(rebalanceQueue(todos, { from: SEG }))['vivo-1'];

    const semOMorto = todos.filter(t => t.dealId !== 'morto');
    const depois = porId(rebalanceQueue(semOMorto, { from: SEG }))['vivo-1'];

    expect(depois.getTime()).toBeLessThan(antes.getTime());
  });
});

describe('rebalanceQueue — respeita a agenda que já existe', () => {
  it('não marca em cima de compromisso que não é remanejável', () => {
    const ocupado = {
      [dayKey(SEG)]: [{
        start: new Date(2026, 6, 20, 9, 30).toISOString(),
        end: new Date(2026, 6, 20, 10, 30).toISOString(),
      }],
    };
    const start = porId(rebalanceQueue([tarefa('t', 'x', 100)], { from: SEG, busyByDay: ocupado }))['t'];
    const min = start.getHours() * 60 + start.getMinutes();
    // A reunião ocupa 09:30–10:30: a tarefa tem que cair fora dessa janela.
    expect(min < 9 * 60 + 30 || min >= 10 * 60 + 30).toBe(true);
  });

  it('nunca marca no almoço nem no fim de semana', () => {
    const muitas = Array.from({ length: 40 }, (_, i) => tarefa(`t${i}`, `d${i}`, (i + 1) * 100));
    for (const { start } of rebalanceQueue(muitas, { from: SEG })) {
      const min = start.getHours() * 60 + start.getMinutes();
      expect(min).toBeGreaterThanOrEqual(9 * 60);
      expect(min + 30).toBeLessThanOrEqual(18 * 60);
      expect(min >= 11 * 60 && min < 12 * 60).toBe(false);
      expect([0, 6]).not.toContain(start.getDay());
    }
  });
});

describe('rebalanceQueue — marca o que mudou', () => {
  // Rebalancear 300 tarefas e avisar "300 alteradas" quando 4 mudaram de lugar
  // seria alarme falso — e alarme falso ensina a ignorar o alarme.
  it('tarefa que ficou no mesmo horário não conta como movida', () => {
    const t = { id: 'a', dealId: 'x', rank: 100, notBefore: dia(1), seq: 0 };
    const primeiro = rebalanceQueue([t], { from: SEG })[0];
    const segundo = rebalanceQueue([{ ...t, startDate: primeiro.start.toISOString() }], { from: SEG })[0];
    expect(segundo.movida).toBe(false);
  });

  it('lista vazia devolve vazio', () => {
    expect(rebalanceQueue([], { from: SEG })).toEqual([]);
    expect(rebalanceQueue(null, { from: SEG })).toEqual([]);
  });
});
