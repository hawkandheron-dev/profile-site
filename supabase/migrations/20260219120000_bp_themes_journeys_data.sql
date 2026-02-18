-- Seed data for thematic threads and journey routes.
-- Themes trace theological motifs across the entire biblical narrative.
-- Journeys trace geographic routes for animated map visualization.

begin;

-- ══════════════════════════════════════════════════════════════════════════
-- THEMES
-- ══════════════════════════════════════════════════════════════════════════

insert into public."BP_Themes" (theme_id, name, description, color, sort_order) values
  ('theme-covenant',        'Covenant',
   'God''s binding promises traced from creation through the new covenant. Each covenant builds on the last, narrowing from all humanity to one nation to one king to one Messiah — then widening again to all peoples.',
   '#DAA520', 1),

  ('theme-exile-return',    'Exile & Return',
   'The recurring biblical pattern of displacement and homecoming. From Eden to Egypt to Canaan, from Canaan to Babylon and back, the story of God''s people is a story of loss and restoration.',
   '#CD5C5C', 2),

  ('theme-temple',          'Temple & Sacred Space',
   'Where does God dwell? The Bible traces sacred space from the Garden of Eden through the Tabernacle, to Solomon''s Temple, to its destruction, rebuilding, and ultimately to Jesus himself as the true Temple.',
   '#4169E1', 3),

  ('theme-kingdom',         'Kingdom of God',
   'How God rules his people. From direct theocracy through judges and kings, through exile under foreign powers, to the arrival of the true King whose kingdom is "not of this world."',
   '#2E8B57', 4),

  ('theme-faithful-remnant','Faithful Remnant',
   'In every age, God preserves a faithful few. From Noah to Abraham, from Caleb and Joshua to the prophets, from the exiles who returned to the disciples — the remnant carries the promise forward.',
   '#9932CC', 5)

on conflict (theme_id) do nothing;

-- ══════════════════════════════════════════════════════════════════════════
-- THEME STOPS — COVENANT
-- ══════════════════════════════════════════════════════════════════════════

insert into public."BP_ThemeStops" (theme_id, stop_order, place_id, person_id, event_id, narrative_age_id, title, description, scripture_ref) values
  ('theme-covenant', 1, 'garden-of-eden', 'adam', 'creation', 'age-creation',
   'Creation Mandate',
   'God places Adam in the garden and gives humanity dominion over creation. The first relationship between God and humanity — broken by the fall.',
   'Genesis 1:28-30; 2:15-17'),

  ('theme-covenant', 2, 'mt-ararat', 'noah', 'covenant-with-noah', 'age-creation',
   'Covenant with Noah',
   'After the flood, God makes a covenant with all living creatures: never again will the earth be destroyed by water. The rainbow is the sign.',
   'Genesis 9:8-17'),

  ('theme-covenant', 3, 'hebron', 'abraham', 'covenant-of-pieces', 'age-patriarchs',
   'Covenant with Abraham',
   'God cuts a covenant with Abram, promising descendants, land, and blessing. God alone passes between the pieces — this covenant rests on God''s faithfulness, not Abram''s.',
   'Genesis 15:1-21'),

  ('theme-covenant', 4, 'mt-moriah', 'abraham', 'binding-of-isaac', 'age-patriarchs',
   'The Binding of Isaac',
   'Abraham''s faith is tested at Moriah. God provides a ram in place of Isaac. "On the mountain of the Lord it will be provided."',
   'Genesis 22:1-19'),

  ('theme-covenant', 5, 'sinai', 'moses', 'giving-of-law', 'age-exodus',
   'Covenant at Sinai',
   'God gives the Law to Moses. Israel becomes a "kingdom of priests and a holy nation." The Mosaic covenant binds Israel to obedience in exchange for God''s presence and protection.',
   'Exodus 19:3-8; 24:1-8'),

  ('theme-covenant', 6, 'shechem', 'joshua', 'covenant-at-shechem', 'age-conquest',
   'Covenant Renewed at Shechem',
   'Joshua gathers all Israel and challenges them: "Choose this day whom you will serve." The people renew their commitment to the Lord.',
   'Joshua 24:1-27'),

  ('theme-covenant', 7, 'jerusalem', 'david', NULL, 'age-united-monarchy',
   'Covenant with David',
   'God promises David an eternal dynasty: "Your house and your kingdom will endure before me forever; your throne will be established forever."',
   '2 Samuel 7:1-17'),

  ('theme-covenant', 8, 'jerusalem', 'jeremiah', NULL, 'age-judah-exile',
   'The New Covenant Promised',
   'Jeremiah prophesies a new covenant — not like the one broken at Sinai. God will write his law on their hearts. "They will all know me, from the least to the greatest."',
   'Jeremiah 31:31-34'),

  ('theme-covenant', 9, 'jerusalem', 'jesus', 'crucifixion', 'age-gospels',
   'The New Covenant Fulfilled',
   'At the Last Supper, Jesus takes the cup: "This is my blood of the new covenant, poured out for many for the forgiveness of sins." The cross fulfills every covenant promise.',
   'Matthew 26:26-29; Luke 22:20')

