import { useMemo } from 'react';
import { HistoricalMap } from '../Timeline/components/HistoricalMap.jsx';
import { WikimediaImageGallery } from './WikimediaImageGallery.jsx';
import './PlaceModal.css';

/**
 * Modal showing a biblical place with people and their events in timeline order.
 */
export function PlaceModal({
  place, events, people, ageMap, eventPeopleMap, sourceMap,
  onSelectEntity, onClose, canGoBack, onBack,
}) {
  if (!place) return null;

  // Build a lookup: person_id -> events at this place involving that person
  const personEventsAtPlace = useMemo(() => {
    const map = new Map();
    events.forEach(ev => {
      const evPeople = eventPeopleMap.get(ev.event_id) || [];
      evPeople.forEach(p => {
        if (!map.has(p.person_id)) map.set(p.person_id, []);
        map.get(p.person_id).push(ev);
      });
    });
    // Sort each person's events by age sort_order, then sort_within_age
    for (const [, evts] of map) {
      evts.sort((a, b) => {
        const ageA = ageMap.get(a.narrative_age_id);
        const ageB = ageMap.get(b.narrative_age_id);
        const orderDiff = (ageA?.sort_order ?? 99) - (ageB?.sort_order ?? 99);
        if (orderDiff !== 0) return orderDiff;
        return (a.sort_within_age ?? 0) - (b.sort_within_age ?? 0);
      });
    }
    return map;
  }, [events, eventPeopleMap, ageMap]);

  // Group people by narrative age, timeline ordered
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

        {place.description && (
          <p className="bp-modal-description">{place.description}</p>
        )}

        {/* Small historical map */}
        <HistoricalMap location={place.name} birthYear={approxYear} />

        {/* People & Events — ordered by narrative timeline */}
        {peopleByAge.length > 0 && (
          <div className="bp-section">
            <h3 className="bp-section-title">People &amp; Events</h3>
            {peopleByAge.map(({ age, people: agePeople }) => (
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
                {agePeople.map((p, i) => {
                  const personEvents = personEventsAtPlace.get(p.person_id) || [];
                  return (
                    <div key={`${p.person_id}-${i}`} className="bp-person-card">
                      <button
                        className="bp-person-name-btn"
                        onClick={() => onSelectEntity('person', p.person_id)}
                      >
                        {p.name}
                      </button>
                      {p.context && (
                        <span className="bp-person-context">{p.context}</span>
                      )}

                      {/* Events this person was involved in at this place */}
                      {personEvents.length > 0 && (
                        <div className="bp-person-events">
                          {personEvents.map(ev => (
                            <div key={ev.event_id} className="bp-person-event-item">
                              <button
                                className="bp-person-event-title"
                                onClick={() => onSelectEntity('event', ev.event_id)}
                              >
                                {ev.name}
                              </button>
                              {ev.scripture_ref && (
                                <span className="bp-scripture-ref">{ev.scripture_ref}</span>
                              )}
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Scripture verse from person-place connection */}
                      {p.scripture_verse && (
                        <blockquote className="bp-verse">
                          {p.scripture_verse}
                        </blockquote>
                      )}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        )}

        {/* Image gallery from Wikimedia Commons */}
        <div className="bp-section">
          <h3 className="bp-section-title">Image Gallery</h3>
          <WikimediaImageGallery
            placeName={place.name}
            lat={place.lat}
            lng={place.lng}
            region={place.region}
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
