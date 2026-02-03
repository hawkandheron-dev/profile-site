/**
 * HistoricalErasApp
 *
 * Timeline of major historical eras + Pinterest-style vision board.
 * Click an era on the timeline to see a feed of curated images
 * from museum and archive APIs.  Scrolling to the bottom auto-loads
 * more images (infinite scroll).
 *
 * Favorites are persisted to Supabase (era_favorites table).
 * Favorited images load first and their keywords influence
 * subsequent image searches.
 */

import { useState, useCallback, useRef, useEffect } from 'react';
import {
  SignedIn,
  SignedOut,
  SignInButton,
  SignUpButton,
  UserButton,
  useAuth
} from '@clerk/clerk-react';
import FavoritesTest from './components/FavoritesTest.tsx';
import { Timeline } from './components/Timeline/Timeline.jsx';
import { VisionBoard } from './components/VisionBoard/VisionBoard.jsx';
import {
  historicalErasTimelineData,
  historicalErasConfig,
  getEraKeywords,
  getEraById
} from './data/historicalErasData.js';
import { fetchImagesForKeywords } from './services/imageApiService.js';
import {
  getFavoritesForEra,
  addFavorite,
  removeFavorite,
  extractKeywordsFromFavorites
} from './services/favoritesService.js';
import './App.css';
import './HistoricalErasApp.css';

