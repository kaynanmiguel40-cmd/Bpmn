import { describe, it, expect } from 'vitest';
import { reajustarTrajetoriaMrr } from '../commercialPlan';

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
