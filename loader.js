/**
 * loader.js — Page loader lifecycle.
 *
 * Holds the overlay up until fonts, images, and window.load are ready.
 * Enforces a 1s minimum so the user registers the loader, and a 5s hard
 * cap so a stalled resource can never trap the page.
 *
 * Opt a page in by including a <div id="page-loader" class="page-loader">.
 * Loaded via <script defer> in <head>.
 */
(function () {
  'use strict';

  var MIN_VISIBLE_MS = 1000;
  var HARD_TIMEOUT_MS = 5000;

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

    document.documentElement.style.overflow = 'hidden';

    var reduced = prefersReducedMotion();
    var minVisible = reduced ? 0 : MIN_VISIBLE_MS;

    var ready = Promise.all([waitForWindowLoad(), waitForFonts()]);
    var minTimer = waitMs(minVisible);
    var hardCap = waitMs(HARD_TIMEOUT_MS);

    Promise.race([
      Promise.all([ready, minTimer]),
      hardCap
    ]).then(function () { dismiss(loader); });
  }

  var dismissed = false;
  function dismiss(loader) {
    if (dismissed) return;
    dismissed = true;

    loader.classList.add('is-leaving');
    loader.setAttribute('aria-hidden', 'true');
    loader.setAttribute('aria-busy', 'false');

    var reduced = prefersReducedMotion();
    var transitionMs = reduced ? 320 : 720;

    setTimeout(function () {
      loader.setAttribute('hidden', '');
      document.documentElement.style.overflow = '';
    }, transitionMs);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', start);
  } else {
    start();
  }
})();
