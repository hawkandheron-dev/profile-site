/**
 * User role service.
 * Queries the `users` table via the Clerk-aware Supabase client.
 */
import { makeSupabaseClient } from '../lib/supabase.ts';

/**
 * Ensure the current user has a row in the users table.
 * On first sign-in this creates a 'viewer' row; subsequent calls are no-ops.
 * Uses select-then-insert to avoid upsert RLS issues (upsert requires both
 * INSERT and UPDATE policies, but only admins can UPDATE).
 */
export async function ensureUserExists(getToken, clerkUserId, email, displayName) {
  if (!getToken || !clerkUserId) return;

  try {
    const supabase = makeSupabaseClient(getToken);

    // Check if user already exists (any role)
    const { data: existing } = await supabase
      .from('users')
      .select('clerk_user_id, display_name, email')
      .eq('clerk_user_id', clerkUserId)
      .maybeSingle();

    if (existing) {
      // Update display_name/email if they were missing (e.g. first registration
      // happened before Clerk user profile was fully loaded)
      const updates = {};
      if (!existing.display_name && displayName) updates.display_name = displayName;
      if (!existing.email && email) updates.email = email;
      if (Object.keys(updates).length > 0) {
        await supabase
          .from('users')
          .update(updates)
          .eq('clerk_user_id', clerkUserId);
      }
      return;
    }

    // Insert new viewer row. The RLS policy requires role='viewer' explicitly.
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
