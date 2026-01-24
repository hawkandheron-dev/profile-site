/**
 * Legend component for timeline
 */

import './TimelineLegend.css';

// Helper to render shape icon for points
function renderShapeIcon(shape, color, size = 16) {
  const half = size / 2;
  const curve = size * 0.1;

  switch (shape) {
    case 'diamond':
      return (
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
          <path
            d={`M ${half} 0 Q ${half + curve} ${half - curve} ${size} ${half} Q ${half + curve} ${half + curve} ${half} ${size} Q ${half - curve} ${half + curve} 0 ${half} Q ${half - curve} ${half - curve} ${half} 0 Z`}
            fill={color}
            stroke="#333"
            strokeWidth="1"
          />
        </svg>
      );
    case 'square':
      return (
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
          <path
            d={`M 0 ${curve} Q ${half} ${-curve} ${size - curve} 0 Q ${size + curve} ${half} ${size - curve} ${size} Q ${half} ${size + curve} ${curve} ${size} Q ${-curve} ${half} 0 ${curve} Z`}
            fill={color}
            stroke="#333"
            strokeWidth="1"
          />
        </svg>
      );
    case 'circle':
      return (
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
          <circle cx={half} cy={half} r={half - 1} fill={color} stroke="#333" strokeWidth="1" />
        </svg>
      );
    case 'triangle':
      const height = (Math.sqrt(3) / 2) * size;
      return (
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
          <path
            d={`M ${half} ${(size - height) / 2} Q ${half + half / 2 + curve} ${size / 2} ${size} ${(size + height) / 2} Q ${half} ${(size + height) / 2 + curve} 0 ${(size + height) / 2} Q ${half - half / 2 - curve} ${size / 2} ${half} ${(size - height) / 2} Z`}
            fill={color}
            stroke="#333"
            strokeWidth="1"
          />
        </svg>
      );
    default:
      return (
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
          <circle cx={half} cy={half} r={half - 1} fill={color} stroke="#333" strokeWidth="1" />
        </svg>
      );
  }
}

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
            {item.type === 'point' && (
              <span className="legend-icon">
                {renderShapeIcon(item.shape, item.color, 18)}
              </span>
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
