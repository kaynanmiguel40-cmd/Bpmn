import { describe, it, expect, vi, beforeEach } from 'vitest';

// ==================== MOCKS ====================

vi.mock('../serviceFactory', () => ({
  createCRUDService: vi.fn(() => ({
    getAll: vi.fn(),
    create: vi.fn(),
    remove: vi.fn(),
    getById: vi.fn(),
  })),
}));

vi.mock('../supabase', () => {
  const results = {};
  return {
    supabase: {
      from: vi.fn(() => ({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        in: vi.fn().mockReturnThis(),
        order: vi.fn().mockReturnThis(),
        upsert: vi.fn().mockResolvedValue({ error: null }),
        then: (resolve) => resolve(results.current || { data: [], error: null }),
      })),
    },
    __setResult: (val) => { results.current = val; },
  };
});

vi.mock('../offlineDB', () => ({
  getOffline: vi.fn().mockResolvedValue([]),
  saveOffline: vi.fn(),
  putOffline: vi.fn(),
  removeOffline: vi.fn(),
  markPendingSync: vi.fn(),
  getPendingSync: vi.fn().mockResolvedValue([]),
  clearPendingSync: vi.fn(),
}));

vi.mock('../../contexts/ToastContext', () => ({
  toast: vi.fn(),
}));

vi.mock('../validation', () => ({
  validateAndSanitize: vi.fn((_, data) => ({ success: true, data, error: null })),
  validatePartial: vi.fn((_, data) => ({ success: true, data, error: null })),
}));

// Mock localStorage
const localStorageMock = (() => {
  let store = {};
  return {
    getItem: vi.fn((key) => store[key] || null),
    setItem: vi.fn((key, value) => { store[key] = value; }),
    removeItem: vi.fn((key) => { delete store[key]; }),
    clear: vi.fn(() => { store = {}; }),
  };
})();
vi.stubGlobal('localStorage', localStorageMock);

import { getReadMap, markChatAsRead, getUnreadCount } from '../commentService';

// ==================== READ TRACKING ====================

describe('getReadMap', () => {
  beforeEach(() => {
    localStorageMock.clear();
  });

  it('retorna objeto vazio quando nao tem dados', () => {
    expect(getReadMap('user_1')).toEqual({});
  });

  it('retorna mapa salvo', () => {
    localStorageMock.setItem('chat_read_user_1', JSON.stringify({ os_1: 5, os_2: 10 }));
    const map = getReadMap('user_1');
    expect(map).toEqual({ os_1: 5, os_2: 10 });
  });

  it('retorna objeto vazio para JSON invalido', () => {
    localStorageMock.setItem('chat_read_user_1', 'invalid json');
    localStorageMock.getItem.mockReturnValueOnce('invalid json');
    // Deve retornar {} sem quebrar
    expect(getReadMap('user_1')).toEqual({});
  });

  it('usa "anon" quando userId e null', () => {
    localStorageMock.setItem('chat_read_anon', JSON.stringify({ os_1: 3 }));
    expect(getReadMap(null)).toEqual({ os_1: 3 });
  });
});

describe('markChatAsRead', () => {
  beforeEach(() => {
    localStorageMock.clear();
  });

  it('salva contagem lida para a OS', () => {
    markChatAsRead('os_1', 'user_1', 5);
    const saved = JSON.parse(localStorageMock.setItem.mock.calls[0][1]);
    expect(saved.os_1).toBe(5);
  });

  it('atualiza contagem existente', () => {
    localStorageMock.setItem('chat_read_user_1', JSON.stringify({ os_1: 3 }));
    markChatAsRead('os_1', 'user_1', 10);
    const saved = JSON.parse(localStorageMock.setItem.mock.calls[localStorageMock.setItem.mock.calls.length - 1][1]);
    expect(saved.os_1).toBe(10);
  });

  it('preserva leituras de outras OS', () => {
    localStorageMock.setItem('chat_read_user_1', JSON.stringify({ os_2: 7 }));
    markChatAsRead('os_1', 'user_1', 5);
    const saved = JSON.parse(localStorageMock.setItem.mock.calls[localStorageMock.setItem.mock.calls.length - 1][1]);
    expect(saved.os_1).toBe(5);
    expect(saved.os_2).toBe(7);
  });
});

describe('getUnreadCount', () => {
  beforeEach(() => {
    localStorageMock.clear();
  });

  it('retorna 0 para OS nunca visitada', () => {
    expect(getUnreadCount('os_1', 'user_1', 10)).toBe(0);
  });

  it('retorna diferenca entre total e ultimo lido', () => {
    localStorageMock.setItem('chat_read_user_1', JSON.stringify({ os_1: 5 }));
    expect(getUnreadCount('os_1', 'user_1', 8)).toBe(3);
  });

  it('retorna 0 quando total igual ao lido', () => {
    localStorageMock.setItem('chat_read_user_1', JSON.stringify({ os_1: 10 }));
    expect(getUnreadCount('os_1', 'user_1', 10)).toBe(0);
  });

  it('retorna 0 quando total menor que lido (edge case)', () => {
    localStorageMock.setItem('chat_read_user_1', JSON.stringify({ os_1: 10 }));
    expect(getUnreadCount('os_1', 'user_1', 8)).toBe(0);
  });
});
