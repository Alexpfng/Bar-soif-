import { useCallback, useEffect, useRef, useState } from 'react';
import { AppShell } from '../components/layout/AppShell';
import { COL, FRAUNCES } from '../ui/theme';
import { usePeseAlco } from '../features/pesealco/usePeseAlco';
import { ecrireStockage } from '../lib/storage';
import { envoyerDemande } from '../features/champions/amis';
import {
  publierPresence, lireAmisPresents, lirePublicsProches, abonnerPresence, lireReglages, cardinal,
  type AmiPresent, type PublicProche, type Reglages, type Visibilite,
} from '../features/proximite/api';

const fmtBac = (g: number) => g.toFixed(2).replace('.', ',');
const fmtDist = (d: number) => (d < 1000 ? `${Math.round(d / 50) * 50} m` : `${(d / 1000).toFixed(1)} km`);

export default function CartePiliers() {
  const { bac, consos } = usePeseAlco();
  const nbConsos = consos.length;

  const [phase, setPhase] = useState<'pret' | 'charge' | 'ok' | 'refus' | 'erreur'>('pret');
  const [pos, setPos] = useState<{ lat: number; lon: number } | null>(null);
  const [amis, setAmis] = useState<AmiPresent[]>([]);
  const [publics, setPublics] = useState<PublicProche[]>([]);
  const [reglages, setReglages] = useState<Reglages>(() => lireReglages());
  const [flash, setFlash] = useState<string | null>(null);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const mapRef = useRef<any>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const layerRef = useRef<any>(null);
  const divRef = useRef<HTMLDivElement>(null);

  const rafraichir = useCallback(async (lat: number, lon: number) => {
    await publierPresence(lat, lon, bac, nbConsos);
    const [a, p] = await Promise.all([lireAmisPresents(), lirePublicsProches(lat, lon)]);
    setAmis(a);
    const idsAmis = new Set(a.map((x) => x.user_id));
    setPublics(p.filter((x) => !idsAmis.has(x.user_id)));
  }, [bac, nbConsos]);

  function activer() {
    setPhase('charge');
    if (!navigator.geolocation) { setPhase('erreur'); return; }
    navigator.geolocation.getCurrentPosition(async (g) => {
      const lat = g.coords.latitude, lon = g.coords.longitude;
      setPos({ lat, lon });
      await rafraichir(lat, lon);
      setPhase('ok');
    }, () => setPhase('refus'), { enableHighAccuracy: true, timeout: 12000 });
  }

  // Carte Leaflet : init + mise à jour des marqueurs
  useEffect(() => {
    if (phase !== 'ok' || !pos || !divRef.current) return;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const L = (window as any).L;
    if (!L) return;
    if (!mapRef.current) {
      mapRef.current = L.map(divRef.current, { attributionControl: false }).setView([pos.lat, pos.lon], 14);
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 19 }).addTo(mapRef.current);
      layerRef.current = L.layerGroup().addTo(mapRef.current);
      setTimeout(() => mapRef.current && mapRef.current.invalidateSize(), 120);
    }
    const Lg = layerRef.current;
    Lg.clearLayers();
    if (reglages.visibilite !== 'fantome') {
      L.circleMarker([pos.lat, pos.lon], { radius: 9, color: '#E9C46A', weight: 2, fillColor: '#E9C46A', fillOpacity: 1 }).addTo(Lg).bindPopup('Toi ⭐');
    }
    amis.forEach((a) => {
      L.circleMarker([a.lat, a.lon], { radius: 8, color: '#E14B3A', weight: 2, fillColor: '#E14B3A', fillOpacity: 0.9 })
        .addTo(Lg).bindPopup(`${a.pseudo} — ${a.consos} conso${a.consos > 1 ? 's' : ''}, ${fmtBac(a.bac)} g/L`);
    });
  }, [phase, pos, amis, reglages.visibilite]);

  useEffect(() => () => { if (mapRef.current) { mapRef.current.remove(); mapRef.current = null; } }, []);

  // Realtime : maj des amis présents
  useEffect(() => {
    if (phase !== 'ok') return;
    const off = abonnerPresence(() => lireAmisPresents().then(setAmis));
    return off;
  }, [phase]);

  // Re-publie quand mes consos / mon taux changent
  useEffect(() => { if (phase === 'ok' && pos) rafraichir(pos.lat, pos.lon); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, [bac, nbConsos]);

  function changerReglage(patch: Partial<Reglages>) {
    const suivant = { ...reglages, ...patch };
    setReglages(suivant);
    ecrireStockage('geo-visibilite', suivant.visibilite);
    ecrireStockage('geo-public', suivant.public);
    if (pos) rafraichir(pos.lat, pos.lon);
  }
  async function ajouter(p: PublicProche) {
    if (await envoyerDemande(p.user_id)) { setFlash(`Demande envoyée à ${p.pseudo} 🍻`); window.setTimeout(() => setFlash(null), 2500); }
  }

  // Moyenne du groupe (moi + amis présents)
  const consosGroupe = [nbConsos, ...amis.map((a) => a.consos)];
  const bacGroupe = [bac, ...amis.map((a) => a.bac)];
  const moyConsos = consosGroupe.reduce((s, x) => s + x, 0) / consosGroupe.length;
  const moyBac = bacGroupe.reduce((s, x) => s + x, 0) / bacGroupe.length;

  const boutonVis = (v: Visibilite, label: string) => (
    <button onClick={() => changerReglage({ visibilite: v })}
      style={{ flex: 1, minHeight: 44, borderRadius: 10, border: `2px solid ${reglages.visibilite === v ? COL.or : COL.bleu1}`, background: reglages.visibilite === v ? COL.or : COL.panneau, color: reglages.visibilite === v ? '#2A1F10' : COL.texte2, fontWeight: 800, fontSize: '0.8rem' }}>
      {label}
    </button>
  );

  return (
    <AppShell>
      <div style={{ background: '#14110F', borderBottom: `2px solid ${COL.or}`, padding: '20px 22px' }}>
        <h1 className="pmu-titre" style={{ fontSize: '1.8rem', margin: 0 }}>La <span className="accent">Carte</span> des piliers</h1>
        <p style={{ margin: '6px 0 0', color: COL.texte2, fontSize: '0.9rem', lineHeight: 1.45 }}>Tes potes sur la carte (façon Snap), et les piliers publics du coin à ajouter.</p>
      </div>

      {flash && <div role="status" style={{ margin: '14px 16px 0', background: COL.panneau, border: `1px solid ${COL.or}`, borderRadius: 12, padding: '12px 14px', color: COL.creme, fontWeight: 600, fontSize: '0.9rem' }}>{flash}</div>}

      {phase === 'pret' && (
        <section style={{ margin: '18px 16px 0', textAlign: 'center' }}>
          <div style={{ fontSize: '3.4rem' }} aria-hidden="true">🗺️</div>
          <p style={{ color: COL.texte2, margin: '8px 0 0', lineHeight: 1.5 }}>Active la carte pour voir tes potes autour. Tu choisis ta visibilité (et le <strong style={{ color: COL.texte }}>mode fantôme</strong> pour disparaître).</p>
          <button onClick={activer} className="pmu-arcade" style={{ width: '100%', marginTop: 18, minHeight: 60 }}>🗺️ Voir la carte</button>
          <p style={{ margin: '12px 2px 0', fontSize: '0.78rem', color: COL.texte2 }}>Position arrondie, jamais l’adresse exacte. Rien n’est partagé sans ton accord.</p>
        </section>
      )}
      {phase === 'charge' && <p style={{ textAlign: 'center', color: COL.texte2, padding: '30px 0' }}>On repère le coin… 🍺</p>}

      {phase === 'ok' && (
        <>
          {/* Réglages de visibilité */}
          <section style={{ margin: '14px 16px 0' }}>
            <div style={{ fontSize: '0.72rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.06em', color: COL.texte2, marginBottom: 6 }}>Ma visibilité</div>
            <div style={{ display: 'flex', gap: 8 }}>
              {boutonVis('precis', '📍 Précis')}
              {boutonVis('flou', '🌫️ Flou')}
              {boutonVis('fantome', '👻 Fantôme')}
            </div>
            <label style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 10, color: COL.texte2, fontSize: '0.9rem' }}>
              <input type="checkbox" checked={reglages.public} onChange={(e) => changerReglage({ public: e.target.checked })} style={{ width: 18, height: 18 }} />
              Visible en public (des inconnus peuvent m’ajouter, en flou)
            </label>
          </section>

          {/* Ambiance du groupe */}
          {amis.length > 0 && (
            <section style={{ margin: '14px 16px 0' }}>
              <div style={{ background: COL.orangeClair, border: `2px solid ${COL.or}`, borderRadius: 16, padding: '12px 16px', color: COL.creme, lineHeight: 1.5 }}>
                🍻 <strong>Ambiance du groupe</strong> ({consosGroupe.length} pilier{consosGroupe.length > 1 ? 's' : ''} ensemble) : moyenne <strong style={{ color: COL.or }}>{moyConsos.toFixed(1)} conso{moyConsos >= 2 ? 's' : ''}</strong> · <strong style={{ color: COL.or }}>{fmtBac(moyBac)} g/L</strong>
              </div>
            </section>
          )}

          {/* Carte */}
          <section style={{ margin: '14px 16px 0' }}>
            <div ref={divRef} style={{ width: '100%', height: 300, borderRadius: 16, overflow: 'hidden', border: `2px solid ${COL.bleu1}`, background: COL.panneau }} />
            {typeof (window as unknown as { L?: unknown }).L === 'undefined' && (
              <p style={{ color: COL.texte2, fontSize: '0.82rem', marginTop: 8 }}>Carte indisponible (hors ligne). Réessaie avec du réseau.</p>
            )}
          </section>

          {/* Inconnus publics à proximité */}
          <section style={{ margin: '20px 16px 0' }}>
            <h2 style={{ fontFamily: FRAUNCES, fontWeight: 700, fontSize: '1.1rem', color: COL.or, margin: '0 2px 10px' }}>Piliers publics dans le coin</h2>
            {publics.length === 0 ? (
              <div style={{ background: COL.panneau, border: `2px dashed ${COL.bleu1}`, borderRadius: 14, padding: '16px', textAlign: 'center', color: COL.texte2 }}>
                Personne de public autour pour l’instant. (Active « Visible en public » de ton côté pour jouer le jeu !)
              </div>
            ) : (
              <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: 8 }}>
                {publics.map((p) => (
                  <li key={p.user_id} style={{ display: 'flex', alignItems: 'center', gap: 10, background: COL.panneau, border: `1px solid ${COL.bleu1}`, borderRadius: 12, padding: '10px 12px' }}>
                    <span style={{ fontSize: '1.2rem' }} aria-hidden="true">🍺</span>
                    <span style={{ flex: 1, minWidth: 0, fontWeight: 700, color: COL.creme, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.pseudo}<br /><span style={{ fontSize: '0.75rem', color: COL.texte2, fontWeight: 600 }}>~{fmtDist(p.dist)} · {cardinal(p.cap)}</span></span>
                    <button onClick={() => ajouter(p)} className="pmu-arcade" style={{ minHeight: 42, padding: '0 12px', fontSize: '0.82rem' }}>+ Ajouter</button>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <div style={{ height: 20 }} />
        </>
      )}

      {phase === 'refus' && (
        <section style={{ margin: '16px 16px 0' }}>
          <div style={{ background: COL.panneau, border: `1px solid ${COL.bleu1}`, borderRadius: 16, padding: '18px 16px' }}>
            <p style={{ color: COL.texte2, lineHeight: 1.5, margin: 0 }}>Localisation refusée. Autorise la géoloc pour voir la carte des piliers.</p>
            <button onClick={() => setPhase('pret')} className="pmu-arcade" style={{ marginTop: 14, padding: '0 18px', minHeight: 48 }}>← Réessayer</button>
          </div>
        </section>
      )}
      {phase === 'erreur' && (
        <section style={{ margin: '16px 16px 0' }}>
          <div style={{ background: COL.panneau, border: `1px solid ${COL.bleu1}`, borderRadius: 16, padding: '18px 16px' }}>
            <p style={{ color: COL.texte2, lineHeight: 1.5, margin: 0 }}>Souci de géoloc/réseau. Réessaie dans un instant.</p>
            <button onClick={activer} className="pmu-arcade" style={{ marginTop: 14, padding: '0 18px', minHeight: 48 }}>↻ Réessayer</button>
          </div>
        </section>
      )}
    </AppShell>
  );
}
