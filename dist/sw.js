const CACHE_NAME = 'fyness-os-v2';
const STATIC_ASSETS = [
  '/',
  '/index.html',
];

// Install — cache only the shell
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(STATIC_ASSETS))
  );
  self.skipWaiting();
});

// Activate — clean ALL old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// Fetch strategy — network first for everything
self.addEventListener('fetch', (event) => {
  const { request } = event;

  // Only cache GET requests
  if (request.method !== 'GET') return;

  const url = new URL(request.url);

  // Skip caching for Vite dev server (HMR, modules, etc.)
  if (url.pathname.includes('/@') || url.pathname.includes('node_modules') || url.pathname.includes('__vite')) {
    return;
  }

  // Skip caching for API/Supabase calls
  if (url.pathname.startsWith('/rest/') || url.hostname.includes('supabase')) {
    return;
  }

  // Navigation — network first, fallback to cached index.html (SPA)
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request).catch(() => caches.match('/index.html'))
    );
    return;
  }

  // All other assets — network first, cache as fallback
  event.respondWith(
    fetch(request)
      .then((response) => {
        // Only cache successful responses
        if (response.ok) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
        }
        return response;
      })
      .catch(() => caches.match(request))
  );
});

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
      // Se o app ja esta aberto, focar na aba
      for (const client of clients) {
        if (client.url.includes(self.location.origin)) {
          client.focus();
          client.navigate(url);
          return;
        }
      }
      // Senao, abrir nova aba
      return self.clients.openWindow(url);
    })
  );
});
