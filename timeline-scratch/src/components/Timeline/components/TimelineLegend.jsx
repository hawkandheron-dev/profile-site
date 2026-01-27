/**
 * Legend component for timeline with toggle filters
 */

import { Icon, ShapeIcon } from './Icon.jsx';
import './TimelineLegend.css';

export function TimelineLegend({ legend, isVisible = true, filters = {}, onFilterToggle, onMouseEnter, onMouseLeave }) {
  if (!isVisible || !legend || legend.length === 0) return null;

  const handleToggle = (filterKey) => {
    if (onFilterToggle && filterKey) {
      onFilterToggle(filterKey);
    }
  };

  return (
    <div className="timeline-legend" onMouseEnter={onMouseEnter} onMouseLeave={onMouseLeave}>
      <h3 className="legend-title">Legend</h3>
      <div className="legend-items">
        {legend.map(item => {
          const isActive = item.filterKey ? filters[item.filterKey] !== false : true;

          return (
            <div
              key={item.id}
              className={`legend-item ${!isActive ? 'legend-item-inactive' : ''}`}
              onClick={() => handleToggle(item.filterKey)}
              style={{ cursor: item.filterKey ? 'pointer' : 'default' }}
            >
              {/* Toggle checkbox */}
              {item.filterKey && (
                <span className="legend-toggle">
                  <input
                    type="checkbox"
                    checked={isActive}
                    onChange={() => handleToggle(item.filterKey)}
                    onClick={(e) => e.stopPropagation()}
                  />
                </span>
              )}

              {/* People type - color box */}
              {item.type === 'people' && (
                <span
                  className="legend-color-box"
                  style={{
                    backgroundColor: item.color,
                    opacity: isActive ? 1 : 0.4
                  }}
                />
              )}

              {/* Bracket type - small bracket visual */}
              {item.type === 'bracket' && (
                <span className="legend-bracket" style={{ opacity: isActive ? 1 : 0.4 }}>
                  <svg width="20" height="20" viewBox="0 0 20 20">
                    <path
                      d="M 2 4 Q 4 4 4 8 Q 4 10 10 10 Q 4 10 4 12 Q 4 16 2 16"
                      fill="none"
                      stroke={item.color}
                      strokeWidth="2"
                      strokeLinecap="round"
                    />
                  </svg>
                </span>
              )}

              {/* Period type - color box (backwards compatibility) */}
              {item.type === 'period' && (
                <span
                  className="legend-color-box"
                  style={{
                    backgroundColor: item.color,
                    opacity: isActive ? 1 : 0.4
                  }}
                />
              )}

              {/* Point type - shape icon */}
              {item.type === 'point' && (
                <span className="legend-icon" style={{ opacity: isActive ? 1 : 0.4 }}>
                  <ShapeIcon shape={item.shape} color={item.color} size={18} />
                </span>
              )}

              {/* Icon type */}
              {item.type === 'icon' && (
                <span className="legend-icon" style={{ opacity: isActive ? 1 : 0.4 }}>
                  {item.icon}
                </span>
              )}

              {/* Emperor crown icon */}
              {item.isEmperor && (
                <span className="legend-emperor-icon" style={{ marginLeft: '-4px', opacity: isActive ? 1 : 0.4 }}>
                  <Icon name="crown" size={14} color={item.color} />
                </span>
              )}

              <span
                className="legend-label"
                style={{ opacity: isActive ? 1 : 0.5 }}
              >
                {item.name}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
