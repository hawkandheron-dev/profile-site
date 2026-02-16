-- Seed data for Biblical Places Map — minimal MVP dataset.
-- Bulk population will happen separately via research-assisted loading.

begin;

-- ── Narrative Ages ──────────────────────────────────────────────────────────

insert into public."BP_NarrativeAges" (age_id, name, sort_order, color, approx_start_year, approx_end_year, description, scripture_range) values
  ('age-creation',         'Creation & Primeval History',       1,  '#8B4513', -4000, -2100, 'From creation through the Tower of Babel — the primeval narrative covering origins, the flood, and the scattering of nations.',                      'Genesis 1-11'),
  ('age-patriarchs',       'Patriarchs',                        2,  '#DAA520', -2100, -1700, 'The stories of Abraham, Isaac, Jacob, and Joseph — God''s covenant promises and the journey from Mesopotamia to Canaan to Egypt.',                    'Genesis 12-50'),
  ('age-exodus',           'Exodus & Wilderness',               3,  '#CD5C5C', -1450, -1400, 'Israel''s deliverance from Egypt, the giving of the Law at Sinai, and the wilderness wanderings.',                                                    'Exodus-Deuteronomy'),
  ('age-conquest',         'Conquest & Judges',                  4,  '#2E8B57', -1400, -1050, 'The conquest of Canaan under Joshua and the turbulent period of the judges.',                                                                          'Joshua-Ruth'),
  ('age-united-monarchy',  'United Monarchy',                    5,  '#4169E1', -1050, -930,  'The reigns of Saul, David, and Solomon — Israel united under one king, the building of the Temple.',                                                  '1 Samuel - 1 Kings 11'),
  ('age-divided-monarchy', 'Divided Monarchy',                   6,  '#9932CC', -930,  -722,  'The kingdom splits into Israel (north) and Judah (south). The great prophets Elijah and Elisha. Fall of the northern kingdom to Assyria.',            '1 Kings 12 - 2 Kings 17'),
  ('age-judah-exile',      'Judah Alone & Exile',                7,  '#8B0000', -722,  -539,  'Judah continues alone, then falls to Babylon. The exile, the prophets Jeremiah and Ezekiel, Daniel in Babylon.',                                      '2 Kings 18-25, Jeremiah, Ezekiel, Daniel'),
  ('age-return',           'Return & Restoration',               8,  '#20B2AA', -539,  -167,  'The return from exile under Zerubbabel, Ezra, and Nehemiah. The Temple and walls rebuilt. The post-exilic prophets.',                                 'Ezra, Nehemiah, Haggai, Zechariah, Malachi'),
  ('age-second-temple',    'Second Temple / Intertestamental',   9,  '#708090', -167,  -4,    'The Maccabean revolt, Hasmonean dynasty, and Roman conquest. The world between the Testaments.',                                                      ''),
  ('age-gospels',          'Gospels',                            10, '#B8860B', -4,    33,    'The life, ministry, death, and resurrection of Jesus of Nazareth.',                                                                                   'Matthew-John');

-- ── Places ──────────────────────────────────────────────────────────────────

