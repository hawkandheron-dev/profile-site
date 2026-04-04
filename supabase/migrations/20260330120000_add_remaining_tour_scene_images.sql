-- Add images for remaining tour scenes
-- Prioritizing frescoes, mosaics, and contemporary depictions from the first five centuries

INSERT INTO "CH_LinkedMedia" (entity_type, entity_id, media_url, source_page_url, alt_text, attribution, crop_position_x, crop_position_y) VALUES

-- Scene 1: Jesus intro - Good Shepherd fresco, Catacombs of Rome (3rd century)
(
  'tour_scene', 'jesus-intro',
  'https://commons.wikimedia.org/wiki/Special:FilePath/Good_shepherd_02b_close.jpg',
  'https://en.wikipedia.org/wiki/Good_Shepherd',
  'The Good Shepherd, fresco from the Catacombs of Rome, 3rd century AD',
  'Public domain, Wikimedia Commons',
  50, 50
),

-- Scene 4: First Century - Arch of Titus menorah relief (1st century, contemporary)
(
  'tour_scene', 'first-century',
  'https://commons.wikimedia.org/wiki/Special:FilePath/Carrying_off_the_Menorah_from_the_Temple_in_Jerusalem_depicted_on_a_frieze_on_the_Arch_of_Titus_in_the_Forum_Romanum.JPG',
  'https://en.wikipedia.org/wiki/Arch_of_Titus',
  'Carrying off the Menorah from the Temple in Jerusalem, relief on the Arch of Titus, Rome, 1st century AD',
  'Public domain, Wikimedia Commons',
  50, 50
),

-- Scene 7: Irenaeus 2 - reuse Irenaeus image
(
  'tour_scene', 'irenaeus-2',
  'https://commons.wikimedia.org/wiki/Special:FilePath/Saint_irenee_saint_irenee.jpg',
  'https://en.wikipedia.org/wiki/Irenaeus#/media/File:Saint_irenee_saint_irenee.jpg',
  'Saint Irenaeus of Lyon',
  'Public domain, Wikimedia Commons',
  50, 20
),

-- Scene 8: Irenaeus 3 - reuse Irenaeus image
(
  'tour_scene', 'irenaeus-3',
  'https://commons.wikimedia.org/wiki/Special:FilePath/Saint_irenee_saint_irenee.jpg',
  'https://en.wikipedia.org/wiki/Irenaeus#/media/File:Saint_irenee_saint_irenee.jpg',
  'Saint Irenaeus of Lyon',
  'Public domain, Wikimedia Commons',
  50, 20
),

-- Scene 9: Hippolytus - 3rd century marble statue, Vatican Library
(
  'tour_scene', 'hippolytus',
  'https://commons.wikimedia.org/wiki/Special:FilePath/HippolytusStatue.JPG',
  'https://en.wikipedia.org/wiki/Hippolytus_of_Rome',
  'Statue of Saint Hippolytus of Rome, 3rd century marble, Vatican Library',
  'Public domain, Wikimedia Commons',
  50, 30
),

-- Scene 10: Origen - Nuremberg Chronicles illustration (1493)
(
  'tour_scene', 'origen',
  'https://commons.wikimedia.org/wiki/Special:FilePath/Nuremberg_chronicles_f_116r_3.png',
  'https://commons.wikimedia.org/wiki/Category:Origen',
  'Origen of Alexandria, from the Nuremberg Chronicle (1493)',
  'Public domain, Wikimedia Commons',
  50, 50
),

-- Scene 11: Gregory Thaumaturgus - icon
(
  'tour_scene', 'gregory-thaumaturgus',
  'https://commons.wikimedia.org/wiki/Special:FilePath/Gregory_Thaumaturgus.jpg',
  'https://commons.wikimedia.org/wiki/Category:Saint_Gregory_of_Neocaesarea_in_icons',
  'Saint Gregory Thaumaturgus (the Wonderworker), Bishop of Neocaesarea',
  'Public domain, Wikimedia Commons',
  50, 50
),

-- Scene 13: Cappadocians - icon of Basil and Gregory of Nazianzus
(
  'tour_scene', 'cappadocians',
  'https://commons.wikimedia.org/wiki/Special:FilePath/Santos-basilio-magno-gregorio-de-nacianzo.jpg',
  'https://commons.wikimedia.org/wiki/Category:Icons_of_Basil_of_Caesarea',
  'Saints Basil the Great and Gregory of Nazianzus, icon',
  'Public domain, Wikimedia Commons',
  50, 50
),

-- Scene 14: Ambrose - 5th century mosaic, San Vittore in Ciel d'Oro, Milan (contemporary)
(
  'tour_scene', 'ambrose',
  'https://commons.wikimedia.org/wiki/Special:FilePath/Sacello_di_san_vittore_in_ciel_d%27oro,_mosaici_del_450-500_dc_ca._09_ambrogio_1.jpg',
  'https://en.wikipedia.org/wiki/Basilica_of_Sant%27Ambrogio',
  E'Saint Ambrose of Milan, mosaic from San Vittore in Ciel d\'Oro, c. 450-500 AD',
  'Public domain, Wikimedia Commons',
  50, 40
),

-- Scene 15: Augustine - 6th century Lateran fresco (earliest known portrait)
(
  'tour_scene', 'augustine',
  'https://commons.wikimedia.org/wiki/Special:FilePath/Augustine_Lateran.jpg',
  'https://commons.wikimedia.org/wiki/Augustine_of_Hippo',
  'Saint Augustine of Hippo, fresco from the Lateran, Rome, 6th century AD (earliest known portrait)',
  'Public domain, Wikimedia Commons',
  50, 30
),

-- Scene 19: Year 530 - Justinian mosaic, San Vitale, Ravenna (6th century, contemporary)
(
  'tour_scene', 'year-530',
  'https://commons.wikimedia.org/wiki/Special:FilePath/Meister_von_San_Vitale_in_Ravenna_003.jpg',
  'https://en.wikipedia.org/wiki/Basilica_of_San_Vitale',
  'Emperor Justinian I and his court, mosaic from the Basilica of San Vitale, Ravenna, c. 547 AD',
  'Public domain, Wikimedia Commons',
  50, 40
);
