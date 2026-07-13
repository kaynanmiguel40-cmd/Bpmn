import { createCRUDService } from '../../../lib/serviceFactory';
import { supabase } from '../../../lib/supabase';
import { toast } from '../../../contexts/ToastContext';
import { crmContactSchema } from '../schemas/crmValidation';
import { dbToCrmCompany } from './crmCompaniesService';
import { escapeOrIlike } from '../lib/searchFilters';

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
    avatarUrl: row.avatar_url || null,
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
    const s = escapeOrIlike(search);
    query = query.or(`name.ilike.%${s}%,email.ilike.%${s}%,phone.ilike.%${s}%`);
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

  // Whitelist camelCase (UI) -> coluna real; chave desconhecida cai no default
  const SORT_COLUMNS = { name: 'name', createdAt: 'created_at', created_at: 'created_at', status: 'status' };
  query = query.order(SORT_COLUMNS[sortBy] || 'name', { ascending: sortOrder !== 'desc' });

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

/**
 * Busca contato existente por email ou telefone (nessa ordem). Usado so pra
 * avisar o usuario de possivel duplicata na criacao manual — nao bloqueia.
 */
async function findDuplicateContact(email, phone) {
  if (email) {
    const { data } = await supabase.from('crm_contacts').select('id, name').eq('email', email).is('deleted_at', null).limit(1);
    if (data?.length) return data[0];
  }
  if (phone) {
    const { data } = await supabase.from('crm_contacts').select('id, name').eq('phone', phone).is('deleted_at', null).limit(1);
    if (data?.length) return data[0];
  }
  return null;
}

export async function createCrmContact(data) {
  const session = await supabase.auth.getSession();
  const userId = session.data?.session?.user?.id;
  // Gerar cor aleatoria se nao fornecida
  const avatarColors = ['#3b82f6', '#8b5cf6', '#06b6d4', '#10b981', '#f59e0b', '#ec4899', '#f97316', '#6366f1'];
  if (!data.avatarColor) {
    data.avatarColor = avatarColors[Math.floor(Math.random() * avatarColors.length)];
  }

  // Criacao manual nao passa pelo dedup automatico do import CSV — so avisa,
  // nao bloqueia (podem existir contatos parecidos legitimos).
  const dup = await findDuplicateContact(data.email, data.phone);
  if (dup) {
    toast(`Ja existe um contato parecido: "${dup.name}" — verifique antes de duplicar`, 'warning');
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

/**
 * Parser de 1 linha CSV com suporte a campo entre aspas (pode conter virgula
 * e aspas escapadas ""). Split ingenuo por virgula quebrava qualquer campo
 * com virgula dentro (ex: endereco "Rua X, 123"), deslocando as colunas
 * seguintes e corrompendo a linha inteira silenciosamente.
 */
function parseCsvLine(line) {
  const out = [];
  let cur = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const c = line[i];
    if (inQuotes) {
      if (c === '"') {
        if (line[i + 1] === '"') { cur += '"'; i++; }
        else inQuotes = false;
      } else {
        cur += c;
      }
    } else if (c === '"') {
      inQuotes = true;
    } else if (c === ',') {
      out.push(cur.trim());
      cur = '';
    } else {
      cur += c;
    }
  }
  out.push(cur.trim());
  return out;
}

export async function importContactsCSV(csvText) {
  const lines = csvText.trim().split('\n');
  if (lines.length < 2) {
    toast('CSV vazio ou sem dados', 'error');
    return [];
  }

  const headers = parseCsvLine(lines[0]).map(h => h.trim().toLowerCase());
  const contacts = [];

  const session = await supabase.auth.getSession();
  const userId = session.data?.session?.user?.id;

  for (let i = 1; i < lines.length; i++) {
    if (!lines[i].trim()) continue;
    const values = parseCsvLine(lines[i]);
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

  // Dedup contra contatos existentes por e-mail ou telefone (evita duplicar
  // ao reimportar uma lista sobreposta).
  const emails = contacts.map(c => c.email).filter(Boolean);
  const phones = contacts.map(c => c.phone).filter(Boolean);
  let existing = [];
  if (emails.length || phones.length) {
    const orParts = [];
    if (emails.length) orParts.push(`email.in.(${emails.map(e => `"${e}"`).join(',')})`);
    if (phones.length) orParts.push(`phone.in.(${phones.map(p => `"${p}"`).join(',')})`);
    const { data } = await supabase.from('crm_contacts').select('email, phone').is('deleted_at', null).or(orParts.join(','));
    existing = data || [];
  }
  const existingEmails = new Set(existing.map(e => e.email).filter(Boolean));
  const existingPhones = new Set(existing.map(e => e.phone).filter(Boolean));
  const toInsert = contacts.filter(c =>
    !(c.email && existingEmails.has(c.email)) && !(c.phone && existingPhones.has(c.phone))
  );
  const skipped = contacts.length - toInsert.length;

  if (toInsert.length === 0) {
    toast(`Nenhum contato novo — os ${contacts.length} do arquivo ja existem no CRM`, 'warning');
    return [];
  }

  const { data, error } = await supabase
    .from('crm_contacts')
    .insert(toInsert)
    .select();

  if (error) {
    toast(`Erro ao importar: ${error.message}`, 'error');
    return [];
  }

  toast(`${(data || []).length} contato(s) importado(s)` + (skipped > 0 ? ` — ${skipped} ja existiam e foram ignorados` : ''), 'success');
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
