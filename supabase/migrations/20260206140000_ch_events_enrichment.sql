-- Additional CH_Events: flesh out Points (events and texts) for existing People & Eras.
-- Also update existing events with Wikipedia/Britannica descriptions.
-- Run after 20260131121000_seed_ch_data.sql

begin;

-- ── Update existing events with descriptions and Wikipedia links ────────

UPDATE public."CH_Events" SET description = 'The first ecumenical council, convened by Emperor Constantine. Produced the Nicene Creed and condemned Arianism. https://en.wikipedia.org/wiki/First_Council_of_Nicaea' WHERE event_id = 'council-nicaea';

UPDATE public."CH_Events" SET description = 'Affirmed the Nicene Creed, declared the divinity of the Holy Spirit, and expanded the creed into its present form. https://en.wikipedia.org/wiki/First_Council_of_Constantinople' WHERE event_id = 'council-constantinople-1';

UPDATE public."CH_Events" SET description = 'Condemned Nestorianism and affirmed Mary as Theotokos (God-bearer). Led by Cyril of Alexandria. https://en.wikipedia.org/wiki/Council_of_Ephesus' WHERE event_id = 'council-ephesus';

UPDATE public."CH_Events" SET description = 'Defined the two natures of Christ (divine and human) in one person, rejecting both Nestorianism and Eutychianism. https://en.wikipedia.org/wiki/Council_of_Chalcedon' WHERE event_id = 'council-chalcedon';

UPDATE public."CH_Events" SET description = 'Addressed Adoptionism and the iconoclasm controversy. Charlemagne presided. https://en.wikipedia.org/wiki/Council_of_Frankfurt_(794)' WHERE event_id = 'council-frankfurt';

UPDATE public."CH_Events" SET description = 'One of Paul''s earliest letters, addressing justification by faith and the relationship between Jewish law and the gospel. https://en.wikipedia.org/wiki/Epistle_to_the_Galatians' WHERE event_id = 'doc-galatians';

UPDATE public."CH_Events" SET description = 'Written during Paul''s imprisonment, a letter of joy and encouragement to the church at Philippi. https://en.wikipedia.org/wiki/Epistle_to_the_Philippians' WHERE event_id = 'doc-philippians';

UPDATE public."CH_Events" SET description = 'The earliest of the four canonical Gospels, likely written between 55–75 AD. https://en.wikipedia.org/wiki/Gospel_of_Mark' WHERE event_id = 'doc-mark';

UPDATE public."CH_Events" SET description = 'Letter from Clement, bishop of Rome, to the church in Corinth. One of the earliest extra-biblical Christian texts. https://en.wikipedia.org/wiki/First_Epistle_of_Clement' WHERE event_id = 'doc-clement-epistle';

UPDATE public."CH_Events" SET description = 'An early Christian treatise on ethics, liturgy, and church practice, sometimes called "The Teaching of the Twelve Apostles." https://en.wikipedia.org/wiki/Didache' WHERE event_id = 'doc-didache';

UPDATE public."CH_Events" SET description = 'Rylands Library Papyrus P52, the earliest known fragment of the New Testament, containing a portion of the Gospel of John. https://en.wikipedia.org/wiki/Rylands_Library_Papyrus_P52' WHERE event_id = 'doc-john-fragment';

UPDATE public."CH_Events" SET description = 'Chester Beatty Papyrus P46, one of the oldest manuscripts of Paul''s epistles. https://en.wikipedia.org/wiki/Papyrus_46' WHERE event_id = 'doc-pauline-p46';

UPDATE public."CH_Events" SET description = 'The earliest known list of books considered canonical for the New Testament. https://en.wikipedia.org/wiki/Muratorian_fragment' WHERE event_id = 'doc-muratorian';

UPDATE public."CH_Events" SET description = 'Non-canonical sayings gospel attributed to the apostle Thomas, first mentioned by Origen and Hippolytus. https://en.wikipedia.org/wiki/Gospel_of_Thomas' WHERE event_id = 'doc-thomas-mentioned';

UPDATE public."CH_Events" SET description = 'Athanasius'' 39th Festal Letter, the earliest list matching the modern 27-book New Testament canon. https://en.wikipedia.org/wiki/Athanasius_of_Alexandria#Easter_letter_of_367' WHERE event_id = 'doc-athanasius-canon';

UPDATE public."CH_Events" SET description = 'An illuminated manuscript Gospel book, a masterpiece of Insular art created by Celtic monks. https://en.wikipedia.org/wiki/Book_of_Kells' WHERE event_id = 'doc-book-kells';

