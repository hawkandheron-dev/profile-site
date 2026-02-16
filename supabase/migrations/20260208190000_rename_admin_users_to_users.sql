-- Rename admin_users → users, add 'viewer' role, auto-upsert on login
--
-- This migration:
-- 1. Renames admin_users to users
-- 2. Expands the role check to include 'viewer'
-- 3. Allows any authenticated user to upsert their own row (self-registration)
-- 4. Recreates all RLS policies that referenced admin_users to use users instead

begin;

-- ── 1. Rename the table ──────────────────────────────────────────────────────
ALTER TABLE public.admin_users RENAME TO users;

-- ── 2. Expand the role constraint to include 'viewer' ────────────────────────
-- Drop the existing check constraint added by the previous migration
ALTER TABLE public.users DROP CONSTRAINT IF EXISTS admin_users_role_check;
-- Also try the auto-generated name pattern
ALTER TABLE public.users DROP CONSTRAINT IF EXISTS users_role_check;

ALTER TABLE public.users
  ADD CONSTRAINT users_role_check CHECK (role IN ('admin', 'contributor', 'viewer'));

-- Change the default role to 'viewer' so new self-registered users start as viewers
ALTER TABLE public.users ALTER COLUMN role SET DEFAULT 'viewer';

-- ── 3. Update RLS on users table ─────────────────────────────────────────────

-- Drop old policies (they reference admin_users internally but the table is renamed)
DROP POLICY IF EXISTS "Admins can read own record" ON public.users;

-- Any authenticated user can read their own row (to check their role)
CREATE POLICY "Users can read own record" ON public.users
  FOR SELECT USING (
    clerk_user_id = current_setting('request.jwt.claims', true)::json->>'sub'
  );

-- Admins can read all user rows (for user management)
CREATE POLICY "Admins can read all users" ON public.users
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.users u
      WHERE u.clerk_user_id = current_setting('request.jwt.claims', true)::json->>'sub'
        AND u.role = 'admin'
    )
  );

-- Any authenticated user can insert their own row (self-registration)
-- The check ensures they can only create a row for themselves and only as 'viewer'
DROP POLICY IF EXISTS "Users can self-register" ON public.users;
CREATE POLICY "Users can self-register" ON public.users
  FOR INSERT WITH CHECK (
    clerk_user_id = current_setting('request.jwt.claims', true)::json->>'sub'
    AND role = 'viewer'
  );

-- Admins can update any user row (to promote viewer → contributor, etc.)
DROP POLICY IF EXISTS "Admins can update users" ON public.users;
CREATE POLICY "Admins can update users" ON public.users
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.users u
      WHERE u.clerk_user_id = current_setting('request.jwt.claims', true)::json->>'sub'
        AND u.role = 'admin'
    )
  );

-- ── 4. Recreate site_content policies (they reference admin_users, now users) ─

DROP POLICY IF EXISTS "Admins can update content" ON public.site_content;
CREATE POLICY "Admins can update content" ON public.site_content
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE clerk_user_id = current_setting('request.jwt.claims', true)::json->>'sub'
        AND role = 'admin'
    )
  );

DROP POLICY IF EXISTS "Admins can insert content" ON public.site_content;
CREATE POLICY "Admins can insert content" ON public.site_content
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE clerk_user_id = current_setting('request.jwt.claims', true)::json->>'sub'
        AND role = 'admin'
    )
  );

DROP POLICY IF EXISTS "Admins can delete content" ON public.site_content;
CREATE POLICY "Admins can delete content" ON public.site_content
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE clerk_user_id = current_setting('request.jwt.claims', true)::json->>'sub'
        AND role = 'admin'
    )
  );

-- ── 5. Recreate CH_ table admin write policies ──────────────────────────────

-- CH_Eras
DROP POLICY IF EXISTS "Admins can update eras" ON public."CH_Eras";
CREATE POLICY "Admins can update eras" ON public."CH_Eras"
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM public.users WHERE clerk_user_id = current_setting('request.jwt.claims', true)::json->>'sub' AND role = 'admin')
  );

