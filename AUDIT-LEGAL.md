# Audit juridique du site NovaForge Studio

- **Site** : https://nova-forge-studio-lyart.vercel.app/ (Astro 7, rendu serveur, hébergé sur Vercel)
- **Phase 1** : 28 octobre 2026, commit `4a50bb5` (mentions légales, confidentialité, formulaires, recrutement)
- **Phase 2** : 28 octobre 2026, après les réponses du propriétaire. Modifications **non commitées et non
  déployées** à la date du rapport, sur instruction du propriétaire.
- **Nature du document** : audit technique et rédactionnel, réalisé sans avis d'un professionnel du droit. Il corrige
  les problèmes démontrables et rend explicites les décisions restantes. **Il ne certifie pas la conformité du site,
  et un build réussi ne vaut pas conformité.**

## 0. Phase 3 (28/10/2026) : documentation de lancement

### Résumé exécutif

Le site est cohérent avec un **projet en pré-lancement non immatriculé** (phases 1 et 2). La phase 3 ajoute une
documentation interne de lancement de 33 fichiers sous `docs/`, non publiée sur le site. Elle couvre :

- le statut juridique (comparaison neutre, recommandation provisoire) et les décisions à prendre ;
- les mentions légales, le registre des traitements, les sous-traitants, les cookies ;
- les contrats pour particuliers et professionnels, les clients particuliers, la propriété intellectuelle ;
- le catalogue des prestations, le processus client, les conditions commerciales à fixer ;
- l'organisation, la politique de travail, le recrutement futur et les associés ;
- le budget et les seuils de décision ;
- la technique (architecture, **administration du site**, sécurité, exploitation) et des modèles internes.

**Aucun code du site n'a été modifié en phase 3.** Rien n'est validé par un professionnel, et le site n'est pas
déclaré conforme.

### État initial de la phase 3

- **Git** : branche `main`, 1 commit non poussé (`4a50bb5`), modifications de la phase 2 non commitées.
- **Documents existants** : `AUDIT-LEGAL.md`, `docs/brouillons-commerciaux.md`, `docs/elements-a-fournir.md`,
  `docs/archives/`. Tous conservés.

### Fichiers créés (phase 3)

Tous en Markdown :

- `docs/README.md` ;
- `docs/audit-site.md` ;
- `docs/lancement/` : `statut-juridique.md`, `decisions-a-prendre.md`, `checklist-lancement.md` ;
- `docs/juridique/` : `mentions-legales.md`, `registre-traitements.md`, `sous-traitants-et-transferts.md`,
  `cookies-et-traceurs.md`, `contrats-et-cgv.md`, `consommateurs.md`, `propriete-intellectuelle.md`,
  `points-a-valider.md` ;
- `docs/commercial/` : `catalogue-prestations.md`, `processus-client.md`, `conditions-commerciales.md`,
  `maintenance-et-support.md` ;
- `docs/organisation/` : `organisation-interne.md`, `politique-de-travail.md`, `recrutement-futur.md`,
  `politique-associes.md` ;
- `docs/finance/` : `budget-previsionnel.md`, `seuils-de-decision.md` ;
- `docs/technique/` : `architecture.md`, `administration.md`, `securite.md`, `exploitation.md` ;
- `docs/modeles/` : `cadrage-client.md`, `proposition-et-devis.md`, `recette-et-livraison.md`,
  `changement-de-perimetre.md`, `compte-rendu.md`, `fiche-incident.md`.

Choix de structure : les fichiers proposés mais redondants ont été regroupés pour éviter les doublons.
- rétractation et médiation → `consommateurs.md` ;
- grille tarifaire → `conditions-commerciales.md` ;
- vision, organisation et rôles → `organisation-interne.md` ;
- déploiement, variables, sauvegardes et incidents → `exploitation.md`.

Les trames de conditions générales et de contrats restent dans `docs/brouillons-commerciaux.md`.

### Fichiers modifiés (phase 3)

`AUDIT-LEGAL.md` (cette section).

### Contrôles

