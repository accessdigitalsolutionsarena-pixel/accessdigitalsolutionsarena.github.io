/* ==========================================================================
   ADSA — solutions/solutions.js
   Page-only behaviour: the Purple → Gold light sweep across each edition card as it
   enters, and a gentle highlight when someone arrives via #naija-agents.
   ========================================================================== */
(() => {
  'use strict';
  const A = window.ADSA; if (!A) return;
  const { $, $$, reduceMotion } = A;

  const tiers = $$('.tier');
  if (tiers.length) {
    if (reduceMotion || !('IntersectionObserver' in window)) tiers.forEach(t => t.classList.add('swept'));
    else {
      const io = new IntersectionObserver(es => es.forEach(e => {
        if (e.isIntersecting) { e.target.classList.add('swept'); io.unobserve(e.target); }
      }), { threshold: .5 });
      tiers.forEach(t => io.observe(t));
    }
  }

  const product = $('#naija-agents');
  const pulse = () => {
    if (!product || reduceMotion) return;
    product.classList.remove('is-targeted'); void product.offsetWidth; product.classList.add('is-targeted');
  };
  if (location.hash === '#naija-agents') setTimeout(pulse, 900);
  $$('a[href="#naija-agents"]').forEach(a => a.addEventListener('click', () => setTimeout(pulse, 700)));
})();
