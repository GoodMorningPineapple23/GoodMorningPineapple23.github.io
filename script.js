/* ═══════════════════════════════════════════════════════════
   Abdul Raheem Portfolio — script.js
   Handles: Nav, Cinematic Eye Tunnel, All Scroll Reveals
   ═══════════════════════════════════════════════════════════ */

'use strict';

/* ─── 1. NAV THEME SWITCHER ──────────────────────────────── */
(function initNav() {
  const nav = document.getElementById('main-nav');
  const hero = document.getElementById('hero');
  if (!nav || !hero) return;

  function updateNav() {
    const heroBottom = hero.getBoundingClientRect().bottom;
    if (heroBottom < 80) {
      nav.classList.add('scrolled');
      nav.classList.remove('white-nav');
    } else {
      nav.classList.remove('scrolled');
      nav.classList.add('white-nav');
    }
  }

  nav.classList.add('white-nav');
  window.addEventListener('scroll', updateNav, { passive: true });
  updateNav();
})();


/* ─── 2. CINEMATIC EYE → BOOK TUNNEL ─────────────────────── */
(function initCinematicTunnel() {
  const tunnel   = document.getElementById('cinematic-tunnel');
  const eyeCont  = document.querySelector('.eye-container');
  const bookPupil = document.getElementById('bookInPupil');
  const tinyBook = document.querySelector('.tiny-book');
  const tbLeft   = document.querySelector('.tb-left');
  const tbRight  = document.querySelector('.tb-right');
  if (!tunnel || !eyeCont || !bookPupil) return;

  /*
    Scroll sequence (scroll positions within tunnel):
    0%   → 15%  : Eye zooms in (scale 1 → ~8)
    15%  → 40%  : Book appears inside pupil, tiny → visible
    40%  → 65%  : Eye fades out, background goes pure black, book grows
    65%  → 100% : Book faces viewer (rotates from pages-up to flat/open), content readable
  */

  function lerp(a, b, t) { return a + (b - a) * t; }
  function clamp01(v)     { return Math.max(0, Math.min(1, v)); }
  function easeInOut(t)   { return t < 0.5 ? 2*t*t : -1+(4-2*t)*t; }
  function easeOut(t)     { return 1 - Math.pow(1 - t, 3); }

  function onScroll() {
    if (!tunnel) return;
    const rect     = tunnel.getBoundingClientRect();
    const totalH   = tunnel.offsetHeight - window.innerHeight;
    const scrolled = -rect.top; // pixels scrolled into tunnel
    const raw      = clamp01(scrolled / totalH);

    /* ── Phase 0→0.2: zoom into eye ── */
    const zoomT = clamp01(raw / 0.2);
    const zoomE = easeInOut(zoomT);
    const scale = lerp(1, 9, zoomE);
    eyeCont.style.transform = `scale(${scale})`;

    /* ── Phase 0.15→0.45: book appears in pupil, grows ── */
    const bookAppearT = clamp01((raw - 0.15) / 0.30);
    const bookAppearE = easeOut(bookAppearT);
    bookPupil.style.opacity = bookAppearE;
    // book starts tiny (scale 0.05 relative to pupil) and grows
    const bookScale = lerp(0.05, 1.6, bookAppearE);
    bookPupil.style.transform = `translate(-50%, -50%) scale(${bookScale})`;

    // Book pages spread open as it appears
    const spread = lerp(30, 50, bookAppearE);
    if (tbLeft) tbLeft.style.transform = `perspective(300px) rotateY(${-spread}deg)`;
    if (tbRight) tbRight.style.transform = `perspective(300px) rotateY(${spread}deg)`;

    /* ── Phase 0.35→0.60: eye fades out ── */
    const eyeFadeT = clamp01((raw - 0.35) / 0.25);
    const eyeFadeE = easeInOut(eyeFadeT);
    const eyeAlpha = 1 - eyeFadeE;
    eyeCont.style.opacity = eyeAlpha;

    /* ── Phase 0.50→0.80: book rotates to face viewer ── */
    // Starts at rotateX(-70deg) (pages facing up) → rotateX(0deg) (facing viewer)
    const bookRotT = clamp01((raw - 0.50) / 0.35);
    const bookRotE = easeOut(bookRotT);
    const rotX = lerp(-70, 0, bookRotE);

    // Also scale up the whole book-in-pupil
    const finalScale = lerp(1.6, 5.5, bookRotE);
    bookPupil.style.transform = `translate(-50%, -50%) scale(${finalScale}) rotateX(${rotX}deg)`;

    /* ── Phase 0.75→1.0: book fades out, education section takes over ── */
    const bookFadeT = clamp01((raw - 0.75) / 0.25);
    const bookFadeE = easeInOut(bookFadeT);
    if (raw > 0.75) {
      bookPupil.style.opacity = 1 - bookFadeE;
    }
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
})();


/* ─── 3. EDUCATION BOOK REVEAL ───────────────────────────── */
(function initBookReveal() {
  const book = document.getElementById('openBook');
  if (!book) return;
  const io = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) { book.classList.add('visible'); io.unobserve(book); }
    });
  }, { threshold: 0.2 });
  io.observe(book);
})();


/* ─── 4. INTERSECTION OBSERVER REVEALS ──────────────────── */
(function initReveal() {
  const io = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        const delay = +( e.target.dataset.delay || 0);
        setTimeout(() => e.target.classList.add('visible'), delay);
        io.unobserve(e.target);
      }
    });
  }, { threshold: 0.12 });

  document.querySelectorAll('.panel, .award-row, .sport-card, .ec-card').forEach(el => io.observe(el));
})();


/* ─── 5. SUBTLE PARALLAX ON HERO PHOTO ──────────────────── */
(function initParallax() {
  const wrap = document.querySelector('.hero-photo-wrap');
  if (!wrap) return;
  window.addEventListener('scroll', () => {
    const y = window.scrollY;
    if (y < window.innerHeight) {
      wrap.style.transform = `translateX(-50%) translateY(${y * 0.12}px)`;
    }
  }, { passive: true });
})();


/* ─── 6. FLOATING CODE SNIPPETS ANIMATION ───────────────── */
(function initCodeFloat() {
  const floats = document.querySelectorAll('.code-float');
  floats.forEach((el, i) => {
    const baseY = parseFloat(el.style.top) || 30;
    const amp   = 8 + Math.random() * 6;
    const speed = 0.0004 + Math.random() * 0.0003;
    const phase = Math.random() * Math.PI * 2;

    function tick(t) {
      const drift = Math.sin(t * speed + phase) * amp;
      el.style.top = `calc(${baseY}% + ${drift}px)`;
      requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  });
})();