insert into public."BP_Places" (place_id, name, lat, lng, region, description) values
  ('jerusalem',    'Jerusalem',        31.77,  35.23,  'Canaan',        'The holy city — site of the Temple, David''s capital, and the crucifixion and resurrection of Jesus.'),
  ('bethlehem',    'Bethlehem',         31.71,  35.21,  'Canaan',        'Birthplace of David and Jesus. Rachel''s burial place.'),
  ('hebron',       'Hebron',            31.53,  35.10,  'Canaan',        'Where Abraham settled and purchased the Cave of Machpelah. David''s first capital.'),
  ('shechem',      'Shechem',           32.21,  35.28,  'Canaan',        'Where God first promised Canaan to Abraham. Joshua''s covenant renewal. Later the first capital of the northern kingdom.'),
  ('bethel',       'Bethel',            31.93,  35.23,  'Canaan',        'Where Jacob dreamed of a ladder to heaven. Later a worship site in the northern kingdom.'),
  ('jericho',      'Jericho',           31.87,  35.44,  'Canaan',        'The first city conquered in the promised land. One of the oldest cities in the world.'),
  ('shiloh',       'Shiloh',            32.05,  35.29,  'Canaan',        'Where the Tabernacle rested for centuries. Samuel grew up here.'),
  ('sinai',        'Mount Sinai',       28.54,  33.97,  'Sinai',         'Where God gave the Law to Moses. Elijah later fled here.'),
  ('egypt-goshen', 'Goshen (Egypt)',    30.78,  31.83,  'Egypt',         'The region in Egypt where the Israelites lived during the sojourn.'),
  ('ur',           'Ur',                30.96,  46.10,  'Mesopotamia',   'Abraham''s birthplace in southern Mesopotamia.'),
  ('haran',        'Haran',             36.86,  39.03,  'Mesopotamia',   'Where Abraham''s family settled. Jacob fled here and married Leah and Rachel.'),
  ('babylon',      'Babylon',           32.54,  44.42,  'Mesopotamia',   'Capital of the Neo-Babylonian Empire. Site of the exile. Tower of Babel tradition.'),
  ('nazareth',     'Nazareth',          32.70,  35.30,  'Galilee',       'Hometown of Jesus. Where the angel Gabriel announced the birth of the Messiah to Mary.'),
  ('capernaum',    'Capernaum',         32.88,  35.57,  'Galilee',       'Jesus'' base of ministry on the Sea of Galilee. Home of Peter.'),
  ('jordan-river', 'Jordan River',      31.76,  35.55,  'Canaan',        'Israel crossed into the promised land here. Jesus was baptized in the Jordan.'),
  ('mt-carmel',    'Mount Carmel',      32.74,  35.05,  'Canaan',        'Where Elijah confronted the prophets of Baal.'),
  ('samaria',      'Samaria',           32.28,  35.19,  'Canaan',        'Capital of the northern kingdom of Israel. Later the region between Judea and Galilee.'),
  ('nineveh',      'Nineveh',           36.36,  43.15,  'Mesopotamia',   'Capital of the Assyrian Empire. Jonah was sent to preach here.'),
  ('damascus',     'Damascus',          33.51,  36.29,  'Aram',          'One of the oldest continuously inhabited cities. Naaman came from here. Elisha prophesied here.'),
  ('mt-moriah',    'Mount Moriah',      31.78,  35.24,  'Canaan',        'Where Abraham was told to sacrifice Isaac. Traditionally identified with the Temple Mount.');

-- ── People ──────────────────────────────────────────────────────────────────

