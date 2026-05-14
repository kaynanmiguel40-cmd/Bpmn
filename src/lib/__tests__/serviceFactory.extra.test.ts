/**
 * Bateria suplementar de testes do serviceFactory.
 * Cobre o que serviceFactory.test.js nao cobre:
 *   - getPaginated (cenarios online/offline/filtros)
 *   - bulkUpdate (online e fallback offline)
 *   - syncPending: items multiplos, mistura de delete+upsert, ordem
 *   - extraRow no create (created_by, id explicito)
 *   - richFields propagacao na validacao
 *   - sanity: identidade quando transform e null
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';

// ==================== MOCKS HOISTED ====================

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
  resultQueue: [] as Array<{ data?: unknown; error?: unknown; count?: number | null }>,
  mockSaveOffline: vi.fn().mockResolvedValue(undefined),
  mockGetOffline: vi.fn().mockResolvedValue([]),
  mockPutOffline: vi.fn().mockResolvedValue(undefined),
  mockRemoveOffline: vi.fn().mockResolvedValue(undefined),
  mockMarkPendingSync: vi.fn().mockResolvedValue(undefined),
  mockGetPendingSync: vi.fn().mockResolvedValue([]),
  mockClearPendingSync: vi.fn().mockResolvedValue(undefined),
  mockToast: vi.fn(),
  mockValidateAndSanitize: vi.fn(
    (_schema: unknown, data: unknown) => ({ success: true, data, error: null })
  ),
  mockValidatePartial: vi.fn(
    (_schema: unknown, data: unknown) => ({ success: true, data, error: null })
  ),
}));

function queueResult(result: { data?: unknown; error?: unknown; count?: number | null }): void {
  resultQueue.push(result);
}

interface ChainCapture {
  table: string | null;
  selectArgs: unknown[] | null;
  rangeArgs: unknown[] | null;
  orderArgs: unknown[] | null;
  insertArgs: unknown[] | null;
  updateArgs: unknown[] | null;
  upsertArgs: unknown[] | null;
  eqCalls: Array<[string, unknown]>;
}

const captureBuffer: ChainCapture[] = [];

// Supabase chainable mock: cada metodo encadeavel registra no captureBuffer.
// A unica diferenca pro mock original e que preservamos `count` no resultado
// (necessario pra testar getPaginated).
vi.mock('../supabaseClient', () => {
  function createChain(): unknown {
    const capture: ChainCapture = {
      table: null,
      selectArgs: null,
      rangeArgs: null,
      orderArgs: null,
      insertArgs: null,
      updateArgs: null,
      upsertArgs: null,
      eqCalls: [],
    };
    captureBuffer.push(capture);

    const handler = {
      get(_target: unknown, prop: string | symbol) {
        if (prop === 'then') {
          const result = resultQueue.shift() || { data: null, error: null };
          return (resolve: (v: unknown) => void) => Promise.resolve(result).then(resolve);
        }
        return (...args: unknown[]) => {
          if (prop === 'select') capture.selectArgs = args;
          if (prop === 'range') capture.rangeArgs = args;
          if (prop === 'order') capture.orderArgs = args;
          if (prop === 'insert') capture.insertArgs = args;
          if (prop === 'update') capture.updateArgs = args;
          if (prop === 'upsert') capture.upsertArgs = args;
          if (prop === 'eq') capture.eqCalls.push([args[0] as string, args[1]]);
          return proxy;
        };
      },
    };
    const proxy: unknown = new Proxy({}, handler);
    return proxy;
  }
  return {
    supabase: {
      from: vi.fn((table: string) => {
        const chain = createChain() as { __captureRef?: ChainCapture };
        // Anexa o nome da tabela no ultimo capture criado
        const last = captureBuffer[captureBuffer.length - 1];
        if (last) last.table = table;
        return chain;
      }),
    },
  };
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

vi.mock('../../contexts/ToastContext', () => ({ toast: mockToast }));

vi.mock('../validation', () => ({
  validateAndSanitize: mockValidateAndSanitize,
  validatePartial: mockValidatePartial,
}));

import { createCRUDService } from '../serviceFactory';

// ==================== HELPERS ====================

interface TestItem {
  id: string;
  title?: string;
  status?: string;
  created_at?: string;
  updated_at?: string;
  [key: string]: unknown;
}

function makeService() {
  return createCRUDService<TestItem>({
    table: 'test_table',
    localKey: 'test_items',
    idPrefix: 'test',
    fieldMap: { title: 'title', status: 'status' },
    orderBy: 'created_at',
    orderAsc: true,
  });
}

// ==================== TESTES ====================

beforeEach(() => {
  vi.clearAllMocks();
  resultQueue.length = 0;
  captureBuffer.length = 0;
  mockGetOffline.mockResolvedValue([]);
  mockGetPendingSync.mockResolvedValue([]);
});

describe('createCRUDService — getPaginated', () => {
  it('retorna dados paginados com count correto', async () => {
    queueResult({
      data: [
        { id: '1', title: 'A' },
        { id: '2', title: 'B' },
      ],
      count: 42,
      error: null,
    });

    const service = makeService();
    const result = await service.getPaginated(2, 10);

    expect(result.data).toHaveLength(2);
    expect(result.count).toBe(42);
    expect(result.page).toBe(2);
    expect(result.pageSize).toBe(10);
    expect(result.totalPages).toBe(5); // ceil(42/10)
  });

  it('calcula range correto (page=3, pageSize=20 -> 40..59)', async () => {
    queueResult({ data: [], count: 0, error: null });

    const service = makeService();
    await service.getPaginated(3, 20);

    const supabaseCapture = captureBuffer.find(c => c.rangeArgs);
    expect(supabaseCapture).toBeDefined();
    expect(supabaseCapture?.rangeArgs).toEqual([40, 59]);
  });

  it('aplica filtros via eq dinamicamente, ignorando vazios/null/undefined', async () => {
    queueResult({ data: [], count: 0, error: null });

    const service = makeService();
    await service.getPaginated(1, 10, {
      status: 'open',
      pipeline_id: 'p1',
      empty_str: '',
      explicit_null: null,
      explicit_undefined: undefined,
    });

    const supabaseCapture = captureBuffer.find(c => c.eqCalls.length > 0);
    expect(supabaseCapture).toBeDefined();
    const eqFields = supabaseCapture?.eqCalls.map(([f]) => f) ?? [];
    expect(eqFields).toContain('status');
    expect(eqFields).toContain('pipeline_id');
    expect(eqFields).not.toContain('empty_str');
    expect(eqFields).not.toContain('explicit_null');
    expect(eqFields).not.toContain('explicit_undefined');
  });

  it('fallback offline retorna slice + count local + totalPages calculado', async () => {
    queueResult({ data: null, error: { message: 'Network error' } });
    const localItems: TestItem[] = Array.from({ length: 25 }, (_, i) => ({
      id: String(i + 1),
      title: `Item ${i + 1}`,
    }));
    mockGetOffline.mockResolvedValueOnce(localItems);

    const service = makeService();
    const result = await service.getPaginated(2, 10);

    expect(result.data).toHaveLength(10); // slice(10, 20)
    expect(result.data[0].id).toBe('11');
    expect(result.count).toBe(25);
    expect(result.totalPages).toBe(3); // ceil(25/10)
    expect(mockToast).toHaveBeenCalled();
  });

  it('totalPages = 0 quando count = 0 (sem dados)', async () => {
    queueResult({ data: [], count: 0, error: null });

    const service = makeService();
    const result = await service.getPaginated(1, 10);

    expect(result.totalPages).toBe(0);
  });

  it('aplica transform nos resultados online', async () => {
    queueResult({
      data: [{ id: '1', title: 'raw' }],
      count: 1,
      error: null,
    });

    const transformedService = createCRUDService<{ id: string; upper: string }>({
      table: 'test_t',
      fieldMap: { title: 'title' },
      transform: row => ({ id: row.id, upper: ((row.title as string) || '').toUpperCase() }),
    });

    const result = await transformedService.getPaginated(1, 10);

    expect(result.data[0]).toEqual({ id: '1', upper: 'RAW' });
  });

  it('aplica transform tambem no fallback offline', async () => {
    queueResult({ data: null, error: { message: 'Offline' } });
    mockGetOffline.mockResolvedValueOnce([{ id: '1', title: 'cached' }] as TestItem[]);

    const transformedService = createCRUDService<{ id: string; tag: string }>({
      table: 'test_t',
      fieldMap: { title: 'title' },
      transform: row => ({ id: row.id, tag: `offline:${row.title}` }),
    });

    const result = await transformedService.getPaginated(1, 10);

    expect(result.data[0]).toEqual({ id: '1', tag: 'offline:cached' });
  });
});

describe('createCRUDService — bulkUpdate', () => {
  it('aplica update em massa via Supabase', async () => {
    queueResult({ data: null, error: null });

    const service = makeService();
    await service.bulkUpdate('status', 'archived', 'project_id', 'p1');

    const upd = captureBuffer.find(c => c.updateArgs);
    expect(upd).toBeDefined();
    const payload = upd?.updateArgs?.[0] as Record<string, unknown>;
    expect(payload.status).toBe('archived');
    expect(payload.updated_at).toEqual(expect.any(String));

    const eqField = upd?.eqCalls.find(([f]) => f === 'project_id');
    expect(eqField?.[1]).toBe('p1');
  });

  it('fallback offline: atualiza items que casam com o filtro', async () => {
    queueResult({ data: null, error: { message: 'Server unavailable' } });
    mockGetOffline.mockResolvedValueOnce([
      { id: '1', project_id: 'p1', status: 'open' },
      { id: '2', project_id: 'p1', status: 'open' },
      { id: '3', project_id: 'p2', status: 'open' },
    ] as TestItem[]);

    const service = makeService();
    await service.bulkUpdate('status', 'archived', 'project_id', 'p1');

    expect(mockSaveOffline).toHaveBeenCalled();
    const savedItems = (mockSaveOffline.mock.calls[0]?.[1] as TestItem[]) || [];
    expect(savedItems.find(r => r.id === '1')?.status).toBe('archived');
    expect(savedItems.find(r => r.id === '2')?.status).toBe('archived');
    expect(savedItems.find(r => r.id === '3')?.status).toBe('open'); // intocado
  });

  it('nao escreve offline quando supabase tem sucesso', async () => {
    queueResult({ data: null, error: null });

    const service = makeService();
    await service.bulkUpdate('status', 'done', 'assignee', 'user1');

    expect(mockSaveOffline).not.toHaveBeenCalled();
    expect(mockGetOffline).not.toHaveBeenCalled();
  });
});

describe('createCRUDService — syncPending', () => {
  it('sincroniza items mistos (delete + upsert) em ordem', async () => {
    mockGetPendingSync.mockResolvedValueOnce([
      { table_name: 'test_table', item_id: '1', operation: 'upsert' },
      { table_name: 'test_table', item_id: '2', operation: 'delete' },
      { table_name: 'test_table', item_id: '3', operation: 'upsert' },
    ]);
    mockGetOffline.mockResolvedValue([
      { id: '1', title: 'A' },
      { id: '3', title: 'C' },
    ] as TestItem[]);
    // 3 operacoes: upsert ok, delete ok, upsert ok
    queueResult({ error: null });
    queueResult({ error: null });
    queueResult({ error: null });

    const service = makeService();
    const synced = await service.syncPending();

    expect(synced).toBe(3);
    expect(mockClearPendingSync).toHaveBeenCalledTimes(3);
    expect(mockClearPendingSync).toHaveBeenCalledWith('test_table', '1');
    expect(mockClearPendingSync).toHaveBeenCalledWith('test_table', '2');
    expect(mockClearPendingSync).toHaveBeenCalledWith('test_table', '3');
  });

  it('contabiliza parcial: 1 falha, 2 sucesso', async () => {
    mockGetPendingSync.mockResolvedValueOnce([
      { table_name: 'test_table', item_id: '1', operation: 'upsert' },
      { table_name: 'test_table', item_id: '2', operation: 'upsert' },
      { table_name: 'test_table', item_id: '3', operation: 'upsert' },
    ]);
    mockGetOffline.mockResolvedValue([
      { id: '1', title: 'A' },
      { id: '2', title: 'B' },
      { id: '3', title: 'C' },
    ] as TestItem[]);
    queueResult({ error: null });
    queueResult({ error: { message: 'conflict' } });
    queueResult({ error: null });

    const service = makeService();
    const synced = await service.syncPending();

    expect(synced).toBe(2);
    expect(mockClearPendingSync).toHaveBeenCalledTimes(2);
    expect(mockClearPendingSync).not.toHaveBeenCalledWith('test_table', '2');
  });

  it('upsert pendente sem item local correspondente nao incrementa', async () => {
    mockGetPendingSync.mockResolvedValueOnce([
      { table_name: 'test_table', item_id: 'orphan', operation: 'upsert' },
    ]);
    mockGetOffline.mockResolvedValueOnce([]); // sem item local

    const service = makeService();
    const synced = await service.syncPending();

    expect(synced).toBe(0);
    expect(mockClearPendingSync).not.toHaveBeenCalled();
  });

  it('lista vazia de pending nao chama Supabase', async () => {
    mockGetPendingSync.mockResolvedValueOnce([]);

    const service = makeService();
    const synced = await service.syncPending();

    expect(synced).toBe(0);
    expect(captureBuffer).toHaveLength(0);
  });

  it('filtra items: so processa pending da propria tabela', async () => {
    mockGetPendingSync.mockResolvedValueOnce([
      { table_name: 'test_table', item_id: 'a', operation: 'delete' },
      { table_name: 'other_table', item_id: 'b', operation: 'delete' },
      { table_name: 'test_table', item_id: 'c', operation: 'delete' },
    ]);
    queueResult({ error: null });
    queueResult({ error: null });

    const service = makeService();
    const synced = await service.syncPending();

    expect(synced).toBe(2);
    expect(mockClearPendingSync).toHaveBeenCalledWith('test_table', 'a');
    expect(mockClearPendingSync).toHaveBeenCalledWith('test_table', 'c');
    expect(mockClearPendingSync).not.toHaveBeenCalledWith('test_table', 'b');
    expect(mockClearPendingSync).not.toHaveBeenCalledWith('other_table', 'b');
  });
});

describe('createCRUDService — create extras', () => {
  it('extraRow.id sobrepoe o uuid gerado', async () => {
    queueResult({
      data: { id: 'explicit-id', title: 'X', created_at: '2025-01-01' },
      error: null,
    });

    const service = makeService();
    const result = await service.create({ title: 'X' }, { id: 'explicit-id' });

    expect(result?.id).toBe('explicit-id');
    const insert = captureBuffer.find(c => c.insertArgs);
    const rows = insert?.insertArgs?.[0] as Array<{ id: string }>;
    expect(rows[0].id).toBe('explicit-id');
  });

  it('extraRow.created_by acompanha o insert', async () => {
    queueResult({
      data: { id: 'auto', title: 'X', created_by: 'user-1', created_at: '2025-01-01' },
      error: null,
    });

    const service = makeService();
    await service.create({ title: 'X' }, { created_by: 'user-1' });

    const insert = captureBuffer.find(c => c.insertArgs);
    const rows = insert?.insertArgs?.[0] as Array<{ created_by: string }>;
    expect(rows[0].created_by).toBe('user-1');
  });

  it('propaga richFields pro validador (TipTap)', async () => {
    const service = createCRUDService({
      table: 'rich_test',
      fieldMap: { content: 'content' },
      schema: 'fake_schema' as unknown as never,
      richFields: ['content'],
    });
    queueResult({ data: { id: 'x', content: '<p>OK</p>' }, error: null });

    await service.create({ content: '<p>OK</p>' });

    expect(mockValidateAndSanitize).toHaveBeenCalledWith(
      'fake_schema',
      { content: '<p>OK</p>' },
      { richFields: ['content'] },
    );
  });

  it('propaga richFields pro validator parcial em update', async () => {
    // serviceFactory testa se schema.partial existe antes de chamar validatePartial.
    // Como schema e mockado, simulamos `.partial` pra ativar o branch.
    const fakeSchema = { partial: vi.fn() } as unknown as never;
    const service = createCRUDService({
      table: 'rich_test_u',
      fieldMap: { content: 'content' },
      schema: fakeSchema,
      richFields: ['content'],
    });
    queueResult({ data: { id: '1', content: '<p>upd</p>' }, error: null });

    await service.update('1', { content: '<p>upd</p>' });

    expect(mockValidatePartial).toHaveBeenCalledWith(
      fakeSchema,
      { content: '<p>upd</p>' },
      { richFields: ['content'] },
    );
  });
});

describe('createCRUDService — defaults e contratos', () => {
  it('sem transform: identidade — retorna a row crua tipada como TDomain', async () => {
    queueResult({
      data: [{ id: '1', title: 'A' }, { id: '2', title: 'B' }],
      error: null,
    });

    const service = makeService();
    const all = await service.getAll();

    expect(all).toEqual([
      { id: '1', title: 'A' },
      { id: '2', title: 'B' },
    ]);
  });

  it('orderBy default = created_at, orderAsc default = true', async () => {
    queueResult({ data: [], error: null });

    const svc = createCRUDService<TestItem>({
      table: 'x',
      fieldMap: { title: 'title' },
    });
    await svc.getAll();

    const order = captureBuffer.find(c => c.orderArgs);
    expect(order?.orderArgs?.[0]).toBe('created_at');
    expect(order?.orderArgs?.[1]).toEqual({ ascending: true });
  });

  it('respeita orderAsc=false', async () => {
    queueResult({ data: [], error: null });

    const svc = createCRUDService<TestItem>({
      table: 'x',
      fieldMap: { title: 'title' },
      orderBy: 'updated_at',
      orderAsc: false,
    });
    await svc.getAll();

    const order = captureBuffer.find(c => c.orderArgs);
    expect(order?.orderArgs?.[0]).toBe('updated_at');
    expect(order?.orderArgs?.[1]).toEqual({ ascending: false });
  });
});
