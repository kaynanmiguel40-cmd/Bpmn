import { toast } from '../contexts/ToastContext';

// ==================== CLASSIFICACAO DE ERROS ====================

const ERROR_TYPES = {
  NETWORK: 'network',
  VALIDATION: 'validation',
  AUTH: 'auth',
  NOT_FOUND: 'not_found',
  PERMISSION: 'permission',
  SERVER: 'server',
  UNKNOWN: 'unknown',
};

/**
 * Classifica um erro por tipo.
 */
function classifyError(error) {
  const message = (error?.message || '').toLowerCase();
  const status = error?.status || error?.statusCode;

  if (message.includes('fetch') || message.includes('network') || message.includes('failed to fetch') || message.includes('offline')) {
    return ERROR_TYPES.NETWORK;
  }
  if (message.includes('validation') || message.includes('zod') || message.includes('invalid')) {
    return ERROR_TYPES.VALIDATION;
  }
  if (status === 401 || message.includes('unauthorized') || message.includes('jwt') || message.includes('token')) {
    return ERROR_TYPES.AUTH;
  }
  if (status === 403 || message.includes('permission') || message.includes('rls') || message.includes('policy')) {
    return ERROR_TYPES.PERMISSION;
  }
  if (status === 404 || message.includes('not found')) {
    return ERROR_TYPES.NOT_FOUND;
  }
  if (status >= 500 || message.includes('server') || message.includes('internal')) {
    return ERROR_TYPES.SERVER;
  }
  return ERROR_TYPES.UNKNOWN;
}

// ==================== MENSAGENS AMIGAVEIS ====================

const FRIENDLY_MESSAGES = {
  [ERROR_TYPES.NETWORK]: 'Sem conexao com o servidor. Verifique sua internet.',
  [ERROR_TYPES.VALIDATION]: 'Dados invalidos. Verifique os campos preenchidos.',
  [ERROR_TYPES.AUTH]: 'Sessao expirada. Faca login novamente.',
  [ERROR_TYPES.PERMISSION]: 'Voce nao tem permissao para esta acao.',
  [ERROR_TYPES.NOT_FOUND]: 'Registro nao encontrado.',
  [ERROR_TYPES.SERVER]: 'Erro no servidor. Tente novamente em alguns minutos.',
  [ERROR_TYPES.UNKNOWN]: 'Ocorreu um erro inesperado.',
};

const TOAST_TYPE_MAP = {
  [ERROR_TYPES.NETWORK]: 'warning',
  [ERROR_TYPES.VALIDATION]: 'error',
  [ERROR_TYPES.AUTH]: 'warning',
  [ERROR_TYPES.PERMISSION]: 'error',
  [ERROR_TYPES.NOT_FOUND]: 'warning',
  [ERROR_TYPES.SERVER]: 'error',
  [ERROR_TYPES.UNKNOWN]: 'error',
};

// ==================== HANDLER PRINCIPAL ====================

/**
 * Trata um erro de forma centralizada.
 * - Classifica o erro
 * - Mostra toast amigavel
 * - Loga no console com contexto
 *
 * @param {Error|object} error - O erro capturado
 * @param {string} context - Contexto onde o erro ocorreu (ex: 'createOSOrder')
 * @param {object} options
 * @param {boolean} options.showToast - Se deve mostrar toast (default: true)
 * @param {string} options.customMessage - Mensagem customizada para o toast
 */
export function handleError(error, context = '', options = {}) {
  const { showToast = true, customMessage } = options;

  const errorType = classifyError(error);
  const friendlyMessage = customMessage || FRIENDLY_MESSAGES[errorType];
  const toastType = TOAST_TYPE_MAP[errorType];

  // Log estruturado no console
  console.error(`[${new Date().toISOString()}] [${errorType.toUpperCase()}] ${context}:`, {
    message: error?.message,
    status: error?.status || error?.statusCode,
    details: error?.details || error?.hint,
    stack: error?.stack,
  });

  // Toast para o usuario
  if (showToast) {
    toast(friendlyMessage, toastType);
  }

  return {
    type: errorType,
    message: friendlyMessage,
    originalError: error,
  };
}

/**
 * Wrapper para try/catch em funcoes async.
 * Retorna { data, error }.
 */
export async function tryCatch(fn, context = '') {
  try {
    const data = await fn();
    return { data, error: null };
  } catch (err) {
    const handled = handleError(err, context);
    return { data: null, error: handled };
  }
}

export { ERROR_TYPES };
