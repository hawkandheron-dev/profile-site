-- PlacePeriodNames expansion — era-specific names for places.
-- The common/default name stays in BP_Places.name; these are alternate historical names.

begin;

insert into public."BP_PlacePeriodNames" (place_id, age_id, name) values

  -- Dan was originally Laish
  ('dan',           'age-creation',         'Laish'),
  ('dan',           'age-patriarchs',       'Laish'),
  ('dan',           'age-exodus',           'Laish'),
  ('dan',           'age-conquest',         'Laish → Dan'),

  -- Bethlehem was called Ephrath/Ephrathah
  ('bethlehem',     'age-patriarchs',       'Ephrath'),
  ('bethlehem',     'age-conquest',         'Bethlehem Ephrathah'),

  -- Jericho — City of Palms
  ('jericho',       'age-conquest',         'City of Palms'),

  -- Beersheba — Well of the Oath/Seven
  ('beersheba',     'age-patriarchs',       'Beer-sheba (Well of the Oath)'),

  -- On = Heliopolis
  ('on',            'age-patriarchs',       'On'),
  ('on',            'age-judah-exile',      'Heliopolis'),

  -- Susa = Shushan
  ('susa',          'age-judah-exile',      'Shushan'),
  ('susa',          'age-return',           'Shushan'),

  -- Debir was called Kiriath-Sepher
  ('debir',         'age-conquest',         'Kiriath-Sepher'),

  -- Hebron was Kiriath-Arba in early conquest
  ('hebron',        'age-united-monarchy',  'Hebron'),

  -- Babel = Babylon in the primeval narrative
  ('babel',         'age-creation',         'Babel'),
  ('babylon',       'age-creation',         'Babel'),

  -- Penuel = Peniel (face of God)
  ('penuel',        'age-patriarchs',       'Peniel'),

  -- Thebes = No-Amon in Hebrew
  ('thebes',        'age-judah-exile',      'No-Amon'),

  -- Memphis = Noph in Hebrew
  ('memphis',       'age-judah-exile',      'Noph'),

  -- Mount Sinai = Horeb
  ('sinai',         'age-creation',         'Mountain of God'),
  ('sinai',         'age-divided-monarchy', 'Horeb'),

  -- Sea of Galilee = Sea of Chinnereth in OT
  ('sea-of-galilee','age-conquest',         'Sea of Chinnereth'),
  ('sea-of-galilee','age-divided-monarchy', 'Sea of Chinnereth'),
  ('sea-of-galilee','age-gospels',          'Sea of Galilee / Tiberias'),

  -- Dead Sea
  ('dead-sea',      'age-patriarchs',       'Salt Sea'),
  ('dead-sea',      'age-conquest',         'Salt Sea / Sea of the Arabah'),

  -- Acco = Ptolemais = Acre
  ('acco',          'age-conquest',         'Acco'),
  ('acco',          'age-second-temple',    'Ptolemais'),

  -- Red Sea = Sea of Reeds (Yam Suph)
  ('red-sea',       'age-exodus',           'Yam Suph (Sea of Reeds)'),

  -- Raamses / Rameses
  ('raamses',       'age-exodus',           'Pi-Ramesses'),

  -- Calah = Nimrud
  ('calah',         'age-creation',         'Calah'),

  -- Assur = Ashur
  ('assur',         'age-creation',         'Ashur'),

  -- Ecbatana = Achmetha in Aramaic
  ('ecbatana',      'age-return',           'Achmetha'),

  -- Paddan-Aram = Aram-Naharaim (Aram of Two Rivers)
  ('paddan-aram',   'age-patriarchs',       'Paddan-Aram / Aram-Naharaim'),

  -- Tirzah capital period
  ('tirzah',        'age-divided-monarchy', 'Tirzah (Capital of Israel)'),

  -- Gibeah of Saul
  ('gibeah',        'age-united-monarchy',  'Gibeah of Saul'),

  -- Rabbah = Rabbath-Ammon
  ('rabbah',        'age-united-monarchy',  'Rabbath-Ammon'),
  ('rabbah',        'age-second-temple',    'Philadelphia')

on conflict (place_id, age_id) do nothing;

commit;
