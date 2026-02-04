/**
 * Notes CRUD service for Church History Timeline.
 * Uses the Clerk-aware Supabase client for RLS-protected operations.
 */
import { makeSupabaseClient } from '../lib/supabase.ts';

// ── Helpers ──────────────────────────────────────────────────────────────

function getClient(getToken) {
  if (!getToken) throw new Error('Auth token provider required');
  return makeSupabaseClient(getToken);
}

// ── Notes CRUD ───────────────────────────────────────────────────────────

/**
 * Fetch notes for a given person (via NoteConnections).
 * Returns notes with their connected person IDs.
 */
export async function fetchNotesForPerson(personId, getToken, { limit = 5, offset = 0 } = {}) {
  const supabase = getClient(getToken);

  // Get note IDs connected to this person, ordered by updated_at desc
  const { data: connections, error: connErr } = await supabase
    .from('CH_NoteConnections')
    .select('note_id')
    .eq('person_id', personId);

  if (connErr) throw connErr;
  if (!connections?.length) return { notes: [], hasMore: false };

  const noteIds = [...new Set(connections.map(c => c.note_id))];

  // Fetch the actual notes
  const { data: notes, error: notesErr } = await supabase
    .from('CH_Notes')
    .select('*')
    .in('note_id', noteIds)
    .order('updated_at', { ascending: false })
    .range(offset, offset + limit);

  if (notesErr) throw notesErr;

  // Fetch all connections for these notes (to show other-people tags)
  const fetchedIds = (notes || []).map(n => n.note_id);
  let allConnections = [];
  if (fetchedIds.length) {
    const { data: conns, error: connsErr } = await supabase
      .from('CH_NoteConnections')
      .select('note_id, person_id')
      .in('note_id', fetchedIds);
    if (connsErr) throw connsErr;
    allConnections = conns || [];
  }

  // Attach person IDs to each note
  const enriched = (notes || []).map(note => ({
    ...note,
    personIds: allConnections
      .filter(c => c.note_id === note.note_id)
      .map(c => c.person_id),
  }));

  return {
    notes: enriched,
    hasMore: (notes || []).length > limit,
  };
}

/**
 * Create a note and connect it to one or more people.
 */
export async function createNote(body, personIds, getToken, clerkUserId) {
  const supabase = getClient(getToken);

  const { data: note, error: noteErr } = await supabase
    .from('CH_Notes')
    .insert({ body, clerk_user_id: clerkUserId })
    .select()
    .single();

  if (noteErr) throw noteErr;

  if (personIds?.length) {
    const rows = personIds.map(pid => ({
      note_id: note.note_id,
      person_id: pid,
    }));
    const { error: connErr } = await supabase
      .from('CH_NoteConnections')
      .insert(rows);
    if (connErr) throw connErr;
  }

  return { ...note, personIds: personIds || [] };
}

/**
 * Update note body and/or connections.
 */
export async function updateNote(noteId, body, personIds, getToken) {
  const supabase = getClient(getToken);

  const { error: noteErr } = await supabase
    .from('CH_Notes')
    .update({ body, updated_at: new Date().toISOString() })
    .eq('note_id', noteId);

  if (noteErr) throw noteErr;

  if (personIds !== undefined) {
    // Remove existing connections
    const { error: delErr } = await supabase
      .from('CH_NoteConnections')
      .delete()
      .eq('note_id', noteId);
    if (delErr) throw delErr;

    // Insert new connections
    if (personIds.length) {
      const rows = personIds.map(pid => ({
        note_id: noteId,
        person_id: pid,
      }));
      const { error: connErr } = await supabase
        .from('CH_NoteConnections')
        .insert(rows);
      if (connErr) throw connErr;
    }
  }
}

/**
 * Delete a note (cascades to connections via FK).
 */
export async function deleteNote(noteId, getToken) {
  const supabase = getClient(getToken);

  const { error } = await supabase
    .from('CH_Notes')
    .delete()
    .eq('note_id', noteId);

  if (error) throw error;
}

/**
 * Fetch all notes for the current user (RLS handles scoping).
 * Returns notes with their connected person IDs.
 */
export async function fetchAllNotes(getToken, { limit = 5, offset = 0 } = {}) {
  const supabase = getClient(getToken);

  const { data: notes, error: notesErr } = await supabase
    .from('CH_Notes')
    .select('*')
    .order('updated_at', { ascending: false })
    .range(offset, offset + limit);

  if (notesErr) throw notesErr;

  const fetchedIds = (notes || []).map(n => n.note_id);
  let allConnections = [];
  if (fetchedIds.length) {
    const { data: conns, error: connsErr } = await supabase
      .from('CH_NoteConnections')
      .select('note_id, person_id')
      .in('note_id', fetchedIds);
    if (connsErr) throw connsErr;
    allConnections = conns || [];
  }

  const enriched = (notes || []).map(note => ({
    ...note,
    personIds: allConnections
      .filter(c => c.note_id === note.note_id)
      .map(c => c.person_id),
  }));

  return {
    notes: enriched,
    hasMore: (notes || []).length > limit,
  };
}
