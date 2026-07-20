import { describe, it, expect } from 'vitest';
import { scoreLead, stageRankOf, ordenarPorPrioridade, DIAS_ABANDONO, categoriaOrigem, forcaDaOrigem } from '../leadScore';

/** Lead neutro: nada a favor, nada contra. */
const base = {
  stageRank: 0, diasDesdeEntrada: 30, diasSemContato: 30,
  tentativasSemContato: 0, respondeuAlgumaVez: false,
  temCompromisso: false, estrelas: 0,
};
const s = (over) => scoreLead({ ...base, ...over }).score;

describe('scoreLead — speed to lead', () => {
  // O fator mais estudado em vendas: a chance de qualificar despenca em horas.
  // Um lead que entrou hoje tem que ganhar de um igual que entrou semana passada.
  it('lead que entrou hoje vale mais que o mesmo lead com 7 dias', () => {
    expect(s({ diasDesdeEntrada: 0 })).toBeGreaterThan(s({ diasDesdeEntrada: 7 }));
  });

  it('mais da metade do valor some no primeiro dia', () => {
    const d0 = s({ diasDesdeEntrada: 0 });
    const d1 = s({ diasDesdeEntrada: 1 });
    const d7 = s({ diasDesdeEntrada: 7 });
    const ganhoTotal = d0 - d7;
    const perdidoNoDia1 = d0 - d1;
    // Uma reta perderia ~1/7 no primeiro dia. A janela real fecha em horas.
    expect(perdidoNoDia1 / ganhoTotal).toBeGreaterThan(0.5);
  });

  it('depois de 7 dias o frescor não conta mais', () => {
    expect(s({ diasDesdeEntrada: 8 })).toBe(s({ diasDesdeEntrada: 60 }));
  });
});

describe('scoreLead — engajamento vale mais que insistência', () => {
  it('quem já respondeu vale mais que quem nunca respondeu', () => {
    expect(s({ respondeuAlgumaVez: true })).toBeGreaterThan(s({ respondeuAlgumaVez: false }));
  });

  // Sem esta penalidade, o lead que nunca atende sobe pra sempre — porque
  // "está parado há muito tempo" — e ocupa a manhã de quem trabalha.
  it('cada tentativa sem atender derruba o valor do próximo toque', () => {
    expect(s({ tentativasSemContato: 5 })).toBeLessThan(s({ tentativasSemContato: 1 }));
  });

  it('a penalidade tem piso — não vira dívida infinita', () => {
    expect(s({ tentativasSemContato: 20 })).toBe(s({ tentativasSemContato: 10 }));
  });
});

describe('scoreLead — tempo parado é ambíguo, e o modelo sabe disso', () => {
  // O ponto mais sutil: esperar significa coisas OPOSTAS conforme houve
  // conversa ou não.
  it('lead ENGAJADO parado fica mais urgente — está esfriando', () => {
    const engajado = { respondeuAlgumaVez: true, diasSemContato: 8, diasDesdeEntrada: 30 };
    const recente = { respondeuAlgumaVez: true, diasSemContato: 1, diasDesdeEntrada: 30 };
    expect(s(engajado)).toBeGreaterThan(s(recente));
  });

  it('lead que NUNCA respondeu parado fica menos urgente — está morto', () => {
    const morto = { respondeuAlgumaVez: false, diasSemContato: DIAS_ABANDONO + 5 };
    const novo = { respondeuAlgumaVez: false, diasSemContato: 1 };
    expect(s(morto)).toBeLessThan(s(novo));
  });

  it('esfriando não vira abandono: o engajado nunca leva a penalidade', () => {
    const engajadoParado = s({ respondeuAlgumaVez: true, diasSemContato: 30 });
    const frioParado = s({ respondeuAlgumaVez: false, diasSemContato: 30 });
    expect(engajadoParado).toBeGreaterThan(frioParado);
  });
});

describe('scoreLead — funil e compromisso', () => {
  it('fundo de funil vale mais por hora investida', () => {
    expect(s({ stageRank: 1 })).toBeGreaterThan(s({ stageRank: 0 }));
  });

  it('reunião marcada pesa — é o mais perecível do funil', () => {
    expect(s({ temCompromisso: true })).toBeGreaterThan(s({ temCompromisso: false }));
  });

  // A estrela tempera, não decide: qualidade sem contato não fecha venda.
  it('5 estrelas não supera engajamento real', () => {
    const soEstrelas = s({ estrelas: 5 });
    const engajadoSemEstrela = s({ estrelas: 0, respondeuAlgumaVez: true });
    expect(engajadoSemEstrela).toBeGreaterThan(soEstrelas);
  });
});

describe('scoreLead — o número é explicável', () => {
  // Um score que reordena o dia sem dizer por quê não é usado: é contornado.
  it('devolve o motivo junto do número', () => {
    const r = scoreLead({ ...base, diasDesdeEntrada: 0, respondeuAlgumaVez: true });
    expect(r.motivos).toContain('Entrou agora — janela quente');
    expect(r.motivos).toContain('Já respondeu antes');
  });

  // O score CRU pode ser negativo de propósito: travar em zero empataria todos
  // os leads ruins, e é entre eles que a fila decide quem fica pro fim.
  it('o score cru distingue leads ruins; o de exibição é que fica em 0-100', () => {
    const pessimo = scoreLead({ ...base, tentativasSemContato: 10, diasSemContato: 90 });
    const ruim = scoreLead({ ...base, tentativasSemContato: 1, diasSemContato: 90 });
    expect(pessimo.score).toBeLessThan(ruim.score);
    expect(pessimo.display).toBeGreaterThanOrEqual(0);

    const otimo = scoreLead({ ...base, stageRank: 1, diasDesdeEntrada: 0, diasSemContato: 5, respondeuAlgumaVez: true, temCompromisso: true, estrelas: 5 });
    expect(otimo.display).toBeLessThanOrEqual(100);
  });
});

