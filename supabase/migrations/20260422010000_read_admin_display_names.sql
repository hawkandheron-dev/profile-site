-- Let authenticated users read admin display_names
--
-- Admins reply on App_Issue_Comments threads; contributors need to see who
-- replied. Exposing the admin row to contributors is acceptable since
-- admins are the brand-facing operators (not private users) and the other
-- columns (email, clerk_user_id, role) are non-sensitive in that context.

drop policy if exists "Authenticated can read admin profiles" on public.users;
create policy "Authenticated can read admin profiles" on public.users
  for select
  using (role = 'admin');
