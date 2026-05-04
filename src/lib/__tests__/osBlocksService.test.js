import { describe, it, expect, vi, beforeEach } from 'vitest';

// ==================== MOCKS ====================

const { supabaseResults, mockedFactoryService } = vi.hoisted(() => ({
  supabaseResults: { current: { data: [], error: null } },
  mockedFactoryService: {
    getAll: vi.fn().mockResolvedValue([]),
    create: vi.fn(async (item) => ({
      id: 'block_new',
      orderId: item.orderId,
      title: item.title,
      description: item.description || '',
      assigneeId: item.assigneeId || null,
      assigneeName: item.assigneeName || '',
      estimatedMinutes: item.estimatedMinutes || 0,
      status: item.status || 'todo',
      sortOrder: item.sortOrder ?? 0,
      createdAt: '2026-04-27T00:00:00Z',
      updatedAt: '2026-04-27T00:00:00Z',
    })),
    update: vi.fn(async (id, updates) => ({ id, ...updates })),
    remove: vi.fn().mockResolvedValue(true),
  },
}));

function setNextSupabaseResult(result) {
  supabaseResults.current = result;
}

vi.mock('../serviceFactory', () => ({
  createCRUDService: vi.fn(() => mockedFactoryService),
}));

vi.mock('../supabase', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnThis(),
      then: (resolve) => resolve(supabaseResults.current),
    })),
  },
}));

vi.mock('../offlineDB', () => ({
  getOffline: vi.fn().mockResolvedValue([]),
}));

import {
  dbToBlock,
  getBlocksByOrder,
  getBlocksByAssignee,
  areAllBlocksDone,
  ensureBlocksForOrder,
  setBlockStatus,
} from '../osBlocksService';
import { getOffline } from '../offlineDB';

beforeEach(() => {
  vi.clearAllMocks();
  setNextSupabaseResult({ data: [], error: null });
  getOffline.mockResolvedValue([]);
});

// ==================== dbToBlock ====================

describe('dbToBlock', () => {
  it('retorna null para entrada nula', () => {
    expect(dbToBlock(null)).toBeNull();
    expect(dbToBlock(undefined)).toBeNull();
  });

  it('mapeia snake_case para camelCase', () => {
    const row = {
      id: 'b1',
      order_id: 'os_1',
      title: 'Marketing',
      description: 'Posts da semana',
      assignee_id: 'u_elias',
      assignee_name: 'Elias',
      estimated_minutes: 90,
      status: 'doing',
      sort_order: 2,
      created_at: '2026-04-27T08:00:00Z',
      updated_at: '2026-04-27T09:00:00Z',
    };
    expect(dbToBlock(row)).toEqual({
      id: 'b1',
      orderId: 'os_1',
      title: 'Marketing',
      description: 'Posts da semana',
      assigneeId: 'u_elias',
      assigneeName: 'Elias',
      estimatedMinutes: 90,
      status: 'doing',
      sortOrder: 2,
      createdAt: '2026-04-27T08:00:00Z',
      updatedAt: '2026-04-27T09:00:00Z',
    });
  });

  it('aplica defaults seguros para campos faltantes', () => {
    const row = { id: 'b1', order_id: 'os_1', title: 'X' };
    const out = dbToBlock(row);
    expect(out.description).toBe('');
    expect(out.assigneeId).toBeNull();
    expect(out.assigneeName).toBe('');
    expect(out.estimatedMinutes).toBe(0);
    expect(out.status).toBe('todo');
    expect(out.sortOrder).toBe(0);
  });

  it('preserva sort_order = 0 (nao confunde com falsy)', () => {
    const out = dbToBlock({ id: 'b1', order_id: 'os_1', title: 'X', sort_order: 0 });
    expect(out.sortOrder).toBe(0);
  });
});

// ==================== getBlocksByOrder ====================

