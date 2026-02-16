import { useState, useEffect, useCallback } from 'react';

const COMMONS_API = 'https://commons.wikimedia.org/w/api.php';
const IMAGES_PER_PAGE = 6;

/**
 * Fetches and displays images from Wikimedia Commons for a biblical place.
 * Uses keyword search with optional geo-coordinates for relevance.
 */
export function WikimediaImageGallery({ placeName, lat, lng }) {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [totalAvailable, setTotalAvailable] = useState(0);
  const [lightboxIdx, setLightboxIdx] = useState(null);

  useEffect(() => {
    let cancelled = false;

    async function fetchImages() {
      setLoading(true);
      try {
        // Search by place name + "biblical" or "archaeological" for relevance
        const searchTerm = `${placeName} biblical OR archaeological OR ancient`;
        const params = new URLSearchParams({
          action: 'query',
          generator: 'search',
          gsrsearch: searchTerm,
          gsrnamespace: '6', // File namespace
          gsrlimit: '30',
          prop: 'imageinfo',
          iiprop: 'url|extmetadata|size|mime',
          iiurlwidth: '400',
          format: 'json',
          origin: '*',
        });

        const res = await fetch(`${COMMONS_API}?${params}`);
        const data = await res.json();

        if (cancelled) return;

        if (!data.query?.pages) {
          setImages([]);
          setTotalAvailable(0);
          setLoading(false);
          return;
        }

        const pages = Object.values(data.query.pages)
          .filter(p => p.imageinfo?.[0]?.mime?.startsWith('image/'))
          .map(p => {
            const info = p.imageinfo[0];
            const meta = info.extmetadata || {};
            return {
              title: p.title.replace('File:', '').replace(/\.[^.]+$/, '').replace(/_/g, ' '),
              thumbUrl: info.thumburl,
              fullUrl: info.url,
              descriptionUrl: info.descriptionurl,
              width: info.width,
              height: info.height,
              artist: meta.Artist?.value?.replace(/<[^>]+>/g, '') || 'Unknown',
              license: meta.LicenseShortName?.value || '',
            };
          });

        if (!cancelled) {
          setImages(pages);
          setTotalAvailable(pages.length);
          setPage(0);
          setLoading(false);
        }
      } catch {
        if (!cancelled) {
          setImages([]);
          setTotalAvailable(0);
          setLoading(false);
        }
      }
    }

    if (placeName) fetchImages();
    return () => { cancelled = true; };
  }, [placeName, lat, lng]);

  const totalPages = Math.ceil(images.length / IMAGES_PER_PAGE);
  const visibleImages = images.slice(page * IMAGES_PER_PAGE, (page + 1) * IMAGES_PER_PAGE);

  const goNext = useCallback(() => setPage(p => Math.min(p + 1, totalPages - 1)), [totalPages]);
  const goPrev = useCallback(() => setPage(p => Math.max(p - 1, 0)), []);

  if (loading) {
    return (
      <div className="bp-gallery bp-gallery-loading">
        <div className="bp-gallery-spinner" />
        <span>Loading images...</span>
      </div>
    );
  }

  if (images.length === 0) return null;

  return (
    <div className="bp-gallery">
      <div className="bp-gallery-grid">
        {visibleImages.map((img, i) => (
          <button
            key={img.fullUrl}
            className="bp-gallery-item"
            onClick={() => setLightboxIdx(page * IMAGES_PER_PAGE + i)}
            title={img.title}
          >
            <img src={img.thumbUrl} alt={img.title} loading="lazy" />
          </button>
        ))}
      </div>

      {totalPages > 1 && (
        <div className="bp-gallery-pagination">
          <button
            className="bp-gallery-page-btn"
            disabled={page === 0}
            onClick={goPrev}
          >
            &lsaquo; Prev
          </button>
          <span className="bp-gallery-page-info">
            {page + 1} / {totalPages}
          </span>
          <button
            className="bp-gallery-page-btn"
            disabled={page >= totalPages - 1}
            onClick={goNext}
          >
            Next &rsaquo;
          </button>
        </div>
      )}

      <p className="bp-gallery-attribution">
        Images from <a href="https://commons.wikimedia.org" target="_blank" rel="noopener noreferrer">Wikimedia Commons</a>
      </p>

      {/* Lightbox */}
      {lightboxIdx !== null && images[lightboxIdx] && (
        <div className="bp-lightbox" onClick={() => setLightboxIdx(null)}>
          <div className="bp-lightbox-content" onClick={e => e.stopPropagation()}>
            <button className="bp-lightbox-close" onClick={() => setLightboxIdx(null)}>&times;</button>
            <img src={images[lightboxIdx].fullUrl} alt={images[lightboxIdx].title} />
            <div className="bp-lightbox-caption">
              <p className="bp-lightbox-title">{images[lightboxIdx].title}</p>
              <p className="bp-lightbox-meta">
                {images[lightboxIdx].artist}
                {images[lightboxIdx].license && ` | ${images[lightboxIdx].license}`}
              </p>
              <a
                href={images[lightboxIdx].descriptionUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="bp-lightbox-link"
              >
                View on Wikimedia Commons
              </a>
            </div>
            <div className="bp-lightbox-nav">
              <button
                disabled={lightboxIdx === 0}
                onClick={() => setLightboxIdx(i => i - 1)}
              >
                &lsaquo;
              </button>
              <button
                disabled={lightboxIdx >= images.length - 1}
                onClick={() => setLightboxIdx(i => i + 1)}
              >
                &rsaquo;
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
