// Branchement du moteur NovaForge SmartQuote (src/lib/smartquote.ts) sur le catalogue du site
// (src/data/quote-catalog.ts) : lecture du formulaire du simulateur, calcul, formats d'affichage, devis fermes.
// Tous les calculs de prix des estimations sont faits par le moteur, côté serveur.
import { ADDON_GROUP, VAT_REGIME, catalog, discounts, type CatalogGroup, type Unit } from '../data/quote-catalog';
import {
  CRITERIA,
  computeTotals,
  formatEuros,
  isLevel,
  isPriority,
  priceRange,
  smartQuote,
  type Criterion,
  type Level,
  type Priority,
  type Range,
  type SmartInput,
  type SmartResult,
  type Totals,
} from './smartquote';

export { computeTotals, formatEuros, priceRange, type Range, type Totals };

/** Régime de TVA : franchise en base (aucune TVA facturée, art. 293 B du CGI) ou taux normal */
export type VatRegime = 'franchise' | 'normal';
export const VAT_RATES: Record<VatRegime, number> = { franchise: 0, normal: 20 };
export const VAT_RATE = VAT_RATES[VAT_REGIME];

type LineBase = {
  id: string;
  /** Titre du groupe du catalogue (famille ou accompagnement) */
  group: string;
  label: string;
  detail?: string;
  unit: Unit;
  qty: number;
  monthly: boolean;
};
/** Ligne d'une estimation : prix unitaire et total en fourchette (repère du conseiller) */
export type EstimateLine = LineBase & { unitPrice: Range; total: Range; recommended?: number };
/** Ligne d'un devis ferme : prix fixés par le conseiller */
export type FinalLine = LineBase & { unitPrice: number; total: number };
export type RangeTotals = { min: Totals; max: Totals };

const priced = (group: CatalogGroup): CatalogGroup => ({ ...group, items: group.items.filter((item) => item.price !== null) });

/** Familles proposées à la première étape : groupes qui ont au moins une formule avec un prix */
export function families(): CatalogGroup[] {
  return catalog
    .filter((group) => group.id !== ADDON_GROUP)
    .map(priced)
    .filter((group) => group.items.some((item) => item.kind === 'base'));
}

/** Groupe dont les options s'ajoutent à toutes les familles, s'il a des prix */
export function addonGroup(): CatalogGroup | null {
  const group = catalog.find((g) => g.id === ADDON_GROUP);
  const withPrices = group ? priced(group) : null;
  return withPrices && withPrices.items.length > 0 ? withPrices : null;
}

/** Famille facturée au mois (toutes ses formules sont mensuelles, comme la maintenance) */
export const isMonthlyFamily = (group: CatalogGroup) =>
  group.items.filter((item) => item.kind === 'base').every((item) => item.monthly);

/** « 1 234,50 » ou « 1234.5 » (euros saisis) → 123450 ; null si vide ou invalide */
export function parseEuros(value: string): number | null {
  const clean = value.replace(/[\s  €]/g, '').replace(',', '.');
  if (!/^\d{1,7}(\.\d{1,2})?$/.test(clean)) return null;
  return Math.round(Number(clean) * 100);
}

/**
 * Lecture du formulaire du simulateur : family, base:<famille>, option, qty:<id>, prio:<id>, cx:<critère>, budget.
 * Le navigateur n'envoie que des choix : aucun prix n'est lu ici.
 */
export function readInput(data: FormData): SmartInput {
  const family = String(data.get('family') ?? '');
  const quantities: Record<string, number> = {};
  const priorities: Record<string, Priority> = {};
  const complexity: Partial<Record<Criterion, Level>> = {};
  for (const [name, value] of data) {
    if (name.startsWith('qty:')) quantities[name.slice(4)] = Number(value);
    if (name.startsWith('prio:') && isPriority(value)) priorities[name.slice(5)] = value;
    if (name.startsWith('cx:')) {
      const criterion = name.slice(3) as Criterion;
      const level = value === '' ? null : Number(value);
      if (CRITERIA.includes(criterion) && isLevel(level)) complexity[criterion] = level;
    }
  }
  const budget = parseEuros(String(data.get('budget') ?? '').trim());
  return {
    family,
    base: String(data.get(`base:${family}`) ?? data.get('base') ?? ''),
    options: data.getAll('option').map(String),
    quantities,
    complexity,
    priorities,
    budget: budget && budget > 0 ? budget : null,
  };
}

/** Calcul SmartQuote sur le catalogue du site ; today : date du jour à Paris (AAAA-MM-JJ) */
export const runSmartQuote = (input: SmartInput, today: string): SmartResult | null =>
  smartQuote(input, { catalog, addonGroup: ADDON_GROUP, vatRate: VAT_RATE, discounts, today });

/** Lignes facturées du projet demandé, au format du devis ferme (repères de prix pour le conseiller) */
export const toEstimateLines = (result: SmartResult): EstimateLine[] =>
  result.lines
    .filter((l) => l.status === 'facture' && l.unitPrice && l.total)
    .map((l) => ({
      id: l.id,
      group: l.group,
      label: l.label,
      ...(l.detail ? { detail: l.detail } : {}),
      unit: l.unit,
      qty: l.qty,
      monthly: l.monthly,
      unitPrice: [l.unitPrice!.min, l.unitPrice!.max] as Range,
      total: [l.total!.min, l.total!.max] as Range,
      recommended: l.unitPrice!.recommended,
    }));

/** Totaux d'un devis ferme, après une éventuelle remise (en centimes HT, sur ce qui est payé une fois) */
export function finalTotals(lines: FinalLine[], vatRate: number, discount = 0) {
  const part = (monthly: boolean) => lines.filter((l) => l.monthly === monthly).reduce((s, l) => s + l.total, 0);
  return { oneOff: computeTotals(part(false) - discount, vatRate), monthly: computeTotals(part(true), vatRate) };
}

/** [120000, 250000] → « 1 200 € – 2 500 € » ; un seul montant si les deux sont égaux */
export const formatRange = ([min, max]: Range) => (min === max ? formatEuros(min) : `${formatEuros(min)} – ${formatEuros(max)}`);
