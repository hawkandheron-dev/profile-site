-- Backfill foreign keys, indexes, and timestamps missing from the initial
-- Pantheon tables migration.  The second migration (add_monsters) already
-- follows these patterns; this brings the original tables up to the same
-- standard.

begin;

-- ── Foreign keys ────────────────────────────────────────────────────────

alter table public."Gods"
  add constraint "Gods_pantheon_id_fkey"
  foreign key (pantheon_id) references public."Pantheons"(pantheon_id)
  on delete cascade;

alter table public."Heroes"
  add constraint "Heroes_pantheon_id_fkey"
  foreign key (pantheon_id) references public."Pantheons"(pantheon_id)
  on delete cascade;

alter table public."Hero Favors"
  add constraint "Hero Favors_hero_id_fkey"
  foreign key (hero_id) references public."Heroes"(hero_id)
  on delete cascade;

alter table public."Hero Favors"
  add constraint "Hero Favors_god_id_fkey"
  foreign key (god_id) references public."Gods"(god_id)
  on delete cascade;

alter table public."Hero Works"
  add constraint "Hero Works_hero_id_fkey"
  foreign key (hero_id) references public."Heroes"(hero_id)
  on delete cascade;

alter table public."God Epithets"
  add constraint "God Epithets_god_id_fkey"
  foreign key (god_id) references public."Gods"(god_id)
  on delete cascade;

-- ── Indexes on foreign-key columns ──────────────────────────────────────

create index if not exists "Gods_pantheon_id_idx"
  on public."Gods" (pantheon_id);

create index if not exists "Heroes_pantheon_id_idx"
  on public."Heroes" (pantheon_id);

create index if not exists "Hero Favors_god_id_idx"
  on public."Hero Favors" (god_id);

create index if not exists "Hero Works_hero_id_idx"
  on public."Hero Works" (hero_id);

create index if not exists "God Epithets_god_id_idx"
  on public."God Epithets" (god_id);

-- ── Timestamps ──────────────────────────────────────────────────────────

alter table public."Pantheons"
  add column if not exists created_at timestamptz not null default now();

alter table public."Gods"
  add column if not exists created_at timestamptz not null default now();

alter table public."Heroes"
  add column if not exists created_at timestamptz not null default now();

alter table public."Hero Favors"
  add column if not exists created_at timestamptz not null default now();

alter table public."Hero Works"
  add column if not exists created_at timestamptz not null default now();

alter table public."God Epithets"
  add column if not exists created_at timestamptz not null default now();

commit;
