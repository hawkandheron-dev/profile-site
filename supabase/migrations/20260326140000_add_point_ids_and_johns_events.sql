-- Add point_ids column for cumulative event visibility in tour scenes
ALTER TABLE "CH_TourScenes" ADD COLUMN IF NOT EXISTS point_ids text[];

-- Bump scene_order for all scenes after 'john' to make room for johns-events
UPDATE "CH_TourScenes" SET scene_order = scene_order + 1 WHERE scene_order > 2;

-- Insert the new johns-events scene
INSERT INTO "CH_TourScenes" (scene_id, scene_order, title, narrative, person_ids, point_ids)
VALUES (
  'johns-events',
  3,
  'Events of the Early Church',
  E'During John\u2019s lifetime, there were a number of pivotal events that changed the world for the young church. Jerusalem was destroyed in 70\u00A0AD, the Apostle Paul wrote his epistles to churches across the Mediterranean, and other books were written by early church leaders.',
  '{jesus,john-evangelist}',
  '{event-crucifixion,event-pentecost,doc-galatians,event-council-jerusalem,doc-mark,doc-philippians,event-fire-rome,event-temple-destroyed,doc-didache,doc-clement-epistle}'
);

-- Set point_ids for all existing scenes
UPDATE "CH_TourScenes" SET point_ids = '{event-crucifixion,event-pentecost}'
WHERE scene_id = 'jesus';

UPDATE "CH_TourScenes" SET point_ids = '{event-crucifixion,event-pentecost,doc-galatians,event-council-jerusalem,doc-mark,doc-philippians,event-fire-rome,event-temple-destroyed,doc-didache,doc-clement-epistle}'
WHERE scene_id = 'john';

UPDATE "CH_TourScenes" SET point_ids = '{event-crucifixion,event-pentecost,doc-galatians,event-council-jerusalem,doc-mark,doc-philippians,event-fire-rome,event-temple-destroyed,doc-didache,doc-clement-epistle,doc-john-fragment,doc-shepherd-hermas}'
WHERE scene_id = 'polycarp';

UPDATE "CH_TourScenes" SET point_ids = '{event-crucifixion,event-pentecost,doc-galatians,event-council-jerusalem,doc-mark,doc-philippians,event-fire-rome,event-temple-destroyed,doc-didache,doc-clement-epistle,doc-john-fragment,doc-shepherd-hermas,doc-muratorian,doc-pauline-p46,doc-against-heresies}'
WHERE scene_id IN ('irenaeus', 'irenaeus-2', 'irenaeus-3');

UPDATE "CH_TourScenes" SET point_ids = '{event-crucifixion,event-pentecost,doc-galatians,event-council-jerusalem,doc-mark,doc-philippians,event-fire-rome,event-temple-destroyed,doc-didache,doc-clement-epistle,doc-john-fragment,doc-shepherd-hermas,doc-muratorian,doc-pauline-p46,doc-against-heresies,doc-thomas-mentioned,doc-on-first-principles}'
WHERE scene_id = 'hippolytus';

UPDATE "CH_TourScenes" SET point_ids = '{event-crucifixion,event-pentecost,doc-galatians,event-council-jerusalem,doc-mark,doc-philippians,event-fire-rome,event-temple-destroyed,doc-didache,doc-clement-epistle,doc-john-fragment,doc-shepherd-hermas,doc-muratorian,doc-pauline-p46,doc-against-heresies,doc-thomas-mentioned,doc-on-first-principles,doc-hexapla,event-decian-persecution}'
WHERE scene_id = 'origen';

-- gregory-thaumaturgus: same as origen (no new events before 303)
UPDATE "CH_TourScenes" SET point_ids = '{event-crucifixion,event-pentecost,doc-galatians,event-council-jerusalem,doc-mark,doc-philippians,event-fire-rome,event-temple-destroyed,doc-didache,doc-clement-epistle,doc-john-fragment,doc-shepherd-hermas,doc-muratorian,doc-pauline-p46,doc-against-heresies,doc-thomas-mentioned,doc-on-first-principles,doc-hexapla,event-decian-persecution}'
WHERE scene_id = 'gregory-thaumaturgus';

UPDATE "CH_TourScenes" SET point_ids = '{event-crucifixion,event-pentecost,doc-galatians,event-council-jerusalem,doc-mark,doc-philippians,event-fire-rome,event-temple-destroyed,doc-didache,doc-clement-epistle,doc-john-fragment,doc-shepherd-hermas,doc-muratorian,doc-pauline-p46,doc-against-heresies,doc-thomas-mentioned,doc-on-first-principles,doc-hexapla,event-decian-persecution,event-diocletian-persecution,event-edict-milan,doc-on-incarnation,doc-ecclesiastical-history-eusebius,doc-codex-vaticanus,council-nicaea}'
WHERE scene_id = 'macrina-elder';

