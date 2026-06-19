// Service worker MINIMO — sem intercept de fetch.
//
// Historico: o handler de fetch (network-first com cache) estava devolvendo
// respostas quebradas (undefined / Response.error()) quando uma requisicao
// falhava/abortava, e isso quebrava a navegacao -> TELA BRANCA, sem erro claro.
// O ganho era minimo (network-first). Removido pra eliminar essa classe de bug.
// O navegador cuida das requisicoes nativamente (nginx ja serve o SPA via fallback).
//
// Mantido apenas: push notifications.

const CACHE_NAME = 'fyness-os-v5';

self.addEventListener('install', () => {
  self.skipWaiting();
});

// Ativa imediatamente, LIMPA todos os caches antigos e assume o controle.
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

// (sem listener de 'fetch' de proposito — nada de intercept)

// ==================== PUSH NOTIFICATIONS ====================

self.addEventListener('push', (event) => {
  let data = { title: 'Fyness OS', body: 'Nova notificacao', type: 'info' };
  try {
    if (event.data) data = { ...data, ...event.data.json() };
  } catch (e) {
    if (event.data) data.body = event.data.text();
  }

  const icon = '/icons/icon-192.svg';
  const badge = '/icons/icon-192.svg';

  event.waitUntil(
    self.registration.showNotification(data.title, {
      body: data.body,
      icon,
      badge,
      tag: data.tag || 'fyness-' + Date.now(),
      data: { url: data.url || '/', entityType: data.entityType, entityId: data.entityId },
      vibrate: [200, 100, 200],
    })
  );
});

// Ao clicar na notificacao, abrir o app na pagina relevante
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const url = event.notification.data?.url || '/';

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clients) => {
      for (const client of clients) {
        if (client.url.includes(self.location.origin)) {
          client.focus();
          client.navigate(url);
          return;
        }
      }
      return self.clients.openWindow(url);
    })
  );
});
