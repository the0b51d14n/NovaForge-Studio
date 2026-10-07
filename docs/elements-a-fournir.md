# Éléments à fournir pour le site

Le site est prêt à recevoir les informations officielles de NovaForge Studio. Tout se règle dans
`src/data/site.ts` : un champ laissé à `null` est masqué, il s'affiche dès qu'il est renseigné.

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

Tant que le SIREN n'est pas renseigné, les mentions légales indiquent « en cours d'immatriculation ».

## 2. Coordonnées

| Élément | État |
|:--|:--|
| Adresse | ✅ 6 rue Blaise Pascal, 59960 Neuville-en-Ferrain (carte mise à jour) |
| E-mails | ⚠️ `contact@` et `recrutement@novaforge-studio.fr` : le nom de domaine est-il acheté ? |
| Téléphone | ✅ 06 95 96 17 49 (Contact, pied de page, mentions légales) |
| Horaires | ⚠️ « Lun. – Ven. · 9 h – 18 h » à confirmer |
| Nom du fondateur | À fournir (page L'agence) |

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
- **Engagements affichés** : réponse sous 48 h ouvrées, premier rendez-vous et devis gratuits.
- **Photos** : les photos des locaux ont été supprimées. De vraies photos (studio, fondateur,
  projets) pourront être ajoutées plus tard.

## 4. Mise en ligne (Vercel → Settings → Environment Variables)

| Variable | Rôle |
|:--|:--|
| `SITE_PASSWORD` | Mot de passe de la page de verrouillage (sans lui, le site reste fermé) |
| `RESEND_API_KEY` | Clé du service d'envoi d'e-mails [Resend](https://resend.com) (offre gratuite suffisante) |
| `MAIL_FROM` | Expéditeur des e-mails, sur le domaine vérifié : `NovaForge Studio <site@novaforge-studio.fr>` |

Sans les deux variables Resend, les formulaires de contact et de candidature affichent l'adresse
e-mail à utiliser à la place. Pour les activer : créer un compte Resend, y vérifier le nom de domaine,
puis ajouter les variables sur Vercel et redéployer.

Le jour de l'ouverture au public, le verrou sera retiré et le nom de domaine branché sur Vercel.

## 5. Textes juridiques

Les **mentions légales** et la **politique de confidentialité** sont rédigées et se remplissent
automatiquement. Ce sont des modèles : à faire relire (expert-comptable, juriste, CCI) avant
l'ouverture au public. Les **conditions générales de vente** (devis, factures) restent à rédiger.
