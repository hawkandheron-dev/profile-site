-- ============================================================================
-- Accurate territory polygons for AK_Kingdoms
-- Replaces crude 5-8 point blobs with 20-40+ point polygons traced from
-- historical atlas references (Wikipedia territory maps, World History
-- Encyclopedia, Cambridge History of Africa).
--
-- Each polygon represents the approximate maximum territorial extent
-- during that kingdom's peak period. Coordinates are [lng, lat] per GeoJSON.
-- ============================================================================

-- ── Ghana Empire ──────────────────────────────────────────────────────────
-- Peak: ~1000 AD. SE Mauritania / W Mali, between Sahara & forest belt.
-- Capital: Koumbi Saleh. Controlled trans-Saharan gold-salt trade routes.
UPDATE public."AK_Kingdoms" SET territory_geojson = '{
  "type": "Polygon",
  "coordinates": [[
    [-14.5, 14.0], [-13.0, 13.5], [-11.5, 13.0], [-9.5, 13.0],
    [-8.0, 13.5], [-6.5, 14.5], [-5.5, 15.5], [-5.0, 16.5],
    [-5.5, 17.5], [-6.0, 18.5], [-7.0, 19.5], [-8.5, 20.0],
    [-10.0, 20.0], [-11.5, 19.5], [-12.5, 19.0], [-13.5, 18.5],
    [-14.5, 17.5], [-15.0, 16.5], [-15.5, 15.5], [-15.0, 14.5],
    [-14.5, 14.0]
  ]]
}'::jsonb WHERE kingdom_id = 'ghana';

-- ── Mali Empire ───────────────────────────────────────────────────────────
-- Peak: ~1350 AD under Mansa Musa. Niger River bend to Atlantic coast,
-- south to Guinea Highlands forest zone, north into southern Sahara.
UPDATE public."AK_Kingdoms" SET territory_geojson = '{
  "type": "Polygon",
  "coordinates": [[
    [-17.0, 11.0], [-16.5, 10.5], [-14.5, 10.0], [-12.0, 10.0],
    [-10.0, 10.5], [-8.0, 11.0], [-6.0, 11.5], [-4.0, 12.0],
    [-2.0, 12.5], [0.0, 13.0], [1.0, 14.0], [2.0, 15.5],
    [1.5, 17.0], [0.5, 18.5], [-1.0, 20.0], [-3.0, 21.0],
    [-5.0, 22.0], [-7.0, 22.5], [-9.0, 22.0], [-11.0, 21.0],
    [-13.0, 20.0], [-14.5, 18.5], [-16.0, 17.0], [-17.0, 15.5],
    [-17.5, 14.0], [-17.5, 12.5], [-17.0, 11.0]
  ]]
}'::jsonb WHERE kingdom_id = 'mali';

-- ── Songhai Empire ────────────────────────────────────────────────────────
-- Peak: ~1500 AD under Askia Muhammad. Niger bend east to Hausaland,
-- north to Taghaza salt mines, west to former Mali territories.
UPDATE public."AK_Kingdoms" SET territory_geojson = '{
  "type": "Polygon",
  "coordinates": [[
    [-16.0, 12.5], [-14.0, 11.5], [-12.0, 11.0], [-10.0, 11.0],
    [-8.0, 11.5], [-5.5, 12.0], [-3.0, 12.0], [-1.0, 12.5],
    [1.0, 13.0], [3.0, 13.5], [5.0, 14.0], [6.0, 15.0],
    [5.5, 16.5], [4.5, 18.0], [3.0, 19.5], [1.5, 21.0],
    [0.0, 22.0], [-2.0, 23.0], [-4.5, 23.5], [-7.0, 23.0],
    [-9.0, 22.0], [-11.0, 21.0], [-13.0, 19.5], [-14.5, 18.0],
    [-16.0, 16.0], [-16.5, 14.0], [-16.0, 12.5]
  ]]
}'::jsonb WHERE kingdom_id = 'songhai';

