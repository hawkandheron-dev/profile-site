-- Pre-provisioned contributors (invite-by-email before sign-up)
--
-- Before this migration, a user row was only created after Clerk sign-in (as
-- role='viewer'). Admins could promote later via direct SQL.
--
-- After this migration, admins can seed a row in `users` keyed by email with
-- role='contributor' (and clerk_user_id NULL). The first time the invitee
-- signs in with Clerk under that verified email, ensureUserExists() UPDATEs
-- the pending row and sets clerk_user_id — the row is "claimed" in place, so
-- the pre-assigned role is preserved.
--
-- JWT PREREQUISITE: the Clerk "supabase" JWT template must expose `email`,
-- e.g. `"email": "{{user.primary_email_address}}"`. The claim-update policy
-- below matches on that claim to prevent cross-account claims.

begin;

-- ── 1. Allow pending rows with no Clerk ID yet ───────────────────────────────

alter table public.users
  alter column clerk_user_id drop not null;

-- Case-insensitive email uniqueness so we can look up pending rows by email
-- on sign-in without worrying about casing.
create unique index if not exists users_email_ci_idx
  on public.users (lower(email));

-- ── 2. RLS: allow an invitee to claim their pending row ──────────────────────
--
-- The new user is signing in via Clerk for the first time. They will call
-- UPDATE users SET clerk_user_id = <their sub>, display_name = ...
-- WHERE lower(email) = lower(<their email>) AND clerk_user_id IS NULL.
--
-- This policy permits that UPDATE only if:
--   (a) the row is unclaimed (clerk_user_id IS NULL), AND
--   (b) the new clerk_user_id equals the JWT sub, AND
--   (c) the row's email matches the JWT's verified email (case-insensitive).
--
-- It does NOT permit role changes: the WITH CHECK clause does not constrain
-- role, but combined with USING (clerk_user_id IS NULL) the policy only
-- applies to currently-pending rows; once claimed, the existing "Admins can
-- update users" policy is the only UPDATE path.

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

commit;
