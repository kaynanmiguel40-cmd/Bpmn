import { describe, it, expect, vi } from 'vitest';

vi.mock('../../../../lib/supabase', () => ({
  supabase: {
    from: vi.fn(),
    auth: { getSession: vi.fn().mockResolvedValue({ data: { session: null } }) },
  },
}));
vi.mock('../../../../contexts/ToastContext', () => ({ toast: vi.fn() }));
vi.mock('../../../../lib/serviceFactory', () => ({
  createCRUDService: vi.fn(() => ({ create: vi.fn(), update: vi.fn(), getAll: vi.fn(), remove: vi.fn() })),
}));
vi.mock('../../schemas/crmValidation', () => ({ crmActivitySchema: {} }));

import { dbToCrmActivity } from '../crmActivitiesService';

describe('dbToCrmActivity', () => {
  it('retorna null para entrada nula', () => {
    expect(dbToCrmActivity(null)).toBeNull();
  });

  it('mapeia campos basicos', () => {
    const row = {
      id: 'a1',
      title: 'Ligar para Joao',
      description: 'Follow-up',
      type: 'call',
      contact_id: 'c1',
      deal_id: 'd1',
      start_date: '2026-05-01T09:00:00Z',
      end_date: '2026-05-01T10:00:00Z',
      completed: true,
      completed_at: '2026-05-01T11:00:00Z',
      agenda_event_id: 'e1',
      created_by: 'user',
      created_at: '2026-04-01',
    };
    const result = dbToCrmActivity(row);
    expect(result.id).toBe('a1');
    expect(result.title).toBe('Ligar para Joao');
    expect(result.description).toBe('Follow-up');
    expect(result.type).toBe('call');
    expect(result.contactId).toBe('c1');
    expect(result.dealId).toBe('d1');
    expect(result.startDate).toBe('2026-05-01T09:00:00Z');
    expect(result.endDate).toBe('2026-05-01T10:00:00Z');
    expect(result.completed).toBe(true);
    expect(result.completedAt).toBe('2026-05-01T11:00:00Z');
    expect(result.agendaEventId).toBe('e1');
  });

  it('campos ausentes viram null/false/string vazia', () => {
    const result = dbToCrmActivity({ id: 'a1', title: 'X', type: 'task', start_date: '2026-01-01' });
    expect(result.description).toBe('');
    expect(result.contactId).toBeNull();
    expect(result.dealId).toBeNull();
    expect(result.endDate).toBeNull();
    expect(result.completed).toBe(false);
    expect(result.completedAt).toBeNull();
    expect(result.agendaEventId).toBeNull();
  });

  it('mapeia contact joineado', () => {
    const result = dbToCrmActivity({
      id: 'a1',
      title: 'X',
      type: 'task',
      start_date: '2026-01-01',
      crm_contacts: { id: 'c1', name: 'Joao', avatar_color: '#abc' },
    });
    expect(result.contact).toEqual({ id: 'c1', name: 'Joao', avatarColor: '#abc' });
  });

  it('mapeia deal joineado', () => {
    const result = dbToCrmActivity({
      id: 'a1',
      title: 'X',
      type: 'task',
      start_date: '2026-01-01',
      crm_deals: { id: 'd1', title: 'Negocio', value: 100 },
    });
    expect(result.deal).toEqual({ id: 'd1', title: 'Negocio', value: 100 });
  });

  it('contact/deal sao null quando joins ausentes', () => {
    const result = dbToCrmActivity({ id: 'a1', title: 'X', type: 'task', start_date: '2026-01-01' });
    expect(result.contact).toBeNull();
    expect(result.deal).toBeNull();
  });
});
