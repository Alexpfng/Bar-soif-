// ──────────────────────────────────────────────────────────────────────────
// Le Tableau des Champions
//  • Connecté : classement EN DIRECT de toi + tes amis (Supabase Realtime).
//  • Déconnecté : démo simulée + invitation à créer un compte.
//
// ⚠️ Ludique. L'abus d'alcool est dangereux. Jamais au volant : le vrai
// champion, c'est le Sam.
// ──────────────────────────────────────────────────────────────────────────

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppShell } from '../components/layout/AppShell';
import { COL, FRAUNCES } from '../ui/theme';
import { calculerBAC, etatBac } from '../features/pesealco/widmark';
import { usePeseAlco } from '../features/pesealco/usePeseAlco';
import { tchin, bip, vibrer } from '../features/audio/sons';
import { genererPotes } from '../features/champions/mock';
import { useAuth } from '../features/auth/AuthContext';
import { publierMonEtat, lireEtats, abonnerEtats, type EtatSoiree } from '../features/champions/presence';

const fmtBac = (g: number) => g.toFixed(2).replace('.', ',');

interface Ligne {
  id: string;
  pseudo: string;
  bac: number;
  estToi: boolean;
  sam: boolean;
  maj?: string;
}

function depuis(maj?: string): string {
  if (!maj) return '';
  const min = Math.floor((Date.now() - Date.parse(maj)) / 60000);
  if (min <= 0) return "à l'instant";
  if (min === 1) return 'il y a 1 min';
  if (min < 60) return `il y a ${min} min`;
  const h = Math.floor(min / 60);
  return `il y a ${h} h`;
}

