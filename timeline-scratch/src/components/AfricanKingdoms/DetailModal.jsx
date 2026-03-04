import './DetailModal.css';

function formatYear(year) {
  if (year == null) return '';
  if (year < 0) return `${Math.abs(year)} BC`;
  if (year === 0) return '1 BC';
  return `${year} AD`;
}

function formatYearRange(start, end) {
  if (start == null && end == null) return '';
  return `${formatYear(start)} – ${formatYear(end)}`;
}

export function DetailModal({ item, type, onClose, onSelectEntity, data }) {
  if (!item) return null;

  const { kingdomMap, placeMap, eraMap, personMap,
          kingdomPeopleMap, kingdomEventsMap, kingdomPlacesMap,
          placeEventsMap, placeKingdomsMap, eventPeopleMap,
          personEventsMap, sourceMap } = data || {};

  const sources = sourceMap?.get(item[type + '_id'] || item.kingdom_id || item.place_id || item.person_id || item.event_id) || [];

  return (
    <div className="ak-modal-overlay" onClick={onClose}>
      <div className="ak-modal" onClick={e => e.stopPropagation()}>
        <button className="ak-modal-close" onClick={onClose} aria-label="Close">&times;</button>

        {type === 'kingdom' && <KingdomDetail item={item} eraMap={eraMap} placeMap={placeMap}
          kingdomPeopleMap={kingdomPeopleMap} kingdomEventsMap={kingdomEventsMap} kingdomPlacesMap={kingdomPlacesMap}
          onSelect={onSelectEntity} sources={sources} />}

        {type === 'place' && <PlaceDetail item={item} placeEventsMap={placeEventsMap}
          placeKingdomsMap={placeKingdomsMap} onSelect={onSelectEntity} sources={sources} />}

        {type === 'person' && <PersonDetail item={item} kingdomMap={kingdomMap}
          personEventsMap={personEventsMap} onSelect={onSelectEntity} sources={sources} />}

        {type === 'event' && <EventDetail item={item} kingdomMap={kingdomMap} placeMap={placeMap}
          eventPeopleMap={eventPeopleMap} onSelect={onSelectEntity} sources={sources} />}
      </div>
    </div>
  );
}

function KingdomDetail({ item, eraMap, placeMap, kingdomPeopleMap, kingdomEventsMap, kingdomPlacesMap, onSelect, sources }) {
  const era = eraMap?.get(item.era_id);
  const capital = placeMap?.get(item.capital_place_id);
  const people = kingdomPeopleMap?.get(item.kingdom_id) || [];
  const events = kingdomEventsMap?.get(item.kingdom_id) || [];
  const places = kingdomPlacesMap?.get(item.kingdom_id) || [];

  return (
    <>
      <div className="ak-modal-header" style={{ borderLeftColor: item.color || '#8b7355' }}>
        <span className="ak-modal-type-badge">Kingdom</span>
        <h2>{item.name}</h2>
        <p className="ak-modal-dates">{formatYearRange(item.start_year, item.end_year)}</p>
        {era && <p className="ak-modal-era"><span className="ak-era-dot" style={{ backgroundColor: era.color }} />{era.name}</p>}
        {item.region && <p className="ak-modal-region">{item.region}</p>}
      </div>
      {item.description && <p className="ak-modal-description">{item.description}</p>}
      {capital && (
        <div className="ak-modal-section">
          <h3>Capital</h3>
          <button className="ak-entity-link" onClick={() => onSelect?.('place', capital)}>{capital.name}</button>
        </div>
      )}
      {people.length > 0 && (
        <div className="ak-modal-section">
          <h3>Notable Figures</h3>
          <ul className="ak-entity-list">
            {people.map(p => (
              <li key={p.person_id}>
                <button className="ak-entity-link" onClick={() => onSelect?.('person', p)}>{p.name}</button>
                {p.reign_start_year && <span className="ak-meta"> ({formatYearRange(p.reign_start_year, p.reign_end_year)})</span>}
              </li>
            ))}
          </ul>
        </div>
      )}
      {events.length > 0 && (
        <div className="ak-modal-section">
          <h3>Key Events</h3>
          <ul className="ak-entity-list">
            {events.sort((a, b) => a.event_year - b.event_year).map(ev => (
              <li key={ev.event_id}>
                <button className="ak-entity-link" onClick={() => onSelect?.('event', ev)}>{ev.name}</button>
                <span className="ak-meta"> ({formatYear(ev.event_year)})</span>
              </li>
            ))}
          </ul>
        </div>
      )}
      {places.length > 0 && (
        <div className="ak-modal-section">
          <h3>Important Places</h3>
          <ul className="ak-entity-list">
            {places.map(p => (
              <li key={p.place_id}>
                <button className="ak-entity-link" onClick={() => onSelect?.('place', p)}>{p.name}</button>
                {p.relationship && <span className="ak-meta"> — {p.relationship}</span>}
              </li>
            ))}
          </ul>
        </div>
      )}
      <SourcesAndLinks sources={sources} referenceUrl={item.reference_url} />
    </>
  );
}