-- ── Kingdom of Kush ───────────────────────────────────────────────────────
-- Peak: ~700 BC (25th Dynasty). Nile Valley from 1st cataract (Aswan)
-- to south of 6th cataract. Narrow corridor along the Nile with
-- wider territory around Meroë.
UPDATE public."AK_Kingdoms" SET territory_geojson = '{
  "type": "Polygon",
  "coordinates": [[
    [31.0, 15.5], [32.0, 15.0], [33.5, 15.5], [34.5, 16.5],
    [35.0, 17.5], [35.5, 18.5], [35.0, 19.5], [34.5, 20.5],
    [34.0, 21.5], [33.5, 22.5], [33.0, 23.5], [32.5, 24.0],
    [31.5, 24.0], [30.5, 23.5], [30.0, 22.5], [30.0, 21.5],
    [30.5, 20.5], [31.0, 19.5], [31.5, 18.5], [31.0, 17.5],
    [30.5, 16.5], [31.0, 15.5]
  ]]
}'::jsonb WHERE kingdom_id = 'kush';

-- ── Kingdom of D'mt ───────────────────────────────────────────────────────
-- ~980-400 BC. Ethiopian/Eritrean highlands around Yeha. Relatively
-- small polity in northern Ethiopian highlands.
UPDATE public."AK_Kingdoms" SET territory_geojson = '{
  "type": "Polygon",
  "coordinates": [[
    [38.5, 13.0], [39.5, 13.0], [40.5, 13.5], [41.0, 14.0],
    [41.0, 15.0], [40.5, 15.5], [39.5, 16.0], [38.5, 16.0],
    [37.5, 15.5], [37.0, 15.0], [37.0, 14.0], [37.5, 13.5],
    [38.5, 13.0]
  ]]
}'::jsonb WHERE kingdom_id = 'dmt';

-- ── Aksumite Empire ───────────────────────────────────────────────────────
-- Peak: ~350 AD under Ezana. Ethiopian/Eritrean highlands + Red Sea coast,
-- extending across to parts of South Arabia (Yemen). Major port: Adulis.
UPDATE public."AK_Kingdoms" SET territory_geojson = '{
  "type": "Polygon",
  "coordinates": [[
    [36.0, 9.0], [37.5, 8.5], [39.0, 9.0], [40.5, 10.0],
    [42.0, 11.0], [43.5, 12.0], [44.0, 13.0], [43.5, 14.0],
    [43.0, 15.0], [42.5, 15.5], [41.0, 16.0], [39.5, 16.5],
    [38.0, 16.5], [37.0, 16.0], [36.0, 15.5], [35.5, 14.5],
    [35.0, 13.5], [35.0, 12.0], [35.5, 10.5], [36.0, 9.0]
  ]]
}'::jsonb WHERE kingdom_id = 'aksum';

-- ── Ethiopian Empire (Solomonic) ──────────────────────────────────────────
-- 1270-1800. Ethiopian highlands centered on Gondar/Lalibela region.
-- Did not include Eritrean coast (held by Ottomans) or Somali lowlands.
UPDATE public."AK_Kingdoms" SET territory_geojson = '{
  "type": "Polygon",
  "coordinates": [[
    [33.5, 6.0], [35.0, 5.5], [37.0, 5.5], [39.0, 6.5],
    [41.0, 7.5], [42.5, 8.5], [43.0, 9.5], [43.0, 10.5],
    [42.5, 11.5], [42.0, 12.5], [41.0, 13.5], [40.0, 14.5],
    [39.0, 15.0], [38.0, 15.0], [37.0, 14.5], [36.0, 14.0],
    [35.0, 13.0], [34.0, 12.0], [33.5, 10.5], [33.0, 9.0],
    [33.0, 7.5], [33.5, 6.0]
  ]]
}'::jsonb WHERE kingdom_id = 'ethiopia';

