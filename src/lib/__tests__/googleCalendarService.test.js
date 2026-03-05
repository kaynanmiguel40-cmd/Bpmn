import { describe, it, expect, vi, beforeEach } from 'vitest';

// ==================== MOCKS ====================

const { resultQueue } = vi.hoisted(() => ({ resultQueue: [] }));

function queueResult(result) {
  resultQueue.push(result);
}

vi.mock('../supabaseClient', () => {
  function createChain() {
    return new Proxy({}, {
      get(_, prop) {
        if (prop === 'then') {
          const result = resultQueue.shift() || { data: null, error: null };
          return (resolve, reject) => Promise.resolve(result).then(resolve, reject);
        }
        return (...args) => createChain();
      },
    });
  }
  return {
    supabase: {
      from: vi.fn(() => createChain()),
      auth: {
        getUser: vi.fn().mockResolvedValue({ data: { user: { id: 'user-1' } } }),
      },
    },
  };
});

// ==================== IMPORT ====================

import { __test__ } from '../googleCalendarService';
const { buildRRule, parseRRule, fynessToGoogle, googleToFyness } = __test__;

// ==================== buildRRule ====================

describe('buildRRule', () => {
  it('retorna null quando tipo nao e reconhecido', () => {
    expect(buildRRule({ recurrence_type: null })).toBeNull();
    expect(buildRRule({ recurrence_type: 'invalid' })).toBeNull();
  });

  it('gera RRULE diaria', () => {
    const event = {
      recurrence_type: 'daily',
      recurrence_config: {},
      recurrence_end_type: 'never',
    };
    expect(buildRRule(event)).toBe('RRULE:FREQ=DAILY');
  });

  it('gera RRULE semanal com dias especificos', () => {
    const event = {
      recurrence_type: 'weekly',
      recurrence_config: { daysOfWeek: [1, 3, 5] }, // Mon, Wed, Fri
      recurrence_end_type: 'never',
    };
    expect(buildRRule(event)).toBe('RRULE:FREQ=WEEKLY;BYDAY=MO,WE,FR');
  });

  it('gera RRULE mensal', () => {
    const event = {
      recurrence_type: 'monthly',
      recurrence_config: {},
      recurrence_end_type: 'never',
    };
    expect(buildRRule(event)).toBe('RRULE:FREQ=MONTHLY');
  });

  it('gera RRULE anual', () => {
    const event = {
      recurrence_type: 'yearly',
      recurrence_config: {},
      recurrence_end_type: 'never',
    };
    expect(buildRRule(event)).toBe('RRULE:FREQ=YEARLY');
  });

  it('inclui INTERVAL quando maior que 1', () => {
    const event = {
      recurrence_type: 'daily',
      recurrence_config: { interval: 3 },
      recurrence_end_type: 'never',
    };
    expect(buildRRule(event)).toBe('RRULE:FREQ=DAILY;INTERVAL=3');
  });

  it('nao inclui INTERVAL quando igual a 1', () => {
    const event = {
      recurrence_type: 'daily',
      recurrence_config: { interval: 1 },
      recurrence_end_type: 'never',
    };
    expect(buildRRule(event)).toBe('RRULE:FREQ=DAILY');
  });

  it('inclui COUNT para end_type "after"', () => {
    const event = {
      recurrence_type: 'weekly',
      recurrence_config: {},
      recurrence_end_type: 'after',
      recurrence_end_value: 10,
    };
    expect(buildRRule(event)).toBe('RRULE:FREQ=WEEKLY;COUNT=10');
  });

  it('inclui UNTIL para end_type "on_date"', () => {
    const event = {
      recurrence_type: 'daily',
      recurrence_config: {},
      recurrence_end_type: 'on_date',
      recurrence_end_value: '2025-12-31T00:00:00.000Z',
    };
    const rrule = buildRRule(event);
    expect(rrule).toContain('UNTIL=');
    expect(rrule).toContain('20251231');
  });

  it('combina INTERVAL + BYDAY + COUNT', () => {
    const event = {
      recurrence_type: 'weekly',
      recurrence_config: { interval: 2, daysOfWeek: [1, 5] },
      recurrence_end_type: 'after',
      recurrence_end_value: 5,
    };
    const rrule = buildRRule(event);
    expect(rrule).toContain('FREQ=WEEKLY');
    expect(rrule).toContain('INTERVAL=2');
    expect(rrule).toContain('BYDAY=MO,FR');
    expect(rrule).toContain('COUNT=5');
  });
});

// ==================== parseRRule ====================

