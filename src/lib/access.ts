// Verrouillage du site : un mot de passe partagé (SITE_PASSWORD), vérifié côté serveur.
// Une fois le mot de passe saisi, le cookie contient une signature HMAC — jamais le mot de passe lui-même.
// Changer SITE_PASSWORD invalide donc tous les accès déjà donnés.
import type { AstroCookies } from 'astro';
import { SITE_PASSWORD } from 'astro:env/server';

export const LOCK_PATH = '/verrouillage';
const ACCESS_COOKIE = 'nf_access';
const ACCESS_DAYS = 30;

const encoder = new TextEncoder();

async function sign(password: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(password),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  );
  const mac = new Uint8Array(await crypto.subtle.sign('HMAC', key, encoder.encode('novaforge-studio:acces')));
  return btoa(String.fromCharCode(...mac)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

// Comparaison en temps constant : la durée de la vérification ne trahit pas les caractères justes
function safeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

/** false : aucun mot de passe configuré, le site reste fermé à tous */
export const isConfigured = (): boolean => Boolean(SITE_PASSWORD);

export async function hasAccess(cookies: AstroCookies): Promise<boolean> {
  const token = cookies.get(ACCESS_COOKIE)?.value;
  if (!SITE_PASSWORD || !token) return false;
  return safeEqual(token, await sign(SITE_PASSWORD));
}

export async function checkPassword(input: string): Promise<boolean> {
  if (!SITE_PASSWORD) return false;
  return safeEqual(await sign(input), await sign(SITE_PASSWORD));
}

export async function grantAccess(cookies: AstroCookies): Promise<void> {
  if (!SITE_PASSWORD) return;
  cookies.set(ACCESS_COOKIE, await sign(SITE_PASSWORD), {
    path: '/',
    httpOnly: true,
    sameSite: 'lax',
    secure: import.meta.env.PROD,
    maxAge: 60 * 60 * 24 * ACCESS_DAYS,
  });
}

export function revokeAccess(cookies: AstroCookies): void {
  cookies.delete(ACCESS_COOKIE, { path: '/' });
}

// Page à rouvrir après le déverrouillage : uniquement un chemin du site (pas de redirection vers l'extérieur)
export function safeNext(value: string | null): string {
  if (!value || !value.startsWith('/') || value.startsWith('//') || value.startsWith('/\\')) return '/';
  if (value.startsWith(LOCK_PATH)) return '/';
  return value;
}
