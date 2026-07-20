import { describe, it, expect, vi, beforeEach } from 'vitest';

/**
 * Mock do supabase que GRAVA a consulta montada (filtros, ordem, teto, payload).
 *
 * O teste existente (crmQueueService.test.js) cobre as funcoes puras. Aqui o
 * alvo e o contrario: o que importa e o RECORTE que sobe pro banco, porque uma
 * fila que puxa a linha errada nao quebra — ela so mostra o trabalho errado, em
 * silencio.
 */
const state = { queries: [], handler: null };

vi.mock('../../../../lib/supabase', () => {
  const builder = (table) => {
    const rec = { table, op: 'select', cols: null, filters: [], order: [], limit: null, payload: null };
    state.queries.push(rec);

    const q = {};
    q.select = (cols) => { rec.cols = cols; return q; };
    q.order = (col, opts = {}) => { rec.order.push({ col, ...opts }); return q; };
    q.limit = (n) => { rec.limit = n; return q; };
    ['eq', 'lt', 'lte', 'gte', 'gt', 'in', 'is', 'not'].forEach((m) => {
      q[m] = (col, value) => { rec.filters.push({ op: m, col, value }); return q; };
    });
    // `or` recebe uma expressao unica, nao (coluna, valor) — precisa do proprio
    // slot, senao a cadeia quebra e a query resolve como undefined.
    q.or = (expr) => { rec.filters.push({ op: 'or', col: null, value: expr }); return q; };
    q.update = (payload) => { rec.op = 'update'; rec.payload = payload; return q; };

    const resolve = (mode) => Promise.resolve(
      state.handler ? state.handler(rec, mode) : { data: mode === 'list' ? [] : null, error: null },
    );
    q.single = () => resolve('single');
    q.maybeSingle = () => resolve('single');
    q.then = (res, rej) => resolve('list').then(res, rej);
    return q;
  };
  return { supabase: { from: (t) => builder(t) } };
});
vi.mock('../../../../contexts/ToastContext', () => ({ toast: vi.fn() }));

import {
  getOverdueQueue,
  getTodayQueue,
  snoozeActivity,
  getNextStageForDeal,
  getStalledLeads,
  startOfToday,
  endOfToday,
} from '../crmQueueService';

beforeEach(() => { state.queries = []; state.handler = null; });

// --- helpers de leitura da consulta gravada -------------------------------
const q = (table, i = 0) => state.queries.filter(r => r.table === table)[i];
const filtro = (rec, op, col = null) => rec.filters.find(f => f.op === op && f.col === col);

// =========================================================================
describe('getOverdueQueue — o que conta como divida atrasada', () => {
  it('so puxa DIVIDA: os toques a dar, mais qualquer passo do playbook', async () => {
    // Reuniao/visita SEM passo do playbook sao compromissos com hora marcada:
    // perderam a hora, nao ha o que "recuperar" empurrando pra frente. Mas um
    // passo do playbook e divida mesmo que o titulo ("Reuniao de diagnostico")
    // o classifique como meeting — senao um passo da cadencia sumiria da fila
    // justamente ao atrasar.
    await getOverdueQueue(new Date(2026, 6, 20, 10, 0));
    const expr = filtro(q('crm_activities'), 'or').value;

    ['call', 'message', 'email', 'follow_up', 'task'].forEach(t => expect(expr).toContain(t));
    expect(expr).toContain('stage_step_id.not.is.null');
    // Os tipos de compromisso nao entram pela porta do `type`.
    expect(expr).not.toContain('meeting');
    expect(expr).not.toContain('visit');
    expect(expr).not.toContain('lunch');
  });

  it('atraso e por DIA: a ligacao das 9h nao fica atrasada as 9h01', async () => {
    // O corte e o INICIO de hoje, nao o instante atual. Se fosse por hora, a
    // tarefa das 9h apareceria como atrasada as 9h01 do mesmo dia — e a pessoa
    // comecaria o expediente ja com a fila vermelha.
    const agora = new Date(2026, 6, 20, 15, 30);
    await getOverdueQueue(agora);

    const corte = new Date(filtro(q('crm_activities'), 'lt', 'start_date').value);
    expect(corte.getTime()).toBe(startOfToday(agora).getTime());
    expect(corte.getHours()).toBe(0);
    expect(corte.getMinutes()).toBe(0);

    // e so pendente: o que ja foi feito nao e divida.
    expect(filtro(q('crm_activities'), 'eq', 'completed').value).toBe(false);
    // linha apagada nao volta pra fila.
    expect(filtro(q('crm_activities'), 'is', 'deleted_at').value).toBeNull();
  });

  it('ordena da mais RECENTE pra mais antiga — o toque de ontem ainda e recuperavel', async () => {
    // Contraintuitivo: fila costuma ser FIFO. Aqui nao. Ascendente colocaria o
    // lead mais morto no topo da tela e gastaria o dia com o irrecuperavel.
    await getOverdueQueue(new Date(2026, 6, 20, 10, 0));
    const ord = q('crm_activities').order.find(o => o.col === 'start_date');
    expect(ord.ascending).toBe(false);
  });

  it('tem teto: o lote de atrasadas nao pode vir inteiro', async () => {
    await getOverdueQueue(new Date(2026, 6, 20, 10, 0));
    const rec = q('crm_activities');
    expect(typeof rec.limit).toBe('number');
    expect(rec.limit).toBeGreaterThan(0);
    expect(rec.limit).toBeLessThanOrEqual(200);
  });

  it('erro estoura mas resultado vazio nao — fila vazia e erro sao coisas diferentes', async () => {
    // Devolver [] num erro faria a tela dizer "nada pra fazer hoje" pra quem
    // tem 40 tarefas atrasadas. O erro TEM que subir; o vazio de verdade, nao.
    state.handler = () => ({ data: null, error: new Error('sem rede') });
    await expect(getOverdueQueue(new Date(2026, 6, 20))).rejects.toThrow('sem rede');

    state.handler = () => ({ data: null, error: null });
    await expect(getOverdueQueue(new Date(2026, 6, 20))).resolves.toEqual([]);
  });
});

