import './BiblicalPlacesMap.css';

/**
 * Horizontal bar of colored pill buttons for filtering by narrative age.
 * Floats at the bottom of the map.
 */
export function NarrativeAgeFilter({ ages, activeAgeFilter, onFilter }) {
  if (!ages || ages.length === 0) return null;

  return (
    <div className="bp-age-filter">
      {ages.map(age => {
        const isActive = activeAgeFilter === age.age_id;
        return (
          <button
            key={age.age_id}
            className={`bp-age-pill ${isActive ? 'bp-age-pill-active' : ''}`}
            style={{
              '--age-color': age.color || '#8b7355',
            }}
            onClick={() => onFilter(age.age_id)}
            title={age.scripture_range || age.name}
          >
            <span className="bp-age-pill-dot" />
            <span className="bp-age-pill-label">{age.name}</span>
          </button>
        );
      })}
    </div>
  );
}