function HistoricalErasApp() {
  const { getToken, isSignedIn, userId } = useAuth();
  const [selectedEra, setSelectedEra] = useState(null);
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [favoriteUrls, setFavoriteUrls] = useState(new Set());
  const fetchIdRef = useRef(0); // guard against stale fetches
  const seenIdsRef = useRef(new Set()); // track already-loaded image ids for dedup
  const priorityKeywordsRef = useRef([]); // keywords extracted from favorites
  // Load initial images for a given era — favorites first, then API images
  const loadImages = useCallback(async (era) => {
    const keywords = getEraKeywords(era.id);
    if (keywords.length === 0) return;

    const id = ++fetchIdRef.current;
    seenIdsRef.current = new Set();
    priorityKeywordsRef.current = [];
    setLoading(true);
    setImages([]);
    setFavoriteUrls(new Set());

    try {
      // Step 1: Fetch favorites from Supabase
      let favorites = [];
      if (isSignedIn) {
        try {
          favorites = await getFavoritesForEra(era.id, getToken, userId);
        } catch (e) {
          console.warn('Could not load favorites (Supabase may not be configured):', e);
        }
      }

      if (id !== fetchIdRef.current) return;

      // Track favorite URLs and seed the seen-ids set
      const favUrlSet = new Set();
      for (const fav of favorites) {
        favUrlSet.add(fav.thumbnailUrl);
        seenIdsRef.current.add(fav.id);
      }
      setFavoriteUrls(favUrlSet);

      // Show favorites immediately while API images load
      if (favorites.length > 0) {
        setImages(favorites);
      }

      // Step 2: Extract priority keywords from favorites
      const priorityKws = extractKeywordsFromFavorites(favorites);
      priorityKeywordsRef.current = priorityKws;

      // Step 3: Fetch API images with priority keywords
      const results = await fetchImagesForKeywords(keywords, {
        eraName: era.name,
        priorityKeywords: priorityKws
      });

      if (id === fetchIdRef.current) {
        // Filter out images that duplicate favorites (by thumbnail URL)
        const newImages = results.filter(img => {
          if (seenIdsRef.current.has(img.id)) return false;
          if (favUrlSet.has(img.thumbnailUrl)) return false;
          return true;
        });
        newImages.forEach(img => seenIdsRef.current.add(img.id));
        setImages(prev => [...prev, ...newImages]);
      }
    } catch (e) {
      console.error('Failed to load images for era:', era.id, e);
    } finally {
      if (id === fetchIdRef.current) {
        setLoading(false);
      }
    }
  }, [getToken, isSignedIn, userId]);

  // Load more images (infinite scroll) — appends to existing feed
  const loadMore = useCallback(async () => {
    if (!selectedEra || loading || loadingMore) return;

    const keywords = getEraKeywords(selectedEra.id);
    if (keywords.length === 0) return;

    const id = fetchIdRef.current; // don't increment — just check staleness
    setLoadingMore(true);

    try {
      const results = await fetchImagesForKeywords(keywords, {
        eraName: selectedEra.name,
        priorityKeywords: priorityKeywordsRef.current
      });
      if (id === fetchIdRef.current) {
        // Filter out images we already have (by id or thumbnail URL)
        const newImages = results.filter(img => {
          if (seenIdsRef.current.has(img.id)) return false;
          if (favoriteUrls.has(img.thumbnailUrl)) return false;
          return true;
        });
        newImages.forEach(img => seenIdsRef.current.add(img.id));
        if (newImages.length > 0) {
          setImages(prev => [...prev, ...newImages]);
        }
      }
    } catch (e) {
      console.error('Failed to load more images:', e);
    } finally {
      if (id === fetchIdRef.current) {
        setLoadingMore(false);
      }
    }
  }, [selectedEra, loading, loadingMore, favoriteUrls]);

  // Toggle favorite on an image
  const handleToggleFavorite = useCallback(async (img) => {
    if (!selectedEra) return;
    if (!isSignedIn) {
      console.warn('Sign in to save favorites.');
      return;
    }

    const isFav = favoriteUrls.has(img.thumbnailUrl);
    if (isFav) {
      // Optimistic UI: remove from favorites set
      setFavoriteUrls(prev => {
        const next = new Set(prev);
        next.delete(img.thumbnailUrl);
        return next;
      });
      const ok = await removeFavorite(selectedEra.id, img.thumbnailUrl, getToken, userId);
      if (!ok) {
        // Revert on failure
        setFavoriteUrls(prev => {
          const next = new Set(prev);
          next.add(img.thumbnailUrl);
          return next;
        });
      }
    } else {
      // Optimistic UI: add to favorites set
      setFavoriteUrls(prev => {
        const next = new Set(prev);
        next.add(img.thumbnailUrl);
        return next;
      });
      const ok = await addFavorite(selectedEra.id, img, getToken, userId);
      if (!ok) {
        // Revert on failure
        setFavoriteUrls(prev => {
          const next = new Set(prev);
          next.delete(img.thumbnailUrl);
          return next;
        });
      }
    }
  }, [selectedEra, favoriteUrls, isSignedIn, getToken, userId]);

  // Handle period click on the timeline
  const handleItemClick = useCallback((type, item) => {
    if (type === 'period') {
      const era = getEraById(item.id) || item;
      setSelectedEra(era);
      loadImages(era);
    }
  }, [loadImages]);

  // Close the vision board
  const handleClose = useCallback(() => {
    setSelectedEra(null);
    setImages([]);
    setFavoriteUrls(new Set());
    seenIdsRef.current = new Set();
    priorityKeywordsRef.current = [];
    fetchIdRef.current++; // cancel in-flight fetches
  }, []);

  // Keyboard shortcut: Escape to close
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape' && selectedEra) {
        handleClose();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [selectedEra, handleClose]);

  return (
    <div className="app historical-eras-app">
      <header className="app-header">
        <div className="header-content">
          <h1>Historical Eras — Vision Board</h1>
          <nav className="tab-nav">
            <a href="../../index.html" className="tab-button">Home</a>
            <a href="./index.html" className="tab-button">Timeline-Scratch</a>
          </nav>
        </div>
        <div className="auth-actions">
          <span className="auth-hint">Sign in to save favorites.</span>
          <SignedOut>
            <SignInButton mode="modal" />
            <SignUpButton mode="modal" />
          </SignedOut>
          <SignedIn>
            <UserButton />
          </SignedIn>
        </div>
      </header>
      <FavoritesTest />

      {/* Instruction banner (hidden once an era is selected) */}
      {!selectedEra && (
        <div className="eras-instruction">
          Click on any era in the timeline to explore a vision board of historical images
        </div>
      )}

      {/* Content area — timeline underneath, overlay on top when an era is selected */}
      <div className="eras-content-area">
        <div className="eras-timeline-panel">
          <Timeline
            data={historicalErasTimelineData}
            config={historicalErasConfig}
            onItemClick={handleItemClick}
            suppressModal
          />
        </div>

        {/* Vision board — covers the full content area when open */}
        {selectedEra && (
          <div className="eras-visionboard-overlay">
            <VisionBoard
              eraId={selectedEra.id}
              eraName={selectedEra.name}
              eraColor={selectedEra.color || '#888'}
              eraPreview={selectedEra.preview}
              eraDescription={selectedEra.description}
              images={images}
              loading={loading}
              loadingMore={loadingMore}
              onClose={handleClose}
              onLoadMore={loadMore}
              onToggleFavorite={handleToggleFavorite}
              favoriteUrls={favoriteUrls}
            />
          </div>
        )}
      </div>
    </div>
  );
}

export default HistoricalErasApp;
