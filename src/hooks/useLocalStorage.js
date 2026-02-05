import { useState, useEffect, useCallback } from 'react';

const STORAGE_KEY = 'fyness-bpmn-projects';

/**
 * Hook para gerenciar projetos BPMN no LocalStorage
 */
export function useLocalStorage() {
  const [projects, setProjects] = useState([]);

  // Carregar projetos do LocalStorage na inicialização
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setProjects(parsed);
      } catch (e) {
        console.error('Erro ao carregar projetos:', e);
        setProjects([]);
      }
    }
  }, []);

  // Salvar projetos no LocalStorage sempre que mudarem
  const persistProjects = useCallback((newProjects) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newProjects));
    setProjects(newProjects);
  }, []);

  // Criar novo projeto
  const createProject = useCallback((name, xml, isTemplate = false) => {
    const newProject = {
      id: `project_${Date.now()}`,
      name,
      xml,
      isTemplate,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const newProjects = [...projects, newProject];
    persistProjects(newProjects);
    return newProject;
  }, [projects, persistProjects]);

  // Atualizar projeto existente
  const updateProject = useCallback((id, updates) => {
    const newProjects = projects.map((p) =>
      p.id === id
        ? { ...p, ...updates, updatedAt: new Date().toISOString() }
        : p
    );
    persistProjects(newProjects);
  }, [projects, persistProjects]);

  // Deletar projeto
  const deleteProject = useCallback((id) => {
    const newProjects = projects.filter((p) => p.id !== id);
    persistProjects(newProjects);
  }, [projects, persistProjects]);

  // Obter projeto por ID
  const getProject = useCallback((id) => {
    return projects.find((p) => p.id === id);
  }, [projects]);

  // Duplicar projeto
  const duplicateProject = useCallback((id) => {
    const original = projects.find((p) => p.id === id);
    if (original) {
      return createProject(`${original.name} (Cópia)`, original.xml, false);
    }
    return null;
  }, [projects, createProject]);

  return {
    projects,
    createProject,
    updateProject,
    deleteProject,
    getProject,
    duplicateProject,
  };
}
