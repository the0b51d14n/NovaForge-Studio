# NovaForge Studio — site vitrine

Site de l'agence digitale **fictive** NovaForge Studio (Lille), réalisé pour le TP job dating.
Construit avec [Astro](https://astro.build) : site statique, rapide, sans base de données.

La fiche de l'entreprise (rémunération, processus de recrutement, arguments, FAQ candidats,
présentation orale) est dans [`docs/info-entreprise-fictive.md`](docs/info-entreprise-fictive.md) :
c'est la source des contenus du site.

## Lancer le site

```sh
npm install        # une seule fois
npm run dev        # développement → http://localhost:1024
npm run build      # génère le site final dans dist/
npm run preview    # aperçu du site final → http://localhost:1026
```

Les polices sont intégrées au projet : le site fonctionne même sans connexion internet.

## Pages

| URL | Contenu |
|:--|:--|
| `/` | Accueil : hero, services, chiffres, réalisations, méthode, avis, recrutement |
| `/agence` | Histoire, valeurs, équipe, lieu |
| `/services` | Détail des 5 services, méthode, FAQ clients |
| `/realisations` | Projets clients (avec filtres) et témoignages |
| `/carrieres` | Espace recrutement : offres, avantages, journée type, processus, FAQ |
| `/carrieres/developpeur-web-junior` | Fiche de poste + candidature en 3 étapes |
| `/carrieres/candidature-spontanee` | Candidature spontanée |
| `/contact` | Formulaire de contact |
| `/mentions-legales`, `/404` | Pages annexes |

## Modifier les contenus

Tous les textes sont centralisés, pas besoin de toucher aux pages :

- `src/data/site.ts` : nom, adresse, e-mails, menu.
- `src/data/content.ts` : services, méthode, réalisations, avis, offres d'emploi, avantages, FAQ.

**Ajouter une offre d'emploi** : ajouter un objet dans `openings` (`content.ts`). Sa page
`/carrieres/<slug>` est générée automatiquement, avec ses données structurées `JobPosting`
(référencement Google Jobs).

## Structure

```text
docs/             fiche de l'entreprise fictive (brief du TP)
public/
└── favicon-pack/ logo et icônes
src/
├── assets/       photos des bureaux
├── components/   Logo, Header, Footer, ApplyForm, ProjectCard, Steps, Faq…
├── data/         contenus du site
├── layouts/      BaseLayout (balises <head>, en-tête, pied de page)
├── pages/        une page = un fichier
├── scripts/      main.ts (menu mobile, animations, formulaires, filtres)
└── styles/       global.css (charte : ivoire, anthracite, bleu du logo, ambre)
```

## Logo & icônes

Le symbole officiel est dans `public/favicon-pack/` (icônes d'onglet, icône Apple, manifeste).
Le composant `src/components/Logo.astro` l'associe au logotype « NovaForge Studio » écrit en texte.

## Photos des bureaux

Déposer les photos dans **`src/assets/bureaux/`** (JPG, PNG ou WebP) : elles apparaissent
automatiquement dans la galerie des pages L'agence et Carrières, compressées et redimensionnées.
Les espaces actuels ont leurs titres et descriptions dans `src/data/office.ts` : `bureau`, `accueil`,
`reunion` et `pause` forment la galerie ; `rdv` (salle client) est réservée à l'en-tête de « L'agence »
et à la page Contact (`gallery: false`). Pour une autre photo, le nom du fichier sert de légende.
Voir `src/assets/bureaux/LISEZ-MOI.txt`.

## Carte

Carte interactive (Leaflet + OpenStreetMap, sans clé d'API) sur les pages L'agence et Contact.
L'adresse et les coordonnées sont dans `src/data/site.ts`. Elle nécessite une connexion internet ;
hors ligne, l'adresse reste affichée.

## Mise en ligne

Le dossier `dist/` (créé par `npm run build`) peut être publié tel quel sur Vercel, Netlify ou
GitHub Pages.

---

*Entreprise fictive — site réalisé dans le cadre d'un exercice pédagogique. Les formulaires sont
démonstratifs : aucune donnée n'est envoyée.*
