/* ==========================================================================
   ADSA — resources/resources.js
   Page-only behaviour: sub-navigation scroll-spy, FAQ (one open at a time, animated, searchable,
   opens from a #hash).  Forms are handled by assets/js/core.js.
   ========================================================================== */
(() => {
  'use strict';
  const A = window.ADSA; if (!A) return;
  const { $, $$, reduceMotion } = A;

  /* ---- Sticky sub-navigation tucks up when the main header hides ---- */
  const header = $('#header');
  if (header && 'MutationObserver' in window) {
    const sync = () => document.body.classList.toggle('header-hidden', header.classList.contains('is-hidden'));
    new MutationObserver(sync).observe(header, { attributes: true, attributeFilter: ['class'] }); sync();
  }

  /* ---- Sub-navigation scroll-spy ---- */
  const links = $$('.subnav a'), map = new Map();
  links.forEach(a => { const s = $(a.getAttribute('href')); if (s) map.set(s, a); });
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver(es => es.forEach(e => {
      if (!e.isIntersecting) return;
      links.forEach(l => { l.classList.remove('is-active'); l.removeAttribute('aria-current'); });
      const a = map.get(e.target); if (a) { a.classList.add('is-active'); a.setAttribute('aria-current', 'true'); }
    }), { rootMargin: '-40% 0px -55% 0px' });
    map.forEach((_, s) => io.observe(s));
  }

  /* ---- FAQ ---- */
  const items = $$('.faq__item');
  const animate = (d, open) => {
    const body = $('.faq__a', d); if (!body || reduceMotion) { d.open = open; return; }
    if (open) {
      d.open = true; const h = body.scrollHeight;
      body.animate([{ height: '0px', opacity: 0 }, { height: h + 'px', opacity: 1 }], { duration: 420, easing: 'cubic-bezier(.2,.8,.2,1)' });
    } else {
      const h = body.scrollHeight;
      const a = body.animate([{ height: h + 'px', opacity: 1 }, { height: '0px', opacity: 0 }], { duration: 320, easing: 'cubic-bezier(.2,.8,.2,1)' });
      a.onfinish = () => { d.open = false; };
    }
  };
  items.forEach(d => {
    $('summary', d).addEventListener('click', e => {
      e.preventDefault();
      const willOpen = !d.open;
      if (willOpen) items.forEach(o => { if (o !== d && o.open) animate(o, false); });
      animate(d, willOpen);
    });
  });
  // Opening a question from a link like resources/#faq keeps the section in view; nothing else needed.

  /* ---- FAQ filter ---- */
  const input = $('#faqFilter'), none = $('#faqNone');
  if (input) input.addEventListener('input', () => {
    const q = input.value.trim().toLowerCase().slice(0, 60); let shown = 0;
    items.forEach(d => {
      const hit = !q || d.textContent.toLowerCase().includes(q);
      d.hidden = !hit; if (hit) shown++;
    });
    if (none) none.hidden = shown > 0;
  });
})();
