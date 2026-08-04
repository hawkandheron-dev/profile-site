-- Seed data for the Heresies & Christological Controversies timeline.
--
-- Adds the heresiarchs, contested figures and defenders that the existing CH_
-- dataset lacks (it had the councils and the orthodox side, but no Arius,
-- Nestorius, Eutyches, Pelagius, Apollinaris, Donatus, Marcion or Montanus),
-- the councils and documents of the controversies, and the movements
-- themselves.
--
-- A note on movement end_year: several of these movements outlived Chalcedon
-- (Manichaeism, Monophysitism, the Semi-Pelagian question). Because this
-- timeline ends at 451, their end_year is clamped to 451 and the description
-- says plainly that they continued past it.
--
-- Run after 20260805100000_ch_movements_schema.sql

begin;

-- ══════════════════════════════════════════════════════════════════════════
-- 1. New people
-- ══════════════════════════════════════════════════════════════════════════

-- ── Heresiarchs and leaders of condemned movements ─────────────────────────

INSERT INTO public."CH_People" (person_id, name, birth_date, death_date, birth_year, death_year, location, role_type, era_id, is_monarch, doctrinal_role, description, reference_url) VALUES
  ('cerinthus', 'Cerinthus', '0050-01-01', '0100-01-01', 50, 100, 'Asia Minor', 'person', 'era-apostolic', false, 'heresiarch',
    'An early gnostic teacher who held that the Christ descended on the man Jesus at his baptism and left him before the crucifixion. Irenaeus reports that John the Apostle wrote against him. https://en.wikipedia.org/wiki/Cerinthus',
    'https://en.wikipedia.org/wiki/Cerinthus'),
  ('basilides', 'Basilides', '0085-01-01', '0145-01-01', 85, 145, 'Alexandria', 'person', 'era-ante-nicene', false, 'heresiarch',
    'Alexandrian gnostic teacher, among the earliest named systematisers of gnostic cosmology. Known chiefly through the refutations of Irenaeus and Hippolytus. https://en.wikipedia.org/wiki/Basilides',
    'https://en.wikipedia.org/wiki/Basilides'),
  ('marcion', 'Marcion of Sinope', '0085-01-01', '0160-01-01', 85, 160, 'Sinope / Rome', 'person', 'era-ante-nicene', false, 'heresiarch',
    'Taught that the God of the Hebrew scriptures was a lesser deity distinct from the Father of Jesus, and produced the first known Christian canon by cutting Luke and ten Pauline letters free of the Old Testament. Excommunicated at Rome in 144. https://en.wikipedia.org/wiki/Marcion_of_Sinope',
    'https://en.wikipedia.org/wiki/Marcion_of_Sinope'),
  ('valentinus', 'Valentinus', '0100-01-01', '0180-01-01', 100, 180, 'Alexandria / Rome', 'person', 'era-ante-nicene', false, 'heresiarch',
    'The most influential gnostic teacher of the second century, who nearly became bishop of Rome. His school prompted Irenaeus'' Against Heresies. https://en.wikipedia.org/wiki/Valentinus_(Gnostic)',
    'https://en.wikipedia.org/wiki/Valentinus_(Gnostic)'),
  ('montanus', 'Montanus', '0135-01-01', '0180-01-01', 135, 180, 'Phrygia', 'person', 'era-ante-nicene', false, 'heresiarch',
    'Founder of the New Prophecy, an ecstatic prophetic movement in Phrygia promising continuing revelation and rigorous discipline. Tertullian joined it late in life. https://en.wikipedia.org/wiki/Montanus',
    'https://en.wikipedia.org/wiki/Montanus'),
  ('sabellius', 'Sabellius', '0180-01-01', '0240-01-01', 180, 240, 'Rome / Libya', 'person', 'era-ante-nicene', false, 'heresiarch',
    'Taught that Father, Son and Spirit are three modes or roles of a single divine person rather than three persons — the position that gave modalism its other name, Sabellianism. https://en.wikipedia.org/wiki/Sabellius',
    'https://en.wikipedia.org/wiki/Sabellius'),
  ('novatian', 'Novatian', '0200-01-01', '0258-01-01', 200, 258, 'Rome', 'person', 'era-ante-nicene', false, 'heresiarch',
    'Roman presbyter and able trinitarian theologian who, holding that those who lapsed under persecution could not be readmitted, was set up as a rival bishop of Rome against Cornelius in 251. https://en.wikipedia.org/wiki/Novatian',
    'https://en.wikipedia.org/wiki/Novatian'),
  ('paul-samosata', 'Paul of Samosata', '0200-01-01', '0275-01-01', 200, 275, 'Antioch', 'person', 'era-ante-nicene', false, 'heresiarch',
    'Bishop of Antioch deposed by the Synod of Antioch in 268 for teaching that Christ was a mere man on whom the Word rested — an adoptionist monarchianism. https://en.wikipedia.org/wiki/Paul_of_Samosata',
    'https://en.wikipedia.org/wiki/Paul_of_Samosata'),
  ('mani', 'Mani', '0216-01-01', '0274-01-01', 216, 274, 'Persia', 'person', 'era-ante-nicene', false, 'heresiarch',
    'Persian prophet whose dualist religion of light and darkness spread across the empire and held the young Augustine for nine years. https://en.wikipedia.org/wiki/Mani_(prophet)',
    'https://en.wikipedia.org/wiki/Mani_(prophet)'),
  ('arius', 'Arius', '0256-01-01', '0336-01-01', 256, 336, 'Alexandria', 'person', 'era-ante-nicene', false, 'heresiarch',
    'Alexandrian presbyter who taught that the Son was a creature, made out of nothing before time — "there was when he was not." Condemned at Nicaea in 325, but the controversy he began ran for another sixty years. https://en.wikipedia.org/wiki/Arius',
    'https://en.wikipedia.org/wiki/Arius'),
  ('donatus-magnus', 'Donatus Magnus', '0270-01-01', '0355-01-01', 270, 355, 'Carthage', 'person', 'era-ante-nicene', false, 'heresiarch',
    'Leader of the North African party that refused communion with bishops who had handed over the scriptures during the Great Persecution, holding that sacraments administered by traitors were void. https://en.wikipedia.org/wiki/Donatus_Magnus',
    'https://en.wikipedia.org/wiki/Donatus_Magnus'),
  ('eusebius-nicomedia', 'Eusebius of Nicomedia', '0280-01-01', '0341-01-01', 280, 341, 'Nicomedia / Constantinople', 'person', 'era-ante-nicene', false, 'heresiarch',
    'The most effective political patron of the Arian cause: he signed at Nicaea under protest, engineered Athanasius'' exiles, and baptised Constantine on his deathbed. https://en.wikipedia.org/wiki/Eusebius_of_Nicomedia',
    'https://en.wikipedia.org/wiki/Eusebius_of_Nicomedia'),
  ('macedonius-i', 'Macedonius I of Constantinople', '0300-01-01', '0360-01-01', 300, 360, 'Constantinople', 'person', 'era-first-four-councils', false, 'heresiarch',
    'Bishop of Constantinople whose name was attached to the Pneumatomachi, the "Spirit-fighters" who accepted the Son''s divinity but denied that of the Holy Spirit. https://en.wikipedia.org/wiki/Macedonius_I_of_Constantinople',
    'https://en.wikipedia.org/wiki/Macedonius_I_of_Constantinople'),
  ('apollinaris-laodicea', 'Apollinaris of Laodicea', '0310-01-01', '0390-01-01', 310, 390, 'Laodicea, Syria', 'person', 'era-first-four-councils', false, 'heresiarch',
    'A staunch ally of Athanasius against Arianism who then taught that in Christ the divine Word replaced the human rational soul — the first great error about the humanity rather than the divinity of Christ. Condemned at Constantinople in 381. https://en.wikipedia.org/wiki/Apollinaris_of_Laodicea',
    'https://en.wikipedia.org/wiki/Apollinaris_of_Laodicea'),
  ('aetius-antioch', 'Aetius of Antioch', '0313-01-01', '0367-01-01', 313, 367, 'Antioch', 'person', 'era-first-four-councils', false, 'heresiarch',
    'Founder of the Anomoean or neo-Arian party, which held that the Son is unlike (anomoios) the Father in substance — the most radical form the Arian case took. https://en.wikipedia.org/wiki/Aetius_of_Antioch',
    'https://en.wikipedia.org/wiki/Aetius_of_Antioch'),
  ('eunomius', 'Eunomius of Cyzicus', '0335-01-01', '0393-01-01', 335, 393, 'Cyzicus / Cappadocia', 'person', 'era-first-four-councils', false, 'heresiarch',
    'Pupil of Aetius and the ablest neo-Arian controversialist, who argued that the divine essence is fully comprehensible and that "unbegotten" defines it. Basil and Gregory of Nyssa each wrote books against him. https://en.wikipedia.org/wiki/Eunomius_of_Cyzicus',
    'https://en.wikipedia.org/wiki/Eunomius_of_Cyzicus'),
  ('priscillian', 'Priscillian', '0340-01-01', '0385-01-01', 340, 385, 'Ávila, Hispania', 'person', 'era-first-four-councils', false, 'heresiarch',
    'Ascetic bishop of Ávila executed at Trier in 385 — the first person put to death by the state for heresy, a precedent Ambrose and Martin of Tours both protested. https://en.wikipedia.org/wiki/Priscillian',
    'https://en.wikipedia.org/wiki/Priscillian'),
  ('pelagius', 'Pelagius', '0354-01-01', '0418-01-01', 354, 418, 'Britain / Rome / Palestine', 'person', 'era-first-four-councils', false, 'heresiarch',
    'British ascetic who taught that human beings can keep God''s commandments by their created powers, denying that Adam''s sin corrupted his descendants. His long duel with Augustine set the Western doctrine of grace. https://en.wikipedia.org/wiki/Pelagius',
    'https://en.wikipedia.org/wiki/Pelagius'),
  ('celestius', 'Celestius', '0370-01-01', '0430-01-01', 370, 430, 'Carthage / Rome', 'person', 'era-first-four-councils', false, 'heresiarch',
    'Pelagius'' most forthright disciple, whose denial of original sin and of infant baptism for the remission of sin brought the controversy into the open at Carthage in 411. https://en.wikipedia.org/wiki/Caelestius',
    'https://en.wikipedia.org/wiki/Caelestius'),
  ('eutyches', 'Eutyches', '0380-01-01', '0456-01-01', 380, 456, 'Constantinople', 'person', 'era-first-four-councils', false, 'heresiarch',
    'Archimandrite of a monastery near Constantinople who, pressing Cyril''s language past its limit, held that after the union Christ had one nature — "not consubstantial with us." Condemned by Flavian in 448 and at Chalcedon in 451. https://en.wikipedia.org/wiki/Eutyches',
    'https://en.wikipedia.org/wiki/Eutyches'),
  ('nestorius', 'Nestorius', '0386-01-01', '0450-01-01', 386, 450, 'Constantinople / Egypt', 'person', 'era-first-four-councils', false, 'heresiarch',
    'Patriarch of Constantinople who objected to calling Mary Theotokos, God-bearer, and was understood to divide Christ into two subjects. Condemned at Ephesus in 431 and exiled to the Egyptian desert. https://en.wikipedia.org/wiki/Nestorius',
    'https://en.wikipedia.org/wiki/Nestorius'),
  ('dioscorus-alexandria', 'Dioscorus of Alexandria', '0390-01-01', '0454-01-01', 390, 454, 'Alexandria', 'person', 'era-first-four-councils', false, 'heresiarch',
    'Cyril''s successor at Alexandria, who rehabilitated Eutyches and presided over the Second Council of Ephesus in 449 — the "Robber Synod" — and was deposed at Chalcedon two years later. https://en.wikipedia.org/wiki/Pope_Dioscorus_I_of_Alexandria',
    'https://en.wikipedia.org/wiki/Pope_Dioscorus_I_of_Alexandria'),
  ('julian-eclanum', 'Julian of Eclanum', '0386-01-01', '0455-01-01', 386, 455, 'Eclanum, Italy', 'person', 'era-first-four-councils', false, 'heresiarch',
    'The last and most formidable Pelagian, an Italian bishop who refused to sign the condemnation of 418 and argued against Augustine on nature and grace for the rest of Augustine''s life. https://en.wikipedia.org/wiki/Julian_of_Eclanum',
    'https://en.wikipedia.org/wiki/Julian_of_Eclanum')
