// ──────────────────────────────────────────────────────────────────────────
// Moteur d'onomatopées « comptoir » — 100 % Web Audio, sans aucun asset.
// Bruitages de synthèse (tchin, capsule, cacahuète, bip) + voix grave de
// tavernier (Web Speech API). Tout est tolérant à l'absence d'API.
//
// Robustesse navigateur :
//  • L'AudioContext et la synthèse vocale sont « déverrouillés » au tout
//    premier geste utilisateur (exigence d'autoplay de Chrome/Safari/iOS).
//  • Les voix TTS arrivent souvent de façon asynchrone : si getVoices() est
//    vide au moment de parler, on attend l'évènement `voiceschanged`.
// ──────────────────────────────────────────────────────────────────────────

let ctx: AudioContext | null = null;

function audio(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  try {
    const AC = window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AC) return null;
    if (!ctx) ctx = new AC();
    if (ctx.state === 'suspended') void ctx.resume();
    return ctx;
  } catch {
    return null;
  }
}

// Petit bip / note synthétique.
function note(freq: number, t0: number, duree: number, type: OscillatorType = 'triangle', gain = 0.18) {
  const ac = audio();
  if (!ac) return;
  const osc = ac.createOscillator();
  const g = ac.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, t0);
  g.gain.setValueAtTime(0.0001, t0);
  g.gain.exponentialRampToValueAtTime(gain, t0 + 0.008);
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + duree);
  osc.connect(g).connect(ac.destination);
  osc.start(t0);
  osc.stop(t0 + duree + 0.02);
}

// Salve de bruit blanc (impacts : capsule, crunch).
function bruit(t0: number, duree: number, gain = 0.25, highpass = 0) {
  const ac = audio();
  if (!ac) return;
  const n = Math.floor(ac.sampleRate * duree);
  const buffer = ac.createBuffer(1, n, ac.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < n; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / n);
  const src = ac.createBufferSource();
  src.buffer = buffer;
  const g = ac.createGain();
  g.gain.setValueAtTime(gain, t0);
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + duree);
  let node: AudioNode = src;
  if (highpass) {
    const f = ac.createBiquadFilter();
    f.type = 'highpass';
    f.frequency.value = highpass;
    node.connect(f);
    node = f;
  }
  node.connect(g).connect(ac.destination);
  src.start(t0);
  src.stop(t0 + duree + 0.02);
}

/** Tchin ! Deux verres qui s'entrechoquent (harmoniques cristallines). */
export function tchin() {
  const ac = audio();
  if (!ac) return;
  const t = ac.currentTime;
  note(1180, t, 0.5, 'triangle', 0.16);
  note(1760, t + 0.005, 0.45, 'sine', 0.12);
  note(2640, t + 0.01, 0.35, 'sine', 0.06);
}

/** Capsule de bière qui saute (« pop » + « pschitt » gazeux). */
export function capsule() {
  const ac = audio();
  if (!ac) return;
  const t = ac.currentTime;
  note(160, t, 0.09, 'square', 0.22);
  bruit(t + 0.02, 0.22, 0.22, 1800);
}

/** Cacahuète qui croque (impact bref et mat). */
export function cacahuete() {
  const ac = audio();
  if (!ac) return;
  bruit(ac.currentTime, 0.07, 0.3, 900);
}

/** Bip d'interface générique. */
export function bip(freq = 660) {
  const ac = audio();
  if (!ac) return;
  note(freq, ac.currentTime, 0.08, 'square', 0.14);
}

/** Petite fanfare montante (déblocage de badge, victoire arcade). */
export function fanfare() {
  const ac = audio();
  if (!ac) return;
  const t = ac.currentTime;
  [523, 659, 784, 1047].forEach((f, i) => note(f, t + i * 0.1, 0.18, 'square', 0.13));
}

// ── Voix du tavernier (TTS grave) ──────────────────────────────────────────

const aTTS = typeof window !== 'undefined' && 'speechSynthesis' in window;
let voixFr: SpeechSynthesisVoice | null = null;

function chargerVoix(): void {
  if (!aTTS) return;
  const v = window.speechSynthesis.getVoices();
  if (v.length) {
    voixFr = v.find((x) => x.lang === 'fr-FR') ?? v.find((x) => x.lang.startsWith('fr')) ?? null;
  }
}

