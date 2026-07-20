/**
 * leadScore — quanto vale a PRÓXIMA hora gasta com este lead.
 *
 * A fila tinha uma ordenação; isto é um modelo. A pergunta não é "quem é o
 * melhor lead" — é "onde a próxima hora rende mais". São coisas diferentes: um
 * lead excelente que acabou de receber proposta e pediu uma semana pra pensar
 * vale MENOS agora do que um lead médio que atendeu ontem e pediu para ligar
 * hoje.
 *
 * DOIS EIXOS QUE NÃO ENTRAM AQUI, de propósito:
 *   - a POSIÇÃO no Kanban é decisão humana explícita e vence tudo. Quem
 *     arrastou o card pro topo já respondeu a pergunta; o score não discute.
 *   - as ESTRELAS medem qualidade (fit com o ICP) e entram como peso, não como
 *     resposta: lead 5 estrelas que nunca atendeu em 6 tentativas não deve
 *     ocupar a manhã de ninguém.
 *
 * O score é EXPLICÁVEL por construção: cada fator devolve o motivo junto. Um
 * número que reordena o dia de alguém sem dizer por quê não é usado — é
 * contornado.
 *
 * Os pesos estão em PESOS, num lugar só, pra serem discutidos com o comercial
 * em vez de caçados no meio do código.
 */

export const PESOS = {
  // Fundo de funil vale mais por hora investida: o lead já passou pelas
  // peneiras, o custo de aquisição está pago e o que falta é fechar.
  funil: 30,
  // Speed-to-lead. É o fator mais estudado em vendas: a chance de qualificar
  // despenca em horas, não em dias. Por isso é alto e decai rápido.
  frescor: 25,
  // Já respondeu alguma vez = já existe relação. Toque em quem nunca respondeu
  // é prospecção; toque em quem respondeu é continuação.
  engajamento: 20,
  // Compromisso assumido (reunião marcada) é a coisa mais perecível do funil:
  // se furar, volta pro começo.
  compromisso: 15,
  // Qualidade/ICP. Entra como tempero — não decide sozinho.
  estrela: 3, // × estrelas (0-5) → 0-15
  // Lead ENGAJADO parado esfria. Aqui a espera AUMENTA a urgência.
  esfriando: 15,
  // Tentativa sem contato derruba o valor esperado do próximo toque. Ligar pela
  // 7ª vez pra quem nunca atendeu tem retorno perto de zero.
  tentativaVazia: -6, // × tentativas
  // Nunca respondeu + muito tempo parado = provavelmente morto.
  abandono: -15,
  // ORIGEM. Peso alto: combina o preditor mais forte que temos medido
  // (conversão) com o que se perde ao deixar o lead morrer (custo). Ver ORIGEM.
  origem: 20,
};

/**
 * Peso de cada origem. DUAS coisas entram aqui, e confundi-las foi meu erro na
 * primeira versão deste modelo.
 *
 * ─── 1. CONVERSÃO (medida, com ressalva grave) ───────────────────────────────
 *
 * Taxa de fechamento entre os negócios já decididos, medida em 20/07/2026:
 *
 *   origem        n    crua    ajustada
 *   indicacao     7   71,4%      35,2%
 *   parceiro     34   29,4%      26,9%
 *   prospeccao   42   14,3%      17,0%
 *   trafego      15    6,7%      15,7%
 *
 * A coluna que vale é a AJUSTADA: a crua diz que indicação fecha 71% — com SETE
 * casos, o que é uma moeda jogada 7 vezes, não uma taxa. O encolhimento
 * bayesiano (k=20) puxa cada categoria pra média geral de 22,5% na proporção da
 * confiança que a amostra merece.
 *
 * A RESSALVA, que é o motivo de conversão não mandar sozinha: ESTES NÚMEROS
 * MEDEM O PROCESSO ATUAL, NÃO O POTENCIAL DO CANAL. Lead de tráfego foi tratado
 * como qualquer outro — entrou na fila e esperou a vez. Um lead que clicou num
 * anúncio e esperou dois dias por uma ligação converte mal por causa da espera,
 * não do canal. Usar essa taxa pra atrasá-lo ainda mais fecharia um ciclo: ele
 * converte pouco porque é despriorizado, e é despriorizado porque converte
 * pouco. Modelo que se alimenta do próprio efeito não aprende nada.
 *
 * ─── 2. CUSTO DE AQUISIÇÃO (qualitativo — não há gasto registrado) ───────────
 *
 * Lead de tráfego CUSTOU DINHEIRO. Indicação chegou de graça; prospecção custou
 * tempo. Perder um lead pago é prejuízo direto no caixa, não custo de
 * oportunidade — e é reposto só comprando outro.
 *
 * A tabela crm_paid_traffic existe mas está VAZIA: sem gasto lançado, não dá
 * pra calcular custo por lead de verdade. A ordem abaixo é qualitativa e
 * assumida — quando houver investimento registrado, isto vira número medido.
 *
 * ─── 3. URGÊNCIA ────────────────────────────────────────────────────────────
 *
 * Multiplica o frescor. Quem clicou num anúncio agora está comprando AGORA — a
 * janela é de minutos. Quem veio por indicação do contador espera o dia, porque
 * a confiança já foi emprestada por outra pessoa.
 */
