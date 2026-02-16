-- Complete RLS fix: consolidates all remaining issues
--
-- 1. Ensures get_user_role() SECURITY DEFINER function exists
-- 2. Fixes self-referencing policies on users table
-- 3. Updates ALL CH_ table policies to use get_user_role()
-- 4. Adds MISSING admin write policies for CH_Works, CH_Sources,
--    CH_Source_Figures, CH_Connections, CH_EventConnections, CH_NoteConnections
--
-- This migration is safe to run even if 20260208200000 was already applied;
-- every statement uses DROP IF EXISTS before CREATE.

begin;

-- ── 1. Create/replace helper function (bypasses RLS) ─────────────────────────
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

DROP POLICY IF EXISTS "Admins can read all users" ON public.users;
CREATE POLICY "Admins can read all users" ON public.users
  FOR SELECT USING (
    public.get_user_role() = 'admin'
  );

DROP POLICY IF EXISTS "Admins can update users" ON public.users;
CREATE POLICY "Admins can update users" ON public.users
  FOR UPDATE USING (
    public.get_user_role() = 'admin'
  );

-- Users can update their own row (display_name, email).
-- The trigger below prevents non-admins from changing their own role.
DROP POLICY IF EXISTS "Users can update own profile" ON public.users;
CREATE POLICY "Users can update own profile" ON public.users
  FOR UPDATE USING (
    clerk_user_id = current_setting('request.jwt.claims', true)::json->>'sub'
  )
  WITH CHECK (
    clerk_user_id = current_setting('request.jwt.claims', true)::json->>'sub'
  );

-- Prevent non-admins from escalating their own role
CREATE OR REPLACE FUNCTION public.prevent_role_self_escalation()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- If role is being changed, only admins may do so
  IF NEW.role IS DISTINCT FROM OLD.role THEN
    IF public.get_user_role() <> 'admin' THEN
      RAISE EXCEPTION 'Only admins can change user roles';
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_prevent_role_self_escalation ON public.users;
CREATE TRIGGER trg_prevent_role_self_escalation
  BEFORE UPDATE ON public.users
  FOR EACH ROW
  EXECUTE FUNCTION public.prevent_role_self_escalation();

-- ── 3. site_content policies ─────────────────────────────────────────────────

DROP POLICY IF EXISTS "Admins can update content" ON public.site_content;
CREATE POLICY "Admins can update content" ON public.site_content
  FOR UPDATE USING (public.get_user_role() = 'admin');

DROP POLICY IF EXISTS "Admins can insert content" ON public.site_content;
CREATE POLICY "Admins can insert content" ON public.site_content
  FOR INSERT WITH CHECK (public.get_user_role() = 'admin');

DROP POLICY IF EXISTS "Admins can delete content" ON public.site_content;
CREATE POLICY "Admins can delete content" ON public.site_content
  FOR DELETE USING (public.get_user_role() = 'admin');

-- ── 4. CH_Eras policies ─────────────────────────────────────────────────────

DROP POLICY IF EXISTS "Admins can update eras" ON public."CH_Eras";
CREATE POLICY "Admins can update eras" ON public."CH_Eras"
  FOR UPDATE USING (public.get_user_role() = 'admin');

DROP POLICY IF EXISTS "Admins can insert eras" ON public."CH_Eras";
CREATE POLICY "Admins can insert eras" ON public."CH_Eras"
  FOR INSERT WITH CHECK (public.get_user_role() = 'admin');

DROP POLICY IF EXISTS "Admins can delete eras" ON public."CH_Eras";
CREATE POLICY "Admins can delete eras" ON public."CH_Eras"
  FOR DELETE USING (public.get_user_role() = 'admin');

-- ── 5. CH_People policies ───────────────────────────────────────────────────

DROP POLICY IF EXISTS "Admins can update people" ON public."CH_People";
CREATE POLICY "Admins can update people" ON public."CH_People"
  FOR UPDATE USING (public.get_user_role() = 'admin');

DROP POLICY IF EXISTS "Admins can insert people" ON public."CH_People";
CREATE POLICY "Admins can insert people" ON public."CH_People"
  FOR INSERT WITH CHECK (public.get_user_role() = 'admin');

DROP POLICY IF EXISTS "Admins can delete people" ON public."CH_People";
CREATE POLICY "Admins can delete people" ON public."CH_People"
  FOR DELETE USING (public.get_user_role() = 'admin');

-- ── 6. CH_Events policies ───────────────────────────────────────────────────

DROP POLICY IF EXISTS "Admins can update events" ON public."CH_Events";
CREATE POLICY "Admins can update events" ON public."CH_Events"
  FOR UPDATE USING (public.get_user_role() = 'admin');

