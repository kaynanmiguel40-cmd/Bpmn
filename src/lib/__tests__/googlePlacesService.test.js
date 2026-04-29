import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

beforeEach(() => {
  localStorage.clear();
  vi.stubEnv('VITE_GOOGLE_PLACES_API_KEY', 'TEST_KEY');
  vi.stubEnv('VITE_GOOGLE_MAPS_API_KEY', 'TEST_KEY');
  global.fetch = vi.fn();
});

afterEach(() => {
  vi.unstubAllEnvs();
  vi.restoreAllMocks();
});

import {
  enrichProspectWithGoogle,
  clearGooglePlacesCache,
  searchProspectsByGoogle,
  clearGoogleSearchCache,
  markGooglePlaceConverted,
  getConvertedGooglePlaces,
  clearConvertedGooglePlaces,
  parseFormattedAddress,
  cleanCompanyName,
  placeToProspect,
} from '../googlePlacesService';

const buildProspect = (overrides = {}) => ({
  cnpj: '12.345.678/0001-90',
  companyName: 'Padaria Real',
  city: 'Sao Paulo',
  state: 'SP',
  ...overrides,
});

const mockFetchJson = (json) => {
  global.fetch.mockResolvedValueOnce({ ok: true, json: async () => json });
};

describe('enrichProspectWithGoogle', () => {
  describe('inputs invalidos', () => {
    it('retorna null para prospect null', async () => {
      expect(await enrichProspectWithGoogle(null)).toBeNull();
    });

    it('retorna null para prospect sem companyName', async () => {
      expect(await enrichProspectWithGoogle({ cnpj: '123', companyName: '' })).toBeNull();
    });

    it('nao chama fetch quando companyName ausente', async () => {
      await enrichProspectWithGoogle({ cnpj: '123', companyName: '' });
      expect(global.fetch).not.toHaveBeenCalled();
    });
  });

  describe('chamada da API Places New', () => {
    it('faz POST para places.googleapis.com com header X-Goog-Api-Key', async () => {
      mockFetchJson({
        places: [{
          id: 'p1',
          displayName: { text: 'Padaria Real' },
          nationalPhoneNumber: '(11) 9999-9999',
          formattedAddress: 'Rua X, 1 - Sao Paulo, SP',
          businessStatus: 'OPERATIONAL',
        }],
      });

      await enrichProspectWithGoogle(buildProspect());

      expect(global.fetch).toHaveBeenCalledTimes(1);
      const [url, opts] = global.fetch.mock.calls[0];
      expect(url).toBe('https://places.googleapis.com/v1/places:searchText');
      expect(opts.method).toBe('POST');
      expect(opts.headers['X-Goog-Api-Key']).toBe('TEST_KEY');
      expect(opts.headers['X-Goog-FieldMask']).toContain('places.nationalPhoneNumber');
      expect(JSON.parse(opts.body).textQuery).toContain('Padaria Real');
    });

    it('inclui regionCode BR e languageCode pt-BR no body', async () => {
      mockFetchJson({ places: [] });
      await enrichProspectWithGoogle(buildProspect());
      const body = JSON.parse(global.fetch.mock.calls[0][1].body);
      expect(body.regionCode).toBe('BR');
      expect(body.languageCode).toBe('pt-BR');
    });
  });

  describe('match e extracao de campos', () => {
    it('retorna phone, displayName e formattedAddress quando bate', async () => {
      mockFetchJson({
        places: [{
          id: 'p1',
          displayName: { text: 'Padaria Real Ltda' },
          nationalPhoneNumber: '(11) 9999-9999',
          formattedAddress: 'Rua X, 1 - Sao Paulo, SP, 01000-000, Brazil',
          businessStatus: 'OPERATIONAL',
        }],
      });

      const result = await enrichProspectWithGoogle(buildProspect());
      expect(result).toBeTruthy();
      expect(result.source).toBe('google');
      expect(result.phone).toBe('(11) 9999-9999');
      expect(result.displayName).toBe('Padaria Real Ltda');
    });

    it('separa Instagram de website real', async () => {
      mockFetchJson({
        places: [{
          id: 'p1',
          displayName: { text: 'Padaria Real' },
          formattedAddress: 'Rua X - Sao Paulo, SP, Brazil',
          websiteUri: 'https://instagram.com/padariareal',
          businessStatus: 'OPERATIONAL',
        }],
      });

      const result = await enrichProspectWithGoogle(buildProspect());
      expect(result.instagram).toBe('https://instagram.com/padariareal');
      expect(result.website).toBe('');
      expect(result.facebook).toBe('');
    });

    it('separa Facebook de website real', async () => {
      mockFetchJson({
        places: [{
          id: 'p1',
          displayName: { text: 'Padaria Real' },
          formattedAddress: 'Rua X - Sao Paulo, SP, Brazil',
          websiteUri: 'https://www.facebook.com/padariareal',
          businessStatus: 'OPERATIONAL',
        }],
      });

      const result = await enrichProspectWithGoogle(buildProspect());
      expect(result.facebook).toBe('https://www.facebook.com/padariareal');
      expect(result.instagram).toBe('');
      expect(result.website).toBe('');
    });

    it('mantem website real quando nao eh rede social', async () => {
      mockFetchJson({
        places: [{
          id: 'p1',
          displayName: { text: 'Padaria Real' },
          formattedAddress: 'Rua X - Sao Paulo, SP, Brazil',
          websiteUri: 'https://padariareal.com.br',
          businessStatus: 'OPERATIONAL',
        }],
      });

      const result = await enrichProspectWithGoogle(buildProspect());
      expect(result.website).toBe('https://padariareal.com.br');
      expect(result.instagram).toBe('');
    });

    it('rejeita match com score baixo (nome e cidade muito diferentes)', async () => {
      mockFetchJson({
        places: [{
          id: 'p1',
          displayName: { text: 'Empresa Completamente Diferente XYZ' },
          formattedAddress: 'Cidade Aleatoria, RR, Brazil',
          businessStatus: 'OPERATIONAL',
        }],
      });

      const result = await enrichProspectWithGoogle(buildProspect());
      expect(result).toBeNull();
    });

    it('aceita match quando cidade bate (mesmo com nome distinto)', async () => {
      mockFetchJson({
        places: [{
          id: 'p1',
          displayName: { text: 'Padaria Real Ltda' },
          formattedAddress: 'Avenida Y - Sao Paulo, SP, 02000-000, Brazil',
          nationalPhoneNumber: '(11) 5555-5555',
          businessStatus: 'OPERATIONAL',
        }],
      });

      const result = await enrichProspectWithGoogle(buildProspect());
      expect(result).toBeTruthy();
      expect(result.phone).toBe('(11) 5555-5555');
    });
  });

  describe('cache (localStorage)', () => {
    it('cacheia hit e nao refaz fetch para mesmo CNPJ', async () => {
      mockFetchJson({
        places: [{
          id: 'p1',
          displayName: { text: 'Padaria Real' },
          formattedAddress: 'Rua X - Sao Paulo, SP, Brazil',
          nationalPhoneNumber: '(11) 1111-1111',
          businessStatus: 'OPERATIONAL',
        }],
      });

      await enrichProspectWithGoogle(buildProspect());
      const r2 = await enrichProspectWithGoogle(buildProspect());

      expect(global.fetch).toHaveBeenCalledTimes(1);
      expect(r2.phone).toBe('(11) 1111-1111');
    });

    it('cacheia miss e nao refaz fetch para CNPJ que nao bateu', async () => {
      mockFetchJson({ places: [] });

      await enrichProspectWithGoogle(buildProspect());
      const r2 = await enrichProspectWithGoogle(buildProspect());

      expect(global.fetch).toHaveBeenCalledTimes(1);
      expect(r2).toBeNull();
    });

    it('cache eh por CNPJ — CNPJs diferentes fazem requests separadas', async () => {
      mockFetchJson({ places: [] });
      mockFetchJson({ places: [] });

      await enrichProspectWithGoogle(buildProspect({ cnpj: '11.111.111/0001-11' }));
      await enrichProspectWithGoogle(buildProspect({ cnpj: '22.222.222/0002-22' }));

      expect(global.fetch).toHaveBeenCalledTimes(2);
    });

    it('cache normaliza CNPJ (formatado vs raw)', async () => {
      mockFetchJson({
        places: [{
          id: 'p1',
          displayName: { text: 'Padaria Real' },
          formattedAddress: 'Rua X - Sao Paulo, SP, Brazil',
          nationalPhoneNumber: '(11) 1111-1111',
          businessStatus: 'OPERATIONAL',
        }],
      });

      await enrichProspectWithGoogle(buildProspect({ cnpj: '12.345.678/0001-90' }));
      const r2 = await enrichProspectWithGoogle(buildProspect({ cnpj: '12345678000190' }));

      expect(global.fetch).toHaveBeenCalledTimes(1);
      expect(r2.phone).toBe('(11) 1111-1111');
    });

    it('NAO cacheia falhas de rede (HTTP 500/4xx)', async () => {
      global.fetch.mockResolvedValueOnce({ ok: false, status: 500, text: async () => 'err' });
      const r1 = await enrichProspectWithGoogle(buildProspect());
      expect(r1).toBeNull();

      mockFetchJson({
        places: [{
          id: 'p1',
          displayName: { text: 'Padaria Real' },
          formattedAddress: 'Rua X - Sao Paulo, SP, Brazil',
          nationalPhoneNumber: '(11) 9999-9999',
          businessStatus: 'OPERATIONAL',
        }],
      });
      const r2 = await enrichProspectWithGoogle(buildProspect());

      expect(global.fetch).toHaveBeenCalledTimes(2);
      expect(r2.phone).toBe('(11) 9999-9999');
    });
  });

  describe('tratamento de erros', () => {
    it('retorna null sem API key configurada', async () => {
      vi.unstubAllEnvs();
      vi.stubEnv('VITE_GOOGLE_PLACES_API_KEY', '');
      vi.stubEnv('VITE_GOOGLE_MAPS_API_KEY', '');

      const result = await enrichProspectWithGoogle(buildProspect());
      expect(result).toBeNull();
      expect(global.fetch).not.toHaveBeenCalled();
    });

    it('retorna null em HTTP 401 sem quebrar', async () => {
      global.fetch.mockResolvedValueOnce({ ok: false, status: 401, text: async () => 'Unauthorized' });
      const result = await enrichProspectWithGoogle(buildProspect());
      expect(result).toBeNull();
    });

    it('retorna null em excecao de rede', async () => {
      global.fetch.mockRejectedValueOnce(new Error('Network down'));
      const result = await enrichProspectWithGoogle(buildProspect());
      expect(result).toBeNull();
    });

    it('retorna null com places vazio', async () => {
      mockFetchJson({ places: [] });
      const result = await enrichProspectWithGoogle(buildProspect());
      expect(result).toBeNull();
    });
  });
});

