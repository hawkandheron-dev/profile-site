-- Expand CH_People with monarch_type and description columns.
-- Add all Roman emperors through fall of Western (476) and Eastern (1453) empires.
-- Add notable monarchs relevant to church history.
-- Move Charlemagne from People lane to monarchs lane.
-- Run after 20260206140000_ch_events_enrichment.sql

begin;

-- ── Schema changes ──────────────────────────────────────────────────────

ALTER TABLE public."CH_People"
  ADD COLUMN IF NOT EXISTS monarch_type text,
  ADD COLUMN IF NOT EXISTS description text;

-- ── Update existing emperors: set monarch_type and descriptions ─────────

UPDATE public."CH_People" SET monarch_type = 'roman-unified', description = 'First Roman emperor, reigning during the birth of Jesus. Established the Pax Romana. https://en.wikipedia.org/wiki/Augustus' WHERE person_id = 'roman-augustus';

UPDATE public."CH_People" SET monarch_type = 'roman-unified', description = 'Emperor during the ministry and crucifixion of Jesus. https://en.wikipedia.org/wiki/Tiberius' WHERE person_id = 'roman-tiberius';

UPDATE public."CH_People" SET monarch_type = 'roman-unified', description = 'Briefly reigned; known for erratic and tyrannical behavior. https://en.wikipedia.org/wiki/Caligula' WHERE person_id = 'roman-caligula';

UPDATE public."CH_People" SET monarch_type = 'roman-unified', description = 'Expelled Jews from Rome (Acts 18:2). https://en.wikipedia.org/wiki/Claudius' WHERE person_id = 'roman-claudius';

UPDATE public."CH_People" SET monarch_type = 'roman-unified', description = 'Blamed Christians for the Great Fire of Rome (64 AD); first major imperial persecutor of Christians. https://en.wikipedia.org/wiki/Nero' WHERE person_id = 'roman-nero';

UPDATE public."CH_People" SET monarch_type = 'roman-unified', description = 'Year of the Four Emperors — civil war following Nero''s death. https://en.wikipedia.org/wiki/Year_of_the_Four_Emperors' WHERE person_id = 'roman-galba-otho-vitellius';

UPDATE public."CH_People" SET monarch_type = 'roman-unified', description = 'Founded the Flavian dynasty; commanded the siege of Jerusalem in 70 AD before becoming emperor. https://en.wikipedia.org/wiki/Vespasian' WHERE person_id = 'roman-vespasian';

UPDATE public."CH_People" SET monarch_type = 'roman-unified', description = 'As general, destroyed the Second Temple in Jerusalem (70 AD). https://en.wikipedia.org/wiki/Titus' WHERE person_id = 'roman-titus';

UPDATE public."CH_People" SET monarch_type = 'roman-unified', description = 'Persecuted Christians late in his reign; tradition links him to the exile of John to Patmos. https://en.wikipedia.org/wiki/Domitian' WHERE person_id = 'roman-domitian';

UPDATE public."CH_People" SET monarch_type = 'roman-unified', description = 'First of the Five Good Emperors; adopted Trajan as successor. https://en.wikipedia.org/wiki/Nerva' WHERE person_id = 'roman-nerva';

UPDATE public."CH_People" SET monarch_type = 'roman-unified', description = 'Under his rule the empire reached its greatest territorial extent. Corresponded with Pliny about treatment of Christians. https://en.wikipedia.org/wiki/Trajan' WHERE person_id = 'roman-trajan';

UPDATE public."CH_People" SET monarch_type = 'roman-unified', description = 'Rebuilt Jerusalem as Aelia Capitolina, triggering the Bar Kokhba revolt. https://en.wikipedia.org/wiki/Hadrian' WHERE person_id = 'roman-hadrian';

UPDATE public."CH_People" SET monarch_type = 'roman-unified', description = 'Longest-reigning of the Five Good Emperors; a period of relative peace for Christians. https://en.wikipedia.org/wiki/Antoninus_Pius' WHERE person_id = 'roman-antoninus';

