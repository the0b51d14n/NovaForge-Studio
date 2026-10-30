# Simulateur de devis

Page publique : `/devis` (menu « Devis », bouton « Simuler un devis » sur la page Services).

## Le parcours

1. **Famille** : site vitrine, boutique en ligne, identité visuelle, application ou maintenance (une par estimation).
2. **Type** : une formule de cette famille.
3. **Options** : celles de la famille, plus celles de l'accompagnement (formation, photos, nom de domaine…).
4. **Budget envisagé** : une tranche (`BUDGETS`, ou `MONTHLY_BUDGETS` pour la maintenance), ou « Je ne sais pas encore ».

**Aucun prix n'est affiché pendant ces étapes**, ni envoyé au navigateur. Le visiteur obtient ensuite son
**estimation**, à une adresse secrète (`/devis/<identifiant>`) avec un numéro (`D-2026-0001`…) :

- ses choix, sans prix ligne par ligne, et un **total approximatif** en fourchette (réductions déjà déduites) ;
- la **comparaison avec son budget** : couvert, dans la fourchette, ou en dessous ;
- si le budget est en dessous : une **version ajustée** (options les plus chères retirées, puis formule moins chère
  de la même famille), ou à défaut l'annonce d'une solution par étapes proposée par le conseiller ;
- un formulaire **« Être rappelé par un conseiller »** : nom et téléphone obligatoires, e-mail et précisions
  facultatifs.

L'estimation est figée et valable 30 jours.

## Le devis ferme

Dans l'administration (« Simulateur de devis » → « Finaliser »), le conseiller voit les coordonnées du client, son
budget, la version ajustée éventuelle et la fourchette de chaque ligne. Il :

- fixe le prix unitaire HT de chaque ligne (il peut sortir de la fourchette) ;
- retire des lignes si besoin (pour suivre la version ajustée, par exemple) ;
- accorde une remise facultative, en montant ou en pourcentage, avec un libellé ;
- ajoute une note, puis émet le devis ferme.

Le devis ferme s'affiche sur la même page que l'estimation, avec le détail des prix, et se signe en ligne dans les
30 jours. Réémettre un devis non signé remplace ses prix et relance ces 30 jours.

Un devis non signé est supprimé automatiquement 30 jours après la fin de sa validité. Un devis signé est conservé.
Une empreinte de l'adresse IP est gardée une heure pour limiter les abus (20 estimations par heure au plus).

## Où modifier quoi : `src/data/quote-catalog.ts`

| Quoi | Dans le fichier |
|:--|:--|
| Prestations et fourchettes de prix | `catalog`, champ `price` de chaque prestation |
| Régime de TVA | `VAT_REGIME` |
| Tranches de budget | `BUDGETS`, `MONTHLY_BUDGETS` |
| Réductions automatiques | `discounts` (vide pour l'instant) |
| Options proposées avec toutes les familles | `ADDON_GROUP` |
| Durée de validité | `QUOTE_VALIDITY_DAYS` |

`price`, en euros HT : `1200` (prix fixe), `[1200, 2500]` (fourchette) ou `null` (prestation masquée). Pour une
quantité, c'est le prix d'une unité ; pour un élément mensuel, le prix par mois. Une famille reste masquée tant
qu'aucune de ses formules n'a de prix. Ne pas changer l'`id` d'une prestation déjà utilisée dans des devis.

**Réductions** `[À DÉFINIR]` : chaque réduction a un libellé, un pourcentage (`percent`) ou un montant HT
(`amount`), et des conditions facultatives, toutes obligatoires si indiquées : total minimum (`minTotal`), familles
(`families`), prestations requises (`requires`), date limite (`until`). Elles portent sur ce qui est payé une
fois, pas sur l'abonnement mensuel. Des exemples commentés sont dans le fichier.

Après modification du fichier : commit, puis déploiement.

## Avant l'ouverture commerciale

Tant que `launch.commercial` vaut `false` (`src/data/site.ts`), les estimations sont des **simulations non
contractuelles** : ni demande de rappel (aucune donnée personnelle collectée), ni signature. Une estimation créée
pendant le pré-lancement ne devient jamais signable, même après le lancement.

Avant de passer `launch.commercial` à `true` `[À CONFIRMER AVANT LANCEMENT]` :

- [ ] Fourchettes de prix vérifiées (les montants actuels sont des propositions à confirmer) et régime de TVA choisi.
- [ ] Conditions des réductions décidées, ou liste laissée vide.
- [ ] Immatriculation (SIREN/SIRET dans `legal`, affichés sur le devis).
- [ ] Conditions générales de vente rédigées, validées et publiées : la case de signature y fait
      référence. Ajouter le lien vers la page des CGV dans `src/pages/devis/[id].astro`.
- [ ] Informations précontractuelles pour les particuliers (code de la consommation, art. L221-5) et
      formulaire de rétractation (14 jours, art. L221-18) : voir [../juridique/consommateurs.md](../juridique/consommateurs.md).
- [ ] Vérifier les mentions obligatoires d'un devis ([../modeles/proposition-et-devis.md](../modeles/proposition-et-devis.md)).
- [ ] Preuve de signature : la signature en ligne est une signature électronique simple (nom, e-mail, date).
      Pour des montants importants, envisager un service de signature électronique.
- [ ] Être prévenu des demandes de rappel et des signatures : aujourd'hui elles n'apparaissent que dans
      l'administration ; un e-mail pourra être ajouté quand la messagerie sera en service.
