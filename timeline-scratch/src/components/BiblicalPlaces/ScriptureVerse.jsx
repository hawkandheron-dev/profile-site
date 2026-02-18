import { useState, useEffect, useMemo } from 'react';
import { fetchVerseText, extractReference, buildBibleUrl } from '../../services/bibleVerseService';

const MAX_VERSES_COLLAPSED = 3;

/**
 * Displays a Bible verse fetched dynamically from the NET Bible API.
 *
 * Accepts either:
 *   - `scriptureRef`   — a bare reference like "Genesis 12:1-3"
 *   - `scriptureVerse`  — a value from the DB that may be a bare reference
 *                         or full text with citation (extracts the reference)
 *
 * Features:
 *   - Truncates to 3 verses by default with "Show more" toggle
 *   - Bolds the place name wherever it appears in the verse text
 *   - External link icon next to citation → BibleHub interlinear
 */
export function ScriptureVerse({ scriptureRef, scriptureVerse, placeName }) {
  const [verseData, setVerseData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [expanded, setExpanded] = useState(false);

  // Determine the reference to fetch
  const reference = scriptureRef || extractReference(scriptureVerse);

  useEffect(() => {
    if (!reference) return;

    let cancelled = false;
    setLoading(true);
    setExpanded(false);

    fetchVerseText(reference).then(result => {
      if (!cancelled) {
        setVerseData(result);
        setLoading(false);
      }
    });

    return () => { cancelled = true; };
  }, [reference]);

  const bibleUrl = useMemo(() => buildBibleUrl(reference), [reference]);

  if (!reference) return null;

  if (loading) {
    return (
      <blockquote className="bp-verse bp-verse-loading">
        <span className="bp-verse-shimmer" />
      </blockquote>
    );
  }

  if (!verseData) {
    // Fallback: show just the reference if the API call failed
    return (
      <blockquote className="bp-verse bp-verse-ref-only">
        {reference}
        {bibleUrl && (
          <a href={bibleUrl} target="_blank" rel="noopener noreferrer" className="bp-verse-linkout" title="Open in BibleHub">
            <LinkOutIcon />
          </a>
        )}
      </blockquote>
    );
  }

  const { verses } = verseData;
  const isTruncatable = verses.length > MAX_VERSES_COLLAPSED;
  const displayVerses = expanded ? verses : verses.slice(0, MAX_VERSES_COLLAPSED);

  return (
    <blockquote className="bp-verse">
      <span className="bp-verse-text">
        {displayVerses.map((v, i) => (
          <span key={i}>
            {i > 0 && ' '}
            <VerseText text={v.text} placeName={placeName} />
          </span>
        ))}
        {isTruncatable && !expanded && '\u2026'}
      </span>
      {isTruncatable && (
        <button
          className="bp-verse-toggle"
          onClick={() => setExpanded(prev => !prev)}
        >
          {expanded ? 'Show less' : `Show ${verses.length - MAX_VERSES_COLLAPSED} more verse${verses.length - MAX_VERSES_COLLAPSED > 1 ? 's' : ''}`}
        </button>
      )}
      <cite className="bp-verse-cite">
        &mdash; {verseData.reference} (NET)
        {bibleUrl && (
          <a href={bibleUrl} target="_blank" rel="noopener noreferrer" className="bp-verse-linkout" title="Open in BibleHub">
            <LinkOutIcon />
          </a>
        )}
      </cite>
    </blockquote>
  );
}

/**
 * Renders verse text with place name bolded wherever it appears.
 */
function VerseText({ text, placeName }) {
  if (!placeName || !text) return text;

  // Build a list of name variants to match (e.g. "Mount Moriah" and "Moriah")
  const names = new Set();
  names.add(placeName);
  // Also try without common prefixes
  for (const prefix of ['Mount ', 'Mt. ', 'Lake ', 'Sea of ', 'Brook ', 'Valley of ', 'Plains of ', 'Wilderness of ']) {
    if (placeName.startsWith(prefix)) {
      names.add(placeName.slice(prefix.length));
    }
  }

  // Build a single regex matching any variant (case-insensitive, word-boundary)
  const escaped = Array.from(names).map(n => n.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
  const pattern = new RegExp(`\\b(${escaped.join('|')})\\b`, 'gi');

  const parts = text.split(pattern);
  if (parts.length === 1) return text;

  return parts.map((part, i) => {
    if (pattern.test(part)) {
      // Reset lastIndex since we're using 'g' flag
      pattern.lastIndex = 0;
      return <strong key={i} className="bp-verse-place">{part}</strong>;
    }
    return part;
  });
}

function LinkOutIcon() {
  return (
    <svg
      className="bp-verse-linkout-icon"
      width="12"
      height="12"
      viewBox="0 0 12 12"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path
        d="M9 6.5V10a1 1 0 0 1-1 1H2a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h3.5M7 1h4v4M5 7l6-6"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
