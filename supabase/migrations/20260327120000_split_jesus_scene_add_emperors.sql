-- Split jesus scene into intro + Augustus, add emperors to all scenes, update copy

-- Bump all scene_orders by 1 to make room for jesus-intro
UPDATE "CH_TourScenes" SET scene_order = scene_order + 1 WHERE scene_order >= 1;

-- Insert jesus-intro scene
INSERT INTO "CH_TourScenes" (scene_id, scene_order, title, narrative, person_ids, point_ids)
VALUES (
  'jesus-intro', 1, 'Jesus',
  'To explore the history of the Christian church, a good place for us to start is with the life of Jesus.',
  '{jesus}',
  '{event-crucifixion,event-pentecost}'
);

-- Update jesus scene: new narrative + Augustus
UPDATE "CH_TourScenes" SET
  narrative = E'Jesus is born under the reign of Caesar Augustus, who ruled the Roman Empire from 27\u00A0BC to AD\u00A014.\n\nHis disciples later wrote that they saw him rise from the dead, and that forty days later, he ascended into the sky. They passed this testimony down to other followers of Jesus, who then did the same in their time.',
  person_ids = '{jesus,roman-augustus}'
WHERE scene_id = 'jesus';

-- Update john: new narrative + emperors through Trajan
UPDATE "CH_TourScenes" SET
  narrative = E'One of those disciples is a Jewish fisherman named John.\n\nOver the course of John\u2019s long lifetime there are 13 emperors, Jerusalem is destroyed by the Romans, and the church grows from a small Jewish sect in the province of Judea to a network of communities throughout the Empire.',
  person_ids = '{jesus,john-evangelist,roman-augustus,roman-tiberius,roman-caligula,roman-claudius,roman-nero,roman-galba-otho-vitellius,roman-vespasian,roman-titus,roman-domitian,roman-nerva,roman-trajan}'
WHERE scene_id = 'john';

-- Update johns-events: add emperors
UPDATE "CH_TourScenes" SET
  person_ids = '{jesus,john-evangelist,roman-augustus,roman-tiberius,roman-caligula,roman-claudius,roman-nero,roman-galba-otho-vitellius,roman-vespasian,roman-titus,roman-domitian,roman-nerva,roman-trajan}'
WHERE scene_id = 'johns-events';

-- Update polycarp: new narrative + emperors through Antoninus
UPDATE "CH_TourScenes" SET
  narrative = E'In Smyrna, the young Polycarp grows up listening to John\u2019s testimony. Polycarp becomes the bishop of Smyrna; Tertullian writes a century later that the appointment was made by John himself.',
  person_ids = '{jesus,john-evangelist,polycarp,roman-augustus,roman-tiberius,roman-caligula,roman-claudius,roman-nero,roman-galba-otho-vitellius,roman-vespasian,roman-titus,roman-domitian,roman-nerva,roman-trajan,roman-hadrian,roman-antoninus}'
WHERE scene_id = 'polycarp';

-- irenaeus scenes: + Marcus Aurelius, Commodus, Septimius Severus
UPDATE "CH_TourScenes" SET person_ids = '{jesus,john-evangelist,polycarp,irenaeus,roman-augustus,roman-tiberius,roman-caligula,roman-claudius,roman-nero,roman-galba-otho-vitellius,roman-vespasian,roman-titus,roman-domitian,roman-nerva,roman-trajan,roman-hadrian,roman-antoninus,roman-marcus-aurelius,roman-commodus,roman-septimius-severus}' WHERE scene_id IN ('irenaeus', 'irenaeus-2');
UPDATE "CH_TourScenes" SET person_ids = '{jesus,john-evangelist,polycarp,irenaeus,hippolytus,roman-augustus,roman-tiberius,roman-caligula,roman-claudius,roman-nero,roman-galba-otho-vitellius,roman-vespasian,roman-titus,roman-domitian,roman-nerva,roman-trajan,roman-hadrian,roman-antoninus,roman-marcus-aurelius,roman-commodus,roman-septimius-severus}' WHERE scene_id = 'irenaeus-3';

-- hippolytus: + Caracalla, Alexander Severus, Maximinus Thrax
UPDATE "CH_TourScenes" SET person_ids = '{jesus,john-evangelist,polycarp,irenaeus,hippolytus,roman-augustus,roman-tiberius,roman-caligula,roman-claudius,roman-nero,roman-galba-otho-vitellius,roman-vespasian,roman-titus,roman-domitian,roman-nerva,roman-trajan,roman-hadrian,roman-antoninus,roman-marcus-aurelius,roman-commodus,roman-septimius-severus,roman-caracalla,roman-alexander-severus,roman-maximinus-thrax}' WHERE scene_id = 'hippolytus';

