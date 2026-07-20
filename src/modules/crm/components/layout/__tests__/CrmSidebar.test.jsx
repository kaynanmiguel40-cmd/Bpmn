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

  it('os quatro do dia a dia vêm juntos e nesta ordem', () => {
    abrir();
    const r = rotulos();
    const dia = r.filter(l => ['Agenda', 'Pipeline', 'Inbox WhatsApp', 'Discador'].includes(l));
    expect(dia).toEqual(['Agenda', 'Pipeline', 'Inbox WhatsApp', 'Discador']);
  });

  // Os canais fecham o bloco: primeiro decide-se o que fazer, depois por onde.
  it('os canais (WhatsApp e Discador) vêm depois das duas telas de trabalho', () => {
    abrir();
    const r = rotulos();
    expect(r.indexOf('Inbox WhatsApp')).toBeGreaterThan(r.indexOf('Pipeline'));
    expect(r.indexOf('Discador')).toBeGreaterThan(r.indexOf('Inbox WhatsApp'));
  });

  it('o bloco do dia vem antes de prospecção e gestão', () => {
    abrir();
    const r = rotulos();
    expect(r.indexOf('Discador')).toBeLessThan(r.indexOf('Gerador de Lista'));
    expect(r.indexOf('Discador')).toBeLessThan(r.indexOf('Dashboard'));
  });
});

describe('CrmSidebar — acesso', () => {
  it('seção bloqueada some da navegação', async () => {
    vi.resetModules();
    vi.doMock('../../../hooks/useCrmAccess', () => ({
      useCrmAccess: () => ({ canAccess: (k) => k !== 'discador' }),
    }));
    vi.doMock('../../../hooks/useCrmQueries', () => ({
      useCrmWhatsAppInstances: () => ({ data: [] }),
    }));
    const { CrmSidebar: Restrita } = await import('../CrmSidebar');
    render(<MemoryRouter><Restrita /></MemoryRouter>);
    const r = screen.getAllByRole('link').map(a => a.getAttribute('aria-label'));
    expect(r).not.toContain('Discador');
    // O resto do bloco continua de pé — bloquear um item não derruba o grupo.
    expect(r).toContain('Agenda');
    expect(r).toContain('Pipeline');
  });
});
