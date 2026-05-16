-- Allow admins to manage First Century Church Directory data.
-- Idempotent: safe to re-run if policies already exist.

begin;

-- Helper expression used by every policy below:
--   exists (select 1 from public.users
--           where clerk_user_id = current_setting('request.jwt.claims', true)::json->>'sub'
--             and role = 'admin')

-- ── FCC_Regions ──────────────────────────────────────────────────────────────
drop policy if exists "Admins can insert regions" on public."FCC_Regions";
create policy "Admins can insert regions" on public."FCC_Regions"
  for insert with check (exists (select 1 from public.users
    where clerk_user_id = current_setting('request.jwt.claims', true)::json->>'sub' and role = 'admin'));
drop policy if exists "Admins can update regions" on public."FCC_Regions";
create policy "Admins can update regions" on public."FCC_Regions"
  for update using (exists (select 1 from public.users
    where clerk_user_id = current_setting('request.jwt.claims', true)::json->>'sub' and role = 'admin'));
drop policy if exists "Admins can delete regions" on public."FCC_Regions";
create policy "Admins can delete regions" on public."FCC_Regions"
  for delete using (exists (select 1 from public.users
    where clerk_user_id = current_setting('request.jwt.claims', true)::json->>'sub' and role = 'admin'));

-- ── FCC_Churches ─────────────────────────────────────────────────────────────
drop policy if exists "Admins can insert churches" on public."FCC_Churches";
create policy "Admins can insert churches" on public."FCC_Churches"
  for insert with check (exists (select 1 from public.users
    where clerk_user_id = current_setting('request.jwt.claims', true)::json->>'sub' and role = 'admin'));
drop policy if exists "Admins can update churches" on public."FCC_Churches";
create policy "Admins can update churches" on public."FCC_Churches"
  for update using (exists (select 1 from public.users
    where clerk_user_id = current_setting('request.jwt.claims', true)::json->>'sub' and role = 'admin'));
drop policy if exists "Admins can delete churches" on public."FCC_Churches";
create policy "Admins can delete churches" on public."FCC_Churches"
  for delete using (exists (select 1 from public.users
    where clerk_user_id = current_setting('request.jwt.claims', true)::json->>'sub' and role = 'admin'));

-- ── FCC_People ───────────────────────────────────────────────────────────────
drop policy if exists "Admins can insert people" on public."FCC_People";
create policy "Admins can insert people" on public."FCC_People"
  for insert with check (exists (select 1 from public.users
    where clerk_user_id = current_setting('request.jwt.claims', true)::json->>'sub' and role = 'admin'));
drop policy if exists "Admins can update people" on public."FCC_People";
create policy "Admins can update people" on public."FCC_People"
  for update using (exists (select 1 from public.users
    where clerk_user_id = current_setting('request.jwt.claims', true)::json->>'sub' and role = 'admin'));
drop policy if exists "Admins can delete people" on public."FCC_People";
create policy "Admins can delete people" on public."FCC_People"
  for delete using (exists (select 1 from public.users
    where clerk_user_id = current_setting('request.jwt.claims', true)::json->>'sub' and role = 'admin'));

-- ── FCC_Households ───────────────────────────────────────────────────────────
drop policy if exists "Admins can insert households" on public."FCC_Households";
create policy "Admins can insert households" on public."FCC_Households"
  for insert with check (exists (select 1 from public.users
    where clerk_user_id = current_setting('request.jwt.claims', true)::json->>'sub' and role = 'admin'));
drop policy if exists "Admins can update households" on public."FCC_Households";
create policy "Admins can update households" on public."FCC_Households"
  for update using (exists (select 1 from public.users
    where clerk_user_id = current_setting('request.jwt.claims', true)::json->>'sub' and role = 'admin'));
drop policy if exists "Admins can delete households" on public."FCC_Households";
create policy "Admins can delete households" on public."FCC_Households"
  for delete using (exists (select 1 from public.users
    where clerk_user_id = current_setting('request.jwt.claims', true)::json->>'sub' and role = 'admin'));

-- ── FCC_Memberships ──────────────────────────────────────────────────────────
drop policy if exists "Admins can insert memberships" on public."FCC_Memberships";
create policy "Admins can insert memberships" on public."FCC_Memberships"
  for insert with check (exists (select 1 from public.users
    where clerk_user_id = current_setting('request.jwt.claims', true)::json->>'sub' and role = 'admin'));
drop policy if exists "Admins can update memberships" on public."FCC_Memberships";
create policy "Admins can update memberships" on public."FCC_Memberships"
  for update using (exists (select 1 from public.users
    where clerk_user_id = current_setting('request.jwt.claims', true)::json->>'sub' and role = 'admin'));
