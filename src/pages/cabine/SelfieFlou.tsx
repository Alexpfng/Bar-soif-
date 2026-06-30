import { useState, useRef, useEffect } from 'react';
import { Entete } from './Cadre';
import { COL, FRAUNCES } from '../../ui/theme';
import { usePeseAlco } from '../../features/pesealco/usePeseAlco';

// ── Le Selfie Flou ───────────────────────────────────────────────────────────
// Ta vision selon ton taux : plus l'alcoolémie monte, plus l'image est floue.
// Le flou se recalcule en direct au re-render (le filtre dépend de `bac`).
export function SelfieFlou({ onRetour }: { onRetour: () => void }) {
  const { bac } = usePeseAlco();
  const [phase, setPhase] = useState<'pret' | 'active' | 'refus'>('pret');
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const fluxRef = useRef<MediaStream | null>(null);

  const flou = Math.min(16, bac * 3.5);

  useEffect(() => () => stopper(), []);

  // Attache le flux à la <video> une fois qu'elle est réellement montée
  // (phase 'active'). Indispensable : sinon la ref est nulle au moment du clic.
  useEffect(() => {
    const v = videoRef.current;
    if (phase === 'active' && v && fluxRef.current) {
      v.srcObject = fluxRef.current;
      v.play().catch(() => {});
    }
  }, [phase]);

  function stopper() {
    fluxRef.current?.getTracks().forEach((t) => t.stop());
    fluxRef.current = null;
    if (videoRef.current) videoRef.current.srcObject = null;
  }

  async function activer() {
    try {
      const flux = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' } });
      fluxRef.current = flux;
      setPhase('active'); // l'attache du flux se fait dans l'effet ci-dessus, une fois la <video> montée
    } catch {
      stopper();
      setPhase('refus');
    }
  }

  return (
    <>
      <Entete titre="Le Selfie Flou" onRetour={onRetour} />
      <section style={{ margin: '14px 16px 0' }}>
        {phase === 'pret' && (
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '3.6rem' }} aria-hidden="true">📸</div>
            <p style={{ color: COL.texte2, margin: '8px 0 0', lineHeight: 1.5 }}>
              Regarde-toi à travers <strong style={{ color: COL.texte }}>tes propres yeux</strong> :
              plus ton taux grimpe, plus l'image se brouille. À tester sur ton téléphone.
            </p>
            <button onClick={activer} className="pmu-arcade pmu-arcade--ambre" style={{ width: '100%', marginTop: 20, minHeight: 64 }}>
              📸 Activer la caméra
            </button>
          </div>
        )}

        {phase === 'active' && (
          <div style={{ textAlign: 'center' }}>
            <video
              autoPlay
              playsInline
              muted
              ref={videoRef}
              style={{ width: '100%', borderRadius: 16, filter: `blur(${flou}px)`, background: '#14110F', display: 'block' }}
            />
            <p style={{ color: COL.texte2, margin: '12px 0 0', lineHeight: 1.5 }}>
              Ta vision à <strong style={{ color: COL.or }}>{bac.toFixed(2).replace('.', ',')} g/L</strong>
            </p>
            <p style={{ color: COL.texte2, margin: '4px 0 0', fontSize: '0.82rem' }}>
              {flou < 0.5
                ? 'Net comme un sou neuf… pour l’instant.'
                : 'Ça se trouble, hein ? 100 % pour rire, évidemment.'}
            </p>
            <button onClick={() => { stopper(); setPhase('pret'); }} className="pmu-arcade pmu-arcade--ardoise" style={{ width: '100%', marginTop: 16 }}>
              Couper la caméra
            </button>
          </div>
        )}

        {phase === 'refus' && (
          <div style={{ background: COL.panneau, border: `2px solid ${COL.bleu1}`, borderRadius: 18, padding: '18px 16px' }}>
            <p style={{ margin: 0, color: COL.texte, lineHeight: 1.5, fontFamily: FRAUNCES, fontSize: '1.05rem' }}>
              📷 Caméra indisponible (ou refusée). À tester sur ton téléphone.
            </p>
            <button onClick={activer} className="pmu-arcade" style={{ width: '100%', marginTop: 16 }}>
              Réessayer
            </button>
          </div>
        )}
      </section>
    </>
  );
}
