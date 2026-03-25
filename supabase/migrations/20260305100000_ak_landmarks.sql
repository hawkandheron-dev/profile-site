-- Create AK_Landmarks table for Points of Interest
CREATE TABLE IF NOT EXISTS public."AK_Landmarks" (
  landmark_id   text NOT NULL,
  name          text NOT NULL,
  lat           double precision NOT NULL,
  lng           double precision NOT NULL,
  landmark_type text NOT NULL DEFAULT 'monument',
  kingdom_id    text,
  place_id      text,
  built_year    integer,
  end_year      integer,
  description   text,
  search_terms  text,
  reference_url text,
  created_at    timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT "AK_Landmarks_pkey" PRIMARY KEY (landmark_id),
  CONSTRAINT "AK_Landmarks_kingdom_fkey" FOREIGN KEY (kingdom_id)
    REFERENCES public."AK_Kingdoms"(kingdom_id) ON DELETE SET NULL,
  CONSTRAINT "AK_Landmarks_place_fkey" FOREIGN KEY (place_id)
    REFERENCES public."AK_Places"(place_id) ON DELETE SET NULL
);

ALTER TABLE public."AK_Landmarks" ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read access" ON public."AK_Landmarks" FOR SELECT USING (true);

-- Seed ~20 landmarks
INSERT INTO public."AK_Landmarks" (landmark_id, name, lat, lng, landmark_type, kingdom_id, place_id, built_year, end_year, description, search_terms, reference_url) VALUES
('lalibela-churches', 'Rock-Hewn Churches of Lalibela', 12.03, 39.04, 'church', 'ethiopia', 'lalibela', 1200, NULL, 'Eleven monolithic rock-hewn churches carved from living rock during the reign of King Lalibela. A UNESCO World Heritage Site and major pilgrimage destination for Ethiopian Orthodox Christians.', 'Lalibela rock church Ethiopia monolithic UNESCO', 'https://en.wikipedia.org/wiki/Rock-hewn_churches_of_Lalibela'),
('great-mosque-djenne', 'Great Mosque of Djenné', 13.905, -4.554, 'mosque', 'mali', 'djenne', 1240, NULL, 'The largest mud-brick building in the world. Originally built in the 13th century, the current structure dates to 1907 and is rebuilt annually by the community. A UNESCO World Heritage Site.', 'Great Mosque Djenne mud brick Mali UNESCO', 'https://en.wikipedia.org/wiki/Great_Mosque_of_Djenn%C3%A9'),
('sankore-mosque', 'Sankore Mosque & University', 16.775, -3.007, 'university', 'mali', 'timbuktu', 1325, NULL, 'One of three great mosques of Timbuktu and the center of the University of Sankore, which at its peak had 25,000 students and one of the largest libraries in Africa.', 'Sankore Madrasah Timbuktu university mosque Mali', 'https://en.wikipedia.org/wiki/Sankore_Madrasah'),
('great-enclosure', 'Great Enclosure', -20.27, 30.93, 'ruins', 'great-zimbabwe', 'great-zimbabwe', 1100, 1450, 'The largest ancient structure in sub-Saharan Africa south of the Sahara. Its outer wall is 250m long, 5m thick, and 11m high — built entirely without mortar.', 'Great Zimbabwe enclosure ruins stone wall', 'https://en.wikipedia.org/wiki/Great_Enclosure'),
('meroe-pyramids', 'Pyramids of Meroë', 16.938, 33.749, 'tomb', 'kush', 'meroe', -700, NULL, 'Over 200 pyramids serving as tombs for Kushite kings and queens. Steeper and smaller than Egyptian pyramids, they represent the largest collection of pyramids in the world.', 'Meroe pyramids Kush Sudan Nubian', 'https://en.wikipedia.org/wiki/Mero%C3%AB#Pyramids'),
('fasil-ghebbi', 'Fasil Ghebbi (Royal Enclosure)', 12.609, 37.468, 'palace', 'ethiopia', 'gondar', 1636, NULL, 'A fortress-city of castles and palaces built by Emperor Fasilides and his successors. Known as the "Camelot of Africa," it blends Ethiopian, Portuguese, Moorish, and Indian architectural styles.', 'Fasil Ghebbi Gondar castle Ethiopia royal', 'https://en.wikipedia.org/wiki/Fasil_Ghebbi'),
('kilwa-husuni-kubwa', 'Husuni Kubwa Palace', -8.96, 39.52, 'palace', 'kilwa', 'kilwa-kisiwani', 1245, NULL, 'The largest pre-colonial structure in sub-Saharan East Africa. This coral-stone palace complex included an octagonal swimming pool, audience courts, and over 100 rooms.', 'Husuni Kubwa palace Kilwa Kisiwani ruins coral', 'https://en.wikipedia.org/wiki/Husuni_Kubwa'),
('benin-walls-landmark', 'Walls of Benin City', 6.34, 5.63, 'fortress', 'benin', 'benin-city', 1450, NULL, 'Once the world''s largest earthwork, estimated at 16,000 km of walls enclosing 6,500 sq km. Described by the Guinness Book of Records as the largest earthwork carried out prior to the mechanical era.', 'Benin City walls earthwork Iya fortification', 'https://en.wikipedia.org/wiki/Walls_of_Benin'),
('djinguereber-mosque', 'Djinguereber Mosque', 16.773, -3.012, 'mosque', 'mali', 'timbuktu', 1327, NULL, 'Built by Mansa Musa after his pilgrimage to Mecca, designed by the Andalusian architect Abu Es Haq es Saheli. One of the three great mosques of Timbuktu.', 'Djinguereber mosque Timbuktu Mansa Musa Mali', 'https://en.wikipedia.org/wiki/Djinguereber_Mosque'),
('aksum-stelae', 'Stelae of Aksum', 14.13, 38.72, 'monument', 'aksum', 'aksum-city', 300, NULL, 'Towering granite obelisks, the largest standing at 24 metres. Carved to resemble multi-story buildings, they mark royal tombs and are among the tallest monolithic structures ever erected.', 'Axum stelae obelisk Ethiopia Aksum granite', 'https://en.wikipedia.org/wiki/Obelisk_of_Axum'),
('al-azhar-mosque', 'Al-Azhar Mosque', 30.046, 31.263, 'mosque', 'fatimid', 'cairo', 970, NULL, 'Founded by the Fatimid Caliphate, it became the center of Al-Azhar University — the oldest continuously operating university in the world and the most prestigious seat of Islamic learning.', 'Al-Azhar mosque Cairo Fatimid university Islam', 'https://en.wikipedia.org/wiki/Al-Azhar_Mosque'),
('carthage-tophet', 'Tophet of Carthage', 36.843, 10.323, 'archaeological-site', 'carthage', 'carthage-city', -800, -146, 'An ancient sacred precinct containing thousands of urns with cremated remains. Its purpose remains debated — either a cemetery for infants or a site of child sacrifice.', 'Tophet Carthage Tanit archaeological Punic', 'https://en.wikipedia.org/wiki/Tophet'),
('manhyia-palace', 'Manhyia Palace', 6.695, -1.616, 'palace', 'ashanti', 'kumasi', 1720, NULL, 'The seat of the Ashanti king (Asantehene). The current building was constructed by the British in 1925 after the original was destroyed; the palace grounds are deeply tied to the Golden Stool.', 'Manhyia Palace Kumasi Ashanti Asantehene Ghana', 'https://en.wikipedia.org/wiki/Manhyia_Palace'),
('koutoubia-mosque', 'Koutoubia Mosque', 31.624, -7.994, 'mosque', 'almoravid', 'marrakech', 1147, NULL, 'The largest mosque in Marrakech. Its 77-metre minaret, visible from 30 km away, set the template for the Giralda in Seville and the Hassan Tower in Rabat.', 'Koutoubia mosque Marrakech Almohad minaret Morocco', 'https://en.wikipedia.org/wiki/Koutoubia_Mosque'),
('nok-terracotta', 'Nok Terracotta Sculptures', 9.92, 8.89, 'archaeological-site', 'nok', 'nok-center', -500, NULL, 'The earliest known figurative sculpture in sub-Saharan Africa. These elaborate terracotta heads and figures demonstrate advanced artistic skill from as early as 500 BC.', 'Nok terracotta sculpture Nigeria Iron Age', 'https://en.wikipedia.org/wiki/Nok_culture'),
('mapungubwe-hill', 'Mapungubwe Hill', -22.19, 29.25, 'archaeological-site', NULL, 'mapungubwe', 1075, 1300, 'A hilltop kingdom that was the first class-based society in Southern Africa. Famous for its gold rhino figurine and royal burials with gold and glass beads.', 'Mapungubwe hill gold rhino South Africa archaeological', 'https://en.wikipedia.org/wiki/Mapungubwe'),
('gedi-ruins', 'Gedi Ruins', -3.31, 40.02, 'ruins', NULL, NULL, 1100, 1600, 'A mysterious Swahili town on the Kenyan coast, abandoned in the 17th century. Features a palace, Great Mosque, and houses with indoor plumbing and flushing toilets.', 'Gedi ruins Swahili Kenya coast medieval', 'https://en.wikipedia.org/wiki/Gedi_Ruins'),
('great-mosque-kilwa', 'Great Mosque of Kilwa', -8.957, 39.523, 'mosque', 'kilwa', 'kilwa-kisiwani', 1000, NULL, 'The oldest standing mosque on the East African coast. Built of coral stone, it was expanded several times and demonstrates the sophistication of Swahili architecture.', 'Great Mosque Kilwa Kisiwani Swahili coral stone', 'https://en.wikipedia.org/wiki/Great_Mosque_of_Kilwa'),
('debre-damo', 'Debre Damo Monastery', 14.373, 39.176, 'church', 'aksum', NULL, 500, NULL, 'One of the oldest monasteries in Ethiopia, accessible only by climbing a 15-metre cliff using a leather rope. Said to have been founded by Abuna Aregawi, one of the Nine Saints.', 'Debre Damo monastery Ethiopia cliff Aksumite', 'https://en.wikipedia.org/wiki/Debre_Damo'),
('songo-mnara', 'Songo Mnara Ruins', -9.05, 39.56, 'ruins', 'kilwa', NULL, 1400, 1600, 'Ruins of a 15th-century Swahili trading town on an island south of Kilwa. Features five mosques, a palace complex, and dozens of stone houses arranged around open courtyards.', 'Songo Mnara ruins Swahili island Tanzania', 'https://en.wikipedia.org/wiki/Songo_Mnara')
ON CONFLICT (landmark_id) DO NOTHING;
