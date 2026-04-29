import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { tempoDesdeAbertura } from '../dateRelative';

const FIXED_NOW = new Date('2026-04-29T12:00:00Z');

beforeEach(() => {
  vi.useFakeTimers();
  vi.setSystemTime(FIXED_NOW);
});

afterEach(() => {
  vi.useRealTimers();
});

describe('tempoDesdeAbertura', () => {
  describe('inputs invalidos', () => {
    it('retorna null para null', () => {
      expect(tempoDesdeAbertura(null)).toBeNull();
    });
    it('retorna null para undefined', () => {
      expect(tempoDesdeAbertura(undefined)).toBeNull();
    });
    it('retorna null para string vazia', () => {
      expect(tempoDesdeAbertura('')).toBeNull();
    });
    it('retorna null para string invalida', () => {
      expect(tempoDesdeAbertura('not-a-date')).toBeNull();
    });
  });

  describe('multiplos anos (>= 2)', () => {
    it('"15 anos" para empresa de 15 anos exatos', () => {
      expect(tempoDesdeAbertura('2011-04-29')).toBe('15 anos');
    });
    it('"3 anos" mesmo com alguns meses extras (>=2 trunca)', () => {
      expect(tempoDesdeAbertura('2023-08-15')).toBe('2 anos');
    });
    it('"5 anos" para empresa de 5+', () => {
      expect(tempoDesdeAbertura('2021-04-29')).toBe('5 anos');
    });
  });

  describe('1 ano com meses (precisao alta)', () => {
    it('"1 ano" exato', () => {
      expect(tempoDesdeAbertura('2025-04-29')).toBe('1 ano');
    });
    it('"1 ano e 5 meses"', () => {
      expect(tempoDesdeAbertura('2024-11-29')).toBe('1 ano e 5 meses');
    });
    it('"1 ano e 1 mês" (singular)', () => {
      expect(tempoDesdeAbertura('2025-03-29')).toBe('1 ano e 1 mês');
    });
    it('"1 ano e 11 meses" — quase 2 anos', () => {
      expect(tempoDesdeAbertura('2024-05-29')).toBe('1 ano e 11 meses');
    });
  });

  describe('meses (< 1 ano)', () => {
    it('"6 meses"', () => {
      expect(tempoDesdeAbertura('2025-10-29')).toBe('6 meses');
    });
    it('"1 mês" (singular)', () => {
      expect(tempoDesdeAbertura('2026-03-29')).toBe('1 mês');
    });
    it('"11 meses"', () => {
      expect(tempoDesdeAbertura('2025-05-29')).toBe('11 meses');
    });
  });

  describe('dias (< 1 mês)', () => {
    it('"14 dias"', () => {
      expect(tempoDesdeAbertura('2026-04-15')).toBe('14 dias');
    });
    it('"1 dia" (singular)', () => {
      expect(tempoDesdeAbertura('2026-04-28')).toBe('1 dia');
    });
    it('"recente" para hoje', () => {
      expect(tempoDesdeAbertura('2026-04-29')).toBe('recente');
    });
  });

  describe('ajuste de dia (dia atual < dia abertura)', () => {
    it('quando ainda nao chegou ao dia do mes, conta 1 mes a menos', () => {
      // Aberta dia 30 do mes anterior, hoje dia 29 → 0 meses (ainda nao virou)
      // Hoje 2026-04-29, abertura 2026-03-30 → "30 dias"
      expect(tempoDesdeAbertura('2026-03-30')).toBe('30 dias');
    });

    it('exatamente 12 meses se ajusta pra "1 ano"', () => {
      // 2025-04-29 → 2026-04-29 = 1 ano exato
      expect(tempoDesdeAbertura('2025-04-29')).toBe('1 ano');
    });

    it('1 dia antes de virar 1 ano vira "11 meses"', () => {
      // Aberta 2025-04-30, hoje 2026-04-29 → ainda nao completou 1 ano
      expect(tempoDesdeAbertura('2025-04-30')).toBe('11 meses');
    });
  });

  describe('aceita formatos de data variados', () => {
    it('Date object', () => {
      expect(tempoDesdeAbertura(new Date('2020-04-29'))).toBe('6 anos');
    });
    it('ISO completo com timestamp', () => {
      expect(tempoDesdeAbertura('2020-04-29T10:00:00Z')).toBe('6 anos');
    });
    it('YYYY-MM-DD simples', () => {
      expect(tempoDesdeAbertura('2020-04-29')).toBe('6 anos');
    });
  });
});
