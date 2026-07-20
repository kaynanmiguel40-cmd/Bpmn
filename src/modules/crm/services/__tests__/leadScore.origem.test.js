import { describe, it, expect } from 'vitest';
import {
  scoreLead, categoriaOrigem, forcaDaOrigem, ordenarPorPrioridade, ORIGEM, PESOS,
} from '../leadScore';

/**
 * A ORIGEM é a parte mais opinativa do score: ela mistura um número medido
 * (conversão, com encolhimento bayesiano) com um julgamento de negócio (custo
 * de aquisição, que ninguém lançou em lugar nenhum). Justamente por ser opinião
 * é que precisa estar travada por teste — mexer num peso sem discutir com o
 * comercial reordena o dia da consultora sem que ninguém perceba.
 *
 * O que já está coberto em leadScore.test.js (e NÃO se repete aqui): tráfego
 * ganhando de indicação no mesmo dia, prospecção em último, o motivo "custou
 * dinheiro", desconhecida no meio da tabela e as variantes Robert/Edson.
 */

/** Lead neutro: nada a favor, nada contra — só a origem fala. */
const base = {
  stageRank: 0, diasDesdeEntrada: 30, diasSemContato: 30,
  tentativasSemContato: 0, respondeuAlgumaVez: false,
  temCompromisso: false, estrelas: 0,
};
const s = (over) => scoreLead({ ...base, ...over }).score;

describe('forcaDaOrigem — a tabela ORIGEM é um contrato com o comercial', () => {
  // Metade a metade é a decisão central do modelo. Só conversão manda o lead
  // pago (pior taxa medida) pro fim da fila, sendo que o dinheiro dele já foi
  // gasto; só custo manda perseguir o caro que nunca fecha.
  it('cada origem vale exatamente metade conversão + metade custo', () => {
    Object.entries(ORIGEM).forEach(([cat, o]) => {
      expect(forcaDaOrigem(cat)).toBeCloseTo(o.conversao * 0.5 + o.custo * 0.5, 10);
    });
  });

  // Números explícitos de propósito: se alguém ajustar um peso na tabela, é AQUI
  // que a mudança tem que doer, não numa reordenação silenciosa da fila.
  it('o valor de cada categoria bate com a tabela publicada', () => {
    expect(forcaDaOrigem('trafego')).toBeCloseTo(0.725, 10);   // 0,45 conv + 1,00 custo
    expect(forcaDaOrigem('indicacao')).toBeCloseTo(0.550, 10); // 1,00 conv + 0,10 custo
    expect(forcaDaOrigem('parceiro')).toBeCloseTo(0.530, 10);  // 0,76 conv + 0,30 custo
    expect(forcaDaOrigem('desconhecida')).toBeCloseTo(0.400, 10);
    expect(forcaDaOrigem('prospeccao')).toBeCloseTo(0.315, 10); // 0,48 conv + 0,15 custo
  });

  // A ordem completa, incluindo o par mais apertado: indicação passa parceiro
  // por 0,02 — converte mais e chega igualmente de graça. É uma diferença de
  // desempate, não de prioridade; quem quiser invertê-la que inverta olhando.
  it('a ordem da tabela é tráfego > indicação > parceiro > desconhecida > prospecção', () => {
    const ordem = ['trafego', 'indicacao', 'parceiro', 'desconhecida', 'prospeccao'];
    const forcas = ordem.map(forcaDaOrigem);
    forcas.forEach((f, i) => {
      if (i > 0) expect(forcas[i - 1]).toBeGreaterThan(f);
    });
  });

  // Categoria que não existe na tabela não pode virar NaN e contaminar o score
  // inteiro — o lead sumiria da ordenação em vez de ficar no meio dela.
  it('categoria fora da tabela cai no peso de desconhecida, não em NaN', () => {
    expect(forcaDaOrigem('inventada')).toBe(forcaDaOrigem('desconhecida'));
    expect(forcaDaOrigem(undefined)).toBe(forcaDaOrigem('desconhecida'));
    expect(Number.isNaN(forcaDaOrigem(null))).toBe(false);
  });
});

