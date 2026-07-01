import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useA11y, CRANS_TAILLE } from './AccessibilityContext';
import { COL } from '../../ui/theme';
import { useAuth } from '../../features/auth/AuthContext';
import { ecrireStockage } from '../../lib/storage';
import { lireReglages, type Visibilite } from '../../features/proximite/api';

// Tiroir « Réglages » (droite) : compte, confidentialité de la carte, taille du texte.
interface Props { open: boolean; onClose: () => void }

export function AccessibilityPanel({ open, onClose }: Props) {
  const { prefs, setPrefs } = useA11y();
  const { user, seDeconnecter } = useAuth();
  const navigate = useNavigate();
  const panelRef = useRef<HTMLElement>(null);

  const [vis, setVis] = useState<Visibilite>(() => lireReglages().visibilite);
  const [pub, setPub] = useState<boolean>(() => lireReglages().public);

  useEffect(() => { if (open) panelRef.current?.focus(); }, [open]);
  useEffect(() => {
    if (!open) return;
    const h = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', h);
    return () => document.removeEventListener('keydown', h);
  }, [open, onClose]);
  if (!open) return null;

  const pseudo = ((user?.user_metadata?.pseudo as string) || '').trim() || 'Pilier';
  function changerVis(v: Visibilite) { setVis(v); ecrireStockage('geo-visibilite', v); }
  function changerPub(b: boolean) { setPub(b); ecrireStockage('geo-public', b); }
  async function deco() { onClose(); await seDeconnecter(); navigate('/', { replace: true }); }

  const titreSection: React.CSSProperties = { margin: '22px 0 8px', fontSize: '0.72rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', color: COL.texte2 };
  const boutonVis = (v: Visibilite, label: string) => (
    <button onClick={() => changerVis(v)} aria-pressed={vis === v}
      style={{ flex: 1, minHeight: 46, borderRadius: 10, border: `2px solid ${vis === v ? COL.or : COL.bleu1}`, background: vis === v ? COL.or : COL.panneau, color: vis === v ? '#2A1F10' : COL.texte2, fontWeight: 800, fontSize: '0.78rem' }}>
      {label}
    </button>
  );

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 60 }}>
      <button onClick={onClose} aria-label="Fermer le panneau" style={{ position: 'absolute', inset: 0, border: 'none', background: 'rgba(0,0,0,0.55)', width: '100%' }} />
      <aside ref={panelRef} role="dialog" aria-label="Réglages" tabIndex={-1}
        style={{ position: 'absolute', top: 0, right: 0, bottom: 0, width: '88%', maxWidth: 380, background: COL.ardoise, boxShadow: '-8px 0 30px rgba(0,0,0,0.6)', padding: 20, overflowY: 'auto', borderRadius: '24px 0 0 24px', outline: 'none', color: COL.creme }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <h2 className="pmu-titre" style={{ margin: 0, fontSize: '1.3rem' }}>Réglages</h2>
          <button onClick={onClose} aria-label="Fermer" style={{ width: 46, height: 46, border: 'none', borderRadius: 12, background: COL.panneau, color: COL.creme, fontSize: '1.1rem', fontWeight: 700 }}>✕</button>
        </div>

        {/* Mon compte */}
        <h3 style={titreSection}>Mon compte</h3>
        {user ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, background: COL.panneau, border: `1px solid ${COL.bleu1}`, borderRadius: 14, padding: '12px 14px' }}>
            <span style={{ width: 40, height: 40, borderRadius: '50%', background: COL.or, color: '#2A1F10', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '1.2rem', flexShrink: 0 }} aria-hidden="true">{pseudo.charAt(0).toUpperCase()}</span>
            <span style={{ flex: 1, minWidth: 0 }}>
              <span style={{ display: 'block', fontSize: '0.66rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', color: COL.texte2 }}>Connecté</span>
              <span style={{ display: 'block', fontWeight: 800, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{pseudo}</span>
            </span>
            <button onClick={deco} style={{ flexShrink: 0, minHeight: 40, padding: '0 14px', borderRadius: 10, border: `2px solid ${COL.bleu1}`, background: 'transparent', color: COL.texte2, fontWeight: 700, fontSize: '0.82rem' }}>Déconnexion</button>
          </div>
        ) : (
          <button onClick={() => { onClose(); navigate('/connexion'); }} className="pmu-arcade" style={{ width: '100%', minHeight: 52 }}>Se connecter</button>
        )}

        {/* Confidentialité de la carte */}
        <h3 style={titreSection}>Confidentialité de la carte</h3>
        <div style={{ display: 'flex', gap: 8 }}>
          {boutonVis('precis', '📍 Précis')}
          {boutonVis('flou', '🌫️ Flou')}
          {boutonVis('fantome', '👻 Fantôme')}
        </div>
        <label style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 12, color: COL.texte2, fontSize: '0.9rem', lineHeight: 1.4 }}>
          <input type="checkbox" checked={pub} onChange={(e) => changerPub(e.target.checked)} style={{ width: 18, height: 18, flexShrink: 0 }} />
          Visible en public (des inconnus peuvent m’ajouter, en flou)
        </label>
        <p style={{ margin: '8px 2px 0', fontSize: '0.76rem', color: COL.texte2, lineHeight: 1.5 }}>
          « Fantôme » = invisible de tous, même de tes potes. Ta position n’est jamais partagée précise sans ton accord.
        </p>

        {/* Taille du texte */}
        <h3 style={titreSection}>Taille du texte</h3>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 8 }}>
          {CRANS_TAILLE.map((sc) => {
            const sel = prefs.fontScale === sc;
            return (
              <button key={sc} onClick={() => setPrefs({ fontScale: sc })} aria-pressed={sel}
                style={{ border: `2px solid ${sel ? COL.or : COL.bleu1}`, borderRadius: 12, background: sel ? COL.or : COL.panneau, color: sel ? '#2A1F10' : COL.texte2, padding: '10px 4px', fontWeight: 700, fontSize: '0.82rem', minHeight: 52 }}>
                {sc} %
              </button>
            );
          })}
        </div>

        <p style={{ margin: '20px 0 0', fontSize: '0.76rem', color: COL.texte2 }}>Réglages enregistrés sur cet appareil (et synchronisés à ton compte).</p>
      </aside>
    </div>
  );
}
