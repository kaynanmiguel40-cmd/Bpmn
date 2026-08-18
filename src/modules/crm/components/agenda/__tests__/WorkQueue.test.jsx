/**
 * WorkQueue — a tela da Fila.
 *
 * O hook useWorkQueue e mockado inteiro: o que esta sob teste aqui e a REGRA DE
 * APRESENTACAO (o que a tela diz em cada estado), nao as queries. As regras que
 * este arquivo trava sao as que, quando quebram, fazem a pessoa fechar o dia
 * achando que zerou: erro virando "nada pendente", tarefa aparecendo duas vezes,
 * orfa sumindo sem aviso.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { WorkQueue } from '../WorkQueue';

// WorkQueue renderiza o NowCard, que usa useNavigate (botão de WhatsApp abre o
// Inbox interno) — precisa de contexto de Router.
const Wrap = ({ children }) => <MemoryRouter>{children}</MemoryRouter>;
import { useWorkQueue, useStalledLeads, useBatchPostpone, useQueueRebalance } from '../../../hooks/useWorkQueue';

// O mock precisa cobrir TODO hook que a arvore renderizada consome — nao so os
// que este arquivo configura. O ReassignTaskModal (dentro da fila) chama
// useReassignTask; sem ele aqui, o vi.mock estoura "No export is defined" e
// derruba os 15 testes de uma vez, escondendo a regra que cada um trava.
vi.mock('../../../hooks/useWorkQueue', () => ({
  useWorkQueue: vi.fn(),
  useStalledLeads: vi.fn(),
  useBatchPostpone: vi.fn(),
  useQueueRebalance: vi.fn(),
  useReassignTask: vi.fn(() => ({ mutate: vi.fn(), isPending: false })),
}));

const VAZIO = 'Fila limpa. Nada pendente.';
const ERRO = 'Não consegui carregar suas tarefas.';

/** Data a N dias atras, dentro do expediente (9h). */
function diasAtras(n) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  d.setHours(9, 0, 0, 0);
  return d.toISOString();
}

/** Data de hoje na hora pedida. */
function hojeAs(h) {
  const d = new Date();
  d.setHours(h, 0, 0, 0);
  return d.toISOString();
}

let seq = 0;
function tarefa(over = {}) {
  seq += 1;
  return {
    id: `t${seq}`,
    title: 'D1 9h — Ligação 1',
    leadName: 'Padaria do João',
    dealId: 'deal-1',
    stageName: 'Qualificação',
    startDate: diasAtras(2),
    phone: '11999998888',
    completed: false,
    ...over,
  };
}

function grupo(leadName, tasks, over = {}) {
  return { key: leadName, leadName, dealId: `deal-${leadName}`, stageName: 'Qualificação', tasks, ...over };
}

const refetch = vi.fn();

/** Estado default do hook: fila vazia, sem erro, sem nada. */
function estado(over = {}) {
  return {
    now: null,
    overdueByLead: [],
    overdueCount: 0,
    coldCount: 0,
    coldAfterDays: 7,
    manha: [],
    tarde: [],
    todayCount: 0,
    doneToday: [],
    upcomingByDay: {},
    total: 0,
    doneCount: 0,
    orphanCount: 0,
    isEmpty: true,
    isLoading: false,
    isError: false,
    error: null,
    refetch,
    ...over,
  };
}

let batchMock;

function montar(over = {}, { stalled = [] } = {}) {
  useWorkQueue.mockReturnValue(estado(over));
  useStalledLeads.mockReturnValue({ data: stalled });
  useBatchPostpone.mockReturnValue(batchMock);
  useQueueRebalance.mockReturnValue({
    planejar: { mutate: vi.fn(), isPending: false },
    aplicar: { mutate: vi.fn(), isPending: false },
  });
  return render(<WorkQueue onExecute={vi.fn()} onPostpone={vi.fn()} onOpenLead={vi.fn()} onGoToCalendar={vi.fn()} />, { wrapper: Wrap });
}

beforeEach(() => {
  vi.clearAllMocks();
  batchMock = {
    planejar: { mutate: vi.fn(), isPending: false },
    aplicar: { mutate: vi.fn(), isPending: false },
  };
});

