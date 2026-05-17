/**
 * User role service.
 * Queries the `users` table via the Clerk-aware Supabase client.
 */
import { makeSupabaseClient } from '../lib/supabase.ts';

/**
 * Ensure the current user has a row in the users table.
 *
 * Order of operations on sign-in:
 *   1. If a row already exists for this clerk_user_id, backfill missing
 *      display_name/email and return.
 *   2. Otherwise, try to CLAIM a pending-invite row (clerk_user_id IS NULL)
 *      matching this user's email — admins pre-seed these with
 *      role='contributor'. The "Users can claim pending invite" RLS policy
 *      enforces the email match against the JWT's email claim.
 *   3. Otherwise, INSERT a new viewer row (self-registration).
 */
export async function ensureUserExists(getToken, clerkUserId, email, displayName) {
  if (!getToken || !clerkUserId) return;

  try {
    const supabase = makeSupabaseClient(getToken);

    // 1. Existing claimed row?
    const { data: existing } = await supabase
      .from('users')
      .select('clerk_user_id, display_name, email')
      .eq('clerk_user_id', clerkUserId)
      .maybeSingle();

    if (existing) {
      const updates = {};
      if (displayName && displayName !== existing.display_name) updates.display_name = displayName;
      if (!existing.email && email) updates.email = email;
      if (Object.keys(updates).length > 0) {
        await supabase
          .from('users')
          .update(updates)
          .eq('clerk_user_id', clerkUserId);
      }
      return;
    }

    // 2. Pending invite for this email?
    if (email) {
      const normalizedEmail = email.toLowerCase();
      const { data: claimed, error: claimErr } = await supabase
        .from('users')
        .update({
          clerk_user_id: clerkUserId,
          display_name: displayName || null,
        })
        .is('clerk_user_id', null)
        .ilike('email', normalizedEmail)
        .select('clerk_user_id, role')
        .maybeSingle();

      if (!claimErr && claimed) {
        // Invite claimed — role stays as pre-seeded (e.g. 'contributor')
        return;
      }
      if (claimErr && claimErr.code !== 'PGRST116') {
        // PGRST116 = no rows matched; anything else is unexpected
        console.warn('[adminService] pending-invite claim failed:', claimErr);
      }
    }

    // 3. Fall back to self-register as viewer
    const { error } = await supabase
      .from('users')
      .insert({
        clerk_user_id: clerkUserId,
        email: email || null,
        display_name: displayName || null,
        role: 'viewer',
      });

    if (error) {
      // 23505 = unique_violation — another request beat us to it, that's fine
      if (error.code === '23505') return;
      console.warn('[adminService] ensureUserExists insert failed:', error);
    }
  } catch (err) {
    // Non-fatal — the user can still browse; they just won't have a row yet
    console.warn('[adminService] ensureUserExists failed:', err);
  }
}

/**
 * Check the current user's role.
 * Returns { isAdmin, isContributor, isViewer, role }.
 */
export async function checkUserRole(getToken, clerkUserId) {
  if (!getToken || !clerkUserId) return { isAdmin: false, isContributor: false, isViewer: false, role: null };

  try {
    const supabase = makeSupabaseClient(getToken);
    const { data } = await supabase
      .from('users')
      .select('clerk_user_id, role')
      .eq('clerk_user_id', clerkUserId)
      .maybeSingle();

    if (!data) return { isAdmin: false, isContributor: false, isViewer: false, role: null };

    const role = data.role || 'viewer';
    return {
      isAdmin: role === 'admin',
      isContributor: role === 'contributor',
      isViewer: role === 'viewer',
      role,
    };
  } catch (err) {
    console.warn('[adminService] Role check failed:', err);
    return { isAdmin: false, isContributor: false, isViewer: false, role: null };
  }
}

/**
 * Legacy helper — returns true if the user is an admin.
 */
export async function checkIsAdmin(getToken, clerkUserId) {
  const { isAdmin } = await checkUserRole(getToken, clerkUserId);
  return isAdmin;
}
