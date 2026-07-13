import { describe, it, expect } from 'vitest';
import { resolveFunnelPlan, stageProgress, funnelPlanHeadline, reconcileFunnel, reajustarFunnelComReal, reescalarFunnelParaMeta } from '../funnelGoals';

const STAGES = ['Leads', 'Qualificados', 'Reunião agendada', 'Reunião realizada', 'Vendas'];
const RATES = [50, 50, 80, 25];
// Cadeia: Leads -> Qualificados (x0.5) -> Agendada (x0.5) -> Realizada (x0.8) -> Vendas (x0.25)

describe('resolveFunnelPlan', () => {
  it('retorna null para tamanhos invalidos', () => {
    expect(resolveFunnelPlan({ stages: ['So uma'], counts: [null], rates: [] })).toBeNull();
    expect(resolveFunnelPlan({ stages: STAGES, counts: [1, 2], rates: RATES })).toBeNull();
    expect(resolveFunnelPlan({ stages: STAGES, counts: new Array(5).fill(null), rates: [1, 2] })).toBeNull();
    expect(resolveFunnelPlan({})).toBeNull();
  });

  it('alvo na ultima etapa + todas as taxas: sobe calculando as contagens', () => {
    const plan = resolveFunnelPlan({ stages: STAGES, counts: [null, null, null, null, 10], rates: RATES });
    expect(plan.counts).toEqual([200, 100, 50, 40, 10]);
  });

  it('alvo na primeira etapa + todas as taxas: desce calculando as contagens', () => {
    const plan = resolveFunnelPlan({ stages: STAGES, counts: [200, null, null, null, null], rates: RATES });
    expect(plan.counts).toEqual([200, 100, 50, 40, 10]);
  });

  it('duas contagens vizinhas conhecidas: calcula a taxa entre elas sozinho', () => {
    const plan = resolveFunnelPlan({ stages: STAGES, counts: [200, 100, null, null, null], rates: [null, null, null, null] });
    expect(plan.rates[0]).toBe(50);
    expect(plan.rateIsInput[0]).toBe(false);
    // sem taxa nas outras transicoes, o resto fica desconhecido
    expect(plan.counts[2]).toBeNull();
    expect(plan.counts[3]).toBeNull();
    expect(plan.counts[4]).toBeNull();
  });

  it('mistura contagens soltas + taxas soltas: propaga o que der', () => {
    // Sabe Leads e Vendas; sabe a taxa de qualificacao e a de agendamento; o
    // resto (Realizada) fica sem dado ate a taxa de fechamento aparecer.
    const plan = resolveFunnelPlan({
      stages: STAGES,
      counts: [200, null, null, null, 10],
      rates: [50, 50, null, null],
    });
    expect(plan.counts[1]).toBe(100); // 200 * 0.5
    expect(plan.counts[2]).toBe(50); // 100 * 0.5
    expect(plan.counts[3]).toBeNull(); // falta taxa Agendada->Realizada
  });

  it('contagem digitada tem prioridade sobre taxa digitada (recalcula a taxa)', () => {
    const plan = resolveFunnelPlan({
      stages: STAGES,
      counts: [200, 120, null, null, null],
      rates: [50, null, null, null], // taxa digitada (50%) e ignorada pois as 2 contagens ja resolvem
    });
    expect(plan.rates[0]).toBe(60); // 120/200, nao 50
    expect(plan.rateIsInput[0]).toBe(false);
  });

  it('funciona com numero arbitrario de etapas (custom)', () => {
    const plan = resolveFunnelPlan({ stages: ['A', 'B', 'C'], counts: [null, null, 5], rates: [50, 50] });
    expect(plan.counts).toEqual([20, 10, 5]);
  });

  it('sem nenhum dado, tudo fica null', () => {
    const plan = resolveFunnelPlan({ stages: STAGES, counts: new Array(5).fill(null), rates: new Array(4).fill(null) });
    expect(plan.counts.every((c) => c == null)).toBe(true);
  });

  it('taxa acima de 100% e limitada', () => {
    const plan = resolveFunnelPlan({ stages: STAGES, counts: [null, null, null, null, 10], rates: [50, 50, 80, 250] });
    expect(plan.rates[3]).toBe(100);
  });

  it('contagens que implicam funil crescendo (impossivel): taxa derivada e limitada a 100% e marcada', () => {
    // 50 leads mas 1000 vendas (etapas adjacentes) nao faz sentido num funil —
    // em vez de mostrar 2000%, limita a 100% e avisa via rateCapped.
    const plan = resolveFunnelPlan({ stages: ['Leads', 'Vendas'], counts: [50, 1000], rates: [null] });
    expect(plan.rates[0]).toBe(100);
    expect(plan.rateCapped[0]).toBe(true);
    // as contagens digitadas pelo usuario continuam intactas (nao inventa nem apaga o que ele digitou)
    expect(plan.counts).toEqual([50, 1000]);
  });

  it('contagens consistentes (funil afunilando) nao ficam marcadas como limitadas', () => {
    const plan = resolveFunnelPlan({ stages: ['Leads', 'Vendas'], counts: [200, 10], rates: [null] });
    expect(plan.rates[0]).toBe(5);
    expect(plan.rateCapped[0]).toBe(false);
  });
});

