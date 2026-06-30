import { useEffect, useRef, useState } from 'react';
import { Entete } from './Cadre';
import { COL } from '../../ui/theme';

// ── La Boussole à Bars ☀️ ───────────────────────────────────────────────────
// Géoloc → bars autour (OpenStreetMap / Overpass) + direction (boussole du tél)
// + ensoleillement du moment (position du soleil calculée + nuages Open-Meteo).
// 100 % gratuit, sans clé API. On ne calcule pas l'ombre des immeubles : on donne
// la direction du soleil pour viser les bonnes terrasses.

interface Bar { nom: string; lat: number; lon: number; dist: number; cap: number }

const CARDINAUX = ['Nord', 'Nord-Est', 'Est', 'Sud-Est', 'Sud', 'Sud-Ouest', 'Ouest', 'Nord-Ouest'];
const cardinal = (deg: number) => CARDINAUX[Math.round(((deg % 360) + 360) % 360 / 45) % 8];

function distance(aLat: number, aLon: number, bLat: number, bLon: number): number {
  const R = 6371000, r = Math.PI / 180;
  const dLat = (bLat - aLat) * r, dLon = (bLon - aLon) * r;
  const x = Math.sin(dLat / 2) ** 2 + Math.cos(aLat * r) * Math.cos(bLat * r) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(x));
}
function cap(aLat: number, aLon: number, bLat: number, bLon: number): number {
  const r = Math.PI / 180;
  const y = Math.sin((bLon - aLon) * r) * Math.cos(bLat * r);
  const x = Math.cos(aLat * r) * Math.sin(bLat * r) - Math.sin(aLat * r) * Math.cos(bLat * r) * Math.cos((bLon - aLon) * r);
  return (Math.atan2(y, x) / r + 360) % 360;
}

// Position du soleil (algorithme type SunCalc), azimut converti en degrés depuis le Nord.
function soleil(date: Date, lat: number, lon: number): { az: number; alt: number } {
  const rad = Math.PI / 180;
  const d = date.valueOf() / 86400000 - 0.5 + 2440588 - 2451545;
  const M = rad * (357.5291 + 0.98560028 * d);
  const C = rad * (1.9148 * Math.sin(M) + 0.02 * Math.sin(2 * M) + 0.0003 * Math.sin(3 * M));
  const L = M + C + rad * 102.9372 + Math.PI;
  const e = rad * 23.4397;
  const dec = Math.asin(Math.sin(e) * Math.sin(L));
  const ra = Math.atan2(Math.cos(e) * Math.sin(L), Math.cos(L));
  const lw = rad * -lon, phi = rad * lat;
  const th = rad * (280.16 + 360.9856235 * d) - lw;
  const H = th - ra;
  const azS = Math.atan2(Math.sin(H), Math.cos(H) * Math.sin(phi) - Math.tan(dec) * Math.cos(phi));
  const alt = Math.asin(Math.sin(phi) * Math.sin(dec) + Math.cos(phi) * Math.cos(dec) * Math.cos(H));
  return { az: (azS / rad + 180) % 360, alt: alt / rad };
}

