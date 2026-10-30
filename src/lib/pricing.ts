// Calcul des estimations et des devis, partagé par le serveur (devis enregistré, prix figés) et le simulateur
// (total affiché en direct). Prix lus dans src/data/quote-catalog.ts.
// Montants en centimes d'euro HT, pour des totaux exacts ; la TVA est calculée une fois, sur le total.
import { VAT_REGIME, catalog, type CatalogGroup, type Price, type Unit } from '../data/quote-catalog';

/** Régime de TVA : franchise en base (aucune TVA facturée, art. 293 B du CGI) ou taux normal */
export type VatRegime = 'franchise' | 'normal';
export const VAT_RATES: Record<VatRegime, number> = { franchise: 0, normal: 20 };
export const VAT_RATE = VAT_RATES[VAT_REGIME];

/** Fourchette en centimes : [minimum, maximum] (égaux pour un prix fixe) */
export type Range = [min: number, max: number];

/** Prix du catalogue en centimes, ou null si l'élément n'a pas encore de prix */
export function priceRange(price: Price): Range | null {
  if (price === null) return null;
  const [min, max] = typeof price === 'number' ? [price, price] : price;
  return [Math.round(Math.min(min, max) * 100), Math.round(Math.max(min, max) * 100)];
}

/** Choix du client : formule retenue par service, options cochées, quantités */
export type Selection = { bases: Record<string, string>; options: string[]; quantities: Record<string, number> };

type LineBase = {
  id: string;
  /** Titre du service (groupe du catalogue) */
  group: string;
  label: string;
  detail?: string;
  unit: Unit;
  qty: number;
  monthly: boolean;
};
/** Ligne d'une estimation : prix unitaire et total en fourchette */
export type EstimateLine = LineBase & { unitPrice: Range; total: Range };
/** Ligne d'un devis ferme : prix fixés par le studio */
export type FinalLine = LineBase & { unitPrice: number; total: number };

export type Totals = { ht: number; vat: number; ttc: number };

/**
 * Catalogue visible par les visiteurs : seulement les éléments qui ont un prix, sans groupe vide.
 * Un service qui propose des formules reste masqué tant qu'aucune n'a de prix (ses options n'ont pas de sens seules).
 */
export function availableCatalog(): CatalogGroup[] {
  const priced = (group: CatalogGroup) => group.items.filter((item) => item.price !== null);
  return catalog
    .filter((group) => !group.items.some((item) => item.kind === 'base') || priced(group).some((item) => item.kind === 'base'))
    .map((group) => ({ ...group, items: priced(group) }))
    .filter((group) => group.items.length > 0);
}

/** Lecture du formulaire du simulateur (champs base:<groupe>, option, qty:<élément>) */
export function readSelection(data: FormData): Selection {
  const bases: Record<string, string> = {};
  const quantities: Record<string, number> = {};
  for (const [name, value] of data) {
    if (name.startsWith('base:') && value) bases[name.slice(5)] = String(value);
    if (name.startsWith('qty:')) quantities[name.slice(4)] = Number(value);
  }
  return { bases, options: data.getAll('option').map(String), quantities };
}

/**
 * Lignes de l'estimation à partir des choix du client et de la grille du moment.
 * Les options et quantités d'un service ne comptent qu'avec une formule de ce service (s'il en propose une).
 */
export function estimateLines(selection: Selection): EstimateLine[] {
  return availableCatalog().flatMap((group) => {
    const bases = group.items.filter((item) => item.kind === 'base');
    const base = bases.find((item) => item.id === selection.bases[group.id]);
    if (bases.length > 0 && !base) return [];
    return group.items.flatMap((item): EstimateLine[] => {
      let qty = 0;
      if (item.kind === 'base') qty = item === base ? 1 : 0;
      if (item.kind === 'option') qty = selection.options.includes(item.id) ? 1 : 0;
      if (item.kind === 'quantity') {
        const wanted = Math.floor(selection.quantities[item.id] ?? 0);
        qty = Number.isFinite(wanted) ? Math.min(Math.max(wanted, 0), item.max ?? 99) : 0;
      }
      const unitPrice = priceRange(item.price);
      if (qty === 0 || !unitPrice) return [];
      return [
        {
          id: item.id,
          group: group.title,
          label: item.label,
          detail: item.detail,
          unit: item.unit,
          qty,
          monthly: Boolean(item.monthly),
          unitPrice,
          total: [unitPrice[0] * qty, unitPrice[1] * qty],
        },
      ];
    });
  });
}

export function computeTotals(ht: number, vatRate: number): Totals {
  const vat = Math.round((ht * vatRate) / 100);
  return { ht, vat, ttc: ht + vat };
}

const sum = (values: number[]) => values.reduce((s, v) => s + v, 0);

/** Totaux d'une estimation, en fourchette : ce qui est payé une fois, et l'abonnement mensuel */
export function estimateTotals(lines: EstimateLine[], vatRate: number) {
  const part = (monthly: boolean) => {
    const own = lines.filter((l) => l.monthly === monthly);
    return {
      min: computeTotals(sum(own.map((l) => l.total[0])), vatRate),
      max: computeTotals(sum(own.map((l) => l.total[1])), vatRate),
    };
  };
  return { oneOff: part(false), monthly: part(true) };
}

/** Totaux d'un devis ferme */
export function finalTotals(lines: FinalLine[], vatRate: number) {
  const part = (monthly: boolean) => computeTotals(sum(lines.filter((l) => l.monthly === monthly).map((l) => l.total)), vatRate);
  return { oneOff: part(false), monthly: part(true) };
}

const euros = new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' });

/** 123450 → « 1 234,50 € » */
export const formatEuros = (cents: number) => euros.format(cents / 100);

/** [120000, 250000] → « 1 200,00 € – 2 500,00 € » ; un seul montant si les deux sont égaux */
export const formatRange = ([min, max]: Range) => (min === max ? formatEuros(min) : `${formatEuros(min)} – ${formatEuros(max)}`);

/** « 1 234,50 » ou « 1234.5 » (euros saisis dans l'administration) → 123450 ; null si vide ou invalide */
export function parseEuros(value: string): number | null {
  const clean = value.replace(/[\s  €]/g, '').replace(',', '.');
  if (!/^\d{1,7}(\.\d{1,2})?$/.test(clean)) return null;
  return Math.round(Number(clean) * 100);
}
