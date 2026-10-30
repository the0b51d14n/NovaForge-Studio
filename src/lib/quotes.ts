// Devis créés depuis le simulateur (/devis) : chaque devis garde une copie de ses lignes et de ses prix,
// qui ne changent plus ensuite, même si les tarifs sont modifiés dans l'administration.
// Signable pendant QUOTE_VALIDITY_DAYS jours, seulement s'il a été créé après l'ouverture commerciale (launch.commercial).
// Un devis non signé est supprimé automatiquement de la base RETENTION_DAYS jours après sa création ;
// un devis signé est conservé (c'est un contrat).
import { launch } from '../data/site';
import { QUOTE_VALIDITY_DAYS } from '../data/quote-catalog';
import { VAT_RATES, quoteTotals, type Pricing, type QuoteLine, type Totals, type VatRegime } from './pricing';
import { parisNow } from './hours';
import { redis, text } from './store';

export type Quote = {
  /** Identifiant secret, dans l'adresse du devis (/devis/<id>) : seul celui qui a le lien peut le voir */
  id: string;
  /** Numéro affiché, ex. « D-2026-0007 » */
  number: string;
  createdAt: string;
  /** Fin de la période de signature, prix garantis jusque-là */
  expiresAt: string;
  vat: VatRegime;
  vatRate: number;
  lines: QuoteLine[];
  totals: { oneOff: Totals; monthly: Totals };
  /** false : créé avant l'ouverture commerciale, c'est une simulation qui ne pourra jamais être signée */
  binding: boolean;
  signature?: { name: string; email: string; signedAt: string };
};

export type QuoteStatus = 'simulation' | 'open' | 'expired' | 'signed';

const DAY = 86_400_000;
/** Délai de suppression d'un devis non signé : sa période de validité, puis 30 jours pour le consulter expiré */
export const RETENTION_DAYS = QUOTE_VALIDITY_DAYS + 30;
/** Au-delà, une même adresse IP doit attendre avant de créer un nouveau devis (protection contre les abus) */
const MAX_PER_HOUR = 20;

const KEYS = {
  quote: (id: string) => `nf:quote:${id}`,
  index: 'nf:quotes',
  sequence: 'nf:quote-seq',
  rate: (client: string) => `nf:quote-rate:${client}`,
};

const isQuoteId = (id: string) => /^[a-f0-9]{32}$/.test(id);

export function quoteStatus(quote: Quote, now = Date.now()): QuoteStatus {
  if (quote.signature) return 'signed';
  if (now >= Date.parse(quote.expiresAt)) return 'expired';
  return quote.binding && launch.commercial ? 'open' : 'simulation';
}

/**
 * Empreinte de l'adresse IP du visiteur (jamais l'adresse elle-même), pour limiter le nombre de devis par heure.
 * clientAddress : Astro.clientAddress, lu à la demande car il peut être indisponible.
 */
export async function clientKey(request: Request, clientAddress: () => string): Promise<string> {
  let ip = request.headers.get('x-forwarded-for')?.split(',')[0].trim() ?? '';
  if (!ip) {
    try {
      ip = clientAddress();
    } catch {
      ip = 'inconnu';
    }
  }
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(`nf-devis:${ip}`));
  return [...new Uint8Array(digest)]
    .slice(0, 12)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

/** Crée le devis avec les prix du moment, ou 'limite' si cette adresse en a déjà créé trop récemment */
export async function createQuote(lines: QuoteLine[], pricing: Pricing, client: string): Promise<Quote | 'limite'> {
  const [count] = await redis([
    ['INCR', KEYS.rate(client)],
    ['EXPIRE', KEYS.rate(client), '3600'],
  ]);
  if (Number(count) > MAX_PER_HOUR) return 'limite';

  const [sequence] = await redis([['INCR', KEYS.sequence]]);
  const now = Date.now();
  const vatRate = VAT_RATES[pricing.vat];
  const quote: Quote = {
    id: crypto.randomUUID().replace(/-/g, ''),
    number: `D-${parisNow().date.slice(0, 4)}-${String(sequence).padStart(4, '0')}`,
    createdAt: new Date(now).toISOString(),
    expiresAt: new Date(now + QUOTE_VALIDITY_DAYS * DAY).toISOString(),
    vat: pricing.vat,
    vatRate,
    lines,
    totals: quoteTotals(lines, vatRate),
    binding: launch.commercial,
  };
  await redis([
    ['SET', KEYS.quote(quote.id), JSON.stringify(quote), 'EX', String(RETENTION_DAYS * 86_400)],
    ['ZADD', KEYS.index, String(now), quote.id],
  ]);
  return quote;
}

export async function loadQuote(id: string): Promise<Quote | null> {
  if (!isQuoteId(id)) return null;
  const [quote] = await redis([['GET', KEYS.quote(id)]]);
  const saved = text(quote);
  return saved ? JSON.parse(saved) : null;
}

/** Enregistre la signature ; le devis est alors conservé sans limite de durée (SET sans EX retire l'expiration) */
export async function signQuote(quote: Quote, signer: { name: string; email: string }): Promise<Quote> {
  const signed: Quote = { ...quote, signature: { ...signer, signedAt: new Date().toISOString() } };
  await redis([['SET', KEYS.quote(quote.id), JSON.stringify(signed)]]);
  return signed;
}

/** Derniers devis créés, pour l'administration ; les devis supprimés automatiquement sortent de la liste */
export async function listQuotes(limit = 30): Promise<Quote[]> {
  const [ids] = await redis([['ZREVRANGE', KEYS.index, '0', String(limit - 1)]]);
  if (!Array.isArray(ids) || ids.length === 0) return [];
  const keys = ids.filter((id): id is string => typeof id === 'string');
  const [raw] = await redis([['MGET', ...keys.map(KEYS.quote)]]);
  const values = Array.isArray(raw) ? raw : [];
  const gone = keys.filter((_, i) => !values[i]);
  if (gone.length) await redis([['ZREM', KEYS.index, ...gone]]);
  return values.filter((v): v is string => typeof v === 'string').map((v) => JSON.parse(v));
}

export async function deleteQuote(id: string): Promise<void> {
  if (!isQuoteId(id)) return;
  await redis([
    ['DEL', KEYS.quote(id)],
    ['ZREM', KEYS.index, id],
  ]);
}