ON CONFLICT DO NOTHING;

-- ── Contested figures: orthodox in intent, condemned or suspect in part ─────

INSERT INTO public."CH_People" (person_id, name, birth_date, death_date, birth_year, death_year, location, role_type, era_id, is_monarch, doctrinal_role, description, reference_url) VALUES
  ('eusebius-caesarea', 'Eusebius of Caesarea', '0260-01-01', '0339-01-01', 260, 339, 'Caesarea', 'person', 'era-ante-nicene', false, 'contested',
    'The first church historian, and a subordinationist who was provisionally excommunicated before Nicaea and signed the creed with evident reluctance. Indispensable as a source, unreliable as a witness to his own party. https://en.wikipedia.org/wiki/Eusebius',
    'https://en.wikipedia.org/wiki/Eusebius'),
  ('marcellus-ancyra', 'Marcellus of Ancyra', '0285-01-01', '0374-01-01', 285, 374, 'Ancyra, Galatia', 'person', 'era-ante-nicene', false, 'contested',
    'An uncompromising anti-Arian whose defence of the Son''s full deity ran so close to modalism that his allies in the East abandoned him, while Rome and Athanasius kept him in communion. https://en.wikipedia.org/wiki/Marcellus_of_Ancyra',
    'https://en.wikipedia.org/wiki/Marcellus_of_Ancyra'),
  ('theodore-mopsuestia', 'Theodore of Mopsuestia', '0350-01-01', '0428-01-01', 350, 428, 'Mopsuestia, Cilicia', 'person', 'era-first-four-councils', false, 'contested',
    'The greatest exegete of the Antiochene school and Nestorius'' teacher. He died in the peace of the church; his christology was condemned at Constantinople in 553, a century later. https://en.wikipedia.org/wiki/Theodore_of_Mopsuestia',
    'https://en.wikipedia.org/wiki/Theodore_of_Mopsuestia'),
  ('theodoret-cyrus', 'Theodoret of Cyrus', '0393-01-01', '0458-01-01', 393, 458, 'Cyrrhus, Syria', 'person', 'era-first-four-councils', false, 'contested',
    'Antiochene theologian who wrote against Cyril''s Twelve Anathemas and defended Nestorius, was deposed at the Robber Synod, and was restored at Chalcedon only after anathematising Nestorius aloud. https://en.wikipedia.org/wiki/Theodoret',
    'https://en.wikipedia.org/wiki/Theodoret'),
  ('john-cassian', 'John Cassian', '0360-01-01', '0435-01-01', 360, 435, 'Marseille, Gaul', 'person', 'era-first-four-councils', false, 'contested',
    'Brought Egyptian monasticism to the West. His thirteenth Conference, resisting Augustine''s account of predestination while rejecting Pelagius, is the founding text of what later writers called semi-Pelagianism. https://en.wikipedia.org/wiki/John_Cassian',
    'https://en.wikipedia.org/wiki/John_Cassian')
ON CONFLICT DO NOTHING;

-- ── Defenders not yet in the dataset ───────────────────────────────────────

INSERT INTO public."CH_People" (person_id, name, birth_date, death_date, birth_year, death_year, location, role_type, era_id, is_monarch, doctrinal_role, description, reference_url) VALUES
  ('ossius-cordoba', 'Ossius of Córdoba', '0256-01-01', '0359-01-01', 256, 359, 'Córdoba, Hispania', 'person', 'era-ante-nicene', false, 'defender',
    'Constantine''s ecclesiastical adviser, who presided at Nicaea and is widely credited with pressing the word homoousios into the creed. Broken at the very end by Constantius II, aged over a hundred. https://en.wikipedia.org/wiki/Hosius_of_Corduba',
    'https://en.wikipedia.org/wiki/Hosius_of_Corduba'),
  ('hilary-poitiers', 'Hilary of Poitiers', '0310-01-01', '0367-01-01', 310, 367, 'Poitiers, Gaul', 'person', 'era-first-four-councils', false, 'defender',
    'Called the Athanasius of the West. Exiled to Phrygia by Constantius II, he learned the Greek debate at first hand and brought Nicene theology back into Latin in his De Trinitate. https://en.wikipedia.org/wiki/Hilary_of_Poitiers',
    'https://en.wikipedia.org/wiki/Hilary_of_Poitiers'),
  ('cyril-jerusalem', 'Cyril of Jerusalem', '0313-01-01', '0386-01-01', 313, 386, 'Jerusalem', 'person', 'era-first-four-councils', false, 'defender',
    'Bishop of Jerusalem, thrice exiled in the Arian struggle, whose Catechetical Lectures are the fullest surviving account of how the fourth-century church taught the faith to converts. https://en.wikipedia.org/wiki/Cyril_of_Jerusalem',
    'https://en.wikipedia.org/wiki/Cyril_of_Jerusalem'),
  ('epiphanius-salamis', 'Epiphanius of Salamis', '0310-01-01', '0403-01-01', 310, 403, 'Salamis, Cyprus', 'person', 'era-first-four-councils', false, 'defender',
    'Heresy-hunter of the fourth century, whose Panarion — the "medicine chest" — catalogues eighty heresies and preserves large quotations from works otherwise lost. https://en.wikipedia.org/wiki/Epiphanius_of_Salamis',
    'https://en.wikipedia.org/wiki/Epiphanius_of_Salamis'),
  ('pope-celestine-1', 'Pope Celestine I', '0376-01-01', '0432-01-01', 376, 432, 'Rome', 'person', 'era-first-four-councils', false, 'defender',
    'Bishop of Rome who condemned Nestorius at a Roman synod in 430 and commissioned Cyril of Alexandria to execute the sentence, making Ephesus possible. https://en.wikipedia.org/wiki/Pope_Celestine_I',
    'https://en.wikipedia.org/wiki/Pope_Celestine_I')
