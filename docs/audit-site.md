# Audit du site : inventaire et état

> Document **préparatoire et interne** (non publié sur le site). Il n'a été validé ni par un avocat ni par un
> expert-comptable. Version du 28/10/2026.

Audit réalisé sur le dépôt local `the0b51d14n/NovaForge-Studio`, branche `main`.

## 1. Stack

- **Framework** : Astro 7 en rendu serveur (`output: 'server'`), adaptateur Vercel. Dépendances : Leaflet et polices
  `@fontsource`, auto-hébergées.
- **Middleware** : `src/lib/middleware.ts`. Il charge les réglages, applique le verrou du site et purge les fermetures
  passées.
- **Données modifiables** : Upstash Redis, via son API REST (`src/lib/store.ts`). Clés `nf:settings`, `nf:openings`,
  `nf:version`. Sans configuration, les données restent en mémoire.
- **E-mails** : Resend, via son API REST (`src/lib/forms.ts`), seulement si `RESEND_API_KEY` et `MAIL_FROM` sont définis.
- **Drapeaux de lancement** (`src/data/site.ts`, `launch`) : `commercial`, `recruitment` et `mailbox`, tous à `false`.

## 2. Pages et routes

| Route | Public | Contenu ou comportement |
|:--|:--|:--|
| `/` | Oui | Présentation, services, méthode, chiffres. Bandeau « projet en préparation » |
| `/agence` | Oui | Histoire, valeurs, équipe (fondateur + futur poste), carte |
| `/services` | Oui | Prestations (sites vitrines, e-commerce, identité visuelle, applications, maintenance), méthode, FAQ. **Aucun tarif** |
| `/realisations` | Masquée tant qu'il n'y a pas de projet | Liste vide (aucun projet fictif) |
| `/contact` | Oui | Coordonnées, horaires prévus, carte. **Formulaire fermé** (« Le formulaire ouvre bientôt ») |
| `/carrieres` | Oui | Recrutement futur, culture, horaires et télétravail envisagés, processus, FAQ |
| `/carrieres/[slug]`, `/carrieres/candidature-spontanee` | Non : redirection vers `/carrieres#recrutement` | Prévisualisation réservée à l'administration |
| `/mentions-legales`, `/confidentialite` | Oui, même site verrouillé | Données de `src/data/site.ts` |
| `/verrouillage` | Oui | Page affichée quand le site est fermé (motif maintenance, fermeture ou mise à jour) |
| `/administration`, `/administration/offres/[slug]` | Non (mot de passe) | **Espace d'administration** : voir [technique/administration.md](technique/administration.md) |
| `/api/contact`, `/api/candidature` | Points d'envoi | Répondent 503 **avant lecture** tant que la messagerie (et le recrutement pour les candidatures) n'est pas ouverte |
| `/api/version` | Oui | Numéro de version des réglages, pour le rafraîchissement automatique |
| `/404` | Oui | Page d'erreur |

## 3. Données personnelles et intégrations (vérifié dans le code)

| Élément | Constat |
|:--|:--|
| Formulaires | Fermés : aucune collecte. À la réouverture, envoi par e-mail via Resend, **sans stockage** sur le site |
| Cookies visiteurs | Aucun. Contrôle : aucun en-tête `Set-Cookie` sur le site en ligne |
| Cookies d'administration | `nf_admin` (authentification signée HMAC, 30 jours) et `nf_apercu` (session) |
| Stockage navigateur | `sessionStorage` `nf-live-reload`, qui ne contient qu'un numéro de version |
| Carte | Tuiles `tile.openstreetmap.org`, qui reçoivent l'adresse IP. Pas de cookie (vérifié) |
| Géocodage | Nominatim, appelé seulement depuis l'administration (côté serveur) |
| Polices | Auto-hébergées, aucun appel à Google Fonts |
| Mesure d'audience | Aucune |
| Journaux | Hébergeur Vercel (IP, requêtes) ; journaux applicatifs sans données personnelles (`src/lib/forms.ts`) |
| Données structurées | `JobPosting` publié seulement si recrutement ouvert **et** SIREN renseigné, donc désactivé aujourd'hui |

## 4. Promesses commerciales relevées

- **« Premier rendez-vous et devis gratuits »** : affiché comme valable « dès l'ouverture » tant que `launch.commercial`
  est faux. C'est un engagement commercial choisi : il faudra le reprendre dans les conditions générales.
- **« Délai de réponse habituel 48 h »** : masqué avant l'ouverture.
- **Aucun tarif, aucune garantie commerciale, aucun délai de livraison chiffré** sur le site.
- **Récit « freelance qui accompagne ses clients »** (accueil, L'agence) : à confirmer par le propriétaire.

## 5. Anomalies

Les anomalies et leur statut sont suivis dans [`../AUDIT-LEGAL.md`](../AUDIT-LEGAL.md) (sections 0 et 3). Elles ont été
corrigées lors des phases 1 et 2 (commit `4a50bb5` et modifications non commitées). Les points restant à vérifier
sont classés de P0 à P2 dans ce même rapport.

## 6. Variables d'environnement

Voir [technique/exploitation.md](technique/exploitation.md). Aucune valeur n'est documentée ici.
