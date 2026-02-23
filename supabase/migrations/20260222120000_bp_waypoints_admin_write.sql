-- Allow admins to manage journey waypoints (insert, update, delete)
begin;

create policy "Admins can insert waypoints"
  on public."BP_JourneyWaypoints"
  for insert with check (
    exists (
      select 1 from public.users
      where clerk_user_id = current_setting('request.jwt.claims', true)::json->>'sub'
        and role = 'admin'
    )
  );

create policy "Admins can update waypoints"
  on public."BP_JourneyWaypoints"
  for update using (
    exists (
      select 1 from public.users
      where clerk_user_id = current_setting('request.jwt.claims', true)::json->>'sub'
        and role = 'admin'
    )
  );

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