// =========================================================================
describe('getTodayQueue — o recorte de hoje', () => {
  it('pega o dia INTEIRO: a tarefa das 23h59 ainda e de hoje', async () => {
    const agora = new Date(2026, 6, 20, 9, 0);
    await getTodayQueue(agora);
    const rec = q('crm_activities');

    const de = new Date(filtro(rec, 'gte', 'start_date').value);
    const ate = new Date(filtro(rec, 'lte', 'start_date').value);
    expect(de.getTime()).toBe(startOfToday(agora).getTime());
    expect(ate.getTime()).toBe(endOfToday(agora).getTime());
    // virada de dia: o limite superior fecha no ultimo milissegundo do dia.
    expect(ate.getHours()).toBe(23);
    expect(ate.getMinutes()).toBe(59);
  });

  it('traz as CONCLUIDAS tambem — o que foi feito vira placar do dia', async () => {
    // A fila de atrasadas filtra completed=false; a de hoje nao pode, senao a
    // tarefa some no instante em que recebe o check e o dia parece vazio.
    await getTodayQueue(new Date(2026, 6, 20, 9, 0));
    const rec = q('crm_activities');
    expect(filtro(rec, 'eq', 'completed')).toBeUndefined();
    expect(rec.order.find(o => o.col === 'start_date').ascending).toBe(true);
  });
});

// =========================================================================
describe('snoozeActivity — adiar preserva a duracao', () => {
  const setCur = (cur, updated = { id: 'a1', title: 'Ligar', type: 'call' }) => {
    state.handler = (rec, mode) => {
      if (rec.op === 'update') return { data: { ...updated, ...rec.payload }, error: null };
      if (mode === 'single') return { data: cur, error: null };
      return { data: [], error: null };
    };
  };
  const durDoUpdate = () => {
    const upd = state.queries.find(r => r.op === 'update');
    return new Date(upd.payload.end_date) - new Date(upd.payload.start_date);
  };

  it('tarefa de 30min continua com 30min no destino', async () => {
    setCur({ start_date: '2026-07-20T14:00:00.000Z', end_date: '2026-07-20T14:30:00.000Z' });
    await snoozeActivity('a1', '2026-07-21T12:00:00.000Z');
    expect(durDoUpdate()).toBe(30 * 60000);
  });

  it('tarefa de 2h continua com 2h — adiar nao encolhe o bloco', async () => {
    // Mover so o start_date deixaria o end_date pra tras e a tarefa viraria
    // um bloco de duracao negativa no calendario (que desenha altura por duracao).
    setCur({ start_date: '2026-07-20T09:00:00.000Z', end_date: '2026-07-20T11:00:00.000Z' });
    await snoozeActivity('a1', '2026-07-22T12:00:00.000Z');
    expect(durDoUpdate()).toBe(120 * 60000);

    const upd = state.queries.find(r => r.op === 'update');
    expect(new Date(upd.payload.start_date).toISOString()).toBe('2026-07-22T12:00:00.000Z');
  });

  it('tarefa sem end_date ganha 30min de default', async () => {
    setCur({ start_date: '2026-07-20T14:00:00.000Z', end_date: null });
    await snoozeActivity('a1', '2026-07-21T12:00:00.000Z');
    expect(durDoUpdate()).toBe(30 * 60000);
  });

  it('sem id ou sem data nova devolve null sem tocar no banco', async () => {
    await expect(snoozeActivity(null, '2026-07-21T12:00:00.000Z')).resolves.toBeNull();
    await expect(snoozeActivity('a1', null)).resolves.toBeNull();
    expect(state.queries).toHaveLength(0);
  });
});

