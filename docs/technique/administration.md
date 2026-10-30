# Portail de l'équipe (`/administration`)

> Document **préparatoire et interne** (non publié sur le site). Il n'a été validé ni par un avocat ni par un
> expert-comptable. Version du 30/10/2026.

Espace privé de l'équipe, qui pilote le site sans modifier le code. Fichiers :
`src/pages/administration/index.astro`, `src/pages/administration/offres/[slug].astro`,
`src/pages/administration/devis/[id].astro`, `src/pages/connexion.astro`, `src/components/AdminBar.astro`,
`src/lib/accounts.ts`, `src/lib/access.ts`, `src/lib/store.ts`.

## 1. Comptes et rôles

| Rôle | Accès |
|:--|:--|
| **Dirigeant** | État du site, adresse du siège, fermetures, offres d'emploi, comptes de l'équipe ; devis : résumé seulement (personne attribuée, prix final) |
| **Admin+** | Devis : attribution à un admin+ (lui-même ou un collègue), suppression ; prix fermes **seulement pour les devis qui lui sont attribués** |
| **Admin** | Devis : consultation (détail en lecture seule, personne qui s'en occupe) |
| **Client** | Pas d'accès au portail (espace client : étape suivante) |

- Les comptes de l'équipe sont créés par les dirigeants (section « Comptes de l'équipe ») avec un mot de passe
  provisoire, que chacun change dans « Mon compte ». Un dirigeant peut changer un rôle, une adresse e-mail,
  désactiver un compte ou réinitialiser un mot de passe. Il reste toujours au moins un dirigeant actif ; on ne
  modifie pas son propre rôle.
- **Adresse e-mail** : chacun peut changer la sienne dans « Mon compte » (mot de passe actuel demandé). La nouvelle
  adresse sert aussitôt à se connecter ; une adresse déjà utilisée par un autre compte est refusée.
- **Premier lancement** : tant qu'aucun compte de l'équipe n'existe, `/administration` propose de créer le premier
  dirigeant, avec le mot de passe `SITE_PASSWORD`. Ensuite, `SITE_PASSWORD` ne sert plus.
- **Mot de passe oublié** : un dirigeant le réinitialise (pas d'e-mail tant que la messagerie n'est pas en service).

## 2. Accès et sécurité

| Élément | Fonctionnement | Constat et recommandation |
|:--|:--|:--|
| Authentification | E-mail + mot de passe sur `/connexion` ; empreinte scrypt (sel aléatoire), jamais le mot de passe en clair ; 10 caractères au moins | **Pas de MFA** : P2 |
| Session | Cookie `nf_session` : jeton aléatoire (32 octets) vérifié en base (`nf:session:<jeton>`), `httpOnly`, `sameSite=lax`, `secure` en production, 30 jours. Déconnexion = suppression en base | Un compte désactivé perd aussitôt ses sessions ; un changement de rôle s'applique à la requête suivante |
| Anti-force brute | Pause de 0,8 s après un échec ; 8 échecs sur une même adresse = blocage 15 minutes | Pas de blocage par IP : P2 |
| Droits | Vérifiés côté serveur pour chaque action (`can`, `src/lib/accounts.ts`), pas seulement masqués dans la page | — |
| CSRF | Vérification d'origine native d'Astro (`checkOrigin`) | Contrôlé lors des tests (requête sans origine refusée) |
| Indexation | `noindex` | — |

Données des comptes (Upstash) : `nf:user:<id>` (nom, e-mail, rôle, empreinte du mot de passe, date de création,
désactivation), `nf:user-email:<e-mail>`, index `nf:users`, `nf:session:<jeton>`, `nf:login-fail:<empreinte>`.

## 3. Fonctions

| Fonction | Effet public | Données stockées (Upstash `nf:settings` / `nf:openings`) |
|:--|:--|:--|
| **Verrouiller ou ouvrir le site**, avec un motif (maintenance, fermeture complète, mise à jour) | Tout le monde, administrateur compris, voit `/verrouillage`. Le statut est 503 pour la maintenance et la mise à jour. Les pages légales restent accessibles | `locked`, `lockReason` |
| **Aperçu** (depuis `/verrouillage`) | L'administrateur consulte le site fermé (cookie `nf_apercu`, session) | — |
| **Adresse du siège** (géocodée via Nominatim) | Pied de page, Contact, carte, mentions légales | `street`, `postalCode`, `city`, `geo` |
| **Fermetures exceptionnelles** (journées ou plages horaires) et **jours fériés** automatiques, avec suggestion de ponts | Calendrier de la page Contact. Purge automatique à la fin de la semaine | `closures`, `holidays` |
| **Offres d'emploi** (création, modification, suppression) | **Aucun effet public tant que `launch.recruitment` est faux** : prévisualisation seulement | `nf:openings` |
| **Rafraîchissement automatique** | Les pages ouvertes se rechargent après un enregistrement (`nf:version`) | `nf:version` |
| **Devis** : liste, attribution à un admin+, prix fermes (voir [../commercial/simulateur-devis.md](../commercial/simulateur-devis.md)) | Le devis ferme s'affiche sur la page du client | `nf:quote:<id>` (dont `assignee`) |

## 4. Points d'attention juridiques

- **L'adresse saisie apparaît sur les mentions légales et dans le pied de page.** Ne saisir que l'adresse dont la
  publication est décidée (domiciliation, voir `AUDIT-LEGAL.md`, section 4).
- **Les motifs de fermeture sont publics** (page Contact) : ne pas y écrire d'information personnelle.
- **Les offres d'emploi** stockées sont prévisionnelles (salaire ~30 000 €, avantages). À revoir entièrement avant
  de passer `launch.recruitment` à `true`.
- **Les drapeaux de lancement** (`launch` : commercial, recrutement, messagerie) sont **dans le code**, pas dans
  l'administration : leur activation passe par un commit et une relecture. C'est volontaire, à cause des
  conséquences juridiques. **Décision du propriétaire** : les rendre pilotables depuis l'administration plus tard
  `[À CONFIRMER AVANT LANCEMENT]`.

- **Les comptes de l'équipe contiennent des données personnelles** (nom, e-mail professionnel) : à mentionner dans
  l'information des salariés le moment venu ; supprimer ou désactiver le compte au départ d'une personne.

## 5. Exploitation

- **Sans base configurée** (développement), les réglages restent en mémoire et sont perdus au redémarrage (un
  avertissement l'indique).
- **Base injoignable en production** : le site se verrouille par sécurité.
- **Tests** : toujours sur une copie **sans** `.env` (base en mémoire). Le `.env` local pointe vers la base de
  production.
