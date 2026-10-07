// @ts-check
import { fileURLToPath } from 'node:url';
import { defineConfig, envField } from 'astro/config';
import vercel from '@astrojs/vercel';

// Verrou du site (src/lib/middleware.ts). Le dossier du projet contient une apostrophe
// (« de l'entreprise ») qu'Astro n'échappe pas pour src/middleware.ts : le middleware est
// donc branché par cette mini-intégration, via un alias sans apostrophe.
const ACCESS_MIDDLEWARE = '@novaforge/acces';

/** @type {import('astro').AstroIntegration} */
const accessLock = {
  name: 'novaforge-acces',
  hooks: {
    'astro:config:setup': ({ addMiddleware }) => addMiddleware({ entrypoint: ACCESS_MIDDLEWARE, order: 'pre' }),
  },
};

// https://astro.build/config
export default defineConfig({
  // Rendu serveur : chaque page passe par le middleware qui vérifie l'accès
  output: 'server',
  adapter: vercel({ imageService: true }),
  integrations: [accessLock],
  env: {
    schema: {
      // Mot de passe du site : .env en local, variables d'environnement du projet sur Vercel
      SITE_PASSWORD: envField.string({ context: 'server', access: 'secret', optional: true }),
    },
  },
  vite: {
    resolve: {
      alias: { [ACCESS_MIDDLEWARE]: fileURLToPath(new URL('./src/lib/middleware.ts', import.meta.url)) },
    },
  },
  // Ports libres sur le poste : 1024 (dev)
  server: { port: 1024 },
});
