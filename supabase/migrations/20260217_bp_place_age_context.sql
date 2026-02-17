-- Narrative Age + Place Context:
-- 1. BP_PlacePeriodNames — era-specific names for places (e.g. "Sea of Kinnereth" → "Sea of Galilee")
-- 2. BP_PlaceAgeSummaries — age-specific summary text for places

begin;

-- ── BP_PlacePeriodNames ───────────────────────────────────────────────────────
-- Stores period-specific names for places. The common/default name stays in BP_Places.name.

create table if not exists public."BP_PlacePeriodNames" (
  id         bigint generated always as identity primary key,
  place_id   text not null,
  age_id     text not null,
  name       text not null,
  created_at timestamptz not null default now(),
  constraint "BP_PlacePeriodNames_place_fkey" foreign key (place_id)
    references public."BP_Places"(place_id) on delete cascade,
  constraint "BP_PlacePeriodNames_age_fkey" foreign key (age_id)
    references public."BP_NarrativeAges"(age_id) on delete cascade,
  constraint "BP_PlacePeriodNames_unique" unique (place_id, age_id)
);

create index if not exists "BP_PlacePeriodNames_place_idx" on public."BP_PlacePeriodNames" (place_id);
create index if not exists "BP_PlacePeriodNames_age_idx" on public."BP_PlacePeriodNames" (age_id);

-- ── BP_PlaceAgeSummaries ──────────────────────────────────────────────────────
-- Age-specific description/summary text for a place, providing context for what
-- the place meant during that narrative period.

create table if not exists public."BP_PlaceAgeSummaries" (
  id         bigint generated always as identity primary key,
  place_id   text not null,
  age_id     text not null,
  summary    text not null,
  created_at timestamptz not null default now(),
  constraint "BP_PlaceAgeSummaries_place_fkey" foreign key (place_id)
    references public."BP_Places"(place_id) on delete cascade,
  constraint "BP_PlaceAgeSummaries_age_fkey" foreign key (age_id)
    references public."BP_NarrativeAges"(age_id) on delete cascade,
  constraint "BP_PlaceAgeSummaries_unique" unique (place_id, age_id)
);

create index if not exists "BP_PlaceAgeSummaries_place_idx" on public."BP_PlaceAgeSummaries" (place_id);
create index if not exists "BP_PlaceAgeSummaries_age_idx" on public."BP_PlaceAgeSummaries" (age_id);

-- ── RLS ───────────────────────────────────────────────────────────────────────

alter table public."BP_PlacePeriodNames" enable row level security;
alter table public."BP_PlaceAgeSummaries" enable row level security;

create policy "Public can read place period names" on public."BP_PlacePeriodNames"
  for select using (true);
create policy "Public can read place age summaries" on public."BP_PlaceAgeSummaries"
  for select using (true);

-- ── Seed: Period Names ────────────────────────────────────────────────────────
-- Examples of place names that change across eras.

insert into public."BP_PlacePeriodNames" (place_id, age_id, name) values
  -- Jerusalem was known as Salem / Jebus before David's conquest
  ('jerusalem', 'age-creation',         'Salem'),
  ('jerusalem', 'age-patriarchs',       'Salem'),
  ('jerusalem', 'age-conquest',         'Jebus'),
  ('jerusalem', 'age-united-monarchy',  'City of David'),
  -- Bethel was originally called Luz
  ('bethel',    'age-creation',         'Luz'),
  ('bethel',    'age-patriarchs',       'Luz / Bethel'),
  -- Hebron was called Kiriath-Arba
  ('hebron',    'age-patriarchs',       'Kiriath-Arba / Hebron'),
  ('hebron',    'age-conquest',         'Kiriath-Arba'),
  -- Shechem doesn't change but Samaria does
  ('samaria',   'age-conquest',         'Hill Country of Ephraim'),
  ('samaria',   'age-divided-monarchy', 'Samaria'),
  ('samaria',   'age-gospels',          'Samaria / Sebaste')
on conflict (place_id, age_id) do nothing;

-- ── Seed: Age Summaries ───────────────────────────────────────────────────────
-- Contextual descriptions of what a place meant during specific narrative ages.

