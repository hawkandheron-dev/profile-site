-- CH_Notes and CH_NoteConnections tables
-- Notes are owned by Clerk users and can be linked to one or more People
-- via the many-to-many CH_NoteConnections join table.

begin;

-- ── CH_Notes ─────────────────────────────────────────────────────────────
create table if not exists public."CH_Notes" (
  note_id       bigint generated always as identity primary key,
  clerk_user_id text not null,
  title         text,
  body          text not null,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create index if not exists "CH_Notes_clerk_user_id_idx"
  on public."CH_Notes" (clerk_user_id);

-- ── CH_NoteConnections (many-to-many: Notes ↔ People) ───────────────────
create table if not exists public."CH_NoteConnections" (
  id        bigint generated always as identity primary key,
  note_id   bigint not null,
  person_id text not null,
  created_at timestamptz not null default now(),
  constraint "CH_NoteConnections_note_fkey" foreign key (note_id)
    references public."CH_Notes"(note_id) on delete cascade,
  constraint "CH_NoteConnections_person_fkey" foreign key (person_id)
    references public."CH_People"(person_id) on delete cascade,
  constraint "CH_NoteConnections_unique" unique (note_id, person_id)
);

create index if not exists "CH_NoteConnections_note_id_idx"
  on public."CH_NoteConnections" (note_id);

create index if not exists "CH_NoteConnections_person_id_idx"
  on public."CH_NoteConnections" (person_id);

-- ── Row Level Security ───────────────────────────────────────────────────
alter table public."CH_Notes" enable row level security;
alter table public."CH_NoteConnections" enable row level security;

-- Users can read only their own notes
drop policy if exists "Users can read own notes" on public."CH_Notes";
create policy "Users can read own notes" on public."CH_Notes"
  for select using (
    clerk_user_id = current_setting('request.jwt.claims', true)::json->>'sub'
  );

-- Users can insert their own notes
drop policy if exists "Users can insert own notes" on public."CH_Notes";
create policy "Users can insert own notes" on public."CH_Notes"
  for insert with check (
    clerk_user_id = current_setting('request.jwt.claims', true)::json->>'sub'
  );

-- Users can update their own notes
drop policy if exists "Users can update own notes" on public."CH_Notes";
create policy "Users can update own notes" on public."CH_Notes"
  for update using (
    clerk_user_id = current_setting('request.jwt.claims', true)::json->>'sub'
  );

-- Users can delete their own notes
drop policy if exists "Users can delete own notes" on public."CH_Notes";
create policy "Users can delete own notes" on public."CH_Notes"
  for delete using (
    clerk_user_id = current_setting('request.jwt.claims', true)::json->>'sub'
  );

-- NoteConnections: users can manage connections for their own notes
drop policy if exists "Users can read own note connections" on public."CH_NoteConnections";
create policy "Users can read own note connections" on public."CH_NoteConnections"
  for select using (
    note_id in (
      select note_id from public."CH_Notes"
      where clerk_user_id = current_setting('request.jwt.claims', true)::json->>'sub'
    )
  );

drop policy if exists "Users can insert own note connections" on public."CH_NoteConnections";
create policy "Users can insert own note connections" on public."CH_NoteConnections"
  for insert with check (
    note_id in (
      select note_id from public."CH_Notes"
      where clerk_user_id = current_setting('request.jwt.claims', true)::json->>'sub'
    )
  );

drop policy if exists "Users can delete own note connections" on public."CH_NoteConnections";
create policy "Users can delete own note connections" on public."CH_NoteConnections"
  for delete using (
    note_id in (
      select note_id from public."CH_Notes"
      where clerk_user_id = current_setting('request.jwt.claims', true)::json->>'sub'
    )
  );

commit;