describe('clearGooglePlacesCache', () => {
  it('remove apenas chaves com prefixo gp_enrich_', () => {
    localStorage.setItem('gp_enrich_111', 'a');
    localStorage.setItem('gp_enrich_222', 'b');
    localStorage.setItem('outra_chave', 'mantem');
    localStorage.setItem('settings_x', 'mantem');

    const removed = clearGooglePlacesCache();

    expect(removed).toBe(2);
    expect(localStorage.getItem('gp_enrich_111')).toBeNull();
    expect(localStorage.getItem('gp_enrich_222')).toBeNull();
    expect(localStorage.getItem('outra_chave')).toBe('mantem');
    expect(localStorage.getItem('settings_x')).toBe('mantem');
  });

  it('retorna 0 quando nao ha cache', () => {
    expect(clearGooglePlacesCache()).toBe(0);
  });
});

// ============================================================================
// Testes pros helpers privados expostos
// ============================================================================

describe('parseFormattedAddress', () => {
  it('extrai cidade e UF de endereco padrao Google BR', () => {
    expect(parseFormattedAddress('Rua X, 123 - Bairro, São Paulo - SP, 01000-000, Brazil'))
      .toEqual({ city: 'São Paulo', state: 'SP' });
  });

  it('lida com formato sem CEP', () => {
    expect(parseFormattedAddress('Rua Y, 99 - Centro, Belo Horizonte - MG, Brazil'))
      .toEqual({ city: 'Belo Horizonte', state: 'MG' });
  });

  it('retorna vazio pra null/undefined/string vazia', () => {
    expect(parseFormattedAddress(null)).toEqual({ city: '', state: '' });
    expect(parseFormattedAddress(undefined)).toEqual({ city: '', state: '' });
    expect(parseFormattedAddress('')).toEqual({ city: '', state: '' });
  });

  it('retorna vazio se nao bate com regex', () => {
    expect(parseFormattedAddress('endereco aleatorio sem padrao')).toEqual({ city: '', state: '' });
  });

  it('lida com cidades compostas (varias palavras)', () => {
    expect(parseFormattedAddress('Av. Z, 50 - Centro, Ribeirão Preto - SP, 14000-000'))
      .toEqual({ city: 'Ribeirão Preto', state: 'SP' });
  });
});

