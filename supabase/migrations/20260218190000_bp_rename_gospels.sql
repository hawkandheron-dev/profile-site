-- Rename "Gospels" narrative age to "Life of Jesus"
UPDATE public."BP_NarrativeAges"
   SET name = 'Life of Jesus'
 WHERE age_id = 'age-gospels';
