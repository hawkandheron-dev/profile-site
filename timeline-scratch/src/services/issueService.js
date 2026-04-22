/**
 * Issue service for the cross-app issue reporting system.
 * Handles CRUD on App_Issues and discussion comments on App_Issue_Comments.
 */
import { makeSupabaseClient } from '../lib/supabase.ts';

export const ISSUE_STATUSES = [
  'submitted',
  'in_review',
  'on_roadmap',
  'implemented',
  'not_going_to_do',
];

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
      status: 'submitted',
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

/**
 * Fetch display names for a set of Clerk user IDs. Returns a map
 * { clerk_user_id → display_name || email || null }.
 *
 * RLS controls which users rows are visible: admins see everyone;
 * non-admins only see themselves and readable admin profiles. Any IDs the
 * caller cannot see are simply absent from the returned map.
 */
export async function fetchSubmittersByIds(ids, getToken) {
  const unique = [...new Set((ids || []).filter(Boolean))];
  if (unique.length === 0) return {};

  const supabase = getClient(getToken);
  const { data, error } = await supabase
    .from('users')
    .select('clerk_user_id, display_name, email')
    .in('clerk_user_id', unique);

  if (error) throw error;

  const map = {};
  for (const row of data || []) {
    map[row.clerk_user_id] = row.display_name || row.email || null;
  }
  return map;
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
 * Set an issue's status (admin only). Accepts any of ISSUE_STATUSES.
 * When moving to 'implemented' or 'not_going_to_do', records actor + notes +
 * resolved_at for audit. Other statuses clear resolved_at.
 */
export async function setIssueStatus(issueId, status, actorUserId, notes, getToken) {
  if (!ISSUE_STATUSES.includes(status)) {
    throw new Error(`Unknown status: ${status}`);
  }

  const supabase = getClient(getToken);

  const terminal = status === 'implemented' || status === 'not_going_to_do';
  const update = { status };
  if (notes !== undefined) update.resolver_notes = notes || null;
  if (terminal) {
    update.resolved_at = new Date().toISOString();
    update.resolved_by = actorUserId || null;
  } else {
    update.resolved_at = null;
    update.resolved_by = null;
  }

  const { error } = await supabase
    .from('App_Issues')
    .update(update)
    .eq('issue_id', issueId);

  if (error) throw error;
}

/**
 * Legacy resolve helper — keeps old callers working by delegating to
 * setIssueStatus with 'implemented'.
 * @deprecated Prefer setIssueStatus.
 */
export async function resolveIssue(issueId, resolverUserId, resolverNotes, getToken) {
  return setIssueStatus(issueId, 'implemented', resolverUserId, resolverNotes, getToken);
}

/**
 * Upload a screenshot (stub — ready for Supabase Storage integration).
 * @returns {Promise<string|null>} public URL or null
 */
export async function uploadScreenshot(_file, _getToken) {
  // TODO: implement with Supabase Storage when ready
  return null;
}

// ── Comments (discussion thread on an issue) ────────────────────────────────

/**
 * Fetch comments for an issue, oldest first. Enriches each row with
 * `author_display_name` when the commenter's users row is readable (admins
 * are readable via the "Authenticated can read admin profiles" policy).
 */
export async function fetchIssueComments(issueId, getToken) {
  const supabase = getClient(getToken);
  const { data, error } = await supabase
    .from('App_Issue_Comments')
    .select('*')
    .eq('issue_id', issueId)
    .order('created_at', { ascending: true });

  if (error) throw error;
  const comments = data || [];
  if (comments.length === 0) return comments;

  const authorIds = [...new Set(comments.map(c => c.author_clerk_user_id).filter(Boolean))];
  if (authorIds.length === 0) return comments;

  const { data: authors } = await supabase
    .from('users')
    .select('clerk_user_id, display_name')
    .in('clerk_user_id', authorIds);

  const nameById = new Map((authors || []).map(u => [u.clerk_user_id, u.display_name]));
  return comments.map(c => ({
    ...c,
    author_display_name: nameById.get(c.author_clerk_user_id) || null,
  }));
}

/**
 * Add a comment to an issue. The caller must be the issue submitter or an admin.
 */
export async function addIssueComment(issueId, body, clerkUserId, getToken) {
  const supabase = getClient(getToken);
  const trimmed = (body || '').trim();
  if (!trimmed) throw new Error('Comment cannot be empty');

  const { data, error } = await supabase
    .from('App_Issue_Comments')
    .insert({
      issue_id: issueId,
      author_clerk_user_id: clerkUserId,
      body: trimmed,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * Update a comment's body. Author or admin only (enforced by RLS).
 */
export async function updateIssueComment(commentId, body, getToken) {
  const supabase = getClient(getToken);
  const trimmed = (body || '').trim();
  if (!trimmed) throw new Error('Comment cannot be empty');

  const { error } = await supabase
    .from('App_Issue_Comments')
    .update({ body: trimmed })
    .eq('comment_id', commentId);

  if (error) throw error;
}

/**
 * Delete a comment. Author or admin only (enforced by RLS).
 */
export async function deleteIssueComment(commentId, getToken) {
  const supabase = getClient(getToken);
  const { error } = await supabase
    .from('App_Issue_Comments')
    .delete()
    .eq('comment_id', commentId);

  if (error) throw error;
}