ON CONFLICT DO NOTHING;

-- ══════════════════════════════════════════════════════════════════════════
-- 2. Doctrinal roles
-- ══════════════════════════════════════════════════════════════════════════
-- These cover the people inserted above as well as those already in the
-- dataset. The inserts use ON CONFLICT DO NOTHING, so a row that happens to
-- exist already would never pick up the doctrinal_role carried on the INSERT;
-- assigning every role here instead makes the migration converge on the right
-- answer whatever state it starts from.

-- ── Defenders ──────────────────────────────────────────────────────────────

UPDATE public."CH_People" SET doctrinal_role = 'defender'
WHERE person_id IN (
  -- added by this migration
  'ossius-cordoba', 'hilary-poitiers', 'cyril-jerusalem', 'epiphanius-salamis',
  'pope-celestine-1',
  -- already in the dataset
  'peter', 'paul', 'john-evangelist',
  'ignatius-antioch', 'polycarp', 'justin-martyr', 'irenaeus', 'hippolytus',
  'pope-cornelius', 'cyprian', 'dionysius-alexandria',
  'alexander-alexandria', 'athanasius',
  'basil-great', 'gregory-nazianzus', 'gregory-nyssa',
  'ambrose-milan', 'jerome', 'augustine', 'john-chrysostom',
  'cyril-alexandria', 'flavian-constantinople', 'pope-leo-1',
  'prosper-aquitaine'
);

-- Origen never received a reference_url: 20260206180000_ch_reference_urls.sql
-- targeted person_id 'origin', but the row is 'origen', so that UPDATE matched
-- nothing. He is central to the Origenist controversy here, so fix it.
UPDATE public."CH_People"
SET reference_url = 'https://en.wikipedia.org/wiki/Origen'
WHERE person_id = 'origen' AND reference_url IS NULL;

-- ── Heresiarchs ────────────────────────────────────────────────────────────

UPDATE public."CH_People" SET doctrinal_role = 'heresiarch'
WHERE person_id IN (
  'cerinthus', 'basilides', 'marcion', 'valentinus', 'montanus', 'sabellius',
  'novatian', 'paul-samosata', 'mani', 'arius', 'donatus-magnus',
  'eusebius-nicomedia', 'macedonius-i', 'apollinaris-laodicea',
  'aetius-antioch', 'eunomius', 'priscillian', 'pelagius', 'celestius',
  'eutyches', 'nestorius', 'dioscorus-alexandria', 'julian-eclanum'
);

-- ── Contested ──────────────────────────────────────────────────────────────

UPDATE public."CH_People" SET doctrinal_role = 'contested'
WHERE person_id IN (
  -- added by this migration
  'eusebius-caesarea',    -- subordinationist; signed Nicaea reluctantly
  'marcellus-ancyra',     -- anti-Arian to the point of modalism
  'theodore-mopsuestia',  -- died in communion, condemned in 553
  'theodoret-cyrus',      -- restored at Chalcedon after anathematising Nestorius
  'john-cassian',         -- Conference XIII, the semi-Pelagian founding text
  -- already in the dataset
  'tatians',        -- drifted into Encratism after Justin's death
  'tertullian',     -- joined the New Prophecy
  'origen',         -- condemned posthumously
  'didymus-blind',  -- condemned with Origen in 553
  'faustus-riez',   -- the leading semi-Pelagian voice in Gaul
  'lucidus'         -- recanted an extreme predestinarianism at Arles
);

-- ── Emperors: pagan / persecuting ──────────────────────────────────────────

UPDATE public."CH_People" SET doctrinal_role = 'emperor-pagan'
WHERE person_id IN (
  'roman-claudius', 'roman-nero', 'roman-galba-otho-vitellius', 'roman-vespasian',
  'roman-titus', 'roman-domitian', 'roman-nerva', 'roman-trajan', 'roman-hadrian',
  'roman-antoninus', 'roman-marcus-aurelius', 'roman-commodus',
  'roman-septimius-severus', 'roman-caracalla', 'roman-alexander-severus',
  'roman-maximinus-thrax', 'roman-philip-arab', 'roman-decius', 'roman-valerian',
  'roman-gallienus', 'roman-aurelian', 'roman-diocletian-maximian',
  'roman-caligula', 'roman-julian'
);

-- ── Emperors: Nicene Christian ─────────────────────────────────────────────

UPDATE public."CH_People" SET doctrinal_role = 'emperor-christian'
WHERE person_id IN (
  'roman-constantine', 'roman-theodosius-i', 'eastern-arcadius',
  'eastern-theodosius-ii', 'western-honorius', 'western-valentinian-iii',
  'eastern-marcian', 'eastern-leo-i'
);

-- ── Emperors: backed the Arian or Homoian party ────────────────────────────

UPDATE public."CH_People" SET doctrinal_role = 'emperor-arianizing'
WHERE person_id IN ('roman-constantius-ii', 'roman-valens');

-- ══════════════════════════════════════════════════════════════════════════
-- 3. New councils and documents
-- ══════════════════════════════════════════════════════════════════════════

INSERT INTO public."CH_Events" (event_id, name, event_type, event_date, end_date, location, description, reference_url) VALUES
  ('council-antioch-268', 'Synod of Antioch', 'council', '0268-01-01', NULL, 'Antioch',
    'Deposed Paul of Samosata for adoptionism. The synod rejected the word homoousios in the sense Paul gave it — a fact the Arian party would use against Nicaea sixty years later. https://en.wikipedia.org/wiki/Synods_of_Antioch',
    'https://en.wikipedia.org/wiki/Synods_of_Antioch'),
  ('council-arles-314', 'Council of Arles', 'council', '0314-01-01', NULL, 'Arles, Gaul',
    'Convened by Constantine to settle the Donatist appeal. It upheld the validity of sacraments administered by unworthy ministers and ruled against the Donatists, who refused the verdict. https://en.wikipedia.org/wiki/Council_of_Arles',
    'https://en.wikipedia.org/wiki/Council_of_Arles'),
  ('council-antioch-341', 'Council of Antioch (the Dedication Council)', 'council', '0341-01-01', NULL, 'Antioch',
    'Ninety-seven Eastern bishops issued creeds avoiding homoousios and confirmed the deposition of Athanasius — the opening move of the long Eastern reaction against Nicaea. https://en.wikipedia.org/wiki/Synods_of_Antioch',
    'https://en.wikipedia.org/wiki/Synods_of_Antioch'),
  ('council-serdica-343', 'Council of Serdica', 'council', '0343-01-01', NULL, 'Serdica',
    'Called to reunite East and West, it split before it began: the Eastern bishops withdrew and the two halves excommunicated each other. The first clear rupture between the Nicene West and the Eusebian East. https://en.wikipedia.org/wiki/Council_of_Serdica',
    'https://en.wikipedia.org/wiki/Council_of_Serdica'),
  ('council-ariminum-seleucia-359', 'Councils of Ariminum and Seleucia', 'council', '0359-01-01', NULL, 'Ariminum & Seleucia',
    'Constantius II split the episcopate into two assemblies and pressed a Homoian formula on both. "The whole world groaned and was astonished to find itself Arian," wrote Jerome of the result. https://en.wikipedia.org/wiki/Council_of_Rimini',
    'https://en.wikipedia.org/wiki/Council_of_Rimini'),
  ('council-alexandria-362', 'Synod of Alexandria', 'council', '0362-01-01', NULL, 'Alexandria',
    'Athanasius, back from his third exile, offered terms to the moderate Homoiousians and settled the language of three hypostaseis in one ousia — the formula that made the settlement of 381 possible. https://en.wikipedia.org/wiki/Council_of_Alexandria',
    'https://en.wikipedia.org/wiki/Council_of_Alexandria'),
  ('council-carthage-418', 'Council of Carthage', 'council', '0418-01-01', NULL, 'Carthage',
    'Two hundred African bishops condemned Pelagius and Celestius in nine canons on original sin and grace. Pope Zosimus, who had just cleared them, reversed himself and confirmed the sentence. https://en.wikipedia.org/wiki/Council_of_Carthage',
    'https://en.wikipedia.org/wiki/Council_of_Carthage'),
  ('council-ephesus-ii-449', 'Second Council of Ephesus (the Robber Synod)', 'council', '0449-01-01', NULL, 'Ephesus',
    'Dioscorus of Alexandria rehabilitated Eutyches, deposed Flavian and refused to let the Tome of Leo be read. Leo called it a latrocinium, a gang of robbers, and no church has ever counted it ecumenical. https://en.wikipedia.org/wiki/Second_Council_of_Ephesus',
    'https://en.wikipedia.org/wiki/Second_Council_of_Ephesus'),
  ('doc-thalia', 'Arius writes the Thalia', 'document', '0320-01-01', NULL, 'Alexandria',
    'Arius'' verse popularisation of his teaching, written to be sung. It survives only in the quotations Athanasius made in order to refute it. https://en.wikipedia.org/wiki/Thalia_(Arius)',
    'https://en.wikipedia.org/wiki/Thalia_(Arius)'),
  ('doc-nicene-creed', 'The Nicene Creed', 'document', '0325-01-01', NULL, 'Nicaea',
    'The creed of the 318 fathers, which confessed the Son homoousios — of one substance with the Father — and appended anathemas naming the Arian slogans directly. https://en.wikipedia.org/wiki/Nicene_Creed',
    'https://en.wikipedia.org/wiki/Nicene_Creed'),
  ('doc-de-trinitate-hilary', 'Hilary writes De Trinitate', 'document', '0360-01-01', NULL, 'Phrygia / Poitiers',
    'Twelve books written in exile, the first full-scale Latin defence of Nicene trinitarianism and the channel through which the Greek debate reached the West. https://en.wikipedia.org/wiki/De_Trinitate_(Hilary)',
    'https://en.wikipedia.org/wiki/De_Trinitate_(Hilary)'),
  ('doc-panarion', 'Epiphanius writes the Panarion', 'document', '0375-01-01', '0378-01-01', 'Salamis, Cyprus',
    'The "medicine chest against heresies": eighty entries from the Stoics to the Arians, quoting at length from works that survive nowhere else. https://en.wikipedia.org/wiki/Panarion',
    'https://en.wikipedia.org/wiki/Panarion'),
  ('doc-niceno-constantinopolitan-creed', 'The Niceno-Constantinopolitan Creed', 'document', '0381-01-01', NULL, 'Constantinople',
    'The expanded creed of 381, which added the clauses on the Holy Spirit — "the Lord and giver of life, who proceeds from the Father" — against the Pneumatomachi. This is the creed recited in churches today. https://en.wikipedia.org/wiki/Nicene_Creed',
    'https://en.wikipedia.org/wiki/Nicene_Creed'),
  ('doc-twelve-anathemas', 'Cyril''s Twelve Anathemas', 'document', '0430-01-01', NULL, 'Alexandria',
    'Appended to Cyril''s third letter to Nestorius, twelve propositions each ending "let him be anathema." Their uncompromising language won at Ephesus and troubled the Antiochenes for twenty years. https://en.wikipedia.org/wiki/Cyril_of_Alexandria',
    'https://www.newadvent.org/fathers/3810.htm'),
  ('doc-formula-reunion', 'The Formula of Reunion', 'document', '0433-01-01', NULL, 'Antioch / Alexandria',
    'The concordat that ended the schism after Ephesus: Cyril accepted a confession of two natures drafted at Antioch, and John of Antioch accepted the condemnation of Nestorius. https://en.wikipedia.org/wiki/Formula_of_Reunion',
    'https://en.wikipedia.org/wiki/Formula_of_Reunion'),
  ('doc-tome-of-leo', 'The Tome of Leo', 'document', '0449-06-13', NULL, 'Rome',
    'Leo''s letter to Flavian, setting out the two natures in one person with Latin precision. Refused a reading at the Robber Synod, it was acclaimed at Chalcedon: "Peter has spoken through Leo." https://en.wikipedia.org/wiki/Tome_of_Leo',
    'https://en.wikipedia.org/wiki/Tome_of_Leo'),
  ('doc-chalcedonian-definition', 'The Chalcedonian Definition', 'document', '0451-01-01', NULL, 'Chalcedon',
    'One person in two natures, "without confusion, without change, without division, without separation" — the four adverbs that fence off Nestorius on one side and Eutyches on the other. https://en.wikipedia.org/wiki/Chalcedonian_Definition',
    'https://en.wikipedia.org/wiki/Chalcedonian_Definition')
