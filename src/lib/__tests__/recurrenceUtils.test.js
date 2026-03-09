import { describe, it, expect } from 'vitest';
import { toDateKey, expandRecurrences } from '../recurrenceUtils';

describe('toDateKey', () => {
  it('deve formatar Date como YYYY-MM-DD', () => {
    expect(toDateKey(new Date(2025, 0, 15))).toBe('2025-01-15');
    expect(toDateKey(new Date(2025, 11, 1))).toBe('2025-12-01');
  });

  it('deve aceitar string ISO', () => {
    expect(toDateKey('2025-06-20T10:30:00Z')).toBe('2025-06-20');
  });

  it('deve fazer padding de zero', () => {
    expect(toDateKey(new Date(2025, 0, 5))).toBe('2025-01-05');
    expect(toDateKey(new Date(2025, 8, 3))).toBe('2025-09-03');
  });
});

describe('expandRecurrences', () => {
  const rangeStart = new Date('2025-01-01');
  const rangeEnd = new Date('2025-01-31');

  it('deve retornar evento sem recorrência dentro do range', () => {
    const events = [{
      id: '1',
      title: 'Evento único',
      startDate: '2025-01-10T09:00:00Z',
      endDate: '2025-01-10T10:00:00Z',
    }];

    const result = expandRecurrences(events, rangeStart, rangeEnd);
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('1');
  });

  it('deve filtrar evento fora do range', () => {
    const events = [{
      id: '1',
      title: 'Evento fora',
      startDate: '2025-02-10T09:00:00Z',
      endDate: '2025-02-10T10:00:00Z',
    }];

    const result = expandRecurrences(events, rangeStart, rangeEnd);
    expect(result).toHaveLength(0);
  });

  it('deve expandir recorrência diária', () => {
    const events = [{
      id: '1',
      title: 'Daily standup',
      startDate: '2025-01-01T09:00:00Z',
      endDate: '2025-01-01T09:30:00Z',
      recurrenceType: 'daily',
      recurrenceConfig: { interval: 1 },
      recurrenceEndType: 'never',
      recurrenceExceptions: [],
    }];

    const result = expandRecurrences(events, rangeStart, rangeEnd);
    // Janeiro tem 30 dias no range (1-30), todos devem ter ocorrência
    expect(result.length).toBeGreaterThanOrEqual(28);
    expect(result[0]._parentId).toBe('1');
  });

  it('deve expandir recorrência semanal', () => {
    const events = [{
      id: '2',
      title: 'Reunião semanal',
      startDate: '2025-01-06T14:00:00Z', // Segunda
      endDate: '2025-01-06T15:00:00Z',
      recurrenceType: 'weekly',
      recurrenceConfig: { interval: 1 },
      recurrenceEndType: 'never',
      recurrenceExceptions: [],
    }];

    const result = expandRecurrences(events, rangeStart, rangeEnd);
    // Segundas em janeiro 2025: 6, 13, 20, 27 = 4 ocorrências
    expect(result).toHaveLength(4);
  });

  it('deve respeitar exceção deletada', () => {
    const events = [{
      id: '3',
      title: 'Daily',
      startDate: '2025-01-01T09:00:00Z',
      endDate: '2025-01-01T09:30:00Z',
      recurrenceType: 'weekly',
      recurrenceConfig: { interval: 1 },
      recurrenceEndType: 'after',
      recurrenceEndValue: 5,
      recurrenceExceptions: [
        { date: '2025-01-08', type: 'deleted' },
      ],
    }];

    const result = expandRecurrences(events, rangeStart, rangeEnd);
    // 5 ocorrências - 1 deletada = 4
    expect(result).toHaveLength(4);
    expect(result.find(e => e._occurrenceDate === '2025-01-08')).toBeUndefined();
  });

  it('deve respeitar exceção modificada', () => {
    const events = [{
      id: '4',
      title: 'Reunião',
      startDate: '2025-01-06T14:00:00Z',
      endDate: '2025-01-06T15:00:00Z',
      recurrenceType: 'weekly',
      recurrenceConfig: { interval: 1 },
      recurrenceEndType: 'never',
      recurrenceExceptions: [
        { date: '2025-01-13', type: 'modified', overrides: { title: 'Reunião Especial' } },
      ],
    }];

    const result = expandRecurrences(events, rangeStart, rangeEnd);
    const modified = result.find(e => e._occurrenceDate === '2025-01-13');
    expect(modified).toBeDefined();
    expect(modified.title).toBe('Reunião Especial');
    expect(modified._isModified).toBe(true);
  });

  it('deve limitar por endType "after"', () => {
    const events = [{
      id: '5',
      title: 'Limitado',
      startDate: '2025-01-01T09:00:00Z',
      endDate: '2025-01-01T10:00:00Z',
      recurrenceType: 'daily',
      recurrenceConfig: { interval: 1 },
      recurrenceEndType: 'after',
      recurrenceEndValue: 3,
      recurrenceExceptions: [],
    }];

    const result = expandRecurrences(events, rangeStart, rangeEnd);
    expect(result).toHaveLength(3);
  });
});
