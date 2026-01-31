begin;

create table if not exists public."Pantheons" (
  pantheon_id bigint not null,
  name text,
  region text,
  era_note text,
  constraint "Pantheons_pkey" primary key (pantheon_id)
);

create table if not exists public."Gods" (
  god_id bigint not null,
  pantheon_id bigint,
  name text,
  domain text,
  symbols text,
  notes text,
  constraint "Gods_pkey" primary key (god_id)
);

create table if not exists public."Heroes" (
  hero_id bigint not null,
  pantheon_id bigint,
  name text,
  origin text,
  archetype text,
  notes text,
  constraint "Heroes_pkey" primary key (hero_id)
);

create table if not exists public."Hero Favors" (
  hero_id bigint not null,
  god_id bigint,
  favor_type text,
  notes text,
  constraint "Hero Favors_pkey" primary key (hero_id)
);

create table if not exists public."Hero Works" (
  work_id bigint not null,
  hero_id bigint,
  title text,
  kind text,
  approx_date text,
  constraint "Hero Works_pkey" primary key (work_id)
);

create table if not exists public."God Epithets" (
  epithet_id bigint not null,
  god_id bigint,
  epithet text,
  meaning text,
  constraint "God Epithets_pkey" primary key (epithet_id)
);

alter table public."Pantheons" enable row level security;
alter table public."Gods" enable row level security;
alter table public."Heroes" enable row level security;
alter table public."Hero Favors" enable row level security;
alter table public."Hero Works" enable row level security;
alter table public."God Epithets" enable row level security;

drop policy if exists "Enable read access for all users" on public."Pantheons";

create policy "Enable read access for all users" on public."Pantheons"
  for select to public using (true);

drop policy if exists "Enable read access for all users" on public."Gods";

create policy "Enable read access for all users" on public."Gods"
  for select to public using (true);

drop policy if exists "Enable read access for all users" on public."Heroes";

create policy "Enable read access for all users" on public."Heroes"
  for select to public using (true);

drop policy if exists "Enable read access for all users" on public."Hero Favors";

create policy "Enable read access for all users" on public."Hero Favors"
  for select to public using (true);

drop policy if exists "Enable read access for all users" on public."Hero Works";

create policy "Enable read access for all users" on public."Hero Works"
  for select to public using (true);

drop policy if exists "Enable read access for all users" on public."God Epithets";

create policy "Enable read access for all users" on public."God Epithets"
  for select to public using (true);

commit;