insert into public."BP_People" (person_id, name, description, scripture_refs) values
  ('adam',      'Adam',      'The first human, created by God and placed in the Garden of Eden.',                                'Genesis 1-5'),
  ('noah',      'Noah',      'Righteous man who built the ark and survived the great flood with his family.',                    'Genesis 6-9'),
  ('abraham',   'Abraham',   'Father of the faith. God called him from Ur and made a covenant to give his descendants the land of Canaan.', 'Genesis 12-25'),
  ('sarah',     'Sarah',     'Wife of Abraham and mother of Isaac. She laughed when told she would bear a son in old age.',      'Genesis 12-23'),
  ('isaac',     'Isaac',     'Son of promise born to Abraham and Sarah. Father of Jacob and Esau.',                              'Genesis 21-28, 35'),
  ('jacob',     'Jacob',     'Son of Isaac, renamed Israel. Father of the twelve tribes.',                                       'Genesis 25-50'),
  ('joseph',    'Joseph',    'Jacob''s favored son, sold into slavery in Egypt, rose to become Pharaoh''s vizier.',              'Genesis 37-50'),
  ('moses',     'Moses',     'Prophet who led Israel out of Egypt, received the Law at Sinai, and guided them through the wilderness.', 'Exodus-Deuteronomy'),
  ('joshua',    'Joshua',    'Moses'' successor who led the conquest of Canaan.',                                                'Joshua'),
  ('deborah',   'Deborah',   'Prophetess and judge who led Israel to victory over the Canaanites.',                              'Judges 4-5'),
  ('samuel',    'Samuel',    'Last of the judges and first of the prophets after Moses. Anointed both Saul and David.',          '1 Samuel 1-25'),
  ('david',     'David',     'Shepherd, warrior, poet, and king. United the tribes and made Jerusalem his capital.',              '1-2 Samuel, 1 Kings 1-2, Psalms'),
  ('solomon',   'Solomon',   'Son of David. Built the Temple in Jerusalem. Known for his wisdom and wealth.',                    '1 Kings 1-11, Proverbs, Ecclesiastes'),
  ('elijah',    'Elijah',    'Prophet who confronted Baal worship and called Israel back to the Lord.',                           '1 Kings 17 - 2 Kings 2'),
  ('elisha',    'Elisha',    'Elijah''s successor. Performed many miracles throughout Israel and beyond.',                       '2 Kings 2-13'),
  ('isaiah',    'Isaiah',    'Prophet in Jerusalem during the reigns of Uzziah through Hezekiah. Prophesied the coming Messiah.', 'Isaiah'),
  ('jeremiah',  'Jeremiah',  'The weeping prophet. Warned Judah of coming judgment and witnessed the fall of Jerusalem.',        'Jeremiah, Lamentations'),
  ('daniel',    'Daniel',    'Taken captive to Babylon as a youth. Rose to high office. Received apocalyptic visions.',          'Daniel'),
  ('ezekiel',   'Ezekiel',   'Priest and prophet among the exiles in Babylon. Saw visions of God''s glory and the valley of dry bones.', 'Ezekiel'),
  ('nehemiah',  'Nehemiah',  'Cupbearer to the Persian king who led the rebuilding of Jerusalem''s walls.',                     'Nehemiah'),
  ('ezra',      'Ezra',      'Priest and scribe who led a return from exile and restored the Torah to the center of Jewish life.', 'Ezra'),
  ('jesus',     'Jesus',     'Jesus of Nazareth — the Messiah, Son of God. Born in Bethlehem, raised in Nazareth, crucified and risen in Jerusalem.', 'Matthew-John'),
  ('mary',      'Mary',      'Mother of Jesus. Received the annunciation from Gabriel in Nazareth.',                             'Matthew 1-2, Luke 1-2, John 2, 19'),
  ('gabriel',   'Gabriel',   'Angelic messenger of God. Appeared to Daniel, to Zechariah, and to Mary.',                         'Daniel 8-9, Luke 1'),
  ('angel-of-lord', 'The Angel of the Lord', 'A divine messenger who appears at key moments throughout the biblical narrative.', 'Genesis 16, 22; Exodus 3; Judges 6, 13; 2 Samuel 24; and others');

-- ── PersonAges (many-to-many) ───────────────────────────────────────────────

insert into public."BP_PersonAges" (person_id, age_id, is_primary) values
  ('adam',           'age-creation',         true),
  ('noah',           'age-creation',         true),
  ('abraham',        'age-patriarchs',       true),
  ('sarah',          'age-patriarchs',       true),
  ('isaac',          'age-patriarchs',       true),
  ('jacob',          'age-patriarchs',       true),
  ('joseph',         'age-patriarchs',       true),
  ('moses',          'age-exodus',           true),
  ('joshua',         'age-exodus',           false),
  ('joshua',         'age-conquest',         true),
  ('deborah',        'age-conquest',         true),
  ('samuel',         'age-conquest',         false),
  ('samuel',         'age-united-monarchy',  true),
  ('david',          'age-united-monarchy',  true),
  ('solomon',        'age-united-monarchy',  true),
  ('elijah',         'age-divided-monarchy', true),
  ('elisha',         'age-divided-monarchy', true),
  ('isaiah',         'age-divided-monarchy', false),
  ('isaiah',         'age-judah-exile',      true),
  ('jeremiah',       'age-judah-exile',      true),
  ('daniel',         'age-judah-exile',      true),
  ('ezekiel',        'age-judah-exile',      true),
  ('nehemiah',       'age-return',           true),
  ('ezra',           'age-return',           true),
  ('jesus',          'age-gospels',          true),
  ('mary',           'age-gospels',          true),
  -- Multi-age figures
  ('gabriel',        'age-judah-exile',      false),
  ('gabriel',        'age-gospels',          true),
  ('angel-of-lord',  'age-patriarchs',       true),
  ('angel-of-lord',  'age-exodus',           false),
  ('angel-of-lord',  'age-conquest',         false),
  ('angel-of-lord',  'age-united-monarchy',  false);

