# Design — La Découverte de proximité (La Boît'à Soif)

Date : 2026-07-01
Statut : validé (brainstorm), à planifier
Brique 2/2 du chantier « proximité & concours » (indépendante des Concours ; à implémenter APRÈS).

## Objectif
Permettre de **trouver des piliers à proximité** et de les **ajouter en amis**, de façon
**opt-in et respectueuse de la vie privée**. Modèle retenu : **amis + présence floue**, avec
un **réglage de confidentialité** contrôlé par l'utilisateur.

## Principe de sécurité (non négociable)
- **Visible en public = OFF par défaut.** Sans action explicite, un inconnu ne te voit jamais.
- **Position floutée à la source** : on ne stocke **jamais** la position précise. Elle est
  **arrondie à ~200 m** (grille/geohash) **côté client avant l'envoi**. La base ne contient
  donc pas d'adresse exacte, même en cas de fuite.
- **Inconnus** (public=true) : montrés en **flou** → pseudo + distance approx + direction. Jamais de point exact sur carte.
- **Amis** : visibles entre eux (sauf mode fantôme).
- **Mode fantôme** : coupure instantanée (invisible de tous, même des amis) en 1 tap.
- **Rafraîchissement à l'ouverture** de l'écran uniquement — **pas de tracking en fond**.
- Interaction avec un inconnu = **demande d'ami** uniquement (pas de position exacte, pas de messagerie en v1).
- App déjà réservée à un public adulte (alcool) → mention explicite conservée.

## Architecture & composants
- **Écran Réglages / confidentialité** (dans l'espace compte) : toggles *Visible en public*, *Mode fantôme*, rayon de découverte.
- **Écran Découverte** (dans la Cabine ou Champions) : bouton « Voir les piliers autour » → liste floue amis + inconnus publics.
- **`features/proximite/`** : arrondi de position (grille), publication de présence, requête de zone, s'abonner (optionnel). Réutilise le système d'amis (`features/champions/amis.ts`).

## Données (Supabase) + RLS
- `presence_geo` (`user_id` pk, `pseudo`, `lat_floue` numeric, `lon_floue` numeric, `public` bool default false, `maj` timestamptz). La position stockée est **déjà arrondie**.
- **RLS** : `select` autorisé si `public = true` OU `user_id = auth.uid()` OU l'autre est un **ami accepté** (via `amities`) ; `insert/update` = soi uniquement.
- Requête de découverte : bounding-box autour de ma cellule arrondie (± N cellules) → filtre distance ensuite côté client ; on n'expose que distance/direction, pas les coordonnées brutes dans l'UI.
- Pas de Realtime nécessaire en v1 (rafraîchissement à l'ouverture).

## Flux
1. (Une fois) L'utilisateur active *Visible en public* dans les réglages s'il le souhaite.
2. Écran Découverte → géoloc → arrondi → upsert `presence_geo` → requête de zone.
3. Affiche : amis à proximité (si présents) + inconnus publics (flou + distance/direction).
4. Sur un inconnu → **demande d'ami** → s'il accepte, il rejoint « Ma bande » (système existant).

## Gestion d'erreurs / robustesse
- Géoloc refusée → message + rien n'est publié.
- Aucun pilier autour → état vide honnête.
- Publication échoue → l'app reste utilisable.

## Tests / vérification
- Build TS OK.
- Test 2 comptes : A public + B public proches (positions simulées) se voient en flou ; A ajoute B ; vérifier qu'un compte **non-public** n'apparaît PAS ; vérifier RLS via `execute_sql` (simulation `auth.uid()`).
- Vérifier que la base ne contient jamais de coordonnées précises (arrondi).
- Nettoyage des comptes de test.

## Hors périmètre (v2)
- Blocage / signalement d'un utilisateur, messagerie, carte interactive, présence temps réel, filtres avancés.

## Dépendances
- S'appuie sur le système d'amis existant (`amities`) et les comptes obligatoires.
- Indépendante des Concours (peut être construite séparément).