UPDATE public."CH_People" SET monarch_type = 'roman-unified', description = 'Stoic philosopher-emperor. Persecution of Christians occurred during his reign, including the martyrdom of Polycarp. https://en.wikipedia.org/wiki/Marcus_Aurelius' WHERE person_id = 'roman-marcus-aurelius';

UPDATE public."CH_People" SET monarch_type = 'roman-unified', description = 'Last of the Antonine dynasty; his misrule led to the Crisis of the Third Century. https://en.wikipedia.org/wiki/Commodus' WHERE person_id = 'roman-commodus';

UPDATE public."CH_People" SET monarch_type = 'roman-unified', description = 'Ordered empire-wide sacrifice to Roman gods, launching the Decian persecution of Christians. https://en.wikipedia.org/wiki/Decius' WHERE person_id = 'roman-decius';

UPDATE public."CH_People" SET monarch_type = 'roman-unified', description = 'Established the Tetrarchy. Launched the Great Persecution (303–311), the last and most severe persecution of Christians in the empire. https://en.wikipedia.org/wiki/Diocletian' WHERE person_id = 'roman-diocletian-maximian';

UPDATE public."CH_People" SET monarch_type = 'roman-unified', description = 'First emperor to convert to Christianity. Issued the Edict of Milan (313), convened the Council of Nicaea (325). https://en.wikipedia.org/wiki/Constantine_the_Great' WHERE person_id = 'roman-constantine';


-- ── New unified Roman emperors (filling gaps and extending to 395) ──────

INSERT INTO public."CH_People" (person_id, name, birth_date, death_date, birth_year, death_year, location, role_type, era_id, is_emperor, monarch_type, description) VALUES
  ('roman-septimius-severus', 'Septimius Severus', '0193-01-01', '0211-01-01', 193, 211, 'Roman Empire', 'emperor', NULL, true, 'roman-unified',
    'Founded the Severan dynasty. His wife Julia Domna was sympathetic to various religions. https://en.wikipedia.org/wiki/Septimius_Severus'),
  ('roman-caracalla', 'Caracalla', '0211-01-01', '0217-01-01', 211, 217, 'Roman Empire', 'emperor', NULL, true, 'roman-unified',
    'Extended Roman citizenship to all free inhabitants of the empire (Constitutio Antoniniana). https://en.wikipedia.org/wiki/Caracalla'),
  ('roman-alexander-severus', 'Alexander Severus', '0222-01-01', '0235-01-01', 222, 235, 'Roman Empire', 'emperor', NULL, true, 'roman-unified',
    'Tolerant of Christians; his household reportedly included images of Christ alongside other religious figures. https://en.wikipedia.org/wiki/Alexander_Severus'),
  ('roman-maximinus-thrax', 'Maximinus Thrax', '0235-01-01', '0238-01-01', 235, 238, 'Roman Empire', 'emperor', NULL, true, 'roman-unified',
    'First soldier-emperor; targeted Christian clergy, initiating a brief persecution. https://en.wikipedia.org/wiki/Maximinus_Thrax'),
  ('roman-philip-arab', 'Philip the Arab', '0244-01-01', '0249-01-01', 244, 249, 'Roman Empire', 'emperor', NULL, true, 'roman-unified',
    'Some ancient sources claim he was the first Christian emperor; celebrated Rome''s millennium. https://en.wikipedia.org/wiki/Philip_the_Arab'),
  ('roman-valerian', 'Valerian', '0253-01-01', '0260-01-01', 253, 260, 'Roman Empire', 'emperor', NULL, true, 'roman-unified',
    'Persecuted Christians; captured alive by the Sasanian king Shapur I — the only Roman emperor taken prisoner. https://en.wikipedia.org/wiki/Valerian_(emperor)'),
  ('roman-gallienus', 'Gallienus', '0260-01-01', '0268-01-01', 260, 268, 'Roman Empire', 'emperor', NULL, true, 'roman-unified',
    'Ended his father Valerian''s persecution and issued an edict of toleration for Christians. https://en.wikipedia.org/wiki/Gallienus'),
  ('roman-aurelian', 'Aurelian', '0270-01-01', '0275-01-01', 270, 275, 'Roman Empire', 'emperor', NULL, true, 'roman-unified',
    'Reunited the empire after the Crisis of the Third Century. Promoted the cult of Sol Invictus. https://en.wikipedia.org/wiki/Aurelian'),
  ('roman-constantius-ii', 'Constantius II', '0337-01-01', '0361-01-01', 337, 361, 'Roman Empire', 'emperor', NULL, true, 'roman-unified',
    'Son of Constantine. Favored Arianism and exiled Athanasius multiple times. https://en.wikipedia.org/wiki/Constantius_II'),
  ('roman-julian', 'Julian the Apostate', '0361-01-01', '0363-01-01', 361, 363, 'Roman Empire', 'emperor', NULL, true, 'roman-unified',
    'Last non-Christian emperor; attempted to restore traditional Roman religion. https://en.wikipedia.org/wiki/Julian_(emperor)'),
  ('roman-valens', 'Valens', '0364-01-01', '0378-01-01', 364, 378, 'Roman Empire', 'emperor', NULL, true, 'roman-unified',
    'Arian sympathizer who persecuted Nicene Christians. Died at the Battle of Adrianople (378). https://en.wikipedia.org/wiki/Valens'),
  ('roman-theodosius-i', 'Theodosius I', '0379-01-01', '0395-01-01', 379, 395, 'Roman Empire', 'emperor', NULL, true, 'roman-unified',
    'Made Christianity the state religion (Edict of Thessalonica, 380). Last emperor to rule both East and West. https://en.wikipedia.org/wiki/Theodosius_I')
