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
// crmContactsService importa dbToCrmCompany, que por sua vez precisa de crmCompanySchema
vi.mock('../../schemas/crmValidation', () => ({
  crmContactSchema: {},
  crmCompanySchema: {},
}));

import { dbToCrmContact, exportContactsCSV } from '../crmContactsService';

describe('dbToCrmContact', () => {
  it('retorna null para entrada nula', () => {
    expect(dbToCrmContact(null)).toBeNull();
    expect(dbToCrmContact(undefined)).toBeNull();
  });

  it('mapeia campos preenchidos', () => {
    const row = {
      id: 'c1',
      name: 'Joao Silva',
      email: 'joao@x.com',
      phone: '(11) 98765-4321',
      position: 'CEO',
      avatar_color: '#ff0000',
      status: 'active',
      company_id: 'co1',
      tags: ['vip', 'novo'],
      address: 'Av. Paulista',
      city: 'SP',
      state: 'SP',
      notes: 'lorem',
      created_at: '2026-01-01',
    };
    const result = dbToCrmContact(row);
    expect(result.id).toBe('c1');
    expect(result.name).toBe('Joao Silva');
    expect(result.email).toBe('joao@x.com');
    expect(result.phone).toBe('(11) 98765-4321');
    expect(result.position).toBe('CEO');
    expect(result.avatarColor).toBe('#ff0000');
    expect(result.status).toBe('active');
    expect(result.companyId).toBe('co1');
    expect(result.tags).toEqual(['vip', 'novo']);
  });

  it('aplica defaults: status=lead, tags=[]', () => {
    const result = dbToCrmContact({ id: 'c1', name: 'X' });
    expect(result.status).toBe('lead');
    expect(result.tags).toEqual([]);
  });

  it('tags nao-array vira array vazia', () => {
    const result = dbToCrmContact({ id: 'c1', name: 'X', tags: 'invalid' });
    expect(result.tags).toEqual([]);
  });

  it('mapeia company joineada', () => {
    const result = dbToCrmContact({
      id: 'c1',
      name: 'X',
      crm_companies: { id: 'co1', name: 'Acme' },
    });
    expect(result.company).toBeTruthy();
    expect(result.company.id).toBe('co1');
    expect(result.company.name).toBe('Acme');
  });

  it('company eh null quando join nao vem', () => {
    expect(dbToCrmContact({ id: 'c1', name: 'X' }).company).toBeNull();
  });
});

describe('exportContactsCSV', () => {
  it('gera header padrao', () => {
    const csv = exportContactsCSV([]);
    expect(csv.split('\n')[0]).toBe('Nome,Email,Telefone,Cargo,Status,Empresa,Cidade,Estado,Tags');
  });

  it('exporta linhas formatadas', () => {
    const csv = exportContactsCSV([
      {
        name: 'Joao',
        email: 'j@x.com',
        phone: '11 9999',
        position: 'CEO',
        status: 'active',
        company: { name: 'Acme' },
        city: 'SP',
        state: 'SP',
        tags: ['vip', 'churn'],
      },
    ]);
    const lines = csv.split('\n');
    expect(lines.length).toBe(2);
    expect(lines[1]).toContain('"Joao"');
    expect(lines[1]).toContain('"Acme"');
    expect(lines[1]).toContain('"vip; churn"');
  });

  it('escapa aspas duplicando', () => {
    const csv = exportContactsCSV([
      { name: 'O "Cara"', email: '', phone: '', position: '', status: 'lead', tags: [] },
    ]);
    const line = csv.split('\n')[1];
    expect(line).toContain('"O ""Cara"""');
  });

  it('campos ausentes viram string vazia', () => {
    const csv = exportContactsCSV([{ name: 'X', status: 'lead' }]);
    const line = csv.split('\n')[1];
    // 9 colunas
    expect(line.match(/"/g).length).toBe(9 * 2);
  });
});
