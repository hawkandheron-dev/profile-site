/**
 * Wikipedia description service for Church History Timeline.
 *
 * Fetches a paragraph-length extract from the Wikipedia REST API
 * (no API key required). Falls back gracefully if the article
 * doesn't exist or the network request fails.
 *
 * Uses an in-memory cache so the same item is only fetched once per session.
 */

const cache = new Map();

/**
 * Fetch a short description for the given item name.
 * Returns { text, source, url } or null if nothing useful was found.
 */
export async function fetchDescription(itemName) {
  if (!itemName) return null;

  const cacheKey = itemName.trim().toLowerCase();
  if (cache.has(cacheKey)) return cache.get(cacheKey);

  // Create a promise so parallel calls for the same name share one fetch
  const promise = _doFetch(itemName);
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

// ── Internal ────────────────────────────────────────────────────────────────

async function _doFetch(itemName) {
  // Normalise the name into a Wikipedia-friendly title
  const title = toWikiTitle(itemName);

  try {
    const res = await fetch(
      `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(title)}`,
      {
        headers: { 'Accept': 'application/json' },
      }
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

/**
 * Convert a display name to a plausible Wikipedia article title.
 * Examples:
 *   "Paul of Tarsus"  → "Paul_the_Apostle"  (not handled — just spaces → underscores)
 *   "Council of Nicaea" → "Council_of_Nicaea"
 */
function toWikiTitle(name) {
  return name.trim().replace(/ /g, '_');
}
