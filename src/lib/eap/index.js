/**
 * EAP Module - Re-exporta tudo dos submodulos.
 *
 * Todos os imports existentes (via eapService.js) continuam funcionando
 * porque eapService.js re-exporta deste index.
 */

// CRUD & Undo
export {
  getEapFolders, createEapFolder, updateEapFolder, deleteEapFolder,
  getEapProjects, createEapProject, updateEapProject, deleteEapProject,
  getEapTasks, createEapTask, updateEapTask, deleteEapTask,
  saveUndoStacks, loadUndoStacks,
} from './crud';

// Calculations & Tree
export {
  recalculateWBS, calculateSummaryDates, calculateCriticalPath,
  buildTaskTree, flattenTree,
  calcEndDate, calcDuration, calcWorkHours,
} from './calculations';

// Scheduling & Dependencies
export {
  autoScheduleTasks, detectCircularDependency,
  formatPredecessors, parsePredecessors,
} from './scheduling';

// Bridge EAP → OS
export {
  generateOSFromTask, syncProgressFromOS, createLinkedOSProject,
} from './bridge';
