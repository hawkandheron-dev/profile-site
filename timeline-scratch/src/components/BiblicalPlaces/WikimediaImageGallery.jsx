import { useState, useEffect, useCallback } from 'react';

const COMMONS_API = 'https://commons.wikimedia.org/w/api.php';
const IMAGES_PER_PAGE = 6;

/**
 * Fetches and displays images from Wikimedia Commons for a biblical place.
 * Uses a two-pass strategy: first geo-search near coordinates, then keyword fallback.
 */
export function WikimediaImageGallery({ placeName, lat, lng, region }) {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [lightboxIdx, setLightboxIdx] = useState(null);

  useEffect(() => {
    let cancelled = false;

    async function fetchByGeo() {
      // Geo-search: find images taken near these coordinates
      const params = new URLSearchParams({
        action: 'query',
        generator: 'geosearch',
        ggscoord: `${lat}|${lng}`,
        ggsradius: '10000', // 10km radius
        ggslimit: '30',
        ggsnamespace: '6', // File namespace
        prop: 'imageinfo',
        iiprop: 'url|extmetadata|size|mime',
        iiurlwidth: '400',
        format: 'json',
        origin: '*',
      });
      const res = await fetch(`${COMMONS_API}?${params}`);
      return res.json();
    }

    async function fetchByKeyword() {
      // Keyword search with place-specific terms
      const searchTerm = `"${placeName}" archaeological OR ancient OR ruins OR excavation OR site`;
      const params = new URLSearchParams({
        action: 'query',
        generator: 'search',
        gsrsearch: searchTerm,
        gsrnamespace: '6',
        gsrlimit: '30',
        prop: 'imageinfo',
        iiprop: 'url|extmetadata|size|mime',
        iiurlwidth: '400',
        format: 'json',
        origin: '*',
      });
      const res = await fetch(`${COMMONS_API}?${params}`);
      return res.json();
    }

    function extractImages(data) {
      if (!data.query?.pages) return [];
      return Object.values(data.query.pages)
        .filter(p => p.imageinfo?.[0]?.mime?.startsWith('image/'))
        .map(p => {
          const info = p.imageinfo[0];
          const meta = info.extmetadata || {};
          return {
            pageId: p.pageid,
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
    }

    async function fetchImages() {
      setLoading(true);
      try {
        // Try geo-search first if we have coordinates
        let results = [];
        if (lat && lng) {
          const geoData = await fetchByGeo();
          if (!cancelled) results = extractImages(geoData);
        }

        // If geo-search found fewer than 6, supplement with keyword search
        if (results.length < IMAGES_PER_PAGE && !cancelled) {
          const kwData = await fetchByKeyword();
          if (!cancelled) {
            const kwResults = extractImages(kwData);
            // Merge, deduplicating by page ID
            const seen = new Set(results.map(r => r.pageId));
            for (const img of kwResults) {
              if (!seen.has(img.pageId)) {
                results.push(img);
                seen.add(img.pageId);
              }
            }
          }
        }

        if (!cancelled) {
          setImages(results);
          setPage(0);
          setLoading(false);
        }
      } catch {
        if (!cancelled) {
          setImages([]);
          setLoading(false);
        }
      }
    }

    if (placeName) fetchImages();
    return () => { cancelled = true; };
  }, [placeName, lat, lng, region]);

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
            key={img.pageId}
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
