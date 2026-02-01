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
        // Extract metadata keywords from Categories
        const cats = meta.Categories?.value || '';
        const kwParts = cats.split('|').map(s => s.trim()).filter(Boolean);
        return {
          id: `wiki-${p.pageid}`,
          title: title || keyword,
          thumbnailUrl: info.thumburl || info.url,
          sourceUrl: info.descriptionurl || `https://commons.wikimedia.org/wiki/${encodeURIComponent(p.title)}`,
          source: 'wikimedia',
          attribution: meta.Artist?.value
            ? stripHtml(meta.Artist.value)
            : 'Wikimedia Commons',
          keywords: kwParts.slice(0, 30).join(', ')
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
      .map(o => {
        // Extract metadata keywords from tags, culture, period, classification, medium
        const kwParts = [
          ...(o.tags || []).map(t => t.term),
          o.culture, o.period, o.dynasty, o.classification, o.medium, o.department
        ].filter(Boolean);
        return {
          id: `met-${o.objectID}`,
          title: o.title || keyword,
          thumbnailUrl: o.primaryImageSmall,
          sourceUrl: o.objectURL || `https://www.metmuseum.org/art/collection/search/${o.objectID}`,
          source: 'met',
          attribution: o.artistDisplayName
            ? `${o.artistDisplayName} — The Met`
            : 'The Metropolitan Museum of Art',
          keywords: kwParts.slice(0, 30).join(', ')
        };
      });
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
      .map(item => {
        // Extract metadata keywords from dcSubject, dcType, dcCreator
        const kwParts = [
          ...(item.dcSubject || []),
          ...(item.dcType || []),
          ...(item.dcCreator || [])
        ].filter(Boolean);
        return {
          id: `euro-${item.id}`,
          title: (item.title?.[0] || keyword).slice(0, 120),
          thumbnailUrl: item.edmPreview[0],
          sourceUrl: item.guid || `https://www.europeana.eu/item${item.id}`,
          source: 'europeana',
          attribution: item.dataProvider?.[0] || 'Europeana',
          keywords: kwParts.slice(0, 30).join(', ')
        };
      });
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
        // Extract metadata keywords from subject headings and typeOfResource
        const kwParts = [
          ...(Array.isArray(item.subject) ? item.subject : item.subject ? [item.subject] : []),
          ...(Array.isArray(item.typeOfResource) ? item.typeOfResource : item.typeOfResource ? [item.typeOfResource] : [])
        ].filter(Boolean);
        return {
          id: `nypl-${item.uuid}`,
          title: (item.title || keyword).slice(0, 120),
          thumbnailUrl: `https://images.nypl.org/index.php?id=${imageId}&t=w`,
          sourceUrl: item.apiItemURL
            ? `https://digitalcollections.nypl.org/items/${item.uuid}`
            : 'https://digitalcollections.nypl.org/',
          source: 'nypl',
          attribution: 'NYPL Digital Collections',
          keywords: kwParts.slice(0, 30).join(', ')
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
        const freetext = row.content?.freetext || {};
        const indexed = row.content?.indexedStructured || {};
        const media = desc.online_media.media[0];
        const title = row.title || desc.title?.content || keyword;
        // Extract metadata keywords from freetext topics/names and indexed topics
        const kwParts = [
          ...(freetext.topic || []).map(t => t.content),
          ...(freetext.name || []).map(t => t.content),
          ...(indexed.topic || []),
          ...(indexed.culture || []),
          ...(indexed.place || [])
        ].filter(Boolean);
        return {
          id: `si-${row.id}`,
          title: typeof title === 'string' ? title.slice(0, 120) : keyword,
          thumbnailUrl: media.thumbnail || media.content,
          sourceUrl: desc.record_link || desc.guid || 'https://www.si.edu/search',
          source: 'smithsonian',
          attribution: desc.data_source || 'Smithsonian Institution',
          keywords: kwParts.slice(0, 30).join(', ')
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
// Content filter — exclude results inappropriate for younger audiences
// ---------------------------------------------------------------------------
const BLOCKED_TITLE_PATTERNS = /\b(nude|naked|erotic|erotica|risqu[eé]|sensual|boudoir|harem\s+scene|courtesan|concubine|seduction|lovemaking|coitus|copulat|orgy|phall|priap|brothel|bathing\s+nymph|rape\s+of|abduction\s+of\s+(?:the\s+)?sabine|leda\s+and\s+the\s+swan|odalisque|bacchana)\b/i;

function isAppropriateForYoungerAudiences(img) {
  const title = img.title || '';
  const attribution = img.attribution || '';
  const combined = `${title} ${attribution}`;
  return !BLOCKED_TITLE_PATTERNS.test(combined);
}

// ---------------------------------------------------------------------------
// Standard keyword suffixes appended to every era for variety.
// Combined with the era's base name to produce searches like
// "Ancient Egypt reconstruction", "Roman Empire architecture", etc.
// ---------------------------------------------------------------------------
const STANDARD_SUFFIXES = [
  'reconstruction',
  'illustration',
  'art',
  'architecture',
  'artifact',
  'sculpture',
  'painting',
  'map',
  'daily life',
  'landscape'
];

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Fetch a unified set of images for a given array of keywords.
 * Picks a subset of keywords (including some generated from standard
 * suffixes), queries all APIs in parallel, filters for age-appropriate
 * content, deduplicates, shuffles, and returns a combined feed.
 *
 * @param {string[]} keywords   - era-specific search terms
 * @param {object}   opts
 * @param {number}   opts.keywordsToUse  - how many keywords to query (default 5)
 * @param {number}   opts.perSource      - results per source per keyword (default 4)
 * @param {string}   opts.eraName        - era display name for building standard queries
 * @param {string[]} opts.priorityKeywords - keywords from favorites to weight higher
 * @returns {Promise<Array>} array of image result objects
 */
export async function fetchImagesForKeywords(keywords, opts = {}) {
  const { keywordsToUse = 5, perSource = 4, eraName, priorityKeywords = [] } = opts;

  // Build the full keyword pool: era-specific + standard suffix combos
  let pool = [...keywords];
  if (eraName) {
    const standardKeywords = STANDARD_SUFFIXES.map(s => `${eraName} ${s}`);
    pool = [...pool, ...standardKeywords];
  }

  // When we have priority keywords from favorites, allocate most slots to them
  let selected;
  if (priorityKeywords.length > 0) {
    const prioritySlots = Math.min(Math.ceil(keywordsToUse * 0.6), priorityKeywords.length);
    const regularSlots = keywordsToUse - prioritySlots;
    selected = [
      ...shuffle(priorityKeywords).slice(0, prioritySlots),
      ...shuffle(pool).slice(0, regularSlots)
    ];
  } else {
    // Pick a random subset so each load feels fresh
    selected = shuffle(pool).slice(0, keywordsToUse);
  }

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

  // Filter out inappropriate content
  const safe = flat.filter(isAppropriateForYoungerAudiences);

  // Deduplicate by thumbnail URL (different APIs may link same image)
  const seen = new Set();
  const unique = safe.filter(img => {
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
