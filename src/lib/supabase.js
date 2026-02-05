import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ydiwxlrkrmygpdfacpkt.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlkaXd4bHJrcm15Z3BkZmFjcGt0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzAwNzAwMTIsImV4cCI6MjA4NTY0NjAxMn0.uMqOpfKiRSpyaG0Da47KZWI5rOm7_Negsd5VU8J8RiI';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// ==================== COMPANIES ====================

export async function getCompanies() {
  const { data, error } = await supabase
    .from('companies')
    .select('*')
    .order('created_at', { ascending: true });

  if (error) {
    console.log('⚠️ Supabase não conectado, usando localStorage');
    // FALLBACK: localStorage
    const localCompanies = JSON.parse(localStorage.getItem('bpmn_companies') || '[]');
    return localCompanies;
  }
  return data || [];
}

export async function createCompany(company) {
  const { data, error } = await supabase
    .from('companies')
    .insert([{
      name: company.name,
      color_index: company.colorIndex || 0
    }])
    .select()
    .single();

  if (error) {
    console.log('⚠️ Supabase não conectado, criando empresa no localStorage');
    // FALLBACK: localStorage
    const localCompanies = JSON.parse(localStorage.getItem('bpmn_companies') || '[]');
    const newCompany = {
      id: `local_company_${Date.now()}`,
      name: company.name,
      color_index: company.colorIndex || 0,
      created_at: new Date().toISOString()
    };
    localCompanies.push(newCompany);
    localStorage.setItem('bpmn_companies', JSON.stringify(localCompanies));
    console.log('✅ Empresa criada no localStorage!');
    return newCompany;
  }
  return data;
}

export async function updateCompany(id, updates) {
  const { data, error } = await supabase
    .from('companies')
    .update({
      name: updates.name,
      color_index: updates.colorIndex,
      updated_at: new Date().toISOString()
    })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error updating company:', error);
    return null;
  }
  return data;
}

export async function deleteCompany(id) {
  const { error } = await supabase
    .from('companies')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting company:', error);
    return false;
  }
  return true;
}

// ==================== PROJECTS/FLOWS ====================

export async function getProjects() {
  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .order('created_at', { ascending: true });

  if (error) {
    console.error('Error fetching projects (usando localStorage):', error);
    // FALLBACK: localStorage
    const localProjects = JSON.parse(localStorage.getItem('bpmn_projects') || '[]');
    return localProjects;
  }
  return data || [];
}

export async function getProjectById(id) {
  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    console.error('Error fetching project (usando localStorage):', error);
    // FALLBACK: localStorage
    const localProjects = JSON.parse(localStorage.getItem('bpmn_projects') || '[]');
    const project = localProjects.find(p => p.id === id);
    return project || null;
  }
  return data;
}

export async function createProject(project) {
  const { data, error } = await supabase
    .from('projects')
    .insert([{
      name: project.name,
      xml: project.xml,
      company_id: project.companyId,
      parent_id: project.parentId || null,
      level: project.level || 0,
      is_root: project.isRoot || false,
      is_template: project.isTemplate || false
    }])
    .select()
    .single();

  if (error) {
    console.error('Error creating project (usando localStorage):', error);
    // FALLBACK: localStorage
    const localProjects = JSON.parse(localStorage.getItem('bpmn_projects') || '[]');
    const newProject = {
      id: `local_${Date.now()}`,
      name: project.name,
      xml: project.xml,
      company_id: project.companyId,
      parent_id: project.parentId || null,
      level: project.level || 0,
      is_root: project.isRoot || false,
      is_template: project.isTemplate || false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    localProjects.push(newProject);
    localStorage.setItem('bpmn_projects', JSON.stringify(localProjects));
    console.log('✅ Projeto criado no localStorage!');
    return newProject;
  }
  return data;
}

export async function updateProject(id, updates) {
  const updateData = {
    updated_at: new Date().toISOString()
  };

  if (updates.name !== undefined) updateData.name = updates.name;
  if (updates.xml !== undefined) updateData.xml = updates.xml;
  if (updates.companyId !== undefined) updateData.company_id = updates.companyId;
  if (updates.parentId !== undefined) updateData.parent_id = updates.parentId;
  if (updates.level !== undefined) updateData.level = updates.level;
  if (updates.isRoot !== undefined) updateData.is_root = updates.isRoot;

  const { data, error } = await supabase
    .from('projects')
    .update(updateData)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.log('⚠️ Supabase não conectado, usando localStorage como fallback');

    // FALLBACK: localStorage
    try {
      const localProjects = JSON.parse(localStorage.getItem('bpmn_projects') || '[]');
      const projectIndex = localProjects.findIndex(p => p.id === id);

      if (projectIndex >= 0) {
        // Atualizar projeto existente
        localProjects[projectIndex] = {
          ...localProjects[projectIndex],
          ...updateData,
          name: updates.name !== undefined ? updates.name : localProjects[projectIndex].name,
          xml: updates.xml !== undefined ? updates.xml : localProjects[projectIndex].xml,
          company_id: updates.companyId !== undefined ? updates.companyId : localProjects[projectIndex].company_id,
          parent_id: updates.parentId !== undefined ? updates.parentId : localProjects[projectIndex].parent_id,
          level: updates.level !== undefined ? updates.level : localProjects[projectIndex].level,
          is_root: updates.isRoot !== undefined ? updates.isRoot : localProjects[projectIndex].is_root
        };

        localStorage.setItem('bpmn_projects', JSON.stringify(localProjects));
        console.log('✅ Salvo no localStorage!', { id, updates });
        return localProjects[projectIndex];
      } else {
        console.error('Projeto não encontrado no localStorage:', id);
        return null;
      }
    } catch (localError) {
      console.error('Error salvando no localStorage:', localError);
      return null;
    }
  }
  return data;
}

export async function deleteProject(id) {
  const { error } = await supabase
    .from('projects')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting project:', error);
    return false;
  }
  return true;
}

// ==================== HELPER TO CONVERT DB FORMAT ====================

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

export function dbToCompany(dbCompany) {
  if (!dbCompany) return null;
  return {
    id: dbCompany.id,
    name: dbCompany.name,
    colorIndex: dbCompany.color_index,
    createdAt: dbCompany.created_at
  };
}
