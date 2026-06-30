import { lazy, Suspense } from 'react';
import { createBrowserRouter, type RouteObject } from 'react-router-dom';
import { RequireAuth } from './components/auth/RequireAuth';

// Lazy imports pour code-splitting par route
const Landing          = lazy(() => import('./pages/Landing'));
const Connexion        = lazy(() => import('./pages/Connexion'));
const CartePublique    = lazy(() => import('./pages/CartePublique'));
const Accueil          = lazy(() => import('./pages/Accueil'));
const PeseAlco         = lazy(() => import('./pages/PeseAlco'));
const JukeBox          = lazy(() => import('./pages/JukeBox'));
const Ardoise          = lazy(() => import('./pages/Ardoise'));
const Champions        = lazy(() => import('./pages/Champions'));
const Analyse          = lazy(() => import('./pages/Analyse'));
const Bientot          = lazy(() => import('./pages/Bientot'));
const FicheUrgence     = lazy(() => import('./pages/FicheUrgence'));
const Demarches        = lazy(() => import('./pages/Demarches'));
const JournalAidant    = lazy(() => import('./pages/JournalAidant'));
const ConseilsSection  = lazy(() => import('./pages/ConseilsSection'));
const ConseilDetail    = lazy(() => import('./pages/ConseilDetail'));
const OutilsSection    = lazy(() => import('./pages/OutilsSection'));
const OutilDetail      = lazy(() => import('./pages/OutilDetail'));
const OutilInteractif  = lazy(() => import('./pages/OutilInteractif'));
const ComprendreSection = lazy(() => import('./pages/ComprendreSection'));
const ComprendreDetail = lazy(() => import('./pages/ComprendreDetail'));
const Definitions      = lazy(() => import('./pages/Definitions'));
const Stereotypes      = lazy(() => import('./pages/Stereotypes'));
const AidesSection     = lazy(() => import('./pages/AidesSection'));
const AideDetail       = lazy(() => import('./pages/AideDetail'));
const Favoris          = lazy(() => import('./pages/Favoris'));
const Recherche        = lazy(() => import('./pages/Recherche'));
const Rendezvous       = lazy(() => import('./pages/Rendezvous'));
const APropos          = lazy(() => import('./pages/APropos'));
const NotFound         = lazy(() => import('./pages/NotFound'));

function Chargement() {
  return (
    <div className="flex items-center justify-center h-40" aria-label="Chargement…" role="status">
      <div className="w-8 h-8 rounded-full border-4 border-bleu-100 border-t-bleu-700 animate-spin" />
    </div>
  );
}

function S({ children }: { children: React.ReactNode }) {
  return <Suspense fallback={<Chargement />}>{children}</Suspense>;
}

// Route protégée : nécessite d'être connecté (sinon redirection vers /connexion)
function P({ children }: { children: React.ReactNode }) {
  return <Suspense fallback={<Chargement />}><RequireAuth>{children}</RequireAuth></Suspense>;
}

const routes: RouteObject[] = [
  // Public : site vitrine, connexion, carte partagée par QR code
  { path: '/',                      element: <S><Landing /></S> },
  { path: '/connexion',             element: <S><Connexion /></S> },
  { path: '/c',                     element: <S><CartePublique /></S> },

  // Application (accès direct, sans connexion)
  { path: '/app',                   element: <P><Accueil /></P> },
  { path: '/pese-alco',             element: <P><PeseAlco /></P> },
  { path: '/juke-box',              element: <P><JukeBox /></P> },
  { path: '/ardoise',               element: <P><Ardoise /></P> },
  { path: '/champions',             element: <P><Champions /></P> },
  { path: '/analyse',               element: <P><Analyse /></P> },
  { path: '/bientot',               element: <P><Bientot /></P> },
  { path: '/urgence',               element: <P><FicheUrgence /></P> },
  { path: '/journal-aidant',        element: <P><JournalAidant /></P> },
  { path: '/conseils',              element: <P><ConseilsSection /></P> },
  { path: '/conseils/:slug',        element: <P><ConseilDetail /></P> },
  { path: '/outils',                element: <P><OutilsSection /></P> },
  { path: '/outils/:slug',          element: <P><OutilDetail /></P> },
  { path: '/outils/:slug/outil',    element: <P><OutilInteractif /></P> },
  { path: '/comprendre',            element: <P><ComprendreSection /></P> },
  { path: '/comprendre/definitions', element: <P><Definitions /></P> },
  { path: '/comprendre/stereotypes', element: <P><Stereotypes /></P> },
  { path: '/comprendre/:slug',      element: <P><ComprendreDetail /></P> },
  { path: '/aides',                 element: <P><AidesSection /></P> },
  { path: '/aides/demarches',       element: <P><Demarches /></P> },
  { path: '/aides/:slug',           element: <P><AideDetail /></P> },
  { path: '/favoris',               element: <P><Favoris /></P> },
  { path: '/recherche',             element: <P><Recherche /></P> },
  { path: '/rendez-vous',           element: <P><Rendezvous /></P> },
  { path: '/a-propos',              element: <P><APropos /></P> },

  { path: '*',                      element: <S><NotFound /></S> },
];

// basename = base Vite (ex. '/Bar-soif-' sur GitHub Pages, '/' en local).
const basename = import.meta.env.BASE_URL.replace(/\/$/, '') || '/';
export const router = createBrowserRouter(routes, { basename });
