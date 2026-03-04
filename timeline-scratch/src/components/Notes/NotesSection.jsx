/**
 * Notes section rendered at the bottom of a People detail modal.
 * Shows up to 5 notes (load more), inline edit/create, sticky action bar.
 */
import { useState, useEffect, useCallback } from 'react';
import { PeopleSelector } from './PeopleSelector.jsx';
import {
  fetchNotesForPerson,
  createNote,
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

export function NotesSection({ personId, personName, people, getToken, clerkUserId, itemIndex }) {
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [hasMore, setHasMore] = useState(false);
  const [offset, setOffset] = useState(0);
  const PAGE = 5;

  // ── Pending changes state ──────────────────────────────────────────────
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
      const result = await fetchNotesForPerson(personId, getToken, {
        limit: PAGE,
        offset: off,
      });
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
  }, [personId, getToken, offset]);

  useEffect(() => {
    loadNotes(true);
    setEditingId(null);
    setMarkedForDelete(null);
    setError(null);
  }, [personId, getToken]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Inline create ──────────────────────────────────────────────────────
  const startCreate = useCallback(() => {
    setEditingId('new');
    setEditBody('');
    setEditPersonIds([personId]);
    setMarkedForDelete(null);
    setError(null);
  }, [personId]);

  // ── Inline edit ────────────────────────────────────────────────────────
  const startEdit = useCallback((note) => {
    setEditingId(note.note_id);
    setEditBody(note.body);
    setEditPersonIds(note.personIds || []);
    setMarkedForDelete(null);
    setError(null);
  }, []);

  // ── Mark for delete ────────────────────────────────────────────────────
  const markDelete = useCallback((noteId) => {
    setMarkedForDelete(noteId);
    setEditingId(null);
    setError(null);
  }, []);

  // ── Cancel all pending ─────────────────────────────────────────────────
  const cancelPending = useCallback(() => {
    setEditingId(null);
    setEditBody('');
    setEditPersonIds([]);
    setMarkedForDelete(null);
    setError(null);
  }, []);

  // ── Save (create, update, or delete) ───────────────────────────────────
  const handleSave = useCallback(async () => {
    setSaving(true);
    setError(null);
    try {
      if (markedForDelete !== null) {
        await deleteNote(markedForDelete, getToken);
      } else if (editingId === 'new') {
        if (!editBody.trim()) { setSaving(false); return; }
        const ids = editPersonIds.includes(personId)
          ? editPersonIds
          : [personId, ...editPersonIds];
        await createNote(editBody.trim(), ids, getToken, clerkUserId);
      } else if (editingId) {
        if (!editBody.trim()) { setSaving(false); return; }
        const ids = editPersonIds.includes(personId)
          ? editPersonIds
          : [personId, ...editPersonIds];
        await updateNote(editingId, editBody.trim(), ids, getToken);
      }
      cancelPending();
      await loadNotes(true);
    } catch (err) {
      setError(err.message || 'Operation failed.');
    } finally {
      setSaving(false);
    }
  }, [markedForDelete, editingId, editBody, editPersonIds, personId, getToken, clerkUserId, cancelPending, loadNotes]);

  // ── Resolve person name by ID ──────────────────────────────────────────
  const getPersonName = useCallback((pid) => {
    if (itemIndex) {
      const entry = itemIndex.get(pid);
      if (entry?.item?.name) return entry.item.name;
    }
    const p = people.find(p => p.id === pid);
    return p ? p.name : pid;
  }, [people, itemIndex]);

  // ── Render ─────────────────────────────────────────────────────────────
  return (
    <div className="notes-section">
      <div className="notes-section-header">
        <h3 className="notes-section-title">My Notes on {personName}</h3>
        <button
          type="button"
          className="btn btn-sm"
          onClick={startCreate}
          disabled={hasPendingChanges}
        >
          + Add Note
        </button>
      </div>

      {/* Inline create form */}
      {editingId === 'new' && (
        <div className="note-card note-card-editing">
          <label className="note-field-label">Also relates to</label>
          <PeopleSelector
            people={people}
            selectedIds={editPersonIds.filter(id => id !== personId)}
            onChange={(ids) => setEditPersonIds([personId, ...ids])}
            excludeId={personId}
          />
          <textarea
            className="note-textarea note-textarea-inline"
            rows={4}
            placeholder="Write your note..."
            value={editBody}
            onChange={e => setEditBody(e.target.value)}
            autoFocus
          />
        </div>
      )}

      {/* Notes list */}
      {loading && notes.length === 0 && (
        <p className="notes-loading">Loading notes...</p>
      )}

      {!loading && notes.length === 0 && editingId !== 'new' && (
        <p className="notes-empty">No notes yet.</p>
      )}

      {notes.map(note => {
        const isEditing = editingId === note.note_id;
        const isDeleting = markedForDelete === note.note_id;
        const otherPeople = (note.personIds || []).filter(id => id !== personId);

        return (
          <div
            key={note.note_id}
            className={`note-card${isDeleting ? ' note-card-deleting' : ''}${isEditing ? ' note-card-editing' : ''}`}
          >
            {/* Other people tags */}
            {!isEditing && otherPeople.length > 0 && (
              <div className="note-people-tags">
                {otherPeople.map(pid => (
                  <span key={pid} className="note-person-tag">
                    {getPersonName(pid)}
                  </span>
                ))}
              </div>
            )}

            {isEditing ? (
              <>
                <label className="note-field-label">Also relates to</label>
                <PeopleSelector
                  people={people}
                  selectedIds={editPersonIds.filter(id => id !== personId)}
                  onChange={(ids) => setEditPersonIds([personId, ...ids])}
                  excludeId={personId}
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

            {/* Edit / Delete buttons (only when no other pending action) */}
            {!isEditing && !isDeleting && !hasPendingChanges && (
              <div className="note-card-actions">
                <button
                  type="button"
                  className="note-btn-inline"
                  onClick={() => startEdit(note)}
                >
                  Edit
                </button>
                <button
                  type="button"
                  className="note-btn-inline note-btn-danger-inline"
                  onClick={() => markDelete(note.note_id)}
                >
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

      {/* Load more */}
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

      {/* Error */}
      {error && <p className="note-error">{error}</p>}

      {/* Sticky action bar */}
      {hasPendingChanges && (
        <div className="notes-action-bar">
          <button
            className="btn btn-rect btn-accent"
            onClick={handleSave}
            disabled={saving || (editingId && editingId !== 'new' && !editBody.trim()) || (editingId === 'new' && !editBody.trim())}
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
  );
}