-- ── Events ──────────────────────────────────────────────────────────────────

insert into public."BP_Events" (event_id, name, narrative_age_id, place_id, description, event_type, scripture_ref, sort_within_age) values
  -- Creation & Primeval
  ('tower-of-babel',       'Tower of Babel',                     'age-creation',         'babylon',      'Humanity builds a tower; God confuses their languages and scatters them.',                      'judgment',  'Genesis 11:1-9',        3),

  -- Patriarchs
  ('call-of-abraham',      'Call of Abraham',                    'age-patriarchs',       'haran',        'God calls Abram to leave his homeland and go to a land He will show him.',                      'covenant',  'Genesis 12:1-9',        1),
  ('abraham-at-shechem',   'Abraham at Shechem',                 'age-patriarchs',       'shechem',      'God appears to Abraham and promises to give the land to his offspring. Abraham builds an altar.', 'covenant', 'Genesis 12:6-7',        2),
  ('binding-of-isaac',     'Binding of Isaac',                   'age-patriarchs',       'mt-moriah',    'God tests Abraham by asking him to sacrifice Isaac, then provides a ram.',                      'covenant',  'Genesis 22:1-19',       3),
  ('jacobs-ladder',        'Jacob''s Ladder',                    'age-patriarchs',       'bethel',       'Jacob dreams of a stairway to heaven with angels ascending and descending.',                    'miracle',   'Genesis 28:10-22',      4),
  ('joseph-in-egypt',      'Joseph Rises in Egypt',              'age-patriarchs',       'egypt-goshen', 'Joseph, sold into slavery, interprets Pharaoh''s dreams and becomes vizier.',                   'event',     'Genesis 39-41',         5),

  -- Exodus & Wilderness
  ('exodus',               'The Exodus',                         'age-exodus',           'egypt-goshen', 'God delivers Israel from slavery in Egypt through Moses.',                                      'miracle',   'Exodus 12-15',          1),
  ('giving-of-law',        'Giving of the Law',                  'age-exodus',           'sinai',        'God gives the Ten Commandments and the Torah to Moses on Mount Sinai.',                         'covenant',  'Exodus 19-24',          2),

  -- Conquest & Judges
  ('crossing-jordan',      'Crossing the Jordan',                'age-conquest',         'jordan-river', 'Israel crosses the Jordan on dry ground into the promised land.',                               'miracle',   'Joshua 3-4',            1),
  ('fall-of-jericho',      'Fall of Jericho',                    'age-conquest',         'jericho',      'Israel marches around Jericho for seven days and the walls collapse.',                          'battle',    'Joshua 6',              2),
  ('tabernacle-at-shiloh', 'Tabernacle at Shiloh',               'age-conquest',         'shiloh',       'The Tabernacle is set up at Shiloh, becoming Israel''s central worship site for centuries.',    'event',     'Joshua 18:1',           3),
  ('deborahs-victory',     'Deborah''s Victory',                 'age-conquest',         'mt-carmel',    'Deborah and Barak defeat the Canaanite army of Sisera.',                                       'battle',    'Judges 4-5',            4),

  -- United Monarchy
  ('david-anointed-hebron', 'David Anointed King at Hebron',     'age-united-monarchy',  'hebron',       'David is anointed king over Judah, then over all Israel, at Hebron.',                           'event',     '2 Samuel 2:1-4, 5:1-5', 1),
  ('david-takes-jerusalem', 'David Captures Jerusalem',          'age-united-monarchy',  'jerusalem',    'David conquers the Jebusite city and makes it his capital — the City of David.',                'battle',    '2 Samuel 5:6-10',       2),
  ('solomons-temple',      'Solomon''s Temple Built',            'age-united-monarchy',  'jerusalem',    'Solomon builds the first Temple in Jerusalem. The glory of the Lord fills the house.',           'event',     '1 Kings 5-8',           3),

  -- Divided Monarchy
  ('kingdom-divides',      'The Kingdom Divides',                'age-divided-monarchy', 'shechem',      'After Solomon''s death, the northern tribes reject Rehoboam. Jeroboam becomes king of Israel at Shechem.', 'event', '1 Kings 12',    1),
  ('elijah-on-carmel',     'Elijah on Mount Carmel',             'age-divided-monarchy', 'mt-carmel',    'Elijah challenges 450 prophets of Baal. Fire falls from heaven. The people cry: "The Lord, He is God!"', 'miracle', '1 Kings 18:20-40', 2),
  ('fall-of-samaria',      'Fall of Samaria',                    'age-divided-monarchy', 'samaria',      'Assyria conquers Samaria and deports the northern tribes. The kingdom of Israel ends.',         'judgment',  '2 Kings 17',            3),

  -- Judah Alone & Exile
  ('fall-of-jerusalem',    'Fall of Jerusalem',                  'age-judah-exile',      'jerusalem',    'Nebuchadnezzar destroys Jerusalem and the Temple. The people are taken into exile in Babylon.',  'judgment',  '2 Kings 25',            1),
  ('daniel-in-babylon',    'Daniel in Babylon',                  'age-judah-exile',      'babylon',      'Daniel serves in the Babylonian and Persian courts, interprets dreams, and receives visions.',   'event',     'Daniel 1-12',           2),
  ('jonah-at-nineveh',     'Jonah at Nineveh',                   'age-judah-exile',      'nineveh',      'The prophet Jonah reluctantly preaches to Nineveh, and the city repents.',                      'prophecy',  'Jonah',                 3),

  -- Return & Restoration
  ('temple-rebuilt',        'Temple Rebuilt',                    'age-return',           'jerusalem',    'The returned exiles under Zerubbabel rebuild the Temple, completed in 516 BC.',                 'event',     'Ezra 3-6',              1),
  ('nehemiah-walls',        'Nehemiah Rebuilds the Walls',      'age-return',           'jerusalem',    'Nehemiah leads the rebuilding of Jerusalem''s walls in 52 days.',                               'event',     'Nehemiah 1-6',          2),

  -- Gospels
  ('annunciation',          'The Annunciation',                 'age-gospels',          'nazareth',     'The angel Gabriel appears to Mary and announces she will bear the Messiah.',                    'miracle',   'Luke 1:26-38',          1),
  ('birth-of-jesus',        'Birth of Jesus',                   'age-gospels',          'bethlehem',    'Jesus is born in Bethlehem and laid in a manger.',                                              'event',     'Luke 2:1-20',           2),
  ('baptism-of-jesus',      'Baptism of Jesus',                 'age-gospels',          'jordan-river', 'Jesus is baptized by John in the Jordan. The Spirit descends and the Father speaks.',            'event',     'Matthew 3:13-17',       3),
  ('sermon-on-mount',       'Sermon on the Mount',              'age-gospels',          'capernaum',    'Jesus delivers the Sermon on the Mount near Capernaum — the Beatitudes and the heart of his teaching.', 'event', 'Matthew 5-7',    4),
  ('crucifixion',           'Crucifixion',                      'age-gospels',          'jerusalem',    'Jesus is crucified outside Jerusalem at Golgotha.',                                             'event',     'Matthew 27, Mark 15, Luke 23, John 19', 5),
  ('resurrection',          'Resurrection',                     'age-gospels',          'jerusalem',    'Jesus rises from the dead on the third day. The empty tomb is discovered.',                     'miracle',   'Matthew 28, Mark 16, Luke 24, John 20', 6);