| Contrôle | Résultat |
|:--|:--|
| Liens internes de `docs/` | Aucun lien cassé (vérification par script) |
| Build de production | Réussi |
| Documents internes exposés ? | Non : aucun `.md` dans `dist/` ; `public/` ne contient que les favicons |
| Secrets dans le dépôt suivi | Aucun motif de clé trouvé ; `.env` ignoré |
| `npm audit --omit=dev` | **8 vulnérabilités de gravité élevée**, toutes transitives via `@astrojs/vercel` (`path-to-regexp`, `zod`, `undici`, `@vercel/*`). Correctif disponible, **non appliqué** (changement de dépendances soumis à accord) |
| Linter, types, tests | Aucun configuré |
| Non exécuté | Envoi réel d'e-mails, contrôle en production, test d'intrusion, revue des comptes Vercel et Upstash, URSSAF (page injoignable lors de la consultation) |

### Risques ouverts

**P0 (bloquant)** :
1. Statut juridique et immatriculation.
2. Adresse et domiciliation (exacte, statut, publication).
3. Moyen de contact écrit (messagerie inexistante) pour les droits RGPD et les réclamations.
4. Conditions générales et médiateur avant toute vente à un particulier.
5. Téléphone de Vercel absent des mentions légales.

**P1 (avant l'activité concernée)** :
6. Vulnérabilités de dépendances (`npm audit fix`, puis build et test).
7. MFA sur GitHub, Vercel, Upstash et messagerie.
8. Adresse d'Upstash.
9. DPA des prestataires.
10. Procédure manuelle de suppression des données.
11. Assurance responsabilité civile professionnelle.
12. Validation des clauses de propriété intellectuelle.
13. Offres prévisionnelles stockées dans l'administration à revoir.
14. Récit « freelance » et horaires de la page Contact à confirmer.

**P2 (à planifier)** :
15. Limitation des tentatives de connexion et comptes nominatifs pour l'administration.
16. En-têtes de sécurité et CSP.
17. Sauvegarde des réglages Upstash.
18. Drapeaux de lancement pilotables depuis l'administration.
19. Protection de la branche `main`.

### Décisions du propriétaire

Voir [docs/lancement/decisions-a-prendre.md](docs/lancement/decisions-a-prendre.md) (18 décisions).

### Professionnels à consulter

Voir [docs/juridique/points-a-valider.md](docs/juridique/points-a-valider.md) :
- **expert-comptable** (statut, TVA, budget) ;
- **juriste** (mentions légales, conditions générales, propriété intellectuelle, RGPD, droit social, statuts) ;
- **assureur**.

### Checklist avant publication des pages juridiques définitives

- [ ] Adresse confirmée, et décision de publication prise.
- [ ] Moyen de contact écrit opérationnel.
- [ ] Téléphone de Vercel et adresse d'Upstash renseignés.
- [ ] Après l'immatriculation : `legal` complété (SIREN, RNE ou RCS, TVA ou franchise).
- [ ] Politique de confidentialité relue (prestataires réels, durées, procédure de suppression).
- [ ] Relecture par un juriste.

### Checklist avant ouverture commerciale (`launch.commercial = true`)

- [ ] Immatriculation, compte bancaire, outil de facturation (facturation électronique).
- [ ] Assurance souscrite si retenue.
- [ ] Messagerie et formulaires testés (`launch.mailbox = true`).
- [ ] Conditions générales pour particuliers et pour professionnels, formulaire de rétractation, médiateur :
      validés et publiés.
- [ ] Grille tarifaire décidée ([docs/commercial/conditions-commerciales.md](docs/commercial/conditions-commerciales.md)).
- [ ] Vulnérabilités de dépendances corrigées, site vérifié en production.

### Checklist avant le premier contrat client

- [ ] Client qualifié (particulier ou professionnel).
- [ ] Cahier des besoins écrit.
- [ ] Devis conforme (mentions, prix TTC pour un particulier, validité).
- [ ] Particulier : information précontractuelle, rétractation, demande expresse si exécution anticipée.
- [ ] Clauses de propriété intellectuelle et accord de sous-traitance RGPD si des données sont traitées.
- [ ] Abonnements de tiers attribués (qui souscrit, qui paie).
- [ ] Assurance active.

### Checklist avant la première embauche

Voir [docs/organisation/recrutement-futur.md](docs/organisation/recrutement-futur.md). En résumé :
- seuil financier atteint ;
- structure immatriculée ;
- convention collective identifiée ;
- contrat et charte de télétravail rédigés avec un juriste ;
- DPAE, paie, santé au travail ;
- accès informatiques nominatifs ;
- données des candidats gérées ;
- offre revue dans l'administration ;
- `launch.recruitment = true`.

### État Git final et confirmation

- **État Git** : voir la fin de la phase 3 dans le compte rendu à l'utilisateur. Branche `main`, commit
  `4a50bb5` non poussé, modifications des phases 2 et 3 non commitées.
- **Aucun déploiement, aucun push et aucun commit** n'a été effectué pendant les phases 2 et 3. Aucun service
  externe n'a été activé. Aucun secret n'a été ajouté.

## 1. Situation confirmée par le propriétaire (phase 2)

| Point | Réponse du propriétaire | Conséquence sur le site |
|:--|:--|:--|
| Statut | Projet en pré-lancement, **non immatriculé** | Aucune dénomination, forme, SIREN, RNE, RCS, TVA ni capital affichés. Bandeau « projet en préparation » sur les pages publiques |
| Porteur du projet | **Théo ANDRIMANANARISOA** | Éditeur (personne physique), directeur de la publication et responsable du traitement (`legal.publisher`, `legal.director`) |
| Adresse | **Lille**. Adresse exacte, statut et modalités de publication à confirmer | Voir la section 4 |
| Messagerie professionnelle, Resend | **Pas configurés** | Adresses e-mail masquées, formulaires fermés, API refusées (`launch.mailbox = false`) |
| Clientèle envisagée | **Particuliers** (consommateurs) | Droit de la consommation applicable dès l'ouverture : voir la section 7 |
| Activité commerciale | **Pas encore ouverte** | Aucun devis ni prestation présentés comme disponibles (`launch.commercial = false`) |
| Recrutement | **Pas ouvert**, prévu plus tard | Pas d'offre, de formulaire, de salaire ni d'avantage affichés (`launch.recruitment = false`) |
| Rémunérations et avantages | Prévisionnels, à revoir | Retirés des pages publiques |

Ces trois drapeaux sont dans `src/data/site.ts` (`launch`). Ne les passer à `true` que lorsque la condition est
réellement remplie (voir les sections 9 et 10).

## 2. Périmètre audité

- **Pages** : accueil, L'agence, Services, Réalisations (masquée sans projet), Contact, Carrières, offre
  `carrieres/[slug]`, candidature spontanée, mentions légales, confidentialité, verrouillage, 404, administration
  (privée).
- **API** : `/api/contact`, `/api/candidature`, `/api/version`.
- **Composants** : `Header`, `Footer`, `HiringBanner`, `CtaBand`, `ApplyForm`, `PrelaunchNotice`, `OfficeMap`,
  `OpeningHours`, `BaseLayout`.
- **Logique** : `src/lib/middleware.ts`, `access.ts`, `store.ts`, `forms.ts`, `hours.ts` ; `src/scripts/main.ts` et
  `live.ts`.
- **Services externes** :
  - Vercel (hébergement) ;
  - Resend (e-mails, inactif) ;
  - Upstash (réglages de l'administration) ;
  - OpenStreetMap (tuiles de carte) ;
  - Nominatim (géocodage, depuis l'administration seulement) ;
  - liens Google Maps, Apple Plans et Waze, ouverts au clic seulement.
- **Documents** : `docs/brouillons-commerciaux.md`, `docs/elements-a-fournir.md`.

## 3. Anomalies et statut

Gravité : **B** bloquant · **I** important · **A** amélioration.

| # | Gravité | Anomalie | Statut |
|:--|:--|:--|:--|
| 1 | B | Mentions légales : « SIREN : En cours d'immatriculation » affirmé sans preuve | Corrigé dans le code (phase 1) |
| 2 | B | Éditeur non identifié, nom commercial présenté comme dénomination | Corrigé dans le code : éditeur personne physique « Théo ANDRIMANANARISOA », « Nom du projet : NovaForge Studio », statut « pas encore immatriculé, aucune activité commerciale ouverte » |
| 3 | B | Directeur de la publication non nommé | Corrigé dans le code (Théo ANDRIMANANARISOA) |
| 4 | B | Pages légales inaccessibles site verrouillé | Corrigé dans le code (phase 1) |
| 5 | B | Adresses `contact@` et `recrutement@novaforge-studio.fr` affichées (pied de page, contact, mentions, confidentialité, bandeau d'appel, offre) alors que la messagerie n'existe pas | Corrigé dans le code : masquées tant que `launch.mailbox` est faux |
| 6 | B | Formulaires actifs sans messagerie : données saisies pour rien, message d'échec renvoyant vers une adresse inexistante | Corrigé dans le code : formulaire de contact remplacé par « Le formulaire ouvre bientôt » et le téléphone. API refusées **avant lecture des données**. Message d'échec sans adresse e-mail |
| 7 | B | Recrutement présenté comme ouvert alors qu'il ne l'est pas : bandeaux « On recrute », offre, formulaire de candidature, salaire, avantages, données Google Jobs | Corrigé dans le code :<br>• « On recrute » masqué partout ;<br>• offre et candidature spontanée redirigées vers `/carrieres#recrutement` (prévisualisation réservée à l'administration) ;<br>• section « Des recrutements à venir » ;<br>• avantages, chiffres et question sur le salaire retirés ;<br>• `JobPosting` jamais publié tant que le recrutement est fermé |
| 8 | B | Prestations et devis présentés comme disponibles (« Démarrer un projet », « Demander un devis », « Premier rendez-vous et devis gratuits », « 48 h ») | Corrigé dans le code : bandeau « NovaForge Studio est un projet en préparation : les prestations ne sont pas encore ouvertes à la commande », boutons « Nous contacter », mentions de devis reportées à l'ouverture |
| 9 | B | **Moyen de contact écrit pour exercer ses droits RGPD** : seul le téléphone est disponible | **À confirmer par le propriétaire** : ouvrir une messagerie (ou indiquer une adresse postale) avant toute collecte de données |
| 10 | B | **Adresse de l'éditeur** : Lille déclarée, adresse exacte et statut (domicile ?) inconnus ; le code affiche l'adresse saisie dans l'administration | **À confirmer par le propriétaire**, voir la section 4 |
| 11 | I | Téléphone de l'hébergeur exigé (LCEN art. 1-1 I 4°), non publié par Vercel | **Action administrative externe** : le demander à Vercel. Affiché « À compléter » |
| 12 | I | Adresse d'Upstash (prestataire de stockage, LCEN art. 1-1 I 5°) | **À confirmer par le propriétaire**. Applicabilité **à valider par un professionnel du droit** |
| 13 | I | Politique de confidentialité à réaligner : formulaires fermés, contact sans e-mail, responsable du traitement | Corrigé dans le code :<br>• responsable identifié ;<br>• traitements qui subsistent décrits (journaux d'hébergement, carte, stockage de session) ;<br>• formulaires et candidatures marqués fermés ;<br>• droits exercés par téléphone en attendant la messagerie |
| 14 | I | Récit « développeur freelance qui accompagne ses clients » (accueil, L'agence, Carrières si recrutement ouvert) : il suppose une activité exercée | **À confirmer par le propriétaire** : vrai et passé, ou à reformuler (il n'a pas été réécrit) |
| 15 | I | Horaires d'ouverture et état « Ouvert / Fermé » sur la page Contact pour une activité non ouverte | Partiellement corrigé : libellé « Horaires prévus ». **À confirmer par le propriétaire** (les retirer, ou les présenter comme une disponibilité téléphonique) |
| 16 | I | Clientèle de particuliers : information précontractuelle, rétractation, médiateur | Pas d'activité commerciale ouverte. Liste de vérification en section 7. **À valider par un professionnel du droit** avant la première vente |
| 17 | I | Conditions de prestation, devis, contrats inexistants | Brouillons dans `docs/brouillons-commerciaux.md`, mis à jour pour une clientèle de consommateurs. **À valider par un professionnel du droit** |
| 18 | I | Facturation électronique : réception obligatoire depuis le 1er septembre 2026, émission au 1er septembre 2027 pour les TPE et PME (sources non officielles) | **Action administrative externe** après immatriculation. Calendrier à vérifier sur impots.gouv.fr |
| 19 | I | Politique de travail : télétravail (C. trav. L1222-9), déconnexion, convention collective | Corrigé dans le code : présentée comme des principes futurs, non contractuels. Modalités **à valider par un professionnel du droit** au moment des recrutements |
| 20 | A | Journaux d'erreur pouvant contenir des adresses e-mail | Corrigé dans le code (phase 1) |
| 21 | A | Délais de réponse présentés comme garantis | Corrigé dans le code. Masqués tant que l'activité n'est pas ouverte |
| 22 | A | Test pratique de 2 à 3 h, origine des icônes SVG | **À confirmer par le propriétaire** (avant l'ouverture du recrutement) |
| 23 | — | Bannière de cookies | **Non applicable** : aucun cookie chez les visiteurs ; stockage de session technique sans identifiant ; cookies d'administration nécessaires à l'authentification ; aucune mesure d'audience. Vérifié : pas de `Set-Cookie` sur le site ni sur les tuiles OpenStreetMap |
| 24 | — | Médiateur de la consommation, droit de rétractation | **Non applicable tant qu'aucune vente n'est proposée.** Deviendra obligatoire avant la première vente à un particulier (section 7) |

## 4. Adresse : état et décisions à prendre

- **Adresse utilisée par le code** :
  - la valeur saisie dans l'administration, stockée dans Upstash : « 44 rue des Montagnards, 59800 Lille » lors de
    la lecture du 28/10/2026 ;
  - à défaut, la valeur de secours de `src/data/site.ts` : « 6 rue Blaise Pascal, 59960 Neuville-en-Ferrain ».
- **Où elle est affichée** : pied de page, page Contact, carte (pages Contact et L'agence), mentions légales,
  politique de confidentialité. La phase 2 **n'a ajouté aucun nouvel affichage**.
- **À confirmer** : l'adresse exacte à Lille, son statut (domicile personnel, local, domiciliation) et le fait de la
  publier ou non sur les pages autres que légales.
- **Domiciliation à domicile** :
  - l'adresse personnelle devient publique (mentions légales, et registres après immatriculation) ;
  - le bail ou le règlement de copropriété peut limiter l'exercice d'une activité ou l'accueil de clients ;
  - les règles diffèrent selon le statut retenu.

  **À valider par un professionnel du droit.**
- **Autres options**, à comparer avant l'immatriculation :
  - société de domiciliation agréée (contrat de domiciliation) ;
  - local professionnel ;
  - pépinière ou couveuse d'entreprises.

  Aucune n'a été choisie à la place du propriétaire.
- **Site de présentation et site professionnel** : la LCEN (art. 1-1, II) permet à un éditeur **non professionnel** de
  ne publier que les coordonnées de son hébergeur. Un site qui prépare une activité commerciale relève plutôt du
  régime professionnel (art. 1-1, I : identité, adresse, téléphone). Les mentions actuelles suivent le régime
  professionnel, par prudence. **À valider par un professionnel du droit.**

## 5. Formulaires et e-mails : état réel (vérifié dans le code)

| Formulaire | Affiché ? | Données transmises ? | Stockées ? | Variables attendues |
|:--|:--|:--|:--|:--|
| Contact (`/contact`, `/api/contact`) | Non : remplacé par « Le formulaire ouvre bientôt » et le téléphone | Non : l'API répond 503 **avant** de lire la requête | Non | `launch.mailbox = true`, `RESEND_API_KEY`, `MAIL_FROM` |
| Candidature (offre, candidature spontanée, `/api/candidature`) | Non pour le public (redirection). Visible seulement en prévisualisation d'administration | Non : 503 avant lecture | Non | `launch.recruitment = true`, `launch.mailbox = true`, `RESEND_API_KEY`, `MAIL_FROM` |

- Messages d'échec sans adresse e-mail, et jamais de message de succès quand l'envoi n'a pas eu lieu.
- Aucun secret n'est présent dans le code ni dans ce rapport.
- **Réactivation** :
  1. créer la messagerie ;
  2. configurer Resend (domaine vérifié) sur Vercel ;
  3. passer `launch.mailbox` à `true` ;
  4. tester un envoi réel de bout en bout ;
  5. relire la politique de confidentialité.

## 6. Modifications réalisées

**Phase 1 (commit `4a50bb5`)** :
- mentions légales et politique de confidentialité réécrites ;
- cases de consentement obligatoires supprimées, case facultative pour conserver une candidature ;
- pages légales ouvertes même site verrouillé ;
- journaux sans données personnelles ;
- `docs/brouillons-commerciaux.md` créé.

**Phase 2 (non commitée)** :

| Fichier | Modification |
|:--|:--|
| `src/data/site.ts` | `legal.publisher` et `legal.director` (Théo ANDRIMANANARISOA), drapeaux `launch` (`commercial`, `recruitment`, `mailbox`) à `false` |
| `src/lib/store.ts` | `visibleOffers()` : aucune offre au public tant que le recrutement est fermé |
| `src/components/Header.astro`, `src/layouts/BaseLayout.astro`, `src/styles/global.css` | Bandeau « projet en préparation » intégré à l'en-tête (version courte sur mobile) |
| `src/components/Footer.astro`, `HiringBanner.astro`, `CtaBand.astro`, `ApplyForm.astro` | « On recrute » et adresses e-mail masqués, bandeau d'appel sans devis |
| `src/pages/index.astro`, `agence.astro`, `services.astro` | Boutons « Nous contacter », devis reportés à l'ouverture, recrutement présenté comme envisagé |
| `src/pages/contact.astro`, `src/pages/api/contact.ts`, `src/pages/api/candidature.ts`, `src/scripts/main.ts` | Formulaire fermé avec un message honnête, API refusées avant lecture, messages d'échec sans adresse inexistante |
| `src/pages/carrieres/index.astro`, `[slug].astro`, `candidature-spontanee.astro`, `src/components/PrelaunchNotice.astro` | Recrutement présenté comme futur : redirections, sections conditionnelles numérotées automatiquement, principes de travail non contractuels |
| `src/pages/mentions-legales.astro`, `src/pages/confidentialite.astro` | Identité du porteur, statut, traitements réels, droits par téléphone |
| `AUDIT-LEGAL.md`, `docs/brouillons-commerciaux.md` | Rapport et brouillons mis à jour |

## 7. Avant toute vente à des particuliers : liste de vérification

À traiter avec un professionnel du droit. Aucun prix, médiateur ni clause définitive n'a été choisi.

- [ ] **Identité et statut** du professionnel : nom, adresse, immatriculation, TVA ou franchise, coordonnées de contact
      (téléphone **et** moyen écrit).
- [ ] **Caractéristiques essentielles** de chaque prestation : contenu, livrables, nombre de retouches.
- [ ] **Prix** TTC, modalités de paiement, acompte, frais éventuels.
- [ ] **Délais et modalités d'exécution**, date ou délai de livraison.
- [ ] **Conditions contractuelles** : conditions générales, devis, contrat ; acceptation et conservation.
- [ ] **Droit de rétractation** de 14 jours pour les contrats conclus à distance ou hors établissement (C. conso.
      L221-18 et suivants), avec un formulaire type de rétractation.
- [ ] **Exécution avant la fin du délai** : demande expresse du consommateur et paiement au prorata (L221-25).
- [ ] **Exceptions au droit de rétractation** : service pleinement exécuté avec accord exprès et renonciation
      (L221-28). À vérifier au cas par cas.
- [ ] **Rétractation en ligne** : si des contrats sont conclus en ligne, fonctionnalité de rétractation sur le site
      (obligation signalée par la DGCCRF depuis le 19 juin 2026, à vérifier).
- [ ] **Réclamations** : procédure et coordonnées.
- [ ] **Médiateur de la consommation** à désigner, et ses coordonnées à communiquer (C. conso. L612-1, à vérifier).
- [ ] **Propriété intellectuelle** des livrables : cession écrite et détaillée, éléments de tiers.
- [ ] **Responsabilités, maintenance, résiliation** (contrat de maintenance si elle est proposée).
- [ ] **Facturation et obligations fiscales** : mentions des factures, TVA, facturation électronique.
- [ ] **Données personnelles des clients** : registre, sous-traitance si le site du client traite des données.
- [ ] **Assurance** responsabilité civile professionnelle, selon les risques.

## 8. Formalisation administrative à préparer

Aucune décision n'est prise à la place du propriétaire. Questions à étudier, idéalement avec un accompagnement :
chambres consulaires, BGE, Réseau Entreprendre, Initiative France.

1. **Statut** : entreprise individuelle, au régime micro ou réel, ou société (SASU, EURL…). Critères : chiffre
   d'affaires prévu, protection sociale, futur recrutement, responsabilité, associés éventuels.
2. **Domiciliation** : voir la section 4.
3. **Immatriculation** sur le guichet des formalités des entreprises (au plus tôt un mois avant le début d'activité,
   au plus tard 15 jours après). Inscription au RNE, et au RCS selon la nature de l'activité. Exercer sans
   immatriculation est sanctionné (source : Entreprendre.Service-Public, fiche F36763).
4. **Régime fiscal et TVA** : franchise en base ou TVA, imposition des bénéfices. Mentions correspondantes sur
   les devis et factures.
5. **Facturation** : numérotation, mentions, facturation électronique (réception, puis émission).
6. **Assurance** : responsabilité civile professionnelle, selon les risques et les exigences des clients.
7. **Messagerie professionnelle** : domaine, boîtes `contact@` et `recrutement@`, puis Resend et un test réel.
8. **Documents commerciaux** : valider les brouillons (`docs/brouillons-commerciaux.md`).
9. **Mentions légales définitives** : renseigner `legal` dans `src/data/site.ts` après l'immatriculation.

## 9. Conditions avant l'ouverture commerciale (`launch.commercial = true`)

- Immatriculation obtenue, `legal` complété (SIREN, RNE ou RCS, TVA ou franchise).
- Adresse confirmée.
- Téléphone de l'hébergeur et adresse d'Upstash renseignés.
- Messagerie en service et formulaires testés (`launch.mailbox = true`).
- Conditions générales, devis, contrat et formulaire de rétractation validés ; médiateur désigné.
- Politique de confidentialité relue (durées, prestataires réels).
- Assurance souscrite, si elle est retenue.

## 10. Conditions avant un recrutement (`launch.recruitment = true`)

- Structure employeuse immatriculée.
- Conditions de l'offre confirmées par écrit : contrat, salaire, avantages, lieu, date.
- Convention collective identifiée.
- Contrat de travail, charte de télétravail et organisation de la déconnexion rédigés avec un professionnel.
- Processus de recrutement organisé (qui lit, délais, conservation), messagerie `recrutement@` opérationnelle,
  formulaire de candidature testé.
- Mentions de la page Carrières relues ; `JobPosting` publié uniquement à ce moment-là.

## 11. Informations encore à fournir

| Information | Utilité |
|:--|:--|
| Adresse exacte à Lille, son statut, et l'accord pour la publier | Mentions légales, confidentialité, pied de page, carte |
| Moyen de contact écrit (e-mail ou adresse postale) | Exercice des droits RGPD, réclamations |
| Téléphone de Vercel, adresse d'Upstash | Mentions légales |
| Vérité du récit « freelance » et des clients passés | Accueil, L'agence |
| Choix concernant les horaires affichés sur la page Contact | Ne pas suggérer une activité ouverte |
| Statut juridique, régime fiscal, date de lancement envisagée | Sections 8 et 9 |

## 12. Sources officielles consultées

| Source | Résultat |
|:--|:--|
| [Légifrance, LCEN, art. 1-1](https://www.legifrance.gouv.fr/loda/article_lc/LEGIARTI000049568614/2026-10-28) | Identification de l'éditeur, du directeur de publication, de l'hébergeur (avec téléphone) et du prestataire de stockage ; régime de l'éditeur non professionnel (II) |
| [Légifrance, C. conso., art. L221-18 à L221-28](https://www.legifrance.gouv.fr/codes/section_lc/LEGITEXT000006069565/LEGISCTA000032221365/) et [art. L221-25](https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000032226826) | Rétractation, exécution anticipée, exceptions |
| [DGCCRF, Délais de réflexion ou de rétractation](https://www.economie.gouv.fr/dgccrf/les-fiches-pratiques/les-delais-de-reflexion-ou-de-retractation) (vu en résultat de recherche, page non ouverte : HTTP 403) | Fonctionnalité de rétractation en ligne depuis le 19/06/2026 |
| [Entreprendre.Service-Public, F36763](https://entreprendre.service-public.gouv.fr/vosdroits/F36763) (vérifié le 18/03/2026) | Immatriculation d'une entreprise individuelle : guichet, délais, pièces, sanctions |
| [CNIL, Cookies : que dit la loi ?](https://www.cnil.fr/fr/cookies-et-autres-traceurs/regles/cookies/que-dit-la-loi), [CNIL, Formulaires](https://www.cnil.fr/fr/exemples-de-formulaire-de-collecte-de-donnees-caractere-personnel), [CNIL, Guide du recrutement](https://www.cnil.fr/fr/le-guide-du-recrutement) | Traceurs exemptés, mentions d'information, données de recrutement |
| [Vercel, Privacy Policy (1er juin 2026)](https://vercel.com/legal/privacy-policy) | Adresse de Vercel Inc. et adhésion au Data Privacy Framework ; aucun téléphone publié |
| [Resend, Data Privacy Framework](https://resend.com/changelog/data-privacy-framework-certification) | Adhésion déclarée (mars 2025), à revérifier |
| Pages du ministère de l'Économie ([mentions sur un site](https://www.economie.gouv.fr/entreprises/developper-son-entreprise/innover-et-numeriser-son-entreprise/mentions-sur-votre-site-internet-les-obligations-respecter), [contrat et information préalable](https://www.economie.gouv.fr/dgccrf/les-fiches-pratiques/le-contrat-un-accord-entre-des-parties-bien-informees-au-prealable)) | **Non consultées** : accès automatique refusé (HTTP 403) |
| Facturation électronique ([Cegid](https://www.cegid.com/fr/facture-electronique-obligatoire/calendrier-facture-electronique/), [La Poste](https://www.laposte.fr/entreprise-collectivites/actualites/calendrier-dematerialisation-factures-en-est-votre-entreprise)) | Sources non officielles : à confirmer sur impots.gouv.fr |

## 13. Contrôles techniques (phase 2)

| Contrôle | Résultat |
|:--|:--|
| Build de production | Réussi |
| Linter, vérification de types, tests | Aucun configuré dans le projet (`astro check` demande une dépendance non installée) |
| Site verrouillé, visiteur anonyme | `/mentions-legales` et `/confidentialite` répondent 200 |
| Site ouvert, visiteur anonyme | `/carrieres/developpeur-web-junior` et `/carrieres/candidature-spontanee` redirigent (302) vers `/carrieres#recrutement` ; l'administration y accède avec l'avertissement |
| API | `/api/contact` et `/api/candidature` répondent 503, sans lire le contenu |
| Pages publiques (accueil, L'agence, Services, Contact, Carrières, pages légales) | Aucune adresse `@novaforge-studio.fr`, aucun formulaire, ni « 30 000 » ni « tickets » ; bandeau présent. Seule occurrence de « On recrute » : un commentaire CSS embarqué en développement, invisible |
| Carrières | Sections numérotées de 01 à 06, sans avantages ni offres |
| Rendu | Contact sur ordinateur (1440 px), Carrières sur mobile (390 px) sans débordement, menu mobile ouvert sous le bandeau |
| Console | Seules erreurs : 11 polices refusées (403) par le serveur de développement de la copie de test, dont `node_modules` est un lien hors du projet. **Artefact de test**, les polices sont embarquées au build |
| **Non testé** | Envoi réel d'e-mails (Resend non configuré) ; production (rien n'est déployé ni commité) |
