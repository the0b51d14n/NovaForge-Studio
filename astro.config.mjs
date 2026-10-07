// @ts-check
import { defineConfig } from 'astro/config';

// https://astro.build/config
export default defineConfig({
  // Ports libres sur le poste : 1024 (dev) et 1026 (preview, voir package.json)
  server: { port: 1024 },
});
