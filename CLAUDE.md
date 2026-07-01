# Boîte à Soif — PWA de bar satirique (« les piliers de comptoir »), ton potache

App récréative pour rigoler au bar : taux d'alcool en direct, juke-box à conneries,
ardoise des comptes, classement des potes. Projet perso, **dupliqué d'Aphasaide**
(app d'aide à l'aphasie) puis détourné en enseigne de bar. Beaucoup d'héritage
Aphasaide subsiste dans le code (voir « Pièges connus »). Réf. d'inspiration : « Soirée2Malade ».

## Stack

- **Bun** (package manager + runtime CI) · **Vite 5** · **React 18** + **TypeScript strict** · **react-router-dom 6** (`createBrowserRouter`, routes en `lazy`).
- **Tailwind 3** (couleurs mappées sur des CSS vars, cf. `tokens.css`) + CSS maison dans `src/styles/`.
- **PWA** via `vite-plugin-pwa` (Workbox, `registerType: autoUpdate`, SW = `sw.js`).
- **Supabase** (`@supabase/supabase-js`) : **auth email/mot de passe**, synchro cloud multi-appareils, et Realtime (Champions / Concours). ⚠️ **L'app N'EST PAS sans login** — voir « Pièges connus ».
- Libs : `idb` (IndexedDB), `jspdf` + `qrcode` (exports/partage), `lucide-react`, `@fontsource/*`.
- **Pas de tests**, pas d'ESLint configuré (juste Prettier). Déploiement **GitHub Pages** (base `/boite-a-soif/`).

## Commandes

```bash
bun install              # dépendances (lockfile = bun.lock)
bun run dev              # Vite dev server sur http://localhost:8080 (host ::)
bun run build            # tsc -b && vite build  → dist/  (le typecheck fait échouer le build)
bun run preview          # sert le build de prod
bun run icons            # régénère les icônes PWA (sharp) — scripts/gen-icons*.mjs
```

- `.env` requis en local (voir `.env.example`) : `VITE_SUPABASE_URL`, `VITE_SUPABASE_PROJECT_ID`, `VITE_SUPABASE_PUBLISHABLE_KEY`. **Ne jamais lire ni committer `.env`.** La clé anon/publishable est publique (dans le bundle), c'est normal.
- **Déploiement** : push sur `main` → GitHub Actions (`.github/workflows/deploy.yml`) build en Bun et publie sur GitHub Pages. Les secrets Supabase viennent des *repo variables* CI. Fallback SPA via `dist/404.html`.
- Migrations Supabase versionnées dans `supabase/migrations/` (appliquer côté projet Supabase, pas automatiquement par le déploiement front).

## Architecture

- `src/App.tsx` : arbre de providers → `AuthProvider` > `AccessibilityProvider` > `ToastProvider` > `RouterProvider`.
- `src/router.tsx` : routes lazy. **Public** : `/` (Landing vitrine), `/connexion`. **Protégé** (`RequireAuth`) : `/app`, `/pese-alco`, `/juke-box`, `/ardoise`, `/champions`, `/amis`, `/concours[/:code]`, `/carte`, `/analyse`, `/cabine`, `/bientot`, `/a-propos`.
- `src/pages/` : une page par écran. Sous-dossier `pages/cabine/` = les mini-jeux de la « Cabine » (Quiz, Toasts, Surnom, Mytho, QuiPaie, Reflexes, Riviere, SelfieFlou, Traducteur, MotDuJour, Beauferie, BoussoleBars, NiveauABulle/Pilier, Cadre, Citations…).
- `src/features/<domaine>/` : logique métier (voir ci-dessous).
- `src/lib/` : `storage.ts` (localStorage namespacé + synchro), `idb.ts`, `pdf.ts`/`dossierPdf.ts` (jsPDF), `ics.ts` (calendrier), `carteLien.ts`.
- `src/components/` : `ui/` (Toast…), `layout/`, `a11y/` (contexte accessibilité), `auth/` (`RequireAuth`). `src/ui/` : `theme.ts` (constantes `COL`, `FRAUNCES`) + composants transverses.
- `src/integrations/supabase/` : `client.ts` (client unique) + `types.ts` (types générés).

Les 4 features phares :

