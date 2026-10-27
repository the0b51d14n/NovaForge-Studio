// Branché dans astro.config.mjs. Pour chaque page : charge les données modifiables (verrou, adresse, offres)
// et, si le site est verrouillé, redirige le public vers /verrouillage. L'administrateur voit toujours le site.
// Les fichiers statiques (CSS, JS, polices, images, favicon) sont servis directement, sans passer ici.
import { defineMiddleware } from 'astro:middleware';
import { ADMIN_PATH, LOCK_PATH, isAdmin } from './access';
import { loadData } from './store';

export const onRequest = defineMiddleware(async (context, next) => {
  const { pathname } = context.url;
  // Vérification fréquente des pages ouvertes : toujours accessible, sans charger toutes les données
  if (pathname === '/api/version') return next();

  const [admin, data] = await Promise.all([isAdmin(context.cookies), loadData()]);
  context.locals.isAdmin = admin;
  context.locals.settings = data.settings;
  context.locals.openings = data.openings;
  context.locals.version = data.version;

  const alwaysOpen = pathname === LOCK_PATH || pathname === ADMIN_PATH || pathname.startsWith(`${ADMIN_PATH}/`);
  if (admin || !data.settings.locked || alwaysOpen) return next();

  // Formulaires (fetch) : une réponse claire plutôt qu'une redirection vers la page HTML
  if (pathname.startsWith('/api/')) {
    return Response.json({ error: 'verrouille' }, { status: 401 });
  }
  return context.redirect(LOCK_PATH, 302);
});
