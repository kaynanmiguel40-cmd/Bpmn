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

import { dbToCrmActivity, completeCrmActivity } from '../crmActivitiesService';
import { supabase } from '../../../../lib/supabase';

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

// ============================================================================
// completeCrmActivity — a ponte com o playbook
// ============================================================================

/**
 * A regra que faz a Pipeline parar de mentir: concluir uma ligacao em que
 * NINGUEM ATENDEU tira a tarefa da fila (ela foi executada), mas NAO marca o
 * passo do processo como cumprido — o objetivo do passo era falar com a
 * pessoa, e isso nao aconteceu. Antes os dois desfechos pintavam o passo de
 * verde igual.
 */
describe('completeCrmActivity — contacted', () => {
  function setup(row) {
    const tables = [];
    supabase.from.mockImplementation((table) => {
      const q = { table, _upsert: null };
      tables.push(q);
      q.update = () => q;
      q.eq = () => q;
      q.select = () => q;
      q.single = () => Promise.resolve({ data: row, error: null });
      q.upsert = (payload) => { q._upsert = payload; return Promise.resolve({ error: null }); };
      return q;
    });
    return tables;
  }

  const ROW = {
    id: 'a1', title: 'Ligação', type: 'call',
    stage_step_id: 'p1', deal_id: 'd1',
    completed: true, created_at: 'x', updated_at: 'y',
  };

  it('falou com o lead: marca o passo do processo', async () => {
    const tables = setup(ROW);
    await completeCrmActivity('a1', { output: 'Topou a reunião', contacted: true });

    const prog = tables.find(t => t.table === 'crm_deal_step_progress');
    expect(prog).toBeDefined();
    expect(prog._upsert).toMatchObject({ deal_id: 'd1', step_id: 'p1', outcome: 'Topou a reunião' });
  });

  it('NAO atendeu: conclui a tarefa mas NAO marca o passo', async () => {
    const tables = setup(ROW);
    const r = await completeCrmActivity('a1', { output: 'Não atendeu', contacted: false });

    // A tarefa foi concluida...
    expect(r.id).toBe('a1');
    const act = tables.find(t => t.table === 'crm_activities');
    expect(act).toBeDefined();
    // ...mas o progresso do passo nem foi tocado.
    expect(tables.some(t => t.table === 'crm_deal_step_progress')).toBe(false);
  });

  it('default e "falou" — quem nao passa contacted mantem o comportamento antigo', async () => {
    const tables = setup(ROW);
    await completeCrmActivity('a1', { output: 'ok' });
    expect(tables.some(t => t.table === 'crm_deal_step_progress')).toBe(true);
  });

  it('tarefa avulsa (sem passo) nunca toca no progresso', async () => {
    const tables = setup({ ...ROW, stage_step_id: null });
    await completeCrmActivity('a1', { output: 'ok', contacted: true });
    expect(tables.some(t => t.table === 'crm_deal_step_progress')).toBe(false);
  });
});
