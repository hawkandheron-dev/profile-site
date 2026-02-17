-- Broad historical summaries for every place in its narrative-age context.
-- Fills in the gaps left by the initial seed in 20260217_bp_place_age_context.sql
-- so that every place with biblical significance in a given age has a summary.

begin;

insert into public."BP_PlaceAgeSummaries" (place_id, age_id, summary) values

  -- ── Shechem ─────────────────────────────────────────────────────────────────

  ('shechem', 'age-patriarchs',
   'The first place in Canaan where God appeared to Abraham, promising the land to his offspring. Abraham built an altar here. Decades later, Jacob purchased land outside Shechem and erected an altar he called El-Elohe-Israel — ''God, the God of Israel.'' The city also witnessed the violent episode involving Dinah and the sons of Hamor.'),

  ('shechem', 'age-conquest',
   'Joshua gathered all the tribes at Shechem for a great covenant renewal, calling them to choose whom they would serve. Joseph''s bones — carried out of Egypt — were buried here in the plot Jacob had purchased. Shechem lay in the hill country of Ephraim and became a city of refuge.'),

  ('shechem', 'age-divided-monarchy',
   'After Solomon''s death, the northern tribes assembled at Shechem to negotiate with his son Rehoboam. When Rehoboam rejected their plea for relief, the kingdom split. Jeroboam was made king of the northern tribes here, and Shechem briefly served as his first capital before he moved to Tirzah.'),

  -- ── Shiloh ──────────────────────────────────────────────────────────────────

  ('shiloh', 'age-conquest',
   'The central sanctuary of Israel during the period of the judges. After the conquest, the Tabernacle was set up at Shiloh, and it served as the religious center where the remaining tribal allotments were distributed. Young Samuel ministered before the Lord here under the priest Eli, and it was here that God''s voice called to him in the night.'),

  ('shiloh', 'age-united-monarchy',
   'By the beginning of the monarchy, Shiloh lay in ruins — likely destroyed by the Philistines around the time they captured the Ark of the Covenant at the battle of Ebenezer. The prophet Ahijah of Shiloh kept the memory alive; it was he who tore his cloak into twelve pieces to prophesy the coming division of Solomon''s kingdom.'),

  ('shiloh', 'age-judah-exile',
   'The prophet Jeremiah invoked Shiloh as a dire warning to Jerusalem: ''Go now to my place that was in Shiloh, where I set my name at the first, and see what I did to it'' (Jeremiah 7:12). If God had allowed his own sanctuary at Shiloh to be destroyed, the Temple in Jerusalem was not immune to the same judgment.'),

  -- ── Egypt / Goshen ──────────────────────────────────────────────────────────

  ('egypt-goshen', 'age-patriarchs',
   'Joseph settled his father Jacob and brothers in Goshen, the fertile eastern Nile Delta region that Pharaoh granted to them. Here the family of Israel grew from a clan of seventy into a people, enjoying Pharaoh''s favor through Joseph''s position as vizier over all Egypt.'),

  ('egypt-goshen', 'age-exodus',
   'After generations of growth, a new pharaoh ''who did not know Joseph'' enslaved the Israelites and subjected them to forced labor. From Goshen, God called Moses to deliver his people. Here the Israelites observed the first Passover — marking their doorposts with the blood of a lamb — before their dramatic departure from Egypt.'),

  -- ── Ur ──────────────────────────────────────────────────────────────────────

  ('ur', 'age-patriarchs',
   'Abraham''s birthplace in southern Mesopotamia. Ur was a sophisticated Sumerian city with towering ziggurats, advanced writing, and a culture devoted to the moon god Nanna. God called Abraham to leave this prosperous urban center and journey to an unknown land, setting the entire biblical story of redemption in motion.'),

  -- ── Haran ───────────────────────────────────────────────────────────────────

  ('haran', 'age-patriarchs',
   'Abraham''s family settled in Haran after leaving Ur, and Abraham remained here until God called him onward to Canaan. Decades later, Jacob fled to Haran to escape Esau''s wrath and found refuge with his uncle Laban. Here Jacob worked fourteen years for Rachel and Leah, and most of his twelve sons — the future tribes of Israel — were born.'),

  -- ── Babylon (addition) ─────────────────────────────────────────────────────

  ('babylon', 'age-return',
   'Babylon fell to the Persians under Cyrus the Great in 539 BC. From the former seat of Babylonian power, Cyrus issued his famous decree allowing the Jewish exiles to return to Jerusalem and rebuild the Temple. Many Jews chose to remain in the Babylonian region, where a thriving diaspora community persisted for centuries.'),

  -- ── Mount Carmel ────────────────────────────────────────────────────────────

  ('mt-carmel', 'age-conquest',
   'The Carmel range overlooked the Jezreel Valley, one of the most strategically vital corridors in Canaan. Deborah and Barak rallied Israel''s forces to confront Sisera''s Canaanite army in this region. God sent a storm that flooded the Kishon River, sweeping away the enemy''s iron chariots and giving Israel a decisive victory.'),

  ('mt-carmel', 'age-divided-monarchy',
   'The dramatic setting for Elijah''s confrontation with 450 prophets of Baal. On the summit of Carmel, Elijah challenged Israel to choose between the Lord and Baal. Fire fell from heaven consuming the sacrifice, the water, and the stones. The people fell on their faces crying, ''The Lord — he is God!'' Rain then ended a devastating three-year drought.'),

  -- ── Samaria ─────────────────────────────────────────────────────────────────

  ('samaria', 'age-conquest',
   'Before it became a city, this region was the hill country of Ephraim — the highland heartland allotted to the tribes of Ephraim and Manasseh after the conquest. Scattered settlements dotted the rugged terrain, which provided natural defenses for the Israelite population during the turbulent period of the judges.'),

  ('samaria', 'age-divided-monarchy',
   'King Omri purchased the hill of Samaria around 880 BC and built it into the new capital of the northern kingdom. The city grew into a fortified, cosmopolitan center but also a hotbed of Baal worship under Ahab and Jezebel. Prophets repeatedly condemned its idolatry. In 722 BC, Assyria besieged and conquered the city, deporting the population and resettling foreigners in their place.'),

  ('samaria', 'age-judah-exile',
   'After Assyria conquered and depopulated the city, foreign settlers from across the empire were brought in and mixed with the remaining Israelite population. A hybrid culture and religion developed — the settlers worshipped the Lord alongside their own gods. The resulting Samaritan community was viewed with contempt by the people of Judah.'),

  ('samaria', 'age-return',
   'The Samaritans — the mixed population now inhabiting the region — opposed the returning Jewish exiles'' efforts to rebuild Jerusalem''s Temple. Sanballat, governor of Samaria, became Nehemiah''s chief adversary, using political pressure and threats to obstruct the work. The rift between Jews and Samaritans deepened into lasting hostility.'),

  ('samaria', 'age-second-temple',
   'The Samaritans built their own temple on Mount Gerizim near Shechem, formalizing the religious break with Jerusalem. Around 128 BC, the Hasmonean ruler John Hyrcanus destroyed the Samaritan temple and conquered the region, deepening the bitter enmity between the two communities that would persist into Jesus'' day.'),

  ('samaria', 'age-gospels',
   'By Jesus'' time, Samaria was the region between Judea and Galilee, and its inhabitants were despised by most Jews. Jesus broke social convention by traveling through Samaria and speaking with a Samaritan woman at Jacob''s well near Sychar. He later made a Samaritan the hero of one of his most famous parables.'),

  -- ── Nineveh ─────────────────────────────────────────────────────────────────

  ('nineveh', 'age-divided-monarchy',
   'Capital of the Assyrian Empire, the dominant military power of the age. From Nineveh, kings like Tiglath-Pileser III, Shalmaneser V, and Sargon II launched campaigns that terrorized Israel and its neighbors. It was the Assyrian war machine centered here that ultimately destroyed the northern kingdom in 722 BC and scattered its population.'),

  ('nineveh', 'age-judah-exile',
   'God sent the prophet Jonah to preach judgment against Nineveh, and remarkably the entire city repented — from the king to the lowest servant. Yet Nineveh''s reprieve was temporary. The prophet Nahum later proclaimed its doom, and in 612 BC a coalition of Babylonians and Medes destroyed the city, ending the Assyrian Empire forever.'),

  -- ── Damascus ────────────────────────────────────────────────────────────────

  ('damascus', 'age-patriarchs',
   'Already an established city in Abraham''s day. When Abraham pursued the coalition of kings who had captured his nephew Lot, the chase led beyond Damascus. Abraham''s servant Eliezer is described as being from Damascus, suggesting early ties between the patriarchal family and this ancient city.'),

  ('damascus', 'age-united-monarchy',
   'David defeated the Arameans of Damascus and stationed garrisons in the city, bringing it under Israelite control. During Solomon''s reign, however, Rezon son of Eliada seized power in Damascus and became an adversary of Israel — a foreshadowing of the fierce Aramean-Israelite conflicts to come.'),

  ('damascus', 'age-divided-monarchy',
   'Capital of the Aramean kingdom, Damascus was one of Israel''s most persistent enemies during the divided monarchy. Kings like Ben-Hadad and Hazael waged repeated wars against both Israel and Judah. Elisha traveled to Damascus and wept when he prophesied that Hazael would become king and bring devastating cruelty upon the Israelites.'),

  -- ── Mount Moriah ────────────────────────────────────────────────────────────

  ('mt-moriah', 'age-patriarchs',
   'God commanded Abraham to offer his son Isaac as a burnt offering on one of the mountains of Moriah — the supreme test of faith. As Abraham raised the knife, the Angel of the Lord intervened and provided a ram caught in a thicket. Abraham named the place ''The Lord Will Provide,'' and the site became forever associated with divine testing and provision.'),

  ('mt-moriah', 'age-united-monarchy',
   'Traditionally identified as the site where Solomon built the Temple (2 Chronicles 3:1). David had earlier purchased the threshing floor of Araunah the Jebusite on this hill to build an altar after a plague was halted. What began as the place where Abraham offered Isaac became the permanent dwelling place of God''s presence among his people.'),

  -- ── Bethlehem (addition) ────────────────────────────────────────────────────

  ('bethlehem', 'age-patriarchs',
   'Rachel, the beloved wife of Jacob, died giving birth to Benjamin on the road near Bethlehem and was buried there. Her tomb became a landmark remembered for generations — a place of mourning and maternal sorrow tied to the promise of descendants and the unfolding of Israel''s story.'),

  -- ── Bethel (addition) ──────────────────────────────────────────────────────

  ('bethel', 'age-conquest',
   'After Jacob''s transformative encounter with God, Bethel remained an important sacred site. The Israelites assembled here to seek God''s guidance during the civil war against the tribe of Benjamin. The Ark of the Covenant was kept at Bethel for a time, and the site served as a place of worship and inquiry during the period of the judges.'),

  -- ── Jordan River (addition) ─────────────────────────────────────────────────

  ('jordan-river', 'age-patriarchs',
   'Jacob crossed the Jordan with nothing but his staff when he first fled to Haran. When he returned decades later with two large camps of family and flocks, the river marked the boundary of his homecoming. It was at the Jabbok — a tributary of the Jordan — that Jacob wrestled through the night with a mysterious figure and was renamed Israel, ''he who struggles with God.'''),

  -- ── Jericho (addition) ──────────────────────────────────────────────────────

  ('jericho', 'age-divided-monarchy',
   'Elisha''s first miracle after receiving Elijah''s mantle took place here: he purified Jericho''s bitter spring, making the water wholesome and the land productive. Despite Joshua''s ancient curse on anyone who rebuilt the city, Jericho was resettled during the monarchy. Hiel of Bethel rebuilt it during the reign of Ahab, at the cost of his sons'' lives.')

on conflict (place_id, age_id) do nothing;

commit;
