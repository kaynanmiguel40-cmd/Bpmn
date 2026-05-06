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
vi.mock('../../schemas/crmValidation', () => ({ crmCompanySchema: {} }));

import { dbToCrmCompany } from '../crmCompaniesService';

describe('dbToCrmCompany', () => {
  it('retorna null para entrada nula', () => {
    expect(dbToCrmCompany(null)).toBeNull();
    expect(dbToCrmCompany(undefined)).toBeNull();
  });

  it('mapeia campos preenchidos', () => {
    const row = {
      id: 'co1',
      name: 'Acme Ltda',
      cnpj: '12.345.678/0001-90',
      segment: 'Tecnologia',
      size: 'me',
      revenue: 500000,
      phone: '(11) 1234-5678',
      email: 'contato@acme.com',
      website: 'acme.com',
      address: 'Rua X, 123',
      city: 'Sao Paulo',
      state: 'SP',
      notes: 'Cliente premium',
      created_by: 'user-uuid',
      created_at: '2026-01-01',
      updated_at: '2026-02-01',
    };
    const result = dbToCrmCompany(row);
    expect(result.id).toBe('co1');
    expect(result.name).toBe('Acme Ltda');
    expect(result.cnpj).toBe('12.345.678/0001-90');
    expect(result.segment).toBe('Tecnologia');
    expect(result.size).toBe('me');
    expect(result.revenue).toBe(500000);
    expect(result.phone).toBe('(11) 1234-5678');
    expect(result.email).toBe('contato@acme.com');
    expect(result.website).toBe('acme.com');
    expect(result.address).toBe('Rua X, 123');
    expect(result.city).toBe('Sao Paulo');
    expect(result.state).toBe('SP');
    expect(result.notes).toBe('Cliente premium');
    expect(result.createdBy).toBe('user-uuid');
    expect(result.deletedAt).toBeNull();
  });

  it('campos opcionais ausentes viram null/string vazia', () => {
    const result = dbToCrmCompany({ id: 'co1', name: 'X' });
    expect(result.cnpj).toBeNull();
    expect(result.segment).toBeNull();
    expect(result.email).toBeNull();
    expect(result.phone).toBeNull();
    expect(result.website).toBeNull();
    expect(result.notes).toBe('');
  });

  it('expoe deletedAt quando vem na linha', () => {
    const result = dbToCrmCompany({ id: 'co1', name: 'X', deleted_at: '2026-04-01' });
    expect(result.deletedAt).toBe('2026-04-01');
  });
});
