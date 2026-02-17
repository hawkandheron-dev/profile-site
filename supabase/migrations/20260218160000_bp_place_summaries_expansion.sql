-- PlaceAgeSummaries expansion — age-specific context for new and existing places.
-- These narrative paragraphs explain what a place meant during each period.

begin;

insert into public."BP_PlaceAgeSummaries" (place_id, age_id, summary) values

  -- ── Beersheba ───────────────────────────────────────────────────────────
  ('beersheba', 'age-patriarchs',      'Abraham dug a well here and made a treaty with Abimelech. Isaac built an altar and also settled here. The name means "well of the oath" — marking the southern anchor of the patriarchal wanderings.'),
  ('beersheba', 'age-united-monarchy', 'The expression "from Dan to Beersheba" defined the extent of united Israel. Samuel''s corrupt sons judged here, contributing to the people''s demand for a king.'),
  ('beersheba', 'age-divided-monarchy','Elijah fled through Beersheba on his way to Mount Sinai, leaving his servant here before continuing alone into the wilderness where he wished to die.'),

  -- ── Shechem ─────────────────────────────────────────────────────────────
  ('shechem', 'age-patriarchs',        'Abraham''s first stop in Canaan. God appeared and promised the land to his descendants. Jacob later bought land and settled here, but the assault on Dinah led to violent reprisal by her brothers.'),
  ('shechem', 'age-conquest',          'Joshua led a covenant renewal ceremony between Mount Ebal and Mount Gerizim. Joseph''s bones, brought from Egypt, were buried here. It remained a sacred assembly site.'),
  ('shechem', 'age-divided-monarchy',  'Rehoboam came here to be acclaimed king, but his harsh response split the kingdom. Jeroboam I made Shechem his first capital before moving to Tirzah.'),

  -- ── Shiloh ──────────────────────────────────────────────────────────────
  ('shiloh', 'age-conquest',           'The Tabernacle was set up here and remained for centuries as Israel''s central sanctuary. Hannah prayed for a son here, and Samuel grew up serving the Lord under Eli the priest.'),
  ('shiloh', 'age-united-monarchy',    'By the time of Samuel, Shiloh was in decline. The Ark had been captured by the Philistines and never returned here. Jeremiah later used Shiloh as a warning of what God could do to Jerusalem.'),

  -- ── Samaria ─────────────────────────────────────────────────────────────
  ('samaria', 'age-divided-monarchy',  'Omri purchased the hill and built Samaria as the new capital of the northern kingdom. It became a center of power — and of Baal worship under Ahab and Jezebel. The prophets denounced its luxury and injustice.'),
  ('samaria', 'age-judah-exile',       'After three years of siege, Samaria fell to the Assyrians in 722 BC. The population was deported and replaced with foreign settlers, creating the mixed population later known as the Samaritans.'),

  -- ── Nineveh ─────────────────────────────────────────────────────────────
  ('nineveh', 'age-creation',          'One of the great cities built by Nimrod. It grew to become the largest city of the ancient Assyrian Empire.'),
  ('nineveh', 'age-divided-monarchy',  'Jonah was sent to preach against Nineveh, and to his dismay the entire city repented. It was the capital of the Assyrian Empire that destroyed the northern kingdom.'),
  ('nineveh', 'age-judah-exile',       'Nahum prophesied the destruction of Nineveh in vivid detail. The city fell to the Babylonians and Medes in 612 BC, ending the Assyrian Empire.'),

  -- ── Damascus ────────────────────────────────────────────────────────────
  ('damascus', 'age-patriarchs',       'Abraham''s servant Eliezer was from Damascus. The city appears at the margins of the patriarchal narratives as a major center of the ancient Near East.'),
  ('damascus', 'age-divided-monarchy', 'Capital of the Aramean kingdom, a frequent enemy and occasional ally of Israel. Ben-Hadad besieged Samaria, and Hazael brutally oppressed Israel. Elisha traveled here and wept over the evil Hazael would do.'),
  ('damascus', 'age-judah-exile',      'Isaiah prophesied the fall of Damascus. The city came under Assyrian control as the regional powers shifted.'),

  -- ── Hazor ───────────────────────────────────────────────────────────────
  ('hazor', 'age-conquest',            'The largest Canaanite city in the north, ruled by King Jabin. Joshua defeated its coalition and burned the city. Centuries later, another Jabin of Hazor oppressed Israel until Deborah and Barak defeated his general Sisera.'),
  ('hazor', 'age-united-monarchy',     'Solomon fortified Hazor along with Megiddo and Gezer as strategic defense cities guarding the approaches to Israel.'),
  ('hazor', 'age-divided-monarchy',    'Tiglath-Pileser III conquered Hazor and deported its inhabitants as part of the Assyrian campaigns against the northern kingdom.'),

  -- ── Megiddo ─────────────────────────────────────────────────────────────
  ('megiddo', 'age-conquest',          'The Canaanite king of Megiddo was defeated by Joshua, though the city itself was not fully taken. It guarded the strategic Aruna Pass through the Carmel ridge.'),
  ('megiddo', 'age-united-monarchy',   'Solomon fortified Megiddo as one of his chariot cities. Its archaeological remains show extensive stables and administrative buildings from this period.'),
  ('megiddo', 'age-judah-exile',       'King Josiah was killed at Megiddo trying to block Pharaoh Neco from marching north to support Assyria. Josiah''s death was a devastating blow to Judah''s reform movement.'),

  -- ── Dan ─────────────────────────────────────────────────────────────────
  ('dan', 'age-conquest',              'The tribe of Dan could not hold its allotted territory in the south, so they migrated north and captured the peaceful city of Laish, renaming it Dan.'),
  ('dan', 'age-divided-monarchy',      'Jeroboam I established a golden calf here as a rival worship site to Jerusalem. The sanctuary at Dan became a symbol of the northern kingdom''s idolatry throughout its history.'),

  -- ── Mount Carmel ────────────────────────────────────────────────────────
  ('mt-carmel', 'age-divided-monarchy','The dramatic setting of Elijah''s confrontation with 450 prophets of Baal. Fire fell from heaven, consuming the sacrifice, the wood, the stones, and the water. The people fell on their faces: "The LORD, he is God!"'),

  -- ── Joppa ───────────────────────────────────────────────────────────────
  ('joppa', 'age-divided-monarchy',    'Jonah boarded a ship at Joppa, fleeing from God''s command to go to Nineveh. A great storm led to his being thrown overboard and swallowed by a great fish.'),

  -- ── Kadesh-Barnea ───────────────────────────────────────────────────────
  ('kadesh-barnea', 'age-exodus',      'A major oasis in the wilderness where Israel camped for much of the forty years of wandering. The twelve spies were sent from here, and the people''s refusal to enter Canaan sealed a generation''s fate.'),

  -- ── Sodom / Gomorrah ────────────────────────────────────────────────────
  ('sodom', 'age-patriarchs',          'Lot chose the well-watered plain near Sodom, but the city''s wickedness was extreme. Abraham interceded for the city, but God destroyed it with fire and brimstone. Only Lot and his two daughters escaped.'),

  -- ── Valley of Elah ──────────────────────────────────────────────────────
  ('valley-of-elah', 'age-united-monarchy', 'The valley where the Philistine and Israelite armies faced off. Young David, armed only with a sling and five smooth stones, defeated the giant Goliath here in one of the Bible''s most famous encounters.'),

  -- ── Gibeon ──────────────────────────────────────────────────────────────
  ('gibeon', 'age-conquest',           'The Gibeonites tricked Joshua into a peace treaty by pretending to be from a distant land. When five Amorite kings attacked Gibeon for making peace with Israel, Joshua came to their defense and the sun stood still.'),
  ('gibeon', 'age-united-monarchy',    'The great high place was at Gibeon. Here Solomon offered a thousand burnt offerings and God appeared to him in a dream, offering him anything. Solomon asked for wisdom.'),

  -- ── Tyre ────────────────────────────────────────────────────────────────
  ('tyre', 'age-united-monarchy',      'King Hiram of Tyre was David''s and Solomon''s ally. He supplied the cedar wood, skilled craftsmen, and gold that made Solomon''s Temple and palace possible.'),
  ('tyre', 'age-divided-monarchy',     'Jezebel was a princess of Tyre/Sidon. The commercial prosperity of Tyre became a target of prophetic judgment — Ezekiel devoted two chapters to its coming downfall.'),

  -- ── Susa ────────────────────────────────────────────────────────────────
  ('susa', 'age-judah-exile',          'Daniel received a vision at Susa by the Ulai canal, seeing a ram and a goat representing Media-Persia and Greece.'),
  ('susa', 'age-return',              'The Persian capital where Nehemiah served as cupbearer to King Artaxerxes and where the story of Esther took place. Esther risked her life approaching the king uninvited to save her people from Haman''s plot.'),

  -- ── En-Gedi ─────────────────────────────────────────────────────────────
  ('en-gedi', 'age-united-monarchy',   'David hid in the caves of En-Gedi while fleeing from Saul. When Saul entered the very cave where David was hiding, David cut a corner of Saul''s robe but refused to kill the Lord''s anointed.'),

  -- ── Mizpah ──────────────────────────────────────────────────────────────
  ('mizpah', 'age-conquest',           'Samuel gathered all Israel at Mizpah for prayer and fasting. When the Philistines attacked, God thundered with a great voice and routed them. Samuel set up a stone of remembrance called Ebenezer.'),
  ('mizpah', 'age-united-monarchy',    'Samuel presented Saul to the people at Mizpah, where he was chosen by lot as Israel''s first king.'),
  ('mizpah', 'age-judah-exile',        'After Jerusalem''s fall, Gedaliah governed the remnant of Judah from Mizpah. He was assassinated by Ishmael son of Nethaniah, causing the survivors to flee to Egypt.'),

  -- ── Dothan ──────────────────────────────────────────────────────────────
  ('dothan', 'age-patriarchs',         'Joseph found his brothers pasturing their flocks near Dothan. They stripped him of his colorful robe, threw him into a pit, and sold him to passing traders on their way to Egypt.'),
  ('dothan', 'age-divided-monarchy',   'The king of Aram sent an army to capture Elisha at Dothan. When Elisha''s servant panicked, Elisha prayed and God opened his eyes to see the hills full of horses and chariots of fire surrounding them.'),

  -- ── Jabesh-Gilead ───────────────────────────────────────────────────────
  ('jabesh-gilead', 'age-united-monarchy', 'Saul''s first military triumph — he rallied Israel to rescue Jabesh-Gilead from the Ammonites. The city''s grateful inhabitants later recovered Saul and Jonathan''s bodies from the walls of Beth-Shan and gave them a proper burial.'),

  -- ── Jezreel ─────────────────────────────────────────────────────────────
  ('jezreel', 'age-divided-monarchy',  'Site of Naboth''s vineyard, which Ahab coveted and Jezebel obtained through murder. Elijah prophesied that dogs would lick Ahab''s blood and eat Jezebel in this very place — both fulfilled when Jehu came to power.'),

  -- ── Lachish ─────────────────────────────────────────────────────────────
  ('lachish', 'age-judah-exile',       'Sennacherib besieged and captured Lachish, Judah''s second most important city. The siege is depicted in detail on his palace reliefs at Nineveh. The Lachish Letters, found here, preserve desperate wartime correspondence from Judah''s final days before Babylonian conquest.'),

  -- ── Ramah ───────────────────────────────────────────────────────────────
  ('ramah', 'age-united-monarchy',     'Samuel''s hometown and base of operations. He judged Israel here, built an altar, and returned to Ramah after each circuit of Bethel, Gilgal, and Mizpah.'),

  -- ── Mount Nebo ──────────────────────────────────────────────────────────
  ('mt-nebo', 'age-exodus',            'Moses climbed Mount Nebo at God''s command and looked out over the entire Promised Land — from Gilead to Dan, Naphtali, Ephraim, Judah, the Negev, and the Jordan plain. He died there, and God buried him in the valley nearby. No one knows his grave to this day.'),

  -- ── Gath ────────────────────────────────────────────────────────────────
  ('gath', 'age-united-monarchy',      'Home of Goliath, the Philistine champion. After fleeing Saul, David took refuge with Achish king of Gath and feigned madness. Later, David used Gath as a base during his time with the Philistines.'),

  -- ── Ziklag ──────────────────────────────────────────────────────────────
  ('ziklag', 'age-united-monarchy',    'The Philistine city given to David by King Achish of Gath. While David was away, Amalekites raided and burned Ziklag, capturing the women and children. David pursued and recovered everything.'),

  -- ── Haran ───────────────────────────────────────────────────────────────
  ('haran', 'age-patriarchs',          'Abraham''s family settled here on the way from Ur to Canaan. Abraham departed after Terah''s death. Jacob spent twenty years here working for Laban, marrying Leah and Rachel, and fathering eleven sons.'),

  -- ── Ur ──────────────────────────────────────────────────────────────────
  ('ur', 'age-patriarchs',             'Abraham''s birthplace in southern Mesopotamia, a sophisticated city with ziggurats, schools, and extensive trade. God called Abraham out of this urban civilization to become a nomadic wanderer trusting in divine promises.'),

  -- ── Mount Moriah ────────────────────────────────────────────────────────
  ('mt-moriah', 'age-patriarchs',      'God commanded Abraham to sacrifice Isaac on one of the mountains in the land of Moriah. At the last moment, God provided a ram. The place was named "The LORD will provide."'),
  ('mt-moriah', 'age-united-monarchy', 'Traditionally identified as the site where David purchased Araunah''s threshing floor and where Solomon built the Temple. The place of Abraham''s test became the center of Israelite worship.'),

  -- ── Mamre ───────────────────────────────────────────────────────────────
  ('mamre', 'age-patriarchs',          'Abraham lived among the oaks of Mamre near Hebron. Here three visitors appeared, and God announced that Sarah would bear a son. Abraham interceded for Sodom from this place.'),

  -- ── Gilgal ──────────────────────────────────────────────────────────────
  ('bethel-gilgal', 'age-conquest',    'Israel''s first camp west of the Jordan. Joshua set up twelve stones as a memorial. The men were circumcised and the first Passover in Canaan was celebrated here.'),
  ('bethel-gilgal', 'age-united-monarchy', 'Samuel included Gilgal on his judging circuit. Saul was confirmed as king here, but also made his fateful unauthorized sacrifice here, leading Samuel to declare God''s rejection of his kingship.'),

  -- ── Mount Gilboa ────────────────────────────────────────────────────────
  ('mt-gilboa', 'age-united-monarchy', 'The site of Saul''s last battle and death. Saul and three of his sons, including Jonathan, fell here fighting the Philistines. David lamented: "How the mighty have fallen! Tell it not in Gath."'),

  -- ── Mahanaim ────────────────────────────────────────────────────────────
  ('mahanaim', 'age-patriarchs',       'Jacob named this place "Two Camps" after seeing God''s angels here on his way back from Laban to face Esau.'),
  ('mahanaim', 'age-united-monarchy',  'Ish-bosheth ruled a rump kingdom here after Saul''s death. Later, David fled here during Absalom''s revolt, and his forces defeated Absalom''s army in the nearby forest.'),

  -- ── Gaza ────────────────────────────────────────────────────────────────
  ('gaza', 'age-conquest',             'Samson visited Gaza and carried off its city gates. Later, blinded and imprisoned, he pulled down the pillars of the Philistine temple, killing more in his death than in his life.'),

  -- ── Beth-Shan ───────────────────────────────────────────────────────────
  ('beth-shan', 'age-united-monarchy', 'The Philistines hung the bodies of Saul and his sons on the walls of Beth-Shan after the battle of Gilboa. The men of Jabesh-Gilead traveled through the night to retrieve and bury them.'),

  -- ── Tirzah ──────────────────────────────────────────────────────────────
  ('tirzah', 'age-divided-monarchy',   'The early capital of the northern kingdom before Omri moved it to Samaria. Several kings reigned and died violently here during the turbulent early decades of the divided kingdom.'),

  -- ── Brook Cherith ───────────────────────────────────────────────────────
  ('brook-cherith', 'age-divided-monarchy', 'God sent Elijah to hide by the brook Cherith during the drought he had proclaimed. Ravens brought him bread and meat morning and evening until the brook dried up.'),

  -- ── Zarephath ───────────────────────────────────────────────────────────
  ('zarephath', 'age-divided-monarchy', 'After the brook Cherith dried up, God sent Elijah to a widow in Zarephath — in Jezebel''s own homeland of Sidon. Her flour and oil never ran out, and when her son died, Elijah raised him back to life.'),

  -- ── Shunem ──────────────────────────────────────────────────────────────
  ('shunem', 'age-divided-monarchy',   'A wealthy woman of Shunem built a room for Elisha on her roof. When her only son died, she rode to find Elisha. He came and raised the boy from the dead, stretching himself over the child.'),

  -- ── Ramoth-Gilead ───────────────────────────────────────────────────────
  ('ramoth-gilead', 'age-divided-monarchy', 'A contested city of refuge east of the Jordan. Ahab died here in battle against Aram despite disguising himself. The prophet Micaiah had foretold his death, while 400 false prophets had promised victory.'),

  -- ── Carchemish ──────────────────────────────────────────────────────────
  ('carchemish', 'age-judah-exile',    'Site of the pivotal battle in 605 BC where Nebuchadnezzar defeated Pharaoh Neco. This battle shifted the balance of power in the ancient Near East from Egypt to Babylon and sealed Judah''s fate.'),

  -- ── Tekoa ───────────────────────────────────────────────────────────────
  ('tekoa', 'age-divided-monarchy',    'The hometown of Amos, a shepherd and fig farmer whom God called to prophesy against the northern kingdom''s injustice and complacency. Also known for a wise woman sent by Joab to reconcile David and Absalom.'),

  -- ── Anathoth ────────────────────────────────────────────────────────────
  ('anathoth', 'age-judah-exile',      'Jeremiah''s hometown, a priestly village northeast of Jerusalem. His own townsmen plotted against him for his unpopular prophecies of Jerusalem''s destruction. He purchased a field here as a sign of hope for restoration.'),

  -- ── Gilead ──────────────────────────────────────────────────────────────
  ('gilead', 'age-conquest',           'Hilly region east of the Jordan allotted to Gad, Reuben, and the half-tribe of Manasseh. Jephthah was from Gilead. The region was known for its balm — "Is there no balm in Gilead?" (Jeremiah 8:22).'),
  ('gilead', 'age-divided-monarchy',   'Elijah the Tishbite was from Gilead. The region suffered greatly under Aramean aggression, particularly during the reign of Hazael of Damascus.')

on conflict (place_id, age_id) do nothing;

commit;
