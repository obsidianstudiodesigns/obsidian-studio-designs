/* ============================================================
   OBSIDIAN STUDIO DESIGNS — cookie consent banner
   Self-contained: injects its own DOM + styles hook.
   Records the visitor's choice in localStorage so it only
   shows once. If analytics/marketing scripts are added later,
   gate them on  window.osdConsent === 'accepted'.
   ============================================================ */
(function () {
  'use strict';

  var KEY = 'osd-cookie-consent';
  var stored = null;
  try { stored = localStorage.getItem(KEY); } catch (e) { stored = null; }
  window.osdConsent = stored;

  // Already answered — do nothing.
  if (stored === 'accepted' || stored === 'rejected') return;

  function save(choice) {
    try { localStorage.setItem(KEY, choice); } catch (e) {}
    window.osdConsent = choice;
    document.body.classList.remove('cookie-open');
    banner.classList.remove('show');
    setTimeout(function () { if (banner && banner.parentNode) banner.parentNode.removeChild(banner); }, 500);
  }

  var banner = document.createElement('div');
  banner.className = 'cookie-banner';
  banner.setAttribute('role', 'dialog');
  banner.setAttribute('aria-label', 'Cookie notice');
  banner.innerHTML =
    '<div class="cookie-inner">' +
      '<div class="cookie-text">' +
        '<strong>◆ We value your privacy</strong>' +
        '<p>We use essential cookies and local storage to make this site work and to remember your choices. ' +
        'We do not use advertising trackers. When you send us an enquiry, your details are processed only to reply to you. ' +
        'See our <a href="cookie-policy.html">Cookie Policy</a> and <a href="privacy.html">Privacy Policy</a> ' +
        '(POPIA compliant) for details.</p>' +
      '</div>' +
      '<div class="cookie-actions">' +
        '<button type="button" class="cookie-btn cookie-reject" id="osdCookieReject">Reject non-essential</button>' +
        '<button type="button" class="cookie-btn cookie-accept" id="osdCookieAccept">Accept</button>' +
      '</div>' +
    '</div>';

  function mount() {
    document.body.appendChild(banner);
    document.body.classList.add('cookie-open');
    // allow layout to settle, then animate in
    requestAnimationFrame(function () {
      requestAnimationFrame(function () { banner.classList.add('show'); });
    });
    document.getElementById('osdCookieAccept').addEventListener('click', function () { save('accepted'); });
    document.getElementById('osdCookieReject').addEventListener('click', function () { save('rejected'); });
  }

  if (document.body) mount();
  else document.addEventListener('DOMContentLoaded', mount);
})();
