/**
 * Legend component for timeline
 */

import './TimelineLegend.css';

export function TimelineLegend({ legend, isVisible = true }) {
  if (!isVisible || !legend || legend.length === 0) return null;

  return (
    <div className="timeline-legend">
      <h3 className="legend-title">Legend</h3>
      <div className="legend-items">
        {legend.map(item => (
          <div key={item.id} className="legend-item">
            {item.type === 'period' && (
              <span
                className="legend-color-box"
                style={{ backgroundColor: item.color }}
              />
            )}
            {item.type === 'icon' && (
              <span className="legend-icon">{item.icon}</span>
            )}
            <span className="legend-label">{item.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
