import { describe, it, expect, beforeAll } from 'vitest';
import {
  getOperationalIndex, getOperationalReport, getOperationalLoad, getOperationalCards, buildOperationalText,
  setOperationalSource,
} from '../operationalModel';

const personIdx = () => getOperationalIndex('person');

// Injeta O.S. REAIS de mentira cobrindo os últimos ~18 dias (dias úteis), com
// tarefas atribuídas a 2 pessoas, prazos/entregas, revisão e nota — pra exercer
// índice, carga, nota, cartões e relatório como em produção.
beforeAll(() => {
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const iso = (base, h) => { const d = new Date(base); d.setHours(h, 0, 0, 0); return d.toISOString(); };

  const members = [
    { id: 'm1', name: 'Kaynan', color: '#6366f1', authUserId: 'u1' },
    { id: 'm2', name: 'Elias', color: '#0ea5e9', authUserId: 'u2' },
  ];
  const sectors = [{ id: 's1', label: 'Produto', color: '#3b82f6' }];
  const projects = [{ id: 'p1', sector: 's1' }];

  const checklist = [];
  for (let i = 0; i < 18; i++) {
    const d = new Date(today); d.setDate(d.getDate() - i);
    const dow = d.getDay(); if (dow === 0 || dow === 6) continue; // só dias úteis
    const done = i > 0;                  // hoje pendente; passado entregue
    const onTime = i % 3 !== 0;
    const completedAt = done
      ? (onTime ? iso(d, 12) : iso(new Date(d.getTime() + 2 * 86400000), 12)) // prazo 18h: 12h = no prazo
      : null;
    const reviewed = done && i % 2 === 0;
    checklist.push({
      id: `t${i}`, text: `Tarefa ${i}`, briefing: `Briefing ${i}`,
      dueAt: iso(d, 18), completedAt, done,
      durationMin: 60, accumulatedMin: 50,
      delivery: done ? `Entrega ${i}` : '',
      reviewStatus: reviewed ? (i % 5 === 0 ? 'changes' : 'approved') : (done ? 'review' : undefined),
      qualityPct: reviewed ? (i % 5 === 0 ? 70 : 90) : null,
      qualityAnswers: reviewed ? { funcional: 5 } : null,
      assigneeName: i % 2 === 0 ? 'Kaynan' : 'Elias',
    });
  }
  const orders = [{ id: 'o1', projectId: 'p1', assignee: 'Kaynan', participants: [], checklist }];
  setOperationalSource({ orders, projects, sectors, members });
});

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

  it('owners de pessoa vêm do cadastro da equipe (1 por pessoa)', () => {
    const idx = personIdx();
    const names = idx.owners.map((o) => o.name);
    expect(names).toContain('Kaynan');
    expect(names).toContain('Elias');
    expect(new Set(names).size).toBe(names.length); // sem duplicata
  });
});

describe('getOperationalReport', () => {
  it('args inválidos = null', () => {
    expect(getOperationalReport('person', null, 'weekly', '2026-06-01')).toBeNull();
    expect(getOperationalReport('person', 'm1', 'weekly', null)).toBeNull();
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
    const r = getOperationalReport('person', idx.owners[0].id, 'weekly', idx.weeks[0]);
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
    expect(r.load).toBeTruthy();        // setor tem carga (soma de quem é dele)
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
