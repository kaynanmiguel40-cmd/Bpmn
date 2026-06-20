import { describe, it, expect } from 'vitest';
import { median, consistencyScore, productivityScore, notaColor, timePatterns } from '../productivity';

describe('median', () => {
  it('par e ímpar', () => {
    expect(median([30, 45, 60, 90])).toBe(53); // (45+60)/2 = 52.5 → 53
    expect(median([10, 20, 30])).toBe(20);
  });
  it('vazio = 0 e ignora nulos', () => {
    expect(median([])).toBe(0);
    expect(median([null, 10, null, 30])).toBe(20);
  });
});

describe('consistencyScore', () => {
  it('distribuição uniforme = 100', () => {
    expect(consistencyScore([{ planned: 3 }, { planned: 3 }, { planned: 3 }, { planned: 3 }])).toBe(100);
  });
  it('tudo num balde só = 0', () => {
    expect(consistencyScore([{ planned: 10 }, { planned: 0 }, { planned: 0 }, { planned: 0 }])).toBe(0);
  });
  it('sem carga = null', () => {
    expect(consistencyScore([{ planned: 0 }, { planned: 0 }])).toBeNull();
    expect(consistencyScore([])).toBeNull();
  });
});

describe('productivityScore', () => {
  it('média ponderada Qualidade40/Entrega30/Prazo20/Consistência10', () => {
    const { nota } = productivityScore({ qualidade: 90, entrega: 70, prazo: 85, consistencia: 55 });
    expect(nota).toBe(8); // (90*.4+70*.3+85*.2+55*.1)/1 = 80 → 8.0
  });
  it('renormaliza quando há fatores nulos', () => {
    const { nota } = productivityScore({ qualidade: 100, entrega: null, prazo: 50, consistencia: null });
    expect(nota).toBe(8.3); // (100*.4+50*.2)/.6 = 83.3 → 8.3
  });
  it('todos nulos = nota null', () => {
    expect(productivityScore({}).nota).toBeNull();
  });
  it('expõe os 4 fatores', () => {
    const { factors } = productivityScore({ qualidade: 100 });
    expect(factors.map((f) => f.key)).toEqual(['qualidade', 'entrega', 'prazo', 'consistencia']);
  });
});

describe('notaColor', () => {
  it('faixas de cor', () => {
    expect(notaColor(9)).toBe('#10b981');
    expect(notaColor(8)).toBe('#10b981');
    expect(notaColor(6.5)).toBe('#f59e0b');
    expect(notaColor(4)).toBe('#ef4444');
    expect(notaColor(null)).toBe('#94a3b8');
  });
});

describe('timePatterns', () => {
  it('agrupa, tira mediana, conta e ordena por nº', () => {
    const recs = [
      { k: 'a', n: 'Prod', t: 30 },
      { k: 'a', n: 'Prod', t: 50 },
      { k: 'b', n: 'Sup', t: 20 },
    ];
    const out = timePatterns(recs, (r) => r.k, (r) => r.n, null, (r) => r.t);
    expect(out).toHaveLength(2);
    expect(out[0]).toMatchObject({ key: 'a', label: 'Prod', count: 2, medianMin: 40 });
    expect(out[1]).toMatchObject({ key: 'b', count: 1, medianMin: 20 });
  });
});
