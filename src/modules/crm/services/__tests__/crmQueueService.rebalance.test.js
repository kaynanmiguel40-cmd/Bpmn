import { describe, it, expect, vi, beforeEach } from 'vitest';

/**
 * Alvo: as funcoes NOVAS de crmQueueService que ninguem cobria — o diario do
 * lead (getLeadNotes), o proximo toque da cadencia (getNextActivityForLead), o
 * rebalanceamento da fila (planQueueRebalance) e a reordenacao do Kanban
 * (reorderStageDeals).
 *
 * Como em crmQueueService.filtros.test.js, o mock GRAVA a consulta montada: o
 * que quebra em silencio aqui nao e o codigo estourar, e o recorte errado subir
 * pro banco e a tela mostrar o trabalho errado sem reclamar.
 *
 * NAO cobre: dbToQueueTask, planBatchPostpone, getStageWorkSummary
 * (crmQueueService.test.js) nem getOverdueQueue/getTodayQueue/snoozeActivity/
 * getStalledLeads/getNextStageForDeal (crmQueueService.filtros.test.js).
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
  getLeadNotes,
  getNextActivityForLead,
  planQueueRebalance,
  reorderStageDeals,
} from '../crmQueueService';

beforeEach(() => {
  state.queries = [];
  state.handler = null;
  vi.spyOn(console, 'warn').mockImplementation(() => {});
});

// --- helpers de leitura da consulta gravada -------------------------------
const q = (table, i = 0) => state.queries.filter(r => r.table === table)[i];
const filtro = (rec, op, col = null) => rec.filters.find(f => f.op === op && f.col === col);
const iso = (...args) => new Date(...args).toISOString();

// =========================================================================
describe('getLeadNotes — o diario do lead que veio do campo `notes`', () => {
  it('sem dealId nao consulta nada — lead novo nao tem historico a buscar', async () => {
    await expect(getLeadNotes(null)).resolves.toEqual([]);
    await expect(getLeadNotes(undefined)).resolves.toEqual([]);
    expect(state.queries).toHaveLength(0);
  });

  it('mais recente primeiro, e nota SEM data fica por ultimo', async () => {
    // Historico se le de cima pra baixo do mais novo. A nota sem data (o
    // backfill nao achou data no texto) nao pode encabecar a lista fingindo ser
    // a ultima coisa que aconteceu com o lead — por isso nullsFirst: false.
    state.handler = () => ({ data: [], error: null });
    await getLeadNotes('d1');

    const rec = q('crm_lead_notes');
    const ord = rec.order.find(o => o.col === 'note_date');
    expect(ord.ascending).toBe(false);
    expect(ord.nullsFirst).toBe(false);

    expect(filtro(rec, 'eq', 'deal_id').value).toBe('d1');
    // nota apagada nao volta pro historico.
    expect(filtro(rec, 'is', 'deleted_at').value).toBeNull();
  });

  it('a data DATE nao volta um dia no fuso do Brasil', async () => {
    // `note_date` e DATE puro. Parseado como UTC ("2026-05-27" -> meia-noite
    // UTC), no fuso do Brasil (UTC-3) ele viraria 26/05 21h — a nota apareceria
    // no dia errado, e a consultora confere isso contra a memoria dela.
    state.handler = () => ({
      data: [{ id: 'n1', note_date: '2026-05-27', title: 'Ligação', content: 'atendeu', origin: 'backfill' }],
      error: null,
    });
    const [n] = await getLeadNotes('d1');
    expect(n.date.getDate()).toBe(27);
    expect(n.date.getMonth()).toBe(4); // maio
    expect(n.date.getFullYear()).toBe(2026);
  });

  it('nota sem data vira date null, nao Data Invalida', async () => {
    state.handler = () => ({
      data: [{ id: 'n2', note_date: null, title: null, content: 'sem data', origin: 'manual' }],
      error: null,
    });
    const [n] = await getLeadNotes('d1');
    expect(n.date).toBeNull();
    expect(n.title).toBe(''); // titulo ausente nao vira "null" na tela
    expect(n.content).toBe('sem data');
  });

  it('erro no banco devolve [] — o historico e acessorio, a ficha do lead nao pode quebrar', async () => {
    // Diferente da fila (onde o erro SOBE): aqui o painel de historico e um
    // bloco lateral. Estourar derrubaria a pagina inteira do negocio por causa
    // de um bloco secundario.
    state.handler = () => ({ data: null, error: new Error('sem rede') });
    await expect(getLeadNotes('d1')).resolves.toEqual([]);
  });
});

// =========================================================================
describe('getNextActivityForLead — o proximo toque agendado do lead', () => {
  const after = new Date(2026, 6, 20, 15, 0);

  it('sem deal e sem contato devolve null sem consultar', async () => {
    await expect(getNextActivityForLead({})).resolves.toBeNull();
    await expect(getNextActivityForLead()).resolves.toBeNull();
    expect(state.queries).toHaveLength(0);
  });

  it('so o PROXIMO pendente: pendente, depois de `after`, crescente, um so', async () => {
    // Crescente e limit 1 sao a definicao de "proximo". Descendente devolveria
    // o toque mais distante da cadencia, e a confirmacao pos-conclusao diria a
    // data errada do proximo contato.
    state.handler = () => ({ data: [], error: null });
    await getNextActivityForLead({ dealId: 'd1', after });

    const rec = q('crm_activities');
    expect(filtro(rec, 'eq', 'completed').value).toBe(false);
    expect(filtro(rec, 'is', 'deleted_at').value).toBeNull();
    expect(new Date(filtro(rec, 'gt', 'start_date').value).getTime()).toBe(after.getTime());
    expect(rec.order.find(o => o.col === 'start_date').ascending).toBe(true);
    expect(rec.limit).toBe(1);
    expect(filtro(rec, 'eq', 'deal_id').value).toBe('d1');
  });

  it('com deal E contato casa qualquer um dos dois', async () => {
    // A tarefa da cadencia aponta pro negocio; a que a consultora criou na mao
    // pode ter so o contato. Filtrar so por deal_id esconderia a criada a mao.
    state.handler = () => ({ data: [], error: null });
    await getNextActivityForLead({ dealId: 'd1', contactId: 'c1', after });

    const expr = filtro(q('crm_activities'), 'or').value;
    expect(expr).toContain('deal_id.eq.d1');
    expect(expr).toContain('contact_id.eq.c1');

    // Lead que so tem contato (sem negocio aberto) filtra pelo contato.
    state.queries = [];
    await getNextActivityForLead({ contactId: 'c1', after });
    const rec = q('crm_activities');
    expect(filtro(rec, 'eq', 'contact_id').value).toBe('c1');
    expect(filtro(rec, 'eq', 'deal_id')).toBeUndefined();
  });

  it('lead sem proximo toque devolve null; erro tambem, sem derrubar a tela', async () => {
    state.handler = () => ({ data: [], error: null });
    await expect(getNextActivityForLead({ dealId: 'd1', after })).resolves.toBeNull();

    state.handler = () => ({ data: null, error: new Error('timeout') });
    await expect(getNextActivityForLead({ dealId: 'd1', after })).resolves.toBeNull();
  });
});

// =========================================================================
describe('planQueueRebalance — reorganizar a fila por prioridade', () => {
  const seg = new Date(2026, 6, 20, 8, 0); // segunda, antes do expediente
  const linha = (over = {}) => ({
    id: 'a1', title: 'Ligar', type: 'call', stage_step_id: 'st1',
    start_date: iso(2026, 6, 21, 9, 0), end_date: iso(2026, 6, 21, 9, 30),
    deal_id: 'd1', assigned_to: 'u1', assigned_to_name: null, created_by: 'u1',
    crm_deals: { id: 'd1', title: 'Padaria', priority: 3, position: 100 },
    ...over,
  });

  it('NAO grava nada — o plano e so uma previa pra confirmar', async () => {
    // Rebalancear mexe na agenda inteira da pessoa de uma vez. Gravar antes de
    // ela ver o que muda seria irreversivel na pratica.
    state.handler = () => ({ data: [linha(), linha({ id: 'a2', deal_id: 'd2' })], error: null });
    await planQueueRebalance({ assignee: 'u1' }, seg);
    expect(state.queries.some(r => r.op === 'update')).toBe(false);

    // E so cogita o que esta pendente e nao apagado: rebalancear nao pode
    // ressuscitar tarefa ja concluida pra dentro da agenda.
    const rec = q('crm_activities');
    expect(filtro(rec, 'eq', 'completed').value).toBe(false);
    expect(filtro(rec, 'is', 'deleted_at').value).toBeNull();
    expect(rec.order.find(o => o.col === 'start_date').ascending).toBe(true);
  });

  it('compromisso (reuniao/visita/almoco) NAO e remanejado — a hora foi combinada COM O LEAD', async () => {
    // Contraintuitivo: sao justamente as tarefas mais importantes do dia, e
    // ainda assim ficam paradas. Mover uma reuniao unilateralmente e furar o
    // combinado com o lead; elas viram BLOQUEIO pras outras.
    state.handler = () => ({
      data: [
        linha({ id: 'reuniao', type: 'meeting' }),
        linha({ id: 'visita', type: 'visit' }),
        linha({ id: 'almoco', type: 'lunch' }),
        linha({ id: 'ligacao', type: 'call' }),
      ],
      error: null,
    });
    const r = await planQueueRebalance({ assignee: 'u1' }, seg);

    expect(r.total).toBe(1);   // so a ligacao entra no remanejamento
    expect(r.fixas).toBe(3);
    expect(r.movidas.map(m => m.id)).not.toContain('reuniao');
    expect(r.movidas.map(m => m.id)).not.toContain('visita');
    expect(r.movidas.map(m => m.id)).not.toContain('almoco');
  });

  it('o compromisso ocupa o horario dele: a ligacao sai do slot da reuniao', async () => {
    // Consequencia pratica de virar bloqueio — sem isso o plano marcaria a
    // ligacao em cima da reuniao (ambas caem 9:00 por padrao no `linha`).
    state.handler = () => ({
      data: [
        linha({ id: 'reuniao', type: 'meeting', deal_id: 'd9' }),
        linha({ id: 'ligacao', type: 'call' }),
      ],
      error: null,
    });
    const { movidas } = await planQueueRebalance({ assignee: 'u1' }, seg);
    const lig = movidas.find(m => m.id === 'ligacao');
    expect(lig).toBeTruthy();
    // A reuniao ocupa 9:00-9:30 (bloqueio). A ligacao vai pro 1o slot LIVRE — com o
    // expediente comecando 8:10, isso e antes da reuniao (nao mais "desce" pra depois
    // como quando o dia comecava 9:00). O que importa: nao cai em cima dela.
    const ligMin = lig.start.getHours() * 60 + lig.start.getMinutes();
    expect(ligMin < 9 * 60 || ligMin >= 9 * 60 + 30).toBe(true);
  });

  it('tarefa avulsa (fora do playbook) nao e remanejada', async () => {
    // Sem stage_step_id nao ha cadencia por tras: e algo que a pessoa marcou a
    // mao, e o horario foi escolha dela.
    state.handler = () => ({ data: [linha({ id: 'avulsa', stage_step_id: null })], error: null });
    const r = await planQueueRebalance({ assignee: 'u1' }, seg);
    expect(r.total).toBe(0);
    expect(r.fixas).toBe(1);
    expect(r.movidas).toEqual([]);
  });

  it('`movidas` traz SO o que troca de horario — rebalancear nao e alarme falso', async () => {
    state.handler = () => ({
      data: [
        linha({ id: 'a1', deal_id: 'd1' }),
        linha({ id: 'a2', deal_id: 'd2', start_date: iso(2026, 6, 21, 14, 0), end_date: iso(2026, 6, 21, 14, 30) }),
        linha({ id: 'a3', deal_id: 'd3', start_date: iso(2026, 6, 22, 10, 0), end_date: iso(2026, 6, 22, 10, 30) }),
      ],
      error: null,
    });
    const r = await planQueueRebalance({ assignee: 'u1' }, seg);

    expect(r.movidas.length).toBeLessThanOrEqual(r.total);
    // Nenhuma "movida" pode ter destino igual a origem.
    r.movidas.forEach(m => {
      expect(m.start.getTime()).not.toBe(new Date(m.de).getTime());
      expect(m.titulo).toBe('Ligar');
    });
  });

  it('so mexe na fila de QUEM PEDIU — inclusive quando a cadencia legada nao gravou assigned_to', async () => {
    // Tres jeitos de a tarefa ser "minha": assigned_to, o nome (cadencia
    // antiga gravava so o texto) ou, na falta dos dois, quem criou.
    state.handler = () => ({
      data: [
        linha({ id: 'minha', assigned_to: 'u1' }),
        linha({ id: 'da-outra', assigned_to: 'u2', created_by: 'u2', deal_id: 'd2' }),
        linha({ id: 'por-nome', assigned_to: null, assigned_to_name: 'Lorena', created_by: 'u9', deal_id: 'd3' }),
        linha({ id: 'so-criador', assigned_to: null, assigned_to_name: null, created_by: 'u1', deal_id: 'd4' }),
      ],
      error: null,
    });
    const r = await planQueueRebalance({ assignee: 'u1', assigneeName: 'Lorena' }, seg);
    expect(r.total).toBe(3);
    expect(r.movidas.map(m => m.id)).not.toContain('da-outra');
  });

  it('ninguem com tarefa pendente devolve plano vazio', async () => {
    state.handler = () => ({ data: [], error: null });
    const r = await planQueueRebalance({ assignee: 'u1' }, seg);
    expect(r).toEqual({ total: 0, fixas: 0, movidas: [] });
  });
});

// =========================================================================
describe('reorderStageDeals — a ordem da coluna do Kanban e a PRIORIDADE', () => {
  it('grava 100, 200, 300... na ordem recebida', async () => {
    // O passo de 100 deixa folga pra encaixar um card entre dois depois. Gravar
    // 1,2,3 obrigaria a reescrever a coluna a cada insercao no meio.
    state.handler = () => ({ data: [], error: null });
    await reorderStageDeals('st1', ['d3', 'd1', 'd2']);

    const upds = state.queries.filter(r => r.op === 'update' && r.table === 'crm_deals');
    expect(upds.map(u => u.payload.position)).toEqual([100, 200, 300]);
    expect(upds.map(u => filtro(u, 'eq', 'id').value)).toEqual(['d3', 'd1', 'd2']);
  });

  it('lista vazia ou etapa sem id nao consulta — arrastar e soltar no mesmo lugar nao grava', async () => {
    expect(await reorderStageDeals('st1', [])).toBe(0);
    expect(await reorderStageDeals('st1', null)).toBe(0);
    expect(await reorderStageDeals(null, ['d1'])).toBe(0);
    expect(state.queries).toHaveLength(0);
  });
});
