import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

vi.mock('../../../hooks/useCrmAccess', () => ({
  useCrmAccess: () => ({ canAccess: () => true }),
}));
vi.mock('../../../hooks/useCrmQueries', () => ({
  useCrmWhatsAppInstances: () => ({ data: [] }),
}));

import { CrmSidebar } from '../CrmSidebar';

const abrir = () => render(<MemoryRouter><CrmSidebar /></MemoryRouter>);

// Só os links de nav, na ordem em que aparecem na tela.
const rotulos = () => screen.getAllByRole('link').map(a => a.getAttribute('aria-label'));

/**
 * A ordem da sidebar não é arrumação: ela é a ordem do dia.
 *
 * A Agenda é o nível de EXECUÇÃO — a tela que responde "o que eu faço agora".
 * A Pipeline só ACOMPANHA: mostra onde cada lead está, não o que fazer com ele.
 * Antes a lista abria na Pipeline e a Agenda ficava por último, o inverso exato
 * de como o dia acontece.
 */
describe('CrmSidebar — ordem do trabalho', () => {
  it('Agenda vem antes da Pipeline', () => {
    abrir();
    const r = rotulos();
    expect(r.indexOf('Agenda')).toBeGreaterThanOrEqual(0);
    expect(r.indexOf('Agenda')).toBeLessThan(r.indexOf('Pipeline'));
  });

  it('o bloco do dia é Agenda, Pipeline e Inbox, nesta ordem', () => {
    abrir();
    const r = rotulos();
    const dia = r.filter(l => ['Agenda', 'Pipeline', 'Inbox WhatsApp'].includes(l));
    expect(dia).toEqual(['Agenda', 'Pipeline', 'Inbox WhatsApp']);
  });

  // O canal fecha o bloco: primeiro decide-se o que fazer, depois por onde.
  it('o Inbox vem depois das duas telas de trabalho', () => {
    abrir();
    const r = rotulos();
    expect(r.indexOf('Inbox WhatsApp')).toBeGreaterThan(r.indexOf('Pipeline'));
  });

  /**
   * O Discador foi REMOVIDO: ligar virou ação dentro da tarefa da Agenda, não
   * uma tela com fila própria. Duas filas com ordens diferentes davam duas
   * respostas pra mesma pergunta — "quem eu ligo agora".
   */
  it('não existe mais item de Discador', () => {
    abrir();
    expect(rotulos()).not.toContain('Discador');
  });

  it('o bloco do dia vem antes de prospecção e gestão', () => {
    abrir();
    const r = rotulos();
    expect(r.indexOf('Inbox WhatsApp')).toBeLessThan(r.indexOf('Gerador de Lista'));
    expect(r.indexOf('Inbox WhatsApp')).toBeLessThan(r.indexOf('Dashboard'));
  });
});

describe('CrmSidebar — acesso', () => {
  it('seção bloqueada some da navegação', async () => {
    vi.resetModules();
    vi.doMock('../../../hooks/useCrmAccess', () => ({
      useCrmAccess: () => ({ canAccess: (k) => k !== 'inbox' }),
    }));
    vi.doMock('../../../hooks/useCrmQueries', () => ({
      useCrmWhatsAppInstances: () => ({ data: [] }),
    }));
    const { CrmSidebar: Restrita } = await import('../CrmSidebar');
    render(<MemoryRouter><Restrita /></MemoryRouter>);
    const r = screen.getAllByRole('link').map(a => a.getAttribute('aria-label'));
    expect(r).not.toContain('Inbox WhatsApp');
    // O resto do bloco continua de pé — bloquear um item não derruba o grupo.
    expect(r).toContain('Agenda');
    expect(r).toContain('Pipeline');
  });
});
