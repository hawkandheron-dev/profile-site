/**
 * Suggestion service for the contributor suggestion workflow.
 * Handles CRUD on CH_Suggestions and approval logic (apply to real tables).
 */
import { makeSupabaseClient } from '../lib/supabase.ts';

function getClient(getToken) {
  if (!getToken) throw new Error('Auth token provider required');
  return makeSupabaseClient(getToken);
}

// ── Contributor operations ──────────────────────────────────────────────────

/**
 * Submit a new suggestion.
 * @param {{ entity_type, entity_id, suggested_data }} suggestion
 * @param {string} clerkUserId
 * @param {Function} getToken
 */
export async function submitSuggestion({ entity_type, entity_id, suggested_data }, clerkUserId, getToken) {
  const supabase = getClient(getToken);
  const { data, error } = await supabase
    .from('CH_Suggestions')
    .insert({
      entity_type,
      entity_id: entity_id || null,
      suggested_data,
      submitted_by: clerkUserId,
      status: 'pending',
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * Fetch suggestions submitted by the current user.
 */
export async function fetchMySuggestions(getToken) {
  const supabase = getClient(getToken);
  const { data, error } = await supabase
    .from('CH_Suggestions')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
}

// ── Admin operations ────────────────────────────────────────────────────────

/**
 * Fetch all pending suggestions (admin only).
 */
export async function fetchAllSuggestions(getToken, statusFilter = null) {
  const supabase = getClient(getToken);
  let query = supabase
    .from('CH_Suggestions')
    .select('*')
    .order('created_at', { ascending: false });

  if (statusFilter) {
    query = query.eq('status', statusFilter);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data || [];
}

/**
 * Fetch the current record for an entity (for diff comparison).
 */
export async function fetchCurrentEntity(entityType, entityId, getToken) {
  if (!entityId) return null; // new entry — no current record
  const supabase = getClient(getToken);

  const tableMap = {
    person: { table: 'CH_People', pk: 'person_id' },
    event: { table: 'CH_Events', pk: 'event_id' },
    era: { table: 'CH_Eras', pk: 'era_id' },
  };

  const config = tableMap[entityType];
  if (!config) return null;

  const { data, error } = await supabase
    .from(config.table)
    .select('*')
    .eq(config.pk, entityId)
    .maybeSingle();

  if (error) throw error;
  return data;
}

/**
 * Approve a suggestion — applies the suggested_data to the real table.
 * For edits: updates the matching record.
 * For new entries: inserts a new record.
 */
export async function approveSuggestion(suggestion, reviewerUserId, getToken) {
  const supabase = getClient(getToken);
  const { entity_type, entity_id, suggested_data } = suggestion;

  const tableMap = {
    person: { table: 'CH_People', pk: 'person_id' },
    event: { table: 'CH_Events', pk: 'event_id' },
    era: { table: 'CH_Eras', pk: 'era_id' },
  };

  const config = tableMap[entity_type];
  if (!config) throw new Error(`Unknown entity type: ${entity_type}`);

  // Strip out created_at so we don't overwrite it
  const { created_at, ...fields } = suggested_data;

  if (entity_id) {
    // Edit existing record
    const { error: updateError } = await supabase
      .from(config.table)
      .update(fields)
      .eq(config.pk, entity_id);

    if (updateError) throw updateError;
  } else {
    // New record — insert
    const { error: insertError } = await supabase
      .from(config.table)
      .insert(fields);

    if (insertError) throw insertError;
  }

  // Mark suggestion as approved
  const { error: statusError } = await supabase
    .from('CH_Suggestions')
    .update({
      status: 'approved',
      reviewed_at: new Date().toISOString(),
      reviewed_by: reviewerUserId,
    })
    .eq('suggestion_id', suggestion.suggestion_id);

  if (statusError) throw statusError;
}

/**
 * Reject a suggestion with optional notes.
 */
export async function rejectSuggestion(suggestionId, reviewerUserId, reviewerNotes, getToken) {
  const supabase = getClient(getToken);
  const { error } = await supabase
    .from('CH_Suggestions')
    .update({
      status: 'rejected',
      reviewer_notes: reviewerNotes || null,
      reviewed_at: new Date().toISOString(),
      reviewed_by: reviewerUserId,
    })
    .eq('suggestion_id', suggestionId);

  if (error) throw error;
}
