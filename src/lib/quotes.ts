// Devis du simulateur (/devis), en trois temps, à la même adresse (/devis/<id>) :
// 1. Estimation : le visiteur choisit famille, type, options et budget envisagé ; l'estimation (total en fourchette,
//    comparé au budget, avec une version ajustée si le budget est insuffisant) est figée QUOTE_VALIDITY_DAYS jours.
//    Aucune donnée personnelle.
// 2. Demande de rappel : le visiteur laisse ses coordonnées pour qu'un conseiller le rappelle (après l'ouverture
//    commerciale).
// 3. Devis ferme : le conseiller fixe les prix depuis l'administration (lignes retirées, remise éventuelle) ; le client
//    peut le signer en ligne pendant QUOTE_VALIDITY_DAYS jours (seulement après l'ouverture commerciale).
// Un devis non signé est supprimé automatiquement 30 jours après la fin de sa validité ; un devis signé est conservé.
import { launch } from '../data/site';
import { QUOTE_VALIDITY_DAYS, VAT_REGIME } from '../data/quote-catalog';
import {
  VAT_RATE,
  finalTotals,
  type AppliedDiscount,
  type BudgetFit,
  type EstimateLine,
  type FinalLine,
  type RangeTotals,
  type Suggestion,
  type Totals,
  type VatRegime,
} from './pricing';
import { parisNow } from './hours';
import { redis, text } from './store';

export type Contact = { name: string; phone: string; email: string; message: string; requestedAt: string };

/** Ce que le simulateur calcule ; le reste du devis (numéro, dates…) est ajouté à l'enregistrement */
export type QuoteDraft = {
  family: { id: string; title: string };
  /** Formule (type) choisie */
  base: string;
  /** Budget envisagé par le visiteur, null s'il ne le connaît pas encore */
  budget: { label: string; monthly: boolean; fit: BudgetFit } | null;
  lines: EstimateLine[];
  discounts: AppliedDiscount[];
  totals: { oneOff: RangeTotals; monthly: RangeTotals };
  /** Version ajustée au budget, quand celui-ci ne couvre pas l'estimation */
  suggestion?: Suggestion;
};

export type Quote = QuoteDraft & {
  /** Identifiant secret, dans l'adresse du devis (/devis/<id>) : seul celui qui a le lien peut le voir */
  id: string;
  /** Numéro affiché, ex. « D-2026-0007 » */
  number: string;
  createdAt: string;
  /** Fin de validité de l'estimation (fourchettes garanties jusque-là) */
  expiresAt: string;
  vat: VatRegime;
  vatRate: number;
  /** false : créé avant l'ouverture commerciale, ce n'est qu'une simulation (ni rappel ni signature) */
  binding: boolean;
  /** Compte client connecté au moment de la simulation : le devis apparaît dans son espace (/espace) */
  ownerId?: string;
  contact?: Contact;
  /** Admin+ chargé du devis (lui seul peut fixer les prix), attribué par un admin+ */
  assignee?: { id: string; name: string; assignedAt: string; by: string };
  /** Devis ferme émis depuis l'administration */
  final?: {
    lines: FinalLine[];
    /** Remise accordée par le conseiller, en centimes HT */
    discount?: { label: string; amount: number };
    totals: { oneOff: Totals; monthly: Totals };
    note: string;
    issuedAt: string;
    /** Fin de la période de signature */
    expiresAt: string;
  };
  signature?: { name: string; email: string; signedAt: string };
};

/**
 * estimation : en attente d'une demande de rappel ; rappel : coordonnées laissées, devis ferme à établir ;
 * ferme : devis ferme émis, à signer ; expire : estimation ou devis ferme dépassé ; signe : accepté par le client
 */
export type QuoteStatus = 'estimation' | 'rappel' | 'ferme' | 'expire' | 'signe';

const DAY = 86_400_000;
/** Délai de conservation après la fin de validité, pour consulter un devis expiré */
const GRACE_DAYS = 30;
export const RETENTION_DAYS = QUOTE_VALIDITY_DAYS + GRACE_DAYS;
/** Au-delà, une même adresse IP doit attendre avant de créer une nouvelle estimation (protection contre les abus) */
const MAX_PER_HOUR = 20;

const KEYS = {
  quote: (id: string) => `nf:quote:${id}`,
  index: 'nf:quotes',
  sequence: 'nf:quote-seq',
  owner: (userId: string) => `nf:user-quotes:${userId}`,
  rate: (client: string) => `nf:quote-rate:${client}`,
};

export const isQuoteId = (id: string) => /^[a-f0-9]{32}$/.test(id);

export function quoteStatus(quote: Quote, now = Date.now()): QuoteStatus {
  if (quote.signature) return 'signe';
  if (quote.final) return now >= Date.parse(quote.final.expiresAt) ? 'expire' : 'ferme';
  if (now >= Date.parse(quote.expiresAt)) return 'expire';
  return quote.contact ? 'rappel' : 'estimation';
}

/** Le visiteur peut demander à être rappelé (estimation en cours, studio ouvert commercialement) */
export const canRequestCallback = (quote: Quote) =>
  quoteStatus(quote) === 'estimation' && quote.binding && launch.commercial;

/** Le client peut signer le devis ferme */
export const canSign = (quote: Quote) => quoteStatus(quote) === 'ferme' && quote.binding && launch.commercial;

/** Enregistre le devis ; expires : date de fin de validité, ou null pour le conserver (devis signé) */
async function save(quote: Quote, expires: string | null): Promise<void> {
  const ttl = expires ? Math.max(60, Math.ceil((Date.parse(expires) + GRACE_DAYS * DAY - Date.now()) / 1000)) : null;
  await redis([['SET', KEYS.quote(quote.id), JSON.stringify(quote), ...(ttl ? ['EX', String(ttl)] : [])]]);
}

