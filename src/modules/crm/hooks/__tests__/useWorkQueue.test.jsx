/**
 * useWorkQueue — a fila de trabalho da Agenda.
 *
 * O que este arquivo trava e o COMPORTAMENTO da fila: quem ve a tarefa, como as
 * atrasadas se agrupam por lead, onde fica o corte do toque frio e qual e a
 * unica tarefa do "comece por aqui".
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
}));

vi.mock('../../../../hooks/useProfile', () => ({
  useProfile: vi.fn(),
}));

import { useWorkQueue, ownsTask, isOrphan } from '../useWorkQueue';
import { getOverdueQueue, getTodayQueue, getUpcomingCounts } from '../../services/crmQueueService';
import { useProfile } from '../../../../hooks/useProfile';

const UID = 'user-1';
const UNAME = 'Kaynan Miguel Luper Silva';

/** Data local a N dias de hoje, na hora H — evita depender de fuso na string ISO. */
function atDay(offsetDays, hour = 9, minute = 0) {
  const n = new Date();
  return new Date(n.getFullYear(), n.getMonth(), n.getDate() + offsetDays, hour, minute).toISOString();
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

function wrapper({ children }) {
  const qc = new QueryClient({
    defaultOptions: { queries: { retry: false, gcTime: 0 } },
    logger: { log: () => {}, warn: () => {}, error: () => {} },
  });
  return <QueryClientProvider client={qc}>{children}</QueryClientProvider>;
}

/** Renderiza e espera o carregamento terminar (sucesso ou erro). */
async function montar() {
  const view = renderHook(() => useWorkQueue(), { wrapper });
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

describe('ownsTask — as tres regras de dono, nesta ordem', () => {
  it('regra 1: com assignedTo preenchido, a tarefa e minha quando o id bate', () => {
    expect(ownsTask(task({ assignedTo: UID, createdBy: 'outro' }), UID, UNAME)).toBe(true);
  });

  it('regra 1 tem a palavra final: assignedTo de OUTRO nao pode cair no fallback de nome nem no createdBy', () => {
    // Contraintuitivo de proposito: a tarefa tem o MEU nome e foi criada por mim,
    // mas foi repassada pra outra pessoa. Se o fallback rodasse, ela voltaria
    // pra minha fila e duas pessoas fariam o mesmo toque.
    const t = task({ assignedTo: 'outro-user', assignedToName: UNAME, createdBy: UID });
    expect(ownsTask(t, UID, UNAME)).toBe(false);
  });

  it('regra 2: sem assignedTo, casa por NOME (cadencia legada gravou so o nome)', () => {
    const t = task({ assignedTo: null, assignedToName: 'Kaynan Silva', createdBy: 'outro' });
    expect(ownsTask(t, UID, UNAME)).toBe(true);
  });

  it('regra 3: sem assignedTo e sem nome, o dono e quem criou', () => {
    const t = task({ assignedTo: null, assignedToName: null, createdBy: UID });
    expect(ownsTask(t, UID, UNAME)).toBe(true);
    expect(ownsTask(task({ assignedTo: null, assignedToName: null, createdBy: 'outro' }), UID, UNAME)).toBe(false);
  });

  it('tarefa nula nao e de ninguem', () => {
    expect(ownsTask(null, UID, UNAME)).toBe(false);
  });
});

describe('isOrphan', () => {
  it('orfa e a tarefa sem assignedTo, sem nome e sem createdBy', () => {
    expect(isOrphan(task({ assignedTo: null, assignedToName: null, createdBy: null }))).toBe(true);
  });

  it('qualquer um dos tres campos preenchido ja tira a tarefa de orfa', () => {
    expect(isOrphan(task({ assignedTo: 'x', assignedToName: null, createdBy: null }))).toBe(false);
    expect(isOrphan(task({ assignedTo: null, assignedToName: 'Fulano', createdBy: null }))).toBe(false);
    expect(isOrphan(task({ assignedTo: null, assignedToName: null, createdBy: 'x' }))).toBe(false);
  });
});

describe('agrupamento das atrasadas', () => {
  it('agrupa por lead e poe na frente o lead com o toque MAIS ANTIGO; dentro do lead, cronologico', async () => {
    getOverdueQueue.mockResolvedValue([
      task({ id: 'b-novo', dealId: 'deal-B', leadName: 'Lead B', startDate: atDay(-2, 9) }),
      task({ id: 'a-novo', dealId: 'deal-A', leadName: 'Lead A', startDate: atDay(-1, 9) }),
      task({ id: 'a-velho', dealId: 'deal-A', leadName: 'Lead A', startDate: atDay(-5, 9) }),
    ]);
    const { result } = await montar();

    const grupos = result.current.overdueByLead;
    expect(grupos.map(g => g.key)).toEqual(['deal-A', 'deal-B']);
    // Dentro do lead a ordem e cronologica: o toque mais velho abre a conversa.
    expect(grupos[0].tasks.map(t => t.id)).toEqual(['a-velho', 'a-novo']);
    expect(result.current.overdueCount).toBe(3);
  });

  it('tarefa sem dealId agrupa pelo contactId; as sem lead nenhum caem num balde so', async () => {
    getOverdueQueue.mockResolvedValue([
      task({ id: 't1', dealId: null, contactId: 'c-9', startDate: atDay(-3, 9) }),
      task({ id: 't2', dealId: null, contactId: 'c-9', startDate: atDay(-2, 9) }),
      task({ id: 't3', dealId: null, contactId: null, startDate: atDay(-1, 9) }),
      task({ id: 't4', dealId: null, contactId: null, startDate: atDay(-1, 14) }),
    ]);
    const { result } = await montar();

    const grupos = result.current.overdueByLead;
    expect(grupos).toHaveLength(2);
    expect(grupos[0].key).toBe('c-9');
    expect(grupos[0].tasks.map(t => t.id)).toEqual(['t1', 't2']);

    // Chavear pelo proprio id daria um grupo de 1 por tarefa, e o cabecalho
    // ("Sem lead · 1 toque parado") ocupava mais espaco que a tarefa, repetido
    // linha a linha, sem dizer nada. Tarefa avulsa nao e conversa com lead
    // nenhum — vai toda pro mesmo balde, marcada com semLead pra tela poder
    // trocar o vocabulario de cadencia ("toque parado") por "tarefa".
    expect(grupos[1].key).toBe('__sem_lead__');
    expect(grupos[1].semLead).toBe(true);
    expect(grupos[1].tasks.map(t => t.id)).toEqual(['t3', 't4']);
    // O grupo com lead continua sem a marca.
    expect(grupos[0].semLead).toBe(false);
  });
});

describe('corte do toque frio', () => {
  it('atrasada de exatamente 7 dias FICA na fila; a de 8 dias vira toque frio', async () => {
    // O limite e "> 7", nao ">= 7": o setimo dia ainda e recuperavel.
    getOverdueQueue.mockResolvedValue([
      task({ id: 'sete', dealId: 'd1', startDate: atDay(-7, 9) }),
      task({ id: 'oito', dealId: 'd2', startDate: atDay(-8, 9) }),
    ]);
    const { result } = await montar();

    expect(result.current.overdueCount).toBe(1);
    expect(result.current.overdueByLead[0].tasks.map(t => t.id)).toEqual(['sete']);
    expect(result.current.coldCount).toBe(1);
    expect(result.current.coldAfterDays).toBe(7);
  });
});

describe('hoje', () => {
  it('divide o dia em manha (antes das 12h) e tarde (12h em diante)', async () => {
    getTodayQueue.mockResolvedValue([
      task({ id: 'm1', startDate: atDay(0, 9) }),
      task({ id: 'm2', startDate: atDay(0, 11, 59) }),
      task({ id: 't1', startDate: atDay(0, 12) }),
      task({ id: 't2', startDate: atDay(0, 17) }),
    ]);
    const { result } = await montar();

    expect(result.current.manha.map(t => t.id)).toEqual(['m1', 'm2']);
    // Meio-dia em ponto e TARDE — o limite e >= 12h.
    expect(result.current.tarde.map(t => t.id)).toEqual(['t1', 't2']);
    expect(result.current.todayCount).toBe(4);
  });

  it('concluida de hoje sai da fila e vira placar; o total conta so o que falta fazer', async () => {
    getTodayQueue.mockResolvedValue([
      task({ id: 'feita', startDate: atDay(0, 9), completed: true }),
      task({ id: 'pendente', startDate: atDay(0, 15) }),
    ]);
    const { result } = await montar();

    expect(result.current.doneToday.map(t => t.id)).toEqual(['feita']);
    expect(result.current.doneCount).toBe(1);
    expect(result.current.todayCount).toBe(1);
    expect(result.current.total).toBe(1);
    expect(result.current.manha).toHaveLength(0);
  });
});

describe('"comece por aqui" (now)', () => {
  it('a atrasada mais antiga tem prioridade sobre a proxima tarefa de hoje', async () => {
    getOverdueQueue.mockResolvedValue([task({ id: 'velha', dealId: 'd1', startDate: atDay(-3, 14) })]);
    getTodayQueue.mockResolvedValue([task({ id: 'hoje', startDate: atDay(0, 8) })]);
    const { result } = await montar();

    expect(result.current.now.id).toBe('velha');
  });

  it('sem atrasada, o now e a primeira pendente de hoje (concluida nao conta)', async () => {
    getTodayQueue.mockResolvedValue([
      task({ id: 'feita', startDate: atDay(0, 8), completed: true }),
      task({ id: 'hoje', startDate: atDay(0, 10) }),
    ]);
    const { result } = await montar();

    expect(result.current.now.id).toBe('hoje');
  });

  it('sem nada pendente, now e null e a fila esta vazia', async () => {
    const { result } = await montar();

    expect(result.current.now).toBeNull();
    expect(result.current.total).toBe(0);
    expect(result.current.isEmpty).toBe(true);
    expect(result.current.isError).toBe(false);
  });
});

describe('tarefas que nao sao minhas', () => {
  it('tarefa de outro dono some da fila, mas a orfa e CONTADA no aviso', async () => {
    // orphanCount le o payload BRUTO: a orfa nao passa pelo filtro de dono, entao
    // sem este contador a tela diria "nada pendente" com trabalho parado no banco.
    getOverdueQueue.mockResolvedValue([
      task({ id: 'de-outro', dealId: 'd1', assignedTo: 'outro-user', createdBy: 'outro-user', startDate: atDay(-1, 9) }),
      task({ id: 'orfa-1', dealId: 'd2', assignedTo: null, assignedToName: null, createdBy: null, startDate: atDay(-1, 9) }),
    ]);
    getTodayQueue.mockResolvedValue([
      task({ id: 'orfa-2', assignedTo: null, assignedToName: null, createdBy: null }),
      task({ id: 'minha', startDate: atDay(0, 10) }),
    ]);
    const { result } = await montar();

    expect(result.current.overdueCount).toBe(0);
    expect(result.current.todayCount).toBe(1);
    expect(result.current.orphanCount).toBe(2);
  });

  it('o contador dos proximos dias tambem so soma o que e meu, agrupado por dia', async () => {
    getUpcomingCounts.mockResolvedValue([
      { start_date: atDay(1, 9), assigned_to: UID, assigned_to_name: null, created_by: UID },
      { start_date: atDay(1, 15), assigned_to: UID, assigned_to_name: null, created_by: UID },
      { start_date: atDay(2, 9), assigned_to: 'outro-user', assigned_to_name: null, created_by: 'outro-user' },
    ]);
    const { result } = await montar();

    const amanha = new Date();
    amanha.setDate(amanha.getDate() + 1);
    const chave = `${amanha.getFullYear()}-${amanha.getMonth() + 1}-${amanha.getDate()}`;

    expect(result.current.upcomingByDay[chave]).toBe(2);
    expect(Object.keys(result.current.upcomingByDay)).toHaveLength(1);
  });
});

describe('caminho triste', () => {
  it('erro de carregamento nunca pode se passar por fila vazia', async () => {
    // Regra 7: "isEmpty" com erro faria a tela dizer "parabens, acabou" pra quem
    // na verdade nao carregou nada.
    getOverdueQueue.mockRejectedValue(new Error('falha de rede'));
    const { result } = await montar();

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.error?.message).toBe('falha de rede');
    expect(result.current.total).toBe(0);
  });

  it('payload nulo do servico nao quebra a fila', async () => {
    getOverdueQueue.mockResolvedValue(null);
    getTodayQueue.mockResolvedValue(null);
    getUpcomingCounts.mockResolvedValue(null);
    const { result } = await montar();

    expect(result.current.overdueByLead).toEqual([]);
    expect(result.current.orphanCount).toBe(0);
    expect(result.current.isEmpty).toBe(true);
    expect(result.current.isError).toBe(false);
  });
});
