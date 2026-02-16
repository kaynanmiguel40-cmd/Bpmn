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
 * Tambem atualiza o role no profile usando o client isolado
 * (que tem a sessao do novo usuario, evitando problemas de RLS).
 */
export async function createAuthUser(email, password, fullName, profileRole = 'collaborator') {
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

    if (newUserId) {
      // Pequeno delay para garantir que o trigger handle_new_user ja criou o profile
      await new Promise(resolve => setTimeout(resolve, 500));

      // Atualizar role no profiles usando o client isolado.
      // O isolated client tem a sessao do novo usuario em memoria,
      // entao a policy "profiles_update_own" (auth.uid() = id) permite o UPDATE.
      if (profileRole !== 'collaborator') {
        const { error: profileError } = await isolated
          .from('profiles')
          .update({ role: profileRole })
          .eq('id', newUserId);

        if (profileError) {
          console.warn('Aviso: nao foi possivel definir role no profiles:', profileError.message);
          await new Promise(resolve => setTimeout(resolve, 1000));
          await isolated.from('profiles').update({ role: profileRole }).eq('id', newUserId);
        }
      }

      // Criar registro em user_profiles (tabela usada pela UI para nome, cargo, etc.)
      // Sem isso o usuario aparece como "Sem nome" ao logar.
      const { error: upError } = await isolated
        .from('user_profiles')
        .upsert([{
          id: newUserId,
          name: fullName,
          email,
          role: profileRole === 'manager' ? 'Gestor' : '',
          updated_at: new Date().toISOString(),
        }], { onConflict: 'id' });

      // Se falhou com o client isolado, tentar com o client principal (admin logado)
      if (upError) {
        console.warn('user_profiles upsert falhou no isolated client, tentando com client principal:', upError.message);
        await supabase
          .from('user_profiles')
          .upsert([{
            id: newUserId,
            name: fullName,
            email,
            role: profileRole === 'manager' ? 'Gestor' : '',
            updated_at: new Date().toISOString(),
          }], { onConflict: 'id' });
      }
    }

    return { success: true, userId: newUserId };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

/**
 * Atualiza o role de um usuario no profile.
 * Usa RPC (funcao SQL SECURITY DEFINER) para contornar RLS.
 * Fallback: tenta UPDATE direto caso a funcao RPC nao exista.
 */
export async function updateProfileRole(userId, role) {
  try {
    // Tentar via RPC (funcao segura que permite manager atualizar roles)
    const { error: rpcError } = await supabase.rpc('set_user_role', {
      target_user_id: userId,
      new_role: role,
    });

    if (!rpcError) return { success: true };

    // Fallback: UPDATE direto (funciona se usuario atual for admin)
    const { error } = await supabase
      .from('profiles')
      .update({ role })
      .eq('id', userId);

    if (error) {
      console.error('Erro ao atualizar role do profile:', error.message);
      return { success: false, error: error.message };
    }
    return { success: true };
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