ON CONFLICT DO NOTHING;

-- ══════════════════════════════════════════════════════════════════════════
-- 4. Movements
-- ══════════════════════════════════════════════════════════════════════════

INSERT INTO public."CH_Movements" (movement_id, name, kind, start_year, end_year, color, description, reference_url) VALUES
  ('mov-judaizers', 'The Judaizing Controversy', 'controversy', 48, 70, '#8d6e63',
    'Whether Gentile converts must be circumcised and keep the law of Moses. Fought out in Galatians and settled at the Council of Jerusalem in 49 — the church''s first doctrinal dispute and the template for every one after it. https://en.wikipedia.org/wiki/Judaizers',
    'https://en.wikipedia.org/wiki/Judaizers'),
  ('mov-docetism', 'Docetism', 'heresy', 70, 200, '#90a4ae',
    'That Christ only seemed to have a body and only seemed to suffer. The oldest christological error, already resisted in 1 John and attacked relentlessly by Ignatius on his way to martyrdom. https://en.wikipedia.org/wiki/Docetism',
    'https://en.wikipedia.org/wiki/Docetism'),
  ('mov-gnosticism', 'Gnosticism', 'heresy', 100, 200, '#6a1b9a',
    'A family of systems teaching salvation by secret knowledge, a flawed creator god, and a spiritual elite. The threat that forced the church to define canon, creed and apostolic succession. https://en.wikipedia.org/wiki/Gnosticism',
    'https://en.wikipedia.org/wiki/Gnosticism'),
  ('mov-marcionism', 'Marcionism', 'heresy', 144, 400, '#ad1457',
    'Marcion''s rejection of the Old Testament and its God, with a pruned canon of Luke and Paul. Marcionite churches persisted in the East into the fifth century. https://en.wikipedia.org/wiki/Marcionism',
    'https://en.wikipedia.org/wiki/Marcionism'),
  ('mov-montanism', 'Montanism (the New Prophecy)', 'heresy', 170, 400, '#00838f',
    'Ecstatic prophecy, imminent expectation and severe discipline, spreading from Phrygia across the empire. Condemned less for doctrine than for claiming a revelation that outranked the church''s. https://en.wikipedia.org/wiki/Montanism',
    'https://en.wikipedia.org/wiki/Montanism'),
  ('mov-monarchianism', 'Monarchianism and Modalism', 'heresy', 190, 270, '#4527a0',
    'Two attempts to protect the oneness of God: adoptionism, making Christ a man raised to divine status, and modalism, making Father and Son two masks of one person. Both deny a real distinction in God. https://en.wikipedia.org/wiki/Monarchianism',
    'https://en.wikipedia.org/wiki/Monarchianism'),
  ('mov-manichaeism', 'Manichaeism', 'heresy', 240, 451, '#37474f',
    'Mani''s dualist religion of two eternal principles, light and dark. It held Augustine for nine years, and outlasted this period by centuries — surviving in Central Asia into the fourteenth. https://en.wikipedia.org/wiki/Manichaeism',
    'https://en.wikipedia.org/wiki/Manichaeism'),
  ('mov-novatianism', 'The Novatianist Schism', 'schism', 251, 400, '#5d4037',
    'A rigorist breach at Rome over whether Christians who lapsed under persecution could ever be readmitted. Novatian said never; Cornelius and Cyprian said the church holds the keys. https://en.wikipedia.org/wiki/Novatianism',
    'https://en.wikipedia.org/wiki/Novatianism'),
  ('mov-donatism', 'The Donatist Schism', 'schism', 311, 411, '#bf360c',
    'The same question in North Africa, and far larger: are sacraments given by a bishop who betrayed the scriptures valid at all? Augustine''s answer — that they belong to Christ, not the minister — settled Western sacramental theology. https://en.wikipedia.org/wiki/Donatism',
    'https://en.wikipedia.org/wiki/Donatism'),
  ('mov-arianism', 'Arianism', 'heresy', 318, 381, '#c62828',
    'That the Son is the first and greatest of creatures, made out of nothing, not eternal. The central crisis of the fourth century, condemned at Nicaea in 325 and not actually settled until Constantinople in 381. https://en.wikipedia.org/wiki/Arianism',
    'https://en.wikipedia.org/wiki/Arianism'),
  ('mov-homoian', 'The Homoian settlement and the Arian reaction', 'controversy', 341, 381, '#ef6c00',
    'The long middle of the Arian crisis: imperial pressure for creeds saying only that the Son is "like" the Father, the exiles of Athanasius and Hilary, and the slow convergence of the Homoiousian moderates on Nicaea. https://en.wikipedia.org/wiki/Homoian',
    'https://en.wikipedia.org/wiki/Arian_controversy'),
  ('mov-apollinarianism', 'Apollinarianism', 'heresy', 360, 381, '#7b1fa2',
    'That the divine Word took the place of Christ''s human mind. Gregory of Nazianzus'' reply became the rule for everything after: "that which he has not assumed he has not healed." https://en.wikipedia.org/wiki/Apollinarism',
    'https://en.wikipedia.org/wiki/Apollinarism'),
  ('mov-pneumatomachianism', 'Pneumatomachianism (Macedonianism)', 'heresy', 360, 381, '#00695c',
    'The "Spirit-fighters," who conceded the Son''s divinity but denied the Spirit''s. Answered by Basil''s On the Holy Spirit and shut out by the third article of the creed of 381. https://en.wikipedia.org/wiki/Pneumatomachi',
    'https://en.wikipedia.org/wiki/Pneumatomachi'),
  ('mov-priscillianism', 'Priscillianism', 'heresy', 375, 400, '#6d4c41',
    'An ascetic movement in Hispania accused of gnostic and Manichaean leanings. Its importance is less doctrinal than constitutional: its leader''s execution in 385 was the first time the state killed for heresy. https://en.wikipedia.org/wiki/Priscillianism',
    'https://en.wikipedia.org/wiki/Priscillianism'),
  ('mov-antiochene-alexandrian', 'The Antiochene and Alexandrian schools', 'school', 360, 451, '#455a64',
    'Not a heresy but the fault line under all of them: Antioch guarding the full humanity of Christ and reading scripture literally, Alexandria guarding the unity of his person and reading it allegorically. Ephesus and Chalcedon are this argument reaching judgement. https://en.wikipedia.org/wiki/Antiochene_Rite',
    'https://en.wikipedia.org/wiki/School_of_Antioch'),
  ('mov-origenism', 'The Origenist Controversy', 'controversy', 393, 451, '#558b2f',
    'A bitter fight over the orthodoxy of a man dead 140 years — the pre-existence of souls, universal restoration, the resurrection body. It broke the friendship of Jerome and Rufinus and cost John Chrysostom his see. https://en.wikipedia.org/wiki/Origenist_crises',
    'https://en.wikipedia.org/wiki/Origenist_crises'),
  ('mov-pelagianism', 'Pelagianism', 'heresy', 411, 431, '#1565c0',
    'That human nature was not corrupted by Adam''s fall and can choose the good unaided. Condemned at Carthage in 418 and again at Ephesus in 431; the controversy produced Augustine''s mature doctrine of grace. https://en.wikipedia.org/wiki/Pelagianism',
    'https://en.wikipedia.org/wiki/Pelagianism'),
  ('mov-nestorianism', 'Nestorianism', 'heresy', 428, 431, '#00acc1',
    'That the divine and human in Christ are so distinct as to be two subjects, so that Mary bore the man and not God. Condemned at Ephesus in 431, where Theotokos was affirmed. https://en.wikipedia.org/wiki/Nestorianism',
    'https://en.wikipedia.org/wiki/Nestorianism'),
  ('mov-semipelagianism', 'The Semi-Pelagian Controversy', 'controversy', 426, 451, '#0277bd',
    'The monks of Gaul, rejecting Pelagius but unwilling to follow Augustine on predestination, held that the first movement towards God may be the creature''s own. Unsettled at Chalcedon; decided against them at Orange in 529. https://en.wikipedia.org/wiki/Semi-Pelagianism',
    'https://en.wikipedia.org/wiki/Semi-Pelagianism'),
  ('mov-eutychianism', 'Eutychianism and the Monophysite Controversy', 'heresy', 448, 451, '#d81b60',
    'That after the union Christ has one nature, his humanity absorbed into his divinity. Condemned at Chalcedon in 451 — a verdict that split the churches of Egypt, Syria and Armenia from Rome and Constantinople permanently. https://en.wikipedia.org/wiki/Monophysitism',
    'https://en.wikipedia.org/wiki/Monophysitism')
