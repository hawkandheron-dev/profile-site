/**
 * VisionBoard — Pinterest-style masonry grid of historical images.
 *
 * Props:
 *   eraId          – era identifier (for favorites)
 *   eraName        – display name
 *   eraColor       – theme color for header accent
 *   eraPreview     – short one-liner about the era
 *   eraDescription – HTML description string
 *   images         – array of image result objects from imageApiService
 *   loading        – whether a fetch is currently in flight
 *   loadingMore    – whether an infinite-scroll fetch is in flight
 *   onClose        – callback to deselect the era
 *   onLoadMore     – callback when user scrolls near the bottom
 *   onToggleFavorite – callback(image) when user clicks the heart
 *   favoriteUrls   – Set of thumbnail URLs that are currently favorited
 */

import { useState, useCallback, useRef, useEffect } from 'react';
import { SOURCE_LABELS, SOURCE_COLORS } from '../../services/imageApiService.js';
import './VisionBoard.css';

export function VisionBoard({
  eraId,
  eraName,
  eraColor,
  eraPreview,
  eraDescription,
  images,
  loading,
  loadingMore,
  onClose,
  onLoadMore,
  onToggleFavorite,
  favoriteUrls
}) {
  const [failedImages, setFailedImages] = useState(new Set());
  const gridRef = useRef(null);
  const sentinelRef = useRef(null);

  const handleImageError = useCallback((id) => {
    setFailedImages(prev => {
      const next = new Set(prev);
      next.add(id);
      return next;
    });
  }, []);

  // Reset failed images when era changes
  useEffect(() => {
    setFailedImages(new Set());
  }, [eraName]);

  // Infinite scroll via IntersectionObserver on sentinel element
  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (entry.isIntersecting && !loading && !loadingMore) {
          onLoadMore?.();
        }
      },
      {
        root: gridRef.current,
        rootMargin: '400px',   // trigger well before reaching the very bottom
        threshold: 0
      }
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [loading, loadingMore, onLoadMore]);

  const visibleImages = images.filter(img => !failedImages.has(img.id));

  // Sort: favorites first, then non-favorites
  const sortedImages = [...visibleImages].sort((a, b) => {
    const aFav = favoriteUrls?.has(a.thumbnailUrl) || a.isFavorite ? 1 : 0;
    const bFav = favoriteUrls?.has(b.thumbnailUrl) || b.isFavorite ? 1 : 0;
    return bFav - aFav;
  });

  const favCount = sortedImages.filter(img => favoriteUrls?.has(img.thumbnailUrl) || img.isFavorite).length;

  const handleFavoriteClick = useCallback((e, img) => {
    e.preventDefault();
    e.stopPropagation();
    onToggleFavorite?.(img);
  }, [onToggleFavorite]);

  return (
    <div className="vision-board">
      {/* Header bar with close button */}
      <div className="vision-board-header" style={{ borderLeftColor: eraColor }}>
        <div className="vision-board-header-left">
          <h2 className="vision-board-title">{eraName}</h2>
          <span className="vision-board-count">
            {loading ? 'Loading images...' : `${sortedImages.length} images${favCount > 0 ? ` · ${favCount} favorited` : ''}`}
          </span>
        </div>
        <div className="vision-board-header-right">
          <button className="vision-board-btn vision-board-btn-close" onClick={onClose} title="Close vision board">
            <CloseIcon />
            <span>Close</span>
          </button>
        </div>
      </div>

      {/* Scrollable area: description + grid */}
      <div className="vision-board-scroll" ref={gridRef}>
        {/* Era summary */}
        <div className="vision-board-era-summary" style={{ borderLeftColor: eraColor }}>
          {eraPreview && (
            <p className="vision-board-era-preview">{eraPreview}</p>
          )}
          {eraDescription && (
            <div
              className="vision-board-era-description"
              dangerouslySetInnerHTML={{ __html: eraDescription }}
            />
          )}
        </div>

        {/* Initial loading state */}
        {loading && images.length === 0 && (
          <div className="vision-board-loading">
            <div className="vision-board-spinner" style={{ borderTopColor: eraColor }} />
            <p>Searching museums and archives...</p>
          </div>
        )}

        {/* Empty state */}
        {!loading && sortedImages.length === 0 && (
          <div className="vision-board-empty">
            <p>No images found for this era. Try closing and clicking the era again.</p>
          </div>
        )}

        {/* Masonry grid */}
        {sortedImages.length > 0 && (
          <div className="vision-board-grid">
            {sortedImages.map(img => {
              const isFav = favoriteUrls?.has(img.thumbnailUrl) || img.isFavorite;
              return (
                <div
                  key={img.id}
                  className={`vision-board-card${isFav ? ' vision-board-card--favorited' : ''}`}
                  style={isFav ? { '--era-color': eraColor } : undefined}
                >
                  <div className="vision-board-card-image-wrapper">
                    <a href={img.sourceUrl} target="_blank" rel="noopener noreferrer" title={`${img.title}\n${img.attribution}`}>
                      <img
                        src={img.thumbnailUrl}
                        alt={img.title}
                        loading="lazy"
                        onError={() => handleImageError(img.id)}
                      />
                    </a>
                    <button
                      className={`vision-board-fav-btn${isFav ? ' vision-board-fav-btn--active' : ''}`}
                      onClick={(e) => handleFavoriteClick(e, img)}
                      title={isFav ? 'Remove from favorites' : 'Add to favorites'}
                      aria-label={isFav ? 'Remove from favorites' : 'Add to favorites'}
                    >
                      <HeartIcon filled={isFav} />
                    </button>
                  </div>
                  <div className="vision-board-card-info">
                    <span className="vision-board-card-title">{img.title}</span>
                    <span
                      className="vision-board-card-source"
                      style={{ backgroundColor: SOURCE_COLORS[img.source] || '#555' }}
                    >
                      {SOURCE_LABELS[img.source] || img.source}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Loading-more spinner */}
        {loadingMore && (
          <div className="vision-board-loading-more">
            <div className="vision-board-spinner vision-board-spinner--small" style={{ borderTopColor: eraColor }} />
            <span>Loading more images...</span>
          </div>
        )}

        {/* Infinite scroll sentinel */}
        <div ref={sentinelRef} className="vision-board-sentinel" />
      </div>
    </div>
  );
}

// Inline SVG icons
function CloseIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}

function HeartIcon({ filled }) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill={filled ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
    </svg>
  );
}
