// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

// https://astro.build/config
export default defineConfig({
  site: 'https://driftlab.ro',
  integrations: [
    sitemap({
      changefreq: 'weekly',
      priority: 0.7,
      lastmod: new Date(),
    }),
  ],
  server: {
    host: true, // Listen on all network interfaces (0.0.0.0)
    port: 4321, // Default Astro port
  },
  build: {
    inlineStylesheets: 'auto',
  },
});
