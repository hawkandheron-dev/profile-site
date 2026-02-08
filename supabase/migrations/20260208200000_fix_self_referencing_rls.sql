-- Fix self-referencing RLS policies on users table
--
-- The "Admins can read all users" and "Admins can update users" policies
-- queried the users table from within a policy ON the users table, causing
-- infinite recursion (500 errors from PostgREST).
--
-- Fix: create a SECURITY DEFINER function that reads the user's role
-- bypassing RLS, then use it in all policies that need an admin check.

begin;

-- ── 1. Create helper function (bypasses RLS) ─────────────────────────────────
CREATE OR REPLACE FUNCTION public.get_user_role()
RETURNS text
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT role FROM public.users
  WHERE clerk_user_id = current_setting('request.jwt.claims', true)::json->>'sub'
  LIMIT 1;
$$;

-- ── 2. Fix users table policies ──────────────────────────────────────────────

-- Drop the broken self-referencing policies
DROP POLICY IF EXISTS "Admins can read all users" ON public.users;
DROP POLICY IF EXISTS "Admins can update users" ON public.users;

-- Recreate using the helper function
CREATE POLICY "Admins can read all users" ON public.users
  FOR SELECT USING (
    public.get_user_role() = 'admin'
  );

CREATE POLICY "Admins can update users" ON public.users
  FOR UPDATE USING (
    public.get_user_role() = 'admin'
  );

-- ── 3. Update site_content policies to use the function ──────────────────────

DROP POLICY IF EXISTS "Admins can update content" ON public.site_content;
CREATE POLICY "Admins can update content" ON public.site_content
  FOR UPDATE USING (public.get_user_role() = 'admin');

DROP POLICY IF EXISTS "Admins can insert content" ON public.site_content;
CREATE POLICY "Admins can insert content" ON public.site_content
  FOR INSERT WITH CHECK (public.get_user_role() = 'admin');

DROP POLICY IF EXISTS "Admins can delete content" ON public.site_content;
CREATE POLICY "Admins can delete content" ON public.site_content
  FOR DELETE USING (public.get_user_role() = 'admin');

-- ── 4. Update CH_ table policies to use the function ─────────────────────────

-- CH_Eras
DROP POLICY IF EXISTS "Admins can update eras" ON public."CH_Eras";
CREATE POLICY "Admins can update eras" ON public."CH_Eras"
  FOR UPDATE USING (public.get_user_role() = 'admin');

DROP POLICY IF EXISTS "Admins can insert eras" ON public."CH_Eras";
CREATE POLICY "Admins can insert eras" ON public."CH_Eras"
  FOR INSERT WITH CHECK (public.get_user_role() = 'admin');

DROP POLICY IF EXISTS "Admins can delete eras" ON public."CH_Eras";
CREATE POLICY "Admins can delete eras" ON public."CH_Eras"
  FOR DELETE USING (public.get_user_role() = 'admin');

-- CH_People
DROP POLICY IF EXISTS "Admins can update people" ON public."CH_People";
CREATE POLICY "Admins can update people" ON public."CH_People"
  FOR UPDATE USING (public.get_user_role() = 'admin');

DROP POLICY IF EXISTS "Admins can insert people" ON public."CH_People";
CREATE POLICY "Admins can insert people" ON public."CH_People"
  FOR INSERT WITH CHECK (public.get_user_role() = 'admin');

DROP POLICY IF EXISTS "Admins can delete people" ON public."CH_People";
CREATE POLICY "Admins can delete people" ON public."CH_People"
  FOR DELETE USING (public.get_user_role() = 'admin');

-- CH_Events
DROP POLICY IF EXISTS "Admins can update events" ON public."CH_Events";
CREATE POLICY "Admins can update events" ON public."CH_Events"
  FOR UPDATE USING (public.get_user_role() = 'admin');

DROP POLICY IF EXISTS "Admins can insert events" ON public."CH_Events";
CREATE POLICY "Admins can insert events" ON public."CH_Events"
  FOR INSERT WITH CHECK (public.get_user_role() = 'admin');

DROP POLICY IF EXISTS "Admins can delete events" ON public."CH_Events";
CREATE POLICY "Admins can delete events" ON public."CH_Events"
  FOR DELETE USING (public.get_user_role() = 'admin');

-- ── 5. Update CH_Suggestions policies to use the function ────────────────────

DROP POLICY IF EXISTS "Admins can read all suggestions" ON public."CH_Suggestions";
CREATE POLICY "Admins can read all suggestions" ON public."CH_Suggestions"
  FOR SELECT USING (public.get_user_role() = 'admin');

DROP POLICY IF EXISTS "Contributors can insert suggestions" ON public."CH_Suggestions";
CREATE POLICY "Contributors can insert suggestions" ON public."CH_Suggestions"
  FOR INSERT WITH CHECK (
    public.get_user_role() IN ('contributor', 'admin')
    AND submitted_by = current_setting('request.jwt.claims', true)::json->>'sub'
  );

DROP POLICY IF EXISTS "Admins can update suggestions" ON public."CH_Suggestions";
CREATE POLICY "Admins can update suggestions" ON public."CH_Suggestions"
  FOR UPDATE USING (public.get_user_role() = 'admin');

DROP POLICY IF EXISTS "Admins can delete suggestions" ON public."CH_Suggestions";
CREATE POLICY "Admins can delete suggestions" ON public."CH_Suggestions"
  FOR DELETE USING (public.get_user_role() = 'admin');

commit;
