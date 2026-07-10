-- Worship Scheduler: initial schema
-- Standalone Supabase project (separate from all windhover data).
-- Auth: Supabase Auth (magic link). Admin access gated by ws_admins.

create extension if not exists pgcrypto;

-- ── ws_admins ───────────────────────────────────────────────────────────────
create table if not exists public.ws_admins (
  email      text primary key,
  created_at timestamptz not null default now()
);

-- ── people ──────────────────────────────────────────────────────────────────
create table if not exists public.ws_people (
  id           uuid primary key default gen_random_uuid(),
  first_name   text not null,
  last_name    text not null default '',
  display_name text not null unique,
  email        text,
  phone        text,
  instruments  text[] not null default '{}',
  can_lead     boolean not null default false,
  location     text,
  notes        text,
  active       boolean not null default true,
  created_at   timestamptz not null default now()
);

-- ── roles (positions on a Sunday) ───────────────────────────────────────────
create table if not exists public.ws_roles (
  id         serial primary key,
  name       text not null unique,
  sort_order integer not null default 0
);

-- ── sub-teams ───────────────────────────────────────────────────────────────
create table if not exists public.ws_teams (
  id    uuid primary key default gen_random_uuid(),
  name  text not null unique,
  notes text
);

create table if not exists public.ws_team_members (
  team_id   uuid not null references public.ws_teams(id) on delete cascade,
  person_id uuid not null references public.ws_people(id) on delete cascade,
  role_id   integer not null references public.ws_roles(id),
  primary key (team_id, person_id)
);

-- ── services (one row per Sunday gathering) ─────────────────────────────────
create table if not exists public.ws_services (
  id              uuid primary key default gen_random_uuid(),
  service_date    date not null,
  time_label      text not null default 'AM',
  special         text,
  -- Two historical streams coexist: Airtable services ('Durham') and the
  -- roster spreadsheet ('RCF'), with overlapping dates. Location keeps
  -- them distinct.
  location        text not null default 'RCF',
  leader_id       uuid references public.ws_people(id),
  practice_time   text,
  notes           text,
  applied_team_id uuid references public.ws_teams(id),
  created_at      timestamptz not null default now(),
  unique (service_date, time_label, location)
);

-- ── roster assignments ──────────────────────────────────────────────────────
create table if not exists public.ws_assignments (
  id         uuid primary key default gen_random_uuid(),
  service_id uuid not null references public.ws_services(id) on delete cascade,
  person_id  uuid not null references public.ws_people(id) on delete cascade,
  role_id    integer references public.ws_roles(id),
  status     text not null default 'assigned'
             check (status in ('assigned','unavailable','tentative','available')),
  note       text,
  unique (service_id, person_id),
  -- an 'assigned' row must say what the person is playing
  check (status <> 'assigned' or role_id is not null)
);

-- ── song library ────────────────────────────────────────────────────────────
create table if not exists public.ws_songs (
  id       uuid primary key default gen_random_uuid(),
  title    text not null unique,
  main_key text,
  season   text not null default 'General',
  notes    text,
  active   boolean not null default true
);

-- Multiple chord-sheet docs per song (real key vs capo key, folders, PDFs)
create table if not exists public.ws_song_links (
  id         uuid primary key default gen_random_uuid(),
  song_id    uuid not null references public.ws_songs(id) on delete cascade,
  url        text not null,
  label      text not null default 'Chords',
  sort_order integer not null default 0,
  unique (song_id, url)
);

create table if not exists public.ws_tags (
  id   serial primary key,
  name text not null unique
);

create table if not exists public.ws_song_tags (
  song_id uuid not null references public.ws_songs(id) on delete cascade,
  tag_id  integer not null references public.ws_tags(id) on delete cascade,
  primary key (song_id, tag_id)
);

-- ── songs in a service (with liturgical slot + order) ───────────────────────
create table if not exists public.ws_service_songs (
  id           uuid primary key default gen_random_uuid(),
  service_id   uuid not null references public.ws_services(id) on delete cascade,
  song_id      uuid not null references public.ws_songs(id) on delete cascade,
  slot         text,
  sort_order   integer not null default 0,
  key_override text,
  notes        text
);

