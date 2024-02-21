import { defineConfig } from 'astro/config';
import tailwind from "@astrojs/tailwind";
import { loadEnv } from 'vite';
const {
  PUBLIC_WP_URL
} = loadEnv(process.env.NODE_ENV, process.cwd(), "");


// https://astro.build/config
export default defineConfig({
  image: {
    domains: [PUBLIC_WP_URL]
  },
  integrations: [tailwind({
    applyBaseStyles: false // Disable base styles for custom-built components (defaults to true)
  }),
  ],
});