-- Biblical Places enhancements:
-- 1. Add map_bounds to narrative ages (for zoom-to-region on filter)
-- 2. Add scripture_verse to person-place connections (actual Bible text)
-- 3. Add BP_Resources table for BibleProject videos and other embeddable content

begin;

-- ── 1. Narrative age map bounds ─────────────────────────────────────────────
-- Stored as an array of 4 doubles: [sw_lng, sw_lat, ne_lng, ne_lat]
-- Using a jsonb column for the bounds array.

alter table public."BP_NarrativeAges"
  add column if not exists map_bounds jsonb;

-- Set zoom bounds for each narrative age
-- Creation/Primeval: zoom out to show Mesopotamia + near east
update public."BP_NarrativeAges" set map_bounds = '[27, 28, 48, 38]'::jsonb where age_id = 'age-creation';
-- Patriarchs: Ur to Canaan to Egypt
update public."BP_NarrativeAges" set map_bounds = '[29, 28, 47, 38]'::jsonb where age_id = 'age-patriarchs';
-- Exodus: Egypt + Sinai + southern Canaan
update public."BP_NarrativeAges" set map_bounds = '[29, 27, 37, 33]'::jsonb where age_id = 'age-exodus';
-- Conquest: Canaan focused
update public."BP_NarrativeAges" set map_bounds = '[34, 30, 36.5, 33.5]'::jsonb where age_id = 'age-conquest';
-- United Monarchy: Canaan focused
update public."BP_NarrativeAges" set map_bounds = '[34, 30, 36.5, 33.5]'::jsonb where age_id = 'age-united-monarchy';
-- Divided Monarchy: Canaan + Damascus + Nineveh
update public."BP_NarrativeAges" set map_bounds = '[34, 30, 44, 37]'::jsonb where age_id = 'age-divided-monarchy';
-- Judah & Exile: Canaan + Babylon
update public."BP_NarrativeAges" set map_bounds = '[33, 29, 46, 37]'::jsonb where age_id = 'age-judah-exile';
-- Return: Canaan + Babylon
update public."BP_NarrativeAges" set map_bounds = '[33, 29, 46, 37]'::jsonb where age_id = 'age-return';
-- Second Temple: Canaan focused
update public."BP_NarrativeAges" set map_bounds = '[34, 30, 36.5, 33.5]'::jsonb where age_id = 'age-second-temple';
-- Gospels: Galilee to Jerusalem
update public."BP_NarrativeAges" set map_bounds = '[34.5, 31, 36, 33.2]'::jsonb where age_id = 'age-gospels';

-- ── 2. Scripture verse text for person-place connections ─────────────────────
-- Stores actual Bible verse text (e.g. from NET or NRSV) with citation

alter table public."BP_PersonPlaces"
  add column if not exists scripture_verse text;

-- Populate with NET Bible verses (New English Translation - free to use with attribution)
-- Abraham at Ur
update public."BP_PersonPlaces" set scripture_verse = '"Terah took his son Abram, his grandson Lot, son of Haran, and his daughter-in-law Sarai, the wife of his son Abram, and they set out together from Ur of the Chaldeans to go to Canaan." — Genesis 11:31 (NET)'
  where person_id = 'abraham' and place_id = 'ur';

-- Abraham at Haran
update public."BP_PersonPlaces" set scripture_verse = '"So Abram left, as the Lord had told him to do, and Lot went with him. Abram was seventy-five years old when he departed from Haran." — Genesis 12:4 (NET)'
  where person_id = 'abraham' and place_id = 'haran';

-- Abraham at Shechem
update public."BP_PersonPlaces" set scripture_verse = '"Abram traveled through the land as far as the oak of Moreh at Shechem. At that time the Canaanites were in the land. The Lord appeared to Abram and said, ''To your descendants I will give this land.''" — Genesis 12:6–7 (NET)'
  where person_id = 'abraham' and place_id = 'shechem';