ON CONFLICT DO NOTHING;


-- ── Western Roman Emperors (395–476) ────────────────────────────────────

INSERT INTO public."CH_People" (person_id, name, birth_date, death_date, birth_year, death_year, location, role_type, era_id, is_emperor, monarch_type, description) VALUES
  ('western-honorius', 'Honorius', '0395-01-01', '0423-01-01', 395, 423, 'Western Roman Empire', 'emperor', NULL, true, 'roman-western',
    'Ruled during the Visigoth sack of Rome (410). Moved the capital from Rome to Ravenna. https://en.wikipedia.org/wiki/Honorius_(emperor)'),
  ('western-valentinian-iii', 'Valentinian III', '0425-01-01', '0455-01-01', 425, 455, 'Western Roman Empire', 'emperor', NULL, true, 'roman-western',
    'Reigned during the Vandal sack of Rome (455) and the Council of Chalcedon era. Pope Leo I negotiated with Attila on his behalf. https://en.wikipedia.org/wiki/Valentinian_III'),
  ('western-majorian', 'Majorian', '0457-01-01', '0461-01-01', 457, 461, 'Western Roman Empire', 'emperor', NULL, true, 'roman-western',
    'Last Western emperor to make a serious attempt to restore the empire''s power. https://en.wikipedia.org/wiki/Majorian'),
  ('western-romulus-augustulus', 'Romulus Augustulus', '0475-01-01', '0476-01-01', 475, 476, 'Western Roman Empire', 'emperor', NULL, true, 'roman-western',
    'Last Western Roman emperor, deposed by Odoacer in 476 — the traditional date for the fall of the Western Roman Empire. https://en.wikipedia.org/wiki/Romulus_Augustulus')
ON CONFLICT DO NOTHING;


-- ── Eastern Roman / Byzantine Emperors (395–1453) ───────────────────────

