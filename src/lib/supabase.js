import { createClient } from '@supabase/supabase-js';
import { supabase } from './supabaseClient';
import { createCRUDService } from './serviceFactory';

export { supabase };

// ==================== CRIAR USUARIO AUTH ====================

/**
 * Client separado para criar usuarios sem afetar a sessao do admin.
 * Usa persistSession: false para nao interferir no onAuthStateChange.
 */
let _isolatedClient = null;
function getIsolatedClient() {
  if (!_isolatedClient) {
    _isolatedClient = createClient(
      import.meta.env.VITE_SUPABASE_URL,
      import.meta.env.VITE_SUPABASE_ANON_KEY,
      {
        auth: {
          storageKey: 'supabase-admin-ops',
          persistSession: false,
          autoRefreshToken: false,
          detectSessionInUrl: false,
        },
      }
    );
  }
  return _isolatedClient;
}

/**
 * Cria um usuario no Supabase Auth sem deslogar o admin atual.
 * Usa um client isolado para nao afetar a sessao principal.
 */
export async function createAuthUser(email, password, fullName) {
  try {
    const isolated = getIsolatedClient();

    const { data, error } = await isolated.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName },
      },
    });

    if (error) throw error;

    const newUserId = data.user?.id || null;
    return { success: true, userId: newUserId };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

// ==================== TRANSFORMADORES ====================

export function dbToCompany(dbCompany) {
  if (!dbCompany) return null;
  return {
    id: dbCompany.id,
    name: dbCompany.name,
    colorIndex: dbCompany.color_index,
    image: dbCompany.image || null,
    createdAt: dbCompany.created_at
  };
}

export function dbToProject(dbProject) {
  if (!dbProject) return null;
  return {
    id: dbProject.id,
    name: dbProject.name,
    xml: dbProject.xml,
    companyId: dbProject.company_id,
    parentId: dbProject.parent_id,
    level: dbProject.level,
    isRoot: dbProject.is_root,
    isTemplate: dbProject.is_template,
    createdAt: dbProject.created_at,
    updatedAt: dbProject.updated_at
  };
}

// ==================== COMPANIES (via factory) ====================

const companyService = createCRUDService({
  table: 'companies',
  localKey: 'bpmn_companies',
  idPrefix: 'local_company',
  transform: dbToCompany,
  fieldMap: {
    name: 'name',
    colorIndex: 'color_index',
    image: 'image',
  },
});

export const getCompanies = companyService.getAll;
export const createCompany = (company) => companyService.create(company);
export const updateCompany = (id, updates) => companyService.update(id, updates);
export const deleteCompany = (id) => companyService.remove(id);

// ==================== PROJECTS (via factory) ====================

const projectService = createCRUDService({
  table: 'projects',
  localKey: 'bpmn_projects',
  idPrefix: 'local',
  transform: dbToProject,
  fieldMap: {
    name: 'name',
    xml: 'xml',
    companyId: 'company_id',
    parentId: 'parent_id',
    level: 'level',
    isRoot: 'is_root',
    isTemplate: 'is_template',
  },
});

export const getProjects = projectService.getAll;
export const getProjectById = (id) => projectService.getById(id);
export const createProject = (project) => projectService.create(project);
export const updateProject = (id, updates) => projectService.update(id, updates);
export const deleteProject = (id) => projectService.remove(id);
