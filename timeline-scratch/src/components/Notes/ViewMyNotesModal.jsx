/**
 * Modal showing all notes created by the current user.
 * Each note shows a read-only title "Note on {People}" and behaves
 * like the notes feed in the People detail modal.
 */
import { useState, useEffect, useCallback } from 'react';
import { PeopleSelector } from './PeopleSelector.jsx';
import {
  fetchAllNotes,
  updateNote,
  deleteNote,
} from '../../services/notesService.js';
import './Notes.css';

function formatTimestamp(iso) {
  if (!iso) return '';
  const d = new Date(iso);
  return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })
    + ' ' + d.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' });
}

export function ViewMyNotesModal({ isOpen, onClose, people, getToken, clerkUserId }) {
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [hasMore, setHasMore] = useState(false);
  const [offset, setOffset] = useState(0);
  const PAGE = 5;

  const [editingId, setEditingId] = useState(null);
  const [editBody, setEditBody] = useState('');
  const [editPersonIds, setEditPersonIds] = useState([]);
  const [markedForDelete, setMarkedForDelete] = useState(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const hasPendingChanges = editingId !== null || markedForDelete !== null;

  // ── Load notes ─────────────────────────────────────────────────────────
  const loadNotes = useCallback(async (reset = false) => {
    const off = reset ? 0 : offset;
    setLoading(true);
    try {
      const result = await fetchAllNotes(getToken, { limit: PAGE, offset: off });
      if (reset) {
        setNotes(result.notes);
        setOffset(result.notes.length);
      } else {
        setNotes(prev => [...prev, ...result.notes]);
        setOffset(off + result.notes.length);
      }
      setHasMore(result.hasMore);
    } catch (err) {
      console.error('Failed to load notes', err);
    } finally {
      setLoading(false);
    }
  }, [getToken, offset]);

  useEffect(() => {
    if (isOpen) {
      loadNotes(true);
      setEditingId(null);
      setMarkedForDelete(null);
      setError(null);
    }
  }, [isOpen, getToken]); // eslint-disable-line react-hooks/exhaustive-deps

  // Escape to close
  useEffect(() => {
    if (!isOpen) return;
    function handleKey(e) {
      if (e.key === 'Escape') onClose();
    }
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [isOpen, onClose]);

  // ── Inline edit ────────────────────────────────────────────────────────
  const startEdit = useCallback((note) => {
    setEditingId(note.note_id);
    setEditBody(note.body);
    setEditPersonIds(note.personIds || []);
    setMarkedForDelete(null);
    setError(null);
  }, []);

  const markDelete = useCallback((noteId) => {
    setMarkedForDelete(noteId);
    setEditingId(null);
    setError(null);
  }, []);

  const cancelPending = useCallback(() => {
    setEditingId(null);
    setEditBody('');
    setEditPersonIds([]);
    setMarkedForDelete(null);
    setError(null);
  }, []);

  const handleSave = useCallback(async () => {
    setSaving(true);
    setError(null);
    try {
      if (markedForDelete !== null) {
        await deleteNote(markedForDelete, getToken);
      } else if (editingId) {
        if (!editBody.trim()) { setSaving(false); return; }
        await updateNote(editingId, editBody.trim(), editPersonIds, getToken);
      }
      cancelPending();
      await loadNotes(true);
    } catch (err) {
      setError(err.message || 'Operation failed.');
    } finally {
      setSaving(false);
    }
  }, [markedForDelete, editingId, editBody, editPersonIds, getToken, cancelPending, loadNotes]);

  // ── Resolve person name ────────────────────────────────────────────────
  const getPersonName = useCallback((pid) => {
    const p = people.find(p => p.id === pid);
    return p ? p.name : pid;
  }, [people]);

  const getNoteTitle = useCallback((note) => {
    const names = (note.personIds || []).map(pid => getPersonName(pid));
    if (!names.length) return 'Note';
    return 'Note on ' + names.join(', ');
  }, [getPersonName]);

  if (!isOpen) return null;

  return (
    <div className="add-note-modal-overlay" onClick={() => onClose()}>
      <div className="add-note-modal view-my-notes-modal" onClick={e => e.stopPropagation()}>
        <button className="modal-close" onClick={() => onClose()} aria-label="Close modal">
          &times;
        </button>

        <h2 className="add-note-modal-title">My Notes</h2>

        {loading && notes.length === 0 && (
          <p className="notes-loading">Loading notes...</p>
        )}

        {!loading && notes.length === 0 && (
          <p className="notes-empty">No notes yet.</p>
        )}

        {notes.map(note => {
          const isEditing = editingId === note.note_id;
          const isDeleting = markedForDelete === note.note_id;

          return (
            <div
              key={note.note_id}
              className={`note-card${isDeleting ? ' note-card-deleting' : ''}${isEditing ? ' note-card-editing' : ''}`}
            >
              <p className="note-card-title">{getNoteTitle(note)}</p>

              {isEditing ? (
                <>
                  <label className="note-field-label">Related People</label>
                  <PeopleSelector
                    people={people}
                    selectedIds={editPersonIds}
                    onChange={setEditPersonIds}
                  />
                  <textarea
                    className="note-textarea note-textarea-inline"
                    rows={4}
                    value={editBody}
                    onChange={e => setEditBody(e.target.value)}
                    autoFocus
                  />
                </>
              ) : (
                <>
                  <p className="note-body">{note.body}</p>
                  <div className="note-timestamps">
                    <span>Created {formatTimestamp(note.created_at)}</span>
                    {note.updated_at && note.updated_at !== note.created_at && (
                      <span> · Modified {formatTimestamp(note.updated_at)}</span>
                    )}
                  </div>
                </>
              )}

              {!isEditing && !isDeleting && !hasPendingChanges && (
                <div className="note-card-actions">
                  <button type="button" className="note-btn-inline" onClick={() => startEdit(note)}>
                    Edit
                  </button>
                  <button type="button" className="note-btn-inline note-btn-danger-inline" onClick={() => markDelete(note.note_id)}>
                    Delete
                  </button>
                </div>
              )}

              {isDeleting && (
                <p className="note-delete-label">Marked for deletion</p>
              )}
            </div>
          );
        })}

        {hasMore && !hasPendingChanges && (
          <button
            type="button"
            className="btn btn-sm note-load-more"
            onClick={() => loadNotes(false)}
            disabled={loading}
          >
            {loading ? 'Loading...' : 'Load more'}
          </button>
        )}

        {error && <p className="note-error">{error}</p>}

        {hasPendingChanges && (
          <div className="notes-action-bar">
            <button
              className="btn btn-rect btn-accent"
              onClick={handleSave}
              disabled={saving || (editingId && !editBody.trim())}
            >
              {saving ? 'Saving...' : markedForDelete ? 'Confirm Delete' : 'Save'}
            </button>
            <button
              className="btn btn-rect"
              onClick={cancelPending}
              disabled={saving}
            >
              Cancel
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