INSERT INTO public."CH_People" (person_id, name, birth_date, death_date, birth_year, death_year, location, role_type, era_id, is_emperor, monarch_type, description) VALUES
  ('eastern-arcadius', 'Arcadius', '0395-01-01', '0408-01-01', 395, 408, 'Eastern Roman Empire', 'emperor', NULL, true, 'roman-eastern',
    'First permanent Eastern emperor after the division. John Chrysostom served as patriarch during his reign. https://en.wikipedia.org/wiki/Arcadius'),
  ('eastern-theodosius-ii', 'Theodosius II', '0408-01-01', '0450-01-01', 408, 450, 'Eastern Roman Empire', 'emperor', NULL, true, 'roman-eastern',
    'Convened the Council of Ephesus (431). Built the Theodosian Walls of Constantinople. https://en.wikipedia.org/wiki/Theodosius_II'),
  ('eastern-marcian', 'Marcian', '0450-01-01', '0457-01-01', 450, 457, 'Eastern Roman Empire', 'emperor', NULL, true, 'roman-eastern',
    'Convened the Council of Chalcedon (451), which defined the two natures of Christ. https://en.wikipedia.org/wiki/Marcian'),
  ('eastern-leo-i', 'Leo I', '0457-01-01', '0474-01-01', 457, 474, 'Eastern Roman Empire', 'emperor', NULL, true, 'roman-eastern',
    'First emperor crowned by the Patriarch of Constantinople, establishing the precedent of religious coronation. https://en.wikipedia.org/wiki/Leo_I_(emperor)'),
  ('eastern-justinian-i', 'Justinian I', '0527-01-01', '0565-01-01', 527, 565, 'Eastern Roman Empire', 'emperor', NULL, true, 'roman-eastern',
    'Built Hagia Sophia, codified Roman law (Corpus Juris Civilis), convened the Second Council of Constantinople (553). https://en.wikipedia.org/wiki/Justinian_I'),
  ('eastern-heraclius', 'Heraclius', '0610-01-01', '0641-01-01', 610, 641, 'Eastern Roman Empire', 'emperor', NULL, true, 'roman-eastern',
    'Recovered the True Cross from the Persians. Reigned during the rise of Islam and the Arab conquests. https://en.wikipedia.org/wiki/Heraclius'),
  ('eastern-constantine-iv', 'Constantine IV', '0668-01-01', '0685-01-01', 668, 685, 'Eastern Roman Empire', 'emperor', NULL, true, 'roman-eastern',
    'Convened the Third Council of Constantinople (680–681), which condemned Monothelitism. https://en.wikipedia.org/wiki/Constantine_IV'),
  ('eastern-justinian-ii', 'Justinian II', '0685-01-01', '0695-01-01', 685, 695, 'Eastern Roman Empire', 'emperor', NULL, true, 'roman-eastern',
    'Convened the Quinisext Council (692). First emperor to place Christ''s image on coinage. https://en.wikipedia.org/wiki/Justinian_II'),
  ('eastern-leo-iii', 'Leo III the Isaurian', '0717-01-01', '0741-01-01', 717, 741, 'Eastern Roman Empire', 'emperor', NULL, true, 'roman-eastern',
    'Launched Byzantine Iconoclasm (726), ordering the destruction of religious images. https://en.wikipedia.org/wiki/Leo_III_the_Isaurian'),
  ('eastern-constantine-v', 'Constantine V', '0741-01-01', '0775-01-01', 741, 775, 'Eastern Roman Empire', 'emperor', NULL, true, 'roman-eastern',
    'Intensified Iconoclasm; convened the Council of Hieria (754) condemning icon veneration. https://en.wikipedia.org/wiki/Constantine_V'),
  ('eastern-irene', 'Irene of Athens', '0797-01-01', '0802-01-01', 797, 802, 'Eastern Roman Empire', 'emperor', NULL, true, 'roman-eastern',
    'First woman to rule the empire in her own right. Restored icon veneration at the Second Council of Nicaea (787). https://en.wikipedia.org/wiki/Irene_of_Athens'),
  ('eastern-basil-i', 'Basil I', '0867-01-01', '0886-01-01', 867, 886, 'Eastern Roman Empire', 'emperor', NULL, true, 'roman-eastern',
    'Founded the Macedonian dynasty. Presided over a cultural and theological renaissance. https://en.wikipedia.org/wiki/Basil_I'),
  ('eastern-basil-ii', 'Basil II', '0976-01-01', '1025-01-01', 976, 1025, 'Eastern Roman Empire', 'emperor', NULL, true, 'roman-eastern',
    'Oversaw the Christianization of Kievan Rus'' (988) through the baptism of Vladimir the Great. https://en.wikipedia.org/wiki/Basil_II'),
  ('eastern-constantine-ix', 'Constantine IX Monomachos', '1042-01-01', '1055-01-01', 1042, 1055, 'Eastern Roman Empire', 'emperor', NULL, true, 'roman-eastern',
    'Emperor during the Great Schism of 1054 between Rome and Constantinople. https://en.wikipedia.org/wiki/Constantine_IX_Monomachos'),
  ('eastern-alexios-i', 'Alexios I Komnenos', '1081-01-01', '1118-01-01', 1081, 1118, 'Eastern Roman Empire', 'emperor', NULL, true, 'roman-eastern',
    'His appeal to Pope Urban II helped trigger the First Crusade (1096). https://en.wikipedia.org/wiki/Alexios_I_Komnenos'),
  ('eastern-michael-viii', 'Michael VIII Palaiologos', '1261-01-01', '1282-01-01', 1261, 1282, 'Eastern Roman Empire', 'emperor', NULL, true, 'roman-eastern',
    'Recaptured Constantinople from the Latins (1261). Attempted reunion of Eastern and Western churches at the Council of Lyon (1274). https://en.wikipedia.org/wiki/Michael_VIII_Palaiologos'),
  ('eastern-constantine-xi', 'Constantine XI Palaiologos', '1449-01-01', '1453-01-01', 1449, 1453, 'Eastern Roman Empire', 'emperor', NULL, true, 'roman-eastern',
    'Last Byzantine emperor. Died defending Constantinople when it fell to the Ottoman Turks in 1453. https://en.wikipedia.org/wiki/Constantine_XI_Palaiologos')
