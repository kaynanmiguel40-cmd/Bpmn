/**
 * useWorkQueue — a VISAO: de quem e a fila que esta na tela.
 *
 * O outro arquivo (useWorkQueue.test.jsx) trava o comportamento da fila com a
 * visao padrao. Aqui o alvo e so o recorte de QUEM: a minha fila, a de outra
 * pessoa, ou a do time inteiro. Isto e controle de acesso disfarcado de filtro
 * — errar o recorte faz duas pessoas ligarem pro mesmo lead, ou faz trabalho
 * sumir da tela de todo mundo.
 */

import React from 'react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

vi.mock('../../services/crmQueueService', () => ({
  getOverdueQueue: vi.fn(),
  getTodayQueue: vi.fn(),
  getUpcomingCounts: vi.fn(),
  getStalledLeads: vi.fn(),
  snoozeActivity: vi.fn(),
  getNextStageForDeal: vi.fn(),
  planBatchPostpone: vi.fn(),
  applyBatchPostpone: vi.fn(),
  getNextActivityForLead: vi.fn(),
  getLeadNotes: vi.fn(),
  planQueueRebalance: vi.fn(),
  applyQueueRebalance: vi.fn(),
}));

vi.mock('../../../../hooks/useProfile', () => ({
  useProfile: vi.fn(),
}));

import { useWorkQueue } from '../useWorkQueue';
import { getOverdueQueue, getTodayQueue, getUpcomingCounts } from '../../services/crmQueueService';
import { useProfile } from '../../../../hooks/useProfile';

// Eu, logada.
const UID = 'user-1';
const UNAME = 'Kaynan Miguel Luper Silva';
// A outra pessoa do time, que o admin pode olhar.
const OUTRO_UID = 'user-2';
const OUTRO_UNAME = 'Lorena Consultora Souza';

/** Data local a N dias de hoje, na hora H — evita depender de fuso na string ISO. */
function atDay(offsetDays, hour = 9, minute = 0) {
  const n = new Date();
  return new Date(n.getFullYear(), n.getMonth(), n.getDate() + offsetDays, hour, minute).toISOString();
}

/** Chave de dia como o hook monta (ano-mes-dia, sem zero a esquerda). */
function chaveDoDia(offsetDays) {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
}

function task(over = {}) {
  return {
    id: over.id || 'a1',
    title: 'Ligação 1',
    type: 'call',
    startDate: atDay(0, 9),
    completed: false,
    dealId: null,
    contactId: null,
    assignedTo: UID,
    assignedToName: null,
    createdBy: UID,
    leadName: 'Lead',
    stageName: 'Prospecção',
    ...over,
  };
}

/** Tarefa orfa: sem dono, sem nome e sem criador. */
function orfa(over = {}) {
  return task({ assignedTo: null, assignedToName: null, createdBy: null, ...over });
}

/** Linha crua de getUpcomingCounts (vem em snake_case do banco). */
function upcoming(offsetDays, dono) {
  return {
    start_date: atDay(offsetDays, 9),
    assigned_to: dono,
    assigned_to_name: null,
    created_by: dono,
  };
}

// QueryClient criado UMA vez por montagem: os testes de troca de visao
// re-renderizam o hook, e recriar o client no render zeraria o cache no meio.
function wrapper({ children }) {
  const [qc] = React.useState(() => new QueryClient({
    defaultOptions: { queries: { retry: false, gcTime: 0 } },
    logger: { log: () => {}, warn: () => {}, error: () => {} },
  }));
  return <QueryClientProvider client={qc}>{children}</QueryClientProvider>;
}

/** Monta com a visao pedida e espera o carregamento terminar. */
async function montar(visao) {
  const view = renderHook(({ v }) => useWorkQueue(v), {
    wrapper,
    initialProps: { v: visao },
  });
  await waitFor(() => expect(view.result.current.isLoading).toBe(false));
  return view;
}

beforeEach(() => {
  vi.clearAllMocks();
  useProfile.mockReturnValue({ profile: { id: UID, name: UNAME }, isLoading: false });
  getOverdueQueue.mockResolvedValue([]);
  getTodayQueue.mockResolvedValue([]);
  getUpcomingCounts.mockResolvedValue([]);
});

