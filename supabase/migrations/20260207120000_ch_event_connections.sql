-- CH_EventConnections: many-to-many join between Events and People.
-- Allows events/texts to be related to people (e.g. an author or participant).

begin;

-- ── CH_EventConnections ─────────────────────────────────────────────────
create table if not exists public."CH_EventConnections" (
  id        bigint generated always as identity primary key,
  event_id  text not null,
  person_id text not null,
  created_at timestamptz not null default now(),
  constraint "CH_EventConnections_event_fkey" foreign key (event_id)
    references public."CH_Events"(event_id) on delete cascade,
  constraint "CH_EventConnections_person_fkey" foreign key (person_id)
    references public."CH_People"(person_id) on delete cascade,
  constraint "CH_EventConnections_unique" unique (event_id, person_id)
);

create index if not exists "CH_EventConnections_event_id_idx"
  on public."CH_EventConnections" (event_id);

create index if not exists "CH_EventConnections_person_id_idx"
  on public."CH_EventConnections" (person_id);

-- ── Row Level Security ────────────────────────────────────────────────
alter table public."CH_EventConnections" enable row level security;

-- Public read access (same as other CH tables)
drop policy if exists "Enable read access for all users" on public."CH_EventConnections";
create policy "Enable read access for all users" on public."CH_EventConnections"
  for select to public using (true);

commit;
