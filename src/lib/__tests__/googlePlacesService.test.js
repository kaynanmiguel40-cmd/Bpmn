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

import { enrichProspectWithGoogle, clearGooglePlacesCache } from '../googlePlacesService';

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
