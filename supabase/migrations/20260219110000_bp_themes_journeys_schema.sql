-- Schema additions for Priority 1 biblical studies features:
-- 1. Thematic/theological threads (BP_Themes + BP_ThemeStops)
-- 2. Journey/route visualization (BP_Journeys + BP_JourneyStops)
-- 3. Gender column on BP_People (enables Women of the Bible filter)
-- 4. Pericope reference columns (enables scripture reading pane)

begin;

-- ══════════════════════════════════════════════════════════════════════════
-- 1. THEMATIC THREADS
-- A theme traces a theological motif across places, people, and ages.
-- Each theme has ordered "stops" that a user can step through.
-- ══════════════════════════════════════════════════════════════════════════

create table if not exists public."BP_Themes" (
  theme_id     text not null,
  name         text not null,
  description  text,
  color        text,            -- hex color for UI
  icon         text,            -- optional icon identifier
  sort_order   integer not null default 0,
  created_at   timestamptz not null default now(),
  constraint "BP_Themes_pkey" primary key (theme_id)
);

create table if not exists public."BP_ThemeStops" (
  id               bigint generated always as identity primary key,
  theme_id         text not null,
  stop_order       integer not null,          -- 1, 2, 3... within this theme
  place_id         text,                      -- optional: which place
  person_id        text,                      -- optional: which person
  event_id         text,                      -- optional: which event
  narrative_age_id text,                      -- which age this stop belongs to
  title            text not null,             -- short label for this stop
  description      text,                      -- narrative text for this stop
  scripture_ref    text,                      -- key passage
  created_at       timestamptz not null default now(),
  constraint "BP_ThemeStops_theme_fkey" foreign key (theme_id)
    references public."BP_Themes"(theme_id) on delete cascade,
  constraint "BP_ThemeStops_place_fkey" foreign key (place_id)
    references public."BP_Places"(place_id) on delete set null,
  constraint "BP_ThemeStops_person_fkey" foreign key (person_id)
    references public."BP_People"(person_id) on delete set null,
  constraint "BP_ThemeStops_event_fkey" foreign key (event_id)
    references public."BP_Events"(event_id) on delete set null,
  constraint "BP_ThemeStops_age_fkey" foreign key (narrative_age_id)
    references public."BP_NarrativeAges"(age_id) on delete set null,
  constraint "BP_ThemeStops_unique" unique (theme_id, stop_order)
);

create index if not exists "BP_ThemeStops_theme_idx" on public."BP_ThemeStops" (theme_id);

-- ══════════════════════════════════════════════════════════════════════════
-- 2. JOURNEY / ROUTE VISUALIZATION
-- A journey is an ordered sequence of place stops for a named figure.
-- Enables animated polyline routes on the map.
-- ══════════════════════════════════════════════════════════════════════════

create table if not exists public."BP_Journeys" (
  journey_id       text not null,
  name             text not null,
  person_id        text,                      -- primary traveler
  narrative_age_id text,                      -- which age
  description      text,
  color            text,                      -- line color on the map
  sort_order       integer not null default 0,
  created_at       timestamptz not null default now(),
  constraint "BP_Journeys_pkey" primary key (journey_id),
  constraint "BP_Journeys_person_fkey" foreign key (person_id)
    references public."BP_People"(person_id) on delete set null,
  constraint "BP_Journeys_age_fkey" foreign key (narrative_age_id)
    references public."BP_NarrativeAges"(age_id) on delete set null
);

create table if not exists public."BP_JourneyStops" (
  id          bigint generated always as identity primary key,
  journey_id  text not null,
  stop_order  integer not null,              -- 1, 2, 3... along the route
  place_id    text not null,
  label       text,                          -- optional override label
  description text,                          -- what happened at this stop
  scripture_ref text,
  created_at  timestamptz not null default now(),
  constraint "BP_JourneyStops_journey_fkey" foreign key (journey_id)
    references public."BP_Journeys"(journey_id) on delete cascade,
  constraint "BP_JourneyStops_place_fkey" foreign key (place_id)
    references public."BP_Places"(place_id) on delete cascade,
  constraint "BP_JourneyStops_unique" unique (journey_id, stop_order)
);

create index if not exists "BP_JourneyStops_journey_idx" on public."BP_JourneyStops" (journey_id);

-- ══════════════════════════════════════════════════════════════════════════
-- 3. GENDER COLUMN ON BP_PEOPLE
-- Enables "Women of the Bible" filter and future gender-based views.
-- Values: 'M', 'F', or null (for angels, groups, unknown)
-- ══════════════════════════════════════════════════════════════════════════

alter table public."BP_People"
  add column if not exists gender text;

-- Set gender for all existing people
-- Women
update public."BP_People" set gender = 'F' where person_id in (
  'eve', 'sarah', 'hagar', 'rebekah', 'rachel', 'leah', 'dinah',
  'tamar-genesis', 'miriam', 'zipporah', 'rahab', 'deborah', 'jael',
  'delilah', 'ruth', 'naomi', 'michal', 'abigail', 'bathsheba',
  'tamar-david', 'jezebel', 'athaliah', 'huldah', 'esther',
  'queen-of-sheba', 'mary'
);

-- Men (all remaining named people except angels)
update public."BP_People" set gender = 'M' where gender is null
  and person_id not in ('gabriel', 'angel-of-lord');

-- ══════════════════════════════════════════════════════════════════════════
-- 4. PERICOPE REFERENCE COLUMN
-- Stores the broader passage range for "Read in context" feature.
-- Complements the existing scripture_verse (single reference) with
-- the surrounding passage unit.
-- ══════════════════════════════════════════════════════════════════════════

alter table public."BP_PersonPlaces"
  add column if not exists pericope_ref text;

alter table public."BP_Events"
  add column if not exists pericope_ref text;

-- ══════════════════════════════════════════════════════════════════════════
-- RLS POLICIES
-- ══════════════════════════════════════════════════════════════════════════

alter table public."BP_Themes" enable row level security;
alter table public."BP_ThemeStops" enable row level security;
alter table public."BP_Journeys" enable row level security;
alter table public."BP_JourneyStops" enable row level security;

create policy "BP_Themes are viewable by everyone"
  on public."BP_Themes" for select using (true);
create policy "BP_ThemeStops are viewable by everyone"
  on public."BP_ThemeStops" for select using (true);
create policy "BP_Journeys are viewable by everyone"
  on public."BP_Journeys" for select using (true);
create policy "BP_JourneyStops are viewable by everyone"
  on public."BP_JourneyStops" for select using (true);

commit;
