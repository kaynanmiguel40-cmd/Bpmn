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
// Precisa resolver uma Promise: o moveDealToStage encadeia `.catch()` no retorno
// (fire-and-forget). Um vi.fn() cru devolve undefined e estoura ali.
vi.mock('../crmAutomationsService', () => ({
  triggerAutomationsForDeal: vi.fn().mockResolvedValue(undefined),
}));
vi.mock('../../schemas/crmValidation', () => ({ crmDealSchema: {} }));
// A cadencia e efeito colateral de markDealAsLost, nao o que esta sob teste —
// mas E parte do contrato (perdido sai da fila; resgatavel entra na cadencia de
// nutricao), entao fica mockada pra poder ser verificada sem tocar no supabase.
vi.mock('../crmPlaybookService', () => ({
  scheduleStepsForDeal: vi.fn().mockResolvedValue(0),
  cancelPendingStepsForDeal: vi.fn().mockResolvedValue(0),
}));

import { dbToCrmDeal, markDealAsLost, moveDealToStage } from '../crmDealsService';
import { scheduleStepsForDeal, cancelPendingStepsForDeal } from '../crmPlaybookService';
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
  // mockReset e nao mockClear: `mockRejectedValueOnce` armado num teste sobrevive
  // ao clear e vaza pro proximo que chamar o mock.
  vi.mocked(scheduleStepsForDeal).mockReset().mockResolvedValue(0);
  vi.mocked(cancelPendingStepsForDeal).mockReset().mockResolvedValue(0);
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
    // objetivo/exitCriteria: playbook da etapa (080). Sem as colunas no join,
    // normalizam pra string vazia em vez de undefined.
    expect(result.stage).toEqual({ id: 's1', name: 'Proposta', color: '#f00', objetivo: '', exitCriteria: '' });
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
//
// O ROTEAMENTO MUDOU (migration 083). Antes, todo perdido caia na "Triagem" da
// Nurturing como `lost` e so virava trabalho se alguem arrastasse — na pratica
// ninguem arrastava, e a Triagem virou um deposito. Hoje quem decide e a
// pergunta "da pra resgatar?" feita no modal de perda:
//
//   resgatavel === true  -> "Em Nutricao", REABERTO (status 'open'), com a
//                           cadencia de nutricao agendada. E trabalho de novo.
//   qualquer outro valor -> "Descarte": perdido, parado, sem cadencia.
//
// O destino e sempre a pipeline "Nurturing" (achada por nome). Sem ela, o deal
// so vira `lost` onde esta. A config por localStorage que existia aqui
// (lostTargetPipelineId/discardStageId) foi REMOVIDA de proposito: era regra de
// negocio POR DISPOSITIVO — o mesmo lead ia pra lugares diferentes dependendo do
// navegador de quem clicou.
// ─────────────────────────────────────────────────────────────────────────────

