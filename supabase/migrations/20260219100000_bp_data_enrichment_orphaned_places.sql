-- Data enrichment: connect orphaned places to people.
-- 56 places in BP_Places had zero BP_PersonPlaces rows.
-- This migration adds 4 new people and ~70 new person-place connections.
-- ON CONFLICT DO NOTHING on all inserts to preserve existing data.

begin;

-- ══════════════════════════════════════════════════════════════════════════
-- SECTION 1: NEW PEOPLE
-- ══════════════════════════════════════════════════════════════════════════

insert into public."BP_People" (person_id, name, description, scripture_refs) values
  ('job',          'Job',              'Righteous man from the land of Uz who suffered devastating loss yet maintained his faith in God. God restored him doubly.',                                                'Job'),
  ('peter',        'Peter (Simon)',    'Fisherman from Bethsaida, leader of the twelve apostles. Confessed Jesus as the Messiah. Denied him three times and was restored.',                                       'Matthew 4:18-20, 16:13-20; Luke 5:1-11; John 21; Acts 1-12'),
  ('john-baptist', 'John the Baptist', 'Prophet who prepared the way for the Messiah. Baptized in the Jordan River. Beheaded by Herod Antipas.',                                                                  'Matthew 3; 11:1-19; 14:1-12; Luke 1; John 1:19-34'),
  ('goliath',      'Goliath',          'Philistine champion from Gath, over nine feet tall. Killed by the young shepherd David with a sling and a stone.',                                                        '1 Samuel 17')
on conflict (person_id) do nothing;

-- ══════════════════════════════════════════════════════════════════════════
-- SECTION 2: PERSON-AGES FOR NEW PEOPLE
-- ══════════════════════════════════════════════════════════════════════════

insert into public."BP_PersonAges" (person_id, age_id, is_primary) values
  ('job',          'age-patriarchs',      true),
  ('peter',        'age-gospels',         true),
  ('john-baptist', 'age-gospels',         true),
  ('goliath',      'age-united-monarchy', true)
on conflict (person_id, age_id) do nothing;

-- ══════════════════════════════════════════════════════════════════════════
-- SECTION 3: PERSON-PLACES FOR NEW PEOPLE
-- ══════════════════════════════════════════════════════════════════════════

insert into public."BP_PersonPlaces" (person_id, place_id, narrative_age_id, context, scripture_verse) values
  -- Job
  ('job',          'land-of-uz',     'age-patriarchs',      'settled',                       'Job 1:1'),

  -- Peter
  ('peter',        'sea-of-galilee', 'age-gospels',         'fished here; called by Jesus',  'Matthew 4:18-20'),
  ('peter',        'capernaum',      'age-gospels',         'lived here',                    'Matthew 17:24-25'),

  -- John the Baptist
  ('john-baptist', 'jordan-river',   'age-gospels',         'baptized here',                 'Matthew 3:5-6'),

  -- Goliath
  ('goliath',      'gath',           'age-united-monarchy', 'hometown',                      '1 Samuel 17:4'),
  ('goliath',      'valley-of-elah', 'age-united-monarchy', 'killed here',                   '1 Samuel 17:49-50')
on conflict (person_id, place_id, narrative_age_id) do nothing;

-- ══════════════════════════════════════════════════════════════════════════
-- SECTION 4: CONNECT EXISTING PEOPLE TO ORPHANED PLACES
-- Organized by narrative age.
-- ══════════════════════════════════════════════════════════════════════════

