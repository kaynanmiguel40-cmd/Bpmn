import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

beforeEach(() => {
  localStorage.clear();
  vi.useFakeTimers();
  vi.setSystemTime(new Date('2026-04-29T12:00:00Z'));
});

afterEach(() => {
  vi.useRealTimers();
});

import {
  trackGoogleCall, trackCdSearch, trackCdLookup, getUsage,
  setCdBalance, resetCurrentMonthUsage,
  PRICE_GOOGLE_CALL_BRL, PRICE_CD_LOOKUP_BRL,
  GOOGLE_FREE_CALLS_MONTH, CD_DEFAULT_BALANCE,
} from '../usageTracker';

describe('usageTracker', () => {
  describe('estado inicial', () => {
    it('zerado com defaults quando nao tem nada em localStorage', () => {
      const u = getUsage();
      expect(u.month).toBe('2026-04');
      expect(u.google.calls).toBe(0);
      expect(u.google.freeQuota).toBe(GOOGLE_FREE_CALLS_MONTH);
      expect(u.google.freeRemainingCalls).toBe(GOOGLE_FREE_CALLS_MONTH);
      expect(u.google.billedCalls).toBe(0);
      expect(u.google.costBrl).toBe(0);
      expect(u.cd.total).toBe(0);
      expect(u.cd.searches).toBe(0);
      expect(u.cd.lookups).toBe(0);
      expect(u.cd.balanceTotal).toBe(CD_DEFAULT_BALANCE);
      expect(u.cd.balanceRemaining).toBe(CD_DEFAULT_BALANCE);
    });
  });

  describe('trackGoogleCall', () => {
    it('incrementa contador', () => {
      trackGoogleCall();
      trackGoogleCall();
      trackGoogleCall();
      expect(getUsage().google.calls).toBe(3);
    });

    it('aceita N pra incremento em batch', () => {
      trackGoogleCall(10);
      expect(getUsage().google.calls).toBe(10);
    });

    it('dentro do free tier, custo eh 0', () => {
      trackGoogleCall(100);
      const u = getUsage();
      expect(u.google.costBrl).toBe(0);
      expect(u.google.billedCalls).toBe(0);
      expect(u.google.freeRemainingCalls).toBe(GOOGLE_FREE_CALLS_MONTH - 100);
    });

    it('apos exceder free tier, calcula custo das billed', () => {
      trackGoogleCall(GOOGLE_FREE_CALLS_MONTH + 50);
      const u = getUsage();
      expect(u.google.billedCalls).toBe(50);
      expect(u.google.costBrl).toBeCloseTo(50 * PRICE_GOOGLE_CALL_BRL, 4);
      expect(u.google.freeRemainingCalls).toBe(0);
    });

    it('pctUsed calcula corretamente', () => {
      trackGoogleCall(GOOGLE_FREE_CALLS_MONTH / 2);
      expect(getUsage().google.pctUsed).toBeCloseTo(50, 1);
    });
  });

  describe('trackCdSearch e trackCdLookup', () => {
    it('search e lookup sao contadores separados', () => {
      trackCdSearch();
      trackCdSearch();
      trackCdLookup();
      const u = getUsage();
      expect(u.cd.searches).toBe(2);
      expect(u.cd.lookups).toBe(1);
      expect(u.cd.total).toBe(3);
    });

    it('total acumula ambos', () => {
      trackCdSearch(5);
      trackCdLookup(10);
      expect(getUsage().cd.total).toBe(15);
    });

    it('custo CD calculado corretamente', () => {
      trackCdLookup(100);
      const u = getUsage();
      expect(u.cd.costBrl).toBeCloseTo(100 * PRICE_CD_LOOKUP_BRL, 4);
    });

    it('balanceRemaining diminui com uso', () => {
      trackCdLookup(500);
      const u = getUsage();
      expect(u.cd.balanceRemaining).toBe(CD_DEFAULT_BALANCE - 500);
    });

    it('balanceRemaining nao vai abaixo de 0 mesmo se passar do total', () => {
      trackCdLookup(CD_DEFAULT_BALANCE + 100);
      expect(getUsage().cd.balanceRemaining).toBe(0);
    });

    it('pctUsed CD calcula corretamente', () => {
      trackCdLookup(CD_DEFAULT_BALANCE / 4);
      expect(getUsage().cd.pctUsed).toBeCloseTo(25, 1);
    });

    it('pctUsed CD nao passa de 100 mesmo com overflow', () => {
      trackCdLookup(CD_DEFAULT_BALANCE * 2);
      expect(getUsage().cd.pctUsed).toBe(100);
    });
  });

  describe('setCdBalance', () => {
    it('atualiza saldo e zera contadores do mes', () => {
      trackCdLookup(100);
      trackCdSearch(50);
      setCdBalance(10000);
      const u = getUsage();
      expect(u.cd.balanceTotal).toBe(10000);
      expect(u.cd.total).toBe(0);
      expect(u.cd.lookups).toBe(0);
      expect(u.cd.searches).toBe(0);
    });

    it('aceita string e converte', () => {
      setCdBalance('7500');
      expect(getUsage().cd.balanceTotal).toBe(7500);
    });

    it('valor negativo vira 0 (sem saldo)', () => {
      setCdBalance(-100);
      expect(getUsage().cd.balanceTotal).toBe(0);
    });

    it('valor invalido vira 0', () => {
      setCdBalance('abc');
      expect(getUsage().cd.balanceTotal).toBe(0);
    });
  });

  describe('resetCurrentMonthUsage', () => {
    it('zera todos os contadores mas NAO o saldo CD', () => {
      trackGoogleCall(50);
      trackCdLookup(200);
      setCdBalance(7000);
      // Saldo foi atualizado
      expect(getUsage().cd.balanceTotal).toBe(7000);

      resetCurrentMonthUsage();
      const u = getUsage();
      expect(u.google.calls).toBe(0);
      expect(u.cd.total).toBe(0);
      expect(u.cd.lookups).toBe(0);
      expect(u.cd.searches).toBe(0);
      // Saldo permanece
      expect(u.cd.balanceTotal).toBe(7000);
    });
  });

  describe('reset automatico mensal', () => {
    it('contagem do mes anterior nao aparece no mes atual', () => {
      // Estamos em abril/2026 — incrementa
      trackGoogleCall(100);
      expect(getUsage().google.calls).toBe(100);

      // Avanca pra maio/2026
      vi.setSystemTime(new Date('2026-05-15T12:00:00Z'));
      const u = getUsage();
      expect(u.month).toBe('2026-05');
      expect(u.google.calls).toBe(0); // chave nova, contador zerado
    });

    it('chaves do mes anterior continuam em localStorage (nao apagamos)', () => {
      trackGoogleCall(50);
      expect(localStorage.getItem('usage_google_2026-04')).toBe('50');

      vi.setSystemTime(new Date('2026-05-15T12:00:00Z'));
      // Chave antiga continua
      expect(localStorage.getItem('usage_google_2026-04')).toBe('50');
      // Mes atual zerado
      trackGoogleCall(10);
      expect(localStorage.getItem('usage_google_2026-05')).toBe('10');
    });
  });

  describe('evento usage-tracker-update', () => {
    it('dispara evento ao incrementar Google', () => {
      const handler = vi.fn();
      window.addEventListener('usage-tracker-update', handler);
      trackGoogleCall();
      expect(handler).toHaveBeenCalled();
      window.removeEventListener('usage-tracker-update', handler);
    });

    it('dispara evento ao incrementar CD', () => {
      // trackCdLookup e trackCdSearch atualizam 2 contadores cada (especifico + total),
      // disparando 2 eventos por chamada → 4 totais.
      const handler = vi.fn();
      window.addEventListener('usage-tracker-update', handler);
      trackCdLookup();
      trackCdSearch();
      expect(handler).toHaveBeenCalledTimes(4);
      window.removeEventListener('usage-tracker-update', handler);
    });

    it('dispara evento ao setCdBalance', () => {
      const handler = vi.fn();
      window.addEventListener('usage-tracker-update', handler);
      setCdBalance(8000);
      expect(handler).toHaveBeenCalled();
      window.removeEventListener('usage-tracker-update', handler);
    });
  });
});
