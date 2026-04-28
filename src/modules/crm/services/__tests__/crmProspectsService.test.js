import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mocks de dependencias antes do import do modulo testado
vi.mock('../../../../lib/supabase', () => ({
  supabase: {
    from: vi.fn(),
    auth: { getSession: vi.fn().mockResolvedValue({ data: { session: null } }) },
  },
}));
vi.mock('../../../../contexts/ToastContext', () => ({ toast: vi.fn() }));
vi.mock('../../../../lib/serviceFactory', () => ({
  createCRUDService: vi.fn(() => ({
    create: vi.fn(),
    update: vi.fn(),
    getAll: vi.fn(),
    remove: vi.fn(),
  })),
}));
vi.mock('../crmCompaniesService', () => ({ createCrmCompany: vi.fn() }));
vi.mock('../crmDealsService', () => ({ createCrmDeal: vi.fn() }));
vi.mock('../../schemas/crmValidation', () => ({ crmProspectSchema: {} }));
vi.mock('../../data/cnaeMapping', () => ({
  SEGMENT_TO_CNAE: { Tecnologia: ['62'] },
  CNAE_TO_SEGMENT: { '6201': 'Tecnologia' },
  SIZE_TO_PORTE: { mei: { codigos: ['00'], mei: true }, me: { codigos: ['01'] } },
  PORTE_TO_SIZE: { '00': 'mei', '01': 'me', '05': 'media' },
  REVENUE_TO_CAPITAL: {},
  PARTNER_CATEGORY_TO_CNAE: { Contabilidade: ['6920'] },
  CNAE_TO_PARTNER_CATEGORY: { '6920': 'Contabilidade' },
  PARTNER_CATEGORY_LABELS: { Contabilidade: 'Contabilidade' },
}));

import { isMobilePhone, dbToProspect } from '../crmProspectsService';

describe('isMobilePhone', () => {
  it('detecta celular 11 digitos com 9 inicial apos DDD (formatado)', () => {
    expect(isMobilePhone('(11) 98765-4321')).toBe(true);
    expect(isMobilePhone('(31) 99999-8888')).toBe(true);
  });

  it('detecta celular 11 digitos sem formatacao', () => {
    expect(isMobilePhone('11987654321')).toBe(true);
  });

  it('rejeita fixo 10 digitos', () => {
    expect(isMobilePhone('(11) 3344-5566')).toBe(false);
    expect(isMobilePhone('1133445566')).toBe(false);
  });

  it('rejeita celular antigo sem 9 inicial (10 digitos)', () => {
    // Em teoria nao existem mais, mas se vier no formato antigo, eh fixo pra todos os fins
    expect(isMobilePhone('1187654321')).toBe(false);
  });

  it('descarta codigo de pais 55', () => {
    expect(isMobilePhone('+5511987654321')).toBe(true);
    expect(isMobilePhone('5511987654321')).toBe(true);
    expect(isMobilePhone('+551133445566')).toBe(false);
    expect(isMobilePhone('551133445566')).toBe(false);
  });

  it('aceita 9 digitos locais com 9 inicial (sem DDD)', () => {
    expect(isMobilePhone('987654321')).toBe(true);
  });

  it('rejeita 8 digitos (fixo local sem DDD)', () => {
    expect(isMobilePhone('33445566')).toBe(false);
  });

  it('retorna false para null/undefined/string vazia', () => {
    expect(isMobilePhone(null)).toBe(false);
    expect(isMobilePhone(undefined)).toBe(false);
    expect(isMobilePhone('')).toBe(false);
  });

  it('retorna false para entrada invalida (curta demais)', () => {
    expect(isMobilePhone('123')).toBe(false);
    expect(isMobilePhone('12345')).toBe(false);
  });

  it('lida com caracteres nao-numericos no meio', () => {
    expect(isMobilePhone('+55 (11) 98765-4321')).toBe(true);
    expect(isMobilePhone('11.98765.4321')).toBe(true);
    expect(isMobilePhone('11/3344/5566')).toBe(false);
  });
});

describe('dbToProspect', () => {
  it('mapeia campos basicos da linha do DB', () => {
    const row = {
      id: 'crm_prs_123',
      company_name: 'Empresa X Ltda',
      contact_name: 'Joao Silva',
      cnpj: '12.345.678/0001-90',
      phone: '(11) 98765-4321',
      email: 'contato@empresa.com',
      segment: 'Tecnologia',
      size: 'me',
      city: 'Sao Paulo',
      state: 'SP',
      created_at: '2026-01-01',
    };
    const result = dbToProspect(row);
    expect(result.companyName).toBe('Empresa X Ltda');
    expect(result.contactName).toBe('Joao Silva');
    expect(result.cnpj).toBe('12.345.678/0001-90');
    expect(result.phone).toBe('(11) 98765-4321');
    expect(result.email).toBe('contato@empresa.com');
    expect(result.segment).toBe('Tecnologia');
    expect(result.size).toBe('me');
    expect(result.city).toBe('Sao Paulo');
    expect(result.state).toBe('SP');
  });

  it('aplica valores padrao em campos ausentes', () => {
    const result = dbToProspect({ id: 'x', company_name: 'Empresa Y' });
    expect(result.contactName).toBe('');
    expect(result.phone).toBe('');
    expect(result.email).toBe('');
    expect(result.status).toBe('new');
    expect(result.prospectType).toBe('lead');
  });

  it('retorna null para entrada null/undefined', () => {
    expect(dbToProspect(null)).toBeNull();
    expect(dbToProspect(undefined)).toBeNull();
  });

  it('mapeia team_members joineado para assignedMember', () => {
    const result = dbToProspect({
      id: 'x',
      company_name: 'Y',
      team_members: { id: 'tm1', name: 'Maria', color: '#abc' },
    });
    expect(result.assignedMember).toEqual({ id: 'tm1', name: 'Maria', color: '#abc' });
  });
});

