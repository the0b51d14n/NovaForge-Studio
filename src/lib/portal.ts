// Portail de l'équipe : application séparée (dossier novaforge-studio-admin), servie par son propre serveur à
// l'adresse ADMIN_URL. Les anciennes adresses /administration du site y redirigent (src/lib/middleware.ts).
import { ADMIN_URL } from 'astro:env/server';

/** Ancienne adresse du portail sur le site */
export const OLD_ADMIN_PATH = '/administration';

/** false : ADMIN_URL non renseignée, le portail est introuvable depuis le site */
export const hasPortal = (): boolean => Boolean(ADMIN_URL);

/** Adresse d'une page du portail, ex. adminHref('/devis/abc') ; sans ADMIN_URL, l'ancienne adresse du site */
export const adminHref = (path = '/'): string =>
  ADMIN_URL ? `${ADMIN_URL.replace(/\/$/, '')}${path}` : `${OLD_ADMIN_PATH}${path === '/' ? '' : path}`;
