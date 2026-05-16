-- First Century Church Directory tables — interactive map of first-century
-- churches and the people, households, and communities mentioned in the
-- New Testament at each place.
-- Table name prefix: FCC_

begin;

-- ── FCC_Regions ──────────────────────────────────────────────────────────────
-- Roman provinces / regions grouping the churches (Achaia, Asia, Macedonia, ...)
create table if not exists public."FCC_Regions" (
  region_id   text not null,
  name        text not null,
  description text,
  sort_order  integer not null default 0,
  created_at  timestamptz not null default now(),
  constraint "FCC_Regions_pkey" primary key (region_id)
);

-- ── FCC_Churches ─────────────────────────────────────────────────────────────
-- One row per first-century church / city / community.
create table if not exists public."FCC_Churches" (
  church_id       text not null,
  name            text not null,
  lat             double precision not null,
  lng             double precision not null,
  region_id       text,
  founded_context text,
  description     text,
  church_type     text not null default 'church',
  reference_url   text,
  sort_order      integer not null default 0,
  created_at      timestamptz not null default now(),
  constraint "FCC_Churches_pkey" primary key (church_id),
  constraint "FCC_Churches_region_fkey" foreign key (region_id)
    references public."FCC_Regions"(region_id) on delete set null,
  constraint "FCC_Churches_type_check"
    check (church_type in ('church', 'pauline', 'jerusalem', 'antioch',
                           'revelation-seven', 'acts-church', 'diaspora-region'))
);

-- ── FCC_People ───────────────────────────────────────────────────────────────
-- Every named New Testament person tied to a first-century community.
create table if not exists public."FCC_People" (
  person_id      text not null,
  name           text not null,
  also_known_as  text,             -- e.g. "Saul", "John Mark"
  gender         text,             -- 'M' | 'F' | null
  description    text,
  reference_url  text,
  scripture_refs text,             -- denormalized convenience string (cf. BP_People)
  created_at     timestamptz not null default now(),
  constraint "FCC_People_pkey" primary key (person_id),
  constraint "FCC_People_gender_check" check (gender in ('M', 'F'))
);

-- ── FCC_Households ───────────────────────────────────────────────────────────
-- House churches / families that met or are named within a church.
create table if not exists public."FCC_Households" (
  household_id   text not null,
  name           text not null,
  church_id      text,
  head_person_id text,
  description    text,
  scripture_ref  text,
  created_at     timestamptz not null default now(),
  constraint "FCC_Households_pkey" primary key (household_id),
  constraint "FCC_Households_church_fkey" foreign key (church_id)
    references public."FCC_Churches"(church_id) on delete cascade,
  constraint "FCC_Households_head_fkey" foreign key (head_person_id)
    references public."FCC_People"(person_id) on delete set null
);

-- ── FCC_Memberships ──────────────────────────────────────────────────────────
-- The core join: person <-> church with a role and context. A person who
-- traveled between churches simply has multiple rows here (one per church).
create table if not exists public."FCC_Memberships" (
  id            bigint generated always as identity primary key,
  person_id     text not null,
  church_id     text not null,
  household_id  text,
  role          text not null,
  context       text,
  scripture_ref text,
  is_primary    boolean not null default false,
  sort_order    integer not null default 0,
  created_at    timestamptz not null default now(),
  constraint "FCC_Memberships_person_fkey" foreign key (person_id)
    references public."FCC_People"(person_id) on delete cascade,
  constraint "FCC_Memberships_church_fkey" foreign key (church_id)
    references public."FCC_Churches"(church_id) on delete cascade,
  constraint "FCC_Memberships_household_fkey" foreign key (household_id)
    references public."FCC_Households"(household_id) on delete set null,
  constraint "FCC_Memberships_role_check"
    check (role in ('founder', 'apostle', 'elder', 'overseer', 'deacon',
                    'host-of-house-church', 'letter-carrier', 'traveling-companion',
                    'co-worker', 'member', 'greeted', 'mentioned', 'opponent',
                    'patron', 'convert', 'prophet', 'teacher', 'relative')),
  constraint "FCC_Memberships_unique" unique (person_id, church_id, role)
);

