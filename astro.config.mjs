import { defineConfig, passthroughImageService } from 'astro/config';
import tailwind from '@astrojs/tailwind';
import { loadEnv } from 'vite';
import react from '@astrojs/react';
import vercel from '@astrojs/vercel/serverless';
const {
  PUBLIC_WP_URL
} = loadEnv(process.env.NODE_ENV, process.cwd(), '');


// https://astro.build/config
export default defineConfig({
  site: 'https://gaia-bertholet-avocat.fr',
  devToolbar: {
    enabled: false
  },
  image: {
    domains: [PUBLIC_WP_URL],
    service: passthroughImageService()
  },
  integrations: [tailwind({
    applyBaseStyles: false // Disable base styles for custom-built components (defaults to true)
  }), react()],
  output:'hybrid',
  adapter: vercel()
});