import { describe, it, expect } from 'vitest';
import { montarAvisoDeAvanco } from '../CrmPipelinePage';

/**
 * A mensagem precisa dizer POR QUE o avanço está sendo questionado. Dizer
 * "nenhuma tarefa concluída" pra quem ligou três vezes é uma frase que a pessoa
 * sabe ser falsa — e uma mensagem que ela sabe ser falsa é uma que ela para de
 * ler. A partir daí o aviso não protege mais nada.
 */
const base = {
  leadName: 'Padaria do João',
  stageAtualNome: 'Primeiro contato',
  stageNovoNome: 'Qualificado',
  pendentes: 0, semContato: 0, semRegistro: 0,
};

describe('montarAvisoDeAvanco', () => {
  it('ninguém atendeu: reconhece a tentativa em vez de dizer que nada foi feito', () => {
    const msg = montarAvisoDeAvanco({ ...base, semContato: 3 });
    expect(msg).toContain('3 tentativas de contato foram feitas');
    expect(msg).toContain('ninguém atendeu');
    expect(msg).not.toContain('Nenhuma tarefa');
  });

  it('uma tentativa só usa o singular', () => {
    expect(montarAvisoDeAvanco({ ...base, semContato: 1 }))
      .toContain('1 tentativa de contato foi feita');
  });

  // Tarefa fechada no automático, sem uma linha do que o lead disse, não é
  // prova de nada: do ponto de vista do funil, não aconteceu.
  it('concluída sem registro: cobra o registro, não o trabalho', () => {
    const msg = montarAvisoDeAvanco({ ...base, semRegistro: 2 });
    expect(msg).toContain('sem registrar o que o lead respondeu');
    expect(msg).not.toContain('ninguém atendeu');
  });

  it('nada feito mesmo: a mensagem simples', () => {
    expect(montarAvisoDeAvanco(base)).toContain('Nenhuma tarefa de "Primeiro contato"');
  });

  // O custo tem que estar à vista: mover APAGA as pendentes da etapa anterior.
  it('sempre avisa quantas tarefas serão apagadas', () => {
    expect(montarAvisoDeAvanco({ ...base, pendentes: 7 })).toContain('apaga 7 tarefas pendentes');
    expect(montarAvisoDeAvanco({ ...base, pendentes: 1 })).toContain('apaga 1 tarefa pendente');
  });

  it('sem pendentes não inventa aviso de perda', () => {
    expect(montarAvisoDeAvanco(base)).not.toContain('apaga');
  });

  it('sem dados não quebra', () => {
    expect(montarAvisoDeAvanco(null)).toBe('');
  });
});