describe('stageRankOf', () => {
  it('primeira etapa é 0, última é 1', () => {
    expect(stageRankOf(0, 5)).toBe(0);
    expect(stageRankOf(4, 5)).toBe(1);
  });

  it('pipeline de uma etapa só não quebra', () => {
    expect(stageRankOf(0, 1)).toBe(0);
  });
});

describe('ordenarPorPrioridade — o arrasto vence o score', () => {
  // A promessa feita ao usuário: arrastar o card pro topo funciona. Se o score
  // pudesse desfazer isso, o gesto não significaria nada.
  it('card fixado à mão vem antes de qualquer card com score alto', () => {
    const r = ordenarPorPrioridade([
      { id: 'score-alto', score: 95, positionExplicita: false },
      { id: 'arrastado', score: 10, positionExplicita: true, position: 100 },
    ]);
    expect(r[0].id).toBe('arrastado');
  });

  it('entre os não fixados, o score decide', () => {
    const r = ordenarPorPrioridade([
      { id: 'baixo', score: 20, positionExplicita: false },
      { id: 'alto', score: 80, positionExplicita: false },
    ]);
    expect(r[0].id).toBe('alto');
  });

  it('entre os fixados, a ordem do arrasto decide', () => {
    const r = ordenarPorPrioridade([
      { id: 'segundo', score: 99, positionExplicita: true, position: 200 },
      { id: 'primeiro', score: 1, positionExplicita: true, position: 100 },
    ]);
    expect(r[0].id).toBe('primeiro');
  });
});

/**
 * Origem entra por DOIS caminhos: o quanto o canal converte (medido) e o quanto
 * se perde se aquele lead morrer (custo). Só conversão manda o lead pago pro fim
 * da fila — e o dinheiro dele já foi gasto.
 */
describe('scoreLead — origem, custo e a armadilha do dado enviesado', () => {
  const hoje = { stageRank: 0.2, diasDesdeEntrada: 0, diasSemContato: 0, estrelas: 3 };

  // O lead pago é o mais caro da casa: perdê-lo é prejuízo no caixa, não custo
  // de oportunidade. Ele ganha mesmo tendo a PIOR taxa de conversão medida —
  // taxa que, aliás, foi medida sob o processo que o deixava esperando.
  it('lead de tráfego vence lead de indicação no mesmo dia', () => {
    const trafego = scoreLead({ ...hoje, source: 'Tráfego pago' }).score;
    const indicacao = scoreLead({ ...hoje, source: 'Indicação do cliente' }).score;
    expect(trafego).toBeGreaterThan(indicacao);
  });

  it('prospecção ativa fica por último — não custou dinheiro nem converte bem', () => {
    const alvos = ['Tráfego pago', 'Indicação do cliente', 'Indicação de parceiro (Edson)']
      .map(src => scoreLead({ ...hoje, source: src }).score);
    const prospeccao = scoreLead({ ...hoje, source: 'Prospecção ativa' }).score;
    alvos.forEach(v => expect(prospeccao).toBeLessThan(v));
  });

  // A janela do lead pago é de minutos, não de dias: ele clicou num anúncio e
  // está comprando AGORA. A indicação espera — a confiança já foi emprestada.
  it('o frescor do lead pago decai de um patamar mais alto', () => {
    const ganhoTrafego = scoreLead({ ...hoje, source: 'Tráfego pago' }).score
      - scoreLead({ ...hoje, diasDesdeEntrada: 30, source: 'Tráfego pago' }).score;
    const ganhoIndicacao = scoreLead({ ...hoje, source: 'Indicação do cliente' }).score
      - scoreLead({ ...hoje, diasDesdeEntrada: 30, source: 'Indicação do cliente' }).score;
    expect(ganhoTrafego).toBeGreaterThan(ganhoIndicacao);
  });

  it('o motivo diz que o lead custou dinheiro', () => {
    expect(scoreLead({ ...hoje, source: 'Tráfego pago' }).motivos)
      .toContain('Lead pago — custou dinheiro');
  });

  // O campo é texto livre e está em 29 variantes do mesmo conceito.
  it('reconhece as variantes escritas à mão', () => {
    expect(categoriaOrigem('Indicação de parceiro (Robert)')).toBe('parceiro');
    expect(categoriaOrigem('Indicação parceiro Edson')).toBe('parceiro');
    expect(categoriaOrigem('Tráfego pago')).toBe('trafego');
    expect(categoriaOrigem('Prospecção ativa de parceiros')).toBe('parceiro');
    expect(categoriaOrigem('Lista via Google Meu Negócio')).toBe('prospeccao');
    expect(categoriaOrigem('')).toBe('desconhecida');
    expect(categoriaOrigem(null)).toBe('desconhecida');
  });

  // Origem em branco não pode ser premiada nem punida por um dado que ninguém
  // preencheu — fica no meio da tabela.
  it('origem desconhecida fica entre a melhor e a pior', () => {
    const desconhecida = forcaDaOrigem('desconhecida');
    expect(desconhecida).toBeLessThan(forcaDaOrigem('trafego'));
    expect(desconhecida).toBeGreaterThan(forcaDaOrigem('prospeccao'));
  });
});