-- ── EventPeople ─────────────────────────────────────────────────────────────

insert into public."BP_EventPeople" (event_id, person_id) values
  ('call-of-abraham',       'abraham'),
  ('abraham-at-shechem',    'abraham'),
  ('binding-of-isaac',      'abraham'),
  ('binding-of-isaac',      'isaac'),
  ('binding-of-isaac',      'angel-of-lord'),
  ('jacobs-ladder',         'jacob'),
  ('joseph-in-egypt',       'joseph'),
  ('exodus',                'moses'),
  ('giving-of-law',         'moses'),
  ('crossing-jordan',       'joshua'),
  ('fall-of-jericho',       'joshua'),
  ('deborahs-victory',      'deborah'),
  ('david-anointed-hebron',  'david'),
  ('david-anointed-hebron',  'samuel'),
  ('david-takes-jerusalem',  'david'),
  ('solomons-temple',       'solomon'),
  ('elijah-on-carmel',      'elijah'),
  ('fall-of-jerusalem',     'jeremiah'),
  ('daniel-in-babylon',     'daniel'),
  ('nehemiah-walls',        'nehemiah'),
  ('temple-rebuilt',         'ezra'),
  ('annunciation',          'mary'),
  ('annunciation',          'gabriel'),
  ('birth-of-jesus',        'jesus'),
  ('birth-of-jesus',        'mary'),
  ('baptism-of-jesus',      'jesus'),
  ('sermon-on-mount',       'jesus'),
  ('crucifixion',           'jesus'),
  ('resurrection',          'jesus');

