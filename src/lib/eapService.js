/**
 * eapService - Re-exporta tudo do modulo EAP.
 *
 * Este arquivo foi refatorado: o codigo original (1002 linhas) foi dividido em:
 *   - eap/crud.js         → transforms, CRUD, undo persistence
 *   - eap/calculations.js → CPM, WBS, datas, arvore
 *   - eap/scheduling.js   → auto-scheduling, predecessoras, dependencias
 *   - eap/bridge.js       → ponte EAP → OS
 *
 * Os imports existentes continuam funcionando sem alteracao.
 */

export {
  // CRUD - Folders
  getEapFolders, createEapFolder, updateEapFolder, deleteEapFolder,
  // CRUD - Projects & Tasks
  getEapProjects, createEapProject, updateEapProject, deleteEapProject,
  getEapTasks, createEapTask, updateEapTask, deleteEapTask,
  saveUndoStacks, loadUndoStacks,
  // Calculations
  recalculateWBS, calculateSummaryDates, calculateCriticalPath,
  buildTaskTree, flattenTree,
  calcEndDate, calcDuration, calcWorkHours,
  // Scheduling
  autoScheduleTasks, detectCircularDependency,
  formatPredecessors, parsePredecessors,
  // Bridge
  generateOSFromTask, syncProgressFromOS, createLinkedOSProject, deleteLinkedOSData,
} from './eap/index';