on conflict (theme_id, stop_order) do nothing;

-- ══════════════════════════════════════════════════════════════════════════
-- THEME STOPS — EXILE & RETURN
-- ══════════════════════════════════════════════════════════════════════════

insert into public."BP_ThemeStops" (theme_id, stop_order, place_id, person_id, event_id, narrative_age_id, title, description, scripture_ref) values
  ('theme-exile-return', 1, 'garden-of-eden', 'adam', 'the-fall', 'age-creation',
   'Exiled from Eden',
   'Adam and Eve are driven from the garden — the first exile. Cherubim guard the way back to the tree of life.',
   'Genesis 3:22-24'),

  ('theme-exile-return', 2, 'haran', 'abraham', 'call-of-abraham', 'age-patriarchs',
   'Called Out of Homeland',
   'God calls Abraham to leave everything familiar and go to an unknown land. Faith means becoming a stranger and pilgrim.',
   'Genesis 12:1-4'),

  ('theme-exile-return', 3, 'egypt-goshen', 'joseph', 'joseph-in-egypt', 'age-patriarchs',
   'Descent into Egypt',
   'Famine drives Jacob''s family into Egypt. What begins as refuge becomes, over generations, slavery.',
   'Genesis 46:1-7; Exodus 1:8-14'),

  ('theme-exile-return', 4, 'red-sea', 'moses', 'crossing-red-sea', 'age-exodus',
   'Deliverance from Egypt',
   'God parts the sea and brings Israel out of bondage. The foundational act of redemption in the Old Testament.',
   'Exodus 14:21-31'),

  ('theme-exile-return', 5, 'jordan-river', 'joshua', 'crossing-jordan', 'age-conquest',
   'Return to the Promised Land',
   'Israel crosses the Jordan on dry ground, echoing the Red Sea. The wilderness wandering ends; the promise is fulfilled.',
   'Joshua 3:14-17'),

  ('theme-exile-return', 6, 'babylon', 'daniel', 'fall-of-jerusalem', 'age-judah-exile',
   'Exile to Babylon',
   'Jerusalem falls. The Temple is destroyed. God''s people are carried to Babylon. The prophets ask: has God abandoned his promises?',
   '2 Kings 25:8-12; Psalm 137:1-4'),

  ('theme-exile-return', 7, 'jerusalem', 'zerubbabel', 'temple-rebuilt', 'age-return',
   'Return from Exile',
   'Cyrus decrees the return. Zerubbabel leads the first wave home. The Temple is rebuilt — smaller, but standing.',
   'Ezra 1:1-4; 6:14-16'),

  ('theme-exile-return', 8, 'jerusalem', 'jesus', 'resurrection', 'age-gospels',
   'The Final Homecoming',
   'In Jesus'' resurrection, the ultimate exile — death itself — is reversed. The way back to the tree of life is opened.',
   'Revelation 22:1-5')