describe('urgência da origem mexe SÓ no frescor', () => {
  // A tabela tem dois números que agem em lugares diferentes: `forca` soma
  // sempre, `urgencia` só multiplica a janela de speed-to-lead. Se a urgência
  // vazasse pro resto, lead de tráfego de 3 meses ficaria eternamente inflado.
  const esperadoPelaForca = (a, b) =>
    (forcaDaOrigem(a) - forcaDaOrigem(b)) * PESOS.origem;

  it('entre dois leads antigos, a diferença vem só da força da origem', () => {
    const diff = s({ source: 'Tráfego pago' }) - s({ source: 'Prospecção ativa' });
    // ±1 é o arredondamento do score final, não folga de regra.
    expect(Math.abs(diff - esperadoPelaForca('trafego', 'prospeccao'))).toBeLessThanOrEqual(1);
  });

  it('a mesma diferença aparece com funil, engajamento e compromisso ligados', () => {
    const rico = {
      diasDesdeEntrada: 30, stageRank: 1, respondeuAlgumaVez: true,
      temCompromisso: true, estrelas: 5, diasSemContato: 5,
    };
    const diff = s({ ...rico, source: 'Tráfego pago' }) - s({ ...rico, source: 'Prospecção ativa' });
    expect(Math.abs(diff - esperadoPelaForca('trafego', 'prospeccao'))).toBeLessThanOrEqual(1);
  });

  // Quem clicou num anúncio está comprando AGORA; quem veio por prospecção não
  // pediu nada e pode esperar. O tamanho da janela é o que muda.
  it('o ganho de frescor escala pela urgência da origem', () => {
    const ganho = (source) => s({ source, diasDesdeEntrada: 0 }) - s({ source, diasDesdeEntrada: 30 });
    const gTrafego = ganho('Tráfego pago');        // urgência 1,5
    const gNeutro = ganho('Venda Ernandes');       // urgência 1,0 (desconhecida)
    const gProspeccao = ganho('Prospecção ativa'); // urgência 0,8

    expect(gProspeccao).toBeLessThan(gNeutro);
    expect(gNeutro).toBeLessThan(gTrafego);
    expect(gTrafego / gNeutro).toBeCloseTo(ORIGEM.trafego.urgencia, 1);
    expect(gProspeccao / gNeutro).toBeCloseTo(ORIGEM.prospeccao.urgencia, 1);
  });

  it('passada a janela de 7 dias, a urgência não sobra em lugar nenhum', () => {
    // Dois leads de tráfego (urgência 1,5) só se diferenciam dentro da janela.
    expect(s({ source: 'Tráfego pago', diasDesdeEntrada: 8 }))
      .toBe(s({ source: 'Tráfego pago', diasDesdeEntrada: 300 }));
  });
});

