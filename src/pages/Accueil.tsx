import { useNavigate } from 'react-router-dom';
import { AppShell } from '../components/layout/AppShell';
import { InstallBanner } from '../components/ui/InstallBanner';
import { Wordmark, ChevronDroit } from '../ui/icons';
import { COL, FRAUNCES } from '../ui/theme';
import { usePeseAlco } from '../features/pesealco/usePeseAlco';

const fmtBac = (g: number) => g.toFixed(2).replace('.', ',');

// Icônes des 4 comptoirs (stroke pilotable)
function IcoJauge({ c }: { c: string }) {
  return (
    <svg viewBox="0 0 24 24" width={30} height={30} fill="none" stroke={c} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M4 16 A8 8 0 0 1 20 16" /><line x1="12" y1="16" x2="16" y2="11" /><circle cx="12" cy="16" r="1.4" fill={c} stroke="none" />
    </svg>
  );
}
function IcoHautParleur({ c }: { c: string }) {
  return (
    <svg viewBox="0 0 24 24" width={30} height={30} fill="none" stroke={c} strokeWidth={2} strokeLinejoin="round" aria-hidden="true">
      <path d="M4 10 H8 L13 5 V19 L8 14 H4 Z" /><path d="M16.5 9 C18.5 10.5 18.5 13.5 16.5 15" /><path d="M19 7 C22 9.5 22 14.5 19 17" />
    </svg>
  );
}
function IcoArdoise({ c }: { c: string }) {
  return (
    <svg viewBox="0 0 24 24" width={30} height={30} fill="none" stroke={c} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="4" y="4" width="16" height="16" rx="2" /><line x1="7.5" y1="9" x2="16.5" y2="9" /><line x1="7.5" y1="12.5" x2="16.5" y2="12.5" /><line x1="7.5" y1="16" x2="12.5" y2="16" />
    </svg>
  );
}
function IcoTrophee({ c }: { c: string }) {
  return (
    <svg viewBox="0 0 24 24" width={30} height={30} fill="none" stroke={c} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M8 21 H16" /><path d="M12 17 V21" /><path d="M6 4 H18 V8 C18 11.3 15.3 13.5 12 13.5 C8.7 13.5 6 11.3 6 8 Z" /><path d="M18 5 H21 V7.5 C21 9 20 10 18.5 10" /><path d="M6 5 H3 V7.5 C3 9 4 10 5.5 10" />
    </svg>
  );
}

// Une « tuile comptoir » : gros bouton arcade vintage.
function Comptoir({ bg, fg, border, onClick, icon, label }: {
  bg: string; fg: string; border?: string; onClick: () => void; icon: React.ReactNode; label: string;
}) {
  return (
    <button onClick={onClick}
      style={{
        minHeight: 118, borderRadius: 18, background: bg, color: fg,
        border: border ? `2px solid ${border}` : 'none',
        boxShadow: '0 5px 0 rgba(0,0,0,0.45)',
        display: 'flex', flexDirection: 'column', alignItems: 'flex-start', justifyContent: 'space-between',
        gap: 8, padding: 16, fontFamily: FRAUNCES, fontWeight: 700, fontSize: '1.05rem', textAlign: 'left',
        textTransform: 'uppercase', letterSpacing: '0.01em', lineHeight: 1.05,
      }}>
      {icon}
      {label}
    </button>
  );
}