describe('cleanCompanyName', () => {
  it('pega o nome antes do " - "', () => {
    expect(cleanCompanyName('LPL Contabilidade - Escritorio em BH')).toBe('LPL Contabilidade');
  });

  it('pega o nome antes do " | "', () => {
    expect(cleanCompanyName('Padaria Real | A Melhor da Cidade')).toBe('Padaria Real');
  });

  it('mantem nome original quando nao tem separador', () => {
    expect(cleanCompanyName('Empresa XPTO Ltda')).toBe('Empresa XPTO Ltda');
  });

  it('preserva o original quando o split fica curto demais (<3 chars)', () => {
    expect(cleanCompanyName('AB - Empresa Real')).toBe('AB - Empresa Real');
  });

  it('retorna vazio pra null/undefined', () => {
    expect(cleanCompanyName(null)).toBe('');
    expect(cleanCompanyName(undefined)).toBe('');
    expect(cleanCompanyName('')).toBe('');
  });
});

describe('placeToProspect', () => {
  const buildPlace = (over = {}) => ({
    id: 'ChIJxyz',
    displayName: { text: 'Padaria Real - A Melhor', languageCode: 'pt' },
    formattedAddress: 'Rua A, 1 - Centro, São Paulo - SP, 01000-000, Brazil',
    nationalPhoneNumber: '(11) 99999-9999',
    websiteUri: 'https://padariareal.com.br',
    types: ['bakery', 'food_store', 'food', 'store', 'point_of_interest', 'establishment'],
    businessStatus: 'OPERATIONAL',
    ...over,
  });

  it('mapeia campos basicos', () => {
    const p = placeToProspect(buildPlace());
    expect(p.id).toBe('gpl_ChIJxyz');
    expect(p.googlePlaceId).toBe('ChIJxyz');
    expect(p.companyName).toBe('Padaria Real');
    expect(p.displayName).toBe('Padaria Real - A Melhor');
    expect(p.phone).toBe('(11) 99999-9999');
    expect(p.city).toBe('São Paulo');
    expect(p.state).toBe('SP');
  });

  it('separa Instagram em campo proprio', () => {
    const p = placeToProspect(buildPlace({ websiteUri: 'https://instagram.com/padariareal' }));
    expect(p.instagram).toBe('https://instagram.com/padariareal');
    expect(p.website).toBe('');
    expect(p.facebook).toBe('');
  });

  it('separa Facebook em campo proprio', () => {
    const p = placeToProspect(buildPlace({ websiteUri: 'https://www.facebook.com/page/123' }));
    expect(p.facebook).toContain('facebook.com');
    expect(p.website).toBe('');
    expect(p.instagram).toBe('');
  });

  it('mantem website real quando nao eh rede social', () => {
    const p = placeToProspect(buildPlace({ websiteUri: 'https://example.com.br' }));
    expect(p.website).toBe('https://example.com.br');
    expect(p.instagram).toBe('');
    expect(p.facebook).toBe('');
  });

  it('lida com place sem phone (campos opcionais)', () => {
    const p = placeToProspect(buildPlace({ nationalPhoneNumber: undefined }));
    expect(p.phone).toBe('');
    expect(p.phones).toEqual([]);
  });

  it('infere segmento dos types (filtra genericos)', () => {
    const p = placeToProspect(buildPlace({ types: ['bakery', 'food_store', 'establishment'] }));
    expect(p.segment).toBe('bakery');
  });

  it('source = "Google Places"', () => {
    expect(placeToProspect(buildPlace()).source).toBe('Google Places');
  });

  it('cnpj sempre vazio (sera resolvido no envio pra pipeline)', () => {
    expect(placeToProspect(buildPlace()).cnpj).toBe('');
  });

  it('prospectType = "lead"', () => {
    expect(placeToProspect(buildPlace()).prospectType).toBe('lead');
  });
});

