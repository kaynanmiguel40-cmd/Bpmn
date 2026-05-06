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
vi.mock('../../schemas/crmValidation', () => ({ crmGoalSchema: {} }));
vi.mock('../crmTrafficService', () => ({ getTrafficKPIs: vi.fn() }));
vi.mock('../crmReportsService', () => ({
  getSalesReport: vi.fn(),
  getLearnedProbabilities: vi.fn(),
}));

import { dbToCrmGoal } from '../crmGoalsService';

describe('dbToCrmGoal', () => {
  it('retorna null para entrada nula', () => {
    expect(dbToCrmGoal(null)).toBeNull();
  });

  it('mapeia campos completos', () => {
    const row = {
      id: 'g1',
      title: 'Meta Q1',
      description: '100k em vendas',
      type: 'individual',
      owner_id: 'tm1',
      target_value: 100000,
      current_value: 25000,
      period_start: '2026-01-01',
      period_end: '2026-03-31',
      status: 'active',
      created_by: 'user',
      created_at: '2026-01-01',
    };
    const result = dbToCrmGoal(row);
    expect(result.id).toBe('g1');
    expect(result.title).toBe('Meta Q1');
    expect(result.description).toBe('100k em vendas');
    expect(result.type).toBe('individual');
    expect(result.ownerId).toBe('tm1');
    expect(result.targetValue).toBe(100000);
    expect(result.currentValue).toBe(25000);
    expect(result.periodStart).toBe('2026-01-01');
    expect(result.periodEnd).toBe('2026-03-31');
    expect(result.status).toBe('active');
  });

  it('aplica defaults: type=individual, status=active, valores=0', () => {
    const result = dbToCrmGoal({ id: 'g1', title: 'X' });
    expect(result.type).toBe('individual');
    expect(result.status).toBe('active');
    expect(result.targetValue).toBe(0);
    expect(result.currentValue).toBe(0);
    expect(result.description).toBe('');
  });

  it('mapeia owner com authUserId', () => {
    const result = dbToCrmGoal({
      id: 'g1',
      title: 'X',
      team_members: { id: 'tm1', name: 'Carlos', color: '#abc', auth_user_id: 'auth1' },
    });
    expect(result.owner).toEqual({
      id: 'tm1',
      name: 'Carlos',
      color: '#abc',
      authUserId: 'auth1',
    });
  });

  it('owner.authUserId vira null quando ausente', () => {
    const result = dbToCrmGoal({
      id: 'g1',
      title: 'X',
      team_members: { id: 'tm1', name: 'Carlos', color: '#abc' },
    });
    expect(result.owner.authUserId).toBeNull();
  });

  it('owner null sem join', () => {
    expect(dbToCrmGoal({ id: 'g1', title: 'X' }).owner).toBeNull();
  });
});