-- Abraham at Hebron
update public."BP_PersonPlaces" set scripture_verse = '"So Abram moved his camp and went to live by the oaks of Mamre in Hebron, and he built an altar to the Lord there." — Genesis 13:18 (NET)'
  where person_id = 'abraham' and place_id = 'hebron';

-- Abraham at Mount Moriah
update public."BP_PersonPlaces" set scripture_verse = '"God said, ''Take your son—your only son, whom you love, Isaac—and go to the land of Moriah! Offer him up there as a burnt offering on one of the mountains which I will indicate to you.''" — Genesis 22:2 (NET)'
  where person_id = 'abraham' and place_id = 'mt-moriah';

-- Sarah at Hebron
update public."BP_PersonPlaces" set scripture_verse = '"Sarah died in Kiriath Arba (that is, Hebron) in the land of Canaan." — Genesis 23:2 (NET)'
  where person_id = 'sarah' and place_id = 'hebron';

-- Isaac at Moriah
update public."BP_PersonPlaces" set scripture_verse = '"When they came to the place God had told him about, Abraham built the altar there and arranged the wood on it. Next he tied up his son Isaac and placed him on the altar on top of the wood." — Genesis 22:9 (NET)'
  where person_id = 'isaac' and place_id = 'mt-moriah';

-- Jacob at Bethel
update public."BP_PersonPlaces" set scripture_verse = '"He had a dream in which he saw a stairway set up on the earth with its top reaching to heaven; the angels of God were going up and coming down it." — Genesis 28:12 (NET)'
  where person_id = 'jacob' and place_id = 'bethel';

-- Jacob at Haran
update public."BP_PersonPlaces" set scripture_verse = '"So Jacob served seven years for Rachel, and they seemed like only a few days to him because he loved her so much." — Genesis 29:20 (NET)'
  where person_id = 'jacob' and place_id = 'haran';

-- Joseph in Egypt
update public."BP_PersonPlaces" set scripture_verse = '"Pharaoh said to Joseph, ''See, I have placed you over all the land of Egypt.''" — Genesis 41:41 (NET)'
  where person_id = 'joseph' and place_id = 'egypt-goshen';

-- Moses born in Egypt
update public."BP_PersonPlaces" set scripture_verse = '"A man from the household of Levi married a woman who was a descendant of Levi. The woman became pregnant and gave birth to a son." — Exodus 2:1–2 (NET)'
  where person_id = 'moses' and place_id = 'egypt-goshen';

-- Moses at Sinai
update public."BP_PersonPlaces" set scripture_verse = '"Moses went up to God, and the Lord called to him from the mountain, ''Thus you will tell the house of Jacob, and declare to the people of Israel.''" — Exodus 19:3 (NET)'
  where person_id = 'moses' and place_id = 'sinai';

-- Joshua at Jordan
update public."BP_PersonPlaces" set scripture_verse = '"When the feet of the priests carrying the ark of the Lord, the Ruler of the whole earth, touch the water of the Jordan, the water coming downstream toward you will stop flowing and pile up." — Joshua 3:13 (NET)'
  where person_id = 'joshua' and place_id = 'jordan-river';

-- Joshua at Jericho
update public."BP_PersonPlaces" set scripture_verse = '"The wall collapsed and the warriors charged straight ahead into the city and captured it." — Joshua 6:20 (NET)'
  where person_id = 'joshua' and place_id = 'jericho';

-- Samuel at Shiloh
update public."BP_PersonPlaces" set scripture_verse = '"Now the boy Samuel continued to grow in the presence of the Lord." — 1 Samuel 2:21 (NET)'
  where person_id = 'samuel' and place_id = 'shiloh';

-- David at Bethlehem
update public."BP_PersonPlaces" set scripture_verse = '"The Lord said to Samuel, ''How long do you intend to mourn for Saul? I have rejected him as king over Israel. Fill your horn with olive oil and go. I am sending you to Jesse in Bethlehem, for I have selected a king for myself from among his sons.''" — 1 Samuel 16:1 (NET)'
  where person_id = 'david' and place_id = 'bethlehem';