UPDATE "CH_TourScenes" SET point_ids = '{event-crucifixion,event-pentecost,doc-galatians,event-council-jerusalem,doc-mark,doc-philippians,event-fire-rome,event-temple-destroyed,doc-didache,doc-clement-epistle,doc-john-fragment,doc-shepherd-hermas,doc-muratorian,doc-pauline-p46,doc-against-heresies,doc-thomas-mentioned,doc-on-first-principles,doc-hexapla,event-decian-persecution,event-diocletian-persecution,event-edict-milan,doc-on-incarnation,doc-ecclesiastical-history-eusebius,doc-codex-vaticanus,council-nicaea,doc-codex-sinaiticus,doc-catechetical-lectures,doc-athanasius-canon,event-edict-thessalonica,council-constantinople-1}'
WHERE scene_id = 'cappadocians';

-- ambrose: same as cappadocians (no new events before 400)
UPDATE "CH_TourScenes" SET point_ids = '{event-crucifixion,event-pentecost,doc-galatians,event-council-jerusalem,doc-mark,doc-philippians,event-fire-rome,event-temple-destroyed,doc-didache,doc-clement-epistle,doc-john-fragment,doc-shepherd-hermas,doc-muratorian,doc-pauline-p46,doc-against-heresies,doc-thomas-mentioned,doc-on-first-principles,doc-hexapla,event-decian-persecution,event-diocletian-persecution,event-edict-milan,doc-on-incarnation,doc-ecclesiastical-history-eusebius,doc-codex-vaticanus,council-nicaea,doc-codex-sinaiticus,doc-catechetical-lectures,doc-athanasius-canon,event-edict-thessalonica,council-constantinople-1}'
WHERE scene_id = 'ambrose';

UPDATE "CH_TourScenes" SET point_ids = '{event-crucifixion,event-pentecost,doc-galatians,event-council-jerusalem,doc-mark,doc-philippians,event-fire-rome,event-temple-destroyed,doc-didache,doc-clement-epistle,doc-john-fragment,doc-shepherd-hermas,doc-muratorian,doc-pauline-p46,doc-against-heresies,doc-thomas-mentioned,doc-on-first-principles,doc-hexapla,event-decian-persecution,event-diocletian-persecution,event-edict-milan,doc-on-incarnation,doc-ecclesiastical-history-eusebius,doc-codex-vaticanus,council-nicaea,doc-codex-sinaiticus,doc-catechetical-lectures,doc-athanasius-canon,event-edict-thessalonica,council-constantinople-1,doc-confessions,doc-vulgate,event-rome-visigoths,doc-city-of-god}'
WHERE scene_id = 'augustine';

UPDATE "CH_TourScenes" SET point_ids = '{event-crucifixion,event-pentecost,doc-galatians,event-council-jerusalem,doc-mark,doc-philippians,event-fire-rome,event-temple-destroyed,doc-didache,doc-clement-epistle,doc-john-fragment,doc-shepherd-hermas,doc-muratorian,doc-pauline-p46,doc-against-heresies,doc-thomas-mentioned,doc-on-first-principles,doc-hexapla,event-decian-persecution,event-diocletian-persecution,event-edict-milan,doc-on-incarnation,doc-ecclesiastical-history-eusebius,doc-codex-vaticanus,council-nicaea,doc-codex-sinaiticus,doc-catechetical-lectures,doc-athanasius-canon,event-edict-thessalonica,council-constantinople-1,doc-confessions,doc-vulgate,event-rome-visigoths,doc-city-of-god,council-ephesus,council-chalcedon}'
WHERE scene_id = 'prosper';

UPDATE "CH_TourScenes" SET point_ids = '{event-crucifixion,event-pentecost,doc-galatians,event-council-jerusalem,doc-mark,doc-philippians,event-fire-rome,event-temple-destroyed,doc-didache,doc-clement-epistle,doc-john-fragment,doc-shepherd-hermas,doc-muratorian,doc-pauline-p46,doc-against-heresies,doc-thomas-mentioned,doc-on-first-principles,doc-hexapla,event-decian-persecution,event-diocletian-persecution,event-edict-milan,doc-on-incarnation,doc-ecclesiastical-history-eusebius,doc-codex-vaticanus,council-nicaea,doc-codex-sinaiticus,doc-catechetical-lectures,doc-athanasius-canon,event-edict-thessalonica,council-constantinople-1,doc-confessions,doc-vulgate,event-rome-visigoths,doc-city-of-god,council-ephesus,council-chalcedon,event-west-empire-end}'
WHERE scene_id = 'pomerius';

UPDATE "CH_TourScenes" SET point_ids = '{event-crucifixion,event-pentecost,doc-galatians,event-council-jerusalem,doc-mark,doc-philippians,event-fire-rome,event-temple-destroyed,doc-didache,doc-clement-epistle,doc-john-fragment,doc-shepherd-hermas,doc-muratorian,doc-pauline-p46,doc-against-heresies,doc-thomas-mentioned,doc-on-first-principles,doc-hexapla,event-decian-persecution,event-diocletian-persecution,event-edict-milan,doc-on-incarnation,doc-ecclesiastical-history-eusebius,doc-codex-vaticanus,council-nicaea,doc-codex-sinaiticus,doc-catechetical-lectures,doc-athanasius-canon,event-edict-thessalonica,council-constantinople-1,doc-confessions,doc-vulgate,event-rome-visigoths,doc-city-of-god,council-ephesus,council-chalcedon,event-west-empire-end,doc-rule-benedict,event-hagia-sophia}'
WHERE scene_id IN ('caesarius', 'year-530');