describe('visao omitida — a fila e a minha', () => {
  it('sem visao, so as minhas tarefas entram: ver o trabalho do outro e escolha explicita', async () => {
    getTodayQueue.mockResolvedValue([
      task({ id: 'minha', startDate: atDay(0, 9) }),
      task({ id: 'da-lorena', assignedTo: OUTRO_UID, createdBy: OUTRO_UID, startDate: atDay(0, 10) }),
    ]);
    const { result } = await montar(undefined);

    expect(result.current.manha.map(t => t.id)).toEqual(['minha']);
    expect(result.current.todayCount).toBe(1);
    expect(result.current.vendoTodos).toBe(false);
  });

  it('visao null se comporta igual a visao omitida (a pagina manda null quando ninguem foi escolhido)', async () => {
    getTodayQueue.mockResolvedValue([
      task({ id: 'minha' }),
      task({ id: 'da-lorena', assignedTo: OUTRO_UID, createdBy: OUTRO_UID }),
    ]);
    const { result } = await montar(null);

    expect(result.current.todayCount).toBe(1);
    expect(result.current.vendoTodos).toBe(false);
  });

  it('sem perfil resolvido, a fila fica vazia em vez de mostrar a de outra pessoa', async () => {
    // Caminho triste que importa: perfil nulo deixa uid/uname nulos. A fila
    // preferir o vazio a chutar dono e o comportamento seguro — mostrar tudo
    // aqui seria vazar a fila do time pra quem nem foi identificado.
    useProfile.mockReturnValue({ profile: null, isLoading: false });
    getTodayQueue.mockResolvedValue([
      task({ id: 'minha' }),
      task({ id: 'da-lorena', assignedTo: OUTRO_UID, createdBy: OUTRO_UID }),
    ]);
    const { result } = await montar(undefined);

    expect(result.current.todayCount).toBe(0);
    expect(result.current.isEmpty).toBe(true);
    expect(result.current.vendoTodos).toBe(false);
  });
});

describe('visao { all: true } — a fila do time inteiro', () => {
  it('nao filtra por dono: a tarefa de qualquer membro aparece', async () => {
    getTodayQueue.mockResolvedValue([
      task({ id: 'minha', startDate: atDay(0, 9) }),
      task({ id: 'da-lorena', assignedTo: OUTRO_UID, assignedToName: OUTRO_UNAME, createdBy: OUTRO_UID, startDate: atDay(0, 10) }),
      task({ id: 'de-ninguem-conhecido', assignedTo: 'user-99', createdBy: 'user-99', startDate: atDay(0, 11) }),
    ]);
    const { result } = await montar({ all: true });

    expect(result.current.manha.map(t => t.id)).toEqual(['minha', 'da-lorena', 'de-ninguem-conhecido']);
    expect(result.current.todayCount).toBe(3);
  });

  it('a tarefa ORFA aparece na fila do time — esta e a unica tela onde da pra descobrir que ela existe', async () => {
    // Contraintuitivo: em toda fila individual a orfa some (nao e de ninguem,
    // entao nao pode encher a fila de quem nao a criou). Se ela sumisse tambem
    // aqui, o trabalho ficaria invisivel pra sempre e ninguem poderia assumir.
    getOverdueQueue.mockResolvedValue([
      orfa({ id: 'orfa-atrasada', dealId: 'd1', startDate: atDay(-2, 9) }),
    ]);
    getTodayQueue.mockResolvedValue([
      orfa({ id: 'orfa-hoje', startDate: atDay(0, 9) }),
    ]);
    const { result } = await montar({ all: true });

    expect(result.current.overdueByLead[0].tasks.map(t => t.id)).toEqual(['orfa-atrasada']);
    expect(result.current.manha.map(t => t.id)).toEqual(['orfa-hoje']);
    expect(result.current.total).toBe(2);
    expect(result.current.isEmpty).toBe(false);
  });

  it('vendoTodos vem true no retorno, pra tela poder avisar que a tarefa pode nao ser sua', async () => {
    const { result } = await montar({ all: true });
    expect(result.current.vendoTodos).toBe(true);
  });

  it('o "comece por aqui" do time pode ser a tarefa de outra pessoa — manda a mais antiga, nao a minha', async () => {
    getOverdueQueue.mockResolvedValue([
      task({ id: 'minha-atrasada', dealId: 'd1', startDate: atDay(-1, 9) }),
      task({ id: 'da-lorena-mais-velha', dealId: 'd2', assignedTo: OUTRO_UID, createdBy: OUTRO_UID, startDate: atDay(-4, 9) }),
    ]);
    const { result } = await montar({ all: true });

    expect(result.current.now.id).toBe('da-lorena-mais-velha');
  });

  it('all:true tem a palavra final: uid/uname enviados junto sao ignorados', async () => {
    // A pagina troca de "todos" pra uma pessoa mudando um estado so; se o uid
    // antigo sobrevivesse ao all:true, a fila do time viria recortada pela
    // pessoa anterior e pareceria vazia sem motivo.
    getTodayQueue.mockResolvedValue([
      task({ id: 'minha' }),
      task({ id: 'da-lorena', assignedTo: OUTRO_UID, createdBy: OUTRO_UID }),
    ]);
    const { result } = await montar({ all: true, uid: OUTRO_UID, uname: OUTRO_UNAME });

    expect(result.current.todayCount).toBe(2);
    expect(result.current.vendoTodos).toBe(true);
  });
});

