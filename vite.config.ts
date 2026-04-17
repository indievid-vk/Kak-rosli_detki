import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react-swc';
import path from 'path';
import {defineConfig, loadEnv} from 'vite';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig(({mode}) => {
  const env = loadEnv(mode, '.', '');
  return {
    base: '/Kak-rosli_detki/',
    plugins: [
      react(), 
      tailwindcss(),
      VitePWA({
        registerType: 'autoUpdate',
        workbox: {
          globPatterns: ['**/*.{js,css,html,ico,png,svg}']
        },
        manifest: {
          name: 'Как росли детки - Дневник развития ребенка',
          short_name: 'Как росли детки',
          description: 'Профессиональное приложение для отслеживания событий и развития малыша',
          theme_color: '#f97316',
          background_color: '#ffffff',
          display: 'standalone',
          orientation: 'portrait',
          start_url: '/Kak-rosli_detki/',
          scope: '/Kak-rosli_detki/',
          icons: [
            {
              src: '/Kak-rosli_detki/images/icon-192.png',
              sizes: '192x192',
              type: 'image/png'
            },
            {
              src: '/Kak-rosli_detki/images/icon-512.png',
              sizes: '512x512',
              type: 'image/png'
            }
          ]
        }
      })
    ],
    define: {
      'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY),
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modifyâfile watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
    },
  };
});
