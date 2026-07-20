/**
 * LeadHistoryTimeline — o historico do lead agrupado por ETAPA.
 *
 * As regras que estes testes travam:
 *
 * 1. O agrupamento e por PERIODO, nao por vinculo. Um item cai na etapa em que
 *    o lead ESTAVA naquela data, mesmo que o item nao aponte pra etapa nenhuma
 *    (tarefa criada a mao). Se isso quebrar, o historico conta a historia
 *    errada: mostra a ligacao de prospeccao dentro do periodo de negociacao.
 *
 * 2. Nota do campo `notes` precisa se declarar nota. Um trecho datado, sem o
 *    rotulo de procedencia, e indistinguivel de uma atividade que o sistema
 *    registrou — e ai a consultora acredita que ligou quando so anotou.
 *
 * 3. Previsto x realizado so existe com os DOIS horarios. Tarefa pendente nao
 *    tem "realizado", entao nao pode inventar desvio nenhum.
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';

// O componente puxa scheduleTiming de crmAgendaService, que abre conexao com o
// Supabase no import. Aqui so o modulo de infra e falseado — scheduleTiming
// roda de verdade, porque a regra dos 5 minutos e parte do que se testa.
vi.mock('../../../../lib/supabase', () => ({
  supabase: { from: vi.fn(), auth: { getUser: vi.fn() } },
}));
vi.mock('../../../../contexts/ToastContext', () => ({
  toast: { success: vi.fn(), error: vi.fn(), info: vi.fn() },
}));

import { LeadHistoryTimeline, groupByStagePeriod } from '../LeadHistoryTimeline';

// Historico de etapas: entrou em Prospeccao dia 01/05, virou Negociacao dia 10/05.
const STAGE_HISTORY = [
  { id: 'h1', createdAt: '2026-05-01T09:00:00', stage: { name: 'Prospecção', color: '#3b82f6' } },
  { id: 'h2', createdAt: '2026-05-10T09:00:00', stage: { name: 'Negociação', color: '#22c55e' } },
];

const activity = (over = {}) => ({
  id: 'a1',
  _type: 'activity',
  type: 'call',
  title: 'Ligação 1',
  _date: '2026-05-12T14:00:00',
  ...over,
});

describe('groupByStagePeriod — o item cai na etapa em que o lead estava naquela data', () => {
  it('poe cada item no periodo da etapa vigente na data dele, mesmo sem vinculo com a etapa', () => {
    // Itens em ordem decrescente, como a tela recebe.
    const items = [
      { _type: 'activity', _date: '2026-05-12T10:00:00', title: 'depois da virada' },
      { _type: 'activity', _date: '2026-05-05T10:00:00', title: 'antes da virada' },
    ];

    const groups = groupByStagePeriod(items, STAGE_HISTORY);

    expect(groups).toHaveLength(2);
    expect(groups[0].name).toBe('Negociação');
    expect(groups[0].items[0].title).toBe('depois da virada');
    expect(groups[1].name).toBe('Prospecção');
    expect(groups[1].items[0].title).toBe('antes da virada');
  });

  it('joga o que aconteceu antes da primeira mudanca registrada num grupo proprio', () => {
    // O sistema so passou a registrar etapa em 01/05; o que veio antes existe,
    // mas nao da pra dizer em que etapa foi. Some-lo na primeira etapa seria mentira.
    const items = [{ _type: 'activity', _date: '2026-04-20T10:00:00', title: 'primeiro contato' }];

    const groups = groupByStagePeriod(items, STAGE_HISTORY);

    expect(groups).toHaveLength(1);
    expect(groups[0].name).toBe('Antes da primeira mudança de etapa');
    expect(groups[0].since).toBeNull();
  });

  it('nao reparte a mesma etapa em dois grupos quando os itens vem em ordem', () => {
    const items = [
      { _type: 'activity', _date: '2026-05-14T10:00:00', title: 'c' },
      { _type: 'activity', _date: '2026-05-13T10:00:00', title: 'b' },
      { _type: 'activity', _date: '2026-05-11T10:00:00', title: 'a' },
    ];

    const groups = groupByStagePeriod(items, STAGE_HISTORY);

    expect(groups).toHaveLength(1);
    expect(groups[0].name).toBe('Negociação');
    expect(groups[0].items).toHaveLength(3);
  });

  it('no instante exato da mudanca o item ja pertence a etapa NOVA', () => {
    // Limite fechado na entrada e aberto na saida: quem chega junto com a
    // mudanca entrou com ela. Caso contrario a tarefa que motivou o avanco
    // ficaria pendurada na etapa que o lead acabou de deixar.
    const items = [{ _type: 'activity', _date: '2026-05-10T09:00:00', title: 'na virada' }];

    const groups = groupByStagePeriod(items, STAGE_HISTORY);

    expect(groups[0].name).toBe('Negociação');
  });

  it('sem historico de etapa nenhum, tudo cai no grupo do que veio antes', () => {
    const items = [
      { _type: 'activity', _date: '2026-05-12T10:00:00', title: 'x' },
      { _type: 'activity', _date: '2026-05-02T10:00:00', title: 'y' },
    ];

    const groups = groupByStagePeriod(items, []);

    expect(groups).toHaveLength(1);
    expect(groups[0].name).toBe('Antes da primeira mudança de etapa');
    expect(groups[0].items).toHaveLength(2);
  });

  it('sem itens nao existe grupo nenhum — etapa sem registro nao vira cabecalho vazio', () => {
    expect(groupByStagePeriod([], STAGE_HISTORY)).toEqual([]);
  });
});

describe('LeadHistoryTimeline — vazio', () => {
  it('sem registros mostra a mensagem de `empty`, ou uma frase padrao — nunca tela em branco', () => {
    const { rerender } = render(
      <LeadHistoryTimeline items={[]} empty="Nenhum contato com esse lead ainda." />,
    );
    expect(screen.getByText('Nenhum contato com esse lead ainda.')).toBeInTheDocument();

    rerender(<LeadHistoryTimeline items={[]} />);
    expect(screen.getByText('Nada feito ainda com esse lead.')).toBeInTheDocument();
  });
});

describe('LeadHistoryTimeline — previsto x realizado', () => {
  it('mostra previsto e feito quando existem os dois horarios', () => {
    render(
      <LeadHistoryTimeline
        items={[activity({ plannedAt: '2026-05-12T09:00:00', completedAt: '2026-05-12T10:30:00' })]}
        stageHistory={STAGE_HISTORY}
      />,
    );
    expect(screen.getByText(/Previsto 09:00 · feito 10:30/)).toBeInTheDocument();
    expect(screen.getByText('+1h30')).toBeInTheDocument();
  });

  it('atraso de menos de 5 minutos conta como no horario — abaixo disso e ruido, nao desvio', () => {
    render(
      <LeadHistoryTimeline
        items={[activity({ plannedAt: '2026-05-12T09:00:00', completedAt: '2026-05-12T09:04:00' })]}
        stageHistory={STAGE_HISTORY}
      />,
    );
    expect(screen.getByText('no horário')).toBeInTheDocument();
  });

  it('5 minutos exatos ja e atraso — o limite e fechado no 5', () => {
    render(
      <LeadHistoryTimeline
        items={[activity({ plannedAt: '2026-05-12T09:00:00', completedAt: '2026-05-12T09:05:00' })]}
        stageHistory={STAGE_HISTORY}
      />,
    );
    expect(screen.getByText('+5min')).toBeInTheDocument();
    expect(screen.queryByText('no horário')).not.toBeInTheDocument();
  });

  it('tarefa sem horario de realizacao nao mostra desvio nenhum', () => {
    render(
      <LeadHistoryTimeline
        items={[activity({ plannedAt: '2026-05-12T09:00:00', completedAt: null })]}
        stageHistory={STAGE_HISTORY}
      />,
    );
    expect(screen.queryByText(/Previsto/)).not.toBeInTheDocument();
    expect(screen.queryByText('no horário')).not.toBeInTheDocument();
  });
});

describe('LeadHistoryTimeline — nota do campo de notas', () => {
  it('nota com data no texto mostra a data e diz que foi escrita no campo de notas', () => {
    // Sem o rotulo de procedencia, um trecho datado se passa por atividade real.
    render(
      <LeadHistoryTimeline
        items={[{ _type: 'note', title: 'Retorno do lead', text: 'Pediu proposta', _date: '2026-05-12T00:00:00' }]}
        stageHistory={STAGE_HISTORY}
      />,
    );
    expect(screen.getByText('Retorno do lead')).toBeInTheDocument();
    expect(screen.getByText('Pediu proposta')).toBeInTheDocument();
    expect(screen.getByText('12/05/2026 · escrito no campo de notas')).toBeInTheDocument();
  });

  it('nota sem data avisa que veio de antes do historico existir, em vez de fingir uma data', () => {
    render(
      <LeadHistoryTimeline
        items={[{ _type: 'note', text: 'Dados: Fulano, CNPJ 000', _date: null }]}
        stageHistory={STAGE_HISTORY}
      />,
    );
    expect(screen.getByText('Sem data no texto — anotado antes do histórico existir.')).toBeInTheDocument();
    expect(screen.getByText('Anotações do lead')).toBeInTheDocument();
  });
});

describe('LeadHistoryTimeline — corrigir o que aconteceu', () => {
  const editavel = activity({ _canEdit: true, deliveryInput: 'Apresentei o Fyness', deliveryReport: 'Vai avaliar' });

  it('oferece o lapis quando ha onEditItem E o item aceita edicao', () => {
    const onEditItem = vi.fn();
    render(<LeadHistoryTimeline items={[editavel]} stageHistory={STAGE_HISTORY} onEditItem={onEditItem} />);

    const botao = screen.getByRole('button', { name: /Editar o que aconteceu/i });
    fireEvent.click(botao);
    expect(onEditItem).toHaveBeenCalledWith(expect.objectContaining({ id: 'a1' }));
  });

  it('esconde o lapis se faltar qualquer um dos dois — item que nao aceita edicao, ou tela que nao edita', () => {
    // Ligacao e WhatsApp sao REGISTRO do que aconteceu: nao ha entrega a
    // preencher, entao nem com onEditItem o lapis aparece. E a pagina do
    // Negocio e leitura — nao passa onEditItem, entao nem o item editavel ganha.
    const { rerender } = render(
      <LeadHistoryTimeline
        items={[activity({ _canEdit: false })]}
        stageHistory={STAGE_HISTORY}
        onEditItem={vi.fn()}
      />,
    );
    expect(screen.queryByRole('button')).not.toBeInTheDocument();

    rerender(<LeadHistoryTimeline items={[editavel]} stageHistory={STAGE_HISTORY} />);
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });
});

describe('LeadHistoryTimeline — canal do registro', () => {
  // BUG: o painel da Agenda manda `type: 'whatsapp'` (o kind da timeline, quando
  // nao ha activityType) e o componente nao conhece esse canal — nao ha entrada
  // em ACTIVITY_ICONS nem em ACTIVITY_LABELS. Resultado: cai no icone generico
  // de calendario e, no modo compacto usado pelo painel, fica SEM rotulo
  // nenhum — um WhatsApp vira indistinguivel de uma tarefa qualquer. Fora do
  // compacto e pior: o cracha mostra a chave crua "whatsapp", em ingles, numa
  // tela que e toda em portugues.
  it('registro de WhatsApp se identifica como WhatsApp, e nao pela chave crua em ingles', () => {
    render(
      <LeadHistoryTimeline
        items={[activity({ type: 'whatsapp', title: 'Mensagem enviada' })]}
        stageHistory={STAGE_HISTORY}
      />,
    );
    expect(screen.getByText('WhatsApp')).toBeInTheDocument();
    expect(screen.queryByText('whatsapp')).not.toBeInTheDocument();
  });
});

describe('LeadHistoryTimeline — enquadramento', () => {
  it('o modo compacto continua mostrando o que foi feito e o que o lead respondeu', () => {
    const item = activity({
      deliveryInput: 'Apresentei o Fyness',
      deliveryReport: 'Vai avaliar com o socio',
      plannedAt: '2026-05-12T09:00:00',
      completedAt: '2026-05-12T10:30:00',
    });
    render(<LeadHistoryTimeline items={[item]} stageHistory={STAGE_HISTORY} compact />);

    expect(screen.getByText('Ligação 1')).toBeInTheDocument();
    expect(screen.getByText('Apresentei o Fyness')).toBeInTheDocument();
    expect(screen.getByText('Vai avaliar com o socio')).toBeInTheDocument();
    expect(screen.getByText(/Previsto 09:00 · feito 10:30/)).toBeInTheDocument();
    expect(screen.getByText('Negociação')).toBeInTheDocument();
  });

  it('o cabecalho da etapa diz quando o lead entrou nela e quantos registros tem', () => {
    render(
      <LeadHistoryTimeline
        items={[activity({ id: 'a1' }), activity({ id: 'a2', _date: '2026-05-11T10:00:00' })]}
        stageHistory={STAGE_HISTORY}
      />,
    );
    expect(screen.getByText(/entrou em 10\/05\/2026/)).toBeInTheDocument();
    expect(screen.getByText('2 registros')).toBeInTheDocument();
  });
});
