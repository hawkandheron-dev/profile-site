/**
 * Favorites Service — Supabase CRUD for era image favorites.
 *
 * Stores favorited images per era in the `era_favorites` table.
 * All mutations require a valid clerkUserId — operations without
 * one are rejected client-side before hitting the database.
 */
import { makeSupabaseClient } from '../lib/supabase';
import type { SupabaseClient } from '@supabase/supabase-js';

// ── Types ───────────────────────────────────────────────────────────────

type TokenProvider = () => Promise<string | null | undefined>;

export interface FavoriteImage {
  id: string;
  title: string;
  thumbnailUrl: string;
  sourceUrl: string;
  source: string;
  attribution: string;
  keywords: string;
  isFavorite: true;
}

/** The image shape provided by imageApiService / VisionBoard. */
export interface ImageInput {
  id: string;
  title?: string;
  thumbnailUrl: string;
  sourceUrl?: string;
  source?: string;
  attribution?: string;
  keywords?: string;
}

export interface FavoritesError {
  ok: false;
  message: string;
}

export type FavoritesResult<T> = T | FavoritesError;

export function isFavoritesError<T>(result: FavoritesResult<T>): result is FavoritesError {
  return typeof result === 'object' && result !== null && 'ok' in result && (result as FavoritesError).ok === false;
}

// ── Supabase client (singleton) ─────────────────────────────────────────

let supabaseClient: SupabaseClient | null = null;

function getSupabase(getToken: TokenProvider): SupabaseClient {
  // Always create a fresh client — token provider closures may change
  // between renders and stale references cause auth failures.
  if (!supabaseClient) {
    supabaseClient = makeSupabaseClient(getToken);
  }
  return supabaseClient;
}

/** Reset the cached client (useful if auth state changes). */
export function resetSupabaseClient(): void {
  supabaseClient = null;
}

// ── Public API ──────────────────────────────────────────────────────────

/**
 * Fetch all favorites for a given era, ordered by most recent first.
 * Returns image objects in the same shape as imageApiService results
 * plus an `isFavorite: true` flag.
 *
 * Requires clerkUserId — returns an error result if missing.
 */
export async function getFavoritesForEra(
  eraId: string,
  getToken: TokenProvider,
  clerkUserId: string
): Promise<FavoritesResult<FavoriteImage[]>> {
  if (!clerkUserId) {
    return { ok: false, message: 'Not signed in — cannot load favorites.' };
  }

  const supabase = getSupabase(getToken);

  const { data, error } = await supabase
    .from('era_favorites')
    .select('*')
    .eq('era_id', eraId)
    .eq('clerk_user_id', clerkUserId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Failed to fetch favorites:', error);
    return { ok: false, message: `Failed to load favorites: ${error.message}` };
  }

  return (data || []).map(row => ({
    id: row.image_id,
    title: row.image_title,
    thumbnailUrl: row.thumbnail_url,
    sourceUrl: row.source_url,
    source: row.image_source,
    attribution: row.attribution,
    keywords: row.keywords,
    isFavorite: true as const
  }));
}

/**
 * Add an image as a favorite for an era.
 * Requires clerkUserId — returns an error result if missing.
 */
export async function addFavorite(
  eraId: string,
  image: ImageInput,
  getToken: TokenProvider,
  clerkUserId: string
): Promise<FavoritesResult<true>> {
  if (!clerkUserId) {
    return { ok: false, message: 'Not signed in — cannot save favorites.' };
  }

  const supabase = getSupabase(getToken);

  const { error } = await supabase
    .from('era_favorites')
    .insert({
      era_id: eraId,
      clerk_user_id: clerkUserId,
      image_id: image.id,
      image_source: image.source || '',
      thumbnail_url: image.thumbnailUrl,
      source_url: image.sourceUrl || '',
      image_title: image.title || '',
      attribution: image.attribution || '',
      keywords: image.keywords || ''
    });

  if (error) {
    console.error('Failed to add favorite:', error);
    return { ok: false, message: `Failed to save favorite: ${error.message}` };
  }
  return true;
}

/**
 * Remove a favorite by era + image_id + user.
 * Uses image_id (stable identifier) rather than thumbnail_url (fragile).
 * Requires clerkUserId — returns an error result if missing.
 */
export async function removeFavorite(
  eraId: string,
  imageId: string,
  getToken: TokenProvider,
  clerkUserId: string
): Promise<FavoritesResult<true>> {
  if (!clerkUserId) {
    return { ok: false, message: 'Not signed in — cannot remove favorites.' };
  }

  const supabase = getSupabase(getToken);

  const { error } = await supabase
    .from('era_favorites')
    .delete()
    .eq('era_id', eraId)
    .eq('image_id', imageId)
    .eq('clerk_user_id', clerkUserId);

  if (error) {
    console.error('Failed to remove favorite:', error);
    return { ok: false, message: `Failed to remove favorite: ${error.message}` };
  }
  return true;
}

/**
 * Extract unique keywords from an array of favorite image objects.
 * Parses the comma-separated keywords field from each favorite,
 * deduplicates, and returns an array of individual keyword strings.
 */
export function extractKeywordsFromFavorites(favorites: FavoriteImage[]): string[] {
  const kwSet = new Set<string>();
  for (const fav of favorites) {
    if (!fav.keywords) continue;
    const parts = fav.keywords.split(',').map(s => s.trim()).filter(Boolean);
    for (const kw of parts) {
      kwSet.add(kw);
    }
  }
  return [...kwSet];
}
