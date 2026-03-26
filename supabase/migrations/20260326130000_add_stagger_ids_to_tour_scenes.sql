-- Add stagger_ids column for sequential reveal animation in tour scenes
ALTER TABLE "CH_TourScenes" ADD COLUMN IF NOT EXISTS stagger_ids text[];

-- Set stagger IDs for the cappadocians scene (grandchildren revealed one at a time)
UPDATE "CH_TourScenes" SET stagger_ids = '{macrina-younger,gregory-nyssa,basil-great}' WHERE scene_id = 'cappadocians';
