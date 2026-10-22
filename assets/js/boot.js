/* ADSA boot — runs first (tiny, blocking) so the .js class exists before first paint.
   Kept as a file, not inline, so the site's Content-Security-Policy can forbid inline scripts. */
document.documentElement.classList.add('js');
