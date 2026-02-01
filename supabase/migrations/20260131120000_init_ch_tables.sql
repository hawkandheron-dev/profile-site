-- Church History tables — completely independent from mythology tables.
-- Table name prefix: CH_

begin;

-- ── CH_Eras ───────────────────────────────────────────────────────────────
create table if not exists public."CH_Eras" (
  era_id   text not null,
  name     text not null,
  start_year integer not null,
  end_year   integer not null,
  color    text,
  description text,
  created_at timestamptz not null default now(),
  constraint "CH_Eras_pkey" primary key (era_id)
);

-- ── CH_People ─────────────────────────────────────────────────────────────
create table if not exists public."CH_People" (
  person_id  text not null,
  name       text not null,
  birth_date text,
  death_date text,
  birth_year integer,
  death_year integer,
  location   text,
  role_type  text,
  era_id     text,
  is_emperor boolean not null default false,
  notes      text,
  created_at timestamptz not null default now(),
  constraint "CH_People_pkey" primary key (person_id),
  constraint "CH_People_era_id_fkey" foreign key (era_id)
    references public."CH_Eras"(era_id) on delete set null
);

-- ── CH_Events ─────────────────────────────────────────────────────────────
create table if not exists public."CH_Events" (
  event_id    text not null,
  name        text not null,
  event_type  text not null,
  event_date  text,
  end_date    text,
  location    text,
  description text,
  created_at  timestamptz not null default now(),
  constraint "CH_Events_pkey" primary key (event_id),
  constraint "CH_Events_event_type_check"
    check (event_type in ('council', 'document', 'event', 'era'))
);

-- ── CH_Connections ────────────────────────────────────────────────────────
create table if not exists public."CH_Connections" (
  connection_id bigint generated always as identity primary key,
  person_id_1   text not null,
  person_id_2   text not null,
  connection_type text not null default 'known',
  notes         text,
  created_at    timestamptz not null default now(),
  constraint "CH_Connections_p1_fkey" foreign key (person_id_1)
    references public."CH_People"(person_id) on delete cascade,
  constraint "CH_Connections_p2_fkey" foreign key (person_id_2)
    references public."CH_People"(person_id) on delete cascade
);

-- ── CH_Sources ────────────────────────────────────────────────────────────
create table if not exists public."CH_Sources" (
  source_id   text not null,
  title       text not null,
  source_name text,
  year        text,
  url         text,
  notes       text,
  created_at  timestamptz not null default now(),
  constraint "CH_Sources_pkey" primary key (source_id)
);

-- ── CH_Source_Figures ──────────────────────────────────────────────────────
create table if not exists public."CH_Source_Figures" (
  id         bigint generated always as identity primary key,
  source_id  text not null,
  person_id  text,
  event_id   text,
  created_at timestamptz not null default now(),
  constraint "CH_Source_Figures_source_fkey" foreign key (source_id)
    references public."CH_Sources"(source_id) on delete cascade,
  constraint "CH_Source_Figures_person_fkey" foreign key (person_id)
    references public."CH_People"(person_id) on delete cascade,
  constraint "CH_Source_Figures_event_fkey" foreign key (event_id)
    references public."CH_Events"(event_id) on delete cascade
);

-- ── CH_Works ──────────────────────────────────────────────────────────────
create table if not exists public."CH_Works" (
  work_id    bigint generated always as identity primary key,
  person_id  text,
  name       text not null,
  text_url   text,
  created_at timestamptz not null default now(),
  constraint "CH_Works_person_fkey" foreign key (person_id)
    references public."CH_People"(person_id) on delete cascade
);

-- ── Indexes ───────────────────────────────────────────────────────────────
create index if not exists "CH_People_era_id_idx"
  on public."CH_People" (era_id);

create index if not exists "CH_Connections_p1_idx"
  on public."CH_Connections" (person_id_1);

create index if not exists "CH_Connections_p2_idx"
  on public."CH_Connections" (person_id_2);

create index if not exists "CH_Source_Figures_source_idx"
  on public."CH_Source_Figures" (source_id);

create index if not exists "CH_Source_Figures_person_idx"
  on public."CH_Source_Figures" (person_id);

create index if not exists "CH_Source_Figures_event_idx"
  on public."CH_Source_Figures" (event_id);

create index if not exists "CH_Works_person_idx"
  on public."CH_Works" (person_id);

-- ── Row Level Security ────────────────────────────────────────────────────
alter table public."CH_Eras" enable row level security;
alter table public."CH_People" enable row level security;
alter table public."CH_Events" enable row level security;
alter table public."CH_Connections" enable row level security;
alter table public."CH_Sources" enable row level security;
alter table public."CH_Source_Figures" enable row level security;
alter table public."CH_Works" enable row level security;

drop policy if exists "Enable read access for all users" on public."CH_Eras";
create policy "Enable read access for all users" on public."CH_Eras"
  for select to public using (true);

drop policy if exists "Enable read access for all users" on public."CH_People";
create policy "Enable read access for all users" on public."CH_People"
  for select to public using (true);

drop policy if exists "Enable read access for all users" on public."CH_Events";
create policy "Enable read access for all users" on public."CH_Events"
  for select to public using (true);

drop policy if exists "Enable read access for all users" on public."CH_Connections";
create policy "Enable read access for all users" on public."CH_Connections"
  for select to public using (true);

drop policy if exists "Enable read access for all users" on public."CH_Sources";
create policy "Enable read access for all users" on public."CH_Sources"
  for select to public using (true);

drop policy if exists "Enable read access for all users" on public."CH_Source_Figures";
create policy "Enable read access for all users" on public."CH_Source_Figures"
  for select to public using (true);

drop policy if exists "Enable read access for all users" on public."CH_Works";
create policy "Enable read access for all users" on public."CH_Works"
  for select to public using (true);

commit;
