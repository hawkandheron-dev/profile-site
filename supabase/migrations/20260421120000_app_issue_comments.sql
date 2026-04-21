-- Flat discussion threads on App_Issues submissions
--
-- Each row is one comment authored by a Clerk user on one issue. Issue
-- submitter and admins can read the full thread; they (and only they) can
-- insert. Author can edit/delete their own.

begin;

-- ── 1. Table ─────────────────────────────────────────────────────────────────

create table if not exists public."App_Issue_Comments" (
  comment_id           bigint generated always as identity primary key,
  issue_id             bigint not null references public."App_Issues"(issue_id) on delete cascade,
  author_clerk_user_id text not null,
  body                 text not null,
  created_at           timestamptz not null default now(),
  updated_at           timestamptz not null default now()
);

create index if not exists app_issue_comments_issue_created_idx
  on public."App_Issue_Comments" (issue_id, created_at);

alter table public."App_Issue_Comments" enable row level security;

-- ── 2. Updated-at trigger ────────────────────────────────────────────────────

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists app_issue_comments_set_updated_at on public."App_Issue_Comments";
create trigger app_issue_comments_set_updated_at
  before update on public."App_Issue_Comments"
  for each row
  execute function public.set_updated_at();

-- ── 3. RLS policies ──────────────────────────────────────────────────────────

-- SELECT: comment author, issue submitter, or any admin
drop policy if exists "Participants can read comments" on public."App_Issue_Comments";
create policy "Participants can read comments" on public."App_Issue_Comments"
  for select using (
    author_clerk_user_id = current_setting('request.jwt.claims', true)::json->>'sub'
    or exists (
      select 1 from public."App_Issues" i
      where i.issue_id = "App_Issue_Comments".issue_id
        and i.submitted_by = current_setting('request.jwt.claims', true)::json->>'sub'
    )
    or exists (
      select 1 from public.users
      where clerk_user_id = current_setting('request.jwt.claims', true)::json->>'sub'
        and role = 'admin'
    )
  );

-- INSERT: must sign comment as self; must be either admin OR the issue submitter
drop policy if exists "Participants can insert comments" on public."App_Issue_Comments";
create policy "Participants can insert comments" on public."App_Issue_Comments"
  for insert with check (
    author_clerk_user_id = current_setting('request.jwt.claims', true)::json->>'sub'
    and (
      exists (
        select 1 from public.users
        where clerk_user_id = current_setting('request.jwt.claims', true)::json->>'sub'
          and role = 'admin'
      )
      or exists (
        select 1 from public."App_Issues" i
        where i.issue_id = "App_Issue_Comments".issue_id
          and i.submitted_by = current_setting('request.jwt.claims', true)::json->>'sub'
      )
    )
  );

-- UPDATE: author OR admin
drop policy if exists "Author or admin can update comments" on public."App_Issue_Comments";
create policy "Author or admin can update comments" on public."App_Issue_Comments"
  for update using (
    author_clerk_user_id = current_setting('request.jwt.claims', true)::json->>'sub'
    or exists (
      select 1 from public.users
      where clerk_user_id = current_setting('request.jwt.claims', true)::json->>'sub'
        and role = 'admin'
    )
  );

-- DELETE: author OR admin
drop policy if exists "Author or admin can delete comments" on public."App_Issue_Comments";
create policy "Author or admin can delete comments" on public."App_Issue_Comments"
  for delete using (
    author_clerk_user_id = current_setting('request.jwt.claims', true)::json->>'sub'
    or exists (
      select 1 from public.users
      where clerk_user_id = current_setting('request.jwt.claims', true)::json->>'sub'
        and role = 'admin'
    )
  );

commit;
