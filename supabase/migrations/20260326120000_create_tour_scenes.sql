-- Tour scenes table: one row per scene in the Getting Started Tour
CREATE TABLE "CH_TourScenes" (
  scene_id text PRIMARY KEY,
  scene_order integer NOT NULL,
  person_ids text[],
  title text NOT NULL,
  narrative text NOT NULL,
  additional_narrative text,
  additional_narrative_style text,
  third_narrative text,
  open_person_id text,
  highlight_connection_id text,
  keep_modal_open boolean NOT NULL DEFAULT false,
  open_year_summary integer,
  include_periods_and_points boolean NOT NULL DEFAULT false,
  is_build_out boolean NOT NULL DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- RLS: anyone can read (including anon), only admins can write
ALTER TABLE "CH_TourScenes" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read tour scenes" ON "CH_TourScenes"
  FOR SELECT USING (true);

CREATE POLICY "Admins can manage tour scenes" ON "CH_TourScenes"
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.users u
      WHERE u.clerk_user_id = current_setting('request.jwt.claims', true)::json->>'sub'
        AND u.role = 'admin'
    )
  );

-- Seed with current 18 scenes
INSERT INTO "CH_TourScenes" (scene_id, scene_order, person_ids, title, narrative, additional_narrative, additional_narrative_style, third_narrative, open_person_id, highlight_connection_id, keep_modal_open, open_year_summary, include_periods_and_points, is_build_out) VALUES
  ('jesus', 1, '{jesus}', 'Jesus', 'This timeline shows how key figures in church history were connected through overlapping lifespans — teacher to student, mentor to disciple — forming an unbroken chain across centuries. We begin with Jesus of Nazareth, whose life and teachings launched a movement that would reshape the world.', NULL, NULL, NULL, NULL, NULL, false, NULL, false, false),
  ('john', 2, '{jesus,john-evangelist}', 'John the Evangelist', 'John, the beloved disciple, outlived the other apostles. Notice how his lifespan stretches across the entire first century, overlapping with the next generation of church leaders.', NULL, NULL, NULL, NULL, NULL, false, NULL, false, false),
  ('polycarp', 3, '{jesus,john-evangelist,polycarp}', 'Polycarp', 'Polycarp of Smyrna was traditionally held to be a disciple of John and ordained as bishop by him, according to Jerome. His life bridges the apostolic age and the era of the early church fathers.', NULL, NULL, NULL, NULL, NULL, false, NULL, false, false),
  ('irenaeus', 4, '{jesus,john-evangelist,polycarp,irenaeus}', 'Irenaeus of Lyons', 'As a boy growing up in Smyrna, Irenaeus listened to the aged Polycarp preach — and through Polycarp, he heard the living echo of the apostle John himself.', NULL, NULL, NULL, NULL, NULL, false, NULL, false, false),
  ('irenaeus-2', 5, '{jesus,john-evangelist,polycarp,irenaeus}', 'Irenaeus of Lyons', 'As a boy growing up in Smyrna, Irenaeus listened to the aged Polycarp preach — and through Polycarp, he heard the living echo of the apostle John himself.', 'Irenaeus carried that apostolic witness westward, becoming bishop of Lyon in Gaul — bringing the good news of Jesus from the heart of Asia Minor to the frontiers of the Roman world.', NULL, NULL, 'irenaeus', NULL, false, NULL, false, false),
  ('irenaeus-3', 6, '{jesus,john-evangelist,polycarp,irenaeus,hippolytus}', 'Irenaeus of Lyons', 'As a boy growing up in Smyrna, Irenaeus listened to the aged Polycarp preach — and through Polycarp, he heard the living echo of the apostle John himself.', 'Irenaeus carried that apostolic witness westward, becoming bishop of Lyon in Gaul — bringing the good news of Jesus from the heart of Asia Minor to the frontiers of the Roman world.', NULL, 'Notice his connections: Polycarp, who shaped him, and Hippolytus of Rome, whom he in turn influenced. Each link in the chain carries the faith forward.', NULL, 'hippolytus', true, NULL, false, false),
  ('hippolytus', 7, '{jesus,john-evangelist,polycarp,irenaeus,hippolytus}', 'Hippolytus of Rome', 'Hippolytus is believed to have been a student of Irenaeus. A prolific writer, he carried the theological tradition forward in Rome.', NULL, NULL, NULL, NULL, NULL, false, NULL, false, false),
  ('origen', 8, '{jesus,john-evangelist,polycarp,irenaeus,hippolytus,origen}', 'Origen', 'Origen heard Hippolytus preach in Rome. One of the most influential early Christian scholars, he established a school of theology in Alexandria and later Caesarea.', NULL, NULL, NULL, NULL, NULL, false, NULL, false, false),
  ('gregory-thaumaturgus', 9, '{jesus,john-evangelist,polycarp,irenaeus,hippolytus,origen,gregory-thaumaturgus}', 'Gregory Thaumaturgus', 'Gregory Thaumaturgus was a student of Origen in Caesarea. His grateful farewell address to Origen survives as one of the earliest accounts of a Christian education.', NULL, NULL, NULL, NULL, NULL, false, NULL, false, false),
  ('macrina-elder', 10, '{jesus,john-evangelist,polycarp,irenaeus,hippolytus,origen,gregory-thaumaturgus,macrina-elder}', 'Macrina the Elder', 'Macrina the Elder studied under Gregory Thaumaturgus in Pontus. During the persecutions under Diocletian, she and her husband fled into the wilderness for seven years, preserving the faith they had received.', NULL, NULL, NULL, NULL, NULL, false, NULL, false, false),
  ('cappadocians', 11, '{jesus,john-evangelist,polycarp,irenaeus,hippolytus,origen,gregory-thaumaturgus,macrina-elder,macrina-younger,gregory-nyssa,basil-great}', 'The Grandchildren', 'Macrina the Younger, Gregory of Nyssa, and Basil the Great were grandchildren of Macrina the Elder. She passed the faith directly to them, and they became three of the most important theologians of the fourth century.', NULL, NULL, NULL, NULL, NULL, false, NULL, false, false),
  ('ambrose', 12, '{jesus,john-evangelist,polycarp,irenaeus,hippolytus,origen,gregory-thaumaturgus,macrina-elder,macrina-younger,gregory-nyssa,basil-great,ambrose-milan}', 'Ambrose of Milan', 'Ambrose of Milan corresponded with Basil the Great. A Roman governor who became bishop, he was renowned for his eloquent preaching and his defense of orthodoxy.', NULL, NULL, NULL, NULL, NULL, false, NULL, false, false),
  ('augustine', 13, '{jesus,john-evangelist,polycarp,irenaeus,hippolytus,origen,gregory-thaumaturgus,macrina-elder,macrina-younger,gregory-nyssa,basil-great,ambrose-milan,augustine}', 'Augustine of Hippo', 'Augustine was baptized by Ambrose in Milan in 387. His writings — especially the Confessions and the City of God — shaped Western Christianity for a millennium and beyond.', NULL, NULL, NULL, NULL, NULL, false, NULL, false, false),
  ('prosper', 14, '{jesus,john-evangelist,polycarp,irenaeus,hippolytus,origen,gregory-thaumaturgus,macrina-elder,macrina-younger,gregory-nyssa,basil-great,ambrose-milan,augustine,prosper-aquitaine}', 'Prosper of Aquitaine', 'Prosper of Aquitaine corresponded with Augustine and became one of his most devoted defenders, championing his theology of grace in the debates that followed.', NULL, NULL, NULL, NULL, NULL, false, NULL, false, false),
  ('pomerius', 15, '{jesus,john-evangelist,polycarp,irenaeus,hippolytus,origen,gregory-thaumaturgus,macrina-elder,macrina-younger,gregory-nyssa,basil-great,ambrose-milan,augustine,prosper-aquitaine,julianus-pomerius}', 'Julianus Pomerius', E'Meanwhile, back in North Africa, Julianus Pomerius preserved Augustine\u2019s works by fleeing with them to Gaul to escape the Vandal conquest. He established a school in Arles, ensuring that Augustine\u2019s thought survived the collapse of Roman Africa.', NULL, NULL, NULL, NULL, NULL, false, NULL, false, false),
  ('caesarius', 16, '{jesus,john-evangelist,polycarp,irenaeus,hippolytus,origen,gregory-thaumaturgus,macrina-elder,macrina-younger,gregory-nyssa,basil-great,ambrose-milan,augustine,prosper-aquitaine,julianus-pomerius,caesarius-arles}', 'Caesarius of Arles', E'Caesarius of Arles was a student of Pomerius. As bishop, he drew heavily on Augustine\u2019s writings in his sermons, bringing the theology of the early church to the people of early medieval Gaul.', NULL, NULL, NULL, NULL, NULL, false, NULL, false, false),
  ('year-530', 17, '{jesus,john-evangelist,polycarp,irenaeus,hippolytus,origen,gregory-thaumaturgus,macrina-elder,macrina-younger,gregory-nyssa,basil-great,ambrose-milan,augustine,prosper-aquitaine,julianus-pomerius,caesarius-arles,benedict-nursia,columba,finnian-moville,eastern-justinian-i,maurus}', E'What else is going on in 530\u00A0AD?', 'By the year 530, Caesarius is an old man. The Western Roman Empire has fallen, but the faith endures. Justinian reigns in Constantinople, codifying Roman law. Benedict of Nursia is writing his Rule, laying the foundation for Western monasticism.', E'Click on a blank part of the timeline to see who\u2019s where, which monarchs are reigning, and what events take place before, during, and after a given year.', 'italic', NULL, NULL, NULL, false, 530, true, false),
  ('build-out', 18, NULL, 'The Full Picture', E'From Jesus to Caesarius \u2014 an unbroken chain of overlapping lifespans spanning over five centuries. Now see the complete timeline: hundreds of interconnected lives across two millennia. Explore at your leisure.', NULL, NULL, NULL, NULL, NULL, false, NULL, false, true);