UPDATE public."CH_Events" SET description = 'Alaric I and the Visigoths sacked Rome, a shock to the Roman world that prompted Augustine to write The City of God. https://en.wikipedia.org/wiki/Sack_of_Rome_(410)' WHERE event_id = 'event-rome-visigoths';

UPDATE public."CH_Events" SET description = 'Romulus Augustulus, the last Western Roman emperor, was deposed by Odoacer, traditionally marking the end of the Western Empire. https://en.wikipedia.org/wiki/Fall_of_the_Western_Roman_Empire' WHERE event_id = 'event-west-empire-end';

UPDATE public."CH_Events" SET description = 'The formal split between Eastern Orthodox and Roman Catholic churches, precipitated by mutual excommunications between Rome and Constantinople. https://en.wikipedia.org/wiki/East%E2%80%93West_Schism' WHERE event_id = 'event-east-west-schism';

UPDATE public."CH_Events" SET description = 'William the Conqueror''s invasion following the Battle of Hastings, transforming English church and state. https://en.wikipedia.org/wiki/Norman_Conquest' WHERE event_id = 'event-normans-england';

UPDATE public."CH_Events" SET description = 'A series of wars fought by followers of Jan Hus against the Holy Roman Empire and the Catholic Church. https://en.wikipedia.org/wiki/Hussite_Wars' WHERE event_id = 'event-hussite-wars';

UPDATE public."CH_Events" SET description = 'Mehmed II conquered Constantinople, ending the Byzantine Empire and reshaping the Christian world. https://en.wikipedia.org/wiki/Fall_of_Constantinople' WHERE event_id = 'event-ottomans-constantinople';

UPDATE public."CH_Events" SET description = 'Luther defended his writings before Emperor Charles V and refused to recant, declaring "Here I stand." https://en.wikipedia.org/wiki/Diet_of_Worms' WHERE event_id = 'event-diet-worms';

-- ── New events: Apostolic Age (1–100) ───────────────────────────────────

INSERT INTO public."CH_Events" (event_id, name, event_type, event_date, end_date, location, description) VALUES
  ('event-crucifixion', 'Crucifixion of Jesus', 'event', '0033-01-01', NULL, 'Jerusalem',
    'The crucifixion and resurrection of Jesus, the foundational event of Christianity. https://en.wikipedia.org/wiki/Crucifixion_of_Jesus'),
  ('event-pentecost', 'Pentecost', 'event', '0033-06-01', NULL, 'Jerusalem',
    'The descent of the Holy Spirit on the apostles, traditionally considered the birth of the Church. https://en.wikipedia.org/wiki/Pentecost'),
  ('event-council-jerusalem', 'Council of Jerusalem', 'council', '0049-01-01', NULL, 'Jerusalem',
    'The apostles met to settle the question of whether Gentile converts must follow Jewish law. https://en.wikipedia.org/wiki/Council_of_Jerusalem'),
  ('event-fire-rome', 'Great Fire of Rome', 'event', '0064-01-01', NULL, 'Rome',
    'Nero blamed Christians for the fire, beginning the first imperial persecution. https://en.wikipedia.org/wiki/Great_Fire_of_Rome'),
  ('event-temple-destroyed', 'Destruction of the Temple', 'event', '0070-01-01', NULL, 'Jerusalem',
    'The Roman army under Titus destroyed the Second Temple, a watershed for both Judaism and early Christianity. https://en.wikipedia.org/wiki/Siege_of_Jerusalem_(70_CE)')
ON CONFLICT DO NOTHING;

-- ── New events: Ante-Nicene Age (100–325) ───────────────────────────────

