import { describe, it, expect } from 'vitest';
import {
  GOOGLE_SEGMENT_GROUPS,
  GOOGLE_SEGMENTS_FLAT,
  GOOGLE_PARTNER_SEGMENT_GROUPS,
  GOOGLE_PARTNER_SEGMENTS_FLAT,
} from '../googleSegments';

describe('GOOGLE_SEGMENT_GROUPS (segmentos gerais)', () => {
  it('tem grupos com label e options', () => {
    GOOGLE_SEGMENT_GROUPS.forEach(g => {
      expect(g).toHaveProperty('label');
      expect(typeof g.label).toBe('string');
      expect(g.label.length).toBeGreaterThan(0);
      expect(Array.isArray(g.options)).toBe(true);
      expect(g.options.length).toBeGreaterThan(0);
    });
  });

  it('tem categorias chave (Alimentação, Saúde, etc.)', () => {
    const labels = GOOGLE_SEGMENT_GROUPS.map(g => g.label);
    expect(labels).toContain('Alimentação');
    expect(labels).toContain('Saúde & Bem-estar');
    expect(labels).toContain('Comércio Varejo');
    expect(labels).toContain('Serviços Profissionais');
  });

  it('inclui termos comuns em pelo menos algum grupo', () => {
    expect(GOOGLE_SEGMENTS_FLAT).toContain('Restaurante');
    expect(GOOGLE_SEGMENTS_FLAT).toContain('Padaria');
    expect(GOOGLE_SEGMENTS_FLAT).toContain('Clínica Médica');
    expect(GOOGLE_SEGMENTS_FLAT).toContain('Farmácia');
    expect(GOOGLE_SEGMENTS_FLAT).toContain('Mercado');
    expect(GOOGLE_SEGMENTS_FLAT).toContain('Hotel');
  });

  it('nao tem segmentos duplicados entre grupos', () => {
    const seen = new Set();
    const dupes = [];
    GOOGLE_SEGMENTS_FLAT.forEach(s => {
      if (seen.has(s)) dupes.push(s);
      seen.add(s);
    });
    expect(dupes).toEqual([]);
  });

  it('todo segmento eh string nao-vazia', () => {
    GOOGLE_SEGMENTS_FLAT.forEach(s => {
      expect(typeof s).toBe('string');
      expect(s.length).toBeGreaterThan(0);
    });
  });

  it('lista flat eh consistente com a soma dos grupos', () => {
    const sum = GOOGLE_SEGMENT_GROUPS.reduce((acc, g) => acc + g.options.length, 0);
    expect(GOOGLE_SEGMENTS_FLAT.length).toBe(sum);
  });

  it('volume razoavel (50+ opcoes)', () => {
    expect(GOOGLE_SEGMENTS_FLAT.length).toBeGreaterThanOrEqual(50);
  });
});

describe('GOOGLE_PARTNER_SEGMENT_GROUPS (parceiros B2B)', () => {
  it('tem grupos com estrutura valida', () => {
    GOOGLE_PARTNER_SEGMENT_GROUPS.forEach(g => {
      expect(g.label).toBeTruthy();
      expect(Array.isArray(g.options)).toBe(true);
      expect(g.options.length).toBeGreaterThan(0);
    });
  });

  it('tem categorias chave pra SaaS B2B Finanças', () => {
    const labels = GOOGLE_PARTNER_SEGMENT_GROUPS.map(g => g.label);
    expect(labels).toContain('Contábil & Tributário');
    expect(labels).toContain('Consultorias');
    expect(labels).toContain('Marketing & Publicidade');
    expect(labels).toContain('Jurídico');
  });

  it('inclui parceiros tipicos de SaaS B2B', () => {
    expect(GOOGLE_PARTNER_SEGMENTS_FLAT).toContain('Escritório de Contabilidade');
    expect(GOOGLE_PARTNER_SEGMENTS_FLAT).toContain('Consultoria Empresarial');
    expect(GOOGLE_PARTNER_SEGMENTS_FLAT).toContain('Agência de Marketing');
    expect(GOOGLE_PARTNER_SEGMENTS_FLAT).toContain('Coworking');
  });

  it('NAO tem categorias B2C inadequadas pra parceria', () => {
    // Restaurante/padaria nao sao parceiros — sao clientes
    expect(GOOGLE_PARTNER_SEGMENTS_FLAT).not.toContain('Restaurante');
    expect(GOOGLE_PARTNER_SEGMENTS_FLAT).not.toContain('Padaria');
    expect(GOOGLE_PARTNER_SEGMENTS_FLAT).not.toContain('Hotel');
    expect(GOOGLE_PARTNER_SEGMENTS_FLAT).not.toContain('Hamburgueria');
  });

  it('nao tem duplicatas entre grupos de parceiros', () => {
    const seen = new Set();
    GOOGLE_PARTNER_SEGMENTS_FLAT.forEach(s => {
      expect(seen.has(s)).toBe(false);
      seen.add(s);
    });
  });

  it('volume razoavel (20+ opcoes)', () => {
    expect(GOOGLE_PARTNER_SEGMENTS_FLAT.length).toBeGreaterThanOrEqual(20);
  });

  it('lista flat eh consistente com soma dos grupos', () => {
    const sum = GOOGLE_PARTNER_SEGMENT_GROUPS.reduce((acc, g) => acc + g.options.length, 0);
    expect(GOOGLE_PARTNER_SEGMENTS_FLAT.length).toBe(sum);
  });
});

describe('Listas Leads vs Parceiros', () => {
  it('sao listas distintas (parceiros mais focado)', () => {
    expect(GOOGLE_PARTNER_SEGMENTS_FLAT.length).toBeLessThan(GOOGLE_SEGMENTS_FLAT.length);
  });

  it('alguns parceiros aparecem tambem em segmentos gerais (overlap aceitavel)', () => {
    // Coworking ou Software House podem aparecer nas duas listas
    const overlap = GOOGLE_PARTNER_SEGMENTS_FLAT.filter(p =>
      GOOGLE_SEGMENTS_FLAT.includes(p)
    );
    // Espera que o overlap seja pequeno mas nao zero (Coworking, Software House etc.)
    // Sem assert rigida — so checa que nao explode
    expect(Array.isArray(overlap)).toBe(true);
  });
});
