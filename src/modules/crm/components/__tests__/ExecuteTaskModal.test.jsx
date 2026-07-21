import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';

// O modal usa useAgendarRetorno (react-query) pro "Pediu pra ligar depois".
// Aqui so precisamos que ele exista sem exigir QueryClientProvider.
vi.mock('../../hooks/useCrmQueries', () => ({
  useAgendarRetorno: () => ({ mutateAsync: vi.fn().mockResolvedValue({ ok: true }), isPending: false }),
}));

import { ExecuteTaskModal } from '../ExecuteTaskModal';

/**
 * ExecuteTaskModal — a tela onde a tarefa REALMENTE e concluida.
 *
 * A Agenda e o unico lugar que da check num passo, entao este modal e quem
 * decide duas coisas ao mesmo tempo: (a) a tarefa foi executada e (b) o passo
 * do playbook foi CUMPRIDO. Sao coisas diferentes — "liguei e ninguem atendeu"
 * e (a) sim, (b) nao — e a flag `contacted` e o que separa as duas.
 */

// Ligacao: stepChannel(title) casa com /liga/ → canal 'call'.
const CALL_TITLE = 'D0 9h — Ligação 1 de apresentação';
// WhatsApp: casa com /whats|cartilha/ → canal 'message'.
const WHATS_TITLE = 'D1 — WhatsApp com a cartilha';
// E-mail: casa com /e-?mail/ → canal 'email'.
const EMAIL_TITLE = 'D3 — E-mail com o case do cliente';

const STEP = {
  title: 'Ligação 1',
  script: 'Oi, aqui é da Fyness. Você tem 2 minutos?',
  scenarios: [
    { when: 'Pediu proposta', then: 'Mande a proposta em até 24h' },
    { when: 'Sem interesse agora', then: 'Joga para a Nutrição' },
  ],
};

function makeActivity(overrides = {}) {
  return {
    id: 'act-1',
    title: CALL_TITLE,
    leadName: 'Padaria do João',
    stageName: 'Prospecção',
    contactPhone: '11987654321',
    dealId: 'deal-1',
    completed: false,
    ...overrides,
  };
}

function setup(props = {}) {
  const onSubmit = vi.fn();
  const utils = render(
    <ExecuteTaskModal
      open
      onClose={vi.fn()}
      activity={makeActivity()}
      step={STEP}
      onSubmit={onSubmit}
      {...props}
    />,
  );
  return { onSubmit, ...utils };
}

const btn = (name) => screen.getByRole('button', { name });
const maybeBtn = (name) => screen.queryByRole('button', { name });

describe('ExecuteTaskModal — desfecho da LIGAÇÃO', () => {
  it('não deixa concluir uma ligação enquanto o vendedor não disser se falou ou não com o lead', () => {
    // Concluir sem desfecho era o que pintava o passo do playbook de verde por
    // engano: a Pipeline passava a mentir sobre o quanto o lead avançou.
    setup();
    expect(btn(/Concluir/)).toBeDisabled();
  });

  it('"Falei com ele" libera o Concluir e envia contacted true (passo do playbook cumprido)', () => {
    const { onSubmit } = setup();
    fireEvent.click(btn(/Falei com ele/));
    expect(btn(/Concluir/)).toBeEnabled();

    fireEvent.click(btn(/Concluir/));
    expect(onSubmit).toHaveBeenCalledTimes(1);
    expect(onSubmit.mock.calls[0][0]).toMatchObject({ contacted: true });
  });

  it('"Não atendeu" conclui a tarefa com contacted false — o passo continua pendente', () => {
    // Regra central: e-mail/WhatsApp são assíncronos (mandar já cumpre o passo),
    // mas o objetivo da ligação é FALAR com a pessoa. Sem atender, o passo não
    // foi cumprido, mesmo com a tarefa saindo da fila.
    const { onSubmit } = setup();
    fireEvent.click(btn(/Não atendeu/));
    fireEvent.click(btn(/Concluir/));

    expect(onSubmit).toHaveBeenCalledWith({
      input: '',
      output: 'Não atendeu',
      contacted: false,
    });
  });

  it('"Não atendeu" some com os cenários — não houve resposta do lead a registrar', () => {
    setup();
    // Numa ligacao os cenarios so existem DEPOIS de dizer que falou: as duas
    // perguntas juntas pareciam duas decisoes competindo.
    fireEvent.click(btn(/Falei com ele/));
    expect(btn(/Pediu proposta/)).toBeInTheDocument();

    fireEvent.click(btn(/Não atendeu/));
    expect(maybeBtn(/Pediu proposta/)).not.toBeInTheDocument();
    expect(maybeBtn(/Sem interesse agora/)).not.toBeInTheDocument();
    // ...e deixa claro que o passo do playbook segue em aberto.
    expect(screen.getByText(/o passo continua pendente/i)).toBeInTheDocument();
  });

  it('trocar "Não atendeu" por "Falei com ele" traz os cenários de volta (erro de clique é reversível)', () => {
    const { onSubmit } = setup();
    fireEvent.click(btn(/Não atendeu/));
    fireEvent.click(btn(/Falei com ele/));

    expect(btn(/Pediu proposta/)).toBeInTheDocument();
    fireEvent.click(btn(/Concluir/));
    expect(onSubmit.mock.calls[0][0]).toMatchObject({ contacted: true });
  });

  it('o que o vendedor digitou vence o "Não atendeu" padrão como resultado da tarefa', () => {
    const { onSubmit } = setup();
    fireEvent.click(btn(/Não atendeu/));
    fireEvent.change(screen.getByPlaceholderText(/Escreva o que ele respondeu/i), {
      target: { value: 'Caiu na caixa postal, deixei recado' },
    });
    fireEvent.click(btn(/Concluir/));

    expect(onSubmit.mock.calls[0][0]).toMatchObject({
      output: 'Caiu na caixa postal, deixei recado',
      contacted: false,
    });
  });
});

