import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// ── SERVICE WORKER REGISTRATION & OFFLINE ASSETS CACHE ────────────────────────
if ('serviceWorker' in navigator && (window.location.protocol === 'https:' || window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')) {
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('/sw.js', { scope: '/' })
      .then((registration) => {
        console.log('✅ [SW] Registered successfully with scope:', registration.scope);

        // Check for updates periodically
        registration.addEventListener('updatefound', () => {
          const installingWorker = registration.installing;
          if (installingWorker) {
            installingWorker.addEventListener('statechange', () => {
              if (installingWorker.state === 'installed') {
                if (navigator.serviceWorker.controller) {
                  console.log('⚡ [SW] New content available; please refresh.');
                } else {
                  console.log('⚡ [SW] Content is cached for offline use.');
                }
              }
            });
          }
        });
      })
      .catch((error) => {
        console.warn('❌ [SW] Service Worker registration failed:', error);
      });

    // Listen for messages from Service Worker (e.g. background sync triggers)
    navigator.serviceWorker.addEventListener('message', (event) => {
      if (event.data?.type === 'TRIGGER_OFFLINE_QUEUE_SYNC') {
        window.dispatchEvent(new CustomEvent('tg_trigger_offline_sync'));
      }
    });
  });
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