describe('getBlocksByOrder', () => {
  it('retorna blocos ordenados por sort_order ASC', async () => {
    setNextSupabaseResult({
      data: [
        { id: 'b1', order_id: 'os_1', title: 'A', sort_order: 0 },
        { id: 'b2', order_id: 'os_1', title: 'B', sort_order: 1 },
      ],
      error: null,
    });
    const blocks = await getBlocksByOrder('os_1');
    expect(blocks).toHaveLength(2);
    expect(blocks[0].id).toBe('b1');
    expect(blocks[1].id).toBe('b2');
  });

  it('retorna [] quando nao ha blocos', async () => {
    setNextSupabaseResult({ data: [], error: null });
    expect(await getBlocksByOrder('os_1')).toEqual([]);
  });

  it('faz fallback para offline e ordena localmente quando supabase falha', async () => {
    setNextSupabaseResult({ data: null, error: { message: 'offline' } });
    getOffline.mockResolvedValue([
      { id: 'b2', order_id: 'os_1', title: 'B', sort_order: 1 },
      { id: 'b1', order_id: 'os_1', title: 'A', sort_order: 0 },
      { id: 'bX', order_id: 'os_OUTRO', title: 'X', sort_order: 0 },
    ]);
    const blocks = await getBlocksByOrder('os_1');
    expect(blocks.map(b => b.id)).toEqual(['b1', 'b2']);
  });
});

// ==================== getBlocksByAssignee ====================

describe('getBlocksByAssignee', () => {
  it('retorna blocos do usuario', async () => {
    setNextSupabaseResult({
      data: [{ id: 'b1', order_id: 'os_1', title: 'Marketing', assignee_id: 'u_elias' }],
      error: null,
    });
    const blocks = await getBlocksByAssignee('u_elias');
    expect(blocks).toHaveLength(1);
    expect(blocks[0].assigneeId).toBe('u_elias');
  });

  it('retorna [] em erro', async () => {
    setNextSupabaseResult({ data: null, error: { message: 'fail' } });
    expect(await getBlocksByAssignee('u_x')).toEqual([]);
  });
});

// ==================== areAllBlocksDone ====================

describe('areAllBlocksDone', () => {
  it('retorna false se nao ha blocos (evita "tudo feito" pra O.S. vazia)', async () => {
    setNextSupabaseResult({ data: [], error: null });
    expect(await areAllBlocksDone('os_1')).toBe(false);
  });

  it('retorna true quando todos done', async () => {
    setNextSupabaseResult({
      data: [
        { id: 'b1', order_id: 'os_1', title: 'A', status: 'done' },
        { id: 'b2', order_id: 'os_1', title: 'B', status: 'done' },
      ],
      error: null,
    });
    expect(await areAllBlocksDone('os_1')).toBe(true);
  });

  it('retorna false se algum bloco esta doing', async () => {
    setNextSupabaseResult({
      data: [
        { id: 'b1', order_id: 'os_1', title: 'A', status: 'done' },
        { id: 'b2', order_id: 'os_1', title: 'B', status: 'doing' },
      ],
      error: null,
    });
    expect(await areAllBlocksDone('os_1')).toBe(false);
  });

  it('retorna false se algum bloco esta todo', async () => {
    setNextSupabaseResult({
      data: [
        { id: 'b1', order_id: 'os_1', title: 'A', status: 'done' },
        { id: 'b2', order_id: 'os_1', title: 'B', status: 'todo' },
      ],
      error: null,
    });
    expect(await areAllBlocksDone('os_1')).toBe(false);
  });
});

// ==================== ensureBlocksForOrder ====================