-- ── reminder audit log ──────────────────────────────────────────────────────
create table if not exists public.ws_reminder_log (
  id         uuid primary key default gen_random_uuid(),
  service_id uuid references public.ws_services(id) on delete set null,
  channel    text not null check (channel in ('email','sms','copy')),
  sent_at    timestamptz not null default now(),
  recipients jsonb not null default '[]'::jsonb,
  status     text not null default 'ok',
  error      text
);

-- ── indexes ─────────────────────────────────────────────────────────────────
create index if not exists ws_assignments_service_idx   on public.ws_assignments(service_id);
create index if not exists ws_assignments_person_idx    on public.ws_assignments(person_id);
create index if not exists ws_assignments_role_idx      on public.ws_assignments(role_id);
create index if not exists ws_service_songs_service_idx on public.ws_service_songs(service_id);
create index if not exists ws_service_songs_song_idx    on public.ws_service_songs(song_id);
create index if not exists ws_song_links_song_idx       on public.ws_song_links(song_id);
create index if not exists ws_song_tags_tag_idx         on public.ws_song_tags(tag_id);
create index if not exists ws_services_date_idx         on public.ws_services(service_date);
create index if not exists ws_services_leader_idx       on public.ws_services(leader_id);
create index if not exists ws_services_team_idx         on public.ws_services(applied_team_id);
create index if not exists ws_team_members_person_idx   on public.ws_team_members(person_id);
create index if not exists ws_team_members_role_idx     on public.ws_team_members(role_id);
create index if not exists ws_reminder_log_service_idx  on public.ws_reminder_log(service_id);

-- ── admin check helper ──────────────────────────────────────────────────────
-- SECURITY DEFINER so RLS policies on other tables can consult ws_admins
-- without granting direct read access to it.
create or replace function public.ws_is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.ws_admins
    where email = lower(coalesce(auth.jwt() ->> 'email', ''))
  );
$$;

-- ── RLS: admins get full access; everyone else nothing (for now) ───────────
alter table public.ws_admins        enable row level security;
alter table public.ws_people        enable row level security;
alter table public.ws_roles         enable row level security;
alter table public.ws_teams         enable row level security;
alter table public.ws_team_members  enable row level security;
alter table public.ws_services      enable row level security;
alter table public.ws_assignments   enable row level security;
alter table public.ws_songs         enable row level security;
alter table public.ws_song_links    enable row level security;
alter table public.ws_tags          enable row level security;
alter table public.ws_song_tags     enable row level security;
alter table public.ws_service_songs enable row level security;
alter table public.ws_reminder_log  enable row level security;

-- Signed-in users may check their own admin row (used by the UI gate).
drop policy if exists "Users read own admin row" on public.ws_admins;
create policy "Users read own admin row" on public.ws_admins
  for select to authenticated
  using (email = lower(coalesce(auth.jwt() ->> 'email', '')));

do $$
declare
  t text;
begin
  foreach t in array array[
    'ws_people','ws_roles','ws_teams','ws_team_members','ws_services',
    'ws_assignments','ws_songs','ws_song_links','ws_tags','ws_song_tags',
    'ws_service_songs','ws_reminder_log'
  ]
  loop
    execute format('drop policy if exists "Admins full access" on public.%I', t);
    execute format(
      'create policy "Admins full access" on public.%I for all to authenticated using (public.ws_is_admin()) with check (public.ws_is_admin())',
      t
    );
  end loop;
end;
$$;

-- ── seeds ───────────────────────────────────────────────────────────────────
insert into public.ws_admins (email) values ('matthewlanebrown@gmail.com')
on conflict (email) do nothing;

insert into public.ws_roles (name, sort_order) values
  ('Lead', 10),
  ('Vocals', 20),
  ('Acoustic Guitar', 30),
  ('Electric Guitar', 40),
  ('Keys', 50),
  ('Bass', 60),
  ('Drums', 70),
  ('Mandolin', 80),
  ('Dulcimer', 90),
  ('Cello', 100),
  ('Violin', 110),
  ('Sound', 120),
  ('Nursery', 130)
on conflict (name) do nothing;
