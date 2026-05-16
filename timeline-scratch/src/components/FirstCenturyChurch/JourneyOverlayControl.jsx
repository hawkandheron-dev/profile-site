/**
 * Bottom control bar: the site title, the four missionary-journey toggles,
 * the "see the whole web" button, and a reset button.
 */
export function JourneyOverlayControl({
  journeys, activeJourney, onJourneySelect,
  onShowGlobalGraph, showReset, onReset,
}) {
  return (
    <div className="fcc-controls">
      <div className="fcc-controls-title">
        <a className="fcc-home-link" href="../../index.html" title="Back to Windhover">‹</a>
        <span>First Century Church Directory</span>
      </div>

      <div className="fcc-journey-toggles">
        <span className="fcc-controls-label">Paul&rsquo;s journeys</span>
        {journeys.map(j => (
          <button
            key={j.journey_id}
            className={`fcc-journey-btn${activeJourney === j.journey_id ? ' fcc-journey-btn--active' : ''}`}
            style={{ '--journey-color': j.color || '#b05ca0' }}
            onClick={() => onJourneySelect(j.journey_id)}
            title={j.description || j.name}
          >
            <span className="fcc-journey-dot" />
            {j.name.replace("Paul's ", '')}
          </button>
        ))}
      </div>

      <div className="fcc-controls-actions">
        <button className="fcc-global-btn" onClick={onShowGlobalGraph}>
          See the whole web
        </button>
        {showReset && (
          <button className="fcc-reset-btn" onClick={onReset}>Reset</button>
        )}
      </div>
    </div>
  );
}
