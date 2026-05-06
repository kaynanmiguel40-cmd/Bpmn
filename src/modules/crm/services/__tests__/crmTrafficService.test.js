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
vi.mock('../../schemas/crmValidation', () => ({ crmTrafficSchema: {} }));

import { dbToTrafficEntry } from '../crmTrafficService';

describe('dbToTrafficEntry', () => {
  it('retorna null para entrada nula', () => {
    expect(dbToTrafficEntry(null)).toBeNull();
  });

  it('mapeia todos os campos numericos', () => {
    const row = {
      id: 'tf1',
      channel: 'meta_ads',
      pipeline_id: 'p1',
      period_start: '2026-04-01',
      period_end: '2026-04-30',
      amount_spent: '1234.56', // pode vir como string do PG numeric
      impressions: 10000,
      clicks: 500,
      leads_generated: 50,
      conversions: 5,
      revenue_generated: '5000.00',
      notes: 'Campanha A',
      created_by: 'u1',
      created_at: '2026-04-01',
    };
    const result = dbToTrafficEntry(row);
    expect(result.id).toBe('tf1');
    expect(result.channel).toBe('meta_ads');
    expect(result.pipelineId).toBe('p1');
    expect(result.periodStart).toBe('2026-04-01');
    expect(result.periodEnd).toBe('2026-04-30');
    expect(result.amountSpent).toBe(1234.56);
    expect(result.impressions).toBe(10000);
    expect(result.clicks).toBe(500);
    expect(result.leadsGenerated).toBe(50);
    expect(result.conversions).toBe(5);
    expect(result.revenueGenerated).toBe(5000);
    expect(result.notes).toBe('Campanha A');
  });

  it('amount_spent invalida vira 0', () => {
    expect(dbToTrafficEntry({ id: 'x', channel: 'm', amount_spent: 'abc' }).amountSpent).toBe(0);
    expect(dbToTrafficEntry({ id: 'x', channel: 'm', amount_spent: null }).amountSpent).toBe(0);
  });

  it('mapeia pipeline joineado', () => {
    const result = dbToTrafficEntry({
      id: 'tf1',
      channel: 'm',
      crm_pipelines: { id: 'p1', name: 'Vendas' },
    });
    expect(result.pipeline).toEqual({ id: 'p1', name: 'Vendas' });
  });

  it('pipeline null sem join', () => {
    const result = dbToTrafficEntry({ id: 'tf1', channel: 'm' });
    expect(result.pipeline).toBeNull();
  });

  it('campos ausentes viram 0/null/string vazia', () => {
    const result = dbToTrafficEntry({ id: 'x', channel: 'm' });
    expect(result.impressions).toBe(0);
    expect(result.clicks).toBe(0);
    expect(result.leadsGenerated).toBe(0);
    expect(result.conversions).toBe(0);
    expect(result.amountSpent).toBe(0);
    expect(result.revenueGenerated).toBe(0);
    expect(result.notes).toBe('');
  });
});
