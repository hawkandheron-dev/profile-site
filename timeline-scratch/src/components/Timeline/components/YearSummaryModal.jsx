/**
 * Modal component for displaying year summary (people alive, periods active, points)
 */

import { useEffect } from 'react';
import { Icon } from './Icon.jsx';
import './TimelineModal.css';

export function YearSummaryModal({ year, summary, config, onClose }) {
  // Handle escape key
  useEffect(() => {
    function handleEscape(e) {
      if (e.key === 'Escape') {
        onClose();
      }
    }

    document.addEventListener('keydown', handleEscape);
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = '';
    };
  }, [onClose]);

  const { activePeriods, alivePeople, yearPoints } = summary;

  // Format year for display
  const formatYear = (yr) => {
    if (yr <= 0) {
      return `${Math.abs(yr - 1)} BC`;
    }
    return `${yr} AD`;
  };

  // Separate emperors from other people
  const emperors = alivePeople.filter(p => p.isEmperor);
  const otherPeople = alivePeople.filter(p => !p.isEmperor);

  return (
    <div className="timeline-modal" onClick={onClose}>
      <div className="modal-backdrop" />
      <div className="modal-content year-summary-modal" onClick={e => e.stopPropagation()}>
        <button
          className="modal-close"
          onClick={onClose}
          aria-label="Close modal"
        >
          &times;
        </button>

        <h2 className="modal-title">
          {formatYear(year)}
        </h2>

        {/* Active Periods */}
        {activePeriods.length > 0 && (
          <div className="summary-section">
            <h3 className="summary-section-title">Active Periods</h3>
            <ul className="summary-list">
              {activePeriods.map(period => (
                <li key={period.id} className="summary-item">
                  <span
                    className="summary-color-dot"
                    style={{ backgroundColor: period.color }}
                  />
                  {period.name}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Emperors */}
        {emperors.length > 0 && (
          <div className="summary-section">
            <h3 className="summary-section-title">
              <Icon name="crown" size={16} color="#ffd700" />
              <span style={{ marginLeft: '6px' }}>Reigning Emperor{emperors.length > 1 ? 's' : ''}</span>
            </h3>
            <ul className="summary-list">
              {emperors.map(person => (
                <li key={person.id} className="summary-item">
                  <Icon name="crown" size={12} color="#ffd700" />
                  <span style={{ marginLeft: '6px' }}><strong>{person.name}</strong>{person.location && <>{' '}in <em>{person.location}</em></>}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* People Alive */}
        {otherPeople.length > 0 && (
          <div className="summary-section">
            <h3 className="summary-section-title">Who's where? ({otherPeople.length})</h3>
            <ul className="summary-list summary-list-compact">
              {otherPeople.map(person => (
                <li key={person.id} className="summary-item">
                  <span
                    className="summary-color-dot"
                    style={{ backgroundColor: person.color }}
                  />
                  <strong>{person.name}</strong>{person.location && <>{' '}in <em>{person.location}</em></>}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Points/Events */}
        {yearPoints.length > 0 && (
          <div className="summary-section">
            <h3 className="summary-section-title">Events This Year</h3>
            <ul className="summary-list">
              {yearPoints.map(point => (
                <li key={point.id} className="summary-item">
                  <span
                    className="summary-color-dot"
                    style={{ backgroundColor: point.color }}
                  />
                  {point.name}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Empty state */}
        {activePeriods.length === 0 && alivePeople.length === 0 && yearPoints.length === 0 && (
          <p className="summary-empty">No data for this year.</p>
        )}
      </div>
    </div>
  );
}
