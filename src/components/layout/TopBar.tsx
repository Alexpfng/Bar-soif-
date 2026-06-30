import { useNavigate, useLocation } from 'react-router-dom';
import { Wordmark, IconeRecherche, IconeAccessibilite, IconeRetour } from '../../ui/icons';
import { COL } from '../../ui/theme';

interface Props {
  onOpenPanel: () => void;
}

export function TopBar({ onOpenPanel }: Props) {
  const navigate = useNavigate();
  const location = useLocation();
  const notAccueil = location.pathname !== '/app';

  return (
    <header
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 30,
        background: 'rgba(20,17,15,0.92)',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
        borderBottom: '1px solid rgba(243,232,207,0.12)',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 14px', minHeight: 60 }}>
        {notAccueil && (
          <button
            onClick={() => navigate(-1)}
            aria-label="Retour"
            className="hover-bleu"
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              width: 48, height: 48, border: 'none', background: 'transparent',
              borderRadius: 14, color: COL.or,
            }}
          >
            <IconeRetour />
          </button>
        )}
        <button
          onClick={() => navigate('/app')}
          aria-label="Accueil Boîte à Soif"
          style={{
            display: 'flex', alignItems: 'center', gap: 9,
            border: 'none', background: 'transparent', color: COL.bleu9, padding: '4px 2px',
          }}
        >
          <img src={`${import.meta.env.BASE_URL}brand/logo.png`} alt="" width={36} height={36} style={{ borderRadius: 8, display: 'block' }} />
          <Wordmark taille="topbar" />
        </button>
        <div style={{ flex: 1 }} />
        <button
          onClick={() => navigate('/recherche')}
          aria-label="Rechercher"
          className="hover-bleu"
          style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            width: 48, height: 48, border: 'none', background: 'transparent',
            borderRadius: 14, color: COL.or,
          }}
        >
          <IconeRecherche />
        </button>
        <button
          onClick={onOpenPanel}
          aria-label="Ouvrir les options d'accessibilité"
          style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            width: 48, height: 48, border: `2px solid ${COL.or}`, background: 'transparent',
            borderRadius: 14, color: COL.or,
          }}
        >
          <IconeAccessibilite />
        </button>
      </div>
    </header>
  );
}