insert into public."BP_PersonPlaces" (person_id, place_id, narrative_age_id, context, scripture_verse) values

  -- ── CREATION & PRIMEVAL ────────────────────────────────────────────────
  ('nimrod',    'assur',              'age-creation',    'built here',                        'Genesis 10:11'),

  -- ── PATRIARCHS ─────────────────────────────────────────────────────────
  ('abraham',  'moreh',              'age-patriarchs',  'first stop in Canaan',              'Genesis 12:6'),
  ('abraham',  'negev',              'age-patriarchs',  'traveled through',                  'Genesis 13:1'),
  ('abraham',  'dead-sea',           'age-patriarchs',  'looked out over destruction',       'Genesis 19:27-28'),
  ('lot',      'dead-sea',           'age-patriarchs',  'settled near its shores',           'Genesis 13:11-12'),
  ('lot',      'gomorrah',           'age-patriarchs',  'lived near',                        'Genesis 13:12'),
  ('isaac',    'negev',              'age-patriarchs',  'settled',                           'Genesis 24:62'),
  ('jacob',    'jabbok-river',       'age-patriarchs',  'wrestled with God at the ford',     'Genesis 32:22-24'),
  ('joseph',   'on',                 'age-patriarchs',  'married daughter of priest of On',  'Genesis 41:45'),
  ('hagar',    'wilderness-of-shur', 'age-patriarchs',  'fled here',                         'Genesis 16:7'),
  ('esau',     'teman',              'age-patriarchs',  'ancestor of the Temanites',         'Genesis 36:11'),

  -- ── EXODUS & WILDERNESS ────────────────────────────────────────────────
  ('moses',    'nile-river',         'age-exodus',  'placed in basket on the river',         'Exodus 2:3'),
  ('moses',    'wilderness-of-shur', 'age-exodus',  'passed through after Red Sea',          'Exodus 15:22'),
  ('moses',    'wilderness-of-sin',  'age-exodus',  'Israel received manna here',            'Exodus 16:1'),
  ('moses',    'wilderness-of-zin',  'age-exodus',  'wandered; struck the rock',             'Numbers 20:1-11'),
  ('moses',    'kibroth-hattaavah',  'age-exodus',  'God sent plague for craving',           'Numbers 11:34'),
  ('moses',    'oboth',              'age-exodus',  'passed through',                        'Numbers 21:10'),
  ('moses',    'punon',              'age-exodus',  'camped; bronze serpent nearby',          'Numbers 33:42-43'),
  ('moses',    'hormah',             'age-exodus',  'Israel defeated here',                  'Numbers 14:45'),
  ('moses',    'arad',               'age-exodus',  'fought king of Arad',                   'Numbers 21:1-3'),
  ('moses',    'arnon-river',        'age-exodus',  'boundary of conquest',                  'Deuteronomy 2:24'),
  ('moses',    'dibon',              'age-exodus',  'allocated territory',                   'Numbers 32:34'),
  ('moses',    'aroer',              'age-exodus',  'southern boundary of conquest',          'Deuteronomy 2:36'),
  ('moses',    'golan',              'age-exodus',  'designated city of refuge',              'Deuteronomy 4:43'),
  ('moses',    'bezer',              'age-exodus',  'designated city of refuge',              'Deuteronomy 4:43'),
  ('moses',    'pithom',             'age-exodus',  'Israelites forced to build',             'Exodus 1:11'),
  ('moses',    'beth-peor',          'age-exodus',  'farewell speeches nearby',               'Deuteronomy 3:29; 4:46'),

  -- ── CONQUEST & JUDGES ──────────────────────────────────────────────────
  ('joshua',   'mt-gerizim',         'age-conquest',  'blessings proclaimed here',            'Joshua 8:33'),
  ('joshua',   'mt-hermon',          'age-conquest',  'northern boundary of conquests',       'Joshua 11:17'),
  ('joshua',   'beth-horon',         'age-conquest',  'pursuit of Amorites',                  'Joshua 10:10-11'),
  ('joshua',   'dor',                'age-conquest',  'conquered',                            'Joshua 12:23'),
  ('joshua',   'shiloh-north',       'age-conquest',  'defeated northern coalition',          'Joshua 11:7'),
  ('joshua',   'azekah',             'age-conquest',  'pursued Amorites here',                'Joshua 10:10-11'),
  ('joshua',   'kinnereth',          'age-conquest',  'territory allocation',                 'Joshua 19:35'),
  ('joshua',   'acco',               'age-conquest',  'territory unconquered by Asher',       'Judges 1:31'),
  ('deborah',  'taanach',            'age-conquest',  'victory near here',                    'Judges 5:19'),
  ('deborah',  'valley-of-jezreel',  'age-conquest',  'battle in this valley',                'Judges 4:6-7'),
  ('gideon',   'valley-of-jezreel',  'age-conquest',  'defeated Midianites here',             'Judges 6:33; 7:1'),
  ('samuel',   'bethshemesh',        'age-conquest',  'Ark returned here',                    '1 Samuel 6:13-15'),
  ('samuel',   'ekron',              'age-conquest',  'Ark brought plagues',                  '1 Samuel 5:10'),
  ('samuel',   'ashdod',             'age-conquest',  'Ark in Dagon''s temple',               '1 Samuel 5:1-5'),
  ('micah-judges', 'laish',          'age-conquest',  'Danites brought his idol here',        'Judges 18:27-31'),

  -- ── UNITED MONARCHY ────────────────────────────────────────────────────
  ('saul',     'beth-shan',          'age-united-monarchy', 'body hung on walls',             '1 Samuel 31:10'),
  ('jonathan', 'beth-shan',          'age-united-monarchy', 'body hung on walls',             '1 Samuel 31:10'),
  ('david',    'kiriath-jearim',     'age-united-monarchy', 'retrieved the Ark',              '2 Samuel 6:2; 1 Chronicles 13:6'),
  ('david',    'mt-zion',            'age-united-monarchy', 'captured the stronghold',        '2 Samuel 5:7'),
  ('david',    'brook-besor',        'age-united-monarchy', 'pursuit of Amalekites',          '1 Samuel 30:9-10'),
  ('david',    'zobah',              'age-united-monarchy', 'defeated Hadadezer',             '2 Samuel 8:3'),
  ('david',    'hamath',             'age-united-monarchy', 'received tribute',               '2 Samuel 8:9-10'),
  ('joab',     'abel-beth-maacah',   'age-united-monarchy', 'besieged the city',             '2 Samuel 20:14-22'),
  ('solomon',  'beth-horon',         'age-united-monarchy', 'fortified',                     '1 Kings 9:17'),
  ('solomon',  'lebo-hamath',        'age-united-monarchy', 'northern boundary',             '1 Kings 8:65'),
  ('solomon',  'sharon',             'age-united-monarchy', 'territory of the kingdom',      '1 Kings 4:10'),

  -- ── DIVIDED MONARCHY ───────────────────────────────────────────────────
  ('jonah',        'tarshish',       'age-divided-monarchy', 'fled toward',                   'Jonah 1:3'),
  ('elisha',       'kir-hareseth',   'age-divided-monarchy', 'siege prophesied',              '2 Kings 3:25'),
  ('hosea',        'beth-arbel',     'age-divided-monarchy', 'warned using its destruction',  'Hosea 10:14'),
  ('jehoram-judah','libnah',         'age-divided-monarchy', 'revolted during his reign',     '2 Kings 8:22'),

  -- ── JUDAH ALONE & EXILE ────────────────────────────────────────────────
  ('isaiah',   'memphis',            'age-judah-exile', 'prophesied against',                'Isaiah 19:13'),
  ('jeremiah', 'memphis',            'age-judah-exile', 'prophesied against',                'Jeremiah 46:19'),
  ('nahum',    'thebes',             'age-judah-exile', 'prophesied its fall',               'Nahum 3:8'),
  ('ezekiel',  'noph',               'age-judah-exile', 'prophesied destruction',            'Ezekiel 30:13'),
  ('obadiah-prophet', 'teman',       'age-judah-exile', 'prophesied against Edom',           'Obadiah 1:9'),
  ('obadiah-prophet', 'bozrah',      'age-judah-exile', 'prophesied against Edom',           'Isaiah 63:1; Obadiah 1'),

  -- ── GOSPELS ────────────────────────────────────────────────────────────
  ('jesus',    'sea-of-galilee',     'age-gospels',    'ministry here',                      'Matthew 4:18; Luke 5:1-3'),
  ('jesus',    'nain',               'age-gospels',    'raised a widow''s son',              'Luke 7:11-15')

on conflict (person_id, place_id, narrative_age_id) do nothing;

-- ══════════════════════════════════════════════════════════════════════════
-- SECTION 5: EVENT-PEOPLE LINKS FOR NEW PEOPLE
-- ══════════════════════════════════════════════════════════════════════════

insert into public."BP_EventPeople" (event_id, person_id) values
  ('david-and-goliath', 'goliath'),
  ('baptism-of-jesus',  'john-baptist')
on conflict (event_id, person_id) do nothing;

commit;