ON CONFLICT DO NOTHING;


-- ── Update Charlemagne: move from People lane to monarchs lane ──────────

UPDATE public."CH_People"
SET is_emperor = true,
    role_type = 'emperor',
    monarch_type = 'frankish',
    era_id = NULL,
    description = 'King of the Franks and first Holy Roman Emperor. Crowned by Pope Leo III on Christmas Day 800. Patron of the Carolingian Renaissance. https://en.wikipedia.org/wiki/Charlemagne'
WHERE person_id = 'charlemagne';


-- ── Notable Monarchs (relevant to church history) ───────────────────────

INSERT INTO public."CH_People" (person_id, name, birth_date, death_date, birth_year, death_year, location, role_type, era_id, is_emperor, monarch_type, description) VALUES
  -- Frankish
  ('monarch-clovis', 'Clovis I', '0481-01-01', '0511-01-01', 481, 511, 'Frankish Kingdom', 'emperor', NULL, true, 'frankish',
    'First king of the Franks to unite all Frankish tribes. Converted to Catholic Christianity (c. 496), shaping the religious identity of Western Europe. https://en.wikipedia.org/wiki/Clovis_I'),

  -- Holy Roman Empire
  ('monarch-otto-i', 'Otto I', '0962-01-01', '0973-01-01', 962, 973, 'Holy Roman Empire', 'emperor', NULL, true, 'hre',
    'First Holy Roman Emperor of the restored Western empire. Strengthened papal-imperial relations. https://en.wikipedia.org/wiki/Otto_I,_Holy_Roman_Emperor'),
  ('monarch-henry-iv', 'Henry IV', '1056-01-01', '1106-01-01', 1056, 1106, 'Holy Roman Empire', 'emperor', NULL, true, 'hre',
    'Central figure in the Investiture Controversy. Famously walked barefoot to Canossa (1077) to seek Pope Gregory VII''s absolution. https://en.wikipedia.org/wiki/Henry_IV,_Holy_Roman_Emperor'),
  ('monarch-frederick-i', 'Frederick Barbarossa', '1155-01-01', '1190-01-01', 1155, 1190, 'Holy Roman Empire', 'emperor', NULL, true, 'hre',
    'Clashed repeatedly with the papacy and Italian city-states. Led the Third Crusade. https://en.wikipedia.org/wiki/Frederick_Barbarossa'),
  ('monarch-frederick-ii', 'Frederick II', '1220-01-01', '1250-01-01', 1220, 1250, 'Holy Roman Empire', 'emperor', NULL, true, 'hre',
    'Excommunicated multiple times. Led the Sixth Crusade and negotiated control of Jerusalem without battle. https://en.wikipedia.org/wiki/Frederick_II,_Holy_Roman_Emperor'),
  ('monarch-charles-v', 'Charles V', '1519-01-01', '1556-01-01', 1519, 1556, 'Holy Roman Empire', 'emperor', NULL, true, 'hre',
    'Presided over the Diet of Worms (1521) where Luther was declared an outlaw. Ruled during the Protestant Reformation. https://en.wikipedia.org/wiki/Charles_V,_Holy_Roman_Emperor'),

  -- English
  ('monarch-henry-viii', 'Henry VIII', '1509-01-01', '1547-01-01', 1509, 1547, 'England', 'emperor', NULL, true, 'english',
    'Broke from Rome and established the Church of England, making himself Supreme Head of the Church. https://en.wikipedia.org/wiki/Henry_VIII'),
  ('monarch-elizabeth-i', 'Elizabeth I', '1558-01-01', '1603-01-01', 1558, 1603, 'England', 'emperor', NULL, true, 'english',
    'Established the Elizabethan Religious Settlement, creating a moderate Anglican church between Catholic and Protestant extremes. https://en.wikipedia.org/wiki/Elizabeth_I'),
  ('monarch-james-i', 'James I', '1603-01-01', '1625-01-01', 1603, 1625, 'England', 'emperor', NULL, true, 'english',
    'Commissioned the King James Bible (1611), the most influential English translation of Scripture. https://en.wikipedia.org/wiki/James_VI_and_I'),

  -- Spanish
  ('monarch-philip-ii', 'Philip II of Spain', '1556-01-01', '1598-01-01', 1556, 1598, 'Spain', 'emperor', NULL, true, 'spanish',
    'Champion of the Counter-Reformation. Launched the Spanish Armada against Protestant England (1588). https://en.wikipedia.org/wiki/Philip_II_of_Spain'),
  ('monarch-ferdinand-isabella', 'Ferdinand & Isabella', '1474-01-01', '1516-01-01', 1474, 1516, 'Spain', 'emperor', NULL, true, 'spanish',
    'Completed the Reconquista, established the Spanish Inquisition, and sponsored Columbus'' voyages. https://en.wikipedia.org/wiki/Catholic_Monarchs'),

  -- French
  ('monarch-louis-ix', 'Louis IX', '1226-01-01', '1270-01-01', 1226, 1270, 'France', 'emperor', NULL, true, 'french',
    'Canonized as a saint. Led two Crusades and built the Sainte-Chapelle to house Christ''s Crown of Thorns. https://en.wikipedia.org/wiki/Louis_IX'),
  ('monarch-louis-xiv', 'Louis XIV', '1643-01-01', '1715-01-01', 1643, 1715, 'France', 'emperor', NULL, true, 'french',
    'Revoked the Edict of Nantes (1685), ending Protestant rights in France and driving Huguenots into exile. https://en.wikipedia.org/wiki/Louis_XIV'),

  -- Russian
  ('monarch-vladimir-i', 'Vladimir the Great', '0980-01-01', '1015-01-01', 980, 1015, 'Kievan Rus''', 'emperor', NULL, true, 'russian',
    'Grand Prince of Kiev who converted to Orthodox Christianity (988), Christianizing Kievan Rus''. https://en.wikipedia.org/wiki/Vladimir_the_Great')
