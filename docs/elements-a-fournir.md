# Éléments à fournir pour le site

Le site est prêt à recevoir les informations officielles de NovaForge Studio. Tout se règle dans
`src/data/site.ts` : un champ laissé à `null` est masqué, il s'affiche dès qu'il est renseigné.

> Audit juridique du 28/10/2026 : voir `AUDIT-LEGAL.md` (anomalies, informations manquantes, sources) et
> `docs/brouillons-commerciaux.md` (conditions de prestation, devis, contrats : brouillons à valider).

## 1. Identité légale (après l'immatriculation)

| Élément | Exemple | Où il apparaît |
|:--|:--|:--|
| Dénomination sociale | NovaForge Studio | Mentions légales, confidentialité |
| Forme juridique | SASU, EURL, entreprise individuelle… | Mentions légales |
| Capital social | 1 000 € | Mentions légales (sauf entreprise individuelle) |
| SIREN et SIRET | 123 456 789 / 123 456 789 00012 | Mentions légales |
| Immatriculation | RCS Lille Métropole 123 456 789 | Mentions légales |
| N° de TVA intracommunautaire | FR12 123456789 | Mentions légales |
| Code APE / NAF | 62.01Z | Mentions légales |
| Directeur de la publication | Prénom Nom, président | Mentions légales |
| Année de création | 2026 | Accueil (« Depuis… »), L'agence |

Tant que le SIREN n'est pas renseigné, aucune immatriculation n'est affichée (rien n'est affirmé) et les pages
Carrières affichent l'avertissement « Recrutements en préparation ». En attendant, il faut au minimum le **nom de
l'éditeur** (`founder.name`, personne physique) et le **directeur de la publication** (`legal.director`) : les
mentions légales affichent « À compléter » tant qu'ils manquent, ainsi que le téléphone de l'hébergeur
(`host.phone`) et l'adresse d'Upstash (`storage.address`).

## 2. Coordonnées

| Élément | État |
|:--|:--|
| Adresse | ⚠️ Incohérence : 44 rue des Montagnards, 59800 Lille enregistrée dans l'administration, 6 rue Blaise Pascal, 59960 Neuville-en-Ferrain dans `site.ts` et l'offre. Domicile ou local ? À trancher |
| E-mails | ⚠️ `contact@` et `recrutement@novaforge-studio.fr` : le nom de domaine est-il acheté ? |
| Téléphone | ✅ 06 95 96 17 49 (Contact, pied de page, mentions légales) |
| Horaires | ✅ « Lun. – Ven. · 8 h – 18 h » en continu : couvre les trois formules de travail (matinale dès 8 h, décalée jusqu'à 18 h) |
| Tarifs du simulateur de devis | Fourchettes à remplir dans `src/data/quote-catalog.ts` (champ `price`) : voir [commercial/simulateur-devis.md](commercial/simulateur-devis.md) |
| Nom du fondateur | À fournir (page L'agence) |
| Réseaux professionnels | À fournir si existants (LinkedIn, GitHub…) : `socials`, affichés dans le pied de page |

> ⚠️ L'adresse du siège est obligatoirement publique dans les mentions légales. Si c'est un
> domicile personnel, une société de domiciliation permet d'afficher une autre adresse.

## 3. Contenus à valider

- **Notre histoire** (accueil et page L'agence) et **le mot du fondateur** : textes réécrits sans
  dates ni chiffres inventés, à relire et ajuster avec tes propres mots.
- **Offre d'emploi** : salaire, télétravail, tickets restaurant, budget formation, prime, processus
  de recrutement… Ce sont des engagements réels envers les candidats : à confirmer un par un dans
  `src/data/content.ts` (`job`, `openings`, `benefits`).
- **Réalisations et témoignages** : la liste est vide (les exemples inventés ont été retirés). La
  page et la section d'accueil réapparaissent dès le premier projet ajouté dans `projects`,
  uniquement des projets réels, avec l'accord des clients.
- **Retirés car invérifiables**, à remettre seulement s'ils sont vrais : « carnet de commandes stable
  depuis 2 ans », « clients fidèles », le réseau de partenaires, la question candidat « Et si l'agence
  n'a plus assez de clients ? ».
- **Politique de travail** (Carrières → « La vie au studio » et « Horaires & télétravail ») : ✅ adoptée
  comme cadre de référence, présentée de façon affirmative sur le site.
  - Horaires (35 h de travail effectif sur 5 jours, 1 h 30 de pause, 7 h par jour) : formule matinale
    8 h – 16 h 30 (pause 12 h – 13 h 30), formule standard 9 h – 17 h 30 (pause 12 h 30 – 14 h, la
    référence), formule décalée 9 h 30 – 18 h (pause 13 h – 14 h 30).
  - Télétravail : lundi au bureau pour tous, jusqu'à 3 jours par semaine, facultatif, planifié à
    l'avance ; réunions en présentiel anticipées et calées sur les horaires convenus ; changements de
    planning raisonnables, motivés et annoncés rapidement.
  - Repas d'équipe : possibles, notamment le lundi, toujours facultatifs (pas un avantage payé).
  - ⚠️ Reste à formaliser avant de le garantir aux salariés : contrat de travail (formule horaire),
    charte ou accord de télétravail (jours, délai de prévenance des changements), idéalement avec un
    conseil juridique. Le site le précise sous la section « Horaires & télétravail ».
  - Textes dans `src/data/content.ts` (`culture`, `officeLife`, `workSchedules`, `remoteWeek`,
    `remoteRules`, `dayInLife`). Les horaires d'accueil client (page Contact) sont indépendants.
- **Engagements affichés** : réponse sous 48 h ouvrées, premier rendez-vous et devis gratuits.
- **Photos** : les photos des locaux ont été supprimées. De vraies photos (studio, fondateur,
  projets) pourront être ajoutées plus tard.

## 4. Mise en ligne (Vercel → Settings → Environment Variables)

| Variable | Rôle |
|:--|:--|
| `SITE_PASSWORD` | Mot de passe de `/administration` (verrou, adresse du siège, offres d'emploi) |
| `KV_REST_API_URL`, `KV_REST_API_TOKEN` | Base Upstash Redis : ajoutées par Vercel → Storage → Upstash for Redis |
| `RESEND_API_KEY` | Clé du service d'envoi d'e-mails [Resend](https://resend.com) (offre gratuite suffisante) |
| `MAIL_FROM` | Expéditeur des e-mails, sur le domaine vérifié : `NovaForge Studio <site@novaforge-studio.fr>` |

Sans les deux variables Resend, les formulaires de contact et de candidature affichent l'adresse
e-mail à utiliser à la place. Pour les activer : créer un compte Resend, y vérifier le nom de domaine,
puis ajouter les variables sur Vercel et redéployer.

Le jour de l'ouverture au public : bouton « Ouvrir le site au public » dans `/administration`, et nom de
domaine branché sur Vercel.

## 5. Textes juridiques

Les **mentions légales** et la **politique de confidentialité** sont rédigées et se remplissent
automatiquement. Ce sont des modèles : à faire relire (expert-comptable, juriste, CCI) avant
l'ouverture au public. Les **conditions générales de vente** (devis, factures) restent à rédiger.
