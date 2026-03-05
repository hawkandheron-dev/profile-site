import { AKImageGallery } from './AKImageGallery.jsx';
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

/** Extract a human-readable domain from a URL */
function getRefDomain(url) {
  try {
    const host = new URL(url).hostname.replace(/^www\./, '');
    if (host.includes('wikipedia')) return 'Wikipedia';
    if (host.includes('britannica')) return 'Britannica';
    if (host.includes('worldhistory')) return 'World History Encyclopedia';
    return host;
  } catch { return 'Reference'; }
}

export function DetailModal({ item, type, onClose, onSelectEntity, data, onSetMapYear }) {
  if (!item) return null;

  const { kingdomMap, placeMap, eraMap, personMap, landmarkMap,
          kingdomPeopleMap, kingdomEventsMap, kingdomPlacesMap,
          placeLandmarksMap, kingdomLandmarksMap,
          placeEventsMap, placeKingdomsMap, eventPeopleMap,
          personEventsMap, sourceMap } = data || {};

  const sources = sourceMap?.get(item[type + '_id'] || item.kingdom_id || item.place_id || item.person_id || item.event_id) || [];

  return (
    <div className="ak-modal-panel" onClick={e => e.stopPropagation()}>
      <button className="ak-modal-close" onClick={onClose} aria-label="Close">&times;</button>

      {type === 'kingdom' && <KingdomDetail item={item} eraMap={eraMap} placeMap={placeMap}
        kingdomPeopleMap={kingdomPeopleMap} kingdomEventsMap={kingdomEventsMap} kingdomPlacesMap={kingdomPlacesMap}
        onSelect={onSelectEntity} sources={sources} onSetMapYear={onSetMapYear} />}

      {type === 'place' && <PlaceDetail item={item} placeEventsMap={placeEventsMap}
        placeKingdomsMap={placeKingdomsMap} onSelect={onSelectEntity} sources={sources} />}

      {type === 'person' && <PersonDetail item={item} kingdomMap={kingdomMap}
        personEventsMap={personEventsMap} onSelect={onSelectEntity} sources={sources} />}

      {type === 'event' && <EventDetail item={item} kingdomMap={kingdomMap} placeMap={placeMap}
        eventPeopleMap={eventPeopleMap} onSelect={onSelectEntity} sources={sources} onSetMapYear={onSetMapYear} />}

      {type === 'landmark' && <LandmarkDetail item={item} kingdomMap={kingdomMap} placeMap={placeMap}
        onSelect={onSelectEntity} sources={sources} onSetMapYear={onSetMapYear} />}
    </div>
  );
}

function KingdomDetail({ item, eraMap, placeMap, kingdomPeopleMap, kingdomEventsMap, kingdomPlacesMap, onSelect, sources, onSetMapYear }) {
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
        <p className="ak-modal-dates">
          {formatYearRange(item.start_year, item.end_year)}
          {item.start_year != null && onSetMapYear && (
            <button className="ak-set-year-btn" onClick={() => onSetMapYear(item.start_year)} title="Set map to founding year">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>
            </button>
          )}
        </p>
        {era && <p className="ak-modal-era"><span className="ak-era-dot" style={{ backgroundColor: era.color }} />{era.name}</p>}
        {item.region && <p className="ak-modal-region">{item.region}</p>}
      </div>
      <ReferenceLink url={item.reference_url} />
      {item.description && <p className="ak-modal-description">{item.description}</p>}
      <AKImageGallery name={item.name} entityType="kingdom" />
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
      <SourcesList sources={sources} />
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
      <ReferenceLink url={item.reference_url} />
      {item.description && <p className="ak-modal-description">{item.description}</p>}
      <AKImageGallery name={item.name} lat={item.lat} lng={item.lng} entityType="place" />
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
      <SourcesList sources={sources} />
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
      <ReferenceLink url={item.reference_url} />
      {item.description && <p className="ak-modal-description">{item.description}</p>}
      <AKImageGallery name={item.name} entityType="person" />
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
      <SourcesList sources={sources} />
    </>
  );
}

function EventDetail({ item, kingdomMap, placeMap, eventPeopleMap, onSelect, sources, onSetMapYear }) {
  const kingdom = item.kingdom_id ? kingdomMap?.get(item.kingdom_id) : null;
  const place = item.place_id ? placeMap?.get(item.place_id) : null;
  const people = eventPeopleMap?.get(item.event_id) || [];

  return (
    <>
      <div className="ak-modal-header" style={{ borderLeftColor: kingdom?.color || '#8b7355' }}>
        <span className="ak-modal-type-badge">{item.event_type || 'Event'}</span>
        <h2>{item.name}</h2>
        <p className="ak-modal-dates">
          {formatYear(item.event_year)}
          {item.event_year != null && onSetMapYear && (
            <button className="ak-set-year-btn" onClick={() => onSetMapYear(item.event_year)} title="Set map to this year">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>
            </button>
          )}
        </p>
      </div>
      <ReferenceLink url={item.reference_url} />
      {item.description && <p className="ak-modal-description">{item.description}</p>}
      <AKImageGallery name={item.name} lat={place?.lat} lng={place?.lng} entityType="event" />
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
      <SourcesList sources={sources} />
    </>
  );
}

function LandmarkDetail({ item, kingdomMap, placeMap, onSelect, sources, onSetMapYear }) {
  const kingdom = item.kingdom_id ? kingdomMap?.get(item.kingdom_id) : null;
  const place = item.place_id ? placeMap?.get(item.place_id) : null;

  return (
    <>
      <div className="ak-modal-header" style={{ borderLeftColor: '#d4a017' }}>
        <span className="ak-modal-type-badge">{item.landmark_type || 'Landmark'}</span>
        <h2>{item.name}</h2>
        {item.built_year != null && (
          <p className="ak-modal-dates">
            Built {formatYear(item.built_year)}
            {item.end_year != null && ` \u2013 ${formatYear(item.end_year)}`}
            {onSetMapYear && (
              <button className="ak-set-year-btn" onClick={() => onSetMapYear(item.built_year)} title="Set map to this year">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>
              </button>
            )}
          </p>
        )}
      </div>
      <ReferenceLink url={item.reference_url} />
      {item.description && <p className="ak-modal-description">{item.description}</p>}
      <AKImageGallery name={item.name} lat={item.lat} lng={item.lng} searchTerms={item.search_terms} entityType="landmark" />
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
      <SourcesList sources={sources} />
    </>
  );
}

/** Prominent reference link shown right below the header */
function ReferenceLink({ url }) {
  if (!url) return null;
  const domain = getRefDomain(url);
  return (
    <a className="ak-reference-link" href={url} target="_blank" rel="noopener noreferrer">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6" />
        <polyline points="15 3 21 3 21 9" />
        <line x1="10" y1="14" x2="21" y2="3" />
      </svg>
      Read more on {domain}
    </a>
  );
}

/** Academic sources list (separate from the main reference link) */
function SourcesList({ sources }) {
  if (!sources || sources.length === 0) return null;
  return (
    <div className="ak-modal-section ak-sources-section">
      <h3>Sources</h3>
      <ul className="ak-source-list">
        {sources.map(s => (
          <li key={s.source_id}>
            {s.url ? <a href={s.url} target="_blank" rel="noopener noreferrer">{s.title}</a> : s.title}
            {s.author && <span className="ak-meta"> — {s.author}</span>}
          </li>
        ))}
      </ul>
    </div>
  );
}
