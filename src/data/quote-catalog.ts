// Catalogue et grille de prix du simulateur de devis (/devis) : tout ce qu'un client peut demander,
// du plus simple au sur mesure. C'est le seul fichier à remplir pour les prix.
//
// price, en euros HT :
//   price: 1200          → prix fixe
//   price: [1200, 2500]  → fourchette (minimum, maximum) : le simulateur affiche « 1 200 € – 2 500 € »
//   price: null          → pas encore de prix : l'élément est masqué aux visiteurs
// Pour une quantité (kind 'quantity'), le prix est celui d'une unité (une page, un produit, un jour…).
// Pour un élément mensuel (monthly), c'est le prix par mois.
//
// Parcours du simulateur : famille (un groupe qui a des formules), type (une formule), options (celles de la
// famille + celles du groupe ADDON_GROUP), puis budget envisagé (BUDGETS). Aucun prix n'est montré pendant les
// choix : le visiteur obtient ensuite une estimation approximative (total en fourchette), comparée à son budget,
// et un conseiller le rappelle pour établir le devis ferme depuis l'administration.
// Une famille reste masquée tant qu'aucune de ses formules n'a de prix.
import type { VatRegime } from '../lib/pricing';

/** franchise : aucune TVA facturée (« TVA non applicable, art. 293 B du CGI ») ; normal : TVA à 20 % */
export const VAT_REGIME: VatRegime = 'franchise';

export type Unit = 'forfait' | 'page' | 'produit' | 'langue' | 'jour' | 'heure' | 'mois' | 'unité';

/** Prix HT en euros : fixe, fourchette [minimum, maximum], ou null (élément masqué) */
export type Price = number | [min: number, max: number] | null;

export type CatalogItem = {
  id: string;
  price: Price;
  label: string;
  /** Précision affichée sous le libellé */
  detail?: string;
  /**
   * base : formule de départ du service, une seule au choix ;
   * option : case à cocher ;
   * quantity : nombre à indiquer (pages, produits, jours…), facturé à l'unité
   */
  kind: 'base' | 'option' | 'quantity';
  unit: Unit;
  /** Facturé chaque mois (maintenance, hébergement) plutôt qu'une seule fois */
  monthly?: boolean;
  /** Quantité maximale proposée (kind quantity) */
  max?: number;
};

export type CatalogGroup = {
  /** Identique au slug du service (src/data/content.ts) quand le groupe correspond à un service */
  id: string;
  title: string;
  intro: string;
  items: CatalogItem[];
};

export const UNIT_LABELS: Record<Unit, [singulier: string, pluriel: string]> = {
  forfait: ['forfait', 'forfaits'],
  page: ['page', 'pages'],
  produit: ['produit', 'produits'],
  langue: ['langue', 'langues'],
  jour: ['jour', 'jours'],
  heure: ['heure', 'heures'],
  mois: ['mois', 'mois'],
  unité: ['unité', 'unités'],
};

/**
 * Durée de validité, en jours : de l'estimation à compter de sa création (fourchettes figées),
 * puis du devis ferme à compter de son émission (période de signature)
 */
export const QUOTE_VALIDITY_DAYS = 30;

/** Groupe dont les options sont proposées avec toutes les familles (étape « Options ») */
export const ADDON_GROUP = 'accompagnement';

/** Tranche de budget envisagé, en euros TTC : [minimum, maximum] (maximum null = sans plafond) */
export type Budget = { id: string; label: string; range: [min: number, max: number | null] };

/** Budgets proposés pour un projet payé une fois */
export const BUDGETS: Budget[] = [
  { id: 'moins-1000', label: 'Moins de 1 000 €', range: [0, 1000] },
  { id: '1000-2500', label: '1 000 – 2 500 €', range: [1000, 2500] },
  { id: '2500-5000', label: '2 500 – 5 000 €', range: [2500, 5000] },
  { id: '5000-10000', label: '5 000 – 10 000 €', range: [5000, 10000] },
  { id: '10000-20000', label: '10 000 – 20 000 €', range: [10000, 20000] },
  { id: 'plus-20000', label: 'Plus de 20 000 €', range: [20000, null] },
];

