// Branché dans astro.config.mjs. Pour chaque page : charge le compte connecté et les données modifiables
// (verrou, adresse, offres) et, si le site est verrouillé, redirige tout le monde vers /verrouillage, équipe
// comprise, sauf si un membre de l'équipe a choisi « Voir le site en aperçu » sur cette page.
// Les fichiers statiques (CSS, JS, polices, images, favicon) sont servis directement, sans passer ici.
import { defineMiddleware } from 'astro:middleware';
import { ADMIN_PATH, LOCK_PATH, LOGIN_PATH, currentUser, isPreviewing } from './access';
import { isStaff } from './accounts';
import { loadData, purgeExpiredClosures } from './store';

const LEGAL_PATHS = ['/mentions-legales', '/confidentialite'];

export const onRequest = defineMiddleware(async (context, next) => {
  const { pathname } = context.url;
  // Vérification fréquente des pages ouvertes : toujours accessible, sans charger toutes les données
  if (pathname === '/api/version') return next();

  const [user, data] = await Promise.all([currentUser(context.cookies), loadData()]);
  const admin = isStaff(user);
  context.locals.user = user;
  context.locals.isAdmin = admin;
  context.locals.settings = await purgeExpiredClosures(data.settings);
  context.locals.openings = data.openings;
  context.locals.version = data.version;

  // Les pages légales restent consultables même site verrouillé (identification de l'éditeur, données personnelles)
  const alwaysOpen =
    pathname === LOCK_PATH ||
    pathname === LOGIN_PATH ||
    // Comptes clients : inscription, confirmation d'adresse et espace restent ouverts, même site verrouillé
    ['/inscription', '/confirmation', '/espace'].includes(pathname.replace(/\/$/, '')) ||
    pathname === ADMIN_PATH ||
    pathname.startsWith(`${ADMIN_PATH}/`) ||
    LEGAL_PATHS.includes(pathname.replace(/\/$/, ''));
  const preview = admin && isPreviewing(context.cookies);
  if (preview || !data.settings.locked || alwaysOpen) return next();

  // Formulaires (fetch) : une réponse claire plutôt qu'une redirection vers la page HTML
  if (pathname.startsWith('/api/')) {
    return Response.json({ error: 'verrouille' }, { status: 401 });
  }
  return context.redirect(LOCK_PATH, 302);
});