ON CONFLICT DO NOTHING;


-- ── Add descriptions to existing document events missing them ───────────
-- (Most documents already have descriptions from the enrichment migration.
--  Adding descriptions to any remaining ones and a few additional documents.)

INSERT INTO public."CH_Events" (event_id, name, event_type, event_date, end_date, location, description) VALUES
  ('doc-shepherd-hermas', 'The Shepherd of Hermas', 'document', '0140-01-01', NULL, 'Rome',
    'An early Christian literary work considered scripture by some early church fathers. Contains visions, mandates, and parables. https://en.wikipedia.org/wiki/The_Shepherd_of_Hermas'),
  ('doc-hexapla', 'Origen compiles the Hexapla', 'document', '0240-01-01', NULL, 'Caesarea',
    'A massive critical edition of the Old Testament with six parallel columns of text in Hebrew and Greek. https://en.wikipedia.org/wiki/Hexapla'),
  ('doc-codex-sinaiticus', 'Codex Sinaiticus written', 'document', '0350-01-01', NULL, 'Egypt or Caesarea',
    'One of the oldest and most complete manuscripts of the Christian Bible, containing the earliest complete copy of the New Testament. https://en.wikipedia.org/wiki/Codex_Sinaiticus'),
  ('doc-codex-vaticanus', 'Codex Vaticanus written', 'document', '0325-01-01', NULL, 'Egypt',
    'One of the oldest extant manuscripts of the Greek Bible, housed in the Vatican Library. https://en.wikipedia.org/wiki/Codex_Vaticanus'),
  ('doc-on-incarnation', 'Athanasius writes On the Incarnation', 'document', '0318-01-01', NULL, 'Alexandria',
    'A foundational Christological treatise on why God became man, widely influential in patristic theology. https://en.wikipedia.org/wiki/On_the_Incarnation'),
  ('doc-catechetical-lectures', 'Cyril of Jerusalem delivers the Catechetical Lectures', 'document', '0350-01-01', NULL, 'Jerusalem',
    'A series of instructional lectures for catechumens preparing for baptism, providing a window into 4th-century liturgical practice. https://en.wikipedia.org/wiki/Catechetical_Lectures'),
  ('doc-ecclesiastical-history-eusebius', 'Eusebius writes Ecclesiastical History', 'document', '0324-01-01', NULL, 'Caesarea',
    'The first comprehensive history of the Christian church from the apostolic age to Constantine. https://en.wikipedia.org/wiki/Church_History_(Eusebius)'),
  ('event-edict-thessalonica', 'Edict of Thessalonica', 'event', '0380-01-01', NULL, 'Thessalonica',
    'Theodosius I declared Nicene Christianity the state religion of the Roman Empire. https://en.wikipedia.org/wiki/Edict_of_Thessalonica'),
  ('event-hagia-sophia', 'Hagia Sophia consecrated', 'event', '0537-01-01', NULL, 'Constantinople',
    'Justinian I''s great cathedral, the largest in the world for nearly a millennium. https://en.wikipedia.org/wiki/Hagia_Sophia'),
  ('event-iconoclasm-begins', 'Byzantine Iconoclasm begins', 'event', '0726-01-01', '0843-01-01', 'Eastern Roman Empire',
    'Leo III ordered the destruction of religious images, sparking a theological and political crisis lasting over a century. https://en.wikipedia.org/wiki/Byzantine_iconoclasm'),
  ('event-second-nicaea', 'Second Council of Nicaea', 'council', '0787-01-01', NULL, 'Nicaea',
    'The seventh ecumenical council, which restored the veneration of icons, called by Empress Irene. https://en.wikipedia.org/wiki/Second_Council_of_Nicaea'),
  ('event-investiture-controversy', 'Investiture Controversy', 'event', '1076-01-01', '1122-01-01', 'Holy Roman Empire',
    'A conflict between papacy and empire over the appointment of church officials, resolved by the Concordat of Worms (1122). https://en.wikipedia.org/wiki/Investiture_Controversy'),
  ('event-king-james-bible', 'King James Bible published', 'document', '1611-01-01', NULL, 'England',
    'Commissioned by James I, it became the most widely read English translation of the Bible for centuries. https://en.wikipedia.org/wiki/King_James_Version'),
  ('event-edict-nantes-revoked', 'Revocation of the Edict of Nantes', 'event', '1685-01-01', NULL, 'France',
    'Louis XIV revoked Protestant rights in France, causing mass emigration of Huguenots. https://en.wikipedia.org/wiki/Edict_of_Fontainebleau')
ON CONFLICT DO NOTHING;


commit;
