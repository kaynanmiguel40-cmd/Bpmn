import { describe, it, expect } from 'vitest';
import {
  SEGMENT_TO_CNAE,
  CNAE_TO_SEGMENT,
  SIZE_TO_PORTE,
  PORTE_TO_SIZE,
  REVENUE_TO_CAPITAL,
  PARTNER_CATEGORY_TO_CNAE,
  CNAE_TO_PARTNER_CATEGORY,
  PARTNER_CATEGORY_LABELS,
  PARTNER_TYPE_OPTIONS,
} from '../cnaeMapping';

// ─────────────────────────────────────────────────────────────────────────────
// SEGMENT_TO_CNAE / CNAE_TO_SEGMENT
// ─────────────────────────────────────────────────────────────────────────────

describe('SEGMENT_TO_CNAE', () => {
  it('contem segmentos chave', () => {
    expect(SEGMENT_TO_CNAE.Tecnologia).toBeTruthy();
    expect(SEGMENT_TO_CNAE.Saude).toBeTruthy();
    expect(SEGMENT_TO_CNAE.Educacao).toBeTruthy();
    expect(SEGMENT_TO_CNAE.Varejo).toBeTruthy();
    expect(SEGMENT_TO_CNAE.Industria).toBeTruthy();
    expect(SEGMENT_TO_CNAE.Servicos).toBeTruthy();
    expect(SEGMENT_TO_CNAE.Financeiro).toBeTruthy();
    expect(SEGMENT_TO_CNAE.Construcao).toBeTruthy();
    expect(SEGMENT_TO_CNAE.Alimenticio).toBeTruthy();
    expect(SEGMENT_TO_CNAE.Logistica).toBeTruthy();
    expect(SEGMENT_TO_CNAE.Agronegocio).toBeTruthy();
    expect(SEGMENT_TO_CNAE.Outro).toEqual([]); // sem filtro
  });

  it('todos os segmentos exceto Outro tem ao menos 1 CNAE', () => {
    Object.entries(SEGMENT_TO_CNAE).forEach(([seg, codes]) => {
      if (seg === 'Outro') return;
      expect(codes.length).toBeGreaterThan(0);
    });
  });

  it('todo CNAE tem 7 digitos', () => {
    Object.values(SEGMENT_TO_CNAE).flat().forEach(code => {
      expect(code).toMatch(/^\d{7}$/);
    });
  });
});

