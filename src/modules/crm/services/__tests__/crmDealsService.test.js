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
vi.mock('../crmAutomationsService', () => ({ triggerAutomationsForDeal: vi.fn() }));
vi.mock('../crmActivitiesService', () => ({ createCrmActivity: vi.fn() }));
vi.mock('../../schemas/crmValidation', () => ({ crmDealSchema: {} }));

import { dbToCrmDeal } from '../crmDealsService';

describe('dbToCrmDeal', () => {
  it('retorna null para input null/undefined', () => {
    expect(dbToCrmDeal(null)).toBeNull();
    expect(dbToCrmDeal(undefined)).toBeNull();
  });

  it('mapeia campos basicos', () => {
    const row = {
      id: 'd1',
      title: 'Negocio X',
      value: 1500,
      probability: 70,
      contact_id: 'c1',
      contact_name: 'Joao',
      contact_phone: '+5511999998888',
      contact_email: 'joao@x.com',
      company_id: 'co1',
      pipeline_id: 'p1',
      stage_id: 's1',
      expected_close_date: '2026-06-30',
      closed_at: null,
      status: 'open',
      lost_reason: null,
      segment: 'Tecnologia',
      notes: 'Muito interessado',
      owner_id: 'tm1',
      created_at: '2026-05-01T10:00:00Z',
      updated_at: '2026-05-02T10:00:00Z',
    };
    const result = dbToCrmDeal(row);
    expect(result.id).toBe('d1');
    expect(result.title).toBe('Negocio X');
    expect(result.value).toBe(1500);
    expect(result.probability).toBe(70);
    expect(result.contactId).toBe('c1');
    expect(result.contactName).toBe('Joao');
    expect(result.contactEmail).toBe('joao@x.com');
    expect(result.companyId).toBe('co1');
    expect(result.pipelineId).toBe('p1');
    expect(result.stageId).toBe('s1');
    expect(result.expectedCloseDate).toBe('2026-06-30');
    expect(result.status).toBe('open');
    expect(result.segment).toBe('Tecnologia');
    expect(result.notes).toBe('Muito interessado');
    expect(result.ownerId).toBe('tm1');
  });

  it('aplica defaults: value=0, probability=50, status=open, notes vazia', () => {
    const result = dbToCrmDeal({ id: 'd1', title: 'X' });
    expect(result.value).toBe(0);
    expect(result.probability).toBe(50);
    expect(result.status).toBe('open');
    expect(result.notes).toBe('');
  });

  it('probability null/undefined cai pra 50 via ??', () => {
    expect(dbToCrmDeal({ id: 'd1', title: 'X', probability: null }).probability).toBe(50);
    expect(dbToCrmDeal({ id: 'd1', title: 'X', probability: 0 }).probability).toBe(0);
  });

  it('mapeia joins de contact, company, stage e team_members', () => {
    const row = {
      id: 'd1',
      title: 'X',
      crm_contacts: { id: 'c1', name: 'Joao', avatar_color: '#abc', email: 'j@x.com' },
      crm_companies: { id: 'co1', name: 'Acme', segment: 'Tech' },
      crm_pipeline_stages: { id: 's1', name: 'Proposta', color: '#f00' },
      team_members: { id: 'tm1', name: 'Carlos', color: '#0f0' },
    };
    const result = dbToCrmDeal(row);
    expect(result.contact).toEqual({ id: 'c1', name: 'Joao', avatarColor: '#abc', email: 'j@x.com' });
    expect(result.company).toEqual({ id: 'co1', name: 'Acme', segment: 'Tech' });
    expect(result.stage).toEqual({ id: 's1', name: 'Proposta', color: '#f00' });
    expect(result.owner).toEqual({ id: 'tm1', name: 'Carlos', color: '#0f0' });
  });

  it('contact/company/stage/owner sao null quando os joins nao vem', () => {
    const result = dbToCrmDeal({ id: 'd1', title: 'X' });
    expect(result.contact).toBeNull();
    expect(result.company).toBeNull();
    expect(result.stage).toBeNull();
    expect(result.owner).toBeNull();
  });

  it('mapeia campos de reuniao', () => {
    const result = dbToCrmDeal({
      id: 'd1',
      title: 'X',
      meeting_agenda_event_id: 'e1',
      meeting_date: '2026-05-15T14:00:00Z',
      meeting_city: 'Sao Paulo',
    });
    expect(result.meetingAgendaEventId).toBe('e1');
    expect(result.meetingDate).toBe('2026-05-15T14:00:00Z');
    expect(result.meetingCity).toBe('Sao Paulo');
  });
});
