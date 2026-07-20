/**
 * formFieldClass — o estilo de campo de formulario do CRM, em UM lugar.
 *
 * Existiam cinco copias desta mesma string espalhadas pelos modais, cada uma
 * com um nome (FIELD_CLASS, fieldClass, inputClass...) e pequenas diferencas
 * que ninguem tinha escolhido — um usava text-slate-700, outro text-slate-800;
 * um pintava a borda de erro em rose-300, outro em rose-400. Copia de estilo
 * nao "fica" igual: ela empata no dia em que e escrita e diverge em toda
 * manutencao seguinte.
 *
 * Uso:
 *   import { fieldClass } from './ui/formFieldClass';
 *   <input className={fieldClass(!!errors.title)} />
 *   <textarea className={fieldClass(!!errors.notes, 'resize-none')} />
 */

/**
 * @param {boolean} [hasError]  pinta a borda e o anel de vermelho
 * @param {string}  [extra]     classes adicionais (ex.: 'resize-none')
 */
export function fieldClass(hasError = false, extra = '') {
  const borda = hasError
    ? 'border-rose-300 dark:border-rose-700 focus:ring-rose-500'
    : 'border-slate-300 dark:border-slate-600 focus:ring-fyness-primary';
  return `w-full px-3 py-2 text-sm rounded-lg border ${borda} bg-white dark:bg-slate-800 `
    + `text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-2`
    + (extra ? ` ${extra}` : '');
}

/** Label de campo de cadastro. */
export const LABEL_CLASS = 'block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1';

/**
 * Micro-label de bloco de EXECUCAO (as perguntas de "o que aconteceu" ao
 * concluir uma tarefa). E outro contexto, nao outro gosto: ali o texto rotula
 * uma secao curta de leitura, nao um campo de cadastro. Nao usar em formulario.
 */
export const SECTION_LABEL_CLASS =
  'block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5';

/** Mensagem de erro, sempre logo abaixo do campo. */
export const ERROR_CLASS = 'text-xs text-rose-500 mt-0.5';

/** Texto de ajuda abaixo do campo. slate-400 sozinho nao tem contraste. */
export const HINT_CLASS = 'text-[12px] text-slate-500 dark:text-slate-400 mt-1';