describe('WorkQueue — estados de carga', () => {
  // O teste mais importante do arquivo. Erro que se parece com "nada pendente"
  // faz a pessoa encerrar o dia achando que zerou a fila.
  it('erro de carregamento mostra "Não consegui carregar suas tarefas" e NUNCA o texto de fila vazia', () => {
    montar({ isError: true, error: new Error('boom'), isEmpty: true });

    expect(screen.getByText(ERRO)).toBeInTheDocument();
    expect(screen.getByText(/Isso não quer dizer que você não tem nada pra fazer/)).toBeInTheDocument();
    expect(screen.queryByText(VAZIO)).not.toBeInTheDocument();
  });

  it('o estado de erro oferece saída: "Tentar de novo" refaz a busca', () => {
    montar({ isError: true });

    fireEvent.click(screen.getByText('Tentar de novo'));
    expect(refetch).toHaveBeenCalledTimes(1);
  });

  it('carregando mostra esqueleto, e não fila vazia nem erro', () => {
    const { container } = montar({ isLoading: true, isEmpty: true });

    expect(container.querySelectorAll('.animate-pulse').length).toBeGreaterThan(0);
    expect(screen.queryByText(VAZIO)).not.toBeInTheDocument();
    expect(screen.queryByText(ERRO)).not.toBeInTheDocument();
  });

  it('fila realmente vazia mostra "Fila limpa. Nada pendente."', () => {
    montar({ isEmpty: true, total: 0 });

    expect(screen.getByText(VAZIO)).toBeInTheDocument();
    expect(screen.queryByText(ERRO)).not.toBeInTheDocument();
  });

  it('fila vazia com tarefas feitas mostra o placar do dia', () => {
    montar({ isEmpty: true, doneCount: 3, doneToday: [tarefa({ completed: true }), tarefa({ completed: true }), tarefa({ completed: true })] });

    expect(screen.getByText('Você fechou 3 tarefas hoje.')).toBeInTheDocument();
    // Contador de divida: "feitas de total", nao barra que enche.
    expect(screen.getByText('3 de 3')).toBeInTheDocument();
  });
});

