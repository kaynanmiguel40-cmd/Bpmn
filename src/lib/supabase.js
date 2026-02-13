import { createClient } from '@supabase/supabase-js';
import { createCRUDService } from './serviceFactory';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// ==================== CRIAR USUARIO AUTH ====================

/**
 * Cria um usuario no Supabase Auth sem deslogar o admin atual.
 * Salva a sessao do admin, cria o usuario, e restaura a sessao.
 */
export async function createAuthUser(email, password, fullName) {
  // 1. Salvar sessao atual do admin
  const { data: { session: adminSession } } = await supabase.auth.getSession();

  try {
    // 2. Criar novo usuario
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName },
      },
    });

    if (error) throw error;

    const newUserId = data.user?.id || null;

    // 3. Restaurar sessao do admin
    if (adminSession) {
      await supabase.auth.setSession({
        access_token: adminSession.access_token,
        refresh_token: adminSession.refresh_token,
      });
    }

    return { success: true, userId: newUserId };
  } catch (err) {
    // Restaurar sessao do admin mesmo em caso de erro
    if (adminSession) {
      await supabase.auth.setSession({
        access_token: adminSession.access_token,
        refresh_token: adminSession.refresh_token,
      });
    }
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
