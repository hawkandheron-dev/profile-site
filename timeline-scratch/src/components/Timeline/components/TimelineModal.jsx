/**
 * Modal component for displaying full timeline item details
 */

import { useEffect } from 'react';
import { formatDateRange } from '../utils/dateUtils.js';
import './TimelineModal.css';

export function TimelineModal({ isOpen, item, itemType, config, onClose }) {
  // Handle escape key
  useEffect(() => {
    if (!isOpen) return;

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
  }, [isOpen, onClose]);

  if (!isOpen || !item) return null;

  // Format date based on item type
  let dateString = '';
  if (itemType === 'person') {
    dateString = formatDateRange(
      item.startDate,
      item.endDate,
      item.startCertainty || 'year only',
      item.endCertainty || 'year only',
      config.eraLabels
    );
  } else if (itemType === 'point') {
    dateString = formatDateRange(
      item.date,
      null,
      item.dateCertainty || 'year only',
      null,
      config.eraLabels
    );
  } else if (itemType === 'period') {
    dateString = formatDateRange(
      item.startDate,
      item.endDate,
      item.dateCertainty || 'year only',
      item.dateCertainty || 'year only',
      config.eraLabels
    );
  }

  return (
    <div className="timeline-modal" onClick={onClose}>
      <div className="modal-backdrop" />
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <button
          className="modal-close"
          onClick={onClose}
          aria-label="Close modal"
        >
          &times;
        </button>

        {item.image && (
          <img
            src={item.image}
            alt={item.name}
            className="modal-image"
          />
        )}

        <h2 className="modal-title">{item.name}</h2>

        {dateString && (
          <p className="modal-date">{dateString}</p>
        )}

        {item.description && (
          <div
            className="modal-description"
            dangerouslySetInnerHTML={{ __html: item.description }}
          />
        )}

        {item.links && item.links.length > 0 && (
          <div className="modal-links">
            <h3>Links:</h3>
            <ul>
              {item.links.map((link, index) => (
                <li key={index}>
                  <a
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {link.text}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
