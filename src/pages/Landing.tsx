// Page vitrine (landing) servie à la racine "/".
// DA « LA BOÎT'À SOIF » — enseigne de bar vintage : ardoise sombre, jaune bière,
// ambre, rouge néon, crème, nappe vichy. HTML autonome scopé sous .lp.

const LANDING_HTML = `
<style>
  .lp { font-family: 'Inter', system-ui, sans-serif; color: #f3e8cf; background: #1b1917; line-height: 1.6; min-height: 100vh; -webkit-font-smoothing: antialiased; font-size: 17px; }
  .lp * { box-sizing: border-box; margin: 0; padding: 0; }
  .lp h1, .lp h2, .lp h3 { font-family: 'Fraunces', Georgia, serif; line-height: 1.08; text-transform: uppercase; letter-spacing: .01em; }
  .lp a { color: #e9c46a; text-decoration: none; }

  .lp .conteneur { width: 100%; max-width: 1080px; margin: 0 auto; padding: 0 22px; }

  .lp .btn { display: inline-flex; align-items: center; justify-content: center; gap: 10px; min-height: 58px; padding: 15px 28px; border: none; border-radius: 14px; font-family: 'Inter', sans-serif; font-size: 1.06rem; font-weight: 800; text-decoration: none; cursor: pointer; transition: transform .1s ease, box-shadow .1s ease, filter .15s ease; }
  .lp .btn:focus-visible { outline: 3px solid #e9c46a; outline-offset: 3px; }
  .lp .btn-primaire { background: #e14b3a; color: #fff; box-shadow: 0 6px 0 rgba(0,0,0,.4); }
  .lp .btn-primaire:hover { filter: brightness(1.07); }
  .lp .btn-primaire:active { transform: translateY(4px); box-shadow: 0 2px 0 rgba(0,0,0,.4); }
  .lp .btn-clair { background: rgba(243,240,234,.08); color: #f3e8cf; border: 2px solid rgba(243,232,207,.5); }
  .lp .btn-clair:hover { background: rgba(243,232,207,.16); }

  /* Nappe vichy */
  .lp .gingham { background-color: #b5392e; background-image: repeating-linear-gradient(90deg, rgba(243,232,207,.5) 0 14px, transparent 14px 28px), repeating-linear-gradient(0deg, rgba(243,232,207,.5) 0 14px, transparent 14px 28px); }

  /* ── En-tête ── */
  .lp .site { position: sticky; top: 0; z-index: 30; background: rgba(20,17,15,.9); backdrop-filter: blur(8px); -webkit-backdrop-filter: blur(8px); border-bottom: 1px solid rgba(243,232,207,.12); }
  .lp .nav { display: flex; align-items: center; gap: 14px; min-height: 70px; }
  .lp .wordmark { font-family: 'Mulish', system-ui, sans-serif; font-weight: 800; font-size: 1.5rem; letter-spacing: -.01em; line-height: 1; color: #f3e8cf; white-space: nowrap; }
  .lp .wordmark .apo { color: #e14b3a; }
  .lp .marque { display: flex; align-items: center; gap: 10px; }
  .lp .nav .grandit { flex: 1; }
  .lp .nav .lien-app { display: none; }
  @media (min-width: 720px) { .lp .nav .lien-app { display: inline-flex; } }

  /* ── Hero ── */
  .lp .hero { position: relative; overflow: hidden; background: #14110f; color: #f3e8cf; padding: 64px 0 76px; border-bottom: 3px solid #e9c46a; }
  .lp .hero .blob { position: absolute; inset: 0; width: 100%; height: 100%; opacity: .14; animation: lpBlob 16s ease-in-out infinite; pointer-events: none; }
  @keyframes lpBlob { 0%,100% { transform: translate(0,0) scale(1); } 50% { transform: translate(-14px,10px) scale(1.05); } }
  .lp .hero-grid { position: relative; display: grid; grid-template-columns: 1fr; gap: 38px; align-items: center; }
  @media (min-width: 880px) { .lp .hero-grid { grid-template-columns: 1.12fr .88fr; gap: 52px; } }
  .lp .pastille { display: inline-flex; align-items: center; gap: 8px; background: #e14b3a; color: #fff; padding: 8px 18px; border-radius: 999px; font-weight: 800; font-size: .84rem; letter-spacing: .04em; text-transform: uppercase; }
  .lp .hero h1 { font-size: clamp(2.1rem, 5.6vw, 3.4rem); font-weight: 800; margin: 22px 0 0; color: #f3e8cf; text-shadow: 0 2px 0 rgba(0,0,0,.4); }
  .lp .hero h1 .accent { color: #e9c46a; }
  .lp .hero .sous { margin: 20px 0 0; font-size: 1.17rem; color: #d8caa8; max-width: 48ch; line-height: 1.55; text-transform: none; }
  .lp .hero .actions { display: flex; flex-wrap: wrap; gap: 14px; margin: 30px 0 0; }
  .lp .hero .note { margin: 16px 0 0; font-size: .9rem; color: #bcaf93; text-transform: none; }

  /* Aperçu stylisé de l'app */
  .lp .apercu { background: #241f1b; border: 1px solid #3a332c; border-radius: 22px; padding: 20px; box-shadow: 0 16px 40px rgba(0,0,0,.5); color: #f3e8cf; }
  .lp .apercu .barre { display: flex; align-items: center; gap: 8px; margin-bottom: 14px; }
  .lp .apercu .barre .pt { width: 11px; height: 11px; border-radius: 50%; background: #3a332c; }
  .lp .apercu-grille { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
  .lp .tuile { min-height: 84px; border-radius: 14px; padding: 13px; display: flex; flex-direction: column; justify-content: flex-end; gap: 6px; font-weight: 800; font-size: .9rem; text-transform: uppercase; letter-spacing: .01em; }
  .lp .tuile svg { width: 24px; height: 24px; }
  .lp .apercu .dire { display: flex; align-items: center; gap: 12px; margin-top: 10px; border: 2px solid #3a332c; border-radius: 14px; padding: 13px 15px; font-size: .96rem; font-weight: 700; color: #f3e8cf; }
  .lp .apercu .dire .hp { flex-shrink: 0; width: 38px; height: 38px; border-radius: 12px; background: #e14b3a; display: flex; align-items: center; justify-content: center; }
  .lp .apercu .legende { margin-top: 10px; text-align: center; font-size: .8rem; color: #bcaf93; }

  /* ── Réassurance ── */
  .lp .reassurance { background: #1b1917; border-bottom: 1px solid rgba(243,232,207,.08); }
  .lp .reassurance .grille { display: grid; grid-template-columns: repeat(2,1fr); gap: 22px 16px; padding: 34px 0; }
  @media (min-width: 760px) { .lp .reassurance .grille { grid-template-columns: repeat(4,1fr); } }
  .lp .point { display: flex; flex-direction: column; align-items: center; text-align: center; gap: 10px; }
  .lp .point .rond { width: 58px; height: 58px; border-radius: 16px; display: flex; align-items: center; justify-content: center; background: #2c2722; color: #e9c46a; border: 1px solid #3a332c; }
  .lp .point strong { font-size: 1rem; color: #f3e8cf; text-transform: uppercase; letter-spacing: .02em; }
  .lp .point span { font-size: .92rem; color: #bcaf93; line-height: 1.45; }

  /* ── Blocs génériques ── */
  .lp .bloc { padding: 70px 0; }
  .lp .titre-bloc { text-align: center; max-width: 46ch; margin: 0 auto; }
  .lp .titre-bloc .kicker { display: inline-block; font-weight: 800; letter-spacing: .14em; text-transform: uppercase; font-size: .78rem; color: #e14b3a; margin-bottom: 12px; }
  .lp .titre-bloc h2 { font-size: clamp(1.7rem, 4vw, 2.5rem); color: #e9c46a; font-weight: 800; }
  .lp .titre-bloc p { margin-top: 16px; color: #bcaf93; font-size: 1.06rem; text-transform: none; }

  /* ── Empathie ── */
  .lp .empathie .carte { max-width: 760px; margin: 0 auto; text-align: center; }
  .lp .empathie h2 { font-size: clamp(1.7rem, 4vw, 2.4rem); color: #e9c46a; }
  .lp .empathie p { margin-top: 18px; font-size: 1.13rem; line-height: 1.65; color: #f3e8cf; text-transform: none; }
  .lp .empathie .souligne { background: linear-gradient(transparent 60%, rgba(233,196,106,.35) 60%); font-weight: 700; }

  /* ── 4 comptoirs ── */
  .lp .sections-grille { display: grid; grid-template-columns: 1fr; gap: 18px; margin-top: 44px; }
  @media (min-width: 680px) { .lp .sections-grille { grid-template-columns: 1fr 1fr; } }
  .lp .carte-section { border-radius: 20px; padding: 26px; min-height: 158px; display: flex; flex-direction: column; gap: 11px; box-shadow: 0 6px 0 rgba(0,0,0,.35); }
  .lp .carte-section .ico { width: 40px; height: 40px; }
  .lp .carte-section h3 { font-size: 1.3rem; font-weight: 800; }
  .lp .carte-section p { font-size: .98rem; line-height: 1.5; text-transform: none; opacity: .95; }

  /* ── Moments ── */
  .lp .moments-grille { display: grid; grid-template-columns: 1fr; gap: 16px; margin-top: 44px; }
  @media (min-width: 680px) { .lp .moments-grille { grid-template-columns: 1fr 1fr; } }
  @media (min-width: 980px) { .lp .moments-grille { grid-template-columns: 1fr 1fr 1fr; } }
  .lp .moment { background: #241f1b; border: 1px solid #3a332c; border-radius: 18px; padding: 24px; transition: border-color .15s ease, transform .15s ease; }
  .lp .moment:hover { border-color: #e9c46a; transform: translateY(-3px); }
  .lp .moment .badge { display: inline-flex; align-items: center; justify-content: center; width: 48px; height: 48px; border-radius: 12px; margin-bottom: 14px; background: #2c2722; }
  .lp .moment h3 { font-size: 1.12rem; color: #e9c46a; font-weight: 800; line-height: 1.25; }
  .lp .moment ul { list-style: none; margin: 12px 0 0; display: flex; flex-direction: column; gap: 9px; }
  .lp .moment li { display: flex; gap: 10px; align-items: flex-start; font-size: .95rem; color: #e8dcc0; line-height: 1.45; text-transform: none; }
  .lp .moment li::before { content: ''; flex-shrink: 0; width: 7px; height: 7px; border-radius: 50%; background: #e14b3a; margin-top: 8px; }
  .lp .moment.pourvous { background: #14110f; border-color: #e9c46a; }
  .lp .moment.pourvous h3 { color: #e9c46a; }
  .lp .moment.pourvous li::before { background: #e9c46a; }

  /* ── Origine / citation ── */
  .lp .origine { background: #14110f; color: #f3e8cf; }
  .lp .origine .grille { display: grid; grid-template-columns: 1fr; gap: 40px; align-items: center; }
  @media (min-width: 860px) { .lp .origine .grille { grid-template-columns: 1fr 1fr; } }
  .lp .origine h2 { font-size: clamp(1.7rem, 4vw, 2.5rem); color: #e9c46a; }
  .lp .origine .texte p { margin-top: 16px; color: #d8caa8; font-size: 1.06rem; line-height: 1.6; text-transform: none; }
  .lp .citation { background: rgba(243,232,207,.06); border-left: 4px solid #e9c46a; border-radius: 12px; padding: 28px 30px; }
  .lp .citation p { font-family: 'Fraunces', serif; font-size: 1.3rem; line-height: 1.45; font-weight: 600; color: #f3e8cf; text-transform: none; }
  .lp .citation .src { margin-top: 16px; font-size: .94rem; color: #bcaf93; line-height: 1.5; text-transform: none; }

  /* ── Espace perso ── */
  .lp .espace .carte { background: #241f1b; border: 1px solid #3a332c; border-radius: 22px; box-shadow: 0 6px 18px rgba(0,0,0,.4); padding: 40px; display: grid; grid-template-columns: 1fr; gap: 28px; align-items: center; }
  @media (min-width: 780px) { .lp .espace .carte { grid-template-columns: auto 1fr; gap: 40px; } }
  .lp .espace .bouclier { width: 96px; height: 96px; border-radius: 24px; background: #2c2722; display: flex; align-items: center; justify-content: center; color: #e9c46a; margin: 0 auto; border: 1px solid #3a332c; }
  .lp .espace h2 { font-size: 1.7rem; color: #e9c46a; }
  .lp .espace p { margin-top: 12px; color: #bcaf93; font-size: 1.02rem; text-transform: none; }
  .lp .espace .tags { display: flex; flex-wrap: wrap; gap: 10px; margin-top: 18px; }
  .lp .tag { background: #2c2722; border: 1px solid #3a332c; border-radius: 999px; padding: 7px 15px; font-size: .86rem; font-weight: 700; color: #e9c46a; }

  /* ── CTA final ── */
  .lp .cta-final { text-align: center; }
  .lp .cta-final .carte { background: linear-gradient(135deg, #e14b3a, #ec9a4b); border-radius: 24px; padding: 58px 28px; color: #fff; box-shadow: 0 16px 40px rgba(0,0,0,.45); }
  .lp .cta-final h2 { font-size: clamp(1.8rem, 4.5vw, 2.7rem); }
  .lp .cta-final p { margin: 16px auto 0; max-width: 46ch; font-size: 1.1rem; opacity: .96; text-transform: none; }
  .lp .cta-final .actions { display: flex; flex-wrap: wrap; gap: 14px; justify-content: center; margin-top: 30px; }
  .lp .cta-final .btn-blanc { background: #1b1917; color: #e9c46a; box-shadow: 0 6px 0 rgba(0,0,0,.3); }

  /* ── Pied ── */
  .lp .pied { background: #14110f; color: #f3e8cf; padding: 54px 0 40px; border-top: 3px solid #e9c46a; }
  .lp .pied .haut { display: flex; flex-wrap: wrap; gap: 24px; justify-content: space-between; align-items: flex-start; }
  .lp .pied .wordmark { color: #f3e8cf; }
  .lp .pied .desc { max-width: 40ch; margin-top: 16px; font-size: .94rem; color: #bcaf93; }
  .lp .pied nav a { color: #e9c46a; }
  .lp .pied .avert { margin-top: 34px; padding-top: 24px; border-top: 1px solid rgba(243,232,207,.16); font-size: .88rem; color: #bcaf93; line-height: 1.55; }
  .lp .pied .credits { margin-top: 10px; font-size: .84rem; color: #8a8070; }
</style>

<!-- ════════ EN-TÊTE ════════ -->
<header class="site">
  <div class="conteneur nav">
    <a class="marque" href="#haut" aria-label="La Boît'à Soif, accueil">
      <img src="${import.meta.env.BASE_URL}brand/logo.png" alt="" width="38" height="38" style="border-radius:8px;display:block" />
      <span class="wordmark">La Boît&rsquo;à <span class="apo">Soif</span></span>
    </a>
    <div class="grandit"></div>
    <a class="btn btn-primaire lien-app" href="${import.meta.env.BASE_URL}app">Ouvrir la boîte</a>
  </div>
</header>

<!-- ════════ HERO ════════ -->
<section class="hero" id="haut">
  <svg class="blob" viewBox="0 0 400 200" preserveAspectRatio="none" aria-hidden="true">
    <ellipse cx="340" cy="10" rx="150" ry="100" fill="#e9c46a" /><ellipse cx="30" cy="200" rx="130" ry="85" fill="#e14b3a" />
  </svg>
  <div class="conteneur hero-grid">
    <div>
      <span class="pastille">100 % gratuit · À consommer avec modération</span>
      <h1>Suis la tournée.<br />Garde le <span class="accent">contrôle</span>.</h1>
      <p class="sous">
        La Boît&rsquo;à Soif, c&rsquo;est le copilote de tes soirées : ton taux d&rsquo;alcool
        <strong>en direct</strong>, le juke-box de répliques, <strong>plus de 20 mini-jeux</strong>,
        la carte de tes potes et des <strong>tournois</strong> pour chambrer la bande. Le tout en gros — et avec le sourire.
      </p>
      <div class="actions">
        <a class="btn btn-primaire" href="${import.meta.env.BASE_URL}app">Ouvrir la boîte</a>
        <a class="btn btn-clair" href="#decouvrir">Voir ce qu&rsquo;il y a dedans</a>
      </div>
      <p class="note">Sans pub · Compte gratuit en 30 s · Sur téléphone, tablette et ordinateur</p>
    </div>

    <div class="apercu" aria-hidden="true">
      <div class="barre"><span class="pt"></span><span class="pt"></span><span class="pt"></span></div>
      <div class="apercu-grille">
        <div class="tuile" style="background:#e14b3a; color:#fff;"><svg viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 16 A8 8 0 0 1 20 16"/><line x1="12" y1="16" x2="16" y2="11"/><circle cx="12" cy="16" r="1.4" fill="#fff" stroke="none"/></svg>Pèse-Alco</div>
        <div class="tuile" style="background:#e9c46a; color:#2a1f10;"><svg viewBox="0 0 24 24" fill="none" stroke="#2a1f10" stroke-width="2" stroke-linejoin="round"><path d="M4 10 H8 L13 5 V19 L8 14 H4 Z"/><path d="M16.5 9 C18.5 10.5 18.5 13.5 16.5 15"/></svg>Juke-Box</div>
        <div class="tuile" style="background:#14110f; color:#f3e8cf; border:1px solid #e9c46a;"><svg viewBox="0 0 24 24" fill="none" stroke="#e9c46a" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="4" width="16" height="16" rx="2"/><line x1="7.5" y1="9" x2="16.5" y2="9"/><line x1="7.5" y1="12.5" x2="16.5" y2="12.5"/><line x1="7.5" y1="16" x2="12" y2="16"/></svg>Ardoise</div>
        <div class="tuile" style="background:#ec9a4b; color:#2a1f10;"><svg viewBox="0 0 24 24" fill="none" stroke="#2a1f10" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M8 21 H16"/><path d="M12 17 V21"/><path d="M6 4 H18 V8 C18 11.3 15.3 13.5 12 13.5 C8.7 13.5 6 11.3 6 8 Z"/><path d="M18 5 H21 V7.5 C21 9 20 10 18.5 10"/><path d="M6 5 H3 V7.5 C3 9 4 10 5.5 10"/></svg>Champions</div>
      </div>
      <div class="dire">
        <span class="hp"><svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="#fff" stroke-width="2" stroke-linejoin="round"><path d="M4 10 H8 L13 5 V19 L8 14 H4 Z"/><path d="M16.5 9 C18.5 10.5 18.5 13.5 16.5 15"/></svg></span>
        « Patron, la même chose ! »
      </div>
      <p class="legende">Le tavernier le dit à voix haute.</p>
    </div>
  </div>
</section>

<!-- ════════ RÉASSURANCE ════════ -->
<div class="reassurance">
  <div class="conteneur">
    <div class="grille">
      <div class="point">
        <span class="rond"><svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 21 C12 21 4.5 16 2.8 11.2 C1.5 7.6 3.8 4.5 7 4.5 C9 4.5 10.5 5.6 12 7.4 C13.5 5.6 15 4.5 17 4.5 C20.2 4.5 22.5 7.6 21.2 11.2 C19.5 16 12 21 12 21 Z"/></svg></span>
        <strong>100 % gratuit</strong><span>Aucun abonnement. La tournée est offerte, pour toujours.</span>
      </div>
      <div class="point">
        <span class="rond"><svg viewBox="0 0 100 100" width="30" height="30"><g fill="currentColor" stroke="currentColor"><g transform="rotate(-17 50 56)"><path d="M24 34 H52 L41 53 Z"/><line x1="41" y1="53" x2="41" y2="78" stroke-width="5" stroke-linecap="round"/><line x1="30" y1="80" x2="52" y2="80" stroke-width="5" stroke-linecap="round"/></g><g transform="rotate(17 50 56)"><path d="M48 34 H76 L59 53 Z"/><line x1="59" y1="53" x2="59" y2="78" stroke-width="5" stroke-linecap="round"/><line x1="48" y1="80" x2="70" y2="80" stroke-width="5" stroke-linecap="round"/></g></g></svg></span>
        <strong>Pensée pour le comptoir</strong><span>Ton taux, tes consos et tes potes, toujours sous la main.</span>
      </div>
      <div class="point">
        <span class="rond"><svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><circle cx="12" cy="6" r="3"/><path d="M5 11 C9 12.5 15 12.5 19 11"/><path d="M12 12.5 V17 L9 21.5"/><path d="M12 17 L15 21.5"/></svg></span>
        <strong>Simple et lisible</strong><span>Gros texte, gros boutons, lecture à voix haute.</span>
      </div>
      <div class="point">
        <span class="rond"><svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 13 A7 7 0 0 1 19 13"/><path d="M5 13 H2"/><path d="M22 13 H19"/><rect x="7" y="13" width="10" height="7" rx="2"/></svg></span>
        <strong>Marche hors ligne</strong><span>Pas de réseau au troquet ? Elle tourne quand même.</span>
      </div>
    </div>
  </div>
</div>

<!-- ════════ EMPATHIE ════════ -->
<section class="bloc empathie">
  <div class="conteneur">
    <div class="carte">
      <h2>L&rsquo;ambiance, ça ne s&rsquo;improvise pas toujours.</h2>
      <p>
        Un blanc dans la conversation, un anniversaire à animer, une tablée qui
        commence à <span class="souligne">tourner en rond</span>…
        On a tous connu ces moments où il manque juste une étincelle.
      </p>
      <p>
        La Boît&rsquo;à Soif est là pour ça : une réplique culte qui fait mouche, ton
        compteur qui te garde droit, et le classement des potes pour
        <span class="souligne">chambrer comme il faut</span>. De quoi tenir la
        soirée — sans la finir aux urgences.
      </p>
    </div>
  </div>
</section>

<!-- ════════ 4 COMPTOIRS ════════ -->
<section class="bloc" id="decouvrir" style="background:#1b1917;">
  <div class="conteneur">
    <div class="titre-bloc">
      <span class="kicker">Ce qu&rsquo;il y a dans la boîte</span>
      <h2>Tout ce qu&rsquo;il faut pour la soirée</h2>
      <p>Pas de menus à rallonge : de grandes portes d&rsquo;entrée, pensées pour aller vite, le verre à la main.</p>
    </div>
    <div class="sections-grille">
      <div class="carte-section" style="background:#e14b3a; color:#fff;">
        <svg class="ico" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 16 A8 8 0 0 1 20 16"/><line x1="12" y1="16" x2="16" y2="11"/><circle cx="12" cy="16" r="1.4" fill="#fff" stroke="none"/></svg>
        <h3>Le Pèse-Alco</h3>
        <p>Ton taux d&rsquo;alcool estimé en direct (formule de Widmark), ton retour à zéro et l&rsquo;alerte avant la bêtise. Indicatif — mais ça calme.</p>
      </div>
      <div class="carte-section" style="background:#e9c46a; color:#2a1f10;">
        <svg class="ico" viewBox="0 0 24 24" fill="none" stroke="#2a1f10" stroke-width="2" stroke-linejoin="round"><path d="M4 10 H8 L13 5 V19 L8 14 H4 Z"/><path d="M16.5 9 C18.5 10.5 18.5 13.5 16.5 15"/></svg>
        <h3>Le Juke-Box à Conneries</h3>
        <p>Le soundboard des répliques de comptoir, déclamées par le tavernier. « Patron, la même chose ! »</p>
      </div>
      <div class="carte-section" style="background:#14110f; color:#f3e8cf; border:1px solid #e9c46a;">
        <svg class="ico" viewBox="0 0 24 24" fill="none" stroke="#e9c46a" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="4" width="16" height="16" rx="2"/><line x1="7.5" y1="9" x2="16.5" y2="9"/><line x1="7.5" y1="12.5" x2="16.5" y2="12.5"/><line x1="7.5" y1="16" x2="12" y2="16"/></svg>
        <h3>L&rsquo;Ardoise des Comptes</h3>
        <p>Ton historique de soirées façon ticket de bar : pic de la session, total des consos et badges à débloquer.</p>
      </div>
      <div class="carte-section" style="background:#ec9a4b; color:#2a1f10;">
        <svg class="ico" viewBox="0 0 24 24" fill="none" stroke="#2a1f10" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M8 21 H16"/><path d="M12 17 V21"/><path d="M6 4 H18 V8 C18 11.3 15.3 13.5 12 13.5 C8.7 13.5 6 11.3 6 8 Z"/><path d="M18 5 H21 V7.5 C21 9 20 10 18.5 10"/><path d="M6 5 H3 V7.5 C3 9 4 10 5.5 10"/></svg>
        <h3>Le Tableau des Champions</h3>
        <p>Le classement des potes en direct, façon borne d&rsquo;arcade. Trinque à distance et dégaine le verre d&rsquo;eau d&rsquo;urgence.</p>
      </div>
      <div class="carte-section" style="background:#14110f; color:#f3e8cf; border:1px solid #e9c46a;">
        <div class="ico" style="font-size:2rem; line-height:1;" aria-hidden="true">🎪</div>
        <h3>La Cabine</h3>
        <p>Plus de 20 mini-jeux de comptoir : éthylotest, horoscope du pilier, traducteur régional (8 accents), quiz, La Rivière… et le Niveau de Pilier à faire grimper.</p>
      </div>
      <div class="carte-section" style="background:#e14b3a; color:#fff;">
        <div class="ico" style="font-size:2rem; line-height:1;" aria-hidden="true">🗺️</div>
        <h3>La Carte des piliers</h3>
        <p>Tes potes sur la carte façon Snap (avec mode fantôme), les coins qui bougent — « The Place to Bar » — et la moyenne de consos du groupe.</p>
      </div>
      <div class="carte-section" style="background:#e9c46a; color:#2a1f10;">
        <div class="ico" style="font-size:2rem; line-height:1;" aria-hidden="true">🏆</div>
        <h3>Les Concours</h3>
        <p>Défie tes potes en tournoi : plusieurs mini-jeux barrés qui s&rsquo;enchaînent (cri de guerre, shaker, réflexes…), classement final aux points.</p>
      </div>
    </div>
  </div>
</section>

<!-- ════════ MOMENTS ════════ -->
<section class="bloc">
  <div class="conteneur">
    <div class="titre-bloc">
      <span class="kicker">À chaque moment, le bon réflexe</span>
      <h2>Concrètement, voilà ce qu&rsquo;elle fait pour toi</h2>
    </div>
    <div class="moments-grille">

      <div class="moment">
        <span class="badge"><svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="#e14b3a" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 16 A8 8 0 0 1 20 16"/><line x1="12" y1="16" x2="16" y2="11"/><circle cx="12" cy="16" r="1.4" fill="#e14b3a" stroke="none"/></svg></span>
        <h3>Avant de rentrer</h3>
        <ul>
          <li>Ton taux estimé en direct, qui redescend tout seul</li>
          <li>« Retour à zéro dans 3 h 12 » : tu sais où tu en es</li>
          <li>Alerte au-dessus de la limite — et jamais le volant</li>
        </ul>
      </div>

      <div class="moment">
        <span class="badge"><svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="#e9c46a" stroke-width="2" stroke-linejoin="round"><path d="M4 10 H8 L13 5 V19 L8 14 H4 Z"/><path d="M16.5 9 C18.5 10.5 18.5 13.5 16.5 15"/></svg></span>
        <h3>Pour l&rsquo;ambiance du comptoir</h3>
        <ul>
          <li>Le juke-box des répliques cultes, à dégainer</li>
          <li>Le tavernier les déclame d&rsquo;une voix bien grave</li>
          <li>« J&rsquo;ai la glotte à sec », « Patron, la même chose ! »</li>
        </ul>
      </div>

      <div class="moment">
        <span class="badge"><svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="#e9c46a" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="4" width="16" height="16" rx="2"/><line x1="7.5" y1="9" x2="16.5" y2="9"/><line x1="7.5" y1="12.5" x2="16.5" y2="12.5"/><line x1="7.5" y1="16" x2="12" y2="16"/></svg></span>
        <h3>Pour tenir l&rsquo;ardoise</h3>
        <ul>
          <li>Toutes tes consos, à l&rsquo;heure près, façon ticket de bar</li>
          <li>Le pic de la session et le total de la soirée</li>
          <li>Des badges à débloquer : « Chameau du mois »…</li>
        </ul>
      </div>

      <div class="moment">
        <span class="badge"><svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="#e9c46a" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M8 21 H16"/><path d="M12 17 V21"/><path d="M6 4 H18 V8 C18 11.3 15.3 13.5 12 13.5 C8.7 13.5 6 11.3 6 8 Z"/><path d="M18 5 H21 V7.5 C21 9 20 10 18.5 10"/><path d="M6 5 H3 V7.5 C3 9 4 10 5.5 10"/></svg></span>
        <h3>Pour chambrer les potes</h3>
        <ul>
          <li>Le classement de la bande, façon borne d&rsquo;arcade</li>
          <li>« Trinque à distance » : son téléphone vibre, ça tchin</li>
          <li>Le bouton « verre d&rsquo;eau d&rsquo;urgence » pour le copain trop chaud</li>
        </ul>
      </div>

      <div class="moment">
        <span class="badge"><svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="#e14b3a" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3 L21 19 H3 Z"/><line x1="12" y1="10" x2="12" y2="14"/><circle cx="12" cy="16.6" r="0.4" fill="#e14b3a"/></svg></span>
        <h3>Pour ne pas finir trop fort</h3>
        <ul>
          <li>Trois états clairs : frais, picon-chaud, ou… zone patois</li>
          <li>Rappels d&rsquo;hydratation et d&rsquo;un bon vieux taxi</li>
          <li>L&rsquo;alerte « SMS à ton ex » avant qu&rsquo;il ne soit trop tard</li>
        </ul>
      </div>

      <div class="moment pourvous">
        <span class="badge"><svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="#e9c46a" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M8.5 14 C10 16 14 16 15.5 14"/><circle cx="9" cy="10" r="0.5" fill="#e9c46a"/><circle cx="15" cy="10" r="0.5" fill="#e9c46a"/></svg></span>
        <h3>Et le lendemain</h3>
        <ul>
          <li>Le récap de la soirée, pour reconstituer le puzzle</li>
          <li>Tes records et tes badges, gardés sur l&rsquo;appareil</li>
          <li>De quoi rigoler de la veille… sans gueule de bois numérique</li>
        </ul>
      </div>

    </div>
  </div>
</section>

<!-- ════════ ORIGINE ════════ -->
<section class="bloc origine">
  <div class="conteneur grille">
    <div class="texte">
      <h2>Née un soir, au comptoir</h2>
      <p>
        La Boît&rsquo;à Soif est partie d&rsquo;une idée toute simple : et si on remettait
        du rire et des bons mots sur les tables, comme au bon vieux temps ?
      </p>
      <p>
        Une appli qui rassemble, au même endroit, tout ce qui fait une bonne
        soirée — assez grosse et assez claire pour que personne ne soit laissé
        de côté, même au troisième verre.
      </p>
    </div>
    <div class="citation">
      <p>« On ne compte pas les amis comme les verres : on les garde tous. »</p>
      <div class="src">Parce qu&rsquo;une bonne tablée, ça ne se mesure pas au nombre de tournées — mais au nombre d&rsquo;éclats de rire.</div>
    </div>
  </div>
</section>

<!-- ════════ ESPACE PERSO ════════ -->
<section class="bloc espace">
  <div class="conteneur">
    <div class="carte">
      <div class="bouclier">
        <svg viewBox="0 0 24 24" width="48" height="48" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 4 l2.3 4.7 5.2 .8 -3.8 3.7 .9 5.2 -4.6 -2.4 -4.6 2.4 .9 -5.2 -3.8 -3.7 5.2 -.8 Z"/></svg>
      </div>
      <div>
        <h2>Vos records, toujours à portée</h2>
        <p>
          Marquez vos répliques préférées d&rsquo;une étoile et gardez vos records de
          soirée. Compte gratuit pour rejoindre tes potes, pas de
          publicité, pas de traceur — on est là pour rigoler, pas pour vous pister.
        </p>
        <div class="tags"><span class="tag">Compte gratuit</span><span class="tag">Entre potes</span><span class="tag">Sans publicité</span><span class="tag">Classement en direct</span></div>
      </div>
    </div>
  </div>
</section>

<!-- ════════ CTA FINAL ════════ -->
<section class="bloc cta-final" id="app">
  <div class="conteneur">
    <div class="carte">
      <h2>Allez, la tournée est pour nous.<br />C&rsquo;est gratuit, pour toujours.</h2>
      <p>Ouvrez la boîte depuis votre téléphone, votre tablette ou votre ordinateur — et gardez de quoi mettre l&rsquo;ambiance, où que vous soyez.</p>
      <div class="actions">
        <a class="btn btn-blanc" href="${import.meta.env.BASE_URL}app">Ouvrir la boîte</a>
      </div>
    </div>
  </div>
</section>

<!-- ════════ PIED ════════ -->
<footer class="pied">
  <div class="conteneur">
    <div class="haut">
      <div>
        <span class="wordmark">La Boît&rsquo;à <span class="apo">Soif</span></span>
        <p class="desc">L&rsquo;appli des piliers de bar. Gratuite, simple, et qui marche même sans réseau.</p>
      </div>
      <nav aria-label="Liens de pied de page" style="display:flex; flex-direction:column; gap:10px; font-size:.94rem;">
        <a href="#decouvrir">Ce qu&rsquo;il y a dans la boîte</a>
        <a href="${import.meta.env.BASE_URL}app">Ouvrir la boîte</a>
      </nav>
    </div>
    <p class="avert">
      La Boît&rsquo;à Soif est faite pour s&rsquo;amuser entre amis. L&rsquo;abus d&rsquo;alcool est dangereux pour la santé :
      à consommer avec modération. Et on ne prend pas le volant après l&rsquo;apéro.
    </p>
    <p class="credits">La Boît&rsquo;à Soif — l&rsquo;appli des piliers de bar.</p>
  </div>
</footer>
`;

export default function Landing() {
  return <div className="lp" dangerouslySetInnerHTML={{ __html: LANDING_HTML }} />;
}
