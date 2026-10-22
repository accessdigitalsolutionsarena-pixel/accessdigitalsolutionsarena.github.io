/* ==========================================================================
   Access Digital Solutions Arena (ADSA) — script.js  (HOME page)
   Shared behaviour (navigation, curtain, reveals, pinned scenes, forms) is in assets/js/core.js.
   This file: cinematic entrance + the hero "connected nodes" canvas.
   ========================================================================== */
(() => {
  'use strict';
  const A = window.ADSA; if (!A) return;
  const { $, clamp, reduceMotion, safe } = A;

  /* ---------- Cinematic entrance ---------- */
  const initPreloader = () => {
    const pl = $('#preloader');
    if (!pl || reduceMotion) { if (pl) pl.hidden = true; return A.startReveals(); }
    const seen = safe(() => sessionStorage.getItem('adsa-seen'), null);
    document.body.classList.add('is-locked');
    let done = false;
    const finish = () => {
      if (done) return; done = true;
      pl.classList.add('is-done');
      safe(() => sessionStorage.setItem('adsa-seen', '1'));
      setTimeout(A.startReveals, 450);            // hero lines begin as the curtain lifts
      setTimeout(() => { pl.hidden = true; }, 1300);
    };
    const skip = $('#plSkip'); if (skip) skip.addEventListener('click', finish);
    setTimeout(finish, seen ? 900 : 3000);        // shorter on return visits
    window.addEventListener('keydown', e => { if (e.key === 'Escape') finish(); }, { once: true });
  };

  /* ---------- Hero canvas: the Solution Path as a quiet network ---------- */
  const initHero = () => {
    const cv = $('#heroCanvas'); if (!cv || !cv.getContext) return;
    const ctx = cv.getContext('2d'), hero = $('#home');
    let w, h, dpr, nodes = [], raf = 0, visible = true, mouse = { x: -999, y: -999 };
    const build = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = cv.clientWidth; h = cv.clientHeight;
      cv.width = w * dpr; cv.height = h * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const count = clamp(Math.round(w * h / 15000), 28, 90);
      nodes = Array.from({ length: count }, (_, i) => ({
        x: Math.random() * w, y: Math.random() * h,
        vx: (Math.random() - .5) * .22, vy: (Math.random() - .5) * .22,
        r: Math.random() * 1.4 + .8, gold: i % 9 === 0
      }));
    };
    const frame = () => {
      ctx.clearRect(0, 0, w, h);
      const max = Math.min(150, w / 6);
      for (let i = 0; i < nodes.length; i++) {
        const a = nodes[i];
        if (!reduceMotion) {
          a.x += a.vx; a.y += a.vy;
          if (a.x < 0 || a.x > w) a.vx *= -1;
          if (a.y < 0 || a.y > h) a.vy *= -1;
          const dx = a.x - mouse.x, dy = a.y - mouse.y, d2 = dx * dx + dy * dy;
          if (d2 < 14000) { const f = (1 - d2 / 14000) * .6; a.x += dx * f * .02; a.y += dy * f * .02; }
        }
        for (let j = i + 1; j < nodes.length; j++) {
          const b = nodes[j], dx = a.x - b.x, dy = a.y - b.y, d = Math.hypot(dx, dy);
          if (d < max) {
            ctx.strokeStyle = (a.gold || b.gold ? 'rgba(201,162,39,' : 'rgba(150,110,200,') + ((1 - d / max) * .35).toFixed(3) + ')';
            ctx.lineWidth = .7; ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
          }
        }
        ctx.fillStyle = a.gold ? 'rgba(201,162,39,.95)' : 'rgba(231,229,232,.55)';
        ctx.beginPath(); ctx.arc(a.x, a.y, a.gold ? a.r + .8 : a.r, 0, 6.283); ctx.fill();
      }
      raf = (!reduceMotion && visible && !document.hidden) ? requestAnimationFrame(frame) : 0;
    };
    const run = () => { if (!raf) raf = requestAnimationFrame(frame); };
    build(); frame();
    let rt; window.addEventListener('resize', () => { clearTimeout(rt); rt = setTimeout(() => { build(); frame(); }, 200); });
    hero.addEventListener('pointermove', e => { const r = cv.getBoundingClientRect(); mouse.x = e.clientX - r.left; mouse.y = e.clientY - r.top; });
    hero.addEventListener('pointerleave', () => { mouse.x = mouse.y = -999; });
    if ('IntersectionObserver' in window) new IntersectionObserver(es => { visible = es[0].isIntersecting; if (visible) run(); }).observe(hero);
    document.addEventListener('visibilitychange', () => { if (!document.hidden) run(); });
  };

  try { initHero(); } catch (e) { console.error('[ADSA] hero', e); }
  try { initPreloader(); } catch (e) { console.error('[ADSA] preloader', e); const pl = $('#preloader'); if (pl) pl.hidden = true; A.startReveals(); }
})();
