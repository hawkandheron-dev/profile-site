-- Fix: let an invitee SELECT their own pending row
--
-- In Postgres, UPDATE requires the row to be visible through at least one
-- SELECT policy (since the old row is materialized during UPDATE). The
-- "Users can claim pending invite" UPDATE policy was insufficient on its
-- own because no SELECT policy matched a NULL-clerk_user_id row for a
-- non-admin authenticated user, so the claim UPDATE silently found 0 rows.
--
-- This policy narrowly exposes only the single pending row whose email
-- matches the JWT's email claim — it doesn't broaden visibility of any
-- claimed rows or admin-only fields.

drop policy if exists "Users can read own pending invite" on public.users;
create policy "Users can read own pending invite" on public.users
  for select
  using (
    clerk_user_id is null
    and lower(email) = lower(current_setting('request.jwt.claims', true)::json->>'email')
  );