describe('stageProgress', () => {
  it('calcula percentual real vs meta por indice', () => {
    const plan = resolveFunnelPlan({ stages: STAGES, counts: [null, null, null, null, 10], rates: RATES });
    const p = stageProgress(plan, 4, 3);
    expect(p.target).toBe(10);
    expect(p.current).toBe(3);
    expect(p.percent).toBe(30);
    expect(p.hit).toBe(false);
  });

  it('marca hit quando bate ou passa a meta', () => {
    const plan = resolveFunnelPlan({ stages: STAGES, counts: [null, null, null, null, 10], rates: RATES });
    expect(stageProgress(plan, 4, 10).hit).toBe(true);
    expect(stageProgress(plan, 4, 12).hit).toBe(true);
  });

  it('retorna null quando a etapa nao foi resolvida', () => {
    const plan = resolveFunnelPlan({ stages: STAGES, counts: [200, 100, null, null, null], rates: [null, null, null, null] });
    expect(stageProgress(plan, 4, 3)).toBeNull();
  });

  it('retorna null para plano nulo', () => {
    expect(stageProgress(null, 0, 3)).toBeNull();
  });
});

describe('reconcileFunnel', () => {
  it('sem conflito, nao mexe em nada', () => {
    const counts = [200, 100, 50, 40, 10];
    const rates = [50, 50, 80, 25];
    const result = reconcileFunnel(STAGES, counts, rates);
    expect(result.counts).toEqual(counts);
    expect(result.rates).toEqual(rates);
  });

  it('2 etapas em conflito: sobe recalculando a de cima, sem tocar nas demais', () => {
    // Leads=50 e Vendas=1000 direto (2 etapas) — impossivel. Leads devia
    // virar >=1000 (o minimo pra bater 1000 vendas a 100%).
    const result = reconcileFunnel(['Leads', 'Vendas'], [50, 1000], [null]);
    expect(result.counts[0]).toBe(''); // Leads volta a ser calculado
    expect(result.counts[1]).toBe(1000); // Vendas (o dado que manda) fica intocado
    const plan = resolveFunnelPlan({ stages: ['Leads', 'Vendas'], counts: result.counts, rates: result.rates });
    expect(plan.counts).toEqual([1000, 1000]);
    expect(plan.rateCapped[0]).toBe(false);
  });

  it('funil de 5 etapas: recalcula TODAS as etapas de cima usando as taxas que ja eram boas (nao contamina)', () => {
    // Leads=50,Qualif=10,Agendada=8,Realizada=8 (taxas 20%/80%/100%, todas
    // consistentes) + Vendas=10000 digitado (quebra só a ultima transicao).
    // Espera: Leads/Qualif/Agendada/Realizada recalculados USANDO as MESMAS
    // taxas 20/80/100 (nao virarem tudo igual a 10000 por rederivacao ingenua).
    const counts = [50, 10, 8, 8, 10000];
    const rates = [null, null, null, null]; // todas as 4 vieram das contagens
    const result = reconcileFunnel(STAGES, counts, rates);
    const plan = resolveFunnelPlan({ stages: STAGES, counts: result.counts, rates: result.rates });
    expect(plan.rateCapped.some(Boolean)).toBe(false); // nada mais incompativel
    expect(plan.counts[4]).toBe(10000); // Vendas intocado
    expect(plan.counts[3]).toBe(10000); // Realizada = Vendas / 100% (transicao quebrada)
    expect(plan.counts[2]).toBe(10000); // Agendada = Realizada / 100% (taxa preservada)
    expect(plan.counts[1]).toBe(12500); // Qualificados = Agendada / 80% (taxa preservada)
    expect(plan.counts[0]).toBe(62500); // Leads = Qualificados / 20% (taxa preservada)
  });
});

describe('funnelPlanHeadline', () => {
  it('mostra primeira etapa -> ultima etapa com os nomes do usuario', () => {
    const plan = resolveFunnelPlan({ stages: STAGES, counts: [200, null, null, null, null], rates: RATES });
    expect(funnelPlanHeadline(plan)).toBe('200 Leads → 10 Vendas');
  });

  it('vazio quando alguma das pontas nao foi resolvida', () => {
    const plan = resolveFunnelPlan({ stages: STAGES, counts: [200, 100, null, null, null], rates: [null, null, null, null] });
    expect(funnelPlanHeadline(plan)).toBe('');
  });

  it('sem plano retorna string vazia', () => {
    expect(funnelPlanHeadline(null)).toBe('');
  });
});