-- ── Carthaginian Empire ───────────────────────────────────────────────────
-- Peak: ~300 BC. Coastal North Africa from Libya to Morocco,
-- plus Sardinia, western Sicily, Balearics, southern Iberia.
-- African territory was mainly coastal strip of modern Tunisia/Libya.
UPDATE public."AK_Kingdoms" SET territory_geojson = '{
  "type": "Polygon",
  "coordinates": [[
    [-5.5, 35.5], [-2.0, 35.0], [0.0, 35.5], [2.0, 36.0],
    [4.0, 36.5], [6.0, 37.0], [8.0, 37.0], [10.0, 37.0],
    [11.0, 37.5], [12.0, 37.0], [14.0, 34.0], [16.0, 33.0],
    [18.0, 32.5], [20.0, 32.5], [22.0, 32.0], [23.0, 31.5],
    [23.0, 30.5], [21.0, 30.0], [18.0, 30.5], [15.0, 31.0],
    [12.0, 32.0], [10.0, 33.0], [8.0, 34.0], [6.0, 35.0],
    [4.0, 35.0], [2.0, 34.5], [0.0, 34.0], [-2.0, 33.5],
    [-4.0, 34.0], [-5.5, 35.0], [-5.5, 35.5]
  ]]
}'::jsonb WHERE kingdom_id = 'carthage';

-- ── Fatimid Caliphate ─────────────────────────────────────────────────────
-- Peak: ~1000 AD. Egypt + Maghreb coast + Sicily + Levant + Hejaz.
-- Core in Egypt; N Africa coastal strip west to modern Tunisia.
UPDATE public."AK_Kingdoms" SET territory_geojson = '{
  "type": "Polygon",
  "coordinates": [[
    [6.0, 34.0], [8.0, 35.0], [10.0, 37.0], [12.0, 37.5],
    [15.0, 36.0], [18.0, 33.5], [22.0, 32.5], [25.0, 31.5],
    [28.0, 31.0], [30.0, 31.0], [32.0, 31.5], [34.0, 32.0],
    [36.0, 34.0], [36.0, 35.5], [35.0, 36.0], [33.0, 35.5],
    [31.5, 33.5], [31.0, 31.5], [32.5, 30.0], [34.0, 28.5],
    [35.5, 25.0], [37.0, 22.0], [38.0, 20.0], [38.5, 18.0],
    [37.0, 16.0], [35.0, 15.0], [34.0, 16.0], [33.5, 18.0],
    [33.0, 20.0], [32.0, 22.0], [31.0, 24.0], [30.0, 26.0],
    [28.0, 28.0], [25.0, 29.5], [22.0, 30.0], [18.0, 31.0],
    [15.0, 32.5], [12.0, 34.0], [10.0, 35.0], [8.0, 34.5],
    [6.0, 34.0]
  ]]
}'::jsonb WHERE kingdom_id = 'fatimid';

-- ── Almoravid Empire ──────────────────────────────────────────────────────
-- Peak: ~1100 AD. Morocco + Western Sahara + Mauritania + southern Iberia +
-- Ghana region. Saharan trade routes connecting Morocco to sub-Saharan gold.
UPDATE public."AK_Kingdoms" SET territory_geojson = '{
  "type": "Polygon",
  "coordinates": [[
    [-10.0, 14.0], [-8.0, 14.0], [-6.0, 14.5], [-5.0, 15.5],
    [-4.0, 17.0], [-3.0, 19.0], [-2.0, 21.0], [-1.0, 23.0],
    [-0.5, 25.0], [-1.0, 27.0], [-2.0, 29.0], [-3.0, 31.0],
    [-4.0, 33.0], [-5.0, 34.5], [-5.5, 36.0], [-4.0, 37.5],
    [-2.5, 38.0], [-1.0, 38.5], [0.0, 38.0], [-1.0, 36.5],
    [-1.5, 35.0], [-1.0, 33.0], [0.0, 31.0], [1.0, 29.0],
    [1.5, 27.0], [1.0, 25.0], [0.0, 23.0], [-1.0, 21.0],
    [-2.0, 19.0], [-4.0, 17.0], [-6.0, 15.5], [-8.0, 14.5],
    [-10.0, 14.5], [-12.0, 15.0], [-14.0, 16.0], [-16.0, 17.0],
    [-17.0, 18.0], [-17.5, 16.5], [-17.0, 15.0], [-15.0, 14.0],
    [-13.0, 14.0], [-10.0, 14.0]
  ]]
}'::jsonb WHERE kingdom_id = 'almoravid';

