// Connexion aux comptes (src/lib/accounts.ts) : le cookie ne contient qu'un jeton de session aléatoire, vérifié
// côté serveur à chaque requête. SITE_PASSWORD ne sert plus qu'une fois : créer le premier compte dirigeant.
import type { AstroCookies } from 'astro';
import { SITE_PASSWORD } from 'astro:env/server';
import { SESSION_MAX_AGE, createSession, deleteSession, sessionUser, type PublicUser } from './accounts';

/** Page « site fermé » affichée au public quand le site est verrouillé */
export const LOCK_PATH = '/verrouillage';
/** Portail de l'équipe (admins, admins+, dirigeants) */
export const ADMIN_PATH = '/administration';
/** Connexion de tous les comptes */
export const LOGIN_PATH = '/connexion';
const SESSION_COOKIE = 'nf_session';
// Aperçu du site verrouillé : sans lui, l'équipe voit la page fermée comme tout le monde
const PREVIEW_COOKIE = 'nf_apercu';

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

/** Compte connecté, ou null */
export async function currentUser(cookies: AstroCookies): Promise<PublicUser | null> {
  const token = cookies.get(SESSION_COOKIE)?.value;
  if (!token) return null;
  try {
    return await sessionUser(token);
  } catch (error) {
    // Base injoignable : personne n'est connecté plutôt qu'une page d'erreur
    console.error(error);
    return null;
  }
}

export async function logIn(cookies: AstroCookies, user: PublicUser): Promise<void> {
  cookies.set(SESSION_COOKIE, await createSession(user.id), {
    path: '/',
    httpOnly: true,
    sameSite: 'lax',
    secure: import.meta.env.PROD,
    maxAge: SESSION_MAX_AGE,
  });
}

export async function logOut(cookies: AstroCookies): Promise<void> {
  const token = cookies.get(SESSION_COOKIE)?.value;
  if (token) await deleteSession(token).catch(console.error);
  cookies.delete(SESSION_COOKIE, { path: '/' });
  stopPreview(cookies);
}

/** Adresse de retour après connexion : seulement une page du site (jamais un autre domaine) */
export const safeNext = (value: unknown): string | null =>
  typeof value === 'string' && /^\/(?!\/)[\w\-/.?=&#%]*$/.test(value) ? value : null;

/** true : un membre de l'équipe a choisi de consulter le site malgré le verrou (à combiner avec isAdmin) */
export const isPreviewing = (cookies: AstroCookies): boolean => cookies.get(PREVIEW_COOKIE)?.value === '1';

/** Aperçu valable jusqu'à la fermeture du navigateur */
export function startPreview(cookies: AstroCookies): void {
  cookies.set(PREVIEW_COOKIE, '1', { path: '/', httpOnly: true, sameSite: 'lax', secure: import.meta.env.PROD });
}

export function stopPreview(cookies: AstroCookies): void {
  cookies.delete(PREVIEW_COOKIE, { path: '/' });
}
