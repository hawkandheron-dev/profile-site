/**
 * VisionBoard — Pinterest-style masonry grid of historical images.
 *
 * Props:
 *   eraId       – current era identifier
 *   eraName     – display name
 *   eraColor    – theme color for header
 *   images      – array of image result objects from imageApiService
 *   loading     – whether images are still loading
 *   onClose     – callback to deselect the era
 *   onRefresh   – callback to reload images with new random keywords
 */

import { useState, useCallback } from 'react';
import { SOURCE_LABELS, SOURCE_COLORS } from '../../services/imageApiService.js';
import './VisionBoard.css';

export function VisionBoard({ eraName, eraColor, images, loading, onClose, onRefresh }) {
  const [failedImages, setFailedImages] = useState(new Set());

  const handleImageError = useCallback((id) => {
    setFailedImages(prev => {
      const next = new Set(prev);
      next.add(id);
      return next;
    });
  }, []);

  const visibleImages = images.filter(img => !failedImages.has(img.id));

  return (
    <div className="vision-board">
      {/* Header bar */}
      <div className="vision-board-header" style={{ borderLeftColor: eraColor }}>
        <div className="vision-board-header-left">
          <h2 className="vision-board-title">{eraName}</h2>
          <span className="vision-board-count">
            {loading ? 'Loading images...' : `${visibleImages.length} images`}
          </span>
        </div>
        <div className="vision-board-header-right">
          <button className="vision-board-btn" onClick={onRefresh} disabled={loading} title="Load new images">
            <RefreshIcon />
            <span>Refresh</span>
          </button>
          <button className="vision-board-btn vision-board-btn-close" onClick={onClose} title="Close vision board">
            <CloseIcon />
            <span>Close</span>
          </button>
        </div>
      </div>

      {/* Loading state */}
      {loading && (
        <div className="vision-board-loading">
          <div className="vision-board-spinner" style={{ borderTopColor: eraColor }} />
          <p>Searching museums and archives...</p>
        </div>
      )}

      {/* Empty state */}
      {!loading && visibleImages.length === 0 && (
        <div className="vision-board-empty">
          <p>No images found for this era. Try refreshing.</p>
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
    </div>
  );
}

// Inline SVG icons to avoid extra dependencies
function RefreshIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="23 4 23 10 17 10" />
      <polyline points="1 20 1 14 7 14" />
      <path d="M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}
