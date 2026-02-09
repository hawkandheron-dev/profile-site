-- Contributor suggestions system
-- 1. Adds a 'role' column to admin_users so we can distinguish admin vs contributor
-- 2. Creates CH_Suggestions table for contributor-submitted changes
-- 3. RLS policies: contributors can insert/read own suggestions; admins can read/update all

begin;

-- ── 1. Add role column to admin_users ────────────────────────────────────────
ALTER TABLE public.admin_users
  ADD COLUMN IF NOT EXISTS role text NOT NULL DEFAULT 'admin'
    CHECK (role IN ('admin', 'contributor'));

-- Allow any authenticated user to check their own row (needed for contributor check too)
-- The existing "Admins can read own record" policy already covers this since contributors
-- are also in admin_users. No change needed there.

-- ── 2. CH_Suggestions table ──────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public."CH_Suggestions" (
  suggestion_id  bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  entity_type    text NOT NULL CHECK (entity_type IN ('person', 'event', 'era')),
  entity_id      text,  -- NULL = new entry; populated = edit to existing record
  suggested_data jsonb NOT NULL DEFAULT '{}',
  submitted_by   text NOT NULL,  -- clerk_user_id
  status         text NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'approved', 'rejected')),
  reviewer_notes text,
  created_at     timestamptz NOT NULL DEFAULT now(),
  reviewed_at    timestamptz,
  reviewed_by    text  -- clerk_user_id of the admin who reviewed
);

CREATE INDEX IF NOT EXISTS ch_suggestions_status_idx
  ON public."CH_Suggestions" (status);
CREATE INDEX IF NOT EXISTS ch_suggestions_submitted_by_idx
  ON public."CH_Suggestions" (submitted_by);

ALTER TABLE public."CH_Suggestions" ENABLE ROW LEVEL SECURITY;

-- ── 3. RLS policies for CH_Suggestions ───────────────────────────────────────

-- Contributors & admins can read their own suggestions
DROP POLICY IF EXISTS "Users can read own suggestions" ON public."CH_Suggestions";
CREATE POLICY "Users can read own suggestions" ON public."CH_Suggestions"
  FOR SELECT USING (
    submitted_by = current_setting('request.jwt.claims', true)::json->>'sub'
  );

-- Admins can read ALL suggestions (for the review page)
DROP POLICY IF EXISTS "Admins can read all suggestions" ON public."CH_Suggestions";
CREATE POLICY "Admins can read all suggestions" ON public."CH_Suggestions"
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.admin_users
      WHERE clerk_user_id = current_setting('request.jwt.claims', true)::json->>'sub'
        AND role = 'admin'
    )
  );

-- Contributors & admins (anyone in admin_users) can insert suggestions
DROP POLICY IF EXISTS "Contributors can insert suggestions" ON public."CH_Suggestions";
CREATE POLICY "Contributors can insert suggestions" ON public."CH_Suggestions"
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.admin_users
      WHERE clerk_user_id = current_setting('request.jwt.claims', true)::json->>'sub'
    )
    AND submitted_by = current_setting('request.jwt.claims', true)::json->>'sub'
  );

-- Only admins can update suggestions (approve/reject)
DROP POLICY IF EXISTS "Admins can update suggestions" ON public."CH_Suggestions";
CREATE POLICY "Admins can update suggestions" ON public."CH_Suggestions"
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.admin_users
      WHERE clerk_user_id = current_setting('request.jwt.claims', true)::json->>'sub'
        AND role = 'admin'
    )
  );

-- Only admins can delete suggestions
DROP POLICY IF EXISTS "Admins can delete suggestions" ON public."CH_Suggestions";
CREATE POLICY "Admins can delete suggestions" ON public."CH_Suggestions"
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.admin_users
      WHERE clerk_user_id = current_setting('request.jwt.claims', true)::json->>'sub'
        AND role = 'admin'
    )
  );

commit;
