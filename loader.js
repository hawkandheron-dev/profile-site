/**
 * loader.js — Two-state page loader lifecycle.
 *
 * State 1 (Loading): shimmer bar + "Loading" sub-text, aria-busy=true.
 * State 2 (Ready):   Enter button fades in, shimmer bar fades out.
 *                    User dismisses by clicking the Enter button, pressing
 *                    Enter/Space (button is autofocused), or clicking
 *                    anywhere on the overlay.
 *
 * Transitions to Ready when Promise.all(window.load, document.fonts.ready)
 * resolves — or after a 5s hard cap so a stalled resource can't trap the
 * user in the Loading state forever.
 *
 * Opt a page in by including a <div id="page-loader" class="page-loader">.
 */
(function () {
  'use strict';

  var HARD_TIMEOUT_MS = 5000;
  var SEEN_KEY = 'windhover.loaderSeen';

  function hasSeen() {
    try { return sessionStorage.getItem(SEEN_KEY) === '1'; }
    catch (_) { return false; }
  }

  function markSeen() {
    try { sessionStorage.setItem(SEEN_KEY, '1'); }
    catch (_) {}
  }

  function prefersReducedMotion() {
    return !!(window.matchMedia &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  }

  function waitForWindowLoad() {
    return new Promise(function (resolve) {
      if (document.readyState === 'complete') return resolve();
      window.addEventListener('load', function () { resolve(); }, { once: true });
    });
  }

  function waitForFonts() {
    if (!document.fonts || !document.fonts.ready) return Promise.resolve();
    return document.fonts.ready.catch(function () {});
  }

  function waitMs(ms) {
    return new Promise(function (resolve) { setTimeout(resolve, ms); });
  }

  function start() {
    var loader = document.getElementById('page-loader');
    if (!loader) return;

    // Returning visitor within the same session: skip the overlay entirely.
    if (hasSeen()) {
      loader.setAttribute('hidden', '');
      loader.setAttribute('aria-hidden', 'true');
      return;
    }

    document.documentElement.style.overflow = 'hidden';

    var enterBtn = loader.querySelector('.page-loader-enter');
    var dismissed = false;
    var ready = false;

    function dismiss() {
      if (dismissed) return;
      dismissed = true;
      markSeen();

      loader.classList.add('is-leaving');
      loader.setAttribute('aria-hidden', 'true');

      var transitionMs = prefersReducedMotion() ? 320 : 720;
      setTimeout(function () {
        loader.setAttribute('hidden', '');
        document.documentElement.style.overflow = '';
      }, transitionMs);
    }

    function markReady() {
      if (ready) return;
      ready = true;
      loader.classList.add('is-ready');
      loader.setAttribute('aria-busy', 'false');
      loader.removeAttribute('role'); // was progressbar; no longer accurate
      if (enterBtn) {
        requestAnimationFrame(function () {
          try { enterBtn.focus({ preventScroll: true }); }
          catch (_) { enterBtn.focus(); }
        });
      }
    }

    if (enterBtn) {
      enterBtn.addEventListener('click', function (e) {
        e.stopPropagation();
        dismiss();
      });
    }

    // Secondary affordance: click anywhere on the overlay once it's ready.
    loader.addEventListener('click', function () {
      if (ready) dismiss();
    });

    var readyP = Promise.all([waitForWindowLoad(), waitForFonts()]);
    var hardCap = waitMs(HARD_TIMEOUT_MS);
    Promise.race([readyP, hardCap]).then(markReady);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', start);
  } else {
    start();
  }
})();
