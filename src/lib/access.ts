// Accès administrateur : un mot de passe (SITE_PASSWORD), vérifié côté serveur sur /administration.
// Une fois le mot de passe saisi, le cookie contient une signature HMAC — jamais le mot de passe lui-même.
// Changer SITE_PASSWORD déconnecte donc toutes les sessions ouvertes.
import type { AstroCookies } from 'astro';
import { SITE_PASSWORD } from 'astro:env/server';

/** Page « site fermé » affichée au public quand le site est verrouillé */
export const LOCK_PATH = '/verrouillage';
/** Espace d'administration : connexion, verrou, adresse du siège, offres d'emploi */
export const ADMIN_PATH = '/administration';
const ADMIN_COOKIE = 'nf_admin';
const ADMIN_DAYS = 30;

const encoder = new TextEncoder();

async function sign(password: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(password),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  );
  const mac = new Uint8Array(await crypto.subtle.sign('HMAC', key, encoder.encode('novaforge-studio:admin')));
  return btoa(String.fromCharCode(...mac)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

// Comparaison en temps constant : la durée de la vérification ne trahit pas les caractères justes
function safeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

/** false : aucun mot de passe configuré, personne ne peut se connecter à l'administration */
export const isConfigured = (): boolean => Boolean(SITE_PASSWORD);

export async function isAdmin(cookies: AstroCookies): Promise<boolean> {
  const token = cookies.get(ADMIN_COOKIE)?.value;
  if (!SITE_PASSWORD || !token) return false;
  return safeEqual(token, await sign(SITE_PASSWORD));
}

export async function checkPassword(input: string): Promise<boolean> {
  if (!SITE_PASSWORD) return false;
  return safeEqual(await sign(input), await sign(SITE_PASSWORD));
}

export async function logIn(cookies: AstroCookies): Promise<void> {
  if (!SITE_PASSWORD) return;
  cookies.set(ADMIN_COOKIE, await sign(SITE_PASSWORD), {
    path: '/',
    httpOnly: true,
    sameSite: 'lax',
    secure: import.meta.env.PROD,
    maxAge: 60 * 60 * 24 * ADMIN_DAYS,
  });
}

export function logOut(cookies: AstroCookies): void {
  cookies.delete(ADMIN_COOKIE, { path: '/' });
}
