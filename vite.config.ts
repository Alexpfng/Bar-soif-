import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

// Base : '/Bar-soif-/' au build (GitHub Pages = site de projet servi sur un
// sous-chemin), '/' en dev local. Surchargeable via VITE_BASE pour un autre host
// (Vercel/Netlify/domaine racine → mettre VITE_BASE=/).
export default defineConfig(({ command }) => ({
  base: process.env.VITE_BASE ?? (command === 'build' ? '/Bar-soif-/' : '/'),
  server: { host: '::', port: 8080 },
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      injectRegister: null,
      filename: 'sw.js',
      devOptions: { enabled: false },
      includeAssets: ['favicon-*.png', 'apple-touch-icon.png', 'icons/*.png', 'brand/*.png', '.htaccess'],
      manifest: {
        name: "La Boît'à Soif",
        short_name: "Boît'à Soif",
        description:
          "L'appli des piliers de bar : ton taux d'alcool en direct, le juke-box à conneries, l'ardoise des comptes et le classement des potes.",
        lang: 'fr',
        start_url: '.',
        scope: '.',
        display: 'standalone',
        background_color: '#1B1917',
        theme_color: '#1B1917',
        icons: [
          { src: 'icons/icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'icons/icon-512.png', sizes: '512x512', type: 'image/png' },
          { src: 'icons/icon-maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,png,woff2,webmanifest}'],
        navigateFallback: 'index.html',
        runtimeCaching: [
          {
            urlPattern: ({ request }) => request.mode === 'navigate',
            handler: 'NetworkFirst',
            options: { cacheName: 'pages' },
          },
        ],
      },
    }),
  ],
  build: { target: 'es2019' },
}));