-- David at Hebron
update public."BP_PersonPlaces" set scripture_verse = '"So all the elders of Israel came to the king at Hebron. King David made an agreement with them in Hebron before the Lord. They anointed David as king over Israel." — 2 Samuel 5:3 (NET)'
  where person_id = 'david' and place_id = 'hebron';

-- David at Jerusalem
update public."BP_PersonPlaces" set scripture_verse = '"So David captured the fortress of Zion (that is, the City of David)." — 2 Samuel 5:7 (NET)'
  where person_id = 'david' and place_id = 'jerusalem';

-- Solomon at Jerusalem
update public."BP_PersonPlaces" set scripture_verse = '"So Solomon finished building the Lord''s temple." — 1 Kings 6:14 (NET)'
  where person_id = 'solomon' and place_id = 'jerusalem';

-- Elijah at Mount Carmel
update public."BP_PersonPlaces" set scripture_verse = '"When all the people saw this, they threw themselves down with their faces to the ground and said, ''The Lord is the true God! The Lord is the true God!''" — 1 Kings 18:39 (NET)'
  where person_id = 'elijah' and place_id = 'mt-carmel';

-- Elijah at Sinai
update public."BP_PersonPlaces" set scripture_verse = '"He got up and ate and drank. That meal gave him the strength to travel forty days and forty nights until he reached Horeb, the mountain of God." — 1 Kings 19:8 (NET)'
  where person_id = 'elijah' and place_id = 'sinai';

-- Daniel in Babylon
update public."BP_PersonPlaces" set scripture_verse = '"Daniel excelled above all the other supervisors and satraps, for he had an extraordinary spirit." — Daniel 6:3 (NET)'
  where person_id = 'daniel' and place_id = 'babylon';

-- Jeremiah in Jerusalem
update public."BP_PersonPlaces" set scripture_verse = '"Before I formed you in your mother''s womb I chose you. Before you were born I set you apart. I appointed you to be a prophet to the nations." — Jeremiah 1:5 (NET)'
  where person_id = 'jeremiah' and place_id = 'jerusalem';

-- Jesus at Bethlehem
update public."BP_PersonPlaces" set scripture_verse = '"So Joseph also went up from the town of Nazareth in Galilee to Judea, to the city of David called Bethlehem. While they were there, the time came for her to deliver her child." — Luke 2:4, 6 (NET)'
  where person_id = 'jesus' and place_id = 'bethlehem';

-- Jesus at Nazareth
update public."BP_PersonPlaces" set scripture_verse = '"He came to Nazareth, where he had been brought up, and went into the synagogue on the Sabbath day, as was his custom." — Luke 4:16 (NET)'
  where person_id = 'jesus' and place_id = 'nazareth';

-- Jesus at Capernaum
update public."BP_PersonPlaces" set scripture_verse = '"Now when Jesus heard that John had been imprisoned, he went into Galilee. While leaving Nazareth, he went and lived in Capernaum, which is by the sea." — Matthew 4:12–13 (NET)'
  where person_id = 'jesus' and place_id = 'capernaum';

-- Jesus at Jordan
update public."BP_PersonPlaces" set scripture_verse = '"After Jesus was baptized, just as he was coming up out of the water, the heavens opened and he saw the Spirit of God descending like a dove and coming on him." — Matthew 3:16 (NET)'
  where person_id = 'jesus' and place_id = 'jordan-river';

-- Jesus at Jerusalem
update public."BP_PersonPlaces" set scripture_verse = '"He is not here, for he has been raised, just as he said. Come, see the place where he was lying." — Matthew 28:6 (NET)'
  where person_id = 'jesus' and place_id = 'jerusalem';

