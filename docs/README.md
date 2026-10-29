# Documentation de NovaForge Studio

> Document **préparatoire et interne** (non publié sur le site). Il n'a été validé ni par un avocat ni par un
> expert-comptable. Version du 28/10/2026.

NovaForge Studio est un **projet en préparation, non immatriculé**, porté par un fondateur seul : Théo ANDRIMANANARISOA.
Cette documentation prépare le lancement. Elle distingue partout :

- les **faits confirmés** ;
- les **hypothèses** ;
- les **décisions à prendre** (marquées `[À CONFIRMER AVANT LANCEMENT]`) ;
- les **validations externes** (juriste, expert-comptable, assureur).

## Organisation

| Dossier | Rôle | Mis à jour par |
|:--|:--|:--|
| [audit-site.md](audit-site.md) | Inventaire du site, de l'administration et des intégrations | Fondateur, à chaque évolution du site |
| [lancement/](lancement/) | Statut juridique, décisions, plan de lancement | Fondateur, avec l'expert-comptable |
| [juridique/](juridique/) | Mentions légales, données personnelles, contrats, consommateurs, propriété intellectuelle | Fondateur, avec un juriste |
| [commercial/](commercial/) | Catalogue, processus client, conditions à fixer, maintenance | Fondateur |
| [organisation/](organisation/) | Rôles, politique de travail, recrutement futur, associés | Fondateur (futurs associés) |
| [finance/](finance/) | Budget prévisionnel, seuils de décision | Fondateur, avec l'expert-comptable |
| [technique/](technique/) | Architecture, **administration du site**, sécurité, exploitation | Fondateur, responsable technique |
| [modeles/](modeles/) | Trames internes (cadrage, proposition, recette, incidents) | Fondateur |

Documents déjà présents et conservés :

- [`../AUDIT-LEGAL.md`](../AUDIT-LEGAL.md) : rapport d'audit central, avec les checklists et les risques classés de P0 à P2 ;
- [`brouillons-commerciaux.md`](brouillons-commerciaux.md) : trames des conditions générales, du devis, des contrats et des factures ;
- [`elements-a-fournir.md`](elements-a-fournir.md) : informations à saisir dans `src/data/site.ts` ;
- `archives/` : anciennes notes, non publiées.

## Statut des documents

| Document | Nature | Validation nécessaire |
|:--|:--|:--|
| juridique/contrats-et-cgv.md, juridique/consommateurs.md, brouillons-commerciaux.md | Trames contractuelles | **Juriste** avant toute signature |
| juridique/registre-traitements.md, juridique/sous-traitants-et-transferts.md | Conformité RGPD | Relecture juridique recommandée |
| lancement/statut-juridique.md, finance/* | Aide à la décision | **Expert-comptable** |
| organisation/recrutement-futur.md, organisation/politique-de-travail.md | Politique prospective | **Juriste en droit social** avant la première embauche |
| organisation/politique-associes.md | Note préparatoire | **Juriste** (statuts, pacte d'associés) |
| technique/*, commercial/*, modeles/* | Documents opérationnels | Interne |

## Ce qui bloque le lancement

Voir [lancement/decisions-a-prendre.md](lancement/decisions-a-prendre.md) et les risques P0 de
[`../AUDIT-LEGAL.md`](../AUDIT-LEGAL.md). En bref :

1. le statut juridique et l'immatriculation ;
2. la domiciliation ;
3. la messagerie professionnelle et un moyen de contact écrit ;
4. les documents commerciaux validés, avec un médiateur de la consommation pour les particuliers ;
5. l'assurance et la banque.

## Règles

- Rien dans `docs/` n'est servi par le site : seuls `public/` et `src/pages/` le sont. Vérifié le 28/10/2026.
- Ne jamais écrire de secret, de clé ou de donnée personnelle de client dans ces documents.
- Un document devient « validé » seulement quand le professionnel concerné l'a relu. Noter alors la date et le
  nom du professionnel en tête du document.
