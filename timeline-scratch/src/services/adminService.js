/**
 * User role service.
 * Queries the `users` table via the Clerk-aware Supabase client.
 */
import { makeSupabaseClient } from '../lib/supabase.ts';

/**
 * Ensure the current user has a row in the users table.
 * On first sign-in this creates a 'viewer' row; subsequent calls are no-ops.
 */
export async function ensureUserExists(getToken, clerkUserId, email, displayName) {
  if (!getToken || !clerkUserId) return;

  try {
    const supabase = makeSupabaseClient(getToken);
    await supabase
      .from('users')
      .upsert(
        {
          clerk_user_id: clerkUserId,
          email: email || null,
          display_name: displayName || null,
          // role defaults to 'viewer' via the DB default — not sent here so
          // existing admin/contributor rows aren't overwritten
        },
        { onConflict: 'clerk_user_id', ignoreDuplicates: true },
      );
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
