let deferredPrompt = null;
let installPromptCallback = null;

/**
 * Registra o Service Worker e configura o handler do install prompt.
 * Primeiro limpa SWs e caches antigos para evitar assets desatualizados.
 */
export function registerSW() {
  if (!('serviceWorker' in navigator)) return;

  window.addEventListener('load', async () => {
    try {
      // Limpar todos os SWs antigos e caches antes de registrar
      const registrations = await navigator.serviceWorker.getRegistrations();
      for (const reg of registrations) {
        await reg.unregister();
      }

      // Limpar todos os caches antigos
      const cacheNames = await caches.keys();
      for (const name of cacheNames) {
        await caches.delete(name);
      }

      if (registrations.length > 0 || cacheNames.length > 0) {
        console.log('SW/Caches antigos limpos, recarregando...');
        window.location.reload();
        return;
      }

      // Registrar SW novo
      const registration = await navigator.serviceWorker.register('/sw.js');
      console.log('SW registrado:', registration.scope);

      // Verificar atualizacoes periodicamente
      setInterval(() => registration.update(), 60 * 60 * 1000); // 1h
    } catch (err) {
      console.log('SW registro falhou:', err);
    }
  });

  // Capturar prompt de instalacao
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
    if (installPromptCallback) installPromptCallback(true);
  });

  // Detectar instalacao
  window.addEventListener('appinstalled', () => {
    deferredPrompt = null;
    if (installPromptCallback) installPromptCallback(false);
  });
}

/**
 * Verifica se o app pode ser instalado.
 */
export function canInstall() {
  return deferredPrompt !== null;
}

/**
 * Solicita a instalacao do PWA.
 */
export async function promptInstall() {
  if (!deferredPrompt) return false;
  deferredPrompt.prompt();
  const { outcome } = await deferredPrompt.userChoice;
  deferredPrompt = null;
  return outcome === 'accepted';
}

/**
 * Registra callback para mudancas no estado do install prompt.
 */
export function onInstallChange(callback) {
  installPromptCallback = callback;
}

/**
 * Verifica se ja esta rodando como PWA.
 */
export function isRunningAsPWA() {
  return window.matchMedia('(display-mode: standalone)').matches
    || window.navigator.standalone === true;
}
