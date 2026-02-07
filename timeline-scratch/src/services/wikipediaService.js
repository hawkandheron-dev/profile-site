/**
 * Reference article service for Church History Timeline.
 *
 * Given a reference URL (or item name as fallback), fetches a paragraph-length
 * extract. Currently supports:
 *   - Wikipedia  (en.wikipedia.org) — REST summary API, no auth
 *   - Britannica (britannica.com)   — no free extract API; returns link only
 *
 * The service inspects the URL domain to decide how to fetch. If no URL is
 * provided, falls back to a name-based Wikipedia guess (legacy behaviour).
 *
 * Uses an in-memory cache so the same item is only fetched once per session.
 */

const cache = new Map();

/**
 * Fetch a short description for the given item.
 *
 * @param {string} itemName - Display name (used as fallback for Wikipedia guess)
 * @param {string} [referenceUrl] - Canonical article URL stored in the DB
 * @returns {Promise<{text: string, source: string, url: string} | null>}
 */
export async function fetchDescription(itemName, referenceUrl) {
  if (!itemName && !referenceUrl) return null;

  const cacheKey = referenceUrl || itemName.trim().toLowerCase();
  if (cache.has(cacheKey)) return cache.get(cacheKey);

  // Create a promise so parallel calls for the same key share one fetch
  const promise = _dispatch(itemName, referenceUrl);
  cache.set(cacheKey, promise);

  try {
    const result = await promise;
    cache.set(cacheKey, result);
    return result;
  } catch {
    cache.set(cacheKey, null);
    return null;
  }
}

// ── Dispatcher ──────────────────────────────────────────────────────────────

/**
 * Route to the appropriate fetcher based on the URL domain, or fall back to
 * a name-based Wikipedia guess when no URL is provided.
 */
async function _dispatch(itemName, referenceUrl) {
  if (referenceUrl) {
    try {
      const url = new URL(referenceUrl);
      const host = url.hostname.replace(/^www\./, '');

      if (host === 'en.wikipedia.org') {
        return _fetchWikipedia(extractWikiTitle(url));
      }

      // For domains we can't fetch an extract from, return a link-only result
      // so the UI can still show "Read more on <source>".
      const source = domainToSourceName(host);
      return { text: null, source, url: referenceUrl };
    } catch {
      // Invalid URL — fall through to name-based guess
    }
  }

  // Fallback: guess a Wikipedia title from the display name
  if (itemName) {
    const title = itemName.trim().replace(/ /g, '_');
    return _fetchWikipedia(title);
  }

  return null;
}

// ── Wikipedia fetcher ───────────────────────────────────────────────────────

async function _fetchWikipedia(title) {
  if (!title) return null;

  try {
    const res = await fetch(
      `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(title)}`,
      { headers: { 'Accept': 'application/json' } }
    );

    if (!res.ok) return null;

    const data = await res.json();

    // Wikipedia returns type "disambiguation" for ambiguous titles —
    // the extract is usually not useful in that case.
    if (data.type === 'disambiguation') return null;

    const extract = data.extract_html || data.extract;
    if (!extract || extract.length < 40) return null;

    return {
      text: data.extract_html || `<p>${data.extract}</p>`,
      source: 'Wikipedia',
      url: data.content_urls?.desktop?.page || `https://en.wikipedia.org/wiki/${encodeURIComponent(title)}`,
    };
  } catch {
    return null;
  }
}

// ── URL helpers ─────────────────────────────────────────────────────────────

/**
 * Extract the article title from a Wikipedia URL.
 *   https://en.wikipedia.org/wiki/Thomas_Aquinas → "Thomas_Aquinas"
 */
function extractWikiTitle(url) {
  // Handle /wiki/Title paths
  const match = url.pathname.match(/^\/wiki\/(.+)/);
  if (match) return decodeURIComponent(match[1]);
  return null;
}

/**
 * Map a hostname to a human-readable source name for the UI.
 */
function domainToSourceName(host) {
  const map = {
    'en.wikipedia.org': 'Wikipedia',
    'britannica.com': 'Britannica',
    'www.britannica.com': 'Britannica',
    'plato.stanford.edu': 'Stanford Encyclopedia of Philosophy',
    'iep.utm.edu': 'Internet Encyclopedia of Philosophy',
    'newadvent.org': 'Catholic Encyclopedia',
    'www.newadvent.org': 'Catholic Encyclopedia',
    'sefaria.org': 'Sefaria',
    'www.sefaria.org': 'Sefaria',
  };
  return map[host] || host;
}