if (aTTS) {
  chargerVoix();
  // Les voix arrivent souvent après coup : on réessaie à l'évènement dédié.
  try {
    window.speechSynthesis.addEventListener('voiceschanged', chargerVoix);
  } catch {
    window.speechSynthesis.onvoiceschanged = chargerVoix;
  }
}

function vraimentParler(texte: string, pitch: number, rate: number): void {
  const S = window.speechSynthesis;
  if (S.speaking || S.pending) S.cancel(); // on coupe une déclamation en cours
  const u = new SpeechSynthesisUtterance(texte);
  u.lang = 'fr-FR';
  u.rate = rate;
  u.pitch = pitch;
  if (!voixFr) chargerVoix();
  if (voixFr) u.voice = voixFr;
  S.speak(u);
  try { S.resume(); } catch { /* Chrome reste parfois bloqué en pause */ }
}

/**
 * Fait parler le « tavernier » : français, voix grave, débit posé.
 * Si les voix ne sont pas encore prêtes (cas fréquent au 1er clic sur Chrome),
 * on attend `voiceschanged` (avec un filet de sécurité). Retourne false si la
 * synthèse vocale est totalement indisponible.
 */
export function parlerTavernier(texte: string, pitch = 0.55, rate = 0.92): boolean {
  if (!aTTS) return false;
  const S = window.speechSynthesis;

  if (S.getVoices().length === 0) {
    let fait = false;
    const lancer = () => {
      if (fait) return;
      fait = true;
      try { S.removeEventListener('voiceschanged', lancer); } catch { /* ignore */ }
      chargerVoix();
      vraimentParler(texte, pitch, rate);
    };
    try { S.addEventListener('voiceschanged', lancer); } catch { /* ignore */ }
    window.setTimeout(lancer, 350); // filet : certains navigateurs n'émettent jamais l'évènement
    return true;
  }

  vraimentParler(texte, pitch, rate);
  return true;
}

/** Vibration (si supportée) — utilisée pour « trinquer à distance ». */
export function vibrer(pattern: number | number[]): boolean {
  if (typeof navigator === 'undefined' || !('vibrate' in navigator)) return false;
  try {
    return navigator.vibrate(pattern);
  } catch {
    return false;
  }
}

// iOS 16.4+ : catégorie audio « playback » → le son IGNORE le bouton Silence
// (sinon, interrupteur silence activé = pas de Web Audio sur iPhone).
function reglerSessionAudio(): void {
  try {
    const ns = navigator as unknown as { audioSession?: { type: string } };
    if (ns && ns.audioSession) ns.audioSession.type = 'playback';
  } catch {
    /* ignore */
  }
}

// ── Déverrouillage au premier geste (autoplay + bouton Silence iOS) ──────────
// Au tout premier toucher : on passe la session audio en « playback », on
// relance l'AudioContext, on joue un échantillon MUET (déblocage Web Audio iOS)
// et on réveille la synthèse vocale — pour que le 1er appui produise du son.
if (typeof document !== 'undefined') {
  reglerSessionAudio();
  let deverrouille = false;
  const deverrouiller = () => {
    if (deverrouille) return;
    deverrouille = true;
    reglerSessionAudio();
    const ac = audio();
    if (ac) {
      if (ac.state === 'suspended') void ac.resume();
      try {
        // Échantillon muet joué dans le geste : déblocage Web Audio iOS.
        const buf = ac.createBuffer(1, 1, 22050);
        const src = ac.createBufferSource();
        src.buffer = buf;
        src.connect(ac.destination);
        src.start(0);
      } catch {
        /* ignore */
      }
    }
    if (aTTS) {
      chargerVoix();
      try {
        // Utterance silencieuse pour débloquer la synthèse (Safari/iOS).
        const u = new SpeechSynthesisUtterance(' ');
        u.volume = 0;
        window.speechSynthesis.speak(u);
        window.speechSynthesis.cancel();
      } catch {
        /* ignore */
      }
    }
  };
  ['pointerdown', 'touchstart', 'keydown'].forEach((ev) =>
    document.addEventListener(ev, deverrouiller, { once: true, passive: true })
  );
}
