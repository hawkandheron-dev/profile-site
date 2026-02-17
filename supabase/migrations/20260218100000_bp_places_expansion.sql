-- Biblical Places expansion — comprehensive OT places.
-- Adds ~150 places with coordinates from established biblical geography.
-- ON CONFLICT DO NOTHING to preserve any existing data.

begin;

insert into public."BP_Places" (place_id, name, lat, lng, region, description) values

  -- ── Canaan / Israel — Central Highlands ─────────────────────────────────
  ('ai',              'Ai',                31.92,  35.26, 'Canaan',       'Canaanite city near Bethel destroyed by Joshua after an initial defeat caused by Achan''s sin.'),
  ('gibeon',          'Gibeon',            31.85,  35.19, 'Canaan',       'City whose inhabitants tricked Joshua into a treaty. Site of the sun standing still.'),
  ('mizpah',          'Mizpah',            31.84,  35.21, 'Canaan',       'Assembly and worship site during the period of the judges and early monarchy. Samuel judged Israel here.'),
  ('ramah',           'Ramah',             31.83,  35.22, 'Canaan',       'Hometown of Samuel. A town in Benjamin near the border of Israel and Judah.'),
  ('gibeah',          'Gibeah',            31.82,  35.23, 'Canaan',       'Saul''s hometown and capital during his reign. Site of the outrage in Judges 19.'),
  ('bethel-gilgal',   'Gilgal',            31.87,  35.41, 'Canaan',       'Israel''s first camp after crossing the Jordan. Samuel and Saul offered sacrifices here.'),
  ('michmash',        'Michmash',          31.87,  35.28, 'Canaan',       'Site of Jonathan''s daring attack against the Philistine garrison.'),
  ('gezer',           'Gezer',             31.87,  34.92, 'Canaan',       'Canaanite city given by Pharaoh to Solomon as a dowry. Guarded the road to Jerusalem.'),
  ('timnah',          'Timnah',            31.77,  34.95, 'Canaan',       'Philistine border town where Samson married a Philistine woman.'),
  ('zorah',           'Zorah',             31.77,  34.99, 'Canaan',       'Birthplace of Samson in the Shephelah.'),
  ('bethshemesh',     'Beth-Shemesh',      31.75,  34.97, 'Canaan',       'Where the Ark was returned by the Philistines on a cart pulled by cows.'),
  ('azekah',          'Azekah',            31.70,  34.93, 'Canaan',       'Fortified city near the Valley of Elah. Joshua pursued the Amorites here.'),
  ('lachish',         'Lachish',           31.56,  34.85, 'Canaan',       'Major fortified city in Judah. Besieged by Sennacherib; mentioned in the Lachish Letters.'),
  ('libnah',          'Libnah',            31.60,  34.87, 'Canaan',       'Levitical city in the Shephelah. Rebelled against Judah during Jehoram''s reign.'),
  ('debir',           'Debir',             31.44,  34.97, 'Canaan',       'Also known as Kiriath-Sepher. Captured by Othniel as a condition for marrying Caleb''s daughter.'),
  ('beersheba',       'Beersheba',         31.24,  34.79, 'Canaan',       'Southernmost city of Israel — "from Dan to Beersheba." Abraham and Isaac dug wells here.'),
  ('arad',            'Arad',              31.28,  35.12, 'Canaan',       'Canaanite city in the Negev whose king attacked Israel during the wilderness period.'),
  ('hormah',          'Hormah',            31.16,  34.89, 'Canaan',       'Where the Israelites were defeated after refusing to enter Canaan, then later conquered by Judah.'),
  ('gath',            'Gath',              31.61,  34.85, 'Canaan',       'One of five Philistine cities. Home of Goliath. David took refuge here under King Achish.'),
  ('ekron',           'Ekron',             31.78,  34.85, 'Canaan',       'Northernmost Philistine city. The Ark brought plagues here.'),
  ('ashdod',          'Ashdod',            31.80,  34.65, 'Canaan',       'Philistine city where the Ark was placed in the temple of Dagon, which fell before it.'),
  ('ashkelon',        'Ashkelon',          31.67,  34.55, 'Canaan',       'Coastal Philistine city. Samson killed thirty men here.'),
  ('gaza',            'Gaza',              31.50,  34.47, 'Canaan',       'Southernmost Philistine city. Samson was imprisoned and died here.'),
  ('jezreel',         'Jezreel',           32.56,  35.33, 'Canaan',       'Town in the Jezreel Valley. Site of Naboth''s vineyard and Jezebel''s death.'),
  ('megiddo',         'Megiddo',           32.58,  35.18, 'Canaan',       'Strategic fortress city overlooking the Jezreel Valley. Site of many ancient battles. Josiah was killed here.'),
  ('taanach',         'Taanach',           32.52,  35.22, 'Canaan',       'Canaanite city near Megiddo. Mentioned in the Song of Deborah.'),
  ('dothan',          'Dothan',            32.40,  35.24, 'Canaan',       'Where Joseph found his brothers. Elisha was surrounded by an angelic army here.'),
  ('tirzah',          'Tirzah',            32.30,  35.32, 'Canaan',       'Early capital of the northern kingdom before Omri moved it to Samaria.'),
  ('dan',             'Dan',               33.25,  35.65, 'Canaan',       'Northernmost city of Israel — "from Dan to Beersheba." Jeroboam set up a golden calf here.'),
  ('hazor',           'Hazor',             33.02,  35.57, 'Canaan',       'Largest Canaanite city in the north. Destroyed by Joshua, later fortified by Solomon.'),
  ('kedesh',          'Kedesh',            33.12,  35.53, 'Canaan',       'Levitical city of refuge in Naphtali. Barak''s hometown.'),
  ('abel-beth-maacah','Abel Beth Maacah',  33.27,  35.57, 'Canaan',       'Northern city where Sheba son of Bichri was besieged. A wise woman saved the city.'),
  ('laish',           'Laish',             33.25,  35.65, 'Canaan',       'Original name of Dan before the Danites conquered it.'),

  -- ── Canaan / Israel — Shephelah & Coastal Plain ─────────────────────────
  ('valley-of-elah',  'Valley of Elah',    31.69,  34.95, 'Canaan',       'Where David fought Goliath in the confrontation between Israel and the Philistines.'),
  ('joppa',           'Joppa',             32.05,  34.75, 'Canaan',       'Ancient port city. Jonah sailed from here fleeing God''s call to Nineveh.'),
  ('aphek',           'Aphek',             32.10,  34.93, 'Canaan',       'Where Israel was defeated and the Ark captured by the Philistines.'),
  ('sharon',          'Plain of Sharon',   32.30,  34.88, 'Canaan',       'Fertile coastal plain celebrated in the Song of Solomon — "the rose of Sharon."'),

  -- ── Galilee & Northern Israel ───────────────────────────────────────────
  ('sea-of-galilee',  'Sea of Galilee',    32.82,  35.58, 'Galilee',      'Also called Sea of Chinnereth. Freshwater lake central to the ministry of Jesus.'),
  ('mt-tabor',        'Mount Tabor',       32.69,  35.39, 'Galilee',      'Likely site where Deborah and Barak gathered troops against Sisera. Traditional site of the Transfiguration.'),
  ('endor',           'Endor',             32.63,  35.40, 'Galilee',      'Where Saul consulted a medium before his final battle at Gilboa.'),
  ('nain',            'Nain',              32.63,  35.35, 'Galilee',      'Village near Mount Tabor where Jesus raised a widow''s son.'),
  ('shunem',          'Shunem',            32.60,  35.34, 'Galilee',      'Home of the Shunammite woman who hosted Elisha. Her son was raised from the dead.'),
  ('mt-gilboa',       'Mount Gilboa',      32.50,  35.40, 'Canaan',       'Where Saul and Jonathan died in battle against the Philistines.'),

  -- ── Transjordan ─────────────────────────────────────────────────────────
  ('penuel',          'Penuel',            32.18,  35.68, 'Transjordan',  'Where Jacob wrestled with God and was renamed Israel. "I have seen God face to face."'),
  ('succoth',         'Succoth',           32.19,  35.62, 'Transjordan',  'East of the Jordan. Jacob built shelters here. Gideon punished the men of Succoth.'),
  ('mahanaim',        'Mahanaim',          32.31,  35.76, 'Transjordan',  'Where Jacob saw angels. Later Ish-bosheth''s capital and David''s refuge during Absalom''s revolt.'),
  ('jabesh-gilead',   'Jabesh-Gilead',     32.40,  35.71, 'Transjordan',  'City rescued by Saul in his first military victory. Its people later recovered Saul''s body.'),
  ('ramoth-gilead',   'Ramoth-Gilead',     32.57,  35.84, 'Transjordan',  'City of refuge east of the Jordan. Site of Ahab''s fatal battle.'),
  ('rabbah',          'Rabbah (Ammon)',     31.95,  35.93, 'Transjordan',  'Capital of the Ammonites. Where Uriah was sent to die by David''s order.'),
  ('heshbon',         'Heshbon',           31.80,  35.81, 'Transjordan',  'Capital of Sihon king of the Amorites, conquered by Moses before entering Canaan.'),
  ('dibon',           'Dibon',             31.50,  35.78, 'Transjordan',  'Moabite city. Site where the Mesha Stele (Moabite Stone) was discovered.'),
  ('aroer',           'Aroer',             31.47,  35.83, 'Transjordan',  'City on the Arnon River. Southern boundary of Reuben''s territory.'),
  ('bozrah',          'Bozrah',            30.73,  35.62, 'Transjordan',  'Capital of ancient Edom. Isaiah prophesied judgment against it.'),
  ('teman',           'Teman',             30.50,  35.50, 'Transjordan',  'District in Edom known for its wisdom. Home region of Eliphaz, Job''s friend.'),
  ('kir-hareseth',    'Kir-Hareseth',      31.18,  35.77, 'Transjordan',  'Fortified capital of Moab. Besieged by Israel, Judah, and Edom in 2 Kings 3.'),
  ('mt-nebo',         'Mount Nebo',        31.77,  35.73, 'Transjordan',  'Where Moses viewed the Promised Land before dying. Overlooks the Jordan Valley and Jericho.'),
  ('plains-of-moab',  'Plains of Moab',    31.82,  35.55, 'Transjordan',  'Where Israel camped before crossing the Jordan. Moses delivered his farewell addresses here.'),
  ('bashan',          'Bashan',            32.80,  35.90, 'Transjordan',  'Fertile region east of the Sea of Galilee. Og, king of Bashan, was defeated by Moses.'),
  ('edrei',           'Edrei',             32.62,  36.10, 'Transjordan',  'Where Moses defeated Og king of Bashan at the battle of Edrei.'),

  -- ── Aram / Syria ────────────────────────────────────────────────────────
  ('hamath',          'Hamath',            35.13,  36.75, 'Aram',         'City on the Orontes River. Northern boundary of the ideal Israelite territory.'),
  ('carchemish',      'Carchemish',        36.83,  38.01, 'Aram',         'City on the Euphrates. Site of Nebuchadnezzar''s decisive victory over Pharaoh Neco in 605 BC.'),
  ('zobah',           'Zobah',             33.87,  36.28, 'Aram',         'Aramean kingdom north of Damascus, defeated by David.'),
  ('riblah',          'Riblah',            34.45,  36.53, 'Aram',         'Where Nebuchadnezzar judged Zedekiah and killed his sons.'),
  ('zarephath',       'Zarephath',         33.45,  35.29, 'Phoenicia',    'Phoenician town between Tyre and Sidon. Elijah stayed with a widow here during the famine.'),

  -- ── Phoenicia & Mediterranean Coast ─────────────────────────────────────
  ('tyre',            'Tyre',              33.27,  35.20, 'Phoenicia',    'Great Phoenician port city. Hiram of Tyre supplied materials for Solomon''s Temple.'),
  ('sidon',           'Sidon',             33.56,  35.38, 'Phoenicia',    'Ancient Phoenician city. Jezebel was a Sidonian princess.'),
  ('acco',            'Acco',              32.92,  35.08, 'Canaan',       'Coastal city that the tribe of Asher failed to conquer. Later known as Ptolemais and Acre.'),
  ('dor',             'Dor',               32.62,  34.92, 'Canaan',       'Coastal city whose Canaanite king was defeated by Joshua.'),

  -- ── Egypt ───────────────────────────────────────────────────────────────
  ('memphis',         'Memphis',           29.84,  31.25, 'Egypt',        'Ancient capital of Egypt (Noph in Hebrew). Isaiah and Jeremiah prophesied against it.'),
  ('thebes',          'Thebes',            25.70,  32.64, 'Egypt',        'Great city of Upper Egypt (No-Amon in Hebrew). Nahum prophesied its fall.'),
  ('on',              'On (Heliopolis)',    30.13,  31.31, 'Egypt',        'Egyptian priestly city. Joseph married the daughter of Potiphera, priest of On.'),
  ('pithom',          'Pithom',            30.55,  32.10, 'Egypt',        'One of the store cities the Israelites were forced to build for Pharaoh.'),
  ('raamses',         'Raamses',           30.79,  31.83, 'Egypt',        'Store city built by Israelite slaves. The departure point of the Exodus.'),
  ('nile-river',      'Nile River',        30.05,  31.23, 'Egypt',        'The great river of Egypt. Moses was placed in a basket on the Nile. Its waters turned to blood.'),
  ('red-sea',         'Red Sea (Sea of Reeds)', 29.50, 32.75, 'Egypt',   'Body of water God parted for Israel to cross during the Exodus, drowning Pharaoh''s army.'),
  ('tahpanhes',       'Tahpanhes',         30.96,  32.17, 'Egypt',        'Egyptian border fortress. Jeremiah was taken here after the fall of Jerusalem.'),
  ('noph',            'Noph',              29.84,  31.25, 'Egypt',        'Hebrew name for Memphis. Ezekiel prophesied the destruction of its idols.'),

  -- ── Sinai & Negev ──────────────────────────────────────────────────────
  ('kadesh-barnea',   'Kadesh-Barnea',     30.63,  34.39, 'Sinai',        'Oasis in the wilderness where Israel camped for years. The twelve spies were sent from here.'),
  ('ezion-geber',     'Ezion-Geber',       29.55,  34.97, 'Sinai',        'Port on the Gulf of Aqaba. Solomon built a fleet of ships here.'),
  ('elim',            'Elim',              28.88,  33.45, 'Sinai',        'Oasis with twelve springs and seventy palm trees where Israel camped after Marah.'),
  ('marah',           'Marah',             29.12,  33.15, 'Sinai',        'Where the Israelites found bitter water; Moses threw in a log and the water became sweet.'),
  ('rephidim',        'Rephidim',          28.70,  33.80, 'Sinai',        'Where Moses struck the rock for water and Israel fought Amalek. Aaron and Hur held up Moses''s arms.'),
  ('wilderness-of-zin','Wilderness of Zin', 30.70,  34.55, 'Sinai',       'Desert region where Israel wandered. Kadesh-Barnea was located on its edge.'),
  ('wilderness-of-paran','Wilderness of Paran', 29.80, 34.80, 'Sinai',    'Wilderness south of Canaan. Hagar and Ishmael lived here. The twelve spies departed from here.'),
  ('wilderness-of-sin','Wilderness of Sin',  29.10, 33.40, 'Sinai',       'Desert between Elim and Sinai where Israel received manna and quail.'),
  ('mt-hor',          'Mount Hor',         30.32,  35.41, 'Sinai',        'Where Aaron died and was buried. His priesthood passed to Eleazar.'),
  ('wilderness-of-shur','Wilderness of Shur', 30.30, 33.00, 'Sinai',     'Desert east of Egypt. Hagar fled here. Israel entered this wilderness after crossing the Red Sea.'),

  -- ── Mesopotamia ─────────────────────────────────────────────────────────
  ('assur',           'Assur',             35.46,  43.26, 'Mesopotamia',  'Original capital of Assyria on the Tigris River. One of the oldest cities in Mesopotamia.'),
  ('calah',           'Calah (Nimrud)',     36.10,  43.33, 'Mesopotamia',  'Assyrian city built by Nimrod. Later an Assyrian capital.'),
  ('susa',            'Susa (Shushan)',    32.19,  48.24, 'Mesopotamia',  'Capital of Elam and later Persia. Setting of the book of Esther. Nehemiah served the king here.'),
  ('ecbatana',        'Ecbatana',          34.80,  48.52, 'Mesopotamia',  'Capital of Media. Where the decree of Cyrus was found confirming permission to rebuild the Temple.'),
  ('persepolis',      'Persepolis',        29.93,  52.89, 'Mesopotamia',  'Ceremonial capital of the Persian Empire. Represents the power of the empire that freed the exiles.'),
  ('erech',           'Erech (Uruk)',       31.32,  45.64, 'Mesopotamia',  'Ancient Sumerian city mentioned in Genesis 10 as part of Nimrod''s kingdom.'),
  ('accad',           'Accad (Akkad)',      33.10,  44.10, 'Mesopotamia',  'City in Shinar, part of Nimrod''s kingdom in Genesis 10. Center of the Akkadian Empire.'),

  -- ── Geographic Features ─────────────────────────────────────────────────
  ('mt-ebal',         'Mount Ebal',        32.23,  35.28, 'Canaan',       'Mountain of curses opposite Mount Gerizim. Joshua built an altar here as Moses commanded.'),
  ('mt-gerizim',      'Mount Gerizim',     32.20,  35.27, 'Canaan',       'Mountain of blessings near Shechem. Later the holy mountain of the Samaritans.'),
  ('mt-hermon',       'Mount Hermon',      33.42,  35.85, 'Canaan',       'Highest mountain in the region at over 9,000 feet. Northern boundary of Israel''s conquests.'),
  ('mt-zion',         'Mount Zion',        31.77,  35.23, 'Canaan',       'Originally the Jebusite stronghold captured by David. Became symbolic of God''s dwelling place.'),
  ('brook-cherith',   'Brook Cherith',     32.00,  35.50, 'Canaan',       'Where God sent Elijah to hide during the drought. Ravens brought him bread and meat.'),
  ('brook-besor',     'Brook Besor',       31.35,  34.42, 'Canaan',       'Where 200 of David''s men stayed behind, too exhausted to continue pursuit of the Amalekites.'),
  ('arnon-river',     'Arnon River',       31.47,  35.62, 'Transjordan',  'River forming the border between Moab and the Amorite territory conquered by Israel.'),
  ('jabbok-river',    'Jabbok River',      32.18,  35.65, 'Transjordan',  'River where Jacob wrestled with God. Boundary between Ammon and Gad.'),
  ('dead-sea',        'Dead Sea (Salt Sea)', 31.50, 35.48, 'Canaan',     'Called the Salt Sea in Scripture. The cities of Sodom and Gomorrah were near its shores.'),
  ('kinnereth',       'Sea of Chinnereth',  32.82, 35.58, 'Galilee',     'Old Testament name for the Sea of Galilee. On the border of Naphtali.'),
  ('valley-of-jezreel','Valley of Jezreel', 32.58, 35.30, 'Canaan',      'Broad fertile valley also called the Plain of Esdraelon. Site of Gideon''s victory and many battles.'),
  ('negev',           'Negev',             30.85,  34.78, 'Canaan',       'Arid southern region of Canaan. Abraham, Isaac, and the patriarchs traveled through it.'),

  -- ── Other Notable OT Places ─────────────────────────────────────────────
  ('sodom',           'Sodom',             31.20,  35.39, 'Canaan',       'City destroyed by God with fire and brimstone for its wickedness. Lot lived here.'),
  ('gomorrah',        'Gomorrah',          31.15,  35.39, 'Canaan',       'City destroyed alongside Sodom. Symbol of divine judgment throughout Scripture.'),
  ('zoar',            'Zoar',              31.05,  35.45, 'Canaan',       'Small city near Sodom where Lot fled on the day of destruction.'),
  ('beer-lahai-roi',  'Beer-Lahai-Roi',    30.85,  34.70, 'Canaan',       'Well in the Negev where the angel found Hagar. "The well of the Living One who sees me."'),
  ('mamre',           'Mamre',             31.55,  35.09, 'Canaan',       'Near Hebron, where Abraham lived by the oaks of Mamre. God appeared to him here with two angels.'),
  ('moreh',           'Oak of Moreh',      32.21,  35.28, 'Canaan',       'Near Shechem. Abraham''s first stop in Canaan where God promised him the land.'),
  ('bethlehem-north', 'Bethlehem (Zebulun)', 32.72, 35.19, 'Galilee',    'Northern Bethlehem in Zebulun. Home of the judge Ibzan.'),
  ('ophrah',          'Ophrah',            32.27,  35.26, 'Canaan',       'Gideon''s hometown where the angel of the Lord appeared to him and he built an altar.'),
  ('shittim',         'Shittim (Abel-Shittim)', 31.84, 35.60, 'Transjordan', 'Israel''s last camp before crossing the Jordan. Where Balaam''s counsel led to sin.'),
  ('beth-horon',      'Beth-Horon',        31.88,  35.13, 'Canaan',       'Twin cities (Upper and Lower) on the road from the coast to Jerusalem. Joshua''s pursuit passed here.'),
  ('kiriath-jearim',  'Kiriath-Jearim',    31.81,  35.10, 'Canaan',       'Where the Ark of the Covenant rested for twenty years after being returned by the Philistines.'),
  ('nob',             'Nob',               31.79,  35.24, 'Canaan',       'Priestly city where David received the showbread and Goliath''s sword. Saul massacred its priests.'),
  ('en-gedi',         'En-Gedi',           31.47,  35.39, 'Canaan',       'Oasis on the western shore of the Dead Sea. David hid here from Saul.'),
  ('carmel-town',     'Carmel (Judah)',    31.42,  35.12, 'Canaan',       'Town in Judah where Nabal lived and David''s men were insulted. Not to be confused with Mount Carmel.'),
  ('ziph',            'Ziph',              31.44,  35.11, 'Canaan',       'Wilderness area in Judah where David hid and the Ziphites betrayed him to Saul.'),
  ('ziklag',          'Ziklag',            31.35,  34.63, 'Canaan',       'Philistine city given to David by Achish of Gath. Raided by Amalekites while David was away.'),
  ('beth-shan',       'Beth-Shan',         32.50,  35.50, 'Canaan',       'City where Saul''s body was hung on the walls after the battle of Gilboa.'),
  ('jezreel-spring',  'Spring of Harod',   32.53,  35.39, 'Canaan',       'Where Gideon tested his soldiers by how they drank water, reducing his army to 300.'),
  ('shiloh-north',    'Waters of Merom',   33.07,  35.60, 'Galilee',      'Where Joshua defeated a coalition of northern Canaanite kings led by Jabin of Hazor.'),
  ('edom',            'Edom',              30.35,  35.40, 'Transjordan',  'Mountainous territory south of the Dead Sea. Home of Esau''s descendants. Israel was denied passage.'),
  ('moab',            'Moab',              31.35,  35.75, 'Transjordan',  'Territory east of the Dead Sea. Ruth was a Moabitess. Balak hired Balaam against Israel here.'),
  ('ammon',           'Ammon',             31.95,  35.93, 'Transjordan',  'Territory of the Ammonites east of the Jordan. Descended from Lot. Frequent enemy of Israel.'),
  ('gilead',          'Gilead',            32.35,  35.80, 'Transjordan',  'Hilly region east of the Jordan. Home of Jephthah and Elijah. Known for its healing balm.'),

  -- ── Cities of Refuge ────────────────────────────────────────────────────
  ('golan',           'Golan',             32.90,  35.75, 'Transjordan',  'City of refuge in Bashan, east of the Sea of Galilee.'),
  ('bezer',           'Bezer',             31.55,  35.88, 'Transjordan',  'City of refuge in the territory of Reuben, east of the Jordan.'),

  -- ── Wilderness Stations ─────────────────────────────────────────────────
  ('hazeroth',        'Hazeroth',          28.80,  34.45, 'Sinai',        'Wilderness camp where Miriam and Aaron spoke against Moses. Miriam was struck with leprosy.'),
  ('kibroth-hattaavah','Kibroth-Hattaavah', 28.70, 34.20, 'Sinai',       'Where God sent quail but struck the people with a plague for their craving.'),
  ('oboth',           'Oboth',             30.00,  35.20, 'Sinai',        'Wilderness station on Israel''s journey around Edom.'),
  ('punon',           'Punon',             30.62,  35.45, 'Sinai',        'Wilderness camp, likely where the bronze serpent incident occurred.'),

  -- ── Locations for specific well-known narratives ────────────────────────
  ('garden-of-eden',  'Garden of Eden',    31.00,  47.40, 'Mesopotamia',  'The garden God planted for Adam and Eve. Traditionally placed in Mesopotamia near the Tigris and Euphrates. Exact location unknown.'),
  ('mt-ararat',       'Mount Ararat',      39.70,  44.30, 'Other',        'Mountain region where Noah''s ark came to rest after the flood.'),
  ('babel',           'Babel',             32.54,  44.42, 'Mesopotamia',  'Site of the tower where God confused human language and scattered the nations.'),
  ('land-of-nod',     'Land of Nod',       32.00,  47.00, 'Mesopotamia',  'Region "east of Eden" where Cain settled after killing Abel. Exact location unknown.'),
  ('paddan-aram',     'Paddan-Aram',       36.86,  39.03, 'Mesopotamia',  'Region near Haran where Abraham''s relatives lived. Jacob spent twenty years here with Laban.'),
  ('land-of-uz',      'Land of Uz',        30.00,  37.00, 'Other',        'Home of Job. Location debated; likely in the region of Edom or northern Arabia.'),
  ('tarshish',        'Tarshish',          36.13,  -5.35, 'Other',        'Distant port Jonah tried to flee to. Location debated — possibly Tartessus in southern Spain.'),

  -- ── Additional Divided/Exile Kingdom locations ──────────────────────────
  ('lebo-hamath',     'Lebo-Hamath',       34.34,  36.56, 'Aram',         'Northern boundary marker of Israel''s ideal territory. "From Lebo-Hamath to the Brook of Egypt."'),
  ('beth-arbel',      'Beth-Arbel',        32.77,  35.50, 'Galilee',      'City destroyed in battle, referenced by Hosea as a byword for devastation.'),
  ('lo-debar',        'Lo-Debar',          32.60,  35.70, 'Transjordan',  'Where Mephibosheth, Jonathan''s crippled son, lived before David summoned him to the palace.'),
  ('tekoa',           'Tekoa',             31.63,  35.19, 'Canaan',       'Hometown of the prophet Amos. A wise woman from Tekoa helped reconcile David and Absalom.'),
  ('anathoth',        'Anathoth',          31.81,  35.25, 'Canaan',       'Hometown of Jeremiah. A priestly city in Benjamin.'),
  ('beth-peor',       'Beth-Peor',         31.75,  35.72, 'Transjordan',  'Where Israel worshipped Baal of Peor. Moses was buried nearby in an unknown grave.')

on conflict (place_id) do nothing;

commit;