describe('categoriaOrigem — a ordem das regras decide o peso', () => {
  // O campo é texto livre e a base tinha 29 grafias pra ~8 origens reais. As
  // strings abaixo são as que existem de verdade (ver scripts/normalizar_origens.mjs).

  // A regra de parceiro roda ANTES da de indicação de propósito: "Indicação de
  // parceiro (Luan)" é lead de canal, não indicação de conhecido, e pontua
  // diferente. Invertendo a ordem, todo parceiro viraria indicação.
  it('"Indicação de parceiro (X)" é parceiro, não indicação', () => {
    ['Indicação de parceiro (Luan)', 'Indicação de Parceiro (Claudio)',
     'Indicação de Parceiro (James)', 'Indicação do nosso parceiro Luan']
      .forEach(src => expect(categoriaOrigem(src)).toBe('parceiro'));
  });

  // Mesma lógica pelo outro lado: "Prospecção ativa de parceiros" tem as duas
  // palavras, e parceiro vence porque a relação com o parceiro é o que explica
  // a conversão — não o fato de a lista ter sido montada à mão.
  it('quando parceiro e prospecção aparecem juntos, parceiro manda', () => {
    expect(categoriaOrigem('Prospecção ativa de parceiros')).toBe('parceiro');
    expect(categoriaOrigem('Lista de parceiros')).toBe('parceiro');
  });

  // O script de normalização é explícito: estas são indicações de PESSOAS que
  // não estão na tabela de parceiros. Promovê-las a "parceiro" mudaria o peso
  // no score e misturaria canais que o comercial trata de formas diferentes.
  it('indicação de quem não é parceiro continua sendo indicação', () => {
    ['Indicação do Kaua', 'Indicação Guilherme', 'Indicação Kaynan',
     'Indicação Felipe Reis (grafica)', 'Indicacao / WhatsApp', 'Base clientes Sergio']
      .forEach(src => expect(categoriaOrigem(src)).toBe('indicacao'));
  });

  it('prospecção reconhece as variantes sem acento e as listas', () => {
    ['Prospeccao ativa', 'Prospecção ativa', 'Google Maps', 'Lista fria']
      .forEach(src => expect(categoriaOrigem(src)).toBe('prospeccao'));
  });

  it('tráfego reconhece anúncio e a grafia sem acento', () => {
    ['Trafego pago', 'Tráfego pago', 'Anúncio Instagram', 'Anuncio Facebook']
      .forEach(src => expect(categoriaOrigem(src)).toBe('trafego'));
  });

  it('texto sem palavra-chave e campo em branco caem em desconhecida', () => {
    expect(categoriaOrigem('Venda Ernandes')).toBe('desconhecida');
    expect(categoriaOrigem('   ')).toBe('desconhecida');
    expect(categoriaOrigem(undefined)).toBe('desconhecida');
  });

  // ATENÇÃO A QUEM FOR CONSERTAR O BUG DO "Ads" (teste pulado logo abaixo): a
  // sílaba "ad" existe dentro de "cont-AD-or" e a sílaba "ads" dentro de
  // "le-ADS". Um /ads?/ solto na regra de tráfego engoliria as duas origens —
  // e "contador" é canal ATIVO da casa, não anúncio. Só vale com fronteira de
  // palavra. Estes dois testes existem pra quebrar se o conserto for preguiçoso.
  it('lead de contador é parceiro — "contador" tem "ad" dentro, e não é anúncio', () => {
    expect(categoriaOrigem('Indicação Bruno Contador')).toBe('parceiro');
    expect(categoriaOrigem('Indicacao de contador')).toBe('parceiro');
  });

  it('"Leads de Parceiros" é parceiro — "leads" tem "ads" dentro', () => {
    expect(categoriaOrigem('Leads de Parceiros')).toBe('parceiro');
  });

  // BUG — ver relatório. A alternativa que deveria casar "ads" está cercada por
  // dois caracteres BACKSPACE (U+0008) literais no lugar de `\b`, então ela
  // exige um caractere de controle no texto e nunca casa com origem nenhuma.
  // Resultado: "Google Ads" e "Meta Ads" são lidos como origem DESCONHECIDA —
  // perdem o peso de lead pago (0,725 vs 0,400) e a urgência 1,5 do frescor,
  // que é justamente o lead que custou dinheiro.
  it('"Google Ads" e "Meta Ads" são tráfego pago', () => {
    expect(categoriaOrigem('Google Ads')).toBe('trafego');
    expect(categoriaOrigem('Meta Ads')).toBe('trafego');
  });
});

describe('ordenarPorPrioridade — a mão do usuário e os casos de borda', () => {
  // Fixar sem posição definida (backfill, card recém-criado no topo) ainda é
  // fixar: vale 0, que é o topo, e continua vencendo o score.
  it('card fixado sem posição conta como topo e ainda vence o score alto', () => {
    const r = ordenarPorPrioridade([
      { id: 'score-alto', score: 99, positionExplicita: false },
      { id: 'fixado-sem-posicao', score: 0, positionExplicita: true },
    ]);
    expect(r[0].id).toBe('fixado-sem-posicao');
  });

  // Dois cards arrastados pra mesma posição é empate real — aí o score volta a
  // ter voz, em vez de a ordem depender de quem chegou primeiro no array.
  it('entre dois fixados na mesma posição, o score desempata', () => {
    const r = ordenarPorPrioridade([
      { id: 'fraco', score: 5, positionExplicita: true, position: 10 },
      { id: 'forte', score: 90, positionExplicita: true, position: 10 },
    ]);
    expect(r[0].id).toBe('forte');
  });

  it('lead sem score não quebra a ordenação — vale zero e vai pro fim', () => {
    const r = ordenarPorPrioridade([
      { id: 'sem-score', positionExplicita: false },
      { id: 'com-score', score: 1, positionExplicita: false },
    ]);
    expect(r.map(x => x.id)).toEqual(['com-score', 'sem-score']);
  });

  it('lista vazia devolve lista vazia e a original nunca é mexida', () => {
    expect(ordenarPorPrioridade([])).toEqual([]);
    expect(ordenarPorPrioridade()).toEqual([]);

    const original = [
      { id: 'a', score: 1, positionExplicita: false },
      { id: 'b', score: 9, positionExplicita: false },
    ];
    const ordenado = ordenarPorPrioridade(original);
    expect(original.map(x => x.id)).toEqual(['a', 'b']);
    expect(ordenado.map(x => x.id)).toEqual(['b', 'a']);
  });
});