describe('parseRRule', () => {
  it('parse RRULE diaria', () => {
    const result = parseRRule('RRULE:FREQ=DAILY');
    expect(result.recurrence_type).toBe('daily');
    expect(result.recurrence_config.interval).toBe(1);
    expect(result.recurrence_end_type).toBe('never');
  });

  it('parse RRULE semanal com BYDAY', () => {
    const result = parseRRule('RRULE:FREQ=WEEKLY;BYDAY=MO,WE,FR');
    expect(result.recurrence_type).toBe('weekly');
    expect(result.recurrence_config.daysOfWeek).toEqual([1, 3, 5]);
  });

  it('parse RRULE com INTERVAL', () => {
    const result = parseRRule('RRULE:FREQ=MONTHLY;INTERVAL=3');
    expect(result.recurrence_type).toBe('monthly');
    expect(result.recurrence_config.interval).toBe(3);
  });

  it('parse RRULE com COUNT', () => {
    const result = parseRRule('RRULE:FREQ=DAILY;COUNT=10');
    expect(result.recurrence_end_type).toBe('after');
    expect(result.recurrence_end_value).toBe('10');
  });

  it('parse RRULE com UNTIL', () => {
    const result = parseRRule('RRULE:FREQ=WEEKLY;UNTIL=20251231T000000Z');
    expect(result.recurrence_end_type).toBe('on_date');
    expect(result.recurrence_end_value).toBe('2025-12-31');
  });

  it('roundtrip: buildRRule -> parseRRule preserva dados', () => {
    const event = {
      recurrence_type: 'weekly',
      recurrence_config: { interval: 2, daysOfWeek: [1, 3] },
      recurrence_end_type: 'after',
      recurrence_end_value: 8,
    };
    const rrule = buildRRule(event);
    const parsed = parseRRule(rrule);

    expect(parsed.recurrence_type).toBe('weekly');
    expect(parsed.recurrence_config.interval).toBe(2);
    expect(parsed.recurrence_config.daysOfWeek).toEqual([1, 3]);
    expect(parsed.recurrence_end_type).toBe('after');
  });
});

// ==================== fynessToGoogle ====================

describe('fynessToGoogle', () => {
  it('converte evento basico', () => {
    const event = {
      title: 'Reuniao',
      description: 'Desc',
      start_date: '2025-06-15T10:00:00Z',
      end_date: '2025-06-15T11:00:00Z',
    };
    const gcal = fynessToGoogle(event);

    expect(gcal.summary).toBe('Reuniao');
    expect(gcal.description).toContain('Desc');
    expect(gcal.start.dateTime).toBe('2025-06-15T10:00:00Z');
    expect(gcal.start.timeZone).toBe('America/Sao_Paulo');
    expect(gcal.end.dateTime).toBe('2025-06-15T11:00:00Z');
  });

  it('mapeia cor para colorId do Google', () => {
    const event = {
      title: 'Test',
      start_date: '2025-01-01',
      end_date: '2025-01-01',
      color: '#3b82f6',
    };
    const gcal = fynessToGoogle(event);
    expect(gcal.colorId).toBe('9'); // azul
  });

  it('nao inclui colorId para cor nao mapeada', () => {
    const event = {
      title: 'Test',
      start_date: '2025-01-01',
      end_date: '2025-01-01',
      color: '#ff00ff',
    };
    const gcal = fynessToGoogle(event);
    expect(gcal.colorId).toBeUndefined();
  });

  it('inclui recurrence quando evento tem tipo de recorrencia', () => {
    const event = {
      title: 'Daily',
      start_date: '2025-01-01',
      end_date: '2025-01-01',
      recurrence_type: 'daily',
      recurrence_config: {},
      recurrence_end_type: 'never',
    };
    const gcal = fynessToGoogle(event);
    expect(gcal.recurrence).toEqual(['RRULE:FREQ=DAILY']);
  });

  it('converte attendees com email', () => {
    const event = {
      title: 'Reuniao',
      start_date: '2025-01-01',
      end_date: '2025-01-01',
      attendees: [
        { name: 'Joao', email: 'joao@test.com' },
        { name: 'Maria', email: 'maria@test.com' },
      ],
    };
    const gcal = fynessToGoogle(event);
    expect(gcal.attendees).toHaveLength(2);
    expect(gcal.attendees[0].email).toBe('joao@test.com');
    expect(gcal.attendees[0].displayName).toBe('Joao');
  });

  it('filtra attendees sem email', () => {
    const event = {
      title: 'Reuniao',
      start_date: '2025-01-01',
      end_date: '2025-01-01',
      attendees: [
        { name: 'Joao', email: 'joao@test.com' },
        { name: 'Sem Email' }, // sem email
        'string invalida',
      ],
    };
    const gcal = fynessToGoogle(event);
    expect(gcal.attendees).toHaveLength(1);
  });

  it('combina description e notes', () => {
    const event = {
      title: 'Test',
      description: 'Descricao principal',
      notes: 'Notas extras',
      start_date: '2025-01-01',
      end_date: '2025-01-01',
    };
    const gcal = fynessToGoogle(event);
    expect(gcal.description).toContain('Descricao principal');
    expect(gcal.description).toContain('Notas extras');
  });

  it('usa start_date como end_date quando end_date nao fornecido', () => {
    const event = {
      title: 'Test',
      start_date: '2025-06-15T10:00:00Z',
    };
    const gcal = fynessToGoogle(event);
    expect(gcal.end.dateTime).toBe('2025-06-15T10:00:00Z');
  });
});

