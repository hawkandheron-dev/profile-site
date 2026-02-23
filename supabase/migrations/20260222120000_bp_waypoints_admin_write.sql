-- Allow admins to manage journey waypoints (insert, update, delete)
-- Idempotent: safe to re-run if policies already exist.
begin;

drop policy if exists "Admins can insert waypoints" on public."BP_JourneyWaypoints";
create policy "Admins can insert waypoints"
  on public."BP_JourneyWaypoints"
  for insert with check (
    exists (
      select 1 from public.users
      where clerk_user_id = current_setting('request.jwt.claims', true)::json->>'sub'
        and role = 'admin'
    )
  );

drop policy if exists "Admins can update waypoints" on public."BP_JourneyWaypoints";
create policy "Admins can update waypoints"
  on public."BP_JourneyWaypoints"
  for update using (
    exists (
      select 1 from public.users
      where clerk_user_id = current_setting('request.jwt.claims', true)::json->>'sub'
        and role = 'admin'
    )
  );

drop policy if exists "Admins can delete waypoints" on public."BP_JourneyWaypoints";
create policy "Admins can delete waypoints"
  on public."BP_JourneyWaypoints"
  for delete using (
    exists (
      select 1 from public.users
      where clerk_user_id = current_setting('request.jwt.claims', true)::json->>'sub'
        and role = 'admin'
    )
  );

commit;
