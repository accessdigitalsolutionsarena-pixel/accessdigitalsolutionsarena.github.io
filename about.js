/* ==========================================================================
   ADSA — about/about.js
   Page-only behaviour: the six core values take turns coming into focus (slowly, and only
   while the section is on screen and nobody is hovering) so the grid feels alive.
   ========================================================================== */
(() => {
  'use strict';
  const A = window.ADSA; if (!A) return;
  const { $, $$, reduceMotion } = A;

  const section = $('#values'), cards = $$('[data-value]');
  if (!section || !cards.length || reduceMotion) return;

  let i = -1, timer = 0, visible = false, hovering = false;
  const step = () => {
    if (!visible || hovering || document.hidden) return;
    i = (i + 1) % cards.length;
    cards.forEach((c, k) => c.classList.toggle('is-cycle', k === i));
  };
  const start = () => { if (!timer) timer = setInterval(step, 2600); };
  const stop = () => { clearInterval(timer); timer = 0; cards.forEach(c => c.classList.remove('is-cycle')); };

  if ('IntersectionObserver' in window) {
    new IntersectionObserver(es => { visible = es[0].isIntersecting; visible ? start() : stop(); }, { threshold: .25 }).observe(section);
  }
  cards.forEach(c => {
    c.addEventListener('pointerenter', () => { hovering = true; cards.forEach(x => x.classList.remove('is-cycle')); });
    c.addEventListener('pointerleave', () => { hovering = false; });
  });
})();
