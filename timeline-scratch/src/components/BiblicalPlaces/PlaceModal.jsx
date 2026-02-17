import { useMemo } from 'react';
import './PlaceModal.css';
import { ScriptureVerse } from './ScriptureVerse';

function formatYear(year) {
  if (year == null) return '';
  if (year < 0) return `${Math.abs(year)} BC`;
  if (year === 0) return '1 BC';
  return `${year} AD`;
}

function formatYearRange(age) {
  if (!age || age.approx_start_year == null || age.approx_end_year == null) return '';
  return `${formatYear(age.approx_start_year)}\u2013${formatYear(age.approx_end_year)}`;
}

/**
 * Side panel content showing a biblical place with people and their events.
 *
 * When a narrative age is selected, the panel shows:
 *   - Period-specific name + year range in the title
 *   - Age-specific summary text
 *   - "During" section (focus), then "Before" and "After" sections
 *   - Prev/next age navigation arrows
 *
 * When no age is selected, shows the default view with all events/people
 * in chronological order (grouped by age).
 */
export function PlaceModal({
  place, events, people, ageMap, eventPeopleMap, sourceMap,
  ages, activeAgeFilter, placeNamesMap, placeAgeSummariesMap,
  onAgeChange, onSelectEntity, onClose,
}) {
  if (!place) return null;

  const selectedAge = activeAgeFilter ? ageMap.get(activeAgeFilter) : null;

  // Period-specific display name for the place
  const displayName = useMemo(() => {
    if (!selectedAge) return place.name;
    const namesForPlace = placeNamesMap?.get(place.place_id);
    return namesForPlace?.get(selectedAge.age_id) || place.name;
  }, [place, selectedAge, placeNamesMap]);

  // Age-specific summary text
  const ageSummary = useMemo(() => {
    if (!selectedAge) return null;
    const summariesForPlace = placeAgeSummariesMap?.get(place.place_id);
    return summariesForPlace?.get(selectedAge.age_id) || null;
  }, [place, selectedAge, placeAgeSummariesMap]);

  // Prev/next age navigation
  const { prevAge, nextAge } = useMemo(() => {
    if (!selectedAge || !ages || ages.length === 0) return { prevAge: null, nextAge: null };
    const idx = ages.findIndex(a => a.age_id === selectedAge.age_id);
    return {
      prevAge: idx > 0 ? ages[idx - 1] : null,
      nextAge: idx < ages.length - 1 ? ages[idx + 1] : null,
    };
  }, [selectedAge, ages]);

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

  // When an age is selected, split into before / during / after
  const { beforeGroups, duringGroup, afterGroups } = useMemo(() => {
    if (!selectedAge) return { beforeGroups: [], duringGroup: null, afterGroups: [] };
    const selOrder = selectedAge.sort_order;
    const before = [];
    const after = [];
    let during = null;
    for (const group of peopleByAge) {
      const groupOrder = group.age?.sort_order ?? 99;
      if (groupOrder < selOrder) before.push(group);
      else if (groupOrder === selOrder) during = group;
      else after.push(group);
    }
    return { beforeGroups: before, duringGroup: during, afterGroups: after };
  }, [selectedAge, peopleByAge]);

  // Events split by age (for the "during" focus when age is selected)
  const { beforeEvents, duringEvents, afterEvents } = useMemo(() => {
    if (!selectedAge) return { beforeEvents: [], duringEvents: [], afterEvents: [] };
    const selOrder = selectedAge.sort_order;
    const before = [];
    const during = [];
    const after = [];
    for (const ev of events) {
      const evAge = ageMap.get(ev.narrative_age_id);
      const evOrder = evAge?.sort_order ?? 99;
      if (evOrder < selOrder) before.push(ev);
      else if (evOrder === selOrder) during.push(ev);
      else after.push(ev);
    }
    return { beforeEvents: before, duringEvents: during, afterEvents: after };
  }, [selectedAge, events, ageMap]);

  const sources = sourceMap.get(place.place_id) || [];

  // ── Render helpers ──────────────────────────────────────────────────────

  function renderPersonCard(p, i, filterAgeId) {
    let personEvents = personEventsAtPlace.get(p.person_id) || [];
    if (filterAgeId) {
      personEvents = personEvents.filter(ev => ev.narrative_age_id === filterAgeId);
    }
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
        <ScriptureVerse scriptureVerse={p.scripture_verse} />
      </div>
    );
  }

  function renderAgeGroup({ age, people: agePeople }, idx, filterAgeId) {
    return (
      <div key={age?.age_id || `unknown-${idx}`} className="bp-age-group">
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
        {agePeople.map((p, i) => renderPersonCard(p, i, filterAgeId))}
      </div>
    );
  }

  // ── No age selected: default chronological view ─────────────────────────

  if (!selectedAge) {
    return (
      <div className="bp-panel-content">
        <div className="bp-modal-header">
          <button className="bp-modal-close" onClick={onClose}>&times;</button>
        </div>

        <h2 className="bp-modal-title">{place.name}</h2>
        {place.region && (
          <p className="bp-modal-subtitle">{place.region}</p>
        )}
        {place.description && (
          <p className="bp-modal-description">{place.description}</p>
        )}

        {peopleByAge.length > 0 && (
          <div className="bp-section">
            <h3 className="bp-section-title">People &amp; Events</h3>
            {peopleByAge.map((group, idx) => renderAgeGroup(group, idx, null))}
          </div>
        )}

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
    );
  }

  // ── Age selected: contextual view ───────────────────────────────────────

  return (
    <div className="bp-panel-content">
      {/* Header: prev/next age nav + close */}
      <div className="bp-modal-header">
        <div className="bp-age-nav">
          {prevAge ? (
            <button
              className="bp-age-nav-btn bp-age-nav-prev"
              onClick={() => onAgeChange(prevAge.age_id)}
              title={prevAge.name}
            >
              <span className="bp-age-nav-arrow">&larr;</span>
              <span className="bp-age-nav-label">{prevAge.name}</span>
            </button>
          ) : (
            <span className="bp-age-nav-spacer" />
          )}
          {nextAge ? (
            <button
              className="bp-age-nav-btn bp-age-nav-next"
              onClick={() => onAgeChange(nextAge.age_id)}
              title={nextAge.name}
            >
              <span className="bp-age-nav-label">{nextAge.name}</span>
              <span className="bp-age-nav-arrow">&rarr;</span>
            </button>
          ) : (
            <span className="bp-age-nav-spacer" />
          )}
        </div>
        <button className="bp-modal-close" onClick={onClose}>&times;</button>
      </div>

      {/* Title: period name + age badge + year range */}
      <h2 className="bp-modal-title">{displayName}</h2>
      <div className="bp-modal-age-context">
        <span
          className="bp-age-badge"
          style={{ backgroundColor: selectedAge.color || '#8b7355' }}
        >
          {selectedAge.name}
        </span>
        <span className="bp-modal-year-range">{formatYearRange(selectedAge)}</span>
      </div>
      {place.region && (
        <p className="bp-modal-subtitle">{place.region}</p>
      )}

      {/* Age-specific summary, falling back to default description */}
      {(ageSummary || place.description) && (
        <p className="bp-modal-description">
          {ageSummary || place.description}
        </p>
      )}

      {/* ── During: focus section ─────────────────────────────────────── */}
      {(duringGroup || duringEvents.length > 0) && (
        <div className="bp-section bp-section-during">
          <h3 className="bp-section-title">
            During {selectedAge.name}
          </h3>
          {duringGroup && renderAgeGroup(duringGroup, 0, selectedAge.age_id)}
          {/* Events not tied to any person in this age */}
          {duringEvents.filter(ev => {
            const evPeople = eventPeopleMap.get(ev.event_id) || [];
            return evPeople.length === 0;
          }).map(ev => (
            <div key={ev.event_id} className="bp-event-card">
              <button
                className="bp-event-name"
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

      {/* Empty state for this age */}
      {!duringGroup && duringEvents.length === 0 && (
        <div className="bp-section bp-section-during">
          <h3 className="bp-section-title">
            During {selectedAge.name}
          </h3>
          <p className="bp-empty-message">
            No recorded events at {place.name} during this period.
          </p>
        </div>
      )}

      {/* ── Before ────────────────────────────────────────────────────── */}
      {beforeGroups.length > 0 && (
        <div className="bp-section bp-section-context">
          <h3 className="bp-section-title">Before</h3>
          {beforeGroups.map((group, idx) => renderAgeGroup(group, idx, null))}
        </div>
      )}

      {/* ── After ─────────────────────────────────────────────────────── */}
      {afterGroups.length > 0 && (
        <div className="bp-section bp-section-context">
          <h3 className="bp-section-title">After</h3>
          {afterGroups.map((group, idx) => renderAgeGroup(group, idx, null))}
        </div>
      )}

      {/* ── Sources ───────────────────────────────────────────────────── */}
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
  );
}
