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

// ==================== SOM DE NOTIFICACAO ====================

let audioCtx = null;

/**
 * Toca um som de "ding" usando Web Audio API.
 * Nao precisa de arquivo externo — gera o som programaticamente.
 */
export function playNotificationSound() {
  try {
    if (!audioCtx) {
      audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }

    // Retomar contexto se estiver suspenso (requer interacao do usuario)
    if (audioCtx.state === 'suspended') {
      audioCtx.resume();
    }

    const now = audioCtx.currentTime;

    // Oscilador principal — tom agudo e limpo
    const osc1 = audioCtx.createOscillator();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(880, now);        // A5
    osc1.frequency.setValueAtTime(1174.66, now + 0.08); // D6

    // Segundo oscilador — harmonica sutil
    const osc2 = audioCtx.createOscillator();
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(1318.51, now + 0.08); // E6

    // Envelope de volume (fade in rapido, fade out suave)
    const gain = audioCtx.createGain();
    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(0.3, now + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.4);

    const gain2 = audioCtx.createGain();
    gain2.gain.setValueAtTime(0, now + 0.08);
    gain2.gain.linearRampToValueAtTime(0.15, now + 0.1);
    gain2.gain.exponentialRampToValueAtTime(0.01, now + 0.5);

    osc1.connect(gain).connect(audioCtx.destination);
    osc2.connect(gain2).connect(audioCtx.destination);

    osc1.start(now);
    osc1.stop(now + 0.4);
    osc2.start(now + 0.08);
    osc2.stop(now + 0.5);
  } catch {
    // Web Audio API nao disponivel — silenciar
  }
}

/**
 * Toca um som de "pop" curto para mensagens de chat.
 * Tom mais grave e curto que o ding de notificacao.
 */
export function playChatSound() {
  try {
    if (!audioCtx) {
      audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }

    if (audioCtx.state === 'suspended') {
      audioCtx.resume();
    }

    const now = audioCtx.currentTime;

    // Tom descendente rapido — efeito "pop"
    const osc = audioCtx.createOscillator();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(660, now);        // E5
    osc.frequency.exponentialRampToValueAtTime(440, now + 0.1); // A4

    const gain = audioCtx.createGain();
    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(0.25, now + 0.015);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.2);

    osc.connect(gain).connect(audioCtx.destination);
    osc.start(now);
    osc.stop(now + 0.2);
  } catch {
    // Web Audio API nao disponivel
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
