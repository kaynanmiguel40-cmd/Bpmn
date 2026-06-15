import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('../../../../lib/supabase', () => ({
  supabase: {
    from: vi.fn(),
    auth: { getSession: vi.fn().mockResolvedValue({ data: { session: null } }) },
  },
}));
vi.mock('../../../../contexts/ToastContext', () => ({ toast: vi.fn() }));
vi.mock('../../../../lib/serviceFactory', () => ({
  createCRUDService: vi.fn(() => ({ create: vi.fn(), update: vi.fn(), getAll: vi.fn(), remove: vi.fn() })),
}));
vi.mock('../crmAutomationsService', () => ({ triggerAutomationsForDeal: vi.fn() }));
vi.mock('../crmActivitiesService', () => ({ createCrmActivity: vi.fn() }));
vi.mock('../../schemas/crmValidation', () => ({ crmDealSchema: {} }));

import { dbToCrmDeal, markDealAsLost } from '../crmDealsService';
import { supabase } from '../../../../lib/supabase';

// Helper: cria um chain mock do supabase. Cada `select/update/insert` retorna
// `chain`, encadeando metodos. `single()`/`maybeSingle()` resolvem com o valor
// final fornecido. Captura os argumentos pra assertions posteriores.
function makeChain(finalResult) {
  const captured = {
    table: null,
    selectArgs: null,
    updateArgs: null,
    insertArgs: null,
    eqCalls: [],
  };
  const chain = {
    select: vi.fn((...args) => { captured.selectArgs = args; return chain; }),
    update: vi.fn((...args) => { captured.updateArgs = args; return chain; }),
    insert: vi.fn((...args) => { captured.insertArgs = args; return chain; }),
    eq: vi.fn((field, value) => { captured.eqCalls.push([field, value]); return chain; }),
    is: vi.fn(() => chain),
    in: vi.fn(() => chain),
    not: vi.fn(() => chain),
    order: vi.fn(() => chain),
    ilike: vi.fn(() => chain),
    gte: vi.fn(() => chain),
    lte: vi.fn(() => chain),
    lt: vi.fn(() => chain),
    range: vi.fn(() => chain),
    limit: vi.fn(() => chain),
    or: vi.fn(() => chain),
    single: vi.fn().mockResolvedValue(finalResult),
    maybeSingle: vi.fn().mockResolvedValue(finalResult),
    then: (resolve) => resolve(finalResult),
  };
  return { chain, captured };
}

beforeEach(() => {
  supabase.from.mockReset();
  // Workspace settings sao lidos do localStorage por markDealAsLost.
  // Limpar entre testes evita vazamento de config entre cenarios.
  localStorage.clear();
});