ON CONFLICT DO NOTHING;

-- ══════════════════════════════════════════════════════════════════════════
-- 5. Movement ↔ figure links
-- ══════════════════════════════════════════════════════════════════════════

INSERT INTO public."CH_Movement_Figures" (movement_id, person_id, role) VALUES
  ('mov-judaizers', 'paul', 'opponent'),
  ('mov-judaizers', 'peter', 'opponent'),

  ('mov-docetism', 'cerinthus', 'founder'),
  ('mov-docetism', 'john-evangelist', 'opponent'),
  ('mov-docetism', 'ignatius-antioch', 'opponent'),
  ('mov-docetism', 'irenaeus', 'opponent'),

  ('mov-gnosticism', 'valentinus', 'founder'),
  ('mov-gnosticism', 'basilides', 'founder'),
  ('mov-gnosticism', 'irenaeus', 'opponent'),
  ('mov-gnosticism', 'hippolytus', 'opponent'),
  ('mov-gnosticism', 'tertullian', 'opponent'),
  ('mov-gnosticism', 'clement-alexandria', 'opponent'),
  ('mov-gnosticism', 'origen', 'opponent'),

  ('mov-marcionism', 'marcion', 'founder'),
  ('mov-marcionism', 'polycarp', 'opponent'),
  ('mov-marcionism', 'tertullian', 'opponent'),
  ('mov-marcionism', 'irenaeus', 'opponent'),
  ('mov-marcionism', 'justin-martyr', 'opponent'),

  ('mov-montanism', 'montanus', 'founder'),
  ('mov-montanism', 'tertullian', 'proponent'),
  ('mov-montanism', 'hippolytus', 'opponent'),

  ('mov-monarchianism', 'sabellius', 'founder'),
  ('mov-monarchianism', 'paul-samosata', 'proponent'),
  ('mov-monarchianism', 'hippolytus', 'opponent'),
  ('mov-monarchianism', 'tertullian', 'opponent'),
  ('mov-monarchianism', 'dionysius-alexandria', 'opponent'),
  ('mov-monarchianism', 'callixtus-i', 'associated'),

  ('mov-manichaeism', 'mani', 'founder'),
  ('mov-manichaeism', 'augustine', 'opponent'),

  ('mov-novatianism', 'novatian', 'founder'),
  ('mov-novatianism', 'pope-cornelius', 'opponent'),
  ('mov-novatianism', 'cyprian', 'opponent'),

  ('mov-donatism', 'donatus-magnus', 'founder'),
  ('mov-donatism', 'augustine', 'opponent'),
  ('mov-donatism', 'possidius', 'opponent'),

  ('mov-arianism', 'arius', 'founder'),
  ('mov-arianism', 'eusebius-nicomedia', 'proponent'),
  ('mov-arianism', 'lucian-antioch', 'associated'),
  ('mov-arianism', 'eusebius-caesarea', 'associated'),
  ('mov-arianism', 'alexander-alexandria', 'opponent'),
  ('mov-arianism', 'athanasius', 'opponent'),
  ('mov-arianism', 'ossius-cordoba', 'opponent'),
  ('mov-arianism', 'hilary-poitiers', 'opponent'),
  ('mov-arianism', 'marcellus-ancyra', 'opponent'),
  ('mov-arianism', 'cyril-jerusalem', 'opponent'),
  ('mov-arianism', 'basil-great', 'opponent'),
  ('mov-arianism', 'gregory-nazianzus', 'opponent'),
  ('mov-arianism', 'gregory-nyssa', 'opponent'),
  ('mov-arianism', 'ambrose-milan', 'opponent'),

  ('mov-homoian', 'aetius-antioch', 'founder'),
  ('mov-homoian', 'eunomius', 'proponent'),
  ('mov-homoian', 'eusebius-nicomedia', 'proponent'),
  ('mov-homoian', 'athanasius', 'opponent'),
  ('mov-homoian', 'hilary-poitiers', 'opponent'),
  ('mov-homoian', 'basil-great', 'opponent'),
  ('mov-homoian', 'gregory-nyssa', 'opponent'),

  ('mov-apollinarianism', 'apollinaris-laodicea', 'founder'),
  ('mov-apollinarianism', 'gregory-nazianzus', 'opponent'),
  ('mov-apollinarianism', 'gregory-nyssa', 'opponent'),
  ('mov-apollinarianism', 'epiphanius-salamis', 'opponent'),

  ('mov-pneumatomachianism', 'macedonius-i', 'founder'),
  ('mov-pneumatomachianism', 'basil-great', 'opponent'),
  ('mov-pneumatomachianism', 'gregory-nazianzus', 'opponent'),
  ('mov-pneumatomachianism', 'athanasius', 'opponent'),
  ('mov-pneumatomachianism', 'didymus-blind', 'opponent'),

  ('mov-priscillianism', 'priscillian', 'founder'),
  ('mov-priscillianism', 'ambrose-milan', 'opponent'),

  ('mov-antiochene-alexandrian', 'theodore-mopsuestia', 'associated'),
  ('mov-antiochene-alexandrian', 'theodoret-cyrus', 'associated'),
  ('mov-antiochene-alexandrian', 'john-chrysostom', 'associated'),
  ('mov-antiochene-alexandrian', 'nestorius', 'associated'),
  ('mov-antiochene-alexandrian', 'cyril-alexandria', 'associated'),
  ('mov-antiochene-alexandrian', 'athanasius', 'associated'),
  ('mov-antiochene-alexandrian', 'origen', 'associated'),
  ('mov-antiochene-alexandrian', 'didymus-blind', 'associated'),

  ('mov-origenism', 'origen', 'associated'),
  ('mov-origenism', 'rufinus-aquileia', 'proponent'),
  ('mov-origenism', 'didymus-blind', 'proponent'),
  ('mov-origenism', 'jerome', 'opponent'),
  ('mov-origenism', 'epiphanius-salamis', 'opponent'),
  ('mov-origenism', 'theophilus-alexandria', 'opponent'),
  ('mov-origenism', 'john-chrysostom', 'associated'),

  ('mov-pelagianism', 'pelagius', 'founder'),
  ('mov-pelagianism', 'celestius', 'proponent'),
  ('mov-pelagianism', 'julian-eclanum', 'proponent'),
  ('mov-pelagianism', 'augustine', 'opponent'),
  ('mov-pelagianism', 'jerome', 'opponent'),
  ('mov-pelagianism', 'prosper-aquitaine', 'opponent'),

  ('mov-semipelagianism', 'john-cassian', 'founder'),
  ('mov-semipelagianism', 'faustus-riez', 'proponent'),
  ('mov-semipelagianism', 'prosper-aquitaine', 'opponent'),
  ('mov-semipelagianism', 'augustine', 'opponent'),
  ('mov-semipelagianism', 'lucidus', 'associated'),

  ('mov-nestorianism', 'nestorius', 'founder'),
  ('mov-nestorianism', 'theodore-mopsuestia', 'associated'),
  ('mov-nestorianism', 'theodoret-cyrus', 'proponent'),
  ('mov-nestorianism', 'cyril-alexandria', 'opponent'),
  ('mov-nestorianism', 'pope-celestine-1', 'opponent'),

  ('mov-eutychianism', 'eutyches', 'founder'),
  ('mov-eutychianism', 'dioscorus-alexandria', 'proponent'),
  ('mov-eutychianism', 'flavian-constantinople', 'opponent'),
  ('mov-eutychianism', 'pope-leo-1', 'opponent'),
  ('mov-eutychianism', 'theodoret-cyrus', 'opponent')
