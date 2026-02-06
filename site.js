/**
 * site.js — Lightweight global behaviour for static pages.
 */

(function () {
  'use strict';

  // ── Close <details> dropdowns on outside click or item selection ─────
  document.addEventListener('click', function (e) {
    document.querySelectorAll('details[open]').forEach(function (details) {
      // If the click was outside this <details>, close it
      if (!details.contains(e.target)) {
        details.removeAttribute('open');
        return;
      }
      // If the click was on a link inside the menu, close after navigation
      if (e.target.closest('a') && details.contains(e.target.closest('a'))) {
        details.removeAttribute('open');
      }
    });
  });

  // Close on Escape key
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') {
      document.querySelectorAll('details[open]').forEach(function (details) {
        details.removeAttribute('open');
      });
    }
  });
})();