-- origen: + Philip, Decius, Gallienus, Valerian
UPDATE "CH_TourScenes" SET person_ids = '{jesus,john-evangelist,polycarp,irenaeus,hippolytus,origen,roman-augustus,roman-tiberius,roman-caligula,roman-claudius,roman-nero,roman-galba-otho-vitellius,roman-vespasian,roman-titus,roman-domitian,roman-nerva,roman-trajan,roman-hadrian,roman-antoninus,roman-marcus-aurelius,roman-commodus,roman-septimius-severus,roman-caracalla,roman-alexander-severus,roman-maximinus-thrax,roman-philip-arab,roman-decius,roman-gallienus,roman-valerian}' WHERE scene_id = 'origen';

-- gregory-thaumaturgus: + Aurelian
UPDATE "CH_TourScenes" SET person_ids = '{jesus,john-evangelist,polycarp,irenaeus,hippolytus,origen,gregory-thaumaturgus,roman-augustus,roman-tiberius,roman-caligula,roman-claudius,roman-nero,roman-galba-otho-vitellius,roman-vespasian,roman-titus,roman-domitian,roman-nerva,roman-trajan,roman-hadrian,roman-antoninus,roman-marcus-aurelius,roman-commodus,roman-septimius-severus,roman-caracalla,roman-alexander-severus,roman-maximinus-thrax,roman-philip-arab,roman-decius,roman-gallienus,roman-valerian,roman-aurelian}' WHERE scene_id = 'gregory-thaumaturgus';

-- macrina-elder: + Diocletian/Maximian, Constantine, Constantius II
UPDATE "CH_TourScenes" SET person_ids = '{jesus,john-evangelist,polycarp,irenaeus,hippolytus,origen,gregory-thaumaturgus,macrina-elder,roman-augustus,roman-tiberius,roman-caligula,roman-claudius,roman-nero,roman-galba-otho-vitellius,roman-vespasian,roman-titus,roman-domitian,roman-nerva,roman-trajan,roman-hadrian,roman-antoninus,roman-marcus-aurelius,roman-commodus,roman-septimius-severus,roman-caracalla,roman-alexander-severus,roman-maximinus-thrax,roman-philip-arab,roman-decius,roman-gallienus,roman-valerian,roman-aurelian,roman-diocletian-maximian,roman-constantine,roman-constantius-ii}' WHERE scene_id = 'macrina-elder';

-- cappadocians: + Julian, Valens, Theodosius I
UPDATE "CH_TourScenes" SET person_ids = '{jesus,john-evangelist,polycarp,irenaeus,hippolytus,origen,gregory-thaumaturgus,macrina-elder,macrina-younger,gregory-nyssa,basil-great,roman-augustus,roman-tiberius,roman-caligula,roman-claudius,roman-nero,roman-galba-otho-vitellius,roman-vespasian,roman-titus,roman-domitian,roman-nerva,roman-trajan,roman-hadrian,roman-antoninus,roman-marcus-aurelius,roman-commodus,roman-septimius-severus,roman-caracalla,roman-alexander-severus,roman-maximinus-thrax,roman-philip-arab,roman-decius,roman-gallienus,roman-valerian,roman-aurelian,roman-diocletian-maximian,roman-constantine,roman-constantius-ii,roman-julian,roman-valens,roman-theodosius-i}' WHERE scene_id = 'cappadocians';

-- ambrose: + Arcadius, Honorius
UPDATE "CH_TourScenes" SET person_ids = '{jesus,john-evangelist,polycarp,irenaeus,hippolytus,origen,gregory-thaumaturgus,macrina-elder,macrina-younger,gregory-nyssa,basil-great,ambrose-milan,roman-augustus,roman-tiberius,roman-caligula,roman-claudius,roman-nero,roman-galba-otho-vitellius,roman-vespasian,roman-titus,roman-domitian,roman-nerva,roman-trajan,roman-hadrian,roman-antoninus,roman-marcus-aurelius,roman-commodus,roman-septimius-severus,roman-caracalla,roman-alexander-severus,roman-maximinus-thrax,roman-philip-arab,roman-decius,roman-gallienus,roman-valerian,roman-aurelian,roman-diocletian-maximian,roman-constantine,roman-constantius-ii,roman-julian,roman-valens,roman-theodosius-i,eastern-arcadius,western-honorius}' WHERE scene_id = 'ambrose';

-- augustine: + Theodosius II, Valentinian III
UPDATE "CH_TourScenes" SET person_ids = '{jesus,john-evangelist,polycarp,irenaeus,hippolytus,origen,gregory-thaumaturgus,macrina-elder,macrina-younger,gregory-nyssa,basil-great,ambrose-milan,augustine,roman-augustus,roman-tiberius,roman-caligula,roman-claudius,roman-nero,roman-galba-otho-vitellius,roman-vespasian,roman-titus,roman-domitian,roman-nerva,roman-trajan,roman-hadrian,roman-antoninus,roman-marcus-aurelius,roman-commodus,roman-septimius-severus,roman-caracalla,roman-alexander-severus,roman-maximinus-thrax,roman-philip-arab,roman-decius,roman-gallienus,roman-valerian,roman-aurelian,roman-diocletian-maximian,roman-constantine,roman-constantius-ii,roman-julian,roman-valens,roman-theodosius-i,eastern-arcadius,western-honorius,eastern-theodosius-ii,western-valentinian-iii}' WHERE scene_id = 'augustine';

