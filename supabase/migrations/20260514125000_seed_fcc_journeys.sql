-- Seed data for the First Century Church Directory:
-- Paul's missionary journeys, their stops, and the people who traveled on them.

begin;

-- ── Journeys ─────────────────────────────────────────────────────────────────
insert into public."FCC_Journeys"
  (journey_id, name, person_id, description, color, approx_start_year, approx_end_year, sort_order) values
  ('first-journey',   'Paul''s First Missionary Journey',  'paul',
   'From Antioch through Cyprus and the cities of Galatia with Barnabas and John Mark.',
   '#c0894a', 47, 48, 1),
  ('second-journey',  'Paul''s Second Missionary Journey', 'paul',
   'From Antioch through Galatia into Macedonia and Achaia with Silas, Timothy, and Luke.',
   '#4a90c0', 49, 52, 2),
  ('third-journey',   'Paul''s Third Missionary Journey',  'paul',
   'From Antioch through Galatia and Asia, centered on Ephesus, then back through Macedonia and Achaia to Jerusalem.',
   '#5cb85c', 53, 57, 3),
  ('journey-to-rome', 'Paul''s Voyage to Rome',            'paul',
   'Paul''s journey as a prisoner from Caesarea to Rome, including the shipwreck on Malta.',
   '#b05ca0', 59, 60, 4);

-- ── Journey stops ────────────────────────────────────────────────────────────
-- First journey
insert into public."FCC_JourneyStops" (journey_id, stop_order, church_id, label, lat, lng, description, scripture_ref) values
  ('first-journey', 1, 'antioch',         null, null, null, 'Sent out by the church with prayer and fasting.', 'Acts 13:1-3'),
  ('first-journey', 2, 'salamis',         null, null, null, 'Proclaimed the word in the synagogues of Cyprus.', 'Acts 13:4-5'),
  ('first-journey', 3, 'paphos',          null, null, null, 'The proconsul Sergius Paulus believed.', 'Acts 13:6-12'),
  ('first-journey', 4, 'perga',           null, null, null, 'John Mark left and returned to Jerusalem.', 'Acts 13:13'),
  ('first-journey', 5, 'antioch-pisidia', null, null, null, 'A landmark synagogue sermon; Paul turns to the Gentiles.', 'Acts 13:14-52'),
  ('first-journey', 6, 'iconium',         null, null, null, 'Many Jews and Greeks believed before opposition rose.', 'Acts 14:1-7'),
  ('first-journey', 7, 'lystra',          null, null, null, 'A lame man healed; Paul stoned and left for dead.', 'Acts 14:8-20'),
  ('first-journey', 8, 'derbe',           null, null, null, 'Many disciples made before retracing the route.', 'Acts 14:20-21'),
  ('first-journey', 9, 'antioch',         null, null, null, 'Returned to report all that God had done.', 'Acts 14:26-28');

-- Second journey
insert into public."FCC_JourneyStops" (journey_id, stop_order, church_id, label, lat, lng, description, scripture_ref) values
  ('second-journey',  1, 'antioch',      null, null, null, 'Set out with Silas after parting from Barnabas.', 'Acts 15:36-41'),
  ('second-journey',  2, 'derbe',        null, null, null, 'Revisited the Galatian churches to strengthen them.', 'Acts 16:1'),
  ('second-journey',  3, 'lystra',       null, null, null, 'Timothy joined the company here.', 'Acts 16:1-5'),
  ('second-journey',  4, 'troas',        null, null, null, 'The vision of the Macedonian man; Luke joins.', 'Acts 16:8-10'),
  ('second-journey',  5, 'philippi',     null, null, null, 'Lydia believes; Paul and Silas imprisoned and freed.', 'Acts 16:11-40'),
  ('second-journey',  6, 'thessalonica', null, null, null, 'Three Sabbaths of reasoning in the synagogue.', 'Acts 17:1-9'),
  ('second-journey',  7, 'berea',        null, null, null, 'The Bereans examined the Scriptures daily.', 'Acts 17:10-15'),
  ('second-journey',  8, 'athens',       null, null, null, 'Paul addressed the Areopagus about the unknown god.', 'Acts 17:16-34'),
  ('second-journey',  9, 'corinth',      null, null, null, 'Eighteen months of ministry with Priscilla and Aquila.', 'Acts 18:1-17'),
  ('second-journey', 10, 'cenchreae',    null, null, null, 'Paul cut his hair for a vow before sailing.', 'Acts 18:18'),
  ('second-journey', 11, 'ephesus',      null, null, null, 'A brief visit; Priscilla and Aquila remained.', 'Acts 18:19-21'),
  ('second-journey', 12, 'caesarea',     null, null, null, 'Landed and went up to greet the church.', 'Acts 18:22'),
  ('second-journey', 13, 'antioch',      null, null, null, 'Returned to the sending church.', 'Acts 18:22');

