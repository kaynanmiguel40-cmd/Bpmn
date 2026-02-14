/**
 * Push Notifications nativas para o Fyness OS.
 * Usa a Notification API do browser para mostrar notificacoes no PC/celular,
 * mesmo quando o app esta minimizado.
 *
 * Fluxo:
 * 1. requestPermission() — pede permissao ao usuario (uma vez)
 * 2. showLocalNotification() — mostra notificacao nativa no PC
 * 3. Integrado no notificationService.notify() automaticamente
 */

// ==================== PERMISSAO ====================

/**
 * Verifica se o browser suporta notificacoes.
 */
export function isSupported() {
  return 'Notification' in window;
}

/**
 * Retorna o status atual da permissao: 'granted', 'denied', 'default'
 */
export function getPermissionStatus() {
  if (!isSupported()) return 'unsupported';
  return Notification.permission;
}

/**
 * Pede permissao ao usuario para enviar notificacoes.
 * Retorna true se concedida.
 */
export async function requestPermission() {
  if (!isSupported()) return false;
  if (Notification.permission === 'granted') return true;
  if (Notification.permission === 'denied') return false;

  const result = await Notification.requestPermission();
  return result === 'granted';
}

// ==================== NOTIFICACAO LOCAL ====================

/**
 * Mostra uma notificacao nativa no PC/celular.
 * Se o Service Worker esta ativo, usa ele (funciona com app minimizado).
 * Senao, usa a Notification API diretamente (precisa do app aberto).
 */
export async function showLocalNotification({ title, body, type = 'info', entityType = null, entityId = null, tag = null }) {
  if (!isSupported() || Notification.permission !== 'granted') return false;

  const icon = '/icons/icon-192.svg';
  const url = entityType === 'os_order' && entityId ? '/financial' : '/';

  // Tentar via Service Worker (funciona com app minimizado)
  if ('serviceWorker' in navigator) {
    try {
      const reg = await navigator.serviceWorker.ready;
      await reg.showNotification(title || 'Fyness OS', {
        body: body || '',
        icon,
        badge: icon,
        tag: tag || `fyness-${type}-${Date.now()}`,
        data: { url, entityType, entityId },
        vibrate: [200, 100, 200],
      });
      return true;
    } catch (e) {
      // Fallback para Notification API
    }
  }

  // Fallback: Notification API direto (precisa app aberto)
  try {
    new Notification(title || 'Fyness OS', {
      body: body || '',
      icon,
      tag: tag || `fyness-${type}-${Date.now()}`,
    });
    return true;
  } catch (e) {
    return false;
  }
}

// ==================== HELPERS ====================

const NOTIFICATION_TYPE_MAP = {
  info: { prefix: '' },
  success: { prefix: '' },
  warning: { prefix: '⚠️ ' },
  error: { prefix: '❌ ' },
  os_assigned: { prefix: '' },
  os_updated: { prefix: '' },
  os_completed: { prefix: '' },
  emergency: { prefix: '🚨 ' },
};

/**
 * Converte uma notificacao interna do sistema para push nativa.
 */
export function notifyNative({ type = 'info', title, message, entityType, entityId }) {
  const map = NOTIFICATION_TYPE_MAP[type] || NOTIFICATION_TYPE_MAP.info;
  showLocalNotification({
    title: `${map.prefix}${title}`,
    body: message,
    type,
    entityType,
    entityId,
  });
}
