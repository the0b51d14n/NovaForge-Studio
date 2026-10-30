# Simulateur de devis

Page publique : `/devis` (menu « Devis », bouton « Simuler un devis » sur la page Services).

## Fonctionnement

1. Le visiteur choisit, pour chaque service, une **formule** (une seule), puis des **options** et des
   **quantités** (pages, produits, jours…). Le total s'affiche en direct.
2. « Créer mon devis » enregistre un devis à une adresse secrète (`/devis/<identifiant>`), avec un numéro
   (`D-2026-0001`…). **Les lignes et les prix sont copiés dans le devis** : modifier les tarifs ensuite ne
   change pas les devis déjà créés.
3. Le devis est **valable 30 jours** (`QUOTE_VALIDITY_DAYS`, `src/data/quote-catalog.ts`). Pendant ce
   temps, il peut être signé en ligne (nom, e-mail, case « bon pour accord »).
4. Un devis non signé est supprimé automatiquement 60 jours après sa création (30 jours de validité + 30
   jours pour le consulter expiré). Un devis signé est conservé.

Aucune donnée personnelle n'est demandée pour créer un devis. Une empreinte de l'adresse IP est gardée une
heure pour limiter les abus (20 devis par heure au plus).

## Où modifier quoi

| Quoi | Où |
|:--|:--|
| Liste des prestations (du plus simple au sur mesure) | `src/data/quote-catalog.ts` |
| Prix HT et régime de TVA | Administration → « Simulateur de devis » → « Modifier les tarifs » |
| Liste des devis créés, suppression | Administration → « Simulateur de devis » |

- Un élément **sans prix** n'est pas proposé aux visiteurs. Un service qui a des formules reste masqué tant
  qu'aucune de ses formules n'a de prix. Tant qu'aucun prix n'est saisi, la page affiche « Le simulateur
  arrive bientôt ».
- Ne pas changer l'`id` d'un élément du catalogue une fois son prix saisi : c'est lui qui relie le prix.
- TVA : « franchise en base » (mention « TVA non applicable, art. 293 B du CGI ») ou TVA à 20 %. Les prix
  sont saisis HT ; le visiteur voit les prix TTC.

## Signature : verrouillée jusqu'au lancement

Tant que `launch.commercial` vaut `false` (`src/data/site.ts`), les devis sont des **simulations non
contractuelles** : le bouton de signature n'apparaît pas. Un devis créé pendant le pré-lancement ne
devient jamais signable, même après le lancement.

Avant de passer `launch.commercial` à `true` `[À CONFIRMER AVANT LANCEMENT]` :

- [ ] Immatriculation (SIREN/SIRET dans `legal`, affichés sur le devis) et régime de TVA choisi.
- [ ] Conditions générales de vente rédigées, validées et publiées : la case de signature y fait
      référence. Ajouter le lien vers la page des CGV dans `src/pages/devis/[id].astro`.
- [ ] Informations précontractuelles pour les particuliers (code de la consommation, art. L221-5) et
      formulaire de rétractation (14 jours, art. L221-18) : voir [../juridique/consommateurs.md](../juridique/consommateurs.md).
- [ ] Vérifier les mentions obligatoires d'un devis ([../modeles/proposition-et-devis.md](../modeles/proposition-et-devis.md)).
- [ ] Preuve de signature : la signature en ligne actuelle est une signature électronique simple (nom,
      e-mail, date). Pour des montants importants, envisager un service de signature électronique.
- [ ] Prévenir le studio d'une signature (aujourd'hui, elle n'apparaît que dans l'administration ; un
      e-mail pourra être ajouté quand la messagerie sera en service).
