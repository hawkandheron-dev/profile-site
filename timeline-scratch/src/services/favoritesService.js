/**
 * Favorites Service — Supabase CRUD for era image favorites.
 *
 * Stores favorited images per era in the `era_favorites` table.
 * Reuses the same Supabase config pattern as churchHistorySupabaseAdapter.
 */
import { createClient } from '@supabase/supabase-js';

// ── Supabase client (singleton) ─────────────────────────────────────────

let supabaseClient = null;

async function getSupabase() {
  if (supabaseClient) return supabaseClient;

  // Try fetching config from Cloudflare Pages Function first,
  // then fall back to a local config script.
  try {
    const res = await fetch('/api/supabase-config');
    if (res.ok) {
      const script = await res.text();
      const fn = new Function(script);
      fn();
    }
  } catch {
    try {
      const res = await fetch('/supabase-config.js');
      if (res.ok) {
        const script = await res.text();
        const fn = new Function(script);
        fn();
      }
    } catch {
      // ignore
    }
  }

  const url = window.SUPABASE_URL || '';
  const key = window.SUPABASE_ANON_KEY || '';

  if (!url || !key) {
    throw new Error('Supabase configuration not found. Check /api/supabase-config or supabase-config.js');
  }

  supabaseClient = createClient(url, key);
  return supabaseClient;
}

// ── Public API ──────────────────────────────────────────────────────────

/**
 * Fetch all favorites for a given era, ordered by most recent first.
 * Returns image objects in the same shape as imageApiService results
 * plus an `isFavorite: true` flag.
 */
export async function getFavoritesForEra(eraId) {
  const supabase = await getSupabase();

  const { data, error } = await supabase
    .from('era_favorites')
    .select('*')
    .eq('era_id', eraId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Failed to fetch favorites:', error);
    return [];
  }

  return (data || []).map(row => ({
    id: row.image_id,
    title: row.image_title,
    thumbnailUrl: row.thumbnail_url,
    sourceUrl: row.source_url,
    source: row.image_source,
    attribution: row.attribution,
    keywords: row.keywords,
    isFavorite: true
  }));
}

/**
 * Add an image as a favorite for an era.
 * The image object should come from imageApiService (same shape).
 */
export async function addFavorite(eraId, image) {
  const supabase = await getSupabase();

  const { error } = await supabase
    .from('era_favorites')
    .insert({
      era_id: eraId,
      image_id: image.id,
      image_source: image.source,
      thumbnail_url: image.thumbnailUrl,
      source_url: image.sourceUrl,
      image_title: image.title || '',
      attribution: image.attribution || '',
      keywords: image.keywords || ''
    });

  if (error) {
    console.error('Failed to add favorite:', error);
    return false;
  }
  return true;
}

/**
 * Remove a favorite by era + thumbnail URL (the unique constraint).
 */
export async function removeFavorite(eraId, thumbnailUrl) {
  const supabase = await getSupabase();

  const { error } = await supabase
    .from('era_favorites')
    .delete()
    .eq('era_id', eraId)
    .eq('thumbnail_url', thumbnailUrl);

  if (error) {
    console.error('Failed to remove favorite:', error);
    return false;
  }
  return true;
}

/**
 * Extract unique keywords from an array of favorite image objects.
 * Parses the comma-separated keywords field from each favorite,
 * deduplicates, and returns an array of individual keyword strings.
 */
export function extractKeywordsFromFavorites(favorites) {
  const kwSet = new Set();
  for (const fav of favorites) {
    if (!fav.keywords) continue;
    const parts = fav.keywords.split(',').map(s => s.trim()).filter(Boolean);
    for (const kw of parts) {
      kwSet.add(kw);
    }
  }
  return [...kwSet];
}
