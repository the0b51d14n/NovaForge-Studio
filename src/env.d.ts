// Données chargées par le middleware (src/lib/middleware.ts) pour chaque requête
declare namespace App {
  interface Locals {
    /** Compte connecté (client ou équipe), null sinon */
    user: import('./lib/accounts').PublicUser | null;
    /** Compte de l'équipe connecté (admin, admin+ ou dirigeant) : accès au portail /administration */
    isAdmin: boolean;
    settings: import('./lib/store').Settings;
    openings: import('./data/content').Opening[];
    /** Tampon de la dernière modification enregistrée dans l'administration */
    version: string;
  }
}
