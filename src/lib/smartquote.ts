// NovaForge SmartQuote : moteur de calcul et d'optimisation des devis.
//
// Module pur et déterministe (mêmes entrées = mêmes résultats), sans dépendance au site ni au navigateur :
// il ne reçoit que des données (catalogue, choix du client) et ne fait que des imports de types, ce qui permet de
// le tester directement avec `node --test` (tests/smartquote.test.ts).
//
// Principe commercial : le prix dépend du travail demandé ; le budget détermine le périmètre réalisable, jamais la
// valeur du travail. Les tarifs du catalogue ne sont jamais modifiés en fonction du budget : quand il ne suffit pas,
// des prestations sont reportées (dans l'ordre de leurs priorités), jamais remisées.
//
// Montants en centimes d'euro entiers (pas d'erreur d'arrondi des nombres à virgule). Prix recommandé arrondi à
// l'euro, toujours compris entre le minimum et le maximum du catalogue.
import type { CatalogGroup, CatalogItem, Discount, Price, Unit } from '../data/quote-catalog';

/* ---------- Priorités ---------- */

/** obligatoire : jamais retirée ; importante : conservée autant que possible ; facultative puis secondaire : reportables */
export type Priority = 'obligatoire' | 'importante' | 'facultative' | 'secondaire';
export const PRIORITIES: Priority[] = ['obligatoire', 'importante', 'facultative', 'secondaire'];
export const PRIORITY_LABELS: Record<Priority, string> = {
  obligatoire: 'Indispensable',
  importante: 'Important',
  facultative: 'Souhaité',
  secondaire: 'Bonus',
};
export const isPriority = (value: unknown): value is Priority => typeof value === 'string' && value in PRIORITY_LABELS;
// Rang : plus il est bas, plus la prestation est reportée tôt
const RANK: Record<Priority, number> = { secondaire: 0, facultative: 1, importante: 2, obligatoire: 3 };

/* ---------- Complexité ---------- */

export type Criterion = 'design' | 'fonctionnel' | 'integrations' | 'contenus' | 'technique' | 'delais';
export const CRITERIA: Criterion[] = ['design', 'fonctionnel', 'integrations', 'contenus', 'technique', 'delais'];
export const CRITERION_LABELS: Record<Criterion, string> = {
  design: 'Design',
  fonctionnel: 'Fonctionnalités',
  integrations: 'Intégrations',
  contenus: 'Contenus et données',
  technique: 'Contraintes techniques',
  delais: 'Délais',
};
/** Pondérations par défaut (total 100) ; une famille peut avoir son propre profil (champ `profile` du catalogue) */
export const DEFAULT_WEIGHTS: Record<Criterion, number> = {
  design: 20,
  fonctionnel: 25,
  integrations: 20,
  contenus: 15,
  technique: 10,
  delais: 10,
};
/** Niveau d'un critère : 0 inexistant ou très simple, 1 faible, 2 modéré, 3 important, 4 très complexe */
export type Level = 0 | 1 | 2 | 3 | 4;
export const isLevel = (value: unknown): value is Level => [0, 1, 2, 3, 4].includes(value as number);
/** Critère sans réponse (« je ne sais pas ») : complexité modérée, milieu de fourchette */
export const UNKNOWN_LEVEL: Level = 2;

/* ---------- Montants ---------- */

/** Fourchette en centimes : [minimum, maximum] (égaux pour un prix fixe) */
export type Range = [min: number, max: number];
export type Totals = { ht: number; vat: number; ttc: number };
/** Montants minimum, recommandé et maximum */
export type Amounts = { min: Totals; recommended: Totals; max: Totals };
/** Ce qui est payé une fois, et l'abonnement mensuel : jamais additionnés */
export type Bucket = { oneOff: Amounts; monthly: Amounts };

