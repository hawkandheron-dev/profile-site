import './BiblicalPlacesMap.css';

const LOGO_PATH = new URL('../../../../../resources/logos/Windhover_BLK.png', import.meta.url).href;

/**
 * Horizontal bar of colored pill buttons for filtering by narrative age.
 * Floats at the bottom of the map. Includes a reset button when a filter is active.
 */
export function NarrativeAgeFilter({ ages, activeAgeFilter, onFilter, showReset, onReset, siteTitle }) {
  if (!ages || ages.length === 0) return null;

  return (
    <div className="bp-age-filter">
      <div className="bp-age-filter-header">
        <div className="bp-age-filter-brand">
          <img className="bp-age-filter-brand-logo" src={LOGO_PATH} alt="Windhover" />
          <span className="bp-age-filter-brand-title">Windhover</span>
        </div>
        {siteTitle && <h2 className="bp-age-filter-site-title">{siteTitle}</h2>}
      </div>
      <div className="bp-age-filter-label">Legend</div>
      <div className="bp-age-filter-pills">
      {showReset && (
        <button
          className="bp-reset-btn"
          onClick={onReset}
          title="Reset view"
        >
          Reset
        </button>
      )}
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
    </div>
  );
}