INSERT INTO public."CH_Events" (event_id, name, event_type, event_date, end_date, location, description) VALUES
  ('event-decian-persecution', 'Decian Persecution', 'event', '0250-01-01', '0251-01-01', 'Roman Empire',
    'Emperor Decius ordered all citizens to perform sacrifice to Roman gods, triggering widespread persecution of Christians. https://en.wikipedia.org/wiki/Decian_persecution'),
  ('event-diocletian-persecution', 'Great Persecution', 'event', '0303-01-01', '0311-01-01', 'Roman Empire',
    'The last and most severe persecution of Christians in the Roman Empire, under Diocletian and his co-emperors. https://en.wikipedia.org/wiki/Diocletianic_Persecution'),
  ('event-edict-milan', 'Edict of Milan', 'event', '0313-01-01', NULL, 'Milan',
    'Constantine and Licinius proclaimed religious toleration throughout the empire, ending the persecution of Christians. https://en.wikipedia.org/wiki/Edict_of_Milan'),
  ('doc-against-heresies', 'Irenaeus writes Against Heresies', 'document', '0180-01-01', NULL, 'Lyons, Gaul',
    'A foundational work of Christian theology refuting Gnosticism and articulating apostolic tradition. https://en.wikipedia.org/wiki/Against_Heresies_(Irenaeus)'),
  ('doc-on-first-principles', 'Origen writes On First Principles', 'document', '0230-01-01', NULL, 'Alexandria',
    'The first systematic exposition of Christian theology, addressing God, Christ, the Holy Spirit, creation, and scripture. https://en.wikipedia.org/wiki/On_First_Principles')
ON CONFLICT DO NOTHING;

-- ── New events: First Four Councils (325–451) ───────────────────────────

INSERT INTO public."CH_Events" (event_id, name, event_type, event_date, end_date, location, description) VALUES
  ('doc-confessions', 'Augustine writes the Confessions', 'document', '0400-01-01', NULL, 'Hippo Regius',
    'A spiritual autobiography and meditation on sin, grace, and the nature of God — one of the most influential works in Christian literature. https://en.wikipedia.org/wiki/Confessions_(Augustine)'),
  ('doc-city-of-god', 'Augustine writes The City of God', 'document', '0413-01-01', '0426-01-01', 'Hippo Regius',
    'Written in response to the sack of Rome, a monumental work contrasting the earthly city with the City of God. https://en.wikipedia.org/wiki/The_City_of_God'),
  ('doc-vulgate', 'Jerome completes the Vulgate', 'document', '0405-01-01', NULL, 'Bethlehem',
    'Jerome''s Latin translation of the Bible from Hebrew and Greek, which became the standard text of Western Christianity for over a millennium. https://en.wikipedia.org/wiki/Vulgate')
ON CONFLICT DO NOTHING;

-- ── New events: Monks & Missionaries (450–1000) ─────────────────────────

INSERT INTO public."CH_Events" (event_id, name, event_type, event_date, end_date, location, description) VALUES
  ('doc-rule-benedict', 'Rule of Saint Benedict written', 'document', '0530-01-01', NULL, 'Monte Cassino',
    'A guide for monastic life emphasizing prayer, work, and community, which became the foundation of Western monasticism. https://en.wikipedia.org/wiki/Rule_of_Saint_Benedict'),
  ('event-synod-whitby', 'Synod of Whitby', 'council', '0664-01-01', NULL, 'Whitby, England',
    'Resolved differences between Celtic and Roman Christian practices in Northumbria, particularly the dating of Easter. https://en.wikipedia.org/wiki/Synod_of_Whitby'),
  ('doc-bede-history', 'Bede writes Ecclesiastical History', 'document', '0731-01-01', NULL, 'Jarrow, England',
    'The Venerable Bede''s history of the English church and people, a foundational work of English historiography. https://en.wikipedia.org/wiki/Ecclesiastical_History_of_the_English_People'),
  ('event-charlemagne-crowned', 'Coronation of Charlemagne', 'event', '0800-12-25', NULL, 'Rome',
    'Pope Leo III crowned Charlemagne Emperor of the Romans, reviving the Western imperial title and linking church and state. https://en.wikipedia.org/wiki/Coronation_of_Charlemagne')
ON CONFLICT DO NOTHING;

-- ── New events: Cluniac Reforms & Scholastics (950–1300) ────────────────

INSERT INTO public."CH_Events" (event_id, name, event_type, event_date, end_date, location, description) VALUES
  ('event-first-crusade', 'First Crusade', 'event', '1096-01-01', '1099-01-01', 'Holy Land',
    'Called by Pope Urban II, the first military expedition to recapture Jerusalem from Muslim control. https://en.wikipedia.org/wiki/First_Crusade'),
  ('doc-summa-theologica', 'Aquinas writes the Summa Theologica', 'document', '1265-01-01', '1274-01-01', 'Naples, Italy',
    'Thomas Aquinas'' masterwork of systematic theology, synthesizing Aristotelian philosophy with Christian doctrine. https://en.wikipedia.org/wiki/Summa_Theologica'),
  ('doc-divine-comedy', 'Dante writes the Divine Comedy', 'document', '1308-01-01', '1320-01-01', 'Italy',
    'An epic poem journeying through Hell, Purgatory, and Paradise — a landmark of world literature and medieval theology. https://en.wikipedia.org/wiki/Divine_Comedy')