insert into public."BP_PlaceAgeSummaries" (place_id, age_id, summary) values
  -- Jerusalem across ages
  ('jerusalem', 'age-patriarchs',       'Known as Salem, this is where Melchizedek — priest of God Most High — met Abraham and blessed him after his victory over the kings. The city would not become central to Israel''s story for another thousand years.'),
  ('jerusalem', 'age-conquest',         'Still held by the Jebusites and known as Jebus, this fortified city resisted Israelite conquest. It sat on the border between the tribal allotments of Judah and Benjamin, unconquered during the period of the judges.'),
  ('jerusalem', 'age-united-monarchy',  'David conquered the Jebusite stronghold and made it his capital — the City of David. Solomon built the Temple here, making Jerusalem the political and religious center of united Israel.'),
  ('jerusalem', 'age-divided-monarchy', 'Capital of the southern kingdom of Judah. The Temple stood as the center of worship, though the northern kingdom established rival sanctuaries at Dan and Bethel.'),
  ('jerusalem', 'age-judah-exile',      'The city endured siege and ultimately fell to Nebuchadnezzar of Babylon in 586 BC. The Temple was destroyed and the population deported. Jeremiah wept over its destruction.'),
  ('jerusalem', 'age-return',           'The returning exiles rebuilt the Temple under Zerubbabel (516 BC) and Nehemiah led the rebuilding of the city walls. Jerusalem was restored as the center of Jewish worship, though on a humbler scale.'),
  ('jerusalem', 'age-second-temple',    'Under the Hasmoneans, Jerusalem regained political independence. Herod the Great later rebuilt the Temple on a grand scale. The city was now under Roman oversight.'),
  ('jerusalem', 'age-gospels',          'The setting for Jesus'' final week — his triumphal entry, cleansing of the Temple, Last Supper, crucifixion, and resurrection. Herod''s Temple stood in its full splendor.'),

  -- Hebron
  ('hebron', 'age-patriarchs',          'Abraham settled by the oaks of Mamre near Hebron. He purchased the Cave of Machpelah here as a burial place for Sarah — the first piece of the promised land owned by the family of faith.'),
  ('hebron', 'age-conquest',            'One of the cities conquered during Joshua''s campaign. It was given to Caleb as his inheritance because of his faithfulness as one of the twelve spies.'),
  ('hebron', 'age-united-monarchy',     'David''s first capital. He reigned here over Judah for seven and a half years before conquering Jerusalem and uniting all the tribes under his rule.'),

  -- Bethel
  ('bethel', 'age-patriarchs',          'Here Jacob dreamed of a stairway reaching to heaven, with angels ascending and descending. He named the place Bethel — "House of God" — and set up a memorial stone.'),
  ('bethel', 'age-divided-monarchy',    'Jeroboam I set up a golden calf here as a rival worship site to Jerusalem, leading the northern kingdom into idolatry. The prophets condemned Bethel as a place of false worship.'),

  -- Sinai
  ('sinai', 'age-exodus',               'The mountain of God where Moses received the Law. Israel camped here for nearly a year. God''s presence descended in fire and cloud, and the covenant was established between God and his people.'),
  ('sinai', 'age-divided-monarchy',      'Elijah fled here in despair after his victory on Mount Carmel. God met him not in wind, earthquake, or fire, but in a still, small voice — echoing the original Sinai encounter.'),

  -- Jordan River
  ('jordan-river', 'age-conquest',       'Israel crossed the Jordan on dry ground, led by the Ark of the Covenant. The waters stopped at Adam and the people passed over into the promised land — echoing the Red Sea crossing a generation earlier.'),
  ('jordan-river', 'age-divided-monarchy', 'Elijah struck the Jordan with his cloak and crossed on dry ground before being taken up to heaven. Elisha repeated the miracle on his return — a sign that the prophetic mantle had passed to him.'),
  ('jordan-river', 'age-gospels',        'Jesus was baptized in the Jordan by John the Baptist. The heavens opened, the Spirit descended like a dove, and a voice declared, "This is my beloved Son." The river became the site of Jesus'' public commissioning.'),

  -- Babylon
  ('babylon', 'age-creation',            'The region of Shinar, where humanity attempted to build a tower reaching heaven. God confused their languages and scattered the peoples across the earth — the origin of the name Babel.'),
  ('babylon', 'age-judah-exile',         'The capital of the Neo-Babylonian Empire under Nebuchadnezzar. The Jewish exiles lived here by the rivers of Babylon, weeping as they remembered Zion. Daniel served in the royal court. Ezekiel prophesied among the exiles.'),

  -- Jericho
  ('jericho', 'age-conquest',            'The first city conquered in the promised land. Israel marched around it for seven days, and on the seventh day the walls collapsed. Rahab and her family were spared for sheltering the Israelite spies.'),
  ('jericho', 'age-gospels',             'Near Jericho, Jesus healed blind Bartimaeus and called Zacchaeus down from a sycamore tree. The road from Jericho to Jerusalem was the setting for the parable of the Good Samaritan.'),

  -- Bethlehem
  ('bethlehem', 'age-conquest',          'During the time of the judges, the story of Ruth unfolded here. Ruth the Moabite gleaned in the fields of Boaz, and their union produced the lineage that would lead to David and ultimately to Jesus.'),
  ('bethlehem', 'age-united-monarchy',   'The hometown of David. Here the prophet Samuel came in secret to anoint the youngest son of Jesse as the future king of Israel, choosing him from among his brothers.'),
  ('bethlehem', 'age-gospels',           'The birthplace of Jesus, fulfilling the prophecy of Micah. Mary and Joseph traveled here for the census, and Jesus was born and laid in a manger because there was no room in the inn.'),

  -- Nazareth
  ('nazareth', 'age-gospels',            'The hometown of Jesus, where he grew up and lived until the start of his public ministry. The angel Gabriel appeared to Mary here. When Jesus taught in the local synagogue, his neighbors rejected him.'),

  -- Capernaum
  ('capernaum', 'age-gospels',           'Jesus'' base of operations during his Galilean ministry. Home of Peter and Andrew. Here Jesus called his first disciples, healed Peter''s mother-in-law, and taught with authority in the synagogue.')
on conflict (place_id, age_id) do nothing;

commit;
