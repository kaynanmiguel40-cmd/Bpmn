/**
 * Suplemento de crmDealsService.test.js — cobre as funcoes que o teste
 * original deixa de fora: getCrmDeals, getDealsByPipeline, getCrmDealById,
 * createCrmDeal, updateCrmDeal, softDeleteCrmDeal, moveDealToStage,
 * markDealAsWon, getDealActivities, getDealStageHistory.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';

// ==================== MOCKS ====================

vi.mock('../../../../lib/supabase', () => ({
  supabase: {
    from: vi.fn(),
    auth: { getSession: vi.fn().mockResolvedValue({ data: { session: null } }) },
  },
}));
vi.mock('../../../../contexts/ToastContext', () => ({ toast: vi.fn() }));

// vi.hoisted: mocks precisam existir antes dos vi.mock (hoisted ao topo do arquivo)
const {
  mockCreate,
  mockUpdate,
  mockGetAll,
  mockRemove,
  mockTriggerAutomations,
  mockCreateActivity,
  mockCreateAgenda,
} = vi.hoisted(() => ({
  mockCreate: vi.fn(),
  mockUpdate: vi.fn(),
  mockGetAll: vi.fn(),
  mockRemove: vi.fn(),
  mockTriggerAutomations: vi.fn(),
  mockCreateActivity: vi.fn(),
  mockCreateAgenda: vi.fn(),
}));

vi.mock('../../../../lib/serviceFactory', () => ({
  createCRUDService: vi.fn(() => ({
    create: mockCreate,
    update: mockUpdate,
    getAll: mockGetAll,
    remove: mockRemove,
    getById: vi.fn(),
    getPaginated: vi.fn(),
    bulkUpdate: vi.fn(),
    syncPending: vi.fn(),
  })),
}));

vi.mock('../crmAutomationsService', () => ({ triggerAutomationsForDeal: mockTriggerAutomations }));
vi.mock('../crmActivitiesService', () => ({ createCrmActivity: mockCreateActivity }));
vi.mock('../../schemas/crmValidation', () => ({ crmDealSchema: {} }));
vi.mock('../../../../lib/agendaService', () => ({ createAgendaEvent: mockCreateAgenda }));

import {
  getCrmDeals,
  getCrmDealById,
  createCrmDeal,
  updateCrmDeal,
  softDeleteCrmDeal,
  moveDealToStage,
  markDealAsWon,
  getDealActivities,
  getDealStageHistory,
} from '../crmDealsService';
import { supabase } from '../../../../lib/supabase';

// ==================== HELPERS ====================

interface ChainCapture {
  table: string | null;
  selectArgs: unknown[] | null;
  updateArgs: unknown[] | null;
  insertArgs: unknown[] | null;
  eqCalls: Array<[string, unknown]>;
  isCalls: Array<[string, unknown]>;
  ilikeCalls: Array<[string, string]>;
  rangeArgs: [number, number] | null;
  orderArgs: unknown[] | null;
  notCalls: unknown[];
}

interface MakeChainResult {
  chain: Record<string, unknown>;
  captured: ChainCapture;
}

function makeChain(finalResult: { data?: unknown; error?: unknown; count?: number | null }): MakeChainResult {
  const captured: ChainCapture = {
    table: null,
    selectArgs: null,
    updateArgs: null,
    insertArgs: null,
    eqCalls: [],
    isCalls: [],
    ilikeCalls: [],
    rangeArgs: null,
    orderArgs: null,
    notCalls: [],
  };

  // Pra suportar `await query` (sem .single()) precisa de `.then`.
  const chain: Record<string, unknown> = {
    select: vi.fn((...args: unknown[]) => { captured.selectArgs = args; return chain; }),
    update: vi.fn((...args: unknown[]) => { captured.updateArgs = args; return chain; }),
    insert: vi.fn((...args: unknown[]) => { captured.insertArgs = args; return chain; }),
    delete: vi.fn(() => chain),
    eq: vi.fn((f: string, v: unknown) => { captured.eqCalls.push([f, v]); return chain; }),
    is: vi.fn((f: string, v: unknown) => { captured.isCalls.push([f, v]); return chain; }),
    ilike: vi.fn((f: string, v: string) => { captured.ilikeCalls.push([f, v]); return chain; }),
    in: vi.fn(() => chain),
    not: vi.fn((...args: unknown[]) => { captured.notCalls.push(args); return chain; }),
    order: vi.fn((...args: unknown[]) => { captured.orderArgs = args; return chain; }),
    range: vi.fn((from: number, to: number) => { captured.rangeArgs = [from, to]; return chain; }),
    single: vi.fn().mockResolvedValue(finalResult),
    maybeSingle: vi.fn().mockResolvedValue(finalResult),
    then: (resolve: (v: unknown) => void) => resolve(finalResult),
  };

  return { chain, captured };
}

const mockedSupabase = supabase as unknown as {
  from: ReturnType<typeof vi.fn>;
  auth: { getSession: ReturnType<typeof vi.fn> };
};

beforeEach(() => {
  mockedSupabase.from.mockReset();
  mockedSupabase.auth.getSession.mockReset();
  mockedSupabase.auth.getSession.mockResolvedValue({ data: { session: null } });
  mockCreate.mockReset();
  mockUpdate.mockReset();
  mockGetAll.mockReset();
  mockRemove.mockReset();
  // Mocks que sao chamados com .catch() ou await precisam retornar Promise por default
  mockTriggerAutomations.mockReset().mockResolvedValue(undefined);
  mockCreateActivity.mockReset().mockResolvedValue(undefined);
  mockCreateAgenda.mockReset().mockResolvedValue(undefined);
  localStorage.clear();
});

// ============================================================================
// getCrmDeals
// ============================================================================

describe('getCrmDeals', () => {
  it('retorna data + count, aplicando dbToCrmDeal', async () => {
    const { chain } = makeChain({
      data: [
        { id: 'd1', title: 'Deal 1', value: 100, status: 'open', created_at: 'x', updated_at: 'y' },
        { id: 'd2', title: 'Deal 2', value: 200, status: 'open', created_at: 'x', updated_at: 'y' },
      ],
      count: 2,
      error: null,
    });
    mockedSupabase.from.mockReturnValue(chain);

    const result = await getCrmDeals();

    expect(result.count).toBe(2);
    expect(result.data).toHaveLength(2);
    expect(result.data[0].id).toBe('d1');
    expect(result.data[0].value).toBe(100);
  });

  it('aplica search via ilike no titulo', async () => {
    const { chain, captured } = makeChain({ data: [], count: 0, error: null });
    mockedSupabase.from.mockReturnValue(chain);

    await getCrmDeals({ search: 'acme' });

    expect(captured.ilikeCalls).toContainEqual(['title', '%acme%']);
  });

  it('aplica todos os filtros disponiveis (status, pipeline, stage, contact, company)', async () => {
    const { chain, captured } = makeChain({ data: [], count: 0, error: null });
    mockedSupabase.from.mockReturnValue(chain);

    await getCrmDeals({
      status: 'won',
      pipelineId: 'p1',
      stageId: 's1',
      contactId: 'c1',
      companyId: 'co1',
    });

    const eqFields = captured.eqCalls.map(([f]) => f);
    expect(eqFields).toContain('status');
    expect(eqFields).toContain('pipeline_id');
    expect(eqFields).toContain('stage_id');
    expect(eqFields).toContain('contact_id');
    expect(eqFields).toContain('company_id');
  });

  it('order default: created_at desc (ascending = sortOrder !== "asc")', async () => {
    const { chain, captured } = makeChain({ data: [], count: 0, error: null });
    mockedSupabase.from.mockReturnValue(chain);

    await getCrmDeals();

    expect(captured.orderArgs?.[0]).toBe('created_at');
    expect(captured.orderArgs?.[1]).toEqual({ ascending: false });
  });

  it('order custom: sortBy=value asc respeitado', async () => {
    const { chain, captured } = makeChain({ data: [], count: 0, error: null });
    mockedSupabase.from.mockReturnValue(chain);

    await getCrmDeals({ sortBy: 'value', sortOrder: 'asc' });

    expect(captured.orderArgs?.[0]).toBe('value');
    expect(captured.orderArgs?.[1]).toEqual({ ascending: true });
  });

  it('aplica range quando page e perPage estao setados (page=2, perPage=25 -> 25..49)', async () => {
    const { chain, captured } = makeChain({ data: [], count: 0, error: null });
    mockedSupabase.from.mockReturnValue(chain);

    await getCrmDeals({ page: 2, perPage: 25 });

    expect(captured.rangeArgs).toEqual([25, 49]);
  });

  it('filtra is_null em deleted_at (soft delete)', async () => {
    const { chain, captured } = makeChain({ data: [], count: 0, error: null });
    mockedSupabase.from.mockReturnValue(chain);

    await getCrmDeals();

    expect(captured.isCalls).toContainEqual(['deleted_at', null]);
  });

  it('retorna estrutura vazia quando supabase erra', async () => {
    const { chain } = makeChain({ data: null, count: null, error: { message: 'boom' } });
    mockedSupabase.from.mockReturnValue(chain);

    const result = await getCrmDeals();

    expect(result).toEqual({ data: [], count: 0 });
  });
});

// ============================================================================
// getCrmDealById
// ============================================================================

describe('getCrmDealById', () => {
  it('busca por id e retorna deal mapeado', async () => {
    const { chain, captured } = makeChain({
      data: { id: 'd1', title: 'Deal X', value: 500, created_at: 'a', updated_at: 'b' },
      error: null,
    });
    mockedSupabase.from.mockReturnValue(chain);

    const result = await getCrmDealById('d1');

    expect(result?.id).toBe('d1');
    expect(result?.value).toBe(500);
    expect(captured.eqCalls).toContainEqual(['id', 'd1']);
  });

  it('retorna null quando supabase erra', async () => {
    const { chain } = makeChain({ data: null, error: { message: 'not found' } });
    mockedSupabase.from.mockReturnValue(chain);

    const result = await getCrmDealById('inexistent');

    expect(result).toBeNull();
  });
});

// ============================================================================
// createCrmDeal
// ============================================================================

describe('createCrmDeal', () => {
  it('chama dealService.create com data + created_by da sessao', async () => {
    mockedSupabase.auth.getSession.mockResolvedValueOnce({
      data: { session: { user: { id: 'user-123' } } },
    });
    mockCreate.mockResolvedValueOnce({ id: 'new-d1', title: 'New', stageId: null, pipelineId: null });

    await createCrmDeal({ title: 'New' });

    expect(mockCreate).toHaveBeenCalledWith({ title: 'New' }, { created_by: 'user-123' });
  });

  it('grava transicao inicial em stage_history quando deal cria com pipeline+stage', async () => {
    mockedSupabase.auth.getSession.mockResolvedValueOnce({
      data: { session: { user: { id: 'user-1' } } },
    });
    mockCreate.mockResolvedValueOnce({ id: 'new-d1' });

    // O insert em crm_deal_stage_history e uma chamada nova ao supabase.from
    const { chain: historyChain, captured: historyCap } = makeChain({ data: null, error: null });
    mockedSupabase.from.mockReturnValue(historyChain);

    await createCrmDeal({ title: 'New', stageId: 's1', pipelineId: 'p1' });

    expect(historyCap.insertArgs).toBeDefined();
    const inserted = historyCap.insertArgs?.[0] as Record<string, unknown>;
    expect(inserted.deal_id).toBe('new-d1');
    expect(inserted.from_stage_id).toBeNull();
    expect(inserted.to_stage_id).toBe('s1');
    expect(inserted.pipeline_id).toBe('p1');
  });

  it('NAO grava history quando dealService.create retorna null (falha)', async () => {
    mockCreate.mockResolvedValueOnce(null);

    await createCrmDeal({ title: 'X', stageId: 's1', pipelineId: 'p1' });

    expect(mockedSupabase.from).not.toHaveBeenCalled();
  });

  it('NAO grava history se faltar stageId ou pipelineId', async () => {
    mockCreate.mockResolvedValueOnce({ id: 'd1' });

    await createCrmDeal({ title: 'X' }); // sem stage, sem pipeline

    expect(mockedSupabase.from).not.toHaveBeenCalled();
  });
});

// ============================================================================
// updateCrmDeal
// ============================================================================

describe('updateCrmDeal', () => {
  it('delega pro dealService.update sem mexer quando status nao muda', async () => {
    mockUpdate.mockResolvedValueOnce({ id: 'd1', title: 'updated' });

    const result = await updateCrmDeal('d1', { title: 'updated' });

    expect(mockUpdate).toHaveBeenCalledWith('d1', { title: 'updated' });
    expect(result?.title).toBe('updated');
  });

  it('status=won injeta closedAt + probability (nao some dos relatorios)', async () => {
    mockUpdate.mockResolvedValueOnce({ id: 'd1', status: 'won' });

    await updateCrmDeal('d1', { status: 'won' });

    const passed = mockUpdate.mock.calls[0][1] as Record<string, unknown>;
    expect(passed.status).toBe('won');
    expect(passed.probability).toBe(100);
    expect(passed.closedAt).toEqual(expect.any(String));
  });

  it('status=lost injeta closedAt + probability 0', async () => {
    mockUpdate.mockResolvedValueOnce({ id: 'd1', status: 'lost' });

    await updateCrmDeal('d1', { status: 'lost' });

    const passed = mockUpdate.mock.calls[0][1] as Record<string, unknown>;
    expect(passed.closedAt).toEqual(expect.any(String));
    expect(passed.probability).toBe(0);
  });

  it('status=open (reabrir) limpa closedAt', async () => {
    mockUpdate.mockResolvedValueOnce({ id: 'd1', status: 'open' });

    await updateCrmDeal('d1', { status: 'open' });

    const passed = mockUpdate.mock.calls[0][1] as Record<string, unknown>;
    expect(passed.closedAt).toBeNull();
  });
});

// ============================================================================
// softDeleteCrmDeal
// ============================================================================

describe('softDeleteCrmDeal', () => {
  it('seta deleted_at e retorna true em sucesso', async () => {
    const { chain, captured } = makeChain({ data: [{ id: 'd1' }], error: null });
    mockedSupabase.from.mockReturnValue(chain);

    const ok = await softDeleteCrmDeal('d1');

    expect(ok).toBe(true);
    const payload = captured.updateArgs?.[0] as Record<string, unknown>;
    expect(payload.deleted_at).toEqual(expect.any(String));
  });

  it('lanca erro quando supabase retorna error', async () => {
    const { chain } = makeChain({ data: null, error: { message: 'permission denied' } });
    mockedSupabase.from.mockReturnValue(chain);

    await expect(softDeleteCrmDeal('d1')).rejects.toThrow('permission denied');
  });

  it('lanca erro quando RLS retorna 0 linhas (bloqueio silencioso)', async () => {
    const { chain } = makeChain({ data: [], error: null });
    mockedSupabase.from.mockReturnValue(chain);

    await expect(softDeleteCrmDeal('d1')).rejects.toThrow(/RLS|ID inexistente/);
  });
});

// ============================================================================
// moveDealToStage
// ============================================================================

describe('moveDealToStage', () => {
  function setupMove(opts: {
    current: { stage_id?: string; pipeline_id?: string; status?: string } | null;
    targetStage: { is_win_stage?: boolean; name?: string } | null;
    updated: Record<string, unknown> | null;
    updateError?: unknown;
    historyChain?: ReturnType<typeof makeChain>;
  }) {
    const dealSelect = makeChain({ data: opts.current, error: null });
    const stageSelect = makeChain({ data: opts.targetStage, error: null });
    const dealUpdate = makeChain({ data: opts.updated, error: opts.updateError || null });
    const history = opts.historyChain || makeChain({ data: null, error: null });

    mockedSupabase.from
      .mockImplementationOnce(() => dealSelect.chain)
      .mockImplementationOnce(() => stageSelect.chain)
      .mockImplementationOnce(() => dealUpdate.chain)
      .mockImplementation(() => history.chain);

    return { dealSelect, stageSelect, dealUpdate, history };
  }

  it('move sem auto-win quando target NAO e win-stage', async () => {
    const m = setupMove({
      current: { stage_id: 's_old', pipeline_id: 'p1', status: 'open' },
      targetStage: { is_win_stage: false, name: 'Negociacao' },
      updated: {
        id: 'd1', title: 'X', status: 'open', stage_id: 's_new', pipeline_id: 'p1',
        created_at: 'a', updated_at: 'b',
      },
    });

    const result = await moveDealToStage('d1', 's_new');

    const payload = m.dealUpdate.captured.updateArgs?.[0] as Record<string, unknown>;
    expect(payload.stage_id).toBe('s_new');
    expect(payload.status).toBeUndefined();
    expect(payload.probability).toBeUndefined();
    expect(payload.closed_at).toBeUndefined();
    expect(result?.stageId).toBe('s_new');
  });

  it('AUTO-WIN: target e win-stage e deal estava aberto', async () => {
    const m = setupMove({
      current: { stage_id: 's_old', pipeline_id: 'p1', status: 'open' },
      targetStage: { is_win_stage: true, name: 'Fechado' },
      updated: {
        id: 'd1', title: 'X', status: 'won', stage_id: 's_win', pipeline_id: 'p1',
        created_at: 'a', updated_at: 'b',
      },
    });

    await moveDealToStage('d1', 's_win');

    const payload = m.dealUpdate.captured.updateArgs?.[0] as Record<string, unknown>;
    expect(payload.status).toBe('won');
    expect(payload.probability).toBe(100);
    expect(payload.closed_at).toEqual(expect.any(String));
  });

  it('NAO auto-win se deal ja estava won/lost (idempotente)', async () => {
    const m = setupMove({
      current: { stage_id: 's_old', pipeline_id: 'p1', status: 'won' },
      targetStage: { is_win_stage: true, name: 'Fechado' },
      updated: {
        id: 'd1', title: 'X', status: 'won', stage_id: 's_win', pipeline_id: 'p1',
        created_at: 'a', updated_at: 'b',
      },
    });

    await moveDealToStage('d1', 's_win');

    const payload = m.dealUpdate.captured.updateArgs?.[0] as Record<string, unknown>;
    // status nao deve ser reescrito porque ja era 'won'
    expect(payload.status).toBeUndefined();
  });

  it('REOPEN: move de won/lost pra stage normal -> volta a status=open', async () => {
    const m = setupMove({
      current: { stage_id: 's_won', pipeline_id: 'p1', status: 'won' },
      targetStage: { is_win_stage: false, name: 'Em Andamento' },
      updated: {
        id: 'd1', title: 'X', status: 'open', stage_id: 's_andamento', pipeline_id: 'p1',
        created_at: 'a', updated_at: 'b',
      },
    });

    await moveDealToStage('d1', 's_andamento');

    const payload = m.dealUpdate.captured.updateArgs?.[0] as Record<string, unknown>;
    expect(payload.status).toBe('open');
    expect(payload.closed_at).toBeNull();
  });

  it('NAO grava history quando stage nao muda (mesmo stage)', async () => {
    setupMove({
      current: { stage_id: 's1', pipeline_id: 'p1', status: 'open' },
      targetStage: { is_win_stage: false, name: 'X' },
      updated: {
        id: 'd1', title: 'X', status: 'open', stage_id: 's1', pipeline_id: 'p1',
        created_at: 'a', updated_at: 'b',
      },
    });

    await moveDealToStage('d1', 's1');

    // Inseriu chamadas: dealSelect, stageSelect, dealUpdate = 3 — nada de history
    expect(mockedSupabase.from).toHaveBeenCalledTimes(3);
  });

  it('grava history e dispara automations quando stage muda', async () => {
    setupMove({
      current: { stage_id: 's_old', pipeline_id: 'p1', status: 'open' },
      targetStage: { is_win_stage: false, name: 'X' },
      updated: {
        id: 'd1', title: 'X', status: 'open', stage_id: 's_new', pipeline_id: 'p1',
        created_at: 'a', updated_at: 'b',
      },
    });

    const result = await moveDealToStage('d1', 's_new');

    // history insert tem que ter sido feito (4a chamada a from)
    expect(mockedSupabase.from).toHaveBeenCalledTimes(4);
    expect(mockTriggerAutomations).toHaveBeenCalledWith(result, 's_new');
  });

  it('joga erro quando update do supabase falha', async () => {
    setupMove({
      current: { stage_id: 's_old', pipeline_id: 'p1', status: 'open' },
      targetStage: { is_win_stage: false, name: 'X' },
      updated: null,
      updateError: { message: 'permission denied' },
    });

    await expect(moveDealToStage('d1', 's_new')).rejects.toThrow('permission denied');
  });

});

// ============================================================================
// markDealAsWon
// ============================================================================

describe('markDealAsWon', () => {
  it('seta status=won, probability=100, closed_at', async () => {
    const { chain, captured } = makeChain({
      data: { id: 'd1', title: 'X', status: 'won', created_at: 'a', updated_at: 'b' },
      error: null,
    });
    mockedSupabase.from.mockReturnValue(chain);

    const result = await markDealAsWon('d1');

    const payload = captured.updateArgs?.[0] as Record<string, unknown>;
    expect(payload.status).toBe('won');
    expect(payload.probability).toBe(100);
    expect(payload.closed_at).toEqual(expect.any(String));
    expect(payload.updated_at).toEqual(expect.any(String));
    expect(result?.status).toBe('won');
  });

  it('move pro win stage, grava history e dispara automations (== arrastar)', async () => {
    const dealSelect = makeChain({ data: { stage_id: 's_old', pipeline_id: 'p1' }, error: null });
    const winStageSelect = makeChain({ data: { id: 's_win' }, error: null });
    const dealUpdate = makeChain({
      data: { id: 'd1', title: 'X', status: 'won', stage_id: 's_win', pipeline_id: 'p1', created_at: 'a', updated_at: 'b' },
      error: null,
    });
    const history = makeChain({ data: null, error: null });

    mockedSupabase.from
      .mockImplementationOnce(() => dealSelect.chain)
      .mockImplementationOnce(() => winStageSelect.chain)
      .mockImplementationOnce(() => dealUpdate.chain)
      .mockImplementation(() => history.chain);

    const result = await markDealAsWon('d1');

    const payload = dealUpdate.captured.updateArgs?.[0] as Record<string, unknown>;
    expect(payload.status).toBe('won');
    expect(payload.stage_id).toBe('s_win'); // moveu pra coluna de vitoria
    // history (4a chamada) + automations disparadas
    expect(mockedSupabase.from).toHaveBeenCalledTimes(4);
    expect(mockTriggerAutomations).toHaveBeenCalledWith(result, 's_win');
  });

  it('joga erro quando update falha', async () => {
    const { chain } = makeChain({ data: null, error: { message: 'denied' } });
    mockedSupabase.from.mockReturnValue(chain);

    await expect(markDealAsWon('d1')).rejects.toThrow('denied');
  });
});

// ============================================================================
// getDealActivities
// ============================================================================

describe('getDealActivities', () => {
  it('mapeia atividades raw em formato camelCase', async () => {
    const { chain, captured } = makeChain({
      data: [
        {
          id: 'a1',
          title: 'Reuniao',
          description: 'nota',
          type: 'meeting',
          start_date: '2026-05-10T10:00:00Z',
          end_date: '2026-05-10T11:00:00Z',
          completed: true,
          completed_at: '2026-05-10T11:30:00Z',
          crm_contacts: { id: 'c1', name: 'Joao', avatar_color: '#abc' },
          created_at: '2026-05-09T00:00:00Z',
        },
      ],
      error: null,
    });
    mockedSupabase.from.mockReturnValue(chain);

    const result = await getDealActivities('d1');

    expect(result).toHaveLength(1);
    expect(result[0]).toEqual({
      id: 'a1',
      title: 'Reuniao',
      description: 'nota',
      type: 'meeting',
      startDate: '2026-05-10T10:00:00Z',
      endDate: '2026-05-10T11:00:00Z',
      completed: true,
      completedAt: '2026-05-10T11:30:00Z',
      contact: { id: 'c1', name: 'Joao', avatarColor: '#abc' },
      createdAt: '2026-05-09T00:00:00Z',
    });
    expect(captured.eqCalls).toContainEqual(['deal_id', 'd1']);
    expect(captured.isCalls).toContainEqual(['deleted_at', null]);
  });

  it('contact null quando crm_contacts ausente', async () => {
    const { chain } = makeChain({
      data: [{
        id: 'a1', title: 'X', description: '', type: 'task',
        start_date: 'd', end_date: null, completed: false, completed_at: null,
        created_at: 'c',
      }],
      error: null,
    });
    mockedSupabase.from.mockReturnValue(chain);

    const result = await getDealActivities('d1');

    expect(result[0].contact).toBeNull();
  });

  it('retorna [] em erro do supabase', async () => {
    const { chain } = makeChain({ data: null, error: { message: 'err' } });
    mockedSupabase.from.mockReturnValue(chain);

    const result = await getDealActivities('d1');
    expect(result).toEqual([]);
  });
});

// ============================================================================
// getDealStageHistory
// ============================================================================

describe('getDealStageHistory', () => {
  it('mapeia historico com info do stage joinado', async () => {
    const { chain } = makeChain({
      data: [
        {
          id: 'h1',
          from_stage_id: 's_old',
          to_stage_id: 's_new',
          crm_pipeline_stages: { id: 's_new', name: 'Negociacao', color: '#abc' },
          created_at: '2026-05-01T00:00:00Z',
        },
      ],
      error: null,
    });
    mockedSupabase.from.mockReturnValue(chain);

    const result = await getDealStageHistory('d1');

    expect(result).toHaveLength(1);
    expect(result[0]).toEqual({
      id: 'h1',
      fromStageId: 's_old',
      toStageId: 's_new',
      stage: { id: 's_new', name: 'Negociacao', color: '#abc' },
      createdAt: '2026-05-01T00:00:00Z',
    });
  });

  it('fallback quando join falha: busca sem join, stage=null', async () => {
    const errChain = makeChain({ data: null, error: { message: 'fk error' } }).chain;
    const fallbackChain = makeChain({
      data: [
        {
          id: 'h1',
          from_stage_id: 's_old',
          to_stage_id: 's_new',
          created_at: '2026-05-01T00:00:00Z',
        },
      ],
      error: null,
    }).chain;

    mockedSupabase.from
      .mockImplementationOnce(() => errChain)
      .mockImplementationOnce(() => fallbackChain);

    const result = await getDealStageHistory('d1');

    expect(result[0].stage).toBeNull();
    expect(result[0].fromStageId).toBe('s_old');
    expect(result[0].toStageId).toBe('s_new');
  });
});
