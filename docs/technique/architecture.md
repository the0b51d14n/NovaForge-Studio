# Architecture technique

> Document **préparatoire et interne** (non publié sur le site). Il n'a été validé ni par un avocat ni par un
> expert-comptable. Version du 28/10/2026.

- **Code** : Astro 7 (rendu serveur), TypeScript, CSS maison, Leaflet. Dépôt
  `github.com/the0b51d14n/NovaForge-Studio`, branche `main`.
- **Hébergement** : Vercel (déploiement automatique au push sur `main`). Le CDN met `/api/version` en cache 1 s.
- **Données** : Upstash Redis via REST (`src/lib/store.ts`) : réglages, offres, version. Sans configuration, les
  données restent en mémoire (développement).
- **Accès** : middleware (`src/lib/middleware.ts`). Verrou du site, aperçu administrateur, pages légales toujours
  accessibles, purge des fermetures passées.
- **Administration** : `/administration`, détaillée dans [administration.md](administration.md).
- **E-mails** : Resend (`src/lib/forms.ts`), inactif.
- **Navigateur** : `src/scripts/main.ts` (navigation, formulaires) et `src/scripts/live.ts` (rafraîchissement
  automatique).
- **Drapeaux de lancement** : `src/data/site.ts` (`launch`).
