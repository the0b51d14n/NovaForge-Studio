// Catalogue du simulateur de devis (/devis) : tout ce qu'un client peut demander, du plus simple au sur mesure.
// Les prix ne se saisissent pas ici mais dans l'administration (/administration/tarifs), en euros HT.
// Un élément sans prix reste masqué aux visiteurs : on peut donc ouvrir le simulateur petit à petit.
// L'identifiant (`id`) d'un élément ne doit plus changer une fois des prix enregistrés : c'est lui qui les relie.

export type Unit = 'forfait' | 'page' | 'produit' | 'langue' | 'jour' | 'heure' | 'mois' | 'unité';

export type CatalogItem = {
  id: string;
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

/** Durée pendant laquelle un devis peut être signé, à compter de sa création (prix figés pendant ce temps) */
export const QUOTE_VALIDITY_DAYS = 30;

export const catalog: CatalogGroup[] = [
  {
    id: 'sites-vitrines',
    title: 'Site vitrine',
    intro: 'Présenter votre activité et être trouvé en ligne.',
    items: [
      { id: 'vitrine-one-page', kind: 'base', unit: 'forfait', label: 'Page unique (one page)', detail: 'Toute votre activité sur une seule page, idéale pour démarrer' },
      { id: 'vitrine-essentiel', kind: 'base', unit: 'forfait', label: 'Site essentiel', detail: "Jusqu'à 5 pages : accueil, services, à propos, contact…" },
      { id: 'vitrine-complet', kind: 'base', unit: 'forfait', label: 'Site complet', detail: "Jusqu'à 10 pages, maquettes sur mesure" },
      { id: 'vitrine-sur-mesure', kind: 'base', unit: 'forfait', label: 'Site sur mesure', detail: 'Plus de 10 pages, design et parcours entièrement personnalisés' },
      { id: 'vitrine-page-sup', kind: 'quantity', unit: 'page', max: 30, label: 'Pages supplémentaires' },
      { id: 'vitrine-redaction', kind: 'quantity', unit: 'page', max: 30, label: 'Rédaction des textes', detail: 'Par page, à partir de vos informations' },
      { id: 'vitrine-langue', kind: 'quantity', unit: 'langue', max: 5, label: 'Langues supplémentaires', detail: 'Version traduite du site (traduction fournie ou à prévoir)' },
      { id: 'vitrine-blog', kind: 'option', unit: 'forfait', label: 'Blog ou actualités' },
      { id: 'vitrine-galerie', kind: 'option', unit: 'forfait', label: 'Galerie ou portfolio' },
      { id: 'vitrine-formulaire', kind: 'option', unit: 'forfait', label: 'Formulaire avancé', detail: 'Demande de devis, inscription, pièces jointes…' },
      { id: 'vitrine-rdv', kind: 'option', unit: 'forfait', label: 'Prise de rendez-vous en ligne' },
      { id: 'vitrine-newsletter', kind: 'option', unit: 'forfait', label: 'Inscription à une newsletter' },
      { id: 'vitrine-avis', kind: 'option', unit: 'forfait', label: 'Avis clients affichés sur le site' },
      { id: 'vitrine-seo', kind: 'option', unit: 'forfait', label: 'Référencement avancé', detail: 'Étude de mots-clés, optimisation page par page' },
      { id: 'vitrine-google', kind: 'option', unit: 'forfait', label: 'Fiche Google Business Profile', detail: 'Création ou optimisation' },
      { id: 'vitrine-accessibilite', kind: 'option', unit: 'forfait', label: 'Accessibilité renforcée', detail: 'Audit et corrections selon le RGAA' },
      { id: 'vitrine-migration', kind: 'option', unit: 'forfait', label: "Reprise d'un ancien site", detail: 'Récupération des contenus et redirections' },
    ],
  },
  {
    id: 'boutiques-en-ligne',
    title: 'Boutique en ligne',
    intro: 'Vendre vos produits en ligne, simplement.',
    items: [
      { id: 'boutique-starter', kind: 'base', unit: 'forfait', label: 'Boutique de démarrage', detail: "Jusqu'à 20 produits" },
      { id: 'boutique-standard', kind: 'base', unit: 'forfait', label: 'Boutique standard', detail: "Jusqu'à 100 produits" },
      { id: 'boutique-avancee', kind: 'base', unit: 'forfait', label: 'Boutique avancée', detail: 'Catalogue illimité' },
      { id: 'boutique-sur-mesure', kind: 'base', unit: 'forfait', label: 'Boutique sur mesure', detail: "Parcours d'achat et fonctions spécifiques" },
      { id: 'boutique-saisie', kind: 'quantity', unit: 'produit', max: 1000, label: 'Mise en ligne des produits', detail: 'Saisie des fiches à partir de vos informations, par produit' },
      { id: 'boutique-variantes', kind: 'option', unit: 'forfait', label: 'Variantes de produits', detail: 'Tailles, couleurs, formats…' },
      { id: 'boutique-comptes', kind: 'option', unit: 'forfait', label: 'Comptes clients', detail: 'Historique des commandes, adresses enregistrées' },
      { id: 'boutique-promo', kind: 'option', unit: 'forfait', label: 'Codes promo et soldes' },
      { id: 'boutique-plusieurs-fois', kind: 'option', unit: 'forfait', label: 'Paiement en plusieurs fois' },
      { id: 'boutique-retrait', kind: 'option', unit: 'forfait', label: 'Retrait en boutique (click & collect)' },
      { id: 'boutique-livraison', kind: 'option', unit: 'forfait', label: 'Livraison avancée', detail: 'Points relais, transporteurs, frais selon le poids' },
      { id: 'boutique-abonnement', kind: 'option', unit: 'forfait', label: 'Vente par abonnement' },
      { id: 'boutique-avis', kind: 'option', unit: 'forfait', label: 'Avis sur les produits' },
      { id: 'boutique-factures', kind: 'option', unit: 'forfait', label: 'Factures automatiques' },
      { id: 'boutique-caisse', kind: 'option', unit: 'forfait', label: 'Connexion à votre caisse ou logiciel de gestion' },
      { id: 'boutique-marketplace', kind: 'option', unit: 'forfait', label: 'Diffusion sur des places de marché', detail: 'Amazon, Etsy, Google Shopping…' },
      { id: 'boutique-langue', kind: 'quantity', unit: 'langue', max: 5, label: 'Langues supplémentaires' },
    ],
  },
  {
    id: 'identite-visuelle',
    title: 'Identité visuelle',
    intro: 'Une image cohérente sur tous vos supports.',
    items: [
      { id: 'identite-logo', kind: 'base', unit: 'forfait', label: 'Logo seul', detail: 'Création et ses déclinaisons (couleur, noir et blanc, icône)' },
      { id: 'identite-essentielle', kind: 'base', unit: 'forfait', label: 'Identité essentielle', detail: 'Logo, couleurs, typographies et mini-charte' },
      { id: 'identite-complete', kind: 'base', unit: 'forfait', label: 'Identité complète', detail: 'Logo, charte graphique détaillée et premiers supports' },
      { id: 'identite-refonte', kind: 'base', unit: 'forfait', label: "Modernisation d'une identité existante" },
      { id: 'identite-cartes', kind: 'option', unit: 'forfait', label: 'Cartes de visite' },
      { id: 'identite-papeterie', kind: 'option', unit: 'forfait', label: 'Papeterie', detail: 'En-tête de lettre, modèles de devis et de factures' },
      { id: 'identite-flyer', kind: 'quantity', unit: 'unité', max: 10, label: 'Flyers ou affiches', detail: 'Par modèle' },
      { id: 'identite-reseaux', kind: 'option', unit: 'forfait', label: 'Kit réseaux sociaux', detail: 'Photos de profil, bannières, modèles de publications' },
      { id: 'identite-signature', kind: 'option', unit: 'forfait', label: 'Signature e-mail' },
      { id: 'identite-enseigne', kind: 'option', unit: 'forfait', label: 'Enseigne, vitrine ou véhicule', detail: 'Maquette prête pour votre imprimeur' },
      { id: 'identite-packaging', kind: 'option', unit: 'forfait', label: 'Packaging ou étiquettes' },
    ],
  },
  {
    id: 'applications-sur-mesure',
    title: 'Application sur mesure',
    intro: 'Des outils web taillés pour votre façon de travailler.',
    items: [
      { id: 'appli-cadrage', kind: 'base', unit: 'forfait', label: 'Atelier de cadrage seul', detail: 'Analyse de vos besoins et cahier des charges, pour démarrer' },
      { id: 'appli-mvp', kind: 'base', unit: 'forfait', label: 'Première version (MVP)', detail: "L'essentiel de l'outil, pour le tester rapidement" },
      { id: 'appli-complete', kind: 'base', unit: 'forfait', label: 'Application complète' },
      { id: 'appli-maquettes', kind: 'option', unit: 'forfait', label: 'Maquettes interactives', detail: "Tester l'outil avant son développement" },
      { id: 'appli-comptes', kind: 'option', unit: 'forfait', label: "Comptes utilisateurs et droits d'accès" },
      { id: 'appli-espace-client', kind: 'option', unit: 'forfait', label: 'Espace client' },
      { id: 'appli-rdv', kind: 'option', unit: 'forfait', label: 'Réservation ou prise de rendez-vous' },
      { id: 'appli-tableau', kind: 'option', unit: 'forfait', label: 'Tableau de bord et statistiques' },
      { id: 'appli-paiement', kind: 'option', unit: 'forfait', label: 'Paiement en ligne' },
      { id: 'appli-notifications', kind: 'option', unit: 'forfait', label: 'Notifications par e-mail ou SMS' },
      { id: 'appli-documents', kind: 'option', unit: 'forfait', label: 'Génération de documents', detail: 'PDF, exports Excel' },
      { id: 'appli-connexion', kind: 'quantity', unit: 'unité', max: 10, label: 'Connexions à vos outils existants', detail: 'Par outil (agenda, comptabilité, CRM…)' },
      { id: 'appli-mobile', kind: 'option', unit: 'forfait', label: 'Installation sur mobile (application web)' },
      { id: 'appli-jours', kind: 'quantity', unit: 'jour', max: 120, label: 'Jours de développement sur mesure', detail: 'Pour les fonctions spécifiques, au-delà des modules ci-dessus' },
    ],
  },
  {
    id: 'maintenance',
    title: 'Maintenance & suivi',
    intro: 'Un accompagnement mensuel après la mise en ligne.',
    items: [
      { id: 'maintenance-essentielle', kind: 'base', unit: 'mois', monthly: true, label: 'Formule essentielle', detail: 'Mises à jour, sauvegardes et surveillance de la sécurité' },
      { id: 'maintenance-serenite', kind: 'base', unit: 'mois', monthly: true, label: 'Formule sérénité', detail: 'Essentielle + petites évolutions chaque mois' },
      { id: 'maintenance-premium', kind: 'base', unit: 'mois', monthly: true, label: 'Formule premium', detail: 'Sérénité + intervention prioritaire et bilan mensuel' },
      { id: 'maintenance-hebergement', kind: 'option', unit: 'mois', monthly: true, label: 'Hébergement et nom de domaine', detail: 'Gérés par le studio' },
      { id: 'maintenance-heures', kind: 'quantity', unit: 'heure', monthly: true, max: 40, label: "Heures d'évolution par mois", detail: 'En plus de celles comprises dans la formule' },
      { id: 'maintenance-contenus', kind: 'option', unit: 'mois', monthly: true, label: 'Mise à jour de vos contenus', detail: 'Textes, photos, actualités, à votre demande' },
    ],
  },
  {
    id: 'accompagnement',
    title: 'Accompagnement',
    intro: 'Pour tous les projets.',
    items: [
      { id: 'accomp-formation', kind: 'quantity', unit: 'heure', max: 20, label: 'Formation à la prise en main', detail: 'En plus de la prise en main comprise' },
      { id: 'accomp-photos', kind: 'option', unit: 'forfait', label: 'Photos professionnelles', detail: "Séance photo ou sélection en banque d'images" },
      { id: 'accomp-domaine', kind: 'option', unit: 'forfait', label: 'Nom de domaine et adresses e-mail', detail: 'Réservation et configuration' },
      { id: 'accomp-legal', kind: 'option', unit: 'forfait', label: 'Pages légales et bandeau cookies', detail: 'Mentions légales et confidentialité, à faire valider de votre côté' },
      { id: 'accomp-urgence', kind: 'option', unit: 'forfait', label: 'Délai express', detail: 'Mise en ligne prioritaire' },
    ],
  },
];
