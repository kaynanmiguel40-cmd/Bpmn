import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { PostponeMenu, postponeOptions } from '../PostponeMenu';

/**
 * PostponeMenu — adiar tem que custar 2 cliques E cair sempre num horario que a
 * pessoa realmente vai trabalhar. Um "adiar" que joga a tarefa pras 18h de um
 * sabado e pior que nao adiar: some da fila e ninguem executa.
 *
 * Julho/2026 (calendario usado como referencia fixa nos testes):
 *   13=seg  14=ter  15=qua  16=qui  17=sex  18=sab  19=dom  20=seg
 */

const MIN = (d) => d.getHours() * 60 + d.getMinutes();
const EXPEDIENTE_INICIO = 9 * 60;   // 9h
const EXPEDIENTE_FIM = 18 * 60;     // 18h (fim; nada pode COMECAR as 18h)
const ALMOCO_INICIO = 11 * 60;
const ALMOCO_FIM = 12 * 60;

const dentroDoExpediente = (d) => MIN(d) >= EXPEDIENTE_INICIO && MIN(d) < EXPEDIENTE_FIM;
const dentroDoAlmoco = (d) => MIN(d) >= ALMOCO_INICIO && MIN(d) < ALMOCO_FIM;
const diaUtil = (d) => d.getDay() !== 0 && d.getDay() !== 6;
const byLabel = (opts, label) => opts.find((o) => o.label === label);

describe('postponeOptions — toda opcao cai em horario que existe', () => {
  it('nenhuma opcao cai em sabado ou domingo, em qualquer dia da semana', () => {
    // 13/07 (seg) ate 19/07 (dom), sempre as 10h.
    for (let dia = 13; dia <= 19; dia++) {
      const now = new Date(2026, 6, dia, 10, 0);
      const opts = postponeOptions(now);
      expect(opts.length).toBeGreaterThan(0);
      opts.forEach((o) => {
        expect(
          diaUtil(o.date),
          `"${o.label}" a partir de ${now.toString()} caiu em ${o.date.toString()}`,
        ).toBe(true);
      });
    }
  });

  it('toda opcao comeca dentro do expediente (9h ate antes das 18h)', () => {
    [
      new Date(2026, 6, 15, 9, 30),
      new Date(2026, 6, 15, 10, 0),
      new Date(2026, 6, 15, 13, 0),
      new Date(2026, 6, 15, 14, 30),
      new Date(2026, 6, 17, 10, 0),
    ].forEach((now) => {
      postponeOptions(now).forEach((o) => {
        expect(
          dentroDoExpediente(o.date),
          `"${o.label}" a partir de ${now.toString()} caiu em ${o.date.toString()}`,
        ).toBe(true);
      });
    });
  });

  // BUG (ver relatorio): as 15h45 "Mais tarde hoje" arredonda pra 18h00, que e o
  // FIM do expediente — nao ha slot comecando as 18h.
  it('no fim da tarde "Mais tarde hoje" nao pode cair as 18h (fora do expediente)', () => {
    const opts = postponeOptions(new Date(2026, 6, 15, 15, 45));
    const maisTarde = byLabel(opts, 'Mais tarde hoje');
    if (maisTarde) expect(dentroDoExpediente(maisTarde.date)).toBe(true);
  });

  // BUG (ver relatorio): as 9h "Mais tarde hoje" = 11h30, dentro do almoco.
  it('nenhuma opcao cai dentro do almoco (11h-12h)', () => {
    [
      new Date(2026, 6, 15, 9, 0),
      new Date(2026, 6, 15, 9, 15),
      new Date(2026, 6, 15, 10, 0),
      new Date(2026, 6, 15, 13, 0),
    ].forEach((now) => {
      postponeOptions(now).forEach((o) => {
        expect(
          dentroDoAlmoco(o.date),
          `"${o.label}" a partir de ${now.toString()} caiu no almoco: ${o.date.toString()}`,
        ).toBe(false);
      });
    });
  });

  it('as opcoes de amanha e de segunda nunca caem no almoco', () => {
    [new Date(2026, 6, 15, 9, 0), new Date(2026, 6, 17, 16, 0), new Date(2026, 6, 18, 10, 0)]
      .forEach((now) => {
        postponeOptions(now)
          .filter((o) => o.label !== 'Mais tarde hoje')
          .forEach((o) => expect(dentroDoAlmoco(o.date)).toBe(false));
      });
  });
});

