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
  hours: 'Lun. – Ven. · 9 h – 18 h',
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
  director: null,
};

/** true dès que le numéro SIREN est renseigné */
export const isRegistered = Boolean(legal.siren);

/** Hébergeur du site (mention obligatoire) */
export const host = {
  name: 'Vercel Inc.',
  address: '440 N Barranca Ave #4133, Covina, CA 91723, États-Unis',
  url: 'https://vercel.com',
};

export type NavItem = { href: string; label: string; badge?: string };

// « Réalisations » n'apparaît dans le menu qu'à partir du premier projet publié
export const nav: NavItem[] = [
  { href: '/agence', label: "L'agence" },
  { href: '/services', label: 'Services' },
  { href: '/realisations', label: 'Réalisations' },
  { href: '/carrieres', label: 'Carrières', badge: 'On recrute' },
].filter((item) => item.href !== '/realisations' || projects.length > 0);
