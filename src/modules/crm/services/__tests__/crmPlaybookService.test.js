import { describe, it, expect, vi, beforeEach } from 'vitest';

const state = { steps: [], progress: [], calls: [] };

vi.mock('../../../../lib/supabase', () => {
  const builder = (table) => {
    const q = { table, _filters: {} };
    q.select = () => q;
    q.eq = (col, val) => { q._filters[col] = val; return q; };
    q.in = (col, vals) => { q._filters[col] = vals; return q; };
    q.order = () => q;
    q.insert = (payload) => {
      state.calls.push({ op: 'insert', table, payload });
      if (table === 'crm_deal_step_progress' &&
          state.progress.some(p => p.deal_id === payload.deal_id && p.step_id === payload.step_id)) {
        return Promise.resolve({ data: null, error: { code: '23505', message: 'duplicate key' } });
      }
      return Promise.resolve({ data: null, error: null });
    };
    q.update = (payload) => { state.calls.push({ op: 'update', table, payload, filters: q._filters }); return q; };
    q.delete = () => { state.calls.push({ op: 'delete', table, filters: q._filters }); return q; };

    // Resolve como promise no final da cadeia.
    q.then = (resolve) => {
      let data = [];
      if (table === 'crm_stage_steps') data = state.steps;
      if (table === 'crm_deal_step_progress') data = state.progress;
      if (table === 'crm_pipeline_stages') data = [{ id: 'st-1' }];
      return Promise.resolve({ data, error: null }).then(resolve);
    };
    return q;
  };
  return { supabase: { from: (table) => builder(table) } };
});

vi.mock('../../../../contexts/ToastContext', () => ({ toast: vi.fn() }));

import { saveStageSteps, toggleDealStep, dbToStep } from '../crmPlaybookService';

beforeEach(() => { state.steps = []; state.progress = []; state.calls = []; });

describe('dbToStep', () => {
  it('normaliza script nulo pra string vazia', () => {
    expect(dbToStep({ id: 'a', stage_id: 's', position: 2, title: 'X', script: null }))
      .toEqual({ id: 'a', stageId: 's', position: 2, title: 'X', script: '', sourceTag: null, scenarios: [] });
  });
});

describe('saveStageSteps — reconciliacao', () => {
  it('passo com id vira UPDATE (preserva o checklist dos leads)', async () => {
    state.steps = [{ id: 'p1' }];
    await saveStageSteps('st-1', [{ id: 'p1', title: 'Ligacao 1', script: 'Oi' }]);

    const updates = state.calls.filter(c => c.op === 'update' && c.table === 'crm_stage_steps');
    const inserts = state.calls.filter(c => c.op === 'insert' && c.table === 'crm_stage_steps');
    const deletes = state.calls.filter(c => c.op === 'delete' && c.table === 'crm_stage_steps');
    // Recriar geraria id novo e todo lead apareceria como se nada tivesse sido feito.
    expect(updates).toHaveLength(1);
    expect(inserts).toHaveLength(0);
    expect(deletes).toHaveLength(0);
  });

  it('passo sem id vira INSERT', async () => {
    state.steps = [];
    await saveStageSteps('st-1', [{ title: 'Novo passo' }]);
    const inserts = state.calls.filter(c => c.op === 'insert' && c.table === 'crm_stage_steps');
    expect(inserts).toHaveLength(1);
    expect(inserts[0].payload).toMatchObject({ stage_id: 'st-1', title: 'Novo passo', position: 0 });
  });

  it('passo que sumiu da lista vira DELETE', async () => {
    state.steps = [{ id: 'p1' }, { id: 'p2' }];
    await saveStageSteps('st-1', [{ id: 'p1', title: 'Fica' }]);
    const deletes = state.calls.filter(c => c.op === 'delete' && c.table === 'crm_stage_steps');
    expect(deletes).toHaveLength(1);
    expect(deletes[0].filters.id).toBe('p2');
  });

  it('grava position pela ordem da lista (reordenar persiste)', async () => {
    state.steps = [{ id: 'p1' }, { id: 'p2' }];
    await saveStageSteps('st-1', [{ id: 'p2', title: 'B' }, { id: 'p1', title: 'A' }]);
    const updates = state.calls.filter(c => c.op === 'update' && c.table === 'crm_stage_steps');
    expect(updates[0].payload.position).toBe(0);
    expect(updates[0].filters.id).toBe('p2');
    expect(updates[1].payload.position).toBe(1);
    expect(updates[1].filters.id).toBe('p1');
  });

  it('script vazio vira null (nao string vazia)', async () => {
    await saveStageSteps('st-1', [{ title: 'X', script: '   ' }]);
    const ins = state.calls.find(c => c.op === 'insert');
    expect(ins.payload.script).toBeNull();
  });

  it('titulo vazio nao derruba o save — vira "Passo"', async () => {
    await saveStageSteps('st-1', [{ title: '  ' }]);
    const ins = state.calls.find(c => c.op === 'insert');
    expect(ins.payload.title).toBe('Passo');
  });
});

describe('toggleDealStep', () => {
  it('marcar insere o progresso', async () => {
    const r = await toggleDealStep('d1', 'p1', true, 'm1');
    expect(r).toBe(true);
    const ins = state.calls.find(c => c.op === 'insert' && c.table === 'crm_deal_step_progress');
    expect(ins.payload).toMatchObject({ deal_id: 'd1', step_id: 'p1', done_by: 'm1' });
  });

  it('desmarcar apaga filtrando por deal E passo', async () => {
    const r = await toggleDealStep('d1', 'p1', false);
    expect(r).toBe(true);
    const del = state.calls.find(c => c.op === 'delete' && c.table === 'crm_deal_step_progress');
    // Sem o filtro de step_id, desmarcar um passo limparia o checklist inteiro do lead.
    expect(del.filters).toEqual({ deal_id: 'd1', step_id: 'p1' });
  });

  it('clique duplo (unique_violation) conta como sucesso', async () => {
    state.progress = [{ deal_id: 'd1', step_id: 'p1' }];
    // 23505 significa que o passo JA esta marcado — o estado final e o desejado.
    await expect(toggleDealStep('d1', 'p1', true)).resolves.toBe(true);
  });

  it('sem dealId ou stepId nao toca no banco', async () => {
    expect(await toggleDealStep(null, 'p1', true)).toBeNull();
    expect(await toggleDealStep('d1', null, true)).toBeNull();
    expect(state.calls).toHaveLength(0);
  });
});