on conflict (theme_id, stop_order) do nothing;

-- ══════════════════════════════════════════════════════════════════════════
-- THEME STOPS — TEMPLE & SACRED SPACE
-- ══════════════════════════════════════════════════════════════════════════

insert into public."BP_ThemeStops" (theme_id, stop_order, place_id, person_id, event_id, narrative_age_id, title, description, scripture_ref) values
  ('theme-temple', 1, 'garden-of-eden', 'adam', 'creation', 'age-creation',
   'The Garden as Temple',
   'Eden is the first sacred space — where God walks with humanity in the cool of the day. Adam is placed there to "work and keep" it, priestly language.',
   'Genesis 2:15; 3:8'),

  ('theme-temple', 2, 'sinai', 'moses', 'tabernacle-built', 'age-exodus',
   'The Tabernacle',
   'God gives Moses the pattern for the Tabernacle — a portable Eden. Its garden imagery (lampstand as tree, cherubim, east-facing entrance) echoes what was lost.',
   'Exodus 25:8-9; 40:34-38'),

  ('theme-temple', 3, 'shiloh', 'eli', 'tabernacle-at-shiloh', 'age-conquest',
   'The Tabernacle at Shiloh',
   'For centuries, the Tabernacle rests at Shiloh — Israel''s central worship site. But corruption enters, and God allows even Shiloh to fall.',
   'Joshua 18:1; Jeremiah 7:12-14'),

  ('theme-temple', 4, 'jerusalem', 'solomon', 'solomons-temple', 'age-united-monarchy',
   'Solomon''s Temple',
   'Solomon builds the first permanent Temple. The glory of the Lord fills the house so that the priests cannot stand to minister.',
   '1 Kings 8:10-13'),

  ('theme-temple', 5, 'jerusalem', 'nebuchadnezzar', 'fall-of-jerusalem', 'age-judah-exile',
   'The Temple Destroyed',
   'Nebuchadnezzar burns the Temple to the ground. Ezekiel sees the glory of the Lord depart from the Temple mount.',
   '2 Kings 25:9; Ezekiel 10:18-19'),

  ('theme-temple', 6, 'jerusalem', 'zerubbabel', 'temple-rebuilt', 'age-return',
   'The Second Temple',
   'The returned exiles rebuild the Temple. Older people weep — it pales next to Solomon''s. But Haggai promises: "The glory of this latter house will be greater than the former."',
   'Ezra 3:12-13; Haggai 2:9'),

  ('theme-temple', 7, 'jerusalem', 'jesus', 'crucifixion', 'age-gospels',
   'Jesus as Temple',
   '"Destroy this temple, and in three days I will raise it up." Jesus'' body is the true Temple — the place where God and humanity meet. The curtain tears at the crucifixion.',
   'John 2:19-21; Matthew 27:51')

on conflict (theme_id, stop_order) do nothing;

-- ══════════════════════════════════════════════════════════════════════════
-- THEME STOPS — KINGDOM OF GOD
-- ══════════════════════════════════════════════════════════════════════════

