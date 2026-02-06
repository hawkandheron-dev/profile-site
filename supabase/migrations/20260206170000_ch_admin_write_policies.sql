-- Admin write policies for Church History tables
-- Allows admin users (checked against admin_users table) to INSERT, UPDATE, DELETE
-- on CH_Eras, CH_People, and CH_Events.

begin;

-- ── Helper: reusable admin check expression ─────────────────────────────────
-- All policies below check: does a row in admin_users exist for the current JWT sub?

-- ── CH_Eras ─────────────────────────────────────────────────────────────────

drop policy if exists "Admins can update eras" on public."CH_Eras";
create policy "Admins can update eras" on public."CH_Eras"
  for update using (
    exists (
      select 1 from public.admin_users
      where clerk_user_id = current_setting('request.jwt.claims', true)::json->>'sub'
    )
  );

drop policy if exists "Admins can insert eras" on public."CH_Eras";
create policy "Admins can insert eras" on public."CH_Eras"
  for insert with check (
    exists (
      select 1 from public.admin_users
      where clerk_user_id = current_setting('request.jwt.claims', true)::json->>'sub'
    )
  );

drop policy if exists "Admins can delete eras" on public."CH_Eras";
create policy "Admins can delete eras" on public."CH_Eras"
  for delete using (
    exists (
      select 1 from public.admin_users
      where clerk_user_id = current_setting('request.jwt.claims', true)::json->>'sub'
    )
  );

-- ── CH_People ───────────────────────────────────────────────────────────────

drop policy if exists "Admins can update people" on public."CH_People";
create policy "Admins can update people" on public."CH_People"
  for update using (
    exists (
      select 1 from public.admin_users
      where clerk_user_id = current_setting('request.jwt.claims', true)::json->>'sub'
    )
  );

drop policy if exists "Admins can insert people" on public."CH_People";
create policy "Admins can insert people" on public."CH_People"
  for insert with check (
    exists (
      select 1 from public.admin_users
      where clerk_user_id = current_setting('request.jwt.claims', true)::json->>'sub'
    )
  );

drop policy if exists "Admins can delete people" on public."CH_People";
create policy "Admins can delete people" on public."CH_People"
  for delete using (
    exists (
      select 1 from public.admin_users
      where clerk_user_id = current_setting('request.jwt.claims', true)::json->>'sub'
    )
  );

-- ── CH_Events ───────────────────────────────────────────────────────────────

drop policy if exists "Admins can update events" on public."CH_Events";
create policy "Admins can update events" on public."CH_Events"
  for update using (
    exists (
      select 1 from public.admin_users
      where clerk_user_id = current_setting('request.jwt.claims', true)::json->>'sub'
    )
  );

drop policy if exists "Admins can insert events" on public."CH_Events";
create policy "Admins can insert events" on public."CH_Events"
  for insert with check (
    exists (
      select 1 from public.admin_users
      where clerk_user_id = current_setting('request.jwt.claims', true)::json->>'sub'
    )
  );

drop policy if exists "Admins can delete events" on public."CH_Events";
create policy "Admins can delete events" on public."CH_Events"
  for delete using (
    exists (
      select 1 from public.admin_users
      where clerk_user_id = current_setting('request.jwt.claims', true)::json->>'sub'
    )
  );

commit;