- **Pèse-Alco** (`features/pesealco/`, page `PeseAlco`) : estimation du taux d'alcoolémie (BAC) par formule de Widmark. Cœur = `widmark.ts`, hook `usePeseAlco.ts`, `historique.ts`.
- **Juke-Box** (`features/jukebox/`, page `JukeBox`) : générateur de phrases/répliques (`phrases.ts`, `propositions.ts`) lues en voix (TTS `features/tts/useSpeech.ts`) avec bruitages Web Audio (`features/audio/sons.ts`).
- **Ardoise** (page `Ardoise`) : l'ardoise/le tableau des comptes et badges de comptoir.
- **Champions** (`features/champions/`, page `Champions`) : classement des potes. Realtime via `presence.ts` (table `etats_soiree`, RLS soi+amis) ; `amis.ts` gère les amis ; **`mock.ts` = fausse bande de potes** (données simulées, fallback ludique — le classement n'est PAS 100 % mock, il y a une vraie présence temps réel).

Features annexes : `concours/` (tournois par code court, Realtime), `proximite/` (carte des « piliers »), `rendezvous/` (ICS), `favoris/`, `cabine/` (contenu + oracle + progression/XP), `analyse/` (diagnostic satirique), `bienetre/` (héritage Aphasaide). `pages/Bientot.tsx` = écran « à venir ».

## Détails techniques notables

- **Widmark** (`features/pesealco/widmark.ts`) : BAC = accumulation chronologique des consos, apport `grammes / (r·masse)` avec `r` = 0.68 (h) / 0.55 (f) / 0.62 (autre), élimination `BETA = 0.15 g/L/h` entre chaque prise. Utilitaires : `grammesAlcool`, `picBAC`, `tempsSousSeuil`/`tempsRetourZero`, `formaterDuree`. Seuils FR : `LIMITE_LEGALE = 0.5`, `LIMITE_PROBATOIRE = 0.2`. 7 paliers d'ivresse satiriques (`etatBac`) avec `bredouiller()` (déforme le texte selon le BAC) + `paramsIvresse()` (pitch/débit TTS). **Toujours conserver l'avertissement « estimation ludique, ne remplace pas un éthylotest, ne pas conduire ».**
- **TTS** (`useSpeech.ts`) : Web Speech API, voix `fr-FR`, `rate 0.9`, file de blocs avec surlignage. Tolère l'absence d'API (`disponible`).
- **Web Audio** (`audio/sons.ts`) : bruitages 100 % synthétisés, **aucun asset audio**. AudioContext + TTS « déverrouillés » au 1er geste utilisateur (contrainte autoplay iOS/Safari/Chrome) ; gère `voiceschanged` asynchrone.
- **PWA** (`vite.config.ts`) : manifest inline (`La Boît'à Soif`, `theme/background #1B1917`, icônes 192/512/maskable), `navigateFallback: index.html`, runtime caching NetworkFirst sur navigations. `base` = `/boite-a-soif/` au build, `/` en dev, surchargeable par `VITE_BASE` (mettre `/` pour un hébergement à la racine).
- **Stockage** (`lib/storage.ts`) : localStorage namespacé par utilisateur (`aphasaide:u:<id>:<clé>`) ; les clés « globales » (a11y, bannière d'install) restent par-appareil. `cloudSync.ts` = « dernière écriture gagne » sur un blob JSONB (table `donnees_utilisateur`, RLS), tolérant hors-ligne / table absente.
- **Accessibilité** : héritée d'Aphasaide et toujours active — base 18px, `--font-scale` (100/115/130/150 %), mode confort (`--target-min 64px`). Le contenu est humoristique mais le socle a11y reste sérieux.

## Design / DA

DA **« enseigne de bar vintage / PMU »** posée par-dessus la structure Aphasaide.
- **Fichiers** : `src/styles/tokens.css` (variables), `src/styles/pmu.css` (couche PMU), `themes.css`, `print.css` ; `src/ui/theme.ts` (constantes JS). Tailwind lit les CSS vars.
- **Palette** : fond **ardoise** `#1B1917`, **or/jaune bière** `#E9C46A`, **ambre** `#EC9A4B`, **rouge néon** `#E14B3A`, **crème** `#F3E8CF`, nappe **vichy (gingham)** rouge & crème.
- **Typo** : `Fraunces` (display, titres-enseigne capitales), `Inter`/`Mulish` (texte).
- **Motifs signature** : `.pmu-titre` (enseigne, mot-accent en rouge), `.gingham`/`.gingham-sombre` (nappe vichy), `.pmu-ardoise` (panneau tableau noir). Emojis de comptoir assumés.
- ⚠️ **NE PAS reproposer de palette néon sombre** — refusée par le propriétaire. On reste sur l'ardoise + or + touches PMU.

## Pièges connus

- **« Sans login » est FAUX aujourd'hui.** `components/auth/RequireAuth.tsx` **redirige vers `/connexion` si non connecté** (son commentaire : « Ouvrir la boîte nécessite désormais d'être connecté »). Le commentaire du router (« accès direct, sans connexion ») est trompeur. Auth Supabase email/mot de passe requise pour toute l'app hors Landing. Ne pas supposer un accès anonyme sans vérifier `RequireAuth`.
- **Héritage Aphasaide partout.** Préfixe localStorage = `aphasaide:`, présence de features/pages médicales détournées (`bienetre/journal`, `outils/CarteAphasique`, `ParlePourMoi`, `SchemaCorps`, `TableauLangageAssiste`, etc.). Certaines ont été recyclées en gags, d'autres sont résiduelles — vérifier l'usage réel avant de s'appuyer dessus. Ne pas renommer le préfixe sans plan de migration (casse les données existantes).
- **Champions n'est pas 100 % mock** : `mock.ts` est un fallback simulé, mais `presence.ts` fait de la vraie synchro Realtime. Idem `concours/` et `proximite/` dépendent de Supabase + RLS.
- **Tables non typées** : `cloudSync.ts`, `presence.ts`, `concours/api.ts` font `(supabase as any).from(...)` car les tables ne sont pas dans les types générés par Lovable. Attendu, ne pas « corriger » à l'aveugle.
- **Base d'URL** : oublier `VITE_BASE`/`base` casse les liens sur GitHub Pages (servi sous `/boite-a-soif/`). Le `basename` du router en dépend.
- **Typecheck bloquant** : `strict` + `noUnusedLocals`/`noUnusedParameters` → `bun run build` échoue au moindre import/param inutilisé.

## Conventions

- **Code et UI en français** : noms de fonctions/variables/fichiers, commentaires, textes (`calculerBAC`, `seDeconnecter`, `pousser`…). Suivre cette convention pour rester cohérent.
- **Prettier** : `printWidth 100`, `semi: true`, `singleQuote: false` (guillemets doubles), `trailingComma: all`. Respecter avant commit.
- **Ton** : satirique / potache assumé, mais garder les avertissements sérieux (alcool, sécurité routière) et le socle d'accessibilité intacts.
- **Imports** : chemins relatifs (pas d'alias `@/`). Nouvelles routes en `lazy` dans `router.tsx`. Nouvelle logique métier → `src/features/<domaine>/`, pas dans les pages.
- **Ne jamais exposer** `.env` ni de secrets dans le code, les commits ou les logs.
