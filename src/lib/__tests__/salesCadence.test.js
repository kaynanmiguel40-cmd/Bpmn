import { describe, it, expect } from 'vitest';
import { countBusinessDays, classifyStatus, buildMonthlyCadence } from '../salesCadence';

// Junho/2026: 30 dias, dia 1 = segunda. Fins de semana: 6,7,13,14,20,21,27,28 (8 dias).
// => 22 dias uteis.
const JUN_START = new Date(2026, 5, 1, 0, 0, 0, 0);
const JUN_END = new Date(2026, 5, 30, 23, 59, 59, 999);

// Gera N deals ganhos em dias uteis sequenciais a partir do dia 1.
function weekdayDeals(n, mrr = 100) {
  const out = [];
  let day = 1;
  while (out.length < n && day <= 30) {
    const d = new Date(2026, 5, day, 12, 0, 0);
    if (d.getDay() !== 0 && d.getDay() !== 6) out.push({ closedAt: d.toISOString(), mrr, value: mrr * 12 });
    day++;
  }
  return out;
}

describe('countBusinessDays', () => {
  it('conta os 22 dias uteis de junho/2026', () => {
    expect(countBusinessDays(JUN_START, JUN_END)).toBe(22);
  });
  it('inclui as duas pontas e ignora fim de semana', () => {
    // 1 (seg) a 5 (sex) = 5 uteis; 6-7 sao fim de semana.
    expect(countBusinessDays(new Date(2026, 5, 1), new Date(2026, 5, 7))).toBe(5);
  });
  it('retorna 0 pra range invertido', () => {
    expect(countBusinessDays(JUN_END, JUN_START)).toBe(0);
  });
});

describe('classifyStatus', () => {
  it('mapeia as faixas de ritmo', () => {
    expect(classifyStatus(1.2).key).toBe('acima');
    expect(classifyStatus(1.0).key).toBe('dentro');
    expect(classifyStatus(0.8).key).toBe('abaixo_leve');
    expect(classifyStatus(0.4).key).toBe('abaixo');
  });
});

describe('buildMonthlyCadence — vendas (contagem)', () => {
  // Meio do mes: 15/jun (segunda). Uteis decorridos: 1-5 (5) + 8-12 (5) + 15 (1) = 11.
  const now = new Date(2026, 5, 15, 15, 0, 0);

  it('previsto-ate-hoje = pro-rata por dias uteis', () => {
    const c = buildMonthlyCadence({ monthStart: JUN_START, monthEnd: JUN_END, now, target: 22, deals: [] });
    expect(c.businessDaysTotal).toBe(22);
    expect(c.businessDaysElapsed).toBe(11);
    expect(c.businessDaysRemaining).toBe(11);
    expect(c.expectedToDate).toBeCloseTo(11, 5); // 22 * 11/22
  });

  it('no ritmo: realizado = previsto => status dentro, esforco 0%', () => {
    const c = buildMonthlyCadence({ monthStart: JUN_START, monthEnd: JUN_END, now, target: 22, deals: weekdayDeals(11) });
    expect(c.realizedToDate).toBe(11);
    expect(c.status.key).toBe('dentro');
    expect(c.recovery.remaining).toBe(11);
    expect(c.recovery.requiredDailyPace).toBeCloseTo(1, 5); // 11 restantes / 11 dias uteis
    expect(c.recovery.plannedDailyPace).toBeCloseTo(1, 5);
    expect(c.recovery.extraEffortPct).toBe(0);
    expect(c.recovery.onTrack).toBe(true);
  });

  it('atrasado: poucos fechamentos => abaixo + esforco extra positivo', () => {
    const c = buildMonthlyCadence({ monthStart: JUN_START, monthEnd: JUN_END, now, target: 22, deals: weekdayDeals(5) });
    expect(c.realizedToDate).toBe(5);
    expect(c.status.key).toBe('abaixo');
    expect(c.recovery.behindBy).toBeCloseTo(6, 5); // 11 previsto - 5 real
    expect(c.recovery.remaining).toBe(17);
    expect(c.recovery.requiredDailyPace).toBeCloseTo(17 / 11, 1); // arredondado a 2 casas (1.55)
    expect(c.recovery.extraEffortPct).toBeGreaterThan(0);
    expect(c.recovery.onTrack).toBe(false);
  });

  it('series diaria e semanal com shape esperado', () => {
    const c = buildMonthlyCadence({ monthStart: JUN_START, monthEnd: JUN_END, now, target: 22, deals: weekdayDeals(5) });
    expect(c.dailySeries).toHaveLength(30);
    expect(c.weeklySeries).toHaveLength(5); // ceil(30/7)
    // Dias futuros nao tem realizado (mes em curso).
    expect(c.dailySeries[29].realized).toBeNull();
    // Soma das metas semanais ~ meta do mes.
    const somaMetas = c.weeklySeries.reduce((s, w) => s + w.target, 0);
    expect(somaMetas).toBeCloseTo(22, 1);
    // Semana atual marcada.
    expect(c.weeklySeries.some(w => w.isCurrent)).toBe(true);
  });
});

describe('buildMonthlyCadence — MRR (valor)', () => {
  const now = new Date(2026, 5, 15, 15, 0, 0);
  it('usa valueOf pra somar MRR em vez de contar', () => {
    const deals = weekdayDeals(4, 250); // 4 deals de R$250 = R$1000 ate hoje
    const c = buildMonthlyCadence({
      monthStart: JUN_START,
      monthEnd: JUN_END,
      now,
      target: 4000,
      deals,
      weigh: d => d.mrr,
    });
    expect(c.realizedToDate).toBe(1000);
    expect(c.expectedToDate).toBeCloseTo(2000, 5); // 4000 * 11/22
    expect(c.status.key).toBe('abaixo');
  });
});

describe('buildMonthlyCadence — mes ja encerrado', () => {
  it('sem dias restantes: recuperacao impossivel se faltou', () => {
    const now = new Date(2026, 6, 5, 12, 0, 0); // julho -> junho encerrado
    const c = buildMonthlyCadence({ monthStart: JUN_START, monthEnd: JUN_END, now, target: 22, deals: weekdayDeals(10) });
    expect(c.businessDaysElapsed).toBe(22);
    expect(c.businessDaysRemaining).toBe(0);
    expect(c.recovery.impossible).toBe(true);
    // Mes fechado: serie diaria toda preenchida (sem null).
    expect(c.dailySeries.every(d => d.realized !== null)).toBe(true);
  });
});
