// Calcul des devis, partagé par le serveur (devis enregistré, prix figés) et le simulateur (total affiché en direct).
// Montants en centimes d'euro HT, pour des totaux exacts ; la TVA est calculée une fois, sur le total.
import { catalog, type CatalogGroup, type Unit } from '../data/quote-catalog';

/** Régime de TVA : franchise en base (aucune TVA facturée, art. 293 B du CGI) ou taux normal */
export type VatRegime = 'franchise' | 'normal';
export const VAT_RATES: Record<VatRegime, number> = { franchise: 0, normal: 20 };
export const isVatRegime = (value: unknown): value is VatRegime => value === 'franchise' || value === 'normal';

/** Tarifs saisis dans l'administration */
export type Pricing = {
  vat: VatRegime;
  /** Prix HT en centimes, par identifiant d'élément du catalogue ; absent = élément masqué aux visiteurs */
  prices: Record<string, number>;
};

export const defaultPricing = (): Pricing => ({ vat: 'franchise', prices: {} });

/** Choix du client : formule retenue par service, options cochées, quantités */
export type Selection = { bases: Record<string, string>; options: string[]; quantities: Record<string, number> };

export type QuoteLine = {
  id: string;
  /** Titre du service (groupe du catalogue) */
  group: string;
  label: string;
  detail?: string;
  unit: Unit;
  qty: number;
  /** Prix unitaire HT en centimes */
  unitPrice: number;
  total: number;
  monthly: boolean;
};

export type Totals = { ht: number; vat: number; ttc: number };

/**
 * Catalogue visible par les visiteurs : seulement les éléments qui ont un prix, sans groupe vide.
 * Un service qui propose des formules reste masqué tant qu'aucune n'a de prix (ses options n'ont pas de sens seules).
 */
export function availableCatalog(pricing: Pricing): CatalogGroup[] {
  const priced = (group: CatalogGroup) => group.items.filter((item) => pricing.prices[item.id] !== undefined);
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
 * Lignes du devis à partir des choix du client et des tarifs du moment.
 * Les options et quantités d'un service ne comptent qu'avec une formule de ce service (s'il en propose une).
 */
export function priceLines(selection: Selection, pricing: Pricing): QuoteLine[] {
  return availableCatalog(pricing).flatMap((group) => {
    const bases = group.items.filter((item) => item.kind === 'base');
    const base = bases.find((item) => item.id === selection.bases[group.id]);
    if (bases.length > 0 && !base) return [];
    return group.items.flatMap((item): QuoteLine[] => {
      let qty = 0;
      if (item.kind === 'base') qty = item === base ? 1 : 0;
      if (item.kind === 'option') qty = selection.options.includes(item.id) ? 1 : 0;
      if (item.kind === 'quantity') {
        const wanted = Math.floor(selection.quantities[item.id] ?? 0);
        qty = Number.isFinite(wanted) ? Math.min(Math.max(wanted, 0), item.max ?? 99) : 0;
      }
      if (qty === 0) return [];
      const unitPrice = pricing.prices[item.id];
      return [
        {
          id: item.id,
          group: group.title,
          label: item.label,
          detail: item.detail,
          unit: item.unit,
          qty,
          unitPrice,
          total: unitPrice * qty,
          monthly: Boolean(item.monthly),
        },
      ];
    });
  });
}

export function computeTotals(ht: number, vatRate: number): Totals {
  const vat = Math.round((ht * vatRate) / 100);
  return { ht, vat, ttc: ht + vat };
}

/** Totaux séparés : ce qui est payé une fois, et l'abonnement mensuel */
export function quoteTotals(lines: QuoteLine[], vatRate: number) {
  const sum = (monthly: boolean) => lines.filter((l) => l.monthly === monthly).reduce((s, l) => s + l.total, 0);
  return { oneOff: computeTotals(sum(false), vatRate), monthly: computeTotals(sum(true), vatRate) };
}

const euros = new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' });

/** 123450 → « 1 234,50 € » */
export const formatEuros = (cents: number) => euros.format(cents / 100);

/** « 1 234,50 » ou « 1234.5 » (euros saisis dans l'administration) → 123450 ; null si vide ou invalide */
export function parseEuros(value: string): number | null {
  const clean = value.replace(/[\s  €]/g, '').replace(',', '.');
  if (!/^\d{1,7}(\.\d{1,2})?$/.test(clean)) return null;
  return Math.round(Number(clean) * 100);
}
