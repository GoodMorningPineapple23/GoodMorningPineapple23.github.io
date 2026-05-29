/* ─── Grid Canvas (Hero) ────────────────────────────────────── */
(function initGrid() {
  const canvas = document.getElementById('grid-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let W, H, cols, rows, dots = [];

  function resize() {
    W = canvas.width  = window.innerWidth;
    H = canvas.height = window.innerHeight;
    cols = Math.ceil(W / 60) + 1;
    rows = Math.ceil(H / 60) + 1;
    dots = [];
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        dots.push({ x: c * 60, y: r * 60, o: Math.random() * 0.3 + 0.05, s: Math.random() * 0.4 + 0.3, phase: Math.random() * Math.PI * 2, speed: 0.003 + Math.random() * 0.004 });
      }
    }
  }

  let t = 0;
  let mx = W / 2, my = H / 2;
  window.addEventListener('mousemove', e => { mx = e.clientX; my = e.clientY; });

  function draw() {
    ctx.clearRect(0, 0, W, H);
    t += 0.01;

    dots.forEach(d => {
      const dist = Math.hypot(d.x - mx, d.y - my);
      const glow = Math.max(0, 1 - dist / 260);
      const flicker = Math.sin(t * d.speed * 100 + d.phase) * 0.5 + 0.5;
      const alpha = d.o + glow * 0.35 + flicker * 0.05;
      const size = d.s + glow * 1.2;

      ctx.beginPath();
      ctx.arc(d.x, d.y, size, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(200,169,110,${alpha})`;
      ctx.fill();
    });

    requestAnimationFrame(draw);
  }

  window.addEventListener('resize', resize);
  resize();
  draw();
})();


/* ─── Scroll-Driven Book Animation ─────────────────────────── */
(function initBook() {
  const section = document.getElementById('education');
  const pageL   = document.getElementById('page-left');
  const pageR   = document.getElementById('page-right');
  if (!section || !pageL || !pageR) return;

  function onScroll() {
    const rect = section.getBoundingClientRect();
    const vh   = window.innerHeight;

    // progress 0 → 1 while section is in view
    const progress = Math.min(1, Math.max(0,
      (-rect.top + vh * 0.2) / (rect.height * 0.55)
    ));

    // pages open outward
    const angle = progress * 50;  // 0 → 50 deg
    pageL.style.transform = `rotateY(${-angle}deg)`;
    pageR.style.transform  = `rotateY(${angle}deg)`;

    // fade content in once open enough
    const opacity = progress > 0.5 ? ((progress - 0.5) / 0.5) : 0;
    pageL.querySelectorAll('.edu-entry').forEach((el, i) => {
      el.style.opacity = Math.min(1, opacity * 1.5 - i * 0.2);
    });
    pageR.querySelectorAll('.edu-entry').forEach((el, i) => {
      el.style.opacity = Math.min(1, opacity * 1.5 - i * 0.2);
    });
  }

  // initial state — entries hidden
  document.querySelectorAll('.edu-entry').forEach(el => el.style.opacity = '0');

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
})();


/* ─── IntersectionObserver Reveals ─────────────────────────── */
(function initReveal() {
  const io = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        const delay = e.target.dataset.delay || 0;
        setTimeout(() => e.target.classList.add('visible'), +delay);
        io.unobserve(e.target);
      }
    });
  }, { threshold: 0.15 });

  document.querySelectorAll('.panel, .award-row, .sport-card, .ec-card').forEach(el => io.observe(el));
})();


/* ─── Image placeholder fallback ───────────────────────────── */
document.querySelectorAll('img').forEach(img => {
  img.addEventListener('error', function () {
    const wrap = this.closest(
      '.robot-img-wrap, .sport-img-wrap, .cine-img-wrap, .profile-ring'
    );
    if (wrap) wrap.classList.add('img-placeholder');
  });
});


/* ─── Parallax subtle on hero ──────────────────────────────── */
(function initParallax() {
  const ring = document.querySelector('.profile-ring');
  if (!ring) return;
  window.addEventListener('scroll', () => {
    const y = window.scrollY;
    ring.style.transform = `translateY(${y * 0.08}px)`;
  }, { passive: true });
})();