-- Mary at Nazareth
update public."BP_PersonPlaces" set scripture_verse = '"The angel said to her, ''Do not be afraid, Mary, for you have found favor with God. Listen: You will become pregnant and give birth to a son, and you will name him Jesus.''" — Luke 1:30–31 (NET)'
  where person_id = 'mary' and place_id = 'nazareth';

-- Gabriel at Nazareth
update public."BP_PersonPlaces" set scripture_verse = '"In the sixth month of Elizabeth''s pregnancy, the angel Gabriel was sent by God to a town of Galilee called Nazareth." — Luke 1:26 (NET)'
  where person_id = 'gabriel' and place_id = 'nazareth';

-- Nehemiah at Jerusalem
update public."BP_PersonPlaces" set scripture_verse = '"So the wall was completed on the twenty-fifth day of Elul, in just fifty-two days." — Nehemiah 6:15 (NET)'
  where person_id = 'nehemiah' and place_id = 'jerusalem';

-- Ezra at Jerusalem
update public."BP_PersonPlaces" set scripture_verse = '"For Ezra had set his heart to study the law of the Lord, to practice it, and to teach its statutes and judgments in Israel." — Ezra 7:10 (NET)'
  where person_id = 'ezra' and place_id = 'jerusalem';

-- ── 3. BP_Resources table ───────────────────────────────────────────────────
-- Stores embeddable resources (BibleProject videos, etc.) that can be linked
-- to places, people, events, or narrative ages.

create table if not exists public."BP_Resources" (
  resource_id     text not null,
  title           text not null,
  resource_type   text not null default 'video',  -- video, article, image
  provider        text,                            -- 'bibleproject', 'youtube', etc.
  url             text not null,                   -- full URL
  embed_url       text,                            -- embeddable URL (e.g. youtube embed)
  thumbnail_url   text,
  description     text,
  created_at      timestamptz not null default now(),
  constraint "BP_Resources_pkey" primary key (resource_id),
  constraint "BP_Resources_type_check"
    check (resource_type in ('video', 'article', 'image'))
);

-- Junction table: resources <-> entities
create table if not exists public."BP_ResourceLinks" (
  id           bigint generated always as identity primary key,
  resource_id  text not null,
  place_id     text,
  person_id    text,
  event_id     text,
  age_id       text,
  created_at   timestamptz not null default now(),
  constraint "BP_ResourceLinks_resource_fkey" foreign key (resource_id)
    references public."BP_Resources"(resource_id) on delete cascade,
  constraint "BP_ResourceLinks_place_fkey" foreign key (place_id)
    references public."BP_Places"(place_id) on delete cascade,
  constraint "BP_ResourceLinks_person_fkey" foreign key (person_id)
    references public."BP_People"(person_id) on delete cascade,
  constraint "BP_ResourceLinks_event_fkey" foreign key (event_id)
    references public."BP_Events"(event_id) on delete cascade,
  constraint "BP_ResourceLinks_age_fkey" foreign key (age_id)
    references public."BP_NarrativeAges"(age_id) on delete cascade
);

create index if not exists "BP_ResourceLinks_resource_idx" on public."BP_ResourceLinks" (resource_id);
create index if not exists "BP_ResourceLinks_place_idx" on public."BP_ResourceLinks" (place_id);
create index if not exists "BP_ResourceLinks_person_idx" on public."BP_ResourceLinks" (person_id);
create index if not exists "BP_ResourceLinks_event_idx" on public."BP_ResourceLinks" (event_id);
create index if not exists "BP_ResourceLinks_age_idx" on public."BP_ResourceLinks" (age_id);

-- RLS
alter table public."BP_Resources" enable row level security;
alter table public."BP_ResourceLinks" enable row level security;

create policy "Public can read resources" on public."BP_Resources"
  for select using (true);
create policy "Public can read resource links" on public."BP_ResourceLinks"
  for select using (true);

-- ── Seed BibleProject videos ────────────────────────────────────────────────
-- BibleProject YouTube channel: @bibleproject
-- All videos are embeddable per BibleProject's terms for non-profit/educational use.

