import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import '@fontsource/fraunces/latin.css';
import '@fontsource/inter/latin.css';
import '@fontsource/mulish/latin-800.css';
import './styles/tokens.css';
import './styles/themes.css';
import './index.css';
import './styles/pmu.css';
import { App } from './App';

const root = document.getElementById('root');
if (!root) throw new Error('Élément #root introuvable');

createRoot(root).render(
  <StrictMode>
    <App />
  </StrictMode>
);

// Retire l'écran de chargement une fois l'application montée (fondu doux).
function retirerSplash(): void {
  const splash = document.getElementById('splash');
  if (!splash) return;
  splash.classList.add('partir');
  splash.addEventListener('transitionend', () => splash.remove(), { once: true });
  // Filet de sécurité si transitionend ne se déclenche pas
  setTimeout(() => splash.remove(), 700);
}
requestAnimationFrame(() => requestAnimationFrame(retirerSplash));

// Service Worker : enregistré uniquement en production publiée.
// Désactivé en dev et dans les previews Lovable (sinon caches obsolètes).
function shouldRegisterSW(): boolean {
  // Service worker désactivé pendant le développement : garantit que tout le
  // monde (surtout mobile) reçoit la dernière version, sans cache obsolète.
  // L'éventuel SW déjà installé est retiré (voir branche `else` ci-dessous).
  // À réactiver pour le vrai mode hors-ligne une fois l'app stabilisée.
  return false;
}

async function unregisterMatchingSWs(): Promise<void> {
  if (!('serviceWorker' in navigator)) return;
  try {
    const regs = await navigator.serviceWorker.getRegistrations();
    for (const reg of regs) {
      const url = reg.active?.scriptURL ?? reg.installing?.scriptURL ?? reg.waiting?.scriptURL ?? '';
      if (url.endsWith('/sw.js')) await reg.unregister();
    }
  } catch {
    // ignore
  }
}

if ('serviceWorker' in navigator) {
  if (shouldRegisterSW()) {
    window.addEventListener('load', async () => {
      try {
        const { registerSW } = await import('virtual:pwa-register');
        // registerType 'autoUpdate' : une nouvelle version s'installe, s'active
        // et recharge l'app automatiquement. On déclenche en plus une recherche
        // de mise à jour au démarrage, toutes les 30 min, et à chaque retour au
        // premier plan — indispensable pour une PWA souvent laissée ouverte.
        const updateSW = registerSW({
          immediate: true,
          onRegisteredSW(_swUrl, reg) {
            if (!reg) return;
            reg.update().catch(() => {});
            setInterval(() => reg.update().catch(() => {}), 30 * 60 * 1000);
            document.addEventListener('visibilitychange', () => {
              if (document.visibilityState === 'visible') reg.update().catch(() => {});
            });
          },
          onNeedRefresh() {
            // Filet de sécurité : applique la nouvelle version sans attendre.
            void updateSW(true);
          },
        });
      } catch {
        // ignore
      }
    });
  } else {
    void unregisterMatchingSWs();
  }
}
