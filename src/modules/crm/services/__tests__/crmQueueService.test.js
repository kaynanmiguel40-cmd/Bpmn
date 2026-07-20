import { describe, it, expect, vi, beforeEach } from 'vitest';

const state = { rows: [], calls: [] };

vi.mock('../../../../lib/supabase', () => {
  const builder = (table) => {
    const q = { table, _f: {} };
    ['select', 'order', 'limit'].forEach(m => { q[m] = () => q; });
    ['eq', 'lt', 'lte', 'gte', 'gt', 'in', 'is', 'not'].forEach(m => {
      q[m] = (col, v) => { q._f[`${m}:${col}`] = v; return q; };
    });
    q.update = (payload) => { state.calls.push({ op: 'update', table, payload, f: q._f }); return q; };
    q.single = () => Promise.resolve({ data: state.rows[0] || null, error: null });
    q.maybeSingle = () => Promise.resolve({ data: state.rows[0] || null, error: null });
    q.then = (res) => Promise.resolve({ data: state.rows, error: null }).then(res);
    return q;
  };
  return { supabase: { from: (t) => builder(t) } };
});
vi.mock('../../../../contexts/ToastContext', () => ({ toast: vi.fn() }));

import { dbToQueueTask, planBatchPostpone, startOfToday } from '../crmQueueService';
import { WORK_START_HOUR } from '../crmScheduling';

beforeEach(() => { state.rows = []; state.calls = []; });

describe('dbToQueueTask', () => {
  it('resolve nome e telefone do lead na ordem canonica', () => {
    const t = dbToQueueTask({
      id: 'a1', title: 'Ligação', type: 'call', start_date: 'x',
      crm_contacts: { id: 'c1', name: 'João Silva', phone: '11988887777' },
      crm_deals: { id: 'd1', title: 'Padaria do João', contact_phone: '1133334444' },
    });
    // Contato vinculado vence o titulo do negocio...
    expect(t.leadName).toBe('João Silva');
    // ...e o telefone dele vence o digitado no negocio.
    expect(t.phone).toBe('11988887777');
  });

  it('sem contato, cai no negocio', () => {
    const t = dbToQueueTask({
      id: 'a1', title: 'x', crm_deals: { id: 'd1', title: 'Auto Peças Zé', contact_phone: '1133334444' },
    });
    expect(t.leadName).toBe('Auto Peças Zé');
    expect(t.phone).toBe('1133334444');
  });

  it('tarefa avulsa nao inventa lead', () => {
    const t = dbToQueueTask({ id: 'a1', title: 'Comprar café' });
    expect(t.leadName).toBeNull();
    expect(t.phone).toBeNull();
  });
});

describe('startOfToday', () => {
  it('zera a hora — atraso e por DIA, nao por instante', () => {
    const d = startOfToday(new Date(2026, 6, 20, 15, 30));
    expect(d.getHours()).toBe(0);
    expect(d.getDate()).toBe(20);
  });
});

/**
 * O preview do adiar em lote e obrigatorio porque o resultado e
 * contraintuitivo: 18 atrasadas NAO cabem "amanha" (o dia util tem 16 slots de
 * 30min, e parte deles ja esta ocupada). Sem ver isso antes de confirmar, a
 * pessoa adia esperando limpar a fila e so descobre depois que empurrou
 * trabalho pra semana seguinte.
 */
describe('planBatchPostpone', () => {
  const seg = new Date(2026, 6, 20, 10, 0); // segunda-feira

  it('nao grava nada — so devolve o plano', async () => {
    const tasks = [{ id: 'a1' }, { id: 'a2' }];
    await planBatchPostpone(tasks, null, seg);
    expect(state.calls.filter(c => c.op === 'update')).toHaveLength(0);
  });

  it('joga tudo pra AMANHA em diante, nunca pra hoje', async () => {
    const tasks = Array.from({ length: 3 }, (_, i) => ({ id: `a${i}` }));
    const { plano } = await planBatchPostpone(tasks, null, seg);
    expect(plano).toHaveLength(3);
    plano.forEach(p => {
      expect(p.start.getDate()).toBeGreaterThan(20);
      expect(p.start.getHours()).toBeGreaterThanOrEqual(WORK_START_HOUR);
    });
  });

  it('transborda pro dia seguinte quando o dia lota (16 slots uteis)', async () => {
    const tasks = Array.from({ length: 20 }, (_, i) => ({ id: `a${i}` }));
    const { plano, porDia } = await planBatchPostpone(tasks, null, seg);
    expect(plano).toHaveLength(20);
    // Nao cabe tudo num dia — o preview tem que mostrar mais de uma data.
    expect(porDia.length).toBeGreaterThan(1);
    expect(porDia[0].count).toBeLessThanOrEqual(16);
  });

  it('lista vazia devolve plano vazio sem tocar no banco', async () => {
    const r = await planBatchPostpone([], null, seg);
    expect(r.plano).toEqual([]);
    expect(state.calls).toHaveLength(0);
  });
});
