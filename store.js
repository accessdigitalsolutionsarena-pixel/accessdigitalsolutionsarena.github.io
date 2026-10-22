/* ==========================================================================
   ADSA — store/store.js
   Page-only behaviour: aisles "switch on" one by one as they enter (an emerald scan-line),
   so the map of the Store comes alive without implying any product exists.
   (The pinned rules scene is in assets/js/core.js.)
   ========================================================================== */
(() => {
  'use strict';
  const A = window.ADSA; if (!A) return;
  const { $$, reduceMotion } = A;

  const aisles = $$('.aisle');
  if (!aisles.length) return;
  if (reduceMotion || !('IntersectionObserver' in window)) { aisles.forEach(a => a.classList.add('lit')); return; }

  let queue = 0;
  const io = new IntersectionObserver(es => es.forEach(e => {
    if (!e.isIntersecting) return;
    io.unobserve(e.target);
    setTimeout(() => e.target.classList.add('lit'), (queue++ % 3) * 140);     // small stagger per row
    setTimeout(() => { queue = Math.max(0, queue - 1); }, 600);
  }), { threshold: .35 });
  aisles.forEach(a => io.observe(a));
})();
