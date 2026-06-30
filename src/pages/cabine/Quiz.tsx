import { useState } from 'react';
import { Entete } from './Cadre';
import { COL, FRAUNCES } from '../../ui/theme';
import { parlerTavernier } from '../../features/audio/sons';

// ── Le Quiz Culture G de Bar ────────────────────────────────────────────────
interface Question { q: string; options: string[]; bonne: number; info: string }

const QUESTIONS: Question[] = [
  { q: 'Un « demi » de bière, c’est quel volume ?', options: ['25 cl', '50 cl', '33 cl'], bonne: 0, info: 'Piège classique : un demi fait 25 cl. À l’origine, un demi-litre… qui a fondu avec le temps.' },
  { q: 'Pourquoi le pastis se trouble quand on met de l’eau ?', options: ['Le sucre', 'L’anéthol (anis)', 'Le citron'], bonne: 1, info: 'L’anéthol, soluble dans l’alcool mais pas dans l’eau, forme un nuage : c’est le « louche ».' },
  { q: 'Quel pays boit le plus de bière par habitant ?', options: ['Allemagne', 'Belgique', 'Tchéquie'], bonne: 2, info: 'La Tchéquie, championne du monde toutes catégories, loin devant.' },
  { q: 'Le « trou normand », c’est…', options: ['Un verre de calva entre deux plats', 'Un fromage', 'Une danse'], bonne: 0, info: 'Un petit calvados au milieu du repas, censé « relancer » l’appétit.' },
  { q: 'Le mot « whisky » vient du gaélique « uisge beatha », qui veut dire…', options: ['Eau de feu', 'Eau de vie', 'Eau bénite'], bonne: 1, info: '« Eau de vie ». Les Écossais et les Irlandais se battent encore pour la paternité.' },
  { q: 'Le degré d’une bière « blonde » classique tourne autour de…', options: ['2°', '5°', '11°'], bonne: 1, info: 'Environ 5°. Les trappistes, elles, tapent souvent dans les 8–11°.' },
  { q: 'La gueule de bois porte un nom savant :', options: ['Veisalgie', 'Céphalée', 'Acouphène'], bonne: 0, info: 'La « veisalgie ». Ça en jette pour dire « j’ai trop bu hier ».' },
  { q: 'Le mojito est un cocktail originaire de…', options: ['Mexique', 'Cuba', 'Brésil'], bonne: 1, info: 'Cuba. La caïpirinha, elle, c’est le Brésil — ne confonds pas au comptoir.' },
  { q: 'À jeun, l’alcool atteint le cerveau en environ…', options: ['1 minute', '5 minutes', '30 minutes'], bonne: 1, info: 'Environ 5 minutes. D’où l’effet « cul sec » sur l’estomac vide. Mange un truc.' },
  { q: '« Sans alcool, la fête est plus folle » était le slogan de…', options: ['Pulco', 'Champomy', 'Oasis'], bonne: 1, info: 'Champomy, le « champagne » des enfants sages (et des soirées sans permis qui saute).' },
];

export function Quiz({ onRetour }: { onRetour: () => void }) {
  const [i, setI] = useState(0);
  const [choix, setChoix] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [fini, setFini] = useState(false);

  const q = QUESTIONS[i];

  function repondre(idx: number) {
    if (choix !== null) return;
    setChoix(idx);
    if (idx === q.bonne) setScore((s) => s + 1);
  }
  function suivante() {
    if (i + 1 >= QUESTIONS.length) { setFini(true); return; }
    setI(i + 1);
    setChoix(null);
  }
  function rejouer() { setI(0); setChoix(null); setScore(0); setFini(false); }

  if (fini) {
    const pct = score / QUESTIONS.length;
    const verdict = pct >= 0.8 ? { t: 'Tenancier diplômé 🎓', s: 'Tu connais ton comptoir mieux que ton salon.' }
      : pct >= 0.5 ? { t: 'Bon pilier', s: 'Solide, mais il reste des tournées à réviser.' }
        : { t: 'Apprenti soiffard', s: 'Faut traîner plus au bar, visiblement.' };
    parlerTavernier(`${score} sur ${QUESTIONS.length}. ${verdict.s}`, 0.5, 0.92);
    return (
      <>
        <Entete titre="Quiz Culture G de Bar" onRetour={onRetour} />
        <section style={{ margin: '18px 16px 0', textAlign: 'center' }}>
          <div className="pmu-ardoise">
            <div className="craie-2" style={{ fontSize: '0.74rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Score final</div>
            <div className="craie-accent" style={{ fontFamily: FRAUNCES, fontWeight: 800, fontSize: '3.4rem', lineHeight: 1, marginTop: 6 }}>{score}/{QUESTIONS.length}</div>
            <div className="craie" style={{ fontFamily: FRAUNCES, fontWeight: 700, fontSize: '1.3rem', marginTop: 8 }}>{verdict.t}</div>
            <p className="craie-2" style={{ marginTop: 6 }}>{verdict.s}</p>
          </div>
          <button onClick={rejouer} className="pmu-arcade" style={{ width: '100%', marginTop: 16, minHeight: 56 }}>↻ Rejouer</button>
        </section>
      </>
    );
  }

  return (
    <>
      <Entete titre="Quiz Culture G de Bar" onRetour={onRetour} />
      <section style={{ margin: '14px 16px 0' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', color: COL.texte2, fontSize: '0.8rem', fontWeight: 700, marginBottom: 8 }}>
          <span>Question {i + 1}/{QUESTIONS.length}</span><span>Score : {score}</span>
        </div>
        <div className="pmu-ardoise">
          <p className="craie" style={{ margin: 0, fontFamily: FRAUNCES, fontSize: '1.25rem', lineHeight: 1.35 }}>{q.q}</p>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 14 }}>
          {q.options.map((opt, idx) => {
            const repondu = choix !== null;
            const estBonne = idx === q.bonne;
            const estChoix = idx === choix;
            let bg: string = COL.panneau; let bord: string = COL.bleu1; const fg: string = COL.creme;
            if (repondu && estBonne) { bg = 'rgba(158,192,107,0.18)'; bord = COL.vert; }
            else if (repondu && estChoix) { bg = 'rgba(225,80,58,0.16)'; bord = COL.rouge; }
            return (
              <button key={idx} onClick={() => repondre(idx)} disabled={repondu}
                style={{ textAlign: 'left', minHeight: 56, padding: '12px 16px', borderRadius: 14, border: `2px solid ${bord}`, background: bg, color: fg, fontWeight: 700, fontSize: '1rem' }}>
                {repondu && estBonne ? '✅ ' : repondu && estChoix ? '❌ ' : ''}{opt}
              </button>
            );
          })}
        </div>
        {choix !== null && (
          <>
            <div style={{ marginTop: 14, background: COL.orangeClair, border: `1px solid ${COL.bleu1}`, borderRadius: 14, padding: '12px 14px', color: COL.creme, lineHeight: 1.5, fontSize: '0.92rem' }}>
              {choix === q.bonne ? '🍻 Bien vu ! ' : '🍺 Raté. '}{q.info}
            </div>
            <button onClick={suivante} className="pmu-arcade" style={{ width: '100%', marginTop: 14, minHeight: 56 }}>
              {i + 1 >= QUESTIONS.length ? 'Voir mon score' : 'Question suivante →'}
            </button>
          </>
        )}
      </section>
    </>
  );
}
