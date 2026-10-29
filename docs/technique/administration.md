# Espace d'administration (`/administration`)

> Document **préparatoire et interne** (non publié sur le site). Il n'a été validé ni par un avocat ni par un
> expert-comptable. Version du 28/10/2026.

Espace privé, réservé au fondateur, qui pilote le site sans modifier le code. Fichiers :
`src/pages/administration/index.astro`, `src/pages/administration/offres/[slug].astro`, `src/components/AdminBar.astro`,
`src/lib/access.ts`, `src/lib/store.ts`.

## 1. Accès et sécurité

| Élément | Fonctionnement | Constat et recommandation |
|:--|:--|:--|
| Authentification | Mot de passe unique `SITE_PASSWORD` (variable Vercel), comparé en temps constant | Mot de passe long et unique ; rotation si fuite. **Pas de MFA** : P2, à étudier si plusieurs personnes y accèdent |
| Session | Cookie `nf_admin` : signature HMAC dérivée du mot de passe, `httpOnly`, `sameSite=lax`, `secure` en production, 30 jours | Changer `SITE_PASSWORD` déconnecte toutes les sessions |
| Anti-force brute | Pause de 0,8 s après un échec | Pas de blocage par IP : P2 |
| CSRF | Vérification d'origine native d'Astro (`checkOrigin`) | Contrôlé lors des tests (requête sans origine refusée) |
| Comptes multiples | Un seul mot de passe partagé | Avant l'arrivée d'associés ou de salariés : comptes nominatifs ou accès séparés (P1 à ce moment-là) |
| Indexation | `noindex` | — |

## 2. Fonctions

| Fonction | Effet public | Données stockées (Upstash `nf:settings` / `nf:openings`) |
|:--|:--|:--|
| **Verrouiller ou ouvrir le site**, avec un motif (maintenance, fermeture complète, mise à jour) | Tout le monde, administrateur compris, voit `/verrouillage`. Le statut est 503 pour la maintenance et la mise à jour. Les pages légales restent accessibles | `locked`, `lockReason` |
| **Aperçu** (depuis `/verrouillage`) | L'administrateur consulte le site fermé (cookie `nf_apercu`, session) | — |
| **Adresse du siège** (géocodée via Nominatim) | Pied de page, Contact, carte, mentions légales | `street`, `postalCode`, `city`, `geo` |
| **Fermetures exceptionnelles** (journées ou plages horaires) et **jours fériés** automatiques, avec suggestion de ponts | Calendrier de la page Contact. Purge automatique à la fin de la semaine | `closures`, `holidays` |
| **Offres d'emploi** (création, modification, suppression) | **Aucun effet public tant que `launch.recruitment` est faux** : prévisualisation seulement | `nf:openings` |
| **Rafraîchissement automatique** | Les pages ouvertes se rechargent après un enregistrement (`nf:version`) | `nf:version` |

## 3. Points d'attention juridiques

- **L'adresse saisie apparaît sur les mentions légales et dans le pied de page.** Ne saisir que l'adresse dont la
  publication est décidée (domiciliation, voir `AUDIT-LEGAL.md`, section 4).
- **Les motifs de fermeture sont publics** (page Contact) : ne pas y écrire d'information personnelle.
- **Les offres d'emploi** stockées sont prévisionnelles (salaire ~30 000 €, avantages). À revoir entièrement avant
  de passer `launch.recruitment` à `true`.
- **Les drapeaux de lancement** (`launch` : commercial, recrutement, messagerie) sont **dans le code**, pas dans
  l'administration : leur activation passe par un commit et une relecture. C'est volontaire, à cause des
  conséquences juridiques. **Décision du propriétaire** : les rendre pilotables depuis l'administration plus tard
  `[À CONFIRMER AVANT LANCEMENT]`.

## 4. Exploitation

- **Sans base configurée** (développement), les réglages restent en mémoire et sont perdus au redémarrage (un
  avertissement l'indique).
- **Base injoignable en production** : le site se verrouille par sécurité.
- **Tests** : toujours sur une copie **sans** `.env` (base en mémoire). Le `.env` local pointe vers la base de
  production.
