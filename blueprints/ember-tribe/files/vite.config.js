import { defineConfig } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    // ...your other Ember/Vite plugins

    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.png', 'favicon.ico', 'apple-touch-icon.png', 'mask-icon.svg'],
      manifest: {
        name: 'ember-tribe',
        short_name: 'ember-tribe',
        description: 'Built using ember-tribe.',
        start_url: '/',
        scope: '/',
        display: 'standalone',
        background_color: '#e9ecef',
        theme_color: '#0A1119',
        prefer_related_applications: true,
        icons: [
          {
            src: '/favicon.png',
            sizes: '512x512',
            type: 'image/png',
          },
          {
            // PWA installers prefer a 'any maskable' entry
            src: '/favicon.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable',
          },
        ],
      },
      // Apple / MS meta that vite-plugin-pwa injects into the HTML <head>
      devOptions: {
        enabled: true,
      },
    })
  ]
})

