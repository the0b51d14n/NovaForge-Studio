// Données modifiables depuis /administration : verrou du site, adresse du siège, fermetures, offres d'emploi.
// Stockées dans Upstash Redis (Vercel → Storage → Upstash) via son API REST.
// Les devis du simulateur sont gérés dans src/lib/quotes.ts, avec la même base.
// Sans Redis configuré (développement local), elles vivent en mémoire et sont perdues au redémarrage.
// Tant que rien n'a été enregistré, les valeurs de src/data/site.ts et src/data/content.ts servent de départ.
import {
  KV_REST_API_TOKEN,
  KV_REST_API_URL,
  UPSTASH_REDIS_REST_TOKEN,
  UPSTASH_REDIS_REST_URL,
} from 'astro:env/server';
import { launch, site } from '../data/site';
import { initialOpenings, type Opening } from '../data/content';
import { parisNow, startOfWeek, type Closure } from './hours';
import type { LockReason } from '../data/lock-reasons';

export type Settings = {
  /** true : tout le monde voit /verrouillage (l'administrateur peut activer un aperçu depuis cette page) */
  locked: boolean;
  /** Motif affiché sur /verrouillage (maintenance, fermeture complète, mise à jour) */
  lockReason: LockReason;
  street: string;
  postalCode: string;
  city: string;
  geo: { lat: number; lng: number };
  /** true : la page Contact affiche « Fermé » les jours fériés */
  holidays: boolean;
  /** Fermetures exceptionnelles (ponts, vacances…), triées par date */
  closures: Closure[];
};

// nf:version : tampon changé à chaque enregistrement, surveillé par les pages ouvertes (src/scripts/live.ts)
const KEYS = { settings: 'nf:settings', openings: 'nf:openings', version: 'nf:version' } as const;
const stamp = () => Date.now().toString(36);

const defaults = (): { settings: Settings; openings: Opening[] } => ({
  settings: {
    locked: true,
    lockReason: 'fermeture',
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

export type Reply = string | number | null | (string | null)[];
/** Réponse texte (GET), ou null */
export const text = (reply: Reply): string | null => (typeof reply === 'string' ? reply : null);

const memory = new Map<string, string>();
const sorted = new Map<string, Map<string, number>>();

// Sans Redis : les seules commandes utilisées par le site, en mémoire (les durées d'expiration sont ignorées)
function local([cmd, key, ...args]: string[]): Reply {
  const zset = sorted.get(key) ?? new Map<string, number>();
  switch (cmd) {
    case 'GET':
      return memory.get(key) ?? null;
    case 'MGET':
      return [key, ...args].map((k) => memory.get(k) ?? null);
    case 'SET':
      // NX : seulement si la clé n'existe pas encore (réservation d'une adresse e-mail)
      if (args.includes('NX') && memory.has(key)) return null;
      memory.set(key, args[0]);
      return 'OK';
    case 'DEL':
      return Number(memory.delete(key) || sorted.delete(key));
    case 'INCR': {
      const n = Number(memory.get(key) ?? 0) + 1;
      memory.set(key, String(n));
      return n;
    }
    case 'ZADD':
      sorted.set(key, zset.set(args[1], Number(args[0])));
      return 1;
    case 'ZREM':
      return args.filter((member) => zset.delete(member)).length;
    case 'ZREVRANGE': {
      // Fin négative comme dans Redis : -1 = jusqu'au dernier
      const end = Number(args[1]);
      return [...zset]
        .sort((a, b) => b[1] - a[1])
        .slice(Number(args[0]), end < 0 ? zset.size + end + 1 : end + 1)
        .map(([member]) => member);
    }
    default:
      return 'OK';
  }
}

export async function redis(commands: string[][]): Promise<Reply[]> {
  if (!isPersistent()) return commands.map(local);
  const res = await fetch(`${redisUrl}/pipeline`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${redisToken}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(commands),
  });
  if (!res.ok) throw new Error(`Redis : HTTP ${res.status}`);
  const replies = (await res.json()) as { result?: Reply; error?: string }[];
  return replies.map((reply) => {
    if (reply.error) throw new Error(`Redis : ${reply.error}`);
    return reply.result ?? null;
  });
}

export async function loadData(): Promise<{ settings: Settings; openings: Opening[]; version: string }> {
  const base = defaults();
  try {
    const [settings, openings, version] = (
      await redis([
        ['GET', KEYS.settings],
        ['GET', KEYS.openings],
        ['GET', KEYS.version],
      ])
    ).map(text);
    return {
      settings: settings ? { ...base.settings, ...JSON.parse(settings) } : base.settings,
      openings: openings ? JSON.parse(openings) : base.openings,
      version: version ?? '0',
    };
  } catch (error) {
    // Base injoignable : le site reste fermé au public plutôt que d'afficher une erreur
    console.error(error);
    return { ...base, settings: { ...base.settings, locked: true }, version: '0' };
  }
}

/** Tampon de la dernière modification : une seule lecture, pour les vérifications fréquentes */
export async function readVersion(): Promise<string> {
  const [version] = await redis([['GET', KEYS.version]]);
  return text(version) ?? '0';
}

export async function saveSettings(settings: Settings): Promise<void> {
  await redis([
    ['SET', KEYS.settings, JSON.stringify(settings)],
    ['SET', KEYS.version, stamp()],
  ]);
}

/**
 * Fermetures exceptionnelles : une fermeture passée reste enregistrée jusqu'à la fin de sa semaine
 * (la page Contact affiche « Fermé » ce jour-là), puis elle est supprimée de la base pour de bon.
 * Appelée à chaque requête ; n'écrit que lorsqu'il y a quelque chose à supprimer.
 */
export async function purgeExpiredClosures(settings: Settings): Promise<Settings> {
  const monday = startOfWeek(parisNow().date);
  const kept = settings.closures.filter((c) => c.end >= monday);
  if (kept.length === settings.closures.length) return settings;
  const next = { ...settings, closures: kept };
  try {
    // Pas de nouveau tampon de version : l'affichage des pages ouvertes ne change pas
    await redis([['SET', KEYS.settings, JSON.stringify(next)]]);
  } catch (error) {
    console.error(error);
  }
  return next;
}

export async function saveOpenings(openings: Opening[]): Promise<void> {
  await redis([
    ['SET', KEYS.openings, JSON.stringify(openings)],
    ['SET', KEYS.version, stamp()],
  ]);
}

/** Offres affichées au public : aucune tant que le recrutement n'est pas réellement ouvert (launch.recruitment) */
export const visibleOffers = (locals: App.Locals) => (launch.recruitment ? locals.openings : []);

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
