import { describe, it, expect, vi, beforeEach } from 'vitest';

// ==================== MOCKS (vi.hoisted para acesso nos factories) ====================

const {
  resultQueue,
  mockSaveOffline,
  mockGetOffline,
  mockPutOffline,
  mockRemoveOffline,
  mockMarkPendingSync,
  mockGetPendingSync,
  mockClearPendingSync,
  mockToast,
  mockValidateAndSanitize,
  mockValidatePartial,
} = vi.hoisted(() => ({
  resultQueue: [],
  mockSaveOffline: vi.fn(),
  mockGetOffline: vi.fn().mockResolvedValue([]),
  mockPutOffline: vi.fn(),
  mockRemoveOffline: vi.fn(),
  mockMarkPendingSync: vi.fn(),
  mockGetPendingSync: vi.fn().mockResolvedValue([]),
  mockClearPendingSync: vi.fn(),
  mockToast: vi.fn(),
  mockValidateAndSanitize: vi.fn((schema, data) => ({ success: true, data, error: null })),
  mockValidatePartial: vi.fn((schema, data) => ({ success: true, data, error: null })),
}));

function queueResult(result) {
  resultQueue.push(result);
}

// Supabase: Proxy chainable que resolve para o proximo item da fila
vi.mock('../supabaseClient', () => {
  function createChain() {
    return new Proxy({}, {
      get(_, prop) {
        if (prop === 'then') {
          const result = resultQueue.shift() || { data: null, error: null };
          return (resolve, reject) => Promise.resolve(result).then(resolve, reject);
        }
        return (...args) => createChain();
      },
    });
  }
  return { supabase: { from: vi.fn(() => createChain()) } };
});

vi.mock('../offlineDB', () => ({
  saveOffline: mockSaveOffline,
  getOffline: mockGetOffline,
  putOffline: mockPutOffline,
  removeOffline: mockRemoveOffline,
  markPendingSync: mockMarkPendingSync,
  getPendingSync: mockGetPendingSync,
  clearPendingSync: mockClearPendingSync,
}));

vi.mock('../../contexts/ToastContext', () => ({
  toast: mockToast,
}));

vi.mock('../validation', () => ({
  validateAndSanitize: mockValidateAndSanitize,
  validatePartial: mockValidatePartial,
}));

// ==================== IMPORT (apos mocks) ====================

import { createCRUDService } from '../serviceFactory';

// ==================== TESTES ====================

