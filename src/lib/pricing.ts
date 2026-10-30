// Calcul des estimations et des devis à partir de src/data/quote-catalog.ts : uniquement côté serveur pour les
// estimations (le simulateur n'affiche aucun prix pendant les choix), et pour les devis fermes de l'administration.
// Montants en centimes d'euro HT, pour des totaux exacts ; la TVA est calculée une fois, sur le total.
import {
  ADDON_GROUP,
  BUDGETS,
  MONTHLY_BUDGETS,
  VAT_REGIME,
  catalog,
  discounts,
  type Budget,
  type CatalogGroup,
  type CatalogItem,
  type Price,
  type Unit,
} from '../data/quote-catalog';

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

/** Choix du visiteur : famille, formule (type), options cochées, quantités */
export type Selection = { family: string; base: string; options: string[]; quantities: Record<string, number> };

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
/** Ligne d'une estimation : prix unitaire et total en fourchette */
export type EstimateLine = LineBase & { unitPrice: Range; total: Range };
/** Ligne d'un devis ferme : prix fixés par le conseiller */
export type FinalLine = LineBase & { unitPrice: number; total: number };

export type Totals = { ht: number; vat: number; ttc: number };
export type RangeTotals = { min: Totals; max: Totals };
export type AppliedDiscount = { label: string; amount: Range };

export type Estimate = {
  lines: EstimateLine[];
  discounts: AppliedDiscount[];
  totals: { oneOff: RangeTotals; monthly: RangeTotals };
};

const priced = (group: CatalogGroup): CatalogGroup => ({
  ...group,
  items: group.items.filter((item) => item.price !== null),
});

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

export const budgetsFor = (group: CatalogGroup): Budget[] => (isMonthlyFamily(group) ? MONTHLY_BUDGETS : BUDGETS);

/** Lecture du formulaire du simulateur (champs family, base:<famille>, option, qty:<élément>) */
export function readSelection(data: FormData): Selection {
  const family = String(data.get('family') ?? '');
  const quantities: Record<string, number> = {};
  for (const [name, value] of data) {
    if (name.startsWith('qty:')) quantities[name.slice(4)] = Number(value);
  }
  return { family, base: String(data.get(`base:${family}`) ?? ''), options: data.getAll('option').map(String), quantities };
}

function lineFor(group: CatalogGroup, item: CatalogItem, selection: Selection): EstimateLine[] {
  let qty = 0;
  if (item.kind === 'base') qty = item.id === selection.base ? 1 : 0;
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
}

/** Lignes de l'estimation : formule et options de la famille choisie, puis options d'accompagnement */
export function estimateLines(selection: Selection): EstimateLine[] {
  const family = families().find((group) => group.id === selection.family);
  if (!family?.items.some((item) => item.kind === 'base' && item.id === selection.base)) return [];
  const addon = addonGroup();
  return [
    ...family.items.flatMap((item) => lineFor(family, item, selection)),
    ...(addon ? addon.items.filter((item) => item.kind !== 'base').flatMap((item) => lineFor(addon, item, selection)) : []),
  ];
}

const sum = (values: number[]) => values.reduce((s, v) => s + v, 0);
const oneOffSubtotal = (lines: EstimateLine[]): Range => {
  const own = lines.filter((l) => !l.monthly);
  return [sum(own.map((l) => l.total[0])), sum(own.map((l) => l.total[1]))];
};

/** Réductions de src/data/quote-catalog.ts dont toutes les conditions sont remplies */
function applicableDiscounts(selection: Selection, lines: EstimateLine[], today: string): AppliedDiscount[] {
  const subtotal = oneOffSubtotal(lines);
  return discounts
    .filter(
      (d) =>
        (!d.families || d.families.includes(selection.family)) &&
        (!d.requires || d.requires.every((id) => lines.some((l) => l.id === id))) &&
        (!d.until || today <= d.until) &&
        (!d.minTotal || subtotal[0] >= d.minTotal * 100),
    )
    .map((d) => ({
      label: d.label,
      amount: subtotal.map((s) =>
        d.percent ? Math.round((s * d.percent) / 100) : Math.min(Math.round((d.amount ?? 0) * 100), s),
      ) as Range,
    }))
    .filter((d) => d.amount[1] > 0);
}

export function computeTotals(ht: number, vatRate: number): Totals {
  const vat = Math.round((Math.max(0, ht) * vatRate) / 100);
  return { ht: Math.max(0, ht), vat, ttc: Math.max(0, ht) + vat };
}

