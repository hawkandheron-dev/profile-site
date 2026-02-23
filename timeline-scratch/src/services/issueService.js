/**
 * Issue service for the cross-app issue reporting system.
 * Handles CRUD on App_Issues.
 */
import { makeSupabaseClient } from '../lib/supabase.ts';

function getClient(getToken) {
  if (!getToken) throw new Error('Auth token provider required');
  return makeSupabaseClient(getToken);
}

// ── Contributor operations ──────────────────────────────────────────────────

/**
 * Submit a new issue.
 * @param {{ app_id, title, description, issue_type, page_context }} issue
 * @param {string} clerkUserId
 * @param {Function} getToken
 */
export async function submitIssue({ app_id, title, description, issue_type, page_context }, clerkUserId, getToken) {
  const supabase = getClient(getToken);

  const { data, error } = await supabase
    .from('App_Issues')
    .insert({
      app_id,
      title: title.trim(),
      description: description.trim(),
      issue_type: issue_type || 'general',
      page_context: page_context || null,
      submitted_by: clerkUserId,
      status: 'open',
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * Fetch issues submitted by the current user for a specific app.
 */
export async function fetchMyIssues(appId, getToken) {
  const supabase = getClient(getToken);
  let query = supabase
    .from('App_Issues')
    .select('*')
    .order('created_at', { ascending: false });

  if (appId) {
    query = query.eq('app_id', appId);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data || [];
}

// ── Admin operations ────────────────────────────────────────────────────────

/**
 * Fetch all issues (admin only), with optional status filter.
 */
export async function fetchAllIssues(appId, getToken, statusFilter = null) {
  const supabase = getClient(getToken);
  let query = supabase
    .from('App_Issues')
    .select('*')
    .order('created_at', { ascending: false });

  if (appId) {
    query = query.eq('app_id', appId);
  }
  if (statusFilter) {
    query = query.eq('status', statusFilter);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data || [];
}

/**
 * Resolve an issue (admin only).
 */
export async function resolveIssue(issueId, resolverUserId, resolverNotes, getToken) {
  const supabase = getClient(getToken);
  const { error } = await supabase
    .from('App_Issues')
    .update({
      status: 'resolved',
      resolver_notes: resolverNotes || null,
      resolved_at: new Date().toISOString(),
      resolved_by: resolverUserId,
    })
    .eq('issue_id', issueId);

  if (error) throw error;
}

/**
 * Upload a screenshot (stub — ready for Supabase Storage integration).
 * @returns {Promise<string|null>} public URL or null
 */
export async function uploadScreenshot(_file, _getToken) {
  // TODO: implement with Supabase Storage when ready
  return null;
}
