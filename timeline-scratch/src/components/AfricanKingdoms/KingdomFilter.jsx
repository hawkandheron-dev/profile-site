import './KingdomFilter.css';

export function KingdomFilter({ eras, activeEraFilter, onEraSelect }) {
  return (
    <div className="ak-filter-bar">
      <button
        className={`ak-filter-pill${!activeEraFilter ? ' active' : ''}`}
        onClick={() => onEraSelect(null)}
      >
        All Eras
      </button>
      {(eras || []).map(era => (
        <button
          key={era.era_id}
          className={`ak-filter-pill${activeEraFilter === era.era_id ? ' active' : ''}`}
          onClick={() => onEraSelect(activeEraFilter === era.era_id ? null : era.era_id)}
        >
          <span className="ak-filter-dot" style={{ backgroundColor: era.color }} />
          {era.name}
        </button>
      ))}
    </div>
  );
}
