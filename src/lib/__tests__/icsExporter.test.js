import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock DOM para download
const mockClick = vi.fn();
const mockAppendChild = vi.fn();
const mockRemoveChild = vi.fn();
const mockCreateObjectURL = vi.fn().mockReturnValue('blob:fake-url');
const mockRevokeObjectURL = vi.fn();

vi.stubGlobal('URL', {
  createObjectURL: mockCreateObjectURL,
  revokeObjectURL: mockRevokeObjectURL,
});

vi.stubGlobal('document', {
  createElement: vi.fn(() => ({
    click: mockClick,
    href: '',
    download: '',
  })),
  body: {
    appendChild: mockAppendChild,
    removeChild: mockRemoveChild,
  },
});

vi.stubGlobal('Blob', class MockBlob {
  constructor(content, options) {
    this.content = content;
    this.options = options;
  }
});

import { downloadICS, downloadSingleEventICS } from '../icsExporter';

describe('downloadICS', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('gera arquivo .ics com header e footer corretos', () => {
    const events = [{
      id: 'evt_1',
      title: 'Reuniao semanal',
      startDate: '2025-06-15T10:00:00Z',
      endDate: '2025-06-15T11:00:00Z',
    }];

    downloadICS(events);

    expect(mockCreateObjectURL).toHaveBeenCalled();
    const blob = mockCreateObjectURL.mock.calls[0][0];
    const content = blob.content[0];

    expect(content).toContain('BEGIN:VCALENDAR');
    expect(content).toContain('END:VCALENDAR');
    expect(content).toContain('VERSION:2.0');
    expect(content).toContain('PRODID:-//Fyness OS//Agenda//PT');
  });

  it('inclui VEVENT com dados do evento', () => {
    const events = [{
      id: 'evt_1',
      title: 'Reuniao',
      startDate: '2025-06-15T10:00:00Z',
      endDate: '2025-06-15T11:00:00Z',
      description: 'Alinhamento de projeto',
      assignee: 'Kaynan',
    }];

    downloadICS(events);

    const content = mockCreateObjectURL.mock.calls[0][0].content[0];

    expect(content).toContain('BEGIN:VEVENT');
    expect(content).toContain('END:VEVENT');
    expect(content).toContain('SUMMARY:Reuniao');
    expect(content).toContain('DESCRIPTION:Alinhamento de projeto');
    expect(content).toContain('ORGANIZER:Kaynan');
    expect(content).toContain('UID:evt_1@fyness-os');
  });

  it('aceita evento unico (nao array)', () => {
    const event = {
      id: 'evt_single',
      title: 'Evento unico',
      startDate: '2025-06-15T10:00:00Z',
    };

    downloadICS(event);

    const content = mockCreateObjectURL.mock.calls[0][0].content[0];
    expect(content).toContain('SUMMARY:Evento unico');
  });

  it('gera multiplos VEVENTs para multiplos eventos', () => {
    const events = [
      { id: '1', title: 'Evento 1', startDate: '2025-06-15T10:00:00Z' },
      { id: '2', title: 'Evento 2', startDate: '2025-06-16T14:00:00Z' },
    ];

    downloadICS(events);

    const content = mockCreateObjectURL.mock.calls[0][0].content[0];
    const veventCount = (content.match(/BEGIN:VEVENT/g) || []).length;
    expect(veventCount).toBe(2);
  });

  it('escapa caracteres especiais no titulo', () => {
    const events = [{
      id: '1',
      title: 'Reuniao; urgente, importante',
      startDate: '2025-06-15T10:00:00Z',
    }];

    downloadICS(events);

    const content = mockCreateObjectURL.mock.calls[0][0].content[0];
    expect(content).toContain('SUMMARY:Reuniao\\; urgente\\, importante');
  });

  it('inclui RRULE para eventos recorrentes diarios', () => {
    const events = [{
      id: '1',
      title: 'Daily',
      startDate: '2025-06-15T10:00:00Z',
      recurrenceType: 'daily',
    }];

    downloadICS(events);

    const content = mockCreateObjectURL.mock.calls[0][0].content[0];
    expect(content).toContain('RRULE:FREQ=DAILY');
  });

  it('inclui RRULE weekly com BYDAY', () => {
    const events = [{
      id: '1',
      title: 'Weekly',
      startDate: '2025-06-15T10:00:00Z',
      recurrenceType: 'weekly',
      recurrenceConfig: { daysOfWeek: [1, 3, 5] },
    }];

    downloadICS(events);

    const content = mockCreateObjectURL.mock.calls[0][0].content[0];
    expect(content).toContain('RRULE:FREQ=WEEKLY;BYDAY=MO,WE,FR');
  });

  it('inclui RRULE com COUNT quando end type é after', () => {
    const events = [{
      id: '1',
      title: 'Limited',
      startDate: '2025-06-15T10:00:00Z',
      recurrenceType: 'monthly',
      recurrenceEndType: 'after',
      recurrenceEndValue: 10,
    }];

    downloadICS(events);

    const content = mockCreateObjectURL.mock.calls[0][0].content[0];
    expect(content).toContain('RRULE:FREQ=MONTHLY;COUNT=10');
  });

  it('inclui RRULE com INTERVAL', () => {
    const events = [{
      id: '1',
      title: 'Bi-weekly',
      startDate: '2025-06-15T10:00:00Z',
      recurrenceType: 'weekly',
      recurrenceConfig: { interval: 2 },
    }];

    downloadICS(events);

    const content = mockCreateObjectURL.mock.calls[0][0].content[0];
    expect(content).toContain('RRULE:FREQ=WEEKLY;INTERVAL=2');
  });

  it('inclui attendees', () => {
    const events = [{
      id: '1',
      title: 'Com participantes',
      startDate: '2025-06-15T10:00:00Z',
      attendees: [
        { name: 'Ana', email: 'ana@test.com' },
        { name: 'Carlos', email: 'carlos@test.com' },
      ],
    }];

    downloadICS(events);

    const content = mockCreateObjectURL.mock.calls[0][0].content[0];
    expect(content).toContain('ATTENDEE;CN=Ana:MAILTO:ana@test.com');
    expect(content).toContain('ATTENDEE;CN=Carlos:MAILTO:carlos@test.com');
  });

  it('inclui CATEGORIES baseado no tipo', () => {
    const events = [{
      id: '1',
      title: 'Meeting',
      startDate: '2025-06-15T10:00:00Z',
      type: 'meeting',
    }];

    downloadICS(events);

    const content = mockCreateObjectURL.mock.calls[0][0].content[0];
    expect(content).toContain('CATEGORIES:Reuniao');
  });

  it('usa DTSTART como DTEND quando endDate ausente', () => {
    const events = [{
      id: '1',
      title: 'Sem fim',
      startDate: '2025-06-15T10:00:00Z',
    }];

    downloadICS(events);

    const content = mockCreateObjectURL.mock.calls[0][0].content[0];
    const starts = content.match(/DTSTART:(\S+)/);
    const ends = content.match(/DTEND:(\S+)/);
    expect(starts[1]).toBe(ends[1]);
  });

  it('faz download com nome correto', () => {
    downloadICS([{ id: '1', title: 'T', startDate: '2025-01-01T00:00:00Z' }], 'minha_agenda.ics');

    const link = document.createElement.mock.results[0].value;
    expect(link.download).toBe('minha_agenda.ics');
    expect(mockClick).toHaveBeenCalled();
  });
});

describe('downloadSingleEventICS', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('usa titulo do evento como nome do arquivo', () => {
    downloadSingleEventICS({
      id: '1',
      title: 'Reuniao Semanal',
      startDate: '2025-06-15T10:00:00Z',
    });

    const link = document.createElement.mock.results[0].value;
    expect(link.download).toBe('Reuniao_Semanal.ics');
  });

  it('usa "evento" como fallback quando sem titulo', () => {
    downloadSingleEventICS({
      id: '1',
      startDate: '2025-06-15T10:00:00Z',
    });

    const link = document.createElement.mock.results[0].value;
    expect(link.download).toBe('evento.ics');
  });
});
