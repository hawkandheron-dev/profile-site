begin;

create table if not exists public."Monsters" (
  monster_id bigint not null,
  pantheon_id bigint not null references public."Pantheons"(pantheon_id) on delete restrict,
  name text not null,
  species text,
  temperament text,
  notes text,
  created_at timestamptz not null default now(),
  constraint "Monsters_pkey" primary key (monster_id)
);

create unique index if not exists "Monsters_unique_pantheon_name"
  on public."Monsters" (pantheon_id, name);

create index if not exists "Monsters_pantheon_id_idx"
  on public."Monsters" (pantheon_id);

create table if not exists public."Monster Favors" (
  monster_id bigint not null references public."Monsters"(monster_id) on delete cascade,
  god_id bigint not null references public."Gods"(god_id) on delete cascade,
  favor_type text,
  notes text,
  constraint "Monster Favors_pkey" primary key (monster_id, god_id)
);

create index if not exists "Monster Favors_god_id_idx"
  on public."Monster Favors" (god_id);

create table if not exists public."Monster Works" (
  work_id bigint generated always as identity primary key,
  monster_id bigint not null references public."Monsters"(monster_id) on delete cascade,
  title text not null,
  kind text,
  approx_date text
);

create index if not exists "Monster Works_monster_id_idx"
  on public."Monster Works" (monster_id);

alter table public."Monsters" enable row level security;
alter table public."Monster Favors" enable row level security;
alter table public."Monster Works" enable row level security;

create policy "Enable read access for all users" on public."Monsters"
  for select to public using (true);

create policy "Enable read access for all users" on public."Monster Favors"
  for select to public using (true);

create policy "Enable read access for all users" on public."Monster Works"
  for select to public using (true);

insert into public."Monsters" (monster_id, pantheon_id, name, species, temperament, notes)
values
  (5001, 1, 'Hydra',     'serpent',               'hostile',  'Multi-headed water serpent; slain by Heracles'),
  (5002, 1, 'Minotaur',  'hybrid',                'hostile',  'Bull-headed man; kept in the Labyrinth'),
  (5003, 1, 'Cerberus',  'guardian hound',        'guardian', 'Guards the entrance to the Underworld'),
  (5201, 2, 'Cacus',     'giant',                 'hostile',  'Fire-breathing thief defeated by Hercules in Roman tradition'),
  (5301, 3, 'Apep',      'serpent',               'hostile',  'Chaos serpent opposing the sun''s journey'),
  (5401, 4, 'Tiamat',    'primordial sea-dragon', 'hostile',  'Chaos sea; defeated by Marduk in Babylonian myth')
on conflict (monster_id) do nothing;

insert into public."Monster Favors" (monster_id, god_id, favor_type, notes)
values
  (5003, 105, 'ward',       'Cerberus serves as guardian of Hades'' realm'),
  (5301, 301, 'enemy',      'Apep opposes Ra''s solar journey'),
  (5401, 401, 'enemy',      'Tiamat is defeated by Marduk in Babylonian myth'),
  (5002, 104, 'instigator', 'Poseidon is linked to the bull that leads to the Minotaur story'),
  (5001, 102, 'instigator', 'Hera''s opposition to Heracles frames the Hydra episode')
on conflict (monster_id, god_id) do nothing;

insert into public."Monster Works" (monster_id, title, kind, approx_date)
values
  (5002, 'Theseus and the Minotaur',          'myth', 'Classical tradition'),
  (5003, 'Twelve Labors (Cerberus)',          'myth', 'Classical tradition'),
  (5401, 'Enuma Elish',                       'epic', '2nd millennium BCE (compiled)'),
  (5301, 'Book of the Dead (Apep episodes)',  'text', 'New Kingdom and later');

commit;
