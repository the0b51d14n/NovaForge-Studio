# Sous-traitants et transferts hors EEE

> Document **préparatoire et interne** (non publié sur le site). Il n'a été validé ni par un avocat ni par un
> expert-comptable. Version du 28/10/2026.

| Prestataire | Rôle | Données | Localisation | Encadrement des transferts | Contrat (DPA) |
|:--|:--|:--|:--|:--|:--|
| Vercel Inc. | Hébergement, fonctions serveur, CDN | Requêtes (IP), contenu des formulaires en transit | États-Unis, avec exécution des fonctions dans une région choisie (fra1 indiquée par le propriétaire, `[À CONFIRMER AVANT LANCEMENT]` vérification dans Vercel) | Data Privacy Framework (déclaré dans sa [politique](https://vercel.com/legal/privacy-policy), 01/06/2026) | DPA Vercel à accepter et archiver `[À CONFIRMER AVANT LANCEMENT]` |
| Upstash, Inc. | Base Redis des réglages de l'administration | Pas de données de visiteurs (adresse publiée, offres, fermetures) | Région choisie à la création (Europe indiquée) `[À CONFIRMER AVANT LANCEMENT]` | `[À CONFIRMER AVANT LANCEMENT]` | `[À CONFIRMER AVANT LANCEMENT]` |
| Resend | Envoi d'e-mails (inactif) | Contenu des formulaires et pièces jointes | États-Unis | Data Privacy Framework ([annonce de mars 2025](https://resend.com/changelog/data-privacy-framework-certification)), à revérifier sur dataprivacyframework.gov | DPA à accepter `[À CONFIRMER AVANT LANCEMENT]` |
| Messagerie professionnelle | Réception des messages | Contenu des messages, CV | `[À CONFIRMER AVANT LANCEMENT]` | `[À CONFIRMER AVANT LANCEMENT]` | `[À CONFIRMER AVANT LANCEMENT]` |
| OpenStreetMap Foundation | Tuiles de carte ; Nominatim (géocodage depuis l'administration) | Adresse IP ; adresse saisie | Royaume-Uni (décision d'adéquation UE) | Adéquation | Conditions d'utilisation des tuiles et de Nominatim |

Avant d'activer un nouveau service : vérifier la localisation, l'encadrement des transferts et le DPA, puis mettre
à jour ce tableau, le registre et la politique de confidentialité (`src/pages/confidentialite.astro`).
