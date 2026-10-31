import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { registerSW } from 'virtual:pwa-register';

// Automatic Service Worker registration for instant offline access and seamless updates
let refreshing = false;
navigator.serviceWorker?.addEventListener('controllerchange', () => {
  if (!refreshing) {
    refreshing = true;
    window.location.reload();
  }
});

const updateSW = registerSW({
  immediate: true,
  onNeedRefresh() {
    // Automatically apply new published version and trigger page reload
    updateSW(true);
  },
  onOfflineReady() {
    console.log('PrepPulse CBT is ready for 100% offline practice');
  },
  onRegisteredSW(_swUrl, r) {
    if (r) {
      // Promptly check for updates on launch
      r.update().catch(() => {});

      // Check for published updates every 3 minutes
      setInterval(async () => {
        if (!(!r.installing && navigator)) return;
        if ('onLine' in navigator && !navigator.onLine) return;
        try {
          await r.update();
        } catch {
          // Ignore offline check error
        }
      }, 3 * 60 * 1000);
    }
  },
});

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);