/** Budgets proposés pour une famille facturée au mois (maintenance) */
export const MONTHLY_BUDGETS: Budget[] = [
  { id: 'moins-80', label: 'Moins de 80 € / mois', range: [0, 80] },
  { id: '80-150', label: '80 – 150 € / mois', range: [80, 150] },
  { id: '150-300', label: '150 – 300 € / mois', range: [150, 300] },
  { id: 'plus-300', label: 'Plus de 300 € / mois', range: [300, null] },
];

/**
 * Réduction appliquée automatiquement à l'estimation quand toutes ses conditions sont remplies.
 * Conditions à définir : laisser la liste vide tant qu'aucune n'est décidée. Une réduction porte sur ce qui est payé
 * une fois (pas sur l'abonnement mensuel). Le conseiller peut aussi accorder une remise en établissant le devis ferme.
 */
export type Discount = {
  /** Affiché sur l'estimation, ex. « Offre de lancement » */
  label: string;
  /** Pourcentage du total HT… */
  percent?: number;
  /** …ou montant HT en euros */
  amount?: number;
  /** Condition : total HT minimum de l'estimation (prix bas de la fourchette), en euros */
  minTotal?: number;
  /** Condition : familles concernées (id des groupes) ; toutes si absent */
  families?: string[];
  /** Condition : prestations qui doivent toutes être choisies (id) */
  requires?: string[];
  /** Condition : valable jusqu'à cette date incluse (AAAA-MM-JJ) */
  until?: string;
};

export const discounts: Discount[] = [
  // Exemples, à activer une fois les conditions décidées :
  // { label: 'Offre de lancement', percent: 10, until: '2027-03-31' },
  // { label: 'Remise grand projet', percent: 5, minTotal: 5000 },
  // { label: 'Boutique avec mise en ligne des produits', amount: 150, requires: ['boutique-saisie'] },
];

