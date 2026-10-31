// Tests du moteur NovaForge SmartQuote (src/lib/smartquote.ts) : `npm test` (node --test, sans dépendance).
// Catalogue de test à prix fixes pour des montants prévisibles, puis contrôles de cohérence du vrai catalogue.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { recommendedPrice, smartQuote, type SmartInput, type SmartContext } from '../src/lib/smartquote.ts';
import { ADDON_GROUP, catalog } from '../src/data/quote-catalog.ts';
import type { CatalogGroup } from '../src/data/quote-catalog.ts';

const site: CatalogGroup = {
  id: 'site',
  title: 'Site',
  intro: '',
  items: [
    { id: 'base-a', price: 2000, kind: 'base', unit: 'forfait', label: 'Formule A' },
    { id: 'base-b', price: 1000, kind: 'base', unit: 'forfait', label: 'Formule B' },
    { id: 'opt-importante', price: 1000, priority: 'importante', kind: 'option', unit: 'forfait', label: 'Importante' },
    { id: 'opt-facultative', price: 700, priority: 'facultative', kind: 'option', unit: 'forfait', label: 'Facultative' },
    { id: 'opt-secondaire', price: 300, priority: 'secondaire', kind: 'option', unit: 'forfait', label: 'Secondaire' },
    { id: 'opt-inclus', price: 400, includedIn: ['base-a'], kind: 'option', unit: 'forfait', label: 'Incluse dans A' },
    { id: 'opt-depend', price: 200, requires: ['opt-facultative'], priority: 'secondaire', kind: 'option', unit: 'forfait', label: 'Dépendante' },
    { id: 'opt-fourchette', price: [500, 900], kind: 'option', unit: 'forfait', label: 'Fourchette' },
    { id: 'opt-sans-prix', price: null, kind: 'option', unit: 'forfait', label: 'Sans prix' },
    { id: 'pages', price: 100, kind: 'quantity', unit: 'page', max: 10, label: 'Pages' },
    { id: 'maint', price: 50, kind: 'option', unit: 'mois', monthly: true, label: 'Maintenance' },
  ],
};
const ctx: SmartContext = { catalog: [site], addonGroup: 'aucun', vatRate: 0, today: '2026-10-30' };
const input = (over: Partial<SmartInput> = {}): SmartInput => ({
  family: 'site',
  base: 'base-a',
  options: [],
  quantities: {},
  complexity: {},
  priorities: {},
  budget: null,
  ...over,
});
const run = (over: Partial<SmartInput> = {}) => {
  const result = smartQuote(input(over), ctx);
  assert.ok(result);
  return result;
};
const euros = (n: number) => n * 100;
const oneOff = (r: ReturnType<typeof run>) => r.initial.oneOff.recommended.ttc;

test('1. Budget suffisant : tout est conservé, prix inchangé, aucune remise', () => {
  const r = run({ options: ['opt-facultative', 'opt-secondaire'], budget: euros(4000) });
  assert.equal(oneOff(r), euros(3000));
  assert.equal(r.optimized, null);
  assert.equal(r.discounts, null);
  assert.equal(r.budget?.status, 'confortable');
  assert.equal(r.budget?.proposal, euros(3000));
  assert.equal(r.budget?.remaining, euros(1000));
});

test('2. Budget insuffisant : report des prestations les moins prioritaires, proposition dans le budget', () => {
  const r = run({ options: ['opt-importante', 'opt-facultative', 'opt-secondaire'], budget: euros(3000) });
  assert.equal(oneOff(r), euros(4000));
  assert.ok(r.optimized?.fits);
  assert.ok(r.optimized!.totals.oneOff.recommended.ttc <= euros(3000));
  assert.deepEqual(r.optimized!.deferred.map((d) => d.id).sort(), ['opt-facultative', 'opt-secondaire']);
  assert.ok(r.optimized!.kept.includes('base-a') && r.optimized!.kept.includes('opt-importante'));
  assert.equal(r.budget?.status, 'optimisation');
  assert.ok(r.phases.some((p) => p.number === 2 && p.items.includes('opt-secondaire')));
});

test('3. Budget inférieur au socle obligatoire : rien d’obligatoire retiré, aucun prix baissé, non réalisable', () => {
  const r = run({
    options: ['opt-importante', 'opt-facultative', 'opt-secondaire'],
    quantities: { pages: 5 },
    priorities: { 'opt-importante': 'obligatoire', pages: 'obligatoire' },
    budget: euros(2000),
  });
  assert.equal(oneOff(r), euros(4500));
  assert.equal(r.optimized?.fits, false);
  for (const id of ['base-a', 'opt-importante', 'pages']) assert.ok(r.optimized!.kept.includes(id));
  assert.equal(r.optimized!.totals.oneOff.recommended.ttc, euros(3500));
  assert.equal(r.missing, euros(1500));
  assert.equal(r.budget?.status, 'non-realisable');
  // Formule B + socle = 2 500 € > 2 000 € : aucune alternative justifiée
  assert.equal(r.alternative, null);
  // Avec un budget de 2 500 €, la formule B devient une alternative réelle du catalogue
  const r2 = run({
    options: ['opt-importante'],
    quantities: { pages: 5 },
    priorities: { 'opt-importante': 'obligatoire', pages: 'obligatoire' },
    budget: euros(2500),
  });
  assert.equal(r2.alternative?.baseId, 'base-b');
});

test('4. Sans budget : calcul normal, aucune optimisation', () => {
  const r = run({ options: ['opt-importante'] });
  assert.equal(r.budget, null);
  assert.equal(r.optimized, null);
  assert.equal(oneOff(r), euros(3000));
});

