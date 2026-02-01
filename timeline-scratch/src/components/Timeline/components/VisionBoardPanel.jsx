/**
 * VisionBoardPanel – replaces the modal for period/era items.
 *
 * Shows the era title, date range and summary at the top,
 * followed by a masonry-style image feed fetched from
 * Wikimedia Commons.  Scrolling to the bottom triggers
 * loading the next batch of images (infinite scroll).
 */

import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { formatDateRange } from '../utils/dateUtils.js';
import {
  eraSummaries,
  STANDARD_KEYWORDS,
  isSafeContent,
  buildSearchQueries,
} from '../../../data/eraVisionBoard.js';
import './VisionBoardPanel.css';

// ── Wikimedia Commons helpers ────────────────────────────────────────────

const COMMONS_API = 'https://commons.wikimedia.org/w/api.php';
const BATCH_SIZE = 20; // images per request

/**
 * Fetch a page of image results from Wikimedia Commons.
 * Returns { images: [{title, thumbUrl, pageUrl, description}], continueToken }
 */
async function fetchCommonsImages(query, continueToken = null) {
  const params = new URLSearchParams({
    action: 'query',
    generator: 'search',
    gsrsearch: `${query} filetype:bitmap`,
    gsrnamespace: '6', // File namespace
    gsrlimit: String(BATCH_SIZE),
    prop: 'imageinfo|info',
    iiprop: 'url|extmetadata|mime',
    iiurlwidth: '400',
    format: 'json',
    origin: '*',
  });

  if (continueToken) {
    // continueToken is an object like { gsroffset: '20', continue: '...' }
    for (const [key, value] of Object.entries(continueToken)) {
      params.set(key, String(value));
    }
  }

  const res = await fetch(`${COMMONS_API}?${params}`);
  if (!res.ok) throw new Error(`Commons API ${res.status}`);
  const json = await res.json();

  const pages = json.query?.pages || {};
  const images = Object.values(pages)
    .map((page) => {
      const info = page.imageinfo?.[0];
      if (!info) return null;

      // Only allow bitmap images
      const mime = info.mime || '';
      if (!mime.startsWith('image/')) return null;

      const meta = info.extmetadata || {};
      const description =
        meta.ImageDescription?.value?.replace(/<[^>]*>/g, '') || '';
      const title = page.title?.replace(/^File:/, '') || '';

      // Content safety check
      if (!isSafeContent(title, description)) return null;

      return {
        id: page.pageid,
        title,
        thumbUrl: info.thumburl,
        pageUrl: info.descriptionurl,
        description,
        width: info.thumbwidth || 400,
        height: info.thumbheight || 300,
      };
    })
    .filter(Boolean);

  const nextToken = json.continue || null;

  return { images, continueToken: nextToken };
}

// ── Component ────────────────────────────────────────────────────────────

