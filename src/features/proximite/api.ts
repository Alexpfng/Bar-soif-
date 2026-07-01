// Découverte de proximité — confidentialité d'abord.
// - Amis : carte façon Snap Map (précis / flou / fantôme, au choix).
// - Inconnus : uniquement s'ils sont "visibles en public", et en FLOU (jamais de
//   point précis exposé — table séparée `presence_publique` à coords arrondies).

import { supabase } from '../../integrations/supabase/client';
import { lireStockage } from '../../lib/storage';

export type Visibilite = 'precis' | 'flou' | 'fantome';
export interface Reglages { visibilite: Visibilite; public: boolean }
export interface AmiPresent { user_id: string; pseudo: string; lat: number; lon: number; bac: number; consos: number; maj: string }
export interface PublicProche { user_id: string; pseudo: string; dist: number; cap: number }

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function f(t: string) { return (supabase as any).from(t); }
async function moi() { const { data } = await supabase.auth.getUser(); return data.user; }
function pseudoDe(u: { user_metadata?: { pseudo?: string } } | null): string {
  return ((u?.user_metadata?.pseudo as string) || '').trim() || 'Pilier';
}
const arrondi = (x: number, pas: number) => Math.round(x / pas) * pas;

export function lireReglages(): Reglages {
  return { visibilite: lireStockage<Visibilite>('geo-visibilite', 'flou'), public: lireStockage<boolean>('geo-public', false) };
}

export function distance(aLat: number, aLon: number, bLat: number, bLon: number): number {
  const R = 6371000, r = Math.PI / 180;
  const dLat = (bLat - aLat) * r, dLon = (bLon - aLon) * r;
  const x = Math.sin(dLat / 2) ** 2 + Math.cos(aLat * r) * Math.cos(bLat * r) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(x));
}
export function cap(aLat: number, aLon: number, bLat: number, bLon: number): number {
  const r = Math.PI / 180;
  const y = Math.sin((bLon - aLon) * r) * Math.cos(bLat * r);
  const x = Math.cos(aLat * r) * Math.sin(bLat * r) - Math.sin(aLat * r) * Math.cos(bLat * r) * Math.cos((bLon - aLon) * r);
  return (Math.atan2(y, x) / r + 360) % 360;
}
const CARDINAUX = ['N', 'NE', 'E', 'SE', 'S', 'SO', 'O', 'NO'];
export const cardinal = (deg: number) => CARDINAUX[Math.round(((deg % 360) + 360) % 360 / 45) % 8];

/** Publie ma position selon mes réglages (rien / flou / précis + éventuellement public).
 *  bac + consos sont partagés aux amis pour la « moyenne du groupe ». */
export async function publierPresence(lat: number, lon: number, bac = 0, consos = 0): Promise<void> {
  const u = await moi();
  if (!u) return;
  const r = lireReglages();
  const ps = pseudoDe(u);
  if (r.visibilite === 'fantome') {
    await f('presence_geo').delete().eq('user_id', u.id);
    await f('presence_publique').delete().eq('user_id', u.id);
    return;
  }
  const gLat = r.visibilite === 'flou' ? arrondi(lat, 0.003) : lat;
  const gLon = r.visibilite === 'flou' ? arrondi(lon, 0.003) : lon;
  await f('presence_geo').upsert({ user_id: u.id, pseudo: ps, lat: gLat, lon: gLon, bac: Number(bac.toFixed(3)), consos, maj: new Date().toISOString() }, { onConflict: 'user_id' });
  if (r.public) {
    await f('presence_publique').upsert({ user_id: u.id, pseudo: ps, lat_floue: arrondi(lat, 0.005), lon_floue: arrondi(lon, 0.005), maj: new Date().toISOString() }, { onConflict: 'user_id' });
  } else {
    await f('presence_publique').delete().eq('user_id', u.id);
  }
}

/** Amis présents (RLS : soi + amis acceptés). On retire soi-même. */
export async function lireAmisPresents(): Promise<AmiPresent[]> {
  const u = await moi();
  const { data, error } = await f('presence_geo').select('user_id, pseudo, lat, lon, bac, consos, maj');
  if (error || !data) return [];
  return (data as AmiPresent[]).map((a) => ({ ...a, bac: Number(a.bac), consos: Number(a.consos) })).filter((a) => a.user_id !== u?.id);
}

/** Inconnus publics à proximité, en flou (distance + direction). */
export async function lirePublicsProches(lat: number, lon: number): Promise<PublicProche[]> {
  const u = await moi();
  const { data, error } = await f('presence_publique').select('user_id, pseudo, lat_floue, lon_floue').limit(500);
  if (error || !data) return [];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (data as any[])
    .filter((p) => p.user_id !== u?.id)
    .map((p) => ({ user_id: p.user_id, pseudo: p.pseudo, dist: distance(lat, lon, p.lat_floue, p.lon_floue), cap: cap(lat, lon, p.lat_floue, p.lon_floue) }))
    .sort((a, b) => a.dist - b.dist)
    .slice(0, 20);
}

export interface Zone { lat: number; lon: number; nb: number; dist: number; cap: number }

/** « Les coins qui bougent » : agrège la présence publique par cellule (~500 m).
 *  Ne montre une zone qu'à partir de `seuil` piliers (anonyme, jamais un individu). */
export async function lireZonesChaudes(lat: number, lon: number, seuil = 2): Promise<Zone[]> {
  const { data, error } = await f('presence_publique').select('lat_floue, lon_floue').limit(1000);
  if (error || !data) return [];
  const cells = new Map<string, { lat: number; lon: number; nb: number }>();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (data as any[]).forEach((p) => {
    const k = `${p.lat_floue.toFixed(3)},${p.lon_floue.toFixed(3)}`;
    const e = cells.get(k) || { lat: p.lat_floue, lon: p.lon_floue, nb: 0 };
    e.nb++;
    cells.set(k, e);
  });
  return [...cells.values()]
    .filter((z) => z.nb >= seuil)
    .map((z) => ({ ...z, dist: distance(lat, lon, z.lat, z.lon), cap: cap(lat, lon, z.lat, z.lon) }))
    .sort((a, b) => b.nb - a.nb)
    .slice(0, 15);
}

export function abonnerPresence(onChange: () => void): () => void {
  const ch = supabase.channel('presence-geo').on('postgres_changes', { event: '*', schema: 'public', table: 'presence_geo' }, onChange).subscribe();
  return () => { supabase.removeChannel(ch); };
}
