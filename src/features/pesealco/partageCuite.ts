// À la clôture d'une session, on pousse un résumé « cuite » (partageable aux amis)
// dans la table `cuites` → alimente le profil façon Strava. Rien n'est poussé si
// pas connecté ou session vide.

import { supabase } from '../../integrations/supabase/client';
import { picBAC, type Conso, type Profil } from './widmark';

export async function pousserCuite(consos: Conso[], profil: Profil): Promise<void> {
  if (consos.length === 0) return;
  const { data } = await supabase.auth.getUser();
  const user = data.user;
  if (!user) return;
  const pseudo = ((user.user_metadata?.pseudo as string) || '').trim() || 'Pilier';
  const ts = consos.map((c) => c.ts);
  const dureeMin = Math.round((Math.max(...ts) - Math.min(...ts)) / 60000);
  const grammes = consos.reduce((s, c) => s + c.grammes, 0);
  const pic = picBAC(consos, profil);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  await (supabase as any).from('cuites').insert({
    user_id: user.id,
    pseudo,
    consos: consos.length,
    pic_bac: Number(pic.toFixed(3)),
    duree_min: dureeMin,
    grammes: Number(grammes.toFixed(1)),
  });
}
