/**
 * VisionBoard — Pinterest-style masonry grid of historical images.
 *
 * Props:
 *   eraName        – display name
 *   eraColor       – theme color for header accent
 *   eraPreview     – short one-liner about the era
 *   eraDescription – HTML description string
 *   images         – array of image result objects from imageApiService
 *   loading        – whether a fetch is currently in flight
 *   loadingMore    – whether an infinite-scroll fetch is in flight
 *   onClose        – callback to deselect the era
 *   onLoadMore     – callback when user scrolls near the bottom
 */

import { useState, useCallback, useRef, useEffect } from 'react';
import { SOURCE_LABELS, SOURCE_COLORS } from '../../services/imageApiService.js';
import './VisionBoard.css';

export function VisionBoard({
  eraName,
  eraColor,
  eraPreview,
  eraDescription,
  images,
  loading,
  loadingMore,
  onClose,
  onLoadMore
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

  return (
    <div className="vision-board">
      {/* Header bar with close button */}
      <div className="vision-board-header" style={{ borderLeftColor: eraColor }}>
        <div className="vision-board-header-left">
          <h2 className="vision-board-title">{eraName}</h2>
          <span className="vision-board-count">
            {loading ? 'Loading images...' : `${visibleImages.length} images`}
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
        {!loading && visibleImages.length === 0 && (
          <div className="vision-board-empty">
            <p>No images found for this era. Try closing and clicking the era again.</p>
          </div>
        )}

        {/* Masonry grid */}
        {visibleImages.length > 0 && (
          <div className="vision-board-grid">
            {visibleImages.map(img => (
              <a
                key={img.id}
                className="vision-board-card"
                href={img.sourceUrl}
                target="_blank"
                rel="noopener noreferrer"
                title={`${img.title}\n${img.attribution}`}
              >
                <div className="vision-board-card-image-wrapper">
                  <img
                    src={img.thumbnailUrl}
                    alt={img.title}
                    loading="lazy"
                    onError={() => handleImageError(img.id)}
                  />
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
              </a>
            ))}
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
