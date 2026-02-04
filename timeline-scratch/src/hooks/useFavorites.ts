import { useState, useCallback, useRef } from 'react';
import { useAuth } from '@clerk/clerk-react';
import {
  getFavoritesForEra,
  addFavorite,
  removeFavorite,
  extractKeywordsFromFavorites,
  isFavoritesError,
  type FavoriteImage,
  type ImageInput
} from '../services/favoritesService';

export interface UseFavoritesReturn {
  /** Set of thumbnailUrls that are currently favorited */
  favoriteUrls: Set<string>;
  /** Set of image IDs that are currently favorited */
  favoriteIds: Set<string>;
  /** Full favorite image objects from latest fetch */
  favorites: FavoriteImage[];
  /** Keywords extracted from favorited images */
  priorityKeywords: string[];
  /** User-facing error message (cleared on next successful operation) */
  errorMessage: string | null;
  /** Load favorites for an era from Supabase */
  loadFavorites: (eraId: string) => Promise<FavoriteImage[]>;
  /** Toggle favorite state for an image (optimistic UI with rollback) */
  toggleFavorite: (eraId: string, img: ImageInput) => Promise<void>;
  /** Clear all favorites state (e.g. when closing the vision board) */
  clearFavorites: () => void;
}

export function useFavorites(): UseFavoritesReturn {
  const { getToken, isSignedIn, userId } = useAuth();

  const [favoriteUrls, setFavoriteUrls] = useState<Set<string>>(new Set());
  const [favoriteIds, setFavoriteIds] = useState<Set<string>>(new Set());
  const [favorites, setFavorites] = useState<FavoriteImage[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const priorityKeywordsRef = useRef<string[]>([]);

  const clearFavorites = useCallback(() => {
    setFavoriteUrls(new Set());
    setFavoriteIds(new Set());
    setFavorites([]);
    setErrorMessage(null);
    priorityKeywordsRef.current = [];
  }, []);

  const loadFavorites = useCallback(async (eraId: string): Promise<FavoriteImage[]> => {
    if (!isSignedIn || !userId) {
      clearFavorites();
      return [];
    }

    setErrorMessage(null);
    const result = await getFavoritesForEra(eraId, getToken, userId);

    if (isFavoritesError(result)) {
      setErrorMessage(result.message);
      return [];
    }

    const urlSet = new Set<string>();
    const idSet = new Set<string>();
    for (const fav of result) {
      urlSet.add(fav.thumbnailUrl);
      idSet.add(fav.id);
    }
    setFavoriteUrls(urlSet);
    setFavoriteIds(idSet);
    setFavorites(result);

    const kws = extractKeywordsFromFavorites(result);
    priorityKeywordsRef.current = kws;

    return result;
  }, [isSignedIn, userId, getToken, clearFavorites]);

  const toggleFavorite = useCallback(async (eraId: string, img: ImageInput) => {
    if (!isSignedIn || !userId) {
      setErrorMessage('Sign in to save favorites.');
      return;
    }

    setErrorMessage(null);
    const isFav = favoriteIds.has(img.id);

    if (isFav) {
      // Optimistic remove
      setFavoriteUrls(prev => { const next = new Set(prev); next.delete(img.thumbnailUrl); return next; });
      setFavoriteIds(prev => { const next = new Set(prev); next.delete(img.id); return next; });

      const result = await removeFavorite(eraId, img.id, getToken, userId);
      if (isFavoritesError(result)) {
        // Rollback
        setFavoriteUrls(prev => { const next = new Set(prev); next.add(img.thumbnailUrl); return next; });
        setFavoriteIds(prev => { const next = new Set(prev); next.add(img.id); return next; });
        setErrorMessage(result.message);
      }
    } else {
      // Optimistic add
      setFavoriteUrls(prev => { const next = new Set(prev); next.add(img.thumbnailUrl); return next; });
      setFavoriteIds(prev => { const next = new Set(prev); next.add(img.id); return next; });

      const result = await addFavorite(eraId, img, getToken, userId);
      if (isFavoritesError(result)) {
        // Rollback
        setFavoriteUrls(prev => { const next = new Set(prev); next.delete(img.thumbnailUrl); return next; });
        setFavoriteIds(prev => { const next = new Set(prev); next.delete(img.id); return next; });
        setErrorMessage(result.message);
      }
    }
  }, [isSignedIn, userId, getToken, favoriteIds]);

  return {
    favoriteUrls,
    favoriteIds,
    favorites,
    priorityKeywords: priorityKeywordsRef.current,
    errorMessage,
    loadFavorites,
    toggleFavorite,
    clearFavorites
  };
}