insert into public."BP_ThemeStops" (theme_id, stop_order, place_id, person_id, event_id, narrative_age_id, title, description, scripture_ref) values
  ('theme-kingdom', 1, 'sinai', 'moses', 'giving-of-law', 'age-exodus',
   'Theocracy at Sinai',
   'God himself is Israel''s king. The Law establishes a nation governed directly by God, with no human monarch. "You will be to me a kingdom of priests."',
   'Exodus 19:5-6'),

  ('theme-kingdom', 2, 'mizpah', 'samuel', 'saul-anointed', 'age-united-monarchy',
   'Israel Demands a King',
   'The people reject God''s direct rule and demand a king "like all the other nations." Samuel warns them, but God grants their request.',
   '1 Samuel 8:4-9; 10:17-25'),

  ('theme-kingdom', 3, 'hebron', 'david', 'david-anointed-hebron', 'age-united-monarchy',
   'David: The King After God''s Heart',
   'David is anointed king — first over Judah at Hebron, then over all Israel. God promises his dynasty will endure forever.',
   '2 Samuel 2:1-4; 5:1-5; 7:16'),

  ('theme-kingdom', 4, 'jerusalem', 'solomon', 'solomons-temple', 'age-united-monarchy',
   'Solomon''s Golden Age',
   'The kingdom reaches its peak under Solomon — peace, wealth, wisdom, and the Temple. But the seeds of division are already planted.',
   '1 Kings 4:20-25; 10:23-24; 11:1-13'),

  ('theme-kingdom', 5, 'shechem', 'rehoboam', 'kingdom-divides', 'age-divided-monarchy',
   'The Kingdom Divides',
   'Rehoboam''s harshness splits the nation. Ten tribes follow Jeroboam. The united kingdom lasts only three generations.',
   '1 Kings 12:1-24'),

  ('theme-kingdom', 6, 'samaria', NULL, 'fall-of-samaria', 'age-divided-monarchy',
   'Fall of the Northern Kingdom',
   'Assyria conquers Samaria. The ten northern tribes are scattered. The kingdom that rejected God''s chosen dynasty ceases to exist.',
   '2 Kings 17:1-23'),

  ('theme-kingdom', 7, 'babylon', 'nebuchadnezzar', 'fall-of-jerusalem', 'age-judah-exile',
   'Fall of the Southern Kingdom',
   'Babylon destroys Jerusalem. The Davidic dynasty is cut off. Yet even in exile, God preserves the royal line — and the promise.',
   '2 Kings 25:1-12'),

  ('theme-kingdom', 8, 'bethlehem', 'jesus', 'birth-of-jesus', 'age-gospels',
   'The True King Is Born',
   'In the city of David, the heir to David''s throne is born — not in a palace, but in a manger. "Where is the one who has been born king of the Jews?"',
   'Matthew 2:1-6; Luke 2:1-7'),

  ('theme-kingdom', 9, 'jerusalem', 'jesus', 'crucifixion', 'age-gospels',
   'The Kingdom Inaugurated',
   'Jesus is crucified under the sign "King of the Jews." Through death and resurrection, he inaugurates a kingdom that is "not of this world" — yet transforms this world.',
   'John 18:36-37; 19:19-22')

on conflict (theme_id, stop_order) do nothing;

-- ══════════════════════════════════════════════════════════════════════════
-- THEME STOPS — FAITHFUL REMNANT
-- ══════════════════════════════════════════════════════════════════════════

insert into public."BP_ThemeStops" (theme_id, stop_order, place_id, person_id, event_id, narrative_age_id, title, description, scripture_ref) values
  ('theme-faithful-remnant', 1, 'mt-ararat', 'noah', 'the-flood', 'age-creation',
   'Noah: Faithful in a Corrupt World',
   'In a generation of total wickedness, one man walks with God. Noah''s faithfulness preserves humanity and the promise.',
   'Genesis 6:9; 7:1'),

  ('theme-faithful-remnant', 2, 'ur', 'abraham', 'abram-leaves-ur', 'age-patriarchs',
   'Abraham: Faithful Departure',
   'Abraham leaves everything on the strength of God''s word alone. His faith is "credited to him as righteousness."',
   'Genesis 12:1-4; 15:6'),

  ('theme-faithful-remnant', 3, 'kadesh-barnea', 'caleb', 'twelve-spies', 'age-exodus',
   'Caleb & Joshua: Faithful Spies',
   'Ten spies see giants and cower. Two see the same giants and trust God. Only Caleb and Joshua enter the promised land.',
   'Numbers 13:30; 14:6-9, 24'),

  ('theme-faithful-remnant', 4, 'mt-carmel', 'elijah', 'elijah-on-carmel', 'age-divided-monarchy',
   'Elijah: Faithful Prophet',
   'In an age of near-total apostasy, Elijah stands alone against 450 prophets of Baal. God answers with fire. Yet Elijah thinks he is the only one left — God tells him there are 7,000.',
   '1 Kings 18:22, 36-39; 19:18'),

  ('theme-faithful-remnant', 5, 'jerusalem', 'jeremiah', 'jeremiahs-cistern', 'age-judah-exile',
   'Jeremiah: Faithful at Great Cost',
   'Jeremiah preaches God''s word for forty years to a people who will not listen. Beaten, imprisoned, thrown into a cistern — he never stops.',
   'Jeremiah 38:1-13; 20:9'),

  ('theme-faithful-remnant', 6, 'babylon', 'daniel', 'daniel-in-lions-den', 'age-judah-exile',
   'Daniel: Faithful in Exile',
   'Daniel serves pagan kings for decades without compromising. His faithfulness to prayer lands him in the lions'' den — and God shuts their mouths.',
   'Daniel 6:10, 22'),

  ('theme-faithful-remnant', 7, 'jerusalem', 'nehemiah', 'nehemiah-walls', 'age-return',
   'Nehemiah: Faithful Rebuilder',
   'Against mockery, threats, and internal corruption, Nehemiah rebuilds Jerusalem''s walls in 52 days. A cupbearer becomes a leader.',
   'Nehemiah 6:15-16'),

  ('theme-faithful-remnant', 8, 'nazareth', 'mary', 'annunciation', 'age-gospels',
   'Mary: Faithful Servant',
   'A young woman in an obscure village receives the most extraordinary calling in history. Her response: "I am the Lord''s servant. Let it be done to me according to your word."',
   'Luke 1:38')

