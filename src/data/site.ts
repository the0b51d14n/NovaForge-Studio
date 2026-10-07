// Informations générales de l'agence (fictive) — réutilisées dans tout le site
export const site = {
  name: 'NovaForge Studio',
  tagline: 'Forger votre présence numérique',
  description:
    "NovaForge Studio, agence digitale lilloise fondée en 2024 par un développeur freelance : sites vitrines, boutiques en ligne, identité visuelle et applications sur mesure pour TPE, PME et jeunes entreprises.",
  founded: 2024,
  city: 'Lille',
  address: ['14 rue Colson', 'Vauban-Esquermes, Lille'],
  // Coordonnées OpenStreetMap du 14 rue Colson (carte interactive)
  geo: { lat: 50.63293, lng: 3.04971 },
  email: 'contact@novaforge-studio.fr',
  jobsEmail: 'recrutement@novaforge-studio.fr',
  hours: 'Lun. – Ven. · 9 h – 18 h',
};

export type NavItem = { href: string; label: string; badge?: string };

export const nav: NavItem[] = [
  { href: '/agence', label: "L'agence" },
  { href: '/services', label: 'Services' },
  { href: '/realisations', label: 'Réalisations' },
  { href: '/carrieres', label: 'Carrières', badge: 'On recrute' },
];
