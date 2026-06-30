import { useState } from 'react';
import { Entete } from './Cadre';
import { COL, FRAUNCES } from '../../ui/theme';
import { parlerTavernier } from '../../features/audio/sons';

// ── Le Traducteur Régional (version musclée) ────────────────────────────────
// Passe ta phrase à la moulinette d'un accent du terroir : dictionnaire de mots,
// transformations de sons, interjection en tête et chute typique en fin.
// Parodie d'accent 100 % affectueuse — on aime trop nos régions pour s'en moquer.

interface Region {
  cle: string;
  nom: string;
  emoji: string;
  mots: [string, string][]; // remplacements mot-à-mot (limites de mot, insensible casse)
  sons: [RegExp, string][]; // transformations de sons (simulation d'accent)
  prefixe: string[]; // interjection éventuelle en tête ('' = aucune)
  infixe: string[]; // mot de remplissage glissé après le 1er mot ('' = aucun)
  fin: string[]; // chute en fin de phrase
  finQuestion: string[]; // chute si c'est une question
}

const REGIONS: Region[] = [
  {
    cle: 'marseillais', nom: 'Marseillais', emoji: '☀️',
    mots: [
      ['oui', 'oui bé'], ['non', 'que dalle'], ['voiture', 'caisse'], ['travail', 'boulot'],
      ['fatigué', 'escagassé'], ['fatiguée', 'escagassée'], ['ami', 'collègue'], ['amis', 'collègues'],
      ['copain', 'collègue'], ['copains', 'collègues'], ['enfant', 'minot'], ['enfants', 'minots'],
      ['garçon', 'minot'], ['fille', 'minote'], ['fou', 'fada'], ['folle', 'fada'],
      ['bête', 'couillon'], ['bêtise', 'couillonnade'], ['idiot', 'couillon'], ['génial', 'dégun pareil'],
      ['super', 'de la balle'], ['beaucoup', 'un cagnard de'], ['très', 'vé très'], ['rien', 'que dalle'],
      ['nul', 'à la ramasse'], ['content', 'aux anges'], ['énervé', 'en pétard'], ['eau', 'flotte'],
      ['bière', 'mousse'], ['manger', 'bouffer'], ['argent', 'pélo'], ['maison', 'cabanon'],
      ['chez nous', 'au cabanon'], ['la mer', 'la grande bleue'], ['problème', 'cagade'],
      ['regarde', 'vé'], ['regardez', 'vé'], ['putain', 'putaing'], ['beaucoup de monde', 'un mar de monde'],
    ],
    sons: [[/([a-zà-ÿ])(ain|ein|oin|ien|in|an|en|on|un)\b/gi, '$1$2g']],
    prefixe: ['', 'Bé', 'Hé', 'Vé', 'Oh', 'Putaing'],
    infixe: ['', 'con', 'vé', 'putaing'],
    fin: [', peuchère.', ', bonne mère !', ', con !', ', hé bé.', ', oh fan de chichoune !'],
    finQuestion: [', con ?', ', hé bé ?', ', ou quoi ?', ', dis vé ?'],
  },
  {
    cle: 'chti', nom: 'Ch’ti', emoji: '⛏️',
    mots: [
      ["c'est", "ch'est"], ['c’est', 'ch’est'], ['moi', 'mi'], ['toi', 'ti'], ['lui', 'li'],
      ['ici', 'ichi'], ['petit', 'tiot'], ['petite', 'tiote'], ['garçon', 'biloute'],
      ['fille', 'fille'], ['content', 'binaise'], ['contente', 'binaise'], ['bien', 'fin bien'],
      ['beaucoup', 'plein'], ['fête', 'ducasse'], ['serpillière', 'wassingue'], ['oui', 'oui hein'],
      ['chéri', 'min tiot'], ['chérie', 'min tiote'], ['froid', 'frisquet'], ['bière', 'ch’bière'],
      ['jolie', 'bèle'], ['beau', 'bièu'], ['regarde', 'ervise'], ['comment', 'comint'],
      ['quoi', 'quo'], ['rien', 'rin'], ['demain', 'dmin'], ['argent', 'sous'],
      ['manger', 'minger'], ['enfant', 'tiot'], ['ami', 'biloute'],
    ],
    sons: [[/\bça\b/gi, 'cha'], [/\bce\b/gi, 'che'], [/\bces\b/gi, 'ches'], [/\bcette\b/gi, 'chette'], [/\bje\b/gi, 'ej'], [/\btu\b/gi, 'te']],
    prefixe: ['', 'Hein', 'Biloute', 'Eh ben', 'Boun dien'],
    infixe: ['', 'hein', 'biloute', 'tcho'],
    fin: [', hein biloute !', ', min tiot.', ', à l’ducasse !', ', boudin d’amour.'],
    finQuestion: [', hein ?', ', dis ti ?', ', no ?'],
  },
  {
    cle: 'belge', nom: 'Belge', emoji: '🍟',
    mots: [
      ['soixante-dix', 'septante'], ['quatre-vingt-dix', 'nonante'], ['serpillière', 'loque'],
      ['torchon', 'loque à reloqueter'], ['nettoyer', 'reloqueter'], ['sac', 'sachet'],
      ['copain', 'fieu'], ['copains', 'fieus'], ['ami', 'fieu'], ['amis', 'fieus'],
      ['génial', 'fameux'], ['super', 'fort bien'], ['oui', 'non peut-être'], ['beaucoup', 'un fameux paquet'],
      ['bien', 'fameux'], ['voiture', 'auto'], ['garçon', 'fiston'], ['sandwich', 'pistolet'],
      ['pain', 'pistolet'], ['endive', 'chicon'], ['frites', 'frites du fritkot'], ['pluie', 'drache'],
      ['téléphone', 'GSM'], ['portable', 'GSM'], ['fête', 'guindaille'], ['maintenant', 'pour l’instant'],
      ['bientôt', 'tantôt'], ['fatigué', 'naze'], ['fou', 'sot'], ['idiot', 'bièsse'],
      ['parler', 'babeler'], ['embrasser', 'bizouter'], ['bière', 'pintje'], ['argent', 'caillasse'],
      ['vraiment', 'pour de vrai'], ['d’accord', 'd’accord une fois'],
    ],
    sons: [],
    prefixe: ['', 'Allez', 'Dis', 'Hé', 'Sais-tu', 'Non peut-être'],
    infixe: ['', 'une fois', 'savez-vous', 'allez', 'hein'],
    fin: [', une fois.', ', non peut-être !', ', allez.', ', hein fieu.', ', pour de vrai.', ', saventieu.'],
    finQuestion: [', sais-tu ?', ', non peut-être ?', ', une fois ?', ', allez ?'],
  },
  {
    cle: 'toulousain', nom: 'Toulousain', emoji: '🏉',
    mots: [
      ['oui', 'oc'], ['non', 'que non'], ['petit', 'pitchoun'], ['petite', 'pitchoune'],
      ['fatigué', 'cané'], ['fatiguée', 'canée'], ['idiot', 'cascamèl'], ['bête', 'cascamèl'],
      ['beaucoup', 'un molon de'], ['colle', 'pègue'], ['collant', 'pègue'], ['pain au chocolat', 'chocolatine'],
      ['sac', 'poche'], ['sachet', 'poche'], ['regarde', 'vise un peu'], ['génial', 'que bèl'],
      ['super', 'de la mort'], ['très', 'de chez très'], ['bazar', 'cabourne'], ['désordre', 'cabourne'],
      ['garçon', 'drôle'], ['fille', 'drôlette'], ['copain', 'collègue'], ['ami', 'collègue'],
      ['content', 'aise'], ['énervé', 'en rogne'], ['mange', 'bafre'], ['bière', 'mousse'],
      ['argent', 'sous'], ['chaud', 'cramé'], ['mouillé', 'sope'],
    ],
    sons: [[/([a-zà-ÿ])(ain|ein|in|on)\b/gi, '$1$2g']],
    prefixe: ['', 'Boudu', 'Té', 'Adiu', 'Milodiou'],
    infixe: ['', 'cong', 'boudu', 'té'],
    fin: [', boudu !', ', cong.', ', té.', ', boudu cong !', ', putaing cong.'],
    finQuestion: [', qu’es aquò ?', ', cong ?', ', té ?'],
  },
  {
    cle: 'breton', nom: 'Breton', emoji: '🦀',
    mots: [
      ['oui', 'ya'], ['non', 'nann'], ['santé', 'yec’hed mat'], ['bonjour', 'demat'],
      ['au revoir', 'kenavo'], ['bon', 'mat'], ['beaucoup', 'un paquet de'], ['crêpe', 'crampouezh'],
      ['ami', 'mignon'], ['amis', 'mignoned'], ['copain', 'kamarad'], ['génial', 'du-mat'],
      ['super', 'kaer'], ['bizarre', 'drol'], ['pluie', 'crachin'], ['cidre', 'chistr'],
      ['bière', 'une chopine'], ['mer', 'ar mor'], ['fête', 'fest-noz'], ['fille', 'plac’h'],
      ['garçon', 'paotr'], ['idiot', 'sot'], ['fatigué', 'skuizh'], ['content', 'laouen'],
      ['beau', 'brav'], ['eau', 'dour'], ['manger', 'debriñ'], ['boire', 'evañ'],
      ['beaucoup de monde', 'ur bern tud'],
    ],
    sons: [],
    prefixe: ['', 'Dame', 'Hañ', 'Allez', 'Demat'],
    infixe: ['', 'dame', 'hañ', '’vat'],
    fin: [', dame !', ', hañ.', ', yec’hed mat !', ', gast !'],
    finQuestion: [', hañ ?', ', dame ?', ', neketa ?'],
  },
  {
    cle: 'corse', nom: 'Corse', emoji: '🏝️',
    mots: [
      ['oui', 'iè'], ['non', 'innò'], ['ami', 'o socciu'], ['amis', 'o socci'], ['copain', 'o socciu'],
      ['génial', 'troppu bellu'], ['super', 'bellu'], ['beaucoup', 'assai'], ['très', 'bell’è'],
      ['fatigué', 'stancu'], ['fatiguée', 'stanca'], ['content', 'cuntentu'], ['fou', 'toccu'],
      ['idiot', 'minchione'], ['beau', 'bellu'], ['belle', 'bella'], ['fille', 'zitella'],
      ['garçon', 'zitellu'], ['enfant', 'zitellu'], ['voiture', 'a vittura'], ['maison', 'a casa'],
      ['la mer', 'u mare'], ['montagne', 'a muntagna'], ['bonjour', 'bonghjornu'], ['au revoir', 'avvedeci'],
      ['santé', 'salute'], ['manger', 'manghjà'], ['boire', 'bèie'], ['vin', 'vinu'],
      ['problème', 'casinu'], ['tranquille', 'tranquillu'], ['argent', 'soldi'], ['maintenant', 'avà'],
      ['touriste', 'pinzutu'], ['continental', 'pinzutu'],
    ],
    sons: [],
    prefixe: ['', 'Oh', 'O', 'Eh', 'Madonna'],
    infixe: ['', 'o', 'Madonna', 'chì'],
    fin: [', o !', ', Madonna !', ', tranquillu.', ', o socciu.', ', avà !'],
    finQuestion: [', o ?', ', chì ?', ', innò ?'],
  },
  {
    cle: 'auvergnat', nom: 'Auvergnat', emoji: '🌾',
    mots: [
      ['oui', 'ouais ben'], ['non', 'que nenni'], ['voiture', 'guimbarde'], ['travail', 'ouvrage'],
      ['ami', 'fieu'], ['amis', 'fieus'], ['copain', 'gars'], ['garçon', 'drôle'],
      ['fille', 'drôlesse'], ['enfant', 'drôle'], ['génial', 'fameusement bon'], ['super', 'rudement bon'],
      ['beaucoup', 'des masses'], ['très', 'rudement'], ['fatigué', 'rendu'], ['fatiguée', 'rendue'],
      ['idiot', 'ballot'], ['bête', 'couillon'], ['content', 'bien aise'], ['argent', 'sous'],
      ['manger', 'casser la croûte'], ['boire', 's’humecter le gosier'], ['bière', 'chopine'],
      ['vin', 'pinard'], ['eau', 'flotte'], ['froid', 'frisquet'], ['beau', 'biau'], ['belle', 'bièle'],
      ['regarde', 'gueute voir'], ['problème', 'pétrin'], ['rien', 'que pouic'], ['maison', 'bicoque'],
    ],
    sons: [],
    prefixe: ['', 'Diantre', 'Bougre', 'Nom d’un chien', 'Pétard', 'Fan de garce'],
    infixe: ['', 'pardi', 'tè', 'mon bon'],
    fin: [', pardi !', ', nom d’un p’tit bonhomme.', ', bougre d’âne !', ', té pardi.', ', cré nom !'],
    finQuestion: [', pas vrai ?', ', hein donc ?', ', pardi ?'],
  },
  {
    cle: 'andalou', nom: 'Andalou', emoji: '💃',
    mots: [
      ['oui', 'sí'], ['non', 'no hombre'], ['ami', 'amigo'], ['amis', 'amigos'], ['copain', 'compadre'],
      ['génial', 'qué maravilla'], ['super', 'muy bien'], ['beaucoup', 'mucho'], ['très', 'muy'],
      ['fatigué', 'cansado'], ['fatiguée', 'cansada'], ['content', 'contento'], ['fou', 'loco'],
      ['idiot', 'tonto'], ['fille', 'señorita'], ['garçon', 'muchacho'], ['enfant', 'niño'],
      ['fête', 'fiesta'], ['danse', 'baile'], ['vin', 'vino tinto'], ['bière', 'cerveza'],
      ['eau', 'agua'], ['manger', 'comer'], ['boire', 'beber'], ['beau', 'guapo'], ['belle', 'guapa'],
      ['monsieur', 'señor'], ['madame', 'señora'], ['merci', 'gracias'], ['bonjour', 'hola'],
      ['demain', 'mañana'], ['argent', 'dinero'], ['soleil', 'sol'], ['la mer', 'el mar'], ['voiture', 'el coche'],
    ],
    sons: [],
    prefixe: ['', 'Olé', 'Hombre', 'Ay', 'Madre mía', 'Vamos'],
    infixe: ['', 'hombre', 'olé', 'muy'],
    fin: [', olé !', ', ¡madre mía !', ', amigo.', ', ¡vamos !', ', por favor.'],
    finQuestion: [', ¿no ?', ', ¿sí o qué ?', ', amigo ?'],
  },
];

