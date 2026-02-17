/**
 * Bible verse text service for the Biblical Places Atlas.
 *
 * Fetches verse text from the NET Bible API (labs.bible.org) given a
 * scripture reference string.  Uses an in-memory cache so each reference
 * is only fetched once per session.
 *
 * The API is accessed via JSONP (script-tag injection) because the
 * endpoint does not guarantee CORS headers.
 *
 * Pattern mirrors wikipediaService.js — store the reference in the DB,
 * fetch the verified text at display time.
 */

const cache = new Map();

// ── Public API ──────────────────────────────────────────────────────────────

/**
 * Fetch the verse text for a given scripture reference.
 *
 * @param {string} reference - e.g. "Genesis 12:1-3", "John 3:16"
 * @returns {Promise<{ text: string, reference: string } | null>}
 */
export async function fetchVerseText(reference) {
  if (!reference) return null;

  const ref = reference.trim();
  if (!ref) return null;

  if (cache.has(ref)) return cache.get(ref);

  // Store the promise so parallel callers share one fetch
  const promise = _fetchFromApi(ref);
  cache.set(ref, promise);

  try {
    const result = await promise;
    cache.set(ref, result);
    return result;
  } catch {
    cache.set(ref, null);
    return null;
  }
}

/**
 * Extract a bare scripture reference from a `scripture_verse` field value.
 *
 * The field can contain either:
 *   - A bare reference: "Genesis 2:8"
 *   - Full text with citation: '"Terah took…" — Genesis 11:31 (NET)'
 *
 * Returns just the reference portion in both cases.
 */
export function extractReference(scriptureVerse) {
  if (!scriptureVerse) return null;

  const s = scriptureVerse.trim();
  if (!s) return null;

  // Full-text format: text followed by " — Reference (NET)" or " — Reference (translation)"
  const emDashIdx = s.lastIndexOf('\u2014');    // —
  if (emDashIdx !== -1) {
    let afterDash = s.slice(emDashIdx + 1).trim();
    // Strip trailing translation marker like "(NET)"
    afterDash = afterDash.replace(/\s*\([A-Z]+\)\s*$/, '').trim();
    if (afterDash) return afterDash;
  }

  // Also try plain dash " - "
  const dashIdx = s.lastIndexOf(' - ');
  if (dashIdx !== -1 && dashIdx > s.length / 2) {
    let afterDash = s.slice(dashIdx + 3).trim();
    afterDash = afterDash.replace(/\s*\([A-Z]+\)\s*$/, '').trim();
    if (afterDash) return afterDash;
  }

  // If it looks like a bare reference already (starts with a book name,
  // reasonably short), return as-is
  if (looksLikeReference(s)) return s;

  return null;
}

// ── Internal helpers ────────────────────────────────────────────────────────

/**
 * Heuristic: does a string look like a bare scripture reference?
 * e.g. "Genesis 12:1-3", "1 Samuel 17", "Judges 4-5"
 */
function looksLikeReference(s) {
  // Most references are under 80 chars and start with a letter or digit
  if (s.length > 100) return false;
  // Must not start with a quote character
  if (/^["'\u201C\u201D\u2018\u2019]/.test(s)) return false;
  // Should match a pattern like "BookName Chapter:Verse" or "BookName Chapter"
  return /^(\d\s+)?[A-Z]/i.test(s);
}

let _jsonpCounter = 0;

/**
 * Fetch verse text from the NET Bible API via JSONP.
 *
 * Tries a regular fetch() first (in case CORS headers are present),
 * then falls back to JSONP if that fails.
 */
async function _fetchFromApi(passage) {
  // Some references use semicolons for multiple passages ("Joshua 15:16-17; Judges 1:12-13").
  // The NET Bible API may not handle semicolons well — take only the first passage.
  const cleanPassage = passage.split(';')[0].split(',')[0].trim();
  if (!cleanPassage) return null;

  const encoded = encodeURIComponent(cleanPassage);

  // Try regular fetch first
  try {
    const res = await fetch(
      `https://labs.bible.org/api/?passage=${encoded}&type=json&formatting=plain`,
      { headers: { Accept: 'application/json' } }
    );
    if (res.ok) {
      const data = await res.json();
      return _parseResponse(data, passage);
    }
  } catch {
    // CORS or network error — fall through to JSONP
  }

  // Fallback: JSONP
  return _fetchJsonp(encoded, passage);
}

/**
 * JSONP fallback for browsers where CORS is blocked.
 */
function _fetchJsonp(encodedPassage, originalRef) {
  return new Promise((resolve) => {
    const cbName = `_netBibleCb_${++_jsonpCounter}_${Date.now()}`;
    const script = document.createElement('script');

    const cleanup = () => {
      delete window[cbName];
      if (script.parentNode) script.parentNode.removeChild(script);
    };

    window[cbName] = (data) => {
      cleanup();
      resolve(_parseResponse(data, originalRef));
    };

    script.onerror = () => {
      cleanup();
      resolve(null);
    };

    // Timeout after 8 seconds
    setTimeout(() => {
      if (window[cbName]) {
        cleanup();
        resolve(null);
      }
    }, 8000);

    script.src = `https://labs.bible.org/api/?passage=${encodedPassage}&type=json&formatting=plain&callback=${cbName}`;
    document.head.appendChild(script);
  });
}

/**
 * Parse the NET Bible API JSON response into our standard format.
 *
 * Response is an array of verse objects:
 *   [{ bookname: "Genesis", chapter: "12", verse: "1", text: "..." }, ...]
 */
function _parseResponse(data, originalRef) {
  if (!Array.isArray(data) || data.length === 0) return null;

  const combinedText = data
    .map(v => (v.text || '').trim())
    .filter(Boolean)
    .join(' ');

  if (!combinedText) return null;

  return {
    text: combinedText,
    reference: originalRef,
  };
}
