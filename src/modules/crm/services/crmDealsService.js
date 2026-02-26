import { createCRUDService } from '../../../lib/serviceFactory';
import { supabase } from '../../../lib/supabase';
import { toast } from '../../../contexts/ToastContext';
import { crmDealSchema } from '../schemas/crmValidation';

// ==================== TRANSFORMADOR ====================

export function dbToCrmDeal(row) {
  if (!row) return null;
  return {
    id: row.id,
    title: row.title,
    value: row.value || 0,
    probability: row.probability ?? 50,
    contactId: row.contact_id || null,
    contact: row.crm_contacts ? {
      id: row.crm_contacts.id,
      name: row.crm_contacts.name,
      avatarColor: row.crm_contacts.avatar_color,
      email: row.crm_contacts.email,
    } : null,
    companyId: row.company_id || null,
    company: row.crm_companies ? {
      id: row.crm_companies.id,
      name: row.crm_companies.name,
    } : null,
    pipelineId: row.pipeline_id || null,
    stageId: row.stage_id || null,
    stage: row.crm_pipeline_stages ? {
      id: row.crm_pipeline_stages.id,
      name: row.crm_pipeline_stages.name,
      color: row.crm_pipeline_stages.color,
    } : null,
    expectedCloseDate: row.expected_close_date || null,
    closedAt: row.closed_at || null,
    status: row.status || 'open',
    lostReason: row.lost_reason || null,
    createdBy: row.created_by || null,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    deletedAt: row.deleted_at || null,
  };
}

// ==================== CRUD VIA FACTORY ====================

const dealService = createCRUDService({
  table: 'crm_deals',
  localKey: 'crm_deals',
  idPrefix: 'crm_dl',
  transform: dbToCrmDeal,
  schema: crmDealSchema,
  fieldMap: {
    title: 'title',
    value: 'value',
    probability: 'probability',
    contactId: 'contact_id',
    companyId: 'company_id',
    pipelineId: 'pipeline_id',
    stageId: 'stage_id',
    expectedCloseDate: 'expected_close_date',
    status: 'status',
    lostReason: 'lost_reason',
  },
  orderBy: 'created_at',
  orderAsc: false,
});

// ==================== FUNCOES EXPORTADAS ====================

export async function getCrmDeals(filters = {}) {
  const { search, status, pipelineId, stageId, contactId, companyId, page, perPage = 25, sortBy, sortOrder } = filters;

  let query = supabase
    .from('crm_deals')
    .select('*, crm_contacts(id, name, avatar_color), crm_companies(id, name), crm_pipeline_stages(id, name, color)', { count: 'exact' })
    .is('deleted_at', null);

  if (search) {
    query = query.ilike('title', `%${search}%`);
  }
  if (status) {
    query = query.eq('status', status);
  }
  if (pipelineId) {
    query = query.eq('pipeline_id', pipelineId);
  }
  if (stageId) {
    query = query.eq('stage_id', stageId);
  }
  if (contactId) {
    query = query.eq('contact_id', contactId);
  }
  if (companyId) {
    query = query.eq('company_id', companyId);
  }

  query = query.order(sortBy || 'created_at', { ascending: sortOrder === 'asc' });

  if (page && perPage) {
    const from = (page - 1) * perPage;
    query = query.range(from, from + perPage - 1);
  }

  const { data, error, count } = await query;
  if (error) {
    toast(`Erro ao buscar negocios: ${error.message}`, 'error');
    return { data: [], count: 0 };
  }
  return {
    data: (data || []).map(dbToCrmDeal),
    count: count || 0,
  };
}

export async function getDealsByPipeline(pipelineId) {
  const { data, error } = await supabase
    .from('crm_deals')
    .select('*, crm_contacts(id, name, avatar_color), crm_companies(id, name)')
    .eq('pipeline_id', pipelineId)
    .eq('status', 'open')
    .is('deleted_at', null)
    .order('created_at');

  if (error) {
    toast(`Erro ao buscar deals do pipeline: ${error.message}`, 'error');
    return [];
  }
  return (data || []).map(dbToCrmDeal);
}

export async function getCrmDealById(id) {
  const { data, error } = await supabase
    .from('crm_deals')
    .select('*, crm_contacts(id, name, avatar_color, email, phone, position), crm_companies(id, name, segment), crm_pipeline_stages(id, name, color)')
    .eq('id', id)
    .is('deleted_at', null)
    .single();

  if (error) return null;
  return dbToCrmDeal(data);
}

export async function createCrmDeal(data) {
  const session = await supabase.auth.getSession();
  const userId = session.data?.session?.user?.id;
  return dealService.create(data, { created_by: userId });
}

export async function updateCrmDeal(id, updates) {
  return dealService.update(id, updates);
}

export async function softDeleteCrmDeal(id) {
  const { error } = await supabase
    .from('crm_deals')
    .update({ deleted_at: new Date().toISOString() })
    .eq('id', id);

  if (error) {
    toast(`Erro ao excluir negocio: ${error.message}`, 'error');
    return false;
  }
  return true;
}

export async function moveDealToStage(dealId, stageId) {
  const { data, error } = await supabase
    .from('crm_deals')
    .update({ stage_id: stageId, updated_at: new Date().toISOString() })
    .eq('id', dealId)
    .select()
    .single();

  if (error) {
    toast(`Erro ao mover negocio: ${error.message}`, 'error');
    return null;
  }
  return dbToCrmDeal(data);
}

export async function markDealAsWon(dealId) {
  const { data, error } = await supabase
    .from('crm_deals')
    .update({
      status: 'won',
      probability: 100,
      closed_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq('id', dealId)
    .select()
    .single();

  if (error) {
    toast(`Erro ao marcar como ganho: ${error.message}`, 'error');
    return null;
  }
  return dbToCrmDeal(data);
}

export async function markDealAsLost(dealId, reason = '') {
  const { data, error } = await supabase
    .from('crm_deals')
    .update({
      status: 'lost',
      probability: 0,
      lost_reason: reason,
      closed_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq('id', dealId)
    .select()
    .single();

  if (error) {
    toast(`Erro ao marcar como perdido: ${error.message}`, 'error');
    return null;
  }
  return dbToCrmDeal(data);
}
