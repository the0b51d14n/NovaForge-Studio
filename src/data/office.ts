// Photos des bureaux : toutes les images déposées dans src/assets/bureaux/ sont chargées automatiquement
import type { ImageMetadata } from 'astro';

export type OfficePhoto = {
  key: string;
  src: ImageMetadata;
  title: string;
  text: string;
  alt: string;
  /** false : photo réservée à un emplacement précis, absente de la galerie */
  gallery: boolean;
};

const files = import.meta.glob<{ default: ImageMetadata }>(
  '../assets/bureaux/*.{jpg,jpeg,png,webp,avif,JPG,JPEG,PNG,WEBP}',
  { eager: true },
);

// Textes des espaces connus (le nom du fichier suffit : bureau, accueil, rdv, reunion, pause…)
const zones: Record<string, Omit<OfficePhoto, 'key' | 'src' | 'gallery'> & { order: number; gallery?: boolean }> = {
  bureau: {
    order: 1,
    title: 'Espace de travail',
    text: 'Des postes équipés de grands écrans, de la lumière naturelle et beaucoup de plantes.',
    alt: "Open space de NovaForge Studio : bureaux en bois clair, chaises ergonomiques, écrans et plantes, logo lumineux au mur.",
  },
  accueil: {
    order: 2,
    title: 'Accueil',
    text: 'Le premier contact avec le studio : clients et candidats y sont accueillis autour d’un café.',
    alt: 'Accueil de NovaForge Studio : comptoir en bois éclairé, logo lumineux au mur, coin salon avec canapé et fauteuil bleu.',
  },
  rdv: {
    order: 3,
    gallery: false, // utilisée en en-tête de « L'agence » et sur « Contact », pas dans la galerie
    title: 'Salle client',
    text: 'Un espace chaleureux pour les premiers rendez-vous et la présentation des maquettes.',
    alt: 'Salle de rendez-vous client : table ovale en bois, chaises en velours bleu marine, écran affichant le logo NovaForge Studio et coin fauteuil.',
  },
  reunion: {
    order: 4,
    title: 'Salle de réunion',
    text: "Ateliers, points d'équipe et suivi des projets en cours.",
    alt: 'Salle de réunion vitrée : grande table en bois, chaises noires, ordinateurs portables et écran affichant le logo NovaForge Studio.',
  },
  pause: {
    order: 5,
    title: 'Salle de pause',
    text: 'Machines à café, coin salon et grande table pour déjeuner ensemble.',
    alt: 'Salle de pause : étagères éclairées avec machines à café, canapé, table en bois et chaises bleues.',
  },
};

// Noms générés par les appareils photo : pas de légende
const cameraName = /^(img|dsc|dscn|pxl|photo|image|wp|screenshot)[\s_-]?\d/i;

const describe = (path: string) => {
  const name = (path.split('/').pop() ?? '').replace(/\.[^.]+$/, '');
  const plain = name.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
  const key = Object.keys(zones).find((k) => plain.includes(k));
  if (key) return { key, gallery: true, ...zones[key] };

  const label = cameraName.test(name) ? '' : name.replace(/^\d+[\s_-]*/, '').replace(/[_-]+/g, ' ').trim();
  const title = label.charAt(0).toUpperCase() + label.slice(1);
  return {
    key: plain,
    order: 100,
    gallery: true,
    title,
    text: '',
    alt: title ? `Bureaux de NovaForge Studio : ${title}` : 'Bureaux de NovaForge Studio',
  };
};

export const officePhotos: OfficePhoto[] = Object.entries(files)
  .map(([path, mod]) => ({ path, src: mod.default, ...describe(path) }))
  .sort((a, b) => a.order - b.order || a.path.localeCompare(b.path, 'fr', { numeric: true }))
  .map(({ key, src, title, text, alt, gallery }) => ({ key, src, title, text, alt, gallery }));

/** Photos affichées dans la galerie « Nos locaux » */
export const galleryPhotos = officePhotos.filter((p) => p.gallery);

export const findOfficePhoto = (key: string) => officePhotos.find((p) => p.key === key) ?? officePhotos[0];
