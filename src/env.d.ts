// Données chargées par le middleware (src/lib/middleware.ts) pour chaque requête
declare namespace App {
  interface Locals {
    /** Connecté à /administration */
    isAdmin: boolean;
    settings: import('./lib/store').Settings;
    openings: import('./data/content').Opening[];
  }
}
