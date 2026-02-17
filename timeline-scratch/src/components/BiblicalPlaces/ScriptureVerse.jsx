import { useState, useEffect } from 'react';
import { fetchVerseText, extractReference } from '../../services/bibleVerseService';

/**
 * Displays a Bible verse fetched dynamically from the NET Bible API.
 *
 * Accepts either:
 *   - `scriptureRef`   — a bare reference like "Genesis 12:1-3"
 *   - `scriptureVerse`  — a value from the DB that may be a bare reference
 *                         or full text with citation (extracts the reference)
 *
 * If both are provided, `scriptureRef` takes priority.
 *
 * Shows a loading shimmer while fetching, then the quoted verse text
 * attributed to the NET translation.
 */
export function ScriptureVerse({ scriptureRef, scriptureVerse }) {
  const [verseData, setVerseData] = useState(null);
  const [loading, setLoading] = useState(false);

  // Determine the reference to fetch
  const reference = scriptureRef || extractReference(scriptureVerse);

  useEffect(() => {
    if (!reference) return;

    let cancelled = false;
    setLoading(true);

    fetchVerseText(reference).then(result => {
      if (!cancelled) {
        setVerseData(result);
        setLoading(false);
      }
    });

    return () => { cancelled = true; };
  }, [reference]);

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
      </blockquote>
    );
  }

  return (
    <blockquote className="bp-verse">
      {verseData.text}
      <cite className="bp-verse-cite">
        {' '}&mdash; {verseData.reference} (NET)
      </cite>
    </blockquote>
  );
}