drop policy if exists "Admins can delete memberships" on public."FCC_Memberships";
create policy "Admins can delete memberships" on public."FCC_Memberships"
  for delete using (exists (select 1 from public.users
    where clerk_user_id = current_setting('request.jwt.claims', true)::json->>'sub' and role = 'admin'));

-- ── FCC_Journeys ─────────────────────────────────────────────────────────────
drop policy if exists "Admins can insert journeys" on public."FCC_Journeys";
create policy "Admins can insert journeys" on public."FCC_Journeys"
  for insert with check (exists (select 1 from public.users
    where clerk_user_id = current_setting('request.jwt.claims', true)::json->>'sub' and role = 'admin'));
drop policy if exists "Admins can update journeys" on public."FCC_Journeys";
create policy "Admins can update journeys" on public."FCC_Journeys"
  for update using (exists (select 1 from public.users
    where clerk_user_id = current_setting('request.jwt.claims', true)::json->>'sub' and role = 'admin'));
drop policy if exists "Admins can delete journeys" on public."FCC_Journeys";
create policy "Admins can delete journeys" on public."FCC_Journeys"
  for delete using (exists (select 1 from public.users
    where clerk_user_id = current_setting('request.jwt.claims', true)::json->>'sub' and role = 'admin'));

-- ── FCC_ScriptureRefs ────────────────────────────────────────────────────────
drop policy if exists "Admins can insert scripture refs" on public."FCC_ScriptureRefs";
create policy "Admins can insert scripture refs" on public."FCC_ScriptureRefs"
  for insert with check (exists (select 1 from public.users
    where clerk_user_id = current_setting('request.jwt.claims', true)::json->>'sub' and role = 'admin'));
drop policy if exists "Admins can update scripture refs" on public."FCC_ScriptureRefs";
create policy "Admins can update scripture refs" on public."FCC_ScriptureRefs"
  for update using (exists (select 1 from public.users
    where clerk_user_id = current_setting('request.jwt.claims', true)::json->>'sub' and role = 'admin'));
drop policy if exists "Admins can delete scripture refs" on public."FCC_ScriptureRefs";
create policy "Admins can delete scripture refs" on public."FCC_ScriptureRefs"
  for delete using (exists (select 1 from public.users
    where clerk_user_id = current_setting('request.jwt.claims', true)::json->>'sub' and role = 'admin'));

-- ── FCC_JourneyStops ─────────────────────────────────────────────────────────
drop policy if exists "Admins can insert journey stops" on public."FCC_JourneyStops";
create policy "Admins can insert journey stops" on public."FCC_JourneyStops"
  for insert with check (exists (select 1 from public.users
    where clerk_user_id = current_setting('request.jwt.claims', true)::json->>'sub' and role = 'admin'));
drop policy if exists "Admins can update journey stops" on public."FCC_JourneyStops";
create policy "Admins can update journey stops" on public."FCC_JourneyStops"
  for update using (exists (select 1 from public.users
    where clerk_user_id = current_setting('request.jwt.claims', true)::json->>'sub' and role = 'admin'));
drop policy if exists "Admins can delete journey stops" on public."FCC_JourneyStops";
create policy "Admins can delete journey stops" on public."FCC_JourneyStops"
  for delete using (exists (select 1 from public.users
    where clerk_user_id = current_setting('request.jwt.claims', true)::json->>'sub' and role = 'admin'));

-- ── FCC_JourneyPeople ────────────────────────────────────────────────────────
drop policy if exists "Admins can insert journey people" on public."FCC_JourneyPeople";
create policy "Admins can insert journey people" on public."FCC_JourneyPeople"
  for insert with check (exists (select 1 from public.users
    where clerk_user_id = current_setting('request.jwt.claims', true)::json->>'sub' and role = 'admin'));
drop policy if exists "Admins can update journey people" on public."FCC_JourneyPeople";
create policy "Admins can update journey people" on public."FCC_JourneyPeople"
  for update using (exists (select 1 from public.users
    where clerk_user_id = current_setting('request.jwt.claims', true)::json->>'sub' and role = 'admin'));
drop policy if exists "Admins can delete journey people" on public."FCC_JourneyPeople";
create policy "Admins can delete journey people" on public."FCC_JourneyPeople"
  for delete using (exists (select 1 from public.users
    where clerk_user_id = current_setting('request.jwt.claims', true)::json->>'sub' and role = 'admin'));

commit;
