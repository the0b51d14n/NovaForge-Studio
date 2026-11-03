// Données chargées par le middleware (src/lib/middleware.ts) pour chaque requête
declare namespace App {
  interface Locals {
    /** Compte client connecté, null sinon (les comptes de l'équipe se connectent sur le portail) */
    user: import('./lib/accounts').PublicUser | null;
    settings: import('./lib/store').Settings;
    openings: import('./data/content').Opening[];
    /** Tampon de la dernière modification enregistrée dans l'administration */
    version: string;
  }
}
