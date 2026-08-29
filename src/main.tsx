import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import {Buffer} from 'buffer';
import App from './App.tsx';
import './index.css';

// Polyfill Buffer globally for browser MTProto, TLRPC, & Protocol Buffers runtime
if (typeof window !== 'undefined') {
  (window as any).Buffer = (window as any).Buffer || Buffer;
  (window as any).global = (window as any).global || window;
  (window as any).process = (window as any).process || { env: {} };
}

// Handle dynamic import / chunk loading errors automatically
window.addEventListener('error', (event) => {
  if (event?.message && (event.message.includes('Loading chunk') || event.message.includes('Failed to fetch dynamically imported module'))) {
    console.warn('Chunk load error detected, reloading to fetch latest version...');
    window.location.reload();
  }
});

// Register Telegram Service Worker with automatic update checks
if ('serviceWorker' in navigator && process.env.NODE_ENV === 'production') {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').then((registration) => {
      // Check for updates periodically
      registration.update().catch(() => {});
    }).catch((err) => {
      console.log('Service Worker registration skipped:', err);
    });
  });
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
