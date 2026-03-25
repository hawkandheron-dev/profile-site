-- Add Macrina the Elder and Julianus Pomerius to CH_People for the Getting Started Tour.

INSERT INTO public."CH_People" (person_id, name, birth_date, death_date, birth_year, death_year, location, role_type, era_id, is_emperor) VALUES
  ('macrina-elder', 'Macrina the Elder', '0270-01-01', '0340-01-01', 270, 340, 'Neocaesarea, Pontus', 'person', 'era-ante-nicene', false),
  ('julianus-pomerius', 'Julianus Pomerius', '0440-01-01', '0500-01-01', 440, 500, 'North Africa / Gaul', 'person', 'era-monks-missionaries', false)
ON CONFLICT DO NOTHING;

-- Add connections for the tour chain
INSERT INTO public."CH_Connections" (person_id_1, person_id_2, relationship_type) VALUES
  ('jesus', 'john-evangelist', 'known'),
  ('irenaeus', 'hippolytus', 'known'),
  ('hippolytus', 'origen', 'known'),
  ('basil-great', 'ambrose-milan', 'known'),
  ('gregory-thaumaturgus', 'macrina-elder', 'known'),
  ('macrina-elder', 'macrina-younger', 'known'),
  ('macrina-elder', 'basil-great', 'known'),
  ('macrina-elder', 'gregory-nyssa', 'known'),
  ('augustine', 'julianus-pomerius', 'known'),
  ('julianus-pomerius', 'caesarius-arles', 'known')
ON CONFLICT DO NOTHING;
