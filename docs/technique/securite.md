# Sécurité

> Document **préparatoire et interne** (non publié sur le site). Il n'a été validé ni par un avocat ni par un
> expert-comptable. Version du 28/10/2026.

## Contrôles réalisés (28/10/2026)

- **Secrets** : aucun dans les fichiers suivis. Recherche de motifs de clés Resend, de jetons et d'URL Upstash : aucun
  résultat. `.env` est ignoré par Git ; seul `.env.example` (sans valeur) est suivi.
- **Documents internes** : `docs/` n'est pas servi (seuls `public/` et `src/pages/` le sont).
- **Cookies** : aucun chez les visiteurs ; ceux d'administration sont `httpOnly`, `sameSite=lax` et `secure` en
  production (code). Détail dans [administration.md](administration.md).
- **Journaux** : l'envoi d'e-mails ne journalise plus le corps des réponses (risque de copie d'adresses e-mail).
- **Entrées** : champs des formulaires tronqués et validés côté serveur (`field`, `isEmail`, `isUrl`), CV limité en
  taille et en extension.

## Non réalisé

- Audit de dépendances : `npm audit` non exécuté pendant cette mission.
- Test d'intrusion.
- Revue de configuration Vercel et Upstash (accès, MFA).

## Recommandations

| Domaine | Mesure | Priorité |
|:--|:--|:--|
| Comptes | MFA sur GitHub, Vercel, Upstash, registraire et messagerie | P1 |
| Secrets | Uniquement dans les variables Vercel ; rotation de `SITE_PASSWORD` et des clés en cas de doute ; jamais en clair dans un ticket ou un document | P1 |
| Environnements | Préproduction Vercel (*preview*) avec ses propres variables ; ne jamais tester d'écriture sur la base de production (incident du 28/10/2026 : `.env` copié dans une copie de test) | P1 |
| Administration | Limite de tentatives par IP, MFA ou comptes nominatifs avant d'ouvrir l'accès à d'autres personnes | P2 |
| Dépôt | Protection de la branche `main` ; revue avant fusion quand l'équipe grandira | P2 |
| Dépendances | `npm audit` et mises à jour régulières (mensuelles `[À CONFIRMER AVANT LANCEMENT]`) | P2 |
| Données | Pas de donnée personnelle dans les journaux ; suppression manuelle planifiée (voir le registre) | P1 |
| En-têtes | Politique CSP et en-têtes de sécurité à étudier | P2 |
| Clients | Coffre-fort de mots de passe pour les accès clients ; accès révoqués en fin de mission | P1 |
