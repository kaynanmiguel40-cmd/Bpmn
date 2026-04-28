import { describe, it, expect } from 'vitest';
import { DDD_BY_STATE, getDddsByState, getPhoneDdd } from '../brazilDdds';

describe('brazilDdds', () => {
  describe('DDD_BY_STATE', () => {
    it('contem todos os 27 estados brasileiros', () => {
      expect(Object.keys(DDD_BY_STATE)).toHaveLength(27);
    });

    it('SP tem todos os DDDs de 11 a 19', () => {
      expect(DDD_BY_STATE.SP).toEqual(['11', '12', '13', '14', '15', '16', '17', '18', '19']);
    });

    it('DF tem apenas 61', () => {
      expect(DDD_BY_STATE.DF).toEqual(['61']);
    });

    it('RJ tem 21, 22 e 24', () => {
      expect(DDD_BY_STATE.RJ).toEqual(['21', '22', '24']);
    });

    it('todo estado tem ao menos 1 DDD', () => {
      Object.values(DDD_BY_STATE).forEach(ddds => {
        expect(ddds.length).toBeGreaterThan(0);
      });
    });

    it('todo DDD eh string de 2 digitos', () => {
      Object.values(DDD_BY_STATE).flat().forEach(d => {
        expect(d).toMatch(/^\d{2}$/);
      });
    });

    it('nao ha DDDs duplicados entre estados', () => {
      const all = Object.values(DDD_BY_STATE).flat();
      const unique = new Set(all);
      expect(unique.size).toBe(all.length);
    });
  });

  describe('getDddsByState', () => {
    it('retorna DDDs para estado conhecido', () => {
      expect(getDddsByState('SP')).toContain('11');
      expect(getDddsByState('SP')).toContain('19');
    });

    it('retorna [] para estado desconhecido', () => {
      expect(getDddsByState('XX')).toEqual([]);
      expect(getDddsByState('ZZ')).toEqual([]);
    });

    it('retorna [] para null/undefined/string vazia', () => {
      expect(getDddsByState(null)).toEqual([]);
      expect(getDddsByState(undefined)).toEqual([]);
      expect(getDddsByState('')).toEqual([]);
    });
  });

  describe('getPhoneDdd', () => {
    it('extrai DDD de telefone formatado com parenteses', () => {
      expect(getPhoneDdd('(11) 98765-4321')).toBe('11');
      expect(getPhoneDdd('(31) 3344-5566')).toBe('31');
    });

    it('extrai DDD de string com so digitos (11 digitos)', () => {
      expect(getPhoneDdd('11987654321')).toBe('11');
      expect(getPhoneDdd('21999998888')).toBe('21');
    });

    it('extrai DDD de fixo (10 digitos)', () => {
      expect(getPhoneDdd('1133445566')).toBe('11');
      expect(getPhoneDdd('(11) 3344-5566')).toBe('11');
    });

    it('descarta codigo de pais 55', () => {
      expect(getPhoneDdd('5511987654321')).toBe('11');
      expect(getPhoneDdd('+55 (11) 98765-4321')).toBe('11');
    });

    it('retorna null para entrada invalida ou curta demais', () => {
      expect(getPhoneDdd(null)).toBeNull();
      expect(getPhoneDdd(undefined)).toBeNull();
      expect(getPhoneDdd('')).toBeNull();
      expect(getPhoneDdd('123')).toBeNull();
      expect(getPhoneDdd('98765')).toBeNull();
    });
  });
});
