import { createCRUDService } from './serviceFactory';
import { clientSchema } from './validation';

// ==================== TRANSFORMADOR ====================

export function dbToClient(row) {
  if (!row) return null;
  return {
    id: row.id,
    name: row.name,
    email: row.email || '',
    phone: row.phone || '',
    company: row.company || '',
    notes: row.notes || '',
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

// ==================== SERVICE (via factory) ====================

const clientCRUD = createCRUDService({
  table: 'clients',
  localKey: 'clients',
  idPrefix: 'cli',
  transform: dbToClient,
  schema: clientSchema,
  fieldMap: {
    name: 'name',
    email: 'email',
    phone: 'phone',
    company: 'company',
    notes: 'notes',
  },
});

export const getClients = clientCRUD.getAll;
export const getClientById = clientCRUD.getById;
export const createClient = (client) => clientCRUD.create(client);
export const updateClient = (id, updates) => clientCRUD.update(id, updates);
export const deleteClient = (id) => clientCRUD.remove(id);
