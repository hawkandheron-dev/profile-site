-- Cross-app issue reporting system
-- Contributors can submit issues; admins can read/resolve all.
begin;

-- ── 1. App_Issues table ───────────────────────────────────────────────────────

create table if not exists public."App_Issues" (
  issue_id        bigint generated always as identity primary key,
  app_id          text not null,                              -- 'bible-atlas', 'ch-timeline'
  submitted_by    text not null,                              -- clerk_user_id
  title           text not null,
  description     text not null,                              -- free-form primary input
  issue_type      text not null default 'general'
    check (issue_type in ('general', 'data_correction', 'feature_request', 'bug')),
  page_context    jsonb,                                      -- auto-captured app state
  screenshot_urls text[] not null default '{}',               -- reserved for future Supabase Storage
  status          text not null default 'open'
    check (status in ('open', 'in_progress', 'resolved', 'closed')),
  resolver_notes  text,
  resolved_by     text,                                       -- clerk_user_id of resolver
  created_at      timestamptz not null default now(),
  resolved_at     timestamptz
);

create index if not exists app_issues_app_status_idx
  on public."App_Issues" (app_id, status);
create index if not exists app_issues_submitted_by_idx
  on public."App_Issues" (submitted_by);

alter table public."App_Issues" enable row level security;

-- ── 2. RLS policies ──────────────────────────────────────────────────────────

-- Contributors can read their own issues
drop policy if exists "Users can read own issues" on public."App_Issues";
create policy "Users can read own issues" on public."App_Issues"
  for select using (
    submitted_by = current_setting('request.jwt.claims', true)::json->>'sub'
  );

-- Admins can read ALL issues
drop policy if exists "Admins can read all issues" on public."App_Issues";
create policy "Admins can read all issues" on public."App_Issues"
  for select using (
    exists (
      select 1 from public.users
      where clerk_user_id = current_setting('request.jwt.claims', true)::json->>'sub'
        and role = 'admin'
    )
  );

-- Contributors (anyone in users with contributor or admin role) can insert own issues
drop policy if exists "Contributors can insert issues" on public."App_Issues";
create policy "Contributors can insert issues" on public."App_Issues"
  for insert with check (
    exists (
      select 1 from public.users
      where clerk_user_id = current_setting('request.jwt.claims', true)::json->>'sub'
        and role in ('contributor', 'admin')
    )
    and submitted_by = current_setting('request.jwt.claims', true)::json->>'sub'
  );

-- Only admins can update issues (resolve/close)
drop policy if exists "Admins can update issues" on public."App_Issues";
create policy "Admins can update issues" on public."App_Issues"
  for update using (
    exists (
      select 1 from public.users
      where clerk_user_id = current_setting('request.jwt.claims', true)::json->>'sub'
        and role = 'admin'
    )
  );

commit;