ON CONFLICT DO NOTHING;

-- ══════════════════════════════════════════════════════════════════════════
-- 6. Movement ↔ event links
-- ══════════════════════════════════════════════════════════════════════════

INSERT INTO public."CH_Movement_Events" (movement_id, event_id, relation) VALUES
  ('mov-judaizers', 'doc-galatians', 'sparked_by'),
  ('mov-judaizers', 'event-council-jerusalem', 'condemned_at'),

  ('mov-docetism', 'doc-against-heresies', 'related'),

  ('mov-gnosticism', 'doc-against-heresies', 'related'),
  ('mov-gnosticism', 'doc-muratorian', 'related'),
  ('mov-gnosticism', 'doc-thomas-mentioned', 'related'),

  ('mov-montanism', 'doc-muratorian', 'related'),

  ('mov-manichaeism', 'doc-confessions', 'related'),


  ('mov-marcionism', 'doc-muratorian', 'related'),
  ('mov-marcionism', 'doc-against-heresies', 'related'),

  ('mov-monarchianism', 'council-antioch-268', 'condemned_at'),

  ('mov-novatianism', 'event-decian-persecution', 'sparked_by'),

  ('mov-donatism', 'event-diocletian-persecution', 'sparked_by'),
  ('mov-donatism', 'council-arles-314', 'condemned_at'),

  ('mov-arianism', 'doc-on-incarnation', 'related'),
  ('mov-arianism', 'doc-thalia', 'related'),
  ('mov-arianism', 'council-nicaea', 'condemned_at'),
  ('mov-arianism', 'doc-nicene-creed', 'defined_at'),
  ('mov-arianism', 'council-constantinople-1', 'condemned_at'),
  ('mov-arianism', 'doc-niceno-constantinopolitan-creed', 'defined_at'),

  ('mov-homoian', 'council-antioch-341', 'related'),
  ('mov-homoian', 'council-serdica-343', 'related'),
  ('mov-homoian', 'council-ariminum-seleucia-359', 'related'),
  ('mov-homoian', 'council-alexandria-362', 'related'),
  ('mov-homoian', 'doc-de-trinitate-hilary', 'related'),
  ('mov-homoian', 'council-constantinople-1', 'condemned_at'),

  ('mov-apollinarianism', 'council-constantinople-1', 'condemned_at'),
  ('mov-pneumatomachianism', 'council-constantinople-1', 'condemned_at'),
  ('mov-pneumatomachianism', 'doc-niceno-constantinopolitan-creed', 'defined_at'),

  ('mov-priscillianism', 'doc-panarion', 'related'),

  ('mov-origenism', 'doc-on-first-principles', 'sparked_by'),
  ('mov-origenism', 'doc-panarion', 'related'),

  ('mov-pelagianism', 'council-carthage-418', 'condemned_at'),
  ('mov-pelagianism', 'council-ephesus', 'condemned_at'),
  ('mov-pelagianism', 'doc-city-of-god', 'related'),

  ('mov-nestorianism', 'doc-twelve-anathemas', 'related'),
  ('mov-nestorianism', 'council-ephesus', 'condemned_at'),
  ('mov-nestorianism', 'doc-formula-reunion', 'related'),

  ('mov-antiochene-alexandrian', 'council-ephesus', 'related'),
  ('mov-antiochene-alexandrian', 'council-chalcedon', 'related'),
  ('mov-antiochene-alexandrian', 'doc-formula-reunion', 'related'),

  ('mov-eutychianism', 'council-ephesus-ii-449', 'related'),
  ('mov-eutychianism', 'doc-tome-of-leo', 'related'),
  ('mov-eutychianism', 'council-chalcedon', 'condemned_at'),
  ('mov-eutychianism', 'doc-chalcedonian-definition', 'defined_at')
ON CONFLICT DO NOTHING;

-- ══════════════════════════════════════════════════════════════════════════
-- 7. Event ↔ person links
-- ══════════════════════════════════════════════════════════════════════════

INSERT INTO public."CH_EventConnections" (event_id, person_id) VALUES
  ('council-antioch-268', 'paul-samosata'),
  ('council-arles-314', 'donatus-magnus'),
  ('council-arles-314', 'roman-constantine'),
  ('council-antioch-341', 'athanasius'),
  ('council-antioch-341', 'eusebius-nicomedia'),
  ('council-serdica-343', 'athanasius'),
  ('council-serdica-343', 'ossius-cordoba'),
  ('council-serdica-343', 'marcellus-ancyra'),
  ('council-ariminum-seleucia-359', 'roman-constantius-ii'),
  ('council-ariminum-seleucia-359', 'hilary-poitiers'),
  ('council-alexandria-362', 'athanasius'),
  ('council-carthage-418', 'augustine'),
  ('council-carthage-418', 'pelagius'),
  ('council-carthage-418', 'celestius'),
  ('council-ephesus-ii-449', 'dioscorus-alexandria'),
  ('council-ephesus-ii-449', 'eutyches'),
  ('council-ephesus-ii-449', 'flavian-constantinople'),
  ('council-ephesus-ii-449', 'pope-leo-1'),
  ('council-ephesus-ii-449', 'theodoret-cyrus'),
  ('doc-thalia', 'arius'),
  ('doc-nicene-creed', 'ossius-cordoba'),
  ('doc-nicene-creed', 'athanasius'),
  ('doc-nicene-creed', 'alexander-alexandria'),
  ('doc-de-trinitate-hilary', 'hilary-poitiers'),
  ('doc-panarion', 'epiphanius-salamis'),
  ('doc-niceno-constantinopolitan-creed', 'gregory-nazianzus'),
  ('doc-twelve-anathemas', 'cyril-alexandria'),
  ('doc-twelve-anathemas', 'nestorius'),
  ('doc-formula-reunion', 'cyril-alexandria'),
  ('doc-formula-reunion', 'theodoret-cyrus'),
  ('doc-tome-of-leo', 'pope-leo-1'),
  ('doc-tome-of-leo', 'flavian-constantinople'),
  ('doc-chalcedonian-definition', 'pope-leo-1'),
  ('doc-chalcedonian-definition', 'eastern-marcian'),
  ('council-nicaea', 'arius'),
  ('council-nicaea', 'ossius-cordoba'),
  ('council-nicaea', 'eusebius-nicomedia'),
  ('council-nicaea', 'eusebius-caesarea'),
  ('council-constantinople-1', 'gregory-nazianzus'),
  ('council-constantinople-1', 'macedonius-i'),
  ('council-constantinople-1', 'apollinaris-laodicea'),
  ('council-ephesus', 'nestorius'),
  ('council-ephesus', 'pope-celestine-1'),
  ('council-chalcedon', 'eutyches'),
  ('council-chalcedon', 'dioscorus-alexandria'),
  ('council-chalcedon', 'theodoret-cyrus'),
  ('doc-ecclesiastical-history-eusebius', 'eusebius-caesarea'),
  ('doc-catechetical-lectures', 'cyril-jerusalem')
ON CONFLICT DO NOTHING;

-- ══════════════════════════════════════════════════════════════════════════
-- 8. Person ↔ person relations
-- ══════════════════════════════════════════════════════════════════════════
-- connection_type is free-form text (no CHECK), so 'opposed', 'taught' and
-- 'succeeded' need no schema change. The Timeline modal renders the type verbatim.
--
-- CH_Connections has no unique constraint, so ON CONFLICT DO NOTHING would be a
-- no-op and re-running this file would duplicate every row. Guard with NOT
-- EXISTS against the pair in either direction instead.
--
-- Six of these pairs are already recorded as 'known'. Sharpening those to the
-- specific relation is done by UPDATE below, not by inserting a second row.

UPDATE public."CH_Connections" SET connection_type = 'taught'
  WHERE person_id_1 = 'alexander-alexandria' AND person_id_2 = 'athanasius';
