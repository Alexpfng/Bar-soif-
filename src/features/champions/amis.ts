// Gestion des amis (par pseudo). Une amitié = une ligne dans `amities`
// (demandeur → destinataire, statut en_attente | acceptee). Les pseudos sont
// lus dans `profiles` (lecture publique).

import { supabase } from '../../integrations/supabase/client';

export type SensAmitie = 'ami' | 'recue' | 'envoyee';

export interface LienAmi {
  amitieId: string;
  autreId: string;
  pseudo: string;
  sens: SensAmitie;
}

export interface ProfilTrouve {
  id: string;
  pseudo: string;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function from(t: string) { return (supabase as any).from(t); }

/** Cherche des piliers par pseudo (insensible à la casse), hors soi-même. */
export async function chercherProfils(q: string, monId: string): Promise<ProfilTrouve[]> {
  const terme = q.trim();
  if (terme.length < 2) return [];
  const { data, error } = await from('profiles')
    .select('id, pseudo')
    .ilike('pseudo', `%${terme}%`)
    .neq('id', monId)
    .limit(12);
  if (error || !data) return [];
  return data as ProfilTrouve[];
}

export async function envoyerDemande(destinataireId: string): Promise<boolean> {
  const { data: u } = await supabase.auth.getUser();
  const moi = u.user?.id;
  if (!moi) return false;
  const { error } = await from('amities').insert({ demandeur: moi, destinataire: destinataireId });
  return !error;
}

export async function accepterDemande(amitieId: string): Promise<boolean> {
  const { error } = await from('amities').update({ statut: 'acceptee' }).eq('id', amitieId);
  return !error;
}

/** Refuse une demande reçue, annule une demande envoyée, ou retire un ami. */
export async function retirerAmitie(amitieId: string): Promise<boolean> {
  const { error } = await from('amities').delete().eq('id', amitieId);
  return !error;
}

/** Liste mes liens (amis + demandes reçues + envoyées), pseudos résolus. */
export async function listerAmities(monId: string): Promise<LienAmi[]> {
  // La RLS ne renvoie déjà que les lignes où je suis demandeur ou destinataire,
  // donc pas besoin de filtre supplémentaire.
  const { data, error } = await from('amities')
    .select('id, demandeur, destinataire, statut');
  if (error || !data) return [];

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const liens = data as any[];
  const autresIds = Array.from(new Set(liens.map((l) => (l.demandeur === monId ? l.destinataire : l.demandeur))));
  const pseudos = new Map<string, string>();
  if (autresIds.length > 0) {
    const { data: profs } = await from('profiles').select('id, pseudo').in('id', autresIds);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (profs as any[] | null)?.forEach((p) => pseudos.set(p.id, p.pseudo));
  }

  return liens.map((l) => {
    const autreId = l.demandeur === monId ? l.destinataire : l.demandeur;
    let sens: SensAmitie;
    if (l.statut === 'acceptee') sens = 'ami';
    else if (l.destinataire === monId) sens = 'recue';
    else sens = 'envoyee';
    return { amitieId: l.id, autreId, pseudo: pseudos.get(autreId) ?? 'Pilier', sens };
  });
}