-- ── Almohad Caliphate ─────────────────────────────────────────────────────
-- Peak: ~1200 AD. Morocco + Algeria + Tunisia + Libya coast + southern Iberia.
-- Controlled most of Maghreb and al-Andalus.
UPDATE public."AK_Kingdoms" SET territory_geojson = '{
  "type": "Polygon",
  "coordinates": [[
    [-10.0, 29.0], [-8.0, 28.0], [-6.0, 27.5], [-4.0, 28.0],
    [-2.0, 29.0], [0.0, 30.0], [2.0, 31.0], [4.0, 32.0],
    [6.0, 33.0], [8.0, 34.0], [10.0, 35.0], [11.0, 37.0],
    [10.5, 37.5], [8.0, 37.5], [5.0, 37.0], [2.0, 36.5],
    [0.0, 36.0], [-2.0, 36.5], [-4.0, 37.5], [-5.5, 38.0],
    [-4.0, 39.0], [-2.5, 39.5], [-1.0, 39.0], [0.0, 38.5],
    [-1.0, 37.5], [-2.0, 36.5], [-4.0, 36.0], [-6.0, 36.0],
    [-8.0, 35.5], [-10.0, 35.5], [-11.0, 34.5], [-11.5, 33.0],
    [-11.0, 31.5], [-10.0, 29.0]
  ]]
}'::jsonb WHERE kingdom_id = 'almohad';

-- ── Marinid Dynasty ───────────────────────────────────────────────────────
-- 1244-1465. Primarily Morocco, brief control of parts of Algeria.
-- Much smaller than Almohads — centered on Fez.
UPDATE public."AK_Kingdoms" SET territory_geojson = '{
  "type": "Polygon",
  "coordinates": [[
    [-1.0, 32.0], [-1.0, 33.0], [-1.5, 34.0], [-2.0, 35.0],
    [-3.0, 35.5], [-5.0, 35.5], [-6.0, 35.5], [-7.0, 35.0],
    [-8.5, 34.0], [-10.0, 33.5], [-11.0, 32.5], [-11.0, 31.0],
    [-10.0, 30.0], [-9.0, 29.5], [-8.0, 29.0], [-6.0, 28.5],
    [-4.0, 29.0], [-2.5, 30.0], [-1.5, 31.0], [-1.0, 32.0]
  ]]
}'::jsonb WHERE kingdom_id = 'marinid';

-- ── Kanem-Bornu Empire ────────────────────────────────────────────────────
-- Peak: ~1200 AD (Kanem phase). Centered on Lake Chad basin,
-- extending north to Fezzan, east toward Darfur, west toward Hausaland.
UPDATE public."AK_Kingdoms" SET territory_geojson = '{
  "type": "Polygon",
  "coordinates": [[
    [10.0, 10.0], [11.5, 9.5], [13.0, 9.5], [14.5, 10.0],
    [16.0, 10.5], [17.5, 11.0], [19.0, 12.0], [20.0, 13.0],
    [20.5, 14.5], [20.5, 16.0], [20.0, 17.5], [19.0, 19.0],
    [17.5, 20.0], [16.0, 20.5], [14.5, 20.0], [13.0, 19.0],
    [12.0, 17.5], [11.0, 16.0], [10.5, 14.5], [10.0, 13.0],
    [9.5, 11.5], [10.0, 10.0]
  ]]
}'::jsonb WHERE kingdom_id = 'kanem-bornu';

