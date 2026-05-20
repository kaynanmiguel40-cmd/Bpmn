import { describe, it, expect } from 'vitest';
import { escapeIlike, escapeOrIlike } from '../searchFilters';

describe('escapeIlike', () => {
  it('devolve string vazia para null/undefined', () => {
    expect(escapeIlike(null)).toBe('');
    expect(escapeIlike(undefined)).toBe('');
  });

  it('coage valores nao-string para string', () => {
    expect(escapeIlike(42)).toBe('42');
  });

  it('passa texto normal sem mexer', () => {
    expect(escapeIlike('joao silva')).toBe('joao silva');
    expect(escapeIlike('cliente@email.com')).toBe('cliente@email.com');
  });

  it('escapa wildcards % e _', () => {
    expect(escapeIlike('100%')).toBe('100\\%');
    expect(escapeIlike('nome_completo')).toBe('nome\\_completo');
    expect(escapeIlike('a_b%c')).toBe('a\\_b\\%c');
  });

  it('escapa backslash antes de wildcards', () => {
    expect(escapeIlike('a\\b')).toBe('a\\\\b');
    expect(escapeIlike('a\\%b')).toBe('a\\\\\\%b');
  });
});

describe('escapeOrIlike', () => {
  it('escapa wildcards ILIKE', () => {
    expect(escapeOrIlike('100%')).toBe('100\\%');
    expect(escapeOrIlike('nome_x')).toBe('nome\\_x');
  });

  it('escapa virgula (separador de filtros .or)', () => {
    expect(escapeOrIlike('silva, joao')).toBe('silva\\, joao');
  });

  it('escapa parenteses', () => {
    expect(escapeOrIlike('joao (silva)')).toBe('joao \\(silva\\)');
  });

  it('escapa asterisco e aspas', () => {
    expect(escapeOrIlike('joao "silva" *')).toBe('joao \\"silva\\" \\*');
  });

  it('combina wildcards e separadores em payload mal-intencionado', () => {
    // termo que tentaria injetar um segundo filtro casando tudo
    expect(escapeOrIlike('%,email.ilike.%')).toBe('\\%\\,email.ilike.\\%');
  });
});
