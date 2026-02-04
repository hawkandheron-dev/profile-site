/**
 * Modal for creating a new note from the top nav.
 * Provides a people selector and a body textarea.
 */
import { useState, useEffect, useCallback } from 'react';
import { PeopleSelector } from './PeopleSelector.jsx';
import { createNote } from '../../services/notesService.js';
import './Notes.css';

export function AddNoteModal({ isOpen, onClose, people, getToken, clerkUserId }) {
  const [body, setBody] = useState('');
  const [personIds, setPersonIds] = useState([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      setBody('');
      setPersonIds([]);
      setError(null);
    }
  }, [isOpen]);

  // Escape to close
  useEffect(() => {
    if (!isOpen) return;
    function handleKey(e) {
      if (e.key === 'Escape') onClose();
    }
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [isOpen, onClose]);

  const handleSave = useCallback(async () => {
    if (!body.trim()) return;
    if (!personIds.length) {
      setError('Select at least one person to relate this note to.');
      return;
    }
    setSaving(true);
    setError(null);
    try {
      await createNote(body.trim(), personIds, getToken, clerkUserId);
      onClose(true); // true = saved
    } catch (err) {
      setError(err.message || 'Failed to save note.');
      setSaving(false);
    }
  }, [body, personIds, getToken, clerkUserId, onClose]);

  if (!isOpen) return null;

  return (
    <div className="add-note-modal-overlay" onClick={() => onClose(false)}>
      <div className="add-note-modal" onClick={e => e.stopPropagation()}>
        <button className="modal-close" onClick={() => onClose(false)} aria-label="Close modal">
          &times;
        </button>

        <h2 className="add-note-modal-title">Add Note</h2>

        <label className="note-field-label">Related People</label>
        <PeopleSelector
          people={people}
          selectedIds={personIds}
          onChange={setPersonIds}
        />

        <label className="note-field-label">Note</label>
        <textarea
          className="note-textarea"
          rows={8}
          placeholder="Write your note..."
          value={body}
          onChange={e => setBody(e.target.value)}
          autoFocus
        />

        {error && <p className="note-error">{error}</p>}

        <div className="note-actions">
          <button
            className="note-btn note-btn-primary"
            onClick={handleSave}
            disabled={saving || !body.trim()}
          >
            {saving ? 'Saving...' : 'Save'}
          </button>
          <button
            className="note-btn note-btn-secondary"
            onClick={() => onClose(false)}
            disabled={saving}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
