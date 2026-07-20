/**
 * DealProcessChecklist — o processo da etapa em modo ACOMPANHAMENTO.
 *
 * A regra que estes testes travam: esta tela NAO executa. Ela mostra onde o
 * lead esta no processo e manda pra Agenda, que e o unico lugar que da check.
 * Se um checkbox voltar pra ca, a mesma tarefa passa a existir em dois lugares
 * e o vendedor marca num sem executar no outro.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';

// useNavigate precisa existir antes do import do componente — vi.hoisted evita
// o TDZ do mock (a factory roda no import, nao no corpo do teste).
const { navigateMock } = vi.hoisted(() => ({ navigateMock: vi.fn() }));
vi.mock('react-router-dom', () => ({ useNavigate: () => navigateMock }));

vi.mock('../../hooks/useCrmQueries', () => ({
  useStagePlaybook: vi.fn(),
  useDealProgress: vi.fn(),
  useDealActivities: vi.fn(),
}));

import { useStagePlaybook, useDealProgress, useDealActivities } from '../../hooks/useCrmQueries';
import { DealProcessChecklist } from '../DealProcessChecklist';

const STAGE_ID = 'stage-1';

const STEPS = [
  { id: 's1', title: 'D1 9h — Ligação 1', script: 'Bom dia, aqui é da Fyness', scenarios: [] },
  { id: 's2', title: 'D2 — Mandar WhatsApp', scenarios: [{ when: 'ele pede preço', then: 'manda a tabela' }] },
  { id: 's3', title: 'D3 — Mandar e-mail com a proposta' },
];

const DEAL = {
  id: 'deal-1',
  pipelineId: 'pipe-1',
  stageId: STAGE_ID,
  source: 'outbound',
  stage: { name: 'Prospecção', objetivo: 'Marcar a reunião', exitCriteria: 'Reunião agendada' },
};

// Datas locais fixas: o rotulo e formatado em horario local, entao construir por
// componentes (e nao por string ISO) mantem o teste estavel em qualquer fuso.
const iso = (...args) => new Date(...args).toISOString();
const DIA_PENDENTE = iso(2026, 6, 15, 14, 0);   // 15/07
const DIA_CONCLUIDA = iso(2026, 6, 1, 9, 0);    // 01/07

function setup({
  deal = DEAL,
  playbook = { [STAGE_ID]: STEPS },
  progress = [],
  activities = [],
  loading = false,
} = {}) {
  useStagePlaybook.mockReturnValue({ data: playbook, isLoading: loading });
  useDealProgress.mockReturnValue({ data: progress, isLoading: loading });
  useDealActivities.mockReturnValue({ data: activities });
  return render(<DealProcessChecklist deal={deal} />);
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe('DealProcessChecklist — acompanhamento, nunca execução', () => {
  it('não oferece nenhum checkbox ou campo para marcar o passo', () => {
    const { container } = setup();

    expect(screen.queryByRole('checkbox')).toBeNull();
    expect(container.querySelector('input')).toBeNull();
  });

  it('os únicos botões são "Ver" (abrir script) e "Executar na Agenda" — nenhum conclui o passo', () => {
    setup();

    const nomes = screen.getAllByRole('button').map(b => b.textContent.trim());
    // s1 tem script e s2 tem cenarios -> dois "Ver"; s3 nao tem nada a abrir.
    expect(nomes.filter(n => n === 'Ver')).toHaveLength(2);
    expect(nomes.filter(n => n.includes('Executar na Agenda'))).toHaveLength(1);
    expect(nomes).toHaveLength(3);
  });

  it('abrir o script com "Ver" não muda o estado do passo', () => {
    setup();

    fireEvent.click(screen.getAllByRole('button', { name: 'Ver' })[0]);

    expect(screen.getByText('Bom dia, aqui é da Fyness')).toBeInTheDocument();
    // O passo continua pendente: ler o script nao e executar a tarefa.
    expect(screen.getAllByLabelText('Pendente')).toHaveLength(3);
    expect(screen.queryByLabelText('Feito')).toBeNull();
  });

  it('passo cumprido aparece como feito e mostra o que o lead respondeu', () => {
    setup({ progress: [{ stepId: 's1', outcome: 'Pediu pra ligar depois das 18h' }] });

    expect(screen.getByLabelText('Feito')).toBeInTheDocument();
    expect(screen.getByText(/Pediu pra ligar depois das 18h/)).toBeInTheDocument();
  });

  it('passo cumprido sem resposta registrada não inventa a linha do lead', () => {
    setup({ progress: [{ stepId: 's1', outcome: '' }] });

    expect(screen.getByLabelText('Feito')).toBeInTheDocument();
    expect(screen.queryByText('Lead:')).toBeNull();
  });

  it('passo não cumprido com tarefas concluídas mostra "N tentativas, sem contato"', () => {
    // Este estado so existe porque "não atendeu" conclui a TAREFA sem marcar o
    // passo (contacted=false). Sem o contador o passo pareceria intocado, e o
    // vendedor nao saberia que ja ligou 3 vezes pra esse lead.
    setup({
      activities: [
        { id: 'a1', stageStepId: 's1', completed: true, startDate: DIA_CONCLUIDA },
        { id: 'a2', stageStepId: 's1', completed: true, startDate: DIA_CONCLUIDA },
        { id: 'a3', stageStepId: 's1', completed: true, startDate: DIA_CONCLUIDA },
      ],
    });

    expect(screen.getByText(/3 tentativas, sem contato/)).toBeInTheDocument();
    expect(screen.queryByLabelText('Feito')).toBeNull();
  });

  it('o passo tentado é sinalizado em âmbar (nem feito, nem intocado)', () => {
    setup({ activities: [{ id: 'a1', stageStepId: 's2', completed: true, startDate: DIA_CONCLUIDA }] });

    const marcador = screen.getByLabelText('Tentado, sem contato');
    // O ambar carrega significado: verde = feito, ambar = tentou e nao falou.
    expect(marcador.className).toMatch(/amber/);
    expect(marcador).toHaveTextContent('1');
  });

  it('uma tentativa só aparece no singular', () => {
    setup({ activities: [{ id: 'a1', stageStepId: 's1', completed: true, startDate: DIA_CONCLUIDA }] });

    expect(screen.getByText(/1 tentativa, sem contato/)).toBeInTheDocument();
  });

  it('passo sem nenhuma tarefa concluída não mostra contador de tentativas', () => {
    setup({ activities: [{ id: 'a1', stageStepId: 's1', completed: false, startDate: DIA_PENDENTE }] });

    expect(screen.queryByText(/sem contato/)).toBeNull();
    expect(screen.getAllByLabelText('Pendente')).toHaveLength(3);
  });

  it('a data mostrada é a da tarefa PENDENTE, não a da tarefa já concluída', () => {
    // Tarefa concluida e passado: transformar a data dela em "prazo" faria o
    // passo parecer atrasado por algo que ja foi feito.
    setup({
      activities: [
        { id: 'a1', stageStepId: 's1', completed: true, startDate: DIA_CONCLUIDA },
        { id: 'a2', stageStepId: 's1', completed: false, startDate: DIA_PENDENTE },
      ],
    });

    expect(screen.getByText(/15\/07/)).toBeInTheDocument();
    expect(screen.queryByText(/01\/07/)).toBeNull();
  });

  it('passo cujas tarefas foram todas concluídas não exibe prazo nenhum', () => {
    setup({ activities: [{ id: 'a1', stageStepId: 's1', completed: true, startDate: DIA_CONCLUIDA }] });

    expect(screen.queryByText(/01\/07/)).toBeNull();
  });

  it('"Executar na Agenda" aparece enquanto houver passo pendente', () => {
    setup({ progress: [{ stepId: 's1', outcome: 'Atendeu' }] });

    expect(screen.getByRole('button', { name: /Executar na Agenda/ })).toBeInTheDocument();
    expect(screen.getByText('1/3')).toBeInTheDocument();
  });

  it('"Executar na Agenda" some quando todos os passos da etapa estão feitos', () => {
    setup({ progress: STEPS.map(s => ({ stepId: s.id, outcome: 'ok' })) });

    expect(screen.queryByRole('button', { name: /Executar na Agenda/ })).toBeNull();
    expect(screen.getByText('3/3')).toBeInTheDocument();
  });

  it('"Executar na Agenda" leva o lead pro dia da próxima tarefa pendente', () => {
    setup({
      activities: [
        { id: 'a1', stageStepId: 's3', completed: false, startDate: iso(2026, 6, 25, 10, 0) },
        { id: 'a2', stageStepId: 's1', completed: false, startDate: DIA_PENDENTE },
      ],
    });

    fireEvent.click(screen.getByRole('button', { name: /Executar na Agenda/ }));

    const destino = navigateMock.mock.calls[0][0];
    expect(destino).toContain('/crm/agenda?');
    expect(destino).toContain('dealId=deal-1');
    expect(destino).toContain('view=day');
    // A mais proxima das duas pendentes (15/07), nao a de 25/07.
    expect(decodeURIComponent(destino)).toContain(DIA_PENDENTE);
  });

  it('etapa sem playbook e sem objetivo mostra o vazio explicativo', () => {
    setup({ playbook: {}, deal: { ...DEAL, stage: { name: 'Prospecção' } } });

    expect(screen.getByText(/ainda não tem o que fazer definido/)).toBeInTheDocument();
    expect(screen.getByText(/Defina na Pipeline/)).toBeInTheDocument();
  });

  it('etapa sem passos mas com objetivo definido não é tratada como vazia', () => {
    setup({ playbook: {} });

    expect(screen.queryByText(/ainda não tem o que fazer definido/)).toBeNull();
    expect(screen.getByText('Marcar a reunião')).toBeInTheDocument();
    expect(screen.getByText('Reunião agendada')).toBeInTheDocument();
  });

  it('enquanto carrega não mostra o vazio — "carregando" não pode parecer "sem processo"', () => {
    setup({ playbook: undefined, progress: [], loading: true });

    expect(screen.queryByText(/ainda não tem o que fazer definido/)).toBeNull();
  });

  it('negócio nulo não quebra a tela: cai no vazio explicativo', () => {
    expect(() => setup({ deal: null, playbook: undefined })).not.toThrow();
    expect(screen.getByText(/ainda não tem o que fazer definido/)).toBeInTheDocument();
  });

  // Atraso e por DIA, nao por instante: a tarefa das 9h nao pode ficar vermelha
  // as 9h01 com o vendedor ainda no telefone. Usa a mesma stepLabel.isOverdue
  // que a fila e o calendario — telas discordando sobre a mesma tarefa e pior
  // que qualquer imprecisao.
  it('tarefa de hoje que já passou da hora ainda NÃO conta como atrasada (atraso é por dia)', () => {
    const agora = new Date();
    const maisCedoHoje = new Date(agora.getFullYear(), agora.getMonth(), agora.getDate(), 0, 1).toISOString();
    const { container } = setup({
      activities: [{ id: 'a1', stageStepId: 's1', completed: false, startDate: maisCedoHoje }],
    });

    expect(container.querySelector('[class*="rose"]')).toBeNull();
  });
});