describe('WorkQueue — atrasadas agrupadas por lead', () => {
  it('agrupa as atrasadas por lead e diz quantos toques daquele lead estão parados', () => {
    const g = grupo('Padaria do João', [
      tarefa({ id: 'a1', title: 'D1 9h — Ligação 1', startDate: diasAtras(3) }),
      tarefa({ id: 'a2', title: 'D2 9h — E-mail 2', startDate: diasAtras(2) }),
      tarefa({ id: 'a3', title: 'D3 9h — Ligação 3', startDate: diasAtras(1) }),
    ]);
    montar({ isEmpty: false, total: 3, overdueCount: 3, overdueByLead: [g] });

    expect(screen.getByText('Atrasadas')).toBeInTheDocument();
    expect(screen.getByText('Padaria do João')).toBeInTheDocument();
    expect(screen.getByText(/3 toques parados/)).toBeInTheDocument();
  });

  it('lead com uma única atrasada usa o singular "toque parado"', () => {
    const g = grupo('Mercado Silva', [tarefa({ id: 'b1', leadName: 'Mercado Silva' })]);
    montar({ isEmpty: false, total: 1, overdueCount: 1, overdueByLead: [g] });

    expect(screen.getByText(/· 1 toque parado/)).toBeInTheDocument();
  });

  // A tarefa do "Comece por aqui" ja esta em cima, em destaque. Repetir ela na
  // lista faz a pessoa executar duas vezes ou achar que sao dois toques.
  it('a tarefa do "COMECE POR AQUI" não se repete na lista de atrasadas', () => {
    const now = tarefa({ id: 'now', title: 'D1 9h — Ligação 1', startDate: diasAtras(3) });
    const outra = tarefa({ id: 'outra', title: 'D2 9h — E-mail 2', startDate: diasAtras(2) });
    const g = grupo('Padaria do João', [now, outra]);
    montar({ isEmpty: false, total: 2, overdueCount: 2, overdueByLead: [g], now });

    expect(screen.getByText('Comece por aqui')).toBeInTheDocument();
    // A manchete da linha de fila da tarefa do topo nao pode existir...
    expect(screen.queryByText('Ligar para Padaria do João')).not.toBeInTheDocument();
    // ...mas a outra tarefa do mesmo lead continua listada.
    expect(screen.getByText('Mandar e-mail para Padaria do João')).toBeInTheDocument();
    expect(screen.getAllByText('Fazer')).toHaveLength(1);
  });

  it('mostra no máximo 5 leads atrasados e oferece "ver os outros N"', () => {
    const grupos = Array.from({ length: 7 }, (_, i) =>
      grupo(`Lead ${i + 1}`, [tarefa({ id: `g${i}`, leadName: `Lead ${i + 1}`, startDate: diasAtras(i + 1) })]),
    );
    montar({ isEmpty: false, total: 7, overdueCount: 7, overdueByLead: grupos });

    expect(screen.getByText('Lead 5')).toBeInTheDocument();
    expect(screen.queryByText('Lead 6')).not.toBeInTheDocument();
    expect(screen.getByText(/ver os outros 2 leads atrasados/)).toBeInTheDocument();
  });

  it('clicar em "ver os outros" revela os leads atrasados escondidos', () => {
    const grupos = Array.from({ length: 7 }, (_, i) =>
      grupo(`Lead ${i + 1}`, [tarefa({ id: `g${i}`, leadName: `Lead ${i + 1}`, startDate: diasAtras(i + 1) })]),
    );
    montar({ isEmpty: false, total: 7, overdueCount: 7, overdueByLead: grupos });

    fireEvent.click(screen.getByText(/ver os outros 2 leads atrasados/));

    expect(screen.getByText('Lead 6')).toBeInTheDocument();
    expect(screen.getByText('Lead 7')).toBeInTheDocument();
    expect(screen.queryByText(/ver os outros/)).not.toBeInTheDocument();
  });

  // "Adiar todas" tem que valer pra fila inteira. Adiar so as 5 visiveis
  // deixaria divida invisivel pra tras.
  it('"Adiar todas" planeja TODAS as atrasadas, inclusive os leads escondidos', () => {
    const grupos = Array.from({ length: 7 }, (_, i) =>
      grupo(`Lead ${i + 1}`, [tarefa({ id: `g${i}`, leadName: `Lead ${i + 1}`, startDate: diasAtras(i + 1) })]),
    );
    montar({ isEmpty: false, total: 7, overdueCount: 7, overdueByLead: grupos });

    fireEvent.click(screen.getByText('Adiar todas'));

    expect(batchMock.planejar.mutate).toHaveBeenCalledTimes(1);
    expect(batchMock.planejar.mutate.mock.calls[0][0].tasks).toHaveLength(7);
  });

  // Nunca grava direto: 18 atrasadas nao cabem "amanha", e sem ver isso a
  // pessoa empurra trabalho pra semana que vem sem saber.
  it('adiar em lote exige conferir o plano antes de gravar, incluindo o que não coube', () => {
    const amanha = new Date();
    amanha.setDate(amanha.getDate() + 1);
    batchMock.planejar.mutate = vi.fn((_payload, opts) =>
      opts.onSuccess({
        plano: [{ id: 'a1' }, { id: 'a2' }, { id: 'a3' }],
        porDia: [{ date: amanha, count: 3 }],
        naoCoube: 2,
      }),
    );
    const g = grupo('Padaria do João', [tarefa({ id: 'a1' }), tarefa({ id: 'a2' }), tarefa({ id: 'a3' })]);
    montar({ isEmpty: false, total: 3, overdueCount: 3, overdueByLead: [g] });

    fireEvent.click(screen.getByText('Adiar todas'));

    expect(screen.getByText('Onde essas 3 tarefas vão caber:')).toBeInTheDocument();
    expect(screen.getByText(/2 não couberam nos próximos dias e vão continuar atrasadas/)).toBeInTheDocument();
    // So depois do Confirmar e que grava.
    expect(batchMock.aplicar.mutate).not.toHaveBeenCalled();
    fireEvent.click(screen.getByText('Confirmar'));
    expect(batchMock.aplicar.mutate).toHaveBeenCalledTimes(1);
  });
});

