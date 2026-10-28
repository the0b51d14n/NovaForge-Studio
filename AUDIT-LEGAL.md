# Audit juridique du site NovaForge Studio

- **Date de l'audit** : 28 octobre 2026
- **Site** : https://nova-forge-studio-lyart.vercel.app/ (Astro 7, rendu serveur, hébergé sur Vercel)
- **Nature du document** : audit technique et rédactionnel, réalisé sans avis d'un professionnel du droit. Il corrige
  les problèmes démontrables et liste les décisions restantes. **Il ne certifie pas la conformité du site.**

## 1. Situation de départ (faits constatés dans le dépôt)

| Fait | Source dans le dépôt | Statut |
|:--|:--|:--|
| Aucune identité légale renseignée (dénomination, forme, SIREN, SIRET, RCS, TVA, APE, directeur de publication) | `src/data/site.ts` (`legal` : toutes les valeurs à `null`) | Confirmé |
| Nom du fondateur non renseigné | `src/data/site.ts` (`founder.name = null`) | Confirmé |
| « NovaForge Studio » est un nom commercial ; le projet est « en cours de structuration » | Brief du propriétaire (28/10/2026) | Confirmé |
| Aucune preuve d'immatriculation, ni en cours ni réalisée | Dépôt et documentation | Confirmé : rien ne permet de l'affirmer |
| Parcours client : prise de contact puis devis. Pas de commande, de paiement ni de signature en ligne | `src/pages/contact.astro`, `src/pages/api/contact.ts` | Confirmé |
| Clientèle visée : TPE, PME, jeunes entreprises (professionnels) | `src/data/site.ts` (`description`), pages Services | Déclaré sur le site, à confirmer |
| Formulaires : données envoyées par e-mail via Resend, **rien n'est stocké** par le site | `src/lib/forms.ts`, `src/pages/api/*.ts` | Confirmé dans le code |
| Envoi d'e-mails actif seulement si `RESEND_API_KEY` et `MAIL_FROM` sont configurés | `src/lib/forms.ts` | Configuration en production **non vérifiable** depuis le dépôt |
| Réglages du site (verrou, adresse, fermetures, offres) stockés dans Upstash Redis | `src/lib/store.ts` | Confirmé (aucune donnée de visiteur) |
| Adresse enregistrée en production : 44 rue des Montagnards, 59800 Lille ; adresse par défaut du code : 6 rue Blaise Pascal, 59960 Neuville-en-Ferrain | Base Upstash (lecture du 28/10) et `src/data/site.ts` | **Incohérence** à trancher |

## 2. Périmètre audité

- **Pages** (`src/pages`) : accueil, L'agence, Services, Réalisations (masquée sans projet), Contact, Carrières,
  offre `carrieres/[slug]`, candidature spontanée, mentions légales, confidentialité, page de verrouillage, 404,
  administration (privée).
- **API** : `/api/contact`, `/api/candidature`, `/api/version`.
- **Composants** : `Footer`, `Header`, `HiringBanner`, `ApplyForm`, `OfficeMap`, `DirectionsPicker`, `OpeningHours`,
  `BaseLayout`.