/** Prix du catalogue en centimes, ou null s'il n'est pas défini (jamais gratuit : à estimer à la main) */
export function priceRange(price: Price): Range | null {
  if (price === null) return null;
  const [min, max] = typeof price === 'number' ? [price, price] : price;
  return [Math.round(Math.min(min, max) * 100), Math.round(Math.max(min, max) * 100)];
}

export function computeTotals(ht: number, vatRate: number): Totals {
  const base = Math.max(0, ht);
  const vat = Math.round((base * vatRate) / 100);
  return { ht: base, vat, ttc: base + vat };
}

const euros = new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' });
const wholeEuros = new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 });

/** 123450 → « 1 234,50 € », 120000 → « 1 200 € » (centimes affichés seulement s'il y en a) */
export const formatEuros = (cents: number) => (cents % 100 ? euros : wholeEuros).format(cents / 100);

/* ---------- Entrées et résultats ---------- */

export type SmartInput = {
  family: string;
  /** Formule (id) */
  base: string;
  /** Options cochées (id) */
  options: string[];
  /** Quantités par prestation (id) */
  quantities: Record<string, number>;
  /** Réponses du client par critère ; absent = « je ne sais pas » */
  complexity: Partial<Record<Criterion, Level>>;
  /** Priorités choisies par le client ; elles l'emportent sur celles du catalogue */
  priorities: Record<string, Priority>;
  /** Budget maximal TTC en centimes (ponctuel, ou mensuel pour une famille au mois) ; null = non renseigné */
  budget: number | null;
};

export type SmartContext = {
  catalog: CatalogGroup[];
  /** Groupe dont les options s'ajoutent à toutes les familles (accompagnement) */
  addonGroup: string;
  vatRate: number;
  /** Réductions explicites du catalogue (affichées, jamais cachées) */
  discounts?: Discount[];
  /** Date du jour AAAA-MM-JJ (validité des réductions) */
  today: string;
};

/** facture : comptée ; inclus : comprise dans la formule, jamais facturée en plus ; a-estimer : sans prix au catalogue */
export type LineStatus = 'facture' | 'inclus' | 'a-estimer';

export type PriceTriple = { min: number; recommended: number; max: number };

export type SmartLine = {
  id: string;
  /** Titre du groupe du catalogue */
  group: string;
  label: string;
  detail?: string;
  unit: Unit;
  qty: number;
  monthly: boolean;
  priority: Priority;
  status: LineStatus;
  /** Prix unitaire HT en centimes ; null si inclus ou à estimer */
  unitPrice: PriceTriple | null;
  total: PriceTriple | null;
  requires: string[];
  /** Phase si la prestation est reportée */
  phase: 2 | 3;
  external?: string;
  /** Explication : ajout automatique (dépendance), inclusion dans la formule */
  note?: string;
};

export type Complexity = {
  /** Score de 0 à 100 */
  score: number;
  weights: Record<Criterion, number>;
  levels: Partial<Record<Criterion, Level>>;
  /** Points apportés par chaque critère au score */
  contributions: Partial<Record<Criterion, number>>;
  /** Critères laissés sans réponse (comptés au niveau modéré) */
  unknown: Criterion[];
};

export type BudgetStatus = 'confortable' | 'adapte' | 'legerement-insuffisant' | 'optimisation' | 'non-realisable';
export const BUDGET_STATUS_LABELS: Record<BudgetStatus, string> = {
  confortable: 'Budget confortable',
  adapte: 'Budget adapté',
  'legerement-insuffisant': 'Budget légèrement insuffisant',
  optimisation: 'Optimisation nécessaire',
  'non-realisable': 'Projet non réalisable dans le budget annoncé',
};

export type Deferred = { id: string; reason: string; phase: 2 | 3 };

export type Proposal = {
  /** Prestations conservées (id) */
  kept: string[];
  deferred: Deferred[];
  totals: Bucket;
  /** true : la proposition respecte le budget */
  fits: boolean;
};

