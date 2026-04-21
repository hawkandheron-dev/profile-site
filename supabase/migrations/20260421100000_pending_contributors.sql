-- Pre-provisioned contributors (invite-by-email before sign-up)
--
-- clerk_user_id was the original PK on public.users. Since PKs cannot be
-- nullable, we add a surrogate bigint PK (user_id) and make clerk_user_id
-- a nullable UNIQUE column. No other tables have an FK on users.clerk_user_id,
-- so this restructure has no downstream blast radius.
--
-- JWT PREREQUISITE: the Clerk "supabase" JWT template must expose `email`,
-- e.g. `"email": "{{user.primary_email_address}}"`. The claim-update policy
-- below matches on that claim to prevent cross-account claims.

-- Drop existing PK on clerk_user_id
alter table public.users drop constraint admin_users_pkey;

-- Add surrogate PK (auto-fills existing rows)
alter table public.users add column user_id bigint generated always as identity;
alter table public.users add primary key (user_id);

-- clerk_user_id: nullable, unique (Postgres allows multiple NULLs in UNIQUE)
alter table public.users alter column clerk_user_id drop not null;
alter table public.users add constraint users_clerk_user_id_key unique (clerk_user_id);

-- Case-insensitive email uniqueness for pending-invite lookup on first sign-in
create unique index if not exists users_email_ci_idx
  on public.users (lower(email));

-- RLS: allow an invitee to claim their pending row on first sign-in
-- Permits UPDATE only if the row is unclaimed, the new clerk_user_id matches
-- the JWT sub, and the row email matches the JWT email — prevents cross-claims.
drop policy if exists "Users can claim pending invite" on public.users;
create policy "Users can claim pending invite" on public.users
  for update
  using (
    clerk_user_id is null
  )
  with check (
    clerk_user_id = current_setting('request.jwt.claims', true)::json->>'sub'
    and lower(email) = lower(current_setting('request.jwt.claims', true)::json->>'email')
  );
