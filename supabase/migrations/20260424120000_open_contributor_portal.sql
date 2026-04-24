-- Open the Contributor Portal to the whole contributor pool.
--
-- The portal is now an open-collab space with a closed roster: anyone whose
-- users.role is 'contributor' or 'admin' can see every contribution and
-- participate in every discussion. Edits and deletes remain restricted to
-- the original author (or an admin). Viewers, unauthenticated users, and
-- anyone not yet in public.users still see nothing.
begin;

-- ── App_Issues: read ─────────────────────────────────────────────────────────

-- Replace the per-user and admin-only SELECT policies with a single
-- contributor-or-admin policy.
drop policy if exists "Users can read own issues" on public."App_Issues";
drop policy if exists "Admins can read all issues" on public."App_Issues";

create policy "Contributors can read all issues" on public."App_Issues"
  for select using (
    exists (
      select 1 from public.users
      where clerk_user_id = current_setting('request.jwt.claims', true)::json->>'sub'
        and role in ('contributor', 'admin')
    )
  );

-- ── App_Issue_Comments: read ─────────────────────────────────────────────────

drop policy if exists "Participants can read comments" on public."App_Issue_Comments";

create policy "Contributors can read comments" on public."App_Issue_Comments"
  for select using (
    exists (
      select 1 from public.users
      where clerk_user_id = current_setting('request.jwt.claims', true)::json->>'sub'
        and role in ('contributor', 'admin')
    )
  );

-- ── App_Issue_Comments: insert ───────────────────────────────────────────────

-- Any contributor or admin can post on any issue, but they must sign the
-- comment with their own Clerk id.
drop policy if exists "Participants can insert comments" on public."App_Issue_Comments";

create policy "Contributors can insert comments" on public."App_Issue_Comments"
  for insert with check (
    author_clerk_user_id = current_setting('request.jwt.claims', true)::json->>'sub'
    and exists (
      select 1 from public.users
      where clerk_user_id = current_setting('request.jwt.claims', true)::json->>'sub'
        and role in ('contributor', 'admin')
    )
  );

commit;
