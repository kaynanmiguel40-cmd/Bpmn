import { describe, it, expect, vi } from 'vitest';

vi.mock('../../../../lib/supabase', () => ({
  supabase: {
    from: vi.fn(),
    auth: { getSession: vi.fn().mockResolvedValue({ data: { session: null } }) },
  },
}));
vi.mock('../../../../contexts/ToastContext', () => ({ toast: vi.fn() }));
vi.mock('../../../../lib/validation', () => ({
  validateAndSanitize: vi.fn(),
  validatePartial: vi.fn(),
}));
vi.mock('../../schemas/crmValidation', () => ({
  crmProposalSchema: {},
  crmProposalItemSchema: {},
}));

import { dbToCrmProposal, dbToCrmProposalItem } from '../crmProposalsService';

describe('dbToCrmProposalItem', () => {
  it('retorna null pra entrada nula', () => {
    expect(dbToCrmProposalItem(null)).toBeNull();
  });

  it('mapeia campos com defaults numericos', () => {
    const r = dbToCrmProposalItem({
      id: 'i1',
      proposal_id: 'pr1',
      name: 'Servico A',
      description: 'desc',
      quantity: 3,
      unit_price: 100,
      discount_percent: 10,
      subtotal: 270,
    });
    expect(r.id).toBe('i1');
    expect(r.proposalId).toBe('pr1');
    expect(r.name).toBe('Servico A');
    expect(r.description).toBe('desc');
    expect(r.quantity).toBe(3);
    expect(r.unitPrice).toBe(100);
    expect(r.discountPercent).toBe(10);
    expect(r.subtotal).toBe(270);
  });

  it('aplica defaults: quantity=1, unit_price=0, discount=0, subtotal=0', () => {
    const r = dbToCrmProposalItem({ id: 'i1', proposal_id: 'pr1', name: 'X' });
    expect(r.quantity).toBe(1);
    expect(r.unitPrice).toBe(0);
    expect(r.discountPercent).toBe(0);
    expect(r.subtotal).toBe(0);
    expect(r.description).toBe('');
  });
});

describe('dbToCrmProposal', () => {
  it('retorna null pra entrada nula', () => {
    expect(dbToCrmProposal(null)).toBeNull();
  });

  it('mapeia proposta com itens', () => {
    const r = dbToCrmProposal({
      id: 'p1',
      deal_id: 'd1',
      proposal_number: 'PR-2026-0001',
      status: 'sent',
      notes: 'lorem',
      terms: 'ipsum',
      total_value: 5000,
      created_by: 'u1',
      created_at: '2026-04-01',
      updated_at: '2026-04-02',
      crm_proposal_items: [
        { id: 'i1', proposal_id: 'p1', name: 'Item 1', quantity: 2, unit_price: 1000 },
        { id: 'i2', proposal_id: 'p1', name: 'Item 2', quantity: 1, unit_price: 3000 },
      ],
    });
    expect(r.id).toBe('p1');
    expect(r.dealId).toBe('d1');
    expect(r.proposalNumber).toBe('PR-2026-0001');
    expect(r.status).toBe('sent');
    expect(r.notes).toBe('lorem');
    expect(r.terms).toBe('ipsum');
    expect(r.totalValue).toBe(5000);
    expect(r.items).toHaveLength(2);
    expect(r.items[0].name).toBe('Item 1');
    expect(r.items[1].name).toBe('Item 2');
  });

  it('items vira [] quando join ausente', () => {
    const r = dbToCrmProposal({ id: 'p1', deal_id: 'd1' });
    expect(r.items).toEqual([]);
  });

  it('mapeia deal joineado com contact e company', () => {
    const r = dbToCrmProposal({
      id: 'p1',
      deal_id: 'd1',
      crm_deals: {
        id: 'd1',
        title: 'Negocio',
        value: 10000,
        contact_id: 'c1',
        crm_contacts: { id: 'c1', name: 'Joao' },
        crm_companies: { id: 'co1', name: 'Acme' },
      },
    });
    expect(r.deal.id).toBe('d1');
    expect(r.deal.title).toBe('Negocio');
    expect(r.deal.value).toBe(10000);
    expect(r.deal.contactId).toBe('c1');
    expect(r.deal.contact).toEqual({ id: 'c1', name: 'Joao' });
    expect(r.deal.company).toEqual({ id: 'co1', name: 'Acme' });
  });

  it('deal eh null sem join', () => {
    expect(dbToCrmProposal({ id: 'p1' }).deal).toBeNull();
  });

  it('aplica defaults: status=draft, totalValue=0, notes/terms vazias', () => {
    const r = dbToCrmProposal({ id: 'p1' });
    expect(r.status).toBe('draft');
    expect(r.totalValue).toBe(0);
    expect(r.notes).toBe('');
    expect(r.terms).toBe('');
  });
});
