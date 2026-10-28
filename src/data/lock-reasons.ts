// Motifs de verrouillage du site : choisis dans /administration, ils fixent le message de /verrouillage.
// temporary : courte interruption, la page répond « 503 Service indisponible » pour que les moteurs
// de recherche gardent le site en mémoire et repassent plus tard.
export const LOCK_REASONS = {
  maintenance: {
    label: 'Maintenance',
    pageTitle: 'Maintenance en cours',
    badge: 'Maintenance',
    icon: 'clock',
    title: 'Maintenance en cours.',
    lead: 'Nous effectuons une opération technique sur le site. Il sera de retour très bientôt.',
    temporary: true,
  },
  fermeture: {
    label: 'Fermeture complète',
    pageTitle: 'Bientôt en ligne',
    badge: 'Accès privé',
    icon: 'lock',
    title: 'Le studio vous ouvre ses portes sur invitation.',
    lead: 'Le site est momentanément fermé. Revenez un peu plus tard.',
    temporary: false,
  },
  'mise-a-jour': {
    label: 'Mise à jour',
    pageTitle: 'Mise à jour en cours',
    badge: 'Mise à jour',
    icon: 'clock',
    title: 'Nouveautés en préparation.',
    lead: 'Nous mettons le site à jour. Revenez dans quelques instants pour découvrir les nouveautés.',
    temporary: true,
  },
} as const;

export type LockReason = keyof typeof LOCK_REASONS;

export const isLockReason = (value: unknown): value is LockReason =>
  typeof value === 'string' && Object.hasOwn(LOCK_REASONS, value);