// ==================== googleToFyness ====================

describe('googleToFyness', () => {
  it('converte evento basico do Google', () => {
    const gcal = {
      id: 'gcal_123',
      summary: 'Meeting',
      description: 'Some description',
      start: { dateTime: '2025-06-15T10:00:00Z' },
      end: { dateTime: '2025-06-15T11:00:00Z' },
    };
    const fyness = googleToFyness(gcal);

    expect(fyness.title).toBe('Meeting');
    expect(fyness.description).toBe('Some description');
    expect(fyness.start_date).toBe('2025-06-15T10:00:00Z');
    expect(fyness.end_date).toBe('2025-06-15T11:00:00Z');
    expect(fyness.google_event_id).toBe('gcal_123');
    expect(fyness.sync_source).toBe('google');
  });

  it('usa "(Sem titulo)" quando summary e vazio', () => {
    const gcal = {
      id: 'gcal_1',
      start: { dateTime: '2025-01-01' },
      end: { dateTime: '2025-01-01' },
    };
    const fyness = googleToFyness(gcal);
    expect(fyness.title).toBe('(Sem titulo)');
  });

  it('mapeia colorId do Google para cor Fyness', () => {
    const gcal = {
      id: 'gcal_1',
      summary: 'Test',
      colorId: '11', // vermelho
      start: { dateTime: '2025-01-01' },
      end: { dateTime: '2025-01-01' },
    };
    const fyness = googleToFyness(gcal);
    expect(fyness.color).toBe('#ef4444');
  });

  it('usa cor padrao quando colorId nao mapeado', () => {
    const gcal = {
      id: 'gcal_1',
      summary: 'Test',
      colorId: '99',
      start: { dateTime: '2025-01-01' },
      end: { dateTime: '2025-01-01' },
    };
    const fyness = googleToFyness(gcal);
    expect(fyness.color).toBe('#3b82f6'); // azul padrao
  });

  it('converte attendees do Google', () => {
    const gcal = {
      id: 'gcal_1',
      summary: 'Test',
      start: { dateTime: '2025-01-01' },
      end: { dateTime: '2025-01-01' },
      attendees: [
        { displayName: 'Joao', email: 'joao@test.com' },
        { email: 'maria@test.com' }, // sem displayName
      ],
    };
    const fyness = googleToFyness(gcal);
    expect(fyness.attendees).toHaveLength(2);
    expect(fyness.attendees[0].name).toBe('Joao');
    expect(fyness.attendees[1].name).toBe('maria@test.com'); // usa email como fallback
  });

  it('parse recurrence do Google para formato Fyness', () => {
    const gcal = {
      id: 'gcal_1',
      summary: 'Recurring',
      start: { dateTime: '2025-01-01' },
      end: { dateTime: '2025-01-01' },
      recurrence: ['RRULE:FREQ=WEEKLY;BYDAY=MO,FR;COUNT=10'],
    };
    const fyness = googleToFyness(gcal);
    expect(fyness.recurrence_type).toBe('weekly');
    expect(fyness.recurrence_config.daysOfWeek).toEqual([1, 5]);
    expect(fyness.recurrence_end_type).toBe('after');
  });

  it('suporta all-day events (date ao inves de dateTime)', () => {
    const gcal = {
      id: 'gcal_1',
      summary: 'All Day',
      start: { date: '2025-06-15' },
      end: { date: '2025-06-16' },
    };
    const fyness = googleToFyness(gcal);
    expect(fyness.start_date).toBe('2025-06-15');
    expect(fyness.end_date).toBe('2025-06-16');
  });

  it('inicializa campos default corretamente', () => {
    const gcal = {
      id: 'gcal_1',
      start: { dateTime: '2025-01-01' },
      end: { dateTime: '2025-01-01' },
    };
    const fyness = googleToFyness(gcal);
    expect(fyness.type).toBe('task');
    expect(fyness.attended).toBe(false);
    expect(fyness.was_late).toBe(false);
    expect(fyness.late_minutes).toBe(0);
    expect(fyness.attachments).toEqual([]);
    expect(fyness.google_calendar_id).toBe('primary');
  });

  it('roundtrip: fynessToGoogle -> googleToFyness preserva dados essenciais', () => {
    const original = {
      title: 'Roundtrip Test',
      description: 'Desc',
      start_date: '2025-06-15T10:00:00Z',
      end_date: '2025-06-15T11:00:00Z',
      color: '#ef4444',
      attendees: [{ name: 'Joao', email: 'joao@test.com' }],
    };
    const asGoogle = fynessToGoogle(original);
    const backToFyness = googleToFyness({ id: 'roundtrip', ...asGoogle });

    expect(backToFyness.title).toBe('Roundtrip Test');
    expect(backToFyness.start_date).toBe('2025-06-15T10:00:00Z');
    expect(backToFyness.color).toBe('#ef4444');
    expect(backToFyness.attendees[0].email).toBe('joao@test.com');
  });
});
