import { supabase } from '../../../lib/supabase';
import { toast } from '../../../contexts/ToastContext';
import { validateAndSanitize, validatePartial } from '../../../lib/validation';
import { crmProposalSchema, crmProposalItemSchema } from '../schemas/crmValidation';

// ==================== TRANSFORMADORES ====================

export function dbToCrmProposal(row) {
  if (!row) return null;
  return {
    id: row.id,
    dealId: row.deal_id || null,
    deal: row.crm_deals ? {
      id: row.crm_deals.id,
      title: row.crm_deals.title,
      value: row.crm_deals.value,
      contactId: row.crm_deals.contact_id,
      contact: row.crm_deals.crm_contacts ? {
        id: row.crm_deals.crm_contacts.id,
        name: row.crm_deals.crm_contacts.name,
      } : null,
      company: row.crm_deals.crm_companies ? {
        id: row.crm_deals.crm_companies.id,
        name: row.crm_deals.crm_companies.name,
      } : null,
    } : null,
    proposalNumber: row.proposal_number,
    status: row.status || 'draft',
    notes: row.notes || '',
    terms: row.terms || '',
    totalValue: row.total_value || 0,
    createdBy: row.created_by || null,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    deletedAt: row.deleted_at || null,
    items: Array.isArray(row.crm_proposal_items)
      ? row.crm_proposal_items.map(dbToCrmProposalItem)
      : [],
  };
}

export function dbToCrmProposalItem(row) {
  if (!row) return null;
  return {
    id: row.id,
    proposalId: row.proposal_id,
    name: row.name,
    description: row.description || '',
    quantity: row.quantity || 1,
    unitPrice: row.unit_price || 0,
    discountPercent: row.discount_percent || 0,
    subtotal: row.subtotal || 0,
    createdAt: row.created_at,
  };
}

// ==================== FUNCOES EXPORTADAS ====================

export async function getCrmProposals(filters = {}) {
  const { dealId, status, search, page, perPage = 25 } = filters;

  let query = supabase
    .from('crm_proposals')
    .select('*, crm_deals(id, title, value, contact_id, crm_contacts(id, name), crm_companies(id, name)), crm_proposal_items(*)', { count: 'exact' })
    .is('deleted_at', null)
    .order('created_at', { ascending: false });

  if (dealId) {
    query = query.eq('deal_id', dealId);
  }
  if (status) {
    query = query.eq('status', status);
  }
  if (search) {
    query = query.or(`proposal_number.ilike.%${search}%,crm_deals.title.ilike.%${search}%`);
  }

  if (page && perPage) {
    const from = (page - 1) * perPage;
    query = query.range(from, from + perPage - 1);
  }

  const { data, error, count } = await query;
  if (error) {
    toast(`Erro ao buscar propostas: ${error.message}`, 'error');
    return { data: [], count: 0 };
  }
  return {
    data: (data || []).map(dbToCrmProposal),
    count: count || 0,
  };
}

export async function getCrmProposalById(id) {
  const { data, error } = await supabase
    .from('crm_proposals')
    .select('*, crm_deals(id, title, value, contact_id, company_id), crm_proposal_items(*)')
    .eq('id', id)
    .is('deleted_at', null)
    .single();

  if (error) return null;
  return dbToCrmProposal(data);
}

export async function createCrmProposal(proposalData) {
  const { items, ...proposal } = proposalData;

  const validation = validateAndSanitize(crmProposalSchema, proposal);
  if (!validation.success) {
    toast(validation.error, 'error');
    return null;
  }

  const session = await supabase.auth.getSession();
  const userId = session.data?.session?.user?.id;

  // Calcular total se nao fornecido
  let totalValue = validation.data.totalValue || 0;
  if (items && items.length > 0 && totalValue === 0) {
    totalValue = items.reduce((sum, item) => {
      const sub = (item.quantity || 1) * (item.unitPrice || 0) * (1 - (item.discountPercent || 0) / 100);
      return sum + sub;
    }, 0);
  }

  // Inserir proposta
  const { data: created, error } = await supabase
    .from('crm_proposals')
    .insert([{
      deal_id: validation.data.dealId,
      status: validation.data.status,
      notes: validation.data.notes,
      terms: validation.data.terms,
      total_value: totalValue,
      created_by: userId,
    }])
    .select()
    .single();

  if (error) {
    toast(`Erro ao criar proposta: ${error.message}`, 'error');
    return null;
  }

  // Inserir itens
  if (items && items.length > 0) {
    const itemRows = items.map(item => ({
      proposal_id: created.id,
      name: item.name,
      description: item.description || '',
      quantity: item.quantity || 1,
      unit_price: item.unitPrice || 0,
      discount_percent: item.discountPercent || 0,
      subtotal: item.subtotal || ((item.quantity || 1) * (item.unitPrice || 0) * (1 - (item.discountPercent || 0) / 100)),
    }));

    await supabase.from('crm_proposal_items').insert(itemRows);
  }

  return getCrmProposalById(created.id);
}

export async function updateCrmProposal(id, updates) {
  const { items, ...proposalUpdates } = updates;

  const validation = validatePartial(crmProposalSchema, proposalUpdates);
  if (!validation.success) {
    toast(validation.error, 'error');
    return null;
  }

  const updateData = {};
  if (validation.data.status !== undefined) updateData.status = validation.data.status;
  if (validation.data.notes !== undefined) updateData.notes = validation.data.notes;
  if (validation.data.terms !== undefined) updateData.terms = validation.data.terms;
  if (validation.data.totalValue !== undefined) updateData.total_value = validation.data.totalValue;

  if (Object.keys(updateData).length > 0) {
    const { error } = await supabase
      .from('crm_proposals')
      .update(updateData)
      .eq('id', id);

    if (error) {
      toast(`Erro ao atualizar proposta: ${error.message}`, 'error');
      return null;
    }
  }

  // Substituir itens se fornecidos
  if (items) {
    await supabase.from('crm_proposal_items').delete().eq('proposal_id', id);

    if (items.length > 0) {
      const itemRows = items.map(item => ({
        proposal_id: id,
        name: item.name,
        description: item.description || '',
        quantity: item.quantity || 1,
        unit_price: item.unitPrice || 0,
        discount_percent: item.discountPercent || 0,
        subtotal: item.subtotal || ((item.quantity || 1) * (item.unitPrice || 0) * (1 - (item.discountPercent || 0) / 100)),
      }));

      await supabase.from('crm_proposal_items').insert(itemRows);
    }

    // Recalcular total
    const newTotal = (items || []).reduce((sum, item) => {
      return sum + (item.subtotal || ((item.quantity || 1) * (item.unitPrice || 0) * (1 - (item.discountPercent || 0) / 100)));
    }, 0);

    await supabase.from('crm_proposals').update({ total_value: newTotal }).eq('id', id);
  }

  return getCrmProposalById(id);
}

export async function softDeleteCrmProposal(id) {
  const { error } = await supabase
    .from('crm_proposals')
    .update({ deleted_at: new Date().toISOString() })
    .eq('id', id);

  if (error) {
    toast(`Erro ao excluir proposta: ${error.message}`, 'error');
    return false;
  }
  return true;
}

export async function updateCrmProposalStatus(id, status) {
  const { data, error } = await supabase
    .from('crm_proposals')
    .update({ status, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    toast(`Erro ao atualizar status: ${error.message}`, 'error');
    return null;
  }
  return dbToCrmProposal(data);
}
