import { lazy, Suspense } from 'react';
import { createBrowserRouter, type RouteObject } from 'react-router-dom';
import { RequireAuth } from './components/auth/RequireAuth';

// Lazy imports pour code-splitting par route
const Landing          = lazy(() => import('./pages/Landing'));
const Connexion        = lazy(() => import('./pages/Connexion'));
const Accueil          = lazy(() => import('./pages/Accueil'));
const PeseAlco         = lazy(() => import('./pages/PeseAlco'));
const JukeBox          = lazy(() => import('./pages/JukeBox'));
const Ardoise          = lazy(() => import('./pages/Ardoise'));
const Champions        = lazy(() => import('./pages/Champions'));
const Amis             = lazy(() => import('./pages/Amis'));
const Concours         = lazy(() => import('./pages/Concours'));
const ConcoursSalle    = lazy(() => import('./pages/ConcoursSalle'));
const CartePiliers     = lazy(() => import('./pages/CartePiliers'));
const Profil           = lazy(() => import('./pages/Profil'));
const Analyse          = lazy(() => import('./pages/Analyse'));
const Cabine           = lazy(() => import('./pages/Cabine'));
const Bientot          = lazy(() => import('./pages/Bientot'));
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
  // Public : site vitrine + connexion
  { path: '/',                      element: <S><Landing /></S> },
  { path: '/connexion',             element: <S><Connexion /></S> },

  // Application (accès direct, sans connexion)
  { path: '/app',                   element: <P><Accueil /></P> },
  { path: '/pese-alco',             element: <P><PeseAlco /></P> },
  { path: '/juke-box',              element: <P><JukeBox /></P> },
  { path: '/ardoise',               element: <P><Ardoise /></P> },
  { path: '/champions',             element: <P><Champions /></P> },
  { path: '/amis',                  element: <P><Amis /></P> },
  { path: '/concours',              element: <P><Concours /></P> },
  { path: '/concours/:code',        element: <P><ConcoursSalle /></P> },
  { path: '/carte',                 element: <P><CartePiliers /></P> },
  { path: '/profil/:id',            element: <P><Profil /></P> },
  { path: '/analyse',               element: <P><Analyse /></P> },
  { path: '/cabine',                element: <P><Cabine /></P> },
  { path: '/bientot',               element: <P><Bientot /></P> },
  { path: '/a-propos',              element: <P><APropos /></P> },

  { path: '*',                      element: <S><NotFound /></S> },
];

// basename = base Vite (ex. '/boite-a-soif' sur GitHub Pages, '/' en local).
const basename = import.meta.env.BASE_URL.replace(/\/$/, '') || '/';
export const router = createBrowserRouter(routes, { basename });
