# Design — Les Concours (La Boît'à Soif)

Date : 2026-07-01
Statut : validé (brainstorm), à planifier
Brique 1/2 du chantier « proximité & concours » (indépendante de la Découverte).

## Objectif
Permettre à un pilier de **créer un salon de concours**, d'**inviter ses potes** via un
code court, de **jouer une épreuve** et de voir un **classement en temps réel** + un
podium final. **Aucune géolocalisation** n'est nécessaire → brique sûre.

## Périmètre (MVP)
3 modes d'épreuve, réutilisant l'existant :
1. **Tournoi mini-jeu** — épreuve = *Test de Réflexes* (score = temps de réaction, plus bas = meilleur). Architecture extensible à d'autres jeux (Rivière, Tap-tempo) plus tard.
2. **Duel de répliques** — chacun soumet une vanne ; tout le monde vote ; la plus votée gagne.
3. **Quiz live** — mêmes 10 questions pour tous ; score = bonnes réponses (+ bonus rapidité).

Hors périmètre (v2) : concours publics/ouverts aux inconnus, récompenses/badges, historique long, plus de jeux.

## Architecture & composants
- **Page `/concours`** : accueil (créer un concours / rejoindre par code) — accessible depuis l'onglet Champions.
- **Page `/concours/:code`** : salon (attente → épreuve → podium), pilotée par le statut.
- **`features/concours/`** : accès données (créer, rejoindre, publier score, voter, s'abonner au live) — même style que `features/champions/presence.ts`.
- Réutilise : système d'amis (invitation via le bouton *Inviter*), `parlerTavernier`, les composants de jeux existants (Réflexes, Quiz).

## Données (Supabase) + RLS
- `concours` (`id` uuid, `code` text unique court ex. `PMU-4213`, `hote` uuid, `mode` text, `statut` text `attente|en_cours|termine`, `created_at`).
- `concours_participants` (`concours_id`, `user_id`, `pseudo`, pk (concours_id,user_id)).
- `concours_scores` (`concours_id`, `user_id`, `score` numeric, `detail` jsonb, `updated_at`, pk (concours_id,user_id)).
- `concours_votes` (mode répliques : `concours_id`, `votant`, `cible`, pk (concours_id,votant)) — 1 vote/personne.
- **RLS** : lecture d'un concours + ses lignes réservée à ses participants (ou via le code pour rejoindre) ; insertion/maj de score & vote = soi uniquement (`auth.uid()`). Fonctions `SECURITY DEFINER` seulement si besoin (join par code), sinon policies simples.
- **Realtime** : abonnement sur `concours_participants` + `concours_scores` (+ `concours` pour le statut) → salle d'attente et classement live, comme `etats_soiree`.

## Flux
1. Hôte crée un concours (choisit le mode) → `code` généré → écran salon.
2. Potes rejoignent via le code (ou lien partagé par le bouton *Inviter*) → apparaissent en live dans la salle d'attente.
3. Hôte lance (`statut = en_cours`) → chacun joue l'épreuve → scores/votes remontés → classement live.
4. Fin (`statut = termine`) → **podium 🥇🥈🥉** + rejouer / nouveau concours.

## Gestion d'erreurs / robustesse
- Code introuvable / concours terminé → message clair.
- Hors-ligne / échec Realtime → repli sur rechargement manuel.
- Concours éphémères ; nettoyage des vieux concours (cron/optionnel v2).
- Compte obligatoire (déjà en place) → `auth.uid()` fiable pour la RLS.

## Tests / vérification
- Build TS OK.
- Test 2 comptes (Playwright) : créer → rejoindre par code → lancer → scores → podium visible des deux côtés (comme le test amis/Champions).
- Vérif RLS via `execute_sql` en simulant deux `auth.uid()`.
- Nettoyage des comptes de test après.

## Décisions
- Épreuves basées sur l'**adresse/le fun**, **jamais** sur le taux d'alcool (message responsable).
- Position : **aucune** (cette brique n'utilise pas la géoloc).