describe('postponeOptions — "Mais tarde hoje"', () => {
  it('some quando ja passou do fim do expediente (as 16h nao cabem mais 2h)', () => {
    [16, 17, 19].forEach((hora) => {
      const opts = postponeOptions(new Date(2026, 6, 15, hora, 0));
      expect(byLabel(opts, 'Mais tarde hoje')).toBeUndefined();
    });
  });

  it('some no fim de semana — sabado e domingo nao tem "hoje" pra trabalhar', () => {
    expect(byLabel(postponeOptions(new Date(2026, 6, 18, 10, 0)), 'Mais tarde hoje')).toBeUndefined();
    expect(byLabel(postponeOptions(new Date(2026, 6, 19, 10, 0)), 'Mais tarde hoje')).toBeUndefined();
  });

  it('aparece no meio do expediente e cai no MESMO dia, sempre no futuro', () => {
    const now = new Date(2026, 6, 15, 13, 0);
    const maisTarde = byLabel(postponeOptions(now), 'Mais tarde hoje');
    expect(maisTarde).toBeDefined();
    expect(maisTarde.date.getDate()).toBe(15);
    expect(maisTarde.date.getTime()).toBeGreaterThan(now.getTime());
  });

  // BUG (ver relatorio): as 23h o "+2h" vira 1h da manha do dia seguinte, passa
  // no teste de "< 18h" e a opcao volta cravada no PASSADO do dia de hoje.
  it('some de madrugada/fim da noite em vez de voltar no passado', () => {
    const now = new Date(2026, 6, 15, 23, 0);
    const maisTarde = byLabel(postponeOptions(now), 'Mais tarde hoje');
    if (maisTarde) expect(maisTarde.date.getTime()).toBeGreaterThan(now.getTime());
  });
});

describe('postponeOptions — amanha e segunda', () => {
  it('"Amanhã de manhã" e antes do meio-dia e "Amanhã à tarde" e depois', () => {
    const opts = postponeOptions(new Date(2026, 6, 15, 10, 0));
    const manha = byLabel(opts, 'Amanhã de manhã');
    const tarde = byLabel(opts, 'Amanhã à tarde');
    expect(MIN(manha.date)).toBeLessThan(12 * 60);
    expect(MIN(tarde.date)).toBeGreaterThanOrEqual(12 * 60);
    // Mesmo dia, turnos diferentes.
    expect(manha.date.getDate()).toBe(tarde.date.getDate());
  });

  it('numa quarta, "Amanhã" e a quinta seguinte', () => {
    const opts = postponeOptions(new Date(2026, 6, 15, 10, 0));
    expect(byLabel(opts, 'Amanhã de manhã').date.getDate()).toBe(16);
  });

  it('na sexta, "Amanhã" pula o fim de semana e vai pra segunda', () => {
    // Contraintuitivo de proposito: o rotulo diz "Amanhã" mas ninguem trabalha
    // lead no sabado — adiar pra sabado equivale a perder a tarefa.
    const opts = postponeOptions(new Date(2026, 6, 17, 10, 0));
    const manha = byLabel(opts, 'Amanhã de manhã');
    expect(manha.date.getDay()).toBe(1);
    expect(manha.date.getDate()).toBe(20);
  });

  it('no sabado e no domingo, "Amanhã" tambem cai na segunda', () => {
    [18, 19].forEach((dia) => {
      const manha = byLabel(postponeOptions(new Date(2026, 6, dia, 10, 0)), 'Amanhã de manhã');
      expect(manha.date.getDay()).toBe(1);
      expect(manha.date.getDate()).toBe(20);
    });
  });

  it('"Segunda de manhã" cai numa segunda-feira e sempre no futuro, em qualquer dia', () => {
    for (let dia = 13; dia <= 19; dia++) {
      const now = new Date(2026, 6, dia, 10, 0);
      const seg = byLabel(postponeOptions(now), 'Segunda de manhã');
      expect(seg.date.getDay(), `partindo do dia ${dia}`).toBe(1);
      expect(seg.date.getTime()).toBeGreaterThan(now.getTime());
    }
  });

  it('numa segunda, "Segunda de manhã" e a proxima semana e nao hoje', () => {
    // (8-1)%7 = 0 → cai no fallback 7, senao a opcao seria o dia de hoje.
    const seg = byLabel(postponeOptions(new Date(2026, 6, 13, 10, 0)), 'Segunda de manhã');
    expect(seg.date.getDate()).toBe(20);
  });

  it('as tres opcoes de outro dia existem sempre, mesmo no fim de semana', () => {
    const opts = postponeOptions(new Date(2026, 6, 19, 22, 0));
    expect(opts.map((o) => o.label)).toEqual(['Amanhã de manhã', 'Amanhã à tarde', 'Segunda de manhã']);
  });

  it('sem argumento usa o agora e devolve datas validas', () => {
    const opts = postponeOptions();
    expect(opts.length).toBeGreaterThanOrEqual(3);
    opts.forEach((o) => {
      expect(o.date instanceof Date).toBe(true);
      expect(Number.isNaN(o.date.getTime())).toBe(false);
    });
  });
});

