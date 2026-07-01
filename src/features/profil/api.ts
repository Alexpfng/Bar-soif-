// Profil de pilier façon Strava : stats de cuites + photo. Les cuites sont
// visibles de soi + amis (RLS). L'avatar est stocké dans Supabase Storage.

import { supabase } from '../../integrations/supabase/client';

export interface Cuite { id: string; cloturee_at: string; consos: number; pic_bac: number; duree_min: number; grammes: number }
export interface ProfilPilier {
  userId: string; pseudo: string; avatarUrl: string | null; estMoi: boolean;
  nbCuites: number; totalConsos: number; record: number; moyConsos: number; cetteSemaine: number; cuites: Cuite[];
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function f(t: string) { return (supabase as any).from(t); }

export async function lireProfil(userId: string): Promise<ProfilPilier | null> {
  const { data: u } = await supabase.auth.getUser();
  const { data: prof } = await f('profiles').select('pseudo, avatar_url').eq('id', userId).maybeSingle();
  const { data: cuitesData } = await f('cuites').select('id, cloturee_at, consos, pic_bac, duree_min, grammes').eq('user_id', userId).order('cloturee_at', { ascending: false }).limit(50);
  const cuites = ((cuitesData || []) as Cuite[]).map((c) => ({ ...c, pic_bac: Number(c.pic_bac), grammes: Number(c.grammes), consos: Number(c.consos), duree_min: Number(c.duree_min) }));
  const nb = cuites.length;
  const totalConsos = cuites.reduce((s, c) => s + c.consos, 0);
  const record = cuites.reduce((m, c) => Math.max(m, c.pic_bac), 0);
  const semaine = Date.now() - 7 * 86400000;
  return {
    userId,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    pseudo: (prof as any)?.pseudo || 'Pilier',
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    avatarUrl: (prof as any)?.avatar_url || null,
    estMoi: u.user?.id === userId,
    nbCuites: nb, totalConsos, record, moyConsos: nb ? totalConsos / nb : 0,
    cetteSemaine: cuites.filter((c) => Date.parse(c.cloturee_at) >= semaine).length,
    cuites,
  };
}

/** Upload de la photo de profil dans le bucket `avatars`, puis MAJ de profiles.avatar_url. */
export async function uploaderAvatar(file: File): Promise<string | null> {
  const { data: u } = await supabase.auth.getUser();
  const user = u.user;
  if (!user) return null;
  const ext = (file.name.split('.').pop() || 'jpg').toLowerCase();
  const path = `${user.id}/avatar.${ext}`;
  const { error } = await supabase.storage.from('avatars').upload(path, file, { upsert: true, contentType: file.type || 'image/jpeg' });
  if (error) return null;
  const { data: pub } = supabase.storage.from('avatars').getPublicUrl(path);
  const url = `${pub.publicUrl}?t=${Date.now()}`;
  await f('profiles').update({ avatar_url: url }).eq('id', user.id);
  return url;
}
