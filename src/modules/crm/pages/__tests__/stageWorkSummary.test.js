import { describe, it, expect, vi, beforeEach } from 'vitest';

/**
 * getStageWorkSummary — a CONTA que decide se avançar de etapa pede confirmação.
 * (A mensagem em si já está coberta por avisoDeAvanco.test.js.)
 *
 * A regra de negócio: mover o lead de etapa APAGA as pendentes da etapa
 * anterior. Então a conta precisa separar "trabalho que virou avanço" de
 * "trabalho que só pareceu avanço". Duas coisas provam avanço, e as duas
 * precisam existir juntas:
 *   1. PROGRESSO DO PASSO  → o lead atendeu (houve conversa);
 *   2. DELIVERY_REPORT     → alguém anotou o que o lead disse.
 * Faltando qualquer uma, a tarefa não conta como concluída — ela cai no balde
 * que explica ao vendedor o que ficou faltando.
 */

const db = { steps: [], activities: [], progress: [], errors: {} };
const queries = [];

vi.mock('../../../../lib/supabase', () => {
  const chave = {
    crm_stage_steps: 'steps',
    crm_activities: 'activities',
    crm_deal_step_progress: 'progress',
  };
  const builder = (table) => {
    const q = { table, filters: {} };
    q.select = () => q;
    ['eq', 'in', 'is', 'not', 'lt', 'lte', 'gt', 'gte', 'order', 'limit'].forEach(m => {
      q[m] = (col, v) => { q.filters[`${m}:${col}`] = v; return q; };
    });
    q.then = (res) => {
      queries.push({ table, filters: q.filters });
      const k = chave[table];
      const err = db.errors[k];
      const r = err ? { data: null, error: { message: err } } : { data: db[k], error: null };
      return Promise.resolve(r).then(res);
    };
    return q;
  };
  return { supabase: { from: (t) => builder(t) } };
});

import { getStageWorkSummary } from '../../services/crmQueueService';

beforeEach(() => {
  db.steps = [];
  db.activities = [];
  db.progress = [];
  db.errors = {};
  queries.length = 0;
  vi.spyOn(console, 'warn').mockImplementation(() => {});
});

/** Atalho: etapa com 2 passos no playbook. */
function comPlaybook(ids = ['s1', 's2']) {
  db.steps = ids.map(id => ({ id }));
}

describe('getStageWorkSummary — o que conta como avanço', () => {
  it('tarefa concluída COM conversa e COM registro é a única que conta como concluída', async () => {
    comPlaybook();
    db.activities = [{ id: 'a1', completed: true, delivery_report: 'Pediu proposta até sexta', stage_step_id: 's1' }];
    db.progress = [{ step_id: 's1' }];

    const r = await getStageWorkSummary('d1', 'e1');
    expect(r).toMatchObject({ concluidas: 1, pendentes: 0, semContato: 0, semRegistro: 0, semPlaybook: false });
  });

  // Contraintuitivo de propósito: a tarefa ESTÁ marcada como concluída, mas sem
  // progresso do passo ninguém falou com o lead — foi discada, não atendida.
  // Nem um delivery_report preenchido ("ninguém atendeu") salva: quem prova a
  // conversa é o progresso, não o texto.
  it('concluída sem progresso do passo é "não atendeu", não avanço', async () => {
    comPlaybook();
    db.activities = [{ id: 'a1', completed: true, delivery_report: 'Ninguém atendeu', stage_step_id: 's1' }];
    db.progress = [];

    const r = await getStageWorkSummary('d1', 'e1');
    expect(r).toMatchObject({ concluidas: 0, semContato: 1, semRegistro: 0 });
  });

  it('concluída com conversa mas sem registro cai em semRegistro — fechada no automático', async () => {
    comPlaybook();
    db.activities = [{ id: 'a1', completed: true, delivery_report: null, stage_step_id: 's1' }];
    db.progress = [{ step_id: 's1' }];

    const r = await getStageWorkSummary('d1', 'e1');
    expect(r).toMatchObject({ concluidas: 0, semContato: 0, semRegistro: 1 });
  });

  // Registro em branco é o mesmo que registro nenhum: o campo existir não conta.
  it('registro só com espaços em branco não vale como registro', async () => {
    comPlaybook();
    db.activities = [
      { id: 'a1', completed: true, delivery_report: '   ', stage_step_id: 's1' },
      { id: 'a2', completed: true, delivery_report: '', stage_step_id: 's1' },
    ];
    db.progress = [{ step_id: 's1' }];

    const r = await getStageWorkSummary('d1', 'e1');
    expect(r).toMatchObject({ concluidas: 0, semRegistro: 2 });
  });

  it('tarefa não concluída é pendente, mesmo que já tenha registro e conversa', async () => {
    comPlaybook();
    db.activities = [{ id: 'a1', completed: false, delivery_report: 'Falei com ele', stage_step_id: 's1' }];
    db.progress = [{ step_id: 's1' }];

    const r = await getStageWorkSummary('d1', 'e1');
    expect(r).toMatchObject({ concluidas: 0, pendentes: 1, semContato: 0, semRegistro: 0 });
  });

  // O progresso é POR PASSO. Ter conversado no passo 1 não valida a tarefa do
  // passo 2 — senão um único atendimento carimbaria a etapa inteira.
  it('progresso de outro passo não credita a tarefa deste passo', async () => {
    comPlaybook();
    db.activities = [{ id: 'a1', completed: true, delivery_report: 'ok', stage_step_id: 's2' }];
    db.progress = [{ step_id: 's1' }];

    const r = await getStageWorkSummary('d1', 'e1');
    expect(r).toMatchObject({ concluidas: 0, semContato: 1 });
  });

  it('cada tarefa entra em um balde só — os quatro somam o total', async () => {
    comPlaybook();
    db.activities = [
      { id: 'a1', completed: true, delivery_report: 'Falou que vai avaliar', stage_step_id: 's1' },
      { id: 'a2', completed: true, delivery_report: 'Pediu retorno', stage_step_id: 's1' },
      { id: 'a3', completed: true, delivery_report: 'x', stage_step_id: 's2' },   // sem progresso em s2
      { id: 'a4', completed: true, delivery_report: null, stage_step_id: 's1' },
      { id: 'a5', completed: false, delivery_report: null, stage_step_id: 's2' },
    ];
    db.progress = [{ step_id: 's1' }];

    const r = await getStageWorkSummary('d1', 'e1');
    expect(r).toMatchObject({ concluidas: 2, semContato: 1, semRegistro: 1, pendentes: 1 });
    expect(r.concluidas + r.semContato + r.semRegistro + r.pendentes).toBe(db.activities.length);
  });
});