describe('markDealAsLost', () => {
  const NURTURING_ID = 'pipe_nurt';
  const NURTURING_STAGES = [
    { id: 'st_nutricao', name: 'Em Nutricao', position: 1 },
    { id: 'st_react30',  name: 'Reativacao D30', position: 2 },
    { id: 'st_reativou', name: 'Reativou', position: 3 },
    { id: 'st_descarte', name: 'Descarte', position: 4 },
  ];

  /**
   * Sequencia de `from()` que markDealAsLost faz:
   *   1) SELECT crm_deals            (pipeline_id, stage_id atuais)
   *   2) SELECT crm_pipelines        (Nurturing + etapas)
   *   3) UPDATE crm_deals            (resultado final)
   *   4) INSERT crm_deal_stage_history (so quando a etapa muda de fato)
   */
  function setupMocks({ current, nurturing, updated }) {
    const dealSelect = makeChain({ data: current, error: null });
    const nurturingSelect = makeChain({ data: nurturing, error: null });
    const dealUpdate = makeChain({ data: updated, error: null });
    const historyInsert = makeChain({ data: null, error: null });

    supabase.from
      .mockImplementationOnce((t) => { dealSelect.captured.table = t; return dealSelect.chain; })
      .mockImplementationOnce((t) => { nurturingSelect.captured.table = t; return nurturingSelect.chain; })
      .mockImplementationOnce((t) => { dealUpdate.captured.table = t; return dealUpdate.chain; })
      .mockImplementationOnce((t) => { historyInsert.captured.table = t; return historyInsert.chain; });

    return { dealSelect, nurturingSelect, dealUpdate, historyInsert };
  }

  const nurturingOk = { id: NURTURING_ID, crm_pipeline_stages: NURTURING_STAGES };

  // ─── Resgatavel: volta a ser trabalho ──────────────────────────────────────

  it('resgatavel vai pra "Em Nutricao" REABERTO — nao fica como perdido', async () => {
    const mocks = setupMocks({
      current: { pipeline_id: 'pipe_geral', stage_id: 'st_negociacao' },
      nurturing: nurturingOk,
      updated: {
        id: 'd1', title: 'Deal X', status: 'open',
        pipeline_id: NURTURING_ID, stage_id: 'st_nutricao', lost_reason: 'sem orcamento agora',
      },
    });

    const result = await markDealAsLost('d1', 'sem orcamento agora', true);

    const updatePayload = mocks.dealUpdate.captured.updateArgs[0];
    // ABERTO: a cadencia de nutricao so roda em deal aberto. Marcar `lost` aqui
    // deixaria o lead na etapa certa sem nunca mais ser tocado.
    expect(updatePayload.status).toBe('open');
    expect(updatePayload.probability).toBe(10);
    expect(updatePayload.closed_at).toBeNull();
    expect(updatePayload.lost_reason).toBe('sem orcamento agora');
    expect(updatePayload.pipeline_id).toBe(NURTURING_ID);
    expect(updatePayload.stage_id).toBe('st_nutricao');
    expect(result._movedTo).toBe('nurturing');
  });

  it('resgatavel troca a cadencia: cancela a antiga e agenda a de nutricao', async () => {
    setupMocks({
      current: { pipeline_id: 'pipe_geral', stage_id: 'st_neg' },
      nurturing: nurturingOk,
      updated: { id: 'd1', title: 'X', status: 'open', pipeline_id: NURTURING_ID, stage_id: 'st_nutricao' },
    });

    await markDealAsLost('d1', 'x', true);

    expect(cancelPendingStepsForDeal).toHaveBeenCalledWith('d1');
    expect(scheduleStepsForDeal).toHaveBeenCalledWith('d1', 'st_nutricao');
  });

  it('acha "Em Nutricao" pelo NOME, nao pela posicao (resiliente a reordenacao)', async () => {
    const embaralhadas = [
      { id: 'st_descarte', name: 'Descarte', position: 1 },
      { id: 'st_react90',  name: 'Reativacao D90', position: 2 },
      { id: 'st_nutricao', name: 'Em Nutricao', position: 9 },
    ];
    const mocks = setupMocks({
      current: { pipeline_id: 'pipe_geral', stage_id: 's1' },
      nurturing: { id: NURTURING_ID, crm_pipeline_stages: embaralhadas },
      updated: { id: 'd1', title: 'X', status: 'open', pipeline_id: NURTURING_ID, stage_id: 'st_nutricao' },
    });

    await markDealAsLost('d1', 'x', true);

    expect(mocks.dealUpdate.captured.updateArgs[0].stage_id).toBe('st_nutricao');
  });

  // ─── Nao resgatavel: descarte ──────────────────────────────────────────────

  it('NAO resgatavel vai pra "Descarte" como perdido de vez', async () => {
    const mocks = setupMocks({
      current: { pipeline_id: 'pipe_geral', stage_id: 'st_neg' },
      nurturing: nurturingOk,
      updated: {
        id: 'd1', title: 'X', status: 'lost',
        pipeline_id: NURTURING_ID, stage_id: 'st_descarte', lost_reason: 'fora do ICP',
      },
    });

    const result = await markDealAsLost('d1', 'fora do ICP', false);

    const updatePayload = mocks.dealUpdate.captured.updateArgs[0];
    expect(updatePayload.status).toBe('lost');
    expect(updatePayload.probability).toBe(0);
    expect(updatePayload.closed_at).toBeTruthy();
    expect(updatePayload.stage_id).toBe('st_descarte');
    expect(result._movedTo).toBe('descarte');
  });

  it('sem responder "resgatavel?" (null) o destino e o Descarte, nao a Nutricao', async () => {
    // O default e conservador: entrar na cadencia de nutricao sem alguem ter
    // dito que vale a pena e voltar a ligar pra quem ja disse nao.
    const mocks = setupMocks({
      current: { pipeline_id: 'pipe_geral', stage_id: 'st_neg' },
      nurturing: nurturingOk,
      updated: { id: 'd1', title: 'X', status: 'lost', pipeline_id: NURTURING_ID, stage_id: 'st_descarte' },
    });

    const result = await markDealAsLost('d1', 'nao quis');

    expect(mocks.dealUpdate.captured.updateArgs[0].stage_id).toBe('st_descarte');
    expect(result._movedTo).toBe('descarte');
  });

  it('descartado sai da fila e NAO recebe cadencia nova', async () => {
    setupMocks({
      current: { pipeline_id: 'pipe_geral', stage_id: 'st_neg' },
      nurturing: nurturingOk,
      updated: { id: 'd1', title: 'X', status: 'lost', pipeline_id: NURTURING_ID, stage_id: 'st_descarte' },
    });

    await markDealAsLost('d1', 'x', false);

    expect(cancelPendingStepsForDeal).toHaveBeenCalledWith('d1');
    expect(scheduleStepsForDeal).not.toHaveBeenCalled();
  });

  it('deal que JA estava na Nurturing nao reescreve pipeline_id', async () => {
    const mocks = setupMocks({
      current: { pipeline_id: NURTURING_ID, stage_id: 'st_react30' },
      nurturing: nurturingOk,
      updated: { id: 'd1', title: 'X', status: 'lost', pipeline_id: NURTURING_ID, stage_id: 'st_descarte' },
    });

    await markDealAsLost('d1', 'reincidencia', false);

    const updatePayload = mocks.dealUpdate.captured.updateArgs[0];
    expect(updatePayload.pipeline_id).toBeUndefined();
    expect(updatePayload.stage_id).toBe('st_descarte');
  });

  // ─── Historico de etapa ────────────────────────────────────────────────────

  it('grava a transicao com o pipeline_id de DESTINO, nao o de origem', async () => {
    const mocks = setupMocks({
      current: { pipeline_id: 'pipe_origem', stage_id: 'st_origem' },
      nurturing: nurturingOk,
      updated: { id: 'd1', title: 'X', status: 'lost', pipeline_id: NURTURING_ID, stage_id: 'st_descarte' },
    });

    await markDealAsLost('d1', 'x', false);

    const historyRow = mocks.historyInsert.captured.insertArgs[0];
    expect(historyRow.deal_id).toBe('d1');
    expect(historyRow.from_stage_id).toBe('st_origem');
    expect(historyRow.to_stage_id).toBe('st_descarte');
    expect(historyRow.pipeline_id).toBe(NURTURING_ID);
  });

  it('nao grava historico quando o deal ja esta na etapa de destino (idempotente)', async () => {
    const mocks = setupMocks({
      current: { pipeline_id: NURTURING_ID, stage_id: 'st_descarte' },
      nurturing: nurturingOk,
      updated: { id: 'd1', title: 'X', status: 'lost', pipeline_id: NURTURING_ID, stage_id: 'st_descarte' },
    });

    await markDealAsLost('d1', 'de novo', false);

    expect(mocks.historyInsert.chain.insert).not.toHaveBeenCalled();
  });

  // ─── Degradacao e erro ─────────────────────────────────────────────────────

  it('sem a pipeline Nurturing, o deal so vira perdido onde esta', async () => {
    const mocks = setupMocks({
      current: { pipeline_id: 'pipe_geral', stage_id: 'st_neg' },
      nurturing: null,
      updated: { id: 'd1', title: 'X', status: 'lost', pipeline_id: 'pipe_geral', stage_id: 'st_neg' },
    });

    const result = await markDealAsLost('d1', 'sem dinheiro', true);

    const updatePayload = mocks.dealUpdate.captured.updateArgs[0];
    expect(updatePayload.pipeline_id).toBeUndefined();
    expect(updatePayload.stage_id).toBeUndefined();
    expect(updatePayload.status).toBe('lost');
    expect(updatePayload.probability).toBe(0);
    expect(updatePayload.lost_reason).toBe('sem dinheiro');
    expect(mocks.historyInsert.chain.insert).not.toHaveBeenCalled();
    expect(result._movedTo).toBeNull();
  });

  it('aceita reason vazio (default)', async () => {
    const mocks = setupMocks({
      current: { pipeline_id: 'pipe_geral', stage_id: 's1' },
      nurturing: nurturingOk,
      updated: { id: 'd1', title: 'X', status: 'lost', pipeline_id: NURTURING_ID, stage_id: 'st_descarte' },
    });

    await markDealAsLost('d1');

    expect(mocks.dealUpdate.captured.updateArgs[0].lost_reason).toBe('');
  });

  it('throw Error quando o update falha', async () => {
    const dealSelect = makeChain({ data: { pipeline_id: 'p', stage_id: 's' }, error: null });
    const nurturingSelect = makeChain({ data: null, error: null });
    const dealUpdate = makeChain({ data: null, error: { message: 'permission denied' } });

    supabase.from
      .mockImplementationOnce(() => dealSelect.chain)
      .mockImplementationOnce(() => nurturingSelect.chain)
      .mockImplementationOnce(() => dealUpdate.chain);

    await expect(markDealAsLost('d1', 'x')).rejects.toThrow('permission denied');
    // A cadencia so e mexida DEPOIS do update dar certo: cancelar os toques de um
    // deal que continua aberto o deixaria vivo na pipeline e mudo na agenda.
    expect(cancelPendingStepsForDeal).not.toHaveBeenCalled();
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// moveDealToStage — a ORDEM entre criar a cadência nova e apagar a antiga.
//
// Regressão do bug da Maria José (08/08): o lead foi movido pra Cadência, a
// cadência da etapa anterior foi apagada e a da nova nunca nasceu — 2 dias em
// branco, sem erro em lugar nenhum. As duas operações rodavam soltas e em
// paralelo; a destrutiva é curta e chegava, a construtiva é longa e se perdia.
// ─────────────────────────────────────────────────────────────────────────────

describe('moveDealToStage — cadência da etapa nova antes da antiga', () => {
  function setupMove() {
    const dealSelect = makeChain({ data: { stage_id: 'st_leads', pipeline_id: 'p1', status: 'open' }, error: null });
    const stageSelect = makeChain({ data: { is_win_stage: false, name: 'Cadencia' }, error: null });
    const dealUpdate = makeChain({ data: { id: 'd1', title: 'Maria José', stage_id: 'st_cad' }, error: null });
    const historyInsert = makeChain({ data: null, error: null });

    supabase.from
      .mockImplementationOnce(() => dealSelect.chain)
      .mockImplementationOnce(() => stageSelect.chain)
      .mockImplementationOnce(() => dealUpdate.chain)
      .mockImplementationOnce(() => historyInsert.chain);

    return { dealUpdate };
  }

  it('agenda a cadencia da etapa NOVA antes de cancelar a da ANTIGA', async () => {
    setupMove();

    await moveDealToStage('d1', 'st_cad');

    expect(scheduleStepsForDeal).toHaveBeenCalledWith('d1', 'st_cad');
    expect(cancelPendingStepsForDeal).toHaveBeenCalledWith('d1', 'st_leads');
    // A ordem E o conserto: construtivo primeiro, destrutivo depois.
    const agendou = vi.mocked(scheduleStepsForDeal).mock.invocationCallOrder[0];
    const cancelou = vi.mocked(cancelPendingStepsForDeal).mock.invocationCallOrder[0];
    expect(agendou).toBeLessThan(cancelou);
  });

  it('se o agendamento falha, a cadencia antiga NAO e cancelada', async () => {
    // O lead fica com a cadência da etapa anterior — fora de contexto, mas
    // visível. Sem tarefa nenhuma ele some da fila e ninguém descobre.
    setupMove();
    vi.mocked(scheduleStepsForDeal).mockRejectedValueOnce(new Error('insert falhou'));

    await moveDealToStage('d1', 'st_cad');

    expect(cancelPendingStepsForDeal).not.toHaveBeenCalled();
  });

  it('falha no agendamento nao derruba o move — o lead muda de etapa mesmo assim', async () => {
    setupMove();
    vi.mocked(scheduleStepsForDeal).mockRejectedValueOnce(new Error('sem rede'));

    const result = await moveDealToStage('d1', 'st_cad');

    expect(result).not.toBeNull();
    expect(result.id).toBe('d1');
  });
});
