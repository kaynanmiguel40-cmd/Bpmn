import { describe, it, expect } from 'vitest';
import { reajustarTrajetoriaMrr, unitFunnelSteps, FUNIL_UNITARIO_RATES } from '../commercialPlan';

const PLAN_MONTHS = [
  { m: 1, mrr: 1000 },
  { m: 2, mrr: 2000 },
  { m: 3, mrr: 4000 },
  { m: 4, mrr: 7000 },
];
const GOAL = 10000;

describe('reajustarTrajetoriaMrr', () => {
  it('no ritmo exato do previsto: reajuste bate com o previsto original', () => {
    // Real agora (mes 2) = exatamente o previsto do mes 2 (2000) -> nada muda.
    const out = reajustarTrajetoriaMrr(PLAN_MONTHS, 2, 2000, GOAL);
    expect(out).toEqual([1000, 2000, 4000, 7000]);
  });

  it('meses ja decorridos mantem o previsto original intocado', () => {
    const out = reajustarTrajetoriaMrr(PLAN_MONTHS, 3, 100, GOAL);
    expect(out[0]).toBe(1000); // mes 1, passado
    expect(out[1]).toBe(2000); // mes 2, passado
  });

  it('atrasado: reescala a trajetoria futura pra cima a partir do real, preservando o formato', () => {
    // Mes atual = 2, previsto era 2000, real e so 500 (bem atras).
    const out = reajustarTrajetoriaMrr(PLAN_MONTHS, 2, 500, GOAL);
    expect(out[1]).toBe(500); // mes atual = real (reinicia do zero aqui)
    // progress do mes 3 no plano original: (4000-2000)/(10000-2000) = 0.25
    expect(out[2]).toBeCloseTo(500 + 0.25 * (10000 - 500), 5);
    // progress do mes 4: (7000-2000)/(10000-2000) = 0.625
    expect(out[3]).toBeCloseTo(500 + 0.625 * (10000 - 500), 5);
  });

  it('adiantado: reescala a trajetoria futura pra baixo, preservando o formato', () => {
    // Mes atual = 2, previsto era 2000, real ja esta em 5000 (bem adiantado).
    const out = reajustarTrajetoriaMrr(PLAN_MONTHS, 2, 5000, GOAL);
    expect(out[1]).toBe(5000);
    // progress do mes 3: (4000-2000)/(10000-2000) = 0.25
    expect(out[2]).toBeCloseTo(5000 + 0.25 * (10000 - 5000), 5);
    // progress do mes 4: (7000-2000)/(10000-2000) = 0.625
    expect(out[3]).toBeCloseTo(5000 + 0.625 * (10000 - 5000), 5);
  });

  it('mes atual fora do plano: devolve o previsto original sem mudar', () => {
    expect(reajustarTrajetoriaMrr(PLAN_MONTHS, 99, 500, GOAL)).toEqual([1000, 2000, 4000, 7000]);
  });
});

describe('unitFunnelSteps', () => {
  const q = (steps, key) => steps.find(s => s.key === key).qtd;

  it('cascata reversa pra 1 venda bate com o plano de funil', () => {
    const s = unitFunnelSteps(1);
    // 1 venda / 30% = 3,33 realizadas / 80% = 4,17 agendadas / 60% = 6,94 SQL / 25% = 27,8 leads
    expect(q(s, 'venda')).toBe(1);
    expect(q(s, 'realizada')).toBeCloseTo(3.33, 1);
    expect(q(s, 'agendada')).toBeCloseTo(4.17, 1);
    expect(q(s, 'qualif')).toBeCloseTo(6.94, 1);
    expect(q(s, 'lead')).toBeCloseTo(27.78, 1);
  });

  it('cada etapa vezes a taxa da etapa entrega a proxima (funil fecha)', () => {
    const s = unitFunnelSteps(1);
    for (let i = 0; i < s.length - 1; i++) {
      expect(s[i].qtd * s[i].pct).toBeCloseTo(s[i + 1].qtd, 6);
    }
  });

  it('escala linear: 10 vendas = 10x o funil de 1', () => {
    const um = unitFunnelSteps(1);
    const dez = unitFunnelSteps(10);
    um.forEach((s, i) => expect(dez[i].qtd).toBeCloseTo(s.qtd * 10, 6));
  });

  it('aceita taxas injetadas (nao depende da constante do plano)', () => {
    const s = unitFunnelSteps(1, { qualif: 0.5, agendamento: 0.5, comparecimento: 0.5, fechamento: 0.5 });
    expect(q(s, 'lead')).toBeCloseTo(16, 6); // 1 / 0.5^4
  });

  it('as taxas do funil unitario sao as conservadoras (25/60/80/30)', () => {
    expect(FUNIL_UNITARIO_RATES).toEqual({
      qualif: 0.25, agendamento: 0.60, comparecimento: 0.80, fechamento: 0.30,
    });
  });
});