export const catalog: CatalogGroup[] = [
  {
    id: 'sites-vitrines',
    title: 'Site vitrine',
    intro: 'Présenter votre activité et être trouvé en ligne.',
    items: [
      { id: 'vitrine-one-page', price: [900, 1300], kind: 'base', unit: 'forfait', label: 'Page unique (one page)', detail: 'Toute votre activité sur une seule page, idéale pour démarrer' },
      { id: 'vitrine-essentiel', price: [1600, 2400], kind: 'base', unit: 'forfait', label: 'Site essentiel', detail: "Jusqu'à 5 pages : accueil, services, à propos, contact…" },
      { id: 'vitrine-complet', price: [2800, 4200], kind: 'base', unit: 'forfait', label: 'Site complet', detail: "Jusqu'à 10 pages, maquettes sur mesure" },
      { id: 'vitrine-sur-mesure', price: [5000, 9000], kind: 'base', unit: 'forfait', label: 'Site sur mesure', detail: 'Plus de 10 pages, design et parcours entièrement personnalisés' },
      { id: 'vitrine-page-sup', price: [120, 180], kind: 'quantity', unit: 'page', max: 30, label: 'Pages supplémentaires' },
      { id: 'vitrine-redaction', price: [90, 150], kind: 'quantity', unit: 'page', max: 30, label: 'Rédaction des textes', detail: 'Par page, à partir de vos informations' },
      { id: 'vitrine-langue', price: [180, 350], kind: 'quantity', unit: 'langue', max: 5, label: 'Langues supplémentaires', detail: 'Version traduite du site (traduction fournie ou à prévoir)' },
      { id: 'vitrine-blog', price: [300, 600], kind: 'option', unit: 'forfait', label: 'Blog ou actualités' },
      { id: 'vitrine-galerie', price: [180, 350], kind: 'option', unit: 'forfait', label: 'Galerie ou portfolio' },
      { id: 'vitrine-formulaire', price: [180, 400], kind: 'option', unit: 'forfait', label: 'Formulaire avancé', detail: 'Demande de devis, inscription, pièces jointes…' },
      { id: 'vitrine-rdv', price: [250, 600], kind: 'option', unit: 'forfait', label: 'Prise de rendez-vous en ligne' },
      { id: 'vitrine-newsletter', price: [150, 300], kind: 'option', unit: 'forfait', label: 'Inscription à une newsletter' },
      { id: 'vitrine-avis', price: [120, 250], kind: 'option', unit: 'forfait', label: 'Avis clients affichés sur le site' },
      { id: 'vitrine-seo', price: [500, 900], kind: 'option', unit: 'forfait', label: 'Référencement avancé', detail: 'Étude de mots-clés, optimisation page par page' },
      { id: 'vitrine-google', price: [150, 250], kind: 'option', unit: 'forfait', label: 'Fiche Google Business Profile', detail: 'Création ou optimisation' },
      { id: 'vitrine-accessibilite', price: [600, 1200], kind: 'option', unit: 'forfait', label: 'Accessibilité renforcée', detail: 'Audit et corrections selon le RGAA' },
      { id: 'vitrine-migration', price: [450, 1200], kind: 'option', unit: 'forfait', label: "Reprise d'un ancien site", detail: 'Récupération des contenus et redirections' },
    ],
  },
  {
    id: 'boutiques-en-ligne',
    title: 'Boutique en ligne',
    intro: 'Vendre vos produits en ligne, simplement.',
    items: [
      { id: 'boutique-starter', price: [3000, 4500], kind: 'base', unit: 'forfait', label: 'Boutique de démarrage', detail: "Jusqu'à 20 produits" },
      { id: 'boutique-standard', price: [4500, 7000], kind: 'base', unit: 'forfait', label: 'Boutique standard', detail: "Jusqu'à 100 produits" },
      { id: 'boutique-avancee', price: [7000, 12000], kind: 'base', unit: 'forfait', label: 'Boutique avancée', detail: 'Catalogue illimité' },
      { id: 'boutique-sur-mesure', price: [12000, 25000], kind: 'base', unit: 'forfait', label: 'Boutique sur mesure', detail: "Parcours d'achat et fonctions spécifiques" },
      { id: 'boutique-saisie', price: 12, kind: 'quantity', unit: 'produit', max: 1000, label: 'Mise en ligne des produits', detail: 'Saisie des fiches à partir de vos informations, par produit' },
      { id: 'boutique-variantes', price: [200, 450], kind: 'option', unit: 'forfait', label: 'Variantes de produits', detail: 'Tailles, couleurs, formats…' },
      { id: 'boutique-comptes', price: [250, 500], kind: 'option', unit: 'forfait', label: 'Comptes clients', detail: 'Historique des commandes, adresses enregistrées' },
      { id: 'boutique-promo', price: [100, 220], kind: 'option', unit: 'forfait', label: 'Codes promo et soldes' },
      { id: 'boutique-plusieurs-fois', price: [180, 350], kind: 'option', unit: 'forfait', label: 'Paiement en plusieurs fois' },
      { id: 'boutique-retrait', price: [200, 400], kind: 'option', unit: 'forfait', label: 'Retrait en boutique (click & collect)' },
      { id: 'boutique-livraison', price: [350, 800], kind: 'option', unit: 'forfait', label: 'Livraison avancée', detail: 'Points relais, transporteurs, frais selon le poids' },
      { id: 'boutique-abonnement', price: [500, 1000], kind: 'option', unit: 'forfait', label: 'Vente par abonnement' },
      { id: 'boutique-avis', price: [150, 300], kind: 'option', unit: 'forfait', label: 'Avis sur les produits' },
      { id: 'boutique-factures', price: [250, 550], kind: 'option', unit: 'forfait', label: 'Factures automatiques' },
      { id: 'boutique-caisse', price: [450, 1000], kind: 'option', unit: 'forfait', label: 'Connexion à votre caisse ou logiciel de gestion' },
      { id: 'boutique-marketplace', price: [500, 1200], kind: 'option', unit: 'forfait', label: 'Diffusion sur des places de marché', detail: 'Amazon, Etsy, Google Shopping…' },
      { id: 'boutique-langue', price: [250, 500], kind: 'quantity', unit: 'langue', max: 5, label: 'Langues supplémentaires' },
    ],
  },
  {
    id: 'identite-visuelle',
    title: 'Identité visuelle',
    intro: 'Une image cohérente sur tous vos supports.',
    items: [
      { id: 'identite-logo', price: [500, 900], kind: 'base', unit: 'forfait', label: 'Logo seul', detail: 'Création et ses déclinaisons (couleur, noir et blanc, icône)' },
      { id: 'identite-essentielle', price: [1000, 1600], kind: 'base', unit: 'forfait', label: 'Identité essentielle', detail: 'Logo, couleurs, typographies et mini-charte' },
      { id: 'identite-complete', price: [1800, 3200], kind: 'base', unit: 'forfait', label: 'Identité complète', detail: 'Logo, charte graphique détaillée et premiers supports' },
      { id: 'identite-refonte', price: [600, 1200], kind: 'base', unit: 'forfait', label: "Modernisation d'une identité existante" },
      { id: 'identite-cartes', price: [150, 300], kind: 'option', unit: 'forfait', label: 'Cartes de visite' },
      { id: 'identite-papeterie', price: [200, 400], kind: 'option', unit: 'forfait', label: 'Papeterie', detail: 'En-tête de lettre, modèles de devis et de factures' },
      { id: 'identite-flyer', price: [180, 350], kind: 'quantity', unit: 'unité', max: 10, label: 'Flyers ou affiches', detail: 'Par modèle' },
      { id: 'identite-reseaux', price: [300, 650], kind: 'option', unit: 'forfait', label: 'Kit réseaux sociaux', detail: 'Photos de profil, bannières, modèles de publications' },
      { id: 'identite-signature', price: [80, 150], kind: 'option', unit: 'forfait', label: 'Signature e-mail' },
      { id: 'identite-enseigne', price: [250, 600], kind: 'option', unit: 'forfait', label: 'Enseigne, vitrine ou véhicule', detail: 'Maquette prête pour votre imprimeur' },
      { id: 'identite-packaging', price: [350, 900], kind: 'option', unit: 'forfait', label: 'Packaging ou étiquettes' },
    ],
  },
  {
    id: 'applications-sur-mesure',
    title: 'Application sur mesure',
    intro: 'Des outils web taillés pour votre façon de travailler.',
    items: [
      { id: 'appli-cadrage', price: [450, 800], kind: 'base', unit: 'forfait', label: 'Atelier de cadrage seul', detail: 'Analyse de vos besoins et cahier des charges, pour démarrer' },
      { id: 'appli-mvp', price: [6000, 12000], kind: 'base', unit: 'forfait', label: 'Première version (MVP)', detail: "L'essentiel de l'outil, pour le tester rapidement" },
      { id: 'appli-complete', price: [15000, 30000], kind: 'base', unit: 'forfait', label: 'Application complète' },
      { id: 'appli-maquettes', price: [700, 1500], kind: 'option', unit: 'forfait', label: 'Maquettes interactives', detail: "Tester l'outil avant son développement" },
      { id: 'appli-comptes', price: [700, 1600], kind: 'option', unit: 'forfait', label: "Comptes utilisateurs et droits d'accès" },
      { id: 'appli-espace-client', price: [900, 2200], kind: 'option', unit: 'forfait', label: 'Espace client' },
      { id: 'appli-rdv', price: [500, 1200], kind: 'option', unit: 'forfait', label: 'Réservation ou prise de rendez-vous' },
      { id: 'appli-tableau', price: [800, 1800], kind: 'option', unit: 'forfait', label: 'Tableau de bord et statistiques' },
      { id: 'appli-paiement', price: [500, 1200], kind: 'option', unit: 'forfait', label: 'Paiement en ligne' },
      { id: 'appli-notifications', price: [300, 700], kind: 'option', unit: 'forfait', label: 'Notifications par e-mail ou SMS' },
      { id: 'appli-documents', price: [400, 1000], kind: 'option', unit: 'forfait', label: 'Génération de documents', detail: 'PDF, exports Excel' },
      { id: 'appli-connexion', price: [400, 1200], kind: 'quantity', unit: 'unité', max: 10, label: 'Connexions à vos outils existants', detail: 'Par outil (agenda, comptabilité, CRM…)' },
      { id: 'appli-mobile', price: [350, 800], kind: 'option', unit: 'forfait', label: 'Installation sur mobile (application web)' },
      { id: 'appli-jours', price: [380, 480], kind: 'quantity', unit: 'jour', max: 120, label: 'Jours de développement sur mesure', detail: 'Pour les fonctions spécifiques, au-delà des modules ci-dessus' },
    ],
  },
  {
    id: 'maintenance',
    title: 'Maintenance & suivi',
    intro: 'Un accompagnement mensuel après la mise en ligne.',
    items: [
      { id: 'maintenance-essentielle', price: [59, 79], kind: 'base', unit: 'mois', monthly: true, label: 'Formule essentielle', detail: 'Mises à jour, sauvegardes et surveillance de la sécurité' },
      { id: 'maintenance-serenite', price: [99, 149], kind: 'base', unit: 'mois', monthly: true, label: 'Formule sérénité', detail: 'Essentielle + petites évolutions chaque mois' },
      { id: 'maintenance-premium', price: [179, 249], kind: 'base', unit: 'mois', monthly: true, label: 'Formule premium', detail: 'Sérénité + intervention prioritaire et bilan mensuel' },
      { id: 'maintenance-hebergement', price: [20, 35], kind: 'option', unit: 'mois', monthly: true, label: 'Hébergement et nom de domaine', detail: 'Gérés par le studio' },
      { id: 'maintenance-heures', price: [60, 75], kind: 'quantity', unit: 'heure', monthly: true, max: 40, label: "Heures d'évolution par mois", detail: 'En plus de celles comprises dans la formule' },
      { id: 'maintenance-contenus', price: [69, 149], kind: 'option', unit: 'mois', monthly: true, label: 'Mise à jour de vos contenus', detail: 'Textes, photos, actualités, à votre demande' },
    ],
  },
  {
    id: 'accompagnement',
    title: 'Accompagnement',
    intro: 'Pour tous les projets.',
    items: [
      { id: 'accomp-formation', price: [55, 75], kind: 'quantity', unit: 'heure', max: 20, label: 'Formation à la prise en main', detail: 'En plus de la prise en main comprise' },
      { id: 'accomp-photos', price: [350, 700], kind: 'option', unit: 'forfait', label: 'Photos professionnelles', detail: "Séance photo ou sélection en banque d'images" },
      { id: 'accomp-domaine', price: [120, 250], kind: 'option', unit: 'forfait', label: 'Nom de domaine et adresses e-mail', detail: 'Réservation et configuration' },
      { id: 'accomp-legal', price: [180, 350], kind: 'option', unit: 'forfait', label: 'Pages légales et bandeau cookies', detail: 'Mentions légales et confidentialité, à faire valider de votre côté' },
      { id: 'accomp-urgence', price: [250, 500], kind: 'option', unit: 'forfait', label: 'Délai express', detail: 'Mise en ligne prioritaire' },
    ],
  },
];
