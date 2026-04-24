/**
 * nav.js — Shared site header.
 *
 * Injects a single <header class="site-header"> at the top of every page:
 *   • Brand (logo + wordmark) linking home
 *   • Primary nav (Home, Church history, Pantheons, About)
 *   • Auth slot — a <nav class="top-nav"> that editable-content.js still
 *     targets by selector for the Sign-in / Edit Mode buttons
 *   • Hamburger toggle (mobile only) driving a slide-in drawer
 *
 * Active-page detection: reads <html data-page="..."> first, then falls back
 * to matching the current URL against the link table.
 *
 * Runs on DOMContentLoaded. Must execute before editable-content.js performs
 * its .top-nav injection, but both are DOM-ready handlers so ordering is
 * fine as long as the <script> tag for nav.js comes first in the document.
 */
(function () {
  'use strict';

  // Primary sections that appear on the shared top nav. Mirrors the home
  // page button stack (see index.html .landing-nav), minus the admin-only
  // entries. Matching against `activeKey` highlights the current section.
  var LINKS = [
    { key: 'home',            href: 'index.html',                           label: 'Home' },
    { key: 'church-history',  href: 'apps/church-history-timeline.html',    label: 'Church history' },
    { key: 'timeline',        href: 'apps/index.html',                      label: 'Timeline' },
    { key: 'pantheons',       href: 'pantheons-supabase.html',              label: 'Pantheons' },
    { key: 'biblical-atlas',  href: 'apps/biblical-places.html',            label: 'Biblical atlas' },
    { key: 'about',           href: 'about.html',                           label: 'About' }
  ];

  function currentKey() {
    var page = document.documentElement.dataset.page || document.body.dataset.page;
    if (page) return page;
    // Some hosts (e.g. `serve`) strip the .html extension from URLs, so
    // compare both with and without it.
    var file = (location.pathname.split('/').pop() || '').toLowerCase();
    if (!file) file = 'index.html';
    var fileHtml = /\.html$/.test(file) ? file : file + '.html';
    for (var i = 0; i < LINKS.length; i++) {
      var href = LINKS[i].href.toLowerCase();
      if (href === file || href === fileHtml) return LINKS[i].key;
    }
    return null;
  }

  function el(tag, attrs, children) {
    var node = document.createElement(tag);
    if (attrs) {
      for (var k in attrs) {
        if (!Object.prototype.hasOwnProperty.call(attrs, k)) continue;
        var v = attrs[k];
        if (v == null || v === false) continue;
        if (k === 'class') node.className = v;
        else if (k === 'text') node.textContent = v;
        else node.setAttribute(k, v === true ? '' : v);
      }
    }
    if (children) {
      for (var j = 0; j < children.length; j++) {
        var c = children[j];
        if (c) node.appendChild(c);
      }
    }
    return node;
  }

  function buildNavList(activeKey, idSuffix) {
    var ul = el('ul', { class: 'site-header-nav-list', id: 'site-nav-list-' + idSuffix });
    LINKS.forEach(function (link) {
      var a = el('a', { href: link.href, 'data-nav-key': link.key, text: link.label });
      if (link.key === activeKey) a.setAttribute('aria-current', 'page');
      ul.appendChild(el('li', null, [a]));
    });
    return ul;
  }

  function buildHeader(activeKey, authSlot) {
    var brandImg = el('img', {
      src: 'resources/logos/Windhover_BLK.png',
      alt: '', width: '32', height: '32', class: 'site-header-brand-logo'
    });
    var brand = el('a', { class: 'site-header-brand', href: 'index.html', 'aria-label': 'Windhover home' }, [
      brandImg,
      el('span', { class: 'site-header-brand-name', text: 'Windhover' })
    ]);

    var nav = el('nav', { class: 'site-header-nav', 'aria-label': 'Primary' }, [
      buildNavList(activeKey, 'desktop')
    ]);

    // Auth slot — keep the .top-nav class so editable-content.js (which
    // injects the Sign-in / Edit Mode buttons via document.querySelector
    // ('.top-nav')) continues to work without change.
    authSlot.classList.add('site-header-auth');
    if (!authSlot.getAttribute('aria-label')) {
      authSlot.setAttribute('aria-label', 'Account');
    }

    var toggle = el('button', {
      type: 'button',
      class: 'site-header-toggle',
      'aria-expanded': 'false',
      'aria-controls': 'site-nav-drawer',
      'aria-label': 'Open menu'
    }, [
      el('span', { class: 'site-header-toggle-bars', 'aria-hidden': 'true' })
    ]);

    return el('header', { class: 'site-header', role: 'banner' }, [
      brand, nav, authSlot, toggle
    ]);
  }

  function buildDrawer(activeKey) {
    var drawer = el('div', { id: 'site-nav-drawer', class: 'site-nav-drawer', hidden: true }, [
      el('nav', { class: 'site-nav-drawer-nav', 'aria-label': 'Primary (mobile)' }, [
        buildNavList(activeKey, 'drawer')
      ])
    ]);
    return drawer;
  }

  function wireDrawer(toggle, drawer) {
    function setOpen(open) {
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
      toggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
      if (open) {
        drawer.removeAttribute('hidden');
        // Delay the class flip to the next frame so the CSS transition runs.
        requestAnimationFrame(function () { drawer.classList.add('is-open'); });
        document.documentElement.classList.add('nav-drawer-open');
      } else {
        drawer.classList.remove('is-open');
        document.documentElement.classList.remove('nav-drawer-open');
        // Hide after the transition completes so screen readers skip it.
        setTimeout(function () {
          if (toggle.getAttribute('aria-expanded') === 'false') {
            drawer.setAttribute('hidden', '');
          }
        }, 280);
      }
    }

    toggle.addEventListener('click', function () {
      var isOpen = toggle.getAttribute('aria-expanded') === 'true';
      setOpen(!isOpen);
    });

    // Close when a link inside the drawer is clicked (navigation is fine,
    // but clear the visual state in case a link is to an in-page anchor).
    drawer.addEventListener('click', function (e) {
      if (e.target.closest('a')) setOpen(false);
    });

    // Close on Escape.
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && toggle.getAttribute('aria-expanded') === 'true') {
        setOpen(false);
        toggle.focus();
      }
    });

    // Close on outside click.
    document.addEventListener('click', function (e) {
      if (toggle.getAttribute('aria-expanded') !== 'true') return;
      if (drawer.contains(e.target) || toggle.contains(e.target)) return;
      setOpen(false);
    });
  }

  function init() {
    if (document.querySelector('.site-header')) return;

    var activeKey = currentKey();

    // Re-use an existing <nav class="top-nav"> (e.g. the empty one in
    // index.html line 45, or the Home/Sign-in one in about.html) as the
    // auth slot so any pre-rendered children (sign-in button) carry over.
    var authSlot = document.querySelector('nav.top-nav');
    if (authSlot) {
      // Strip any pre-rendered Home / primary-nav links — the shared nav
      // now owns that. Keep buttons (e.g. #ec-sign-in-btn in about.html).
      var stale = authSlot.querySelectorAll('a');
      for (var i = 0; i < stale.length; i++) stale[i].parentNode.removeChild(stale[i]);
      if (authSlot.parentNode) authSlot.parentNode.removeChild(authSlot);
    } else {
      authSlot = el('nav', { class: 'top-nav', 'aria-label': 'Account' });
    }

    var header = buildHeader(activeKey, authSlot);
    var drawer = buildDrawer(activeKey);

    document.body.insertBefore(drawer, document.body.firstChild);
    document.body.insertBefore(header, document.body.firstChild);

    wireDrawer(header.querySelector('.site-header-toggle'), drawer);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
