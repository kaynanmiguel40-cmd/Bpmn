import { describe, it, expect } from 'vitest';
import {
  cleanStepTitle, taskHeadline, relativeDayLabel, isOverdue, isCold, COLD_AFTER_DAYS, formatWhen,
} from '../stepLabel';

describe('cleanStepTitle', () => {
  it('tira o prefixo de agendamento do seed', () => {
    expect(cleanStepTitle('D2 13h — Ligação 3 (almoço)')).toBe('Ligação 3 (almoço)');
    expect(cleanStepTitle('D1 manhã — WhatsApp')).toBe('WhatsApp');
    expect(cleanStepTitle('D0 tarde — Ligação (3 tentativas)')).toBe('Ligação (3 tentativas)');
  });

  it('titulo sem prefixo passa intacto', () => {
    expect(cleanStepTitle('Mandar a proposta')).toBe('Mandar a proposta');
  });

  it('nao quebra com vazio', () => {
    expect(cleanStepTitle('')).toBe('');
    expect(cleanStepTitle(null)).toBe('');
  });
});

describe('taskHeadline', () => {
  it('usa o verbo do canal + nome do lead', () => {
    expect(taskHeadline('D1 manhã — Ligação (3 tentativas)', 'Padaria do João'))
      .toBe('Ligar para Padaria do João');
    expect(taskHeadline('D2 — WhatsApp com a cartilha', 'Auto Peças Zé'))
      .toBe('Mandar WhatsApp para Auto Peças Zé');
    expect(taskHeadline('D3 — E-mail de proposta', 'Ótica Visão'))
      .toBe('Mandar e-mail para Ótica Visão');
  });

  it('reuniao usa "com", nao "para"', () => {
    expect(taskHeadline('Reunião de diagnóstico', 'Salão da Ana'))
      .toBe('Reunião com Salão da Ana');
  });

  // Tarefa avulsa nao tem canal a inferir — inventar um verbo seria pior que
  // respeitar o texto que a pessoa escreveu.
  it('sem lead devolve o titulo original', () => {
    expect(taskHeadline('Comprar café', null)).toBe('Comprar café');
  });

  // O titulo do banco vem com espaco sobrando ("Cobrar o edson ... tata ").
  // Devolver cru aqui e limpo no taskDetail fazia as duas strings diferirem por
  // um espaco invisivel, e a fila escrevia a mesma frase duas vezes seguidas.
  it('normaliza o titulo mesmo sem lead — bate com taskDetail', () => {
    const sujo = 'Cobrar o edson para reativar o vanderley tata ';
    expect(taskHeadline(sujo, null)).toBe('Cobrar o edson para reativar o vanderley tata');
    expect(taskHeadline(sujo, null)).toBe(cleanStepTitle(sujo));
  });

  it('tira o prefixo de agendamento tambem quando nao ha lead', () => {
    expect(taskHeadline('D2 13h — Ligação 3', null)).toBe('Ligação 3');
  });
});

describe('relativeDayLabel', () => {
  const hoje = new Date(2026, 6, 20, 10, 0);

  it('conta em dias, nao em horas', () => {
    // 20/07 as 09:00 ja passou no relogio, mas ainda e HOJE.
    expect(relativeDayLabel(new Date(2026, 6, 20, 9, 0).toISOString(), hoje)).toBe('hoje');
    expect(relativeDayLabel(new Date(2026, 6, 19, 23, 0).toISOString(), hoje)).toBe('ontem');
    expect(relativeDayLabel(new Date(2026, 6, 17, 9, 0).toISOString(), hoje)).toBe('há 3 dias');
    expect(relativeDayLabel(new Date(2026, 6, 21, 9, 0).toISOString(), hoje)).toBe('amanhã');
  });
});

describe('isOverdue', () => {
  const hoje = new Date(2026, 6, 20, 15, 0);

  // O ponto todo: a ligacao das 9h nao vira "atrasada" as 9h01 com a pessoa
  // ainda no telefone. So no dia seguinte.
  it('tarefa de hoje que ja passou da hora NAO conta como atrasada', () => {
    expect(isOverdue({ startDate: new Date(2026, 6, 20, 9, 0).toISOString() }, hoje)).toBe(false);
  });

  it('tarefa de ontem pendente conta', () => {
    expect(isOverdue({ startDate: new Date(2026, 6, 19, 9, 0).toISOString() }, hoje)).toBe(true);
  });

  it('concluida nunca conta', () => {
    expect(isOverdue({ startDate: new Date(2026, 6, 1).toISOString(), completed: true }, hoje)).toBe(false);
  });
});

describe('isCold', () => {
  const hoje = new Date(2026, 6, 20, 10, 0);

  it(`atrasada ate ${COLD_AFTER_DAYS} dias ainda e recuperavel`, () => {
    const d = new Date(2026, 6, 20 - COLD_AFTER_DAYS, 9, 0);
    expect(isCold({ startDate: d.toISOString() }, hoje)).toBe(false);
  });

  it(`acima de ${COLD_AFTER_DAYS} dias vira toque frio`, () => {
    const d = new Date(2026, 6, 20 - COLD_AFTER_DAYS - 1, 9, 0);
    expect(isCold({ startDate: d.toISOString() }, hoje)).toBe(true);
  });

  it('tarefa de hoje nunca e fria', () => {
    expect(isCold({ startDate: hoje.toISOString() }, hoje)).toBe(false);
  });
});

// A faixa inicio–fim importa porque a tarefa OCUPA a agenda: saber que a
// ligacao e "09:00" nao diz se da tempo de encaixar outra coisa as 09:15.
describe('formatWhen', () => {
  const ini = new Date(2026, 6, 20, 9, 0).toISOString();
  const fim = new Date(2026, 6, 20, 9, 30).toISOString();

  it('mostra dia + faixa de horario', () => {
    const s = formatWhen(ini, fim);
    expect(s).toContain('20/07');
    expect(s).toContain('09:00–09:30');
  });

  it('sem dia quando a tela ja diz qual e', () => {
    expect(formatWhen(ini, fim, { comDia: false })).toBe('09:00–09:30');
  });

  it('sem fim, mostra so o inicio — repetir o mesmo horario e ruido', () => {
    expect(formatWhen(ini, null, { comDia: false })).toBe('09:00');
  });

  it('fim igual ao inicio nao vira faixa', () => {
    expect(formatWhen(ini, ini, { comDia: false })).toBe('09:00');
  });

  it('sem data nao quebra', () => {
    expect(formatWhen(null, null)).toBe('');
  });
});
