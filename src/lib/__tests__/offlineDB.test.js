import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock Dexie
const mockTable = {
  clear: vi.fn().mockResolvedValue(undefined),
  bulkPut: vi.fn().mockResolvedValue(undefined),
  toArray: vi.fn().mockResolvedValue([]),
  put: vi.fn().mockResolvedValue(undefined),
  delete: vi.fn().mockResolvedValue(undefined),
};

vi.mock('dexie', () => {
  return {
    default: class MockDexie {
      constructor() {}
      version() { return { stores: vi.fn().mockReturnThis() }; }
      table() { return mockTable; }
    },
  };
});

import {
  saveOffline,
  getOffline,
  putOffline,
  removeOffline,
  markPendingSync,
  getPendingSync,
  clearPendingSync,
  resolveConflict,
} from '../offlineDB';

describe('offlineDB', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockTable.toArray.mockResolvedValue([]);
  });

  // ==================== saveOffline ====================

  describe('saveOffline', () => {
    it('limpa tabela e salva items', async () => {
      await saveOffline('os_orders', [{ id: '1' }, { id: '2' }]);

      expect(mockTable.clear).toHaveBeenCalled();
      expect(mockTable.bulkPut).toHaveBeenCalledWith([{ id: '1' }, { id: '2' }]);
    });

    it('nao chama bulkPut se array vazio', async () => {
      await saveOffline('os_orders', []);

      expect(mockTable.clear).toHaveBeenCalled();
      expect(mockTable.bulkPut).not.toHaveBeenCalled();
    });

    it('nao quebra quando Dexie falha', async () => {
      mockTable.clear.mockRejectedValueOnce(new Error('IndexedDB error'));

      await expect(saveOffline('os_orders', [{ id: '1' }])).resolves.toBeUndefined();
    });
  });

  // ==================== getOffline ====================

  describe('getOffline', () => {
    it('retorna dados da tabela', async () => {
      mockTable.toArray.mockResolvedValueOnce([{ id: '1', title: 'Test' }]);

      const result = await getOffline('os_orders');

      expect(result).toEqual([{ id: '1', title: 'Test' }]);
    });

    it('retorna array vazio quando Dexie falha', async () => {
      mockTable.toArray.mockRejectedValueOnce(new Error('Error'));

      const result = await getOffline('os_orders');

      expect(result).toEqual([]);
    });
  });

  // ==================== putOffline ====================

  describe('putOffline', () => {
    it('salva item individual', async () => {
      const item = { id: '1', title: 'Test' };
      await putOffline('os_orders', item);

      expect(mockTable.put).toHaveBeenCalledWith(item);
    });

    it('nao quebra quando Dexie falha', async () => {
      mockTable.put.mockRejectedValueOnce(new Error('Error'));

      await expect(putOffline('os_orders', { id: '1' })).resolves.toBeUndefined();
    });
  });

  // ==================== removeOffline ====================

  describe('removeOffline', () => {
    it('remove item por ID', async () => {
      await removeOffline('os_orders', '1');

      expect(mockTable.delete).toHaveBeenCalledWith('1');
    });
  });

  // ==================== resolveConflict ====================

  describe('resolveConflict', () => {
    it('retorna remote quando mais recente', () => {
      const local = { id: '1', updated_at: '2025-01-01T00:00:00Z' };
      const remote = { id: '1', updated_at: '2025-01-02T00:00:00Z' };

      expect(resolveConflict(local, remote)).toEqual(remote);
    });

    it('retorna local quando mais recente', () => {
      const local = { id: '1', updated_at: '2025-01-03T00:00:00Z' };
      const remote = { id: '1', updated_at: '2025-01-02T00:00:00Z' };

      expect(resolveConflict(local, remote)).toEqual(local);
    });

    it('retorna remote quando timestamps iguais', () => {
      const local = { id: '1', updated_at: '2025-01-01T00:00:00Z' };
      const remote = { id: '1', updated_at: '2025-01-01T00:00:00Z' };

      expect(resolveConflict(local, remote)).toEqual(remote);
    });

    it('retorna remote quando local e null', () => {
      const remote = { id: '1', updated_at: '2025-01-01T00:00:00Z' };

      expect(resolveConflict(null, remote)).toEqual(remote);
    });

    it('retorna local quando remote e null', () => {
      const local = { id: '1', updated_at: '2025-01-01T00:00:00Z' };

      expect(resolveConflict(local, null)).toEqual(local);
    });

    it('lida com updated_at ausente', () => {
      const local = { id: '1' };
      const remote = { id: '1', updated_at: '2025-01-01T00:00:00Z' };

      expect(resolveConflict(local, remote)).toEqual(remote);
    });
  });
});