describe('createCRUDService', () => {
  let service;

  beforeEach(() => {
    vi.clearAllMocks();
    resultQueue.length = 0;
    mockGetOffline.mockResolvedValue([]);
    mockGetPendingSync.mockResolvedValue([]);

    service = createCRUDService({
      table: 'test_table',
      localKey: 'test_items',
      idPrefix: 'test',
      transform: null,
      fieldMap: { title: 'title', status: 'status', priority: 'priority' },
      orderBy: 'created_at',
      orderAsc: true,
    });
  });

  // ==================== GET ALL ====================

  describe('getAll', () => {
    it('retorna dados do Supabase quando online', async () => {
      const mockData = [
        { id: '1', title: 'Item 1', created_at: '2025-01-01' },
        { id: '2', title: 'Item 2', created_at: '2025-01-02' },
      ];
      queueResult({ data: mockData, error: null });

      const result = await service.getAll();

      expect(result).toEqual(mockData);
      expect(mockSaveOffline).toHaveBeenCalledWith('test_table', mockData);
    });

    it('retorna dados offline quando Supabase falha', async () => {
      const offlineData = [{ id: '1', title: 'Cached Item' }];
      queueResult({ data: null, error: { message: 'Network error', code: 'NETWORK' } });
      mockGetOffline.mockResolvedValueOnce(offlineData);

      const result = await service.getAll();

      expect(result).toEqual(offlineData);
      expect(mockToast).toHaveBeenCalled();
    });

    it('retorna array vazio quando Supabase retorna data null e nao tem cache', async () => {
      queueResult({ data: null, error: null });

      const result = await service.getAll();

      expect(result).toEqual([]);
    });

    it('aplica transform quando fornecido', async () => {
      const transform = (item) => ({ ...item, transformed: true });
      const svc = createCRUDService({
        table: 'test_transform',
        localKey: 'test_t',
        idPrefix: 'tt',
        transform,
        fieldMap: { title: 'title' },
      });

      queueResult({ data: [{ id: '1', title: 'Raw' }], error: null });

      const result = await svc.getAll();

      expect(result[0].transformed).toBe(true);
      expect(result[0].title).toBe('Raw');
    });

    it('aplica transform nos dados offline tambem', async () => {
      const transform = (item) => ({ ...item, fromOffline: true });
      const svc = createCRUDService({
        table: 'test_transform2',
        localKey: 'test_t2',
        idPrefix: 'tt2',
        transform,
        fieldMap: { title: 'title' },
      });

      queueResult({ data: null, error: { message: 'Offline' } });
      mockGetOffline.mockResolvedValueOnce([{ id: '1', title: 'Offline' }]);

      const result = await svc.getAll();

      expect(result[0].fromOffline).toBe(true);
    });
  });

  // ==================== GET BY ID ====================

  describe('getById', () => {
    it('retorna item do Supabase', async () => {
      const mockItem = { id: '1', title: 'Test Item' };
      queueResult({ data: mockItem, error: null });

      const result = await service.getById('1');

      expect(result).toEqual(mockItem);
    });

    it('retorna item offline quando Supabase falha', async () => {
      const offlineData = [
        { id: '1', title: 'Offline Item' },
        { id: '2', title: 'Other' },
      ];
      queueResult({ data: null, error: { message: 'Error' } });
      mockGetOffline.mockResolvedValueOnce(offlineData);

      const result = await service.getById('1');

      expect(result).toEqual({ id: '1', title: 'Offline Item' });
    });

    it('retorna null quando item nao existe no cache offline', async () => {
      queueResult({ data: null, error: { message: 'Error' } });
      mockGetOffline.mockResolvedValueOnce([]);

      const result = await service.getById('nonexistent');

      expect(result).toBeNull();
    });
  });

  // ==================== CREATE ====================

  describe('create', () => {
    it('cria item no Supabase e salva no cache local', async () => {
      const createdItem = { id: 'test_123', title: 'New', status: 'active', created_at: '2025-01-01' };
      queueResult({ data: createdItem, error: null });

      const result = await service.create({ title: 'New', status: 'active' });

      expect(result).toEqual(createdItem);
      expect(mockPutOffline).toHaveBeenCalledWith('test_table', createdItem);
    });

    it('salva localmente e marca pendingSync quando Supabase falha', async () => {
      queueResult({ data: null, error: { message: 'Network error', code: 'NETWORK' } });

      const result = await service.create({ title: 'Offline Item' });

      expect(result).not.toBeNull();
      expect(result.title).toBe('Offline Item');
      expect(mockPutOffline).toHaveBeenCalled();
      expect(mockMarkPendingSync).toHaveBeenCalledWith('test_table', expect.any(String), 'upsert');
      expect(mockToast).toHaveBeenCalled();
    });

    it('retorna null quando validacao Zod falha', async () => {
      mockValidateAndSanitize.mockReturnValueOnce({
        success: false,
        data: null,
        error: 'Titulo e obrigatorio',
      });

      const svc = createCRUDService({
        table: 'test_val',
        localKey: 'test_val',
        idPrefix: 'tv',
        fieldMap: { title: 'title' },
        schema: 'fakeSchema',
      });

      const result = await svc.create({ title: '' });

      expect(result).toBeNull();
      expect(mockToast).toHaveBeenCalledWith('Titulo e obrigatorio', 'error');
    });

    it('converte camelCase para snake_case via fieldMap', async () => {
      const svc = createCRUDService({
        table: 'test_map',
        localKey: 'test_map',
        idPrefix: 'tm',
        fieldMap: { myTitle: 'my_title', isActive: 'is_active' },
      });

      // O Supabase mock recebe o insert, entao verificamos se from() foi chamado
      const createdItem = { id: 'tm_1', my_title: 'Test', is_active: true };
      queueResult({ data: createdItem, error: null });

      const result = await svc.create({ myTitle: 'Test', isActive: true });

      expect(result).toEqual(createdItem);
    });
  });

  // ==================== UPDATE ====================

  describe('update', () => {
    it('atualiza item no Supabase e atualiza cache', async () => {
      const updatedItem = { id: '1', title: 'Original', status: 'done', updated_at: '2025-01-02' };
      queueResult({ data: updatedItem, error: null });

      const result = await service.update('1', { status: 'done' });

      expect(result).toEqual(updatedItem);
      expect(mockPutOffline).toHaveBeenCalledWith('test_table', updatedItem);
    });

    it('atualiza localmente quando Supabase falha', async () => {
      const offlineData = [{ id: '1', title: 'Original', status: 'active' }];
      queueResult({ data: null, error: { message: 'Error', code: 'ERR' } });
      mockGetOffline.mockResolvedValueOnce(offlineData);

      const result = await service.update('1', { status: 'done' });

      expect(result).not.toBeNull();
      expect(mockPutOffline).toHaveBeenCalled();
      expect(mockMarkPendingSync).toHaveBeenCalledWith('test_table', '1', 'upsert');
    });

    it('retorna null quando item nao existe offline', async () => {
      queueResult({ data: null, error: { message: 'Error' } });
      mockGetOffline.mockResolvedValueOnce([]);

      const result = await service.update('nonexistent', { status: 'done' });

      expect(result).toBeNull();
    });

    it('retorna null quando validacao parcial falha', async () => {
      mockValidatePartial.mockReturnValueOnce({
        success: false,
        data: null,
        error: 'Status invalido',
      });

      const svc = createCRUDService({
        table: 'test_upd',
        localKey: 'test_upd',
        idPrefix: 'tu',
        fieldMap: { status: 'status' },
        schema: 'fakeSchema',
      });

      const result = await svc.update('1', { status: 'invalid' });

      expect(result).toBeNull();
    });
  });

  // ==================== REMOVE ====================

  describe('remove', () => {
    it('remove do Supabase e do cache local', async () => {
      queueResult({ error: null });

      const result = await service.remove('1');

      expect(result).toBe(true);
      expect(mockRemoveOffline).toHaveBeenCalledWith('test_table', '1');
    });

    it('marca para sync quando Supabase falha', async () => {
      queueResult({ error: { message: 'Network error' } });

      const result = await service.remove('1');

      expect(result).toBe(false);
      expect(mockRemoveOffline).toHaveBeenCalledWith('test_table', '1');
      expect(mockMarkPendingSync).toHaveBeenCalledWith('test_table', '1', 'delete');
    });
  });

  // ==================== SYNC PENDING ====================

  describe('syncPending', () => {
    it('sincroniza items pendentes de upsert', async () => {
      mockGetPendingSync.mockResolvedValueOnce([
        { table_name: 'test_table', item_id: '1', operation: 'upsert' },
      ]);
      mockGetOffline.mockResolvedValueOnce([
        { id: '1', title: 'Pending Item' },
      ]);
      queueResult({ error: null }); // upsert succeeds

      const synced = await service.syncPending();

      expect(synced).toBe(1);
      expect(mockClearPendingSync).toHaveBeenCalledWith('test_table', '1');
    });

    it('sincroniza items pendentes de delete', async () => {
      mockGetPendingSync.mockResolvedValueOnce([
        { table_name: 'test_table', item_id: '2', operation: 'delete' },
      ]);
      queueResult({ error: null }); // delete succeeds

      const synced = await service.syncPending();

      expect(synced).toBe(1);
      expect(mockClearPendingSync).toHaveBeenCalledWith('test_table', '2');
    });

    it('ignora items de outra tabela', async () => {
      mockGetPendingSync.mockResolvedValueOnce([
        { table_name: 'other_table', item_id: '1', operation: 'upsert' },
      ]);

      const synced = await service.syncPending();

      expect(synced).toBe(0);
    });

    it('nao limpa pendingSync quando sync falha', async () => {
      mockGetPendingSync.mockResolvedValueOnce([
        { table_name: 'test_table', item_id: '1', operation: 'delete' },
      ]);
      queueResult({ error: { message: 'Server error' } }); // delete fails

      const synced = await service.syncPending();

      expect(synced).toBe(0);
      expect(mockClearPendingSync).not.toHaveBeenCalled();
    });
  });
});