const pioche = <T,>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];
const cap = (s: string) => (s ? s.charAt(0).toUpperCase() + s.slice(1) : s);
const minusc = (s: string) => (s ? s.charAt(0).toLowerCase() + s.slice(1) : s);

function traduire(phrase: string, r: Region): string {
  let p = phrase.trim();
  for (const [src, cib] of r.mots) {
    p = p.replace(new RegExp(`\\b${src.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'gi'), cib);
  }
  for (const [re, rep] of r.sons) p = p.replace(re, rep);

  const interro = /\?\s*$/.test(p);
  p = p.replace(/\s*[.!?]+\s*$/, '');

  // Infixe : glisse un mot de remplissage après le premier mot (effet « accent poussé »).
  const inf = pioche(r.infixe);
  if (inf) {
    const mots = p.split(' ');
    if (mots.length > 1) { mots.splice(1, 0, inf); p = mots.join(' '); }
  }

  const pref = pioche(r.prefixe);
  const corps = pref ? `${cap(pref)}, ${minusc(p)}` : cap(p);
  return corps + pioche(interro ? r.finQuestion : r.fin);
}

export function Traducteur({ onRetour }: { onRetour: () => void }) {
  const [phrase, setPhrase] = useState('');
  const [region, setRegion] = useState<Region>(REGIONS[0]);
  const [resultat, setResultat] = useState<string | null>(null);

  function lancer() {
    const source = phrase.trim();
    if (!source) return;
    const trad = traduire(source, region);
    setResultat(trad);
    parlerTavernier(trad);
  }

  return (
    <>
      <Entete titre="Le Traducteur Régional" onRetour={onRetour} />
      <section style={{ margin: '14px 16px 0' }}>
        <p style={{ color: COL.texte2, margin: '0 2px 14px', lineHeight: 1.5 }}>
          Écris ta phrase, choisis ta région, et écoute le comptoir te la rejouer avec l’accent. Pour rire, et avec affection.
        </p>

        <textarea
          value={phrase}
          onChange={(e) => setPhrase(e.target.value)}
          placeholder="Ex. : « Mon ami, c’est génial, j’ai bu beaucoup ! »"
          rows={3}
          style={{ width: '100%', background: '#14110F', border: `2px solid ${COL.bleu1}`, borderRadius: 12, color: COL.creme, padding: '12px 14px', fontSize: '1rem', lineHeight: 1.5, resize: 'vertical', fontFamily: 'inherit' }}
        />

        {/* Sélecteur de région (grille pour tenir les 5) */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8, marginTop: 12 }}>
          {REGIONS.map((r) => {
            const actif = r.cle === region.cle;
            return (
              <button key={r.cle} onClick={() => setRegion(r)}
                style={{ minHeight: 52, borderRadius: 12, border: `2px solid ${actif ? COL.or : COL.bleu1}`, background: actif ? COL.or : COL.panneau, color: actif ? '#2A1F10' : COL.texte2, fontWeight: 800, fontSize: '0.82rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
                <span style={{ fontSize: '1.1rem' }} aria-hidden="true">{r.emoji}</span>
                {r.nom}
              </button>
            );
          })}
        </div>

        <button onClick={lancer} className="pmu-arcade" style={{ width: '100%', marginTop: 14, minHeight: 60 }}>
          🗣️ Traduire
        </button>

        {resultat && (
          <div className="pmu-ardoise" style={{ marginTop: 18 }}>
            <div className="craie-2" style={{ fontSize: '0.72rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              Version {region.nom} {region.emoji}
            </div>
            <p className="craie" style={{ margin: '10px 0 0', fontFamily: FRAUNCES, fontSize: '1.3rem', lineHeight: 1.4 }}>
              « {resultat} »
            </p>
          </div>
        )}

        <p style={{ margin: '16px 2px 0', fontSize: '0.8rem', color: COL.texte2, lineHeight: 1.5 }}>
          Parodie d’accent, rien de méchant. Astuce : mets des mots comme « oui », « voiture », « ami », « génial », « beaucoup »… pour voir la magie.
        </p>
      </section>
    </>
  );
}
