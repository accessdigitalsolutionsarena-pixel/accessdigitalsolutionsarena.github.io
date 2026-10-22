/* ==========================================================================
   ADSA — books/books.js
   Page-only behaviour: the shelf counter and "focus" card follow the horizontal scroll.
   (The pinned horizontal scene itself is in assets/js/core.js.)
   ========================================================================== */
(() => {
  'use strict';
  const A = window.ADSA; if (!A) return;
  const { $, $$, clamp } = A;

  const track = $('[data-hscroll]'); if (!track) return;
  const cards = $$('.shelf-card', track), count = $('#shelfCount');
  const pad = n => String(n).padStart(2, '0');

  const update = () => {
    const stage = $('.hs__stage', track);
    const pinned = getComputedStyle(stage).position === 'sticky';
    if (!pinned) { cards.forEach(c => c.classList.remove('is-focus')); return; }
    // The card nearest the left third of the viewport is "in focus"
    const target = innerWidth * 0.38; let best = 0, bestD = Infinity;
    cards.forEach((c, i) => {
      const r = c.getBoundingClientRect(), d = Math.abs(r.left + r.width / 2 - target);
      if (d < bestD) { bestD = d; best = i; }
    });
    cards.forEach((c, i) => c.classList.toggle('is-focus', i === best));
    if (count) count.textContent = pad(clamp(best + 1, 1, cards.length));
  };
  A.onScroll(update); update();

  // Touch / small screens: the shelf is a native swipe rail, so the counter follows the swipe
  const rail = $('.hs__rail', track);
  rail.addEventListener('scroll', () => {
    if (getComputedStyle($('.hs__stage', track)).position === 'sticky') return;
    const i = Math.round(rail.scrollLeft / (cards[0].offsetWidth + 19));
    if (count) count.textContent = pad(clamp(i + 1, 1, cards.length));
  }, { passive: true });
})();