describe('<PostponeMenu />', () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    vi.setSystemTime(new Date(2026, 6, 15, 10, 0)); // quarta, 10h
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  const abrir = () => fireEvent.click(screen.getByTitle('Adiar esta tarefa'));

  it('comeca fechado e so mostra as opcoes depois do clique', () => {
    render(<PostponeMenu onPick={vi.fn()} />);
    expect(screen.queryByText('Amanhã de manhã')).not.toBeInTheDocument();
    abrir();
    expect(screen.getByText('Amanhã de manhã')).toBeInTheDocument();
    expect(screen.getByText('Amanhã à tarde')).toBeInTheDocument();
    expect(screen.getByText('Segunda de manhã')).toBeInTheDocument();
  });

  it('escolher uma opcao chama onPick com uma Date e fecha o menu', () => {
    const onPick = vi.fn();
    render(<PostponeMenu onPick={onPick} />);
    abrir();
    fireEvent.click(screen.getByText('Amanhã de manhã'));

    expect(onPick).toHaveBeenCalledTimes(1);
    const data = onPick.mock.calls[0][0];
    expect(data instanceof Date).toBe(true);
    expect(data.getDate()).toBe(16);
    expect(data.getHours()).toBe(9);
    expect(screen.queryByText('Amanhã de manhã')).not.toBeInTheDocument();
  });

  it('clicar de novo no botao fecha o menu (toggle)', () => {
    render(<PostponeMenu onPick={vi.fn()} />);
    abrir();
    expect(screen.getByText('Segunda de manhã')).toBeInTheDocument();
    abrir();
    expect(screen.queryByText('Segunda de manhã')).not.toBeInTheDocument();
  });

  it('disabled bloqueia: o menu nao abre e onPick nunca e chamado', () => {
    const onPick = vi.fn();
    render(<PostponeMenu onPick={onPick} disabled />);
    const btn = screen.getByTitle('Adiar esta tarefa');
    expect(btn).toBeDisabled();
    fireEvent.click(btn);
    expect(screen.queryByText('Amanhã de manhã')).not.toBeInTheDocument();
    expect(onPick).not.toHaveBeenCalled();
  });

  it('nao quebra sem onPick — clicar numa opcao so fecha o menu', () => {
    render(<PostponeMenu />);
    abrir();
    fireEvent.click(screen.getByText('Amanhã à tarde'));
    expect(screen.queryByText('Amanhã à tarde')).not.toBeInTheDocument();
  });
});