describe('reajustarFunnelComReal', () => {
  // Previsto: Leads 500 -> Qualif 200 (40%) -> Reuniao 100 (50%) -> Vendas 30 (30%)
  const PREVISTO = [500, 200, 100, 30];

  it('sem nenhum real medido ainda, cai pro previsto (meta final intocada)', () => {
    const real = [0, 0, 0, 0];
    expect(reajustarFunnelComReal(PREVISTO, real)).toEqual(PREVISTO);
  });

  it('taxa real pior que a prevista: precisa de mais no topo pra bater a mesma meta', () => {
    // Real: 350 leads -> 98 qualificados = 28% (previsto era 40%). Demais
    // trechos sem dado real ainda, entao usam a taxa PREVISTA (50% e 30%).
    const real = [350, 98, 0, 0];
    const out = reajustarFunnelComReal(PREVISTO, real);
    expect(out[3]).toBe(30); // meta final nao muda
    expect(out[2]).toBe(100); // Reuniao = Vendas / 30% (taxa prevista, sem real ainda)
    expect(out[1]).toBe(200); // Qualif = Reuniao / 50% (taxa prevista, sem real ainda)
    expect(out[0]).toBeCloseTo(200 / (98 / 350), 5); // Leads = Qualif / taxa REAL (28%)
  });

  it('taxa real melhor que a prevista: precisa de menos no topo', () => {
    const real = [200, 120, 0, 0]; // 60% real vs 40% previsto
    const out = reajustarFunnelComReal(PREVISTO, real);
    expect(out[3]).toBe(30);
    expect(out[0]).toBeCloseTo(200 / (120 / 200), 5);
    expect(out[0]).toBeLessThan(PREVISTO[0]); // precisa de MENOS leads que o plano original
  });

  it('todas as taxas medidas: reajusta a cadeia inteira pelas taxas reais', () => {
    // Real ate agora: 400 -> 100 (25%) -> 40 (40%) -> 16 (40%)
    const real = [400, 100, 40, 16];
    const out = reajustarFunnelComReal(PREVISTO, real);
    expect(out[3]).toBe(30); // meta final fixa
    expect(out[2]).toBeCloseTo(30 / 0.4, 5); // Reuniao = Vendas / taxa real (40%)
    expect(out[1]).toBeCloseTo(out[2] / 0.4, 5); // Qualif = Reuniao / taxa real (40%)
    expect(out[0]).toBeCloseTo(out[1] / 0.25, 5); // Leads = Qualif / taxa real (25%)
  });

  it('tamanhos incompatíveis: devolve o previsto sem alterar', () => {
    expect(reajustarFunnelComReal(PREVISTO, [1, 2])).toEqual(PREVISTO);
  });
});

describe('reescalarFunnelParaMeta', () => {
  // Previsto: Leads 500 -> Qualif 200 (40%) -> Reuniao 100 (50%) -> Vendas 30 (30%)
  const PREVISTO = [500, 200, 100, 30];

  it('meta final igual a original: nao muda nada', () => {
    expect(reescalarFunnelParaMeta(PREVISTO, 30)).toEqual(PREVISTO);
  });

  it('meta final maior (atraso acumulado a recuperar): escala tudo pra cima nas MESMAS taxas', () => {
    const out = reescalarFunnelParaMeta(PREVISTO, 60); // dobrou a meta final
    expect(out[3]).toBe(60);
    expect(out[2]).toBeCloseTo(200, 5); // Reuniao = 60 / 30% (taxa original preservada)
    expect(out[1]).toBeCloseTo(400, 5); // Qualif = 200 / 50%
    expect(out[0]).toBeCloseTo(1000, 5); // Leads = 400 / 40%
  });

  it('meta final menor (ja adiantado): escala tudo pra baixo', () => {
    const out = reescalarFunnelParaMeta(PREVISTO, 15); // metade da meta final
    expect(out[3]).toBe(15);
    expect(out[0]).toBeCloseTo(250, 5);
  });

  it('etapa do meio com contagem prevista zero: preserva o valor original (sem taxa pra escalar)', () => {
    const out = reescalarFunnelParaMeta([500, 0, 100, 30], 60);
    expect(out[1]).toBe(0); // sem taxa 500->0 valida, mantem original
  });

  it('lista vazia retorna vazia', () => {
    expect(reescalarFunnelParaMeta([], 10)).toEqual([]);
  });
});
