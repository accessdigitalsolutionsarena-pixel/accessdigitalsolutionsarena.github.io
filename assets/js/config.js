/* ==========================================================================
   Access Digital Solutions Arena (ADSA) — assets/js/config.js
   The ONE place for site-wide settings.

   NOTE ON THE WEB3FORMS KEY: a Web3Forms "access key" is designed to be public
   (it only lets people SEND messages to your inbox; it cannot read anything).
   Real protection comes from the Web3Forms dashboard: turn on hCaptcha under
   "Block spam", and (on paid plans) restrict the key to your domain.
   ========================================================================== */
window.ADSA_CONFIG = Object.freeze({
  // LOCKED brand name. Never change. The earlier name is retired and must never appear.
  brand: 'Access Digital Solutions Arena',
  abbreviation: 'ADSA',
  domain: 'accessdigitalsolutionsaren.com',

  forms: Object.freeze({
    endpoint: 'https://api.web3forms.com/submit',
    accessKey: 'db1e0475-502c-45c6-b950-5ce2fbdfb2a3',
    fromName: 'Access Digital Solutions Arena (ADSA) website',
    captcha: true,          // loads Web3Forms' hCaptcha widget when a visitor first touches a form
    minFillMs: 3500,        // humans need a few seconds; instant submissions are bots
    cooldownMs: 60000,      // minimum gap between two sends from the same browser
    hourlyLimit: 5,         // max sends per browser per hour
    maxMessage: 2000
  })
});