// =========================================================================
describe('getNextStageForDeal — quando existe "proxima etapa" pra sugerir', () => {
  const dealAberto = {
    id: 'd1', status: 'open', pipeline_id: 'p1', stage_id: 's2',
    crm_pipeline_stages: { id: 's2', name: 'Qualificado', position: 2, is_win_stage: false },
  };

  it('sem dealId devolve null sem consultar nada', async () => {
    await expect(getNextStageForDeal(null)).resolves.toBeNull();
    expect(state.queries).toHaveLength(0);
  });

  it('lead fechado (ganho ou perdido) nao recebe sugestao de avancar', async () => {
    state.handler = () => ({ data: { ...dealAberto, status: 'won' }, error: null });
    await expect(getNextStageForDeal('d1')).resolves.toBeNull();
    // nem chega a consultar as etapas.
    expect(state.queries.some(r => r.table === 'crm_pipeline_stages')).toBe(false);
  });

  it('lead ja na etapa de GANHO nao tem proxima — vender de novo nao e avancar', async () => {
    state.handler = () => ({
      data: { ...dealAberto, crm_pipeline_stages: { id: 's9', name: 'Ganho', position: 9, is_win_stage: true } },
      error: null,
    });
    await expect(getNextStageForDeal('d1')).resolves.toBeNull();
  });

  it('ultima etapa da pipeline devolve null em vez de estourar', async () => {
    state.handler = (rec, mode) => {
      if (rec.table === 'crm_deals') return { data: dealAberto, error: null };
      return { data: mode === 'single' ? null : [], error: null };
    };
    await expect(getNextStageForDeal('d1')).resolves.toBeNull();
  });

  it('devolve a etapa de MENOR position acima da atual', async () => {
    state.handler = (rec) => {
      if (rec.table === 'crm_deals') return { data: dealAberto, error: null };
      return { data: [{ id: 's3', name: 'Reunião agendada', color: '#f00', position: 3 }], error: null };
    };
    const r = await getNextStageForDeal('d1');
    expect(r.current).toEqual({ id: 's2', name: 'Qualificado' });
    expect(r.next.id).toBe('s3');

    // O recorte e que garante "a proxima": position > atual, crescente, so 1.
    const st = q('crm_pipeline_stages');
    expect(filtro(st, 'gt', 'position').value).toBe(2);
    expect(filtro(st, 'eq', 'pipeline_id').value).toBe('p1');
    expect(st.order.find(o => o.col === 'position').ascending).toBe(true);
    expect(st.limit).toBe(1);
  });
});

// =========================================================================
describe('getStalledLeads — o furo silencioso: lead aberto sem nenhuma tarefa', () => {
  const agora = new Date(2026, 6, 20, 10, 0);
  const deals = [
    { id: 'd1', title: 'Padaria', updated_at: new Date(2026, 6, 18).toISOString(), crm_contacts: { name: 'João' } },
    { id: 'd2', title: 'Auto Peças', updated_at: new Date(2026, 5, 20).toISOString() },
    { id: 'd3', title: 'Mercadinho', updated_at: new Date(2026, 6, 19).toISOString() },
  ];

  it('lead COM tarefa pendente nao esta parado — ele sai da lista', async () => {
    state.handler = (rec) => {
      if (rec.table === 'crm_deals') return { data: deals, error: null };
      return { data: [{ deal_id: 'd1' }], error: null };
    };
    const r = await getStalledLeads(agora);
    expect(r.map(x => x.dealId)).toEqual(['d2', 'd3']);
  });

  it('so olha lead ABERTO e tarefa PENDENTE — ganho/perdido nao esta parado, esta acabado', async () => {
    state.handler = (rec) => (rec.table === 'crm_deals'
      ? { data: deals, error: null }
      : { data: [], error: null });
    await getStalledLeads(agora);

    expect(filtro(q('crm_deals'), 'eq', 'status').value).toBe('open');
    expect(filtro(q('crm_deals'), 'is', 'deleted_at').value).toBeNull();

    const at = q('crm_activities');
    expect(filtro(at, 'eq', 'completed').value).toBe(false);
    expect(filtro(at, 'is', 'deleted_at').value).toBeNull();
    // so as tarefas dos leads que ja vieram — nao varre a base inteira.
    expect(filtro(at, 'in', 'deal_id').value).toEqual(['d1', 'd2', 'd3']);
  });

  it('ordena por dias parado DESCENDENTE — o mais esquecido primeiro', async () => {
    state.handler = (rec) => (rec.table === 'crm_deals'
      ? { data: deals, error: null }
      : { data: [], error: null });
    const r = await getStalledLeads(agora);

    expect(r.map(x => x.dealId)).toEqual(['d2', 'd1', 'd3']);
    expect(r[0].dias).toBeGreaterThan(r[1].dias);
    expect(r[1].dias).toBe(2);
    // nome do lead segue a ordem canonica: contato > titulo do negocio.
    expect(r[1].leadName).toBe('João');
    expect(r[0].leadName).toBe('Auto Peças');
  });

  it('sem lead aberto devolve [] sem ir buscar tarefa nenhuma', async () => {
    state.handler = () => ({ data: [], error: null });
    await expect(getStalledLeads(agora)).resolves.toEqual([]);
    expect(state.queries.some(r => r.table === 'crm_activities')).toBe(false);
  });
});
