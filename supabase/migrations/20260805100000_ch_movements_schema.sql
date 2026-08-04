-- Movements & doctrinal roles for the Heresies / Christological Controversies timeline.
--
-- Two new concepts on top of the existing CH_ tables:
--   1. CH_People.doctrinal_role — where a figure stands in the doctrinal
--      controversies. Drives colour and the highlighted "Nicene line" on the
--      heresies timeline; ignored by the main church-history timeline.
--   2. CH_Movements — heresies, controversies, schisms and schools. These have
--      real spans and memberships, so they get their own table rather than
--      squeezing into CH_Events (whose event_type CHECK is deliberately left
--      alone: council | document | event | era).
--
-- Run after 20260517122000_arthuriana_seed.sql

begin;

-- ── CH_People.doctrinal_role ────────────────────────────────────────────────

alter table public."CH_People"
  add column if not exists doctrinal_role text;

comment on column public."CH_People".doctrinal_role is
  'Stance in the doctrinal controversies. Vocabulary: defender | heresiarch | '
  'contested | figure | emperor-pagan | emperor-christian | emperor-arianizing. '
  'Null means unclassified.';

-- ── CH_Movements ────────────────────────────────────────────────────────────

create table if not exists public."CH_Movements" (
  movement_id   text not null,
  name          text not null,
  kind          text not null,
  start_year    integer not null,
  end_year      integer not null,
  color         text,
  description   text,
  reference_url text,
  created_at    timestamptz not null default now(),
  constraint "CH_Movements_pkey" primary key (movement_id),
  constraint "CH_Movements_kind_check"
    check (kind in ('heresy', 'controversy', 'schism', 'school'))
);

-- ── CH_Movement_Figures ─────────────────────────────────────────────────────

create table if not exists public."CH_Movement_Figures" (
  id          bigint generated always as identity primary key,
  movement_id text not null,
  person_id   text not null,
  role        text not null,
  notes       text,
  created_at  timestamptz not null default now(),
  constraint "CH_Movement_Figures_movement_fkey" foreign key (movement_id)
    references public."CH_Movements"(movement_id) on delete cascade,
  constraint "CH_Movement_Figures_person_fkey" foreign key (person_id)
    references public."CH_People"(person_id) on delete cascade,
  constraint "CH_Movement_Figures_role_check"
    check (role in ('founder', 'proponent', 'opponent', 'associated')),
  constraint "CH_Movement_Figures_unique" unique (movement_id, person_id, role)
);

-- ── CH_Movement_Events ──────────────────────────────────────────────────────

create table if not exists public."CH_Movement_Events" (
  id          bigint generated always as identity primary key,
  movement_id text not null,
  event_id    text not null,
  relation    text not null,
  notes       text,
  created_at  timestamptz not null default now(),
  constraint "CH_Movement_Events_movement_fkey" foreign key (movement_id)
    references public."CH_Movements"(movement_id) on delete cascade,
  constraint "CH_Movement_Events_event_fkey" foreign key (event_id)
    references public."CH_Events"(event_id) on delete cascade,
  constraint "CH_Movement_Events_relation_check"
    check (relation in ('condemned_at', 'defined_at', 'sparked_by', 'related')),
  constraint "CH_Movement_Events_unique" unique (movement_id, event_id, relation)
);

-- ── Indexes ─────────────────────────────────────────────────────────────────

create index if not exists "CH_Movement_Figures_movement_idx"
  on public."CH_Movement_Figures" (movement_id);

create index if not exists "CH_Movement_Figures_person_idx"
  on public."CH_Movement_Figures" (person_id);

create index if not exists "CH_Movement_Events_movement_idx"
  on public."CH_Movement_Events" (movement_id);

create index if not exists "CH_Movement_Events_event_idx"
  on public."CH_Movement_Events" (event_id);

create index if not exists "CH_People_doctrinal_role_idx"
  on public."CH_People" (doctrinal_role);