export type Alternative = { baseId: string; base: string; totals: Bucket };

export type Phase = {
  number: 1 | 2 | 3;
  title: string;
  objective: string;
  items: string[];
  totals: Bucket;
  status: 'inclus' | 'reporte' | 'a-etudier';
  /** Prestations d'une phase précédente dont celle-ci dépend (libellés) */
  dependencies: string[];
};

export type BudgetAnalysis = {
  /** Budget TTC en centimes */
  amount: number;
  status: BudgetStatus;
  /** Prix recommandé TTC du projet demandé */
  initial: number;
  /** Prix recommandé TTC de la proposition (projet demandé s'il tient dans le budget, sinon proposition optimisée) */
  proposal: number;
  /** Budget restant après la proposition (0 si dépassement) */
  remaining: number;
  /** Dépassement de la proposition (0 si elle tient) */
  overflow: number;
  /** Part du budget utilisée par la proposition, en % entier */
  percentUsed: number;
};

export type SmartResult = {
  family: { id: string; title: string };
  base: { id: string; label: string };
  lines: SmartLine[];
  complexity: Complexity;
  /** Le budget porte sur ce qui est payé une fois, ou sur l'abonnement mensuel (famille au mois) */
  basis: 'oneOff' | 'monthly';
  /** Projet tel que demandé */
  initial: Bucket;
  /** Réductions explicites du catalogue appliquées au projet demandé (montant recommandé HT déduit) */
  discounts: { labels: string[]; amount: number } | null;
  budget: BudgetAnalysis | null;
  /** Proposition optimisée, seulement si le budget ne couvre pas le projet demandé */
  optimized: Proposal | null;
  /** Formule plus légère de la même famille qui tient dans le budget, quand même le socle le dépasse */
  alternative: Alternative | null;
  /** Montant manquant pour réaliser le socle essentiel (centimes TTC), quand il dépasse le budget */
  missing: number | null;
  /** Options non choisies qui tiendraient dans le budget restant (budget suffisant) */
  suggestions: string[];
  phases: Phase[];
  /** Frais externes non compris dans les prix (abonnements, impression…) */
  external: string[];
  warnings: string[];
  explanation: string;
};

/* ---------- Calcul ---------- */

const DEFAULT_PRIORITY = (item: CatalogItem): Priority =>
  item.kind === 'base' ? 'obligatoire' : (item.priority ?? (item.kind === 'quantity' ? 'importante' : 'facultative'));

/** Pondérations d'une famille : son profil, sinon les pondérations par défaut */
export function weightsFor(group: CatalogGroup): Record<Criterion, number> {
  return { ...DEFAULT_WEIGHTS, ...(group.profile ?? {}) };
}

/** Score de complexité : Σ (niveau / 4 × pondération), sur 100 */
export function complexityScore(group: CatalogGroup, answers: Partial<Record<Criterion, Level>>): Complexity {
  const weights = weightsFor(group);
  const total = CRITERIA.reduce((s, c) => s + weights[c], 0) || 1;
  const levels: Partial<Record<Criterion, Level>> = {};
  const contributions: Partial<Record<Criterion, number>> = {};
  const unknown: Criterion[] = [];
  let score = 0;
  for (const c of CRITERIA) {
    if (weights[c] <= 0) continue;
    const level = answers[c] ?? UNKNOWN_LEVEL;
    if (answers[c] === undefined) unknown.push(c);
    levels[c] = level;
    // Pondérations ramenées sur 100, au cas où un profil ne totaliserait pas exactement 100
    const points = (level / 4) * ((weights[c] / total) * 100);
    contributions[c] = Math.round(points * 10) / 10;
    score += points;
  }
  return { score: Math.round(score * 10) / 10, weights, levels, contributions, unknown };
}