describe('CNAE_TO_SEGMENT (reverse map)', () => {
  it('mapeamento reverso esta correto pra Tecnologia', () => {
    expect(CNAE_TO_SEGMENT['6201501']).toBe('Tecnologia');
    expect(CNAE_TO_SEGMENT['6204000']).toBe('Tecnologia');
  });

  it('mapeamento reverso esta correto pra Saude', () => {
    expect(CNAE_TO_SEGMENT['8610101']).toBe('Saude');
  });

  it('CNAE inexistente retorna undefined', () => {
    expect(CNAE_TO_SEGMENT['9999999']).toBeUndefined();
  });

  it('todos os CNAEs do forward map estao no reverse', () => {
    Object.entries(SEGMENT_TO_CNAE).forEach(([seg, codes]) => {
      if (seg === 'Outro') return;
      codes.forEach(code => {
        // Pode haver colisao (ex: 1091100 aparece em Industria e Alimenticio).
        // Apenas garantimos que o reverse aponta pra um segmento valido.
        expect(SEGMENT_TO_CNAE).toHaveProperty(CNAE_TO_SEGMENT[code]);
      });
    });
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// SIZE / PORTE
// ─────────────────────────────────────────────────────────────────────────────

describe('SIZE_TO_PORTE', () => {
  it('mapeia mei com flag optante', () => {
    expect(SIZE_TO_PORTE.mei).toEqual({ codigos: ['01'], mei: { optante: true } });
  });

  it('mapeia me com flag excluir_optante (separa de MEI)', () => {
    expect(SIZE_TO_PORTE.me.codigos).toEqual(['01']);
    expect(SIZE_TO_PORTE.me.mei).toEqual({ excluir_optante: true });
  });

  it('mapeia epp pro codigo 03', () => {
    expect(SIZE_TO_PORTE.epp.codigos).toEqual(['03']);
  });

  it('mapeia media e grande pro codigo 05', () => {
    expect(SIZE_TO_PORTE.media.codigos).toEqual(['05']);
    expect(SIZE_TO_PORTE.grande.codigos).toEqual(['05']);
  });
});

describe('PORTE_TO_SIZE', () => {
  it('reverso correto', () => {
    expect(PORTE_TO_SIZE['01']).toBe('me');
    expect(PORTE_TO_SIZE['03']).toBe('epp');
    expect(PORTE_TO_SIZE['05']).toBe('media');
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// REVENUE_TO_CAPITAL
// ─────────────────────────────────────────────────────────────────────────────

describe('REVENUE_TO_CAPITAL', () => {
  it('faixas crescentes sem sobreposicao errada', () => {
    expect(REVENUE_TO_CAPITAL['ate100k']).toEqual({ minimo: 0, maximo: 100000 });
    expect(REVENUE_TO_CAPITAL['100k-500k']).toEqual({ minimo: 100000, maximo: 500000 });
    expect(REVENUE_TO_CAPITAL['500k-1m'].maximo).toBe(1000000);
    expect(REVENUE_TO_CAPITAL['1m-5m'].maximo).toBe(5000000);
    expect(REVENUE_TO_CAPITAL['5m-50m'].maximo).toBe(50000000);
    expect(REVENUE_TO_CAPITAL['acima50m']).toEqual({ minimo: 50000000 });
    expect(REVENUE_TO_CAPITAL['acima50m'].maximo).toBeUndefined();
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// PARTNER CATEGORIES
// ─────────────────────────────────────────────────────────────────────────────

describe('PARTNER_CATEGORY_TO_CNAE', () => {
  it('contem categorias chave de parceiros', () => {
    expect(PARTNER_CATEGORY_TO_CNAE.contabilidades).toBeTruthy();
    expect(PARTNER_CATEGORY_TO_CNAE.consultorias).toBeTruthy();
    expect(PARTNER_CATEGORY_TO_CNAE.fintechs).toBeTruthy();
    expect(PARTNER_CATEGORY_TO_CNAE.coworkings).toBeTruthy();
    expect(PARTNER_CATEGORY_TO_CNAE.franqueadoras).toBeTruthy();
  });

  it('toda categoria tem ao menos 1 CNAE', () => {
    Object.values(PARTNER_CATEGORY_TO_CNAE).forEach(codes => {
      expect(codes.length).toBeGreaterThan(0);
    });
  });

  it('toda CNAE tem 7 digitos', () => {
    Object.values(PARTNER_CATEGORY_TO_CNAE).flat().forEach(c => {
      expect(c).toMatch(/^\d{7}$/);
    });
  });

  it('todas as categorias tem label legivel', () => {
    Object.keys(PARTNER_CATEGORY_TO_CNAE).forEach(cat => {
      expect(PARTNER_CATEGORY_LABELS[cat]).toBeTruthy();
      expect(typeof PARTNER_CATEGORY_LABELS[cat]).toBe('string');
    });
  });
});

describe('CNAE_TO_PARTNER_CATEGORY', () => {
  it('mapeamento reverso aponta pra categoria correta', () => {
    expect(CNAE_TO_PARTNER_CATEGORY['6920601']).toBe('contabilidades');
    expect(CNAE_TO_PARTNER_CATEGORY['7020400']).toBe('consultorias');
  });

  it('CNAE inexistente retorna undefined', () => {
    expect(CNAE_TO_PARTNER_CATEGORY['0000000']).toBeUndefined();
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// PARTNER_TYPE_OPTIONS
// ─────────────────────────────────────────────────────────────────────────────

describe('PARTNER_TYPE_OPTIONS', () => {
  it('contem individual e institucional', () => {
    const keys = PARTNER_TYPE_OPTIONS.map(p => p.key);
    expect(keys).toContain('individual');
    expect(keys).toContain('institucional');
  });

  it('todo option tem key e label', () => {
    PARTNER_TYPE_OPTIONS.forEach(opt => {
      expect(opt.key).toBeTruthy();
      expect(opt.label).toBeTruthy();
    });
  });
});
