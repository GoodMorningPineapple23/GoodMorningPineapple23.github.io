'use strict';

/* ─── Wait for GSAP ──────────────────────────────────────── */
window.addEventListener('load', function () {
  gsap.registerPlugin(ScrollTrigger);
  init();
});

function init() {

  /* ═══════════════════════════════════════════════════════
     ELEMENTS
  ═══════════════════════════════════════════════════════ */
  const driver      = document.getElementById('scroll-driver');
  const stage       = document.getElementById('pinned-stage');
  const layerHero   = document.getElementById('layer-hero');
  const layerZoom   = document.getElementById('layer-zoom');
  const layerBlack  = document.getElementById('layer-black');
  const layerBook   = document.getElementById('layer-book');
  const zoomWrap    = document.getElementById('zoom-photo-wrap');
  const zoomPhoto   = document.getElementById('zoom-photo');
  const eyeCloseup  = document.getElementById('eye-closeup');
  const vignette    = document.getElementById('zoom-vignette');
  const theBook     = document.getElementById('the-book');
  const nav         = document.getElementById('main-nav');

  if (!driver || !stage) return;

  /* ═══════════════════════════════════════════════════════
     SCROLL DRIVER HEIGHT
     Total animation = 5 × viewport heights of scroll space.
     Adjust the multiplier to taste (larger = slower/more time).
  ═══════════════════════════════════════════════════════ */
  const VH = window.innerHeight;
  const TOTAL_SCROLL = VH * 5.5;   // 5.5 screen-heights of scroll
  driver.style.height = TOTAL_SCROLL + 'px';

  /* ═══════════════════════════════════════════════════════
     PIN THE STAGE
     ScrollTrigger pins #pinned-stage for the full scroll-driver height.
  ═══════════════════════════════════════════════════════ */
  ScrollTrigger.create({
    trigger: driver,
    start:   'top top',
    end:     'bottom bottom',
    pin:     stage,
    pinSpacing: false,
  });

  /* ═══════════════════════════════════════════════════════
     MASTER TIMELINE
     All phases are mapped to a single scrub timeline.
     progress 0→1 covers the entire scroll-driver height.
  ═══════════════════════════════════════════════════════ */
  const tl = gsap.timeline({ paused: true });

  /* ──────────────────────────────────────────────────────
     PHASE 1  (progress 0 → 0.25)
     Hero stays visible. The zoom layer cross-fades in
     and the same photo begins scaling up, centred on
     the right eye (transform-origin 55% 38%).
  ────────────────────────────────────────────────────── */
  tl.to(layerHero, {
    opacity: 0,
    duration: 0.18,
    ease: 'power2.in',
  }, 0.07);

  tl.to(layerZoom, {
    opacity: 1,
    duration: 0.08,
    ease: 'none',
  }, 0.07);

  // Scale the photo toward the right eye
  tl.fromTo(zoomWrap,
    { scale: 1, xPercent: 0, yPercent: 0 },
    { scale: 14, xPercent: -8, yPercent: -4, ease: 'power2.in', duration: 0.30 },
    0.07
  );

  // Bring in the eye close-up image once zoomed enough
  tl.to(eyeCloseup, {
    opacity: 1,
    duration: 0.06,
    ease: 'power1.in',
  }, 0.28);

  // Vignette darkens the edges
  tl.to(vignette, {
    opacity: 1,
    duration: 0.20,
    ease: 'power1.in',
  }, 0.14);

  /* ──────────────────────────────────────────────────────
     PHASE 2  (progress 0.30 → 0.55)
     Eye dissolves. Black layer fades in.
     Book layer appears (still horizontal / rotateX -80deg).
  ────────────────────────────────────────────────────── */
  // Fade out zoom/eye
  tl.to([layerZoom], {
    opacity: 0,
    duration: 0.14,
    ease: 'power1.in',
  }, 0.35);

  // Black BG fades in
  tl.to(layerBlack, {
    opacity: 1,
    duration: 0.14,
    ease: 'power1.out',
  }, 0.35);

  // Book layer fades in (still flat / horizontal)
  tl.to(layerBook, {
    opacity: 1,
    duration: 0.12,
    ease: 'power1.out',
    pointerEvents: 'all',
  }, 0.42);

  /* ──────────────────────────────────────────────────────
     PHASE 3  (progress 0.50 → 0.85)
     Book rotates from horizontal (pages up) to vertical
     (facing viewer). Scale up to comfortable reading size.
     rotateX: -80 → 0  means: lying flat → facing you
  ────────────────────────────────────────────────────── */
  tl.fromTo(theBook,
    {
      rotateX: -80,
      scale: 0.55,
    },
    {
      rotateX: 0,
      scale: 1,
      ease: 'power2.out',
      duration: 0.38,
    },
    0.50
  );

  /* ═══════════════════════════════════════════════════════
     SCRUB: tie timeline progress to scroll position
  ═══════════════════════════════════════════════════════ */
  ScrollTrigger.create({
    trigger:  driver,
    start:    'top top',
    end:      'bottom bottom',
    scrub:    1.2,          // 1.2s lag = very smooth feeling
    onUpdate: (self) => {
      tl.progress(self.progress);

      /* Nav theme: white hero → dark nav once past phase 1 */
      if (self.progress > 0.12) {
        nav.classList.add('dark-nav');
      } else {
        nav.classList.remove('dark-nav');
      }
    },
  });

  /* ═══════════════════════════════════════════════════════
     FLOATING CODE SNIPPETS (hero layer)
  ═══════════════════════════════════════════════════════ */
  document.querySelectorAll('.cf').forEach((el) => {
    const baseTop   = parseFloat(el.style.top) || 30;
    const amp       = 7 + Math.random() * 5;
    const speed     = 0.00035 + Math.random() * 0.00025;
    const phase     = Math.random() * Math.PI * 2;
    let raf;

    function tick(t) {
      const drift = Math.sin(t * speed + phase) * amp;
      el.style.top = `calc(${baseTop}% + ${drift}px)`;
      raf = requestAnimationFrame(tick);
    }

    raf = requestAnimationFrame(tick);
  });

  /* ═══════════════════════════════════════════════════════
     INTERSECTION OBSERVER — post-animation section reveals
  ═══════════════════════════════════════════════════════ */
  const revealIO = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        const delay = +(e.target.dataset.delay || 0);
        setTimeout(() => e.target.classList.add('vis'), delay);
        revealIO.unobserve(e.target);
      }
    });
  }, { threshold: 0.12 });

  document.querySelectorAll('.panel, .award-row, .sport-card, .ec-card').forEach(el => {
    revealIO.observe(el);
  });

  /* ═══════════════════════════════════════════════════════
     RESIZE: recalculate driver height + refresh ST
  ═══════════════════════════════════════════════════════ */
  window.addEventListener('resize', () => {
    const newVH = window.innerHeight;
    driver.style.height = (newVH * 5.5) + 'px';
    ScrollTrigger.refresh();
  });

}
