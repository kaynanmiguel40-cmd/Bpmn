import { describe, it, expect, vi } from 'vitest';

// Mock supabase pra evitar import quebrar
vi.mock('../../../../lib/supabase', () => ({
  supabase: {
    from: vi.fn(),
    auth: { getSession: vi.fn().mockResolvedValue({ data: { session: null } }) },
    functions: { invoke: vi.fn() },
  },
}));

import { renderTemplate } from '../crmAutomationsService';

describe('renderTemplate', () => {
  it('retorna string vazia para texto vazio', () => {
    expect(renderTemplate('', {})).toBe('');
    expect(renderTemplate(null, {})).toBe('');
    expect(renderTemplate(undefined, {})).toBe('');
  });

  it('retorna texto inalterado quando nao ha placeholders', () => {
    expect(renderTemplate('Ola, mundo!', { contactName: 'X' })).toBe('Ola, mundo!');
  });

  it('substitui {nome} pelo contact.name', () => {
    const r = renderTemplate('Ola {nome}', { contact: { name: 'Joao' } });
    expect(r).toBe('Ola Joao');
  });

  it('cai para contactName se contact.name estiver ausente', () => {
    const r = renderTemplate('Ola {nome}', { contactName: 'Maria' });
    expect(r).toBe('Ola Maria');
  });

  it('substitui {empresa} pelo company.name', () => {
    expect(renderTemplate('De {empresa}', { company: { name: 'Acme' } })).toBe('De Acme');
  });

  it('formata {valor} em BRL', () => {
    const out = renderTemplate('Total {valor}', { value: 1234.5 });
    // pt-BR currency: "R$ 1.234,50" (espaco pode ser nbsp)
    expect(out).toMatch(/R\$\s?1\.234,50/);
  });

  it('{valor} com value 0 ainda formata', () => {
    const out = renderTemplate('Valor {valor}', { value: 0 });
    expect(out).toMatch(/R\$\s?0,00/);
  });

  it('{valor} com value ausente vira string vazia', () => {
    expect(renderTemplate('Valor {valor}', {})).toBe('Valor ');
  });

  it('substitui {etapa} pelo stage.name', () => {
    expect(renderTemplate('Etapa {etapa}', { stage: { name: 'Qualificado' } })).toBe('Etapa Qualificado');
  });

  it('substitui {vendedor} pelo owner.name', () => {
    expect(renderTemplate('Vendedor: {vendedor}', { owner: { name: 'Carlos' } })).toBe('Vendedor: Carlos');
  });

  it('eh case-insensitive nos placeholders', () => {
    const deal = { contact: { name: 'Joao' } };
    expect(renderTemplate('{NOME}', deal)).toBe('Joao');
    expect(renderTemplate('{Nome}', deal)).toBe('Joao');
    expect(renderTemplate('{nome}', deal)).toBe('Joao');
  });

  it('aceita espacos extras dentro do placeholder', () => {
    expect(renderTemplate('{ nome }', { contact: { name: 'Joao' } })).toBe('Joao');
  });

  it('preserva placeholders desconhecidos', () => {
    expect(renderTemplate('Ola {desconhecido}', {})).toBe('Ola {desconhecido}');
  });

  it('substitui multiplos placeholders no mesmo texto', () => {
    const deal = {
      contact: { name: 'Joao' },
      company: { name: 'Acme' },
      stage: { name: 'Proposta' },
      value: 5000,
    };
    const out = renderTemplate('{nome} ({empresa}) na etapa {etapa} - {valor}', deal);
    expect(out).toContain('Joao');
    expect(out).toContain('(Acme)');
    expect(out).toContain('Proposta');
    expect(out).toMatch(/R\$\s?5\.000,00/);
  });

  it('{nome} com tudo ausente retorna string vazia para o placeholder', () => {
    expect(renderTemplate('Ola {nome}!', {})).toBe('Ola !');
  });

  it('nao quebra se deal for null', () => {
    expect(renderTemplate('Ola {nome}', null)).toBe('Ola ');
  });

  it('placeholders adjacentes funcionam', () => {
    const out = renderTemplate('{nome}{empresa}', {
      contact: { name: 'Joao' },
      company: { name: 'Acme' },
    });
    expect(out).toBe('JoaoAcme');
  });

  it('texto com chaves literais (sem nome de variavel) nao quebra', () => {
    expect(renderTemplate('Use {} para X', {})).toBe('Use {} para X');
  });

  it('valor nao-numerico em value retorna placeholder vazio', () => {
    expect(renderTemplate('{valor}', { value: 'abc' })).toBe('');
    expect(renderTemplate('{valor}', { value: null })).toBe('');
  });
});
