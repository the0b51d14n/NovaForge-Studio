# Plan de lancement

> Document **préparatoire et interne** (non publié sur le site). Il n'a été validé ni par un avocat ni par un
> expert-comptable. Version du 28/10/2026.

Ordre recommandé. Les checklists détaillées (pages juridiques, ouverture commerciale, premier contrat, première
embauche) sont dans [`../../AUDIT-LEGAL.md`](../../AUDIT-LEGAL.md), section 0.

## Étape 1 : décider (sans engagement)

- [ ] Simulations sur [mon-entreprise.urssaf.fr](https://mon-entreprise.urssaf.fr/simulateurs/) pour les trois statuts.
- [ ] Rendez-vous avec un expert-comptable : statut, TVA, budget ([../finance/budget-previsionnel.md](../finance/budget-previsionnel.md)).
- [ ] Choix de la domiciliation et de la date de début d'activité.
- [ ] Vérification du nom (marque, domaine).

## Étape 2 : préparer les outils

- [ ] Nom de domaine, messagerie professionnelle, puis Resend (domaine vérifié) : test d'envoi réel.
- [ ] Devis d'assurance responsabilité civile professionnelle (et cyber-risques à étudier).
- [ ] Banque : compte dédié, moyens de paiement.
- [ ] Outil de facturation compatible avec la facturation électronique.
- [ ] Administration :
  - mot de passe fort ;
  - adresse définitive saisie ;
  - offres prévisionnelles revues ([../technique/administration.md](../technique/administration.md)).

## Étape 3 : formaliser

- [ ] Immatriculation sur [formalites.entreprises.gouv.fr](https://formalites.entreprises.gouv.fr/).
- [ ] Renseigner `legal` dans `src/data/site.ts`, ainsi que le téléphone de l'hébergeur et l'adresse d'Upstash.
- [ ] Faire valider les conditions générales (particuliers et professionnels), le devis, le contrat et le formulaire
      de rétractation. Désigner le médiateur.
- [ ] Relire la politique de confidentialité et le registre des traitements.

## Étape 4 : ouvrir

- [ ] `launch.mailbox = true`, puis tester les formulaires de bout en bout.
- [ ] `launch.commercial = true` : le bandeau « projet en préparation » disparaît. Publier les conditions générales.
- [ ] Commit, revue, push, puis contrôle en production. Ouvrir le site depuis l'administration si besoin.

## Plus tard

- [ ] Recrutement : voir [../organisation/recrutement-futur.md](../organisation/recrutement-futur.md), puis `launch.recruitment = true`.
- [ ] Associés : voir [../organisation/politique-associes.md](../organisation/politique-associes.md).
- [ ] Offre cybersécurité : seulement après définition précise des prestations, des compétences et de l'assurance.