-- prosper: + Marcian, Majorian
UPDATE "CH_TourScenes" SET person_ids = '{jesus,john-evangelist,polycarp,irenaeus,hippolytus,origen,gregory-thaumaturgus,macrina-elder,macrina-younger,gregory-nyssa,basil-great,ambrose-milan,augustine,prosper-aquitaine,roman-augustus,roman-tiberius,roman-caligula,roman-claudius,roman-nero,roman-galba-otho-vitellius,roman-vespasian,roman-titus,roman-domitian,roman-nerva,roman-trajan,roman-hadrian,roman-antoninus,roman-marcus-aurelius,roman-commodus,roman-septimius-severus,roman-caracalla,roman-alexander-severus,roman-maximinus-thrax,roman-philip-arab,roman-decius,roman-gallienus,roman-valerian,roman-aurelian,roman-diocletian-maximian,roman-constantine,roman-constantius-ii,roman-julian,roman-valens,roman-theodosius-i,eastern-arcadius,western-honorius,eastern-theodosius-ii,western-valentinian-iii,eastern-marcian,western-majorian}' WHERE scene_id = 'prosper';

-- pomerius: + Leo I, Romulus Augustulus
UPDATE "CH_TourScenes" SET person_ids = '{jesus,john-evangelist,polycarp,irenaeus,hippolytus,origen,gregory-thaumaturgus,macrina-elder,macrina-younger,gregory-nyssa,basil-great,ambrose-milan,augustine,prosper-aquitaine,julianus-pomerius,roman-augustus,roman-tiberius,roman-caligula,roman-claudius,roman-nero,roman-galba-otho-vitellius,roman-vespasian,roman-titus,roman-domitian,roman-nerva,roman-trajan,roman-hadrian,roman-antoninus,roman-marcus-aurelius,roman-commodus,roman-septimius-severus,roman-caracalla,roman-alexander-severus,roman-maximinus-thrax,roman-philip-arab,roman-decius,roman-gallienus,roman-valerian,roman-aurelian,roman-diocletian-maximian,roman-constantine,roman-constantius-ii,roman-julian,roman-valens,roman-theodosius-i,eastern-arcadius,western-honorius,eastern-theodosius-ii,western-valentinian-iii,eastern-marcian,western-majorian,eastern-leo-i,western-romulus-augustulus}' WHERE scene_id = 'pomerius';

-- caesarius: + Justinian I
UPDATE "CH_TourScenes" SET person_ids = '{jesus,john-evangelist,polycarp,irenaeus,hippolytus,origen,gregory-thaumaturgus,macrina-elder,macrina-younger,gregory-nyssa,basil-great,ambrose-milan,augustine,prosper-aquitaine,julianus-pomerius,caesarius-arles,roman-augustus,roman-tiberius,roman-caligula,roman-claudius,roman-nero,roman-galba-otho-vitellius,roman-vespasian,roman-titus,roman-domitian,roman-nerva,roman-trajan,roman-hadrian,roman-antoninus,roman-marcus-aurelius,roman-commodus,roman-septimius-severus,roman-caracalla,roman-alexander-severus,roman-maximinus-thrax,roman-philip-arab,roman-decius,roman-gallienus,roman-valerian,roman-aurelian,roman-diocletian-maximian,roman-constantine,roman-constantius-ii,roman-julian,roman-valens,roman-theodosius-i,eastern-arcadius,western-honorius,eastern-theodosius-ii,western-valentinian-iii,eastern-marcian,western-majorian,eastern-leo-i,western-romulus-augustulus,eastern-justinian-i}' WHERE scene_id = 'caesarius';

-- year-530: all emperors + existing extra people
UPDATE "CH_TourScenes" SET person_ids = '{jesus,john-evangelist,polycarp,irenaeus,hippolytus,origen,gregory-thaumaturgus,macrina-elder,macrina-younger,gregory-nyssa,basil-great,ambrose-milan,augustine,prosper-aquitaine,julianus-pomerius,caesarius-arles,benedict-nursia,columba,finnian-moville,eastern-justinian-i,maurus,roman-augustus,roman-tiberius,roman-caligula,roman-claudius,roman-nero,roman-galba-otho-vitellius,roman-vespasian,roman-titus,roman-domitian,roman-nerva,roman-trajan,roman-hadrian,roman-antoninus,roman-marcus-aurelius,roman-commodus,roman-septimius-severus,roman-caracalla,roman-alexander-severus,roman-maximinus-thrax,roman-philip-arab,roman-decius,roman-gallienus,roman-valerian,roman-aurelian,roman-diocletian-maximian,roman-constantine,roman-constantius-ii,roman-julian,roman-valens,roman-theodosius-i,eastern-arcadius,western-honorius,eastern-theodosius-ii,western-valentinian-iii,eastern-marcian,western-majorian,eastern-leo-i,western-romulus-augustulus}' WHERE scene_id = 'year-530';
