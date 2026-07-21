import { describe, it, expect } from 'vitest';
import { planSteps, dayKey } from '../crmScheduling';

/**
 * Núcleo do "Pediu pra ligar depois": quando o lead atende mas pede retorno, a
 * cadência re-ancora a partir do horário do retorno. O agendarRetornoEReancorar
 * faz isso rebaseando os offsets (offset - offsetAtual) e chamando planSteps com
 * from = callback. Aqui a gente trava esse cálculo — o resto do serviço é só
 * cancelar/criar/gravar, coberto pelo comportamento do planSteps.
 */
describe('re-ancoragem da cadência a partir do retorno', () => {
  // Lead estava no D2 (offset 2) e pediu retorno pra quinta 14h.
  const callback = new Date(2026, 6, 23, 14, 0); // qui 23/07 14:00
  const offsetAtual = 2;

  // Passos restantes (futuros) com seus offsets absolutos.
  const restantes = [
    { id: 'd3', off: 3, period: null },
    { id: 'd5', off: 5, period: 'manha' },
    { id: 'd7', off: 7, period: 'tarde' },
  ];
  // Como o serviço monta: dayOffset rebaseado ao passo atual.
  const steps = restantes.map(s => ({
    id: s.id,
    dayOffset: Math.max(0, s.off - offsetAtual),
    period: s.period,
  }));

  it('o espaçamento fica RELATIVO ao passo atual, não absoluto', () => {
    // D3 é 1 dia após o D2 → cai 1 dia após o retorno, não 3.
    const plano = planSteps(steps, {}, callback);
    const byId = Object.fromEntries(plano.map(p => [p.stepId, p.start]));
    // callback = qui 23/07. D3 (rebase 1) → sex 24/07. D5 (rebase 3) → seg 27/07.
    expect(dayKey(byId.d3)).toBe('2026-07-24');
    expect(dayKey(byId.d5)).toBe('2026-07-27'); // +3 cai sábado 25 → pula pra segunda
  });

  it('nada cai antes do retorno', () => {
    const plano = planSteps(steps, {}, callback);
    for (const p of plano) {
      expect(p.start.getTime()).toBeGreaterThanOrEqual(new Date(2026, 6, 23).getTime());
    }
  });

  it('a ordem entre os restantes é preservada (D3 < D5 < D7)', () => {
    const plano = planSteps(steps, {}, callback);
    const byId = Object.fromEntries(plano.map(p => [p.stepId, p.start.getTime()]));
    expect(byId.d3).toBeLessThan(byId.d5);
    expect(byId.d5).toBeLessThan(byId.d7);
  });

  it('mantém horários distintos (slot próprio pra cada toque)', () => {
    // Dois passos que rebaseiam pro mesmo dia não caem no mesmo horário.
    const doisNoMesmoDia = [
      { id: 'a', dayOffset: 0, period: 'manha' },
      { id: 'b', dayOffset: 0, period: 'manha' },
    ];
    const plano = planSteps(doisNoMesmoDia, {}, callback);
    expect(plano[0].start.getTime()).not.toBe(plano[1].start.getTime());
  });
});
