-- Add separate stagger intervals for people vs points
-- Allows emperors to build faster than events (or vice versa)

ALTER TABLE "CH_TourScenes"
  ADD COLUMN IF NOT EXISTS stagger_person_interval integer,
  ADD COLUMN IF NOT EXISTS stagger_point_interval integer;

-- Update first-century scene: emperors at 300ms (2x faster), events at 80ms (near-simultaneous)
UPDATE "CH_TourScenes"
SET stagger_person_interval = 300,
    stagger_point_interval = 80
WHERE scene_id = 'first-century';