describe('visao { uid, uname } — a fila de outra pessoa', () => {
  it('filtra pela pessoa VISTA, nao pela logada: a minha tarefa sai da tela', async () => {
    getTodayQueue.mockResolvedValue([
      task({ id: 'minha', startDate: atDay(0, 9) }),
      task({ id: 'da-lorena', assignedTo: OUTRO_UID, createdBy: OUTRO_UID, startDate: atDay(0, 10) }),
    ]);
    const { result } = await montar({ uid: OUTRO_UID, uname: OUTRO_UNAME });

    expect(result.current.manha.map(t => t.id)).toEqual(['da-lorena']);
    expect(result.current.todayCount).toBe(1);
  });

  it('olhar a fila de alguem nao e olhar a do time: vendoTodos continua false', async () => {
    const { result } = await montar({ uid: OUTRO_UID, uname: OUTRO_UNAME });
    expect(result.current.vendoTodos).toBe(false);
  });

  it('o fallback por nome usa o nome da pessoa vista (cadencia legada gravou so o nome)', async () => {
    getOverdueQueue.mockResolvedValue([
      task({ id: 'legada-dela', dealId: 'd1', assignedTo: null, assignedToName: 'Lorena Souza', createdBy: 'quem-criou', startDate: atDay(-1, 9) }),
      task({ id: 'legada-minha', dealId: 'd2', assignedTo: null, assignedToName: 'Kaynan Silva', createdBy: 'quem-criou', startDate: atDay(-1, 9) }),
    ]);
    const { result } = await montar({ uid: OUTRO_UID, uname: OUTRO_UNAME });

    expect(result.current.overdueByLead.map(g => g.key)).toEqual(['d1']);
    expect(result.current.overdueCount).toBe(1);
  });

  it('na fila individual de outra pessoa a orfa continua fora, mas segue contada no aviso', async () => {
    getTodayQueue.mockResolvedValue([
      orfa({ id: 'orfa-hoje' }),
      task({ id: 'da-lorena', assignedTo: OUTRO_UID, createdBy: OUTRO_UID, startDate: atDay(0, 10) }),
    ]);
    const { result } = await montar({ uid: OUTRO_UID, uname: OUTRO_UNAME });

    expect(result.current.todayCount).toBe(1);
    expect(result.current.orphanCount).toBe(1);
  });

  // BUG ABERTO (pulado de proposito — nao acomodar o defeito no teste):
  // `const uname = vendoTodos ? null : (visao?.uname || profile?.name || null)`
  // deixa o nome de QUEM ESTA LOGADA vazar pro recorte de OUTRA pessoa quando a
  // visao vem so com uid. O casamento por nome deveria ser desligado quando o
  // uid visto nao e o meu.
  it('sem uname informado, a fila da outra pessoa NAO herda o meu nome, a fila da outra pessoa herda o MEU nome e puxa tarefa legada minha', async () => {
    // Vendo { uid: OUTRO_UID } sem uname, o hook cai em `profile?.name` — o nome
    // de QUEM ESTA LOGADA. Uma tarefa legada (so com nome) minha entra na fila
    // dela. O correto e nao ter fallback de nome quando o uid visto nao e o meu:
    // sem nome da pessoa vista, o casamento por nome deveria ser desligado.
    getOverdueQueue.mockResolvedValue([
      task({ id: 'legada-minha', dealId: 'd1', assignedTo: null, assignedToName: UNAME, createdBy: 'quem-criou', startDate: atDay(-1, 9) }),
    ]);
    const { result } = await montar({ uid: OUTRO_UID });

    expect(result.current.overdueCount).toBe(0);
  });
});