describe('getStageWorkSummary — caminhos tristes', () => {
  it('etapa sem playbook devolve semPlaybook e não cobra nada', async () => {
    db.steps = [];

    const r = await getStageWorkSummary('d1', 'e1');
    expect(r).toMatchObject({ semPlaybook: true, concluidas: 0, pendentes: 0, semContato: 0, semRegistro: 0 });
    // Sem passos não há o que cobrar: nem chega a consultar atividades.
    expect(queries.map(q => q.table)).toEqual(['crm_stage_steps']);
  });

  it('etapa com playbook mas sem nenhuma tarefa continua cobrável (semPlaybook falso)', async () => {
    comPlaybook();
    db.activities = [];

    const r = await getStageWorkSummary('d1', 'e1');
    // Zero em tudo com semPlaybook=false é justamente o caso do aviso
    // "Nenhuma tarefa desta etapa foi concluída".
    expect(r).toEqual({ concluidas: 0, pendentes: 0, semContato: 0, semRegistro: 0, semPlaybook: false });
  });

  it('sem dealId não consulta o banco', async () => {
    const r = await getStageWorkSummary(null, 'e1');
    expect(queries).toHaveLength(0);
    expect(r).toEqual({ concluidas: 0, pendentes: 0, semContato: 0, semRegistro: 0 });
  });

  it('sem stageId não consulta o banco', async () => {
    const r = await getStageWorkSummary('d1', undefined);
    expect(queries).toHaveLength(0);
    expect(r).toEqual({ concluidas: 0, pendentes: 0, semContato: 0, semRegistro: 0 });
  });

  // Falha de leitura não pode virar "não fez nada": devolve zeros SEM
  // semPlaybook, e quem monta o aviso decide o que fazer com isso.
  it('erro ao ler os passos aborta a conta e não consulta atividades', async () => {
    db.errors.steps = 'timeout';

    const r = await getStageWorkSummary('d1', 'e1');
    expect(r).toEqual({ concluidas: 0, pendentes: 0, semContato: 0, semRegistro: 0 });
    expect(queries.map(q => q.table)).toEqual(['crm_stage_steps']);
  });

  it('erro ao ler as atividades devolve zeros em vez de contagem parcial', async () => {
    comPlaybook();
    db.errors.activities = 'falha de rede';
    db.progress = [{ step_id: 's1' }];

    const r = await getStageWorkSummary('d1', 'e1');
    expect(r).toEqual({ concluidas: 0, pendentes: 0, semContato: 0, semRegistro: 0 });
    expect(r.semPlaybook).toBeUndefined();
  });

  // BUG: o erro da consulta de progresso não é verificado. Com o banco fora,
  // `progresso.data` vem null, o Set de contatos fica vazio e TODA tarefa
  // concluída é reclassificada como "ninguém atendeu" — o aviso mente pro
  // vendedor que ligou e falou com o lead. Deveria devolver zeros, como o erro
  // das atividades faz.
  it('erro ao ler o progresso não pode transformar concluídas em "não atendeu"', async () => {
    comPlaybook();
    db.activities = [{ id: 'a1', completed: true, delivery_report: 'Falei com ele', stage_step_id: 's1' }];
    db.errors.progress = 'falha de rede';

    const r = await getStageWorkSummary('d1', 'e1');
    expect(r).toEqual({ concluidas: 0, pendentes: 0, semContato: 0, semRegistro: 0 });
  });
});

describe('getStageWorkSummary — recorte da consulta', () => {
  it('conta só as tarefas deste negócio, desta etapa, e ignora as apagadas', async () => {
    comPlaybook(['s1', 's2']);
    db.activities = [];

    await getStageWorkSummary('d1', 'e1');
    const atividades = queries.find(q => q.table === 'crm_activities');
    expect(atividades.filters['eq:deal_id']).toBe('d1');
    expect(atividades.filters['in:stage_step_id']).toEqual(['s1', 's2']);
    // Tarefa apagada não é trabalho feito nem trabalho pendente.
    expect(atividades.filters['is:deleted_at']).toBeNull();
  });

  it('o progresso é lido do mesmo negócio e dos mesmos passos', async () => {
    comPlaybook(['s1', 's2']);

    await getStageWorkSummary('d9', 'e1');
    const prog = queries.find(q => q.table === 'crm_deal_step_progress');
    expect(prog.filters['eq:deal_id']).toBe('d9');
    expect(prog.filters['in:step_id']).toEqual(['s1', 's2']);
  });
});