describe('ExecuteTaskModal — canais assíncronos (WhatsApp / e-mail)', () => {
  it('WhatsApp não pergunta se conseguiu falar e conclui direto com contacted true', () => {
    // Mandar a mensagem JÁ cumpre o passo: a resposta (ou o silêncio) do lead
    // vira o toque seguinte da cadência, não o desfecho deste.
    const { onSubmit } = setup({ activity: makeActivity({ title: WHATS_TITLE }) });
    expect(screen.queryByText(/Conseguiu falar/i)).not.toBeInTheDocument();
    expect(maybeBtn(/Não atendeu/)).not.toBeInTheDocument();

    expect(btn(/Concluir/)).toBeEnabled();
    fireEvent.click(btn(/Concluir/));
    expect(onSubmit.mock.calls[0][0]).toMatchObject({ contacted: true });
  });

  it('e-mail não pergunta se conseguiu falar e conclui direto com contacted true', () => {
    const { onSubmit } = setup({ activity: makeActivity({ title: EMAIL_TITLE }) });
    expect(screen.queryByText(/Conseguiu falar/i)).not.toBeInTheDocument();

    expect(btn(/Concluir/)).toBeEnabled();
    fireEvent.click(btn(/Concluir/));
    expect(onSubmit.mock.calls[0][0]).toMatchObject({ contacted: true });
  });
});

describe('ExecuteTaskModal — cenários de 1 clique', () => {
  it('clicar num cenário conclui na hora, com o texto do cenário como resposta do lead', () => {
    const { onSubmit } = setup();
    fireEvent.click(btn(/Falei com ele/)); // ligação: cenário só existe depois
    fireEvent.click(btn(/Pediu proposta/));

    expect(onSubmit).toHaveBeenCalledTimes(1);
    expect(onSubmit.mock.calls[0][0]).toEqual({
      input: '',
      output: 'Pediu proposta',
      contacted: true,
    });
    // O "como reagir" fica visível junto: o toque acontece sem abrir o lead.
    expect(screen.getByText('Mande a proposta em até 24h')).toBeInTheDocument();
  });

  it('em modo edição o cenário só preenche o resultado — quem grava é o Salvar', () => {
    // Concluir de novo uma tarefa já concluída não faz sentido: aqui o clique
    // é conserto de registro, não execução.
    const { onSubmit } = setup({
      activity: makeActivity({ completed: true, deliveryReport: 'Pediu tempo' }),
      justDone: false,
    });

    const campo = screen.getByPlaceholderText(/Escreva o que ele respondeu/i);
    expect(campo).toHaveValue('Pediu tempo');

    fireEvent.click(btn(/Pediu proposta/));
    expect(onSubmit).not.toHaveBeenCalled();
    expect(campo).toHaveValue('Pediu proposta');

    fireEvent.click(btn(/Salvar/));
    expect(onSubmit.mock.calls[0][0]).toMatchObject({ output: 'Pediu proposta' });
  });

  it('em modo edição de ligação não repergunta o desfecho e o Salvar já nasce liberado', () => {
    setup({ activity: makeActivity({ completed: true, deliveryReport: 'Pediu tempo' }) });
    expect(screen.queryByText(/Conseguiu falar/i)).not.toBeInTheDocument();
    expect(btn(/Salvar/)).toBeEnabled();
  });
});

