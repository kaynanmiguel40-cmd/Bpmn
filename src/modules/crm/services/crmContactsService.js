import { createCRUDService } from '../../../lib/serviceFactory';
import { supabase } from '../../../lib/supabase';
import { toast } from '../../../contexts/ToastContext';
import { crmContactSchema } from '../schemas/crmValidation';
import { dbToCrmCompany } from './crmCompaniesService';

// ==================== TRANSFORMADOR ====================

export function dbToCrmContact(row) {
  if (!row) return null;
  return {
    id: row.id,
    name: row.name,
    email: row.email || null,
    phone: row.phone || null,
    position: row.position || null,
    avatarColor: row.avatar_color || null,
    status: row.status || 'lead',
    companyId: row.company_id || null,
    company: row.crm_companies ? dbToCrmCompany(row.crm_companies) : null,
    tags: Array.isArray(row.tags) ? row.tags : [],
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

const contactService = createCRUDService({
  table: 'crm_contacts',
  localKey: 'crm_contacts',
  idPrefix: 'crm_ct',
  transform: dbToCrmContact,
  schema: crmContactSchema,
  fieldMap: {
    name: 'name',
    email: 'email',
    phone: 'phone',
    position: 'position',
    avatarColor: 'avatar_color',
    status: 'status',
    companyId: 'company_id',
    tags: 'tags',
    address: 'address',
    city: 'city',
    state: 'state',
    notes: 'notes',
  },
  orderBy: 'name',
  orderAsc: true,
});

// ==================== FUNCOES EXPORTADAS ====================

export async function getCrmContacts(filters = {}) {
  const { search, status, companyId, tag, page, perPage = 25, sortBy, sortOrder } = filters;

  let query = supabase
    .from('crm_contacts')
    .select('*, crm_companies(id, name)', { count: 'exact' })
    .is('deleted_at', null);

  if (search) {
    query = query.or(`name.ilike.%${search}%,email.ilike.%${search}%,phone.ilike.%${search}%`);
  }
  if (status) {
    query = query.eq('status', status);
  }
  if (companyId) {
    query = query.eq('company_id', companyId);
  }
  if (tag) {
    query = query.contains('tags', [tag]);
  }

  query = query.order(sortBy || 'name', { ascending: sortOrder !== 'desc' });

  if (page && perPage) {
    const from = (page - 1) * perPage;
    query = query.range(from, from + perPage - 1);
  }

  const { data, error, count } = await query;
  if (error) {
    toast(`Erro ao buscar contatos: ${error.message}`, 'error');
    return { data: [], count: 0 };
  }
  return {
    data: (data || []).map(dbToCrmContact),
    count: count || 0,
  };
}

export async function getCrmContactById(id) {
  const { data, error } = await supabase
    .from('crm_contacts')
    .select('*, crm_companies(id, name, segment, phone, email)')
    .eq('id', id)
    .is('deleted_at', null)
    .single();

  if (error) return null;

  const contact = dbToCrmContact(data);

  // Buscar atividades e deals do contato
  const [activitiesRes, dealsRes] = await Promise.all([
    supabase.from('crm_activities').select('*').eq('contact_id', id).is('deleted_at', null).order('start_date', { ascending: false }).limit(20),
    supabase.from('crm_deals').select('*').eq('contact_id', id).is('deleted_at', null).order('created_at', { ascending: false }),
  ]);

  contact.activities = (activitiesRes.data || []).map(r => ({
    id: r.id, title: r.title, type: r.type, startDate: r.start_date, completed: r.completed,
  }));
  contact.deals = (dealsRes.data || []).map(r => ({
    id: r.id, title: r.title, value: r.value, status: r.status, stageId: r.stage_id,
  }));

  return contact;
}

export async function createCrmContact(data) {
  const session = await supabase.auth.getSession();
  const userId = session.data?.session?.user?.id;
  // Gerar cor aleatoria se nao fornecida
  const avatarColors = ['#3b82f6', '#8b5cf6', '#06b6d4', '#10b981', '#f59e0b', '#ec4899', '#f97316', '#6366f1'];
  if (!data.avatarColor) {
    data.avatarColor = avatarColors[Math.floor(Math.random() * avatarColors.length)];
  }
  return contactService.create(data, { created_by: userId });
}

export async function updateCrmContact(id, updates) {
  return contactService.update(id, updates);
}

export async function softDeleteCrmContact(id) {
  const { error } = await supabase
    .from('crm_contacts')
    .update({ deleted_at: new Date().toISOString() })
    .eq('id', id);

  if (error) {
    toast(`Erro ao excluir contato: ${error.message}`, 'error');
    return false;
  }
  return true;
}

export async function importContactsCSV(csvText) {
  const lines = csvText.trim().split('\n');
  if (lines.length < 2) {
    toast('CSV vazio ou sem dados', 'error');
    return [];
  }

  const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
  const contacts = [];

  const session = await supabase.auth.getSession();
  const userId = session.data?.session?.user?.id;

  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(',').map(v => v.trim().replace(/^"|"$/g, ''));
    const row = {};
    headers.forEach((h, idx) => { row[h] = values[idx] || ''; });

    if (!row.name && !row.nome) continue;

    contacts.push({
      name: row.name || row.nome,
      email: row.email || '',
      phone: row.phone || row.telefone || '',
      position: row.position || row.cargo || '',
      status: 'lead',
      notes: row.notes || row.observacoes || '',
      created_by: userId,
    });
  }

  if (contacts.length === 0) {
    toast('Nenhum contato valido encontrado no CSV', 'warning');
    return [];
  }

  const { data, error } = await supabase
    .from('crm_contacts')
    .insert(contacts)
    .select();

  if (error) {
    toast(`Erro ao importar: ${error.message}`, 'error');
    return [];
  }

  toast(`${(data || []).length} contato(s) importado(s)`, 'success');
  return (data || []).map(dbToCrmContact);
}

export function exportContactsCSV(contacts) {
  const headers = ['Nome', 'Email', 'Telefone', 'Cargo', 'Status', 'Empresa', 'Cidade', 'Estado', 'Tags'];
  const rows = contacts.map(c => [
    c.name,
    c.email || '',
    c.phone || '',
    c.position || '',
    c.status,
    c.company?.name || '',
    c.city || '',
    c.state || '',
    (c.tags || []).join('; '),
  ].map(v => `"${String(v).replace(/"/g, '""')}"`).join(','));

  return [headers.join(','), ...rows].join('\n');
}
