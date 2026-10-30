(function () {
  'use strict';

  // Scroll reveals (visible immediately if IntersectionObserver is missing)
  var items = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    items.forEach(function (el, i) {
      el.style.transitionDelay = (i % 4) * 70 + 'ms';
      io.observe(el);
    });
  } else {
    items.forEach(function (el) { el.classList.add('in'); });
  }

  // Hero number count-up (respects reduced motion)
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (!reduce) {
    document.querySelectorAll('[data-count]').forEach(function (el) {
      var target = parseInt(el.getAttribute('data-count'), 10);
      var suffix = el.getAttribute('data-suffix') || '';
      var start = null;
      function tick(t) {
        if (start === null) start = t;
        var p = Math.min((t - start) / 1200, 1);
        el.textContent = Math.round(target * (1 - Math.pow(1 - p, 3))) + (p === 1 ? suffix : '');
        if (p < 1) requestAnimationFrame(tick);
      }
      requestAnimationFrame(tick);
    });
  }

  // Sample-prompt tabs
  var tabs = document.querySelectorAll('.tabs [role="tab"]');
  tabs.forEach(function (tab) {
    tab.addEventListener('click', function () {
      tabs.forEach(function (t) {
        var on = t === tab;
        t.setAttribute('aria-selected', on ? 'true' : 'false');
        document.getElementById(t.getAttribute('aria-controls')).hidden = !on;
      });
    });
  });

  // Copy prompt
  document.querySelectorAll('.copy').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var text = document.getElementById(btn.getAttribute('data-target')).textContent.trim();
      var done = function () {
        var old = btn.textContent; btn.textContent = 'Copied';
        setTimeout(function () { btn.textContent = old; }, 1600);
      };
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(done, done);
      } else {
        var ta = document.createElement('textarea');
        ta.value = text; document.body.appendChild(ta); ta.select();
        try { document.execCommand('copy'); } catch (e) {}
        document.body.removeChild(ta); done();
      }
    });
  });

  // Currency toggle
  var ngn = document.getElementById('cur-ngn');
  var usd = document.getElementById('cur-usd');
  function setCur(c) {
    ngn.setAttribute('aria-pressed', c === 'ngn');
    usd.setAttribute('aria-pressed', c === 'usd');
    document.querySelectorAll('[data-ngn]').forEach(function (el) {
      el.textContent = el.getAttribute('data-' + c);
    });
  }
  ngn.addEventListener('click', function () { setCur('ngn'); });
  usd.addEventListener('click', function () { setCur('usd'); });

  // Sticky mobile CTA appears after the hero, hides at the plans section
  var sticky = document.getElementById('sticky');
  var plans = document.getElementById('plans');
  function onScroll() {
    var y = window.scrollY;
    var pr = plans.getBoundingClientRect();
    var inPlans = pr.top < window.innerHeight * 0.6 && pr.bottom > 0;
    sticky.classList.toggle('show', y > 700 && !inPlans);
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
})();
