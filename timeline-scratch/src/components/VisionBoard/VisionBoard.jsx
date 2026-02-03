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
  const [previewImage, setPreviewImage] = useState(null);
  const scrollRef = useRef(null);
  const sentinelRef = useRef(null);
  const loadMoreCooldownRef = useRef(false);

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
    setPreviewImage(null);
  }, [eraName]);

  // Infinite scroll via IntersectionObserver on sentinel element
  // with cooldown to prevent rapid re-triggering
  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (entry.isIntersecting && !loading && !loadingMore && !loadMoreCooldownRef.current) {
          loadMoreCooldownRef.current = true;
          onLoadMore?.();
          // Cooldown: don't trigger again for 2 seconds
          setTimeout(() => { loadMoreCooldownRef.current = false; }, 2000);
        }
      },
      {
        root: scrollRef.current,
        rootMargin: '200px',
        threshold: 0
      }
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [loading, loadingMore, onLoadMore]);

  // Close preview on Escape
  useEffect(() => {
    if (!previewImage) return;
    const onKey = (e) => {
      if (e.key === 'Escape') setPreviewImage(null);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [previewImage]);

  const visibleImages = images.filter(img => !failedImages.has(img.id));

  // Split into favorites and non-favorites
  const isFav = (img) => favoriteUrls?.has(img.thumbnailUrl) || img.isFavorite;
  const favoriteImages = visibleImages.filter(isFav);
  const regularImages = visibleImages.filter(img => !isFav(img));

  const handleFavoriteClick = useCallback((e, img) => {
    e.preventDefault();
    e.stopPropagation();
    onToggleFavorite?.(img);
  }, [onToggleFavorite]);

  const handleCardClick = useCallback((e, img) => {
    // Don't open preview if clicking the heart button or a link
    if (e.target.closest('.vision-board-fav-btn')) return;
    e.preventDefault();
    setPreviewImage(img);
  }, []);

  return (
    <div className="vision-board">
      {/* Header bar with close button */}
      <div className="vision-board-header" style={{ borderLeftColor: eraColor }}>
        <div className="vision-board-header-left">
          <h2 className="vision-board-title">{eraName}</h2>
          <span className="vision-board-count">
            {loading ? 'Loading images...' : `${visibleImages.length} images${favoriteImages.length > 0 ? ` · ${favoriteImages.length} favorited` : ''}`}
          </span>
        </div>
        <div className="vision-board-header-right">
          <button className="vision-board-btn vision-board-btn-close" onClick={onClose} title="Close vision board">
            <CloseIcon />
            <span>Close</span>
          </button>
        </div>
      </div>

      {/* Scrollable area: description + favorites strip + grid */}
      <div className="vision-board-scroll" ref={scrollRef}>
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

        {/* Favorites strip — horizontal row across the top, dynamic sizing */}
        {favoriteImages.length > 0 && (
          <div className="vision-board-favorites-section">
            <div className="vision-board-favorites-label">Favorites</div>
            <div className="vision-board-favorites-strip">
              {favoriteImages.map(img => (
                <ImageCard
                  key={img.id}
                  img={img}
                  isFav={true}
                  eraColor={eraColor}
                  onImageError={handleImageError}
                  onFavoriteClick={handleFavoriteClick}
                  onCardClick={handleCardClick}
                />
              ))}
            </div>
          </div>
        )}

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

        {/* Masonry grid — non-favorite images */}
        {regularImages.length > 0 && (
          <div className="vision-board-grid">
            {regularImages.map(img => (
              <ImageCard
                key={img.id}
                img={img}
                isFav={false}
                eraColor={eraColor}
                onImageError={handleImageError}
                onFavoriteClick={handleFavoriteClick}
                onCardClick={handleCardClick}
              />
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

      {/* Image preview modal */}
      {previewImage && (
        <ImagePreviewModal
          img={previewImage}
          isFav={isFav(previewImage)}
          eraColor={eraColor}
          onClose={() => setPreviewImage(null)}
          onFavoriteClick={handleFavoriteClick}
        />
      )}
    </div>
  );
}

// Card component for both favorites strip and masonry grid
function ImageCard({ img, isFav, eraColor, onImageError, onFavoriteClick, onCardClick }) {
  // Build metadata line from date and location
  const metaLine = [img.date, img.location].filter(Boolean).join(' · ');

  return (
    <div
      className={`vision-board-card${isFav ? ' vision-board-card--favorited' : ''}`}
      style={isFav ? { '--era-color': eraColor } : undefined}
      onClick={(e) => onCardClick(e, img)}
    >
      <div className="vision-board-card-image-wrapper">
        <img
          src={img.thumbnailUrl}
          alt={img.title}
          loading="lazy"
          onError={() => onImageError(img.id)}
        />
        <button
          className={`vision-board-fav-btn${isFav ? ' vision-board-fav-btn--active' : ''}`}
          onClick={(e) => onFavoriteClick(e, img)}
          title={isFav ? 'Remove from favorites' : 'Add to favorites'}
          aria-label={isFav ? 'Remove from favorites' : 'Add to favorites'}
        >
          <HeartIcon filled={isFav} />
        </button>
      </div>
      <div className="vision-board-card-info">
        <span className="vision-board-card-title">{img.title}</span>
        {metaLine && (
          <span className="vision-board-card-meta">{metaLine}</span>
        )}
        <span
          className="vision-board-card-source"
          style={{ backgroundColor: SOURCE_COLORS[img.source] || '#555' }}
        >
          {SOURCE_LABELS[img.source] || img.source}
        </span>
      </div>
    </div>
  );
}

// Full-screen image preview modal
function ImagePreviewModal({ img, isFav, eraColor, onClose, onFavoriteClick }) {
  const metaLine = [img.date, img.location].filter(Boolean).join(' · ');
  const sourceName = SOURCE_LABELS[img.source] || img.source;

  return (
    <div className="vb-preview-backdrop" onClick={onClose}>
      <div className="vb-preview-modal" onClick={(e) => e.stopPropagation()}>
        <div className="vb-preview-image-area">
          <img
            src={img.thumbnailUrl}
            alt={img.title}
            className="vb-preview-image"
          />
        </div>
        <div className="vb-preview-details">
          <h3 className="vb-preview-title">{img.title}</h3>
          {metaLine && (
            <p className="vb-preview-meta">{metaLine}</p>
          )}
          <p className="vb-preview-attribution">{img.attribution}</p>
          <div className="vb-preview-actions">
            <button
              className={`vb-preview-fav-btn${isFav ? ' vb-preview-fav-btn--active' : ''}`}
              onClick={(e) => onFavoriteClick(e, img)}
              title={isFav ? 'Remove from favorites' : 'Add to favorites'}
            >
              <HeartIcon filled={isFav} />
              <span>{isFav ? 'Favorited' : 'Favorite'}</span>
            </button>
            <a
              href={img.sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="vb-preview-source-link"
              style={{ '--source-color': SOURCE_COLORS[img.source] || '#555' }}
            >
              <ExternalLinkIcon />
              <span>View on {sourceName}</span>
            </a>
          </div>
        </div>
        <button className="vb-preview-close" onClick={onClose} title="Close preview" aria-label="Close preview">
          <CloseIcon />
        </button>
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

function ExternalLinkIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
      <polyline points="15 3 21 3 21 9" />
      <line x1="10" y1="14" x2="21" y2="3" />
    </svg>
  );
}