function PlaceDetail({ item, placeEventsMap, placeKingdomsMap, onSelect, sources }) {
  const events = placeEventsMap?.get(item.place_id) || [];
  const kingdoms = placeKingdomsMap?.get(item.place_id) || [];

  return (
    <>
      <div className="ak-modal-header" style={{ borderLeftColor: '#8b7355' }}>
        <span className="ak-modal-type-badge">{item.place_type || 'Place'}</span>
        <h2>{item.name}</h2>
        {item.region && <p className="ak-modal-region">{item.region}</p>}
      </div>
      {item.description && <p className="ak-modal-description">{item.description}</p>}
      {kingdoms.length > 0 && (
        <div className="ak-modal-section">
          <h3>Connected Kingdoms</h3>
          <ul className="ak-entity-list">
            {kingdoms.map(k => (
              <li key={k.kingdom_id}>
                <button className="ak-entity-link" onClick={() => onSelect?.('kingdom', k)}>{k.name}</button>
                <span className="ak-meta"> ({formatYearRange(k.start_year, k.end_year)})</span>
              </li>
            ))}
          </ul>
        </div>
      )}
      {events.length > 0 && (
        <div className="ak-modal-section">
          <h3>Events at this Location</h3>
          <ul className="ak-entity-list">
            {events.sort((a, b) => a.event_year - b.event_year).map(ev => (
              <li key={ev.event_id}>
                <button className="ak-entity-link" onClick={() => onSelect?.('event', ev)}>{ev.name}</button>
                <span className="ak-meta"> ({formatYear(ev.event_year)})</span>
              </li>
            ))}
          </ul>
        </div>
      )}
      <SourcesAndLinks sources={sources} referenceUrl={item.reference_url} />
    </>
  );
}

function PersonDetail({ item, kingdomMap, personEventsMap, onSelect, sources }) {
  const kingdom = item.kingdom_id ? kingdomMap?.get(item.kingdom_id) : null;
  const events = personEventsMap?.get(item.person_id) || [];

  return (
    <>
      <div className="ak-modal-header" style={{ borderLeftColor: kingdom?.color || '#8b7355' }}>
        <span className="ak-modal-type-badge">{item.role || 'Person'}</span>
        <h2>{item.name}</h2>
        {(item.birth_year || item.death_year) && (
          <p className="ak-modal-dates">{formatYearRange(item.birth_year, item.death_year)}</p>
        )}
        {(item.reign_start_year || item.reign_end_year) && (
          <p className="ak-modal-era">Reigned: {formatYearRange(item.reign_start_year, item.reign_end_year)}</p>
        )}
      </div>
      {item.description && <p className="ak-modal-description">{item.description}</p>}
      {kingdom && (
        <div className="ak-modal-section">
          <h3>Kingdom</h3>
          <button className="ak-entity-link" onClick={() => onSelect?.('kingdom', kingdom)}>
            <span className="ak-era-dot" style={{ backgroundColor: kingdom.color }} />{kingdom.name}
          </button>
        </div>
      )}
      {events.length > 0 && (
        <div className="ak-modal-section">
          <h3>Related Events</h3>
          <ul className="ak-entity-list">
            {events.sort((a, b) => a.event_year - b.event_year).map(ev => (
              <li key={ev.event_id}>
                <button className="ak-entity-link" onClick={() => onSelect?.('event', ev)}>{ev.name}</button>
                <span className="ak-meta"> ({formatYear(ev.event_year)})</span>
              </li>
            ))}
          </ul>
        </div>
      )}
      <SourcesAndLinks sources={sources} referenceUrl={item.reference_url} />
    </>
  );
}

function EventDetail({ item, kingdomMap, placeMap, eventPeopleMap, onSelect, sources }) {
  const kingdom = item.kingdom_id ? kingdomMap?.get(item.kingdom_id) : null;
  const place = item.place_id ? placeMap?.get(item.place_id) : null;
  const people = eventPeopleMap?.get(item.event_id) || [];

  return (
    <>
      <div className="ak-modal-header" style={{ borderLeftColor: kingdom?.color || '#8b7355' }}>
        <span className="ak-modal-type-badge">{item.event_type || 'Event'}</span>
        <h2>{item.name}</h2>
        <p className="ak-modal-dates">{formatYear(item.event_year)}</p>
      </div>
      {item.description && <p className="ak-modal-description">{item.description}</p>}
      {kingdom && (
        <div className="ak-modal-section">
          <h3>Kingdom</h3>
          <button className="ak-entity-link" onClick={() => onSelect?.('kingdom', kingdom)}>
            <span className="ak-era-dot" style={{ backgroundColor: kingdom.color }} />{kingdom.name}
          </button>
        </div>
      )}
      {place && (
        <div className="ak-modal-section">
          <h3>Location</h3>
          <button className="ak-entity-link" onClick={() => onSelect?.('place', place)}>{place.name}</button>
        </div>
      )}
      {people.length > 0 && (
        <div className="ak-modal-section">
          <h3>People Involved</h3>
          <ul className="ak-entity-list">
            {people.map(p => (
              <li key={p.person_id}>
                <button className="ak-entity-link" onClick={() => onSelect?.('person', p)}>{p.name}</button>
              </li>
            ))}
          </ul>
        </div>
      )}
      <SourcesAndLinks sources={sources} referenceUrl={item.reference_url} />
    </>
  );
}

function SourcesAndLinks({ sources, referenceUrl }) {
  if (!referenceUrl && (!sources || sources.length === 0)) return null;
  return (
    <div className="ak-modal-section ak-sources-section">
      {referenceUrl && (
        <a className="ak-reference-link" href={referenceUrl} target="_blank" rel="noopener noreferrer">
          Learn more &rarr;
        </a>
      )}
      {sources.length > 0 && (
        <>
          <h3>Sources</h3>
          <ul className="ak-source-list">
            {sources.map(s => (
              <li key={s.source_id}>
                {s.url ? <a href={s.url} target="_blank" rel="noopener noreferrer">{s.title}</a> : s.title}
                {s.author && <span className="ak-meta"> — {s.author}</span>}
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}
