// Service worker MÍNIMO — sem intercept de fetch (sem cache).
//
// Historico: o handler de fetch (network-first com cache) servia bundle ANTIGO
// em cache e quebrava a navegacao -> TELA BRANCA com codigo velho preso.
// Agora: NAO intercepta nada (browser cuida das requisicoes; nginx ja serve o SPA),
// e ao ATIVAR limpa todos os caches + FORCA reload das abas abertas pra garantir
// que o usuario pegue o codigo novo de imediato (sem precisar limpar cache na mao).
// Mantido apenas: push notifications.

const CACHE_NAME = 'fyness-os-v6';

self.addEventListener('install', () => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    // Limpa TODOS os caches antigos.
    const keys = await caches.keys();
    await Promise.all(keys.map((k) => caches.delete(k)));
    await self.clients.claim();
    // Forca reload das abas abertas pra largar qualquer bundle velho em memoria/cache.
    const clients = await self.clients.matchAll({ type: 'window' });
    for (const c of clients) {
      try { c.navigate(c.url); } catch (e) { /* noop */ }
    }
  })());
});

// (sem listener de 'fetch' de proposito — nada de intercept, nada de cache de assets)

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