insert into public."BP_Resources" (resource_id, title, resource_type, provider, url, embed_url, thumbnail_url, description) values
  ('bp-genesis-1',    'Overview: Genesis 1-11',     'video', 'bibleproject', 'https://www.youtube.com/watch?v=GQI72THyO5I', 'https://www.youtube.com/embed/GQI72THyO5I', 'https://img.youtube.com/vi/GQI72THyO5I/hqdefault.jpg', 'BibleProject overview of Genesis 1-11: Creation, the Fall, the Flood, and the Tower of Babel.'),
  ('bp-genesis-2',    'Overview: Genesis 12-50',    'video', 'bibleproject', 'https://www.youtube.com/watch?v=F4isSyennFo', 'https://www.youtube.com/embed/F4isSyennFo', 'https://img.youtube.com/vi/F4isSyennFo/hqdefault.jpg', 'BibleProject overview of Genesis 12-50: Abraham, Isaac, Jacob, and Joseph.'),
  ('bp-exodus-1',     'Overview: Exodus 1-18',      'video', 'bibleproject', 'https://www.youtube.com/watch?v=jH_aojNJM3E', 'https://www.youtube.com/embed/jH_aojNJM3E', 'https://img.youtube.com/vi/jH_aojNJM3E/hqdefault.jpg', 'BibleProject overview of Exodus 1-18: Slavery in Egypt, Moses, plagues, and the Exodus.'),
  ('bp-exodus-2',     'Overview: Exodus 19-40',     'video', 'bibleproject', 'https://www.youtube.com/watch?v=oNpTha80yyE', 'https://www.youtube.com/embed/oNpTha80yyE', 'https://img.youtube.com/vi/oNpTha80yyE/hqdefault.jpg', 'BibleProject overview of Exodus 19-40: Mount Sinai, the Law, and the Tabernacle.'),
  ('bp-joshua',       'Overview: Joshua',           'video', 'bibleproject', 'https://www.youtube.com/watch?v=JqOqJlFF_eU', 'https://www.youtube.com/embed/JqOqJlFF_eU', 'https://img.youtube.com/vi/JqOqJlFF_eU/hqdefault.jpg', 'BibleProject overview of Joshua: Conquest of Canaan and the division of the land.'),
  ('bp-judges',       'Overview: Judges',           'video', 'bibleproject', 'https://www.youtube.com/watch?v=kOYy8iCfIJ4', 'https://www.youtube.com/embed/kOYy8iCfIJ4', 'https://img.youtube.com/vi/kOYy8iCfIJ4/hqdefault.jpg', 'BibleProject overview of Judges: The cycle of rebellion, oppression, and deliverance.'),
  ('bp-1-samuel',     'Overview: 1 Samuel',         'video', 'bibleproject', 'https://www.youtube.com/watch?v=QJOju5Dw0V0', 'https://www.youtube.com/embed/QJOju5Dw0V0', 'https://img.youtube.com/vi/QJOju5Dw0V0/hqdefault.jpg', 'BibleProject overview of 1 Samuel: Samuel, Saul, and David.'),
  ('bp-2-samuel',     'Overview: 2 Samuel',         'video', 'bibleproject', 'https://www.youtube.com/watch?v=YvoWDXNDJgs', 'https://www.youtube.com/embed/YvoWDXNDJgs', 'https://img.youtube.com/vi/YvoWDXNDJgs/hqdefault.jpg', 'BibleProject overview of 2 Samuel: David''s reign, successes, and failures.'),
  ('bp-1-kings',      'Overview: 1 Kings',          'video', 'bibleproject', 'https://www.youtube.com/watch?v=bVFW3wbi9pk', 'https://www.youtube.com/embed/bVFW3wbi9pk', 'https://img.youtube.com/vi/bVFW3wbi9pk/hqdefault.jpg', 'BibleProject overview of 1 Kings: Solomon, the Temple, and the kingdom divides.'),
  ('bp-2-kings',      'Overview: 2 Kings',          'video', 'bibleproject', 'https://www.youtube.com/watch?v=zez_Dc3mhJI', 'https://www.youtube.com/embed/zez_Dc3mhJI', 'https://img.youtube.com/vi/zez_Dc3mhJI/hqdefault.jpg', 'BibleProject overview of 2 Kings: The fall of Israel and Judah.'),
  ('bp-ezra-neh',     'Overview: Ezra-Nehemiah',    'video', 'bibleproject', 'https://www.youtube.com/watch?v=MkETkRv9tG8', 'https://www.youtube.com/embed/MkETkRv9tG8', 'https://img.youtube.com/vi/MkETkRv9tG8/hqdefault.jpg', 'BibleProject overview of Ezra-Nehemiah: Return from exile and rebuilding.'),
  ('bp-daniel',       'Overview: Daniel',           'video', 'bibleproject', 'https://www.youtube.com/watch?v=9cSC9uobtPM', 'https://www.youtube.com/embed/9cSC9uobtPM', 'https://img.youtube.com/vi/9cSC9uobtPM/hqdefault.jpg', 'BibleProject overview of Daniel: Faithfulness in exile and apocalyptic visions.'),
  ('bp-luke',         'Overview: Luke 1-9',         'video', 'bibleproject', 'https://www.youtube.com/watch?v=XIb_dCIxzr0', 'https://www.youtube.com/embed/XIb_dCIxzr0', 'https://img.youtube.com/vi/XIb_dCIxzr0/hqdefault.jpg', 'BibleProject overview of Luke 1-9: Birth, baptism, and early ministry of Jesus.'),
  ('bp-matthew',      'Overview: Matthew 1-13',     'video', 'bibleproject', 'https://www.youtube.com/watch?v=3Dv4-n2MRAo', 'https://www.youtube.com/embed/3Dv4-n2MRAo', 'https://img.youtube.com/vi/3Dv4-n2MRAo/hqdefault.jpg', 'BibleProject overview of Matthew 1-13: Jesus as the promised Messiah.'),
  ('bp-jonah',        'Overview: Jonah',            'video', 'bibleproject', 'https://www.youtube.com/watch?v=dLIabZc0O4c', 'https://www.youtube.com/embed/dLIabZc0O4c', 'https://img.youtube.com/vi/dLIabZc0O4c/hqdefault.jpg', 'BibleProject overview of Jonah: A prophet runs from God and goes to Nineveh.'),
  ('bp-temple',       'The Temple',                 'video', 'bibleproject', 'https://www.youtube.com/watch?v=wRYoEFIm3FY', 'https://www.youtube.com/embed/wRYoEFIm3FY', 'https://img.youtube.com/vi/wRYoEFIm3FY/hqdefault.jpg', 'BibleProject theme video on the Temple as the place where heaven and earth overlap.'),
  ('bp-exile',        'Exile',                      'video', 'bibleproject', 'https://www.youtube.com/watch?v=xSua9_yMMgo', 'https://www.youtube.com/embed/xSua9_yMMgo', 'https://img.youtube.com/vi/xSua9_yMMgo/hqdefault.jpg', 'BibleProject theme video on Exile: The pattern of rebellion and exile throughout the Bible.');