on conflict (theme_id, stop_order) do nothing;

-- ══════════════════════════════════════════════════════════════════════════
-- JOURNEYS
-- ══════════════════════════════════════════════════════════════════════════

insert into public."BP_Journeys" (journey_id, name, person_id, narrative_age_id, description, color, sort_order) values
  ('journey-abraham', 'Abraham''s Journey', 'abraham', 'age-patriarchs',
   'From Ur of the Chaldeans through Haran to the promised land — and a sojourn in Egypt. The journey that launched the covenant people.',
   '#DAA520', 1),

  ('journey-exodus', 'The Exodus Route', 'moses', 'age-exodus',
   'From slavery in Egypt through the Red Sea, to Sinai, through the wilderness stations, and finally to the edge of the promised land.',
   '#CD5C5C', 2),

  ('journey-david-outlaw', 'David''s Outlaw Years', 'david', 'age-united-monarchy',
   'After killing Goliath and winning Israel''s heart, David spends years on the run from Saul — hiding in caves, living among enemies, and learning to trust God.',
   '#4169E1', 3),

  ('journey-elijah', 'Elijah''s Travels', 'elijah', 'age-divided-monarchy',
   'From the brook Cherith to Zarephath, from Mount Carmel to Beersheba to Sinai, and finally to the Jordan — the prophet who never dies.',
   '#9932CC', 4),

  ('journey-jesus-ministry', 'Jesus'' Ministry', 'jesus', 'age-gospels',
   'From Nazareth to the Jordan, through Galilee, and the final journey to Jerusalem. The geography of salvation.',
   '#B8860B', 5)

on conflict (journey_id) do nothing;

-- ══════════════════════════════════════════════════════════════════════════
-- JOURNEY STOPS
-- ══════════════════════════════════════════════════════════════════════════