describe('dbToCrmDeal', () => {
  it('retorna null para input null/undefined', () => {
    expect(dbToCrmDeal(null)).toBeNull();
    expect(dbToCrmDeal(undefined)).toBeNull();
  });

  it('mapeia campos basicos', () => {
    const row = {
      id: 'd1',
      title: 'Negocio X',
      value: 1500,
      probability: 70,
      contact_id: 'c1',
      contact_name: 'Joao',
      contact_phone: '+5511999998888',
      contact_email: 'joao@x.com',
      company_id: 'co1',
      pipeline_id: 'p1',
      stage_id: 's1',
      expected_close_date: '2026-06-30',
      closed_at: null,
      status: 'open',
      lost_reason: null,
      segment: 'Tecnologia',
      notes: 'Muito interessado',
      owner_id: 'tm1',
      created_at: '2026-05-01T10:00:00Z',
      updated_at: '2026-05-02T10:00:00Z',
    };
    const result = dbToCrmDeal(row);
    expect(result.id).toBe('d1');
    expect(result.title).toBe('Negocio X');
    expect(result.value).toBe(1500);
    expect(result.probability).toBe(70);
    expect(result.contactId).toBe('c1');
    expect(result.contactName).toBe('Joao');
    expect(result.contactEmail).toBe('joao@x.com');
    expect(result.companyId).toBe('co1');
    expect(result.pipelineId).toBe('p1');
    expect(result.stageId).toBe('s1');
    expect(result.expectedCloseDate).toBe('2026-06-30');
    expect(result.status).toBe('open');
    expect(result.segment).toBe('Tecnologia');
    expect(result.notes).toBe('Muito interessado');
    expect(result.ownerId).toBe('tm1');
  });

  it('aplica defaults: value=0, probability=50, status=open, notes vazia', () => {
    const result = dbToCrmDeal({ id: 'd1', title: 'X' });
    expect(result.value).toBe(0);
    expect(result.probability).toBe(50);
    expect(result.status).toBe('open');
    expect(result.notes).toBe('');
  });

  it('probability null/undefined cai pra 50 via ??', () => {
    expect(dbToCrmDeal({ id: 'd1', title: 'X', probability: null }).probability).toBe(50);
    expect(dbToCrmDeal({ id: 'd1', title: 'X', probability: 0 }).probability).toBe(0);
  });

  it('mapeia joins de contact, company, stage e team_members', () => {
    const row = {
      id: 'd1',
      title: 'X',
      crm_contacts: { id: 'c1', name: 'Joao', avatar_color: '#abc', email: 'j@x.com' },
      crm_companies: { id: 'co1', name: 'Acme', segment: 'Tech' },
      crm_pipeline_stages: { id: 's1', name: 'Proposta', color: '#f00' },
      team_members: { id: 'tm1', name: 'Carlos', color: '#0f0' },
    };
    const result = dbToCrmDeal(row);
    expect(result.contact).toEqual({ id: 'c1', name: 'Joao', avatarColor: '#abc', email: 'j@x.com' });
    expect(result.company).toEqual({ id: 'co1', name: 'Acme', segment: 'Tech' });
    expect(result.stage).toEqual({ id: 's1', name: 'Proposta', color: '#f00' });
    expect(result.owner).toEqual({ id: 'tm1', name: 'Carlos', color: '#0f0' });
  });

  it('contact/company/stage/owner sao null quando os joins nao vem', () => {
    const result = dbToCrmDeal({ id: 'd1', title: 'X' });
    expect(result.contact).toBeNull();
    expect(result.company).toBeNull();
    expect(result.stage).toBeNull();
    expect(result.owner).toBeNull();
  });

});

// ─────────────────────────────────────────────────────────────────────────────
// markDealAsLost
// ─────────────────────────────────────────────────────────────────────────────

