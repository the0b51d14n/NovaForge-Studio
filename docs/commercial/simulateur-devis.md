# Simulateur de devis

Page publique : `/devis` (menu « Devis », bouton « Simuler un devis » sur la page Services).

## Les étapes

1. **Estimation** : le visiteur choisit, pour chaque service, une formule (une seule), puis des options et des
   quantités (pages, produits, jours…). Il voit une fourchette de prix en direct, puis crée son estimation, à une
   adresse secrète (`/devis/<identifiant>`) avec un numéro (`D-2026-0001`…). Les fourchettes y sont copiées et
   figées pendant 30 jours. Aucune donnée personnelle n'est demandée.
2. **Demande de rappel** : sur son estimation, le visiteur laisse ses nom, e-mail (et s'il le souhaite son
   téléphone et des précisions) pour être recontacté.
3. **Devis ferme** : un développeur ouvre l'estimation dans l'administration (« Finaliser »), échange avec le
   client, fixe le prix unitaire HT de chaque ligne selon la complexité réelle, ajoute une note si besoin, puis
   émet le devis ferme. Il s'affiche sur la même page que l'estimation.
4. **Signature** : le client signe le devis ferme en ligne dans les 30 jours suivant son émission. Réémettre un
   devis non signé remplace ses prix et relance ces 30 jours.

Un devis non signé est supprimé automatiquement 30 jours après la fin de sa validité. Un devis signé est conservé.
Une empreinte de l'adresse IP est gardée une heure pour limiter les abus (20 estimations par heure au plus).

Le navigateur n'envoie que les choix du client : les fourchettes et les prix sont toujours recalculés par le
serveur. Modifier la page avec les outils du navigateur (F12) ne change que l'affichage chez le client.

## Où modifier quoi

| Quoi | Où |
|:--|:--|
| Prestations, fourchettes de prix, régime de TVA | `src/data/quote-catalog.ts` |
| Durée de validité (30 jours) | `QUOTE_VALIDITY_DAYS`, même fichier |
| Liste des devis, finalisation (prix fermes), suppression | Administration → « Simulateur de devis » |

Dans `src/data/quote-catalog.ts`, chaque prestation a un champ `price`, en euros HT :

- `price: 1200` : prix fixe ;
- `price: [1200, 2500]` : fourchette, affichée « 1 200 € – 2 500 € » ;
- `price: null` : pas encore de prix, la prestation est masquée.

Pour une quantité, c'est le prix d'une unité ; pour un élément mensuel, le prix par mois. Un service qui a des
formules reste masqué tant qu'aucune n'a de prix. Ne pas changer l'`id` d'une prestation déjà utilisée dans des
devis. Après modification du fichier : commit, puis déploiement.

`VAT_REGIME` : `'franchise'` (mention « TVA non applicable, art. 293 B du CGI ») ou `'normal'` (TVA à 20 %).
Les prix sont saisis HT ; le visiteur voit les prix TTC.

## Avant l'ouverture commerciale

Tant que `launch.commercial` vaut `false` (`src/data/site.ts`), les estimations sont des **simulations non
contractuelles** : ni demande de rappel (aucune donnée personnelle collectée), ni signature. Une estimation créée
pendant le pré-lancement ne devient jamais signable, même après le lancement.

Avant de passer `launch.commercial` à `true` `[À CONFIRMER AVANT LANCEMENT]` :

- [ ] Fourchettes de prix remplies dans `src/data/quote-catalog.ts` et régime de TVA choisi.
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