DROP POLICY IF EXISTS "Admins can insert eras" ON public."CH_Eras";
CREATE POLICY "Admins can insert eras" ON public."CH_Eras"
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM public.users WHERE clerk_user_id = current_setting('request.jwt.claims', true)::json->>'sub' AND role = 'admin')
  );

DROP POLICY IF EXISTS "Admins can delete eras" ON public."CH_Eras";
CREATE POLICY "Admins can delete eras" ON public."CH_Eras"
  FOR DELETE USING (
    EXISTS (SELECT 1 FROM public.users WHERE clerk_user_id = current_setting('request.jwt.claims', true)::json->>'sub' AND role = 'admin')
  );

-- CH_People
DROP POLICY IF EXISTS "Admins can update people" ON public."CH_People";
CREATE POLICY "Admins can update people" ON public."CH_People"
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM public.users WHERE clerk_user_id = current_setting('request.jwt.claims', true)::json->>'sub' AND role = 'admin')
  );

DROP POLICY IF EXISTS "Admins can insert people" ON public."CH_People";
CREATE POLICY "Admins can insert people" ON public."CH_People"
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM public.users WHERE clerk_user_id = current_setting('request.jwt.claims', true)::json->>'sub' AND role = 'admin')
  );

DROP POLICY IF EXISTS "Admins can delete people" ON public."CH_People";
CREATE POLICY "Admins can delete people" ON public."CH_People"
  FOR DELETE USING (
    EXISTS (SELECT 1 FROM public.users WHERE clerk_user_id = current_setting('request.jwt.claims', true)::json->>'sub' AND role = 'admin')
  );

-- CH_Events
DROP POLICY IF EXISTS "Admins can update events" ON public."CH_Events";
CREATE POLICY "Admins can update events" ON public."CH_Events"
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM public.users WHERE clerk_user_id = current_setting('request.jwt.claims', true)::json->>'sub' AND role = 'admin')
  );

DROP POLICY IF EXISTS "Admins can insert events" ON public."CH_Events";
CREATE POLICY "Admins can insert events" ON public."CH_Events"
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM public.users WHERE clerk_user_id = current_setting('request.jwt.claims', true)::json->>'sub' AND role = 'admin')
  );

DROP POLICY IF EXISTS "Admins can delete events" ON public."CH_Events";
CREATE POLICY "Admins can delete events" ON public."CH_Events"
  FOR DELETE USING (
    EXISTS (SELECT 1 FROM public.users WHERE clerk_user_id = current_setting('request.jwt.claims', true)::json->>'sub' AND role = 'admin')
  );

-- ── 6. Recreate CH_Suggestions policies ──────────────────────────────────────

DROP POLICY IF EXISTS "Users can read own suggestions" ON public."CH_Suggestions";
CREATE POLICY "Users can read own suggestions" ON public."CH_Suggestions"
  FOR SELECT USING (
    submitted_by = current_setting('request.jwt.claims', true)::json->>'sub'
  );

DROP POLICY IF EXISTS "Admins can read all suggestions" ON public."CH_Suggestions";
CREATE POLICY "Admins can read all suggestions" ON public."CH_Suggestions"
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE clerk_user_id = current_setting('request.jwt.claims', true)::json->>'sub'
        AND role = 'admin'
    )
  );

DROP POLICY IF EXISTS "Contributors can insert suggestions" ON public."CH_Suggestions";
CREATE POLICY "Contributors can insert suggestions" ON public."CH_Suggestions"
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE clerk_user_id = current_setting('request.jwt.claims', true)::json->>'sub'
        AND role IN ('contributor', 'admin')
    )
    AND submitted_by = current_setting('request.jwt.claims', true)::json->>'sub'
  );

DROP POLICY IF EXISTS "Admins can update suggestions" ON public."CH_Suggestions";
CREATE POLICY "Admins can update suggestions" ON public."CH_Suggestions"
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE clerk_user_id = current_setting('request.jwt.claims', true)::json->>'sub'
        AND role = 'admin'
    )
  );

DROP POLICY IF EXISTS "Admins can delete suggestions" ON public."CH_Suggestions";
CREATE POLICY "Admins can delete suggestions" ON public."CH_Suggestions"
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE clerk_user_id = current_setting('request.jwt.claims', true)::json->>'sub'
        AND role = 'admin'
    )
  );

commit;