-- Link videos to places, events, and ages
insert into public."BP_ResourceLinks" (resource_id, place_id, person_id, event_id, age_id) values
  -- Genesis 1-11 → Creation age, Babel/Babylon
  ('bp-genesis-1',  'babylon',    null,       null,                   'age-creation'),
  ('bp-genesis-1',  null,         null,       'tower-of-babel',       null),
  -- Genesis 12-50 → Patriarchs age, key places
  ('bp-genesis-2',  null,         null,       null,                   'age-patriarchs'),
  ('bp-genesis-2',  'hebron',     null,       null,                   null),
  ('bp-genesis-2',  'bethel',     null,       null,                   null),
  ('bp-genesis-2',  'shechem',    null,       null,                   null),
  ('bp-genesis-2',  null,         null,       'binding-of-isaac',     null),
  -- Exodus 1-18 → Exodus age, Egypt
  ('bp-exodus-1',   null,         null,       null,                   'age-exodus'),
  ('bp-exodus-1',   'egypt-goshen', null,     null,                   null),
  ('bp-exodus-1',   null,         null,       'exodus',               null),
  -- Exodus 19-40 → Sinai
  ('bp-exodus-2',   'sinai',      null,       null,                   null),
  ('bp-exodus-2',   null,         null,       'giving-of-law',        null),
  -- Joshua → Conquest age, Jericho, Jordan
  ('bp-joshua',     null,         null,       null,                   'age-conquest'),
  ('bp-joshua',     'jericho',    null,       null,                   null),
  ('bp-joshua',     'jordan-river', null,     null,                   null),
  -- Judges → Conquest age, Deborah
  ('bp-judges',     null,         null,       'deborahs-victory',     null),
  -- 1 Samuel → United Monarchy
  ('bp-1-samuel',   null,         null,       null,                   'age-united-monarchy'),
  ('bp-1-samuel',   'hebron',     null,       null,                   null),
  -- 2 Samuel → David + Jerusalem
  ('bp-2-samuel',   'jerusalem',  null,       null,                   null),
  ('bp-2-samuel',   null,         null,       'david-takes-jerusalem', null),
  -- 1 Kings → Solomon's Temple, Elijah, Mount Carmel
  ('bp-1-kings',    null,         null,       'solomons-temple',      null),
  ('bp-1-kings',    'mt-carmel',  null,       null,                   null),
  ('bp-1-kings',    null,         null,       'elijah-on-carmel',     null),
  ('bp-1-kings',    null,         null,       'kingdom-divides',      null),
  -- 2 Kings → Fall of Samaria, Fall of Jerusalem
  ('bp-2-kings',    'samaria',    null,       null,                   null),
  ('bp-2-kings',    null,         null,       'fall-of-samaria',      null),
  ('bp-2-kings',    null,         null,       'fall-of-jerusalem',    null),
  -- Ezra-Nehemiah → Return age, Jerusalem
  ('bp-ezra-neh',   null,         null,       null,                   'age-return'),
  ('bp-ezra-neh',   null,         null,       'temple-rebuilt',       null),
  ('bp-ezra-neh',   null,         null,       'nehemiah-walls',       null),
  -- Daniel → Babylon, exile
  ('bp-daniel',     'babylon',    null,       null,                   null),
  ('bp-daniel',     null,         null,       'daniel-in-babylon',    null),
  -- Luke → Gospels age, Nazareth, Bethlehem
  ('bp-luke',       null,         null,       null,                   'age-gospels'),
  ('bp-luke',       'nazareth',   null,       null,                   null),
  ('bp-luke',       'bethlehem',  null,       null,                   null),
  ('bp-luke',       null,         null,       'annunciation',         null),
  ('bp-luke',       null,         null,       'birth-of-jesus',       null),
  -- Matthew → Gospels, Jerusalem
  ('bp-matthew',    'jerusalem',  null,       null,                   null),
  ('bp-matthew',    'capernaum',  null,       null,                   null),
  ('bp-matthew',    null,         null,       'sermon-on-mount',      null),
  -- Jonah → Nineveh
  ('bp-jonah',      'nineveh',    null,       null,                   null),
  ('bp-jonah',      null,         null,       'jonah-at-nineveh',     null),
  -- Temple theme → Jerusalem, Solomon's Temple
  ('bp-temple',     'jerusalem',  null,       null,                   null),
  ('bp-temple',     null,         null,       'solomons-temple',      null),
  -- Exile theme → Babylon, exile age
  ('bp-exile',      'babylon',    null,       null,                   null),
  ('bp-exile',      null,         null,       null,                   'age-judah-exile');

commit;