/** Prix recommandé : min + (max − min) × score / 100, arrondi à l'euro, borné par le minimum et le maximum */
export function recommendedPrice([min, max]: Range, score: number): number {
  if (min === max) return min;
  const exact = min + ((max - min) * Math.min(Math.max(score, 0), 100)) / 100;
  return Math.min(max, Math.max(min, Math.round(exact / 100) * 100));
}

const sum = (values: number[]) => values.reduce((s, v) => s + v, 0);
const ZERO: PriceTriple = { min: 0, recommended: 0, max: 0 };

/** Totaux (min, recommandé, max) des lignes facturées, réductions explicites déduites de ce qui est payé une fois */
function bucketOf(lines: SmartLine[], vatRate: number, discount: (sub: PriceTriple) => PriceTriple): Bucket {
  const part = (monthly: boolean): Amounts => {
    const own = lines.filter((l) => l.status === 'facture' && l.monthly === monthly && l.total);
    const sub: PriceTriple = {
      min: sum(own.map((l) => l.total!.min)),
      recommended: sum(own.map((l) => l.total!.recommended)),
      max: sum(own.map((l) => l.total!.max)),
    };
    const off = monthly ? ZERO : discount(sub);
    return {
      min: computeTotals(sub.min - off.min, vatRate),
      recommended: computeTotals(sub.recommended - off.recommended, vatRate),
      max: computeTotals(sub.max - off.max, vatRate),
    };
  };
  return { oneOff: part(false), monthly: part(true) };
}

/**
 * Lignes du projet demandé : formule, options et quantités de la famille, options d'accompagnement ;
 * inclusions dans la formule, dépendances ajoutées automatiquement, prix recommandés selon la complexité.
 */
function buildLines(
  input: SmartInput,
  family: CatalogGroup,
  base: CatalogItem,
  addon: CatalogGroup | undefined,
  score: number,
  warnings: string[],
): SmartLine[] {
  const pool = [
    ...family.items.map((item) => ({ item, group: family })),
    ...(addon?.items ?? []).filter((i) => i.kind !== 'base').map((item) => ({ item, group: addon! })),
  ];
  const byId = new Map(pool.map((p) => [p.item.id, p]));
  const wanted = new Map<string, number>();
  for (const { item } of pool) {
    let qty = 0;
    if (item.kind === 'base') qty = item.id === base.id ? 1 : 0;
    if (item.kind === 'option') qty = input.options.includes(item.id) ? 1 : 0;
    if (item.kind === 'quantity') {
      const value = Math.floor(input.quantities[item.id] ?? 0);
      qty = Number.isFinite(value) ? Math.min(Math.max(value, 0), item.max ?? 99) : 0;
    }
    if (qty > 0) wanted.set(item.id, qty);
  }

  // Dépendances : une prestation qui en exige une autre l'ajoute (ordre du catalogue, jusqu'à stabilité)
  const addedFor = new Map<string, string>();
  let changed = true;
  while (changed) {
    changed = false;
    for (const { item } of pool) {
      if (!wanted.has(item.id)) continue;
      for (const dep of item.requires ?? []) {
        const target = byId.get(dep)?.item;
        if (!target || wanted.has(dep) || target.includedIn?.includes(base.id)) continue;
        wanted.set(dep, 1);
        addedFor.set(dep, item.label);
        changed = true;
      }
    }
  }

  const lines: SmartLine[] = [];
  for (const { item, group } of pool) {
    const qty = wanted.get(item.id);
    if (!qty) continue;
    const included = item.kind !== 'base' && Boolean(item.includedIn?.includes(base.id));
    const range = priceRange(item.price);
    const status: LineStatus = included ? 'inclus' : range ? 'facture' : 'a-estimer';
    const unitPrice =
      status === 'facture' && range ? { min: range[0], recommended: recommendedPrice(range, score), max: range[1] } : null;
    const chosen = input.priorities[item.id];
    const priority = item.kind !== 'base' && isPriority(chosen) ? chosen : DEFAULT_PRIORITY(item);
    const note = included
      ? `Incluse dans la formule « ${base.label} » : pas facturée en plus.`
      : addedFor.has(item.id)
        ? `Ajoutée automatiquement : nécessaire à « ${addedFor.get(item.id)} ».`
        : undefined;
    if (status === 'a-estimer') warnings.push(`« ${item.label} » n'a pas encore de tarif : elle sera estimée à la main par un conseiller.`);
    if (addedFor.has(item.id)) warnings.push(`« ${item.label} » ${note!.charAt(0).toLowerCase()}${note!.slice(1)}`);
    lines.push({
      id: item.id,
      group: group.title,
      label: item.label,
      detail: item.detail,
      unit: item.unit,
      qty,
      monthly: Boolean(item.monthly),
      priority,
      status,
      unitPrice,
      total: unitPrice ? { min: unitPrice.min * qty, recommended: unitPrice.recommended * qty, max: unitPrice.max * qty } : null,
      requires: (item.requires ?? []).filter((dep) => wanted.has(dep)),
      phase: item.phase ?? 2,
      ...(item.external ? { external: item.external } : {}),
      ...(note ? { note } : {}),
    });
  }

  // Une prestation ajoutée pour une autre prend au moins la priorité de celle qui en dépend
  for (const line of lines) {
    for (const d of lines.filter((l) => l.requires.includes(line.id))) {
      if (RANK[d.priority] > RANK[line.priority]) line.priority = d.priority;
    }
  }
  return lines;
}