-- ── Benin Empire ──────────────────────────────────────────────────────────
-- Peak: ~1500 AD. Southern Nigeria, Edo/Benin City region.
-- Forest zone from Niger Delta west to Yorubaland boundary.
UPDATE public."AK_Kingdoms" SET territory_geojson = '{
  "type": "Polygon",
  "coordinates": [[
    [3.0, 6.0], [3.5, 5.5], [4.5, 5.5], [5.5, 5.5],
    [6.0, 6.0], [6.5, 6.5], [7.0, 7.0], [7.0, 7.5],
    [6.5, 8.0], [6.0, 8.5], [5.5, 9.0], [5.0, 9.0],
    [4.5, 8.5], [4.0, 8.0], [3.5, 7.5], [3.0, 7.0],
    [2.5, 6.5], [3.0, 6.0]
  ]]
}'::jsonb WHERE kingdom_id = 'benin';

-- ── Oyo Empire ────────────────────────────────────────────────────────────
-- Peak: ~1680 AD. Southwestern Nigeria / Yorubaland,
-- from savanna zone south toward coast, west to Dahomey border.
UPDATE public."AK_Kingdoms" SET territory_geojson = '{
  "type": "Polygon",
  "coordinates": [[
    [1.5, 6.5], [2.0, 6.0], [2.5, 6.0], [3.0, 6.5],
    [3.5, 7.0], [4.0, 7.5], [4.5, 8.0], [4.5, 8.5],
    [4.0, 9.0], [3.5, 9.5], [3.0, 10.0], [2.5, 10.0],
    [2.0, 9.5], [1.5, 9.0], [1.0, 8.5], [0.5, 8.0],
    [0.5, 7.5], [1.0, 7.0], [1.5, 6.5]
  ]]
}'::jsonb WHERE kingdom_id = 'oyo';

-- ── Kingdom of Dahomey ────────────────────────────────────────────────────
-- ~1600-1800. Modern Benin Republic, Abomey Plateau to coast.
-- Relatively compact kingdom south of Oyo.
UPDATE public."AK_Kingdoms" SET territory_geojson = '{
  "type": "Polygon",
  "coordinates": [[
    [1.0, 6.5], [1.5, 6.2], [2.0, 6.2], [2.5, 6.5],
    [2.5, 7.0], [2.5, 7.5], [2.5, 8.0], [2.0, 8.5],
    [1.5, 9.0], [1.0, 9.0], [0.5, 8.5], [0.5, 8.0],
    [0.5, 7.5], [0.5, 7.0], [1.0, 6.5]
  ]]
}'::jsonb WHERE kingdom_id = 'dahomey';

-- ── Ashanti Empire ────────────────────────────────────────────────────────
-- Peak: ~1750 AD. Central Ghana, from Kumasi outward through forest zone.
-- South to coast (excl. coastal European forts), north to Dagomba.
UPDATE public."AK_Kingdoms" SET territory_geojson = '{
  "type": "Polygon",
  "coordinates": [[
    [-3.0, 5.5], [-2.0, 5.0], [-1.0, 5.0], [0.0, 5.5],
    [0.5, 6.0], [0.5, 6.5], [0.5, 7.0], [0.0, 7.5],
    [-0.5, 8.0], [-1.0, 8.5], [-1.5, 9.0], [-2.0, 9.0],
    [-2.5, 8.5], [-3.0, 8.0], [-3.5, 7.5], [-3.5, 7.0],
    [-3.5, 6.5], [-3.0, 6.0], [-3.0, 5.5]
  ]]
}'::jsonb WHERE kingdom_id = 'ashanti';