-- ── FCC_Journeys ─────────────────────────────────────────────────────────────
-- Missionary journeys, scoped to this section.
create table if not exists public."FCC_Journeys" (
  journey_id        text not null,
  name              text not null,
  person_id         text,
  description       text,
  color             text,
  approx_start_year integer,
  approx_end_year   integer,
  sort_order        integer not null default 0,
  created_at        timestamptz not null default now(),
  constraint "FCC_Journeys_pkey" primary key (journey_id),
  constraint "FCC_Journeys_person_fkey" foreign key (person_id)
    references public."FCC_People"(person_id) on delete set null
);

-- ── FCC_ScriptureRefs ────────────────────────────────────────────────────────
-- Reference strings only — never verse text. Verse text is fetched at display
-- time via bibleVerseService.js. Polymorphic link (cf. BP_SourceFigures).
create table if not exists public."FCC_ScriptureRefs" (
  id            bigint generated always as identity primary key,
  reference     text not null,
  label         text,
  church_id     text,
  person_id     text,
  membership_id bigint,
  household_id  text,
  journey_id    text,
  created_at    timestamptz not null default now(),
  constraint "FCC_ScriptureRefs_church_fkey" foreign key (church_id)
    references public."FCC_Churches"(church_id) on delete cascade,
  constraint "FCC_ScriptureRefs_person_fkey" foreign key (person_id)
    references public."FCC_People"(person_id) on delete cascade,
  constraint "FCC_ScriptureRefs_membership_fkey" foreign key (membership_id)
    references public."FCC_Memberships"(id) on delete cascade,
  constraint "FCC_ScriptureRefs_household_fkey" foreign key (household_id)
    references public."FCC_Households"(household_id) on delete cascade,
  constraint "FCC_ScriptureRefs_journey_fkey" foreign key (journey_id)
    references public."FCC_Journeys"(journey_id) on delete cascade
);

-- ── FCC_JourneyStops ─────────────────────────────────────────────────────────
-- Ordered stops along a journey.
create table if not exists public."FCC_JourneyStops" (
  id            bigint generated always as identity primary key,
  journey_id    text not null,
  stop_order    integer not null,
  church_id     text,
  label         text,
  lat           double precision,
  lng           double precision,
  description   text,
  scripture_ref text,
  created_at    timestamptz not null default now(),
  constraint "FCC_JourneyStops_journey_fkey" foreign key (journey_id)
    references public."FCC_Journeys"(journey_id) on delete cascade,
  constraint "FCC_JourneyStops_church_fkey" foreign key (church_id)
    references public."FCC_Churches"(church_id) on delete set null,
  constraint "FCC_JourneyStops_unique" unique (journey_id, stop_order)
);

-- ── FCC_JourneyPeople (many-to-many: journey <-> person) ─────────────────────
create table if not exists public."FCC_JourneyPeople" (
  id         bigint generated always as identity primary key,
  journey_id text not null,
  person_id  text not null,
  role       text,
  created_at timestamptz not null default now(),
  constraint "FCC_JourneyPeople_journey_fkey" foreign key (journey_id)
    references public."FCC_Journeys"(journey_id) on delete cascade,
  constraint "FCC_JourneyPeople_person_fkey" foreign key (person_id)
    references public."FCC_People"(person_id) on delete cascade,
  constraint "FCC_JourneyPeople_unique" unique (journey_id, person_id)
);

-- ── Indexes ─────────────────────────────────────────────────────────────────
create index if not exists "FCC_Churches_region_idx"       on public."FCC_Churches" (region_id);
create index if not exists "FCC_Households_church_idx"     on public."FCC_Households" (church_id);
create index if not exists "FCC_Memberships_person_idx"    on public."FCC_Memberships" (person_id);
create index if not exists "FCC_Memberships_church_idx"    on public."FCC_Memberships" (church_id);
create index if not exists "FCC_Memberships_household_idx" on public."FCC_Memberships" (household_id);
create index if not exists "FCC_ScriptureRefs_church_idx"  on public."FCC_ScriptureRefs" (church_id);
create index if not exists "FCC_ScriptureRefs_person_idx"  on public."FCC_ScriptureRefs" (person_id);
create index if not exists "FCC_ScriptureRefs_journey_idx" on public."FCC_ScriptureRefs" (journey_id);
create index if not exists "FCC_JourneyStops_journey_idx"  on public."FCC_JourneyStops" (journey_id);
create index if not exists "FCC_JourneyPeople_journey_idx" on public."FCC_JourneyPeople" (journey_id);
create index if not exists "FCC_JourneyPeople_person_idx"  on public."FCC_JourneyPeople" (person_id);

commit;