describe('upcomingByDay respeita a mesma visao', () => {
  it('na minha fila, o contador dos proximos dias nao pode somar o dia do time', async () => {
    getUpcomingCounts.mockResolvedValue([
      upcoming(1, UID),
      upcoming(1, OUTRO_UID),
      upcoming(2, OUTRO_UID),
    ]);
    const { result } = await montar(undefined);

    expect(result.current.upcomingByDay[chaveDoDia(1)]).toBe(1);
    expect(Object.keys(result.current.upcomingByDay)).toHaveLength(1);
  });

  it('vendo o time, o contador soma todo mundo no mesmo dia', async () => {
    getUpcomingCounts.mockResolvedValue([
      upcoming(1, UID),
      upcoming(1, OUTRO_UID),
      upcoming(2, OUTRO_UID),
    ]);
    const { result } = await montar({ all: true });

    expect(result.current.upcomingByDay[chaveDoDia(1)]).toBe(2);
    expect(result.current.upcomingByDay[chaveDoDia(2)]).toBe(1);
  });

  it('vendo uma pessoa, o contador e o dela — o meu dia cheio nao aparece na fila dela', async () => {
    getUpcomingCounts.mockResolvedValue([
      upcoming(1, UID),
      upcoming(1, UID),
      upcoming(2, OUTRO_UID),
    ]);
    const { result } = await montar({ uid: OUTRO_UID, uname: OUTRO_UNAME });

    expect(result.current.upcomingByDay[chaveDoDia(1)]).toBeUndefined();
    expect(result.current.upcomingByDay[chaveDoDia(2)]).toBe(1);
  });

  it('trocar de visao sem recarregar recalcula a fila inteira com os mesmos dados', async () => {
    // A troca acontece num clique (select de membro). Se o recorte ficasse
    // preso ao valor do primeiro render, ela veria a fila do time rotulada como
    // sua — e concluiria tarefa de outra pessoa.
    getTodayQueue.mockResolvedValue([
      task({ id: 'minha', startDate: atDay(0, 9) }),
      task({ id: 'da-lorena', assignedTo: OUTRO_UID, createdBy: OUTRO_UID, startDate: atDay(0, 10) }),
    ]);
    getUpcomingCounts.mockResolvedValue([upcoming(1, UID), upcoming(1, OUTRO_UID)]);

    const view = await montar(undefined);
    expect(view.result.current.todayCount).toBe(1);
    expect(view.result.current.upcomingByDay[chaveDoDia(1)]).toBe(1);

    view.rerender({ v: { all: true } });
    await waitFor(() => expect(view.result.current.vendoTodos).toBe(true));
    expect(view.result.current.todayCount).toBe(2);
    expect(view.result.current.upcomingByDay[chaveDoDia(1)]).toBe(2);

    view.rerender({ v: { uid: OUTRO_UID, uname: OUTRO_UNAME } });
    await waitFor(() => expect(view.result.current.vendoTodos).toBe(false));
    expect(view.result.current.manha.map(t => t.id)).toEqual(['da-lorena']);
    expect(view.result.current.upcomingByDay[chaveDoDia(1)]).toBe(1);
  });
});
