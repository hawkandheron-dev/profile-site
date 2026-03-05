import { useState, useEffect, useCallback } from 'react';
import './AKImageGallery.css';

const COMMONS_API = 'https://commons.wikimedia.org/w/api.php';
const IMAGES_PER_PAGE = 4;

/**
 * Image gallery fetching from Wikimedia Commons.
 * Two-pass: geo-search near coordinates, then keyword fallback.
 */
export function AKImageGallery({ name, lat, lng, searchTerms, entityType }) {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [lightboxIdx, setLightboxIdx] = useState(null);

  useEffect(() => {
    let cancelled = false;

    function buildSearchQuery() {
      if (searchTerms) return searchTerms;
      switch (entityType) {
        case 'landmark': return `"${name}" archaeological OR ruins OR monument OR architecture`;
        case 'kingdom': return `"${name}" kingdom OR empire Africa historical`;
        case 'place': return `"${name}" Africa archaeological OR ancient OR city`;
        case 'person': return `"${name}" Africa ruler OR king OR emperor OR portrait`;
        case 'event': return `"${name}" Africa historical`;
        default: return `"${name}" Africa historical`;
      }
    }

    async function fetchByGeo() {
      const params = new URLSearchParams({
        action: 'query',
        generator: 'geosearch',
        ggscoord: `${lat}|${lng}`,
        ggsradius: '10000',
        ggslimit: '20',
        ggsnamespace: '6',
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
      const params = new URLSearchParams({
        action: 'query',
        generator: 'search',
        gsrsearch: buildSearchQuery(),
        gsrnamespace: '6',
        gsrlimit: '20',
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
            artist: meta.Artist?.value?.replace(/<[^>]+>/g, '') || 'Unknown',
            license: meta.LicenseShortName?.value || '',
          };
        });
    }

    async function fetchImages() {
      setLoading(true);
      try {
        let results = [];
        if (lat && lng) {
          const geoData = await fetchByGeo();
          if (!cancelled) results = extractImages(geoData);
        }

        if (results.length < IMAGES_PER_PAGE && !cancelled) {
          const kwData = await fetchByKeyword();
          if (!cancelled) {
            const kwResults = extractImages(kwData);
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
        if (!cancelled) { setImages([]); setLoading(false); }
      }
    }

    if (name) fetchImages();
    return () => { cancelled = true; };
  }, [name, lat, lng, searchTerms, entityType]);

  const totalPages = Math.ceil(images.length / IMAGES_PER_PAGE);
  const visibleImages = images.slice(page * IMAGES_PER_PAGE, (page + 1) * IMAGES_PER_PAGE);

  const goNext = useCallback(() => setPage(p => Math.min(p + 1, totalPages - 1)), [totalPages]);
  const goPrev = useCallback(() => setPage(p => Math.max(p - 1, 0)), []);

  if (loading) {
    return (
      <div className="ak-gallery ak-gallery-loading">
        <div className="ak-gallery-spinner" />
        <span>Loading images...</span>
      </div>
    );
  }

  if (images.length === 0) return null;

  return (
    <div className="ak-gallery">
      <div className="ak-gallery-grid">
        {visibleImages.map((img, i) => (
          <button
            key={img.pageId}
            className="ak-gallery-item"
            onClick={() => setLightboxIdx(page * IMAGES_PER_PAGE + i)}
            title={img.title}
          >
            <img src={img.thumbUrl} alt={img.title} loading="lazy" />
          </button>
        ))}
      </div>

      {totalPages > 1 && (
        <div className="ak-gallery-pagination">
          <button className="ak-gallery-page-btn" disabled={page === 0} onClick={goPrev}>&lsaquo;</button>
          <span className="ak-gallery-page-info">{page + 1} / {totalPages}</span>
          <button className="ak-gallery-page-btn" disabled={page >= totalPages - 1} onClick={goNext}>&rsaquo;</button>
        </div>
      )}

      <p className="ak-gallery-attribution">
        Images from <a href="https://commons.wikimedia.org" target="_blank" rel="noopener noreferrer">Wikimedia Commons</a>
      </p>

      {lightboxIdx !== null && images[lightboxIdx] && (
        <div className="ak-lightbox" onClick={() => setLightboxIdx(null)}>
          <div className="ak-lightbox-content" onClick={e => e.stopPropagation()}>
            <button className="ak-lightbox-close" onClick={() => setLightboxIdx(null)}>&times;</button>
            <img src={images[lightboxIdx].fullUrl} alt={images[lightboxIdx].title} />
            <div className="ak-lightbox-caption">
              <p className="ak-lightbox-title">{images[lightboxIdx].title}</p>
              <p className="ak-lightbox-meta">
                {images[lightboxIdx].artist}
                {images[lightboxIdx].license && ` | ${images[lightboxIdx].license}`}
              </p>
              <a href={images[lightboxIdx].descriptionUrl} target="_blank" rel="noopener noreferrer" className="ak-lightbox-link">
                View on Wikimedia Commons
              </a>
            </div>
            <div className="ak-lightbox-nav">
              <button disabled={lightboxIdx === 0} onClick={() => setLightboxIdx(i => i - 1)}>&lsaquo;</button>
              <button disabled={lightboxIdx >= images.length - 1} onClick={() => setLightboxIdx(i => i + 1)}>&rsaquo;</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