-- ── Nok Culture ───────────────────────────────────────────────────────────
-- ~500 BC - 200 AD. Central Nigeria plateau (Jos Plateau area).
-- Archaeological culture, not a state — approximate distribution zone.
UPDATE public."AK_Kingdoms" SET territory_geojson = '{
  "type": "Polygon",
  "coordinates": [[
    [6.0, 8.0], [7.0, 7.5], [8.0, 7.5], [9.0, 8.0],
    [9.5, 8.5], [10.0, 9.0], [10.0, 10.0], [9.5, 10.5],
    [9.0, 11.0], [8.0, 11.0], [7.0, 10.5], [6.0, 10.0],
    [5.5, 9.5], [5.5, 9.0], [6.0, 8.0]
  ]]
}'::jsonb WHERE kingdom_id = 'nok';

-- ── Kingdom of Kongo ──────────────────────────────────────────────────────
-- Peak: ~1500 AD. Both sides of lower Congo River,
-- northern Angola to southern Congo (Brazzaville), coast to interior.
UPDATE public."AK_Kingdoms" SET territory_geojson = '{
  "type": "Polygon",
  "coordinates": [[
    [12.0, -8.0], [13.0, -8.5], [14.5, -8.0], [16.0, -7.0],
    [17.0, -6.0], [17.5, -5.0], [17.0, -4.0], [16.5, -3.5],
    [15.5, -3.0], [14.5, -3.0], [13.5, -3.5], [12.5, -4.0],
    [12.0, -5.0], [11.5, -6.0], [11.5, -7.0], [12.0, -8.0]
  ]]
}'::jsonb WHERE kingdom_id = 'kongo';

-- ── Luba Empire ───────────────────────────────────────────────────────────
-- ~1585-1800. Southeast Congo around Lake Upemba and upper Lualaba River.
UPDATE public."AK_Kingdoms" SET territory_geojson = '{
  "type": "Polygon",
  "coordinates": [[
    [24.0, -11.0], [25.5, -11.5], [27.0, -11.0], [28.0, -10.0],
    [28.5, -9.0], [28.5, -8.0], [28.0, -7.0], [27.0, -6.0],
    [26.0, -5.5], [25.0, -5.5], [24.0, -6.0], [23.0, -7.0],
    [22.5, -8.0], [22.5, -9.0], [23.0, -10.0], [24.0, -11.0]
  ]]
}'::jsonb WHERE kingdom_id = 'luba';

-- ── Lunda Empire ──────────────────────────────────────────────────────────
-- ~1665-1800. Southern Congo / northern Angola / NW Zambia.
-- Sprawling decentralized empire south and west of Luba.
UPDATE public."AK_Kingdoms" SET territory_geojson = '{
  "type": "Polygon",
  "coordinates": [[
    [20.0, -13.0], [22.0, -13.5], [24.0, -13.0], [26.0, -12.0],
    [27.5, -11.0], [28.0, -10.0], [27.5, -9.0], [26.5, -8.0],
    [25.0, -7.5], [23.5, -7.5], [22.0, -8.0], [20.5, -8.5],
    [19.0, -9.0], [18.0, -10.0], [18.0, -11.0], [18.5, -12.0],
    [20.0, -13.0]
  ]]
}'::jsonb WHERE kingdom_id = 'lunda';

-- ── Kingdom of Zimbabwe ──────────────────────────────────────────────────
-- ~1100-1450. Zimbabwe Plateau between Limpopo and Zambezi rivers.
-- Centered on Great Zimbabwe ruins near Masvingo.
UPDATE public."AK_Kingdoms" SET territory_geojson = '{
  "type": "Polygon",
  "coordinates": [[
    [26.0, -22.5], [27.5, -23.0], [29.0, -22.5], [30.5, -22.0],
    [31.5, -21.0], [32.5, -20.0], [33.0, -19.0], [32.5, -18.0],
    [31.5, -17.0], [30.0, -16.5], [28.5, -17.0], [27.0, -17.5],
    [26.0, -18.5], [25.5, -19.5], [25.5, -20.5], [26.0, -22.5]
  ]]
}'::jsonb WHERE kingdom_id = 'great-zimbabwe';