describe('WorkQueue — hoje, órfãs, feitas e frias', () => {
  it('separa as tarefas de hoje em manhã e tarde', () => {
    const m = tarefa({ id: 'm1', leadName: 'Cliente Manhã', title: 'D0 9h — Ligação 1', startDate: hojeAs(9) });
    const t = tarefa({ id: 't1', leadName: 'Cliente Tarde', title: 'D0 15h — E-mail 1', startDate: hojeAs(15) });
    montar({ isEmpty: false, total: 2, todayCount: 2, manha: [m], tarde: [t] });

    expect(screen.getByText('Manhã')).toBeInTheDocument();
    expect(screen.getByText('Tarde')).toBeInTheDocument();
    expect(screen.getByText('Ligar para Cliente Manhã')).toBeInTheDocument();
    expect(screen.getByText('Mandar e-mail para Cliente Tarde')).toBeInTheDocument();
  });

  // Orfa nao aparece na fila de ninguem — se nao houvesse aviso, a tela mentiria
  // dizendo que nao ha nada pendente.
  it('avisa quantas tarefas estão sem responsável definido', () => {
    montar({ isEmpty: false, total: 1, todayCount: 1, manha: [tarefa({ startDate: hojeAs(10) })], orphanCount: 3 });

    expect(screen.getByText(/3 tarefas estão sem responsável definido/)).toBeInTheDocument();
    expect(screen.getByText(/elas não aparecem na fila de ninguém/)).toBeInTheDocument();
  });

  it('o aviso de tarefas sem responsável aparece mesmo com a fila vazia', () => {
    montar({ isEmpty: true, total: 0, orphanCount: 1 });

    expect(screen.getByText(VAZIO)).toBeInTheDocument();
    expect(screen.getByText(/1 tarefa está sem responsável definido/)).toBeInTheDocument();
  });

  it('não mostra aviso de responsável quando não há nenhuma tarefa órfã', () => {
    montar({ isEmpty: true, orphanCount: 0 });

    expect(screen.queryByText(/sem responsável definido/)).not.toBeInTheDocument();
  });

  it('o bloco "Feitas hoje" começa colapsado e só abre ao clicar', () => {
    const feita = tarefa({ id: 'f1', leadName: 'Lead Fechado', completed: true, deliveryReport: 'Atendeu, quer proposta' });
    montar({ isEmpty: true, doneCount: 1, doneToday: [feita] });

    expect(screen.getByText('Feitas hoje')).toBeInTheDocument();
    expect(screen.queryByText('Lead Fechado')).not.toBeInTheDocument();

    fireEvent.click(screen.getByText('Feitas hoje'));

    expect(screen.getByText('Lead Fechado')).toBeInTheDocument();
    expect(screen.getByText(/Atendeu, quer proposta/)).toBeInTheDocument();
  });

  // Atrasada ha mais de 7 dias sai da fila principal: faixa vermelha que nunca
  // zera vira mobilia e para de ser lida.
  it('toques frios ficam no rodapé, fora da fila, com o corte em dias', () => {
    montar({ isEmpty: true, coldCount: 4, coldAfterDays: 7 });

    expect(screen.getByText(/toques frios/)).toBeInTheDocument();
    expect(screen.getByText(/atrasados há mais de 7 dias/)).toBeInTheDocument();
    expect(screen.getByText(VAZIO)).toBeInTheDocument();
  });

  // O furo silencioso: lead sem NENHUMA tarefa nao aparece em lugar nenhum
  // justamente por nao ter tarefa. Tem que aparecer mesmo com a fila zerada.
  it('leads parados aparecem mesmo quando a fila está vazia', () => {
    montar(
      { isEmpty: true, total: 0 },
      { stalled: [{ dealId: 'd9', leadName: 'Lanchonete Parada', stageName: 'Proposta', dias: 12, stageColor: '#f00' }] },
    );

    expect(screen.getByText(VAZIO)).toBeInTheDocument();
    expect(screen.getByText('Leads parados')).toBeInTheDocument();
    expect(screen.getByText('Lanchonete Parada')).toBeInTheDocument();
    expect(screen.getByText(/sem contato há 12 dias/)).toBeInTheDocument();
  });
});
