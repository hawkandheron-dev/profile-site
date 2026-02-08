-- Add reign_start / reign_end columns and populate actual birth/death + reign
-- dates for every monarch.  Previously birth_date/death_date held reign dates;
-- now they hold real lifespan dates and the new columns hold reign dates.

begin;

-- ── Schema changes ────────────────────────────────────────────────────────
ALTER TABLE public."CH_People"
  ADD COLUMN IF NOT EXISTS reign_start      date,
  ADD COLUMN IF NOT EXISTS reign_end        date,
  ADD COLUMN IF NOT EXISTS reign_start_year integer,
  ADD COLUMN IF NOT EXISTS reign_end_year   integer;

-- ── Helper: bulk-update via a VALUES list ─────────────────────────────────
-- Sets birth/death (lifespan) AND reign start/end for each monarch.

UPDATE public."CH_People" AS p SET
  birth_date       = v.birth_date,
  death_date       = v.death_date,
  birth_year       = v.birth_year,
  death_year       = v.death_year,
  reign_start      = v.reign_start,
  reign_end        = v.reign_end,
  reign_start_year = v.reign_start_year,
  reign_end_year   = v.reign_end_year
FROM (VALUES
  -- ── Unified Roman Emperors ──────────────────────────────────────────────
  --  person_id                       birth_date       death_date       b_yr  d_yr  reign_start      reign_end        rs_yr re_yr
  ('roman-augustus',                  '-0062-01-01'::date, '0014-01-01'::date, -63,   14, '-0026-01-01'::date, '0014-01-01'::date, -27,   14),
  ('roman-tiberius',                 '-0041-01-01'::date, '0037-01-01'::date, -42,   37, '0014-01-01'::date, '0037-01-01'::date,  14,   37),
  ('roman-caligula',                  '0012-01-01'::date, '0041-01-01'::date,  12,   41, '0037-01-01'::date, '0041-01-01'::date,  37,   41),
  ('roman-claudius',                 '-0009-01-01'::date, '0054-01-01'::date, -10,   54, '0041-01-01'::date, '0054-01-01'::date,  41,   54),
  ('roman-nero',                      '0037-01-01'::date, '0068-01-01'::date,  37,   68, '0054-01-01'::date, '0068-01-01'::date,  54,   68),
  ('roman-galba-otho-vitellius',     '-0002-01-01'::date, '0069-01-01'::date,  -3,   69, '0068-01-01'::date, '0069-01-01'::date,  68,   69),
  ('roman-vespasian',                 '0009-01-01'::date, '0079-01-01'::date,   9,   79, '0069-01-01'::date, '0079-01-01'::date,  69,   79),
  ('roman-titus',                     '0039-01-01'::date, '0081-01-01'::date,  39,   81, '0079-01-01'::date, '0081-01-01'::date,  79,   81),
  ('roman-domitian',                  '0051-01-01'::date, '0096-01-01'::date,  51,   96, '0081-01-01'::date, '0096-01-01'::date,  81,   96),
  ('roman-nerva',                     '0030-01-01'::date, '0098-01-01'::date,  30,   98, '0096-01-01'::date, '0098-01-01'::date,  96,   98),
  ('roman-trajan',                    '0053-01-01'::date, '0117-01-01'::date,  53,  117, '0098-01-01'::date, '0117-01-01'::date,  98,  117),
  ('roman-hadrian',                   '0076-01-01'::date, '0138-01-01'::date,  76,  138, '0117-01-01'::date, '0138-01-01'::date, 117,  138),
  ('roman-antoninus',                 '0086-01-01'::date, '0161-01-01'::date,  86,  161, '0138-01-01'::date, '0161-01-01'::date, 138,  161),
  ('roman-marcus-aurelius',           '0121-01-01'::date, '0180-01-01'::date, 121,  180, '0161-01-01'::date, '0180-01-01'::date, 161,  180),
  ('roman-commodus',                  '0161-01-01'::date, '0192-01-01'::date, 161,  192, '0177-01-01'::date, '0192-01-01'::date, 177,  192),
  ('roman-septimius-severus',         '0145-01-01'::date, '0211-01-01'::date, 145,  211, '0193-01-01'::date, '0211-01-01'::date, 193,  211),
  ('roman-caracalla',                 '0188-01-01'::date, '0217-01-01'::date, 188,  217, '0198-01-01'::date, '0217-01-01'::date, 198,  217),
  ('roman-alexander-severus',         '0208-01-01'::date, '0235-01-01'::date, 208,  235, '0222-01-01'::date, '0235-01-01'::date, 222,  235),
  ('roman-maximinus-thrax',           '0173-01-01'::date, '0238-01-01'::date, 173,  238, '0235-01-01'::date, '0238-01-01'::date, 235,  238),
  ('roman-philip-arab',               '0204-01-01'::date, '0249-01-01'::date, 204,  249, '0244-01-01'::date, '0249-01-01'::date, 244,  249),
  ('roman-decius',                    '0201-01-01'::date, '0251-01-01'::date, 201,  251, '0249-01-01'::date, '0251-01-01'::date, 249,  251),
  ('roman-valerian',                  '0195-01-01'::date, '0260-01-01'::date, 195,  260, '0253-01-01'::date, '0260-01-01'::date, 253,  260),
  ('roman-gallienus',                 '0218-01-01'::date, '0268-01-01'::date, 218,  268, '0253-01-01'::date, '0268-01-01'::date, 253,  268),
  ('roman-aurelian',                  '0214-01-01'::date, '0275-01-01'::date, 214,  275, '0270-01-01'::date, '0275-01-01'::date, 270,  275),
  ('roman-diocletian-maximian',       '0245-01-01'::date, '0311-01-01'::date, 245,  311, '0284-01-01'::date, '0305-01-01'::date, 284,  305),
  ('roman-constantine',               '0272-01-01'::date, '0337-01-01'::date, 272,  337, '0306-01-01'::date, '0337-01-01'::date, 306,  337),
  ('roman-constantius-ii',            '0317-01-01'::date, '0361-01-01'::date, 317,  361, '0337-01-01'::date, '0361-01-01'::date, 337,  361),
  ('roman-julian',                    '0331-01-01'::date, '0363-01-01'::date, 331,  363, '0361-01-01'::date, '0363-01-01'::date, 361,  363),
  ('roman-valens',                    '0328-01-01'::date, '0378-01-01'::date, 328,  378, '0364-01-01'::date, '0378-01-01'::date, 364,  378),
  ('roman-theodosius-i',              '0347-01-01'::date, '0395-01-01'::date, 347,  395, '0379-01-01'::date, '0395-01-01'::date, 379,  395),

  -- ── Western Roman Emperors ──────────────────────────────────────────────
  ('western-honorius',                '0384-01-01'::date, '0423-01-01'::date, 384,  423, '0393-01-01'::date, '0423-01-01'::date, 393,  423),
  ('western-valentinian-iii',         '0419-01-01'::date, '0455-01-01'::date, 419,  455, '0425-01-01'::date, '0455-01-01'::date, 425,  455),
  ('western-majorian',                '0420-01-01'::date, '0461-01-01'::date, 420,  461, '0457-01-01'::date, '0461-01-01'::date, 457,  461),
  ('western-romulus-augustulus',       '0460-01-01'::date, '0511-01-01'::date, 460,  511, '0475-01-01'::date, '0476-01-01'::date, 475,  476),

  -- ── Eastern Roman / Byzantine Emperors ──────────────────────────────────
  ('eastern-arcadius',                '0377-01-01'::date, '0408-01-01'::date, 377,  408, '0383-01-01'::date, '0408-01-01'::date, 383,  408),
  ('eastern-theodosius-ii',           '0401-01-01'::date, '0450-01-01'::date, 401,  450, '0402-01-01'::date, '0450-01-01'::date, 402,  450),
  ('eastern-marcian',                 '0392-01-01'::date, '0457-01-01'::date, 392,  457, '0450-01-01'::date, '0457-01-01'::date, 450,  457),
  ('eastern-leo-i',                   '0401-01-01'::date, '0474-01-01'::date, 401,  474, '0457-01-01'::date, '0474-01-01'::date, 457,  474),
  ('eastern-justinian-i',             '0482-01-01'::date, '0565-01-01'::date, 482,  565, '0527-01-01'::date, '0565-01-01'::date, 527,  565),
  ('eastern-heraclius',               '0575-01-01'::date, '0641-01-01'::date, 575,  641, '0610-01-01'::date, '0641-01-01'::date, 610,  641),
  ('eastern-constantine-iv',          '0650-01-01'::date, '0685-01-01'::date, 650,  685, '0668-01-01'::date, '0685-01-01'::date, 668,  685),
  ('eastern-justinian-ii',            '0668-01-01'::date, '0711-01-01'::date, 668,  711, '0685-01-01'::date, '0711-01-01'::date, 685,  711),
  ('eastern-leo-iii',                 '0685-01-01'::date, '0741-01-01'::date, 685,  741, '0717-01-01'::date, '0741-01-01'::date, 717,  741),
  ('eastern-constantine-v',           '0718-01-01'::date, '0775-01-01'::date, 718,  775, '0741-01-01'::date, '0775-01-01'::date, 741,  775),
  ('eastern-irene',                   '0752-01-01'::date, '0803-01-01'::date, 752,  803, '0797-01-01'::date, '0802-01-01'::date, 797,  802),
  ('eastern-basil-i',                 '0811-01-01'::date, '0886-01-01'::date, 811,  886, '0867-01-01'::date, '0886-01-01'::date, 867,  886),
  ('eastern-basil-ii',                '0958-01-01'::date, '1025-01-01'::date, 958, 1025, '0976-01-01'::date, '1025-01-01'::date, 976, 1025),
  ('eastern-constantine-ix',         '1000-01-01'::date, '1055-01-01'::date,1000, 1055, '1042-01-01'::date, '1055-01-01'::date,1042, 1055),
  ('eastern-alexios-i',              '1057-01-01'::date, '1118-01-01'::date,1057, 1118, '1081-01-01'::date, '1118-01-01'::date,1081, 1118),
  ('eastern-michael-viii',            '1224-01-01'::date, '1282-01-01'::date,1224, 1282, '1261-01-01'::date, '1282-01-01'::date,1261, 1282),
  ('eastern-constantine-xi',         '1404-01-01'::date, '1453-01-01'::date,1404, 1453, '1449-01-01'::date, '1453-01-01'::date,1449, 1453),

  -- ── Charlemagne ─────────────────────────────────────────────────────────
  ('charlemagne',                     '0748-01-01'::date, '0814-01-01'::date, 748,  814, '0768-01-01'::date, '0814-01-01'::date, 768,  814),

  -- ── Notable Monarchs ───────────────────────────────────────────────────
  ('monarch-clovis',                  '0466-01-01'::date, '0511-01-01'::date, 466,  511, '0481-01-01'::date, '0511-01-01'::date, 481,  511),
  ('monarch-otto-i',                  '0912-01-01'::date, '0973-01-01'::date, 912,  973, '0962-01-01'::date, '0973-01-01'::date, 962,  973),
  ('monarch-henry-iv',               '1050-01-01'::date, '1106-01-01'::date,1050, 1106, '1084-01-01'::date, '1105-01-01'::date,1084, 1105),
  ('monarch-frederick-i',            '1122-01-01'::date, '1190-01-01'::date,1122, 1190, '1155-01-01'::date, '1190-01-01'::date,1155, 1190),
  ('monarch-frederick-ii',           '1194-01-01'::date, '1250-01-01'::date,1194, 1250, '1220-01-01'::date, '1250-01-01'::date,1220, 1250),
  ('monarch-charles-v',              '1500-01-01'::date, '1558-01-01'::date,1500, 1558, '1519-01-01'::date, '1556-01-01'::date,1519, 1556),
  ('monarch-henry-viii',              '1491-01-01'::date, '1547-01-01'::date,1491, 1547, '1509-01-01'::date, '1547-01-01'::date,1509, 1547),
  ('monarch-elizabeth-i',            '1533-01-01'::date, '1603-01-01'::date,1533, 1603, '1558-01-01'::date, '1603-01-01'::date,1558, 1603),
  ('monarch-james-i',                '1566-01-01'::date, '1625-01-01'::date,1566, 1625, '1603-01-01'::date, '1625-01-01'::date,1603, 1625),
  ('monarch-philip-ii',              '1527-01-01'::date, '1598-01-01'::date,1527, 1598, '1556-01-01'::date, '1598-01-01'::date,1556, 1598),
  ('monarch-ferdinand-isabella',     '1452-01-01'::date, '1504-01-01'::date,1452, 1504, '1479-01-01'::date, '1504-01-01'::date,1479, 1504),
  ('monarch-louis-ix',               '1214-01-01'::date, '1270-01-01'::date,1214, 1270, '1226-01-01'::date, '1270-01-01'::date,1226, 1270),
  ('monarch-louis-xiv',              '1638-01-01'::date, '1715-01-01'::date,1638, 1715, '1643-01-01'::date, '1715-01-01'::date,1643, 1715),
  ('monarch-vladimir-i',              '0958-01-01'::date, '1015-01-01'::date, 958, 1015, '0980-01-01'::date, '1015-01-01'::date, 980, 1015)
) AS v(person_id, birth_date, death_date, birth_year, death_year, reign_start, reign_end, reign_start_year, reign_end_year)
WHERE p.person_id = v.person_id;

commit;