describe('ExecuteTaskModal — confirmação pós-conclusão (justDone)', () => {
  const nextActivity = {
    title: 'D2 — Ligação 2 de retomada',
    startDate: new Date(new Date().setHours(14, 30, 0, 0)).toISOString(),
  };

  it('depois de concluir mostra o próximo toque da cadência para não perder o fio', () => {
    setup({
      activity: makeActivity({ completed: true }),
      justDone: true,
      nextActivity,
    });

    expect(screen.getByText('Tarefa concluída')).toBeInTheDocument();
    expect(screen.getByText(/Próximo contato/i)).toBeInTheDocument();
    expect(screen.getByText('D2 — Ligação 2 de retomada')).toBeInTheDocument();
    expect(btn(/Próxima tarefa/)).toBeInTheDocument();
  });

  it('sem próximo toque avisa que era o último e o botão vira Fechar', () => {
    setup({ activity: makeActivity({ completed: true }), justDone: true, nextActivity: null });

    expect(screen.getByText(/último toque agendado/i)).toBeInTheDocument();
    expect(btn(/^Fechar$/)).toBeInTheDocument();
    expect(maybeBtn(/Próxima tarefa/)).not.toBeInTheDocument();
  });

  it('"Corrigir" é o desfazer de quem clicou no cenário errado (o chip conclui em 1 clique)', () => {
    const onCorrect = vi.fn();
    setup({ activity: makeActivity({ completed: true }), justDone: true, onCorrect, nextActivity });

    fireEvent.click(btn(/Corrigir/));
    expect(onCorrect).toHaveBeenCalledTimes(1);
  });
});

describe('ExecuteTaskModal — caminho triste', () => {
  it('lead sem telefone não mostra Ligar nem WhatsApp e a tela continua utilizável', () => {
    setup({ activity: makeActivity({ contactPhone: null }) });

    expect(screen.queryByText(/^Ligar$/)).not.toBeInTheDocument();
    expect(screen.queryByText(/^WhatsApp$/)).not.toBeInTheDocument();
    expect(screen.getByText(CALL_TITLE)).toBeInTheDocument();
    expect(btn(/Falei com ele/)).toBeInTheDocument();
  });

  it('telefone curto demais para ser celular mostra o Ligar mas não o atalho do WhatsApp', () => {
    // Limite exato: menos de 10 dígitos não vira link wa.me.
    setup({ activity: makeActivity({ contactPhone: '123456789' }) });

    expect(screen.getByText(/^Ligar$/)).toBeInTheDocument();
    expect(screen.queryByText(/^WhatsApp$/)).not.toBeInTheDocument();
  });

  it('tarefa sem passo de playbook não mostra "O que falar" nem cenários, e não quebra', () => {
    setup({ step: null });

    expect(screen.queryByText(/O que falar/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/O que o lead respondeu\?/)).not.toBeInTheDocument();
    // Sem cenário, o campo livre deixa de ser o "outra coisa" e vira a pergunta.
    expect(screen.getByText('O que o lead respondeu')).toBeInTheDocument();
  });

  it('sem atividade nenhuma o modal não renderiza nada', () => {
    render(<ExecuteTaskModal open onClose={vi.fn()} activity={null} onSubmit={vi.fn()} />);
    expect(screen.queryByText(/Executar tarefa/i)).not.toBeInTheDocument();
  });

  it('trocar a tarefa do modal zera o desfecho escolhido na tarefa anterior', () => {
    // Vazamento de estado aqui marcaria a ligação seguinte como atendida sem
    // ninguém ter dito isso.
    const { rerender, onSubmit } = setup();
    fireEvent.click(btn(/Falei com ele/));
    expect(btn(/Concluir/)).toBeEnabled();

    rerender(
      <ExecuteTaskModal
        open
        onClose={vi.fn()}
        activity={makeActivity({ id: 'act-2', leadName: 'Mercado Central' })}
        step={STEP}
        onSubmit={onSubmit}
      />,
    );
    expect(btn(/Concluir/)).toBeDisabled();
  });

  it('isPending trava o Concluir mesmo com o desfecho já escolhido (não dá para concluir 2x)', () => {
    setup({ isPending: true });
    expect(btn(/Falei com ele/)).toBeDisabled();
    // /Conclui/ casa tanto "Concluir" quanto "Concluindo…": o que este teste
    // trava e o botao ficar DESABILITADO enquanto envia, nao a palavra exata.
    expect(btn(/Conclui/)).toBeDisabled();
  });

  // O rotulo do campo livre segue o que esta VISIVEL na tela, nao o que existe
  // no playbook: "Respondeu outra coisa?" so faz sentido com as opcoes a vista.
  // E depois de "Nao atendeu" nao se pergunta pela resposta do lead — nao houve
  // conversa.
  it('com "Não atendeu" o rótulo do campo livre para de falar em resposta do lead', () => {
    setup();
    fireEvent.click(btn(/Não atendeu/));
    expect(screen.queryByText('Respondeu outra coisa?')).toBeNull();
    expect(screen.getByText('Quer anotar alguma coisa?')).toBeInTheDocument();
  });
});

