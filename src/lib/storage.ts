// Petites aides localStorage avec préfixe commun et tolérance aux erreurs
// (mode navigation privée, quota plein, etc.)
//
// Espace personnel : quand un utilisateur est connecté, ses données sont
// rangées sous un espace de noms qui lui est propre (aphasaide:u:<id>:<clé>),
// de sorte que chaque compte a ses propres favoris, rendez-vous, notes, etc.,
// même sur un appareil partagé.
//
// Synchro multi-appareils : ces données personnelles sont aussi poussées vers
// le cloud (voir features/auth/cloudSync.ts). Ce module expose de quoi lire /
// écrire l'ensemble des données personnelles en bloc, s'abonner aux
// changements, et suivre l'horodatage de dernière modification locale.
//
// Les clés « globales » (préférence de taille du texte, bannière d'installation)
// restent communes à l'appareil, indépendamment du compte, et ne sont pas
// synchronisées.

const PREFIXE = 'aphasaide:';
const CLES_GLOBALES = new Set(['a11y', 'install-fermee']);

// Clés de données personnelles (synchronisées et importées au premier login).
export const CLES_PERSONNELLES = [
  'pese-alco-profil', 'pese-alco-consos', 'pese-alco-historique',
  'cabine-derniere', 'cabine-pisse', 'cabine-legendes', 'cabine-xp',
  'geo-visibilite', 'geo-public',
];

let utilisateurCourant: string | null = null;
const abonnes = new Set<() => void>();

/** Définit (ou efface) l'utilisateur connecté pour l'espace de noms du stockage. */
export function definirUtilisateurStockage(id: string | null): void {
  utilisateurCourant = id;
}

/** S'abonne aux modifications des données personnelles (retourne le désabonnement). */
export function onChangementStockage(cb: () => void): () => void {
  abonnes.add(cb);
  return () => { abonnes.delete(cb); };
}

function cleComplete(cle: string): string {
  if (utilisateurCourant && !CLES_GLOBALES.has(cle)) {
    return `${PREFIXE}u:${utilisateurCourant}:${cle}`;
  }
  return PREFIXE + cle;
}

function marquerModification(): void {
  if (!utilisateurCourant) return;
  try {
    localStorage.setItem(`${PREFIXE}u:${utilisateurCourant}:_maj`, String(Date.now()));
  } catch {
    // ignore
  }
  abonnes.forEach((cb) => { try { cb(); } catch { /* ignore */ } });
}

export function lireStockage<T>(cle: string, defaut: T): T {
  try {
    const brut = localStorage.getItem(cleComplete(cle));
    return brut === null ? defaut : (JSON.parse(brut) as T);
  } catch {
    return defaut;
  }
}

export function ecrireStockage<T>(cle: string, valeur: T): void {
  try {
    localStorage.setItem(cleComplete(cle), JSON.stringify(valeur));
  } catch {
    // Stockage indisponible : l'app reste utilisable, sans persistance
  }
  if (!CLES_GLOBALES.has(cle)) marquerModification();
}

/** Lit l'ensemble des données personnelles de l'utilisateur courant, en bloc. */
export function lireBlobPerso(): Record<string, unknown> {
  const blob: Record<string, unknown> = {};
  for (const cle of CLES_PERSONNELLES) {
    try {
      const brut = localStorage.getItem(cleComplete(cle));
      if (brut !== null) blob[cle] = JSON.parse(brut);
    } catch {
      // ignore
    }
  }
  return blob;
}

/** Écrit un bloc de données personnelles (hydratation depuis le cloud). Ne notifie pas. */
export function ecrireBlobPerso(blob: Record<string, unknown>): void {
  for (const cle of CLES_PERSONNELLES) {
    if (Object.prototype.hasOwnProperty.call(blob, cle)) {
      try {
        localStorage.setItem(cleComplete(cle), JSON.stringify(blob[cle]));
      } catch {
        // ignore
      }
    }
  }
}

/** Horodatage (ms) de la dernière modification locale non synchronisée. */
export function lireHorodatageModif(id: string): number {
  try {
    return Number(localStorage.getItem(`${PREFIXE}u:${id}:_maj`)) || 0;
  } catch {
    return 0;
  }
}

/** Fixe l'horodatage local (après une synchro réussie dans un sens ou l'autre). */
export function definirHorodatageModif(id: string, ms: number): void {
  try {
    localStorage.setItem(`${PREFIXE}u:${id}:_maj`, String(ms));
  } catch {
    // ignore
  }
}

/**
 * Importe une seule fois, vers l'espace du compte qui vient de se connecter,
 * les données personnelles déjà présentes en local sur l'appareil (saisies
 * avant la création du compte). N'écrase jamais des données déjà présentes
 * dans le compte. Sans effet si l'utilisateur a déjà fait cet import.
 */
export function importerDonneesLocales(id: string): void {
  if (!id) return;
  const drapeau = `${PREFIXE}u:${id}:_import-local`;
  try {
    if (localStorage.getItem(drapeau)) return;
    for (const cle of CLES_PERSONNELLES) {
      const legacy = localStorage.getItem(PREFIXE + cle);
      const cible = `${PREFIXE}u:${id}:${cle}`;
      if (legacy !== null && localStorage.getItem(cible) === null) {
        localStorage.setItem(cible, legacy);
      }
    }
    localStorage.setItem(drapeau, '1');
  } catch {
    // ignore
  }
}
