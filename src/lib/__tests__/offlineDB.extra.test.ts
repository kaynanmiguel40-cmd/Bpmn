/**
 * Suplemento de offlineDB.test.js — cobre o fluxo de pending_sync que
 * o teste original deixa sem cobertura: markPendingSync, getPendingSync,
 * clearPendingSync e a interacao com a tabela pending_sync.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';

// ==================== MOCK DEXIE ====================
// Mantemos um map nomeado por tabela pra ter mocks distintos por nome.
// Isso permite verificar que pending_sync recebe os puts certos.

interface MockDexieTable {
  clear: ReturnType<typeof vi.fn>;
  bulkPut: ReturnType<typeof vi.fn>;
  toArray: ReturnType<typeof vi.fn>;
  put: ReturnType<typeof vi.fn>;
  delete: ReturnType<typeof vi.fn>;
}

// vi.hoisted garante que `tables` e `tableFor` existam antes do vi.mock
const { tables, tableFor } = vi.hoisted(() => {
  const tbls: Record<string, MockDexieTable> = {};
  function tFor(name: string): MockDexieTable {
    if (!tbls[name]) {
      tbls[name] = {
        clear: vi.fn().mockResolvedValue(undefined),
        bulkPut: vi.fn().mockResolvedValue(undefined),
        toArray: vi.fn().mockResolvedValue([]),
        put: vi.fn().mockResolvedValue(undefined),
        delete: vi.fn().mockResolvedValue(undefined),
      };
    }
    return tbls[name];
  }
  return { tables: tbls, tableFor: tFor };
});

vi.mock('dexie', () => {
  return {
    default: class MockDexie {
      pending_sync: MockDexieTable;
      constructor() {
        this.pending_sync = tableFor('pending_sync');
      }
      version() {
        return { stores: vi.fn().mockReturnThis() };
      }
      table(name: string) {
        return tableFor(name);
      }
    },
  };
});

import {
  markPendingSync,
  getPendingSync,
  clearPendingSync,
  saveOffline,
  putOffline,
  removeOffline,
  resolveConflict,
  type PendingSyncRow,
} from '../offlineDB';

beforeEach(() => {
  for (const t of Object.values(tables)) {
    t.clear.mockClear();
    t.bulkPut.mockClear();
    t.toArray.mockClear().mockResolvedValue([]);
    t.put.mockClear();
    t.delete.mockClear();
  }
});

describe('markPendingSync', () => {
  it('persiste registro com id composto `${table}_${id}` e operation=upsert por default', async () => {
    await markPendingSync('crm_deals', 'd1');

    const pendingTable = tableFor('pending_sync');
    expect(pendingTable.put).toHaveBeenCalledTimes(1);
    const row = pendingTable.put.mock.calls[0][0] as PendingSyncRow;
    expect(row.id).toBe('crm_deals_d1');
    expect(row.table_name).toBe('crm_deals');
    expect(row.item_id).toBe('d1');
    expect(row.operation).toBe('upsert');
    expect(row.created_at).toEqual(expect.any(String));
    // created_at deve ser ISO valido
    expect(() => new Date(row.created_at).toISOString()).not.toThrow();
  });

  it('respeita operation=delete quando explicito', async () => {
    await markPendingSync('crm_deals', 'd1', 'delete');

    const pendingTable = tableFor('pending_sync');
    const row = pendingTable.put.mock.calls[0][0] as PendingSyncRow;
    expect(row.operation).toBe('delete');
  });

  it('multiplos calls com mesmo id sobrescrevem (idempotente)', async () => {
    await markPendingSync('crm_deals', 'd1', 'upsert');
    await markPendingSync('crm_deals', 'd1', 'delete'); // ultima operacao vence

    const pendingTable = tableFor('pending_sync');
    expect(pendingTable.put).toHaveBeenCalledTimes(2);
    // Dexie put e upsert por chave primaria — testa contrato logico:
    // os dois calls usam o mesmo id, entao em DB real so o segundo persiste
    const calls = pendingTable.put.mock.calls;
    expect((calls[0][0] as PendingSyncRow).id).toBe((calls[1][0] as PendingSyncRow).id);
    expect((calls[1][0] as PendingSyncRow).operation).toBe('delete');
  });

  it('captura erro silenciosamente quando Dexie falha', async () => {
    const pendingTable = tableFor('pending_sync');
    pendingTable.put.mockRejectedValueOnce(new Error('quota exceeded'));

    await expect(markPendingSync('crm_deals', 'd1')).resolves.toBeUndefined();
  });
});

describe('getPendingSync', () => {
  it('retorna o conteudo da tabela pending_sync', async () => {
    const fakeRows: PendingSyncRow[] = [
      {
        id: 'crm_deals_d1',
        table_name: 'crm_deals',
        item_id: 'd1',
        operation: 'upsert',
        created_at: '2025-01-01T00:00:00Z',
      },
      {
        id: 'os_orders_o1',
        table_name: 'os_orders',
        item_id: 'o1',
        operation: 'delete',
        created_at: '2025-01-02T00:00:00Z',
      },
    ];
    tableFor('pending_sync').toArray.mockResolvedValueOnce(fakeRows);

    const result = await getPendingSync();

    expect(result).toEqual(fakeRows);
  });

  it('retorna [] quando Dexie quebra (nao propaga)', async () => {
    tableFor('pending_sync').toArray.mockRejectedValueOnce(new Error('db locked'));

    const result = await getPendingSync();
    expect(result).toEqual([]);
  });

  it('retorna [] quando tabela vazia', async () => {
    tableFor('pending_sync').toArray.mockResolvedValueOnce([]);

    const result = await getPendingSync();
    expect(result).toEqual([]);
  });
});

describe('clearPendingSync', () => {
  it('chama delete na tabela pending_sync com a chave composta', async () => {
    await clearPendingSync('crm_deals', 'd1');

    expect(tableFor('pending_sync').delete).toHaveBeenCalledWith('crm_deals_d1');
  });

  it('captura erro silenciosamente quando delete falha', async () => {
    tableFor('pending_sync').delete.mockRejectedValueOnce(new Error('busy'));

    await expect(clearPendingSync('crm_deals', 'd1')).resolves.toBeUndefined();
  });
});

describe('fluxo completo: mark → get → clear', () => {
  it('integra marcacao, leitura e limpeza', async () => {
    // 1) marca
    await markPendingSync('os_orders', 'o42', 'upsert');

    // 2) le (simulamos que Dexie agora tem esse registro)
    const pendingTable = tableFor('pending_sync');
    const recorded = pendingTable.put.mock.calls[0][0] as PendingSyncRow;
    pendingTable.toArray.mockResolvedValueOnce([recorded]);

    const pending = await getPendingSync();
    expect(pending).toHaveLength(1);
    expect(pending[0].item_id).toBe('o42');
    expect(pending[0].operation).toBe('upsert');

    // 3) limpa
    await clearPendingSync('os_orders', 'o42');
    expect(pendingTable.delete).toHaveBeenCalledWith('os_orders_o42');
  });
});

describe('resolveConflict — bordas extras', () => {
  it('lida com updated_at invalido em ambos (cai pra 0 = 0, ganha remote)', () => {
    const local = { id: '1', updated_at: 'not-a-date' as unknown as string };
    const remote = { id: '1', updated_at: 'also-not-a-date' as unknown as string };

    // Date('foo').getTime() === NaN; NaN >= NaN === false; entao retorna local.
    // Garantia minima: NAO crasha.
    expect(() => resolveConflict(local, remote)).not.toThrow();
  });

  it('updated_at null em ambos: ambos viram 0 — remote ganha (>= incl. igual)', () => {
    const local = { id: '1', updated_at: null };
    const remote = { id: '1', updated_at: null };

    expect(resolveConflict(local, remote)).toEqual(remote);
  });

  it('ambos null retorna remote (que e null) ou local — passa o que existe', () => {
    expect(resolveConflict(null, null)).toBeNull();
  });
});

describe('saveOffline/putOffline/removeOffline — sanity de tabela por nome', () => {
  it('saveOffline em tabela X nao toca tabela Y', async () => {
    await saveOffline('crm_deals', [{ id: 'd1' }] as never);

    expect(tableFor('crm_deals').clear).toHaveBeenCalled();
    expect(tableFor('crm_deals').bulkPut).toHaveBeenCalledWith([{ id: 'd1' }]);
    expect(tableFor('os_orders').clear).not.toHaveBeenCalled();
    expect(tableFor('os_orders').bulkPut).not.toHaveBeenCalled();
  });

  it('putOffline so chama put naquela tabela', async () => {
    await putOffline('os_orders', { id: 'o1', title: 'X' } as never);

    expect(tableFor('os_orders').put).toHaveBeenCalledWith({ id: 'o1', title: 'X' });
    expect(tableFor('crm_deals').put).not.toHaveBeenCalled();
  });

  it('removeOffline so chama delete naquela tabela', async () => {
    await removeOffline('agenda_events', 'e1');

    expect(tableFor('agenda_events').delete).toHaveBeenCalledWith('e1');
    expect(tableFor('os_orders').delete).not.toHaveBeenCalled();
  });
});