-- Abraham's Journey
insert into public."BP_JourneyStops" (journey_id, stop_order, place_id, label, description, scripture_ref) values
  ('journey-abraham', 1, 'ur',           'Ur of the Chaldeans',   'Birthplace. God calls Abram to leave.',                 'Genesis 11:31'),
  ('journey-abraham', 2, 'haran',        'Haran',                 'The family settles here. Terah dies. Abram departs at 75.', 'Genesis 11:31-12:4'),
  ('journey-abraham', 3, 'shechem',      'Shechem (Oak of Moreh)','First stop in Canaan. God appears and promises the land.', 'Genesis 12:6-7'),
  ('journey-abraham', 4, 'bethel',       'Bethel',                'Abram builds an altar and calls on the name of the Lord.', 'Genesis 12:8'),
  ('journey-abraham', 5, 'negev',        'The Negev',             'Abram journeys southward toward the desert.',             'Genesis 12:9'),
  ('journey-abraham', 6, 'egypt-goshen', 'Egypt',                 'Famine drives Abram to Egypt. He passes Sarah off as his sister.', 'Genesis 12:10-20'),
  ('journey-abraham', 7, 'bethel',       'Return to Bethel',      'Abram returns to where he built the altar.',              'Genesis 13:3-4'),
  ('journey-abraham', 8, 'hebron',       'Hebron (Mamre)',        'Abram settles at the oaks of Mamre. Covenant of the pieces.', 'Genesis 13:18; 15:1-21'),
  ('journey-abraham', 9, 'beersheba',    'Beersheba',             'Abraham digs a well and plants a tamarisk tree.',          'Genesis 21:31-34'),
  ('journey-abraham', 10, 'mt-moriah',   'Mount Moriah',          'God tests Abraham: the binding of Isaac.',                 'Genesis 22:1-19')
on conflict (journey_id, stop_order) do nothing;

-- The Exodus Route
insert into public."BP_JourneyStops" (journey_id, stop_order, place_id, label, description, scripture_ref) values
  ('journey-exodus', 1,  'raamses',            'Raamses',              'Departure point. The Israelites leave after the tenth plague.', 'Exodus 12:37'),
  ('journey-exodus', 2,  'red-sea',            'The Red Sea',          'God parts the waters. Egypt''s army is destroyed.',              'Exodus 14:21-28'),
  ('journey-exodus', 3,  'marah',              'Marah',                'Bitter water is made sweet.',                                    'Exodus 15:23-25'),
  ('journey-exodus', 4,  'elim',               'Elim',                 'An oasis: twelve springs and seventy palm trees.',               'Exodus 15:27'),
  ('journey-exodus', 5,  'wilderness-of-sin',  'Wilderness of Sin',    'God sends manna and quail.',                                    'Exodus 16:1-15'),
  ('journey-exodus', 6,  'rephidim',           'Rephidim',             'Water from the rock. Battle with Amalek.',                      'Exodus 17'),
  ('journey-exodus', 7,  'sinai',              'Mount Sinai',          'The Law given. The golden calf. The Tabernacle built.',          'Exodus 19-40'),
  ('journey-exodus', 8,  'hazeroth',           'Hazeroth',             'Miriam struck with leprosy for criticizing Moses.',              'Numbers 12'),
  ('journey-exodus', 9,  'kadesh-barnea',      'Kadesh-Barnea',        'The twelve spies. Israel refuses to enter. 40 years of wandering decreed.', 'Numbers 13-14'),
  ('journey-exodus', 10, 'punon',              'Punon',                'The bronze serpent. "Everyone who looks at it will live."',       'Numbers 21:4-9'),
  ('journey-exodus', 11, 'plains-of-moab',     'Plains of Moab',       'Balaam blesses Israel. Moses'' farewell.',                      'Numbers 22-24; Deuteronomy'),
  ('journey-exodus', 12, 'mt-nebo',            'Mount Nebo',           'Moses sees the promised land and dies.',                         'Deuteronomy 34:1-5'),
  ('journey-exodus', 13, 'jordan-river',       'The Jordan River',     'Joshua leads Israel across on dry ground.',                      'Joshua 3:14-17')
on conflict (journey_id, stop_order) do nothing;

