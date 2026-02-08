/**
 * Modal for contributors to suggest a new Person, Event, or Era.
 * Renders EditEntityForm in suggest mode with no existing item.
 */

import { useState } from 'react';
import { EditEntityForm } from '../EditEntityForm/EditEntityForm.jsx';
import './SuggestNewModal.css';

export function SuggestNewModal({ isOpen, onClose, getToken, clerkUserId }) {
  const [selectedType, setSelectedType] = useState(null);

  if (!isOpen) return null;

  const handleClose = () => {
    setSelectedType(null);
    onClose();
  };

  return (
    <div className="suggest-new-overlay" onClick={handleClose}>
      <div className="suggest-new-modal" onClick={e => e.stopPropagation()}>
        <button className="suggest-new-close" onClick={handleClose}>&times;</button>

        {!selectedType ? (
          <div className="suggest-new-picker">
            <h2>Suggest a New Entry</h2>
            <p className="suggest-new-desc">
              Choose what type of entry you'd like to suggest. An admin will review it before it appears on the timeline.
            </p>
            <div className="suggest-new-options">
              <button
                type="button"
                className="suggest-new-option suggest-new-option--person"
                onClick={() => setSelectedType('person')}
              >
                <span className="suggest-new-option-icon">&#9679;</span>
                <strong>Person</strong>
                <span>Historical figure</span>
              </button>
              <button
                type="button"
                className="suggest-new-option suggest-new-option--event"
                onClick={() => setSelectedType('point')}
              >
                <span className="suggest-new-option-icon">&#9670;</span>
                <strong>Event</strong>
                <span>Council, document, or event</span>
              </button>
              <button
                type="button"
                className="suggest-new-option suggest-new-option--era"
                onClick={() => setSelectedType('period')}
              >
                <span className="suggest-new-option-icon">&#9644;</span>
                <strong>Era</strong>
                <span>Time period</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="suggest-new-form-wrapper">
            <button
              type="button"
              className="suggest-new-back"
              onClick={() => setSelectedType(null)}
            >
              &larr; Choose a different type
            </button>
            <EditEntityForm
              item={null}
              itemType={null}
              newEntityType={selectedType}
              getToken={getToken}
              mode="suggest"
              clerkUserId={clerkUserId}
              onSaved={handleClose}
              onCancel={() => setSelectedType(null)}
            />
          </div>
        )}
      </div>
    </div>
  );
}