function LigneScore({ l, rang }: { l: Ligne; rang: number }) {
  const etat = etatBac(l.bac);
  const emoji = l.sam ? '😇' : etat.emoji;
  return (
    <li style={{
      display: 'flex', alignItems: 'center', gap: 12, padding: '10px 12px', borderRadius: 12,
      background: l.estToi ? COL.orangeClair : l.sam ? 'rgba(233,196,106,0.12)' : 'rgba(243,232,207,0.05)',
      border: l.estToi ? `2px solid ${COL.or}` : l.sam ? '2px solid rgba(233,196,106,0.55)' : '1px solid rgba(243,232,207,0.12)',
      boxShadow: l.sam ? '0 0 16px rgba(233,196,106,0.30)' : 'none',
    }}>
      <span className="craie-accent" style={{ fontFamily: 'monospace', fontWeight: 800, fontSize: '1.35rem', minWidth: 42 }} aria-hidden="true">#{rang}</span>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div className="craie" style={{ fontWeight: 800, fontSize: '1rem', textTransform: 'uppercase', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {l.pseudo}{l.estToi ? ' ⭐' : ''}
        </div>
        <div className="craie-2" style={{ fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.04em' }}>
          {l.sam ? '😇 SAM' : etat.titre}{l.maj ? ` · ${depuis(l.maj)}` : ''}
        </div>
      </div>
      <div style={{ textAlign: 'right', display: 'flex', alignItems: 'baseline', gap: 4 }}>
        <span style={{ fontFamily: FRAUNCES, fontWeight: 800, fontSize: '1.5rem', lineHeight: 1, color: etat.accent }}>{fmtBac(l.bac)}</span>
        <span className="craie-2" style={{ fontSize: '0.72rem', fontWeight: 700 }}>g/L</span>
      </div>
      <span style={{ fontSize: '1.5rem', minWidth: 30, textAlign: 'center' }} aria-hidden="true">{emoji}</span>
    </li>
  );
}

export default function Champions() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { bac: bacToi } = usePeseAlco();
  const pseudo = ((user?.user_metadata?.pseudo as string) || '').trim() || 'Pilier';

  const [etats, setEtats] = useState<EtatSoiree[]>([]);
  const [maintenant, setMaintenant] = useState(() => Date.now());
  const [nudge, setNudge] = useState<string | null>(null);

  const recharger = useCallback(() => { if (user) lireEtats().then(setEtats); }, [user]);

  // Chargement + abonnement temps réel (connecté).
  useEffect(() => {
    if (!user) return;
    recharger();
    const off = abonnerEtats(recharger);
    const horloge = setInterval(() => setMaintenant(Date.now()), 30_000);
    return () => { off(); clearInterval(horloge); };
  }, [user, recharger]);

  // Publie mon taux (débouncé) à chaque variation.
  useEffect(() => {
    if (!user) return;
    const t = setTimeout(() => {
      const e = etatBac(bacToi);
      publierMonEtat(user.id, pseudo, bacToi, e.cle, e.emoji).then(recharger);
    }, 1200);
    return () => clearTimeout(t);
  }, [user, bacToi, pseudo, recharger]);

  // Démo (déconnecté) : potes simulés + « Toi ».
  const [potesDemo] = useState(() => genererPotes(Date.now()));
  const lignesDemo = useMemo<Ligne[]>(() => {
    const pts = potesDemo.map((p) => ({ id: p.id, pseudo: p.pseudo, bac: calculerBAC(p.consos, p.profil, maintenant), estToi: false, sam: false }));
    return [...pts, { id: 'toi', pseudo: 'Toi', bac: bacToi, estToi: true, sam: bacToi <= 0 }].sort((a, b) => b.bac - a.bac);
  }, [potesDemo, maintenant, bacToi]);

  const lignesLive = useMemo<Ligne[]>(() =>
    etats.map((e) => ({ id: e.user_id, pseudo: e.pseudo, bac: e.bac, estToi: e.user_id === user?.id, sam: e.bac <= 0, maj: e.maj })),
    [etats, user]);

  const montrerNudge = (m: string) => { setNudge(m); window.setTimeout(() => setNudge((c) => (c === m ? null : c)), 3000); };
  const trinquer = (p: string) => { vibrer([60, 40, 60]); tchin(); montrerNudge(`Tchin avec ${p} ! 🍻`); };
  const verreEau = (p: string) => { vibrer(400); bip(); montrerNudge(`Tournée d'eau pour ${p}. Bien vu, le Sam.`); };

  const seul = lignesLive.length <= 1;

  return (
    <AppShell>
      <section style={{ background: COL.bleu7, color: COL.creme, padding: '26px 22px 28px', borderBottom: `2px solid ${COL.or}` }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.82rem', fontWeight: 800, letterSpacing: '0.08em', textTransform: 'uppercase', color: COL.texte2 }}>
          <span style={{ width: 9, height: 9, borderRadius: '50%', background: COL.orangeAccent }} />
          {user ? 'En direct' : 'Démo'}
        </div>
        <h1 className="pmu-titre" style={{ fontSize: '2.1rem', marginTop: 10 }}>LE TABLEAU DES <span className="accent">CHAMPIONS</span></h1>
        <p style={{ margin: '8px 0 0', fontSize: '0.96rem', color: COL.texte2, lineHeight: 1.45 }}>
          {user ? 'Le classement de ta bande, en temps réel.' : 'Le classement de la bande — connecte-toi pour jouer en vrai.'}
        </p>
      </section>

      {nudge && (
        <div role="status" style={{ margin: '14px 16px 0', background: COL.panneau, color: COL.creme, border: `1px solid ${COL.or}`, borderRadius: 14, padding: '12px 16px', fontWeight: 600, fontSize: '0.92rem' }}>{nudge}</div>
      )}

      {/* ── CONNECTÉ : classement live ── */}
      {user ? (
        <>
          <section style={{ margin: '18px 16px 0', display: 'flex', flexWrap: 'wrap', gap: 10 }}>
            <button onClick={() => navigate('/amis')} className="pmu-arcade" style={{ flex: 1, minWidth: 100, minHeight: 52 }}>👥 Mes potes</button>
            <button onClick={() => navigate('/concours')} className="pmu-arcade pmu-arcade--ardoise" style={{ flex: 1, minWidth: 100, minHeight: 52 }}>🏆 Concours</button>
            <button onClick={() => navigate('/carte')} className="pmu-arcade pmu-arcade--ardoise" style={{ flex: 1, minWidth: 100, minHeight: 52 }}>🗺️ Carte</button>
          </section>

          <section style={{ margin: '16px 16px 0' }}>
            <div className="pmu-ardoise">
              <h2 className="craie" style={{ margin: '0 0 14px', fontFamily: FRAUNCES, fontWeight: 800, fontSize: '1.05rem', textTransform: 'uppercase', letterSpacing: '0.08em', textAlign: 'center' }}>🏆 Hall of Fame 🏆</h2>
              <ol style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: 10 }}>
                {lignesLive.map((l, i) => <LigneScore key={l.id} l={l} rang={i + 1} />)}
              </ol>
            </div>
          </section>

          {seul && (
            <section style={{ margin: '18px 16px 0' }}>
              <div style={{ background: COL.panneau, border: `2px dashed ${COL.or}`, borderRadius: 16, padding: '18px 16px', textAlign: 'center' }}>
                <p style={{ margin: '0 0 12px', color: COL.creme, lineHeight: 1.5 }}>Tu es tout seul au comptoir ! Ajoute des potes pour voir qui mène la tournée en direct.</p>
                <button onClick={() => navigate('/amis')} className="pmu-arcade" style={{ minHeight: 50, padding: '0 20px' }}>👥 Ajouter des potes</button>
              </div>
            </section>
          )}

          {!seul && (
            <section style={{ margin: '22px 16px 0' }}>
              <h2 style={{ margin: '0 0 12px 2px', fontFamily: FRAUNCES, fontWeight: 600, fontSize: '1.15rem', color: COL.or }}>Anime la tablée</h2>
              <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: 12 }}>
                {lignesLive.filter((l) => !l.estToi).map((l) => (
                  <li key={l.id} style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', background: COL.panneau, border: `1px solid ${COL.bleu1}`, borderRadius: 16, padding: '12px 14px' }}>
                    <span style={{ flex: 1, minWidth: 110, fontWeight: 800, fontSize: '0.95rem', color: COL.texte, textTransform: 'uppercase' }}>{l.pseudo}</span>
                    <button className="pmu-arcade" onClick={() => trinquer(l.pseudo)} style={{ minHeight: 48, padding: '0 14px', fontSize: '0.88rem' }}>🍻 Trinquer</button>
                    <button className="pmu-arcade pmu-arcade--ardoise" onClick={() => verreEau(l.pseudo)} style={{ minHeight: 48, padding: '0 14px', fontSize: '0.88rem' }}>💧 Verre d'eau</button>
                  </li>
                ))}
              </ul>
            </section>
          )}
        </>
      ) : (
        /* ── DÉCONNECTÉ : invitation + démo ── */
        <>
          <section style={{ margin: '18px 16px 0' }}>
            <button onClick={() => navigate('/connexion')} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 12, background: COL.rougeNeon, border: 'none', borderRadius: 16, padding: '16px 18px', color: '#fff', textAlign: 'left', boxShadow: '0 5px 0 rgba(0,0,0,0.4)' }}>
              <span style={{ fontSize: '1.8rem' }} aria-hidden="true">🏆</span>
              <span style={{ flex: 1 }}>
                <span style={{ display: 'block', fontFamily: FRAUNCES, fontWeight: 700, fontSize: '1.05rem' }}>Joue en vrai avec tes potes</span>
                <span style={{ display: 'block', fontSize: '0.84rem', opacity: 0.92, marginTop: 2 }}>Crée ton compte pour voir le taux de ta bande en temps réel.</span>
              </span>
              <span aria-hidden="true" style={{ fontSize: '1.4rem' }}>›</span>
            </button>
          </section>

          <section style={{ margin: '16px 16px 0' }}>
            <div className="pmu-ardoise">
              <h2 className="craie" style={{ margin: '0 0 14px', fontFamily: FRAUNCES, fontWeight: 800, fontSize: '1.05rem', textTransform: 'uppercase', letterSpacing: '0.08em', textAlign: 'center' }}>🏆 Hall of Fame (démo) 🏆</h2>
              <ol style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: 10 }}>
                {lignesDemo.map((l, i) => <LigneScore key={l.id} l={l} rang={i + 1} />)}
              </ol>
            </div>
          </section>

          <section style={{ margin: '18px 16px 0' }}>
            <div style={{ background: COL.orangeClair, border: `1px solid ${COL.bleu1}`, borderRadius: 16, padding: '12px 16px' }}>
              <p style={{ margin: 0, fontSize: '0.86rem', color: COL.texte2, lineHeight: 1.5 }}>🎮 Classement simulé (démo). Seul ton taux est réel. Connecte-toi pour le vrai classement entre potes.</p>
            </div>
          </section>
        </>
      )}

      {/* Avertissement modération */}
      <section style={{ margin: '24px 16px 0' }}>
        <div style={{ background: COL.panneau, border: `1px solid ${COL.bleu1}`, borderRadius: 16, padding: '14px 16px' }}>
          <p style={{ margin: 0, fontSize: '0.84rem', color: COL.texte2, lineHeight: 1.55 }}>
            <strong style={{ color: COL.or }}>⚠️ Pour rigoler entre potes.</strong> L'abus d'alcool est dangereux pour la santé. Le vrai champion, c'est le Sam. Ne prends <strong>jamais</strong> la route après avoir bu.
          </p>
        </div>
      </section>

      <footer style={{ margin: '24px 22px 0', padding: '16px 0 8px', borderTop: '1px solid rgba(243,232,207,0.14)' }}>
        <p style={{ margin: 0, fontSize: '0.82rem', color: COL.texte2 }}>À consommer avec modération. Le perdant paie quand même sa tournée.</p>
      </footer>
    </AppShell>
  );
}
