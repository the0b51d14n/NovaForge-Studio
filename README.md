# NovaForge Studio — site vitrine

Site de NovaForge Studio, agence digitale de la métropole lilloise (Neuville-en-Ferrain), en cours
de création. Construit avec [Astro](https://astro.build), hébergé sur Vercel, sans base de données.
Le site est **en accès privé** jusqu'à l'ouverture : un mot de passe est demandé avant toute page.

**Informations officielles à fournir** (SIREN, forme juridique, contenus à valider, variables de
mise en ligne) : voir [`docs/elements-a-fournir.md`](docs/elements-a-fournir.md).

## Lancer le site

```sh
npm install        # une seule fois
cp .env.example .env   # puis renseigner SITE_PASSWORD (et Resend pour les formulaires)
npm run dev        # développement → http://localhost:1024
npm run build      # génère le site pour Vercel dans .vercel/output/
```

Les polices sont intégrées au projet : le site fonctionne même sans connexion internet.
`astro preview` n'est pas disponible avec l'adaptateur Vercel : tester avec `npm run dev`.

## Administration et verrouillage

`/administration` (mot de passe `SITE_PASSWORD`) permet de :

- **verrouiller ou ouvrir le site** : verrouillé, tout visiteur est redirigé vers `/verrouillage`
  dont le message dépend du motif choisi (maintenance, fermeture complète, mise à jour — textes dans
  `src/data/lock-reasons.ts` ; maintenance et mise à jour répondent « 503 » aux moteurs de recherche) ;
  l'administrateur connecté aussi, mais il peut consulter le site via « Voir le site en aperçu » sur cette page ;
- **changer l'adresse du siège** : pied de page, contact, carte (coordonnées recalculées via
  OpenStreetMap), offres d'emploi, mentions légales et confidentialité ;
- **créer, modifier et supprimer les offres d'emploi** de l'onglet Carrières. Sans offre, les mentions
  « On recrute » disparaissent et seule la candidature spontanée reste proposée.

- **Le mot de passe** est la variable d'environnement `SITE_PASSWORD` : fichier `.env` en local
  (jamais versionné), réglages du projet sur Vercel en ligne. Il n'est écrit nulle part dans le code.
  Le changer déconnecte toutes les sessions d'administration.
- **Les données** (verrou, adresse, offres) sont dans **Upstash Redis** (`src/lib/store.ts`) :
  Vercel → projet → Storage → Upstash for Redis, relié au projet, qui ajoute `KV_REST_API_URL` et
  `KV_REST_API_TOKEN`. Sans base configurée (en local), elles sont gardées en mémoire et perdues au
  redémarrage ; l'administration l'indique. Tant que rien n'a été enregistré, les valeurs de
  `src/data/site.ts` et `src/data/content.ts` servent de départ (site verrouillé par défaut).
- **Base injoignable** : le site reste fermé au public plutôt que d'afficher une erreur.
- La vérification se fait côté serveur (`src/lib/middleware.ts` et `src/lib/access.ts`). Le cookie
  d'administration contient une signature du mot de passe, pas le mot de passe lui-même.
