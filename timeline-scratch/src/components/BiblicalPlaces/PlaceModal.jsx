import { useMemo } from 'react';
import { HistoricalMap } from '../Timeline/components/HistoricalMap.jsx';
import { VideoEmbed } from './VideoEmbed.jsx';
import { WikimediaImageGallery } from './WikimediaImageGallery.jsx';
import './PlaceModal.css';

/**
 * Modal showing a biblical place with its narrative timeline of events and people.
 */
export function PlaceModal({
  place, events, people, ageMap, eventPeopleMap, sourceMap, resourceMap,
  onSelectEntity, onClose, canGoBack, onBack,
}) {
  if (!place) return null;

  // Group events by narrative age
  const eventsByAge = useMemo(() => {
    const groups = new Map();
    events.forEach(ev => {
      const ageId = ev.narrative_age_id;
      if (!groups.has(ageId)) groups.set(ageId, []);
      groups.get(ageId).push(ev);
    });
    return Array.from(groups.entries())
      .map(([ageId, evts]) => ({
        age: ageMap.get(ageId),
        events: evts.sort((a, b) => (a.sort_within_age ?? 0) - (b.sort_within_age ?? 0)),
      }))
      .sort((a, b) => (a.age?.sort_order ?? 99) - (b.age?.sort_order ?? 99));
  }, [events, ageMap]);

  // Group people by narrative age
  const peopleByAge = useMemo(() => {
    const groups = new Map();
    people.forEach(p => {
      const ageId = p.age?.age_id || 'unknown';
      if (!groups.has(ageId)) groups.set(ageId, []);
      groups.get(ageId).push(p);
    });
    return Array.from(groups.entries())
      .map(([ageId, ppl]) => ({
        age: ageMap.get(ageId),
        people: ppl,
      }))
      .sort((a, b) => (a.age?.sort_order ?? 99) - (b.age?.sort_order ?? 99));
  }, [people, ageMap]);

  const sources = sourceMap.get(place.place_id) || [];
  const resources = resourceMap?.get(place.place_id) || [];

  // Use the earliest event's age for OHM date
  const approxYear = events.length > 0
    ? ageMap.get(events[0].narrative_age_id)?.approx_start_year ?? null
    : null;

  return (
    <div className="bp-modal" onClick={onClose}>
      <div className="bp-modal-backdrop" />
      <div className="bp-modal-content" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="bp-modal-header">
          {canGoBack && (
            <button className="bp-modal-back" onClick={onBack} title="Back">
              &larr;
            </button>
          )}
          <button className="bp-modal-close" onClick={onClose}>&times;</button>
        </div>

        <h2 className="bp-modal-title">{place.name}</h2>
        {place.region && (
          <p className="bp-modal-subtitle">{place.region}</p>
        )}

        {/* BibleProject video embed */}
        <VideoEmbed resources={resources} />

        {place.description && (
          <p className="bp-modal-description">{place.description}</p>
        )}

        {/* Small historical map */}
        <HistoricalMap location={place.name} birthYear={approxYear} />

        {/* Narrative Timeline: events grouped by age */}
        {eventsByAge.length > 0 && (
          <div className="bp-section">
            <h3 className="bp-section-title">Narrative Timeline</h3>
            {eventsByAge.map(({ age, events: ageEvents }) => (
              <div key={age?.age_id || 'unknown'} className="bp-age-group">
                <div className="bp-age-header">
                  <span
                    className="bp-age-badge"
                    style={{ backgroundColor: age?.color || '#8b7355' }}
                  >
                    {age?.name || 'Unknown'}
                  </span>
                  {age?.scripture_range && (
                    <span className="bp-age-scripture">{age.scripture_range}</span>
                  )}
                </div>
                {ageEvents.map(ev => {
                  const evPeople = eventPeopleMap.get(ev.event_id) || [];
                  return (
                    <div key={ev.event_id} className="bp-event-card">
                      <button
                        className="bp-event-name"
                        onClick={() => onSelectEntity('event', ev.event_id)}
                      >
                        {ev.name}
                      </button>
                      {ev.event_type !== 'event' && (
                        <span className="bp-event-type">{ev.event_type}</span>
                      )}
                      {ev.scripture_ref && (
                        <span className="bp-scripture-ref">{ev.scripture_ref}</span>
                      )}
                      {ev.description && (
                        <p className="bp-event-desc">{ev.description}</p>
                      )}
                      {evPeople.length > 0 && (
                        <div className="bp-pill-list">
                          {evPeople.map(p => (
                            <button
                              key={p.person_id}
                              className="bp-pill"
                              onClick={() => onSelectEntity('person', p.person_id)}
                            >
                              {p.name}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        )}

        {/* People associated with this place */}
        {peopleByAge.length > 0 && (
          <div className="bp-section">
            <h3 className="bp-section-title">People Associated</h3>
            {peopleByAge.map(({ age, people: agePeople }) => (
              <div key={age?.age_id || 'unknown'} className="bp-age-group">
                <div className="bp-age-header">
                  <span
                    className="bp-age-badge"
                    style={{ backgroundColor: age?.color || '#8b7355' }}
                  >
                    {age?.name || 'Unknown'}
                  </span>
                </div>
                {agePeople.map((p, i) => (
                  <div key={`${p.person_id}-${i}`} className="bp-person-card">
                    <button
                      className="bp-pill"
                      onClick={() => onSelectEntity('person', p.person_id)}
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
            ))}
          </div>
        )}

        {/* Image gallery from Wikimedia Commons */}
        <div className="bp-section">
          <h3 className="bp-section-title">Historical Images</h3>
          <WikimediaImageGallery
            placeName={place.name}
            lat={place.lat}
            lng={place.lng}
          />
        </div>

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
        {place.reference_url && (
          <div className="bp-section">
            <a
              href={place.reference_url}
              target="_blank"
              rel="noopener noreferrer"
              className="bp-reference-link"
            >
              Learn more &rarr;
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