// ============================================================================
// Testes pra searchProspectsByGoogle (Google-first)
// ============================================================================

describe('searchProspectsByGoogle', () => {
  it('retorna null quando segment+city+state vazios', async () => {
    expect(await searchProspectsByGoogle({})).toBeNull();
    expect(await searchProspectsByGoogle({ segment: '' })).toBeNull();
  });

  it('aceita apenas state (busca generica)', async () => {
    global.fetch.mockResolvedValueOnce({ ok: true, json: async () => ({ places: [] }) });
    const r = await searchProspectsByGoogle({ state: 'SP' });
    expect(r).toBeTruthy();
    expect(global.fetch).toHaveBeenCalled();
  });

  it('faz POST com query montada (segment + city + state)', async () => {
    global.fetch.mockResolvedValueOnce({ ok: true, json: async () => ({ places: [] }) });
    await searchProspectsByGoogle({ segment: 'Pizzaria', city: 'São Paulo', state: 'SP' });
    const body = JSON.parse(global.fetch.mock.calls[0][1].body);
    expect(body.textQuery).toContain('Pizzaria');
    expect(body.textQuery).toContain('São Paulo');
    expect(body.textQuery).toContain('SP');
    expect(body.languageCode).toBe('pt-BR');
    expect(body.regionCode).toBe('BR');
    expect(body.maxResultCount).toBe(20);
  });

  it('passa pageToken quando fornecido', async () => {
    global.fetch.mockResolvedValueOnce({ ok: true, json: async () => ({ places: [] }) });
    await searchProspectsByGoogle({ segment: 'Pizzaria' }, 'TOKEN_123');
    const body = JSON.parse(global.fetch.mock.calls[0][1].body);
    expect(body.pageToken).toBe('TOKEN_123');
  });

  it('mapeia places pra prospects', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        places: [
          {
            id: 'p1',
            displayName: { text: 'Pizzaria A' },
            formattedAddress: 'Rua A - São Paulo - SP, Brazil',
            nationalPhoneNumber: '(11) 1111-1111',
            businessStatus: 'OPERATIONAL',
          },
          {
            id: 'p2',
            displayName: { text: 'Pizzaria B' },
            formattedAddress: 'Rua B - São Paulo - SP, Brazil',
            nationalPhoneNumber: '(11) 2222-2222',
            businessStatus: 'OPERATIONAL',
          },
        ],
        nextPageToken: 'NEXT',
      }),
    });
    const r = await searchProspectsByGoogle({ segment: 'Pizzaria', state: 'SP' });
    expect(r.data).toHaveLength(2);
    expect(r.data[0].id).toBe('gpl_p1');
    expect(r.nextPageToken).toBe('NEXT');
    expect(r.source).toBe('google-first');
  });

  it('filtra empresas CLOSED_PERMANENTLY', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        places: [
          { id: 'p1', displayName: { text: 'Aberta' }, businessStatus: 'OPERATIONAL', formattedAddress: 'X' },
          { id: 'p2', displayName: { text: 'Fechada' }, businessStatus: 'CLOSED_PERMANENTLY', formattedAddress: 'Y' },
        ],
      }),
    });
    const r = await searchProspectsByGoogle({ segment: 'Pizzaria' });
    expect(r.data).toHaveLength(1);
    expect(r.data[0].displayName).toBe('Aberta');
  });

  it('retorna error 429 quando quota excedida', async () => {
    global.fetch.mockResolvedValueOnce({ ok: false, status: 429, text: async () => 'quota' });
    const r = await searchProspectsByGoogle({ segment: 'Pizzaria' });
    expect(r.error).toBe('quota_exceeded');
    expect(r.httpStatus).toBe(429);
    expect(r.data).toEqual([]);
  });

  it('retorna error unauthorized em 401', async () => {
    global.fetch.mockResolvedValueOnce({ ok: false, status: 401, text: async () => 'denied' });
    const r = await searchProspectsByGoogle({ segment: 'Pizzaria' });
    expect(r.error).toBe('unauthorized');
  });

  it('retorna error unauthorized em 403', async () => {
    global.fetch.mockResolvedValueOnce({ ok: false, status: 403, text: async () => 'forbidden' });
    const r = await searchProspectsByGoogle({ segment: 'Pizzaria' });
    expect(r.error).toBe('unauthorized');
  });

  it('retorna http_error genericos em 500', async () => {
    global.fetch.mockResolvedValueOnce({ ok: false, status: 500, text: async () => 'oops' });
    const r = await searchProspectsByGoogle({ segment: 'Pizzaria' });
    expect(r.error).toBe('http_error');
  });

  it('retorna null em fetch exception', async () => {
    global.fetch.mockRejectedValueOnce(new Error('Network down'));
    const r = await searchProspectsByGoogle({ segment: 'Pizzaria' });
    expect(r).toBeNull();
  });

  it('cacheia resultado e reaproveita em chamada igual', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        places: [
          { id: 'p1', displayName: { text: 'X' }, businessStatus: 'OPERATIONAL', formattedAddress: 'X' },
        ],
      }),
    });
    await searchProspectsByGoogle({ segment: 'Pizzaria', state: 'SP' });
    expect(global.fetch).toHaveBeenCalledTimes(1);
    await searchProspectsByGoogle({ segment: 'Pizzaria', state: 'SP' });
    expect(global.fetch).toHaveBeenCalledTimes(1); // cache hit
  });

  it('cache eh por (query + pageToken) — token diferente forca refetch', async () => {
    global.fetch
      .mockResolvedValueOnce({ ok: true, json: async () => ({ places: [] }) })
      .mockResolvedValueOnce({ ok: true, json: async () => ({ places: [] }) });
    await searchProspectsByGoogle({ segment: 'Pizzaria' }, '');
    await searchProspectsByGoogle({ segment: 'Pizzaria' }, 'PAGE2_TOKEN');
    expect(global.fetch).toHaveBeenCalledTimes(2);
  });
});