- **Logique serveur** : `src/lib/middleware.ts`, `access.ts`, `store.ts`, `forms.ts`, `hours.ts`.
- **Navigateur** : `src/scripts/main.ts`, `src/scripts/live.ts`.
- **Services externes** :
  - Vercel (hébergement) ;
  - Resend (e-mails) ;
  - Upstash (réglages) ;
  - OpenStreetMap (tuiles de carte) ;
  - Nominatim (géocodage, depuis l'administration uniquement) ;
  - liens Google Maps, Apple Plans et Waze, ouverts seulement au clic.
- **Contenus** : `src/data/content.ts` (offre, avantages, politique de travail), `docs/`.
- **Hors périmètre** : `docs/archives/brief-job-dating.md` (non publié), et les documents commerciaux et factures,
  qui n'existent pas dans le dépôt.

## 3. Anomalies

Gravité : **B** bloquant · **I** important · **A** amélioration.

| # | Gravité | Anomalie | Statut |
|:--|:--|:--|:--|
| 1 | B | Les mentions légales affichaient « SIREN : En cours d'immatriculation » sans preuve | Corrigé dans le code |
| 2 | B | Identité de l'éditeur absente (LCEN art. 1-1 I : nom, adresse et téléphone de la personne physique, ou dénomination et siège de la société). Le nom commercial était présenté comme « Dénomination » et l'adresse comme « Siège social » | Libellés corrigés dans le code. **Identité : à confirmer par le propriétaire** |
| 3 | B | Directeur de la publication non nommé (remplacé par « le représentant légal de NovaForge Studio ») | Affiché « À compléter » dans le code. **À confirmer par le propriétaire** |
| 4 | B | Les pages légales étaient inaccessibles quand le site est verrouillé (redirection vers `/verrouillage`) | Corrigé dans le code : accessibles en permanence, et liens ajoutés sur la page de verrouillage |
| 5 | I | Téléphone de l'hébergeur exigé (LCEN art. 1-1 I 4°), non publié par Vercel | Affiché « À compléter ». **Action administrative externe** : le demander à Vercel |
| 6 | I | Prestataire de stockage Upstash non mentionné (LCEN art. 1-1 I 5° : nom et adresse) | Nom ajouté dans le code. **Adresse à confirmer par le propriétaire** ; applicabilité à valider par un professionnel du droit |
| 7 | I | Formulaire de contact : case de consentement **obligatoire**, alors que la réponse repose sur les mesures précontractuelles ou l'intérêt légitime | Corrigé dans le code : mention d'information sans case, et le serveur ne l'exige plus |
| 8 | I | Candidature : case de consentement obligatoire, sans distinction entre le recrutement en cours et la conservation pour d'autres postes | Corrigé dans le code : mention d'information, plus une case **facultative et décochée** « conserver 2 ans ». Le choix figure dans l'e-mail reçu |
| 9 | I | Politique de confidentialité générique : bases légales incomplètes, prestataires non nommés, garanties de transfert affirmées sans preuve, stockage de session non mentionné, carte de la page L'agence oubliée | Corrigé dans le code (réécrite d'après le code réel) |
| 10 | I | Responsable du traitement désigné par le nom commercial | Corrigé dans le code (personne physique ou société dès qu'elle est renseignée). **Identité à confirmer** |
| 11 | I | Offre d'emploi présentée comme ouverte, alors qu'aucun employeur n'est identifié. Données Google Jobs (`JobPosting`) publiées | Corrigé dans le code : avertissement « Recrutements en préparation » sur les 3 pages Carrières, et `JobPosting` publié seulement si un SIREN est renseigné. **Statut réel du recrutement à confirmer** |
| 12 | I | Conditions annoncées non confirmées : salaire ~30 000 €, tickets restaurant, budget formation, prime, révision à 6 mois | Présentées comme prévisionnelles par l'avertissement. **À confirmer par le propriétaire** |
| 13 | I | Incohérence d'adresse : Lille en production, Neuville-en-Ferrain dans le code, l'offre et la documentation ; « aux portes de Tourcoing » sur L'agence | Textes rendus génériques dans le code (avantages, page L'agence, perks de l'offre). **Adresse réelle à confirmer** ; le lieu de l'offre enregistrée se corrige depuis l'administration |
| 14 | I | L'envoi des formulaires dépend de Resend et du domaine `novaforge-studio.fr`, non confirmés | **À confirmer par le propriétaire** (variables Vercel, domaine, boîte de réception) |
| 15 | I | Aucune condition de prestation (CGV) pour une activité de vente de services aux professionnels | Brouillon préparé : `docs/brouillons-commerciaux.md`. **À valider par un professionnel du droit** |
| 16 | I | Facturation électronique : réception obligatoire pour toutes les entreprises depuis le 1er septembre 2026, émission pour les TPE et PME au 1er septembre 2027 (sources non officielles) | **Action administrative externe** dès l'immatriculation (plateforme agréée). Calendrier à vérifier sur impots.gouv.fr |
| 17 | I | Politique de travail : le télétravail suppose un accord ou une charte (C. trav. L1222-9) ; droit à la déconnexion ; convention collective applicable non déterminée | Mention de formalisation déjà présente sur la page Carrières. **À valider par un professionnel du droit** |
| 18 | A | Délais de réponse présentés comme garantis (48 h ouvrées, 1 semaine) | Corrigé dans le code (« en général », « environ », « délai visé ») |
| 19 | A | Un journal d'erreur pouvait recopier la réponse de Resend, qui peut contenir des adresses e-mail | Corrigé dans le code (statut HTTP seul) |
| 20 | A | Test pratique de 2 à 3 h à domicile : sujet et réutilisation des résultats non précisés | **À confirmer par le propriétaire** (s'engager sur un sujet fictif, jamais réutilisé) |
| 21 | A | Icônes SVG de `Icon.astro` : origine et licence non documentées | **À confirmer par le propriétaire** |
| 22 | A | Bandeau « On recrute » (menu, accueil) maintenu pendant le pré-lancement | Conservé, car l'avertissement figure sur les pages Carrières. **À confirmer par le propriétaire** |
| 23 | — | Bannière de cookies | **Non applicable** : aucun cookie déposé chez les visiteurs ; stockage de session technique sans identifiant ; cookies d'administration nécessaires à l'authentification ; aucune mesure d'audience. Tuiles OpenStreetMap vérifiées : pas de `Set-Cookie` |
| 24 | — | Droit de rétractation et médiateur de la consommation | **Non applicable** si la clientèle est exclusivement professionnelle. **À confirmer** : si des particuliers peuvent commander, ces obligations s'appliquent |
| 25 | — | « Premier rendez-vous et devis gratuits » | Engagement commercial choisi par le propriétaire, conservé. À reprendre dans les futures conditions de prestation |

## 4. Modifications réalisées

| Fichier | Modification |
|:--|:--|
| `src/pages/mentions-legales.astro` | Réécrite :<br>• éditeur personne physique ou société selon les données ;<br>• nom commercial distinct ;<br>• « À compléter » au lieu de valeurs inventées ;<br>• bandeau « en cours de finalisation » ;<br>• hébergeur détaillé ;<br>• stockage Upstash ;<br>• propriété intellectuelle et crédits (Astro, Leaflet, OpenStreetMap/ODbL, polices OFL) |
| `src/pages/confidentialite.astro` | Réécrite d'après le code :<br>• un bloc par traitement (données obligatoires et facultatives, finalité, base légale, durée) ;<br>• prestataires nommés ;<br>• transferts vers les États-Unis et adhésion déclarée au DPF ;<br>• cookies et stockage de session ;<br>• services tiers ;<br>• droits et réclamation CNIL |
| `src/data/site.ts` | Hébergeur : adresse vérifiée, téléphone `null`. Ajout de `storage` (Upstash) |
| `src/lib/middleware.ts` | `/mentions-legales` et `/confidentialite` restent accessibles quand le site est verrouillé |
| `src/pages/verrouillage.astro` | Liens vers les deux pages légales |
| `src/pages/contact.astro`, `src/pages/api/contact.ts` | Case de consentement remplacée par une mention d'information. Le serveur ne l'exige plus |
| `src/components/ApplyForm.astro`, `src/pages/api/candidature.ts` | Mention d'information, case facultative « vivier » décochée et transmise dans l'e-mail. Délai présenté comme approximatif |
| `src/components/PrelaunchNotice.astro` (nouveau) | Avertissement « Recrutements en préparation », affiché tant qu'aucun SIREN n'est renseigné |
| `src/pages/carrieres/index.astro`, `[slug].astro`, `candidature-spontanee.astro` | Avertissement, `JobPosting` conditionné au SIREN, délais nuancés |
| `src/data/content.ts`, `src/pages/agence.astro` | Lieu rendu générique, délai de réponse « visé » |
| `src/pages/index.astro` | Statistique « 48 h » présentée comme délai habituel |
| `src/lib/forms.ts` | Journaux sans données personnelles |
| `src/styles/global.css` | Styles des avertissements et des mentions de formulaire |
| `docs/brouillons-commerciaux.md` (nouveau), `docs/elements-a-fournir.md` | Brouillons de documents commerciaux, liste des éléments à fournir mise à jour |

## 5. Informations manquantes

| Information | Utilité |
|:--|:--|
| **Statut juridique** choisi (entreprise individuelle, micro-entreprise, SASU, EURL…) et date d'immatriculation | Détermine les mentions obligatoires, l'émetteur des devis et factures, l'employeur des futurs salariés |
| **Nom et prénom** de l'exploitant (personne physique) ou **dénomination sociale** | Mentions légales (éditeur), responsable du traitement, directeur de publication |
| **Adresse de l'éditeur** : domicile ou siège ; Lille ou Neuville-en-Ferrain | Mentions légales, politique de confidentialité, offre d'emploi, carte |
| **Directeur de la publication** | Mentions légales (LCEN art. 1-1 I 3°) |
| **SIREN, SIRET, RCS ou RNE, TVA, APE, capital** (après immatriculation) | Mentions légales, devis, factures ; leur saisie active aussi `JobPosting` et retire l'avertissement de pré-lancement |
| **Téléphone de Vercel** | Mentions légales (art. 1-1 I 4°) |
| **Adresse postale d'Upstash** | Mentions légales (art. 1-1 I 5°) |
| **Nom de domaine et messagerie** de `contact@` et `recrutement@novaforge-studio.fr` | Fonctionnement des formulaires, prestataire à citer dans la politique |
| **Configuration de Resend** en production (`RESEND_API_KEY`, `MAIL_FROM`) | Savoir si les formulaires transmettent réellement des données |
| **Clientèle** : uniquement des professionnels, ou aussi des particuliers ? | Rétractation, médiateur de la consommation, contenu des CGV |
| **Conditions de l'offre d'emploi** confirmées (salaire, avantages, date, contrat) | Retrait de la mention « prévisionnel » |
| **Convention collective** visée (probablement Syntec, IDCC 1486, à vérifier selon le code APE) | Durée du travail, salaires minima, télétravail |

## 6. Sources officielles consultées

| Source | Résultat |
|:--|:--|
| [Légifrance, LCEN, art. 1-1](https://www.legifrance.gouv.fr/loda/article_lc/LEGIARTI000049568614/2026-10-28) (version en vigueur au 28/10/2026) | Identification de l'éditeur, du directeur de la publication, de l'hébergeur (nom, adresse, **téléphone**) et du prestataire de stockage (nom, adresse) |
| [Légifrance, LCEN, art. 6](https://www.legifrance.gouv.fr/loda/article_lc/LEGIARTI000042038977) (modifié par la loi n° 2026-813 du 24 août 2026) | Renvoie aux conditions d'identification de l'art. 1-1 |
| [CNIL, Cookies : que dit la loi ?](https://www.cnil.fr/fr/cookies-et-autres-traceurs/regles/cookies/que-dit-la-loi) | Liste des traceurs exemptés (authentification, préférences d'interface, équilibrage de charge…) |
| [CNIL, Exemples de formulaires de collecte](https://www.cnil.fr/fr/exemples-de-formulaire-de-collecte-de-donnees-caractere-personnel) | Contenu de la mention d'information, distinction entre champs obligatoires et facultatifs |
| [CNIL, Guide du recrutement](https://www.cnil.fr/fr/le-guide-du-recrutement) | Données strictement nécessaires, durée de conservation définie à l'avance |
| [CNIL, Référentiel RH (avril 2026)](https://www.cnil.fr/sites/default/files/2026-04/referentiel_durees_de_conservation_gestion_des_ressources_humaines.pdf) | Téléchargé mais **illisible par l'outil** : la durée de 2 ans reste à vérifier dans le référentiel |
| [Vercel, Privacy Policy (1er juin 2026)](https://vercel.com/legal/privacy-policy) | Adresse de Vercel Inc., adhésion au Data Privacy Framework, **aucun téléphone publié** |
| [Resend, Data Privacy Framework Certification](https://resend.com/changelog/data-privacy-framework-certification) | Adhésion déclarée au DPF (annonce de mars 2025), à revérifier sur dataprivacyframework.gov |
| [Ministère de l'Économie, Mentions sur votre site](https://www.economie.gouv.fr/entreprises/developper-son-entreprise/innover-et-numeriser-son-entreprise/mentions-sur-votre-site-internet-les-obligations-respecter) | **Non consulté** : accès automatique refusé (HTTP 403) |
| Facturation électronique ([Cegid](https://www.cegid.com/fr/facture-electronique-obligatoire/calendrier-facture-electronique/), [La Poste](https://www.laposte.fr/entreprise-collectivites/actualites/calendrier-dematerialisation-factures-en-est-votre-entreprise)) | **Sources non officielles** : calendrier à confirmer sur impots.gouv.fr |

## 7. Contrôles techniques réalisés

| Contrôle | Résultat |
|:--|:--|
| Build de production (`astro build`) | Réussi |
| Linter, vérification de types, tests | **Aucun configuré dans le projet.** `astro check` demande d'installer `@astrojs/check` : non installé, pour ne pas ajouter de dépendance sans accord |
| Pages légales, site verrouillé, en visiteur anonyme (copie isolée sans `.env`) | `/mentions-legales` et `/confidentialite` répondent 200 ; les autres pages redirigent vers `/verrouillage`, qui contient les liens |
| Formulaire de contact sans case | Accepté. Il répond « indisponible » parce que l'e-mail n'est pas configuré en test. Un e-mail invalide est refusé (400) |
| Candidature sans case, avec CV | Accepté (« indisponible », même raison) |
| Case « vivier » | Présente, décochée par défaut |
| `JobPosting` sur l'offre | Absent tant qu'aucun SIREN n'est renseigné |
| Avertissement de pré-lancement | Présent sur les 3 pages Carrières |
| Rendu des pages | Mentions légales vues sur ordinateur, offre d'emploi vue sur mobile (390 px), sans débordement horizontal |
| Cookies | Aucun `Set-Cookie`, ni sur le site en ligne ni sur une tuile OpenStreetMap ; stockage navigateur limité à `sessionStorage` (`live.ts`) |
| **Non vérifié** | Envoi réel des e-mails (clé Resend absente en test) ; ces changements en production (non déployés à la date de l'audit) ; console navigateur page par page ; contenu des offres enregistrées dans la base de production |

## 8. Avant de présenter le site comme prêt pour une activité commerciale ou un recrutement

1. Choisir le statut juridique et **s'immatriculer** (action administrative externe), puis renseigner `legal` et
   `founder` dans `src/data/site.ts`.
2. Renseigner le **directeur de la publication**, le **téléphone de Vercel** et l'**adresse d'Upstash** : le bandeau
   « en cours de finalisation » disparaît alors.
3. Trancher l'**adresse** (domicile ou local, Lille ou Neuville-en-Ferrain) et la corriger dans l'administration,
   l'offre et `site.ts`.
4. Configurer l'envoi des formulaires (domaine, Resend, boîtes de réception) et **tester un envoi réel**.
5. Faire valider la politique de confidentialité et les durées de conservation (**professionnel du droit** ou DPO
   externe).
6. Finaliser les **conditions de prestation, le modèle de devis et le contrat** à partir de
   `docs/brouillons-commerciaux.md` (**professionnel du droit**).
7. Avant toute embauche :
   - confirmer les conditions de l'offre ;
   - identifier la convention collective ;
   - rédiger le contrat de travail et la charte de télétravail ;
   - organiser la déconnexion (**professionnel du droit**).
8. Après l'immatriculation : s'équiper pour la **facturation électronique** (réception dès maintenant, émission au
   1er septembre 2027 pour une TPE, à vérifier).