/**
 * Empreinte de l'adresse IP du visiteur (jamais l'adresse elle-même), pour limiter le nombre d'estimations par heure.
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

/**
 * Enregistre l'estimation telle que calculée, ou 'limite' si cette adresse en a déjà créé trop récemment.
 * ownerId : compte client connecté, qui retrouvera le devis dans son espace.
 */
export async function createQuote(draft: QuoteDraft, client: string, ownerId?: string): Promise<Quote | 'limite'> {
  const [count] = await redis([
    ['INCR', KEYS.rate(client)],
    ['EXPIRE', KEYS.rate(client), '3600'],
  ]);
  if (Number(count) > MAX_PER_HOUR) return 'limite';

  const [sequence] = await redis([['INCR', KEYS.sequence]]);
  const now = Date.now();
  const quote: Quote = {
    ...draft,
    id: crypto.randomUUID().replace(/-/g, ''),
    number: `D-${parisNow().date.slice(0, 4)}-${String(sequence).padStart(4, '0')}`,
    createdAt: new Date(now).toISOString(),
    expiresAt: new Date(now + QUOTE_VALIDITY_DAYS * DAY).toISOString(),
    vat: VAT_REGIME,
    vatRate: VAT_RATE,
    binding: launch.commercial,
    ...(ownerId ? { ownerId } : {}),
  };
  await save(quote, quote.expiresAt);
  await redis([
    ['ZADD', KEYS.index, String(now), quote.id],
    ...(ownerId ? [['ZADD', KEYS.owner(ownerId), String(now), quote.id]] : []),
  ]);
  return quote;
}

/** Devis d'un compte client, du plus récent au plus ancien ; les devis supprimés automatiquement sortent de la liste */
export async function listUserQuotes(userId: string): Promise<Quote[]> {
  const [ids] = await redis([['ZREVRANGE', KEYS.owner(userId), '0', '-1']]);
  if (!Array.isArray(ids) || ids.length === 0) return [];
  const keys = ids.filter((id): id is string => typeof id === 'string');
  const [raw] = await redis([['MGET', ...keys.map(KEYS.quote)]]);
  const values = Array.isArray(raw) ? raw : [];
  const gone = keys.filter((_, i) => !values[i]);
  if (gone.length) await redis([['ZREM', KEYS.owner(userId), ...gone]]);
  return values.filter((v): v is string => typeof v === 'string').map((v) => JSON.parse(v));
}

/**
 * À la suppression d'un compte client : ses devis non signés sont supprimés ; un devis signé (contrat) est conservé,
 * détaché du compte. purge : tout supprimer, devis signés compris (comptes de test seulement).
 */
export async function deleteUserQuotes(userId: string, purge = false): Promise<void> {
  for (const quote of await listUserQuotes(userId)) {
    if (quote.signature && !purge) {
      const { ownerId: _owner, ...rest } = quote;
      await save(rest, null);
    } else {
      await deleteQuote(quote.id);
    }
  }
  await redis([['DEL', KEYS.owner(userId)]]);
}

export async function loadQuote(id: string): Promise<Quote | null> {
  if (!isQuoteId(id)) return null;
  const [quote] = await redis([['GET', KEYS.quote(id)]]);
  const saved = text(quote);
  return saved ? JSON.parse(saved) : null;
}

/** Fin de validité qui règle la durée de conservation : devis ferme s'il existe, sinon estimation ; null si signé */
const retentionOf = (quote: Quote) => (quote.signature ? null : (quote.final?.expiresAt ?? quote.expiresAt));

/** Attribue le devis à un admin+ (null : retire l'attribution) ; by : nom de la personne qui attribue */
export async function assignQuote(quote: Quote, assignee: { id: string; name: string } | null, by: string): Promise<void> {
  const { assignee: _previous, ...rest } = quote;
  const next: Quote = assignee ? { ...rest, assignee: { ...assignee, assignedAt: new Date().toISOString(), by } } : rest;
  await save(next, retentionOf(next));
}

export async function requestCallback(quote: Quote, contact: Omit<Contact, 'requestedAt'>): Promise<void> {
  await save({ ...quote, contact: { ...contact, requestedAt: new Date().toISOString() } }, quote.expiresAt);
}

/**
 * Émet (ou réémet) le devis ferme : prix unitaires HT fixés par le conseiller (centimes, par ligne), lignes retirées,
 * remise éventuelle. La période de signature repart de zéro à chaque émission.
 */
export async function finalizeQuote(
  quote: Quote,
  prices: Record<string, number>,
  removed: string[],
  discount: { label: string; amount: number } | null,
  note: string,
): Promise<void> {
  const lines: FinalLine[] = quote.lines
    .filter((line) => !removed.includes(line.id))
    .map(({ unitPrice: _range, total: _total, ...line }) => ({
      ...line,
      unitPrice: prices[line.id],
      total: prices[line.id] * line.qty,
    }));
  const now = Date.now();
  const final = {
    lines,
    ...(discount ? { discount } : {}),
    totals: finalTotals(lines, quote.vatRate, discount?.amount),
    note,
    issuedAt: new Date(now).toISOString(),
    expiresAt: new Date(now + QUOTE_VALIDITY_DAYS * DAY).toISOString(),
  };
  await save({ ...quote, final }, final.expiresAt);
}

/** Enregistre la signature ; le devis est alors conservé sans limite de durée (SET sans EX retire l'expiration) */
export async function signQuote(quote: Quote, signer: { name: string; email: string }): Promise<void> {
  await save({ ...quote, signature: { ...signer, signedAt: new Date().toISOString() } }, null);
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
