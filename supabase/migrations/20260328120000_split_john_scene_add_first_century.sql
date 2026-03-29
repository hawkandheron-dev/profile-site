-- Restructure john scene: split into john + first-century
-- Add stagger_interval column for configurable stagger speed
-- Update scene data for the new first-century scene

-- Add stagger_interval column
ALTER TABLE "CH_TourScenes" ADD COLUMN IF NOT EXISTS stagger_interval integer;

-- Rename johns-events → first-century and update its content
UPDATE "CH_TourScenes"
SET scene_id = 'first-century',
    title = 'The First Century',
    narrative = E'During John\u2019s lifetime, there were a number of pivotal events that changed the world for the young church. Jerusalem was destroyed in 70\u00A0AD, the Apostle Paul wrote his epistles to churches across the Mediterranean, and other books were written by early church leaders.',
    stagger_ids = '{roman-tiberius,roman-caligula,roman-claudius,roman-nero,roman-galba-otho-vitellius,roman-vespasian,roman-titus,roman-domitian,roman-nerva,roman-trajan}',
    stagger_point_ids = '{event-crucifixion,event-pentecost,doc-galatians,event-council-jerusalem,doc-mark,doc-philippians,event-fire-rome,event-temple-destroyed,doc-didache,doc-clement-epistle}',
    stagger_interval = 600
WHERE scene_id = 'johns-events';

-- Update john scene: remove stagger and point data, keep only jesus + john + augustus
UPDATE "CH_TourScenes"
SET person_ids = '{jesus,john-evangelist,roman-augustus}',
    point_ids = NULL,
    stagger_ids = NULL,
    stagger_point_ids = NULL,
    stagger_interval = NULL
WHERE scene_id = 'john';