- Restent publics : les fichiers statiques (CSS, JS, polices, logo).
- Les formulaires (`/api/*`) suivent le verrou : site verrouillé, ils répondent `401`.
- Le dossier du projet contient une apostrophe (« de l'entreprise ») qu'Astro ne gère pas pour
  `src/middleware.ts` : le middleware est donc branché dans `astro.config.mjs` via un alias.

## Pages

| URL | Contenu |
|:--|:--|
| `/` | Accueil : hero, services, chiffres, réalisations, méthode, avis, recrutement |
| `/agence` | Histoire, valeurs, équipe, carte |
| `/services` | Détail des 5 services, méthode, FAQ clients |
| `/realisations` | Projets clients (avec filtres) et témoignages ; message d'attente tant qu'il n'y en a pas |
| `/carrieres` | Espace recrutement : offres, avantages, journée type, processus, FAQ |
| `/carrieres/developpeur-web-junior` | Fiche de poste + candidature en 3 étapes |
| `/carrieres/candidature-spontanee` | Candidature spontanée |
| `/contact` | Formulaire de contact |
| `/mentions-legales` | Éditeur, hébergeur, propriété intellectuelle (alimentées par `site.ts`) |
| `/confidentialite` | Politique de confidentialité (RGPD) |
| `/404` | Page introuvable |
| `/verrouillage` | Saisie du mot de passe (seule page accessible sans accès) |

## Modifier les contenus

Tous les textes sont centralisés, pas besoin de toucher aux pages :

- `src/data/site.ts` : coordonnées, fondateur, **identité légale** (`legal`), hébergeur, menu.
- `src/data/content.ts` : services, méthode, réalisations, avis, offres d'emploi, avantages, FAQ.

**Ajouter une réalisation** : un objet dans `projects` (`content.ts`), uniquement des projets réels
publiés avec l'accord du client. La page Réalisations, sa place dans le menu et la section de
l'accueil apparaissent automatiquement dès le premier projet ; les témoignages aussi.

**Ajouter une offre d'emploi** : ajouter un objet dans `openings` (`content.ts`). Sa page
`/carrieres/<slug>` est générée automatiquement, avec ses données structurées `JobPosting`
(référencement Google Jobs).

## Structure

```text
docs/             éléments officiels à fournir ; archives/ : brief initial du job dating
public/
└── favicon-pack/ logo et icônes
src/
├── components/   Logo, Header, Footer, ApplyForm, ProjectCard, Steps, Faq…
├── data/         contenus du site
├── layouts/      BaseLayout (balises <head>, en-tête, pied de page)
├── lib/          middleware.ts + access.ts (verrou), forms.ts (envoi des formulaires)
├── pages/        une page = un fichier ; api/ : réception des formulaires
├── scripts/      main.ts (menu mobile, animations, formulaires, filtres)
└── styles/       global.css (charte : ivoire, anthracite, bleu du logo, ambre)
```

## Logo & icônes

Le symbole officiel est dans `public/favicon-pack/` (icônes d'onglet, icône Apple, manifeste).
Le composant `src/components/Logo.astro` l'associe au logotype « NovaForge Studio » écrit en texte.

## Formulaires

Contact et candidatures sont envoyés par e-mail via [Resend](https://resend.com)
(`src/pages/api/contact.ts`, `src/pages/api/candidature.ts`, `src/lib/forms.ts`) :

- contact → `site.email` ; candidature → `site.jobsEmail`, avec le CV en pièce jointe (4 Mo max.) ;
- l'adresse du visiteur est en « Répondre à » : il suffit de répondre à l'e-mail reçu ;
- un champ invisible piège les robots ; les champs sont revérifiés côté serveur ;
- **tant que `RESEND_API_KEY` et `MAIL_FROM` ne sont pas configurés**, rien n'est envoyé et le
  formulaire invite le visiteur à écrire directement à l'adresse e-mail.

## Carte

Carte interactive (Leaflet + OpenStreetMap, sans clé d'API) sur les pages L'agence et Contact,
centrée sur le 6 rue Blaise Pascal, Neuville-en-Ferrain.
L'adresse se change dans `/administration` (coordonnées de la carte recalculées automatiquement). Elle nécessite une connexion internet ;
hors ligne, l'adresse reste affichée.

## Mise en ligne

Le site est déployé sur Vercel à chaque push sur `main` (adaptateur `@astrojs/vercel`, rendu serveur).
Avant le premier déploiement : **Vercel → projet → Settings → Environment Variables**, ajouter
`SITE_PASSWORD` (environnements Production et Preview), puis **Storage → Upstash for Redis** relié au
projet, et redéployer. Pour activer les formulaires : `RESEND_API_KEY` et `MAIL_FROM` (voir `.env.example`).
