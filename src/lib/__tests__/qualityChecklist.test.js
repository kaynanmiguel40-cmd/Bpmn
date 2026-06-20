import { describe, it, expect } from 'vitest';
import { OPERACAO_QUALITY, RATING_MIN, RATING_MAX, scoreQualityChecklist } from '../qualityChecklist';

describe('OPERACAO_QUALITY', () => {
  it('5 critérios com pesos; escala 1–5', () => {
    expect(OPERACAO_QUALITY).toHaveLength(5);
    expect(OPERACAO_QUALITY.map((c) => c.id)).toEqual(['funcional', 'escopo', 'sem_retrabalho', 'documentado', 'proatividade']);
    expect(OPERACAO_QUALITY.map((c) => c.weight)).toEqual([4, 3, 3, 2, 1]);
    expect([RATING_MIN, RATING_MAX]).toEqual([1, 5]);
  });
});

describe('scoreQualityChecklist (média ponderada 1–5)', () => {
  it('tudo 5 = 5.0 / 100%', () => {
    const ans = { funcional: 5, escopo: 5, sem_retrabalho: 5, documentado: 5, proatividade: 5 };
    expect(scoreQualityChecklist(ans)).toEqual({ avg: 5, pct: 100 });
  });
  it('média PONDERADA pelo peso', () => {
    // 5*4 + 3*3 + 4*3 + 5*2 + 2*1 = 53 ; pesos somam 13 ; 53/13 = 4.07 → 4.1 ; 4.1/5 = 82%
    const ans = { funcional: 5, escopo: 3, sem_retrabalho: 4, documentado: 5, proatividade: 2 };
    expect(scoreQualityChecklist(ans)).toEqual({ avg: 4.1, pct: 82 });
  });
  it('N/A sai da média', () => {
    // só escopo (peso 3) vale, nota 3 → média 3.0 = 60%
    expect(scoreQualityChecklist({ funcional: 'na', escopo: 3 })).toEqual({ avg: 3, pct: 60 });
  });
  it('um critério só', () => {
    expect(scoreQualityChecklist({ funcional: 3 })).toEqual({ avg: 3, pct: 60 });
  });
  it('vazio = null', () => {
    expect(scoreQualityChecklist({})).toEqual({ avg: null, pct: null });
  });
  it('clampa fora de 1–5', () => {
    expect(scoreQualityChecklist({ funcional: 9 }).avg).toBe(5);
    expect(scoreQualityChecklist({ funcional: 0 }).avg).toBe(1);
  });
});