/**
 * O playbook real tem um cenario "Nao atendeu nas 3" — que e a MESMA coisa que
 * o botao "Não atendeu". Mostrar os dois fazia a tela oferecer, na lista de
 * respostas do lead, exatamente o que a pessoa acabou de negar ao clicar em
 * "Falei com ele".
 */
describe('ExecuteTaskModal — cenário de "não atendeu" não briga com o desfecho', () => {
  const STEP_REAL = {
    title: 'Ligação 1',
    script: 'Oi, aqui é da Fyness.',
    scenarios: [
      { when: 'Atendeu e conversou', then: 'Puxa a conversa e passa pra qualificação' },
      { when: 'Nao atendeu nas 3', then: 'Deixa mensagem: "Oi, acabei de te ligar…"' },
    ],
  };

  it('antes de escolher o desfecho, nenhuma lista de resposta aparece', () => {
    setup({ step: STEP_REAL });
    // As duas perguntas juntas — "conseguiu falar?" e "o que respondeu?" —
    // pareciam duas decisoes competindo. Uma so existe depois da outra.
    expect(screen.queryByText('O que o lead respondeu?')).toBeNull();
    expect(screen.getByText(/Conseguiu falar com/)).toBeInTheDocument();
  });

  it('"Falei com ele" mostra só as respostas de quem CONVERSOU', () => {
    setup({ step: STEP_REAL });
    fireEvent.click(btn(/Falei com ele/));
    expect(screen.getByText('Atendeu e conversou')).toBeInTheDocument();
    // O que contradiz o desfecho escolhido nao pode estar na tela.
    expect(screen.queryByText('Nao atendeu nas 3')).toBeNull();
  });

  // O playbook JA diz o que fazer quando ninguem atende (deixar recado). Essa
  // orientacao vivia num cenario da lista — e a lista some justamente aqui.
  it('"Não atendeu" traz o script do recado, que antes sumia', () => {
    setup({ step: STEP_REAL });
    fireEvent.click(btn(/Não atendeu/));
    expect(screen.getByText(/Deixa mensagem/)).toBeInTheDocument();
    expect(screen.queryByText('Atendeu e conversou')).toBeNull();
  });

  // WhatsApp/e-mail nao tem "atendeu ou nao": a mensagem foi enviada e pronto.
  it('em canal assíncrono todos os cenários continuam valendo', () => {
    setup({
      step: STEP_REAL,
      activity: makeActivity({ title: 'D2 — WhatsApp com a cartilha' }),
    });
    expect(screen.getByText('Atendeu e conversou')).toBeInTheDocument();
    expect(screen.getByText('Nao atendeu nas 3')).toBeInTheDocument();
  });
});

// A Agenda e o nivel de EXECUCAO: clicar numa tarefa pendente e pedir pra
// fazer. Antes, so a tarefa do playbook abria a execucao — a criada a mao caia
// no historico. Duas tarefas lado a lado no mesmo dia respondiam a coisas
// diferentes ao mesmo clique, e a diferenca (ter passo por tras) e invisivel.
describe('ExecuteTaskModal — porta pro historico', () => {
  it('oferece "Ver histórico do lead" quando ha lead e handler', () => {
    const onOpenHistory = vi.fn();
    setup({ onOpenHistory });
    fireEvent.click(screen.getByText(/Ver histórico do lead/));
    expect(onOpenHistory).toHaveBeenCalledTimes(1);
  });

  it('sem handler, nao mostra o link', () => {
    setup();
    expect(screen.queryByText(/Ver histórico do lead/)).toBeNull();
  });

  it('tarefa sem lead nao oferece histórico — nao ha lead a que voltar', () => {
    setup({ onOpenHistory: vi.fn(), activity: makeActivity({ dealId: null, leadName: null }) });
    expect(screen.queryByText(/Ver histórico do lead/)).toBeNull();
  });
});