UPDATE public."CH_Connections" SET connection_type = 'opposed'
  WHERE person_id_1 = 'jerome' AND person_id_2 = 'rufinus-aquileia';
UPDATE public."CH_Connections" SET connection_type = 'opposed'
  WHERE person_id_1 = 'theophilus-alexandria' AND person_id_2 = 'john-chrysostom';

INSERT INTO public."CH_Connections" (person_id_1, person_id_2, connection_type)
SELECT v.a, v.b, v.t
FROM (VALUES
  ('john-evangelist', 'cerinthus', 'opposed'),
  ('polycarp', 'marcion', 'opposed'),
  ('irenaeus', 'valentinus', 'opposed'),
  ('irenaeus', 'marcion', 'opposed'),
  ('hippolytus', 'sabellius', 'opposed'),
  ('hippolytus', 'callixtus-i', 'opposed'),
  ('tertullian', 'marcion', 'opposed'),
  ('tertullian', 'montanus', 'known'),
  ('cyprian', 'novatian', 'opposed'),
  ('pope-cornelius', 'novatian', 'opposed'),
  ('dionysius-alexandria', 'paul-samosata', 'opposed'),
  ('lucian-antioch', 'arius', 'taught'),
  ('alexander-alexandria', 'arius', 'opposed'),
  ('alexander-alexandria', 'athanasius', 'taught'),
  ('athanasius', 'arius', 'opposed'),
  ('athanasius', 'eusebius-nicomedia', 'opposed'),
  ('athanasius', 'ossius-cordoba', 'known'),
  ('athanasius', 'hilary-poitiers', 'known'),
  ('athanasius', 'marcellus-ancyra', 'known'),
  ('athanasius', 'apollinaris-laodicea', 'known'),
  ('athanasius', 'anthony-great', 'known'),
  ('ossius-cordoba', 'roman-constantine', 'known'),
  ('ossius-cordoba', 'roman-constantius-ii', 'opposed'),
  ('hilary-poitiers', 'roman-constantius-ii', 'opposed'),
  ('aetius-antioch', 'eunomius', 'taught'),
  ('basil-great', 'eunomius', 'opposed'),
  ('gregory-nyssa', 'eunomius', 'opposed'),
  ('basil-great', 'macedonius-i', 'opposed'),
  ('gregory-nazianzus', 'apollinaris-laodicea', 'opposed'),
  ('gregory-nyssa', 'apollinaris-laodicea', 'opposed'),
  ('epiphanius-salamis', 'apollinaris-laodicea', 'opposed'),
  ('ambrose-milan', 'priscillian', 'opposed'),
  ('epiphanius-salamis', 'jerome', 'known'),
  ('jerome', 'rufinus-aquileia', 'opposed'),
  ('theophilus-alexandria', 'john-chrysostom', 'opposed'),
  ('theophilus-alexandria', 'cyril-alexandria', 'known'),
  ('augustine', 'pelagius', 'opposed'),
  ('augustine', 'celestius', 'opposed'),
  ('augustine', 'julian-eclanum', 'opposed'),
  ('augustine', 'donatus-magnus', 'opposed'),
  ('augustine', 'mani', 'opposed'),
  ('jerome', 'pelagius', 'opposed'),
  ('prosper-aquitaine', 'john-cassian', 'opposed'),
  ('prosper-aquitaine', 'augustine', 'known'),
  ('faustus-riez', 'john-cassian', 'known'),
  ('theodore-mopsuestia', 'nestorius', 'taught'),
  ('theodore-mopsuestia', 'john-chrysostom', 'known'),
  ('cyril-alexandria', 'nestorius', 'opposed'),
  ('cyril-alexandria', 'pope-celestine-1', 'known'),
  ('cyril-alexandria', 'theodoret-cyrus', 'opposed'),
  ('cyril-alexandria', 'dioscorus-alexandria', 'succeeded'),
  ('flavian-constantinople', 'eutyches', 'opposed'),
  ('flavian-constantinople', 'dioscorus-alexandria', 'opposed'),
  ('flavian-constantinople', 'pope-leo-1', 'known'),
  ('pope-leo-1', 'eutyches', 'opposed'),
  ('pope-leo-1', 'dioscorus-alexandria', 'opposed'),
  ('pope-leo-1', 'eastern-marcian', 'known'),
  ('theodoret-cyrus', 'nestorius', 'known'),
  ('dioscorus-alexandria', 'eutyches', 'known')
) AS v(a, b, t)
WHERE NOT EXISTS (
  SELECT 1 FROM public."CH_Connections" c
  WHERE (c.person_id_1 = v.a AND c.person_id_2 = v.b)
     OR (c.person_id_1 = v.b AND c.person_id_2 = v.a)
);

-- ══════════════════════════════════════════════════════════════════════════
-- 9. Sources
-- ══════════════════════════════════════════════════════════════════════════

INSERT INTO public."CH_Sources" (source_id, title, source_name, year, url, notes) VALUES
  ('src-athanasius-contra-arianos', 'Athanasius – Four Discourses Against the Arians', 'New Advent (Church Fathers)', '~340', 'https://www.newadvent.org/fathers/2816.htm', 'The principal refutation of Arius; preserves much of the Thalia in quotation.'),
  ('src-athanasius-de-decretis', 'Athanasius – De Decretis (Defence of the Nicene Definition)', 'New Advent (Church Fathers)', '~352', 'https://www.newadvent.org/fathers/2809.htm', 'Athanasius'' account of why the council chose homoousios.'),
  ('src-socrates-eh-i', 'Socrates Scholasticus – Ecclesiastical History, Book I', 'New Advent (Church Fathers)', '~439', 'https://www.newadvent.org/fathers/26011.htm', 'Narrative source for the outbreak of the Arian controversy and the Council of Nicaea.'),
  ('src-theodoret-eh', 'Theodoret – Ecclesiastical History', 'New Advent (Church Fathers)', '~449', 'https://www.newadvent.org/fathers/27021.htm', 'Preserves the letters of Alexander, Arius and Constantine in full.'),
  ('src-irenaeus-ah-1', 'Irenaeus – Against Heresies, Book I', 'New Advent (Church Fathers)', '~180', 'https://www.newadvent.org/fathers/0103.htm', 'The fullest ancient description of Valentinian and other gnostic systems.'),
  ('src-tertullian-against-marcion', 'Tertullian – Against Marcion', 'New Advent (Church Fathers)', '~208', 'https://www.newadvent.org/fathers/0312.htm', 'Five books against Marcion''s two gods and truncated canon; the main source for his teaching.'),
  ('src-hippolytus-refutation', 'Hippolytus – Refutation of All Heresies', 'New Advent (Church Fathers)', '~225', 'https://www.newadvent.org/fathers/0501.htm', 'Source for Sabellius, Noetus and the Roman modalist controversy.'),
  ('src-epiphanius-panarion', 'Epiphanius – Panarion (Against Heresies)', 'Internet Archive', '~378', 'https://archive.org/details/panarionofepipha0000epip', 'Catalogue of eighty heresies; quotes lost works of Marcion, Arius and others.'),
  ('src-newadvent-nicaea-canons', 'First Council of Nicaea – Canons and Creed', 'New Advent (Church Fathers)', '325', 'https://www.newadvent.org/fathers/3801.htm', 'Acts, creed and canons of the first ecumenical council.'),
  ('src-newadvent-constantinople-1', 'First Council of Constantinople – Canons', 'New Advent (Church Fathers)', '381', 'https://www.newadvent.org/fathers/3809.htm', 'Canons of the second ecumenical council, including the condemnation of the Pneumatomachi and Apollinarians.'),
  ('src-newadvent-chalcedon', 'Council of Chalcedon – Definition and Canons', 'New Advent (Church Fathers)', '451', 'https://www.newadvent.org/fathers/3811.htm', 'The Chalcedonian Definition and the acts of the fourth ecumenical council.'),
  ('src-leo-tome', 'Leo I – Letter 28 to Flavian (the Tome)', 'New Advent (Church Fathers)', '449', 'https://www.newadvent.org/fathers/3604028.htm', 'The Tome of Leo, acclaimed at Chalcedon.'),
  ('src-augustine-anti-pelagian', 'Augustine – Anti-Pelagian Writings', 'CCEL', '412–430', 'https://www.ccel.org/ccel/schaff/npnf105.html', 'On Nature and Grace, On the Spirit and the Letter, Against Julian and the rest of the Pelagian corpus.'),
  ('src-augustine-anti-donatist', 'Augustine – Anti-Donatist Writings', 'CCEL', '400–412', 'https://www.ccel.org/ccel/schaff/npnf104.html', 'On Baptism, Against the Donatists, and the sermons on the African schism.'),
  ('src-cassian-conferences', 'John Cassian – Conferences (esp. XIII)', 'New Advent (Church Fathers)', '~426', 'https://www.newadvent.org/fathers/350813.htm', 'Conference XIII on grace and free will, the founding text of the semi-Pelagian position.'),
  ('src-basil-de-spiritu-sancto', 'Basil the Great – On the Holy Spirit', 'New Advent (Church Fathers)', '375', 'https://www.newadvent.org/fathers/3203.htm', 'Written against the Pneumatomachi; shaped the third article of the creed of 381.'),
  ('src-gregory-naz-ep-101', 'Gregory of Nazianzus – Letter 101 to Cledonius', 'New Advent (Church Fathers)', '~382', 'https://www.newadvent.org/fathers/3103a.htm', 'Against Apollinaris: "that which he has not assumed he has not healed."'),
  ('src-hilary-de-trinitate', 'Hilary of Poitiers – On the Trinity', 'New Advent (Church Fathers)', '~360', 'https://www.newadvent.org/fathers/3302.htm', 'The first sustained Latin defence of Nicene trinitarianism.')