describe('markDealAsLost', () => {
  const NURTURING_ID = 'pipe_nurt';
  const NURTURING_STAGES = [
    { id: 'st_nutricao', name: 'Em Nutricao', position: 1 },
    { id: 'st_react30',  name: 'Reativacao D30', position: 2 },
    { id: 'st_descarte', name: 'Descarte', position: 6 },
  ];

  // Configura a sequencia de mocks por chamada que markDealAsLost faz:
  //   1) SELECT crm_deals (current pipeline_id, stage_id)
  //   2) SELECT crm_pipeline_stages (procura estagio "Excluida" na pipeline atual)
  //   3) SELECT crm_pipelines (Nurturing + stages) — pulada se houve match em (2) ou config
  //   4) UPDATE crm_deals (resultado final)
  //   5) INSERT crm_deal_stage_history (transicao) — opcional
  // Por default discardStage = null, fluxo cai pro caminho legado de Nurturing.
  function setupMocks({ current, nurturing, updated, discardStage = null }) {
    const dealSelect = makeChain({ data: current, error: null });
    const discardSelect = makeChain({ data: discardStage, error: null });
    const nurturingSelect = makeChain({ data: nurturing, error: null });
    const dealUpdate = makeChain({ data: updated, error: null });
    const historyInsert = makeChain({ data: null, error: null });

    supabase.from
      .mockImplementationOnce((t) => { dealSelect.captured.table = t; return dealSelect.chain; })
      .mockImplementationOnce((t) => { discardSelect.captured.table = t; return discardSelect.chain; })
      .mockImplementationOnce((t) => { nurturingSelect.captured.table = t; return nurturingSelect.chain; })
      .mockImplementationOnce((t) => { dealUpdate.captured.table = t; return dealUpdate.chain; })
      .mockImplementationOnce((t) => { historyInsert.captured.table = t; return historyInsert.chain; });

    return { dealSelect, discardSelect, nurturingSelect, dealUpdate, historyInsert };
  }

  it('move deal de outra pipeline pra Nurturing > Em Nutricao', async () => {
    const mocks = setupMocks({
      current: { pipeline_id: 'pipe_vendedor', stage_id: 'st_negociacao' },
      nurturing: { id: NURTURING_ID, crm_pipeline_stages: NURTURING_STAGES },
      updated: {
        id: 'd1', title: 'Deal X', status: 'lost',
        pipeline_id: NURTURING_ID, stage_id: 'st_nutricao',
        lost_reason: 'preco', closed_at: '2026-05-06T12:00:00Z',
      },
    });

    const result = await markDealAsLost('d1', 'preco');

    // Update foi chamado com payload correto
    const updatePayload = mocks.dealUpdate.captured.updateArgs[0];
    expect(updatePayload.status).toBe('lost');
    expect(updatePayload.probability).toBe(0);
    expect(updatePayload.lost_reason).toBe('preco');
    expect(updatePayload.closed_at).toBeTruthy();
    expect(updatePayload.pipeline_id).toBe(NURTURING_ID);
    expect(updatePayload.stage_id).toBe('st_nutricao');

    // History gravado com transicao
    expect(mocks.historyInsert.chain.insert).toHaveBeenCalled();
    const historyRow = mocks.historyInsert.captured.insertArgs[0];
    expect(historyRow.deal_id).toBe('d1');
    expect(historyRow.from_stage_id).toBe('st_negociacao');
    expect(historyRow.to_stage_id).toBe('st_nutricao');
    expect(historyRow.pipeline_id).toBe(NURTURING_ID);

    // Flag _movedTo no resultado
    expect(result._movedTo).toBe('nurturing');
    expect(result.status).toBe('lost');
  });

  it('move deal ja no Nurturing pra "Descarte"', async () => {
    const mocks = setupMocks({
      // Deal ja esta em Nurturing, stage diferente de Descarte (foi reaberto antes)
      current: { pipeline_id: NURTURING_ID, stage_id: 'st_react30' },
      nurturing: { id: NURTURING_ID, crm_pipeline_stages: NURTURING_STAGES },
      updated: {
        id: 'd1', title: 'X', status: 'lost',
        pipeline_id: NURTURING_ID, stage_id: 'st_descarte',
        lost_reason: 'fora do ICP',
      },
    });

    const result = await markDealAsLost('d1', 'fora do ICP');

    const updatePayload = mocks.dealUpdate.captured.updateArgs[0];
    // Pipeline nao muda (ja era Nurturing) -> NAO entra no payload
    expect(updatePayload.pipeline_id).toBeUndefined();
    expect(updatePayload.stage_id).toBe('st_descarte');
    expect(updatePayload.lost_reason).toBe('fora do ICP');

    // Transicao gravada
    expect(mocks.historyInsert.captured.insertArgs[0].to_stage_id).toBe('st_descarte');

    expect(result._movedTo).toBe('descarte');
  });

  it('NAO move quando deal ja esta no Nurturing > Descarte (idempotente)', async () => {
    const mocks = setupMocks({
      // Deal ja em Descarte — nao tem pra onde ir
      current: { pipeline_id: NURTURING_ID, stage_id: 'st_descarte' },
      nurturing: { id: NURTURING_ID, crm_pipeline_stages: NURTURING_STAGES },
      updated: {
        id: 'd1', title: 'X', status: 'lost',
        pipeline_id: NURTURING_ID, stage_id: 'st_descarte',
      },
    });

    const result = await markDealAsLost('d1', 'reincidencia');

    // Update NAO deveria conter pipeline_id/stage_id (porque nao mudou)
    const updatePayload = mocks.dealUpdate.captured.updateArgs[0];
    expect(updatePayload.pipeline_id).toBeUndefined();
    expect(updatePayload.stage_id).toBeUndefined();

    // History NAO foi gravado pois stage nao mudou
    expect(mocks.historyInsert.chain.insert).not.toHaveBeenCalled();

    // Flag _movedTo deve ser null (sem movimento)
    expect(result._movedTo).toBeNull();
  });

  it('mantem fluxo antigo quando pipeline Nurturing nao existe', async () => {
    const mocks = setupMocks({
      current: { pipeline_id: 'pipe_vendedor', stage_id: 'st_neg' },
      nurturing: null, // maybeSingle retorna null
      updated: {
        id: 'd1', title: 'X', status: 'lost',
        pipeline_id: 'pipe_vendedor', stage_id: 'st_neg',
      },
    });

    const result = await markDealAsLost('d1', 'sem dinheiro');

    const updatePayload = mocks.dealUpdate.captured.updateArgs[0];
    // Nao deve mexer em pipeline_id/stage_id
    expect(updatePayload.pipeline_id).toBeUndefined();
    expect(updatePayload.stage_id).toBeUndefined();
    // Mas mantem os campos de "perdido"
    expect(updatePayload.status).toBe('lost');
    expect(updatePayload.probability).toBe(0);
    expect(updatePayload.lost_reason).toBe('sem dinheiro');

    // Sem movimento, sem history
    expect(mocks.historyInsert.chain.insert).not.toHaveBeenCalled();
    expect(result._movedTo).toBeNull();
  });

  it('aceita reason vazio (default)', async () => {
    const mocks = setupMocks({
      current: { pipeline_id: 'pipe_v', stage_id: 's1' },
      nurturing: { id: NURTURING_ID, crm_pipeline_stages: NURTURING_STAGES },
      updated: { id: 'd1', title: 'X', status: 'lost', pipeline_id: NURTURING_ID, stage_id: 'st_nutricao' },
    });

    await markDealAsLost('d1');

    const updatePayload = mocks.dealUpdate.captured.updateArgs[0];
    expect(updatePayload.lost_reason).toBe('');
  });

  it('throw Error quando update falha', async () => {
    const dealSelect = makeChain({ data: { pipeline_id: 'p', stage_id: 's' }, error: null });
    const discardSelect = makeChain({ data: null, error: null });
    const nurturingSelect = makeChain({ data: null, error: null });
    const dealUpdate = makeChain({ data: null, error: { message: 'permission denied' } });

    supabase.from
      .mockImplementationOnce(() => dealSelect.chain)
      .mockImplementationOnce(() => discardSelect.chain)
      .mockImplementationOnce(() => nurturingSelect.chain)
      .mockImplementationOnce(() => dealUpdate.chain);

    await expect(markDealAsLost('d1', 'x')).rejects.toThrow('permission denied');
  });

  it('escolhe stage por NOME, nao por posicao (resiliencia a reordenacao)', async () => {
    // Stages com posicoes embaralhadas — deve achar "Em Nutricao" pelo nome
    const stagesEmbaralhadas = [
      { id: 'st_descarte', name: 'Descarte', position: 1 }, // ate na primeira posicao!
      { id: 'st_react90',  name: 'Reativacao D90', position: 2 },
      { id: 'st_nutricao', name: 'Em Nutricao', position: 5 }, // posicao 5
    ];

    const mocks = setupMocks({
      current: { pipeline_id: 'pipe_v', stage_id: 's1' },
      nurturing: { id: NURTURING_ID, crm_pipeline_stages: stagesEmbaralhadas },
      updated: { id: 'd1', title: 'X', status: 'lost', pipeline_id: NURTURING_ID, stage_id: 'st_nutricao' },
    });

    await markDealAsLost('d1', 'preco');

    const updatePayload = mocks.dealUpdate.captured.updateArgs[0];
    // Mesmo que "Em Nutricao" esteja em position 5, achou pelo NOME
    expect(updatePayload.stage_id).toBe('st_nutricao');
  });

  it('fallback para primeiro stage por posicao se "Em Nutricao" nao existir', async () => {
    // Pipeline Nurturing nomeado mas com stages diferentes (ex: configuracao customizada)
    const stagesCustom = [
      { id: 'st_x', name: 'Stage Custom 1', position: 1 },
      { id: 'st_y', name: 'Stage Custom 2', position: 2 },
    ];

    const mocks = setupMocks({
      current: { pipeline_id: 'pipe_v', stage_id: 's1' },
      nurturing: { id: NURTURING_ID, crm_pipeline_stages: stagesCustom },
      updated: { id: 'd1', title: 'X', status: 'lost', pipeline_id: NURTURING_ID, stage_id: 'st_x' },
    });

    await markDealAsLost('d1', 'qualquer');

    const updatePayload = mocks.dealUpdate.captured.updateArgs[0];
    // Cai pro primeiro stage por posicao
    expect(updatePayload.stage_id).toBe('st_x');
    expect(updatePayload.pipeline_id).toBe(NURTURING_ID);
  });

  it('grava transicao no history com pipeline_id correto da NOVA pipeline', async () => {
    const mocks = setupMocks({
      current: { pipeline_id: 'pipe_origem', stage_id: 'st_origem' },
      nurturing: { id: NURTURING_ID, crm_pipeline_stages: NURTURING_STAGES },
      updated: { id: 'd1', title: 'X', status: 'lost', pipeline_id: NURTURING_ID, stage_id: 'st_nutricao' },
    });

    await markDealAsLost('d1', 'x');

    const historyRow = mocks.historyInsert.captured.insertArgs[0];
    // pipeline_id no history deve ser o de DESTINO (Nurturing), nao o de origem
    expect(historyRow.pipeline_id).toBe(NURTURING_ID);
    expect(historyRow.from_stage_id).toBe('st_origem');
    expect(historyRow.to_stage_id).toBe('st_nutricao');
  });

  // ─────────────────────────────────────────────────────────────────────────
  // Caminho de config explicita (workspaceSettings em localStorage)
  // ─────────────────────────────────────────────────────────────────────────

  function setupMocksWithConfig({ current, updated, settings, discardStage = null }) {
    // Seta config antes do markDealAsLost rodar
    localStorage.setItem('crm-workspace-config', JSON.stringify(settings));

    const dealSelect = makeChain({ data: current, error: null });
    const discardSelect = makeChain({ data: discardStage, error: null });
    const dealUpdate = makeChain({ data: updated, error: null });
    const historyInsert = makeChain({ data: null, error: null });

    supabase.from
      .mockImplementationOnce((t) => { dealSelect.captured.table = t; return dealSelect.chain; })
      .mockImplementationOnce((t) => { discardSelect.captured.table = t; return discardSelect.chain; })
      .mockImplementationOnce((t) => { dealUpdate.captured.table = t; return dealUpdate.chain; })
      .mockImplementationOnce((t) => { historyInsert.captured.table = t; return historyInsert.chain; });

    return { dealSelect, discardSelect, dealUpdate, historyInsert };
  }

  it('usa config do workspace quando lostTargetPipelineId esta setado (NAO consulta crm_pipelines)', async () => {
    const mocks = setupMocksWithConfig({
      current: { pipeline_id: 'pipe_outro', stage_id: 'st_orig' },
      updated: { id: 'd1', title: 'X', status: 'lost', pipeline_id: 'custom_pipe', stage_id: 'custom_entry' },
      settings: {
        lostTargetPipelineId: 'custom_pipe',
        lostTargetStageId: 'custom_entry',
        discardStageId: 'custom_descarte',
      },
    });

    const result = await markDealAsLost('d1', 'preco');

    // 4 chamadas a from(): deal SELECT, pipeline_stages (procura Excluida), deal UPDATE, history INSERT.
    // NAO houve select de crm_pipelines (skip por causa da config explicita).
    expect(supabase.from).toHaveBeenCalledTimes(4);

    const updatePayload = mocks.dealUpdate.captured.updateArgs[0];
    expect(updatePayload.pipeline_id).toBe('custom_pipe');
    expect(updatePayload.stage_id).toBe('custom_entry');
    expect(result._movedTo).toBe('nurturing');
  });

  it('config explicita: deal ja na pipeline alvo -> stage de descarte configurado', async () => {
    const mocks = setupMocksWithConfig({
      current: { pipeline_id: 'custom_pipe', stage_id: 'custom_entry' },
      updated: { id: 'd1', title: 'X', status: 'lost', pipeline_id: 'custom_pipe', stage_id: 'custom_descarte' },
      settings: {
        lostTargetPipelineId: 'custom_pipe',
        lostTargetStageId: 'custom_entry',
        discardStageId: 'custom_descarte',
      },
    });

    const result = await markDealAsLost('d1', 'morto');

    const updatePayload = mocks.dealUpdate.captured.updateArgs[0];
    expect(updatePayload.stage_id).toBe('custom_descarte');
    expect(updatePayload.pipeline_id).toBeUndefined(); // mesma pipeline
    expect(result._movedTo).toBe('descarte');
  });

  it('config explicita sem discardStageId: deal ja na pipeline alvo NAO muda stage', async () => {
    const mocks = setupMocksWithConfig({
      current: { pipeline_id: 'custom_pipe', stage_id: 'custom_entry' },
      updated: { id: 'd1', title: 'X', status: 'lost', pipeline_id: 'custom_pipe', stage_id: 'custom_entry' },
      settings: {
        lostTargetPipelineId: 'custom_pipe',
        lostTargetStageId: 'custom_entry',
        discardStageId: null, // admin nao configurou descarte
      },
    });

    const result = await markDealAsLost('d1', 'x');

    const updatePayload = mocks.dealUpdate.captured.updateArgs[0];
    // Sem stage de descarte, deal so vira lost no lugar
    expect(updatePayload.pipeline_id).toBeUndefined();
    expect(updatePayload.stage_id).toBeUndefined();
    expect(result._movedTo).toBeNull();
    // Mas o status='lost' continua sendo aplicado
    expect(updatePayload.status).toBe('lost');
  });

  it('config explicita sem lostTargetStageId: deal de outra pipeline NAO move (sem stage de entrada)', async () => {
    const mocks = setupMocksWithConfig({
      current: { pipeline_id: 'pipe_outro', stage_id: 'st_orig' },
      updated: { id: 'd1', title: 'X', status: 'lost', pipeline_id: 'pipe_outro', stage_id: 'st_orig' },
      settings: {
        lostTargetPipelineId: 'custom_pipe',
        lostTargetStageId: null, // admin esqueceu de selecionar stage
        discardStageId: 'custom_descarte',
      },
    });

    const result = await markDealAsLost('d1', 'x');

    const updatePayload = mocks.dealUpdate.captured.updateArgs[0];
    // Sem stage de entrada definido, fica no lugar
    expect(updatePayload.pipeline_id).toBeUndefined();
    expect(updatePayload.stage_id).toBeUndefined();
    expect(result._movedTo).toBeNull();
    expect(updatePayload.status).toBe('lost');
  });
});
