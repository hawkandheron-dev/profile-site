import './SkinSelector.css';

export function SkinSelector({ skins, activeSkinId, onSelectSkin, year, onYearChange }) {
  return (
    <div className="hmp-selector">
      <h2 className="hmp-selector-title">Historical Map Playground</h2>
      <p className="hmp-selector-sub">Phase 1: paint overrides + texture overlays on OHM tiles.</p>

      <fieldset className="hmp-skin-group">
        <legend>Skin</legend>
        {skins.map(skin => (
          <label key={skin.id} className={`hmp-skin-option ${skin.id === activeSkinId ? 'is-active' : ''}`}>
            <input
              type="radio"
              name="hmp-skin"
              value={skin.id}
              checked={skin.id === activeSkinId}
              onChange={() => onSelectSkin(skin.id)}
            />
            <span className="hmp-skin-label">
              <strong>{skin.label}</strong>
              <em>{skin.description}</em>
            </span>
          </label>
        ))}
      </fieldset>

      <fieldset className="hmp-year-group">
        <legend>Year: <output>{year} CE</output></legend>
        <input
          type="range"
          min="-500"
          max="1500"
          step="10"
          value={year}
          onChange={e => onYearChange(Number(e.target.value))}
          aria-label="Map year"
        />
      </fieldset>
    </div>
  );
}
