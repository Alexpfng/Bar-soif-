// « Propose ta réplique » — désormais COMMUNAUTAIRE (partagé entre tous via
// Supabase). Tout le monde voit, propose et like ; le top du mois s'affiche
// dans le Juke-Box. Le « 1 like par personne » est géré au niveau de l'appareil
// (localStorage) — suffisant tant qu'il n'y a pas de comptes.

import { supabase } from '../../integrations/supabase/client';

export interface Proposition {
  id: string;
  texte: string;
  likes: number;
  created_at: string;
  dejaLike?: boolean; // ce device a déjà liké
}

const TABLE = 'repliques';
const CLE_LIKES = 'soif-repliques-likees';

// La table n'est pas dans les types générés : on contourne la vérif de type.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function table() { return (supabase as any).from(TABLE); }

function idsLikes(): Set<string> {
  try {
    return new Set(JSON.parse(localStorage.getItem(CLE_LIKES) || '[]') as string[]);
  } catch {
    return new Set();
  }
}
function marquerLike(id: string): void {
  try {
    const s = idsLikes();
    s.add(id);
    localStorage.setItem(CLE_LIKES, JSON.stringify([...s]));
  } catch {
    /* ignore */
  }
}

/** Toutes les répliques, plus likées d'abord. [] si la table n'existe pas encore. */
export async function lirePropositions(): Promise<Proposition[]> {
  const { data, error } = await table()
    .select('id, texte, likes, created_at')
    .order('likes', { ascending: false })
    .order('created_at', { ascending: false })
    .limit(200);
  if (error || !data) return [];
  const likes = idsLikes();
  return (data as Proposition[]).map((p) => ({ ...p, dejaLike: likes.has(p.id) }));
}

export async function ajouterProposition(texte: string): Promise<boolean> {
  const t = texte.trim();
  if (t.length < 2) return false;
  const { error } = await table().insert({ texte: t.slice(0, 120) });
  return !error;
}

/** Like (1 par appareil). Renvoie true si le like a bien été pris en compte. */
export async function likerProposition(id: string): Promise<boolean> {
  if (idsLikes().has(id)) return false;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase as any).rpc('liker_replique', { rid: id });
  if (error) return false;
  marquerLike(id);
  return true;
}

/** Réplique du mois = la plus likée parmi celles créées ce mois-ci. */
export function repliqueDuMois(liste: Proposition[]): Proposition | null {
  const debut = new Date();
  debut.setDate(1);
  debut.setHours(0, 0, 0, 0);
  const duMois = liste.filter((p) => new Date(p.created_at) >= debut);
  if (duMois.length === 0) return null;
  return duMois.reduce((meilleur, p) => (p.likes > meilleur.likes ? p : meilleur), duMois[0]);
}
