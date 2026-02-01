/**
 * Unified Image API Service
 *
 * Fetches images from multiple public museum/archive APIs and returns
 * them in a common format for the Vision Board.
 *
 * Sources:
 *   - Wikimedia Commons (no key)
 *   - Metropolitan Museum of Art (no key)
 *   - Europeana (key required)
 *   - NYPL Digital Collections (token required)
 *   - Smithsonian Open Access (key required)
 */

const API_KEYS = {
  europeana: 'gundranicnit',
  nypl: 'ibkrfk0w1tltqba0',
  smithsonian: 'iFOAFBXuQbz6G82rlZxdkWcA9srIVvrnVjcy9zDl'
};

// ---------------------------------------------------------------------------
// Common image result shape
// ---------------------------------------------------------------------------
// {
//   id:           string   – unique across all sources
//   title:        string   – display title
//   thumbnailUrl: string   – preview image URL
//   sourceUrl:    string   – link to the original item page
//   source:       string   – 'wikimedia' | 'europeana' | 'nypl' | 'smithsonian' | 'met'
//   attribution:  string   – credit line
// }

// ---------------------------------------------------------------------------
// Wikimedia Commons
// ---------------------------------------------------------------------------
async function fetchWikimediaImages(keyword, limit = 8) {
  const url = 'https://commons.wikimedia.org/w/api.php?' + new URLSearchParams({
    action: 'query',
    generator: 'search',
    gsrnamespace: '6',           // File namespace
    gsrsearch: keyword,
    gsrlimit: String(limit),
    prop: 'imageinfo',
    iiprop: 'url|extmetadata|mime',
    iiurlwidth: '400',           // request a 400px-wide thumbnail
    format: 'json',
    origin: '*'
  });

  try {
    const res = await fetch(url);
    if (!res.ok) return [];
    const json = await res.json();

    const pages = json.query?.pages;
    if (!pages) return [];

    return Object.values(pages)
      .filter(p => {
        const info = p.imageinfo?.[0];
        if (!info) return false;
        // Only keep actual images
        const mime = info.mime || '';
        return mime.startsWith('image/') && !mime.includes('svg');
      })
      .map(p => {
        const info = p.imageinfo[0];
        const meta = info.extmetadata || {};
        const title = (meta.ObjectName?.value || p.title || '').replace(/^File:/, '').replace(/\.\w+$/, '');
        return {
          id: `wiki-${p.pageid}`,
          title: title || keyword,
          thumbnailUrl: info.thumburl || info.url,
          sourceUrl: info.descriptionurl || `https://commons.wikimedia.org/wiki/${encodeURIComponent(p.title)}`,
          source: 'wikimedia',
          attribution: meta.Artist?.value
            ? stripHtml(meta.Artist.value)
            : 'Wikimedia Commons'
        };
      });
  } catch (e) {
    console.warn('Wikimedia fetch failed for:', keyword, e);
    return [];
  }
}

// ---------------------------------------------------------------------------
// Metropolitan Museum of Art
// ---------------------------------------------------------------------------
async function fetchMetImages(keyword, limit = 6) {
  try {
    const searchUrl = `https://collectionapi.metmuseum.org/public/collection/v1/search?hasImages=true&q=${encodeURIComponent(keyword)}`;
    const searchRes = await fetch(searchUrl);
    if (!searchRes.ok) return [];
    const searchJson = await searchRes.json();

    const ids = (searchJson.objectIDs || []).slice(0, limit);
    if (ids.length === 0) return [];

    const objects = await Promise.all(
      ids.map(async id => {
        try {
          const r = await fetch(`https://collectionapi.metmuseum.org/public/collection/v1/objects/${id}`);
          if (!r.ok) return null;
          return r.json();
        } catch { return null; }
      })
    );

    return objects
      .filter(o => o && o.primaryImageSmall)
      .map(o => ({
        id: `met-${o.objectID}`,
        title: o.title || keyword,
        thumbnailUrl: o.primaryImageSmall,
        sourceUrl: o.objectURL || `https://www.metmuseum.org/art/collection/search/${o.objectID}`,
        source: 'met',
        attribution: o.artistDisplayName
          ? `${o.artistDisplayName} — The Met`
          : 'The Metropolitan Museum of Art'
      }));
  } catch (e) {
    console.warn('Met Museum fetch failed for:', keyword, e);
    return [];
  }
}

// ---------------------------------------------------------------------------
// Europeana
// ---------------------------------------------------------------------------
async function fetchEuropeanaImages(keyword, limit = 8) {
  const url = 'https://api.europeana.eu/record/v2/search.json?' + new URLSearchParams({
    query: keyword,
    media: 'true',
    thumbnail: 'true',
    rows: String(limit),
    'qf': 'TYPE:IMAGE',
    wskey: API_KEYS.europeana
  });

  try {
    const res = await fetch(url);
    if (!res.ok) return [];
    const json = await res.json();

    return (json.items || [])
      .filter(item => item.edmPreview?.[0])
      .map(item => ({
        id: `euro-${item.id}`,
        title: (item.title?.[0] || keyword).slice(0, 120),
        thumbnailUrl: item.edmPreview[0],
        sourceUrl: item.guid || `https://www.europeana.eu/item${item.id}`,
        source: 'europeana',
        attribution: item.dataProvider?.[0] || 'Europeana'
      }));
  } catch (e) {
    console.warn('Europeana fetch failed for:', keyword, e);
    return [];
  }
}

