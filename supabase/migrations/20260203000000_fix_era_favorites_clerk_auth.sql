-- Fix era_favorites table to work with Clerk authentication.
--
-- Problem: The existing table uses a `user_id` UUID column and RLS policies
-- that call `auth.uid()`, which casts the JWT `sub` claim to UUID.
-- Clerk user IDs are text strings (e.g. "user_abc123"), not UUIDs,
-- so the cast fails with error 22P02.
--
-- Solution: Replace the UUID `user_id` column with a text `clerk_user_id`
-- column and rewrite RLS policies to use `auth.jwt() ->> 'sub'` (text).

begin;

-- ── Step 1: Add clerk_user_id text column if it doesn't exist ───────────

alter table public.era_favorites
  add column if not exists clerk_user_id text;

-- ── Step 2: Migrate data from user_id to clerk_user_id if user_id exists ─

do $$
begin
  if exists (
    select 1 from information_schema.columns
    where table_schema = 'public'
      and table_name = 'era_favorites'
      and column_name = 'user_id'
  ) then
    -- Copy any existing user_id values to clerk_user_id (cast to text)
    update public.era_favorites
      set clerk_user_id = user_id::text
      where clerk_user_id is null and user_id is not null;

    -- Drop the old UUID column
    alter table public.era_favorites drop column user_id;
  end if;
end $$;

-- ── Step 3: Add index on clerk_user_id for query performance ────────────

create index if not exists era_favorites_clerk_user_id_idx
  on public.era_favorites (clerk_user_id);

-- ── Step 4: Drop all existing RLS policies on era_favorites ─────────────
-- (They likely reference auth.uid() which fails with Clerk user IDs)

do $$
declare
  pol record;
begin
  for pol in
    select policyname
    from pg_policies
    where schemaname = 'public' and tablename = 'era_favorites'
  loop
    execute format('drop policy if exists %I on public.era_favorites', pol.policyname);
  end loop;
end $$;

-- ── Step 5: Enable RLS (idempotent) ────────────────────────────────────

alter table public.era_favorites enable row level security;

-- ── Step 6: Create new RLS policies using auth.jwt() ->> 'sub' ─────────
-- This extracts the `sub` claim as text, avoiding the UUID cast.

-- Users can read only their own favorites
create policy "Users can view own favorites"
  on public.era_favorites
  for select
  using (clerk_user_id = (auth.jwt() ->> 'sub'));

-- Users can insert favorites for themselves only
create policy "Users can insert own favorites"
  on public.era_favorites
  for insert
  with check (clerk_user_id = (auth.jwt() ->> 'sub'));

-- Users can delete only their own favorites
create policy "Users can delete own favorites"
  on public.era_favorites
  for delete
  using (clerk_user_id = (auth.jwt() ->> 'sub'));

commit;
