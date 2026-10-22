/* ==========================================================================
   ADSA — blog/blog.js
   Page-only behaviour: the Blueprint steps light up in order as you read down the list,
   and the gold rail fills to match (scroll choreography).
   ========================================================================== */
(() => {
  'use strict';
  const A = window.ADSA; if (!A) return;
  const { $, $$, clamp, reduceMotion } = A;

  const list = $('#bpList'); if (!list) return;
  const items = $$('[data-bp]', list);
  const update = () => {
    if (reduceMotion || innerWidth <= 980) { items.forEach(i => i.classList.remove('is-on', 'is-done')); list.style.setProperty('--p', 1); return; }
    const r = list.getBoundingClientRect();
    const focusY = innerHeight * .55;                                   // reading line
    const p = clamp((focusY - r.top) / r.height, 0, 1);
    list.style.setProperty('--p', p.toFixed(4));
    let idx = -1;
    items.forEach((it, i) => { const b = it.getBoundingClientRect(); if (b.top < focusY) idx = i; });
    items.forEach((it, i) => { it.classList.toggle('is-on', i === idx); it.classList.toggle('is-done', i < idx); });
  };
  A.onScroll(update); update();
})();
