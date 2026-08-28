const CACHE_NAME = 'sra3a-v6';
const STATIC_ASSETS = [
  '/',
  '/static/icons/icon-192.png',
  '/static/icons/icon-512.png',
  '/static/icons/app-logo.png'
];

// ── التثبيت: تخزين الأصول الأساسية ──
self.addEventListener('install', event => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache =>
      cache.addAll(STATIC_ASSETS).catch(() => {})
    )
  );
});

// ── التفعيل: حذف الكاش القديم ──
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

// ── الجلب: Network-first، cache كـ fallback ──
self.addEventListener('fetch', event => {
  const req = event.request;
  if (req.method !== 'GET') return;

  // تجاهل طلبات API و WebSocket
  const url = new URL(req.url);
  if (url.pathname.startsWith('/api/') ||
      url.pathname.startsWith('/socket.io') ||
      url.pathname.startsWith('/tools/')) return;

  event.respondWith(
    fetch(req)
      .then(resp => {
        if (resp.ok && resp.type === 'basic') {
          const clone = resp.clone();
          caches.open(CACHE_NAME).then(c => c.put(req, clone));
        }
        return resp;
      })
      .catch(() => caches.match(req))
  );
});

// ── رسائل من الصفحة ──
self.addEventListener('message', event => {
  if (event.data === 'SKIP_WAITING') self.skipWaiting();
  if (event.data && event.data.type === 'TRIGGER_SYNC') {
    notifyClientsOfSync('manual-sync');
  }
});

// ── Background Sync: مزامنة تليجرام في الخلفية عند عودة الاتصال ──
self.addEventListener('sync', function(event) {
  if (event.tag === 'tg-outgoing-sync' || event.tag === 'telegram-sync' || event.tag === 'tg-sync') {
    event.waitUntil(notifyClientsOfSync(event.tag));
  }
});

// ── Periodic Background Sync (إذا كانت مدعومة) ──
self.addEventListener('periodicsync', function(event) {
  if (event.tag === 'telegram-periodic-sync') {
    event.waitUntil(notifyClientsOfSync('periodic'));
  }
});

async function notifyClientsOfSync(tag) {
  try {
    const allClients = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });
    for (const client of allClients) {
      client.postMessage({
        type: 'TG_BACKGROUND_SYNC_TRIGGER',
        tag: tag || 'telegram-sync',
        timestamp: Date.now()
      });
    }
  } catch (err) {
    console.error('[SW Background Sync] Error notifying clients:', err);
  }
}

// ── Web Push: استقبال الإشعارات الفورية ──
self.addEventListener('push', function(event) {
  let data = {
    title: '🔔 إشعار جديد',
    body: 'لديك إشعار جديد من مركز سرعة إنجاز',
    icon: '/static/icons/icon-192.png',
    badge: '/static/icons/icon-72.png',
    data: {}
  };
  try {
    if (event.data) {
      const raw = event.data.json();
      data = Object.assign(data, raw);
    }
  } catch(e) {}

  const options = {
    body: data.body,
    icon: data.icon || '/static/icons/icon-192.png',
    badge: data.badge || '/static/icons/icon-72.png',
    data: data.data || {},
    vibrate: [300, 100, 300, 100, 300],
    requireInteraction: false,
    dir: 'rtl',
    lang: 'ar',
    tag: 'abumalik-push',
    renotify: true,
    actions: [
      { action: 'open', title: '📱 فتح التطبيق' },
      { action: 'close', title: '✕ إغلاق' }
    ]
  };

  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

// ── عند الضغط على الإشعار ──
self.addEventListener('notificationclick', function(event) {
  event.notification.close();
  if (event.action === 'close') return;
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(function(cs) {
      for (const c of cs) {
        if ('focus' in c) return c.focus();
      }
      if (clients.openWindow) return clients.openWindow('/');
    })
  );
});
