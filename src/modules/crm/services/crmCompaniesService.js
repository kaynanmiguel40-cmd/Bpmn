import { createCRUDService } from '../../../lib/serviceFactory';
import { supabase } from '../../../lib/supabase';
import { toast } from '../../../contexts/ToastContext';
import { crmCompanySchema } from '../schemas/crmValidation';

// ==================== TRANSFORMADOR ====================

export function dbToCrmCompany(row) {
  if (!row) return null;
  return {
    id: row.id,
    name: row.name,
    cnpj: row.cnpj || null,
    segment: row.segment || null,
    size: row.size || null,
    revenue: row.revenue || null,
    phone: row.phone || null,
    email: row.email || null,
    website: row.website || null,
    address: row.address || null,
    city: row.city || null,
    state: row.state || null,
    notes: row.notes || '',
    createdBy: row.created_by || null,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    deletedAt: row.deleted_at || null,
  };
}

// ==================== CRUD VIA FACTORY ====================

const companyService = createCRUDService({
  table: 'crm_companies',
  localKey: 'crm_companies',
  idPrefix: 'crm_comp',
  transform: dbToCrmCompany,
  schema: crmCompanySchema,
  fieldMap: {
    name: 'name',
    cnpj: 'cnpj',
    segment: 'segment',
    size: 'size',
    revenue: 'revenue',
    phone: 'phone',
    email: 'email',
    website: 'website',
    address: 'address',
    city: 'city',
    state: 'state',
    notes: 'notes',
  },
  orderBy: 'name',
  orderAsc: true,
});

// ==================== FUNCOES EXPORTADAS ====================

export async function getCrmCompanies(filters = {}) {
  const { search, segment, page, perPage = 25, sortBy, sortOrder } = filters;

  // Se tem filtros avancados, fazer query customizada
  if (search || segment || sortBy) {
    let query = supabase
      .from('crm_companies')
      .select('*', { count: 'exact' })
      .is('deleted_at', null);

    if (search) {
      query = query.or(`name.ilike.%${search}%,cnpj.ilike.%${search}%,email.ilike.%${search}%`);
    }
    if (segment) {
      query = query.eq('segment', segment);
    }

    query = query.order(sortBy || 'name', { ascending: sortOrder !== 'desc' });

    if (page && perPage) {
      const from = (page - 1) * perPage;
      query = query.range(from, from + perPage - 1);
    }

    const { data, error, count } = await query;
    if (error) {
      toast(`Erro ao buscar empresas: ${error.message}`, 'error');
      return { data: [], count: 0 };
    }
    return {
      data: (data || []).map(dbToCrmCompany),
      count: count || 0,
    };
  }

  // Sem filtros: usar factory
  return companyService.getAll();
}

export async function getCrmCompanyById(id) {
  const { data, error } = await supabase
    .from('crm_companies')
    .select('*')
    .eq('id', id)
    .is('deleted_at', null)
    .single();

  if (error) return null;

  const company = dbToCrmCompany(data);

  // Buscar contatos e deals da empresa
  const [contactsRes, dealsRes] = await Promise.all([
    supabase.from('crm_contacts').select('*').eq('company_id', id).is('deleted_at', null).order('name'),
    supabase.from('crm_deals').select('*').eq('company_id', id).is('deleted_at', null).order('created_at', { ascending: false }),
  ]);

  company.contacts = (contactsRes.data || []).map(r => ({
    id: r.id, name: r.name, email: r.email, phone: r.phone, position: r.position, status: r.status,
  }));
  company.deals = (dealsRes.data || []).map(r => ({
    id: r.id, title: r.title, value: r.value, status: r.status, stageId: r.stage_id,
  }));

  return company;
}

export async function createCrmCompany(data) {
  const session = await supabase.auth.getSession();
  const userId = session.data?.session?.user?.id;
  return companyService.create(data, { created_by: userId });
}

export async function updateCrmCompany(id, updates) {
  return companyService.update(id, updates);
}

export async function softDeleteCrmCompany(id) {
  const { error } = await supabase
    .from('crm_companies')
    .update({ deleted_at: new Date().toISOString() })
    .eq('id', id);

  if (error) {
    toast(`Erro ao excluir empresa: ${error.message}`, 'error');
    return false;
  }
  return true;
}