// ---------------------------------------------------------------------------
// NYPL Digital Collections
// ---------------------------------------------------------------------------
async function fetchNyplImages(keyword, limit = 6) {
  const url = `https://api.repo.nypl.org/api/v2/items/search?q=${encodeURIComponent(keyword)}&per_page=${limit}&page=1`;

  try {
    const res = await fetch(url, {
      headers: {
        'Authorization': `Token token=${API_KEYS.nypl}`
      }
    });
    if (!res.ok) return [];
    const json = await res.json();

    const results = json.nyplAPI?.response?.result || [];

    return results
      .filter(item => item.imageID)
      .map(item => {
        const imageId = item.imageID;
        return {
          id: `nypl-${item.uuid}`,
          title: (item.title || keyword).slice(0, 120),
          thumbnailUrl: `https://images.nypl.org/index.php?id=${imageId}&t=w`,
          sourceUrl: item.apiItemURL
            ? `https://digitalcollections.nypl.org/items/${item.uuid}`
            : 'https://digitalcollections.nypl.org/',
          source: 'nypl',
          attribution: 'NYPL Digital Collections'
        };
      });
  } catch (e) {
    console.warn('NYPL fetch failed for:', keyword, e);
    return [];
  }
}

// ---------------------------------------------------------------------------
// Smithsonian Open Access
// ---------------------------------------------------------------------------
async function fetchSmithsonianImages(keyword, limit = 8) {
  const url = 'https://api.si.edu/openaccess/api/v1.0/search?' + new URLSearchParams({
    q: `${keyword} AND online_media_type:Images`,
    rows: String(limit),
    api_key: API_KEYS.smithsonian
  });

  try {
    const res = await fetch(url);
    if (!res.ok) return [];
    const json = await res.json();

    const rows = json.response?.rows || [];

    return rows
      .filter(row => {
        const media = row.content?.descriptiveNonRepeating?.online_media?.media;
        return media && media.length > 0 && media[0].thumbnail;
      })
      .map(row => {
        const desc = row.content?.descriptiveNonRepeating || {};
        const media = desc.online_media.media[0];
        const title = row.title || desc.title?.content || keyword;
        return {
          id: `si-${row.id}`,
          title: typeof title === 'string' ? title.slice(0, 120) : keyword,
          thumbnailUrl: media.thumbnail || media.content,
          sourceUrl: desc.record_link || desc.guid || 'https://www.si.edu/search',
          source: 'smithsonian',
          attribution: desc.data_source || 'Smithsonian Institution'
        };
      });
  } catch (e) {
    console.warn('Smithsonian fetch failed for:', keyword, e);
    return [];
  }
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function stripHtml(html) {
  const tmp = document.createElement('div');
  tmp.innerHTML = html;
  return tmp.textContent || tmp.innerText || '';
}

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Fetch a unified set of images for a given array of keywords.
 * Picks a subset of keywords, queries all APIs in parallel,
 * deduplicates, shuffles, and returns a combined feed.
 *
 * @param {string[]} keywords - search terms for this era
 * @param {object}   opts
 * @param {number}   opts.keywordsToUse  - how many keywords to query (default 5)
 * @param {number}   opts.perSource      - results per source per keyword (default 4)
 * @returns {Promise<Array>} array of image result objects
 */
export async function fetchImagesForKeywords(keywords, opts = {}) {
  const { keywordsToUse = 5, perSource = 4 } = opts;

  // Pick a random subset of keywords so each load feels fresh
  const selected = shuffle(keywords).slice(0, keywordsToUse);

  // For each keyword, query all five APIs in parallel
  const allPromises = selected.flatMap(kw => [
    fetchWikimediaImages(kw, perSource),
    fetchMetImages(kw, Math.min(perSource, 3)),   // Met is slower, limit more
    fetchEuropeanaImages(kw, perSource),
    fetchNyplImages(kw, Math.min(perSource, 3)),
    fetchSmithsonianImages(kw, perSource)
  ]);

  const results = await Promise.all(allPromises);

  // Flatten
  const flat = results.flat();

  // Deduplicate by thumbnail URL (different APIs may link same image)
  const seen = new Set();
  const unique = flat.filter(img => {
    if (!img.thumbnailUrl || seen.has(img.thumbnailUrl)) return false;
    seen.add(img.thumbnailUrl);
    return true;
  });

  // Shuffle for a mixed feed
  return shuffle(unique);
}

/**
 * Convenience: fetch vision board images for an era by its ID.
 */
export async function fetchImagesForEra(eraId, keywords) {
  return fetchImagesForKeywords(keywords);
}

/**
 * Source display names for attribution badges
 */
export const SOURCE_LABELS = {
  wikimedia: 'Wikimedia',
  met: 'The Met',
  europeana: 'Europeana',
  nypl: 'NYPL',
  smithsonian: 'Smithsonian'
};

/**
 * Source colors for visual distinction
 */
export const SOURCE_COLORS = {
  wikimedia: '#069',
  met: '#e4002b',
  europeana: '#0a72cc',
  nypl: '#d0021b',
  smithsonian: '#00589e'
};
