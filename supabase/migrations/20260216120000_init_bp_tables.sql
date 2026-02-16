-- Biblical Places tables — interactive map of Bible events and people by location.
-- Table name prefix: BP_

begin;

-- ── BP_NarrativeAges ─────────────────────────────────────────────────────────
create table if not exists public."BP_NarrativeAges" (
  age_id            text not null,
  name              text not null,
  sort_order        integer not null,
  color             text,
  approx_start_year integer,       -- for OHM filterByDate; nullable
  approx_end_year   integer,
  description       text,
  scripture_range   text,          -- e.g. "Genesis 12-50"
  created_at        timestamptz not null default now(),
  constraint "BP_NarrativeAges_pkey" primary key (age_id)
);

-- ── BP_Places ────────────────────────────────────────────────────────────────
create table if not exists public."BP_Places" (
  place_id      text not null,
  name          text not null,
  lat           double precision not null,
  lng           double precision not null,
  region        text,              -- e.g. "Canaan", "Mesopotamia", "Egypt"
  description   text,
  reference_url text,
  created_at    timestamptz not null default now(),
  constraint "BP_Places_pkey" primary key (place_id)
);

-- ── BP_People ────────────────────────────────────────────────────────────────
create table if not exists public."BP_People" (
  person_id       text not null,
  name            text not null,
  description     text,
  reference_url   text,
  scripture_refs  text,            -- e.g. "Genesis 12-25"
  created_at      timestamptz not null default now(),
  constraint "BP_People_pkey" primary key (person_id)
);

-- ── BP_PersonAges (many-to-many: person <-> narrative age) ───────────────────
create table if not exists public."BP_PersonAges" (
  id         bigint generated always as identity primary key,
  person_id  text not null,
  age_id     text not null,
  is_primary boolean not null default false,
  created_at timestamptz not null default now(),
  constraint "BP_PersonAges_person_fkey" foreign key (person_id)
    references public."BP_People"(person_id) on delete cascade,
  constraint "BP_PersonAges_age_fkey" foreign key (age_id)
    references public."BP_NarrativeAges"(age_id) on delete cascade,
  constraint "BP_PersonAges_unique" unique (person_id, age_id)
);

-- ── BP_Events ────────────────────────────────────────────────────────────────
create table if not exists public."BP_Events" (
  event_id         text not null,
  name             text not null,
  narrative_age_id text not null,
  place_id         text,
  description      text,
  event_type       text not null default 'event',
  scripture_ref    text,
  sort_within_age  integer not null default 0,
  reference_url    text,
  created_at       timestamptz not null default now(),
  constraint "BP_Events_pkey" primary key (event_id),
  constraint "BP_Events_age_fkey" foreign key (narrative_age_id)
    references public."BP_NarrativeAges"(age_id) on delete restrict,
  constraint "BP_Events_place_fkey" foreign key (place_id)
    references public."BP_Places"(place_id) on delete set null,
  constraint "BP_Events_type_check"
    check (event_type in ('event', 'miracle', 'battle', 'covenant', 'prophecy', 'judgment'))
);

-- ── BP_PersonPlaces (many-to-many with context) ─────────────────────────────
create table if not exists public."BP_PersonPlaces" (
  id               bigint generated always as identity primary key,
  person_id        text not null,
  place_id         text not null,
  narrative_age_id text,
  context          text,           -- "born here", "died here", "passed through", "ruled here"
  notes            text,
  created_at       timestamptz not null default now(),
  constraint "BP_PersonPlaces_person_fkey" foreign key (person_id)
    references public."BP_People"(person_id) on delete cascade,
  constraint "BP_PersonPlaces_place_fkey" foreign key (place_id)
    references public."BP_Places"(place_id) on delete cascade,
  constraint "BP_PersonPlaces_age_fkey" foreign key (narrative_age_id)
    references public."BP_NarrativeAges"(age_id) on delete set null
);

-- ── BP_EventPeople (many-to-many) ───────────────────────────────────────────
create table if not exists public."BP_EventPeople" (
  id         bigint generated always as identity primary key,
  event_id   text not null,
  person_id  text not null,
  created_at timestamptz not null default now(),
  constraint "BP_EventPeople_event_fkey" foreign key (event_id)
    references public."BP_Events"(event_id) on delete cascade,
  constraint "BP_EventPeople_person_fkey" foreign key (person_id)
    references public."BP_People"(person_id) on delete cascade,
  constraint "BP_EventPeople_unique" unique (event_id, person_id)
);

-- ── BP_Sources ──────────────────────────────────────────────────────────────
create table if not exists public."BP_Sources" (
  source_id   text not null,
  title       text not null,
  source_name text,
  url         text,
  notes       text,
  created_at  timestamptz not null default now(),
  constraint "BP_Sources_pkey" primary key (source_id)
);

-- ── BP_SourceFigures ────────────────────────────────────────────────────────
create table if not exists public."BP_SourceFigures" (
  id         bigint generated always as identity primary key,
  source_id  text not null,
  person_id  text,
  event_id   text,
  place_id   text,
  created_at timestamptz not null default now(),
  constraint "BP_SourceFigures_source_fkey" foreign key (source_id)
    references public."BP_Sources"(source_id) on delete cascade,
  constraint "BP_SourceFigures_person_fkey" foreign key (person_id)
    references public."BP_People"(person_id) on delete cascade,
  constraint "BP_SourceFigures_event_fkey" foreign key (event_id)
    references public."BP_Events"(event_id) on delete cascade,
  constraint "BP_SourceFigures_place_fkey" foreign key (place_id)
    references public."BP_Places"(place_id) on delete cascade
);

-- ── Indexes ─────────────────────────────────────────────────────────────────
create index if not exists "BP_PersonAges_person_idx" on public."BP_PersonAges" (person_id);
create index if not exists "BP_PersonAges_age_idx" on public."BP_PersonAges" (age_id);
create index if not exists "BP_Events_age_idx" on public."BP_Events" (narrative_age_id);
create index if not exists "BP_Events_place_idx" on public."BP_Events" (place_id);
create index if not exists "BP_PersonPlaces_person_idx" on public."BP_PersonPlaces" (person_id);
create index if not exists "BP_PersonPlaces_place_idx" on public."BP_PersonPlaces" (place_id);
create index if not exists "BP_EventPeople_event_idx" on public."BP_EventPeople" (event_id);
create index if not exists "BP_EventPeople_person_idx" on public."BP_EventPeople" (person_id);

commit;
