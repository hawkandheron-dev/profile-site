import { useState, useEffect } from 'react';
import './AKImageGallery.css';

/**
 * Hero image fetched from the entity's Wikipedia article lead image.
 * Uses the Wikipedia REST API page/summary endpoint.
 */
export function AKHeroImage({ referenceUrl }) {
  const [imageData, setImageData] = useState(null);
  const [showLightbox, setShowLightbox] = useState(false);

  useEffect(() => {
    if (!referenceUrl) return;
    let cancelled = false;

    async function fetchImage() {
      try {
        // Extract article title from Wikipedia URL
        const match = referenceUrl.match(/wikipedia\.org\/wiki\/([^#?]+)/);
        if (!match) return;
        const title = decodeURIComponent(match[1]);

        const res = await fetch(
          `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(title)}`
        );
        if (!res.ok) return;
        const data = await res.json();

        if (!cancelled && data.thumbnail?.source) {
          setImageData({
            thumbUrl: data.thumbnail.source,
            fullUrl: data.originalimage?.source || data.thumbnail.source,
            description: data.description || '',
            title: data.title || title.replace(/_/g, ' '),
            wikiUrl: data.content_urls?.desktop?.page || referenceUrl,
          });
        }
      } catch {
        // Gracefully hide on error
      }
    }

    fetchImage();
    return () => { cancelled = true; };
  }, [referenceUrl]);

  if (!imageData) return null;

  return (
    <div className="ak-hero-image">
      <button className="ak-hero-image-btn" onClick={() => setShowLightbox(true)} title="Click to enlarge">
        <img src={imageData.thumbUrl} alt={imageData.title} />
        <span className="ak-hero-enlarge">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="15 3 21 3 21 9" /><line x1="14" y1="10" x2="21" y2="3" />
            <polyline points="9 21 3 21 3 15" /><line x1="10" y1="14" x2="3" y2="21" />
          </svg>
        </span>
      </button>
      {imageData.description && (
        <p className="ak-hero-caption">{imageData.description}</p>
      )}

      {showLightbox && (
        <div className="ak-lightbox" onClick={() => setShowLightbox(false)}>
          <div className="ak-lightbox-content" onClick={e => e.stopPropagation()}>
            <button className="ak-lightbox-close" onClick={() => setShowLightbox(false)}>&times;</button>
            <img src={imageData.fullUrl} alt={imageData.title} />
            <div className="ak-lightbox-caption">
              <p className="ak-lightbox-title">{imageData.title}</p>
              <a href={imageData.wikiUrl} target="_blank" rel="noopener noreferrer" className="ak-lightbox-link">
                View on Wikipedia
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Keep backward-compatible export name for existing imports
export { AKHeroImage as AKImageGallery };
