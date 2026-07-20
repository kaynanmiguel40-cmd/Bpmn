import { describe, it, expect } from 'vitest';
import { daySlots, findFreeSlot, planSteps, dayKey, nextBusinessDay } from '../crmScheduling';

const hhmm = (min) => `${String(Math.floor(min / 60)).padStart(2, '0')}:${String(min % 60).padStart(2, '0')}`;
// Helper: ISO de um horario num dia fixo (2026-07-20 = segunda-feira)
const at = (h, m = 0) => new Date(2026, 6, 20, h, m).toISOString();

describe('daySlots — expediente 9-18 com almoco 11-12', () => {
  const slots = daySlots();
  it('comeca as 9h e o ultimo termina as 18h', () => {
    expect(hhmm(slots[0])).toBe('09:00');
    expect(hhmm(slots[slots.length - 1])).toBe('17:30');
  });
  it('nao agenda nada dentro do almoco', () => {
    const dentro = slots.filter(s => hhmm(s) === '11:00' || hhmm(s) === '11:30');
    expect(dentro).toHaveLength(0);
  });
  it('nao deixa slot INVADIR o almoco (10:45 terminaria 11:15)', () => {
    // Todos os slots devem terminar ate 11:00 ou comecar 12:00+
    const invade = slots.filter(s => s + 30 > 11 * 60 && s < 12 * 60);
    expect(invade).toHaveLength(0);
  });
  it('retoma as 12h depois do almoco', () => {
    expect(slots.map(hhmm)).toContain('12:00');
    expect(slots.map(hhmm)).toContain('10:30');
  });
});

describe('turno (manha/tarde) — "sempre ligar de manha e a tarde"', () => {
  it('manha vai das 9h ate antes do almoco', () => {
    const s = daySlots('manha').map(hhmm);
    expect(s[0]).toBe('09:00');
    expect(s[s.length - 1]).toBe('10:30'); // 10:30+30 = 11:00, encosta no almoco
    expect(s).not.toContain('12:00');
  });
  it('tarde comeca depois do almoco', () => {
    const s = daySlots('tarde').map(hhmm);
    expect(s[0]).toBe('12:00');
    expect(s[s.length - 1]).toBe('17:30');
    expect(s).not.toContain('09:00');
  });
  it('sem turno = dia inteiro', () => {
    expect(daySlots().length).toBeGreaterThan(daySlots('manha').length);
  });

  it('as duas ligacoes do MESMO dia caem em turnos diferentes', () => {
    const plan = planSteps([
      { id: 'manha', dayOffset: 0, period: 'manha' },
      { id: 'tarde', dayOffset: 0, period: 'tarde' },
    ], {}, new Date(2026, 6, 20));
    expect(plan[0].start.getHours()).toBeLessThan(11);
    expect(plan[1].start.getHours()).toBeGreaterThanOrEqual(12);
  });

  it('manha lotada NAO joga a ligacao pra tarde — empurra pro dia seguinte', () => {
    // Sem isto o "ligar de manha" viraria uma ligacao as 17h.
    const busy = { '2026-07-20': [{ start: at(9, 0), end: at(11, 0) }] };
    const plan = planSteps([{ id: 'a', dayOffset: 0, period: 'manha' }], busy, new Date(2026, 6, 20));
    expect(dayKey(plan[0].start)).toBe('2026-07-21');
    expect(plan[0].start.getHours()).toBeLessThan(11);
  });
});

describe('findFreeSlot', () => {
  it('dia vazio -> 9h', () => {
    expect(hhmm(findFreeSlot([]))).toBe('09:00');
  });
  it('pula o horario ja ocupado', () => {
    const busy = [{ start: at(9, 0), end: at(9, 30) }];
    expect(hhmm(findFreeSlot(busy))).toBe('09:30');
  });
  it('pula reuniao longa (9h-11h) e cai depois do almoco', () => {
    const busy = [{ start: at(9, 0), end: at(11, 0) }];
    expect(hhmm(findFreeSlot(busy))).toBe('12:00');
  });
  it('atividade sem fim ocupa 30 min', () => {
    const busy = [{ start: at(9, 0) }];
    expect(hhmm(findFreeSlot(busy))).toBe('09:30');
  });
  it('respeita afterMinutes (empilhar no mesmo dia)', () => {
    expect(hhmm(findFreeSlot([], 9 * 60))).toBe('09:30');
  });
  it('dia lotado -> null (nao fura a regra)', () => {
    const busy = [{ start: at(9, 0), end: at(18, 0) }];
    expect(findFreeSlot(busy)).toBeNull();
  });
});

describe('planSteps', () => {
  const from = new Date(2026, 6, 20); // segunda

  it('duas tarefas no mesmo dia NAO caem no mesmo horario', () => {
    const plan = planSteps([
      { id: 'a', dayOffset: 0 },
      { id: 'b', dayOffset: 0 },
    ], {}, from);
    expect(plan).toHaveLength(2);
    expect(plan[0].start.getTime()).not.toBe(plan[1].start.getTime());
    expect(plan[0].start.getHours()).toBe(9);
    expect(plan[1].start.getHours()).toBe(9);
    expect(plan[1].start.getMinutes()).toBe(30);
  });

  it('respeita o dayOffset', () => {
    const plan = planSteps([{ id: 'a', dayOffset: 3 }], {}, from);
    expect(dayKey(plan[0].start)).toBe('2026-07-23');
  });

  it('desvia de atividade que ja existe na agenda', () => {
    const busy = { '2026-07-20': [{ start: at(9, 0), end: at(10, 0) }] };
    const plan = planSteps([{ id: 'a', dayOffset: 0 }], busy, from);
    expect(plan[0].start.getHours()).toBe(10);
  });

  it('dia lotado EMPURRA pro proximo dia util (nao descarta a tarefa)', () => {
    // 20/07 inteiro ocupado -> a tarefa tem que cair no dia 21, nao sumir.
    const busy = { '2026-07-20': [{ start: at(9, 0), end: at(18, 0) }] };
    const plan = planSteps([{ id: 'a', dayOffset: 0 }], busy, from);
    expect(plan).toHaveLength(1);
    expect(dayKey(plan[0].start)).toBe('2026-07-21');
    expect(plan[0].start.getHours()).toBe(9);
  });

  it('joga pro dia util quando o offset cai no fim de semana', () => {
    // 20/07 (seg) + 5 = 25/07 (sabado) -> vai pra segunda 27
    const plan = planSteps([{ id: 'a', dayOffset: 5 }], {}, from);
    const d = plan[0].start;
    expect(d.getDay()).not.toBe(0);
    expect(d.getDay()).not.toBe(6);
    expect(dayKey(d)).toBe('2026-07-27');
  });
});

describe('nextBusinessDay', () => {
  it('sabado vira segunda', () => {
    expect(nextBusinessDay(new Date(2026, 6, 25)).getDay()).toBe(1);
  });
  it('dia util nao muda', () => {
    expect(dayKey(nextBusinessDay(new Date(2026, 6, 20)))).toBe('2026-07-20');
  });
});