export default function Accueil() {
  const navigate = useNavigate();
  const { bac, etat, consos } = usePeseAlco();

  return (
    <AppShell>
      {/* En-tête enseigne */}
      <div style={{ position: 'relative', overflow: 'hidden', background: '#14110F', borderBottom: `2px solid ${COL.or}`, padding: '24px 22px 22px' }}>
        <div className="gingham" style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 6, opacity: 0.55 }} aria-hidden="true" />
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <img src={`${import.meta.env.BASE_URL}brand/logo.png`} alt="" width={64} height={64} style={{ borderRadius: 14, display: 'block', boxShadow: '0 4px 14px rgba(0,0,0,0.5)' }} />

          <div>
            <Wordmark taille="hero" color={COL.creme} />
            <p style={{ margin: '6px 0 0', fontSize: '0.8rem', fontWeight: 800, letterSpacing: '0.12em', textTransform: 'uppercase', color: COL.or }}>
              L&apos;appli des piliers de bar
            </p>
          </div>
        </div>
        <p style={{ margin: '16px 0 0', fontSize: '1rem', lineHeight: 1.55, color: COL.texte2, maxWidth: '40ch' }}>
          Salut pilier ! On suit la tournée, on garde l&apos;œil sur le compteur, et on rigole — avec modération.
        </p>
      </div>

      <InstallBanner />

      {/* Vedette : Le Pèse-Alco, taux en direct */}
      <section aria-label="Le Pèse-Alco" style={{ margin: '18px 16px 0' }}>
        <button onClick={() => navigate('/pese-alco')}
          style={{ display: 'block', width: '100%', textAlign: 'left', background: etat.fond, border: `2px solid ${etat.accent}`, borderRadius: 20, padding: '18px 20px', color: etat.texteSur }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ width: 9, height: 9, borderRadius: '50%', background: etat.accent }} />
            <span style={{ fontSize: '0.72rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em', flex: 1, color: COL.texte2 }}>
              Le Pèse-Alco · en direct
            </span>
            <ChevronDroit color={etat.texteSur} />
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginTop: 8 }}>
            <span style={{ fontFamily: FRAUNCES, fontWeight: 700, fontSize: '2.8rem', lineHeight: 1, color: etat.accent }}>{fmtBac(bac)}</span>
            <span style={{ fontWeight: 700 }}>g/L</span>
            <span style={{ marginLeft: 'auto', fontSize: '1.7rem' }} aria-hidden="true">{etat.emoji}</span>
          </div>
          <div style={{ marginTop: 6, fontWeight: 700, fontFamily: FRAUNCES, fontSize: '1.05rem' }}>{etat.titre}</div>
          <div style={{ marginTop: 2, fontSize: '0.85rem', color: COL.texte2 }}>
            {consos.length === 0 ? 'Aucune conso pour l’instant. Appuie pour ouvrir l’ardoise.' : `${consos.length} conso${consos.length > 1 ? 's' : ''} ce soir`}
          </div>
        </button>
      </section>

      {/* Les 4 comptoirs */}
      <nav aria-label="Les comptoirs" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, margin: '18px 16px 0' }}>
        <Comptoir bg={COL.rougeNeon} fg="#fff" onClick={() => navigate('/pese-alco')} icon={<IcoJauge c="#fff" />} label="Le Pèse-Alco" />
        <Comptoir bg={COL.or} fg="#2A1F10" onClick={() => navigate('/juke-box')} icon={<IcoHautParleur c="#2A1F10" />} label="Le Juke-Box à Conneries" />
        <Comptoir bg="#14110F" fg={COL.creme} border={COL.or} onClick={() => navigate('/ardoise')} icon={<IcoArdoise c={COL.or} />} label="L’Ardoise des Comptes" />
        <Comptoir bg={COL.ambre} fg="#2A1F10" onClick={() => navigate('/champions')} icon={<IcoTrophee c="#2A1F10" />} label="Le Tableau des Champions" />
      </nav>

      {/* L'Analyse — bilan WHOOP parodique */}
      <section style={{ margin: '12px 16px 0' }}>
        <button onClick={() => navigate('/analyse')}
          style={{ width: '100%', textAlign: 'left', display: 'flex', alignItems: 'center', gap: 14, background: COL.panneau, border: `2px solid ${COL.or}`, borderRadius: 18, padding: '16px 18px', color: COL.creme }}>
          <span style={{ fontSize: '1.9rem' }} aria-hidden="true">📊</span>
          <span style={{ flex: 1 }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontFamily: FRAUNCES, fontWeight: 700, fontSize: '1.05rem', color: COL.or }}>L&apos;Analyse</span>
              <span style={{ background: COL.rougeNeon, color: '#fff', fontSize: '0.6rem', fontWeight: 800, borderRadius: 999, padding: '2px 8px', letterSpacing: '0.05em' }}>NOUVEAU</span>
            </span>
            <span style={{ display: 'block', fontSize: '0.84rem', color: COL.texte2, marginTop: 2 }}>
              Ton bilan de pilier façon coach connecté… totalement à côté de la plaque.
            </span>
          </span>
          <ChevronDroit color={COL.or} />
        </button>
      </section>

      {/* Sécurité / modération */}
      <section style={{ margin: '22px 16px 0' }}>
        <div style={{ background: COL.panneau, border: `1px solid ${COL.bleu1}`, borderRadius: 16, padding: '14px 16px' }}>
          <p style={{ margin: 0, fontSize: '0.86rem', color: COL.texte2, lineHeight: 1.55 }}>
            <strong style={{ color: COL.or }}>On rigole, mais on assure.</strong> Les estimations de la Boît&apos;à Soif
            sont indicatives. L’abus d’alcool est dangereux pour la santé. Jamais d’alcool au volant.
          </p>
        </div>
      </section>

      <footer style={{ margin: '28px 22px 0', padding: '16px 0 8px', borderTop: '1px solid rgba(243,232,207,0.14)' }}>
        <p style={{ margin: 0, fontSize: '0.84rem', color: COL.texte2 }}>
          La Boît&apos;à Soif — l&apos;appli des piliers de bar.
        </p>
        <button onClick={() => navigate('/a-propos')}
          style={{ margin: '8px 0 0', padding: '6px 0', border: 'none', background: 'transparent', color: COL.or, fontSize: '0.84rem', fontWeight: 600, textDecoration: 'underline' }}>
          À propos de l&apos;application
        </button>
      </footer>
    </AppShell>
  );
}
