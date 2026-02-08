/**
 * Admin / role check service.
 * Queries admin_users table via the Clerk-aware Supabase client.
 */
import { makeSupabaseClient } from '../lib/supabase.ts';

/**
 * Check the current user's role.
 * Returns { isAdmin, isContributor, role } where role is 'admin' | 'contributor' | null.
 */
export async function checkUserRole(getToken, clerkUserId) {
  if (!getToken || !clerkUserId) return { isAdmin: false, isContributor: false, role: null };

  try {
    const supabase = makeSupabaseClient(getToken);
    const { data } = await supabase
      .from('admin_users')
      .select('clerk_user_id, role')
      .eq('clerk_user_id', clerkUserId)
      .maybeSingle();

    if (!data) return { isAdmin: false, isContributor: false, role: null };

    const role = data.role || 'admin'; // default for rows without role column yet
    return {
      isAdmin: role === 'admin',
      isContributor: role === 'contributor',
      role,
    };
  } catch (err) {
    console.warn('[adminService] Role check failed:', err);
    return { isAdmin: false, isContributor: false, role: null };
  }
}

/**
 * Legacy helper — returns true if the user is an admin.
 */
export async function checkIsAdmin(getToken, clerkUserId) {
  const { isAdmin } = await checkUserRole(getToken, clerkUserId);
  return isAdmin;
}
