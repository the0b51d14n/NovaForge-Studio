// Verrou du site (branché dans astro.config.mjs) : sans le bon mot de passe, toute page redirige vers /verrouillage.
// Les fichiers statiques (CSS, JS, polices, images, favicon) sont servis directement, sans passer ici.
import { defineMiddleware } from 'astro:middleware';
import { LOCK_PATH, hasAccess } from './access';

export const onRequest = defineMiddleware(async (context, next) => {
  const { pathname, search } = context.url;
  if (pathname === LOCK_PATH || (await hasAccess(context.cookies))) return next();

  // Formulaires (fetch) : une réponse claire plutôt qu'une redirection vers la page HTML
  if (pathname.startsWith('/api/')) {
    return Response.json({ error: 'verrouille' }, { status: 401 });
  }

  const target = pathname === '/' ? LOCK_PATH : `${LOCK_PATH}?suite=${encodeURIComponent(pathname + search)}`;
  return context.redirect(target, 302);
});