/** Réductions explicites du catalogue dont toutes les conditions sont remplies */
function discountsFor(ctx: SmartContext, input: SmartInput, lines: SmartLine[]) {
  const active = (ctx.discounts ?? []).filter(
    (d) =>
      (!d.families || d.families.includes(input.family)) &&
      (!d.requires || d.requires.every((id) => lines.some((l) => l.id === id && l.status !== 'a-estimer'))) &&
      (!d.until || ctx.today <= d.until),
  );
  const apply = (sub: PriceTriple): PriceTriple => {
    const eligible = active.filter((d) => !d.minTotal || sub.min >= d.minTotal * 100);
    const off = (value: number) =>
      Math.min(value, sum(eligible.map((d) => (d.percent ? Math.round((value * d.percent) / 100) : Math.round((d.amount ?? 0) * 100)))));
    return { min: off(sub.min), recommended: off(sub.recommended), max: off(sub.max) };
  };
  const labels = (sub: PriceTriple) => active.filter((d) => !d.minTotal || sub.min >= d.minTotal * 100).map((d) => d.label);
  return { apply, labels };
}

const basisTotal = (bucket: Bucket, basis: 'oneOff' | 'monthly') => bucket[basis].recommended.ttc;

/** Toutes les lignes qui dépendent (directement ou non) de celle-ci, parmi celles retenues */
function dependentsOf(id: string, lines: SmartLine[], kept: Set<string>): string[] {
  const out = new Set<string>();
  const stack = [id];
  while (stack.length) {
    const current = stack.pop()!;
    for (const l of lines) {
      if (kept.has(l.id) && l.requires.includes(current) && !out.has(l.id)) {
        out.add(l.id);
        stack.push(l.id);
      }
    }
  }
  return [...out];
}

/** Prestations nécessaires (directement ou non) à celle-ci et absentes de la sélection retenue */
function missingRequirements(id: string, lines: SmartLine[], kept: Set<string>): string[] {
  const out = new Set<string>();
  const stack = [id];
  while (stack.length) {
    const currentId = stack.pop();
    const current = lines.find((l) => l.id === currentId);
    for (const dep of current?.requires ?? []) {
      if (!kept.has(dep) && !out.has(dep)) {
        out.add(dep);
        stack.push(dep);
      }
    }
  }
  return [...out];
}

