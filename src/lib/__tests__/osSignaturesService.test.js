import { describe, it, expect, vi, beforeEach } from 'vitest';

// ==================== MOCKS ====================

const supabaseResults = { current: { data: null, error: null } };
const lastInsertPayload = { current: null };
const lastDeleteFilters = { current: [] };
const lastSelectFilters = { current: [] };

function setNextResult(result) { supabaseResults.current = result; }

vi.mock('../supabase', () => ({
  supabase: {
    from: vi.fn(() => {
      const filters = [];
      const chain = {
        select: vi.fn().mockReturnThis(),
        order: vi.fn().mockReturnThis(),
        eq: vi.fn(function (col, val) { filters.push([col, val]); return this; }),
        single: vi.fn(function () { return this; }),
        maybeSingle: vi.fn(function () { return this; }),
        insert: vi.fn(function (rows) { lastInsertPayload.current = rows; return this; }),
        delete: vi.fn(function () { lastDeleteFilters.current = filters; return this; }),
        then: (resolve) => {
          if (filters.length && lastSelectFilters.current === lastDeleteFilters.current) {
            // sem-op; mantemos referencia
          }
          lastSelectFilters.current = [...filters];
          return resolve(supabaseResults.current);
        },
      };
      return chain;
    }),
  },
}));

import {
  signOrder,
  unsignOrder,
  hasUserSigned,
  getSignaturesByOrder,
} from '../osSignaturesService';

beforeEach(() => {
  vi.clearAllMocks();
  setNextResult({ data: null, error: null });
  lastInsertPayload.current = null;
  lastDeleteFilters.current = [];
  lastSelectFilters.current = [];
  // crypto.randomUUID em jsdom pode nao existir
  if (!global.crypto) global.crypto = {};
  global.crypto.randomUUID = vi.fn(() => 'uuid_fixed');
});

// ==================== signOrder ====================

describe('signOrder', () => {
  it('insere assinatura com order_id, user_id e user_name', async () => {
    setNextResult({
      data: { id: 'uuid_fixed', order_id: 'os_1', user_id: 'u_kaynan', user_name: 'Kaynan', signed_at: '2026-04-27T10:00:00Z' },
      error: null,
    });
    const sig = await signOrder({ orderId: 'os_1', userId: 'u_kaynan', userName: 'Kaynan' });
    expect(lastInsertPayload.current).toEqual([{
      id: 'uuid_fixed',
      order_id: 'os_1',
      user_id: 'u_kaynan',
      user_name: 'Kaynan',
    }]);
    expect(sig).toEqual({
      id: 'uuid_fixed',
      orderId: 'os_1',
      userId: 'u_kaynan',
      userName: 'Kaynan',
      signedAt: '2026-04-27T10:00:00Z',
      deliveredAt: null,
    });
  });

  it('retorna null e nao quebra se usuario ja assinou (codigo 23505)', async () => {
    const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    setNextResult({ data: null, error: { code: '23505', message: 'duplicate' } });
    const sig = await signOrder({ orderId: 'os_1', userId: 'u_kaynan', userName: 'Kaynan' });
    expect(sig).toBeNull();
    expect(consoleSpy).toHaveBeenCalled();
    consoleSpy.mockRestore();
  });

  it('aceita userId nulo (anonimo) — converte para null no banco', async () => {
    setNextResult({
      data: { id: 'uuid_fixed', order_id: 'os_1', user_id: null, user_name: 'Convidado', signed_at: '2026-04-27T10:00:00Z' },
      error: null,
    });
    await signOrder({ orderId: 'os_1', userId: undefined, userName: 'Convidado' });
    expect(lastInsertPayload.current[0].user_id).toBeNull();
  });

  it('retorna null em outros erros e loga', async () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    setNextResult({ data: null, error: { code: '500', message: 'falhou' } });
    expect(await signOrder({ orderId: 'os_1', userId: 'u', userName: 'X' })).toBeNull();
    expect(consoleSpy).toHaveBeenCalled();
    consoleSpy.mockRestore();
  });
});

// ==================== unsignOrder ====================

describe('unsignOrder', () => {
  it('retorna true em sucesso', async () => {
    setNextResult({ data: null, error: null });
    expect(await unsignOrder({ orderId: 'os_1', userId: 'u_kaynan' })).toBe(true);
  });

  it('retorna false em erro e loga', async () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    setNextResult({ data: null, error: { message: 'fail' } });
    expect(await unsignOrder({ orderId: 'os_1', userId: 'u_kaynan' })).toBe(false);
    expect(consoleSpy).toHaveBeenCalled();
    consoleSpy.mockRestore();
  });
});

// ==================== hasUserSigned ====================

describe('hasUserSigned', () => {
  it('retorna false imediatamente se userId e nulo (sem ir ao banco)', async () => {
    expect(await hasUserSigned({ orderId: 'os_1', userId: null })).toBe(false);
    expect(await hasUserSigned({ orderId: 'os_1', userId: undefined })).toBe(false);
  });

  it('retorna true quando assinatura existe', async () => {
    setNextResult({ data: { id: 'sig_1' }, error: null });
    expect(await hasUserSigned({ orderId: 'os_1', userId: 'u_k' })).toBe(true);
  });

  it('retorna false quando nao existe', async () => {
    setNextResult({ data: null, error: null });
    expect(await hasUserSigned({ orderId: 'os_1', userId: 'u_k' })).toBe(false);
  });

  it('retorna false em erro', async () => {
    setNextResult({ data: null, error: { message: 'x' } });
    expect(await hasUserSigned({ orderId: 'os_1', userId: 'u_k' })).toBe(false);
  });
});

// ==================== getSignaturesByOrder ====================

describe('getSignaturesByOrder', () => {
  it('retorna lista mapeada para camelCase', async () => {
    setNextResult({
      data: [
        { id: 's1', order_id: 'os_1', user_id: 'u1', user_name: 'A', signed_at: '2026-04-27T08:00:00Z' },
        { id: 's2', order_id: 'os_1', user_id: 'u2', user_name: 'B', signed_at: '2026-04-27T09:00:00Z' },
      ],
      error: null,
    });
    const sigs = await getSignaturesByOrder('os_1');
    expect(sigs).toHaveLength(2);
    expect(sigs[0]).toEqual({
      id: 's1', orderId: 'os_1', userId: 'u1', userName: 'A', signedAt: '2026-04-27T08:00:00Z', deliveredAt: null,
    });
  });

  it('retorna [] em erro', async () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    setNextResult({ data: null, error: { message: 'down' } });
    expect(await getSignaturesByOrder('os_1')).toEqual([]);
    consoleSpy.mockRestore();
  });

  it('retorna [] quando data e null sem erro', async () => {
    setNextResult({ data: null, error: null });
    expect(await getSignaturesByOrder('os_1')).toEqual([]);
  });
});