// ============================================================================
// Testes de dedup por googlePlaceId (placeIds ja convertidos)
// ============================================================================

describe('dedup de Google placeIds convertidos', () => {
  it('markGooglePlaceConverted adiciona ao set', () => {
    markGooglePlaceConverted('p1');
    markGooglePlaceConverted('p2');
    const set = getConvertedGooglePlaces();
    expect(set.has('p1')).toBe(true);
    expect(set.has('p2')).toBe(true);
    expect(set.size).toBe(2);
  });

  it('marcar mesmo id 2x nao duplica', () => {
    markGooglePlaceConverted('p1');
    markGooglePlaceConverted('p1');
    expect(getConvertedGooglePlaces().size).toBe(1);
  });

  it('ignora id null/undefined/vazio', () => {
    markGooglePlaceConverted(null);
    markGooglePlaceConverted(undefined);
    markGooglePlaceConverted('');
    expect(getConvertedGooglePlaces().size).toBe(0);
  });

  it('clearConvertedGooglePlaces zera o set', () => {
    markGooglePlaceConverted('p1');
    markGooglePlaceConverted('p2');
    clearConvertedGooglePlaces();
    expect(getConvertedGooglePlaces().size).toBe(0);
  });

  it('searchProspectsByGoogle filtra placeIds convertidos do resultado', async () => {
    markGooglePlaceConverted('p1');

    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        places: [
          { id: 'p1', displayName: { text: 'Ja convertido' }, businessStatus: 'OPERATIONAL', formattedAddress: 'X' },
          { id: 'p2', displayName: { text: 'Novo' },           businessStatus: 'OPERATIONAL', formattedAddress: 'Y' },
        ],
      }),
    });

    const r = await searchProspectsByGoogle({ segment: 'Pizzaria' });
    expect(r.data).toHaveLength(1);
    expect(r.data[0].googlePlaceId).toBe('p2');
  });

  it('cache hit tambem aplica filtro de convertidos (estado atual)', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        places: [
          { id: 'p1', displayName: { text: 'A' }, businessStatus: 'OPERATIONAL', formattedAddress: 'X' },
          { id: 'p2', displayName: { text: 'B' }, businessStatus: 'OPERATIONAL', formattedAddress: 'Y' },
        ],
      }),
    });

    // Primeira busca: nada convertido ainda — pega 2
    let r = await searchProspectsByGoogle({ segment: 'Pizzaria' });
    expect(r.data).toHaveLength(2);

    // Marca p1 como convertido
    markGooglePlaceConverted('p1');

    // Segunda busca (cache hit): filtra p1
    r = await searchProspectsByGoogle({ segment: 'Pizzaria' });
    expect(global.fetch).toHaveBeenCalledTimes(1); // foi cache
    expect(r.data).toHaveLength(1);
    expect(r.data[0].googlePlaceId).toBe('p2');
  });
});

// ============================================================================
// Testes pra clearGoogleSearchCache
// ============================================================================

describe('clearGoogleSearchCache', () => {
  it('remove apenas chaves com prefixo gp_search_', () => {
    localStorage.setItem('gp_search_abc', 'a');
    localStorage.setItem('gp_search_def', 'b');
    localStorage.setItem('outra_chave', 'mantem');
    localStorage.setItem('gp_enrich_xyz', 'mantem'); // outro prefix

    const removed = clearGoogleSearchCache();

    expect(removed).toBe(2);
    expect(localStorage.getItem('outra_chave')).toBe('mantem');
    expect(localStorage.getItem('gp_enrich_xyz')).toBe('mantem');
  });

  it('retorna 0 quando nao ha cache', () => {
    expect(clearGoogleSearchCache()).toBe(0);
  });
});