export const ORIGEM = {
  //             conversão   custo   urgência
  trafego:     { conversao: 0.45, custo: 1.00, urgencia: 1.5 },
  parceiro:    { conversao: 0.76, custo: 0.30, urgencia: 1.0 },
  indicacao:   { conversao: 1.00, custo: 0.10, urgencia: 1.0 },
  prospeccao:  { conversao: 0.48, custo: 0.15, urgencia: 0.8 },
  desconhecida:{ conversao: 0.50, custo: 0.30, urgencia: 1.0 },
};

/**
 * Conversão e custo entram METADE a metade.
 *
 * Só conversão manda o lead pago pro fim da fila — e o dinheiro dele já foi
 * gasto. Só custo manda perseguir o caro mesmo quando ele não fecha. O meio é
 * a leitura honesta: "quanto vale a próxima hora" é o produto de quão provável
 * é fechar E de quanto se perde se este lead morrer.
 */
export function forcaDaOrigem(cat) {
  const o = ORIGEM[cat] || ORIGEM.desconhecida;
  return o.conversao * 0.5 + o.custo * 0.5;
}

/**
 * Categoria da origem a partir do texto livre.
 *
 * O campo e digitado a mao e esta em 29 variantes do mesmo conceito
 * ("Indicação de parceiro (Robert)", "Indicação parceiro Edson", "Indicacao /
 * WhatsApp"), entao casa por PALAVRA-CHAVE. A ordem importa: "indicação de
 * parceiro" e parceiro, nao indicação solta.
 */
export function categoriaOrigem(source) {
  const t = (source || '').toLowerCase();
  if (!t.trim()) return 'desconhecida';
  if (/tr[aá]fego|an[uú]ncio|ads?|pago/.test(t)) return 'trafego';
  if (/parceiro|contador/.test(t)) return 'parceiro';
  if (/prospec|maps|lista/.test(t)) return 'prospeccao';
  if (/indica|cliente/.test(t)) return 'indicacao';
  return 'desconhecida';
}

/** Onde a espera deixa de ser "esfriando" e vira "provavelmente morto". */
export const DIAS_ABANDONO = 14;

const clamp = (v, min, max) => Math.max(min, Math.min(max, v));

/**
 * @param {object} s  sinais do lead
 * @param {number} s.stageRank        0..1 — 0 = topo do funil, 1 = prestes a fechar
 * @param {number} s.diasDesdeEntrada idade do lead no funil
 * @param {number} s.diasSemContato   desde o último toque em que ALGUÉM ATENDEU
 * @param {number} s.tentativasSemContato  ligações seguidas sem resposta
 * @param {boolean} s.respondeuAlgumaVez
 * @param {boolean} s.temCompromisso  reunião/visita marcada
 * @param {number} s.estrelas         0-5
 * @param {string} s.source           texto livre da origem do lead
 * @returns {{ score: number, motivos: string[] }}
 *   `score` PODE SER NEGATIVO, e isso é essencial: travar o piso em zero
 *   empataria todos os leads ruins em 0, e é exatamente entre eles que a fila
 *   precisa decidir quem fica pro fim. Para mostrar na tela existe `display`.
 */
