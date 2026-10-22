/* ==========================================================================
   Access Digital Solutions Arena (ADSA) — assets/js/core.js
   Shared by every page:
   page transitions → intelligent navigation → scroll choreography → reveals
   → interactions → mobile menu → hardened forms → accessibility safeguards.
   No dependencies. Each feature is isolated: one failure can never break the site.
   ========================================================================== */
(() => {
  'use strict';

  const CFG = window.ADSA_CONFIG || {};
  const $  = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => Array.from(c.querySelectorAll(s));
  const clamp = (n, a, b) => Math.min(b, Math.max(a, n));
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const finePointer = window.matchMedia('(hover:hover) and (pointer:fine)').matches;
  const safe = (fn, fallback) => { try { return fn(); } catch (e) { return fallback; } };

  /* ---------- tiny scroll bus (one rAF-throttled listener for everyone) ---------- */
  const scrollFns = [];
  let ticking = false;
  const tick = () => { ticking = false; scrollFns.forEach(f => safe(f)); };
  const onScroll = fn => { scrollFns.push(fn); };
  window.addEventListener('scroll', () => { if (!ticking) { ticking = true; requestAnimationFrame(tick); } }, { passive: true });
  window.addEventListener('resize', () => { if (!ticking) { ticking = true; requestAnimationFrame(tick); } });

  /* ---------- toast ---------- */
  let toastTimer;
  const toast = msg => {
    let t = $('.toast');
    if (!t) { t = document.createElement('div'); t.className = 'toast'; t.setAttribute('role', 'status'); t.setAttribute('aria-live', 'polite'); document.body.appendChild(t); }
    t.textContent = msg; t.classList.add('show');
    clearTimeout(toastTimer); toastTimer = setTimeout(() => t.classList.remove('show'), 3200);
  };

  /* ---------- 1. Brand lock guard ---------- */
  const brandGuard = () => {
    const text = document.title + ' ' + document.body.textContent;
    if (/ai\s*digital\s+solutions/i.test(text)) {
      console.error('[ADSA] Retired brand name detected. The official name is "' + CFG.brand + ' (' + CFG.abbreviation + ')".');
    }
  };

  /* ---------- 2. Text splitting (title reveal) & scrubbed text ---------- */
  const initSplit = () => {
    $$('[data-split]').forEach(el => {
      let i = 0;
      el.style.setProperty('--base', (el.dataset.base || 0) + 'ms');
      const walk = node => {
        Array.from(node.childNodes).forEach(n => {
          if (n.nodeType === 3) {
            const frag = document.createDocumentFragment();
            n.textContent.split(/(\s+)/).forEach(p => {
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
      const label = el.textContent.replace(/\s+/g, ' ').trim();
      walk(el);
      el.setAttribute('aria-label', label);              // screen readers hear the sentence once
      $$('.w', el).forEach(w => w.setAttribute('aria-hidden', 'true'));
    });
  };

  const initScrub = () => {
    $$('[data-scrub]').forEach(el => {
      const words = [];
      const walk = node => Array.from(node.childNodes).forEach(n => {
        if (n.nodeType === 3) {
          const frag = document.createDocumentFragment();
          n.textContent.split(/(\s+)/).forEach(p => {
            if (!p) return;
            if (/^\s+$/.test(p)) { frag.appendChild(document.createTextNode(' ')); return; }
            const s = document.createElement('span'); s.className = 'sw'; s.textContent = p; words.push(s); frag.appendChild(s);
          });
          node.replaceChild(frag, n);
        } else if (n.nodeType === 1) walk(n);
      });
      el.classList.add('scrub'); walk(el);
      const update = () => {
        if (reduceMotion) { words.forEach(w => w.classList.add('lit')); return; }
        const r = el.getBoundingClientRect(), vh = innerHeight;
        const p = clamp((vh * .82 - r.top) / (r.height + vh * .35), 0, 1);
        const n = Math.round(p * words.length);
        words.forEach((w, i) => w.classList.toggle('lit', i < n));
      };
      onScroll(update); update();
    });
  };

  /* ---------- 3. Reveals ---------- */
  let revealStarted = false;
  const startReveals = () => {
    if (revealStarted) return; revealStarted = true;
    document.body.classList.remove('is-locked');
    document.body.classList.add('is-ready');
    const els = $$('.reveal, .reveal-img, [data-split]');
    // After its reveal finishes, hand the element back to its own styles (see .done in base.css)
    const settle = el => {
      if (!el.classList.contains('reveal')) return;
      const wait = 1300 + (parseInt(el.style.getPropertyValue('--d'), 10) || 0) * 90;
      setTimeout(() => el.classList.add('done'), wait);
    };
    if (reduceMotion || !('IntersectionObserver' in window)) { els.forEach(e => { e.classList.add('in'); settle(e); }); return; }
    // Clipped images (.reveal-img) are invisible to the observer, so we watch their parent and reveal the image with it
    const proxy = new Map();
    const io = new IntersectionObserver(entries => {
      entries.forEach(en => {
        if (!en.isIntersecting) return;
        const el = proxy.get(en.target) || en.target;
        el.classList.add('in'); settle(el); io.unobserve(en.target);
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -8% 0px' });
    els.forEach(e => {
      if (e.classList.contains('reveal-img') && e.parentElement) { proxy.set(e.parentElement, e); io.observe(e.parentElement); }
      else io.observe(e);
    });
  };

  /* ---------- 4. Page curtain: arrival + departure ---------- */
  const initCurtain = () => {
    const c = $('#curtain'); if (!c) return;
    if (reduceMotion) { c.hidden = true; return; }
    const lift = () => { c.classList.add('is-lift'); setTimeout(() => { c.classList.remove('is-arriving', 'is-lift', 'is-in'); }, 900); };
    requestAnimationFrame(() => setTimeout(lift, 120));
    window.addEventListener('pageshow', e => { if (e.persisted) { c.classList.remove('is-in', 'is-arriving', 'is-lift'); } });   // back/forward cache
    document.addEventListener('click', e => {
      const a = e.target.closest('a[href]');
      if (!a || e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      if (a.target && a.target !== '_self') return;
      if (a.hasAttribute('download')) return;
      let u; try { u = new URL(a.href, location.href); } catch (_) { return; }
      if (u.origin !== location.origin || !/^https?:$/.test(u.protocol)) return;
      if (u.pathname === location.pathname && u.search === location.search) return;     // same page / hash jump
      e.preventDefault();
      c.classList.toggle('is-commerce', /\/store\/?/.test(u.pathname));
      c.classList.remove('is-arriving', 'is-lift'); c.classList.add('is-in');
      setTimeout(() => { location.href = u.href; }, 620);
    });
  };

  /* ---------- 5. Header, progress, current page ---------- */
  const initNavigation = () => {
    const header = $('#header'), bar = $('#progress'), list = $('#navList');
    const page = document.body.dataset.page;
    $$('.nav__link', list).forEach(a => {
      if (a.dataset.page === page) a.setAttribute('aria-current', 'page'); else a.removeAttribute('aria-current');
    });
    let lastY = window.scrollY;
    onScroll(() => {
      const y = window.scrollY, max = document.documentElement.scrollHeight - innerHeight;
      if (bar) bar.style.transform = 'scaleX(' + (max > 0 ? clamp(y / max, 0, 1) : 0) + ')';
      header.classList.toggle('is-scrolled', y > 24);
      const open = list.classList.contains('is-open');
      header.classList.toggle('is-hidden', !open && y > lastY + 6 && y > 400);
      if (y < lastY - 4 || y < 400) header.classList.remove('is-hidden');
      lastY = y;
    });
    header.addEventListener('focusin', () => header.classList.remove('is-hidden'));
    const top = $('#toTop'); if (top) top.addEventListener('click', () => window.scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' }));
    // After an in-page jump, move focus to the target (keyboard / screen reader users)
    document.addEventListener('click', e => {
      const a = e.target.closest('a[href^="#"]'); if (!a) return;
      const id = a.getAttribute('href').slice(1), t = id && document.getElementById(id); if (!t) return;
      setTimeout(() => { if (!t.hasAttribute('tabindex')) t.setAttribute('tabindex', '-1'); t.focus({ preventScroll: true }); }, 700);
    });
    const y = $('#year'); if (y) y.textContent = new Date().getFullYear();
  };

  /* ---------- 6. Mobile menu (focus trap, Esc, scroll lock) ---------- */
  const initMenu = () => {
    const btn = $('#menuBtn'), list = $('#navList'); if (!btn || !list) return;
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
        const f = [btn, ...$$('a', list)], first = f[0], last = f[f.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    });
    if (mq.addEventListener) mq.addEventListener('change', () => { if (!mq.matches) { list.classList.remove('is-open'); btn.setAttribute('aria-expanded', 'false'); document.body.classList.remove('is-locked'); } });
  };

  /* ---------- 7. Parallax + micro-interactions ---------- */
  const initParallax = () => {
    if (reduceMotion) return;
    const els = $$('[data-parallax]'); if (!els.length) return;
    onScroll(() => els.forEach(el => {
      const r = el.getBoundingClientRect(); if (r.bottom < -200 || r.top > innerHeight + 200) return;
      const k = parseFloat(el.dataset.parallax) || .1;
      el.style.transform = 'translate3d(0,' + ((r.top + r.height / 2 - innerHeight / 2) * -k).toFixed(1) + 'px,0)';
    }));
  };
  const initInteractions = () => {
    $$('[data-spot]').forEach(c => c.addEventListener('pointermove', e => {
      const r = c.getBoundingClientRect(); c.style.setProperty('--mx', (e.clientX - r.left) + 'px'); c.style.setProperty('--my', (e.clientY - r.top) + 'px');
    }));
    if (!finePointer || reduceMotion) return;
    const glow = $('#glow');
    if (glow) {
      let gx = 0, gy = 0, tx = 0, ty = 0, on = false;
      const loop = () => { gx += (tx - gx) * .12; gy += (ty - gy) * .12; glow.style.transform = 'translate3d(' + gx + 'px,' + gy + 'px,0)'; requestAnimationFrame(loop); };
      window.addEventListener('pointermove', e => { tx = e.clientX; ty = e.clientY; if (!on) { on = true; glow.classList.add('is-on'); loop(); } }, { passive: true });
    }
    $$('[data-magnetic]').forEach(b => {
      b.addEventListener('pointermove', e => { const r = b.getBoundingClientRect(); b.style.transform = 'translate(' + ((e.clientX - r.left - r.width / 2) * .18) + 'px,' + ((e.clientY - r.top - r.height / 2) * .25) + 'px)'; });
      b.addEventListener('pointerleave', () => { b.style.transform = ''; });
    });
    $$('[data-tilt]').forEach(t => {
      t.addEventListener('pointermove', e => {
        const r = t.getBoundingClientRect(), px = (e.clientX - r.left) / r.width - .5, py = (e.clientY - r.top) / r.height - .5;
        t.style.transform = 'perspective(1100px) rotateY(' + (px * 12) + 'deg) rotateX(' + (-py * 10) + 'deg)';
      });
      t.addEventListener('pointerleave', () => { t.style.transform = ''; });
    });
  };

  /* ---------- 8. Forms — Web3Forms, hardened against bots and abuse ----------
     Layers (client side, speed bumps): required/format validation, length caps, control-char
     stripping, two honeypots (botcheck checkbox + decoy text field), minimum fill time, per-browser
     cooldown and hourly cap, link-spam rule, request timeout.
     Layer that actually stops determined bots (server side): hCaptcha, switched on in the
     Web3Forms dashboard. The widget below is loaded lazily on first interaction.            */
  const F = CFG.forms || {};
  const clean = v => String(v).replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, '').replace(/\s+\n/g, '\n').trim();
  const emailOk = v => v.length <= 254 && /^[^\s@<>()[\]\\,;:"]+@[^\s@<>()[\]\\,;:"]+\.[A-Za-z]{2,}$/.test(v);
  let captchaLoading = false;
  const loadCaptcha = () => {
    if (!F.captcha || captchaLoading || !$('.h-captcha')) return; captchaLoading = true;
    const s = document.createElement('script'); s.src = 'https://web3forms.com/client/script.js'; s.async = true; s.defer = true;
    document.body.appendChild(s);
  };
  const rate = {
    read: () => safe(() => JSON.parse(localStorage.getItem('adsa-sends') || '[]').filter(t => Date.now() - t < 3600000), []),
    write: list => safe(() => localStorage.setItem('adsa-sends', JSON.stringify(list)))
  };
  const initForms = () => {
    $$('form[data-form]').forEach(form => {
      const status = $('.form-status', form), btn = $('button[type=submit]', form), kind = form.dataset.form;
      const opened = { t: Date.now() };
      form.addEventListener('focusin', () => { loadCaptcha(); }, { once: true });
      form.addEventListener('pointerenter', () => { loadCaptcha(); }, { once: true });
      form.addEventListener('focusin', () => { if (!opened.focused) { opened.focused = true; opened.t = Date.now(); } });
      const say = (m, k) => { status.textContent = m; status.className = 'form-status ' + (k || ''); };
      const msgBox = $('textarea', form), counter = $('.count', form);
      if (msgBox) { msgBox.maxLength = F.maxMessage || 2000; if (counter) msgBox.addEventListener('input', () => { counter.textContent = msgBox.value.length + ' / ' + msgBox.maxLength; }); }

      const validate = () => {
        let ok = true;
        $$('input[required],textarea[required],select[required]', form).forEach(f => {
          const err = f.parentElement.querySelector('.err'); let m = ''; const v = clean(f.value);
          if (!v) m = 'This field is required.';
          else if (f.type === 'email' && !emailOk(v)) m = 'Please enter a valid email address.';
          else if (f.name === 'name' && (v.length < 2 || v.length > 80)) m = 'Please enter your name (2–80 characters).';
          else if (f.name === 'message' && v.length < 10) m = 'Please write at least 10 characters.';
          f.setAttribute('aria-invalid', m ? 'true' : 'false');
          if (err) err.textContent = m;
          if (m && ok) { ok = false; f.focus(); }
        });
        return ok;
      };

      form.addEventListener('submit', async e => {
        e.preventDefault(); say('');
        if (btn.disabled) return;
        if (!validate()) return say('Please fix the highlighted fields.', 'bad');

        // honeypots: pretend success so bots learn nothing
        const bot = form.elements.botcheck && form.elements.botcheck.checked, decoy = form.elements.website && form.elements.website.value;
        if (bot || decoy) { form.reset(); return say(kind === 'newsletter' ? 'Thank you — you are on the list.' : 'Thank you — your message has been sent.', 'ok'); }

        if (Date.now() - opened.t < (F.minFillMs || 3500)) return say('That was very quick — please take a moment and try again.', 'bad');
        const sends = rate.read(), last = sends[sends.length - 1] || 0;
        if (Date.now() - last < (F.cooldownMs || 60000)) return say('Please wait a minute before sending another message.', 'bad');
        if (sends.length >= (F.hourlyLimit || 5)) return say('You have reached the hourly limit. Please try again later or email us directly.', 'bad');

        const fd = new FormData(form);
        const message = clean(fd.get('message') || '');
        if ((message.match(/https?:\/\/|www\./gi) || []).length > 2) return say('Please remove extra links from your message.', 'bad');
        const cap = $('.h-captcha', form), token = fd.get('h-captcha-response');
        if (F.captcha && cap && cap.querySelector('iframe') && !token) return say('Please complete the security check.', 'bad');

        // build a clean payload (only known fields are ever sent)
        const out = new FormData();
        out.append('access_key', F.accessKey);
        out.append('from_name', F.fromName || 'ADSA website');
        out.append('subject', kind === 'newsletter' ? 'New ADSA newsletter subscriber' : 'New message from the ADSA website — ' + clean(fd.get('topic') || 'General question'));
        out.append('email', clean(fd.get('email')));
        if (kind === 'contact') { out.append('name', clean(fd.get('name'))); out.append('topic', clean(fd.get('topic') || '')); out.append('message', message); }
        else { out.append('name', 'Newsletter subscriber'); out.append('message', 'Please add this email address to the ADSA newsletter list.'); }
        out.append('botcheck', '');
        if (token) out.append('h-captcha-response', token);

        btn.disabled = true; const label = btn.textContent; btn.textContent = 'Sending…'; say('Sending…');
        const ctl = new AbortController(), to = setTimeout(() => ctl.abort(), 15000);
        try {
          const res = await fetch(F.endpoint, { method: 'POST', body: out, headers: { Accept: 'application/json' }, signal: ctl.signal, referrerPolicy: 'strict-origin-when-cross-origin' });
          const data = await res.json().catch(() => ({}));
          if (res.ok && data.success) {
            sends.push(Date.now()); rate.write(sends);
            form.reset(); if (counter) counter.textContent = '0 / ' + (F.maxMessage || 2000);
            if (window.hcaptcha) safe(() => window.hcaptcha.reset());
            opened.t = Date.now();
            say(kind === 'newsletter' ? 'Thank you — you are on the list.' : 'Thank you — your message has been sent.', 'ok');
          } else say((data && data.message) ? 'Could not send: ' + String(data.message).slice(0, 140) : 'Something went wrong. Please try again.', 'bad');
        } catch (err) {
          say(err && err.name === 'AbortError' ? 'The request timed out. Please try again.' : 'Network error. Please check your connection and try again.', 'bad');
        } finally { clearTimeout(to); btn.disabled = false; btn.textContent = label; }
      });
    });
  };

  /* ---------- 9. Scroll choreography: pinned scenes + horizontal shelf ---------- */
  const initPins = () => {
    $$('[data-pin]').forEach(track => {
      const stage = $('.pin__stage', track), steps = $$('[data-pin-step]', track);
      if (!stage || !steps.length) return;
      const update = () => {
        if (getComputedStyle(stage).position !== 'sticky') { steps.forEach(s => s.classList.remove('is-on', 'is-done')); track.style.setProperty('--p', 0); return; }
        const r = track.getBoundingClientRect(), span = r.height - innerHeight;
        const p = clamp(-r.top / span, 0, 1);
        track.style.setProperty('--p', p.toFixed(4));
        const idx = Math.min(steps.length - 1, Math.floor(p * steps.length));
        steps.forEach((s, i) => { s.classList.toggle('is-on', i === idx); s.classList.toggle('is-done', i < idx); });
      };
      onScroll(update); update();
    });
  };
  const initHScroll = () => {
    $$('[data-hscroll]').forEach(track => {
      const stage = $('.hs__stage', track), rail = $('.hs__rail', track);
      if (!stage || !rail) return;
      let dist = 0;
      const pinned = () => getComputedStyle(stage).position === 'sticky';
      const size = () => {
        if (!pinned()) { track.style.height = ''; rail.style.transform = ''; dist = 0; return; }
        dist = Math.max(0, rail.scrollWidth - stage.clientWidth);
        track.style.height = (dist + innerHeight) + 'px';
      };
      const update = () => {
        if (!pinned()) { track.style.setProperty('--p', 0); return; }
        const r = track.getBoundingClientRect(), span = Math.max(1, r.height - innerHeight);
        const p = clamp(-r.top / span, 0, 1);
        track.style.setProperty('--p', p.toFixed(4));
        rail.style.transform = 'translate3d(' + (-p * dist).toFixed(1) + 'px,0,0)';
      };
      window.addEventListener('resize', () => { size(); update(); });
      window.addEventListener('load', () => { size(); update(); });
      size(); onScroll(update); update();
    });
  };

  /* ---------- 10. Copy-to-clipboard buttons ---------- */
  const initCopy = () => {
    $$('[data-copy]').forEach(b => b.addEventListener('click', async () => {
      const text = b.dataset.copy;
      try { await navigator.clipboard.writeText(text); toast('Copied: ' + text); }
      catch (_) { toast('Copy not available — please select the text.'); }
    }));
  };

  /* ---------- Boot ---------- */
  const run = fn => { try { fn(); } catch (err) { console.error('[ADSA]', fn.name || 'init', err); } };
  const boot = () => {
    document.documentElement.classList.add('js-ready');
    window.ADSA = Object.freeze({ $, $$, clamp, reduceMotion, finePointer, onScroll, toast, startReveals, safe });
    [brandGuard, initSplit, initScrub, initMenu, initNavigation, initCurtain, initParallax, initInteractions, initPins, initHScroll, initCopy, initForms].forEach(run);
    // Pages with their own cinematic entrance (Home) set data-intro="true" and call ADSA.startReveals() themselves.
    if (document.body.dataset.intro === 'true') return;
    setTimeout(startReveals, reduceMotion ? 0 : 380);
  };
  document.readyState === 'loading' ? document.addEventListener('DOMContentLoaded', boot) : boot();
})();