export function VisionBoardPanel({ item, config, onClose }) {
  const eraId = item?.id;
  const eraData = eraSummaries[eraId] || null;

  // Image state
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [queryIndex, setQueryIndex] = useState(0);
  const [continueToken, setContinueToken] = useState(null);
  const [hasMore, setHasMore] = useState(true);
  const [failedImages, setFailedImages] = useState(new Set());

  // Refs
  const scrollRef = useRef(null);
  const loadingRef = useRef(false); // Prevent double-loads

  // Build the list of search queries for this era
  const queries = useMemo(() => {
    if (!eraId) return [];
    return buildSearchQueries(eraId);
  }, [eraId]);

  // Reset when era changes
  useEffect(() => {
    setImages([]);
    setQueryIndex(0);
    setContinueToken(null);
    setHasMore(true);
    setFailedImages(new Set());
    loadingRef.current = false;
  }, [eraId]);

  // Load a batch of images
  const loadMore = useCallback(async () => {
    if (loadingRef.current || !hasMore || queries.length === 0) return;
    loadingRef.current = true;
    setLoading(true);

    try {
      let currentQueryIdx = queryIndex;
      let token = continueToken;
      let fetched = [];

      // Try current query, advance to next if exhausted
      while (fetched.length === 0 && currentQueryIdx < queries.length) {
        const result = await fetchCommonsImages(
          queries[currentQueryIdx],
          token
        );
        fetched = result.images;

        if (fetched.length === 0 || !result.continueToken) {
          // Move to next query
          currentQueryIdx += 1;
          token = null;
        } else {
          token = result.continueToken;
        }
      }

      if (fetched.length > 0) {
        setImages((prev) => {
          const existingIds = new Set(prev.map((img) => img.id));
          const newImages = fetched.filter((img) => !existingIds.has(img.id));
          return [...prev, ...newImages];
        });
        setContinueToken(token);
        setQueryIndex(currentQueryIdx);
      } else {
        setHasMore(false);
      }
    } catch (err) {
      console.warn('Vision board image fetch failed:', err);
      // Advance query on error
      setQueryIndex((prev) => prev + 1);
      if (queryIndex + 1 >= queries.length) {
        setHasMore(false);
      }
    } finally {
      setLoading(false);
      loadingRef.current = false;
    }
  }, [hasMore, queries, queryIndex, continueToken]);

  // Initial load
  useEffect(() => {
    if (queries.length > 0 && images.length === 0 && hasMore) {
      loadMore();
    }
  }, [queries]); // eslint-disable-line react-hooks/exhaustive-deps

  // Infinite scroll – detect when user reaches the bottom
  const handleScroll = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;

    const nearBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 400;
    if (nearBottom && hasMore && !loadingRef.current) {
      loadMore();
    }
  }, [hasMore, loadMore]);

  // Handle ESC key
  useEffect(() => {
    function onKeyDown(e) {
      if (e.key === 'Escape') onClose();
    }
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [onClose]);

  // Date string
  const dateString = item
    ? formatDateRange(
        item.startDate,
        item.endDate,
        item.dateCertainty || 'year only',
        item.dateCertainty || 'year only',
        config.eraLabels
      )
    : '';

  const handleImageError = useCallback((imageId) => {
    setFailedImages((prev) => new Set([...prev, imageId]));
  }, []);

  const visibleImages = images.filter((img) => !failedImages.has(img.id));

  return (
    <div className="vision-board-panel">
      {/* Close button */}
      <button
        className="vision-board-close"
        onClick={onClose}
        aria-label="Close vision board"
      >
        &times;
      </button>

      {/* Scrollable content */}
      <div
        className="vision-board-scroll"
        ref={scrollRef}
        onScroll={handleScroll}
      >
        {/* Era header */}
        <div
          className="vision-board-header"
          style={{ borderLeftColor: item?.color || '#00acc1' }}
        >
          <h2 className="vision-board-title">
            {eraData?.title || item?.name}
          </h2>
          {dateString && (
            <p className="vision-board-date">{dateString}</p>
          )}
          {eraData?.summary && (
            <p className="vision-board-summary">{eraData.summary}</p>
          )}
        </div>

        {/* Image grid */}
        <div className="vision-board-grid">
          {visibleImages.map((img) => (
            <a
              key={img.id}
              className="vision-board-card"
              href={img.pageUrl}
              target="_blank"
              rel="noopener noreferrer"
              title={img.title}
            >
              <img
                src={img.thumbUrl}
                alt={img.title}
                loading="lazy"
                onError={() => handleImageError(img.id)}
              />
              <span className="vision-board-card-label">{img.title}</span>
            </a>
          ))}
        </div>

        {/* Loading indicator */}
        {loading && (
          <div className="vision-board-loading">
            <div className="vision-board-spinner" />
            <span>Loading images…</span>
          </div>
        )}

        {/* End-of-feed message */}
        {!hasMore && visibleImages.length > 0 && (
          <p className="vision-board-end">No more images to show.</p>
        )}

        {!hasMore && visibleImages.length === 0 && !loading && (
          <p className="vision-board-end">
            No images found for this era.
          </p>
        )}
      </div>
    </div>
  );
}