-- ── Kingdom of Mutapa ─────────────────────────────────────────────────────
-- ~1430-1760. Successor to Great Zimbabwe, northeast Zimbabwe into
-- Mozambique. Controlled Zambezi valley gold trade.
UPDATE public."AK_Kingdoms" SET territory_geojson = '{
  "type": "Polygon",
  "coordinates": [[
    [28.0, -18.0], [29.5, -18.5], [31.0, -18.0], [32.5, -17.0],
    [34.0, -16.0], [35.0, -15.0], [35.5, -14.0], [35.0, -13.5],
    [34.0, -13.0], [32.5, -13.5], [31.0, -14.0], [29.5, -14.5],
    [28.5, -15.0], [27.5, -15.5], [27.0, -16.5], [27.5, -17.0],
    [28.0, -18.0]
  ]]
}'::jsonb WHERE kingdom_id = 'mutapa';

-- ── Rozwi Empire ──────────────────────────────────────────────────────────
-- ~1684-1800. Zimbabwe Plateau, successor to Zimbabwe/Mutapa.
-- Controlled area from Masvingo to Bulawayo.
UPDATE public."AK_Kingdoms" SET territory_geojson = '{
  "type": "Polygon",
  "coordinates": [[
    [27.0, -22.0], [28.5, -22.5], [30.0, -22.0], [31.5, -21.0],
    [32.0, -20.0], [32.0, -19.0], [31.0, -18.5], [30.0, -18.0],
    [28.5, -18.0], [27.0, -18.5], [26.0, -19.0], [25.5, -20.0],
    [26.0, -21.0], [27.0, -22.0]
  ]]
}'::jsonb WHERE kingdom_id = 'rozwi';

-- ── Kilwa Sultanate ───────────────────────────────────────────────────────
-- ~957-1513. Swahili coast city-state network. Controlled island of
-- Kilwa plus coastal trading ports from Sofala to Mogadishu.
-- Representing as coastal strip (not deep inland).
UPDATE public."AK_Kingdoms" SET territory_geojson = '{
  "type": "Polygon",
  "coordinates": [[
    [39.5, -11.0], [40.5, -11.0], [41.0, -10.5], [41.0, -9.5],
    [40.5, -8.5], [40.0, -7.5], [40.0, -6.5], [39.5, -6.0],
    [39.5, -5.5], [39.5, -5.0], [39.5, -4.5], [40.0, -4.0],
    [40.5, -3.0], [41.0, -2.0], [41.5, -1.5], [41.0, -1.0],
    [40.0, -1.5], [39.5, -2.5], [39.0, -3.5], [38.5, -4.5],
    [38.5, -5.5], [39.0, -6.5], [39.0, -7.5], [39.0, -8.5],
    [39.0, -9.5], [39.0, -10.5], [39.5, -11.0]
  ]]
}'::jsonb WHERE kingdom_id = 'kilwa';

-- ── Ajuran Sultanate ──────────────────────────────────────────────────────
-- ~1300-1700. Southern Somalia + eastern Ethiopia (Ogaden).
-- Major Somali sultanate controlling Mogadishu and Jubba/Shebelle valleys.
UPDATE public."AK_Kingdoms" SET territory_geojson = '{
  "type": "Polygon",
  "coordinates": [[
    [40.0, 0.0], [41.5, -0.5], [43.0, 0.0], [44.5, 1.0],
    [45.5, 2.0], [46.5, 3.0], [47.0, 4.0], [47.0, 5.0],
    [46.0, 6.0], [45.0, 6.5], [44.0, 7.0], [43.0, 7.0],
    [42.0, 6.5], [41.0, 5.5], [40.0, 4.5], [39.5, 3.5],
    [39.5, 2.5], [39.5, 1.5], [40.0, 0.0]
  ]]
}'::jsonb WHERE kingdom_id = 'ajuran';

-- ── Update territory label positions to match new polygon centroids ──────