describe('ensureBlocksForOrder', () => {
  it('e idempotente: nao cria nada se ja ha blocos', async () => {
    setNextSupabaseResult({
      data: [{ id: 'b1', order_id: 'os_1', title: 'Existente', status: 'todo' }],
      error: null,
    });
    const out = await ensureBlocksForOrder({ id: 'os_1', title: 'X', status: 'available' });
    expect(mockedFactoryService.create).not.toHaveBeenCalled();
    expect(out).toHaveLength(1);
    expect(out[0].id).toBe('b1');
  });

  it('cria 1 bloco copiando titulo e assignee da O.S. legada', async () => {
    setNextSupabaseResult({ data: [], error: null });
    await ensureBlocksForOrder({
      id: 'os_1',
      title: 'O.S. legada',
      assignee: 'Robert',
      assignedTo: 'u_robert',
      status: 'available',
    });
    expect(mockedFactoryService.create).toHaveBeenCalledTimes(1);
    const created = mockedFactoryService.create.mock.calls[0][0];
    expect(created.orderId).toBe('os_1');
    expect(created.title).toBe('O.S. legada');
    expect(created.assigneeId).toBe('u_robert');
    expect(created.assigneeName).toBe('Robert');
  });

  it('mapeia status legado: in_progress -> doing', async () => {
    setNextSupabaseResult({ data: [], error: null });
    await ensureBlocksForOrder({ id: 'os_1', title: 'X', status: 'in_progress' });
    expect(mockedFactoryService.create.mock.calls[0][0].status).toBe('doing');
  });

  it('mapeia status legado: done -> done', async () => {
    setNextSupabaseResult({ data: [], error: null });
    await ensureBlocksForOrder({ id: 'os_1', title: 'X', status: 'done' });
    expect(mockedFactoryService.create.mock.calls[0][0].status).toBe('done');
  });

  it('mapeia status legado: available/blocked/review -> todo', async () => {
    for (const legacy of ['available', 'blocked', 'review', 'qualquer']) {
      vi.clearAllMocks();
      setNextSupabaseResult({ data: [], error: null });
      await ensureBlocksForOrder({ id: 'os_1', title: 'X', status: legacy });
      expect(mockedFactoryService.create.mock.calls[0][0].status).toBe('todo');
    }
  });

  it('calcula estimatedMinutes a partir do diff de datas', async () => {
    setNextSupabaseResult({ data: [], error: null });
    await ensureBlocksForOrder({
      id: 'os_1',
      title: 'X',
      status: 'available',
      estimatedStart: '2026-04-27T08:00',
      estimatedEnd: '2026-04-27T10:30',
    });
    expect(mockedFactoryService.create.mock.calls[0][0].estimatedMinutes).toBe(150);
  });

  it('retorna 0 minutos se O.S. nao tem datas', async () => {
    setNextSupabaseResult({ data: [], error: null });
    await ensureBlocksForOrder({ id: 'os_1', title: 'X', status: 'available' });
    expect(mockedFactoryService.create.mock.calls[0][0].estimatedMinutes).toBe(0);
  });

  it('retorna 0 minutos se diff for negativo (datas invertidas nao geram numero negativo)', async () => {
    setNextSupabaseResult({ data: [], error: null });
    await ensureBlocksForOrder({
      id: 'os_1',
      title: 'X',
      status: 'available',
      estimatedStart: '2026-04-27T10:00',
      estimatedEnd: '2026-04-27T08:00',
    });
    expect(mockedFactoryService.create.mock.calls[0][0].estimatedMinutes).toBe(0);
  });

  it('retorna 0 minutos se datas invalidas', async () => {
    setNextSupabaseResult({ data: [], error: null });
    await ensureBlocksForOrder({
      id: 'os_1',
      title: 'X',
      status: 'available',
      estimatedStart: 'lixo',
      estimatedEnd: 'bagunca',
    });
    expect(mockedFactoryService.create.mock.calls[0][0].estimatedMinutes).toBe(0);
  });

  it('retorna [] quando order e nulo', async () => {
    expect(await ensureBlocksForOrder(null)).toEqual([]);
    expect(await ensureBlocksForOrder({})).toEqual([]);
  });

  it('usa "Bloco principal" como fallback quando O.S. nao tem titulo', async () => {
    setNextSupabaseResult({ data: [], error: null });
    await ensureBlocksForOrder({ id: 'os_1', status: 'available' });
    expect(mockedFactoryService.create.mock.calls[0][0].title).toBe('Bloco principal');
  });
});

// ==================== setBlockStatus ====================

describe('setBlockStatus', () => {
  it('chama updateBlock com {status: novo}', async () => {
    await setBlockStatus('b1', 'doing');
    expect(mockedFactoryService.update).toHaveBeenCalledWith('b1', { status: 'doing' });
  });

  it('aceita as 3 transicoes validas', async () => {
    for (const s of ['todo', 'doing', 'done']) {
      await setBlockStatus('b1', s);
    }
    expect(mockedFactoryService.update).toHaveBeenCalledTimes(3);
  });
});
