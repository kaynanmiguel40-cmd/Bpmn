import { describe, it, expect } from 'vitest';
import {
  getOperationalIndex, getOperationalReport, getOperationalLoad, getOperationalCards, buildOperationalText,
} from '../operationalModel';

const round1 = (n) => Math.round(n * 10) / 10;
const avg = (a) => a.reduce((x, y) => x + y, 0) / a.length;
const personIdx = () => getOperationalIndex('person');

describe('getOperationalIndex', () => {
  it('person e sector têm owners e períodos', () => {
    for (const lens of ['person', 'sector']) {
      const idx = getOperationalIndex(lens);
      expect(idx.owners.length).toBeGreaterThan(0);
      expect(idx.days).toHaveLength(10);
      expect(idx.weeks).toHaveLength(4);
      expect(idx.months).toHaveLength(3);
      expect(idx.owners[0]).toHaveProperty('id');
    }
  });
});

describe('getOperationalReport', () => {
  it('args inválidos = null', () => {
    expect(getOperationalReport('person', null, 'weekly', '2026-06-01')).toBeNull();
    expect(getOperationalReport('person', 'kaynan', 'weekly', null)).toBeNull();
  });

  it('pessoal semanal: estrutura completa', () => {
    const idx = personIdx();
    const r = getOperationalReport('person', idx.owners[0].id, 'weekly', idx.weeks[1]);
    expect(r.metrics).toHaveLength(4);
    expect(r.score).toBeTruthy();
    expect(Array.isArray(r.pending)).toBe(true);
    expect(r.cards).toBeTruthy();
    expect(r.load).toBeTruthy();
  });

  it('nota semanal: fatores (média dos dias) 0–100 + nota 0–10', () => {
    const idx = personIdx();
    const r = getOperationalReport('person', idx.owners[0].id, 'weekly', idx.weeks[1]);
    expect(r.score.kind).toBe('factors');
    expect(r.score.foot).toContain('média dos dias');
    if (r.score.nota != null) { expect(r.score.nota).toBeGreaterThanOrEqual(0); expect(r.score.nota).toBeLessThanOrEqual(10); }
    r.score.items.forEach((i) => {
      expect(['Entrega', 'Qualidade', 'Prazo']).toContain(i.label);
      expect(i.value).toBeGreaterThanOrEqual(0);
      expect(i.value).toBeLessThanOrEqual(100);
    });
  });

  it('diário: fatores 0–100 + cartão da pessoa presente', () => {
    const idx = personIdx();
    const r = getOperationalReport('person', idx.owners[0].id, 'daily', idx.days[1]);
    expect(r.cards).toBeTruthy(); // cartão é da pessoa, aparece em qualquer período
    expect(r.score.kind).toBe('factors');
    r.score.items.forEach((i) => {
      expect(i.value).toBeGreaterThanOrEqual(0);
      expect(i.value).toBeLessThanOrEqual(100);
    });
  });

  it('tarefas/faltantes carregam taskId+briefing; faltante não está done', () => {
    const idx = personIdx();
    const r = getOperationalReport('person', idx.owners[0].id, 'monthly', idx.months[1]);
    r.pending.forEach((p) => {
      expect(p.done).toBe(false);
      expect(typeof p.overdue).toBe('boolean');
      expect(p.taskId).toBeTruthy();
    });
    r.tasks.forEach((t) => {
      expect(t.taskId).toBeTruthy();
      expect(t.briefing).toBeTruthy();
    });
  });

  it('setor: paridade com pessoa — carga + meta + 4 KPIs, sem cartões', () => {
    const idx = getOperationalIndex('sector');
    const r = getOperationalReport('sector', idx.owners[0].id, 'weekly', idx.weeks[1]);
    expect(r.load).toBeTruthy();        // setor agora tem carga (soma de quem é dele)
    expect(r.goals).toBeTruthy();       // e Meta batida
    expect(r.metrics).toHaveLength(4);  // KPIs de carga iguais aos da pessoa
    expect(r.cards).toBeNull();         // cartão é da PESSOA, setor não tem
    expect(r.split.title).toBe('Por pessoa'); // contribuição individual no setor
  });
});

describe('getOperationalLoad', () => {
  it('totais batem com os baldes e done ≤ planned', () => {
    const idx = personIdx();
    const load = getOperationalLoad('person', idx.owners[0].id, 'weekly', idx.weeks[1]);
    expect(load.totalPlanned).toBe(load.buckets.reduce((a, b) => a + b.planned, 0));
    expect(load.totalDone).toBe(load.buckets.reduce((a, b) => a + b.done, 0));
    expect(load.totalDone).toBeLessThanOrEqual(load.totalPlanned);
    load.buckets.forEach((b) => expect(b.done).toBeLessThanOrEqual(b.planned));
  });
  it('semana = 5 baldes (Seg–Sex)', () => {
    const idx = personIdx();
    expect(getOperationalLoad('person', idx.owners[0].id, 'weekly', idx.weeks[1]).buckets).toHaveLength(5);
  });
});

describe('getOperationalCards', () => {
  it('é da pessoa: independe do período (mesmo cartão sempre)', () => {
    const idx = personIdx();
    const c = getOperationalCards(idx.owners[0].id);
    expect(c.saldo).toBe(c.green - c.red);
    expect(['green', 'red', 'neutral']).toContain(c.current);
    c.history.forEach((h) => expect(['green', 'red', 'neutral']).toContain(h.card));
    // chamar com período/data extra não muda nada (args ignorados)
    const c2 = getOperationalCards(idx.owners[0].id, 'daily', idx.days[1]);
    expect(c2).toEqual(c);
  });
  it('current = a semana mais recente do histórico', () => {
    const idx = personIdx();
    const c = getOperationalCards(idx.owners[0].id);
    expect(c.current).toBe(c.history[c.history.length - 1].card);
  });
});

describe('buildOperationalText', () => {
  it('gera texto com cabeçalho', () => {
    const idx = personIdx();
    const r = getOperationalReport('person', idx.owners[0].id, 'weekly', idx.weeks[1]);
    const txt = buildOperationalText(r, idx.owners[0].name, idx.owners[0].sub, 'Semana teste');
    expect(typeof txt).toBe('string');
    expect(txt).toContain('RELATÓRIO OPERACIONAL');
  });
});