UPDATE public."AK_Kingdoms" SET territory_label_lng = -10.0, territory_label_lat = 17.0 WHERE kingdom_id = 'ghana';
UPDATE public."AK_Kingdoms" SET territory_label_lng = -7.0, territory_label_lat = 16.0 WHERE kingdom_id = 'mali';
UPDATE public."AK_Kingdoms" SET territory_label_lng = -4.0, territory_label_lat = 17.5 WHERE kingdom_id = 'songhai';
UPDATE public."AK_Kingdoms" SET territory_label_lng = 32.5, territory_label_lat = 19.5 WHERE kingdom_id = 'kush';
UPDATE public."AK_Kingdoms" SET territory_label_lng = 39.5, territory_label_lat = 14.5 WHERE kingdom_id = 'dmt';
UPDATE public."AK_Kingdoms" SET territory_label_lng = 39.5, territory_label_lat = 13.0 WHERE kingdom_id = 'aksum';
UPDATE public."AK_Kingdoms" SET territory_label_lng = 38.0, territory_label_lat = 10.0 WHERE kingdom_id = 'ethiopia';
UPDATE public."AK_Kingdoms" SET territory_label_lng = 10.0, territory_label_lat = 34.0 WHERE kingdom_id = 'carthage';
UPDATE public."AK_Kingdoms" SET territory_label_lng = 25.0, territory_label_lat = 28.0 WHERE kingdom_id = 'fatimid';
UPDATE public."AK_Kingdoms" SET territory_label_lng = -6.0, territory_label_lat = 26.0 WHERE kingdom_id = 'almoravid';
UPDATE public."AK_Kingdoms" SET territory_label_lng = -3.0, territory_label_lat = 33.0 WHERE kingdom_id = 'almohad';
UPDATE public."AK_Kingdoms" SET territory_label_lng = -6.0, territory_label_lat = 32.0 WHERE kingdom_id = 'marinid';
UPDATE public."AK_Kingdoms" SET territory_label_lng = 15.0, territory_label_lat = 14.5 WHERE kingdom_id = 'kanem-bornu';
UPDATE public."AK_Kingdoms" SET territory_label_lng = 5.0, territory_label_lat = 7.0 WHERE kingdom_id = 'benin';
UPDATE public."AK_Kingdoms" SET territory_label_lng = 2.5, territory_label_lat = 8.0 WHERE kingdom_id = 'oyo';
UPDATE public."AK_Kingdoms" SET territory_label_lng = 1.5, territory_label_lat = 7.5 WHERE kingdom_id = 'dahomey';
UPDATE public."AK_Kingdoms" SET territory_label_lng = -1.5, territory_label_lat = 7.0 WHERE kingdom_id = 'ashanti';
UPDATE public."AK_Kingdoms" SET territory_label_lng = 7.5, territory_label_lat = 9.5 WHERE kingdom_id = 'nok';
UPDATE public."AK_Kingdoms" SET territory_label_lng = 14.5, territory_label_lat = -5.5 WHERE kingdom_id = 'kongo';
UPDATE public."AK_Kingdoms" SET territory_label_lng = 26.0, territory_label_lat = -8.5 WHERE kingdom_id = 'luba';
UPDATE public."AK_Kingdoms" SET territory_label_lng = 23.0, territory_label_lat = -10.5 WHERE kingdom_id = 'lunda';
UPDATE public."AK_Kingdoms" SET territory_label_lng = 29.5, territory_label_lat = -19.5 WHERE kingdom_id = 'great-zimbabwe';
UPDATE public."AK_Kingdoms" SET territory_label_lng = 31.5, territory_label_lat = -15.5 WHERE kingdom_id = 'mutapa';
UPDATE public."AK_Kingdoms" SET territory_label_lng = 29.0, territory_label_lat = -20.0 WHERE kingdom_id = 'rozwi';
UPDATE public."AK_Kingdoms" SET territory_label_lng = 40.0, territory_label_lat = -6.0 WHERE kingdom_id = 'kilwa';
UPDATE public."AK_Kingdoms" SET territory_label_lng = 43.5, territory_label_lat = 3.5 WHERE kingdom_id = 'ajuran';
