// Connexion aux comptes (src/lib/accounts.ts) : le cookie ne contient qu'un jeton de session aléatoire, vérifié
// côté serveur à chaque requête. Le site public et le portail de l'équipe ont chacun leur cookie : être connecté
// sur l'un ne connecte pas sur l'autre. SITE_PASSWORD ne sert plus qu'une fois : créer le premier compte dirigeant.
import type { AstroCookies } from 'astro';
import { SITE_PASSWORD } from 'astro:env/server';
import { SESSION_MAX_AGE, createSession, deleteSession, sessionUser, type PublicUser } from './accounts';

/** Page « site fermé » affichée au public quand le site est verrouillé */
export const LOCK_PATH = '/verrouillage';
/** Connexion des comptes clients */
export const LOGIN_PATH = '/connexion';

const encoder = new TextEncoder();

async function digest(value: string): Promise<string> {
  const hash = new Uint8Array(await crypto.subtle.digest('SHA-256', encoder.encode(`novaforge-studio:${value}`)));
  return btoa(String.fromCharCode(...hash));
}

// Comparaison en temps constant : la durée de la vérification ne trahit pas les caractères justes
function safeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

/** false : aucun SITE_PASSWORD configuré, le premier compte dirigeant ne peut pas être créé */
export const isConfigured = (): boolean => Boolean(SITE_PASSWORD);

/** Mot de passe du site, demandé une seule fois pour créer le premier compte dirigeant */
export async function checkSitePassword(input: string): Promise<boolean> {
  if (!SITE_PASSWORD) return false;
  return safeEqual(await digest(input), await digest(SITE_PASSWORD));
}

/** Session d'une application, gardée dans son propre cookie (en local, les cookies de localhost valent pour tous
 * les ports : un nom différent par application évite qu'une connexion au site ouvre le portail) */
export function sessions(cookie: string) {
  return {
    /** Compte connecté, ou null */
    async currentUser(cookies: AstroCookies): Promise<PublicUser | null> {
      const token = cookies.get(cookie)?.value;
      if (!token) return null;
      try {
        return await sessionUser(token);
      } catch (error) {
        // Base injoignable : personne n'est connecté plutôt qu'une page d'erreur
        console.error(error);
        return null;
      }
    },
    async logIn(cookies: AstroCookies, user: PublicUser): Promise<void> {
      cookies.set(cookie, await createSession(user.id), {
        path: '/',
        httpOnly: true,
        sameSite: 'lax',
        secure: import.meta.env.PROD,
        maxAge: SESSION_MAX_AGE,
      });
    },
    async logOut(cookies: AstroCookies): Promise<void> {
      const token = cookies.get(cookie)?.value;
      if (token) await deleteSession(token).catch(console.error);
      cookies.delete(cookie, { path: '/' });
    },
  };
}

/** Session du site public (comptes clients) ; le portail a la sienne */
export const { currentUser, logIn, logOut } = sessions('nf_session');

/** Adresse de retour après connexion : seulement une page du site (jamais un autre domaine) */
export const safeNext = (value: unknown): string | null =>
  typeof value === 'string' && /^\/(?!\/)[\w\-/.?=&#%]*$/.test(value) ? value : null;