DROP POLICY IF EXISTS "Admins can insert events" ON public."CH_Events";
CREATE POLICY "Admins can insert events" ON public."CH_Events"
  FOR INSERT WITH CHECK (public.get_user_role() = 'admin');

DROP POLICY IF EXISTS "Admins can delete events" ON public."CH_Events";
CREATE POLICY "Admins can delete events" ON public."CH_Events"
  FOR DELETE USING (public.get_user_role() = 'admin');

-- ── 7. CH_Works policies (NEW — were missing) ──────────────────────────────

DROP POLICY IF EXISTS "Admins can update works" ON public."CH_Works";
CREATE POLICY "Admins can update works" ON public."CH_Works"
  FOR UPDATE USING (public.get_user_role() = 'admin');

DROP POLICY IF EXISTS "Admins can insert works" ON public."CH_Works";
CREATE POLICY "Admins can insert works" ON public."CH_Works"
  FOR INSERT WITH CHECK (public.get_user_role() = 'admin');

DROP POLICY IF EXISTS "Admins can delete works" ON public."CH_Works";
CREATE POLICY "Admins can delete works" ON public."CH_Works"
  FOR DELETE USING (public.get_user_role() = 'admin');

-- ── 8. CH_Sources policies (NEW — were missing) ────────────────────────────

DROP POLICY IF EXISTS "Admins can update sources" ON public."CH_Sources";
CREATE POLICY "Admins can update sources" ON public."CH_Sources"
  FOR UPDATE USING (public.get_user_role() = 'admin');

DROP POLICY IF EXISTS "Admins can insert sources" ON public."CH_Sources";
CREATE POLICY "Admins can insert sources" ON public."CH_Sources"
  FOR INSERT WITH CHECK (public.get_user_role() = 'admin');

DROP POLICY IF EXISTS "Admins can delete sources" ON public."CH_Sources";
CREATE POLICY "Admins can delete sources" ON public."CH_Sources"
  FOR DELETE USING (public.get_user_role() = 'admin');

-- ── 9. CH_Source_Figures policies (NEW — were missing) ─────────────────────

DROP POLICY IF EXISTS "Admins can update source_figures" ON public."CH_Source_Figures";
CREATE POLICY "Admins can update source_figures" ON public."CH_Source_Figures"
  FOR UPDATE USING (public.get_user_role() = 'admin');

DROP POLICY IF EXISTS "Admins can insert source_figures" ON public."CH_Source_Figures";
CREATE POLICY "Admins can insert source_figures" ON public."CH_Source_Figures"
  FOR INSERT WITH CHECK (public.get_user_role() = 'admin');

DROP POLICY IF EXISTS "Admins can delete source_figures" ON public."CH_Source_Figures";
CREATE POLICY "Admins can delete source_figures" ON public."CH_Source_Figures"
  FOR DELETE USING (public.get_user_role() = 'admin');

-- ── 10. CH_Connections policies (NEW — were missing) ───────────────────────

DROP POLICY IF EXISTS "Admins can update connections" ON public."CH_Connections";
CREATE POLICY "Admins can update connections" ON public."CH_Connections"
  FOR UPDATE USING (public.get_user_role() = 'admin');

DROP POLICY IF EXISTS "Admins can insert connections" ON public."CH_Connections";
CREATE POLICY "Admins can insert connections" ON public."CH_Connections"
  FOR INSERT WITH CHECK (public.get_user_role() = 'admin');

DROP POLICY IF EXISTS "Admins can delete connections" ON public."CH_Connections";
CREATE POLICY "Admins can delete connections" ON public."CH_Connections"
  FOR DELETE USING (public.get_user_role() = 'admin');

-- ── 11. CH_EventConnections policies (NEW — were missing) ──────────────────

DROP POLICY IF EXISTS "Admins can update event_connections" ON public."CH_EventConnections";
CREATE POLICY "Admins can update event_connections" ON public."CH_EventConnections"
  FOR UPDATE USING (public.get_user_role() = 'admin');

DROP POLICY IF EXISTS "Admins can insert event_connections" ON public."CH_EventConnections";
CREATE POLICY "Admins can insert event_connections" ON public."CH_EventConnections"
  FOR INSERT WITH CHECK (public.get_user_role() = 'admin');

DROP POLICY IF EXISTS "Admins can delete event_connections" ON public."CH_EventConnections";
CREATE POLICY "Admins can delete event_connections" ON public."CH_EventConnections"
  FOR DELETE USING (public.get_user_role() = 'admin');

-- ── 12. CH_Suggestions policies ────────────────────────────────────────────

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
