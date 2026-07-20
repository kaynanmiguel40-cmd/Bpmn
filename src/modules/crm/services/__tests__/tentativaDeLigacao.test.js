import { describe, it, expect, vi, beforeEach } from 'vitest';

const capturado = { insert: null, tabelas: [], updates: [] };

vi.mock('../../../../lib/supabase', () => {
  const chain = (tabela) => ({
    insert(payload) {
      capturado.insert = payload;
      capturado.tabelas.push(tabela);
      return {
        select: () => ({ single: () => Promise.resolve({ data: { id: 'call-1', started_at: 'x' }, error: null }) }),
      };
    },
    update(payload) {
      capturado.updates.push({ tabela, payload });
      return { eq: () => Promise.resolve({ error: null }) };
    },
    select() {
      return {
        eq: () => ({ is: () => Promise.resolve({ count: 3, error: null }) }),
      };
    },
  });
  return {
    supabase: {
      auth: { getSession: () => Promise.resolve({ data: { session: { user: { id: 'u1' } } } }) },
      from: (t) => chain(t),
    },
  };
});

import { registrarTentativaDeLigacao, contarTentativas } from '../crmCallsService';

beforeEach(() => { capturado.insert = null; capturado.tabelas = []; capturado.updates = []; });

/**
 * Até aqui a contagem de tentativas era auto-declarada: saía do que a vendedora
 * lembrava de marcar depois. O toque no botão é o único instante em que o
 * sistema tem certeza de que uma ligação foi iniciada.
 */
describe('registrarTentativaDeLigacao', () => {
  it('grava a tentativa em crm_calls com o canal do aparelho', async () => {
    await registrarTentativaDeLigacao({ contactId: 'c1', dealId: 'd1', activityId: 'a1', phone: '11999998888' });
    expect(capturado.tabelas).toContain('crm_calls');
    expect(capturado.insert).toMatchObject({
      contact_id: 'c1',
      deal_id: 'd1',
      activity_id: 'a1',
      phone_dialed: '11999998888',
      direction: 'outbound',
      channel: 'device',
    });
  });

  /**
   * A regra que separa isto de createCrmCall. O passo da cadência manda "3
   * TENTATIVAS SEGUIDAS" — concluir no primeiro toque apagaria os outros dois
   * antes de acontecerem. A tarefa termina quando se registra o que houve.
   */
  it('NÃO conclui a atividade de origem', async () => {
    await registrarTentativaDeLigacao({ activityId: 'a1', phone: '11999998888' });
    expect(capturado.updates).toEqual([]);
  });

  /**
   * Chutar 'no_answer' contaminaria a taxa de atendimento com ligações que
   * podem ter sido atendidas. Discou-e-não-se-sabe-o-resto é o dado honesto.
   */
  it('não inventa desfecho', async () => {
    await registrarTentativaDeLigacao({ activityId: 'a1', phone: '11999998888' });
    expect(capturado.insert.outcome).toBeUndefined();
  });

  it('sem telefone não grava nada', async () => {
    expect(await registrarTentativaDeLigacao({ activityId: 'a1' })).toBeNull();
    expect(capturado.insert).toBeNull();
  });
});

describe('contarTentativas', () => {
  it('conta as chamadas ligadas àquela tarefa', async () => {
    expect(await contarTentativas('a1')).toBe(3);
  });

  it('sem tarefa devolve zero sem consultar', async () => {
    expect(await contarTentativas(null)).toBe(0);
    expect(capturado.tabelas).toEqual([]);
  });
});

/**
 * Telefone e WhatsApp são canais diferentes, não dois botões pro mesmo.
 * Economia e taxa de atendimento não são iguais, e só separando dá pra
 * responder "por onde atendem mais?" — que é o que decide a ordem dos toques
 * na próxima cadência. Juntos, viram uma média que não descreve nenhum dos dois.
 */
describe('canal da tentativa', () => {
  it('o padrão é o chip do aparelho', async () => {
    await registrarTentativaDeLigacao({ activityId: 'a1', phone: '11999998888' });
    expect(capturado.insert.channel).toBe('device');
  });

  it('a ligação por WhatsApp grava o canal próprio', async () => {
    await registrarTentativaDeLigacao({ activityId: 'a1', phone: '11999998888', canal: 'whatsapp' });
    expect(capturado.insert.channel).toBe('whatsapp');
  });

  // Os dois canais contam pro mesmo passo: 3 tentativas são 3, tenha ela ligado
  // pelo chip, pelo WhatsApp ou misturado.
  it('os dois canais somam nas tentativas da mesma tarefa', async () => {
    await registrarTentativaDeLigacao({ activityId: 'a1', phone: '1', canal: 'device' });
    await registrarTentativaDeLigacao({ activityId: 'a1', phone: '1', canal: 'whatsapp' });
    expect(capturado.tabelas.filter(t => t === 'crm_calls')).toHaveLength(2);
  });
});
