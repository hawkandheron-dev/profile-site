-- Add stagger_point_ids column and configure sequential reveal on john scene
-- Also remove point_ids from jesus scenes (events shouldn't appear until john)

-- Add column
ALTER TABLE "CH_TourScenes" ADD COLUMN IF NOT EXISTS stagger_point_ids text[];

-- Remove point_ids from jesus-intro and jesus scenes
UPDATE "CH_TourScenes" SET point_ids = NULL WHERE scene_id IN ('jesus-intro', 'jesus');

-- Set stagger_ids on john scene (emperors revealed one by one)
UPDATE "CH_TourScenes" SET stagger_ids = '{john-evangelist,roman-tiberius,roman-caligula,roman-claudius,roman-nero,roman-galba-otho-vitellius,roman-vespasian,roman-titus,roman-domitian,roman-nerva,roman-trajan}'
WHERE scene_id = 'john';

-- Set stagger_point_ids on john scene (events revealed one by one after emperors)
UPDATE "CH_TourScenes" SET stagger_point_ids = '{event-crucifixion,event-pentecost,doc-galatians,event-council-jerusalem,doc-mark,doc-philippians,event-fire-rome,event-temple-destroyed,doc-didache,doc-clement-epistle}'
WHERE scene_id = 'john';
