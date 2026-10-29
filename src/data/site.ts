// Informations de l'entreprise : un seul endroit à modifier, réutilisé dans tout le site.
// Les champs à `null` sont masqués et s'affichent automatiquement dès qu'ils sont renseignés.
// Liste des éléments attendus : docs/elements-a-fournir.md
import { projects } from './content';

export const site = {
  name: 'NovaForge Studio',
  tagline: 'Forger votre présence numérique',
  description:
    "NovaForge Studio, agence digitale de la métropole lilloise créée par un développeur freelance : sites vitrines, boutiques en ligne, identité visuelle et applications sur mesure pour TPE, PME et jeunes entreprises.",
  /** Année d'immatriculation : `null` tant que la société est en cours de création */
  founded: null as number | null,
  city: 'Neuville-en-Ferrain',
  postalCode: '59960',
  /** Zone affichée dans les accroches (« Agence digitale · … ») */
  area: 'Métropole lilloise',
  address: ['6 rue Blaise Pascal', '59960 Neuville-en-Ferrain'],
  // Coordonnées OpenStreetMap du 6 rue Blaise Pascal (carte interactive)
  geo: { lat: 50.749605, lng: 3.156248 },
  // À CONFIRMER : e-mails (nom de domaine), téléphone et horaires
  email: 'contact@novaforge-studio.fr',
  jobsEmail: 'recrutement@novaforge-studio.fr',
  phone: '06 95 96 17 49' as string | null,
  /** Résumé des horaires (pied de page, carte) : à garder cohérent avec `schedule` */
  hours: 'Lun. – Ven. · 9 h – 18 h',
  /** Horaires détaillés, du lundi au dimanche (page Contact) : `null` = fermé */
  schedule: [
    { day: 'Lundi', hours: ['09:00', '18:00'] },
    { day: 'Mardi', hours: ['09:00', '18:00'] },
    { day: 'Mercredi', hours: ['09:00', '18:00'] },
    { day: 'Jeudi', hours: ['09:00', '18:00'] },
    { day: 'Vendredi', hours: ['09:00', '18:00'] },
    { day: 'Samedi', hours: null },
    { day: 'Dimanche', hours: null },
  ] as { day: string; hours: [string, string] | null }[],
  /** Réseaux professionnels (pied de page) : uniquement des comptes réels, ex. { label: 'LinkedIn', href: 'https://…' } */
  socials: [] as { label: string; href: string }[],
  founder: {
    /** Prénom et nom du fondateur, affichés sur « L'agence » */
    name: null as string | null,
    role: 'Fondateur',
  },
};

/** Identité légale : mentions légales et données structurées */
export type Legal = {
  /** Dénomination sociale (ex. « NovaForge Studio ») */
  legalName: string | null;
  /** Forme juridique (ex. SASU, SAS, EURL, entreprise individuelle) */
  form: string | null;
  /** Capital social (ex. « 1 000 € ») — sans objet pour une entreprise individuelle */
  capital: string | null;
  siren: string | null;
  siret: string | null;
  /** Immatriculation (ex. « RCS Lille Métropole 123 456 789 ») */
  rcs: string | null;
  /** N° de TVA intracommunautaire (ex. FR12 123456789) */
  vat: string | null;
  /** Code APE / NAF (ex. 62.01Z) */
  naf: string | null;
  /** Directeur de la publication : nom et fonction (ex. « Prénom Nom, président ») */
  director: string | null;
  /** Éditeur personne physique (tant qu'aucune société n'existe) : prénom et nom */
  publisher: string | null;
};

export const legal: Legal = {
  legalName: null,
  form: null,
  capital: null,
  siren: null,
  siret: null,
  rcs: null,
  vat: null,
  naf: null,
  // Porteur du projet, confirmé par le propriétaire le 28/10/2026 (projet non immatriculé)
  director: 'Théo ANDRIMANANARISOA',
  publisher: 'Théo ANDRIMANANARISOA',
};

/** true dès que le numéro SIREN est renseigné */
export const isRegistered = Boolean(legal.siren);

/**
 * Ouverture réelle du projet (pré-lancement au 28/10/2026, voir AUDIT-LEGAL.md). Ne passer un drapeau à true que
 * lorsque c'est vrai :
 * - commercial : prestations ouvertes à la commande (statut créé, documents commerciaux validés) ;
 * - recruitment : recrutement ouvert (employeur immatriculé, conditions confirmées, processus organisé) ;
 * - mailbox : messagerie professionnelle en service (adresses e-mail affichées, formulaires réactivables
 *   une fois Resend configuré et testé de bout en bout).
 */
export const launch = {
  commercial: false,
  recruitment: false,
  mailbox: false,
};

/**
 * Hébergeur du site (LCEN, art. 1-1, I, 4° : nom, adresse et téléphone).
 * Adresse vérifiée dans la politique de confidentialité de Vercel (mise à jour du 1er juin 2026) ;
 * aucun numéro de téléphone n'y est publié : à obtenir auprès de Vercel (voir AUDIT-LEGAL.md).
 */
export const host = {
  name: 'Vercel Inc.',
  address: '440 N Barranca Avenue #4133, Covina, CA 91723, États-Unis',
  phone: null as string | null,
  url: 'https://vercel.com',
};

/**
 * Prestataire stockant les réglages du site modifiés depuis l'administration (LCEN, art. 1-1, I, 5° :
 * nom et adresse). Aucune donnée de visiteur n'y est enregistrée. Adresse à vérifier (voir AUDIT-LEGAL.md).
 */
export const storage = {
  name: 'Upstash, Inc. (base de données Upstash Redis, souscrite via Vercel)',
  address: null as string | null,
  url: 'https://upstash.com',
};

export type NavItem = { href: string; label: string; badge?: string };

// « Réalisations » n'apparaît dans le menu qu'à partir du premier projet publié
export const nav: NavItem[] = [
  { href: '/agence', label: "L'agence" },
  { href: '/services', label: 'Services' },
  { href: '/realisations', label: 'Réalisations' },
  { href: '/carrieres', label: 'Carrières', badge: 'On recrute' },
].filter((item) => item.href !== '/realisations' || projects.length > 0);