ON CONFLICT DO NOTHING;

-- CH_Source_Figures has no unique constraint either, so guard the same way.

INSERT INTO public."CH_Source_Figures" (source_id, person_id, event_id)
SELECT v.s, v.p, v.e
FROM (VALUES
  ('src-athanasius-contra-arianos', 'athanasius'::text, NULL::text),
  ('src-athanasius-contra-arianos', 'arius', NULL),
  ('src-athanasius-de-decretis', 'athanasius', NULL),
  ('src-athanasius-de-decretis', NULL, 'doc-nicene-creed'),
  ('src-socrates-eh-i', 'arius', NULL),
  ('src-socrates-eh-i', 'alexander-alexandria', NULL),
  ('src-socrates-eh-i', NULL, 'council-nicaea'),
  ('src-theodoret-eh', 'arius', NULL),
  ('src-theodoret-eh', 'eusebius-nicomedia', NULL),
  ('src-theodoret-eh', 'theodoret-cyrus', NULL),
  ('src-irenaeus-ah-1', 'irenaeus', NULL),
  ('src-irenaeus-ah-1', 'valentinus', NULL),
  ('src-irenaeus-ah-1', 'basilides', NULL),
  ('src-irenaeus-ah-1', 'cerinthus', NULL),
  ('src-tertullian-against-marcion', 'tertullian', NULL),
  ('src-tertullian-against-marcion', 'marcion', NULL),
  ('src-hippolytus-refutation', 'hippolytus', NULL),
  ('src-hippolytus-refutation', 'sabellius', NULL),
  ('src-hippolytus-refutation', 'callixtus-i', NULL),
  ('src-epiphanius-panarion', 'epiphanius-salamis', NULL),
  ('src-epiphanius-panarion', 'montanus', NULL),
  ('src-epiphanius-panarion', 'priscillian', NULL),
  ('src-epiphanius-panarion', NULL, 'doc-panarion'),
  ('src-newadvent-nicaea-canons', NULL, 'council-nicaea'),
  ('src-newadvent-nicaea-canons', NULL, 'doc-nicene-creed'),
  ('src-newadvent-nicaea-canons', 'ossius-cordoba', NULL),
  ('src-newadvent-constantinople-1', NULL, 'council-constantinople-1'),
  ('src-newadvent-constantinople-1', NULL, 'doc-niceno-constantinopolitan-creed'),
  ('src-newadvent-constantinople-1', 'macedonius-i', NULL),
  ('src-newadvent-constantinople-1', 'apollinaris-laodicea', NULL),
  ('src-newadvent-chalcedon', NULL, 'council-chalcedon'),
  ('src-newadvent-chalcedon', NULL, 'doc-chalcedonian-definition'),
  ('src-newadvent-chalcedon', 'eutyches', NULL),
  ('src-newadvent-chalcedon', 'dioscorus-alexandria', NULL),
  ('src-leo-tome', 'pope-leo-1', NULL),
  ('src-leo-tome', 'flavian-constantinople', NULL),
  ('src-leo-tome', NULL, 'doc-tome-of-leo'),
  ('src-augustine-anti-pelagian', 'augustine', NULL),
  ('src-augustine-anti-pelagian', 'pelagius', NULL),
  ('src-augustine-anti-pelagian', 'celestius', NULL),
  ('src-augustine-anti-pelagian', 'julian-eclanum', NULL),
  ('src-augustine-anti-pelagian', NULL, 'council-carthage-418'),
  ('src-augustine-anti-donatist', 'augustine', NULL),
  ('src-augustine-anti-donatist', 'donatus-magnus', NULL),
  ('src-cassian-conferences', 'john-cassian', NULL),
  ('src-cassian-conferences', 'faustus-riez', NULL),
  ('src-basil-de-spiritu-sancto', 'basil-great', NULL),
  ('src-basil-de-spiritu-sancto', 'macedonius-i', NULL),
  ('src-gregory-naz-ep-101', 'gregory-nazianzus', NULL),
  ('src-gregory-naz-ep-101', 'apollinaris-laodicea', NULL),
  ('src-hilary-de-trinitate', 'hilary-poitiers', NULL),
  ('src-hilary-de-trinitate', NULL, 'doc-de-trinitate-hilary'),
  ('src-newadvent-council-ephesus', 'nestorius', NULL),
  ('src-newadvent-council-ephesus', NULL, 'doc-twelve-anathemas')
) AS v(s, p, e)
WHERE NOT EXISTS (
  SELECT 1 FROM public."CH_Source_Figures" sf
  WHERE sf.source_id = v.s
    AND sf.person_id IS NOT DISTINCT FROM v.p
    AND sf.event_id  IS NOT DISTINCT FROM v.e
);

-- ══════════════════════════════════════════════════════════════════════════
-- 10. Works
-- ══════════════════════════════════════════════════════════════════════════

-- CH_Works has no unique constraint; same NOT EXISTS guard.

INSERT INTO public."CH_Works" (person_id, name, text_url)
SELECT v.p, v.n, v.u
FROM (VALUES
  ('arius', 'Thalia (surviving fragments)', 'https://en.wikipedia.org/wiki/Thalia_(Arius)'),
  ('arius', 'Letter to Eusebius of Nicomedia', 'https://www.newadvent.org/fathers/26011.htm'),
  ('marcion', 'Antitheses (lost; reconstructed from Tertullian)', 'https://www.newadvent.org/fathers/0312.htm'),
  ('novatian', 'On the Trinity', 'https://www.newadvent.org/fathers/0512.htm'),
  ('eusebius-caesarea', 'Ecclesiastical History', 'https://www.newadvent.org/fathers/2501.htm'),
  ('eusebius-caesarea', 'Life of Constantine', 'https://www.newadvent.org/fathers/2502.htm'),
  ('hilary-poitiers', 'On the Trinity', 'https://www.newadvent.org/fathers/3302.htm'),
  ('hilary-poitiers', 'On the Councils', 'https://www.newadvent.org/fathers/3304.htm'),
  ('cyril-jerusalem', 'Catechetical Lectures', 'https://www.newadvent.org/fathers/3101.htm'),
  ('epiphanius-salamis', 'Panarion (Against Heresies)', 'https://archive.org/details/panarionofepipha0000epip'),
  ('eunomius', 'Apology (quoted in Basil, Against Eunomius)', 'https://www.newadvent.org/fathers/2901.htm'),
  ('nestorius', 'The Bazaar of Heracleides', 'https://archive.org/details/nestoriusbazaaro00nestuoft'),
  ('nestorius', 'Letters to Cyril of Alexandria', 'https://www.newadvent.org/fathers/3810.htm'),
  ('theodoret-cyrus', 'Eranistes', 'https://www.newadvent.org/fathers/27031.htm'),
  ('theodoret-cyrus', 'Ecclesiastical History', 'https://www.newadvent.org/fathers/27021.htm'),
  ('theodore-mopsuestia', 'Catechetical Homilies', 'https://en.wikipedia.org/wiki/Theodore_of_Mopsuestia'),
  ('pelagius', 'Commentary on Romans', 'https://en.wikipedia.org/wiki/Pelagius'),
  ('pelagius', 'Letter to Demetrias', 'https://www.ccel.org/ccel/schaff/npnf105.html'),
  ('john-cassian', 'Conferences', 'https://www.newadvent.org/fathers/3508.htm'),
  ('john-cassian', 'Institutes', 'https://www.newadvent.org/fathers/350701.htm'),
  ('pope-leo-1', 'Letter 28 to Flavian (the Tome)', 'https://www.newadvent.org/fathers/3604028.htm'),
  ('basil-great', 'On the Holy Spirit', 'https://www.newadvent.org/fathers/3203.htm'),
  ('basil-great', 'Against Eunomius', 'https://www.newadvent.org/fathers/2901.htm'),
  ('gregory-nyssa', 'Against Eunomius', 'https://www.newadvent.org/fathers/2901.htm'),
  ('gregory-nazianzus', 'Letter 101 to Cledonius', 'https://www.newadvent.org/fathers/3103a.htm'),
  ('gregory-nazianzus', 'The Five Theological Orations', 'https://www.newadvent.org/fathers/310227.htm'),
  ('ossius-cordoba', 'Letter to Constantius II (in Athanasius, History of the Arians)', 'https://www.newadvent.org/fathers/2817.htm')
) AS v(p, n, u)
WHERE NOT EXISTS (
  SELECT 1 FROM public."CH_Works" w
  WHERE w.person_id = v.p AND w.name = v.n
);

commit;