test('5. Même périmètre, budgets différents : prix initial identique', () => {
  const a = run({ options: ['opt-importante', 'opt-facultative'], budget: euros(1000) });
  const b = run({ options: ['opt-importante', 'opt-facultative'], budget: euros(9000) });
  assert.deepEqual(a.initial, b.initial);
  assert.deepEqual(a.lines, b.lines);
});

test('6. Fonctionnalité incluse dans la formule : pas de double comptage', () => {
  const r = run({ options: ['opt-inclus'] });
  assert.equal(r.lines.find((l) => l.id === 'opt-inclus')?.status, 'inclus');
  assert.equal(oneOff(r), euros(2000));
  const b = run({ base: 'base-b', options: ['opt-inclus'] });
  assert.equal(oneOff(b), euros(1400));
});

test('7. Dépendances : ajout automatique, jamais de configuration invalide', () => {
  const r = run({ options: ['opt-depend'] });
  assert.ok(r.lines.some((l) => l.id === 'opt-facultative' && l.note));
  const tight = run({ options: ['opt-depend', 'opt-importante'], priorities: { 'opt-importante': 'obligatoire' }, budget: euros(3200) });
  const kept = new Set(tight.optimized!.kept);
  for (const line of tight.lines) if (kept.has(line.id)) for (const dep of line.requires) assert.ok(kept.has(dep), `${line.id} sans ${dep}`);
});

test('8. Prestations récurrentes : ponctuel et mensuel séparés', () => {
  const r = run({ options: ['maint'] });
  assert.equal(oneOff(r), euros(2000));
  assert.equal(r.initial.monthly.recommended.ttc, euros(50));
});

test('9. Quantités : unité respectée et plafond appliqué', () => {
  assert.equal(oneOff(run({ quantities: { pages: 3 } })), euros(2300));
  assert.equal(oneOff(run({ quantities: { pages: 999 } })), euros(3000));
  assert.equal(oneOff(run({ quantities: { pages: -2 } })), euros(2000));
});

test('10. Fourchettes : prix recommandé toujours entre le minimum et le maximum', () => {
  const at = (level: 0 | 2 | 4) =>
    run({
      options: ['opt-fourchette'],
      complexity: { design: level, fonctionnel: level, integrations: level, contenus: level, technique: level, delais: level },
    }).lines.find((l) => l.id === 'opt-fourchette')!.unitPrice!.recommended;
  assert.equal(at(0), euros(500));
  assert.equal(at(4), euros(900));
  assert.equal(at(2), euros(700));
  for (let score = -50; score <= 150; score += 7) {
    const price = recommendedPrice([euros(500), euros(900)], score);
    assert.ok(price >= euros(500) && price <= euros(900));
  }
});

test('11. Prix manquant : avertissement, jamais gratuit', () => {
  const r = run({ options: ['opt-sans-prix'] });
  const line = r.lines.find((l) => l.id === 'opt-sans-prix')!;
  assert.equal(line.status, 'a-estimer');
  assert.equal(line.total, null);
  assert.ok(r.warnings.some((w) => w.includes('Sans prix')));
  assert.equal(r.phases[0].status, 'a-etudier');
});

test('12. Recalcul : déterministe, sans état résiduel', () => {
  const over = { options: ['opt-importante', 'opt-facultative', 'opt-secondaire'], budget: euros(3000) };
  assert.deepEqual(run(over), run(over));
  assert.equal(run({ ...over, budget: euros(5000) }).optimized, null);
  const kept = run({ ...over, priorities: { 'opt-facultative': 'obligatoire' } });
  assert.ok(kept.optimized!.kept.includes('opt-facultative'));
  assert.deepEqual(run(over), run(over));
});

test('Budget mensuel : une famille au mois est comparée à son abonnement', () => {
  const monthlyFamily: CatalogGroup = {
    id: 'm',
    title: 'Maintenance',
    intro: '',
    items: [
      { id: 'm-base', price: 100, kind: 'base', unit: 'mois', monthly: true, label: 'Formule' },
      { id: 'm-opt', price: 60, priority: 'secondaire', kind: 'option', unit: 'mois', monthly: true, label: 'Option' },
    ],
  };
  const r = smartQuote(
    { ...input(), family: 'm', base: 'm-base', options: ['m-opt'], budget: euros(120) },
    { ...ctx, catalog: [monthlyFamily] },
  );
  assert.equal(r?.basis, 'monthly');
  assert.deepEqual(r?.optimized?.deferred.map((d) => d.id), ['m-opt']);
});

test('Vrai catalogue : prix valides, références existantes, profils sur 100', () => {
  const ids = new Set(catalog.flatMap((g) => g.items.map((i) => i.id)));
  for (const group of catalog) {
    if (group.profile) assert.equal(Object.values(group.profile).reduce((s, v) => s + (v ?? 0), 0), 100, group.id);
    for (const item of group.items) {
      assert.ok(item.price !== null, `${item.id} sans prix`);
      if (Array.isArray(item.price)) assert.ok(item.price[0] <= item.price[1], item.id);
      for (const ref of [...(item.requires ?? []), ...(item.includedIn ?? [])]) assert.ok(ids.has(ref), `${item.id} → ${ref}`);
    }
  }
  for (const group of catalog.filter((g) => g.id !== ADDON_GROUP)) {
    for (const base of group.items.filter((i) => i.kind === 'base')) {
      const r = smartQuote(input({ family: group.id, base: base.id }), { ...ctx, catalog, addonGroup: ADDON_GROUP });
      assert.ok(r && r.initial[r.basis].recommended.ttc > 0, base.id);
    }
  }
});