export function BoussoleBars({ onRetour }: { onRetour: () => void }) {
  const [phase, setPhase] = useState<'pret' | 'charge' | 'ok' | 'refus' | 'erreur'>('pret');
  const [bars, setBars] = useState<Bar[]>([]);
  const [meteo, setMeteo] = useState<{ cloud: number; jour: boolean; temp: number } | null>(null);
  const [sun, setSun] = useState<{ az: number; alt: number } | null>(null);
  const [heading, setHeading] = useState<number | null>(null);
  const headRef = useRef<((e: DeviceOrientationEvent) => void) | null>(null);

  useEffect(() => () => { if (headRef.current) window.removeEventListener('deviceorientation', headRef.current); }, []);

  function ecouterBoussole() {
    const handler = (e: DeviceOrientationEvent) => {
      // iOS : webkitCompassHeading (depuis le Nord). Android absolu : 360 - alpha.
      const h = (e as unknown as { webkitCompassHeading?: number }).webkitCompassHeading;
      if (typeof h === 'number') setHeading(h);
      else if (e.absolute && e.alpha != null) setHeading((360 - e.alpha) % 360);
    };
    window.addEventListener('deviceorientation', handler);
    headRef.current = handler;
    const DO = (window as unknown as { DeviceOrientationEvent?: { requestPermission?: () => Promise<string> } }).DeviceOrientationEvent;
    if (DO && typeof DO.requestPermission === 'function') DO.requestPermission().catch(() => {});
  }

  async function chercher() {
    setPhase('charge');
    if (!navigator.geolocation) { setPhase('erreur'); return; }
    navigator.geolocation.getCurrentPosition(async (p) => {
      const { latitude: lat, longitude: lon } = p.coords;
      try {
        const requete = `[out:json][timeout:20];(node["amenity"~"^(bar|pub|cafe)$"](around:1300,${lat},${lon}););out body 40;`;
        const [rOsm, rMeteo] = await Promise.all([
          fetch('https://overpass-api.de/api/interpreter', { method: 'POST', body: 'data=' + encodeURIComponent(requete) }),
          fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=cloud_cover,is_day,temperature_2m`),
        ]);
        const osm = await rOsm.json();
        const m = await rMeteo.json();
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const liste: Bar[] = (osm.elements as any[])
          .filter((el) => el.tags && el.tags.name)
          .map((el) => ({ nom: el.tags.name as string, lat: el.lat, lon: el.lon, dist: distance(lat, lon, el.lat, el.lon), cap: cap(lat, lon, el.lat, el.lon) }))
          .sort((a, b) => a.dist - b.dist)
          .slice(0, 10);
        setBars(liste);
        setMeteo({ cloud: m.current?.cloud_cover ?? 0, jour: (m.current?.is_day ?? 1) === 1, temp: m.current?.temperature_2m ?? 0 });
        setSun(soleil(new Date(), lat, lon));
        ecouterBoussole();
        setPhase('ok');
      } catch { setPhase('erreur'); }
    }, () => setPhase('refus'), { enableHighAccuracy: true, timeout: 12000 });
  }

  const proche = bars[0];
  const ensoleillement = meteo && sun ? (sun.alt <= 0 ? 0 : Math.round((1 - meteo.cloud / 100) * 100)) : 0;
  const fmtDist = (d: number) => (d < 1000 ? `${Math.round(d)} m` : `${(d / 1000).toFixed(1)} km`);

  return (
    <>
      <Entete titre="La Boussole à Bars" onRetour={onRetour} />
      <section style={{ margin: '14px 16px 0' }}>
        {phase === 'pret' && (
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '3.6rem' }} aria-hidden="true">🧭</div>
            <p style={{ color: COL.texte2, margin: '8px 0 0', lineHeight: 1.5 }}>
              Trouve les <strong style={{ color: COL.texte }}>bars autour de toi</strong>, la direction à suivre, et où <strong style={{ color: COL.or }}>le soleil tape</strong> pour la terrasse.
            </p>
            <button onClick={chercher} className="pmu-arcade" style={{ width: '100%', marginTop: 20, minHeight: 64 }}>🧭 Trouver les bars autour</button>
            <p style={{ margin: '12px 2px 0', fontSize: '0.78rem', color: COL.texte2 }}>Géoloc utilisée une seule fois, rien n’est stocké. Données : OpenStreetMap & Open-Meteo.</p>
          </div>
        )}

        {phase === 'charge' && <p style={{ textAlign: 'center', color: COL.texte2, padding: '30px 0' }}>On scrute le quartier… 🍺</p>}

        {phase === 'ok' && (
          <>
            {/* Soleil / terrasse */}
            {meteo && sun && (
              <div style={{ background: COL.orangeClair, border: `2px solid ${COL.or}`, borderRadius: 16, padding: '14px 16px' }}>
                {sun.alt <= 0 ? (
                  <p style={{ margin: 0, color: COL.creme, lineHeight: 1.5 }}>🌙 <strong>Soleil couché.</strong> Vise plutôt l’intérieur, ou une terrasse chauffée. {Math.round(meteo.temp)}°C.</p>
                ) : (
                  <p style={{ margin: 0, color: COL.creme, lineHeight: 1.5 }}>
                    ☀️ <strong>Ensoleillement {ensoleillement}%</strong> ({meteo.cloud < 25 ? 'grand ciel bleu' : meteo.cloud < 60 ? 'quelques nuages' : 'plutôt couvert'}, {Math.round(meteo.temp)}°C).<br />
                    Le soleil tape au <strong style={{ color: COL.or }}>{cardinal(sun.az)}</strong> → vise les <strong>terrasses orientées {cardinal(sun.az)}</strong>.
                  </p>
                )}
              </div>
            )}

            {/* Boussole vers le bar le plus proche */}
            {proche && (
              <div style={{ textAlign: 'center', marginTop: 16 }}>
                <div style={{ position: 'relative', width: 150, height: 150, margin: '0 auto', borderRadius: '50%', background: COL.panneau, border: `2px solid ${COL.bleu1}` }}>
                  <div style={{ position: 'absolute', top: 6, left: '50%', transform: 'translateX(-50%)', fontSize: '0.6rem', fontWeight: 800, color: COL.texte2 }}>N</div>
                  <div style={{ position: 'absolute', top: '50%', left: '50%', fontSize: '3.2rem', lineHeight: 1, transform: `translate(-50%,-60%) rotate(${(proche.cap - (heading ?? 0))}deg)`, transition: 'transform 0.15s linear' }} aria-hidden="true">⬆️</div>
                </div>
                <p style={{ margin: '8px 0 0', fontSize: '0.82rem', color: COL.texte2 }}>
                  {heading == null ? `Flèche par rapport au Nord — tiens-toi face au Nord. ` : ''}Le plus proche : <strong style={{ color: COL.or }}>{proche.nom}</strong> au {cardinal(proche.cap)}.
                </p>
              </div>
            )}

            {/* Liste des bars */}
            <ul style={{ listStyle: 'none', margin: '16px 0 0', padding: 0, display: 'flex', flexDirection: 'column', gap: 8 }}>
              {bars.map((b, i) => (
                <li key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, background: COL.panneau, border: `1px solid ${i === 0 ? COL.or : COL.bleu1}`, borderRadius: 12, padding: '10px 12px' }}>
                  <span style={{ fontSize: '1.2rem' }} aria-hidden="true">🍺</span>
                  <span style={{ flex: 1, minWidth: 0, fontWeight: 700, color: COL.creme, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{b.nom}</span>
                  <span style={{ color: COL.texte2, fontSize: '0.82rem', fontWeight: 700, textAlign: 'right' }}>{fmtDist(b.dist)}<br /><span style={{ fontSize: '0.7rem' }}>{cardinal(b.cap)}</span></span>
                </li>
              ))}
              {bars.length === 0 && <li style={{ color: COL.texte2, textAlign: 'center', padding: '14px 0' }}>Aucun bar trouvé dans le coin… le désert. 🌵</li>}
            </ul>
            <button onClick={chercher} className="pmu-arcade pmu-arcade--ardoise" style={{ width: '100%', marginTop: 14, minHeight: 48 }}>↻ Rafraîchir</button>
          </>
        )}

        {phase === 'refus' && (
          <div style={{ background: COL.panneau, border: `1px solid ${COL.bleu1}`, borderRadius: 16, padding: '18px 16px', marginTop: 10 }}>
            <p style={{ color: COL.texte2, lineHeight: 1.5, margin: 0 }}>Localisation refusée. Autorise la géoloc dans ton navigateur pour trouver les bars autour.</p>
            <button onClick={() => setPhase('pret')} className="pmu-arcade" style={{ marginTop: 14, padding: '0 18px', minHeight: 48 }}>← Réessayer</button>
          </div>
        )}
        {phase === 'erreur' && (
          <div style={{ background: COL.panneau, border: `1px solid ${COL.bleu1}`, borderRadius: 16, padding: '18px 16px', marginTop: 10 }}>
            <p style={{ color: COL.texte2, lineHeight: 1.5, margin: 0 }}>Souci réseau ou service indisponible. Réessaie dans un instant.</p>
            <button onClick={chercher} className="pmu-arcade" style={{ marginTop: 14, padding: '0 18px', minHeight: 48 }}>↻ Réessayer</button>
          </div>
        )}
      </section>
    </>
  );
}
