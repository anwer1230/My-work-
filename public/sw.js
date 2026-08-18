// ══════════════════════════════════════════════════════════════════════════════
// TELEGRAM WEB APP SERVICE WORKER (OFFLINE ASSETS CACHING & BACKGROUND SYNC)
// ══════════════════════════════════════════════════════════════════════════════

const CACHE_VERSION = 'v7.2';
const STATIC_CACHE = `tg-sra3a-static-${CACHE_VERSION}`;
const RUNTIME_CACHE = `tg-sra3a-runtime-${CACHE_VERSION}`;
const FONTS_CACHE = `tg-sra3a-fonts-${CACHE_VERSION}`;

// ── 1. الأصول الحرجة للتخزين المؤقت المسبق (Critical Static Assets) ──
const CRITICAL_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/static/icons/icon-72.png',
  '/static/icons/icon-192.png',
  '/static/icons/icon-512.png',
  '/static/icons/app-logo.png',
  'https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;500;700&family=Tajawal:wght@400;500;700;800;900&display=swap',
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css',
  'https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap'
];

// ── 2. التثبيت (Install): تخزين كافة الأصول الحرجة ──
self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(STATIC_CACHE).then(async (cache) => {
      console.log('⚡ [SW] Caching critical assets...');
      // Use individual caching to prevent single network failure from breaking the whole install
      await Promise.all(
        CRITICAL_ASSETS.map((url) =>
          fetch(url, { mode: url.startsWith('http') && !url.includes(self.location.host) ? 'cors' : 'no-cors' })
            .then((res) => {
              if (res.status === 200 || res.type === 'opaque') {
                return cache.put(url, res);
              }
            })
            .catch((err) => {
              console.warn(`[SW] Pre-cache skipped for ${url}:`, err.message);
            })
        )
      );
    })
  );
});

// ── 3. التفعيل (Activate): تنظيف النسخ القديمة للكاش ──
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys
          .filter((key) => key !== STATIC_CACHE && key !== RUNTIME_CACHE && key !== FONTS_CACHE)
          .map((key) => {
            console.log('🧹 [SW] Deleting old cache:', key);
            return caches.delete(key);
          })
      );
    }).then(() => self.clients.claim())
  );
});

// ── 4. استراتيجية الجلب (Fetch Strategy): كاش ذكي مع دعم العمل أوفلاين ──
self.addEventListener('fetch', (event) => {
  const req = event.request;
  const url = new URL(req.url);

  // تجاهل الطلبات غير الـ GET
  if (req.method !== 'GET') return;

  // استثناء مسارات الـ API و SSE و WebSockets من كاش الصفحات
  if (
    url.pathname.startsWith('/api/') ||
    url.pathname.startsWith('/socket.io') ||
    url.pathname.startsWith('/tools/') ||
    url.pathname.endsWith('/events')
  ) {
    // بالنسبة لطلبات API عند انقطاع الإنترنت: تمرير أو تقديم استجابة أوفلاين لطيفة
    event.respondWith(
      fetch(req).catch(() => {
        return new Response(
          JSON.stringify({
            offline: true,
            error: 'أنت غير متصل بالإنترنت حالياً (Network offline)',
            timestamp: Date.now(),
          }),
          {
            status: 503,
            headers: { 'Content-Type': 'application/json; charset=utf-8' },
          }
        );
      })
    );
    return;
  }

  // أ. طلبات التنقل الأساسية (HTML Navigation): Network-first مع Fallback إلى index.html
  if (req.mode === 'navigate' || req.destination === 'document') {
    event.respondWith(
      fetch(req)
        .then((networkResp) => {
          if (networkResp.status === 200) {
            const copy = networkResp.clone();
            caches.open(STATIC_CACHE).then((cache) => cache.put(req, copy));
          }
          return networkResp;
        })
        .catch(async () => {
          // محاولة استرجاع الصفحة المخزنة أو الـ App Shell
          const cached = await caches.match(req);
          if (cached) return cached;
          const fallbackShell = await caches.match('/index.html');
          if (fallbackShell) return fallbackShell;
          return caches.match('/');
        })
    );
    return;
  }

  // ب. الخطوط والأيقونات الخارجية (Google Fonts & FontAwesome): Cache-First
  if (
    url.origin.includes('fonts.googleapis.com') ||
    url.origin.includes('fonts.gstatic.com') ||
    url.origin.includes('cdnjs.cloudflare.com')
  ) {
    event.respondWith(
      caches.match(req).then((cachedResp) => {
        if (cachedResp) return cachedResp;
        return fetch(req).then((networkResp) => {
          if (networkResp && (networkResp.status === 200 || networkResp.type === 'opaque')) {
            const copy = networkResp.clone();
            caches.open(FONTS_CACHE).then((cache) => cache.put(req, copy));
          }
          return networkResp;
        }).catch(() => cachedResp);
      })
    );
    return;
  }

  // ج. أصول التطبيق الثابتة (JS, CSS, Images, Icons, Vite Chunks): Stale-While-Revalidate
  event.respondWith(
    caches.match(req).then((cachedResp) => {
      const fetchPromise = fetch(req)
        .then((networkResp) => {
          if (networkResp && (networkResp.status === 200 || networkResp.type === 'opaque')) {
            const copy = networkResp.clone();
            caches.open(RUNTIME_CACHE).then((cache) => cache.put(req, copy));
          }
          return networkResp;
        })
        .catch(() => {
          return cachedResp;
        });

      return cachedResp || fetchPromise;
    })
  );
});

// ── 5. مزامنة الرسائل في الخلفية (Background Sync API) ──
self.addEventListener('sync', (event) => {
  console.log('🔄 [SW] Background sync event triggered:', event.tag);
  if (event.tag === 'sync-messages' || event.tag === 'send-queued-messages') {
    event.waitUntil(
      self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clients) => {
        clients.forEach((client) => {
          client.postMessage({
            type: 'TRIGGER_OFFLINE_QUEUE_SYNC',
            timestamp: Date.now(),
          });
        });
      })
    );
  }
});

// ── 6. رسائل التحكم بين التطبيق والـ Service Worker ──
self.addEventListener('message', (event) => {
  if (!event.data) return;

  if (event.data === 'SKIP_WAITING' || event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }

  if (event.data.type === 'TRIGGER_SYNC') {
    self.clients.matchAll({ type: 'window' }).then((clients) => {
      clients.forEach((client) => {
        client.postMessage({ type: 'TRIGGER_OFFLINE_QUEUE_SYNC' });
      });
    });
  }

  if (event.data.type === 'PING') {
    event.ports[0]?.postMessage({ type: 'PONG', version: CACHE_VERSION });
  }
});

// ── 7. Web Push: استقبال الإشعارات الفورية ──
self.addEventListener('push', function (event) {
  let data = {
    title: '🔔 إشعار جديد',
    body: 'لديك إشعار جديد من مركز سرعة إنجاز',
    icon: '/static/icons/icon-192.png',
    badge: '/static/icons/icon-72.png',
    data: {},
  };
  try {
    if (event.data) {
      const raw = event.data.json();
      data = Object.assign(data, raw);
    }
  } catch (e) {}

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
      { action: 'close', title: '✕ إغلاق' },
    ],
  };

  event.waitUntil(self.registration.showNotification(data.title, options));
});

// ── 8. عند النقر على الإشعار ──
self.addEventListener('notificationclick', function (event) {
  event.notification.close();
  if (event.action === 'close') return;

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(function (cs) {
      for (const c of cs) {
        if ('focus' in c) return c.focus();
      }
      if (clients.openWindow) return clients.openWindow('/');
    })
  );
});