ON CONFLICT DO NOTHING;

-- ── New events: Proto-Reformers & Mystics (1300–1500) ───────────────────

INSERT INTO public."CH_Events" (event_id, name, event_type, event_date, end_date, location, description) VALUES
  ('doc-revelations-julian', 'Julian of Norwich writes Revelations of Divine Love', 'document', '1395-01-01', NULL, 'Norwich, England',
    'The first known book written by a woman in English, recording mystical visions and theological reflections on divine love. https://en.wikipedia.org/wiki/Revelations_of_Divine_Love'),
  ('doc-imitation-christ', 'Thomas a Kempis writes The Imitation of Christ', 'document', '1418-01-01', '1427-01-01', 'Zwolle, Netherlands',
    'One of the most widely read Christian devotional works, emphasizing interior spiritual life and following Christ''s example. https://en.wikipedia.org/wiki/The_Imitation_of_Christ'),
  ('event-printing-press', 'Gutenberg''s printing press', 'event', '1440-01-01', NULL, 'Mainz, Germany',
    'Johannes Gutenberg''s invention of movable type revolutionized the production of books and the spread of ideas, including the Bible. https://en.wikipedia.org/wiki/Printing_press'),
  ('event-spanish-inquisition', 'Spanish Inquisition established', 'event', '1478-01-01', NULL, 'Spain',
    'Established by Ferdinand and Isabella to enforce Catholic orthodoxy, targeting converted Jews and Muslims. https://en.wikipedia.org/wiki/Spanish_Inquisition'),
  ('doc-de-revolutionibus', 'Copernicus writes De Revolutionibus', 'document', '1543-01-01', NULL, 'Frauenburg, Poland',
    'Proposed the heliocentric model of the solar system, challenging the geocentric worldview held by the Church. https://en.wikipedia.org/wiki/De_revolutionibus_orbium_coelestium')
ON CONFLICT DO NOTHING;

-- ── New events: Reformers & Humanists (1500–1650) ───────────────────────

INSERT INTO public."CH_Events" (event_id, name, event_type, event_date, end_date, location, description) VALUES
  ('doc-95-theses', 'Luther posts the 95 Theses', 'document', '1517-10-31', NULL, 'Wittenberg, Germany',
    'Martin Luther''s challenge to the sale of indulgences, traditionally dated to October 31, 1517, sparking the Protestant Reformation. https://en.wikipedia.org/wiki/Ninety-five_Theses'),
  ('event-peace-augsburg', 'Peace of Augsburg', 'event', '1555-01-01', NULL, 'Augsburg, Germany',
    'Established the principle of cuius regio, eius religio — allowing rulers to choose Lutheranism or Catholicism for their territories. https://en.wikipedia.org/wiki/Peace_of_Augsburg'),
  ('event-council-trent', 'Council of Trent', 'council', '1545-01-01', '1563-01-01', 'Trent, Italy',
    'The Catholic Church''s major reforming council in response to the Protestant Reformation, clarifying doctrine and reforming abuses. https://en.wikipedia.org/wiki/Council_of_Trent'),
  ('doc-institutes', 'Calvin writes the Institutes of the Christian Religion', 'document', '1536-01-01', NULL, 'Basel / Geneva',
    'John Calvin''s systematic presentation of Reformed Protestant theology, one of the most influential works of the Reformation. https://en.wikipedia.org/wiki/Institutes_of_the_Christian_Religion'),
  ('event-mayflower', 'Mayflower voyage', 'event', '1620-01-01', NULL, 'Plymouth, Massachusetts',
    'Pilgrim separatists sailed from England and established Plymouth Colony, seeking religious freedom. https://en.wikipedia.org/wiki/Mayflower')
ON CONFLICT DO NOTHING;

-- ── New events: Dissent & Discovery (1650–1800) ─────────────────────────

INSERT INTO public."CH_Events" (event_id, name, event_type, event_date, end_date, location, description) VALUES
  ('doc-pilgrims-progress', 'Bunyan writes The Pilgrim''s Progress', 'document', '1678-01-01', NULL, 'Bedford, England',
    'An allegorical novel of the Christian journey, written in prison, one of the most widely read books in the English language. https://en.wikipedia.org/wiki/The_Pilgrim%27s_Progress')
ON CONFLICT DO NOTHING;

commit;
