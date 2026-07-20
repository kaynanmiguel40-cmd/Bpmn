import { describe, it, expect } from 'vitest';
import { scoreLead, sinaisDoDeal, ordenarPorPrioridade } from '../leadScore';

/**
 * A coluna do Kanban tem DOIS eixos, e eles convivem: quem foi arrastado à mão
 * manda, e o score ordena todo o resto.
 *
 * O que faz os dois conviverem é `positionExplicita`. A migration 105 deu
 * `position` a todos os negócios de uma vez; sem uma segunda marca, toda coluna
 * pareceria já decidida à mão e o score nunca teria vez.
 */

const dia = 86400000;
const emDias = (n) => new Date(Date.now() - n * dia).toISOString();

// Monta o deal como a coluna monta: score calculado, marca de fixado separada.
const preparar = (deals, stageIndex = 1, totalStages = 5) =>
  ordenarPorPrioridade(deals.map(d => {
    const s = scoreLead(sinaisDoDeal(d, { stageIndex, totalStages }));
    return { ...d, score: s.score, display: s.display, motivos: s.motivos, positionExplicita: !!d.positionManual };
  }));

describe('ordem da coluna', () => {
  it('sem nada fixado, o score decide', () => {
    const ordem = preparar([
      { id: 'velho', createdAt: emDias(40), priority: 0, source: 'Prospecção ativa' },
      { id: 'trafego', createdAt: emDias(0), priority: 5, source: 'Google Ads' },
      { id: 'parceiro', createdAt: emDias(0), priority: 3, source: 'Indicação de parceiro (Luan)' },
    ]);
    expect(ordem.map(d => d.id)).toEqual(['trafego', 'parceiro', 'velho']);
  });

  // Este é o caso que o dono descreveu: o lead de tráfego é o mais caro que
  // existe aqui, e tem que furar a fila mesmo com a base convertendo pior nele.
  it('tráfego novo passa na frente de prospecção nova de mesma qualidade', () => {
    const ordem = preparar([
      { id: 'prospec', createdAt: emDias(0), priority: 3, source: 'Prospecção ativa' },
      { id: 'trafego', createdAt: emDias(0), priority: 3, source: 'Tráfego pago' },
    ]);
    expect(ordem[0].id).toBe('trafego');
  });

  it('card arrastado à mão vence qualquer score', () => {
    const ordem = preparar([
      { id: 'quente', createdAt: emDias(0), priority: 5, source: 'Google Ads' },
      { id: 'fixado', createdAt: emDias(40), priority: 0, source: 'Prospecção ativa', positionManual: true, position: 100 },
    ]);
    expect(ordem[0].id).toBe('fixado');
  });

  // A distinção que a migration 106 existe pra fazer: posição herdada do
  // backfill NÃO é decisão de ninguém e não pode travar a coluna.
  it('posição herdada do backfill não conta como fixada', () => {
    const ordem = preparar([
      { id: 'herdado', createdAt: emDias(40), priority: 0, source: 'Prospecção ativa', positionManual: false, position: 100 },
      { id: 'quente', createdAt: emDias(0), priority: 5, source: 'Google Ads', positionManual: false, position: 200 },
    ]);
    expect(ordem[0].id).toBe('quente');
  });

  it('entre vários fixados, vale a ordem em que foram arrastados', () => {
    const ordem = preparar([
      { id: 'terceiro', positionManual: true, position: 300, createdAt: emDias(0), priority: 5, source: 'Google Ads' },
      { id: 'primeiro', positionManual: true, position: 100, createdAt: emDias(40), priority: 0 },
      { id: 'segundo', positionManual: true, position: 200, createdAt: emDias(40), priority: 0 },
    ]);
    expect(ordem.map(d => d.id)).toEqual(['primeiro', 'segundo', 'terceiro']);
  });

  it('fixados vêm todos antes dos não fixados', () => {
    const ordem = preparar([
      { id: 'quente', createdAt: emDias(0), priority: 5, source: 'Google Ads' },
      { id: 'fixado-b', positionManual: true, position: 200, createdAt: emDias(40), priority: 0 },
      { id: 'fixado-a', positionManual: true, position: 100, createdAt: emDias(40), priority: 0 },
    ]);
    expect(ordem.map(d => d.id)).toEqual(['fixado-a', 'fixado-b', 'quente']);
  });

  it('coluna vazia e lista sem negócios não quebram', () => {
    expect(preparar([])).toEqual([]);
    expect(ordenarPorPrioridade()).toEqual([]);
  });
});

/**
 * A Pipeline carrega os negócios SEM as atividades. Sem `semHistorico`, todo
 * card levava "Nunca respondeu e está parado" — a tela acusando de abandono um
 * lead cujo histórico ela simplesmente não consultou, igual pra quem respondeu
 * ontem e pra quem nunca atendeu.
 */
describe('sinaisDoDeal', () => {
  it('marca que o histórico é desconhecido, não que é ruim', () => {
    const s = sinaisDoDeal({ createdAt: emDias(40), priority: 0, source: 'Prospecção ativa' });
    expect(s.semHistorico).toBe(true);
    expect(scoreLead(s).motivos).not.toContain('Nunca respondeu e está parado');
  });

  it('quem passa o histórico de verdade continua sendo julgado por ele', () => {
    const { motivos } = scoreLead({ diasSemContato: 30, respondeuAlgumaVez: false, semHistorico: false });
    expect(motivos).toContain('Nunca respondeu e está parado');
  });

  it('negócio sem data de criação não vira lead novo por engano', () => {
    // 999 dias é o default; o risco seria o contrário — data ausente virar
    // "entrou agora" e o lead sem informação nenhuma liderar a coluna.
    expect(sinaisDoDeal({}).diasDesdeEntrada).toBe(999);
    expect(scoreLead(sinaisDoDeal({})).motivos).not.toContain('Entrou agora — janela quente');
  });

  it('a profundidade no funil sobe com a etapa', () => {
    const topo = sinaisDoDeal({}, { stageIndex: 0, totalStages: 5 });
    const fundo = sinaisDoDeal({}, { stageIndex: 4, totalStages: 5 });
    expect(fundo.stageRank).toBeGreaterThan(topo.stageRank);
    expect(fundo.stageRank).toBe(1);
  });
});
