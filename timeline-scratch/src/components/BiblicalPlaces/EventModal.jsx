import './PlaceModal.css';
import { ScriptureVerse } from './ScriptureVerse';

/**
 * Side panel content showing a biblical event with its place, people, and narrative context.
 */
export function EventModal({
  event, people, ageMap, placeMap, sourceMap,
  onSelectEntity, onClose, canGoBack, onBack,
}) {
  if (!event) return null;

  const age = ageMap.get(event.narrative_age_id);
  const place = event.place_id ? placeMap.get(event.place_id) : null;
  const sources = sourceMap.get(event.event_id) || [];

  return (
    <div className="bp-panel-content">
      {/* Header */}
      <div className="bp-modal-header">
        {canGoBack && (
          <button className="bp-modal-back" onClick={onBack} title="Back">
            &larr;
          </button>
        )}
        <button className="bp-modal-close" onClick={onClose}>&times;</button>
      </div>

      <h2 className="bp-modal-title">{event.name}</h2>

      {/* Age badge and event type */}
      <div className="bp-event-meta">
        {age && (
          <span
            className="bp-age-badge"
            style={{ backgroundColor: age.color || '#8b7355' }}
          >
            {age.name}
          </span>
        )}
        {event.event_type !== 'event' && (
          <span className="bp-event-type">{event.event_type}</span>
        )}
      </div>

      {event.scripture_ref && (
        <p className="bp-scripture-ref bp-modal-subtitle">{event.scripture_ref}</p>
      )}

      <ScriptureVerse scriptureRef={event.scripture_ref} placeName={place?.name} />

      {event.description && (
        <p className="bp-modal-description">{event.description}</p>
      )}

      {/* Place link */}
      {place && (
        <div className="bp-section">
          <h3 className="bp-section-title">Location</h3>
          <button
            className="bp-pill"
            onClick={() => onSelectEntity('place', place.place_id)}
          >
            {place.name}
            {place.region && <span className="bp-pill-context"> &mdash; {place.region}</span>}
          </button>
        </div>
      )}

      {/* People involved */}
      {people.length > 0 && (
        <div className="bp-section">
          <h3 className="bp-section-title">People Involved</h3>
          <div className="bp-pill-list">
            {people.map(p => (
              <button
                key={p.person_id}
                className="bp-pill"
                onClick={() => onSelectEntity('person', p.person_id)}
              >
                {p.name}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Sources */}
      {sources.length > 0 && (
        <div className="bp-section bp-sources">
          <h3 className="bp-section-title">Sources</h3>
          <ul className="bp-source-list">
            {sources.map(s => (
              <li key={s.source_id}>
                {s.url ? (
                  <a href={s.url} target="_blank" rel="noopener noreferrer">{s.title}</a>
                ) : (
                  s.title
                )}
                {s.source_name && <span className="bp-source-name"> &mdash; {s.source_name}</span>}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Reference URL */}
      {event.reference_url && (
        <div className="bp-section">
          <a
            href={event.reference_url}
            target="_blank"
            rel="noopener noreferrer"
            className="bp-reference-link"
          >
            Learn more &rarr;
          </a>
        </div>
      )}
    </div>
  );
}