-- ── PersonPlaces ────────────────────────────────────────────────────────────

insert into public."BP_PersonPlaces" (person_id, place_id, narrative_age_id, context) values
  ('abraham', 'ur',           'age-patriarchs', 'born here'),
  ('abraham', 'haran',        'age-patriarchs', 'sojourned'),
  ('abraham', 'shechem',      'age-patriarchs', 'passed through'),
  ('abraham', 'hebron',       'age-patriarchs', 'settled'),
  ('abraham', 'mt-moriah',    'age-patriarchs', 'offered Isaac'),
  ('sarah',   'hebron',       'age-patriarchs', 'died and buried'),
  ('isaac',   'mt-moriah',    'age-patriarchs', 'bound as sacrifice'),
  ('jacob',   'bethel',       'age-patriarchs', 'dreamed here'),
  ('jacob',   'haran',        'age-patriarchs', 'married Leah and Rachel'),
  ('jacob',   'shechem',      'age-patriarchs', 'settled'),
  ('joseph',  'egypt-goshen', 'age-patriarchs', 'ruled as vizier'),
  ('moses',   'egypt-goshen', 'age-exodus',     'born here'),
  ('moses',   'sinai',        'age-exodus',     'received the Law'),
  ('joshua',  'jordan-river', 'age-conquest',   'led crossing'),
  ('joshua',  'jericho',      'age-conquest',   'conquered'),
  ('deborah', 'mt-carmel',    'age-conquest',   'led battle'),
  ('samuel',  'shiloh',       'age-conquest',   'grew up here'),
  ('david',   'bethlehem',    'age-united-monarchy', 'born here'),
  ('david',   'hebron',       'age-united-monarchy', 'first capital'),
  ('david',   'jerusalem',    'age-united-monarchy', 'made capital'),
  ('solomon', 'jerusalem',    'age-united-monarchy', 'built the Temple'),
  ('elijah',  'mt-carmel',    'age-divided-monarchy', 'confronted Baal prophets'),
  ('elijah',  'sinai',        'age-divided-monarchy', 'fled here'),
  ('elisha',  'samaria',      'age-divided-monarchy', 'prophesied'),
  ('elisha',  'damascus',     'age-divided-monarchy', 'prophesied'),
  ('isaiah',  'jerusalem',    'age-judah-exile',      'prophesied'),
  ('jeremiah','jerusalem',    'age-judah-exile',      'prophesied'),
  ('daniel',  'babylon',      'age-judah-exile',      'exiled here'),
  ('ezekiel', 'babylon',      'age-judah-exile',      'exiled and prophesied'),
  ('ezra',    'jerusalem',    'age-return',            'led reform'),
  ('nehemiah','jerusalem',    'age-return',            'rebuilt walls'),
  ('jesus',   'bethlehem',    'age-gospels',           'born here'),
  ('jesus',   'nazareth',     'age-gospels',           'raised here'),
  ('jesus',   'capernaum',    'age-gospels',           'ministry base'),
  ('jesus',   'jordan-river', 'age-gospels',           'baptized here'),
  ('jesus',   'jerusalem',    'age-gospels',           'crucified and risen'),
  ('mary',    'nazareth',     'age-gospels',           'received annunciation'),
  ('mary',    'bethlehem',    'age-gospels',           'gave birth to Jesus'),
  ('gabriel', 'nazareth',     'age-gospels',           'announced to Mary');

commit;