-- David's Outlaw Years
insert into public."BP_JourneyStops" (journey_id, stop_order, place_id, label, description, scripture_ref) values
  ('journey-david-outlaw', 1, 'bethlehem',   'Bethlehem',     'Anointed by Samuel as a shepherd boy.',                    '1 Samuel 16:1-13'),
  ('journey-david-outlaw', 2, 'valley-of-elah','Valley of Elah','Defeats Goliath.',                                       '1 Samuel 17'),
  ('journey-david-outlaw', 3, 'gibeah',      'Gibeah',        'Serves in Saul''s court. Saul grows jealous.',             '1 Samuel 18-19'),
  ('journey-david-outlaw', 4, 'nob',         'Nob',           'Receives showbread and Goliath''s sword from the priests.','1 Samuel 21:1-9'),
  ('journey-david-outlaw', 5, 'gath',        'Gath',          'Feigns madness among the Philistines.',                    '1 Samuel 21:10-15'),
  ('journey-david-outlaw', 6, 'en-gedi',     'En-Gedi',       'Hides in caves. Spares Saul''s life.',                     '1 Samuel 24'),
  ('journey-david-outlaw', 7, 'ziph',        'Ziph',          'Betrayed by the Ziphites. Spares Saul again.',             '1 Samuel 23:19-24; 26'),
  ('journey-david-outlaw', 8, 'ziklag',      'Ziklag',        'Given a town by the Philistines. Amalekites raid it.',     '1 Samuel 27:5-6; 30:1-6'),
  ('journey-david-outlaw', 9, 'hebron',      'Hebron',        'Finally anointed king over Judah.',                         '2 Samuel 2:1-4')
on conflict (journey_id, stop_order) do nothing;

-- Elijah's Travels
insert into public."BP_JourneyStops" (journey_id, stop_order, place_id, label, description, scripture_ref) values
  ('journey-elijah', 1, 'brook-cherith', 'Brook Cherith',  'Fed by ravens during the drought.',                       '1 Kings 17:1-7'),
  ('journey-elijah', 2, 'zarephath',     'Zarephath',      'Stays with a widow. Her oil never runs out. Her son raised.','1 Kings 17:8-24'),
  ('journey-elijah', 3, 'mt-carmel',     'Mount Carmel',   'Confronts 450 prophets of Baal. Fire falls from heaven.',  '1 Kings 18:20-40'),
  ('journey-elijah', 4, 'jezreel',       'Jezreel',        'Flees from Jezebel''s death threat.',                      '1 Kings 19:1-3'),
  ('journey-elijah', 5, 'beersheba',     'Beersheba',      'Collapses under a broom tree. "It is enough, Lord."',      '1 Kings 19:3-5'),
  ('journey-elijah', 6, 'sinai',         'Mount Sinai',    'God speaks in a still small voice. Elijah is recommissioned.','1 Kings 19:8-18'),
  ('journey-elijah', 7, 'jordan-river',  'Jordan River',   'Taken up to heaven in a chariot of fire.',                 '2 Kings 2:6-12')
on conflict (journey_id, stop_order) do nothing;

-- Jesus' Ministry
insert into public."BP_JourneyStops" (journey_id, stop_order, place_id, label, description, scripture_ref) values
  ('journey-jesus-ministry', 1, 'bethlehem',      'Bethlehem',     'Born in the city of David.',                                'Luke 2:1-7'),
  ('journey-jesus-ministry', 2, 'nazareth',       'Nazareth',      'Raised here. "Can anything good come from Nazareth?"',       'Luke 2:39-40; John 1:46'),
  ('journey-jesus-ministry', 3, 'jordan-river',   'Jordan River',  'Baptized by John. The Spirit descends.',                     'Matthew 3:13-17'),
  ('journey-jesus-ministry', 4, 'capernaum',      'Capernaum',     'Ministry headquarters. Teaching, healing, calling disciples.','Matthew 4:13-17'),
  ('journey-jesus-ministry', 5, 'sea-of-galilee', 'Sea of Galilee','Calms the storm. Walks on water. Calls fishermen.',          'Matthew 8:23-27; 14:22-33'),
  ('journey-jesus-ministry', 6, 'nain',           'Nain',          'Raises a widow''s only son from the dead.',                  'Luke 7:11-17'),
  ('journey-jesus-ministry', 7, 'jerusalem',      'Jerusalem',     'Crucified, buried, and risen. "It is finished."',            'Matthew 26-28')
on conflict (journey_id, stop_order) do nothing;

commit;
