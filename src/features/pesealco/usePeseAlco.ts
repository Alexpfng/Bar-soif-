import { useCallback, useEffect, useMemo, useState } from 'react';
import { lireStockage, ecrireStockage } from '../../lib/storage';
import {
  calculerBAC,
  etatBac,
  grammesAlcool,
  picBAC,
  tempsRetourZero,
  tempsSousSeuil,
  LIMITE_LEGALE,
  PROFIL_DEFAUT,
  type Conso,
  type PresetBoisson,
  type Profil,
} from './widmark';
import { archiverSession } from './historique';
import { pousserCuite } from './partageCuite';

const CLE_PROFIL = 'pese-alco-profil';
const CLE_CONSOS = 'pese-alco-consos';

// Identifiant simple, sans dépendance (suffisant pour des consos locales).
function nouvelId(): string {
  return `${Date.now().toString(36)}-${Math.floor(Math.random() * 1e6).toString(36)}`;
}

/**
 * État complet du Pèse-Alco : profil bu­veur, consos de la session, et taux
 * d'alcoolémie recalculé en temps réel (l'horloge avance toute seule pour que
 * la courbe redescende même sans interaction).
 */
export function usePeseAlco() {
  const [profil, setProfilState] = useState<Profil>(() => lireStockage<Profil>(CLE_PROFIL, PROFIL_DEFAUT));
  const [consos, setConsos] = useState<Conso[]>(() => lireStockage<Conso[]>(CLE_CONSOS, []));
  const [maintenant, setMaintenant] = useState<number>(() => Date.now());

  // Horloge : on rafraîchit le taux toutes les 20 s (l'alcool s'élimine lentement).
  useEffect(() => {
    const t = setInterval(() => setMaintenant(Date.now()), 20_000);
    const onVisible = () => { if (!document.hidden) setMaintenant(Date.now()); };
    document.addEventListener('visibilitychange', onVisible);
    return () => { clearInterval(t); document.removeEventListener('visibilitychange', onVisible); };
  }, []);

  const setProfil = useCallback((maj: Partial<Profil>) => {
    setProfilState((p) => {
      const suivant = { ...p, ...maj };
      ecrireStockage(CLE_PROFIL, suivant);
      return suivant;
    });
  }, []);

  const persisterConsos = useCallback((suivant: Conso[]) => {
    ecrireStockage(CLE_CONSOS, suivant);
    return suivant;
  }, []);

  const ajouter = useCallback((preset: PresetBoisson) => {
    const conso: Conso = {
      id: nouvelId(),
      type: preset.type,
      label: `${preset.label} (${preset.volumeCl} cl)`,
      grammes: grammesAlcool(preset.volumeCl, preset.degre),
      emoji: preset.emoji,
      ts: Date.now(),
    };
    setMaintenant(Date.now());
    setConsos((c) => persisterConsos([...c, conso]));
  }, [persisterConsos]);

  const retirer = useCallback((id: string) => {
    setConsos((c) => persisterConsos(c.filter((x) => x.id !== id)));
  }, [persisterConsos]);

  const annulerDerniere = useCallback(() => {
    setConsos((c) => {
      if (c.length === 0) return c;
      const trie = [...c].sort((a, b) => a.ts - b.ts);
      const derniere = trie[trie.length - 1];
      return persisterConsos(c.filter((x) => x.id !== derniere.id));
    });
  }, [persisterConsos]);

  const viderSession = useCallback(() => {
    setConsos(persisterConsos([]));
  }, [persisterConsos]);

  // Clôture la soirée : archive la session courante dans l'historique puis vide.
  const cloturerSession = useCallback(() => {
    setConsos((c) => {
      archiverSession(c, profil);
      pousserCuite(c, profil).catch(() => { /* hors-ligne : la cuite locale reste dans l'historique */ });
      return persisterConsos([]);
    });
  }, [persisterConsos, profil]);

  const bac = useMemo(() => calculerBAC(consos, profil, maintenant), [consos, profil, maintenant]);
  const etat = useMemo(() => etatBac(bac), [bac]);
  const picBac = useMemo(() => picBAC(consos, profil), [consos, profil]);
  const msRetourZero = useMemo(() => tempsRetourZero(bac), [bac]);
  const msSousLimite = useMemo(() => tempsSousSeuil(bac, LIMITE_LEGALE), [bac]);
  const sousLimite = bac < LIMITE_LEGALE;

  const totalGrammes = useMemo(() => consos.reduce((s, c) => s + c.grammes, 0), [consos]);

  return {
    profil, setProfil,
    consos, ajouter, retirer, annulerDerniere, viderSession, cloturerSession,
    maintenant,
    bac, etat, picBac, msRetourZero, msSousLimite, sousLimite, totalGrammes,
  };
}