-- Third journey
insert into public."FCC_JourneyStops" (journey_id, stop_order, church_id, label, lat, lng, description, scripture_ref) values
  ('third-journey',  1, 'antioch',   null, null, null, 'Set out again to strengthen the disciples.', 'Acts 18:23'),
  ('third-journey',  2, 'galatia',   null, null, null, 'Traveled through Galatia and Phrygia strengthening believers.', 'Acts 18:23'),
  ('third-journey',  3, 'ephesus',   null, null, null, 'Over two years of ministry; the word spread through all Asia.', 'Acts 19:1-41'),
  ('third-journey',  4, 'troas',     null, null, null, 'Eutychus restored to life during a long night of teaching.', 'Acts 20:5-12'),
  ('third-journey',  5, 'philippi',  null, null, null, 'Passed back through Macedonia encouraging the churches.', 'Acts 20:1-6'),
  ('third-journey',  6, 'corinth',   null, null, null, 'Three months in Greece before retracing the route.', 'Acts 20:2-3'),
  ('third-journey',  7, 'miletus',   null, null, null, 'A tearful farewell to the Ephesian elders.', 'Acts 20:15-38'),
  ('third-journey',  8, 'tyre',      null, null, null, 'The disciples warned Paul through the Spirit not to go on.', 'Acts 21:3-6'),
  ('third-journey',  9, 'ptolemais', null, null, null, 'Greeted the believers and stayed a day.', 'Acts 21:7'),
  ('third-journey', 10, 'caesarea',  null, null, null, 'Agabus foretold Paul''s arrest at the house of Philip.', 'Acts 21:8-14'),
  ('third-journey', 11, 'jerusalem', null, null, null, 'Paul arrested in the temple courts.', 'Acts 21:15-36');

-- Voyage to Rome
insert into public."FCC_JourneyStops" (journey_id, stop_order, church_id, label, lat, lng, description, scripture_ref) values
  ('journey-to-rome', 1, 'caesarea', null,            null,    null,   'Set sail as a prisoner under the centurion Julius.', 'Acts 27:1-2'),
  ('journey-to-rome', 2, 'sidon',    null,            null,    null,   'Julius let Paul visit friends who cared for his needs.', 'Acts 27:3'),
  ('journey-to-rome', 3, null,       'Myra',          36.2589, 29.9850,'Transferred to an Alexandrian ship bound for Italy.', 'Acts 27:5-6'),
  ('journey-to-rome', 4, 'crete',    'Fair Havens',   34.9167, 24.7500,'Sheltered briefly before the storm drove the ship out to sea.', 'Acts 27:7-13'),
  ('journey-to-rome', 5, null,       'Malta',         35.8990, 14.5146,'Shipwrecked; Paul healed many on the island over the winter.', 'Acts 27:39-28:10'),
  ('journey-to-rome', 6, 'puteoli',  null,            null,    null,   'Found believers and stayed seven days at their invitation.', 'Acts 28:13-14'),
  ('journey-to-rome', 7, 'rome',     null,            null,    null,   'Reached Rome and preached the kingdom under guard for two years.', 'Acts 28:16-31');

-- ── Journey people ───────────────────────────────────────────────────────────
insert into public."FCC_JourneyPeople" (journey_id, person_id, role) values
  ('first-journey',  'paul',        'leader'),
  ('first-journey',  'barnabas',    'leader'),
  ('first-journey',  'john-mark',   'assistant'),
  ('second-journey', 'paul',        'leader'),
  ('second-journey', 'silas',       'companion'),
  ('second-journey', 'timothy',     'companion'),
  ('second-journey', 'luke',        'companion'),
  ('third-journey',  'paul',        'leader'),
  ('third-journey',  'timothy',     'companion'),
  ('third-journey',  'luke',        'companion'),
  ('third-journey',  'tychicus',    'companion'),
  ('third-journey',  'trophimus',   'companion'),
  ('third-journey',  'aristarchus', 'companion'),
  ('third-journey',  'gaius-derbe', 'companion'),
  ('third-journey',  'sopater',     'companion'),
  ('third-journey',  'secundus',    'companion'),
  ('third-journey',  'erastus',     'companion'),
  ('journey-to-rome','paul',        'prisoner'),
  ('journey-to-rome','luke',        'companion'),
  ('journey-to-rome','aristarchus', 'companion');

commit;
