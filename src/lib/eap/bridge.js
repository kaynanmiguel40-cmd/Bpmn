/**
 * EAP Bridge - Ponte EAP → OS (Ordens de Servico).
 *
 * Extraido de eapService.js (linhas 186-351).
 */

import { createOSOrder, getOSProjects, createOSProject } from '../osService';
import { taskService } from './crud';

// ==================== HELPERS ====================

/** Encontra o pai raiz (level 0) de uma tarefa subindo a hierarquia. */
function findRootParent(task, allTasks) {
  let current = task;
  while (current.parentId) {
    const parent = allTasks.find(t => t.id === current.parentId);
    if (!parent) break;
    current = parent;
  }
  return current;
}

/** Busca ou cria um OS Projeto com o nome do pai raiz da tarefa. */
async function getOrCreateOSProject(rootTask, eapProjectId = null) {
  const osProjects = await getOSProjects();

  // Primeiro: buscar por vinculo direto com projeto EAP
  if (eapProjectId) {
    const linked = osProjects.find(p => p.eapProjectId === eapProjectId);
    if (linked) return linked.id;
  }

  // Fallback: buscar por nome
  const existing = osProjects.find(p => p.name === rootTask.name);
  if (existing) return existing.id;

  const newProject = await createOSProject({
    name: rootTask.name,
    description: `Projeto gerado automaticamente pela EAP`,
    color: '#3b82f6',
    eapProjectId: eapProjectId || null,
  });

  return newProject?.id || null;
}

/** Cria um OS Project vinculado a um projeto EAP (se ainda nao existir). */
export async function createLinkedOSProject(eapProject) {
  const osProjects = await getOSProjects();
  const existing = osProjects.find(p => p.eapProjectId === eapProject.id);
  if (existing) return existing;

  const newProject = await createOSProject({
    name: eapProject.name,
    description: `Projeto vinculado a EAP: ${eapProject.name}`,
    color: eapProject.color || '#3b82f6',
    eapProjectId: eapProject.id,
  });
  return newProject;
}

/**
 * Coleta filhos de uma tarefa e monta o checklist da OS.
 */
function buildChecklistFromChildren(task, allTasks) {
  const children = allTasks
    .filter(t => t.parentId === task.id)
    .sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));

  if (children.length === 0) return [];

  const checklist = [];
  let counter = 0;

  for (const child of children) {
    const grandchildren = allTasks
      .filter(t => t.parentId === child.id)
      .sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));

    if (grandchildren.length > 0) {
      for (const gc of grandchildren) {
        checklist.push({
          id: Date.now() + (++counter),
          text: gc.name,
          group: child.name,
          done: false,
          startedAt: null,
          completedAt: null,
          durationMin: null,
        });
      }
    } else {
      checklist.push({
        id: Date.now() + (++counter),
        text: child.name,
        group: null,
        done: false,
        startedAt: null,
        completedAt: null,
        durationMin: null,
      });
    }
  }

  return checklist;
}

// ==================== EXPORTS ====================

/**
 * Gera uma Ordem de Servico a partir de uma tarefa EAP.
 */
export async function generateOSFromTask(task, projectName, allTasks = [], eapProjectId = null) {
  const rootParent = allTasks.length > 0 ? findRootParent(task, allTasks) : null;
  let osProjectId = null;

  if (rootParent && rootParent.id !== task.id) {
    osProjectId = await getOrCreateOSProject(rootParent, eapProjectId);
  }

  const checklist = buildChecklistFromChildren(task, allTasks);

  const osData = {
    title: task.name,
    description: task.notes || '',
    priority: 'medium',
    category: 'internal',
    assignedTo: task.assignedTo || '',
    supervisor: task.supervisor || null,
    estimatedStart: task.startDate || '',
    estimatedEnd: task.endDate || '',
    projectId: osProjectId,
    checklist,
  };

  const os = await createOSOrder(osData);
  if (!os) return null;

  await taskService.update(task.id, { osOrderId: os.id });

  return os;
}

/**
 * Sincroniza o progresso das tarefas EAP baseado no status das OS vinculadas.
 */
export function syncProgressFromOS(eapTasks, osOrders) {
  const osMap = new Map(osOrders.map(o => [o.id, o]));
  const eapUpdates = [];
  const osUpdates = [];

  for (const task of eapTasks) {
    if (!task.osOrderId) continue;
    const os = osMap.get(task.osOrderId);
    if (!os) continue;

    if (os.status === 'done' && task.progress !== 100) {
      eapUpdates.push({ id: task.id, progress: 100 });
    }
    else if (task.progress === 100 && os.status !== 'done') {
      osUpdates.push({ id: os.id, status: 'done' });
    }
    else if (task.progress > 0 && task.progress < 100 && os.status === 'available') {
      osUpdates.push({ id: os.id, status: 'in_progress' });
    }
    else if (os.status === 'in_progress' && task.progress === 0) {
      eapUpdates.push({ id: task.id, progress: 50 });
    }
  }

  return { eapUpdates, osUpdates };
}
