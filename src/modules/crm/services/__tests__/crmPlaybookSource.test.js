import { describe, it, expect, vi } from 'vitest';

vi.mock('../../../../lib/supabase', () => ({ supabase: {} }));
vi.mock('../../../../contexts/ToastContext', () => ({ toast: vi.fn() }));

import { dealSourceCategory, filterStepsForDeal } from '../crmPlaybookService';

describe('dealSourceCategory — casa origem baguncada por palavra-chave', () => {
  it('trafego', () => {
    expect(dealSourceCategory('Tráfego pago')).toBe('trafego');
    expect(dealSourceCategory('Trafego pago')).toBe('trafego');
    expect(dealSourceCategory('Anúncio Instagram')).toBe('trafego'); // anuncio ganha
  });
  it('parceiro (cobre tambem contador)', () => {
    expect(dealSourceCategory('Indicação de parceiro (Edson)')).toBe('parceiro');
    expect(dealSourceCategory('Indicação Bruno Contador')).toBe('parceiro');
    expect(dealSourceCategory('Leads de Parceiros')).toBe('parceiro');
  });
  it('instagram/organico (sem anuncio/pago)', () => {
    expect(dealSourceCategory('DM Instagram')).toBe('instagram');
    expect(dealSourceCategory('Instagram orgânico')).toBe('instagram');
  });
  it('desconhecido/vazio -> null', () => {
    expect(dealSourceCategory('Prospecção ativa')).toBeNull();
    expect(dealSourceCategory('')).toBeNull();
    expect(dealSourceCategory(null)).toBeNull();
  });
});

const STEPS = [
  { id: 'a', title: 'Anúncio', sourceTag: 'trafego' },
  { id: 'b', title: 'Parceiro', sourceTag: 'parceiro' },
  { id: 'c', title: 'Instagram', sourceTag: 'instagram' },
  { id: 'd', title: 'Universal', sourceTag: null },
];

describe('filterStepsForDeal', () => {
  it('mostra so o passo da origem + universais', () => {
    const r = filterStepsForDeal(STEPS, 'Tráfego pago').map(s => s.id);
    expect(r).toEqual(['a', 'd']);
  });
  it('parceiro -> passo do parceiro', () => {
    const r = filterStepsForDeal(STEPS, 'Indicação de parceiro (Edson)').map(s => s.id);
    expect(r).toEqual(['b', 'd']);
  });
  it('origem desconhecida -> mostra TODOS (fallback, nao deixa sem roteiro)', () => {
    const r = filterStepsForDeal(STEPS, 'Prospecção ativa').map(s => s.id);
    expect(r).toEqual(['a', 'b', 'c', 'd']);
  });
  it('sem origem -> mostra todos', () => {
    expect(filterStepsForDeal(STEPS, '').map(s => s.id)).toEqual(['a', 'b', 'c', 'd']);
  });
  it('etapa sem passo-por-origem -> devolve tudo (ex: Primeiro contato)', () => {
    const plain = [{ id: 'x', sourceTag: null }, { id: 'y', sourceTag: null }];
    expect(filterStepsForDeal(plain, 'Tráfego pago')).toHaveLength(2);
  });
});