-- ── Row Level Security: public read ─────────────────────────────────────────

alter table public."CH_Movements" enable row level security;
alter table public."CH_Movement_Figures" enable row level security;
alter table public."CH_Movement_Events" enable row level security;

drop policy if exists "Enable read access for all users" on public."CH_Movements";
create policy "Enable read access for all users" on public."CH_Movements"
  for select to public using (true);

drop policy if exists "Enable read access for all users" on public."CH_Movement_Figures";
create policy "Enable read access for all users" on public."CH_Movement_Figures"
  for select to public using (true);

drop policy if exists "Enable read access for all users" on public."CH_Movement_Events";
create policy "Enable read access for all users" on public."CH_Movement_Events"
  for select to public using (true);

-- ── Row Level Security: admin write ─────────────────────────────────────────
-- Helper expression used by every policy below (matches
-- 20260514122000_fcc_admin_write_policies.sql — note that public.admin_users was
-- renamed to public.users in 20260208190000, and the check includes role = 'admin'):
--   exists (select 1 from public.users
--           where clerk_user_id = current_setting('request.jwt.claims', true)::json->>'sub'
--             and role = 'admin')

drop policy if exists "Admins can insert movements" on public."CH_Movements";
create policy "Admins can insert movements" on public."CH_Movements"
  for insert with check (exists (select 1 from public.users
    where clerk_user_id = current_setting('request.jwt.claims', true)::json->>'sub' and role = 'admin'));
drop policy if exists "Admins can update movements" on public."CH_Movements";
create policy "Admins can update movements" on public."CH_Movements"
  for update using (exists (select 1 from public.users
    where clerk_user_id = current_setting('request.jwt.claims', true)::json->>'sub' and role = 'admin'));
drop policy if exists "Admins can delete movements" on public."CH_Movements";
create policy "Admins can delete movements" on public."CH_Movements"
  for delete using (exists (select 1 from public.users
    where clerk_user_id = current_setting('request.jwt.claims', true)::json->>'sub' and role = 'admin'));

drop policy if exists "Admins can insert movement figures" on public."CH_Movement_Figures";
create policy "Admins can insert movement figures" on public."CH_Movement_Figures"
  for insert with check (exists (select 1 from public.users
    where clerk_user_id = current_setting('request.jwt.claims', true)::json->>'sub' and role = 'admin'));
drop policy if exists "Admins can update movement figures" on public."CH_Movement_Figures";
create policy "Admins can update movement figures" on public."CH_Movement_Figures"
  for update using (exists (select 1 from public.users
    where clerk_user_id = current_setting('request.jwt.claims', true)::json->>'sub' and role = 'admin'));
drop policy if exists "Admins can delete movement figures" on public."CH_Movement_Figures";
create policy "Admins can delete movement figures" on public."CH_Movement_Figures"
  for delete using (exists (select 1 from public.users
    where clerk_user_id = current_setting('request.jwt.claims', true)::json->>'sub' and role = 'admin'));

drop policy if exists "Admins can insert movement events" on public."CH_Movement_Events";
create policy "Admins can insert movement events" on public."CH_Movement_Events"
  for insert with check (exists (select 1 from public.users
    where clerk_user_id = current_setting('request.jwt.claims', true)::json->>'sub' and role = 'admin'));
drop policy if exists "Admins can update movement events" on public."CH_Movement_Events";
create policy "Admins can update movement events" on public."CH_Movement_Events"
  for update using (exists (select 1 from public.users
    where clerk_user_id = current_setting('request.jwt.claims', true)::json->>'sub' and role = 'admin'));
drop policy if exists "Admins can delete movement events" on public."CH_Movement_Events";
create policy "Admins can delete movement events" on public."CH_Movement_Events"
  for delete using (exists (select 1 from public.users
    where clerk_user_id = current_setting('request.jwt.claims', true)::json->>'sub' and role = 'admin'));

commit;
