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
      // Só registra. A limpeza de cache + reload é feita pelo proprio SW (sw.js v6)
      // no evento 'activate' — evita reload duplo e nao depende de cleanup aqui.
      const registration = await navigator.serviceWorker.register('/sw.js');
      // Verificar atualizacoes periodicamente (pega SW novo apos deploy)
      setInterval(() => registration.update(), 30 * 60 * 1000); // 30min
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
