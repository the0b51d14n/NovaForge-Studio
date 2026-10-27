// Données modifiables depuis /administration : verrou du site, adresse du siège, fermetures, offres d'emploi.
// Stockées dans Upstash Redis (Vercel → Storage → Upstash) via son API REST.
// Sans Redis configuré (développement local), elles vivent en mémoire et sont perdues au redémarrage.
// Tant que rien n'a été enregistré, les valeurs de src/data/site.ts et src/data/content.ts servent de départ.
import {
  KV_REST_API_TOKEN,
  KV_REST_API_URL,
  UPSTASH_REDIS_REST_TOKEN,
  UPSTASH_REDIS_REST_URL,
} from 'astro:env/server';
import { site } from '../data/site';
import { initialOpenings, type Opening } from '../data/content';
import type { Closure } from './hours';

export type Settings = {
  /** true : seul l'administrateur voit le site, le public voit /verrouillage */
  locked: boolean;
  street: string;
  postalCode: string;
  city: string;
  geo: { lat: number; lng: number };
  /** true : la page Contact affiche « Fermé » les jours fériés */
  holidays: boolean;
  /** Fermetures exceptionnelles (ponts, vacances…), triées par date */
  closures: Closure[];
};

const KEYS = { settings: 'nf:settings', openings: 'nf:openings' } as const;

const defaults = (): { settings: Settings; openings: Opening[] } => ({
  settings: {
    locked: true,
    street: site.address[0],
    postalCode: site.postalCode,
    city: site.city,
    geo: { ...site.geo },
    holidays: true,
    closures: [],
  },
  openings: structuredClone(initialOpenings),
});

const redisUrl = KV_REST_API_URL ?? UPSTASH_REDIS_REST_URL;
const redisToken = KV_REST_API_TOKEN ?? UPSTASH_REDIS_REST_TOKEN;

/** false : pas de base configurée, les modifications ne survivent pas à un redémarrage */
export const isPersistent = (): boolean => Boolean(redisUrl && redisToken);

const memory = new Map<string, string>();

async function redis(commands: string[][]): Promise<(string | null)[]> {
  if (!isPersistent()) {
    return commands.map(([cmd, key, value]) => {
      if (cmd === 'SET') memory.set(key, value);
      return cmd === 'GET' ? memory.get(key) ?? null : 'OK';
    });
  }
  const res = await fetch(`${redisUrl}/pipeline`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${redisToken}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(commands),
  });
  if (!res.ok) throw new Error(`Redis : HTTP ${res.status}`);
  const replies = (await res.json()) as { result?: string | null; error?: string }[];
  return replies.map((reply) => {
    if (reply.error) throw new Error(`Redis : ${reply.error}`);
    return reply.result ?? null;
  });
}

export async function loadData(): Promise<{ settings: Settings; openings: Opening[] }> {
  const base = defaults();
  try {
    const [settings, openings] = await redis([
      ['GET', KEYS.settings],
      ['GET', KEYS.openings],
    ]);
    return {
      settings: settings ? { ...base.settings, ...JSON.parse(settings) } : base.settings,
      openings: openings ? JSON.parse(openings) : base.openings,
    };
  } catch (error) {
    // Base injoignable : le site reste fermé au public plutôt que d'afficher une erreur
    console.error(error);
    return { ...base, settings: { ...base.settings, locked: true } };
  }
}

export async function saveSettings(settings: Settings): Promise<void> {
  await redis([['SET', KEYS.settings, JSON.stringify(settings)]]);
}

export async function saveOpenings(openings: Opening[]): Promise<void> {
  await redis([['SET', KEYS.openings, JSON.stringify(openings)]]);
}

/** Empreinte des données de l'administration : change à chaque enregistrement (rafraîchissement automatique) */
export function dataVersion(locals: App.Locals): string {
  const json = JSON.stringify([locals.settings, locals.openings]);
  // Hachage FNV-1a 32 bits : court et suffisant pour détecter un changement
  let hash = 0x811c9dc5;
  for (let i = 0; i < json.length; i++) hash = Math.imul(hash ^ json.charCodeAt(i), 0x01000193);
  return (hash >>> 0).toString(36);
}

/** Informations de l'entreprise, avec l'adresse du siège enregistrée depuis l'administration */
export function getSite(locals: App.Locals) {
  const { street, postalCode, city, geo } = locals.settings;
  const address = [street, `${postalCode} ${city}`];
  // Itinéraire Google Maps : lien de secours quand le choix de l'application (DirectionsPicker) n'est pas disponible
  const directions = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(`${address.join(', ')}, France`)}`;
  return { ...site, address, postalCode, city, geo, directions };
}

/** Coordonnées d'une adresse (OpenStreetMap / Nominatim) pour la carte, ou null si introuvable */
export async function geocode(street: string, postalCode: string, city: string): Promise<Settings['geo'] | null> {
  const params = new URLSearchParams({
    street,
    postalcode: postalCode,
    city,
    country: 'France',
    format: 'json',
    limit: '1',
  });
  try {
    const res = await fetch(`https://nominatim.openstreetmap.org/search?${params}`, {
      headers: { 'User-Agent': 'NovaForge Studio (administration du site)', 'Accept-Language': 'fr' },
      signal: AbortSignal.timeout(6000),
    });
    if (!res.ok) return null;
    const [hit] = (await res.json()) as { lat: string; lon: string }[];
    return hit ? { lat: Number(hit.lat), lng: Number(hit.lon) } : null;
  } catch {
    return null;
  }
}
