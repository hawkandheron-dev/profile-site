/**
 * auth-helpers.js
 *
 * Pure helpers shared by the auth bootstrap path. Exported as ES modules
 * for unit tests (Vitest) and also attached to window.__authHelpers so
 * the classic-script IIFE in editable-content.js can consume them.
 *
 * Loaded via <script type="module" src="auth-helpers.js"> in HTML pages
 * that include editable-content.js. Module scripts are deferred, so by
 * the time editable-content.js's DOMContentLoaded init() callback runs,
 * window.__authHelpers is guaranteed to be set.
 */

/** Derive the Clerk Frontend API URL from a publishable key.
 *  Keys are formatted as pk_test_<base64> or pk_live_<base64>; the
 *  base64 decodes to the Frontend API hostname (with a trailing $). */
export function getFrontendApi(publishableKey) {
  const raw = publishableKey.replace(/^pk_(test|live)_/, '');
  const decoded = typeof atob === 'function'
    ? atob(raw)
    : Buffer.from(raw, 'base64').toString('utf-8');
  return decoded.replace(/\$$/, '');
}

/** Resolve when window.SUPABASE_URL and window.SUPABASE_ANON_KEY are
 *  both set, or reject after timeoutMs. */
export function waitForConfig(opts) {
  const timeoutMs = (opts && typeof opts.timeoutMs === 'number') ? opts.timeoutMs : 10000;
  const intervalMs = (opts && typeof opts.intervalMs === 'number') ? opts.intervalMs : 50;
  const getGlobals = (opts && typeof opts.getGlobals === 'function')
    ? opts.getGlobals
    : () => ({ url: window.SUPABASE_URL, key: window.SUPABASE_ANON_KEY });

  return new Promise((resolve, reject) => {
    const start = Date.now();
    const check = () => {
      const { url, key } = getGlobals();
      if (url && key) return resolve();
      if (Date.now() - start > timeoutMs) {
        return reject(new Error(
          'Supabase config not loaded within ' + timeoutMs + 'ms. '
          + 'Check /api/supabase-config and SUPABASE_URL / '
          + 'SUPABASE_ANON_KEY env vars in Cloudflare Pages.'
        ));
      }
      setTimeout(check, intervalMs);
    };
    check();
  });
}

if (typeof window !== 'undefined') {
  window.__authHelpers = { getFrontendApi, waitForConfig };
}
