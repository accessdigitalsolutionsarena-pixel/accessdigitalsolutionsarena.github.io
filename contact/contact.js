/* ==========================================================================
   ADSA — contact/contact.js
   Page-only behaviour: topic-aware guidance (points people to the best mailbox), and
   ?topic= pre-selection from links elsewhere.  Sending/validation/anti-bot = assets/js/core.js.
   ========================================================================== */
(() => {
  'use strict';
  const A = window.ADSA; if (!A) return;
  const { $ } = A;

  const select = $('#c-topic'), hint = $('#topicHint'); if (!select || !hint) return;

  // Fixed, trusted text only — nothing from the URL is ever written into the page as HTML.
  const HINTS = {
    'General question': 'Our info mailbox also handles general questions: info@accessdigitalsolutionsaren.com',
    'Books': 'Questions about books are welcome here. Titles open in stages — see the Books page.',
    'Solutions': 'Asking about AI prompts or toolkits? The Solutions page lists what is available now.',
    'Store': 'The Store is opening in stages. Join the newsletter to hear when products arrive.',
    'Order or customer support': 'For purchase help you can also write to support@accessdigitalsolutionsaren.com or use Telegram.',
    'Sales': 'Product and business enquiries can also go to sales@accessdigitalsolutionsaren.com.',
    'Partnership': 'Tell us who you are and what you have in mind. Partnership enquiries are read personally.'
  };
  const show = () => { hint.textContent = HINTS[select.value] || ''; };
  select.addEventListener('change', show);

  // Pre-select from ?topic=  (only exact matches to existing options are accepted)
  try {
    const t = new URLSearchParams(location.search).get('topic');
    if (t) { const opt = Array.from(select.options).find(o => o.value.toLowerCase() === t.toLowerCase()); if (opt) select.value = opt.value; }
  } catch (_) { /* ignore */ }
  show();
})();
