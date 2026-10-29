# Registre des traitements (RGPD, art. 30)

> Document **préparatoire et interne** (non publié sur le site). Il n'a été validé ni par un avocat ni par un
> expert-comptable. Version du 28/10/2026.

**Responsable du traitement** : Théo ANDRIMANANARISOA, porteur du projet NovaForge Studio (non immatriculé).
Contact écrit : `[À CONFIRMER AVANT LANCEMENT]` (messagerie non ouverte ; téléphone affiché). À tenir à jour à chaque nouveau traitement.

Le registre est obligatoire dans de nombreux cas. Il est recommandé dans tous les cas : voir
[CNIL, premières étapes](https://www.cnil.fr/fr/passer-laction/rgpd-les-premieres-etapes).

| # | Traitement | État | Données | Finalité | Base légale | Destinataires et sous-traitants | Durée |
|:--|:--|:--|:--|:--|:--|:--|:--|
| T1 | Hébergement et sécurité du site | **Actif** | Adresse IP, URL, navigateur, date | Afficher et sécuriser le site | Intérêt légitime (6.1.f) | Vercel (États-Unis) | Selon Vercel `[À CONFIRMER AVANT LANCEMENT]` (durée à vérifier dans son offre) |
| T2 | Carte des pages Contact et L'agence | **Actif** | Adresse IP (requête de tuiles) | Afficher la localisation | Intérêt légitime | OpenStreetMap Foundation (Royaume-Uni, décision d'adéquation) | Selon OSMF |
| T3 | Administration du site | **Actif** | Cookie d'authentification (pas de compte nominatif) ; adresse et motifs de fermeture saisis | Accès réservé à l'éditeur, gestion du site | Intérêt légitime | Vercel, Upstash | 30 jours (cookie) ; réglages tant qu'ils sont utiles |
| T4 | Demandes de contact | **Fermé** (`launch.mailbox = false`) | Nom, e-mail, message ; entreprise, téléphone, projet et budget facultatifs | Répondre, préparer un devis | Mesures précontractuelles (6.1.b) ou intérêt légitime | Vercel, Resend (États-Unis), messagerie `[À CONFIRMER AVANT LANCEMENT]` | Traitement de la demande, puis 3 ans au plus après le dernier échange `[À CONFIRMER AVANT LANCEMENT]` |
| T5 | Candidatures | **Fermé** (`launch.recruitment = false`) | Identité, contact, CV, liens, message | Recrutement | Mesures précontractuelles | Idem T4 | Fin du processus ; 2 ans au plus si le candidat a coché la case de conservation |
| T6 | Clients (à venir) | **Pas encore** | Identité, coordonnées, facturation, échanges | Exécuter les contrats, facturer | Contrat (6.1.b), obligation légale (comptabilité) | Comptable, banque, outils `[À CONFIRMER AVANT LANCEMENT]` | Durée du contrat, puis délais légaux (pièces comptables) `[À CONFIRMER AVANT LANCEMENT]` |
| T7 | Données des clients traitées pour leur compte (sites, applications) | **Pas encore** | Selon chaque projet | Prestation | NovaForge est **sous-traitant** (art. 28) : contrat de sous-traitance à prévoir | Selon le projet | Selon le contrat |

## Suppression effective

Aucune base de données ne conserve de messages : la conservation se fait dans la messagerie.
**Aucune suppression automatique n'existe** (seules les fermetures passées sont purgées automatiquement, et elles ne
sont pas des données personnelles). Il faudra une procédure manuelle (rappel trimestriel) pour supprimer les messages
et les CV arrivés à échéance : `[À CONFIRMER AVANT LANCEMENT]` (responsable et outil).