/** Estimation complète, avec les réductions applicables ; today : date du jour à Paris (AAAA-MM-JJ) */
export function buildEstimate(selection: Selection, today: string): Estimate {
  const lines = estimateLines(selection);
  const applied = applicableDiscounts(selection, lines, today);
  const [subMin, subMax] = oneOffSubtotal(lines);
  const monthly = lines.filter((l) => l.monthly);
  return {
    lines,
    discounts: applied,
    totals: {
      oneOff: {
        min: computeTotals(subMin - sum(applied.map((d) => d.amount[0])), VAT_RATE),
        max: computeTotals(subMax - sum(applied.map((d) => d.amount[1])), VAT_RATE),
      },
      monthly: {
        min: computeTotals(sum(monthly.map((l) => l.total[0])), VAT_RATE),
        max: computeTotals(sum(monthly.map((l) => l.total[1])), VAT_RATE),
      },
    },
  };
}

/** Total TTC qui compte pour le budget : mensuel pour une famille au mois, sinon ce qui est payé une fois */
export const budgetBasis = (estimate: Estimate, monthly: boolean): Range => {
  const part = monthly ? estimate.totals.monthly : estimate.totals.oneOff;
  return [part.min.ttc, part.max.ttc];
};

/** couvert : budget ≥ haut de la fourchette ; dans : budget dans la fourchette ; sous : budget insuffisant */
export type BudgetFit = 'couvert' | 'dans' | 'sous';

export function budgetFit(budget: Budget, total: Range): BudgetFit {
  const limit = budget.range[1] === null ? Infinity : budget.range[1] * 100;
  if (limit >= total[1]) return 'couvert';
  return limit >= total[0] ? 'dans' : 'sous';
}

export type Suggestion = Estimate & { base: string; removed: string[] };

/**
 * Version ajustée à un budget insuffisant : on garde la formule choisie et on retire d'abord les options les plus
 * chères, puis on essaie les formules moins chères de la même famille. null si rien ne rentre dans le budget.
 */
export function fitToBudget(selection: Selection, budget: Budget, today: string): Suggestion | null {
  const family = families().find((group) => group.id === selection.family);
  if (!family || budget.range[1] === null) return null;
  const limit = budget.range[1] * 100;
  const monthly = isMonthlyFamily(family);
  const low = (item: CatalogItem) => priceRange(item.price)![0];
  const bases = family.items.filter((item) => item.kind === 'base');
  const chosen = bases.find((item) => item.id === selection.base);
  if (!chosen) return null;
  const cheaper = bases.filter((item) => low(item) < low(chosen)).sort((a, b) => low(b) - low(a));

  for (const base of [chosen, ...cheaper]) {
    let current: Selection = { ...selection, base: base.id };
    let estimate = buildEstimate(current, today);
    // Seules les lignes qui comptent pour ce budget (mensuelles ou payées une fois) sont candidates au retrait
    const extras = estimate.lines
      .filter((line) => line.id !== base.id && line.monthly === monthly)
      .sort((a, b) => b.total[1] - a.total[1]);
    const removed: string[] = [];
    for (const extra of extras) {
      if (budgetBasis(estimate, monthly)[0] <= limit) break;
      current = {
        ...current,
        options: current.options.filter((id) => id !== extra.id),
        quantities: { ...current.quantities, [extra.id]: 0 },
      };
      removed.push(extra.label);
      estimate = buildEstimate(current, today);
    }
    if (budgetBasis(estimate, monthly)[0] <= limit) return { ...estimate, base: base.label, removed };
  }
  return null;
}

/** Totaux d'un devis ferme, après une éventuelle remise (en centimes HT, sur ce qui est payé une fois) */
export function finalTotals(lines: FinalLine[], vatRate: number, discount = 0) {
  const part = (monthly: boolean) => sum(lines.filter((l) => l.monthly === monthly).map((l) => l.total));
  return { oneOff: computeTotals(part(false) - discount, vatRate), monthly: computeTotals(part(true), vatRate) };
}

const euros = new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' });
const wholeEuros = new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 });

/** 123450 → « 1 234,50 € », 120000 → « 1 200 € » (centimes affichés seulement s'il y en a) */
export const formatEuros = (cents: number) => (cents % 100 ? euros : wholeEuros).format(cents / 100);

/** [120000, 250000] → « 1 200 € – 2 500 € » ; un seul montant si les deux sont égaux */
export const formatRange = ([min, max]: Range) => (min === max ? formatEuros(min) : `${formatEuros(min)} – ${formatEuros(max)}`);

/** « 1 234,50 » ou « 1234.5 » (euros saisis dans l'administration) → 123450 ; null si vide ou invalide */
export function parseEuros(value: string): number | null {
  const clean = value.replace(/[\s  €]/g, '').replace(',', '.');
  if (!/^\d{1,7}(\.\d{1,2})?$/.test(clean)) return null;
  return Math.round(Number(clean) * 100);
}