const REASONS: Record<Priority, string> = {
  secondaire: 'Amélioration de confort, reportée pour respecter votre budget.',
  facultative: 'Fonction souhaitée, reportée à une phase ultérieure.',
  importante: 'Fonction importante mais pas indispensable au lancement.',
  obligatoire: '',
};

/**
 * Optimisation budgétaire : retire les prestations reportables (secondaires, puis facultatives, puis importantes ;
 * à priorité égale la plus chère d'abord, puis l'ordre du catalogue), avec celles qui en dépendent, jusqu'à tenir
 * dans le budget ; puis réintègre, des plus prioritaires aux moins chères, celles qui y tiennent encore.
 * Les prestations obligatoires ne sont jamais retirées.
 */
function optimize(
  lines: SmartLine[],
  basis: 'oneOff' | 'monthly',
  budget: number,
  totalsOf: (kept: Set<string>) => Bucket,
  order: Map<string, number>,
): Proposal {
  const kept = new Set(lines.map((l) => l.id));
  const deferred = new Map<string, Deferred>();
  const recTotal = (l: SmartLine) => l.total?.recommended ?? 0;
  const byId = new Map(lines.map((l) => [l.id, l]));
  const candidates = lines
    .filter((l) => l.status === 'facture' && l.monthly === (basis === 'monthly') && l.priority !== 'obligatoire')
    .sort((a, b) => RANK[a.priority] - RANK[b.priority] || recTotal(b) - recTotal(a) || order.get(a.id)! - order.get(b.id)!);

  for (const c of candidates) {
    if (basisTotal(totalsOf(kept), basis) <= budget) break;
    if (!kept.has(c.id)) continue;
    const group = [c.id, ...dependentsOf(c.id, lines, kept)];
    if (group.some((id) => byId.get(id)!.priority === 'obligatoire')) continue;
    for (const id of group) {
      kept.delete(id);
      const line = byId.get(id)!;
      deferred.set(id, {
        id,
        phase: Math.max(line.phase, c.phase) as 2 | 3,
        reason: id === c.id ? REASONS[line.priority] : `Reportée avec « ${c.label} », dont elle dépend.`,
      });
    }
  }

  // Réintégration de ce qui tient encore dans le budget
  const removed = [...deferred.keys()]
    .map((id) => byId.get(id)!)
    .sort((a, b) => RANK[b.priority] - RANK[a.priority] || recTotal(a) - recTotal(b) || order.get(a.id)! - order.get(b.id)!);
  for (const r of removed) {
    if (kept.has(r.id)) continue;
    const group = [r.id, ...missingRequirements(r.id, lines, kept)];
    if (basisTotal(totalsOf(new Set([...kept, ...group])), basis) <= budget) {
      for (const id of group) {
        kept.add(id);
        deferred.delete(id);
      }
    }
  }

  const totals = totalsOf(kept);
  return {
    kept: lines.filter((l) => kept.has(l.id)).map((l) => l.id),
    deferred: lines.filter((l) => deferred.has(l.id)).map((l) => deferred.get(l.id)!),
    totals,
    fits: basisTotal(totals, basis) <= budget,
  };
}

/**
 * Indicateur de compatibilité budgétaire (règles explicites) :
 * projet ≤ budget → confortable si le budget dépasse le projet d'au moins 15 %, sinon adapté ;
 * projet > budget → non réalisable si même le socle dépasse, légèrement insuffisant si le projet dépasse le budget
 * de 10 % au plus, sinon optimisation nécessaire.
 */
export function budgetStatus(initial: number, budget: number, optimizedFits: boolean): BudgetStatus {
  if (initial <= budget) return budget * 100 >= initial * 115 ? 'confortable' : 'adapte';
  if (!optimizedFits) return 'non-realisable';
  return initial * 100 <= budget * 110 ? 'legerement-insuffisant' : 'optimisation';
}

const list = (labels: string[]) =>
  labels.length <= 1 ? (labels[0] ?? '') : `${labels.slice(0, -1).join(', ')} et ${labels[labels.length - 1]}`;

