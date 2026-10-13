/* ==========================================================================
   Access Digital Solutions Arena (ADSA) — script.js
   Entrance → navigation → scroll choreography → reveals → interactions
   → mobile behaviour → accessibility safeguards.  No dependencies.
   ========================================================================== */
(() => {
  'use strict';

  /* ------------------------------------------------------------------
     1. CONFIG — the only block you normally need to edit.
     ------------------------------------------------------------------ */
  const CONFIG = Object.freeze({
    // LOCKED brand name. Never change. (The earlier name is retired.)
    brand: 'Access Digital Solutions Arena',
    abbreviation: 'ADSA',

    logo: 'assets/logos/adsa-logo.png',   // full circular badge (entrance, favicon)
    logoMark: 'assets/logos/adsa-mark.png', // ADSA monogram crop (header + footer)

    links: {
      freeSample: '',                                  // ← paste the free-sample link (Selar/other)
      bundle1:    'https://selar.com/6p2j3l2ev8',      // Bundle 1 (verified)
      bundle2:    'https://selar.com/070m676959',      // Bundle 2 (verified)
      selar:      '',                                  // ← official ADSA Selar store URL
      email:      '',                                  // ← e.g. hello@yourdomain.com
      whatsapp:   ''                                   // ← digits only with country code, e.g. 2348012345678
    },

    // Formspree endpoints, e.g. 'https://formspree.io/f/abcdwxyz'
    forms: {
      contact:    '',
      newsletter: ''
    }
  });

  const $  = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => Array.from(c.querySelectorAll(s));
  const clamp = (n, a, b) => Math.min(b, Math.max(a, n));
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const finePointer  = window.matchMedia('(hover:hover) and (pointer:fine)').matches;
  const safe = (fn, fallback) => { try { return fn(); } catch (e) { return fallback; } };

  /* ------------------------------------------------------------------
     2. Brand lock guard — warns loudly if a retired name ever appears.
     ------------------------------------------------------------------ */
  const brandGuard = () => {
    const text = document.title + ' ' + document.body.textContent;
    if (/ai\s*digital\s+solutions/i.test(text)) {
      console.error('[ADSA] Retired brand name detected. The official name is "' + CONFIG.brand + ' (' + CONFIG.abbreviation + ')".');
    }
  };

  /* ------------------------------------------------------------------
     3. Logo — loads if present, otherwise the ADSA wordmark stays.
     ------------------------------------------------------------------ */
  // The logos are plain <img> tags in index.html (they load even if this script fails).
  // If an image file is missing, its onerror handler shows the text wordmark instead.
  const initLogo = () => {};

  /* ------------------------------------------------------------------
     4. Links from CONFIG (honest: empty = visibly "coming soon").
     ------------------------------------------------------------------ */
  let toastTimer;
  const toast = msg => {
    let t = $('.toast');
    if (!t) { t = document.createElement('div'); t.className = 'toast'; t.setAttribute('role', 'status'); t.setAttribute('aria-live', 'polite'); document.body.appendChild(t); }
    t.textContent = msg; t.classList.add('show');
    clearTimeout(toastTimer); toastTimer = setTimeout(() => t.classList.remove('show'), 3200);
  };
  const initLinks = () => {
    const L = CONFIG.links;
    const resolve = key => {
      const v = (L[key] || '').trim();
      if (!v) return '';
      if (key === 'email') return 'mailto:' + v;
      if (key === 'whatsapp') return 'https://wa.me/' + v.replace(/\D/g, '');
      return v;
    };
    $$('[data-link]').forEach(a => {
      const key = a.dataset.link, href = resolve(key);
      if (href) {
        a.href = href; a.removeAttribute('aria-disabled');
        if (/^https?:/.test(href)) { a.target = '_blank'; a.rel = 'noopener noreferrer'; }
        const slot = $('[data-slot="' + key + '"]', a);
        if (slot) slot.textContent = key === 'email' ? L.email : key === 'whatsapp' ? '+' + L.whatsapp.replace(/\D/g, '') : 'selar.com';
      } else {
        a.setAttribute('aria-disabled', 'true');
        a.removeAttribute('target');
        a.title = 'Link coming soon';
        a.addEventListener('click', e => { e.preventDefault(); toast('This link is coming soon.'); });
      }
    });
  };

  /* ------------------------------------------------------------------
     5. Split text into words for the cinematic title reveal.
     ------------------------------------------------------------------ */
  const initSplit = () => {
    $$('[data-split]').forEach(el => {
      let i = 0;
      el.style.setProperty('--base', (el.dataset.base || 0) + 'ms');
      const walk = node => {
        Array.from(node.childNodes).forEach(n => {
          if (n.nodeType === 3) {
            const parts = n.textContent.split(/(\s+)/);
            const frag = document.createDocumentFragment();
            parts.forEach(p => {
              if (!p) return;
              if (/^\s+$/.test(p)) { frag.appendChild(document.createTextNode(' ')); return; }
              const w = document.createElement('span'); w.className = 'w';
              const s = document.createElement('span'); s.textContent = p; s.style.setProperty('--i', i++);
              w.appendChild(s); frag.appendChild(w);
            });
            node.replaceChild(frag, n);
          } else if (n.nodeType === 1 && n.tagName !== 'BR') walk(n);
        });
      };
      walk(el);
      // SR users get the original sentence once, not word fragments
      const label = el.textContent.replace(/\s+/g, ' ').trim();
      el.setAttribute('aria-label', label);
      $$('.w', el).forEach(w => w.setAttribute('aria-hidden', 'true'));
    });
  };

  /* ------------------------------------------------------------------
     6. Cinematic entrance (preloader) → then reveals start.
     ------------------------------------------------------------------ */
  let revealStarted = false;
  const startReveals = () => {
    if (revealStarted) return; revealStarted = true;
    document.body.classList.remove('is-locked');
    document.body.classList.add('is-ready');
    const els = $$('.reveal, .reveal-line, [data-split]');
    if (reduceMotion || !('IntersectionObserver' in window)) { els.forEach(e => e.classList.add('in')); return; }
    const io = new IntersectionObserver(entries => {
      entries.forEach(en => { if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); } });
    }, { threshold: 0.14, rootMargin: '0px 0px -8% 0px' });
    els.forEach(e => io.observe(e));
  };
  const initPreloader = () => {
    const pl = $('#preloader');
    if (!pl) return startReveals();
    const seen = safe(() => sessionStorage.getItem('adsa-seen'), null);
    if (reduceMotion) { pl.hidden = true; return startReveals(); }
    document.body.classList.add('is-locked');
    let done = false;
    const finish = () => {
      if (done) return; done = true;
      pl.classList.add('is-done');
      safe(() => sessionStorage.setItem('adsa-seen', '1'));
      setTimeout(startReveals, 450);      // hero lines begin as the curtain lifts
      setTimeout(() => { pl.hidden = true; }, 1300);
    };
    $('#plSkip').addEventListener('click', finish);
    setTimeout(finish, seen ? 900 : 3000);  // shorter on return visits
    window.addEventListener('keydown', e => { if (e.key === 'Escape') finish(); }, { once: true });
  };

  /* ------------------------------------------------------------------
     7. Header, progress, section tracking, dots.
     ------------------------------------------------------------------ */
  const initNavigation = () => {
    const header = $('#header'), bar = $('#progress');
    let lastY = window.scrollY, ticking = false;
    const onScroll = () => {
      const y = window.scrollY, max = document.documentElement.scrollHeight - innerHeight;
      bar.style.transform = 'scaleX(' + (max > 0 ? clamp(y / max, 0, 1) : 0) + ')';
      header.classList.toggle('is-scrolled', y > 24);
      const menuOpen = $('#navList').classList.contains('is-open');
      header.classList.toggle('is-hidden', !menuOpen && y > lastY + 6 && y > 400);
      if (y < lastY - 4 || y < 400) header.classList.remove('is-hidden');
      lastY = y; ticking = false;
      updatePath();
    };
    window.addEventListener('scroll', () => { if (!ticking) { ticking = true; requestAnimationFrame(onScroll); } }, { passive: true });
    // keep header visible while keyboard focus is inside it
    header.addEventListener('focusin', () => header.classList.remove('is-hidden'));

    // Dots mirror the main menu
    const links = $$('.nav__list .nav__link');
    const dots = $('#dots');
    links.forEach(l => {
      const a = document.createElement('a');
      a.href = l.getAttribute('href'); a.setAttribute('aria-label', l.textContent.trim());
      a.innerHTML = '<span aria-hidden="true">' + l.textContent.trim() + '</span>';
      dots.appendChild(a);
    });
    const dotLinks = $$('a', dots);

    // Active section (main sections only; Solution Path & Ecosystem belong to Home)
    const map = { path: 'home', ecosystem: 'home' };
    const sections = $$('main > section[id]');
    const setActive = id => {
      const key = map[id] || id;
      [...links, ...dotLinks].forEach(a => {
        const on = a.getAttribute('href') === '#' + key;
        a.classList.toggle('is-active', on);
        on ? a.setAttribute('aria-current', 'true') : a.removeAttribute('aria-current');
      });
    };
    if ('IntersectionObserver' in window) {
      const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) setActive(e.target.id); }),
        { rootMargin: '-45% 0px -50% 0px' });
      sections.forEach(s => io.observe(s));
    }
    setActive('home');

    // Move focus to the target section after in-page navigation (a11y)
    document.addEventListener('click', e => {
      const a = e.target.closest('a[href^="#"]'); if (!a) return;
      const id = a.getAttribute('href').slice(1); const t = id && document.getElementById(id);
      if (!t) return;
      setTimeout(() => { if (!t.hasAttribute('tabindex')) t.setAttribute('tabindex', '-1'); t.focus({ preventScroll: true }); }, 700);
    });
    $('#toTop').addEventListener('click', () => window.scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' }));
    onScroll();
  };

  /* ------------------------------------------------------------------
     8. Mobile menu (focus trap, Esc, scroll lock).
     ------------------------------------------------------------------ */
  const initMenu = () => {
    const btn = $('#menuBtn'), list = $('#navList');
    const mq = window.matchMedia('(max-width:980px)');
    const set = open => {
      list.classList.toggle('is-open', open);
      btn.setAttribute('aria-expanded', String(open));
      btn.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
      if (mq.matches) document.body.classList.toggle('is-locked', open);
      if (open) $('a', list).focus();
    };
    btn.addEventListener('click', () => set(btn.getAttribute('aria-expanded') !== 'true'));
    $$('a', list).forEach(a => a.addEventListener('click', () => { if (list.classList.contains('is-open')) set(false); }));
    document.addEventListener('keydown', e => {
      if (!list.classList.contains('is-open')) return;
      if (e.key === 'Escape') { set(false); btn.focus(); }
      if (e.key === 'Tab') {
        const f = [btn, ...$$('a', list)]; const first = f[0], last = f[f.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    });
    mq.addEventListener && mq.addEventListener('change', () => { if (!mq.matches) { list.classList.remove('is-open'); btn.setAttribute('aria-expanded', 'false'); document.body.classList.remove('is-locked'); } });
  };

  /* ------------------------------------------------------------------
     9. Scroll choreography — the pinned Solution Path.
     ------------------------------------------------------------------ */
  let updatePath = () => {};
  const initPath = () => {
    const track = $('#pathTrack'); if (!track) return;
    const stage = $('.path__stage', track), steps = $$('.step', track);
    updatePath = () => {
      if (getComputedStyle(stage).position !== 'sticky') { steps.forEach(s => s.classList.remove('is-on', 'is-done')); return; }
      const r = track.getBoundingClientRect(), span = r.height - innerHeight;
      const p = clamp(-r.top / span, 0, 1);
      stage.style.setProperty('--p', p.toFixed(4));
      $('.path__steps', track).style.setProperty('--p', p.toFixed(4));
      const idx = Math.min(steps.length - 1, Math.floor(p * steps.length));
      steps.forEach((s, i) => { s.classList.toggle('is-on', i === idx); s.classList.toggle('is-done', i < idx); });
    };
    window.addEventListener('resize', updatePath);
    updatePath();
  };

  /* ------------------------------------------------------------------
     10. Hero canvas — "connected nodes": a quiet Solution Path network.
     ------------------------------------------------------------------ */
  const initHero = () => {
    const cv = $('#heroCanvas'); if (!cv || !cv.getContext) return;
    const ctx = cv.getContext('2d');
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
          if (a.x < 0 || a.x > w) a.vx *= -1; if (a.y < 0 || a.y > h) a.vy *= -1;
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
      if (!reduceMotion && visible && !document.hidden) raf = requestAnimationFrame(frame); else raf = 0;
    };
    const run = () => { if (!raf) raf = requestAnimationFrame(frame); };
    build(); frame();
    let rt; window.addEventListener('resize', () => { clearTimeout(rt); rt = setTimeout(() => { build(); frame(); }, 200); });
    const hero = $('#home');
    hero.addEventListener('pointermove', e => { const r = cv.getBoundingClientRect(); mouse.x = e.clientX - r.left; mouse.y = e.clientY - r.top; });
    hero.addEventListener('pointerleave', () => { mouse.x = mouse.y = -999; });
    if ('IntersectionObserver' in window) new IntersectionObserver(es => { visible = es[0].isIntersecting; if (visible) run(); }).observe(hero);
    document.addEventListener('visibilitychange', () => { if (!document.hidden) run(); });
  };

  /* ------------------------------------------------------------------
     11. Micro-interactions (fine pointers only; skipped for reduced motion).
     ------------------------------------------------------------------ */
  const initInteractions = () => {
    // card spotlight
    $$('.eco-card').forEach(c => c.addEventListener('pointermove', e => {
      const r = c.getBoundingClientRect(); c.style.setProperty('--mx', (e.clientX - r.left) + 'px'); c.style.setProperty('--my', (e.clientY - r.top) + 'px');
    }));
    if (!finePointer || reduceMotion) return;
    // cursor glow
    const glow = $('#glow'); let gx = 0, gy = 0, tx = 0, ty = 0, on = false;
    window.addEventListener('pointermove', e => { tx = e.clientX; ty = e.clientY; if (!on) { on = true; glow.classList.add('is-on'); loop(); } }, { passive: true });
    const loop = () => { gx += (tx - gx) * .12; gy += (ty - gy) * .12; glow.style.transform = 'translate3d(' + gx + 'px,' + gy + 'px,0)'; requestAnimationFrame(loop); };
    // magnetic buttons
    $$('[data-magnetic]').forEach(b => {
      b.addEventListener('pointermove', e => { const r = b.getBoundingClientRect(); b.style.transform = 'translate(' + ((e.clientX - r.left - r.width / 2) * .18) + 'px,' + ((e.clientY - r.top - r.height / 2) * .25) + 'px)'; });
      b.addEventListener('pointerleave', () => { b.style.transform = ''; });
    });
    // 3D tilt on the book cover
    $$('[data-tilt]').forEach(t => {
      t.addEventListener('pointermove', e => {
        const r = t.getBoundingClientRect(), px = (e.clientX - r.left) / r.width - .5, py = (e.clientY - r.top) / r.height - .5;
        t.style.transform = 'rotateY(' + (px * 14) + 'deg) rotateX(' + (-py * 12) + 'deg)';
      });
      t.addEventListener('pointerleave', () => { t.style.transform = ''; });
    });
  };

  /* ------------------------------------------------------------------
     12. Forms — Formspree-style endpoints, validation, honeypot.
     ------------------------------------------------------------------ */
  const initForms = () => {
    $$('form[data-form]').forEach(form => {
      const status = $('.form-status', form);
      const say = (msg, kind) => { status.textContent = msg; status.className = 'form-status ' + (kind || ''); };
      const validate = () => {
        let ok = true;
        $$('input[required],textarea[required]', form).forEach(f => {
          const err = f.parentElement.querySelector('.err'); let m = '';
          if (!f.value.trim()) m = 'This field is required.';
          else if (f.type === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(f.value.trim())) m = 'Please enter a valid email address.';
          f.setAttribute('aria-invalid', m ? 'true' : 'false');
          if (err) err.textContent = m;
          if (m && ok) { ok = false; f.focus(); }
        });
        return ok;
      };
      form.addEventListener('submit', async e => {
        e.preventDefault(); say('');
        if (!validate()) return say('Please fix the highlighted fields.', 'bad');
        if (form.elements._gotcha && form.elements._gotcha.value) return; // bot
        const url = CONFIG.forms[form.dataset.form];
        if (!url) return say('This form is not connected yet. Please check back soon.', 'bad');
        const btn = $('button[type=submit]', form); btn.disabled = true; say('Sending…');
        try {
          const res = await fetch(url, { method: 'POST', body: new FormData(form), headers: { Accept: 'application/json' } });
          if (res.ok) { form.reset(); say(form.dataset.form === 'newsletter' ? 'Thank you — you are on the list.' : 'Thank you — your message has been sent.', 'ok'); }
          else say('Something went wrong. Please try again.', 'bad');
        } catch (err) { say('Network error. Please check your connection and try again.', 'bad'); }
        btn.disabled = false;
      });
    });
  };

  /* ------------------------------------------------------------------
     Boot
     ------------------------------------------------------------------ */
  // Each feature runs on its own, so one failure can never break the whole site.
  const run = fn => { try { fn(); } catch (err) { console.error('[ADSA]', fn.name || 'init', err); } };
  const boot = () => {
    document.documentElement.classList.add('js-ready');   // tells the CSS that the JS menu is available
    run(brandGuard);
    const y = $('#year'); if (y) y.textContent = new Date().getFullYear();
    [initLogo, initLinks, initSplit, initMenu, initNavigation, initPath, initHero, initInteractions, initForms].forEach(run);
    try { initPreloader(); } catch (err) { console.error('[ADSA] preloader', err); const pl = $('#preloader'); if (pl) pl.hidden = true; startReveals(); }
  };
  document.readyState === 'loading' ? document.addEventListener('DOMContentLoaded', boot) : boot();
})();
