import { describe, it, expect, vi, beforeAll, beforeEach } from 'vitest';

// Mocks de dependencias (vi.mock eh hoisted automaticamente pro topo do arquivo)
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
vi.mock('../../../../lib/googlePlacesService', () => ({
  searchProspectsByGoogle: vi.fn(),
  markGooglePlaceConverted: vi.fn(),
}));
vi.mock('../../../../lib/usageTracker', () => ({
  trackCdSearch: vi.fn(),
  trackCdLookup: vi.fn(),
}));
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

let isMobilePhone, dbToProspect, lookupCnpjByName;

beforeAll(async () => {
  // CASA_DOS_DADOS_API_KEY eh capturado em const top-level no servico, entao
  // precisa estar setado ANTES do primeiro import. Mutando import.meta.env
  // direto antes do dynamic import garante que a env esta no lugar quando o
  // modulo eh avaliado pela primeira vez.
  import.meta.env.VITE_CASA_DOS_DADOS_API_KEY = 'TEST_CD_KEY';
  const m = await import('../crmProspectsService');
  isMobilePhone = m.isMobilePhone;
  dbToProspect = m.dbToProspect;
  lookupCnpjByName = m.lookupCnpjByName;
});

beforeEach(() => {
  localStorage.clear();
  global.fetch = vi.fn();
});

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

describe('lookupCnpjByName', () => {
  it('retorna null para nome vazio', async () => {
    expect(await lookupCnpjByName('', 'SP')).toBeNull();
    expect(await lookupCnpjByName(null, 'SP')).toBeNull();
  });

  it('faz POST para Casa Dados com busca_textual + UF (tokens em lowercase)', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ cnpjs: [{ cnpj: '12345678000190', razao_social: 'Acme Solutions' }] }),
    });
    await lookupCnpjByName('Acme Solutions', 'SP');
    expect(global.fetch).toHaveBeenCalledTimes(1);
    const body = JSON.parse(global.fetch.mock.calls[0][1].body);
    expect(body.uf).toEqual(['sp']);
    // tokenizeName forca lowercase — variante eh "acme solutions"
    expect(body.busca_textual[0].texto).toContain('acme solutions');
    expect(body.situacao_cadastral).toContain('ATIVA');
  });

  it('NAO inclui filtro de municipio mesmo quando city eh fornecida', async () => {
    // Comportamento intencional: cidade do Google (formattedAddress) nem sempre
    // bate exato com municipio CD. Filtragem por cidade eh feita via score boost
    // depois de receber resultados, nao no body da request.
    global.fetch.mockResolvedValueOnce({ ok: true, json: async () => ({ cnpjs: [] }) });
    await lookupCnpjByName('Acme Solutions', 'SP', 'São Paulo');
    expect(global.fetch).toHaveBeenCalled();
    const body = JSON.parse(global.fetch.mock.calls[0][1].body);
    expect(body.municipio).toBeUndefined();
  });

  it('limpa sufixos juridicos do nome (LTDA) e baixa pra lowercase', async () => {
    // STOPWORDS_LOOKUP remove "ltda", "me", "epp", "eireli", "sa", "empresa" etc.
    global.fetch.mockResolvedValueOnce({ ok: true, json: async () => ({ cnpjs: [] }) });
    await lookupCnpjByName('Casa Real LTDA', 'SP');
    expect(global.fetch).toHaveBeenCalled();
    const body = JSON.parse(global.fetch.mock.calls[0][1].body);
    expect(body.busca_textual[0].texto[0]).toBe('casa real');
  });

  it('retorna primeiro candidate transformado', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        cnpjs: [{
          cnpj: '12345678000190',
          razao_social: 'Empresa Real Ltda',
          nome_fantasia: 'Empresa',
          quadro_societario: [{ nome: 'Joao Silva', qualificacao_socio: 'Socio-Administrador' }],
        }],
      }),
    });
    const r = await lookupCnpjByName('Empresa Real', 'SP');
    expect(r).toBeTruthy();
    expect(r.cnpj).toBe('12.345.678/0001-90');
    expect(r.contactName).toBe('Joao Silva');
    expect(r.position).toBe('Socio-Administrador');
  });

  it('cacheia hit e nao refaz fetch', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ cnpjs: [{ cnpj: '12345678000190', razao_social: 'Acme Solutions' }] }),
    });
    await lookupCnpjByName('Acme Solutions', 'SP');
    expect(global.fetch).toHaveBeenCalledTimes(1);
    await lookupCnpjByName('Acme Solutions', 'SP');
    expect(global.fetch).toHaveBeenCalledTimes(1); // cache
  });

  it('cacheia miss tambem (nao reconsulta)', async () => {
    global.fetch.mockResolvedValueOnce({ ok: true, json: async () => ({ cnpjs: [] }) });
    await lookupCnpjByName('Empresa Inexistente', 'SP');
    expect(global.fetch).toHaveBeenCalledTimes(1);
    await lookupCnpjByName('Empresa Inexistente', 'SP');
    expect(global.fetch).toHaveBeenCalledTimes(1); // cache miss tambem nao refaz
  });

  it('cache eh case-insensitive no nome', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ cnpjs: [{ cnpj: '12345678000190', razao_social: 'Acme Solutions' }] }),
    });
    await lookupCnpjByName('Acme Solutions', 'SP');
    await lookupCnpjByName('ACME SOLUTIONS', 'SP');
    await lookupCnpjByName('  acme solutions  ', 'SP');
    expect(global.fetch).toHaveBeenCalledTimes(1);
  });

  it('cache distingue por UF', async () => {
    // Uso nome de 1 token ('acme') pra gerar 1 unica variante de busca,
    // tornando a contagem de fetches deterministica (1 por chamada).
    global.fetch
      .mockResolvedValueOnce({ ok: true, json: async () => ({ cnpjs: [] }) })
      .mockResolvedValueOnce({ ok: true, json: async () => ({ cnpjs: [] }) });
    await lookupCnpjByName('Acme', 'SP');
    await lookupCnpjByName('Acme', 'MG');
    expect(global.fetch).toHaveBeenCalledTimes(2);
  });

  it('retorna null em HTTP error sem cachear (permite retry)', async () => {
    // 1 token = 1 variante = 1 fetch por chamada (deterministico)
    global.fetch.mockResolvedValueOnce({ ok: false, status: 500 });
    expect(await lookupCnpjByName('Acme', 'SP')).toBeNull();
    // Pode tentar de novo (nao cacheou — bug fix: HTTP error nao deve cachear miss)
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ cnpjs: [{ cnpj: '12345678000190', razao_social: 'Acme' }] }),
    });
    const r = await lookupCnpjByName('Acme', 'SP');
    expect(r).toBeTruthy();
    expect(global.fetch).toHaveBeenCalledTimes(2);
  });

  it('retorna null em network error sem cachear (permite retry)', async () => {
    global.fetch.mockRejectedValueOnce(new Error('network down'));
    expect(await lookupCnpjByName('Beta', 'SP')).toBeNull();
    // Network errors tambem nao cacheiam — usuario pode tentar quando voltar
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ cnpjs: [{ cnpj: '11111111000111', razao_social: 'Beta' }] }),
    });
    const r = await lookupCnpjByName('Beta', 'SP');
    expect(r).toBeTruthy();
    expect(global.fetch).toHaveBeenCalledTimes(2);
  });
});