export function scoreLead(s = {}) {
  const {
    stageRank = 0,
    diasDesdeEntrada = 999,
    diasSemContato = 999,
    tentativasSemContato = 0,
    respondeuAlgumaVez = false,
    temCompromisso = false,
    estrelas = 0,
    source = null,
  } = s;

  let score = 0;
  const motivos = [];

  // --- FUNIL: quanto mais fundo, mais perto do dinheiro.
  score += clamp(stageRank, 0, 1) * PESOS.funil;
  if (stageRank >= 0.7) motivos.push('Perto de fechar');

  // --- FRESCOR: janela de ouro. Cheio nas primeiras 24h, some em ~7 dias.
  if (diasDesdeEntrada <= 7) {
    // Decaimento EXPONENCIAL, não linear: metade do valor some no primeiro dia.
    // É o formato real do speed-to-lead — a janela fecha em horas, não em dias.
    // Uma reta faria o lead de ontem parecer quase tão quente quanto o de hoje.
    const f = Math.exp(-6 * (diasDesdeEntrada / 7));
    // A urgência depende da ORIGEM: quem clicou num anúncio está comprando
    // agora e a janela é de minutos; quem veio por indicação do contador espera
    // o dia, porque a confiança já foi emprestada por outra pessoa.
    score += f * PESOS.frescor * (ORIGEM[categoriaOrigem(source)] || ORIGEM.desconhecida).urgencia;
    if (diasDesdeEntrada <= 1) motivos.push('Entrou agora — janela quente');
    else if (diasDesdeEntrada <= 3) motivos.push('Lead novo');
  }

  // --- ENGAJAMENTO: existe relação.
  if (respondeuAlgumaVez) {
    score += PESOS.engajamento;
    motivos.push('Já respondeu antes');
  }

  // --- COMPROMISSO: o mais perecível do funil.
  if (temCompromisso) {
    score += PESOS.compromisso;
    motivos.push('Tem compromisso marcado');
  }

  // --- QUALIDADE (ICP).
  score += clamp(estrelas, 0, 5) * PESOS.estrela;

  // --- ORIGEM: o preditor mais forte que temos medido. Indicação fecha ~2x o
  // que prospecção ativa fecha, mesmo depois do ajuste por tamanho de amostra.
  const cat = categoriaOrigem(source);
  score += forcaDaOrigem(cat) * PESOS.origem;
  if (cat === 'trafego') motivos.push('Lead pago — custou dinheiro');
  else if (cat === 'indicacao') motivos.push('Veio de indicação');
  else if (cat === 'parceiro') motivos.push('Veio de parceiro');

  // --- ESFRIANDO: só vale pra quem JÁ ENGAJOU. Para quem nunca atendeu, tempo
  // parado não é urgência — é sinal de que não há o que retomar.
  if (respondeuAlgumaVez && diasSemContato >= 3 && diasSemContato < DIAS_ABANDONO) {
    const u = clamp((diasSemContato - 2) / (DIAS_ABANDONO - 2), 0, 1);
    score += u * PESOS.esfriando;
    motivos.push(`${diasSemContato} dias sem contato — esfriando`);
  }

  // --- TENTATIVA VAZIA: cada ligação sem atender derruba o valor do próximo
  // toque. Sem isso, o lead que nunca atende fica eternamente no topo, porque
  // "está parado há muito tempo".
  if (tentativasSemContato > 0) {
    score += clamp(tentativasSemContato * PESOS.tentativaVazia, -25, 0);
    if (tentativasSemContato >= 3) {
      motivos.push(`${tentativasSemContato} tentativas sem atender`);
    }
  }

  // --- ABANDONO.
  if (!respondeuAlgumaVez && diasSemContato >= DIAS_ABANDONO) {
    score += PESOS.abandono;
    motivos.push('Nunca respondeu e está parado');
  }

  return {
    score: Math.round(score),
    // 0-100 só pra exibição (barra, cor). A ordenação usa `score`.
    display: Math.round(clamp(score, 0, 100)),
    motivos,
  };
}

/**
 * Converte a posição da etapa na pipeline em 0..1.
 *
 * A etapa de GANHO fica de fora da conta: lead ganho não disputa a agenda, e
 * incluí-la comprimiria todo o resto pra baixo da escala.
 */
export function stageRankOf(posicaoDaEtapa, totalDeEtapas) {
  if (!totalDeEtapas || totalDeEtapas <= 1) return 0;
  return clamp(posicaoDaEtapa / (totalDeEtapas - 1), 0, 1);
}

/**
 * Ordena leads pelo score, mas com a POSIÇÃO do Kanban vencendo quando ela foi
 * definida de propósito.
 *
 * `positionExplicita` distingue o card que alguém arrastou daquele que só herdou
 * uma posição no backfill. Sem essa distinção, ou o score nunca manda (tudo tem
 * posição) ou o arrasto nunca manda (tudo é recalculado) — e os dois extremos
 * quebram metade da promessa.
 */
export function ordenarPorPrioridade(leads = []) {
  return [...leads].sort((a, b) => {
    const ea = a.positionExplicita ? (a.position ?? 0) : null;
    const eb = b.positionExplicita ? (b.position ?? 0) : null;
    // Card fixado à mão vem antes de qualquer card não fixado.
    if (ea !== null && eb === null) return -1;
    if (ea === null && eb !== null) return 1;
    if (ea !== null && eb !== null && ea !== eb) return ea - eb;
    // Entre os não fixados (ou empatados), o score decide.
    return (b.score ?? 0) - (a.score ?? 0);
  });
}
