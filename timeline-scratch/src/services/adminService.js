/**
 * Admin check service.
 * Queries admin_users table via the Clerk-aware Supabase client.
 */
import { makeSupabaseClient } from '../lib/supabase.ts';

/**
 * Check whether the current user is an admin.
 * Returns true if a matching row exists in admin_users.
 */
export async function checkIsAdmin(getToken, clerkUserId) {
  if (!getToken || !clerkUserId) return false;

  try {
    const supabase = makeSupabaseClient(getToken);
    const { data } = await supabase
      .from('admin_users')
      .select('clerk_user_id')
      .eq('clerk_user_id', clerkUserId)
      .maybeSingle();

    return !!data;
  } catch (err) {
    console.warn('[adminService] Admin check failed:', err);
    return false;
  }
}
