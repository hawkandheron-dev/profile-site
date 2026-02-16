import './PlaceModal.css';

/**
 * Side panel content showing a biblical person with their places, events, and narrative ages.
 */
export function PersonModal({
  person, ages, places, events, ageMap, placeMap, sourceMap,
  onSelectEntity, onClose, canGoBack, onBack,
}) {
  if (!person) return null;

  const sources = sourceMap.get(person.person_id) || [];

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

      <h2 className="bp-modal-title">{person.name}</h2>

      {/* Narrative age badges */}
      {ages.length > 0 && (
        <div className="bp-age-badges">
          {ages.map(age => (
            <span
              key={age.age_id}
              className={`bp-age-badge ${age.is_primary ? 'bp-age-badge-primary' : ''}`}
              style={{ backgroundColor: age.color || '#8b7355' }}
            >
              {age.name}
            </span>
          ))}
        </div>
      )}

      {person.scripture_refs && (
        <p className="bp-modal-subtitle bp-scripture-ref">{person.scripture_refs}</p>
      )}

      {person.description && (
        <p className="bp-modal-description">{person.description}</p>
      )}

      {/* Places */}
      {places.length > 0 && (
        <div className="bp-section">
          <h3 className="bp-section-title">Places</h3>
          {places.map((p, i) => (
            <div key={`${p.place_id}-${i}`} className="bp-person-card">
              <button
                className="bp-pill"
                onClick={() => onSelectEntity('place', p.place_id)}
              >
                {p.name}
                {p.context && (
                  <span className="bp-pill-context"> &mdash; {p.context}</span>
                )}
              </button>
              {p.scripture_verse && (
                <blockquote className="bp-verse">
                  {p.scripture_verse}
                </blockquote>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Events */}
      {events.length > 0 && (
        <div className="bp-section">
          <h3 className="bp-section-title">Events</h3>
          {events.map(ev => {
            const age = ageMap.get(ev.narrative_age_id);
            const place = ev.place_id ? placeMap.get(ev.place_id) : null;
            return (
              <div key={ev.event_id} className="bp-event-card">
                <button
                  className="bp-event-name"
                  onClick={() => onSelectEntity('event', ev.event_id)}
                >
                  {ev.name}
                </button>
                {age && (
                  <span
                    className="bp-age-badge bp-age-badge-sm"
                    style={{ backgroundColor: age.color || '#8b7355' }}
                  >
                    {age.name}
                  </span>
                )}
                {place && (
                  <button
                    className="bp-pill bp-pill-sm"
                    onClick={() => onSelectEntity('place', place.place_id)}
                  >
                    {place.name}
                  </button>
                )}
                {ev.scripture_ref && (
                  <span className="bp-scripture-ref">{ev.scripture_ref}</span>
                )}
              </div>
            );
          })}
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
      {person.reference_url && (
        <div className="bp-section">
          <a
            href={person.reference_url}
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
