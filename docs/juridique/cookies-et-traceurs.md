# Cookies et traceurs

> Document **préparatoire et interne** (non publié sur le site). Il n'a été validé ni par un avocat ni par un
> expert-comptable. Version du 28/10/2026.

**Référence** : [CNIL, cookies et autres traceurs](https://www.cnil.fr/fr/cookies-et-autres-traceurs/regles/cookies/que-dit-la-loi)
(consulté le 28/10/2026). Sont exemptés de consentement, notamment, les traceurs d'authentification et ceux
strictement nécessaires au service.

| Traceur | Qui | Finalité | Durée | Consentement |
|:--|:--|:--|:--|:--|
| `nf_admin` (cookie) | Administrateur seulement | Authentification | 30 jours | Exempté |
| `nf_apercu` (cookie) | Administrateur seulement | Aperçu du site verrouillé | Session | Exempté |
| `nf-live-reload` (`sessionStorage`) | Tous les visiteurs | Éviter les boucles de rechargement automatique (numéro de version) | Fermeture de l'onglet | Exempté (strictement nécessaire), **à confirmer par un juriste** |

**Contrôles réalisés** :
- aucun `Set-Cookie` sur le site en ligne, ni sur les tuiles OpenStreetMap ;
- aucune mesure d'audience ni script tiers ;
- aucune bannière n'est donc nécessaire aujourd'hui.

**Avant d'ajouter** une mesure d'audience, une vidéo intégrée ou un widget tiers : bannière conforme (refuser aussi
facilement qu'accepter, retrait possible), puis mise à jour de ce document et de la politique de confidentialité.