/**
 * Calcul complet d'un devis. null si la famille ou la formule n'existent pas.
 * Aucun tarif n'est modifié selon le budget : il ne détermine que le périmètre proposé.
 */
export function smartQuote(input: SmartInput, ctx: SmartContext): SmartResult | null {
  const family = ctx.catalog.find((g) => g.id === input.family && g.id !== ctx.addonGroup);
  const base = family?.items.find((i) => i.kind === 'base' && i.id === input.base);
  if (!family || !base) return null;
  const addon = ctx.catalog.find((g) => g.id === ctx.addonGroup);

  const warnings: string[] = [];
  const complexity = complexityScore(family, input.complexity);
  const lines = buildLines(input, family, base, addon, complexity.score, warnings);
  const order = new Map([...family.items, ...(addon?.items ?? [])].map((item, i) => [item.id, i]));
  const discount = discountsFor(ctx, input, lines);
  const totalsOf = (kept: Set<string>) => bucketOf(lines.filter((l) => kept.has(l.id)), ctx.vatRate, discount.apply);
  const all = new Set(lines.map((l) => l.id));
  const initial = totalsOf(all);
  const basis = family.items.filter((i) => i.kind === 'base').every((i) => i.monthly) ? 'monthly' : 'oneOff';

  const billedOneOff = lines.filter((l) => l.status === 'facture' && !l.monthly && l.total);
  const subOneOff: PriceTriple = {
    min: sum(billedOneOff.map((l) => l.total!.min)),
    recommended: sum(billedOneOff.map((l) => l.total!.recommended)),
    max: sum(billedOneOff.map((l) => l.total!.max)),
  };
  const discountAmount = discount.apply(subOneOff).recommended;
  const discounts = discountAmount > 0 ? { labels: discount.labels(subOneOff), amount: discountAmount } : null;

  const initialTotal = basisTotal(initial, basis);
  const budget = input.budget !== null && input.budget > 0 ? Math.round(input.budget) : null;
  let optimized: Proposal | null = null;
  let alternative: Alternative | null = null;
  let missing: number | null = null;
  const suggestions: string[] = [];

  if (budget !== null && initialTotal > budget) {
    optimized = optimize(lines, basis, budget, totalsOf, order);
    if (!optimized.fits) {
      missing = basisTotal(optimized.totals, basis) - budget;
      // Alternative justifiée par le catalogue : une formule plus légère de la même famille, avec les seules
      // prestations indispensables, qui tient dans le budget (la plus proche de la demande)
      const low = (item: CatalogItem) => priceRange(item.price)?.[0] ?? Infinity;
      const cheaper = family.items
        .filter((i) => i.kind === 'base' && i.id !== base.id && low(i) < low(base))
        .sort((a, b) => low(b) - low(a) || order.get(a.id)! - order.get(b.id)!);
      const essentials = lines.filter((l) => l.priority === 'obligatoire' && l.id !== base.id);
      for (const alt of cheaper) {
        const altResult = smartQuote(
          {
            ...input,
            base: alt.id,
            options: essentials.map((l) => l.id),
            quantities: Object.fromEntries(essentials.map((l) => [l.id, l.qty])),
            budget: null,
          },
          ctx,
        );
        if (altResult && basisTotal(altResult.initial, basis) <= budget) {
          alternative = { baseId: alt.id, base: alt.label, totals: altResult.initial };
          break;
        }
      }
    }
  } else if (budget !== null) {
    // Budget suffisant : améliorations facultatives qui tiendraient dans le reste (ordre du catalogue, 3 au plus)
    let remaining = budget - initialTotal;
    for (const item of family.items) {
      if (suggestions.length >= 3) break;
      if (item.kind !== 'option' || all.has(item.id) || item.includedIn?.includes(base.id)) continue;
      if (Boolean(item.monthly) !== (basis === 'monthly')) continue;
      const range = priceRange(item.price);
      if (!range) continue;
      const cost = computeTotals(recommendedPrice(range, complexity.score), ctx.vatRate).ttc;
      if (cost <= remaining) {
        suggestions.push(item.id);
        remaining -= cost;
      }
    }
  }

  const proposal = basisTotal(optimized ? optimized.totals : initial, basis);
  const budgetAnalysis: BudgetAnalysis | null =
    budget === null
      ? null
      : {
          amount: budget,
          status: budgetStatus(initialTotal, budget, !optimized || optimized.fits),
          initial: initialTotal,
          proposal,
          remaining: Math.max(0, budget - proposal),
          overflow: Math.max(0, proposal - budget),
          percentUsed: Math.round((proposal * 100) / budget),
        };

  // Phases : 1 = socle (proposition), 2 = améliorations reportées, 3 = évolutions avancées reportées
  const byId = new Map(lines.map((l) => [l.id, l]));
  const keptIds = new Set(optimized ? optimized.kept : lines.map((l) => l.id));
  const phases: Phase[] = [
    {
      number: 1,
      title: optimized ? 'Phase 1 · Socle essentiel' : 'Votre projet',
      objective: optimized
        ? 'Lancer le projet avec la formule et les fonctions indispensables.'
        : 'Réaliser le projet tel que vous l’avez décrit.',
      items: [...keptIds],
      totals: totalsOf(keptIds),
      status: lines.some((l) => keptIds.has(l.id) && l.status === 'a-estimer') ? 'a-etudier' : 'inclus',
      dependencies: [],
    },
  ];
  for (const n of [2, 3] as const) {
    const items = (optimized?.deferred ?? []).filter((d) => d.phase === n).map((d) => d.id);
    if (!items.length) continue;
    const ids = new Set(items);
    phases.push({
      number: n,
      title: n === 2 ? 'Phase 2 · Améliorations' : 'Phase 3 · Évolutions avancées',
      objective:
        n === 2
          ? 'Ajouter les fonctions de confort et les compléments reportés.'
          : 'Développer les fonctions avancées, automatisations et intégrations.',
      items,
      totals: totalsOf(ids),
      status: items.some((id) => byId.get(id)!.status === 'a-estimer') ? 'a-etudier' : 'reporte',
      dependencies: [
        ...new Set(items.flatMap((id) => byId.get(id)!.requires).filter((dep) => !ids.has(dep)).map((dep) => byId.get(dep)!.label)),
      ],
    });
  }

  const external = [...new Set([family.external, ...lines.map((l) => l.external)].filter((e): e is string => Boolean(e)))];
  const deferredLabels = (optimized?.deferred ?? []).map((d) => `« ${byId.get(d.id)!.label} »`);
  const explanation =
    budgetAnalysis === null
      ? 'Estimation calculée à partir de vos choix et de la complexité de votre projet. Indiquez un budget pour obtenir une proposition adaptée.'
      : budgetAnalysis.status === 'confortable' || budgetAnalysis.status === 'adapte'
        ? 'Votre budget couvre l’ensemble du projet demandé : rien n’est retiré.'
        : optimized?.fits
          ? `Pour respecter votre budget, nous vous proposons de conserver les fonctionnalités essentielles et de reporter ${list(deferredLabels)} à une phase ultérieure.`
          : `Même réduit à l’essentiel, le projet dépasse votre budget de ${formatEuros(missing ?? 0)}.${
              alternative ? ` La formule « ${alternative.base} » permettrait de démarrer dans votre budget.` : ''
            }`;

  return {
    family: { id: family.id, title: family.title },
    base: { id: base.id, label: base.label },
    lines,
    complexity,
    basis,
    initial,
    discounts,
    budget: budgetAnalysis,
    optimized,
    alternative,
    missing,
    suggestions,
    phases,
    external,
    warnings,
    explanation,
  };
}
