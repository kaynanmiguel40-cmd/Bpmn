import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { CompleteActivityModal } from '../CompleteActivityModal';

/**
 * CompleteActivityModal e usado pra concluir tarefa por FORA da execucao principal
 * da Agenda: tabela do Comparativo, ficha do lead, um fluxo da Agenda. Antes so
 * mandava input/output — a ligacao ficava "sem desfecho" e a taxa de atendimento
 * do placar mentia. Agora ele exige o desfecho da ligacao, igual ao ExecuteTaskModal.
 */

function setup(props = {}) {
  const onSubmit = vi.fn();
  render(
    <CompleteActivityModal
      open
      onClose={vi.fn()}
      activity={{ id: 'a1', title: 'Ligar para o João', type: 'call', completed: false }}
      onSubmit={onSubmit}
      isPending={false}
      {...props}
    />,
  );
  return { onSubmit };
}

const btn = (name) => screen.getByRole('button', { name });
const maybeBtn = (name) => screen.queryByRole('button', { name });

describe('CompleteActivityModal — desfecho da ligacao', () => {
  it('nao deixa concluir uma ligacao sem dizer se atendeu', () => {
    setup();
    expect(btn(/Concluir/)).toBeDisabled();
    // "Pular e concluir" saiu do rodapé: com os dois campos opcionais, ele mandava
    // exatamente o mesmo payload do Concluir. Se voltar, volta com o mesmo trava —
    // por isso a asserção de que ele NÃO existe mais fica registrada aqui.
    expect(maybeBtn(/Pular/)).toBeNull();
  });

  it('"Falei com ele" libera e envia contacted true', () => {
    const { onSubmit } = setup();
    fireEvent.click(btn(/Falei com ele/));
    expect(btn(/Concluir/)).toBeEnabled();
    fireEvent.click(btn(/Concluir/));
    expect(onSubmit).toHaveBeenCalledTimes(1);
    expect(onSubmit.mock.calls[0][0]).toMatchObject({ contacted: true });
  });

  it('"Nao atendeu" conclui com contacted false e output "Não atendeu"', () => {
    const { onSubmit } = setup();
    fireEvent.click(btn(/Não atendeu/));
    fireEvent.click(btn(/Concluir/));
    expect(onSubmit).toHaveBeenCalledWith(
      expect.objectContaining({ contacted: false, output: 'Não atendeu' }),
    );
  });

  it('tarefa que NAO e ligacao nao pede desfecho e manda contacted undefined', () => {
    const { onSubmit } = setup({
      activity: { id: 'a2', title: 'Enviar proposta', type: 'task', completed: false },
    });
    expect(maybeBtn(/Falei com ele/)).toBeNull();
    expect(btn(/Concluir/)).toBeEnabled();
    fireEvent.click(btn(/Concluir/));
    expect(onSubmit.mock.calls[0][0].contacted).toBeUndefined();
  });
});
